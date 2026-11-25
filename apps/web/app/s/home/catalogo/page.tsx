import Link from "next/link";
import { HomeHeading } from "@/components/home-heading";
import { QuietStatus } from "@/components/quiet-status";
import { catalog, enabledGames, houses, providers } from "@/lib/fixtures";

export const metadata = { title: "Catálogo · Homebet" };

export default function CatalogPage() {
  return (
    <div className="flex flex-col gap-12" data-screen="home-catalogo">
      <HomeHeading
        kicker="Juegos"
        title="Catálogo"
        lede="Acá viven los juegos ya publicados. El taller queda aparte. Un casino solo elige cuáles de esta lista enciende."
      />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Juegos publicados en el catálogo</caption>
          <thead className="text-xs tracking-wide text-zinc-500 uppercase">
            <tr className="border-b border-white/10">
              <th className="py-3 pr-4 font-medium">Juego</th>
              <th className="py-3 pr-4 font-medium">Proveedor</th>
              <th className="py-3 pr-4 font-medium">Versión</th>
              <th className="py-3 pr-4 font-medium">Estado</th>
              <th className="py-3 font-medium">Activo en</th>
            </tr>
          </thead>
          <tbody>
            {catalog.map((game) => {
              const enabled = houses
                .filter((house) => (enabledGames[house.slug] ?? []).includes(game.slug))
                .map((house) => house.slug);
              return (
                <tr key={game.slug} className="border-b border-white/10">
                  <td className="py-4 pr-4">{game.name}</td>
                  <td className="py-4 pr-4 text-zinc-400">{providers.find((provider) => provider.slug === game.providerSlug)?.name}</td>
                  <td className="py-4 pr-4 text-zinc-400">{game.version}</td>
                  <td className="py-4 pr-4">
                    <QuietStatus status={game.status} />
                  </td>
                  <td className="py-4 text-zinc-400">
                    {enabled.length > 0 ? enabled.join(", ") : "Ningún casino"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Link href="/juegos" className="text-sm text-zinc-400 underline decoration-white/20 underline-offset-4">
        Volver al taller
      </Link>
    </div>
  );
}
