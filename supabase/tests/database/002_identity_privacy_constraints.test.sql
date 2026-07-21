begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(22);

delete from privacy.notice_versions
where id in (
  'b8000000-0000-4000-8300-000000000001',
  'b8000000-0000-4000-8300-000000000002'
);

create function pg_temp.statement_fails_with(
  sql_text text,
  expected_sqlstate text,
  expected_constraint_name text default null,
  expected_message text default null
)
returns boolean
language plpgsql
as $$
declare
  actual_sqlstate text;
  actual_constraint_name text;
  actual_message text;
begin
  execute sql_text;
  return false;
exception
  when others then
    get stacked diagnostics
      actual_sqlstate = returned_sqlstate,
      actual_constraint_name = constraint_name,
      actual_message = message_text;

    return actual_sqlstate = expected_sqlstate
      and (
        expected_constraint_name is null
        or actual_constraint_name = expected_constraint_name
      )
      and (
        expected_message is null
        or actual_message = expected_message
      );
end;
$$;

insert into auth.users (id, email, raw_user_meta_data, created_at, updated_at)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'actor-one@example.test',
    '{"display_name":"Must not be copied"}'::jsonb,
    now(),
    now()
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'actor-two@example.test',
    '{}'::jsonb,
    now(),
    now()
  );

select extensions.ok(
  pg_temp.statement_fails_with($test$
    update core.user_profiles
    set display_name = '  invalid  '
    where user_id = '10000000-0000-4000-8000-000000000001'
  $test$, '23514', 'user_profiles_display_name_check'),
  'profile display names must be trimmed'
);

select extensions.ok(
  pg_temp.statement_fails_with($test$
    update core.user_profiles
    set locale = 'de'
    where user_id = '10000000-0000-4000-8000-000000000001'
  $test$, '23514', 'user_profiles_locale_check'),
  'profile locale is allowlisted'
);

select extensions.ok(
  pg_temp.statement_fails_with($test$
    update core.user_profiles
    set version = 0
    where user_id = '10000000-0000-4000-8000-000000000001'
  $test$, '23514', 'user_profiles_version_check'),
  'profile versions must be positive'
);

select extensions.ok(
  pg_temp.statement_fails_with($test$
    insert into "authorization".user_role_assignments (
      user_id,
      role_code,
      granted_by_user_id,
      subject_audit_principal,
      reason_code
    )
    values (
      '10000000-0000-4000-8000-000000000001',
      'moderator',
      '10000000-0000-4000-8000-000000000001',
      decode(repeat('ab', 32), 'hex'),
      'operational_need'
    )
  $test$, '23514', 'user_role_assignments_no_self_grant_check'),
  'a user cannot grant a privileged role to itself'
);

insert into "authorization".user_role_assignments (
  user_id,
  role_code,
  granted_by_user_id,
  subject_audit_principal,
  reason_code
)
values (
  '10000000-0000-4000-8000-000000000001',
  'moderator',
  '10000000-0000-4000-8000-000000000002',
  decode(repeat('ab', 32), 'hex'),
  'operational_need'
);

select extensions.ok(
  pg_temp.statement_fails_with($test$
    insert into "authorization".user_role_assignments (
      user_id,
      role_code,
      granted_by_user_id,
      subject_audit_principal,
      reason_code
    )
    values (
      '10000000-0000-4000-8000-000000000001',
      'moderator',
      '10000000-0000-4000-8000-000000000002',
      decode(repeat('cd', 32), 'hex'),
      'role_change'
    )
  $test$, '23505', 'user_role_assignments_active_role_uidx'),
  'only one active assignment exists per user and role'
);

select extensions.ok(
  pg_temp.statement_fails_with($test$
    insert into "authorization".user_role_assignments (
      user_id,
      role_code,
      granted_by_user_id,
      subject_audit_principal,
      reason_code,
      granted_at,
      revoked_at
    )
    values (
      '10000000-0000-4000-8000-000000000002',
      'privacy_operator',
      '10000000-0000-4000-8000-000000000001',
      decode(repeat('ef', 32), 'hex'),
      'privacy_operations',
      now(),
      now() - interval '1 minute'
    )
  $test$, '23514', 'user_role_assignments_revoked_at_check'),
  'a role cannot be revoked before it was granted'
);

select extensions.ok(
  pg_temp.statement_fails_with($test$
    insert into core.data_subjects (
      anonymous_key_hmac,
      anonymous_key_version,
      status
    )
    values (
      decode('ab', 'hex'),
      1,
      'anonymous'
    )
  $test$, '23514', 'data_subjects_anonymous_key_size_check'),
  'anonymous subject HMAC values are exactly 32 bytes'
);

