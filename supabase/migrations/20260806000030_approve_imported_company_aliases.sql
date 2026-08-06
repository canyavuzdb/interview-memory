-- Data-modifying CTEs cannot reliably update rows inserted by a preceding CTE
-- in the same statement. The initial seed therefore leaves these aliases in
-- their intentionally safe pending state. Promote only aliases belonging to
-- the two reviewed import batches in a separate statement.
with candidates as (
  select
    alias.id,
    alias.normalized_alias,
    alias.locale,
    alias.country_code,
    row_number() over (
      partition by alias.normalized_alias, alias.locale, alias.country_code
      order by
        case
          when company.external_case_ref = 'catalog:curated-employers-v1' then 0
          else 1
        end,
        company.slug
    ) as alias_rank
  from catalog.company_aliases as alias
  join catalog.companies as company
    on company.id = alias.company_id
  where alias.review_status = 'pending'
    and alias.source_code = 'import'
    and (
      company.external_case_ref like 'kap:bist:%'
      or company.external_case_ref = 'catalog:curated-employers-v1'
    )
)
update catalog.company_aliases as alias
set review_status = 'approved'
from candidates
where alias.id = candidates.id
  and candidates.alias_rank = 1
  and not exists (
    select 1
    from catalog.company_aliases as approved_alias
    where approved_alias.normalized_alias = candidates.normalized_alias
      and approved_alias.locale is not distinct from candidates.locale
      and approved_alias.country_code is not distinct from candidates.country_code
      and approved_alias.review_status = 'approved'
  );

update catalog.company_aliases as alias
set review_status = 'rejected'
from catalog.companies as company
where alias.company_id = company.id
  and alias.review_status = 'pending'
  and alias.source_code = 'import'
  and (
    company.external_case_ref like 'kap:bist:%'
    or company.external_case_ref = 'catalog:curated-employers-v1'
  )
  and exists (
    select 1
    from catalog.company_aliases as approved_alias
    where approved_alias.normalized_alias = alias.normalized_alias
      and approved_alias.locale is not distinct from alias.locale
      and approved_alias.country_code is not distinct from alias.country_code
      and approved_alias.review_status = 'approved'
  );
