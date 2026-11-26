export const withdrawalStatusLabels = {
  pending: "Pendiente",
  reviewing: "En revisión",
  accepted: "Pagado",
  rejected: "Rechazado",
} as const;

export type WithdrawalStatus = keyof typeof withdrawalStatusLabels;

export function withdrawalDestination(value: string) {
  const text = value.trim().replace(/\s+/g, " ");
  if (text.length < 4 || text.length > 120) throw new Error("Indicá alias, cuenta o teléfono para recibir el pago.");
  return text;
}

export function withdrawalRequestCents(cents: number, withdrawableCents: number, reservedCents = 0) {
  if (!Number.isSafeInteger(cents) || cents < 1) throw new Error("El monto debe ser positivo y válido.");
  if (!Number.isSafeInteger(withdrawableCents) || !Number.isSafeInteger(reservedCents) || withdrawableCents < 0 || reservedCents < 0 || reservedCents > withdrawableCents) {
    throw new Error("No se pudo leer el saldo retirable.");
  }
  const available = withdrawableCents - reservedCents;
  if (cents > available) throw new Error(available > 0 ? "El monto supera lo que podés retirar." : "No tenés premios disponibles para retirar.");
  if (cents > 100000000) throw new Error("El importe supera el máximo de la solicitud.");
  return cents;
}
