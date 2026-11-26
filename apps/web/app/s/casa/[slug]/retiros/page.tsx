import Link from "next/link";
import { HouseGate } from "@/components/house-gate";
import { PlayerLogin } from "@/components/player-profile";
import { WithdrawalRequest } from "@/components/withdrawal-request";
import { defaultAppearance } from "@/lib/appearance";
import { submitWithdrawal } from "@/lib/house-operations-actions";
import { playerAccount, playerHouseSession } from "@/lib/platform";
import { supabaseRequest } from "@/lib/supabase";
import { withdrawalStatusLabels, type WithdrawalStatus } from "@/lib/withdrawals";

const chips = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2 });

function payoutLines(row: { payout_method: "alias" | "bank"; holder_name: string; bank_name: string; account_number: string; payout_identity: string; destination: string }) {
  if (row.payout_method === "bank") return [`Titular: ${row.holder_name}`, `Banco: ${row.bank_name}`, `Cuenta: ${row.account_number}`, `CI: ${row.payout_identity}`];
  return [`Alias: ${row.payout_identity || row.destination}`];
}

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

    const requests = await supabaseRequest<{ id: string; status: WithdrawalStatus; requested_cents: number; destination: string; reason: string; payout_method: "alias" | "bank"; holder_name: string; bank_name: string; account_number: string; payout_identity: string }[]>(
      `/rest/v1/withdrawal_requests?select=id,status,requested_cents,destination,reason,payout_method,holder_name,bank_name,account_number,payout_identity&player_id=eq.${account.session.profile.id}&casino_id=eq.${account.casino.id}&order=created_at.desc&limit=20`,
      account.session.auth,
    );
    const open = requests.find((row) => row.status === "pending" || row.status === "reviewing");
    const withdrawable = account.withdrawableCents;

    return <section className="mx-auto max-w-lg space-y-4 p-4 text-white">
      <h1 className="text-xl font-semibold">Retiros</h1>
      <div className="rounded-[6px] border border-white/10 bg-black p-4">
        <p className="text-xs text-slate-400">Disponible para retirar</p>
        <p className="mt-1 text-3xl font-bold tabular-nums">{chips.format(withdrawable / 100)} <span className="text-base font-normal text-slate-300">fichas</span></p>
        <p className="mt-3 text-xs leading-5 text-slate-400">Solo los premios se pueden retirar. Las cargas y los bonos quedan para jugar. Al solicitar, el monto sale de tu saldo. Si el cajero rechaza el pago, las fichas vuelven.</p>
      </div>
      {open ? <div className="rounded-[6px] border border-white/10 bg-black p-4 text-sm leading-6">
        <p>Pediste <strong>{chips.format(open.requested_cents / 100)} fichas</strong>. El pedido está {withdrawalStatusLabels[open.status].toLowerCase()}. Esas fichas ya salieron de tu saldo.</p>
        <div className="mt-2 space-y-1 text-xs text-slate-400">{payoutLines(open).map((line) => <p key={line}>{line}</p>)}</div>
      </div> : withdrawable > 0 ? <WithdrawalRequest action={submitWithdrawal} available={chips.format(withdrawable / 100)} /> : <p className="text-sm leading-6 text-slate-300">Todavía no hay premios para retirar. Cuando ganes, el pedido se hace desde acá.</p>}
      <h2 className="font-semibold">Mis retiros</h2>
      {requests.length ? <ul className="divide-y divide-white/10 rounded-[6px] border border-white/10 bg-black px-4">
        {requests.map((row) => <li key={row.id} className="py-3 text-sm">
          <strong>{chips.format(row.requested_cents / 100)} fichas</strong> · {withdrawalStatusLabels[row.status]}
          <div className="text-xs text-slate-400">{payoutLines(row).map((line) => <p key={line}>{line}</p>)}</div>
          {row.reason ? <p className="text-slate-300">{row.reason}</p> : null}
        </li>)}
      </ul> : <p className="text-sm text-slate-300">Todavía no pediste retiros.</p>}
    </section>;
  }}</HouseGate>;
}
