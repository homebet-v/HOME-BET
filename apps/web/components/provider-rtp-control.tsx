"use client";

import { useState } from "react";
import { slotPlayableGames as slotGames } from "@homebet/proveedores/catalog";
import { effectiveRtp, resetSlotSettings, setGameRtp, setProviderRtp, useSlotSettings } from "@/lib/slot-settings-demo";

const input = "w-full rounded-lg border border-white/15 bg-[#101522] px-3 py-2 text-sm text-white";
export function ProviderRtpControl() {
  const settings = useSlotSettings();
  const [provider, setProvider] = useState(String(settings.providerBps / 100));
  const [note, setNote] = useState("");
  return <section className="space-y-5 rounded-2xl border border-amber-300/20 bg-[#111724] p-5">
    <header><p className="text-[10px] uppercase tracking-[0.2em] text-amber-200">Lumen Studio · Matemática del proveedor</p><h2 className="mt-2 text-xl font-bold">RTP general y excepciones</h2><p className="mt-2 max-w-2xl text-xs leading-6 text-slate-400">Todos los juegos heredan el RTP del proveedor. Una excepción cambia solo ese juego. El RTP es una expectativa de largo plazo, incluye bonos y giros gratis y no garantiza resultados en una sesión.</p></header>
    <form className="flex max-w-md flex-wrap items-end gap-3" onSubmit={(event) => { event.preventDefault(); try { setProviderRtp(Math.round(Number(provider) * 100)); setNote("RTP del proveedor actualizado para las demos de esta pestaña."); } catch (error) { setNote((error as Error).message); } }}>
      <label className="grid flex-1 gap-2 text-xs text-slate-300">RTP del proveedor (%)<input required type="number" min="80" max="98" step="0.01" value={provider} onChange={(event) => setProvider(event.target.value)} className={input} /></label>
      <button className="rounded-lg bg-amber-300 px-4 py-2.5 text-xs font-bold text-black">Aplicar a heredados</button>
    </form>
    <div className="flex flex-wrap gap-2 text-[11px]"><span className="rounded-full border border-white/10 px-3 py-1">General: {(settings.providerBps / 100).toFixed(2)}%</span><span className="rounded-full border border-white/10 px-3 py-1">{Object.keys(settings.gameOverrides).length} excepciones</span><span className="rounded-full border border-white/10 px-3 py-1">Rango: 80–98%</span></div>
    <details><summary className="cursor-pointer text-sm font-semibold text-amber-100">Configurar RTP por juego (opcional)</summary><div className="mt-4 grid gap-2 md:grid-cols-2">{slotGames.map((game) => <form key={game.slug + "-" + (settings.gameOverrides[game.slug] ?? "inherit")} className="grid grid-cols-[minmax(0,1fr)_82px_auto] items-center gap-2 rounded-lg border border-white/10 p-3" onSubmit={(event) => { event.preventDefault(); const value = String(new FormData(event.currentTarget).get("rtp") ?? "").trim(); try { setGameRtp(game.slug, value ? Math.round(Number(value) * 100) : null); setNote(value ? `${game.name}: excepción aplicada.` : `${game.name}: vuelve a heredar del proveedor.`); } catch (error) { setNote((error as Error).message); } }}><div className="min-w-0"><p className="truncate text-xs font-semibold">{game.name}</p><p className="mt-1 text-[10px] text-slate-400">{(effectiveRtp(settings, game.slug) / 100).toFixed(2)}% · {settings.gameOverrides[game.slug] === undefined ? "Heredado" : "Excepción"}</p></div><label><span className="sr-only">RTP de {game.name}; vacío para heredar</span><input name="rtp" type="number" min="80" max="98" step="0.01" placeholder="Heredar" defaultValue={settings.gameOverrides[game.slug] === undefined ? "" : settings.gameOverrides[game.slug] / 100} className={input} /></label><button className="rounded-lg border border-white/15 px-2 py-2 text-[10px] font-bold">Aplicar</button></form>)}</div><p className="mt-3 text-[11px] text-slate-400">Dejá un campo vacío y aplicá para quitar la excepción. Los giros gratis ya otorgados conservan su apuesta y RTP originales.</p></details>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4"><p role="status" className="text-xs text-amber-100">{note}</p><button type="button" onClick={() => { resetSlotSettings(); setProvider("96"); setNote("Proveedor restablecido a 96% y sin excepciones."); }} className="text-xs text-slate-400 underline">Restablecer configuración</button></div>
    <p className="text-[10px] leading-5 text-slate-500">Configuración de muestra en memoria. Se reinicia al recargar y no sincroniza otros hosts. No aplica dinero real ni modifica probabilidades por usuario.</p>
  </section>;
}

