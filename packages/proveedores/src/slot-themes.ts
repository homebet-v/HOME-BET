import { slotBatch02Themes } from "./slot-batch-02";
import { slotBatch03Themes } from "./slot-batch-03";
import { slotBatch04Themes } from "./slot-batch-04";

export type SlotTheme = {
  motif: "botanical" | "brass" | "celestial" | "frost" | "ocean" | "ember" | "paper" | "lantern";
  secondary: string;
  surface: string;
  emblem: string;
  notes: readonly [number, number, number];
  voice: "sine" | "triangle" | "square";
  bonus: { item: string; title: string; symbol: number };
};

// Presentation only: these profiles never influence the engine or its payouts.
export const slotThemes: Readonly<Record<string, SlotTheme>> = {
  "jardin-de-luces": { motif: "botanical", secondary: "#d9f99d", surface: "#071d18", emblem: "❧", notes: [523, 659, 784], voice: "sine", bonus: { item: "flor", title: "El jardín secreto", symbol: 4 } },
  "puerto-ambar": { motif: "brass", secondary: "#fde68a", surface: "#211509", emblem: "✥", notes: [220, 330, 440], voice: "triangle", bonus: { item: "cofre", title: "El tesoro del puerto", symbol: 4 } },
  "taller-de-cometas": { motif: "celestial", secondary: "#fef08a", surface: "#211326", emblem: "✦", notes: [440, 659, 880], voice: "triangle", bonus: { item: "cometa", title: "Una estrella por descubrir", symbol: 3 } },
  "biblioteca-lunar": { motif: "celestial", secondary: "#e0e7ff", surface: "#15132e", emblem: "☾", notes: [294, 440, 587], voice: "sine", bonus: { item: "libro", title: "Las páginas del destino", symbol: 4 } },
  "aurora-glacial": { motif: "frost", secondary: "#e0f2fe", surface: "#082333", emblem: "❄", notes: [784, 988, 1175], voice: "sine", bonus: { item: "gema", title: "El secreto del hielo", symbol: 0 } },
  "oraculo-coral": { motif: "ocean", secondary: "#5eead4", surface: "#09282c", emblem: "≈", notes: [349, 440, 523], voice: "sine", bonus: { item: "perla", title: "La voz del arrecife", symbol: 3 } },
  "caravana-solar": { motif: "brass", secondary: "#fb923c", surface: "#291c0c", emblem: "☼", notes: [262, 330, 494], voice: "triangle", bonus: { item: "escarabajo", title: "El tesoro del sol", symbol: 5 } },
  "mercado-de-nubes": { motif: "celestial", secondary: "#fbcfe8", surface: "#17253b", emblem: "✧", notes: [587, 740, 880], voice: "sine", bonus: { item: "frasco", title: "Sueños entre las nubes", symbol: 2 } },
  "bosque-micelio": { motif: "botanical", secondary: "#c084fc", surface: "#122216", emblem: "❧", notes: [392, 494, 587], voice: "sine", bonus: { item: "hongo", title: "La luz del bosque", symbol: 4 } },
  "volcan-obsidiana": { motif: "ember", secondary: "#fbbf24", surface: "#2b0e10", emblem: "◆", notes: [110, 165, 220], voice: "triangle", bonus: { item: "cristal", title: "El corazón del volcán", symbol: 4 } },
  "tren-constelaciones": { motif: "celestial", secondary: "#fcd34d", surface: "#12152e", emblem: "✦", notes: [330, 494, 659], voice: "triangle", bonus: { item: "boleto", title: "Tu próximo destino", symbol: 4 } },
  "reino-origami": { motif: "paper", secondary: "#fef3c7", surface: "#301e2b", emblem: "◇", notes: [659, 784, 988], voice: "triangle", bonus: { item: "grulla", title: "El pliegue secreto", symbol: 5 } },
  "laboratorio-nectar": { motif: "botanical", secondary: "#fbbf24", surface: "#28210c", emblem: "⬡", notes: [440, 554, 659], voice: "triangle", bonus: { item: "frasco", title: "La fórmula dorada", symbol: 4 } },
  "catedral-cristal": { motif: "frost", secondary: "#f0abfc", surface: "#211334", emblem: "◇", notes: [698, 880, 1047], voice: "sine", bonus: { item: "geoda", title: "La luz del santuario", symbol: 2 } },
  "festival-faroles": { motif: "lantern", secondary: "#fda4af", surface: "#301312", emblem: "❖", notes: [523, 698, 880], voice: "triangle", bonus: { item: "farol", title: "Un deseo encendido", symbol: 4 } },
  "guardian-jade": { motif: "brass", secondary: "#fde68a", surface: "#0c261f", emblem: "✥", notes: [196, 294, 392], voice: "triangle", bonus: { item: "medallón", title: "El legado del guardián", symbol: 3 } },
  "islas-magneticas": { motif: "celestial", secondary: "#67e8f9", surface: "#122735", emblem: "✧", notes: [370, 554, 740], voice: "triangle", bonus: { item: "cristal", title: "El secreto de las islas", symbol: 4 } },
  "oasis-de-cobre": { motif: "brass", secondary: "#5eead4", surface: "#2c1b12", emblem: "☼", notes: [247, 370, 494], voice: "triangle", bonus: { item: "jarra", title: "Un hallazgo en el oasis", symbol: 4 } },
  "jardin-relojes": { motif: "brass", secondary: "#bef264", surface: "#202514", emblem: "✥", notes: [330, 415, 494], voice: "triangle", bonus: { item: "reloj", title: "El instante dorado", symbol: 4 } },
  "archivo-abisal": { motif: "ocean", secondary: "#a5b4fc", surface: "#091c30", emblem: "≈", notes: [165, 247, 330], voice: "sine", bonus: { item: "mapa", title: "Un secreto de las profundidades", symbol: 4 } },
  ...slotBatch02Themes,
  ...slotBatch03Themes,
  ...slotBatch04Themes,
};

export const defaultSlotTheme = slotThemes["jardin-de-luces"];
