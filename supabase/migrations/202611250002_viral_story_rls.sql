alter table profiles enable row level security;
alter table categories enable row level security;
alter table trend_sources enable row level security;
alter table trend_items enable row level security;
alter table stories enable row level security;
alter table story_versions enable row level security;
alter table story_sources enable row level security;
alter table claims enable row level security;
alter table scenes enable row level security;
alter table media_assets enable row level security;
alter table production_jobs enable row level security;
alter table videos enable row level security;
alter table video_metrics enable row level security;
alter table audit_logs enable row level security;

create or replace function is_admin_user()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active and role in ('owner','admin','editor','producer','analyst')
  );
$$;

create or replace function is_privileged_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active and role in ('owner','admin','editor','producer')
  );
$$;

create or replace function is_owner_or_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active and role in ('owner','admin')
  );
$$;

create policy categories_public_read on categories for select using (true);
create policy categories_admin_write on categories for all using (is_owner_or_admin()) with check (is_owner_or_admin());

create policy public_published_videos on videos for select using (status = 'published' and approved_at is not null and approved_by is not null);
create policy public_published_stories on stories for select using (status = 'published' and human_approved_at is not null and human_approved_by is not null);
create policy video_metrics_private on video_metrics for select using (is_admin_user());

create policy private_trends on trend_items for all using (is_admin_user()) with check (is_admin_user());
create policy private_trend_sources on trend_sources for all using (is_admin_user()) with check (is_admin_user());
create policy private_story_versions on story_versions for all using (is_admin_user()) with check (is_admin_user());
create policy private_story_sources on story_sources for all using (is_admin_user()) with check (is_admin_user());
create policy private_claims on claims for all using (is_admin_user()) with check (is_admin_user());
create policy private_scenes on scenes for all using (is_admin_user()) with check (is_admin_user());
create policy private_media on media_assets for all using (is_admin_user()) with check (is_admin_user());
create policy private_jobs on production_jobs for all using (is_privileged_admin()) with check (is_privileged_admin());
create policy private_videos on videos for all using (is_admin_user()) with check (is_admin_user());
create policy private_stories on stories for all using (is_admin_user()) with check (is_admin_user());
create policy private_audit on audit_logs for select using (is_owner_or_admin());

create policy profile_self_read on profiles for select using (id = auth.uid() or is_owner_or_admin());
create policy profile_owner_admin_update on profiles for update using (is_owner_or_admin()) with check (is_owner_or_admin());
create policy profile_owner_admin_insert on profiles for insert with check (is_owner_or_admin());
