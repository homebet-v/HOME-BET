"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  canCashOutMines, cashOutMines, minesQuote, MINES_BOARD_SIZE, MINES_CASHOUT_INTERVAL, MINES_OPTIONS, openMinesRound, revealMinesCell,
  type MineCount, type MinesRound,
} from "@homebet/proveedores/mines-engine";
import { DEMO_CHIP_AMOUNTS, DemoChipPicker } from "./demo-chip-picker";
import styles from "./mines-demo.module.css";

const STARTING_BALANCE = 50_000_000;
const MIN_WAGER_CENTS = DEMO_CHIP_AMOUNTS[0] * 100;
const credits = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2 });
const signed = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2, signDisplay: "exceptZero" });
const multiplier = new Intl.NumberFormat("es-PY", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
const percent = new Intl.NumberFormat("es-PY", { style: "percent", maximumFractionDigits: 1 });
const mineLabels = { 3: "Bajo", 5: "Medio", 8: "Alto" };

type Session = { balance: number; round: MinesRound | null; history: readonly MinesRound[] };

function newSession(): Session {
  return { balance: STARTING_BALANCE, round: null, history: [] };
}

function settleRound(session: Session, round: MinesRound): Session {
  if (round.phase === "playing") return { ...session, round };
  return {
    round,
    balance: session.balance + round.payoutCents,
    history: [round, ...session.history].slice(0, 8),
  };
}

function cellAppearance(round: MinesRound | null, cell: number) {
  if (!round) return "sealed";
  if (round.gems.includes(cell)) return "gem";
  if (round.phase === "playing") return "sealed";
  if (round.hit === cell) return "hit";
  return round.mines.includes(cell) ? "mine" : "safe";
}

const cellLabels = { sealed: "cerrada", gem: "gema encontrada", hit: "mina activada", mine: "mina", safe: "gema sin recoger" };

function RoundAlert({ round }: { round: MinesRound }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 2_300);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;
  const won = round.phase === "cashed";
  const completed = round.gems.length + round.mines.length === MINES_BOARD_SIZE;
  return (
    <div className={styles.roundAlert} data-outcome={won ? "win" : "loss"}>
      <i aria-hidden="true" />
      <strong>{won ? (completed ? "¡Bóveda completa!" : "¡Cobro confirmado!") : "Encontraste una mina"}</strong>
      {won ? (
        <><span>Cobraste {credits.format(round.payoutCents / 100)} cr.</span>
          <b>Neto {signed.format((round.payoutCents - round.wagerCents) / 100)} cr.</b></>
      ) : <span>Perdiste {credits.format(round.wagerCents / 100)} cr. en esta ronda.</span>}
    </div>
  );
}

