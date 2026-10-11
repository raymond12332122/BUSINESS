import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import * as S from '../sets.js';
import { runShots, wt } from '../../mx/shots.js';
import * as U from '../ui.js';
import * as M from '../mapkit.js';

export { preload } from '../mapkit.js';
const fade = M.fade;

export function build(ctx) {
  const L = ctx.L;
  const tDos = wt(L[0], 'dos'), tDroga = wt(L[0], 'droga'), tNorte = wt(L[0], 'norte'), tMill = wt(L[0], 'millones'), tCasi = wt(L[0], 'casi'), tSobre = wt(L[0], 'sobredosis');
  const tArm = wt(L[1], 'armas'), tSur = wt(L[1], 'sur'), tSiete = wt(L[1], 'siete'), tRast = wt(L[1], 'rastreadas');
  const tTrump = wt(L[2], 'donald'), tTerr = wt(L[2], 'terroristas'), tSeis = wt(L[2], 'seis'), tAranc = wt(L[2], 'aranceles'), tAmen = wt(L[2], 'amenazas');

  // ---- 1. The border wall
  const Bd = S.border('golden');
  // ---- 2/3. Drugs north, guns south
  const A = M.americasNow();
  const RED = '#c0392b', BLUE = '#2f6fb0';
  const drugs = [
    [[-107.4, 24.8], [-110.5, 29.0], [-114.5, 32.4], [-118.2, 34.0]],
    [[-103.4, 20.7], [-102.0, 25.0], [-100.0, 29.5], [-95.5, 35.0], [-90.5, 39.5], [-87.6, 41.9]],
    [[-99.1, 19.4], [-98.5, 24.5], [-97.5, 28.0], [-93.0, 33.0], [-84.0, 37.5], [-74.0, 40.7]],
  ].map((p, i) => { const a = M.aarrow(p, RED, 0.65); a.d = i * 0.35; A.add(a); return a; });
  const guns = [
    [[-97.0, 32.8], [-98.5, 29.4], [-99.5, 27.5], [-100.3, 25.7], [-101.2, 22.6]],
    [[-112.1, 33.4], [-110.9, 31.3], [-110.9, 29.1], [-108.6, 26.4]],
    [[-106.5, 31.8], [-106.1, 28.6], [-104.7, 24.0], [-103.6, 21.2]],
  ].map((p, i) => { const a = M.aarrow(p, BLUE, 0.6); a.d = i * 0.3; A.add(a); return a; });
  // ---- 4. Washington
  const W = S.whiteHouseSet('day');

  const sfx = [{ t: 0.2, type: 'wind', dur: L[0].t0 + 3.0, vol: 0.35 }, { t: tDroga - 0.3, type: 'whoosh', vol: 0.45 }, { t: tCasi - 0.1, type: 'hit', vol: 0.5 },
    { t: L[1].t0 - 0.3, type: 'swoosh', vol: 0.45 }, { t: tSiete, type: 'pop', vol: 0.45 },
    { t: L[2].t0 - 0.3, type: 'riser', dur: 3.0, vol: 0.35 }, { t: tTerr, type: 'stamp', vol: 0.55 }, { t: tAranc, type: 'tick', vol: 0.35 }, { t: tAmen, type: 'sting', vol: 0.45 }];

  const tB = tDroga - 0.3, tC = L[1].t0 - 0.3, tD = L[2].t0 - 0.3;
  const usTint = (t, k) => { const us = A.countries.USA, mx = A.countries.MEX;
    us.mat.color.set(us.base).lerp(new THREE.Color('#e8a07a'), 0.6 * k); mx.mat.color.set(mx.base); };
  const shots = [
    { t0: 0, set: Bd, p0: [10, 4.5, 13], l0: [-2, 2.0, -4], p1: [9, 4.2, 11.5], l1: [-2, 2.0, -4], fov0: 40, act: (t) => {
      Bd.usFlag.wave(t); Bd.mxFlag.wave(t);
      return U.film(t) + U.badge(t, 'Frontera México – EE. UU.', 'Un problema de dos lados', '3,000 km de frontera', tDos - 0.3, tB);
    } },
    { t0: tB, set: A, p0: [-4.5, 34, 6], l0: [-4.5, 0, -8.6], p1: [-4.5, 32, 5], l1: [-4.5, 0, -8.6], fov0: 38, act: (t) => {
      drugs.forEach(a => { a.visible = true; a.set(clamp((t - tNorte + 0.3 - a.d) / 2.4)); }); guns.forEach(a => a.set(0));
      usTint(t, ss(tMill - 0.2, tMill + 0.5, t));
      return U.film(t) + U.badge(t, 'La droga va al norte', 'Millones de consumidores', 'Fentanilo, cocaína, metanfetamina', tB + 0.2, tC)
        + M.acity(ctx, A, 'Los Ángeles', fade(t, tNorte + 0.6, tC)) + M.acity(ctx, A, 'Chicago', fade(t, tNorte + 1.0, tC)) + M.acity(ctx, A, 'Nueva York', fade(t, tNorte + 1.4, tC))
        + U.counter(t, tCasi - 0.2, tC, 1180, 420, 70000, 'muertes por sobredosis en EE. UU. en 2025', { from: 20000, dur: 1.3, color: '#ff8a6a', prefix: '≈', w: 600 })
        + U.source(t, tSobre, tC, 'CDC, cifras provisionales');
    } },
    { t0: tC, set: A, p0: [-4.5, 32, 5], l0: [-4.5, 0, -8.6], p1: [-5.0, 30, 4], l1: [-5.0, 0, -8.0], fov0: 38, act: (t) => {
      const kd = 1 - ss(tC, tC + 0.6, t); drugs.forEach(a => { a.visible = kd > 0.01; a.set(kd); });
      guns.forEach(a => { a.visible = true; a.set(clamp((t - tSur + 0.4 - a.d) / 2.0)); });
      usTint(t, 0.6 * (1 - ss(tC, tC + 0.6, t)));
      return U.film(t) + U.badge(t, 'Las armas van al sur', 'Tráfico de armas', 'Compradas legalmente, cruzan de contrabando', tC + 0.2, tD)
        + U.guns10(t, tSiete - 0.3, tD, 7, tSiete + 0.1, { x: 1180, y: 300, title: '7 de cada 10', sub: 'armas rastreadas en México vienen de EE. UU.' })
        + U.source(t, tRast, tD, 'ATF / GAO, rastreo de armas aseguradas en México');
    } },
    { t0: tD, set: W, p0: [5.5, 1.6, 10], l0: [-1.5, 3.4, -16], p1: [4.6, 1.6, 8.5], l1: [-1.5, 3.6, -16], fov0: 40, act: (t) => {
      W.flag.wave(t);
      const C6 = ['Cártel de Sinaloa', 'Cártel Jalisco Nueva Generación', 'Cárteles Unidos', 'Cártel del Noreste', 'Cártel del Golfo', 'La Nueva Familia Michoacana'];
      return U.film(t) + U.badge(t, 'Febrero de 2025', 'Cárteles declarados terroristas', 'Gobierno de Donald Trump', tTrump - 0.2, ctx.dur + 1)
        + U.doc(t, tSeis - 0.4, ctx.dur + 1, 'Organizaciones terroristas extranjeras', C6.map((c, i) => [c, tSeis - 0.2 + i * 0.22]), { left: 90, top: 110, width: 600 })
        + U.icons(t, tAranc - 0.2, ctx.dur + 1, [['💲', 'Aranceles', tAranc - 0.1], ['⚠️', 'Amenazas de ataques militares', tAmen - 0.1]], { y: 800 });
    } },
  ];
  const inst = { scene: Bd, scenes: [Bd, A, W], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
