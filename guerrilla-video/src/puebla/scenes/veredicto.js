import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import * as K from '../../narco/kit.js';
import * as M from '../../narco/mapkit.js';
import * as GM from '../../mx/geomap.js';
import { runShots, wt } from '../../mx/shots.js';
import * as U from '../ui.js';
import * as S from '../sets.js';

export { preload } from '../pmap.js';
const fade = M.fade;

export function build(ctx) {
  const L = ctx.L;
  const tEnt = wt(L[0], 'entonces'), tSin = wt(L[0], 'sinaloa'), tTod = wt(L[0], 'todavia'), tNo = wt(L[0], 'no$', 1), tAse = wt(L[0], 'asesinatos');
  const tSen = wt(L[1], 'senales'), tNeg = wt(L[1], 'negocio'), tGru = wt(L[1], 'grupos'), tPol = wt(L[1], 'policias');
  const tGua = wt(L[2], 'guanajuato'), tHua = wt(L[2], 'huachicol'), tGue = wt(L[2], 'guerra');

  // ---- 1/2. The zócalo at dusk
  const Z = S.pueblaZocalo('dusk');
  // ---- 3. Mexico: the Guanajuato warning
  const Mp = M.mexMap(); const R = Mp.map.regions;
  const pGua = M.pulse(Mp, -101.0, 20.9, '#c0392b', 0.7);
  const chip = (lo, la, k, title, sub, col) => { if (k <= 0) return ''; const [x, y, ok] = ctx.project(GM.pos(lo, la, GM.H + 0.3)); if (!ok) return '';
    return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-100%) scale(${0.8 + 0.2 * k});opacity:${k};text-align:center;padding:8px 16px 9px;border-radius:12px;background:rgba(20,22,28,.9);border-bottom:5px solid ${col};box-shadow:0 8px 24px rgba(0,0,0,.35);white-space:nowrap">
      <div style="font:900 27px 'Inter Display',Inter;color:#fff">${title}</div>${sub ? `<div style="font:700 18px Inter;color:#e6e0d4;margin-top:2px">${sub}</div>` : ''}</div>`; };

  const sfx = [{ t: 0.2, type: 'crowd', dur: 3.6, vol: 0.14 }, { t: tEnt, type: 'swoosh', vol: 0.35 }, { t: tTod - 0.1, type: 'hit', vol: 0.5 },
    { t: tSen, type: 'riser', dur: 1.6, vol: 0.28 }, { t: tNeg, type: 'pop', vol: 0.4 }, { t: tGru, type: 'pop', vol: 0.4 }, { t: tPol, type: 'pop', vol: 0.4 },
    { t: L[2].t0 - 0.35, type: 'whoosh', vol: 0.4 }, { t: tGua, type: 'pop', vol: 0.45 }, { t: tGue, type: 'gunfire', dur: 1.4, vol: 0.18 }, { t: tGue + 0.3, type: 'hit', vol: 0.5 }];

  const tB = tTod - 0.3, tC = L[2].t0 - 0.35;
  const shots = [
    { t0: 0, set: Z, p0: [0, 2.0, 15], l0: [0, 9, -25], p1: [0, 2.3, 12.5], l1: [0, 9.6, -25], fov0: 46, act: (t) => {
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,10,16,.3)"></div>`
        + U.big(t, tEnt - 0.1, tB + 0.2, '¿Puebla ya es otro Sinaloa?', { top: 380, size: 88 });
    } },
    { t0: tB, set: Z, p0: [0.0, 6.5, 21.0], l0: [0, 4.0, -14], p1: [0.0, 6.0, 18.5], l1: [0, 4.0, -14], fov0: 44, act: (t) => {
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,10,16,.62)"></div>`
        + U.verdict(t, tB + 0.1, tC, ['Todavía no', [['No hay guerra abierta entre cárteles', 'Como la que vive Sinaloa desde 2024', tNo - 0.1], ['Sus asesinatos, lejos de Sinaloa', '15 por cada 100 mil habitantes, contra 57', tAse - 0.1]], tTod - 0.1],
          ['Señales de alerta', [['Un negocio enorme de robo', 'Huachicol y robo de carga', tNeg - 0.1], ['Grupos nacionales tomando posiciones', 'CJNG, Sinaloa, La Familia Michoacana', tGru - 0.1], ['Policías y alcaldes comprados', 'Detenidos en 2026; sus casos siguen en proceso', tPol - 0.1]], tSen - 0.2], { y: 210 });
    } },
    { t0: tC, set: Mp, p0: [2.1, 10.0, 11.5], l0: [2.1, 0, 3.3], p1: [2.1, 9.2, 10.6], l1: [2.1, 0, 3.4], fov0: 40, act: (t) => {
      for (const r of Object.values(R)) r.mat.color.set(r.base);
      R['Guanajuato'].mat.color.lerp(new THREE.Color('#c0392b'), 0.75 * ss(tGua - 0.2, tGua + 0.4, t));
      R['Puebla'].mat.color.lerp(new THREE.Color('#e67e22'), 0.6);
      pGua.update(t, tGue - 0.2);
      return U.film(t) + U.badge(t, 'La advertencia', 'Guanajuato', 'Del huachicol a la guerra entre cárteles', tGua - 0.2, ctx.dur + 1)
        + chip(-101.0, 21.1, fade(t, tHua - 0.1, ctx.dur + 1), 'Guanajuato', 'el estado con más asesinatos en 2025', '#c0392b')
        + chip(-98.0, 19.2, fade(t, tC + 0.3, ctx.dur + 1), 'Puebla', 'huachicol y robo de carga', '#e67e22')
        + U.source(t, tGue, ctx.dur + 1, 'INEGI 2025: 3,249 asesinatos en Guanajuato, la cifra más alta del país');
    } },
  ];
  const inst = { scene: Z, scenes: [Z, Mp], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
