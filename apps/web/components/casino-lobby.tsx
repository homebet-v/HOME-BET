"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { GameCollection } from "@/components/game-collection";
import { HouseFrame } from "@/components/house-frame";
import type { CatalogGame } from "@/lib/game-library";
import { providers } from "@/lib/game-library";
import { palettes, type Appearance } from "@/lib/appearance";

const animatedBannerQuery = "(prefers-reduced-motion: no-preference)";

function subscribeToBannerPreference(onChange: () => void) {
  const query = window.matchMedia(animatedBannerQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function allowsAnimatedBanners() {
  return window.matchMedia(animatedBannerQuery).matches;
}

export function CasinoLobby({ appearance, games, preview = false, framed = true }: { appearance: Appearance; games: readonly CatalogGame[]; preview?: boolean; framed?: boolean }) {
  const animateBanners = useSyncExternalStore(subscribeToBannerPreference, allowsAnimatedBanners, () => false);
  const providerStrip = useRef<HTMLDivElement>(null);
  const [providerFilter, setProviderFilter] = useState<string | null>(null);
  const visibleGames = games.filter((game) => !providerFilter || game.providerSlug === providerFilter);
  const availableProviders = providers.filter((provider) => games.some((game) => game.providerSlug === provider.slug));
  const palette = palettes[appearance.palette];
  const content = <>
    {appearance.banners.length > 0 && <section aria-label="Banners de la casa" className={`casino-scroll flex snap-x snap-mandatory gap-3 overflow-x-auto border-b border-white/10 ${preview ? "p-3" : "px-2 py-3 sm:px-3"}`}>{appearance.banners.map((banner) => <div key={banner.id} className={`relative w-full min-w-full shrink-0 snap-center overflow-hidden ${!preview || appearance.rounded ? "rounded-xl" : ""}`}><img src={banner.image} alt={banner.alt || "Banner de la casa"} className="aspect-[3/1] w-full object-cover" />{banner.video && animateBanners && <video poster={banner.image} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" onError={(event) => { event.currentTarget.remove(); }} className="pointer-events-none absolute inset-0 h-full w-full object-cover motion-reduce:hidden"><source src={banner.video.replace(/\.mp4$/, ".webm")} type="video/webm" /><source src={banner.video} type="video/mp4" /></video>}</div>)}</section>}
    {appearance.banners.length > 1 && <p className="px-4 py-2 text-[10px] text-[color:var(--lobby-muted)]">Deslizá para ver los {appearance.banners.length} banners →</p>}
    {appearance.showWelcome && <div className={`relative overflow-hidden border-b border-white/10 px-5 ${appearance.layout === "spotlight" ? "py-10 sm:px-7" : "py-5"}`} style={{ background: `radial-gradient(ellipse at top right, ${palette.accent}30, transparent 75%)` }}>
      <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: palette.accent }}>Una casa. Tu estilo.</p><h2 className={`${appearance.layout === "spotlight" ? "text-3xl" : "text-xl"} max-w-md break-words font-bold tracking-tight`}>{appearance.title || "Bienvenido a tu casa"}</h2><p className="mt-3 max-w-sm break-words text-xs leading-6 text-[color:var(--lobby-muted)]">{appearance.description}</p>
      {preview ? <span className="mt-5 inline-block rounded-lg px-4 py-2 text-xs font-semibold" style={{ background: palette.accent, color: palette.ink }}>Explorar juegos →</span> : <Link href="/juegos" className="mt-5 inline-block rounded-lg px-4 py-2 text-xs font-semibold" style={{ background: palette.accent, color: palette.ink }}>Explorar juegos →</Link>}
    </div>}
    {appearance.showProviders && <div className="relative border-b border-white/10 px-6 py-3">
      <button type="button" aria-label="Ver proveedores anteriores" onClick={() => providerStrip.current?.scrollBy({ left: -220, behavior: "smooth" })} className="absolute inset-y-0 left-0 z-10 flex w-5 items-center justify-center bg-transparent p-0 transition hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px]" style={{ color: "var(--lobby-muted)" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m14.5 6-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
      <div ref={providerStrip} className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Filtrar juegos por proveedor"><button aria-pressed={providerFilter === null} onClick={() => setProviderFilter(null)} className="shrink-0 rounded-[12px] border bg-black px-4 py-2 text-[11px]" style={{ borderColor: providerFilter === null ? palette.accent : "#ffffff20", color: providerFilter === null ? palette.accent : "var(--lobby-muted)" }}>Todos los juegos</button>{availableProviders.map((provider) => <button key={provider.slug} aria-pressed={providerFilter === provider.slug} onClick={() => setProviderFilter(provider.slug)} className="flex shrink-0 items-center gap-2 rounded-[12px] border bg-black px-3 py-2 text-[11px]" style={{ borderColor: providerFilter === provider.slug ? palette.accent : "#ffffff20" }}><span className="flex size-7 shrink-0 items-center justify-center rounded-md text-[8px] font-bold" style={{ background: `${provider.color}20`, color: provider.color }}><img src={provider.iconImage} alt="" className="size-6 object-contain" /></span>{provider.name}</button>)}</div>
      <button type="button" aria-label="Ver más proveedores" onClick={() => providerStrip.current?.scrollBy({ left: 220, behavior: "smooth" })} className="absolute inset-y-0 right-0 z-10 flex w-5 items-center justify-center bg-transparent p-0 transition hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px]" style={{ color: "var(--lobby-muted)" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9.5 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
    </div>}
    <div className="casino-catalog-scenery"><GameCollection games={visibleGames} accent={palette.accent} rounded={appearance.rounded} showProviders={appearance.showProviders} /></div>
  </>;
  return framed ? <HouseFrame appearance={appearance} preview={preview}>{content}</HouseFrame> : content;
}
