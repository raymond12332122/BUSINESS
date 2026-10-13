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
const FRONT = [[24.1, 57.2], [24.6, 56.6], [26.4, 55.6], [26.6, 54.6], [26.2, 53.4], [25.8, 52.3], [26.3, 51.5], [25.4, 50.6], [25.6, 49.6], [25.9, 48.4], [26.6, 47.7]];

const fz = (arr, poseFn, keep = () => false, face = 'neutral') => arr.forEach((c, i) => { if (keep(i)) return; c.setFace('open', face); K.freeze(c, poseFn(i)); });

export function build(ctx) {
  const L = ctx.L;
  const tPrim = wt(L[0], 'primera'), tMov = wt(L[0], 'movilizo'), tQuince = wt(L[0], 'quince'), tMal = wt(L[0], 'mal');
  const tMur = wt(L[1], 'murieron'), tDos = wt(L[1], 'dos'), tZar = wt(L[1], 'zar'), tMando = wt(L[1], 'mando'), tDer = wt(L[1], 'derrota');
  const tZarina = wt(L[2], 'zarina'), tRasp = wt(L[2], 'rasputin'), tNob = wt(L[2], 'nobles'), tAses = wt(L[2], 'asesinaron'), tInv = wt(L[2], 'invierno'), tPan = wt(L[2], 'pan');

  // ---- 1. Map: the Eastern Front
  const Mp = RM.russiaMap({ period: 1914 });
  const front = RM.ribbons([FRONT], 0.16, RM.H + 0.03, '#c0392b', { joints: true }); front.renderOrder = 6; Mp.add(front);
  // ---- 2. Troops marching to the front (summer 1914)
  const R = S.road1914('day');
  const column = []; for (let r = 0; r < 7; r++) for (let c = 0; c < 3; c++) { const m = K.person(R, ['doto', 'oguri', 'helios', 'suzuka', 'mcqueen', 'daiwa', 'cafe', 'tamamo'][(r * 3 + c) % 8], 'soldadoZar', -0.8 + c * 0.8, -2 - r * 1.05, Math.PI); m.z0 = m.root.position.z; column.push(m); }
  const offR = K.person(R, 'mcqueen', 'oficialZar', 1.9, -1.4, Math.PI); offR.z0 = -1.4;
  // ---- 3. In the trench, winter
  const T = S.trenchSet('snow', { snowing: true });
  const tr = [K.person(T, 'doto', 'soldadoInvierno', -1.6, 0.2, -Math.PI / 2 + 0.35), K.person(T, 'oguri', 'soldadoInvierno', 0.4, -0.3, Math.PI), K.person(T, 'helios', 'soldadoZar', -3.0, -0.2, -Math.PI / 2 - 0.3), K.person(T, 'tamamo', 'soldadoZar', 1.8, -0.25, Math.PI)];
  tr[2].gun && (tr[2].gun.visible = false);
  // ---- 4. A field of graves
  const G = S.trenchSet('snow', { snowing: true });
  G.maxim.visible = false;
  const crosses = []; for (let r = 0; r < 7; r++) for (let c = 0; c < 12; c++) { const x = -7 + c * 1.25 + (r % 2) * 0.6, z = 3 + r * 1.6; const k = P.orthCross(r * 12 + c, 1.15); k.position.set(x, G.Y, z); G.add(k); crosses.push(k); }
  // ---- 5. Stavka: the tsar takes command
  const Sk = S.stavka();
  const tsar = leader(Sk, 'nicolas', 0, -1.85, 0);
  const gens = [K.person(Sk, 'helios', 'oficialZar', -1.2, -1.0, Math.PI / 2), K.person(Sk, 'daiwa', 'oficialZar', 1.2, -1.15, -Math.PI / 2)];
  // ---- 6. The empress and Rasputin
  const Z = S.zarinaRoom();
  const zarina = leader(Z, 'zarina', -1.0, -2.36, 0); zarina.root.position.y = 0.1;
  const rasp = leader(Z, 'rasputin', 0.15, -1.95, -1.15);
  // ---- 7. Night, frozen river: Rasputin murdered
  const Nv = S.nevaNight({ aurora: false, frozen: true });
  // ---- 8. Bread line in the snow
  const St = S.petroStreet('snow', { snowing: true });
  const queue = K.crowd(St, ['obrera', 'obrera', 'campesina', 'obrera'], 12, [-5.9, -3.4, -5.1, 6.5], { seed: 61, yaw: Math.PI });
  fz(queue, i => A.cold(0.3 + i * 0.07, i), i => i < 3, 'wavy');

  const tB = tMov - 0.35, tC = tMal - 0.35, tD = L[1].t0 - 0.3, tE = tZar - 0.35, tF = L[2].t0 - 0.3, tG = tNob - 0.35, tH = tInv - 0.6;
  const sfx = [{ t: 0.2, type: 'whoosh', vol: 0.4 }, { t: tPrim, type: 'boom', vol: 0.4 }, { t: tB, type: 'march', dur: tC - tB, vol: 0.45 }, { t: tQuince, type: 'pop', vol: 0.4 },
    { t: tC, type: 'wind', dur: tE - tC, vol: 0.35 }, { t: tC + 0.4, type: 'boom', vol: 0.25 }, { t: tD + 0.5, type: 'boom', vol: 0.2 }, { t: tDos, type: 'pop', vol: 0.4 },
    { t: tE, type: 'clock', dur: tF - tE, vol: 0.25 }, { t: tF, type: 'choir', dur: tG - tF, vol: 0.18 }, { t: tG, type: 'night', dur: tH - tG, vol: 0.3 }, { t: tAses - 0.2, type: 'swoosh', vol: 0.45 },
    { t: tH, type: 'wind', dur: ctx.dur - tH, vol: 0.4 }];

  const shots = [
    { t0: 0, set: Mp, p0: [-14, 24, 13], l0: [-13, 0, -2.5], p1: [-13, 21, 11], l1: [-12.5, 0, -2.5], fov0: 40, act: (t) => {
      Mp.paint(1914); Mp.tintState(1914, 'RUE', '#e8a845', 1, 0.45); Mp.tintState(1914, 'GER', '#6a7078', 1, 0.5); Mp.tintState(1914, 'AUH', '#8a7a5a', 1, 0.4);
      const kf = ss(tPrim - 0.2, tPrim + 0.8, t); front.visible = kf > 0.01; front.material.opacity = kf;
      return U.film(t) + RM.areaLabel(ctx, 36, 56.5, 'IMPERIO RUSO', fade(t, 0.3, tB + 1), 'big') + RM.areaLabel(ctx, 11, 51.5, 'ALEMANIA', fade(t, 0.5, tB + 1), 'st')
        + RM.areaLabel(ctx, 18.5, 47.6, 'AUSTRIA-HUNGRÍA', fade(t, 0.5, tB + 1), 'st') + RM.areaLabel(ctx, 27.8, 52.8, 'FRENTE ORIENTAL', fade(t, tPrim + 0.4, tB + 1), 'big').replace('class="lbl big"', 'class="lbl big r"')
        + U.badge(t, '1914', 'Primera Guerra Mundial', 'Rusia contra Alemania y Austria-Hungría', tPrim - 0.3, tB);
    } },
    { t0: tB, set: R, p0: [3.2, 1.2, 4.5], l0: [-0.4, 0.8, -8], p1: [2.8, 1.15, 3.6], l1: [-0.4, 0.8, -8], fov0: 42, act: (t) => {
      const u = t - tB;
      column.forEach((m, i) => { m.root.position.z = m.z0 - u * 0.36; K.pose(m, A.march(t, (i % 3) * 0.1, 0.5)); m.setFace(C.blinkEye(t, i), 'neutral'); });
      offR.root.position.z = offR.z0 - u * 0.36; K.pose(offR, C.walk(t, 0.5, 2)); offR.setFace('open', 'neutral');
      return U.film(t) + U.counter(t, tQuince - 0.25, tC, 110, 620, 15, 'millones de movilizados', { from: 2, dur: 1.2, color: '#ffcf6a', suffix: ' mill.', w: 520 });
    } },
    { t0: tC, set: T, p0: [-5.6, 0.95, 0.05], l0: [2, 0.7, 0], p1: [-5.0, 0.92, 0.05], l1: [2, 0.7, 0], fov0: 44, act: (t) => {
      T.tick(t);
      tr.forEach((s, i) => { K.pose(s, i === 2 ? A.cold(t, i) : i === 1 ? A.guard(t, i) : { ...C.tired(t, i, 0.6), gun: 'low' }); s.setFace(C.blinkEye(t, i), i === 2 ? 'wavy' : 'frown'); });
      return U.film(t) + U.icons(t, tMal - 0.2, tD, [['🔫', 'Faltaban fusiles', tMal], ['👢', 'botas', tMal + 0.4], ['📦', 'y municiones', tMal + 0.8]], { y: 760 });
    } },
    { t0: tD, set: G, p0: [2.5, 3.2, -6], l0: [0, 1.2, 10], p1: [2.0, 2.6, -4.5], l1: [0, 1.2, 10], fov0: 42, act: (t) => {
      G.tick(t);
      return U.film(t) + U.counterD(t, tDos - 0.3, tE, 1240, 130, 2, 'millones de soldados rusos muertos', { from: 0.2, dur: 1.0, color: '#ff8a6a', prefix: '≈ ', suffix: ' mill.', w: 560, dec: 0 })
        + U.source(t, tDos + 0.5, tE, 'Estimaciones: entre 1,7 y 2,2 millones');
    } },
    { t0: tE, set: Sk, p0: [0.95, 1.05, 1.3], l0: [0, 0.48, -1.3], p1: [0.7, 0.98, 0.9], l1: [0, 0.5, -1.35], fov0: 44, act: (t) => {
      K.pose(tsar, A.pointDown(t, 1)); tsar.setFace(C.blinkEye(t, 1), t > tDer - 0.3 ? 'frown' : 'neutral');
      gens.forEach((g, i) => { K.pose(g, C.idle(t, i + 2, 0.4)); g.setFace(C.blinkEye(t, i + 2), 'neutral'); });
      return U.film(t) + U.badge(t, 'Septiembre de 1915', 'El zar al mando', 'Comandante en jefe del ejército', tMando - 0.4, tF);
    } },
    { t0: tF, set: Z, p0: [0.55, 0.92, 1.0], l0: [-0.55, 0.55, -2.2], p1: [0.4, 0.88, 0.6], l1: [-0.5, 0.55, -2.2], fov0: 44, act: (t) => {
      K.pose(zarina, A.sit(t, 2)); zarina.setFace(C.blinkEye(t, 2), 'neutral');
      K.pose(rasp, A.talk(t, 4)); rasp.setFace(C.blinkEye(t, 4), C.talkMouth(t, 4));
      return U.film(t) + U.nameplate(ctx, [-1.0, 1.05, -2.36], NAMES.zarina[0], 'La zarina', tZarina - 0.2, tRasp - 0.4)
        + U.nameplate(ctx, [0.15, 1.2, -1.95], NAMES.rasputin[0], 'El místico de la corte', tRasp - 0.2, tG);
    } },
    { t0: tG, set: Nv, p0: [-8, 1.6, 6], l0: [6, 0, -40], p1: [-7, 1.5, 5], l1: [6, 0, -40], fov0: 46, act: (t) => {
      return U.film(t) + U.newspaper(t, tNob - 0.1, tH, { mast: 'НОВОЕ ВРЕМЯ', date: 'Petrogrado, diciembre de 1916', head: 'Asesinan a Rasputín', sub: 'Su cuerpo aparece bajo el hielo del río' });
    } },
    { t0: tH, set: St, p0: [-1.8, 1.25, 7.0], l0: [-6.2, 0.9, -3.5], p1: [-2.2, 1.2, 6.0], l1: [-6.2, 0.95, -3.5], fov0: 44, act: (t) => {
      St.tick(t);
      queue.forEach((q, i) => { K.pose(q, A.cold(t, i)); q.setFace(C.blinkEye(t, i), 'wavy'); });
      return U.film(t) + U.tag(ctx, [-6.9, 3.95, -4.3], 'ХЛѢБЪ', 'pan', fade(t, tH + 0.4, ctx.dur + 1))
        + U.badge(t, 'Invierno de 1916–1917', 'Colas para el pan', 'Faltan pan y carbón en Petrogrado', tInv - 0.3, ctx.dur + 1);
    } },
  ];
  const inst = { scene: Mp, scenes: [Mp, R, T, G, Sk, Z, Nv, St], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
