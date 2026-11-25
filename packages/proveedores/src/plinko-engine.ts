import { randomUint32, uniformIndex, type NextUint32 } from "@homebet/proveedores/game-random";

export const PLINKO_MULTIPLIERS = [8, 3, 1, 1, 0, 1, 1, 3, 8] as const;
export const PLINKO_ROWS = 8;
export const PLINKO_ROW_OPTIONS = [8, 10, 12] as const;
export const PLINKO_RISKS = ["low", "medium", "high"] as const;
export type PlinkoRows = typeof PLINKO_ROW_OPTIONS[number];
export type PlinkoRisk = typeof PLINKO_RISKS[number];

const halfTables: Record<PlinkoRows, Record<PlinkoRisk, readonly number[]>> = {
  8: {
    low: [2, 1.5, 1.2, 1, 0.6],
    medium: PLINKO_MULTIPLIERS.slice(0, 5),
    high: [25, 5, 1, 0.4, 0.2],
  },
  10: {
    low: [3, 2, 1.4, 1.2, 0.9, 0.6],
    medium: [12, 5, 2, 1.2, 0.7, 0.3],
    high: [40, 12, 3, 1.1, 0.3, 0],
  },
  12: {
    low: [4, 2.5, 1.8, 1.3, 1, 0.9, 0.6],
    medium: [20, 8, 3, 1.6, 1, 0.6, 0.3],
    high: [80, 30, 8, 2, 0.6, 0.2, 0],
  },
};

export function plinkoMultipliers(rows: PlinkoRows, risk: PlinkoRisk): readonly number[] {
  if (!PLINKO_ROW_OPTIONS.includes(rows) || !PLINKO_RISKS.includes(risk)) {
    throw new Error("Configuración de Plinko inválida");
  }
  const half = halfTables[rows][risk];
  return [...half, ...half.slice(0, -1).reverse()];
}

export function plinkoSlotProbabilities(rows: PlinkoRows): readonly number[] {
  let combinations = 1;
  return Array.from({ length: rows + 1 }, (_, slot) => {
    if (slot > 0) combinations = (combinations * (rows + 1 - slot)) / slot;
    return combinations / 2 ** rows;
  });
}

export type PlinkoRound = {
  /** Position at each depth, including the starting point and final slot. */
  path: readonly number[];
  slot: number;
  multiplier: number;
};

export function dropPlinko(nextUint32: NextUint32 = randomUint32): PlinkoRound {
  return playPlinko(PLINKO_ROWS, "medium", nextUint32);
}

export function playPlinko(rows: PlinkoRows, risk: PlinkoRisk, nextUint32: NextUint32 = randomUint32): PlinkoRound {
  const multipliers = plinkoMultipliers(rows, risk);
  const path = [0];
  let slot = 0;
  for (let row = 0; row < rows; row++) {
    slot += uniformIndex(2, nextUint32);
    path.push(slot);
  }
  return { path, slot, multiplier: multipliers[slot] };
}
