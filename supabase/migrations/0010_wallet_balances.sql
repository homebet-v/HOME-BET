alter table public.ledger_entries
  add column ledger_position bigint generated always as identity;
create index ledger_wallet_order_idx
  on public.ledger_entries (casino_id, player_id, created_at, ledger_position);

alter table public.ledger_entries drop constraint ledger_entries_kind_check;
alter table public.ledger_entries add constraint ledger_entries_kind_check
  check (kind in ('stake', 'win', 'adjustment') or (kind = 'withdrawal' and amount_cents < 0));

create function public.read_player_wallet(target_casino uuid, target_player uuid)
returns table (total_cents bigint, withdrawable_cents bigint)
language plpgsql stable security invoker set search_path = '' as $$
declare
  entry record;
begin
  if not (public.can_manage_house(target_casino) or coalesce(
    target_player = auth.uid() and target_casino = public.current_casino_id(), false
  )) then return; end if;

  total_cents := 0;
  withdrawable_cents := 0;
  for entry in
    select kind, amount_cents
    from public.ledger_entries
    where casino_id = target_casino and player_id = target_player
    order by created_at, ledger_position
  loop
    total_cents := total_cents + entry.amount_cents;
    if (entry.kind = 'win' and entry.amount_cents > 0) or entry.kind = 'withdrawal' then
      withdrawable_cents := withdrawable_cents + entry.amount_cents;
    end if;
    -- Stakes consume restricted credits first. Only the part that takes the
    -- remaining total below the previous withdrawable balance reduces it.
    withdrawable_cents := greatest(0, least(total_cents, withdrawable_cents));
  end loop;
  return next;
end;
$$;

revoke all on function public.read_player_wallet(uuid, uuid) from public, anon;
grant execute on function public.read_player_wallet(uuid, uuid) to authenticated;

drop function public.house_player_directory(uuid);
create function public.house_player_directory(target_casino uuid)
returns table (
  id uuid, display_name text, identity_number text, identity_details jsonb,
  verification_decision text, verification_reason text, verification_submitted_at timestamptz,
  created_at timestamptz, verified_at timestamptz, last_sign_in_at timestamptz,
  balance_cents bigint, withdrawable_cents bigint
)
language sql stable security definer set search_path = '' as $$
  select p.id, p.display_name, p.identity_number, p.identity_details,
    p.verification_decision, p.verification_reason, p.verification_submitted_at,
    p.created_at, p.verified_at, u.last_sign_in_at, w.total_cents, w.withdrawable_cents
  from public.profiles p
  join auth.users u on u.id = p.id
  cross join lateral public.read_player_wallet(p.casino_id, p.id) w
  where public.can_manage_house(target_casino) and p.casino_id = target_casino and p.role = 'player'
  order by p.created_at desc, p.id desc;
$$;

revoke all on function public.house_player_directory(uuid) from public, anon;
grant execute on function public.house_player_directory(uuid) to authenticated;
