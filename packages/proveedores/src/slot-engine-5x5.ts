/** Edition III: 5×5 and 50 smooth fixed paylines. Demo credits only. */
import { createFiveReelEngine } from "@homebet/proveedores/engine-five-reels";
export { BETS, FREE_SPINS_AWARD, newSession, settleBonus } from "@homebet/proveedores/engine";
export const COLUMNS = 5;
export const ROWS = 5;
export const PAYTABLE = [[1,2,5],[2,5,10],[5,10,25],[10,25,50],[20,50,100],[50,100,250]] as const;
const preferred = [2,1,3,0,4].map(row => Array<number>(5).fill(row));
preferred.push([0,1,2,3,4], [4,3,2,1,0]);
const prefixes = Array.from({ length: 125 }, (_, index) => [Math.floor(index / 25), Math.floor(index / 5) % 5, index % 5])
  .filter(([a,b,c]) => Math.abs(a-b) <= 1 && Math.abs(b-c) <= 1);
const paths = [...preferred];
const keys = new Set(paths.map(rows => rows.join(",")));
function add(rows: number[]) {
  const key = rows.join(",");
  if (keys.has(key) || paths.length >= 50) return;
  keys.add(key); paths.push(rows);
}
for (const [a,b,c] of prefixes) add([a,b,c,b,a]);
// Spread extra paths over different prefixes, keeping every step adjacent.
for (const [a,b,c] of prefixes) {
  if (paths.length >= 50) break;
  for (let d = Math.max(0,c-1); d <= Math.min(4,c+1); d++) {
    const candidate = [a,b,c,d,d];
    if (!keys.has(candidate.join(","))) { add(candidate); break; }
  }
}
export const PAYLINES: readonly (readonly number[])[] = paths.map(rows => rows.map((row,column) => row * COLUMNS + column));
const engine = createFiveReelEngine({ rows: ROWS, paylines: PAYLINES, paytable: PAYTABLE });
export const { SYMBOL_WEIGHTS, COUNT_WEIGHTS, OUTCOMES, TICKET_COUNT, FEATURE_TICKETS, evaluateGrid, expectedRtp, spin } = engine;
