import { EUROPEAN_WHEEL } from '@homebet/proveedores/roulette-engine';
const normalize=(degrees:number)=>((degrees%360)+360)%360;
/** Presentation only: choose an endpoint around the wheel without changing its outcome. */
export function rouletteSpinMotion(number:number,wheelDegrees:number,ballDegrees:number,landingDegrees:number){
 const index=(EUROPEAN_WHEEL as readonly number[]).indexOf(number);
 if(index<0||![wheelDegrees,ballDegrees,landingDegrees].every(Number.isFinite))throw new Error('Movimiento de ruleta inválido');
 const landing=normalize(landingDegrees);
 const wheelTarget=normalize(landing-index*360/EUROPEAN_WHEEL.length);
 return {
  wheelDegrees:wheelDegrees+360*5+normalize(wheelTarget-normalize(wheelDegrees)),
  ballDegrees:ballDegrees-360*8-normalize(normalize(ballDegrees)-landing),
 };
}
