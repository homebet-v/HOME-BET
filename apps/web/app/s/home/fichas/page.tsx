import { HomeHeading } from "@/components/home-heading";
import { ChipForms } from "@/components/chip-forms";
import { chipMovements, houses } from "@/lib/fixtures";

export const metadata = { title: "Fichas · Homebet" };
const format = (value: number) => new Intl.NumberFormat("es-PY").format(value);

export default function ChipsPage() {
  const issued = chipMovements.filter((movement) => movement.kind === "Emisión").reduce((total, movement) => total + movement.amount, 0);
  const distributed = chipMovements.filter((movement) => movement.kind === "Distribución").reduce((total, movement) => total + movement.amount, 0);
  return <div className="flex flex-col gap-10" data-screen="home-fichas">
    <HomeHeading kicker="Tesorería de Home" title="Fichas" lede="Home emite y distribuye. Cada casino administra sus cargas, retiros y premios con sus propias fichas." />
    <dl className="grid gap-4 sm:grid-cols-3">{[["Emitidas", issued], ["Distribuidas a casinos", distributed], ["Disponibles en Home", issued - distributed]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 p-5"><dt className="text-sm text-zinc-400">{label}</dt><dd className="mt-3 text-2xl font-semibold">{format(Number(value))}</dd><p className="mt-1 text-xs text-zinc-500">fichas de muestra</p></div>)}</dl>
    <ChipForms />
    <section><h2 className="mb-4 text-lg font-medium">Historial de movimientos</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Emisiones y distribuciones de muestra</caption><thead className="text-zinc-500"><tr>{["Movimiento", "Fecha", "Operación", "Destino", "Fichas"].map((label) => <th key={label} className="border-b border-white/10 py-3 pr-4 font-normal">{label}</th>)}</tr></thead><tbody>{chipMovements.map((movement) => <tr key={movement.id} className="border-b border-white/10"><td className="py-4 pr-4 text-zinc-500">{movement.id}</td><td className="pr-4">{movement.date}</td><td className="pr-4">{movement.kind}</td><td className="pr-4">{houses.find((house) => house.slug === movement.houseSlug)?.name ?? "Home"}</td><td>{format(movement.amount)}</td></tr>)}</tbody></table></div></section>
  </div>;
}
