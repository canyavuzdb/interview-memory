begin;

create or replace function api.get_my_personal_report_v1(
  p_auth_user_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
with owner_subject as (
  select subject.id as data_subject_id
  from core.data_subjects as subject
  inner join core.user_profiles as profile
    on profile.user_id = subject.auth_user_id
  where subject.auth_user_id = p_auth_user_id
    and subject.status = 'authenticated'
    and subject.merged_into_id is null
    and subject.deleted_at is null
    and profile.account_status = 'active'
),
owned_submissions as (
  select submission.id, submission.survey_type, submission.submitted_at
  from intake.survey_submissions as submission
  inner join owner_subject as owner
    on owner.data_subject_id = submission.data_subject_id
  where submission.lifecycle_status = 'accepted'
    and submission.quality_status = 'eligible'
),
search_summary as (
  select
    count(*)::integer as episode_count,
    coalesce(sum(funnel.applications_count), 0)::integer as applications_count,
    coalesce(sum(funnel.human_responses_count), 0)::integer as human_responses_count,
    coalesce(sum(funnel.any_interviews_count), 0)::integer as interviews_count,
    coalesce(sum(funnel.offers_count), 0)::integer as offers_count,
    coalesce(sum(funnel.employment_started_count), 0)::integer as employment_started_count
  from intake.search_episodes as episode
  inner join owned_submissions as submission
    on submission.id = episode.submission_id
   and submission.survey_type = 'search_benchmark'
  inner join intake.episode_funnel_totals as funnel
    on funnel.episode_id = episode.id
),
company_rows as (
  select
    experience.created_at,
    experience.company_name,
    experience.applied_role,
    experience.process_year,
    experience.promised_timeline,
    experience.promised_days,
    experience.actual_days,
    experience.was_ghosted,
    experience.ghosted_after_stage,
    experience.rejection_shared,
    experience.feedback_useful,
    experience.process_transparency,
    experience.hr_professionalism,
    experience.would_recommend_process
  from intake.company_experiences as experience
  inner join owned_submissions as submission
    on submission.id = experience.submission_id
   and submission.survey_type = 'company_experience'
),
application_rows as (
  select
    application.created_at,
    application.applied_role,
    application.application_channel,
    application.had_referral,
    application.applied_month,
    experience.company_name,
    latest.outcome_code,
    latest.occurred_month,
    (select count(*)::integer
     from intake.application_stage_events as stage
     where stage.application_id = application.id) as stage_count
  from intake.job_applications as application
  inner join owned_submissions as submission
    on submission.id = application.submission_id
  inner join intake.company_experiences as experience
    on experience.id = application.company_experience_id
  left join lateral (
    select outcome.outcome_code, outcome.occurred_month
    from intake.application_outcome_events as outcome
    where outcome.application_id = application.id
    order by outcome.sequence_no desc, outcome.id desc
    limit 1
  ) as latest on true
),
company_json as (
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'company', row.company_name,
        'role', row.applied_role,
        'processYear', row.process_year,
        'promisedTimeline', row.promised_timeline,
        'promisedDays', row.promised_days,
        'actualDays', row.actual_days,
        'wasGhosted', row.was_ghosted,
        'ghostedAfterStage', row.ghosted_after_stage,
        'rejectionShared', row.rejection_shared,
        'feedbackUseful', row.feedback_useful,
        'processTransparency', row.process_transparency,
        'hrProfessionalism', row.hr_professionalism,
        'wouldRecommendProcess', row.would_recommend_process,
        'createdAt', row.created_at
      )
      order by row.created_at desc
    ),
    '[]'::jsonb
  ) as value
  from company_rows as row
),
application_json as (
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'company', row.company_name,
        'role', row.applied_role,
        'applicationChannel', row.application_channel,
        'hadReferral', row.had_referral,
        'appliedMonth', row.applied_month,
        'outcome', row.outcome_code,
        'outcomeMonth', row.occurred_month,
        'stageCount', row.stage_count,
        'createdAt', row.created_at
      )
      order by row.applied_month desc, row.created_at desc
    ),
    '[]'::jsonb
  ) as value
  from application_rows as row
)
select jsonb_build_object(
  'meta', jsonb_build_object(
    'status', 'live',
    'generatedAt', current_date,
    'submissionsCount', (select count(*)::integer from owned_submissions),
    'searchEpisodesCount', (select episode_count from search_summary),
    'companyExperiencesCount', (select count(*)::integer from company_rows),
    'applicationsCount', (select count(*)::integer from application_rows)
  ),
  'search', jsonb_build_object(
    'episodeCount', search.episode_count,
    'applicationsCount', search.applications_count,
    'humanResponsesCount', search.human_responses_count,
    'interviewsCount', search.interviews_count,
    'offersCount', search.offers_count,
    'employmentStartedCount', search.employment_started_count
  ),
  'companyExperiences', companies.value,
  'applications', applications.value
)
from search_summary as search
cross join company_json as companies
cross join application_json as applications
where exists (select 1 from owner_subject);
$$;

revoke all on function api.get_my_personal_report_v1(uuid)
  from public, anon, authenticated, service_role;
grant execute on function api.get_my_personal_report_v1(uuid)
  to service_role;

comment on function api.get_my_personal_report_v1(uuid) is
  'Server-only self report. The server resolves the authenticated account and the function returns only that account subject data.';

commit;
