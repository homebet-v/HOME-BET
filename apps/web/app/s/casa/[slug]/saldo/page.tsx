import Link from "next/link";
import { HouseGate } from "@/components/house-gate";
import { playerLedger } from "@/lib/platform";

export const metadata = { title: "Saldo · Mi casa" };
const display = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2 });
const kinds = { adjustment: "Acreditación", stake: "Jugada", win: "Premio" };

export default function WalletPage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{async (slug) => {
    const wallet = await playerLedger(slug);
    if (!wallet) return <Link href="/cuenta">Ingresá para ver tu saldo</Link>;
    return <section className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Saldo</h1>
      <p className="text-2xl font-bold">{display.format(wallet.balanceCents / 100)} fichas</p>
      <h2 className="font-semibold">Últimos movimientos</h2>
      {wallet.entries.length ? <ul className="divide-y divide-white/10">
        {wallet.entries.map((entry) => <li key={entry.id} className="flex justify-between gap-4 py-3 text-sm">
          <span>{kinds[entry.kind]}</span><span>{display.format(entry.amount_cents / 100)} fichas</span>
        </li>)}
      </ul> : <p className="text-sm">Todavía no hay movimientos.</p>}
    </section>;
  }}</HouseGate>;
}
