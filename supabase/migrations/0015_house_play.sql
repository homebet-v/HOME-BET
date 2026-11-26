-- House play spends the loaded balance. Demo chips stay in the workshop.
-- A positive adjustment does not restore withdrawable chips, so prizes are wins.

create table public.player_slot_states (
  casino_id uuid not null,
  player_id uuid not null,
  game_id uuid not null,
  free_spins integer not null default 0 check (free_spins between 0 and 5),
  feature_bet_cents bigint not null default 0 check (feature_bet_cents >= 0),
  feature_rtp_bps integer not null default 9600 check (feature_rtp_bps between 8000 and 9800),
  pending_bonus_cents bigint check (pending_bonus_cents is null or pending_bonus_cents > 0),
  primary key (casino_id, player_id, game_id),
  foreign key (player_id, casino_id) references public.profiles (id, casino_id),
  foreign key (game_id) references public.games (id)
);

alter table public.player_slot_states enable row level security;
revoke all on public.player_slot_states from public, anon, authenticated, service_role;
grant select on public.player_slot_states to service_role;

alter table public.game_rounds
  add column bet_cents bigint not null default 0 check (bet_cents >= 0),
  add column payout_cents bigint not null default 0 check (payout_cents >= 0),
  add column detail jsonb not null default '{}'::jsonb;

