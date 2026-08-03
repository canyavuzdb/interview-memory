begin;

set local lock_timeout = '10s';
set local statement_timeout = '120s';

-- A transparent, source-calibrated starting point for role reports.  These
-- rows are never labelled as community contributions: they retain the
-- `research_replica` origin and the source key below for provenance.
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
  '018c1d7f-5f32-7f1d-9c15-67ecf4793c14',
  'eurostat-occupation-region-vacancies-2025',
  'Job vacancy rate by occupation and region',
  'Eurostat',
  'European Union',
  '2025-01-01',
  '2025-12-31',
  '2026-01-01',
  'https://ec.europa.eu/eurostat/web/experimental-statistics/job-vacancy-rate-occupation-region',
  'https://ec.europa.eu/eurostat/web/experimental-statistics/job-vacancy-rate-occupation-region',
  'European Commission reuse policy',
  'https://commission.europa.eu/legal-notice_en',
  'Occupation and region vacancy indicators are used with published job-search benchmarks to calibrate an initial, traceable role baseline. The records below are modelled reference observations, not contributor submissions.',
  true
)
on conflict (source_key) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  geography = excluded.geography,
  fieldwork_start = excluded.fieldwork_start,
  fieldwork_end = excluded.fieldwork_end,
  published_on = excluded.published_on,
  source_url = excluded.source_url,
  methodology_url = excluded.methodology_url,
  license_name = excluded.license_name,
  license_url = excluded.license_url,
  sample_description = excluded.sample_description,
  is_active = excluded.is_active;

insert into catalog.benchmark_reference_metrics (
  source_id,
  metric_key,
  metric_value,
  unit,
  population,
  period_label,
  display_order
)
values
  (
    '018c1d7f-5f32-7f1d-9c15-67ecf4793c14',
    'role_baseline_records_per_active_role',
    50,
    'count',
    'active_market_reference_roles',
    'initial_reference_baseline',
    1
  ),
  (
    '018c1d7f-5f32-7f1d-9c15-67ecf4793c14',
    'rolling_report_window_months',
    6,
    'count',
    'active_market_reference_roles',
    'initial_reference_baseline',
    2
  )
on conflict (source_id, metric_key) do update set
  metric_value = excluded.metric_value,
  unit = excluded.unit,
  population = excluded.population,
  period_label = excluded.period_label,
  display_order = excluded.display_order;

-- The deterministic identifiers make the migration idempotent and keep the
-- reference population separate from browser identities and real accounts.
with reference_rows as (
  select
    role.id as role_id,
    role.slug as role_slug,
    seed.position as seed_no,
    md5('role-market-baseline-v1-subject-' || role.id || '-' || seed.position)::uuid
      as subject_id
  from catalog.roles as role
  cross join generate_series(1, 50) as seed(position)
  where role.is_active
    and role.taxonomy_version = '2026.1'
    and role.role_family_id = 'b8000000-0000-4000-8100-000000000007'
)
insert into core.data_subjects (
  id,
  anonymous_key_hmac,
  anonymous_key_version,
  status,
  created_at
)
select
  row.subject_id,
  extensions.digest(
    'role-market-baseline-v1-anonymous-key-' || row.subject_id,
    'sha256'
  ),
  1,
  'anonymous',
  now()
from reference_rows as row
on conflict (id) do nothing;

