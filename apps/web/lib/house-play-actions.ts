"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { slotGameBySlug } from "@homebet/proveedores/catalog";
import { spinRoulette, spinPrismRoulette, newRouletteSession, type RouletteBet, type RouletteRound } from "@homebet/proveedores/roulette-engine";
import { rouletteThemeBySlug } from "@homebet/proveedores/roulette-catalog";
import { playerAccount } from "./platform";
import { supabaseRequest } from "./supabase";
import { slotEngineProfile } from "./slot-engine-profile";
import {
  HOUSE_RTP_BPS,
  bonusCharge,
  parseHouseSlotView,
  rouletteCharge,
  sessionForSpin,
  spinCharge,
  type HouseRouletteView,
  type HouseSlotView,
} from "./house-play";

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const slugPattern = /^[a-z][a-z0-9-]{1,40}$/;
const shown = new Set([
  "Apuesta no permitida.",
  "La apuesta de los giros gratis no es válida.",
  "No hay fichas suficientes.",
  "Colocá una apuesta",
  "Límite de mesa: 100.000 fichas",
  "Demasiadas apuestas",
  "Importe inválido",
  "Apuesta desconocida",
  "Elegí el premio del bono antes de girar.",
  "La jugada cambió. Probá de nuevo.",
  "No hay un bono pendiente de cobrar.",
  "Este juego no está habilitado en la casa.",
  "Ingresá con tu cuenta verificada para jugar.",
]);

export type HouseResult<T> = { ok: true; state: T } | { ok: false; message: string };

function fail(message: string): HouseResult<never> {
  return { ok: false, message: shown.has(message) ? message : "No se pudo cerrar la jugada." };
}

function whole(value: unknown) {
  if (typeof value === "number" && Number.isSafeInteger(value)) return value;
  if (typeof value === "string" && /^-?\d+$/.test(value)) {
    const parsed = Number(value);
    if (Number.isSafeInteger(parsed)) return parsed;
  }
  return null;
}

function shownError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message === "No hay suficientes fichas demo." || message === "Fichas insuficientes") return "No hay fichas suficientes.";
  return shown.has(message) ? message : "No se pudo cerrar la jugada.";
}

async function surfaceSlug() {
  const request = await headers();
  return request.get("x-homebet-surface") === "casa" ? request.get("x-homebet-slug") : null;
}

