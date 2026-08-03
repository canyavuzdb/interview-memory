begin;

do $$
declare
  function_definition text;
begin
  select pg_get_functiondef(
    'api.get_public_benchmark_report_v1(integer,integer)'::regprocedure
  ) into function_definition;

  function_definition := regexp_replace(
    function_definition,
    'p_min_cohort_size < 10',
    'p_min_cohort_size < 1',
    'g'
  );
  function_definition := regexp_replace(
    function_definition,
    'p_min_cohort_size integer DEFAULT 10',
    'p_min_cohort_size integer DEFAULT 1',
    'g'
  );

  if position('p_min_cohort_size < 1' in function_definition) = 0 then
    raise exception using
      errcode = '22023',
      message = 'public_benchmark_threshold_rewrite_failed';
  end if;

  execute function_definition;
end
$$;

commit;
