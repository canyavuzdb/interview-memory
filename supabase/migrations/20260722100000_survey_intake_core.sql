begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

create schema intake;

comment on schema intake is
  'Private immutable survey intake envelopes and domain snapshots. Browser roles never access this schema directly.';

revoke all on schema intake from public, anon, authenticated, service_role;

alter default privileges for role postgres in schema intake
  revoke all on tables from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema intake
  revoke all on sequences from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema intake
  revoke execute on routines from public, anon, authenticated, service_role;

create table intake.survey_submissions (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null default gen_random_uuid(),
  data_subject_id uuid not null
    references core.data_subjects (id) on delete restrict,
  survey_type text not null,
  schema_version integer not null,
  locale text not null,
  notice_version_id uuid not null
    references privacy.notice_versions (id) on delete restrict,
  payload_hash bytea not null,
  command_fingerprint bytea not null,
  lifecycle_status text not null default 'accepted',
  quality_status text not null default 'pending',
  supersedes_submission_id uuid
    references intake.survey_submissions (id) on delete restrict,
  capability_hmac bytea,
  capability_key_version smallint,
  capability_expires_at timestamptz,
  submitted_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  constraint survey_submissions_receipt_unique unique (receipt_id),
  constraint survey_submissions_command_unique unique (
    data_subject_id,
    survey_type,
    command_fingerprint
  ),
  constraint survey_submissions_survey_type_check check (
    survey_type in ('search_benchmark', 'company_experience')
  ),
  constraint survey_submissions_schema_version_check check (
    schema_version between 1 and 1000
  ),
  constraint survey_submissions_locale_check check (locale in ('tr', 'en')),
  constraint survey_submissions_payload_hash_check check (
    octet_length(payload_hash) = 32
  ),
  constraint survey_submissions_command_fingerprint_check check (
    octet_length(command_fingerprint) = 32
  ),
  constraint survey_submissions_lifecycle_status_check check (
    lifecycle_status in ('accepted', 'withdrawn', 'superseded')
  ),
  constraint survey_submissions_quality_status_check check (
    quality_status in ('pending', 'eligible', 'excluded')
  ),
  constraint survey_submissions_no_self_supersede_check check (
    supersedes_submission_id is null or supersedes_submission_id <> id
  ),
  constraint survey_submissions_capability_tuple_check check (
    (capability_hmac is null) = (capability_key_version is null)
    and (capability_hmac is null) = (capability_expires_at is null)
  ),
  constraint survey_submissions_capability_hmac_check check (
    capability_hmac is null or octet_length(capability_hmac) = 32
  ),
  constraint survey_submissions_capability_key_version_check check (
    capability_key_version is null or capability_key_version > 0
  ),
  constraint survey_submissions_capability_expiry_check check (
    capability_expires_at is null or capability_expires_at > submitted_at
  ),
  constraint survey_submissions_withdrawal_state_check check (
    (lifecycle_status = 'withdrawn' and withdrawn_at is not null)
    or (lifecycle_status <> 'withdrawn' and withdrawn_at is null)
  )
);

create index survey_submissions_subject_timeline_idx
  on intake.survey_submissions (data_subject_id, submitted_at desc, id);
create index survey_submissions_type_quality_timeline_idx
  on intake.survey_submissions (
    survey_type,
    quality_status,
    submitted_at desc,
    id
  );
create index survey_submissions_supersedes_idx
  on intake.survey_submissions (supersedes_submission_id)
  where supersedes_submission_id is not null;
create index survey_submissions_capability_expiry_idx
  on intake.survey_submissions (capability_expires_at)
  where capability_expires_at is not null;

comment on table intake.survey_submissions is
  'T23 durable survey command envelope. It stores no raw capability, request body, IP address, user-agent, free text, or moderation decision.';

alter table intake.survey_submissions enable row level security;
alter table intake.survey_submissions force row level security;

alter table privacy.consent_events
  add constraint consent_events_submission_id_fkey
  foreign key (submission_id)
  references intake.survey_submissions (id)
  on delete set null;

create function security.constant_time_equal_v1(
  p_left bytea,
  p_right bytea
)
returns boolean
language plpgsql
immutable
strict
security definer
set search_path = ''
as $$
declare
  difference integer := 0;
