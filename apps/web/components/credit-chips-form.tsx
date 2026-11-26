"use client";

import { useRef, useState, type FormEvent } from "react";
import { creditChips } from "@/lib/platform-actions";

export function CreditChipsForm({ players }: { players: { id: string; display_name: string | null }[] }) {
  const operation = useRef<{ key: string; reference: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const field = "w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    const key = JSON.stringify([form.get("playerId"), form.get("amount")]);
    if (operation.current?.key !== key) operation.current = { key, reference: crypto.randomUUID() };
    form.set("reference", operation.current.reference);
    setBusy(true);
    try {
      const result = await creditChips(form);
      setMessage(result.message);
      if (result.ok) {
        operation.current = null;
        element.reset();
      }
    } catch {
      setMessage("No se pudo confirmar la acreditación. Reintentá con los mismos datos.");
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={submit} className="max-w-sm space-y-4">
    <label className="grid gap-1">Jugador<select name="playerId" required className={field} defaultValue="">
      <option value="" disabled>Elegí un jugador</option>
      {players.map((player) => <option key={player.id} value={player.id}>{player.display_name || player.id}</option>)}
    </select></label>
    <label className="grid gap-1">Cantidad de fichas<input name="amount" inputMode="decimal" required className={field} /></label>
    <button disabled={busy} className="rounded-lg bg-white/15 px-4 py-2 font-semibold disabled:opacity-50">Acreditar fichas</button>
    {message && <p role="status">{message}</p>}
  </form>;
}
