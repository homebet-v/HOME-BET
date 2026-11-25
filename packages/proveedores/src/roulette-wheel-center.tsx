import type { RouletteTheme } from './roulette-catalog';

// Each engraving is drawn on a 32 × 32 grid so it stays readable on the small wheel.
const engravings: Readonly<Partial<Record<string, string>>> = {
  'royal-gold': 'M4 10l6 5 6-9 6 9 6-5-3 13H7ZM8 27h16M13 19l3-3 3 3-3 3Z',
  'neon-vegas': 'M16 2l3 10 10 4-10 3-3 11-3-11-10-3 10-4ZM7 6l3 3m12 13 3 3M25 6l-3 3M10 22l-3 3',
  'coral-palace': 'M16 27V7m0 12-8-5V8m8 16 8-6v-7M8 13l-4-2V6m20 10 4-3V8M16 12l4-4V4M11 28h10',
  'cyber-wheel': 'M16 4l11 6v12l-11 6-11-6V10ZM16 10l5 3v6l-5 3-5-3v-6Zm0-6v6m11 12-6-3M5 22l6-3',
  'sapphire-crown': 'M16 3l11 8-4 13-7 5-7-5-4-13Zm0 0-5 10 5 16 5-16ZM5 11l6 2h10l6-2',
  'ruby-dynasty': 'M9 4h14l5 5v14l-5 5H9l-5-5V9Zm3 5h8l3 3v8l-3 3h-8l-3-3v-8ZM9 4l3 5m11-5-3 5m8 14-5-3M9 28l3-5',
  'emerald-court': 'M16 28V12m0 10C5 22 4 16 5 10c7 0 11 5 11 12Zm0-4c0-8 5-13 11-13 0 8-4 13-11 13Zm0-5C9 10 11 5 15 3c4 3 5 7 1 10Z',
  'venetian-fortune': 'M4 10q6 5 12 0 6 5 12 0-1 12-7 12l-5-4-5 4Q5 21 4 10Zm3 5q3-1 6 2-5 2-6-2Zm18 0q-3-1-6 2 5 2 6-2ZM22 10q0-6 6-7l-2 6',
  'midnight-majesty': 'M16 3l4 4 7 3 2 6-2 6-7 3-4 4-4-4-7-3-2-6 2-6 7-3Zm0 6 6 7-6 7-6-7Z',
  'desert-sultan': 'M5 26h22M9 25V14q0-4 7-8 7 4 7 8v11m-10 0v-6q3-5 6 0v6M5 20v-6m22 6v-6M16 6V3',
  'imperial-jade': 'M5 5h22v22H5Zm5 5h12v12H10Zm6 0v12m-6-6h12M5 5l5 5m17-5-5 5m5 17-5-5M5 27l5-5',
  'crystal-ballroom': 'M16 3v26M5 9l22 14M5 23 27 9M12 6l4 4 4-4m-8 20 4-4 4 4M5 14l6-1-1-6m12 18-1-6 6-1M5 18l6 1-1 6m12-18-1 6 6 1',
  'moonstone-casino': 'M19 4a12 12 0 1 0 9 16A11 11 0 0 1 19 4Zm6 2v8m-4-4h8',
  'velvet-777': 'M4 10h7l-5 12m7-12h7l-5 12m7-12h7l-5 12M4 6h24M4 26h24',
  'diamond-district': 'M3 12l6-6h14l6 6-13 15Zm0 0h26M9 6l3 6 4 15 4-15 3-6m-11 6 4-6 4 6',
  'electric-avenue': 'M18 3 6 18h9l-2 11 13-17h-9ZM5 5l-2 4m25 14-2 4',
  'miami-royale': 'M5 27h22M16 24q4-8 2-15m0 0Q10 3 5 11q7-2 13-2Zm0 0q5-7 10-1-5 0-10 1Zm0 0q8 2 8 8-4-4-8-8Zm0 0q-7 1-9 8 5-3 9-8Z',
  'starlight-lounge': 'M5 22 10 10l9 7 8-11m-4 19-4-8M5 19v6m-3-3h6m2-15v6M7 10h6m14-7v6m-3-3h6m-7 16v6m-3-3h6',
  'tokyo-jackpot': 'M3 7q13 5 26 0M5 14h22M10 9l-1 18M22 9l1 18M16 10v4M5 27h8m6 0h8',
  'disco-fortune': 'M16 2v4m0 0a11 11 0 1 0 0 22 11 11 0 0 0 0-22Zm0 0c-7 5-7 17 0 22 7-5 7-17 0-22ZM6 13h20M6 21h20M16 6v22',
  'high-roller-boulevard': 'M16 4c4 6 10 8 10 14a5 5 0 0 1-9 3l3 7h-8l3-7a5 5 0 0 1-9-3c0-6 6-8 10-14Z',
  'chrome-palace': 'M4 8l12 9L28 8v7l-12 9L4 15Zm0 14 12 8 12-8M9 5l7 5 7-5',
  'pearl-atlantis': 'M4 23q-2-8 12-19 14 11 12 19l-12 5Zm0 0 7-3m17 3-7-3M16 4v9M7 13l5 4m13-4-5 4m-4-3a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z',
  'sakura-tide': 'M16 6c-4-6-9 0-6 5-8-1-9 6-2 8-4 6 2 11 8 5 6 6 12 1 8-5 7-2 6-9-2-8 3-5-2-11-6-5Zm0 7 3 3-3 3-3-3Z',
  'moonlit-lagoon': 'M21 4a8 8 0 1 0 6 11A8 8 0 0 1 21 4ZM3 21q4-3 8 0t8 0 10 0M3 27q4-3 8 0t8 0 10 0',
  'sunken-treasure': 'M5 13l4-7h14l4 7v13H5Zm0 0h22M11 6l-2 7v13M21 6l2 7v13m-9-9h4v5h-4Z',
  'aurora-reef': 'M3 11Q9 3 15 9T29 5M3 17q6-8 12-2t14-4M3 23q6-8 12-2t14-4M7 28l3-3m12 3 4-3',
  'mermaids-pearl': 'M16 26c-2-8-5-11-12-11 3 8 8 11 12 11Zm0 0c2-8 5-11 12-11-3 8-8 11-12 11ZM16 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM16 26v3',
  'jade-lagoon': 'M16 23c-8-6-7-13 0-18 7 5 8 12 0 18Zm0 0C7 24 4 19 3 12c7 0 10 3 13 11Zm0 0c9 1 12-4 13-11-7 0-10 3-13 11ZM8 28h16',
  'poseidons-trident': 'M16 4v25M7 8v7q0 6 9 6t9-6V8M4 11l3-4 3 4m12 0 3-4 3 4M12 8l4-5 4 5',
  'tropical-mirage': 'M16 16c-4-8-1-13 3-12 4 1 3 7-3 12Zm0 0c7-6 13-4 13 0s-6 6-13 0Zm0 0c5 8 2 13-2 12s-4-7 2-12Zm0 0c-8 5-13 2-13-2s7-5 13 2Z',
  'quantum-vault': 'M16 3l12 7v12l-12 7-12-7V10Zm0 6 6 7-6 7-6-7Zm0-6v6m12 13-6-6M4 22l6-6',
  'matrix-fortune': 'M16 6l10 5v10l-10 5-10-5V11ZM3 8h5m16 0h5M3 24h5m16 0h5M11 12h4v8h-4Zm7 2 3-2v8m-3 0h6',
  'plasma-circuit': 'M3 16h5l4-8 5 16 4-12 3 4h5M6 7l3-3m14 24 3-3M3 20h4m18-12h4',
  'titanium-grid': 'M3 11l5-3 5 3v6l-5 3-5-3Zm10 0 5-3 5 3v6l-5 3-5-3Zm5 9 5-3 5 3v6l-5 3-5-3Zm-5-9V5l5-3 5 3v6',
  'neon-protocol': 'M4 5h24v22H4Zm5 7 5 4-5 4m8 0h6M4 9h24',
  'digital-dynasty': 'M6 26h17v-6H11V9l7-6v6h9l-3 6h-7m-6-4H5m6 5H3m20-5h1',
  'lunar-systems': 'M22 16a6 6 0 1 0-12 0 6 6 0 0 0 12 0Zm-1-7c5-3 9-4 10-2 2 3-5 10-13 15S3 28 2 25c-1-2 3-6 8-10M21 4h6m-3-3v6',
  'reactor-rush': 'M16 4l13 24H3Zm2 7-7 9h5l-2 6 8-9h-5Z',
  'binary-jackpot': 'M5 5h22v22H5Zm4 5h5v6H9Zm10 2 3-2v6m-3 0h6M9 21h5m5 0h4m-7-16V2m0 28v-3M2 16h3m22 0h3',
};

