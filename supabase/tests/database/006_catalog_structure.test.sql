begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(50);

select extensions.has_schema('catalog', 'private catalog schema exists');

select extensions.has_table(
  'catalog',
  'sectors',
  'T10 sectors table exists'
);
select extensions.has_table(
  'catalog',
  'role_families',
  'T11 role families table exists'
);
select extensions.has_table(
  'catalog',
  'roles',
  'T12 roles table exists'
);
select extensions.has_table(
  'catalog',
  'companies',
  'T13 companies table exists'
);
select extensions.has_table(
  'catalog',
  'company_aliases',
  'T14 company aliases table exists'
);
select extensions.has_table(
  'catalog',
  'compensation_bands',
  'T15 compensation bands table exists'
);

select extensions.is(
  (
    select count(*)::integer
    from information_schema.columns
    where table_schema = 'catalog'
      and table_name = 'sectors'
  ),
  5,
  'T10 has exactly 5 columns'
);
select extensions.is(
  (
    select count(*)::integer
    from information_schema.columns
    where table_schema = 'catalog'
      and table_name = 'role_families'
  ),
  7,
  'T11 has exactly 7 columns'
);
select extensions.is(
  (
    select count(*)::integer
    from information_schema.columns
    where table_schema = 'catalog'
      and table_name = 'roles'
  ),
  8,
  'T12 has exactly 8 columns'
);
select extensions.is(
  (
    select count(*)::integer
    from information_schema.columns
    where table_schema = 'catalog'
      and table_name = 'companies'
  ),
  15,
  'T13 has exactly 15 columns'
);
select extensions.is(
  (
    select count(*)::integer
    from information_schema.columns
    where table_schema = 'catalog'
      and table_name = 'company_aliases'
  ),
  9,
  'T14 has exactly 9 columns'
);
select extensions.is(
  (
    select count(*)::integer
    from information_schema.columns
    where table_schema = 'catalog'
      and table_name = 'compensation_bands'
  ),
  12,
  'T15 has exactly 12 columns'
);

select extensions.is(
  (
    select count(*)::integer
    from pg_class as relation
    join pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'catalog'
      and relation.relkind = 'r'
      and relation.relrowsecurity
  ),
  6,
  'RLS is enabled on all six catalog tables'
);

select extensions.is(
  (
    select count(*)::integer
    from pg_class as relation
    join pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'catalog'
      and relation.relkind = 'r'
      and relation.relforcerowsecurity
  ),
  6,
  'RLS is forced on all six catalog tables'
);

select extensions.is(
  (
    select count(*)::integer
    from information_schema.table_privileges
    where table_schema = 'catalog'
      and grantee in (
        'PUBLIC',
        'anon',
        'authenticated',
        'service_role'
      )
  ),
  0,
  'API roles have no raw catalog table privileges'
);

select extensions.is(
  (
    select count(*)::integer
    from information_schema.usage_privileges
    where object_schema = 'catalog'
      and object_type = 'SEQUENCE'
      and grantee in (
        'PUBLIC',
        'anon',
        'authenticated',
        'service_role'
      )
  ),
  0,
  'API roles have no catalog sequence privileges'
);

select extensions.ok(
  not has_schema_privilege('anon', 'catalog', 'USAGE'),
  'anon has no catalog schema usage'
);
select extensions.ok(
  not has_schema_privilege('authenticated', 'catalog', 'USAGE'),
  'authenticated has no catalog schema usage'
);
select extensions.ok(
  not has_schema_privilege('service_role', 'catalog', 'USAGE'),
  'service_role has no catalog schema usage'
);

select extensions.is(
  (
    select count(*)::integer
    from pg_publication_tables
    where schemaname = 'catalog'
  ),
  0,
  'catalog tables are absent from Realtime publications'
);

select extensions.is(
  (
    select count(*)::integer
    from pg_constraint as constraint_record
    join pg_class as relation
      on relation.oid = constraint_record.conrelid
    join pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'catalog'
      and constraint_record.contype = 'p'
  ),
  6,
  'all six catalog tables have a primary key'
);

