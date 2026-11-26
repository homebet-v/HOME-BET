"use client";

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
  const roulette = runtime === "roulette-european" ? rouletteThemeBySlug(slug ?? "") : undefined;
  if (roulette) return <RouletteDemoLauncher theme={roulette} duplicate={duplicate} />;
  const slot = runtime === "roulette-european" ? undefined : slotGameBySlug(slug ?? "");
  if (slot) return <SlotDemoLauncher game={slot} duplicate={duplicate} label="Probar juego" />;
  return null;
}
