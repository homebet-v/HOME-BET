import { HouseGate } from "@/components/house-gate";
import { HouseSubmissionForm } from "@/components/house-submission-form";
import { saveDepositAccount } from "@/lib/house-operations-actions";
import { adminSession } from "@/lib/platform";
import { supabaseRequest } from "@/lib/supabase";

const field = "w-full rounded-lg border border-white/15 bg-[#0c1730] px-3 py-2";

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{async (slug) => {
    const account = await adminSession(slug);
    if (!account) return null;
    const [current] = await supabaseRequest<{ holder_name: string; identity_number: string; alias: string; bank_name: string }[]>(
      `/rest/v1/house_deposit_accounts?select=holder_name,identity_number,alias,bank_name&casino_id=eq.${account.casino.id}&limit=1`,
      account.session.auth,
    );
    return <section className="max-w-lg space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Cuentas</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Esta es la cuenta que ven los jugadores cuando cargan fichas. Ellos copian el titular, el CI y el alias para transferir.</p>
      </div>
      <HouseSubmissionForm action={saveDepositAccount} label="Guardar cuenta">
        <label className="grid gap-1 text-sm">Nombre del titular<input name="holder" defaultValue={current?.holder_name ?? ""} required className={field} /></label>
        <label className="grid gap-1 text-sm">CI<input name="identity" defaultValue={current?.identity_number ?? ""} inputMode="numeric" required className={field} /></label>
        <label className="grid gap-1 text-sm">Alias<input name="alias" defaultValue={current?.alias ?? ""} required className={field} /></label>
        <label className="grid gap-1 text-sm">Banco<input name="bank" defaultValue={current?.bank_name ?? ""} required className={field} /></label>
      </HouseSubmissionForm>
    </section>;
  }}</HouseGate>;
}
