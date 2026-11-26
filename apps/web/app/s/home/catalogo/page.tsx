import Link from "next/link";
import { Suspense } from "react";
import { homeSession, publishedGames } from "@/lib/platform";
import { publishCatalog } from "@/lib/platform-actions";

export const metadata = { title: "Catálogo · Homebet" };

async function PublishedCatalog() {
  const session = await homeSession();
  if (!session) return null;
  const games = await publishedGames(session.auth);
  return <section className="space-y-4">
    <h1 className="text-xl font-semibold">Catálogo publicado</h1>
    <form action={publishCatalog}>
      <input type="hidden" name="confirm" value="yes" />
      <button className="rounded-lg bg-white/15 px-4 py-2">Publicar catálogo incluido</button>
    </form>
    {games.length ? <ul className="divide-y divide-white/10">{games.map((game) => <li key={game.id} className="py-2">{game.name}</li>)}</ul> : <p>Todavía no hay juegos publicados.</p>}
    <Link className="underline" href="/juegos">Abrir el taller</Link>
  </section>;
}

export default function CatalogPage() {
  return <Suspense fallback={<p>Cargando catálogo…</p>}><PublishedCatalog /></Suspense>;
}
