import assert from "node:assert/strict";
import { test } from "node:test";
import { rollDice, rollSevenUpDown, SEVEN_CHOICES } from "./dice-engine.ts";
import { dropPlinko, playPlinko, plinkoMultipliers, plinkoSlotProbabilities, PLINKO_MULTIPLIERS, PLINKO_ROWS, PLINKO_RISKS, PLINKO_ROW_OPTIONS } from "./plinko-engine.ts";
import { canCashOutMines, cashOutMines, minesQuote, MINES_BOARD_SIZE, MINES_OPTIONS, openMinesRound, revealMinesCell, type MineCount } from "./mines-engine.ts";
import { cardCashOutValue, cardOdds, collectCardRound, openCardRound, predictCard, type CardRound } from "./higher-lower-engine.ts";

test("Dados resuelve los 36 resultados para ambos rangos y devuelve la ficha con siete", () => {
  for (const choice of ["under", "over"] as const) {
    const counts = [0, 0, 0];
    for (let first = 1; first <= 6; first++) {
      for (let second = 1; second <= 6; second++) {
        const values = [first - 1, second - 1][Symbol.iterator]();
        const round = rollDice(choice, () => values.next().value!);
        const total = first + second;
        const expected = total === 7 ? 1 : Number(choice === (total < 7 ? "under" : "over")) * 2;
        assert.deepEqual(round, { dice: [first, second], total, multiplier: expected });
        counts[round.multiplier]++;
      }
    }
    assert.deepEqual(counts, [15, 6, 15]);
  }
});

test("7 Down / 7 Up liquida las tres apuestas sin devolución", () => {
  const wins = { under: 0, seven: 0, over: 0 };
  for (let first = 1; first <= 6; first++) {
    for (let second = 1; second <= 6; second++) {
      const total = first + second;
      const winner = total < 7 ? "under" : total > 7 ? "over" : "seven";
      for (const choice of SEVEN_CHOICES) {
        const values = [first - 1, second - 1][Symbol.iterator]();
        const multiplier = choice === winner ? (total === 7 ? 5 : 2) : 0;
        const round = rollSevenUpDown(choice, () => values.next().value!);
        assert.deepEqual(round, { dice: [first, second], total, multiplier });
        if (round.multiplier > 0) wins[choice]++;
      }
    }
  }
  assert.deepEqual(wins, { under: 15, seven: 6, over: 15 });
});

test("Minas habilita el cobro en grupos de cinco y liquida la pérdida al tocar una mina", () => {
  const round = openMinesRound(5_000, 3, () => 0);
  assert.deepEqual(round.mines, [0, 1, 2]);
  assert.equal(cashOutMines(round), round);
  const first = revealMinesCell(round, 3);
  assert.equal(revealMinesCell(first, 3), first);
  assert.deepEqual(minesQuote(first), { multiplier: 1.1022, payoutCents: 5_511, nextSafeProbability: 21 / 24 });
  assert.equal(cashOutMines(first), first);
  const fifth = [4, 5, 6, 7].reduce(revealMinesCell, first);
  assert.equal(canCashOutMines(fifth), true);
  const won = cashOutMines(fifth);
  assert.equal(won.phase, "cashed");
  assert.equal(won.payoutCents, 9_785);
  assert.equal(cashOutMines(won), won);
  assert.equal(revealMinesCell(won, 0), won);

  const lost = revealMinesCell(first, 1);
  assert.equal(lost.phase, "lost");
  assert.equal(lost.hit, 1);
  assert.equal(lost.payoutCents, 0);
  assert.equal(cashOutMines(lost), lost);
  assert.throws(() => revealMinesCell(round, 25), /Casilla/);
  assert.throws(() => openMinesRound(0, 3, () => 0), /Apuesta/);
  assert.throws(() => openMinesRound(5_000, 25 as MineCount, () => 0), /minas/);
});

test("Minas coloca minas únicas, aumenta el retorno con cada gema y paga automáticamente al completar", () => {
  for (const count of MINES_OPTIONS) {
    let next = 0;
    let round = openMinesRound(50_000, count, () => (next += 11));
    assert.equal(new Set(round.mines).size, count);
    let last = 0;
    for (let cell = 0; cell < MINES_BOARD_SIZE; cell++) {
      if (round.mines.includes(cell)) continue;
      round = revealMinesCell(round, cell);
      const { payoutCents } = minesQuote(round);
      assert.ok(payoutCents > last);
      if (round.phase === "playing") assert.equal(canCashOutMines(round), round.gems.length % 5 === 0);
      last = payoutCents;
    }
    assert.equal(round.gems.length, MINES_BOARD_SIZE - count);
    assert.equal(round.phase, "cashed");
    assert.equal(round.payoutCents, last);
    assert.equal(minesQuote(round).nextSafeProbability, 0);
  }
});

