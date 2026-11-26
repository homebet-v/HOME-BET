-- Materialize any CI accounts created while an older Auth trigger was deployed.
-- Only server-owned Auth metadata may bind the account to a house.
insert into public.profiles (id, casino_id, role, display_name, identity_number)
select u.id, c.id, 'player',
  nullif(left(trim(u.raw_user_meta_data ->> 'display_name'), 80), ''),
  case when u.raw_user_meta_data ->> 'identity_number' ~ '^[0-9]{5,15}$'
    then u.raw_user_meta_data ->> 'identity_number' end
from auth.users u
join public.casinos c on c.slug = u.raw_app_meta_data ->> 'player_casino_slug'
where u.email ~ '^[0-9a-f]{64}@players\.homebet\.example$'
on conflict (id) do nothing;

create function public.ensure_ci_player_profile(target_user uuid, target_casino uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, casino_id, role, display_name, identity_number)
  select u.id, c.id, 'player',
    nullif(left(trim(u.raw_user_meta_data ->> 'display_name'), 80), ''),
    case when u.raw_user_meta_data ->> 'identity_number' ~ '^[0-9]{5,15}$'
      then u.raw_user_meta_data ->> 'identity_number' end
  from auth.users u
  join public.casinos c on c.id = target_casino and c.status = 'active'
    and c.slug = u.raw_app_meta_data ->> 'player_casino_slug'
  where u.id = target_user and u.email ~ '^[0-9a-f]{64}@players\.homebet\.example$'
  on conflict (id) do nothing;

  return exists (
    select 1 from public.profiles
    where id = target_user and casino_id = target_casino and role = 'player'
  );
end;
$$;

revoke all on function public.ensure_ci_player_profile(uuid, uuid) from public, anon, authenticated;
grant execute on function public.ensure_ci_player_profile(uuid, uuid) to service_role;
