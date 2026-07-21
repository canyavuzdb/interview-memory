begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- B08 owns the first production catalogue required by the search benchmark
-- form. IDs are stable so later imports and tests can reference the same
-- taxonomy without depending on identity allocation order.
insert into catalog.sectors (
  id,
  slug,
  display_name,
  sort_order,
  is_active
)
overriding system value
values
  (1001, 'technology', 'Technology', 10, true),
  (1002, 'finance', 'Finance', 20, true),
  (1003, 'ecommerce', 'E-commerce', 30, true),
  (1004, 'consulting', 'Consulting', 40, true),
  (1005, 'healthcare', 'Healthcare', 50, true),
  (1006, 'manufacturing', 'Manufacturing', 60, true),
  (1007, 'education', 'Education', 70, true),
  (1008, 'media', 'Media', 80, true),
  (1009, 'telecom', 'Telecom', 90, true),
  (1010, 'other', 'Other', 100, true)
on conflict (id) do update set
  display_name = excluded.display_name,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

select pg_catalog.setval(
  pg_catalog.pg_get_serial_sequence('catalog.sectors', 'id'),
  greatest((select max(sector.id) from catalog.sectors as sector), 1),
  true
);

insert into catalog.role_families (
  id,
  slug,
  display_name,
  taxonomy_version,
  sort_order,
  is_active
)
values
  (
    'b8000000-0000-4000-8100-000000000001',
    'engineering',
    'Engineering',
    '2026.1',
    10,
    true
  ),
  (
    'b8000000-0000-4000-8100-000000000002',
    'data-ai',
    'Data and AI',
    '2026.1',
    20,
    true
  ),
  (
    'b8000000-0000-4000-8100-000000000003',
    'product',
    'Product',
    '2026.1',
    30,
    true
  ),
  (
    'b8000000-0000-4000-8100-000000000004',
    'design',
    'Design',
    '2026.1',
    40,
    true
  ),
  (
    'b8000000-0000-4000-8100-000000000005',
    'business',
    'Business',
    '2026.1',
    50,
    true
  ),
  (
    'b8000000-0000-4000-8100-000000000006',
    'other',
    'Other',
    '2026.1',
    60,
    true
  )
on conflict (id) do update set
  display_name = excluded.display_name,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into catalog.roles (
  id,
  role_family_id,
  slug,
  display_name,
  taxonomy_version,
  sort_order,
  is_active
)
values
  (
    'b8000000-0000-4000-8200-000000000001',
    'b8000000-0000-4000-8100-000000000001',
    'software-engineer',
    'Software Engineer',
    '2026.1',
    10,
    true
  ),
  (
    'b8000000-0000-4000-8200-000000000002',
    'b8000000-0000-4000-8100-000000000001',
    'frontend-developer',
    'Frontend Developer',
    '2026.1',
    20,
    true
  ),
  (
    'b8000000-0000-4000-8200-000000000003',
    'b8000000-0000-4000-8100-000000000001',
    'backend-developer',
    'Backend Developer',
    '2026.1',
    30,
    true
  ),
  (
    'b8000000-0000-4000-8200-000000000004',
    'b8000000-0000-4000-8100-000000000001',
    'full-stack-developer',
    'Full Stack Developer',
    '2026.1',
    40,
    true
  ),
  (
    'b8000000-0000-4000-8200-000000000005',
    'b8000000-0000-4000-8100-000000000001',
    'mobile-developer',
    'Mobile Developer',
    '2026.1',
    50,
    true
  ),
  (
    'b8000000-0000-4000-8200-000000000006',
    'b8000000-0000-4000-8100-000000000002',
    'data-analyst',
    'Data Analyst',
    '2026.1',
    10,
    true
  ),
  (
    'b8000000-0000-4000-8200-000000000007',
    'b8000000-0000-4000-8100-000000000002',
    'data-scientist',
    'Data Scientist',
    '2026.1',
    20,
    true
  ),
  (
    'b8000000-0000-4000-8200-000000000008',
    'b8000000-0000-4000-8100-000000000003',
    'product-manager',
    'Product Manager',
    '2026.1',
    10,
    true
  ),
  (
    'b8000000-0000-4000-8200-000000000009',
    'b8000000-0000-4000-8100-000000000004',
    'product-designer',
    'Product Designer',
    '2026.1',
    10,
    true
  ),
  (
    'b8000000-0000-4000-8200-000000000010',
    'b8000000-0000-4000-8100-000000000001',
    'devops-engineer',
    'DevOps Engineer',
    '2026.1',
    60,
    true
  ),
  (
    'b8000000-0000-4000-8200-000000000011',
    'b8000000-0000-4000-8100-000000000001',
    'qa-engineer',
    'QA Engineer',
    '2026.1',
    70,
    true
  ),
  (
    'b8000000-0000-4000-8200-000000000012',
    'b8000000-0000-4000-8100-000000000005',
    'business-analyst',
    'Business Analyst',
    '2026.1',
    10,
    true
  ),
  (
    'b8000000-0000-4000-8200-000000000013',
    'b8000000-0000-4000-8100-000000000006',
    'other',
    'Other',
    '2026.1',
    10,
    true
  )
