"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { BETS, FREE_SPINS_AWARD, MULTIPLIERS, effectiveRtp, newSession, settleBonus, type SlotSession } from "@homebet/proveedores/engine";
import { slotThemes, defaultSlotTheme, type SlotGame } from "@homebet/proveedores/catalog";
import { slotEngineProfile } from "@/lib/slot-engine-profile";
import { SlotEditionRules } from "./slot-edition-rules";
import { slotVisualProfile } from "@/lib/slot-visual-profile";
import { SkinRoundMetrics, SkinSoundGlyph, SkinSpinGlyph } from "./slot-skin-parts";
import { SlotGameTitle } from "./slot-game-title";
import { useSlotViewport } from "@/lib/use-slot-viewport";
import { useSlotAudio } from "@/lib/use-slot-audio";
import { SlotBonus, SlotPrizeCard, WinningLines, lineNames, type BonusReveal } from "@/components/slot-feedback";
import { useGameSlotLayout } from "@/lib/slot-layout-settings";
import { useSlotSettings } from "@/lib/slot-settings-demo";
import { SlotChipPicker } from "./slot-chip-picker";
import { slotChipLabel } from "@/lib/slot-chip-label";
import "./slot-control-dock.css";
import "./slot-control-layouts.css";
import "./slot-lumen-skin.css";
import "./slot-rules-panel.css";
import "./slot-speed-cycle.css";
import "./slot-edition-ii.css";
import "./slot-edition-iii.css";
import "./slot-pixel-skin.css";
import "./slot-pop-skin.css";

const chips = (cents: number) => new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2 }).format(cents / 100);
function SymbolTile({ game, symbol, className = "" }: { game: SlotGame; symbol: number; className?: string }) {
  return <span role="img" aria-label={game.symbols[symbol]} className={`slot-symbol ${className}`} style={{ backgroundImage: `url("${game.sprite}")`, backgroundPosition: `${symbol * 100 / 7}% 50%` }} />;
}

type ReelMotion = { id: number; from: readonly number[]; to: readonly number[]; speed: number; reduced: boolean };

