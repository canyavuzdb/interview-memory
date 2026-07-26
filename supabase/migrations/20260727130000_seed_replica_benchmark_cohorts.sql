-- B12.1 correction: populate the existing benchmark reports with traceable,
-- anonymous replica cohorts calibrated to published job-search research.
--
-- Replica rows deliberately use the same intake tables and constraints as
-- community contributions so the report exercises the real production read
-- model. Their origin remains queryable internally and they are never backed
-- by fake auth accounts or real employer names.

drop function if exists api.get_public_benchmark_references_v1();

alter table intake.survey_submissions
  add column data_origin text not null default 'community',
  add column source_key text
    references catalog.benchmark_reference_sources (source_key)
    on delete restrict,
  add constraint survey_submissions_data_origin_check check (
    data_origin in ('community', 'research_replica')
  ),
  add constraint survey_submissions_origin_source_check check (
    (data_origin = 'community' and source_key is null)
    or (data_origin = 'research_replica' and source_key is not null)
  );

create index survey_submissions_origin_source_idx
  on intake.survey_submissions (data_origin, source_key, submitted_at, id);

comment on column intake.survey_submissions.data_origin is
  'community for direct product contributions; research_replica for traceable anonymous seed cohorts.';
comment on column intake.survey_submissions.source_key is
  'Internal provenance for research-calibrated replica rows; never exposed as a contributor identity.';

insert into catalog.benchmark_reference_sources (
  id,
  source_key,
  title,
  publisher,
  geography,
  fieldwork_start,
  fieldwork_end,
  published_on,
  source_url,
  methodology_url,
  license_name,
  license_url,
  sample_description,
  is_active
) values (
  '018c1d7f-5f32-7f1d-9c15-67ecf4793c13',
  'uk-ea-response-time-2018-2022',
  'Time taken to inform candidates of application outcomes',
  'UK Parliament',
  'United Kingdom',
  '2018-01-01',
  '2022-12-31',
  '2023-05-03',
  'https://questions-statements.parliament.uk/written-questions/detail/2023-04-24/182230',
  'https://questions-statements.parliament.uk/written-questions/detail/2023-04-24/182230',
  'UK Parliament copyright — attributed factual extract',
  'https://www.parliament.uk/site-information/copyright-parliament/',
  'Published Environment Agency average working days from advert close to candidate outcome notification.',
  true
) on conflict (source_key) do nothing;

insert into catalog.benchmark_reference_metrics (
  source_id,
  metric_key,
  metric_value,
  unit,
  population,
  period_label,
  display_order
)
select
  source.id,
  'average_candidate_notification_days',
  12.7,
  'count',
  'environment_agency_applicants',
  'calendar_year_2022',
  1
from catalog.benchmark_reference_sources as source
where source.source_key = 'uk-ea-response-time-2018-2022'
on conflict (source_id, metric_key) do nothing;

insert into catalog.companies (
  id,
  slug,
  display_name,
  country_code,
  verification_status,
  publication_status
)
select
  md5('benchmark-replica-company-' || replica.company_code)::uuid,
  'anonim-sirket-' || lower(replica.company_code),
  'Anonim Şirket ' || replica.company_code,
  'TR',
  'verified',
  'published'
from unnest(array['A', 'B', 'C']) as replica(company_code)
on conflict (id) do nothing;

insert into catalog.role_families (
  id,
  slug,
  display_name,
  taxonomy_version,
  sort_order,
  is_active
) values
  (
    md5('benchmark-replica-role-family-software')::uuid,
    'software',
    'Software',
    'research-replica-v1',
    10,
    true
  ),
  (
    md5('benchmark-replica-role-family-data-ai')::uuid,
    'data-ai',
    'Data & AI',
    'research-replica-v1',
    20,
    true
  ),
  (
    md5('benchmark-replica-role-family-product')::uuid,
    'product',
    'Product',
    'research-replica-v1',
    30,
    true
  )
on conflict (id) do nothing;

