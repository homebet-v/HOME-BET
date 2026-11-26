import assert from "node:assert/strict";
import { test } from "node:test";
import { depositAccountFields } from "./deposit-account.ts";

test("normaliza la cuenta de transferencia de la casa", () => {
  assert.deepEqual(depositAccountFields({
    holder: "  Ana   Gómez ",
    identity: "7.124.754",
    alias: "  kairo.bet ",
    bank: "  Ueno  ",
  }), {
    holderName: "Ana Gómez",
    identityNumber: "7124754",
    alias: "kairo.bet",
    bankName: "Ueno",
  });
});

test("rechaza una cuenta incompleta", () => {
  assert.throws(() => depositAccountFields({ holder: "A", identity: "7124754", alias: "alias", bank: "Ueno" }), /titular/);
  assert.throws(() => depositAccountFields({ holder: "Ana Gómez", identity: "12", alias: "alias", bank: "Ueno" }), /CI/);
  assert.throws(() => depositAccountFields({ holder: "Ana Gómez", identity: "7124754", alias: "ab", bank: "Ueno" }), /alias/);
  assert.throws(() => depositAccountFields({ holder: "Ana Gómez", identity: "7124754", alias: "alias", bank: " " }), /banco/);
});
