import assert from "node:assert/strict";
import { test } from "node:test";
import { applyWalletMovement, walletFromMovements } from "./wallet.ts";

test("ejemplo acordado: 10.000 → 20.000/11.000 → 110.000/110.000", () => {
  const events = [
    { id: "1", type: "deposit", amountCents: 1000000 },
    { id: "2", type: "stake", amountCents: 100000 },
    { id: "3", type: "prize", amountCents: 1100000 },
  ] as const;
  assert.deepEqual(walletFromMovements(events), { totalCents: 2000000, withdrawableCents: 1100000 });
  assert.deepEqual(walletFromMovements([...events, { id: "4", type: "stake", amountCents: 1000000 }, { id: "5", type: "prize", amountCents: 10000000 }]), { totalCents: 11000000, withdrawableCents: 11000000 });
});
test("cargas y bonos no se vuelven retirables; apuesta consume primero la parte no retirable", () => {
  const wallet = walletFromMovements([{ id: "1", type: "deposit", amountCents: 10000 }, { id: "2", type: "bonus", amountCents: 2000 }, { id: "3", type: "prize", amountCents: 5000 }]);
  assert.deepEqual(applyWalletMovement(wallet, { id: "4", type: "stake", amountCents: 13000 }), { totalCents: 4000, withdrawableCents: 4000 });
  assert.deepEqual(applyWalletMovement(wallet, { id: "4", type: "withdrawal", amountCents: 5000 }), { totalCents: 12000, withdrawableCents: 0 });
});
test("rechaza retiros sin respaldo, sobregiros, duplicados e importes inválidos", () => {
  const wallet = { totalCents: 10000, withdrawableCents: 2000 };
  assert.throws(() => applyWalletMovement(wallet, { id: "1", type: "withdrawal", amountCents: 2001 }));
  assert.throws(() => applyWalletMovement(wallet, { id: "1", type: "stake", amountCents: 10001 }));
  for (const amountCents of [-1, 0, 1.5, NaN, Infinity]) assert.throws(() => applyWalletMovement(wallet, { id: "1", type: "deposit", amountCents }));
  assert.throws(() => walletFromMovements([{ id: "1", type: "deposit", amountCents: 100 }, { id: "1", type: "deposit", amountCents: 100 }]));
});
