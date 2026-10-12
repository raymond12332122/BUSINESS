import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import * as K from '../../narco/kit.js';
import * as N from '../../narco/props.js';
import { runShots, wt } from '../../mx/shots.js';
import * as U from '../ui.js';
import * as PM from '../pmap.js';
import * as S from '../sets.js';
import * as A from '../anim.js';

export { preload } from '../pmap.js';
const fade = PM.fade;

export function build(ctx) {
  const L = ctx.L;
  const tCorr = wt(L[0], 'corrupcion'), tSiete = wt(L[0], 'siete'), tEnj = wt(L[0], 'enjambre'), tVein = wt(L[0], 'veintitres'), tEsp = wt(L[0], 'esperanza'), tFron = wt(L[0], 'frontera');
  const tPres = wt(L[1], 'presidente'), tHer = wt(L[1], 'hermano'), tExd = wt(L[1], 'exdirectora'), tSeg = wt(L[1], 'segun'), tRed = wt(L[1], 'red'), tZun = wt(L[1], 'zuniga'),
    tRobo = wt(L[1], 'robo'), tExt = wt(L[1], 'extorsion'), tSec = wt(L[1], 'secuestro');
  const tAseg = wt(L[2], 'aseguraron'), tCuar = wt(L[2], 'cuarenta'), tBar = wt(L[2], 'barret'), tVeh = wt(L[2], 'vehiculos'), tDro = wt(L[2], 'drones'), tInh = wt(L[2], 'inhibidores'), tSus = wt(L[2], 'sus');

  // ---- 1. Map: Esperanza on the Veracruz line
  const Mp = PM.pueblaMap();
  const pul = PM.pulse(Mp, ...PM.muniLab(Mp, 'Esperanza'), '#c0392b', 0.9);
  // ---- 2/3. The raid in Esperanza
  const T = S.townStreet('dawn');
  const det = [K.person(T, 'doto', 'alcalde', 0, 0, 0), K.person(T, 'oguri', 'civil', -1.25, 0, 0), K.person(T, 'suzuka', 'municipal', 1.25, 0, 0)];
  const esc = [K.person(T, 'helios', 'fgr', -0.6, 0, 0), K.person(T, 'mcqueen', 'fgr', 0.65, 0, 0), K.person(T, 'cafe', 'marino', -1.9, 0, 0), K.person(T, 'daiwa', 'fgr', 1.9, 0, 0)];
  const cars = [N.patrol('marina'), N.patrol('guardia'), N.suv('#141518'), N.patrol('marina')];
  [[-2.5, -7, 0.1], [2.4, -9, -0.15], [-1.4, -14, 0], [2.6, -3.5, -0.3]].forEach(([x, z, r], i) => { cars[i].position.set(x, 0, z); cars[i].rotation.y = r; T.add(cars[i]); });
  // ---- 4. Evidence yard
  const E = S.evidenceYard();
  const guards = [K.person(E, 'helios', 'fgr', -4.4, -1.6, 0.35), K.person(E, 'oguri', 'marino', 4.5, -1.8, -0.4)];

  const sfx = [{ t: 0.2, type: 'whoosh', vol: 0.4 }, { t: tEnj, type: 'sting', vol: 0.45 }, { t: tEsp, type: 'pop', vol: 0.45 },
    { t: L[1].t0 - 0.4, type: 'sirens', dur: tSec - L[1].t0 + 0.5, vol: 0.28 }, { t: tPres, type: 'stamp', vol: 0.4 }, { t: tHer, type: 'stamp', vol: 0.35 }, { t: tExd, type: 'stamp', vol: 0.35 },
    { t: tZun, type: 'hit', vol: 0.5 }, { t: L[2].t0 - 0.3, type: 'camera', dur: 2.0, vol: 0.4 }, { t: tCuar, type: 'pop', vol: 0.4 }, { t: tBar, type: 'pop', vol: 0.4 }, { t: tDro, type: 'pop', vol: 0.4 }];

  const tB = L[1].t0 - 0.3, tC = tSeg - 0.3, tD = L[2].t0 - 0.3;
  const raid = (t, t0) => {
    const z = -1.6 + (t - t0) * 0.28;
    det.forEach((d, i) => { d.root.position.z = z + (i ? -0.35 : 0.1); K.pose(d, A.cuffed(t, i)); d.setFace(C.blinkEye(t, i), 'frown'); });
    esc.forEach((e, i) => { e.root.position.z = z - 0.95 - (i < 2 ? 0 : 0.3); K.pose(e, A.escort(t, 4 + i)); e.setFace(C.blinkEye(t, 4 + i), 'neutral'); });
    cars[0].blink(t, 1); cars[1].blink(t + 0.25, 1); cars[3].blink(t + 0.5, 1);
  };
  const shots = [
    { t0: 0, set: Mp, p0: [3.2, 13.5, 8.8], l0: [2.8, 0, 0.4], p1: [3.2, 12.0, 7.8], l1: [2.9, 0, 0.6], fov0: 40, act: (t) => {
      Mp.reset(); Mp.tint('Esperanza', '#c0392b', ss(tEsp - 0.2, tEsp + 0.4, t), 0.75); Mp.tint('Veracruz', '#d8c27a', ss(tFron - 0.2, tFron + 0.4, t), 0.45);
      Mp.highway.set(1); pul.update(t, tEsp);
      return U.film(t) + U.badge(t, '7 de septiembre de 2026', 'Operativo Enjambre', '23 cateos en el municipio de Esperanza', tSiete - 0.2, tB)
        + PM.chip(ctx, Mp, 'Esperanza', fade(t, tEsp - 0.1, tB), 'frontera con Veracruz', '#c0392b')
        + PM.label(ctx, PM.ppos(-96.95, 19.12, 0.15), 'VERACRUZ', 'st', fade(t, tFron - 0.2, tB)) + PM.clabel(ctx, Mp, 'Orizaba', fade(t, tFron, tB))
        + PM.clabel(ctx, Mp, 'Puebla', fade(t, 0.5, tB), 'c', 'Puebla (capital)');
    } },
    { t0: tB, set: T, p0: [0.9, 1.15, 4.6], l0: [-0.1, 0.85, -3], p1: [0.8, 1.1, 3.9], l1: [-0.1, 0.85, -3], fov0: 40, act: (t) => {
      raid(t, tB);
      return U.film(t) + U.doc(t, tPres - 0.3, tC + 0.1, 'Detenidos en Esperanza', [['El presidente municipal', tPres - 0.1], ['Su hermano', tHer - 0.1], ['La exdirectora de la policía municipal', tExd - 0.1]], { left: 90, top: 110, width: 600 });
    } },
    { t0: tC, set: T, p0: [-3.4, 1.75, 6.6], l0: [0.2, 0.85, -0.2], p1: [-3.0, 1.7, 6.2], l1: [0.2, 0.85, 0.4], fov0: 40, act: (t) => {
      raid(t, tB);
      return U.film(t) + U.doc(t, tRed - 0.4, tD, 'Una red ligada a «Los Zúñiga»', [['Robo de carga en la autopista', tRobo - 0.1], ['Extorsión', tExt - 0.1], ['Secuestro', tSec - 0.1]], { left: 1170, top: 110, width: 620, foot: 'Según el Gabinete de Seguridad' });
    } },
    { t0: tD, set: E, p0: [-0.3, 2.3, 3.4], l0: [-0.3, 0.7, -0.8], p1: [-0.1, 2.1, 3.0], l1: [-0.1, 0.7, -0.8], fov0: 46, act: (t) => {
      guards.forEach((g, i) => { K.pose(g, { ...C.idle(t, i, 0.3), gun: 'port' }); g.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.badge(t, 'Lo asegurado', 'Arsenal de la red', 'Cateos del 7 de septiembre', tAseg - 0.2, ctx.dur + 1)
        + U.icons(t, tCuar - 0.3, ctx.dur + 1, [[U.pistolIcon('#e9e6df', 54), 'Más de 40 armas', tCuar - 0.1], [U.pistolIcon('#ff8a6a', 54), '2 rifles Barrett', tBar - 0.1], ['🚙', 'Vehículos blindados', tVeh - 0.1], ['📡', 'Drones e inhibidores', tDro - 0.1]], { y: 740 })
        + U.source(t, tSus - 0.2, ctx.dur + 1, 'Presuntos responsables: sus casos siguen en proceso');
    } },
  ];
  const inst = { scene: Mp, scenes: [Mp, T, E], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
