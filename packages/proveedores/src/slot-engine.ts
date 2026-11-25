/** Motor demo 3x3. Importes enteros en centésimos. No tiene acceso a dinero real. */
export type RandomInt = (exclusiveMax: number) => number;
export const BETS = [1000, 2500, 5000, 10000, 25000, 50000] as const;
export const PAYLINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 4, 8], [6, 4, 2]] as const;
export const MULTIPLIERS = [1, 2, 5, 10, 20, 50] as const;
export const WIN_WEIGHTS = [50, 25, 15, 6, 3, 1] as const;
export const TICKET_COUNT = 3450000;
export const FEATURE_TICKETS = 34500;
export const FREE_SPINS_AWARD = 5;
export type Grid = readonly number[];
export type LineWin = { line: number; symbol: number; multiplier: number; count?: number; cells?: readonly number[] };
export type SlotRound = { id: number; kind: "loss" | "win" | "free-spins" | "bonus"; grid: Grid; betCents: number; payoutCents: number; wins: readonly LineWin[]; isFree: boolean; rtpBps: number };
export type SlotSession = { balanceCents: number; freeSpins: number; featureBetCents: number; featureRtpBps: number; pendingBonus: { rewardCents: number; roundId: number } | null; lastRound: SlotRound | null; rounds: number; totalBetCents: number; totalPaidCents: number };
export type ProviderRtp = { providerBps: number; gameOverrides: Readonly<Record<string, number>> };
export const DEFAULT_RTP: ProviderRtp = { providerBps: 9600, gameOverrides: {} };
const safe = (value: number) => Number.isSafeInteger(value) && value >= 0;
export function validateRtp(rtpBps: number) {
  if (!Number.isInteger(rtpBps) || rtpBps < 8000 || rtpBps > 9800) throw new Error("El RTP debe estar entre 80% y 98%, con hasta dos decimales.");
}
export function effectiveRtp(config: ProviderRtp, slug: string): number {
  const value = config.gameOverrides[slug] ?? config.providerBps;
  validateRtp(value);
  return value;
}
/** RNG uniforme sin sesgo de módulo; solo adecuado para esta demo de navegador. */
export function secureRandomInt(exclusiveMax: number): number {
  if (!Number.isSafeInteger(exclusiveMax) || exclusiveMax < 1 || exclusiveMax > 0x100000000) throw new Error("Rango aleatorio inválido.");
  const limit = Math.floor(0x100000000 / exclusiveMax) * exclusiveMax;
  const word = new Uint32Array(1);
  do { globalThis.crypto.getRandomValues(word); } while (word[0] >= limit);
  return word[0] % exclusiveMax;
}
function draw(rng: RandomInt, max: number) {
  const value = rng(max);
  if (!Number.isInteger(value) || value < 0 || value >= max) throw new Error("El generador aleatorio devolvió un valor inválido.");
  return value;
}
export function evaluateGrid(grid: Grid): LineWin[] {
  if (grid.length !== 9 || grid.some((symbol) => !Number.isInteger(symbol) || symbol < 0 || symbol > 7)) throw new Error("Grilla inválida.");
  const wins: LineWin[] = [];
  PAYLINES.forEach((cells, line) => {
    const symbols = cells.map((cell) => grid[cell]);
    if (symbols.includes(7)) return;
    const symbol = symbols.find((item) => item !== 6);
    // Tres wild pagan como el símbolo mayor; wild sustituye cualquier símbolo normal.
    const resolved = symbol ?? 5;
    if (symbols.every((item) => item === resolved || item === 6)) wins.push({ line, symbol: resolved, multiplier: MULTIPLIERS[resolved] });
  });
  return wins;
}
export function expectedRtp(rtpBps: number): number {
  validateRtp(rtpBps);
  const normal = WIN_WEIGHTS.reduce((sum, weight, i) => sum + (rtpBps - 800) * weight * MULTIPLIERS[i] / TICKET_COUNT, 0);
  return normal + FEATURE_TICKETS / TICKET_COUNT * FREE_SPINS_AWARD + FEATURE_TICKETS / TICKET_COUNT * 3;
}
function makeGrid(rng: RandomInt, kind: SlotRound["kind"], symbol = 0): { grid: number[]; wins: LineWin[] } {
  const line = draw(rng, PAYLINES.length);
  for (let attempt = 0; attempt < 5000; attempt++) {
    const grid = Array.from({ length: 9 }, () => draw(rng, 6));
    if (kind === "win") {
      PAYLINES[line].forEach((cell) => { grid[cell] = symbol; });
      if (draw(rng, 5) === 0) grid[PAYLINES[line][draw(rng, 3)]] = 6;
    }
    if (kind === "free-spins") [0, 4, 8].forEach((cell) => { grid[cell] = 7; });
    if (kind === "bonus") [0, 5, 7].forEach((cell) => { grid[cell] = 6; });
    const wins = evaluateGrid(grid);
    if (kind === "win" ? wins.length === 1 && wins[0].line === line && wins[0].symbol === symbol : wins.length === 0) return { grid, wins };
  }
  throw new Error("No se pudo crear una grilla coherente. La ronda no se cobró.");
}
export function newSession(balanceCents = 1000000): SlotSession {
  if (!safe(balanceCents)) throw new Error("Saldo demo inválido.");
  return { balanceCents, freeSpins: 0, featureBetCents: 0, featureRtpBps: 9600, pendingBonus: null, lastRound: null, rounds: 0, totalBetCents: 0, totalPaidCents: 0 };
}
export function spin(session: SlotSession, requestedBetCents: number, rtpBps: number, rng: RandomInt = secureRandomInt): SlotSession {
  if (session.pendingBonus) throw new Error("Elegí un cofre para terminar el bono antes de girar.");
  validateRtp(rtpBps);
  if (!BETS.some((bet) => bet === requestedBetCents)) throw new Error("Apuesta no permitida.");
  if (!Number.isInteger(session.freeSpins) || session.freeSpins < 0 || session.freeSpins > FREE_SPINS_AWARD || ![session.balanceCents, session.rounds, session.totalBetCents, session.totalPaidCents].every(safe)) throw new Error("La sesión demo no es válida.");
  const isFree = session.freeSpins > 0;
  if (isFree && !BETS.some((value) => value === session.featureBetCents)) throw new Error("La apuesta de los giros gratis no es válida.");
  const bet = isFree ? session.featureBetCents : requestedBetCents;
  const rtp = isFree ? session.featureRtpBps : rtpBps;
  validateRtp(rtp);
  if (!safe(session.balanceCents) || (!isFree && session.balanceCents < bet)) throw new Error("No hay suficientes fichas demo.");
  const ticket = draw(rng, TICKET_COUNT);
  let threshold = 0, symbol = -1;
  for (let i = 0; i < WIN_WEIGHTS.length; i++) {
    threshold += (isFree ? 10000 : rtp - 800) * WIN_WEIGHTS[i];
    if (ticket < threshold) { symbol = i; break; }
  }
  let kind: SlotRound["kind"] = symbol >= 0 ? "win" : "loss";
  if (symbol < 0 && !isFree) {
    if (ticket < threshold + FEATURE_TICKETS) kind = "free-spins";
    else if (ticket < threshold + 2 * FEATURE_TICKETS) kind = "bonus";
  }
  const { grid, wins } = makeGrid(rng, kind, Math.max(0, symbol));
  const payoutCents = kind === "win" ? bet * MULTIPLIERS[symbol] : 0;
  const bonusReward = kind === "bonus" ? bet * (draw(rng, 5) + 1) : 0;
  const balanceCents = session.balanceCents - (isFree ? 0 : bet) + payoutCents;
  const totalBetCents = session.totalBetCents + (isFree ? 0 : bet);
  const totalPaidCents = session.totalPaidCents + payoutCents;
  if (![balanceCents, totalBetCents, totalPaidCents, bonusReward].every(safe)) throw new Error("El importe supera el rango permitido.");
  const round: SlotRound = { id: session.rounds + 1, kind, grid, betCents: bet, payoutCents, wins, isFree, rtpBps: rtp };
  return { balanceCents, totalBetCents, totalPaidCents, lastRound: round, rounds: round.id, freeSpins: kind === "free-spins" ? FREE_SPINS_AWARD : Math.max(0, session.freeSpins - 1), featureBetCents: kind === "free-spins" ? bet : session.featureBetCents, featureRtpBps: kind === "free-spins" ? rtp : session.featureRtpBps, pendingBonus: kind === "bonus" ? { rewardCents: bonusReward, roundId: round.id } : null };
}
export function settleBonus(session: SlotSession): SlotSession {
  if (!session.pendingBonus) throw new Error("No hay un bono pendiente de cobrar.");
  const payoutCents = session.pendingBonus.rewardCents;
  const balanceCents = session.balanceCents + payoutCents;
  const totalPaidCents = session.totalPaidCents + payoutCents;
  if (![balanceCents, totalPaidCents].every(safe)) throw new Error("El importe supera el rango permitido.");
  return { ...session, balanceCents, totalPaidCents, pendingBonus: null, lastRound: session.lastRound ? { ...session.lastRound, payoutCents } : null };
}
