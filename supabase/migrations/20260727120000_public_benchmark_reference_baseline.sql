-- B12.1: source-backed public benchmark references.
--
-- External research is deliberately stored outside the candidate intake
-- tables. It can inform an early benchmark experience without pretending that
-- a published aggregate represents an Interview Memory contributor.

create table catalog.benchmark_reference_sources (
  id uuid primary key,
  source_key text not null unique,
  title text not null,
  publisher text not null,
  geography text not null,
  fieldwork_start date not null,
  fieldwork_end date not null,
  published_on date not null,
  source_url text not null,
  methodology_url text not null,
  license_name text not null,
  license_url text not null,
  sample_description text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  constraint benchmark_reference_sources_date_order_check
    check (fieldwork_start <= fieldwork_end),
  constraint benchmark_reference_sources_https_check
    check (
      source_url ~ '^https://'
      and methodology_url ~ '^https://'
      and license_url ~ '^https://'
    )
);

create table catalog.benchmark_reference_metrics (
  id bigint generated always as identity primary key,
  source_id uuid not null
    references catalog.benchmark_reference_sources (id) on delete restrict,
  metric_key text not null,
  metric_value numeric(12, 4) not null,
  unit text not null,
  population text not null,
  period_label text not null,
  display_order smallint not null,
  created_at timestamptz not null default now(),
  constraint benchmark_reference_metrics_source_key_uidx
    unique (source_id, metric_key),
  constraint benchmark_reference_metrics_value_check
    check (metric_value >= 0),
  constraint benchmark_reference_metrics_unit_check
    check (unit in ('count', 'ratio', 'percent')),
  constraint benchmark_reference_metrics_order_check
    check (display_order > 0)
);

alter table catalog.benchmark_reference_sources enable row level security;
alter table catalog.benchmark_reference_sources force row level security;
alter table catalog.benchmark_reference_metrics enable row level security;
alter table catalog.benchmark_reference_metrics force row level security;

revoke all on table catalog.benchmark_reference_sources
  from public, anon, authenticated, service_role;
revoke all on table catalog.benchmark_reference_metrics
  from public, anon, authenticated, service_role;
revoke all on sequence catalog.benchmark_reference_metrics_id_seq
  from public, anon, authenticated, service_role;

comment on table catalog.benchmark_reference_sources is
  'Versioned provenance for published research used as a public benchmark reference.';
comment on table catalog.benchmark_reference_metrics is
  'Published aggregate metrics; never counted as Interview Memory contributors.';

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
  '018c1d7f-5f32-7f1d-9c15-67ecf4793c12',
  'us-cps-job-search-2018',
  'How do jobseekers search for jobs?',
  'U.S. Bureau of Labor Statistics',
  'United States',
  '2018-05-01',
  '2018-09-30',
  '2020-11-01',
  'https://www.bls.gov/opub/btn/volume-9/how-do-jobseekers-search-for-jobs.htm',
  'https://www.census.gov/data/datasets/2018/demo/cps/cps-unemployment.html',
  'United States government work — public domain',
  'https://www.bls.gov/opub/copyright-information.htm',
  'May and September 2018 Current Population Survey supplement; published weighted estimates for unemployed jobseekers who had looked for work recently.',
  true
);

insert into catalog.benchmark_reference_metrics (
  source_id,
  metric_key,
  metric_value,
  unit,
  population,
  period_label,
  display_order
) values
  (
    '018c1d7f-5f32-7f1d-9c15-67ecf4793c12',
    'average_applications',
    13.67,
    'count',
    'all_jobseekers',
    'last_2_months',
    1
  ),
  (
    '018c1d7f-5f32-7f1d-9c15-67ecf4793c12',
    'average_interviews',
    1.93,
    'count',
    'all_jobseekers',
    'last_2_months',
    2
  ),
  (
    '018c1d7f-5f32-7f1d-9c15-67ecf4793c12',
    'applications_per_interview',
    6,
    'ratio',
    'all_jobseekers',
    'last_2_months',
    3
  ),
  (
    '018c1d7f-5f32-7f1d-9c15-67ecf4793c12',
    'offer_rate_with_interview',
    36.89,
    'percent',
    'jobseekers_with_interview',
    'since_last_worked',
    4
  ),
  (
    '018c1d7f-5f32-7f1d-9c15-67ecf4793c12',
    'offer_rate_without_interview',
    9.94,
    'percent',
    'jobseekers_without_interview',
    'since_last_worked',
    5
  );

create or replace function api.get_public_benchmark_references_v1()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', source.source_key,
        'title', source.title,
        'publisher', source.publisher,
        'geography', source.geography,
        'fieldworkStart', source.fieldwork_start,
        'fieldworkEnd', source.fieldwork_end,
        'publishedOn', source.published_on,
        'sourceUrl', source.source_url,
        'methodologyUrl', source.methodology_url,
        'licenseName', source.license_name,
        'sampleDescription', source.sample_description,
        'metrics', source_metrics.metrics
      )
      order by source.published_on desc, source.source_key
    ),
    '[]'::jsonb
  )
  from catalog.benchmark_reference_sources as source
  cross join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'key', metric.metric_key,
        'value', metric.metric_value,
        'unit', metric.unit,
        'population', metric.population,
        'period', metric.period_label
      )
      order by metric.display_order, metric.metric_key
    ) as metrics
    from catalog.benchmark_reference_metrics as metric
    where metric.source_id = source.id
  ) as source_metrics
  where source.is_active
    and source_metrics.metrics is not null;
$$;

revoke all on function api.get_public_benchmark_references_v1()
  from public, anon, authenticated;
grant execute on function api.get_public_benchmark_references_v1()
  to service_role;

comment on function api.get_public_benchmark_references_v1() is
  'Returns attributed external research aggregates. These values never contribute to community cohort counts.';
