import assert from "node:assert/strict";
import { test } from "node:test";
import { BETS, FREE_SPINS_AWARD, PAYLINES, PAYTABLE, OUTCOMES, TICKET_COUNT, FEATURE_TICKETS, evaluateGrid, expectedRtp, newSession, settleBonus, spin } from "./slot-engine-5x5.ts";
import { secureRandomInt } from "./slot-engine-five-reels.ts";
function seeded(seed = 74851) {
  const word = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return seed >>> 0; };
  return (max: number) => max > 2 ** 32 ? ((word() & 0x1fffff) * 2 ** 32 + word()) % max : word() % max;
}
function first(ticket: number, seed=9871) {const rng=seeded(seed);let initial=true;return(max:number)=>{if(initial){initial=false;assert.equal(max,TICKET_COUNT);return ticket;}return rng(max);};}
const normalEnd=(rtp=9600)=>OUTCOMES.reduce((sum,outcome)=>sum+(rtp-800)*outcome.weight,0);

test("50 líneas únicas, cinco filas y pasos solo a la fila vecina",()=>{
  assert.equal(PAYLINES.length,50);assert.equal(new Set(PAYLINES.map(line=>line.join(","))).size,50);
  const usedRows=new Set<number>();
  for(const[index,line]of PAYLINES.entries()){
    assert.equal(line.length,5);
    line.forEach((cell,column)=>{assert(cell>=0&&cell<25);assert.equal(cell%5,column);usedRows.add(Math.floor(cell/5));if(column)assert(Math.abs(Math.floor(cell/5)-Math.floor(line[column-1]/5))<=1);});
    for(const count of[3,4,5]){const grid=Array<number>(25).fill(7);line.slice(0,count).forEach(cell=>{grid[cell]=2;});const win=evaluateGrid(grid).find(win=>win.line===index)!;assert(win);assert.equal(win.count,count);assert.deepEqual(win.cells,line.slice(0,count));assert.equal(win.multiplier,PAYTABLE[2][count-3]);}
  }
  assert.equal(usedRows.size,5);
  const jumps=Array<number>(25).fill(7);[20,11,2].forEach(cell=>{jumps[cell]=2;});assert.equal(evaluateGrid(jumps).length,0);
  const smooth=Array<number>(25).fill(7);[20,16,12].forEach(cell=>{smooth[cell]=2;});assert(evaluateGrid(smooth).some(win=>win.cells?.join(",")==="20,16,12"));
});
test("WILD toma el mejor premio, scatter corta y todas las líneas válidas se evalúan",()=>{
  const grid=Array<number>(25).fill(7);[6,6,6,0,7].forEach((symbol,column)=>{grid[PAYLINES[0][column]]=symbol;});const wins=evaluateGrid(grid);assert(wins.length);assert(wins.every(win=>win.symbol===5&&win.count===3&&win.multiplier===50));
  grid[PAYLINES[0][1]]=7;assert.equal(evaluateGrid(grid).length,0);
  const all=evaluateGrid(Array(25).fill(0));assert.equal(all.length,50);assert(all.every(win=>win.count===5));assert.equal(new Set(all.map(win=>win.line)).size,50);
  assert.throws(()=>evaluateGrid(Array(15).fill(0)));assert.throws(()=>evaluateGrid(Array(25).fill(8)));
});
test("RTP exacto y los 900 tramos cobran la suma completa de sus líneas",()=>{
  assert.equal(OUTCOMES.length,900);assert(TICKET_COUNT>2**32&&Number.isSafeInteger(TICKET_COUNT));
  for(const rtp of[8000,9234,9600,9800])assert(Math.abs(expectedRtp(rtp)-rtp/10000)<1e-12);
  assert(normalEnd(9800)+2*FEATURE_TICKETS<TICKET_COUNT);
  let ticket=0;let multi=false;
  for(const[index,outcome]of OUTCOMES.entries()){
    const next=spin(newSession(),BETS[2],9600,first(ticket,10000+index));const round=next.lastRound!;
    assert.equal(round.grid.length,25);assert.deepEqual(round.wins,evaluateGrid(round.grid));assert.deepEqual(round.wins,outcome.wins);assert.equal(round.payoutCents,BETS[2]*outcome.multiplier);assert.equal(next.balanceCents,1000000-BETS[2]+round.payoutCents);multi ||= round.wins.length>1;
    ticket+=(9600-800)*outcome.weight;
  }
  assert(multi);
});
test("cinco gratuitos mantienen apuesta y RTP; bono no se cobra dos veces",()=>{
  let next=spin(newSession(),BETS[1],9600,first(normalEnd()));assert.equal(next.lastRound!.kind,"free-spins");assert.equal(next.lastRound!.grid.filter(s=>s===7).length,3);assert.equal(next.freeSpins,FREE_SPINS_AWARD);
  for(let i=0;i<FREE_SPINS_AWARD;i++){next=spin(next,BETS[5],8000,first(0,250+i));assert.equal(next.lastRound!.isFree,true);assert.equal(next.lastRound!.betCents,BETS[1]);assert.equal(next.lastRound!.rtpBps,9600);assert.equal(next.totalBetCents,BETS[1]);assert.equal(next.pendingBonus,null);}
  assert.equal(next.freeSpins,0);
  const pending=spin(newSession(),BETS[2],9600,first(normalEnd()+FEATURE_TICKETS));assert.equal(pending.lastRound!.kind,"bonus");assert.equal(pending.lastRound!.grid.filter(s=>s===6).length,3);assert.throws(()=>spin(pending,BETS[2],9600));
  const settled=settleBonus(pending);assert.equal(settled.balanceCents,pending.balanceCents+pending.pendingBonus!.rewardCents);assert.throws(()=>settleBonus(settled));
});
test("20.000 rondas mantienen contabilidad entera y errores no mutan la sesión",()=>{
  let session=newSession(100000000000);const start=session.balanceCents,rng=seeded(555918);
  for(let i=0;i<20000;i++){session=session.pendingBonus?settleBonus(session):spin(session,BETS[0],9600,rng);assert.equal(session.balanceCents,start-session.totalBetCents+session.totalPaidCents);assert(Number.isSafeInteger(session.balanceCents));assert.deepEqual(session.lastRound!.wins,evaluateGrid(session.lastRound!.grid));}
  const loss=spin(newSession(),BETS[0],9600,first(TICKET_COUNT-1));assert.equal(loss.lastRound!.kind,"loss");assert.equal(loss.lastRound!.wins.length,0);
  const fresh=newSession();assert.throws(()=>spin(fresh,1,9600));assert.throws(()=>spin(newSession(0),BETS[0],9600));assert.throws(()=>spin(fresh,BETS[0],9600,()=>TICKET_COUNT));assert.throws(()=>spin({...fresh,rounds:Number.MAX_SAFE_INTEGER},BETS[0],9600));assert.equal(fresh.balanceCents,1000000);
});
test("RNG de 53 bits rechaza el sesgo y permite valores por encima de 32 bits",()=>{
  let calls=0;
  const wide=secureRandomInt(TICKET_COUNT,words=>{assert.equal(words.length,2);if(calls++===0){words[0]=0xffffffff;words[1]=0xffffffff;}else{words[0]=1;words[1]=11;}});
  assert.equal(calls,2);assert.equal(wide,2**32+11);assert(wide<TICKET_COUNT);
  calls=0;assert.equal(secureRandomInt(10,words=>{words[0]=calls++===0?0xffffffff:17;}),7);assert.equal(calls,2);
  for(const max of[0,-1,1.1,NaN,Infinity,2**53])assert.throws(()=>secureRandomInt(max));
});
