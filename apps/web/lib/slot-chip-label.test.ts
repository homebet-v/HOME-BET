import assert from "node:assert/strict";
import { test } from "node:test";
import { slotChipLabel } from "./slot-chip-label.ts";

test("las fichas abrevian miles sin cambiar el importe en centésimos", () => {
  for (const [amountCents, label] of [
    [1000, "10"], [2500, "25"], [5000, "50"], [10000, "100"], [25000, "250"], [50000, "500"],
    [100000, "1k"], [200000, "2k"], [250000, "2,5k"], [10000000, "100k"],
    [100000000, "1M"], [123456700, "1,234567M"], [100001, "1,00001k"],
  ] as const) assert.equal(slotChipLabel(amountCents), label);
});
