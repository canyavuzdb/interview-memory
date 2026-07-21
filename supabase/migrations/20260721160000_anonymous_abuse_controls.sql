begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

create schema security;

comment on schema security is
  'Private, short-lived quota and idempotency state. Raw identifiers, IP addresses, user agents, and bearer tokens are forbidden.';

revoke all on schema security
  from public, anon, authenticated, service_role;

alter default privileges for role postgres in schema security
  revoke all on tables
  from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema security
  revoke all on sequences
  from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema security
  revoke execute on routines
  from public, anon, authenticated, service_role;

create table security.submission_quota_buckets (
  scope text not null,
  subject_type text not null,
  subject_hmac bytea not null,
  window_start timestamptz not null,
  window_kind text not null,
  attempt_count integer not null default 0,
  accepted_count integer not null default 0,
  policy_version text not null,
  policy_hash bytea not null,
  expires_at timestamptz not null,
  constraint submission_quota_buckets_pkey primary key (
    scope,
    subject_type,
    subject_hmac,
    window_start,
    window_kind
  ),
  constraint submission_quota_buckets_scope_check check (
    scope = btrim(scope)
    and char_length(scope) between 1 and 100
    and scope ~ '^[a-z0-9]+(?:[._-][a-z0-9]+)*$'
  ),
  constraint submission_quota_buckets_subject_type_check check (
    subject_type in ('data_subject', 'ip_hmac', 'device_cookie')
  ),
  constraint submission_quota_buckets_subject_hmac_check check (
    octet_length(subject_hmac) = 32
  ),
  constraint submission_quota_buckets_window_kind_check check (
    window_kind = btrim(window_kind)
    and char_length(window_kind) between 1 and 80
    and window_kind ~ '^[a-z0-9]+(?:[._-][a-z0-9]+)*$'
  ),
  constraint submission_quota_buckets_counts_check check (
    attempt_count >= 0 and accepted_count >= 0
  ),
  constraint submission_quota_buckets_policy_version_check check (
    policy_version = btrim(policy_version)
    and char_length(policy_version) between 1 and 80
  ),
  constraint submission_quota_buckets_policy_hash_check check (
    octet_length(policy_hash) = 32
  ),
  constraint submission_quota_buckets_expiry_check check (
    expires_at > window_start
  )
);

create index submission_quota_buckets_expiry_idx
  on security.submission_quota_buckets (expires_at);

comment on table security.submission_quota_buckets is
  'T07 atomic ephemeral counters keyed only by purpose-separated pseudonyms. Accepted counters are consumed inside the owning domain transaction.';

create table security.api_idempotency_records (
  subject_type text not null,
  subject_hmac bytea not null,
  operation_code text not null,
  idempotency_key_hmac bytea not null,
  request_fingerprint bytea not null,
  status text not null default 'processing',
  resource_type text,
  resource_id uuid,
  response_code smallint,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint api_idempotency_records_pkey primary key (
    subject_type,
    subject_hmac,
    operation_code,
    idempotency_key_hmac
  ),
  constraint api_idempotency_records_subject_type_check check (
    subject_type in ('data_subject', 'auth_user', 'capability')
  ),
  constraint api_idempotency_records_subject_hmac_check check (
    octet_length(subject_hmac) = 32
  ),
  constraint api_idempotency_records_operation_code_check check (
    operation_code = btrim(operation_code)
    and char_length(operation_code) between 1 and 100
    and operation_code ~ '^[a-z0-9]+(?:[._-][a-z0-9]+)*$'
  ),
  constraint api_idempotency_records_key_hmac_check check (
    octet_length(idempotency_key_hmac) = 32
  ),
  constraint api_idempotency_records_fingerprint_check check (
    octet_length(request_fingerprint) = 32
  ),
  constraint api_idempotency_records_status_check check (
    status in ('processing', 'completed', 'failed')
  ),
  constraint api_idempotency_records_resource_type_check check (
    resource_type is null
    or (
      resource_type = btrim(resource_type)
      and char_length(resource_type) between 1 and 80
      and resource_type ~ '^[a-z0-9]+(?:[._-][a-z0-9]+)*$'
    )
  ),
  constraint api_idempotency_records_response_code_check check (
    response_code is null or response_code between 100 and 599
  ),
  constraint api_idempotency_records_completed_result_check check (
    status <> 'completed'
    or (
      resource_type is not null
      and resource_id is not null
      and response_code is not null
    )
  ),
  constraint api_idempotency_records_non_completed_result_check check (
    status = 'completed'
    or (resource_type is null and resource_id is null)
  ),
  constraint api_idempotency_records_expiry_check check (
    expires_at > created_at
  )
);

