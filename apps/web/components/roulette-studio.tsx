"use client";
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import dynamic from 'next/dynamic';
import {ROULETTE_LAYOUTS,rouletteThemes,rouletteThemeBySlug,voltFoundry,voltFoundryRouletteThemes} from '@homebet/proveedores/roulette-catalog';
const RoulettePlayer=dynamic(()=>import('@homebet/proveedores/roulette-player'),{ssr:false,loading:()=> <p className="p-8 text-center text-amber-100">Preparando la ruleta…</p>});
const subscribeLocation=(listener:()=>void)=>{window.addEventListener('popstate',listener);return()=>window.removeEventListener('popstate',listener)};
const readTheme=()=>new URLSearchParams(window.location.search).get('theme')??'royal-gold';
export function RouletteStudio({autoOpen=false}:{autoOpen?:boolean}){
 const previewSlug=useSyncExternalStore(subscribeLocation,readTheme,()=> 'royal-gold');
 const [chosen,setChosen]=useState<string|null>(null),[dismissed,setDismissed]=useState(false);const dialog=useRef<HTMLDialogElement>(null);
 const active=rouletteThemeBySlug(chosen??(autoOpen&&!dismissed?previewSlug:''));
 const close=()=>{setChosen(null);setDismissed(true)};
 useEffect(()=>{if(!active)return;const previous=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';if(!dialog.current?.open)dialog.current?.showModal();return()=>{document.documentElement.style.overflow=previous}},[active]);
 return <section className="space-y-8" aria-label="Taller de ruletas"><section aria-labelledby="volt-foundry-heading" className="space-y-4">
   <header>
    <h2 id="volt-foundry-heading" className="text-2xl font-bold text-white">{voltFoundry.name}</h2>
    <p className="mt-1 text-sm text-zinc-400">{voltFoundryRouletteThemes.length} ruletas con multiplicadores</p>
   </header>
   <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
    {voltFoundryRouletteThemes.map(theme => (
     <article key={theme.slug} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/15" style={{ background: theme.surface }}>
      <img src={theme.cover} alt={`Portada de ${theme.name}`} width={800} height={1000} loading="lazy" className="h-auto w-full"/>
      <div className="flex flex-1 flex-col p-3">
       <h3 className="text-sm font-bold" style={{ color: theme.secondary }}>{theme.name}</h3>
       <p className="mb-3 mt-1 flex-1 text-xs leading-5 text-zinc-300">{theme.description}</p>
       <button type="button" onClick={()=>setChosen(theme.slug)} aria-label={`Jugar ${theme.name}`}
         className="min-h-11 rounded-xl border px-2 py-2 text-xs font-bold"
         style={{ borderColor: theme.accent, color: theme.secondary, background: theme.felt }}>
        Jugar demo
       </button>
      </div>
     </article>
    ))}
   </div>
  </section><header><p className="text-[10px] uppercase tracking-[0.2em] text-amber-200">Reel Crown · Ruletas</p><h2 className="mt-2 text-2xl font-bold">{rouletteThemes.length} temas · {ROULETTE_LAYOUTS.length} distribuciones</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Un motor europeo con cuatro estilos de mesa. Cada distribución reúne diez temáticas con su propio ambiente y paleta.</p></header>{ROULETTE_LAYOUTS.map(layout=>{const themes=rouletteThemes.filter(theme=>theme.layout===layout.id);return <section key={layout.id} className="space-y-3" aria-labelledby={`roulette-layout-${layout.id}`}><header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 pb-2"><div><h3 id={`roulette-layout-${layout.id}`} className="text-lg font-semibold text-white">{layout.name}</h3><p className="text-xs text-zinc-400">{layout.description}</p></div><span className="text-xs text-zinc-500">{themes.length} temas</span></header><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{themes.map(theme=><article key={theme.slug} className="overflow-hidden rounded-2xl border border-white/15 bg-[#10131b]"><img src={theme.cover} alt={`Portada de ${theme.name}`} loading="lazy" width={theme.coverFormat === "portrait" ? 800 : 1200} height={theme.coverFormat === "portrait" ? 1000 : 800} className="h-auto w-full"/><div className="p-4"><p className="text-[10px] uppercase tracking-wider" style={{color:theme.secondary}}>{theme.name} · europea</p><p className="mt-2 min-h-10 text-xs leading-5 text-zinc-400">{theme.description}</p><button type="button" onClick={()=>setChosen(theme.slug)} className="mt-3 min-h-11 w-full rounded-xl border px-4 py-2 text-xs font-bold" style={{borderColor:theme.accent,color:theme.secondary,background:theme.surface}}>Jugar {theme.name}</button></div></article>)}</div></section>})}{active&&<dialog ref={dialog} aria-label={`${active.name} · demo jugable`} onCancel={e=>{if(e.target!==e.currentTarget)return;e.preventDefault();close()}} className="rg-demo-dialog fixed inset-0 m-auto h-dvh max-h-dvh w-screen max-w-[480px] overflow-y-auto border border-white/15 bg-[#071015] p-0 text-white shadow-2xl backdrop:bg-black/90"><RoulettePlayer key={active.slug} theme={active} onExit={close}/></dialog>}</section>;
}
