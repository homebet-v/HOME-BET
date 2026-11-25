-- Homebet platform. One database for Home, every house, the game catalog,
-- rounds and the ledger. packages/proveedores publishes into public.games.
-- It does not have its own database.

create extension if not exists pgcrypto;

create table public.casinos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  constraint casinos_slug_chk check (slug ~ '^[a-z][a-z0-9-]{1,40}$' and slug !~ '-$')
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  casino_id uuid references public.casinos (id),
  role text not null check (role in ('superadmin', 'casino_admin', 'player')),
  display_name text,
  created_at timestamptz not null default now(),
  constraint profiles_role_casino_chk check (
    (role = 'superadmin' and casino_id is null)
    or (role in ('casino_admin', 'player') and casino_id is not null)
  )
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'retired')),
  created_at timestamptz not null default now(),
  constraint games_slug_chk check (slug ~ '^[a-z][a-z0-9-]{1,40}$' and slug !~ '-$')
);

create table public.game_versions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id),
  version text not null,
  published_at timestamptz,
  unique (game_id, version)
);

create table public.casino_games (
  casino_id uuid not null references public.casinos (id) on delete cascade,
  game_id uuid not null references public.games (id),
  enabled boolean not null default true,
  primary key (casino_id, game_id)
);

create table public.game_rounds (
  id uuid primary key default gen_random_uuid(),
  casino_id uuid not null references public.casinos (id),
  player_id uuid not null references public.profiles (id),
  game_id uuid not null references public.games (id),
  game_version_id uuid not null references public.game_versions (id),
  status text not null check (status in ('open', 'settled', 'void')),
  created_at timestamptz not null default now()
);

create index game_rounds_casino_id_idx on public.game_rounds (casino_id, created_at);

create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  casino_id uuid not null references public.casinos (id),
  player_id uuid not null references public.profiles (id),
  game_round_id uuid references public.game_rounds (id),
  amount_cents bigint not null check (amount_cents <> 0),
  kind text not null check (kind in ('stake', 'win', 'adjustment')),
  created_at timestamptz not null default now()
);

create index ledger_entries_casino_id_idx on public.ledger_entries (casino_id, created_at);

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_casino_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select casino_id from public.profiles where id = auth.uid()
$$;

revoke all on function public.current_role() from public;
revoke all on function public.current_casino_id() from public;
grant execute on function public.current_role() to authenticated;
grant execute on function public.current_casino_id() to authenticated;

alter table public.casinos enable row level security;
alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.game_versions enable row level security;
alter table public.casino_games enable row level security;
alter table public.game_rounds enable row level security;
alter table public.ledger_entries enable row level security;

create policy casinos_select on public.casinos
for select to authenticated
using (public.current_role() = 'superadmin' or id = public.current_casino_id());

create policy casinos_write on public.casinos
for all to authenticated
using (public.current_role() = 'superadmin')
with check (public.current_role() = 'superadmin');

create policy profiles_select on public.profiles
for select to authenticated
using (
  id = auth.uid()
  or public.current_role() = 'superadmin'
  or (
    public.current_role() = 'casino_admin'
    and casino_id = public.current_casino_id()
  )
);

create policy games_select on public.games
for select to authenticated
using (status = 'published' or public.current_role() = 'superadmin');

create policy games_write on public.games
for all to authenticated
using (public.current_role() = 'superadmin')
with check (public.current_role() = 'superadmin');

create policy game_versions_select on public.game_versions
for select to authenticated
using (
  public.current_role() = 'superadmin'
  or exists (
    select 1
    from public.games
    where games.id = game_versions.game_id
      and games.status = 'published'
  )
);

create policy game_versions_write on public.game_versions
for all to authenticated
using (public.current_role() = 'superadmin')
with check (public.current_role() = 'superadmin');

create policy casino_games_select on public.casino_games
for select to authenticated
using (
  public.current_role() = 'superadmin'
  or casino_id = public.current_casino_id()
);

create policy casino_games_write on public.casino_games
for all to authenticated
using (
  public.current_role() = 'superadmin'
  or (
    public.current_role() = 'casino_admin'
    and casino_id = public.current_casino_id()
  )
)
with check (
  (
    public.current_role() = 'superadmin'
    or (
      public.current_role() = 'casino_admin'
      and casino_id = public.current_casino_id()
    )
  )
  and exists (
    select 1
    from public.games
    where games.id = casino_games.game_id
      and (
        games.status = 'published'
        or public.current_role() = 'superadmin'
      )
  )
);

create policy game_rounds_select on public.game_rounds
for select to authenticated
using (
  public.current_role() = 'superadmin'
  or (
    public.current_role() = 'casino_admin'
    and casino_id = public.current_casino_id()
  )
  or player_id = auth.uid()
);

create policy ledger_entries_select on public.ledger_entries
for select to authenticated
using (
  public.current_role() = 'superadmin'
  or (
    public.current_role() = 'casino_admin'
    and casino_id = public.current_casino_id()
  )
  or player_id = auth.uid()
);

-- Rounds and money are written by the server with the service role.
revoke insert, update, delete on public.game_rounds from anon, authenticated;
revoke insert, update, delete on public.ledger_entries from anon, authenticated;
