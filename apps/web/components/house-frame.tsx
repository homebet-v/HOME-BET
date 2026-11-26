"use client";

import { useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon } from "@/components/nav-icon";
import "./player-profile.css";
import { PlayerAccess } from "@/components/player-access";
import { usePlayerSession } from "@/components/player-session";
import { defaultAppearance, palettes, type Appearance } from "@/lib/appearance";
import { publicPath } from "@/lib/public-path";

const houseNav = [
  { href: "/", label: "Inicio", icon: "/inicio" },
  { href: "/juegos", label: "Juegos", icon: "/casino-juegos" },
  { href: "/cargar", label: "Cargar", icon: "/cargar" },
  { href: "/cuenta", label: "Perfil", icon: "/perfil" },
] as const;

export function HouseFrame({ appearance, preview = false, children }: { appearance: Appearance; preview?: boolean; children: ReactNode }) {
  const account = usePlayerSession();
  const total = account?.balanceCents ?? 0;
  const [accessOpen, setAccessOpen] = useState(false);
  const pathname = publicPath(usePathname() || "/");
  const palette = palettes[appearance.palette];
  const rgb = appearance.background.slice(1).match(/.{2}/g)!.map((part) => parseInt(part, 16));
  const light = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 > 150;
  const emblem = { diamond: "◈", star: "✦", circle: "◎" }[appearance.emblem];

  return <div className={`casino-scenery min-h-dvh overflow-hidden ${preview ? `border border-white/10 ${appearance.rounded ? "rounded-2xl" : ""}` : "casino-lobby-public"} text-[color:var(--lobby-text)]`} data-casino-palette={appearance.palette} style={{ backgroundColor: appearance.background, "--casino-surface": appearance.background, "--casino-art": appearance.backgroundImage ? `url("${appearance.backgroundImage}")` : undefined, "--casino-background": appearance.backgroundImage ? `linear-gradient(#06101a${Math.round((appearance.backgroundOverlay ?? 75) * 2.55).toString(16).padStart(2, "0")}, #06101a${Math.round((appearance.backgroundOverlay ?? 75) * 2.55).toString(16).padStart(2, "0")}), url("${appearance.backgroundImage}")` : "none", "--casino-accent": palette.accent, "--lobby-text": light ? "#111827" : "#f1f5f9", "--lobby-muted": light ? "#374151" : "#cbd5e1" } as CSSProperties}>
    <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4"><div className="flex min-w-0 items-center gap-2">{appearance.logoImage ? <img src={appearance.logoImage} alt={appearance.brand || "Logo de la casa"} className="h-10 w-[clamp(80px,27vw,180px)] max-w-full object-contain object-left sm:h-12 sm:w-[220px]" /> : <><span style={{ color: palette.accent }} className="text-2xl" aria-hidden="true">{emblem}</span><span className="truncate text-lg font-bold">{appearance.brand || "Tu casino"}</span></>}</div><div className="flex shrink-0 items-center gap-2">{account?.verified && !preview ? <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black p-1 pl-2.5"><Link href="/cuenta" prefetch aria-label="Ver mi perfil" className="flex items-center gap-1.5 px-1 py-1.5 text-xs font-semibold text-white tabular-nums sm:text-sm"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: palette.accent }}><circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="1.5" /><path d="M14.5 8.5h-3.8a1.8 1.8 0 0 0 0 3.5h2.6a1.8 1.8 0 0 1 0 3.5H9.5M12 6.5v11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg><span className="whitespace-nowrap">{new Intl.NumberFormat("es-PY").format(total / 100)}</span></Link><Link href="/cargar" prefetch className="relative overflow-hidden rounded-full px-3 py-2.5 text-xs font-semibold sm:px-4" style={{ background: "linear-gradient(180deg, #3dff86 0%, #00c853 46%, #067a34 100%)", color: "#000" }}><span className="load-chip-shine" aria-hidden="true" /><span className="relative z-10">Cargar</span></Link></div> : preview ? <span className="rounded-full px-4 py-2 text-[11px] font-semibold" style={{ background: palette.accent, color: palette.ink }}>Ingresar</span> : account ? <Link href="/cuenta" prefetch className="rounded-full px-4 py-2 text-[11px] font-semibold" style={{ background: palette.accent, color: palette.ink }}>Mi cuenta</Link> : <button type="button" onClick={() => setAccessOpen(true)} className="rounded-full px-4 py-2 text-[11px] font-semibold" style={{ background: palette.accent, color: palette.ink }}>Ingresar</button>}</div></div>
    {children}
    <nav aria-label="Navegación de la casa" className={`${preview ? "sticky bottom-0" : "fixed inset-x-0 bottom-0 w-full"} z-30 grid grid-cols-4 border-t border-white/10 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_#00000030]`} style={{ background: appearance.background }}>{houseNav.map((item) => {
      const active = preview ? item.href === "/" : pathname === item.href;
      const content = <><span className={`flex size-9 items-center justify-center rounded-xl ${active ? "bg-white/[0.06]" : ""}`}><NavIcon href={item.icon} className="!size-[21px] [stroke-width:1.5]" /></span><span>{item.label}</span></>;
      const style = { color: active ? palette.accent : "var(--lobby-muted)" };
      return preview ? <span key={item.href} className="flex flex-col items-center gap-1 py-1 text-[10px] font-medium" style={style}>{content}</span> : item.href === "/cuenta" && !account ? <button type="button" key={item.href} onClick={() => setAccessOpen(true)} className="flex flex-col items-center gap-1 rounded-lg py-1 text-[10px] font-medium hover:bg-white/5" style={style}>{content}</button> : <Link key={item.href} href={item.href} prefetch aria-current={active ? "page" : undefined} className="flex flex-col items-center gap-1 rounded-lg py-1 text-[10px] font-medium transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2" style={style}>{content}</Link>;
    })}</nav>
    {!preview && <PlayerAccess appearance={appearance} open={accessOpen} onClose={() => setAccessOpen(false)} />}
  </div>;
}

function subscribeToHost() {
  return () => {};
}

export function HouseFrameFromHost({ children }: { children?: ReactNode }) {
  const host = useSyncExternalStore(subscribeToHost, () => window.location.hostname, () => "kairobet.localhost");
  const slug = host.split(":")[0]?.split(".")[0]?.replace(/-admin$/, "") || "kairobet";
  return <HouseFrame appearance={defaultAppearance(slug)}>{children}</HouseFrame>;
}
