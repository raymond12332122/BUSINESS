import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as N from '../props.js';
import { runShots, wt } from '../../mx/shots.js';
import * as U from '../ui.js';
import * as M from '../mapkit.js';

export { preload } from '../mapkit.js';

export function build(ctx) {
  const L = ctx.L;
  const tNeg = wt(L[0], 'negocio'), tCol = wt(L[0], 'colombia'), tMex = wt(L[0], 'mexico'), tUS = wt(L[0], 'estados'), tMayor = wt(L[0], 'mayor');
  const tGdl = wt(L[1], 'guadalajara'), tPol = wt(L[1], 'policias'), tPag = wt(L[1], 'pagaban');
  const t85 = wt(L[2], 'mil'), tCam = wt(L[2], 'camarena'), tDesc = wt(L[2], 'descubrio'), tFed = wt(L[2], 'federales');

  // ---- 1. The cocaine route (1980s)
  const A = M.americasNow();
  const RED = '#c0392b';
  const routes = [
    [[-74.8, 10.9], [-80, 13.5], [-85.5, 16.8], [-89.6, 19.5], [-94.5, 22.4], [-97.6, 26.1], [-95.4, 29.8], [-90.5, 36], [-87.6, 41.6]],
    [[-77.1, 3.9], [-83, 5.5], [-91.5, 11.8], [-97, 15.6], [-103.4, 19.3], [-107.4, 24.6], [-110.9, 31.2], [-118.1, 34.0]],
  ].map((p, i) => { const a = M.aarrow(p, RED, 0.75); a.d = i * 0.3; A.add(a); return a; });
  // ---- 2. 1980s: capos pay off police and politicians
  const O = S.office80(); O.userData.sun.intensity = 2.0; O.userData.hemi.intensity = 1.25;
  const capo = K.person(O, 'tamamo', 'narco80', 0.15, -1.4, 0.35);
  const capo2 = K.person(O, 'daiwa', 'narco80', -1.1, -1.55, 0.25);
  const cop = K.person(O, 'helios', 'police80', 0.55, 0.15, Math.PI - 0.35);
  const pol = K.person(O, 'doto', 'official', -0.75, 0.35, Math.PI + 0.3);
  K.hold(capo, N.envelope(), 'R', [0.02, -0.03, 0.06], [0, 0, 0]);
  K.hold(cop, N.envelope(), 'R', [0.02, -0.03, 0.06], [0, 0, 0]);
  // ---- 3. 1985: the murder of DEA agent Enrique Camarena
  const D = S.newsDesk();

  const sfx = [{ t: 0.2, type: 'whoosh', vol: 0.5 }, { t: tCol, type: 'swoosh', vol: 0.4 }, { t: tMayor, type: 'pop', vol: 0.4 },
    { t: L[1].t0 - 0.3, type: 'cash', vol: 0.5 }, { t: tPag, type: 'cash', vol: 0.45 },
    { t: L[2].t0 - 0.3, type: 'typewriter', dur: 2.2, vol: 0.4 }, { t: tCam - 0.2, type: 'paper', vol: 0.6 }, { t: tFed, type: 'sting', vol: 0.5 }];

  const tB = L[1].t0 - 0.3, tC = L[2].t0 - 0.3;
  const shots = [
    { t0: 0, set: A, p0: [-1.5, 44, 17], l0: [-1.5, 0, -3.5], p1: [-1.5, 40, 15], l1: [-1.5, 0, -3.5], fov0: 38, act: (t) => {
      routes.forEach(a => a.set(clamp((t - tCol + 0.2 - a.d) / 3.0)));
      const us = A.countries.USA, k = ss(tMayor - 0.2, tMayor + 0.4, t);
      us.mat.color.set(us.base).lerp(new THREE.Color('#e8a07a'), 0.75 * k * (0.85 + 0.15 * Math.sin(t * 5)));
      return U.film(t) + U.badge(t, 'Años 80', 'La ruta de la cocaína', 'De Colombia a Estados Unidos, pasando por México', tNeg, tB)
        + M.alabel(ctx, -74.5, 4.5, 'COLOMBIA', U_fade(t, tCol - 0.3, tB), 'big') + M.alabel(ctx, -102.5, 23.5, 'MÉXICO', U_fade(t, tMex - 0.3, tB), 'big')
        + M.alabel(ctx, -98, 39, 'ESTADOS UNIDOS', U_fade(t, tUS - 0.3, tB), 'big')
        + U.source(t, tMayor, tB, 'Rutas simplificadas');
    } },
    { t0: tB, set: O, p0: [4.3, 1.65, 0.6], l0: [-0.25, 0.75, -0.6], p1: [3.8, 1.55, 0.35], l1: [-0.25, 0.77, -0.6], fov0: 42, act: (t) => {
      K.pose(capo, C.offer(t, 1, 0.8)); capo.setFace(C.blinkEye(t, 1), (t > tPag ? 'smile' : 'neutral'));
      K.pose(capo2, { ...C.idle(t, 2, 0.5), head: [0, -12, 0] }); capo2.setFace(C.blinkEye(t, 2), 'smile');
      K.pose(cop, C.offer(t, 3, 0.7)); cop.setFace(C.blinkEye(t, 3), 'smile');
      K.pose(pol, { ...C.idle(t, 4, 0.5) }); pol.setFace(C.blinkEye(t, 4), 'smile');
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(80,50,20,.12)"></div>` + U.badge(t, 'Guadalajara · años 80', 'Cártel de Guadalajara', 'Crecía con la protección de policías y políticos', tGdl - 0.2, tC);
    } },
    { t0: tC, set: D, p0: [0.25, 1.95, 1.25], l0: [0.05, 0.62, -0.45], p1: [0.2, 1.75, 0.95], l1: [0.05, 0.62, -0.45], fov0: 40, act: (t) => {
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(60,40,20,.18)"></div>`
        + U.newspaper(t, tCam - 0.4, tDesc - 0.1, { mast: 'EL DIARIO', date: 'Marzo de 1985', head: 'Asesinan a agente de la DEA', sub: 'Enrique Camarena había sido secuestrado en Guadalajara' })
        + U.doc(t, tDesc - 0.1, ctx.dur, 'La investigación reveló…', [['Policías federales protegían a los capos', tFed - 0.2], ['Un comandante dejó escapar a uno de ellos', tFed + 0.6]], { left: 1120, top: 150, width: 640 });
    } },
  ];
  const inst = { scene: A, scenes: [A, O, D], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
const U_fade = (t, a, b) => ss(a, a + 0.35, t) * (1 - ss(b - 0.35, b, t));
