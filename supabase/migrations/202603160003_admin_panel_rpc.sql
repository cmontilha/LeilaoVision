-- Secure admin RPCs for management panel.

create or replace function public.is_admin(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles
    where user_id = p_user_id
      and role = 'admin'
  );
$$;

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
set search_path = public, auth
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Acesso negado.';
  end if;

  return query
  select
    u.id as user_id,
    u.email,
    coalesce(p.role, 'user'::app_role) as role,
    u.created_at,
    u.email_confirmed_at,
    u.last_sign_in_at
  from auth.users u
  left join public.user_profiles p on p.user_id = u.id
  order by u.created_at desc;
end;
$$;

create or replace function public.admin_platform_metrics()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  total_users bigint;
  total_admins bigint;
  verified_users bigint;
  active_last_30d bigint;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Acesso negado.';
  end if;

  select count(*) into total_users from auth.users;

  select count(*) into total_admins
  from public.user_profiles
  where role = 'admin';

  select count(*) into verified_users
  from auth.users
  where email_confirmed_at is not null;

  select count(*) into active_last_30d
  from auth.users
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
set search_path = public, auth
as $$
declare
  requester_id uuid;
begin
  requester_id := auth.uid();

  if not public.is_admin(requester_id) then
    raise exception 'Acesso negado.';
  end if;

  if p_target_user_id is null then
    raise exception 'Usuário alvo inválido.';
  end if;

  if p_target_user_id = requester_id and p_new_role <> 'admin' then
    raise exception 'Você não pode remover seu próprio papel de admin.';
  end if;

  if not exists (select 1 from auth.users where id = p_target_user_id) then
    raise exception 'Usuário alvo não encontrado.';
  end if;

  insert into public.user_profiles (user_id, role)
  values (p_target_user_id, p_new_role)
  on conflict (user_id) do update set role = excluded.role;
end;
$$;

revoke all on function public.is_admin(uuid) from public;
revoke all on function public.admin_list_users() from public;
revoke all on function public.admin_platform_metrics() from public;
revoke all on function public.admin_set_user_role(uuid, app_role) from public;

grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_platform_metrics() to authenticated;
grant execute on function public.admin_set_user_role(uuid, app_role) to authenticated;
