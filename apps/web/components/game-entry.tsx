"use client";

import { slotGameBySlug } from "@homebet/proveedores/catalog";
import { rouletteThemeBySlug } from "@homebet/proveedores/roulette-catalog";
import { SlotDemoLauncher } from "@/components/slot-demo-launcher";
import { RouletteDemoLauncher } from "@/components/roulette-demo-launcher";
import { useRef } from "react";
import Link from "next/link";
import { useDemoPlayer } from "@/components/demo-player-context";
import { verificationLabels } from "@/lib/verification";
import type { CatalogGame } from "@/lib/fixtures";

export function GameEntry({ name, slug, runtime, duplicate = false }: {
  name: string;
  slug?: string;
  runtime?: CatalogGame["runtime"];
  duplicate?: boolean;
}) {
  const demo = useDemoPlayer();
  const dialog = useRef<HTMLDialogElement>(null);
  const status = demo?.player?.status;
  const roulette = runtime === "roulette-european" ? rouletteThemeBySlug(slug ?? "") : undefined;
  if (roulette && demo?.canPlay) return <RouletteDemoLauncher theme={roulette} duplicate={duplicate} />;
  const game = runtime === "roulette-european" ? undefined : slotGameBySlug(slug ?? "");
  if (game && demo?.canPlay) return <SlotDemoLauncher game={game} duplicate={duplicate} label="Jugar demo" />;
  return <>
    <button type="button" tabIndex={duplicate ? -1 : undefined} onClick={() => dialog.current?.showModal()} aria-label={`${demo?.canPlay ? "Jugar" : "Ver acceso a"} ${name}`} className="mt-3 w-full rounded-lg border border-white/20 bg-black/40 px-2 py-2 text-[11px] font-semibold text-[color:var(--casino-accent,#facc15)]">{demo?.canPlay ? "Jugar" : "Ver acceso"}</button>
    <dialog ref={dialog} aria-label={`Acceso a ${name}`} className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-sm space-y-4 rounded-2xl border border-white/15 bg-[#091b24] p-6 text-white backdrop:bg-black/80">
      <h2 className="text-lg font-semibold">{name}</h2>
      <p className="text-sm leading-6 text-slate-300">{!demo?.signedIn ? "Creá tu cuenta con CI y contraseña. Para jugar, después necesitás verificar tu identidad." : demo.canPlay ? "Tu identidad está verificada. Este juego es una muestra del catálogo y todavía no tiene una partida real habilitada." : status === "pending" ? "Tu verificación está en revisión. Podrás jugar cuando la casa la apruebe." : status === "rejected" ? "Tu cuenta fue rechazada. Solo la administración puede cambiar este estado." : "Completá tu verificación de identidad para entrar a jugar."}</p>
      {status && !demo?.canPlay && <p className="text-xs text-amber-200">{verificationLabels[status]}{demo?.player?.reason ? `: ${demo.player.reason}` : ""}</p>}
      {!demo?.canPlay && <Link href="/cuenta" className="block rounded-xl bg-white/10 p-3 text-center text-sm font-semibold" onClick={() => dialog.current?.close()}>{demo?.signedIn ? "Ir a mi verificación" : "Ingresar o crear cuenta"}</Link>}
      <button type="button" onClick={() => dialog.current?.close()} className="w-full rounded-xl border border-white/15 p-3 text-sm">Volver al catálogo</button>
    </dialog>
  </>;
}
