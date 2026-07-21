begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(34);

select extensions.has_schema('security', 'private security schema exists');
select extensions.has_table(
  'security',
  'submission_quota_buckets',
  'T07 quota buckets exist'
);
select extensions.has_table(
  'security',
  'api_idempotency_records',
  'T08 idempotency records exist'
);
select extensions.hasnt_table(
  'security',
  'request_signals',
  'conditional T09 is not created without measured need'
);

select extensions.ok(
  (
    select relation.relrowsecurity and relation.relforcerowsecurity
    from pg_class as relation
    inner join pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'security'
      and relation.relname = 'submission_quota_buckets'
  ),
  'quota buckets enforce RLS'
);

select extensions.ok(
  (
    select relation.relrowsecurity and relation.relforcerowsecurity
    from pg_class as relation
    inner join pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'security'
      and relation.relname = 'api_idempotency_records'
  ),
  'idempotency records enforce RLS'
);

select extensions.ok(
  not has_schema_privilege('anon', 'security', 'USAGE')
  and not has_schema_privilege('authenticated', 'security', 'USAGE')
  and not has_schema_privilege('service_role', 'security', 'USAGE'),
  'application roles cannot access the private security schema'
);

select extensions.ok(
  not exists (
    select 1
    from information_schema.columns
    where table_schema = 'security'
      and column_name ~ '(^|_)(raw_ip|ip_address|user_agent|token|cookie)($|_)'
  ),
  'security tables contain no raw IP, user-agent, token, or cookie columns'
);

select extensions.ok(
  has_function_privilege(
    'service_role',
    'api.resolve_anonymous_subject_v1(bytea,smallint,bytea,smallint)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'anon',
    'api.resolve_anonymous_subject_v1(bytea,smallint,bytea,smallint)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'authenticated',
    'api.resolve_anonymous_subject_v1(bytea,smallint,bytea,smallint)',
    'EXECUTE'
  ),
  'anonymous subject resolution is server-only'
);

select extensions.ok(
  has_function_privilege(
    'service_role',
    'api.consume_submission_quota_v1(text,text,bytea,timestamptz,text,integer,text,text,bytea,timestamptz)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'anon',
    'api.consume_submission_quota_v1(text,text,bytea,timestamptz,text,integer,text,text,bytea,timestamptz)',
    'EXECUTE'
  ),
  'quota consumption is server-only'
);

select extensions.ok(
  has_function_privilege(
    'service_role',
    'api.claim_idempotency_v1(text,bytea,text,bytea,bytea,timestamptz)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'anon',
    'api.claim_idempotency_v1(text,bytea,text,bytea,bytea,timestamptz)',
    'EXECUTE'
  ),
  'idempotency claims are server-only'
);

create temporary table first_subject as
select *
from api.resolve_anonymous_subject_v1(
  decode(repeat('11', 32), 'hex'),
  2::smallint,
  null,
  null
);

select extensions.results_eq(
  'select created, key_rotated from first_subject',
  $expected$ values (true, false) $expected$,
  'a new respondent HMAC creates one anonymous subject'
);

create temporary table replayed_subject as
select *
from api.resolve_anonymous_subject_v1(
  decode(repeat('11', 32), 'hex'),
  2::smallint,
  null,
  null
);

select extensions.ok(
  (
    select first_subject.data_subject_id = replayed_subject.data_subject_id
      and not replayed_subject.created
      and not replayed_subject.key_rotated
    from first_subject
    cross join replayed_subject
  ),
  'the same respondent HMAC resolves idempotently'
);

create temporary table legacy_subject as
select *
from api.resolve_anonymous_subject_v1(
  decode(repeat('22', 32), 'hex'),
  1::smallint,
  null,
  null
);

create temporary table rotated_subject as
select *
from api.resolve_anonymous_subject_v1(
  decode(repeat('33', 32), 'hex'),
  2::smallint,
  decode(repeat('22', 32), 'hex'),
  1::smallint
);

select extensions.ok(
  (
    select legacy_subject.data_subject_id = rotated_subject.data_subject_id
      and not rotated_subject.created
      and rotated_subject.key_rotated
    from legacy_subject
    cross join rotated_subject
  ),
  'previous-key lookup rotates in place without changing data subject identity'
);

select extensions.results_eq(
  $query$
    select encode(anonymous_key_hmac, 'hex'), anonymous_key_version
    from core.data_subjects
    where id = (select data_subject_id from rotated_subject)
  $query$,
  $expected$
    values (repeat('33', 32), 2::smallint)
  $expected$,
  'rotation persists only the active HMAC and version'
);

select extensions.throws_ok(
  $query$
    select * from api.resolve_anonymous_subject_v1(
      decode('11', 'hex'),
      2::smallint,
      null,
      null
    )
  $query$,
  '22023',
  'active_respondent_hmac_invalid',
  'respondent HMAC must be exactly 32 bytes'
);