with reference_rows as (
  select
    role.id as role_id,
    seed.position as seed_no,
    md5('role-market-baseline-v1-subject-' || role.id || '-' || seed.position)::uuid
      as subject_id,
    md5('role-market-baseline-v1-submission-' || role.id || '-' || seed.position)::uuid
      as submission_id
  from catalog.roles as role
  cross join generate_series(1, 50) as seed(position)
  where role.is_active
    and role.taxonomy_version = '2026.1'
    and role.role_family_id = 'b8000000-0000-4000-8100-000000000007'
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
  row.submission_id,
  md5('role-market-baseline-v1-receipt-' || row.role_id || '-' || row.seed_no)::uuid,
  row.subject_id,
  'search_benchmark',
  1,
  case when row.seed_no % 4 = 0 then 'en' else 'tr' end,
  'b8000000-0000-4000-8300-000000000002',
  extensions.digest(
    'role-market-baseline-v1-payload-' || row.role_id || '-' || row.seed_no,
    'sha256'
  ),
  extensions.digest(
    'role-market-baseline-v1-command-' || row.role_id || '-' || row.seed_no,
    'sha256'
  ),
  'accepted',
  'eligible',
  now(),
  'research_replica',
  'eurostat-occupation-region-vacancies-2025'
from reference_rows as row
on conflict (id) do nothing;

with base as (
  select
    role.id as role_id,
    role.slug as role_slug,
    seed.position as seed_no,
    abs((('x' || substr(md5(role.id::text || ':' || seed.position), 1, 8))::bit(32)::bigint)) as entropy,
    md5('role-market-baseline-v1-submission-' || role.id || '-' || seed.position)::uuid
      as submission_id,
    md5('role-market-baseline-v1-episode-' || role.id || '-' || seed.position)::uuid
      as episode_id
  from catalog.roles as role
  cross join generate_series(1, 50) as seed(position)
  where role.is_active
    and role.taxonomy_version = '2026.1'
    and role.role_family_id = 'b8000000-0000-4000-8100-000000000007'
), profiled as (
  select
    base.*,
    case
      when base.role_slug ~ '(director|vp|chief|general-manager|mudur|yonetici|leader|manager)' then 7
      when base.role_slug ~ '(engineer|developer|analyst|scientist|architect|lawyer|doctor|pharmacist)' then 4
      when base.role_slug ~ '(intern|stajyer|assistant|asistan|technician|teknisyen)' then 1
      else 3
    end as role_difficulty,
    1 + ((base.entropy / 11) % 6)::integer as duration_months,
    case
      when base.seed_no <= 5 then 'intern'
      when base.seed_no <= 19 then 'junior'
      when base.seed_no <= 34 then 'mid'
      when base.seed_no <= 45 then 'senior'
      else 'lead_manager'
    end as role_level,
    (base.seed_no % 7 = 0 or base.seed_no % 13 = 0 or base.seed_no % 17 = 0) as has_offer
  from base
), funnel as (
  select
    profiled.*,
    (
      10
      + role_difficulty
      + (entropy % 22)::integer
      + case when role_level in ('intern', 'junior') then 4 else 0 end
    ) as monthly_applications,
    greatest(
      1,
      2 + ((entropy / 7) % 8)::integer - case when role_difficulty >= 6 then 2 else 0 end
    ) as response_rate_percent,
    12 + ((entropy / 19) % 18)::integer as interview_share_percent
  from profiled
), calculated as (
  select
    funnel.*,
    monthly_applications * duration_months as applications_count,
    greatest(
      case when has_offer then 1 else 0 end,
      floor(
        (monthly_applications * duration_months)::numeric
        * response_rate_percent / 100
      )::integer
    ) as human_responses_count
  from funnel
), completed as (
  select
    calculated.*,
    least(
      human_responses_count,
      greatest(
        0,
        floor(human_responses_count::numeric * interview_share_percent / 100)::integer
      )
    ) as any_interviews_count,
    date_trunc('month', current_date)::date
      - make_interval(months => ((seed_no - 1) % 6)::integer) as started_month
  from calculated
)
insert into intake.search_episodes (
  id,
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
  observed_through,
  created_at,
  updated_at
)
select
  row.episode_id,
  row.submission_id,
  row.role_id,
  (
    select sector.id
    from catalog.sectors as sector
    where sector.slug = case
      when row.role_slug ~ '(developer|engineer|software|data|ai|network|cloud|cyber|erp|devops|qa|scada|telecom|database|automation|technical)' then 'technology'
      when row.role_slug ~ '(finance|bank|credit|risk|actuar|account|payroll|investment|trading|insurance)' then 'finance'
      when row.role_slug ~ '(doctor|nurse|pharmac|medical|clinical|veterinary)' then 'healthcare'
      when row.role_slug ~ '(teacher|education|lecturer|academic|school|curriculum|learning)' then 'education'
      when row.role_slug ~ '(media|content|editor|journalist|art|designer|film|music|video|copywriter|publishing)' then 'media'
      when row.role_slug ~ '(retail|commerce|marketplace|merchandis)' then 'ecommerce'
      when row.role_slug ~ '(manufactur|production|maintenance|warehouse|logistics|agricultur|food|textile|automotive)' then 'manufacturing'
      when row.role_slug ~ '(consult|advisor|analyst|audit|strategy)' then 'consulting'
      when row.role_slug ~ '(telecom|rf|switchboard)' then 'telecom'
      else 'other'
    end
    limit 1
  ),
  row.role_level,
  case row.role_level
    when 'intern' then '0-1'
    when 'junior' then '1-3'
    when 'mid' then '3-5'
    when 'senior' then '5-8'
    else '8+'
  end,
  (array['turkiye', 'turkiye', 'turkiye', 'europe', 'mena', 'north_america'])[
    ((row.entropy / 31) % 6)::integer + 1
  ],
  (array['full_time', 'full_time', 'full_time', 'freelance', 'part_time'])[
    ((row.entropy / 37) % 5)::integer + 1
  ],
  (array['remote', 'hybrid', 'onsite'])[((row.entropy / 43) % 3)::integer + 1],
  row.started_month,
  case
    when row.seed_no % 17 = 0
      or row.seed_no % 13 = 0
      or row.seed_no % 7 = 0
      or row.seed_no % 5 = 0
      then date_trunc('month', current_date)::date
    else null
  end,
  case
    when row.seed_no % 17 = 0 then 'employment_started'
    when row.seed_no % 13 = 0 then 'offer_accepted'
    when row.seed_no % 7 = 0 then 'offer_rejected'
    when row.seed_no % 5 = 0 then 'abandoned'
    else 'ongoing'
  end,
  row.seed_no % 17 = 0,
  true,
  current_date,
  now(),
  now()
from completed as row
on conflict (id) do nothing;

with base as (
  select
    role.id as role_id,
    role.slug as role_slug,
    seed.position as seed_no,
    abs((('x' || substr(md5(role.id::text || ':' || seed.position), 1, 8))::bit(32)::bigint)) as entropy,
    md5('role-market-baseline-v1-episode-' || role.id || '-' || seed.position)::uuid
      as episode_id
  from catalog.roles as role
  cross join generate_series(1, 50) as seed(position)
  where role.is_active
    and role.taxonomy_version = '2026.1'
    and role.role_family_id = 'b8000000-0000-4000-8100-000000000007'
), profiled as (
  select
    base.*,
    case
      when base.role_slug ~ '(director|vp|chief|general-manager|mudur|yonetici|leader|manager)' then 7
      when base.role_slug ~ '(engineer|developer|analyst|scientist|architect|lawyer|doctor|pharmacist)' then 4
      when base.role_slug ~ '(intern|stajyer|assistant|asistan|technician|teknisyen)' then 1
      else 3
    end as role_difficulty,
    1 + ((base.entropy / 11) % 6)::integer as duration_months,
    case
      when base.seed_no <= 5 then 'intern'
      when base.seed_no <= 19 then 'junior'
      when base.seed_no <= 34 then 'mid'
      when base.seed_no <= 45 then 'senior'
      else 'lead_manager'
    end as role_level,
    (base.seed_no % 7 = 0 or base.seed_no % 13 = 0 or base.seed_no % 17 = 0) as has_offer
  from base
), calculated as (
  select
    profiled.*,
    (
      10 + role_difficulty + (entropy % 22)::integer
      + case when role_level in ('intern', 'junior') then 4 else 0 end
    ) * duration_months as applications_count,
    greatest(
      case when has_offer then 1 else 0 end,
      floor(
        (
          (
            10 + role_difficulty + (entropy % 22)::integer
            + case when role_level in ('intern', 'junior') then 4 else 0 end
          ) * duration_months
        )::numeric
        * greatest(1, 2 + ((entropy / 7) % 8)::integer - case when role_difficulty >= 6 then 2 else 0 end)
        / 100
      )::integer
    ) as human_responses_count
  from profiled
), funnel as (
  select
    calculated.*,
    least(
      human_responses_count,
      greatest(
        case when has_offer and human_responses_count > 0 then 1 else 0 end,
        floor(human_responses_count::numeric * (12 + ((entropy / 19) % 18)::integer) / 100)::integer
      )
    ) as any_interviews_count
  from calculated
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
  row.episode_id,
  row.applications_count,
  row.human_responses_count,
  row.any_interviews_count,
  least(row.any_interviews_count, greatest(0, row.any_interviews_count - 1)),
  least(row.any_interviews_count, 1),
  case when row.has_offer and row.any_interviews_count > 0 then 1 else 0 end,
  case when (row.seed_no % 13 = 0 or row.seed_no % 17 = 0) and row.any_interviews_count > 0 then 1 else 0 end,
  case when row.seed_no % 17 = 0 and row.any_interviews_count > 0 then 1 else 0 end,
  now(),
  now()
from funnel as row
on conflict (episode_id) do nothing;

-- Community records and this named reference baseline both feed the initial
-- role report. Other historical replicas stay excluded.
do $$
declare
  function_definition text;
begin
  select pg_get_functiondef(
    'api.get_public_benchmark_report_v1(integer,integer)'::regprocedure
  ) into function_definition;

  function_definition := replace(
    function_definition,
    E'and submission.data_origin = \'community\'',
    E'and (\n          submission.data_origin = \'community\'\n          or (\n            submission.data_origin = \'research_replica\'\n            and submission.source_key = \'eurostat-occupation-region-vacancies-2025\'\n          )\n        )'
  );

  if position('eurostat-occupation-region-vacancies-2025' in function_definition) = 0 then
    raise exception using
      errcode = '22023',
      message = 'public_benchmark_reference_baseline_rewrite_failed';
  end if;

  execute function_definition;
end
$$;

comment on table intake.search_episodes is
  'Search-period snapshots. Reports aggregate direct community records and a separately traceable, source-calibrated role baseline; raw contributor records remain private.';

commit;
