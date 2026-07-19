begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

create schema catalog;

comment on schema catalog is
  'Private canonical sectors, roles, companies, aliases, and compensation dictionaries.';

revoke all on schema catalog
  from public, anon, authenticated, service_role;

alter default privileges for role postgres in schema catalog
  revoke all on tables
  from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema catalog
  revoke all on sequences
  from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema catalog
  revoke execute on routines
  from public, anon, authenticated, service_role;

create extension if not exists btree_gist with schema extensions;

create table catalog.sectors (
  id smallint generated always as identity primary key,
  slug text not null,
  display_name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  constraint sectors_slug_unique unique (slug),
  constraint sectors_slug_check check (
    char_length(slug) between 1 and 80
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint sectors_display_name_check check (
    display_name = btrim(display_name)
    and char_length(display_name) between 1 and 120
  ),
  constraint sectors_sort_order_check check (sort_order >= 0)
);

create index sectors_active_sort_idx
  on catalog.sectors (is_active, sort_order, id);

comment on table catalog.sectors is
  'T10 canonical sector codes. Referenced rows are deactivated instead of reused or deleted.';

create table catalog.role_families (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  display_name text not null,
  taxonomy_version text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint role_families_slug_taxonomy_unique unique (
    slug,
    taxonomy_version
  ),
  constraint role_families_id_taxonomy_unique unique (
    id,
    taxonomy_version
  ),
  constraint role_families_slug_check check (
    char_length(slug) between 1 and 80
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint role_families_display_name_check check (
    display_name = btrim(display_name)
    and char_length(display_name) between 1 and 120
  ),
  constraint role_families_taxonomy_version_check check (
    taxonomy_version = btrim(taxonomy_version)
    and char_length(taxonomy_version) between 1 and 50
  ),
  constraint role_families_sort_order_check check (sort_order >= 0)
);

create index role_families_active_taxonomy_sort_idx
  on catalog.role_families (
    taxonomy_version,
    is_active,
    sort_order,
    id
  );

comment on table catalog.role_families is
  'T11 versioned canonical role families. Semantic revisions create a new taxonomy row.';

create table catalog.roles (
  id uuid primary key default gen_random_uuid(),
  role_family_id uuid not null,
  slug text not null,
  display_name text not null,
  taxonomy_version text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint roles_family_taxonomy_fkey foreign key (
    role_family_id,
    taxonomy_version
  )
    references catalog.role_families (id, taxonomy_version)
    on delete restrict,
  constraint roles_family_slug_taxonomy_unique unique (
    role_family_id,
    slug,
    taxonomy_version
  ),
  constraint roles_slug_check check (
    char_length(slug) between 1 and 80
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint roles_display_name_check check (
    display_name = btrim(display_name)
    and char_length(display_name) between 1 and 120
  ),
  constraint roles_taxonomy_version_check check (
    taxonomy_version = btrim(taxonomy_version)
    and char_length(taxonomy_version) between 1 and 50
  ),
  constraint roles_sort_order_check check (sort_order >= 0)
);

create index roles_family_active_taxonomy_sort_idx
  on catalog.roles (
    role_family_id,
    taxonomy_version,
    is_active,
    sort_order,
    id
  );

comment on table catalog.roles is
  'T12 canonical roles whose taxonomy version must match their parent family.';

create table catalog.companies (
  id uuid primary key default gen_random_uuid(),
  sector_id smallint
    references catalog.sectors (id) on delete restrict,
  slug text not null,
  legal_name text,
  display_name text not null,
  normalized_domain text,
  country_code character(2),
  verification_status text not null default 'unverified',
  publication_status text not null default 'hidden',
  external_case_ref text,
  external_case_status text,
  external_case_synced_at timestamptz,
  version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_slug_unique unique (slug),
  constraint companies_slug_check check (
    char_length(slug) between 1 and 120
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint companies_legal_name_check check (
    legal_name is null
    or (
      legal_name = btrim(legal_name)
      and char_length(legal_name) between 1 and 250
    )
  ),
  constraint companies_display_name_check check (
    display_name = btrim(display_name)
    and char_length(display_name) between 1 and 200
  ),
  constraint companies_normalized_domain_check check (
    normalized_domain is null
    or (
      normalized_domain = lower(btrim(normalized_domain))
      and char_length(normalized_domain) between 3 and 253
      and normalized_domain ~
        '^[a-z0-9](?:[a-z0-9-]{0,61}\.)+[a-z0-9](?:[a-z0-9-]{0,61})$'
      and normalized_domain !~ '[:/[:space:]]'
    )
  ),
  constraint companies_country_code_check check (
    country_code is null
    or country_code ~ '^[A-Z]{2}$'
  ),
  constraint companies_verification_status_check check (
    verification_status in (
      'unverified',
      'pending',
      'verified',
      'rejected'
    )
  ),
  constraint companies_publication_status_check check (
    publication_status in (
      'hidden',
      'eligible',
      'published',
      'disputed'
    )
  ),
  constraint companies_published_verification_check check (
    publication_status <> 'published'
    or verification_status = 'verified'
  ),
  constraint companies_external_case_state_check check (
    (
      external_case_ref is null
      and external_case_status is null
      and external_case_synced_at is null
    )
    or (
      external_case_ref is not null
      and external_case_status is not null
      and external_case_synced_at is not null
      and external_case_ref = btrim(external_case_ref)
      and char_length(external_case_ref) between 1 and 200
      and external_case_status = btrim(external_case_status)
      and char_length(external_case_status) between 1 and 80
    )
  ),
  constraint companies_version_check check (version > 0),
  constraint companies_timestamps_check check (updated_at >= created_at)
);

create unique index companies_verified_domain_uidx
  on catalog.companies (normalized_domain)
  where verification_status = 'verified'
    and normalized_domain is not null;

create index companies_publication_name_idx
  on catalog.companies (
    publication_status,
    display_name,
    id
  );

create index companies_sector_country_publication_idx
  on catalog.companies (
    sector_id,
    country_code,
    publication_status,
    display_name,
    id
  );

comment on table catalog.companies is
  'T13 moderated canonical employers. Private legal, domain, case, and lifecycle fields never appear in the public catalog API.';

create function catalog.normalize_company_alias_v1(
  p_alias text
)
returns text
language sql
immutable
strict
parallel safe
set search_path = ''
as $$
  select nullif(
    pg_catalog.btrim(
      pg_catalog.regexp_replace(
        pg_catalog.translate(
          pg_catalog.lower(pg_catalog.btrim(p_alias)),
          'çğıöşü',
          'cgiosu'
        ),
        '[^[:alnum:]]+',
        ' ',
        'g'
      )
    ),
    ''
  );
$$;

revoke all on function catalog.normalize_company_alias_v1(text)
  from public, anon, authenticated, service_role;

comment on function catalog.normalize_company_alias_v1(text) is
  'Frozen V1 exact-alias normalization. Algorithm changes require a new versioned function and a controlled re-normalization migration.';

create table catalog.company_aliases (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null
    references catalog.companies (id) on delete restrict,
  normalized_alias text not null,
  locale text,
  country_code character(2),
  source_code text not null,
  review_status text not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint company_aliases_normalized_alias_check check (
    normalized_alias = catalog.normalize_company_alias_v1(
      normalized_alias
    )
    and char_length(normalized_alias) between 1 and 200
  ),
  constraint company_aliases_locale_check check (
    locale is null
    or (
      locale = lower(locale)
      and locale ~ '^[a-z]{2}(?:-[a-z]{2})?$'
    )
  ),
  constraint company_aliases_country_code_check check (
    country_code is null
    or country_code ~ '^[A-Z]{2}$'
  ),
  constraint company_aliases_source_code_check check (
    source_code in (
      'user_input',
      'domain',
      'moderator',
      'import'
    )
  ),
  constraint company_aliases_review_status_check check (
    review_status in ('pending', 'approved', 'rejected')
  ),
  constraint company_aliases_review_state_check check (
    (
      review_status = 'pending'
      and reviewed_at is null
    )
    or (
      review_status in ('approved', 'rejected')
      and reviewed_at is not null
      and reviewed_at >= created_at
    )
  )
);

create unique index company_aliases_approved_tuple_uidx
  on catalog.company_aliases (
    normalized_alias,
    (coalesce(country_code::text, '')),
    (coalesce(locale, ''))
  )
  where review_status = 'approved';

create index company_aliases_resolver_idx
  on catalog.company_aliases (
    normalized_alias,
    country_code,
    locale,
    review_status
  );

create index company_aliases_company_id_idx
  on catalog.company_aliases (company_id);

create index company_aliases_moderation_idx
  on catalog.company_aliases (
    review_status,
    created_at,
    id
  );

comment on table catalog.company_aliases is
  'T14 private exact aliases. Pending and rejected user input is never exposed as a public autocomplete oracle.';

create table catalog.compensation_bands (
  id uuid primary key default gen_random_uuid(),
  currency_code character(3) not null,
  pay_period text not null,
  gross_net text not null,
  region_code text not null,
  lower_bound numeric(19, 4) not null,
  upper_bound numeric(19, 4) not null,
  definition_version text not null,
  valid_from date not null,
  valid_to date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint compensation_bands_natural_unique unique (
    currency_code,
    pay_period,
    gross_net,
    region_code,
    definition_version,
    lower_bound,
    upper_bound,
    valid_from
  ),
  constraint compensation_bands_currency_code_check check (
    currency_code ~ '^[A-Z]{3}$'
  ),
  constraint compensation_bands_pay_period_check check (
    pay_period in ('hourly', 'monthly', 'annual')
  ),
  constraint compensation_bands_gross_net_check check (
    gross_net in ('gross', 'net', 'unknown')
  ),
  constraint compensation_bands_region_code_check check (
    char_length(region_code) between 1 and 80
    and region_code ~ '^[a-z0-9]+(?:[-_][a-z0-9]+)*$'
  ),
  constraint compensation_bands_bounds_check check (
    lower_bound >= 0
    and upper_bound > lower_bound
  ),
  constraint compensation_bands_definition_version_check check (
    definition_version = btrim(definition_version)
    and char_length(definition_version) between 1 and 50
  ),
  constraint compensation_bands_validity_check check (
    valid_to is null
    or valid_to > valid_from
  ),
  constraint compensation_bands_no_overlap exclude using gist (
    currency_code with =,
    pay_period with =,
    gross_net with =,
    region_code with =,
    definition_version with =,
    numrange(lower_bound, upper_bound, '[)') with &&,
    daterange(valid_from, valid_to, '[)') with &&
  )
);

create index compensation_bands_active_dimension_idx
  on catalog.compensation_bands (
    currency_code,
    pay_period,
    gross_net,
    region_code,
    definition_version,
    is_active,
    lower_bound,
    id
  );

comment on table catalog.compensation_bands is
  'T15 versioned half-open compensation ranges. Exact compensation is outside this shared dictionary.';

alter table catalog.sectors enable row level security;
alter table catalog.sectors force row level security;
alter table catalog.role_families enable row level security;
alter table catalog.role_families force row level security;
alter table catalog.roles enable row level security;
alter table catalog.roles force row level security;
alter table catalog.companies enable row level security;
alter table catalog.companies force row level security;
alter table catalog.company_aliases enable row level security;
alter table catalog.company_aliases force row level security;
alter table catalog.compensation_bands enable row level security;
alter table catalog.compensation_bands force row level security;

revoke all on all tables in schema catalog
  from public, anon, authenticated, service_role;
revoke all on all sequences in schema catalog
  from public, anon, authenticated, service_role;
revoke all on all routines in schema catalog
  from public, anon, authenticated, service_role;

create function catalog.enforce_sector_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.id is distinct from old.id
    or new.slug is distinct from old.slug
  then
    raise exception using
      errcode = '55000',
      message = 'sector_identity_is_immutable';
  end if;

  return new;
end;
$$;

revoke all on function catalog.enforce_sector_identity()
  from public, anon, authenticated, service_role;

create trigger enforce_sector_identity
before update
on catalog.sectors
for each row
execute function catalog.enforce_sector_identity();

create function catalog.enforce_role_family_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.id is distinct from old.id
    or new.slug is distinct from old.slug
    or new.taxonomy_version is distinct from old.taxonomy_version
    or new.created_at is distinct from old.created_at
  then
    raise exception using
      errcode = '55000',
      message = 'role_family_identity_is_immutable';
  end if;

  return new;
end;
$$;

revoke all on function catalog.enforce_role_family_identity()
  from public, anon, authenticated, service_role;

create trigger enforce_role_family_identity
before update
on catalog.role_families
for each row
execute function catalog.enforce_role_family_identity();

create function catalog.enforce_role_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.id is distinct from old.id
    or new.role_family_id is distinct from old.role_family_id
    or new.slug is distinct from old.slug
    or new.taxonomy_version is distinct from old.taxonomy_version
    or new.created_at is distinct from old.created_at
  then
    raise exception using
      errcode = '55000',
      message = 'role_identity_is_immutable';
  end if;

  return new;
end;
$$;

revoke all on function catalog.enforce_role_identity()
  from public, anon, authenticated, service_role;

create trigger enforce_role_identity
before update
on catalog.roles
for each row
execute function catalog.enforce_role_identity();

create function catalog.set_company_update_metadata()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.id is distinct from old.id
    or new.slug is distinct from old.slug
    or new.created_at is distinct from old.created_at
  then
    raise exception using
      errcode = '55000',
      message = 'company_identity_is_immutable';
  end if;

  new.version := old.version + 1;
  new.updated_at := pg_catalog.clock_timestamp();

  return new;
end;
$$;

revoke all on function catalog.set_company_update_metadata()
  from public, anon, authenticated, service_role;

create trigger set_company_update_metadata
before update
on catalog.companies
for each row
execute function catalog.set_company_update_metadata();

create function catalog.enforce_company_alias_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.review_status <> 'pending'
      or new.reviewed_at is not null
    then
      raise exception using
        errcode = '55000',
        message = 'company_alias_initial_state_invalid';
    end if;

    return new;
  end if;

  if new.id is distinct from old.id
    or new.company_id is distinct from old.company_id
    or new.normalized_alias is distinct from old.normalized_alias
    or new.locale is distinct from old.locale
    or new.country_code is distinct from old.country_code
    or new.source_code is distinct from old.source_code
    or new.created_at is distinct from old.created_at
  then
    raise exception using
      errcode = '55000',
      message = 'company_alias_identity_is_immutable';
  end if;

  if old.review_status <> 'pending'
    and new is distinct from old
  then
    raise exception using
      errcode = '55000',
      message = 'company_alias_review_is_terminal';
  end if;

  if old.review_status = 'pending'
    and new.review_status in ('approved', 'rejected')
  then
    new.reviewed_at := pg_catalog.clock_timestamp();
  end if;

  return new;
end;
$$;

revoke all on function catalog.enforce_company_alias_lifecycle()
  from public, anon, authenticated, service_role;

create trigger enforce_company_alias_lifecycle
before insert or update
on catalog.company_aliases
for each row
execute function catalog.enforce_company_alias_lifecycle();

create function api.list_active_sectors_v1()
returns table (
  id smallint,
  slug text,
  display_name text,
  sort_order integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    sector.id,
    sector.slug,
    sector.display_name,
    sector.sort_order
  from catalog.sectors as sector
  where sector.is_active
  order by sector.sort_order, sector.id;
$$;

revoke all on function api.list_active_sectors_v1()
  from public, anon, authenticated, service_role;
grant execute on function api.list_active_sectors_v1()
  to anon, authenticated, service_role;

comment on function api.list_active_sectors_v1() is
  'APV02 bounded active-sector projection. Raw catalog grants remain closed.';

create function api.list_active_role_families_v1(
  p_taxonomy_version text,
  p_after_sort_order integer default null,
  p_after_id uuid default null,
  p_limit integer default 50
)
returns table (
  id uuid,
  slug text,
  display_name text,
  taxonomy_version text,
  sort_order integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    family.id,
    family.slug,
    family.display_name,
    family.taxonomy_version,
    family.sort_order
  from catalog.role_families as family
  where family.is_active
    and char_length(p_taxonomy_version) between 1 and 50
    and family.taxonomy_version = p_taxonomy_version
    and (
      (
        p_after_sort_order is null
        and p_after_id is null
      )
      or (
        p_after_sort_order is not null
        and p_after_id is not null
        and (family.sort_order, family.id) >
          (p_after_sort_order, p_after_id)
      )
    )
  order by family.sort_order, family.id
  limit least(
    greatest(coalesce(p_limit, 50), 1),
    101
  );
$$;

revoke all on function api.list_active_role_families_v1(
  text,
  integer,
  uuid,
  integer
) from public, anon, authenticated, service_role;
grant execute on function api.list_active_role_families_v1(
  text,
  integer,
  uuid,
  integer
) to anon, authenticated, service_role;

comment on function api.list_active_role_families_v1(
  text,
  integer,
  uuid,
  integer
) is
  'APV02 active role-family projection with (sort_order,id) keyset pagination.';

create function api.list_active_roles_v1(
  p_role_family_id uuid,
  p_taxonomy_version text,
  p_after_sort_order integer default null,
  p_after_id uuid default null,
  p_limit integer default 50
)
returns table (
  id uuid,
  role_family_id uuid,
  slug text,
  display_name text,
  taxonomy_version text,
  sort_order integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    role.id,
    role.role_family_id,
    role.slug,
    role.display_name,
    role.taxonomy_version,
    role.sort_order
  from catalog.roles as role
  join catalog.role_families as family
    on family.id = role.role_family_id
    and family.taxonomy_version = role.taxonomy_version
  where role.is_active
    and family.is_active
    and char_length(p_taxonomy_version) between 1 and 50
    and role.role_family_id = p_role_family_id
    and role.taxonomy_version = p_taxonomy_version
    and (
      (
        p_after_sort_order is null
        and p_after_id is null
      )
      or (
        p_after_sort_order is not null
        and p_after_id is not null
        and (role.sort_order, role.id) >
          (p_after_sort_order, p_after_id)
      )
    )
  order by role.sort_order, role.id
  limit least(
    greatest(coalesce(p_limit, 50), 1),
    101
  );
$$;

revoke all on function api.list_active_roles_v1(
  uuid,
  text,
  integer,
  uuid,
  integer
) from public, anon, authenticated, service_role;
grant execute on function api.list_active_roles_v1(
  uuid,
  text,
  integer,
  uuid,
  integer
) to anon, authenticated, service_role;

comment on function api.list_active_roles_v1(
  uuid,
  text,
  integer,
  uuid,
  integer
) is
  'APV02 active role projection scoped to one active family and taxonomy version.';

create function api.list_published_companies_v1(
  p_sector_id smallint default null,
  p_country_code text default null,
  p_after_display_name text default null,
  p_after_id uuid default null,
  p_limit integer default 25
)
returns table (
  id uuid,
  slug text,
  display_name text,
  sector_id smallint,
  country_code text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    company.id,
    company.slug,
    company.display_name,
    company.sector_id,
    company.country_code::text
  from catalog.companies as company
  left join catalog.sectors as sector
    on sector.id = company.sector_id
  where company.verification_status = 'verified'
    and company.publication_status = 'published'
    and (
      company.sector_id is null
      or sector.is_active
    )
    and (
      p_sector_id is null
      or company.sector_id = p_sector_id
    )
    and (
      p_country_code is null
      or (
        pg_catalog.upper(pg_catalog.btrim(p_country_code)) ~
          '^[A-Z]{2}$'
        and company.country_code::text =
          pg_catalog.upper(pg_catalog.btrim(p_country_code))
      )
    )
    and (
      (
        p_after_display_name is null
        and p_after_id is null
      )
      or (
        p_after_display_name is not null
        and p_after_id is not null
        and (company.display_name, company.id) >
          (p_after_display_name, p_after_id)
      )
    )
  order by company.display_name, company.id
  limit least(
    greatest(coalesce(p_limit, 25), 1),
    101
  );
$$;

revoke all on function api.list_published_companies_v1(
  smallint,
  text,
  text,
  uuid,
  integer
) from public, anon, authenticated, service_role;
grant execute on function api.list_published_companies_v1(
  smallint,
  text,
  text,
  uuid,
  integer
) to anon, authenticated, service_role;

comment on function api.list_published_companies_v1(
  smallint,
  text,
  text,
  uuid,
  integer
) is
  'APV02 minimal verified-and-published company projection with (display_name,id) keyset pagination.';

create function api.list_active_compensation_bands_v1(
  p_currency_code text,
  p_pay_period text,
  p_gross_net text,
  p_region_code text,
  p_definition_version text,
  p_after_lower_bound text default null,
  p_after_id uuid default null,
  p_limit integer default 50
)
returns table (
  id uuid,
  currency_code text,
  pay_period text,
  gross_net text,
  region_code text,
  lower_bound text,
  upper_bound text,
  definition_version text,
  valid_from date,
  valid_to date
)
language sql
stable
security definer
set search_path = ''
as $$
  with cursor_input as (
    select
      case
        when p_after_lower_bound is not null
          and char_length(p_after_lower_bound) <= 20
          and p_after_lower_bound ~
            '^[0-9]{1,15}(?:\.[0-9]{1,4})?$'
          then p_after_lower_bound::numeric(19, 4)
        else null
      end as lower_bound,
      (
        p_after_lower_bound is not null
        and char_length(p_after_lower_bound) <= 20
        and p_after_lower_bound ~
          '^[0-9]{1,15}(?:\.[0-9]{1,4})?$'
      ) as is_valid
  )
  select
    band.id,
    band.currency_code::text,
    band.pay_period,
    band.gross_net,
    band.region_code,
    band.lower_bound::text,
    band.upper_bound::text,
    band.definition_version,
    band.valid_from,
    band.valid_to
  from cursor_input
  cross join catalog.compensation_bands as band
  where band.is_active
    and char_length(p_currency_code) between 1 and 3
    and pg_catalog.upper(pg_catalog.btrim(p_currency_code)) ~
      '^[A-Z]{3}$'
    and band.currency_code::text =
      pg_catalog.upper(pg_catalog.btrim(p_currency_code))
    and band.pay_period = p_pay_period
    and band.gross_net = p_gross_net
    and char_length(p_region_code) between 1 and 80
    and band.region_code = p_region_code
    and char_length(p_definition_version) between 1 and 50
    and band.definition_version = p_definition_version
    and band.valid_from <= current_date
    and (
      band.valid_to is null
      or band.valid_to > current_date
    )
    and (
      (
        p_after_lower_bound is null
        and p_after_id is null
      )
      or (
        p_after_lower_bound is not null
        and p_after_id is not null
        and cursor_input.is_valid
        and (band.lower_bound, band.id) >
          (cursor_input.lower_bound, p_after_id)
      )
    )
  order by band.lower_bound, band.id
  limit least(
    greatest(coalesce(p_limit, 50), 1),
    101
  );
$$;

revoke all on function api.list_active_compensation_bands_v1(
  text,
  text,
  text,
  text,
  text,
  text,
  uuid,
  integer
) from public, anon, authenticated, service_role;
grant execute on function api.list_active_compensation_bands_v1(
  text,
  text,
  text,
  text,
  text,
  text,
  uuid,
  integer
) to anon, authenticated, service_role;

comment on function api.list_active_compensation_bands_v1(
  text,
  text,
  text,
  text,
  text,
  text,
  uuid,
  integer
) is
  'APV02 effective compensation-band projection with decimal strings and (lower_bound,id) keyset pagination.';

create function api.resolve_company_alias_v1(
  p_alias text,
  p_country_code text default null,
  p_locale text default null
)
returns table (
  company_id uuid
)
language sql
stable
security definer
set search_path = ''
as $$
  with input as (
    select
      case
        when p_alias is not null
          and pg_catalog.octet_length(p_alias) between 1 and 512
          then catalog.normalize_company_alias_v1(p_alias)
        else null
      end as normalized_alias,
      case
        when p_country_code is null then null
        else pg_catalog.upper(pg_catalog.btrim(p_country_code))
      end as country_code,
      case
        when p_locale is null then null
        else pg_catalog.lower(pg_catalog.btrim(p_locale))
      end as locale,
      (
        p_alias is not null
        and pg_catalog.octet_length(p_alias) between 1 and 512
        and (
          p_country_code is null
          or pg_catalog.octet_length(p_country_code) = 2
        )
        and (
          p_locale is null
          or pg_catalog.octet_length(p_locale) between 2 and 5
        )
      ) as is_valid
  ),
  ranked_candidates as (
    select
      alias.company_id,
      case
        when input.country_code is not null
          and input.locale is not null
          and alias.country_code::text = input.country_code
          and alias.locale = input.locale
          then 1
        when input.country_code is not null
          and alias.country_code::text = input.country_code
          and alias.locale is null
          then 2
        when input.locale is not null
          and alias.country_code is null
          and alias.locale = input.locale
          then 3
        when alias.country_code is null
          and alias.locale is null
          then 4
        else null
      end as match_rank
    from input
    join catalog.company_aliases as alias
      on alias.normalized_alias = input.normalized_alias
      and alias.review_status = 'approved'
    join catalog.companies as company
      on company.id = alias.company_id
      and company.verification_status <> 'rejected'
    where input.normalized_alias is not null
      and input.is_valid
      and char_length(input.normalized_alias) <= 200
      and (
        input.country_code is null
        or input.country_code ~ '^[A-Z]{2}$'
      )
      and (
        input.locale is null
        or input.locale ~ '^[a-z]{2}(?:-[a-z]{2})?$'
      )
  ),
  best_candidates as (
    select candidate.company_id
    from ranked_candidates as candidate
    where candidate.match_rank = (
      select min(ranked.match_rank)
      from ranked_candidates as ranked
      where ranked.match_rank is not null
    )
  )
  select candidate.company_id
  from best_candidates as candidate
  where (
    select count(*)
    from best_candidates
  ) = 1;
$$;

revoke all on function api.resolve_company_alias_v1(
  text,
  text,
  text
) from public, anon, authenticated;
grant execute on function api.resolve_company_alias_v1(
  text,
  text,
  text
) to service_role;

comment on function api.resolve_company_alias_v1(
  text,
  text,
  text
) is
  'Server-only exact approved-alias resolver. Ambiguous, pending, rejected, and unmatched input all fail closed with no row.';

commit;
