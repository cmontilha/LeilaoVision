-- Add user/admin roles and promote an existing account to admin.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type app_role as enum ('user', 'admin');
  end if;
end;
$$;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role app_role not null default 'user',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

drop trigger if exists set_updated_at_user_profiles on public.user_profiles;
create trigger set_updated_at_user_profiles
before update on public.user_profiles
for each row execute function public.handle_updated_at();

create index if not exists user_profiles_role_idx on public.user_profiles(role);

alter table public.user_profiles enable row level security;

drop policy if exists "user_profiles_select_own" on public.user_profiles;
create policy "user_profiles_select_own"
on public.user_profiles
for select
using (auth.uid() = user_id);

-- Backfill profiles for already existing users.
insert into public.user_profiles (user_id)
select id
from auth.users
on conflict (user_id) do nothing;

-- Keep profiles in sync for new auth users.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_user_profile on auth.users;
create trigger on_auth_user_created_user_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

-- Promote requested account to admin (if it exists).
insert into public.user_profiles (user_id, role)
select id, 'admin'::app_role
from auth.users
where lower(email) = lower('caiomontilha.cm@gmail.com')
on conflict (user_id) do update set role = excluded.role;
