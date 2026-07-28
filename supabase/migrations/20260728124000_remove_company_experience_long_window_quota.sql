begin;

-- The company command used to maintain a second 30-day quota. Anonymous
-- contributions now use only the daily bucket; a zero value bypasses this
-- legacy branch for authenticated submissions as well.
do $$
declare
  definition text;
  original_block constant text := $original$
  select * into second_quota
  from security.consume_quota_v1(
    'experience.repeatable', 'data_subject', p_quota_subject_hmac,
    p_quota_30d_window_start, 'accepted_30d', p_quota_30d_limit,
    'accepted', p_quota_policy_version, p_quota_policy_hash,
    p_quota_30d_expires_at
  );

  if not second_quota.allowed then
    raise exception using errcode = 'P0001', message = 'accepted_quota_exceeded';
  end if;$original$;
  replacement_block constant text := $replacement$
  if p_quota_30d_limit > 0 then
    select * into second_quota
    from security.consume_quota_v1(
      'experience.repeatable', 'data_subject', p_quota_subject_hmac,
      p_quota_30d_window_start, 'accepted_30d', p_quota_30d_limit,
      'accepted', p_quota_policy_version, p_quota_policy_hash,
      p_quota_30d_expires_at
    );

    if not second_quota.allowed then
      raise exception using errcode = 'P0001', message = 'accepted_quota_exceeded';
    end if;
  end if;$replacement$;
begin
  select pg_get_functiondef(
    'api.create_company_experience_v1(uuid,integer,text,uuid,bytea,bytea,uuid,bytea,smallint,timestamptz,bytea,smallint,uuid,bytea,bytea,bytea,bytea,timestamptz,integer,timestamptz,timestamptz,integer,timestamptz,text,bytea,text,text,smallint,text,smallint,smallint,boolean,text,smallint,boolean,text[],text,smallint,smallint,smallint,text,text)'::regprocedure
  ) into definition;

  if position(original_block in definition) = 0 then
    raise exception using errcode = '55000', message = 'company_experience_long_quota_block_not_found';
  end if;

  execute replace(definition, original_block, replacement_block);
end;
$$;

commit;
