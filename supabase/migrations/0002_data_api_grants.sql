-- Explicit table permissions for projects with automatic Data API grants off.
-- RLS policies in 0001 still decide which rows each authenticated user can access.
revoke all on public.casinos, public.profiles, public.games,
  public.game_versions, public.casino_games, public.game_rounds,
  public.ledger_entries from public, anon, authenticated, service_role;

grant select on public.casinos, public.profiles, public.games,
  public.game_versions, public.casino_games, public.game_rounds,
  public.ledger_entries to authenticated;

grant insert, update, delete on public.casinos, public.games,
  public.game_versions, public.casino_games to authenticated;

grant select, insert, update, delete on public.casinos, public.profiles,
  public.games, public.game_versions, public.casino_games, public.game_rounds,
  public.ledger_entries to service_role;

revoke execute on function public.current_role() from anon;
revoke execute on function public.current_casino_id() from anon;
