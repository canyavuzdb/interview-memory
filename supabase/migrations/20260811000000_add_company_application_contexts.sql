begin;

create table intake.application_candidate_contexts (
  application_id uuid primary key
    references intake.job_applications (id) on delete restrict,
  seniority text not null,
  experience_band text not null,
  created_at timestamptz not null default now(),
  constraint application_candidate_contexts_seniority_check check (
    seniority in ('intern', 'junior', 'mid', 'senior', 'lead_manager')
  ),
  constraint application_candidate_contexts_experience_band_check check (
    experience_band in ('0-1', '1-3', '3-5', '5-8', '8+')
  )
);

comment on table intake.application_candidate_contexts is
  'Anonymous applicant context for company-process aggregates. Seniority and experience are stored as broad bands only.';

alter table intake.application_candidate_contexts enable row level security;
alter table intake.application_candidate_contexts force row level security;

create function api.create_application_candidate_context_v1(
  p_application_id uuid,
  p_seniority text,
  p_experience_band text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from intake.job_applications where id = p_application_id) then
    raise exception using errcode = '22023', message = 'application_context_application_not_found';
  end if;

  insert into intake.application_candidate_contexts (
    application_id, seniority, experience_band
  ) values (
    p_application_id, p_seniority, p_experience_band
  ) on conflict (application_id) do nothing;

  if exists (
    select 1
    from intake.application_candidate_contexts
    where application_id = p_application_id
      and (seniority <> p_seniority or experience_band <> p_experience_band)
  ) then
    raise exception using errcode = '55000', message = 'application_candidate_context_is_immutable';
  end if;
end;
$$;

revoke all on function api.create_application_candidate_context_v1(uuid, text, text)
  from public, anon, authenticated;
grant execute on function api.create_application_candidate_context_v1(uuid, text, text)
  to service_role;

create function api.get_company_process_context_report_v1(
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
    raise exception using errcode = '22023', message = 'company_process_context_report_query_invalid';
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
    eligible_applications as (
      select
        company.slug as company_slug,
        application.applied_role,
        context.seniority,
        context.experience_band,
        application.application_channel,
        application.had_referral,
        submission.data_subject_id,
        experience.was_ghosted,
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
      join intake.application_candidate_contexts as context on context.application_id = application.id
      join intake.survey_submissions as submission on submission.id = application.submission_id
      join intake.company_experiences as experience on experience.id = application.company_experience_id
      join catalog.companies as company on company.id = application.company_id
      left join stage_flags as stages on stages.application_id = application.id
      where submission.lifecycle_status = 'accepted'
        and submission.quality_status = 'eligible'
        and application.applied_month between period_start and period_end
    ),
    context_totals as (
      select
        application.company_slug,
        application.applied_role,
        application.seniority,
        application.experience_band,
        application.application_channel,
        application.had_referral,
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
      group by
        application.company_slug, application.applied_role, application.seniority,
        application.experience_band, application.application_channel, application.had_referral
    )
    select jsonb_build_object(
      'rows', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', company_slug,
          'contexts', contexts
        ) order by company_slug)
        from (
          select
            company_slug,
            jsonb_agg(jsonb_build_object(
              'role', applied_role,
              'seniority', seniority,
              'experienceBand', experience_band,
              'applicationChannel', application_channel,
              'hadReferral', had_referral,
              'applicationsCount', applications_count,
              'contributorsCount', contributors_count,
              'respondedApplicationsCount', responded_applications_count,
              'hrScreenApplicationsCount', hr_screen_applications_count,
              'interviewedApplicationsCount', interviewed_applications_count,
              'technicalApplicationsCount', technical_applications_count,
              'finalApplicationsCount', final_applications_count,
              'offeredApplicationsCount', offered_applications_count,
              'employmentStartedApplicationsCount', employment_started_applications_count
            ) order by applications_count desc, applied_role, seniority, experience_band, application_channel) as contexts
          from context_totals
          group by company_slug
          having sum(contributors_count) >= p_min_cohort_size
        ) as grouped
      ), '[]'::jsonb)
    )
  );
end;
$$;

revoke all on function api.get_company_process_context_report_v1(integer, integer)
  from public, anon, authenticated, service_role;
grant execute on function api.get_company_process_context_report_v1(integer, integer)
  to service_role;

commit;
