begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(27);

insert into catalog.sectors (
  id,
  slug,
  display_name,
  sort_order,
  is_active
)
overriding system value
values
  (1, 'technology', 'Technology', 10, true),
  (2, 'inactive-sector', 'Inactive Sector', 20, false),
  (3, 'finance', 'Finance', 30, true);

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
    '61000000-0000-4000-8000-000000000001',
    'engineering',
    'Engineering',
    '2026.1',
    10,
    true
  ),
  (
    '61000000-0000-4000-8000-000000000002',
    'product',
    'Product',
    '2026.1',
    20,
    true
  ),
  (
    '61000000-0000-4000-8000-000000000003',
    'inactive-family',
    'Inactive Family',
    '2026.1',
    30,
    false
  ),
  (
    '61000000-0000-4000-8000-000000000004',
    'future-family',
    'Future Family',
    '2027.1',
    10,
    true
  );

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
    '62000000-0000-4000-8000-000000000001',
    '61000000-0000-4000-8000-000000000001',
    'backend-developer',
    'Backend Developer',
    '2026.1',
    10,
    true
  ),
  (
    '62000000-0000-4000-8000-000000000002',
    '61000000-0000-4000-8000-000000000001',
    'frontend-developer',
    'Frontend Developer',
    '2026.1',
    20,
    true
  ),
  (
    '62000000-0000-4000-8000-000000000003',
    '61000000-0000-4000-8000-000000000001',
    'inactive-role',
    'Inactive Role',
    '2026.1',
    30,
    false
  ),
  (
    '62000000-0000-4000-8000-000000000004',
    '61000000-0000-4000-8000-000000000003',
    'orphaned-by-state',
    'Orphaned by State',
    '2026.1',
    10,
    true
  );

insert into catalog.companies (
  id,
  sector_id,
  slug,
  display_name,
  country_code,
  verification_status,
  publication_status
)
values
  (
    '63000000-0000-4000-8000-000000000001',
    1,
    'alpha',
    'Alpha',
    'TR',
    'verified',
    'published'
  ),
  (
    '63000000-0000-4000-8000-000000000002',
    1,
    'beta',
    'Beta',
    'TR',
    'verified',
    'published'
  ),
  (
    '63000000-0000-4000-8000-000000000003',
    1,
    'unverified-company',
    'Charlie Unverified',
    'TR',
    'unverified',
    'hidden'
  ),
  (
    '63000000-0000-4000-8000-000000000004',
    3,
    'hidden-company',
    'Charlie Hidden',
    'TR',
    'verified',
    'hidden'
  ),
  (
    '63000000-0000-4000-8000-000000000005',
    2,
    'inactive-sector-company',
    'Charlie Inactive Sector',
    'TR',
    'verified',
    'published'
  ),
  (
    '63000000-0000-4000-8000-000000000006',
    null,
    'delta',
    'Delta',
    null,
    'verified',
    'published'
  );

insert into catalog.company_aliases (
  id,
  company_id,
  normalized_alias,
  locale,
  country_code,
  source_code
)
values
  (
    '64000000-0000-4000-8000-000000000001',
    '63000000-0000-4000-8000-000000000001',
    'alpha labs',
    null,
    null,
    'moderator'
  ),
  (
    '64000000-0000-4000-8000-000000000002',
    '63000000-0000-4000-8000-000000000002',
    'pending beta',
    null,
    null,
    'user_input'
  ),
  (
    '64000000-0000-4000-8000-000000000003',
    '63000000-0000-4000-8000-000000000002',
    'rejected beta',
    null,
    null,
    'moderator'
  );

update catalog.company_aliases
set review_status = 'approved'
where id = '64000000-0000-4000-8000-000000000001';

update catalog.company_aliases
set review_status = 'rejected'
where id = '64000000-0000-4000-8000-000000000003';

