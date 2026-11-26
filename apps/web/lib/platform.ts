import { catalog } from "./game-library";
import { cache } from "react";
import { cookies } from "next/headers";
import { sessionCookie, supabaseConfigured, supabaseRequest } from "./supabase";

export type Casino = { id: string; slug: string; name: string; status: "active" | "suspended" };
export type Profile = {
  id: string; casino_id: string | null; role: "player" | "casino_admin" | "superadmin";
  display_name: string | null; created_at: string;
};
type Entry = { id: string; amount_cents: number; kind: "stake" | "win" | "adjustment"; created_at: string };

export const casinoBySlug = cache(async (slug: string) => {
  if (!supabaseConfigured()) return null;
  const query = new URLSearchParams({ select: "id,slug,name,status", slug: `eq.${slug}`, limit: "1" });
  const [casino] = await supabaseRequest<Casino[]>(`/rest/v1/casinos?${query}`, "service");
  return casino ?? null;
});

export const platformSession = cache(async () => {
  const token = (await cookies()).get(sessionCookie.access)?.value;
  if (!token || !supabaseConfigured()) return null;
  const auth = { token };
  let user: { id: string; email: string | null };
  try {
    user = await supabaseRequest<typeof user>("/auth/v1/user", auth);
  } catch (error) {
    if (error instanceof Error && /^Supabase HTTP 40[13]$/.test(error.message)) return null;
    throw error;
  }
  const [profile] = await supabaseRequest<Profile[]>(
    `/rest/v1/profiles?select=id,casino_id,role,display_name,created_at&id=eq.${user.id}`, auth,
  );
  return profile ? { auth, profile, email: user.email } : null;
});

export async function playerAccount(slug: string) {
  const [casino, session] = await Promise.all([casinoBySlug(slug), platformSession()]);
  if (casino?.status !== "active" || session?.profile.role !== "player" || session.profile.casino_id !== casino.id) return null;
  const balanceCents = await supabaseRequest<number>("/rest/v1/rpc/player_chip_balance", session.auth, {});
  return { email: session.email, balanceCents, casino, session };
}

export async function housePlayers(slug: string) {
  const [casino, session] = await Promise.all([casinoBySlug(slug), platformSession()]);
  if (!casino || !session || !(session.profile.role === "superadmin" ||
    (session.profile.role === "casino_admin" && session.profile.casino_id === casino.id))) return null;
  const players = await supabaseRequest<Profile[]>(
    `/rest/v1/profiles?select=id,casino_id,role,display_name,created_at&casino_id=eq.${casino.id}&role=eq.player&order=created_at.desc&limit=100`,
    session.auth,
  );
  return { casino, players, session };
}

export async function playerLedger(slug: string) {
  const account = await playerAccount(slug);
  if (!account) return null;
  const entries = await supabaseRequest<Entry[]>(
    `/rest/v1/ledger_entries?select=id,amount_cents,kind,created_at&casino_id=eq.${account.casino.id}&player_id=eq.${account.session.profile.id}&order=created_at.desc&limit=50`,
    account.session.auth,
  );
  return { ...account, entries };
}

export const homeSession = cache(async () => {
  const session = await platformSession();
  return session?.profile.role === "superadmin" ? session : null;
});

export const adminSession = cache(async (slug: string) => {
  const [casino, session] = await Promise.all([casinoBySlug(slug), platformSession()]);
  return casino && session?.profile.role === "casino_admin" && session.profile.casino_id === casino.id
    ? { casino, session }
    : null;
});

export async function homeCasinos() {
  const session = await homeSession();
  return session ? supabaseRequest<Casino[]>("/rest/v1/casinos?select=id,slug,name,status&order=name", session.auth) : [];
}

export async function houseGameSlugs(slug: string) {
  const casino = await casinoBySlug(slug);
  if (casino?.status !== "active") return [];
  const rows = await supabaseRequest<{ games: { slug: string } }[]>(
    `/rest/v1/casino_games?select=games!inner(slug)&enabled=eq.true&casino_id=eq.${casino.id}&games.status=eq.published&limit=1000`,
    "service",
  );
  return rows.map((row) => row.games.slug);
}

export async function publicHouseCatalog(slug: string) {
  const slugs = new Set(await houseGameSlugs(slug));
  return catalog.filter((game) => slugs.has(game.slug) && game.status === "published");
}

export async function publishedGames(access: { token: string }) {
  return supabaseRequest<{ id: string; slug: string; name: string }[]>(
    "/rest/v1/games?select=id,slug,name&status=eq.published&order=name&limit=1000", access,
  );
}

export async function houseLedger(slug: string) {
  const account = await adminSession(slug);
  if (!account) return null;
  return supabaseRequest<(Entry & { player_id: string; adjustment_actor: string | null })[]>(
    `/rest/v1/ledger_entries?select=id,amount_cents,kind,created_at,player_id,adjustment_actor&casino_id=eq.${account.casino.id}&order=created_at.desc&limit=100`,
    account.session.auth,
  );
}

export async function homeLedger() {
  const session = await homeSession();
  return session ? supabaseRequest<(Entry & { casinos: { name: string } })[]>(
    "/rest/v1/ledger_entries?select=id,amount_cents,kind,created_at,casinos!inner(name)&order=created_at.desc&limit=100",
    session.auth,
  ) : [];
}
