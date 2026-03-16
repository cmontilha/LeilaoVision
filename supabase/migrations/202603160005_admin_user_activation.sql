-- Add account activation controls for admin panel.

alter table public.user_profiles
  add column if not exists is_active boolean not null default true,
  add column if not exists deactivated_at timestamptz,
  add column if not exists deactivated_reason text;

update public.user_profiles
set is_active = true
where is_active is null;

create or replace function public.admin_list_users_v2()
returns table (
  user_id uuid,
  email text,
  role app_role,
  is_active boolean,
  deactivated_at timestamptz,
  deactivated_reason text,
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
    coalesce(p.is_active, true) as is_active,
    p.deactivated_at,
    p.deactivated_reason,
    coalesce(p.auth_created_at, p.created_at) as created_at,
    p.email_confirmed_at,
    p.last_sign_in_at
  from public.user_profiles p
  order by coalesce(p.auth_created_at, p.created_at) desc;
end;
$$;

create or replace function public.admin_set_user_active(
  p_target_user_id uuid,
  p_is_active boolean,
  p_reason text default null
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

  if p_target_user_id = requester_id and p_is_active = false then
    raise exception 'Você não pode inativar sua própria conta.';
  end if;

  if not exists (select 1 from public.user_profiles where user_id = p_target_user_id) then
    raise exception 'Usuário alvo não encontrado.';
  end if;

  update public.user_profiles
  set
    is_active = p_is_active,
    deactivated_at = case when p_is_active then null else timezone('utc'::text, now()) end,
    deactivated_reason = case
      when p_is_active then null
      when p_reason is null then null
      when btrim(p_reason) = '' then null
      else left(btrim(p_reason), 300)
    end
  where user_id = p_target_user_id;
end;
$$;

revoke all on function public.admin_list_users_v2() from public;
revoke all on function public.admin_set_user_active(uuid, boolean, text) from public;

grant execute on function public.admin_list_users_v2() to authenticated;
grant execute on function public.admin_set_user_active(uuid, boolean, text) to authenticated;
