export const withdrawalStatusLabels = {
  pending: "Pendiente",
  reviewing: "En proceso",
  accepted: "Pagado",
  rejected: "Rechazado",
} as const;

export type WithdrawalStatus = keyof typeof withdrawalStatusLabels;

export function withdrawalDestination(value: string) {
  const text = value.trim().replace(/\s+/g, " ");
  if (text.length < 4 || text.length > 240) throw new Error("Indicá alias, cuenta o teléfono para recibir el pago.");
  return text;
}

export type WithdrawalPayout = {
  method: "alias" | "bank";
  summary: string;
  holderName: string;
  bankName: string;
  accountNumber: string;
  payoutIdentity: string;
};

export function withdrawalAlias(value: string) {
  const text = value.trim().replace(/\s+/g, "");
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) && text.length <= 80) return text.toLowerCase();
  if (/^\+?[0-9][0-9-]{3,19}$/.test(text)) return text;
  throw new Error("Indicá un CI, RUC, teléfono o correo.");
}

export function withdrawalBankAccount(input: { holder: string; bank: string; account: string; identity: string }) {
  const holderName = input.holder.trim().replace(/\s+/g, " ");
  const bankName = input.bank.trim().replace(/\s+/g, " ");
  const accountNumber = input.account.replace(/\s+/g, "");
  const identityNumber = input.identity.replace(/\D/g, "");
  if (holderName.length < 2 || holderName.length > 80) throw new Error("Indicá el nombre del titular.");
  if (bankName.length < 2 || bankName.length > 60) throw new Error("Indicá la entidad bancaria.");
  if (!/^[0-9-]{4,30}$/.test(accountNumber)) throw new Error("Indicá el número de cuenta.");
  if (!/^[0-9]{4,12}$/.test(identityNumber)) throw new Error("Indicá el número de CI.");
  return { holderName, bankName, accountNumber, identityNumber };
}

export function withdrawalPayout(input: { method: string; alias: string; holder: string; bank: string; account: string; identity: string }): WithdrawalPayout {
  if (input.method === "alias") {
    const alias = withdrawalAlias(input.alias);
    return { method: "alias", summary: withdrawalDestination(`Alias ${alias}`), holderName: "", bankName: "", accountNumber: "", payoutIdentity: alias };
  }
  if (input.method === "bank") {
    const bank = withdrawalBankAccount(input);
    const summary = withdrawalDestination(`${bank.holderName} · ${bank.bankName} · ${bank.accountNumber} · CI ${bank.identityNumber}`);
    return { method: "bank", summary, holderName: bank.holderName, bankName: bank.bankName, accountNumber: bank.accountNumber, payoutIdentity: bank.identityNumber };
  }
  throw new Error("Elegí alias o cuenta bancaria.");
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
