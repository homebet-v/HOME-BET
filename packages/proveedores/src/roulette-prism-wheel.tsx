export function PrismWheelMaterials() {
  return <>
    <linearGradient id="prism-titanium" x2="0" y2="1">
      <stop stopColor="var(--volt-bright,#e2f6ff)" /><stop offset=".17" stopColor="var(--volt-metal,#536c91)" />
      <stop offset=".42" stopColor="#111a32" /><stop offset=".62" stopColor="#576381" />
      <stop offset=".84" stopColor="#22283f" /><stop offset="1" stopColor="#060910" />
    </linearGradient>
    <linearGradient id="prism-rim-light" x2="1" y2="1">
      <stop stopColor="#d9fcff" /><stop offset=".27" stopColor="#6482aa" />
      <stop offset=".47" stopColor="#292849" /><stop offset=".72" stopColor="#c7a0fc" />
      <stop offset="1" stopColor="#506989" />
    </linearGradient>
    <linearGradient id="prism-ring-steel" x1="0" y1="0" x2="1" y2="1">
      <stop stopColor="var(--volt-deep,#181624)" /><stop offset=".16" stopColor="var(--volt-metal,#654f4d)" />
      <stop offset=".24" stopColor="var(--volt-bright,#f1bc87)" /><stop offset=".31" stopColor="var(--volt-metal,#745654)" />
      <stop offset=".51" stopColor="#272432" /><stop offset=".69" stopColor="#78566b" />
      <stop offset=".77" stopColor="var(--volt-reflection,#dfbed8)" /><stop offset=".87" stopColor="var(--volt-metal,#617698)" />
      <stop offset="1" stopColor="#2b242c" />
    </linearGradient>
    <radialGradient id="prism-bowl-enamel" cx=".45" cy=".37" r=".68">
      <stop stopColor="var(--volt-bowl,#22375e)" /><stop offset=".53" stopColor="var(--volt-blue,#132344)" />
      <stop offset=".78" stopColor="var(--volt-deep,#0d1936)" /><stop offset=".88" stopColor="var(--volt-bowl,#233a5f)" />
      <stop offset=".95" stopColor="#0b142b" /><stop offset="1" stopColor="#070d1c" />
    </radialGradient>
    <linearGradient id="prism-spoke-steel">
      <stop stopColor="#303c54" /><stop offset=".24" stopColor="#7287a8" />
      <stop offset=".38" stopColor="#e2edff" /><stop offset=".59" stopColor="#a6b8d7" />
      <stop offset="1" stopColor="#37445e" />
    </linearGradient>
    <radialGradient id="prism-pocket-depth" gradientUnits="userSpaceOnUse" cx="160" cy="160" r="129">
      <stop offset=".68" stopColor="#000613" stopOpacity=".8" />
      <stop offset=".71" stopColor="#000613" stopOpacity=".55" />
      <stop offset=".76" stopColor="#000613" stopOpacity="0" />
      <stop offset=".80" stopColor="#000613" stopOpacity=".12" />
      <stop offset=".837" stopColor="#000613" stopOpacity=".68" />
      <stop offset=".843" stopColor="#000613" stopOpacity=".8" />
      <stop offset=".88" stopColor="#cedfff" stopOpacity=".06" />
      <stop offset=".94" stopColor="#cedfff" stopOpacity="0" />
      <stop offset="1" stopColor="#000613" stopOpacity=".43" />
    </radialGradient>
  </>;
}

export function PrismWheelRim() {
  return <g>
    <circle cx="160" cy="160" r="139" fill="#090a11" />
    <circle cx="160" cy="160" r="135.7" fill="none" stroke="url(#prism-ring-steel)" strokeWidth="5.3" />
    <circle cx="160" cy="160" r="138" fill="none" stroke="#dec0ae" strokeWidth=".65" opacity=".58" />
    <circle cx="160" cy="160" r="134" fill="none" stroke="#ffd5a6" strokeWidth=".5" opacity=".42" />
    <circle cx="160" cy="160" r="131.4" fill="#12182b" stroke="url(#prism-rim-light)" strokeWidth="2" />
  </g>;
}

