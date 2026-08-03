begin;

create function api.get_public_role_benchmark_report_v1(
  p_min_cohort_size integer default 1,
  p_months integer default 6
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  period_start date;
  period_end date;
begin
  if p_min_cohort_size < 1 or p_min_cohort_size > 100
    or p_months < 3 or p_months > 12
  then
    raise exception using
      errcode = '22023',
      message = 'public_role_benchmark_query_invalid';
  end if;

  period_end := date_trunc('month', current_date)::date;
  period_start := (period_end - make_interval(months => p_months - 1))::date;

  return (
    with normalized_search as (
      select
        submission.data_subject_id,
        case family.slug
          when 'engineering' then 'software'
          when 'data' then 'data_ai'
          when 'business' then 'business_operations'
          else family.slug
        end as role_family,
        case role.slug
          when 'software-engineer' then 'software_engineering'
          when 'frontend-developer' then 'frontend_development'
          when 'backend-developer' then 'backend_development'
          when 'full-stack-developer' then 'full_stack_development'
          when 'mobile-developer' then 'mobile_development'
          when 'data-analyst' then 'data_analysis'
          when 'data-scientist' then 'data_science'
          when 'product-manager' then 'product_management'
          when 'product-designer' then 'product_design'
          when 'devops-engineer' then 'devops_engineering'
          when 'qa-engineer' then 'quality_assurance'
          when 'business-analyst' then 'business_analysis'
          else replace(role.slug, '-', '_')
        end as role_specialization,
        episode.role_level as seniority,
        episode.started_month,
        episode.ended_month,
        episode.observed_through,
        episode.status,
        funnel.applications_count,
        funnel.human_responses_count,
        funnel.any_interviews_count,
        funnel.offers_count,
        funnel.employment_started_count,
        greatest(
          1,
          extract(year from coalesce(
            episode.ended_month,
            date_trunc('month', episode.observed_through)::date
          ))::integer * 12
          + extract(month from coalesce(
            episode.ended_month,
            date_trunc('month', episode.observed_through)::date
          ))::integer
          - extract(year from episode.started_month)::integer * 12
          - extract(month from episode.started_month)::integer
          + 1
        ) as duration_months
      from intake.search_episodes as episode
      join intake.survey_submissions as submission
        on submission.id = episode.submission_id
      join intake.episode_funnel_totals as funnel
        on funnel.episode_id = episode.id
      join catalog.roles as role on role.id = episode.role_id
      join catalog.role_families as family
        on family.id = role.role_family_id
      where submission.lifecycle_status = 'accepted'
        and submission.quality_status = 'eligible'
        and (
          submission.data_origin = 'community'
          or (
            submission.data_origin = 'research_replica'
            and submission.source_key = 'eurostat-occupation-region-vacancies-2025'
          )
        )
        and episode.started_month between period_start and period_end
    ),
    role_cohorts as (
      select
        search.role_family,
        search.role_specialization,
        search.seniority,
        count(distinct search.data_subject_id)::integer as unique_candidates,
        count(*) filter (
          where search.status <> 'ongoing'
            or search.observed_through >= search.started_month + interval '30 days'
        )::integer as mature_search_episodes_count,
        sum(search.applications_count)::integer as applications_count,
        round(
          sum(search.applications_count)::numeric
          / nullif(sum(search.duration_months), 0),
          1
        ) as monthly_average_applications,
        sum(search.human_responses_count)::integer as responses_count,
        sum(search.any_interviews_count)::integer as interviews_count,
        sum(search.offers_count)::integer as offers_count,
        sum(search.employment_started_count)::integer as employment_started_count
      from normalized_search as search
      group by search.role_family, search.role_specialization, search.seniority
      having count(distinct search.data_subject_id) >= p_min_cohort_size
    ),
    role_monthly as (
      select
        search.role_family,
        search.role_specialization,
        search.seniority,
        month.month_start::date as month_start,
        coalesce(round(sum(
          search.applications_count::numeric / search.duration_months
        ), 1), 0)::integer as applications_count
      from normalized_search as search
      cross join generate_series(
        period_start,
        period_end,
        interval '1 month'
      ) as month(month_start)
      where month.month_start between search.started_month
        and coalesce(
          search.ended_month,
          date_trunc('month', search.observed_through)::date
        )
      group by 1, 2, 3, 4
    ),
    role_projection as (
      select
        cohort.*,
        jsonb_agg(
          jsonb_build_object(
            'month', to_char(month.month_start, 'YYYY-MM'),
            'count', coalesce(monthly.applications_count, 0)
          )
          order by month.month_start
        ) as monthly_applications
      from role_cohorts as cohort
      cross join generate_series(
        period_start,
        period_end,
        interval '1 month'
      ) as month(month_start)
      left join role_monthly as monthly
        on monthly.role_family = cohort.role_family
        and monthly.role_specialization = cohort.role_specialization
        and monthly.seniority = cohort.seniority
        and monthly.month_start = month.month_start::date
      group by
        cohort.role_family,
        cohort.role_specialization,
        cohort.seniority,
        cohort.unique_candidates,
        cohort.mature_search_episodes_count,
        cohort.applications_count,
        cohort.monthly_average_applications,
        cohort.responses_count,
        cohort.interviews_count,
        cohort.offers_count,
        cohort.employment_started_count
    )
    select jsonb_build_object(
      'roleCohortCount', (select count(*)::integer from role_cohorts),
      'roleMonthly', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', row.role_family || '-' || row.role_specialization || '-' || row.seniority,
            'roleFamily', row.role_family,
            'roleSpecialization', row.role_specialization,
            'seniority', row.seniority,
            'uniqueCandidates', row.unique_candidates,
            'matureSearchEpisodesCount', row.mature_search_episodes_count,
            'applicationsCount', row.applications_count,
            'monthlyAverageApplications', row.monthly_average_applications,
            'responsesCount', row.responses_count,
            'interviewsCount', row.interviews_count,
            'offersCount', row.offers_count,
            'employmentStartedCount', row.employment_started_count,
            'monthlyApplications', row.monthly_applications
          )
          order by row.unique_candidates desc, row.role_family,
            row.role_specialization, row.seniority
        )
        from role_projection as row
      ), '[]'::jsonb)
    )
  );
end;
$$;

revoke all on function api.get_public_role_benchmark_report_v1(integer, integer)
  from public, anon, authenticated, service_role;
grant execute on function api.get_public_role_benchmark_report_v1(integer, integer)
  to service_role;

comment on function api.get_public_role_benchmark_report_v1(integer, integer) is
  'Server-only role and seniority aggregates for the public benchmark explorer.';

commit;
