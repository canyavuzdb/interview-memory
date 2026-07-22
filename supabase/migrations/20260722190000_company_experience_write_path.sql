begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

alter table privacy.notice_versions
  drop constraint notice_versions_document_type_check;
alter table privacy.notice_versions
  add constraint notice_versions_document_type_check check (
    document_type in (
      'account_notice', 'survey_notice', 'company_experience_notice',
      'cookie_notice', 'publication_consent'
    )
  );

create or replace function privacy.is_notice_purpose_compatible(
  p_document_type text,
  p_purpose_code text
)
returns boolean
language sql
immutable
parallel safe
set search_path = ''
as $$
  select
    (p_document_type = 'account_notice' and p_purpose_code = 'account_service')
    or (
      p_document_type in ('survey_notice', 'company_experience_notice')
      and p_purpose_code in ('survey_contribution', 'experience_follow_up')
    )
    or (
      p_document_type = 'publication_consent'
      and p_purpose_code = 'benchmark_publication'
    );
$$;

with notice_seed (id, locale, version, content, content_uri) as (
  values
    (
      'b9000000-0000-4000-8300-000000000001'::uuid,
      'tr'::text,
      'survey-contribution-2026-07-22.v2'::text,
      'Göndererek; yanıtımın anonim analiz ve moderasyon amacıyla özel olarak saklanmasını, isteğe bağlı notlarda tanımlayıcı bilgi paylaşmamam gerektiğini, giriş yaptıysam hesabımla ilişkilendirilmesini ve yalnız moderasyon ile yeterli örneklem sonrasında toplu sonuçlarda kullanılmasını kabul ediyorum.'::text,
      'https://interview-memory.vercel.app/tr/surveys'::text
    ),
    (
      'b9000000-0000-4000-8300-000000000002'::uuid,
      'en'::text,
      'survey-contribution-2026-07-22.v2'::text,
      'By submitting, I agree that my response may be stored privately for anonymous analysis and moderation, that I must not share identifying details in optional notes, that it may be linked to my account if I am signed in, and that it may be used in aggregate results only after moderation and a sufficient sample size.'::text,
      'https://interview-memory.vercel.app/en/surveys'::text
    )
)
insert into privacy.notice_versions (
  id, document_type, locale, version, content_sha256, content_uri,
  effective_from
)
select seed.id, 'company_experience_notice', seed.locale, seed.version,
  extensions.digest(seed.content, 'sha256'), seed.content_uri,
  '2026-07-22 00:00:00+00'::timestamptz
from notice_seed as seed;

-- Keep the B07 primitive signature stable while binding each survey type to
-- its own accurate notice artifact.
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
    and (
      (p_survey_type = 'search_benchmark' and notice.document_type = 'survey_notice')
      or (
        p_survey_type = 'company_experience'
        and notice.document_type = 'company_experience_notice'
      )
    )
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

  select * into quota_result
  from security.consume_quota_v1(
    p_quota_scope, 'data_subject', p_quota_subject_hmac,
    p_quota_window_start, p_quota_window_kind, p_quota_limit, 'accepted',
    p_quota_policy_version, p_quota_policy_hash, p_quota_expires_at
  );

  if not quota_result.allowed then
    raise exception using errcode = 'P0001', message = 'accepted_quota_exceeded';
  end if;

  insert into intake.survey_submissions (
    data_subject_id, survey_type, schema_version, locale, notice_version_id,
    payload_hash, command_fingerprint, supersedes_submission_id,
    capability_hmac, capability_key_version, capability_expires_at,
    submitted_at
  ) values (
    p_data_subject_id, p_survey_type, p_schema_version, p_locale,
    p_notice_version_id, p_payload_hash, p_command_fingerprint,
    p_supersedes_submission_id, p_capability_hmac,
    p_capability_key_version, p_capability_expires_at, event_time
  ) returning survey_submissions.id, survey_submissions.receipt_id
  into inserted_submission_id, inserted_receipt_id;

  insert into privacy.consent_events (
    data_subject_id, subject_proof_hmac, subject_proof_key_version,
    notice_version_id, submission_id, purpose_code, decision, event_source,
    idempotency_key, occurred_at, created_at
  ) values (
    p_data_subject_id, p_consent_subject_proof_hmac,
    p_consent_subject_proof_key_version, p_notice_version_id,
    inserted_submission_id, 'survey_contribution', 'granted', 'survey',
    p_consent_idempotency_key, event_time, event_time
  );

  return query select inserted_submission_id, inserted_receipt_id;
end;
$$;

revoke all on function intake.begin_survey_submission_v1(
  uuid, text, integer, text, uuid, bytea, bytea, uuid, bytea, smallint,
  timestamptz, bytea, smallint, uuid, bytea, text, bytea, bytea, text,
  bytea, timestamptz, text, integer, text, bytea, timestamptz
) from public, anon, authenticated, service_role;