const facetFinishes = ['copper', 'gunmetal', 'spectrum', 'gunmetal', 'copper', 'gunmetal', 'spectrum',
  'gunmetal', 'copper', 'gunmetal', 'spectrum', 'gunmetal', 'copper', 'spectrum'] as const;

export function PrismWheelChassis({ sides = 14, image }: { sides?: number; image?: string }) {
  if (image) return <svg className="rg-prism-chassis" viewBox="0 0 320 320" aria-hidden="true">
    <image className="rg-prism-illustrated-wall" href={image} x="3" y="22"
      width="314" height="315" preserveAspectRatio="none" />
    <circle cx="160" cy="160" r="140" fill="#23161a" />
    <image className="rg-prism-illustrated-rim" href={image} width="320" height="320" preserveAspectRatio="none" />
    <circle cx="160" cy="160" r="140" fill="none" stroke="#55312a" strokeWidth="2.1" />
    <path d="M27 204a140 140 0 0 0 226 60" fill="none" stroke="#ff934a"
      strokeOpacity=".75" strokeWidth="1.1" strokeLinecap="round" />
  </svg>;
  const chassisPoint = (radius: number, sector: number, verticalOffset = 0) => {
    const angle = sector * 2 * Math.PI / sides - Math.PI / 2;
    return `${160 + radius * Math.cos(angle)},${160 + radius * Math.sin(angle) + verticalOffset}`;
  };
  const chassisOutline = Array.from({ length: sides }, (_, index) => chassisPoint(159, index)).join(' ');
  const finishes = Array.from({ length: sides }, (_, index) => facetFinishes[index % facetFinishes.length]);
  return <svg className="rg-prism-chassis" viewBox="0 0 320 320" aria-hidden="true">
    <defs>
      <linearGradient id="prism-case-gunmetal" x2="1" y2="1">
        <stop stopColor="#828193" /><stop offset=".27" stopColor="#42414d" />
        <stop offset=".63" stopColor="#221e27" /><stop offset="1" stopColor="#100e17" />
      </linearGradient>
      <linearGradient id="prism-case-copper" x2="1" y2="1">
        <stop stopColor="#1d1620" /><stop offset=".32" stopColor="#513638" />
        <stop offset=".43" stopColor="var(--volt-bevel,#c47b4d)" /><stop offset=".5" stopColor="var(--volt-bright,#ffd0a2)" />
        <stop offset=".59" stopColor="var(--volt-metal,#744633)" /><stop offset="1" stopColor="#26202a" />
      </linearGradient>
      <linearGradient id="prism-case-spectrum" x2="1" y2="1">
        <stop stopColor="#1a1824" /><stop offset=".34" stopColor="#363143" />
        <stop offset=".46" stopColor="var(--volt-reflection,#bf80e8)" /><stop offset=".53" stopColor="var(--volt-bright,#62c5ed)" />
        <stop offset=".6" stopColor="var(--volt-metal,#384a65)" /><stop offset="1" stopColor="#1c1a29" />
      </linearGradient>
      <linearGradient id="prism-case-wall" x2="0" y2="1">
        <stop stopColor="#04050b" stopOpacity=".25" /><stop offset=".45" stopColor="#08080f" stopOpacity=".5" />
        <stop offset="1" stopColor="#02040c" stopOpacity=".95" />
      </linearGradient>
      <filter id="prism-case-brushed" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency=".28 .63" numOctaves="2" seed="5" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <clipPath id="prism-case-outline"><polygon points={chassisOutline} /></clipPath>
    </defs>
    {finishes.map((finish, index) => <g key={index}>
      <polygon points={[
        chassisPoint(159, index), chassisPoint(159, index + 1),
        chassisPoint(154, index + 1, 15), chassisPoint(154, index, 15),
      ].join(' ')} fill={`url(#prism-case-${finish})`} />
      <polygon points={[
        chassisPoint(159, index), chassisPoint(159, index + 1),
        chassisPoint(154, index + 1, 15), chassisPoint(154, index, 15),
      ].join(' ')} fill="url(#prism-case-wall)" stroke="#13101a" strokeWidth=".55" />
    </g>)}
    <polygon points={chassisOutline} fill="var(--volt-deep,#25212b)" stroke="#717080" strokeWidth=".75" />
    {finishes.map((finish, index) => {
      const a = chassisPoint(159, index);
      const b = chassisPoint(159, index + 1);
      const c = chassisPoint(141, index + 1);
      const d = chassisPoint(141, index);
      const fold = chassisPoint(150, index + .52);
      return <g key={index}>
        <polygon points={`${a} ${b} ${fold}`} fill={`url(#prism-case-${finish})`} />
        <polygon points={`${a} ${fold} ${d}`} fill="url(#prism-case-gunmetal)" />
        <polygon points={`${fold} ${b} ${c} ${d}`} fill={`url(#prism-case-${finish})`} opacity=".53" />
        <polyline points={`${a} ${b}`} fill="none" stroke="#f8cdbb" strokeOpacity=".48" strokeWidth=".7" />
        <polyline points={`${a} ${fold}`} fill="none" stroke="#e4d8ff" strokeOpacity=".34" strokeWidth=".6" />
      </g>;
    })}
    <rect width="320" height="320" clipPath="url(#prism-case-outline)"
      filter="url(#prism-case-brushed)" opacity=".17" style={{ mixBlendMode: 'soft-light' }} />
    <circle cx="160" cy="160" r="143" fill="none" stroke="#100d17" strokeWidth="5" />
    <circle cx="160" cy="160" r="145.7" fill="none" stroke="#c28b69" strokeWidth=".7" strokeOpacity=".7" />
    <circle cx="160" cy="160" r="140.5" fill="none" stroke="#e2c2b6" strokeWidth=".9" strokeOpacity=".6" />
  </svg>;
}

