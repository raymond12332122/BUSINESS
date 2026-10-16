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

export { preload } from '../amap.js';
const fade = AM.fade;
const CARD = (t, who, a, b, o = {}) => U.cast(t, a, b, ...K.CARD[who], o);

export function build(ctx) {
  const L = ctx.L;
  const tSeg = wt(L[0], 'segunda'), tRad = wt(L[0], 'radical'), tSan = wt(L[0], 'san'), tAzu = wt(L[0], 'azucar'), tMed = wt(L[0], 'medio'), tEsc = wt(L[0], 'esclavizadas');
  const tReb = wt(L[1], 'rebelaron'), tAnt = wt(L[1], 'antiguo'), tTus = wt(L[1], 'tusan'), tGob = wt(L[1], 'gobernar');
  const tNap = wt(L[2], 'napoleon'), tRes = wt(L[2], 'restablecer'), tMur = wt(L[2], 'murio'), tPer = wt(L[2], 'pero'), tDes = wt(L[2], 'yan');
  const tEne = wt(L[3], 'primero'), tNac = wt(L[3], 'nacio'), tPri = wt(L[3], 'primer'), tAbo = wt(L[3], 'abolir');
  const tB = tAzu - 0.3, tC = L[1].t0 - 0.3, tD = tTus - 0.4, tE = L[2].t0 - 0.3, tF = tMur - 0.6, tG = tPer - 0.3, tH = L[3].t0 - 0.3;

  // ---- map of the Caribbean
  const Mp = AM.americasMap({ period: 1800 });
  const [hx, , hz] = AM.apos(-72.5, 19.0);
  const pSD = AM.pulse(Mp, -72.4, 19.1, '#2a4fa0', 1.0);
  const fleet = AM.arrow(Mp, [[-48, 21], [-60, 20.5], [-68, 20.2], [-72.2, 19.8]], '#2a4fa0', 0.9);
  // ---- the plantation
  const Pl = S.tropics('day', { cane: true, mill: true });
  const work = K.crowd(Pl, 'trabajador', 8, [-4.5, -4.5, 3.5, -2.0], { seed: 51, yaw: 0.2 });
  // ---- the uprising, night of 22-23 August 1791
  const Nt = S.tropics('night', { cane: false, mill: false, bonfire: true, seed: 521 });
  const rebels = K.crowd(Nt, ['rebelde', 'rebelde', 'trabajador'], 12, [-4.2, -2.4, 4.2, 1.6], { seed: 52, yaw: 0 });
  rebels.forEach((c, i) => { const dx = -c.root.position.x, dz = -4 - c.root.position.z; c.root.rotation.y = Math.atan2(dx, dz) + Math.PI * 0; });
  const torches = rebels.filter((_, i) => i % 3 === 2).map(c => K.hold(c, K.torch(), 'L', [0, 0, 0.02]));
  // ---- Toussaint's army
  const Ts = S.tropics('golden', { cane: false, mill: false, seed: 531 });
  const tou = K.role(Ts, 'toussaint', 0, 0, 0.1);
  const army = K.crowd(Ts, 'haitiano', 10, [-4.5, -4.2, 4.5, -1.6], { seed: 53, yaw: 0 });
  const hf = P.banner('fra', { h: 3.2, w: 1.3, fh: 0.85 }); hf.position.set(-2.2, 0, -1.0); Ts.add(hf);
  // ---- Fort de Joux
  const Cl = S.cell();
  const prisoner = K.role(Cl, 'toussaint', -0.4, -1.2, 0.5);
  // ---- Vertières, Nov 1803
  const Vt = S.battlefield('golden', { ground: ['#7a9a4a', '#6a8a40'], smoke: true, trees: 0, seed: 541 });
  for (let i = 0; i < 14; i++) { const p = RP.palm(1.3 + (i % 3) * 0.3, i); p.position.set(-30 + i * 4.6, 0, -16 - (i % 2) * 5); Vt.add(p); }
  const des = K.role(Vt, 'dessalines', -1.4, 1.2, 0.5);
  const hai = K.crowd(Vt, 'haitiano', 9, [-5.2, -1.2, -1.0, 1.0], { seed: 54, yaw: 0.6, yawJ: 0.15 });
  const frn = K.crowd(Vt, 'frances1802', 8, [1.6, -4.4, 5.4, -2.2], { seed: 55, yaw: -0.6, yawJ: 0.15 });
  const vF = RP.volleyFx(Vt, frn.map(c => c.root.position.clone().add(new THREE.Vector3(-0.3, 0.55, 0.3)))), vH = RP.volleyFx(Vt, hai.map(c => c.root.position.clone().add(new THREE.Vector3(0.3, 0.55, -0.3))));
  // ---- Gonaïves, 1 Jan 1804
  const Go = S.tropics('day', { cane: false, mill: false, seed: 551 });
  const des2 = K.role(Go, 'dessalines', 0.3, -0.6, 0);
  const flagH = P.banner('haiti', { h: 3.6, w: 1.6, fh: 1.0 }); flagH.position.set(-0.8, 0, -1.4); Go.add(flagH);
  const people = [...K.crowd(Go, ['haitiano', 'rebelde', 'trabajador'], 7, [-5.2, -1.8, -1.6, 1.8], { seed: 56, yaw: Math.PI / 2 - 0.3 }),
    ...K.crowd(Go, ['rebelde', 'haitiano', 'trabajador'], 7, [1.8, -1.8, 5.4, 1.8], { seed: 57, yaw: -Math.PI / 2 + 0.3 })];

  const sfx = [{ t: 0.2, type: 'whoosh', vol: 0.3 }, { t: tSan, type: 'pop', vol: 0.3 }, { t: tB, type: 'insects', dur: tC - tB, vol: 0.3 }, { t: tMed, type: 'tick', vol: 0.3 },
    { t: tC, type: 'drums', dur: tD - tC + 0.5, vol: 0.45 }, { t: tC + 0.2, type: 'fire', dur: tD - tC, vol: 0.3 }, { t: tReb, type: 'crowd', dur: 2.5, vol: 0.35 },
    { t: tD, type: 'fanfare', vol: 0.3 }, { t: tE, type: 'whoosh', vol: 0.3 }, { t: tF, type: 'wind', dur: tG - tF, vol: 0.35 }, { t: tG, type: 'drum', dur: 1.5, vol: 0.3 },
    { t: tG + 0.6, type: 'volley', vol: 0.45 }, { t: tG + 1.6, type: 'volley', vol: 0.4 }, { t: tH, type: 'swell', dur: 2.5, vol: 0.3 }, { t: tNac, type: 'sting2', vol: 0.4 }, { t: tNac + 0.2, type: 'crowd', dur: ctx.dur - tNac - 0.2, vol: 0.3 }];

  const shots = [
    { t0: 0, set: Mp, p0: [hx - 2, 46, hz + 18], l0: [hx, 0, hz], p1: [hx - 1, 30, hz + 12], l1: [hx, 0, hz], fov0: 40, act: (t) => {
      Mp.paint(1800); Mp.zoom(0.5); Mp.tintState(1800, 'FRA', '#2a4fa0', 0.6 + 0.4 * Math.sin(t * 3) ** 2, 0.5); pSD.update(t, tSan - 0.1);
      return U.film(t) + AM.chip(ctx, -72.4, 19.1, fade(t, tSan - 0.15, tB + 0.3), 'Saint-Domingue', 'colonia francesa (hoy Haití)', '#2a4fa0', 0.4)
        + U.big(t, tSeg - 0.2, tB + 0.2, 'La revolución más radical', { top: 90, size: 60 });
    } },
    { t0: tB, set: Pl, p0: [3.4, 1.4, 4.4], l0: [-0.4, 0.9, -3.2], p1: [2.6, 1.35, 3.8], l1: [-0.6, 0.9, -3.2], fov0: 44, act: (t) => {
      work.forEach((c, i) => { K.pose(c, A.work(t, i)); c.setFace(C.blinkEye(t, i, 'flat'), 'neutral'); });
      return U.film(t) + U.tiles(t, tAzu - 0.2, tMed - 0.2, [['🍬', 'azúcar', tAzu - 0.1], ['☕', 'café: 60 % del mundo', tAzu + 0.9]], { top: 120, w: 360 })
        + U.counter(t, tMed - 0.2, tC + 0.2, 960, 130, 500000, 'personas esclavizadas (hacia 1789)', { from: 0, dur: 1.2, color: '#ffcf6a', prefix: '≈ ', w: 640 })
        + U.source(t, tEsc, tC + 0.2, 'Frente a unos 30.000 colonos blancos');
    } },
    { t0: tC, set: Nt, p0: [0, 1.7, 5.6], l0: [0, 1.0, -2.2], p1: [0, 1.6, 4.6], l1: [0, 1.0, -2.2], fov0: 44, act: (t) => {
      Nt.tick(t); torches.forEach((tc, i) => tc.flame.scale.set(1, 1.8 + 0.3 * Math.sin(t * 17 + i), 1));
      const up = ss(tReb - 0.3, tReb + 0.2, t);
      rebels.forEach((c, i) => { K.pose(c, up > 0.5 ? (i % 2 ? A.fist(t, i) : C.cheer(t, i)) : C.idle(t, i, 0.4)); c.setFace(C.blinkEye(t, i), up > 0.5 ? 'shout' : 'frown'); });
      return U.film(t) + U.badge(t, 'Agosto de 1791', 'El levantamiento', 'Según la tradición, empezó con una ceremonia en Bois Caïman', tC + 0.3, tD + 0.1);
    } },
    { t0: tD, set: Ts, p0: [0.8, 1.6, 3.4], l0: [0, 1.2, -0.6], p1: [0.5, 1.55, 2.9], l1: [0, 1.2, -0.6], fov0: 42, act: (t) => {
      hf.wave(t); K.pose(tou, A.proud(t, 1)); tou.setFace(C.blinkEye(t, 1), 'grin');
      army.forEach((c, i) => K.pose(c, i % 3 ? A.guard(t, i) : C.salute(t, i)));
      return U.film(t) + CARD(t, 'toussaint', tD + 0.2, tE + 0.2, { side: 'r' }) + U.bubble(ctx, [0, 1.95, 0], '¡Soy el Rayo Blanco!', fade(t, tD + 0.5, tE - 0.1), { size: 26 })
        + U.source(t, tGob - 0.3, tE + 0.2, 'Francia abolió la esclavitud en 1794; Toussaint gobernó la colonia');
    } },
    { t0: tE, set: Mp, p0: [hx + 22, 70, hz + 40], l0: [hx + 10, 0, hz], p1: [hx + 16, 60, hz + 32], l1: [hx + 6, 0, hz], fov0: 40, act: (t) => {
      Mp.paint(1800); Mp.zoom(0.9); fleet.set(ss(tNap - 0.1, tRes + 0.6, t)); pSD.update(t, tRes);
      return U.film(t) + AM.chip(ctx, -58, 21, fade(t, tNap, tF + 0.3), 'Expedición Leclerc · 1802', 'unos 20.000 soldados franceses', '#2a4fa0', 1.2)
        + U.badge(t, '1802', 'Napoleón quiere restablecer la esclavitud', 'La restableció en otras colonias francesas', tE + 0.2, tF);
    } },
    { t0: tF, set: Cl, p0: [1.4, 1.5, 2.6], l0: [-0.4, 1.0, -1.2], p1: [1.1, 1.45, 2.2], l1: [-0.4, 1.0, -1.2], fov0: 42, act: (t) => {
      K.pose(prisoner, A.slump(t, 1)); prisoner.setFace('flat', 'frown');
      return U.film(t) + U.tint('#4a6a9a', 0.25) + U.badge(t, 'Fuerte de Joux, Francia', 'Toussaint muere preso', '7 de abril de 1803', tF + 0.2, tG);
    } },
    { t0: tG, set: Vt, p0: [-3.8, 1.5, 4.6], l0: [0, 0.9, -1.2], p1: [-3.2, 1.45, 3.8], l1: [0, 0.9, -1.2], fov0: 44, act: (t) => {
      Vt.tick && Vt.tick(t);
      K.pose(des, A.swordUp(t, 1, 1)); des.setFace(C.blinkEye(t, 1), 'shout');
      hai.forEach((c, i) => { K.pose(c, A.volley(t, tG + 1.6, i, i % 2)); c.setFace(C.blinkEye(t, i), 'frown'); });
      frn.forEach((c, i) => { K.pose(c, A.volley(t, tG + 0.6, i + 9, 0)); c.setFace(C.blinkEye(t, i + 9), 'frown'); });
      vF(t, tG + 0.6, new THREE.Vector3(-0.7, 0, 0.7)); vH(t, tG + 1.6, new THREE.Vector3(0.7, 0, -0.7));
      return U.film(t) + CARD(t, 'dessalines', tDes - 0.3, tH + 0.2, { side: 'l' }) + U.badge(t, 'Noviembre de 1803', 'Vertières', 'Los franceses se rinden', tG + 0.2, tH + 0.1);
    } },
    { t0: tH, set: Go, p0: [0.6, 1.3, 4.4], l0: [0, 1.25, -1.0], p1: [0.5, 1.25, 3.6], l1: [0, 1.25, -1.0], fov0: 46, act: (t) => {
      flagH.wave(t); const k = ss(tH, tNac, t); flagH.position.y = -1.2 * (1 - k);
      K.pose(des2, A.swordUp(t, 1, ss(tNac - 0.3, tNac + 0.3, t))); des2.setFace(C.blinkEye(t, 1), 'smile');
      people.forEach((c, i) => { K.pose(c, t > tNac ? (i % 2 ? A.jubilant(t, i) : C.cheer(t, i)) : C.idle(t, i, 0.4)); c.setFace(C.blinkEye(t, i), t > tNac ? 'smile' : 'neutral'); });
      return U.film(t) + U.indep(t, tNac - 0.2, ctx.dur + 1, 'Haití', '1 de enero de 1804', 'Primer país independiente de América Latina · abolición definitiva de la esclavitud', ['#1f3f8f', '#c8102e'], { x: 1500, y: 130, w: 460 });
    } },
  ];
  const inst = { scene: Mp, scenes: [Mp, Pl, Nt, Ts, Cl, Vt, Go], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
