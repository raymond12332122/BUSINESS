import * as THREE from 'three';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as U from '../ui.js';
import * as PM from '../pmap.js';

export { preload } from '../pmap.js';
const fade = PM.fade;
const RED = '#c0392b', ORANGE = '#e67e22', PURPLE = '#8e44ad';
const SIERRA = ['Jopala', 'Tlaola', 'Tlapacoya'], MIXTECA = ['Chietla', 'Tehuitzingo', 'Chila de la Sal'];

export function build(ctx) {
  const L = ctx.L;
  const tAis = wt(L[0], 'aislado'), tDias = wt(L[0], 'dias'), tTep = wt(L[0], 'tepeyahualco'), tSec = wt(L[0], 'secuestro');
  const tJul = wt(L[1], 'julio'), tSeis = wt(L[1], 'seis'), tSie = wt(L[1], 'sierra'), tMix = wt(L[1], 'mixteca'), tLab = wt(L[1], 'laboratorio'), tCtrl = wt(L[1], 'control');
  const tEne = wt(L[2], 'enero'), tFun = wt(L[2], 'funcionarios'), tCap = wt(L[2], 'capital'), tBar = wt(L[2], 'barredora'), tSiete = wt(L[2], 'siete'), tNex = wt(L[2], 'nexos');

  const Mp = PM.pueblaMap();
  const LAB = [-97.812, 20.17], SIERRA_C = [-97.846, 20.168];   // narcolab found in June 2026 on the Jopala–Tlapacoya line
  const pul = { Tepeyahualco: PM.pulse(Mp, ...PM.muniLab(Mp, 'Tepeyahualco'), RED, 0.8), Lab: PM.pulse(Mp, ...LAB, ORANGE, 0.5),
    Puebla: PM.pulse(Mp, ...PM.muniLab(Mp, 'Puebla'), PURPLE, 0.8) };
  const tDir = wt(L[1], 'directores');

  const sfx = [{ t: 0.3, type: 'whoosh', vol: 0.35 }, { t: tTep, type: 'pop', vol: 0.45 }, { t: tJul - 0.3, type: 'swoosh', vol: 0.4 },
    { t: tDir, type: 'pop', vol: 0.4 }, ...MIXTECA.map((n, i) => ({ t: tMix + i * 0.25, type: 'pop', vol: 0.38 })),
    { t: tLab - 0.5, type: 'swoosh', vol: 0.35 }, { t: tLab, type: 'pop', vol: 0.45 },
    { t: tCtrl, type: 'stamp', vol: 0.45 }, { t: tEne - 0.3, type: 'swoosh', vol: 0.4 }, { t: tCap, type: 'pop', vol: 0.45 }, { t: tSiete, type: 'hit', vol: 0.5 }];

  // municipality colours accumulate over the scene
  const paint = (t) => {
    Mp.reset();
    Mp.tint('Esperanza', RED, 1, 0.75); Mp.tint('Tepeyahualco', RED, ss(tTep - 0.2, tTep + 0.4, t), 0.75);
    SIERRA.forEach((n, i) => Mp.tint(n, ORANGE, ss(tDir - 0.2 + i * 0.25, tDir + 0.3 + i * 0.25, t), 0.8));
    MIXTECA.forEach((n, i) => Mp.tint(n, ORANGE, ss(tMix - 0.2 + i * 0.25, tMix + 0.3 + i * 0.25, t), 0.8));
    Mp.tint('Puebla', PURPLE, ss(tCap - 0.2, tCap + 0.4, t), 0.7);
    pul.Tepeyahualco.update(t, tTep, tJul); pul.Lab.update(t, tLab - 0.1, tEne); pul.Puebla.update(t, tCap);
  };
  const legend = (t, a) => U.legend(t, a, ctx.dur + 1, 'Funcionarios detenidos en 2026', [[RED, 'Alcaldes: Esperanza y Tepeyahualco', a], [ORANGE, 'Directores de seguridad: 6 municipios', a + 0.15], [PURPLE, 'Policía de la capital: 3 funcionarios', a + 0.3]], { x: 70, y: 150, w: 520 });
  const tB = tJul - 0.3, tC = tMix - 0.35, tC2 = tLab - 0.5, tD = tEne - 0.3;
  const shots = [
    { t0: 0, set: Mp, p0: [0.3, 31, 11.5], l0: [0.3, 0, -1.6], p1: [0.4, 29.5, 10.8], l1: [0.4, 0, -1.7], fov0: 40, act: (t) => {
      paint(t);
      return U.film(t) + U.badge(t, 'Puebla · 2026', 'No es un caso aislado', 'Funcionarios detenidos por posibles nexos con el crimen', tAis - 0.3, tB)
        + PM.chip(ctx, Mp, 'Esperanza', fade(t, 0.3, tB), 'alcalde detenido', RED)
        + PM.chip(ctx, Mp, 'Tepeyahualco', fade(t, tTep - 0.1, tB), 'alcalde detenido · secuestro exprés y robo', RED);
    } },
    { t0: tB, set: Mp, p0: [0.5, 8.6, -1.6], l0: [0.0, 0, -6.6], p1: [0.4, 8.0, -2.1], l1: [0.0, 0, -6.7], fov0: 40, act: (t) => {
      paint(t);
      return U.film(t) + U.badge(t, 'Julio de 2026 · Sierra Norte', 'Directores de seguridad detenidos', 'Fiscalía de Puebla', tJul - 0.1, tC)
        + PM.chipAt(ctx, ...SIERRA_C, fade(t, tDir, tC), 'Jopala · Tlaola · Tlapacoya', '3 directores detenidos', ORANGE, 0.3);
    } },
    { t0: tC, set: Mp, p0: [-3.9, 10.2, 10.0], l0: [-3.5, 0, 4.3], p1: [-3.7, 9.6, 9.4], l1: [-3.4, 0, 4.3], fov0: 40, act: (t) => {
      paint(t);
      return U.film(t) + U.badge(t, 'Julio de 2026 · Mixteca', 'Directores de seguridad detenidos', 'Fiscalía de Puebla', tC + 0.1, tC2)
        + MIXTECA.map((n, i) => PM.chip(ctx, Mp, n, fade(t, tMix + i * 0.25, tC2), 'director detenido', ORANGE, { dy: 0.3 })).join('');
    } },
    { t0: tC2, set: Mp, p0: [0.45, 3.9, -4.3], l0: [0.1, 0, -6.7], p1: [0.4, 3.5, -4.5], l1: [0.1, 0, -6.75], fov0: 40, act: (t) => {
      paint(t);
      return U.film(t) + U.badge(t, 'Junio de 2026 · Sierra Norte', 'Un narcolaboratorio', 'Los directores, acusados de encubrimiento', tC2 + 0.2, tD)
        + PM.chipAt(ctx, ...LAB, fade(t, tLab - 0.1, tD), 'Laboratorio de metanfetamina', 'límites de Jopala y Tlapacoya', ORANGE, 0.3)
        + U.big(t, tCtrl - 0.2, tD, 'El estado toma el control de sus policías', { top: 760, size: 52 });
    } },
    { t0: tD, set: Mp, p0: [-1.2, 31, 11.5], l0: [-1.2, 0, -1.6], p1: [-1.2, 30, 11.0], l1: [-1.2, 0, -1.6], fov0: 40, act: (t) => {
      paint(t);
      return U.film(t) + legend(t, tD + 0.2)
        + PM.chip(ctx, Mp, 'Puebla', fade(t, tCap - 0.1, ctx.dur + 1), '3 funcionarios de la policía · protegían a La Barredora', PURPLE, { title: 'Puebla (capital)' })
        + U.counter(t, tSiete - 0.2, ctx.dur + 1, 1320, 420, 7, 'alcaldes investigados por posibles nexos con el crimen', { from: 0, dur: 0.8, color: '#ffb35a', w: 520 })
        + U.source(t, tNex, ctx.dur + 1, 'SSPC · Fiscalía de Puebla · SSP Puebla · todos son presuntos responsables');
    } },
  ];
  const inst = { scene: Mp, scenes: [Mp], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
