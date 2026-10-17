import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as LP from '../../lib/props.js';
import * as F from '../../lib/fx.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as A from '../anim.js';
import * as AM from '../amap.js';
import * as P from '../props.js';
import * as N from '../../napo/props.js';
import * as RP from '../../rusia/props.js';

export { preload } from '../amap.js';
const fade = AM.fade;
const CARD = (t, who, a, b, o = {}) => U.cast(t, a, b, ...K.CARD[who], o);

export function build(ctx) {
  const L = ctx.L;
  const tChi = wt(L[0], 'chispa'), tImp = wt(L[0], 'impuestos'), tRep = wt(L[0], 'representacion'), tBos = wt(L[0], 'boston'), tTir = wt(L[0], 'tiraron'), tCof = wt(L[0], 'cofres');
  const tEst = wt(L[1], 'estallo'), tCua = wt(L[1], 'cuatro'), tApr = wt(L[1], 'aprobaron'), tRed = wt(L[1], 'redactada'), tJef = wt(L[1], 'thomas');
  const tWas = wt(L[2], 'george'), tAyu = wt(L[2], 'ayuda'), tFra = wt(L[2], 'francia'), tEsp = wt(L[2], 'espana'), tVen = wt(L[2], 'vencio'), tYor = wt(L[2], 'york'), tDos = wt(L[2], 'dos'), tRec = wt(L[2], 'reconocio');
  const tB = tBos - 0.4, tC = L[1].t0 - 0.3, tD = tCua - 0.4, tE = L[2].t0 - 0.3, tF = tAyu - 0.3, tG = tYor + 0.5;

  // ---- London: George III and his tea
  const Ld = S.palace();
  const king = K.role(Ld, 'jorge3', 0, -4.42, 0); K.pose(king, A.sitTea(0, 1, 0)); K.seatAt(king, 0.36 + 0.61);
  // cup and saucer live in the king's model space and are set at her wrists every frame: they stay level, and the cup
  // tips toward her lips on each sip (the hands reach them by IK: targets in rest model space, mouth at y≈1.16)
  const cup = P.cupOnly(), sau = P.saucer(); king.root.add(cup, sau);
  const _iv = new THREE.Matrix4(), _w = new THREE.Vector3(), CUP_OFF = new THREE.Vector3(0.05, 0, 0.04), SAU_OFF = new THREE.Vector3(-0.04, 0.02, 0.05);
  const teaPose = (t, k) => {
    const p = A.sitTea(t, 1, k); p.ikR = [-0.03 - 0.005 * k, 0.95 + 0.145 * k, 0.17 - 0.04 * k]; p.ikL = [0.07, 0.91, 0.17]; K.pose(king, p);
    king.root.updateMatrixWorld(true); _iv.copy(king.root.matrixWorld).invert();
    cup.position.copy(king.j.wriR.bone.getWorldPosition(_w).applyMatrix4(_iv)).add(CUP_OFF); cup.rotation.set(-0.45 * k, 0, 0);
    sau.position.copy(king.j.wriL.bone.getWorldPosition(_w).applyMatrix4(_iv)).add(SAU_OFF);
  };
  teaPose(0, 0);
  const guards = [['suzuka', -2.9], ['oguri', 2.9]].map(([w, x]) => K.person(Ld, w, 'casaca', x, -2.1, 0));
  // ---- Boston harbour, 16 Dec 1773
  const Bo = S.harbor({ light: 'night', ships: 1 });
  // Griffin's Wharf at night: Boston houses with lit windows behind the wharf, and a cool moonlight fill from the water
  { const rnd = LP.rng(77), lit = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.45, 1.0, 0.5) });
    for (let i = 0; i < 6; i++) {
      const w = 3.2 + (i % 2) * 0.6, h = 4.4 + ((i * 7) % 3) * 0.5;
      const th = N.townhouseFR(w, h, ['#8a4a3a', '#6a5a4a', '#9a5a44', '#5a4a40', '#7a3a30', '#8a6a52'][i], i + 60); th.position.set(-10.5 + i * 4.1, 0, -2.2); th.rotation.y = Math.PI; Bo.add(th);
      for (let f = 0; f < 3; f++) for (let k = 0; k < Math.floor(w / 0.9); k++) if (rnd() < 0.45) { const q = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.76), lit); q.position.set(-w / 2 + 0.5 + k * 0.9, 0.9 + f * 1.2, 1.34); th.add(q); }
    }
    const fill = new THREE.PointLight('#9fb4ff', 5, 12, 1.3); fill.position.set(1.0, 2.6, -14.2); Bo.add(fill); }
  const thrower = [['spe', -3.0], ['tamamo', -1.6], ['golshiC', -0.2], ['oguri', 1.2], ['doto', 2.6]].map(([w, x], i) => { const c = w === 'golshiC' ? K.role(Bo, 'golshiC', x, -10.8, Math.PI) : K.person(Bo, w, 'colono', x, -10.8, Math.PI); c.root.position.y = 0.73; return c; });
  const chests = thrower.map((c, i) => { const ch = P.teaChest(i); ch.userData.dynamic = true; Bo.add(ch); return ch; });
  const splash = thrower.map(() => { const r = F.ring('#e8f2ff', 0.4); r.rotation.x = -Math.PI / 2; r.userData.dynamic = true; Bo.add(r); return r; });
  for (let i = 0; i < 6; i++) { const ch = P.teaChest(i + 3); ch.position.set(-4 + i * 1.6, 0.73, -9.6 + (i % 2) * 0.4); Bo.add(ch); }
  // ---- Lexington green, April 1775
  const Lx = S.village('sunrise');
  const mil = K.crowd(Lx, 'miliciano', 6, [-4.4, -3.6, -1.2, -1.6], { seed: 31, yaw: Math.PI / 2 - 0.65, yawJ: 0.1 });
  const red = K.crowd(Lx, 'casaca', 6, [1.4, -3.6, 4.6, -1.6], { seed: 32, yaw: -Math.PI / 2 + 0.65, yawJ: 0.1 });
  const vRed = P.volleySmoke(Lx, red.map(c => c.root.position.clone().add(new THREE.Vector3(-0.45, 0.55, 0.05)))), vMil = P.volleySmoke(Lx, mil.map(c => c.root.position.clone().add(new THREE.Vector3(0.45, 0.55, 0.05))));
  // ---- the Assembly Room, Philadelphia
  const Hl = S.hall({ wall: '#a9b49a', cloth: '#2f5a3a' });
  const jef = K.role(Hl, 'jefferson', -0.55, -1.2, 0.15), fra = K.role(Hl, 'franklin', 0.65, -1.3, -0.35);
  const decl = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.66), new THREE.MeshStandardMaterial({ color: '#efe6cc', roughness: 0.9 })); decl.rotation.x = -Math.PI / 2 + 0.1; decl.position.set(0, 0.83, -2.0); Hl.add(decl);
  K.hold(fra, K.quill(), 'R', [0, 0.02, 0.03], [20, 0, 0], 0.45);
  // ---- Yorktown, 19 Oct 1781
  const Yt = S.battlefield('golden', { earthworks: true, smoke: true, seed: 441 });
  const was = K.role(Yt, 'washington', -1.2, 0.6, 0.35), laf = K.role(Yt, 'lafayette', -2.3, 0.9, 0.5);
  const cont = K.crowd(Yt, ['continental', 'continental', 'frances'], 9, [-5.4, -1.4, -2.6, 0.6], { seed: 41, yaw: 0.9, yawJ: 0.15 });
  const brit = K.crowd(Yt, 'casaca', 8, [0.8, -3.6, 4.8, -1.6], { seed: 42, yaw: -0.5, yawJ: 0.15 });
  const usf = P.banner('usa', { h: 3, w: 1.3, fh: 0.85 }); usf.position.set(-3.6, 0, -1.2); Yt.add(usf);
  const frf = P.banner('bourbon', { h: 3, w: 1.3, fh: 0.85 }); frf.position.set(-5.2, 0, -0.6); Yt.add(frf);
  // ---- map: help from France and Spain
  const Mp = AM.americasMap({ period: 1775 });
  const aFra = AM.arrow(Mp, [[-30, 37], [-50, 36], [-66, 37], [-75.5, 37.2]], '#2a4fa0', 1.6), aEsp = AM.arrow(Mp, [[-82.4, 23.1], [-85, 26.5], [-87.2, 30.3]], '#c9a227', 1.3);
  const pYor = AM.pulse(Mp, -76.5, 37.2, '#c0392b', 2.2), pPen = AM.pulse(Mp, -87.2, 30.4, '#c9a227', 2.0);
  const [yx, , yz] = AM.apos(-80, 33);

  const sfx = [{ t: 0.2, type: 'harpsichord', dur: tB, vol: 0.2 }, { t: tImp, type: 'stamp', vol: 0.4 }, { t: tB, type: 'waves', dur: tC - tB, vol: 0.35 }, { t: tB + 0.2, type: 'crowd', dur: tC - tB - 0.2, vol: 0.2 },
    ...[0, 1, 2, 3, 4].flatMap(i => [0, 1.7, 3.4].map(k => ({ t: tTir - 0.6 + i * 0.33 + k + 0.75, type: 'splash', vol: 0.3 }))).filter(e => e.t < tC),
    { t: tC, type: 'drum', dur: 1.2, vol: 0.35 }, { t: tEst + 0.1, type: 'volley', vol: 0.5 }, { t: tEst + 1.1, type: 'volley', vol: 0.45 },
    { t: tD, type: 'quill', dur: 1.6, vol: 0.35 }, { t: tApr, type: 'bell', vol: 0.35 }, { t: tE, type: 'drum', dur: 2.0, vol: 0.3 }, { t: tF, type: 'whoosh', vol: 0.3 },
    { t: tFra, type: 'pop', vol: 0.35 }, { t: tEsp, type: 'pop', vol: 0.35 }, { t: tG, type: 'fanfare', vol: 0.35 }, { t: tRec, type: 'sting2', vol: 0.35 }];

  const throwU = (t, i) => { const T = 1.7, ph = t - (tTir - 0.6) - i * 0.33; return ph < 0 ? -1 : (ph % T) / T; };
  const londonAct = (t) => {
    const u = (t * 0.35) % 1, sipK = ss(0.15, 0.35, u) * (1 - ss(0.6, 0.8, u));   // a slow sip every ~3 s
    teaPose(t, sipK); king.setFace(C.blinkEye(t, 1, sipK > 0.7 ? 'closed' : 'open'), sipK > 0.7 ? 'smile' : 'neutral');
    guards.forEach((g, i) => { K.pose(g, A.guard ? A.guard(t, i) : C.idle(t, i, 0.1)); g.setFace(C.blinkEye(t, i + 4), 'neutral'); });
    return U.film(t) + CARD(t, 'jorge3', 0.5, tB, { side: 'l' });
  };
  const shots = [
    // the throne room, then the king at her tea while the colonies protest
    { t0: 0, set: Ld, p0: [-5.2, 2.3, 6.4], l0: [1.2, 1.9, -3.4], p1: [-4.2, 2.1, 5.0], l1: [1.0, 1.8, -3.6], fov0: 44, act: (t) => londonAct(t) },
    { t0: 3.6, set: Ld, p0: [-1.5, 1.62, -0.9], l0: [0.25, 1.38, -4.2], p1: [-1.25, 1.58, -1.4], l1: [0.25, 1.36, -4.2], fov0: 34, act: (t) => londonAct(t)
      + U.quoteAt(t, [['Ningún impuesto', tImp - 0.2], ['sin representación', tRep - 0.2]], 'Lema de los colonos', tImp - 0.3, tB + 0.2, { left: 1080, top: 600, w: 760 }) },
    { t0: tB, set: Bo, p0: [2.6, 1.05, -15.4], l0: [-0.3, 1.45, -10.6], p1: [2.0, 1.1, -14.8], l1: [-0.3, 1.45, -10.6], fov0: 46, act: (t) => {   // from the water: the raiders face us as the chests come over
      Bo.sea.wave(t);
      thrower.forEach((c, i) => { const u = throwU(t, i); K.pose(c, u < 0 ? C.idle(t, i) : A.heave(t, u, i)); c.setFace(C.blinkEye(t, i), u > 0.5 && u < 0.9 ? 'open' : 'smile');
        const ch = chests[i], sp = splash[i]; ch.visible = u >= 0 && u < 0.98;
        if (u >= 0) { const v = clamp((u - 0.55) / 0.4); const x = c.root.position.x, y0 = 0.73 + 0.75 + 0.35 * ss(0, 0.5, u), z0 = -10.95;
          ch.position.set(x, y0 + 1.2 * v - 2.6 * v * v, z0 - 2.4 * v); ch.rotation.x = v * 4; }
        const su = u - 0.95; sp.visible = u >= 0.93 || (u >= 0 && u < 0.25 && t > tTir); const ph = u >= 0.93 ? (u - 0.93) / 0.32 : (u + 0.07) / 0.32;
        sp.position.set(c.root.position.x, 0.08, -13.4); sp.scale.setScalar(0.5 + 2.5 * ph); sp.material.opacity = 0.8 * (1 - ph); });
      const g = thrower[2]; const gp = g.root.position;
      return U.film(t) + U.datePage(t, tB + 0.2, tC + 0.2, 'Motín del té de Boston', 'DIC.', '16', '1773', { x: 1640, y: 90, accent: '#7a2a24', w: 250 })
        + U.counter(t, tCof - 0.5, tC + 0.2, 300, 120, 340, 'cofres de té al mar (o más)', { from: 0, dur: 1.2, color: '#ffcf6a', prefix: '+', w: 420 })
        + U.bubble(ctx, [gp.x, 2.75, gp.z], '¡Esto va por ti, McQueen!', fade(t, tB + 1.4, tC - 0.2), { size: 26 });
    } },
    { t0: tC, set: Lx, p0: [0, 1.5, 4.2], l0: [0, 0.8, -2.6], p1: [0, 1.45, 3.4], l1: [0, 0.8, -2.6], fov0: 46, act: (t) => {
      mil.forEach((c, i) => { K.pose(c, A.volley(t, tEst + 1.1, i, i % 2)); c.setFace(C.blinkEye(t, i), 'frown'); });
      red.forEach((c, i) => { K.pose(c, A.volley(t, tEst + 0.1, i + 7, 0)); c.setFace(C.blinkEye(t, i + 7), 'frown'); });
      vRed(t, tEst + 0.1, new THREE.Vector3(-1, 0, 0)); vMil(t, tEst + 1.1, new THREE.Vector3(1, 0, 0));
      return U.film(t) + U.badge(t, '19 de abril de 1775', 'Lexington y Concord', 'Milicianos contra casacas rojas', tC + 0.2, tD + 0.1);
    } },
    { t0: tD, set: Hl, p0: [0.1, 1.5, 2.6], l0: [0.05, 1.2, -1.2], p1: [0.1, 1.45, 2.1], l1: [0.05, 1.2, -1.2], fov0: 40, act: (t) => {
      K.pose(jef, A.present(t, 1)); jef.setFace(C.blinkEye(t, 1), t > tRed + 0.6 ? 'smile' : 'neutral');
      const p = C.point(t, 2, 20); p.armR = [-60, 10, 50]; p.elbR = [0, 60, 0]; K.pose(fra, p); fra.setFace(C.blinkEye(t, 2), 'grin');
      return U.film(t) + U.doc(t, tApr - 0.3, tE + 0.2, 'Declaración de Independencia', [['4 de julio de 1776', tApr - 0.2], ['«…todos los hombres son creados iguales…»', tRed - 0.2]], { left: 1240, top: 120, width: 600, foot: 'Filadelfia · Congreso Continental' })
        + CARD(t, 'jefferson', tJef - 0.5, tE + 0.2, { side: 'l', top: 470, w: 560 }) + CARD(t, 'franklin', tD + 0.1, tApr + 0.6, { side: 'l', top: 96, w: 560 });
    } },
    { t0: tE, set: Yt, p0: [-0.6, 1.75, 3.6], l0: [-1.4, 1.3, 0.2], p1: [-0.9, 1.7, 3.0], l1: [-1.4, 1.3, 0.2], fov0: 40, act: (t) => {
      Yt.tick && Yt.tick(t); usf.wave(t); frf.wave(t + 1);
      K.pose(was, A.swordUp(t, 1, 0.0)); was.setFace(C.blinkEye(t, 1), 'neutral'); K.pose(laf, A.fangirl(t, 2)); laf.setFace('happy', 'smile');
      cont.forEach((c, i) => K.pose(c, A.guard(t, i))); brit.forEach((c, i) => K.pose(c, A.guard(t, i + 9)));
      return U.film(t) + CARD(t, 'washington', tE + 0.2, tF + 0.1, { side: 'r' }) + U.bubble(ctx, [was.root.position.x, 1.95, was.root.position.z], '¡Tawake! ¡Firmes!', fade(t, tE + 0.8, tF - 0.2), { size: 26 });
    } },
    { t0: tF, set: Mp, p0: [yx + 8, 60, yz + 34], l0: [yx + 2, 0, yz], p1: [yx + 6, 54, yz + 30], l1: [yx + 2, 0, yz], fov0: 40, act: (t) => {
      Mp.paint(1775); Mp.zoom(0.9); aFra.set(ss(tFra - 0.2, tFra + 0.8, t)); aEsp.set(ss(tEsp - 0.2, tEsp + 0.6, t)); pYor.update(t, tFra + 0.6); pPen.update(t, tEsp + 0.4);
      return U.film(t) + AM.chip(ctx, -62, 37, fade(t, tFra - 0.1, ctx.dur + 1), 'Francia', 'aliada desde 1778: ejército y flota', '#2a4fa0', 0.6)
        + AM.chip(ctx, -87.2, 30.4, fade(t, tEsp - 0.1, ctx.dur + 1), 'España', 'Bernardo de Gálvez toma Pensacola (1781)', '#c9a227', 0.6)
        + CARD(t, 'galvez', tEsp - 0.3, tG + 0.2, { side: 'r', top: 560, w: 600 });
    } },
    { t0: tG, set: Yt, p0: [2.6, 1.3, 4.2], l0: [0.4, 0.75, -1.2], p1: [2.2, 1.26, 3.6], l1: [0.4, 0.75, -1.2], fov0: 42, act: (t) => {
      Yt.tick && Yt.tick(t); usf.wave(t); frf.wave(t + 1);
      K.pose(was, A.proud(t, 1)); was.setFace(C.blinkEye(t, 1), 'smile'); K.pose(laf, A.fangirl(t, 2)); laf.setFace('happy', 'smile');
      cont.forEach((c, i) => K.pose(c, i % 2 ? A.jubilant(t, i) : A.guard(t, i))); brit.forEach((c, i) => { const p = A.kneel(t, i + 9); p.head = [4, 6 * Math.sin(i * 1.7), 0]; K.pose(c, p); c.setFace(C.blinkEye(t, i + 9, 'flat'), 'frown'); });   // heads only slightly bowed so their glum faces read
      return U.film(t) + U.badge(t, '19 de octubre de 1781', 'Yorktown', 'Se rinden unos 8.000 británicos', tG + 0.2, tDos - 0.1)
        + CARD(t, 'lafayette', tG + 0.3, tDos + 0.2, { side: 'l' })
        + U.indep(t, tDos - 0.2, ctx.dur + 1, 'Estados Unidos', 'Declarada el 4 de julio de 1776', 'Gran Bretaña la reconoce en 1783 (Tratado de París)', ['#b22234', '#f4f1ea', '#2a2d62'], { x: 1500, y: 140 });
    } },
  ];
  const inst = { scene: Ld, scenes: [Ld, Bo, Lx, Hl, Yt, Mp], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
