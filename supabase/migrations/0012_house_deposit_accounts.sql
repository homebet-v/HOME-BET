-- The transfer account players see when they load chips. One row per house.

create table public.house_deposit_accounts (
  casino_id uuid primary key references public.casinos(id),
  holder_name text not null check (length(trim(holder_name)) between 2 and 80),
  identity_number text not null check (identity_number ~ '^[0-9]{4,12}$'),
  alias text not null check (length(trim(alias)) between 3 and 40),
  bank_name text not null check (length(trim(bank_name)) between 2 and 60),
  updated_at timestamptz not null default now()
);

alter table public.house_deposit_accounts enable row level security;
revoke all on public.house_deposit_accounts from public, anon, authenticated, service_role;
grant select on public.house_deposit_accounts to authenticated;
grant select, insert, update on public.house_deposit_accounts to service_role;

create policy deposit_accounts_read on public.house_deposit_accounts
  for select to authenticated
  using (
    public.can_manage_house(casino_id)
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.casino_id = house_deposit_accounts.casino_id and p.role = 'player'
    )
  );

create function public.save_house_deposit_account(
  target_casino uuid, actor_id uuid, holder text, identity text, payout_alias text, bank text
) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  cleaned_holder text := trim(regexp_replace(coalesce(holder, ''), '\s+', ' ', 'g'));
  cleaned_identity text := regexp_replace(coalesce(identity, ''), '[^0-9]', '', 'g');
  cleaned_alias text := trim(regexp_replace(coalesce(payout_alias, ''), '\s+', ' ', 'g'));
  cleaned_bank text := trim(regexp_replace(coalesce(bank, ''), '\s+', ' ', 'g'));
begin
  if target_casino is null or actor_id is null
    or length(cleaned_holder) not between 2 and 80
    or cleaned_identity !~ '^[0-9]{4,12}$'
    or length(cleaned_alias) not between 3 and 40
    or length(cleaned_bank) not between 2 and 60
    or not exists (
      select 1 from public.profiles p
      join public.casinos c on c.id = target_casino and c.status = 'active'
      where p.id = actor_id and (p.role = 'superadmin' or (p.role = 'casino_admin' and p.casino_id = c.id))
    )
  then raise exception 'Operation not authorized'; end if;

  insert into public.house_deposit_accounts (casino_id, holder_name, identity_number, alias, bank_name)
  values (target_casino, cleaned_holder, cleaned_identity, cleaned_alias, cleaned_bank)
  on conflict (casino_id) do update set
    holder_name = excluded.holder_name,
    identity_number = excluded.identity_number,
    alias = excluded.alias,
    bank_name = excluded.bank_name,
    updated_at = now();
end;
$$;

revoke all on function public.save_house_deposit_account(uuid, uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.save_house_deposit_account(uuid, uuid, text, text, text, text) to service_role;
