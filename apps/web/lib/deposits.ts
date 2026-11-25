import type { WalletMovement } from "./wallet";

export type DepositBonus = { id: string; casinoId: string; name: string; kind: "fixed" | "percentage"; amount: number; minimumCents: number; maximumCents: number | null; capCents: number; startsAt: string; endsAt: string };
export type DepositRequest = { id: string; casinoId: string; playerId: string; requestedCents: number; receiptUrl: string; bonus: DepositBonus | null; createdAt: string; status: "pending" | "reviewing" | "accepted" | "rejected"; claimedBy: string | null; confirmedCents: number | null; bonusCents: number; reviewedAt: string | null; reason: string };
export const depositStatusLabels = { pending: "Pendiente", reviewing: "En revisión", accepted: "Pagado", rejected: "Rechazada" };
const positive = (value: number) => Number.isSafeInteger(value) && value > 0;
export function parseDepositAmount(value: string): number {
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(value.trim())) throw new Error("Ingresá el monto sin separador de miles, por ejemplo 15000.");
  const [whole, fraction = ""] = value.trim().replace(",", ".").split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!positive(cents)) throw new Error("El monto debe ser positivo y válido.");
  return cents;
}
export function depositBonusCents(request: DepositRequest, confirmedCents: number): number {
  if (!positive(confirmedCents)) throw new Error("Monto inválido.");
  const rule = request.bonus;
  if (!rule) return 0;
  if (rule.casinoId !== request.casinoId) throw new Error("El bono no corresponde a esta casa.");
  if (!positive(rule.amount) || !positive(rule.minimumCents) || !positive(rule.capCents) || (rule.maximumCents !== null && (!positive(rule.maximumCents) || rule.maximumCents < rule.minimumCents)) || (rule.kind === "percentage" && rule.amount > 10000)) throw new Error("La configuración del bono no es válida.");
  const submitted = Date.parse(request.createdAt), start = Date.parse(rule.startsAt), end = Date.parse(rule.endsAt);
  if (![submitted, start, end].every(Number.isFinite) || start >= end || submitted < start || submitted >= end) throw new Error("El bono no estaba vigente al solicitar la carga.");
  if (confirmedCents < rule.minimumCents || (rule.maximumCents !== null && confirmedCents > rule.maximumCents)) throw new Error("El monto no cumple las condiciones del bono seleccionado.");
  // Para porcentajes, amount es el porcentaje expresado en centésimas (20% = 2000).
  const reward = rule.kind === "fixed" ? rule.amount : Number(BigInt(confirmedCents) * BigInt(rule.amount) / BigInt(10000));
  const capped = Math.min(reward, rule.capCents);
  if (!Number.isSafeInteger(capped) || capped < 0) throw new Error("El bono supera el importe permitido.");
  return capped;
}
function assertScope(request: DepositRequest, casinoId: string) {
  if (request.casinoId !== casinoId) throw new Error("La solicitud no pertenece a esta casa.");
}
export function claimDeposit(request: DepositRequest, casinoId: string, reviewer: string): DepositRequest {
  assertScope(request, casinoId);
  if (request.status !== "pending") throw new Error("La solicitud ya fue tomada o resuelta.");
  if (!reviewer.trim()) throw new Error("Falta identificar al cajero.");
  return { ...request, status: "reviewing", claimedBy: reviewer };
}
function assertReview(request: DepositRequest, casinoId: string, reviewer: string) {
  assertScope(request, casinoId);
  if (request.status !== "reviewing" || request.claimedBy !== reviewer) throw new Error("Primero tomá esta solicitud. Una solicitud resuelta no se puede acreditar otra vez.");
}
export function approveDeposit(request: DepositRequest, casinoId: string, reviewer: string, confirmedCents: number): { request: DepositRequest; movements: WalletMovement[] } {
  assertReview(request, casinoId, reviewer);
  if (!positive(request.requestedCents) || confirmedCents !== request.requestedCents) throw new Error("El monto del comprobante debe coincidir con el solicitado. Si no coincide, rechazá la solicitud indicando el motivo.");
  if (!request.receiptUrl) throw new Error("Falta el comprobante de la carga.");
  const bonusCents = depositBonusCents(request, confirmedCents);
  if (!Number.isSafeInteger(confirmedCents + bonusCents)) throw new Error("El total supera el importe permitido.");
  const movements: WalletMovement[] = [{ id: `${request.id}-deposit`, type: "deposit", amountCents: confirmedCents }];
  if (bonusCents > 0) movements.push({ id: `${request.id}-bonus`, type: "bonus", amountCents: bonusCents });
  return { request: { ...request, status: "accepted", confirmedCents, bonusCents, reviewedAt: new Date().toISOString(), reason: "" }, movements };
}
export function rejectDeposit(request: DepositRequest, casinoId: string, reviewer: string, reason: string): DepositRequest {
  assertReview(request, casinoId, reviewer);
  if (!reason.trim()) throw new Error("Indicá el motivo del rechazo.");
  return { ...request, status: "rejected", reason: reason.trim(), reviewedAt: new Date().toISOString() };
}
