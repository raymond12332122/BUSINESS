import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as F from '../../lib/fx.js';
import { ss, clamp } from '../../lib/util.js';
import { badge } from '../../lib/kit.js';
import * as N from '../props.js';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as FX from '../fx.js';
import * as A from '../../mx/anim.js';
import { horse, animateHorse, ridePose, seat } from '../horse.js';
import { Troop } from '../troops.js';
import { runShots, wt } from '../../mx/shots.js';
import { film, nameplate, doc } from '../../mx/ui.js';
import { mapSet, city, fade, marker, GM } from '../mapkit.js';

export { preload } from '../mapkit.js';
const CITY = GM.CITY;

export function build(ctx) {
  const L = ctx.L;
  const tInv = wt(L[0], 'invencible'), tEse = wt(L[0], 'ese'), tApl = wt(L[0], 'aplasto'), tAus = wt(L[0], 'austerlitz');
  const tYena = wt(L[1], 'yena'), t1807 = wt(L[1], 'y$'), tZar = wt(L[1], 'zar'), tBal = wt(L[1], 'balsa'), tFir = wt(L[1], 'firmaron');

  // ---- 1-2. Austerlitz: the sun rises over the Pratzen heights
  const Au = S.austerlitz();
  const hz = horse({ coat: '#efeae2', mane: '#ddd6c8', cloth: '#2a3f8f', trim: '#d4af37', seed: 9 }); hz.position.set(0.2, 0, 2.6); hz.rotation.y = 1.05; Au.add(hz);
  const nap = K.person(Au, 'napoleon', 'napoleon', 0, 0, 0);
  const mars = [[-1.35, 2.3, 0.5], [1.35, 2.0, 0.2]].map(([x, z, y], i) => K.person(Au, ['tamamo', 'helios'][i], 'marshal', x, z, y));
  [nap, ...mars].forEach(c => K.faceTint(c, '#f4dfd0')); // warm dawn light
  const fr = [[-6, -3], [0, -1.5], [6, -3]].map(([x, z], i) => { const tr = new Troop(Au, { rows: 5, cols: 8, seed: 60 + i, coat: '#2f4590', hat: 'shako' }); tr.x = x; tr.z0 = z; return tr; });
  const allies = [[-8, -22, '#e8e4dc', '#1d1b1c'], [0, -24, '#2f5038', '#151517'], [8, -22, '#e8e4dc', '#1d1b1c']].map(([x, z, coat, hat], i) => { const tr = new Troop(Au, { rows: 4, cols: 9, seed: 70 + i, coat, hat: 'shako', hatColor: hat, plume: null }); tr.x = x; tr.z0 = z; return tr; });
  const guns = [-3, 3].map(x => { const g = N.fieldGun(); g.position.set(x, 0, 0.5); g.rotation.y = Math.PI; Au.add(g); return g; });
  const vol = new FX.Volleys(Au, { size: 0.9, life: 5, drift: [0.3, 0.2, 0], flashSize: 0.9 });
  guns.forEach((g, i) => { for (let k = 0; k < 3; k++) { g.updateMatrixWorld(true); const p = new THREE.Vector3(); g.muzzle.getWorldPosition(p); vol.add(tEse + 0.2 + i * 0.4 + k * 1.4, p, [0, 0.05, -1], { puffs: 3, size: 1.6 }); } });
  allies.forEach((a, i) => { for (let k = 0; k < 2; k++) vol.volley(tEse + 0.6 + i * 0.3 + k * 1.2, [...Array(7)].map((_, j) => [a.x - 2.6 + j * 0.85, Au.hillY(a.x, a.z0) + 0.9, a.z0 + 1.2]), [0, 0, 1], 0.04, { puffs: 1, size: 1.2 }); });
  // ---- 3. Jena (map)
  const M = mapSet({ per: '1805' });
  const jena = GM.arrow([[8.27, 50.0], [10.2, 50.4], CITY['Jena'], [12.5, 52.1], CITY['Berlín']], '#2f4590', 0.5); M.add(jena);
  const mJ = marker(M, ...CITY['Jena'], 'swords', '#2f4590', 1.0);
  const ev = [{ t: tYena - 0.25, pol: ['PRU'], color: '#7d95cf' }];
  // ---- 4. Tilsit: the raft on the Niemen
  const T = S.tilsit();
  const napT = K.person(T.raft, 'napoleon', 'napoleon', -1.9, 1.2, Math.PI / 2 - 0.55);
  const zar = K.person(T.raft, 'zar', 'zar', 1.9, 1.2, -Math.PI / 2 + 0.55);
  for (const r of [napT, zar]) r.root.position.y = 0.36;
  const guardsT = [[-3.2, 2.6, 0.4], [3.2, 2.6, -0.4]].map(([x, z, y], i) => { const g = K.person(T.raft, ['oguri', 'doto'][i], i ? 'russo' : 'grenadier', x, z, y); g.root.position.y = 0.36; return g; });
  const shake = F.bubble('🤝', { bg: null, font: 170 }); shake.visible = false; T.raft.add(shake);

  const sfx = [{ t: 0.1, type: 'wind', dur: tEse, vol: 0.35 }, { t: 0.4, type: 'neigh', vol: 0.4 }, ...vol.shots.filter(sh => sh.puffs.length === 3).map(sh => ({ t: sh.t0, type: 'cannon', vol: 0.45 })), ...vol.groups.map(t => ({ t, type: 'volley', vol: 0.4 })),
    { t: tApl, type: 'charge', vol: 0.6 }, { t: tAus + 0.2, type: 'sting2', vol: 0.6 }, { t: tYena - 0.4, type: 'cannon', vol: 0.6 }, { t: tYena, type: 'whoosh', vol: 0.5 },
    { t: t1807, type: 'waves', dur: ctx.dur - t1807, vol: 0.4 }, { t: tFir + 0.1, type: 'sting', vol: 0.7 }];

  const tB = tEse - 0.2, tM = L[1].t0 - 0.15, tT = t1807 - 0.2, tT2 = tZar - 0.5;
  const shots = [
    { t0: 0, set: Au, p0: [1.4, 1.05, 6.4], l0: [-0.2, 1.5, 1.0], p1: [1.15, 1.08, 5.7], l1: [-0.2, 1.55, 1.0], fov0: 38, act: (t) => austerlitz(t)
        + badge(t, '2 de diciembre de 1805', 'Austerlitz', 'El sol sale entre la niebla', 0.6, tB - 0.1) },
    { t0: tB, set: Au, p0: [-7.5, 6.0, 7.5], l0: [1.0, 1.6, -14], p1: [-6.0, 5.4, 5.5], l1: [1.0, 1.8, -14], fov0: 40, act: (t) => austerlitz(t)
        + badge(t, 'La batalla de los tres emperadores', 'Napoleón aplasta a Austria y a Rusia', 'Su victoria más famosa', tApl - 0.1, tM - 0.1) },
    { t0: tM, set: M, p0: [-1.0, 12, 11], l0: [-1.4, 0, -1.2], p1: [-1.0, 11, 9.5], l1: [-1.4, 0, -1.4], fov0: 38, act: (t) => {
      GM.paint(M.map, ev, t); jena.set(clamp((t - tM - 0.1) / 1.6)); mJ.update(t, tYena - 0.4);
      return film(t) + city(ctx, M, 'Jena', fade(t, tYena - 0.45, tT), 'c') + city(ctx, M, 'Berlín', fade(t, tYena + 0.05, tT), 'c big')
        + badge(t, 'Octubre de 1806', 'Batalla de Jena', 'Prusia es derrotada y Napoleón entra en Berlín', tM + 0.3, tT - 0.1);
    } },
    { t0: tT, set: T, p0: [9, 3.6, 17], l0: [0, 1.6, 0], p1: [6.5, 3.0, 13], l1: [0, 1.6, 0], fov0: 38, act: (t) => tilsit(t)
        + badge(t, 'Junio de 1807', 'El tratado de Tilsit', 'Una balsa en medio del río Niemen', tT + 0.3, tT2 - 0.1) },
    { t0: tT2, set: T, p0: [0.3, 1.25, 5.2], l0: [0, 1.0, 1.0], p1: [0.2, 1.2, 4.4], l1: [0, 1.0, 1.0], fov0: 36, act: (t) => tilsit(t)
        + nameplate(ctx, [zar.root.position.x, 1.72, 1.2], 'Alejandro I', 'Zar de Rusia', tZar, tFir - 0.2)
        + doc(t, tFir + 0.1, ctx.dur, 'Paz de Tilsit', [['Francia y Rusia se alían', tFir + 0.3], ['Rusia se une al bloqueo contra Gran Bretaña', tFir + 0.7]], { left: 1180, top: 90, width: 640 }) },
  ];
  function austerlitz(t) {
    animateHorse(hz, t, 'stand', { seed: 4 }); const p = ridePose(t, 4); p.head = [0, -38, 0]; K.pose(nap, { ...p, gun: 'none' }); seat(nap, hz); nap.setFace(C.blinkEye(t, 4), 'neutral');
    mars.forEach((m, i) => { K.pose(m, C.idle(t, i + 2, 0.5)); m.setFace(C.blinkEye(t, i + 2), 'neutral'); });
    const adv = clamp((t - tEse) / 5), flee = clamp((t - tApl - 0.6) / 3);
    fr.forEach((tr, i) => { const z = tr.z0 - adv * 7; tr.update(t, { x: tr.x, z, y: Au.hillY(tr.x, z), yaw: Math.PI, march: adv > 0 && adv < 1 ? 1 : 0, speed: 1.2 }); });
    allies.forEach((tr, i) => { const z = tr.z0 - flee * 6; tr.update(t, { x: tr.x + (i - 1) * flee * 3, z, y: Au.hillY(tr.x, z), yaw: flee > 0 ? Math.PI : 0, march: flee > 0 && flee < 1 ? 1 : 0, speed: 1.6 }); });
    vol.update(t); Au.fogLayer.material.opacity = 0.55 * (1 - 0.6 * ss(0, tB + 3, t)); S.aimSun(Au, 0, -2);
    return film(t);
  }
  function tilsit(t) {
    const meet = clamp((t - tZar + 0.4) / 1.8), x = 1.9 - meet * 1.48;
    napT.root.position.x = -x; zar.root.position.x = x;
    const walking = meet > 0 && meet < 1, shaking = t > tFir - 0.15;
    for (const [r, s] of [[napT, 1], [zar, 2]]) {
      const p = walking ? C.walk(t, 0.8, s) : C.idle(t, s, 0.5);
      if (shaking) { p.armR = [-80, 0, 70]; p.elbR = [0, 20, 0]; p.armR[0] += 6 * Math.sin(t * 14); }
      K.pose(r, p); r.setFace(shaking ? 'happy' : C.blinkEye(t, s), shaking ? 'smile' : 'neutral'); }
    guardsT.forEach((g, i) => { K.pose(g, { ...C.idle(t, i + 5, 0.4), gun: 'port' }); g.setFace(C.blinkEye(t, i + 5), 'neutral'); });
    T.flags.forEach((f, i) => f.wave(t + i)); T.raft.position.y = 0.04 * Math.sin(t * 1.3); T.raft.rotation.z = 0.006 * Math.sin(t * 0.9);
    shake.position.set(0, 1.55, 1.2); F.popSprite(shake, t, tFir, ctx.dur, 0.5, 1.55);
    return film(t);
  }
  const inst = { scene: Au, scenes: [Au, M, T], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
