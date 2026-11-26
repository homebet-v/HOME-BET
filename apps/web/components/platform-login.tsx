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
    const element = event.currentTarget;
    const form = new FormData(element);
    form.set("mode", register ? "register" : "login");
    setPending(true);
    setMessage("");
    try {
      const result = await authenticate(form);
      setMessage(result.message);
      if (result.ok && register) {
        element.reset();
        setRegister(false);
      } else if (result.ok && result.next) {
        router.push(result.next);
      } else if (result.ok) {
        router.refresh();
      }
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

export function SignOut({ sidebar }: { sidebar?: "expanded" | "compact" } = {}) {
  const router = useRouter();
  const className = sidebar
    ? `flex min-h-10 w-full items-center rounded-lg text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-sky-300 ${sidebar === "compact" ? "justify-center" : "gap-3 px-3"}`
    : "rounded-lg border border-white/15 px-3 py-2";
  return <button type="button" className={className} title={sidebar === "compact" ? "Cerrar sesión" : undefined} onClick={async () => {
    await endSession();
    router.refresh();
  }}>
    {sidebar && <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 17l5-5-5-5m5 5H3m10-8h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" />
    </svg>}
    <span className={sidebar === "compact" ? "sr-only" : undefined}>Cerrar sesión</span>
  </button>;
}
