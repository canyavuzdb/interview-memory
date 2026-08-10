begin;

-- Temporary testing preview: include newly submitted applications immediately
-- instead of waiting for the normal 30-day observation window. The public UI
-- still marks these values as candidate-reported aggregates and will return to
-- the mature-window rule before production release.
do $$
declare
  function_definition text;
  maturity_clause text := '[[:space:]]+where[[:space:]]+application\.observed_through[[:space:]]*>=[[:space:]]+application\.applied_month[[:space:]]+\+[[:space:]]+interval[[:space:]]+''30 days''';
begin
  select pg_get_functiondef(
    'api.get_public_benchmark_report_v1(integer,integer,integer,integer)'::regprocedure
  ) into function_definition;

  if position('application.observed_through' in function_definition) = 0 then
    raise exception using
      errcode = '22023',
      message = 'public_benchmark_maturity_clause_not_found';
  end if;

  function_definition := regexp_replace(
    function_definition,
    maturity_clause,
    '',
    'g'
  );

  if function_definition ~ maturity_clause then
    raise exception using
      errcode = '22023',
      message = 'public_benchmark_maturity_clause_not_removed';
  end if;

  execute function_definition;
end
$$;

commit;
