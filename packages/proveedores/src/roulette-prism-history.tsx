import { useLayoutEffect, useRef, type RefObject } from 'react';
import { rouletteColor } from './roulette-engine';

export const PRISM_RESULT_FLIGHT_MS = 950;
export const PRISM_RESULT_PAUSE_MS = 260;

export function PrismHistory({ numbers, round, spinning, wheel }: {
  numbers: readonly number[];
  round: number;
  spinning: boolean;
  wheel: RefObject<HTMLElement | null>;
}) {
  const latest = useRef<HTMLSpanElement>(null);
  const hasNumber = numbers.length > 0;

  useLayoutEffect(() => {
    const stage = wheel.current?.querySelector('.rg-rotor');
    const token = latest.current;
    if (!hasNumber || spinning || !stage || !token) return;

    // Measure the slot, since the chip itself is already animated on this frame.
    const target = token.parentElement?.getBoundingClientRect();
    if (!target) return;
    const origin = stage.getBoundingClientRect();
    token.style.setProperty('--result-flight-x', `${origin.left + (origin.width - target.width) / 2 - target.left}px`);
    token.style.setProperty('--result-flight-y', `${origin.top + (origin.height - target.height) / 2 - target.top}px`);
  }, [hasNumber, round, spinning, wheel]);

  return <div className="rg-prism-history" role="group" aria-label="Últimas jugadas">
    {numbers.slice(0, 8).map((number, index) => (
      <div className="rg-prism-history-slot" key={round - index}>
        <span ref={index === 0 ? latest : undefined}
          className="rg-prism-history-number"
          data-color={rouletteColor(number)}
          data-landing={index === 0 && !spinning ? true : undefined}
          aria-current={index === 0 ? 'true' : undefined}>
          {number}
        </span>
      </div>
    ))}
  </div>;
}
