import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as N from '../props.js';
import * as MS from '../../mx/sets.js';
import * as MA from '../../mx/anim.js';
import { runShots, wt } from '../../mx/shots.js';
import * as U from '../ui.js';

export { preload } from '../mapkit.js';

export function build(ctx) {
  const L = ctx.L;
  const tGra = wt(L[0], 'gratis'), tDe = wt(L[0], 'de$'), tNov = wt(L[0], 'noventa'), tDen = wt(L[0], 'denuncian'), tMen = wt(L[0], 'menos');
  const tEva = wt(L[1], 'evalua'), tImp = wt(L[1], 'impunidad'), t99 = wt(L[1], 'noventa'), tY = wt(L[1], 'y$', 1), tIPC = wt(L[1], 'indice'), t27 = wt(L[1], 'veintisiete'), tOC = wt(L[1], 'ultimo');

  // ---- 1. A prosecutor's office buried in case files
  const F = S.fiscalia();
  const mp = K.person(F, 'suzuka', 'official', 0, -1.35, 0); mp.root.position.y = 0.1;
  const vic = K.person(F, 'mcqueen', 'civil', 0.95, 0.05, 3.74);
  const queue = [0, 1, 2].map(i => K.person(F, ['doto', 'oguri', 'daiwa'][i], 'civil', 3.0, 0.1 + i * 0.8, -Math.PI / 2));
  // ---- 2. Palacio Nacional (corruption index)
  const Z = MS.zocalo('golden');

  const sfx = [{ t: 0.2, type: 'clock', dur: tDe, vol: 0.35 }, { t: tGra - 0.1, type: 'stamp', vol: 0.5 },
    { t: tDe - 0.3, type: 'whoosh', vol: 0.35 }, { t: tNov, type: 'tick', vol: 0.3 }, { t: tDen + 0.4, type: 'tick', vol: 0.3 }, { t: tMen, type: 'pop', vol: 0.45 },
    { t: L[1].t0 - 0.3, type: 'riser', dur: 3.6, vol: 0.35 }, { t: t99 - 0.05, type: 'hit', vol: 0.55 },
    { t: tY - 0.25, type: 'whoosh', vol: 0.4 }, { t: t27, type: 'hit', vol: 0.5 }];

  const tB = tDe - 0.3, tC = L[1].t0 - 0.3, tD = tY - 0.25;
  const office = (t) => {
    K.pose(mp, { ...MA.sign(t, 1), head: [2, -14 + 4 * Math.sin(t * 0.6), 0] }); mp.setFace(C.blinkEye(t, 1), 'frown');
    K.pose(vic, { ...MA.sit(t, 2, 4), head: [-6, 0, 0], armL: [-40, -10, -70], armR: [-40, 10, 70], elbL: [0, -50, 0], elbR: [0, 50, 0] }); vic.root.position.y = 0.0;
    vic.setFace(C.blinkEye(t, 2), 'frown');
    queue.forEach((q, i) => { K.pose(q, { ...MA.sit(t, 3 + i, 6), head: [8, 10 * Math.sin(t * 0.4 + i * 2), 0] }); q.setFace(C.blinkEye(t, 3 + i), i === 1 ? 'frown' : 'neutral'); });
  };
  const shots = [
    { t0: 0, set: F, p0: [-2.5, 1.5, 3.3], l0: [0.6, 0.6, -0.5], p1: [-2.1, 1.42, 2.8], l1: [0.6, 0.6, -0.5], fov0: 44, act: (t) => {
      office(t);
      return U.film(t) + U.badge(t, 'Ministerio Público', 'La impunidad', 'Denunciar puede tomar horas… y casi nunca sirve', 0.5, tB);
    } },
    { t0: tB, set: F, p0: [-0.45, 0.98, 0.95], l0: [0.75, 0.6, -1.35], p1: [-0.42, 0.95, 0.7], l1: [0.75, 0.6, -1.35], fov0: 40, act: (t) => {
      office(t);
      return U.film(t) + `<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,10,16,0) 40%,rgba(8,10,16,.55) 60%)"></div>`
        + U.dots100(t, tB + 0.1, tC, tNov, tDen + 0.4, tMen, { x: 1120, y: 120 })
        + U.source(t, tDen, tC, 'INEGI, ENVIPE 2025 (cifra negra: 93 %)');
    } },
    { t0: tC, set: F, p0: [0.3, 1.15, -1.75], l0: [-0.9, 1.25, -4.5], p1: [0.2, 1.12, -2.1], l1: [-0.9, 1.25, -4.5], fov0: 44, act: (t) => {
      office(t);
      return U.film(t) + `<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,10,16,.7) 0%,rgba(8,10,16,0) 55%)"></div>`
        + U.counter(t, t99 - 0.15, tD, 130, 260, 99, 'de los delitos quedan impunes', { from: 50, dur: 1.0, color: '#ff8a6a', suffix: ' %', w: 620 })
        + U.source(t, tEva, tD, 'México Evalúa, «Hallazgos»: impunidad estimada');
    } },
    { t0: tD, set: Z, p0: [5.5, 1.6, 10], l0: [-2.5, 3.4, -16], p1: [4.8, 1.6, 8.6], l1: [-2.5, 3.6, -16], fov0: 42, act: (t) => {
      Z.flag.wave(t);
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,10,16,${0.3 * ss(tD, tD + 0.5, t)})"></div>`
        + U.gauge(t, tIPC - 0.3, ctx.dur + 1, 27, { x: 1190, y: 170, title: 'Índice de Percepción de la Corrupción', sub: `Lugar 141 de 182 países<br><b style="color:#fff;opacity:${ss(tOC - 0.2, tOC + 0.2, t)}">El último de los 38 países de la OCDE</b>` })
        + U.source(t, t27, ctx.dur + 1, 'Transparencia Internacional, IPC 2025 · 0 = muy corrupto, 100 = muy limpio');
    } },
  ];
  const inst = { scene: F, scenes: [F, Z], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
