begin;

alter table catalog.role_translations
  drop constraint role_translations_role_id_fkey,
  add constraint role_translations_role_id_fkey
    foreign key (role_id)
    references catalog.roles (id)
    on delete cascade;

commit;