begin
  if octet_length(p_left) <> octet_length(p_right) then
    return false;
  end if;

  for byte_index in 0..octet_length(p_left) - 1 loop
    difference := difference |
      (get_byte(p_left, byte_index) # get_byte(p_right, byte_index));
  end loop;

  return difference = 0;
end;
$$;

revoke all on function security.constant_time_equal_v1(bytea, bytea)
  from public, anon, authenticated, service_role;

-- Called only by future domain-specific SECURITY DEFINER command RPCs. Because
-- this function runs inside the caller's transaction, a later domain insert
-- failure rolls back the accepted quota, consent event, and envelope together.
create function intake.begin_survey_submission_v1(
  p_data_subject_id uuid,
  p_survey_type text,
  p_schema_version integer,
  p_locale text,
  p_notice_version_id uuid,
  p_payload_hash bytea,
  p_command_fingerprint bytea,
  p_supersedes_submission_id uuid,
  p_capability_hmac bytea,
  p_capability_key_version smallint,
  p_capability_expires_at timestamptz,
  p_consent_subject_proof_hmac bytea,
  p_consent_subject_proof_key_version smallint,
  p_consent_idempotency_key uuid,
  p_idempotency_subject_hmac bytea,
  p_idempotency_operation_code text,
  p_idempotency_key_hmac bytea,
  p_idempotency_request_fingerprint bytea,
  p_quota_scope text,
  p_quota_subject_hmac bytea,
  p_quota_window_start timestamptz,
  p_quota_window_kind text,
  p_quota_limit integer,
  p_quota_policy_version text,
  p_quota_policy_hash bytea,
  p_quota_expires_at timestamptz
)
returns table (
  submission_id uuid,
  receipt_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  subject_record core.data_subjects%rowtype;
  quota_result record;
  inserted_submission_id uuid;
  inserted_receipt_id uuid;
  event_time timestamptz := pg_catalog.clock_timestamp();
begin
  select subject.*
  into subject_record
  from core.data_subjects as subject
  where subject.id = p_data_subject_id
    and subject.status in ('anonymous', 'authenticated')
  for share;

  if not found then
    raise exception using errcode = '22023', message = 'active_data_subject_not_found';
  end if;

  if subject_record.status = 'anonymous' and (
    p_capability_hmac is null
    or octet_length(p_capability_hmac) <> 32
    or p_capability_key_version is null
    or p_capability_key_version <= 0
    or p_capability_expires_at is null
    or p_capability_expires_at <= event_time
  ) then
    raise exception using errcode = '22023', message = 'anonymous_capability_required';
  end if;

  if subject_record.status = 'authenticated' and (
    p_capability_hmac is not null
    or p_capability_key_version is not null
    or p_capability_expires_at is not null
  ) then
    raise exception using errcode = '22023', message = 'authenticated_capability_forbidden';
  end if;

  perform 1
  from privacy.notice_versions as notice
  where notice.id = p_notice_version_id
    and notice.document_type = 'survey_notice'
    and notice.locale = p_locale
    and notice.effective_from <= event_time
    and (notice.retired_at is null or notice.retired_at > event_time)
  for share;

  if not found then
    raise exception using errcode = '22023', message = 'survey_notice_not_effective';
  end if;

  if not exists (
    select 1
    from security.api_idempotency_records as record
    where record.subject_type = 'data_subject'
      and record.subject_hmac = p_idempotency_subject_hmac
      and record.operation_code = p_idempotency_operation_code
      and record.idempotency_key_hmac = p_idempotency_key_hmac
      and record.request_fingerprint = p_idempotency_request_fingerprint
      and record.status = 'processing'
      and record.expires_at > event_time
    for update
  ) then
    raise exception using errcode = '55000', message = 'idempotency_claim_required';
  end if;

  select *
  into quota_result
  from security.consume_quota_v1(
    p_quota_scope,
    'data_subject',
    p_quota_subject_hmac,
    p_quota_window_start,
    p_quota_window_kind,
    p_quota_limit,
    'accepted',
    p_quota_policy_version,
    p_quota_policy_hash,
    p_quota_expires_at
  );

  if not quota_result.allowed then
    raise exception using errcode = 'P0001', message = 'accepted_quota_exceeded';
  end if;

  insert into intake.survey_submissions (
    data_subject_id,
    survey_type,
    schema_version,
    locale,
    notice_version_id,
    payload_hash,
    command_fingerprint,
    supersedes_submission_id,
    capability_hmac,
    capability_key_version,
    capability_expires_at,
    submitted_at
  )
  values (
    p_data_subject_id,
    p_survey_type,
    p_schema_version,
    p_locale,
    p_notice_version_id,
    p_payload_hash,
    p_command_fingerprint,
    p_supersedes_submission_id,
    p_capability_hmac,
    p_capability_key_version,
    p_capability_expires_at,
    event_time
  )
  returning survey_submissions.id, survey_submissions.receipt_id
  into inserted_submission_id, inserted_receipt_id;

  insert into privacy.consent_events (
    data_subject_id,
    subject_proof_hmac,
    subject_proof_key_version,
    notice_version_id,
    submission_id,
    purpose_code,
    decision,
    event_source,
    idempotency_key,
    occurred_at,
    created_at
  )
  values (
    p_data_subject_id,
    p_consent_subject_proof_hmac,
    p_consent_subject_proof_key_version,
    p_notice_version_id,
    inserted_submission_id,
    'survey_contribution',
    'granted',
    'survey',
    p_consent_idempotency_key,
    event_time,
    event_time
  );

  return query select inserted_submission_id, inserted_receipt_id;
end;
$$;

revoke all on function intake.begin_survey_submission_v1(
  uuid, text, integer, text, uuid, bytea, bytea, uuid, bytea, smallint,
  timestamptz, bytea, smallint, uuid, bytea, text, bytea, bytea, text,
  bytea, timestamptz, text, integer, text, bytea, timestamptz
) from public, anon, authenticated, service_role;

create function intake.complete_survey_submission_v1(
  p_idempotency_subject_hmac bytea,
  p_idempotency_operation_code text,
  p_idempotency_key_hmac bytea,
  p_idempotency_request_fingerprint bytea,
  p_submission_id uuid,
  p_response_code smallint default 201
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from intake.survey_submissions as submission
    where submission.id = p_submission_id
  ) then
    raise exception using errcode = '22023', message = 'submission_not_found';
  end if;

  return api.complete_idempotency_v1(
    'data_subject',
    p_idempotency_subject_hmac,
    p_idempotency_operation_code,
    p_idempotency_key_hmac,
    p_idempotency_request_fingerprint,
    'survey_submission',
    p_submission_id,
    p_response_code
  );
end;
$$;

revoke all on function intake.complete_survey_submission_v1(
  bytea, text, bytea, bytea, uuid, smallint
) from public, anon, authenticated, service_role;

create function api.resolve_authenticated_subject_v1(
  p_auth_user_id uuid
)
returns table (data_subject_id uuid)
language sql
stable
security definer
set search_path = ''
as $$
  select subject.id
  from core.data_subjects as subject
  where subject.auth_user_id = p_auth_user_id
    and subject.status = 'authenticated'
  limit 1;
$$;

revoke all on function api.resolve_authenticated_subject_v1(uuid)
  from public, anon, authenticated, service_role;
grant execute on function api.resolve_authenticated_subject_v1(uuid)
  to service_role;

create function api.merge_anonymous_subject_v1(
  p_auth_user_id uuid,
  p_active_anonymous_hmac bytea,
  p_previous_anonymous_hmac bytea,
  p_anonymous_quota_subject_hmac bytea,
  p_authenticated_quota_subject_hmac bytea
)
returns table (
  data_subject_id uuid,
  merged boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  authenticated_subject core.data_subjects%rowtype;
  anonymous_subject core.data_subjects%rowtype;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('subject-merge:' || p_auth_user_id::text, 0)
  );

  select subject.*
  into authenticated_subject
  from core.data_subjects as subject
  where subject.auth_user_id = p_auth_user_id
    and subject.status = 'authenticated'
  for update;

  if not found then
    raise exception using errcode = '22023', message = 'authenticated_subject_not_found';
  end if;

  select subject.*
  into anonymous_subject
  from core.data_subjects as subject
  where subject.status = 'anonymous'
    and subject.anonymous_key_hmac in (
      p_active_anonymous_hmac,
      p_previous_anonymous_hmac
    )
  order by
    case when subject.anonymous_key_hmac = p_active_anonymous_hmac then 0 else 1 end
  limit 1
  for update;

  if not found then
    return query select authenticated_subject.id, false;
    return;
  end if;

  update intake.survey_submissions as submission
  set data_subject_id = authenticated_subject.id
  where submission.data_subject_id = anonymous_subject.id;

  update privacy.consent_events as event
  set data_subject_id = authenticated_subject.id
  where event.data_subject_id = anonymous_subject.id;

  if exists (
    select 1
    from security.submission_quota_buckets as anonymous_bucket
    inner join security.submission_quota_buckets as authenticated_bucket
      on authenticated_bucket.scope = anonymous_bucket.scope
      and authenticated_bucket.subject_type = anonymous_bucket.subject_type
      and authenticated_bucket.window_start = anonymous_bucket.window_start
      and authenticated_bucket.window_kind = anonymous_bucket.window_kind
      and authenticated_bucket.subject_hmac
        = p_authenticated_quota_subject_hmac
    where anonymous_bucket.subject_type = 'data_subject'
      and anonymous_bucket.subject_hmac = p_anonymous_quota_subject_hmac
      and (
        authenticated_bucket.policy_version
          is distinct from anonymous_bucket.policy_version
        or authenticated_bucket.policy_hash
          is distinct from anonymous_bucket.policy_hash
      )
  ) then
    raise exception using errcode = '22023', message = 'quota_policy_mismatch';
  end if;

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
  select
    bucket.scope,
    bucket.subject_type,
    p_authenticated_quota_subject_hmac,
    bucket.window_start,
    bucket.window_kind,
    bucket.attempt_count,
    bucket.accepted_count,
    bucket.policy_version,
    bucket.policy_hash,
    bucket.expires_at
  from security.submission_quota_buckets as bucket
  where bucket.subject_type = 'data_subject'
    and bucket.subject_hmac = p_anonymous_quota_subject_hmac
  on conflict (scope, subject_type, subject_hmac, window_start, window_kind)
  do update set
    attempt_count = security.submission_quota_buckets.attempt_count
      + excluded.attempt_count,
    accepted_count = security.submission_quota_buckets.accepted_count
      + excluded.accepted_count,
    expires_at = greatest(
      security.submission_quota_buckets.expires_at,
      excluded.expires_at
    )
  where security.submission_quota_buckets.policy_version
      = excluded.policy_version
    and security.submission_quota_buckets.policy_hash = excluded.policy_hash;

  delete from security.submission_quota_buckets
  where subject_type = 'data_subject'
    and subject_hmac = p_anonymous_quota_subject_hmac;

  update core.data_subjects
  set
    status = 'merged',
    auth_user_id = null,
    anonymous_key_hmac = null,
    anonymous_key_version = null,
    merged_into_id = authenticated_subject.id,
    deleted_at = pg_catalog.clock_timestamp()
  where id = anonymous_subject.id;

  return query select authenticated_subject.id, true;
end;
$$;

revoke all on function api.merge_anonymous_subject_v1(
  uuid, bytea, bytea, bytea, bytea
) from public, anon, authenticated, service_role;
grant execute on function api.merge_anonymous_subject_v1(
  uuid, bytea, bytea, bytea, bytea
) to service_role;

create function api.get_submission_receipt_v1(
  p_receipt_id uuid,
  p_requester_data_subject_id uuid default null,
  p_active_capability_hmac bytea default null,
  p_active_capability_key_version smallint default null,
  p_previous_capability_hmac bytea default null,
  p_previous_capability_key_version smallint default null
)
returns table (
  receipt_id uuid,
  survey_type text,
  lifecycle_status text,
  quality_status text,
  submitted_at timestamptz,
  withdrawn_at timestamptz,
  capability_rotated boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  submission intake.survey_submissions%rowtype;
  authorized boolean := false;
  rotate_capability boolean := false;
begin
  select record.*
  into submission
  from intake.survey_submissions as record
  where record.receipt_id = p_receipt_id
  for update;

  if not found then
    return;
  end if;

  if p_requester_data_subject_id is not null
    and submission.data_subject_id = p_requester_data_subject_id
  then
    authorized := true;
  elsif submission.capability_expires_at > statement_timestamp()
    and p_active_capability_hmac is not null
    and security.constant_time_equal_v1(
      submission.capability_hmac,
      p_active_capability_hmac
    )
    and submission.capability_key_version = p_active_capability_key_version
  then
    authorized := true;
  elsif submission.capability_expires_at > statement_timestamp()
    and p_previous_capability_hmac is not null
    and security.constant_time_equal_v1(
      submission.capability_hmac,
      p_previous_capability_hmac
    )
    and submission.capability_key_version = p_previous_capability_key_version
    and p_active_capability_hmac is not null
    and octet_length(p_active_capability_hmac) = 32
    and p_active_capability_key_version is not null
    and p_active_capability_key_version > 0
  then
    authorized := true;
    rotate_capability := true;
  end if;

  if not authorized then
    return;
  end if;

  if rotate_capability then
    update intake.survey_submissions
    set
      capability_hmac = p_active_capability_hmac,
      capability_key_version = p_active_capability_key_version
    where id = submission.id;
  end if;

  return query
  select submission.receipt_id, submission.survey_type,
    submission.lifecycle_status, submission.quality_status,
    submission.submitted_at, submission.withdrawn_at, rotate_capability;
end;
$$;

revoke all on function api.get_submission_receipt_v1(
  uuid, uuid, bytea, smallint, bytea, smallint
) from public, anon, authenticated, service_role;
grant execute on function api.get_submission_receipt_v1(
  uuid, uuid, bytea, smallint, bytea, smallint
) to service_role;

comment on function api.get_submission_receipt_v1(
  uuid, uuid, bytea, smallint, bytea, smallint
) is
  'Server-only minimal receipt lookup. Authorization uses a trusted data subject or a high-entropy capability HMAC; failed lookups disclose no existence signal.';

revoke all on all tables in schema intake
  from public, anon, authenticated, service_role;
revoke all on all sequences in schema intake
  from public, anon, authenticated, service_role;

commit;
