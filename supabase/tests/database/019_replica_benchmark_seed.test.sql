begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(12);

select extensions.has_column(
  'intake',
  'survey_submissions',
  'data_origin',
  'submission origin is recorded internally'
);
select extensions.has_column(
  'intake',
  'survey_submissions',
  'source_key',
  'replica provenance is recorded internally'
);
select extensions.is(
  (
    select count(*)::integer
    from intake.survey_submissions
    where data_origin = 'research_replica'
      and survey_type = 'search_benchmark'
  ),
  36,
  '36 search benchmark replicas are seeded'
);
select extensions.is(
  (
    select count(*)::integer
    from intake.survey_submissions
    where data_origin = 'research_replica'
      and survey_type = 'company_experience'
  ),
  36,
  '36 company experience replicas are seeded'
);
select extensions.is(
  (
    select count(distinct data_subject_id)::integer
    from intake.survey_submissions
    where data_origin = 'research_replica'
  ),
  36,
  'replicas represent 36 distinct anonymous subjects'
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
  $$values ('collecting'::text, 0, 0)$$,
  'research replicas are excluded from the public benchmark report'
);
select extensions.is(
  jsonb_array_length(
    api.get_public_benchmark_report_v1(10, 6) -> 'roleMonthly'
  ),
  0,
  'replica role cohorts are not visible'
);
select extensions.is(
  jsonb_array_length(
    api.get_public_benchmark_report_v1(10, 6) -> 'companyFunnel'
  ),
  0,
  'replica company funnel cohorts are not visible'
);
select extensions.is(
  jsonb_array_length(
    api.get_public_benchmark_report_v1(10, 6)
      #> '{activityTiming,candidateTempo,rows}'
  ),
  0,
  'replica candidate tempo rows are not visible'
);
select extensions.is(
  jsonb_array_length(
    api.get_public_benchmark_report_v1(10, 6)
      #> '{activityTiming,companyResponseTempo,rows}'
  ),
  0,
  'replica company response tempo rows are not visible'
);
select extensions.is(
  jsonb_array_length(
    api.get_public_benchmark_report_v1(10, 6) -> 'companyResponsiveness'
  ),
  0,
  'replica company responsiveness cohorts are not visible'
);
select extensions.ok(
  api.get_public_benchmark_report_v1(10, 6)::text
    !~* '(research.?replica|source.?key|benchmark.?reference|data.?origin)',
  'internal replica provenance is absent from the public DTO'
);

select * from extensions.finish();

rollback;
