"use client";
import {useEffect, useRef, useState, type CSSProperties} from 'react';
import {defaultRouletteTheme,voltFoundry,type RouletteTheme} from './roulette-catalog';
import {RouletteWheelCenter} from './roulette-wheel-center';
import {PrismWheelBowl, PrismWheelChassis, PrismWheelHub, PrismWheelMaterials, PrismWheelRim, PrismWheelSpoke} from './roulette-prism-wheel';
import {ChipPicker} from './chip-picker';
import {rouletteSpinMotion} from './roulette-motion';
import {PrismBoosts, PRISM_REVEAL_STEP_MS} from './roulette-prism-boosts';
import {PrismHistory, PRISM_RESULT_FLIGHT_MS, PRISM_RESULT_PAUSE_MS} from './roulette-prism-history';
import {EUROPEAN_WHEEL,ROULETTE_CHIPS,ROULETTE_SPOTS,ROULETTE_SPOT_BY_ID,newRouletteSession,rouletteColor,rouletteStake,spinRoulette,spinPrismRoulette,PRISM_BASE_PAYOUT,type RouletteBoost,type RouletteBet,type RouletteBetKind,type RouletteRound,type RouletteSession} from './roulette-engine';
import './roulette-player.css';
import './roulette-royal-skin.css';
import './roulette-layouts.css';
import './roulette-prism.css';
const money=(cents:number)=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:0}).format(cents/100);
const compact=(cents:number)=>cents>=100000?`${cents/100000}k`:money(cents);
const kinds: {id:RouletteBetKind;label:string}[]=[{id:'straight',label:'Número'},{id:'split',label:'Caballo · 2'},{id:'street',label:'Calle · 3'},{id:'corner',label:'Cuadro · 4'},{id:'six-line',label:'Línea · 6'},{id:'dozen',label:'Docena'},{id:'column',label:'Columna'},{id:'outside',label:'Simples'}];
const point=(radius:number,degrees:number)=>{const a=(degrees-90)*Math.PI/180;return {x:160+radius*Math.cos(a),y:160+radius*Math.sin(a)}};
function Wheel({ theme, result }: { theme: RouletteTheme; result?: number }) {
 const { wheelStyle: variant } = theme;
 const prism = theme.variant === 'prism';
 const step = 360 / 37;
 const spokeCount = theme.voltFinish?.spokes ?? (variant === 'classic' ? 8 : variant === 'star' ? 5 : 6);
 const angles = Array.from({ length: spokeCount }, (_, i) => i * 360 / spokeCount);
 return <svg viewBox="0 0 320 320" aria-hidden="true">
  <defs>
   {prism && <PrismWheelMaterials />}
   <radialGradient id="rg-wood" cx=".38" cy=".27" r=".85"><stop stopColor="var(--rg-wood-light,#bc783f)"/><stop offset=".25" stopColor="var(--rg-wood-dark,#5c2c15)"/><stop offset=".48" stopColor="var(--rg-wood-dark,#3c180c)"/><stop offset=".68" stopColor="var(--rg-wood-light,#a46230)"/><stop offset=".86" stopColor="var(--rg-wood-dark,#46200f)"/><stop offset="1" stopColor="var(--rg-wood-dark,#1c0b06)"/></radialGradient>
   <linearGradient id="rg-metal" x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--rg-metal-dark,#683309)"/><stop offset=".14" stopColor="var(--rg-metal-light,#fff0a7)"/><stop offset=".3" stopColor="var(--rg-accent,#c78d35)"/><stop offset=".45" stopColor="var(--rg-metal-light,#fff5bc)"/><stop offset=".57" stopColor="var(--rg-accent,#b77520)"/><stop offset=".77" stopColor="var(--rg-metal-dark,#65320e)"/><stop offset=".9" stopColor="var(--rg-accent,#e0ad52)"/><stop offset="1" stopColor="var(--rg-metal-light,#fff0a2)"/></linearGradient>
   <radialGradient id="rg-hub" cx=".32" cy=".24" r=".78"><stop stopColor="#fffbd8"/><stop offset=".17" stopColor="#ffe69a"/><stop offset=".4" stopColor="var(--rg-accent,#d7a54c)"/><stop offset=".65" stopColor="var(--rg-metal-dark,#986020)"/><stop offset=".87" stopColor="var(--rg-metal-dark,#5d2c0a)"/><stop offset="1" stopColor="var(--rg-accent,#d8a34b)"/></radialGradient>
   <radialGradient id="rg-theme-core" cx=".32" cy=".24" r=".82"><stop stopColor="var(--rg-accent,#d7a54c)" stopOpacity=".42"/><stop offset="1" stopColor="var(--rg-wood-dark,#3c180c)"/></radialGradient>
   <linearGradient id="rg-red-pocket" x2="1" y2="1"><stop stopColor="#ed4c4c"/><stop offset=".2" stopColor="#a51628"/><stop offset="1" stopColor="#500914"/></linearGradient>
   <linearGradient id="rg-black-pocket" x2="1" y2="1"><stop stopColor="#42423b"/><stop offset=".3" stopColor="#151916"/><stop offset="1" stopColor="#060908"/></linearGradient>
   <linearGradient id="rg-green-pocket" x2="1" y2="1"><stop stopColor="#58bf63"/><stop offset=".3" stopColor="#087b42"/><stop offset="1" stopColor="#02391f"/></linearGradient>
   <pattern id="rg-grain" width="27" height={variant==='hex'?26:19} patternUnits="userSpaceOnUse" patternTransform={variant==='classic'?'rotate(-23)':undefined}>
    {variant==='classic'?<><path d="M-4 4Q9-2 30 5M-4 11Q9 4 30 12M-4 17Q14 10 30 18" fill="none" stroke="#f2ba72" strokeWidth=".6" opacity=".12"/><path d="M-4 7Q12 0 30 8M-4 14Q12 7 30 15" fill="none" stroke="#180704" strokeWidth="1.1" opacity=".22"/></>:variant==='star'?<path d="M-10-10L37 37M-4-10L37 31M2-10L37 25" fill="none" stroke="var(--rg-metal-light)" strokeWidth=".5" opacity=".12"/>:variant==='shell'?<path d="M-3 7Q7-3 14 6T30 7M-3 15Q7 5 14 14T30 15" fill="none" stroke="var(--rg-secondary)" strokeWidth="1.5" opacity=".16"/>:<g fill="none" stroke="var(--rg-accent)" strokeWidth=".6" opacity=".2"><path d="M13 1L25 7V19L13 25L1 19V7ZM13 1V8M25 19H19"/><circle cx="13" cy="9" r="1.5"/><circle cx="18" cy="19" r="1.5"/></g>}
   </pattern>
   <radialGradient id="rg-wheel-shine" cx=".25" cy=".1"><stop stopColor="#fff8d6" stopOpacity=".28"/><stop offset=".55" stopColor="#fff8d6" stopOpacity="0"/></radialGradient>
  </defs>
  {prism ? <PrismWheelRim /> : <>
  <circle cx="160" cy="160" r="158" fill="#140704" stroke="#eac16e" strokeWidth="2"/>
  <circle cx="160" cy="160" r="153" fill="url(#rg-wood)" stroke="url(#rg-metal)" strokeWidth="7"/>
  <circle cx="160" cy="160" r="147" fill="url(#rg-grain)" stroke="#281005" strokeWidth="2"/>
  <circle cx="160" cy="160" r="141" fill="none" stroke="#cf9950" strokeWidth="1.5"/>
  <circle cx="160" cy="160" r="135" fill="#0b0a07" stroke="#38200e" strokeWidth="5"/>
  <circle cx="160" cy="160" r="131" fill="#171008" stroke="url(#rg-metal)" strokeWidth="3"/>
  </>}
  {EUROPEAN_WHEEL.map((n,i)=>{
   const a=i*step-step/2,b=a+step,p=point(129,a),q=point(129,b),r=point(88,b),s=point(88,a),t=point(119,i*step),u=point(108,a),v=point(108,b);
   const color=rouletteColor(n);
   const pocket = `M${p.x},${p.y} A129,129 0 0 1 ${q.x},${q.y} L${r.x},${r.y} A88,88 0 0 0 ${s.x},${s.y} Z`;
   return <g key={n}>
    <path d={pocket} fill={`url(#rg-${color}-pocket)`} stroke={prism?'#738db4':'#d5ad61'} strokeWidth=".65"/>
    {prism && <path d={pocket} fill="url(#prism-pocket-depth)"/>}
    <path d={`M${u.x},${u.y} A108,108 0 0 1 ${v.x},${v.y}`} fill="none" stroke={prism?'#a8c6ed':'#eacb7e'} strokeWidth="1.1"/>
    {prism && <path d={`M${v.x},${v.y} L${r.x},${r.y}`} stroke="#030714" strokeWidth="2.8"/>}
    <path d={`M${v.x},${v.y} L${r.x},${r.y}`} stroke={prism?'#cce6ff':'#ffedb4'} strokeWidth="1" opacity=".8"/>
    {prism && n === result && <path className="rg-prism-result-pocket" d={pocket} />}
    <text x={t.x} y={t.y} textAnchor="middle" dominantBaseline="central" transform={`rotate(${i*step} ${t.x} ${t.y})`} fill="#fff9df" fontFamily="Georgia,serif" fontSize="10.5" fontWeight="700" stroke="#130904" strokeWidth=".2" paintOrder="stroke">{n}</text>
   </g>;
  })}
  {prism ? <PrismWheelBowl /> : <>
  <circle cx="160" cy="160" r="87" fill="url(#rg-wood)" stroke="url(#rg-metal)" strokeWidth="4"/>
  <circle cx="160" cy="160" r="84" fill="url(#rg-grain)" stroke="#241007" strokeWidth="2"/>
  {[28,44,63,79].map(r=><circle key={r} cx="160" cy="160" r={r} fill="none" stroke="#dda45f" strokeWidth=".65" opacity=".22"/>)}
  </>}
  {angles.map(a=><g key={a} transform={`rotate(${a} 160 160)`}>{prism ? <PrismWheelSpoke /> : <><path d="M160 108V144" stroke="#1f0a04" strokeWidth="8" opacity=".6"/>{variant==='shell'?<path d="M160 106C144 115 169 133 160 149" fill="none" stroke="url(#rg-metal)" strokeWidth="5"/>:<rect x={variant==='hex'?156:157} y="107" width={variant==='hex'?8:6} height="43" rx={variant==='hex'?1:3} fill="url(#rg-metal)" stroke="#814b17" strokeWidth=".6"/>}<path d="M158.5 110V144" stroke="#fff2b3" strokeWidth="1" opacity=".8"/><circle cx="160" cy="106" r="5" fill="url(#rg-hub)" stroke="#b0792a" strokeWidth="1"/></>}</g>)}
  {variant==='shell'&&Array.from({length:12},(_,i)=>{const p=point(76,i*30);return <circle key={i} cx={p.x} cy={p.y} r="2.6" fill="url(#rg-hub)"/>})}
  {!prism&&variant==='hex'&&[0,45,90,135,180,225,270,315].map(a=>{const p=point(145,a);return <circle key={a} cx={p.x} cy={p.y} r="2.6" fill="#122c23" stroke="var(--rg-accent)" strokeWidth="1.2"/>})}
  {!prism && <RouletteWheelCenter slug={theme.slug} variant={variant}/>}
  {theme.slug !== 'obsidian-rift' && <circle cx="160" cy="160" r="155" fill="url(#rg-wheel-shine)" pointerEvents="none"/>}
 </svg>;
}
function ActionIcon({kind}:{kind:'undo'|'spin'|'repeat'}){
 return <svg className="rg-action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">{kind==='undo'?<path d="M9 5L4 10L9 15M4 10H14C18 10 20 13 20 17"/>:kind==='repeat'?<path d="M20 9A8 8 0 1 0 20 16M16 9H21V4"/>:<path d="M4 7A8 8 0 0 1 18 5L21 8M21 3V8H16M20 17A8 8 0 0 1 6 19L3 16M3 21V16H8"/>}</svg>;
}
export default function RoulettePlayer({onExit,theme=defaultRouletteTheme,openingBalance,play}:{onExit?:()=>void;theme?:RouletteTheme;openingBalance?:number;play?:(roundId:string,bets:readonly RouletteBet[])=>Promise<{balanceCents:number;lastRound:RouletteRound}>}){
 const cash = play != null;
 const isPrism = theme.variant === 'prism';
 const [revealingBoosts, setRevealingBoosts] = useState(false);
 const wheelStage = useRef<HTMLElement>(null);
 const wheelRotor = useRef<HTMLDivElement>(null);
 const ballOrbit = useRef<HTMLDivElement>(null);
 const waitingMotion = useRef<readonly { element: HTMLDivElement; animation: Animation; from: number; turn: number; ms: number }[]>([]);
 const [spinningBoosts, setSpinningBoosts] = useState<readonly RouletteBoost[]>([]);
 const [view,setView]=useState<'table'|'wheel'>('table');
 const chipTrigger=useRef<HTMLButtonElement>(null);
 const [chipOpen,setChipOpen]=useState(false);
 const [session,setSession]=useState(()=>newRouletteSession(openingBalance));
 const [bets,setBets]=useState<RouletteBet[]>([]);const [chip,setChip]=useState<number>(5000);
 const [spinning,setSpinning]=useState(false),[rotation,setRotation]=useState(0),[ballRotation,setBallRotation]=useState(0),[duration,setDuration]=useState(4600),[wheelDuration,setWheelDuration]=useState(4600);
 const [panel,setPanel]=useState<'table'|'rules'|null>(null),[kind,setKind]=useState<RouletteBetKind>('straight'),[chosen,setChosen]=useState('split-1-2');
 const [notice,setNotice]=useState(cash && openingBalance === 0 ? 'No tenés fichas. Cargalas desde el panel.' : 'Elegí una ficha y tocá el tablero.'),[prize,setPrize]=useState(false),[sound,setSound]=useState(false);
 const [betFeedback, setBetFeedback] = useState<{ id: string; amount: number; sequence: number } | null>(null);
 const feedbackSequence = useRef(0);
 const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
 const prizeTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const pending=useRef<RouletteSession|null>(null),busy=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|null>(null),audio=useRef<AudioContext|null>(null),panelRef=useRef<HTMLDialogElement>(null);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);if(prizeTimer.current)clearTimeout(prizeTimer.current);if(feedbackTimer.current)clearTimeout(feedbackTimer.current);waitingMotion.current.forEach(({animation})=>animation.cancel());waitingMotion.current=[];void audio.current?.close()},[]);
 useEffect(()=>{if(panel)panelRef.current?.showModal();else panelRef.current?.close()},[panel]);
 const stake=rouletteStake(bets);const amounts=new Map<string,number>();for(const b of bets)amounts.set(b.spotId,(amounts.get(b.spotId)??0)+b.amountCents);
 const tone=(frequency:number)=>{if(!sound)return;try{audio.current??=new AudioContext();void audio.current.resume();const oscillator=audio.current.createOscillator(),gain=audio.current.createGain();oscillator.connect(gain);gain.connect(audio.current.destination);oscillator.type=theme.voice;oscillator.frequency.value=frequency*theme.note/440;gain.gain.setValueAtTime(.035,audio.current.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.current.currentTime+.15);oscillator.start();oscillator.stop(audio.current.currentTime+.16)}catch{/* Sound is optional. */}};
 const add = (id: string) => {
  if (pending.current || spinning || busy.current) return;
  try {
   const next = [...bets, { spotId: id, amountCents: chip }];
   if (rouletteStake(next) > session.balanceCents) throw new Error('Fichas insuficientes para esta apuesta.');
   setBets(next);
   setPrize(false);
   setNotice(`${ROULETTE_SPOT_BY_ID.get(id)!.label}: +${money(chip)} fichas`);
   if (isPrism) {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setBetFeedback({ id, amount: chip, sequence: ++feedbackSequence.current });
    feedbackTimer.current = setTimeout(() => setBetFeedback(null), 700);
   }
   tone(550);
  } catch (error) {
   setNotice((error as Error).message);
  }
 };
 const finish = () => {
  const next = pending.current;
  if (!next) return;
  pending.current = null;
  if (timer.current) clearTimeout(timer.current);
  setSession(next);
  setSpinning(false);
  const result = next.lastRound!;
  const color = { green: 'cero', red: 'rojo', black: 'negro' }[rouletteColor(result.number)];
  setNotice(`Salió ${result.number}, ${color}. ${result.payoutCents ? `Cobrás ${money(result.payoutCents)} fichas.` : 'Sin premio.'}`);
  const animateResult = isPrism && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prizeDelay = animateResult ? PRISM_RESULT_PAUSE_MS + PRISM_RESULT_FLIGHT_MS : theme.layout === 'table' ? 1100 : 0;
  if (result.payoutCents && prizeDelay) {
   prizeTimer.current = setTimeout(() => setPrize(true), prizeDelay);
  } else {
   setPrize(result.payoutCents > 0);
  }
  tone(result.payoutCents ? 880 : 220);
 };
 const startWaitingMotion = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const wheel = wheelRotor.current, ball = ballOrbit.current;
  if (!wheel || !ball) return;
  const start = (element: HTMLDivElement, from: number, turn: number, ms: number) => ({
   element, from, turn, ms,
   animation: element.animate(
    [{transform: `rotate(${from}deg)`}, {transform: `rotate(${from + turn}deg)`}],
    {duration: ms, iterations: Infinity},
   ),
  });
  waitingMotion.current = [start(wheel, rotation, 360, 1550), start(ball, ballRotation, -360, 920)];
 };
 const stopWaitingMotion = (continueSpin: boolean) => {
  const angles = [rotation, ballRotation];
  waitingMotion.current.forEach(({element, animation, from, turn, ms}, index) => {
   if (continueSpin) {
    angles[index] = from + turn * ((Number(animation.currentTime) || 0) % ms) / ms;
    element.style.transitionDuration = '0ms';
    element.style.transform = `rotate(${angles[index]}deg)`;
   }
   animation.cancel();
  });
  if (continueSpin && waitingMotion.current.length) wheelRotor.current?.getBoundingClientRect();
  waitingMotion.current = [];
  return angles;
 };
 const beginRound = (next: RouletteSession) => {
  const round = next.lastRound!;
  const landing = crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000 * 360;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wheelMs = reduced ? 1 : theme.spinsMs;
  const ballMs = reduced ? 1 : wheelMs + 720;
  pending.current = next;
  setView('wheel');
  setSession({ ...session, balanceCents: next.balanceCents - round.payoutCents });
  setBets([]);
  setBetFeedback(null);
  setPanel(null);
  setPrize(false);
  setSpinning(true);
  const startWheel = () => {
   const [startRotation, startBall] = stopWaitingMotion(true);
   const motion = rouletteSpinMotion(round.number, startRotation, startBall, landing);
   setRevealingBoosts(false);
   if (wheelRotor.current) wheelRotor.current.style.transitionDuration = `${wheelMs}ms`;
   if (ballOrbit.current) ballOrbit.current.style.transitionDuration = `${ballMs}ms`;
   setWheelDuration(wheelMs);
   setDuration(ballMs);
   setRotation(motion.wheelDegrees);
   setBallRotation(motion.ballDegrees);
   setNotice('La rueda está girando.');
   if (!cash) tone(440);
   timer.current = setTimeout(finish, ballMs + 150);
  };
  if (round.boosts?.length) {
   setSpinningBoosts(round.boosts);
   if (!reduced) {
    setRevealingBoosts(true);
    setNotice('Revelando los multiplicadores.');
    timer.current = setTimeout(startWheel, round.boosts.length * PRISM_REVEAL_STEP_MS + 120);
    return;
   }
  }
  startWheel();
 };
 const spin = () => {
  if (pending.current || busy.current) return;
  if (prizeTimer.current) clearTimeout(prizeTimer.current);
  if (!play) {
   try { beginRound(isPrism ? spinPrismRoulette(session, bets) : spinRoulette(session, bets)); }
   catch (error) { setNotice((error as Error).message); }
   return;
  }
  busy.current = true;
  setSpinning(true);
  setView('wheel');
  setPrize(false);
  setSpinningBoosts([]);
  setNotice('Confirmando la apuesta…');
  startWaitingMotion();
  tone(440);
  const placed = bets.map((bet) => ({ spotId: bet.spotId, amountCents: bet.amountCents }));
  void play(crypto.randomUUID(), placed).then((outcome) => {
   busy.current = false;
   try {
    beginRound({ balanceCents: outcome.balanceCents, rounds: session.rounds + 1, history: [outcome.lastRound.number, ...session.history].slice(0, 20), lastRound: outcome.lastRound });
   } catch {
    stopWaitingMotion(false);
    pending.current = null;
    setSession((current) => ({ ...current, balanceCents: outcome.balanceCents, lastRound: outcome.lastRound }));
    setSpinning(false);
    setBets([]);
    setNotice('La jugada quedó registrada en tu saldo.');
   }
  }).catch((error: unknown) => {
   busy.current = false;
   stopWaitingMotion(false);
   setView('table');
   setSpinning(false);
   setNotice(error instanceof Error ? error.message : 'No se pudo cerrar la jugada.');
  });
 };
 const repeat=()=>{if(pending.current||busy.current)return;const previous=session.lastRound?.bets;if(!previous){setNotice('Todavía no hay una ronda para repetir.');return}if(rouletteStake(previous)>session.balanceCents){setNotice('Fichas insuficientes para repetir.');return}setBets(previous.map(b=>({...b})));setPrize(false);setNotice('Apuestas de la última ronda restauradas.')};
 const boosts = spinning ? spinningBoosts : session.lastRound?.boosts ?? [];
 const prismResult = isPrism && !spinning ? session.lastRound?.number : undefined;
 const betButton = (id: string, label: string, className = '') => {
  const boostIndex = spinning ? boosts.findIndex(item => id === `n-${item.number}`) : -1;
  const boost = boosts[boostIndex];
  const hit = !spinning && session.lastRound?.wins.some(win => win.spotId === id);
  const placed = amounts.get(id);
  return <button type="button" key={id}
    className={`rg-bet ${className} ${hit ? 'rg-hit' : ''} ${boost ? 'rg-prism-marked' : ''}`}
    style={revealingBoosts && boost ? { '--boost-delay': `${boostIndex * PRISM_REVEAL_STEP_MS}ms` } as CSSProperties : undefined}
    data-prism-result={prismResult !== undefined && id === `n-${prismResult}` ? true : undefined}
    disabled={spinning} onClick={() => add(id)}
    aria-label={`Apostar ${money(chip)} fichas a ${ROULETTE_SPOT_BY_ID.get(id)!.label}${placed ? `, ${money(placed)} colocadas` : ''}${boost ? `, multiplicador ${boost.multiplier}` : ''}`}>
    <span>{label}</span>{placed && <b className="rg-marker">{compact(placed)}</b>}
    {betFeedback?.id === id && <span key={betFeedback.sequence} className="rg-prism-bet-feedback" aria-hidden="true">+{compact(betFeedback.amount)}</span>}
  </button>;
 };
 const outside=<><div className="rg-dozens">{[1,2,3].map(i=>betButton(`dozen-${i}`,`${i}ª DOCENA`))}</div><div className="rg-outside">{[['low','1–18'],['even','PAR'],['red','◆ ROJO'],['black','◆ NEGRO'],['odd','IMPAR'],['high','19–36']].map(([id,label])=>betButton(id,label,id==='red'?'rg-red':id==='black'?'rg-black':''))}</div></>;
 const openChips=(button:HTMLButtonElement)=>{if(prizeTimer.current)clearTimeout(prizeTimer.current);chipTrigger.current=button;if(panel==='table')panelRef.current?.scrollTo({top:0});setPrize(false);setChipOpen(true)};
 const clearBets = <button type="button" className="rg-clear-bets" disabled={spinning || !bets.length} onClick={() => {
  setBets([]);
  setNotice('Tablero limpio.');
 }}>Limpiar</button>;
 const chips=<div className="rg-chip-control">{!isPrism && <small>FICHA</small>}<button type="button" disabled={spinning} aria-haspopup="dialog" aria-expanded={chipOpen} aria-label={`Elegir ficha: ${money(chip)} fichas`} onClick={e=>openChips(e.currentTarget)} className={`rg-chip rg-chip-${ROULETTE_CHIPS.findIndex(value=>value===chip)%4} rg-selected`}>{compact(chip)}</button>{!isPrism && <button type="button" className="rg-change-chip" disabled={spinning} aria-haspopup="dialog" aria-expanded={chipOpen} onClick={e=>openChips(e.currentTarget)}>Cambiar ▾</button>}</div>;
 const chipPicker=chipOpen?<ChipPicker options={ROULETTE_CHIPS} value={chip} theme={{motif:isPrism?'frost':'brass',secondary:theme.secondary,surface:theme.surface,emblem:theme.emblem}} chipArt={isPrism?undefined:`${theme.artRoot}/chip-1-v2.webp`} buttonArt={isPrism?undefined:`${theme.artRoot}/spin-v2.webp`} trigger={chipTrigger} format={money} title="Elegí tu ficha" description="Elegí el valor para colocar en el tablero." confirmLabel="Usar ficha" onClose={()=>setChipOpen(false)} onConfirm={value=>{setChip(value);setChipOpen(false)}}/>:null;
 const returnToTable=()=>{if(prizeTimer.current)clearTimeout(prizeTimer.current);setPrize(false);setView('table')};
 const round = session.lastRound;
 const winningBoost = round?.boosts?.find(boost => boost.number === round.number);
 const boostedStake = winningBoost && round
  ? round.bets.reduce((sum, bet) => bet.spotId === `n-${round.number}` ? sum + bet.amountCents : sum, 0)
  : 0;
 const payoutLabel = round ? money(round.payoutCents) : '';
 const prizeCard = prize && round && <button type="button" className="rg-prize"
  style={isPrism ? { '--prism-payout-length': payoutLabel.length } as CSSProperties : undefined}
  onClick={() => { setPrize(false); if (theme.layout === 'table') returnToTable(); }}
  aria-label={isPrism ? `Cerrar premio. Número ${round.number}. ${payoutLabel} fichas cobradas` : 'Cerrar premio'}>
  <small>{theme.name.toUpperCase()} · {isPrism ? 'NÚMERO ' : ''}{round.number}</small>
  <h2>{winningBoost && boostedStake ? '¡Pleno multiplicado!' : '¡Número ganador!'}</h2>
  <strong>{payoutLabel}</strong>
  <span>{isPrism ? 'Fichas cobradas' : 'fichas cobradas · incluye apuesta ganadora'}</span>
  {winningBoost && boostedStake > 0 && <span className="rg-prism-equation">
   Pleno: {money(boostedStake)} × {winningBoost.multiplier} = {money(boostedStake * winningBoost.multiplier)}
  </span>}
  <b>Balance de ronda: {round.netCents > 0 ? '+' : ''}{money(round.netCents)}</b>
  <em>Tocá para cerrar</em>
 </button>;
 const options=ROULETTE_SPOTS.filter(s=>s.kind===kind);
 const selectedSpot=options.find(s=>s.id===chosen)??options[0];
 const themeStyle={
  '--prism-result-pause':`${PRISM_RESULT_PAUSE_MS}ms`,
  '--prism-result-flight':`${PRISM_RESULT_FLIGHT_MS}ms`,
  '--volt-art-hue':theme.voltFinish ? `${theme.voltFinish.hue}deg` : undefined,
  '--prism-reveal-step':`${PRISM_REVEAL_STEP_MS}ms`,
  '--rg-wheel-ms':`${wheelDuration}ms`,'--rg-ball-settle-ms':`${Math.max(1,duration-wheelDuration)}ms`,
  '--rg-scene':`url("${theme.scene}")`,'--rg-spin-art':`url("${theme.artRoot}/spin-v2.webp")`,'--rg-undo-art':`url("${theme.artRoot}/undo-v2.webp")`,'--rg-repeat-art':`url("${theme.artRoot}/repeat-v2.webp")`,
  ...Object.fromEntries([0,1,2,3].map(i=>[`--rg-chip-${i}-art`,`url("${isPrism?'/images/slots/controls/frost/spin.webp':`${theme.artRoot}/chip-${i}-v2.webp`}")`])),
  '--rg-gold':theme.accent,'--rg-line':theme.accent,'--slot-accent':theme.accent,'--slot-secondary':theme.secondary,'--slot-surface':theme.surface,
  '--rg-accent':theme.accent,'--rg-secondary':theme.secondary,'--rg-surface':theme.surface,'--rg-felt':theme.felt,'--rg-metal-light':theme.metalLight,'--rg-metal-dark':theme.metalDark,'--rg-wood-light':theme.woodLight,'--rg-wood-dark':theme.woodDark,
 } as CSSProperties;
 const playerTools = <>
  <button type="button" onClick={()=>setSound(!sound)} aria-label={sound?'Silenciar':'Activar sonido'} aria-pressed={sound}>
   {isPrism ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9h4l5-4v14l-5-4H3z" />
    {sound ? <path d="M15 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12" /> : <path d="m16 9 5 6m0-6-5 6" />}
   </svg> : sound?'♪':'♩'}
  </button>
  <button type="button" onClick={()=>setPanel('rules')} aria-label="Reglas y pagos" aria-haspopup="dialog">
   {isPrism ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="8.2" />
    <path d="M12 11v5m-1-5h1m-1 5h2" />
    <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
   </svg> : 'i'}
  </button>
 </>;
 return <main className="rg-player" data-theme={theme.slug} data-variant={theme.variant} data-volt-lettering={theme.voltFinish?.lettering} data-volt-reward={theme.voltFinish?.rewardArt} data-layout={theme.layout} data-view={view} data-spinning={spinning && !revealingBoosts} data-prism-revealing={revealingBoosts || undefined} style={themeStyle} aria-label={`${theme.name}, ruleta europea${cash ? '' : ' demo'}${isPrism ? ` de ${voltFoundry.name}` : ''}`}>
  {!isPrism && <header className="rg-top">
   <span>✦ LUMEN STUDIO</span>
   <div>{playerTools}{onExit && <button type="button" onClick={onExit} aria-label="Cerrar ruleta">×</button>}</div>
  </header>}
  <div className="rg-counters">
   {isPrism && onExit && <button type="button" className="rg-prism-exit" onClick={onExit} aria-label={`Salir de ${theme.name}`}>
    <svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
     <path d="M19 12H5m0 0 6 6m-6-6 6-6" />
    </svg>
   </button>}
   <div><span className="rg-counter-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="23" height="23"><path d="M3 8v10c0 2 4 4 9 4s9-2 9-4V8" fill="#b87d24" stroke="#f8d77b"/><ellipse cx="12" cy="8" rx="9" ry="4" fill="#ffe295" stroke="#a66b19"/><path d="M3 12c3 4 15 4 18 0M3 16c3 4 15 4 18 0" fill="none" stroke="#ffe39a" strokeWidth="1.3"/></svg></span><small>{cash ? 'SALDO' : 'SALDO DEMO'}</small><strong>{money(session.balanceCents)}</strong></div><div><span className="rg-counter-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="23" height="23"><path d="M7 5H3v3c0 4 3 5 6 5M17 5h4v3c0 4-3 5-6 5" fill="none" stroke="#e5b857" strokeWidth="2"/><path d="M6 3h12v5c0 4-2 7-6 7S6 12 6 8Z" fill="#efc96b" stroke="#9f661e"/><path d="M12 15v5M7 21h10" stroke="#ffe39a" strokeWidth="3" strokeLinecap="round"/><path d="M9 5v5c0 2 1 3 2 3" fill="none" stroke="#fff3bc" strokeWidth="1.5"/></svg></span><small>{isPrism ? 'ÚLTIMO PREMIO' : 'ÚLTIMO COBRO'}</small><strong>{money(session.lastRound?.payoutCents??0)}</strong></div></div>
  <div className="rg-title">
   <span>♛</span>
   {isPrism && !theme.voltFinish ? <h1 className="rg-prism-wordmark" aria-label={theme.name}>
    <img src="/images/roulette/prism-roulette/wordmark.webp" width={900} height={107} alt="" />
   </h1> : <h1 aria-label={theme.name}>{[...theme.name.toUpperCase()].map((letter,index)=><span key={index} aria-hidden="true" className="rg-title-letter" style={{animationDelay:`${index*75}ms, ${1800+index*110}ms`}}>{letter===' '?'\u00a0':letter}</span>)}</h1>}
   <p>{isPrism ? 'RULETA CON MULTIPLICADORES' : 'RULETA EUROPEA'}</p>
   {isPrism && <div className="rg-prism-title-tools">{playerTools}</div>}
  </div>
  {theme.layout==='alternating'&&<nav className="rg-view-switch" aria-label="Vista de la mesa"><button type="button" aria-pressed={view==='table'} disabled={spinning} onClick={()=>{setView('table');setPrize(false)}}>Hacer apuestas</button><button type="button" aria-pressed={view==='wheel'} disabled={spinning} onClick={()=>setView('wheel')}>Ver rueda</button></nav>}
  {isPrism && <PrismHistory numbers={session.history} round={session.rounds} spinning={spinning} wheel={wheelStage} />}
  <section ref={wheelStage} className="rg-wheel-stage" inert={theme.layout==='alternating'&&view!=='wheel'} aria-hidden={theme.layout==='alternating'&&view!=='wheel'?true:undefined} aria-label={session.lastRound&&!spinning?`Resultado: ${session.lastRound.number}`:'Rueda europea, 37 números'}>
   {isPrism && <PrismWheelChassis sides={theme.voltFinish?.facets}
    image={theme.voltFinish?.chassisImage ? `${theme.artRoot}/${theme.voltFinish.chassisImage}` : undefined} />}
   <div className="rg-rotor">
   <div ref={wheelRotor} className="rg-wheel" style={{transform:`rotate(${rotation}deg)`,transitionDuration:`${wheelDuration}ms`}}><Wheel theme={theme} result={prismResult}/></div>
   <div ref={ballOrbit} className="rg-ball-orbit" style={{transform:`rotate(${ballRotation}deg)`,transitionDuration:`${duration}ms`,'--prism-ball-turn':`${-ballRotation}deg`,'--prism-ball-time':`${duration}ms`} as CSSProperties} onTransitionEnd={e=>{if(!revealingBoosts&&e.target===e.currentTarget&&e.propertyName==='transform')finish()}}><i/></div>
   </div>
   {isPrism && <PrismWheelHub crystal={`${theme.artRoot}/${theme.voltFinish?.centerImage ?? 'center-crystal.webp'}`}
    large={Boolean(theme.voltFinish?.centerImage)} />}
   {!isPrism&&!spinning&&session.lastRound&&<span className={`rg-result rg-${rouletteColor(session.lastRound.number)}`}>{session.lastRound.number}</span>}
   {theme.layout!=='table'&&prizeCard}
   {theme.layout==='table'&&view==='wheel'&&<button type="button" className="rg-wheel-return" disabled={spinning} onClick={returnToTable}>{spinning?'Siguiendo la bola…':'Volver al tablero'}</button>}
  </section>
  {isPrism && <PrismBoosts boosts={boosts} revealing={revealingBoosts} spinning={spinning}
    result={round?.number} wheel={wheelStage} artRoot={theme.voltFinish?.rewardArt ? theme.artRoot : undefined}
    images={theme.voltFinish?.multiplierImages} />}
  {!isPrism && <div className="rg-history"><small>ÚLTIMOS</small>{session.history.length ? session.history.slice(0, 8).map((n, i) => <span key={`${session.rounds}-${i}`} className={`rg-${rouletteColor(n)}`}>{n}</span>) : <span className="rg-history-empty">La primera ronda empieza con vos</span>}</div>}
  <section className="rg-table" inert={(theme.layout==='alternating'||theme.layout==='table')&&view!=='table'} aria-hidden={(theme.layout==='alternating'||theme.layout==='table')&&view!=='table'?true:undefined}><header><h2>HACÉ TU APUESTA</h2><button type="button" disabled={spinning} onClick={()=>setPanel('table')}>⤢ Ampliar / combinar</button></header><div className="rg-grid"><div className="rg-zero">{betButton('n-0','0','rg-green')}</div><div className="rg-numbers">{(theme.layout==='table'||theme.layout==='alternating'?Array.from({length:36},(_,i)=>i+1):[3,2,1].flatMap(row=>Array.from({length:12},(_,i)=>row+i*3))).map(n=>betButton(`n-${n}`,`${n}`,`rg-${rouletteColor(n)}`))}</div><div className="rg-columns">{[3,2,1].map(n=>betButton(`column-${n}`,theme.layout==='table'||theme.layout==='alternating'?`Col. ${n} · 2:1`:'2:1'))}</div></div>{outside}<div className="rg-combination-summary">{[...amounts].filter(([id])=>!['straight','outside','dozen','column'].includes(ROULETTE_SPOT_BY_ID.get(id)!.kind)).map(([id,a])=><span key={id}>{ROULETTE_SPOT_BY_ID.get(id)!.label}: {compact(a)}</span>)}</div></section>
  {theme.layout==='compact'&&<section className="rg-quick-bets"><header><h2>APUESTAS RÁPIDAS</h2><button type="button" disabled={spinning} onClick={()=>setPanel('table')}>Tablero completo ↗</button></header><div>{[['red','◆ ROJO'],['black','◆ NEGRO'],['even','PAR'],['odd','IMPAR'],['low','1–18'],['high','19–36']].map(([id,label])=>betButton(id,label,id==='red'?'rg-red':id==='black'?'rg-black':''))}</div><small>{bets.length?`${amounts.size} zonas apostadas · total ${money(stake)}`:'Números y combinaciones en Tablero completo'}</small></section>}
  {chips}<div className="rg-stake"><span>APUESTA TOTAL</span><strong>{money(stake)}</strong>{!isPrism && clearBets}</div>{isPrism && clearBets}
  <div className="rg-actions"><button type="button" disabled={spinning||!bets.length} onClick={()=>setBets(bets.slice(0,-1))}><span className="rg-action-content"><ActionIcon kind="undo"/><span className="rg-action-label">Deshacer</span></span></button><button type="button" className={`rg-spin ${spinning&&!revealingBoosts?'rg-spinning':''}`} disabled={spinning||!stake} onClick={spin}><span className="rg-action-content"><ActionIcon kind="spin"/><span className="rg-action-label">{revealingBoosts?'REVELANDO':spinning?'GIRANDO':'GIRAR'}</span></span></button><button type="button" disabled={spinning||!session.lastRound} onClick={repeat}><span className="rg-action-content"><ActionIcon kind="repeat"/><span className="rg-action-label">Repetir</span></span></button></div>
  <p className="rg-notice" role="status" aria-live="polite">{notice}</p><footer>{cash ? 'FICHAS DE TU SALDO' : 'DEMOSTRACIÓN · FICHAS SIN VALOR REAL'}</footer>
  <dialog ref={panelRef} className={`rg-panel ${panel==='table'?'rg-panel-table':''}`} aria-label={panel==='rules'?'Reglas y pagos':'Tablero ampliado'} onCancel={e=>{e.preventDefault();setPanel(null)}}><header><h2>{panel==='rules'?'Reglas y pagos':'Colocá tus apuestas'}</h2><button type="button" onClick={()=>setPanel(null)} aria-label="Cerrar panel">×</button></header>
  {panel==='rules'?<div className="rg-rules"><p>37 números equiprobables: 0 al 36. Colocá fichas y pulsá GIRAR. Podés combinar apuestas; se suman todos los aciertos. El cero no cuenta como rojo, negro, par, impar, docena, columna ni 1–18.</p><table><thead><tr><th>Apuesta</th><th>Ganancia</th><th>Cobro total</th></tr></thead><tbody>{[['Pleno · 1 número',isPrism?'29:1':'35:1',isPrism?`${PRISM_BASE_PAYOUT}×`:'36×'],['Caballo · 2','17:1','18×'],['Calle / trío · 3','11:1','12×'],['Cuadro · 4','8:1','9×'],['Línea · 6','5:1','6×'],['Docena / columna','2:1','3×'],['Color / paridad / mitad','1:1','2×']].map(row=><tr key={row[0]}>{row.map((v,i)=><td key={i}>{v}</td>)}</tr>)}</tbody></table>{isPrism ? <>
    <p>Al cerrar las apuestas aparecen tres números distintos con 50×, 100× o 250×. Cada número marcado recibe uno de esos multiplicadores con probabilidades respectivas de 52 %, 28 % y 20 %.</p>
    <p>Solo un pleno ganador recibe el multiplicador. Si apostaste 50 al 17, sale el 17 y tiene 100×, cobrás 5.000 fichas en total, incluida la apuesta. La bola se sortea de forma independiente.</p>
   </> : <p>El cobro incluye la devolución de cada apuesta ganadora. Ejemplo: 50 a un pleno ganador devuelve 1.800 en total: 1.750 de ganancia y 50 apostadas.</p>}
   <p>Retorno teórico: 36/37 ≈ 97,30 %. Máximo por ronda: 100.000 fichas. El saldo se descuenta al iniciar el giro y se acredita el cobro al terminar.</p><p>{cash ? 'Las fichas salen de tu saldo cargado. Cada giro queda registrado.' : 'Las fichas son de demostración, no se guardan al cerrar. Las rondas anteriores no predicen el siguiente resultado.'}</p></div>:<><div className="rg-panel-tabs">{kinds.map(k=><button key={k.id} type="button" aria-pressed={kind===k.id} onClick={()=>setKind(k.id)}>{k.label}</button>)}</div>{kind==='straight'?<div className="rg-expanded-numbers">{Array.from({length:37},(_,n)=>betButton(`n-${n}`,`${n}`,`rg-${rouletteColor(n)}`))}</div>:<div className="rg-combo"><label>Apuesta<select value={selectedSpot.id} onChange={e=>setChosen(e.target.value)}>{options.map(s=><option key={s.id} value={s.id}>{s.label}{amounts.has(s.id)?` · ${money(amounts.get(s.id)!)} fichas`:''}</option>)}</select></label><p>Cubre: {selectedSpot.numbers.join(' · ')}<br/>Ganancia {selectedSpot.profitOdds}:1 · cobro total {selectedSpot.profitOdds+1}×</p><button type="button" className="rg-add" onClick={()=>add(selectedSpot.id)}>+ {money(chip)} fichas a {selectedSpot.label}</button></div>}{chips}<div className="rg-panel-total">Total: {money(stake)} · Disponible: {money(session.balanceCents-stake)}</div><p className="rg-panel-notice" role="status">{notice}</p><button type="button" className="rg-add" onClick={()=>setPanel(null)}>Listo · volver a la rueda</button></>}
   {panel==='table'&&chipPicker}
  </dialog>
  {theme.layout==='table'&&prizeCard}
  {!panel&&chipPicker}
 </main>;
}
