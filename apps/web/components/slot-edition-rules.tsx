"use client";
import { useState } from "react";
import type { SlotGame, SlotTheme } from "@homebet/proveedores/catalog";
import { FREE_SPINS_AWARD } from "@homebet/proveedores/engine";
import { slotEngineProfile } from "@/lib/slot-engine-profile";
export function SlotEditionRules({ game, theme, bet, format }: { game: SlotGame; theme: SlotTheme; bet: number; format: (cents: number) => string }) {
  const engine = slotEngineProfile(game);
  const PAYLINES = engine.paylines, PAYTABLE = engine.paytable;
  const [page, setPage] = useState(0);
  const pageSize = engine.rows === 5 ? 10 : PAYLINES.length;
  const pages = Math.ceil(PAYLINES.length / pageSize);
  const currentPage = Math.min(page, pages - 1);
  const firstLine = currentPage * pageSize;
  const [tab, setTab] = useState<"pays" | "lines" | "features">("pays");
  return <>
    <h2 className="font-bold">Edición {engine.edition} · Reglas y pagos</h2>
    <p className="slot-rules-intro">{PAYLINES.length} líneas siempre activas. Pagan 3, 4 o 5 símbolos consecutivos desde el primer rodillo, de izquierda a derecha. Entre rodillos, la línea se mantiene o pasa a una fila vecina. Cada línea paga su mejor combinación una vez; se suman los premios de distintas líneas.</p>
    <p className="slot-edition-bet-note">Los multiplicadores se aplican a la <strong>apuesta total: {format(bet)} fichas</strong>. No se divide entre {PAYLINES.length} ni se cobra por línea.</p>
    <div className="slot-edition-rule-tabs" role="group" aria-label="Contenido de las reglas">
      <button type="button" aria-pressed={tab === "pays"} onClick={() => setTab("pays")}>Pagos</button>
      <button type="button" aria-pressed={tab === "lines"} onClick={() => setTab("lines")}>{PAYLINES.length} líneas</button>
      <button type="button" aria-pressed={tab === "features"} onClick={() => setTab("features")}>Funciones</button>
    </div>
    {tab === "pays" ? <div className="slot-pay-table slot-edition-paytable">
      {PAYTABLE.map((row, symbol) => <div key={symbol} className="slot-pay-card">
        <span role="img" aria-label={game.symbols[symbol]} className="slot-symbol slot-pay-symbol" style={{ backgroundImage: `url("${game.sprite}")`, backgroundPosition: `${symbol * 100 / 7}% 50%` }} />
        <p className="slot-pay-name">{game.symbols[symbol]}</p>
        {row.map((multiplier, index) => <div key={index} className="slot-edition-pay-row"><strong>{index + 3} · {multiplier}×</strong><span>{format(bet * multiplier)}</span></div>)}
      </div>)}
    </div> : tab === "lines" ? <div className="slot-edition-lines" aria-label={`Recorrido de las ${PAYLINES.length} líneas fijas`}>
      {PAYLINES.slice(firstLine, firstLine + pageSize).map((line, offset) => <div key={firstLine + offset}><span>{firstLine + offset + 1}</span><svg viewBox={`0 0 ${engine.columns * 10} ${engine.rows * 10}`} role="img" aria-label={`Línea ${firstLine + offset + 1}: filas ${line.map(cell => Math.floor(cell / 5) + 1).join(", ")}`}>
        {Array.from({ length: engine.columns * engine.rows }, (_, cell) => <circle key={cell} cx={cell % 5 * 10 + 5} cy={Math.floor(cell / 5) * 10 + 5} r="1.2" fill="#ffffff40" />)}
        <polyline points={line.map(cell => `${cell % 5 * 10 + 5},${Math.floor(cell / 5) * 10 + 5}`).join(" ")} fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg></div>)}
    </div> : <div className="slot-edition-specials">
      <p><strong>WILD:</strong> sustituye símbolos normales y se toma el mayor pago de cada línea. Tres WILD activan «{theme.bonus.title}», con un premio de 1× a 5× fijado antes de elegir.</p>
      <p><strong>Giros gratis:</strong> tres sellos en cualquier posición dan {FREE_SPINS_AWARD} giros con la apuesta y RTP que los activaron. No se descuentan fichas ni se reactivan funciones durante esos giros.</p>
    </div>}
    {tab === "lines" && pages > 1 && <div className="slot-edition-line-pages"><button type="button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} aria-label="Ver líneas anteriores">Anterior</button><span aria-live="polite">{firstLine + 1}–{Math.min(firstLine + pageSize, PAYLINES.length)} de {PAYLINES.length}</span><button type="button" disabled={currentPage === pages - 1} onClick={() => setPage(currentPage + 1)} aria-label="Ver líneas siguientes">Siguiente</button></div>}
    <p className="slot-pay-caption">{tab === "pays" ? "Cada fila indica cantidad · multiplicador y premio en fichas." : tab === "lines" ? `Las ${PAYLINES.length} líneas están incluidas en cada giro.` : "Durante los giros gratis no se vuelven a activar bonos ni giros gratis."}</p>
  </>;
}
