import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import * as K from '../../narco/kit.js';
import * as N from '../../narco/props.js';
import * as M from '../../narco/mapkit.js';
import * as GM from '../../mx/geomap.js';
import { runShots, wt } from '../../mx/shots.js';
import * as U from '../ui.js';
import * as S from '../sets.js';

export { preload } from '../pmap.js';
const fade = M.fade;
const C_CJNG = '#c0392b', C_SIN = '#8e44ad', C_FM = '#2e8b57', C_BAR = '#e67e22';

export function build(ctx) {
  const L = ctx.L;
  const tQui = wt(L[0], 'quien'), tSec = wt(L[0], 'secretaria'), tSiete = wt(L[0], 'siete'), tNac = wt(L[0], 'nacional');
  const tCj = wt(L[1], 'cartel'), tSin = wt(L[1], 'cartel', 1), tFam = wt(L[1], 'familia'), tCel = wt(L[1], 'celulas'), tBar = wt(L[1], 'barredora'), tAli = wt(L[1], 'aliada');
  const tSep = wt(L[2], 'septiembre'), tFron = wt(L[2], 'frontera'), tConf = wt(L[2], 'confirmar'), tSin2 = wt(L[2], 'sinaloa');

  // ---- 1/2. Mexico: Puebla, then where the national groups come from
  const Mp = M.mexMap(); const R = Mp.map.regions;
  const GROUPS = [
    // [path (origin -> Puebla), colour, start time, chip lon/lat, name, sub]
    [[[-103.35, 20.67], [-101.2, 20.25], [-99.5, 19.7], [-98.8, 19.3]], C_CJNG, tCj, [-105.9, 20.35], 'CJNG', 'Cártel Jalisco Nueva Generación', 'Jalisco'],
    [[[-107.39, 24.8], [-104.5, 23.3], [-101.3, 21.3], [-99.3, 20.05], [-98.65, 19.6]], C_SIN, tSin, [-107.3, 25.35], 'Cártel de Sinaloa', '', 'Sinaloa'],
    [[[-101.4, 19.0], [-100.2, 18.55], [-99.2, 18.6], [-98.75, 18.8]], C_FM, tFam, [-101.2, 17.75], 'La Familia Michoacana', '', 'Michoacán'],
    [[[-92.93, 17.99], [-94.8, 18.15], [-96.4, 18.55], [-97.6, 18.92]], C_BAR, tBar, [-93.0, 17.25], 'La Barredora', 'célula aliada del CJNG · nació en Tabasco', 'Tabasco'],
  ];
  const arrows = GROUPS.map(([path, col]) => { const a = M.marrow(path, col, 0.32); Mp.add(a); return a; });
  const pue = M.pulse(Mp, -98.2, 19.04, '#ffffff', 0.55);
  const chip = (lo, la, k, title, sub, col) => { if (k <= 0) return ''; const [x, y, ok] = ctx.project(GM.pos(lo, la, GM.H + 0.3)); if (!ok) return '';
    return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-100%) scale(${0.8 + 0.2 * k});opacity:${k};text-align:center;padding:7px 14px 8px;border-radius:12px;background:rgba(20,22,28,.9);border-bottom:5px solid ${col};box-shadow:0 8px 24px rgba(0,0,0,.35);white-space:nowrap">
      <div style="font:900 25px 'Inter Display',Inter;color:#fff">${title}</div>${sub ? `<div style="font:700 17px Inter;color:#e6e0d4;margin-top:2px">${sub}</div>` : ''}</div>`; };
  const paint = (t) => {
    for (const r of Object.values(R)) r.mat.color.set(r.base);
    R['Puebla'].mat.color.lerp(new THREE.Color('#c0392b'), 0.55);
    for (const g of GROUPS) R[g[6]].mat.color.lerp(new THREE.Color(g[1]), 0.3 * ss(g[2] - 0.2, g[2] + 0.4, t));
  };
  // ---- 3. Sierra Norte: state police at the Veracruz line (Tenampulco)
  const B = S.sierraBorder('overcast');
  const cops = [K.person(B, 'oguri', 'estatal', 0.7, 4.4, -0.2), K.person(B, 'suzuka', 'estatal', -1.3, 4.1, 0.25), K.person(B, 'helios', 'soldier', -3.3, 2.0, 0.55)];

  const sfx = [{ t: 0.2, type: 'whoosh', vol: 0.35 }, { t: tQui, type: 'hit', vol: 0.45 }, { t: tSiete, type: 'pop', vol: 0.5 },
    { t: L[1].t0 - 0.3, type: 'swoosh', vol: 0.4 }, ...GROUPS.map(g => ({ t: g[2], type: 'whoosh', vol: 0.3 })), ...GROUPS.map(g => ({ t: g[2] + 0.9, type: 'pop', vol: 0.4 })),
    { t: L[2].t0 - 0.3, type: 'wind', dur: ctx.dur - L[2].t0 + 0.3, vol: 0.3 }, { t: tSep + 0.4, type: 'birds', dur: 4.0, vol: 0.22 }, { t: tSin2, type: 'tick', vol: 0.35 }];

  const tB = L[1].t0 - 0.3, tC = L[2].t0 - 0.3;
  const shots = [
    { t0: 0, set: Mp, p0: [3.6, 9.0, 11.6], l0: [3.5, 0, 4.4], p1: [3.6, 8.2, 10.6], l1: [3.5, 0, 4.4], fov0: 40, act: (t) => {
      paint(t); arrows.forEach(a => a.set(0)); pue.update(t, 0.2);
      return U.film(t) + U.big(t, tQui - 0.2, tSec - 0.1, '¿Quién está detrás?', { top: 150, size: 78 })
        + U.badge(t, 'Enero de 2025 · SSP de Puebla', 'Siete grupos criminales', 'De alcance nacional, establecidos en el estado', tSec - 0.1, tB)
        + U.counter(t, tSiete - 0.2, tB, 110, 330, 7, 'grupos criminales de alcance nacional en Puebla', { from: 0, dur: 0.7, color: '#ff8a6a', w: 600 })
        + M.city(ctx, Mp, 'Puebla', fade(t, 0.3, tB)) + M.stateLabel(ctx, -96.6, 19.9, 'VERACRUZ', fade(t, 0.6, tB))
        + U.source(t, tNac, tB, 'Secretaría de Seguridad Pública de Puebla, enero de 2025');
    } },
    { t0: tB, set: Mp, p0: [1.5, 17.5, 13.8], l0: [1.5, 0, 2.9], p1: [1.7, 16.6, 13.0], l1: [1.7, 0, 2.9], fov0: 38, act: (t) => {
      paint(t); pue.update(t, 0.2);
      GROUPS.forEach((g, i) => arrows[i].set(ss(g[2] - 0.1, g[2] + 1.1, t)));
      return U.film(t) + U.badge(t, 'Presentes en Puebla', 'Grupos de alcance nacional', 'Y el estado donde nació cada uno', tB + 0.3, tC)
        + GROUPS.map(([, col, ts, [lo, la], name, sub]) => chip(lo, la, fade(t, ts + 0.2, tC), name, sub, col)).join('')
        + M.city(ctx, Mp, 'Puebla', fade(t, tB + 0.2, tC))
        + U.source(t, tCel, tC, 'SSP de Puebla · flechas: origen de cada grupo, no rutas exactas');
    } },
    { t0: tC, set: B, p0: [-1.0, 1.5, 10.0], l0: [0.9, 1.6, 2.0], p1: [-0.8, 1.47, 9.2], l1: [0.9, 1.6, 2.0], fov0: 40, act: (t) => {
      B.patrol.blink(t, 1);
      K.pose(cops[0], { ...C.idle(t, 1, 0.3), gun: 'port', head: [4, 0, 0] }); cops[0].setFace(C.blinkEye(t, 1), 'neutral');
      K.pose(cops[1], { ...C.idle(t, 2, 0.3), gun: 'port' }); cops[1].setFace(C.blinkEye(t, 2), 'neutral');
      K.pose(cops[2], { ...C.idle(t, 3, 0.3), gun: 'port' }); cops[2].setFace(C.blinkEye(t, 3), 'neutral');
      return U.film(t) + U.badge(t, 'Septiembre de 2026 · Tenampulco', 'Vigilancia reforzada en la frontera', 'Para confirmar o descartar la llegada del Cártel de Sinaloa', tSep - 0.2, ctx.dur + 1)
        + U.source(t, tConf, ctx.dur + 1, 'SSP de Puebla: hasta entonces no había detectado movimientos de ese grupo');
    } },
  ];
  const inst = { scene: Mp, scenes: [Mp, B], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
