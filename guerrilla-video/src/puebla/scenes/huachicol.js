import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import * as K from '../../narco/kit.js';
import * as N from '../../narco/props.js';
import * as X from '../../mx/props.js';
import { runShots, wt } from '../../mx/shots.js';
import * as U from '../ui.js';
import * as PM from '../pmap.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as A from '../anim.js';

export { preload } from '../pmap.js';
const fade = PM.fade;

export function build(ctx) {
  const L = ctx.L;
  const tEsp = wt(L[0], 'especialidad'), tRobo = wt(L[0], 'robo'), tNueve = wt(L[0], 'nueve'), tPue = wt(L[0], 'puebla'), tCarp = wt(L[0], 'carpetas'), tHid = wt(L[0], 'hidrocarburos');
  const tGas = wt(L[1], 'gas'), tMitad = wt(L[1], 'mitad'), tTomas = wt(L[1], 'tomas');
  const tTep = wt(L[2], 'tepeaca'), tTri = wt(L[2], 'triangulo'), tTla = wt(L[2], 'tlahuapan'), tTex = wt(L[2], 'texmelucan'), tPerf = wt(L[2], 'perforaciones');

  // ---- 1/2. A tap on the Pemex pipeline at night
  const D = S.ductField('night');
  const men = [K.person(D, 'tamamo', 'huachicolero', 0.35, -0.75, 0.25), K.person(D, 'daiwa', 'huachicolero', -1.15, -0.95, 0.55), K.person(D, 'oguri', 'huachicolero', 1.9, -1.0, -0.5)];
  const load = new THREE.Group(); for (let i = 0; i < 8; i++) { const b = P.bidon(['#e8e4dc', '#2a5a9a', '#e8e4dc', '#b8432f'][i % 4]); b.position.set(-0.32 + (i % 4) * 0.21, 0, -0.3 + Math.floor(i / 4) * 0.4); load.add(b); }
  const pk = N.pickup('#5a5e64', { night: true, bedLoad: load }); pk.position.set(3.4, 0, -2.6); pk.rotation.y = -0.95; D.add(pk);
  const cans = [[0.9, 0.55, '#e8e4dc'], [1.15, 0.35, '#2a5a9a'], [-0.5, 0.6, '#e8e4dc']].map(([x, z, c]) => { const b = P.bidon(c); b.position.set(x, 0, z); D.add(b); return b; });
  const gasPlume = X.smokeTrail(D, 14, { color: '#aab4bc', size: 0.26, rise: 1.8, drift: [0.5, 0, -0.2], life: 2.0, opacity: 0.32 });
  // ---- 3. Map: Triángulo Rojo and Tlahuapan
  const Mp = PM.pueblaMap();
  const pul = [PM.pulse(Mp, ...PM.muniLab(Mp, 'Tepeaca'), '#c0392b', 0.8), PM.pulse(Mp, ...PM.muniLab(Mp, 'Tlahuapan'), '#c0392b', 0.8)];

  const sfx = [{ t: 0.0, type: 'night', dur: L[2].t0 - 0.3, vol: 0.32 }, { t: tRobo, type: 'pour', dur: 4.0, vol: 0.35 }, { t: tCarp - 0.1, type: 'pop', vol: 0.45 },
    { t: L[1].t0 - 0.3, type: 'hiss', dur: L[2].t0 - L[1].t0, vol: 0.4 }, { t: tMitad, type: 'pop', vol: 0.45 },
    { t: L[2].t0 - 0.3, type: 'whoosh', vol: 0.4 }, { t: tTep, type: 'tick', vol: 0.35 }, { t: tTla, type: 'tick', vol: 0.35 }];

  const tB = L[1].t0 - 0.3, tC = L[2].t0 - 0.35;
  const field = (t) => {
    K.pose(men[0], A.fill(t, 1)); men[0].setFace(C.blinkEye(t, 1), 'neutral');
    K.pose(men[1], { ...C.idle(t, 2, 0.4), head: [8, 20 * Math.sin(t * 0.5), 0] }); men[1].setFace(C.blinkEye(t, 2), 'neutral');
    K.pose(men[2], C.offer(t, 3, 0.6)); men[2].setFace(C.blinkEye(t, 3), 'neutral');
    D.lamp.intensity = 12 + 1.5 * Math.sin(t * 7) * Math.sin(t * 3.1);
  };
  const shots = [
    { t0: 0, set: D, p0: [1.6, 1.35, 4.6], l0: [0.2, 0.55, -0.8], p1: [1.4, 1.25, 3.8], l1: [0.2, 0.55, -0.8], fov0: 40, act: (t) => {
      field(t);
      return U.film(t) + U.badge(t, 'Triángulo Rojo · Puebla', 'El huachicol', 'Ordeña de los ductos de Pemex', tEsp - 0.2, tB)
        + U.counter(t, tCarp - 0.2, tB, 110, 330, 896, 'carpetas por robo de hidrocarburos (ene.–sep. 2025): primer lugar nacional', { from: 200, dur: 1.2, color: '#ffb35a', w: 620 })
        + U.source(t, tHid, tB, 'SESNSP, enero–septiembre de 2025');
    } },
    { t0: tB, set: D, p0: [-1.6, 0.95, 2.6], l0: [0.5, 0.75, -0.8], p1: [-1.35, 0.95, 2.2], l1: [0.5, 0.85, -0.8], fov0: 40, act: (t) => {
      field(t); gasPlume(t, { x: 0.3, y: 0.25, z: 0 }, ss(tB, tB + 0.6, t));
      return U.film(t) + U.badge(t, 'Gas LP', 'El "huachigas"', 'Tomas en los ductos de gas', tGas - 0.2, tC)
        + U.counterD(t, tMitad - 0.2, tC, 1200, 300, 52.5, 'de las tomas clandestinas de gas LP de todo el país (ene.–mar. 2026)', { from: 10, dur: 1.2, color: '#ff8a6a', suffix: ' %', w: 620, dec: 1 })
        + U.source(t, tTomas, tC, 'Pemex, vía Observatorio IGAVIM');
    } },
    { t0: tC, set: Mp, p0: [-2.6, 9.0, 5.0], l0: [-1.6, 0, -0.4], p1: [-2.3, 8.2, 4.4], l1: [-1.5, 0, -0.5], fov0: 40, act: (t) => {
      Mp.reset(); const kt = ss(tTri - 0.3, tTri + 0.4, t);
      for (const n of PM.TRIANGULO) Mp.tint(n, '#c0392b', kt, 0.55);
      Mp.tint('Tepeaca', '#c0392b', ss(tTep - 0.2, tTep + 0.3, t), 0.85); Mp.tint('Tlahuapan', '#c0392b', ss(tTla - 0.2, tTla + 0.3, t), 0.85);
      Mp.pipeline.set(1); pul[0].update(t, tTep); pul[1].update(t, tTla);
      return U.film(t) + PM.chip(ctx, Mp, 'Tepeaca', fade(t, tTep - 0.1, ctx.dur + 1), '40 tomas de gas LP', '#c0392b')
        + PM.chip(ctx, Mp, 'Tlahuapan', fade(t, tTla - 0.1, ctx.dur + 1), '30 tomas de gas LP', '#c0392b')
        + PM.label(ctx, PM.ppos(-97.62, 18.78, 0.4), 'TRIÁNGULO ROJO', 'big', fade(t, tTri - 0.2, ctx.dur + 1)).replace('class="lbl big"', 'class="lbl big r"')
        + PM.clabel(ctx, Mp, 'Texmelucan', fade(t, tTex - 0.2, ctx.dur + 1)) + PM.clabel(ctx, Mp, 'Puebla', fade(t, tC + 0.2, ctx.dur + 1), 'c', 'Puebla (capital)')
        + U.source(t, tPerf, ctx.dur + 1, 'Pemex, enero–marzo de 2026 · los municipios con más perforaciones del país');
    } },
  ];
  const inst = { scene: D, scenes: [D, Mp], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
