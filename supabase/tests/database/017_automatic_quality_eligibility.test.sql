begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(9);

select extensions.hasnt_schema(
  'moderation',
  'B11 does not introduce a human moderation schema'
);
select extensions.ok(
  position(
    'moderator' in (
      select pg_get_constraintdef(oid)
      from pg_constraint
      where conname = 'user_role_assignments_role_code_check'
    )
  ) = 0,
  'the moderator role cannot be assigned'
);
select extensions.ok(
  position(
    'moderator' in (
      select pg_get_constraintdef(oid)
      from pg_constraint
      where conname = 'user_role_assignments_grantor_role_check'
    )
  ) = 0,
  'moderator cannot be recorded as a grantor role'
);
select extensions.ok(
  position(
    'moderator' in (
      select pg_get_constraintdef(oid)
      from pg_constraint
      where conname = 'company_aliases_source_code_check'
    )
  ) = 0,
  'company aliases have no moderator source'
);
select extensions.has_index(
  'catalog',
  'company_aliases',
  'company_aliases_review_idx',
  'the company-alias review index has a neutral name'
);
select extensions.is(
  (
    select column_default
    from information_schema.columns
    where table_schema = 'intake'
      and table_name = 'survey_submissions'
      and column_name = 'quality_status'
  ),
  '''eligible''::text',
  'new submissions default to automatic eligibility'
);
select extensions.ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'intake.company_experiences'::regclass
      and conname = 'company_experiences_free_note_quality_check'
      and not convalidated
  ),
  'new free-text notes receive the stricter non-retroactive quality check'
);

create temporary table b11_subject as
select * from api.resolve_anonymous_subject_v1(
  decode(repeat('e1', 32), 'hex'), 1::smallint, null, null
);

insert into intake.survey_submissions (
  data_subject_id,
  survey_type,
  schema_version,
  locale,
  notice_version_id,
  payload_hash,
  command_fingerprint
)
select
  (select data_subject_id from b11_subject),
  'search_benchmark',
  1,
  notice.locale,
  notice.id,
  decode(repeat('e2', 32), 'hex'),
  decode(repeat('e3', 32), 'hex')
from privacy.notice_versions as notice
where notice.document_type = 'survey_notice'
order by notice.effective_from desc
limit 1;

select extensions.results_eq(
  $query$
    select lifecycle_status, quality_status
    from intake.survey_submissions
    where payload_hash = decode(repeat('e2', 32), 'hex')
  $query$,
  $$values ('accepted'::text, 'eligible'::text)$$,
  'a valid accepted contribution is immediately eligible'
);
select extensions.is(
  (
    select count(*)::integer
    from intake.survey_submissions
    where lifecycle_status = 'accepted'
      and quality_status = 'pending'
  ),
  0,
  'no accepted contribution remains in a manual-review queue'
);

select * from extensions.finish();

rollback;
