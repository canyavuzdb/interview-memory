begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

create function api.get_public_benchmark_report_v1(
  p_min_cohort_size integer default 10,
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
  if p_min_cohort_size < 10 or p_min_cohort_size > 100
    or p_months < 3 or p_months > 12
  then
    raise exception using
      errcode = '22023',
      message = 'public_benchmark_query_invalid';
  end if;

  period_end := date_trunc('month', current_date)::date;
  period_start := (
    period_end - make_interval(months => p_months - 1)
  )::date;

  return (
    with eligible_search as (
      select
        episode.id,
        submission.data_subject_id,
        family.slug as raw_role_family,
        role.slug as raw_role_specialization,
        episode.role_level,
        episode.started_month,
        episode.ended_month,
        episode.observed_through,
        episode.status,
        funnel.applications_count,
        funnel.human_responses_count,
        funnel.any_interviews_count,
        funnel.offers_count,
        funnel.employment_started_count
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
        and episode.started_month between period_start and period_end
    ),
    latest_outcome as (
      select distinct on (event.application_id)
        event.application_id,
        event.outcome_code
      from intake.application_outcome_events as event
      order by event.application_id, event.sequence_no desc, event.id desc
    ),
    eligible_company_applications as (
      select
        application.id,
        submission.data_subject_id,
        application.company_id,
        company.slug as company_slug,
        company.display_name as company_name,
        application.applied_month,
        application.observed_through,
        experience.was_ghosted,
        experience.ghosted_after_stage,
        coalesce(outcome.outcome_code, 'awaiting_response') as outcome_code,
        exists (
          select 1
          from intake.application_stage_events as stage
          where stage.application_id = application.id
            and stage.stage_code in (
              'hr_screen', 'technical', 'final', 'offer'
            )
        ) as interviewed,
        exists (
          select 1
          from intake.application_offers as offer
          where offer.application_id = application.id
        ) as offered,
        exists (
          select 1
          from intake.application_offers as offer
          join intake.employment_outcomes as employment
            on employment.offer_id = offer.id
          where offer.application_id = application.id
            and employment.status = 'started'
        ) as employment_started
      from intake.job_applications as application
      join intake.survey_submissions as submission
        on submission.id = application.submission_id
      join intake.company_experiences as experience
        on experience.id = application.company_experience_id
      join catalog.companies as company
        on company.id = application.company_id
        and company.verification_status = 'verified'
        and company.publication_status = 'published'
      left join latest_outcome as outcome
        on outcome.application_id = application.id
      where submission.lifecycle_status = 'accepted'
        and submission.quality_status = 'eligible'
        and application.applied_month between period_start and period_end
    ),
    all_public_records as (
      select search.id as record_id, search.data_subject_id
      from eligible_search as search
      union all
      select application.id, application.data_subject_id
      from eligible_company_applications as application
    ),
    meta_counts as (
      select
        count(*)::integer as record_count,
        count(distinct data_subject_id)::integer as contributor_count
      from all_public_records
    ),
    role_cohorts as (
      select
        case search.raw_role_family
          when 'engineering' then 'software'
          when 'data' then 'data_ai'
          when 'business' then 'business_operations'
          else search.raw_role_family
        end as role_family,
        case search.raw_role_specialization
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
          else replace(search.raw_role_specialization, '-', '_')
        end as role_specialization,
        search.role_level as seniority,
        count(distinct search.data_subject_id)::integer
          as unique_candidates,
        count(*) filter (
          where search.status <> 'ongoing'
            or search.observed_through
              >= search.started_month + interval '30 days'
        )::integer as mature_search_episodes_count,
        sum(search.human_responses_count)::integer as responses_count,
        sum(search.any_interviews_count)::integer as interviews_count,
        sum(search.offers_count)::integer as offers_count,
        sum(search.employment_started_count)::integer
          as employment_started_count
      from eligible_search as search
      group by
        search.raw_role_family,
        search.raw_role_specialization,
        search.role_level
      having count(distinct search.data_subject_id) >= p_min_cohort_size
    ),
    company_cohorts as (
      select
        application.company_id,
        application.company_slug,
        application.company_name,
        count(distinct application.data_subject_id)::integer
          as unique_candidates,
        count(*)::integer as applications_count,
        count(*) filter (
          where application.outcome_code <> 'awaiting_response'
            or application.interviewed
        )::integer as responses_count,
        count(*) filter (
          where application.interviewed
        )::integer as interviews_count,
        count(*) filter (
          where application.offered
        )::integer as offers_count,
        count(*) filter (
          where application.employment_started
        )::integer as employment_started_count
      from eligible_company_applications as application
      group by
        application.company_id,
        application.company_slug,
        application.company_name
      having count(distinct application.data_subject_id) >= p_min_cohort_size
    ),
    candidate_banded as (
      select
        search.*,
        greatest(
          1,
          (
            extract(year from coalesce(
              search.ended_month,
              date_trunc('month', search.observed_through)::date
            ))::integer * 12
            + extract(month from coalesce(
              search.ended_month,
              date_trunc('month', search.observed_through)::date
            ))::integer
            - extract(year from search.started_month)::integer * 12
            - extract(month from search.started_month)::integer
            + 1
          )
        ) as duration_months
      from eligible_search as search
    ),
    candidate_classified as (
      select
        banded.*,
        case
          when banded.duration_months = 1 then 'one_month'
          when banded.duration_months between 2 and 3
            then 'two_to_three_months'
          when banded.duration_months between 4 and 6
            then 'four_to_six_months'
          else 'seven_plus_months'
        end as duration_band,
        case
          when banded.applications_count::numeric
            / banded.duration_months < 5 then 'under_five'
          when banded.applications_count::numeric
            / banded.duration_months < 10 then 'five_to_nine'
          when banded.applications_count::numeric
            / banded.duration_months < 20 then 'ten_to_nineteen'
          else 'twenty_plus'
        end as pace_band
      from candidate_banded as banded
    ),
    candidate_duration_cohorts as (
      select classified.duration_band
      from candidate_classified as classified
      group by classified.duration_band
      having count(distinct classified.data_subject_id)
        >= p_min_cohort_size
    ),
    candidate_cells as (
      select
        classified.duration_band,
        classified.pace_band,
        count(*)::integer as episode_count,
        sum(classified.applications_count)::integer as applications_count,
        sum(classified.human_responses_count)::integer as responses_count,
        sum(classified.offers_count)::integer as offers_count
      from candidate_classified as classified
      group by classified.duration_band, classified.pace_band
      having count(distinct classified.data_subject_id)
        >= p_min_cohort_size
    ),
    candidate_rows as (
      select
        duration.duration_band,
        jsonb_agg(
          jsonb_build_object(
            'paceBand', pace.pace_band,
            'episodeCount', coalesce(cell.episode_count, 0),
            'applicationsCount', coalesce(cell.applications_count, 0),
            'responsesCount', coalesce(cell.responses_count, 0),
            'offersCount', coalesce(cell.offers_count, 0)
          )
          order by pace.ordinality
        ) as cells
      from candidate_duration_cohorts as duration
      cross join unnest(array[
        'under_five',
        'five_to_nine',
        'ten_to_nineteen',
        'twenty_plus'
      ]::text[]) with ordinality as pace(pace_band, ordinality)
      left join candidate_cells as cell
        on cell.duration_band = duration.duration_band
        and cell.pace_band = pace.pace_band
      group by duration.duration_band
    ),
    company_tempo_classified as (
      select
        submission.data_subject_id,
        case experience.promised_timeline
          when 'not_specified' then 'not_provided'
          when 'no' then 'not_provided'
          else case
            when experience.promised_days <= 3 then 'zero_to_three'
            when experience.promised_days <= 7 then 'four_to_seven'
            when experience.promised_days <= 14 then 'eight_to_fourteen'
            else 'fifteen_plus'
          end
        end as promised_band,
        case
          when experience.was_ghosted then 'reported_no_response'
          when experience.actual_days <= 3 then 'zero_to_three'
          when experience.actual_days <= 7 then 'four_to_seven'
          when experience.actual_days <= 14 then 'eight_to_fourteen'
          when experience.actual_days <= 30 then 'fifteen_to_thirty'
          else 'over_thirty'
        end as actual_band
      from intake.company_experiences as experience
      join intake.survey_submissions as submission
        on submission.id = experience.submission_id
      where submission.lifecycle_status = 'accepted'
        and submission.quality_status = 'eligible'
        and experience.process_year
          >= extract(year from period_start)::integer
        and experience.process_year
          <= extract(year from period_end)::integer
    ),
    company_tempo_cohorts as (
      select classified.promised_band
      from company_tempo_classified as classified
      group by classified.promised_band
      having count(distinct classified.data_subject_id)
        >= p_min_cohort_size
    ),
    company_tempo_cells as (
      select
        classified.promised_band,
        classified.actual_band,
        count(*)::integer as cell_count
      from company_tempo_classified as classified
      group by classified.promised_band, classified.actual_band
      having count(distinct classified.data_subject_id)
        >= p_min_cohort_size
    ),
    company_tempo_rows as (
      select
        cohort.promised_band,
        sum(coalesce(cell.cell_count, 0))::integer as eligible_count,
        jsonb_agg(
          jsonb_build_object(
            'actualBand', actual.actual_band,
            'count', coalesce(cell.cell_count, 0)
          )
          order by actual.ordinality
        ) as cells
      from company_tempo_cohorts as cohort
      cross join unnest(array[
        'zero_to_three',
        'four_to_seven',
        'eight_to_fourteen',
        'fifteen_to_thirty',
        'over_thirty',
        'reported_no_response'
      ]::text[]) with ordinality as actual(actual_band, ordinality)
      left join company_tempo_cells as cell
        on cell.promised_band = cohort.promised_band
        and cell.actual_band = actual.actual_band
      group by cohort.promised_band
      having sum(coalesce(cell.cell_count, 0)) > 0
    ),
    responsiveness_cohorts as (
      select
        application.company_id,
        application.company_slug,
        application.company_name,
        count(*)::integer as eligible_mature_applications_count,
        count(*) filter (
          where application.was_ghosted
        )::integer as no_substantive_update_count,
        count(*) filter (
          where application.interviewed
        )::integer as interviewed_applications_count,
        count(*) filter (
          where application.was_ghosted
            and application.ghosted_after_stage in (
              'hr_screen', 'technical', 'final'
            )
        )::integer as post_interview_no_follow_up_count,
        count(distinct application.data_subject_id)::integer
          as contributors_count
      from eligible_company_applications as application
      where application.observed_through
        >= application.applied_month + interval '30 days'
      group by
        application.company_id,
        application.company_slug,
        application.company_name
      having count(distinct application.data_subject_id)
        >= p_min_cohort_size
    )
    select jsonb_build_object(
      'meta', jsonb_build_object(
        'status', case
          when meta.contributor_count >= p_min_cohort_size
            then 'live'
          else 'collecting'
        end,
        'generatedAt', current_date::text,
        'periodStart', to_char(period_start, 'YYYY-MM'),
        'periodEnd', to_char(period_end, 'YYYY-MM'),
        'region', 'all',
        'recordCount', case
          when meta.contributor_count >= p_min_cohort_size
            then meta.record_count
          else 0
        end,
        'uniqueCandidates', case
          when meta.contributor_count >= p_min_cohort_size
            then meta.contributor_count
          else 0
        end,
        'minPublicCohortSize', p_min_cohort_size,
        'minSalarySampleSize', p_min_cohort_size
      ),
      'roleMonthly', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', cohort.role_family || '-' ||
              cohort.role_specialization || '-' || cohort.seniority,
            'roleFamily', cohort.role_family,
            'roleSpecialization', cohort.role_specialization,
            'seniority', cohort.seniority,
            'uniqueCandidates', cohort.unique_candidates,
            'matureSearchEpisodesCount',
              cohort.mature_search_episodes_count,
            'responsesCount', cohort.responses_count,
            'interviewsCount', cohort.interviews_count,
            'offersCount', cohort.offers_count,
            'employmentStartedCount', cohort.employment_started_count,
            'monthlyApplications', (
              select jsonb_agg(
                jsonb_build_object(
                  'month', to_char(month.month_start, 'YYYY-MM'),
                  'count', coalesce((
                    select sum(search.applications_count)::integer
                    from eligible_search as search
                    where search.started_month = month.month_start
                      and case search.raw_role_family
                        when 'engineering' then 'software'
                        when 'data' then 'data_ai'
                        when 'business' then 'business_operations'
                        else search.raw_role_family
                      end = cohort.role_family
                      and case search.raw_role_specialization
                        when 'software-engineer'
                          then 'software_engineering'
                        when 'frontend-developer'
                          then 'frontend_development'
                        when 'backend-developer'
                          then 'backend_development'
                        when 'full-stack-developer'
                          then 'full_stack_development'
                        when 'mobile-developer'
                          then 'mobile_development'
                        when 'data-analyst' then 'data_analysis'
                        when 'data-scientist' then 'data_science'
                        when 'product-manager' then 'product_management'
                        when 'product-designer' then 'product_design'
                        when 'devops-engineer' then 'devops_engineering'
                        when 'qa-engineer' then 'quality_assurance'
                        when 'business-analyst' then 'business_analysis'
                        else replace(
                          search.raw_role_specialization, '-', '_'
                        )
                      end = cohort.role_specialization
                      and search.role_level = cohort.seniority
                  ), 0)
                )
                order by month.month_start
              )
              from generate_series(
                period_start,
                period_end,
                interval '1 month'
              ) as month(month_start)
            )
          )
          order by cohort.unique_candidates desc, cohort.role_family,
            cohort.role_specialization, cohort.seniority
        )
        from role_cohorts as cohort
      ), '[]'::jsonb),
      'companyFunnel', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', cohort.company_slug,
            'company', cohort.company_name,
            'uniqueCandidates', cohort.unique_candidates,
            'applicationsCount', cohort.applications_count,
            'responsesCount', cohort.responses_count,
            'interviewsCount', cohort.interviews_count,
            'offersCount', cohort.offers_count,
            'employmentStartedCount', cohort.employment_started_count,
            'acceptedSalarySampleSize', 0,
            'medianAcceptedSalary', jsonb_build_object(
              'min', 0,
              'max', null,
              'currency', 'TRY'
            ),
            'monthlyApplications', (
              select jsonb_agg(
                coalesce((
                  select count(*)::integer
                  from eligible_company_applications as application
                  where application.company_id = cohort.company_id
                    and application.applied_month = month.month_start
                ), 0)
                order by month.month_start
              )
              from generate_series(
                period_start,
                period_end,
                interval '1 month'
              ) as month(month_start)
            )
          )
          order by cohort.unique_candidates desc, cohort.company_name
        )
        from company_cohorts as cohort
      ), '[]'::jsonb),
      'activityTiming', jsonb_build_object(
        'meta', jsonb_build_object(
          'status', case
            when meta.contributor_count >= p_min_cohort_size
              then 'live'
            else 'collecting'
          end,
          'period', 'rolling_' || p_months || '_months',
          'source', 'candidate_reported_aggregate',
          'metricDefinitionVersion', '3.0',
          'minimumPublicSample', p_min_cohort_size
        ),
        'candidateTempo', jsonb_build_object(
          'rows', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'durationBand', row.duration_band,
                'cells', row.cells
              )
              order by array_position(array[
                'one_month',
                'two_to_three_months',
                'four_to_six_months',
                'seven_plus_months'
              ]::text[], row.duration_band)
            )
            from candidate_rows as row
          ), '[]'::jsonb)
        ),
        'companyResponseTempo', jsonb_build_object(
          'rows', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'promisedBand', row.promised_band,
                'eligibleCount', row.eligible_count,
                'cells', row.cells
              )
              order by array_position(array[
                'not_provided',
                'zero_to_three',
                'four_to_seven',
                'eight_to_fourteen',
                'fifteen_plus'
              ]::text[], row.promised_band)
            )
            from company_tempo_rows as row
          ), '[]'::jsonb)
        )
      ),
      'companyResponsivenessMeta', jsonb_build_object(
        'responseWindowDays', 30,
        'period', 'rolling_' || p_months || '_months',
        'source', 'candidate_reported_aggregate',
        'metricDefinitionVersion', '2.0'
      ),
      'companyResponsiveness', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', cohort.company_slug,
            'company', cohort.company_name,
            'eligibleMatureApplicationsCount',
              cohort.eligible_mature_applications_count,
            'noSubstantiveUpdateCount',
              cohort.no_substantive_update_count,
            'interviewedApplicationsCount',
              cohort.interviewed_applications_count,
            'postInterviewNoFollowUpCount',
              cohort.post_interview_no_follow_up_count,
            'contributorsCount', cohort.contributors_count
          )
          order by
            cohort.no_substantive_update_count::numeric
              / nullif(cohort.eligible_mature_applications_count, 0) desc,
            cohort.company_name
        )
        from responsiveness_cohorts as cohort
      ), '[]'::jsonb)
    )
    from meta_counts as meta
  );
end;
$$;

revoke all on function api.get_public_benchmark_report_v1(integer, integer)
  from public, anon, authenticated, service_role;
grant execute on function api.get_public_benchmark_report_v1(integer, integer)
  to service_role;

comment on function api.get_public_benchmark_report_v1(integer, integer) is
  'B12 server-only public benchmark DTO. Every published cohort enforces n>=10 and returns no raw response, free text, account, or respondent identifier.';

commit;
