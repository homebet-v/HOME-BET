"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CARD_STREAK_LIMIT, cardCashOutValue, cardOdds, collectCardRound, openCardRound, predictCard,
  type Card, type CardRound, type Prediction,
} from "@homebet/proveedores/higher-lower-engine";
import { DEMO_CHIP_AMOUNTS, DemoChipPicker } from "./demo-chip-picker";
import { engineDemos } from "./engine-demos";
import styles from "./higher-lower-demo.module.css";

const STARTING_BALANCE = 500_000;
const REVEAL_TIME = 340;
const QUICK_CHIPS = [500, 1_000, 2_500, 5_000, 10_000, 100_000] as const;
const credits = new Intl.NumberFormat("es-PY");
const signed = new Intl.NumberFormat("es-PY", { signDisplay: "exceptZero" });
const percent = new Intl.NumberFormat("es-PY", { style: "percent", maximumFractionDigits: 1 });
const factor = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 4 });
const suits = {
  clubs: { icon: "♣", name: "tréboles" },
  diamonds: { icon: "♦", name: "diamantes" },
  hearts: { icon: "♥", name: "corazones" },
  spades: { icon: "♠", name: "picas" },
};
const ranks = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function PlayingCard({ card, turning }: { card: Card | undefined; turning: boolean }) {
  const rank = card ? ranks[card.rank] : "";
  const suit = card ? suits[card.suit] : null;
  return (
    <div className={styles.cardWell}>
      <Image src="/images/engine-demos/camara-carmesi-pedestal.webp" alt="" fill unoptimized
        sizes="(max-width: 48rem) 100vw, 27rem" className={styles.pedestal} />
      {card && suit ? (
        <div key={`${card.suit}-${card.rank}`} className={styles.card} data-turning={turning}
          data-red={card.suit === "hearts" || card.suit === "diamonds"}
          aria-label={`${rank} de ${suit.name}`} role="img">
          <span aria-hidden="true">{rank}<small>{suit.icon}</small></span>
          <b aria-hidden="true">{suit.icon}</b>
          <span aria-hidden="true">{rank}<small>{suit.icon}</small></span>
        </div>
      ) : (
        <div className={styles.backCard} aria-label="Mazo cerrado" role="img"><span aria-hidden="true">♦</span></div>
      )}
    </div>
  );
}

