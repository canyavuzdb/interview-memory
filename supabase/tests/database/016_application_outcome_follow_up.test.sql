begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(16);

select extensions.has_table('intake', 'job_applications', 'B10 application table exists');
select extensions.has_table('intake', 'application_stage_events', 'B10 stage timeline exists');
select extensions.has_table('intake', 'application_outcome_events', 'B10 outcome timeline exists');
select extensions.has_table('intake', 'application_offers', 'B10 offer table exists');
select extensions.has_table('intake', 'employment_outcomes', 'B10 employment follow-up exists');
select extensions.ok((
  select bool_and(relation.relrowsecurity and relation.relforcerowsecurity)
  from pg_class as relation
  join pg_namespace as namespace on namespace.oid = relation.relnamespace
  where namespace.nspname = 'intake'
    and relation.relname in (
      'job_applications', 'application_stage_events',
      'application_outcome_events', 'application_offers',
      'employment_outcomes'
    )
), 'all B10 private tables force RLS');
select extensions.ok(
  not has_table_privilege('anon', 'intake.job_applications', 'SELECT')
  and not has_table_privilege('authenticated', 'intake.application_outcome_events', 'SELECT')
  and not has_table_privilege('service_role', 'intake.employment_outcomes', 'SELECT'),
  'application roles cannot read private B10 facts directly'
);
select extensions.ok(
  has_function_privilege(
    'service_role',
    'api.get_company_application_create_result_v1(uuid,uuid)',
    'EXECUTE'
  )
  and has_function_privilege(
    'service_role',
    'api.get_application_outcome_result_v1(uuid,uuid,bytea,smallint,bytea,smallint)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'anon',
    'api.get_application_outcome_result_v1(uuid,uuid,bytea,smallint,bytea,smallint)',
    'EXECUTE'
  ),
  'B10 replay APIs are server-only'
);

create temporary table b10_subject as
select * from api.resolve_anonymous_subject_v1(
  decode(repeat('b1', 32), 'hex'), 1::smallint, null, null
);

select * from api.claim_idempotency_v1(
  'data_subject', decode(repeat('b2', 32), 'hex'),
  'survey.company-experience.create', decode(repeat('b3', 32), 'hex'),
  decode(repeat('b4', 32), 'hex'), now() + interval '1 day'
);

create temporary table b10_created as
select * from api.create_company_experience_with_application_v1(
  (select data_subject_id from b10_subject), 1, 'tr',
  'b9000000-0000-4000-8300-000000000001',
  decode(repeat('b5', 32), 'hex'), decode(repeat('b4', 32), 'hex'), null,
  decode(repeat('b6', 32), 'hex'), 1::smallint, now() + interval '30 days',
  decode(repeat('b7', 32), 'hex'), 1::smallint,
  'b1000000-0000-4000-8800-000000000001',
  decode(repeat('b2', 32), 'hex'), decode(repeat('b3', 32), 'hex'),
  decode(repeat('b4', 32), 'hex'), decode(repeat('b8', 32), 'hex'),
  date_trunc('day', now()), 3, date_trunc('day', now()) + interval '1 day',
  date_trunc('month', now()), 10, date_trunc('month', now()) + interval '30 days',
  '2026-07-21.v1', decode(repeat('b9', 32), 'hex'),
  'B10 Example Corp', 'Backend Developer',
  extract(year from current_date)::smallint,
  'yes', 5::smallint, 8::smallint, false, null, 4::smallint,
  false, array[]::text[], 'yes_generic', 3::smallint, 4::smallint,
  4::smallint, 'yes', null,
  date_trunc('month', current_date)::date, 'company_site', false,
  'offer', 'offer_received', date_trunc('month', current_date)::date, null
);

select extensions.is(
  (select count(*)::integer from b10_created),
  1,
  'B10 wrapper returns one durable application result'
);
select extensions.results_eq(
  $$select application_channel, had_referral from intake.job_applications$$,
  $$values ('company_site'::text, false)$$,
  'application context is stored once'
);
select extensions.is(
  (select count(*)::integer from intake.application_stage_events),
  5,
  'initial stage history reaches the reported offer stage'
);
select extensions.results_eq(
  $$select outcome_code, sequence_no from intake.application_outcome_events$$,
  $$values ('offer_received'::text, 1)$$,
  'initial outcome is appended as sequence one'
);

select * from api.claim_idempotency_v1(
  'capability', decode(repeat('c1', 32), 'hex'),
  'application.outcome.append', decode(repeat('c2', 32), 'hex'),
  decode(repeat('c3', 32), 'hex'), now() + interval '1 day'
);

create temporary table b10_follow_up as
select * from api.append_application_outcome_v1(
  (select job_application_id from b10_created),
  null, decode(repeat('b6', 32), 'hex'), 1::smallint, null, null,
  'capability', decode(repeat('c1', 32), 'hex'),
  decode(repeat('c2', 32), 'hex'), decode(repeat('c3', 32), 'hex'),
  'offer_accepted', date_trunc('month', current_date)::date,
  (date_trunc('month', current_date) + interval '1 month')::date
);

select extensions.results_eq(
  $$select outcome_code, sequence_no from intake.application_outcome_events order by sequence_no$$,
  $$values ('offer_received'::text, 1), ('offer_accepted'::text, 2)$$,
  'authorized follow-up appends the next outcome'
);
select extensions.results_eq(
  $$select status, planned_start_month is not null from intake.employment_outcomes$$,
  $$values ('accepted'::text, true)$$,
  'accepted offer creates the employment follow-up snapshot'
);
select extensions.is((
  select count(*)::integer
  from api.get_application_outcome_result_v1(
    (select outcome_event_id from b10_follow_up),
    null, decode(repeat('b6', 32), 'hex'), 1::smallint, null, null
  )
), 1, 'submission capability can replay its own outcome update');
select extensions.throws_ok(
  format(
    $sql$
      select * from api.append_application_outcome_v1(
        %L::uuid, %L::uuid, null, null, null, null,
        'data_subject', decode(repeat('d1', 32), 'hex'),
        decode(repeat('d2', 32), 'hex'), decode(repeat('d3', 32), 'hex'),
        'manual_rejection', date_trunc('month', current_date)::date, null
      )
    $sql$,
    (select job_application_id from b10_created),
    (select data_subject_id from b10_subject)
  ),
  '55000',
  'idempotency_claim_required',
  'follow-up requires a matching idempotency claim'
);

select * from extensions.finish();
rollback;
