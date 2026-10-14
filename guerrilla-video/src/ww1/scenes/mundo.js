import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as F from '../../lib/fx.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as A from '../anim.js';
import * as WM from '../wmap.js';
import * as WO from '../world.js';

export async function preload() { await WM.preload(); await WO.preload(); }
const fade = WM.fade;
const fz = (arr, poseFn, keep = () => false, face = 'neutral') => arr.forEach((c, i) => { if (keep(i)) return; c.setFace('open', face); K.freeze(c, poseFn(i)); });

export function build(ctx) {
  const L = ctx.L;
  const tMund = wt(L[0], 'mundial'), tEste = wt(L[0], 'este'), tRus = wt(L[0], 'rusia'), tAle = wt(L[0], 'alemania'), tImp = wt(L[0], 'imperio'), tUnio = wt(L[0], 'unio');
  const tGal = wt(L[1], 'galipoli'), tInv = wt(L[1], 'invadir'), tFrac = wt(L[1], 'fracasaron'), tIta = wt(L[1], 'italia'), tJap = wt(L[1], 'japon'), tCol = wt(L[1], 'colonias'), tAsia = wt(L[1], 'asia');
  const tLleg = wt(L[2], 'llegaron'), tInd = wt(L[2], 'india'), tAfr = wt(L[2], 'africa'), tAus = wt(L[2], 'australia'), tCan = wt(L[2], 'canada'), tArab = wt(L[2], 'arabia'), tReb = wt(L[2], 'rebelaron');

  // ---- world map of the empires
  const W = WO.worldMap();
  const tsing = WO.pulse(W, 120.4, 36.1, '#c0392b', 1.4);
  // ---- Europe: eastern front, Ottomans, Italy
  const Mp = WM.europeMap({ period: 1914 });
  const east = WM.front(Mp, WM.FRONT.east, { width: 0.2 }), ita = WM.front(Mp, WM.FRONT.italy, { width: 0.18 });
  // ---- Gallipoli landing
  const Ga = S.gallipoli('morning');
  const land = [0, 1, 2, 3, 4, 5].map(i => K.person(Ga, ['oguri', 'doto', 'helios', 'tamamo', 'suzuka', 'mcqueen'][i], 'anzac', -5 + i * 2.0, 4 + (i % 2) * 1.2, Math.PI));
  land.forEach(c => { c.x0 = c.root.position.x; c.z0 = c.root.position.z; });
  const shellsG = [0, 1, 2].map(i => new F.Explosion(Ga, [-6 + i * 6, 0.1, 8 + i], tInv + i * 0.7, 0.8, 50 + i, { smokeColor: '#c8b898' }));
  // ---- the empires' soldiers
  const Pd = S.stage('summer', ['#9aa86a', '#8c9a5e'], { seed: 1201 });
  const pdFlags = [P.FLAGS.gbr, P.FLAGS.fra, P.FLAGS.gbr, P.FLAGS.gbr].map((f, i) => { const fl = P.flagPole(f, { h: 2.4, w: 0.9, fh: 0.6 }); fl.position.set(-2.7 + i * 1.8 - 0.55, 0, -1.2); Pd.add(fl); return fl; });
  const troops = [['tamamo', 'sepoy', 'India', 'Británica', tInd], ['suzuka', 'tirador', 'África', 'Francia', tAfr], ['helios', 'anzac', 'Australia', 'Británica', tAus], ['doto', 'canadiense', 'Canadá', 'Británica', tCan]]
    .map(([w, o, n, emp, ta], i) => { const c = K.person(Pd, w, o, -2.7 + i * 1.8, 0, 0); c.lab = [n, emp, ta]; return c; });
  // ---- the Arab Revolt on the Hejaz railway
  const Hj = S.desertRail('golden');
  const arabs = [0, 1, 2, 3].map(i => K.person(Hj, ['cafe', 'daiwa', 'oguri', 'doto'][i], 'arabe', -2 + i * 1.3, 5.5 + (i % 2) * 0.8, Math.PI + 0.3));
  const blast = new F.Explosion(Hj, [1.0, 0.2, 0], tReb, 1.6, 61, { fire: 0.7, smokeColor: '#8a7a66' });

  const tB = tEste - 0.35, tC = tImp - 0.35, tD = L[1].t0 - 0.35, tE = tIta - 0.35, tF = tJap - 0.35, tG = L[2].t0 - 0.35, tH = tArab - 0.35;
  const sfx = [{ t: 0.2, type: 'whoosh', vol: 0.35 }, { t: tB, type: 'drums', dur: tD - tB, vol: 0.25 }, { t: tUnio, type: 'pop', vol: 0.35 },
    { t: tD, type: 'waves', dur: tE - tD, vol: 0.4 }, { t: tD + 0.4, type: 'gunfire', dur: tE - tD - 0.4, vol: 0.3 }, ...[0, 0.7, 1.4].map(x => ({ t: tInv + x, type: 'boom', vol: 0.35 })),
    { t: tE, type: 'pop', vol: 0.35 }, { t: tJap, type: 'pop', vol: 0.35 }, { t: tG, type: 'march', dur: tH - tG, vol: 0.35 }, ...[tInd, tAfr, tAus, tCan].map(x => ({ t: x - 0.05, type: 'tick', vol: 0.35 })),
    { t: tH, type: 'wind', dur: ctx.dur - tH, vol: 0.3 }, { t: tReb, type: 'bigboom', vol: 0.55 }, { t: tReb + 0.3, type: 'cheer', vol: 0.25 }];

  const shots = [
    { t0: 0, set: W, p0: [-6, 118, 44], l0: [-6, 0, -12], p1: [-6, 108, 40], l1: [-6, 0, -12], fov0: 40, act: (t) => {
      W.reset();
      return U.film(t) + U.big(t, tMund - 0.4, tB + 0.3, 'Una guerra mundial', { top: 90, size: 66 })
        + WO.wlabel(ctx, -100, 58, 'Canadá (británico)', fade(t, 0.5, tB + 0.3)) + WO.wlabel(ctx, 134, -25, 'Australia (británica)', fade(t, 0.8, tB + 0.3)) + WO.wlabel(ctx, 80, 22, 'India británica', fade(t, 0.7, tB + 0.3)) + WO.wlabel(ctx, 5, 12, 'África francesa', fade(t, 0.9, tB + 0.3));
    } },
    { t0: tB, set: Mp, p0: [12, 46, 28], l0: [12, 0, -4], p1: [12, 42, 25], l1: [12, 0, -4], fov0: 40, act: (t) => {
      Mp.paint(1914); Mp.tintState(1914, 'RUE', WM.COL.ENTENTE, ss(tRus - 0.2, tRus + 0.3, t), 0.85);
      for (const st of ['GER', 'AUH']) Mp.tintState(1914, st, WM.COL.CENTRAL, ss(tAle - 0.2, tAle + 0.4, t), 0.85);
      east.set(ss(tEste - 0.2, tAle + 0.8, t));
      return U.film(t) + WM.chip(ctx, 26.4, 52.5, fade(t, tEste, tC + 1), 'Frente oriental', 'Rusia contra Alemania y Austria-Hungría', '#7a1e14');
    } },
    { t0: tC, set: Mp, p0: [24, 40, 40], l0: [24, 0, 10], p1: [24, 36, 36], l1: [24, 0, 10], fov0: 40, act: (t) => {
      Mp.paint(1914); Mp.tintState(1914, 'RUE', WM.COL.ENTENTE, 1, 0.85); for (const st of ['GER', 'AUH']) Mp.tintState(1914, st, WM.COL.CENTRAL, 1, 0.85);
      Mp.tintState(1914, 'OTT', WM.COL.CENTRAL, ss(tUnio - 0.3, tUnio + 0.4, t), 0.85); east.set(1);
      return U.film(t) + WM.chip(ctx, 33, 39.5, fade(t, tUnio - 0.2, tD + 1), 'Noviembre de 1914', 'el Imperio otomano se une a Alemania', '#b8432f');
    } },
    { t0: tD, set: Ga, p0: [6, 2.6, 16], l0: [-1, 1.5, -6], p1: [5, 2.3, 13], l1: [-1, 1.8, -8], fov0: 44, act: (t) => {
      Ga.tick(t); const u = t - tD;
      Ga.boats.forEach((b, i) => { b.position.z = 10 + (i % 2) * 3 - Math.min(5, u * 1.3); });
      land.forEach((c, i) => { const z = c.z0 - u * 1.1; c.root.position.set(c.x0, 0, z); K.pose(c, A.charge(t, i, 0.95)); c.setFace(C.blinkEye(t, i), 'open'); });
      shellsG.forEach(e => e.update(t));
      return U.film(t) + U.badge(t, 'Galípoli · 1915–1916', 'Desembarco aliado', 'australianos, neozelandeses, británicos y franceses', tGal - 0.2, tFrac - 0.2)
        + U.stamp(t, 'FRACASO', tFrac - 0.05, tE + 0.2, { x: 1400, y: 440, rot: -8 });
    } },
    { t0: tE, set: Mp, p0: [-2, 38, 30], l0: [-2, 0, 8], p1: [-2, 34, 27], l1: [-2, 0, 8], fov0: 40, act: (t) => {
      Mp.paint(1914); for (const st of ['GER', 'AUH']) Mp.tintState(1914, st, WM.COL.CENTRAL, 1, 0.85); Mp.tintState(1914, 'FRA', WM.COL.ENTENTE, 1, 0.85);
      Mp.tintState(1914, 'ITA', WM.COL.ENTENTE, ss(tIta + 0.2, tIta + 0.8, t), 0.85); ita.set(ss(tIta + 0.4, tF, t));
      return U.film(t) + WM.chip(ctx, 12.5, 42.3, fade(t, tIta, tF + 1), 'Mayo de 1915', 'Italia se une a los aliados', '#3f6fb5');
    } },
    { t0: tF, set: W, p0: [62, 34, 8], l0: [60, 0, -22], p1: [62, 30, 6], l1: [60, 0, -22], fov0: 40, act: (t) => {
      W.reset(); W.dim(1, ['JPN', 'GER', 'CHN']); W.tintEmpire('JPN', '#d0405a', ss(tJap - 0.2, tJap + 0.4, t), 0.6); tsing.update(t, tCol - 0.3);
      return U.film(t) + WO.wlabel(ctx, 138, 37, 'Japón', fade(t, tJap - 0.2, ctx.dur + 1)) + WO.wlabel(ctx, 120.4, 37.6, 'Tsingtao (colonia alemana)', fade(t, tCol - 0.3, ctx.dur + 1))
        + WO.wlabel(ctx, 146, -4, 'Nueva Guinea alemana', fade(t, tAsia - 0.4, ctx.dur + 1));
    } },
    { t0: tG, set: Pd, p0: [0.4, 1.0, 6.2], l0: [0.4, 0.62, 0], p1: [0.2, 0.95, 5.4], l1: [0.2, 0.62, 0], fov0: 40, act: (t) => {
      pdFlags.forEach((f, i) => { f.wave(t + i); f.visible = t > troops[i].lab[2] - 0.25; }); troops.forEach((c, i) => { const ta = c.lab[2]; const k = ss(ta - 0.25, ta + 0.1, t); c.root.visible = k > 0.01; c.root.position.y = (1 - k) * -0.3;
        K.pose(c, { ...C.salute(t, i), gun: 'none' }); c.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + troops.map(c => U.pin(ctx, [c.root.position.x, 1.35, 0], c.lab[0], 'Imperio ' + (c.lab[1] === 'Francia' ? 'francés' : 'británico'), ss(c.lab[2] - 0.1, c.lab[2] + 0.2, t))).join('');
    } },
    { t0: tH, set: Hj, p0: [-6, 1.6, 9], l0: [1, 1.0, 0], p1: [-5, 1.5, 8], l1: [1, 1.0, 0], fov0: 44, act: (t) => {
      Hj.tick(t); blast.update(t); Hj.train.position.x = 8 - Math.min(5, (t - tH) * 1.5);
      arabs.forEach((c, i) => { K.pose(c, t > tReb + 0.2 ? C.cheer(t, i) : { ...A.guard(t, i), gun: 'aim' }); c.setFace(C.blinkEye(t, i), t > tReb ? 'smile' : 'frown'); });
      return U.film(t) + U.badge(t, 'Hiyaz · 1916–1918', 'La rebelión árabe', 'con apoyo británico (T. E. Lawrence)', tArab - 0.2, ctx.dur + 1);
    } },
  ];
  const inst = { scene: W, scenes: [W, Mp, Ga, Pd, Hj], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
