"use client";

import Link from "next/link";
import { usePlayerSession } from "@/components/player-session";
import { slotGameBySlug } from "@homebet/proveedores/catalog";
import { rouletteThemeBySlug } from "@homebet/proveedores/roulette-catalog";
import { SlotDemoLauncher } from "@/components/slot-demo-launcher";
import { RouletteDemoLauncher } from "@/components/roulette-demo-launcher";
import type { CatalogGame } from "@/lib/game-library";

export function GameEntry({ slug, runtime, duplicate = false }: {
  name: string;
  slug?: string;
  runtime?: CatalogGame["runtime"];
  duplicate?: boolean;
}) {
  const player = usePlayerSession();
  const roulette = runtime === "roulette-european" ? rouletteThemeBySlug(slug ?? "") : undefined;
  const slot = runtime === "roulette-european" ? undefined : slotGameBySlug(slug ?? "");
  if ((roulette || slot) && !player?.verified) return <Link
    href={player ? "/verificacion" : "/cuenta"}
    tabIndex={duplicate ? -1 : undefined}
    className="mt-3 block rounded-lg border border-white/20 bg-black/40 px-2 py-2 text-center text-[11px] font-semibold text-[color:var(--casino-accent,#facc15)]"
  >{player ? "Verificar cuenta" : "Ingresar para jugar"}</Link>;
  if (roulette) return <RouletteDemoLauncher theme={roulette} duplicate={duplicate} />;
  if (slot) return <SlotDemoLauncher game={slot} duplicate={duplicate} label="Probar juego" />;
  return null;
}
