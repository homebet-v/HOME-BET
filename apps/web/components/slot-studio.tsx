"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { slotGames } from "@homebet/proveedores/catalog";
import { slotDemoGames } from "@/lib/slot-editions";
import { SlotLayoutPicker } from "@/components/slot-layout-picker";
import { SlotDemoLauncher } from "@/components/slot-demo-launcher";
import { effectiveRtp, useSlotSettings } from "@/lib/slot-settings-demo";

const subscribeLocation = (listener: () => void) => { window.addEventListener("popstate", listener); return () => window.removeEventListener("popstate", listener); };
const readPreviewSlug = () => new URLSearchParams(window.location.search).get("demo") ?? "";

export function SlotStudio() {
  const previewSlug = useSyncExternalStore(subscribeLocation, readPreviewSlug, () => "");
  const previewGame = slotDemoGames.find((game) => game.slug === previewSlug);
  const [query, setQuery] = useState("");
  const [batch, setBatch] = useState("all");
  const [edition, setEdition] = useState("5x5");
  const batches = [...new Set(slotGames.map((game) => game.batch))];
  const settings = useSlotSettings();
  const games = slotDemoGames.filter((game) => (game.engine ?? "3x3") === edition && (batch === "all" || String(game.batch) === batch) && `${game.name} ${game.tagline}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()));
  return <section className="space-y-5">
    {previewGame && <SlotDemoLauncher key={previewGame.slug} game={previewGame} autoOpen hideTrigger />}
    <Link href="/juegos/movil" className="inline-flex min-h-11 items-center rounded-xl border border-cyan-300/25 bg-cyan-300/5 px-4 text-xs font-semibold text-cyan-100">Vista móvil de los juegos</Link>
    <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[0.2em] text-amber-200">Reel Crown</p><h2 className="mt-2 text-2xl font-bold">{slotGames.length} temáticas · {slotDemoGames.length} ediciones.</h2><p className="mt-2 text-xs text-slate-400">{edition === "5x5" ? "Edición III · 5×5 · 50 líneas fijas" : edition === "5x3" ? "Edición II · 5×3 · 25 líneas fijas" : "Edición I · 3×3 · cinco líneas"} · wild · giros gratis · bonos · fichas demo</p></div><div className="flex flex-wrap gap-2"><label><span className="sr-only">Edición</span><select value={edition} onChange={(event) => setEdition(event.target.value)} className="min-h-10 rounded-lg border border-white/15 bg-[#101522] px-3 text-sm"><option value="5x5">Edición III · 5×5</option><option value="5x3">Edición II · 5×3</option><option value="3x3">Edición I · 3×3</option></select></label><label><span className="sr-only">Colección</span><select value={batch} onChange={(event) => setBatch(event.target.value)} className="min-h-10 rounded-lg border border-white/15 bg-[#101522] px-3 text-sm"><option value="all">Todos · {slotGames.length}</option>{batches.map((value) => <option key={value} value={value}>Lote {value} · {slotGames.filter((game) => game.batch === value).length}</option>)}</select></label><label><span className="sr-only">Buscar demo</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar temática…" className="rounded-lg border border-white/15 bg-[#101522] px-3 py-2 text-sm" /></label></div></header>


    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{games.map((game) => <article key={game.slug} className="overflow-hidden rounded-2xl border border-white/10 bg-[#111724]"><div className="relative aspect-[3/2] overflow-hidden"><img src={game.banner} style={{ imageRendering: game.artStyle === "pixel" ? "pixelated" : "auto" }} alt={game.name} loading="lazy" className="h-full w-full object-contain transition duration-500 hover:brightness-110" /><span className="absolute left-3 top-3 rounded-full bg-black/70 px-2 py-1 text-[9px] font-bold text-amber-100">LOTE {game.batch} · {edition === "5x5" ? "III · 5×5" : edition === "5x3" ? "II · 5×3" : "I · 3×3"} · {game.fanArt ? "FANART DEMO" : "DEMO"}</span></div><div className="p-4"><div className="flex items-center justify-between gap-2"><h3 className="text-base font-bold" style={{ color: game.accent }}>{game.name}</h3><span className="shrink-0 text-[10px] text-slate-400">{(effectiveRtp(settings, game.slug) / 100).toFixed(2)}%</span></div><p className="mt-2 min-h-10 text-xs leading-5 text-slate-400">{game.tagline}</p><SlotLayoutPicker slug={game.slug} /><SlotDemoLauncher game={game} /></div></article>)}</div>
    <p className="text-xs text-slate-500">La distribución de cada juego se conserva en este navegador. Podés compararla en la vista móvil.</p>
    {!games.length && <p className="py-8 text-center text-sm text-slate-400">No hay juegos con esa búsqueda.</p>}
  </section>;
}

