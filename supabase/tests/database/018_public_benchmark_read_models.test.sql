begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(15);

-- Keep this contract test focused on the threshold transition. The transaction
-- rolls back, so the migration-owned replica seed remains intact for test 019.
set local session_replication_role = replica;
delete from intake.survey_submissions
where data_origin = 'research_replica';
set local session_replication_role = origin;

select extensions.has_function(
  'api',
  'get_public_benchmark_report_v1',
  array['integer', 'integer'],
  'B12 public benchmark read model exists'
);
select extensions.ok(
  has_function_privilege(
    'service_role',
    'api.get_public_benchmark_report_v1(integer,integer)',
    'EXECUTE'
  ),
  'the server role can read the public benchmark DTO'
);
select extensions.ok(
  not has_function_privilege(
    'anon',
    'api.get_public_benchmark_report_v1(integer,integer)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'authenticated',
    'api.get_public_benchmark_report_v1(integer,integer)',
    'EXECUTE'
  ),
  'browser roles cannot execute the private aggregation function'
);
select extensions.throws_ok(
  $$select api.get_public_benchmark_report_v1(0, 6)$$,
  '22023',
  'public_benchmark_query_invalid',
  'the database refuses a publication threshold below one'
);
select extensions.is(
  (api.get_public_benchmark_report_v1(1, 6) #>> '{meta,minPublicCohortSize}')::integer,
  1,
  'the public report accepts a first-contribution threshold'
);
select extensions.results_eq(
  $query$
    select
      report #>> '{meta,status}',
      (report #>> '{meta,recordCount}')::integer,
      jsonb_array_length(report -> 'roleMonthly')
    from (
      select api.get_public_benchmark_report_v1(10, 6) as report
    ) as result
  $query$,
  $$values ('collecting'::text, 0, 0)$$,
  'an empty database returns a collecting DTO without counts'
);

create function pg_temp.seed_b12_search(
  p_index integer,
  p_started_month date default null
)
returns void
language plpgsql
as $$
declare
  subject_id uuid := md5('b12-subject-' || p_index)::uuid;
  submission_id uuid := md5('b12-submission-' || p_index)::uuid;
  episode_id uuid := md5('b12-episode-' || p_index)::uuid;
  notice_id uuid;
begin
  select notice.id into notice_id
  from privacy.notice_versions as notice
  where notice.document_type = 'survey_notice'
    and notice.locale = 'tr'
  order by notice.effective_from desc
  limit 1;

  insert into core.data_subjects (
    id,
    anonymous_key_hmac,
    anonymous_key_version,
    status
  ) values (
    subject_id,
    extensions.digest('b12-subject-' || p_index, 'sha256'),
    1,
    'anonymous'
  );

  insert into intake.survey_submissions (
    id,
    data_subject_id,
    survey_type,
    schema_version,
    locale,
    notice_version_id,
    payload_hash,
    command_fingerprint
  ) values (
    submission_id,
    subject_id,
    'search_benchmark',
    1,
    'tr',
    notice_id,
    extensions.digest('b12-payload-' || p_index, 'sha256'),
    extensions.digest('b12-command-' || p_index, 'sha256')
  );

  insert into intake.search_episodes (
    id,
    submission_id,
    role_id,
    sector_id,
    role_level,
    experience_band,
    target_region,
    employment_type,
    work_mode,
    started_month,
    ended_month,
    status,
    currently_employed,
    counts_are_estimated,
    observed_through
  ) values (
    episode_id,
    submission_id,
    'b8000000-0000-4000-8200-000000000002',
    1001,
    'mid',
    '3-5',
    'turkiye',
    'full_time',
    'hybrid',
    coalesce(
      p_started_month,
      (date_trunc('month', current_date) - interval '2 months')::date
    ),
    date_trunc('month', current_date)::date,
    'offer_accepted',
    false,
    false,
    current_date
  );

  insert into intake.episode_funnel_totals (
    episode_id,
    applications_count,
    human_responses_count,
    any_interviews_count,
    hr_interviews_count,
    technical_interviews_count,
    offers_count,
    accepted_offers_count,
    employment_started_count
  ) values (
    episode_id,
    9 + p_index,
    5,
    3,
    2,
    1,
    1,
    1,
    0
  );
end;
$$;

select pg_temp.seed_b12_search(
  seed.index,
  (date_trunc('month', current_date) - interval '13 months')::date
)
from generate_series(1, 9) as seed(index);

select extensions.results_eq(
  $query$
    select
      (report #>> '{meta,recordCount}')::integer,
      (report #>> '{meta,uniqueCandidates}')::integer,
      jsonb_array_length(report -> 'roleMonthly')
    from (
      select api.get_public_benchmark_report_v1(10, 6) as report
    ) as result
  $query$,
  $$values (0, 0, 0)$$,
  'nine contributors remain fully suppressed'
);

select pg_temp.seed_b12_search(
  10,
  (date_trunc('month', current_date) - interval '13 months')::date
);

select extensions.results_eq(
  $query$
    select
      report #>> '{meta,status}',
      (report #>> '{meta,recordCount}')::integer,
      (report #>> '{meta,uniqueCandidates}')::integer
    from (
      select api.get_public_benchmark_report_v1(10, 6) as report
    ) as result
  $query$,
  $$values ('live'::text, 10, 10)$$,
  'a recently completed long-running search remains visible at exactly ten contributors'
);
select extensions.is(
  jsonb_array_length(
    api.get_public_benchmark_report_v1(10, 6) -> 'roleMonthly'
  ),
  1,
  'one eligible role cohort is published'
);
select extensions.results_eq(
  $query$
    select
      row ->> 'roleFamily',
      row ->> 'roleSpecialization',
      row ->> 'seniority',
      (row ->> 'uniqueCandidates')::integer,
      (row ->> 'responsesCount')::integer,
      jsonb_array_length(row -> 'monthlyApplications')
    from jsonb_array_elements(
      api.get_public_benchmark_report_v1(10, 6) -> 'roleMonthly'
    ) as row
  $query$,
  $$values (
    'software'::text,
    'frontend_development'::text,
    'mid'::text,
    10,
    50,
    6
  )$$,
  'the role DTO contains only aggregate cohort values'
);
select extensions.is(
  (
    select sum((month ->> 'count')::numeric)
    from jsonb_array_elements(
      api.get_public_benchmark_report_v1(10, 6)
        #> '{roleMonthly,0,monthlyApplications}'
    ) as month
  ),
  60::numeric,
  'a completed long-running search contributes normalized monthly activity across its visible months'
);
select extensions.results_eq(
  $query$
    select
      (row ->> 'applicationsCount')::integer,
      (row ->> 'monthlyAverageApplications')::numeric
    from jsonb_array_elements(
      api.get_public_benchmark_report_v1(10, 6) -> 'roleMonthly'
    ) as row
  $query$,
  $$values (145, 1.0::numeric)$$,
  'role rows expose total applications and the duration-normalized monthly pace'
);
select extensions.is(
  jsonb_array_length(
    api.get_public_benchmark_report_v1(10, 6)
      #> '{activityTiming,candidateTempo,rows}'
  ),
  1,
  'the eligible search cohort contributes to the tempo report'
);
select extensions.ok(
  api.get_public_benchmark_report_v1(10, 6)::text
    !~* '(free.?note|data.?subject|submission.?id|email)',
  'the serialized public DTO contains no raw-note or respondent keys'
);
select extensions.is(
  jsonb_array_length(
    api.get_public_benchmark_report_v1(10, 6) -> 'companyFunnel'
  ),
  0,
  'uncorroborated raw company names are never published'
);

select * from extensions.finish();

rollback;
