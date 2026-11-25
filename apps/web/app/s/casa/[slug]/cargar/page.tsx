import { HouseGate } from "@/components/house-gate";
import { MissingHouse } from "@/components/missing-house";
import { houseBySlug } from "@/lib/fixtures";
import Link from "next/link";
import { NavIcon } from "@/components/nav-icon";

export const metadata = { title: "Cargar · Mi casino" };
export default function LoadPage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{(slug) => houseBySlug(slug) ? <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6"><NavIcon href="/cargar" className="!size-8 text-teal-300" /><h1 className="text-xl font-semibold">Cargar fichas</h1><p className="max-w-md text-sm leading-6 text-slate-400">Acá podrás solicitar una carga a tu casa. Esta función todavía está en preparación; no se reciben pagos ni se acreditan fichas.</p><Link href="/cuenta" className="inline-block rounded-lg border border-white/15 px-4 py-2 text-xs">Ir a mi perfil →</Link></section> : <MissingHouse slug={slug} />}</HouseGate>;
}
