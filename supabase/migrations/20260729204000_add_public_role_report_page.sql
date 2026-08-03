begin;

-- Keep the original two-argument report function for existing callers and
-- add a paged overload for the role explorer. This prevents serialising every
-- cohort and its six-month series into a single browser response.
do $$
declare
  function_definition text;
begin
  select pg_get_functiondef(
    'api.get_public_benchmark_report_v1(integer,integer)'::regprocedure
  ) into function_definition;

  if position('limit 100' in function_definition) = 0
    or position('period_end := date_trunc' in function_definition) = 0
  then
    raise exception using
      errcode = '22023',
      message = 'public_benchmark_role_page_rewrite_failed';
  end if;

  function_definition := regexp_replace(
    function_definition,
    'CREATE OR REPLACE FUNCTION.*RETURNS jsonb',
    'CREATE OR REPLACE FUNCTION api.get_public_benchmark_report_v1(p_min_cohort_size integer DEFAULT 1, p_months integer DEFAULT 6, p_role_offset integer DEFAULT 0, p_role_limit integer DEFAULT 100) RETURNS jsonb',
    's'
  );

  if position('p_role_offset integer' in function_definition) = 0 then
    raise exception using
      errcode = '22023',
      message = 'public_benchmark_role_page_signature_rewrite_failed';
  end if;

  function_definition := replace(
    function_definition,
    '  period_end := date_trunc',
    '  if p_role_offset < 0 or p_role_limit < 1 or p_role_limit > 100 then
    raise exception using
      errcode = ''22023'',
      message = ''public_benchmark_role_page_query_invalid'';
  end if;

  period_end := date_trunc'
  );

  function_definition := replace(
    function_definition,
    '          limit 100
        ) as cohort',
    '          offset p_role_offset
          limit p_role_limit
        ) as cohort'
  );

  execute function_definition;
end
$$;

grant execute on function api.get_public_benchmark_report_v1(
  integer, integer, integer, integer
) to anon, authenticated, service_role;

commit;