select extensions.is(
  (
    select count(*)::integer
    from pg_constraint as constraint_record
    join pg_class as relation
      on relation.oid = constraint_record.conrelid
    join pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'catalog'
      and relation.relname = 'roles'
      and constraint_record.contype = 'f'
      and pg_get_constraintdef(constraint_record.oid) like
        'FOREIGN KEY (role_family_id, taxonomy_version)%ON DELETE RESTRICT'
  ),
  1,
  'roles enforce parent family and taxonomy version with restrict delete'
);

select extensions.is(
  (
    select count(*)::integer
    from pg_constraint as constraint_record
    join pg_class as relation
      on relation.oid = constraint_record.conrelid
    join pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'catalog'
      and relation.relname = 'companies'
      and constraint_record.contype = 'f'
      and pg_get_constraintdef(constraint_record.oid) like
        'FOREIGN KEY (sector_id)%ON DELETE RESTRICT'
  ),
  1,
  'companies restrict deletion of referenced sectors'
);

select extensions.is(
  (
    select count(*)::integer
    from pg_constraint as constraint_record
    join pg_class as relation
      on relation.oid = constraint_record.conrelid
    join pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'catalog'
      and relation.relname = 'company_aliases'
      and constraint_record.contype = 'f'
      and pg_get_constraintdef(constraint_record.oid) like
        'FOREIGN KEY (company_id)%ON DELETE RESTRICT'
  ),
  1,
  'aliases restrict deletion of referenced companies'
);

select extensions.has_index(
  'catalog',
  'sectors',
  'sectors_active_sort_idx',
  'sector active ordering has an index'
);
select extensions.has_index(
  'catalog',
  'role_families',
  'role_families_active_taxonomy_sort_idx',
  'role-family taxonomy ordering has an index'
);
select extensions.has_index(
  'catalog',
  'roles',
  'roles_family_active_taxonomy_sort_idx',
  'role family ordering has an index'
);
select extensions.has_index(
  'catalog',
  'companies',
  'companies_verified_domain_uidx',
  'verified company domains have a partial unique index'
);
select extensions.has_index(
  'catalog',
  'companies',
  'companies_publication_name_idx',
  'published company keyset ordering has an index'
);
select extensions.has_index(
  'catalog',
  'company_aliases',
  'company_aliases_approved_tuple_uidx',
  'approved alias contexts have a partial unique index'
);
select extensions.has_index(
  'catalog',
  'company_aliases',
  'company_aliases_resolver_idx',
  'exact alias resolution has an index'
);
select extensions.has_index(
  'catalog',
  'company_aliases',
  'company_aliases_company_id_idx',
  'alias company FK operations have a complete lookup index'
);
select extensions.has_index(
  'catalog',
  'compensation_bands',
  'compensation_bands_active_dimension_idx',
  'active compensation dimensions have an index'
);

select extensions.is(
  (
    select count(*)::integer
    from pg_trigger
    where not tgisinternal
      and tgname in (
        'enforce_role_family_identity',
        'enforce_role_identity',
        'enforce_sector_identity'
      )
  ),
  3,
  'reference catalog identities have immutability triggers'
);

select extensions.is(
  (
    select count(*)::integer
    from pg_constraint as constraint_record
    join pg_class as relation
      on relation.oid = constraint_record.conrelid
    join pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'catalog'
      and relation.relname = 'compensation_bands'
      and constraint_record.contype = 'x'
      and constraint_record.conname = 'compensation_bands_no_overlap'
  ),
  1,
  'compensation range and validity overlap is database-enforced'
);

select extensions.has_function(
  'catalog',
  'normalize_company_alias_v1',
  array['text'],
  'the frozen V1 alias normalizer exists'
);

select extensions.is(
  (
    select count(*)::integer
    from pg_trigger
    where not tgisinternal
      and tgname = 'set_company_update_metadata'
  ),
  1,
  'company optimistic metadata trigger is installed'
);
select extensions.is(
  (
    select count(*)::integer
    from pg_trigger
    where not tgisinternal
      and tgname = 'enforce_company_alias_lifecycle'
  ),
  1,
  'company alias lifecycle trigger is installed'
);

