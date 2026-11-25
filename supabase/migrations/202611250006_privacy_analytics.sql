create type analytics_event_kind as enum ('impression','video_start','watch','completion','replay','like','share');

create table video_analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null unique,
  video_id uuid not null references videos(id) on delete cascade,
  event_kind analytics_event_kind not null,
  watch_ms integer not null default 0 check (watch_ms between 0 and 3600000),
  language text not null check (language in ('en','sw')),
  category_id uuid references categories(id) on delete set null,
  traffic_source text not null default 'direct' check (traffic_source in ('direct','search','social','referral','unknown')),
  created_at timestamptz not null default now(),
  event_day date generated always as ((created_at at time zone 'UTC')::date) stored
);
create index video_analytics_video_day_idx on video_analytics_events(video_id,event_day desc);
create index video_analytics_kind_day_idx on video_analytics_events(event_kind,event_day desc);
alter table video_analytics_events enable row level security;
revoke all on video_analytics_events from anon, authenticated;

-- Restricted event ingestion function only accepts published content and coarse, non-identifying fields.
create or replace function ingest_video_analytics_event(
  p_event_id uuid,p_video_id uuid,p_event_kind analytics_event_kind,p_watch_ms integer,
  p_language text,p_category_id uuid,p_traffic_source text
) returns boolean language plpgsql security definer set search_path=public as $$
declare inserted_count integer;
begin
  if p_watch_ms < 0 or p_watch_ms > 3600000 then raise exception 'Invalid watch duration' using errcode='22023'; end if;
  if p_language not in ('en','sw') then raise exception 'Invalid language' using errcode='22023'; end if;
  if p_traffic_source not in ('direct','search','social','referral','unknown') then raise exception 'Invalid source' using errcode='22023'; end if;
  if not exists (select 1 from videos where id=p_video_id and status='published' and approved_at is not null and approved_by is not null) then
    raise exception 'Published video not found' using errcode='P0002';
  end if;
  insert into video_analytics_events(event_id,video_id,event_kind,watch_ms,language,category_id,traffic_source)
  values(p_event_id,p_video_id,p_event_kind,p_watch_ms,p_language,p_category_id,p_traffic_source)
  on conflict(event_id) do nothing;
  get diagnostics inserted_count = row_count;
  return inserted_count = 1;
end;
$$;
revoke all on function ingest_video_analytics_event(uuid,uuid,analytics_event_kind,integer,text,uuid,text) from public;
grant execute on function ingest_video_analytics_event(uuid,uuid,analytics_event_kind,integer,text,uuid,text) to anon,authenticated;

create or replace function admin_video_analytics(p_from date default current_date-30,p_to date default current_date)
returns jsonb language plpgsql security definer set search_path=public as $$
declare result jsonb;
begin
  if not exists (select 1 from profiles where id=auth.uid() and is_active and role in ('owner','admin','analyst')) then
    raise exception 'Analytics role required' using errcode='42501';
  end if;
  select jsonb_build_object(
    'totals', jsonb_build_object(
      'impressions', count(*) filter (where e.event_kind='impression'),
      'starts', count(*) filter (where e.event_kind='video_start'),
      'watchMs', coalesce(sum(e.watch_ms),0),
      'completions', count(*) filter (where e.event_kind='completion'),
      'replays', count(*) filter (where e.event_kind='replay'),
      'shares', count(*) filter (where e.event_kind='share'),
      'likes', count(*) filter (where e.event_kind='like')
    ),
    'daily', coalesce((select jsonb_agg(d order by d.day) from (
      select e.event_day as day,count(*) filter(where e.event_kind='impression') as views,
        coalesce(sum(e.watch_ms) filter(where e.event_kind='watch'),0) as watch_ms,
        count(*) filter(where e.event_kind='completion') as completions
      from video_analytics_events e where e.event_day between p_from and p_to group by e.event_day
    ) d),'[]'::jsonb),
    'languages', coalesce((select jsonb_agg(l) from (select language,count(*) as events from video_analytics_events where event_day between p_from and p_to group by language) l),'[]'::jsonb),
    'categories', coalesce((select jsonb_agg(c) from (select c.name_en,c.name_sw,count(e.*) as events from video_analytics_events e join categories c on c.id=e.category_id where e.event_day between p_from and p_to group by c.id) c),'[]'::jsonb),
    'topVideos', coalesce((select jsonb_agg(v) from (select v.id,v.slug,v.language,s.title_en,count(*) filter(where e.event_kind='impression') as views,coalesce(sum(e.watch_ms) filter(where e.event_kind='watch'),0) as watch_ms,count(*) filter(where e.event_kind='completion') as completions from videos v join stories s on s.id=v.story_id join video_analytics_events e on e.video_id=v.id where v.status='published' and e.event_day between p_from and p_to group by v.id,s.title_en order by views desc limit 10) v),'[]'::jsonb),
    'costs', coalesce((select jsonb_agg(c) from (select v.id,v.slug,coalesce(sum(j.actual_cost_usd),0) as cost_usd,coalesce(count(e.*) filter(where e.event_kind='impression'),0) as views,case when count(e.*) filter(where e.event_kind='impression') > 0 then coalesce(sum(j.actual_cost_usd),0)*1000/(count(e.*) filter(where e.event_kind='impression')) else null end as cost_per_1000_views_usd from videos v left join production_jobs j on j.video_id=v.id left join video_analytics_events e on e.video_id=v.id and e.event_day between p_from and p_to where v.status='published' group by v.id order by cost_usd desc limit 20) c),'[]'::jsonb)
  ) into result;
  return result;
end;
$$;
revoke all on function admin_video_analytics(date,date) from public,anon;
grant execute on function admin_video_analytics(date,date) to authenticated;

alter table videos add column sponsorship_label text,
  add column sponsorship_partner text,
  add column sponsorship_disclosure text,
  add column ad_placement_notes text;
comment on table video_analytics_events is 'Pseudonymous aggregate event rows only; no IP, user agent, full referrer URL or user identifier. Retention and deletion runbook in docs/PRIVACY_ANALYTICS.md.';
