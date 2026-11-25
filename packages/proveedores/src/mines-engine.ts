import { randomUint32, uniformIndex, type NextUint32 } from "@homebet/proveedores/game-random";

export const MINES_BOARD_SIZE = 25;
export const MINES_OPTIONS = [3, 5, 8] as const;
export const MAX_MINES_WAGER_CENTS = 10_000_000;
export const MINES_CASHOUT_INTERVAL = 5;
export type MineCount = typeof MINES_OPTIONS[number];

export type MinesRound = {
  readonly wagerCents: number;
  readonly mines: readonly number[];
  readonly gems: readonly number[];
  readonly phase: "playing" | "lost" | "cashed";
  readonly hit: number | null;
  readonly payoutCents: number;
};

function combinations(available: number, chosen: number): number {
  let result = 1;
  for (let index = 1; index <= chosen; index++) {
    result = (result * (available + 1 - index)) / index;
  }
  return result;
}

export function minesQuote(round: MinesRound) {
  const mines = round.mines.length;
  const gems = round.gems.length;
  const possibleBoards = combinations(MINES_BOARD_SIZE, mines);
  const survivingBoards = combinations(MINES_BOARD_SIZE - gems, mines);
  const basisPoints = gems > 0 ? Math.floor(9_700 * possibleBoards / survivingBoards) : 0;
  const wholeMultiplier = Math.floor(basisPoints / 10_000);
  const fractionalBasisPoints = basisPoints % 10_000;
  return {
    multiplier: basisPoints / 10_000,
    payoutCents: round.wagerCents * wholeMultiplier + Math.floor(round.wagerCents * fractionalBasisPoints / 10_000),
    nextSafeProbability: (MINES_BOARD_SIZE - mines - gems) / (MINES_BOARD_SIZE - gems),
  };
}

export function openMinesRound(wagerCents: number, mineCount: MineCount, nextUint32: NextUint32 = randomUint32): MinesRound {
  if (!Number.isSafeInteger(wagerCents) || wagerCents < 100 || wagerCents > MAX_MINES_WAGER_CENTS) {
    throw new Error("Apuesta inválida");
  }
  if (!MINES_OPTIONS.includes(mineCount)) throw new Error("Cantidad de minas inválida");

  const cells = Array.from({ length: MINES_BOARD_SIZE }, (_, index) => index);
  for (let index = 0; index < mineCount; index++) {
    const selected = index + uniformIndex(MINES_BOARD_SIZE - index, nextUint32);
    [cells[index], cells[selected]] = [cells[selected], cells[index]];
  }
  return { wagerCents, mines: cells.slice(0, mineCount), gems: [], phase: "playing", hit: null, payoutCents: 0 };
}

export function canCashOutMines(round: MinesRound): boolean {
  const gems = round.gems.length;
  return round.phase === "playing" && gems > 0
    && (gems % MINES_CASHOUT_INTERVAL === 0 || gems + round.mines.length === MINES_BOARD_SIZE);
}

export function cashOutMines(round: MinesRound): MinesRound {
  if (!canCashOutMines(round)) return round;
  return { ...round, phase: "cashed", payoutCents: minesQuote(round).payoutCents };
}

export function revealMinesCell(round: MinesRound, cell: number): MinesRound {
  if (!Number.isInteger(cell) || cell < 0 || cell >= MINES_BOARD_SIZE) throw new Error("Casilla inválida");
  if (round.phase !== "playing" || round.gems.includes(cell)) return round;
  if (round.mines.includes(cell)) return { ...round, phase: "lost", hit: cell };

  const opened = { ...round, gems: [...round.gems, cell] };
  return opened.gems.length + opened.mines.length === MINES_BOARD_SIZE ? cashOutMines(opened) : opened;
}