create temporary table quota_results (
  sequence integer generated always as identity,
  allowed boolean,
  current_count integer,
  remaining integer
);

insert into quota_results (allowed, current_count, remaining)
select * from api.consume_submission_quota_v1(
  'experience.repeatable',
  'data_subject',
  decode(repeat('44', 32), 'hex'),
  date_trunc('day', statement_timestamp()),
  'accepted_24h',
  3,
  'accepted',
  '2026-07-21.v1',
  decode(repeat('55', 32), 'hex'),
  date_trunc('day', statement_timestamp()) + interval '1 day'
);

insert into quota_results (allowed, current_count, remaining)
select * from api.consume_submission_quota_v1(
  'experience.repeatable', 'data_subject',
  decode(repeat('44', 32), 'hex'),
  date_trunc('day', statement_timestamp()), 'accepted_24h', 3, 'accepted',
  '2026-07-21.v1', decode(repeat('55', 32), 'hex'),
  date_trunc('day', statement_timestamp()) + interval '1 day'
);

insert into quota_results (allowed, current_count, remaining)
select * from api.consume_submission_quota_v1(
  'experience.repeatable', 'data_subject',
  decode(repeat('44', 32), 'hex'),
  date_trunc('day', statement_timestamp()), 'accepted_24h', 3, 'accepted',
  '2026-07-21.v1', decode(repeat('55', 32), 'hex'),
  date_trunc('day', statement_timestamp()) + interval '1 day'
);

insert into quota_results (allowed, current_count, remaining)
select * from api.consume_submission_quota_v1(
  'experience.repeatable', 'data_subject',
  decode(repeat('44', 32), 'hex'),
  date_trunc('day', statement_timestamp()), 'accepted_24h', 3, 'accepted',
  '2026-07-21.v1', decode(repeat('55', 32), 'hex'),
  date_trunc('day', statement_timestamp()) + interval '1 day'
);

select extensions.results_eq(
  'select allowed from quota_results order by sequence',
  array[true, true, true, false],
  'quota consumption permits exactly the configured count'
);

select extensions.results_eq(
  $query$
    select accepted_count
    from security.submission_quota_buckets
    where subject_hmac = decode(repeat('44', 32), 'hex')
  $query$,
  array[3],
  'denied quota attempts cannot increment beyond the limit'
);

select extensions.throws_ok(
  $query$
    select * from api.consume_submission_quota_v1(
      'experience.repeatable', 'data_subject',
      decode(repeat('44', 32), 'hex'),
      date_trunc('day', statement_timestamp()), 'accepted_24h', 3, 'accepted',
      'different-policy', decode(repeat('66', 32), 'hex'),
      date_trunc('day', statement_timestamp()) + interval '1 day'
    )
  $query$,
  '22023',
  'quota_policy_mismatch',
  'an existing quota bucket cannot silently change policy'
);

create temporary table first_claim as
select * from api.claim_idempotency_v1(
  'data_subject',
  decode(repeat('77', 32), 'hex'),
  'search.submit',
  decode(repeat('88', 32), 'hex'),
  decode(repeat('99', 32), 'hex'),
  statement_timestamp() + interval '1 day'
);

select extensions.results_eq(
  'select outcome, record_status from first_claim',
  $expected$ values ('claimed'::text, 'processing'::text) $expected$,
  'first idempotency request claims processing ownership'
);

select extensions.results_eq(
  $query$
    select outcome from api.claim_idempotency_v1(
      'data_subject', decode(repeat('77', 32), 'hex'), 'search.submit',
      decode(repeat('88', 32), 'hex'), decode(repeat('99', 32), 'hex'),
      statement_timestamp() + interval '1 day'
    )
  $query$,
  array['in_progress'::text],
  'same in-flight request reports in-progress'
);

select extensions.results_eq(
  $query$
    select outcome from api.claim_idempotency_v1(
      'data_subject', decode(repeat('77', 32), 'hex'), 'search.submit',
      decode(repeat('88', 32), 'hex'), decode(repeat('aa', 32), 'hex'),
      statement_timestamp() + interval '1 day'
    )
  $query$,
  array['conflict'::text],
  'same idempotency key with another payload conflicts'
);

select extensions.is(
  api.complete_idempotency_v1(
    'data_subject', decode(repeat('77', 32), 'hex'), 'search.submit',
    decode(repeat('88', 32), 'hex'), decode(repeat('99', 32), 'hex'),
    'search_episode', 'b6000000-0000-4000-8000-000000000001', 201::smallint
  ),
  true,
  'processing claim can be completed once'
);

