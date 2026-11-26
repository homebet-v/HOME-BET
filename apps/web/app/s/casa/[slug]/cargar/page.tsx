import Link from "next/link";
import { HouseGate } from "@/components/house-gate";
import { HouseSubmissionForm } from "@/components/house-submission-form";
import { houseBonuses } from "@/lib/house-operations";
import { submitDeposit } from "@/lib/house-operations-actions";
import { playerAccount } from "@/lib/platform";
import { supabaseRequest } from "@/lib/supabase";
import { depositStatusLabels, type DepositRequest } from "@/lib/deposits";

export const metadata = { title: "Cargar fichas" };
const field = "w-full rounded-lg border border-white/20 bg-slate-950 px-3 py-2";

export default function LoadPage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{async (slug) => {
    const account = await playerAccount(slug);
    if (!account) return <Link className="inline-block p-4 underline" href="/cuenta">Ingresá con una cuenta verificada para solicitar una carga</Link>;
    const [bonuses, requests] = await Promise.all([
      houseBonuses(account.casino.id, account.session.auth),
      supabaseRequest<{ id: string; status: DepositRequest["status"]; requested_cents: number; reason: string }[]>(
        `/rest/v1/deposit_requests?select=id,status,requested_cents,reason&player_id=eq.${account.session.profile.id}&casino_id=eq.${account.casino.id}&order=created_at.desc&limit=20`,
        account.session.auth,
      ),
    ]);
    return <section className="mx-auto max-w-lg space-y-4 p-4">
      <h1 className="text-xl font-semibold">Cargar fichas</h1>
      <HouseSubmissionForm action={submitDeposit} label="Enviar comprobante" rememberRequest>
        <label className="grid gap-1 text-sm">Monto en fichas<input name="amount" inputMode="decimal" className={field} required /></label>
        {bonuses.length > 0 && <label className="grid gap-1 text-sm">Bono<select name="bonus" className={field}>
          <option value="">Sin bono</option>{bonuses.map((bonus) => <option key={bonus.id} value={bonus.id}>{bonus.name}</option>)}
        </select></label>}
        <label className="grid gap-1 text-sm">Comprobante de pago<input name="receipt" type="file" accept="image/jpeg,image/png,image/webp" required className={field} /></label>
        <p className="text-xs text-slate-300">JPG, PNG o WebP de hasta 3 MB.</p>
      </HouseSubmissionForm>
      <h2 className="font-semibold">Mis solicitudes</h2>
      {requests.length ? <ul className="divide-y divide-white/10">
        {requests.map((row) => <li key={row.id} className="py-3 text-sm">
          <strong>{new Intl.NumberFormat("es-PY").format(row.requested_cents / 100)} fichas</strong> · {depositStatusLabels[row.status]}
          {row.reason && <p className="text-slate-300">{row.reason}</p>}
        </li>)}
      </ul> : <p className="text-sm">Todavía no enviaste solicitudes.</p>}
    </section>;
  }}</HouseGate>;
}
