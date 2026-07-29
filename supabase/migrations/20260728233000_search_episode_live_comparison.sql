begin;

-- A private, server-only comparison for the just-created search episode.
-- It intentionally returns only cohort aggregates and only when at least five
-- distinct contributors match. No fallback crosses role boundaries.
create or replace function api.get_search_episode_live_comparison_v1(
  p_search_episode_id uuid,
  p_min_cohort_size integer default 5
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  target record;
  cohort_level text;
  cohort jsonb;
begin
  if p_min_cohort_size < 5 or p_min_cohort_size > 100 then
    raise exception using
      errcode = '22023',
      message = 'search_episode_comparison_query_invalid';
  end if;

  select
    episode.id,
    episode.role_id,
    episode.role_level,
    episode.experience_band,
    episode.target_region
  into target
  from intake.search_episodes as episode
  inner join intake.survey_submissions as submission
    on submission.id = episode.submission_id
  where episode.id = p_search_episode_id
    and submission.lifecycle_status = 'accepted'
    and submission.quality_status = 'eligible';

  if not found then
    raise exception using
      errcode = '22023',
      message = 'search_episode_comparison_not_available';
  end if;

  with candidates as (
    select
      episode.id,
      submission.data_subject_id,
      episode.role_id,
      episode.role_level,
      episode.experience_band,
      episode.target_region,
      greatest(
        1,
        (coalesce(episode.ended_month, date_trunc('month', current_date)::date)
          - episode.started_month + 1)
      )::numeric as duration_days,
      funnel.applications_count,
      funnel.human_responses_count,
      funnel.any_interviews_count
    from intake.search_episodes as episode
    inner join intake.survey_submissions as submission
      on submission.id = episode.submission_id
    inner join intake.episode_funnel_totals as funnel
      on funnel.episode_id = episode.id
    where submission.lifecycle_status = 'accepted'
      and submission.quality_status = 'eligible'
      and episode.id <> target.id
      and episode.role_id = target.role_id
  ),
  tiered as (
    select 'exact'::text as level, candidate.*
    from candidates as candidate
    where candidate.role_level = target.role_level
      and candidate.experience_band = target.experience_band
      and candidate.target_region = target.target_region
    union all
    select 'role_level_region'::text, candidate.*
    from candidates as candidate
    where candidate.role_level = target.role_level
      and candidate.target_region = target.target_region
    union all
    select 'role_level'::text, candidate.*
    from candidates as candidate
    where candidate.role_level = target.role_level
    union all
    select 'role'::text, candidate.*
    from candidates as candidate
  ),
  eligible_levels as (
    select
      level,
      case level
        when 'exact' then 1
        when 'role_level_region' then 2
        when 'role_level' then 3
        else 4
      end as priority
    from tiered
    group by level
    having count(distinct data_subject_id) >= p_min_cohort_size
    order by priority
    limit 1
  )
  select eligible.level,
    jsonb_build_object(
      'status', 'live',
      'matchLevel', eligible.level,
      'cohortSize', count(distinct candidate.data_subject_id)::integer,
      'durationDaysMedian', round(percentile_cont(0.5) within group (order by candidate.duration_days))::integer,
      'durationDaysP25', round(percentile_cont(0.25) within group (order by candidate.duration_days))::integer,
      'durationDaysP75', round(percentile_cont(0.75) within group (order by candidate.duration_days))::integer,
      'applicationsPerMonthMedian', round(percentile_cont(0.5) within group (
        order by candidate.applications_count::numeric / greatest(1, candidate.duration_days / 30)
      ))::integer,
      'responseRate', round(
        100.0 * sum(candidate.human_responses_count) / nullif(sum(candidate.applications_count), 0),
        1
      ),
      'interviewRate', round(
        100.0 * sum(candidate.any_interviews_count) / nullif(sum(candidate.applications_count), 0),
        1
      )
    )
  into cohort_level, cohort
  from tiered as candidate
  inner join eligible_levels as eligible
    on eligible.level = candidate.level
  group by eligible.level;

  if cohort is null then
    return jsonb_build_object(
      'status', 'collecting',
      'matchLevel', null,
      'cohortSize', 0,
      'durationDaysMedian', null,
      'durationDaysP25', null,
      'durationDaysP75', null,
      'applicationsPerMonthMedian', null,
      'responseRate', null,
      'interviewRate', null
    );
  end if;

  return cohort;
end;
$$;

revoke all on function api.get_search_episode_live_comparison_v1(uuid, integer)
  from public, anon, authenticated, service_role;
grant execute on function api.get_search_episode_live_comparison_v1(uuid, integer)
  to service_role;

comment on function api.get_search_episode_live_comparison_v1(uuid, integer) is
  'Server-only live peer comparison for one accepted search episode. Uses aggregate data only and requires at least five distinct matching contributors.';

commit;
