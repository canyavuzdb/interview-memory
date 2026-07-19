begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(32);

insert into catalog.sectors (
  id,
  slug,
  display_name,
  sort_order
)
overriding system value
values
  (10, 'technology', 'Technology', 10),
  (20, 'finance', 'Finance', 20);

insert into catalog.role_families (
  id,
  slug,
  display_name,
  taxonomy_version,
  sort_order
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'engineering',
    'Engineering',
    '2026.1',
    10
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'engineering',
    'Engineering',
    '2027.1',
    10
  );

select extensions.results_eq(
  $query$
    select catalog.normalize_company_alias_v1(
      '  Acme, Yazılım A.Ş.  '
    )
  $query$,
  array['acme yazilim a s'::text],
  'V1 alias normalization is deterministic for case, punctuation, and Turkish characters'
);

select extensions.is(
  catalog.normalize_company_alias_v1(' -- '),
  null,
  'V1 alias normalization maps punctuation-only input to null'
);

select extensions.throws_ok(
  $query$
    insert into catalog.sectors (slug, display_name)
    values ('technology', 'Duplicate')
  $query$,
  '23505',
  null,
  'sector slugs are unique'
);

select extensions.throws_ok(
  $query$
    insert into catalog.sectors (slug, display_name)
    values ('Invalid Slug', 'Invalid')
  $query$,
  '23514',
  null,
  'sector slugs use lowercase kebab format'
);

select extensions.lives_ok(
  $query$
    insert into catalog.roles (
      id,
      role_family_id,
      slug,
      display_name,
      taxonomy_version,
      sort_order
    )
    values (
      '20000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000001',
      'software-engineer',
      'Software Engineer',
      '2026.1',
      10
    )
  $query$,
  'a role can reference a family in the same taxonomy'
);

select extensions.throws_ok(
  $query$
    insert into catalog.roles (
      role_family_id,
      slug,
      display_name,
      taxonomy_version
    )
    values (
      '10000000-0000-4000-8000-000000000001',
      'future-role',
      'Future Role',
      '2027.1'
    )
  $query$,
  '23503',
  null,
  'a role cannot cross taxonomy versions through its family FK'
);

select extensions.throws_ok(
  $query$
    insert into catalog.roles (
      role_family_id,
      slug,
      display_name,
      taxonomy_version
    )
    values (
      '10000000-0000-4000-8000-000000000001',
      'software-engineer',
      'Duplicate Software Engineer',
      '2026.1'
    )
  $query$,
  '23505',
  null,
  'role slugs are unique inside one family and taxonomy'
);

select extensions.throws_ok(
  $query$
    delete from catalog.role_families
    where id = '10000000-0000-4000-8000-000000000001'
  $query$,
  '23503',
  null,
  'a referenced role family cannot be deleted'
);

select extensions.throws_ok(
  $query$
    insert into catalog.companies (
      slug,
      display_name,
      verification_status,
      publication_status
    )
    values (
      'unverified-public',
      'Unverified Public',
      'unverified',
      'published'
    )
  $query$,
  '23514',
  null,
  'an unverified company cannot enter the published state'
);

select extensions.throws_ok(
  $query$
    insert into catalog.companies (
      slug,
      display_name,
      normalized_domain
    )
    values (
      'invalid-domain',
      'Invalid Domain',
      'https://example.test/path'
    )
  $query$,
  '23514',
  null,
  'company domains reject schemes and paths'
);

insert into catalog.companies (
  id,
  sector_id,
  slug,
  legal_name,
  display_name,
  normalized_domain,
  country_code,
  verification_status,
  publication_status
)
values
  (
    '30000000-0000-4000-8000-000000000001',
    10,
    'acme',
    'Acme Incorporated',
    'Acme',
    'acme.example',
    'TR',
    'verified',
    'published'
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    20,
    'globex',
    null,
    'Globex',
    'acme.example',
    'TR',
    'unverified',
    'hidden'
  );

select extensions.throws_ok(
  $query$
    insert into catalog.companies (
      slug,
      display_name,
      normalized_domain,
      verification_status
    )
    values (
      'verified-domain-conflict',
      'Verified Domain Conflict',
      'acme.example',
      'verified'
    )
  $query$,
  '23505',
  null,
  'verified company domains are unique'
);

select extensions.lives_ok(
  $query$
    insert into catalog.companies (
      slug,
      display_name,
      normalized_domain,
      verification_status
    )
    values (
      'unverified-domain-candidate',
      'Unverified Domain Candidate',
      'acme.example',
      'unverified'
    )
  $query$,
  'an unverified domain candidate does not claim verified uniqueness'
);

