-- Player registration is initiated by the server. Auth metadata supplied by a
-- public signup no longer assigns a profile to a house.
create or replace function public.register_player_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_id uuid;
begin
  if new.raw_app_meta_data ->> 'player_casino_slug' is null then
    return new;
  end if;

  select id into target_id
  from public.casinos
  where slug = new.raw_app_meta_data ->> 'player_casino_slug' and status = 'active';

  if target_id is null then
    raise exception 'Casino unavailable';
  end if;

  insert into public.profiles (id, casino_id, role, display_name)
  values (new.id, target_id, 'player', nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 80), ''));
  return new;
end;
$$;
