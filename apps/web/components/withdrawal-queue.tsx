"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reviewWithdrawal } from "@/lib/house-operations-actions";
import { withdrawalStatusLabels, type WithdrawalStatus } from "@/lib/withdrawals";

const chips = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2 });
const when = new Intl.DateTimeFormat("es-PY", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Asuncion" });
const actions = [
  ["pending", "Pendiente"],
  ["reviewing", "Proceso"],
  ["accepted", "Pagado"],
] as const;

export type WithdrawalQueueItem = {
  id: string;
  playerName: string;
  status: WithdrawalStatus;
  requestedCents: number;
  createdAt: string;
  method: "alias" | "bank" | "";
  holderName: string;
  bankName: string;
  accountNumber: string;
  payoutIdentity: string;
  destination: string;
};

export function WithdrawalQueue({ requests }: { requests: readonly WithdrawalQueueItem[] }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");

  async function update(id: string, decision: "pending" | "reviewing" | "accepted" | "rejected") {
    setBusy(id);
    const result = await reviewWithdrawal(id, decision);
    setNote(result.message);
    setBusy("");
    if (result.ok) router.refresh();
  }

  return <div className="space-y-3">
    {note ? <p className="text-sm text-slate-300">{note}</p> : null}
    <ul className="space-y-3">
      {requests.map((request) => {
        const closed = request.status === "accepted" || request.status === "rejected";
        return <li key={request.id} className="rounded-xl border border-white/10 bg-[#142440] p-4 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <strong>{request.playerName}</strong>
            <span className="tabular-nums">{chips.format(request.requestedCents / 100)} fichas</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">{withdrawalStatusLabels[request.status]} · {when.format(new Date(request.createdAt))}</p>
          <dl className="mt-3 space-y-1 text-slate-200">
            {request.method === "bank" ? <>
              <div>Titular: {request.holderName}</div>
              <div>Banco: {request.bankName}</div>
              <div>Cuenta: {request.accountNumber}</div>
              <div>CI: {request.payoutIdentity}</div>
            </> : <div>Alias: {request.payoutIdentity || request.destination}</div>}
          </dl>
          <div className="mt-3 flex flex-wrap gap-2">
            {actions.map(([decision, label]) => {
              const current = request.status === decision;
              return <button key={decision} type="button" disabled={busy === request.id || closed || current} onClick={() => update(request.id, decision)} className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-40 ${current ? "bg-white text-black" : "border border-white/15"}`}>{label}</button>;
            })}
            <button type="button" disabled={busy === request.id || closed} onClick={() => update(request.id, "rejected")} className={`rounded-lg px-3 py-2 text-xs font-semibold ${request.status === "rejected" ? "bg-[#ff1744] text-white" : "border border-[#ff1744] text-[#ff1744] disabled:opacity-40"}`}>Rechazar</button>
          </div>
        </li>;
      })}
    </ul>
  </div>;
}
