import { Suspense } from "react";
import { HomeHeading } from "@/components/home-heading";
import { homeLedger } from "@/lib/platform";

export const metadata = { title: "Fichas · Homebet" };
const quantity = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2 });
const date = new Intl.DateTimeFormat("es-PY", { dateStyle: "short", timeStyle: "short", timeZone: "America/Asuncion" });

async function ChipHistory() {
  const entries = await homeLedger();
  return <section className="space-y-4">
    <HomeHeading kicker="Plataforma" title="Fichas" lede="Las acreditaciones se registran en el panel de cada casa." />
    <h2 className="text-lg font-semibold">Últimos movimientos</h2>
    {entries.length ? <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead><tr><th>Fecha</th><th>Casa</th><th>Fichas</th></tr></thead>
        <tbody>{entries.map((entry) => <tr className="border-t border-white/10" key={entry.id}>
          <td className="whitespace-nowrap py-2 pr-3">{date.format(new Date(entry.created_at))}</td>
          <td className="pr-3">{entry.casinos.name}</td>
          <td>{quantity.format(entry.amount_cents / 100)}</td>
        </tr>)}</tbody>
      </table>
    </div> : <p>Todavía no hay movimientos.</p>}
  </section>;
}

export default function ChipsPage() {
  return <Suspense fallback={<p>Cargando fichas…</p>}><ChipHistory /></Suspense>;
}
