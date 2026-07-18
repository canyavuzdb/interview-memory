begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

create schema api;
create schema "authorization";
create schema core;
create schema privacy;

comment on schema api is
  'Versioned and explicitly granted Data API facade.';
comment on schema "authorization" is
  'Private privileged-role assignments and authorization state.';
comment on schema core is
  'Private application identity and canonical data-subject state.';
comment on schema privacy is
  'Private privacy notices, consent evidence, and rights state.';

revoke all on schema public from public, anon, authenticated;
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all routines in schema public from anon, authenticated;

revoke all on schema "authorization" from public, anon, authenticated;
revoke all on schema core from public, anon, authenticated;
revoke all on schema privacy from public, anon, authenticated;

revoke all on schema api from public, anon, authenticated;
grant usage on schema api to anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on routines from public, anon, authenticated;

alter default privileges for role postgres in schema "authorization"
  revoke all on tables from public, anon, authenticated;
alter default privileges for role postgres in schema "authorization"
  revoke all on sequences from public, anon, authenticated;
alter default privileges for role postgres in schema "authorization"
  revoke execute on routines from public, anon, authenticated;

alter default privileges for role postgres in schema core
  revoke all on tables from public, anon, authenticated;
alter default privileges for role postgres in schema core
  revoke all on sequences from public, anon, authenticated;
alter default privileges for role postgres in schema core
  revoke execute on routines from public, anon, authenticated;

alter default privileges for role postgres in schema privacy
  revoke all on tables from public, anon, authenticated;
alter default privileges for role postgres in schema privacy
  revoke all on sequences from public, anon, authenticated;
alter default privileges for role postgres in schema privacy
  revoke execute on routines from public, anon, authenticated;

alter default privileges for role postgres in schema api
  revoke all on tables from public, anon, authenticated;
alter default privileges for role postgres in schema api
  revoke all on sequences from public, anon, authenticated;
alter default privileges for role postgres in schema api
  revoke execute on routines from public, anon, authenticated;

create extension if not exists btree_gist with schema extensions;

create table core.user_profiles (
  user_id uuid primary key
    references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  locale text not null default 'tr',
  timezone text not null default 'Europe/Istanbul',
  onboarding_status text not null default 'pending',
  account_status text not null default 'active',
  version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_display_name_check check (
    display_name is null
    or (
      display_name = btrim(display_name)
      and char_length(display_name) between 1 and 120
    )
  ),
  constraint user_profiles_avatar_url_check check (
    avatar_url is null
    or (
      char_length(avatar_url) between 1 and 2048
      and avatar_url ~ '^https://'
    )
  ),
  constraint user_profiles_locale_check check (locale in ('tr', 'en')),
  constraint user_profiles_timezone_check check (
    timezone = btrim(timezone)
    and char_length(timezone) between 1 and 100
  ),
  constraint user_profiles_onboarding_status_check check (
    onboarding_status in ('pending', 'completed', 'skipped')
  ),
  constraint user_profiles_account_status_check check (
    account_status in ('active', 'suspended', 'deletion_pending')
  ),
  constraint user_profiles_version_check check (version > 0),
  constraint user_profiles_timestamps_check check (updated_at >= created_at)
);

comment on table core.user_profiles is
  'Minimal application profile keyed by auth.users; email and provider credentials are never copied here.';

create table "authorization".user_role_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid
    references core.user_profiles (user_id) on delete set null,
  role_code text not null,
  granted_by_user_id uuid
    references core.user_profiles (user_id) on delete set null,
  subject_audit_principal bytea not null,
  grantor_role_snapshot text,
  reason_code text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  constraint user_role_assignments_role_code_check check (
    role_code in (
      'moderator',
      'privacy_operator',
      'security_operator',
      'role_admin'
    )
  ),
  constraint user_role_assignments_grantor_role_check check (
    grantor_role_snapshot is null
    or grantor_role_snapshot in (
      'moderator',
      'privacy_operator',
      'security_operator',
      'role_admin',
      'bootstrap_operator'
    )
  ),
  constraint user_role_assignments_reason_code_check check (
    reason_code in (
      'initial_bootstrap',
      'operational_need',
      'incident_response',
      'privacy_operations',
      'role_change'
    )
  ),
  constraint user_role_assignments_audit_principal_check check (
    octet_length(subject_audit_principal) = 32
  ),
  constraint user_role_assignments_no_self_grant_check check (
    granted_by_user_id is null or granted_by_user_id <> user_id
  ),
  constraint user_role_assignments_active_owner_check check (
    revoked_at is not null or user_id is not null
  ),
  constraint user_role_assignments_revoked_at_check check (
    revoked_at is null or revoked_at >= granted_at
  )
);

