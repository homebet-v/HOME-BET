import { HouseGate } from "@/components/house-gate";
import { MissingHouse } from "@/components/missing-house";
import { CashierEditor } from "@/components/cashier-editor";
import { houseBySlug } from "@/lib/fixtures";
export const metadata = { title: "Cajeros · Mi casino" };
export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{(slug) => houseBySlug(slug) ? <div className="space-y-6"><header><p className="text-[10px] tracking-widest text-slate-500 uppercase">Administración / Equipo</p><h1 className="mt-2 text-2xl font-semibold">Cajeros</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Equipo operativo de esta casa: cargas, retiros y atención a jugadores.</p></header><div className="rounded-xl border border-white/10 p-5"><h2 className="text-sm font-medium">Equipo de la casa</h2><p className="py-8 text-center text-xs text-slate-500">Todavía no hay cajeros conectados.</p></div><CashierEditor /><p className="text-xs leading-6 text-slate-500">Cada operador pertenecerá a una casa. Las operaciones deberán registrar al responsable; la configuración y gestión del equipo corresponderán al administrador.</p></div> : <MissingHouse slug={slug} />}</HouseGate>;
}
