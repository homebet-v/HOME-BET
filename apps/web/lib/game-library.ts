import { slotGames, slotPlayableGames } from "@homebet/proveedores/catalog";
import { rouletteThemes, voltFoundry, voltFoundryRouletteThemes } from "@homebet/proveedores/roulette-catalog";

export type GameStatus = "published" | "retired";

export type CatalogGame = {
  providerSlug: string;
  slug: string;
  name: string;
  status: GameStatus;
  version: string;
  coverImage?: string;
  coverFormat?: "portrait";
  artStyle?: "jewel" | "pixel" | "comic" | "neon";
  fanArt?: boolean;
  category?: "slots" | "roulette" | "cards" | "instant";
  runtime?: "slot-3x3" | "slot-5x3" | "slot-5x5" | "roulette-european";
  edition?: "II" | "III";
  artwork?: { symbol: string; color: string; background: string };
};

export const catalog: readonly CatalogGame[] = [
  ...slotPlayableGames.map((game): CatalogGame => ({ providerSlug: game.providerSlug, slug: game.slug, name: game.name, category: "slots", coverImage: game.cover, artStyle: game.artStyle, fanArt: game.fanArt, edition: game.slug.endsWith("-ii") ? "II" : game.slug.endsWith("-iii") ? "III" : undefined, status: "published", version: game.version, runtime: game.engine === "5x5" ? "slot-5x5" : game.engine === "5x3" ? "slot-5x3" : "slot-3x3" })),
  ...[...voltFoundryRouletteThemes, ...rouletteThemes].map((theme): CatalogGame => ({
    providerSlug: theme.variant === "prism" ? voltFoundry.slug : "lumen",
    slug: theme.slug,
    name: theme.name,
    category: "roulette",
    coverImage: theme.cover,
    coverFormat: theme.coverFormat,
    status: "published",
    version: "1.0.0",
    runtime: "roulette-european",
  })),
  { providerSlug: "atlas", slug: "ruleta", coverImage: "/images/krakenbet/ruleta.png", name: "Ruleta", category: "roulette", status: "published", version: "1.0.0" },
  { providerSlug: "aurora", slug: "slots-oro", coverImage: "/images/krakenbet/slots-oro.png", name: "Slots Oro", category: "slots", status: "published", version: "1.2.0" },
  { providerSlug: "atlas", slug: "frutas-777", name: "Frutas 777", category: "slots", coverImage: "/images/games/frutas-777.png", artwork: { symbol: "🍒", color: "#fbbf24", background: "#64211f" }, status: "published", version: "1.0.0" },
  { providerSlug: "aurora", slug: "templo-del-sol", name: "Templo del Sol", category: "slots", coverImage: "/images/games/templo-del-sol.png", artwork: { symbol: "☀", color: "#fcd34d", background: "#703813" }, status: "published", version: "1.0.0" },
  { providerSlug: "atlas", slug: "reina-del-nilo", name: "Reina del Nilo", category: "slots", coverImage: "/images/games/reina-del-nilo.png", artwork: { symbol: "𓂀", color: "#facc15", background: "#153c50" }, status: "published", version: "1.0.0" },
  { providerSlug: "aurora", slug: "dragon-jade", name: "Dragón de Jade", category: "slots", coverImage: "/images/games/dragon-jade.png", artwork: { symbol: "龍", color: "#86efac", background: "#16452e" }, status: "published", version: "1.0.0" },
  { providerSlug: "atlas", slug: "olympus", name: "Olympus", category: "slots", coverImage: "/images/games/olympus.png", artwork: { symbol: "ϟ", color: "#e9d5ff", background: "#49307a" }, status: "published", version: "1.0.0" },
  { providerSlug: "aurora", slug: "neon-city", name: "Neon City", category: "slots", coverImage: "/images/games/neon-city.png", artwork: { symbol: "◈", color: "#f0abfc", background: "#511750" }, status: "published", version: "1.0.0" },
  { providerSlug: "atlas", slug: "cosmic-spin", name: "Cosmic Spin", category: "slots", coverImage: "/images/games/cosmic-spin.png", artwork: { symbol: "✦", color: "#a5b4fc", background: "#23255c" }, status: "published", version: "1.0.0" },
  { providerSlug: "aurora", slug: "diamantes", name: "Diamantes", category: "slots", coverImage: "/images/games/diamantes.png", artwork: { symbol: "◆", color: "#67e8f9", background: "#124459" }, status: "published", version: "1.0.0" },
  { providerSlug: "atlas", slug: "buffalo", name: "Buffalo Wild", category: "slots", coverImage: "/images/games/buffalo.png", artwork: { symbol: "♉", color: "#fdba74", background: "#69361c" }, status: "published", version: "1.0.0" },
  { providerSlug: "aurora", slug: "lucky-clover", name: "Lucky Clover", category: "slots", coverImage: "/images/games/lucky-clover.png", artwork: { symbol: "☘", color: "#bef264", background: "#285329" }, status: "published", version: "1.0.0" },
  { providerSlug: "atlas", slug: "candy-pop", name: "Candy Pop", category: "slots", coverImage: "/images/games/candy-pop.png", artwork: { symbol: "🍬", color: "#fbcfe8", background: "#782e60" }, status: "published", version: "1.0.0" },
  { providerSlug: "aurora", slug: "western-gold", name: "Western Gold", category: "slots", coverImage: "/images/games/western-gold.png", artwork: { symbol: "★", color: "#fde68a", background: "#654227" }, status: "published", version: "1.0.0" },
  { providerSlug: "atlas", slug: "blackjack", name: "Blackjack 21", category: "cards", coverImage: "/images/games/blackjack.png", artwork: { symbol: "♠", color: "#e2e8f0", background: "#173d35" }, status: "published", version: "1.0.0" },
  { providerSlug: "aurora", slug: "poker-club", name: "Poker Club", category: "cards", coverImage: "/images/games/poker-club.png", artwork: { symbol: "♥", color: "#fda4af", background: "#571c36" }, status: "published", version: "1.0.0" },
  { providerSlug: "atlas", slug: "baccarat", name: "Baccarat Royal", category: "cards", coverImage: "/images/games/baccarat.png", artwork: { symbol: "♣", color: "#fcd34d", background: "#31264e" }, status: "published", version: "1.0.0" },
  { providerSlug: "aurora", slug: "ruleta-europea", name: "Ruleta Europea", category: "roulette", coverImage: "/images/games/ruleta-europea.png", artwork: { symbol: "◎", color: "#fca5a5", background: "#4a2325" }, status: "published", version: "1.0.0" },
  { providerSlug: "atlas", slug: "rocket", name: "Rocket Rush", category: "instant", coverImage: "/images/games/rocket.png", artwork: { symbol: "↗", color: "#fdba74", background: "#293e72" }, status: "published", version: "1.0.0" },
  { providerSlug: "aurora", slug: "minas", name: "Minas de Cristal", category: "instant", coverImage: "/images/games/minas.png", artwork: { symbol: "⬡", color: "#c4b5fd", background: "#433063" }, status: "published", version: "1.0.0" },
];

export const providers = [
  { ...voltFoundry, logoImage: "/images/providers/volt-foundry-logo.webp", iconImage: "/images/providers/volt-foundry-brand-icon.svg", initials: "VF", description: "Ruletas europeas con números multiplicados, carcasas facetadas y ejes de cristal.", color: "#a689ff" },
  { slug: "lumen", logoImage: "/images/providers/reel-crown-logo.svg", iconImage: "/images/providers/reel-crown-brand-icon.svg", name: "Reel Crown", initials: "RC", description: `${slotGames.length} temáticas y ${slotPlayableGames.length} ediciones. Motores 3×3, 5×3 y 5×5 con bonos y giros gratis.`, color: "#fbbf24" },
  { slug: "atlas", logoImage: "/images/providers/atlas-logo.png", iconImage: "/images/providers/atlas-brand-icon.svg", name: "Atlas Games", initials: "AG", description: "Juegos de mesa y clásicos de casino.", color: "#38bdf8" },
  { slug: "aurora", logoImage: "/images/providers/aurora-logo.png", iconImage: "/images/providers/aurora-brand-icon.svg", name: "Aurora Studios", initials: "AS", description: "Slots y experiencias de temática original.", color: "#c084fc" },
] as const;
