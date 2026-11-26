import { HouseGate } from "@/components/house-gate";
import { houseLedger } from "@/lib/platform";

export const metadata = { title: "Historial · Mi casino" };
const date = new Intl.DateTimeFormat("es-PY", { dateStyle: "short", timeStyle: "short", timeZone: "America/Asuncion" });
const quantity = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2 });

export default function HistoryPage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{async (slug) => {
    const movements = await houseLedger(slug);
    if (!movements) return null;
    return <section className="space-y-4">
      <h1 className="text-xl font-bold">Historial de fichas</h1>
      {movements.length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm">
        <thead><tr><th>Fecha</th><th>Jugador</th><th>Responsable</th><th>Fichas</th></tr></thead>
        <tbody>{movements.map((entry) => <tr className="border-t border-white/10" key={entry.id}>
          <td className="whitespace-nowrap py-2 pr-3">{date.format(new Date(entry.created_at))}</td>
          <td className="break-all pr-3">{entry.player_id}</td>
          <td className="break-all pr-3">{entry.adjustment_actor ?? "—"}</td>
          <td>{quantity.format(entry.amount_cents / 100)}</td>
        </tr>)}</tbody>
      </table></div> : <p>Todavía no hay movimientos.</p>}
    </section>;
  }}</HouseGate>;
}
