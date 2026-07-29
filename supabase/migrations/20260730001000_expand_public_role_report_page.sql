begin;

-- The explorer works with aggregate role cohorts, not raw search episodes.
-- Allow the complete public cohort set to be returned in one cached response.
do $$
declare
  function_definition text;
begin
  select pg_get_functiondef(
    'api.get_public_benchmark_report_v1(integer,integer,integer,integer)'::regprocedure
  ) into function_definition;

  if position('p_role_limit > 100' in function_definition) = 0 then
    raise exception using
      errcode = '22023',
      message = 'public_benchmark_role_limit_rewrite_failed';
  end if;

  function_definition := replace(
    function_definition,
    'p_role_limit > 100',
    'p_role_limit > 2500'
  );

  execute function_definition;
end
$$;

commit;
