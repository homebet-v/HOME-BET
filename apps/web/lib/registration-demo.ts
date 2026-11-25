"use client";

import { useSyncExternalStore } from "react";
import { emptyDetails, emptyPhotos, validateDetails, reviewVerification, submitVerification, type IdentityDetails, type IdentityPhotos, type Registration } from "@/lib/verification";
import { registrationFixtures } from "@/lib/fixtures";

let rows: readonly Registration[] = registrationFixtures;
const passwords = new Map<string, string>();
const listeners = new Set<() => void>();
function publish(next: readonly Registration[]) { rows = next; listeners.forEach((listener) => listener()); }
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export function useRegistrations() { return useSyncExternalStore(subscribe, () => rows, () => registrationFixtures); }
export function createDemoRegistration(casinoId: string, ci: string, password: string): Registration {
  if (!/^[0-9]{5,15}$/.test(ci) || password.length < 8) throw new Error("Revisá tu CI y usá una contraseña de al menos 8 caracteres.");
  if (ci === "1234567" || rows.some((row) => row.casinoId === casinoId && row.ci === ci)) throw new Error("Ese CI ya tiene una cuenta en esta casa. Ingresá con tu contraseña.");
  const row: Registration = { id: crypto.randomUUID(), casinoId, ci, details: { ...emptyDetails }, photos: { ...emptyPhotos }, status: "unverified", reason: "", submittedAt: null, createdAt: new Date().toISOString(), lastSignInAt: new Date().toISOString() };
  passwords.set(row.id, password);
  publish([...rows, row]);
  return row;
}
export function loginDemoRegistration(casinoId: string, ci: string, password: string) {
  const account = rows.find((row) => row.casinoId === casinoId && row.ci === ci && passwords.get(row.id) === password);
  if (!account) return undefined;
  const next = { ...account, lastSignInAt: new Date().toISOString() };
  publish(rows.map((row) => row.id === next.id ? next : row));
  return next;
}
export function sendDemoVerification(id: string, details: IdentityDetails, photos: IdentityPhotos) {
  const row = rows.find((item) => item.id === id);
  if (!row) throw new Error("La cuenta de muestra ya no está disponible.");
  const next = submitVerification(row, details, photos);
  publish(rows.map((item) => item.id === id ? next : item));
}
export function reviewDemoVerification(casinoId: string, id: string, status: "verified" | "denied" | "rejected", reason: string) {
  const row = rows.find((item) => item.id === id && item.casinoId === casinoId);
  if (!row) throw new Error("No se encontró el registro en esta casa.");
  const next = reviewVerification(row, status, reason);
  publish(rows.map((item) => item.id === id ? next : item));
}

export function updateDemoRegistration(casinoId: string, id: string, details: IdentityDetails) {
  const row = rows.find((item) => item.id === id && item.casinoId === casinoId);
  if (!row) throw new Error("No se encontró el jugador en esta casa.");
  const message = validateDetails(details);
  if (message) throw new Error(message);
  publish(rows.map((item) => item.id === id ? { ...item, details: { ...details } } : item));
}