insert into catalog.compensation_bands (
  id,
  currency_code,
  pay_period,
  gross_net,
  region_code,
  lower_bound,
  upper_bound,
  definition_version,
  valid_from,
  valid_to,
  is_active
)
values
  (
    '65000000-0000-4000-8000-000000000001',
    'TRY',
    'monthly',
    'net',
    'turkiye',
    0,
    100,
    '2026.1',
    current_date - 10,
    null,
    true
  ),
  (
    '65000000-0000-4000-8000-000000000002',
    'TRY',
    'monthly',
    'net',
    'turkiye',
    100,
    200,
    '2026.1',
    current_date - 10,
    null,
    true
  ),
  (
    '65000000-0000-4000-8000-000000000003',
    'TRY',
    'monthly',
    'net',
    'turkiye',
    200,
    300,
    '2026.1',
    current_date - 10,
    null,
    false
  ),
  (
    '65000000-0000-4000-8000-000000000004',
    'TRY',
    'monthly',
    'net',
    'turkiye',
    300,
    400,
    '2026.1',
    current_date + 10,
    null,
    true
  ),
  (
    '65000000-0000-4000-8000-000000000005',
    'TRY',
    'monthly',
    'net',
    'turkiye',
    400,
    500,
    '2026.1',
    current_date - 20,
    current_date - 1,
    true
  );

set local role anon;

select extensions.throws_ok(
  $query$
    select count(*) from catalog.sectors
  $query$,
  '42501',
  null,
  'anon cannot read raw catalog tables'
);

select extensions.throws_ok(
  $query$
    insert into catalog.sectors (slug, display_name)
    values ('injected', 'Injected')
  $query$,
  '42501',
  null,
  'anon cannot write raw catalog tables'
);

select extensions.results_eq(
  $query$
    select id
    from api.list_active_sectors_v1()
    where id in (1, 2, 3)
  $query$,
  array[1::smallint, 3::smallint],
  'the public sector projection returns only active rows in stable order'
);

select extensions.results_eq(
  $query$
    select id
    from api.list_active_role_families_v1(
      '2026.1',
      null,
      null,
      50
    )
  $query$,
  array[
    '61000000-0000-4000-8000-000000000001'::uuid,
    '61000000-0000-4000-8000-000000000002'::uuid
  ],
  'the family projection suppresses inactive and other taxonomy rows'
);

select extensions.results_eq(
  $query$
    select id
    from api.list_active_role_families_v1(
      '2026.1',
      10,
      '61000000-0000-4000-8000-000000000001',
      1
    )
  $query$,
  array['61000000-0000-4000-8000-000000000002'::uuid],
  'role-family pagination advances with the sort-order and ID keyset'
);

select extensions.results_eq(
  $query$
    select id
    from api.list_active_roles_v1(
      '61000000-0000-4000-8000-000000000001',
      '2026.1',
      null,
      null,
      50
    )
  $query$,
  array[
    '62000000-0000-4000-8000-000000000001'::uuid,
    '62000000-0000-4000-8000-000000000002'::uuid
  ],
  'the role projection returns only active roles under an active family'
);

select extensions.results_eq(
  $query$
    select id
    from api.list_active_roles_v1(
      '61000000-0000-4000-8000-000000000001',
      '2026.1',
      10,
      '62000000-0000-4000-8000-000000000001',
      1
    )
  $query$,
  array['62000000-0000-4000-8000-000000000002'::uuid],
  'role pagination advances with the sort-order and ID keyset'
);

select extensions.results_eq(
  $query$
    select display_name
    from api.list_published_companies_v1(
      null,
      null,
      null,
      null,
      50
    )
  $query$,
  array['Alpha'::text, 'Beta'::text, 'Delta'::text],
  'the public company projection suppresses hidden, unverified, and inactive-sector rows'
);

select extensions.is(
  (
    select count(*)::integer
    from api.list_published_companies_v1(
      null,
      null,
      null,
      null,
      50
    )
  ),
  3,
  'the public company projection exposes only eligible rows'
);

select extensions.results_eq(
  $query$
    select display_name
    from api.list_published_companies_v1(
      null,
      null,
      'Alpha',
      '63000000-0000-4000-8000-000000000001',
      2
    )
  $query$,
  array['Beta'::text, 'Delta'::text],
  'company pagination advances with the display-name and ID keyset'
);

select extensions.results_eq(
  $query$
    select display_name
    from api.list_published_companies_v1(
      1::smallint,
      'TR',
      null,
      null,
      50
    )
  $query$,
  array['Alpha'::text, 'Beta'::text],
  'company filters are allowlisted equality predicates'
);

