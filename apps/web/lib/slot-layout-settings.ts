"use client";

import { useSyncExternalStore } from "react";
import { slotDemoGames } from "@/lib/slot-editions";
import { DEFAULT_SLOT_CONTROL_LAYOUT, isSlotControlLayout, parseSlotLayoutPreferences, type SlotControlLayout, type SlotLayoutPreferences } from "@homebet/proveedores/layouts";

const key = "homebet.slot-control-layouts.v1";
const knownSlugs = slotDemoGames.map((game) => game.slug);
const serverSnapshot: SlotLayoutPreferences = {};
let snapshot = serverSnapshot;
let lastRaw: string | null = null;
let storageAvailable = true;
const listeners = new Set<() => void>();

function read() {
  if (!storageAvailable) return snapshot;
  try {
    const raw = localStorage.getItem(key) ?? "";
    if (raw !== lastRaw) {
      lastRaw = raw;
      snapshot = parseSlotLayoutPreferences(raw, knownSlugs);
    }
  } catch { storageAvailable = false; }
  return snapshot;
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  const handleStorage = (event: StorageEvent) => { if (event.key === key || event.key === null) listener(); };
  window.addEventListener("storage", handleStorage);
  return () => { listeners.delete(listener); window.removeEventListener("storage", handleStorage); };
}
export function useGameSlotLayout(slug: string): SlotControlLayout {
  return useSyncExternalStore(subscribe, read, () => serverSnapshot)[slug] ?? DEFAULT_SLOT_CONTROL_LAYOUT;
}
export function setGameSlotLayout(slug: string, layout: SlotControlLayout) {
  if (!knownSlugs.includes(slug)) throw new Error("Juego no encontrado.");
  if (!isSlotControlLayout(layout)) throw new Error("Distribución no válida.");
  snapshot = { ...read(), [slug]: layout };
  lastRaw = JSON.stringify(snapshot);
  try { localStorage.setItem(key, lastRaw); }
  catch { storageAvailable = false; }
  listeners.forEach((listener) => listener());
}