create unique index user_role_assignments_active_role_uidx
  on "authorization".user_role_assignments (user_id, role_code)
  where revoked_at is null;

create index user_role_assignments_user_id_idx
  on "authorization".user_role_assignments (user_id);

create index user_role_assignments_granted_by_user_id_idx
  on "authorization".user_role_assignments (granted_by_user_id);

create index user_role_assignments_audit_timeline_idx
  on "authorization".user_role_assignments (granted_at desc, id);

comment on table "authorization".user_role_assignments is
  'Server-managed privileged role history. Authenticated users receive no direct mutation privilege.';

create table core.data_subjects (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid
    references auth.users (id) on delete set null,
  anonymous_key_hmac bytea,
  anonymous_key_version smallint,
  status text not null default 'anonymous',
  merged_into_id uuid
    references core.data_subjects (id) on delete restrict,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint data_subjects_auth_user_unique unique (auth_user_id),
  constraint data_subjects_anonymous_key_pair_check check (
    (anonymous_key_hmac is null) = (anonymous_key_version is null)
  ),
  constraint data_subjects_anonymous_key_size_check check (
    anonymous_key_hmac is null or octet_length(anonymous_key_hmac) = 32
  ),
  constraint data_subjects_anonymous_key_version_check check (
    anonymous_key_version is null or anonymous_key_version > 0
  ),
  constraint data_subjects_no_self_merge_check check (
    merged_into_id is null or merged_into_id <> id
  ),
  constraint data_subjects_state_check check (
    (
      status = 'anonymous'
      and auth_user_id is null
      and anonymous_key_hmac is not null
      and anonymous_key_version is not null
      and merged_into_id is null
      and deleted_at is null
    )
    or (
      status = 'authenticated'
      and auth_user_id is not null
      and anonymous_key_hmac is null
      and anonymous_key_version is null
      and merged_into_id is null
      and deleted_at is null
    )
    or (
      status = 'anonymized'
      and auth_user_id is null
      and anonymous_key_hmac is null
      and anonymous_key_version is null
      and merged_into_id is null
      and deleted_at is not null
    )
    or (
      status = 'merged'
      and auth_user_id is null
      and anonymous_key_hmac is null
      and anonymous_key_version is null
      and merged_into_id is not null
      and deleted_at is not null
    )
  )
);

create unique index data_subjects_anonymous_key_uidx
  on core.data_subjects (anonymous_key_hmac)
  where anonymous_key_hmac is not null;

create index data_subjects_lifecycle_idx
  on core.data_subjects (status, created_at, id);

create index data_subjects_merged_into_id_idx
  on core.data_subjects (merged_into_id)
  where merged_into_id is not null;

comment on table core.data_subjects is
  'Canonical pseudonymous privacy subject. anonymous_key_hmac derives only from a random opaque cookie token, never from IP or user-agent data.';

create table privacy.notice_versions (
  id uuid primary key default gen_random_uuid(),
  document_type text not null,
  locale text not null,
  version text not null,
  content_sha256 bytea not null,
  content_uri text not null,
  effective_from timestamptz not null,
  retired_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notice_versions_document_version_unique unique (
    document_type,
    locale,
    version
  ),
  constraint notice_versions_document_type_check check (
    document_type in (
      'account_notice',
      'survey_notice',
      'cookie_notice',
      'publication_consent'
    )
  ),
  constraint notice_versions_locale_check check (locale in ('tr', 'en')),
  constraint notice_versions_version_check check (
    version = btrim(version)
    and char_length(version) between 1 and 50
  ),
  constraint notice_versions_content_hash_check check (
    octet_length(content_sha256) = 32
  ),
  constraint notice_versions_content_uri_check check (
    content_uri = btrim(content_uri)
    and char_length(content_uri) between 1 and 2048
  ),
  constraint notice_versions_retired_at_check check (
    retired_at is null or retired_at > effective_from
  ),
  constraint notice_versions_effective_period_excl exclude using gist (
    document_type with =,
    locale with =,
    tstzrange(effective_from, retired_at, '[)') with &&
  )
);

create index notice_versions_current_lookup_idx
  on privacy.notice_versions (
    document_type,
    locale,
    effective_from desc
  )
  include (retired_at, version);

comment on table privacy.notice_versions is
  'Immutable versioned privacy and consent notices; only controlled retirement is mutable.';

