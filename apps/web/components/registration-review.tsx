"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminPlayerProfile } from "@/components/admin-player-profile";
import { NavIcon } from "@/components/nav-icon";
import type { DirectoryPlayer } from "@/lib/house-operations";
import { verificationLabels, type VerificationStatus } from "@/lib/verification";

const dateLabel = (value?: string) => value ? new Intl.DateTimeFormat("es-PY", { dateStyle: "short", timeStyle: "short", timeZone: "America/Asuncion" }).format(new Date(value)) : "Sin datos";
export function RegistrationReview({ players, houseName, mode = "registrations" }: {
  players: DirectoryPlayer[]; houseName: string; mode?: "registrations" | "players";
}) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const rows = mode === "players" ? players : players.filter((row) => row.status === "pending");
  const [filter, setFilter] = useState<VerificationStatus | "">("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const filtered = rows.filter((row) => (!filter || row.status === filter) && `${row.ci} ${row.details.firstName} ${row.details.lastName} ${row.details.email}`.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es").trim()));
  const pageCount = Math.max(1, Math.ceil(filtered.length / 15));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * 15;
  const pageRows = filtered.slice(start, start + 15);
  const selected = players.find((row) => row.id === selectedId);
  useEffect(() => { titleRef.current?.focus(); }, [selected?.id]);
  const selectedProfileOpen = Boolean(selected);
  useEffect(() => {
    if (mode !== "registrations" || selectedProfileOpen) return;
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    window.addEventListener("focus", refresh);
    const timer = window.setInterval(refresh, 20000);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [mode, router, selectedProfileOpen]);
  const control = "rounded-md border border-white/10 bg-[#293654] px-2 py-1.5 text-[11px] text-white outline-none focus:border-sky-400";
  if (selected) return <div className="space-y-4" data-screen={mode === "players" ? "admin-jugador" : "admin-registro"}><div className="flex flex-wrap items-center gap-4"><button type="button" onClick={() => setSelectedId(null)} className="flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs text-sky-300 hover:bg-white/5">← Volver a {mode === "players" ? "jugadores" : "registros"}</button><h1 ref={titleRef} tabIndex={-1} className="text-lg font-semibold outline-none">Perfil del usuario</h1></div><AdminPlayerProfile key={selected.id} player={selected} houseName={houseName} /></div>;
  return <div className="space-y-2" data-screen={mode === "players" ? "admin-jugadores" : "admin-registros"}>
    <header className="flex flex-wrap items-center justify-between gap-2"><h1 ref={titleRef} tabIndex={-1} className="text-lg font-semibold outline-none">{mode === "players" ? "Jugadores" : "Registros"}</h1><p role="status" className="text-[10px] text-slate-400"><strong className="text-slate-200">{filtered.length}</strong> / {rows.length} usuarios</p>{mode === "registrations" && <p className="mt-2 text-sm text-slate-400">Solicitudes pendientes de verificar de esta casa.</p>}</header>
    <div className="player-list min-w-0 overflow-hidden rounded-lg border border-white/10 bg-[#171f31]">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 bg-[#202c44] p-1.5">
        <label className="min-w-[120px] flex-1"><span className="sr-only">Buscar usuario</span><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="CI, nombre o correo" className={`${control} w-full`} /></label>
        {mode === "players" && <label className="w-36 min-w-0 shrink-0 sm:w-40"><span className="sr-only">Estado de verificación</span><select value={filter} onChange={(event) => { setFilter(event.target.value as VerificationStatus | ""); setPage(1); }} className={`${control} w-full`}>{(["", "pending", "verified", "denied", "rejected", "unverified"] as const).map((status) => <option key={status} value={status}>{status ? verificationLabels[status] : "Todos los estados"}</option>)}</select></label>}
        <button type="button" disabled={refreshing} onClick={() => startRefresh(() => router.refresh())} className="px-2 py-2 text-xs text-sky-300 hover:underline disabled:opacity-50">
          {refreshing ? "Actualizando…" : "Actualizar"}
        </button>
        {(query || filter) && <button type="button" onClick={() => { setQuery(""); setFilter(""); setPage(1); }} className="px-2 py-2 text-xs text-sky-300 hover:underline">Limpiar</button>}
      </div>
      <div className="player-list-heading px-2 py-1.5 text-[10px] text-slate-400" aria-hidden="true"><span /><span>Usuario / Verificación</span><span>Correo electrónico</span><span className="text-right">Saldo / Retirable</span><span>Último ingreso</span><span>Registro</span><span /></div>
      <ul aria-label="Usuarios de esta casa" className="overflow-hidden divide-y divide-white/5">{pageRows.map((row) => {
        const name = `${row.details.firstName} ${row.details.lastName}`.trim() || (row.ci ? `CI ${row.ci}` : "Jugador");
        const stateColor = row.status === "verified" ? "text-emerald-300" : row.status === "rejected" ? "text-red-300" : "text-amber-200";
        return <li key={row.id} className="odd:bg-[#26324b] even:bg-[#1d273b]"><button type="button" aria-label={`Ver perfil de ${name}, CI ${row.ci}, ${verificationLabels[row.status]}`} onClick={() => setSelectedId(row.id)} className="player-list-row min-h-11 w-full px-2 py-1.5 text-left transition hover:bg-sky-400/[0.06] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky-300">
          <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full border border-sky-300/15 bg-sky-400/10 text-sky-200"><NavIcon href="/perfil" className="!size-3.5" /></span>
          <span className="min-w-0"><span className="block truncate text-xs font-semibold text-slate-100" title={name}>{name}</span><span className="flex flex-wrap items-center gap-x-1.5 text-[10px] leading-3.5"><span className="whitespace-nowrap text-slate-400">CI {row.ci || "sin registrar"}</span><span className={stateColor}>{row.status === "denied" ? "Denegado" : verificationLabels[row.status]}</span>{row.status === "pending" && <span className="text-slate-400">{row.submittedAt ? "Documentos recibidos" : "Faltan documentos"}</span>}</span></span>
          <span className="player-list-extra min-w-0 truncate text-[11px] text-slate-400" title={row.details.email}>{row.details.email || "Sin completar"}</span>
          <span className="whitespace-nowrap text-right"><span className="block text-xs font-bold tabular-nums">{new Intl.NumberFormat("es-PY").format(row.balanceCents / 100)} <span className="hidden text-[9px] font-normal text-slate-500 sm:inline">fichas</span></span><span className="block text-[9px] leading-3.5 text-slate-400">Retirable: {new Intl.NumberFormat("es-PY").format(row.withdrawableCents / 100)}</span></span>
          <span className="player-list-extra text-[10px] text-slate-400">{row.lastSignInAt ? dateLabel(row.lastSignInAt) : "Sin accesos registrados"}</span>
          <span className="player-list-extra text-[10px] text-slate-400">{dateLabel(row.createdAt)}</span>
          <svg aria-hidden="true" width="12" height="16" viewBox="0 0 16 24" fill="none" className="text-slate-500"><path d="m5 6 6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button></li>;
      })}</ul>
      {!filtered.length && <p className="p-6 text-center text-xs text-slate-400">{mode === "registrations" ? query ? "No hay solicitudes pendientes con esa búsqueda." : "No hay solicitudes pendientes de verificar." : "No hay usuarios con esos filtros."}</p>}

      {<div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-2 py-1.5"><p className="text-[10px] text-slate-400">{filtered.length ? `${start + 1}–${Math.min(start + 15, filtered.length)}` : "0"} de {filtered.length}</p><nav aria-label="Páginas de jugadores" className="flex items-center gap-2"><button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded border border-white/10 px-2 py-1 text-[10px] hover:bg-white/5 disabled:opacity-30">← Anterior</button><span className="text-[10px] text-slate-400">{currentPage} / {pageCount}</span><button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="rounded border border-white/10 px-2 py-1 text-[10px] hover:bg-white/5 disabled:opacity-30">Siguiente →</button></nav></div>}
    </div>
  </div>;
}