function SlotReel({ game, column, columns, rows, grid, motion, winningCells, onStop }: {
  game: SlotGame; column: number; columns: number; rows: number; grid: readonly number[]; motion: ReelMotion | null; winningCells: Set<number>; onStop: (cue: "stop", column: number, roundId: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  // Keep both endpoints in the strip: the animation starts on the previous grid
  // and lands on the exact result already chosen by the engine.
  const travel = 18 + column * 6;
  const symbols = motion && !motion.reduced
    ? [...Array.from({ length: rows }, (_, row) => motion.from[row * columns + column]),
      ...Array.from({ length: travel - rows }, (_, index) => (index + column * 3 + motion.id) % game.symbols.length),
      ...Array.from({ length: rows }, (_, row) => motion.to[row * columns + column])]
    : Array.from({ length: rows }, (_, row) => grid[row * columns + column]);
  const offset = motion && !motion.reduced ? -100 * travel / symbols.length : 0;

  // Cancel the previous strip animation before the shortened resting strip paints.
  // This also starts a new spin on its first frame, without flashing its result.
  useLayoutEffect(() => {
    if (!motion || motion.reduced || !track.current) return;
    const animation = track.current.animate([
      { transform: "translateY(0)", filter: "blur(0px)", offset: 0 },
      { filter: "blur(1.2px)", offset: 0.15 },
      { filter: "blur(0.8px)", offset: 0.7 },
      { transform: `translateY(${offset - 6 / symbols.length}%)`, filter: "blur(0px)", offset: 0.92 },
      { transform: `translateY(${offset}%)`, filter: "blur(0px)", offset: 1 },
    ], {
      duration: (1000 + column * 200) / motion.speed,
      easing: "cubic-bezier(0.16, 0.65, 0.28, 1)",
      fill: "forwards",
    });
    animation.onfinish = () => onStop("stop", column, motion.id);
    return () => { animation.onfinish = null; animation.cancel(); };
  }, [motion, column, offset, onStop, symbols.length]);

  return <div className="slot-reel" aria-label={`Rodillo ${column + 1}`}>
    <div ref={track} className={`slot-reel-track ${motion && !motion.reduced ? "slot-reel-moving" : ""}`} style={{ transform: `translateY(${offset}%)` }} aria-hidden={!!motion}>
      {symbols.map((symbol, index) => <div key={index} className="slot-reel-step">
        <div className={`slot-cell ${!motion && winningCells.has(index * columns + column) ? "slot-winning" : ""}`}>
          <SymbolTile game={game} symbol={symbol} />
          {(!motion || motion.reduced) && symbol >= 6 && <span className="slot-reel-label">{symbol === 6 ? "WILD" : "GIROS"}</span>}
        </div>
      </div>)}
    </div>
  </div>;
}

export default function SlotPlayer({ game, onExit }: { game: SlotGame; onExit?: () => void }) {
  const theme = slotThemes[game.themeSlug ?? game.slug] ?? defaultSlotTheme;
  const engine = slotEngineProfile(game);
  const columnCount = game.engine === "5x3" || game.engine === "5x5" ? 5 : 3;
  const PAYLINES = engine.paylines;
  const initialGrid = engine.initialGrid;
  const player = useRef<HTMLDivElement>(null);
  const visual = slotVisualProfile(game, theme);
  const titleArt = visual.title, buttonArt = visual.button, spinArt = visual.spin, chipArt = visual.chip;
  const sceneArt = visual.scene;
  const isPolished = visual.premium;
  const prizeBadges = visual.prizeBadges;
  const preloadSources = useMemo(() => [...new Set([sceneArt, game.sprite, buttonArt, spinArt, chipArt, titleArt, ...prizeBadges])], [sceneArt, game.sprite, buttonArt, spinArt, chipArt, titleArt, prizeBadges]);
  const controlLayout = useGameSlotLayout(game.slug);
  const settings = useSlotSettings();
  const rtp = effectiveRtp(settings, game.slug);
  const [session, setSession] = useState<SlotSession>(() => newSession());
  const [dismissedPrizeRound, setDismissedPrizeRound] = useState<number | null>(null);
  const [prizeReadyRound, setPrizeReadyRound] = useState<number | null>(null);
  const sessionRef = useRef(session);
  const [bet, setBet] = useState<number>(BETS[2]);
  const [betOpen, setBetOpen] = useState(false);
  const availableBets: readonly number[] = BETS;
  const [speed, setSpeed] = useState<1 | 2 | 3>(1);
  const [spinning, setSpinning] = useState(false);
  const [reelMotion, setReelMotion] = useState<ReelMotion | null>(null);
  const spinLock = useRef(false);
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [message, setMessage] = useState("");
  const [rulesOpen, setRulesOpen] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);
  const [autoCount, setAutoCount] = useState(20);
  const [lossLimit, setLossLimit] = useState("2000");
  const [profitLimit, setProfitLimit] = useState("3000");
  const [autoRemaining, setAutoRemaining] = useState(0);
  const auto = useRef({ remaining: 0, start: 0, loss: 0, profit: 0 });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishSpin = useRef<(() => void) | null>(null);
  const stoppedReels = useRef(new Set<number>());
  const board = useRef<HTMLDivElement>(null);
  const spinButton = useRef<HTMLButtonElement>(null);
  const betTrigger = useRef<HTMLButtonElement>(null);
  const autoForm = useRef<HTMLFormElement>(null);
  const rulesSection = useRef<HTMLElement>(null);
  const bonusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [bonusReveal, setBonusReveal] = useState<BonusReveal | null>(null);
  const [volume, setVolume] = useState(60);
  const [sound, setSound] = useState(false);
  const playCue = useSlotAudio(theme, sound, volume);

  useSlotViewport(player, ready, controlLayout, sound, autoOpen, rulesOpen, engine.columns / engine.rows);

  useEffect(() => {
    let alive = true;
    let count = 0;
    const images = preloadSources.map((src) => {
      const image = new Image();
      image.onload = () => { if (alive) setLoaded(++count); };
      image.onerror = () => { if (alive) setLoadError(true); };
      image.src = src;
      return image;
    });
    return () => { alive = false; images.forEach((image) => { image.onload = null; image.onerror = null; }); };
  }, [preloadSources, retry]);
  const linePreviewRound = !spinning && session.lastRound?.wins.length ? session.lastRound.id : null;
  useEffect(() => {
    if (linePreviewRound === null) return;
    // Let the line animation finish and leave the combinations visible first.
    const task = setTimeout(() => {
      if (!spinLock.current && sessionRef.current.lastRound?.id === linePreviewRound) setPrizeReadyRound(linePreviewRound);
    }, Math.max(1200, 2000 / speed));
    return () => clearTimeout(task);
  }, [linePreviewRound, speed]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); if (bonusTimer.current) clearTimeout(bonusTimer.current); auto.current.remaining = 0; finishSpin.current = null; }, []);
  const stopAuto = useCallback((reason?: string) => {
    auto.current.remaining = 0;
    setAutoRemaining(0);
    if (reason) setMessage(reason);
  }, []);
  useEffect(() => {
    const stop = () => { if (document.hidden) stopAuto("Autojuego detenido al salir de la pestaña."); };
    document.addEventListener("visibilitychange", stop);
    return () => document.removeEventListener("visibilitychange", stop);
  }, [stopAuto]);
  useEffect(() => {
    if (autoOpen && isPolished) autoForm.current?.querySelector("select")?.focus({ preventScroll: true });
    if (autoOpen && !isPolished) autoForm.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [autoOpen, isPolished]);
  useEffect(() => {
    if (rulesOpen && isPolished) rulesSection.current?.focus({ preventScroll: true });
    if (rulesOpen && !isPolished) rulesSection.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [rulesOpen, isPolished]);
  const onReelStop = useCallback((_cue: "stop", column: number, roundId: number) => {
    if (!spinLock.current || sessionRef.current.lastRound?.id !== roundId || !finishSpin.current) return;
    if (stoppedReels.current.has(column)) return;
    stoppedReels.current.add(column);
    playCue("stop", column);
    if (stoppedReels.current.size === columnCount) finishSpin.current();
  }, [playCue, columnCount]);
  const performSpin = useCallback(() => {
    if (spinLock.current || !ready || document.hidden || sessionRef.current.pendingBonus || bonusReveal || betOpen) return;
    spinLock.current = true;
    setSpinning(true);
    setDismissedPrizeRound(null);
    setPrizeReadyRound(null);
    setMessage("");
    try {
      const previousGrid = sessionRef.current.lastRound?.grid ?? initialGrid;
      const next = engine.spin(sessionRef.current, bet, rtp);
      sessionRef.current = next;
      // Show the debit immediately; reveal the new result only when the reels stop.
      setSession((current) => ({ ...current, balanceCents: current.balanceCents - (next.lastRound!.isFree ? 0 : next.lastRound!.betCents) }));
      playCue("spin");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setReelMotion({ id: next.lastRound!.id, from: previousGrid, to: next.lastRound!.grid, speed, reduced });
      stoppedReels.current.clear();
      const complete = () => {
        if (finishSpin.current !== complete) return;
        finishSpin.current = null;
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
        spinLock.current = false;
        setSpinning(false);
        setReelMotion(null);
        setSession(next);
        const round = next.lastRound!;
        if (round.kind === "bonus" || round.kind === "free-spins") playCue("bonus");
        else if (round.payoutCents > 0) playCue("win");
        setMessage(round.kind === "free-spins" ? "¡Cinco giros gratis! Conservan la apuesta que los activó." : round.kind === "bonus" ? `¡${theme.bonus.title}! Elegí una opción para descubrir tu premio.` : round.payoutCents ? `¡Ganaste ${chips(round.payoutCents)} fichas!` : round.isFree ? `Giro gratis terminado. Quedan ${next.freeSpins}.` : "");
        if (auto.current.remaining > 0) {
          auto.current.remaining--;
          const delta = next.balanceCents - auto.current.start;
          if (round.kind === "bonus" || round.kind === "free-spins") stopAuto();
          else if (delta <= -auto.current.loss) stopAuto("Autojuego detenido: alcanzaste el límite de pérdida.");
          else if (delta >= auto.current.profit) stopAuto("Autojuego detenido: alcanzaste la meta de ganancia.");
          else if (next.balanceCents < bet && !next.freeSpins) stopAuto("Autojuego detenido: fichas insuficientes.");
          else setAutoRemaining(auto.current.remaining);
        }
      };
      finishSpin.current = complete;
      // Normal completion comes from the three animation finish events.
      // The timer only handles reduced motion or a missing browser event.
      timer.current = setTimeout(complete, reduced ? 100 : Math.ceil((1000 + (engine.columns - 1) * 200) / speed) + 100);
    } catch (error) { finishSpin.current = null; if (timer.current) clearTimeout(timer.current); timer.current = null; spinLock.current = false; setSpinning(false); setReelMotion(null); setMessage((error as Error).message); stopAuto(); }
  }, [ready, bet, rtp, speed, stopAuto, playCue, bonusReveal, betOpen, theme.bonus.title, engine, initialGrid]);
  useEffect(() => {
    if (!autoRemaining || spinning || !ready || session.pendingBonus) return;
    const winningRound = session.lastRound?.wins.length ? session.lastRound.id : null;
    if (winningRound !== null && prizeReadyRound !== winningRound) return;
    const task = setTimeout(() => { if (auto.current.remaining > 0) performSpin(); }, winningRound === null ? 450 / speed : Math.max(700, 1000 / speed));
    return () => clearTimeout(task);
  }, [autoRemaining, spinning, ready, session.pendingBonus, session.lastRound, prizeReadyRound, performSpin, speed]);
  function startAuto() {
    const loss = Number(lossLimit) * 100, profit = Number(profitLimit) * 100;
    if (!Number.isSafeInteger(loss) || !Number.isSafeInteger(profit) || loss <= 0 || profit <= 0) { setMessage("Definí límites positivos de pérdida y ganancia."); return; }
    if (spinLock.current || spinning || sessionRef.current.pendingBonus || bonusReveal || betOpen || sessionRef.current.freeSpins) return;
    auto.current = { remaining: autoCount, start: sessionRef.current.balanceCents, loss, profit };
    setAutoRemaining(autoCount); setAutoOpen(false); setMessage(`Autojuego: ${autoCount} giros como máximo.`);
  }
  function pickBonus(choice: number) {
    if (spinLock.current || bonusReveal || !sessionRef.current.pendingBonus) return;
    spinLock.current = true;
    setBonusReveal({ choice, phase: "opening", payoutCents: 0 });
    setMessage("Descubriendo tu premio…");
    playCue("spin");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    bonusTimer.current = setTimeout(() => {
      bonusTimer.current = null;
      try {
        const next = settleBonus(sessionRef.current);
        sessionRef.current = next;
        setSession(next);
        const payoutCents = next.lastRound!.payoutCents;
        setBonusReveal({ choice, phase: "revealed", payoutCents });
        setMessage(`¡Premio descubierto! ${chips(payoutCents)} fichas acreditadas.`);
        playCue("bonus");
      } catch (error) {
        setBonusReveal(null);
        setMessage((error as Error).message);
      } finally { spinLock.current = false; }
    }, reduced ? 100 : 700);
  }
  function resetDemo() {
    if (spinLock.current || auto.current.remaining || sessionRef.current.pendingBonus || sessionRef.current.freeSpins || bonusReveal || betOpen) return;
    const fresh = newSession();
    sessionRef.current = fresh;
    setSession(fresh);
    setDismissedPrizeRound(null);
    setPrizeReadyRound(null);
    setMessage("Nueva sesión con 10.000 fichas demo.");
  }
  const grid = session.lastRound?.grid ?? initialGrid;
  const winningCells = new Set<number>(!spinning ? session.lastRound?.wins.flatMap((win) => [...(win.cells ?? PAYLINES[win.line])]) : []);
  const wins = !spinning ? session.lastRound?.wins ?? [] : [];
  const locked = spinning || !!autoRemaining || !!session.pendingBonus || !!bonusReveal || betOpen;
  const activeBet = session.freeSpins ? session.featureBetCents : bet;
  const buttonClass = "rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-35";
  const betIndex = Math.max(0, availableBets.indexOf(activeBet));
  const quickLeft = availableBets[betIndex > 0 ? betIndex - 1 : 1];
  const quickRight = availableBets[betIndex < availableBets.length - 1 ? (betIndex === 0 ? 2 : betIndex + 1) : betIndex - 2];
  return <div ref={player} className={`slot-player relative isolate flex min-h-full flex-col overflow-x-clip bg-[#070a13] text-white ${isPolished ? "slot-lumen-skin" : ""}`} data-art-style={game.artStyle ?? "jewel"} data-engine={engine.id} data-motif={theme.motif} data-control-layout={controlLayout} style={{ "--slot-accent": visual.accent, "--slot-secondary": visual.secondary, "--slot-surface": visual.surface } as CSSProperties}>
    <img src={sceneArt} alt="" className="slot-scene-image pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover opacity-25" />
    <div className="slot-scene-shade pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#070a13]/10 via-[#070a13]/65 to-[#070a13]" />
    <header className="slot-theme-header flex items-center justify-between gap-3 border-b border-white/10 bg-black/25 px-4 py-3"><div className="min-w-0"><p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-amber-200">{isPolished ? `Lumen Studio${engine.columns === 5 ? ` · ${engine.edition} · ${engine.columns}×${engine.rows}` : ""}` : "Lumen Studio · 3 × 3"}</p></div><div className="flex shrink-0 items-center gap-2"><span className="slot-demo-badge rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-[9px] font-bold text-amber-200">DEMO</span>{isPolished && <><button type="button" className="slot-lumen-header-button" aria-label={sound ? "Silenciar sonido" : "Activar sonido"} aria-pressed={sound} onClick={() => setSound(!sound)}><SkinSoundGlyph sound={sound} /></button><button type="button" className="slot-lumen-header-button" aria-label="Abrir reglas y premios" aria-expanded={rulesOpen} onClick={() => setRulesOpen(!rulesOpen)}>i</button></>}{onExit && <button type="button" aria-label="Salir del juego" onClick={() => { stopAuto(); onExit(); }} className={buttonClass}>×</button>}</div></header>
    {!ready ? <div className="relative flex min-h-[440px] flex-1 flex-col items-center justify-center gap-5 p-6 text-center"><img src={game.loading} alt={game.name} className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" /><img src={game.icon} alt="" className="size-24 rounded-3xl border border-white/20 object-cover shadow-2xl" /><h2 className="text-3xl font-black">{game.name}</h2><p className="max-w-sm text-sm leading-6 text-slate-200">{game.tagline}</p><div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full transition-[width]" style={{ width: `${loaded * 100 / preloadSources.length}%`, background: game.accent }} /></div>{loadError ? <><p role="alert" className="text-xs text-red-200">No se pudieron cargar los gráficos.</p><button className={buttonClass} onClick={() => { setLoaded(0); setLoadError(false); setRetry((value) => value + 1); }}>Reintentar carga</button></> : <button disabled={loaded < preloadSources.length} onClick={() => setReady(true)} className="rounded-full px-8 py-3 text-sm font-black text-black disabled:opacity-40" style={{ background: game.accent }}>{loaded < preloadSources.length ? "Cargando recursos…" : "Entrar con 10.000 fichas demo"}</button>}<p className="max-w-sm text-[10px] leading-5 text-slate-300">Sin dinero real. Las fichas y la sesión se reinician al cerrar. RTP teórico: {(rtp / 100).toFixed(2)}%.</p></div> : <>
      <div className="slot-play-area mx-auto w-full max-w-xl flex-1 space-y-3 px-3 py-4 sm:px-6">
          <div className="slot-balance-strip slot-stats-panel">
            <div className="slot-saldo-stat"><span>{isPolished ? "Saldo demo" : "Fichas demo"}</span><strong>{chips(session.balanceCents)}</strong></div>
            <div className="slot-bet-stat"><span>Apuesta total</span><strong>{chips(activeBet)}</strong></div>
            <div className="slot-prize-stat"><span>Último premio</span><strong className="slot-prize-value">{spinning ? "—" : chips(session.lastRound?.payoutCents ?? 0)}</strong></div>
          </div>

        <SlotGameTitle game={game} theme={theme} art={titleArt} />
        <div className="slot-board slot-board-stage" style={{ position: "relative", isolation: "isolate" }}>
        <div className={`slot-themed-frame ${!spinning && (session.lastRound?.payoutCents ?? 0) > 0 ? "has-prize" : ""}`}>
          <div className="slot-frame-corners" aria-hidden="true">{[0, 1, 2, 3].map((corner) => <span key={corner}>{theme.emblem}</span>)}</div>
          <div className={`slot-reels rounded-[20px] border bg-[#070a13]/85 p-2.5 sm:p-4 ${spinning ? "is-spinning" : ""}`} aria-label={`Rodillos: ${engine.rows} filas y ${engine.columns} columnas`} aria-busy={spinning}>
            <div ref={board} className="slot-reel-window grid gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${engine.columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: engine.columns }, (_, column) => <SlotReel key={column} game={game} column={column} columns={engine.columns} rows={engine.rows} grid={grid} motion={reelMotion} winningCells={winningCells} onStop={onReelStop} />)}
            {wins.length > 0 && <WinningLines key={session.lastRound!.id} board={board} wins={wins} columns={engine.columns} paylines={PAYLINES} />}
            </div>
          </div>
          <div key={session.lastRound?.id ?? 0} className="slot-atmosphere" aria-hidden="true">
            {Array.from({ length: 12 }, (_, index) => <i key={index} style={{ "--particle-x": `${5 + (index * 37) % 90}%`, "--particle-y": `${8 + (index * 23) % 80}%`, "--particle-delay": `${-index * 0.67}s`, "--particle-size": `${3 + index % 4}px` } as CSSProperties} />)}
          </div>
        </div>
        {session.freeSpins > 0 && <p className="slot-free-spins slot-grid-notice" role="status"><span>{theme.emblem}</span> {session.freeSpins} giros gratis restantes · apuesta {chips(session.featureBetCents)}</p>}
          {!spinning && wins.length === 0 && message && !session.pendingBonus && !bonusReveal && !session.freeSpins && <p role="status" aria-live="polite" className="slot-grid-notice">{message}</p>}
          {wins.length > 0 && prizeReadyRound === session.lastRound?.id && dismissedPrizeRound !== session.lastRound?.id && !betOpen && <div className="slot-prize-overlay" style={{ position: "absolute", inset: 0, zIndex: 6, display: "grid", placeItems: "center", pointerEvents: "none" }}><SlotPrizeCard onDismiss={() => { setDismissedPrizeRound(session.lastRound!.id); spinButton.current?.focus({ preventScroll: true }); }} badge={prizeBadges[session.lastRound!.payoutCents >= session.lastRound!.betCents * 20 ? 2 : session.lastRound!.payoutCents >= session.lastRound!.betCents * 5 ? 1 : 0]} key={session.lastRound!.id} game={game} theme={theme} amount={session.lastRound!.payoutCents} format={chips} duration={(autoRemaining ? 350 : 1400) / speed}>
          {wins.length > 1 ? <p><strong>{wins.length} líneas ganadoras</strong><small>Líneas {wins.map(win => win.line + 1).join(", ")} · premios sumados</small></p> : wins.map((win) => <p key={win.line}><strong>Línea {win.line + 1} · {engine.columns === 3 ? lineNames[win.line] : `${win.count} consecutivos`}</strong><small>{game.symbols[win.symbol]} · {win.multiplier}× la apuesta{session.lastRound!.grid.some((symbol, index) => symbol === 6 && (win.cells ?? PAYLINES[win.line]).some((cell) => cell === index)) ? " · con WILD" : ""}</small></p>)}
        </SlotPrizeCard></div>}
        {(session.pendingBonus || bonusReveal) && <div className="slot-bonus-layer"><SlotBonus game={game} theme={theme} reveal={bonusReveal} onPick={pickBonus} onContinue={() => { setBonusReveal(null); requestAnimationFrame(() => { spinButton.current?.focus({ preventScroll: true }); board.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }); }); }} format={chips} /></div>}
          {betOpen && <SlotChipPicker options={availableBets} value={bet} theme={theme} chipArt={chipArt} buttonArt={buttonArt} trigger={betTrigger} format={chips} onClose={() => setBetOpen(false)} onConfirm={(amount) => {
            if (spinLock.current || auto.current.remaining || sessionRef.current.pendingBonus || sessionRef.current.freeSpins || !availableBets.includes(amount)) return;
            setBet(amount);
            setBetOpen(false);
          }} />}
        </div>


        {isPolished && <SkinRoundMetrics bet={activeBet} payout={session.lastRound?.payoutCents ?? 0} spinning={spinning} lines={PAYLINES.length} format={chips} />}
        {autoOpen && !autoRemaining && <form ref={autoForm} className="slot-settings-panel slot-auto-panel grid grid-cols-2 gap-3 rounded-2xl border border-white/15 bg-[#101522] p-4 text-xs" onSubmit={(event) => { event.preventDefault(); startAuto(); }}>{isPolished && <><button type="button" className="slot-settings-close" aria-label="Cerrar configuración de autojuego" onClick={() => setAutoOpen(false)}>×</button><h2 className="col-span-2 font-bold">Autojuego</h2></>}<label className="col-span-2 grid gap-1 text-slate-300">Máximo de giros<select value={autoCount} onChange={(event) => setAutoCount(Number(event.target.value))} className={buttonClass}>{[10, 20, 50, 100].map((count) => <option key={count} value={count}>{count} giros</option>)}</select></label><label className="grid gap-1 text-slate-300">Parar al perder<input required type="number" min="1" step="1" value={lossLimit} onChange={(event) => setLossLimit(event.target.value)} className="min-w-0 rounded-lg border border-white/15 bg-black/30 p-2" /></label><label className="grid gap-1 text-slate-300">Parar al ganar<input required type="number" min="1" step="1" value={profitLimit} onChange={(event) => setProfitLimit(event.target.value)} className="min-w-0 rounded-lg border border-white/15 bg-black/30 p-2" /></label><p className="col-span-2 text-[10px] leading-5 text-slate-400">Los límites se miden desde el saldo al iniciar. Se detiene en bonos, giros gratis, saldo insuficiente o al ocultar esta pestaña. Nunca hay autojuego infinito.</p><button className="col-span-2 rounded-xl py-2 font-bold text-black" style={{ background: game.accent }}>Iniciar autojuego</button></form>}
        {rulesOpen && <section ref={rulesSection} tabIndex={-1} className="slot-settings-panel slot-rules-panel space-y-4 rounded-2xl border border-white/15 bg-[#101522] p-4 text-xs">
          {isPolished && <button type="button" className="slot-settings-close" aria-label="Cerrar tabla de pagos" onClick={() => setRulesOpen(false)}>×</button>}
          {engine.columns === 5 ? <SlotEditionRules game={game} theme={theme} bet={activeBet} format={chips} /> : <>
          <h2 className="font-bold">Reglas y pagos</h2>
          <p className="slot-rules-intro">Tres símbolos iguales en una línea pagan. Hay cinco líneas: tres filas y dos diagonales. El multiplicador se aplica a tu apuesta total.</p>
          <div className="slot-pay-table">
            {MULTIPLIERS.map((multiplier, symbol) => <div key={symbol} className="slot-pay-card">
              <SymbolTile game={game} symbol={symbol} className="slot-pay-symbol" />
              <p className="slot-pay-name">{game.symbols[symbol]}</p>
              <strong className="slot-pay-multiplier">{multiplier}×</strong>
              <p className="slot-pay-amount">{chips(activeBet * multiplier)} fichas</p>
            </div>)}
          </div>
          <p className="slot-pay-caption">Premios por 3 iguales · apuesta actual: {chips(activeBet)} fichas.</p>
          <div className="slot-special-rules">
            <div className="slot-special-rule"><SymbolTile game={game} symbol={6} className="slot-special-symbol" /><div><h3>WILD y bono</h3><p>Reemplaza símbolos normales. Tres símbolos WILD especiales activan «{theme.bonus.title}»: de 1× a 5×, sin costo extra. Premio fijado antes de elegir; las tres opciones tienen la misma probabilidad.</p></div></div>
            <div className="slot-special-rule"><SymbolTile game={game} symbol={7} className="slot-special-symbol" /><div><h3>Giros gratis</h3><p>Tres símbolos de giros gratis dan {FREE_SPINS_AWARD} giros con la apuesta que los activó. No descuentan fichas ni se reactivan.</p></div></div>
          </div>
          </>}
        </section>}
        {!session.balanceCents && !session.freeSpins && !session.pendingBonus && !bonusReveal && <button type="button" className="w-full rounded-xl border border-amber-300/30 p-3 text-sm font-bold text-amber-200" onClick={resetDemo}>Recibir 10.000 fichas demo</button>}
        <div className="slot-control-dock slot-control-dock-theme" inert={betOpen} style={{ "--slot-dock-background": `url("${game.banner}")`, "--slot-button-art": `url("${buttonArt}")`, "--slot-spin-art": `url("${spinArt}")`, "--slot-chip-art": `url("${chipArt}")`, "--slot-dock-art": `url("${game.sprite}")`, "--slot-dock-symbol": `${theme.bonus.symbol * 100 / 7}% 50%` } as CSSProperties}>
          <div className="slot-dock-brand" aria-hidden="true"><span>{theme.emblem}</span><span>{game.name}</span><span className="slot-dock-brand-line" /></div>
          <div className="slot-primary-controls slot-layout-grid">
            <div className="slot-bet-control"><span>APUESTA</span><div className="slot-selected-chip-wrap">{isPolished && <button type="button" className="slot-lumen-quick-chip" aria-label={`Apostar ${chips(quickLeft)} fichas`} disabled={locked || session.freeSpins > 0} onClick={() => setBet(quickLeft)}><span>{slotChipLabel(quickLeft)}</span></button>}<button ref={betTrigger} type="button" className="slot-bet-trigger" style={{ "--selected-chip-characters": Math.max(3, slotChipLabel(activeBet).length), "--selected-chip-hue": `${Math.max(0, availableBets.indexOf(activeBet)) % 3 * 9 - 9}deg` } as CSSProperties} aria-label={`Elegir apuesta: ${chips(activeBet)} fichas`} aria-haspopup="dialog" aria-expanded={betOpen} disabled={locked || session.freeSpins > 0} onClick={() => { setAutoOpen(false); setRulesOpen(false); setBetOpen(true); }}><span className="slot-selected-chip-value" aria-hidden="true">{slotChipLabel(activeBet)}</span></button>{isPolished && <button type="button" className="slot-lumen-quick-chip" aria-label={`Apostar ${chips(quickRight)} fichas`} disabled={locked || session.freeSpins > 0} onClick={() => setBet(quickRight)}><span>{slotChipLabel(quickRight)}</span></button>}</div>{isPolished && <small className="slot-lumen-active-bet">Activa: {chips(activeBet)}</small>}</div>
            <fieldset className="slot-speed-control slot-speed-cycle"><legend>VELOCIDAD</legend><div><button type="button" disabled={spinning || !!session.pendingBonus || !!bonusReveal || betOpen} data-speed={speed} aria-label={`Velocidad actual por ${speed}. Cambiar a por ${speed === 3 ? 1 : speed + 1}`} onClick={() => { if (spinLock.current || sessionRef.current.pendingBonus) return; setSpeed((current) => current === 3 ? 1 : current === 1 ? 2 : 3); }}><span aria-live="polite" aria-atomic="true">×{speed}</span></button></div></fieldset>
            <button ref={spinButton} type="button" onClick={performSpin} disabled={locked || (!session.freeSpins && session.balanceCents < bet)} className="slot-spin-button"><span aria-hidden="true" className={`slot-spin-icon ${spinning ? "is-rotating" : ""}`}>{isPolished ? <SkinSpinGlyph /> : "↻"}</span><span className="slot-spin-label">{spinning ? "GIRANDO" : session.freeSpins ? "GIRO GRATIS" : "GIRAR"}</span></button>
          <div className="slot-secondary-controls">
            <button type="button" disabled={!autoRemaining && (spinning || !!session.pendingBonus || !!bonusReveal || session.freeSpins > 0)} aria-expanded={autoRemaining ? undefined : autoOpen} onClick={() => autoRemaining ? stopAuto("Autojuego detenido. El giro en curso se completa.") : setAutoOpen(!autoOpen)} className={`${buttonClass} slot-auto-action`}>{autoRemaining ? `Detener · ${autoRemaining}` : isPolished ? "Auto" : "Autojuego"}</button>
            <button type="button" aria-pressed={sound} onClick={() => setSound(!sound)} className={`${buttonClass} slot-sound-action`}>Sonido {sound ? "sí" : "no"}</button>
            {!isPolished && <button type="button" aria-expanded={rulesOpen} onClick={() => setRulesOpen(!rulesOpen)} className={`${buttonClass} slot-rules-action`} aria-label="Reglas y premios">Reglas</button>}
          </div>
          </div>
          {sound && <label className="slot-volume"><span>Volumen</span><input type="range" min="0" max="100" step="5" value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label="Volumen del juego" aria-valuetext={`${volume}%`} /><output>{volume}%</output></label>}
        </div>
      </div>
      <footer className="border-t border-white/10 px-4 py-3 text-center text-[9px] text-slate-500">Solo demostración · Sin apuestas reales · RTP {(rtp / 100).toFixed(2)}% · Motor {`${engine.edition} · ${engine.columns}×${engine.rows}`}</footer>
    </>}
  </div>;
}
