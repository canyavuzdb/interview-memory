begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(24);

select extensions.has_schema('moderation', 'B11 moderation schema exists');
select extensions.has_table(
  'moderation',
  'submission_quality_signals',
  'B11 quality signals exist'
);
select extensions.has_table(
  'moderation',
  'submission_review_decisions',
  'B11 decision audit exists'
);
select extensions.has_table(
  'moderation',
  'submission_company_resolutions',
  'B11 canonical company resolutions exist'
);
select extensions.ok((
  select bool_and(relation.relrowsecurity and relation.relforcerowsecurity)
  from pg_class as relation
  join pg_namespace as namespace on namespace.oid = relation.relnamespace
  where namespace.nspname = 'moderation'
    and relation.relkind = 'r'
), 'all B11 private tables force RLS');
select extensions.ok(
  has_function_privilege(
    'service_role',
    'api.list_moderation_queue_v1(uuid,text,text,integer,timestamptz,uuid)',
    'EXECUTE'
  )
  and has_function_privilege(
    'service_role',
    'api.decide_submission_quality_v1(uuid,uuid,uuid,text,text,text,uuid)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'authenticated',
    'api.list_moderation_queue_v1(uuid,text,text,integer,timestamptz,uuid)',
    'EXECUTE'
  ),
  'moderation RPCs are server-only'
);
select extensions.ok(
  has_function_privilege(
    'service_role',
    'api.list_moderation_companies_v1(uuid,text,integer)',
    'EXECUTE'
  )
  and has_function_privilege(
    'service_role',
    'api.create_moderation_company_v1(uuid,uuid,text,text,character)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'authenticated',
    'api.create_moderation_company_v1(uuid,uuid,text,text,character)',
    'EXECUTE'
  ),
  'canonical company moderation APIs are server-only'
);

insert into auth.users (id, email, created_at, updated_at)
values
  (
    'b1100000-0000-4000-8100-000000000001',
    'moderator@example.test',
    now(),
    now()
  ),
  (
    'b1100000-0000-4000-8100-000000000002',
    'contributor@example.test',
    now(),
    now()
  ),
  (
    'b1100000-0000-4000-8100-000000000003',
    'ordinary@example.test',
    now(),
    now()
  );

insert into "authorization".user_role_assignments (
  user_id,
  role_code,
  granted_by_user_id,
  subject_audit_principal,
  grantor_role_snapshot,
  reason_code
) values (
  'b1100000-0000-4000-8100-000000000001',
  'moderator',
  null,
  decode(repeat('11', 32), 'hex'),
  'bootstrap_operator',
  'initial_bootstrap'
), (
  'b1100000-0000-4000-8100-000000000002',
  'moderator',
  null,
  decode(repeat('12', 32), 'hex'),
  'bootstrap_operator',
  'initial_bootstrap'
);

insert into catalog.companies (
  id,
  slug,
  display_name,
  verification_status,
  publication_status
) values (
  'b1100000-0000-4000-8200-000000000001',
  'b11-example',
  'B11 Example',
  'unverified',
  'hidden'
);

select extensions.results_eq(
  $sql$
    select display_name
    from api.list_moderation_companies_v1(
      'b1100000-0000-4000-8100-000000000001',
      'B11 Example',
      20
    )
  $sql$,
  $$values ('B11 Example'::text)$$,
  'moderator can search the private canonical company catalog'
);
create temporary table b11_new_company as
select * from api.create_moderation_company_v1(
  'b1100000-0000-4000-8100-000000000001',
  'b1100000-0000-4000-8200-000000000002',
  'new-company',
  'New Company',
  'TR'
);
select extensions.results_eq(
  $$select slug, publication_status from b11_new_company$$,
  $$values ('new-company'::text, 'hidden'::text)$$,
  'moderator creates a private unverified canonical company'
);
select extensions.is(
  (
    select count(*)::integer
    from api.create_moderation_company_v1(
      'b1100000-0000-4000-8100-000000000001',
      'b1100000-0000-4000-8200-000000000002',
      'new-company',
      'New Company',
      'TR'
    )
  ),
  1,
  'same canonical company command safely replays'
);
select extensions.throws_ok(
  $sql$
    select * from api.create_moderation_company_v1(
      'b1100000-0000-4000-8100-000000000001',
      'b1100000-0000-4000-8200-000000000002',
      'another-company',
      'Another Company',
      'TR'
    )
  $sql$,
  '23505',
  'moderation_company_id_conflict',
  'company command id cannot be reused with another payload'
);

insert into intake.survey_submissions (
  id,
  receipt_id,
  data_subject_id,
  survey_type,
  schema_version,
  locale,
  notice_version_id,
  payload_hash,
  command_fingerprint
) values (
  'b1100000-0000-4000-8300-000000000001',
  'b1100000-0000-4000-8400-000000000001',
  (
    select subject.id
    from core.data_subjects as subject
    where subject.auth_user_id =
      'b1100000-0000-4000-8100-000000000002'
  ),
  'company_experience',
  1,
  'tr',
  'b9000000-0000-4000-8300-000000000001',
  decode(repeat('13', 32), 'hex'),
  decode(repeat('14', 32), 'hex')
);

