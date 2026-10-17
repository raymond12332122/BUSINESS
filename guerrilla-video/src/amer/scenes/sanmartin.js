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
import { animateHorse } from '../../napo/horse.js';

export { preload } from '../amap.js';
const fade = AM.fade;
const CARD = (t, who, a, b, o = {}) => U.cast(t, a, b, ...K.CARD[who], o);

export function build(ctx) {
  const L = ctx.L;
  const tRio = wt(L[0], 'rio'), tDec = wt(L[0], 'declaro'), tTuc = wt(L[0], 'tucuman'), tMen = wt(L[0], 'mendoza'), tSM = wt(L[0], 'jose'), tEje = wt(L[0], 'ejercito');
  const tCru = wt(L[1], 'cruzo'), tCin = wt(L[1], 'cinco'), tDie = wt(L[1], 'diez'), tMul = wt(L[1], 'mulas'), tVen = wt(L[1], 'vencio'), tCha = wt(L[1], 'chacabuco'), tChi = wt(L[1], 'chile'), tPro = wt(L[1], 'proclamo');
  const tMar = wt(L[2], 'mar'), tPer = wt(L[2], 'peru'), tLim = wt(L[2], 'lima'), tGua = wt(L[2], 'guayaquil'), tSec = wt(L[2], 'secreto'), tRet = wt(L[2], 'retiro');
  const tB = tMen - 0.3, tC = L[1].t0 - 0.3, tD = tVen - 0.3, tE = L[2].t0 - 0.3, tF = tGua - 0.4;

  // ---- map of the southern cone
  const Mp = AM.americasMap({ period: 1810 });
  const [sx, , sz] = AM.apos(-66, -26);
  const pTuc = AM.pulse(Mp, -65.22, -26.82, '#74acdf', 2.0);
  const cross = AM.arrow(Mp, [[-68.83, -32.89], [-70.0, -32.8], [-70.68, -33.0]], '#74acdf', 0.7);
  const sail = AM.arrow(Mp, [[-71.62, -33.05], [-73.5, -28], [-75.5, -20], [-76.6, -14], [-77.15, -12.06]], '#2a4fa0', 0.9);
  // ---- Mendoza camp
  const Me = S.sierra('golden', { ground: ['#b8a07a', '#a89070'], height: 1.4, pines: false, seed: 1011 });
  const sm = K.role(Me, 'sanmartin', 0, 0.4, 0.2);
  const gran = K.crowd(Me, 'granadero', 10, [-4.6, -3.8, 4.6, -1.4], { seed: 101, yaw: 0 });
  const fA = P.banner('andes', { h: 3, w: 1.3, fh: 0.85 }); fA.position.set(-1.6, 0, -0.4); Me.add(fA);
  // ---- crossing the Andes
  const An = S.andes('alpine', { seed: 1021, snowing: false });   // Jan-Feb 1817: summer in the passes, clear and bitterly cold
  { const dl = An.userData.sun; dl.position.set(10, 9, -10); dl.userData.off = dl.position.clone(); }   // sun from the right of the view: the peaks get a lit and a shaded face
  const sm2 = K.role(An, 'sanmartin', 0.7, 0.4, Math.PI / 2 - 0.15);
  const marchers = [...Array(8)].map((_, i) => K.blobShadow(K.person(An, ['oguri', 'tamamo', 'cafe', 'doto', 'helios', 'spe', 'hishi', 'suzuka'][i], i % 3 ? 'granadero' : 'patriota', -0.6 - i * 1.15, 0.2 + (i % 2) * 0.5, Math.PI / 2)));
  const mules = [...Array(5)].map((_, i) => { const m = P.mule(i); m.position.set(-1.4 - i * 2.2, 0, -0.9 - (i % 2) * 0.3); m.rotation.y = Math.PI / 2; m.userData.dynamic = true; An.add(m); return m; });
  // ---- Chile: O'Higgins and the embrace of Maipú
  const Ch = S.battlefield('day', { ground: ['#8a9a5a', '#7a8a50'], mountains: 1.4, snow: true, trees: 16, seed: 1031 });
  const ohi = K.role(Ch, 'ohiggins', -0.45, 0.2, 0.6), sm3 = K.role(Ch, 'sanmartin', 0.6, 0.0, -0.6);
  const fC = P.banner('chile', { h: 3, w: 1.3, fh: 0.85 }); fC.position.set(-1.6, 0, -0.8); Ch.add(fC);
  const pat = K.crowd(Ch, ['patriota', 'granadero'], 10, [-4.6, -4.4, 4.6, -2.0], { seed: 102, yaw: 0 });
  // ---- Guayaquil, July 1822: behind closed doors
  const Gq = S.hall({ wall: '#e8dcc0', cloth: '#5a2a2a', floor: '#6a4a30' });
  const bo = K.role(Gq, 'bolivar', -0.75, -1.2, 0.7), su = K.role(Gq, 'sanmartin', 0.75, -1.2, -0.7);

  const sfx = [{ t: 0.2, type: 'whoosh', vol: 0.3 }, { t: tTuc, type: 'bell', vol: 0.35 }, { t: tB, type: 'march', dur: tC - tB, vol: 0.25 }, { t: tC, type: 'wind', dur: tD - tC, vol: 0.45 },
    { t: tC + 0.3, type: 'hooves', dur: tD - tC - 0.3, vol: 0.3 }, { t: tD, type: 'fanfare', vol: 0.3 }, { t: tChi, type: 'crowd', dur: 2.6, vol: 0.3 }, { t: tE, type: 'waves', dur: tF - tE, vol: 0.3 },
    { t: tLim, type: 'bell', vol: 0.35 }, { t: tF, type: 'clock', dur: tRet - tF, vol: 0.25 }, { t: tSec, type: 'door', vol: 0.45 }, { t: tRet + 0.3, type: 'steps', dur: 1.6, vol: 0.35 }];

  const shots = [
    { t0: 0, set: Mp, p0: [sx, 120, sz + 46], l0: [sx, 0, sz], p1: [sx, 108, sz + 40], l1: [sx, 0, sz], fov0: 40, act: (t) => {
      Mp.paint(1810); Mp.zoom(1.6); Mp.tint('arg', '#74acdf', ss(tDec - 0.2, tDec + 0.4, t), 0.7); pTuc.update(t, tTuc - 0.1);
      return U.film(t) + U.indep(t, tTuc - 0.3, tB + 0.3, 'Provincias Unidas', '9 de julio de 1816', 'Congreso de Tucumán (hoy Argentina)', ['#74acdf', '#f4f1ea', '#74acdf'], { x: 1500, y: 150 })
        + AM.chip(ctx, -65.22, -26.82, fade(t, tTuc - 0.1, tB + 0.3), 'Tucumán', '', '#74acdf', 1.2);
    } },
    { t0: tB, set: Me, p0: [0.9, 1.5, 3.6], l0: [0, 1.15, -0.5], p1: [0.6, 1.45, 3.0], l1: [0, 1.15, -0.5], fov0: 42, act: (t) => {
      fA.wave(t); K.pose(sm, A.proud(t, 1)); sm.setFace(C.blinkEye(t, 1), 'neutral'); gran.forEach((c, i) => K.pose(c, i % 4 ? A.guard(t, i) : C.salute(t, i)));
      return U.film(t) + CARD(t, 'sanmartin', tSM - 0.4, tC + 0.2, { side: 'l' }) + U.pin(ctx, [-1.6, 3.2, -0.4], 'Ejército de los Andes', 'Mendoza', fade(t, tEje - 0.2, tC + 0.2), '#74acdf');
    } },
    { t0: tC, set: An, p0: [5.6, 1.75, 4.8], l0: [-0.6, 1.0, 0.0], p1: [6.2, 1.7, 4.4], l1: [0.4, 1.0, 0.0], fov0: 44, act: (t) => {
      const dx = (t - tC) * 0.55;
      sm2.root.position.x = 0.7 + dx; K.pose(sm2, C.walk(t, 0.4, 1)); sm2.setFace(C.blinkEye(t, 1), 'neutral');
      marchers.forEach((c, i) => { c.root.position.x = -0.6 - i * 1.15 + dx; const p = C.walk(t, 0.4, i); const cd = A.cold(t, i); p.armL = cd.armL; p.armR = cd.armR; p.elbL = cd.elbL; p.elbR = cd.elbR; K.pose(c, p); });
      mules.forEach((m, i) => { m.position.x = -1.4 - i * 2.2 + dx; animateHorse(m, t, 'walk', { speed: 0.6, seed: i }); });
      return U.film(t) + U.counter(t, tCin - 0.3, tD + 0.2, 1500, 120, 5000, 'hombres', { from: 0, dur: 0.9, color: '#ffffff', prefix: '≈ ', w: 360 })
        + U.counter(t, tDie - 0.3, tD + 0.2, 1500, 300, 10000, 'mulas', { from: 0, dur: 0.9, color: '#ffcf6a', prefix: '≈ ', w: 360 })
        + U.badge(t, 'Enero-febrero de 1817', 'El cruce de los Andes', 'Pasos de más de 3.500 m de altura', tC + 0.2, tCin - 0.4);
    } },
    { t0: tD, set: Ch, p0: [0.4, 1.45, 3.4], l0: [0, 1.0, -0.2], p1: [0.3, 1.4, 2.8], l1: [0, 1.0, -0.2], fov0: 42, act: (t) => {
      fC.wave(t); const hug = ss(tChi - 0.4, tChi + 0.2, t);
      K.pose(ohi, hug > 0 ? A.embrace(t, 1, hug) : C.cheer(t, 1)); ohi.setFace(hug > 0.5 ? 'happy' : C.blinkEye(t, 1), 'smile');
      K.pose(sm3, A.embrace(t, 2, hug)); sm3.setFace(C.blinkEye(t, 2), hug > 0.5 ? 'smile' : 'neutral');
      ohi.root.position.x = -0.45 + 0.3 * hug; sm3.root.position.x = 0.6 - 0.25 * hug;
      pat.forEach((c, i) => K.pose(c, t > tChi ? C.cheer(t, i) : A.guard(t, i)));
      return U.film(t) + U.badge(t, '12 de febrero de 1817', 'Chacabuco', 'Victoria patriota', tD + 0.2, tChi - 0.3)
        + U.indep(t, tChi - 0.2, tE + 0.3, 'Chile', '12 de febrero de 1818', 'Bernardo O\'Higgins, director supremo', ['#0039a6', '#f4f1ea', '#d52b1e'], { x: 1500, y: 140 })
        + CARD(t, 'ohiggins', tChi - 0.4, tE + 0.3, { side: 'l' }) + U.bubble(ctx, [-0.3, 1.3, 0.2], '¡Agemasen! ¡Chile no se devuelve!', fade(t, tPro, tE), { size: 24 });
    } },
    { t0: tE, set: Mp, p0: [sx - 4, 150, sz + 40], l0: [sx - 4, 0, sz - 14], p1: [sx - 4, 140, sz + 34], l1: [sx - 4, 0, sz - 14], fov0: 40, act: (t) => {
      Mp.paint(1810); Mp.zoom(1.8); cross.set(1); sail.set(ss(tMar - 0.3, tPer + 0.4, t)); Mp.tint('per', '#c8102e', ss(tLim - 0.2, tLim + 0.3, t), 0.5);
      return U.film(t) + AM.chip(ctx, -71.62, -33.05, fade(t, tE + 0.1, tF + 0.3), 'Valparaíso', 'zarpa en 1820', '#2a4fa0', 1.2)
        + U.indep(t, tLim - 0.2, tF + 0.3, 'Perú', '28 de julio de 1821', 'Proclamada por San Martín en Lima', ['#c8102e', '#f4f1ea', '#c8102e'], { x: 1500, y: 150 });
    } },
    { t0: tF, set: Gq, p0: [0, 1.5, 2.8], l0: [0, 1.15, -1.2], p1: [0, 1.45, 2.4], l1: [0, 1.15, -1.2], fov0: 42, act: (t) => {
      const go = ss(tRet, tRet + 1.4, t);
      K.pose(bo, A.talk(t, 1)); bo.setFace(C.blinkEye(t, 1), go > 0.2 ? 'neutral' : 'open');
      su.root.rotation.y = -0.7 + 2.2 * ss(tRet - 0.2, tRet + 0.3, t); su.root.position.x = 0.75 + 2.6 * go;
      K.pose(su, go > 0 ? C.walk(t, 0.4, 2) : C.idle(t, 2)); su.setFace(C.blinkEye(t, 2, 'flat'), 'neutral');
      return U.film(t) + U.badge(t, 'Guayaquil, 26-27 de julio de 1822', 'Reunión a puerta cerrada', 'No hubo testigos: nadie sabe qué se dijeron', tF + 0.2, ctx.dur + 1)
        + U.bubble(ctx, [0.75 + 2.6 * go, 1.7, -1.2], '…', fade(t, tRet - 0.2, ctx.dur + 1), { size: 30 });
    } },
  ];
  const inst = { scene: Mp, scenes: [Mp, Me, An, Ch, Gq], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