create table intake.company_experiences (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique
    references intake.survey_submissions (id) on delete restrict,
  company_id uuid
    references catalog.companies (id) on delete restrict,
  company_name text not null,
  applied_role text not null,
  process_year smallint not null,
  promised_timeline text not null,
  promised_days smallint,
  actual_days smallint,
  was_ghosted boolean not null,
  ghosted_after_stage text,
  interviewer_prepared smallint,
  was_asked_irrelevant boolean not null,
  irrelevant_types text[] not null default '{}',
  rejection_shared text not null,
  feedback_useful smallint,
  process_transparency smallint not null,
  hr_professionalism smallint not null,
  would_recommend_process text not null,
  free_note text,
  created_at timestamptz not null default now(),
  constraint company_experiences_company_name_check check (
    company_name = btrim(company_name)
    and char_length(company_name) between 2 and 200
    and company_name !~ '[[:cntrl:]]'
  ),
  constraint company_experiences_role_check check (
    applied_role = btrim(applied_role)
    and char_length(applied_role) between 2 and 120
    and applied_role !~ '[[:cntrl:]]'
  ),
  constraint company_experiences_year_check check (
    process_year between 2000 and 2100
  ),
  constraint company_experiences_promised_timeline_check check (
    promised_timeline in ('yes', 'no', 'not_specified')
  ),
  constraint company_experiences_promised_days_check check (
    (promised_timeline = 'yes' and promised_days between 0 and 3650)
    or (promised_timeline <> 'yes' and promised_days is null)
  ),
  constraint company_experiences_actual_days_check check (
    (not was_ghosted and actual_days between 0 and 3650)
    or (was_ghosted and actual_days is null)
  ),
  constraint company_experiences_ghosted_stage_check check (
    (was_ghosted and ghosted_after_stage in (
      'application', 'hr_screen', 'technical', 'final'
    ))
    or (not was_ghosted and ghosted_after_stage is null)
  ),
  constraint company_experiences_interviewer_rating_check check (
    interviewer_prepared is null or interviewer_prepared between 1 and 5
  ),
  constraint company_experiences_irrelevant_types_check check (
    (was_asked_irrelevant and cardinality(irrelevant_types) between 1 and 5)
    or (not was_asked_irrelevant and cardinality(irrelevant_types) = 0)
  ),
  constraint company_experiences_irrelevant_values_check check (
    irrelevant_types <@ array[
      'age', 'marital_status', 'salary_history',
      'personal_questions', 'other'
    ]::text[]
  ),
  constraint company_experiences_rejection_check check (
    rejection_shared in ('yes_detailed', 'yes_generic', 'no')
  ),
  constraint company_experiences_feedback_rating_check check (
    feedback_useful is null or feedback_useful between 1 and 5
  ),
  constraint company_experiences_feedback_context_check check (
    rejection_shared <> 'no' or feedback_useful is null
  ),
  constraint company_experiences_transparency_rating_check check (
    process_transparency between 1 and 5
  ),
  constraint company_experiences_professionalism_rating_check check (
    hr_professionalism between 1 and 5
  ),
  constraint company_experiences_recommendation_check check (
    would_recommend_process in ('yes', 'no', 'unsure')
  ),
  constraint company_experiences_free_note_check check (
    free_note is null
    or (
      free_note = btrim(free_note)
      and char_length(free_note) between 1 and 500
    )
  )
);

create index company_experiences_company_year_idx
  on intake.company_experiences (company_id, process_year, created_at desc, id)
  where company_id is not null;

comment on table intake.company_experiences is
  'Private B09 candidate-process snapshots. Raw company, role, and note values remain non-public pending B11 moderation.';

alter table intake.company_experiences enable row level security;
alter table intake.company_experiences force row level security;

create function intake.reject_company_experience_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception using
    errcode = '55000',
    message = 'company_experience_snapshot_is_immutable';
end;
$$;

revoke all on function intake.reject_company_experience_mutation()
  from public, anon, authenticated, service_role;

create trigger reject_company_experience_mutation
before update or delete on intake.company_experiences
for each row execute function intake.reject_company_experience_mutation();

