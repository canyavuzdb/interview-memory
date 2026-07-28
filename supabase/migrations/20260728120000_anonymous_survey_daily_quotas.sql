begin;

-- A quota limit of zero is reserved for authenticated submissions. The domain
-- command still performs all validation, consent, and idempotency work, but
-- does not create or consume an anonymous quota bucket.
create or replace function intake.begin_survey_submission_v1(
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
returns table (submission_id uuid, receipt_id uuid)
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
  select subject.* into subject_record
  from core.data_subjects as subject
  where subject.id = p_data_subject_id
    and subject.status in ('anonymous', 'authenticated')
  for share;

  if not found then
    raise exception using errcode = '22023', message = 'active_data_subject_not_found';
  end if;

  if subject_record.status = 'anonymous' and (
    p_capability_hmac is null or octet_length(p_capability_hmac) <> 32
    or p_capability_key_version is null or p_capability_key_version <= 0
    or p_capability_expires_at is null or p_capability_expires_at <= event_time
  ) then
    raise exception using errcode = '22023', message = 'anonymous_capability_required';
  end if;

  if subject_record.status = 'authenticated' and (
    p_capability_hmac is not null or p_capability_key_version is not null
    or p_capability_expires_at is not null
  ) then
    raise exception using errcode = '22023', message = 'authenticated_capability_forbidden';
  end if;

  perform 1 from privacy.notice_versions as notice
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
    select 1 from security.api_idempotency_records as record
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

  if p_quota_limit > 0 then
    select * into quota_result
    from security.consume_quota_v1(
      p_quota_scope, 'data_subject', p_quota_subject_hmac,
      p_quota_window_start, p_quota_window_kind, p_quota_limit, 'accepted',
      p_quota_policy_version, p_quota_policy_hash, p_quota_expires_at
    );

    if not quota_result.allowed then
      raise exception using errcode = 'P0001', message = 'accepted_quota_exceeded';
    end if;
  end if;

  insert into intake.survey_submissions (
    data_subject_id, survey_type, schema_version, locale, notice_version_id,
    payload_hash, command_fingerprint, supersedes_submission_id,
    capability_hmac, capability_key_version, capability_expires_at, submitted_at
  ) values (
    p_data_subject_id, p_survey_type, p_schema_version, p_locale, p_notice_version_id,
    p_payload_hash, p_command_fingerprint, p_supersedes_submission_id,
    p_capability_hmac, p_capability_key_version, p_capability_expires_at, event_time
  ) returning id, receipt_id into inserted_submission_id, inserted_receipt_id;

  insert into privacy.consent_events (
    data_subject_id, subject_proof_hmac, subject_proof_key_version,
    notice_version_id, submission_id, purpose_code, decision, event_source,
    idempotency_key, occurred_at, created_at
  ) values (
    p_data_subject_id, p_consent_subject_proof_hmac, p_consent_subject_proof_key_version,
    p_notice_version_id, inserted_submission_id, 'survey_contribution', 'granted', 'survey',
    p_consent_idempotency_key, event_time, event_time
  );

  return query select inserted_submission_id, inserted_receipt_id;
end;
$$;

-- Server-only read model for the form entry screen. It deliberately returns
-- only the counter and does not expose the HMAC or the quota bucket table.
create function api.get_submission_quota_status_v1(
  p_scope text,
  p_subject_hmac bytea,
  p_window_start timestamptz,
  p_window_kind text,
  p_limit integer,
  p_policy_version text,
  p_policy_hash bytea
)
returns table (current_count integer, remaining integer)
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce(bucket.accepted_count, 0)::integer as current_count,
    greatest(p_limit - coalesce(bucket.accepted_count, 0), 0)::integer as remaining
  from (select 1) as singleton
  left join security.submission_quota_buckets as bucket
    on bucket.scope = p_scope
    and bucket.subject_type = 'data_subject'
    and bucket.subject_hmac = p_subject_hmac
    and bucket.window_start = p_window_start
    and bucket.window_kind = p_window_kind
    and bucket.policy_version = p_policy_version
    and bucket.policy_hash = p_policy_hash;
$$;

revoke all on function api.get_submission_quota_status_v1(text, bytea, timestamptz, text, integer, text, bytea)
  from public, anon, authenticated;
grant execute on function api.get_submission_quota_status_v1(text, bytea, timestamptz, text, integer, text, bytea)
  to service_role;

create function api.create_interview_preparation_contribution_with_quota_v1(
  p_data_subject_id uuid,
  p_company_name text,
  p_applied_role text,
  p_seniority text,
  p_process_year smallint,
  p_stage_details jsonb,
  p_quota_subject_hmac bytea,
  p_quota_window_start timestamptz,
  p_quota_limit integer,
  p_quota_policy_version text,
  p_quota_policy_hash bytea,
  p_quota_expires_at timestamptz
)
returns table (contribution_id uuid, created_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_data_subject_id uuid;
  quota_result record;
begin
  select subject.id into v_data_subject_id
  from core.data_subjects as subject
  where subject.id = p_data_subject_id
    and subject.status in ('anonymous', 'authenticated')
    and subject.merged_into_id is null
    and subject.deleted_at is null;

  if v_data_subject_id is null then
    raise exception using errcode = '28000', message = 'preparation_subject_not_active';
  end if;

  if p_quota_limit > 0 then
    select * into quota_result
    from security.consume_quota_v1(
      'survey.interview-preparation.anonymous', 'data_subject', p_quota_subject_hmac,
      p_quota_window_start, 'accepted_day', p_quota_limit, 'accepted',
      p_quota_policy_version, p_quota_policy_hash, p_quota_expires_at
    );
    if not quota_result.allowed then
      raise exception using errcode = 'P0001', message = 'accepted_quota_exceeded';
    end if;
  end if;

  return query
  insert into intake.interview_preparation_contributions (
    data_subject_id, company_name, applied_role, seniority, process_year, stage_details
  ) values (
    v_data_subject_id, btrim(p_company_name), btrim(p_applied_role), p_seniority, p_process_year, p_stage_details
  ) returning id, intake.interview_preparation_contributions.created_at;
end;
$$;

revoke all on function api.create_interview_preparation_contribution_with_quota_v1(
  uuid, text, text, text, smallint, jsonb, bytea, timestamptz, integer, text, bytea, timestamptz
) from public, anon, authenticated;
grant execute on function api.create_interview_preparation_contribution_with_quota_v1(
  uuid, text, text, text, smallint, jsonb, bytea, timestamptz, integer, text, bytea, timestamptz
) to service_role;

commit;
