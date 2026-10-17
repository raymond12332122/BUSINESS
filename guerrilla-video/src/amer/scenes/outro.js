import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as LP from '../../lib/props.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as A from '../anim.js';
import * as AM from '../amap.js';
import { lineup, animLineup, BACK, FRONT } from './title.js';

export { preload } from '../amap.js';
const fade = AM.fade;

export function build(ctx) {
  const L = ctx.L;
  const tMed = wt(L[0], 'medio'), tCam = wt(L[0], 'cambio'), tCub = wt(L[0], 'cuba'), tHas = wt(L[0], 'hasta');
  const tPaz = wt(L[1], 'paz'), tGra = wt(L[1], 'gran'), tCen = wt(L[1], 'centroamerica'), tGue = wt(L[1], 'guerras'), tEsc = wt(L[1], 'esclavitud'), tEst = wt(L[1], 'estados'), tBra = wt(L[1], 'brasil');
  const tMur = wt(L[2], 'murio'), tDes = wt(L[2], 'desilusionado'), tAun = wt(L[2], 'aun'), tNac = wt(L[2], 'nacieron');
  const tGrac = wt(L[3], 'gracias'), tEle = wt(L[3], 'elenco');
  const tB = L[1].t0 - 0.3, tC = L[2].t0 - 0.3, tD = tAun - 0.3;

  const Mp = AM.americasMap({ period: 1775 });
  const pCu = AM.pulse(Mp, -79.5, 21.8, '#e9c769', 3.0), pPR = AM.pulse(Mp, -66.5, 18.25, '#e9c769', 2.0);
  const CAM = { gtm: '#7fb8a0', slv: '#a0c86a', hnd: '#6aa0c8', nic: '#c8a06a', cri: '#a07ac8' };
  // ---- Bolívar, 1830
  const Dk = S.sierra('dusk', { seed: 1311, height: 0.8 });
  const bol = K.role(Dk, 'bolivar', 0, 0, 0.3);
  // ---- curtain call
  const Th = S.theater(); Th.backdrop.material.map = AM.paperMap(1024, 512, { title: 'Las Américas · 1775–1825' }); Th.backdrop.material.needsUpdate = true;
  const LU = lineup(Th);
  const rows = [...BACK, ...FRONT].filter(w => K.CARD[w]).map(w => [K.CARD[w][0], K.CARD[w][1], '']);
  rows.push(['…y todas las chibis', 'como soldados, criollos y pueblo', '']);

  const sfx = [{ t: 0.2, type: 'swell', dur: tB, vol: 0.25 }, { t: tCub, type: 'pop', vol: 0.35 }, { t: tB, type: 'whoosh', vol: 0.3 }, { t: tGra, type: 'crack', vol: 0.35 }, { t: tCen, type: 'crack', vol: 0.35 },
    ...[0, 1, 2, 3].map(i => ({ t: tEsc + i * 0.35, type: 'tick', vol: 0.3 })), { t: tC, type: 'wind', dur: tD - tC, vol: 0.3 }, { t: tD, type: 'curtain', vol: 0.4 }, { t: tD + 0.2, type: 'applause', dur: ctx.dur - tD - 0.2, vol: 0.4 }];

  const shots = [
    { t0: 0, set: Mp, p0: [0, 330, 110], l0: [0, 0, 0], p1: [0, 300, 92], l1: [0, 0, -2], fov0: 40, act: (t) => {
      Mp.paint(1775, 1830, ss(tCam - 0.2, tCam + 1.2, t)); Mp.zoom(3.2); pCu.update(t, tCub - 0.1); pPR.update(t, tCub + 0.2);
      if (t > tCub - 0.2) ['cub', 'pri'].forEach(g => Mp.tint(g, '#f2b636', 0.6 + 0.4 * Math.sin(t * 5) ** 2, 0.9));
      return U.film(t) + U.year(t, 0.3, tB + 0.2, t < tCam ? '1775' : '1830', { x: 1660, top: 80 })
        + AM.chip(ctx, -79.5, 21.8, fade(t, tCub - 0.1, tB + 0.3), 'Cuba y Puerto Rico', 'españolas hasta 1898', '#c9a227', 3);
    } },
    { t0: tB, set: Mp, p0: [-4, 200, 70], l0: [-4, 0, 2], p1: [-4, 190, 64], l1: [-4, 0, 2], fov0: 40, act: (t) => {
      Mp.paint(1830); Mp.zoom(2.4);
      ['ven', 'col', 'ecu'].forEach((g, i) => Mp.tint(g, ['#f0b860', '#f2d468', '#e4e07a'][i], ss(tGra - 0.2, tGra + 0.4, t), 0.9));
      for (const [g, c] of Object.entries(CAM)) Mp.tint(g, c, ss(tCen - 0.2, tCen + 0.4, t), 0.9);
      return U.film(t) + AM.areaLabel(ctx, -66, 7.5, 'VENEZUELA', fade(t, tGra, ctx.dur + 1), 'st', 20) + AM.areaLabel(ctx, -74, 4, 'NUEVA GRANADA', fade(t, tGra + 0.15, ctx.dur + 1), 'st', 20)
        + AM.areaLabel(ctx, -78.5, -1.6, 'ECUADOR', fade(t, tGra + 0.3, ctx.dur + 1), 'st', 20)
        + U.dateStrip(t, tEsc - 0.3, ctx.dur + 1, [['Haití · 1804', 'abolición', tEsc - 0.2, '#6d8fd0'], ['México · 1829', 'abolición', tEsc + 0.15, '#7fb878'], ['EE. UU. · 1865', 'abolición', tEst - 0.1, '#a3bde4'], ['Brasil · 1888', 'la última de América', tBra - 0.1, '#b9d46c']], { top: 110 });
    } },
    { t0: tC, set: Dk, p0: [1.4, 1.5, 3.6], l0: [0, 1.15, -0.2], p1: [1.0, 1.45, 3.0], l1: [0, 1.15, -0.2], fov0: 40, act: (t) => {
      K.pose(bol, A.sad(t, 1)); bol.setFace('flat', 'frown');
      return U.film(t) + U.quote(t, [['Los que han servido a la revolución', tMur], ['han arado en el mar', tDes]], 'Simón Bolívar, 1830', tMur - 0.3, tD + 0.2, 24)
        + U.source(t, tMur, tD + 0.2, 'Bolívar murió en Santa Marta el 17 de diciembre de 1830');
    } },
    { t0: tD, set: Th, p0: [-2.2, 1.75, 6.6], l0: [-2.2, 1.15, -2.4], p1: [-1.9, 1.66, 5.8], l1: [-1.9, 1.12, -2.4], fov0: 52, act: (t) => {
      animLineup(LU, t);
      return U.big(t, tNac - 0.3, tGrac, 'De aquellos gritos nacieron casi todos los países de América', { top: 70, size: 44 })
        + U.credits(t, tD + 0.6, ctx.dur - 0.2, rows, { x: 1290, w: 560 })
        + U.big(t, ctx.dur - 3.2, ctx.dur + 1, '¡Gracias por ver!', { top: 80, size: 64 });
    } },
  ];
  const inst = { scene: Mp, scenes: [Mp, Dk, Th], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
