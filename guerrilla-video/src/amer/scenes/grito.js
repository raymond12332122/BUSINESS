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
import * as MX from '../../mx/props.js';

export { preload } from '../amap.js';
const fade = AM.fade;
const CARD = (t, who, a, b, o = {}) => U.cast(t, a, b, ...K.CARD[who], o);

export function build(ctx) {
  const L = ctx.L;
  const tCon = wt(L[0], 'conspiraba'), tQue = wt(L[0], 'queretaro'), tDes = wt(L[0], 'descubrieron'), tCor = wt(L[0], 'corregidora'), tAvi = wt(L[0], 'avisarles');
  const tMad = wt(L[1], 'madrugada'), tDol = wt(L[1], 'dolores'), tHid = wt(L[1], 'miguel'), tLla = wt(L[1], 'llamo'), tLev = wt(L[1], 'levantarse'), tEst = wt(L[1], 'estandarte'),
    tCie = wt(L[1], 'cientos'), tDec = wt(L[1], 'decenas');
  const tTom = wt(L[2], 'tomaron'), tGua = wt(L[2], 'guanajuato'), tMon = wt(L[2], 'monte'), tPer = wt(L[2], 'pero'), tCap = wt(L[2], 'capital'), tDer = wt(L[2], 'derrotado'),
    tCal = wt(L[2], 'calderon'), tCapt = wt(L[2], 'capturado'), tFus = wt(L[2], 'fusilado');
  const tB = tDes - 0.35, tC = L[1].t0 - 0.3, tD = tEst - 0.4, tE = L[2].t0 - 0.3;

  // ---- Querétaro, night: the conspirators
  const Qr = S.hall({ wall: '#6a5440', cloth: '#3a2a20', floor: '#4a3426', night: true });
  for (const x of [-0.8, 0.8]) { const l = RP.keroseneLamp(true, 0.8); l.position.set(x, 0.82, -2.2); Qr.add(l); }
  const allende = K.role(Qr, 'allende', -0.2, -1.2, 0.1);
  const cons = [['cafe', -1.4, -1.4, 0.5], ['spe', 1.1, -1.3, -0.4], ['hishi', 2.0, -1.8, -0.7]].map(([w, x, z, y]) => K.person(Qr, w, 'criollo', x, z, y));
  // ---- Josefa's warning
  const Jo = S.interior({ wall: '#8a6a4a', floor: '#5a3a24', w: 8, d: 7, h: 4.4, lights: [[0, 2.6, 0.5]], windows: false, bulbs: false });
  Jo.userData.sun.intensity = 0.35; Jo.userData.hemi.intensity = 0.6;
  Jo.add(LP.at(LP.box(1.3, 2.6, 0.12, '#3a2418'), 1.6, 1.3, -3.42)); const lamp = RP.keroseneLamp(true, 0.9); lamp.position.set(-1.6, 0.0, -3.0); Jo.add(lamp);
  const josefa = K.role(Jo, 'josefa', 0.3, -1.6, -0.3);
  // ---- Dolores, 16 Sep 1810, before dawn
  const Do = S.doloresSet();
  Do.church.bell.position.z = 1.15;   // hang the bell in the belfry arch so it reads from the plaza
  for (const [x, z, r, i] of [[8.6, -4.6, -0.25, 0], [12.4, -3.4, -0.1, 1], [16.2, -5.0, -0.3, 2]]) { const h = MX.adobe(3, 2.4, 2.2, ['#d9b48a', '#c9967a', '#d6c08f'][i], i + 4); h.position.set(x, 0, z); h.rotation.y = r; Do.add(h); }
  const hid = K.role(Do, 'hidalgo', 4.05, -4.2, -0.8);
  const warm = new THREE.PointLight('#ffb060', 9, 7, 1.3); warm.position.set(3.4, 2.0, -2.6); Do.add(warm);
  const town = K.crowd(Do, ['insurgente', 'insurgenteF', 'indigena', 'dama'], 14, [-2.8, -3.2, 1.4, 1.4], { seed: 71, yaw: Math.PI * 0.85 });
  town.forEach(c => { const dx = 4.2 - c.root.position.x, dz = -4.2 - c.root.position.z; c.root.rotation.y = Math.atan2(dx, dz); });
  const torches = town.filter((_, i) => i % 4 === 1).map(c => K.hold(c, K.torch(), 'L', [0, 0, 0.02]));
  // ---- the march with the Guadalupe banner
  const Ma = S.sierra('golden', { ground: ['#b8a07a', '#a89070'], height: 0.6, pines: false, seed: 721 });
  const hid2 = K.role(Ma, 'hidalgo', 0, 0, 0);
  const banner = P.banner('guadalupe', { h: 3.4, w: 1.0, fh: 1.3 }); K.hold(hid2, banner, 'R', [0, -0.04, 0.02], [0, 90, 0], 0.55);
  const army = K.crowd(Ma, ['insurgente', 'insurgenteF', 'indigena', 'insurgente'], 22, [-5, -6.5, 5, -1.2], { seed: 72, yaw: 0, jitter: 0.5 });
  // ---- map of New Spain
  const Mp = AM.americasMap({ period: 1810 });
  const route = AM.arrow(Mp, [[-100.93, 21.16], [-101.26, 21.02], [-101.19, 19.7], [-99.33, 19.33]], '#c0392b', 0.32);
  const back = AM.arrow(Mp, [[-99.4, 19.5], [-101.6, 20.2], [-103.35, 20.67], [-102.93, 20.73]], '#8a5a3a', 0.24);
  const north = AM.arrow(Mp, [[-102.6, 21.4], [-101.8, 24.5], [-101.2, 26.6], [-106.09, 28.63]], '#5a4a3a', 0.2);
  const [mx, , mz] = AM.apos(-101.5, 22.5);

  const sfx = [{ t: 0, type: 'night', dur: tC, vol: 0.3 }, { t: tCon, type: 'whisper', dur: 2.0, vol: 0.3 }, { t: tB, type: 'knock', vol: 0.45 }, { t: tCor + 0.3, type: 'knock', vol: 0.4 },
    { t: tC, type: 'bell', vol: 0.5 }, { t: tC + 1.2, type: 'bell', vol: 0.5 }, { t: tC + 2.4, type: 'bell', vol: 0.5 }, { t: tLla, type: 'crowd', dur: tE - tLla, vol: 0.35 }, { t: tLev, type: 'shout', vol: 0.35 },
    { t: tD, type: 'march', dur: tE - tD, vol: 0.3 }, { t: tE, type: 'whoosh', vol: 0.3 }, ...[tGua, tMon].map(x => ({ t: x, type: 'boom', vol: 0.3 })), { t: tCal, type: 'boom', vol: 0.35 }, { t: tFus, type: 'drum', dur: 1.2, vol: 0.3 }];

  const doAct = (t) => {
    Do.church.bell.rotation.z = 0.5 * Math.sin(t * 3.2); torches.forEach((tc, i) => tc.flame.scale.set(1, 1.8 + 0.3 * Math.sin(t * 17 + i), 1));
    K.pose(hid, A.ringBell(t, 1)); hid.setFace(C.blinkEye(t, 1), t > tLla ? 'shout' : 'grin');
    town.forEach((c, i) => { K.pose(c, t > tLev ? (i % 2 ? C.cheer(t, i) : A.fist(t, i)) : C.idle(t, i, 0.4)); c.setFace(C.blinkEye(t, i), t > tLev ? 'open' : 'neutral'); });
    return U.film(t) + U.datePage(t, tC + 0.2, tLla - 0.3, 'Dolores, 5 de la mañana', 'SEPT.', '16', '1810', { x: 1620, y: 90, accent: '#2f7a3a', w: 250 })
      + CARD(t, 'hidalgo', tHid - 0.4, tD + 0.2, { side: 'l' }) + U.bubble(ctx, [4.2, 1.75, -4.2], '¡Turbo a toda máquina!', fade(t, tLla, tD), { size: 26 });
  };
  const shots = [
    { t0: 0, set: Qr, p0: [0.3, 1.4, 2.6], l0: [0, 0.9, -1.6], p1: [0.2, 1.35, 2.1], l1: [0, 0.9, -1.6], fov0: 42, act: (t) => {
      K.pose(allende, A.talk(t, 1)); allende.setFace(C.blinkEye(t, 1), 'open'); cons.forEach((c, i) => { K.pose(c, i === 1 ? A.fist(t, i) : C.idle(t, i, 0.4)); c.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + CARD(t, 'allende', 0.6, tB + 0.1, { side: 'l' }) + U.badge(t, 'Querétaro, 1810', 'La conspiración', 'Criollos que planeaban levantarse', tQue - 0.4, tB);
    } },
    { t0: tB, set: Jo, p0: [-0.2, 1.5, 1.5], l0: [0.4, 1.15, -1.7], p1: [-0.05, 1.45, 1.1], l1: [0.4, 1.15, -1.7], fov0: 42, act: (t) => {
      const stomp = Math.max(0, Math.sin((t - tCor) * 9)) * ss(tCor - 0.2, tCor, t) * (1 - ss(tAvi + 0.6, tAvi + 1, t));
      const p = A.talk(t, 2); p.thR = [-24 * stomp, 0, -2]; p.knR = [30 * stomp, 0, 0]; K.pose(josefa, p); josefa.setFace(C.blinkEye(t, 2), stomp > 0.2 ? 'open' : 'smile');
      return U.film(t) + CARD(t, 'josefa', tCor - 0.5, tC + 0.2, { side: 'l' }) + U.bubble(ctx, [0.3, 1.75, -1.6], '¡Corran, los descubrieron!', fade(t, tAvi - 0.4, tC), { size: 26 });
    } },
    // wide from the plaza: the bell swinging in the tower over the gathering town, then Hidalgo at the rope
    { t0: tC, set: Do, p0: [2.6, 1.3, 1.8], l0: [4.3, 10.6, -5.5], p1: [2.5, 1.4, 1.4], l1: [4.0, 1.5, -4.2], fov0: 50, act: doAct },
    { t0: tHid - 0.6, set: Do, p0: [6.0, 1.55, 0.3], l0: [2.4, 1.1, -3.4], p1: [5.7, 1.5, -0.2], l1: [2.5, 1.1, -3.5], fov0: 46, act: doAct },
    { t0: tD, set: Ma, p0: [1.2, 1.5, 5.0], l0: [0, 1.2, -1.0], p1: [0.8, 1.45, 4.0], l1: [0, 1.2, -1.0], fov0: 46, act: (t) => {
      banner.wave && banner.wave(t); const p = C.walk(t, 0.45, 1); p.armR = [-60, 0, 30]; p.elbR = [0, 0, -60]; K.pose(hid2, p); hid2.setFace(C.blinkEye(t, 1), 'grin');
      army.forEach((c, i) => K.pose(c, i % 4 === 0 ? C.cheer(t, i) : C.walk(t, 0.45, i)));
      return U.film(t) + U.counter(t, tCie - 0.3, tE + 0.2, 1240, 140, 80000, 'insurgentes: de unos 600 a más de 80.000', { from: 600, dur: 2.2, color: '#ffcf6a', w: 620 })
        + U.pin(ctx, [0.6, 2.9, 0.1], 'Estandarte de la Virgen de Guadalupe', '', fade(t, tEst - 0.1, tCie + 0.4), '#2f7a3a');
    } },
    { t0: tE, set: Mp, p0: [mx, 32, mz + 14], l0: [mx, 0, mz], p1: [mx - 0.5, 30, mz + 12], l1: [mx - 0.5, 0, mz], fov0: 42, act: (t) => {
      Mp.paint(1810); Mp.zoom(0.35); route.set(ss(tTom - 0.3, tMon + 0.6, t)); back.set(ss(tPer, tCal + 0.3, t)); north.set(ss(tCapt - 0.3, tFus + 0.4, t));
      const ck = (lo, la, a, ttl, sub, col = '#c0392b', b = ctx.dur + 1) => AM.chip(ctx, lo, la, fade(t, a, b), ttl, sub, col, 0.15);
      // neighbouring chips hand over: Guanajuato gives way to Calderón, Monte de las Cruces to the capital
      return U.film(t) + ck(-101.26, 21.02, tGua - 0.1, 'Guanajuato', 'Alhóndiga de Granaditas, 28 sept.', '#c0392b', tCal - 0.3)
        + ck(-99.33, 19.33, tMon - 0.1, 'Monte de las Cruces', '30 oct. 1810', '#c0392b', tCap - 0.3) + AM.chip(ctx, -99.13, 19.43, fade(t, tCap - 0.2, tDer), 'Ciudad de México', 'no la tomó', '#5a4a3a', 0.15)
        + ck(-102.93, 20.73, tCal - 0.2, 'Puente de Calderón', '17 ene. 1811', '#8a5a3a') + ck(-106.09, 28.63, tFus - 0.3, 'Chihuahua', 'fusilado el 30 jul. 1811', '#3a3a3a');
    } },
  ];
  const inst = { scene: Qr, scenes: [Qr, Jo, Do, Ma, Mp], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
