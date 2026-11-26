import { HouseGate } from "@/components/house-gate";
import { MissingHouse } from "@/components/missing-house";
import { adminSession } from "@/lib/platform";

export function OperationPlaceholder({ params, title, description, columns, empty }: { params: Promise<{ slug: string }>; title: string; description: string; columns: string[]; empty: string }) {
  return <HouseGate params={params}>{async (slug) => {
    const house = (await adminSession(slug))?.casino;
    if (!house) return <MissingHouse slug={slug} />;
    return <div className="space-y-6"><header><p className="text-[10px] tracking-widest text-slate-500 uppercase">Operaciones · {house.name}</p><h1 className="mt-2 text-2xl font-semibold">{title}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">{description}</p></header><div className="rounded-xl border border-amber-300/10 bg-amber-300/5 px-4 py-3 text-xs leading-5 text-amber-200/80">Sección en preparación. No hay operaciones conectadas ni acciones que modifiquen saldos.</div><section className="overflow-hidden rounded-xl border border-white/10"><div className="overflow-x-auto"><table className="w-full whitespace-nowrap text-left text-xs"><caption className="sr-only">{title} de {house.name}</caption><thead className="bg-white/[0.03] text-slate-400"><tr>{columns.map((column) => <th key={column} className="px-5 py-3 font-medium">{column}</th>)}</tr></thead><tbody><tr><td colSpan={columns.length} className="px-5 py-14 text-center text-slate-500">{empty}</td></tr></tbody></table></div></section></div>;
  }}</HouseGate>;
}
