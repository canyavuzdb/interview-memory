begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(10);

select extensions.lives_ok(
  $test$
    insert into auth.users (
      id,
      email,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    values (
      '50000000-0000-4000-8000-000000000001',
      'bootstrap@example.test',
      '{"provider":"google"}'::jsonb,
      '{"display_name":"Provider Name","avatar_url":"https://example.test/avatar"}'::jsonb,
      now(),
      now()
    )
  $test$,
  'an auth user atomically creates its application identity'
);

select extensions.is(
  (
    select count(*)::integer
    from core.user_profiles
    where user_id = '50000000-0000-4000-8000-000000000001'
  ),
  1,
  'signup creates exactly one user profile'
);

select extensions.is(
  (
    select count(*)::integer
    from core.data_subjects
    where auth_user_id = '50000000-0000-4000-8000-000000000001'
      and status = 'authenticated'
  ),
  1,
  'signup creates exactly one authenticated data subject'
);

select extensions.is(
  (
    select display_name
    from core.user_profiles
    where user_id = '50000000-0000-4000-8000-000000000001'
  ),
  null::text,
  'provider display metadata is not copied into the application profile'
);

select extensions.is(
  (
    select count(*)::integer
    from information_schema.columns
    where table_schema in ('authorization', 'core', 'privacy')
      and column_name in (
        'email',
        'provider',
        'provider_token',
        'access_token',
        'refresh_token'
      )
  ),
  0,
  'custom domain tables contain no auth credential columns'
);

create function pg_temp.reject_synthetic_profile()
returns trigger
language plpgsql
as $$
begin
  if new.user_id = '50000000-0000-4000-8000-000000000002' then
    raise exception 'synthetic_profile_failure';
  end if;

  return new;
end;
$$;

create trigger reject_synthetic_profile
before insert
on core.user_profiles
for each row
execute function pg_temp.reject_synthetic_profile();

select extensions.throws_ok(
  $test$
    insert into auth.users (id, email, created_at, updated_at)
    values (
      '50000000-0000-4000-8000-000000000002',
      'rollback@example.test',
      now(),
      now()
    )
  $test$,
  'P0001',
  'synthetic_profile_failure',
  'a profile-trigger failure rejects the auth signup'
);

select extensions.is(
  (
    select count(*)::integer
    from auth.users
    where id = '50000000-0000-4000-8000-000000000002'
  ),
  0,
  'a failed signup leaves no auth user behind'
);

select extensions.throws_ok(
  $test$
    delete from auth.users
    where id = '50000000-0000-4000-8000-000000000001'
  $test$,
  '55000',
  'data_subject_auth_identity_is_immutable',
  'auth deletion fails closed until the data subject is anonymized'
);

update core.data_subjects
set
  auth_user_id = null,
  status = 'anonymized',
  deleted_at = now()
where auth_user_id = '50000000-0000-4000-8000-000000000001';

select extensions.lives_ok(
  $test$
    delete from auth.users
    where id = '50000000-0000-4000-8000-000000000001'
  $test$,
  'auth deletion succeeds after the privacy lifecycle transition'
);

select extensions.ok(
  not exists (
    select 1
    from core.user_profiles
    where user_id = '50000000-0000-4000-8000-000000000001'
  )
  and exists (
    select 1
    from core.data_subjects
    where status = 'anonymized'
      and auth_user_id is null
  ),
  'profile cascades while an anonymized subject tombstone remains'
);

select * from extensions.finish();

rollback;
