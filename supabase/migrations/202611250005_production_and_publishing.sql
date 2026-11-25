create type production_stage as enum ('queued','validating','preparing-scenes','voice','captions','rendering','validating-output','uploading','completed','failed','cancelled');
create type review_decision as enum ('approved','rejected');

alter table production_jobs
  add column stage production_stage not null default 'queued',
  add column cancel_requested boolean not null default false,
  add column input_payload jsonb not null default '{}'::jsonb,
  add column estimated_cost_usd numeric(12,6) not null default 0 check (estimated_cost_usd >= 0),
  add column actual_cost_usd numeric(12,6) check (actual_cost_usd is null or actual_cost_usd >= 0),
  add column max_attempts integer not null default 3 check (max_attempts between 1 and 10),
  add column idempotency_key text,
  add column finished_at timestamptz;
create unique index production_jobs_idempotency_idx on production_jobs(idempotency_key) where idempotency_key is not null;

create table production_job_logs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references production_jobs(id) on delete cascade,
  level text not null check (level in ('info','warning','error')),
  stage production_stage not null,
  message text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index production_job_logs_job_created_idx on production_job_logs(job_id,created_at);

alter table videos
  add column language text not null default 'en' check (language in ('en','sw')),
  add column slug text,
  add column alternate_language_video_id uuid references videos(id) on delete set null,
  add column version_hash text,
  add column thumbnail_path text,
  add column codec text,
  add column render_metadata jsonb not null default '{}'::jsonb,
  add column captions_ready boolean not null default false,
  add column render_validated boolean not null default false,
  add column source_ledger_complete boolean not null default false,
  add column rights_cleared boolean not null default false,
  add column takedown_at timestamptz,
  add column takedown_reason text;
create unique index videos_slug_language_unique on videos(slug,language) where slug is not null;
create index videos_public_lookup_idx on videos(status,published_at desc) where status='published';

create table video_reviews (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references videos(id) on delete cascade,
  reviewer_id uuid not null references profiles(id),
  decision review_decision not null,
  version_hash text not null,
  checklist jsonb not null,
  notes text,
  created_at timestamptz not null default now()
);
create index video_reviews_video_created_idx on video_reviews(video_id,created_at desc);

create table publication_jobs (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references videos(id) on delete cascade,
  scheduled_at timestamptz not null,
  status job_status not null default 'queued',
  attempt_count integer not null default 0,
  last_error text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  published_at timestamptz
);
create index publication_jobs_due_idx on publication_jobs(scheduled_at) where status='queued';

alter table production_job_logs enable row level security;
alter table video_reviews enable row level security;
alter table publication_jobs enable row level security;
create policy production_logs_private on production_job_logs for select using (is_admin_user());
create policy review_records_private on video_reviews for select using (is_admin_user());
create policy publication_jobs_private on publication_jobs for select using (is_admin_user());

create or replace function claim_production_job()
returns setof production_jobs language plpgsql security definer set search_path=public as $$
declare claimed production_jobs;
begin
  select * into claimed from production_jobs
  where status='queued' and cancel_requested=false and attempt_count < max_attempts
  order by created_at for update skip locked limit 1;
  if claimed.id is null then return; end if;
  update production_jobs set status='running', stage='validating', attempt_count=attempt_count+1, started_at=coalesce(started_at,now())
    where id=claimed.id returning * into claimed;
  return next claimed;
end;
$$;

create or replace function claim_publication_job()
returns setof publication_jobs language plpgsql security definer set search_path=public as $$
declare claimed publication_jobs;
begin
  select * into claimed from publication_jobs
  where status='queued' and scheduled_at <= now()
  order by scheduled_at for update skip locked limit 1;
  if claimed.id is null then return; end if;
  update publication_jobs set status='running', attempt_count=attempt_count+1 where id=claimed.id returning * into claimed;
  return next claimed;
end;
$$;

