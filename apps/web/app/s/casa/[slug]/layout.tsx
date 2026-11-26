import type { Metadata } from "next";
import { Suspense, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
import { GameAssetCache } from "@/components/game-asset-cache";
import { PlayerSessionProvider } from "@/components/player-session";
import { casinoBySlug, playerAccount } from "@/lib/platform";
import { defaultAppearance, palettes } from "@/lib/appearance";
import { MissingHouse } from "@/components/missing-house";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const name = (await casinoBySlug(slug))?.name ?? "Casino";
  return {
    title: { absolute: name },
    description: `${name}. La casa de juegos.`,
  };
}

async function CasaFrame({ params, children }: { params: Promise<{ slug: string }>; children: ReactNode }) {
  const { slug } = await params;
  const [house, account] = await Promise.all([casinoBySlug(slug), playerAccount(slug)]);
  if (!house) return <MissingHouse slug={slug} />;
  if (house.status !== "active") return <p className="p-6">Esta casa está suspendida.</p>;
  const appearance = defaultAppearance(house.name);
  const overlay = Math.round((appearance.backgroundOverlay ?? 45) * 2.55).toString(16).padStart(2, "0");
  return (
    <PlayerSessionProvider key={slug} account={account ? { email: account.email, balanceCents: account.balanceCents } : null}>
      <GameAssetCache />
      <div
        className="casino-scenery min-h-dvh min-w-0 flex-1"
        style={{
          backgroundColor: appearance.background,
          "--casino-accent": palettes[appearance.palette].accent,
          "--casino-background": appearance.backgroundImage
            ? `linear-gradient(#06101a${overlay}, #06101a${overlay}), url("${appearance.backgroundImage}")`
            : undefined,
        } as CSSProperties}
      >
        <main className="min-w-0 [&:not(:has(.casino-lobby-public))]:mx-auto [&:not(:has(.casino-lobby-public))]:max-w-5xl [&:not(:has(.casino-lobby-public))]:px-2 sm:[&:not(:has(.casino-lobby-public))]:px-5">
          {children}
        </main>
        <footer className="mx-auto flex max-w-5xl flex-wrap justify-between gap-3 px-3 py-5 text-[10px] text-slate-500">
          <span>Solo mayores de 18 años · Jugá con responsabilidad</span>
          <div className="flex flex-wrap gap-4">
            <Link href="/">Inicio</Link>
            <Link href="/juegos">Juegos</Link>
            <Link href="/cargar">Cargar</Link>
            <Link href="/cuenta">Perfil</Link>
          </div>
        </footer>
      </div>
    </PlayerSessionProvider>
  );
}
export default function CasaLayout({ params, children }: { params: Promise<{ slug: string }>; children: ReactNode }) {
  return <Suspense fallback={<p className="p-5 text-sm text-slate-400">Cargando la casa…</p>}><CasaFrame params={params}>{children}</CasaFrame></Suspense>;
}
