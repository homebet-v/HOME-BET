"use client";

import { Suspense, useEffect, useRef, type ReactNode } from "react";
import { HomeNav, HomeNavFallback } from "@/components/home-nav";

export function HomeFrame({ children }: { children: ReactNode }) {
  const drawer = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const close = () => { if (query.matches) drawer.current?.close(); };
    query.addEventListener("change", close);
    return () => query.removeEventListener("change", close);
  }, []);
  const brand = <div className="px-5 py-5"><p className="flex items-center gap-2 text-lg font-bold tracking-tight"><span className="flex size-8 items-center justify-center rounded-lg bg-sky-400 text-sm text-slate-950">H</span>Homebet<span className="text-sky-400">.</span></p><p className="mt-3 text-[10px] tracking-[0.16em] text-slate-400 uppercase">Panel padre</p></div>;
  const navigation = <Suspense fallback={<HomeNavFallback />}><HomeNav /></Suspense>;
  return <div className="admin-panel flex min-h-screen flex-1 flex-col bg-[#080f20] md:flex-row">
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-[#101c35] px-4 py-3 md:hidden"><button ref={trigger} type="button" aria-label="Abrir menú de Home" aria-haspopup="dialog" onClick={() => drawer.current?.showModal()} className="flex size-9 items-center justify-center rounded-lg border border-sky-300/25 text-sky-200"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></button><p className="text-sm font-semibold">Homebet <span className="ml-2 text-[10px] font-normal text-slate-400">Panel padre</span></p></header>
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-white/10 bg-[#101c35] md:flex">{brand}<div className="admin-scroll min-h-0 flex-1 overflow-y-auto">{navigation}</div></aside>
    <dialog ref={drawer} aria-label="Menú de Home" onClose={() => trigger.current?.focus()} onClick={(event) => { if (event.target === event.currentTarget) drawer.current?.close(); }} className="fixed inset-0 m-0 h-dvh max-h-dvh w-full max-w-none border-0 bg-transparent p-0 text-slate-100 backdrop:bg-black/60 backdrop:backdrop-blur-sm"><div className="flex h-full w-[min(280px,85vw)] flex-col border-r border-white/10 bg-[#101c35] shadow-2xl"><div className="flex items-center justify-between">{brand}<button type="button" aria-label="Cerrar menú" onClick={() => drawer.current?.close()} className="mr-4 text-slate-300"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></button></div><div className="admin-scroll min-h-0 flex-1 overflow-y-auto" onClick={(event) => { if ((event.target as HTMLElement).closest("a")) drawer.current?.close(); }}>{navigation}</div></div></dialog>
    <main className="mx-auto flex w-full max-w-[1440px] min-w-0 flex-1 flex-col gap-6 px-4 py-6 lg:px-7">{children}</main>
  </div>;
}
