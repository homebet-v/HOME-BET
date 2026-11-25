import { HouseGate } from "@/components/house-gate";
import { MissingHouse } from "@/components/missing-house";
import { BonusEditor } from "@/components/bonus-editor";
import { houseBySlug } from "@/lib/fixtures";
export const metadata = { title: "Bonos · Mi casino" };
export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{(slug) => houseBySlug(slug) ? <div className="space-y-6"><header><p className="text-[10px] tracking-widest text-slate-500 uppercase">Administración / Bonos</p><h1 className="mt-2 text-2xl font-semibold">Configurar bono</h1><p className="mt-2 text-sm text-slate-400">Definí el beneficio, las cargas que participan y su horario de vigencia.</p></header><BonusEditor key={slug} /></div> : <MissingHouse slug={slug} />}</HouseGate>;
}
