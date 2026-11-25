"use client";

import { useCallback, useEffect, useRef } from "react";
import type { SlotTheme } from "@homebet/proveedores/catalog";

type Cue = "spin" | "stop" | "win" | "bonus";

export function useSlotAudio(theme: SlotTheme, enabled: boolean, volume = 60) {
  const context = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const audible = useRef(enabled);
  const level = useRef(volume);

  useEffect(() => {
    audible.current = enabled;
    level.current = volume;
    if (context.current && master.current) {
      master.current.gain.setValueAtTime(enabled && !document.hidden ? 0.075 * volume / 100 : 0, context.current.currentTime);
    }
  }, [enabled, volume]);
  useEffect(() => {
    const muteHidden = () => {
      if (context.current && master.current) master.current.gain.setValueAtTime(document.hidden || !audible.current ? 0 : 0.075 * level.current / 100, context.current.currentTime);
    };
    document.addEventListener("visibilitychange", muteHidden);
    return () => {
      document.removeEventListener("visibilitychange", muteHidden);
      void context.current?.close();
      context.current = null;
      master.current = null;
    };
  }, []);

  return useCallback((cue: Cue, column = 0) => {
    if (!audible.current || level.current === 0 || document.hidden) return;
    try {
      if (!context.current) {
        context.current = new AudioContext();
        master.current = context.current.createGain();
        master.current.gain.value = 0.075 * level.current / 100;
        master.current.connect(context.current.destination);
      }
      const ctx = context.current;
      void ctx.resume().catch(() => { /* Audio may be unavailable. */ });
      const notes = cue === "bonus" ? [...theme.notes, theme.notes[0] * 2]
        : cue === "win" ? theme.notes
        : [theme.notes[cue === "stop" ? column : 0] / (cue === "spin" ? 2 : 1)];
      notes.forEach((frequency, index) => {
        const start = ctx.currentTime + index * 0.09;
        const duration = cue === "stop" ? 0.09 : 0.22;
        const oscillator = ctx.createOscillator();
        const envelope = ctx.createGain();
        oscillator.type = theme.voice;
        oscillator.frequency.setValueAtTime(frequency, start);
        if (cue === "spin") oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, start + duration);
        envelope.gain.setValueAtTime(0, start);
        envelope.gain.linearRampToValueAtTime(0.65, start + 0.008);
        envelope.gain.exponentialRampToValueAtTime(0.001, start + duration);
        oscillator.connect(envelope);
        envelope.connect(master.current!);
        oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
        oscillator.start(start);
        oscillator.stop(start + duration + 0.01);
      });
    } catch { /* Sound never affects the round. */ }
  }, [theme]);
}
