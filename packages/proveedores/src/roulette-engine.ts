import { randomUint32, uniformIndex } from "@homebet/proveedores/game-random";

/** European single-zero roulette. Pure demo engine; amounts are integer cents. */
export const EUROPEAN_WHEEL = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26] as const;
const RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
export function rouletteColor(number: number): 'red' | 'black' | 'green' {
  if (!Number.isInteger(number) || number < 0 || number > 36) throw new Error('Número inválido');
  return number === 0 ? 'green' : RED.has(number) ? 'red' : 'black';
}
export type RouletteBetKind = 'straight' | 'split' | 'street' | 'corner' | 'six-line' | 'dozen' | 'column' | 'outside';
export type RouletteSpot = { id: string; label: string; kind: RouletteBetKind; numbers: readonly number[]; profitOdds: number };
const spots: RouletteSpot[] = [];
function spot(id: string, label: string, kind: RouletteBetKind, numbers: number[], profitOdds: number) { spots.push({id,label,kind,numbers,profitOdds}); }
const range = (start: number, length: number) => Array.from({length}, (_, i) => start + i);
for (let n=0;n<=36;n++) spot(`n-${n}`,`${n}`,'straight',[n],35);
for (let n=1;n<=36;n++) {
  if (n%3 !== 0) spot(`split-${n}-${n+1}`,`${n} / ${n+1}`,'split',[n,n+1],17);
  if (n<=33) spot(`split-${n}-${n+3}`,`${n} / ${n+3}`,'split',[n,n+3],17);
}
for (let n=1;n<=3;n++) spot(`split-0-${n}`,`0 / ${n}`,'split',[0,n],17);
for (let n=1;n<=34;n+=3) {
  spot(`street-${n}`,`${n}–${n+2}`,'street',range(n,3),11);
  if (n<=31) spot(`six-${n}`,`${n}–${n+5}`,'six-line',range(n,6),5);
}
spot('trio-0-1-2','0 / 1 / 2','street',[0,1,2],11);
spot('trio-0-2-3','0 / 2 / 3','street',[0,2,3],11);
spot('first-four','0 / 1 / 2 / 3','corner',[0,1,2,3],8);
for (let n=1;n<=32;n++) if (n%3 !== 0) spot(`corner-${n}`,`${n} / ${n+1} / ${n+3} / ${n+4}`,'corner',[n,n+1,n+3,n+4],8);
for (let i=1;i<=3;i++) {
  spot(`dozen-${i}`,`${i}ª docena`,'dozen',range((i-1)*12+1,12),2);
  spot(`column-${i}`,`Columna ${i}`,'column',Array.from({length:12},(_,n)=>i+n*3),2);
}
spot('red','Rojo','outside',range(1,36).filter(n=>RED.has(n)),1);
spot('black','Negro','outside',range(1,36).filter(n=>!RED.has(n)),1);
spot('even','Par','outside',range(1,36).filter(n=>n%2===0),1);
spot('odd','Impar','outside',range(1,36).filter(n=>n%2===1),1);
spot('low','1–18','outside',range(1,18),1);
spot('high','19–36','outside',range(19,18),1);
export const ROULETTE_SPOTS: readonly RouletteSpot[] = spots;
export const ROULETTE_SPOT_BY_ID = new Map(spots.map(s=>[s.id,s]));
export const ROULETTE_CHIPS = [1000,2500,5000,10000,25000,50000,100000,200000,500000,1000000] as const;
export const MAX_ROULETTE_STAKE_CENTS = 10_000_000;
export type RouletteBet = { spotId: string; amountCents: number };
export type RouletteBoost = { number: number; multiplier: 50 | 100 | 250 };
export const PRISM_BOOST_COUNT = 3;
export const PRISM_BASE_PAYOUT = 30;
export const PRISM_MULTIPLIERS = [
  { multiplier: 50, weight: 52 },
  { multiplier: 100, weight: 28 },
  { multiplier: 250, weight: 20 },
] as const;
export type RouletteRound = { number: number; stakeCents: number; payoutCents: number; netCents: number; bets: readonly RouletteBet[]; wins: readonly {spotId: string; payoutCents: number}[]; boosts?: readonly RouletteBoost[] };
export type RouletteSession = { balanceCents: number; rounds: number; history: readonly number[]; lastRound: RouletteRound | null };
export function newRouletteSession(balanceCents=1_000_000): RouletteSession {
  if(!Number.isSafeInteger(balanceCents)||balanceCents<0) throw new Error('Saldo inválido');
  return {balanceCents,rounds:0,history:[],lastRound:null};
}
export function rouletteStake(bets: readonly RouletteBet[]): number {
  if(bets.length>500) throw new Error('Demasiadas apuestas');
  let total=0;
  for(const bet of bets) {
    if(!ROULETTE_SPOT_BY_ID.has(bet.spotId)) throw new Error('Apuesta desconocida');
    if(!Number.isSafeInteger(bet.amountCents)||bet.amountCents<=0||bet.amountCents%100!==0) throw new Error('Importe inválido');
    total+=bet.amountCents;
    if(!Number.isSafeInteger(total)||total>MAX_ROULETTE_STAKE_CENTS) throw new Error('Límite de mesa: 100.000 fichas');
  }
  return total;
}
export function randomRouletteNumber(nextUint32: () => number = randomUint32): number {
  return uniformIndex(EUROPEAN_WHEEL.length, nextUint32);
}

