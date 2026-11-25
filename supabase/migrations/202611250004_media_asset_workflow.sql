create type media_rights_status as enum ('unknown','pending-review','licensed','owned','disallowed');

alter table media_assets
  add column asset_type text not null default 'upload',
  add column provider text,
  add column prompt text,
  add column width integer check (width is null or width > 0),
  add column height integer check (height is null or height > 0),
  add column duration_seconds numeric(10,3) check (duration_seconds is null or duration_seconds >= 0),
  add column attribution text,
  add column creator text,
  add column rights_status_v2 media_rights_status not null default 'unknown';

update media_assets set rights_status_v2 = case
  when lower(rights_status) in ('licensed','cleared') then 'licensed'::media_rights_status
  when lower(rights_status) in ('owned','original') then 'owned'::media_rights_status
  when lower(rights_status) in ('disallowed','rejected') then 'disallowed'::media_rights_status
  when lower(rights_status) in ('pending','needs-review','needs rights') then 'pending-review'::media_rights_status
  else 'unknown'::media_rights_status end;

alter table media_assets add constraint asset_type_allowed check (asset_type in ('upload','generated-image','generated-video','licensed-stock','audio','caption'));
create index media_assets_story_rights_idx on media_assets(story_id, rights_status_v2);

create table scene_media_assets (
  scene_id uuid not null references scenes(id) on delete cascade,
  asset_id uuid not null references media_assets(id) on delete restrict,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  primary key (scene_id, asset_id)
);
create index scene_media_assets_asset_idx on scene_media_assets(asset_id);

alter table scene_media_assets enable row level security;
create policy scene_media_assets_private on scene_media_assets for all using (is_admin_user()) with check (is_admin_user());

-- Keep uploads private and quarantine them until an out-of-band malware scan passes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media-quarantine', 'media-quarantine', false, 104857600, array['image/jpeg','image/png','image/webp','video/mp4','audio/mpeg','audio/wav','audio/mp4','text/vtt'])
on conflict (id) do update set public=false, file_size_limit=104857600, allowed_mime_types=excluded.allowed_mime_types;

create policy media_quarantine_authenticated_insert on storage.objects
for insert to authenticated
with check (bucket_id = 'media-quarantine' and is_admin_user());

create or replace function assert_story_assets_rights(p_story_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if exists (
    select 1
    from scenes s
    join scene_media_assets sma on sma.scene_id = s.id
    join media_assets a on a.id = sma.asset_id
    where s.story_id = p_story_id
      and a.rights_status_v2 not in ('licensed','owned')
  ) then
    raise exception 'Production/publishing blocked: one or more scene assets have unknown, pending, or disallowed rights.' using errcode = '23514';
  end if;
end;
$$;

create or replace function guard_production_asset_rights()
returns trigger language plpgsql set search_path = public as $$
begin
  perform assert_story_assets_rights(new.story_id);
  return new;
end;
$$;

create trigger production_jobs_asset_rights_guard
before insert or update of status on production_jobs
for each row when (new.status in ('queued','running'))
execute function guard_production_asset_rights();

create or replace function guard_video_asset_rights()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.status in ('approved','scheduled','published') then
    perform assert_story_assets_rights(new.story_id);
  end if;
  return new;
end;
$$;

create trigger videos_asset_rights_guard
before insert or update of status on videos
for each row execute function guard_video_asset_rights();

create or replace function prevent_rights_downgrade_for_active_media()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.rights_status_v2 not in ('licensed','owned') and exists (
    select 1 from scene_media_assets sma join scenes s on s.id=sma.scene_id
    join production_jobs j on j.story_id=s.story_id and j.status in ('queued','running','succeeded')
    where sma.asset_id=old.id
  ) then
    raise exception 'Cannot mark an asset rights-uncleared while production is active or complete.' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger media_rights_downgrade_guard before update of rights_status_v2 on media_assets
for each row execute function prevent_rights_downgrade_for_active_media();
