begin;

-- receipt_id is also an OUT parameter of the function, so qualify the table
-- column in the INSERT ... RETURNING clause.
do $$
declare
  definition text;
  original_returning constant text := 'returning id, receipt_id into inserted_submission_id, inserted_receipt_id';
  replacement_returning constant text := 'returning survey_submissions.id, survey_submissions.receipt_id into inserted_submission_id, inserted_receipt_id';
begin
  select pg_get_functiondef(
    'intake.begin_survey_submission_v1(uuid,text,integer,text,uuid,bytea,bytea,uuid,bytea,smallint,timestamptz,bytea,smallint,uuid,bytea,text,bytea,bytea,text,bytea,timestamptz,text,integer,text,bytea,timestamptz)'::regprocedure
  ) into definition;

  if position(original_returning in definition) = 0 then
    raise exception using errcode = '55000', message = 'survey_submission_receipt_returning_not_found';
  end if;

  execute replace(definition, original_returning, replacement_returning);
end;
$$;

commit;
