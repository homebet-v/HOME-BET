import Link from "next/link";
import { SlotStudio } from "@/components/slot-studio";
import { RouletteStudio } from "@/components/roulette-studio";
import { EngineStudio } from "@/components/engine-studio";
import { HomeHeading } from "@/components/home-heading";

export const metadata = { title: "Taller · Homebet" };

export default function WorkshopPage() {
  return (
    <div className="flex flex-col gap-12" data-screen="home-juegos">
      <HomeHeading
        kicker="Juegos"
        title="Taller"
        lede="Prepará los juegos de tus proveedores propios. Cada versión pasa al catálogo cuando está lista para ofrecerse a los casinos."
      />
      <EngineStudio />
      <RouletteStudio />
      <SlotStudio />
      <p className="max-w-xl text-sm leading-6 text-zinc-400">
        Publicar saca el juego del taller y lo deja en el catálogo. Desde ahí cada casino decide si lo activa.
      </p>
      <Link href="/catalogo" className="text-sm text-zinc-200 underline decoration-white/20 underline-offset-4">
        Ver el catálogo
      </Link>
    </div>
  );
}
