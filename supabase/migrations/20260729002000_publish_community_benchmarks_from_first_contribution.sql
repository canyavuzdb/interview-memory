begin;

-- Public reports use direct community contributions only. Publishing begins
-- with the first contribution so the product reflects the data it has today.
do $$
declare
  function_definition text;
begin
  select pg_get_functiondef(
    'api.get_public_benchmark_report_v1(integer,integer)'::regprocedure
  ) into function_definition;

  if position('p_min_cohort_size < 1' in function_definition) = 0 then
    function_definition := replace(
      function_definition,
      'p_min_cohort_size integer DEFAULT 10',
      'p_min_cohort_size integer DEFAULT 1'
    );
    function_definition := replace(
      function_definition,
      'p_min_cohort_size < 10',
      'p_min_cohort_size < 1'
    );

    execute function_definition;
  end if;
end
$$;

commit;
