import assert from 'node:assert/strict';
import {test} from 'node:test';
import {EUROPEAN_WHEEL} from './roulette-engine.ts';
import {rouletteSpinMotion} from './roulette-motion.ts';
const distance=(a:number,b:number)=>Math.abs(((a-b+180)%360+360)%360-180);
test('la bola termina en el número resuelto en cualquier posición y tras rondas consecutivas',()=>{
 let wheel=0,ball=0;
 for(const landing of [0,13.7,45,90,137.25,180,234.9,270,315,359.99])for(const [index,number]of EUROPEAN_WHEEL.entries()){
  const next=rouletteSpinMotion(number,wheel,ball,landing);
  assert(next.wheelDegrees-wheel>=1800);assert(ball-next.ballDegrees>=2880);
  assert(distance(next.ballDegrees,landing)<1e-7);
  assert(distance(next.wheelDegrees+index*360/37,next.ballDegrees)<1e-7,`${number} at ${landing}`);
  wheel=next.wheelDegrees;ball=next.ballDegrees;
 }
});
test('movimientos inválidos no producen destinos engañosos',()=>{
 for(const n of [-1,37,1.5,NaN])assert.throws(()=>rouletteSpinMotion(n,0,0,90));
 for(const args of [[NaN,0,0],[0,Infinity,0],[0,0,NaN]])assert.throws(()=>rouletteSpinMotion(0,...args as [number,number,number]));
});
