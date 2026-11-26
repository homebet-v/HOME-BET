import { Suspense } from "react";
import { AssignHouseAdminForm } from "@/components/assign-house-admin-form";
import { CreateCasinoForm } from "@/components/create-casino-form";
import { homeCasinos, homeSession } from "@/lib/platform";
import { surfaceOrigin } from "@/lib/tenant";

export const metadata = { title: "Casas · Homebet" };

async function Houses() {
  if (!await homeSession()) return null;
  const houses = await homeCasinos();
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  return <section className="space-y-5">
    <h1 className="text-xl font-bold">Casas</h1>
    <CreateCasinoForm />
    {houses.length > 0 && <AssignHouseAdminForm houses={houses.map(({ id, name }) => ({ id, name }))} />}
    {houses.length ? <ul className="divide-y divide-white/10">
      {houses.map((house) => <li key={house.id} className="flex flex-wrap items-center gap-4 py-3">
        <strong>{house.name}</strong><span>{house.status === "active" ? "Activa" : "Suspendida"}</span>
        <a className="underline" href={surfaceOrigin("casa", house.slug, root)}>Casa</a>
        <a className="underline" href={surfaceOrigin("admin", house.slug, root)}>Panel</a>
      </li>)}
    </ul> : <p>Todavía no hay casas registradas.</p>}
  </section>;
}

export default function HousesPage() {
  return <Suspense fallback={<p>Cargando casas…</p>}><Houses /></Suspense>;
}
