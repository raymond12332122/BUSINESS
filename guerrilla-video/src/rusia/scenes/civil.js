import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as A from '../anim.js';
import * as RM from '../rmap.js';
import { leader, NAMES } from '../leaders.js';

export { preload } from '../rmap.js';
const fade = RM.fade;
// Rough areas of control in 1919 (lon, lat).
const RED = [[28.5, 59.8], [33, 61.8], [42, 62], [50, 60.5], [56, 58.5], [56.5, 54], [51, 51.5], [46, 49.5], [41, 50.5], [36.5, 51.5], [32, 53.5], [29.5, 56]];
const WHITE = {
  east: [[57.5, 62], [70, 64], [90, 62.5], [106, 58], [109, 52], [96, 50], [80, 51], [66, 52.5], [58, 54.5]],
  south: [[34.5, 51], [41.5, 51], [47, 48.5], [48.5, 44.5], [42, 42.6], [37, 44.2], [33, 46], [30.8, 48.5]],
  north: [[36.5, 64.5], [43, 66.2], [47.5, 64.2], [42.5, 62.6], [38, 62.8]],
  west: [[26.8, 57.6], [28.2, 59.4], [29.6, 59.0], [29.0, 57.8]],
};

const fz = (arr, poseFn, keep = () => false, face = 'neutral') => arr.forEach((c, i) => { if (keep(i)) return; c.setFace('open', face); K.freeze(c, poseFn(i)); });

