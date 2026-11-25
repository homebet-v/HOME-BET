"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { RouletteTheme } from "@homebet/proveedores/roulette-catalog";

const RoulettePlayer = dynamic(() => import("@homebet/proveedores/roulette-player"), {
  ssr: false,
  loading: () => <p className="p-8 text-center text-amber-100">Preparando la ruleta…</p>,
});

export function RouletteDemoLauncher({ theme, duplicate = false }: {
  theme: RouletteTheme;
  duplicate?: boolean;
}) {
  const [open, setOpen] = useState(false);
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

  return <>
    <button type="button" tabIndex={duplicate ? -1 : undefined} onClick={() => setOpen(true)}
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
      <RoulettePlayer theme={theme} onExit={() => setOpen(false)} />
    </dialog>}
  </>;
}
