import { HomeHeading } from "@/components/home-heading";
import { homeCasinos } from "@/lib/platform";
import { Suspense } from "react";
import { surfaceOrigin } from "@/lib/tenant";

export const metadata = { title: "Dominios · Homebet" };

async function Domains() {
  const houses = await homeCasinos();
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN;

  return (
    <div className="flex flex-col gap-12" data-screen="home-dominios">
      <HomeHeading
        kicker="Casinos"
        title="Dominios"
        lede="El dominio es de un casino, no de un juego. La casa de jugadores y el panel viven en dos hosts del mismo nivel."
      />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Dominios de cada casino</caption>
          <thead className="text-xs tracking-wide text-zinc-500 uppercase">
            <tr className="border-b border-white/10">
              <th className="py-3 pr-4 font-medium">Casino</th>
              <th className="py-3 pr-4 font-medium">Jugadores</th>
              <th className="py-3 font-medium">Panel</th>
            </tr>
          </thead>
          <tbody>
            {houses.map((house) => {
              const casa = surfaceOrigin("casa", house.slug, root);
              const admin = surfaceOrigin("admin", house.slug, root);
              return (
                <tr key={house.slug} className="border-b border-white/10">
                  <td className="py-4 pr-4">{house.slug}</td>
                  <td className="py-4 pr-4">
                    <a className="text-zinc-300 underline decoration-white/20 underline-offset-4" href={casa}>
                      {casa.replace(/^https?:\/\//, "")}
                    </a>
                  </td>
                  <td className="py-4">
                    <a className="text-zinc-300 underline decoration-white/20 underline-offset-4" href={admin}>
                      {admin.replace(/^https?:\/\//, "")}
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DomainsPage() {
  return <Suspense fallback={<p>Cargando dominios…</p>}><Domains /></Suspense>;
}
