begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

create schema moderation;

comment on schema moderation is
  'B11 private moderation decisions, quality signals, and canonical resolution audit.';

revoke all on schema moderation from public, anon, authenticated, service_role;

alter default privileges for role postgres in schema moderation
  revoke all on tables from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema moderation
  revoke all on sequences from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema moderation
  revoke execute on routines from public, anon, authenticated, service_role;

create function "authorization".is_active_moderator_v1(
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from core.user_profiles as profile
    join "authorization".user_role_assignments as assignment
      on assignment.user_id = profile.user_id
    where profile.user_id = p_user_id
      and profile.account_status = 'active'
      and assignment.role_code in ('moderator', 'role_admin')
      and assignment.revoked_at is null
  );
$$;

revoke all on function "authorization".is_active_moderator_v1(uuid)
  from public, anon, authenticated, service_role;

create table moderation.submission_quality_signals (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null
    references intake.survey_submissions (id) on delete restrict,
  signal_code text not null,
  severity text not null,
  source_field text not null,
  detected_at timestamptz not null default now(),
  constraint submission_quality_signals_unique unique (
    submission_id,
    signal_code,
    source_field
  ),
  constraint submission_quality_signals_code_check check (
    signal_code in (
      'contact_information_candidate',
      'external_link_candidate'
    )
  ),
  constraint submission_quality_signals_severity_check check (
    severity in ('review', 'block')
  ),
  constraint submission_quality_signals_source_check check (
    source_field in ('company_experience.free_note')
  )
);

create index submission_quality_signals_queue_idx
  on moderation.submission_quality_signals (
    severity,
    detected_at,
    submission_id
  );

comment on table moderation.submission_quality_signals is
  'Append-only automated hints. Signals require human review and never publish or reject a contribution by themselves.';

create table moderation.submission_review_decisions (
  id uuid primary key,
  submission_id uuid not null
    references intake.survey_submissions (id) on delete restrict,
  reviewer_user_id uuid
    references core.user_profiles (user_id) on delete set null,
  reviewer_audit_principal bytea not null,
  previous_quality_status text not null,
  decision text not null,
  reason_code text not null,
  reviewer_note text,
  company_id uuid
    references catalog.companies (id) on delete restrict,
  decided_at timestamptz not null default now(),
  constraint submission_review_decisions_principal_check check (
    octet_length(reviewer_audit_principal) = 32
  ),
  constraint submission_review_decisions_previous_check check (
    previous_quality_status in ('pending', 'eligible', 'excluded')
  ),
  constraint submission_review_decisions_decision_check check (
    decision in ('eligible', 'excluded')
  ),
  constraint submission_review_decisions_reason_check check (
    reason_code in (
      'quality_review_passed',
      'duplicate',
      'incoherent',
      'out_of_scope',
      'personal_data',
      'spam',
      'other'
    )
  ),
  constraint submission_review_decisions_reason_context_check check (
    (
      decision = 'eligible'
      and reason_code = 'quality_review_passed'
    )
    or (
      decision = 'excluded'
      and reason_code <> 'quality_review_passed'
    )
  ),
  constraint submission_review_decisions_note_check check (
    reviewer_note is null
    or (
      reviewer_note = btrim(reviewer_note)
      and char_length(reviewer_note) between 2 and 500
      and reviewer_note !~ '[[:cntrl:]]'
    )
  ),
  constraint submission_review_decisions_company_context_check check (
    decision = 'eligible' or company_id is null
  )
);

create index submission_review_decisions_timeline_idx
  on moderation.submission_review_decisions (
    submission_id,
    decided_at desc,
    id
  );
create index submission_review_decisions_reviewer_idx
  on moderation.submission_review_decisions (
    reviewer_user_id,
    decided_at desc,
    id
  )
  where reviewer_user_id is not null;

comment on table moderation.submission_review_decisions is
  'Append-only B11 audit of every human quality-gate decision.';

create table moderation.submission_company_resolutions (
  submission_id uuid primary key
    references intake.survey_submissions (id) on delete restrict,
  company_id uuid not null
    references catalog.companies (id) on delete restrict,
  resolved_by_user_id uuid
    references core.user_profiles (user_id) on delete set null,
  resolver_audit_principal bytea not null,
  resolved_at timestamptz not null default now(),
  constraint submission_company_resolutions_principal_check check (
    octet_length(resolver_audit_principal) = 32
  )
);

