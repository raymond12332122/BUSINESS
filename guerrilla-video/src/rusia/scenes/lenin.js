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
import * as N from '../../narco/props.js';
import { leader, NAMES } from '../leaders.js';

export { preload } from '../rmap.js';
const fade = RM.fade;
const ROUTE = [[8.54, 47.37], [8.75, 49.0], [10.5, 51.0], [13.4, 52.52], [13.64, 54.52], [13.16, 55.38], [15.5, 57.2], [18.07, 59.33], [19.5, 62.5], [22.2, 65.3], [24.15, 65.85], [25.47, 65.01], [24.6, 62.6], [24.78, 60.74], [28.74, 60.71], [30.31, 59.94]];
const KORNILOV = [[30.33, 53.9], [30.2, 55.2], [30.0, 57.2], [29.85, 58.74], [30.15, 59.5]];

export function build(ctx) {
  const L = ctx.L;
  const tAbr = wt(L[0], 'abril'), tLenin = wt(L[0], 'lenin'), tSuiza = wt(L[0], 'suiza'), tCruzo = wt(L[0], 'cruzo'), tPerm = wt(L[0], 'permiso'), tBerlin = wt(L[0], 'berlin');
  const tMens = wt(L[1], 'mensaje'), tPaz = wt(L[1], 'paz'), tPan = wt(L[1], 'pan'), tTierra = wt(L[1], 'tierra'), tTodo = wt(L[1], 'todo');
  const tKer = wt(L[2], 'kerenski'), tAgo = wt(L[2], 'agosto'), tKor = wt(L[2], 'kornilov'), tMarcho = wt(L[2], 'marcho'), tFren = wt(L[2], 'frenarlo'), tArmo = wt(L[2], 'armo'), tLib = wt(L[2], 'libero'), tTro = wt(L[2], 'trotski');

  // ---- 1. Map: from Zürich to Petrograd across Germany and Sweden
  const Mp = RM.russiaMap({ period: 1914 });
  const route = RM.arrow(Mp, ROUTE, '#c0392b', 0.32);
  const pZ = RM.pulse(Mp, ...RM.CITY['Zúrich'], '#c0392b', 0.8), pP = RM.pulse(Mp, ...RM.CITY['Petrogrado'], '#c0392b', 0.9);
  // ---- 2. The "sealed" train crossing the countryside
  const Rl = S.railLand('day');
  // ---- 3. Finland Station: Lenin on the armoured car
  const Fs = S.finlandSquare();
  const lenin = leader(Fs, 'lenin', 0.55, -6.15, 0.3); lenin.root.position.y = Fs.car.top * 1.25 + 0.02;
  const crowd = K.crowd(Fs, ['obrero', 'marinero', 'soldadoRevolucion', 'obrera', 'obrero'], 36, [-6, -3.6, 6, 3.5], { seed: 81, yaw: Math.PI });
  crowd.forEach(c => { c.root.rotation.y = Math.atan2(0.55 - c.root.position.x, -6.15 - c.root.position.z); });
  // ---- 4. Kerensky addresses the troops (summer 1917)
  const Fc = S.fieldCamp('day');
  const ker = leader(Fc, 'kerenski', 0, -4, 0); ker.root.position.y = Fc.cartTop;
  const troops = K.crowd(Fc, ['soldadoZar', 'soldadoZar', 'cosaco', 'soldadoZar'], 24, [-4, -2.6, 4, 2.6], { seed: 82, yaw: Math.PI });
  // ---- 5. Map: Kornilov marches on the capital
  const Mk = RM.russiaMap({ period: 1914 });
  const kor = RM.arrow(Mk, KORNILOV, '#4a4e58', 0.3);
  const pK = RM.pulse(Mk, ...RM.CITY['Petrogrado'], '#c0392b', 0.9);
  // ---- 6. Workers are armed
  const F = S.factory('grey', { snow: false, strike: true });
  const crates = [[-1.2, -3.2], [0.4, -3.4], [1.9, -3.1]].map(([x, z]) => { const c = N.gunCrate(true); c.scale.setScalar(0.55); c.position.set(x, 0, z); F.add(c); return c; });
  const armed = K.crowd(F, ['guardiaRoja', 'guardiaRoja', 'obrera', 'guardiaRoja'], 14, [-3.2, -1.8, 3.2, 2.0], { seed: 83, yaw: Math.PI });
  // ---- 7. Trotsky walks out of Kresty prison
  const Pg = S.prisonGate('overcast');
  const tro = leader(Pg, 'trotski', 0, -10.4, 0);
  const friends = [K.person(Pg, 'doto', 'guardiaRoja', -1.9, -7.4, 2.5), K.person(Pg, 'daiwa', 'obrera', 1.8, -7.6, -2.5)];

  const tB = tPerm - 0.4, tC = L[1].t0 - 0.3, tD = L[2].t0 - 0.3, tE = tAgo - 0.3, tF = tFren - 0.3, tG = tLib - 0.4;
  const sfx = [{ t: 0.2, type: 'whoosh', vol: 0.4 }, { t: tCruzo, type: 'tick', vol: 0.3 }, { t: tB, type: 'train', dur: tC - tB, vol: 0.45 }, { t: tB + 0.4, type: 'whistle', vol: 0.3 },
    { t: tC, type: 'crowd', dur: tD - tC, vol: 0.45 }, { t: tPaz, type: 'pop', vol: 0.4 }, { t: tPan, type: 'pop', vol: 0.4 }, { t: tTierra, type: 'pop', vol: 0.4 }, { t: tTodo, type: 'cheer', vol: 0.5 },
    { t: tD, type: 'wind', dur: tE - tD, vol: 0.25 }, { t: tE, type: 'whoosh', vol: 0.4 }, { t: tMarcho, type: 'drums', dur: tF - tMarcho, vol: 0.3 },
    { t: tF, type: 'clank', vol: 0.45 }, { t: tArmo, type: 'cock', vol: 0.45 }, { t: tG, type: 'creak', vol: 0.45 }, { t: tTro - 0.1, type: 'sting2', vol: 0.4 }];

  const shots = [
    { t0: 0, set: Mp, p0: [-16.2, 17.5, 4.6], l0: [-16.2, 0, -6.6], p1: [-15.6, 16, 3.8], l1: [-15.6, 0, -6.6], fov0: 40, act: (t) => {
      Mp.paint(1914); Mp.tintState(1914, 'RUE', '#e8a845', 1, 0.4); Mp.tintState(1914, 'GER', '#6a7078', 1, 0.45);
      route.set(ss(tCruzo - 0.6, tB - 0.2, t)); pZ.update(t, tSuiza - 0.3); pP.update(t, tB - 0.4);
      return U.film(t) + RM.city(ctx, Mp, 'Zúrich', fade(t, tSuiza - 0.3, tB + 1), 'c', 'Zúrich (Suiza)') + RM.city(ctx, Mp, 'Berlín', fade(t, tCruzo + 0.3, tB + 1))
        + RM.city(ctx, Mp, 'Estocolmo', fade(t, tCruzo + 1.6, tB + 1)) + RM.city(ctx, Mp, 'Petrogrado', fade(t, tB - 0.5, tB + 1))
        + U.badge(t, 'Abril de 1917', 'Lenin vuelve', 'Desde el exilio en Suiza', tAbr - 0.2, tB);
    } },
    { t0: tB, set: Rl, p0: [-6, 1.6, 9], l0: [2, 1.6, 0], p1: [-3, 1.5, 8], l1: [4, 1.6, 0], fov0: 42, act: (t) => {
      Rl.tick(t); Rl.train.position.x = -14 + (t - tB) * 4.2;
      return U.film(t) + U.badge(t, 'El «tren sellado»', 'Con permiso alemán', 'Berlín quería sacar a Rusia de la guerra', tPerm - 0.2, tC);
    } },
    { t0: tC, set: Fs, p0: [2.6, 1.55, 1.8], l0: [0.4, 1.75, -6], p1: [2.1, 1.5, 0.8], l1: [0.4, 1.8, -6], fov0: 40, act: (t) => {
      Fs.tick(t); Fs.flags.forEach((f, i) => f.wave(t + i));
      K.pose(lenin, A.orate(t, 1)); lenin.setFace(C.blinkEye(t, 1), C.talkMouth(t, 1));
      crowd.forEach((c, i) => { K.pose(c, t > tTodo && i % 2 ? A.rally(t, i) : i % 4 === 0 ? { ...A.guard(t, i), gun: 'port' } : C.idle(t, i)); c.setFace(C.blinkEye(t, i), t > tTodo ? 'open' : 'neutral'); });
      return U.film(t) + U.nameplate(ctx, [0.55, 2.95, -6.15], NAMES.lenin[0], 'Estación de Finlandia, 16 de abril', tC + 0.2, tPaz - 0.3)
        + U.tiles(t, tPaz - 0.25, tD, [['🕊️', 'Paz', tPaz - 0.1], ['🍞', 'Pan', tPan - 0.1], ['🌾', 'Tierra', tTierra - 0.1]], { top: 120 })
        + U.slogan(t, tTodo - 0.2, tD, 'ВСЯ ВЛАСТЬ СОВѢТАМЪ', 'Todo el poder a los sóviets', { top: 600, size: 54 });
    } },
    { t0: tD, set: Fc, p0: [3.0, 1.5, 4.5], l0: [0, 1.3, -4], p1: [2.4, 1.45, 3.4], l1: [0, 1.35, -4], fov0: 42, act: (t) => {
      K.pose(ker, A.orate(t, 2)); ker.setFace(C.blinkEye(t, 2), C.talkMouth(t, 2));
      troops.forEach((s, i) => { K.pose(s, A.guard(t, i, 'port')); s.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.nameplate(ctx, [0, Fc.cartTop + 1.2, -4], NAMES.kerenski[0], 'Sigue en la guerra', tKer - 0.15, tE);
    } },
    { t0: tE, set: Mk, p0: [-11, 13, 3], l0: [-10.8, 0, -3.6], p1: [-11, 11.5, 2.2], l1: [-10.8, 0, -3.8], fov0: 40, act: (t) => {
      Mk.paint(1914); Mk.tintState(1914, 'RUE', '#e8a845', 1, 0.4); kor.set(ss(tMarcho - 0.3, tF - 0.3, t)); pK.update(t, tMarcho);
      return U.film(t) + RM.chip(ctx, ...KORNILOV[0], fade(t, tKor - 0.3, tF + 1), 'General Kornílov', 'Agosto de 1917', '#4a4e58')
        + RM.city(ctx, Mk, 'Petrogrado', fade(t, tE, tF + 1)) + RM.city(ctx, Mk, 'Mogilev', 0.001);
    } },
    { t0: tF, set: F, p0: [2.4, 1.2, -6.2], l0: [0, 0.55, -0.5], p1: [2.0, 1.15, -5.6], l1: [0, 0.55, -0.5], fov0: 44, act: (t) => {
      F.tick(t);
      armed.forEach((m, i) => { K.pose(m, i % 3 === 0 ? { ...A.guard(t, i), gun: 'port' } : { ...C.offer(t, i, 0.8), gun: 'none' }); m.setFace(C.blinkEye(t, i), 'open'); });
      return U.film(t) + U.badge(t, 'Agosto de 1917', 'Kérenski arma a los obreros', 'Nacen los Guardias Rojos', tArmo - 0.3, tG);
    } },
    { t0: tG, set: Pg, p0: [1.4, 1.0, -3.4], l0: [0, 0.8, -10.5], p1: [1.1, 0.98, -4.4], l1: [0, 0.8, -10], fov0: 42, act: (t) => {
      const u = Math.max(0, t - tG); tro.root.position.z = -10.4 + u * 0.33;
      K.pose(tro, C.walk(t, 0.45, 3)); tro.setFace(C.blinkEye(t, 3), 'neutral');
      friends.forEach((f, i) => { K.pose(f, C.wave(t, i)); f.setFace(C.blinkEye(t, i), 'smile'); });
      return U.film(t) + U.nameplate(ctx, [0, 1.15, tro.root.position.z], NAMES.trotski[0], 'Liberado de la prisión de Kresty', tTro - 0.15, ctx.dur + 1);
    } },
  ];
  const inst = { scene: Mp, scenes: [Mp, Rl, Fs, Fc, Mk, F, Pg], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
