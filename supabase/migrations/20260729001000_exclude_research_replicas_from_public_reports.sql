begin;

-- Research replicas remain available for internal development checks, but
-- public reports must only represent direct community contributions.
do $$
declare
  function_definition text;
begin
  select pg_get_functiondef(
    'api.get_public_benchmark_report_v1(integer,integer)'::regprocedure
  ) into function_definition;

  if position('submission.data_origin = ''community''' in function_definition) = 0 then
    function_definition := replace(
      function_definition,
      E'where submission.lifecycle_status = \'accepted\'\n        and submission.quality_status = \'eligible\'',
      E'where submission.lifecycle_status = \'accepted\'\n        and submission.quality_status = \'eligible\'\n        and submission.data_origin = \'community\''
    );

    execute function_definition;
  end if;
end
$$;

commit;
