/** Shared accounting and fixed-line evaluation for five-reel demo engines. */
import { BETS, FREE_SPINS_AWARD, newSession, settleBonus, validateRtp, type LineWin, type RandomInt, type SlotRound, type SlotSession } from "@homebet/proveedores/engine";
export { BETS, FREE_SPINS_AWARD, newSession, settleBonus };

/** Uniform rejection sampling; supports ticket pools above the 32-bit range. */
export function secureRandomInt(exclusiveMax: number, fill: (words: Uint32Array) => void = words => { globalThis.crypto.getRandomValues(words); }): number {
  if (!Number.isSafeInteger(exclusiveMax) || exclusiveMax < 1) throw new Error("Rango aleatorio inválido.");
  const wide = exclusiveMax > 0x100000000;
  const range = wide ? 2 ** 53 : 2 ** 32;
  const limit = Math.floor(range / exclusiveMax) * exclusiveMax;
  const words = new Uint32Array(wide ? 2 : 1);
  let value: number;
  do { fill(words); value = wide ? (words[0] & 0x1fffff) * 0x100000000 + words[1] : words[0]; } while (value >= limit);
  return value % exclusiveMax;
}

export function createFiveReelEngine(config: { rows: 3 | 5; paylines: readonly (readonly number[])[]; paytable: readonly (readonly number[])[] }) {
  const COLUMNS = 5, ROWS = config.rows, PAYLINES = config.paylines, PAYTABLE = config.paytable;
  if (ROWS !== 3 && ROWS !== 5) throw new Error("Cantidad de filas inválida.");
  if (!PAYLINES.length || new Set(PAYLINES.map(line => line.join(","))).size !== PAYLINES.length || PAYLINES.some(line => line.length !== 5 || line.some((cell, column) => !Number.isInteger(cell) || cell < 0 || cell >= COLUMNS * ROWS || cell % COLUMNS !== column || (column > 0 && Math.abs(Math.floor(cell / COLUMNS) - Math.floor(line[column - 1] / COLUMNS)) > 1)))) throw new Error("Líneas fijas inválidas.");
  if (PAYTABLE.length !== 6 || PAYTABLE.some(row => row.length !== 3 || row.some(value => !Number.isSafeInteger(value) || value <= 0))) throw new Error("Tabla de pagos inválida.");
  const SYMBOL_WEIGHTS = [50, 25, 15, 6, 3, 1] as const;
  const COUNT_WEIGHTS = [10, 3, 1] as const;
  // Shared line prefixes can pay several lines. Price the complete evaluated result
  // into each ticket rather than hiding additional wins or overpaying the RTP.
  const OUTCOMES = PAYTABLE.flatMap((row, symbol) => row.flatMap((_multiplier, index) => PAYLINES.map((line, lineIndex) => {
    const count = index + 3;
    const grid = Array<number>(COLUMNS * ROWS).fill(7);
    line.slice(0, count).forEach(cell => { grid[cell] = symbol; });
    const wins = evaluateGrid(grid);
    return { symbol, count, line: lineIndex, cells: line.slice(0, count), wins, multiplier: wins.reduce((sum, win) => sum + win.multiplier, 0), weight: SYMBOL_WEIGHTS[symbol] * COUNT_WEIGHTS[index] };
  })));
  const weightedPayout = OUTCOMES.reduce((sum, outcome) => sum + outcome.weight * outcome.multiplier, 0);
  const TICKET_COUNT = weightedPayout * 10000;
  const FEATURE_TICKETS = TICKET_COUNT / 100;
  const safe = (value: number) => Number.isSafeInteger(value) && value >= 0;
  function draw(rng: RandomInt, max: number) {
    const value = rng(max);
    if (!Number.isInteger(value) || value < 0 || value >= max) throw new Error("El generador aleatorio devolvió un valor inválido.");
    return value;
  }
  function evaluateGrid(grid: readonly number[]): LineWin[] {
    if (grid.length !== COLUMNS * ROWS || grid.some(symbol => !Number.isInteger(symbol) || symbol < 0 || symbol > 7)) throw new Error(`Grilla 5×${ROWS} inválida.`);
    const wins: LineWin[] = [];
    PAYLINES.forEach((line, index) => {
      let best: LineWin | undefined;
      for (let symbol = 0; symbol < 6; symbol++) {
        let count = 0;
        for (const cell of line) { if (grid[cell] !== symbol && grid[cell] !== 6) break; count++; }
        if (count < 3) continue;
        const multiplier = PAYTABLE[symbol][count - 3];
        if (!best || multiplier > best.multiplier || (multiplier === best.multiplier && count > best.count!)) best = { line: index, symbol, multiplier, count, cells: line.slice(0, count) };
      }
      if (best) wins.push(best);
    });
    return wins;
  }
  function expectedRtp(rtpBps: number) {
    validateRtp(rtpBps);
    const normal = OUTCOMES.reduce((sum, outcome) => sum + (rtpBps - 800) * outcome.weight * outcome.multiplier / TICKET_COUNT, 0);
    return normal + FEATURE_TICKETS / TICKET_COUNT * FREE_SPINS_AWARD + FEATURE_TICKETS / TICKET_COUNT * 3;
  }
  function makeGrid(rng: RandomInt, kind: SlotRound["kind"], outcome = OUTCOMES[0]) {
    for (let attempt = 0; attempt < 5000; attempt++) {
      const grid = Array.from({ length: COLUMNS * ROWS }, () => kind === "win" ? (outcome.symbol + 1 + draw(rng, 5)) % 6 : draw(rng, 6));
      if (kind === "win") {
        outcome.cells.forEach(cell => { grid[cell] = outcome.symbol; });
        if (draw(rng, 5) === 0) grid[outcome.cells[draw(rng, outcome.count)]] = 6;
      }
      if (kind === "free-spins" || kind === "bonus") {
        const positions = Array.from({ length: COLUMNS * ROWS }, (_, cell) => cell);
        for (let i = 0; i < 3; i++) { const chosen = positions.splice(draw(rng, positions.length), 1)[0]; grid[chosen] = kind === "free-spins" ? 7 : 6; }
      }
      const wins = evaluateGrid(grid);
      if (kind === "win" ? wins.length === outcome.wins.length && wins.every((win, index) => win.line === outcome.wins[index].line && win.symbol === outcome.wins[index].symbol && win.count === outcome.wins[index].count) : wins.length === 0) return { grid, wins };
    }
    throw new Error(`No se pudo crear una grilla 5×${ROWS} coherente. La ronda no se cobró.`);
  }
  function spin(session: SlotSession, requestedBetCents: number, rtpBps: number, rng: RandomInt = secureRandomInt): SlotSession {
    if (session.pendingBonus) throw new Error("Terminá el bono antes de girar.");
    validateRtp(rtpBps);
    if (!BETS.some(value => value === requestedBetCents)) throw new Error("Apuesta no permitida.");
    if (!Number.isInteger(session.freeSpins) || session.freeSpins < 0 || session.freeSpins > FREE_SPINS_AWARD || ![session.balanceCents, session.rounds, session.totalBetCents, session.totalPaidCents, session.rounds + 1].every(safe)) throw new Error("La sesión demo no es válida.");
    const isFree = session.freeSpins > 0;
    if (isFree && !BETS.some(value => value === session.featureBetCents)) throw new Error("La apuesta de los giros gratis no es válida.");
    const bet = isFree ? session.featureBetCents : requestedBetCents;
    const rtp = isFree ? session.featureRtpBps : rtpBps;
    validateRtp(rtp);
    if (!isFree && session.balanceCents < bet) throw new Error("No hay suficientes fichas demo.");
    const ticket = draw(rng, TICKET_COUNT);
    let threshold = 0;
    let outcome: typeof OUTCOMES[number] | undefined;
    for (const candidate of OUTCOMES) { threshold += (isFree ? 10000 : rtp - 800) * candidate.weight; if (ticket < threshold) { outcome = candidate; break; } }
    let kind: SlotRound["kind"] = outcome ? "win" : "loss";
    if (!outcome && !isFree) { if (ticket < threshold + FEATURE_TICKETS) kind = "free-spins"; else if (ticket < threshold + 2 * FEATURE_TICKETS) kind = "bonus"; }
    const { grid, wins } = makeGrid(rng, kind, outcome);
    const payoutCents = wins.reduce((sum, win) => sum + bet * win.multiplier, 0);
    const bonusReward = kind === "bonus" ? bet * (draw(rng, 5) + 1) : 0;
    const balanceCents = session.balanceCents - (isFree ? 0 : bet) + payoutCents;
    const totalBetCents = session.totalBetCents + (isFree ? 0 : bet);
    const totalPaidCents = session.totalPaidCents + payoutCents;
    if (![balanceCents, totalBetCents, totalPaidCents, bonusReward].every(safe)) throw new Error("El importe supera el rango permitido.");
    const round: SlotRound = { id: session.rounds + 1, kind, grid, betCents: bet, payoutCents, wins, isFree, rtpBps: rtp };
    return { balanceCents, totalBetCents, totalPaidCents, lastRound: round, rounds: round.id, freeSpins: kind === "free-spins" ? FREE_SPINS_AWARD : Math.max(0, session.freeSpins - 1), featureBetCents: kind === "free-spins" ? bet : session.featureBetCents, featureRtpBps: kind === "free-spins" ? rtp : session.featureRtpBps, pendingBonus: kind === "bonus" ? { rewardCents: bonusReward, roundId: round.id } : null };
  }

  if (!Number.isSafeInteger(TICKET_COUNT) || TICKET_COUNT <= 0 || !Number.isInteger(FEATURE_TICKETS)) throw new Error("Distribución de premios inválida.");
  const allWeights = OUTCOMES.reduce((sum, outcome) => sum + outcome.weight, 0);
  if (10000 * allWeights > TICKET_COUNT || 9000 * allWeights + 2 * FEATURE_TICKETS > TICKET_COUNT) throw new Error("La distribución supera los tickets disponibles.");
  return { COLUMNS, ROWS, PAYLINES, PAYTABLE, SYMBOL_WEIGHTS, COUNT_WEIGHTS, OUTCOMES, TICKET_COUNT, FEATURE_TICKETS, evaluateGrid, expectedRtp, spin };
}
