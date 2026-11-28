"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadHouseRoulette, playHouseRoulette } from "@/lib/house-play-actions";
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

export function RouletteDemoLauncher({ theme, duplicate = false, house = false, className }: {
  theme: RouletteTheme;
  duplicate?: boolean;
  house?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const [openingBalance, setOpeningBalance] = useState<number | null>(null);
  const [loadError, setLoadError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  function close() {
    setOpen(false);
    if (house) router.refresh();
  }

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
    if (house) {
      setOpeningBalance(null);
      setLoadError("");
      void loadHouseRoulette(theme.slug).then((result) => {
        if (!active) return;
        if (!result.ok) setLoadError(result.message);
        else setOpeningBalance(result.state.balanceCents);
      }).catch(() => { if (active) setLoadError("No se pudo leer el saldo."); });
    }
    return () => { active = false; };
  }, [open, theme, house]);

  return <>
    <button type="button" tabIndex={duplicate ? -1 : undefined} onPointerDown={() => { void prepareRoulette(theme); }}
      onClick={() => { setAssetsReady(false); setOpen(true); }}
      className={className ?? "mt-3 w-full rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 py-2.5 text-xs font-bold text-amber-100 hover:bg-amber-300/20"}>
      {house ? "Jugar" : "Jugar demo"}
    </button>
    {open && <dialog ref={dialog} aria-label={house ? theme.name : `Demo de ${theme.name}`}
      onCancel={(event) => {
        if (event.target !== event.currentTarget) return;
        event.preventDefault();
        close();
      }}
      className="rg-demo-dialog fixed inset-0 m-auto h-dvh max-h-dvh w-screen max-w-[480px] overflow-y-auto border border-white/15 bg-[#071015] p-0 text-white shadow-2xl backdrop:bg-black/90">
      {loadError
        ? <p role="alert" className="p-8 text-center text-amber-100">{loadError}</p>
        : assetsReady && (!house || openingBalance !== null)
        ? <RoulettePlayer theme={theme} openingBalance={house ? openingBalance ?? undefined : undefined} play={house ? async (roundId, bets) => {
            const result = await playHouseRoulette(theme.slug, roundId, bets);
            if (!result.ok) throw new Error(result.message);
            return result.state;
          } : undefined} onExit={close} />
        : <p role="status" className="p-8 text-center text-amber-100">{house && assetsReady ? "Cargando tu saldo…" : "Cargando recursos de la ruleta…"}</p>}
    </dialog>}
  </>;
}
