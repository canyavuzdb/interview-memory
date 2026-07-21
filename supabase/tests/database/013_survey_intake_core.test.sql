begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(31);

select extensions.has_schema('intake', 'private intake schema exists');
select extensions.has_table(
  'intake',
  'survey_submissions',
  'T23 survey submission envelope exists'
);
select extensions.ok(
  (
    select relation.relrowsecurity and relation.relforcerowsecurity
    from pg_class as relation
    inner join pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'intake'
      and relation.relname = 'survey_submissions'
  ),
  'T23 forces RLS'
);
select extensions.ok(
  not has_schema_privilege('anon', 'intake', 'USAGE')
  and not has_schema_privilege('authenticated', 'intake', 'USAGE')
  and not has_schema_privilege('service_role', 'intake', 'USAGE'),
  'application roles cannot access intake tables directly'
);
select extensions.ok(
  not has_function_privilege(
    'service_role',
    'intake.begin_survey_submission_v1(uuid,text,integer,text,uuid,bytea,bytea,uuid,bytea,smallint,timestamptz,bytea,smallint,uuid,bytea,text,bytea,bytea,text,bytea,timestamptz,text,integer,text,bytea,timestamptz)',
    'EXECUTE'
  ),
  'internal begin primitive is not directly callable by application roles'
);
select extensions.ok(
  has_function_privilege(
    'service_role',
    'api.get_submission_receipt_v1(uuid,uuid,bytea,smallint,bytea,smallint)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'anon',
    'api.get_submission_receipt_v1(uuid,uuid,bytea,smallint,bytea,smallint)',
    'EXECUTE'
  ),
  'receipt lookup is server-only'
);
select extensions.ok(
  security.constant_time_equal_v1(
    decode(repeat('aa', 32), 'hex'),
    decode(repeat('aa', 32), 'hex')
  )
  and not security.constant_time_equal_v1(
    decode(repeat('aa', 32), 'hex'),
    decode(repeat('ab', 32), 'hex')
  ),
  'capability comparison checks every byte and distinguishes unequal values'
);
select extensions.ok(
  not has_function_privilege(
    'service_role',
    'security.constant_time_equal_v1(bytea,bytea)',
    'EXECUTE'
  ),
  'constant-time comparison remains an internal primitive'
);
select extensions.ok(
  not exists (
    select 1
    from information_schema.columns
    where table_schema = 'intake'
      and column_name ~ '(^|_)(raw_ip|ip_address|user_agent|plain_token|request_body)($|_)'
  ),
  'T23 stores no raw network identifier, capability, or request body'
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
  'b7000000-0000-4000-8000-000000000001',
  'survey_notice',
  'tr',
  'b07-v1',
  decode(repeat('71', 32), 'hex'),
  'https://example.test/notices/survey/b07-v1',
  now() - interval '1 day'
);

create temporary table anonymous_subject as
select * from api.resolve_anonymous_subject_v1(
  decode(repeat('11', 32), 'hex'),
  1::smallint,
  null,
  null
);

select * from api.claim_idempotency_v1(
  'data_subject',
  decode(repeat('21', 32), 'hex'),
  'survey.search-benchmark.create',
  decode(repeat('22', 32), 'hex'),
  decode(repeat('23', 32), 'hex'),
  now() + interval '1 hour'
);

create temporary table created_submission as
select * from intake.begin_survey_submission_v1(
  (select data_subject_id from anonymous_subject),
  'search_benchmark',
  1,
  'tr',
  'b7000000-0000-4000-8000-000000000001',
  decode(repeat('24', 32), 'hex'),
  decode(repeat('25', 32), 'hex'),
  null,
  decode(repeat('31', 32), 'hex'),
  1::smallint,
  now() + interval '30 days',
  decode(repeat('26', 32), 'hex'),
  1::smallint,
  'b7000000-0000-4000-8000-000000000002',
  decode(repeat('21', 32), 'hex'),
  'survey.search-benchmark.create',
  decode(repeat('22', 32), 'hex'),
  decode(repeat('23', 32), 'hex'),
  'survey.single-response',
  decode(repeat('41', 32), 'hex'),
  date_trunc('day', now()),
  'accepted_period',
  1,
  '2026-07-21.v1',
  decode(repeat('42', 32), 'hex'),
  date_trunc('day', now()) + interval '30 days'
);

