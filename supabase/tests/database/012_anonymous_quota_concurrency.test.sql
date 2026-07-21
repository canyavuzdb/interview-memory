begin;

create extension if not exists pgtap with schema extensions;
create extension if not exists dblink with schema extensions;

select extensions.plan(6);

create temporary table concurrent_quota_results (
  allowed boolean,
  current_count integer,
  remaining integer
) on commit drop;

do $$
declare
  connection_number integer;
  connection_name text;
  connection_string text := format(
    'hostaddr=%s port=%s dbname=postgres user=postgres password=postgres connect_timeout=3',
    inet_server_addr(),
    inet_server_port()
  );
begin
  -- dblink workers commit independently from this pgTAP transaction. Clean up
  -- through a separate autocommit connection so a previous interrupted run
  -- cannot leave a row lock that blocks every worker in the next run.
  perform extensions.dblink_connect('quota_cleanup', connection_string);
  perform extensions.dblink_exec(
    'quota_cleanup',
    $cleanup$
      delete from security.submission_quota_buckets
      where scope = 'experience.concurrent'
        and subject_hmac = decode(repeat('b6', 32), 'hex')
    $cleanup$
  );
  perform extensions.dblink_disconnect('quota_cleanup');

  for connection_number in 1..24 loop
    connection_name := format('quota_race_%s', connection_number);
    perform extensions.dblink_connect(connection_name, connection_string);

    if extensions.dblink_send_query(
      connection_name,
      $query$
        select * from api.consume_submission_quota_v1(
          'experience.concurrent',
          'data_subject',
          decode(repeat('b6', 32), 'hex'),
          date_trunc('day', statement_timestamp()),
          'accepted_24h',
          10,
          'accepted',
          '2026-07-21.v1',
          decode(repeat('c6', 32), 'hex'),
          date_trunc('day', statement_timestamp()) + interval '1 day'
        )
      $query$
    ) <> 1 then
      raise exception 'could_not_start_quota_request_%', connection_number;
    end if;
  end loop;
end;
$$;

select extensions.pass('24 quota requests were dispatched concurrently');

do $$
declare
  connection_number integer;
  connection_name text;
begin
  for connection_number in 1..24 loop
    connection_name := format('quota_race_%s', connection_number);
    execute format(
      'insert into concurrent_quota_results select * from extensions.dblink_get_result(%L) as result(allowed boolean, current_count integer, remaining integer)',
      connection_name
    );
    perform extensions.dblink_disconnect(connection_name);
  end loop;
end;
$$;

select extensions.is(
  (select count(*)::integer from concurrent_quota_results),
  24,
  'all concurrent quota calls return one bounded result'
);

select extensions.is(
  (select count(*)::integer from concurrent_quota_results where allowed),
  10,
  'exactly the configured number of concurrent requests is allowed'
);

select extensions.is(
  (select count(*)::integer from concurrent_quota_results where not allowed),
  14,
  'all requests beyond the limit are denied'
);

select extensions.is(
  (
    select accepted_count
    from security.submission_quota_buckets
    where scope = 'experience.concurrent'
      and subject_hmac = decode(repeat('b6', 32), 'hex')
  ),
  10,
  'the persisted counter never overshoots under concurrency'
);

select extensions.is(
  (
    select count(*)::integer
    from security.submission_quota_buckets
    where scope = 'experience.concurrent'
      and subject_hmac = decode(repeat('b6', 32), 'hex')
  ),
  1,
  'concurrent requests converge on one quota bucket'
);

select * from extensions.finish();

rollback;
