const amount = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2 });

export function WalletBreakdown({ totalCents, withdrawableCents }: { totalCents: number; withdrawableCents: number }) {
  const balances = [
    ["Saldo total", totalCents],
    ["Disponible para retirar", withdrawableCents],
    ["Disponible solo para jugar", totalCents - withdrawableCents],
  ] as const;

  return <dl className="grid gap-2 sm:grid-cols-3">
    {balances.map(([label, cents]) => <div key={label} className="min-w-0 rounded-lg border border-white/10 bg-black/20 p-3">
      <dt className="text-xs text-slate-300">{label}</dt>
      <dd className="mt-1 break-words font-semibold tabular-nums">
        {amount.format(cents / 100)} <span className="text-xs font-normal text-slate-300">fichas</span>
      </dd>
    </div>)}
  </dl>;
}