create index api_idempotency_records_expiry_idx
  on security.api_idempotency_records (expires_at);

comment on table security.api_idempotency_records is
  'T08 short-lived command claims. Client keys and subjects are stored only as purpose-separated HMAC values.';

alter table security.submission_quota_buckets enable row level security;
alter table security.submission_quota_buckets force row level security;
alter table security.api_idempotency_records enable row level security;
alter table security.api_idempotency_records force row level security;

revoke all on all tables in schema security
  from public, anon, authenticated, service_role;
revoke all on all sequences in schema security
  from public, anon, authenticated, service_role;

create function api.resolve_anonymous_subject_v1(
  p_active_hmac bytea,
  p_active_key_version smallint,
  p_previous_hmac bytea default null,
  p_previous_key_version smallint default null
)
returns table (
  data_subject_id uuid,
  created boolean,
  key_rotated boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  resolved_subject core.data_subjects%rowtype;
  lock_material text;
begin
  if p_active_hmac is null or octet_length(p_active_hmac) <> 32 then
    raise exception using
      errcode = '22023',
      message = 'active_respondent_hmac_invalid';
  end if;

  if p_active_key_version is null or p_active_key_version <= 0 then
    raise exception using
      errcode = '22023',
      message = 'active_respondent_key_version_invalid';
  end if;

  if (p_previous_hmac is null) <> (p_previous_key_version is null)
    or (p_previous_hmac is not null and octet_length(p_previous_hmac) <> 32)
    or (p_previous_key_version is not null and p_previous_key_version <= 0)
    or p_previous_key_version = p_active_key_version
  then
    raise exception using
      errcode = '22023',
      message = 'previous_respondent_key_invalid';
  end if;

  lock_material := encode(coalesce(p_previous_hmac, p_active_hmac), 'hex');
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('respondent-cookie:' || lock_material, 0)
  );

  select subject.*
  into resolved_subject
  from core.data_subjects as subject
  where subject.status = 'anonymous'
    and subject.merged_into_id is null
    and subject.deleted_at is null
    and (
      subject.anonymous_key_hmac = p_active_hmac
      or (
        p_previous_hmac is not null
        and subject.anonymous_key_hmac = p_previous_hmac
        and subject.anonymous_key_version = p_previous_key_version
      )
    )
  order by (subject.anonymous_key_hmac = p_active_hmac) desc
  limit 1
  for update;

  if found then
    if resolved_subject.anonymous_key_hmac = p_active_hmac then
      return query select resolved_subject.id, false, false;
      return;
    end if;

    update core.data_subjects
    set
      anonymous_key_hmac = p_active_hmac,
      anonymous_key_version = p_active_key_version
    where id = resolved_subject.id;

    return query select resolved_subject.id, false, true;
    return;
  end if;

  insert into core.data_subjects (
    anonymous_key_hmac,
    anonymous_key_version,
    status
  )
  values (
    p_active_hmac,
    p_active_key_version,
    'anonymous'
  )
  returning id into data_subject_id;

  return query select data_subject_id, true, false;
end;
$$;

revoke all on function api.resolve_anonymous_subject_v1(
  bytea,
  smallint,
  bytea,
  smallint
) from public, anon, authenticated, service_role;
grant execute on function api.resolve_anonymous_subject_v1(
  bytea,
  smallint,
  bytea,
  smallint
) to service_role;

comment on function api.resolve_anonymous_subject_v1(
  bytea,
  smallint,
  bytea,
  smallint
) is
  'Server-only anonymous subject resolver. Previous-key matches rotate in place so identity, quota, and contribution history retain the same data_subject_id.';

