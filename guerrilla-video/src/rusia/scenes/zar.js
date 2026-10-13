import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as A from '../anim.js';
import * as RM from '../rmap.js';
import { leader, NAMES } from '../leaders.js';

export { preload } from '../rmap.js';
const fade = RM.fade;

export function build(ctx) {
  const L = ctx.L;
  const tSiglo = wt(L[0], 'siglo'), tCiento = wt(L[0], 'ciento'), tOcho = wt(L[0], 'ocho'), tCamp = wt(L[0], 'campesinos');
  const tZar = wt(L[1], 'zar'), tNic = wt(L[1], 'nicolas'), tSin = [wt(L[1], 'sin', 0), wt(L[1], 'sin', 1), wt(L[1], 'sin', 2)];
  const tFab = wt(L[2], 'fabricas'), tClan = wt(L[2], 'clandestinidad'), tBol = wt(L[2], 'bolcheviques'), tLen = wt(L[2], 'lenin');

  // ---- 1. Map: the Russian Empire in 1914
  const Mp = RM.russiaMap({ period: 1914 });
  const cap = RM.pulse(Mp, ...RM.CITY['Petrogrado'], '#c0392b', 1.2);
  // ---- 2. A peasant village
  const V = S.village('overcast');
  const peas = [K.person(V, 'tamamo', 'campesino', -1.2, 0.6, 0.4), K.person(V, 'doto', 'campesina', 0.9, 0.2, -0.3), K.person(V, 'oguri', 'campesino', 2.6, -1.4, -0.6), K.person(V, 'suzuka', 'campesina', -2.8, -1.6, 0.6)];
  // ---- 3. The throne hall
  const Th = S.throneHall();
  const tsar = leader(Th, 'nicolas', Th.seat[0], Th.seat[2], 0); tsar.root.position.y = Th.seat[1];
  const officers = [K.person(Th, 'helios', 'oficialZar', -1.7, -4.4, 0.15), K.person(Th, 'daiwa', 'oficialZar', 1.7, -4.4, -0.15), K.person(Th, 'cafe', 'cosaco', -2.8, -2.6, 0.3), K.person(Th, 'oguri', 'cosaco', 2.8, -2.6, -0.3)];
  // ---- 4. The Putilov works
  const F = S.factory('grey', { snow: true });
  const workers = K.crowd(F, ['obrero', 'obrero', 'obrera'], 14, [-3, 0, 3, 7], { seed: 31, yaw: Math.PI });
  workers.forEach(w => w.z0 = w.root.position.z);
  // ---- 5. A clandestine meeting
  const B = S.basement();
  const lenin = leader(B, 'leninBare', 0, -0.98, 0);
  const cell = [K.person(B, 'tamamo', 'obrero', -0.6, -0.5, Math.PI / 2), K.person(B, 'daiwa', 'obrera', 0.6, -0.5, -Math.PI / 2), K.person(B, 'helios', 'obrero', -0.92, -0.95, 0.9), K.person(B, 'doto', 'obrero', 0.92, -1.0, -0.9)];
  cell[0].root.position.y = cell[1].root.position.y = 0.08;

  const tB = tOcho - 0.45, tC = L[1].t0 - 0.3, tD = L[2].t0 - 0.3, tE = tClan - 0.5;
  const sfx = [{ t: 0.3, type: 'whoosh', vol: 0.4 }, { t: tCiento, type: 'pop', vol: 0.45 }, { t: tB, type: 'wind', dur: tC - tB, vol: 0.3 }, { t: tB + 0.1, type: 'birds', dur: tC - tB, vol: 0.2 },
    { t: tC, type: 'bells', dur: 2.5, vol: 0.25 }, ...tSin.map(x => ({ t: x, type: 'thud', vol: 0.45 })),
    { t: tD, type: 'factory', dur: tE - tD + 0.3, vol: 0.45 }, { t: tE, type: 'clock', dur: ctx.dur - tE, vol: 0.25 }, { t: tLen - 0.1, type: 'sting2', vol: 0.4 }];

  const shots = [
    { t0: 0, set: Mp, p0: [5, 46, 24], l0: [5, 0, -6], p1: [2, 38, 18], l1: [2, 0, -6], fov0: 40, act: (t) => {
      Mp.paint(1914); Mp.tintState(1914, 'RUE', '#e8a845', ss(0.3, 1.4, t), 0.55); cap.update(t, tSiglo);
      return U.film(t) + RM.areaLabel(ctx, 92, 62, 'IMPERIO RUSO', fade(t, 0.6, tB + 1), 'big')
        + RM.city(ctx, Mp, 'Petrogrado', fade(t, tSiglo - 0.2, tB + 1), 'c', 'San Petersburgo (capital)')
        + U.counter(t, tCiento - 0.25, tB, 110, 640, 125, 'millones de habitantes', { from: 40, dur: 1.4, color: '#ffcf6a', w: 520 })
        + U.source(t, tCiento + 0.8, tB, 'Censo de 1897: 125,6 millones');
    } },
    { t0: tB, set: V, p0: [2.4, 1.15, 5.4], l0: [-0.2, 0.75, -3], p1: [1.8, 1.05, 4.4], l1: [-0.2, 0.75, -3], fov0: 42, act: (t) => {
      V.tick(t);
      peas.forEach((p, i) => { K.pose(p, i % 2 ? A.work(t, i) : C.idle(t, i)); p.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.ofTen(t, tOcho - 0.3, tC, 8, 'eran campesinos', { y: 120 });
    } },
    { t0: tC, set: Th, p0: [0, 1.0, 5.0], l0: [0, 1.0, -6], p1: [0, 0.95, 2.8], l1: [0, 1.0, -6], fov0: 40, act: (t) => {
      K.pose(tsar, A.sit(t, 1, -2)); tsar.setFace(C.blinkEye(t, 1), 'neutral');
      officers.forEach((o, i) => { K.pose(o, i < 2 ? C.idle(t, i, 0.3) : A.guard(t, i)); o.setFace(C.blinkEye(t, i + 2), 'neutral'); });
      return U.film(t) + U.nameplate(ctx, [0, Th.seat[1] + 1.1, Th.seat[2]], NAMES.nicolas[0], 'Zar de Rusia desde 1894', tNic - 0.2, tSin[0] - 0.2)
        + U.nolist(t, tSin[0] - 0.35, tD, 'Poder absoluto del zar', [['Sin constitución', tSin[0]], ['Sin parlamento', tSin[1]], ['Sin elecciones', tSin[2]]], { x: 1180, y: 200, w: 600 });
    } },
    { t0: tD, set: F, p0: [3.4, 1.35, 9.5], l0: [0, 2.6, -14], p1: [2.8, 1.25, 8.0], l1: [0, 2.8, -14], fov0: 44, act: (t) => {
      F.tick(t); const u = t - tD;
      workers.forEach((w, i) => { w.root.position.z = w.z0 - u * 0.7; K.pose(w, C.walk(t, 0.5, i)); w.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.badge(t, 'San Petersburgo · fábrica Putílov', 'Fábricas enormes', '12.000 obreros ya en 1905', tFab - 0.2, tE);
    } },
    { t0: tE, set: B, p0: [0.25, 1.05, 2.0], l0: [0, 0.52, -0.7], p1: [0.15, 0.95, 1.55], l1: [0, 0.55, -0.75], fov0: 40, act: (t) => {
      K.pose(lenin, A.talk(t, 2)); lenin.setFace(C.blinkEye(t, 2), C.talkMouth(t, 2));
      cell.forEach((c, i) => { K.pose(c, i < 2 ? A.sit(t, i) : C.idle(t, i, 0.4)); c.setFace(C.blinkEye(t, i + 3), 'neutral'); });
      return U.film(t) + U.tag(ctx, [-0.24, B.table.top + 0.12, -0.56], 'ИСКРА', 'La Chispa, periódico de Lenin', fade(t, tClan + 0.3, tLen - 0.3))
        + U.nameplate(ctx, [0, 1.12, -0.98], NAMES.lenin[0], 'Líder de los bolcheviques', tLen - 0.15, ctx.dur + 1)
        + U.source(t, tBol, ctx.dur + 1, '1903: el partido se divide en bolcheviques y mencheviques');
    } },
  ];
  const inst = { scene: Mp, scenes: [Mp, V, Th, F, B], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
