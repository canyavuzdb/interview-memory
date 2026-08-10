begin;

-- Temporary testing preview: include research replicas and unverified catalog
-- companies so the report can be inspected with every named test contribution.
-- Restore the origin and publication filters before production release.
do $$
declare
  function_definition text;
  origin_clause text := '[[:space:]]+and[[:space:]]+\([[:space:]]+submission\.data_origin[[:space:]]*=[[:space:]]*''community''[[:space:]]+or[[:space:]]+\([[:space:]]+submission\.data_origin[[:space:]]*=[[:space:]]*''research_replica''[[:space:]]+and[[:space:]]+submission\.source_key[[:space:]]*=[[:space:]]*''eurostat-occupation-region-vacancies-2025''[[:space:]]+\)[[:space:]]+\)';
  publication_clause text := '[[:space:]]+and[[:space:]]+company\.verification_status[[:space:]]*=[[:space:]]*''verified''[[:space:]]+and[[:space:]]+company\.publication_status[[:space:]]*=[[:space:]]*''published''';
begin
  select pg_get_functiondef(
    'api.get_public_benchmark_report_v1(integer,integer,integer,integer)'::regprocedure
  ) into function_definition;

  if function_definition !~ origin_clause then
    raise exception using errcode = '22023', message = 'public_benchmark_origin_filter_not_found';
  end if;
  if function_definition !~ publication_clause then
    raise exception using errcode = '22023', message = 'public_benchmark_publication_filter_not_found';
  end if;

  function_definition := regexp_replace(function_definition, origin_clause, '', 'g');
  function_definition := regexp_replace(function_definition, publication_clause, '', 'g');

  if function_definition ~ origin_clause or function_definition ~ publication_clause then
    raise exception using errcode = '22023', message = 'public_benchmark_test_filters_not_removed';
  end if;

  execute function_definition;
end
$$;

commit;
