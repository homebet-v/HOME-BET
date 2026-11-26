alter table public.profiles
  add column identity_number text check (identity_number ~ '^[0-9]{5,15}$'),
  add column identity_details jsonb not null default '{}',
  add column identity_files jsonb not null default '{}',
  add column verification_decision text not null default 'pending' check (verification_decision in ('pending', 'denied', 'rejected')),
  add column verification_reason text not null default '',
  add column verification_submitted_at timestamptz;

create or replace function public.register_player_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  target_id uuid;
  ci text := new.raw_user_meta_data ->> 'identity_number';
begin
  if new.raw_app_meta_data ->> 'player_casino_slug' is null then return new; end if;
  select id into target_id from public.casinos
  where slug = new.raw_app_meta_data ->> 'player_casino_slug' and status = 'active';
  if target_id is null then raise exception 'Casino unavailable'; end if;
  insert into public.profiles (id, casino_id, role, display_name, identity_number)
  values (new.id, target_id, 'player', nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 80), ''),
    case when ci ~ '^[0-9]{5,15}$' then ci else null end);
  return new;
end;
$$;

create function public.can_manage_house(target_casino uuid)
returns boolean language sql stable security invoker set search_path = '' as $$
  select coalesce(public.current_role() = 'superadmin' or
    (public.current_role() = 'casino_admin' and public.current_casino_id() = target_casino), false);
$$;
revoke all on function public.can_manage_house(uuid) from public, anon;
grant execute on function public.can_manage_house(uuid) to authenticated;

create function public.house_player_directory(target_casino uuid)
returns table (
  id uuid, display_name text, identity_number text, identity_details jsonb,
  verification_decision text, verification_reason text, verification_submitted_at timestamptz,
  created_at timestamptz, verified_at timestamptz, last_sign_in_at timestamptz, balance_cents bigint
)
language sql stable security definer set search_path = '' as $$
  select p.id, p.display_name, p.identity_number, p.identity_details,
    p.verification_decision, p.verification_reason, p.verification_submitted_at,
    p.created_at, p.verified_at, u.last_sign_in_at,
    coalesce((select sum(l.amount_cents) from public.ledger_entries l
      where l.casino_id = target_casino and l.player_id = p.id), 0)::bigint
  from public.profiles p join auth.users u on u.id = p.id
  where public.can_manage_house(target_casino) and p.casino_id = target_casino and p.role = 'player'
  order by p.created_at desc, p.id desc;
$$;
revoke all on function public.house_player_directory(uuid) from public, anon;
grant execute on function public.house_player_directory(uuid) to authenticated;

create function public.update_house_player_details(target_casino uuid, target_player uuid, details jsonb)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if not public.can_manage_house(target_casino) or jsonb_typeof(details) is distinct from 'object'
    or length(details::text) > 1600 or length(trim(coalesce(details ->> 'firstName', ''))) not between 1 and 254
    or length(trim(coalesce(details ->> 'lastName', ''))) not between 1 and 254
  then return false; end if;
  update public.profiles set identity_details = details,
    display_name = trim(concat_ws(' ', details ->> 'firstName', details ->> 'lastName'))
  where id = target_player and casino_id = target_casino and role = 'player';
  return found;
end;
$$;
revoke all on function public.update_house_player_details(uuid, uuid, jsonb) from public, anon;
grant execute on function public.update_house_player_details(uuid, uuid, jsonb) to authenticated;

create function public.review_house_player(target_casino uuid, target_player uuid, decision text, reason text)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if not public.can_manage_house(target_casino) or decision is null or decision not in ('verified', 'denied', 'rejected')
    or length(coalesce(reason, '')) > 1000 or (decision <> 'verified' and trim(coalesce(reason, '')) = '')
    or not exists (select 1 from public.casinos where id = target_casino and status = 'active')
  then return false; end if;

  update public.profiles set
    verified_at = case when decision = 'verified' then coalesce(verified_at, now()) end,
    verified_by = case when decision = 'verified' then auth.uid() end,
    verification_decision = case when decision = 'verified' then 'pending' else decision end,
    verification_reason = trim(coalesce(reason, ''))
  where id = target_player and casino_id = target_casino and role = 'player'
    and (decision <> 'verified' or verified_at is not null or
      (verification_submitted_at is not null and verification_decision = 'pending'
        and identity_files ?& array['front','back','selfie']));
  return found;
