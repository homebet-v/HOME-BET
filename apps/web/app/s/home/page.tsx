import Link from "next/link";
import { Suspense } from "react";
import { NavIcon } from "@/components/nav-icon";
import { providers } from "@/lib/game-library";
import { homeCasinos, homeSession, publishedGames } from "@/lib/platform";

export const metadata = { title: "Resumen · Homebet" };

async function HomeOverview() {
  const session = await homeSession();
  if (!session) return null;
  const [houses, games] = await Promise.all([homeCasinos(), publishedGames(session.auth)]);
  const cards = [
    { title: "Casinos activos", value: houses.filter((house) => house.status === "active").length, href: "/casas", color: "#34d399" },
    { title: "Juegos publicados", value: games.length, href: "/catalogo", color: "#fbbf24" },
    { title: "Proveedores", value: providers.length, href: "/proveedores", color: "#c084fc" },
    { title: "Movimientos de fichas", value: null, href: "/fichas", color: "#38bdf8" },
  ];

  return <section className="space-y-5" data-screen="home-resumen">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold">Centro de operaciones</h1>
      <Link href="/casas" className="rounded-lg bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950">Crear casa</Link>
    </header>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => <Link key={card.href} href={card.href} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#142440] p-4">
        <div>
          <div className="text-xs font-medium text-slate-300">{card.title}</div>
          {card.value !== null && <div className="mt-1 text-2xl font-bold">{card.value}</div>}
        </div>
        <span style={{ color: card.color }}><NavIcon href={card.href} /></span>
      </Link>)}
    </div>
    <div className="flex flex-wrap gap-4 text-sm">
      <Link href="/dominios" className="underline">Dominios</Link>
      <Link href="/juegos" className="underline">Taller de juegos</Link>
    </div>
  </section>;
}

export default function HomeOverviewPage() {
  return <Suspense fallback={<p>Cargando resumen…</p>}><HomeOverview /></Suspense>;
}
