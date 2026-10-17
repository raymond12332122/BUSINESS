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
import * as RP from '../../rusia/props.js';
import * as N from '../../napo/kit.js';
import { horse, animateHorse, ridePose, seat } from '../../napo/horse.js';

export { preload } from '../amap.js';
const fade = AM.fade;
const CARD = (t, who, a, b, o = {}) => U.cast(t, a, b, ...K.CARD[who], o);

export function build(ctx) {
  const L = ctx.L;
  const tUlt = wt(L[0], 'ultimo'), tPer = wt(L[0], 'peru'), tMil = wt(L[0], 'mil'), tJun = wt(L[0], 'junin'), tCab = wt(L[0], 'caballeria'), tSin = wt(L[0], 'sin'), tDis = wt(L[0], 'disparo');
  const tNue = wt(L[1], 'nueve'), tAya = wt(L[1], 'ayacucho'), tSuc = wt(L[1], 'antonio'), tDer = wt(L[1], 'derroto'), tCap = wt(L[1], 'capturo'), tVir = wt(L[1], 'virrey'), tFin = wt(L[1], 'fin');
  const tAlt = wt(L[2], 'alto'), tNom = wt(L[2], 'nombre'), tLib = wt(L[2], 'libertador'), tBol = wt(L[2], 'bolivia');
  const tB = tMil - 0.3, tC = L[1].t0 - 0.3, tD = tFin - 0.3, tE = L[2].t0 - 0.3;

  const Mp = AM.americasMap({ period: 1810 });
  const [px, , pz] = AM.apos(-68, -14);
  const ROY = ['per', 'tara', 'bol', 'ataca'], PAT = ['col', 'ven', 'ecu', 'pan', 'chl', 'arg', 'pry'];
  // ---- Junín, 6 Aug 1824: lances and sabres only
  const Jn = S.sierra('day', { ground: ['#9aa06a', '#8a9060'], height: 1.6, pines: false, seed: 1211 });
  Jn.add(LP.strip([[-60, -14], [0, -16], [60, -15]], 6, '#6a9ab8', 0.02));
  const riders = [...Array(6)].map((_, i) => { const H = horse({ coat: ['#5a3a26', '#8a6a4a', '#3a2a20'][i % 3], mane: '#1d1612', cloth: '#2a3f8f', seed: i }); H.position.set(-6 + (i % 3) * 1.6, 0, -3.2 - Math.floor(i / 3) * 1.4); H.rotation.y = Math.PI / 2; H.userData.dynamic = true; Jn.add(H);
    const r = K.person(Jn, ['oguri', 'tamamo', 'helios', 'spe', 'doto', 'hishi'][i], 'llanero', 0, 0, 0); K.blobShadow(r); return [H, r]; });
  const bol = K.role(Jn, 'bolivar', 0.9, 1.2, -0.4), suc = K.role(Jn, 'sucre', -0.5, 1.4, 0.3);
  // ---- Ayacucho, 9 Dec 1824
  const Ay = S.sierra('day', { ground: ['#8a9a5a', '#7a8a50'], height: 1.5, seed: 1221 });
  const suc2 = K.role(Ay, 'sucre', -1.0, 0.6, 0.5), vir = K.role(Ay, 'virrey', 0.9, 0.3, -0.8);
  const pats = K.crowd(Ay, ['patriota', 'llanero', 'granadero'], 9, [-5, -3.8, -1.2, -1.0], { seed: 122, yaw: 0.5 });
  const roys = K.crowd(Ay, 'realista', 8, [1.6, -4.2, 5.2, -1.6], { seed: 123, yaw: -0.5 });
  const fP = P.banner('peru', { h: 3, w: 1.3, fh: 0.85 }); fP.position.set(-2.6, 0, -0.4); Ay.add(fP);

  const sfx = [{ t: 0.2, type: 'whoosh', vol: 0.3 }, { t: tPer, type: 'pop', vol: 0.3 }, { t: tB, type: 'hooves', dur: tC - tB, vol: 0.45 }, { t: tCab, type: 'charge', vol: 0.4 }, { t: tDis + 0.3, type: 'laugh', vol: 0.25 },
    { t: tC, type: 'drum', dur: 1.4, vol: 0.3 }, { t: tC + 0.6, type: 'volley', vol: 0.4 }, { t: tDer, type: 'charge', vol: 0.35 }, { t: tVir, type: 'sting2', vol: 0.35 }, { t: tD, type: 'swell', dur: 3, vol: 0.3 }, { t: tBol, type: 'fanfare', vol: 0.35 }];

  const shots = [
    { t0: 0, set: Mp, p0: [px, 120, pz + 46], l0: [px, 0, pz], p1: [px, 108, pz + 40], l1: [px, 0, pz], fov0: 40, act: (t) => {
      Mp.paint(1810); Mp.zoom(1.5); const k = ss(tUlt - 0.2, tPer + 0.3, t);
      ROY.forEach(g => Mp.tint(g, '#c0392b', k, 0.85)); PAT.forEach(g => Mp.tint(g, '#2f6fb0', k, 0.8));
      return U.film(t) + AM.areaLabel(ctx, -75, -10, 'REALISTAS', fade(t, tPer - 0.2, tB + 0.3), 'st', 26) + U.legend(t, tUlt, tB + 0.2, '1824', [['#2f6fb0', 'Patriotas'], ['#c0392b', 'Realistas']], { x: 90, y: 150, w: 360 });
    } },
    { t0: tB, set: Jn, p0: [3.6, 1.5, 5.4], l0: [-1.0, 1.0, -2.6], p1: [3.0, 1.45, 4.8], l1: [-0.4, 1.0, -2.6], fov0: 44, act: (t) => {
      const u = t - tB;
      riders.forEach(([H, r], i) => { H.position.x = -11 + ((u * 2.4 + i * 3.4) % 20); animateHorse(H, t, 'gallop', { seed: i }); const p = ridePose(t, i, 1); p.armR = [-30, 0, -20]; p.elbR = [0, 0, -20]; K.pose(r, p); seat(r, H); });
      K.pose(bol, t > tDis - 0.2 ? A.proud(t, 1) : C.idle(t, 1)); bol.setFace(C.blinkEye(t, 1), t > tDis ? 'grin' : 'neutral');
      K.pose(suc, t > tDis + 0.6 ? A.facepalm(t, 2) : C.idle(t, 2)); suc.setFace(t > tDis + 0.6 ? 'flat' : C.blinkEye(t, 2), t > tDis + 0.6 ? 'wavy' : 'smile');
      return U.film(t) + U.badge(t, '6 de agosto de 1824', 'Junín', '45 minutos, solo lanzas y sables', tJun - 0.3, tC + 0.1)
        + U.bubble(ctx, [0.9, 1.7, 1.2], '¿Sin disparos? ¡Qué disparate!', fade(t, tDis - 0.1, tC), { size: 24 });
    } },
    { t0: tC, set: Ay, p0: [-0.2, 1.5, 4.4], l0: [0, 1.0, -0.4], p1: [-0.2, 1.45, 3.7], l1: [0, 1.0, -0.4], fov0: 44, act: (t) => {
      fP.wave(t); const sur = ss(tCap - 0.3, tCap + 0.3, t);
      K.pose(suc2, A.swordUp(t, 1, 1 - 0.6 * sur)); suc2.setFace(C.blinkEye(t, 1), 'grin');
      K.pose(vir, sur > 0.5 ? A.kneel(t, 2) : C.idle(t, 2)); vir.setFace(C.blinkEye(t, 2, sur > 0.5 ? 'flat' : 'open'), 'frown');
      pats.forEach((c, i) => K.pose(c, sur > 0.5 ? C.cheer(t, i) : A.guard(t, i))); roys.forEach((c, i) => { K.pose(c, sur > 0.5 ? A.kneel(t, i + 9) : A.guard(t, i + 9)); c.setFace(C.blinkEye(t, i + 9), 'frown'); });
      return U.film(t) + U.datePage(t, tC + 0.2, tD + 0.2, 'Batalla de Ayacucho', 'DIC.', '9', '1824', { x: 1640, y: 90, accent: '#c8102e', w: 250 })
        + CARD(t, 'sucre', tSuc - 0.4, tD + 0.2, { side: 'l' }) + U.bubble(ctx, [-1.0, 1.65, 0.6], '¡Paso Teio!', fade(t, tDer - 0.2, tCap + 0.4), { size: 26 })
        + U.pin(ctx, [0.9, 1.15, 0.3], 'El virrey La Serna', 'capturado', fade(t, tVir - 0.2, tD + 0.2), '#c0392b');
    } },
    { t0: tD, set: Mp, p0: [px, 150, pz + 56], l0: [px, 0, pz - 6], p1: [px, 140, pz + 50], l1: [px, 0, pz - 6], fov0: 40, act: (t) => {
      const k = ss(tD, tFin + 0.8, t); Mp.paint(1810, 1825, k); Mp.zoom(1.8);
      return U.film(t) + U.big(t, tFin - 0.1, tE + 0.2, 'Fin del dominio español en Sudamérica', { top: 100, size: 54 });
    } },
    { t0: tE, set: Mp, p0: [px + 2, 70, pz + 26], l0: [px + 2, 0, pz - 2], p1: [px + 2, 62, pz + 22], l1: [px + 2, 0, pz - 2], fov0: 40, act: (t) => {
      Mp.paint(1825); Mp.zoom(1.0); Mp.tintState(1825, 'BOL', '#9a5ac0', ss(tAlt - 0.2, tAlt + 0.4, t), 0.6);
      return U.film(t) + AM.areaLabel(ctx, -64.5, -17.5, t > tBol - 0.2 ? 'BOLIVIA' : 'ALTO PERÚ', fade(t, tAlt - 0.2, ctx.dur + 1), 'st', 30)
        + U.indep(t, tBol - 0.3, ctx.dur + 1, 'Bolivia', '6 de agosto de 1825', 'Primero «República Bolívar»; luego, Bolivia', ['#2f7a3a', '#c8102e', '#2f7a3a'], { x: 1500, y: 140 });
    } },
  ];
  const inst = { scene: Mp, scenes: [Mp, Jn, Ay], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