create index submission_company_resolutions_company_idx
  on moderation.submission_company_resolutions (
    company_id,
    resolved_at desc,
    submission_id
  );

comment on table moderation.submission_company_resolutions is
  'Canonical company selected during moderation without mutating the immutable raw contribution.';

alter table moderation.submission_quality_signals enable row level security;
alter table moderation.submission_quality_signals force row level security;
alter table moderation.submission_review_decisions enable row level security;
alter table moderation.submission_review_decisions force row level security;
alter table moderation.submission_company_resolutions enable row level security;
alter table moderation.submission_company_resolutions force row level security;

create function moderation.reject_audit_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception using
    errcode = '55000',
    message = 'moderation_audit_is_immutable';
end;
$$;

revoke all on function moderation.reject_audit_mutation()
  from public, anon, authenticated, service_role;

create trigger reject_submission_quality_signal_mutation
before update or delete on moderation.submission_quality_signals
for each row execute function moderation.reject_audit_mutation();
create trigger reject_submission_review_decision_mutation
before update or delete on moderation.submission_review_decisions
for each row execute function moderation.reject_audit_mutation();
create trigger reject_submission_company_resolution_mutation
before update or delete on moderation.submission_company_resolutions
for each row execute function moderation.reject_audit_mutation();

create function moderation.scan_company_experience_quality_v1()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.free_note is null then
    return new;
  end if;

  if new.free_note ~* '[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}'
    or new.free_note ~ '(?:\+?[0-9][0-9 ()-]{6,}[0-9])'
  then
    insert into moderation.submission_quality_signals (
      submission_id,
      signal_code,
      severity,
      source_field
    ) values (
      new.submission_id,
      'contact_information_candidate',
      'block',
      'company_experience.free_note'
    )
    on conflict do nothing;
  end if;

  if new.free_note ~* '(?:https?://|www\.)[^\s]+'
  then
    insert into moderation.submission_quality_signals (
      submission_id,
      signal_code,
      severity,
      source_field
    ) values (
      new.submission_id,
      'external_link_candidate',
      'review',
      'company_experience.free_note'
    )
    on conflict do nothing;
  end if;

  return new;
end;
$$;

revoke all on function moderation.scan_company_experience_quality_v1()
  from public, anon, authenticated, service_role;

create trigger scan_company_experience_quality
after insert on intake.company_experiences
for each row execute function moderation.scan_company_experience_quality_v1();

insert into moderation.submission_quality_signals (
  submission_id,
  signal_code,
  severity,
  source_field,
  detected_at
)
select experience.submission_id, 'contact_information_candidate', 'block',
  'company_experience.free_note', experience.created_at
from intake.company_experiences as experience
where experience.free_note is not null
  and (
    experience.free_note
      ~* '[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}'
    or experience.free_note ~ '(?:\+?[0-9][0-9 ()-]{6,}[0-9])'
  )
on conflict do nothing;

insert into moderation.submission_quality_signals (
  submission_id,
  signal_code,
  severity,
  source_field,
  detected_at
)
select experience.submission_id, 'external_link_candidate', 'review',
  'company_experience.free_note', experience.created_at
from intake.company_experiences as experience
where experience.free_note is not null
  and experience.free_note ~* '(?:https?://|www\.)[^\s]+'
on conflict do nothing;

