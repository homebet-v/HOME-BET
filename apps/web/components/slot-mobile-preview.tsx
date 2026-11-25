"use client";

import { useState } from "react";
import { SlotLayoutPicker } from "@/components/slot-layout-picker";
import { slotDemoGames as slotGames } from "@/lib/slot-editions";

const sizes = [
  { label: "Móvil · 390 × 844", width: 390, height: 844 },
  { label: "Móvil pequeño · 360 × 800", width: 360, height: 800 },
  { label: "Pantalla corta · 360 × 640", width: 360, height: 640 },
];

export function SlotMobilePreview() {
  const [slug, setSlug] = useState("oraculo-coral");
  const [sizeIndex, setSizeIndex] = useState(0);
  const size = sizes[sizeIndex];
  const game = slotGames.find((item) => item.slug === slug)!;
  return <section className="space-y-5">
    <div><h1 className="text-2xl font-bold">Vista móvil</h1><p className="mt-2 text-sm text-slate-400">El juego real dentro de una pantalla móvil. Cambiá el juego y el tamaño para revisar los controles y las tarjetas.</p></div>
    <div className="flex flex-wrap gap-3">
      <label className="grid gap-1 text-xs text-slate-300">Juego<select value={slug} onChange={(event) => setSlug(event.target.value)} className="min-h-11 rounded-xl border border-white/15 bg-[#101522] px-3 text-sm text-white">{["3x3", "5x3", "5x5"].map(engine => <optgroup key={engine} label={engine === "5x5" ? "Edición III · 5×5" : engine === "5x3" ? "Edición II · 5×3" : "Edición I · 3×3"}>{slotGames.filter(item => (item.engine ?? "3x3") === engine).map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</optgroup>)}</select></label>
      <label className="grid gap-1 text-xs text-slate-300">Pantalla<select value={sizeIndex} onChange={(event) => setSizeIndex(Number(event.target.value))} className="min-h-11 rounded-xl border border-white/15 bg-[#101522] px-3 text-sm text-white">{sizes.map((item, index) => <option key={item.label} value={index}>{item.label}</option>)}</select></label>
      <SlotLayoutPicker slug={slug} />
    </div>
    <p className="text-xs text-slate-500">La distribución se aplica a este juego y se conserva en este navegador. Cambiarla mantiene la sesión del juego.</p>
    <div className="max-w-full overflow-x-auto pb-3">
      <div style={{ width: size.width + 16 }} className="mx-auto rounded-[34px] border border-white/20 bg-[#02040a] p-[7px] shadow-2xl">
        <iframe key={`${slug}-${sizeIndex}`} src={`/juegos?demo=${encodeURIComponent(slug)}`} title={`${game.name} en móvil de ${size.width} por ${size.height}`} width={size.width} height={size.height} style={{ display: "block", border: 0, borderRadius: 26, background: "#070a13" }} />
      </div>
    </div>
    <p className="text-xs text-slate-500">{size.width} × {size.height} píxeles · fichas demo · la sesión se reinicia al cambiar de juego o pantalla.</p>
  </section>;
}