select extensions.is(
  (select count(*)::integer from created_submission),
  1,
  'begin primitive creates one submission result'
);
select extensions.is(
  (select count(*)::integer from intake.survey_submissions),
  1,
  'one durable envelope is inserted'
);
select extensions.is(
  (
    select count(*)::integer from privacy.consent_events
    where submission_id = (select submission_id from created_submission)
      and purpose_code = 'survey_contribution'
      and decision = 'granted'
  ),
  1,
  'submission consent evidence is linked atomically'
);
select extensions.is(
  (
    select accepted_count from security.submission_quota_buckets
    where scope = 'survey.single-response'
      and subject_hmac = decode(repeat('41', 32), 'hex')
  ),
  1,
  'accepted quota is consumed in the submission transaction'
);
select extensions.ok(
  intake.complete_survey_submission_v1(
    decode(repeat('21', 32), 'hex'),
    'survey.search-benchmark.create',
    decode(repeat('22', 32), 'hex'),
    decode(repeat('23', 32), 'hex'),
    (select submission_id from created_submission),
    201::smallint
  ),
  'completion stores the durable submission as the idempotency result'
);
select extensions.results_eq(
  $query$
    select resource_type, resource_id, response_code
    from security.api_idempotency_records
    where idempotency_key_hmac = decode(repeat('22', 32), 'hex')
  $query$,
  $expected$
    values (
      'survey_submission'::text,
      (select submission_id from created_submission),
      201::smallint
    )
  $expected$,
  'completed idempotency record points at T23'
);
select extensions.is(
  (
    select count(*)::integer
    from api.get_submission_receipt_v1(
      (select receipt_id from created_submission),
      null,
      decode(repeat('31', 32), 'hex'),
      1::smallint,
      null,
      null
    )
  ),
  1,
  'active anonymous capability reads the minimal receipt'
);
select extensions.is(
  (
    select count(*)::integer
    from api.get_submission_receipt_v1(
      (select receipt_id from created_submission),
      null,
      decode(repeat('ff', 32), 'hex'),
      1::smallint,
      null,
      null
    )
  ),
  0,
  'invalid capability discloses no receipt row'
);
select extensions.results_eq(
  $query$
    select capability_rotated
    from api.get_submission_receipt_v1(
      (select receipt_id from created_submission),
      null,
      decode(repeat('32', 32), 'hex'),
      2::smallint,
      decode(repeat('31', 32), 'hex'),
      1::smallint
    )
  $query$,
  array[true],
  'previous capability key match rotates the stored HMAC in place'
);
select extensions.is(
  (
    select capability_key_version
    from intake.survey_submissions
    where id = (select submission_id from created_submission)
  ),
  2::smallint,
  'rotated capability version is persisted'
);

select * from api.claim_idempotency_v1(
  'data_subject',
  decode(repeat('51', 32), 'hex'),
  'survey.search-benchmark.rollback',
  decode(repeat('52', 32), 'hex'),
  decode(repeat('53', 32), 'hex'),
  now() + interval '1 hour'
);

create function pg_temp.attempt_submission_rollback()
returns void
language plpgsql
as $$
begin
  perform * from intake.begin_survey_submission_v1(
    (select data_subject_id from anonymous_subject),
    'search_benchmark', 1, 'tr',
    'b7000000-0000-4000-8000-000000000001',
    decode(repeat('54', 32), 'hex'),
    decode(repeat('55', 32), 'hex'),
    null,
    decode(repeat('56', 32), 'hex'), 1::smallint,
    now() + interval '30 days',
    decode(repeat('57', 32), 'hex'), 1::smallint,
    -- Reusing the first event key fails after quota and envelope inserts.
    'b7000000-0000-4000-8000-000000000002',
    decode(repeat('51', 32), 'hex'),
    'survey.search-benchmark.rollback',
    decode(repeat('52', 32), 'hex'),
    decode(repeat('53', 32), 'hex'),
    'survey.rollback-proof',
    decode(repeat('58', 32), 'hex'),
    date_trunc('day', now()),
    'accepted_24h', 3,
    '2026-07-21.v1',
    decode(repeat('59', 32), 'hex'),
    date_trunc('day', now()) + interval '1 day'
  );
end;
$$;

select extensions.throws_ok(
  'select pg_temp.attempt_submission_rollback()',
  '23505',
  null,
  'a child write failure aborts the entire submission command'
);
select extensions.is(
  (
    select count(*)::integer
    from security.submission_quota_buckets
    where scope = 'survey.rollback-proof'
  ) + (
    select count(*)::integer
    from intake.survey_submissions
    where command_fingerprint = decode(repeat('55', 32), 'hex')
  ),
  0,
  'failed command rolls back both accepted quota and envelope'
);

insert into auth.users (id, email, created_at, updated_at)
values (
  'b7000000-0000-4000-8000-000000000010',
  'b07-member@example.test',
  now(),
  now()
);

