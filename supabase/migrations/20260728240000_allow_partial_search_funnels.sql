-- Detail counts are optional survey inputs. A completed outcome may be known even
-- when the respondent does not remember its offer or employment-start totals.
do $$
declare
  function_definition text;
begin
  select pg_get_functiondef(
    'api.create_search_episode_v1(uuid,integer,text,uuid,bytea,bytea,uuid,bytea,smallint,timestamptz,bytea,smallint,uuid,bytea,bytea,bytea,bytea,timestamptz,integer,text,bytea,timestamptz,text,text,text,text,text,text,text,date,date,text,boolean,boolean,date,integer,integer,integer,integer,integer,integer,integer,integer)'::regprocedure
  ) into function_definition;

  function_definition := replace(function_definition, $status_guard$
  if (p_status = 'offer_accepted' and p_accepted_offers_count = 0)
    or (p_status = 'employment_started' and p_employment_started_count = 0)
    or (p_status = 'offer_rejected' and p_offers_count = 0)
  then
    raise exception using
      errcode = '22023',
      message = 'search_episode_status_count_mismatch';
  end if;

$status_guard$, '');

  if function_definition = pg_get_functiondef(
    'api.create_search_episode_v1(uuid,integer,text,uuid,bytea,bytea,uuid,bytea,smallint,timestamptz,bytea,smallint,uuid,bytea,bytea,bytea,bytea,timestamptz,integer,text,bytea,timestamptz,text,text,text,text,text,text,text,date,date,text,boolean,boolean,date,integer,integer,integer,integer,integer,integer,integer,integer)'::regprocedure
  ) then
    raise exception 'search_episode_status_guard_not_found';
  end if;

  execute function_definition;
end;
$$;
