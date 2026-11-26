-- Only server-controlled Auth metadata can assign administrative roles.
create function public.register_player_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_id uuid;
begin
  if new.raw_user_meta_data ->> 'casino_slug' is null then
    return new;
  end if;

  select id into target_id
  from public.casinos
  where slug = new.raw_user_meta_data ->> 'casino_slug' and status = 'active';

  if target_id is null then
    raise exception 'Casino unavailable';
  end if;

  insert into public.profiles (id, casino_id, role, display_name)
  values (new.id, target_id, 'player', nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 80), ''));
  return new;
end;
$$;

revoke all on function public.register_player_profile() from public, anon, authenticated;
create trigger register_player_profile
after insert on auth.users
for each row execute function public.register_player_profile();

-- The composite reference prevents attaching an entry to a player from another house.
alter table public.profiles add constraint profiles_id_casino_key unique (id, casino_id);
alter table public.ledger_entries add constraint ledger_player_casino_fk
  foreign key (player_id, casino_id) references public.profiles (id, casino_id);
create index ledger_player_idx on public.ledger_entries (player_id, created_at desc);

create function public.player_chip_balance()
returns bigint
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(sum(amount_cents), 0)::bigint
  from public.ledger_entries
  where player_id = auth.uid() and casino_id = public.current_casino_id();
$$;

revoke all on function public.player_chip_balance() from public, anon;
grant execute on function public.player_chip_balance() to authenticated;

alter table public.ledger_entries
  add column adjustment_ref uuid unique,
  add column adjustment_actor uuid references public.profiles (id);

create function public.credit_player_chips(
  target_casino uuid, target_player uuid, actor_id uuid, cents bigint, request_ref uuid
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if cents is null or cents <= 0 or cents > 100000000 or request_ref is null then
    raise exception 'Invalid amount or reference';
  end if;
  if not exists (
    select 1 from public.profiles a
    join public.casinos c on c.id = target_casino and c.status = 'active'
    where a.id = actor_id and (
      a.role = 'superadmin' or (a.role = 'casino_admin' and a.casino_id = c.id)
    )
  ) or not exists (
    select 1 from public.profiles
    where id = target_player and casino_id = target_casino and role = 'player'
  ) then
    raise exception 'Operation not authorized';
  end if;

  insert into public.ledger_entries (
    casino_id, player_id, amount_cents, kind, adjustment_ref, adjustment_actor
  ) values (target_casino, target_player, cents, 'adjustment', request_ref, actor_id)
  on conflict (adjustment_ref) do nothing;

  if not exists (
    select 1 from public.ledger_entries where adjustment_ref = request_ref
    and casino_id = target_casino and player_id = target_player
    and adjustment_actor = actor_id and amount_cents = cents
  ) then
    raise exception 'Conflicting adjustment reference';
  end if;
end;
$$;

revoke all on function public.credit_player_chips(uuid, uuid, uuid, bigint, uuid) from public, anon, authenticated;
grant execute on function public.credit_player_chips(uuid, uuid, uuid, bigint, uuid) to service_role;

create function public.publish_builtin_catalog(definitions jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if public.current_role() is distinct from 'superadmin' then
    raise exception 'Operation not authorized';
  end if;

  insert into public.games (slug, name, status)
  select distinct on (item.slug) item.slug, item.name, 'published'
  from jsonb_to_recordset(definitions) as item(slug text, name text, version text)
  order by item.slug
  on conflict (slug) do nothing;

  insert into public.game_versions (game_id, version, published_at)
  select distinct g.id, item.version, now()
  from jsonb_to_recordset(definitions) as item(slug text, name text, version text)
  join public.games g on g.slug = item.slug and g.status = 'published'
  on conflict (game_id, version) do nothing;
end;
$$;

revoke all on function public.publish_builtin_catalog(jsonb) from public, anon;
grant execute on function public.publish_builtin_catalog(jsonb) to authenticated;

create function public.set_house_game(target_game uuid, target_enabled boolean)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if public.current_role() is distinct from 'casino_admin' then
    raise exception 'Operation not authorized';
  end if;
  insert into public.casino_games (casino_id, game_id, enabled)
  values (public.current_casino_id(), target_game, target_enabled)
  on conflict (casino_id, game_id) do update set enabled = excluded.enabled;
end;
$$;

revoke all on function public.set_house_game(uuid, boolean) from public, anon;
grant execute on function public.set_house_game(uuid, boolean) to authenticated;
