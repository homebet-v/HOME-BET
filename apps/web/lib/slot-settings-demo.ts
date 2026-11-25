"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_RTP, effectiveRtp, validateRtp, type ProviderRtp } from "@homebet/proveedores/engine";
import { slotPlayableGames as slotGames } from "@homebet/proveedores/catalog";

let settings: ProviderRtp = DEFAULT_RTP;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export function useSlotSettings() { return useSyncExternalStore(subscribe, () => settings, () => DEFAULT_RTP); }
export function setProviderRtp(providerBps: number) {
  validateRtp(providerBps);
  settings = { ...settings, providerBps };
  listeners.forEach((listener) => listener());
}
export function setGameRtp(slug: string, value: number | null) {
  if (!slotGames.some((game) => game.slug === slug)) throw new Error("Juego no encontrado.");
  if (value !== null) validateRtp(value);
  const gameOverrides = { ...settings.gameOverrides };
  if (value === null) delete gameOverrides[slug];
  else gameOverrides[slug] = value;
  settings = { ...settings, gameOverrides };
  listeners.forEach((listener) => listener());
}
export function resetSlotSettings() { settings = DEFAULT_RTP; listeners.forEach((listener) => listener()); }
export { effectiveRtp };