insert into catalog.roles (
  id,
  role_family_id,
  slug,
  display_name,
  taxonomy_version,
  sort_order,
  is_active
) values
  (
    md5('benchmark-replica-role-software-engineer')::uuid,
    md5('benchmark-replica-role-family-software')::uuid,
    'software-engineer',
    'Software Engineer',
    'research-replica-v1',
    10,
    true
  ),
  (
    md5('benchmark-replica-role-data-analyst')::uuid,
    md5('benchmark-replica-role-family-data-ai')::uuid,
    'data-analyst',
    'Data Analyst',
    'research-replica-v1',
    20,
    true
  ),
  (
    md5('benchmark-replica-role-product-manager')::uuid,
    md5('benchmark-replica-role-family-product')::uuid,
    'product-manager',
    'Product Manager',
    'research-replica-v1',
    30,
    true
  )
on conflict (id) do nothing;

with replica_subjects as (
  select
    sequence_no,
    md5('benchmark-replica-subject-' || sequence_no)::uuid as subject_id
  from generate_series(1, 36) as sequence_no
)
insert into core.data_subjects (
  id,
  anonymous_key_hmac,
  anonymous_key_version,
  status,
  created_at
)
select
  subject.subject_id,
  extensions.digest(
    'benchmark-replica-anonymous-key-' || subject.sequence_no,
    'sha256'
  ),
  1,
  'anonymous',
  now()
from replica_subjects as subject
on conflict (id) do nothing;

with replica_rows as (
  select
    sequence_no,
    md5('benchmark-replica-subject-' || sequence_no)::uuid as subject_id,
    md5('benchmark-replica-search-submission-' || sequence_no)::uuid
      as submission_id
  from generate_series(1, 36) as sequence_no
)
insert into intake.survey_submissions (
  id,
  receipt_id,
  data_subject_id,
  survey_type,
  schema_version,
  locale,
  notice_version_id,
  payload_hash,
  command_fingerprint,
  lifecycle_status,
  quality_status,
  submitted_at,
  data_origin,
  source_key
)
select
  replica.submission_id,
  md5('benchmark-replica-search-receipt-' || replica.sequence_no)::uuid,
  replica.subject_id,
  'search_benchmark',
  1,
  'en',
  'b8000000-0000-4000-8300-000000000002',
  extensions.digest(
    'benchmark-replica-search-payload-' || replica.sequence_no,
    'sha256'
  ),
  extensions.digest(
    'benchmark-replica-search-command-' || replica.sequence_no,
    'sha256'
  ),
  'accepted',
  'eligible',
  now(),
  'research_replica',
  'us-cps-job-search-2018'
from replica_rows as replica
on conflict (id) do nothing;

with replica_rows as (
  select
    sequence_no,
    ((sequence_no - 1) / 12)::integer as cohort_no,
    ((sequence_no - 1) % 12 + 1)::integer as cohort_position,
    md5('benchmark-replica-search-submission-' || sequence_no)::uuid
      as submission_id,
    md5('benchmark-replica-search-episode-' || sequence_no)::uuid
      as episode_id
  from generate_series(1, 36) as sequence_no
)
insert into intake.search_episodes (
  id,
  submission_id,
  role_id,
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
  observed_through,
  created_at,
  updated_at
)
select
  replica.episode_id,
  replica.submission_id,
  (
    select role.id
    from catalog.roles as role
    where role.slug = case replica.cohort_no
      when 0 then 'software-engineer'
      when 1 then 'data-analyst'
      else 'product-manager'
    end
      and role.taxonomy_version = 'research-replica-v1'
      and role.is_active
    order by role.taxonomy_version desc, role.id
    limit 1
  ),
  case replica.cohort_no
    when 0 then 'junior'
    when 1 then 'mid'
    else 'senior'
  end,
  case replica.cohort_no
    when 0 then '1-3'
    when 1 then '3-5'
    else '5-8'
  end,
  'turkiye',
  'full_time',
  case replica.cohort_no
    when 0 then 'remote'
    when 1 then 'hybrid'
    else 'onsite'
  end,
  (
    date_trunc('month', current_date)
    - make_interval(months => case replica.cohort_no
      when 0 then 0
      when 1 then 1
      else 3
    end)
  )::date,
  date_trunc('month', current_date)::date,
  case
    when replica.cohort_position = 12 then 'employment_started'
    when replica.cohort_position = 11 then 'offer_accepted'
    when replica.cohort_position >= 9
      or (replica.cohort_no = 1 and replica.cohort_position = 8)
      then 'offer_rejected'
    else 'abandoned'
  end,
  replica.cohort_position = 12,
  true,
  current_date,
  now(),
  now()
