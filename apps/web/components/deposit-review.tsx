"use client";

import { useEffect, useRef, useState } from "react";
import { NavIcon } from "@/components/nav-icon";
import { useRegistrations } from "@/lib/registration-demo";
import { acceptDemoDeposit, demoCashier, rejectDemoDeposit, useDepositDemo } from "@/lib/deposit-demo";
import { depositBonusCents, depositStatusLabels, type DepositRequest } from "@/lib/deposits";

const format = (cents: number) => new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2 }).format(cents / 100);
const date = (value: string) => new Intl.DateTimeFormat("es-PY", { dateStyle: "short", timeStyle: "short", timeZone: "America/Asuncion" }).format(new Date(value));
const button = "inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-xs font-semibold hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40";

type DepositNotice = { kind: "accepted" | "rejected"; title: string; message: string; id: string };
function DepositDetail({ request, onBack, onResolved }: { request: DepositRequest; onBack: () => void; onResolved: (notice: DepositNotice) => void }) {
  const { wallets } = useDepositDemo();
  const player = useRegistrations().find((row) => row.id === request.playerId && row.casinoId === request.casinoId);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const actionLock = useRef<"idle" | "confirming" | "processing" | "done">("idle");
  const receiptDialog = useRef<HTMLDialogElement>(null);
  const rejectionDialog = useRef<HTMLDialogElement>(null);
  const cardRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const card = cardRef.current;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    if (card && !card.open) card.showModal();
    return () => { document.documentElement.style.overflow = previousOverflow; };
  }, []);
  const actionable = request.status === "pending" || (request.status === "reviewing" && request.claimedBy === demoCashier);
  const accepted = request.status === "accepted";
  const movements = (wallets[request.playerId] ?? []).filter((movement) => movement.id === `${request.id}-deposit` || movement.id === `${request.id}-bonus`);
  let bonus = 0;
  let bonusError = "";
  try { bonus = accepted ? request.bonusCents : depositBonusCents(request, request.requestedCents); } catch (error) { bonusError = (error as Error).message; }
  const total = request.requestedCents + bonus;
  const name = player ? `${player.details.firstName} ${player.details.lastName}`.trim() : "Jugador";
  const statusStyle = accepted ? "bg-[#008a43] text-white" : request.status === "rejected" ? "bg-[#dc2626] text-white" : "bg-[#facc15] text-black";
  function cancelRejection() {
    if (actionLock.current !== "confirming") return;
    actionLock.current = "idle";
    setBusy(false);
    rejectionDialog.current?.close();
  }
  function load() {
    if (actionLock.current !== "idle") return;
    actionLock.current = "processing";
    setBusy(true);
    try {
      acceptDemoDeposit(request.casinoId, request.id);
      actionLock.current = "done";
      onResolved({ kind: "accepted", title: "Carga acreditada", message: `${format(total)} fichas para ${name}.`, id: crypto.randomUUID() });
    } catch (error) { actionLock.current = "idle"; setBusy(false); setNote((error as Error).message); }
  }
  function askRejection() {
    if (actionLock.current !== "idle") return;
    actionLock.current = "confirming";
    setBusy(true);
    rejectionDialog.current?.showModal();
  }
  function confirmRejection() {
    if (actionLock.current !== "confirming") return;
    actionLock.current = "processing";
    setBusy(true);
    try {
      rejectDemoDeposit(request.casinoId, request.id, "");
      actionLock.current = "done";
      onResolved({ kind: "rejected", title: "Carga rechazada", message: `${name} · No se acreditaron fichas.`, id: crypto.randomUUID() });
    } catch (error) { actionLock.current = "idle"; setBusy(false); rejectionDialog.current?.close(); setNote((error as Error).message); }
  }
  return <dialog ref={cardRef} aria-label="Detalle de carga" style={{ width: "min(600px, calc(100vw - 24px))", maxWidth: "calc(100vw - 24px)", height: "min(900px, calc(100dvh - 24px))" }} onCancel={(event) => { if (event.target !== event.currentTarget) return; event.preventDefault(); onBack(); }} className="deposit-detail m-auto grid w-full max-w-[600px] grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[6px] border border-[#343434] bg-[#101010] p-0 text-white shadow-xl backdrop:bg-black/70 backdrop:backdrop-blur-sm">
    <header className="relative grid grid-cols-[1fr_1fr_auto] divide-x divide-[#343434] border-b border-[#343434]">
      <div className="flex min-w-0 items-center px-2 py-1.5"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><h1 className="text-xl font-bold leading-6 tabular-nums">{format(request.requestedCents)} <span className="text-[9px] font-normal text-slate-500">fichas</span></h1><span className={`inline-flex h-5 w-20 shrink-0 items-center justify-center rounded text-[9px] font-bold ${statusStyle}`}>{depositStatusLabels[request.status]}</span></div></div>
      <div className="flex min-w-0 items-center gap-1.5 px-2 py-1.5"><NavIcon href="/perfil" className="!size-4 text-slate-400" /><div className="min-w-0"><p className="break-words text-xs font-bold leading-4"><span className="sr-only">Jugador: </span>{name}</p><p className="text-[10px] font-bold leading-3.5 text-slate-300">CI {player?.ci ?? "Sin datos"}</p></div></div>
      <button type="button" aria-label="Cerrar carga y volver a la lista" title="Volver a cargas" onClick={onBack} className="m-1.5 flex size-7 items-center justify-center self-center rounded-md border border-[#454545] text-lg text-slate-300 hover:bg-white/10">×</button>
    </header>
    <div className="deposit-detail-body min-h-0" style={{ gridTemplateColumns: "minmax(0, 1fr)", gridTemplateRows: "auto minmax(0, 1fr)" }}>
      <div className="deposit-detail-data min-h-0 space-y-1.5 px-1.5">
        <dl className="-mx-1.5 !mb-0 grid grid-cols-[0.8fr_1.5fr_0.7fr] overflow-hidden text-[10px] leading-3.5">{[["ID", request.id.replace(`${request.casinoId}-`, "")], ["Fecha y hora", date(request.createdAt)], ["Cajero", request.claimedBy ?? "Sin asignar"], ...(request.reviewedAt ? [["Resuelta", date(request.reviewedAt)]] : [])].map(([label, value], index) => <div key={label} className={`min-w-0 px-1.5 py-1 ${index < 2 ? "border-r border-[#343434]" : ""} ${index > 2 ? "col-span-3 border-t border-[#343434]" : ""}`}><dt className="mr-1 inline text-[9px] font-medium text-slate-400">{label}:</dt><dd className="inline break-words font-bold">{value}</dd></div>)}</dl>
        <div className={`-mx-1.5 !mt-0 grid items-stretch overflow-hidden border-y border-[#343434] bg-black ${actionable ? "deposit-credit-summary-actions" : "grid-cols-1"}`}>
          <dl className="grid min-w-0 grid-cols-3 divide-x divide-[#343434] text-[11px]"><div className="min-w-0 px-1.5 py-1"><dt className="text-[9px] font-bold leading-3 text-slate-300">Carga</dt><dd className="text-base font-bold leading-5 tabular-nums">{format(request.requestedCents)}</dd></div><div className="min-w-0 px-1.5 py-1"><dt className="text-[9px] font-bold leading-3 text-slate-300">Bono</dt><dd className="text-base font-bold leading-5 tabular-nums text-[#00e676]">+ {format(bonus)}</dd></div><div className="min-w-0 px-1.5 py-1"><dt className="text-[9px] font-bold leading-3 text-slate-300">{accepted ? "Acreditado" : request.status === "rejected" ? "Sin acreditar" : "Total a acreditar"}</dt><dd className="text-base font-bold leading-5 tabular-nums text-[#00b0ff]">{request.status === "rejected" ? "0" : format(total)}</dd></div></dl>
          {actionable && <div className="grid grid-cols-2 items-center gap-1 border-t border-[#343434] p-1 deposit-credit-buttons"><button type="button" disabled={!!bonusError || busy} onClick={load} className="h-8 rounded border-2 border-[#003b1c] bg-[#008a43] px-1 text-xs font-bold text-white hover:bg-[#007238] disabled:opacity-40">Cargar</button><button type="button" disabled={busy} onClick={askRejection} className="h-8 rounded border-2 border-[#650e0e] bg-[#dc2626] px-1 text-xs font-bold text-white hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-40">Rechazar</button></div>}
        </div>
        {note && <p role="status" className="text-[10px] leading-4 text-sky-200">{note}</p>}
        {bonusError && <p role="alert" className="text-[11px] leading-4 text-red-200">{bonusError}</p>}
        {request.status === "rejected" && <p className="rounded-lg bg-red-400/5 p-2 text-[11px] leading-4 text-red-200">{request.reason}</p>}
        {accepted && <div className="text-[11px] text-slate-400"><p className="mb-1 font-bold text-emerald-200">Carga acreditada · Movimientos</p><ul className="space-y-1">{movements.map((movement) => <li key={movement.id} className="flex justify-between gap-2"><span>{movement.type === "bonus" ? "Bono" : "Carga"}</span><span className="tabular-nums text-slate-200">+ {format(movement.amountCents)}</span></li>)}</ul></div>}
      </div>
      <div className="deposit-detail-receipt flex min-h-0 flex-col bg-black p-0"><button type="button" aria-label="Ampliar comprobante de pago" onClick={() => receiptDialog.current?.showModal()} className="relative block min-h-0 flex-1 overflow-hidden bg-black focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky-400"><img src={request.receiptUrl} alt={`Comprobante de la solicitud ${request.id}`} className="absolute inset-0 h-full max-h-full w-full max-w-full object-contain" /></button></div>
    </div>
    <dialog ref={rejectionDialog} onCancel={(event) => { event.preventDefault(); cancelRejection(); }} aria-labelledby="reject-load-title" aria-describedby="reject-load-description" className="fixed inset-0 m-auto w-[min(360px,calc(100vw-32px))] rounded-[8px] border border-white/15 bg-[#18243a] p-4 text-white shadow-xl backdrop:bg-black/75">
      <h2 id="reject-load-title" className="text-base font-semibold">¿Rechazar esta carga?</h2><p id="reject-load-description" className="mt-2 text-xs leading-5 text-slate-300">Solicitud de {name} por {format(request.requestedCents)} fichas. No se acreditará la carga ni el bono.</p>
      <div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={cancelRejection} className="rounded-md border border-white/20 px-3 py-2 text-xs font-semibold hover:bg-white/5">Cancelar</button><button type="button" onClick={confirmRejection} className="rounded-md bg-[#dc2626] px-3 py-2 text-xs font-bold text-white hover:bg-[#b91c1c]">Sí, rechazar</button></div>
    </dialog>
    <dialog ref={receiptDialog} aria-label="Comprobante ampliado" onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }} className="fixed inset-0 m-auto max-h-[95dvh] w-[min(850px,95vw)] rounded-2xl border border-white/15 bg-[#101c35] p-4 text-white backdrop:bg-black/80"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">Comprobante de pago</h2><button type="button" onClick={() => receiptDialog.current?.close()} className={button}>Cerrar</button></div><img src={request.receiptUrl} alt="Comprobante ampliado" className="max-h-[80dvh] w-full object-contain" /></dialog>
  </dialog>;
}