create or replace function record_video_review(p_video_id uuid,p_decision review_decision,p_version_hash text,p_checklist jsonb,p_notes text default null)
returns videos language plpgsql security definer set search_path=public as $$
declare v videos; actor profiles;
begin
  select * into actor from profiles where id=auth.uid() and is_active and role in ('owner','admin');
  if actor.id is null then raise exception 'Reviewer role required' using errcode='42501'; end if;
  select * into v from videos where id=p_video_id for update;
  if v.id is null or v.version_hash is distinct from p_version_hash then raise exception 'Video version changed; review is stale' using errcode='40001'; end if;
  if not (coalesce((p_checklist->>'scenes')::boolean,false) and coalesce((p_checklist->>'sources')::boolean,false) and coalesce((p_checklist->>'factCheck')::boolean,false) and coalesce((p_checklist->>'rights')::boolean,false) and coalesce((p_checklist->>'captions')::boolean,false) and coalesce((p_checklist->>'thumbnail')::boolean,false) and coalesce((p_checklist->>'renderValidation')::boolean,false)) then
    raise exception 'All review checklist items must pass' using errcode='23514';
  end if;
  insert into video_reviews(video_id,reviewer_id,decision,version_hash,checklist,notes) values(p_video_id,auth.uid(),p_decision,p_version_hash,p_checklist,p_notes);
  if p_decision='approved' then
    update videos set status='approved',approved_at=now(),approved_by=auth.uid() where id=p_video_id returning * into v;
  else
    update videos set status='rejected',approved_at=null,approved_by=null where id=p_video_id returning * into v;
  end if;
  return v;
end;
$$;

create or replace function publish_video(p_video_id uuid)
returns videos language plpgsql security definer set search_path=public as $$
declare v videos; actor profiles; latest video_reviews;
begin
  select * into actor from profiles where id=auth.uid() and is_active and role in ('owner','admin');
  if actor.id is null then raise exception 'Publisher role required' using errcode='42501'; end if;
  select * into v from videos where id=p_video_id for update;
  select * into latest from video_reviews where video_id=p_video_id order by created_at desc limit 1;
  if v.id is null or v.status not in ('approved','scheduled') or v.approved_by is null or v.version_hash is distinct from latest.version_hash or latest.decision <> 'approved' then raise exception 'Only current, human-approved videos may be published' using errcode='23514'; end if;
  if not v.captions_ready or not v.render_validated or not v.rights_cleared or not v.source_ledger_complete or v.thumbnail_path is null then raise exception 'Publishing readiness checks failed' using errcode='23514'; end if;
  perform assert_story_assets_rights(v.story_id);
  update videos set status='published',published_at=now(),takedown_at=null,takedown_reason=null where id=p_video_id returning * into v;
  insert into audit_logs(actor_id,action,entity_type,entity_id,after_data) values(auth.uid(),'video.published','video',v.id,jsonb_build_object('slug',v.slug,'language',v.language,'version_hash',v.version_hash));
  return v;
end;
$$;

create or replace function unpublish_video(p_video_id uuid,p_reason text)
returns videos language plpgsql security definer set search_path=public as $$
declare v videos; actor profiles;
begin
  select * into actor from profiles where id=auth.uid() and is_active and role in ('owner','admin');
  if actor.id is null then raise exception 'Publisher role required' using errcode='42501'; end if;
  if length(trim(p_reason)) < 5 then raise exception 'Takedown reason is required' using errcode='22023'; end if;
  update videos set status='archived',takedown_at=now(),takedown_reason=p_reason where id=p_video_id and status='published' returning * into v;
  if v.id is null then raise exception 'Published video not found' using errcode='P0002'; end if;
  insert into audit_logs(actor_id,action,entity_type,entity_id,before_data,after_data) values(auth.uid(),'video.taken_down','video',v.id,jsonb_build_object('status','published'),jsonb_build_object('status','archived','reason',p_reason));
  return v;
end;
$$;

revoke all on function claim_production_job() from public,anon,authenticated;
revoke all on function claim_publication_job() from public,anon,authenticated;
grant execute on function claim_production_job() to service_role;
grant execute on function claim_publication_job() to service_role;
grant execute on function record_video_review(uuid,review_decision,text,jsonb,text) to authenticated;
grant execute on function publish_video(uuid) to authenticated;
grant execute on function unpublish_video(uuid,text) to authenticated;
