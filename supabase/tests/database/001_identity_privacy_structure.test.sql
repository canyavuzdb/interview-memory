begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(34);

select extensions.has_schema('api', 'api schema exists');
select extensions.has_schema(
  'authorization',
  'authorization schema exists'
);
select extensions.has_schema('core', 'core schema exists');
select extensions.has_schema('privacy', 'privacy schema exists');

select extensions.has_table(
  'core',
  'user_profiles',
  'T01 user profiles table exists'
);
select extensions.has_table(
  'authorization',
  'user_role_assignments',
  'T02 role assignments table exists'
);
select extensions.has_table(
  'core',
  'data_subjects',
  'T03 data subjects table exists'
);
select extensions.has_table(
  'privacy',
  'notice_versions',
  'T04 notice versions table exists'
);
select extensions.has_table(
  'privacy',
  'consent_events',
  'T05 consent events table exists'
);

select extensions.is(
  (
    select count(*)::integer
    from information_schema.columns
    where table_schema = 'core'
      and table_name = 'user_profiles'
  ),
  10,
  'T01 has exactly 10 columns'
);
select extensions.is(
  (
    select count(*)::integer
    from information_schema.columns
    where table_schema = 'authorization'
      and table_name = 'user_role_assignments'
  ),
  9,
  'T02 has exactly 9 columns'
);
select extensions.is(
  (
    select count(*)::integer
    from information_schema.columns
    where table_schema = 'core'
      and table_name = 'data_subjects'
  ),
  8,
  'T03 has exactly 8 columns'
);
select extensions.is(
  (
    select count(*)::integer
    from information_schema.columns
    where table_schema = 'privacy'
      and table_name = 'notice_versions'
  ),
  9,
  'T04 has exactly 9 columns'
);
select extensions.is(
  (
    select count(*)::integer
    from information_schema.columns
    where table_schema = 'privacy'
      and table_name = 'consent_events'
  ),
  12,
  'T05 has exactly 12 columns'
);

select extensions.col_type_is(
  'privacy',
  'consent_events',
  'idempotency_key',
  'uuid',
  'consent idempotency uses an opaque UUID'
);
select extensions.col_type_is(
  'privacy',
  'consent_events',
  'subject_proof_key_version',
  'smallint',
  'consent proof records its HMAC key version'
);

select extensions.is(
  (
    select count(*)::integer
    from information_schema.columns
    where table_schema in ('authorization', 'core', 'privacy')
      and lower(column_name) ~
        '(^|_)(ip|ip_hmac|user_agent|device|fingerprint)($|_)'
  ),
  0,
  'domain tables contain no IP, user-agent, device, or fingerprint columns'
);

select extensions.is(
  (
    select count(*)::integer
    from pg_proc as procedure
    join pg_namespace as namespace
      on namespace.oid = procedure.pronamespace
    where namespace.nspname in ('api', 'authorization', 'core', 'privacy')
      and lower(
        pg_get_function_identity_arguments(procedure.oid)
      ) ~ '(^|[^a-z])(ip|ip_hmac|user_agent|device|fingerprint)([^a-z]|$)'
  ),
  0,
  'application functions accept no tracking identifier arguments'
);

select extensions.is(
  (
    select count(*)::integer
    from pg_proc as procedure
    join pg_namespace as namespace
      on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'api'
      and procedure.proname = 'record_authenticated_consent_v1'
      and pg_get_function_identity_arguments(procedure.oid)
        like '%p_occurred_at%'
  ),
  0,
  'consent event time is database-owned and absent from the RPC contract'
);

select extensions.is(
  (
    select count(*)::integer
    from pg_class as relation
    join pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname in ('authorization', 'core', 'privacy')
      and relation.relkind = 'r'
      and relation.relrowsecurity
  ),
  5,
  'RLS is enabled on all five domain tables'
);

select extensions.is(
  (
    select count(*)::integer
    from pg_class as relation
    join pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname in ('authorization', 'core', 'privacy')
      and relation.relkind = 'r'
      and relation.relforcerowsecurity
  ),
  5,
  'RLS is forced on all five domain tables'
);

