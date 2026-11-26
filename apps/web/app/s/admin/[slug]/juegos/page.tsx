import { HouseGate } from "@/components/house-gate";
import { adminSession, houseGameSlugs, publishedGames } from "@/lib/platform";
import { setHouseGame } from "@/lib/platform-actions";

export default function AdminGamesPage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{async (slug) => {
    const account = await adminSession(slug);
    if (!account) return null;
    const [games, slugs] = await Promise.all([publishedGames(account.session.auth), houseGameSlugs(slug)]);
    const enabled = new Set(slugs);
    return <section className="space-y-4" data-screen="admin-juegos">
      <h1 className="text-xl font-semibold">Juegos</h1>
      {games.length ? <ul className="divide-y divide-white/10">
        {games.map((game) => <li key={game.id} className="flex items-center justify-between gap-3 py-3">
          <span>{game.name}</span>
          <form action={setHouseGame}>
            <input type="hidden" name="game" value={game.id} />
            <input type="hidden" name="enabled" value={String(!enabled.has(game.slug))} />
            <button className="rounded-lg border border-white/15 px-3 py-1.5">{enabled.has(game.slug) ? "Desactivar" : "Activar"}</button>
          </form>
        </li>)}
      </ul> : <p>Todavía no hay juegos publicados en Home.</p>}
    </section>;
  }}</HouseGate>;
}
