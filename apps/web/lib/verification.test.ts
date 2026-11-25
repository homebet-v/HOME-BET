import assert from "node:assert/strict";
import { test } from "node:test";
import { canPlay, emptyDetails, emptyPhotos, isAdult, reviewVerification, submitVerification, type Registration } from "./verification.ts";

const details = { firstName: "Ana", lastName: "Ejemplo", phone: "+595 981 123456", email: "ana@example.com", birthDate: "1995-06-15" };
const photos = { front: "front", back: "back", selfie: "selfie" };
const account: Registration = { id: "player-1", casinoId: "bet1", ci: "8000001", details: emptyDetails, photos: emptyPhotos, status: "unverified", reason: "", submittedAt: null };

test("mayoría de edad: cumpleaños exacto, menor y fechas inválidas", () => {
  const today = new Date(2026, 10, 14);
  assert.equal(isAdult("2008-11-14", today), true);
  assert.equal(isAdult("2008-11-15", today), false);
  for (const date of ["2027-01-01", "2000-02-30", "2000-13-01", "", "1899-01-01"]) assert.equal(isAdult(date, today), false);
});
test("registrarse o enviar documentos no habilita jugar", () => {
  assert.equal(canPlay(account.status), false);
  const pending = submitVerification(account, details, photos);
  assert.equal(pending.status, "pending");
  assert.equal(pending.casinoId, "bet1");
  assert.equal(canPlay(pending.status), false);
  const verified = reviewVerification(pending, "verified", "");
  assert.equal(canPlay(verified.status), true);
});
test("solo denegado permite corregir: pendiente, verificado y rechazado bloquean reenvíos", () => {
  const pending = submitVerification(account, details, photos);
  const denied = reviewVerification(pending, "denied", "Reverso borroso");
  assert.equal(submitVerification(denied, details, { ...photos, back: "new-back" }).status, "pending");
  for (const row of [pending, reviewVerification(pending, "verified", ""), reviewVerification(pending, "rejected", "No corresponde")]) {
    assert.throws(() => submitVerification(row, details, photos));
  }
});
test("administración puede revertir rechazo y revocar aprobación", () => {
  const pending = submitVerification(account, details, photos);
  const rejected = reviewVerification(pending, "rejected", "Identidad incorrecta");
  const verified = reviewVerification(rejected, "verified", "Revisión corregida");
  assert.equal(canPlay(verified.status), true);
  assert.equal(canPlay(reviewVerification(verified, "denied", "Actualizar documento").status), false);
});
test("rechaza aprobación incompleta, fotos faltantes, datos inválidos y decisiones sin motivo", () => {
  assert.throws(() => reviewVerification(account, "verified", ""));
  assert.throws(() => submitVerification(account, details, { ...photos, selfie: "" }));
  assert.throws(() => submitVerification(account, { ...details, email: "mal" }, photos));
  assert.throws(() => submitVerification(account, { ...details, birthDate: "2020-01-01" }, photos));
  const pending = submitVerification(account, details, photos);
  assert.throws(() => reviewVerification(pending, "denied", " "));
  assert.throws(() => reviewVerification(pending, "rejected", ""));
});