test("Minas paga la apuesta máxima sin perder precisión", () => {
  let round = openMinesRound(10_000_000, 8, () => 0);
  for (let cell = 8; cell < MINES_BOARD_SIZE; cell++) round = revealMinesCell(round, cell);
  assert.equal(round.phase, "cashed");
  assert.equal(round.payoutCents, Number(10_000_000n * 9_700n * 1_081_575n / 10_000n));
});

test("Mayor o menor usa un mazo único y conserva el progreso en un empate", () => {
  const shuffled = openCardRound(500, () => 0);
  assert.equal(new Set([shuffled.card, ...shuffled.deck].map(({ rank, suit }) => `${rank}:${suit}`)).size, 52);
  const round: CardRound = {
    ...shuffled,
    card: { rank: 7, suit: "hearts" },
    deck: [
      { rank: 7, suit: "diamonds" }, { rank: 9, suit: "spades" },
      { rank: 5, suit: "clubs" }, { rank: 4, suit: "hearts" },
    ],
  };
  assert.equal(collectCardRound(round), round);
  assert.deepEqual(cardOdds(round), { higher: 1, lower: 2, tie: 1, total: 4 });
  const tied = predictCard(round, "higher");
  assert.equal(tied.event, "tie");
  assert.equal(tied.streak, 0);
  assert.equal(tied.multiplierBps, 10_000);
  const hit = predictCard(tied, "higher");
  assert.equal(hit.event, "hit");
  assert.equal(hit.streak, 1);
  assert.equal(cardCashOutValue(hit), 1_455);
  const cashed = collectCardRound(hit);
  assert.equal(cashed.payout, 1_455);
  assert.equal(collectCardRound(cashed), cashed);
  assert.equal(predictCard(tied, "lower").phase, "lost");
  assert.equal(predictCard(hit, "higher"), hit);
  const finished = predictCard({ ...tied, streak: 7 }, "higher");
  assert.equal(finished.phase, "cashed");
  assert.equal(finished.streak, 8);
});

test("Plinko asigna los 256 recorridos a sus casillas y conserva la tabla de retorno", () => {
  const counts = Array<number>(PLINKO_MULTIPLIERS.length).fill(0);
  let returns = 0;
  for (let sequence = 0; sequence < 2 ** PLINKO_ROWS; sequence++) {
    let row = 0;
    const round = dropPlinko(() => (sequence >> row++) & 1);
    assert.equal(row, PLINKO_ROWS);
    assert.equal(round.path[0], 0);
    assert.equal(round.path.length, PLINKO_ROWS + 1);
    for (let depth = 1; depth < round.path.length; depth++) {
      assert.equal(round.path[depth] - round.path[depth - 1], (sequence >> (depth - 1)) & 1);
    }
    assert.equal(round.slot, round.path[PLINKO_ROWS]);
    assert.equal(round.multiplier, PLINKO_MULTIPLIERS[round.slot]);
    counts[round.slot]++;
    returns += round.multiplier;
  }
  assert.deepEqual(counts, [1, 8, 28, 56, 70, 56, 28, 8, 1]);
  assert.equal(returns, 232);
});

test("Plinko aplica la tabla de cada combinación de filas y riesgo", () => {
  for (const rows of PLINKO_ROW_OPTIONS) {
    const tables = PLINKO_RISKS.map((risk) => plinkoMultipliers(rows, risk));
    assert.ok(tables[0][0] < tables[1][0] && tables[1][0] < tables[2][0]);
    for (const [index, risk] of PLINKO_RISKS.entries()) {
      const table = tables[index];
      assert.equal(table.length, rows + 1);
      assert.deepEqual(table, [...table].reverse());
      let totalMultiplier = 0;
      const slots = Array<number>(rows + 1).fill(0);
      for (let sequence = 0; sequence < 2 ** rows; sequence++) {
        let depth = 0;
        const round = playPlinko(rows, risk, () => (sequence >> depth++) & 1);
        assert.equal(depth, rows);
        assert.equal(round.path.length, rows + 1);
        assert.equal(round.slot, round.path.at(-1));
        assert.equal(round.multiplier, table[round.slot]);
        slots[round.slot]++;
        totalMultiplier += round.multiplier;
      }
      assert.deepEqual(plinkoSlotProbabilities(rows), slots.map((count) => count / 2 ** rows));
      assert.ok(totalMultiplier / 2 ** rows < 1, `${rows} filas · ${risk}`);
    }
  }
});
