import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import * as K from '../../narco/kit.js';
import * as N from '../../narco/props.js';
import * as NS from '../../narco/sets.js';
import * as MA from '../../mx/anim.js';
import { runShots, wt } from '../../mx/shots.js';
import * as U from '../ui.js';
import * as PM from '../pmap.js';
import * as P from '../props.js';

export { preload } from '../pmap.js';
const fade = PM.fade;

export function build(ctx) {
  const L = ctx.L;
  const tNeg = wt(L[0], 'negocio'), tRobo = wt(L[0], 'robo'), tCasi = wt(L[0], 'casi'), tPue = wt(L[0], 'puebla'), tPrim = wt(L[0], 'primer');
  const tNoche = wt(L[1], 'noche'), tAuto = wt(L[1], 'autopista'), tRod = wt(L[1], 'rodear');

  // ---- 1. A tractor-trailer held up on the highway at night
  const H = NS.highway('nightCity'); H.userData.hemi.intensity = 1.3;
  for (let i = 0; i < 5; i++) { const l = N.streetLight(true, 5); l.position.set(-4.4, 0, 10 - i * 10); l.rotation.y = Math.PI / 2; H.add(l); }
  const truck = P.semi('#2f5a8a', { night: true, stripe: '#b8432f' }); truck.position.set(1.8, 0, -7.0); H.add(truck);
  const fill = new THREE.PointLight('#ffd9a0', 14, 13, 1.3); fill.position.set(-1.6, 4.4, 1.2); H.add(fill);
  const fill2 = new THREE.PointLight('#a8c0ff', 5, 12, 1.4); fill2.position.set(-3.2, 2.0, 4.0); H.add(fill2);
  const pk = N.pickup('#16171a', { night: true }); pk.position.set(1.6, 0, 2.1); pk.rotation.y = -1.35; H.add(pk);
  const driver = K.person(H, 'mcqueen', 'trailero', 0.75, -1.9, -0.55);
  const gun = [K.person(H, 'tamamo', 'sicarioArmed', -1.3, -0.35, 2.22), K.person(H, 'daiwa', 'sicarioArmed', 2.1, -0.5, -2.45), K.person(H, 'helios', 'sicarioArmed', -0.9, -2.2, 1.5)];
  // ---- 2. Map at night: the Puebla–Orizaba highway
  const Mp = PM.pueblaMap({ light: 'night' });

  const sfx = [{ t: 0.0, type: 'engines', dur: 2.6, vol: 0.4 }, { t: 0.4, type: 'brakes', vol: 0.45 }, { t: tRobo, type: 'cock', vol: 0.5 }, { t: tCasi - 0.1, type: 'pop', vol: 0.45 },
    { t: L[1].t0 - 0.3, type: 'whoosh', vol: 0.4 }, { t: tNoche, type: 'night', dur: ctx.dur - tNoche, vol: 0.3 }];

  const tB = L[1].t0 - 0.3;
  const shots = [
    { t0: 0, set: H, p0: [-2.4, 1.55, 3.4], l0: [0.9, 0.8, -1.6], p1: [-2.1, 1.5, 2.8], l1: [0.9, 0.8, -1.6], fov0: 42, act: (t) => {
      K.pose(driver, MA.handsUp(t, 1)); driver.setFace(C.blinkEye(t, 1), 'frown');
      gun.forEach((g, i) => { K.pose(g, { ...C.aim(t, 0, 0), head: [4, 0, 0] }); g.setFace(C.blinkEye(t, 2 + i), 'frown'); });
      return U.film(t) + U.badge(t, 'Autopista Puebla–Orizaba', 'Robo al transporte de carga', 'Asaltos armados contra tráileres', tNeg - 0.2, tB)
        + U.hbars(t, tCasi - 0.3, tB, 'Robo de carga en carreteras, 2025', [['Puebla', 23.5, tCasi - 0.1, true], ['Edomex', 20.0, tPue + 0.2]], { x: 90, y: 150, w: 720, max: 30, unit: ' %', dec: 1, sub: 'Porcentaje del total nacional' })
        + U.source(t, tPrim, tB, 'Overhaul, con datos del SESNSP');
    } },
    { t0: tB, set: Mp, p0: [1.6, 10.5, 6.5], l0: [1.2, 0, -0.4], p1: [1.9, 9.6, 5.6], l1: [1.5, 0, -0.4], fov0: 40, act: (t) => {
      Mp.reset(); Mp.highway.set(ss(tB, tAuto + 0.8, t));
      Mp.tint('Esperanza', '#c0392b', ss(tAuto, tAuto + 0.5, t), 0.7); Mp.tint('Palmar de Bravo', '#c0392b', ss(tAuto + 0.2, tAuto + 0.7, t), 0.55);
      return U.film(t) + PM.label(ctx, PM.ppos(-97.65, 18.98, 0.5), 'Autopista Puebla–Orizaba', 'c', fade(t, tAuto - 0.2, ctx.dur + 1))
        + PM.chip(ctx, Mp, 'Esperanza', fade(t, tAuto + 0.2, ctx.dur + 1), 'foco rojo del robo de carga', '#c0392b')
        + PM.clabel(ctx, Mp, 'Puebla', fade(t, tB + 0.3, ctx.dur + 1), 'c', 'Puebla (capital)') + PM.clabel(ctx, Mp, 'Orizaba', fade(t, tB + 0.5, ctx.dur + 1))
        + U.icons(t, tNoche - 0.2, ctx.dur + 1, [['🌙', 'Asaltos de 8 p. m. a 7 a. m.', tNoche], ['🔁', 'Transportistas rodean el estado', tRod - 0.2]], { y: 790 })
        + U.source(t, tNoche, ctx.dur + 1, 'Canacar Puebla · Expansión');
    } },
  ];
  const inst = { scene: H, scenes: [H, Mp], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
