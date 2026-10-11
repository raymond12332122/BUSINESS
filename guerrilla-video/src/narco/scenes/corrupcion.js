import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as N from '../props.js';
import { runShots, wt } from '../../mx/shots.js';
import * as U from '../ui.js';

export { preload } from '../mapkit.js';

export function build(ctx) {
  const L = ctx.L;
  const tArr = wt(L[0], 'arriba'), tGL = wt(L[0], 'genaro'), tCond = wt(L[0], 'condenado'), tSob = wt(L[0], 'sobornos');
  const t14 = wt(L[1], 'dos'), tAyo = wt(L[1], 'ayotzinapa'), tPol = wt(L[1], 'policias');
  const tRed = wt(L[2], 'red'), tHua = wt(L[2], 'huachicol'), tMar = wt(L[2], 'marina'), tPart = wt(L[2], 'la$', 1);

  // ---- 1. Brooklyn federal court: Genaro García Luna
  const Ct = S.courtroom();
  const gl = K.person(Ct, 'garcialuna', 'garcialuna', 1.6, 0.05, Math.PI);
  const lawyer = K.person(Ct, 'mcqueen', 'official', 2.35, 0.1, Math.PI);
  const judge = K.person(Ct, 'judge', 'judge', 0, -4.45, 0); judge.root.position.y = 1.2;
  const pros = K.person(Ct, 'suzuka', 'official', -1.6, 0.05, Math.PI);
  const gallery = K.crowd(Ct, 'civil', 8, [-4, 2.4, 4, 3.6], { seed: 5, yaw: Math.PI });
  // ---- 2. Ayotzinapa: 43 empty desks
  const Me = S.memorial43();
  // ---- 3. Fuel smuggling at the port ("huachicol fiscal")
  const Pt = S.portNight();
  const mar = [0, 1, 2].map(i => K.person(Pt, ['helios', 'tamamo', 'doto'][i], 'marino', 1.6 + i * 1.1, 4.4 - i * 0.3, -0.5 + i * 0.15));
  const pat = N.patrol('marina', { night: false }); pat.position.set(-1.5, 0, 5.2); pat.rotation.y = 1.25; Pt.add(pat);

  const sfx = [{ t: 0.3, type: 'gavel', vol: 0.6 }, { t: tCond, type: 'gavel', vol: 0.8 }, { t: tCond + 0.1, type: 'stamp', vol: 0.6 },
    { t: L[1].t0 - 0.3, type: 'drone', dur: 9.5, vol: 0.4 }, { t: tAyo, type: 'bell', vol: 0.35 },
    { t: L[2].t0 - 0.3, type: 'harbor', dur: ctx.dur - L[2].t0, vol: 0.45 }, { t: tMar, type: 'siren', dur: 2.5, vol: 0.3 }, { t: tPart, type: 'sting', vol: 0.5 }];

  const tB = L[1].t0 - 0.3, tC = L[2].t0 - 0.3;
  function court(t) {
    K.pose(gl, { ...C.idle(t, 1, 0.3), head: [-4, 0, 0] }); gl.setFace(t > tCond ? 'flat' : C.blinkEye(t, 1), 'frown');
    K.pose(lawyer, C.idle(t, 2, 0.4)); lawyer.setFace(C.blinkEye(t, 2), 'neutral');
    K.pose(pros, C.idle(t, 3, 0.4)); pros.setFace(C.blinkEye(t, 3), 'neutral');
    K.pose(judge, { ...C.idle(t, 4, 0.2), head: [6, 0, 0] }); judge.setFace(C.blinkEye(t, 4), t > tCond - 0.3 && t < tCond + 1.5 ? C.talkMouth(t, 4) : 'neutral');
    gallery.forEach((g, i) => { K.pose(g, C.idle(t, i, 0.3)); g.setFace(C.blinkEye(t, i), 'neutral'); });
    return U.film(t) + U.badge(t, 'Nueva York · 2023 – 2024', 'El juicio de García Luna', 'Corte federal de Brooklyn', 0.4, tCond - 0.3)
      + U.nameplate(ctx, [1.6, 1.12, 0.05], 'Genaro García Luna', 'Secretario de Seguridad 2006–2012', tGL - 0.2, tCond - 0.5)
      + U.doc(t, tCond - 0.1, tB, 'Sentencia · octubre de 2024', [['38 años de prisión en Estados Unidos', tCond + 0.3], ['Por recibir sobornos del Cártel de Sinaloa', tSob - 0.2]], { left: 1150, top: 120, width: 640 })
      + U.stamp(t, 'CULPABLE', tCond, tB, { x: 1450, y: 560, rot: -8 });
  }
  const shots = [
    { t0: 0, set: Ct, p0: [0.6, 0.92, -2.0], l0: [1.85, 0.74, 0.1], p1: [0.8, 0.9, -1.7], l1: [1.85, 0.74, 0.1], fov0: 40, act: (t) => court(t) },
    { t0: tCond - 0.45, set: Ct, p0: [3.6, 2.2, 4.2], l0: [0.2, 1.35, -2.2], p1: [3.1, 2.0, 3.5], l1: [0.2, 1.4, -2.2], fov0: 40, act: (t) => court(t) },
    { t0: tB, set: Me, p0: [4.6, 2.3, 6.2], l0: [-0.4, 1.1, -5.0], p1: [3.8, 2.1, 4.9], l1: [-0.4, 1.15, -5.2], fov0: 40, act: (t) => {
      Me.candles.forEach(c => c.flicker(t));
      return U.film(t) + U.badge(t, '26 de septiembre de 2014', 'Ayotzinapa: los 43', 'Iguala, Guerrero', t14 - 0.1, tC)
        + U.source(t, tPol, tC, 'Policías municipales los entregaron a un grupo criminal, según las investigaciones');
    } },
    { t0: tC, set: Pt, p0: [5.8, 2.5, 10.8], l0: [-1.0, 1.7, -4], p1: [5.0, 2.3, 9.3], l1: [-1.0, 1.7, -4], fov0: 42, act: (t) => {
      mar.forEach((m, i) => { K.pose(m, { ...C.idle(t, i, 0.3), gun: 'port' }); m.setFace(C.blinkEye(t, i), 'neutral'); });
      pat.blink(t, t > tMar - 0.5 ? 1 : 0);
      return U.film(t) + U.badge(t, '2025', 'El "huachicol fiscal"', 'Contrabando de combustible en puertos y aduanas', tRed - 0.1, tPart - 0.3)
        + U.doc(t, tMar - 0.6, tPart - 0.2, 'Detenidos', [['Un vicealmirante y otros mandos de la Marina', tMar - 0.3], ['Empresarios y funcionarios de aduanas', tMar + 0.5]], { left: 90, top: 120, width: 620 })
        + partyRow(t, tPart - 0.1, ctx.dur + 1);
    } },
  ];
  const inst = { scene: Ct, scenes: [Ct, Me, Pt], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
// Three cases under three different governments.
function partyRow(t, a, b) {
  const k = ss(a, a + 0.4, t) * (1 - ss(b - 0.3, b, t)); if (k <= 0) return '';
  const it = [['García Luna', 'sexenio de Calderón · PAN'], ['Ayotzinapa', 'sexenio de Peña Nieto · PRI'], ['Huachicol fiscal', 'gobiernos de Morena']];
  return `<div style="position:absolute;left:0;right:0;top:140px;text-align:center;opacity:${k}"><div style="font:900 58px 'Inter Display',Inter;color:#fff;text-shadow:0 4px 20px rgba(0,0,0,.6)">La corrupción no es de un solo partido</div>
    <div style="display:flex;gap:24px;justify-content:center;margin-top:24px">${it.map(([h, s2], i) => { const o = ss(a + 0.3 + i * 0.25, a + 0.6 + i * 0.25, t);
      return `<div style="width:380px;padding:20px 22px;background:rgba(14,16,22,.86);border-radius:16px;opacity:${o};transform:translateY(${(1 - o) * 20}px)"><div style="font:900 34px 'Inter Display',Inter;color:#fff">${h}</div><div style="font:700 22px Inter;color:#c9ced6;margin-top:6px">${s2}</div></div>`; }).join('')}</div></div>`;
}