export function PrismWheelBowl() {
  return <g>
    <circle cx="160" cy="160" r="87" fill="#090e1f" stroke="url(#prism-ring-steel)" strokeWidth="3.5" />
    <circle cx="160" cy="160" r="83" fill="url(#prism-bowl-enamel)" stroke="#050a19" strokeWidth="2.2" />
    <circle cx="160" cy="160" r="79" fill="url(#rg-grain)" opacity=".48" />
    <path d="M93 126a75 75 0 0 1 42-36M188 230a75 75 0 0 0 39-34"
      fill="none" stroke="url(#prism-rim-light)" strokeWidth="3" strokeLinecap="round" opacity=".58" />
    <path d="M217 126a67 67 0 0 1 9 35"
      fill="none" stroke="#9b75ec" strokeWidth="2.2" strokeLinecap="round" opacity=".3" />
    <path d="M99 181a65 65 0 0 0 31 39M179 92a70 70 0 0 1 37 27"
      fill="none" stroke="var(--volt-bright,#8aecff)" strokeWidth="2.4" strokeLinecap="round" opacity=".27" />
    <path d="M183 227a71 71 0 0 0 38-33"
      fill="none" stroke="var(--volt-reflection,#cf86eb)" strokeWidth="2.3" strokeLinecap="round" opacity=".32" />
  </g>;
}

export function PrismWheelSpoke() {
  return <g>
    <path d="M161 99v41" stroke="#02050f" strokeWidth="11" strokeLinecap="round" opacity=".74" />
    <path d="M156 102h8l1.1 40h-10.2Z" fill="url(#prism-spoke-steel)" stroke="#46536b" strokeWidth=".65" />
    <path d="M159 104v34" stroke="#eaf5ff" strokeWidth=".7" opacity=".74" />
    <circle cx="160" cy="100" r="5.6" fill="#090e1c" />
    <circle cx="160" cy="99" r="5" fill="url(#prism-titanium)" stroke="#b6c7e6" strokeWidth=".7" />
    <path d="M157 98a4 4 0 0 1 5-2" fill="none" stroke="#edf6ff" strokeWidth=".7" opacity=".84" />
  </g>;
}

