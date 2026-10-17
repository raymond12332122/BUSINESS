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

export { preload } from '../amap.js';
const fade = AM.fade;

export function build(ctx) {
  const L = ctx.L;
  const tEsp = wt(L[0], 'espana'), tCal = wt(L[0], 'california'), tPat = wt(L[0], 'patagonia'), tVir = wt(L[0], 'virreinatos'), tNE = wt(L[0], 'nueva'), tPer = wt(L[0], 'peru'), tRio = wt(L[0], 'rio');
  const tPor = wt(L[1], 'portugal'), tBri = wt(L[1], 'bretana'), tCan = wt(L[1], 'canada'), tTre = wt(L[1], 'trece'), tFra = wt(L[1], 'francia'), tSD = wt(L[1], 'san'), tRica = wt(L[1], 'rica');
  const tMan = wt(L[2], 'mandaban'), tCri = wt(L[2], 'criollos'), tRel = wt(L[2], 'relegados'), tInd = wt(L[2], 'indigenas'), tEsc = wt(L[2], 'esclavizados');
  const tB = tPor - 0.35, tC = tFra - 0.3, tD = L[2].t0 - 0.35;

  const Mp = AM.americasMap({ period: 'virr' });
  const pCal = AM.pulse(Mp, -120, 37, '#c0392b', 3.5), pPat = AM.pulse(Mp, -68.5, -42, '#c0392b', 3.5), pSD = AM.pulse(Mp, -72.4, 19.1, '#2a4fa0', 1.0);
  const VIRR = [['NUEVA ESPAÑA', -104, 25, tNE], ['PERÚ', -75, -10, tPer], ['RÍO DE LA PLATA', -62, -25.5, tRio], ['NUEVA GRANADA', -74, 3, tVir + 0.2], ['GUATEMALA', -88.5, 14.6, tVir + 0.35], ['CHILE', -71.5, -31.5, tVir + 0.5]];
  const [hx, , hz] = AM.apos(-72.5, 19.0);
  // ---- colonial plaza: who was who
  const Pz = S.plaza('day', { arcade: true });
  Pz.add(LP.at(LP.box(3.0, 0.5, 2.0, '#cdb48a'), -3.4, 0.25, -3.4));
  const pen = [K.person(Pz, 'mcqueen', 'peninsular', -3.9, -3.4, 0.25), K.person(Pz, 'suzuka', 'peninsular', -2.9, -3.5, 0.1)]; pen.forEach(c => { c.root.position.y = 0.5; });
  const cri = [K.person(Pz, 'cafe', 'criollo', -1.3, -2.3, 0.2), K.person(Pz, 'helios', 'criollo', -0.3, -2.6, 0.1), K.person(Pz, 'daiwa', 'dama', 0.6, -2.2, 0)];
  const pue = K.crowd(Pz, ['indigena', 'insurgenteF', 'dama', 'indigena', 'trabajador', 'insurgenteF'], 12, [1.4, -4.2, 5.4, -1.6], { seed: 21, yaw: -0.25 });
  pue.forEach((c, i) => K.freeze(c, C.idle(0.3 + i * 0.2, i, 0.3)));

  const sfx = [{ t: 0.2, type: 'whoosh', vol: 0.3 }, { t: tCal, type: 'pop', vol: 0.3 }, { t: tPat, type: 'pop', vol: 0.3 }, ...VIRR.map(v => ({ t: v[3], type: 'tick', vol: 0.3 })),
    { t: tPor, type: 'pop', vol: 0.3 }, { t: tBri, type: 'pop', vol: 0.3 }, { t: tC, type: 'whoosh', vol: 0.3 }, { t: tSD, type: 'pop', vol: 0.35 }, { t: tRica, type: 'cash', vol: 0.35 },
    { t: tD, type: 'crowd', dur: ctx.dur - tD, vol: 0.25 }, ...[tMan, tCri, tInd, tEsc].map(x => ({ t: x, type: 'tick', vol: 0.32 }))];

  const shots = [
    { t0: 0, set: Mp, p0: [0, 330, 106], l0: [0, 0, 12], p1: [4, 270, 92], l1: [4, 0, 6], fov0: 40, act: (t) => {
      Mp.paint('virr'); Mp.zoom(3.2); Mp.tintState('virr', 'ESP', '#ffffff', 0, 0);
      for (const st of ['V_NES', 'V_GUA', 'V_NGR', 'V_VEN', 'V_PER', 'V_RPL', 'V_CHL', 'V_CUB']) Mp.tintState('virr', st, '#f2b636', ss(tEsp - 0.2, tEsp + 0.4, t) * (1 - ss(tVir - 0.2, tVir + 0.5, t)), 0.5);
      pCal.update(t, tCal - 0.1, tB); pPat.update(t, tPat - 0.1, tB);
      return U.film(t) + AM.chip(ctx, -120, 37, fade(t, tCal - 0.1, tVir), 'California', '', '#c0392b', 2) + AM.chip(ctx, -68.5, -42, fade(t, tPat - 0.1, tVir + 0.6), 'Patagonia', '', '#c0392b', 2)
        + VIRR.map(([n, lo, la, ta]) => AM.areaLabel(ctx, lo, la, n, fade(t, ta - 0.15, tB + 0.3), 'st', 24)).join('')
        + U.badge(t, 'Hacia 1775', 'El Imperio español', 'Virreinatos y capitanías generales', 0.4, tVir);
    } },
    { t0: tB, set: Mp, p0: [4, 270, 92], l0: [4, 0, 6], p1: [0, 280, 80], l1: [0, 0, -6], fov0: 40, act: (t) => {
      Mp.paint(1775); Mp.zoom(3.2);
      Mp.tintState(1775, 'POR', '#3f9a4a', ss(tPor - 0.2, tPor + 0.3, t) * (1 - ss(tBri - 0.2, tBri + 0.3, t)), 0.6);
      Mp.tintState(1775, 'GBR', '#c0392b', ss(tBri - 0.2, tBri + 0.3, t), 0.45); Mp.tintState(1775, 'C13', '#c0392b', ss(tTre - 0.2, tTre + 0.3, t), 0.7);
      return U.film(t) + AM.areaLabel(ctx, -50, -9, 'BRASIL (PORTUGAL)', fade(t, tPor - 0.15, tC + 0.3), 'st') + AM.areaLabel(ctx, -98, 58, 'CANADÁ', fade(t, tCan - 0.15, tC + 0.3), 'st')
        + AM.chip(ctx, -78, 38.5, fade(t, tTre - 0.15, tC + 0.3), 'Trece colonias', 'británicas', '#c0392b', 2);
    } },
    { t0: tC, set: Mp, p0: [hx - 6, 52, hz + 20], l0: [hx - 4, 0, hz], p1: [hx - 1, 34, hz + 14], l1: [hx, 0, hz], fov0: 40, act: (t) => {
      Mp.paint(1775); Mp.zoom(0.55); Mp.tintState(1775, 'FRA', '#2a4fa0', ss(tFra - 0.1, tFra + 0.4, t), 0.55);
      pSD.update(t, tSD - 0.1);
      return U.film(t) + AM.chip(ctx, -72.4, 19.1, fade(t, tSD - 0.1, ctx.dur + 1), 'Saint-Domingue', 'Francia · la colonia más rica del mundo', '#2a4fa0', 0.4)
        + AM.areaLabel(ctx, -79.5, 21.8, 'CUBA', fade(t, tC + 0.2, ctx.dur + 1), 'st', 22) + AM.areaLabel(ctx, -77.3, 18.1, 'JAMAICA', fade(t, tC + 0.2, ctx.dur + 1), 'st', 18)
        + AM.areaLabel(ctx, -66.5, 18.25, 'PUERTO RICO', fade(t, tC + 0.2, ctx.dur + 1), 'st', 18);
    } },
    { t0: tD, set: Pz, p0: [0.6, 1.5, 4.4], l0: [0.6, 0.9, -2.8], p1: [0.0, 1.42, 3.8], l1: [0.2, 0.9, -2.8], fov0: 46, act: (t) => {
      pen.forEach((c, i) => { K.pose(c, A.proud(t, i)); c.setFace(C.blinkEye(t, i), 'neutral'); });
      cri.forEach((c, i) => { K.pose(c, i === 1 ? A.fist(t, i + 3) : C.idle(t, i + 3)); c.setFace(C.blinkEye(t, i + 3, 'flat'), ss(tRel - 0.3, tRel, t) > 0.5 ? 'frown' : 'neutral'); });
      return U.film(t) + U.pyramid(t, tMan - 0.3, ctx.dur + 1, [['PENINSULARES', 'nacidos en España: el poder', '#b8432f', tMan - 0.2], ['CRIOLLOS', 'nacidos en América: relegados', '#c9962a', tCri - 0.2],
        ['INDÍGENAS Y MESTIZOS', 'la mayoría', '#5a8a3a', tInd - 0.2], ['ESCLAVIZADOS', 'africanos y sus descendientes', '#6a4a3a', tEsc - 0.2]], { x: 1500, y: 120, w: 700 });
    } },
  ];
  const inst = { scene: Mp, scenes: [Mp, Pz], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
