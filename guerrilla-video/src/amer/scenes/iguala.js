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

export { preload } from '../amap.js';
const fade = AM.fade;
const CARD = (t, who, a, b, o = {}) => U.cast(t, a, b, ...K.CARD[who], o);

export function build(ctx) {
  const L = ctx.L;
  const tIns = wt(L[0], 'insurgencia'), tVen = wt(L[0], 'vencida'), tEnt = wt(L[0], 'entonces'), tAgu = wt(L[0], 'agustin'), tRea = wt(L[0], 'realista'), tGue0 = wt(L[0], 'guerrero'), tCam = wt(L[0], 'cambio');
  const tPro = wt(L[1], 'proclamo'), tPla = wt(L[1], 'plan'), tRel = wt(L[1], 'religion'), tInd = wt(L[1], 'independencia'), tUni = wt(L[1], 'union'), tGue = wt(L[1], 'guerrero'), tTra = wt(L[1], 'tradicion'), tAbr = wt(L[1], 'abrazaron');
  const tVei = wt(L[2], 'veintisiete'), tTri = wt(L[2], 'trigarante'), tEnt2 = wt(L[2], 'entro'), tSig = wt(L[2], 'siguiente'), tCor = wt(L[2], 'coronado'), tImp = wt(L[2], 'imperio'), tDur = wt(L[2], 'duro');
  const tB = tEnt - 0.3, tC = L[1].t0 - 0.3, tD = tGue - 0.4, tE = L[2].t0 - 0.3, tF = tSig - 0.3;

  // ---- map: the insurgency cornered in the south
  const Mp = AM.americasMap({ period: 1810 });
  const [mx, , mz] = AM.apos(-100.5, 20.5);
  const south = AM.zone(Mp, [[-101.8, 18.4], [-99.8, 18.6], [-98.4, 17.8], [-98.6, 16.9], [-100.6, 17.1], [-101.9, 17.6]], '#c0392b', { opacity: 0.55 });
  // ---- Iturbide and the royalist column
  const Ro = S.sierra('day', { ground: ['#a8946a', '#988460'], seed: 1111 });
  const itu = K.role(Ro, 'iturbide', 0, 0.4, 0.1);
  const roy = K.crowd(Ro, 'realista', 10, [-4.6, -4.0, 4.6, -1.4], { seed: 111, yaw: 0 });
  const fB = P.banner('burgundy', { h: 3, w: 1.3, fh: 0.85 }), fT = P.banner('trigarante', { h: 3, w: 1.3, fh: 0.85 }); for (const f of [fB, fT]) { f.position.set(-1.5, 0, -0.5); Ro.add(f); }
  // ---- Acatempan: the embrace
  const Ac = S.sierra('golden', { seed: 1121 });
  const itu2 = K.role(Ac, 'iturbide', 0.55, 0, -0.9), gue = K.role(Ac, 'guerrero', -0.55, 0, 0.9);
  const both = [...K.crowd(Ac, 'realista', 5, [2.0, -3.4, 4.8, -1.2], { seed: 112, yaw: -0.4 }), ...K.crowd(Ac, ['insurgenteF', 'insurgente'], 5, [-4.8, -3.4, -2.0, -1.2], { seed: 113, yaw: 0.4 })];
  // ---- 27 Sep 1821: the Army of the Three Guarantees enters Mexico City
  const Zo = S.plaza('day', { arcade: true, seed: 1131, flags: [['trigarante', -3.2, -6.5, 5], ['trigarante', 3.2, -6.5, 5]] });
  const col = [...Array(10)].map((_, i) => K.blobShadow(K.person(Zo, ['oguri', 'spe', 'hishi', 'tamamo', 'cafe', 'doto', 'helios', 'suzuka', 'mcqueen', 'daiwa'][i], 'trigarante', -1.2 + (i % 2) * 1.0, -1.0 - Math.floor(i / 2) * 1.2, 0)));
  const itu3 = K.role(Zo, 'iturbide', -0.2, 0.6, 0);
  const crowdZ = [...K.crowd(Zo, ['dama', 'criollo', 'indigena', 'insurgenteF'], 8, [-5.6, -6, -3.0, 1], { seed: 114, yaw: Math.PI / 2 }), ...K.crowd(Zo, ['criollo', 'dama', 'indigena', 'insurgenteF'], 8, [2.4, -6, 5.0, 1], { seed: 115, yaw: -Math.PI / 2 })];
  crowdZ.forEach((c, i) => K.freeze(c, C.cheer(0.3 + i * 0.17, i)));
  // ---- 21 Jul 1822: the coronation
  const Co = S.cathedral('mexEmp');
  const itu4 = K.role(Co, 'iturbide', 0, -5.3, 0); itu4.root.position.y = 0.36;
  const guests = K.crowd(Co, ['criollo', 'dama', 'peninsular', 'criollo'], 10, [-4, -3.8, 4, -1.2], { seed: 116, yaw: Math.PI });

  const sfx = [{ t: 0.2, type: 'whoosh', vol: 0.3 }, { t: tVen, type: 'hit', vol: 0.3 }, { t: tB, type: 'march', dur: tC - tB, vol: 0.28 }, { t: tCam - 0.1, type: 'sting2', vol: 0.4 },
    ...[tRel, tInd, tUni].map(x => ({ t: x, type: 'pop', vol: 0.35 })), { t: tD, type: 'swell', dur: 2, vol: 0.3 }, { t: tAbr, type: 'crowd', dur: 2, vol: 0.3 },
    { t: tE, type: 'fanfare', vol: 0.35 }, { t: tE + 0.2, type: 'march', dur: tF - tE - 0.2, vol: 0.32 }, { t: tE + 0.4, type: 'crowd', dur: tF - tE, vol: 0.35 }, { t: tEnt2, type: 'bell', vol: 0.4 },
    { t: tF, type: 'organ', dur: ctx.dur - tF, vol: 0.3 }, { t: tCor, type: 'applause', dur: 2.2, vol: 0.3 }, { t: tDur, type: 'hit', vol: 0.4 }];

  const shots = [
    { t0: 0, set: Mp, p0: [mx, 46, mz + 18], l0: [mx, 0, mz], p1: [mx, 40, mz + 15], l1: [mx, 0, mz], fov0: 42, act: (t) => {
      Mp.paint(1810); Mp.zoom(0.45); south.set(ss(tIns - 0.2, tIns + 0.5, t));
      return U.film(t) + U.badge(t, '1820', 'La insurgencia, casi vencida', 'Solo resistían guerrillas en las montañas del sur', 0.4, tB + 0.1)
        + AM.chip(ctx, -100.2, 17.6, fade(t, tVen - 0.2, tB + 0.3), 'Guerrero resiste', 'Sierra Madre del Sur', '#c0392b', 0.2);
    } },
    { t0: tB, set: Ro, p0: [0.8, 1.55, 3.6], l0: [0, 1.15, -0.4], p1: [0.6, 1.5, 3.0], l1: [0, 1.15, -0.4], fov0: 42, act: (t) => {
      const sw = ss(tCam - 0.1, tCam + 0.3, t); fB.visible = sw < 0.5; fT.visible = sw >= 0.5; fB.wave(t); fT.wave(t);
      K.pose(itu, sw > 0.5 ? A.diva(t, 1) : A.proud(t, 1)); itu.setFace(C.blinkEye(t, 1), sw > 0.5 ? 'grin' : 'neutral'); roy.forEach((c, i) => K.pose(c, A.guard(t, i)));
      return U.film(t) + CARD(t, 'iturbide', tAgu - 0.4, tC + 0.2, { side: 'l' }) + U.bubble(ctx, [0, 1.78, 0.4], '¡Ja, ja, ja! ¡Cambio de bando con estilo!', fade(t, tCam, tC), { size: 24 });
    } },
    { t0: tC, set: Ro, p0: [-1.2, 2.0, 1.9], l0: [-1.5, 2.85, -0.5], p1: [-1.0, 1.95, 1.5], l1: [-1.5, 2.85, -0.5], fov0: 40, act: (t) => {   // low angle: the new flag against the sky
      fT.visible = true; fB.visible = false; fT.wave(t); K.pose(itu, A.orate(t, 1)); roy.forEach((c, i) => K.pose(c, A.guard(t, i)));
      return U.film(t) + U.tiles(t, tPla - 0.3, tD + 0.2, [['⛪', 'Religión', tRel - 0.1], ['🦅', 'Independencia', tInd - 0.1], ['🤝', 'Unión', tUni - 0.1]], { top: 260, w: 300 })
        + U.badge(t, '24 de febrero de 1821', 'Plan de Iguala', 'Las tres garantías: bandera blanca, verde y roja', tPla - 0.3, tD + 0.1);
    } },
    { t0: tD, set: Ac, p0: [0, 1.5, 3.0], l0: [0, 1.15, 0], p1: [0, 1.45, 2.5], l1: [0, 1.15, 0], fov0: 42, act: (t) => {
      const k = ss(tAbr - 0.6, tAbr, t); K.pose(itu2, A.embrace(t, 1, k)); K.pose(gue, A.embrace(t, 2, k)); itu2.setFace(C.blinkEye(t, 1), 'smile'); gue.setFace(k > 0.5 ? 'happy' : 'open', k > 0.5 ? 'smile' : 'wavy');
      // they walk into each other's arms, turning to face one another
      itu2.root.position.x = 0.62 - 0.36 * k; gue.root.position.x = -0.62 + 0.36 * k; itu2.root.rotation.y = -0.9 - 0.55 * k; gue.root.rotation.y = 0.9 + 0.55 * k; both.forEach((c, i) => K.pose(c, k > 0.5 ? C.cheer(t, i) : A.guard(t, i)));
      return U.film(t) + U.badge(t, 'Acatempan, 1821', 'El abrazo', 'Según la tradición; algunos historiadores dudan que ocurriera', tD + 0.2, tE + 0.1)
        + U.bubble(ctx, [-0.4, 1.72, 0], '¡Opera O-san! (snif)', fade(t, tAbr, tE), { size: 24 });
    } },
    { t0: tE, set: Zo, p0: [0.4, 1.6, 6.0], l0: [-0.2, 1.0, -2.0], p1: [0.2, 1.55, 5.0], l1: [-0.2, 1.0, -2.0], fov0: 46, act: (t) => {
      Zo.flags.forEach((f, i) => f.wave(t + i)); const dz = (t - tE) * 0.45;
      col.forEach((c, i) => { c.root.position.z = -1.0 - Math.floor(i / 2) * 1.2 + dz; K.pose(c, A.march(t, i)); });
      itu3.root.position.z = 0.6 + dz; K.pose(itu3, C.walk(t, 0.45, 1)); itu3.setFace(C.blinkEye(t, 1), 'smile');
      return U.film(t) + U.datePage(t, tE + 0.2, tF + 0.2, 'Entrada del Ejército Trigarante', 'SEPT.', '27', '1821', { x: 1620, y: 90, accent: '#2f7a3a', w: 260 })
        + U.source(t, tEnt2, tF + 0.2, 'Al día siguiente se firmó el Acta de Independencia del Imperio Mexicano');
    } },
    { t0: tF, set: Co, p0: [0, 1.7, 0.4], l0: [0, 1.5, -6.0], p1: [0, 1.65, -0.8], l1: [0, 1.5, -6.0], fov0: 42, act: (t) => {
      K.pose(itu4, A.diva(t, 1)); itu4.setFace(C.blinkEye(t, 1), 'grin'); guests.forEach((c, i) => K.pose(c, t > tCor ? A.clap(t, i) : C.idle(t, i)));
      return U.film(t) + U.struck(t, tCor - 0.3, ctx.dur + 1, [['Imperio Mexicano · 1822–1823', tCor - 0.3, tDur + 0.1]], 0, { top: 110 })
        + U.card(t, tCor, ctx.dur + 1, 'AGUSTÍN I', 'Coronado el 21 de julio de 1822', 'Abdicó el 19 de marzo de 1823', { left: 1240, top: 300, width: 560, accent: '#d4af37' })
        + U.bubble(ctx, [0, 2.15, -5.3], '¡La Soberana más hermosa!', fade(t, tCor - 0.2, tDur), { size: 24 });
    } },
  ];
  const inst = { scene: Mp, scenes: [Mp, Ro, Ac, Zo, Co], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
