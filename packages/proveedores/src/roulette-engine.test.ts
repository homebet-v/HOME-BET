import assert from 'node:assert/strict';
import {test} from 'node:test';
import {EUROPEAN_WHEEL,ROULETTE_SPOTS,rouletteColor,newRouletteSession,rouletteStake,settleRoulette,spinRoulette,randomRouletteNumber} from './roulette-engine.ts';
test('37 bolsillos únicos, colores y catálogo con RTP europeo exacto para cada apuesta',()=>{
 assert.deepEqual([...EUROPEAN_WHEEL].sort((a,b)=>a-b),Array.from({length:37},(_,i)=>i));
 assert.equal(Array.from({length:36},(_,i)=>rouletteColor(i+1)).filter(c=>c==='red').length,18);
 assert.equal(new Set(ROULETTE_SPOTS.map(s=>s.id)).size,ROULETTE_SPOTS.length);
 for(const spot of ROULETTE_SPOTS){
  assert.equal(new Set(spot.numbers).size,spot.numbers.length);
  let returns=0;
  for(let n=0;n<37;n++){
   const session=settleRoulette(newRouletteSession(),[{spotId:spot.id,amountCents:100}],n);
   const expected=spot.numbers.includes(n)?100*(spot.profitOdds+1):0;
   assert.equal(session.lastRound!.payoutCents,expected);
   assert.equal(session.balanceCents,1_000_000-100+expected);
   returns+=expected;
  }
  assert.equal(returns,3600,spot.id);
 }
});
test('cero pierde todas las apuestas externas; pleno devuelve apuesta más premio',()=>{
 const bets=['red','black','even','odd','low','high','dozen-1','column-1'].map(spotId=>({spotId,amountCents:100}));
 assert.equal(settleRoulette(newRouletteSession(),bets,0).lastRound!.payoutCents,0);
 assert.equal(settleRoulette(newRouletteSession(),[{spotId:'n-0',amountCents:5000}],0).lastRound!.payoutCents,180000);
});
test('suma apuestas superpuestas y duplicadas, conserva entradas y limita historial',()=>{
 const original=newRouletteSession();const bets=[{spotId:'n-1',amountCents:100},{spotId:'red',amountCents:200},{spotId:'n-1',amountCents:300}];
 let next=settleRoulette(original,bets,1);
 assert.equal(next.lastRound!.stakeCents,600);assert.equal(next.lastRound!.payoutCents,14800);assert.equal(next.lastRound!.netCents,14200);
 bets[0].amountCents=999;assert.equal(next.lastRound!.bets[0].amountCents,100);assert.equal(original.balanceCents,1000000);assert.equal(original.rounds,0);
 for(let i=0;i<25;i++)next=settleRoulette(next,[{spotId:'n-0',amountCents:100}],0);
 assert.equal(next.history.length,20);assert.equal(next.rounds,26);
});
test('rechaza entradas inválidas sin consumir RNG ni modificar saldo',()=>{
 const s=newRouletteSession(100);let called=false;const rng=()=>{called=true;return 1};
 for(const bets of [[],[{spotId:'fake',amountCents:100}],[{spotId:'red',amountCents:0}],[{spotId:'red',amountCents:NaN}],[{spotId:'red',amountCents:101}],[{spotId:'red',amountCents:200}],[{spotId:'red',amountCents:10_000_100}]])assert.throws(()=>spinRoulette(s,bets,rng));
 assert.equal(called,false);assert.equal(s.balanceCents,100);
 for(const n of [-1,37,1.5,NaN])assert.throws(()=>settleRoulette(s,[{spotId:'red',amountCents:100}],n));
 assert.throws(()=>rouletteStake(Array.from({length:501},()=>({spotId:'red',amountCents:100}))));
});
test('RNG uniforme rechaza cola de uint32 e inválidos',()=>{
 const values=[0xffffffff,36];assert.equal(randomRouletteNumber(()=>values.shift()!),36);
 for(let n=0;n<37;n++)assert.equal(randomRouletteNumber(()=>n),n);
 for(const n of [-1,0x100000000,1.5,NaN])assert.throws(()=>randomRouletteNumber(()=>n));
 assert.throws(()=>randomRouletteNumber(()=>0xffffffff));
});