on conflict (id) do update set
  display_name = excluded.display_name,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

create unique index roles_slug_taxonomy_uidx
  on catalog.roles (slug, taxonomy_version);

-- Keep a concrete, immutable consent artifact available in both supported
-- locales. The digest input is intentionally embedded beside its URI so the
-- deployed evidence can be reproduced without an external document store.
with notice_seed (
  id,
  locale,
  version,
  content,
  content_uri
) as (
  values
    (
      'b8000000-0000-4000-8300-000000000001'::uuid,
      'tr'::text,
      'search-benchmark-2026-07-22.v1'::text,
      'Göndererek; yanıtımda isim, e-posta veya serbest metin bulunmadan saklanmasını, giriş yaptıysam hesabımla ilişkilendirilmesini ve yalnız yeterli örneklem oluştuğunda toplu benchmark üretiminde kullanılmasını kabul ediyorum.'::text,
      'https://interview-memory.vercel.app/tr/surveys/application-benchmark'::text
    ),
    (
      'b8000000-0000-4000-8300-000000000002'::uuid,
      'en'::text,
      'search-benchmark-2026-07-22.v1'::text,
      'By submitting, I agree that my response may be stored without names, email addresses, or free text, linked to my account if I am signed in, and used for aggregate benchmarks only once the minimum sample threshold is met.'::text,
      'https://interview-memory.vercel.app/en/surveys/application-benchmark'::text
    )
)
insert into privacy.notice_versions (
  id,
  document_type,
  locale,
  version,
  content_sha256,
  content_uri,
  effective_from
)
select
  seed.id,
  'survey_notice',
  seed.locale,
  seed.version,
  extensions.digest(seed.content, 'sha256'),
  seed.content_uri,
  '2026-07-20 00:00:00+00'::timestamptz
from notice_seed as seed
where not exists (
  select 1
  from privacy.notice_versions as existing
  where existing.document_type = 'survey_notice'
    and existing.locale = seed.locale
    and existing.effective_from <= '2026-07-20 00:00:00+00'::timestamptz
    and (
      existing.retired_at is null
      or existing.retired_at > '2026-07-20 00:00:00+00'::timestamptz
    )
)
on conflict (document_type, locale, version) do nothing;

