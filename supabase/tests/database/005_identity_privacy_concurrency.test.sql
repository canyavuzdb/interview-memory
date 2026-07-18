begin;

create extension if not exists pgtap with schema extensions;
create extension if not exists dblink with schema extensions;

select extensions.plan(12);

create function pg_temp.wait_for_lock(
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
    'consent_concurrency_owner',
    format(
      'hostaddr=%s port=%s dbname=postgres user=postgres password=postgres connect_timeout=3 application_name=interview_memory_consent_owner',
      inet_server_addr(),
      inet_server_port()
    )
  ),
  'OK',
  'the local owner test connection opens'
);

select extensions.is(
  extensions.dblink_connect(
    'consent_concurrency_contender',
    format(
      'hostaddr=%s port=%s dbname=postgres user=postgres password=postgres connect_timeout=3 application_name=interview_memory_consent_contender',
      inet_server_addr(),
      inet_server_port()
    )
  ),
  'OK',
  'the local contender test connection opens'
);

do $$
begin
  perform extensions.dblink_exec(
    'consent_concurrency_owner',
    $cleanup$
      delete from privacy.consent_events
      where idempotency_key = '93000000-0000-4000-8000-000000000001';
      delete from core.data_subjects
      where auth_user_id = '90000000-0000-4000-8000-000000000001';
      delete from auth.users
      where id = '90000000-0000-4000-8000-000000000001';
      delete from privacy.notice_versions
      where id = '92000000-0000-4000-8000-000000000001';
    $cleanup$
  );

  perform extensions.dblink_exec(
    'consent_concurrency_owner',
    $fixture$
      begin;
      insert into auth.users (id, email, created_at, updated_at)
      values (
        '90000000-0000-4000-8000-000000000001',
        'concurrency@example.test',
        clock_timestamp(),
        clock_timestamp()
      );
      insert into privacy.notice_versions (
        id,
        document_type,
        locale,
        version,
        content_sha256,
        content_uri,
        effective_from
      )
      values (
        '92000000-0000-4000-8000-000000000001',
        'publication_consent',
        'en',
        'concurrency-v1',
        decode(repeat('ab', 32), 'hex'),
        '/privacy/publication/concurrency-v1.en.md',
        clock_timestamp() - interval '1 day'
      );
      commit;
    $fixture$
  );

  perform extensions.dblink_exec(
    'consent_concurrency_owner',
    'begin; set local statement_timeout = ''10s'';'
  );
end;
$$;

select extensions.is(
  (
    select count(*)
    from extensions.dblink(
      'consent_concurrency_owner',
      $lock$
        select 1
        from (
          select pg_advisory_xact_lock(
            hashtextextended(
              'privacy.consent:' ||
              '93000000-0000-4000-8000-000000000001',
              0
            )
          )
        ) as acquired
      $lock$
    ) as lock_result(acquired integer)
  ),
  1::bigint,
  'the owner holds the idempotency transaction lock'
);

do $$
begin
  perform extensions.dblink_exec(
    'consent_concurrency_owner',
    'set local role service_role'
  );
  perform extensions.dblink_exec(
    'consent_concurrency_contender',
    'begin; set local statement_timeout = ''10s''; set local role service_role;'
  );

  if extensions.dblink_send_query(
    'consent_concurrency_contender',
    $command$
      select *
      from api.record_authenticated_consent_v1(
        '90000000-0000-4000-8000-000000000001',
        '92000000-0000-4000-8000-000000000001',
        'benchmark_publication',
        'granted',
        'account',
        decode(repeat('cd', 32), 'hex'),
        1::smallint,
        '93000000-0000-4000-8000-000000000001'
      )
    $command$
  ) <> 1 then
    raise exception 'could_not_start_concurrent_consent_query';
  end if;
end;
$$;

select extensions.ok(
  pg_temp.wait_for_lock('interview_memory_consent_contender'),
  'the contender reaches the real concurrent lock path'
);

create temporary table owner_consent_result on commit drop as
select *
from extensions.dblink(
  'consent_concurrency_owner',
  $command$
    select *
    from api.record_authenticated_consent_v1(
      '90000000-0000-4000-8000-000000000001',
      '92000000-0000-4000-8000-000000000001',
      'benchmark_publication',
      'granted',
      'account',
      decode(repeat('cd', 32), 'hex'),
      1::smallint,
      '93000000-0000-4000-8000-000000000001'
    )
  $command$
) as consent_result(
  event_id uuid,
  event_created_at timestamptz,
  replayed boolean
);

select extensions.is(
  extensions.dblink_exec('consent_concurrency_owner', 'commit'),
  'COMMIT',
  'the owner commits and releases the idempotency lock'
);

create temporary table contender_consent_result on commit drop as
select *
from extensions.dblink_get_result(
  'consent_concurrency_contender'
) as consent_result(
  event_id uuid,
  event_created_at timestamptz,
  replayed boolean
);

select extensions.is(
  (
    select count(*)
    from extensions.dblink_get_result(
      'consent_concurrency_contender'
    ) as drained_result(
      event_id uuid,
      event_created_at timestamptz,
      replayed boolean
    )
  ),
  0::bigint,
  'the contender async result stream is fully drained'
);

select extensions.is(
  extensions.dblink_exec('consent_concurrency_contender', 'commit'),
  'COMMIT',
  'the contender completes after the owner'
);

select extensions.results_eq(
  'select replayed from owner_consent_result',
  array[false],
  'the lock owner creates the consent event'
);

select extensions.results_eq(
  'select replayed from contender_consent_result',
  array[true],
  'the concurrent contender receives an idempotent replay'
);

select extensions.ok(
  (
    select owner.event_id = contender.event_id
    from owner_consent_result as owner
    cross join contender_consent_result as contender
  )
  and (
    select count(*) = 1
    from privacy.consent_events
    where idempotency_key =
      '93000000-0000-4000-8000-000000000001'
  ),
  'both calls resolve to exactly one persisted consent event'
);

do $$
begin
  perform extensions.dblink_exec(
    'consent_concurrency_owner',
    $cleanup$
      delete from privacy.consent_events
      where idempotency_key = '93000000-0000-4000-8000-000000000001';
      delete from core.data_subjects
      where auth_user_id = '90000000-0000-4000-8000-000000000001';
      delete from auth.users
      where id = '90000000-0000-4000-8000-000000000001';
      delete from privacy.notice_versions
      where id = '92000000-0000-4000-8000-000000000001';
    $cleanup$
  );
end;
$$;

select extensions.is(
  extensions.dblink_disconnect('consent_concurrency_owner'),
  'OK',
  'the owner test connection closes'
);
select extensions.is(
  extensions.dblink_disconnect('consent_concurrency_contender'),
  'OK',
  'the contender test connection closes'
);

select * from extensions.finish();

rollback;
