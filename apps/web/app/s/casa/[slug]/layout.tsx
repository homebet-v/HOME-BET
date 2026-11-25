import type { Metadata } from "next";
import { Suspense, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
import { DemoPlayerProvider } from "@/components/demo-player-context";
import { defaultAppearance, palettes } from "@/lib/appearance";
import { houseBySlug } from "@/lib/fixtures";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const name = houseBySlug(slug)?.name ?? "Casino";
  return {
    title: { absolute: name },
    description: `${name}. La casa de juegos.`,
  };
}

async function CasaFrame({ params, children }: { params: Promise<{ slug: string }>; children: ReactNode }) {
  const { slug } = await params;
  const house = houseBySlug(slug);
  const appearance = defaultAppearance(house?.name ?? "");
  const overlay = Math.round((appearance.backgroundOverlay ?? 45) * 2.55).toString(16).padStart(2, "0");
  return (
    <DemoPlayerProvider key={slug} casinoId={slug}>
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
    </DemoPlayerProvider>
  );
}
export default function CasaLayout({ params, children }: { params: Promise<{ slug: string }>; children: ReactNode }) {
  return <Suspense fallback={<p className="p-5 text-sm text-slate-400">Cargando la casa…</p>}><CasaFrame params={params}>{children}</CasaFrame></Suspense>;
}
