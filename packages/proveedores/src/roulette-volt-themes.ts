import type { RouletteTheme, VoltWheelFinish } from './roulette-catalog';

type VoltThemeSeed = Pick<RouletteTheme,
  'slug' | 'name' | 'description' | 'accent' | 'secondary' | 'surface' | 'felt' | 'metalDark' | 'woodDark' | 'note'
> & VoltWheelFinish;

const themes: readonly VoltThemeSeed[] = [
  {
    slug: 'obsidian-rift', name: 'Obsidian Rift', description: 'Obsidiana oscura, fisuras incandescentes y un eje de vidrio volcánico.',
    accent: '#f17c46', secondary: '#ffd6ab', surface: '#190e19', felt: '#3a1b25',
    metalDark: '#84544b', woodDark: '#211626', facets: 12, spokes: 4,
    lettering: 'engraved', hue: 28, note: 380,
    chassisImage: 'chassis-volcanic-v2.webp', centerImage: 'center-volcanic.webp',
    rewardArt: 'volcanic',
    multiplierImages: { 50: 'multiplier-50-v2.webp' },
  },
  {
    slug: 'aurora-vault', name: 'Aurora Vault', description: 'Luces polares, acero iridiscente y una columna de cristal verde.',
    accent: '#56e5bd', secondary: '#dafcff', surface: '#081921', felt: '#123748',
    metalDark: '#3c9b90', woodDark: '#0c2534', facets: 16, spokes: 6,
    lettering: 'light', hue: 155, note: 550,
  },
  {
    slug: 'solar-forge', name: 'Solar Forge', description: 'Bronce orbital, reflejos solares y un diamante dorado.',
    accent: '#f6a941', secondary: '#fff1ba', surface: '#21140c', felt: '#4b2b13',
    metalDark: '#a56f3b', woodDark: '#2d190f', facets: 10, spokes: 5,
    lettering: 'industrial', hue: 64, note: 660,
  },
  {
    slug: 'abyssal-crown', name: 'Abyssal Crown', description: 'Metal náutico, una corona de zafiro y reflejos en azul profundo.',
    accent: '#3cbded', secondary: '#c3eaff', surface: '#071724', felt: '#12314d',
    metalDark: '#4c778c', woodDark: '#0b1e32', facets: 18, spokes: 6,
    lettering: 'engraved', hue: 192, note: 310,
  },
  {
    slug: 'jade-reactor', name: 'Jade Reactor', description: 'Bronce negro, luces de reactor y un núcleo de jade.',
    accent: '#64e27e', secondary: '#dcffbd', surface: '#091b18', felt: '#153b2b',
    metalDark: '#447f59', woodDark: '#0c2820', facets: 12, spokes: 6,
    lettering: 'industrial', hue: 88, note: 480,
  },
  {
    slug: 'arcane-onyx', name: 'Arcane Onyx', description: 'Ónix pulido, luz violeta y una pieza de amatista suspendida.',
    accent: '#bb83ff', secondary: '#f1d9ff', surface: '#180f27', felt: '#361c49',
    metalDark: '#715092', woodDark: '#231734', facets: 8, spokes: 8,
    lettering: 'engraved', hue: 279, note: 420,
  },
  {
    slug: 'copper-orbit', name: 'Copper Orbit', description: 'Cobre envejecido, un giroscopio de ámbar y un cielo orbital.',
    accent: '#e1a26f', secondary: '#ffe4ca', surface: '#21141a', felt: '#49302d',
    metalDark: '#a27055', woodDark: '#2d2029', facets: 16, spokes: 8,
    lettering: 'engraved', hue: 42, note: 400,
  },
  {
    slug: 'frost-halo', name: 'Frost Halo', description: 'Platino helado, azul glacial y una aguja de cristal.',
    accent: '#7fd0ff', secondary: '#effaff', surface: '#101a31', felt: '#1c3d58',
    metalDark: '#7795b4', woodDark: '#10223e', facets: 18, spokes: 6,
    lettering: 'light', hue: 218, note: 590,
  },
  {
    slug: 'crimson-dynamo', name: 'Crimson Dynamo', description: 'Acero carmesí, destellos eléctricos y un octaedro de rubí.',
    accent: '#ff627f', secondary: '#ffdbd9', surface: '#250e1d', felt: '#4c172b',
    metalDark: '#ac5063', woodDark: '#2b112a', facets: 10, spokes: 5,
    lettering: 'industrial', hue: 338, note: 510,
  },
  {
    slug: 'opal-nexus', name: 'Opal Nexus', description: 'Nácar pulido, luces de ópalo y reflejos en rosa y menta.',
    accent: '#f1abd4', secondary: '#f6f5ff', surface: '#19162b', felt: '#3f2850',
    metalDark: '#897ba1', woodDark: '#29223a', facets: 20, spokes: 6,
    lettering: 'light', hue: 309, note: 700,
  },
];

export const voltRouletteThemes: readonly RouletteTheme[] = themes.map(({
  facets, spokes, lettering, hue, chassisImage, centerImage, rewardArt, multiplierImages, ...theme
}) => {
  const artRoot = `/images/roulette/${theme.slug}`;
  return {
    ...theme,
    variant: 'prism',
    layout: 'classic',
    wheelStyle: 'hex',
    voltFinish: { facets, spokes, lettering, hue, chassisImage, centerImage, rewardArt, multiplierImages },
    metalLight: theme.secondary,
    woodLight: theme.metalDark,
    emblem: '◈',
    artRoot,
    cover: `${artRoot}/cover.webp`,
    scene: `${artRoot}/scene.webp`,
    coverFormat: 'portrait',
    spinsMs: 4400,
    voice: 'triangle',
  };
});