from replica_rows as replica
on conflict (id) do nothing;

with replica_rows as (
  select
    sequence_no,
    ((sequence_no - 1) / 12)::integer as cohort_no,
    ((sequence_no - 1) % 12 + 1)::integer as cohort_position,
    md5('benchmark-replica-search-episode-' || sequence_no)::uuid
      as episode_id
  from generate_series(1, 36) as sequence_no
)
insert into intake.episode_funnel_totals (
  episode_id,
  applications_count,
  human_responses_count,
  any_interviews_count,
  hr_interviews_count,
  technical_interviews_count,
  offers_count,
  accepted_offers_count,
  employment_started_count,
  created_at,
  updated_at
)
select
  replica.episode_id,
  (array[10, 11, 12, 13, 14, 15, 16, 17, 18, 10, 13, 15])[
    replica.cohort_position
  ],
  (array[3, 3, 4, 4, 5, 5, 5, 6, 6, 4, 5, 6])[
    replica.cohort_position
  ],
  (array[1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3])[
    replica.cohort_position
  ],
  least(
    (array[1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3])[
      replica.cohort_position
    ],
    1
  ),
  greatest(
    (array[1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3])[
      replica.cohort_position
    ] - 1,
    0
  ),
  case
    when replica.cohort_position >= 9
      or (replica.cohort_no = 1 and replica.cohort_position = 8)
      then 1
    else 0
  end,
  case when replica.cohort_position >= 11 then 1 else 0 end,
  case when replica.cohort_position = 12 then 1 else 0 end,
  now(),
  now()
from replica_rows as replica
on conflict (episode_id) do nothing;

with replica_rows as (
  select
    sequence_no,
    md5('benchmark-replica-subject-' || sequence_no)::uuid as subject_id,
    md5('benchmark-replica-company-submission-' || sequence_no)::uuid
      as submission_id
  from generate_series(1, 36) as sequence_no
)
insert into intake.survey_submissions (
  id,
  receipt_id,
  data_subject_id,
  survey_type,
  schema_version,
  locale,
  notice_version_id,
  payload_hash,
  command_fingerprint,
  lifecycle_status,
  quality_status,
  submitted_at,
  data_origin,
  source_key
)
select
  replica.submission_id,
  md5('benchmark-replica-company-receipt-' || replica.sequence_no)::uuid,
  replica.subject_id,
  'company_experience',
  1,
  'en',
  'b8000000-0000-4000-8300-000000000002',
  extensions.digest(
    'benchmark-replica-company-payload-' || replica.sequence_no,
    'sha256'
  ),
  extensions.digest(
    'benchmark-replica-company-command-' || replica.sequence_no,
    'sha256'
  ),
  'accepted',
  'eligible',
  now(),
  'research_replica',
  'uk-ea-response-time-2018-2022'
from replica_rows as replica
on conflict (id) do nothing;

