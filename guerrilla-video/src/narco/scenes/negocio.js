import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as N from '../props.js';
import * as MA from '../../mx/anim.js';
import { runShots, wt } from '../../mx/shots.js';
import * as U from '../ui.js';

export { preload } from '../mapkit.js';
const { sin } = Math;

// Bent over a lab table, stirring.
const stir = (t, seed) => { const p = C.idle(t, seed, 0.2); p.chest = [10, 0, 0]; p.head = [16, 6 * sin(t * 0.7 + seed), 0];
  p.armR = [-62 + 8 * sin(t * 4 + seed), 14, 66]; p.elbR = [0, 50 + 12 * sin(t * 4 + seed), 0]; p.armL = [-55, -12, -70]; p.elbL = [0, -40, 0]; return p; };
// Looking down at a phone held in the right hand.
const onPhone = (t, seed) => { const p = C.operate(t, seed); p.elbL = [0, -74, 0]; p.elbR = [0, 74, 0]; p.head = [18, 4 * sin(t * 0.5 + seed), 3 * sin(t * 0.4 + seed)]; p.gun = 'phone'; return p; };

// Phone held in both hands in front of the chest (model-space rest coords; screen faces up toward the face).
const PHONE = { phone: { pos: [0.0, 0.405, 0.205], dir: [0, 0.45, -0.9], up: [0, 0.9, 0.45] } };
export function build(ctx) {
  const L = ctx.L;
  const tFab = wt(L[0], 'fabrican'), tFen = wt(L[0], 'fentanilo'), tAsia = wt(L[0], 'asia'), tCob = wt(L[0], 'cobran'), tPiso = wt(L[0], 'piso'), tRob = wt(L[0], 'roban'),
    tTraf = wt(L[0], 'trafican'), tExt = wt(L[0], 'extorsionan'), tLim = wt(L[0], 'limon');
  const tAlc = wt(L[1], 'alcanzo'), tDec = wt(L[1], 'decada'), tOnce = wt(L[1], 'once');
  const tSci = wt(L[2], 'science'), t175 = wt(L[2], 'ciento'), tNec = wt(L[2], 'necesita'), tJov = wt(L[2], 'jovenes'), tSem = wt(L[2], 'semana');

  // ---- 1. Clandestine fentanyl lab in the sierra
  const Lb = S.labCamp('overcast');
  const cooks = [K.person(Lb, 'doto', 'cook', -1.6, -2.45, 0.1), K.person(Lb, 'helios', 'cook', 1.6, -1.85, -0.25)];
  const pl = N.pills(60, '#5aa8e8', 4); pl.position.set(1.15, 0.83 * 0.65 + 0.005, -0.9); pl.rotation.y = -0.2; Lb.add(pl);
  // ---- 2. A corner shop paying "derecho de piso"
  const Sh = S.shopStreet('day');
  const keeper = K.person(Sh, 'mcqueen', 'shopkeeper', 0.35, -1.35, 0.15);
  const sic = [K.person(Sh, 'tamamo', 'sicario', -0.35, 0.75, Math.PI + 0.3), K.person(Sh, 'daiwa', 'sicario', 0.75, 1.0, Math.PI - 0.3)];
  const truck = N.pickup('#18191c'); truck.position.set(-2.6, 0, 3.6); truck.rotation.y = Math.PI / 2; Sh.add(truck);
  // ---- 3. Lime growers in Michoacán
  const Or = S.orchard('golden');
  const farmers = [K.person(Or, 'oguri', 'farmer', 0.2, 1.0, 0.35), K.person(Or, 'suzuka', 'farmer', -0.9, 0.5, 0.6)];
  // ---- 4. Bus stop: teenagers scrolling job ads
  const B = S.busStop('day');
  const scr = N.canvasTex(64, 128, (x, W, H) => { x.fillStyle = '#e9eef6'; x.fillRect(0, 0, W, H); x.fillStyle = '#2a3a52'; x.fillRect(0, 0, W, 22); x.fillStyle = '#1f8a4a'; x.fillRect(8, 40, W - 16, 10); x.fillStyle = '#9aa4b2'; for (let i = 0; i < 4; i++) x.fillRect(8, 62 + i * 14, W - 16 - (i % 2) * 14, 6); });
  const handPhone = () => { const p = N.phone(scr); p.scale.setScalar(0.9); return p; };
  const kids = [[-4.4, 1.3, 'cafe'], [-4.5, 2.5, 'oguri'], [-4.1, 3.6, 'suzuka'], [-3.6, 0.3, 'doto']].map(([x, z, w], i) => {
    const r = K.person(B, w, 'joven', x, z, Math.PI / 2 + (i - 1.5) * 0.15); if (i !== 3) r.equip(handPhone(), PHONE); return r; });

  const sfx = [{ t: 0.0, type: 'bubbling', dur: tCob - 0.3, vol: 0.35 }, { t: tFen, type: 'pop', vol: 0.4 },
    { t: tCob - 0.35, type: 'whoosh', vol: 0.35 }, { t: tPiso, type: 'pop', vol: 0.4 }, { t: tRob, type: 'pop', vol: 0.4 }, { t: tTraf, type: 'pop', vol: 0.4 }, { t: tExt, type: 'pop', vol: 0.4 },
    { t: tExt - 0.4, type: 'birds', dur: 3.2, vol: 0.3 },
    { t: L[1].t0 - 0.3, type: 'shutter', vol: 0.55 }, { t: tOnce - 0.1, type: 'hit', vol: 0.5 },
    { t: L[2].t0 - 0.35, type: 'traffic', dur: ctx.dur - L[2].t0 + 0.35, vol: 0.35 }, { t: t175, type: 'hit', vol: 0.45 }, { t: tNec + 0.3, type: 'notify', vol: 0.45 }];

  const tB = tCob - 0.3, tC = tExt - 0.3, tD = L[1].t0 - 0.3, tE = L[2].t0 - 0.35, tF = tNec - 0.2;
  const ICONS = [['💊', 'Fentanilo', tFen], ['🏪', 'Derecho de piso', tPiso], ['⛽', 'Robo de combustible', tRob], ['🚶', 'Tráfico de personas', tTraf], ['🍋', 'Extorsión al campo', tExt]];
  const icons = t => U.icons(t, tFen - 0.2, tD, ICONS, { y: 790 });
  const shop = (t) => {
    K.pose(keeper, { ...MA.humble(t, 1), head: [-6, 0, 0] }); keeper.setFace(C.blinkEye(t, 1), 'frown');
    K.pose(sic[0], { ...C.point(t, 2, 0), head: [0, 0, 0] }); sic[0].setFace(C.blinkEye(t, 2), 'frown');
    K.pose(sic[1], C.idle(t, 3, 0.3)); sic[1].setFace(C.blinkEye(t, 3), 'frown');
  };
  const shots = [
    { t0: 0, set: Lb, p0: [2.7, 1.3, 3.3], l0: [-0.2, 0.7, -1.7], p1: [2.3, 1.22, 2.8], l1: [-0.2, 0.7, -1.7], fov0: 40, act: (t) => {
      cooks.forEach((c, i) => { K.pose(c, stir(t, i)); c.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.badge(t, 'Laboratorio clandestino', 'Fentanilo', 'Con precursores químicos traídos de Asia', tFab - 0.1, tB) + icons(t);
    } },
    { t0: tB, set: Sh, p0: [2.3, 1.3, 4.3], l0: [0.1, 0.75, -0.5], p1: [2.0, 1.25, 3.7], l1: [0.1, 0.75, -0.5], fov0: 40, act: (t) => {
      Sh.shop.shutter.visible = false; [keeper, ...sic].forEach(p => (p.root.visible = true)); shop(t);
      return U.film(t) + U.badge(t, 'Derecho de piso', 'La “cuota”', 'Pagar para que no te hagan daño', tPiso - 0.2, tC) + icons(t);
    } },
    { t0: tC, set: Or, p0: [2.1, 0.92, 3.7], l0: [-0.2, 0.78, 0.2], p1: [1.8, 0.9, 3.2], l1: [-0.2, 0.78, 0.2], fov0: 40, act: (t) => {
      farmers.forEach((f, i) => { K.pose(f, { ...MA.sad(t, 4 + i), head: [6, 0, 0] }); f.setFace(C.blinkEye(t, 4 + i), 'frown'); });
      return U.film(t) + U.badge(t, 'Michoacán', 'Limón y aguacate', 'Productores obligados a pagar por cada caja', tLim - 0.3, tD) + icons(t);
    } },
    { t0: tD, set: Sh, p0: [0.2, 1.5, 7.6], l0: [-0.4, 1.5, 0], p1: [0.1, 1.5, 6.6], l1: [-0.4, 1.5, 0], fov0: 44, act: (t) => {
      Sh.shop.shutter.visible = true; [keeper, ...sic].forEach(p => (p.root.visible = false));
      return U.film(t) + `<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,10,16,.65) 0%,rgba(8,10,16,0) 50%)"></div>`
        + U.badge(t, '2025', 'Extorsión récord', 'El nivel más alto en una década', tAlc - 0.2, tE)
        + U.counter(t, tOnce - 0.2, tE, 110, 300, 11081, 'víctimas de extorsión denunciadas en 2025', { from: 6000, dur: 1.1, color: '#ffb35a', w: 600 })
        + U.source(t, tOnce, tE, 'SESNSP (víctimas reportadas en carpetas de investigación) · la mayoría no denuncia');
    } },
    { t0: tE, set: B, p0: [-1.2, 1.2, 4.7], l0: [-4.4, 0.8, 1.9], p1: [-1.6, 1.15, 4.3], l1: [-4.4, 0.8, 1.9], fov0: 40, act: (t) => {
      kids.forEach((k, i) => { K.pose(k, i === 3 ? C.idle(t, 7, 0.4) : onPhone(t, 5 + i)); k.setFace(C.blinkEye(t, 5 + i), 'neutral'); });
      return U.film(t) + `<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,10,16,0) 45%,rgba(8,10,16,.55) 75%)"></div>`
        + U.counter(t, t175 - 0.2, tF, 1180, 240, 175000, 'integrantes del crimen organizado (estimación)', { from: 50000, dur: 1.4, color: '#ffffff', prefix: '≈', w: 640 })
        + U.source(t, tSci, ctx.dur + 1, 'Prieto-Curiel et al., Science (2023)');
    } },
    { t0: tF, set: B, p0: [-2.55, 0.95, 2.75], l0: [-4.45, 0.72, 1.75], p1: [-2.75, 0.93, 2.6], l1: [-4.45, 0.72, 1.75], fov0: 40, act: (t) => {
      kids.forEach((k, i) => { K.pose(k, i === 3 ? C.idle(t, 7, 0.4) : onPhone(t, 5 + i)); k.setFace(C.blinkEye(t, 5 + i), 'neutral'); });
      return U.film(t) + U.phoneAd(t, tF + 0.1, ctx.dur + 1, { x: 1300, y: 140 })
        + U.counter(t, tJov - 0.3, ctx.dur + 1, 110, 170, 350, 'nuevos reclutas por semana para no perder fuerza', { from: 0, dur: 1.0, color: '#ffb35a', prefix: '≈', w: 600 })
        + U.source(t, tSci, ctx.dur + 1, 'Prieto-Curiel et al., Science (2023) · anuncio ilustrativo');
    } },
  ];
  const inst = { scene: Lb, scenes: [Lb, Sh, Or, B], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
