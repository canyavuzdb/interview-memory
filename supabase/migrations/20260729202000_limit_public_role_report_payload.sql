begin;

-- Keep the public payload small enough for server rendering and PostgREST.
-- The full reference set remains in storage; the explorer starts with the
-- highest-volume 100 role/level cohorts instead of serialising 2,005 series.
do $$
declare
  function_definition text;
begin
  select pg_get_functiondef(
    'api.get_public_benchmark_report_v1(integer,integer)'::regprocedure
  ) into function_definition;

  if position('from role_cohorts as cohort' in function_definition) = 0 then
    raise exception using
      errcode = '22023',
      message = 'public_benchmark_role_payload_limit_rewrite_failed';
  end if;

  function_definition := replace(
    function_definition,
    'from role_cohorts as cohort',
    'from (
          select *
          from role_cohorts
          order by applications_count desc, unique_candidates desc,
            role_family, role_specialization, seniority
          limit 100
        ) as cohort'
  );

  execute function_definition;
end
$$;

commit;