end;
$$;
revoke execute on function public.verify_house_player(uuid, uuid) from authenticated;
revoke all on function public.review_house_player(uuid, uuid, text, text) from public, anon;
grant execute on function public.review_house_player(uuid, uuid, text, text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('house-documents', 'house-documents', false, 3000000, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create function public.submit_player_identity(target_casino uuid, target_player uuid, details jsonb, files jsonb)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  update public.profiles set identity_details = details, identity_files = files,
    display_name = trim(concat_ws(' ', details ->> 'firstName', details ->> 'lastName')),
    verification_decision = 'pending', verification_reason = '', verification_submitted_at = now()
  where id = target_player and casino_id = target_casino and role = 'player'
    and verified_at is null and verification_decision <> 'rejected' and
    (verification_submitted_at is null or verification_decision = 'denied');
  return found;
end;
$$;
revoke all on function public.submit_player_identity(uuid, uuid, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.submit_player_identity(uuid, uuid, jsonb, jsonb) to service_role;

create table public.deposit_bonuses (
  id uuid primary key default gen_random_uuid(),
  casino_id uuid not null references public.casinos(id),
  name text not null check (length(trim(name)) between 1 and 70),
  kind text not null check (kind in ('fixed','percentage')),
  amount bigint not null check (amount > 0 and (kind = 'fixed' or amount <= 10000)),
  minimum_cents bigint not null check (minimum_cents > 0),
  maximum_cents bigint check (maximum_cents >= minimum_cents),
  cap_cents bigint not null check (cap_cents between 1 and 100000000),
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  unique (id, casino_id)
);

create table public.deposit_requests (
  id uuid primary key default gen_random_uuid(),
  casino_id uuid not null references public.casinos(id),
  player_id uuid not null,
  requested_cents bigint not null check (requested_cents between 1 and 100000000),
  receipt_path text not null,
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','reviewing','accepted','rejected')),
  claimed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  reason text not null default '',
  bonus_id uuid,
  bonus_cents bigint not null default 0 check (bonus_cents >= 0),
  foreign key (player_id, casino_id) references public.profiles(id, casino_id),
  foreign key (bonus_id, casino_id) references public.deposit_bonuses(id, casino_id)
);
create index deposit_requests_house_date_idx on public.deposit_requests (casino_id, created_at desc);
alter table public.deposit_requests enable row level security;
alter table public.deposit_bonuses enable row level security;
revoke all on public.deposit_requests, public.deposit_bonuses from public, anon, authenticated, service_role;
grant select on public.deposit_requests, public.deposit_bonuses to authenticated;
grant select, insert, update on public.deposit_requests, public.deposit_bonuses to service_role;
grant insert on public.deposit_bonuses to authenticated;
create policy deposits_read on public.deposit_requests for select to authenticated
using (player_id = auth.uid() or public.can_manage_house(casino_id));
create policy bonus_read on public.deposit_bonuses for select to authenticated
using (public.can_manage_house(casino_id) or (casino_id = public.current_casino_id() and now() >= starts_at and now() < ends_at));
create policy bonus_create on public.deposit_bonuses for insert to authenticated
with check (public.can_manage_house(casino_id));

create function public.submit_player_deposit(
  target_casino uuid, target_player uuid, target_id uuid, requested_amount bigint, receipt text, bonus uuid
)
returns void language plpgsql security invoker set search_path = '' as $$
declare
  reward bigint := 0;
  rule public.deposit_bonuses;
  submitted_at timestamptz := now();
begin
  if requested_amount is null or requested_amount not between 1 and 100000000 or receipt is null
    or not exists (select 1 from public.profiles p join public.casinos c on c.id = p.casino_id
    where p.id = target_player and p.casino_id = target_casino and p.role = 'player'
      and p.verified_at is not null and c.status = 'active')
    or receipt not like target_casino::text || '/' || target_player::text || '/deposits/' || target_id::text || '.%'
  then raise exception 'Operation not authorized'; end if;

  if bonus is not null then
    select * into rule from public.deposit_bonuses b
    where b.id = bonus and b.casino_id = target_casino and submitted_at >= b.starts_at and submitted_at < b.ends_at
      and requested_amount >= b.minimum_cents and (b.maximum_cents is null or requested_amount <= b.maximum_cents);
    if not found then raise exception 'Invalid deposit bonus'; end if;
    reward := least(rule.cap_cents, case when rule.kind = 'fixed' then rule.amount else requested_amount * rule.amount / 10000 end);
  end if;

  insert into public.deposit_requests (id, casino_id, player_id, requested_cents, receipt_path, created_at, bonus_id, bonus_cents)
  values (target_id, target_casino, target_player, requested_amount, receipt, submitted_at, bonus, reward);
end;
$$;
revoke all on function public.submit_player_deposit(uuid, uuid, uuid, bigint, text, uuid) from public, anon, authenticated;
grant execute on function public.submit_player_deposit(uuid, uuid, uuid, bigint, text, uuid) to service_role;

alter table public.ledger_entries add column deposit_id uuid unique references public.deposit_requests(id);

create function public.review_player_deposit(target_casino uuid, target_id uuid, actor_id uuid, decision text, explanation text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare
  request public.deposit_requests;
begin
  if decision is null or not exists (
    select 1 from public.profiles p join public.casinos c on c.id = target_casino and c.status = 'active'
    where p.id = actor_id and (p.role = 'superadmin' or (p.role = 'casino_admin' and p.casino_id = c.id))
  ) then return false; end if;

  select * into request from public.deposit_requests
  where id = target_id and casino_id = target_casino for update;
  if not found then return false; end if;
  if request.status in ('accepted','rejected') then
    return request.status = decision and request.claimed_by = actor_id;
  end if;
  if request.status = 'reviewing' and request.claimed_by <> actor_id then return false; end if;
  if decision = 'reviewing' then
    update public.deposit_requests set status = 'reviewing', claimed_by = actor_id where id = target_id;
    return true;
  end if;
  if decision = 'accepted' then
    insert into public.ledger_entries (casino_id, player_id, kind, amount_cents, adjustment_actor, deposit_id)
    values (target_casino, request.player_id, 'adjustment', request.requested_cents + request.bonus_cents, actor_id, target_id);
  elsif decision <> 'rejected' or length(trim(coalesce(explanation, ''))) not between 1 and 1000 then
    return false;
  end if;

  update public.deposit_requests
  set status = decision, claimed_by = actor_id, reviewed_at = now(),
    reason = case when decision = 'rejected' then trim(explanation) else '' end
  where id = target_id;
  return true;
end;
$$;
revoke all on function public.review_player_deposit(uuid, uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.review_player_deposit(uuid, uuid, uuid, text, text) to service_role;

create function public.record_player_ci(target_casino uuid, target_player uuid, ci text)
returns void language sql security invoker set search_path = '' as $$
  update public.profiles set identity_number = ci
  where id = target_player and casino_id = target_casino and role = 'player' and identity_number is null;
$$;
revoke all on function public.record_player_ci(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.record_player_ci(uuid, uuid, text) to service_role;

create table public.cashier_plans (
  id uuid primary key default gen_random_uuid(),
  casino_id uuid not null references public.casinos(id),
  name text not null check (length(trim(name)) between 1 and 80),
  email text not null check (length(email) between 3 and 254),
  mode text not null check (mode in ('internal','external','affiliate')),
  business_name text,
  agreement text,
  access_price_pyg bigint check (access_price_pyg > 0),
  chip_limit bigint check (chip_limit > 0),
  created_at timestamptz not null default now(),
  unique (casino_id, email),
  check (mode = 'internal' or chip_limit is not null),
  check (mode <> 'affiliate' or (length(trim(coalesce(business_name, ''))) > 0 and access_price_pyg is not null))
);
alter table public.cashier_plans enable row level security;
revoke all on public.cashier_plans from public, anon, authenticated, service_role;
grant select, insert, update on public.cashier_plans to authenticated;
create policy cashier_plans_read on public.cashier_plans for select to authenticated
using (public.can_manage_house(casino_id));
create policy cashier_plans_create on public.cashier_plans for insert to authenticated
with check (public.can_manage_house(casino_id));
create policy cashier_plans_update on public.cashier_plans for update to authenticated
using (public.can_manage_house(casino_id))
with check (public.can_manage_house(casino_id));

create function public.upsert_cashier_plan(target_casino uuid, plan jsonb)
returns void language sql security invoker set search_path = '' as $$
  insert into public.cashier_plans (casino_id, name, email, mode, business_name, agreement, access_price_pyg, chip_limit)
  values (target_casino, plan ->> 'name', plan ->> 'email', plan ->> 'mode', plan ->> 'business_name',
    plan ->> 'agreement', (plan ->> 'access_price_pyg')::bigint, (plan ->> 'chip_limit')::bigint)
  on conflict (casino_id, email) do update set name = excluded.name, mode = excluded.mode,
    business_name = excluded.business_name, agreement = excluded.agreement,
    access_price_pyg = excluded.access_price_pyg, chip_limit = excluded.chip_limit;
$$;
revoke all on function public.upsert_cashier_plan(uuid, jsonb) from public, anon;
grant execute on function public.upsert_cashier_plan(uuid, jsonb) to authenticated;

create function public.house_operation_totals(target_casino uuid)
returns table (players bigint, balance_cents bigint)
language sql stable security invoker set search_path = '' as $$
  select
    (select count(*) from public.profiles where casino_id = target_casino and role = 'player'),
    (select coalesce(sum(amount_cents), 0)::bigint from public.ledger_entries where casino_id = target_casino)
  where public.can_manage_house(target_casino);
$$;
revoke all on function public.house_operation_totals(uuid) from public, anon;
grant execute on function public.house_operation_totals(uuid) to authenticated;
