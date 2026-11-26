alter table public.profiles
  add column verified_at timestamptz,
  add column verified_by uuid references public.profiles (id);

-- CI accounts can exist in Auth without a profile if the old trigger was still installed.
insert into public.profiles (id, casino_id, role, display_name)
select u.id, c.id, 'player', nullif(left(trim(u.raw_user_meta_data ->> 'display_name'), 80), '')
from auth.users u
join public.casinos c on c.slug = u.raw_app_meta_data ->> 'player_casino_slug'
where u.email ~ '^[0-9a-f]{64}@players\.homebet\.example$'
on conflict (id) do nothing;

create function public.verify_house_player(target_player uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.current_role() is distinct from 'casino_admin' then
    return false;
  end if;

  update public.profiles
  set verified_at = now(), verified_by = auth.uid()
  where id = target_player
    and casino_id = public.current_casino_id()
    and role = 'player'
    and verified_at is null;
  return found;
end;
$$;

revoke all on function public.verify_house_player(uuid) from public, anon;
grant execute on function public.verify_house_player(uuid) to authenticated;
