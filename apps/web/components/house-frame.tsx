"use client";

import { Suspense, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
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
  { href: "/retiros", label: "Retiros", icon: "/casa-retiros" },
  { href: "/cuenta", label: "Perfil", icon: "/perfil" },
] as const;

function HouseNav({ appearance, preview, palette, account, pathname, onOpen }: {
  appearance: Appearance;
  preview: boolean;
  palette: { accent: string };
  account: ReturnType<typeof usePlayerSession>;
  pathname: string;
  onOpen: () => void;
}) {
  const kairo = appearance.palette === "kairo";
  const navStyle: CSSProperties = { background: appearance.background };
  if (kairo) {
    navStyle.border = "1px solid var(--kairo-violet, #961aff)";
    navStyle.borderRadius = 9;
    navStyle.boxShadow = "inset 0 0 8px #961aff50, 0 0 10px #961aff8c, 0 5px 16px #000b";
  }
  return <nav aria-label="Navegación de la casa" className={`${preview ? "sticky bottom-0" : "fixed inset-x-0 bottom-0 w-full"} house-bottom-nav z-30 grid grid-cols-5 border-t border-white/10 px-1 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_#00000030]`} style={navStyle}>{houseNav.map((item) => {
    const active = preview ? item.href === "/" : pathname === item.href;
    const iconStyle = active && kairo ? {
      border: "1px solid var(--kairo-violet, #961aff)",
      background: "#2a0b43",
      boxShadow: "inset 0 0 6px #961aff45, 0 0 8px #961aff7a",
    } : undefined;
    const content = <><span className={`flex size-8 items-center justify-center rounded-xl ${active ? "bg-white/[0.06]" : ""}`} style={iconStyle}><NavIcon href={item.icon} className="!size-5 [stroke-width:1.5]" /></span><span className="max-w-full truncate">{item.label}</span></>;
    const style = { color: active ? (kairo ? "#e3bdff" : palette.accent) : "var(--lobby-muted)" };
    const itemClass = "flex min-w-0 flex-col items-center gap-1 rounded-lg py-1 text-[10px] font-medium";
    return preview ? <span key={item.href} className={itemClass} style={style}>{content}</span> : item.href === "/cuenta" && !account ? <button type="button" key={item.href} onClick={onOpen} className={`${itemClass} hover:bg-white/5`} style={style}>{content}</button> : <Link key={item.href} href={item.href} prefetch aria-current={active ? "page" : undefined} className={`${itemClass} transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2`} style={style}>{content}</Link>;
  })}</nav>;
}

function HouseNavLive(props: Omit<Parameters<typeof HouseNav>[0], "pathname">) {
  return <HouseNav {...props} pathname={publicPath(usePathname() || "/")} />;
}

export function HouseFrame({ appearance, preview = false, children }: { appearance: Appearance; preview?: boolean; children: ReactNode }) {
  const account = usePlayerSession();
  const total = account?.balanceCents ?? 0;
  const [accessOpen, setAccessOpen] = useState(false);
  const palette = palettes[appearance.palette];
  const kairoViolet = appearance.palette === "kairo" ? "#961aff" : undefined;
  const topbarStyle: CSSProperties | undefined = kairoViolet ? {
    position: preview ? "relative" : "sticky",
    top: preview ? undefined : 0,
    zIndex: preview ? 1 : 30,
    boxShadow: "inset 0 -3px 8px #961aff69, 0 3px 10px #961affa6, 0 6px 16px #7100ce3d",
  } : undefined;
  const balanceStyle = kairoViolet ? {
    borderColor: kairoViolet,
    background: "#000",
  } : undefined;
  const chargeStyle = kairoViolet ? {
    background: `linear-gradient(180deg, ${kairoViolet}, #620dc0)`,
    color: "#fff5ff",
  } : {
    background: "linear-gradient(180deg, #3dff86 0%, #00c853 46%, #067a34 100%)",
    color: "#000",
  };
  const rgb = appearance.background.slice(1).match(/.{2}/g)!.map((part) => parseInt(part, 16));
  const light = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 > 150;
  const emblem = { diamond: "◈", star: "✦", circle: "◎" }[appearance.emblem];

  return <div className={`casino-scenery min-h-dvh ${kairoViolet && !preview ? "overflow-clip" : "overflow-hidden"} ${preview ? `border border-white/10 ${appearance.rounded ? "rounded-2xl" : ""}` : "casino-lobby-public"} text-[color:var(--lobby-text)]`} data-casino-palette={appearance.palette} style={{ backgroundColor: appearance.background, "--casino-surface": appearance.background, "--casino-art": appearance.backgroundImage ? `url("${appearance.backgroundImage}")` : undefined, "--casino-background": appearance.backgroundImage ? `linear-gradient(#06101a${Math.round((appearance.backgroundOverlay ?? 75) * 2.55).toString(16).padStart(2, "0")}, #06101a${Math.round((appearance.backgroundOverlay ?? 75) * 2.55).toString(16).padStart(2, "0")}), url("${appearance.backgroundImage}")` : "none", "--casino-accent": palette.accent, "--kairo-violet": kairoViolet, "--lobby-text": light ? "#111827" : "#f1f5f9", "--lobby-muted": light ? "#374151" : "#cbd5e1" } as CSSProperties}>
    <div className="house-topbar flex items-center justify-between gap-3 border-b border-white/10 px-4 py-1.5" style={topbarStyle}><div className="flex min-w-0 items-center gap-2">{appearance.logoImage ? <img src={appearance.logoImage} alt={appearance.brand || "Logo de la casa"} className="h-10 w-[clamp(88px,30vw,190px)] max-w-full object-contain object-left sm:h-11 sm:w-[210px]" /> : <><span style={{ color: palette.accent }} className="text-2xl" aria-hidden="true">{emblem}</span><span className="truncate text-lg font-bold">{appearance.brand || "Tu casino"}</span></>}</div><div className="flex shrink-0 items-center gap-2">{account?.verified && !preview ? <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black p-0.5 pl-2" style={balanceStyle}><Link href="/cuenta" prefetch aria-label="Ver mi perfil" className="flex items-center gap-1.5 px-1 py-1 text-sm font-semibold text-white tabular-nums"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: palette.accent }}><circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="1.5" /><path d="M14.5 8.5h-3.8a1.8 1.8 0 0 0 0 3.5h2.6a1.8 1.8 0 0 1 0 3.5H9.5M12 6.5v11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg><span className="whitespace-nowrap">{new Intl.NumberFormat("es-PY").format(total / 100)}</span></Link><Link href="/cargar" prefetch className="house-charge relative overflow-hidden rounded-full px-2.5 py-1 text-[11px] font-semibold sm:px-3" style={chargeStyle}><span className="load-chip-shine" aria-hidden="true" /><span className="relative z-10">Cargar</span></Link></div> : preview ? <span className="rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: palette.accent, color: palette.ink }}>Ingresar</span> : account ? <Link href="/cuenta" prefetch className="rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: palette.accent, color: palette.ink }}>Mi cuenta</Link> : <button type="button" onClick={() => setAccessOpen(true)} className="rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: palette.accent, color: palette.ink }}>Ingresar</button>}</div></div>
    {children}
    <Suspense fallback={<HouseNav appearance={appearance} preview={preview} palette={palette} account={account} pathname="" onOpen={() => setAccessOpen(true)} />}>
      <HouseNavLive appearance={appearance} preview={preview} palette={palette} account={account} onOpen={() => setAccessOpen(true)} />
    </Suspense>
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
