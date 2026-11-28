"use client";

import { useState } from "react";
import { useInfiniteCarousel } from "@/components/use-infinite-carousel";
import { GameEntry } from "@/components/game-entry";
import { NavIcon } from "@/components/nav-icon";
import { providers, type CatalogGame } from "@/lib/game-library";

const categoryNames = { slots: "Slots", roulette: "Ruleta", cards: "Cartas", instant: "Instantáneos" };
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function FilterRibbon({ label, options, value, onChange }: { label: string; options: string[][]; value: string; onChange: (value: string) => void }) {
  const carousel = useInfiniteCarousel();

  return <div {...carousel} role="group" aria-label={label}
    className="catalog-ribbon cursor-grab overflow-x-auto rounded-xl border border-white/10 bg-black/80 p-3 shadow-inner select-none active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    <div className="catalog-ribbon-track">
      {[0, 1].map((copy) => <div key={copy} aria-hidden={copy === 1 ? true : undefined} className="flex flex-1 items-center gap-2 pr-2">
        {options.map(([id, name]) => <button key={id} type="button" tabIndex={copy === 1 ? -1 : 0} aria-pressed={value === id} onClick={() => onChange(id)} className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border bg-black px-4 py-2 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${value === id ? "border-[var(--casino-accent,#facc15)] text-[color:var(--casino-accent,#facc15)]" : "border-white/20 text-zinc-300 hover:border-white/50"}`}>{label === "Proveedor" && id && providers.find((item) => item.slug === id)?.iconImage ? <img src={providers.find((item) => item.slug === id)!.iconImage} alt="" draggable={false} className="size-6 shrink-0 object-contain" /> : <NavIcon href={label === "Proveedor" ? "/proveedores" : id ? `/category/${id}` : "/casino-juegos"} className="!size-5" />}<span>{name}</span></button>)}
      </div>)}
    </div>
  </div>;
}

export function GameCatalog({ games }: { games: readonly CatalogGame[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [provider, setProvider] = useState("");
  const [activeCover, setActiveCover] = useState<string | null>(null);
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  const filtered = games.filter((game) => {
    const providerName = providers.find((item) => item.slug === game.providerSlug)?.name ?? game.providerSlug;
    const searchable = normalize(`${game.name} ${game.category ? categoryNames[game.category] : ""} ${providerName}`);
    return (!category || game.category === category) && (!provider || game.providerSlug === provider) && terms.every((term) => searchable.includes(term));
  });
  const controlClass = "w-full rounded-lg border border-white/20 bg-black px-3 py-2.5 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return <section className="space-y-5" aria-label="Catálogo de juegos">
    <div className="grid gap-3">
      <label className="space-y-2 text-xs text-zinc-300"><span className="block">Buscar juegos</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nombre, categoría o proveedor" className={controlClass} /></label>

    </div>
    <div className="min-w-0 space-y-3">
      <p className="text-center text-lg font-bold sm:text-xl"><span className="catalog-filter-title">Proveedores</span></p>
      <FilterRibbon label="Proveedor" value={provider} onChange={setProvider} options={Array.from(new Set(games.map((game) => game.providerSlug))).map((slug) => [slug, providers.find((item) => item.slug === slug)?.name ?? slug])} />
      <p className="text-center text-lg font-bold sm:text-xl"><span className="catalog-filter-title">Categorías</span></p>
      <FilterRibbon label="Categoría" value={category} onChange={setCategory} options={[["", "Todos"], ...Object.entries(categoryNames).filter(([id]) => games.some((game) => game.category === id))]} />
    </div>
    <div className="flex items-center justify-between gap-3"><p role="status" className="text-xs text-zinc-400">{filtered.length} de {games.length} juegos</p>{(query || category || provider) && <button type="button" onClick={() => { setQuery(""); setCategory(""); setProvider(""); }} className="text-xs text-white underline underline-offset-4">Limpiar filtros</button>}</div>
    {filtered.length === 0 ? <p className="py-8 text-center text-sm text-zinc-400">No encontramos juegos con esos filtros.</p> : <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {filtered.map((game) => <li key={game.slug} className="kairo-catalog-game-card relative overflow-hidden rounded-xl border border-violet-500/40 bg-[#1b1026]">
        {game.coverImage && <div className={`relative ${game.runtime && game.coverFormat !== "portrait" ? "aspect-[3/2]" : "aspect-[4/5]"} overflow-hidden`}>
          <img src={game.coverImage} style={{ imageRendering: game.artStyle === "pixel" ? "pixelated" : "auto" }} alt={`Portada de ${game.name}`} loading="lazy" className={`h-full w-full object-contain ${game.edition ? `edition-cover edition-cover-${game.edition.toLowerCase()}` : ""}`} />
          {game.edition && <span className={`edition-cover-badge edition-cover-badge-${game.edition.toLowerCase()}`}>Edición {game.edition}</span>}
          {(() => {
            const studio = providers.find((item) => item.slug === game.providerSlug);
            return studio && <img src={studio.iconImage} alt={studio.name} title={studio.name} className="pointer-events-none absolute top-1 left-1 z-10 size-6 object-contain drop-shadow-[0_1px_2px_#000]" loading="lazy" />;
          })()}
          <GameEntry name={game.name} slug={game.slug} runtime={game.runtime} cover={{
            revealed: activeCover === game.slug,
            onToggle: () => setActiveCover((current) => current === game.slug ? null : game.slug ?? null),
          }} />
        </div>}
        <h2 className="sr-only">{game.name}</h2>
      </li>)}
    </ul>}
  </section>;
}
