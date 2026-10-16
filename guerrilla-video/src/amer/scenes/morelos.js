import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as LP from '../../lib/props.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as A from '../anim.js';
import * as P from '../props.js';
import * as RP from '../../rusia/props.js';
import { fade } from '../amap.js';

export { preload } from '../amap.js';
const CARD = (t, who, a, b, o = {}) => U.cast(t, a, b, ...K.CARD[who], o);

export function build(ctx) {
  const L = ctx.L;
  const tMor = wt(L[0], 'morelos'), tEst = wt(L[0], 'estafeta'), tChi = wt(L[0], 'chilpancingo'), tSen = wt(L[0], 'sentimientos'), tInd = wt(L[0], 'independencia'), tIgu = wt(L[0], 'igualdad'), tFin = wt(L[0], 'fin');
  const tFus = wt(L[1], 'fusilado'), tPer = wt(L[1], 'pero'), tLeo = wt(L[1], 'leona'), tEsp = wt(L[1], 'espiaron'), tMon = wt(L[1], 'montanas'), tGue = wt(L[1], 'vicente'), tRin = wt(L[1], 'rindio');
  const tB = tChi - 0.3, tC = L[1].t0 - 0.3, tD = tPer - 0.3, tE = tMon - 0.3;

  // ---- Morelos and his army in the south
  const Sr = S.sierra('golden', { seed: 811 });
  const mor = K.role(Sr, 'morelos', 0, 0.4, 0.15);
  const taco = new THREE.Mesh(new THREE.CircleGeometry(0.07, 14, 0, Math.PI), new THREE.MeshStandardMaterial({ color: '#e8c47a', side: THREE.DoubleSide })); K.hold(mor, taco, 'R', [0, 0.02, 0.05], [0, 90, 0]);
  const ins = K.crowd(Sr, ['insurgenteF', 'insurgente', 'insurgenteF'], 12, [-4.6, -4.2, 4.6, -1.4], { seed: 81, yaw: 0 });
  // ---- the Congress of Anáhuac, Chilpancingo, 14 Sep 1813
  const Cg = S.hall({ wall: '#d9b88a', cloth: '#2f5a3a', floor: '#6a4a30' });
  const mor2 = K.role(Cg, 'morelos', 0, -1.0, 0);
  const dip = [[-2.3, -1.2, 0.9], [-1.5, -0.5, 0.7], [1.5, -0.5, -0.7], [2.3, -1.2, -0.9]].map(([x, z, y], i) => K.person(Cg, ['spe', 'helios', 'hishi', 'doto'][i], 'criollo', x, z, y));
  // ---- Leona Vicario's letters
  const Lv = S.hall({ wall: '#4a3a4a', cloth: '#3a2a30', floor: '#3a2a20', night: true, w: 8, d: 7 });
  Lv.table.position.set(0, 0, -1.6); const lamp = RP.keroseneLamp(true, 0.8); lamp.position.set(0.5, 0.82, -1.6); Lv.add(lamp);
  const papers = RP.papers(6, 3, 0.6); papers.position.set(-0.3, 0.83, -1.55); Lv.add(papers);
  const leo = K.role(Lv, 'leona', -0.5, -0.9, 0.25); const chair = RP.chairR('#4a3020', '#5a2a3a', 0.42); chair.position.set(0.9, 0, -0.8); chair.rotation.y = -0.6; Lv.add(chair);
  K.hold(leo, K.quill(), 'R', [0, 0.02, 0.03], [20, 0, 0]);
  // ---- Guerrero in the southern sierra
  const Gs = S.sierra('dusk', { seed: 821, height: 1.2 });
  const gue = K.role(Gs, 'guerrero', 0, 0.2, -0.2);
  const gue2 = K.crowd(Gs, ['insurgenteF', 'insurgente'], 9, [-4.2, -3.6, 4.2, -1.2], { seed: 82, yaw: 0 });

  const sfx = [{ t: 0.2, type: 'march', dur: tB - 0.2, vol: 0.25 }, { t: tB, type: 'crowd', dur: tC - tB, vol: 0.2 }, ...[tInd, tIgu, tFin].map(x => ({ t: x, type: 'tick', vol: 0.35 })),
    { t: tC, type: 'drum', dur: 1.6, vol: 0.3 }, { t: tD, type: 'quill', dur: 2.0, vol: 0.35 }, { t: tD + 0.3, type: 'night', dur: tE - tD, vol: 0.25 }, { t: tE, type: 'wind', dur: ctx.dur - tE, vol: 0.3 }];

  const shots = [
    { t0: 0, set: Sr, p0: [0.8, 1.3, 3.6], l0: [0, 0.85, -0.4], p1: [0.6, 1.25, 3.0], l1: [0, 0.85, -0.4], fov0: 42, act: (t) => {
      K.pose(mor, A.sip(t, 1, 0.5 + 0.5 * Math.sin(t * 2))); mor.setFace(C.blinkEye(t, 1), 'cat'); ins.forEach((c, i) => K.pose(c, A.guard(t, i)));
      return U.film(t) + CARD(t, 'morelos', tMor - 0.3, tB + 0.1, { side: 'l' }) + U.bubble(ctx, [0, 1.5, 0.4], 'Primero a comer… luego, a pelear', fade(t, tEst - 0.4, tB), { size: 24 });
    } },
    { t0: tB, set: Cg, p0: [0, 1.4, 3.4], l0: [0, 0.95, -1.0], p1: [0, 1.35, 2.8], l1: [0, 0.95, -1.0], fov0: 42, act: (t) => {
      K.pose(mor2, A.orate(t, 1)); mor2.setFace(C.blinkEye(t, 1), C.talkMouth(t, 1)); dip.forEach((c, i) => { K.pose(c, i % 2 ? A.clap(t, i) : C.idle(t, i)); c.setFace(C.blinkEye(t, i), 'smile'); });
      return U.film(t) + U.doc(t, tSen - 0.4, tC + 0.2, 'Sentimientos de la Nación', [['Independencia de España', tInd - 0.2], ['Igualdad: fin de las castas', tIgu - 0.2], ['Fin de la esclavitud', tFin - 0.2]], { left: 1220, top: 110, width: 600, foot: 'Chilpancingo, 14 de septiembre de 1813' });
    } },
    { t0: tC, set: Cg, p0: [0, 1.3, 2.4], l0: [0, 1.0, -1.0], p1: [0, 1.28, 2.2], l1: [0, 1.0, -1.0], fov0: 40, act: (t) => {
      K.pose(mor2, A.proud(t, 1)); mor2.setFace('closed', 'neutral'); dip.forEach((c, i) => { K.pose(c, A.sad(t, i)); c.setFace('flat', 'frown'); });
      return U.film(t) + U.tint('#6a6a7a', 0.55) + U.card(t, tC + 0.2, tD + 0.2, '22 DE DICIEMBRE DE 1815', 'Morelos es fusilado', 'San Cristóbal Ecatepec', { left: 1240, top: 140, width: 560, accent: '#7a7a8a' });
    } },
    { t0: tD, set: Lv, p0: [0.6, 1.25, 1.6], l0: [-0.1, 0.9, -1.4], p1: [0.45, 1.22, 1.3], l1: [-0.1, 0.9, -1.4], fov0: 42, act: (t) => {
      const look = ss(tEsp, tEsp + 0.4, t) * (1 - ss(tEsp + 1.6, tEsp + 2.0, t));
      const p = A.present(t, 2); p.head = [16 - 10 * look, 50 * look, 0]; K.pose(leo, p); leo.setFace(C.blinkEye(t, 2), 'neutral');
      return U.film(t) + CARD(t, 'leona', tLeo - 0.4, tE + 0.2, { side: 'l' }) + U.bubble(ctx, [0.9, 1.05, -0.8], '…', fade(t, tEsp, tEsp + 1.8), { size: 30 })
        + U.source(t, tEsp + 0.4, tE + 0.2, 'Espía y correo de la sociedad secreta Los Guadalupes');
    } },
    { t0: tE, set: Gs, p0: [0.8, 1.6, 3.8], l0: [0, 1.15, -0.4], p1: [0.6, 1.55, 3.2], l1: [0, 1.15, -0.4], fov0: 42, act: (t) => {
      K.pose(gue, t > tRin - 0.3 ? A.fist(t, 1) : A.humble(t, 1)); gue.setFace(C.blinkEye(t, 1, t > tRin - 0.3 ? 'open' : 'dizzy'), t > tRin - 0.3 ? 'shout' : 'wavy');
      gue2.forEach((c, i) => K.pose(c, A.guard(t, i)));
      return U.film(t) + CARD(t, 'guerrero', tGue - 0.4, ctx.dur + 1, { side: 'l' }) + U.bubble(ctx, [0, 1.75, 0.2], '¡Perdón, perdón!… pero no me rindo', fade(t, tRin - 0.6, ctx.dur + 1), { size: 24 });
    } },
  ];
  const inst = { scene: Sr, scenes: [Sr, Cg, Lv, Gs], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
