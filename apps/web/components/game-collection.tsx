"use client";

import { GameEntry } from "@/components/game-entry";
import { useState } from "react";
import type { CatalogGame } from "@/lib/game-library";
import { providers } from "@/lib/game-library";

const categories = [{ id: "all", label: "Todos" }, { id: "slots", label: "Slots" }, { id: "roulette", label: "Ruleta" }, { id: "cards", label: "Cartas" }, { id: "instant", label: "Instantáneos" }];
export function GameCollection({ games, accent, rounded, showProviders, highlightBorder, playOnCover = false }: { games: readonly CatalogGame[]; accent: string; rounded: boolean; showProviders: boolean; highlightBorder?: string; playOnCover?: boolean }) {
  const borderStyle = highlightBorder ? { border: `1px solid ${highlightBorder}` } : undefined;
  const headingStyle = highlightBorder ? {
    borderInlineStart: "2px solid var(--kairo-violet, #961aff)",
    paddingInlineStart: ".55rem",
  } : undefined;
  const [category, setCategory] = useState("all");
  const [activeCover, setActiveCover] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const filtered = games.filter((game) => category === "all" || game.category === category);
  const favoriteGames = games.filter((game) => favorites.includes(game.slug));
  const featured = games.filter((_, index) => index % 2 === 0).slice(0, 10);
  function tile(game: CatalogGame, section: string) {
    const coverId = `${section}:${game.slug}`;
    const provider = providers.find((item) => item.slug === game.providerSlug);
    const favorite = favorites.includes(game.slug);
    return <article key={game.slug} className={`house-game-tile group relative min-w-0 overflow-hidden border border-white/10 bg-white/[0.04] ${rounded ? "rounded-xl" : ""}`} style={borderStyle}>
      <div className={game.runtime && game.coverFormat !== "portrait" ? "relative aspect-[3/2] overflow-hidden" : "relative aspect-[4/5] overflow-hidden"}>{game.coverImage ? <img src={game.coverImage} style={{ imageRendering: game.artStyle === "pixel" ? "pixelated" : "auto" }} alt={`Portada de ${game.name}`} draggable={false} className={`h-full w-full object-contain transition duration-300 group-hover:brightness-110 ${game.edition ? `edition-cover edition-cover-${game.edition.toLowerCase()}` : ""}`} loading="lazy" /> : <div className="flex h-full flex-col items-center justify-center gap-3 p-3 text-center" style={{ background: `radial-gradient(ellipse at top, ${game.artwork?.color ?? accent}30, transparent 75%), linear-gradient(150deg, ${game.artwork?.background ?? "#152e42"}, #080e1b)`, color: game.artwork?.color ?? accent }}><span aria-hidden="true" className="text-5xl drop-shadow-lg">{game.artwork?.symbol ?? "✦"}</span><span className="text-base font-black leading-tight tracking-wide uppercase sm:text-lg">{game.name}</span><span className="text-[8px] tracking-[0.2em] opacity-70">PORTADA DE MUESTRA</span></div>}

      {playOnCover && <GameEntry name={game.name} slug={game.slug} runtime={game.runtime} cover={{
        revealed: activeCover === coverId,
        onToggle: () => setActiveCover((current) => current === coverId ? null : coverId),
      }} />}
      {game.edition && <span className={`edition-cover-badge edition-cover-badge-${game.edition.toLowerCase()}`}>Edición {game.edition}</span>}
      {playOnCover && showProviders && provider && <img src={provider.iconImage} alt={provider.name} title={provider.name} className="pointer-events-none absolute top-1 left-1 z-10 size-6 object-contain drop-shadow-[0_1px_2px_#000]" loading="lazy" />}
      <button type="button" aria-label={`${favorite ? "Quitar" : "Agregar"} ${game.name} ${favorite ? "de" : "a"} favoritos`} aria-pressed={favorite} onClick={() => setFavorites((current) => favorite ? current.filter((slug) => slug !== game.slug) : [...current, game.slug])} className="house-game-favorite absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-full border border-white/15 bg-slate-950/75 text-white backdrop-blur-sm hover:bg-slate-800"><svg width="17" height="17" viewBox="0 0 24 24" fill={favorite ? accent : "none"} stroke={favorite ? accent : "currentColor"} strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d="m12 3 2.8 5.7 6.3.9-4.6 4.4 1.1 6.3-5.6-3-5.6 3 1.1-6.3L3 9.6l6.2-.9L12 3Z" /></svg></button></div>
      {playOnCover ? <h4 className="sr-only">{game.name}</h4> : <div className="p-3">
        <h4 className="truncate text-xs font-semibold">{game.name}</h4>
        {showProviders && provider && <div className="mt-2 flex min-w-0 items-center gap-1.5">
          <img src={provider.iconImage} alt="" className="size-5 shrink-0 object-contain" loading="lazy" />
          <span className="truncate text-[9px] text-[color:var(--lobby-muted)]">{provider.name}</span>
        </div>}
        <GameEntry name={game.name} slug={game.slug} runtime={game.runtime} />
      </div>}
    </article>;
  }
  return <div className="house-game-collection space-y-7 p-4 sm:p-5">
    <section><div className="mb-3 flex items-center gap-2"><h3 className="text-sm font-semibold" style={headingStyle}>Tus favoritos</h3><span className="text-[10px] text-[color:var(--lobby-muted)]">{favoriteGames.length}</span></div>{favoriteGames.length ? <div className="casino-scroll flex snap-x gap-3 overflow-x-auto pb-2">{favoriteGames.map((game) => <div key={game.slug} className="w-[135px] shrink-0 snap-start sm:w-[155px]">{tile(game, "favorites")}</div>)}</div> : <p className="house-favorites-empty py-2 text-center text-xs text-[color:var(--lobby-muted)]" style={borderStyle}>Todavía no tenés juegos favoritos</p>}</section>
    {featured.length > 0 && <section><h3 className="mb-3 text-sm font-semibold" style={headingStyle}>Destacados de la casa</h3><div className="casino-scroll flex snap-x gap-3 overflow-x-auto pb-2">{featured.map((game) => <div key={game.slug} className="w-[135px] shrink-0 snap-start sm:w-[155px]">{tile(game, "featured")}</div>)}</div></section>}
    <section><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold" style={headingStyle}>Explorá los juegos</h3><span className="text-[10px] text-[color:var(--lobby-muted)]">{filtered.length} disponibles</span></div><div className="house-category-strip mb-4 flex flex-wrap gap-2" aria-label="Categorías">{categories.filter((item) => item.id === "all" || games.some((game) => game.category === item.id)).map((item) => <button type="button" key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)} className="rounded-lg border px-3 py-2 text-[11px] transition" style={{ ...(borderStyle ?? { borderColor: category === item.id ? accent : "#ffffff20" }), background: "var(--house-filter-bg, #000000)", color: category === item.id ? accent : "var(--lobby-muted)" }}>{item.label}</button>)}</div><div className="space-y-6">{categories.filter((item) => item.id !== "all" && (category === "all" || category === item.id)).map((item) => {
      const matchingGames = filtered.filter((game) => game.category === item.id);
      const categoryGames = category === "roulette" ? matchingGames : matchingGames.slice(0, 10);
      if (!categoryGames.length) return null;
      return <section key={item.id} aria-label={item.label}><div className="mb-3 flex items-center justify-between"><h4 className="text-sm font-semibold">{item.label}</h4><span className="text-[10px] text-[color:var(--lobby-muted)]">{categoryGames.length} juegos</span></div><div className="casino-scroll flex snap-x gap-3 overflow-x-auto pb-2">{categoryGames.map((game) => <div key={game.slug} className="w-[135px] shrink-0 snap-start sm:w-[155px]">{tile(game, item.id)}</div>)}</div><a href="/juegos" className="mt-3 inline-block text-xs font-semibold hover:underline" style={{ color: accent }}>Ver todos en Juegos →</a></section>;
    })}</div>{!filtered.length && <p className="py-6 text-xs text-[color:var(--lobby-muted)]">No hay juegos disponibles para esta selección.</p>}</section>
  </div>;
}
