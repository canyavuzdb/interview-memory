begin;

-- The company-experience write path uses its own effective notice. Preserve
-- that distinction while keeping the authenticated quota bypass introduced by
-- the daily anonymous quota migration.
do $$
declare
  definition text;
  original_condition constant text := 'and notice.document_type = ''survey_notice''';
  replacement_condition constant text := $replacement$and (
      (p_survey_type = 'search_benchmark' and notice.document_type = 'survey_notice')
      or (p_survey_type = 'company_experience' and notice.document_type = 'company_experience_notice')
    )$replacement$;
begin
  select pg_get_functiondef(
    'intake.begin_survey_submission_v1(uuid,text,integer,text,uuid,bytea,bytea,uuid,bytea,smallint,timestamptz,bytea,smallint,uuid,bytea,text,bytea,bytea,text,bytea,timestamptz,text,integer,text,bytea,timestamptz)'::regprocedure
  ) into definition;

  if position(original_condition in definition) = 0 then
    raise exception using errcode = '55000', message = 'survey_submission_notice_condition_not_found';
  end if;

  execute replace(definition, original_condition, replacement_condition);
end;
$$;

commit;