create function security.consume_quota_v1(
  p_scope text,
  p_subject_type text,
  p_subject_hmac bytea,
  p_window_start timestamptz,
  p_window_kind text,
  p_limit integer,
  p_counter_kind text,
  p_policy_version text,
  p_policy_hash bytea,
  p_expires_at timestamptz
)
returns table (
  allowed boolean,
  current_count integer,
  remaining integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  consumed_count integer;
  existing_policy_version text;
  existing_policy_hash bytea;
begin
  if p_limit is null or p_limit <= 0 or p_limit > 100000 then
    raise exception using errcode = '22023', message = 'quota_limit_invalid';
  end if;

  if p_counter_kind not in ('attempt', 'accepted') then
    raise exception using errcode = '22023', message = 'quota_counter_kind_invalid';
  end if;

  if p_window_start is null or p_expires_at is null
    or p_expires_at <= p_window_start
  then
    raise exception using errcode = '22023', message = 'quota_window_invalid';
  end if;

  if p_expires_at <= statement_timestamp() then
    raise exception using errcode = '22023', message = 'quota_window_expired';
  end if;

  if p_counter_kind = 'attempt' then
    insert into security.submission_quota_buckets (
      scope,
      subject_type,
      subject_hmac,
      window_start,
      window_kind,
      attempt_count,
      accepted_count,
      policy_version,
      policy_hash,
      expires_at
    )
    values (
      p_scope,
      p_subject_type,
      p_subject_hmac,
      p_window_start,
      p_window_kind,
      1,
      0,
      p_policy_version,
      p_policy_hash,
      p_expires_at
    )
    on conflict (scope, subject_type, subject_hmac, window_start, window_kind)
    do update
    set attempt_count = security.submission_quota_buckets.attempt_count + 1
    where security.submission_quota_buckets.attempt_count < p_limit
      and security.submission_quota_buckets.policy_version = p_policy_version
      and security.submission_quota_buckets.policy_hash = p_policy_hash
    returning attempt_count into consumed_count;
  else
    insert into security.submission_quota_buckets (
      scope,
      subject_type,
      subject_hmac,
      window_start,
      window_kind,
      attempt_count,
      accepted_count,
      policy_version,
      policy_hash,
      expires_at
    )
    values (
      p_scope,
      p_subject_type,
      p_subject_hmac,
      p_window_start,
      p_window_kind,
      0,
      1,
      p_policy_version,
      p_policy_hash,
      p_expires_at
    )
    on conflict (scope, subject_type, subject_hmac, window_start, window_kind)
    do update
    set accepted_count = security.submission_quota_buckets.accepted_count + 1
    where security.submission_quota_buckets.accepted_count < p_limit
      and security.submission_quota_buckets.policy_version = p_policy_version
      and security.submission_quota_buckets.policy_hash = p_policy_hash
    returning accepted_count into consumed_count;
  end if;

  if consumed_count is not null then
    return query select true, consumed_count, greatest(p_limit - consumed_count, 0);
    return;
  end if;

  select bucket.policy_version, bucket.policy_hash,
    case
      when p_counter_kind = 'attempt' then bucket.attempt_count
      else bucket.accepted_count
    end
  into existing_policy_version, existing_policy_hash, consumed_count
  from security.submission_quota_buckets as bucket
  where bucket.scope = p_scope
    and bucket.subject_type = p_subject_type
    and bucket.subject_hmac = p_subject_hmac
    and bucket.window_start = p_window_start
    and bucket.window_kind = p_window_kind;

  if existing_policy_version is distinct from p_policy_version
    or existing_policy_hash is distinct from p_policy_hash
  then
    raise exception using errcode = '22023', message = 'quota_policy_mismatch';
  end if;

  return query select false, consumed_count, 0;
end;
$$;

revoke all on function security.consume_quota_v1(
  text,
  text,
  bytea,
  timestamptz,
  text,
  integer,
  text,
  text,
  bytea,
  timestamptz
) from public, anon, authenticated, service_role;

comment on function security.consume_quota_v1(
  text,
  text,
  bytea,
  timestamptz,
  text,
  integer,
  text,
  text,
  bytea,
  timestamptz
) is
  'Internal atomic quota primitive. Future intake commands call accepted counters inside the same transaction as their domain insert.';

create function api.consume_submission_quota_v1(
  p_scope text,
  p_subject_type text,
  p_subject_hmac bytea,
  p_window_start timestamptz,
  p_window_kind text,
  p_limit integer,
  p_counter_kind text,
  p_policy_version text,
  p_policy_hash bytea,
  p_expires_at timestamptz
)
returns table (
  allowed boolean,
  current_count integer,
  remaining integer
)
language sql
security definer
set search_path = ''
as $$
  select *
  from security.consume_quota_v1(
    p_scope,
    p_subject_type,
    p_subject_hmac,
    p_window_start,
    p_window_kind,
    p_limit,
    p_counter_kind,
    p_policy_version,
    p_policy_hash,
    p_expires_at
  );
$$;

revoke all on function api.consume_submission_quota_v1(
  text,
  text,
  bytea,
  timestamptz,
  text,
  integer,
  text,
  text,
  bytea,
  timestamptz
) from public, anon, authenticated, service_role;
grant execute on function api.consume_submission_quota_v1(
  text,
  text,
  bytea,
  timestamptz,
  text,
  integer,
  text,
  text,
  bytea,
  timestamptz
) to service_role;

create function api.claim_idempotency_v1(
  p_subject_type text,
  p_subject_hmac bytea,
  p_operation_code text,
  p_idempotency_key_hmac bytea,
  p_request_fingerprint bytea,
  p_expires_at timestamptz
)
returns table (
  outcome text,
  record_status text,
  resource_type text,
  resource_id uuid,
  response_code smallint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_record security.api_idempotency_records%rowtype;
  has_existing_record boolean := false;
begin
  if p_expires_at is null or p_expires_at <= statement_timestamp() then
    raise exception using errcode = '22023', message = 'idempotency_expiry_invalid';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'idempotency:' || p_subject_type || ':' || encode(p_subject_hmac, 'hex') ||
      ':' || p_operation_code || ':' || encode(p_idempotency_key_hmac, 'hex'),
      0
    )
  );

  select record.*
  into existing_record
  from security.api_idempotency_records as record
  where record.subject_type = p_subject_type
    and record.subject_hmac = p_subject_hmac
    and record.operation_code = p_operation_code
    and record.idempotency_key_hmac = p_idempotency_key_hmac
  for update;

  has_existing_record := found;

  if has_existing_record
    and existing_record.expires_at <= statement_timestamp()
  then
    delete from security.api_idempotency_records
    where subject_type = p_subject_type
      and subject_hmac = p_subject_hmac
      and operation_code = p_operation_code
      and idempotency_key_hmac = p_idempotency_key_hmac;
    has_existing_record := false;
  end if;

  if has_existing_record then
    if existing_record.request_fingerprint <> p_request_fingerprint then
      return query select 'conflict', existing_record.status,
        existing_record.resource_type, existing_record.resource_id,
        existing_record.response_code;
      return;
    end if;

    if existing_record.status = 'completed' then
      return query select 'replay', existing_record.status,
        existing_record.resource_type, existing_record.resource_id,
        existing_record.response_code;
      return;
    end if;

    if existing_record.status = 'processing' then
      return query select 'in_progress', existing_record.status,
        null::text, null::uuid, existing_record.response_code;
      return;
    end if;

    update security.api_idempotency_records
    set
      status = 'processing',
      response_code = null,
      expires_at = p_expires_at
    where subject_type = p_subject_type
      and subject_hmac = p_subject_hmac
      and operation_code = p_operation_code
      and idempotency_key_hmac = p_idempotency_key_hmac;

    return query select 'claimed', 'processing', null::text, null::uuid,
      null::smallint;
    return;
  end if;

  insert into security.api_idempotency_records (
    subject_type,
    subject_hmac,
    operation_code,
    idempotency_key_hmac,
    request_fingerprint,
    expires_at
  )
  values (
    p_subject_type,
    p_subject_hmac,
    p_operation_code,
    p_idempotency_key_hmac,
    p_request_fingerprint,
    p_expires_at
  );

  return query select 'claimed', 'processing', null::text, null::uuid,
    null::smallint;