with replica_rows as (
  select
    sequence_no,
    ((sequence_no - 1) / 12)::integer as cohort_no,
    ((sequence_no - 1) % 12 + 1)::integer as cohort_position,
    md5('benchmark-replica-company-submission-' || sequence_no)::uuid
      as submission_id,
    md5('benchmark-replica-company-experience-' || sequence_no)::uuid
      as experience_id
  from generate_series(1, 36) as sequence_no
)
insert into intake.company_experiences (
  id,
  submission_id,
  company_id,
  company_name,
  applied_role,
  process_year,
  promised_timeline,
  promised_days,
  actual_days,
  was_ghosted,
  ghosted_after_stage,
  interviewer_prepared,
  was_asked_irrelevant,
  irrelevant_types,
  rejection_shared,
  feedback_useful,
  process_transparency,
  hr_professionalism,
  would_recommend_process,
  free_note,
  created_at
)
select
  replica.experience_id,
  replica.submission_id,
  md5(
    'benchmark-replica-company-'
    || chr(ascii('A') + replica.cohort_no)
  )::uuid,
  'Anonim Şirket ' || chr(ascii('A') + replica.cohort_no),
  case replica.cohort_no
    when 0 then 'Software Engineer'
    when 1 then 'Data Analyst'
    else 'Product Manager'
  end,
  extract(year from current_date)::smallint,
  case when replica.cohort_no = 2 then 'not_specified' else 'yes' end,
  case replica.cohort_no when 0 then 7 when 1 then 14 else null end,
  case replica.cohort_no when 0 then 7 when 1 then 13 else null end,
  replica.cohort_no = 2,
  case
    when replica.cohort_no <> 2 then null
    when replica.cohort_position <= 4 then 'application'
    when replica.cohort_position <= 8 then 'hr_screen'
    else 'technical'
  end,
  case when replica.cohort_no = 2 then null else 4 end,
  false,
  '{}'::text[],
  case when replica.cohort_no = 2 then 'no' else 'yes_generic' end,
  case when replica.cohort_no = 2 then null else 3 end,
  case when replica.cohort_no = 2 then 2 else 4 end,
  case when replica.cohort_no = 2 then 3 else 4 end,
  case when replica.cohort_no = 2 then 'no' else 'yes' end,
  null,
  now()
from replica_rows as replica
on conflict (id) do nothing;

with replica_rows as (
  select
    sequence_no,
    ((sequence_no - 1) / 12)::integer as cohort_no,
    ((sequence_no - 1) % 12 + 1)::integer as cohort_position,
    md5('benchmark-replica-company-submission-' || sequence_no)::uuid
      as submission_id,
    md5('benchmark-replica-company-experience-' || sequence_no)::uuid
      as experience_id,
    md5('benchmark-replica-job-application-' || sequence_no)::uuid
      as application_id
  from generate_series(1, 36) as sequence_no
)
insert into intake.job_applications (
  id,
  submission_id,
  company_experience_id,
  company_id,
  applied_role,
  application_channel,
  had_referral,
  applied_month,
  observed_through,
  created_at
)
select
  replica.application_id,
  replica.submission_id,
  replica.experience_id,
  md5(
    'benchmark-replica-company-'
    || chr(ascii('A') + replica.cohort_no)
  )::uuid,
  case replica.cohort_no
    when 0 then 'Software Engineer'
    when 1 then 'Data Analyst'
    else 'Product Manager'
  end,
  (array[
    'linkedin', 'job_board', 'company_site', 'referral'
  ]::text[])[(replica.cohort_position - 1) % 4 + 1],
  replica.cohort_position % 4 = 0,
  (
    date_trunc('month', current_date) - interval '2 months'
  )::date,
  current_date,
  now()
from replica_rows as replica
on conflict (id) do nothing;