select extensions.results_eq(
  $query$
    select outcome, resource_type, resource_id, response_code
    from api.claim_idempotency_v1(
      'data_subject', decode(repeat('77', 32), 'hex'), 'search.submit',
      decode(repeat('88', 32), 'hex'), decode(repeat('99', 32), 'hex'),
      statement_timestamp() + interval '1 day'
    )
  $query$,
  $expected$
    values (
      'replay'::text,
      'search_episode'::text,
      'b6000000-0000-4000-8000-000000000001'::uuid,
      201::smallint
    )
  $expected$,
  'completed idempotency claim returns its bounded replay result'
);

select extensions.throws_ok(
  $query$
    select api.complete_idempotency_v1(
      'data_subject', decode(repeat('77', 32), 'hex'), 'search.submit',
      decode(repeat('88', 32), 'hex'), decode(repeat('99', 32), 'hex'),
      'search_episode', 'b6000000-0000-4000-8000-000000000001', 201::smallint
    )
  $query$,
  '55000',
  'idempotency_completion_invalid',
  'completed claim cannot be completed twice'
);

select * from api.claim_idempotency_v1(
  'data_subject', decode(repeat('ab', 32), 'hex'), 'company.submit',
  decode(repeat('bc', 32), 'hex'), decode(repeat('cd', 32), 'hex'),
  statement_timestamp() + interval '1 day'
);

select extensions.is(
  api.fail_idempotency_v1(
    'data_subject', decode(repeat('ab', 32), 'hex'), 'company.submit',
    decode(repeat('bc', 32), 'hex'), decode(repeat('cd', 32), 'hex'),
    503::smallint
  ),
  true,
  'processing claim can be marked failed'
);

select extensions.results_eq(
  $query$
    select outcome from api.claim_idempotency_v1(
      'data_subject', decode(repeat('ab', 32), 'hex'), 'company.submit',
      decode(repeat('bc', 32), 'hex'), decode(repeat('cd', 32), 'hex'),
      statement_timestamp() + interval '1 day'
    )
  $query$,
  array['claimed'::text],
  'same-payload retry can reclaim a failed record'
);

insert into security.api_idempotency_records (
  subject_type,
  subject_hmac,
  operation_code,
  idempotency_key_hmac,
  request_fingerprint,
  created_at,
  expires_at
)
values (
  'data_subject',
  decode(repeat('de', 32), 'hex'),
  'expired.command',
  decode(repeat('ef', 32), 'hex'),
  decode(repeat('fa', 32), 'hex'),
  statement_timestamp() - interval '2 days',
  statement_timestamp() - interval '1 day'
);

select extensions.results_eq(
  'select idempotency_rows_deleted from api.cleanup_security_ephemera_v1(100)',
  array[1],
  'bounded cleanup deletes expired idempotency state'
);

select extensions.throws_ok(
  $query$
    insert into security.submission_quota_buckets (
      scope, subject_type, subject_hmac, window_start, window_kind,
      policy_version, policy_hash, expires_at
    ) values (
      'invalid', 'data_subject', decode('aa', 'hex'), statement_timestamp(),
      'accepted_24h', 'v1', decode(repeat('bb', 32), 'hex'),
      statement_timestamp() + interval '1 day'
    )
  $query$,
  '23514',
  null,
  'quota subject HMAC constraint rejects short values'
);

select extensions.throws_ok(
  $query$
    insert into security.api_idempotency_records (
      subject_type, subject_hmac, operation_code, idempotency_key_hmac,
      request_fingerprint, status, expires_at
    ) values (
      'data_subject', decode(repeat('11', 32), 'hex'), 'invalid.complete',
      decode(repeat('22', 32), 'hex'), decode(repeat('33', 32), 'hex'),
      'completed', statement_timestamp() + interval '1 day'
    )
  $query$,
  '23514',
  null,
  'completed idempotency rows require a bounded replay result'
);

set local role anon;

select extensions.throws_ok(
  'select count(*) from security.submission_quota_buckets',
  '42501',
  null,
  'anon cannot read quota state'
);

select extensions.throws_ok(
  $query$
    select * from api.claim_idempotency_v1(
      'data_subject', decode(repeat('11', 32), 'hex'), 'denied.command',
      decode(repeat('22', 32), 'hex'), decode(repeat('33', 32), 'hex'),
      statement_timestamp() + interval '1 day'
    )
  $query$,
  '42501',
  null,
  'anon cannot invoke idempotency commands'
);

reset role;

select extensions.ok(
  not exists (
    select 1
    from information_schema.role_table_grants
    where table_schema = 'security'
      and grantee in ('anon', 'authenticated', 'service_role')
  ),
  'private security tables have no application-role table grants'
);

select extensions.ok(
  (
    select count(*) = 2
    from core.data_subjects
    where anonymous_key_hmac in (
      decode(repeat('11', 32), 'hex'),
      decode(repeat('33', 32), 'hex')
    )
  ),
  'respondent creation and rotation leave no duplicate subject'
);

select * from extensions.finish();

rollback;
