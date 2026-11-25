-- Canonical codebook statuses supplement legacy enum values to avoid destructive rewrites.
alter type story_status add value if not exists 'needs_verification';
alter type story_status add value if not exists 'script_approved';
alter type story_status add value if not exists 'needs_review';

alter table stories add column if not exists factuality_label text not null default 'verified report'
  check (factuality_label in ('verified report','developing story','opinion / commentary','dramatized reconstruction','fiction / AI story'));
alter table stories add column if not exists editorial_rejection_note text;
alter table stories add column if not exists script_version_hash text;
alter table videos add column if not exists approved_version_hash text;
alter table videos add column if not exists full_watch_with_sound boolean not null default false;
alter table videos add column if not exists qa_checklist jsonb not null default '{}'::jsonb;
alter table videos add column if not exists editorial_label text;

create table if not exists story_corrections (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  video_id uuid references videos(id) on delete set null,
  correction_type text not null check (correction_type in ('correction','clarification','takedown','retraction')),
  note text not null check (length(trim(note)) >= 5),
  public_note text,
  actor_id uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index if not exists story_corrections_story_created_idx on story_corrections(story_id,created_at desc);
alter table story_corrections enable row level security;
create policy story_corrections_admin_only on story_corrections for all using (is_admin_user()) with check (is_admin_user());

create or replace function invalidate_approved_video_on_story_change()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if old.status in ('published','archived') then
    raise exception 'Published/archived story content must use correction or takedown workflow.' using errcode='23514';
  end if;
  update videos set status='review',approved_at=null,approved_by=null,approved_version_hash=null,full_watch_with_sound=false
  where story_id=old.id and status in ('approved','scheduled');
  return new;
end;
$$;
create trigger invalidate_approved_video_on_story_edit
before update of title_en,title_sw,synopsis_en,synopsis_sw,script_version_hash on stories
for each row when (old.title_en is distinct from new.title_en or old.title_sw is distinct from new.title_sw or old.synopsis_en is distinct from new.synopsis_en or old.synopsis_sw is distinct from new.synopsis_sw or old.script_version_hash is distinct from new.script_version_hash)
execute function invalidate_approved_video_on_story_change();

create or replace function invalidate_approval_on_scene_change()
returns trigger language plpgsql security definer set search_path=public as $$
declare sid uuid;
begin
  sid := coalesce(new.story_id,old.story_id);
  update videos set status='review',approved_at=null,approved_by=null,approved_version_hash=null,full_watch_with_sound=false
  where story_id=sid and status in ('approved','scheduled');
  return coalesce(new,old);
end;
$$;
create trigger invalidate_approval_on_scene_edit
before insert or update or delete on scenes
for each row execute function invalidate_approval_on_scene_change();

create or replace function codebook_story_transition(p_story_id uuid,p_action text,p_readiness jsonb default '{}'::jsonb,p_rejection_note text default null)
returns stories language plpgsql security definer set search_path=public as $$
declare s stories; p profiles; target story_status;
begin
  select * into p from profiles where id=auth.uid() and is_active;
  if p.id is null then raise exception 'Active invited profile required' using errcode='42501'; end if;
  select * into s from stories where id=p_story_id for update;
  if s.id is null then raise exception 'Story not found' using errcode='P0002'; end if;

  if p_action='shortlist' and p.role in ('owner','admin','editor') and s.status='discovered' then target='shortlisted';
  elsif p_action='research' and p.role in ('owner','admin','editor') and s.status in ('shortlisted','needs_verification') then target='researching';
  elsif p_action='verify' and p.role in ('owner','admin','editor') and s.status in ('researching','needs_verification') then target='draft';
  elsif p_action='approve-script' and p.role in ('owner','admin','editor') and s.status='draft' then
    if not coalesce((p_readiness->>'evidenceComplete')::boolean,false) or not coalesce((p_readiness->>'factsVerified')::boolean,false) or not coalesce((p_readiness->>'scenesMatchTarget')::boolean,false) then raise exception 'Evidence, fact check and duration gates must pass.' using errcode='23514'; end if;
    target='script_approved';
  elsif p_action='produce' and p.role in ('owner','admin','producer') and s.status='script_approved' then target='producing';
  elsif p_action='submit-review' and p.role in ('owner','admin','producer') and s.status='producing' then target='needs_review';
  elsif p_action='reject' and p.role in ('owner','admin') and s.status='needs_review' and length(trim(coalesce(p_rejection_note,'')))>=5 then target='rejected';
  elsif p_action='archive' and p.role in ('owner','admin') and s.status not in ('published','archived') then target='archived';
  elsif p_action='restore' and p.role in ('owner','admin') and s.status='archived' then target='draft';
  elsif p_action='retry' and p.role in ('owner','admin','producer') and s.status='failed' then target='producing';
  else raise exception 'Transition not allowed for current role and status.' using errcode='42501';
  end if;
  update stories set status=target,editorial_rejection_note=case when p_action='reject' then p_rejection_note else editorial_rejection_note end,updated_at=now() where id=p_story_id returning * into s;
  insert into audit_logs(actor_id,action,entity_type,entity_id,after_data) values(auth.uid(),'story.transition','story',s.id,jsonb_build_object('action',p_action,'status',target,'rejection_note',p_rejection_note));
  return s;
end;
$$;
revoke all on function codebook_story_transition(uuid,text,jsonb,text) from public,anon;
grant execute on function codebook_story_transition(uuid,text,jsonb,text) to authenticated;

create or replace function record_video_review(p_video_id uuid,p_decision review_decision,p_version_hash text,p_checklist jsonb,p_notes text default null)
returns videos language plpgsql security definer set search_path=public as $$
declare v videos; actor profiles; required_keys text[] := array['scenes','sources','factCheck','rights','captions','thumbnail','renderValidation','safeZones','voiceSync','noBlackFrames','audioPeaks','duration','metadata','fullWatchWithSound']; key text;
begin
  select * into actor from profiles where id=auth.uid() and is_active and role in ('owner','admin');
  if actor.id is null then raise exception 'Authorized reviewer role required' using errcode='42501'; end if;
  select * into v from videos where id=p_video_id for update;
  if v.id is null or v.version_hash is distinct from p_version_hash then raise exception 'Video version changed; review is stale' using errcode='40001'; end if;
  foreach key in array required_keys loop
    if not coalesce((p_checklist->>key)::boolean,false) then raise exception 'Review checklist item % must pass', key using errcode='23514'; end if;
  end loop;
  if p_decision='rejected' and length(trim(coalesce(p_notes,'')))<5 then raise exception 'Rejection notes are required.' using errcode='22023'; end if;
  insert into video_reviews(video_id,reviewer_id,decision,version_hash,checklist,notes) values(p_video_id,auth.uid(),p_decision,p_version_hash,p_checklist,p_notes);
  if p_decision='approved' then
    update videos set status='approved',approved_at=now(),approved_by=auth.uid(),approved_version_hash=p_version_hash,qa_checklist=p_checklist,full_watch_with_sound=true where id=p_video_id returning * into v;
  else
    update videos set status='rejected',approved_at=null,approved_by=null,approved_version_hash=null,qa_checklist=p_checklist,full_watch_with_sound=false where id=p_video_id returning * into v;
  end if;
  return v;
end;
$$;
