begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

create function api.get_my_account_v1()
returns table (
  user_id uuid,
  locale text,
  timezone text,
  onboarding_status text,
  account_status text,
  version bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    profile.user_id,
    profile.locale,
    profile.timezone,
    profile.onboarding_status,
    profile.account_status,
    profile.version
  from core.user_profiles as profile
  inner join core.data_subjects as subject
    on subject.auth_user_id = profile.user_id
  where profile.user_id = (select auth.uid())
    and profile.account_status = 'active'
    and subject.status = 'authenticated'
    and subject.merged_into_id is null
    and subject.deleted_at is null
  limit 1;
$$;

revoke all on function api.get_my_account_v1()
  from public, anon, authenticated, service_role;
grant execute on function api.get_my_account_v1() to authenticated;

comment on function api.get_my_account_v1() is
  'Authenticated self-only account context. Identity comes exclusively from auth.uid(); inactive profiles and non-active data subjects fail closed.';

commit;
