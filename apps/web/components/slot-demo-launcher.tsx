"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { SlotGame } from "@homebet/proveedores/catalog";

const SlotPlayer = dynamic(() => import("@/components/slot-player"), { ssr: false, loading: () => <p className="p-8 text-center text-sm text-slate-400">Preparando el motor…</p> });

export function SlotDemoLauncher({ game, duplicate = false, label = "Probar con fichas demo", className = "", autoOpen = false, hideTrigger = false }: { game: SlotGame; duplicate?: boolean; label?: string; className?: string; autoOpen?: boolean; hideTrigger?: boolean }) {
  const [open, setOpen] = useState(autoOpen);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    dialog.current?.showModal();
    return () => { document.documentElement.style.overflow = previous; };
  }, [open]);
  return <>
    {!hideTrigger && <button type="button" tabIndex={duplicate ? -1 : undefined} onClick={() => setOpen(true)} className={className || "mt-3 w-full rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 py-2.5 text-xs font-bold text-amber-100 hover:bg-amber-300/20"}>{label}</button>}
    {open && <dialog ref={dialog} aria-label={`Demo de ${game.name}`} onCancel={(event) => { if (event.target !== event.currentTarget) return; event.preventDefault(); setOpen(false); }} className="slot-demo-dialog fixed inset-0 m-auto h-dvh max-h-dvh w-screen max-w-4xl overflow-y-auto rounded-none sm:h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-24px)] sm:w-[calc(100vw-24px)] sm:rounded-2xl border border-white/15 bg-[#070a13] p-0 text-white shadow-2xl backdrop:bg-black/85"><SlotPlayer game={game} onExit={() => setOpen(false)} /></dialog>}
  </>;
}

