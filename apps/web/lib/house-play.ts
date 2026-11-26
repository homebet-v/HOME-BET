import { BETS, FREE_SPINS_AWARD, newSession, type SlotRound, type SlotSession } from "@homebet/proveedores/engine";
import { MAX_ROULETTE_STAKE_CENTS, rouletteStake, type RouletteBet, type RouletteRound } from "@homebet/proveedores/roulette-engine";

export const HOUSE_RTP_BPS = 9600;
export const SLOT_PAYOUT_CAP = 20000;
export const BONUS_PAYOUT_CAP = 5;
export const ROULETTE_PAYOUT_CAP = 250;

export type HouseSlotView = {
  balanceCents: number;
  freeSpins: number;
  featureBetCents: number;
  featureRtpBps: number;
  pendingBonusCents: number | null;
  lastRound: SlotRound | null;
};

export type HouseRouletteView = {
  balanceCents: number;
  lastRound: RouletteRound;
};

export function sessionForSpin(view: HouseSlotView): SlotSession {
  const session = newSession(view.balanceCents);
  session.freeSpins = view.freeSpins;
  session.featureBetCents = view.featureBetCents;
  session.featureRtpBps = view.featureRtpBps;
  session.pendingBonus = view.pendingBonusCents == null ? null : { rewardCents: view.pendingBonusCents, roundId: 0 };
  return session;
}

export function viewToSession(view: HouseSlotView, roundId = view.lastRound?.id ?? 0): SlotSession {
  const session = sessionForSpin(view);
  session.rounds = roundId;
  session.lastRound = view.lastRound ? { ...view.lastRound, id: roundId } : null;
  if (session.pendingBonus) session.pendingBonus = { ...session.pendingBonus, roundId };
  return session;
}

export function spinCharge(before: SlotSession, after: SlotSession) {
  const round = after.lastRound;
  if (!round || before.pendingBonus) throw new Error("La ronda no tiene resultado.");
  const played = round.betCents;
  if (!BETS.includes(played as (typeof BETS)[number])) throw new Error("Apuesta no permitida.");
  const stakeCents = round.isFree ? 0 : played;
  if (round.isFree !== before.freeSpins > 0) throw new Error("La ronda no coincide con los giros gratis.");
  if (after.freeSpins === FREE_SPINS_AWARD && before.freeSpins === 0 && after.featureBetCents !== stakeCents) throw new Error("La apuesta de los giros gratis no es válida.");
  if (before.freeSpins > 0 && after.freeSpins !== before.freeSpins - 1) throw new Error("Los giros gratis no cierran bien.");
  if (before.freeSpins === 0 && after.freeSpins !== 0 && after.freeSpins !== FREE_SPINS_AWARD) throw new Error("Los giros gratis no cierran bien.");
  if (after.pendingBonus && (round.payoutCents !== 0 || after.freeSpins !== 0 || before.freeSpins > 0)) throw new Error("El bono no se puede guardar.");
  if (after.pendingBonus && (after.pendingBonus.rewardCents < played || after.pendingBonus.rewardCents > played * BONUS_PAYOUT_CAP)) throw new Error("El bono supera el máximo.");
  if (round.payoutCents > played * SLOT_PAYOUT_CAP) throw new Error("El premio supera el máximo.");
  return {
    stakeCents,
    payoutCents: round.payoutCents,
    nextFreeSpins: after.freeSpins,
    nextFeatureBetCents: after.featureBetCents,
    nextFeatureRtpBps: after.featureRtpBps,
    nextPendingCents: after.pendingBonus?.rewardCents ?? null,
    round,
  };
}

export function bonusCharge(pendingCents: number) {
  if (!Number.isSafeInteger(pendingCents) || pendingCents < 1) throw new Error("No hay un bono pendiente de cobrar.");
  return { stakeCents: 0, payoutCents: pendingCents };
}

export function rouletteCharge(bets: readonly RouletteBet[], round: RouletteRound) {
  const stakeCents = rouletteStake(bets);
  if (stakeCents < 1 || stakeCents > MAX_ROULETTE_STAKE_CENTS) throw new Error("La apuesta no es válida.");
  if (round.stakeCents !== stakeCents) throw new Error("La apuesta no coincide con el resultado.");
  if (!Number.isInteger(round.number) || round.number < 0 || round.number > 36) throw new Error("El número de la ruleta no es válido.");
  if (!Number.isSafeInteger(round.payoutCents) || round.payoutCents < 0 || round.payoutCents > stakeCents * ROULETTE_PAYOUT_CAP) throw new Error("El premio supera el máximo.");
  return { stakeCents, payoutCents: round.payoutCents, round };
}

export function parseHouseSlotView(value: unknown): HouseSlotView {
  if (!value || typeof value !== "object") throw new Error("No se pudo leer la jugada.");
  const view = value as Partial<HouseSlotView>;
  const balanceCents = view.balanceCents;
  const freeSpins = view.freeSpins;
  const featureBetCents = view.featureBetCents;
  const featureRtpBps = view.featureRtpBps;
  const pendingBonusCents = view.pendingBonusCents ?? null;
  if (typeof balanceCents !== "number" || !Number.isSafeInteger(balanceCents) || balanceCents < 0) throw new Error("No se pudo leer el saldo.");
  if (typeof freeSpins !== "number" || !Number.isInteger(freeSpins) || freeSpins < 0 || freeSpins > FREE_SPINS_AWARD) throw new Error("No se pudo leer la jugada.");
  if (typeof featureBetCents !== "number" || !Number.isSafeInteger(featureBetCents) || featureBetCents < 0) throw new Error("No se pudo leer la jugada.");
  if (typeof featureRtpBps !== "number" || !Number.isInteger(featureRtpBps) || featureRtpBps < 8000 || featureRtpBps > 9800) throw new Error("No se pudo leer la jugada.");
  if (pendingBonusCents != null && (typeof pendingBonusCents !== "number" || !Number.isSafeInteger(pendingBonusCents) || pendingBonusCents < 1)) throw new Error("No se pudo leer la jugada.");
  const round = view.lastRound;
  const lastRound = round && Array.isArray(round.grid) && round.grid.length > 0 && round.grid.every((cell) => Number.isInteger(cell)) ? round : null;
  return { balanceCents, freeSpins, featureBetCents, featureRtpBps, pendingBonusCents, lastRound };
}
