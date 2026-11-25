"use client";

import { useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { publicPath } from "@/lib/public-path";
import { useDemoPlayer } from "@/components/demo-player-context";
import { walletFromMovements } from "@/lib/wallet";
import { PlayerAccess } from "@/components/player-access";
import { GameCollection } from "@/components/game-collection";
import { NavIcon } from "@/components/nav-icon";
import type { CatalogGame } from "@/lib/fixtures";
import { providers } from "@/lib/fixtures";
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

export function CasinoLobby({ appearance, games, preview = false, initialAccess = false }: { appearance: Appearance; games: readonly CatalogGame[]; preview?: boolean; initialAccess?: boolean }) {
  const demo = useDemoPlayer();
  const animateBanners = useSyncExternalStore(subscribeToBannerPreference, allowsAnimatedBanners, () => false);
  const total = walletFromMovements(demo?.movements ?? []).totalCents;
  const [accessOpen, setAccessOpen] = useState(initialAccess);
  const pathname = publicPath(usePathname() || "/");
  const providerStrip = useRef<HTMLDivElement>(null);
  const [providerFilter, setProviderFilter] = useState<string | null>(null);
  const visibleGames = games.filter((game) => !providerFilter || game.providerSlug === providerFilter);
  const availableProviders = providers.filter((provider) => games.some((game) => game.providerSlug === provider.slug));
  const palette = palettes[appearance.palette];
  const rgb = appearance.background.slice(1).match(/.{2}/g)!.map((part) => parseInt(part, 16));
  const light = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 > 150;
  const emblem = { diamond: "◈", star: "✦", circle: "◎" }[appearance.emblem];
  return <div className={`casino-scenery overflow-hidden ${preview ? `border border-white/10 ${appearance.rounded ? "rounded-2xl" : ""}` : "casino-lobby-public"} text-[color:var(--lobby-text)]`} style={{ backgroundColor: appearance.background, "--casino-background": appearance.backgroundImage ? `linear-gradient(#06101a${Math.round((appearance.backgroundOverlay ?? 75) * 2.55).toString(16).padStart(2, "0")}, #06101a${Math.round((appearance.backgroundOverlay ?? 75) * 2.55).toString(16).padStart(2, "0")}), url("${appearance.backgroundImage}")` : "none", "--casino-accent": palette.accent, "--lobby-text": light ? "#111827" : "#f1f5f9", "--lobby-muted": light ? "#374151" : "#cbd5e1" } as CSSProperties}>
    <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4"><div className="flex min-w-0 items-center gap-2">{appearance.logoImage ? <img src={appearance.logoImage} alt={appearance.brand || "Logo de la casa"} className="h-10 w-[clamp(80px,27vw,180px)] max-w-full object-contain object-left sm:h-12 sm:w-[220px]" /> : <><span style={{ color: palette.accent }} className="text-2xl" aria-hidden="true">{emblem}</span><span className="truncate text-lg font-bold">{appearance.brand || "Tu casino"}</span></>}</div><div className="flex shrink-0 items-center gap-2">{demo?.signedIn && !preview ? <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black p-1 pl-2.5"><button type="button" aria-label="Ver mi saldo y perfil" onClick={() => setAccessOpen(true)} className="flex items-center gap-1.5 px-1 py-1.5 text-xs font-semibold text-white tabular-nums sm:text-sm"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: palette.accent }}><circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="1.5" /><path d="M14.5 8.5h-3.8a1.8 1.8 0 0 0 0 3.5h2.6a1.8 1.8 0 0 1 0 3.5H9.5M12 6.5v11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>{new Intl.NumberFormat("es-PY").format(total / 100)}</button><Link href="/cargar" className="rounded-full px-3 py-2.5 text-xs font-semibold sm:px-4" style={{ background: palette.accent, color: palette.ink }}>Cargar</Link></div> : preview ? <span className="rounded-full px-4 py-2 text-[11px] font-semibold" style={{ background: palette.accent, color: palette.ink }}>Ingresar</span> : <button type="button" onClick={() => setAccessOpen(true)} className="rounded-full px-4 py-2 text-[11px] font-semibold" style={{ background: palette.accent, color: palette.ink }}>Ingresar</button>}</div></div>
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
    <div className={preview ? "" : "pb-24"}><GameCollection games={visibleGames} accent={palette.accent} rounded={appearance.rounded} showProviders={appearance.showProviders} /></div>
    <nav aria-label="Navegación de la casa" className={`${preview ? "sticky bottom-0" : "fixed inset-x-0 bottom-0 w-full"} z-30 grid grid-cols-4 border-t border-white/10 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_#00000030]`} style={{ background: appearance.background }}>{[{ href: "/", label: "Inicio", icon: "/inicio" }, { href: "/juegos", label: "Juegos", icon: "/casino-juegos" }, { href: "/cargar", label: "Cargar", icon: "/cargar" }, { href: "/cuenta", label: "Perfil", icon: "/perfil" }].map((item) => {
      const active = preview ? item.href === "/" : pathname === item.href;
      const content = <><span className={`flex size-9 items-center justify-center rounded-xl ${active ? "bg-white/[0.06]" : ""}`}><NavIcon href={item.icon} className="!size-[21px] [stroke-width:1.5]" /></span><span>{item.label}</span></>;
      const style = { color: active ? palette.accent : "var(--lobby-muted)" };
      return preview ? <span key={item.href} className="flex flex-col items-center gap-1 py-1 text-[10px] font-medium" style={style}>{content}</span> : item.href === "/cuenta" ? <button type="button" key={item.href} onClick={() => setAccessOpen(true)} className="flex flex-col items-center gap-1 rounded-lg py-1 text-[10px] font-medium hover:bg-white/5" style={style}>{content}</button> : <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className="flex flex-col items-center gap-1 rounded-lg py-1 text-[10px] font-medium transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2" style={style}>{content}</Link>;
    })}</nav>
    {!preview && <PlayerAccess appearance={appearance} open={accessOpen} onClose={() => setAccessOpen(false)} />}
  </div>;
}
