"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authenticate, endSession } from "@/lib/platform-actions";

export function PlatformLogin({ player = false }: { player?: boolean }) {
  const router = useRouter();
  const [register, setRegister] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    form.set("mode", register ? "register" : "login");
    setPending(true);
    setMessage("");
    try {
      const result = await authenticate(form);
      setMessage(result.message);
      if (result.ok && !register) router.refresh();
    } catch {
      setMessage("No se pudo conectar. Volvé a intentar.");
    } finally {
      setPending(false);
    }
  }

  const field = "w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2";
  return <form onSubmit={submit} className="space-y-4 text-sm">
    {register && <label className="grid gap-1">Nombre<input name="name" autoComplete="name" required minLength={2} maxLength={80} className={field} /></label>}
    <label className="grid gap-1">Correo electrónico<input name="email" type="email" autoComplete="email" required className={field} /></label>
    <label className="grid gap-1">Contraseña<input key={String(register)} name="password" type="password" required minLength={8} maxLength={72} autoComplete={register ? "new-password" : "current-password"} className={field} /></label>
    {register && <label className="grid gap-1">Confirmar contraseña<input name="confirmation" type="password" required minLength={8} autoComplete="new-password" className={field} /></label>}
    <button disabled={pending} className="w-full rounded-lg bg-white/15 p-2 font-semibold disabled:opacity-50">{register ? "Crear cuenta" : "Ingresar"}</button>
    {player && <button type="button" disabled={pending} className="underline" onClick={() => { setRegister(!register); setMessage(""); }}>{register ? "Ya tengo cuenta" : "Crear una cuenta"}</button>}
    {message && <p role="status">{message}</p>}
  </form>;
}

export function SignOut() {
  const router = useRouter();
  return <button type="button" className="rounded-lg border border-white/15 px-3 py-2" onClick={async () => {
    await endSession();
    router.refresh();
  }}>Cerrar sesión</button>;
}
