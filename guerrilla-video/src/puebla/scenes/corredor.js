import * as THREE from 'three';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as U from '../../narco/ui.js';
import * as PM from '../pmap.js';

export { preload } from '../pmap.js';
const fade = PM.fade;

export function build(ctx) {
  const L = ctx.L;
  const tMapa = wt(L[0], 'mapa'), tPue = wt(L[0], 'puebla'), tCdmx = wt(L[0], 'ciudad'), tVer = wt(L[0], 'veracruz');
  const tAuto = wt(L[1], 'autopista'), tMerc = wt(L[1], 'mercancia'), tDuc = wt(L[1], 'ductos'), tGas = wt(L[1], 'gasolina');
  const tCrim = wt(L[2], 'crimen'), tCaja = wt(L[2], 'caja');

  const Mp = PM.pueblaMap();
  const hwLen = PM.HIGHWAY.length;
  const sfx = [{ t: 0.2, type: 'whoosh', vol: 0.4 }, { t: tPue, type: 'pop', vol: 0.4 }, { t: tCdmx, type: 'pop', vol: 0.35 }, { t: tVer, type: 'pop', vol: 0.35 },
    { t: tAuto - 0.2, type: 'swoosh', vol: 0.35 }, { t: tDuc, type: 'swoosh', vol: 0.35 }, { t: tCaja - 0.1, type: 'hit', vol: 0.5 }];
  const tB = L[2].t0 - 0.3;
  const base = (t) => {
    Mp.reset();
    Mp.tintAll('#e0a070', ss(tPue - 0.2, tPue + 0.5, t), 0.6);
    Mp.highway.set(ss(tCdmx - 0.2, tVer + 0.6, t) * 0.25 + 0.75 * ss(tAuto - 0.4, tAuto + 1.6, t)); Mp.pipeline.set(ss(tDuc - 0.3, tGas + 0.6, t));
  };
  const shots = [
    { t0: 0, set: Mp, p0: [-0.5, 34, 13], l0: [-0.5, 0, -1.8], p1: [-0.4, 31, 11.5], l1: [-0.4, 0, -1.8], fov0: 38, act: (t) => {
      base(t);
      return U.film(t) + U.badge(t, 'El mapa', 'Puebla, un corredor estratégico', 'Entre la capital y el Golfo de México', tMapa - 0.2, tB)
        + PM.clabel(ctx, Mp, 'Ciudad de México', fade(t, tCdmx - 0.2, tB), 'c') + PM.clabel(ctx, Mp, 'Puebla', fade(t, tPue - 0.2, tB), 'c', 'Puebla (capital)')
        + PM.clabel(ctx, Mp, 'Veracruz', fade(t, tVer - 0.2, tB), 'c', 'Puerto de Veracruz')
        + (t > tPue - 0.2 ? `<div class="lbl big" style="left:${ctx.project(PM.ppos(-97.95, 18.45, 0.4))[0]}px;top:${ctx.project(PM.ppos(-97.95, 18.45, 0.4))[1]}px;opacity:${fade(t, tPue - 0.2, tB)};background:#b5462e">PUEBLA</div>` : '')
        + PM.label(ctx, PM.ppos(-95.95, 20.2, 0.05), 'GOLFO DE MÉXICO', 'st', fade(t, 0.4, tB))
        + ['Veracruz', 'Tlaxcala', 'Hidalgo', 'México', 'Morelos', 'Guerrero', 'Oaxaca'].map(n => PM.slabel(ctx, n, fade(t, 0.3, tB))).join('')
        + U.icons(t, tAuto - 0.2, tB, [['🚚', 'Autopista México–Veracruz', tAuto - 0.1], ['🛢️', 'Ductos de Pemex', tDuc - 0.1]], { y: 790 })
        + U.source(t, tDuc, tB, 'Trazos aproximados');
    } },
    { t0: tB, set: Mp, p0: [1.0, 17, 8.5], l0: [0.4, 0, 0.2], p1: [0.8, 15.5, 7.4], l1: [0.4, 0, 0.2], fov0: 38, act: (t) => {
      base(t); Mp.tintAll('#f2c14e', ss(tCaja - 0.5, tCaja + 0.3, t), 0.55);
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,10,16,${0.22 * ss(tB, tB + 0.5, t)})"></div>`
        + U.icons(t, tB + 0.2, ctx.dur + 1, [['⛽', 'Gasolina', tB + 0.3], ['🔥', 'Gas LP', tB + 0.5], ['🚚', 'Mercancía', tB + 0.7]], { y: 180 })
        + `<div style="position:absolute;left:0;right:0;top:420px;text-align:center;font:900 92px 'Inter Display',Inter;color:#fff;text-shadow:0 6px 30px rgba(0,0,0,.6);opacity:${ss(tCaja - 0.3, tCaja + 0.2, t)}">Una caja fuerte</div>`;
    } },
  ];
  const inst = { scene: Mp, scenes: [Mp], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