export function HigherLowerDemo() {
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [stake, setStake] = useState<number>(DEMO_CHIP_AMOUNTS[0]);
  const [round, setRound] = useState<CardRound | null>(null);
  const [pending, setPending] = useState<CardRound | null>(null);
  const [history, setHistory] = useState<CardRound[]>([]);
  const [panel, setPanel] = useState<"rules" | "history" | null>(null);
  const playing = round?.phase === "playing";
  const odds = playing ? cardOdds(round) : null;
  const available = playing ? cardCashOutValue(round) : 0;

  useEffect(() => {
    if (!pending) return;
    const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      setRound(pending);
      setPending(null);
      if (pending.phase !== "playing") {
        setBalance((value) => value + pending.payout);
        setHistory((items) => [pending, ...items].slice(0, 8));
      }
    }, instant ? 0 : REVEAL_TIME);
    return () => window.clearTimeout(timer);
  }, [pending]);

  function start() {
    if (playing || stake > balance) return;
    const next = openCardRound(stake);
    setBalance(balance - stake);
    setRound(next);
  }

  function guess(prediction: Prediction) {
    if (!round || pending || !playing) return;
    const next = predictCard(round, prediction);
    if (next !== round) setPending(next);
  }

  function collect() {
    if (!round || !playing || pending) return;
    const next = collectCardRound(round);
    if (next === round) return;
    setRound(next);
    setBalance((value) => value + next.payout);
    setHistory((items) => [next, ...items].slice(0, 8));
  }

  function reset() {
    if (playing) return;
    setBalance(STARTING_BALANCE);
    setStake(DEMO_CHIP_AMOUNTS[0]);
    setRound(null);
    setHistory([]);
    setPanel(null);
  }

  return (
    <div className={styles.game}>
      <header className={styles.hud}>
        <Link href="/juegos" className={styles.back}>‹ Taller</Link>
        <div className={styles.balance}><span>Saldo de práctica</span><strong>{credits.format(balance)} <small>cr.</small></strong></div>
        <button type="button" aria-label="Cómo se juega" aria-controls="card-rules" aria-expanded={panel === "rules"}
          onClick={() => setPanel(panel === "rules" ? null : "rules")}>i</button>
        <button type="button" aria-label="Historial de rondas" aria-controls="card-history" aria-expanded={panel === "history"}
          onClick={() => setPanel(panel === "history" ? null : "history")}>☷</button>
      </header>
      <section className={styles.popover} id="card-rules" hidden={panel !== "rules"}>
        <h2>Cómo se juega</h2>
        <ol>
          <li>Elegí una ficha y descubrí la primera carta. El as vale 1 y el rey es la más alta.</li>
          <li>Elegí si la siguiente será mayor o menor. Un empate mantiene el multiplicador. Una predicción incorrecta termina la ronda.</li>
          <li>Podés cobrar después del primer acierto. El cobro es automático al llegar a {CARD_STREAK_LIMIT} aciertos o al tope de 100×.</li>
        </ol>
        <p>Las probabilidades usan las cartas que quedan en el mazo. Una predicción segura puede mantener el multiplicador.</p>
      </section>
      <section className={styles.popover} id="card-history" hidden={panel !== "history"}>
        <h2>Últimas rondas</h2>
        {history.length ? <table>
          <thead><tr><th scope="col">Aciertos</th><th scope="col">Apuesta</th><th scope="col">Neto</th></tr></thead>
          <tbody>{history.map((item, index) => (
            <tr key={index}><td>{item.streak}</td><td>{credits.format(item.wager)} cr.</td>
              <td data-net={Math.sign(item.payout - item.wager)}>{signed.format(item.payout - item.wager)} cr.</td></tr>
          ))}</tbody>
        </table> : <p>Todavía no hay rondas terminadas.</p>}
      </section>
      <header className={styles.title}>
        <span className={styles.titleMark} aria-hidden="true">♠</span>
        <h1>{engineDemos.cards.title}</h1>
        <p>Mayor o menor</p>
      </header>
      <section className={styles.stage} aria-label="Mesa de cartas">
        <div className={styles.track}>
          <span><i aria-hidden="true">◎</i> Aciertos <b>{round?.streak ?? 0}/{CARD_STREAK_LIMIT}</b></span>
          <span><i aria-hidden="true">↗</i> Multiplicador <b>{round && round.streak > 0 ? `${factor.format(round.multiplierBps / 10_000)}×` : "—"}</b></span>
        </div>
        <PlayingCard card={round?.card} turning={!!pending} />
        <div className={styles.status} role="status" aria-atomic="true" data-phase={round?.phase}>
          {pending ? "Revelando…" : !round ? "Abrí el mazo para empezar." : round.phase === "lost"
            ? `Fallaste · Perdiste ${credits.format(round.wager)} cr.`
            : round.phase === "cashed" ? `Cobraste ${credits.format(round.payout)} cr. · Neto ${signed.format(round.payout - round.wager)} cr.`
            : <><strong>{ranks[round.card.rank]} de {suits[round.card.suit].name}</strong>
              <span>{round.event === "tie" ? "Empate. Conservás el multiplicador." : round.event === "hit" ? "¡Acertaste! Podés cobrar o seguir." : "Elegí cómo será la próxima carta."}</span></>}
        </div>
      </section>
      <section className={styles.console} aria-label="Controles de Mayor o menor">
        <DemoChipPicker options={DEMO_CHIP_AMOUNTS} quickOptions={QUICK_CHIPS} value={stake} balance={balance}
          disabled={!!playing} onChange={setStake} />
        <div className={styles.choices}>
          <button type="button" aria-disabled={!odds || !!pending || odds.lower === 0} onClick={() => guess("lower")}>
            <strong><i aria-hidden="true">⌄</i> Menor</strong>{odds && <span>{percent.format(odds.lower / odds.total)}</span>}
          </button>
          <button type="button" aria-disabled={!odds || !!pending || odds.higher === 0} onClick={() => guess("higher")}>
            <strong><i aria-hidden="true">⌃</i> Mayor</strong>{odds && <span>{percent.format(odds.higher / odds.total)}</span>}
          </button>
        </div>
        {odds ? (
          <>
            <p className={styles.tie}>Empate {percent.format(odds.tie / odds.total)} · {odds.total} cartas en el mazo</p>
            <button type="button" className={styles.action} aria-disabled={!!pending || available === 0} onClick={collect}>
              {available > 0 ? `Cobrar ${credits.format(available)} cr.` : "Cobrar"}
            </button>
          </>
        ) : (
          <>
            <button type="button" className={styles.action} aria-disabled={stake > balance} onClick={start}>
              {round ? "Repartir de nuevo" : "Abrir el mazo"}
            </button>
            {stake > balance && <p className={styles.tie}>{balance < DEMO_CHIP_AMOUNTS[0] ? "Reiniciá la demo para recuperar el saldo." : "Elegí una ficha más baja."}</p>}
            <button type="button" className={styles.reset} onClick={reset}>↻ Reiniciar demo</button>
          </>
        )}
      </section>
    </div>
  );
}
