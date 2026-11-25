"use client";

import { useState } from "react";

const input = "w-full rounded-lg border border-slate-500/40 bg-[#0b152c] px-3 py-2.5 text-slate-100 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-400";
const format = (value: number) => new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2 }).format(value);

export function BonusEditor() {
  const [kind, setKind] = useState<"fixed" | "percentage">("percentage");
  const [amount, setAmount] = useState("20");
  const [minimum, setMinimum] = useState("1000");
  const [maximum, setMaximum] = useState("");
  const [cap, setCap] = useState("5000");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [deposit, setDeposit] = useState("10000");
  const [note, setNote] = useState("");
  const minValue = Number(minimum);
  const maxValue = maximum ? Number(maximum) : Infinity;
  const capValue = Number(cap);
  const rate = Number(amount);
  const depositValue = Number(deposit);
  const validRules = minimum !== "" && minValue > 0 && maxValue >= minValue && rate > 0 && (kind !== "percentage" || rate <= 100) && capValue > 0;
  const eligible = validRules && depositValue >= minValue && depositValue <= maxValue;
  const reward = eligible ? Math.floor(Math.min(kind === "fixed" ? rate : depositValue * rate / 100, capValue) * 100) / 100 : 0;
  return <form className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]" onChange={() => setNote("")} onSubmit={(event) => {
    event.preventDefault();
    if (!validRules) { setNote("Revisá los importes: la carga máxima debe ser igual o mayor a la mínima y el porcentaje no puede superar 100%."); return; }
    if (!start || !end || end <= start) { setNote("El fin debe ser posterior al inicio."); return; }
    setNote("Configuración revisada. Es una demostración: no se creó el bono ni se acreditaron fichas.");
  }}>
    <div className="space-y-5">
      <section className="space-y-4 rounded-xl border border-sky-400/25 border-t-2 border-t-sky-400 bg-[#142440] p-5"><h2 className="text-sm font-semibold">01 · Definición del bono</h2><label className="grid gap-2 text-xs text-slate-300">Nombre<input name="name" required maxLength={70} placeholder="Ej. Bono de la tarde" className={input} /></label><fieldset><legend className="mb-2 text-xs text-slate-300">Tipo de beneficio</legend><div className="grid grid-cols-2 gap-2">{(["fixed", "percentage"] as const).map((value) => <button type="button" key={value} aria-pressed={kind === value} onClick={() => { setKind(value); setNote(""); }} className={`rounded-lg border px-3 py-2.5 text-xs ${kind === value ? "border-sky-300/70 bg-sky-400/25 text-sky-100 ring-1 ring-sky-300/20" : "border-slate-500/40 bg-[#0b152c] text-slate-300"}`}>{value === "fixed" ? "Monto fijo" : "Porcentaje de la carga"}</button>)}</div></fieldset><label className="grid gap-2 text-xs text-slate-300">{kind === "fixed" ? "Fichas que se otorgan" : "Porcentaje del bono (%)"}<input required type="number" min="0.01" max={kind === "percentage" ? 100 : undefined} step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className={input} /></label></section>
      <section className="space-y-4 rounded-xl border border-violet-400/25 border-t-2 border-t-violet-400 bg-[#1c2342] p-5"><h2 className="text-sm font-semibold">02 · Cargas habilitadas y límite</h2><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-xs text-slate-300">Carga mínima (fichas)<input required type="number" min="0.01" step="0.01" value={minimum} onChange={(event) => setMinimum(event.target.value)} className={input} /></label><label className="grid gap-2 text-xs text-slate-300">Carga máxima (opcional)<input type="number" min={minimum || "0.01"} step="0.01" placeholder="Sin límite" value={maximum} onChange={(event) => setMaximum(event.target.value)} className={input} /></label></div><label className="grid gap-2 text-xs text-slate-300">Máximo de fichas del bono por carga<input required type="number" min="0.01" step="0.01" value={cap} onChange={(event) => setCap(event.target.value)} className={input} /></label><p className="text-xs leading-5 text-slate-400">La carga mínima y máxima se incluyen. El beneficio nunca supera el tope, tanto para monto fijo como para porcentaje.</p></section>
      <section className="space-y-4 rounded-xl border border-emerald-400/25 border-t-2 border-t-emerald-400 bg-[#102e36] p-5"><h2 className="text-sm font-semibold">03 · Vigencia</h2><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-xs text-slate-300">Fecha y hora de inicio<input required type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} className={input} /></label><label className="grid gap-2 text-xs text-slate-300">Fecha y hora de fin<input required type="datetime-local" min={start || undefined} value={end} onChange={(event) => setEnd(event.target.value)} className={input} /></label></div><p className="text-xs leading-5 text-slate-400">Horario de Paraguay (America/Asuncion). La promoción comienza en el inicio indicado y deja de aplicar al llegar la hora de fin.</p></section>
      <button type="submit" className="rounded-lg bg-sky-400 px-5 py-2.5 text-xs font-semibold text-slate-950 shadow-lg shadow-sky-500/15 hover:bg-sky-300">Revisar bono de muestra</button><p role="status" className="text-xs leading-5 text-amber-200">{note}</p>
    </div>
    <aside className="space-y-4 rounded-xl border border-sky-400/35 bg-[#102d48] p-5 lg:sticky lg:top-5"><h2 className="text-sm font-semibold">Simulador del beneficio</h2><p className="text-xs leading-5 text-slate-400">Probá una carga para verificar los importes. Esta simulación no evalúa la vigencia ni acredita fichas.</p><label className="grid gap-2 text-xs text-slate-300">Carga de ejemplo<input type="number" min="0" step="0.01" value={deposit} onChange={(event) => setDeposit(event.target.value)} className={input} /></label><div className="border-y border-white/10 py-4"><p className="text-xs text-slate-400">Bono a otorgar</p><p className="mt-2 text-3xl font-semibold text-sky-200">{format(reward)} <span className="text-xs font-normal text-slate-400">fichas</span></p><p className="mt-2 text-[11px] leading-5 text-slate-400">{!validRules ? "Completá reglas válidas para calcular." : !eligible ? "La carga está fuera del rango habilitado." : `Beneficio de ${kind === "fixed" ? `${format(rate)} fichas` : `${format(rate)}%`}, con tope de ${format(capValue)} fichas.`}</p></div><p className="text-[10px] leading-5 text-slate-400">Vista de muestra. No se guarda ni se publica la promoción.</p></aside>
  </form>;
}