insert into intake.company_experiences (
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
  free_note
) values (
  'b1100000-0000-4000-8300-000000000001',
  null,
  'Unresolved Company',
  'Backend Developer',
  2026,
  'yes',
  7,
  10,
  false,
  null,
  4,
  false,
  array[]::text[],
  'yes_generic',
  3,
  4,
  4,
  'yes',
  'Bana test@example.com ve https://example.com üzerinden ulaştılar.'
);

select extensions.is(
  (
    select count(*)::integer
    from moderation.submission_quality_signals
    where submission_id = 'b1100000-0000-4000-8300-000000000001'
  ),
  2,
  'contact details and links create review signals'
);
select extensions.throws_ok(
  $sql$
    select * from api.list_moderation_queue_v1(
      'b1100000-0000-4000-8100-000000000003',
      'pending', null, 25, null, null
    )
  $sql$,
  '42501',
  'moderator_role_required',
  'ordinary accounts cannot inspect the queue'
);
select extensions.results_eq(
  $sql$
    select company_name, quality_signals
    from api.list_moderation_queue_v1(
      'b1100000-0000-4000-8100-000000000001',
      'pending', 'company_experience', 25, null, null
    )
  $sql$,
  $expected$
    values (
      'Unresolved Company'::text,
      array['contact_information_candidate', 'external_link_candidate']::text[]
    )
  $expected$,
  'moderator receives the bounded queue projection and signals'
);
select extensions.throws_ok(
  $sql$
    select * from api.decide_submission_quality_v1(
      'b1100000-0000-4000-8100-000000000002',
      'b1100000-0000-4000-8300-000000000001',
      'b1100000-0000-4000-8500-000000000001',
      'excluded', 'personal_data', null, null
    )
  $sql$,
  '42501',
  'moderation_self_review_forbidden',
  'moderators cannot review their own contribution'
);
select extensions.throws_ok(
  $sql$
    select * from api.decide_submission_quality_v1(
      'b1100000-0000-4000-8100-000000000001',
      'b1100000-0000-4000-8300-000000000001',
      'b1100000-0000-4000-8500-000000000002',
      'eligible', 'quality_review_passed', null, null
    )
  $sql$,
  '22023',
  'company_resolution_required',
  'unresolved company contributions cannot become eligible'
);

create temporary table b11_decision as
select * from api.decide_submission_quality_v1(
  'b1100000-0000-4000-8100-000000000001',
  'b1100000-0000-4000-8300-000000000001',
  'b1100000-0000-4000-8500-000000000003',
  'eligible',
  'quality_review_passed',
  'İletişim bilgisi yalnız şirketin verdiği iletişim kanalını anlatıyor.',
  'b1100000-0000-4000-8200-000000000001'
);

select extensions.results_eq(
  $$select quality_status from b11_decision$$,
  $$values ('eligible'::text)$$,
  'moderator decision returns the new quality status'
);
select extensions.results_eq(
  $sql$
    select quality_status
    from intake.survey_submissions
    where id = 'b1100000-0000-4000-8300-000000000001'
  $sql$,
  $$values ('eligible'::text)$$,
  'quality gate is updated atomically'
);
select extensions.is(
  (
    select count(*)::integer
    from moderation.submission_review_decisions
    where submission_id = 'b1100000-0000-4000-8300-000000000001'
  ),
  1,
  'human decision is audited once'
);
select extensions.results_eq(
  $sql$
    select company_id
    from moderation.submission_company_resolutions
    where submission_id = 'b1100000-0000-4000-8300-000000000001'
  $sql$,
  $$values ('b1100000-0000-4000-8200-000000000001'::uuid)$$,
  'canonical company resolution is stored separately'
);
select extensions.results_eq(
  $sql$
    select company_id, normalized_alias, review_status
    from catalog.company_aliases
    where normalized_alias = 'unresolved company'
  $sql$,
  $expected$
    values (
      'b1100000-0000-4000-8200-000000000001'::uuid,
      'unresolved company'::text,
      'approved'::text
    )
  $expected$,
  'approved moderation resolution teaches the canonical company alias'
);
select extensions.is(
  (
    select count(*)::integer
    from api.decide_submission_quality_v1(
      'b1100000-0000-4000-8100-000000000001',
      'b1100000-0000-4000-8300-000000000001',
      'b1100000-0000-4000-8500-000000000003',
      'eligible',
      'quality_review_passed',
      'İletişim bilgisi yalnız şirketin verdiği iletişim kanalını anlatıyor.',
      'b1100000-0000-4000-8200-000000000001'
    )
  ),
  1,
  'same decision id safely replays'
);
select extensions.throws_ok(
  $sql$
    select * from api.decide_submission_quality_v1(
      'b1100000-0000-4000-8100-000000000001',
      'b1100000-0000-4000-8300-000000000001',
      'b1100000-0000-4000-8500-000000000003',
      'excluded', 'spam', null, null
    )
  $sql$,
  '23505',
  'moderation_decision_id_conflict',
  'decision id cannot be reused with another command'
);
select extensions.throws_ok(
  $sql$
    update moderation.submission_review_decisions
    set reviewer_note = 'changed'
  $sql$,
  '55000',
  'moderation_audit_is_immutable',
  'moderation audit rows are immutable'
);

select * from extensions.finish();
rollback;
