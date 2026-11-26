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
      if (result.ok) router.refresh();
    } catch {
      setMessage("No se pudo conectar. Volvé a intentar.");
    } finally {
      setPending(false);
    }
  }

  const field = `w-full rounded-lg border bg-black/30 px-3 py-2.5 text-white ${player
    ? "border-[color:var(--access-line)] focus:outline-2 focus:outline-offset-2 focus:outline-[color:var(--access-accent)]"
    : "border-white/15"}`;
  const submitClass = player
    ? "bg-[color:var(--access-accent)] text-[color:var(--access-ink)]"
    : "bg-white/15";
  const modes = [{ label: "Ingresar", register: false }, { label: "Crear cuenta", register: true }] as const;

  return <form onSubmit={submit} className="space-y-4 text-sm">
    {player && <div className="grid grid-cols-2 gap-1 rounded-xl border border-[color:var(--access-line)] bg-black/25 p-1" role="group" aria-label="Tipo de acceso">
      {modes.map((mode) => <button
        key={mode.label}
        type="button"
        disabled={pending}
        aria-pressed={register === mode.register}
        onClick={() => { setRegister(mode.register); setMessage(""); }}
        className={`rounded-lg px-2 py-2.5 font-semibold ${register === mode.register ? "bg-white/10 text-[color:var(--access-accent)]" : "text-white/80"}`}
      >{mode.label}</button>)}
    </div>}
    {register && <label className="grid gap-1.5">Nombre<input name="name" autoComplete="name" required minLength={2} maxLength={80} className={field} /></label>}
    {player
      ? <label className="grid gap-1.5">Número de CI<input name="ci" type="text" inputMode="numeric" autoComplete="username" pattern="[0-9]{5,15}" minLength={5} maxLength={15} title="Ingresá solo números, sin puntos ni guiones" placeholder="Sin puntos ni guiones" required className={field} /></label>
      : <label className="grid gap-1.5">Correo electrónico<input name="email" type="email" autoComplete="username" required className={field} /></label>}
    <label className="grid gap-1.5">Contraseña<input key={String(register)} name="password" type="password" required minLength={8} maxLength={72} autoComplete={register ? "new-password" : "current-password"} className={field} /></label>
    {register && <label className="grid gap-1.5">Confirmar contraseña<input name="confirmation" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className={field} /></label>}
    <button disabled={pending} className={`min-h-11 w-full rounded-xl px-4 py-2.5 font-bold disabled:opacity-50 ${submitClass}`}>
      {pending ? "Procesando…" : register ? "Crear cuenta" : "Ingresar"}
    </button>
    {message && <p role="status" className="leading-5 text-white/90">{message}</p>}
  </form>;
}

export function SignOut() {
  const router = useRouter();
  return <button type="button" className="rounded-lg border border-white/15 px-3 py-2" onClick={async () => {
    await endSession();
    router.refresh();
  }}>Cerrar sesión</button>;
}
