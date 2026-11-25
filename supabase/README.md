# Supabase migration and rollback notes

## Apply

1. Create or select the Supabase project.
2. In Supabase Dashboard, open **SQL Editor**.
3. Apply migrations in filename order:
   - `202611250001_viral_story_core.sql`
   - `202611250002_viral_story_rls.sql`
   - `202611250003_demo_seed.sql`
4. Verify all types, tables and policies in the Table Editor.
5. Create the first admin by inviting the user through Supabase Auth, then insert a matching `profiles` row with `is_active=true` and `role='owner'`.

Example profile insertion (run as a database admin only):

```sql
insert into public.profiles (id, role, display_name, invited_email, is_active)
select id, 'owner', 'Primary owner', email, true
from auth.users
where email = 'OWNER_EMAIL@example.com'
on conflict (id) do update set role='owner', is_active=true;
```

## RLS verification

Test anonymously:

```sql
select * from public.stories;
select * from public.claims;
select * from public.videos;
```

A public anonymous client should receive no private rows and should receive only published, approved stories/videos. Direct SQL runs as a database administrator are not valid authorization tests; use Supabase anon and authenticated test JWTs.

## Rollback

Rollback is destructive. Do not run it in a production database until data is backed up.

```sql
-- Reverse application migrations only after backup and confirmation.
drop table if exists trend_fetch_logs;
drop table if exists audit_logs;
drop table if exists video_metrics;
drop table if exists production_jobs;
drop table if exists videos;
drop table if exists media_assets;
drop table if exists scenes;
drop table if exists claims;
drop table if exists story_sources;
drop table if exists story_versions;
drop table if exists stories;
drop table if exists trend_items;
drop table if exists trend_sources;
drop table if exists categories;
drop table if exists profiles;

drop type if exists app_role;
drop type if exists story_status;
drop type if exists ingestion_status;
drop type if exists verification_state;
drop type if exists job_status;
drop type if exists video_status;
```
