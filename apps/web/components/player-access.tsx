"use client";

import type { CSSProperties } from "react";
import { useDemoPlayer } from "@/components/demo-player-context";
import { PlayerProfile } from "@/components/player-profile";
import { useEffect, useRef, useState } from "react";
import type { Appearance } from "@/lib/appearance";
import { palettes } from "@/lib/appearance";

export function PlayerAccess({ appearance, open, onClose }: { appearance: Appearance; open: boolean; onClose: () => void }) {
  const demo = useDemoPlayer();
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [visible, setVisible] = useState(false);
  const [note, setNote] = useState("");
  const palette = palettes[appearance.palette];
  useEffect(() => { if (open && !dialog.current?.open) dialog.current?.showModal(); else if (!open && dialog.current?.open) dialog.current.close(); }, [open]);
  const input = "w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-teal-300/60 focus:ring-2 focus:ring-teal-300/10";
  return <dialog ref={dialog} aria-labelledby="player-access-title" onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }} style={{ "--casino-accent": palette.accent } as CSSProperties} className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[420px] overflow-hidden rounded-3xl border border-white/15 bg-[#091b24] p-0 text-white shadow-2xl backdrop:bg-[#020a10]/80 backdrop:backdrop-blur-md">
    <div className="player-access-scroll max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain">
    <div className="relative overflow-hidden border-b border-white/10 px-7 pt-8 pb-6" style={{ background: `radial-gradient(ellipse at top, ${palette.accent}25, transparent 80%)` }}><button type="button" aria-label="Cerrar acceso" onClick={() => dialog.current?.close()} className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-black/20 text-slate-400 hover:text-white"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>{appearance.iconImage && <img src={appearance.iconImage} alt="" className="mx-auto mb-3 size-16 object-contain" />}<p className="text-center text-xs font-bold tracking-[0.2em]" style={{ color: palette.accent }}>{appearance.brand}</p><h2 id="player-access-title" className="mt-4 text-center text-2xl font-semibold tracking-tight">{demo?.signedIn ? "Bienvenido a tu cuenta" : mode === "login" ? "Bienvenido a tu casa" : "Creá tu cuenta"}</h2><p className="mt-2 text-center text-xs leading-5 text-slate-400">{demo?.signedIn ? "Tu casa, tus juegos." : mode === "login" ? "Ingresá para acceder a tu cuenta." : "Creá tu acceso con CI y contraseña. Después verificá tu identidad para jugar."}</p></div>
    {demo?.signedIn ? <PlayerProfile accent={palette.accent} ink={palette.ink} onClose={() => dialog.current?.close()} /> : <div className="p-6"><div className="mb-5 grid grid-cols-2 rounded-xl bg-black/25 p-1">{(["login", "register"] as const).map((value) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => { setMode(value); setNote(""); }} className={`rounded-lg py-2.5 text-xs font-medium ${mode === value ? "bg-white/10 text-white" : "text-slate-500"}`}>{value === "login" ? "Ingresar" : "Crear cuenta"}</button>)}</div><form key={mode} className="space-y-4" onSubmit={(event) => {
      event.preventDefault();
      const values = new FormData(event.currentTarget);
      if (mode === "register" && values.get("password") !== values.get("confirmation")) { setNote("Las contraseñas no coinciden."); return; }
      try {
        const ci = String(values.get("identity-number") ?? "");
        const password = String(values.get("password") ?? "");
        if (mode === "register") demo?.register(ci, password);
        else demo?.signIn(ci, password);
        setNote("");
      } catch (error) { setNote((error as Error).message); }
    }}><label className="grid gap-2 text-xs text-slate-300">Número de CI<input required name="identity-number" autoComplete="username" inputMode="numeric" autoCapitalize="none" spellCheck={false} pattern="[0-9]{5,15}" title="Ingresá tu CI usando solo números, sin puntos ni guiones" placeholder="Tu cédula, sin puntos" className={input} /></label><label className="grid gap-2 text-xs text-slate-300">Contraseña<div className="relative"><input required name="password" type={visible ? "text" : "password"} minLength={mode === "register" ? 8 : 1} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder={mode === "register" ? "Al menos 8 caracteres" : "Tu contraseña"} className={`${input} pr-14`} /><button type="button" aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={visible} onClick={() => setVisible(!visible)} className="absolute inset-y-0 right-3 text-[10px] text-slate-400">{visible ? "Ocultar" : "Ver"}</button></div></label>{mode === "register" && <label className="grid gap-2 text-xs text-slate-300">Repetir contraseña<input required name="confirmation" type={visible ? "text" : "password"} minLength={8} autoComplete="new-password" className={input} placeholder="Repetí tu contraseña" /></label>}<button type="submit" className="w-full rounded-xl py-3 text-sm font-semibold transition hover:brightness-110" style={{ background: palette.accent, color: palette.ink }}>{mode === "login" ? "Ingresar" : "Crear cuenta"}</button><p role="status" className="text-xs leading-5 text-amber-200">{note}</p></form><p className="mt-5 text-center text-[10px] leading-5 text-slate-500">Demostración temporal: no uses contraseñas ni documentos reales. Se reinicia al recargar. Solo mayores de 18 años.</p></div>}
    </div>
  </dialog>;
}
