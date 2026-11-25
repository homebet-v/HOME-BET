import assert from "node:assert/strict";
import { test } from "node:test";
import { BETS, FREE_SPINS_AWARD, OUTCOMES, PAYLINES, PAYTABLE, TICKET_COUNT, FEATURE_TICKETS, evaluateGrid, expectedRtp, newSession, settleBonus, spin } from "./slot-engine-5x3.ts";
function seeded(seed = 73512) { return (max: number) => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) % max; }; }
function first(ticket: number, seed = 8484) { const rng = seeded(seed); let initial = true; return (max: number) => { if (initial) { initial = false; assert.equal(max, TICKET_COUNT); return ticket; } return rng(max); }; }
const normalEnd = (rtp = 9600) => OUTCOMES.reduce((sum, outcome) => sum + (rtp - 800) * outcome.weight, 0);

test("25 líneas únicas de cinco rodillos y pagos desde el primero por 3, 4 y 5", () => {
  assert.equal(PAYLINES.length, 25); assert.equal(new Set(PAYLINES.map(line => line.join(","))).size, 25);
  assert(TICKET_COUNT <= 2 ** 32);
  for (const [index, line] of PAYLINES.entries()) {
    assert.equal(line.length,5);line.forEach((cell,column)=>{assert.equal(cell % 5,column);if(column>0)assert(Math.abs(Math.floor(cell/5)-Math.floor(line[column-1]/5))<=1,"no saltar la fila central");});
    for(const count of [3,4,5]) {const grid=Array<number>(15).fill(7);line.slice(0,count).forEach(cell=>{grid[cell]=2;});const wins=evaluateGrid(grid);const win=wins.find(item=>item.line===index)!;assert(win);assert.equal(win.count,count);assert.deepEqual(win.cells,line.slice(0,count));assert.equal(win.multiplier,PAYTABLE[2][count-3]);}
  }
  const shifted=Array<number>(15).fill(7);PAYLINES[0].slice(1).forEach(cell=>{shifted[cell]=5;});assert.equal(evaluateGrid(shifted).length,0);
});
test("WILD elige el mayor pago por línea, scatter interrumpe y se suman líneas simultáneas", () => {
  const grid=Array<number>(15).fill(7);[6,6,6,0,7].forEach((symbol,i)=>{grid[PAYLINES[0][i]]=symbol;});
  const [win]=evaluateGrid(grid);assert.equal(win.symbol,5);assert.equal(win.count,3);assert.equal(win.multiplier,50);
  grid[PAYLINES[0][1]]=7;assert.equal(evaluateGrid(grid).length,0);
  for(const line of PAYLINES.slice(0,3))line.forEach(cell=>{grid[cell]=1;});assert.equal(evaluateGrid(grid).length,25);
  assert.throws(()=>evaluateGrid([0,0,0]));assert.throws(()=>evaluateGrid(Array(15).fill(8)));
});
test("cada tramo de resultado genera una grilla y un pago coherentes; RTP exacto", () => {
  for(const rtp of [8000,9234,9600,9800]){
    assert.ok(Math.abs(expectedRtp(rtp)-rtp/10000)<1e-12);
    assert(normalEnd(rtp)+2*FEATURE_TICKETS<TICKET_COUNT);
    let ticket=0;
    for(const [index,outcome]of OUTCOMES.entries()){
      const session=spin(newSession(),BETS[2],rtp,first(ticket,1000+index));const round=session.lastRound!;
      assert.equal(round.grid.length,15);assert.equal(round.kind,"win");assert.deepEqual(round.wins,evaluateGrid(round.grid));assert.deepEqual(round.wins,outcome.wins);assert.equal(round.wins.find(win=>win.line===outcome.line)!.count,outcome.count);assert.equal(round.payoutCents,BETS[2]*outcome.multiplier);
      ticket+=(rtp-800)*outcome.weight;
    }
  }
});
test("features no duplican cobros ni apuestas; gratuitos conservan apuesta y RTP", () => {
  let session=spin(newSession(),BETS[1],9600,first(normalEnd()));assert.equal(session.lastRound!.kind,"free-spins");assert.equal(session.lastRound!.grid.filter(s=>s===7).length,3);assert.equal(session.freeSpins,FREE_SPINS_AWARD);
  const start=session.balanceCents;
  for(let i=0;i<FREE_SPINS_AWARD;i++){session=spin(session,BETS[5],8000,first(0,10+i));assert.equal(session.lastRound!.betCents,BETS[1]);assert.equal(session.lastRound!.rtpBps,9600);assert.equal(session.lastRound!.isFree,true);assert.equal(session.totalBetCents,BETS[1]);assert.equal(session.pendingBonus,null);}
  assert.equal(session.freeSpins,0);assert(session.balanceCents>=start);
  const pending=spin(newSession(),BETS[2],9600,first(normalEnd()+FEATURE_TICKETS));assert.equal(pending.lastRound!.kind,"bonus");assert.equal(pending.lastRound!.grid.filter(s=>s===6).length,3);assert.throws(()=>spin(pending,BETS[2],9600));
  const settled=settleBonus(pending);assert.equal(settled.balanceCents,pending.balanceCents+pending.pendingBonus!.rewardCents);assert.throws(()=>settleBonus(settled));
});
test("20.000 rondas: balance entero, pérdidas sin líneas y errores sin débito", () => {
  let session=newSession(100000000000);const start=session.balanceCents,rng=seeded(16864);
  for(let i=0;i<20000;i++){
    session=session.pendingBonus?settleBonus(session):spin(session,BETS[0],9600,rng);
    assert.equal(session.balanceCents,start-session.totalBetCents+session.totalPaidCents);assert(Number.isSafeInteger(session.balanceCents));
    assert.deepEqual(session.lastRound!.wins,evaluateGrid(session.lastRound!.grid));if(session.lastRound!.kind==="loss")assert.equal(session.lastRound!.wins.length,0);
  }
  const fresh=newSession();assert.throws(()=>spin(fresh,1,9600));assert.throws(()=>spin(fresh,BETS[0],7999));assert.throws(()=>spin(fresh,BETS[0],9600,()=>-1));assert.throws(()=>spin(newSession(0),BETS[0],9600));assert.throws(()=>spin({...fresh,rounds:Number.MAX_SAFE_INTEGER},BETS[0],9600));assert.equal(fresh.balanceCents,1000000);
});

