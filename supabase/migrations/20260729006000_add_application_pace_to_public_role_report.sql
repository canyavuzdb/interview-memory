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
    'as unique_candidates,
        count(*) filter (',
    'as unique_candidates,
        sum(search.applications_count)::integer as applications_count,
        round(
          sum(search.applications_count)::numeric
          / nullif(sum(greatest(
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
          )), 0),
          1
        ) as monthly_average_applications,
        count(*) filter ('
  );

  function_definition := replace(
    function_definition,
    '''matureSearchEpisodesCount'',
              cohort.mature_search_episodes_count,',
    '''matureSearchEpisodesCount'',
              cohort.mature_search_episodes_count,
            ''applicationsCount'', cohort.applications_count,
            ''monthlyAverageApplications'', cohort.monthly_average_applications,'
  );

  if position('monthly_average_applications' in function_definition) = 0
    or position('''applicationsCount'', cohort.applications_count' in function_definition) = 0 then
    raise exception using
      errcode = '22023',
      message = 'public_benchmark_application_pace_rewrite_failed';
  end if;

  execute function_definition;
end
$$;

commit;
