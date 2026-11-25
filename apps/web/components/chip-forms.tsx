"use client";

import { useState } from "react";
import { houses } from "@/lib/fixtures";

export function ChipForms() {
  const [note, setNote] = useState("");
  return <section className="grid gap-5 lg:grid-cols-2" aria-label="Operaciones de fichas">
    {["Emitir fichas", "Distribuir a un casino"].map((title, index) => <form key={title} className="flex flex-col gap-4 rounded-2xl border border-white/10 p-5" onSubmit={(event) => { event.preventDefault(); setNote("Operación de muestra. No se emitieron ni transfirieron fichas; no se guardó ningún movimiento."); }}>
      <h2 className="font-medium">{title}</h2><p className="text-sm text-zinc-400">{index === 0 ? "Crear una nueva provisión en Home." : "Transferir desde el disponible de Home a una casa activa."}</p>
      {index === 1 && <label className="grid gap-2 text-sm">Casino<select required name="casino" className="rounded-lg border border-white/15 bg-background p-2"><option value="">Seleccionar casino</option>{houses.filter((house) => house.status === "active").map((house) => <option key={house.slug} value={house.slug}>{house.name}</option>)}</select></label>}
      <label className="grid gap-2 text-sm">Cantidad de fichas<input required name="amount" type="number" min="1" step="1" className="rounded-lg border border-white/15 bg-white/5 p-2" /></label>
      <label className="grid gap-2 text-sm">Motivo<input required name="reason" className="rounded-lg border border-white/15 bg-white/5 p-2" /></label>
      <button className="mt-auto self-start rounded-lg border border-white/20 px-4 py-2 text-sm" type="submit">Revisar operación de muestra</button>
    </form>)}
    <p role="status" className="text-sm text-amber-200 lg:col-span-2">{note || "Demostración: estas operaciones no modifican saldos."}</p>
  </section>;
}
