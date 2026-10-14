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

export function build(ctx) {
  const L = ctx.L;
  const tImp = wt(L[0], 'imperios'), tDom = wt(L[0], 'dominaban'), tComp = wt(L[0], 'competian'), tCol = wt(L[0], 'colonias'), tFab = wt(L[0], 'fabricas'), tBar = wt(L[0], 'barcos');
  const tBloq = wt(L[1], 'bloques'), tEnt = wt(L[1], 'entente'), tFra = wt(L[1], 'francia'), tRus = wt(L[1], 'rusia'), tGB = wt(L[1], 'bretana'), tAli = wt(L[1], 'alianza'),
    tGer = wt(L[1], 'alemania'), tAuh = wt(L[1], 'austria'), tIta = wt(L[1], 'italia');
  const tBalc = wt(L[2], 'balcanes'), tOtt = wt(L[2], 'imperio'), tRet = wt(L[2], 'retiraba'), tSer = wt(L[2], 'serbia'), tAuh2 = wt(L[2], 'austria'), tDisp = wt(L[2], 'disputaban'), tBarril = wt(L[2], 'barril');

  // ---- map of 1914
  const Mp = WM.europeMap({ period: 1914 });
  const keg = P.powderKeg(1); WM.placeOn(Mp, keg, 19.6, 43.6, 3.4); keg.visible = false; keg.userData.dynamic = true;
  const ottArrow = WM.arrow(Mp, [[20.5, 42.2], [23.5, 41.6], [26.5, 41.2]], '#7a8a3a', 0.7);
  const bosnia = WM.pulse(Mp, 17.6, 44.4, '#c0392b', 1.6);
  const serbia = WM.pulse(Mp, 21.0, 43.4, '#2a5a9a', 1.6);
  // ---- naval race: a British and a German dreadnought
  const Sea = S.seaStage('day', { color: '#466a82' });
  const gb = P.RP.dreadnought(34, '#7d858c'); gb.position.set(-26, -0.6, -24); gb.rotation.y = Math.PI / 2; gb.userData.dynamic = true; Sea.add(gb);
  const de = P.RP.dreadnought(34, '#5c6268'); de.position.set(-48, -0.6, -52); de.rotation.y = Math.PI / 2; de.userData.dynamic = true; Sea.add(de);
  for (const [sh, f, x] of [[gb, P.FLAGS.gbr, -16], [de, P.FLAGS.ger, 16]]) { const fl = P.flagPole(f, { h: 2.2, w: 1.6, fh: 1.0 }); fl.position.set(x, 4.5, 0); fl.rotation.y = Math.PI / 2; sh.add(fl); sh.flag = fl; }
  S.clouds(Sea, 10, { y: 30, spread: 240 });

  const tB = tComp - 0.3, tC = L[1].t0 - 0.35, tD = L[2].t0 - 0.35;
  const sfx = [{ t: 0.3, type: 'whoosh', vol: 0.35 }, ...[tImp, tDom].map(x => ({ t: x, type: 'pop', vol: 0.3 })), { t: tB, type: 'waves', dur: tC - tB, vol: 0.35 }, { t: tB + 0.4, type: 'harbor', dur: tC - tB - 0.4, vol: 0.2 },
    ...[tCol, tFab, tBar].map(x => ({ t: x - 0.05, type: 'tick', vol: 0.35 })), { t: tC, type: 'whoosh', vol: 0.3 }, { t: tEnt, type: 'pop', vol: 0.4 }, { t: tAli, type: 'pop', vol: 0.4 },
    { t: tD, type: 'tension', vol: 0.3 }, { t: tSer, type: 'tick', vol: 0.35 }, { t: tAuh2, type: 'tick', vol: 0.35 }, { t: tBarril - 0.1, type: 'hiss', dur: ctx.dur - tBarril, vol: 0.35 }, { t: tBarril, type: 'sting2', vol: 0.4 }];

  const empires = [['GBR', 'IMPERIO BRITÁNICO', -2.5, 53.5], ['FRA', 'FRANCIA', 2.5, 46.6], ['GER', 'IMPERIO ALEMÁN', 11.0, 51.8], ['AUH', 'AUSTRIA-HUNGRÍA', 18.5, 47.6],
    ['RUE', 'IMPERIO RUSO', 38, 56], ['OTT', 'IMPERIO OTOMANO', 34, 39.2], ['ITA', 'ITALIA', 12.8, 42.6]];
  const shots = [
    { t0: 0, set: Mp, p0: [2, 92, 52], l0: [2, 0, 4], p1: [2, 80, 46], l1: [2, 0, 4], fov0: 40, act: (t) => {
      Mp.paint(1914);
      return U.film(t) + empires.map(([st, n, lo, la], i) => { const a = tImp - 0.4 + i * 0.32; Mp.tintState(1914, st, '#ffffff', 0); return WM.areaLabel(ctx, lo, la, n, fade(t, a, tB + 1), 'st'); }).join('')
        + U.badge(t, 'Europa en 1914', 'La era de los imperios', 'Colonias en todo el mundo', 0.4, tB);
    } },
    { t0: tB, set: Sea, p0: [4, 1.8, 8], l0: [-12, 3.0, -36], p1: [4, 1.9, 5], l1: [-8, 3.0, -36], fov0: 44, act: (t) => {
      Sea.tick(t); const u = t - tB; gb.position.x = -20 + u * 2.0; de.position.x = -40 + u * 2.6; gb.flag.wave(t); de.flag.wave(t + 1);
      return U.film(t) + U.tiles(t, tCol - 0.3, tC + 0.2, [['🌍', 'colonias', tCol - 0.1], ['🏭', 'fábricas', tFab - 0.1], ['⚓', 'acorazados', tBar - 0.1]], { top: 610 });
    } },
    { t0: tC, set: Mp, p0: [-2, 84, 50], l0: [-2, 0, 4], p1: [-1, 78, 46], l1: [-1, 0, 4], fov0: 40, act: (t) => {
      Mp.paint(1914);
      for (const [st, ta] of [['FRA', tFra], ['RUE', tRus], ['GBR', tGB]]) Mp.tintState(1914, st, WM.COL.ENTENTE, ss(ta - 0.2, ta + 0.3, t), 0.92);
      for (const [st, ta] of [['GER', tGer], ['AUH', tAuh], ['ITA', tIta]]) Mp.tintState(1914, st, WM.COL.CENTRAL, ss(ta - 0.2, ta + 0.3, t), 0.92);
      return U.film(t) + U.alliances(t, tBloq - 0.2, tD + 1, ['TRIPLE ENTENTE', ['Francia', 'Rusia', 'Gran Bretaña'], '#6f9be0', tEnt - 0.2], ['TRIPLE ALIANZA', ['Alemania', 'Austria-Hungría', 'Italia'], '#e8735a', tAli - 0.2], { top: 760 });
    } },
    { t0: tD, set: Mp, p0: [7, 20, 27], l0: [6.5, 0, 10.5], p1: [6, 15, 23], l1: [5.8, 0, 10.6], fov0: 40, act: (t) => {
      Mp.paint(1914); const kOtt = ss(tOtt - 0.2, tOtt + 0.4, t);
      Mp.tintState(1914, 'OTT', '#9aae4a', kOtt, 0.5); ottArrow.set(ss(tRet - 0.2, tRet + 0.9, t));
      Mp.tintState(1914, 'SRB', '#2a5a9a', ss(tSer - 0.2, tSer + 0.3, t), 0.7); Mp.tintState(1914, 'AUH', '#b8432f', ss(tAuh2 - 0.2, tAuh2 + 0.3, t), 0.55);
      serbia.update(t, tSer - 0.1); bosnia.update(t, tDisp - 0.2, tBarril - 0.3); serbia.visible = serbia.visible && t < tBarril - 0.3;
      keg.visible = t > tBarril - 0.35; const kk = ss(tBarril - 0.35, tBarril + 0.1, t); keg.scale.setScalar(3.4 * (0.6 + 0.4 * kk)); keg.spark.scale.setScalar(1 + 0.6 * Math.abs(Math.sin(t * 23)));
      return U.film(t) + WM.areaLabel(ctx, 26.5, 41.3, 'IMPERIO OTOMANO', fade(t, tOtt - 0.3, ctx.dur + 1), 'st') + WM.areaLabel(ctx, 21.0, 44.4, 'SERBIA', fade(t, tSer - 0.2, ctx.dur + 1), 'st')
        + WM.areaLabel(ctx, 16.2, 47.2, 'AUSTRIA-HUNGRÍA', fade(t, tAuh2 - 0.2, ctx.dur + 1), 'st')
        + WM.chip(ctx, 17.6, 44.0, fade(t, tDisp - 0.1, tBarril - 0.3), 'Bosnia', 'Anexada por Austria-Hungría en 1908', '#c0392b')
        + U.badge(t, 'Guerras de los Balcanes · 1912–1913', 'Los Balcanes', 'Los otomanos pierden casi toda Europa', tBalc - 0.2, tSer - 0.3)
        + U.big(t, tBarril - 0.2, ctx.dur + 1, 'Un barril de pólvora', { top: 120, size: 70 });
    } },
  ];
  const inst = { scene: Mp, scenes: [Mp, Sea], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