async function serviceRpc(name: string, body: object) {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!projectUrl || !key) throw new Error("Supabase no está configurado.");
  const requestHeaders = new Headers({ apikey: key, "Content-Type": "application/json" });
  if (key.startsWith("eyJ")) requestHeaders.set("Authorization", `Bearer ${key}`);
  const response = await fetch(new URL(`/rest/v1/rpc/${name}`, projectUrl), {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const text = await response.text();
  if (!response.ok) {
    let message = "";
    try {
      const parsed = JSON.parse(text) as { message?: string };
      message = (parsed.message ?? "").replace(/^P0001:\s*/, "").trim();
    } catch {
      message = "";
    }
    throw new Error(shown.has(message) ? message : "No se pudo cerrar la jugada.");
  }
  return text ? JSON.parse(text) as unknown : null;
}

async function publishedGame(casinoId: string, slug: string) {
  if (!slugPattern.test(slug) || slug.endsWith("-")) return null;
  const [game] = await supabaseRequest<{ id: string; game_versions: { id: string; published_at: string | null }[] }[]>(
    `/rest/v1/games?select=id,game_versions(id,published_at)&slug=eq.${slug}&status=eq.published&limit=1`,
    "service",
  );
  if (!game || !uuid.test(game.id)) return null;
  const [link] = await supabaseRequest<{ game_id: string }[]>(
    `/rest/v1/casino_games?select=game_id&casino_id=eq.${casinoId}&game_id=eq.${game.id}&enabled=eq.true&limit=1`,
    "service",
  );
  const version = game.game_versions.filter((item) => item.published_at && uuid.test(item.id)).sort((left, right) => (right.published_at ?? "").localeCompare(left.published_at ?? ""))[0];
  return link && version ? { id: game.id, versionId: version.id } : null;
}

async function slotState(casinoId: string, playerId: string, gameId: string, balanceCents: number): Promise<HouseSlotView> {
  const [row] = await supabaseRequest<{ free_spins: unknown; feature_bet_cents: unknown; feature_rtp_bps: unknown; pending_bonus_cents: unknown }[]>(
    `/rest/v1/player_slot_states?select=free_spins,feature_bet_cents,feature_rtp_bps,pending_bonus_cents&casino_id=eq.${casinoId}&player_id=eq.${playerId}&game_id=eq.${gameId}&limit=1`,
    "service",
  );
  const freeSpins = row ? whole(row.free_spins) : 0;
  const featureBetCents = row ? whole(row.feature_bet_cents) : 0;
  const featureRtpBps = row ? whole(row.feature_rtp_bps) : HOUSE_RTP_BPS;
  const pendingBonusCents = !row || row.pending_bonus_cents == null ? null : whole(row.pending_bonus_cents);
  return parseHouseSlotView({ balanceCents, freeSpins, featureBetCents, featureRtpBps, pendingBonusCents, lastRound: null });
}

async function playerGame(slug: string) {
  const house = await surfaceSlug();
  const account = house ? await playerAccount(house) : null;
  if (!account) return { ok: false as const, message: "Ingresá con tu cuenta verificada para jugar." };
  const game = await publishedGame(account.casino.id, slug);
  if (!game) return { ok: false as const, message: "Este juego no está habilitado en la casa." };
  return { ok: true as const, account, game };
}

function chargeSpin(gameSlug: string, view: HouseSlotView, betCents: number) {
  const catalogGame = slotGameBySlug(gameSlug);
  if (!catalogGame) throw new Error("Este juego no está habilitado en la casa.");
  if (view.pendingBonusCents != null) throw new Error("Elegí el premio del bono antes de girar.");
  if (view.freeSpins === 0 && view.balanceCents < betCents) throw new Error("No hay fichas suficientes.");
  const before = sessionForSpin(view);
  const after = slotEngineProfile(catalogGame).spin(before, betCents, HOUSE_RTP_BPS);
  return { before, charge: spinCharge(before, after) };
}

export async function loadHouseSlot(slug: string): Promise<HouseResult<HouseSlotView>> {
  const ready = await playerGame(slug);
  if (!ready.ok) return ready;
  if (!slotGameBySlug(slug)) return fail("Este juego no está habilitado en la casa.");
  try {
    const state = await slotState(ready.account.casino.id, ready.account.session.profile.id, ready.game.id, ready.account.balanceCents);
    return { ok: true, state };
  } catch (error) {
    return fail(shownError(error));
  }
}

export async function playHouseSlot(slug: string, roundId: string, betCents: number): Promise<HouseResult<HouseSlotView>> {
  if (!uuid.test(roundId) || !Number.isSafeInteger(betCents)) return fail("Apuesta no permitida.");
  const ready = await playerGame(slug);
  if (!ready.ok) return ready;
  const { account, game } = ready;
  try {
    const view = await slotState(account.casino.id, account.session.profile.id, game.id, account.balanceCents);
    const first = chargeSpin(slug, view, betCents);
    const body = {
      target_casino: account.casino.id,
      target_player: account.session.profile.id,
      target_game: game.id,
      target_version: game.versionId,
      target_round: roundId,
      stake_cents: first.charge.stakeCents,
      payout_cents: first.charge.payoutCents,
      expected_free: first.before.freeSpins,
      expected_pending: first.before.pendingBonus?.rewardCents ?? null,
      next_free: first.charge.nextFreeSpins,
      next_feature_bet: first.charge.nextFeatureBetCents,
      next_feature_rtp: first.charge.nextFeatureRtpBps,
      next_pending: first.charge.nextPendingCents,
      round_detail: first.charge.round,
    };
    let settled: unknown;
    try {
      settled = await serviceRpc("settle_house_slot", body);
    } catch (error) {
      if (!(error instanceof Error) || error.message !== "La jugada cambió. Probá de nuevo.") throw error;
      const fresh = await slotState(account.casino.id, account.session.profile.id, game.id, account.balanceCents);
      const again = chargeSpin(slug, fresh, betCents);
      settled = await serviceRpc("settle_house_slot", {
        ...body,
        stake_cents: again.charge.stakeCents,
        payout_cents: again.charge.payoutCents,
        expected_free: again.before.freeSpins,
        expected_pending: again.before.pendingBonus?.rewardCents ?? null,
        next_free: again.charge.nextFreeSpins,
        next_feature_bet: again.charge.nextFeatureBetCents,
        next_feature_rtp: again.charge.nextFeatureRtpBps,
        next_pending: again.charge.nextPendingCents,
        round_detail: again.charge.round,
      });
    }
    revalidatePath(`/s/casa/${account.casino.slug}`, "layout");
    return { ok: true, state: parseHouseSlotView(settled) };
  } catch (error) {
    return fail(shownError(error));
  }
}

export async function settleHouseSlotBonus(slug: string, roundId: string): Promise<HouseResult<HouseSlotView>> {
  if (!uuid.test(roundId)) return fail("No se pudo cerrar la jugada.");
  const ready = await playerGame(slug);
  if (!ready.ok) return ready;
  if (!slotGameBySlug(slug)) return fail("Este juego no está habilitado en la casa.");
  const { account, game } = ready;
  try {
    const view = await slotState(account.casino.id, account.session.profile.id, game.id, account.balanceCents);
    if (view.pendingBonusCents == null) return fail("No hay un bono pendiente de cobrar.");
    const charge = bonusCharge(view.pendingBonusCents);
    const settled = await serviceRpc("settle_house_bonus", {
      target_casino: account.casino.id,
      target_player: account.session.profile.id,
      target_game: game.id,
      target_version: game.versionId,
      target_round: roundId,
      round_detail: { payoutCents: charge.payoutCents, kind: "bonus" },
    });
    revalidatePath(`/s/casa/${account.casino.slug}`, "layout");
    return { ok: true, state: parseHouseSlotView(settled) };
  } catch (error) {
    return fail(shownError(error));
  }
}

export async function loadHouseRoulette(slug: string): Promise<HouseResult<{ balanceCents: number }>> {
  const ready = await playerGame(slug);
  if (!ready.ok) return ready;
  if (!rouletteThemeBySlug(slug)) return fail("Este juego no está habilitado en la casa.");
  return { ok: true, state: { balanceCents: ready.account.balanceCents } };
}

export async function playHouseRoulette(slug: string, roundId: string, bets: readonly RouletteBet[]): Promise<HouseResult<HouseRouletteView>> {
  if (!uuid.test(roundId) || !Array.isArray(bets)) return fail("Apuesta no permitida.");
  const ready = await playerGame(slug);
  if (!ready.ok) return ready;
  const theme = rouletteThemeBySlug(slug);
  if (!theme) return fail("Este juego no está habilitado en la casa.");
  const { account, game } = ready;
  try {
    const placed = bets.map((bet) => {
      if (!bet || typeof bet.spotId !== "string" || typeof bet.amountCents !== "number") throw new Error("Importe inválido");
      return { spotId: bet.spotId, amountCents: bet.amountCents };
    });
    const session = newRouletteSession(account.balanceCents);
    const next = theme.variant === "prism" ? spinPrismRoulette(session, placed) : spinRoulette(session, placed);
    const round = next.lastRound;
    if (!round) return fail("No se pudo cerrar la jugada.");
    const charge = rouletteCharge(placed, round);
    const settled = await serviceRpc("settle_house_roulette", {
      target_casino: account.casino.id,
      target_player: account.session.profile.id,
      target_game: game.id,
      target_version: game.versionId,
      target_round: roundId,
      stake_cents: charge.stakeCents,
      payout_cents: charge.payoutCents,
      round_detail: charge.round,
    }) as { balanceCents?: unknown; lastRound?: RouletteRound } | null;
    const balanceCents = settled?.balanceCents;
    const lastRound = settled?.lastRound;
    if (typeof balanceCents !== "number" || !Number.isSafeInteger(balanceCents) || balanceCents < 0 || !lastRound || !Number.isInteger(lastRound.number)) {
      return fail("No se pudo cerrar la jugada.");
    }
    revalidatePath(`/s/casa/${account.casino.slug}`, "layout");
    return { ok: true, state: { balanceCents, lastRound } };
  } catch (error) {
    return fail(shownError(error));
  }
}
