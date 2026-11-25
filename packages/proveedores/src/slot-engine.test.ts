import assert from "node:assert/strict";
import { test } from "node:test";
import { BETS, DEFAULT_RTP, FREE_SPINS_AWARD, MULTIPLIERS, PAYLINES, TICKET_COUNT, WIN_WEIGHTS, effectiveRtp, evaluateGrid, expectedRtp, newSession, settleBonus, spin } from "./slot-engine.ts";

function seeded(seed = 123456789) { return (max: number) => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) % max; }; }
function firstTicket(ticket: number, seed = 8451) { const rng = seeded(seed); let first = true; return (max: number) => { if (first) { first = false; assert.equal(max, TICKET_COUNT); return ticket; } return rng(max); }; }
const normalTickets = (9600 - 800) * 100;

test("RTP teórico exacto, incluyendo giros gratis y cofres, y herencia por proveedor", () => {
  for (const bps of [8000, 8500, 9234, 9600, 9800]) assert.ok(Math.abs(expectedRtp(bps) - bps / 10000) < 1e-12);
  assert.equal(effectiveRtp(DEFAULT_RTP, "juego"), 9600);
  assert.equal(effectiveRtp({ providerBps: 9200, gameOverrides: { uno: 9700 } }, "uno"), 9700);
  assert.equal(effectiveRtp({ providerBps: 9200, gameOverrides: { uno: 9700 } }, "dos"), 9200);
  for (const value of [0, 7999, 9801, 96.5, NaN]) assert.throws(() => effectiveRtp({ providerBps: value, gameOverrides: {} }, "juego"));
});
test("cada tramo de premios produce una grilla 3x3 coherente y exactamente una línea ganadora", () => {
  let ticket = 0;
  for (let symbol = 0; symbol < MULTIPLIERS.length; symbol++) {
    const next = spin(newSession(), BETS[0], 9600, firstTicket(ticket, 1000 + symbol));
    assert.equal(next.lastRound!.payoutCents, BETS[0] * MULTIPLIERS[symbol]);
    assert.equal(next.lastRound!.wins.length, 1);
    assert.deepEqual(evaluateGrid(next.lastRound!.grid), next.lastRound!.wins);
    assert.equal(next.balanceCents, 1000000 - BETS[0] + BETS[0] * MULTIPLIERS[symbol]);
    ticket += (9600 - 800) * WIN_WEIGHTS[symbol];
  }
});
test("pérdidas no muestran líneas ganadoras; no se cobra una ronda con RNG inválido", () => {
  const session = newSession();
  const next = spin(session, BETS[0], 9600, firstTicket(TICKET_COUNT - 1));
  assert.equal(next.lastRound!.kind, "loss");
  assert.equal(evaluateGrid(next.lastRound!.grid).length, 0);
  assert.equal(next.balanceCents, session.balanceCents - BETS[0]);
  assert.throws(() => spin(session, BETS[0], 9600, () => -1));
  assert.equal(session.balanceCents, 1000000);
});
test("cinco giros gratis no debitan, no reactivan features y conservan apuesta y RTP", () => {
  let session = spin(newSession(), BETS[1], 9600, firstTicket(normalTickets));
  assert.equal(session.lastRound!.kind, "free-spins");
  assert.equal(session.freeSpins, FREE_SPINS_AWARD);
  assert.equal(session.lastRound!.grid.filter(symbol => symbol === 7).length, 3);
  const before = session.balanceCents;
  for (let i = 0; i < FREE_SPINS_AWARD; i++) {
    session = spin(session, BETS[5], 8000, firstTicket(0, 855 + i));
    assert.equal(session.lastRound!.betCents, BETS[1]);
    assert.equal(session.lastRound!.rtpBps, 9600);
    assert.equal(session.lastRound!.isFree, true);
    assert.equal(session.lastRound!.kind, "win");
  }
  assert.equal(session.freeSpins, 0);
  assert.equal(session.balanceCents, before + FREE_SPINS_AWARD * BETS[1]);
  assert.equal(session.totalBetCents, BETS[1]);
});
test("bono se acredita una sola vez al elegir y bloquea otros giros", () => {
  const pending = spin(newSession(), BETS[2], 9600, firstTicket(normalTickets + 34500));
  assert.equal(pending.lastRound!.kind, "bonus");
  assert.equal(pending.lastRound!.payoutCents, 0);
  assert.ok(pending.pendingBonus!.rewardCents >= BETS[2] && pending.pendingBonus!.rewardCents <= BETS[2] * 5);
  assert.throws(() => spin(pending, BETS[2], 9600));
  const settled = settleBonus(pending);
  assert.equal(settled.balanceCents, pending.balanceCents + pending.pendingBonus!.rewardCents);
  assert.throws(() => settleBonus(settled));
});
test("apuestas válidas, saldo insuficiente y cinco líneas con wild", () => {
  assert.throws(() => spin(newSession(0), BETS[0], 9600));
  assert.throws(() => spin(newSession(), 1, 9600));
  assert.throws(() => newSession(-1));
  assert.equal(PAYLINES.length, 5);
  assert.equal(evaluateGrid([0, 6, 0, 1, 2, 3, 4, 5, 1])[0].multiplier, 1);
  assert.throws(() => evaluateGrid([1, 2]));
});
test("100.000 rondas pagadas: contabilidad e independencia de los giros de animación", () => {
  let session = newSession(1000000000000);
  const initial = session.balanceCents;
  const rng = seeded(20261114);
  let paid = 0;
  while (paid < 100000 || session.freeSpins || session.pendingBonus) {
    if (session.pendingBonus) session = settleBonus(session);
    else { const free = session.freeSpins > 0; session = spin(session, BETS[0], 9600, rng); if (!free) paid++; }
    assert.equal(session.balanceCents, initial - session.totalBetCents + session.totalPaidCents);
    assert.ok(session.balanceCents >= 0);
  }
  const realized = session.totalPaidCents / session.totalBetCents;
  assert.ok(Math.abs(realized - 0.96) < 0.08, `RTP de muestra: ${realized}`);
});