function settleRound(session: RouletteSession, bets: readonly RouletteBet[], number: number, boosts?: readonly RouletteBoost[]): RouletteSession {
  rouletteColor(number);
  const stakeCents=rouletteStake(bets);
  if(stakeCents===0) throw new Error('Colocá una apuesta');
  if(stakeCents>session.balanceCents) throw new Error('Fichas insuficientes');
  const straightPayout = boosts ? boosts.find(boost => boost.number === number)?.multiplier ?? PRISM_BASE_PAYOUT : undefined;
  const wins=bets.flatMap(bet=>{
    const s=ROULETTE_SPOT_BY_ID.get(bet.spotId)!;
    const factor = s.kind === 'straight' && straightPayout !== undefined ? straightPayout : s.profitOdds + 1;
    return s.numbers.includes(number)?[{spotId:s.id,payoutCents:bet.amountCents*factor}]:[];
  });
  const payoutCents=wins.reduce((sum,w)=>sum+w.payoutCents,0);
  const balanceCents=session.balanceCents-stakeCents+payoutCents;
  if(!Number.isSafeInteger(balanceCents)||!Number.isSafeInteger(session.rounds+1)) throw new Error('Límite de saldo');
  const round: RouletteRound={number,stakeCents,payoutCents,netCents:payoutCents-stakeCents,bets:bets.map(b=>({...b})),wins};
  if (boosts) round.boosts = boosts;
  return {balanceCents,rounds:session.rounds+1,history:[number,...session.history].slice(0,20),lastRound:round};
}
export function settleRoulette(session: RouletteSession, bets: readonly RouletteBet[], number: number): RouletteSession {
  return settleRound(session, bets, number);
}
export function spinRoulette(session: RouletteSession,bets: readonly RouletteBet[],rng= randomRouletteNumber): RouletteSession {
  const total=rouletteStake(bets);
  if(!total||total>session.balanceCents) throw new Error(total?'Fichas insuficientes':'Colocá una apuesta');
  return settleRoulette(session,bets,rng());
}

export function spinPrismRoulette(session: RouletteSession, bets: readonly RouletteBet[], nextUint32: () => number = randomUint32): RouletteSession {
  const total = rouletteStake(bets);
  if (!total || total > session.balanceCents) throw new Error(total ? 'Fichas insuficientes' : 'Colocá una apuesta');

  const pool = [...EUROPEAN_WHEEL];
  const weightTotal = PRISM_MULTIPLIERS.reduce((sum, item) => sum + item.weight, 0);
  const boosts = Array.from({ length: PRISM_BOOST_COUNT }, (): RouletteBoost => {
    const index = uniformIndex(pool.length, nextUint32);
    const [number] = pool.splice(index, 1);
    let roll = uniformIndex(weightTotal, nextUint32);
    for (const { multiplier, weight } of PRISM_MULTIPLIERS) {
      if (roll < weight) return { number, multiplier };
      roll -= weight;
    }
    throw new Error('No se pudo calcular el multiplicador');
  });
  // A separate draw gives every pocket the same chance, regardless of boosts.
  return settleRound(session, bets, randomRouletteNumber(nextUint32), boosts);
}
