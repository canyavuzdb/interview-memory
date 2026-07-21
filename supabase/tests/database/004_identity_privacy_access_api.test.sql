begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(20);

delete from privacy.notice_versions
where id in (
  'b8000000-0000-4000-8300-000000000001',
  'b8000000-0000-4000-8300-000000000002'
);

insert into auth.users (id, email, created_at, updated_at)
values (
  '60000000-0000-4000-8000-000000000001',
  'consent-actor@example.test',
  now(),
  now()
);

insert into privacy.notice_versions (
  id,
  document_type,
  locale,
  version,
  content_sha256,
  content_uri,
  effective_from
)
values (
  '70000000-0000-4000-8000-000000000001',
  'survey_notice',
  'tr',
  'current-v1',
  decode(repeat('ab', 32), 'hex'),
  '/privacy/survey/current-v1.tr.md',
  now() - interval '1 day'
);

select extensions.ok(
  not has_schema_privilege('anon', 'core', 'USAGE'),
  'anon has no core schema usage'
);
select extensions.ok(
  not has_schema_privilege('authenticated', 'privacy', 'USAGE'),
  'authenticated has no privacy schema usage'
);
select extensions.ok(
  not has_table_privilege(
    'service_role',
    'privacy.consent_events',
    'INSERT'
  ),
  'service_role has no direct consent-table insert privilege'
);

set local role anon;

select extensions.results_eq(
  $query$
    select version
    from api.get_current_notice_v1('survey_notice', 'tr')
  $query$,
  array['current-v1'::text],
  'anon reads only the current notice through the API RPC'
);

select extensions.throws_ok(
  $query$
    select count(*) from core.user_profiles
  $query$,
  '42501',
  null,
  'anon cannot read raw profiles'
);

select extensions.throws_ok(
  $query$
    select *
    from api.record_authenticated_consent_v1(
      '60000000-0000-4000-8000-000000000001',
      '70000000-0000-4000-8000-000000000001',
      'survey_contribution',
      'granted',
      'survey',
      decode(repeat('cd', 32), 'hex'),
      1::smallint,
      '80000000-0000-4000-8000-000000000001'
    )
  $query$,
  '42501',
  null,
  'anon cannot execute the server-only consent RPC'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '60000000-0000-4000-8000-000000000001',
  true
);
select set_config('request.jwt.claim.role', 'authenticated', true);

select extensions.throws_ok(
  $query$
    select count(*) from core.user_profiles
  $query$,
  '42501',
  null,
  'authenticated callers cannot read raw profiles'
);

select extensions.throws_ok(
  $query$
    insert into "authorization".user_role_assignments (
      user_id,
      role_code,
      subject_audit_principal,
      reason_code
    )
    values (
      '60000000-0000-4000-8000-000000000001',
      'role_admin',
      decode(repeat('ef', 32), 'hex'),
      'initial_bootstrap'
    )
  $query$,
  '42501',
  null,
  'authenticated users cannot assign roles'
);

select extensions.throws_ok(
  $query$
    select *
    from api.record_authenticated_consent_v1(
      '60000000-0000-4000-8000-000000000001',
      '70000000-0000-4000-8000-000000000001',
      'survey_contribution',
      'granted',
      'survey',
      decode(repeat('cd', 32), 'hex'),
      1::smallint,
      '80000000-0000-4000-8000-000000000001'
    )
  $query$,
  '42501',
  null,
  'authenticated callers cannot bypass the server consent boundary'
);

reset role;
set local role service_role;

select extensions.results_eq(
  $query$
    select replayed
    from api.record_authenticated_consent_v1(
      '60000000-0000-4000-8000-000000000001',
      '70000000-0000-4000-8000-000000000001',
      'survey_contribution',
      'granted',
      'survey',
      decode(repeat('cd', 32), 'hex'),
      1::smallint,
      '80000000-0000-4000-8000-000000000001'
    )
  $query$,
  array[false],
  'service_role can execute the narrow consent command'
);

