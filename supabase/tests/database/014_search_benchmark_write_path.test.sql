begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(26);

select extensions.has_table('intake', 'search_episodes', 'T24 exists');
select extensions.has_table('intake', 'episode_funnel_totals', 'T25 exists');
select extensions.ok((
  select relation.relrowsecurity and relation.relforcerowsecurity
  from pg_class as relation join pg_namespace as namespace on namespace.oid = relation.relnamespace
  where namespace.nspname = 'intake' and relation.relname = 'search_episodes'
), 'T24 forces RLS');
select extensions.ok((
  select relation.relrowsecurity and relation.relforcerowsecurity
  from pg_class as relation join pg_namespace as namespace on namespace.oid = relation.relnamespace
  where namespace.nspname = 'intake' and relation.relname = 'episode_funnel_totals'
), 'T25 forces RLS');
select extensions.ok(
  not has_table_privilege('anon', 'intake.search_episodes', 'SELECT')
  and not has_table_privilege('authenticated', 'intake.search_episodes', 'SELECT')
  and not has_table_privilege('service_role', 'intake.search_episodes', 'SELECT'),
  'application roles cannot read raw benchmark snapshots'
);
select extensions.ok(
  has_function_privilege(
    'service_role',
    'api.create_search_episode_v1(uuid,integer,text,uuid,bytea,bytea,uuid,bytea,smallint,timestamptz,bytea,smallint,uuid,bytea,bytea,bytea,bytea,timestamptz,integer,text,bytea,timestamptz,text,text,text,text,text,text,text,date,date,text,boolean,boolean,date,integer,integer,integer,integer,integer,integer,integer,integer)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'anon',
    'api.create_search_episode_v1(uuid,integer,text,uuid,bytea,bytea,uuid,bytea,smallint,timestamptz,bytea,smallint,uuid,bytea,bytea,bytea,bytea,timestamptz,integer,text,bytea,timestamptz,text,text,text,text,text,text,text,date,date,text,boolean,boolean,date,integer,integer,integer,integer,integer,integer,integer,integer)',
    'EXECUTE'
  ),
  'only service role can call the B08 command'
);
select extensions.ok(
  has_function_privilege('service_role', 'api.get_search_episode_create_result_v1(uuid,uuid)', 'EXECUTE')
  and not has_function_privilege('anon', 'api.get_search_episode_create_result_v1(uuid,uuid)', 'EXECUTE'),
  'replay lookup is server-only'
);
select extensions.is((select count(*)::integer from catalog.roles where taxonomy_version = '2026.1'), 13, 'canonical roles are seeded');
select extensions.is((select count(*)::integer from catalog.sectors where id between 1001 and 1010), 10, 'canonical sectors are seeded');
select extensions.ok((
  select notice.content_sha256 = extensions.digest(
    'Göndererek; yanıtımda isim, e-posta veya serbest metin bulunmadan saklanmasını, giriş yaptıysam hesabımla ilişkilendirilmesini ve yalnız yeterli örneklem oluştuğunda toplu benchmark üretiminde kullanılmasını kabul ediyorum.',
    'sha256'
  )
  from privacy.notice_versions as notice
  where notice.id = 'b8000000-0000-4000-8300-000000000001'
), 'Turkish notice evidence matches the visible consent');
select extensions.ok((
  select notice.content_sha256 = extensions.digest(
    'By submitting, I agree that my response may be stored without names, email addresses, or free text, linked to my account if I am signed in, and used for aggregate benchmarks only once the minimum sample threshold is met.',
    'sha256'
  )
  from privacy.notice_versions as notice
  where notice.id = 'b8000000-0000-4000-8300-000000000002'
), 'English notice evidence matches the visible consent');

create temporary table b08_subject as
select * from api.resolve_anonymous_subject_v1(
  decode(repeat('81', 32), 'hex'), 1::smallint, null, null
);

select * from api.claim_idempotency_v1(
  'data_subject', decode(repeat('82', 32), 'hex'),
  'survey.search-benchmark.create', decode(repeat('83', 32), 'hex'),
  decode(repeat('84', 32), 'hex'), now() + interval '1 day'
);