create table privacy.consent_events (
  id uuid primary key default gen_random_uuid(),
  data_subject_id uuid
    references core.data_subjects (id) on delete set null,
  subject_proof_hmac bytea not null,
  subject_proof_key_version smallint not null,
  notice_version_id uuid not null
    references privacy.notice_versions (id) on delete restrict,
  submission_id uuid,
  purpose_code text not null,
  decision text not null,
  event_source text not null,
  idempotency_key uuid not null,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint consent_events_idempotency_unique unique (idempotency_key),
  constraint consent_events_subject_proof_check check (
    octet_length(subject_proof_hmac) = 32
  ),
  constraint consent_events_subject_proof_key_version_check check (
    subject_proof_key_version > 0
  ),
  constraint consent_events_purpose_code_check check (
    purpose_code in (
      'account_service',
      'survey_contribution',
      'benchmark_publication',
      'experience_follow_up'
    )
  ),
  constraint consent_events_decision_check check (
    decision in ('granted', 'denied', 'withdrawn')
  ),
  constraint consent_events_event_source_check check (
    event_source in (
      'web',
      'account',
      'survey',
      'privacy_request',
      'system'
    )
  ),
  constraint consent_events_occurred_at_check check (
    occurred_at <= created_at + interval '5 minutes'
  )
);

create index consent_events_subject_timeline_idx
  on privacy.consent_events (
    data_subject_id,
    purpose_code,
    occurred_at desc,
    id desc
  );

create index consent_events_notice_version_id_idx
  on privacy.consent_events (notice_version_id);

create index consent_events_submission_timeline_idx
  on privacy.consent_events (
    submission_id,
    purpose_code,
    occurred_at desc
  )
  where submission_id is not null;

comment on table privacy.consent_events is
  'Append-only consent evidence. HMAC columns are purpose-separated pseudonyms and never contain IP-derived values.';

alter table core.user_profiles enable row level security;
alter table core.user_profiles force row level security;
alter table "authorization".user_role_assignments enable row level security;
alter table "authorization".user_role_assignments force row level security;
alter table core.data_subjects enable row level security;
alter table core.data_subjects force row level security;
alter table privacy.notice_versions enable row level security;
alter table privacy.notice_versions force row level security;
alter table privacy.consent_events enable row level security;
alter table privacy.consent_events force row level security;

revoke all on all tables in schema "authorization"
  from public, anon, authenticated, service_role;
revoke all on all tables in schema core
  from public, anon, authenticated, service_role;
revoke all on all tables in schema privacy
  from public, anon, authenticated, service_role;
revoke all on all sequences in schema "authorization"
  from public, anon, authenticated, service_role;
revoke all on all sequences in schema core
  from public, anon, authenticated, service_role;
revoke all on all sequences in schema privacy
  from public, anon, authenticated, service_role;

create function core.enforce_data_subject_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.status not in ('anonymous', 'authenticated') then
      raise exception using
        errcode = '23514',
        message = 'data_subject_initial_state_invalid';
    end if;
  else
    if new.id is distinct from old.id
      or new.created_at is distinct from old.created_at
    then
      raise exception using
        errcode = '55000',
        message = 'data_subject_identity_is_immutable';
    end if;

    if old.status in ('anonymized', 'merged') then
      raise exception using
        errcode = '55000',
        message = 'data_subject_terminal_state_is_immutable';
    end if;

    if (
      old.status = 'anonymous'
      and new.status not in (
        'anonymous',
        'authenticated',
        'anonymized',
        'merged'
      )
    )
      or (
        old.status = 'authenticated'
        and new.status not in ('authenticated', 'anonymized', 'merged')
      )
    then
      raise exception using
        errcode = '23514',
        message = 'data_subject_transition_invalid';
    end if;

    if old.status = 'authenticated'
      and new.status = 'authenticated'
      and new.auth_user_id is distinct from old.auth_user_id
    then
      raise exception using
        errcode = '55000',
        message = 'data_subject_auth_identity_is_immutable';
    end if;

    if new.status is distinct from old.status then
      perform pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended('core.data_subjects.lifecycle', 0)
      );

      if new.status in ('anonymized', 'merged')
        and exists (
          select 1
          from core.data_subjects as dependent
          where dependent.merged_into_id = old.id
        )
      then
        raise exception using
          errcode = '23514',
          message = 'data_subject_merge_target_has_dependents';
      end if;
    end if;
  end if;

  if new.merged_into_id is null then
    return new;
  end if;

  if new.merged_into_id = new.id then
    raise exception using
      errcode = '23514',
      message = 'data_subject_merge_cycle';
  end if;

  perform 1
  from core.data_subjects as target
  where target.id = new.merged_into_id
    and target.status in ('anonymous', 'authenticated')
    and target.merged_into_id is null
    and target.deleted_at is null;

  if not found then
    raise exception using
      errcode = '23514',
      message = 'data_subject_merge_target_invalid';
  end if;

  if exists (
    with recursive merge_chain (id, merged_into_id) as (
      select subject.id, subject.merged_into_id
      from core.data_subjects as subject
      where subject.id = new.merged_into_id

      union

      select subject.id, subject.merged_into_id
      from core.data_subjects as subject
      join merge_chain
        on subject.id = merge_chain.merged_into_id
    )
    select 1
    from merge_chain
    where id = new.id
  ) then
    raise exception using
      errcode = '23514',
      message = 'data_subject_merge_cycle';
  end if;

  return new;