create function api.list_moderation_queue_v1(
  p_reviewer_user_id uuid,
  p_quality_status text,
  p_survey_type text,
  p_limit integer,
  p_before_submitted_at timestamptz,
  p_before_submission_id uuid
)
returns table (
  submission_id uuid,
  receipt_id uuid,
  survey_type text,
  schema_version integer,
  locale text,
  quality_status text,
  submitted_at timestamptz,
  company_name text,
  applied_role text,
  free_note text,
  canonical_company_id uuid,
  role_id uuid,
  role_level text,
  target_region text,
  started_month date,
  ended_month date,
  applications_count integer,
  human_responses_count integer,
  any_interviews_count integer,
  offers_count integer,
  quality_signals text[],
  last_reason_code text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not "authorization".is_active_moderator_v1(p_reviewer_user_id) then
    raise exception using errcode = '42501', message = 'moderator_role_required';
  end if;

  if p_quality_status not in ('pending', 'eligible', 'excluded')
    or (p_survey_type is not null
      and p_survey_type not in ('search_benchmark', 'company_experience'))
    or p_limit not between 1 and 100
    or ((p_before_submitted_at is null) <> (p_before_submission_id is null))
  then
    raise exception using errcode = '22023', message = 'moderation_query_invalid';
  end if;

  return query
  select
    submission.id,
    submission.receipt_id,
    submission.survey_type,
    submission.schema_version,
    submission.locale,
    submission.quality_status,
    submission.submitted_at,
    experience.company_name,
    experience.applied_role,
    experience.free_note,
    coalesce(
      experience.company_id,
      company_resolution.company_id
    ),
    episode.role_id,
    episode.role_level,
    episode.target_region,
    episode.started_month,
    episode.ended_month,
    funnel.applications_count,
    funnel.human_responses_count,
    funnel.any_interviews_count,
    funnel.offers_count,
    coalesce(signal_list.signal_codes, array[]::text[]),
    last_decision.reason_code
  from intake.survey_submissions as submission
  left join intake.company_experiences as experience
    on experience.submission_id = submission.id
  left join moderation.submission_company_resolutions as company_resolution
    on company_resolution.submission_id = submission.id
  left join intake.search_episodes as episode
    on episode.submission_id = submission.id
  left join intake.episode_funnel_totals as funnel
    on funnel.episode_id = episode.id
  left join lateral (
    select array_agg(
      signal.signal_code
      order by
        case signal.severity when 'block' then 0 else 1 end,
        signal.signal_code
    ) as signal_codes
    from moderation.submission_quality_signals as signal
    where signal.submission_id = submission.id
  ) as signal_list on true
  left join lateral (
    select decision.reason_code
    from moderation.submission_review_decisions as decision
    where decision.submission_id = submission.id
    order by decision.decided_at desc, decision.id desc
    limit 1
  ) as last_decision on true
  where submission.lifecycle_status = 'accepted'
    and submission.quality_status = p_quality_status
    and (p_survey_type is null or submission.survey_type = p_survey_type)
    and (
      p_before_submitted_at is null
      or (submission.submitted_at, submission.id)
        < (p_before_submitted_at, p_before_submission_id)
    )
  order by submission.submitted_at desc, submission.id desc
  limit p_limit;
end;
$$;

revoke all on function api.list_moderation_queue_v1(
  uuid, text, text, integer, timestamptz, uuid
) from public, anon, authenticated, service_role;
grant execute on function api.list_moderation_queue_v1(
  uuid, text, text, integer, timestamptz, uuid
) to service_role;

create function api.list_moderation_companies_v1(
  p_reviewer_user_id uuid,
  p_query text,
  p_limit integer
)
returns table (
  company_id uuid,
  slug text,
  display_name text,
  country_code character(2),
  verification_status text,
  publication_status text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not "authorization".is_active_moderator_v1(p_reviewer_user_id) then
    raise exception using errcode = '42501', message = 'moderator_role_required';
  end if;

  if p_query is null
    or p_query <> btrim(p_query)
    or char_length(p_query) not between 2 and 100
    or p_limit not between 1 and 50
  then
    raise exception using errcode = '22023', message = 'moderation_company_query_invalid';
  end if;

  return query
  select company.id, company.slug, company.display_name,
    company.country_code, company.verification_status,
    company.publication_status
  from catalog.companies as company
  where company.verification_status <> 'rejected'
    and company.publication_status <> 'disputed'
    and (
      company.display_name ilike '%' || p_query || '%'
      or company.slug ilike '%' || p_query || '%'
    )
  order by
    case when lower(company.display_name) = lower(p_query) then 0 else 1 end,
    company.display_name,
    company.id
  limit p_limit;
end;
$$;

revoke all on function api.list_moderation_companies_v1(uuid, text, integer)
  from public, anon, authenticated, service_role;
grant execute on function api.list_moderation_companies_v1(
  uuid, text, integer
) to service_role;

create function api.create_moderation_company_v1(
  p_reviewer_user_id uuid,
  p_company_id uuid,
  p_slug text,
  p_display_name text,
  p_country_code character(2)
)
returns table (
  company_id uuid,
  slug text,
  display_name text,
  country_code character(2),
  verification_status text,
  publication_status text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  company_record catalog.companies%rowtype;
begin
  if not "authorization".is_active_moderator_v1(p_reviewer_user_id) then
    raise exception using errcode = '42501', message = 'moderator_role_required';
  end if;

  begin
    insert into catalog.companies (
      id,
      slug,
      display_name,
      country_code,
      verification_status,
      publication_status
    ) values (
      p_company_id,
      p_slug,
      p_display_name,
      p_country_code,
      'unverified',
      'hidden'
    )
    on conflict (id) do nothing;
  exception
    when unique_violation then
      raise exception using
        errcode = '23505',
        message = 'moderation_company_slug_conflict';
  end;

  select company.* into company_record
  from catalog.companies as company
  where company.id = p_company_id;

  if company_record.slug is distinct from p_slug
    or company_record.display_name is distinct from p_display_name
    or company_record.country_code is distinct from p_country_code
  then
    raise exception using errcode = '23505', message = 'moderation_company_id_conflict';
  end if;

  return query select company_record.id, company_record.slug,
    company_record.display_name, company_record.country_code,
    company_record.verification_status, company_record.publication_status;
end;
$$;

revoke all on function api.create_moderation_company_v1(
  uuid, uuid, text, text, character
) from public, anon, authenticated, service_role;
grant execute on function api.create_moderation_company_v1(
  uuid, uuid, text, text, character
) to service_role;

create function api.decide_submission_quality_v1(
  p_reviewer_user_id uuid,
  p_submission_id uuid,
  p_decision_id uuid,
  p_decision text,
  p_reason_code text,
  p_reviewer_note text,
  p_company_id uuid
)
returns table (
  decision_id uuid,
  submission_id uuid,
  quality_status text,
  decided_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  submission_record intake.survey_submissions%rowtype;
  experience_record intake.company_experiences%rowtype;
  existing_decision moderation.submission_review_decisions%rowtype;
  inserted_decision moderation.submission_review_decisions%rowtype;
  reviewer_principal bytea;
  normalized_company_alias text;
  approved_alias_company_id uuid;
  inserted_alias_id uuid;
begin
  if not "authorization".is_active_moderator_v1(p_reviewer_user_id) then
    raise exception using errcode = '42501', message = 'moderator_role_required';
  end if;

  if p_decision not in ('eligible', 'excluded')
    or p_reason_code not in (
      'quality_review_passed', 'duplicate', 'incoherent', 'out_of_scope',
      'personal_data', 'spam', 'other'
    )
    or (
      p_decision = 'eligible'
      and p_reason_code <> 'quality_review_passed'
    )
    or (
      p_decision = 'excluded'
      and p_reason_code = 'quality_review_passed'
    )
    or (p_decision = 'excluded' and p_company_id is not null)
    or (
      p_reviewer_note is not null
      and (
        p_reviewer_note <> btrim(p_reviewer_note)
        or char_length(p_reviewer_note) not between 2 and 500
        or p_reviewer_note ~ '[[:cntrl:]]'
      )
    )
  then
    raise exception using errcode = '22023', message = 'moderation_decision_invalid';
  end if;

  reviewer_principal := extensions.digest(
    convert_to('moderator-user:v1:' || p_reviewer_user_id::text, 'utf8'),
    'sha256'
  );

  select decision.* into existing_decision
  from moderation.submission_review_decisions as decision
  where decision.id = p_decision_id;

  if found then
    if existing_decision.submission_id <> p_submission_id
      or existing_decision.reviewer_audit_principal <> reviewer_principal
      or existing_decision.decision <> p_decision
      or existing_decision.reason_code <> p_reason_code
      or existing_decision.reviewer_note is distinct from p_reviewer_note
      or existing_decision.company_id is distinct from p_company_id
    then
      raise exception using errcode = '23505', message = 'moderation_decision_id_conflict';
    end if;

    return query select existing_decision.id, existing_decision.submission_id,
      existing_decision.decision, existing_decision.decided_at;
    return;
  end if;

  select submission.* into submission_record
  from intake.survey_submissions as submission
  where submission.id = p_submission_id
  for update;

  if not found or submission_record.lifecycle_status <> 'accepted' then
    raise exception using errcode = 'P0002', message = 'moderation_submission_not_found';
  end if;

  if exists (
    select 1
    from core.data_subjects as subject
    where subject.id = submission_record.data_subject_id
      and subject.auth_user_id = p_reviewer_user_id
  ) then
    raise exception using errcode = '42501', message = 'moderation_self_review_forbidden';
  end if;

  select experience.* into experience_record
  from intake.company_experiences as experience
  where experience.submission_id = p_submission_id;

  if found and p_decision = 'eligible'
    and experience_record.company_id is null
    and not exists (
      select 1
      from moderation.submission_company_resolutions as resolution
      where resolution.submission_id = p_submission_id
    )
    and p_company_id is null
  then
    raise exception using errcode = '22023', message = 'company_resolution_required';
  end if;

  if p_company_id is not null then
    if submission_record.survey_type <> 'company_experience'
      or not exists (
        select 1 from catalog.companies as company
        where company.id = p_company_id
          and company.verification_status <> 'rejected'
          and company.publication_status <> 'disputed'
      )
    then
      raise exception using errcode = '22023', message = 'company_resolution_invalid';
    end if;

    insert into moderation.submission_company_resolutions (
      submission_id,
      company_id,
      resolved_by_user_id,
      resolver_audit_principal
    ) values (
      p_submission_id,
      p_company_id,
      p_reviewer_user_id,
      reviewer_principal
    )
    on conflict on constraint submission_company_resolutions_pkey do nothing;

    if not exists (
      select 1
      from moderation.submission_company_resolutions as resolution
      where resolution.submission_id = p_submission_id
        and resolution.company_id = p_company_id
    ) then
      raise exception using errcode = '23505', message = 'company_resolution_conflict';
    end if;

    if experience_record.company_id is null then
      normalized_company_alias := catalog.normalize_company_alias_v1(
        experience_record.company_name
      );
      perform pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(
          'moderation-company-alias:'
            || normalized_company_alias
            || ':'
            || submission_record.locale,
          0
        )
      );

      select alias.company_id into approved_alias_company_id
      from catalog.company_aliases as alias
      where alias.normalized_alias = normalized_company_alias
        and alias.locale = submission_record.locale
        and alias.country_code is null
        and alias.review_status = 'approved';

      if approved_alias_company_id is not null
        and approved_alias_company_id <> p_company_id
      then
        raise exception using
          errcode = '23505',
          message = 'company_alias_resolution_conflict';
      end if;

      if approved_alias_company_id is null then
        insert into catalog.company_aliases (
          company_id,
          normalized_alias,
          locale,
          country_code,
          source_code
        ) values (
          p_company_id,
          normalized_company_alias,
          submission_record.locale,
          null,
          'moderator'
        )
        returning id into inserted_alias_id;

        update catalog.company_aliases
        set review_status = 'approved'
        where id = inserted_alias_id;
      end if;
    end if;
  end if;

  insert into moderation.submission_review_decisions (
    id,
    submission_id,
    reviewer_user_id,
    reviewer_audit_principal,
    previous_quality_status,
    decision,
    reason_code,
    reviewer_note,
    company_id
  ) values (
    p_decision_id,
    p_submission_id,
    p_reviewer_user_id,
    reviewer_principal,
    submission_record.quality_status,
    p_decision,
    p_reason_code,
    p_reviewer_note,
    p_company_id
  )
  returning * into inserted_decision;

  update intake.survey_submissions
  set quality_status = p_decision
  where id = p_submission_id;

  return query select inserted_decision.id, inserted_decision.submission_id,
    inserted_decision.decision, inserted_decision.decided_at;
end;
$$;

revoke all on function api.decide_submission_quality_v1(
  uuid, uuid, uuid, text, text, text, uuid
) from public, anon, authenticated, service_role;
grant execute on function api.decide_submission_quality_v1(
  uuid, uuid, uuid, text, text, text, uuid
) to service_role;

revoke all on all tables in schema moderation
  from public, anon, authenticated, service_role;
revoke all on all sequences in schema moderation
  from public, anon, authenticated, service_role;

commit;
