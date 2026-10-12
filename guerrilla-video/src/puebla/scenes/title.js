import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import * as K from '../../narco/kit.js';
import * as N from '../../narco/props.js';
import * as NS from '../../narco/sets.js';
import { runShots, wt } from '../../mx/shots.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as A from '../anim.js';

export { preload } from '../pmap.js';

export function build(ctx) {
  const L = ctx.L;
  const tSep = wt(L[0], 'septiembre'), tDet = wt(L[0], 'detuvo'), tDos = wt(L[0], 'dos', 1), tSem = wt(L[0], 'semana');
  const tUno = wt(L[1], 'uno'), tOtro = wt(L[1], 'otro'), tTra = wt(L[1], 'traileres');
  const tJal = wt(L[2], 'jalisco'), tSin = wt(L[2], 'sinaloa'), tVam = wt(L[2], 'vamos');

  // ---- 1. Dawn raid in a small town
  const T = S.townStreet('dawn');
  const mayor = K.person(T, 'doto', 'alcalde', 0, 0, 0);
  const esc = [K.person(T, 'helios', 'fgr', -0.75, 0, 0), K.person(T, 'mcqueen', 'fgr', 0.75, 0, 0)];
  const back = [K.person(T, 'oguri', 'marino', -2.6, -4.5, 0.3), K.person(T, 'tamamo', 'guardia', 2.4, -5.2, -0.4), K.person(T, 'daiwa', 'fgr', 1.4, -8.5, 0)];
  const cars = [N.patrol('marina'), N.patrol('guardia'), N.suv('#141518')];
  [[-2.4, -9, 0.15], [2.3, -12, -0.1], [-1.6, -17, 0]].forEach(([x, z, r], i) => { cars[i].position.set(x, 0, z); cars[i].rotation.y = r; T.add(cars[i]); });
  // ---- 2. Night highway: a pickup cuts off a tractor-trailer
  const H = NS.highway('nightCity'); H.userData.hemi.intensity = 1.25;
  for (let i = 0; i < 6; i++) { const l = N.streetLight(true, 5); l.position.set(-4.4, 0, 8 - i * 10); l.rotation.y = Math.PI / 2; H.add(l); }
  const truck = P.semi('#b8432f', { night: true }); truck.position.set(1.8, 0, -26); H.add(truck);
  const pk = N.pickup('#16171a', { night: true }); pk.position.set(-1.8, 0, -34); H.add(pk);
  // ---- 3. Puebla's zócalo at dusk
  const Z = S.pueblaZocalo('dusk');

  const sfx = [{ t: 0.0, type: 'sirens', dur: tUno - 0.6, vol: 0.32 }, { t: tDet, type: 'stamp', vol: 0.4 },
    { t: L[1].t0 - 0.4, type: 'engines', dur: L[2].t0 - L[1].t0, vol: 0.5 }, { t: tTra - 0.2, type: 'brakes', vol: 0.45 },
    { t: L[2].t0 - 0.3, type: 'whoosh', vol: 0.4 }, { t: tJal, type: 'tick', vol: 0.35 }, { t: tSin, type: 'tick', vol: 0.35 }, { t: tVam - 0.2, type: 'hit', vol: 0.7 }];

  const tB = L[1].t0 - 0.35, tC = L[2].t0 - 0.3;
  const shots = [
    { t0: 0, set: T, p0: [1.1, 1.05, 4.4], l0: [-0.1, 0.9, -3], p1: [1.0, 1.0, 3.6], l1: [-0.1, 0.9, -3], fov0: 40, act: (t) => {
      const z = -2.4 + t * 0.32;
      mayor.root.position.z = z; K.pose(mayor, A.cuffed(t, 1)); mayor.setFace(C.blinkEye(t, 1), 'frown');
      esc.forEach((e, i) => { e.root.position.z = z + 0.15; K.pose(e, A.escort(t, 2 + i)); e.setFace(C.blinkEye(t, 2 + i), 'neutral'); });
      back.forEach((b, i) => { K.pose(b, { ...C.idle(t, 5 + i, 0.3), gun: 'port' }); b.setFace(C.blinkEye(t, 5 + i), 'neutral'); });
      cars[0].blink(t, 1); cars[1].blink(t + 0.3, 1);
      return U.film(t) + U.badge(t, 'Puebla · septiembre de 2026', 'Operativo Enjambre', 'Dos presidentes municipales detenidos en una semana', tSep - 0.2, tB);
    } },
    { t0: tB, set: H, p0: [-3.4, 1.2, 5.0], l0: [1.0, 1.2, -9], p1: [-3.2, 1.15, 4.2], l1: [1.0, 1.2, -8], fov0: 42, act: (t) => {
      const ku = ss(tB, tTra + 1.4, t), kp = ss(tB, tTra + 0.9, t), sw = ss(tOtro + 0.6, tTra + 0.5, t);
      truck.position.z = -26 + 16 * (1 - (1 - ku) * (1 - ku)); truck.drive(t, 1.4 * (1 - ku));
      pk.position.z = -36 + 34.5 * kp; pk.position.x = -1.8 + 3.6 * sw; pk.rotation.y = 0.5 * Math.sin(Math.PI * sw); pk.drive(t, 2.2 * (1 - kp));
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,10,16,.25)"></div>`
        + U.doc(t, tUno - 0.3, tC, 'Septiembre de 2026', [['Alcalde de Tepeyahualco: investigado por secuestro exprés', tUno - 0.1], ['Alcalde de Esperanza: red de robo de tráileres en la autopista a Veracruz', tOtro - 0.1]], { left: 1150, top: 120, width: 650 });
    } },
    { t0: tC, set: Z, p0: [0, 2.0, 15], l0: [0, 9, -25], p1: [0, 2.4, 11], l1: [0, 10, -25], fov0: 46, act: (t) => {
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,10,16,${0.25 + 0.25 * ss(tVam - 0.6, tVam, t)})"></div>`
        + U.questions(t, tC + 0.1, tVam - 0.1, [['¿Otro Jalisco?', tJal - 0.15], ['¿Otro Sinaloa?', tSin - 0.15]])
        + U.titleCard(t, tVam - 0.2, ctx.dur + 1, 'PUEBLA · 2026', '¿OTRO JALISCO,<br>OTRO SINALOA?', 'Huachicol, robo de carga y municipios infiltrados', 150);
    } },
  ];
  const inst = { scene: T, scenes: [T, H, Z], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