select extensions.is(
  (
    select count(*)::integer
    from information_schema.table_privileges
    where table_schema in ('authorization', 'core', 'privacy')
      and grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role')
  ),
  0,
  'API roles have no raw domain table privileges'
);

select extensions.is(
  (
    select count(*)::integer
    from pg_proc as procedure
    join pg_namespace as namespace
      on namespace.oid = procedure.pronamespace
    where namespace.nspname in ('api', 'core', 'privacy')
      and procedure.proname in (
        'enforce_consent_notice_purpose',
        'enforce_data_subject_lifecycle',
        'enforce_notice_version_immutability',
        'get_current_notice_v1',
        'handle_auth_user_created',
        'record_authenticated_consent_v1'
      )
      and procedure.prosecdef
  ),
  6,
  'all privileged functions are SECURITY DEFINER'
);

select extensions.is(
  (
    select count(*)::integer
    from pg_proc as procedure
    join pg_namespace as namespace
      on namespace.oid = procedure.pronamespace
    where namespace.nspname in ('api', 'core', 'privacy')
      and procedure.proname in (
        'enforce_consent_notice_purpose',
        'enforce_data_subject_lifecycle',
        'enforce_notice_version_immutability',
        'get_current_notice_v1',
        'handle_auth_user_created',
        'record_authenticated_consent_v1'
      )
      and procedure.proconfig = array['search_path=""']::text[]
  ),
  6,
  'all privileged functions use an empty fixed search_path'
);

select extensions.is(
  (
    select count(*)::integer
    from pg_constraint as constraint_record
    join pg_class as relation
      on relation.oid = constraint_record.conrelid
    join pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname in ('authorization', 'core', 'privacy')
      and constraint_record.contype = 'p'
  ),
  5,
  'all five domain tables have a primary key'
);

select extensions.has_index(
  'authorization',
  'user_role_assignments',
  'user_role_assignments_user_id_idx',
  'role-subject FK operations have a complete lookup index'
);
select extensions.has_index(
  'authorization',
  'user_role_assignments',
  'user_role_assignments_granted_by_user_id_idx',
  'role-grantor FK operations have a complete lookup index'
);
select extensions.has_index(
  'core',
  'data_subjects',
  'data_subjects_merged_into_id_idx',
  'data-subject merge targets have a lookup index'
);
select extensions.has_index(
  'privacy',
  'consent_events',
  'consent_events_notice_version_id_idx',
  'notice FK operations have a complete lookup index'
);

select extensions.is(
  (
    select count(*)::integer
    from pg_constraint as constraint_record
    join pg_class as relation
      on relation.oid = constraint_record.conrelid
    join pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'privacy'
      and relation.relname = 'consent_events'
      and constraint_record.contype = 'f'
      and pg_get_constraintdef(constraint_record.oid) like
        '%submission_id%'
  ),
  0,
  'submission_id intentionally has no FK before the intake root exists'
);

select extensions.is(
  (
    select count(*)::integer
    from pg_trigger
    where not tgisinternal
      and tgname in (
        'create_application_identity',
        'enforce_consent_notice_purpose',
        'enforce_data_subject_lifecycle',
        'enforce_notice_version_immutability'
      )
  ),
  4,
  'identity and lifecycle triggers are installed'
);

select extensions.ok(
  has_function_privilege(
    'anon',
    'api.get_current_notice_v1(text,text)',
    'EXECUTE'
  ),
  'anon may execute only the current-notice read RPC'
);

select extensions.ok(
  not has_function_privilege(
    'authenticated',
    'api.record_authenticated_consent_v1(uuid,uuid,text,text,text,bytea,smallint,uuid)',
    'EXECUTE'
  ),
  'authenticated callers cannot execute the server-only consent RPC'
);

select extensions.ok(
  has_function_privilege(
    'service_role',
    'api.record_authenticated_consent_v1(uuid,uuid,text,text,text,bytea,smallint,uuid)',
    'EXECUTE'
  ),
  'service_role may execute the narrow consent RPC'
);

select * from extensions.finish();

rollback;
