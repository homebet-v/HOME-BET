import { randomUint32, uniformIndex, type NextUint32 } from "@homebet/proveedores/game-random";

export type DiceChoice = "under" | "over";
export const SEVEN_CHOICES = ["under", "seven", "over"] as const;
export type SevenChoice = typeof SEVEN_CHOICES[number];
export const SEVEN_MULTIPLIERS = { under: 2, seven: 5, over: 2 } as const;

export type DiceRound = {
  dice: readonly [number, number];
  total: number;
  multiplier: number;
};

function throwDice(nextUint32: NextUint32): Omit<DiceRound, "multiplier"> {
  const first = uniformIndex(6, nextUint32) + 1;
  const second = uniformIndex(6, nextUint32) + 1;
  return { dice: [first, second], total: first + second };
}

function winningChoice(total: number): SevenChoice {
  if (total === 7) return "seven";
  return total < 7 ? "under" : "over";
}

/** Gross return in demo credits per credit played. Seven returns the stake. */
export function rollDice(choice: DiceChoice, nextUint32: NextUint32 = randomUint32): DiceRound {
  if (choice !== "under" && choice !== "over") throw new Error("Elección inválida");
  const round = throwDice(nextUint32);
  const winner = winningChoice(round.total);
  return { ...round, multiplier: winner === "seven" ? 1 : choice === winner ? 2 : 0 };
}

/** Exactly one of the three predictions wins. Multipliers include the stake. */
export function rollSevenUpDown(choice: SevenChoice, nextUint32: NextUint32 = randomUint32): DiceRound {
  if (!SEVEN_CHOICES.includes(choice)) throw new Error("Elección inválida");
  const round = throwDice(nextUint32);
  return { ...round, multiplier: choice === winningChoice(round.total) ? SEVEN_MULTIPLIERS[choice] : 0 };
}
