"use client";

import { useState } from "react";
import { houses } from "@/lib/fixtures";
import { isSlug, surfaceOrigin } from "@/lib/tenant";
import { NavIcon } from "@/components/nav-icon";

const input = "w-full rounded-lg border border-slate-500/40 bg-[#0b152c] px-3 py-2.5 text-sm text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-sky-400";
const reserved = new Set(["home", "www", "api", "app", "localhost"]);
function validDomain(value: string) {
  return value.length <= 253 && value.includes(".") && value.split(".").every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)) && /^[a-z]{2,63}$/.test(value.split(".").at(-1) ?? "");
}

export function CasinoCreateForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [domain, setDomain] = useState("");
  const [adminDomain, setAdminDomain] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [review, setReview] = useState(false);
  const [message, setMessage] = useState("");
  const cleanDomain = domain.trim().toLowerCase();
  const cleanAdminDomain = adminDomain.trim().toLowerCase() || (cleanDomain ? `admin.${cleanDomain}` : "");
  const validSlug = isSlug(slug) && !reserved.has(slug) && !slug.endsWith("-admin") && !houses.some((house) => house.slug === slug);
  return <section className="space-y-5"><header><p className="text-[10px] tracking-widest text-sky-300 uppercase">Alta de casino</p><h2 className="mt-2 text-xl font-semibold">Una nueva casa, desde Home</h2><p className="mt-2 text-xs leading-6 text-slate-400">Definí su identidad, sus accesos y el administrador que se hará cargo.</p></header>
    <form className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]" onChange={() => { setReview(false); setMessage(""); }} onSubmit={(event) => {
      event.preventDefault();
      if (!name.trim() || !adminName.trim()) { setMessage("Completá el nombre del casino y del administrador."); return; }
      if (!validSlug) { setMessage("Elegí un identificador disponible de 2 a 41 caracteres: letras minúsculas, números o guiones; debe comenzar con una letra y no terminar en guion ni en -admin. No uses nombres reservados."); return; }
      if (!validDomain(cleanDomain) || !validDomain(cleanAdminDomain)) { setMessage("Ingresá dominios válidos sin protocolo, puertos ni rutas. Ejemplo: krakenbet.com y admin.krakenbet.com."); return; }
      if (cleanDomain === cleanAdminDomain) { setMessage("La casa y el panel necesitan direcciones diferentes."); return; }
      setReview(true); setMessage("");
    }}>
      <div className="space-y-4"><section className="space-y-4 rounded-xl border border-sky-400/25 border-t-2 border-t-sky-400 bg-[#142440] p-5"><h3 className="flex items-center gap-2 text-sm font-semibold"><NavIcon href="/casas" />01 · Identidad</h3><label className="grid gap-2 text-xs text-slate-300">Nombre del casino<input required maxLength={60} value={name} onChange={(event) => setName(event.target.value)} placeholder="Krakenbet" className={input} /></label><label className="grid gap-2 text-xs text-slate-300">Identificador interno<input required maxLength={41} value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase())} placeholder="krakenbet" autoCapitalize="none" spellCheck={false} className={input} /></label><p className="text-[11px] leading-5 text-slate-400">Se usa para identificar la casa y sus accesos locales. Debe ser único.</p></section>
      <section className="space-y-4 rounded-xl border border-violet-400/25 border-t-2 border-t-violet-400 bg-[#1c2342] p-5"><h3 className="flex items-center gap-2 text-sm font-semibold"><NavIcon href="/dominios" />02 · Dominios propios</h3><label className="grid gap-2 text-xs text-slate-300">Dominio de jugadores<input required maxLength={253} value={domain} onChange={(event) => setDomain(event.target.value)} autoCapitalize="none" spellCheck={false} placeholder="krakenbet.com" className={input} /></label><label className="grid gap-2 text-xs text-slate-300">Dominio del panel<input maxLength={253} value={adminDomain} onChange={(event) => setAdminDomain(event.target.value)} autoCapitalize="none" spellCheck={false} placeholder={cleanDomain ? `admin.${cleanDomain}` : "admin.krakenbet.com"} className={input} /></label><p className="text-[11px] leading-5 text-slate-400">Si dejás el panel vacío, se propone admin.{cleanDomain || "tudominio.com"}. Estas direcciones requieren configuración DNS y verificación antes de activarse.</p></section>
      <section className="space-y-4 rounded-xl border border-emerald-400/25 border-t-2 border-t-emerald-400 bg-[#102e36] p-5"><h3 className="flex items-center gap-2 text-sm font-semibold"><NavIcon href="/admin" />03 · Administrador inicial</h3><label className="grid gap-2 text-xs text-slate-300">Nombre del responsable<input required maxLength={80} value={adminName} onChange={(event) => setAdminName(event.target.value)} autoComplete="name" className={input} /></label><label className="grid gap-2 text-xs text-slate-300">Correo de acceso al panel<input required type="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className={input} /></label><p className="text-[11px] leading-5 text-slate-400">El acceso se gestionará con Supabase Auth. Este formulario no crea credenciales ni envía invitaciones.</p></section>
      <button type="submit" className="rounded-lg bg-sky-400 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-sky-300">Revisar casino →</button><p role="status" className="text-xs leading-6 text-amber-200">{message}</p></div>
      <aside className="space-y-4 rounded-xl border border-sky-300/25 bg-[#102d48] p-5 xl:sticky xl:top-5"><p className="text-[10px] tracking-widest text-sky-300 uppercase">{review ? "Revisión final" : "Vista previa de accesos"}</p><h3 className="break-words text-lg font-semibold">{name.trim() || "Tu nuevo casino"}</h3><span className="inline-block rounded-full bg-amber-300/10 px-3 py-1 text-[10px] text-amber-200">Pendiente de configuración</span><dl className="space-y-4 text-xs"><div><dt className="text-slate-400">Casa de jugadores</dt><dd className="mt-1 break-all">{cleanDomain || "tudominio.com"}</dd></div><div><dt className="text-slate-400">Panel administrador y cajeros</dt><dd className="mt-1 break-all">{cleanAdminDomain || "admin.tudominio.com"}</dd></div><div><dt className="text-slate-400">Responsable</dt><dd className="mt-1 break-words">{adminName.trim() || "Sin completar"}</dd><dd className="mt-1 break-all text-slate-400">{email || "Correo pendiente"}</dd></div></dl>{validSlug && <div className="space-y-2 border-t border-white/10 pt-4 text-[10px] text-slate-400"><p>Accesos locales previstos</p><p className="break-all">{surfaceOrigin("casa", slug)}</p><p className="break-all">{surfaceOrigin("admin", slug)}</p><p>No estarán disponibles hasta que exista la casa.</p></div>}{review && <div className="space-y-3 border-t border-white/10 pt-4"><p className="text-xs leading-6 text-slate-300">Datos válidos para revisar. El estado inicial mantiene la casa pendiente de configuración.</p><button type="button" onClick={() => setMessage("Revisión completada. No se creó el casino, no se guardaron dominios ni se creó el administrador. Supabase sigue sin conectar.")} className="w-full rounded-lg border border-sky-300/40 bg-sky-400/15 px-3 py-2.5 text-xs font-medium text-sky-100">Finalizar revisión de muestra</button></div>}<p className="border-t border-white/10 pt-4 text-xs leading-6 text-slate-300">La identidad visual, portada y banners se configuran desde Apariencia en el panel de la casa.</p><p className="border-t border-white/10 pt-3 text-[10px] leading-5 text-slate-400">Demostración: no registra dominios, no comprueba su disponibilidad y no modifica el enrutamiento.</p></aside>
    </form>
  </section>;
}
