import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as A from '../anim.js';
import * as WM from '../wmap.js';
import { leader, NAMES } from '../leaders.js';

export { preload } from '../wmap.js';
const fade = WM.fade;
const fz = (arr, poseFn, keep = () => false, face = 'neutral') => arr.forEach((c, i) => { if (keep(i)) return; c.setFace('open', face); K.freeze(c, poseFn(i)); });
const show = (arr, v) => arr.forEach(c => { c.root.visible = v; });

export function build(ctx) {
  const L = ctx.L;
  const tPal = wt(L[0], 'palacio'), tAle = wt(L[0], 'alemania'), tFir = wt(L[0], 'firmo'), tImp = wt(L[0], 'impusieron'), tVen = wt(L[0], 'vencedores');
  const tTer = wt(L[1], 'territorio'), tCol = wt(L[1], 'colonias'), tEj = wt(L[1], 'ejercito'), tCien = wt(L[1], 'cien'), tAce = wt(L[1], 'aceptar'), tCul = wt(L[1], 'culpa'), tRep = wt(L[1], 'reparaciones');
  const tDes = wt(L[2], 'desaparecieron'), tAl = wt(L[2], 'aleman'), tAus = wt(L[2], 'austrohungaro'), tRu = wt(L[2], 'ruso'), tOto = wt(L[2], 'otomano'), tNac = wt(L[2], 'nacieron'), tNue = wt(L[2], 'nuevos'),
    tPol = wt(L[2], 'polonia'), tChe = wt(L[2], 'checoslovaquia'), tYug = wt(L[2], 'yugoslavia');
  const tB = tAle - 0.35, tC = tImp - 0.35, tD = L[1].t0 - 0.3, tE = tEj - 0.3, tF = tAce - 0.35, tG = L[2].t0 - 0.35, tH = tNac - 0.45;

  // ---- 1-3, 6. The Hall of Mirrors, 28 June 1919
  const Hm = S.hallOfMirrors();
  const side = [...K.crowd(Hm, ['diplomatico', 'oficialBritanico', 'diplomatico', 'foch'], 14, [-4.9, -11, -3.1, 7], { seed: 1201, yaw: Math.PI / 2 }),
    ...K.crowd(Hm, ['diplomatico', 'diplomatico', 'tommyCap', 'diplomatico'], 14, [3.1, -11, 4.9, 7], { seed: 1202, yaw: -Math.PI / 2 })];
  fz(side, i => C.idle(0.4 + i * 0.17, i, 0.3));
  // the German signatories at the treaty table, the victors behind it
  const [sx, sy, sz] = Hm.seats(2);
  const muller = K.person(Hm, 'oguri', 'diplomatico', sx, sz, 0); muller.root.position.y = sy;
  const bell = K.person(Hm, 'helios', 'diplomatico', 0.85, -3.05, -0.3);
  const victors = [['clemenceau', -1.3, -3.15, 0.2], ['wilson', -2.15, -3.3, 0.3], ['lloydGeorge', 1.9, -3.3, -0.3]].map(([w, x, z, y]) => leader(Hm, w, x, z, y));
  // the Big Four, posed as in their famous photograph (Lloyd George, Orlando, Clemenceau, Wilson)
  const big4 = ['lloydGeorge', 'orlando', 'clemenceau', 'wilson'].map((w, i) => leader(Hm, w, -1.8 + i * 1.2, 4.2, (1.5 - i) * 0.08));
  // ---- 5. The Reichswehr: 100,000 men
  const Pa = S.stage('overcast', ['#a39c8c', '#988f7e']);
  const bar = S.facade(30, 7, '#c9b48e', { floors: 2, seed: 3, roof: '#6a4a3a' }); bar.position.set(0, 0, -8); Pa.add(bar);
  const rw = [...Array(10)].map((_, i) => K.person(Pa, ['doto', 'oguri', 'suzuka', 'helios', 'tamamo', 'mcqueen', 'daiwa', 'cafe'][i % 8], 'aleman', -2.4 + (i % 5) * 1.2, -2.2 - Math.floor(i / 5) * 1.1, 0));
  const rwOff = K.person(Pa, 'cafe', 'oficialAleman', 0.2, 0.2, Math.PI);
  // ---- 4, 7-8. Map of Europe: German losses, fallen empires, the new states
  const Mp = WM.europeMap({ period: 1914 });
  const LOST = ['als', 'ppol', 'mem', 'nsch'];
  const EMP = [['GER', tAl], ['AUH', tAus], ['RUE', tRu], ['OTT', tOto]];
  const empIds = new Set(EMP.flatMap(([st]) => Mp.groupsOf(1914, st))), GREY = new THREE.Color('#d8d2c4');
  const VIVID = { GER: '#6f7884', AUH: '#e0b83a', RUE: '#e07a40', OTT: '#86a84a' };

  const sfx = [{ t: 0, type: 'crowd', dur: tD, vol: 0.22 }, { t: 0.4, type: 'swell', dur: tB, vol: 0.25 }, { t: tFir + 0.2, type: 'paper', vol: 0.45 }, { t: tVen, type: 'shutter', vol: 0.4 },
    { t: tD, type: 'whoosh', vol: 0.3 }, ...LOST.map((_, i) => ({ t: tTer + i * 0.15, type: 'pop', vol: 0.3 })), { t: tCol, type: 'tick', vol: 0.35 },
    { t: tE, type: 'march', dur: tF - tE, vol: 0.3 }, { t: tCien - 0.05, type: 'tick', vol: 0.35 }, { t: tF, type: 'clock', dur: tG - tF, vol: 0.2 }, { t: tCul, type: 'stamp', vol: 0.4 }, { t: tRep, type: 'cash', vol: 0.45 },
    { t: tG, type: 'whoosh', vol: 0.3 }, ...EMP.map(([, ta]) => ({ t: ta + 0.15, type: 'hit', vol: 0.35 })), { t: tH, type: 'swell', dur: ctx.dur - tH, vol: 0.3 },
    ...[tPol, tChe, tYug].map(x => ({ t: x, type: 'pop', vol: 0.4 }))];

  const shots = [
    { t0: 0, set: Hm, p0: [0, 2.6, 14], l0: [0, 1.6, -6], p1: [0, 2.3, 9.5], l1: [0, 1.5, -6], fov0: 46, act: (t) => {
      show(big4, false); show([muller, bell, ...victors], true);
      K.pose(muller, A.sit(t, 1)); K.pose(bell, C.idle(t, 2, 0.4)); victors.forEach((v, i) => K.pose(v, C.idle(t, i + 3, 0.4)));
      return U.film(t) + U.datePage(t, 0.5, tB + 0.2, 'Tratado de Versalles', 'JUNIO', '28', '1919', { x: 1560, y: 110, accent: '#2a4a7a' })
        + U.badge(t, 'Palacio de Versalles', 'Galería de los Espejos', 'Cinco años exactos después del atentado de Sarajevo', tPal - 0.3, tB);
    } },
    { t0: tB, set: Hm, p0: [0.95, 0.98, 0.5], l0: [0, 0.72, -2.6], p1: [0.8, 0.96, 0.2], l1: [0, 0.72, -2.6], fov0: 42, act: (t) => {
      show(big4, false); show([muller, bell, ...victors], true);
      K.pose(muller, t > tFir - 0.2 ? { ...A.sign(t, 1), head: [8, 0, 0] } : A.sit(t, 1)); muller.setFace(C.blinkEye(t, 1), 'frown');
      K.pose(bell, C.idle(t, 2, 0.4)); bell.setFace(C.blinkEye(t, 2), 'frown');
      victors.forEach((v, i) => { K.pose(v, C.idle(t, i + 3, 0.4)); v.setFace(C.blinkEye(t, i + 3), 'neutral'); });
      return U.film(t) + U.pin(ctx, [0.4, 1.55, -2.8], 'Delegación alemana', 'Hermann Müller y Johannes Bell', ss(tB + 0.2, tB + 0.5, t), '#9aa0a8');
    } },
    { t0: tC, set: Hm, p0: [0, 1.0, 8.0], l0: [0, 0.7, 4.2], p1: [0, 0.98, 7.4], l1: [0, 0.7, 4.2], fov0: 42, act: (t) => {
      show(big4, true); show([muller, bell, ...victors], false);
      big4.forEach((c, i) => { K.pose(c, C.idle(t, i + 6, 0.35)); c.setFace(C.blinkEye(t, i + 6), 'neutral'); });
      const sub = { lloydGeorge: 'Gran Bretaña', orlando: 'Italia', clemenceau: 'Francia', wilson: 'Estados Unidos' };
      return U.film(t) + big4.map((c, i) => U.pin(ctx, [c.root.position.x, 1.24, c.root.position.z], NAMES[c.leader][0].split(' ').slice(-1)[0] === 'George' ? 'Lloyd George' : NAMES[c.leader][0].split(' ').slice(-1)[0], sub[c.leader], ss(tC + 0.15 + i * 0.22, tC + 0.45 + i * 0.22, t))).join('')
        + U.big(t, tC + 0.1, tD + 0.2, 'Los «Cuatro Grandes»', { top: 60, size: 52 }) + U.source(t, tC + 0.4, tD + 0.2, 'Redactaron el tratado; a Alemania no se le permitió negociar');
    } },
    { t0: tD, set: Mp, p0: [-1, 23, 13.5], l0: [-1, 0, -3.5], p1: [-1, 21, 12], l1: [-1, 0, -3.5], fov0: 40, act: (t) => {
      Mp.paint(1914); Mp.tintState(1914, 'GER', '#8f949a', 1, 0.5);
      const k = ss(tTer - 0.2, tTer + 0.5, t) * (0.8 + 0.2 * Math.sin(t * 6) ** 2); LOST.forEach(id => Mp.tint(id, '#e8a33a', k, 0.9));
      const lk = i => fade(t, tTer - 0.1 + i * 0.15, ctx.dur + 1);
      return U.film(t) + WM.chip(ctx, 6.4, 48.75, lk(0), 'Alsacia-Lorena', 'a Francia', '#3f6fb5', 0.3) + WM.chip(ctx, 17.3, 52.9, lk(1), 'Posnania y el «corredor»', 'a Polonia', '#c0392b', 0.3)
        + WM.chip(ctx, 9.3, 55.25, lk(2), 'Schleswig del Norte', 'a Dinamarca', '#c9a227', 0.3) + WM.chip(ctx, 21.3, 55.65, lk(3), 'Memel', 'a Lituania', '#3f8a5a', 0.3)
        + U.big(t, tTer - 0.2, tE + 0.2, 'Pierde el 13 % de su territorio europeo', { top: 70, size: 48 })
        + U.card(t, tCol - 0.25, tE + 0.3, 'Y TODAS SUS COLONIAS', 'África y el Pacífico', 'Camerún, Togo, África del Sudoeste, África Oriental, Nueva Guinea, Samoa…', { left: 1240, top: 600, width: 600, accent: '#e8a33a' });
    } },
    { t0: tE, set: Pa, p0: [3.6, 1.4, 4.2], l0: [0, 0.8, -2.6], p1: [3.0, 1.35, 3.6], l1: [0, 0.8, -2.6], fov0: 44, act: (t) => {
      Pa.tick && Pa.tick(t);
      rw.forEach((c, i) => { K.pose(c, A.guard(t, i)); c.setFace(C.blinkEye(t, i), 'neutral'); });
      K.pose(rwOff, C.idle(t, 3, 0.4)); rwOff.setFace(C.blinkEye(t, 3), 'neutral');
      return U.film(t) + U.counter(t, tCien - 0.3, tF + 0.3, 1240, 140, 100000, 'soldados como máximo', { from: 0, dur: 1.0, color: '#ffcf6a', w: 560 })
        + U.source(t, tCien + 0.4, tF + 0.3, 'Sin tanques, sin aviación militar y sin submarinos');
    } },
    { t0: tF, set: Hm, p0: [0.75, 0.92, -0.75], l0: [0, 0.68, -2.55], p1: [0.6, 0.9, -1.0], l1: [0, 0.68, -2.55], fov0: 40, act: (t) => {
      show(big4, false); show([muller, bell, ...victors], true);
      K.pose(muller, { ...A.sit(t, 1), head: [12, 0, 0] }); muller.setFace(C.blinkEye(t, 1, 'flat'), 'frown');
      K.pose(bell, C.idle(t, 2, 0.4)); victors.forEach((v, i) => K.pose(v, C.idle(t, i + 3, 0.4)));
      return U.film(t) + U.doc(t, tF + 0.1, tG + 0.2, 'Artículo 231', [['«Alemania acepta la responsabilidad de Alemania y sus aliados por haber causado todas las pérdidas y daños…»', tCul - 0.3]], { left: 80, top: 110, width: 620, foot: 'la «cláusula de la culpa»' })
        + U.counter(t, tRep - 0.3, tG + 0.3, 1300, 150, 132, 'mil millones de marcos oro en reparaciones', { from: 0, dur: 1.0, color: '#ffcf6a', w: 560 })
        + U.source(t, tRep + 0.2, tG + 0.3, 'La cifra se fijó en 1921');
    } },
    { t0: tG, set: Mp, p0: [14, 62, 44], l0: [14, 0, 4], p1: [14, 58, 41], l1: [14, 0, 4], fov0: 40, act: (t) => {
      Mp.paint(1914);
      for (const [id, g] of Object.entries(Mp.groups)) if (!empIds.has(id)) g.mat.color.lerp(GREY, 0.6);
      EMP.forEach(([st, ta]) => { Mp.tintState(1914, st, VIVID[st], 1 - ss(ta, ta + 0.4, t), 0.8); Mp.tintState(1914, st, '#aaa496', ss(ta, ta + 0.5, t), 0.88); });
      return U.film(t) + U.struck(t, tG + 0.2, tH + 0.2, EMP.map(([st, ta]) => [{ GER: 'Imperio alemán', AUH: 'Austria-Hungría', RUE: 'Imperio ruso', OTT: 'Imperio otomano' }[st], ta - 0.35, ta + 0.1]), 0, { top: 96 })
        + U.big(t, tG + 0.1, tAl - 0.2, 'Cuatro imperios desaparecieron', { top: 150, size: 56 })
        + [['GER', 'IMPERIO ALEMÁN', 10.5, 51.6], ['AUH', 'AUSTRIA-HUNGRÍA', 18.5, 47.6], ['RUE', 'IMPERIO RUSO', 40, 52], ['OTT', 'IMPERIO OTOMANO', 36, 37.5]].map(([st, n, lo, la]) => WM.areaLabel(ctx, lo, la, n, fade(t, tG + 0.2, EMP.find(e => e[0] === st)[1] + 0.5), 'st')).join('');
    } },
    { t0: tH, set: Mp, p0: [7, 44, 32], l0: [7, 0, 1], p1: [7, 40, 29], l1: [7, 0, 1], fov0: 40, act: (t) => {
      const k = ss(tH + 0.1, tNac + 0.7, t); Mp.paint(1914, 1923, k);
      [['POL', tPol], ['TCH', tChe], ['YUG', tYug]].forEach(([st, ta]) => Mp.tintState(1923, st, '#ffffff', ss(ta - 0.15, ta + 0.1, t) * (1 - ss(ta + 0.3, ta + 0.9, t)) * 0.6, 1));
      const lk = ta => fade(t, ta - 0.15, ctx.dur + 1);
      return U.film(t) + WM.chip(ctx, 19.2, 52.3, lk(tPol), 'POLONIA', '', '#c0392b', 0.3) + WM.chip(ctx, 16.8, 49.4, lk(tChe), 'CHECOSLOVAQUIA', '', '#6a5aa8', 0.3)
        + WM.chip(ctx, 18.6, 44.2, lk(tYug), 'YUGOSLAVIA', '', '#a8508a', 0.3)
        + [['FINLANDIA', 26, 62.5], ['ESTONIA', 25.8, 58.7], ['LETONIA', 25.5, 56.9], ['LITUANIA', 23.9, 55.3], ['AUSTRIA', 14.2, 47.4], ['HUNGRÍA', 19.4, 47.1]].map(([n, lo, la], i) => WM.areaLabel(ctx, lo, la, n, fade(t, tNue - 0.2 + i * 0.1, ctx.dur + 1), 'st')).join('')
        + U.source(t, tNue, ctx.dur + 1, 'También nacieron o renacieron Finlandia, Estonia, Letonia y Lituania');
    } },
  ];
  const inst = { scene: Hm, scenes: [Hm, Pa, Mp], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
