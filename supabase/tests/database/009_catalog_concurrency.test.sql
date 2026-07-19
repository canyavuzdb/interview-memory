begin;

create extension if not exists pgtap with schema extensions;
create extension if not exists dblink with schema extensions;

select extensions.plan(26);

create function pg_temp.wait_for_catalog_lock(
  expected_application_name text,
  attempts integer default 50
)
returns boolean
language plpgsql
as $$
begin
  for attempt in 1..attempts loop
    if exists (
      select 1
      from pg_catalog.pg_stat_activity as activity
      where activity.application_name = expected_application_name
        and activity.state = 'active'
        and activity.wait_event_type = 'Lock'
    ) then
      return true;
    end if;

    perform pg_catalog.pg_sleep(0.05);
  end loop;

  return false;
end;
$$;

select extensions.is(
  extensions.dblink_connect(
    'catalog_concurrency_owner',
    format(
      'hostaddr=%s port=%s dbname=postgres user=postgres password=postgres connect_timeout=3 application_name=interview_memory_catalog_owner',
      inet_server_addr(),
      inet_server_port()
    )
  ),
  'OK',
  'the catalog owner test connection opens'
);

select extensions.is(
  extensions.dblink_connect(
    'catalog_concurrency_contender',
    format(
      'hostaddr=%s port=%s dbname=postgres user=postgres password=postgres connect_timeout=3 application_name=interview_memory_catalog_contender',
      inet_server_addr(),
      inet_server_port()
    )
  ),
  'OK',
  'the catalog contender test connection opens'
);

do $$
begin
  perform extensions.dblink_exec(
    'catalog_concurrency_owner',
    $cleanup$
      delete from catalog.company_aliases
      where id in (
        '71000000-0000-4000-8000-000000000001',
        '71000000-0000-4000-8000-000000000002'
      );
      delete from catalog.companies
      where id in (
        '70000000-0000-4000-8000-000000000001',
        '70000000-0000-4000-8000-000000000002'
      );
      delete from catalog.compensation_bands
      where id in (
        '72000000-0000-4000-8000-000000000001',
        '72000000-0000-4000-8000-000000000002'
      );
      delete from catalog.sectors where id = 30000;
    $cleanup$
  );

  perform extensions.dblink_exec(
    'catalog_concurrency_owner',
    $fixture$
      begin;
      insert into catalog.sectors (
        id,
        slug,
        display_name
      )
      overriding system value
      values (
        30000,
        'concurrency-sector',
        'Concurrency Sector'
      );

      insert into catalog.companies (
        id,
        sector_id,
        slug,
        display_name
      )
      values
        (
          '70000000-0000-4000-8000-000000000001',
          30000,
          'concurrency-company-one',
          'Concurrency Company One'
        ),
        (
          '70000000-0000-4000-8000-000000000002',
          30000,
          'concurrency-company-two',
          'Concurrency Company Two'
        );

      insert into catalog.company_aliases (
        id,
        company_id,
        normalized_alias,
        source_code
      )
      values
        (
          '71000000-0000-4000-8000-000000000001',
          '70000000-0000-4000-8000-000000000001',
          'concurrent alias',
          'moderator'
        ),
        (
          '71000000-0000-4000-8000-000000000002',
          '70000000-0000-4000-8000-000000000002',
          'concurrent alias',
          'moderator'
        );
      commit;
    $fixture$
  );
end;
$$;

select extensions.is(
  extensions.dblink_exec(
    'catalog_concurrency_owner',
    'begin; set local statement_timeout = ''10s'';'
  ),
  'SET',
  'the alias owner transaction starts'
);

select extensions.is(
  extensions.dblink_exec(
    'catalog_concurrency_owner',
    $approve$
      update catalog.company_aliases
      set review_status = 'approved'
      where id = '71000000-0000-4000-8000-000000000001'
    $approve$
  ),
  'UPDATE 1',
  'the alias owner claims the approved tuple'
);

select extensions.is(
  extensions.dblink_exec(
    'catalog_concurrency_contender',
    'begin; set local statement_timeout = ''10s'';'
  ),
  'SET',
  'the alias contender transaction starts'
);

select extensions.is(
  extensions.dblink_send_query(
    'catalog_concurrency_contender',
    $approve$
      update catalog.company_aliases
      set review_status = 'approved'
      where id = '71000000-0000-4000-8000-000000000002'
      returning id
    $approve$
  ),
  1,
  'the concurrent alias approval query starts'
);

select extensions.ok(
  pg_temp.wait_for_catalog_lock(
    'interview_memory_catalog_contender'
  ),
  'the alias contender reaches the unique-index lock path'
);

select extensions.is(
  extensions.dblink_exec('catalog_concurrency_owner', 'commit'),
  'COMMIT',
  'the alias owner commits and releases the tuple lock'
);

select extensions.is(
  (
    select count(*)
    from extensions.dblink_get_result(
      'catalog_concurrency_contender',
      false
    ) as alias_result(id uuid)
  ),
  0::bigint,
  'the losing alias approval persists no result'
);

