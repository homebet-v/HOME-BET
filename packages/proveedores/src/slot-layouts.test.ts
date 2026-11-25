import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_SLOT_CONTROL_LAYOUT, isSlotControlLayout, parseSlotLayoutPreferences } from "./slot-layouts.ts";

test("la preferencia de cada juego se recupera de forma independiente", () => {
  const preferences = parseSlotLayoutPreferences(JSON.stringify({ uno: "right-thumb", dos: "low-center" }), ["uno", "dos"]);
  assert.equal(preferences.uno, "right-thumb");
  assert.equal(preferences.dos, "low-center");
  assert.equal(preferences.tres ?? DEFAULT_SLOT_CONTROL_LAYOUT, "central-bar");
});
test("preferencias inválidas, obsoletas o de juegos desconocidos no se aplican", () => {
  assert.deepEqual(parseSlotLayoutPreferences('{"uno":"left-thumb","dos":"desconocido","otro":"right-thumb"}', ["uno", "dos"]), { uno: "left-thumb" });
  for (const raw of ["", "malformado", "null", "[]", '"central-bar"', "42"]) assert.deepEqual(parseSlotLayoutPreferences(raw, ["uno"]), {});
  for (const value of [null, undefined, "", "__proto__", 1, {}]) assert.equal(isSlotControlLayout(value), false);
});