test("la captura del usuario no paga: el limón debe pasar por el centro del segundo rodillo", () => {
  const screenshot = [2,1,2,1,4, 1,0,3,1,1, 2,2,5,2,4];
  assert.equal(evaluateGrid(screenshot).length,0);
  const corrected = [...screenshot]; corrected[6]=2;
  const wins=evaluateGrid(corrected);
  assert(wins.some(win=>win.cells?.join(",")==="10,6,2"));
  assert(wins.every(win=>win.symbol===2 && win.cells?.includes(6)));
});
test("los premios con líneas compartidas se cobran sumando cada línea una sola vez", () => {
  let ticket=0;
  for (const outcome of OUTCOMES) {
    if(outcome.wins.length>1){
      const session=spin(newSession(),BETS[2],9600,first(ticket,31997));
      assert(session.lastRound!.wins.length>1);
      assert.equal(new Set(session.lastRound!.wins.map(win=>win.line)).size,session.lastRound!.wins.length);
      assert.equal(session.lastRound!.payoutCents,session.lastRound!.wins.reduce((sum,win)=>sum+BETS[2]*win.multiplier,0));
      assert.equal(session.balanceCents,1000000-BETS[2]+session.lastRound!.payoutCents);
      return;
    }
    ticket+=(9600-800)*outcome.weight;
  }
  assert.fail("debe existir un tramo con varias líneas válidas");
});
