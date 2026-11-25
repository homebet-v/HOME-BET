import { HouseGate } from "@/components/house-gate";
import { MissingHouse } from "@/components/missing-house";
import { catalog, gameEnabled, houseBySlug } from "@/lib/fixtures";

function Games({ slug }: { slug: string }) {
  const house = houseBySlug(slug);
  if (!house) return <MissingHouse slug={slug} />;

  return (
    <div className="flex flex-col gap-8" data-screen="admin-juegos">
      <section className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">Juegos</h1>
        <p className="max-w-xl text-sm leading-6 text-zinc-400">
          Esta casa elige cuáles juegos publicados de Home están activos. El cambio se guarda cuando Supabase esté conectado.
        </p>
      </section>
      <ul className="flex flex-col divide-y divide-white/10 rounded-2xl border border-white/10">
        {catalog.map((game) => {
          const enabled = gameEnabled(slug, game.slug);
          return (
            <li key={game.slug} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <span>
                {game.name}
                <span className="ml-2 text-zinc-500">{game.version}</span>
              </span>
              <span className="text-zinc-300">{enabled ? "Activo" : "Inactivo"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function AdminGamesPage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{(slug) => <Games slug={slug} />}</HouseGate>;
}