export function PrismWheelHub({ crystal, large = false }: { crystal: string; large?: boolean }) {
  return <svg className="rg-prism-spindle" viewBox="0 0 320 320" aria-hidden="true">
    <defs>
      {large && <radialGradient id="prism-volcanic-reflection">
        <stop stopColor="#ffab57" stopOpacity=".55" />
        <stop offset=".45" stopColor="#f5612f" stopOpacity=".25" />
        <stop offset="1" stopColor="#c04326" stopOpacity="0" />
      </radialGradient>}
      <radialGradient id="prism-contact-shadow">
        <stop stopColor="#02040b" stopOpacity=".94" />
        <stop offset=".61" stopColor="#03060f" stopOpacity=".68" />
        <stop offset="1" stopColor="#050915" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="prism-spindle-wall">
        <stop stopColor="#050810" /><stop offset=".21" stopColor="#20273c" />
        <stop offset=".39" stopColor="#4c5973" /><stop offset=".57" stopColor="#252e43" />
        <stop offset=".83" stopColor="#1b2337" /><stop offset="1" stopColor="#070a13" />
      </linearGradient>
      <linearGradient id="prism-spindle-chrome">
        <stop stopColor="#101b33" /><stop offset=".22" stopColor="#7386ae" />
        <stop offset=".36" stopColor="#d1e3f6" /><stop offset=".53" stopColor="#526689" />
        <stop offset=".7" stopColor="#263450" /><stop offset=".88" stopColor="#8595b7" />
        <stop offset="1" stopColor="#202c47" />
      </linearGradient>
      <linearGradient id="prism-spindle-top" x2="0" y2="1">
        <stop stopColor="var(--volt-bowl,#283454)" /><stop offset=".52" stopColor="var(--volt-deep,#17223f)" />
        <stop offset=".89" stopColor="var(--volt-metal,#465475)" /><stop offset="1" stopColor="var(--volt-bright,#9baece)" />
      </linearGradient>
    </defs>

    <g transform="translate(160 160)">
      {large && <ellipse cy="12" rx="57" ry="30" fill="url(#prism-volcanic-reflection)" />}
      <ellipse cx="7" cy="13" rx="43" ry="26" fill="url(#prism-contact-shadow)" transform="rotate(12 7 13)" />
      <path d="M-29 0a29 16 0 0 1 58 0l2 10a31 17 0 0 1-62 0Z"
        fill="url(#prism-spindle-wall)" stroke="#070b17" />
      <ellipse rx="29" ry="16" fill="url(#prism-spindle-top)" stroke="#727f9e" strokeWidth=".65" />
      <path d="M-27 5a28 14 0 0 0 54 0" fill="none" stroke="#d6e1fa" strokeWidth=".8" opacity=".55" />

      <path d="M-22-8h44v7a22 12 0 0 1-44 0Z" fill="url(#prism-spindle-wall)" stroke="#080e1f" strokeWidth=".8" />
      <ellipse cy="-8" rx="22" ry="12" fill="url(#prism-spindle-top)" stroke="#a6b4d3" strokeWidth=".8" />
      <ellipse cy="-8" rx="14" ry="7" fill="#0b1428" />
      <path d="M-10-22h20v13a10 5 0 0 1-20 0Z" fill="url(#prism-spindle-chrome)" stroke="#0c1326" strokeWidth=".7" />
      <ellipse cy="-22" rx="10" ry="5" fill="#566c96" stroke="#c4dfff" strokeWidth=".8" />
      {large && <path d="M-27 4a28 14 0 0 0 54 0M-20-7a20 9 0 0 0 38 1"
        fill="none" stroke="#f59656" strokeWidth="1.35" strokeOpacity=".76" />}

      <image className="rg-prism-crystal"
        href={crystal}
        x={large ? -31 : -21} y={large ? -105 : -83} width={large ? 62 : 42}
        height={large ? 85 : 63} preserveAspectRatio="xMidYMax meet" />
    </g>
  </svg>;
}