select extensions.is(
  (
    select count(*)::integer
    from pg_proc as procedure
    join pg_namespace as namespace
      on namespace.oid = procedure.pronamespace
    where namespace.nspname in ('api', 'catalog')
      and procedure.proname in (
        'enforce_company_alias_lifecycle',
        'enforce_role_family_identity',
        'enforce_role_identity',
        'enforce_sector_identity',
        'list_active_compensation_bands_v1',
        'list_active_role_families_v1',
        'list_active_roles_v1',
        'list_active_sectors_v1',
        'list_published_companies_v1',
        'resolve_company_alias_v1',
        'set_company_update_metadata'
      )
      and procedure.prosecdef
  ),
  11,
  'all privileged catalog functions are SECURITY DEFINER'
);

select extensions.is(
  (
    select count(*)::integer
    from pg_proc as procedure
    join pg_namespace as namespace
      on namespace.oid = procedure.pronamespace
    where namespace.nspname in ('api', 'catalog')
      and procedure.proname in (
        'enforce_company_alias_lifecycle',
        'enforce_role_family_identity',
        'enforce_role_identity',
        'enforce_sector_identity',
        'list_active_compensation_bands_v1',
        'list_active_role_families_v1',
        'list_active_roles_v1',
        'list_active_sectors_v1',
        'list_published_companies_v1',
        'resolve_company_alias_v1',
        'set_company_update_metadata'
      )
      and procedure.proconfig = array['search_path=""']::text[]
  ),
  11,
  'all privileged catalog functions use an empty fixed search_path'
);

select extensions.ok(
  has_function_privilege(
    'anon',
    'api.list_active_sectors_v1()',
    'EXECUTE'
  ),
  'anon can execute the active-sector projection'
);
select extensions.ok(
  has_function_privilege(
    'anon',
    'api.list_active_role_families_v1(text,integer,uuid,integer)',
    'EXECUTE'
  ),
  'anon can execute the active role-family projection'
);
select extensions.ok(
  has_function_privilege(
    'anon',
    'api.list_active_roles_v1(uuid,text,integer,uuid,integer)',
    'EXECUTE'
  ),
  'anon can execute the active-role projection'
);
select extensions.ok(
  has_function_privilege(
    'anon',
    'api.list_published_companies_v1(smallint,text,text,uuid,integer)',
    'EXECUTE'
  ),
  'anon can execute the published-company projection'
);
select extensions.ok(
  has_function_privilege(
    'anon',
    'api.list_active_compensation_bands_v1(text,text,text,text,text,text,uuid,integer)',
    'EXECUTE'
  ),
  'anon can execute the active compensation-band projection'
);
select extensions.ok(
  not has_function_privilege(
    'anon',
    'api.resolve_company_alias_v1(text,text,text)',
    'EXECUTE'
  ),
  'anon cannot execute the company alias resolver'
);
select extensions.ok(
  not has_function_privilege(
    'authenticated',
    'api.resolve_company_alias_v1(text,text,text)',
    'EXECUTE'
  ),
  'authenticated users cannot execute the company alias resolver'
);
select extensions.ok(
  has_function_privilege(
    'service_role',
    'api.resolve_company_alias_v1(text,text,text)',
    'EXECUTE'
  ),
  'service_role can execute only the narrow company alias resolver'
);

select extensions.is(
  (
    select count(*)::integer
    from pg_proc as procedure
    join pg_namespace as namespace
      on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'api'
      and procedure.proname in (
        'list_active_compensation_bands_v1',
        'list_active_role_families_v1',
        'list_active_roles_v1',
        'list_active_sectors_v1',
        'list_published_companies_v1',
        'resolve_company_alias_v1'
      )
      and lower(pg_get_function_result(procedure.oid)) ~
        '(legal_name|normalized_domain|external_case|review_status|source_code|normalized_alias)'
  ),
  0,
  'catalog API results expose no private company or alias fields'
);

select * from extensions.finish();

rollback;
