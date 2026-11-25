"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  PLINKO_RISKS, PLINKO_ROWS, PLINKO_ROW_OPTIONS, playPlinko, plinkoMultipliers,
  type PlinkoRisk, type PlinkoRound, type PlinkoRows,
} from "@homebet/proveedores/plinko-engine";
import { engineDemos } from "./engine-demos";
import styles from "./plinko-demo.module.css";

const STARTING_CREDITS = 1_000;
const STAKES = [10, 25, 50, 100] as const;
const AUTO_COUNTS = [5, 10, 25] as const;
const RISK_LABELS = { low: "Bajo", medium: "Medio", high: "Alto" };
const format = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2 });
const signedFormat = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2, signDisplay: "exceptZero" });
const AUTO_PAUSE = 750;
const ENTRY = { x: 50, y: 0 };
const CONTACT = "calc(100% + 9px)";

type Round = { id: number; stake: number; payout: number; result: PlinkoRound };
type AutoBatch = {
  total: number;
  completed: number;
  startBalance: number;
  stopRequested: boolean;
  outcome: { balance: number; reason: "completed" | "stopped" | "balance" } | null;
};
const durationFor = (rows: PlinkoRows) => 125 * rows;
const payoutFor = (stake: number, multiplier: number) => Math.round(stake * multiplier * 100) / 100;

function coordinates(position: number, depth: number, rows: PlinkoRows) {
  return {
    x: 50 + ((position - depth / 2) * 100) / (rows + 1),
    y: 7 + (91 * depth) / rows,
  };
}

function flightPoints(path: readonly number[], rows: PlinkoRows) {
  const finish = coordinates(path[rows], rows, rows);
  const gaps = path.slice(1).map((nextPosition, depth) => ({
    // The next row's pins sit halfway between the current row's pins.
    x: coordinates(nextPosition, depth + 1, rows).x,
    y: coordinates(path[depth], depth, rows).y,
  }));
  return [ENTRY, ...gaps, finish];
}

function flightKeyframes(path: readonly number[], rows: PlinkoRows): Keyframe[] {
  const [start, ...points] = flightPoints(path, rows);
  const frame = ({ x, y }: typeof start, offset: number): Keyframe => ({ left: `${x}%`, top: `${y}%`, offset });
  const keyframes = [frame(start, 0)];
  let previous = start;
  for (const [index, point] of points.entries()) {
    const endsAt = (index + 1) / points.length;
    if (index === points.length - 1) {
      keyframes[keyframes.length - 1].easing = "ease-in";
    } else if (point.x !== previous.x) {
      // Keep the exact gap at each row, rounding the lateral motion between rows.
      for (const step of [0.25, 0.5, 0.75]) {
        const eased = step * step * (3 - 2 * step);
        keyframes.push(frame({
          x: previous.x + (point.x - previous.x) * eased,
          y: previous.y + (point.y - previous.y) * step,
        }, (index + step) / points.length));
      }
    }
    keyframes.push(index === points.length - 1 ? { ...frame(point, endsAt), top: CONTACT } : frame(point, endsAt));
    previous = point;
  }
  return keyframes;
}

