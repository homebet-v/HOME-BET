"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { PlatformLogin, SignOut } from "@/components/platform-login";
import { usePlayerSession } from "@/components/player-session";
import type { Appearance } from "@/lib/appearance";

export function PlayerAccess({ appearance, open, onClose }: { appearance: Appearance; open: boolean; onClose: () => void }) {
  const account = usePlayerSession();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);

  return <dialog ref={dialog} aria-labelledby="player-access-title" onClose={onClose}
    className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[420px] overflow-y-auto rounded-2xl border border-white/15 p-6 text-white backdrop:bg-black/80"
    style={{ backgroundColor: appearance.background }}>
    <div className="mb-6 flex items-center justify-between gap-3">
      <h2 id="player-access-title" className="text-xl font-semibold">{account ? "Mi cuenta" : appearance.brand}</h2>
      <button type="button" aria-label="Cerrar acceso" onClick={() => dialog.current?.close()} className="px-2 text-xl">×</button>
    </div>
    {account ? <div className="space-y-4 text-sm">
      <p className="break-all">{account.email}</p>
      <p>{new Intl.NumberFormat("es-PY").format(account.balanceCents / 100)} fichas</p>
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/saldo" className="underline" onClick={() => dialog.current?.close()}>Ver movimientos</Link>
        <SignOut />
      </div>
    </div> : <PlatformLogin player />}
  </dialog>;
}
