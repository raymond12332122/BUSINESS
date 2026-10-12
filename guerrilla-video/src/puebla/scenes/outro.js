import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import * as K from '../../narco/kit.js';
import { runShots, wt } from '../../mx/shots.js';
import * as U from '../ui.js';
import * as S from '../sets.js';

export { preload } from '../pmap.js';
const CAST = ['doto', 'oguri', 'suzuka', 'mcqueen', 'tamamo', 'daiwa', 'helios', 'cafe'];

export function build(ctx) {
  const L = ctx.L;
  const tFut = wt(L[0], 'futuro'), tLim = wt(L[0], 'limpien'), tCas = wt(L[0], 'castigue'), tCor = wt(L[0], 'corte');
  const tEsta = wt(L[1], 'esta'), tAva = wt(L[1], 'avanza');

  // ---- 1. The zócalo at golden hour, people going about their day
  const Z = S.pueblaZocalo('golden');
  const folks = [[1.6, 3.0, -0.6, 'idle'], [2.5, 2.4, -1.25, 'idle'], [-1.0, 1.0, 0.25, 'walk'], [0.7, 5.2, 0.2, 'idle'], [-2.1, 3.8, 0.35, 'walk']]
    .map(([x, z, y, m], i) => { const p = K.person(Z, CAST[(i + 2) % CAST.length], i === 3 ? 'joven' : 'civil', x, z, y); Object.assign(p, { mode: m, z0: z, x0: x }); return p; });
  // ---- 2. The cathedral at night: closing card
  const Zn = S.pueblaZocalo('night');

  const sfx = [{ t: 0.2, type: 'birds', dur: L[1].t0 - 0.4, vol: 0.28 }, { t: 0.2, type: 'crowd', dur: L[1].t0 - 0.4, vol: 0.12 },
    ...[tLim, tCas, tCor].map(t => ({ t, type: 'tick', vol: 0.35 })),
    { t: L[1].t0 - 0.35, type: 'whoosh', vol: 0.35 }, { t: tEsta - 0.2, type: 'swell', dur: 4.5, vol: 0.32 }, { t: tAva, type: 'hit', vol: 0.45 }];

  const tB = L[1].t0 - 0.35;
  const shots = [
    { t0: 0, set: Z, p0: [1.6, 1.65, 12.2], l0: [-1.6, 1.1, 1.0], p1: [1.4, 1.6, 11.2], l1: [-1.6, 1.1, 1.0], fov0: 40, act: (t) => {
      folks.forEach((f, i) => {
        if (f.mode === 'walk') { f.root.position.x = f.x0 + Math.sin(f.root.rotation.y) * 0.25 * t; f.root.position.z = f.z0 + Math.cos(f.root.rotation.y) * 0.25 * t; K.pose(f, C.walk(t, 0.35, i)); }
        else K.pose(f, C.idle(t, i, 0.5));
        f.setFace(C.blinkEye(t, i), f.mode === 'walk' ? 'neutral' : C.talkMouth(t, i));
      });
      return U.film(t) + `<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,10,16,.6) 0%,rgba(8,10,16,0) 58%)"></div>`
        + U.steps(t, tFut - 0.2, tB, 'El futuro de Puebla depende de…', [['Limpiar las policías municipales', tLim - 0.1], ['Castigar a los políticos coludidos', tCas - 0.1], ['Cortar el negocio del combustible y la carga robada', tCor - 0.1]], { x: 90, y: 150, w: 800 });
    } },
    { t0: tB, set: Zn, p0: [0, 2.2, 15], l0: [0, 8.5, -25], p1: [0, 2.6, 11.5], l1: [0, 9.4, -25], fov0: 46, act: (t) => {
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,10,16,.3)"></div>`
        + U.titleCard(t, tB + 0.2, ctx.dur + 1, 'PUEBLA · 2026', 'EL CRIMEN<br>AVANZA EN PUEBLA', 'Gracias por ver', 150);
    } },
  ];
  const inst = { scene: Z, scenes: [Z, Zn], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