select extensions.results_eq(
  $query$
    select data_subject_id
    from api.resolve_authenticated_subject_v1(
      'b7000000-0000-4000-8000-000000000010'
    )
  $query$,
  $expected$
    select id from core.data_subjects
    where auth_user_id = 'b7000000-0000-4000-8000-000000000010'
  $expected$,
  'authenticated subject resolver returns only the active auth bridge'
);

select * from api.consume_submission_quota_v1(
  'experience.repeatable',
  'data_subject',
  decode(repeat('41', 32), 'hex'),
  date_trunc('day', now()),
  'accepted_24h',
  10,
  'accepted',
  '2026-07-21.v1',
  decode(repeat('42', 32), 'hex'),
  date_trunc('day', now()) + interval '1 day'
);

select extensions.results_eq(
  $query$
    select data_subject_id, merged
    from api.merge_anonymous_subject_v1(
      'b7000000-0000-4000-8000-000000000010',
      decode(repeat('11', 32), 'hex'),
      decode(repeat('10', 32), 'hex'),
      decode(repeat('41', 32), 'hex'),
      decode(repeat('43', 32), 'hex')
    )
  $query$,
  $expected$
    select id, true from core.data_subjects
    where auth_user_id = 'b7000000-0000-4000-8000-000000000010'
  $expected$,
  'anonymous subject merges into the authenticated subject once'
);
select extensions.is(
  (
    select status from core.data_subjects
    where id = (select data_subject_id from anonymous_subject)
  ),
  'merged',
  'source anonymous subject becomes a tombstone'
);
select extensions.results_eq(
  $query$
    select data_subject_id from intake.survey_submissions
    where id = (select submission_id from created_submission)
  $query$,
  $expected$
    select id from core.data_subjects
    where auth_user_id = 'b7000000-0000-4000-8000-000000000010'
  $expected$,
  'existing submission ownership moves to the authenticated subject'
);
select extensions.is(
  (
    select accepted_count from security.submission_quota_buckets
    where scope = 'experience.repeatable'
      and subject_hmac = decode(repeat('43', 32), 'hex')
  ),
  1,
  'anonymous quota history moves to the authenticated subject'
);
select extensions.is(
  (
    select count(*)::integer from security.submission_quota_buckets
    where subject_hmac = decode(repeat('41', 32), 'hex')
  ),
  0,
  'old anonymous quota pseudonym is removed after merge'
);
select extensions.results_eq(
  $query$
    select merged from api.merge_anonymous_subject_v1(
      'b7000000-0000-4000-8000-000000000010',
      decode(repeat('11', 32), 'hex'),
      decode(repeat('10', 32), 'hex'),
      decode(repeat('41', 32), 'hex'),
      decode(repeat('43', 32), 'hex')
    )
  $query$,
  array[false],
  'subject merge is retry-safe'
);
select extensions.is(
  (
    select count(*)::integer
    from api.get_submission_receipt_v1(
      (select receipt_id from created_submission),
      (
        select id from core.data_subjects
        where auth_user_id = 'b7000000-0000-4000-8000-000000000010'
      ),
      null,
      null,
      null,
      null
    )
  ),
  1,
  'authenticated owner can read the merged receipt without capability'
);

select extensions.throws_ok(
  $query$
    insert into intake.survey_submissions (
      data_subject_id, survey_type, schema_version, locale,
      notice_version_id, payload_hash, command_fingerprint
    ) values (
      (select id from core.data_subjects where auth_user_id =
        'b7000000-0000-4000-8000-000000000010'),
      'unknown', 1, 'tr', 'b7000000-0000-4000-8000-000000000001',
      decode(repeat('81', 32), 'hex'), decode(repeat('82', 32), 'hex')
    )
  $query$,
  '23514',
  null,
  'unsupported survey types are rejected by the database'
);
select extensions.throws_ok(
  $query$
    insert into intake.survey_submissions (
      data_subject_id, survey_type, schema_version, locale,
      notice_version_id, payload_hash, command_fingerprint,
      capability_hmac, capability_key_version
    ) values (
      (select id from core.data_subjects where auth_user_id =
        'b7000000-0000-4000-8000-000000000010'),
      'search_benchmark', 1, 'tr',
      'b7000000-0000-4000-8000-000000000001',
      decode(repeat('83', 32), 'hex'), decode(repeat('84', 32), 'hex'),
      decode(repeat('85', 32), 'hex'), 1
    )
  $query$,
  '23514',
  null,
  'partial capability tuples are rejected'
);

select * from extensions.finish();

rollback;