insert into core.data_subjects (
  id,
  anonymous_key_hmac,
  anonymous_key_version,
  status
)
values (
  '20000000-0000-4000-8000-000000000001',
  decode(repeat('11', 32), 'hex'),
  1,
  'anonymous'
);

select extensions.ok(
  pg_temp.statement_fails_with($test$
    insert into core.data_subjects (
      anonymous_key_hmac,
      anonymous_key_version,
      status
    )
    values (
      decode(repeat('11', 32), 'hex'),
      1,
      'anonymous'
    )
  $test$, '23505', 'data_subjects_anonymous_key_uidx'),
  'anonymous cookie HMAC values are unique'
);

select extensions.ok(
  pg_temp.statement_fails_with($test$
    insert into core.data_subjects (
      auth_user_id,
      anonymous_key_hmac,
      anonymous_key_version,
      status
    )
    values (
      '10000000-0000-4000-8000-000000000001',
      decode(repeat('22', 32), 'hex'),
      1,
      'authenticated'
    )
  $test$, '23514', 'data_subjects_state_check'),
  'authenticated subjects cannot retain anonymous cookie material'
);

select extensions.ok(
  pg_temp.statement_fails_with($test$
    update core.data_subjects
    set auth_user_id = '10000000-0000-4000-8000-000000000002'
    where auth_user_id = '10000000-0000-4000-8000-000000000001'
  $test$, '55000', null, 'data_subject_auth_identity_is_immutable'),
  'an authenticated subject cannot be reassigned to another auth identity'
);

select extensions.ok(
  pg_temp.statement_fails_with($test$
    insert into core.data_subjects (id, status, deleted_at)
    values (
      '20000000-0000-4000-8000-000000000003',
      'anonymized',
      now()
    )
  $test$, '23514', null, 'data_subject_initial_state_invalid'),
  'terminal data-subject states cannot be inserted directly'
);

update core.data_subjects
set
  auth_user_id = null,
  status = 'anonymized',
  deleted_at = now()
where auth_user_id = '10000000-0000-4000-8000-000000000001';

select extensions.ok(
  pg_temp.statement_fails_with($test$
    update core.data_subjects
    set
      anonymous_key_hmac = decode(repeat('33', 32), 'hex'),
      anonymous_key_version = 1,
      status = 'anonymous',
      deleted_at = null
    where id = (
      select id
      from core.data_subjects
      where status = 'anonymized'
      limit 1
    )
  $test$, '55000', null, 'data_subject_terminal_state_is_immutable'),
  'an anonymized data subject cannot be resurrected'
);

insert into core.data_subjects (
  id,
  anonymous_key_hmac,
  anonymous_key_version,
  status
)
values (
  '20000000-0000-4000-8000-000000000002',
  decode(repeat('22', 32), 'hex'),
  1,
  'anonymous'
);

select extensions.throws_ok(
  $test$
    update core.data_subjects
    set
      status = 'merged',
      anonymous_key_hmac = null,
      anonymous_key_version = null,
      merged_into_id = '20000000-0000-4000-8000-000000000002',
      deleted_at = now()
    where id = '20000000-0000-4000-8000-000000000002'
  $test$,
  '23514',
  'data_subject_merge_cycle',
  'a data subject cannot merge into itself'
);

update core.data_subjects
set
  status = 'merged',
  anonymous_key_hmac = null,
  anonymous_key_version = null,
  merged_into_id = '20000000-0000-4000-8000-000000000002',
  deleted_at = now()
where id = '20000000-0000-4000-8000-000000000001';

select extensions.throws_ok(
  $test$
    update core.data_subjects
    set
      status = 'anonymized',
      anonymous_key_hmac = null,
      anonymous_key_version = null,
      merged_into_id = null,
      deleted_at = now()
    where id = '20000000-0000-4000-8000-000000000002'
  $test$,
  '23514',
  'data_subject_merge_target_has_dependents',
  'an active canonical merge target cannot become terminal'
);

select extensions.ok(
  pg_temp.statement_fails_with($test$
    update core.data_subjects
    set
      anonymous_key_hmac = decode(repeat('44', 32), 'hex'),
      anonymous_key_version = 1,
      status = 'anonymous',
      merged_into_id = null,
      deleted_at = null
    where id = '20000000-0000-4000-8000-000000000001'
  $test$, '55000', null, 'data_subject_terminal_state_is_immutable'),
  'a merged data subject cannot be unmerged'
);