export function MinesDemo() {
  const [session, setSession] = useState(newSession);
  const [stake, setStake] = useState(MIN_WAGER_CENTS);
  const [mineCount, setMineCount] = useState<MineCount>(MINES_OPTIONS[0]);
  const [sound, setSound] = useState(false);
  const [panel, setPanel] = useState<"rules" | "history" | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const action = useRef<HTMLButtonElement>(null);
  const { balance, round, history } = session;
  const playing = round?.phase === "playing";
  const quote = round ? minesQuote(round) : null;
  const found = round?.gems.length ?? 0;
  const affordable = stake <= balance;
  const activeMineCount = round?.mines.length ?? mineCount;
  const canCollect = !!round && canCashOutMines(round);
  const untilCollect = Math.min(MINES_CASHOUT_INTERVAL - found % MINES_CASHOUT_INTERVAL, MINES_BOARD_SIZE - activeMineCount - found);

  useEffect(() => () => { void audio.current?.close().catch(() => undefined); }, []);
  useEffect(() => {
    const focused = document.activeElement;
    if (playing && focused === action.current) {
      grid.current?.querySelector("button")?.focus({ preventScroll: true });
    } else if (!playing && grid.current?.contains(focused)) {
      action.current?.focus({ preventScroll: true });
    }
  }, [playing]);

  function toggleSound() {
    if (sound) { setSound(false); return; }
    if (typeof AudioContext === "undefined") return;
    audio.current ??= new AudioContext();
    void audio.current.resume().then(() => setSound(true), () => setSound(false));
  }

  function playSound(outcome: "gem" | "cashed" | "lost") {
    const context = audio.current;
    if (!sound || context?.state !== "running") return;
    const tone = context.createOscillator();
    const envelope = context.createGain();
    const now = context.currentTime;
    const start = outcome === "lost" ? 142 : outcome === "cashed" ? 525 : 640;
    const end = outcome === "lost" ? 65 : outcome === "cashed" ? 880 : 925;
    const duration = outcome === "gem" ? 0.14 : 0.28;
    tone.frequency.setValueAtTime(start, now);
    tone.frequency.exponentialRampToValueAtTime(end, now + duration * 0.8);
    envelope.gain.setValueAtTime(0.06, now);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + duration);
    tone.connect(envelope).connect(context.destination);
    tone.start();
    tone.stop(now + duration + 0.01);
  }

  function begin() {
    if (playing || !affordable) return;
    const next = openMinesRound(stake, mineCount);
    setSession((current) => current.round?.phase === "playing" || stake > current.balance
      ? current
      : { ...current, balance: current.balance - stake, round: next });
  }

  function reveal(cell: number) {
    if (!round || !playing || round.gems.includes(cell)) return;
    const next = revealMinesCell(round, cell);
    playSound(next.phase === "playing" ? "gem" : next.phase);
    setSession((current) => current.round === round ? settleRound(current, next) : current);
  }

  function collect() {
    if (!round || !canCollect) return;
    const next = cashOutMines(round);
    playSound("cashed");
    setSession((current) => current.round === round ? settleRound(current, next) : current);
  }

  function chooseMines(count: MineCount) {
    setMineCount(count);
    setSession((current) => current.round?.phase === "playing" ? current : { ...current, round: null });
  }

  function reset() {
    if (playing) return;
    setSession(newSession());
    setStake(MIN_WAGER_CENTS);
    setMineCount(MINES_OPTIONS[0]);
    setPanel(null);
  }

  return (
    <div className={styles.game} data-mobile-demo>
      <header className={styles.hud}>
        <Link href="/juegos" className={styles.back}><span aria-hidden="true">‹</span> Taller</Link>
        <div className={styles.balance}><span>Saldo de práctica</span><strong>{credits.format(balance / 100)} <small>cr.</small></strong></div>
        <button type="button" aria-expanded={panel === "rules"} aria-controls="mines-rules" aria-label="Cómo se juega"
          onClick={() => setPanel(panel === "rules" ? null : "rules")}><span className={styles.infoIcon} aria-hidden="true">i</span></button>
        <button type="button" aria-pressed={sound} aria-label="Sonido" onClick={toggleSound}>
          <span className={styles.soundIcon} data-enabled={sound} aria-hidden="true"><i /></span>
        </button>
        <button type="button" aria-expanded={panel === "history"} aria-controls="mines-history" aria-label="Historial de rondas"
          onClick={() => setPanel(panel === "history" ? null : "history")}><span className={styles.historyIcon} aria-hidden="true" /></button>
      </header>

      <section id="mines-rules" className={styles.popover} hidden={panel !== "rules"}>
        <h2>Cómo se juega</h2>
        <ol>
          <li>Elegí cuántas minas esconder y cuántos créditos apostar.</li>
          <li>Abrí casillas. Cada gema aumenta el cobro. Una mina termina la ronda y perdés la apuesta.</li>
          <li>Podés cobrar al encontrar 5, 10, 15 o 20 gemas. Si encontrás todas las gemas del tablero, la bóveda paga automáticamente.</li>
        </ol>
        <p>Cada tablero se mezcla al iniciar la ronda. El cobro incluye la apuesta y aplica un factor del 97 % sobre el pago justo, con redondeo hacia abajo.</p>
      </section>
      <section id="mines-history" className={styles.popover} hidden={panel !== "history"}>
        <h2>Últimas rondas</h2>
        {history.length ? (
          <table aria-label="Resultados de las últimas rondas">
            <thead><tr><th>Minas</th><th>Gemas</th><th>Apuesta</th><th>Neto</th></tr></thead>
            <tbody>{history.map((entry, index) => {
              const net = entry.payoutCents - entry.wagerCents;
              return <tr key={index}>
                <td>{entry.mines.length}</td><td>{entry.gems.length}</td>
                <td>{credits.format(entry.wagerCents / 100)} cr.</td>
                <td data-net={Math.sign(net)}>{signed.format(net / 100)} cr.</td>
              </tr>;
            })}</tbody>
          </table>
        ) : <p>Todavía no hay rondas terminadas.</p>}
      </section>

      <div className={styles.title}>
        <h1><span>Bóveda</span> <span>de Jade</span></h1>
        <span className={styles.divider} aria-hidden="true"><i /></span>
      </div>
      <div className={styles.alertLayer} role="status" aria-atomic="true">
        {round && !playing && <RoundAlert round={round} />}
      </div>

      <div className={styles.layout}>
        <section className={styles.board} aria-label="Bóveda de 25 casillas">
          <div className={styles.boardHud}>
            <span><i className={styles.miniGem} aria-hidden="true" /> Gemas <b>{found}/{MINES_BOARD_SIZE - activeMineCount}</b></span>
            <span><i className={styles.miniMine} aria-hidden="true" /> Minas <b>{activeMineCount}</b></span>
          </div>
          <div ref={grid} className={styles.grid} role="group" aria-label="Casillas de la bóveda">
            {Array.from({ length: MINES_BOARD_SIZE }, (_, cell) => {
              const appearance = cellAppearance(round, cell);
              const open = playing && appearance === "sealed";
              return (
                <button key={cell} type="button" className={styles.cell} data-cell={appearance}
                  aria-label={`Casilla ${cell + 1}, ${cellLabels[appearance]}`}
                  aria-disabled={!open} tabIndex={playing ? 0 : -1} onClick={() => reveal(cell)}>
                  <span aria-hidden="true" />
                </button>
              );
            })}
          </div>
          {(!round || playing) && <div className={styles.status} role="status" aria-atomic="true">
            {playing ? (
              <><strong>{found === 0 ? "Elegí la primera casilla" : `${found} ${found === 1 ? "gema encontrada" : "gemas encontradas"}`}</strong>
                <span>{canCollect ? "Cobrá o seguí hasta el siguiente punto de cobro."
                  : untilCollect === 1 ? "Falta 1 gema para cobrar." : `Faltan ${untilCollect} gemas para cobrar.`}</span></>
            ) : <strong>Iniciá una ronda para abrir la bóveda</strong>}
          </div>}
        </section>

        <section className={styles.console} aria-label="Controles de Minas">
          <div className={styles.settings} hidden={playing}>
            <fieldset disabled={playing}>
              <legend>Minas ocultas</legend>
              <div className={styles.mineChoices}>
                {MINES_OPTIONS.map((count) => (
                  <button type="button" key={count} aria-pressed={mineCount === count} onClick={() => chooseMines(count)}>
                    <strong><i className={styles.miniMine} aria-hidden="true" /> {count}</strong><span>{mineLabels[count]}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <DemoChipPicker options={DEMO_CHIP_AMOUNTS} value={stake / 100} balance={balance / 100} disabled={!!playing}
              onChange={(amount) => setStake(amount * 100)} />
          </div>
          {playing && quote && (
            <div className={styles.payout} data-ready={canCollect}>
              <div><span>Cobro disponible</span><strong>{canCollect ? credits.format(quote.payoutCents / 100) : "—"} <small>cr.</small></strong></div>
              <div className={styles.rate}><strong>{canCollect ? `${multiplier.format(quote.multiplier)}×` : "—"}</strong>
                <span>{percent.format(quote.nextSafeProbability)} de hallar gema</span></div>
            </div>
          )}
          {playing ? (
            <button ref={action} type="button" className={styles.primary} aria-disabled={!canCollect} onClick={collect}>
              {canCollect && quote ? `Cobrar ${credits.format(quote.payoutCents / 100)} cr.` : "Cobrar"}
            </button>
          ) : (
            <button ref={action} type="button" className={styles.primary} aria-disabled={!affordable} onClick={begin}>
              {round ? "Abrir otra bóveda" : "Abrir bóveda"}
            </button>
          )}
          <div className={styles.footer}>
            {!playing && !affordable && <p role="status">{balance < MIN_WAGER_CENTS ? "Reiniciá la demo para recuperar el saldo." : "Elegí una apuesta más baja para seguir."}</p>}
            <button type="button" disabled={playing} onClick={reset}>↻ Reiniciar demo</button>
          </div>
        </section>
      </div>
    </div>
  );
}
