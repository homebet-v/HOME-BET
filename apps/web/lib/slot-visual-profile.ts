import type { SlotGame, SlotTheme } from "@homebet/proveedores/catalog";

const coralSlug = "oraculo-coral";
const remasteredSlugs = new Set([coralSlug, "taller-de-cometas"]);
const identityDirectory = (slug: string) => `/images/slots/${slug}/${remasteredSlugs.has(slug) ? "remaster" : "identity-v3"}`;
const prizeBadges = new Map<string, readonly string[]>();

function badgesFor(slug: string) {
  let badges = prizeBadges.get(slug);
  if (!badges) {
    badges = slug === coralSlug
      ? ["pearl", "star", "crown"].map((name) => `${identityDirectory(slug)}/prize-${name}.webp`)
      : [1, 2, 3].map((index) => `${identityDirectory(slug)}/prize-${index}.webp`);
    prizeBadges.set(slug, badges);
  }
  return badges;
}

/** Per-game artwork only; never changes bets, probabilities or payouts. */
export function slotVisualProfile(game: Pick<SlotGame, "slug" | "accent" | "themeSlug">, theme: Pick<SlotTheme, "motif" | "secondary" | "surface">) {
  const sourceSlug = game.themeSlug ?? game.slug;
  const coral = sourceSlug === coralSlug;
  const directory = identityDirectory(sourceSlug);
  return {
    premium: true,
    accent: coral ? "#35e4ff" : game.accent,
    secondary: coral ? "#ffe4a4" : theme.secondary,
    surface: coral ? "#031b2b" : theme.surface,
    prizeBadges: badgesFor(sourceSlug),
    scene: remasteredSlugs.has(sourceSlug) ? `${directory}/scene.webp` : `/images/slots/${sourceSlug}/skin-v2/scene.webp?v=2`,
    title: `${directory}/title.webp`,
    button: `${directory}/button.webp`,
    spin: `${directory}/spin.webp`,
    chip: `${directory}/chip.webp`,
  };
}

export function slotStartupImages(game: SlotGame, visual: ReturnType<typeof slotVisualProfile>) {
  return [...new Set([
    visual.scene, game.sprite, game.banner, visual.button, visual.spin,
    visual.chip, visual.title, ...visual.prizeBadges,
  ])];
}