function OrbitBoard({ rows, risk, round, moving, onPeg, onLanded }: {
  rows: PlinkoRows; risk: PlinkoRisk; round: Round | null; moving: boolean;
  onPeg: (depth: number) => void; onLanded: () => void;
}) {
  const ball = useRef<HTMLSpanElement>(null);
  const pins = useRef<HTMLDivElement>(null);
  const landedRound = moving ? null : round;
  const position = landedRound ? coordinates(landedRound.result.slot, rows, rows) : ENTRY;
  const table = plinkoMultipliers(rows, risk);

  useEffect(() => {
    if (!moving || !round) return;
    const path = round.result.path;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !ball.current?.animate) {
      const timer = window.setTimeout(onLanded, 0);
      return () => window.clearTimeout(timer);
    }
    const duration = durationFor(rows);
    const animation = ball.current.animate(flightKeyframes(path, rows), { duration, fill: "both" });
    let cancelled = false;
    let frame = 0;
    let depth = 0;
    function flashPeg() {
      if (cancelled) return;
      const elapsed = Number(animation.currentTime);
      const passed = Math.min(rows, Math.floor((elapsed / duration) * (rows + 1)));
      if (passed > depth) {
        const lastPeg = passed - 1;
        const index = (lastPeg * (lastPeg + 1)) / 2 + path[lastPeg];
        pins.current?.children[index]?.animate([
          { scale: "1.45", backgroundColor: "#a9ffff", boxShadow: "0 0 .5rem #70faff" },
          { scale: "1", backgroundColor: "#f3d9ff", boxShadow: "" },
        ], { duration: 145, easing: "ease-out" });
        onPeg(lastPeg);
        depth = passed;
      }
      if (depth < rows) frame = window.requestAnimationFrame(flashPeg);
    }
    frame = window.requestAnimationFrame(flashPeg);
    void animation.finished.then(() => { if (!cancelled) onLanded(); }, () => undefined);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      animation.cancel();
    };
  }, [moving, onLanded, onPeg, round, rows]);

  return (
    <section className={styles.board} aria-label={`Tablero de Plinko de ${rows} filas`}>
      <div ref={pins} className={styles.field} aria-hidden="true">
        {Array.from({ length: rows }, (_, depth) =>
          Array.from({ length: depth + 1 }, (_, index) => {
            const { x, y } = coordinates(index, depth, rows);
            return (
              <i key={`${depth}-${index}`} className={styles.pin}
                style={{ left: `${x}%`, top: `${y}%` }} />
            );
          }),
        )}
        <span ref={ball} className={styles.ball} data-moving={moving} data-landed={!!landedRound}
          style={{ left: `${position.x}%`, top: landedRound ? "calc(100% + 4px)" : `${position.y}%` }} />
      </div>
      <ol className={styles.slots} data-dense={rows === 12} aria-label="Multiplicadores de izquierda a derecha"
        style={{ gridTemplateColumns: `repeat(${table.length}, minmax(0, 1fr))` }}>
        {table.map((multiplier, slot) => {
          const landed = !moving && round?.result.slot === slot;
          return (
            <li key={slot} data-active={landed} data-edge={slot === 0 || slot === table.length - 1}>
              {format.format(multiplier)}×
              {landed && <i key={round.id} className={styles.impact} aria-hidden="true"
                data-impact={multiplier > 1 ? "win" : multiplier === 1 ? "even" : "loss"} />}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function WinToast({ round }: { round: Round }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1_800);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return (
    <div className={styles.winToast}>
      <strong>Ganaste {signedFormat.format(round.payout - round.stake)} cr.</strong>
      <span>Cobraste {format.format(round.payout)} cr. · {format.format(round.result.multiplier)}×</span>
    </div>
  );
}

export function PlinkoDemo() {
  const [rows, setRows] = useState<PlinkoRows>(PLINKO_ROWS);
  const [risk, setRisk] = useState<PlinkoRisk>("medium");
  const [stake, setStake] = useState<number>(STAKES[0]);
  const [balance, setBalance] = useState(STARTING_CREDITS);
  const [pending, setPending] = useState<Round | null>(null);
  const [shown, setShown] = useState<Round | null>(null);
  const [history, setHistory] = useState<Round[]>([]);
  const [autoCount, setAutoCount] = useState<number>(AUTO_COUNTS[0]);
  const [batch, setBatch] = useState<AutoBatch | null>(null);
  const [sound, setSound] = useState(false);
  const [panel, setPanel] = useState<"rules" | "menu" | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const soundEnabled = useRef(false);
  const last = history[0];
  const auto = !!batch && !batch.stopRequested && !batch.outcome;
  const autoRemaining = auto ? batch.total - batch.completed : 0;
  const locked = !!pending || auto;
  const affordable = stake <= balance;

  useEffect(() => () => { void audio.current?.close().catch(() => undefined); }, []);

  const playTone = useCallback((pitch: number, endPitch: number, level: number, duration: number) => {
    const context = audio.current;
    if (!soundEnabled.current || !context || context.state !== "running") return;
    const tone = context.createOscillator();
    const volume = context.createGain();
    tone.frequency.setValueAtTime(pitch, context.currentTime);
    tone.frequency.exponentialRampToValueAtTime(endPitch, context.currentTime + duration * 0.8);
    volume.gain.setValueAtTime(level, context.currentTime);
    volume.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    tone.connect(volume).connect(context.destination);
    tone.start();
    tone.stop(context.currentTime + duration + 0.01);
  }, []);

  const tapPeg = useCallback((depth: number) => {
    const pitch = 580 + (depth % 4) * 55;
    playTone(pitch, pitch * 0.8, 0.014, 0.04);
  }, [playTone]);

  const play = useCallback(() => {
    if (pending || !affordable) return;
    const result = playPlinko(rows, risk);
    setBalance(balance - stake);
    setPending({ id: (last?.id ?? 0) + 1, stake, payout: payoutFor(stake, result.multiplier), result });
  }, [affordable, balance, last, pending, risk, rows, stake]);

  const settle = useCallback(() => {
    if (!pending) return;
    const nextBalance = balance + pending.payout;
    setBalance(nextBalance);
    setShown(pending);
    setHistory((rounds) => [pending, ...rounds].slice(0, 8));
    setPending(null);
    setBatch((current) => {
      if (!current || current.outcome) return current;
      const completed = current.completed + 1;
      const reason = current.stopRequested ? "stopped" : completed === current.total ? "completed" : nextBalance < stake ? "balance" : null;
      return { ...current, completed, outcome: reason ? { balance: nextBalance, reason } : null };
    });

    const multiplier = pending.result.multiplier;
    const pitch = multiplier > 1 ? 560 + Math.min(240, multiplier * 16) : multiplier === 1 ? 450 : 300;
    playTone(pitch, pitch * (multiplier > 1 ? 1.42 : multiplier === 1 ? 1.1 : 0.7), multiplier > 1 ? 0.085 : 0.05, 0.2);
  }, [balance, pending, playTone, stake]);

  useEffect(() => {
    if (!autoRemaining || pending || !affordable) return;
    const timer = window.setTimeout(play, AUTO_PAUSE);
    return () => window.clearTimeout(timer);
  }, [affordable, autoRemaining, pending, play]);

  function toggleSound() {
    if (typeof AudioContext === "undefined") return;
    const next = !soundEnabled.current;
    soundEnabled.current = next;
    setSound(next);
    if (next) {
      audio.current ??= new AudioContext();
      void audio.current.resume().catch(() => {
        soundEnabled.current = false;
        setSound(false);
      });
    }
  }

  function reset() {
    if (locked) return;
    setBalance(STARTING_CREDITS);
    setStake(STAKES[0]);
    setRows(PLINKO_ROWS);
    setRisk("medium");
    setAutoCount(AUTO_COUNTS[0]);
    setBatch(null);
    setShown(null);
    setHistory([]);
    setPanel(null);
  }

  function toggleAuto() {
    if (auto) {
      setBatch({
        ...batch,
        stopRequested: true,
        outcome: pending ? null : { balance, reason: "stopped" },
      });
      return;
    }
    if (pending || !affordable) return;
    setBatch({ total: autoCount, completed: 0, startBalance: balance, stopRequested: false, outcome: null });
    play();
  }

  return (
    <div className={styles.game} data-mobile-demo>
      <div className={styles.hud}>
        <div className={styles.totals}>
          <div><span aria-hidden="true">🪙</span><div><small>Saldo</small><strong>{format.format(balance)} <span>créditos</span></strong></div></div>
          <div><span aria-hidden="true">🏆</span><div><small>Último pago</small><strong>{last ? format.format(last.payout) : "—"} <span>créditos</span></strong></div></div>
        </div>
        <button type="button" onClick={() => setPanel(panel === "rules" ? null : "rules")} aria-label="Cómo se juega"
          aria-expanded={panel === "rules"} aria-controls="orbit-rules">i</button>
        <button type="button" onClick={toggleSound} aria-label="Sonido" aria-pressed={sound}>{sound ? "🔊" : "🔇"}</button>
        <button type="button" onClick={() => setPanel(panel === "menu" ? null : "menu")} aria-label="Menú"
          aria-expanded={panel === "menu"} aria-controls="orbit-menu">☰</button>
      </div>

      <section id="orbit-rules" className={styles.popover} hidden={panel !== "rules"}>
        <h2>Cómo se juega</h2>
        <p>{engineDemos.plinko.rules} El riesgo cambia los pagos de las casillas.</p>
        <table className={styles.history}>
          <caption>Pagos con {rows} filas y {format.format(stake)} créditos de apuesta</caption>
          <thead><tr><th scope="col">Riesgo</th><th scope="col">Centro</th><th scope="col">Cada extremo</th></tr></thead>
          <tbody>{PLINKO_RISKS.map((level) => {
            const table = plinkoMultipliers(rows, level);
            return (
              <tr key={level} data-selected={risk === level}>
                <th scope="row">{RISK_LABELS[level]}{risk === level && <span className="sr-only"> (seleccionado)</span>}</th>
                <td>{format.format(payoutFor(stake, table[rows / 2]))} cr.</td>
                <td>{format.format(payoutFor(stake, table[0]))} cr.</td>
              </tr>
            );
          })}</tbody>
        </table>
        <p>Auto juega una tanda de 5, 10 o 25 rondas y se detiene al completarla, cuando lo parás o si el saldo ya no alcanza.</p>
      </section>
      <section id="orbit-menu" className={styles.popover} hidden={panel !== "menu"}>
        <Link href="/juegos">← Volver al taller</Link>
        <h2 id="orbit-history">Últimas jugadas</h2>
        {history.length ? (
          <table className={styles.history} aria-labelledby="orbit-history">
            <thead><tr><th scope="col">Apuesta</th><th scope="col">Multiplicador</th><th scope="col">Neto</th></tr></thead>
            <tbody>{history.map(({ id, stake, payout, result }) => {
              const net = payout - stake;
              return (
                <tr key={id}>
                  <td>{format.format(stake)} cr.</td>
                  <td>{format.format(result.multiplier)}×</td>
                  <td data-net={Math.sign(net)}>{signedFormat.format(net)} cr.</td>
                </tr>
              );
            })}</tbody>
          </table>
        ) : <p>Todavía no hay jugadas.</p>}
      </section>

      <header className={styles.title}>
        <span className={styles.planet} aria-hidden="true" />
        <h1>Órbita Violeta</h1>
        <p>Plinko demo</p>
      </header>

      <OrbitBoard rows={rows} risk={risk} round={pending ?? shown} moving={!!pending}
        onPeg={tapPeg} onLanded={settle} />

      <div className={styles.notifications} role="status" aria-atomic="true">
        {shown && shown.payout > shown.stake && <WinToast key={shown.id} round={shown} />}
      </div>

      <section className={styles.console} aria-label="Controles de Plinko">
        <div className={styles.summary}>
          <div className={styles.practice}><span aria-hidden="true">🪙</span><div>Saldo de práctica<strong>{format.format(balance)} <small>créditos</small></strong></div></div>
          <label className={styles.rowSelect}>
            <span>Filas</span>
            <select value={rows} disabled={locked} onChange={(event) => { setRows(Number(event.target.value) as PlinkoRows); setShown(null); }}>
              {PLINKO_ROW_OPTIONS.map((count) => <option key={count} value={count}>{count}</option>)}
            </select>
          </label>
        </div>
        <div className={styles.setting} role="group" aria-label="Nivel de riesgo">
          <span>Nivel de riesgo</span>
          <div>
            {PLINKO_RISKS.map((level) => (
              <button key={level} type="button" disabled={locked} aria-pressed={risk === level}
                onClick={() => { if (risk !== level) { setRisk(level); setShown(null); } }}>{RISK_LABELS[level]}</button>
            ))}
          </div>
        </div>
        <div className={styles.setting} role="group" aria-label="Créditos por jugada">
          <span>Apuesta por jugada</span>
          <div>
            {STAKES.map((amount) => (
              <button key={amount} type="button" disabled={locked || amount > balance} aria-pressed={amount === stake} onClick={() => setStake(amount)}>
                {amount}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.setting}>
          <label htmlFor="orbit-auto-count">Rondas en Auto</label>
          <div className={styles.autoSetting}>
            <select id="orbit-auto-count" value={autoCount} disabled={locked} onChange={(event) => setAutoCount(Number(event.target.value))}>
              {AUTO_COUNTS.map((count) => <option key={count} value={count}>{count}</option>)}
            </select>
            <span role="status">{auto && `Quedan ${autoRemaining}`}</span>
          </div>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.play} aria-disabled={locked || !affordable}
            onClick={() => { if (!locked) play(); }}><i aria-hidden="true" /> Soltar esfera</button>
          <button type="button" className={styles.auto} aria-pressed={auto} disabled={!auto && (pending !== null || !affordable)} onClick={toggleAuto}>
            <span aria-hidden="true">⟳</span> {auto ? "Detener" : "Auto"}</button>
        </div>
        {!pending && !affordable && <p className={styles.notice} role="status">{balance < STAKES[0] ? "Reiniciá la demo para recuperar el saldo." : "Elegí una apuesta menor para seguir jugando."}</p>}
      </section>
      {batch?.outcome && (
        <section className={styles.batch} aria-label="Resumen de Auto" role="status">
          <div><strong>Resumen de Auto</strong><span>
            {batch.outcome.reason === "completed" ? "Tanda completada" : batch.outcome.reason === "stopped" ? "Tanda detenida" : "Saldo insuficiente"}
          </span></div>
          <dl>
            <div><dt>Rondas</dt><dd>{batch.completed}/{batch.total}</dd></div>
            <div><dt>Saldo inicial</dt><dd>{format.format(batch.startBalance)}</dd></div>
            <div><dt>Saldo final</dt><dd>{format.format(batch.outcome.balance)}</dd></div>
            <div><dt>Neto</dt><dd>{signedFormat.format(batch.outcome.balance - batch.startBalance)}</dd></div>
          </dl>
        </section>
      )}
      <button type="button" className={styles.reset} disabled={locked} onClick={reset}>⟳ <span>Reiniciar demo</span></button>
    </div>
  );
}
