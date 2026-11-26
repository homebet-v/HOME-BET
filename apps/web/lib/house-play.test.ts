import assert from "node:assert/strict";
import { test } from "node:test";
import { BETS, newSession, spin } from "@homebet/proveedores/engine";
import { newRouletteSession, spinRoulette } from "@homebet/proveedores/roulette-engine";
import { HOUSE_RTP_BPS, bonusCharge, rouletteCharge, spinCharge } from "./house-play.ts";

test("un giro con fichas de la casa queda dentro del tope y debita la apuesta", () => {
  const before = newSession(100000);
  const after = spin(before, BETS[0], HOUSE_RTP_BPS);
  const charge = spinCharge(before, after);
  assert.equal(charge.stakeCents, BETS[0]);
  assert.ok(charge.payoutCents <= charge.round.betCents * 20000);
  assert.equal(charge.round.isFree, false);
});

test("un giro gratis no debita saldo", () => {
  const before = newSession(100000);
  before.freeSpins = 1;
  before.featureBetCents = BETS[0];
  before.featureRtpBps = HOUSE_RTP_BPS;
  const after = spin(before, BETS[2], HOUSE_RTP_BPS);
  const charge = spinCharge(before, after);
  assert.equal(charge.stakeCents, 0);
  assert.equal(charge.nextFreeSpins, 0);
  assert.equal(charge.round.betCents, BETS[0]);
});

test("el bono acredita solo el premio pendiente", () => {
  assert.deepEqual(bonusCharge(2500), { stakeCents: 0, payoutCents: 2500 });
  assert.throws(() => bonusCharge(0), /bono pendiente/);
});

test("la ruleta rechaza un número o un premio fuera de rango", () => {
  const session = newRouletteSession(1_000_000);
  const bets = [{ spotId: "n-1", amountCents: 1000 }];
  const after = spinRoulette(session, bets, () => 1);
  const charge = rouletteCharge(bets, after.lastRound!);
  assert.equal(charge.stakeCents, 1000);
  assert.ok(charge.payoutCents <= 1000 * 250);
  assert.throws(() => rouletteCharge(bets, { ...after.lastRound!, number: 37 }), /número/);
  assert.throws(() => rouletteCharge(bets, { ...after.lastRound!, payoutCents: 1000 * 251 }), /máximo/);
});
