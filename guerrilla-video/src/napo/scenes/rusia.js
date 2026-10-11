import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as F from '../../lib/fx.js';
import { ss, clamp } from '../../lib/util.js';
import { badge, stat } from '../../lib/kit.js';
import * as N from '../props.js';
import * as MX from '../../mx/props.js';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as FX from '../fx.js';
import * as A from '../../mx/anim.js';
import { horse, animateHorse, ridePose, seat } from '../horse.js';
import { Troop } from '../troops.js';
import { runShots, wt } from '../../mx/shots.js';
import { film, nameplate, stamp } from '../../mx/ui.js';
import { mapSet, city, fade, marker, shipToken, minard, GM } from '../mapkit.js';

export { preload } from '../mapkit.js';
const CITY = GM.CITY;
const fmt = n => Math.round(n).toLocaleString('es-MX').replace(/,/g, ' ');

export function build(ctx) {
  const L = ctx.L;
  const tBloq = wt(L[0], 'bloqueo'), tInv = wt(L[0], 'invadio'), tEje = wt(L[0], 'ejercito'), tSeis = wt(L[0], 'seiscientos');
  const tRet = wt(L[1], 'retiraron'), tQue = wt(L[1], 'quemando'), tSep = wt(L[1], 'septiembre'), tBor = wt(L[1], 'borodino'), tMos = wt(L[1], 'moscu'), tLla = wt(L[1], 'llamas');
  const tZar = wt(L[2], 'zar'), tSin = wt(L[2], 'sin'), tRtd = wt(L[2], 'retirada');
  const tHam = wt(L[3], 'hambre'), tCos = wt(L[3], 'cosacos'), tDe = wt(L[3], 'de$'), tReg = wt(L[3], 'regresaron'), tCien = wt(L[3], 'cien');

  // ---- 1. Russia leaves the blockade (map)
  const M = mapSet({ per: '1812' });
  const brit = shipToken('#c0272d'); brit.scale.setScalar(1.6); M.add(brit);
  const evR = [{ t: tBloq - 0.6, pol: ['RUS'], color: '#c0392b' }];
  // ---- 2. Crossing the Niemen
  const Ni = S.niemen();
  const cols = []; Ni.bridges.forEach((b, bi) => { for (let k = 0; k < 3; k++) { const tr = new Troop(Ni, { rows: 9, cols: 2, seed: 100 + bi * 3 + k, coat: ['#2f4590', '#2f4590', '#25336b'][k], hat: k === 2 ? 'bearskin' : 'shako', spacing: [0.6, 0.72] }); tr.x = b.position.x; tr.k = k; cols.push(tr); } });
  const banks = [[-15, 15], [16, 14], [-24, 18], [24, 19]].map(([x, z], i) => { const tr = new Troop(Ni, { rows: 4, cols: 10, seed: 120 + i, coat: '#2f4590', hat: 'shako' }); tr.x = x; tr.z = z; return tr; });
  const nhz = horse({ coat: '#efeae2', mane: '#ddd6c8', cloth: '#2a3f8f', seed: 12 }); nhz.position.set(4.0, 0, 12.5); nhz.rotation.y = Math.PI + 0.5; Ni.add(nhz);
  const napN = K.person(Ni, 'napoleon', 'napoleon', 0, 0, 0);
  const nFlags = [-7, 0, 7].map(x => { const f = N.flag('eagle', 2.2, 0.9, 0.6, { finial: 'eagle' }); Ni.add(f); f.x = x; return f; });
  // ---- 3. Scorched earth
  const V = S.russianVillage('overcast');
  const vFires = V.houses.map((h, i) => ({ fire: MX.fireSprites(V, 18, { size: 1.7, rise: 2.6, spread: 2.6, life: 1.0 }), smoke: MX.smokeTrail(V, 10, { color: '#3e3834', size: 1.2, rise: 8, drift: [1.6, 0, 0], life: 3.6, opacity: 0.6 }), p: new THREE.Vector3(h.position.x, 2.4, h.position.z), d: i * 0.35 }));
  const rusRear = new Troop(V, { rows: 3, cols: 10, seed: 130, coat: '#2f5038', hat: 'shako', plume: null });
  const vl = new THREE.PointLight('#ff8a40', 0, 30, 1.5); vl.position.set(0, 4, -6); V.add(vl);
  // ---- 4. Borodino
  const Bo = S.borodino();
  const atk = [[-5, 2], [0, 3], [5, 2]].map(([x, z], i) => { const tr = new Troop(Bo, { rows: 5, cols: 8, seed: 140 + i, coat: '#2f4590', hat: 'shako' }); tr.x = x; tr.z0 = z; return tr; });
  const def = new Troop(Bo, { rows: 2, cols: 12, seed: 150, coat: '#2f5038', hat: 'shako', plume: null });
  const bv = new FX.Volleys(Bo, { size: 1.0, life: 5, drift: [0.4, 0.2, 0.2], flashSize: 1.0 });
  Bo.guns.forEach((g, i) => { for (let k = 0; k < 3; k++) { g.updateMatrixWorld(true); const p = new THREE.Vector3(); g.muzzle.getWorldPosition(p); bv.add(tSep + 0.1 + i * 0.3 + k * 1.1, p, [0, 0, 1], { puffs: 3, size: 1.6 }); } });
  const booms = [[-3.5, -4.2], [2.0, -5.6], [-0.8, -3.8], [4.6, -4.8]].map(([x, z], i) => new FX.Burst(Bo, [x, 0, z], tSep + 0.6 + i * 0.7, { size: 1.0, seed: 210 + i }));
  const haze = FX.haze(Bo, { n: 16, box: [-20, 20, 1, 5, -16, 4], color: '#cfcac0', size: 10, opacity: 0.35 });
  // ---- 5. Moscow in flames
  const Mo = S.moscow();
  const mFires = [[-14, -14], [-5, -16], [8, -15], [18, -13], [-20, -26], [22, -24], [0, -24]].map(([x, z], i) => ({ fire: MX.fireSprites(Mo, 16, { size: 2.2, rise: 4, spread: 4, life: 1.1 }), smoke: MX.smokeTrail(Mo, 10, { color: '#2a2424', size: 2.2, rise: 14, drift: [3, 0, 0], life: 4.2, opacity: 0.6 }), p: new THREE.Vector3(x, 3.2, z) }));
  const embers = new FX.Embers(Mo, { n: 200, box: [-26, 26, 0, 16, -30, -8] });
  const mhz = horse({ coat: '#efeae2', mane: '#ddd6c8', cloth: '#2a3f8f', seed: 14 }); mhz.position.set(1.6, 0, 4.5); mhz.rotation.y = Math.PI - 0.15; Mo.add(mhz);
  const napM = K.person(Mo, 'napoleon', 'napoleon', 0, 0, 0);
  const marM = K.person(Mo, 'tamamo', 'marshal', -0.4, 5.0, Math.PI - 0.2);
  // ---- 6. The tsar refuses
  const W = S.winterPalace();
  const zar = K.person(W, 'zar', 'zar', -0.5, -0.6, 0.25);
  // ---- 7. The retreat begins
  const Sn = S.snowPlain('snow');
  const retreat = [[-2, -6], [-14, -9], [10, -8]].map(([x, z], i) => { const tr = new Troop(Sn, { rows: 4, cols: 9, seed: 160 + i, coat: '#2f4590', hat: 'shako' }); tr.x = x; tr.z = z; return tr; });
  const shz = horse({ coat: '#e8e2d8', mane: '#d0c8bc', cloth: '#2a3f8f', seed: 16 }); shz.position.set(0.6, 0, 1.6); shz.rotation.y = -Math.PI / 2 + 0.3; Sn.add(shz);
  const napS = K.person(Sn, 'napoleon', 'napoleon', 0, 0, 0);
  const snow1 = new FX.Snow(Sn, { n: 900, box: [-12, 12, -0.5, 7, -10, 8], wind: [-1.0, -1.1, 0.2], size: 0.07 });
  // ---- 8. Blizzard and cossacks
  const Bz = S.snowPlain('blizzard');
  const strag = [[-1.4, 0.2], [-0.3, -0.8], [0.9, 0.4], [-2.6, -1.2], [2.0, -1.0]].map(([x, z], i) => K.person(Bz, ['oguri', 'doto', 'helios', 'tamamo', 'daiwa'][i], 'fusilier', x, z, -Math.PI / 2 - 0.2));
  const coss = [0, 1, 2].map(i => { const h = horse({ coat: ['#5a3a26', '#3a2a1e', '#7a5232'][i], mane: '#1d1814', cloth: '#2a3a68', trim: '#b8342f', seed: 20 + i }); Bz.add(h); const r = K.person(Bz, ['mcqueen', 'suzuka', 'oguri'][i], 'cosaco', 0, 0, 0); r.attach('chest', K.lance(), [0.16, 0.25, 0.05], [10, 0, 0]); return { h, r, i }; });
  const snow2 = new FX.Snow(Bz, { n: 1600, box: [-10, 10, -0.5, 6, -8, 8], wind: [-5.5, -1.2, 0.8], size: 0.06 });
  // ---- 9. Minard's map: the army melts away
  const Mi = mapSet({ per: '1812', rivers: true });
  const adv = minard([[23.9, 54.9, 600000], [25.28, 54.69, 450000], [27.5, 55.0, 380000], [30.2, 55.2, 300000], [32.05, 54.78, 230000], [34.0, 55.2, 160000], [35.82, 55.52, 130000], [37.62, 55.75, 100000]], '#d9b38c', 1.3, 600000, GM.H + 0.08); Mi.add(adv);
  const back = minard([[37.62, 55.55, 100000], [35.8, 55.3, 85000], [34.0, 54.95, 70000], [32.05, 54.55, 50000], [30.2, 54.85, 40000], [28.35, 54.15, 28000], [25.28, 54.42, 14000], [23.9, 54.65, 10000]], '#2a2420', 1.3, 600000, GM.H + 0.1); Mi.add(back);

  const sfx = [{ t: tBloq - 0.5, type: 'clank', vol: 0.5 }, { t: tInv - 0.2, type: 'drums', dur: L[1].t0 - tInv, vol: 0.6 }, { t: tInv, type: 'march', dur: L[1].t0 - tInv - 0.2, vol: 0.6 },
    { t: tQue - 0.3, type: 'fire', dur: tSep - tQue, vol: 0.6 }, ...bv.times().filter((t, i) => i % 2 === 0).map(t => ({ t, type: 'cannon', vol: 0.45 })), ...booms.map(b => ({ t: b.t0, type: 'boom', vol: 0.5 })),
    { t: tMos - 0.4, type: 'fire', dur: L[2].t0 - tMos + 0.2, vol: 0.8 }, { t: tLla, type: 'sting2', vol: 0.5 }, { t: tZar + 0.5, type: 'thud', vol: 0.7 },
    { t: tSin - 0.3, type: 'wind', dur: ctx.dur - tSin, vol: 0.6 }, { t: tCos - 0.3, type: 'charge', vol: 0.5 }, { t: tCos, type: 'neigh', vol: 0.5 }, { t: tReg, type: 'tension', vol: 0.4 }];

  const tN = tInv - 0.25, tV = L[1].t0 - 0.2, tB = tSep - 0.2, tM = tMos - 0.75, tW = L[2].t0 - 0.2, tS = tSin - 0.25, tZ = tHam - 0.3, tMi = tDe - 0.25;
  const shots = [
    { t0: 0, set: M, p0: [4.5, 20, 9], l0: [3.5, 0, -5.5], p1: [4.0, 18, 7.5], l1: [3.8, 0, -5.8], fov0: 38, act: (t) => {
      GM.paint(M.map, evR, t);
      const u = clamp((t - 0.6) / 3.2), a = GM.pos(-4, 56.5, 0), b = GM.pos(24.1, 57.6, 0); brit.position.set(a[0] + (b[0] - a[0]) * u, 0.02, a[2] + (b[2] - a[2]) * u); brit.rotation.y = Math.atan2(b[0] - a[0], b[2] - a[2]);
      return film(t) + city(ctx, M, 'San Petersburgo', fade(t, 0.4, tN), 'c') + city(ctx, M, 'Moscú', fade(t, 0.4, tN), 'c')
        + badge(t, '1812', 'Rusia rompe el bloqueo', 'Vuelve a comerciar con Gran Bretaña', 0.5, tN - 0.1);
    } },
    { t0: tN, set: Ni, p0: [13, 7.5, 24], l0: [0, 0, 1], p1: [10, 6.2, 19], l1: [0, 0, 1], fov0: 40, act: (t) => {
      const lt = t - tN;
      cols.forEach(tr => { const z = 14 - tr.k * 7.5 - lt * 1.3; tr.update(t, { x: tr.x, z, y: Math.abs(z - 2) < 7.5 ? 0.47 : 0, yaw: Math.PI, march: 1, speed: 1.1 }); });
      banks.forEach(tr => tr.update(t, { x: tr.x, z: tr.z - lt * 0.6, yaw: Math.PI, march: 1, speed: 1 }));
      nFlags.forEach((f, i) => { f.position.set(f.x + 0.6, 0.47, 10 - lt * 1.3 - i * 0.1); f.wave(t + i); });
      animateHorse(nhz, t, 'stand', { seed: 5 }); K.pose(napN, ridePose(t, 5)); seat(napN, nhz); napN.setFace(C.blinkEye(t, 5), 'neutral');
      const n = 600000 * ss(tSeis - 0.6, tSeis + 0.9, t);
      return film(t) + badge(t, '24 de junio de 1812', 'Cruzan el río Niemen', 'La Grande Armée entra en Rusia', tN + 0.3, tSeis - 0.4)
        + stat(1500, 120, n > 1000 ? fmt(n) + '+' : '', 'hombres', fade(t, tSeis - 0.5, tV), '#ffd27a');
    } },
    { t0: tV, set: V, p0: [2.5, 2.0, 9], l0: [0, 1.5, -6], p1: [1.6, 1.9, 7.5], l1: [0, 1.6, -6], fov0: 40, act: (t) => {
      vFires.forEach(f => { const k = ss(tQue - 0.6 + f.d, tQue + 0.4 + f.d, t); f.fire(t + f.d, f.p, k); f.smoke(t + f.d, f.p, k); });
      vl.intensity = 30 * ss(tQue - 0.5, tQue + 1, t) * (0.85 + 0.15 * Math.sin(t * 11));
      rusRear.update(t, { x: 2, z: -20 - (t - tV) * 0.8, yaw: Math.PI, march: 1 });
      S.aimSun(V, 0, -4);
      return film(t) + badge(t, 'Verano de 1812', 'Tierra quemada', 'Los rusos se retiran y lo queman todo', tRet - 0.1, tB - 0.1);
    } },
    { t0: tB, set: Bo, p0: [-6.5, 3.2, 10], l0: [1, 1.2, -8], p1: [-5.5, 3.0, 8.2], l1: [1, 1.3, -8], fov0: 40, shake: t => 0.02 * booms.reduce((a, b) => a + (t >= b.t0 ? Math.max(0, 1 - (t - b.t0) * 4) : 0), 0), act: (t) => {
      atk.forEach(tr => { const z = tr.z0 - (t - tB) * 1.0; tr.update(t, { x: tr.x, z, yaw: Math.PI, march: 1, speed: 1.3 }); });
      def.update(t, { x: 0, z: -10.6, y: 1.6, march: 0 });
      bv.update(t); booms.forEach(b => b.update(t)); haze(t); S.aimSun(Bo, 0, -4);
      return film(t) + badge(t, '7 de septiembre de 1812', 'Borodinó', 'La batalla más sangrienta de la campaña', tSep + 0.1, tM - 0.1);
    } },
    { t0: tM, set: Mo, p0: [3.6, 1.6, 10.5], l0: [-0.5, 4.0, -20], p1: [3.0, 1.55, 9.0], l1: [-0.5, 4.2, -20], fov0: 42, act: (t) => {
      mFires.forEach((f, i) => { f.fire(t + i * 0.2, f.p, 1); f.smoke(t + i * 0.3, f.p, 1); });
      Mo.fires.forEach((l, i) => (l.intensity = 30 * (0.8 + 0.2 * Math.sin(t * 9 + i * 2))));
      embers.update(t);
      animateHorse(mhz, t, 'stand', { seed: 6 }); const p = ridePose(t, 6); K.pose(napM, p); seat(napM, mhz); napM.setFace('flat', 'frown');
      K.pose(marM, C.idle(t, 2, 0.4)); marM.setFace('shock', 'frown');
      return film(t) + badge(t, '14 de septiembre de 1812', 'Moscú, vacía y en llamas', 'Los rusos abandonan e incendian su antigua capital', tMos, tW - 0.1);
    } },
    { t0: tW, set: W, p0: [1.4, 1.2, 2.6], l0: [-0.3, 0.95, -0.8], p1: [1.1, 1.15, 2.1], l1: [-0.3, 0.95, -0.8], fov0: 38, act: (t) => {
      const p = A.proud(t, 3); p.head = [-2, 25 * Math.sin((t - tZar) * 7) * ss(tZar + 0.2, tZar + 0.5, t) * (1 - ss(tZar + 1.5, tZar + 1.9, t)), 0]; K.pose(zar, p);
      zar.setFace('squint', 'frown');
      return film(t) + nameplate(ctx, [-0.5, 1.48, -0.6], 'Alejandro I', 'Zar de Rusia', tW + 0.2, tS - 0.2)
        + stamp(t, 'NO HABRÁ<br>PAZ', tZar + 0.5, tS, { x: 1350, y: 430, rot: -8 });
    } },
    { t0: tS, set: Sn, p0: [-4.5, 1.2, 6.5], l0: [1.0, 1.1, -2], p1: [-3.6, 1.15, 5.5], l1: [1.0, 1.1, -2], fov0: 40, act: (t) => {
      retreat.forEach((tr, i) => tr.update(t, { x: tr.x - (t - tS) * 0.7, z: tr.z, yaw: -Math.PI / 2, march: 1, speed: 0.7, tired: 0.5 }));
      animateHorse(shz, t, 'walk', { speed: 0.6, seed: 7 }); shz.position.x = 0.6 - (t - tS) * 0.38; shz.position.z = 1.6 + (t - tS) * 0.12; const p = ridePose(t, 7); p.head = [6, 0, 0]; K.pose(napS, p); seat(napS, shz); napS.setFace('flat', 'frown');
      snow1.update(t); S.aimSun(Sn, 0, 0);
      return film(t) + badge(t, 'Octubre de 1812', 'La retirada', 'Sin comida y con el invierno encima', tSin, tZ - 0.1);
    } },
    { t0: tZ, set: Bz, p0: [3.0, 1.0, 4.4], l0: [-0.6, 0.9, -1.0], p1: [2.4, 1.0, 3.6], l1: [-0.6, 0.9, -1.0], fov0: 40, act: (t) => {
      strag.forEach((s, i) => { s.root.position.x = [-1.4, -0.3, 0.9, -2.6, 2.0][i] - (t - tZ) * 0.25; const p = C.tired(t, i, 1); K.pose(s, { ...p, ...C.walk(t, 0.35, i), head: p.head, chest: p.chest, gun: 'low' }); s.setFace('flat', 'frown'); });
      coss.forEach(c => { const u = clamp((t - tCos + 0.5 - c.i * 0.25) / 2.6); c.h.position.set(9 - u * 18, 0, -3.2 - c.i * 1.4); c.h.rotation.y = -Math.PI / 2; c.h.visible = u > 0 && u < 1; c.r.root.visible = c.h.visible;
        animateHorse(c.h, t, 'gallop', { speed: 1.1, seed: c.i }); const p = ridePose(t, c.i, 1); K.pose(c.r, p); seat(c.r, c.h); c.r.setFace('squint', 'shout'); });
      snow2.update(t); S.aimSun(Bz, 0, 0);
      return film(t) + `<div style="position:absolute;inset:0;background:rgba(220,228,240,.12)"></div>`
        + badge(t, 'Noviembre de 1812', 'Hambre, frío y cosacos', 'Miles de soldados mueren en la nieve', tHam, tMi - 0.1);
    } },
    { t0: tMi, set: Mi, p0: [8.8, 10.5, 1.8], l0: [8.8, 0, -6.2], p1: [8.8, 10.0, 1.0], l1: [8.8, 0, -6.3], fov0: 38, act: (t) => {
      adv.set(clamp((t - tMi - 0.2) / 2.4)); back.set(clamp((t - tReg + 0.6) / 2.2));
      const a = 600000 * ss(tDe + 0.4, tDe + 1.6, t), b = 100000 * ss(tReg, tCien + 0.3, t);
      return film(t) + city(ctx, Mi, 'Kovno', fade(t, tMi + 0.1, ctx.dur), 'c') + city(ctx, Mi, 'Moscú', fade(t, tMi + 1.8, ctx.dur), 'c') + city(ctx, Mi, 'Berézina', fade(t, tReg + 0.8, ctx.dur), 'c')
        + stat(170, 120, a > 1000 ? 'más de ' + fmt(a) : '', 'entraron a Rusia', fade(t, tDe + 0.2, ctx.dur), '#e8c48a')
        + stat(170, 330, b > 1000 ? 'unos ' + fmt(b) : '', 'regresaron', fade(t, tReg - 0.1, ctx.dur), '#ff8a7a')
        + `<div style="position:absolute;right:80px;bottom:150px;font:600 22px Inter;color:#3a2e25;background:rgba(243,234,214,.9);padding:10px 16px;border-radius:10px;opacity:${fade(t, tMi + 0.6, ctx.dur)}">Inspirado en el mapa de Charles Minard (1869)</div>`;
    } },
  ];
  const inst = { scene: M, scenes: [M, Ni, V, Bo, Mo, W, Sn, Bz, Mi], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
