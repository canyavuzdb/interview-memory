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
    'and episode.started_month between period_start and period_end',
    'and coalesce(
          episode.ended_month,
          date_trunc(''month'', episode.observed_through)::date
        ) between period_start and period_end'
  );

  if position('episode.ended_month' in function_definition) = 0
    or position('episode.observed_through' in function_definition) = 0 then
    raise exception using
      errcode = '22023',
      message = 'public_benchmark_activity_window_rewrite_failed';
  end if;

  execute function_definition;
end
$$;

commit;
