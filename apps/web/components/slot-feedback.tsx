"use client";

import { useEffect, useRef, useState, type RefObject, type ReactNode, type CSSProperties } from "react";
import { PAYLINES, type LineWin } from "@homebet/proveedores/engine";
import type { SlotGame, SlotTheme } from "@homebet/proveedores/catalog";
import "./slot-prize-art.css";

export const lineNames = ["Fila superior", "Fila central", "Fila inferior", "Diagonal descendente", "Diagonal ascendente"] as const;

export function WinningLines({ board, wins, columns = 3, paylines = PAYLINES }: { board: RefObject<HTMLDivElement | null>; wins: readonly LineWin[]; columns?: number; paylines?: readonly (readonly number[])[] }) {
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const element = board.current;
    if (!element || !svg.current) return;
    const update = () => {
      const bounds = element.getBoundingClientRect();
      svg.current?.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
      wins.forEach((win, index) => {
        const points = (win.cells ?? paylines[win.line]).map((cell) => {
          const column = element.querySelectorAll(".slot-reel")[cell % columns];
          const tile = column?.querySelectorAll(".slot-cell")[Math.floor(cell / columns)];
          const rect = tile?.getBoundingClientRect();
          return rect ? `${rect.left - bounds.left + rect.width / 2},${rect.top - bounds.top + rect.height / 2}` : "0,0";
        }).join(" ");
        svg.current?.querySelectorAll(`[data-line="${index}"]`).forEach((line) => line.setAttribute("points", points));
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [board, wins, columns, paylines]);
  return <svg ref={svg} className="slot-paylines" aria-hidden="true" preserveAspectRatio="none">
    {wins.map((win, index) => <g key={win.line}>
      <polyline data-line={index} className="slot-payline-glow" />
      <polyline data-line={index} className="slot-payline" pathLength="1" />
    </g>)}
  </svg>;
}

function AnimatedPrizeAmount({ amount, format, duration = 1400 }: { amount: number; format: (amount: number) => string; duration?: number }) {
  const number = useRef<HTMLSpanElement>(null);
  const [countDuration] = useState(duration);
  useEffect(() => {
    const element = number.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let start: number | null = null;
    const finish = () => {
      cancelAnimationFrame(frame);
      element.textContent = format(amount);
      element.dataset.counting = "false";
    };
    const tick = (now: number) => {
      if (document.hidden || preference.matches) { finish(); return; }
      start ??= now;
      const progress = Math.min(1, (now - start) / countDuration);
      // Animate whole fichas; fractional intermediate values would introduce
      // decimal commas that disappear at the final, whole-chip payout.
      const value = Math.min(amount, Math.floor(amount / 100 * (1 - Math.pow(1 - progress, 3))) * 100);
      element.textContent = format(value);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else finish();
    };
    const handleVisibility = () => { if (document.hidden) finish(); };
    element.textContent = format(0);
    element.dataset.counting = "true";
    if (preference.matches) finish();
    else frame = requestAnimationFrame(tick);
    preference.addEventListener("change", finish);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      cancelAnimationFrame(frame);
      preference.removeEventListener("change", finish);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [amount, format, countDuration]);
  return <><span ref={number} className="slot-prize-number" style={{ "--prize-characters": Math.max(5, format(amount).length) } as CSSProperties} aria-hidden="true">{format(0)}</span><span className="sr-only">{format(amount)}</span></>;
}

export function SlotPrizeCard({ game, theme, amount, format, duration, children, badge, onDismiss }: {
  game: SlotGame; theme: SlotTheme; amount: number; format: (amount: number) => string; duration: number; children: ReactNode; badge?: string; onDismiss?: () => void;
}) {
  return <section className={`slot-prize-card ${badge ? "has-prize-art" : ""}`} aria-label="Premio ganado">
    {badge && <div className="slot-prize-badge" aria-hidden="true"><i /><span style={{ backgroundImage: `url("${badge}")` }} /><i /></div>}
    <div className="slot-prize-decoration" aria-hidden="true"><span>{theme.emblem}</span><span>{theme.emblem}</span></div>
    <p className="slot-prize-game">{game.name}</p>
    <h2 className="slot-prize-heading">¡Ganaste!</h2>
    <p className="slot-prize-total" role="status" aria-atomic="true"><span className="sr-only">Premio ganado: </span><AnimatedPrizeAmount amount={amount} format={format} duration={duration} /><span className="slot-prize-unit">fichas demo</span></p>
    <div className="slot-prize-details">{children}</div>
    {onDismiss && <button type="button" className="slot-prize-dismiss" aria-label="Cerrar premio y ver los rodillos" onClick={onDismiss}><span className="sr-only">Tocá para cerrar el premio</span></button>}
  </section>;
}

export type BonusReveal = { choice: number; phase: "opening" | "revealed"; payoutCents: number };

export function SlotBonus({ game, theme, reveal, onPick, onContinue, format }: {
  game: SlotGame; theme: SlotTheme; reveal: BonusReveal | null;
  onPick: (choice: number) => void; onContinue: () => void; format: (amount: number) => string;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const continueButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    heading.current?.closest(".slot-board-stage")?.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, []);
  useEffect(() => {
    if (reveal?.phase !== "revealed") return;
    continueButton.current?.focus({ preventScroll: true });
    const card = heading.current?.closest("section");
    card?.scrollTo({ top: card.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [reveal?.phase]);
  return <section className={`slot-bonus ${reveal ? `is-${reveal.phase}` : ""}`} aria-labelledby="slot-bonus-title" aria-busy={reveal?.phase === "opening"}>
    <p className="slot-bonus-eyebrow">Bono especial · premio de 1× a 5×</p>
    <h2 ref={heading} id="slot-bonus-title" tabIndex={-1}>{theme.bonus.title}</h2>
    <p className="slot-bonus-help">{!reveal ? `Elegí un elemento para descubrir tu premio.` : reveal.phase === "opening" ? "Descubriendo tu premio…" : "Premio acreditado en tus fichas demo."}</p>
    <div className="slot-bonus-options">
      {[0, 1, 2].map((choice) => <button key={choice} type="button" disabled={!!reveal} onClick={() => onPick(choice)} className={`slot-bonus-option ${reveal?.choice === choice ? "is-chosen" : ""}`} aria-label={`Elegir ${theme.bonus.item} ${choice + 1}`}>
        <span className="slot-bonus-object" aria-hidden="true">
          <span className="slot-bonus-halo" />
          <span className="slot-symbol" style={{ backgroundImage: `url("${game.sprite}")`, backgroundPosition: `${theme.bonus.symbol * 100 / 7}% 50%` }} />
          <span className="slot-bonus-seal">{theme.emblem}</span>
        </span>
        <span className="slot-bonus-option-label">{theme.bonus.item} {choice + 1}</span>
      </button>)}
    </div>
    {reveal?.phase === "revealed" && <div className="slot-bonus-prize" role="status">
      <span>Tu premio</span><strong><AnimatedPrizeAmount amount={reveal.payoutCents} format={format} /> fichas</strong>
      <button ref={continueButton} type="button" onClick={onContinue}>Continuar jugando</button>
    </div>}
    <p className="slot-bonus-fairness">El premio se fija al activar el bono. Las tres opciones tienen la misma probabilidad.</p>
  </section>;
}
