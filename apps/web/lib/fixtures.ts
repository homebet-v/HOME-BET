import { slotGames, slotPlayableGames } from "@homebet/proveedores/catalog";
import { rouletteThemes, voltFoundry, voltFoundryRouletteThemes } from "@homebet/proveedores/roulette-catalog";

export type HouseStatus = "active" | "suspended";
export type GameStatus = "published" | "retired";

export type House = {
  slug: string;
  name: string;
  status: HouseStatus;
};

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
  artwork?: { symbol: string; color: string; background: string };
};

export type HousePlayer = {
  houseSlug: string;
  name: string;
  balanceCents: number;
};

/** Stand-in for public.casinos until Supabase is connected. */
export const houses: readonly House[] = [
  { slug: "krakenbet", name: "Krakenbet", status: "active" },
  { slug: "kairobet", name: "Kairobet", status: "active" },
  { slug: "novabet", name: "Nova Bet", status: "active" },
  { slug: "royalbet", name: "Royal Bet", status: "active" },
  { slug: "imperialbet", name: "Imperial Bet", status: "active" },
  { slug: "diamondbet", name: "Diamond Bet", status: "active" },
  { slug: "jackpotbet", name: "Jackpot Bet", status: "active" },
  { slug: "casinopalace", name: "Casino Palace", status: "active" },
  { slug: "clubbet", name: "Club Bet", status: "active" },
  { slug: "goldenbet", name: "Golden Bet", status: "active" },
  { slug: "vegasclub", name: "Vegas Club", status: "active" },
  { slug: "pokerhouse", name: "Poker House", status: "active" },
  { slug: "casinocentral", name: "Casino Central", status: "active" },
  { slug: "luckyseven", name: "Lucky Seven", status: "active" },
  { slug: "casinolux", name: "Casino Lux", status: "active" },
];