insert into core.data_subjects (
  id,
  anonymous_key_hmac,
  anonymous_key_version,
  status
)
values (
  '20000000-0000-4000-8000-000000000003',
  decode(repeat('33', 32), 'hex'),
  1,
  'anonymous'
);

select extensions.ok(
  pg_temp.statement_fails_with($test$
    update core.data_subjects
    set
      anonymous_key_hmac = null,
      anonymous_key_version = null,
      status = 'merged',
      merged_into_id = '20000000-0000-4000-8000-000000000001',
      deleted_at = now()
    where id = '20000000-0000-4000-8000-000000000003'
  $test$, '23514', null, 'data_subject_merge_target_invalid'),
  'a merge target must remain an active canonical subject'
);

insert into privacy.notice_versions (
  id,
  document_type,
  locale,
  version,
  content_sha256,
  content_uri,
  effective_from,
  retired_at
)
values (
  '30000000-0000-4000-8000-000000000001',
  'survey_notice',
  'tr',
  '2026-H1',
  decode(repeat('aa', 32), 'hex'),
  '/privacy/survey/2026-h1.tr.md',
  '2026-01-01T00:00:00Z',
  '2026-07-01T00:00:00Z'
);

select extensions.lives_ok(
  $test$
    insert into privacy.notice_versions (
      document_type,
      locale,
      version,
      content_sha256,
      content_uri,
      effective_from
    )
    values (
      'survey_notice',
      'tr',
      '2026-H2',
      decode(repeat('bb', 32), 'hex'),
      '/privacy/survey/2026-h2.tr.md',
      '2026-07-01T00:00:00Z'
    )
  $test$,
  'adjacent notice periods are allowed'
);

select extensions.ok(
  pg_temp.statement_fails_with($test$
    insert into privacy.notice_versions (
      document_type,
      locale,
      version,
      content_sha256,
      content_uri,
      effective_from,
      retired_at
    )
    values (
      'survey_notice',
      'tr',
      'overlap',
      decode(repeat('cc', 32), 'hex'),
      '/privacy/survey/overlap.tr.md',
      '2026-06-01T00:00:00Z',
      '2026-08-01T00:00:00Z'
    )
  $test$, '23P01', 'notice_versions_effective_period_excl'),
  'overlapping notice periods are rejected'
);

select extensions.lives_ok(
  $test$
    insert into privacy.notice_versions (
      document_type,
      locale,
      version,
      content_sha256,
      content_uri,
      effective_from,
      retired_at
    )
    values (
      'survey_notice',
      'en',
      '2026-H1',
      decode(repeat('dd', 32), 'hex'),
      '/privacy/survey/2026-h1.en.md',
      '2026-01-01T00:00:00Z',
      '2026-07-01T00:00:00Z'
    )
  $test$,
  'the same notice period is allowed for another locale'
);

select extensions.ok(
  pg_temp.statement_fails_with($test$
    update privacy.notice_versions
    set content_uri = '/privacy/survey/changed.tr.md'
    where id = '30000000-0000-4000-8000-000000000001'
  $test$, '55000', null, 'notice_version_is_immutable'),
  'published notice content is immutable'
);

select extensions.ok(
  pg_temp.statement_fails_with($test$
    insert into privacy.consent_events (
      data_subject_id,
      subject_proof_hmac,
      subject_proof_key_version,
      notice_version_id,
      purpose_code,
      decision,
      event_source,
      idempotency_key,
      occurred_at
    )
    values (
      '20000000-0000-4000-8000-000000000002',
      decode(repeat('aa', 32), 'hex'),
      1,
      '30000000-0000-4000-8000-000000000001',
      'advertising',
      'granted',
      'survey',
      '40000000-0000-4000-8000-000000000001',
      now()
    )
  $test$, '23514', null, 'notice_purpose_mismatch'),
  'consent notice-purpose pairs are allowlisted'
);

select extensions.ok(
  pg_temp.statement_fails_with($test$
    insert into privacy.consent_events (
      data_subject_id,
      subject_proof_hmac,
      subject_proof_key_version,
      notice_version_id,
      purpose_code,
      decision,
      event_source,
      idempotency_key,
      occurred_at
    )
    values (
      '20000000-0000-4000-8000-000000000002',
      decode(repeat('aa', 32), 'hex'),
      1,
      '30000000-0000-4000-8000-000000000001',
      'survey_contribution',
      'granted',
      'survey',
      '40000000-0000-4000-8000-000000000002',
      now() + interval '10 minutes'
    )
  $test$, '23514', 'consent_events_occurred_at_check'),
  'consent event timestamps reject excessive future skew'
);

select * from extensions.finish();

rollback;
