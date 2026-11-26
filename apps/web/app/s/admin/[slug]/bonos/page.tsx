import { HouseGate } from "@/components/house-gate";
import { BonusEditor } from "@/components/bonus-editor";
import { houseBonuses } from "@/lib/house-operations";
import { adminSession } from "@/lib/platform";

const date = new Intl.DateTimeFormat("es-PY", { dateStyle: "short", timeStyle: "short", timeZone: "America/Asuncion" });

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{async (slug) => {
    const account = await adminSession(slug);
    if (!account) return null;
    const bonuses = await houseBonuses(account.casino.id, account.session.auth);
    return <section className="space-y-4">
      <h1 className="text-xl font-semibold">Bonos</h1>
      {account.casino.status === "active" && <BonusEditor />}
      <h2 className="font-semibold">Promociones guardadas</h2>
      {bonuses.length ? <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-[#142440] px-4">
        {bonuses.map((bonus) => <li key={bonus.id} className="grid gap-1 py-3 text-sm">
          <strong>{bonus.name}</strong>
          <span>{bonus.amount / 100}{bonus.kind === "percentage" ? "%" : " fichas"} · Tope {bonus.capCents / 100} fichas</span>
          <span className="text-slate-300">{date.format(new Date(bonus.startsAt))} – {date.format(new Date(bonus.endsAt))}</span>
        </li>)}
      </ul> : <p>Todavía no hay promociones guardadas.</p>}
    </section>;
  }}</HouseGate>;
}