end;
$$;

revoke all on function core.enforce_data_subject_lifecycle() from public;

create trigger enforce_data_subject_lifecycle
before insert or update
on core.data_subjects
for each row
execute function core.enforce_data_subject_lifecycle();

create function privacy.enforce_notice_version_immutability()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.id <> old.id
    or new.document_type <> old.document_type
    or new.locale <> old.locale
    or new.version <> old.version
    or new.content_sha256 <> old.content_sha256
    or new.content_uri <> old.content_uri
    or new.effective_from <> old.effective_from
    or new.created_at <> old.created_at
  then
    raise exception using
      errcode = '55000',
      message = 'notice_version_is_immutable';
  end if;

  if old.retired_at is not null
    or new.retired_at is null
    or new.retired_at <= old.effective_from
  then
    raise exception using
      errcode = '55000',
      message = 'notice_retirement_transition_invalid';
  end if;

  return new;
end;
$$;

revoke all on function privacy.enforce_notice_version_immutability()
  from public;

create trigger enforce_notice_version_immutability
before update
on privacy.notice_versions
for each row
execute function privacy.enforce_notice_version_immutability();

create function privacy.is_notice_purpose_compatible(
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
    (
      p_document_type = 'account_notice'
      and p_purpose_code = 'account_service'
    )
    or (
      p_document_type = 'survey_notice'
      and p_purpose_code in (
        'survey_contribution',
        'experience_follow_up'
      )
    )
    or (
      p_document_type = 'publication_consent'
      and p_purpose_code = 'benchmark_publication'
    );
$$;

revoke all on function privacy.is_notice_purpose_compatible(text, text)
  from public;

create function privacy.enforce_consent_notice_purpose()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  notice_document_type text;
begin
  select notice.document_type
  into notice_document_type
  from privacy.notice_versions as notice
  where notice.id = new.notice_version_id
  for key share;

  if not found then
    return new;
  end if;

  if not privacy.is_notice_purpose_compatible(
    notice_document_type,
    new.purpose_code
  ) then
    raise exception using
      errcode = '23514',
      message = 'notice_purpose_mismatch';
  end if;

  return new;
end;
$$;

revoke all on function privacy.enforce_consent_notice_purpose() from public;

create trigger enforce_consent_notice_purpose
before insert
on privacy.consent_events
for each row
execute function privacy.enforce_consent_notice_purpose();

create function core.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into core.user_profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into core.data_subjects (auth_user_id, status)
  values (new.id, 'authenticated')
  on conflict (auth_user_id) do nothing;

  return new;
end;
$$;

revoke all on function core.handle_auth_user_created() from public;

drop trigger if exists create_application_identity on auth.users;

create trigger create_application_identity
after insert
on auth.users
for each row
execute function core.handle_auth_user_created();

insert into core.user_profiles (user_id)
select auth_user.id
from auth.users as auth_user
on conflict (user_id) do nothing;

insert into core.data_subjects (auth_user_id, status)
select auth_user.id, 'authenticated'
from auth.users as auth_user
on conflict (auth_user_id) do nothing;

create function api.get_current_notice_v1(
  p_document_type text,
  p_locale text
)
returns table (
  id uuid,
  document_type text,
  locale text,
  version text,
  content_sha256 bytea,
  content_uri text,
  effective_from timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    notice.id,
    notice.document_type,
    notice.locale,
    notice.version,
    notice.content_sha256,
    notice.content_uri,
    notice.effective_from
  from privacy.notice_versions as notice
  where notice.document_type = p_document_type
    and notice.locale = p_locale
    and notice.effective_from <= now()
    and (notice.retired_at is null or notice.retired_at > now())
  order by notice.effective_from desc
  limit 1;
$$;

revoke all on function api.get_current_notice_v1(text, text) from public;
grant execute on function api.get_current_notice_v1(text, text)
  to anon, authenticated, service_role;

create function api.record_authenticated_consent_v1(
  p_auth_user_id uuid,
  p_notice_version_id uuid,
  p_purpose_code text,
  p_decision text,
  p_event_source text,
  p_subject_proof_hmac bytea,
  p_subject_proof_key_version smallint,
  p_idempotency_key uuid
)
returns table (
  event_id uuid,
  event_created_at timestamptz,
  replayed boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  resolved_subject_id uuid;
  inserted_event_id uuid;
  inserted_created_at timestamptz;
  notice_document_type text;
  event_occurred_at timestamptz := pg_catalog.clock_timestamp();
begin
  if p_auth_user_id is null then
    raise exception using
      errcode = '22023',
      message = 'auth_user_required';
  end if;

  if p_idempotency_key is null then
    raise exception using
      errcode = '22023',
      message = 'idempotency_key_required';
  end if;

  if p_decision not in ('granted', 'denied') then
    raise exception using
      errcode = '22023',
      message = 'consent_decision_invalid';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'privacy.consent:' || p_idempotency_key::text,
      0
    )
  );

  select subject.id
  into resolved_subject_id
  from core.data_subjects as subject
  where subject.auth_user_id = p_auth_user_id
    and subject.status = 'authenticated'
  for share;

  if resolved_subject_id is null then
    raise exception using
      errcode = '22023',
      message = 'active_data_subject_not_found';
  end if;

  return query
  select event.id, event.created_at, true
  from privacy.consent_events as event
  where event.idempotency_key = p_idempotency_key
    and event.data_subject_id = resolved_subject_id
    and event.notice_version_id = p_notice_version_id
    and event.purpose_code = p_purpose_code
    and event.decision = p_decision
    and event.event_source = p_event_source;

  if found then
    return;
  end if;

  if exists (
    select 1
    from privacy.consent_events as event
    where event.idempotency_key = p_idempotency_key
  ) then
    raise exception using
      errcode = '22023',
      message = 'idempotency_key_reused';
  end if;

  select notice.document_type
  into notice_document_type
  from privacy.notice_versions as notice
  where notice.id = p_notice_version_id
    and notice.effective_from <= event_occurred_at
    and (
      notice.retired_at is null
      or notice.retired_at > event_occurred_at
    )
  for share;

  if not found then
    raise exception using
      errcode = '22023',
      message = 'notice_version_not_effective';
  end if;

  if not privacy.is_notice_purpose_compatible(
    notice_document_type,
    p_purpose_code
  ) then
    raise exception using
      errcode = '22023',
      message = 'notice_purpose_mismatch';
  end if;

  insert into privacy.consent_events (
    data_subject_id,
    subject_proof_hmac,
    subject_proof_key_version,
    notice_version_id,
    purpose_code,
    decision,
    event_source,
    idempotency_key,
    occurred_at,
    created_at
  )
  values (
    resolved_subject_id,
    p_subject_proof_hmac,
    p_subject_proof_key_version,
    p_notice_version_id,
    p_purpose_code,
    p_decision,
    p_event_source,
    p_idempotency_key,
    event_occurred_at,
    event_occurred_at
  )
  on conflict (idempotency_key) do nothing
  returning id, created_at
  into inserted_event_id, inserted_created_at;

  if inserted_event_id is not null then
    return query
    select inserted_event_id, inserted_created_at, false;
    return;
  end if;

  return query
  select event.id, event.created_at, true
  from privacy.consent_events as event
  where event.idempotency_key = p_idempotency_key
    and event.data_subject_id = resolved_subject_id
    and event.notice_version_id = p_notice_version_id
    and event.purpose_code = p_purpose_code
    and event.decision = p_decision
    and event.event_source = p_event_source;

  if not found then
    raise exception using
      errcode = '22023',
      message = 'idempotency_key_reused';
  end if;
end;
$$;

revoke all on function api.record_authenticated_consent_v1(
  uuid,
  uuid,
  text,
  text,
  text,
  bytea,
  smallint,
  uuid
) from public, anon, authenticated;

grant execute on function api.record_authenticated_consent_v1(
  uuid,
  uuid,
  text,
  text,
  text,
  bytea,
  smallint,
  uuid
) to service_role;

comment on function api.record_authenticated_consent_v1(
  uuid,
  uuid,
  text,
  text,
  text,
  bytea,
  smallint,
  uuid
) is
  'Server-only idempotent consent command. The database owns event time and validates notice-purpose compatibility; the application must verify the current user and derive purpose-separated HMAC values before calling.';

commit;
