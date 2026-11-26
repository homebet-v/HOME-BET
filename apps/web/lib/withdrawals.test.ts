import assert from "node:assert/strict";
import { test } from "node:test";
import { withdrawalAlias, withdrawalBankAccount, withdrawalDestination, withdrawalPayout, withdrawalRequestCents } from "./withdrawals.ts";

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

test("arma el pago por alias o por cuenta bancaria", () => {
  assert.deepEqual(withdrawalPayout({ method: "alias", alias: " kairo@mail.com ", holder: "", bank: "", account: "", identity: "" }), {
    method: "alias", summary: "Alias kairo@mail.com", holderName: "", bankName: "", accountNumber: "", payoutIdentity: "kairo@mail.com",
  });
  assert.equal(withdrawalAlias("0981-123-456"), "0981-123-456");
  assert.deepEqual(withdrawalBankAccount({ holder: " Ana  Gómez ", bank: " Ueno ", account: "123 456", identity: "7.124.754" }), {
    holderName: "Ana Gómez", bankName: "Ueno", accountNumber: "123456", identityNumber: "7124754",
  });
  assert.throws(() => withdrawalPayout({ method: "alias", alias: "abc", holder: "", bank: "", account: "", identity: "" }), /CI, RUC/);
  assert.throws(() => withdrawalBankAccount({ holder: "Ana", bank: "Ueno", account: "12", identity: "7124754" }), /cuenta/);
});
