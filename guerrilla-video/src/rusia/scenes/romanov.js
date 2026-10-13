import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as A from '../anim.js';

export async function preload() {}

export function build(ctx) {
  const L = ctx.L;
  const tNoche = wt(L[0], 'noche'), tEkat = wt(L[0], 'ekaterimburgo'), tFus = wt(L[0], 'fusilaron'), tZar = wt(L[0], 'zar'), tZarina = wt(L[0], 'zarina'), tCinco = wt(L[0], 'cinco'), tCuatro = wt(L[0], 'cuatro');
  const tDec = wt(L[1], 'decadas'), tAna = wt(L[1], 'anastasia'), tPero = wt(L[1], 'pero'), tADN = wt(L[1], 'adn');

  // ---- 1. The Ipatiev House at night
  const H = S.ipatievNight();
  const sentries = [K.person(H, 'doto', 'guardiaRoja', -2.2, 4.2, 0.2), K.person(H, 'oguri', 'chekista', 1.8, 4.0, -0.3)];
  // ---- 2/3. The empty basement room
  const B = S.ipatievBasement();

  const tB = tFus - 0.5, tC = L[1].t0 - 0.3;
  const sfx = [{ t: 0.0, type: 'night', dur: tB + 1, vol: 0.35 }, { t: tB, type: 'drone', dur: ctx.dur - tB, vol: 0.3 }, { t: tZar, type: 'tick', vol: 0.3 }, { t: tZarina, type: 'tick', vol: 0.3 },
    { t: tCinco, type: 'tick', vol: 0.3 }, { t: tCuatro, type: 'tick', vol: 0.3 }, { t: tAna - 0.3, type: 'swoosh', vol: 0.4 }, { t: tADN - 0.1, type: 'sting2', vol: 0.4 }];
  const shots = [
    { t0: 0, set: H, p0: [2.6, 1.5, 15], l0: [0, 2.8, -2], p1: [1.8, 1.4, 11.5], l1: [0, 3.0, -2], fov0: 44, act: (t) => {
      H.tick(t);
      sentries.forEach((s, i) => { K.pose(s, { ...A.guard(t, i), gun: i ? 'none' : 'port' }); s.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.badge(t, 'Ekaterimburgo · julio de 1918', 'La Casa Ipátiev', 'Aquí estaba presa la familia del zar', tNoche - 0.2, tB);
    } },
    { t0: tB, set: B, p0: [0.9, 1.05, 1.6], l0: [0, 0.45, -1.5], p1: [0.6, 1.0, 1.0], l1: [0, 0.45, -1.5], fov0: 44, act: (t) => {
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(0,0,0,${0.25 + 0.25 * ss(tB, tB + 1.5, t)})"></div>`
        + U.family(t, tZar - 0.4, tC, 'Noche del 16 al 17 de julio de 1918', [['Nicolás II', 1, tZar - 0.1], ['Alejandra', 1, tZarina - 0.1], ['5 hijos', 5, tCinco - 0.1], ['4 sirvientes', 4, tCuatro - 0.1]], { y: 150, dim: ss(tCuatro + 0.6, tCuatro + 1.4, t) * 0.8 })
        + U.big(t, tCuatro + 0.9, tC, '11 personas', { top: 520, size: 64 });
    } },
    { t0: tC, set: B, p0: [-0.9, 1.0, 1.3], l0: [0.1, 0.5, -1.5], p1: [-0.6, 0.98, 0.9], l1: [0.1, 0.5, -1.5], fov0: 44, act: (t) => {
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(0,0,0,.45)"></div>`
        + U.newspaper(t, tDec - 0.2, tPero - 0.1, { mast: 'LA PRENSA MUNDIAL', date: '1920 – 1990', head: '¿Sobrevivió Anastasia?', sub: 'Durante décadas, varias mujeres dijeron ser la hija del zar' })
        + U.card(t, tADN - 0.3, ctx.dur + 1, 'ADN · 2007–2009', 'No sobrevivió', 'Los restos de toda la familia fueron identificados', { left: 660, top: 300, width: 600, accent: '#7fd0a0' });
    } },
  ];
  const inst = { scene: H, scenes: [H, B], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