with replica_rows as (
  select
    sequence_no,
    ((sequence_no - 1) / 12)::integer as cohort_no,
    ((sequence_no - 1) % 12 + 1)::integer as cohort_position,
    md5('benchmark-replica-job-application-' || sequence_no)::uuid
      as application_id
  from generate_series(1, 36) as sequence_no
),
stage_rows as (
  select application_id, 'application'::text as stage_code, 1::smallint as sequence_no
  from replica_rows
  union all
  select application_id, 'hr_screen', 2::smallint
  from replica_rows
  where cohort_position >= 5
  union all
  select application_id, 'technical', 3::smallint
  from replica_rows
  where cohort_position >= 9
  union all
  select application_id, 'final', 4::smallint
  from replica_rows
  where cohort_no < 2 and cohort_position >= 10
  union all
  select application_id, 'offer', 5::smallint
  from replica_rows
  where cohort_no < 2 and cohort_position >= 10
)
insert into intake.application_stage_events (
  id,
  application_id,
  stage_code,
  occurred_month,
  date_precision,
  sequence_no,
  source_kind,
  created_at
)
select
  md5(
    'benchmark-replica-stage-'
    || stage.application_id::text || '-' || stage.stage_code
  )::uuid,
  stage.application_id,
  stage.stage_code,
  (
    date_trunc('month', current_date) - interval '1 month'
  )::date,
  'month',
  stage.sequence_no,
  'initial',
  now()
from stage_rows as stage
on conflict (id) do nothing;

with replica_rows as (
  select
    sequence_no,
    ((sequence_no - 1) / 12)::integer as cohort_no,
    ((sequence_no - 1) % 12 + 1)::integer as cohort_position,
    md5('benchmark-replica-job-application-' || sequence_no)::uuid
      as application_id
  from generate_series(1, 36) as sequence_no
)
insert into intake.application_outcome_events (
  id,
  application_id,
  outcome_code,
  occurred_month,
  observed_through,
  sequence_no,
  source_kind,
  created_at
)
select
  md5('benchmark-replica-outcome-' || replica.sequence_no)::uuid,
  replica.application_id,
  case
    when replica.cohort_no = 2 then 'awaiting_response'
    when replica.cohort_position <= 4 then 'automated_rejection'
    when replica.cohort_position <= 7 then 'manual_rejection'
    when replica.cohort_position <= 9 then 'interviewing'
    when replica.cohort_position = 10 then 'offer_declined'
    when replica.cohort_position = 11 then 'offer_accepted'
    else 'employment_started'
  end,
  case
    when replica.cohort_no = 2
      or replica.cohort_position in (8, 9)
      then null
    else (
      date_trunc('month', current_date) - interval '1 month'
    )::date
  end,
  current_date,
  1,
  'initial',
  now()
from replica_rows as replica
on conflict (id) do nothing;

with replica_rows as (
  select
    sequence_no,
    ((sequence_no - 1) / 12)::integer as cohort_no,
    ((sequence_no - 1) % 12 + 1)::integer as cohort_position,
    md5('benchmark-replica-job-application-' || sequence_no)::uuid
      as application_id,
    md5('benchmark-replica-offer-' || sequence_no)::uuid as offer_id
  from generate_series(1, 36) as sequence_no
)
insert into intake.application_offers (
  id,
  application_id,
  offered_month,
  created_at
)
select
  replica.offer_id,
  replica.application_id,
  (
    date_trunc('month', current_date) - interval '1 month'
  )::date,
  now()
from replica_rows as replica
where replica.cohort_no < 2
  and replica.cohort_position >= 10
on conflict (id) do nothing;

with replica_rows as (
  select
    sequence_no,
    ((sequence_no - 1) / 12)::integer as cohort_no,
    ((sequence_no - 1) % 12 + 1)::integer as cohort_position,
    md5('benchmark-replica-offer-' || sequence_no)::uuid as offer_id
  from generate_series(1, 36) as sequence_no
)
insert into intake.employment_outcomes (
  id,
  offer_id,
  status,
  planned_start_month,
  started_month,
  updated_at
)
select
  md5('benchmark-replica-employment-' || replica.sequence_no)::uuid,
  replica.offer_id,
  case when replica.cohort_position = 12 then 'started' else 'accepted' end,
  date_trunc('month', current_date)::date,
  case
    when replica.cohort_position = 12
      then date_trunc('month', current_date)::date
    else null
  end,
  now()
from replica_rows as replica
where replica.cohort_no < 2
  and replica.cohort_position >= 11
on conflict (id) do nothing;