create function api.create_company_experience_v1(
  p_data_subject_id uuid,
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
  p_idempotency_key_hmac bytea,
  p_idempotency_request_fingerprint bytea,
  p_quota_subject_hmac bytea,
  p_quota_24h_window_start timestamptz,
  p_quota_24h_limit integer,
  p_quota_24h_expires_at timestamptz,
  p_quota_30d_window_start timestamptz,
  p_quota_30d_limit integer,
  p_quota_30d_expires_at timestamptz,
  p_quota_policy_version text,
  p_quota_policy_hash bytea,
  p_company_name text,
  p_applied_role text,
  p_process_year smallint,
  p_promised_timeline text,
  p_promised_days smallint,
  p_actual_days smallint,
  p_was_ghosted boolean,
  p_ghosted_after_stage text,
  p_interviewer_prepared smallint,
  p_was_asked_irrelevant boolean,
  p_irrelevant_types text[],
  p_rejection_shared text,
  p_feedback_useful smallint,
  p_process_transparency smallint,
  p_hr_professionalism smallint,
  p_would_recommend_process text,
  p_free_note text
)
returns table (
  submission_id uuid,
  receipt_id uuid,
  company_experience_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  submission_record record;
  second_quota record;
  resolved_company_id uuid;
  inserted_experience_id uuid;
begin
  if p_schema_version <> 1 then
    raise exception using errcode = '22023', message = 'company_experience_schema_version_invalid';
  end if;

  select resolution.company_id
  into resolved_company_id
  from api.resolve_company_alias_v1(p_company_name, null, p_locale) as resolution;

  select * into submission_record
  from intake.begin_survey_submission_v1(
    p_data_subject_id, 'company_experience', p_schema_version, p_locale,
    p_notice_version_id, p_payload_hash, p_command_fingerprint,
    p_supersedes_submission_id, p_capability_hmac, p_capability_key_version,
    p_capability_expires_at, p_consent_subject_proof_hmac,
    p_consent_subject_proof_key_version, p_consent_idempotency_key,
    p_idempotency_subject_hmac, 'survey.company-experience.create',
    p_idempotency_key_hmac, p_idempotency_request_fingerprint,
    'experience.repeatable', p_quota_subject_hmac,
    p_quota_24h_window_start, 'accepted_24h', p_quota_24h_limit,
    p_quota_policy_version, p_quota_policy_hash, p_quota_24h_expires_at
  );

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

  insert into intake.company_experiences (
    submission_id, company_id, company_name, applied_role, process_year,
    promised_timeline, promised_days, actual_days, was_ghosted,
    ghosted_after_stage, interviewer_prepared, was_asked_irrelevant,
    irrelevant_types, rejection_shared, feedback_useful,
    process_transparency, hr_professionalism, would_recommend_process,
    free_note
  ) values (
    submission_record.submission_id, resolved_company_id,
    btrim(p_company_name), btrim(p_applied_role), p_process_year,
    p_promised_timeline, p_promised_days, p_actual_days, p_was_ghosted,
    p_ghosted_after_stage, p_interviewer_prepared, p_was_asked_irrelevant,
    p_irrelevant_types, p_rejection_shared, p_feedback_useful,
    p_process_transparency, p_hr_professionalism,
    p_would_recommend_process, nullif(btrim(p_free_note), '')
  ) returning id into inserted_experience_id;

  perform intake.complete_survey_submission_v1(
    p_idempotency_subject_hmac, 'survey.company-experience.create',
    p_idempotency_key_hmac, p_idempotency_request_fingerprint,
    submission_record.submission_id, 201::smallint
  );

  return query select submission_record.submission_id,
    submission_record.receipt_id, inserted_experience_id;
end;
$$;

revoke all on function api.create_company_experience_v1(
  uuid, integer, text, uuid, bytea, bytea, uuid, bytea, smallint,
  timestamptz, bytea, smallint, uuid, bytea, bytea, bytea, bytea,
  timestamptz, integer, timestamptz, timestamptz, integer, timestamptz,
  text, bytea, text, text, smallint, text, smallint, smallint, boolean,
  text, smallint, boolean, text[], text, smallint, smallint, smallint,
  text, text
) from public, anon, authenticated, service_role;
grant execute on function api.create_company_experience_v1(
  uuid, integer, text, uuid, bytea, bytea, uuid, bytea, smallint,
  timestamptz, bytea, smallint, uuid, bytea, bytea, bytea, bytea,
  timestamptz, integer, timestamptz, timestamptz, integer, timestamptz,
  text, bytea, text, text, smallint, text, smallint, smallint, boolean,
  text, smallint, boolean, text[], text, smallint, smallint, smallint,
  text, text
) to service_role;

create function api.get_company_experience_create_result_v1(
  p_submission_id uuid,
  p_data_subject_id uuid
)
returns table (
  submission_id uuid,
  receipt_id uuid,
  company_experience_id uuid,
  capability_key_version smallint
)
language sql
stable
security definer
set search_path = ''
as $$
  select submission.id, submission.receipt_id, experience.id,
    submission.capability_key_version
  from intake.survey_submissions as submission
  inner join intake.company_experiences as experience
    on experience.submission_id = submission.id
  where submission.id = p_submission_id
    and submission.data_subject_id = p_data_subject_id
    and submission.survey_type = 'company_experience'
  limit 1;
$$;

revoke all on function api.get_company_experience_create_result_v1(uuid, uuid)
  from public, anon, authenticated, service_role;
grant execute on function api.get_company_experience_create_result_v1(uuid, uuid)
  to service_role;

revoke all on all tables in schema intake
  from public, anon, authenticated, service_role;
revoke all on all sequences in schema intake
  from public, anon, authenticated, service_role;

commit;
