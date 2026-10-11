import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as N from '../props.js';
import * as X from '../../mx/props.js';
import * as MS from '../../mx/sets.js';
import { runShots, wt } from '../../mx/shots.js';
import * as U from '../ui.js';
import * as M from '../mapkit.js';

export { preload } from '../mapkit.js';
const fade = (t, a, b, f = 0.35) => ss(a, a + f, t) * (1 - ss(b - f, b, t));

export function build(ctx) {
  const L = ctx.L;
  const tDic = wt(L[0], 'diciembre'), tCal = wt(L[0], 'felipe'), tSaco = wt(L[0], 'saco'), tGue = wt(L[0], 'guerra');
  const tCay = wt(L[1], 'cayeron'), tPart = wt(L[1], 'partieron'), tPel = wt(L[1], 'pelearon');
  const tDisp = wt(L[2], 'dispararon'), tDiez = wt(L[2], 'diez'), tVein = wt(L[2], 'veintisiete');

  // ---- 1. Calderón and the army (Zócalo)
  const Z = MS.zocalo('day');
  const cal = K.person(Z, 'calderon', 'calderon', 0, 3.0, 0); cal.root.position.y = 0.5;
  const st = X.stage(3.2, 1.8); st.position.set(0, 0, 3.0); Z.add(st);
  const sold = []; for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) sold.push(K.person(Z, ['doto', 'oguri', 'suzuka', 'helios', 'tamamo', 'mcqueen', 'daiwa'][(i + r) % 7], 'soldier', -3.6 + i * 1.2, 6.6 + r * 1.2, Math.PI));
  // ---- 2. Army trucks in the streets
  const A = S.avenue('day', { seed: 45 });
  const trucks = [0, 1].map(i => { const t = N.armyTruck(); t.position.set(i ? 1.9 : -1.9, 0, -30 - i * 7); A.add(t); return t; });
  const pat = []; for (let i = 0; i < 8; i++) pat.push(K.person(A, ['oguri', 'doto', 'helios', 'suzuka', 'tamamo', 'mcqueen', 'daiwa', 'cafe'][i], 'soldier', (i % 2 ? 3.9 : -3.9), -4 - Math.floor(i / 2) * 1.6, 0));
  // ---- 3. Map: the cartels split
  const Mp = M.mexMap();
  const OLD = [['Sinaloa', -107.4, 24.8, '#7a2f8f'], ['Tijuana', -116.6, 32.1, '#8f5a2f'], ['Juárez', -106.2, 30.9, '#2f6a8f'], ['Golfo', -98.1, 25.4, '#2f8f6a'], ['La Familia', -100.6, 20.6, '#8f2f4a']];
  const NEW = [['Beltrán Leyva', -98.4, 17.6, '#7a2f8f', 0], ['Los Zetas', -100.2, 27.6, '#2f8f6a', 1], ['Templarios', -102.8, 18.3, '#8f2f4a', 2], ['CJNG', -104.9, 21.6, '#c0392b', 3]];
  const pulses = NEW.map(([, lo, la]) => M.pulse(Mp, lo, la, '#c0392b', 0.8));
  const chip = (lo, la, txt, k, col, big = false) => { if (k <= 0) return ''; const [x, y, ok] = ctx.project(M.GM.pos(lo, la, M.GM.H + 0.3)); if (!ok) return '';
    return `<div class="lbl" style="left:${x}px;top:${y}px;opacity:${k};background:${col};font:900 ${big ? 26 : 23}px Inter;transform:translate(-50%,-100%) scale(${0.7 + 0.3 * k})">${txt}</div>`; };

  const sfx = [{ t: tDic - 0.2, type: 'drums', dur: 3.5, vol: 0.5 }, { t: tSaco - 0.3, type: 'engines', dur: 4.3, vol: 0.55 }, { t: tSaco + 0.4, type: 'march', dur: 3.6, vol: 0.4 },
    { t: tCay - 0.2, type: 'whoosh', vol: 0.4 }, ...NEW.map((n, i) => ({ t: tPart + 0.2 + i * 0.35, type: 'pop', vol: 0.4 })), { t: tPel, type: 'gunfire', dur: 1.8, vol: 0.25 },
    { t: L[2].t0 - 0.2, type: 'riser', dur: 4.5, vol: 0.4 }, { t: tVein, type: 'hit', vol: 0.6 }];

  const tB = tSaco - 0.25, tC = L[1].t0 - 0.3, tD = L[2].t0 - 0.25;
  const shots = [
    { t0: 0, set: Z, p0: [2.4, 2.6, 13.0], l0: [0, 1.25, 3.0], p1: [2.0, 2.4, 11.6], l1: [0, 1.3, 3.0], fov0: 38, act: (t) => {
      K.pose(cal, t > tCal ? { ...C.idle(t, 1, 0.5), armR: [-60, 20, 40], elbR: [0, 0, 40] } : C.idle(t, 1, 0.5)); cal.setFace(C.blinkEye(t, 1), t > tCal && t < tB ? C.talkMouth(t, 1) : 'neutral');
      sold.forEach((s, i) => { K.pose(s, { ...C.idle(t, i, 0.25), gun: 'port' }); s.setFace(C.blinkEye(t, i), 'neutral'); });
      Z.flag.wave(t);
      return U.film(t) + U.badge(t, 'Diciembre de 2006', 'Comienza la guerra contra el narco', 'El Ejército sale a las calles', tDic - 0.1, tB + 0.2)
        + U.nameplate(ctx, [0, 2.55, 3.0], 'Felipe Calderón', 'Presidente 2006–2012', tCal - 0.2, tB);
    } },
    { t0: tB, set: A, p0: [2.9, 1.5, 7], l0: [-0.8, 1.2, -16], p1: [2.6, 1.4, 5.5], l1: [-0.8, 1.2, -16], fov0: 40, act: (t) => {
      const lt = t - tB;
      trucks.forEach((tr, i) => { tr.position.z = -30 - i * 7 + lt * 4.2; tr.wheels.forEach(w => (w.rotation.x = lt * 10)); });
      pat.forEach((s, i) => { s.root.position.z = -4 - Math.floor(i / 2) * 1.6 + lt * 0.9; K.pose(s, { ...C.walkArmed(t, 0.8, i), gun: 'port' }); s.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t);
    } },
    { t0: tC, set: Mp, p0: [0.5, 31, 19], l0: [0.5, 0, 1.0], p1: [0.5, 29.5, 17.5], l1: [0.5, 0, 0.8], fov0: 38, act: (t) => {
      pulses.forEach((p, i) => p.update(t, tPart + 0.2 + i * 0.35));
      return U.film(t) + U.badge(t, '2006 – 2012', 'Los cárteles se dividen', 'Más grupos, más guerras por cada plaza', tCay - 0.1, tD)
        + OLD.map(([n, lo, la, c]) => chip(lo, la, n, fade(t, tC + 0.2, tD), c, true)).join('')
        + NEW.map(([n, lo, la, c, i]) => chip(lo, la, n, fade(t, tPart + 0.2 + i * 0.35, tD), c)).join('');
    } },
    { t0: tD, set: Mp, p0: [0.5, 29.5, 17.5], l0: [0.5, 0, 0.8], fov0: 38, act: (t) => {
      pulses.forEach((p, i) => p.update(t, tPart + 0.2 + i * 0.35));
      const prog = ss(tDisp - 0.4, tVein + 0.6, t);
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,10,16,${0.55 * ss(tD, tD + 0.4, t)})"></div>`
        + U.homChart(t, tD, ctx.dur + 1, { upto: 2011, progress: prog, labels: [[2006, tDiez - 0.2], [2011, tVein]] });
    } },
  ];
  const inst = { scene: Z, scenes: [Z, A, Mp], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
