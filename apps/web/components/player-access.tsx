"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Link from "next/link";
import { PlatformLogin, SignOut } from "@/components/platform-login";
import { usePlayerSession } from "@/components/player-session";
import { palettes, type Appearance } from "@/lib/appearance";

export function PlayerAccess({ appearance, open, onClose }: { appearance: Appearance; open: boolean; onClose: () => void }) {
  const account = usePlayerSession();
  const dialog = useRef<HTMLDialogElement>(null);
  const palette = palettes[appearance.palette];

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);

  return <dialog
    ref={dialog}
    aria-labelledby="player-access-title"
    onClose={onClose}
    onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}
    className="fixed inset-0 m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-[420px] overflow-y-auto rounded-3xl border border-[color:var(--access-line)] p-0 text-white shadow-2xl backdrop:bg-black/75"
    style={{
      backgroundColor: palette.ink,
      "--access-accent": palette.accent,
      "--access-ink": palette.ink,
      "--access-line": `color-mix(in srgb, ${palette.accent} 35%, transparent)`,
    } as CSSProperties}
  >
    <div className="relative isolate grid min-h-36 place-items-center overflow-hidden border-b border-[color:var(--access-line)] bg-[color:var(--access-ink)] px-12 py-6">
      {appearance.backgroundImage && <img src={appearance.backgroundImage} alt="" className="pointer-events-none absolute inset-0 -z-20 size-full object-cover" />}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-black/25 to-[color:var(--access-ink)]" />
      <button type="button" aria-label="Cerrar acceso" onClick={() => dialog.current?.close()}
        className="absolute top-2 right-2 grid size-10 place-items-center rounded-full border border-white/20 bg-black/50 text-xl hover:border-[color:var(--access-accent)]">×</button>
      <div className="grid justify-items-center gap-3 text-center">
        {appearance.logoImage && <img src={appearance.logoImage} alt={appearance.brand} className="h-12 w-44 object-contain" />}
        <h2 id="player-access-title" className="text-xl font-bold">{account ? "Mi cuenta" : appearance.logoImage ? "Acceso de jugadores" : appearance.brand}</h2>
      </div>
    </div>
    <div className="p-5 sm:p-6">
      {account ? <div className="space-y-4 text-sm">
        {account.displayName && <p className="break-words">{account.displayName}</p>}
        <p className="text-lg font-semibold text-[color:var(--access-accent)]">{new Intl.NumberFormat("es-PY").format(account.balanceCents / 100)} fichas</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/saldo" className="underline" onClick={() => dialog.current?.close()}>Ver movimientos</Link>
          <SignOut />
        </div>
      </div> : <PlatformLogin player />}
    </div>
  </dialog>;
}
