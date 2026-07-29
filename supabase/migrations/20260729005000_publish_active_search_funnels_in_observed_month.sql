begin;

do $$
declare
  function_definition text;
begin
  select pg_get_functiondef(
    'api.get_public_benchmark_report_v1(integer,integer)'::regprocedure
  ) into function_definition;

  function_definition := replace(
    function_definition,
    'where search.started_month = month.month_start',
    'where coalesce(
          search.ended_month,
          date_trunc(''month'', search.observed_through)::date
        ) = month.month_start'
  );

  if position('search.observed_through' in function_definition) = 0
    or position('= month.month_start' in function_definition) = 0 then
    raise exception using
      errcode = '22023',
      message = 'public_benchmark_monthly_activity_rewrite_failed';
  end if;

  execute function_definition;
end
$$;

commit;
