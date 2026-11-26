import Link from "next/link";
import { HouseGate } from "@/components/house-gate";
import { HouseSubmissionForm } from "@/components/house-submission-form";
import { PlayerLogin } from "@/components/player-profile";
import { defaultAppearance } from "@/lib/appearance";
import { submitWithdrawal } from "@/lib/house-operations-actions";
import { playerAccount, playerHouseSession } from "@/lib/platform";
import { supabaseRequest } from "@/lib/supabase";
import { withdrawalStatusLabels, type WithdrawalStatus } from "@/lib/withdrawals";

const chips = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2 });
const field = "w-full rounded-lg border border-white/20 bg-slate-950 px-3 py-2";

export default function WithdrawalsPage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{async (slug) => {
    const player = await playerHouseSession(slug);
    if (!player) return <PlayerLogin appearance={defaultAppearance(slug)} lead="Entrá con tu CI para pedir el retiro de tus premios." />;
    const account = await playerAccount(slug);
    if (!account) return <section className="mx-auto max-w-lg space-y-4 p-4 text-white">
      <h1 className="text-xl font-semibold">Retiros</h1>
      <p className="text-sm leading-6 text-slate-300">Cuando la casa verifique tu cuenta vas a poder retirar los premios.</p>
      <Link href="/verificacion" className="block rounded-[6px] border border-white/10 bg-black px-4 py-3 text-sm font-semibold">Completar verificación</Link>
    </section>;

    const requests = await supabaseRequest<{ id: string; status: WithdrawalStatus; requested_cents: number; destination: string; reason: string }[]>(
      `/rest/v1/withdrawal_requests?select=id,status,requested_cents,destination,reason&player_id=eq.${account.session.profile.id}&casino_id=eq.${account.casino.id}&order=created_at.desc&limit=20`,
      account.session.auth,
    );
    const open = requests.find((row) => row.status === "pending" || row.status === "reviewing");
    const withdrawable = account.withdrawableCents;

    return <section className="mx-auto max-w-lg space-y-4 p-4 text-white">
      <h1 className="text-xl font-semibold">Retiros</h1>
      <div className="rounded-[6px] border border-white/10 bg-black p-4">
        <p className="text-xs text-slate-400">Disponible para retirar</p>
        <p className="mt-1 text-3xl font-bold tabular-nums">{chips.format(withdrawable / 100)} <span className="text-base font-normal text-slate-300">fichas</span></p>
        <p className="mt-3 text-xs leading-5 text-slate-400">Solo los premios se pueden retirar. Las cargas y los bonos quedan para jugar. Las fichas se descuentan cuando la casa confirma el pago.</p>
      </div>
      {open ? <p className="rounded-[6px] border border-white/10 bg-black p-4 text-sm leading-6">
        Pediste <strong>{chips.format(open.requested_cents / 100)} fichas</strong>. El pedido está {withdrawalStatusLabels[open.status].toLowerCase()}.
        <span className="mt-1 block text-xs text-slate-400">Pago a: {open.destination}</span>
      </p> : withdrawable > 0 ? <HouseSubmissionForm action={submitWithdrawal} label="Pedir retiro" rememberRequest formClassName="space-y-4 rounded-[6px] border border-white/10 bg-black p-4" buttonClassName="w-full rounded-[6px] bg-white px-4 py-3 text-sm font-bold text-black disabled:opacity-50">
        <label className="grid gap-1 text-sm">Monto en fichas<input name="amount" inputMode="decimal" className={field} required /></label>
        <p className="text-xs text-slate-400">Podés pedir hasta {chips.format(withdrawable / 100)} fichas.</p>
        <label className="grid gap-1 text-sm">Datos para el pago<input name="destination" className={field} required placeholder="Alias, cuenta o teléfono" maxLength={120} /></label>
      </HouseSubmissionForm> : <p className="text-sm leading-6 text-slate-300">Todavía no hay premios para retirar. Cuando ganes, el pedido se hace desde acá.</p>}
      <h2 className="font-semibold">Mis retiros</h2>
      {requests.length ? <ul className="divide-y divide-white/10 rounded-[6px] border border-white/10 bg-black px-4">
        {requests.map((row) => <li key={row.id} className="py-3 text-sm">
          <strong>{chips.format(row.requested_cents / 100)} fichas</strong> · {withdrawalStatusLabels[row.status]}
          <p className="text-xs text-slate-400">{row.destination}</p>
          {row.reason ? <p className="text-slate-300">{row.reason}</p> : null}
        </li>)}
      </ul> : <p className="text-sm text-slate-300">Todavía no pediste retiros.</p>}
    </section>;
  }}</HouseGate>;
}
