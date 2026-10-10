import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as LP from '../../lib/props.js';
import * as F from '../../lib/fx.js';
import { ss, clamp } from '../../lib/util.js';
import { badge } from '../../lib/kit.js';
import * as X from '../props.js';
import * as K from '../kit.js';
import * as A from '../anim.js';
import { morelos, interior, mxStage, aimSun } from '../sets.js';
import { runShots, wt } from '../shots.js';
import { film, nameplate, shout, doc } from '../ui.js';

export function build(ctx) {
  const L = ctx.L;
  const tPero = wt(L[0], 'pero') - 0.15, tPoco = wt(L[0], 'poco'), tHac = wt(L[0], 'hacendados'), tComo = wt(L[1], 'como') - 0.2, tPlan = wt(L[1], 'plan'), tTierra = wt(L[2], 'tierra');
  // ---- swearing-in at the palace
  const E = interior({ wall: '#7a2f2a', floor: '#5a3a24', w: 12, d: 9, h: 4.6, lights: [[-2.5, 4.0, 0], [2.5, 4.0, 0]] });
  const dais = LP.at(LP.box(3.2, 0.3, 1.8, '#6b2a22'), 0, 0.15, -3.2); E.add(dais);
  const flagE = X.flag('mx', 3.4, 1.3, 0.8); flagE.position.set(-1.9, 0.3, -3.6); E.add(flagE);
  const madero = K.person(E, 'madero', 'presidente', 0, -3.1, 0); madero.root.position.y = 0.3;
  const officials = [0, 1, 2, 3, 4, 5].map(i => { const sd = i < 3 ? -1 : 1, k = i % 3, x = sd * (2.0 + k * 0.9), z = -2.4 + k * 0.9; return K.person(E, ['doto', 'oguri', 'tamamo', 'helios', 'daiwa', 'suzuka'][i], 'politico', x, z, Math.atan2(-x, -3.1 - z)); });
  // ---- office: Madero and a hacendado
  const O = interior({ wall: '#6a5a44', floor: '#4a3424', w: 8, d: 7, h: 3.8, lights: [[0, 3.2, 0.5]] });
  const desk = X.desk(); desk.position.set(0, 0, -1.2); O.add(desk);
  const chair = X.chair(true); chair.position.set(0, 0, -1.9); O.add(chair);
  const m2 = K.person(O, 'madero', 'presidente', 0, -1.8, 0); m2.root.position.y = 0.11;
  const hac = K.person(O, 'mcqueen', 'politico', 1.25, -1.15, -0.7); K.wearHat(hac, K.sombrero('panama'), { scale: 0.86 });
  const snail = F.bubble('🐌', { font: 130 }); O.add(snail);
  // ---- Morelos: Zapata demands the land back
  const S = morelos('day', { cane: true, seed: 61 });
  const hc = X.hacienda(); hc.position.set(-6, 0, -22); hc.rotation.y = 0.3; S.add(hc);
  for (let i = 0; i < 16; i++) S.add(LP.at(LP.box(0.08, 0.8, 0.08, '#6b4a2f'), -8 + i * 1.0, 0.4, -2.2)); for (const y of [0.35, 0.65]) S.add(LP.at(LP.box(15.2, 0.04, 0.04, '#6b4a2f'), -0.5, y, -2.2));
  const zap = K.person(S, 'zapata', 'zapata', 0.3, 0.2, -0.5);
  const camp = [0, 1, 2, 3, 4].map(i => K.person(S, ['doto', 'helios', 'tamamo', 'cafe', 'suzuka'][i], i % 2 ? 'zapatista' : 'campesino', 1.3 + (i % 3) * 0.95 + Math.floor(i / 3) * 0.45, -0.9 - Math.floor(i / 3) * 0.9 - (i % 3) * 0.15, -0.45));
  // ---- the Plan de Ayala, signed in the mountains
  const Pm = mxStage('day', ['#9aa45e', '#8a9650'], { seed: 62 });
  Pm.add(X.sierra({ z: -60, depth: 40, height: 14, seed: 63, base: '#5f6f4a', top: '#7d8a62' }));
  LP.scatter(Pm, (r, i) => (i % 2 ? LP.pine(1.3 + r() * 0.5, '#3f6b3a', i) : X.mesquite(1.0 + r() * 0.4, i)), 50, [-30, -40, 30, -6], 64);
  const tbl = X.desk(); tbl.position.set(0, 0, -0.4); Pm.add(tbl);
  const zap2 = K.person(Pm, 'zapata', 'zapata', 0, -1.1, 0); zap2.root.position.y = 0.11; K.pose(zap2, { gun: 'back' });
  const stool = LP.at(LP.box(0.5, 0.24, 0.4, '#6b4a2f'), 0, 0.12, -1.15); Pm.add(stool);
  const witnesses = [0, 1, 2, 3].map(i => K.person(Pm, ['doto', 'helios', 'tamamo', 'oguri'][i], 'zapatista', [-2.0, -1.15, 1.15, 2.0][i], [-1.2, -2.1, -2.1, -1.2][i], [0.6, 0.25, -0.25, -0.6][i]));
  // ---- "¡Tierra y libertad!"
  const T = morelos('golden', { cane: true, seed: 65 });
  const ban = X.banner('EJÉRCITO LIBERTADOR\nDEL SUR', { w: 4.0, h: 1.0, size: 70, bg: '#f3ead6', fg: '#2a2320', accent: '#c9a227' }); ban.position.set(0, 3.0, -1.8);
  const zap3 = K.person(T, 'zapata', 'zapata', 0, 0.6, 0);
  const army = [0, 1, 2, 3, 4, 5, 6, 7].map(i => K.person(T, ['doto', 'helios', 'tamamo', 'cafe', 'suzuka', 'daiwa', 'oguri', 'mcqueen'][i], i === 3 ? 'adelita' : 'zapatista', -3.4 + i * 0.95 + (i > 3 ? 0.6 : 0), -0.6 - Math.abs(i - 3.5) * 0.1, 0));

  const sfx = [{ t: 0.3, type: 'cheer', vol: 0.5 }, { t: tPoco - 0.1, type: 'pop' }, { t: tComo + 0.4, type: 'creak', vol: 0.5 }, { t: tPlan, type: 'thud' }, { t: tTierra - 0.1, type: 'cheer', vol: 1.0 }, { t: tTierra + 0.2, type: 'shot', vol: 0.6 }, { t: tTierra + 0.5, type: 'shot', vol: 0.5 }];

  const shots = [
    { t0: 0, set: E, p0: [1.2, 1.2, 2.6], l0: [0, 1.25, -3.1], p1: [0.8, 1.25, 1.5], l1: [0, 1.3, -3.1], fov0: 38, act: (t) => {
      K.pose(madero, A.proud(t, 1)); madero.setFace(C.blinkEye(t, 1), 'smile');
      officials.forEach((c, i) => { K.pose(c, A.clap(t, i)); }); flagE.wave(t * 0.4);
      return film(t) + nameplate(ctx, [0, 1.75, -3.1], 'Francisco I. Madero', 'Presidente de México', 1.0, tPero - 0.2)
        + badge(t, '6 de noviembre de 1911', 'Madero, presidente', 'Gana las elecciones con amplio apoyo', 1.6, tPero - 0.2);
    } },
    { t0: tPero, set: O, p0: [0.9, 1.15, 1.9], l0: [0.4, 0.85, -1.4], p1: [0.7, 1.12, 1.5], l1: [0.4, 0.85, -1.4], fov0: 38, act: (t) => {
      { const p = A.sit(t, 2, 4); p.armL = [-50, -25, -60]; p.armR = [-50, 25, 60]; p.elbL = [0, -40, 0]; p.elbR = [0, 40, 0]; p.head = [4, 8 * Math.sin(t * 0.9), 0]; K.pose(m2, p); }
      m2.setFace(C.blinkEye(t, 2), 'small');
      K.pose(hac, A.proud(t, 3)); hac.setFace(t > tHac ? 'happy' : C.blinkEye(t, 3), t > tHac ? 'grin' : 'smile');
      snail.position.set(-0.75, 0, -1.6); F.popSprite(snail, t, tPoco, tHac + 0.2, 0.42, 1.55);
      return film(t) + nameplate(ctx, [1.25, 1.62, -1.15], 'Los hacendados', 'Conservan sus tierras', tHac - 0.1, tComo + 0.1);
    } },
    { t0: L[1].t0 - 0.25, set: S, p0: [3.4, 1.25, 5.6], l0: [-0.6, 1.0, 0], p1: [2.9, 1.2, 4.8], l1: [-0.8, 1.0, -0.2], fov0: 38, act: (t) => {
      { const p = C.point(t, 3, -10); K.pose(zap, { ...p, gun: 'back' }); } zap.setFace(C.blinkEye(t, 3), C.talkMouth(t, 3));
      camp.forEach((c, i) => { K.pose(c, { ...C.idle(t, c.seed), gun: 'low' }); c.setFace(C.blinkEye(t, c.seed), 'neutral'); });
      aimSun(S, 0, 0);
      return film(t) + nameplate(ctx, [0.3, 1.62, 0.2], 'Emiliano Zapata', '«La tierra es de quien la trabaja»', L[1].t0 + 0.2, tComo)
        + badge(t, 'Morelos', 'Tierras para los pueblos', 'Las haciendas se habían adueñado de las tierras comunales', L[1].t0 + 0.8, tComo);
    } },
    { t0: tComo, set: Pm, p0: [1.1, 1.3, 2.4], l0: [0.1, 0.85, -1.1], p1: [0.95, 1.28, 2.0], l1: [0.1, 0.85, -1.1], fov0: 40, act: (t) => {
      { const p = A.sign(t, 4); p.head = [6, 0, 0]; p.chest = [5, 0, 0]; p.waist = [4, 0, 0]; K.pose(zap2, { ...p, gun: 'back' }); } zap2.setFace(C.blinkEye(t, 4), 'neutral');
      witnesses.forEach((c, i) => { K.pose(c, { ...C.idle(t, c.seed), gun: 'low' }); c.setFace(C.blinkEye(t, c.seed), 'neutral'); });
      aimSun(Pm, 0, 0);
      return film(t) + doc(t, tComo + 0.3, L[2].t0 - 0.05, 'PLAN DE AYALA', [['Desconoce a Madero como presidente.', tComo + 0.8], ['Las tierras quitadas a los pueblos les serán devueltas.', tPlan + 0.1]],
        { left: 80, top: 90, width: 660, foot: 'Morelos · 28 de noviembre de 1911' });
    } },
    { t0: L[2].t0 - 0.1, set: T, p0: [0.6, 1.2, 5.6], l0: [0, 1.45, 0], p1: [0.4, 1.18, 4.8], l1: [0, 1.5, 0], fov0: 40, act: (t) => {
      const on = t > tTierra - 0.15;
      K.pose(zap3, on ? { ...A.fist(t, 5), gun: 'back' } : { ...C.idle(t, 5), gun: 'low' }); zap3.setFace(on ? 'squint' : C.blinkEye(t, 5), on ? 'shout' : 'neutral');
      army.forEach((c, i) => { K.pose(c, on ? { ...C.cheer(t + i * 0.25, i), gun: 'back' } : { ...C.idle(t, c.seed), gun: 'low' }); c.setFace(on ? 'happy' : C.blinkEye(t, c.seed), on ? 'teeth' : 'neutral'); });
      aimSun(T, 0, 2);
      return film(t) + shout(t, '¡Tierra y libertad!', tTierra - 0.05, ctx.dur, 70);
    } },
  ];
  const inst = { scene: E, scenes: [E, O, S, Pm, T], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
