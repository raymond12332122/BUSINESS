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
import * as LK from '../look.js';
import * as RP from '../../rusia/props.js';

export { preload } from '../amap.js';
const fade = AM.fade;
const CARD = (t, who, a, b, o = {}) => U.cast(t, a, b, ...K.CARD[who], o);

export function build(ctx) {
  const L = ctx.L;
  const tVen = wt(L[0], 'venezuela'), tDec = wt(L[0], 'declaro'), tRep = wt(L[0], 'republica'), tCay = wt(L[0], 'cayo'), tSim = wt(L[0], 'simon'), tCri = wt(L[0], 'criollo'), tEmp = wt(L[0], 'empezar');
  const tExi = wt(L[1], 'exilio'), tJam = wt(L[1], 'jamaica'), tSon = wt(L[1], 'sono'), tHai = wt(L[1], 'haiti'), tBar = wt(L[1], 'barcos'), tLib = wt(L[1], 'liberara');
  const tCru = wt(L[2], 'cruzo'), tAnd = wt(L[2], 'andes'), tBoy = wt(L[2], 'boyaca'), tNac = wt(L[2], 'nacio'), tCol = wt(L[2], 'colombia'), tCar = wt(L[2], 'carabobo'), tPic = wt(L[2], 'pichincha'),
    tVz = wt(L[2], 'venezuela'), tEc = wt(L[2], 'ecuador');
  const tB = tSim - 0.3, tC = L[1].t0 - 0.3, tD = tHai - 0.3, tE = L[2].t0 - 0.3, tF = tBoy - 0.5, tG = tNac - 0.3;

  // ---- map of northern South America
  const Mp = AM.americasMap({ period: 1810 });
  const [vx, , vz] = AM.apos(-70, 5);
  const pCcs = AM.pulse(Mp, -66.9, 10.48, '#c0392b', 1.6), pCar = AM.pulse(Mp, -68.1, 10.1, '#c0392b', 1.6), pPic = AM.pulse(Mp, -78.5, -0.2, '#c0392b', 1.6), pBoy = AM.pulse(Mp, -73.4, 5.45, '#c0392b', 1.6);
  const ships = AM.arrow(Mp, [[-73.7, 18.2], [-70.5, 15], [-67.5, 12.5], [-64.2, 10.8]], '#1f3f8f', 0.8);
  const GCO = { col: tCol, pan: tCol + 0.2, ven: tVz, ecu: tEc };
  // ---- Caracas: Bolívar starts again
  const Cc = S.plaza('day', { arcade: true, seed: 931 });
  const bol = K.role(Cc, 'bolivar', 0, 0, 0);
  const pat = K.crowd(Cc, ['patriota', 'patriota', 'llanero'], 10, [-4.4, -3.6, 4.4, -1.4], { seed: 91, yaw: 0 });
  const vf = P.banner('colombia', { h: 3.2, w: 1.4, fh: 0.9 }); vf.position.set(-1.5, 0, -0.6); Cc.add(vf);
  // ---- Jamaica, 1815: the letter
  const Jm = S.hall({ wall: '#6a5a48', cloth: '#3a2a20', floor: '#4a3426', night: true, w: 8, d: 7 });
  const win = LK.nightWindow(1.5, 1.6); win.position.set(1.8, 2.3, -3.42); Jm.add(win);
  Jm.table.position.set(-0.4, 0, -1.6); const lamp = RP.keroseneLamp(true, 0.8); lamp.position.set(0.3, 0.82, -1.6); Jm.add(lamp);
  const bol2 = K.role(Jm, 'bolivar', -0.5, -0.85, 0.15); K.hold(bol2, K.quill(), 'R', [0, 0.02, 0.03], [20, 0, 0], 0.45);
  // ---- the crossing of the Andes (Páramo de Pisba)
  const An = S.andes('blizzard', { seed: 941 });
  const bol3 = K.role(An, 'bolivar', 0.2, 0.6, 0.2);
  const col = K.crowd(An, ['patriota', 'llanero', 'patriota'], 12, [-5, -4.5, 4, -1.2], { seed: 92, yaw: 0.3 });
  // ---- Boyacá, 7 Aug 1819
  const By = S.battlefield('day', { ground: ['#7a9a52', '#6a8a48'], mountains: 1, trees: 20, seed: 951, smoke: true });
  By.add(LP.strip([[-40, -3.4], [0, -3.6], [40, -3.2]], 2.2, '#5f8fa8', 0.02)); const br = P.stoneBridge(4.4, 2.0); br.position.set(1.2, -0.45, -3.5); By.add(br);
  const pats = K.crowd(By, ['patriota', 'llanero'], 9, [-4.4, -1.6, -0.6, 1.4], { seed: 93, yaw: 0.9 });
  const roy = K.crowd(By, 'realista', 8, [1.0, -7.2, 4.8, -5.0], { seed: 94, yaw: -0.6 });
  const vR = P.volleySmoke(By, roy.map(c => c.root.position.clone().add(new THREE.Vector3(-0.3, 0.55, 0.3)))), vP = P.volleySmoke(By, pats.map(c => c.root.position.clone().add(new THREE.Vector3(0.3, 0.55, -0.3))));

  const sfx = [{ t: 0.2, type: 'whoosh', vol: 0.3 }, { t: tDec, type: 'bell', vol: 0.35 }, { t: tCay, type: 'hit', vol: 0.4 }, { t: tB, type: 'crowd', dur: tC - tB, vol: 0.2 }, { t: tEmp, type: 'laugh', vol: 0.25 },
    { t: tC, type: 'waves', dur: tD - tC, vol: 0.3 }, { t: tC + 0.4, type: 'quill', dur: 2.2, vol: 0.3 }, { t: tD, type: 'whoosh', vol: 0.3 }, { t: tBar, type: 'pop', vol: 0.35 },
    { t: tE, type: 'wind', dur: tF - tE, vol: 0.45 }, { t: tF, type: 'drum', dur: 1.2, vol: 0.3 }, { t: tF + 0.5, type: 'volley', vol: 0.45 }, { t: tF + 1.4, type: 'volley', vol: 0.4 }, { t: tG, type: 'swell', dur: 2.5, vol: 0.3 },
    ...[tCar, tPic].map(x => ({ t: x, type: 'boom', vol: 0.3 }))];

  const shots = [
    { t0: 0, set: Mp, p0: [vx, 70, vz + 26], l0: [vx, 0, vz - 2], p1: [vx, 62, vz + 22], l1: [vx, 0, vz - 2], fov0: 40, act: (t) => {
      Mp.paint(1810); Mp.zoom(1.1); Mp.tint('ven', '#f2c40c', ss(tDec - 0.2, tDec + 0.3, t) * (1 - ss(tCay - 0.1, tCay + 0.4, t)), 0.7); Mp.tint('ven', '#5a4a3a', ss(tCay, tCay + 0.4, t), 0.35);
      pCcs.update(t, tVen);
      return U.film(t) + U.indep(t, tDec - 0.2, tCay + 0.3, 'Venezuela', '5 de julio de 1811', 'La primera en la América española', ['#f2c40c', '#1f3f8f', '#c8102e'], { x: 1500, y: 140 })
        + U.big(t, tCay - 0.1, tB + 0.2, '…y cayó en 1812', { top: 140, size: 64 });
    } },
    { t0: tB, set: Cc, p0: [0.6, 1.45, 3.4], l0: [0, 1.15, -0.4], p1: [0.4, 1.4, 2.8], l1: [0, 1.15, -0.4], fov0: 42, act: (t) => {
      vf.wave(t); K.pose(bol, t > tEmp - 0.6 ? A.orate(t, 1) : A.proud(t, 1)); bol.setFace(C.blinkEye(t, 1), t > tEmp - 0.6 ? 'smile' : 'neutral');
      pat.forEach((c, i) => { K.pose(c, A.guard(t, i)); c.setFace(C.blinkEye(t, i, t > tEmp ? 'flat' : 'open'), t > tEmp ? 'wavy' : 'neutral'); });
      return U.film(t) + CARD(t, 'bolivar', tB + 0.2, tC + 0.2, { side: 'l' })
        + U.bubble(ctx, [0, 1.62, 0], '¿Se cayó la república? ¡Pues la re-publico!', fade(t, tEmp - 0.6, tC), { size: 24 });
    } },
    { t0: tC, set: Jm, p0: [0.5, 1.35, 1.7], l0: [-0.4, 1.0, -1.4], p1: [0.35, 1.3, 1.4], l1: [-0.4, 1.0, -1.4], fov0: 42, act: (t) => {
      K.pose(bol2, A.present(t, 2)); bol2.setFace(C.blinkEye(t, 2), 'neutral');
      return U.film(t) + U.quote(t, [['Deseo más que otro alguno ver formar en América', tJam - 0.2], ['la más grande nación del mundo', tSon]], 'Simón Bolívar, Carta de Jamaica (1815)', tJam - 0.3, tD + 0.2, 26);
    } },
    { t0: tD, set: Mp, p0: [vx - 2, 80, vz + 40], l0: [vx - 2, 0, vz + 6], p1: [vx - 2, 74, vz + 36], l1: [vx - 2, 0, vz + 6], fov0: 40, act: (t) => {
      Mp.paint(1810); Mp.zoom(1.1); ships.set(ss(tBar - 0.4, tLib, t));
      return U.film(t) + AM.chip(ctx, -72.5, 19.2, fade(t, tHai - 0.1, ctx.dur + 1), 'Haití', 'el presidente Pétion le dio barcos y armas', '#1f3f8f', 0.6)
        + U.source(t, tLib - 0.4, tE + 0.2, 'A cambio, Bolívar decretó la libertad de los esclavizados');
    } },
    { t0: tE, set: An, p0: [1.2, 1.5, 4.2], l0: [0, 1.0, -0.6], p1: [0.9, 1.45, 3.6], l1: [0, 1.0, -0.6], fov0: 44, act: (t) => {
      K.pose(bol3, C.walk(t, 0.35, 1)); bol3.setFace(C.blinkEye(t, 1), 'frown'); col.forEach((c, i) => { K.pose(c, A.cold(t, i)); c.setFace('flat', 'frown'); });
      return U.film(t) + U.badge(t, '1819', 'Cruzan los Andes', 'Por el páramo de Pisba, en plena temporada de lluvias', tE + 0.2, tF + 0.1);
    } },
    { t0: tF, set: By, p0: [-3.6, 1.7, 5.0], l0: [0.4, 0.9, -3.0], p1: [-3.0, 1.6, 4.2], l1: [0.4, 0.9, -3.0], fov0: 44, act: (t) => {
      By.tick && By.tick(t);
      pats.forEach((c, i) => { K.pose(c, A.volley(t, tF + 1.4, i, i % 2)); c.setFace(C.blinkEye(t, i), 'frown'); });
      roy.forEach((c, i) => { K.pose(c, A.volley(t, tF + 0.5, i + 9, 0)); c.setFace(C.blinkEye(t, i + 9), 'frown'); });
      vR(t, tF + 0.5, new THREE.Vector3(-0.6, 0, 0.8)); vP(t, tF + 1.4, new THREE.Vector3(0.6, 0, -0.8));
      return U.film(t) + U.badge(t, '7 de agosto de 1819', 'Batalla de Boyacá', 'Bolívar sorprende a los realistas', tF + 0.2, tG + 0.1);
    } },
    { t0: tG, set: Mp, p0: [vx, 74, vz + 30], l0: [vx, 0, vz], p1: [vx, 66, vz + 26], l1: [vx, 0, vz], fov0: 40, act: (t) => {
      Mp.paint(1810); Mp.zoom(1.1); for (const [g, ta] of Object.entries(GCO)) Mp.tint(g, '#e8902a', ss(ta - 0.2, ta + 0.3, t), 0.9);
      pCar.update(t, tCar - 0.1); pPic.update(t, tPic - 0.1);
      return U.film(t) + AM.areaLabel(ctx, -73.5, 4.5, 'REPÚBLICA DE COLOMBIA', fade(t, tCol - 0.1, ctx.dur + 1), 'st', 26)
        + AM.chip(ctx, -68.1, 10.1, fade(t, tCar - 0.1, ctx.dur + 1), 'Carabobo', '24 jun. 1821', '#c0392b', 0.8) + AM.chip(ctx, -78.5, -0.2, fade(t, tPic - 0.1, ctx.dur + 1), 'Pichincha', '24 may. 1822 · Sucre', '#c0392b', 0.8)
        + CARD(t, 'sucre', tPic - 0.3, ctx.dur + 1, { side: 'r', top: 560, w: 600 });
    } },
  ];
  const inst = { scene: Mp, scenes: [Mp, Cc, Jm, An, By], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
