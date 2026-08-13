alter table intake.company_experiences
  alter column company_name drop not null,
  drop constraint company_experiences_company_name_check,
  add constraint company_experiences_company_name_check check (
    company_name is null
    or (
      company_name = btrim(company_name)
      and char_length(company_name) between 2 and 200
      and company_name !~ '[[:cntrl:]]'
    )
  );

create function intake.resolve_company_experience_company_v1()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_name text;
begin
  if new.company_name is null or new.company_id is not null then
    return new;
  end if;

  normalized_name := catalog.normalize_company_alias_v1(new.company_name);

  select alias.company_id
  into new.company_id
  from catalog.company_aliases as alias
  join catalog.companies as company on company.id = alias.company_id
  where alias.normalized_alias = normalized_name
    and company.verification_status <> 'rejected'
  order by
    case when alias.review_status = 'approved' then 0 else 1 end,
    company.created_at
  limit 1;

  if new.company_id is not null then
    return new;
  end if;

  insert into catalog.companies (
    slug, display_name, verification_status, publication_status
  ) values (
    'suggested-company-' || gen_random_uuid()::text,
    btrim(new.company_name),
    'unverified',
    'hidden'
  ) returning id into new.company_id;

  insert into catalog.company_aliases (
    company_id, normalized_alias, source_code
  ) values (
    new.company_id, normalized_name, 'user_input'
  );

  return new;
end;
$$;

revoke all on function intake.resolve_company_experience_company_v1()
  from public, anon, authenticated, service_role;

create trigger resolve_company_experience_company
before insert on intake.company_experiences
for each row execute function intake.resolve_company_experience_company_v1();
