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
    'select sum(search.applications_count)::integer',
    'select coalesce(round(sum(
              search.applications_count::numeric / greatest(
                1,
                (
                  extract(year from coalesce(
                    search.ended_month,
                    date_trunc(''month'', search.observed_through)::date
                  ))::integer * 12
                  + extract(month from coalesce(
                    search.ended_month,
                    date_trunc(''month'', search.observed_through)::date
                  ))::integer
                  - extract(year from search.started_month)::integer * 12
                  - extract(month from search.started_month)::integer
                  + 1
                )
              )
            ), 1), 0)'
  );

  function_definition := replace(
    function_definition,
    'where coalesce(
          search.ended_month,
          date_trunc(''month'', search.observed_through)::date
        ) = month.month_start',
    'where month.month_start between search.started_month
          and coalesce(
            search.ended_month,
            date_trunc(''month'', search.observed_through)::date
          )'
  );

  if position('search.applications_count::numeric / greatest' in function_definition) = 0
    or position('month.month_start between search.started_month' in function_definition) = 0 then
    raise exception using
      errcode = '22023',
      message = 'public_benchmark_monthly_pace_rewrite_failed';
  end if;

  execute function_definition;
end
$$;

commit;
