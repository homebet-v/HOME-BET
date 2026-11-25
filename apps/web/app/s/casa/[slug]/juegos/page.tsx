import { GameCatalog } from "@/components/game-catalog";
import { HouseGate } from "@/components/house-gate";
import { MissingHouse } from "@/components/missing-house";
import { enabledCatalog, houseBySlug } from "@/lib/fixtures";

function Games({ slug }: { slug: string }) {
  const house = houseBySlug(slug);
  if (!house) return <MissingHouse slug={slug} />;

  const games = house.status === "suspended" ? [] : enabledCatalog(slug);

  return (
    <div className="flex flex-col gap-8" data-screen="casa-juegos">
      <section className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">Juegos</h1>
        <p className="max-w-xl text-sm leading-6 text-zinc-400">
          {house.status === "suspended"
            ? "La casa está suspendida y no muestra juegos."
            : "Solo aparecen los juegos que esta casa tiene activos."}
        </p>
      </section>
      {games.length === 0 ? (
        <p className="text-sm text-zinc-400">No hay juegos activos.</p>
      ) : (
        <GameCatalog games={games} />
      )}
    </div>
  );
}

export default function CasaGamesPage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{(slug) => <Games slug={slug} />}</HouseGate>;
}
