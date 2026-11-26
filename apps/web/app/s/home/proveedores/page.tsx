import Link from "next/link";
import { ProviderRtpControl } from "@/components/provider-rtp-control";
import { HomeHeading } from "@/components/home-heading";
import { catalog, providers } from "@/lib/game-library";

export const metadata = { title: "Proveedores · Homebet" };

export default function ProvidersPage() {
  return <div className="flex flex-col gap-10" data-screen="home-proveedores">
    <HomeHeading kicker="Juegos propios" title="Proveedores" lede="Una identidad para cada línea de juegos. Home crea las marcas y mantiene un catálogo compartido para sus casinos." />
    <ProviderRtpControl />
    <div className="grid gap-5 sm:grid-cols-2">
      {providers.map((provider) => {
        const games = catalog.filter((game) => game.providerSlug === provider.slug);
        return <section key={provider.slug} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="mb-6 flex items-center justify-between"><span style={{ color: provider.color, borderColor: provider.color }} className="flex size-12 items-center justify-center rounded-xl border text-sm font-semibold"><img src={provider.iconImage} alt="" className="size-10 object-contain" /></span><span className="text-xs text-zinc-500">Proveedor propio</span></div>
          <h2><img src={provider.logoImage} alt={provider.name} className="h-12 max-w-full object-contain object-left" /></h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{provider.description}</p>
          <ul className="mt-6 border-t border-white/10 pt-4 text-sm text-zinc-300">{games.map((game) => <li key={game.slug} className="flex justify-between py-1"><span>{game.name}</span><span className="text-zinc-500">v{game.version}</span></li>)}</ul>
          <p className="mt-4 text-xs text-zinc-500">{games.length} juegos en la biblioteca</p>
        </section>;
      })}
    </div>
    <Link href="/catalogo" className="text-sm text-sky-300 underline underline-offset-4">Ver juegos del catálogo →</Link>
  </div>;
}
