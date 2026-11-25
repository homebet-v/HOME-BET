import type { SlotGame } from "./slot-catalog";

/** Same visual theme, independent edition and session/settings identifiers. */
function createEdition(game: SlotGame, edition: "II" | "III"): SlotGame {
  if (game.engine && game.engine !== "3x3") throw new Error("La edición debe partir de un juego 3×3.");
  const third = edition === "III";
  return {
    ...game,
    slug: `${game.slug}-${third ? "iii" : "ii"}`,
    name: `${game.name} ${edition}`,
    themeSlug: game.themeSlug ?? game.slug,
    engine: third ? "5x5" : "5x3",
    version: third ? "3.0.0-demo" : "2.0.0-demo",
    tagline: `${game.tagline} · Edición ${edition}: ${third ? "5×5 y 50" : "5×3 y 25"} líneas fijas.`,
  };
}
export function createSlotEditionII(game: SlotGame): SlotGame { return createEdition(game, "II"); }
export function createSlotEditionIII(game: SlotGame): SlotGame { return createEdition(game, "III"); }
