-- Keep admin panel user directory fully inside public.user_profiles.
-- This avoids runtime dependence on auth.users permissions in admin RPCs.

alter table public.user_profiles
  add column if not exists email text,
  add column if not exists auth_created_at timestamptz,
  add column if not exists email_confirmed_at timestamptz,
  add column if not exists last_sign_in_at timestamptz;

update public.user_profiles p
set
  email = u.email,
  auth_created_at = u.created_at,
  email_confirmed_at = u.email_confirmed_at,
  last_sign_in_at = u.last_sign_in_at
from auth.users u
where u.id = p.user_id;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (
    user_id,
    role,
    email,
    auth_created_at,
    email_confirmed_at,
    last_sign_in_at
  )
  values (
    new.id,
    'user',
    new.email,
    new.created_at,
    new.email_confirmed_at,
    new.last_sign_in_at
  )
  on conflict (user_id) do update set
    email = excluded.email,
    auth_created_at = excluded.auth_created_at,
    email_confirmed_at = excluded.email_confirmed_at,
    last_sign_in_at = excluded.last_sign_in_at;

  return new;
end;
$$;

create or replace function public.handle_auth_user_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_profiles
  set
    email = new.email,
    auth_created_at = coalesce(new.created_at, auth_created_at),
    email_confirmed_at = new.email_confirmed_at,
    last_sign_in_at = new.last_sign_in_at
  where user_id = new.id;

  if not found then
    insert into public.user_profiles (
      user_id,
      role,
      email,
      auth_created_at,
      email_confirmed_at,
      last_sign_in_at
    )
    values (
      new.id,
      'user',
      new.email,
      new.created_at,
      new.email_confirmed_at,
      new.last_sign_in_at
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_updated_user_profile on auth.users;
create trigger on_auth_user_updated_user_profile
after update of email, created_at, email_confirmed_at, last_sign_in_at on auth.users
for each row execute function public.handle_auth_user_profile_update();

drop policy if exists "user_profiles_select_admin" on public.user_profiles;
create policy "user_profiles_select_admin"
on public.user_profiles
for select
using (public.is_admin(auth.uid()));

create or replace function public.admin_list_users()
returns table (
  user_id uuid,
  email text,
  role app_role,
  created_at timestamptz,
  email_confirmed_at timestamptz,
  last_sign_in_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  requester_id uuid;
begin
  requester_id := auth.uid();

  if requester_id is null then
    raise exception 'Sessão administrativa inválida.';
  end if;

  if not public.is_admin(requester_id) then
    raise exception 'Acesso negado.';
  end if;

  return query
  select
    p.user_id,
    p.email,
    coalesce(p.role, 'user'::app_role) as role,
    coalesce(p.auth_created_at, p.created_at) as created_at,
    p.email_confirmed_at,
    p.last_sign_in_at
  from public.user_profiles p
  order by coalesce(p.auth_created_at, p.created_at) desc;
end;
$$;

create or replace function public.admin_platform_metrics()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  requester_id uuid;
  total_users bigint;
  total_admins bigint;
  verified_users bigint;
  active_last_30d bigint;
begin
  requester_id := auth.uid();

  if requester_id is null then
    raise exception 'Sessão administrativa inválida.';
  end if;

  if not public.is_admin(requester_id) then
    raise exception 'Acesso negado.';
  end if;

  select count(*) into total_users from public.user_profiles;

  select count(*) into total_admins
  from public.user_profiles
  where role = 'admin';

  select count(*) into verified_users
  from public.user_profiles
  where email_confirmed_at is not null;

  select count(*) into active_last_30d
  from public.user_profiles
  where last_sign_in_at is not null
    and last_sign_in_at >= timezone('utc'::text, now()) - interval '30 days';

  return jsonb_build_object(
    'total_users', total_users,
    'total_admins', total_admins,
    'verified_users', verified_users,
    'active_last_30d', active_last_30d
  );
end;
$$;

create or replace function public.admin_set_user_role(
  p_target_user_id uuid,
  p_new_role app_role
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  requester_id uuid;
begin
  requester_id := auth.uid();

  if requester_id is null then
    raise exception 'Sessão administrativa inválida.';
  end if;

  if not public.is_admin(requester_id) then
    raise exception 'Acesso negado.';
  end if;

  if p_target_user_id is null then
    raise exception 'Usuário alvo inválido.';
  end if;

  if p_target_user_id = requester_id and p_new_role <> 'admin' then
    raise exception 'Você não pode remover seu próprio papel de admin.';
  end if;

  if not exists (select 1 from public.user_profiles where user_id = p_target_user_id) then
    raise exception 'Usuário alvo não encontrado.';
  end if;

  update public.user_profiles
  set role = p_new_role
  where user_id = p_target_user_id;
end;
$$;

revoke all on function public.admin_list_users() from public;
revoke all on function public.admin_platform_metrics() from public;
revoke all on function public.admin_set_user_role(uuid, app_role) from public;

grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_platform_metrics() to authenticated;
grant execute on function public.admin_set_user_role(uuid, app_role) to authenticated;
