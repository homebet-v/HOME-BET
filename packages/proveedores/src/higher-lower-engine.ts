import { randomUint32, uniformIndex, type NextUint32 } from "@homebet/proveedores/game-random";

export const MAX_CARD_WAGER = 100_000;
export const CARD_STREAK_LIMIT = 8;
const MAX_MULTIPLIER_BPS = 1_000_000;
export const CARD_SUITS = ["clubs", "diamonds", "hearts", "spades"] as const;
export type Card = { readonly suit: typeof CARD_SUITS[number]; readonly rank: number };
export type Prediction = "higher" | "lower";

export type CardRound = {
  readonly wager: number;
  readonly deck: readonly Card[];
  readonly card: Card;
  readonly streak: number;
  readonly multiplierBps: number;
  readonly phase: "playing" | "cashed" | "lost";
  readonly event: "dealt" | "tie" | "hit" | "miss" | "collected";
  readonly payout: number;
};

export function openCardRound(wager: number, nextUint32: NextUint32 = randomUint32): CardRound {
  if (!Number.isSafeInteger(wager) || wager < 1 || wager > MAX_CARD_WAGER) throw new Error("Apuesta inválida");
  const deck = CARD_SUITS.flatMap((suit) => Array.from({ length: 13 }, (_, index) => ({ suit, rank: index + 1 })));
  for (let index = deck.length - 1; index > 0; index--) {
    const other = uniformIndex(index + 1, nextUint32);
    [deck[index], deck[other]] = [deck[other], deck[index]];
  }
  const [card, ...remaining] = deck;
  return { wager, card, deck: remaining, streak: 0, multiplierBps: 10_000, phase: "playing", event: "dealt", payout: 0 };
}

export function cardOdds(round: CardRound) {
  let higher = 0;
  let lower = 0;
  for (const card of round.deck) {
    if (card.rank > round.card.rank) higher++;
    if (card.rank < round.card.rank) lower++;
  }
  return { higher, lower, tie: round.deck.length - higher - lower, total: round.deck.length };
}

export function cardCashOutValue(round: CardRound): number {
  return round.streak > 0 ? Math.floor(round.wager * round.multiplierBps / 10_000) : 0;
}

export function collectCardRound(round: CardRound): CardRound {
  if (round.phase !== "playing" || round.streak === 0) return round;
  return { ...round, phase: "cashed", event: "collected", payout: cardCashOutValue(round) };
}

export function predictCard(round: CardRound, prediction: Prediction): CardRound {
  if (prediction !== "higher" && prediction !== "lower") throw new Error("Predicción inválida");
  if (round.phase !== "playing") return round;
  const odds = cardOdds(round);
  const wins = odds[prediction];
  if (!wins) return round;
  const [card, ...deck] = round.deck;
  const next = { ...round, card, deck };
  if (card.rank === round.card.rank) return { ...next, event: "tie" };
  if ((card.rank > round.card.rank) !== (prediction === "higher")) {
    return { ...next, phase: "lost", event: "miss" };
  }

  // Tied cards leave the multiplier intact. Price the decision over non-tied draws.
  const adjusted = Math.floor(round.multiplierBps * (odds.higher + odds.lower) * 97 / (wins * 100));
  const multiplierBps = Math.min(MAX_MULTIPLIER_BPS, Math.max(round.multiplierBps, adjusted));
  const won: CardRound = { ...next, streak: round.streak + 1, multiplierBps, event: "hit" };
  return won.streak === CARD_STREAK_LIMIT || multiplierBps === MAX_MULTIPLIER_BPS ? collectCardRound(won) : won;
}
