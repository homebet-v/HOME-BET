"use client";

import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { SurfaceNav } from "@/components/surface-nav";
import { operationNav, managementNav } from "@/lib/nav";
import Link from "next/link";
import { defaultAppearance } from "@/lib/appearance";
import { NavIcon } from "@/components/nav-icon";
import { SignOut } from "@/components/platform-login";

function MenuIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}

export function AdminShell({ name, children }: { name: string; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const identityAppearance = defaultAppearance(name);
  const drawer = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => { if (query.matches) drawer.current?.close(); };
    query.addEventListener("change", closeOnDesktop);
    return () => query.removeEventListener("change", closeOnDesktop);
  }, []);
  const identity = (compact = false) => <div className={`flex min-w-0 items-center gap-3 py-5 ${compact ? "justify-center px-2" : "px-5"}`}><span title={compact ? name : undefined} className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-sky-300/35 bg-sky-400/15 text-sm font-semibold text-sky-200">{identityAppearance.iconImage ? <img src={identityAppearance.iconImage} alt={compact ? name : ""} className="size-8 object-contain" /> : name.slice(0, 1).toUpperCase()}</span><div className={compact ? "sr-only" : "min-w-0"}><p className="truncate text-sm font-semibold">{name}</p><p className="mt-1 text-[10px] text-slate-500">Panel de la casa</p></div></div>;
  const navigation = (compact = false) => <div style={{ scrollbarWidth: "thin", scrollbarColor: "#465267 #101c35", colorScheme: "dark" }} className={`admin-scroll min-h-0 flex-1 overflow-y-auto border-t border-white/[0.05] py-4 ${compact ? "px-2" : "px-3"}`}>
    <Link href="/" title={compact ? "Resumen" : undefined} className={`mb-4 flex items-center rounded-lg py-2 text-xs text-slate-300 hover:bg-white/5 ${compact ? "justify-center px-2" : "gap-3 px-3"}`}><NavIcon href="/" /><span className={compact ? "sr-only" : undefined}>Resumen</span></Link>
    <p className={compact ? "sr-only" : "mb-2 px-3 text-[9px] font-medium tracking-[0.18em] text-slate-500 uppercase"}>Operaciones</p>
    <Suspense fallback={<span className="sr-only">Cargando menú…</span>}><SurfaceNav items={operationNav} vertical compact={compact} /></Suspense>
    {compact ? <div className="mt-4 border-t border-white/10 pt-4"><p className="sr-only">Administración</p><Suspense fallback={null}><SurfaceNav items={managementNav} vertical compact /></Suspense></div> : <details open className="mt-4 border-t border-white/[0.06] pt-3"><summary className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5"><span className="inline-flex items-center gap-2 align-middle"><NavIcon href="/admin" />Administración</span></summary><div className="mt-2 border-l border-white/10 pl-2"><Suspense fallback={<p className="px-3 text-xs text-slate-500">Cargando…</p>}><SurfaceNav items={managementNav} vertical /></Suspense></div></details>}
  </div>;
  const footer = (compact = false) => <div className={`mt-auto shrink-0 border-t border-white/10 py-3 ${compact ? "px-2" : "px-3"}`}>
    <SignOut sidebar={compact ? "compact" : "expanded"} />
  </div>;
  return <div className="flex min-h-screen flex-1 flex-col admin-panel bg-[#080f20] md:flex-row">
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/[0.07] bg-[#101c35] px-4 py-3 md:hidden"><button ref={trigger} type="button" aria-label="Abrir menú de administración" aria-haspopup="dialog" onClick={() => drawer.current?.showModal()} className="flex size-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/5"><MenuIcon /></button><div><p className="text-sm font-semibold">{name}</p><p className="text-[10px] text-slate-500">Panel de la casa</p></div></header>
    <aside aria-label="Menú de administración" className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-white/[0.07] bg-[#101c35] transition-[width] duration-200 motion-reduce:transition-none md:flex ${collapsed ? "w-16" : "w-56"}`}>
      {identity(collapsed)}
      <div className={`pb-3 ${collapsed ? "px-2" : "px-3"}`}><button type="button" aria-label={collapsed ? "Desplegar menú" : "Plegar menú"} title={collapsed ? "Desplegar menú" : "Plegar menú"} aria-expanded={!collapsed} aria-controls="admin-desktop-navigation" onClick={() => setCollapsed((value) => !value)} className={`flex w-full items-center rounded-lg border border-white/10 py-2 text-xs text-slate-400 hover:bg-sky-400/10 hover:text-sky-200 ${collapsed ? "justify-center" : "gap-3 px-3"}`}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /><path d={collapsed ? "m13 9 3 3-3 3" : "m16 9-3 3 3 3"} /></svg>{!collapsed && <span>Plegar menú</span>}</button></div>
      <div id="admin-desktop-navigation" className="flex min-h-0 flex-1 flex-col">{navigation(collapsed)}</div>{footer(collapsed)}
    </aside>
    <dialog ref={drawer} aria-label="Menú de administración" onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }} onClose={() => trigger.current?.focus()} className="fixed inset-0 m-0 h-dvh max-h-dvh w-full max-w-none border-0 bg-transparent p-0 text-slate-100 backdrop:bg-black/60 backdrop:backdrop-blur-sm">
      <div className="flex h-full w-[min(280px,85vw)] flex-col border-r border-white/10 bg-[#101c35] shadow-2xl"><div className="flex items-center justify-between">{identity()}<button type="button" aria-label="Cerrar menú" onClick={() => drawer.current?.close()} className="mr-3 flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:text-white"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></button></div><div className="flex min-h-0 flex-1 flex-col" onClick={(event) => { if ((event.target as HTMLElement).closest("a")) drawer.current?.close(); }}>{navigation()}</div>{footer()}</div>
    </dialog>
    <main className="mx-auto w-full min-w-0 max-w-[1300px] flex-1 px-4 py-6 lg:px-7">{children}</main>
  </div>;
}
