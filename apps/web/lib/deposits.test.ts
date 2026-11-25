import assert from "node:assert/strict";
import { test } from "node:test";
import { approveDeposit, claimDeposit, depositBonusCents, parseDepositAmount, rejectDeposit, type DepositRequest } from "./deposits.ts";
import { walletFromMovements } from "./wallet.ts";

const request: DepositRequest = { id: "load-1", casinoId: "bet1", playerId: "player-1", requestedCents: 1500000, receiptUrl: "/receipt.svg", bonus: { id: "bonus-1", casinoId: "bet1", name: "2.000 desde 10.000", kind: "fixed", amount: 200000, minimumCents: 1000000, maximumCents: null, capCents: 200000, startsAt: "2026-11-01T00:00:00Z", endsAt: "2026-12-01T00:00:00Z" }, createdAt: "2026-11-14T12:00:00Z", status: "pending", claimedBy: null, confirmedCents: null, bonusCents: 0, reviewedAt: null, reason: "" };
const taken = () => claimDeposit(request, "bet1", "cashier-1");

test("15.000 confirmados + 2.000 de bono = 17.000 en dos movimientos", () => {
  const result = approveDeposit(taken(), "bet1", "cashier-1", parseDepositAmount("15000"));
  assert.equal(result.request.status, "accepted");
  assert.equal(result.request.confirmedCents, 1500000);
  assert.equal(result.request.bonusCents, 200000);
  assert.deepEqual(result.movements.map((row) => [row.type, row.amountCents]), [["deposit", 1500000], ["bonus", 200000]]);
  assert.deepEqual(walletFromMovements(result.movements), { totalCents: 1700000, withdrawableCents: 0 });
});
test("sin bono seleccionado solo acredita la carga", () => {
  const result = approveDeposit({ ...taken(), bonus: null }, "bet1", "cashier-1", 1500000);
  assert.equal(result.movements.length, 1);
  assert.equal(result.request.bonusCents, 0);
  assert.equal(walletFromMovements(result.movements).totalCents, 1500000);
});
test("exige tomar la solicitud, respetar casa y cajero, comprobar importe y evitar doble acreditación", () => {
  assert.throws(() => claimDeposit(request, "bet2", "cashier-1"));
  assert.throws(() => approveDeposit(request, "bet1", "cashier-1", 1500000));
  assert.throws(() => claimDeposit(taken(), "bet1", "cashier-2"));
  assert.throws(() => approveDeposit(taken(), "bet2", "cashier-1", 1500000));
  assert.throws(() => approveDeposit(taken(), "bet1", "cashier-2", 1500000));
  assert.throws(() => approveDeposit(taken(), "bet1", "cashier-1", 1700000));
  assert.throws(() => approveDeposit({ ...taken(), receiptUrl: "" }, "bet1", "cashier-1", 1500000));
  const accepted = approveDeposit(taken(), "bet1", "cashier-1", 1500000);
  assert.throws(() => approveDeposit(accepted.request, "bet1", "cashier-1", 1500000));
  assert.throws(() => walletFromMovements([...accepted.movements, ...accepted.movements]));
});
test("rechazar exige motivo, no genera crédito ni permite aceptar después", () => {
  assert.throws(() => rejectDeposit(taken(), "bet1", "cashier-1", " "));
  const rejected = rejectDeposit(taken(), "bet1", "cashier-1", "Comprobante incorrecto");
  assert.equal(rejected.status, "rejected");
  assert.equal(rejected.confirmedCents, null);
  assert.equal(rejected.bonusCents, 0);
  assert.throws(() => approveDeposit(rejected, "bet1", "cashier-1", 1500000));
});
test("bono exige vigencia al solicitar, umbral inclusivo, tope y casa correctos", () => {
  assert.equal(depositBonusCents(request, 1000000), 200000);
  assert.throws(() => depositBonusCents(request, 999999));
  assert.throws(() => depositBonusCents({ ...request, createdAt: "2026-12-01T00:00:00Z" }, 1500000));
  assert.throws(() => depositBonusCents({ ...request, bonus: { ...request.bonus!, casinoId: "bet2" } }, 1500000));
  assert.throws(() => depositBonusCents({ ...request, bonus: { ...request.bonus!, maximumCents: 1200000 } }, 1500000));
  assert.equal(depositBonusCents({ ...request, bonus: { ...request.bonus!, capCents: 100000 } }, 1500000), 100000);
  assert.equal(depositBonusCents({ ...request, bonus: { ...request.bonus!, kind: "percentage", amount: 2000 } }, 1500000), 200000);
});
test("parseo exacto de montos, sin separadores de miles ni redondeos ambiguos", () => {
  assert.equal(parseDepositAmount("15000,25"), 1500025);
  assert.equal(parseDepositAmount("15000.01"), 1500001);
  for (const value of ["15.000", "15,000", "-1", "0", "NaN", "Infinity", "1e4", "", "9007199254740991"]) assert.throws(() => parseDepositAmount(value));
});
