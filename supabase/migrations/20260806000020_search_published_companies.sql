create index if not exists companies_published_display_name_search_idx
  on catalog.companies (
    lower(display_name) text_pattern_ops
  )
  where verification_status = 'verified'
    and publication_status = 'published';

create function api.search_published_companies_v1(
  p_query text,
  p_limit integer default 12
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
  with query as (
    select catalog.normalize_company_alias_v1(p_query) as normalized
  )
  select
    company.id,
    company.slug,
    company.display_name,
    company.sector_id,
    company.country_code::text
  from catalog.companies as company
  cross join query
  where company.verification_status = 'verified'
    and company.publication_status = 'published'
    and char_length(query.normalized) >= 2
    and exists (
      select 1
      from catalog.company_aliases as alias
      where alias.company_id = company.id
        and alias.review_status = 'approved'
        and alias.normalized_alias like query.normalized || '%'
    )
  order by
    case
      when exists (
        select 1
        from catalog.company_aliases as alias
        where alias.company_id = company.id
          and alias.review_status = 'approved'
          and alias.normalized_alias = query.normalized
      ) then 0
      else 1
    end,
    company.display_name,
    company.id
  limit least(greatest(coalesce(p_limit, 12), 1), 25);
$$;

revoke all on function api.search_published_companies_v1(text, integer)
  from public, anon, authenticated, service_role;
grant execute on function api.search_published_companies_v1(text, integer)
  to anon, authenticated, service_role;

comment on function api.search_published_companies_v1(text, integer) is
  'Public bounded autocomplete projection. Searches only approved aliases for verified, published companies.';
