import { HomeHeading } from "@/components/home-heading";
import { CasinoCreateForm } from "@/components/casino-create-form";
import { QuietStatus } from "@/components/quiet-status";
import { defaultAppearance } from "@/lib/appearance";
import { houses } from "@/lib/fixtures";
import { surfaceOrigin } from "@/lib/tenant";

export const metadata = { title: "Casinos · Homebet" };

export default function HousesPage() {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost";

  return (
    <div className="flex flex-col gap-12" data-screen="home-casas">
      <HomeHeading
        kicker="Casinos"
        title="Factory Bet"
        lede="Acá se crea, se suspende y se abre cada casa. Los juegos no se fabrican en esta pantalla."
      />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Casinos de Home</caption>
          <thead className="text-xs tracking-wide text-zinc-500 uppercase">
            <tr className="border-b border-white/10">
              <th className="py-3 pr-4 font-medium">Casino</th>
              <th className="py-3 pr-4 font-medium">Estado</th>
              <th className="py-3 font-medium">Entradas</th>
            </tr>
          </thead>
          <tbody>
            {houses.map((house) => (
              <tr key={house.slug} className="border-b border-white/10">
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3"><img src={defaultAppearance(house.name).iconImage} alt="" className="size-9 shrink-0 object-contain" /><div><span className="block">{house.name}</span><span className="text-zinc-500">{house.slug}</span></div></div>
                </td>
                <td className="py-4 pr-4">
                  <QuietStatus status={house.status} />
                </td>
                <td className="py-4">
                  <a
                    className="text-zinc-300 underline decoration-white/20 underline-offset-4"
                    href={surfaceOrigin("casa", house.slug, root)}
                  >
                    Casa
                  </a>
                  <a
                    className="ml-4 text-zinc-300 underline decoration-white/20 underline-offset-4"
                    href={surfaceOrigin("admin", house.slug, root)}
                  >
                    Panel
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div id="nuevo-casino" className="scroll-mt-6">
      <CasinoCreateForm />
      </div>
    </div>
  );
}
