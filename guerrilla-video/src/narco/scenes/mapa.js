import * as THREE from 'three';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as U from '../ui.js';
import * as M from '../mapkit.js';
import * as GM from '../../mx/geomap.js';

export { preload } from '../mapkit.js';
const fade = M.fade;

// Approximate areas of predominant influence (many regions are contested by several groups).
const SIN = ['Sinaloa', 'Sonora', 'Durango', 'Chihuahua', 'Baja California', 'Baja California Sur'];
const CJNG = ['Jalisco', 'Colima', 'Nayarit', 'Michoacán', 'Guanajuato', 'Aguascalientes', 'Zacatecas', 'Veracruz', 'Quintana Roo', 'Tabasco'];
const C_SIN = '#8e44ad', C_CJNG = '#c0392b';

export function build(ctx) {
  const L = ctx.L;
  const tSin = wt(L[0], 'sinaloa'), tJal = wt(L[0], 'jalisco'), tPres = wt(L[0], 'presencia');
  const tDesde = wt(L[1], 'desde'), tSin2 = wt(L[1], 'sinaloa'), tGue = wt(L[1], 'guerra'), tCha = wt(L[1], 'chapitos'), tMay = wt(L[1], 'mayos'), tMil = wt(L[1], 'miles');

  const Mp = M.mexMap();
  const R = Mp.map.regions;
  const CUL = [-107.39, 24.79];
  const pulses = [M.pulse(Mp, CUL[0], CUL[1], '#e67e22', 0.7)];
  const chip = (lo, la, txt, k, col, size = 24) => { if (k <= 0) return ''; const [x, y, ok] = ctx.project(GM.pos(lo, la, GM.H + 0.3)); if (!ok) return '';
    return `<div class="lbl" style="left:${x}px;top:${y}px;opacity:${k};background:${col};font:900 ${size}px Inter;transform:translate(-50%,-100%) scale(${0.75 + 0.25 * k})">${txt}</div>`; };
  const paint = (t, focus) => {
    const kS = ss(tSin - 0.1, tSin + 0.5, t), kJ = ss(tJal - 0.1, tJal + 0.5, t);
    for (const [name, r] of Object.entries(R)) {
      let col = null, k = 0;
      if (SIN.includes(name)) { col = C_SIN; k = kS; } else if (CJNG.includes(name)) { col = C_CJNG; k = kJ; }
      if (focus > 0 && name !== 'Sinaloa') k *= 1 - 0.8 * focus;
      r.mat.color.set(r.base); if (col) r.mat.color.lerp(new THREE.Color(col), 0.72 * k);
    }
  };

  const sfx = [{ t: 0.1, type: 'whoosh', vol: 0.4 }, { t: tSin, type: 'pop', vol: 0.45 }, { t: tJal, type: 'pop', vol: 0.45 },
    { t: L[1].t0 - 0.35, type: 'swoosh', vol: 0.45 }, { t: tGue, type: 'gunfire', dur: 1.6, vol: 0.22 }, { t: tCha, type: 'tick', vol: 0.35 }, { t: tMay, type: 'tick', vol: 0.35 }, { t: tMil, type: 'hit', vol: 0.5 }];

  const tB = L[1].t0 - 0.35;
  const shots = [
    { t0: 0, set: Mp, p0: [0.5, 31, 19], l0: [0.5, 0, 1.0], p1: [0.2, 29.5, 17.5], l1: [0.2, 0, 0.8], fov0: 38, act: (t) => {
      paint(t, 0); pulses.forEach(p => p.update(t, 1e9));
      return U.film(t) + U.badge(t, '2026', 'Los dos grandes cárteles', 'Sinaloa y Jalisco Nueva Generación', 0.5, tB)
        + chip(-108.6, 28.4, 'Cártel de Sinaloa', fade(t, tSin, tB), C_SIN, 26)
        + chip(-103.0, 20.0, 'CJNG', fade(t, tJal + 0.1, tB), C_CJNG, 28)
        + U.source(t, tPres, tB, 'Zonas de influencia aproximadas (DEA, InSight Crime) · muchas regiones están en disputa');
    } },
    { t0: tB, set: Mp, p0: [-3.4, 12.5, 7.5], l0: [-4.9, 0, -1.0], p1: [-4.2, 9.5, 5.2], l1: [-5.0, 0, -1.1], fov0: 38, act: (t) => {
      paint(t, ss(tB, tB + 1.2, t)); pulses.forEach(p => p.update(t, tGue - 0.3));
      return U.film(t) + U.badge(t, 'Desde septiembre de 2024', 'Guerra en Sinaloa', 'Tras la captura de “El Mayo” Zambada en EE. UU.', tDesde - 0.1, ctx.dur + 1)
        + chip(CUL[0], CUL[1], 'Culiacán', fade(t, tSin2, ctx.dur + 1), 'rgba(42,33,27,.9)', 22)
        + chip(-108.7, 25.9, 'Los Chapitos', fade(t, tCha - 0.1, ctx.dur + 1), '#d35400', 26)
        + chip(-106.3, 23.7, 'Los Mayos', fade(t, tMay - 0.1, ctx.dur + 1), '#6c3483', 26)
        + U.counter(t, tMil - 0.2, ctx.dur + 1, 1190, 330, 2400, 'asesinatos en Sinaloa en 17 meses de guerra', { from: 300, dur: 1.2, color: '#ff8a6a', prefix: '+', w: 600 })
        + U.source(t, tMil, ctx.dur + 1, 'Fiscalía de Sinaloa, sept. 2024 – ene. 2026 (vía Expansión)');
    } },
  ];
  const inst = { scene: Mp, scenes: [Mp], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