select extensions.throws_ok(
  $query$
    insert into catalog.companies (
      slug,
      display_name,
      external_case_ref
    )
    values (
      'partial-case-state',
      'Partial Case State',
      'case-opaque-1'
    )
  $query$,
  '23514',
  null,
  'external case projection fields are all null or all present'
);

select extensions.throws_ok(
  $query$
    delete from catalog.sectors where id = 10
  $query$,
  '23503',
  null,
  'a sector referenced by a company cannot be deleted'
);

select extensions.results_eq(
  $query$
    update catalog.companies
    set display_name = 'Acme Türkiye',
        version = 999
    where id = '30000000-0000-4000-8000-000000000001'
    returning version
  $query$,
  array[2::bigint],
  'company updates increment the database-owned optimistic version'
);

select extensions.throws_ok(
  $query$
    update catalog.companies
    set slug = 'acme-renamed'
    where id = '30000000-0000-4000-8000-000000000001'
  $query$,
  '55000',
  'company_identity_is_immutable',
  'a stable company slug cannot be updated in place'
);

select extensions.throws_ok(
  $query$
    insert into catalog.company_aliases (
      company_id,
      normalized_alias,
      source_code
    )
    values (
      '30000000-0000-4000-8000-000000000001',
      'Acme, Inc.',
      'moderator'
    )
  $query$,
  '23514',
  null,
  'stored aliases must already use the frozen normalization'
);

select extensions.throws_ok(
  $query$
    insert into catalog.company_aliases (
      company_id,
      normalized_alias,
      source_code,
      review_status,
      reviewed_at
    )
    values (
      '30000000-0000-4000-8000-000000000001',
      'pending reviewed',
      'moderator',
      'pending',
      now()
    )
  $query$,
  '55000',
  'company_alias_initial_state_invalid',
  'a pending alias cannot arrive pre-reviewed'
);

select extensions.throws_ok(
  $query$
    insert into catalog.company_aliases (
      company_id,
      normalized_alias,
      source_code,
      review_status
    )
    values (
      '30000000-0000-4000-8000-000000000001',
      'direct approved',
      'moderator',
      'approved'
    )
  $query$,
  '55000',
  'company_alias_initial_state_invalid',
  'aliases cannot bypass the pending moderation state'
);

insert into catalog.company_aliases (
  id,
  company_id,
  normalized_alias,
  source_code
)
values (
  '40000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001',
  'acme',
  'moderator'
);

update catalog.company_aliases
set review_status = 'approved'
where id = '40000000-0000-4000-8000-000000000001';

insert into catalog.company_aliases (
  id,
  company_id,
  normalized_alias,
  source_code
)
values (
  '40000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000002',
  'acme',
  'moderator'
);

select extensions.throws_ok(
  $query$
    update catalog.company_aliases
    set review_status = 'approved'
    where id = '40000000-0000-4000-8000-000000000002'
  $query$,
  '23505',
  null,
  'only one approved company may own an alias context'
);

select extensions.lives_ok(
  $query$
    insert into catalog.company_aliases (
      id,
      company_id,
      normalized_alias,
      country_code,
      source_code
    )
    values (
      '40000000-0000-4000-8000-000000000003',
      '30000000-0000-4000-8000-000000000002',
      'acme',
      'US',
      'moderator'
    );

    update catalog.company_aliases
    set review_status = 'approved'
    where id = '40000000-0000-4000-8000-000000000003';
  $query$,
  'the same normalized alias may have a different approved market context'
);

insert into catalog.company_aliases (
  id,
  company_id,
  normalized_alias,
  source_code
)
values (
  '40000000-0000-4000-8000-000000000004',
  '30000000-0000-4000-8000-000000000002',
  'globex',
  'moderator'
);

select extensions.lives_ok(
  $query$
    update catalog.company_aliases
    set review_status = 'approved',
        reviewed_at = null
    where id = '40000000-0000-4000-8000-000000000004'
  $query$,
  'a pending alias can be approved with a database-owned review time'
);

select extensions.throws_ok(
  $query$
    update catalog.company_aliases
    set review_status = 'rejected'
    where id = '40000000-0000-4000-8000-000000000001'
  $query$,
  '55000',
  'company_alias_review_is_terminal',
  'an approved alias review is terminal'
);