select extensions.ok(
  extensions.dblink_error_message(
    'catalog_concurrency_contender'
  ) like '%duplicate key value violates unique constraint%',
  'the losing alias approval receives a deterministic uniqueness conflict'
);

select extensions.is(
  (
    select count(*)
    from extensions.dblink_get_result(
      'catalog_concurrency_contender',
      false
    ) as drained_alias_result(id uuid)
  ),
  0::bigint,
  'the alias contender async result stream is fully drained'
);

select extensions.is(
  extensions.dblink_exec(
    'catalog_concurrency_contender',
    'rollback'
  ),
  'ROLLBACK',
  'the losing alias transaction rolls back'
);

select extensions.is(
  (
    select count(*)::integer
    from catalog.company_aliases
    where normalized_alias = 'concurrent alias'
      and review_status = 'approved'
  ),
  1,
  'concurrent alias approval leaves exactly one approved owner'
);

select extensions.is(
  extensions.dblink_exec(
    'catalog_concurrency_owner',
    'begin; set local statement_timeout = ''10s'';'
  ),
  'SET',
  'the compensation owner transaction starts'
);

select extensions.is(
  extensions.dblink_exec(
    'catalog_concurrency_owner',
    $insert$
      insert into catalog.compensation_bands (
        id,
        currency_code,
        pay_period,
        gross_net,
        region_code,
        lower_bound,
        upper_bound,
        definition_version,
        valid_from
      )
      values (
        '72000000-0000-4000-8000-000000000001',
        'TRY',
        'monthly',
        'gross',
        'concurrency-region',
        0,
        100,
        'concurrency-v1',
        '2026-01-01'
      )
    $insert$
  ),
  'INSERT 0 1',
  'the compensation owner claims one range'
);

select extensions.is(
  extensions.dblink_exec(
    'catalog_concurrency_contender',
    'begin; set local statement_timeout = ''10s'';'
  ),
  'SET',
  'the compensation contender transaction starts'
);

select extensions.is(
  extensions.dblink_send_query(
    'catalog_concurrency_contender',
    $insert$
      insert into catalog.compensation_bands (
        id,
        currency_code,
        pay_period,
        gross_net,
        region_code,
        lower_bound,
        upper_bound,
        definition_version,
        valid_from
      )
      values (
        '72000000-0000-4000-8000-000000000002',
        'TRY',
        'monthly',
        'gross',
        'concurrency-region',
        50,
        150,
        'concurrency-v1',
        '2026-01-01'
      )
      returning id
    $insert$
  ),
  1,
  'the concurrent overlapping compensation insert starts'
);

select extensions.ok(
  pg_temp.wait_for_catalog_lock(
    'interview_memory_catalog_contender'
  ),
  'the compensation contender reaches the exclusion lock path'
);

select extensions.is(
  extensions.dblink_exec('catalog_concurrency_owner', 'commit'),
  'COMMIT',
  'the compensation owner commits and releases the range lock'
);

select extensions.is(
  (
    select count(*)
    from extensions.dblink_get_result(
      'catalog_concurrency_contender',
      false
    ) as band_result(id uuid)
  ),
  0::bigint,
  'the losing overlapping compensation insert persists no result'
);

select extensions.ok(
  extensions.dblink_error_message(
    'catalog_concurrency_contender'
  ) like '%conflicting key value violates exclusion constraint%',
  'the losing compensation insert receives an exclusion conflict'
);

select extensions.is(
  (
    select count(*)
    from extensions.dblink_get_result(
      'catalog_concurrency_contender',
      false
    ) as drained_band_result(id uuid)
  ),
  0::bigint,
  'the compensation contender async result stream is fully drained'
);

select extensions.is(
  extensions.dblink_exec(
    'catalog_concurrency_contender',
    'rollback'
  ),
  'ROLLBACK',
  'the losing compensation transaction rolls back'
);

select extensions.is(
  (
    select count(*)::integer
    from catalog.compensation_bands
    where id in (
      '72000000-0000-4000-8000-000000000001',
      '72000000-0000-4000-8000-000000000002'
    )
  ),
  1,
  'concurrent overlap leaves exactly one compensation band'
);

do $$
begin
  perform extensions.dblink_exec(
    'catalog_concurrency_owner',
    $cleanup$
      delete from catalog.company_aliases
      where id in (
        '71000000-0000-4000-8000-000000000001',
        '71000000-0000-4000-8000-000000000002'
      );
      delete from catalog.companies
      where id in (
        '70000000-0000-4000-8000-000000000001',
        '70000000-0000-4000-8000-000000000002'
      );
      delete from catalog.compensation_bands
      where id in (
        '72000000-0000-4000-8000-000000000001',
        '72000000-0000-4000-8000-000000000002'
      );
      delete from catalog.sectors where id = 30000;
    $cleanup$
  );
end;
$$;

select extensions.is(
  extensions.dblink_disconnect('catalog_concurrency_owner'),
  'OK',
  'the catalog owner test connection closes'
);
select extensions.is(
  extensions.dblink_disconnect('catalog_concurrency_contender'),
  'OK',
  'the catalog contender test connection closes'
);

select * from extensions.finish();

rollback;
