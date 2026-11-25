import { useEffect, useLayoutEffect, useRef, type CSSProperties, type RefObject } from 'react';
import type { RouletteBoost } from './roulette-engine';

export const PRISM_REVEAL_STEP_MS = 760;

type MultiplierImages = Partial<Record<RouletteBoost['multiplier'], string>>;
const multiplierImage = (root: string, amount: RouletteBoost['multiplier'], images?: MultiplierImages) =>
  `${root}/${images?.[amount] ?? `multiplier-${amount}.webp`}`;

export function PrismBoosts({ boosts, revealing, spinning, result, wheel, images, artRoot = '/images/roulette/prism-roulette' }: {
  boosts: readonly RouletteBoost[];
  revealing: boolean;
  spinning: boolean;
  result?: number;
  wheel: RefObject<HTMLElement | null>;
  artRoot?: string;
  images?: MultiplierImages;
}) {
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    for (const amount of [50, 100, 250] as const) {
      const image = new Image();
      image.src = multiplierImage(artRoot, amount, images);
    }
  }, [artRoot, images]);

  useLayoutEffect(() => {
    const stage = wheel.current;
    const targetStrip = strip.current;
    if (!revealing || !stage || !targetStrip) return;

    function positionBubbles() {
      if (!stage || !targetStrip) return;
      const origin = (stage.querySelector('.rg-rotor') ?? stage).getBoundingClientRect();
      for (const slot of targetStrip.querySelectorAll<HTMLElement>('.rg-prism-slot')) {
        const target = slot.getBoundingClientRect();
        slot.style.setProperty('--flight-x', `${origin.left + (origin.width - target.width) / 2 - target.left}px`);
        slot.style.setProperty('--flight-y', `${origin.top + (origin.height - target.height) / 2 - target.top}px`);
      }
    }

    positionBubbles();
    const observer = new ResizeObserver(positionBubbles);
    observer.observe(stage);
    observer.observe(targetStrip);
    return () => observer.disconnect();
  }, [revealing, wheel]);

  return <div ref={strip} className="rg-prism-boosts" data-rolling={spinning || undefined}
    role="status" aria-label="Multiplicadores de la ronda" aria-hidden={revealing || undefined}>
    {boosts.map((boost, index) => (
      <div key={boost.number} className="rg-prism-slot" data-multiplier={boost.multiplier}
        style={{
          '--boost-delay': `${index * PRISM_REVEAL_STEP_MS}ms`,
          '--boost-art': `url("${multiplierImage(artRoot, boost.multiplier, images)}")`,
        } as CSSProperties}>
        <span className="rg-prism-boost" data-hit={!spinning && result === boost.number}>
          <b>{boost.number}</b>{' '}<span>×</span>{' '}
          <strong>
            <span className="rg-prism-value-readable">{boost.multiplier}</span>
            {[...String(boost.multiplier)].map((digit, digitIndex) => (
              <span key={digitIndex} aria-hidden="true" className="rg-prism-digit"
                style={{ '--prism-digit-delay': `${digitIndex * 75}ms` } as CSSProperties}>
                {digit}
              </span>
            ))}
          </strong>
        </span>
        {revealing && <span className="rg-prism-bubble" aria-hidden="true">
          <span>Número {boost.number}</span>
          <strong>{boost.multiplier}×</strong>
        </span>}
      </div>
    ))}
  </div>;
}
