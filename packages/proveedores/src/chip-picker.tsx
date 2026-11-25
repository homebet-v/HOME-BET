"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { chipLabel as slotChipLabel } from "./chip-label";
import type { SlotTheme } from "./slot-themes";
import "./chip-picker.css";

export function ChipPicker({ options, value, theme, trigger, format, onConfirm, onClose, chipArt, buttonArt, title = "Elegí tu apuesta", description = "Elegí una ficha y confirmá el importe.", confirmLabel = "Confirmar apuesta" }: {
  title?: string;
  description?: string;
  confirmLabel?: string;
  chipArt?: string;
  buttonArt?: string;
  options: readonly number[];
  value: number;
  theme: Pick<SlotTheme, "motif" | "secondary" | "surface" | "emblem">;
  trigger: RefObject<HTMLButtonElement | null>;
  format: (amount: number) => string;
  onConfirm: (amount: number) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState(value);
  const card = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    const element = card.current;
    element?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus({ preventScroll: true });
    element?.closest(".slot-board-stage")?.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close.current(); return; }
      if (event.key !== "Tab" || !element) return;
      const buttons = [...element.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
      const first = buttons[0], last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const previousTrigger = trigger.current;
    document.addEventListener("keydown", handleKey, true);
    return () => {
      document.removeEventListener("keydown", handleKey, true);
      requestAnimationFrame(() => previousTrigger?.focus({ preventScroll: true }));
    };
  }, [trigger]);

  return <div className="slot-chip-layer">
    <button type="button" className="slot-chip-backdrop" aria-label="Cerrar selección de fichas" tabIndex={-1} onClick={onClose} />
    <div ref={card} className="slot-chip-card" role="dialog" aria-modal="true" aria-labelledby="slot-chip-heading" aria-describedby="slot-chip-description" style={{ "--chip-art": `url("${chipArt ?? `/images/slots/controls/${theme.motif}/spin.webp`}")`, "--slot-button-art": `url("${buttonArt ?? `/images/slots/controls/${theme.motif}/button.webp`}")` } as CSSProperties}>
      <button type="button" className="slot-chip-close" onClick={onClose} aria-label="Cancelar selección de apuesta">×</button>
      <p className="slot-chip-eyebrow" aria-hidden="true">{theme.emblem} Fichas demo {theme.emblem}</p>
      <h2 id="slot-chip-heading">{title}</h2>
      <p id="slot-chip-description" className="slot-chip-description">{description}</p>
      <div className="slot-chip-grid" role="radiogroup" aria-label="Importe de la apuesta">
        {options.map((amount, index) => <button key={amount} type="button" role="radio" aria-checked={selected === amount} aria-label={`${format(amount)} fichas`} className="slot-bet-chip" style={{ "--chip-hue": `${index % 3 * 9 - 9}deg`, "--chip-label-size": `${Math.min(0.33, 1.25 / Math.max(3, slotChipLabel(amount).length)) * 100}cqi` } as CSSProperties} onClick={() => setSelected(amount)} onKeyDown={(event) => {
          const direction = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : ["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 0;
          if (!direction && event.key !== "Home" && event.key !== "End") return;
          event.preventDefault();
          const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + direction + options.length) % options.length;
          setSelected(options[next]);
          card.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
        }} tabIndex={selected === amount ? 0 : -1}>
          <span className="slot-chip-label" aria-hidden="true">{slotChipLabel(amount)}</span>
          {selected === amount && <span className="slot-chip-check" aria-hidden="true">✓</span>}
        </button>)}
      </div>
      <p className="slot-chip-selected" aria-live="polite">Seleccionada: <strong>{format(selected)} fichas</strong></p>
      <button type="button" className="slot-chip-confirm" onClick={() => onConfirm(selected)}>{confirmLabel}</button>
    </div>
  </div>;
}