insert into catalog.company_aliases (
  id,
  company_id,
  normalized_alias,
  source_code
)
values (
  '40000000-0000-4000-8000-000000000005',
  '30000000-0000-4000-8000-000000000001',
  'identity test',
  'moderator'
);

select extensions.throws_ok(
  $query$
    update catalog.company_aliases
    set company_id = '30000000-0000-4000-8000-000000000002'
    where id = '40000000-0000-4000-8000-000000000005'
  $query$,
  '55000',
  'company_alias_identity_is_immutable',
  'an alias cannot be silently reassigned to another company'
);

select extensions.throws_ok(
  $query$
    delete from catalog.companies
    where id = '30000000-0000-4000-8000-000000000001'
  $query$,
  '23503',
  null,
  'a company referenced by an alias cannot be deleted'
);

select extensions.throws_ok(
  $query$
    insert into catalog.compensation_bands (
      currency_code,
      pay_period,
      gross_net,
      region_code,
      lower_bound,
      upper_bound,
      definition_version,
      valid_from
    )
    values (
      'TRY',
      'monthly',
      'net',
      'turkiye',
      20000,
      10000,
      '2026.1',
      '2026-01-01'
    )
  $query$,
  '23514',
  null,
  'compensation bounds must be non-negative and increasing'
);

insert into catalog.compensation_bands (
  id,
  currency_code,
  pay_period,
  gross_net,
  region_code,
  lower_bound,
  upper_bound,
  definition_version,
  valid_from
)
values (
  '50000000-0000-4000-8000-000000000001',
  'TRY',
  'monthly',
  'net',
  'turkiye',
  0,
  20000,
  '2026.1',
  '2026-01-01'
);

select extensions.throws_ok(
  $query$
    insert into catalog.compensation_bands (
      currency_code,
      pay_period,
      gross_net,
      region_code,
      lower_bound,
      upper_bound,
      definition_version,
      valid_from
    )
    values (
      'TRY',
      'monthly',
      'net',
      'turkiye',
      10000,
      30000,
      '2026.1',
      '2026-01-01'
    )
  $query$,
  '23P01',
  null,
  'amount and validity overlap is rejected in one band definition'
);

select extensions.lives_ok(
  $query$
    insert into catalog.compensation_bands (
      currency_code,
      pay_period,
      gross_net,
      region_code,
      lower_bound,
      upper_bound,
      definition_version,
      valid_from
    )
    values (
      'TRY',
      'monthly',
      'net',
      'turkiye',
      20000,
      30000,
      '2026.1',
      '2026-01-01'
    )
  $query$,
  'touching half-open compensation ranges are valid'
);

select extensions.lives_ok(
  $query$
    insert into catalog.compensation_bands (
      currency_code,
      pay_period,
      gross_net,
      region_code,
      lower_bound,
      upper_bound,
      definition_version,
      valid_from,
      valid_to
    )
    values (
      'TRY',
      'monthly',
      'net',
      'turkiye',
      0,
      20000,
      '2026.1',
      '2025-01-01',
      '2026-01-01'
    )
  $query$,
  'the same amount range is valid in a non-overlapping half-open date period'
);

select extensions.throws_ok(
  $query$
    insert into catalog.compensation_bands (
      currency_code,
      pay_period,
      gross_net,
      region_code,
      lower_bound,
      upper_bound,
      definition_version,
      valid_from,
      valid_to
    )
    values (
      'TRY',
      'annual',
      'gross',
      'turkiye',
      0,
      100000,
      '2026.1',
      '2026-01-01',
      '2026-01-01'
    )
  $query$,
  '23514',
  null,
  'compensation validity must have a positive half-open duration'
);

select extensions.throws_ok(
  $query$
    insert into catalog.compensation_bands (
      currency_code,
      pay_period,
      gross_net,
      region_code,
      lower_bound,
      upper_bound,
      definition_version,
      valid_from,
      is_active
    )
    values (
      'TRY',
      'monthly',
      'net',
      'turkiye',
      5000,
      10000,
      '2026.1',
      '2026-01-01',
      false
    )
  $query$,
  '23P01',
  null,
  'deactivation does not permit overlapping historical semantics in one definition'
);

select extensions.throws_ok(
  $query$
    insert into catalog.companies (
      slug,
      display_name,
      country_code
    )
    values (
      'lowercase-country',
      'Lowercase Country',
      'tr'
    )
  $query$,
  '23514',
  null,
  'company country codes are uppercase ISO alpha-2 values'
);

select * from extensions.finish();

rollback;
