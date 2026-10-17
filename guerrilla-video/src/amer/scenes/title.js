import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as A from '../anim.js';
import * as AM from '../amap.js';

export { preload } from '../amap.js';
const fade = AM.fade;
// Theatre line-up of the whole cast (also used by the outro).
export const BACK = ['washington', 'jefferson', 'franklin', 'lafayette', 'jorge3', 'toussaint', 'hidalgo', 'josefa', 'guerrero', 'iturbide', 'bolivar', 'sucre', 'sanmartin', 'pedro'];
export const FRONT = ['morelos', 'ohiggins', 'galvez', 'napoleon', 'leona', 'allende', 'fernando', 'jose', 'joao', 'virrey', 'golshiC'];
export function lineup(Th) {
  const back = BACK.map((w, i) => { const c = K.role(Th, w, -6.5 + i * 1.0, -3.3, 0); c.root.position.y = 0.4; return c; });
  const front = FRONT.map((w, i) => K.blobShadow(K.role(Th, w, -5 + i * 1.0, -1.5, 0)));
  return { back, front, all: [...back, ...front] };
}
// Personality in the line-up: each one moves her own way.
export function animLineup(L, t, k = 1) {
  L.back.forEach((c, i) => { const w = c.who;
    const p = w === 'franklin' ? C.cheer(t, i) : w === 'lafayette' ? A.fangirl(t, i) : w === 'iturbide' ? A.diva(t, i) : w === 'hidalgo' ? C.cheer(t * 1.4, i)
      : w === 'jorge3' ? A.sip(t, i) : w === 'sucre' ? C.wave(t, i) : w === 'guerrero' ? A.humble(t, i) : w === 'bolivar' ? A.proud(t, i) : C.idle(t, i);
    K.pose(c, p); c.setFace(C.blinkEye(t, i), ['franklin', 'hidalgo', 'sucre', 'lafayette', 'iturbide'].includes(w) ? 'smile' : 'neutral'); });
  // front row kneels like in a team photo (so the back row shows above their heads); some wave
  L.front.forEach((c, i) => { const p = A.kneel(t, i + 20); p.head = [-6, 8 * Math.sin(t * 0.7 + i), 0];
    if (i % 3 === 0) { const w = C.wave(t, i + 20); p.armR = w.armR; p.elbR = w.elbR; } else if (i % 3 === 1) { const ch = C.cheer(t, i + 20); p.armL = ch.armL; p.armR = ch.armR; p.elbL = ch.elbL; p.elbR = ch.elbR; }
    K.pose(c, p); c.setFace(C.blinkEye(t, i + 20), 'smile'); });
}

export function build(ctx) {
  const L = ctx.L;
  const tNin = wt(L[0], 'ningun'), tImp = wt(L[0], 'imperios'), tCin = wt(L[1], 'cincuenta'), tOnce = wt(L[1], 'once'), tEU = wt(L[1], 'estados'), tBol = wt(L[1], 'bolivia');
  const tHis = wt(L[2], 'historia'), tElen = wt(L[2], 'elenco');
  const tB = L[1].t0 - 0.35, tC = L[2].t0 - 0.3;

  // ---- map: 1775 -> 1825
  const Mp = AM.americasMap({ period: 1775 });
  const NEW = [['USA', 'ESTADOS UNIDOS', -96, 40], ['HTI', 'HAITÍ', -72.5, 19.2], ['MEX', 'MÉXICO', -102, 24], ['CAM', 'CENTROAMÉRICA', -87, 14.2], ['GCO', 'GRAN COLOMBIA', -72, 5],
    ['PER', 'PERÚ', -75, -9.5], ['BOL', 'BOLIVIA', -64.5, -17], ['CHL', 'CHILE', -72.5, -27], ['ARG', 'PROVINCIAS UNIDAS', -63.5, -31], ['PRY', 'PARAGUAY', -58, -23.2], ['BRA', 'BRASIL', -50, -10]];
  const EMP = [['ESP', 'IMPERIO ESPAÑOL', -66, -22], ['GBR', 'IMPERIO BRITÁNICO', -95, 56], ['POR', 'PORTUGAL', -50, -8], ['FRA', 'FRANCIA', -72.5, 19.4]];
  // ---- theatre line-up
  const Th = S.theater(); Th.backdrop.material.map = AM.paperMap(1024, 512, { title: 'Las Américas · 1775–1825' }); Th.backdrop.material.needsUpdate = true;
  const LU = lineup(Th);

  const sfx = [{ t: 0.2, type: 'swell', dur: tB, vol: 0.25 }, { t: tNin, type: 'tick', vol: 0.35 }, { t: tImp, type: 'pop', vol: 0.3 }, { t: tB, type: 'whoosh', vol: 0.3 },
    ...NEW.map((_, i) => ({ t: tOnce + i * 0.14, type: 'pop', vol: 0.22 })), { t: tC, type: 'curtain', vol: 0.4 }, { t: tC + 0.1, type: 'crowd', dur: ctx.dur - tC, vol: 0.25 },
    { t: tElen, type: 'sting2', vol: 0.4 }, { t: tElen + 0.3, type: 'applause', dur: ctx.dur - tElen - 0.3, vol: 0.35 }];

  const shots = [
    { t0: 0, set: Mp, p0: [0, 330, 110], l0: [0, 0, 0], p1: [0, 300, 92], l1: [0, 0, -2], fov0: 40, act: (t) => {
      Mp.paint(1775); Mp.zoom(3.2);
      return U.film(t) + U.year(t, 0.4, tB + 0.2, '1775', { x: 1660, top: 80, label: 'países independientes: 0' })
        + EMP.map(([st, n, lo, la], i) => AM.areaLabel(ctx, lo, la, n, fade(t, tImp - 0.3 + i * 0.25, tB + 0.3), 'st')).join('');
    } },
    { t0: tB, set: Mp, p0: [0, 300, 92], l0: [0, 0, -2], p1: [0, 290, 88], l1: [0, 0, -2], fov0: 40, act: (t) => {
      Mp.paint(1775, 1825, ss(tOnce - 0.3, tOnce + 1.3, t)); Mp.zoom(3.2);
      const n = Math.round(11 * ss(tOnce - 0.2, tOnce + 1.4, t));
      return U.film(t) + U.year(t, tB + 0.1, tC + 0.2, n >= 11 ? '1825' : String(1775 + Math.round(50 * ss(tCin - 0.2, tOnce + 1.4, t))), { x: 1660, top: 80, label: `países independientes: ${n}` })
        + NEW.map(([st, nm, lo, la], i) => AM.areaLabel(ctx, lo, la, nm, fade(t, tOnce + i * 0.14, tC + 0.3), 'st')).join('');
    } },
    { t0: tC, set: Th, p0: [0, 1.75, 6.2], l0: [0, 1.15, -2.4], p1: [0, 1.65, 5.5], l1: [0, 1.12, -2.4], fov0: 50, act: (t) => {
      animLineup(LU, t);
      return U.title(t, tC + 0.2, ctx.dur + 1, 'UNA HISTORIA EN 13 ACTOS', 'La independencia de las Américas', '1775 – 1825');
    } },
  ];
  const inst = { scene: Mp, scenes: [Mp, Th], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
