begin;

-- Keep historical sectorless rows intact, while enforcing the dimension for
-- every new episode. Backfilling those rows as "other" would fabricate data.
alter table intake.search_episodes
  add constraint search_episodes_sector_required_for_new_writes
  check (sector_id is not null) not valid;

do $$
declare
  function_definition text;
begin
  select pg_get_functiondef(
    'api.create_search_episode_v1(uuid,integer,text,uuid,bytea,bytea,uuid,bytea,smallint,timestamptz,bytea,smallint,uuid,bytea,bytea,bytea,bytea,timestamptz,integer,text,bytea,timestamptz,text,text,text,text,text,text,text,date,date,text,boolean,boolean,date,integer,integer,integer,integer,integer,integer,integer,integer)'::regprocedure
  )
  into function_definition;

  if position('search_episode_sector_required' in function_definition) = 0 then
    function_definition := replace(
      function_definition,
      '  if p_sector_slug is not null then',
      $replacement$  if p_sector_slug is null then
    raise exception using
      errcode = '22023',
      message = 'search_episode_sector_required';
  end if;

  if p_sector_slug is not null then$replacement$
    );

    execute function_definition;
  end if;
end
$$;

commit;
