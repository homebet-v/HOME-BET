import Link from "next/link";
import { DepositWizard } from "@/components/deposit-wizard";
import { HouseGate } from "@/components/house-gate";
import type { HouseDepositAccount } from "@/lib/deposit-account";
import { submitDeposit } from "@/lib/house-operations-actions";
import { houseBonuses } from "@/lib/house-operations";
import { playerAccount } from "@/lib/platform";
import { supabaseRequest } from "@/lib/supabase";
import { depositStatusLabels, type DepositRequest } from "@/lib/deposits";

const chips = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2 });

export default function LoadPage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{async (slug) => {
    const account = await playerAccount(slug);
    if (!account) return <Link className="inline-block p-4 underline" href="/cuenta">Ingresá con una cuenta verificada para solicitar una carga</Link>;
    const [bonuses, requests, destination] = await Promise.all([
      houseBonuses(account.casino.id, account.session.auth),
      supabaseRequest<{ id: string; status: DepositRequest["status"]; requested_cents: number; reason: string }[]>(
        `/rest/v1/deposit_requests?select=id,status,requested_cents,reason&player_id=eq.${account.session.profile.id}&casino_id=eq.${account.casino.id}&order=created_at.desc&limit=20`,
        account.session.auth,
      ),
      supabaseRequest<{ holder_name: string; identity_number: string; alias: string; bank_name: string }[]>(
        `/rest/v1/house_deposit_accounts?select=holder_name,identity_number,alias,bank_name&casino_id=eq.${account.casino.id}&limit=1`,
        account.session.auth,
      ),
    ]);
    const transfer: HouseDepositAccount | null = destination[0] ? {
      holderName: destination[0].holder_name,
      identityNumber: destination[0].identity_number,
      alias: destination[0].alias,
      bankName: destination[0].bank_name,
    } : null;
    return <section className="mx-auto max-w-lg space-y-4 p-4 text-white">
      <h1 className="text-xl font-semibold">Cargar fichas</h1>
      <DepositWizard key={requests[0]?.id ?? "nueva"} action={submitDeposit} account={transfer} bonuses={bonuses} />
      <h2 className="font-semibold">Mis cargas</h2>
      {requests.length ? <ul className="space-y-2">
        {requests.map((row) => <li key={row.id} className="rounded-[6px] border border-white/10 bg-black px-4 py-3 text-sm">
          <strong>{chips.format(row.requested_cents / 100)} fichas</strong> · {depositStatusLabels[row.status]}
          {row.reason ? <p className="mt-1 text-xs text-slate-300">{row.reason}</p> : null}
        </li>)}
      </ul> : <p className="rounded-[6px] border border-white/10 bg-black px-4 py-3 text-sm text-slate-300">Todavía no enviaste cargas.</p>}
    </section>;
  }}</HouseGate>;
}
