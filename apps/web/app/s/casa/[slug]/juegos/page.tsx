import { GameCatalog } from "@/components/game-catalog";
import { HouseGate } from "@/components/house-gate";
import { MissingHouse } from "@/components/missing-house";
import { casinoBySlug, publicHouseCatalog } from "@/lib/platform";

async function Games({ slug }: { slug: string }) {
  const house = await casinoBySlug(slug);
  if (!house) return <MissingHouse slug={slug} />;

  const games = house.status === "suspended" ? [] : await publicHouseCatalog(slug);

  return <div className="casino-catalog-scenery px-4 pt-4 sm:px-5" data-screen="casa-juegos">
    {house.status === "suspended" ? <p className="text-sm text-zinc-400">La casa está suspendida y no muestra juegos.</p> : games.length === 0 ? <p className="text-sm text-zinc-400">No hay juegos activos.</p> : <GameCatalog games={games} />}
  </div>;
}

export default function CasaGamesPage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{(slug) => <Games slug={slug} />}</HouseGate>;
}
