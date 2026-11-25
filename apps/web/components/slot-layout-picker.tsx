"use client";

import { SLOT_CONTROL_LAYOUTS, isSlotControlLayout } from "@homebet/proveedores/layouts";
import { setGameSlotLayout, useGameSlotLayout } from "@/lib/slot-layout-settings";

export function SlotLayoutPicker({ slug }: { slug: string }) {
  const selected = useGameSlotLayout(slug);
  const layout = SLOT_CONTROL_LAYOUTS.find((item) => item.id === selected)!;
  return <div className="grid gap-2">
    <label className="grid gap-1 text-xs text-slate-300">Distribución de controles
      <select aria-label={`Distribución de controles de ${slug}`} value={selected} onChange={(event) => { if (isSlotControlLayout(event.target.value)) setGameSlotLayout(slug, event.target.value); }} className="min-h-11 w-full rounded-xl border border-white/15 bg-[#101522] px-3 text-xs text-white">
        {SLOT_CONTROL_LAYOUTS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
    </label>
    <p className="max-w-sm text-[10px] leading-5 text-slate-400">{layout.description}</p>
  </div>;
}
