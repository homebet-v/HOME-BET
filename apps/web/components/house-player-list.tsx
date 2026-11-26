import { HouseGate } from "@/components/house-gate";
import { housePlayers } from "@/lib/platform";

export function HousePlayerList({ params, title }: { params: Promise<{ slug: string }>; title: string }) {
  return <HouseGate params={params}>{async (slug) => {
    const data = await housePlayers(slug);
    if (!data) return null;
    return <section className="space-y-4">
      <h1 className="text-xl font-bold">{title}</h1>
      {data.players.length ? <ul className="divide-y divide-white/10">
        {data.players.map((player) => <li key={player.id} className="flex flex-wrap justify-between gap-3 py-3">
          <span>{player.display_name || player.id}</span>
          <time dateTime={player.created_at}>{new Intl.DateTimeFormat("es-PY", { dateStyle: "short", timeZone: "America/Asuncion" }).format(new Date(player.created_at))}</time>
        </li>)}
      </ul> : <p>Todavía no hay jugadores registrados.</p>}
    </section>;
  }}</HouseGate>;
}
