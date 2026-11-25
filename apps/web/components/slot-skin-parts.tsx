export function SkinSpinGlyph() {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M26 12a11 11 0 0 0-18-5L4 11m0-7v7h7M6 20a11 11 0 0 0 18 5l4-4m-7 0h7v7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function SkinSoundGlyph({ sound }: { sound: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m11 5-5 4H3v6h3l5 4V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />{sound ? <path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /> : <path d="m16 9 5 6m0-6-5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}</svg>;
}

export function SkinRoundMetrics({ bet, payout, spinning, lines, format }: { bet: number; payout: number; spinning: boolean; lines: number; format: (amount: number) => string }) {
  return <div className="slot-lumen-metrics" aria-label="Datos del giro">
    <div><span aria-hidden="true" className="slot-lumen-metric-icon">◉</span><span><small>Apuesta total</small><strong>{format(bet)}</strong></span></div>
    <div><span aria-hidden="true" className="slot-lumen-metric-icon">▤</span><span><small>Líneas</small><strong>{lines}</strong></span></div>
    <div><span aria-hidden="true" className="slot-lumen-metric-icon">✦</span><span><small>Premio del giro</small><strong>{spinning ? "—" : format(payout)}</strong></span></div>
  </div>;
}