select extensions.is(
  (
    select count(*)::integer
    from api.list_published_companies_v1(
      null,
      'TRASH',
      null,
      null,
      50
    )
  ),
  0,
  'an invalid country filter is not silently truncated'
);

select extensions.results_eq(
  $query$
    select id
    from api.list_active_compensation_bands_v1(
      'TRY',
      'monthly',
      'net',
      'turkiye',
      '2026.1',
      null,
      null,
      50
    )
  $query$,
  array[
    '65000000-0000-4000-8000-000000000001'::uuid,
    '65000000-0000-4000-8000-000000000002'::uuid
  ],
  'the compensation projection uses DB-owned current-date and active filters'
);

select extensions.results_eq(
  $query$
    select id
    from api.list_active_compensation_bands_v1(
      'TRY',
      'monthly',
      'net',
      'turkiye',
      '2026.1',
      '0.0000',
      '65000000-0000-4000-8000-000000000001',
      1
    )
  $query$,
  array['65000000-0000-4000-8000-000000000002'::uuid],
  'compensation pagination advances with the decimal lower bound and ID'
);

select extensions.is(
  (
    select count(*)::integer
    from api.list_active_compensation_bands_v1(
      'TRY',
      'monthly',
      'net',
      'turkiye',
      '2026.1',
      'not-a-decimal',
      '65000000-0000-4000-8000-000000000001',
      50
    )
  ),
  0,
  'an invalid compensation cursor fails closed without a numeric cast error'
);

select extensions.throws_ok(
  $query$
    select *
    from api.resolve_company_alias_v1(
      'alpha labs',
      null,
      null
    )
  $query$,
  '42501',
  null,
  'anon cannot execute the alias resolver'
);

reset role;
set local role authenticated;

select extensions.throws_ok(
  $query$
    select count(*) from catalog.companies
  $query$,
  '42501',
  null,
  'authenticated callers cannot read raw companies'
);

select extensions.throws_ok(
  $query$
    select *
    from api.resolve_company_alias_v1(
      'alpha labs',
      null,
      null
    )
  $query$,
  '42501',
  null,
  'authenticated callers cannot execute the alias resolver'
);

reset role;
set local role service_role;

select extensions.throws_ok(
  $query$
    select count(*) from catalog.company_aliases
  $query$,
  '42501',
  null,
  'service_role cannot enumerate raw aliases'
);

select extensions.results_eq(
  $query$
    select company_id
    from api.resolve_company_alias_v1(
      '  Alpha---Labs  ',
      null,
      null
    )
  $query$,
  array['63000000-0000-4000-8000-000000000001'::uuid],
  'the server resolver uses exact approved normalized aliases'
);

select extensions.results_eq(
  $query$
    select company_id
    from api.resolve_company_alias_v1(
      'Alpha Labs',
      'TR',
      'tr'
    )
  $query$,
  array['63000000-0000-4000-8000-000000000001'::uuid],
  'the resolver may fall back to one approved global alias'
);

select extensions.is(
  (
    select count(*)::integer
    from api.resolve_company_alias_v1(
      'pending beta',
      null,
      null
    )
  ),
  0,
  'a pending alias is indistinguishable from no match'
);

select extensions.is(
  (
    select count(*)::integer
    from api.resolve_company_alias_v1(
      'rejected beta',
      null,
      null
    )
  ),
  0,
  'a rejected alias is indistinguishable from no match'
);

select extensions.is(
  (
    select count(*)::integer
    from api.resolve_company_alias_v1(
      'no such company',
      null,
      null
    )
  ),
  0,
  'an unmatched alias returns no candidate metadata'
);

select extensions.is(
  (
    select count(*)::integer
    from api.resolve_company_alias_v1(
      repeat('.', 513),
      null,
      null
    )
  ),
  0,
  'an oversized alias fails closed before normalization'
);

select extensions.is(
  (
    select count(*)::integer
    from api.resolve_company_alias_v1(
      'alpha labs',
      'TRASH',
      null
    )
  ),
  0,
  'an invalid resolver context fails closed'
);

select extensions.is(
  (
    select count(*)::integer
    from api.resolve_company_alias_v1(
      '%__%',
      null,
      null
    )
  ),
  0,
  'wildcard punctuation is never interpreted as a fuzzy alias query'
);

reset role;

select * from extensions.finish();

rollback;
