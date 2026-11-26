import assert from "node:assert/strict";
import { test } from "node:test";
import { withdrawalDestination, withdrawalRequestCents } from "./withdrawals.ts";

test("acepta un retiro dentro del saldo de premios", () => {
  assert.equal(withdrawalRequestCents(150000, 200000, 0), 150000);
  assert.equal(withdrawalRequestCents(1050, 1050, 0), 1050);
  assert.equal(withdrawalDestination("  alias   1234  "), "alias 1234");
});

test("rechaza montos por encima de lo retirable y datos de pago vacíos", () => {
  assert.throws(() => withdrawalRequestCents(2000, 1000, 500), /supera/);
  assert.throws(() => withdrawalRequestCents(100, 0), /premios/);
  assert.throws(() => withdrawalRequestCents(0, 1000), /positivo/);
  assert.throws(() => withdrawalDestination("ab"));
  assert.throws(() => withdrawalDestination("  "));
});
