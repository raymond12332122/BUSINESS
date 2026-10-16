import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as LP from '../../lib/props.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as A from '../anim.js';
import * as AM from '../amap.js';
import * as P from '../props.js';
import * as N from '../../napo/props.js';
import * as NS from '../../napo/sets.js';
import * as RP from '../../rusia/props.js';

export { preload } from '../amap.js';
const fade = AM.fade;
const CARD = (t, who, a, b, o = {}) => U.cast(t, a, b, ...K.CARD[who], o);

export function build(ctx) {
  const L = ctx.L;
  const tNap = wt(L[0], 'napoleon'), tInv = wt(L[0], 'invadio'), tObl = wt(L[0], 'obligo'), tBay = wt(L[0], 'bayona'), tPus = wt(L[0], 'puso'), tJos = wt(L[0], 'jose');
  const tPre = wt(L[1], 'preso'), tQui = wt(L[1], 'quien'), tCiu = wt(L[1], 'ciudades'), tJun = wt(L[1], 'juntas'), tFer = wt(L[1], 'fernando');
  const tCar = wt(L[2], 'caracas'), tBue = wt(L[2], 'buenos'), tBog = wt(L[2], 'bogota'), tSan = wt(L[2], 'santiago'), tLea = wt(L[2], 'lealtad'), tTer = wt(L[2], 'termino');
  const tB = tObl - 0.3, tC = L[1].t0 - 0.3, tD = L[2].t0 - 0.3;

  // ---- 1808: the French in Spain
  const Sp = NS.sierraPass();
  const nap = K.role(Sp, 'napoleon', 0.2, 0.6, -0.2);
  const fr = K.crowd(Sp, 'frances1802', 10, [-4.6, -3.2, 3.6, -0.8], { seed: 61, yaw: -0.3 });
  const tri = P.banner('fra', { h: 3, w: 1.3, fh: 0.85 }); tri.position.set(-1.4, 0, -0.4); Sp.add(tri);
  // ---- Bayonne: the crown changes heads
  const Ba = S.palaceES();
  const nap2 = K.role(Ba, 'napoleon', 0, -1.2, 0), fer = K.role(Ba, 'fernando', -1.25, -0.8, 0.5), jos = K.role(Ba, 'jose', 1.25, -0.8, -0.5);
  // ---- a cabildo: who rules now?
  const Ca = S.hall({ wall: '#e8dcc0', cloth: '#8a1f2a', floor: '#7a5a3a' });
  const port = RP.picture(1.0, 1.25, (x, W, H) => { x.fillStyle = '#3a2a2a'; x.fillRect(0, 0, W, H); x.fillStyle = '#e8c08a'; x.beginPath(); x.ellipse(W / 2, H * 0.42, W * 0.2, H * 0.17, 0, 0, 7); x.fill();
    x.fillStyle = '#8a1f2a'; x.fillRect(W * 0.25, H * 0.62, W * 0.5, H * 0.38); x.fillStyle = '#d4af37'; x.fillRect(W * 0.35, H * 0.2, W * 0.3, H * 0.06); x.font = `900 ${W * 0.09}px Georgia`; x.textAlign = 'center'; x.fillText('FERNANDO VII', W / 2, H * 0.95); });
  port.position.set(0, 2.9, -4.45); Ca.add(port);
  const vec = [['cafe', -1.6, -1.2, 0.4], ['helios', -0.6, -1.0, 0.1], ['spe', 0.5, -1.0, -0.1], ['hishi', 1.6, -1.2, -0.4], ['doto', -2.4, 0.2, 0.7], ['oguri', 2.4, 0.2, -0.7]]
    .map(([w, x, z, y], i) => K.person(Ca, w, i % 2 ? 'criollo' : 'dama', x, z, y));
  // ---- map: the juntas
  const Mp = AM.americasMap({ period: 1810 });
  const J = [['Quito', -78.47, -0.18, '10 ago. 1809', tCar - 0.9], ['Caracas', -66.9, 10.48, '19 abr. 1810', tCar], ['Buenos Aires', -58.38, -34.6, '25 may. 1810', tBue], ['Bogotá', -74.07, 4.71, '20 jul. 1810', tBog], ['Santiago', -70.65, -33.45, '18 sept. 1810', tSan]];
  const pulses = J.map(([n, lo, la]) => AM.pulse(Mp, lo, la, '#c0392b', 2.2));
  const [sx, , sz] = AM.apos(-66, -14);

  const sfx = [{ t: 0.2, type: 'march', dur: tB - 0.2, vol: 0.3 }, { t: tNap, type: 'fanfare', vol: 0.3 }, { t: tB, type: 'harpsichord', dur: tC - tB, vol: 0.2 }, { t: tPus, type: 'pop', vol: 0.35 },
    { t: tC, type: 'crowd', dur: tD - tC, vol: 0.22 }, { t: tQui, type: 'sting2', vol: 0.3 }, { t: tD, type: 'whoosh', vol: 0.3 }, ...J.map(j => ({ t: j[4], type: 'bell', vol: 0.28 })), { t: tTer, type: 'drum', dur: 1.4, vol: 0.3 }];

  const shots = [
    { t0: 0, set: Sp, p0: [1.6, 1.4, 4.0], l0: [-0.2, 1.0, -1.0], p1: [1.2, 1.35, 3.4], l1: [-0.2, 1.0, -1.0], fov0: 44, act: (t) => {
      tri.wave(t); K.pose(nap, C.point(t, 1, -20)); nap.setFace(C.blinkEye(t, 1), 'grin'); fr.forEach((c, i) => K.pose(c, A.guard(t, i)));
      return U.film(t) + CARD(t, 'napoleon', 0.6, tB + 0.1, { side: 'l' }) + U.badge(t, '1808', 'Napoleón invade España', 'Entró como aliado rumbo a Portugal… y se quedó', tInv - 0.3, tB + 0.1);
    } },
    { t0: tB, set: Ba, p0: [0, 1.4, 3.6], l0: [0, 0.9, -1.0], p1: [0, 1.35, 3.0], l1: [0, 0.9, -1.0], fov0: 44, act: (t) => {
      const k = ss(tPus - 0.2, tJos + 0.2, t);
      K.pose(nap2, C.point(t, 2, 30 * (1 - 2 * k))); nap2.setFace(C.blinkEye(t, 2), 'smile');
      K.pose(fer, k > 0.5 ? A.slump(t, 3) : A.humble(t, 3)); fer.setFace(C.blinkEye(t, 3, 'flat'), 'frown'); fer.hat.visible = k < 0.5;
      K.pose(jos, A.proud(t, 4)); jos.setFace(C.blinkEye(t, 4), 'neutral'); jos.hat.visible = k > 0.5;
      return U.film(t) + U.badge(t, 'Bayona, mayo de 1808', 'Las abdicaciones', 'Fernando VII y Carlos IV ceden la corona', tB + 0.2, tC + 0.1)
        + U.pin(ctx, [-1.25, 1.35, -0.8], 'Fernando VII', '', fade(t, tBay - 0.2, tC + 0.2), '#c0392b') + U.pin(ctx, [1.25, 1.35, -0.8], 'José Bonaparte', 'rey de España', fade(t, tJos - 0.2, tC + 0.2), '#2a4fa0')
        + CARD(t, 'fernando', tBay - 0.3, tC + 0.2, { side: 'r', top: 300, w: 560 }) + U.bubble(ctx, [-1.25, 1.55, -0.8], '¿Otra vez pierdo un imperio?', fade(t, tJos, tC - 0.1), { size: 24 });
    } },
    { t0: tC, set: Ca, p0: [0, 1.6, 4.2], l0: [0, 1.5, -2.2], p1: [0, 1.5, 3.4], l1: [0, 1.4, -2.2], fov0: 46, act: (t) => {
      vec.forEach((c, i) => { K.pose(c, i % 3 === 1 ? A.talk(t, i) : i % 3 === 2 ? A.fist(t, i) : C.idle(t, i)); c.setFace(C.blinkEye(t, i), i % 2 ? 'open' : 'neutral'); });
      return U.film(t) + U.big(t, tQui - 0.3, tCiu, '¿Quién manda?', { top: 120, size: 80 })
        + U.card(t, tJun - 0.2, tD + 0.2, 'JUNTAS DE GOBIERNO', 'En nombre de Fernando VII', 'Con el rey preso, la soberanía «regresaba al pueblo»', { left: 1200, top: 130, width: 620, accent: '#c0392b' });
    } },
    { t0: tD, set: Mp, p0: [sx, 175, sz + 62], l0: [sx, 0, sz - 4], p1: [sx, 165, sz + 56], l1: [sx, 0, sz - 4], fov0: 40, act: (t) => {
      Mp.paint(1810); Mp.zoom(2.0);
      pulses.forEach((p, i) => p.update(t, J[i][4] - 0.1));
      return U.film(t) + J.map(([n, lo, la, d, ta]) => AM.chip(ctx, lo, la, fade(t, ta - 0.1, ctx.dur + 1), n, d, '#c0392b', 1.5)).join('')
        + U.steps(t, tLea - 0.4, ctx.dur + 1, 'De la lealtad a la ruptura', [['Lealtad al rey', tLea - 0.3], ['Autonomía', tLea + 0.5], ['Independencia', tTer + 0.3]], { x: 1180, y: 560, w: 640 });
    } },
  ];
  const inst = { scene: Sp, scenes: [Sp, Ba, Ca, Mp], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