export function build(ctx) {
  const L = ctx.L;
  const tGuerra = wt(L[0], 'guerra'), tRojo = wt(L[0], 'rojo'), tBlanco = wt(L[0], 'blanco'), tGen = wt(L[0], 'generales'), tCons = wt(L[0], 'conservadores'), tLib = wt(L[0], 'liberales'), tApoyo = wt(L[0], 'apoyo'), tExt = wt(L[0], 'extranjeras');
  const tTro = wt(L[1], 'trotski'), tEj = wt(L[1], 'ejercito'), tCinco = wt(L[1], 'cinco'), tHubo = wt(L[1], 'hubo'), tTerror = wt(L[1], 'terror'), tCheca = wt(L[1], 'checa'), tFus = wt(L[1], 'fusilo'), tDec = wt(L[1], 'decenas');
  const tGano = wt(L[2], 'gano'), tComb = wt(L[2], 'combates'), tTifus = wt(L[2], 'tifus'), tHamb = wt(L[2], 'hambruna'), tOcho = wt(L[2], 'ocho');

  // ---- 1/3. Map: reds and whites, foreign troops
  const Mp = RM.russiaMap({ period: 1918 });
  const zr = RM.zone(Mp, RED, '#c0392b', { opacity: 0.55 }), zw = Object.values(WHITE).map(r => RM.zone(Mp, r, '#fbf8f0', { opacity: 0.88 }));
  // ---- 2. White generals
  const Wh = S.steppe('snow');
  Wh.train.visible = false;
  const gen = leader(Wh, 'blanco', 0, -1.5, 0.15);
  const whites = K.crowd(Wh, ['soldadoBlanco', 'cosaco', 'oficialZar', 'soldadoBlanco'], 14, [-3.2, -5.5, 3.2, -2.5], { seed: 111 });
  fz(whites, i => A.guard(0.3 + i * 0.1, i));
  // ---- 4. Trotsky and the Red Army by the armoured train
  const Rt = S.steppe('snow', { snowing: true });
  const tro = leader(Rt, 'trotskiRojo', 2.2, -9.0, Math.PI / 2 - 0.2);
  const army = K.crowd(Rt, ['ejercitoRojo', 'ejercitoRojo', 'ejercitoRojo', 'guardiaRoja'], 20, [3.8, -13.5, 8.6, -5.5], { seed: 112 });
  army.forEach(a => { a.root.rotation.y = Math.atan2(2.2 - a.root.position.x, -9.0 - a.root.position.z); });
  fz(army, i => A.guard(0.3 + i * 0.1, i), i => i % 4 === 0);
  // ---- 5. The Cheka
  const Ch = S.chekaOffice();
  const chek = K.person(Ch, 'oguri', 'chekista', Ch.seat[0], Ch.seat[2], 0); chek.root.position.y = Ch.seat[1];
  const chek2 = K.person(Ch, 'tamamo', 'chekista', -1.3, -1.6, 0.6);
  // ---- 6. The reds win (map)
  const Mw = RM.russiaMap({ period: 1918 });
  // ---- 7. Famine village
  const V = S.village('snowDusk', { snow: true, famine: true });
  const starving = [K.person(V, 'doto', 'campesina', -0.8, 0.6, 0.3), K.person(V, 'oguri', 'campesino', 0.7, 0.2, -0.2), K.person(V, 'suzuka', 'campesina', 2.0, -0.6, -0.5)];
  const graves = [[-3.4, -1.6], [-2.8, -2.4], [-3.9, -2.8], [-2.2, -1.2]].map(([x, z], i) => { const c = P.orthCross(i + 7, 1.0); c.position.set(x, 0, z); V.add(c); return c; });

  const tB = tGen - 0.4, tC = tApoyo - 0.35, tD = L[1].t0 - 0.3, tE = tHubo - 0.3, tF = L[2].t0 - 0.3, tG = tComb - 0.5;
  const sfx = [{ t: 0.2, type: 'whoosh', vol: 0.4 }, { t: tRojo, type: 'pop', vol: 0.4 }, { t: tBlanco, type: 'pop', vol: 0.4 }, { t: tB, type: 'wind', dur: tC - tB, vol: 0.3 },
    { t: tC, type: 'tick', vol: 0.35 }, { t: tExt, type: 'tick', vol: 0.35 }, { t: tD, type: 'march', dur: tE - tD, vol: 0.4 }, { t: tD + 0.3, type: 'train', dur: tE - tD, vol: 0.25 }, { t: tCinco, type: 'pop', vol: 0.4 },
    { t: tE, type: 'typewriter', dur: tF - tE, vol: 0.3 }, { t: tCheca - 0.1, type: 'stamp', vol: 0.45 }, { t: tF, type: 'whoosh', vol: 0.4 }, { t: tG, type: 'wind', dur: ctx.dur - tG, vol: 0.4 }, { t: tOcho, type: 'hit', vol: 0.45 }];

  const mapShot = (t, set) => { set.paint(1918); set.tintState(1918, 'SOV', '#9c8c70', 1, 0.75); set.tintState(1918, 'LOST', '#9c8c70', 1, 0.75); };
  const shots = [
    { t0: 0, set: Mp, p0: [6, 50, 26], l0: [6, 0, -4], p1: [3, 44, 22], l1: [3, 0, -4], fov0: 40, act: (t) => {
      mapShot(t, Mp); zr.set(ss(tRojo - 0.3, tRojo + 0.5, t)); zw.forEach((z, i) => z.set(ss(tBlanco - 0.3 + i * 0.12, tBlanco + 0.5 + i * 0.12, t)));
      return U.film(t) + U.badge(t, '1918 – 1921', 'Guerra civil', 'Rojos contra blancos', tGuerra - 0.3, tB)
        + RM.areaLabel(ctx, 41, 56, 'ROJOS', fade(t, tRojo - 0.1, tB + 1), 'big').replace('class="lbl big"', 'class="lbl big r"')
        + RM.areaLabel(ctx, 85, 57, 'BLANCOS', fade(t, tBlanco - 0.1, tB + 1), 'big').replace('class="lbl big"', 'class="lbl big w"')
        + RM.areaLabel(ctx, 40, 47.5, 'BLANCOS', fade(t, tBlanco + 0.1, tB + 1), 'big').replace('class="lbl big"', 'class="lbl big w"');
    } },
    { t0: tB, set: Wh, p0: [1.6, 1.1, 3.0], l0: [0, 0.75, -3], p1: [1.2, 1.05, 2.2], l1: [0, 0.75, -3], fov0: 42, act: (t) => {
      K.pose(gen, A.proud(t, 1)); gen.setFace(C.blinkEye(t, 1), 'neutral');
      whites.forEach((w, i) => { K.pose(w, A.guard(t, i)); w.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.icons(t, tGen - 0.2, tC, [['🎖️', 'Generales del zar', tGen - 0.1], ['👑', 'Conservadores', tCons - 0.1], ['📜', 'Liberales', tLib - 0.1]], { y: 760 })
        + U.nameplate(ctx, [0, 1.25, -1.5], 'Los blancos', 'Kolchak, Denikin, Wrangel…', tB + 0.2, tC);
    } },
    { t0: tC, set: Mp, p0: [6, 50, 26], l0: [6, 0, -4], p1: [6, 48, 25], l1: [6, 0, -4], fov0: 40, act: (t) => {
      mapShot(t, Mp); zr.set(1); zw.forEach(z => z.set(1));
      return U.film(t) + RM.chip(ctx, 40.5, 64.5, fade(t, tApoyo - 0.2, tD + 1), 'Británicos', 'Arcángel y Múrmansk', '#2a4a8a')
        + RM.chip(ctx, 30.7, 46.5, fade(t, tApoyo + 0.1, tD + 1), 'Franceses', 'Odesa', '#2a4a8a')
        + RM.chip(ctx, 131.9, 43.1, fade(t, tExt - 0.2, tD + 1), 'Japoneses y estadounidenses', 'Vladivostok', '#2a4a8a');
    } },
    { t0: tD, set: Rt, p0: [5.6, 1.7, 0.8], l0: [2.4, 1.1, -9.5], p1: [5.2, 1.6, -0.2], l1: [2.4, 1.1, -9.5], fov0: 42, act: (t) => {
      Rt.tick(t);
      K.pose(tro, A.orate(t, 1)); tro.setFace(C.blinkEye(t, 1), C.talkMouth(t, 1));
      army.forEach((a, i) => { K.pose(a, i % 4 === 0 ? A.rally(t, i) : A.guard(t, i)); a.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.nameplate(ctx, [2.2, 1.25, -9.0], NAMES.trotskiRojo[0], 'Crea el Ejército Rojo', tTro - 0.15, tCinco - 0.2)
        + U.counterD(t, tCinco - 0.3, tE, 1230, 150, 5, 'millones de soldados en el Ejército Rojo', { from: 0.5, dur: 1.0, color: '#ff7a5a', prefix: 'casi ', suffix: ' mill.', w: 600, dec: 0 });
    } },
    { t0: tE, set: Ch, p0: [1.0, 0.95, 1.2], l0: [0.3, 0.5, -1.4], p1: [0.8, 0.92, 0.9], l1: [0.3, 0.5, -1.4], fov0: 44, act: (t) => {
      K.pose(chek, A.sign(t, 1)); chek.setFace(C.blinkEye(t, 1), 'neutral');
      K.pose(chek2, C.idle(t, 2, 0.3)); chek2.setFace(C.blinkEye(t, 2), 'neutral');
      return U.film(t) + U.dual(t, tTerror - 0.3, tF, 'TERROR EN LOS DOS BANDOS', ['Terror Rojo', 'La Checa, la policía política, fusiló a decenas de miles', tCheca - 0.2, '#ff7a5a'], ['Terror Blanco', 'Ejecuciones masivas y pogromos contra judíos', tTerror + 0.3, '#e6e0d4'])
        + U.tag(ctx, [0.4, 0.9, -1.6], 'ЧК', 'la Checa', fade(t, tCheca - 0.1, tF));
    } },
    { t0: tF, set: Mw, p0: [6, 50, 26], l0: [6, 0, -4], p1: [6, 47, 24], l1: [6, 0, -4], fov0: 40, act: (t) => {
      const k = ss(tF + 0.2, tGano + 0.4, t); Mw.paint(1918, 1922, k); Mw.tintState(1922, 'USSR', '#c0392b', k, 0.5);
      return U.film(t) + U.badge(t, '1921', 'Ganan los rojos', 'Pero el país queda arrasado', tGano - 0.2, tG);
    } },
    { t0: tG, set: V, p0: [2.0, 1.1, 4.6], l0: [-0.6, 0.7, -2], p1: [1.6, 1.05, 3.8], l1: [-0.6, 0.7, -2], fov0: 42, act: (t) => {
      V.tick(t);
      starving.forEach((p, i) => { K.pose(p, i === 1 ? C.tired(t, i, 0.8) : A.cold(t, i)); p.setFace(C.blinkEye(t, i), 'wavy'); });
      return U.film(t) + U.icons(t, tComb - 0.2, ctx.dur + 1, [['⚔️', 'Combates', tComb - 0.1], ['🦠', 'Tifus', tTifus - 0.1], ['🍞', 'Hambruna', tHamb - 0.1]], { y: 140 })
        + U.stat(960 - 230, 560, '8 – 10 millones', 'de muertos (1918 – 1922)', ss(tOcho - 0.2, tOcho + 0.2, t), '#ff8a6a');
    } },
  ];
  const inst = { scene: Mp, scenes: [Mp, Wh, Rt, Ch, Mw, V], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
