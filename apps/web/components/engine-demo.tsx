"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { rollSevenUpDown, SEVEN_CHOICES, SEVEN_MULTIPLIERS, type SevenChoice, type DiceRound } from "@homebet/proveedores/dice-engine";
import { DEMO_CHIP_AMOUNTS as STAKES, DemoChipPicker } from "./demo-chip-picker";
import { engineDemos } from "./engine-demos";
import styles from "./engine-demo.module.css";

const STARTING_CREDITS = 500_000;
const DICE_DURATION = 820;
const diceChoices = { under: "7 Down", seven: "7 exacto", over: "7 Up" } as const;
const diceRanges = { under: "2–6", seven: "7", over: "8–12" } as const;
const pips = [[4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];
const faces = ["rotateY(0deg)", "rotateX(-90deg)", "rotateY(90deg)", "rotateY(-90deg)", "rotateX(90deg)", "rotateY(180deg)"];
const bevels = ["rotateX(0deg)", "rotateY(90deg)", "rotateZ(90deg)"].flatMap((axis) =>
  [45, 135, 225, 315].map((angle) => `${axis} rotateX(${angle}deg) translateZ(var(--die-bevel-depth))`),
);
const turns = [[0, 0], [90, 0], [0, -90], [0, 90], [-90, 0], [0, 180]];
const credits = new Intl.NumberFormat("es-PY");
const signed = new Intl.NumberFormat("es-PY", { signDisplay: "exceptZero" });

type PlayedRound = { id: number; stake: number; choice: SevenChoice; result: DiceRound };

function diceRotation(value: number, index: number, extraTurns = 0) {
  const [x, y] = turns[value - 1];
  // Yaw in the felt plane after aligning the result face to the camera axis.
  return `rotateX(36deg) rotateZ(${index === 0 ? -17 : 22}deg) rotateX(${x + extraTurns}deg) rotateY(${y + extraTurns}deg)`;
}

function dicePosition(direction: number, atRest: boolean) {
  return atRest ? `translate(${direction * 10}%, -21%) scale(.74)` : "translate(0, 14%) scale(1)";
}

function DiceTray({ previous, pending, onLanded }: {
  previous: DiceRound | undefined; pending: PlayedRound | null; onLanded: () => void;
}) {
  const first = useRef<HTMLSpanElement>(null);
  const second = useRef<HTMLSpanElement>(null);
  const firstValue = previous?.dice[0] ?? 3;
  const secondValue = previous?.dice[1] ?? 5;

  useEffect(() => {
    if (!pending) return;
    const cubes = [first.current, second.current];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !cubes.every((cube) => cube?.animate)) {
      const timer = window.setTimeout(onLanded, 0);
      return () => window.clearTimeout(timer);
    }

    const animations = cubes.flatMap((cube, index) => {
      if (!cube?.parentElement) return [];
      const direction = index === 0 ? -1 : 1;
      const timing = { duration: DICE_DURATION + index * 65, fill: "both" } as const;
      const spin = cube.animate([
        { transform: diceRotation(index === 0 ? firstValue : secondValue, index) },
        { transform: diceRotation(pending.result.dice[index], index, direction * 720) },
      ], { ...timing, easing: "cubic-bezier(.18,.58,.45,1)" });
      const bounce = cube.parentElement.animate([
        { transform: dicePosition(direction, !!previous), offset: 0, easing: "ease-out" },
        { transform: `translate(${direction * 4}%, 10%) scale(1)`, offset: .14, easing: "ease-out" },
        { transform: `translate(${direction * 22}%, -74%) scale(.89)`, offset: .37, easing: "ease-in" },
        { transform: `translate(${direction * 16}%, -11%) scale(.79)`, offset: .63, easing: "ease-out" },
        { transform: `translate(${direction * 12}%, -31%) scale(.76)`, offset: .78, easing: "ease-in" },
        { transform: dicePosition(direction, true), offset: .96 },
        { transform: dicePosition(direction, true), offset: 1 },
      ], timing);
      return [spin, bounce];
    });

    let cancelled = false;
    void Promise.all(animations.map((animation) => animation.finished)).then(() => {
      if (!cancelled) onLanded();
    }, () => undefined);
    return () => {
      cancelled = true;
      animations.forEach((animation) => animation.cancel());
    };
  }, [firstValue, onLanded, pending, previous, secondValue]);

  return (
    <div className={styles.diceTray} aria-hidden="true" data-rolling={!!pending}>
      {[firstValue, secondValue].map((value, index) => (
        <span className={styles.dieSeat} data-settled={!!previous} key={index}>
          <span className={styles.dieBounce} style={{ transform: dicePosition(index === 0 ? -1 : 1, !!previous) }}>
            <span ref={index === 0 ? first : second} className={styles.die} style={{ transform: diceRotation(value, index) }}>
              {faces.map((rotation, face) => (
                <span key={rotation} className={styles.face} data-upper={face + 1 === value}
                  style={{ transform: `${rotation} translateZ(var(--die-half))` }}>
                  {Array.from({ length: 9 }, (_, pip) => <i key={pip} data-pip={pips[face].includes(pip)} />)}
                </span>
              ))}
              {faces.map((rotation) => (
                <span key={rotation} className={styles.glassCore} style={{ transform: `${rotation} translateZ(calc(var(--die-half) - 2px))` }} />
              ))}
              {bevels.map((transform) => <span key={transform} className={styles.glassBevel} style={{ transform }} />)}
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}

export function EngineDemo() {
  const demo = engineDemos.dice;
  const [balance, setBalance] = useState(STARTING_CREDITS);
  const [stake, setStake] = useState<number>(STAKES[0]);
  const [choice, setChoice] = useState<SevenChoice>("under");
  const [history, setHistory] = useState<PlayedRound[]>([]);
  const [pending, setPending] = useState<PlayedRound | null>(null);
  const [sound, setSound] = useState(false);
  const [panel, setPanel] = useState<"rules" | "history" | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const soundEnabled = useRef(false);
  const last = history[0];
  const payout = last ? last.stake * last.result.multiplier : 0;
  const affordable = stake <= balance;

  useEffect(() => () => { void audio.current?.close().catch(() => undefined); }, []);

  const settle = useCallback(() => {
    if (!pending) return;
    setBalance((current) => current + pending.stake * pending.result.multiplier);
    setHistory((current) => [pending, ...current].slice(0, 8));
    setPending(null);

    const context = audio.current;
    if (!soundEnabled.current || context?.state !== "running") return;
    const tone = context.createOscillator();
    const envelope = context.createGain();
    const now = context.currentTime;
    const pitch = pending.result.multiplier ? 390 + pending.result.multiplier * 40 : 200;
    tone.frequency.setValueAtTime(pitch, now);
    tone.frequency.exponentialRampToValueAtTime(pitch * 0.54, now + 0.12);
    envelope.gain.setValueAtTime(0.055, now);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    tone.connect(envelope).connect(context.destination);
    tone.start();
    tone.stop(now + 0.15);
  }, [pending]);

  function toggleSound() {
    if (typeof AudioContext === "undefined") return;
    const enabled = !soundEnabled.current;
    soundEnabled.current = enabled;
    setSound(enabled);
    if (!enabled) return;
    audio.current ??= new AudioContext();
    void audio.current.resume().catch(() => {
      soundEnabled.current = false;
      setSound(false);
    });
  }

  function play() {
    if (pending || !affordable) return;
    const round = { choice, id: (last?.id ?? 0) + 1, stake, result: rollSevenUpDown(choice) };
    setBalance(balance - stake);
    setPending(round);
  }

  function reset() {
    if (pending) return;
    setBalance(STARTING_CREDITS);
    setHistory([]);
    setStake(STAKES[0]);
    setChoice("under");
    setPanel(null);
  }

  return (
    <div className={`${styles.demo} ${styles.dice}`} data-mobile-demo>
      <header className={styles.hud}>
        <div className={styles.balance}><i aria-hidden="true">🪙</i><div><span>Saldo de práctica</span><strong>{credits.format(balance)} <small>cr.</small></strong></div></div>
        <div className={styles.balance}><i aria-hidden="true">🏆</i><div><span>Último pago</span><strong>{last ? credits.format(payout) : "—"} <small>cr.</small></strong></div></div>
        <button type="button" aria-label="Cómo se juega" aria-controls="dice-rules" aria-expanded={panel === "rules"}
          onClick={() => setPanel(panel === "rules" ? null : "rules")}>i</button>
        <button type="button" aria-label="Sonido" aria-pressed={sound} onClick={toggleSound}>{sound ? "🔊" : "🔇"}</button>
        <button type="button" aria-label="Menú e historial" aria-controls="dice-history" aria-expanded={panel === "history"}
          onClick={() => setPanel(panel === "history" ? null : "history")}>☰</button>
      </header>

      <section id="dice-rules" className={styles.popover} hidden={panel !== "rules"}>
        <h2>Cómo se juega</h2>
        <p>{demo.rules}</p>
        <p>Hay 15 combinaciones por debajo de 7, 15 por encima y 6 que suman 7.</p>
      </section>
      <section id="dice-history" className={styles.popover} hidden={panel !== "history"}>
        <Link href="/juegos">← Volver al taller</Link>
        <h2>Últimas tiradas</h2>
        {history.length ? (
          <ul className={styles.history}>
            {history.map(({ id, stake, choice, result }) => (
              <li key={id}>
                <div><strong>{result.dice.join(" + ")} = {result.total}</strong><span>{diceChoices[choice]} · {credits.format(stake)} cr.</span></div>
                <b>{signed.format(stake * (result.multiplier - 1))} cr.</b>
              </li>
            ))}
          </ul>
        ) : <p>Todavía no hay tiradas.</p>}
      </section>

      <section className={styles.stage} aria-labelledby="demo-title">
        <header>
          <p className={styles.eyebrow}>7 Down / 7 Up · Demo</p>
          <h1 id="demo-title">{demo.title}</h1>
          <div className={styles.ornament} aria-hidden="true"><i /></div>
        </header>
        <DiceTray previous={last?.result} pending={pending} onLanded={settle} />
        <div className={styles.readout} role="status" aria-atomic="true">
          {pending ? demo.motion : last ? (
            <><strong>{last.result.dice.join(" + ")} = <b>{last.result.total}</b></strong>
              <span data-outcome={last.result.multiplier > 0 ? "win" : "loss"}>{last.result.multiplier > 0 ? `Ganaste ${credits.format(payout - last.stake)} cr.`
                : `Perdiste ${credits.format(last.stake)} cr.`}</span></>
          ) : "Elegí una apuesta y lanzá los dados."}
        </div>
      </section>

      <section className={styles.controls} aria-label="Controles de Dados">
        <fieldset disabled={!!pending}>
          <legend><span aria-hidden="true">◎</span> Tu predicción</legend>
          <div className={styles.choices}>
            {SEVEN_CHOICES.map((option) => (
              <button key={option} type="button" aria-pressed={option === choice} onClick={() => setChoice(option)}>
                {diceChoices[option]} <small>{diceRanges[option]} · {SEVEN_MULTIPLIERS[option]}×</small>
              </button>
            ))}
          </div>
        </fieldset>
        <DemoChipPicker options={STAKES} value={stake} balance={balance} disabled={!!pending} onChange={setStake} />
        <button type="button" className={styles.play} aria-disabled={!!pending || !affordable} onClick={play}>
          <span className={styles.playDice} aria-hidden="true"><i /><i /></span>{pending ? "Tirando…" : demo.action}
        </button>
        {!pending && !affordable && <p className={styles.hint} role="status">
          {balance < STAKES[0] ? "Reiniciá la demo para recuperar el saldo." : "Elegí una apuesta que entre en tu saldo."}
        </p>}
        <button type="button" className={styles.reset} disabled={!!pending} onClick={reset}>↻ Reiniciar demo</button>
      </section>
    </div>
  );
}
