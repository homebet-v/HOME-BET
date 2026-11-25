import type { CSSProperties } from "react";
import type { SlotGame, SlotTheme } from "@homebet/proveedores/catalog";
import "./slot-game-title.css";

export function SlotGameTitle({ game, theme, art }: { game: SlotGame; theme: SlotTheme; art?: string }) {
  return <div className="slot-game-title" style={{ "--slot-title-art": `url("${art ?? `/images/slots/titles/${theme.motif}.webp`}")`, "--slot-title-letters": Math.max(12, game.name.length) } as CSSProperties}>
    <h1>{game.name}</h1>
  </div>;
}
