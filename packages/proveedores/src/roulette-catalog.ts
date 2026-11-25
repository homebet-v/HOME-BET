import { voltRouletteThemes } from './roulette-volt-themes';

/** Presentation catalog only. */
export const ROULETTE_LAYOUTS = [
 {id:'classic',name:'Clásica',description:'Rueda protagonista y tablero debajo.',targetThemes:10},
 {id:'table',name:'Mesa protagonista',description:'Rueda lateral compacta y tablero de números amplio.',targetThemes:10},
 {id:'alternating',name:'Vista alternada',description:'El tablero y la rueda comparten el centro; el giro muestra la rueda.',targetThemes:10},
 {id:'compact',name:'Compacta',description:'Apuestas rápidas visibles y tablero completo en una tarjeta.',targetThemes:10},
] as const;
export type RouletteLayout=typeof ROULETTE_LAYOUTS[number]['id'];
export type VoltWheelFinish = {
 facets: number;
 spokes: number;
 lettering: 'engraved' | 'light' | 'industrial';
 hue: number;
 chassisImage?: string;
 centerImage?: string;
 rewardArt?: 'volcanic';
 multiplierImages?: Partial<Record<50 | 100 | 250, string>>;
};
export type RouletteTheme={
 slug:string;name:string;layout:RouletteLayout;wheelStyle:'classic'|'star'|'shell'|'hex';description:string;emblem:string;
 accent:string;secondary:string;surface:string;felt:string;metalLight:string;metalDark:string;woodLight:string;woodDark:string;
 artRoot:string;cover:string;coverFormat?:'portrait';scene:string;spinsMs:number;voice:OscillatorType;note:number;
 variant?: 'prism';
 voltFinish?: VoltWheelFinish;
};
export const voltFoundry = { slug: 'volt-foundry', name: 'Volt Foundry' } as const;
const art=(slug:string)=>`/images/roulette/${slug}`;
const originalThemes:RouletteTheme[]=[
 {slug:'royal-gold',name:'Royal Gold',layout:'classic',wheelStyle:'classic',description:'Oro, nogal y terciopelo. La rueda ocupa el centro de la mesa clásica.',emblem:'♛',accent:'#efcc76',secondary:'#f4d788',surface:'#211009',felt:'#601426',metalLight:'#fff0a7',metalDark:'#683309',woodLight:'#bc783f',woodDark:'#3c180c',artRoot:art('royal-gold'),cover:`${art('royal-gold')}/cover-v3.webp`,coverFormat:'portrait',scene:`${art('royal-gold')}/scene.webp`,spinsMs:4600,voice:'sine',note:440},
 {slug:'neon-vegas',name:'Neon Vegas',layout:'table',wheelStyle:'star',description:'Cromo y neón. Tablero de seis columnas, rueda a un lado y controles junto a la apuesta.',emblem:'✦',accent:'#f472d0',secondary:'#67e8f9',surface:'#10091f',felt:'#221135',metalLight:'#bef8ff',metalDark:'#204b67',woodLight:'#6c477f',woodDark:'#160c2a',artRoot:art('neon-vegas'),cover:`${art('neon-vegas')}/cover-v3.webp`,coverFormat:'portrait',scene:`${art('neon-vegas')}/scene.webp`,spinsMs:4000,voice:'triangle',note:554},
 {slug:'coral-palace',name:'Coral Palace',layout:'alternating',wheelStyle:'shell',description:'Nácar, coral y turquesa. Elegí apuestas en el tablero y mirá la rueda al girar.',emblem:'❋',accent:'#5eead4',secondary:'#f9b9dd',surface:'#071e2b',felt:'#103f4b',metalLight:'#fff4d2',metalDark:'#517987',woodLight:'#80c6ce',woodDark:'#14394b',artRoot:art('coral-palace'),cover:`${art('coral-palace')}/cover-v3.webp`,coverFormat:'portrait',scene:`${art('coral-palace')}/scene.webp`,spinsMs:4800,voice:'sine',note:660},
 {slug:'cyber-wheel',name:'Cyber Wheel',layout:'compact',wheelStyle:'hex',description:'Titanio y circuitos verdes. Accesos rápidos y tablero completo en una tarjeta.',emblem:'⬡',accent:'#a3e635',secondary:'#6ee7b7',surface:'#071613',felt:'#0e3024',metalLight:'#e0f2e9',metalDark:'#3d5b54',woodLight:'#43856b',woodDark:'#0c2420',artRoot:art('cyber-wheel'),cover:`${art('cyber-wheel')}/cover-v3.webp`,coverFormat:'portrait',scene:`${art('cyber-wheel')}/scene.webp`,spinsMs:3400,voice:'triangle',note:330},
];
type ThemeSeed={slug:string;name:string;layout:RouletteLayout;wheelStyle:RouletteTheme['wheelStyle'];description:string;emblem:string;accent:string;secondary:string;surface:string;felt:string};
const familyDefaults:Record<RouletteLayout,{artSlug:string;metalLight:string;metalDark:string;woodLight:string;woodDark:string;spinsMs:number;voice:OscillatorType;note:number}>={
 classic:{artSlug:'royal-gold',metalLight:'#fff0a7',metalDark:'#683309',woodLight:'#bc783f',woodDark:'#3c180c',spinsMs:4600,voice:'sine',note:440},
 table:{artSlug:'neon-vegas',metalLight:'#bef8ff',metalDark:'#204b67',woodLight:'#6c477f',woodDark:'#160c2a',spinsMs:4000,voice:'triangle',note:554},
 alternating:{artSlug:'coral-palace',metalLight:'#fff4d2',metalDark:'#517987',woodLight:'#80c6ce',woodDark:'#14394b',spinsMs:4800,voice:'sine',note:660},
 compact:{artSlug:'cyber-wheel',metalLight:'#e0f2e9',metalDark:'#3d5b54',woodLight:'#43856b',woodDark:'#0c2420',spinsMs:3400,voice:'triangle',note:330},
};
function createTheme(seed:ThemeSeed):RouletteTheme{
 const family=familyDefaults[seed.layout],root=art(seed.slug);
 return{...seed,metalLight:seed.secondary,metalDark:seed.accent,woodLight:seed.secondary,woodDark:seed.surface,artRoot:art(family.artSlug),cover:`${root}/cover-v3.webp`,coverFormat:'portrait',scene:`${root}/scene.webp`,spinsMs:family.spinsMs,voice:family.voice,note:family.note};
}
const additionalThemes:ThemeSeed[]=[
 {slug:'sapphire-crown',name:'Sapphire Crown',layout:'classic',wheelStyle:'classic',description:'Salón de zafiros, terciopelo azul y plata tallada.',emblem:'♕',accent:'#5789e8',secondary:'#d5e7ff',surface:'#08162e',felt:'#10264b'},
 {slug:'ruby-dynasty',name:'Ruby Dynasty',layout:'classic',wheelStyle:'star',description:'Salón imperial de rubíes, esmalte carmesí y oro antiguo.',emblem:'♜',accent:'#d43b55',secondary:'#ffd0ad',surface:'#260b16',felt:'#521324'},
 {slug:'emerald-court',name:'Emerald Court',layout:'classic',wheelStyle:'hex',description:'Mármol verde, hojas de oro y lámparas de cristal.',emblem:'♧',accent:'#3eaa79',secondary:'#c6f3c5',surface:'#071b17',felt:'#123b31'},
 {slug:'venetian-fortune',name:'Venetian Fortune',layout:'classic',wheelStyle:'shell',description:'Un palazzo veneciano con máscaras, canales y bronce pulido.',emblem:'⚜',accent:'#bd884d',secondary:'#ffe0a0',surface:'#21100b',felt:'#4a2418'},
 {slug:'midnight-majesty',name:'Midnight Majesty',layout:'classic',wheelStyle:'classic',description:'Noche de gala entre ónix, amatista y destellos dorados.',emblem:'✥',accent:'#8862d8',secondary:'#e2c7ff',surface:'#130d29',felt:'#2b1744'},
 {slug:'desert-sultan',name:'Desert Sultan',layout:'classic',wheelStyle:'star',description:'Cúpulas de cobre, mosaicos de lapislázuli y arena cálida.',emblem:'☀',accent:'#cc793d',secondary:'#ffe0a1',surface:'#29140d',felt:'#58301a'},
 {slug:'imperial-jade',name:'Imperial Jade',layout:'classic',wheelStyle:'hex',description:'Jade tallado, seda verde y ornamentación imperial.',emblem:'❖',accent:'#299a7a',secondary:'#d0f2bd',surface:'#061b19',felt:'#10423a'},
 {slug:'crystal-ballroom',name:'Crystal Ballroom',layout:'classic',wheelStyle:'shell',description:'Salón de baile de cristal con reflejos de hielo y platino.',emblem:'✣',accent:'#64bfd0',secondary:'#e1fbff',surface:'#0a1b2b',felt:'#14364c'},
 {slug:'moonstone-casino',name:'Moonstone Casino',layout:'classic',wheelStyle:'star',description:'Piedra lunar, plata fría y una sala bañada por luz azul.',emblem:'☽',accent:'#7f9fe8',secondary:'#e4e9ff',surface:'#10162d',felt:'#202d4d'},
 {slug:'velvet-777',name:'Velvet 777',layout:'table',wheelStyle:'classic',description:'Luces de marquesina, terciopelo rojo y suerte de medianoche.',emblem:'777',accent:'#fa526e',secondary:'#ffe08a',surface:'#240a20',felt:'#49122a'},
 {slug:'diamond-district',name:'Diamond District',layout:'table',wheelStyle:'hex',description:'Rascacielos de cristal, diamantes y neón blanco azulado.',emblem:'◇',accent:'#63d8ef',secondary:'#edfcff',surface:'#071828',felt:'#10334b'},
 {slug:'electric-avenue',name:'Electric Avenue',layout:'table',wheelStyle:'star',description:'Una avenida nocturna encendida en magenta y cian.',emblem:'⚡',accent:'#ec46d1',secondary:'#7dfbff',surface:'#1b0825',felt:'#381148'},
 {slug:'miami-royale',name:'Miami Royale',layout:'table',wheelStyle:'shell',description:'Palmeras, luces art déco y un atardecer rosa sobre la bahía.',emblem:'✺',accent:'#f47c9d',secondary:'#ffd777',surface:'#21102a',felt:'#482043'},
 {slug:'starlight-lounge',name:'Starlight Lounge',layout:'table',wheelStyle:'classic',description:'Un club elegante bajo constelaciones y lámparas de cristal.',emblem:'✴',accent:'#9b77ef',secondary:'#8eeeff',surface:'#100d2a',felt:'#211849'},
 {slug:'tokyo-jackpot',name:'Tokyo Jackpot',layout:'table',wheelStyle:'hex',description:'Neones de Tokio, lluvia brillante y acentos rojo cereza.',emblem:'東京',accent:'#ef405e',secondary:'#65efff',surface:'#120a20',felt:'#32122f'},
 {slug:'disco-fortune',name:'Disco Fortune',layout:'table',wheelStyle:'star',description:'Pista disco, bolas espejadas y destellos violetas.',emblem:'♫',accent:'#bf65f0',secondary:'#f8e36c',surface:'#190d2a',felt:'#35174e'},
 {slug:'high-roller-boulevard',name:'High Roller Boulevard',layout:'table',wheelStyle:'classic',description:'La gran avenida del juego con oro, ónix y luces blancas.',emblem:'♣',accent:'#c99c49',secondary:'#fff0bc',surface:'#15110d',felt:'#322315'},
 {slug:'chrome-palace',name:'Chrome Palace',layout:'table',wheelStyle:'hex',description:'Cromo espejado, geometría art déco y neón azul eléctrico.',emblem:'⌬',accent:'#63bde9',secondary:'#e8f9ff',surface:'#0b1723',felt:'#193349'},
 {slug:'pearl-atlantis',name:'Pearl Atlantis',layout:'alternating',wheelStyle:'shell',description:'Un palacio submarino de perlas, nácar y columnas coralinas.',emblem:'◉',accent:'#53d6c7',secondary:'#ffbde2',surface:'#071d2a',felt:'#10434b'},
 {slug:'sakura-tide',name:'Sakura Tide',layout:'alternating',wheelStyle:'star',description:'Cerezos en flor sobre un santuario junto al mar.',emblem:'✿',accent:'#ed76ad',secondary:'#ffe2c5',surface:'#241025',felt:'#4a2042'},
 {slug:'moonlit-lagoon',name:'Moonlit Lagoon',layout:'alternating',wheelStyle:'classic',description:'Laguna nocturna, agua plateada y nenúfares luminosos.',emblem:'☽',accent:'#737de0',secondary:'#c7e9ff',surface:'#0b1230',felt:'#172954'},
 {slug:'sunken-treasure',name:'Sunken Treasure',layout:'alternating',wheelStyle:'hex',description:'Ruinas sumergidas, cofres antiguos y monedas bajo el agua.',emblem:'⚓',accent:'#d19b52',secondary:'#7cf2df',surface:'#111d20',felt:'#183d39'},
 {slug:'aurora-reef',name:'Aurora Reef',layout:'alternating',wheelStyle:'shell',description:'Un arrecife tropical iluminado por auroras verdes y violetas.',emblem:'⌁',accent:'#59d7be',secondary:'#d4a0ff',surface:'#091a2a',felt:'#103b48'},
 {slug:'mermaids-pearl',name:"Mermaid's Pearl",layout:'alternating',wheelStyle:'star',description:'Conchas iridiscentes y jardines submarinos de coral rosado.',emblem:'♙',accent:'#e46cac',secondary:'#8cebe7',surface:'#201027',felt:'#42234b'},
 {slug:'jade-lagoon',name:'Jade Lagoon',layout:'alternating',wheelStyle:'hex',description:'Aguas de jade, templos cubiertos de musgo y flores flotantes.',emblem:'❇',accent:'#42a981',secondary:'#c8ed9c',surface:'#071c1b',felt:'#10443b'},
 {slug:'poseidons-trident',name:"Poseidon's Trident",layout:'alternating',wheelStyle:'classic',description:'Columnas de mármol azul, olas profundas y destellos de oro.',emblem:'ψ',accent:'#4f9ed8',secondary:'#f4d992',surface:'#09192c',felt:'#123754'},
 {slug:'tropical-mirage',name:'Tropical Mirage',layout:'alternating',wheelStyle:'shell',description:'Un jardín isleño entre orquídeas, agua turquesa y luz cálida.',emblem:'❀',accent:'#39bda1',secondary:'#ffd291',surface:'#08231f',felt:'#15503f'},
 {slug:'quantum-vault',name:'Quantum Vault',layout:'compact',wheelStyle:'hex',description:'Bóveda orbital, titanio oscuro y circuitos de energía azul.',emblem:'⎔',accent:'#4b9fea',secondary:'#9ef4ff',surface:'#071623',felt:'#102f42'},
 {slug:'matrix-fortune',name:'Matrix Fortune',layout:'compact',wheelStyle:'classic',description:'Núcleo hexagonal de datos, circuitos verdes y una bóveda de acero oscuro.',emblem:'▦',accent:'#62d451',secondary:'#b8ff8c',surface:'#07170e',felt:'#12351d'},
 {slug:'plasma-circuit',name:'Plasma Circuit',layout:'compact',wheelStyle:'star',description:'Canales de plasma magenta y cian alrededor de un reactor.',emblem:'ϟ',accent:'#e84cdb',secondary:'#6af6ff',surface:'#160b25',felt:'#321346'},
 {slug:'titanium-grid',name:'Titanium Grid',layout:'compact',wheelStyle:'hex',description:'Paneles de titanio, malla hexagonal y luz verde fría.',emblem:'⬢',accent:'#6ab49d',secondary:'#d6ffe7',surface:'#0a1716',felt:'#183b34'},
 {slug:'neon-protocol',name:'Neon Protocol',layout:'compact',wheelStyle:'classic',description:'Una consola de casino futurista con líneas cian y violeta.',emblem:'⌘',accent:'#7b73ff',secondary:'#62edff',surface:'#0b1026',felt:'#1a2452'},
 {slug:'digital-dynasty',name:'Digital Dynasty',layout:'compact',wheelStyle:'star',description:'Dragones de datos y oro digital en un templo tecnológico.',emblem:'龍',accent:'#d44739',secondary:'#e8c753',surface:'#1b1012',felt:'#3b1d1c'},
 {slug:'lunar-systems',name:'Lunar Systems',layout:'compact',wheelStyle:'shell',description:'Una estación lunar de casino con plata, amatista y luz orbital.',emblem:'◐',accent:'#9a81df',secondary:'#d7e7ff',surface:'#111326',felt:'#252344'},
 {slug:'reactor-rush',name:'Reactor Rush',layout:'compact',wheelStyle:'hex',description:'Un reactor de alto voltaje rodeado de blindaje y luz ámbar.',emblem:'⚛',accent:'#e09b36',secondary:'#efff94',surface:'#1b170b',felt:'#3d3210'},
 {slug:'binary-jackpot',name:'Binary Jackpot',layout:'compact',wheelStyle:'classic',description:'Códigos luminosos, placas electrónicas y una bóveda de premios.',emblem:'∷',accent:'#43c8a4',secondary:'#a8fff0',surface:'#07191b',felt:'#12383a'},
];
export const rouletteThemes:readonly RouletteTheme[]=[...originalThemes,...additionalThemes.map(createTheme)];
export const prismRouletteTheme: RouletteTheme = {
 slug: 'prism-roulette', name: 'Prism Roulette', variant: 'prism', layout: 'classic', wheelStyle: 'hex',
 description: 'Tres números reciben multiplicadores de 50×, 100× o 250× en cada giro.',
 emblem: '◈', accent: '#a689ff', secondary: '#defdff', surface: '#0b0e1c', felt: '#171a35',
 metalLight: '#d7e4fe', metalDark: '#4a5180', woodLight: '#495e85', woodDark: '#0b1428',
 artRoot: art('prism-roulette'), cover: `${art('prism-roulette')}/cover.webp`, coverFormat: 'portrait',
 scene: `${art('prism-roulette')}/scene.webp`, spinsMs: 4400, voice: 'triangle', note: 520,
};
export const defaultRouletteTheme=rouletteThemes[0];
export const voltFoundryRouletteThemes: readonly RouletteTheme[] = [prismRouletteTheme, ...voltRouletteThemes];
export function rouletteThemeBySlug(slug:string){
 return voltFoundryRouletteThemes.find(theme => theme.slug === slug) ?? rouletteThemes.find(theme => theme.slug === slug);
}
