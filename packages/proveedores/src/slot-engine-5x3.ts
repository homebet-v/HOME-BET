/** Edition II: 5×3, 25 fixed lines. Demo credits only. */
import { createFiveReelEngine } from "@homebet/proveedores/engine-five-reels";
export { BETS, FREE_SPINS_AWARD, newSession, settleBonus } from "@homebet/proveedores/engine";
const COLUMNS = 5;
const PAYTABLE = [[1,2,5],[2,5,10],[5,10,25],[10,25,50],[20,50,100],[50,100,250]] as const;
// Smooth paths: moving between adjacent reels never skips the middle row.
const startingRows = [[1,1,1], [0,0,0], [2,2,2], [0,1,2], [2,1,0]];
const otherRows = Array.from({ length: 27 }, (_, i) => [Math.floor(i / 9), Math.floor(i / 3) % 3, i % 3])
  .filter(rows => Math.abs(rows[1] - rows[0]) <= 1 && Math.abs(rows[2] - rows[1]) <= 1)
  .filter(rows => !startingRows.some(first => first.every((row, column) => row === rows[column])));
const mirroredRows = [...startingRows, ...otherRows].map(([a,b,c]) => [a,b,c,b,a]);
const additionalRows = [
  [1,1,1,0,0], [0,0,0,0,1], [2,2,2,2,1],
  [0,1,2,2,2], [2,1,0,0,0], [0,0,1,1,1],
  [2,2,1,1,1], [1,0,0,0,0],
];
const PAYLINES: readonly (readonly number[])[] = [...mirroredRows, ...additionalRows].map(rows => rows.map((row, column) => row * COLUMNS + column));

const engine = createFiveReelEngine({ rows: 3, paylines: PAYLINES, paytable: PAYTABLE });
export { COLUMNS, PAYLINES, PAYTABLE };
export const { ROWS, SYMBOL_WEIGHTS, COUNT_WEIGHTS, OUTCOMES, TICKET_COUNT, FEATURE_TICKETS, evaluateGrid, expectedRtp, spin } = engine;
