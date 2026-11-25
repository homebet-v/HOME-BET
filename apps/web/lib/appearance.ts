export const palettes = {
  royalbet: { label: "Royal Bet", accent: "#e8bd65", ink: "#08162e" },
  imperialbet: { label: "Imperial Bet", accent: "#e6c58b", ink: "#151310" },
  diamondbet: { label: "Diamond Bet", accent: "#67e8f9", ink: "#071b2a" },
  jackpotbet: { label: "Jackpot Bet", accent: "#fbbf24", ink: "#250a10" },
  casinopalace: { label: "Casino Palace", accent: "#e7bd8a", ink: "#240e1b" },
  clubbet: { label: "Club Bet", accent: "#6ee7b7", ink: "#081e19" },
  goldenbet: { label: "Golden Bet", accent: "#fbbf24", ink: "#191309" },
  vegasclub: { label: "Vegas Club", accent: "#f472b6", ink: "#100e26" },
  pokerhouse: { label: "Poker House", accent: "#dba573", ink: "#141c17" },
  casinocentral: { label: "Casino Central", accent: "#fb7185", ink: "#0c162a" },
  luckyseven: { label: "Lucky Seven", accent: "#facc15", ink: "#092019" },
  casinolux: { label: "Casino Lux", accent: "#c4b5fd", ink: "#130e25" },
  kairo: { label: "Kairo", accent: "#e8bd65", ink: "#09162e" },
  nova: { label: "Nova", accent: "#a78bfa", ink: "#100c25" },
  kraken: { label: "Kraken", accent: "#2dd4bf", ink: "#061520" },
  ocean: { label: "Océano", accent: "#38bdf8", ink: "#071521" },
  emerald: { label: "Esmeralda", accent: "#34d399", ink: "#081c18" },
  violet: { label: "Violeta", accent: "#c4b5fd", ink: "#191329" },
  gold: { label: "Dorado", accent: "#fbbf24", ink: "#201b0c" },
} as const;
export type Banner = { id: string; image: string; alt: string; video?: string };
export type Appearance = {
  backgroundImage?: string;
  backgroundOverlay?: number;
  logoImage?: string;
  iconImage?: string;
  background: string;
  rounded: boolean;
  showWelcome: boolean;
  banners: Banner[];
  brand: string;
  title: string;
  description: string;
  palette: keyof typeof palettes;
  layout: "spotlight" | "compact";
  emblem: "diamond" | "star" | "circle";
  showProviders: boolean;
};
const casinoThemes: Record<string, { slug: string; palette: keyof typeof palettes; emblem: Appearance["emblem"] }> = {
  "royal bet": { slug: "royalbet", palette: "royalbet", emblem: "diamond" },
  "imperial bet": { slug: "imperialbet", palette: "imperialbet", emblem: "diamond" },
  "diamond bet": { slug: "diamondbet", palette: "diamondbet", emblem: "diamond" },
  "jackpot bet": { slug: "jackpotbet", palette: "jackpotbet", emblem: "star" },
  "casino palace": { slug: "casinopalace", palette: "casinopalace", emblem: "diamond" },
  "club bet": { slug: "clubbet", palette: "clubbet", emblem: "circle" },
  "golden bet": { slug: "goldenbet", palette: "goldenbet", emblem: "circle" },
  "vegas club": { slug: "vegasclub", palette: "vegasclub", emblem: "star" },
  "poker house": { slug: "pokerhouse", palette: "pokerhouse", emblem: "diamond" },
  "casino central": { slug: "casinocentral", palette: "casinocentral", emblem: "circle" },
  "lucky seven": { slug: "luckyseven", palette: "luckyseven", emblem: "star" },
  "casino lux": { slug: "casinolux", palette: "casinolux", emblem: "diamond" },
};
export function defaultAppearance(name: string): Appearance {
  const theme = casinoThemes[name.toLowerCase()];
  if (theme) return {
    backgroundImage: `/images/${theme.slug}/background.png`, backgroundOverlay: 15,
    logoImage: `/images/${theme.slug}/logo.png`, iconImage: `/images/${theme.slug}/icon.png`,
    background: palettes[theme.palette].ink, rounded: true, showWelcome: false,
    banners: [{ id: `${theme.slug}-main`, image: `/images/${theme.slug}/banner.png`, video: `/images/${theme.slug}/banner.mp4`, alt: `Banner de ${name}` }],
    brand: name.toUpperCase(), title: `Bienvenido a ${name}`, description: "Descubrí los juegos de nuestra casa.",
    palette: theme.palette, layout: "compact", emblem: theme.emblem, showProviders: true,
  };

  if (name.toLowerCase() === "krakenbet") return { backgroundImage: "/images/krakenbet/background.png", backgroundOverlay: 45, logoImage: "/images/krakenbet/logo.png", iconImage: "/images/krakenbet/icon.png", background: "#061520", rounded: true, showWelcome: false, banners: [{ id: "kraken-main", image: "/images/krakenbet/banner.png", video: "/images/krakenbet/banner.mp4", alt: "Krakenbet: el poder del océano, un kraken turquesa junto a una ruleta dorada" }], brand: "KRAKENBET", title: "El poder del océano", description: "Explorá nuestra selección de juegos. Una casa con identidad propia.", palette: "kraken", layout: "compact", emblem: "circle", showProviders: true };
  if (name.toLowerCase() === "kairobet") return { backgroundImage: "/images/kairobet/background.png", backgroundOverlay: 10, logoImage: "/images/kairobet/logo.png", iconImage: "/images/kairobet/icon.png", background: "#09162e", rounded: true, showWelcome: false, banners: [{ id: "kairo-main", image: "/images/kairobet/banner.png", video: "/images/kairobet/banner.mp4", alt: "Kairobet, una experiencia legendaria: halcón dorado y templos egipcios" }], brand: "KAIROBET", title: "Una experiencia legendaria", description: "Descubrí una selección de juegos con identidad propia.", palette: "kairo", layout: "compact", emblem: "diamond", showProviders: true };
  if (name.toLowerCase() === "nova bet") return { backgroundImage: "/images/novabet/background.png", backgroundOverlay: 45, logoImage: "/images/novabet/logo.png", iconImage: "/images/novabet/icon.png", background: "#100c25", rounded: true, showWelcome: false, banners: [{ id: "nova-main", image: "/images/novabet/banner.png", video: "/images/novabet/banner.mp4", alt: "Nova Bet, otra dimensión de juego: una supernova violeta y órbitas luminosas" }], brand: "NOVA BET", title: "Otra dimensión de juego", description: "Explorá un universo de juegos desde tu casa.", palette: "nova", layout: "compact", emblem: "star", showProviders: true };
  return { background: "#071521", rounded: true, showWelcome: true, banners: [], brand: name, title: "Tu próxima jugada empieza acá", description: "Descubrí los juegos de nuestra casa y encontrá tu favorito.", palette: "ocean", layout: "spotlight", emblem: "diamond", showProviders: true };
}
