export const SLOT_CONTROL_LAYOUTS = [
  { id: "central-bar", label: "01 · Giro central", description: "Ficha a la izquierda, giro al centro, velocidades a la derecha y acciones abajo." },
  { id: "right-thumb", label: "02 · Pulgar derecho", description: "Giro a la derecha, acciones en el centro y ficha con velocidades a la izquierda." },
  { id: "left-thumb", label: "03 · Pulgar izquierdo", description: "Giro a la izquierda, acciones en el centro y ficha con velocidades a la derecha." },
  { id: "low-center", label: "04 · Giro inferior", description: "Acciones arriba; ficha, giro central y velocidades debajo." },
] as const;

export type SlotControlLayout = typeof SLOT_CONTROL_LAYOUTS[number]["id"];
export type SlotLayoutPreferences = Readonly<Record<string, SlotControlLayout>>;
export const DEFAULT_SLOT_CONTROL_LAYOUT: SlotControlLayout = "central-bar";

export function isSlotControlLayout(value: unknown): value is SlotControlLayout {
  return SLOT_CONTROL_LAYOUTS.some((layout) => layout.id === value);
}

/** Discard malformed or stale display preferences; never interpret them as game settings. */
export function parseSlotLayoutPreferences(raw: string, knownSlugs: readonly string[]): SlotLayoutPreferences {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const known = new Set(knownSlugs);
    return Object.fromEntries(Object.entries(value).filter(([slug, layout]) => known.has(slug) && isSlotControlLayout(layout))) as SlotLayoutPreferences;
  } catch { return {}; }
}