create function public.settle_house_slot(
  target_casino uuid, target_player uuid, target_game uuid, target_version uuid, target_round uuid,
  stake_cents bigint, payout_cents bigint, expected_free integer, expected_pending bigint,
  next_free integer, next_feature_bet bigint, next_feature_rtp integer, next_pending bigint, round_detail jsonb
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  state public.player_slot_states;
  stored jsonb;
  entry record;
  total_cents bigint := 0;
  withdrawable_cents bigint := 0;
  played bigint;
  result jsonb;
begin
  if target_round is null or stake_cents is null or stake_cents < 0 or payout_cents is null or payout_cents < 0
    or next_free is null or next_free not between 0 and 5
    or next_feature_bet is null or next_feature_bet < 0
    or next_feature_rtp is null or next_feature_rtp not between 8000 and 9800
    or (next_pending is not null and next_pending < 1)
    or round_detail is null or octet_length(round_detail::text) > 48000
    or not exists (
      select 1 from public.profiles p
      join public.casinos c on c.id = p.casino_id
      where p.id = target_player and p.casino_id = target_casino and p.role = 'player'
        and p.verified_at is not null and c.status = 'active'
    ) or not exists (
      select 1 from public.games g
      join public.game_versions v on v.game_id = g.id and v.id = target_version
      join public.casino_games cg on cg.game_id = g.id and cg.casino_id = target_casino and cg.enabled
      where g.id = target_game and g.status = 'published'
    )
  then raise exception 'Operación no autorizada'; end if;

  select detail into stored from public.game_rounds
  where id = target_round and casino_id = target_casino and player_id = target_player and game_id = target_game;
  if found then return stored; end if;
  if exists (select 1 from public.game_rounds where id = target_round) then raise exception 'Operación no autorizada'; end if;

  perform 1 from public.profiles where id = target_player and casino_id = target_casino for update;
  insert into public.player_slot_states (casino_id, player_id, game_id)
  values (target_casino, target_player, target_game)
  on conflict do nothing;
  select * into state from public.player_slot_states
  where casino_id = target_casino and player_id = target_player and game_id = target_game
  for update;

  if state.free_spins is distinct from expected_free or state.pending_bonus_cents is distinct from expected_pending then
    raise exception 'La jugada cambió. Probá de nuevo.';
  end if;
  if state.pending_bonus_cents is not null then raise exception 'Elegí el premio del bono antes de girar.'; end if;

  played := case when state.free_spins > 0 then state.feature_bet_cents else stake_cents end;
  if state.free_spins > 0 and stake_cents <> 0 then raise exception 'Operación no autorizada'; end if;
  if state.free_spins = 0 and stake_cents not in (1000, 2500, 5000, 10000, 25000, 50000) then raise exception 'Apuesta no permitida.'; end if;
  if played not in (1000, 2500, 5000, 10000, 25000, 50000) then raise exception 'Apuesta no permitida.'; end if;
  if (round_detail->>'betCents')::bigint is distinct from played
    or (round_detail->>'payoutCents')::bigint is distinct from payout_cents
    or (round_detail->>'isFree')::boolean is distinct from (state.free_spins > 0)
  then raise exception 'Operación no autorizada'; end if;
  if payout_cents > played * 20000 then raise exception 'El premio supera el máximo.'; end if;
  if state.free_spins = 0 and next_free = 5 then
    if next_feature_bet <> stake_cents or next_feature_rtp <> 9600 then raise exception 'Operación no autorizada'; end if;
  elsif next_feature_bet <> state.feature_bet_cents or next_feature_rtp <> state.feature_rtp_bps then
    raise exception 'Operación no autorizada';
  end if;
  if state.free_spins = 0 and next_free not in (0, 5) then raise exception 'Operación no autorizada'; end if;
  if state.free_spins > 0 and next_free <> state.free_spins - 1 then raise exception 'Operación no autorizada'; end if;
  if next_pending is not null and (state.free_spins > 0 or payout_cents <> 0 or next_free <> 0 or next_pending > stake_cents * 5) then
    raise exception 'Operación no autorizada';
  end if;

  for entry in
    select kind, amount_cents from public.ledger_entries
    where casino_id = target_casino and player_id = target_player
    order by created_at, ledger_position
  loop
    total_cents := total_cents + entry.amount_cents;
    if (entry.kind = 'win' and entry.amount_cents > 0) or entry.kind = 'withdrawal' then
      withdrawable_cents := withdrawable_cents + entry.amount_cents;
    end if;
    withdrawable_cents := greatest(0, least(total_cents, withdrawable_cents));
  end loop;
  if stake_cents > total_cents then raise exception 'No hay fichas suficientes.'; end if;

  total_cents := total_cents - stake_cents + payout_cents;
  result := jsonb_build_object(
    'balanceCents', total_cents,
    'freeSpins', next_free,
    'featureBetCents', next_feature_bet,
    'featureRtpBps', next_feature_rtp,
    'pendingBonusCents', next_pending,
    'lastRound', round_detail
  );

  insert into public.game_rounds (id, casino_id, player_id, game_id, game_version_id, status, bet_cents, payout_cents, detail)
  values (target_round, target_casino, target_player, target_game, target_version, 'settled', stake_cents, payout_cents, result);
  if stake_cents > 0 then
    insert into public.ledger_entries (casino_id, player_id, game_round_id, kind, amount_cents)
    values (target_casino, target_player, target_round, 'stake', -stake_cents);
  end if;
  if payout_cents > 0 then
    insert into public.ledger_entries (casino_id, player_id, game_round_id, kind, amount_cents)
    values (target_casino, target_player, target_round, 'win', payout_cents);
  end if;
  update public.player_slot_states
  set free_spins = next_free, feature_bet_cents = next_feature_bet, feature_rtp_bps = next_feature_rtp, pending_bonus_cents = next_pending
  where casino_id = target_casino and player_id = target_player and game_id = target_game;
  return result;
end;
$$;

revoke all on function public.settle_house_slot(uuid, uuid, uuid, uuid, uuid, bigint, bigint, integer, bigint, integer, bigint, integer, bigint, jsonb) from public, anon, authenticated;
grant execute on function public.settle_house_slot(uuid, uuid, uuid, uuid, uuid, bigint, bigint, integer, bigint, integer, bigint, integer, bigint, jsonb) to service_role;

create function public.settle_house_bonus(
  target_casino uuid, target_player uuid, target_game uuid, target_version uuid, target_round uuid, round_detail jsonb
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  state public.player_slot_states;
  stored jsonb;
  payout_cents bigint;
  entry record;
  total_cents bigint := 0;
  withdrawable_cents bigint := 0;
  result jsonb;
begin
  if target_round is null or round_detail is null or octet_length(round_detail::text) > 48000
    or not exists (
      select 1 from public.profiles p
      join public.casinos c on c.id = p.casino_id
      where p.id = target_player and p.casino_id = target_casino and p.role = 'player'
        and p.verified_at is not null and c.status = 'active'
    ) or not exists (
      select 1 from public.games g
      join public.game_versions v on v.game_id = g.id and v.id = target_version
      join public.casino_games cg on cg.game_id = g.id and cg.casino_id = target_casino and cg.enabled
      where g.id = target_game and g.status = 'published'
    )
  then raise exception 'Operación no autorizada'; end if;

  select detail into stored from public.game_rounds
  where id = target_round and casino_id = target_casino and player_id = target_player and game_id = target_game;
  if found then return stored; end if;
  if exists (select 1 from public.game_rounds where id = target_round) then raise exception 'Operación no autorizada'; end if;

  perform 1 from public.profiles where id = target_player and casino_id = target_casino for update;
  select * into state from public.player_slot_states
  where casino_id = target_casino and player_id = target_player and game_id = target_game
  for update;
  if not found or state.pending_bonus_cents is null then raise exception 'No hay un bono pendiente de cobrar.'; end if;
  payout_cents := state.pending_bonus_cents;
  if (round_detail->>'payoutCents')::bigint is distinct from payout_cents then raise exception 'Operación no autorizada'; end if;

  for entry in
    select kind, amount_cents from public.ledger_entries
    where casino_id = target_casino and player_id = target_player
    order by created_at, ledger_position
  loop
    total_cents := total_cents + entry.amount_cents;
    if (entry.kind = 'win' and entry.amount_cents > 0) or entry.kind = 'withdrawal' then
      withdrawable_cents := withdrawable_cents + entry.amount_cents;
    end if;
    withdrawable_cents := greatest(0, least(total_cents, withdrawable_cents));
  end loop;
  total_cents := total_cents + payout_cents;
  result := jsonb_build_object(
    'balanceCents', total_cents,
    'freeSpins', state.free_spins,
    'featureBetCents', state.feature_bet_cents,
    'featureRtpBps', state.feature_rtp_bps,
    'pendingBonusCents', null,
    'lastRound', round_detail
  );
  insert into public.game_rounds (id, casino_id, player_id, game_id, game_version_id, status, bet_cents, payout_cents, detail)
  values (target_round, target_casino, target_player, target_game, target_version, 'settled', 0, payout_cents, result);
  insert into public.ledger_entries (casino_id, player_id, game_round_id, kind, amount_cents)
  values (target_casino, target_player, target_round, 'win', payout_cents);
  update public.player_slot_states set pending_bonus_cents = null
  where casino_id = target_casino and player_id = target_player and game_id = target_game;
  return result;
end;
$$;

revoke all on function public.settle_house_bonus(uuid, uuid, uuid, uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.settle_house_bonus(uuid, uuid, uuid, uuid, uuid, jsonb) to service_role;

create function public.settle_house_roulette(
  target_casino uuid, target_player uuid, target_game uuid, target_version uuid, target_round uuid,
  stake_cents bigint, payout_cents bigint, round_detail jsonb
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  stored jsonb;
  entry record;
  total_cents bigint := 0;
  withdrawable_cents bigint := 0;
  result jsonb;
begin
  if target_round is null or stake_cents is null or stake_cents < 1 or stake_cents > 10000000
    or payout_cents is null or payout_cents < 0 or payout_cents > stake_cents * 250
    or round_detail is null or octet_length(round_detail::text) > 48000
    or (round_detail->>'stakeCents')::bigint is distinct from stake_cents
    or (round_detail->>'payoutCents')::bigint is distinct from payout_cents
    or (round_detail->>'number')::integer not between 0 and 36
    or not exists (
      select 1 from public.profiles p
      join public.casinos c on c.id = p.casino_id
      where p.id = target_player and p.casino_id = target_casino and p.role = 'player'
        and p.verified_at is not null and c.status = 'active'
    ) or not exists (
      select 1 from public.games g
      join public.game_versions v on v.game_id = g.id and v.id = target_version
      join public.casino_games cg on cg.game_id = g.id and cg.casino_id = target_casino and cg.enabled
      where g.id = target_game and g.status = 'published'
    )
  then raise exception 'Operación no autorizada'; end if;

  select detail into stored from public.game_rounds
  where id = target_round and casino_id = target_casino and player_id = target_player and game_id = target_game;
  if found then return stored; end if;
  if exists (select 1 from public.game_rounds where id = target_round) then raise exception 'Operación no autorizada'; end if;

  perform 1 from public.profiles where id = target_player and casino_id = target_casino for update;
  for entry in
    select kind, amount_cents from public.ledger_entries
    where casino_id = target_casino and player_id = target_player
    order by created_at, ledger_position
  loop
    total_cents := total_cents + entry.amount_cents;
    if (entry.kind = 'win' and entry.amount_cents > 0) or entry.kind = 'withdrawal' then
      withdrawable_cents := withdrawable_cents + entry.amount_cents;
    end if;
    withdrawable_cents := greatest(0, least(total_cents, withdrawable_cents));
  end loop;
  if stake_cents > total_cents then raise exception 'No hay fichas suficientes.'; end if;
  total_cents := total_cents - stake_cents + payout_cents;
  result := jsonb_build_object('balanceCents', total_cents, 'lastRound', round_detail);
  insert into public.game_rounds (id, casino_id, player_id, game_id, game_version_id, status, bet_cents, payout_cents, detail)
  values (target_round, target_casino, target_player, target_game, target_version, 'settled', stake_cents, payout_cents, result);
  insert into public.ledger_entries (casino_id, player_id, game_round_id, kind, amount_cents)
  values (target_casino, target_player, target_round, 'stake', -stake_cents);
  if payout_cents > 0 then
    insert into public.ledger_entries (casino_id, player_id, game_round_id, kind, amount_cents)
    values (target_casino, target_player, target_round, 'win', payout_cents);
  end if;
  return result;
end;
$$;

revoke all on function public.settle_house_roulette(uuid, uuid, uuid, uuid, uuid, bigint, bigint, jsonb) from public, anon, authenticated;
grant execute on function public.settle_house_roulette(uuid, uuid, uuid, uuid, uuid, bigint, bigint, jsonb) to service_role;
