const wholeAmount = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2 });
const abbreviatedAmount = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 6 });

/** Display only. Bets and payouts always retain their exact value in centésimos. */
export function chipLabel(amountCents: number): string {
  const amount = amountCents / 100;
  // Only abbreviate when no precision would be lost in the label.
  if (amountCents >= 100_000_000 && amountCents % 100 === 0) return `${abbreviatedAmount.format(amount / 1_000_000)}M`;
  if (amountCents >= 100_000) return `${abbreviatedAmount.format(amount / 1_000)}k`;
  return wholeAmount.format(amount);
}