create table intake.search_episodes (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null
    references intake.survey_submissions (id) on delete restrict,
  role_id uuid not null
    references catalog.roles (id) on delete restrict,
  sector_id smallint
    references catalog.sectors (id) on delete restrict,
  role_level text not null,
  experience_band text not null,
  target_region text not null,
  employment_type text,
  work_mode text,
  started_month date not null,
  ended_month date,
  status text not null,
  currently_employed boolean not null,
  counts_are_estimated boolean not null,
  observed_through date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint search_episodes_submission_unique unique (submission_id),
  constraint search_episodes_role_level_check check (
    role_level in ('intern', 'junior', 'mid', 'senior', 'lead_manager')
  ),
  constraint search_episodes_experience_band_check check (
    experience_band in ('0-1', '1-3', '3-5', '5-8', '8+')
  ),
  constraint search_episodes_target_region_check check (
    target_region in (
      'turkiye',
      'europe',
      'uk_ireland',
      'mena',
      'north_america',
      'other'
    )
  ),
  constraint search_episodes_employment_type_check check (
    employment_type is null
    or employment_type in ('full_time', 'part_time', 'freelance', 'internship')
  ),
  constraint search_episodes_work_mode_check check (
    work_mode is null or work_mode in ('remote', 'hybrid', 'onsite')
  ),
  constraint search_episodes_status_check check (
    status in (
      'ongoing',
      'offer_accepted',
      'employment_started',
      'offer_rejected',
      'abandoned'
    )
  ),
  constraint search_episodes_started_month_check check (
    started_month = date_trunc('month', started_month)::date
  ),
  constraint search_episodes_ended_month_check check (
    ended_month is null
    or ended_month = date_trunc('month', ended_month)::date
  ),
  constraint search_episodes_status_period_check check (
    (status = 'ongoing' and ended_month is null)
    or (status <> 'ongoing' and ended_month is not null)
  ),
  constraint search_episodes_period_order_check check (
    ended_month is null or ended_month >= started_month
  ),
  constraint search_episodes_observation_check check (
    observed_through >= started_month
    and (
      ended_month is null
      or observed_through >= ended_month
    )
  ),
  constraint search_episodes_timestamps_check check (
    updated_at >= created_at
  )
);

create index search_episodes_role_region_month_idx
  on intake.search_episodes (
    role_id,
    target_region,
    started_month,
    id
  );
create index search_episodes_sector_month_idx
  on intake.search_episodes (sector_id, started_month, id)
  where sector_id is not null;
create index search_episodes_maturity_idx
  on intake.search_episodes (status, observed_through, id);

comment on table intake.search_episodes is
  'T24 immutable canonical search-period snapshot. Ownership is derived only through submission_id and never duplicated on the domain row.';

create table intake.episode_funnel_totals (
  episode_id uuid primary key
    references intake.search_episodes (id) on delete restrict,
  applications_count integer not null,
  human_responses_count integer not null,
  any_interviews_count integer not null,
  hr_interviews_count integer not null,
  technical_interviews_count integer not null,
  offers_count integer not null,
  accepted_offers_count integer not null,
  employment_started_count integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint episode_funnel_totals_nonnegative_check check (
    applications_count >= 0
    and human_responses_count >= 0
    and any_interviews_count >= 0
    and hr_interviews_count >= 0
    and technical_interviews_count >= 0
    and offers_count >= 0
    and accepted_offers_count >= 0
    and employment_started_count >= 0
  ),
  constraint episode_funnel_totals_upper_bound_check check (
    applications_count <= 100000
    and human_responses_count <= 100000
    and any_interviews_count <= 100000
    and hr_interviews_count <= 100000
    and technical_interviews_count <= 100000
    and offers_count <= 100000
    and accepted_offers_count <= 100000
    and employment_started_count <= 100000
  ),
  constraint episode_funnel_totals_funnel_order_check check (
    human_responses_count <= applications_count
    and any_interviews_count <= human_responses_count
    and hr_interviews_count <= any_interviews_count
    and technical_interviews_count <= any_interviews_count
    and offers_count <= any_interviews_count
    and accepted_offers_count <= offers_count
    and employment_started_count <= accepted_offers_count
  ),
  constraint episode_funnel_totals_timestamps_check check (
    updated_at >= created_at
  )
);

comment on table intake.episode_funnel_totals is
  'T25 immutable unique-application funnel totals for one search episode. HR and technical counts are subsets of any_interviews_count, not additive stages.';

alter table intake.search_episodes enable row level security;
alter table intake.search_episodes force row level security;
alter table intake.episode_funnel_totals enable row level security;
alter table intake.episode_funnel_totals force row level security;

create function intake.reject_search_benchmark_snapshot_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception using
    errcode = '55000',
    message = 'search_benchmark_snapshot_is_immutable';
