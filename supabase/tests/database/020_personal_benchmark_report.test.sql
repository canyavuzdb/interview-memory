begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(8);

select extensions.has_function(
  'api',
  'get_my_personal_report_v1',
  array['uuid'],
  'personal benchmark report RPC exists'
);
select extensions.ok(
  (
    select routine.prosecdef
    from pg_proc as routine
    inner join pg_namespace as namespace on namespace.oid = routine.pronamespace
    where namespace.nspname = 'api'
      and routine.proname = 'get_my_personal_report_v1'
      and routine.pronargs = 1
  ),
  'personal report RPC is SECURITY DEFINER'
);
select extensions.is(
  (
    select routine.proconfig
    from pg_proc as routine
    inner join pg_namespace as namespace on namespace.oid = routine.pronamespace
    where namespace.nspname = 'api'
      and routine.proname = 'get_my_personal_report_v1'
      and routine.pronargs = 1
  ),
  array['search_path=""'::text],
  'personal report RPC pins an empty search_path'
);
select extensions.ok(
  not has_function_privilege('anon', 'api.get_my_personal_report_v1(uuid)', 'EXECUTE')
    and not has_function_privilege('authenticated', 'api.get_my_personal_report_v1(uuid)', 'EXECUTE'),
  'browser roles cannot execute the personal report RPC'
);
select extensions.ok(
  has_function_privilege('service_role', 'api.get_my_personal_report_v1(uuid)', 'EXECUTE'),
  'the server role can execute the personal report RPC'
);

insert into auth.users (id, email, created_at, updated_at)
values ('20000000-0000-4000-8000-000000000020', 'personal-report@example.test', now(), now());

select extensions.results_eq(
  $query$
    select
      report #>> '{meta,status}',
      (report #>> '{meta,submissionsCount}')::integer,
      (report #>> '{meta,applicationsCount}')::integer,
      jsonb_array_length(report -> 'companyExperiences')
    from (
      select api.get_my_personal_report_v1('20000000-0000-4000-8000-000000000020') as report
    ) as result
  $query$,
  $$values ('live'::text, 0, 0, 0)$$,
  'a new account receives an empty private report without public seed data'
);
select extensions.is(
  api.get_my_personal_report_v1('ffffffff-ffff-ffff-ffff-ffffffffffff'),
  null::jsonb,
  'an unknown account receives no report'
);
select extensions.ok(
  api.get_my_personal_report_v1('20000000-0000-4000-8000-000000000020')::text
    !~* '(email|auth_user_id|data_subject_id|source_key|research_replica)',
  'the private DTO does not expose identity or seed provenance fields'
);

select * from extensions.finish();

rollback;
