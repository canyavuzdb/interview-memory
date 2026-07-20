begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(19);

select extensions.has_function(
  'api',
  'get_my_account_v1',
  array[]::text[],
  'authenticated account-context RPC exists'
);

select extensions.function_lang_is(
  'api',
  'get_my_account_v1',
  array[]::text[],
  'sql',
  'account-context RPC is a static SQL function'
);

select extensions.ok(
  (
    select routine.prosecdef
    from pg_proc as routine
    inner join pg_namespace as namespace
      on namespace.oid = routine.pronamespace
    where namespace.nspname = 'api'
      and routine.proname = 'get_my_account_v1'
      and routine.pronargs = 0
  ),
  'account-context RPC is SECURITY DEFINER'
);

select extensions.ok(
  (
    select routine.proretset
      and routine.prorettype = 'record'::regtype
    from pg_proc as routine
    inner join pg_namespace as namespace
      on namespace.oid = routine.pronamespace
    where namespace.nspname = 'api'
      and routine.proname = 'get_my_account_v1'
      and routine.pronargs = 0
  ),
  'account-context RPC returns a fixed record projection'
);

select extensions.is(
  (
    select routine.proconfig
    from pg_proc as routine
    inner join pg_namespace as namespace
      on namespace.oid = routine.pronamespace
    where namespace.nspname = 'api'
      and routine.proname = 'get_my_account_v1'
      and routine.pronargs = 0
  ),
  array['search_path=""'::text],
  'account-context RPC pins an empty search_path'
);

select extensions.ok(
  not exists (
    select 1
    from information_schema.routine_privileges
    where routine_schema = 'api'
      and routine_name = 'get_my_account_v1'
      and grantee = 'PUBLIC'
      and privilege_type = 'EXECUTE'
  ),
  'PUBLIC cannot execute account-context RPC'
);

select extensions.ok(
  not has_function_privilege('anon', 'api.get_my_account_v1()', 'EXECUTE'),
  'anon cannot execute account-context RPC'
);

select extensions.ok(
  has_function_privilege(
    'authenticated',
    'api.get_my_account_v1()',
    'EXECUTE'
  ),
  'authenticated can execute account-context RPC'
);

select extensions.ok(
  not has_function_privilege(
    'service_role',
    'api.get_my_account_v1()',
    'EXECUTE'
  ),
  'service_role cannot bypass self-only account context'
);

insert into auth.users (id, email, created_at, updated_at)
values
  (
    'a4000000-0000-4000-8000-000000000001',
    'active-account@example.test',
    now(),
    now()
  ),
  (
    'a4000000-0000-4000-8000-000000000002',
    'other-account@example.test',
    now(),
    now()
  ),
  (
    'a4000000-0000-4000-8000-000000000003',
    'suspended-account@example.test',
    now(),
    now()
  ),
  (
    'a4000000-0000-4000-8000-000000000004',
    'deletion-account@example.test',
    now(),
    now()
  ),
  (
    'a4000000-0000-4000-8000-000000000005',
    'missing-subject@example.test',
    now(),
    now()
  );

update core.user_profiles
set locale = 'en',
    timezone = 'Europe/London',
    onboarding_status = 'completed'
where user_id = 'a4000000-0000-4000-8000-000000000001';

update core.user_profiles
set account_status = 'suspended'
where user_id = 'a4000000-0000-4000-8000-000000000003';

update core.user_profiles
set account_status = 'deletion_pending'
where user_id = 'a4000000-0000-4000-8000-000000000004';

delete from core.data_subjects
where auth_user_id = 'a4000000-0000-4000-8000-000000000005';

set local role anon;

select extensions.throws_ok(
  $query$
    select * from api.get_my_account_v1()
  $query$,
  '42501',
  null,
  'anon execution is denied'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  'a4000000-0000-4000-8000-000000000001',
  true
);
select set_config('request.jwt.claim.role', 'authenticated', true);

select extensions.results_eq(
  $query$
    select user_id
    from api.get_my_account_v1()
  $query$,
  array['a4000000-0000-4000-8000-000000000001'::uuid],
  'authenticated caller receives only its own account'
);

select extensions.results_eq(
  $query$
    select locale, timezone, onboarding_status, account_status
    from api.get_my_account_v1()
  $query$,
  $expected$
    values ('en'::text, 'Europe/London'::text, 'completed'::text, 'active'::text)
  $expected$,
  'account-context projection contains only bounded application state'
);

select extensions.throws_ok(
  $query$
    select count(*) from core.user_profiles
  $query$,
  '42501',
  null,
  'authenticated caller still cannot read raw profiles'
);

select set_config(
  'request.jwt.claim.sub',
  'a4000000-0000-4000-8000-000000000002',
  true
);

select extensions.results_eq(
  $query$
    select user_id
    from api.get_my_account_v1()
  $query$,
  array['a4000000-0000-4000-8000-000000000002'::uuid],
  'changing the verified subject changes the self-only result'
);

select set_config(
  'request.jwt.claim.sub',
  'a4000000-0000-4000-8000-000000000003',
  true
);

select extensions.is_empty(
  $query$
    select * from api.get_my_account_v1()
  $query$,
  'suspended accounts fail closed'
);

select set_config(
  'request.jwt.claim.sub',
  'a4000000-0000-4000-8000-000000000004',
  true
);

select extensions.is_empty(
  $query$
    select * from api.get_my_account_v1()
  $query$,
  'deletion-pending accounts fail closed'
);

select set_config(
  'request.jwt.claim.sub',
  'a4000000-0000-4000-8000-000000000005',
  true
);

select extensions.is_empty(
  $query$
    select * from api.get_my_account_v1()
  $query$,
  'accounts without an active data subject fail closed'
);

select set_config('request.jwt.claim.sub', '', true);

select extensions.is_empty(
  $query$
    select * from api.get_my_account_v1()
  $query$,
  'missing verified subject fails closed'
);

reset role;

select extensions.ok(
  not has_table_privilege(
    'authenticated',
    'core.data_subjects',
    'SELECT'
  ),
  'authenticated retains no raw data-subject read privilege'
);

select * from extensions.finish();

rollback;