export function DepositReview({ casinoId }: { casinoId: string }) {
  const { requests } = useDepositDemo();
  const players = useRegistrations();
  const [filter, setFilter] = useState<"open" | "all" | DepositRequest["status"]>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<DepositNotice | null>(null);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const pageSize = 20;
  const rows = requests.filter((row) => row.casinoId === casinoId).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id.localeCompare(a.id));
  const selected = rows.find((row) => row.id === selectedId);
  const filtered = rows.filter((row) => {
    const player = players.find((item) => item.id === row.playerId && item.casinoId === casinoId);
    return (filter === "all" || (filter === "open" ? row.status === "pending" || row.status === "reviewing" : row.status === filter)) && `${row.id} ${player?.ci ?? ""} ${player?.details.firstName ?? ""} ${player?.details.lastName ?? ""}`.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es").trim());
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);
  return <div className="space-y-5" data-screen="admin-cargas">
    <div role="status" aria-live="polite" aria-atomic="true" className="fixed bottom-4 right-4 z-50 w-[min(340px,calc(100vw-32px))]">
      {notice && <div className={`flex items-start gap-3 rounded-[8px] border border-[#343434] border-l-4 bg-[#111111] p-3 text-white shadow-2xl ${notice.kind === "accepted" ? "border-l-[#00c96a]" : "border-l-[#ef4444]"}`}><span aria-hidden="true" className={`mt-0.5 text-lg font-bold ${notice.kind === "accepted" ? "text-[#00e676]" : "text-[#ef4444]"}`}>{notice.kind === "accepted" ? "✓" : "×"}</span><div className="min-w-0 flex-1"><p className="text-sm font-bold">{notice.title}</p><p className="mt-1 text-xs leading-5 text-slate-300">{notice.message}</p></div><button type="button" aria-label="Cerrar aviso" onClick={() => setNotice(null)} className="flex size-7 shrink-0 items-center justify-center rounded text-lg text-slate-400 hover:bg-white/10 hover:text-white">×</button></div>}
    </div>
    {selected ? <DepositDetail key={selected.id} request={selected} onBack={() => setSelectedId(null)} onResolved={(result) => { setSelectedId(null); setNotice(result); }} /> : <>
      <header className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-xl font-semibold">Cargas</h1><p className="text-[11px] text-slate-500">20 por página · Más recientes primero</p></header>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#171f31] p-2">
        <div className="mb-2 flex flex-wrap items-center gap-2 rounded-md bg-[#202c44] p-2">
          <label><span className="sr-only">Estado de la carga</span><select value={filter} onChange={(event) => { setFilter(event.target.value as typeof filter); setPage(1); }} className="h-8 rounded-md border border-white/10 bg-[#293654] px-2 text-xs text-white outline-none focus:border-sky-400"><option value="open">Pendientes y en revisión</option><option value="pending">Pendientes</option><option value="reviewing">En revisión</option><option value="accepted">Pagadas</option><option value="rejected">Rechazadas</option><option value="all">Todas</option></select></label>
          <label className="min-w-40 flex-1 sm:max-w-sm"><span className="sr-only">Buscar solicitud</span><input type="search" placeholder="Buscar CI, nombre o solicitud" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="h-8 w-full rounded-md border border-white/10 bg-[#293654] px-2 text-xs text-white outline-none focus:border-sky-400" /></label>
          <span className="ml-auto text-[11px] text-slate-400">Cantidad: <strong className="text-slate-200">{filtered.length}</strong></span>
        </div>
        <ul aria-label="Solicitudes de carga, más recientes primero" className="overflow-hidden rounded-lg border border-white/5 divide-y divide-white/[0.06]">
          {pageRows.map((request) => {
            const player = players.find((row) => row.id === request.playerId && row.casinoId === casinoId);
            const name = player ? `${player.details.firstName} ${player.details.lastName}`.trim() : "Jugador";
            const statusStyle = request.status === "accepted" ? "bg-[#008a43] text-white" : request.status === "rejected" ? "bg-[#dc2626] text-white" : request.status === "reviewing" ? "bg-[#0369c7] text-white" : "bg-[#facc15] text-black";
            return <li key={request.id} className="odd:bg-[#26324b] even:bg-[#1d273b]">
              <button type="button" onClick={() => setSelectedId(request.id)} aria-label={`Abrir carga de ${name}, ${format(request.requestedCents)} fichas, ${depositStatusLabels[request.status]}`} className="group grid w-full grid-cols-[32px_minmax(0,1fr)_auto_12px] items-center gap-x-2.5 px-3 py-2.5 text-left transition hover:bg-sky-400/[0.06] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky-300 sm:grid-cols-[36px_minmax(0,1fr)_auto_16px] sm:gap-x-3">
                <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full border border-sky-300/15 bg-sky-400/10 text-xs font-semibold text-sky-200 sm:size-9">{name.charAt(0).toUpperCase()}</span>
                <span className="min-w-0"><span className="block truncate text-xs font-semibold text-slate-100 sm:text-sm">{name}</span><span className="mt-0.5 block truncate text-[10px] leading-4 text-slate-400 sm:text-[11px]">{date(request.createdAt)}<span className="hidden text-slate-500 sm:inline"> · #{request.id.replace(`${casinoId}-load-`, "")}</span>{request.bonus && <span className="ml-2 hidden text-sky-300/80 sm:inline">Con bono</span>}</span></span>
                <span className="text-right"><span className="block text-sm font-bold leading-5 tabular-nums text-slate-100">{format(request.requestedCents)} <span className="hidden text-[9px] font-normal text-slate-500 sm:inline">fichas</span></span><span className={`mt-0.5 inline-flex h-6 w-20 shrink-0 items-center justify-center rounded text-[10px] font-semibold leading-none ${statusStyle}`}>{depositStatusLabels[request.status]}</span></span>
                <svg aria-hidden="true" width="12" height="16" viewBox="0 0 16 24" fill="none" className="text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-sky-300 motion-reduce:transform-none"><path d="m5 6 6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </li>;
          })}
        </ul>
        {!filtered.length && <p className="py-8 text-center text-xs text-slate-400">No hay solicitudes con esos filtros.</p>}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2"><p role="status" className="text-[11px] text-slate-400">{filtered.length ? `${start + 1}–${Math.min(start + pageSize, filtered.length)}` : "0"} de {filtered.length} solicitudes</p><nav aria-label="Páginas de cargas" className="flex items-center gap-2"><button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded-md border border-white/10 px-2 py-1.5 text-[11px] hover:bg-white/5 disabled:opacity-30">← Anterior</button><span className="text-[11px] text-slate-400">{currentPage} / {pageCount}</span><button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="rounded-md border border-white/10 px-2 py-1.5 text-[11px] hover:bg-white/5 disabled:opacity-30">Siguiente →</button></nav></div>
      </div>
    </>}
    {!selected && <p className="rounded-xl border border-amber-300/15 bg-amber-300/5 p-3 text-[11px] leading-5 text-amber-100/80">Simulación del panel con comprobantes ficticios. La acreditación solo modifica movimientos de muestra en esta pestaña y se reinicia al recargar. El envío desde el jugador y los pagos reales todavía no están conectados.</p>}
  </div>;
}
