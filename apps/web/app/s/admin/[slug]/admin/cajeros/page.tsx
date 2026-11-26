import { HouseGate } from "@/components/house-gate";
import { CashierEditor } from "@/components/cashier-editor";
import { adminSession } from "@/lib/platform";
import { supabaseRequest } from "@/lib/supabase";

const labels = { internal: "Cajero de la casa", external: "Cajero externo", affiliate: "Afiliado" };

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{async (slug) => {
    const account = await adminSession(slug);
    if (!account) return null;
    const plans = await supabaseRequest<{ id: string; name: string; email: string; mode: keyof typeof labels }[]>(
      `/rest/v1/cashier_plans?select=id,name,email,mode&casino_id=eq.${account.casino.id}&order=created_at.desc`,
      account.session.auth,
    );
    return <section className="space-y-4">
      <h1 className="text-xl font-semibold">Cajeros</h1>
      {account.casino.status === "active" && <CashierEditor />}
      <h2 className="font-semibold">Perfiles guardados</h2>
      {plans.length ? <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-[#142440] px-4">
        {plans.map((plan) => <li key={plan.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
          <strong>{plan.name}</strong><span>{plan.email}</span><span className="text-slate-300">{labels[plan.mode]} · Pendiente de habilitación</span>
        </li>)}
      </ul> : <p>Todavía no hay perfiles guardados.</p>}
    </section>;
  }}</HouseGate>;
}
