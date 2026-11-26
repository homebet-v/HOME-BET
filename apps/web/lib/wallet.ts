/** Reglas de saldo. Importes enteros en centésimos de ficha. */
export type Wallet = { totalCents: number; withdrawableCents: number };
export type WalletMovement = { id: string; type: "deposit" | "bonus" | "stake" | "prize" | "withdrawal"; amountCents: number };
const validAmount = (value: number) => Number.isSafeInteger(value) && value > 0;
export function applyWalletMovement(wallet: Wallet, movement: WalletMovement): Wallet {
  if (!Number.isSafeInteger(wallet.totalCents) || !Number.isSafeInteger(wallet.withdrawableCents) || wallet.withdrawableCents < 0 || wallet.totalCents < wallet.withdrawableCents) throw new Error("Saldo inválido.");
  const amount = movement.amountCents;
  if (!validAmount(amount)) throw new Error("El importe debe ser positivo y válido.");
  let { totalCents, withdrawableCents } = wallet;
  switch (movement.type) {
    case "deposit": case "bonus": totalCents += amount; break;
    case "stake": {
      if (amount > totalCents) throw new Error("Saldo insuficiente para apostar.");
      const restricted = totalCents - withdrawableCents;
      totalCents -= amount;
      withdrawableCents -= Math.max(0, amount - restricted);
      break;
    }
    case "prize": totalCents += amount; withdrawableCents += amount; break;
    case "withdrawal":
      if (amount > withdrawableCents) throw new Error("El retiro supera el saldo retirable.");
      totalCents -= amount; withdrawableCents -= amount; break;
    default: throw new Error("Movimiento no reconocido.");
  }
  if (!Number.isSafeInteger(totalCents) || !Number.isSafeInteger(withdrawableCents)) throw new Error("Importe fuera de rango.");
  return { totalCents, withdrawableCents };
}
export function walletFromMovements(movements: readonly WalletMovement[]): Wallet {
  const ids = new Set<string>();
  return movements.reduce((wallet, movement) => {
    if (ids.has(movement.id)) throw new Error("Movimiento duplicado.");
    ids.add(movement.id);
    return applyWalletMovement(wallet, movement);
  }, { totalCents: 0, withdrawableCents: 0 });
}

export type LedgerKind = "adjustment" | "stake" | "win" | "withdrawal";

export const ledgerMovementLabels: Record<LedgerKind, string> = {
  adjustment: "Acreditación",
  stake: "Apuesta",
  win: "Premio",
  withdrawal: "Retiro",
};
