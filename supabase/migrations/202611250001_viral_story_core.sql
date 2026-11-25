create extension if not exists pgcrypto;

create type app_role as enum ('owner','admin','editor','producer','analyst');
create type story_status as enum ('discovered','shortlisted','researching','draft','fact-check','ready-for-production','producing','needs-review','approved','scheduled','published','rejected','failed','archived');
create type ingestion_status as enum ('received','deduplicated','ignored','failed','processed');
create type verification_state as enum ('verified','needs-verification','disputed','unsupported');
create type job_status as enum ('queued','running','succeeded','failed','cancelled');
create type video_status as enum ('draft','review','approved','scheduled','published','rejected','archived');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role app_role not null default 'analyst',
  display_name text not null,
  invited_email text unique,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invited_email_format check (invited_email is null or invited_email ~* '^.+@.+\..+$')
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_sw text not null,
  created_at timestamptz not null default now(),
  constraint category_slug_format check (slug ~ '^[a-z0-9-]+$')
);

create table trend_sources (
  id uuid primary key default gen_random_uuid(),
  url text unique not null,
  publisher text not null,
  terms_url text,
  allowed boolean not null default false,
  default_category_id uuid references categories(id),
  rpm_limit integer not null default 20,
  last_fetched_at timestamptz,
  created_at timestamptz not null default now(),
  constraint source_rpm_positive check (rpm_limit > 0)
);

create table trend_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references trend_sources(id) on delete set null,
  source_url text not null,
  normalized_url text not null,
  publisher text not null,
  published_at timestamptz,
  detected_at timestamptz not null default now(),
  title text not null,
  summary text,
  language text,
  category_id uuid references categories(id),
  ingestion_status ingestion_status not null default 'received',
  status story_status not null default 'discovered',
  duplicate_of uuid references trend_items(id),
  similarity_score numeric(5,4) check (similarity_score is null or (similarity_score >= 0 and similarity_score <= 1)),
  trend_score numeric(6,3) check (trend_score is null or (trend_score >= 0 and trend_score <= 100)),
  score_breakdown jsonb not null default '{}'::jsonb,
  engagement_signals jsonb not null default '{}'::jsonb,
  geog_language_fit jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(normalized_url)
);

create table stories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category_id uuid not null references categories(id),
  title_en text not null,
  title_sw text,
  synopsis_en text,
  synopsis_sw text,
  status story_status not null default 'draft',
  owner_id uuid references profiles(id),
  trend_item_id uuid references trend_items(id),
  human_approved_at timestamptz,
  human_approved_by uuid references profiles(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint story_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint publish_requires_approval check (status <> 'published' or (human_approved_at is not null and human_approved_by is not null))
);

create table story_versions (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  version integer not null,
  content jsonb not null,
  prompt_version text,
  model text,
  provider text,
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  estimated_cost_usd numeric(12,6) check (estimated_cost_usd is null or estimated_cost_usd >= 0),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  unique(story_id, version)
);

create table story_sources (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  url text not null,
  publisher text,
  title text,
  published_at timestamptz,
  retrieved_at timestamptz not null default now(),
  rights_note text,
  unique(story_id, url)
);

create table claims (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  claim text not null,
  language text not null default 'en',
  verification_state verification_state not null default 'needs-verification',
  source_ids uuid[] not null default '{}',
  evidence_notes text,
  checked_by uuid references profiles(id),
  checked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint claim_language_format check (language in ('en','sw'))
);

create table scenes (
  id uuid primary_key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  story_version_id uuid references story_versions(id) on delete set null,
  position integer not null check (position >= 0),
  start_seconds numeric(8,3) not null check (start_seconds >= 0),
  end_seconds numeric(8,3) not null check (end_seconds > start_seconds),
  narration_en text,
  narration_sw text,
  on_screen_text text,
  asset_note text,
  created_at timestamptz not null default now(),
  unique(story_id, story_version_id, position)
);

create table media_assets (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references stories(id) on delete set null,
  name text not null,
  kind text not null,
  storage_path text,
  source_url text,
  rights_status text not null default 'needs-review',
  rights_owner text,
  license text,
  cost_cents integer check (cost_cents is null or cost_cents >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  constraint media_kind_allowed check (kind in ('poster','audio','video','caption','image','font'))
);

create table production_jobs (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id),
  video_id uuid,
  type text not null,
  status job_status not null default 'queued',
  progress integer not null default 0 check (progress between 0 and 100),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  error text,
  provider_job_id text,
  cost_cents integer check (cost_cents is null or cost_cents >= 0),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table videos (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  status video_status not null default 'draft',
  storage_path text,
  poster_path text,
  caption_path text,
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  approved_at timestamptz,
  approved_by uuid references profiles(id),
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint video_publish_requires_approval check (status <> 'published' or (approved_at is not null and approved_by is not null))
);

alter table production_jobs add constraint production_job_video_fk foreign key (video_id) references videos(id) on delete set null;

create table video_metrics (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references videos(id) on delete cascade,
  metric_date date not null,
  views bigint not null default 0 check (views >= 0),
  completion bigint not null default 0 check (completion >= 0),
  shares bigint not null default 0 check (shares >= 0),
  unique(video_id, metric_date)
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table trend_fetch_logs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references trend_sources(id),
  fetched_at timestamptz not null default now(),
  http_status integer,
  item_count integer not null default 0,
  retry_count integer not null default 0,
  error text
);

create index stories_status_idx on stories(status);
create index stories_category_idx on stories(category_id);
create index stories_owner_idx on stories(owner_id);
create index trend_items_status_idx on trend_items(status);
create index trend_items_category_idx on trend_items(category_id);
create index trend_items_detected_idx on trend_items(detected_at desc);
create index claims_story_idx on claims(story_id);
create index scenes_story_idx on scenes(story_id);
create index jobs_status_idx on production_jobs(status);
create index videos_status_idx on videos(status);
create index video_metrics_video_date_idx on video_metrics(video_id, metric_date desc);
create index audit_actor_idx on audit_logs(actor_id);
