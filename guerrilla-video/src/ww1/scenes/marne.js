import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as A from '../anim.js';
import * as WM from '../wmap.js';

export { preload } from '../wmap.js';
const fade = WM.fade;
const fz = (arr, poseFn, keep = () => false, face = 'neutral') => arr.forEach((c, i) => { if (keep(i)) return; c.setFace('open', face); K.freeze(c, poseFn(i)); });

export function build(ctx) {
  const L = ctx.L;
  const tNav = wt(L[0], 'navidad'), tSep = wt(L[0], 'septiembre'), tAle = wt(L[0], 'alemanes'), tCin = wt(L[0], 'cincuenta'), tPar = wt(L[0], 'paris');
  const tFra = wt(L[1], 'franceses'), tFren = wt(L[1], 'frenaron'), tMarn = wt(L[1], 'marn'), tPar2 = wt(L[1], 'paris'), tRef = wt(L[1], 'refuerzos'), tTax = wt(L[1], 'taxis');
  const tCav = wt(L[2], 'cavaron'), tTri = wt(L[2], 'trincheras'), tLin = wt(L[2], 'linea'), tSet = wt(L[2], 'setecientos'), tCruz = wt(L[2], 'cruzo'), tMar = wt(L[2], 'mar'), tSui = wt(L[2], 'suiza');

  // ---- 1. August 1914: troops leave for the front
  const St = S.station1914('summer', { chalk: 'NACH PARIS!' });
  const sold = [0, 1, 2, 3, 4, 5].map(i => K.person(St, ['doto', 'oguri', 'helios', 'tamamo', 'suzuka', 'mcqueen'][i], 'aleman14', -6 + i * 1.3, 2.4 + (i % 2) * 0.5, Math.PI + (i % 3 - 1) * 0.3));
  sold.forEach(c => { c.root.position.y = 0.62; });
  const fans = K.crowd(St, ['civilMujer', 'civil'], 10, [-14, 4.9, -7, 5.6], { seed: 21, yaw: Math.PI });
  fans.forEach(c => { c.root.position.y = 0.62; });
  fz(fans, i => i % 2 ? C.wave(0.3 + i, i) : C.cheer(0.5 + i, i), i => i % 4 === 0, 'smile');
  // ---- 2. map: the German sweep towards Paris
  const Mp = WM.europeMap({ period: 1914 });
  const ar1 = WM.arrow(Mp, WM.ARROW.schlieffen, '#b8432f', 0.55), ar2 = WM.arrow(Mp, WM.ARROW.ardennes, '#b8432f', 0.55);
  const mLine = WM.front(Mp, WM.FRONT.marne1914, { color: '#7a1e14', width: 0.12 });
  const west = WM.front(Mp, WM.FRONT.west, { color: '#7a1e14', width: 0.16 });
  const paris = WM.pulse(Mp, 2.35, 48.86, '#2a5a9a', 1.4);
  // ---- 3. the Marne: French (still in red trousers) and British counter-attack
  const Fd = S.digField('summer');
  const atk = K.crowd(Fd, ['poilu14', 'poilu14', 'tommyCap'], 12, [-5, 4, 5, 10], { seed: 23, yaw: Math.PI, jitter: 0.5 });
  atk.forEach(c => { c.z0 = c.root.position.z; });
  // ---- 4. the taxis of the Marne
  const Rd = S.marneRoad('golden');
  const board = [0, 1, 2, 3].map(i => K.person(Rd, ['oguri', 'doto', 'helios', 'suzuka'][i], 'poilu14', -3.6 - i * 1.6, 0.6, Math.PI));
  const drv = K.person(Rd, 'tamamo', 'taxista', -4.6, -1.0, Math.PI / 2); drv.root.position.y = 0.55;
  // ---- 5. digging in
  const Dg = S.digField('overcast');
  const dig = [0, 1, 2, 3, 4].map(i => K.person(Dg, ['oguri', 'doto', 'helios', 'tamamo', 'suzuka'][i], 'poilu', -4 + i * 2.0, 0.3, Math.PI));
  dig.forEach((d, i) => { const sh = K.shovel(); sh.scale.setScalar(1.7); d.attach('wriR', sh, [-0.3, 0.46, 0.02], [0, 0, -90]); });

  const tB = tSep - 0.3, tC = L[1].t0 - 0.35, tD = tPar2 - 0.3, tE = L[2].t0 - 0.35, tF = tLin - 0.35;
  const sfx = [{ t: 0, type: 'crowd', dur: tB, vol: 0.4 }, { t: 0.2, type: 'train', dur: tB, vol: 0.25 }, { t: 0.6, type: 'cheer', vol: 0.3 }, { t: tB, type: 'whoosh', vol: 0.3 },
    { t: tAle, type: 'march', dur: tC - tAle, vol: 0.3 }, { t: tCin, type: 'tick', vol: 0.4 }, { t: tC, type: 'charge', vol: 0.45 }, { t: tC + 0.3, type: 'gunfire', dur: tD - tC, vol: 0.35 },
    { t: tC + 1.2, type: 'boom', vol: 0.3 }, { t: tD, type: 'engine', dur: tE - tD, vol: 0.35 }, { t: tE, type: 'wind', dur: tF - tE + 0.5, vol: 0.25 },
    ...[0, 0.9, 1.8, 2.7].map(x => ({ t: tE + 0.4 + x, type: 'thud', vol: 0.25 })), { t: tF, type: 'riser', dur: ctx.dur - tF, vol: 0.25 }, { t: tSui, type: 'sting2', vol: 0.4 }];

  const shots = [
    { t0: 0, set: St, p0: [3.6, 1.55, 4.6], l0: [-4.5, 1.3, 1.2], p1: [3.0, 1.5, 4.4], l1: [-5.0, 1.3, 1.2], fov0: 42, act: (t) => {
      St.tick(t);
      sold.forEach((c, i) => { K.pose(c, i % 2 ? C.wave(t, i) : C.cheer(t, i)); c.setFace(C.blinkEye(t, i), 'smile'); });
      fans.forEach((c, i) => { if (c.frozen) return; K.pose(c, C.wave(t, i)); c.setFace(C.blinkEye(t, i), 'smile'); });
      return U.film(t) + U.badge(t, 'Agosto de 1914', '¡A París!', 'Los soldados parten entre aplausos', 0.3, tNav - 0.3)
        + U.quote(t, ['«Todo habrá terminado', 'antes de Navidad»'], 'lo que creían en 1914', tNav - 0.4, tB + 0.3, 70);
    } },
    { t0: tB, set: Mp, p0: [-11, 22, 13], l0: [-11.5, 0, -0.5], p1: [-12.5, 17, 10], l1: [-12.5, 0, 0], fov0: 42, act: (t) => {
      Mp.paint(1914); Mp.tintState(1914, 'GER', WM.COL.CENTRAL, 1, 0.75); Mp.tintState(1914, 'FRA', WM.COL.ENTENTE, 1, 0.6);
      ar1.set(ss(tSep - 0.2, tCin, t)); ar2.set(ss(tSep, tCin + 0.2, t)); mLine.set(ss(tCin - 0.2, tPar, t)); paris.update(t, tPar - 0.3);
      return U.film(t) + WM.city(ctx, Mp, 'París', fade(t, tB + 0.2, tC + 1), 'c') + WM.chip(ctx, 2.6, 49.35, fade(t, tCin, tC + 1), '≈ 48 km', 'de París', '#b8432f')
        + U.badge(t, 'Septiembre de 1914', 'El avance alemán', 'a través de Bélgica', tSep - 0.2, tCin - 0.3);
    } },
    { t0: tC, set: Fd, p0: [3.2, 1.0, -2.0], l0: [-1, 0.9, 8], p1: [2.6, 1.0, -1.2], l1: [-1, 0.9, 7], fov0: 44, act: (t) => {
      const u = t - tC; atk.forEach((c, i) => { c.root.position.z = c.z0 - u * 1.9; K.pose(c, A.charge(t, i, 1.0)); c.setFace(C.blinkEye(t, i), 'open'); });
      return U.film(t) + U.badge(t, '6–12 de septiembre de 1914', 'Batalla del Marne', 'Franceses y británicos frenan a Alemania', tFren - 0.3, tD);
    } },
    { t0: tD, set: Rd, p0: [3.0, 1.2, 3.2], l0: [-6, 0.8, -0.6], p1: [2.4, 1.15, 2.8], l1: [-7, 0.8, -0.6], fov0: 42, act: (t) => {
      Rd.tick(t); const u = t - tD;
      board.forEach((c, i) => { c.root.position.z = 0.6 - Math.min(0.9, u * 0.6); c.root.rotation.y = Math.PI; K.pose(c, A.march(t, i)); c.setFace(C.blinkEye(t, i), 'neutral'); });
      K.pose(drv, A.seated(t, 1, A.drive(t)));
      return U.film(t) + U.counter(t, tTax - 0.3, tE, 110, 600, 600, 'taxis de París llevan refuerzos', { from: 0, dur: 1.1, color: '#ffcf6a', prefix: '≈ ', w: 520 });
    } },
    { t0: tE, set: Dg, p0: [2.6, 1.05, 3.4], l0: [-1.0, 0.5, -0.5], p1: [2.2, 1.0, 3.0], l1: [-1.0, 0.5, -0.5], fov0: 42, act: (t) => {
      dig.forEach((c, i) => { K.pose(c, A.dig(t, i)); c.setFace(C.blinkEye(t, i), 'frown'); });
      return U.film(t) + U.badge(t, 'Otoño de 1914', 'A cavar trincheras', 'La guerra de movimientos se detiene', tTri - 0.3, tF);
    } },
    { t0: tF, set: Mp, p0: [-10.8, 17, 10.5], l0: [-11.4, 0, 0.6], p1: [-10.8, 15, 9.2], l1: [-11.4, 0, 0.6], fov0: 42, act: (t) => {
      Mp.paint(1914); Mp.tintState(1914, 'GER', WM.COL.CENTRAL, 1, 0.6); Mp.tintState(1914, 'FRA', WM.COL.ENTENTE, 1, 0.55);
      west.set(ss(tLin - 0.2, tSui + 0.2, t));
      return U.film(t) + WM.areaLabel(ctx, 2.0, 52.5, 'MAR DEL NORTE', fade(t, tMar - 0.3, ctx.dur + 1), 'st') + WM.areaLabel(ctx, 8.0, 46.8, 'SUIZA', fade(t, tSui - 0.3, ctx.dur + 1), 'st')
        + WM.chip(ctx, 4.6, 49.6, fade(t, tSet - 0.2, ctx.dur + 1), 'Frente occidental', 'más de 700 km de trincheras', '#7a1e14');
    } },
  ];
  const inst = { scene: St, scenes: [St, Mp, Fd, Rd, Dg], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
