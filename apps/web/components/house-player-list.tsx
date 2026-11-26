import { HouseGate } from "@/components/house-gate";
import { verifyPlayer } from "@/lib/platform-actions";
import { housePlayers } from "@/lib/platform";

export function HousePlayerList({ params, title, review = false }: { params: Promise<{ slug: string }>; title: string; review?: boolean }) {
  return <HouseGate params={params}>{async (slug) => {
    const data = await housePlayers(slug);
    if (!data) return null;
    return <section className="space-y-4">
      <h1 className="text-xl font-bold">{title}</h1>
      {data.players.length ? <ul className="divide-y divide-white/10">
        {data.players.map((player) => <li key={player.id} className="flex flex-wrap justify-between gap-3 py-3">
          <span>{player.display_name || player.id}</span>
          <span>{player.verified_at ? "Verificado" : "Pendiente"}</span>
          <time dateTime={player.created_at}>{new Intl.DateTimeFormat("es-PY", { dateStyle: "short", timeZone: "America/Asuncion" }).format(new Date(player.created_at))}</time>
          {review && !player.verified_at && data.casino.status === "active" && <form action={verifyPlayer}>
            <input type="hidden" name="playerId" value={player.id} />
            <button className="rounded-lg border border-white/20 px-3 py-2">Aprobar registro</button>
          </form>}
        </li>)}
      </ul> : <p>Todavía no hay jugadores registrados.</p>}
    </section>;
  }}</HouseGate>;
}
