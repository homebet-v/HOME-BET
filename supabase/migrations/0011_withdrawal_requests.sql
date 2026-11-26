-- Player withdrawal requests. The ledger moves only when the house confirms the payout.

create table public.withdrawal_requests (
  id uuid primary key,
  casino_id uuid not null references public.casinos(id),
  player_id uuid not null,
  requested_cents bigint not null check (requested_cents between 1 and 100000000),
  destination text not null check (length(trim(destination)) between 4 and 120),
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'accepted', 'rejected')),
  claimed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  reason text not null default '',
  foreign key (player_id, casino_id) references public.profiles(id, casino_id)
);

create index withdrawal_requests_house_date_idx on public.withdrawal_requests (casino_id, created_at desc);
create unique index withdrawal_requests_one_open_idx
  on public.withdrawal_requests (casino_id, player_id)
  where status in ('pending', 'reviewing');

alter table public.withdrawal_requests enable row level security;
revoke all on public.withdrawal_requests from public, anon, authenticated, service_role;
grant select on public.withdrawal_requests to authenticated;
grant select, insert, update on public.withdrawal_requests to service_role;

create policy withdrawals_read on public.withdrawal_requests
  for select to authenticated
  using (player_id = auth.uid() or public.can_manage_house(casino_id));

create function public.submit_player_withdrawal(
  target_casino uuid, target_player uuid, target_id uuid, requested_amount bigint, payout text
) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  entry record;
  total_cents bigint := 0;
  withdrawable_cents bigint := 0;
  cleaned text := trim(regexp_replace(coalesce(payout, ''), '\s+', ' ', 'g'));
begin
  if target_id is null or requested_amount is null or requested_amount not between 1 and 100000000
    or length(cleaned) not between 4 and 120
    or not exists (
      select 1 from public.profiles p
      join public.casinos c on c.id = p.casino_id
      where p.id = target_player and p.casino_id = target_casino and p.role = 'player'
        and p.verified_at is not null and c.status = 'active'
    )
  then raise exception 'Operation not authorized'; end if;

  if exists (select 1 from public.withdrawal_requests where id = target_id) then
    if exists (
      select 1 from public.withdrawal_requests
      where id = target_id and casino_id = target_casino and player_id = target_player
        and requested_cents = requested_amount and destination = cleaned
    ) then return; end if;
    raise exception 'Operation not authorized';
  end if;

  if exists (
    select 1 from public.withdrawal_requests
    where casino_id = target_casino and player_id = target_player and status in ('pending', 'reviewing')
  ) then raise exception 'Open withdrawal'; end if;

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

  if requested_amount > withdrawable_cents then raise exception 'Withdrawal exceeds balance'; end if;

  insert into public.withdrawal_requests (id, casino_id, player_id, requested_cents, destination)
  values (target_id, target_casino, target_player, requested_amount, cleaned);
end;
$$;

revoke all on function public.submit_player_withdrawal(uuid, uuid, uuid, bigint, text) from public, anon, authenticated;
grant execute on function public.submit_player_withdrawal(uuid, uuid, uuid, bigint, text) to service_role;
