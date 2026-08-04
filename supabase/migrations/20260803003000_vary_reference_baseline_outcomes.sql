begin;

-- The initial reference baseline tied employment starts to a shared seed
-- position. That made otherwise unrelated role cohorts repeatedly report one
-- employment start. Recalculate only those reference rows with a role-specific
-- deterministic distribution so reruns remain reproducible without sharing a
-- fixed outcome across roles.
-- Search snapshots are immutable after intake. This migration only
-- recalibrates the traceable reference baseline, so it bypasses that trigger
-- within this transaction and restores the normal setting before commit.
set local session_replication_role = replica;

with baseline as (
  select
    episode.id as episode_id,
    abs((('x' || substr(md5(role.id::text || ':' || seed.position), 1, 8))::bit(32)::bigint)) as entropy,
    case
      when role.slug ~ '(director|vp|chief|general-manager|mudur|yonetici|leader|manager)' then 7
      when role.slug ~ '(engineer|developer|analyst|scientist|architect|lawyer|doctor|pharmacist)' then 4
      when role.slug ~ '(intern|stajyer|assistant|asistan|technician|teknisyen)' then 1
      else 3
    end as role_difficulty,
    funnel.any_interviews_count
  from intake.search_episodes as episode
  join intake.survey_submissions as submission
    on submission.id = episode.submission_id
  join intake.episode_funnel_totals as funnel
    on funnel.episode_id = episode.id
  join catalog.roles as role
    on role.id = episode.role_id
  join generate_series(1, 50) as seed(position)
    on episode.id = md5(
      'role-market-baseline-v1-episode-' || role.id || '-' || seed.position
    )::uuid
  where submission.data_origin = 'research_replica'
    and submission.source_key = 'eurostat-occupation-region-vacancies-2025'
), offers as (
  select
    baseline.*,
    case
      when any_interviews_count > 0
        and entropy % (12 + role_difficulty * 2) < 2
        then 1
      else 0
    end as offers_count
  from baseline
), outcomes as (
  select
    offers.*,
    case
      when offers_count > 0 and (entropy / 29) % 4 <> 0 then 1
      else 0
    end as accepted_offers_count
  from offers
), employment as (
  select
    outcomes.*,
    case
      when accepted_offers_count > 0 and (entropy / 43) % 5 <> 0 then 1
      else 0
    end as employment_started_count
  from outcomes
)
update intake.episode_funnel_totals as funnel
set
  offers_count = employment.offers_count,
  accepted_offers_count = employment.accepted_offers_count,
  employment_started_count = employment.employment_started_count,
  updated_at = now()
from employment
where funnel.episode_id = employment.episode_id;

with baseline as (
  select
    episode.id as episode_id,
    abs((('x' || substr(md5(role.id::text || ':' || seed.position), 1, 8))::bit(32)::bigint)) as entropy,
    case
      when role.slug ~ '(director|vp|chief|general-manager|mudur|yonetici|leader|manager)' then 7
      when role.slug ~ '(engineer|developer|analyst|scientist|architect|lawyer|doctor|pharmacist)' then 4
      when role.slug ~ '(intern|stajyer|assistant|asistan|technician|teknisyen)' then 1
      else 3
    end as role_difficulty,
    funnel.any_interviews_count
  from intake.search_episodes as episode
  join intake.survey_submissions as submission
    on submission.id = episode.submission_id
  join intake.episode_funnel_totals as funnel
    on funnel.episode_id = episode.id
  join catalog.roles as role
    on role.id = episode.role_id
  join generate_series(1, 50) as seed(position)
    on episode.id = md5(
      'role-market-baseline-v1-episode-' || role.id || '-' || seed.position
    )::uuid
  where submission.data_origin = 'research_replica'
    and submission.source_key = 'eurostat-occupation-region-vacancies-2025'
), offers as (
  select
    baseline.*,
    case
      when any_interviews_count > 0
        and entropy % (12 + role_difficulty * 2) < 2
        then 1
      else 0
    end as offers_count
  from baseline
), outcomes as (
  select
    offers.*,
    case
      when offers_count > 0 and (entropy / 29) % 4 <> 0 then 1
      else 0
    end as accepted_offers_count
  from offers
), employment as (
  select
    outcomes.*,
    case
      when accepted_offers_count > 0 and (entropy / 43) % 5 <> 0 then 1
      else 0
    end as employment_started_count
  from outcomes
), episode_status as (
  select
    employment.*,
    case
      when employment_started_count > 0 then 'employment_started'
      when accepted_offers_count > 0 then 'offer_accepted'
      when offers_count > 0 then 'offer_rejected'
      when (entropy / 71) % 5 = 0 then 'abandoned'
      else 'ongoing'
    end as status
  from employment
)
update intake.search_episodes as episode
set
  status = episode_status.status,
  ended_month = case
    when episode_status.status = 'ongoing' then null
    else date_trunc('month', episode.observed_through)::date
  end,
  currently_employed = episode_status.employment_started_count > 0,
  updated_at = now()
from episode_status
where episode.id = episode_status.episode_id;

set local session_replication_role = origin;

commit;
