begin;

-- PostgreSQL still considers a four-argument overload with trailing defaults
-- a candidate for a two-argument positional call. The paged RPC therefore
-- requires all four parameters; the legacy two-argument RPC remains unique.
do $$
declare
  function_definition text;
begin
  select pg_get_functiondef(
    'api.get_public_benchmark_report_v1(integer,integer,integer,integer)'::regprocedure
  ) into function_definition;

  function_definition := replace(
    function_definition,
    'p_role_offset integer DEFAULT 0, p_role_limit integer DEFAULT 100',
    'p_role_offset integer, p_role_limit integer'
  );

  if position('p_role_offset integer DEFAULT' in function_definition) > 0
    or position('p_role_limit integer DEFAULT' in function_definition) > 0
  then
    raise exception using
      errcode = '22023',
      message = 'public_benchmark_paged_overload_defaults_not_removed';
  end if;

  execute 'drop function api.get_public_benchmark_report_v1(integer,integer,integer,integer)';
  execute function_definition;
end
$$;

grant execute on function api.get_public_benchmark_report_v1(
  integer, integer, integer, integer
) to anon, authenticated, service_role;

commit;