end;
$$;

revoke all on function intake.reject_search_benchmark_snapshot_mutation()
  from public, anon, authenticated, service_role;

create trigger reject_search_episode_mutation
before update or delete
on intake.search_episodes
for each row
execute function intake.reject_search_benchmark_snapshot_mutation();

create trigger reject_episode_funnel_totals_mutation
before update or delete
on intake.episode_funnel_totals
for each row
execute function intake.reject_search_benchmark_snapshot_mutation();

create function api.create_search_episode_v1(
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
  p_quota_window_start timestamptz,
  p_quota_limit integer,
  p_quota_policy_version text,
  p_quota_policy_hash bytea,
  p_quota_expires_at timestamptz,
  p_role_slug text,
  p_sector_slug text,
  p_role_level text,
  p_experience_band text,
  p_target_region text,
  p_employment_type text,
  p_work_mode text,
  p_started_month date,
  p_ended_month date,
  p_status text,
  p_currently_employed boolean,
  p_counts_are_estimated boolean,
  p_observed_through date,
  p_applications_count integer,
  p_human_responses_count integer,
  p_any_interviews_count integer,
  p_hr_interviews_count integer,
  p_technical_interviews_count integer,
  p_offers_count integer,
  p_accepted_offers_count integer,
  p_employment_started_count integer
)
returns table (
  submission_id uuid,
  receipt_id uuid,
  search_episode_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  submission_record record;
  resolved_role_id uuid;
  resolved_sector_id smallint;
  inserted_episode_id uuid;
begin
  if p_schema_version <> 1 then
    raise exception using
      errcode = '22023',
      message = 'search_episode_schema_version_invalid';
  end if;

  if p_observed_through is null
    or p_observed_through > current_date
  then
    raise exception using
      errcode = '22023',
      message = 'search_episode_observed_through_invalid';
  end if;

  if (p_status = 'offer_accepted' and p_accepted_offers_count = 0)
    or (p_status = 'employment_started' and p_employment_started_count = 0)
    or (p_status = 'offer_rejected' and p_offers_count = 0)
  then
    raise exception using
      errcode = '22023',
      message = 'search_episode_status_count_mismatch';
  end if;

  select *
  into submission_record
  from intake.begin_survey_submission_v1(
    p_data_subject_id,
    'search_benchmark',
    p_schema_version,
    p_locale,
    p_notice_version_id,
    p_payload_hash,
    p_command_fingerprint,
    p_supersedes_submission_id,
    p_capability_hmac,
    p_capability_key_version,
    p_capability_expires_at,
    p_consent_subject_proof_hmac,
    p_consent_subject_proof_key_version,
    p_consent_idempotency_key,
    p_idempotency_subject_hmac,
    'survey.search-benchmark.create',
    p_idempotency_key_hmac,
    p_idempotency_request_fingerprint,
    'survey.single-response',
    p_quota_subject_hmac,
    p_quota_window_start,
    'accepted_period',
    p_quota_limit,
    p_quota_policy_version,
    p_quota_policy_hash,
    p_quota_expires_at
  );

  select role.id
  into resolved_role_id
  from catalog.roles as role
  inner join catalog.role_families as family
    on family.id = role.role_family_id
    and family.taxonomy_version = role.taxonomy_version
  where role.slug = p_role_slug
    and role.taxonomy_version = '2026.1'
    and role.is_active
    and family.is_active
  for key share of role, family;

  if not found then
    raise exception using
      errcode = '22023',
      message = 'search_episode_role_not_active';
  end if;

  if p_sector_slug is not null then
    select sector.id
    into resolved_sector_id
    from catalog.sectors as sector
    where sector.slug = p_sector_slug
      and sector.is_active
    for key share;

    if not found then
      raise exception using
        errcode = '22023',
        message = 'search_episode_sector_not_active';
    end if;
  end if;

  insert into intake.search_episodes (
    submission_id,
    role_id,
    sector_id,
    role_level,
    experience_band,
    target_region,
    employment_type,
    work_mode,
    started_month,
    ended_month,
    status,
    currently_employed,
    counts_are_estimated,
    observed_through
  )
  values (
    submission_record.submission_id,
    resolved_role_id,
    resolved_sector_id,
    p_role_level,
    p_experience_band,
    p_target_region,
    p_employment_type,
    p_work_mode,
    p_started_month,
    p_ended_month,
    p_status,
    p_currently_employed,
    p_counts_are_estimated,
    p_observed_through
  )
  returning id into inserted_episode_id;

  insert into intake.episode_funnel_totals (
    episode_id,
    applications_count,
    human_responses_count,
    any_interviews_count,
    hr_interviews_count,
    technical_interviews_count,
    offers_count,
    accepted_offers_count,
    employment_started_count
  )
  values (
    inserted_episode_id,
    p_applications_count,
    p_human_responses_count,
    p_any_interviews_count,
    p_hr_interviews_count,
    p_technical_interviews_count,
    p_offers_count,
    p_accepted_offers_count,
    p_employment_started_count
  );

  perform intake.complete_survey_submission_v1(
    p_idempotency_subject_hmac,
    'survey.search-benchmark.create',
    p_idempotency_key_hmac,
    p_idempotency_request_fingerprint,
    submission_record.submission_id,
    201::smallint
  );

  return query
  select
    submission_record.submission_id,
    submission_record.receipt_id,
    inserted_episode_id;
end;
$$;

revoke all on function api.create_search_episode_v1(
  uuid, integer, text, uuid, bytea, bytea, uuid, bytea, smallint,
  timestamptz, bytea, smallint, uuid, bytea, bytea, bytea, bytea,
  timestamptz, integer, text, bytea, timestamptz, text, text, text,
  text, text, text, text, date, date, text, boolean, boolean, date,
  integer, integer, integer, integer, integer, integer, integer, integer
) from public, anon, authenticated, service_role;
grant execute on function api.create_search_episode_v1(
  uuid, integer, text, uuid, bytea, bytea, uuid, bytea, smallint,
  timestamptz, bytea, smallint, uuid, bytea, bytea, bytea, bytea,
  timestamptz, integer, text, bytea, timestamptz, text, text, text,
  text, text, text, text, date, date, text, boolean, boolean, date,
  integer, integer, integer, integer, integer, integer, integer, integer
) to service_role;

comment on function api.create_search_episode_v1(
  uuid, integer, text, uuid, bytea, bytea, uuid, bytea, smallint,
  timestamptz, bytea, smallint, uuid, bytea, bytea, bytea, bytea,
  timestamptz, integer, text, bytea, timestamptz, text, text, text,
  text, text, text, text, date, date, text, boolean, boolean, date,
  integer, integer, integer, integer, integer, integer, integer, integer
) is
  'Server-only B08 command. It resolves active canonical catalogue slugs and atomically creates T23, T24, T25, consent, accepted quota, and the completed idempotency result.';

create function api.get_search_episode_create_result_v1(
  p_submission_id uuid,
  p_data_subject_id uuid
)
returns table (
  submission_id uuid,
  receipt_id uuid,
  search_episode_id uuid,
  capability_key_version smallint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    submission.id,
    submission.receipt_id,
    episode.id,
    submission.capability_key_version
  from intake.survey_submissions as submission
  inner join intake.search_episodes as episode
    on episode.submission_id = submission.id
  where submission.id = p_submission_id
    and submission.data_subject_id = p_data_subject_id
    and submission.survey_type = 'search_benchmark'
  limit 1;
$$;

revoke all on function api.get_search_episode_create_result_v1(uuid, uuid)
  from public, anon, authenticated, service_role;
grant execute on function api.get_search_episode_create_result_v1(uuid, uuid)
  to service_role;

comment on function api.get_search_episode_create_result_v1(uuid, uuid) is
  'Server-only idempotency replay lookup. A trusted current data-subject owner is mandatory and a miss returns no row.';

revoke all on all tables in schema intake
  from public, anon, authenticated, service_role;
revoke all on all sequences in schema intake
  from public, anon, authenticated, service_role;

commit;
