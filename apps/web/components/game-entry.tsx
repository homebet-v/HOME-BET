"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePlayerSession } from "@/components/player-session";
import { slotGameBySlug } from "@homebet/proveedores/catalog";
import { rouletteThemeBySlug } from "@homebet/proveedores/roulette-catalog";
import { SlotDemoLauncher } from "@/components/slot-demo-launcher";
import { RouletteDemoLauncher } from "@/components/roulette-demo-launcher";
import type { CatalogGame } from "@/lib/game-library";

export function GameEntry({ name, slug, runtime, duplicate = false, cover }: {
  name: string;
  slug?: string;
  runtime?: CatalogGame["runtime"];
  duplicate?: boolean;
  cover?: { revealed: boolean; onToggle: () => void };
}) {
  const player = usePlayerSession();
  const roulette = runtime === "roulette-european" ? rouletteThemeBySlug(slug ?? "") : undefined;
  const slot = runtime === "roulette-european" ? undefined : slotGameBySlug(slug ?? "");
  const revealed = cover?.revealed ?? false;
  const coverButton = useRef<HTMLButtonElement>(null);
  const actionContainer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (revealed) actionContainer.current?.querySelector<HTMLElement>("button, a")?.focus({ preventScroll: true });
  }, [revealed]);
  const actionClass = cover ? "house-cover-action min-w-[min(100%,6rem)] max-w-full rounded-lg border px-3 py-2 text-center text-xs font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" : undefined;
  if (!roulette && !slot) return null;

  const action = !player?.verified ? <Link
    href={player ? "/verificacion" : "/cuenta"}
    tabIndex={duplicate ? -1 : undefined}
    className={actionClass ?? "mt-3 block rounded-lg border border-white/20 bg-black/40 px-2 py-2 text-center text-[11px] font-semibold text-[color:var(--casino-accent,#facc15)]"}
  >{player ? "Verificar cuenta" : "Ingresar para jugar"}</Link>
    : roulette ? <RouletteDemoLauncher theme={roulette} duplicate={duplicate} house className={actionClass} />
    : slot && <SlotDemoLauncher game={slot} duplicate={duplicate} house label="Jugar" className={actionClass} />;
  if (!cover) return action;

  return <div className="absolute inset-0" onKeyDown={(event) => {
    if (event.key !== "Escape" || !revealed || (event.target as HTMLElement).closest("dialog")) return;
    event.preventDefault();
    cover.onToggle();
    coverButton.current?.focus();
  }}>
    <button
      ref={coverButton}
      type="button"
      aria-label={`${revealed ? "Ocultar" : "Mostrar"} acceso a ${name}`}
      aria-expanded={revealed}
      onClick={cover.onToggle}
      className={`absolute inset-0 w-full transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white ${revealed ? "bg-black/70" : "bg-transparent"}`}
    />
    <div ref={actionContainer} inert={!revealed} className={`pointer-events-none absolute inset-0 grid place-items-center px-1 text-center transition-opacity duration-200 motion-reduce:transition-none [&>a]:pointer-events-auto [&>button]:pointer-events-auto [&>dialog]:pointer-events-auto ${revealed ? "opacity-100" : "opacity-0"}`}>
      {action}
    </div>
  </div>;
}
