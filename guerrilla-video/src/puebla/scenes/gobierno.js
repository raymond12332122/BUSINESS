import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import * as K from '../../narco/kit.js';
import * as N from '../../narco/props.js';
import * as NS from '../../narco/sets.js';
import * as MA from '../../mx/anim.js';
import { runShots, wt } from '../../mx/shots.js';
import * as U from '../ui.js';
import * as S from '../sets.js';

export { preload } from '../pmap.js';

const screenTex = (title, sub) => N.canvasTex(1024, 512, (x, W, H) => {
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#5a1f2a'); g.addColorStop(1, '#2a0f16'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = '#d4af37'; x.fillRect(W / 2 - 60, 318, 120, 5); x.textAlign = 'center'; x.fillStyle = '#ffffff'; x.font = '900 60px Inter'; x.fillText(title, W / 2, 396);
  if (sub) { x.fillStyle = '#e8d9b0'; x.font = '700 32px Inter'; x.fillText(sub, W / 2, 448); } });

export function build(ctx) {
  const L = ctx.L;
  const tHac = wt(L[0], 'haciendo'), tGobr = wt(L[0], 'gobernador'), tAle = wt(L[0], 'alejandro'), tCero = wt(L[0], 'cero'), tNue = wt(L[0], 'nueve'), tRec = wt(L[0], 'reconoce'), tAme = wt(L[0], 'amenazas');
  const tFed = wt(L[1], 'federal'), tOpe = wt(L[1], 'operativo'), tSeg = wt(L[1], 'segun'), tHom = wt(L[1], 'homicidios'), tCua = wt(L[1], 'cuarenta'), tSep = wt(L[1], 'septiembre'), tDic = wt(L[1], 'diciembre');

  // ---- 1/2. The state government's press room
  const Pr = S.pressRoom('Gobierno de Puebla', 'Estrategia «Cero Impunidad»');
  const arm = K.person(Pr, 'armenta', 'armenta', 0, -2.85, 0); arm.root.position.y = 0.25;
  // ---- 3/4. The federal security cabinet
  const Mn = NS.mananera(); Mn.screen.material = new THREE.MeshBasicMaterial({ map: screenTex('Gabinete de Seguridad', '') });
  const ogh = K.person(Mn, 'harfuch', 'harfuch', 0, -2.85, 0); ogh.root.position.y = 0.25;

  const sfx = [{ t: 0.3, type: 'crowd', dur: 2.8, vol: 0.16 }, { t: tHac, type: 'hit', vol: 0.4 }, { t: tGobr - 0.3, type: 'swoosh', vol: 0.35 },
    { t: tCero, type: 'stamp', vol: 0.4 }, { t: tNue, type: 'pop', vol: 0.4 }, { t: tRec, type: 'pop', vol: 0.4 },
    { t: L[1].t0 - 0.3, type: 'whoosh', vol: 0.35 }, { t: tSeg, type: 'swoosh', vol: 0.3 }, { t: tCua, type: 'pop', vol: 0.5 }];

  const tB = tGobr - 0.3, tC = L[1].t0 - 0.3, tD = tSeg - 0.3;
  const orate = (t, who, flags) => { K.pose(who, MA.orate(t, 1, 0.55)); who.setFace(C.blinkEye(t, 1), C.talkMouth(t, 1)); flags.forEach(f => f.wave(t)); };
  const shots = [
    { t0: 0, set: Pr, p0: [0.0, 1.9, 6.4], l0: [0, 1.45, -2.85], p1: [0.0, 1.8, 5.5], l1: [0, 1.45, -2.85], fov0: 42, act: (t) => {
      orate(t, arm, Pr.flags);
      return U.film(t) + `<div style="position:absolute;inset:0;background:linear-gradient(0deg,rgba(8,10,16,${0.6 * ss(0.4, 0.9, t)}) 0%,rgba(8,10,16,0) 55%)"></div>`
        + U.big(t, 0.5, tB, '¿Y qué está haciendo el gobierno?', { top: 640, size: 72 });
    } },
    { t0: tB, set: Pr, p0: [1.1, 1.2, 0.6], l0: [0, 1.12, -2.85], p1: [0.8, 1.18, 0.0], l1: [0, 1.12, -2.85], fov0: 38, act: (t) => {
      orate(t, arm, Pr.flags);
      return U.film(t) + U.nameplate(ctx, [0, 1.42, -2.85], 'Alejandro Armenta', 'Gobernador de Puebla · 2024–2030', tAle - 0.2, tCero - 0.3)
        + U.doc(t, tCero - 0.3, tC, 'Lo que dice el gobierno de Puebla', [['Estrategia «Cero Impunidad»', tCero - 0.1], ['Más de 9,500 detenidos (cifra estatal)', tNue - 0.1], ['Él y su equipo han recibido amenazas', tRec - 0.1]], { left: 1170, top: 130, width: 640 });
    } },
    { t0: tC, set: Mn, p0: [0.9, 1.2, 0.3], l0: [0, 1.12, -2.85], p1: [0.7, 1.18, -0.2], l1: [0, 1.12, -2.85], fov0: 38, act: (t) => {
      orate(t, ogh, Mn.flags);
      return U.film(t) + U.nameplate(ctx, [0, 1.42, -2.85], 'Omar García Harfuch', 'Secretario de Seguridad federal', tFed - 0.2, tD);
    } },
    { t0: tD, set: Mn, p0: [-1.5, 1.15, -0.3], l0: [0.7, 1.1, -2.85], p1: [-1.25, 1.13, -0.7], l1: [0.7, 1.1, -2.85], fov0: 38, act: (t) => {
      orate(t, ogh, Mn.flags);
      return U.film(t) + `<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,10,16,0) 40%,rgba(8,10,16,.55) 70%)"></div>`
        + U.pair(t, tHom - 0.3, ctx.dur + 1, 'Homicidios diarios en Puebla', ['Sep. 2024', 3.97], ['Dic. 2025', 2.35], { x: 1330, y: 200, change: '−41 %', good: true, dec: 2, sub: 'Promedio diario, según el gobierno federal' })
        + U.source(t, tSep, ctx.dur + 1, 'Gabinete de Seguridad federal · otras mediciones dan porcentajes distintos');
    } },
  ];
  const inst = { scene: Pr, scenes: [Pr, Mn], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
