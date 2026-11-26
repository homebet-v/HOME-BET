"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export function HouseSubmissionForm({ action, label, children, rememberRequest = false }: {
  action: (data: FormData) => Promise<{ ok: boolean; message: string }>; label: string; children: ReactNode; rememberRequest?: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const lastRequest = useRef<{ key: string; id: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    try {
      const data = new FormData(form);
      if (rememberRequest) {
        const receipt = data.get("receipt");
        const key = JSON.stringify([data.get("amount"), data.get("bonus"),
          receipt instanceof File ? [receipt.name, receipt.size, receipt.lastModified] : null]);
        if (lastRequest.current?.key !== key) lastRequest.current = { key, id: crypto.randomUUID() };
        data.set("requestId", lastRequest.current.id);
      }
      const response = await action(data);
      setMessage(response.message);
      if (response.ok) {
        lastRequest.current = null;
        form.reset();
        router.refresh();
      }
    } catch {
      setMessage("No se pudo enviar el formulario.");
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={submit} className="space-y-4 rounded-xl border border-white/10 bg-black/30 p-4">
    <fieldset disabled={busy} className="space-y-3">{children}</fieldset>
    <button disabled={busy} className="rounded-lg bg-sky-400 px-4 py-2 font-semibold text-slate-950 disabled:opacity-50">{busy ? "Enviando…" : label}</button>
    {message && <p role="status" className="text-sm">{message}</p>}
  </form>;
}