create temporary table b08_created as
select * from api.create_search_episode_v1(
  (select data_subject_id from b08_subject),
  1, 'tr', 'b8000000-0000-4000-8300-000000000001',
  decode(repeat('85', 32), 'hex'), decode(repeat('84', 32), 'hex'), null,
  decode(repeat('86', 32), 'hex'), 1::smallint, now() + interval '30 days',
  decode(repeat('87', 32), 'hex'), 1::smallint,
  'b8000000-0000-4000-8800-000000000001',
  decode(repeat('82', 32), 'hex'), decode(repeat('83', 32), 'hex'),
  decode(repeat('84', 32), 'hex'), decode(repeat('88', 32), 'hex'),
  date_trunc('day', now()), 1, '2026-07-21.v1',
  decode(repeat('89', 32), 'hex'), date_trunc('day', now()) + interval '30 days',
  'frontend-developer', 'technology', 'senior', '5-8', 'turkiye',
  'full_time', 'hybrid', '2026-01-01', null, 'ongoing', true, true,
  current_date, 20, 10, 6, 5, 4, 2, 0, 0
);

select extensions.is((select count(*)::integer from b08_created), 1, 'command returns one durable result');
select extensions.is((select count(*)::integer from intake.survey_submissions where survey_type = 'search_benchmark'), 1, 'one T23 envelope is created');
select extensions.is((
  select count(*)::integer
  from intake.search_episodes as episode
  join catalog.roles as role on role.id = episode.role_id
  where role.slug = 'frontend-developer' and episode.sector_id = 1001
), 1, 'T24 stores canonical catalog identities');
select extensions.results_eq(
  $$select applications_count, human_responses_count, any_interviews_count, offers_count from intake.episode_funnel_totals$$,
  $$values (20, 10, 6, 2)$$,
  'T25 stores non-additive funnel totals'
);
select extensions.is((select count(*)::integer from privacy.consent_events where submission_id = (select submission_id from b08_created)), 1, 'consent evidence is linked atomically');
select extensions.is((select accepted_count from security.submission_quota_buckets where scope = 'survey.single-response'), 1, 'accepted quota is consumed atomically');
select extensions.results_eq(
  $$select status, resource_type, resource_id from security.api_idempotency_records where idempotency_key_hmac = decode(repeat('83', 32), 'hex')$$,
  $$values ('completed'::text, 'survey_submission'::text, (select submission_id from b08_created))$$,
  'idempotency result points at the durable submission'
);
select extensions.is((
  select count(*)::integer from api.get_search_episode_create_result_v1(
    (select submission_id from b08_created), (select data_subject_id from b08_subject)
  )
), 1, 'trusted owner can replay the create result');
select extensions.is((
  select count(*)::integer from api.get_search_episode_create_result_v1(
    (select submission_id from b08_created), gen_random_uuid()
  )
), 0, 'another subject receives no replay existence signal');
select extensions.ok(not exists (
  select 1 from information_schema.columns
  where table_schema = 'intake' and table_name = 'search_episodes' and column_name = 'data_subject_id'
), 'T24 derives ownership only through T23');
select extensions.ok(not exists (
  select 1 from information_schema.columns
  where table_schema = 'intake' and table_name in ('search_episodes', 'episode_funnel_totals')
    and column_name ~ '(free_text|free_note|email|name|raw_ip|user_agent)'
), 'B08 stores no identity, free text, or network identifiers');
select extensions.throws_ok(
  $$update intake.search_episodes set counts_are_estimated = false$$,
  '55000', 'search_benchmark_snapshot_is_immutable', 'T24 is immutable'
);
select extensions.throws_ok(
  $$delete from intake.episode_funnel_totals$$,
  '55000', 'search_benchmark_snapshot_is_immutable', 'T25 is immutable'
);
select extensions.throws_ok(
  $$select * from api.create_search_episode_v1(
    (select data_subject_id from b08_subject), 1, 'tr',
    'b8000000-0000-4000-8300-000000000001', decode(repeat('91', 32), 'hex'),
    decode(repeat('92', 32), 'hex'), null, decode(repeat('93', 32), 'hex'),
    1::smallint, now() + interval '30 days', decode(repeat('94', 32), 'hex'),
    1::smallint, gen_random_uuid(), decode(repeat('95', 32), 'hex'),
    decode(repeat('96', 32), 'hex'), decode(repeat('97', 32), 'hex'),
    decode(repeat('98', 32), 'hex'), date_trunc('day', now()), 1, 'v1',
    decode(repeat('99', 32), 'hex'), now() + interval '30 days',
    'frontend-developer', null, 'senior', '5-8', 'turkiye', null, null,
    '2026-01-01', '2026-02-01', 'offer_accepted', true, true, current_date,
    10, 5, 2, 2, 1, 1, 0, 0
  )$$,
  '22023', 'search_episode_status_count_mismatch', 'DB rejects status/count mismatch'
);
select extensions.is((select count(*)::integer from intake.survey_submissions where survey_type = 'search_benchmark'), 1, 'rejected command leaves no partial envelope');

select * from extensions.finish();
rollback;
