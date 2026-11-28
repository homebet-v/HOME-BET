import { slotBatch02Games } from "./slot-batch-02";
import { slotBatch03Games } from "./slot-batch-03";
import { slotBatch04Games } from "./slot-batch-04";
import { createSlotEditionII, createSlotEditionIII } from "./slot-editions";

export type SlotGame = {
  artStyle?: "jewel" | "pixel" | "comic" | "neon"; fanArt?: boolean;
  engine?: "3x3" | "5x3" | "5x5"; themeSlug?: string;
  slug: string; name: string; tagline: string; accent: string; providerSlug: "lumen";
  batch: number; version: string; banner: string; cover: string; loading: string; sprite: string; icon: string;
  symbols: readonly string[];
};
export const slotGames: readonly SlotGame[] = [
  {
    "slug": "jardin-de-luces",
    "name": "Garden of Lights",
    "tagline": "Jardín nocturno de flores de cristal y colibríes luminosos",
    "accent": "#4ade80",
    "providerSlug": "lumen",
    "batch": 1,
    "version": "1.0.0-demo",
    "banner": "/images/slots/jardin-de-luces/identity-v3/cover.webp",
    "cover": "/images/slots/jardin-de-luces/identity-v3/cover-cinematic.webp",
    "loading": "/images/slots/jardin-de-luces/identity-v3/cover.webp",
    "sprite": "/images/slots/jardin-de-luces/symbols-transparent.webp",
    "icon": "/images/slots/jardin-de-luces/icon.webp",
    "symbols": [
      "Gota de rocío",
      "Fruta de cristal",
      "Mariposa azul",
      "Hoja dorada",
      "Orquídea",
      "Colibrí",
      "Estrella wild",
      "Portal de giros gratis"
    ]
  },
  {
    "slug": "puerto-ambar",
    "name": "Amber Harbor",
    "tagline": "Una travesía entre barcos aéreos y tesoros de ámbar",
    "accent": "#fbbf24",
    "providerSlug": "lumen",
    "batch": 1,
    "version": "1.0.0-demo",
    "banner": "/images/slots/puerto-ambar/identity-v3/cover.webp",
    "cover": "/images/slots/puerto-ambar/identity-v3/cover-cinematic.webp",
    "loading": "/images/slots/puerto-ambar/identity-v3/cover.webp",
    "sprite": "/images/slots/puerto-ambar/symbols-transparent.webp",
    "icon": "/images/slots/puerto-ambar/icon.webp",
    "symbols": [
      "Mapa antiguo",
      "Ancla",
      "Sombrero de capitán",
      "Brújula",
      "Cofre del tesoro",
      "Dirigible de ámbar",
      "Estrella wild",
      "Portal de giros gratis"
    ]
  },
  {
    "slug": "taller-de-cometas",
    "name": "Comet Forge",
    "tagline": "El taller donde se fabrican las estrellas fugaces",
    "accent": "#d39a57",
    "providerSlug": "lumen",
    "batch": 1,
    "version": "1.0.0-demo",
    "banner": "/images/slots/taller-de-cometas/identity-v3/cover-cinematic.webp",
    "cover": "/images/slots/taller-de-cometas/identity-v3/cover-cinematic.webp",
    "loading": "/images/slots/taller-de-cometas/identity-v3/cover-cinematic.webp",
    "sprite": "/images/slots/taller-de-cometas/remaster/symbols.webp",
    "icon": "/images/slots/taller-de-cometas/icon.webp",
    "symbols": [
      "Mapa estelar",
      "Llave",
      "Autómata",
      "Cometa embotellado",
      "Engranaje",
      "Telescopio",
      "Estrella wild",
      "Portal de giros gratis"
    ]
  },
  {
    "slug": "biblioteca-lunar",
    "name": "Moonlit Library",
    "tagline": "Libros encantados bajo la mirada de un búho lunar",
    "accent": "#c4b5fd",
    "providerSlug": "lumen",
    "batch": 1,
    "version": "1.0.0-demo",
    "banner": "/images/slots/biblioteca-lunar/identity-v3/cover.webp",
    "cover": "/images/slots/biblioteca-lunar/identity-v3/cover.webp",
    "loading": "/images/slots/biblioteca-lunar/identity-v3/cover.webp",
    "sprite": "/images/slots/biblioteca-lunar/symbols-transparent.webp",
    "icon": "/images/slots/biblioteca-lunar/icon.webp",
    "symbols": [
      "Anteojos dorados",
      "Tintero",
      "Vela plateada",
      "Pluma lunar",
      "Libro encantado",
      "Búho lunar",
      "Estrella wild",
      "Portal de giros gratis"
    ]
  },
  {
    "slug": "aurora-glacial",
    "name": "Glacial Aurora",
    "tagline": "Un zorro polar guía el camino hacia el hielo eterno",
    "accent": "#67e8f9",
    "providerSlug": "lumen",
    "batch": 1,
    "version": "1.0.0-demo",
    "banner": "/images/slots/aurora-glacial/identity-v3/cover.webp",
    "cover": "/images/slots/aurora-glacial/identity-v3/cover-cinematic.webp",
    "loading": "/images/slots/aurora-glacial/identity-v3/cover.webp",
    "sprite": "/images/slots/aurora-glacial/symbols-transparent.webp",
    "icon": "/images/slots/aurora-glacial/icon.webp",
    "symbols": [
      "Gema aurora",
      "Farol polar",
      "Rosa helada",
      "Copo de cristal",
      "Corona de hielo",
      "Zorro polar",
      "Estrella wild",
      "Portal de giros gratis"
    ]
  },
  {
    "slug": "oraculo-coral",
    "name": "Coral Oracle",
    "tagline": "Los secretos de un arrecife que predice las mareas",
    "accent": "#fb7185",
    "providerSlug": "lumen",
    "batch": 1,
    "version": "1.0.0-demo",
    "banner": "/images/slots/oraculo-coral/remaster/cover.webp",
    "cover": "/images/slots/oraculo-coral/remaster/cover.webp",
    "loading": "/images/slots/oraculo-coral/remaster/cover.webp",
    "sprite": "/images/slots/oraculo-coral/remaster/symbols.webp",
    "icon": "/images/slots/oraculo-coral/remaster/icon.webp",
    "symbols": [
      "Estrella marina",
      "Caracola",
      "Anémona",
      "Concha de perla",
      "Corona coral",
      "Caballito de mar",
      "Estrella wild",
      "Portal de giros gratis"
    ]
  },
  {
    "slug": "caravana-solar",
    "name": "Sun Caravan",
    "tagline": "Escarabajos de oro custodian la ruta del sol",
    "accent": "#fcd34d",
    "providerSlug": "lumen",
    "batch": 1,
    "version": "1.0.0-demo",
    "banner": "/images/slots/caravana-solar/identity-v3/cover.webp",
    "cover": "/images/slots/caravana-solar/identity-v3/cover.webp",
    "loading": "/images/slots/caravana-solar/identity-v3/cover.webp",
    "sprite": "/images/slots/caravana-solar/symbols-transparent.webp",
    "icon": "/images/slots/caravana-solar/icon.webp",
    "symbols": [
      "Pirámide de lapislázuli",
      "Incienso",
      "Montura real",
      "Cáliz del desierto",
      "Disco solar",
      "Escarabajo dorado",
      "Estrella wild",
      "Portal de giros gratis"
    ]
  },
  {
    "slug": "mercado-de-nubes",
    "name": "Cloud Bazaar",
    "tagline": "Un mercado suspendido donde se comercia con sueños",
    "accent": "#93c5fd",
    "providerSlug": "lumen",
    "batch": 1,
    "version": "1.0.0-demo",
    "banner": "/images/slots/mercado-de-nubes/identity-v3/cover.webp",
    "cover": "/images/slots/mercado-de-nubes/identity-v3/cover.webp",
    "loading": "/images/slots/mercado-de-nubes/identity-v3/cover.webp",
    "sprite": "/images/slots/mercado-de-nubes/symbols-transparent.webp",
    "icon": "/images/slots/mercado-de-nubes/icon.webp",
    "symbols": [
      "Brújula celeste",
      "Farol flotante",
      "Frasco de sueños",
      "Balanza dorada",
      "Tetera de nubes",
      "Globo de seda",
      "Estrella wild",
      "Portal de giros gratis"
    ]
  },
  {
    "slug": "bosque-micelio",
    "name": "Mycelium Forest",
    "tagline": "Un bosque de hongos bioluminiscentes y pequeñas maravillas",
    "accent": "#a3e635",
    "providerSlug": "lumen",
    "batch": 1,
    "version": "1.0.0-demo",
    "banner": "/images/slots/bosque-micelio/identity-v3/cover.webp",
    "cover": "/images/slots/bosque-micelio/identity-v3/cover-cinematic.webp",
    "loading": "/images/slots/bosque-micelio/identity-v3/cover.webp",
    "sprite": "/images/slots/bosque-micelio/symbols-transparent.webp",
    "icon": "/images/slots/bosque-micelio/icon.webp",
    "symbols": [
      "Farol de luciérnaga",
      "Semilla de helecho",
      "Bellota de cristal",
      "Caracol espiral",
      "Hongo luminoso",
      "Rana joya",
      "Estrella wild",
      "Portal de giros gratis"
    ]
  },
  {
    "slug": "volcan-obsidiana",
    "name": "Obsidian Volcano",
    "tagline": "El fénix de lava despierta entre cristales negros",
    "accent": "#f87171",
    "providerSlug": "lumen",
    "batch": 1,
    "version": "1.0.0-demo",
    "banner": "/images/slots/volcan-obsidiana/identity-v3/cover.webp",
    "cover": "/images/slots/volcan-obsidiana/identity-v3/cover.webp",
    "loading": "/images/slots/volcan-obsidiana/identity-v3/cover.webp",
    "sprite": "/images/slots/volcan-obsidiana/symbols-transparent.webp",
    "icon": "/images/slots/volcan-obsidiana/icon.webp",
    "symbols": [
      "Flor volcánica",
      "Garra rubí",
      "Cáliz de lava",
      "Pluma de brasa",
      "Cristal de obsidiana",
      "Fénix de lava",
      "Estrella wild",
      "Portal de giros gratis"
    ]
  },
  {
    "slug": "tren-constelaciones",
    "name": "Starlight Express",
    "tagline": "Un expreso nocturno que viaja entre galaxias",
    "accent": "#818cf8",
    "providerSlug": "lumen",
    "batch": 1,
    "version": "1.0.0-demo",
    "banner": "/images/slots/tren-constelaciones/identity-v3/cover.webp",
    "cover": "/images/slots/tren-constelaciones/identity-v3/cover-cinematic.webp",
    "loading": "/images/slots/tren-constelaciones/identity-v3/cover.webp",
    "sprite": "/images/slots/tren-constelaciones/symbols-transparent.webp",
    "icon": "/images/slots/tren-constelaciones/icon.webp",
    "symbols": [
      "Carbón de cometa",
      "Maleta galáctica",
      "Campana ferroviaria",
      "Reloj celeste",
      "Boleto estelar",
      "Locomotora cósmica",
      "Estrella wild",
      "Portal de giros gratis"
    ]
  },
  {
    "slug": "reino-origami",
    "name": "Origami Kingdom",
    "tagline": "Grullas de papel y palacios que nacen de un pliegue",
    "accent": "#f9a8d4",
    "providerSlug": "lumen",
    "batch": 1,
    "version": "1.0.0-demo",
    "banner": "/images/slots/reino-origami/identity-v3/cover.webp",
    "cover": "/images/slots/reino-origami/identity-v3/cover.webp",
    "loading": "/images/slots/reino-origami/identity-v3/cover.webp",
    "sprite": "/images/slots/reino-origami/symbols-transparent.webp",
    "icon": "/images/slots/reino-origami/icon.webp",
    "symbols": [
      "Velero plegado",
      "Zorro de papel",
      "Abanico dorado",
      "Loto plegado",
      "Dragón de origami",
      "Grulla de papel",
      "Estrella wild",
      "Portal de giros gratis"
    ]
  },
  {
    "slug": "laboratorio-nectar",
    "name": "Nectar Lab",
    "tagline": "Abejas alquimistas convierten flores en oro líquido",
    "accent": "#facc15",
    "providerSlug": "lumen",
    "batch": 1,
    "version": "1.0.0-demo",
    "banner": "/images/slots/laboratorio-nectar/identity-v3/cover.webp",
    "cover": "/images/slots/laboratorio-nectar/identity-v3/cover.webp",
    "loading": "/images/slots/laboratorio-nectar/identity-v3/cover.webp",
    "sprite": "/images/slots/laboratorio-nectar/symbols-transparent.webp",
    "icon": "/images/slots/laboratorio-nectar/icon.webp",
    "symbols": [
      "Cristal de polen",
      "Cuchara de miel",
      "Girasol",
      "Panal dorado",
      "Frasco de miel",
      "Abeja real",
      "Estrella wild",
      "Portal de giros gratis"
    ]
  },
  {
    "slug": "catedral-cristal",
    "name": "Crystal Cathedral",
    "tagline": "Un santuario mineral iluminado por gemas vivas",
    "accent": "#a78bfa",
    "providerSlug": "lumen",
    "batch": 1,
    "version": "1.0.0-demo",
    "banner": "/images/slots/catedral-cristal/identity-v3/cover.webp",
    "cover": "/images/slots/catedral-cristal/identity-v3/cover.webp",
    "loading": "/images/slots/catedral-cristal/identity-v3/cover.webp",
    "sprite": "/images/slots/catedral-cristal/symbols-transparent.webp",
    "icon": "/images/slots/catedral-cristal/icon.webp",
    "symbols": [
      "Llave zafiro",
      "Flor de cuarzo",
      "Geoda esmeralda",
      "Corona violeta",
      "Cáliz de prisma",
      "Ciervo amatista",
      "Estrella wild",
      "Portal de giros gratis"
    ]
  },
  {
    "slug": "festival-faroles",
    "name": "Lantern Festival",
    "tagline": "La noche en que los peces koi nadan entre luces",
    "accent": "#fdba74",
    "providerSlug": "lumen",
    "batch": 1,
    "version": "1.0.0-demo",
    "banner": "/images/slots/festival-faroles/identity-v3/cover.webp",
    "cover": "/images/slots/festival-faroles/identity-v3/cover.webp",
    "loading": "/images/slots/festival-faroles/identity-v3/cover.webp",
    "sprite": "/images/slots/festival-faroles/symbols-transparent.webp",
    "icon": "/images/slots/festival-faroles/icon.webp",
    "symbols": [
      "Vela de loto",
      "Petardo de jade",
      "Abanico de seda",
      "Tambor ceremonial",
      "Farol rojo",
      "Koi dorado",
      "Estrella wild",
      "Portal de giros gratis"
    ]
  },
  {
    "slug": "guardian-jade",
    "name": "Jade Guardian",
    "tagline": "Un tigre de piedra despierta en un templo escondido",
    "accent": "#34d399",
    "providerSlug": "lumen",
    "batch": 1,
    "version": "1.0.0-demo",
    "banner": "/images/slots/guardian-jade/identity-v3/cover.webp",
    "cover": "/images/slots/guardian-jade/identity-v3/cover.webp",
    "loading": "/images/slots/guardian-jade/identity-v3/cover.webp",
    "sprite": "/images/slots/guardian-jade/symbols-transparent.webp",
    "icon": "/images/slots/guardian-jade/icon.webp",
    "symbols": [
      "Loto de piedra",
      "Vasija de incienso",
      "Bambú dorado",
      "Medallón de jade",
      "Máscara del templo",
      "Tigre de jade",
      "Estrella wild",
      "Portal de giros gratis"
    ]
  },
  {
    "slug": "islas-magneticas",
    "name": "Magnetic Isles",
    "tagline": "Exploradores mecánicos entre islas que flotan",
    "accent": "#38bdf8",
    "providerSlug": "lumen",
    "batch": 1,
    "version": "1.0.0-demo",
    "banner": "/images/slots/islas-magneticas/identity-v3/cover.webp",
    "cover": "/images/slots/islas-magneticas/identity-v3/cover.webp",
    "loading": "/images/slots/islas-magneticas/identity-v3/cover.webp",
    "sprite": "/images/slots/islas-magneticas/symbols-transparent.webp",
    "icon": "/images/slots/islas-magneticas/icon.webp",
    "symbols": [
      "Isla flotante",
      "Imán de bronce",
      "Núcleo azul",
      "Hélice de cobre",
      "Cristal magnético",
      "Robot explorador",
      "Estrella wild",
      "Portal de giros gratis"
    ]
  },
  {
    "slug": "oasis-de-cobre",
    "name": "Copper Oasis",
    "tagline": "Un zorro del desierto encuentra un oasis imposible",
    "accent": "#d97706",
    "providerSlug": "lumen",
    "batch": 1,
    "version": "1.0.0-demo",
    "banner": "/images/slots/oasis-de-cobre/identity-v3/cover.webp",
    "cover": "/images/slots/oasis-de-cobre/identity-v3/cover.webp",
    "loading": "/images/slots/oasis-de-cobre/identity-v3/cover.webp",
    "sprite": "/images/slots/oasis-de-cobre/symbols-transparent.webp",
    "icon": "/images/slots/oasis-de-cobre/icon.webp",
    "symbols": [
      "Dátiles dorados",
      "Lámpara de cobre",
      "Perla del desierto",
      "Hoja de palma",
      "Jarra turquesa",
      "Zorro de cobre",
      "Estrella wild",
      "Portal de giros gratis"
    ]
  },
  {
    "slug": "jardin-relojes",
    "name": "Clockwork Garden",
    "tagline": "El tiempo florece entre rosas y relojes antiguos",
    "accent": "#f472b6",
    "providerSlug": "lumen",
    "batch": 1,
    "version": "1.0.0-demo",
    "banner": "/images/slots/jardin-relojes/identity-v3/cover.webp",
    "cover": "/images/slots/jardin-relojes/identity-v3/cover-cinematic.webp",
    "loading": "/images/slots/jardin-relojes/identity-v3/cover.webp",
    "sprite": "/images/slots/jardin-relojes/symbols-transparent.webp",
    "icon": "/images/slots/jardin-relojes/icon.webp",
    "symbols": [
      "Llave del tiempo",
      "Mariposa mecánica",
      "Reloj de arena",
      "Rosa rubí",
      "Reloj de bolsillo",
      "Conejo blanco",
      "Estrella wild",
      "Portal de giros gratis"
    ]
  },
  {
    "slug": "archivo-abisal",
    "name": "Abyssal Archive",
    "tagline": "Un pulpo guardián protege los mapas del océano",
    "accent": "#2dd4bf",
    "providerSlug": "lumen",
    "batch": 1,
    "version": "1.0.0-demo",
    "banner": "/images/slots/archivo-abisal/identity-v3/cover.webp",
    "cover": "/images/slots/archivo-abisal/identity-v3/cover.webp",
    "loading": "/images/slots/archivo-abisal/identity-v3/cover.webp",
    "sprite": "/images/slots/archivo-abisal/symbols-transparent.webp",
    "icon": "/images/slots/archivo-abisal/icon.webp",
    "symbols": [
      "Botella zafiro",
      "Astrolabio coral",
      "Nautilus",
      "Farol abisal",
      "Mapa antiguo",
      "Pulpo abisal",
      "Estrella wild",
      "Portal de giros gratis"
    ]
  },
  ...slotBatch02Games,
  ...slotBatch03Games,
  ...slotBatch04Games
];

export const slotEditionIIGames: readonly SlotGame[] = slotGames.map(createSlotEditionII);
export const slotEditionIIIGames: readonly SlotGame[] = slotGames.map(createSlotEditionIII);
export const slotPlayableGames: readonly SlotGame[] = [...slotGames, ...slotEditionIIGames, ...slotEditionIIIGames];

export function slotGameBySlug(slug: string) { return slotPlayableGames.find((game) => game.slug === slug); }

export { slotThemes, defaultSlotTheme, type SlotTheme } from "./slot-themes";
