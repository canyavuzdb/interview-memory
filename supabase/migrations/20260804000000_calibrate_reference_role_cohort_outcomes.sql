begin;

-- A record-level probability still produced mostly one employment start per
-- visible role + seniority cohort. Calibrate the reference baseline at the
-- cohort level instead: each visible cohort receives a deterministic 0–4
-- employment-start target, then the target is assigned to applications that
-- reached an interview. This keeps the funnel valid while making the sample
-- variation legible in the report.
set local session_replication_role = replica;

with baseline as (
  select
    episode.id as episode_id,
    episode.role_id,
    episode.role_level,
    abs((('x' || substr(md5(episode.id::text), 1, 8))::bit(32)::bigint)) as episode_entropy,
    abs((('x' || substr(md5(episode.role_id::text || ':' || episode.role_level), 1, 8))::bit(32)::bigint)) as cohort_entropy,
    funnel.any_interviews_count
  from intake.search_episodes as episode
  join intake.survey_submissions as submission
    on submission.id = episode.submission_id
  join intake.episode_funnel_totals as funnel
    on funnel.episode_id = episode.id
  where submission.data_origin = 'research_replica'
    and submission.source_key = 'eurostat-occupation-region-vacancies-2025'
    and episode.started_month between (
      date_trunc('month', current_date)::date - make_interval(months => 5)
    ) and date_trunc('month', current_date)::date
), ranked as (
  select
    baseline.*,
    case
      when any_interviews_count > 0 then sum(
        case when any_interviews_count > 0 then 1 else 0 end
      ) over (
        partition by role_id, role_level
        order by episode_entropy, episode_id
      )
      else null
    end as eligible_interview_rank,
    case cohort_entropy % 10
      when 0 then 0
      when 1 then 1
      when 2 then 1
      when 3 then 1
      when 4 then 2
      when 5 then 2
      when 6 then 2
      when 7 then 3
      when 8 then 3
      else 4
    end as employment_target,
    case when (cohort_entropy / 17) % 3 = 0 then 1 else 0 end as rejected_offer_target
  from baseline
), outcomes as (
  select
    ranked.*,
    case
      when eligible_interview_rank <= employment_target then 1
      else 0
    end as employment_started_count,
    case
      when eligible_interview_rank <= employment_target then 1
      else 0
    end as accepted_offers_count,
    case
      when eligible_interview_rank <= employment_target + rejected_offer_target then 1
      else 0
    end as offers_count
  from ranked
)
update intake.episode_funnel_totals as funnel
set
  offers_count = outcomes.offers_count,
  accepted_offers_count = outcomes.accepted_offers_count,
  employment_started_count = outcomes.employment_started_count,
  updated_at = now()
from outcomes
where funnel.episode_id = outcomes.episode_id;

with baseline as (
  select
    episode.id as episode_id,
    abs((('x' || substr(md5(episode.id::text), 1, 8))::bit(32)::bigint)) as episode_entropy,
    funnel.offers_count,
    funnel.accepted_offers_count,
    funnel.employment_started_count
  from intake.search_episodes as episode
  join intake.survey_submissions as submission
    on submission.id = episode.submission_id
  join intake.episode_funnel_totals as funnel
    on funnel.episode_id = episode.id
  where submission.data_origin = 'research_replica'
    and submission.source_key = 'eurostat-occupation-region-vacancies-2025'
    and episode.started_month between (
      date_trunc('month', current_date)::date - make_interval(months => 5)
    ) and date_trunc('month', current_date)::date
), statuses as (
  select
    baseline.*,
    case
      when employment_started_count > 0 then 'employment_started'
      when accepted_offers_count > 0 then 'offer_accepted'
      when offers_count > 0 then 'offer_rejected'
      when episode_entropy % 5 = 0 then 'abandoned'
      else 'ongoing'
    end as status
  from baseline
)
update intake.search_episodes as episode
set
  status = statuses.status,
  ended_month = case
    when statuses.status = 'ongoing' then null
    else date_trunc('month', episode.observed_through)::date
  end,
  currently_employed = statuses.employment_started_count > 0,
  updated_at = now()
from statuses
where episode.id = statuses.episode_id;

set local session_replication_role = origin;

commit;
