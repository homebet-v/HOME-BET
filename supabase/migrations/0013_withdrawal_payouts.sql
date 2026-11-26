-- Structured payout data and cashier review. The previous five-argument submit stays for the deployed app.

alter table public.withdrawal_requests
  add column if not exists payout_method text not null default 'alias',
  add column if not exists holder_name text not null default '',
  add column if not exists bank_name text not null default '',
  add column if not exists account_number text not null default '',
  add column if not exists payout_identity text not null default '';

alter table public.withdrawal_requests drop constraint if exists withdrawal_requests_payout_method_check;
alter table public.withdrawal_requests
  add constraint withdrawal_requests_payout_method_check check (payout_method in ('alias', 'bank'));

do $$
declare constraint_name text;
begin
  select conname into constraint_name from pg_constraint
  where conrelid = 'public.withdrawal_requests'::regclass and contype = 'c'
    and pg_get_constraintdef(oid) like '%destination%';
  if constraint_name is not null then
    execute format('alter table public.withdrawal_requests drop constraint %I', constraint_name);
  end if;
end $$;

alter table public.withdrawal_requests
  add constraint withdrawal_requests_destination_check check (length(trim(destination)) between 4 and 240);

create function public.place_player_withdrawal(
  target_casino uuid, target_player uuid, target_id uuid, requested_amount bigint, payout text,
  payout_method text, holder text, bank text, account_number text, payout_identity text
) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  entry record;
  total_cents bigint := 0;
  withdrawable_cents bigint := 0;
  cleaned text := trim(regexp_replace(coalesce(payout, ''), '\s+', ' ', 'g'));
  cleaned_holder text := trim(regexp_replace(coalesce(holder, ''), '\s+', ' ', 'g'));
  cleaned_bank text := trim(regexp_replace(coalesce(bank, ''), '\s+', ' ', 'g'));
  cleaned_account text := regexp_replace(coalesce(account_number, ''), '\s+', '', 'g');
  cleaned_identity text := regexp_replace(coalesce(payout_identity, ''), '\s+', '', 'g');
begin
  if target_id is null or requested_amount is null or requested_amount not between 1 and 100000000
    or length(cleaned) not between 4 and 240
    or payout_method not in ('alias', 'bank')
    or (payout_method = 'alias' and not (
      cleaned_identity ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' and length(cleaned_identity) <= 80
      or cleaned_identity ~ '^\+?[0-9][0-9-]{3,19}$'
    ))
    or (payout_method = 'bank' and not (
      length(cleaned_holder) between 2 and 80
      and length(cleaned_bank) between 2 and 60
      and cleaned_account ~ '^[0-9-]{4,30}$'
      and cleaned_identity ~ '^[0-9]{4,12}$'
    ))
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

  insert into public.withdrawal_requests (
    id, casino_id, player_id, requested_cents, destination, payout_method, holder_name, bank_name, account_number, payout_identity
  ) values (
    target_id, target_casino, target_player, requested_amount, cleaned, payout_method,
    case when payout_method = 'bank' then cleaned_holder else '' end,
    case when payout_method = 'bank' then cleaned_bank else '' end,
    case when payout_method = 'bank' then cleaned_account else '' end,
    cleaned_identity
  );
end;
$$;

revoke all on function public.place_player_withdrawal(uuid, uuid, uuid, bigint, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.place_player_withdrawal(uuid, uuid, uuid, bigint, text, text, text, text, text, text) to service_role;

create function public.review_player_withdrawal(target_casino uuid, target_id uuid, actor_id uuid, decision text)
returns void
language plpgsql security invoker set search_path = '' as $$
declare
  request public.withdrawal_requests;
  entry record;
  total_cents bigint := 0;
  withdrawable_cents bigint := 0;
begin
  if decision not in ('pending', 'reviewing', 'accepted') or not exists (
    select 1 from public.profiles p
    join public.casinos c on c.id = target_casino and c.status = 'active'
    where p.id = actor_id and (p.role = 'superadmin' or (p.role = 'casino_admin' and p.casino_id = c.id))
  ) then raise exception 'Operation not authorized'; end if;

  select * into request from public.withdrawal_requests
  where id = target_id and casino_id = target_casino for update;
  if not found or request.status = 'rejected' then raise exception 'Operation not authorized'; end if;
  if request.status = 'accepted' then
    if decision = 'accepted' then return; end if;
    raise exception 'Withdrawal already paid';
  end if;

  if decision = 'accepted' then
    for entry in
      select kind, amount_cents from public.ledger_entries
      where casino_id = request.casino_id and player_id = request.player_id
      order by created_at, ledger_position
    loop
      total_cents := total_cents + entry.amount_cents;
      if (entry.kind = 'win' and entry.amount_cents > 0) or entry.kind = 'withdrawal' then
        withdrawable_cents := withdrawable_cents + entry.amount_cents;
      end if;
      withdrawable_cents := greatest(0, least(total_cents, withdrawable_cents));
    end loop;
    if request.requested_cents > withdrawable_cents then raise exception 'Withdrawal exceeds balance'; end if;
    insert into public.ledger_entries (casino_id, player_id, kind, amount_cents, adjustment_actor, adjustment_ref)
    values (request.casino_id, request.player_id, 'withdrawal', -request.requested_cents, actor_id, request.id);
  end if;

  update public.withdrawal_requests
  set status = decision, claimed_by = actor_id, reviewed_at = now()
  where id = request.id;
end;
$$;

revoke all on function public.review_player_withdrawal(uuid, uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.review_player_withdrawal(uuid, uuid, uuid, text) to service_role;
