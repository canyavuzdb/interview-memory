begin;

-- The report deliberately serialises only the highest-volume 100 cohorts so
-- the page remains fast. Expose the full eligible cohort count separately so
-- the UI can distinguish total process records from the visible report slice.
do $$
declare
  function_definition text;
begin
  select pg_get_functiondef(
    'api.get_public_benchmark_report_v1(integer,integer)'::regprocedure
  ) into function_definition;

  if position('''roleMonthly'', coalesce(' in function_definition) = 0 then
    raise exception using
      errcode = '22023',
      message = 'public_benchmark_role_cohort_count_rewrite_failed';
  end if;

  function_definition := replace(
    function_definition,
    '''roleMonthly'', coalesce(',
    '''roleCohortCount'', (select count(*) from role_cohorts),
      ''roleMonthly'', coalesce('
  );

  execute function_definition;
end
$$;

commit;
