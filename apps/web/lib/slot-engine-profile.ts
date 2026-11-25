import * as classic from "@homebet/proveedores/engine";
import * as editionII from "@homebet/proveedores/engine-5x3";
import * as editionIII from "@homebet/proveedores/engine-5x5";
import type { SlotGame } from "@homebet/proveedores/catalog";

const classicProfile = {
  id: "3x3", edition: "I", columns: 3, rows: 3, paylines: classic.PAYLINES,
  paytable: classic.MULTIPLIERS.map(multiplier => [multiplier]), counts: [3],
  initialGrid: [0,1,2,3,4,5,2,1,0], spin: classic.spin,
  rules: "Tres símbolos iguales en una línea pagan. Hay cinco líneas: tres filas y dos diagonales. El multiplicador se aplica a tu apuesta total.",
};
const editionIIProfile = {
  id: "5x3", edition: "II", columns: 5, rows: 3, paylines: editionII.PAYLINES,
  paytable: editionII.PAYTABLE, counts: [3,4,5],
  initialGrid: [0,1,2,3,4,1,2,3,4,5,2,3,4,5,0], spin: editionII.spin,
  rules: "25 líneas fijas, siempre activas. Pagan 3, 4 o 5 símbolos consecutivos desde el primer rodillo, de izquierda a derecha. La línea solo avanza a la misma fila o a una vecina. Cada línea paga la mejor combinación una sola vez; los premios de distintas líneas se suman. Los multiplicadores se aplican a la apuesta total, sin dividirla entre 25.",
};
const editionIIIProfile = {
  id: "5x5", edition: "III", columns: 5, rows: 5, paylines: editionIII.PAYLINES,
  paytable: editionIII.PAYTABLE, counts: [3,4,5],
  initialGrid: Array.from({ length: 25 }, (_, cell) => (Math.floor(cell / 5) + cell % 5) % 6), spin: editionIII.spin,
  rules: "50 líneas fijas, siempre activas. Pagan 3, 4 o 5 símbolos consecutivos desde el primer rodillo, de izquierda a derecha. La línea solo pasa a la misma fila o a una vecina. Se suman los premios de distintas líneas sobre la apuesta total.",
};
export function slotEngineProfile(game: Pick<SlotGame, "engine">) { return game.engine === "5x5" ? editionIIIProfile : game.engine === "5x3" ? editionIIProfile : classicProfile; }