end;
$$;

revoke all on function api.claim_idempotency_v1(
  text,
  bytea,
  text,
  bytea,
  bytea,
  timestamptz
) from public, anon, authenticated, service_role;
grant execute on function api.claim_idempotency_v1(
  text,
  bytea,
  text,
  bytea,
  bytea,
  timestamptz
) to service_role;

create function api.complete_idempotency_v1(
  p_subject_type text,
  p_subject_hmac bytea,
  p_operation_code text,
  p_idempotency_key_hmac bytea,
  p_request_fingerprint bytea,
  p_resource_type text,
  p_resource_id uuid,
  p_response_code smallint
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update security.api_idempotency_records
  set
    status = 'completed',
    resource_type = p_resource_type,
    resource_id = p_resource_id,
    response_code = p_response_code
  where subject_type = p_subject_type
    and subject_hmac = p_subject_hmac
    and operation_code = p_operation_code
    and idempotency_key_hmac = p_idempotency_key_hmac
    and request_fingerprint = p_request_fingerprint
    and status = 'processing'
    and expires_at > statement_timestamp();

  if not found then
    raise exception using errcode = '55000', message = 'idempotency_completion_invalid';
  end if;

  return true;
end;
$$;

revoke all on function api.complete_idempotency_v1(
  text,
  bytea,
  text,
  bytea,
  bytea,
  text,
  uuid,
  smallint
) from public, anon, authenticated, service_role;
grant execute on function api.complete_idempotency_v1(
  text,
  bytea,
  text,
  bytea,
  bytea,
  text,
  uuid,
  smallint
) to service_role;

create function api.fail_idempotency_v1(
  p_subject_type text,
  p_subject_hmac bytea,
  p_operation_code text,
  p_idempotency_key_hmac bytea,
  p_request_fingerprint bytea,
  p_response_code smallint
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update security.api_idempotency_records
  set
    status = 'failed',
    resource_type = null,
    resource_id = null,
    response_code = p_response_code
  where subject_type = p_subject_type
    and subject_hmac = p_subject_hmac
    and operation_code = p_operation_code
    and idempotency_key_hmac = p_idempotency_key_hmac
    and request_fingerprint = p_request_fingerprint
    and status = 'processing'
    and expires_at > statement_timestamp();

  if not found then
    raise exception using errcode = '55000', message = 'idempotency_failure_invalid';
  end if;

  return true;
end;
$$;

revoke all on function api.fail_idempotency_v1(
  text,
  bytea,
  text,
  bytea,
  bytea,
  smallint
) from public, anon, authenticated, service_role;
grant execute on function api.fail_idempotency_v1(
  text,
  bytea,
  text,
  bytea,
  bytea,
  smallint
) to service_role;

create function api.cleanup_security_ephemera_v1(
  p_batch_size integer default 1000
)
returns table (
  quota_rows_deleted integer,
  idempotency_rows_deleted integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  quota_count integer;
  idempotency_count integer;
begin
  if p_batch_size is null or p_batch_size < 1 or p_batch_size > 10000 then
    raise exception using errcode = '22023', message = 'cleanup_batch_size_invalid';
  end if;

  with expired as (
    select bucket.ctid
    from security.submission_quota_buckets as bucket
    where bucket.expires_at <= statement_timestamp()
    order by bucket.expires_at
    limit p_batch_size
    for update skip locked
  )
  delete from security.submission_quota_buckets as bucket
  using expired
  where bucket.ctid = expired.ctid;
  get diagnostics quota_count = row_count;

  with expired as (
    select record.ctid
    from security.api_idempotency_records as record
    where record.expires_at <= statement_timestamp()
    order by record.expires_at
    limit p_batch_size
    for update skip locked
  )
  delete from security.api_idempotency_records as record
  using expired
  where record.ctid = expired.ctid;
  get diagnostics idempotency_count = row_count;

  return query select quota_count, idempotency_count;
end;
$$;

revoke all on function api.cleanup_security_ephemera_v1(integer)
  from public, anon, authenticated, service_role;
grant execute on function api.cleanup_security_ephemera_v1(integer)
  to service_role;

commit;