/** Stand-in for published rows in public.games. Drafts live in @homebet/proveedores. */
export const catalog: readonly CatalogGame[] = [
  ...slotPlayableGames.map((game): CatalogGame => ({ providerSlug: game.providerSlug, slug: game.slug, name: game.name, category: "slots", coverImage: game.cover, artStyle: game.artStyle, fanArt: game.fanArt, status: "published", version: game.version, runtime: game.engine === "5x5" ? "slot-5x5" : game.engine === "5x3" ? "slot-5x3" : "slot-3x3" })),
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

/** Stand-in for public.casino_games. Values are catalog slugs enabled for that house. */
export const enabledGames: Readonly<Record<string, readonly string[]>> = {
  krakenbet: catalog.map((game) => game.slug),
  kairobet: catalog.map((game) => game.slug),
  novabet: catalog.map((game) => game.slug),
  royalbet: catalog.map((game) => game.slug),
  imperialbet: catalog.map((game) => game.slug),
  diamondbet: catalog.map((game) => game.slug),
  jackpotbet: catalog.map((game) => game.slug),
  casinopalace: catalog.map((game) => game.slug),
  clubbet: catalog.map((game) => game.slug),
  goldenbet: catalog.map((game) => game.slug),
  vegasclub: catalog.map((game) => game.slug),
  pokerhouse: catalog.map((game) => game.slug),
  casinocentral: catalog.map((game) => game.slug),
  luckyseven: catalog.map((game) => game.slug),
  casinolux: catalog.map((game) => game.slug),
};

/** Stand-in for players and a balance derived from the ledger. */
export const players: readonly HousePlayer[] = [
  { houseSlug: "krakenbet", name: "Ana Pérez", balanceCents: 125000 },
  { houseSlug: "krakenbet", name: "Luis Gómez", balanceCents: 48000 },
  { houseSlug: "kairobet", name: "María Díaz", balanceCents: 9200 },
];

export function houseBySlug(slug: string): House | undefined {
  return houses.find((house) => house.slug === slug);
}

export function playersForHouse(slug: string): readonly HousePlayer[] {
  return players.filter((player) => player.houseSlug === slug);
}

export function gameEnabled(houseSlug: string, gameSlug: string): boolean {
  return (enabledGames[houseSlug] ?? []).includes(gameSlug);
}

export function enabledCatalog(houseSlug: string): readonly CatalogGame[] {
  return catalog.filter(
    (game) => game.status === "published" && gameEnabled(houseSlug, game.slug),
  );
}

export const providers = [
  { ...voltFoundry, logoImage: "/images/providers/volt-foundry-logo.webp", iconImage: "/images/providers/volt-foundry-icon.webp", initials: "VF", description: "Ruletas europeas con números multiplicados, carcasas facetadas y ejes de cristal.", color: "#a689ff" },
  { slug: "lumen", logoImage: "/images/slots/provider-logo.webp", iconImage: "/images/slots/provider-icon.webp", name: "Lumen Studio", initials: "LS", description: `${slotGames.length} temáticas y ${slotPlayableGames.length} ediciones. Motores 3×3, 5×3 y 5×5 con bonos y giros gratis.`, color: "#fbbf24" },
  { slug: "atlas", logoImage: "/images/providers/atlas-logo.png", iconImage: "/images/providers/atlas-icon.png", name: "Atlas Games", initials: "AG", description: "Juegos de mesa y clásicos de casino.", color: "#38bdf8" },
  { slug: "aurora", logoImage: "/images/providers/aurora-logo.png", iconImage: "/images/providers/aurora-icon.png", name: "Aurora Studios", initials: "AS", description: "Slots y experiencias de temática original.", color: "#c084fc" },
] as const;

// Historial ilustrativo: no representa operaciones reales.
export const chipMovements = [
  { id: "MOV-001", date: "2026-11-10", kind: "Emisión", houseSlug: null, amount: 1000000 },
  { id: "MOV-002", date: "2026-11-11", kind: "Distribución", houseSlug: "krakenbet", amount: 200000 },
  { id: "MOV-003", date: "2026-11-12", kind: "Distribución", houseSlug: "kairobet", amount: 150000 },
] as const;

// Solicitudes ficticias para revisar el flujo; no contienen documentos reales.
export const registrationFixtures: readonly import("./verification").Registration[] = houses.flatMap((house) => ([
  { status: "pending" as const, firstName: "Ana", lastName: "Ejemplo", ci: "8000001", reason: "" },
  { status: "denied" as const, firstName: "Luis", lastName: "Demostración", ci: "8000002", reason: "El reverso está borroso. Volvé a fotografiarlo con buena luz." },
  { status: "rejected" as const, firstName: "María", lastName: "Muestra", ci: "8000003", reason: "La identidad no corresponde al titular de la cuenta." },
]).map((sample) => ({ id: `${house.slug}-${sample.ci}`, casinoId: house.slug, ci: sample.ci, details: { firstName: sample.firstName, lastName: sample.lastName, phone: "+595 981 000000", email: "persona@example.com", birthDate: "1995-06-15" }, photos: { front: "/images/verification/front.svg", back: "/images/verification/back.svg", selfie: "/images/verification/selfie.svg" }, status: sample.status, reason: sample.reason, createdAt: "2026-11-14T11:45:00.000Z", submittedAt: "2026-11-14T12:00:00.000Z" })));


// Movimientos ficticios de la ficha administrativa; los saldos se derivan de ellos.
export const registrationWalletFixtures: Readonly<Record<string, readonly import("./wallet").WalletMovement[]>> = Object.fromEntries(
  registrationFixtures.map((row, index) => [row.id, index % 3 === 0 ? [
    { id: `${row.id}-deposit`, type: "deposit", amountCents: 1000000 },
    { id: `${row.id}-stake`, type: "stake", amountCents: 100000 },
    { id: `${row.id}-prize`, type: "prize", amountCents: 150000 },
    { id: `${row.id}-withdrawal`, type: "withdrawal", amountCents: 50000 },
  ] : []]),
);

// Dos páginas de 20 cargas por casa: 24 pendientes, 8 aceptadas y 8 rechazadas.
// El bono seleccionado queda asociado a la solicitud; no se modifica al revisarla.
export const depositRequestFixtures: readonly import("./deposits").DepositRequest[] = houses.flatMap((house) => Array.from({ length: 40 }, (_, index) => {
  const variant = index % 3;
  const value = [15000, 8000, 10000][variant];
  const status = index % 10 < 2 ? "rejected" as const : index % 10 < 4 ? "accepted" as const : "pending" as const;
  const created = Date.UTC(2026, 10, 14, 12, index);
  return {
    id: `${house.slug}-load-${1001 + index}`, casinoId: house.slug, playerId: `${house.slug}-${8000001 + variant}`, requestedCents: value * 100,
    receiptUrl: `/images/deposits/receipt-${variant + 1}.svg`, createdAt: new Date(created).toISOString(), status,
    claimedBy: status === "pending" ? null : "Cajero de muestra", confirmedCents: status === "accepted" ? value * 100 : null,
    bonusCents: status === "accepted" && variant !== 1 ? 200000 : 0,
    reviewedAt: status === "pending" ? null : new Date(created + 5 * 60 * 1000).toISOString(),
    reason: status === "rejected" ? index % 2 === 0 ? "El importe del comprobante no coincide con el solicitado." : "El comprobante no es legible. Enviá una foto más clara." : "",
    bonus: variant === 1 ? null : { id: `${house.slug}-bonus-2000`, casinoId: house.slug, name: "2.000 extra desde 10.000", kind: "fixed" as const, amount: 200000, minimumCents: 1000000, maximumCents: null, capCents: 200000, startsAt: "2026-11-01T00:00:00.000Z", endsAt: "2026-12-01T00:00:00.000Z" },
  };
}));