export function RouletteWheelCenter({ slug, variant }: {
  slug: string;
  variant: RouletteTheme['wheelStyle'];
}) {
  const engraving = engravings[slug] ?? engravings['royal-gold'];

  return (
    <g className="rg-theme-core" transform="translate(160 160)">
      <circle cy="2" r="34" fill="#030605" opacity=".82" />
      <circle r="33" fill="url(#rg-metal)" stroke="var(--rg-secondary)" strokeWidth="1" />
      <circle r="29" fill="var(--rg-wood-dark)" stroke="var(--rg-accent)" />
      <circle r="26" fill="url(#rg-theme-core)" />
      <circle r="26" fill="none" stroke="var(--rg-secondary)" strokeWidth="1.2"
        strokeDasharray={variant === 'hex' ? '7 3' : variant === 'star' ? '2 4' : undefined} />
      <g transform="scale(1.42) translate(-16 -16)" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={engraving} transform="translate(0 1)" stroke="#020506" strokeWidth="3.2" opacity=".8" />
        <path d={engraving} stroke="var(--rg-accent)" strokeWidth="2.6" />
        <path d={engraving} stroke="var(--rg-secondary)" strokeWidth="1.35" />
      </g>
      <path d="M-24 -16a29 29 0 0 1 26-13" fill="none" stroke="#fff" strokeWidth="1.2" opacity=".45" />
    </g>
  );
}
