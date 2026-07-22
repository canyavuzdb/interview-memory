begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(15);

select extensions.has_table('intake', 'company_experiences', 'B09 snapshot table exists');
select extensions.ok((
  select relation.relrowsecurity and relation.relforcerowsecurity
  from pg_class as relation
  join pg_namespace as namespace on namespace.oid = relation.relnamespace
  where namespace.nspname = 'intake'
    and relation.relname = 'company_experiences'
), 'B09 snapshots force RLS');
select extensions.ok(
  not has_table_privilege('anon', 'intake.company_experiences', 'SELECT')
  and not has_table_privilege('authenticated', 'intake.company_experiences', 'SELECT')
  and not has_table_privilege('service_role', 'intake.company_experiences', 'SELECT'),
  'application roles cannot read raw company experience text'
);
select extensions.ok(
  has_function_privilege(
    'service_role',
    'api.create_company_experience_v1(uuid,integer,text,uuid,bytea,bytea,uuid,bytea,smallint,timestamptz,bytea,smallint,uuid,bytea,bytea,bytea,bytea,timestamptz,integer,timestamptz,timestamptz,integer,timestamptz,text,bytea,text,text,smallint,text,smallint,smallint,boolean,text,smallint,boolean,text[],text,smallint,smallint,smallint,text,text)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'anon',
    'api.create_company_experience_v1(uuid,integer,text,uuid,bytea,bytea,uuid,bytea,smallint,timestamptz,bytea,smallint,uuid,bytea,bytea,bytea,bytea,timestamptz,integer,timestamptz,timestamptz,integer,timestamptz,text,bytea,text,text,smallint,text,smallint,smallint,boolean,text,smallint,boolean,text[],text,smallint,smallint,smallint,text,text)',
    'EXECUTE'
  ),
  'only service role can execute the B09 command'
);
select extensions.ok(
  has_function_privilege('service_role', 'api.get_company_experience_create_result_v1(uuid,uuid)', 'EXECUTE')
  and not has_function_privilege('anon', 'api.get_company_experience_create_result_v1(uuid,uuid)', 'EXECUTE'),
  'B09 replay lookup is server-only'
);
select extensions.ok((
  select notice.content_sha256 = extensions.digest(
    'Göndererek; yanıtımın anonim analiz ve moderasyon amacıyla özel olarak saklanmasını, isteğe bağlı notlarda tanımlayıcı bilgi paylaşmamam gerektiğini, giriş yaptıysam hesabımla ilişkilendirilmesini ve yalnız moderasyon ile yeterli örneklem sonrasında toplu sonuçlarda kullanılmasını kabul ediyorum.',
    'sha256'
  )
  from privacy.notice_versions as notice
  where notice.id = 'b9000000-0000-4000-8300-000000000001'
), 'current Turkish notice matches the visible B09 consent');

insert into catalog.companies (
  id, slug, display_name, verification_status, publication_status
) values (
  'b9000000-0000-4000-8100-000000000001', 'example-corp',
  'Example Corp', 'unverified', 'hidden'
);
insert into catalog.company_aliases (
  company_id, normalized_alias, locale, source_code
) values (
  'b9000000-0000-4000-8100-000000000001', 'example corp', 'tr',
  'moderator'
);
update catalog.company_aliases
set review_status = 'approved'
where company_id = 'b9000000-0000-4000-8100-000000000001';

create temporary table b09_subject as
select * from api.resolve_anonymous_subject_v1(
  decode(repeat('a1', 32), 'hex'), 1::smallint, null, null
);

select * from api.claim_idempotency_v1(
  'data_subject', decode(repeat('a2', 32), 'hex'),
  'survey.company-experience.create', decode(repeat('a3', 32), 'hex'),
  decode(repeat('a4', 32), 'hex'), now() + interval '1 day'
);

create temporary table b09_created as
select * from api.create_company_experience_v1(
  (select data_subject_id from b09_subject), 1, 'tr',
  'b9000000-0000-4000-8300-000000000001',
  decode(repeat('a5', 32), 'hex'), decode(repeat('a4', 32), 'hex'), null,
  decode(repeat('a6', 32), 'hex'), 1::smallint, now() + interval '30 days',
  decode(repeat('a7', 32), 'hex'), 1::smallint,
  'b9000000-0000-4000-8800-000000000001',
  decode(repeat('a2', 32), 'hex'), decode(repeat('a3', 32), 'hex'),
  decode(repeat('a4', 32), 'hex'), decode(repeat('a8', 32), 'hex'),
  date_trunc('day', now()), 3, date_trunc('day', now()) + interval '1 day',
  date_trunc('month', now()), 10, date_trunc('month', now()) + interval '30 days',
  '2026-07-21.v1', decode(repeat('a9', 32), 'hex'),
  'Example Corp', 'Frontend Developer', 2026::smallint,
  'yes', 7::smallint, 10::smallint, false, null, 4::smallint,
  true, array['age'], 'yes_detailed', 4::smallint, 3::smallint,
  4::smallint, 'unsure', 'No identifying details'
);

select extensions.is((select count(*)::integer from b09_created), 1, 'B09 command returns one durable result');
select extensions.is((
  select count(*)::integer from intake.survey_submissions
  where survey_type = 'company_experience'
), 1, 'one company-experience envelope is created');
select extensions.results_eq(
  $$select company_id, company_name, applied_role, process_year::integer from intake.company_experiences$$,
  $$values ('b9000000-0000-4000-8100-000000000001'::uuid, 'Example Corp'::text, 'Frontend Developer'::text, 2026)$$,
  'approved private alias links the canonical company without publishing input'
);
select extensions.is((
  select count(*)::integer from privacy.consent_events
  where submission_id = (select submission_id from b09_created)
), 1, 'consent evidence is linked atomically');
select extensions.results_eq(
  $$select window_kind, accepted_count from security.submission_quota_buckets where scope = 'experience.repeatable' order by window_kind$$,
  $$values ('accepted_24h'::text, 1), ('accepted_30d'::text, 1)$$,
  'both repeatable-experience quota windows are consumed atomically'
);
select extensions.results_eq(
  $$select status, resource_type, resource_id from security.api_idempotency_records where idempotency_key_hmac = decode(repeat('a3', 32), 'hex')$$,
  $$values ('completed'::text, 'survey_submission'::text, (select submission_id from b09_created))$$,
  'idempotency result points to the durable envelope'
);
select extensions.is((
  select count(*)::integer from api.get_company_experience_create_result_v1(
    (select submission_id from b09_created),
    (select data_subject_id from b09_subject)
  )
), 1, 'trusted owner can replay the B09 result');
select extensions.is((
  select count(*)::integer from api.get_company_experience_create_result_v1(
    (select submission_id from b09_created), gen_random_uuid()
  )
), 0, 'another subject receives no replay existence signal');
select extensions.throws_ok(
  $$update intake.company_experiences set free_note = 'changed'$$,
  '55000', 'company_experience_snapshot_is_immutable',
  'company experience snapshots are immutable'
);

select * from extensions.finish();
rollback;