select extensions.results_eq(
  $query$
    select replayed
    from api.record_authenticated_consent_v1(
      '60000000-0000-4000-8000-000000000001',
      '70000000-0000-4000-8000-000000000001',
      'survey_contribution',
      'granted',
      'survey',
      decode(repeat('cd', 32), 'hex'),
      1::smallint,
      '80000000-0000-4000-8000-000000000001'
    )
  $query$,
  array[true],
  'an exact retry returns the existing consent event'
);

select extensions.throws_ok(
  $query$
    select *
    from api.record_authenticated_consent_v1(
      '60000000-0000-4000-8000-000000000001',
      '70000000-0000-4000-8000-000000000001',
      'survey_contribution',
      'denied',
      'survey',
      decode(repeat('cd', 32), 'hex'),
      1::smallint,
      '80000000-0000-4000-8000-000000000001'
    )
  $query$,
  '22023',
  'idempotency_key_reused',
  'reusing an idempotency key for another decision is rejected'
);

select extensions.throws_ok(
  $query$
    insert into privacy.consent_events (
      data_subject_id,
      subject_proof_hmac,
      subject_proof_key_version,
      notice_version_id,
      purpose_code,
      decision,
      event_source,
      idempotency_key,
      occurred_at
    )
    values (
      null,
      decode(repeat('aa', 32), 'hex'),
      1,
      '70000000-0000-4000-8000-000000000001',
      'survey_contribution',
      'granted',
      'survey',
      '80000000-0000-4000-8000-000000000002',
      now()
    )
  $query$,
  '42501',
  null,
  'service_role cannot insert raw consent rows'
);

reset role;

select extensions.is(
  (
    select count(*)::integer
    from privacy.consent_events
    where idempotency_key =
      '80000000-0000-4000-8000-000000000001'
  ),
  1,
  'idempotent retries persist exactly one event'
);

select extensions.ok(
  exists (
    select 1
    from privacy.consent_events
    where idempotency_key =
      '80000000-0000-4000-8000-000000000001'
      and occurred_at = created_at
      and occurred_at between transaction_timestamp() and clock_timestamp()
  ),
  'the database owns one consistent consent event timestamp'
);

set local role service_role;

select extensions.throws_ok(
  $query$
    select *
    from api.record_authenticated_consent_v1(
      '60000000-0000-4000-8000-000000000001',
      '70000000-0000-4000-8000-000000000001',
      'account_service',
      'granted',
      'account',
      decode(repeat('cd', 32), 'hex'),
      1::smallint,
      '80000000-0000-4000-8000-000000000003'
    )
  $query$,
  '22023',
  'notice_purpose_mismatch',
  'a notice cannot evidence an unrelated consent purpose'
);

select extensions.throws_ok(
  $query$
    select *
    from api.record_authenticated_consent_v1(
      '60000000-0000-4000-8000-000000000001',
      '70000000-0000-4000-8000-000000000001',
      'survey_contribution',
      'withdrawn',
      'survey',
      decode(repeat('cd', 32), 'hex'),
      1::smallint,
      '80000000-0000-4000-8000-000000000004'
    )
  $query$,
  '22023',
  'consent_decision_invalid',
  'withdrawal requires its own future lifecycle command'
);

reset role;

select extensions.throws_ok(
  $query$
    delete from privacy.notice_versions
    where id = '70000000-0000-4000-8000-000000000001'
  $query$,
  '23503',
  null,
  'a notice referenced by consent evidence cannot be deleted'
);

select extensions.is(
  (
    select count(*)::integer
    from information_schema.routine_privileges
    where grantee = 'PUBLIC'
      and routine_schema = 'api'
      and routine_name = 'record_authenticated_consent_v1'
  ),
  0,
  'PUBLIC has no consent command privilege'
);

select extensions.ok(
  has_function_privilege(
    'authenticated',
    'api.get_current_notice_v1(text,text)',
    'EXECUTE'
  ),
  'authenticated users may read current notices'
);

select * from extensions.finish();

rollback;
