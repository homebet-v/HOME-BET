import Link from "next/link";
import { HouseGate } from "@/components/house-gate";
import { WalletBreakdown } from "@/components/wallet-breakdown";
import { type DepositRequest } from "@/lib/deposits";
import { playerLedger } from "@/lib/platform";
import { supabaseRequest } from "@/lib/supabase";
import { ledgerMovementLabels } from "@/lib/wallet";
import { withdrawalStatusLabels, type WithdrawalStatus } from "@/lib/withdrawals";

export const metadata = { title: "Saldo · Mi casa" };
const display = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2 });
const when = new Intl.DateTimeFormat("es-PY", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const cargaStatus: Record<DepositRequest["status"], string> = { pending: "Pendiente", reviewing: "En revisión", accepted: "Acreditada", rejected: "Rechazada" };
const settled = new Set(["Acreditada", "Pagado", "Apuesta", "Premio"]);

export default function WalletPage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{async (slug) => {
    const wallet = await playerLedger(slug);
    if (!wallet) return <Link href="/cuenta">Ingresá para ver tu saldo</Link>;
    const filter = `player_id=eq.${wallet.session.profile.id}&casino_id=eq.${wallet.casino.id}&order=created_at.desc&limit=30`;
    const [loads, payouts] = await Promise.all([
      supabaseRequest<{ id: string; status: DepositRequest["status"]; requested_cents: number; created_at: string; reason: string }[]>(
        `/rest/v1/deposit_requests?select=id,status,requested_cents,created_at,reason&${filter}`, wallet.session.auth),
      supabaseRequest<{ id: string; status: WithdrawalStatus; requested_cents: number; created_at: string; reason: string }[]>(
        `/rest/v1/withdrawal_requests?select=id,status,requested_cents,created_at,reason&${filter}`, wallet.session.auth),
    ]);
    const moves = [
      ...loads.map((row) => ({ id: row.id, at: row.created_at, label: "Carga", status: cargaStatus[row.status], reason: row.reason, cents: row.requested_cents })),
      ...payouts.map((row) => ({ id: row.id, at: row.created_at, label: "Retiro", status: withdrawalStatusLabels[row.status], reason: row.reason, cents: row.requested_cents })),
      ...wallet.entries.filter((entry) => entry.kind === "stake" || entry.kind === "win").map((entry) => ({
        id: entry.id, at: entry.created_at, label: ledgerMovementLabels[entry.kind], status: ledgerMovementLabels[entry.kind], reason: "", cents: Math.abs(entry.amount_cents),
      })),
    ].sort((a, b) => b.at.localeCompare(a.at) || b.id.localeCompare(a.id));
    return <section className="mx-auto max-w-lg space-y-4 p-4 text-white">
      <h1 className="text-xl font-bold">Saldo</h1>
      <WalletBreakdown totalCents={wallet.balanceCents} withdrawableCents={wallet.withdrawableCents} />
      <h2 className="font-semibold">Últimos movimientos</h2>
      {moves.length ? <ul className="space-y-2">
        {moves.map((move) => {
          const reserved = move.label === "Retiro" && (move.status === "Pendiente" || move.status === "En proceso" || move.status === "Pagado");
          const paid = settled.has(move.status) || reserved;
          const outbound = move.label === "Retiro" || move.label === "Apuesta";
          const amount = `${paid ? (outbound ? "−" : "+") : ""}${display.format(move.cents / 100)} fichas`;
          return <li key={move.id} className="rounded-[6px] border border-white/10 bg-black px-4 py-3 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-semibold">{move.label}</span>
              <span className="tabular-nums">{amount}</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">{move.label === move.status ? when.format(new Date(move.at)) : `${move.status} · ${when.format(new Date(move.at))}`}</p>
            {move.reason ? <p className="mt-1 text-xs text-slate-300">{move.reason}</p> : null}
          </li>;
        })}
      </ul> : <p className="rounded-[6px] border border-white/10 bg-black px-4 py-3 text-sm text-slate-300">Todavía no hay cargas ni retiros.</p>}
    </section>;
  }}</HouseGate>;
}
