begin;

update catalog.roles as role
set sort_order = last_position.sort_order
from (
  select max(sort_order) + 1 as sort_order
  from catalog.roles
  where role_family_id = 'b8000000-0000-4000-8100-000000000007'
    and taxonomy_version = '2026.1'
    and slug <> 'diger'
) as last_position
where role.role_family_id = 'b8000000-0000-4000-8100-000000000007'
  and role.taxonomy_version = '2026.1'
  and role.slug = 'diger';

commit;
