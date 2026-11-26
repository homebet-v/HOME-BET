create function public.assign_house_admin(target_casino uuid, admin_email text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user uuid;
  assigned_role text;
  assigned_casino uuid;
begin
  if public.current_role() is distinct from 'superadmin' then
    raise exception 'Operation not authorized';
  end if;

  if not exists (select 1 from public.casinos where id = target_casino) then
    return 'house_not_found';
  end if;

  begin
    select id into strict target_user
    from auth.users
    where lower(email) = lower(trim(admin_email)) and is_sso_user is not true;
  exception when no_data_found then
    return 'user_not_found';
  end;

  insert into public.profiles (id, role, casino_id)
  values (target_user, 'casino_admin', target_casino)
  on conflict (id) do nothing;

  select role, casino_id into assigned_role, assigned_casino
  from public.profiles
  where id = target_user;

  if assigned_role = 'casino_admin' and assigned_casino = target_casino then
    return 'assigned';
  end if;
  return 'role_conflict';
end;
$$;

revoke all on function public.assign_house_admin(uuid, text) from public, anon;
grant execute on function public.assign_house_admin(uuid, text) to authenticated;

drop function public.verify_house_player(uuid);

create function public.verify_house_player(target_casino uuid, target_player uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not coalesce(
    public.current_role() = 'superadmin' or
    (public.current_role() = 'casino_admin' and public.current_casino_id() = target_casino),
    false
  ) then
    return false;
  end if;

  update public.profiles
  set verified_at = now(), verified_by = auth.uid()
  where id = target_player
    and casino_id = target_casino
    and role = 'player'
    and verified_at is null
    and exists (select 1 from public.casinos where id = target_casino and status = 'active');
  return found;
end;
$$;

revoke all on function public.verify_house_player(uuid, uuid) from public, anon;
grant execute on function public.verify_house_player(uuid, uuid) to authenticated;

drop function public.set_house_game(uuid, boolean);

create function public.set_house_game(target_casino uuid, target_game uuid, target_enabled boolean)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not coalesce(
    public.current_role() = 'superadmin' or
    (public.current_role() = 'casino_admin' and public.current_casino_id() = target_casino),
    false
  ) or not exists (
    select 1 from public.casinos where id = target_casino and status = 'active'
  ) or not exists (
    select 1 from public.games where id = target_game and status = 'published'
  ) then
    raise exception 'Operation not authorized';
  end if;

  insert into public.casino_games (casino_id, game_id, enabled)
  values (target_casino, target_game, target_enabled)
  on conflict (casino_id, game_id) do update set enabled = excluded.enabled;
end;
$$;

revoke all on function public.set_house_game(uuid, uuid, boolean) from public, anon;
grant execute on function public.set_house_game(uuid, uuid, boolean) to authenticated;
