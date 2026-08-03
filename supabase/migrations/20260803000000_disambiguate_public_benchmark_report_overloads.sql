begin;

-- Keep the legacy two-argument RPC callable with positional integer values.
-- The paged overload must require those first two arguments; otherwise its
-- defaults make calls such as get_public_benchmark_report_v1(10, 6)
-- ambiguous in PostgreSQL.
do $$
declare
  function_definition text;
begin
  select pg_get_functiondef(
    'api.get_public_benchmark_report_v1(integer,integer,integer,integer)'::regprocedure
  ) into function_definition;

  if function_definition is null
    or position('p_min_cohort_size integer DEFAULT 1, p_months integer DEFAULT 6, p_role_offset integer DEFAULT 0, p_role_limit integer DEFAULT 100' in function_definition) = 0
  then
    raise exception using
      errcode = '22023',
      message = 'public_benchmark_report_overload_rewrite_failed';
  end if;

  function_definition := replace(
    function_definition,
    'p_min_cohort_size integer DEFAULT 1, p_months integer DEFAULT 6, p_role_offset integer DEFAULT 0, p_role_limit integer DEFAULT 100',
    'p_min_cohort_size integer, p_months integer, p_role_offset integer, p_role_limit integer'
  );

  execute 'drop function api.get_public_benchmark_report_v1(integer,integer,integer,integer)';
  execute function_definition;
end
$$;

grant execute on function api.get_public_benchmark_report_v1(
  integer, integer, integer, integer
) to anon, authenticated, service_role;

commit;
