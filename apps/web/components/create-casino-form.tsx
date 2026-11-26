"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createCasino } from "@/lib/platform-actions";

export function CreateCasinoForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const field = "w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    try {
      const result = await createCasino(new FormData(form));
      setMessage(result.message);
      if (result.ok) {
        form.reset();
        router.refresh();
      }
    } catch {
      setMessage("No se pudo conectar. Volvé a intentar.");
    } finally {
      setPending(false);
    }
  }

  return <form onSubmit={submit} className="max-w-sm space-y-3">
    <label className="grid gap-1">Nombre<input name="name" required minLength={2} maxLength={80} className={field} /></label>
    <label className="grid gap-1">Slug del subdominio<input name="slug" required minLength={2} maxLength={41} className={field} /></label>
    <button className="rounded-lg bg-white/15 px-4 py-2" disabled={pending}>Crear casa</button>
    {message && <p role="status">{message}</p>}
  </form>;
}
