"use client";

import { useSyncExternalStore } from "react";
import { depositRequestFixtures, registrationWalletFixtures } from "@/lib/fixtures";
import { approveDeposit, claimDeposit, rejectDeposit, type DepositRequest } from "@/lib/deposits";
import { walletFromMovements, type WalletMovement } from "@/lib/wallet";

type DepositState = { requests: readonly DepositRequest[]; wallets: Readonly<Record<string, readonly WalletMovement[]>> };
const fixtureWallets: Record<string, readonly WalletMovement[]> = { ...registrationWalletFixtures };
for (const request of depositRequestFixtures) {
  if (request.status !== "accepted" || !request.confirmedCents) continue;
  const movements: WalletMovement[] = [{ id: `${request.id}-deposit`, type: "deposit", amountCents: request.confirmedCents }];
  if (request.bonusCents > 0) movements.push({ id: `${request.id}-bonus`, type: "bonus", amountCents: request.bonusCents });
  fixtureWallets[request.playerId] = [...(fixtureWallets[request.playerId] ?? []), ...movements];
}
const initialState: DepositState = { requests: depositRequestFixtures, wallets: fixtureWallets };
let state = initialState;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export function useDepositDemo() { return useSyncExternalStore(subscribe, () => state, () => initialState); }
function publish(next: DepositState) { state = next; listeners.forEach((listener) => listener()); }
export const demoCashier = "Cajero de muestra";
function findRequest(casinoId: string, id: string) {
  const request = state.requests.find((item) => item.id === id && item.casinoId === casinoId);
  if (!request) throw new Error("No se encontró la solicitud en esta casa.");
  return request;
}
export function takeDemoDeposit(casinoId: string, id: string) {
  const request = claimDeposit(findRequest(casinoId, id), casinoId, demoCashier);
  publish({ ...state, requests: state.requests.map((row) => row.id === id ? request : row) });
}
export function acceptDemoDeposit(casinoId: string, id: string) {
  const current = findRequest(casinoId, id);
  const request = current.status === "pending" ? claimDeposit(current, casinoId, demoCashier) : current;
  const result = approveDeposit(request, casinoId, demoCashier, request.requestedCents);
  const movements = [...(state.wallets[result.request.playerId] ?? []), ...result.movements];
  walletFromMovements(movements);
  // Una sola actualización publica la decisión y ambos movimientos de la simulación.
  publish({ requests: state.requests.map((row) => row.id === id ? result.request : row), wallets: { ...state.wallets, [result.request.playerId]: movements } });
}
export function rejectDemoDeposit(casinoId: string, id: string, reason: string) {
  const current = findRequest(casinoId, id);
  const taken = current.status === "pending" ? claimDeposit(current, casinoId, demoCashier) : current;
  const request = rejectDeposit(taken, casinoId, demoCashier, reason.trim() || "Comprobante rechazado por la administración.");
  publish({ ...state, requests: state.requests.map((row) => row.id === id ? request : row) });
}
