begin;

create function api.get_company_process_report_v1(
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
    raise exception using errcode = '22023', message = 'company_process_report_query_invalid';
  end if;

  period_end := date_trunc('month', current_date)::date;
  period_start := (period_end - make_interval(months => p_months - 1))::date;

  return (
    with stage_flags as (
      select
        stage.application_id,
        bool_or(stage.stage_code = 'hr_screen') as reached_hr_screen,
        bool_or(stage.stage_code = 'technical') as reached_technical,
        bool_or(stage.stage_code = 'final') as reached_final
      from intake.application_stage_events as stage
      group by stage.application_id
    ),
    latest_outcome as (
      select distinct on (event.application_id)
        event.application_id,
        event.outcome_code
      from intake.application_outcome_events as event
      order by event.application_id, event.sequence_no desc, event.id desc
    ),
    eligible_applications as (
      select
        application.id,
        application.company_id,
        company.slug as company_slug,
        company.display_name as company_name,
        application.applied_role,
        submission.data_subject_id,
        experience.was_ghosted,
        experience.process_transparency,
        experience.hr_professionalism,
        experience.rejection_shared,
        experience.was_asked_irrelevant,
        coalesce(stages.reached_hr_screen, false) as reached_hr_screen,
        coalesce(stages.reached_technical, false) as reached_technical,
        coalesce(stages.reached_final, false) as reached_final,
        exists (
          select 1 from intake.application_offers as offer
          where offer.application_id = application.id
        ) as received_offer,
        exists (
          select 1 from intake.application_offers as offer
          join intake.employment_outcomes as employment on employment.offer_id = offer.id
          where offer.application_id = application.id and employment.status = 'started'
        ) as employment_started
      from intake.job_applications as application
      join intake.survey_submissions as submission on submission.id = application.submission_id
      join intake.company_experiences as experience on experience.id = application.company_experience_id
      join catalog.companies as company on company.id = application.company_id
      left join stage_flags as stages on stages.application_id = application.id
      left join latest_outcome as outcome on outcome.application_id = application.id
      where submission.lifecycle_status = 'accepted'
        and submission.quality_status = 'eligible'
        and application.applied_month between period_start and period_end
    ),
    company_totals as (
      select
        application.company_id,
        min(application.company_slug) as company_slug,
        min(application.company_name) as company_name,
        count(*)::integer as applications_count,
        count(distinct application.data_subject_id)::integer as contributors_count,
        count(*) filter (where not application.was_ghosted)::integer as responded_applications_count,
        count(*) filter (where application.reached_hr_screen)::integer as hr_screen_applications_count,
        count(*) filter (where application.reached_hr_screen or application.reached_technical or application.reached_final or application.received_offer)::integer as interviewed_applications_count,
        count(*) filter (where application.reached_technical)::integer as technical_applications_count,
        count(*) filter (where application.reached_final)::integer as final_applications_count,
        count(*) filter (where application.received_offer)::integer as offered_applications_count,
        count(*) filter (where application.employment_started)::integer as employment_started_applications_count,
        count(*) filter (where application.was_ghosted and (application.reached_hr_screen or application.reached_technical or application.reached_final))::integer as post_interview_no_follow_up_count,
        avg(application.process_transparency)::numeric(4,2) as average_transparency,
        avg(application.hr_professionalism)::numeric(4,2) as average_professionalism,
        count(*) filter (where application.rejection_shared <> 'no')::integer as feedback_shared_count,
        count(*) filter (where application.was_asked_irrelevant)::integer as irrelevant_question_count
      from eligible_applications as application
      group by application.company_id
      having count(distinct application.data_subject_id) >= p_min_cohort_size
    ),
    role_totals as (
      select
        application.company_id,
        application.applied_role,
        count(*)::integer as applications_count,
        count(distinct application.data_subject_id)::integer as contributors_count,
        count(*) filter (where not application.was_ghosted)::integer as responded_applications_count,
        count(*) filter (where application.reached_hr_screen)::integer as hr_screen_applications_count,
        count(*) filter (where application.reached_hr_screen or application.reached_technical or application.reached_final or application.received_offer)::integer as interviewed_applications_count,
        count(*) filter (where application.reached_technical)::integer as technical_applications_count,
        count(*) filter (where application.reached_final)::integer as final_applications_count,
        count(*) filter (where application.received_offer)::integer as offered_applications_count,
        count(*) filter (where application.employment_started)::integer as employment_started_applications_count
      from eligible_applications as application
      group by application.company_id, application.applied_role
    )
    select jsonb_build_object(
      'meta', jsonb_build_object(
        'responseWindowDays', 30,
        'period', 'rolling_' || p_months || '_months',
        'source', 'candidate_reported_aggregate',
        'metricDefinitionVersion', '3.0'
      ),
      'rows', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', company.company_slug,
          'company', company.company_name,
          'eligibleMatureApplicationsCount', company.applications_count,
          'respondedApplicationsCount', company.responded_applications_count,
          'hrScreenApplicationsCount', company.hr_screen_applications_count,
          'noSubstantiveUpdateCount', company.applications_count - company.responded_applications_count,
          'interviewedApplicationsCount', company.interviewed_applications_count,
          'technicalApplicationsCount', company.technical_applications_count,
          'finalApplicationsCount', company.final_applications_count,
          'offeredApplicationsCount', company.offered_applications_count,
          'employmentStartedApplicationsCount', company.employment_started_applications_count,
          'postInterviewNoFollowUpCount', company.post_interview_no_follow_up_count,
          'contributorsCount', company.contributors_count,
          'averageTransparency', company.average_transparency,
          'averageProfessionalism', company.average_professionalism,
          'feedbackSharedCount', company.feedback_shared_count,
          'irrelevantQuestionCount', company.irrelevant_question_count,
          'roles', coalesce(
            (
              select jsonb_agg(
                jsonb_build_object(
                  'role', role.applied_role,
                  'applicationsCount', role.applications_count,
                  'contributorsCount', role.contributors_count,
                  'respondedApplicationsCount', role.responded_applications_count,
                  'hrScreenApplicationsCount', role.hr_screen_applications_count,
                  'interviewedApplicationsCount', role.interviewed_applications_count,
                  'technicalApplicationsCount', role.technical_applications_count,
                  'finalApplicationsCount', role.final_applications_count,
                  'offeredApplicationsCount', role.offered_applications_count,
                  'employmentStartedApplicationsCount', role.employment_started_applications_count
                ) order by role.applications_count desc, role.applied_role
              )
              from role_totals as role
              where role.company_id = company.company_id
            ),
            '[]'::jsonb
          )
        ) order by company.applications_count desc, company.company_name)),
        '[]'::jsonb
      )
    )
    from company_totals as company
  );
end;
$$;

revoke all on function api.get_company_process_report_v1(integer, integer)
  from public, anon, authenticated, service_role;
grant execute on function api.get_company_process_report_v1(integer, integer)
  to service_role;

commit;
