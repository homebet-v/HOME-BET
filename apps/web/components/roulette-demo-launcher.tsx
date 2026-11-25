"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { preloadGameImage } from "@/lib/preload-game-image";
import type { RouletteTheme } from "@homebet/proveedores/roulette-catalog";

const RoulettePlayer = dynamic(() => import("@homebet/proveedores/roulette-player"), {
  ssr: false,
  loading: () => <p className="p-8 text-center text-amber-100">Preparando la ruleta…</p>,
});

function prepareRoulette(theme: RouletteTheme) {
  const prismRoot = "/images/roulette/prism-roulette";
  const finish = theme.voltFinish;
  const multiplierRoot = finish?.rewardArt ? theme.artRoot : prismRoot;
  const controls = theme.variant === "prism"
    ? [
      `${theme.artRoot}/${finish?.centerImage ?? "center-crystal.webp"}`,
      ...(finish?.chassisImage ? [`${theme.artRoot}/${finish.chassisImage}`] : []),
      ...(!finish ? [`${prismRoot}/wordmark.webp`] : []),
      ...["counter-balance-chips", "counter-prize-chips"].map((name) => `${prismRoot}/${name}.webp`),
      ...(finish?.rewardArt === "volcanic"
        ? ["action-side-volcanic", "action-spin-volcanic", "prize-volcanic"].map((name) => `${theme.artRoot}/${name}.webp`)
        : ["action-side", "action-spin", "prize-card"].map((name) => `${prismRoot}/${name}.webp`)),
      ...([50, 100, 250] as const).map((amount) =>
        `${multiplierRoot}/${finish?.multiplierImages?.[amount] ?? `multiplier-${amount}.webp`}`),
    ]
    : ["spin", "undo", "repeat", "chip-0", "chip-1", "chip-2", "chip-3"]
      .map((name) => `${theme.artRoot}/${name}-v2.webp`);
  void import("@homebet/proveedores/roulette-player").catch(() => {});
  return Promise.allSettled([theme.scene, ...controls].map(preloadGameImage));
}

export function RouletteDemoLauncher({ theme, duplicate = false }: {
  theme: RouletteTheme;
  duplicate?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const modal = dialog.current;
    if (!open || !modal) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    if (!modal.open) modal.showModal();
    return () => {
      if (modal.open) modal.close();
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    void prepareRoulette(theme).then(() => { if (active) setAssetsReady(true); });
    return () => { active = false; };
  }, [open, theme]);

  return <>
    <button type="button" tabIndex={duplicate ? -1 : undefined} onPointerDown={() => { void prepareRoulette(theme); }}
      onClick={() => { setAssetsReady(false); setOpen(true); }}
      className="mt-3 w-full rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 py-2.5 text-xs font-bold text-amber-100 hover:bg-amber-300/20">
      Jugar demo
    </button>
    {open && <dialog ref={dialog} aria-label={`Demo de ${theme.name}`}
      onCancel={(event) => {
        if (event.target !== event.currentTarget) return;
        event.preventDefault();
        setOpen(false);
      }}
      className="rg-demo-dialog fixed inset-0 m-auto h-dvh max-h-dvh w-screen max-w-[480px] overflow-y-auto border border-white/15 bg-[#071015] p-0 text-white shadow-2xl backdrop:bg-black/90">
      {assetsReady
        ? <RoulettePlayer theme={theme} onExit={() => setOpen(false)} />
        : <p role="status" className="p-8 text-center text-amber-100">Cargando recursos de la ruleta…</p>}
    </dialog>}
  </>;
}
