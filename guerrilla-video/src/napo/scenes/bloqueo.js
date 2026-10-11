import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as F from '../../lib/fx.js';
import { ss, clamp } from '../../lib/util.js';
import { badge } from '../../lib/kit.js';
import * as N from '../props.js';
import * as MX from '../../mx/props.js';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as FX from '../fx.js';
import * as A from '../../mx/anim.js';
import { Troop } from '../troops.js';
import { runShots, wt } from '../../mx/shots.js';
import { film, nameplate, stamp, doc } from '../../mx/ui.js';
import { mapSet, city, fade, marker, shipToken, americasSet, acity, aspark, ACITY, GM } from '../mapkit.js';

export { preload } from '../mapkit.js';
const CITY = GM.CITY;

export function build(ctx) {
  const L = ctx.L;
  const tProh = wt(L[0], 'prohibio'), tBloq = wt(L[0], 'bloqueo');
  const tPort = wt(L[1], 'portugal'), tInv = wt(L[1], 'invadio'), t1808 = wt(L[1], 'y$'), tPuso = wt(L[1], 'puso'), tJose = wt(L[1], 'jose');
  const tLev = wt(L[2], 'levantaron'), tDur = wt(L[2], 'durante'), tGue = wt(L[2], 'guerrillas'), tDe = wt(L[2], 'de$'), tPal = wt(L[2], 'guerrilla$');
  const tRey = wt(L[3], 'rey'), tCol = wt(L[3], 'colonias'), tInd = wt(L[3], 'independencia'), t1810 = wt(L[3], 'en$', 1), tCura = wt(L[3], 'cura'), tGrito = wt(L[3], 'grito');

  // ---- 1. The Continental Blockade (map)
  const M = mapSet({ per: '1805' });
  const ports = ['Hamburgo', 'Ámsterdam', 'Bruselas', 'Lisboa', 'Cádiz', 'Marsella', 'Venecia', 'Nápoles', 'Danzig', 'Copenhague'];
  const trade = ports.map((p, i) => { const a = GM.arrow([CITY['Londres'], CITY[p]], '#c8695b', 0.32); a.d = i * 0.08; M.add(a); return a; });
  const locks = ports.map((p, i) => { const m = marker(M, ...CITY[p], '🔒', '#2f4590', 1.0); m.d = i * 0.1; return m; });
  const evB = [{ t: tProh + 0.2, pol: ['FRA', 'ESP', 'NED', 'SUI', 'ITK', 'TUS', 'HRE', 'PRU', 'AUT', 'DEN', 'NAP', 'PAP', 'RUS'], color: '#9fb0dc' }, { t: tProh + 0.2, pol: ['FRA'], color: '#5b7bc4' }];
  // ---- 2. Iberia invaded (map)
  const MI = mapSet({ per: '1805' });
  const inv1 = GM.arrow([CITY['Bayona'], CITY['Burgos'], CITY['Salamanca'], CITY['Lisboa']], '#2f4590', 0.42); MI.add(inv1);
  const inv2 = GM.arrow([CITY['Bayona'], CITY['Vitoria'], CITY['Burgos'], CITY['Madrid']], '#2f4590', 0.42); MI.add(inv2);
  const evI = [{ t: tPort - 0.1, pol: ['POR'], color: '#e8d56a' }, { t: tInv + 0.9, pol: ['POR'], color: '#8fa5d8' }, { t: tInv + 1.2, pol: ['ESP'], color: '#8fa5d8' }];
  // ---- 3. Joseph Bonaparte on the Spanish throne
  const Pe = S.palaceES();
  const jose = K.person(Pe, 'jose', 'jose', 0, -3.35, 0);
  const court = [[-2.4, -1.2, 0.6], [2.4, -1.0, -0.6], [-3.1, 0.2, 0.9]].map(([x, z, y], i) => K.person(Pe, ['helios', 'tamamo', 'suzuka'][i], 'diplomat', x, z, y));
  // ---- 4. Madrid, 2 May 1808
  const Md = S.madrid('day');
  const rebels = []; for (let i = 0; i < 9; i++) { const r = K.person(Md, ['doto', 'oguri', 'suzuka', 'helios', 'tamamo', 'mcqueen', 'daiwa'][i % 7], 'madrileno', -2.6 + (i % 5) * 1.3, 2 + Math.floor(i / 5) * 1.4, Math.PI); rebels.push(r); }
  const line = [-1.6, -0.5, 0.6, 1.7].map((x, i) => K.person(Md, ['oguri', 'helios', 'doto', 'daiwa'][i], 'fusilier', x, -7.5, 0));
  const vM = new FX.Volleys(Md, { size: 0.6, life: 4, drift: [0.2, 0.25, 0] });
  // ---- 5. Ambush in the sierra
  const Si = S.sierraPass();
  const col = new Troop(Si, { rows: 3, cols: 11, seed: 95, coat: '#2f4590', hat: 'shako' });
  const gue = [[-3.2, -5.4], [-0.9, -5.7], [1.6, -5.5], [4.0, -5.3]].map(([x, z], i) => K.person(Si, ['oguri', 'doto', 'tamamo', 'suzuka'][i], 'guerrillero', x, z, 0.1 * (i - 1.5)));
  const vS = new FX.Volleys(Si, { size: 0.55, life: 4, drift: [0.3, 0.3, 0], flashSize: 0.5 });
  const gShots = []; gue.forEach((g, i) => { for (let k = 0; k < 3; k++) gShots.push([i, tGue - 0.3 + i * 0.35 + k * 1.3]); });
  gShots.forEach(([i, f]) => { const g = gue[i]; K.pose(g, { ...C.aim(f, 0, 1), gun: 'aim' }); g.root.updateMatrixWorld(true); vS.add(f, F.muzzleWorld(g), [0.1, -0.05, 1], { puffs: 2, size: 1.0 }); });
  // ---- 6. Ferdinand VII, prisoner in France
  const Fe = S.palaceFR('#e6dcc6');
  const fern = K.person(Fe, 'doto', 'king', -0.6, -1.4, 0.3);
  const guard = K.person(Fe, 'helios', 'grenadier', 2.0, -0.8, -0.6);
  // ---- 7. Spanish America lights up
  const Am = americasSet();
  const sparks = [['Caracas', 0], ['Buenos Aires', 0.35], ['Bogotá', 0.7], ['Santiago', 1.05], ['Quito', 1.4], ['Ciudad de México', 1.75]].map(([c, d]) => { const s = aspark(Am, ...ACITY[c]); s.d = d; s.c = c; return s; });
  // ---- 8. Dolores, 16 September 1810
  const Do = S.doloresSet();
  const hid = K.person(Do, 'hidalgo', 'hidalgo', 3.55, -4.2, 0.0);
  const crowd = [[-1.6, -1.0], [-2.4, -0.2], [-3.0, 0.7], [-1.7, 0.4], [1.7, -1.0], [2.5, -0.2], [3.1, 0.7], [1.9, 0.5], [-2.6, -1.6], [2.7, -1.5]].map(([x, z], i) => { const c = K.person(Do, ['doto', 'oguri', 'suzuka', 'helios', 'tamamo', 'mcqueen', 'daiwa'][i % 7], 'campesinoMx', x, z, 0); c.root.rotation.y = Math.atan2(0.2 - x, -1.8 - z); return c; });
  const banner = N.flag('guadalupe', 3.0, 0.8, 1.05, { vertical: true }); banner.position.set(-1.05, 0, -1.9); Do.add(banner);
  const hid2 = K.person(Do, 'hidalgo', 'hidalgo', 0.2, -1.8, 0);
  const torches = [[-2.2, -1.0], [2.6, -0.8]].map(([x, z]) => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 1.7, 6), new THREE.MeshStandardMaterial({ color: '#5a3a24' }))); g.children[0].position.y = 0.85;
    g.position.set(x, 0, z); Do.add(g); g.fire = MX.fireSprites(Do, 8, { size: 0.32, rise: 0.45, spread: 0.12, life: 0.55 }); g.top = new THREE.Vector3(x, 1.72, z); return g; });
  const sfx = [{ t: 0.4, type: 'waves', dur: 6.5, vol: 0.35 }, { t: tProh, type: 'clank', vol: 0.6 }, { t: tBloq - 0.1, type: 'thud', vol: 0.8 },
    { t: tInv, type: 'march', dur: 2.6, vol: 0.5 }, { t: tJose - 0.1, type: 'sting2', vol: 0.5 },
    { t: tLev - 0.4, type: 'crowd', dur: 3.2, vol: 0.7 }, ...[0, 1].map(k => ({ t: tLev + 0.4 + k * 1.3, type: 'volley', vol: 0.6 })),
    ...gShots.map(([, t]) => ({ t, type: 'shot', vol: 0.45 })), { t: tPal - 0.1, type: 'sting', vol: 0.6 },
    { t: tRey - 0.1, type: 'tension', vol: 0.4 }, { t: tCol, type: 'whoosh', vol: 0.5 }, ...sparks.map(s => ({ t: tCol + 0.3 + s.d, type: 'pop', vol: 0.4 })),
    { t: t1810 + 0.4, type: 'bell', vol: 0.9 }, { t: t1810 + 1.6, type: 'bell', vol: 0.8 }, { t: t1810 + 2.8, type: 'bell', vol: 0.7 }, { t: tGrito - 0.2, type: 'cheer', vol: 0.9 }, { t: tGrito + 0.1, type: 'crowd', dur: ctx.dur - tGrito, vol: 0.6 }];

  const tM2 = tBloq - 1.3, tI = L[1].t0 - 0.15, tJ = t1808 - 0.15, tMd = L[2].t0 - 0.2, tS = tDur - 0.25, tW = tDe - 0.2, tF = L[3].t0 - 0.15, tA = tCol - 0.35, tD = t1810 - 0.1, tD2 = tCura - 0.45;
  const shots = [
    { t0: 0, set: M, p0: [-5.5, 30, 20], l0: [-3.6, 0, 1.6], p1: [-5.5, 28, 18], l1: [-3.6, 0, 1.6], fov0: 38, act: (t) => {
      GM.paint(M.map, evB, t);
      trade.forEach(a => { a.set(clamp((t - 0.5 - a.d) / 1.2)); const k = ss(tProh + 0.2, tProh + 1.0, t); a.children.forEach(m => { m.material.transparent = true; m.material.opacity = 1 - 0.85 * k; }); });
      locks.forEach(l => l.update(t, tProh + 0.3 + l.d));
      return film(t) + city(ctx, M, 'Londres', fade(t, 0.3, ctx.dur), 'c big')
        + doc(t, tBloq - 0.6, tI, 'Bloqueo Continental', [['1806 · Decreto de Berlín', tBloq - 0.3], ['Prohibido comerciar con Gran Bretaña', tBloq + 0.3]], { left: 1180, top: 110, width: 620 });
    } },
    { t0: tI, set: MI, p0: [-13.6, 13, 17], l0: [-14.8, 0, 7.4], p1: [-13.6, 12, 15.5], l1: [-14.8, 0, 7.4], fov0: 38, act: (t) => {
      GM.paint(MI.map, evI, t); inv1.set(clamp((t - tInv + 0.2) / 1.7)); inv2.set(clamp((t - tInv) / 1.5));
      return film(t) + city(ctx, MI, 'Lisboa', fade(t, tPort - 0.2, tJ), 'c') + city(ctx, MI, 'Madrid', fade(t, tInv + 0.6, tJ), 'c')
        + badge(t, '1807 – 1808', 'Invasión de la península ibérica', 'Portugal seguía comerciando con los británicos', tPort, tJ - 0.1);
    } },
    { t0: tJ, set: Pe, p0: [0.5, 1.2, 2.2], l0: [0, 1.1, -3.3], p1: [0.35, 1.15, 1.2], l1: [0, 1.1, -3.3], fov0: 36, act: (t) => {
      { const p = A.sit(t, 1, 0); K.pose(jose, p); jose.root.position.y = 0.36 + 0.13; } jose.setFace(C.blinkEye(t, 1), 'smile');
      court.forEach((c, i) => { K.pose(c, C.idle(t, i + 3, 0.4)); c.setFace('flat', 'frown'); });
      return film(t) + nameplate(ctx, [0, 2.1, -3.35], 'José Bonaparte', 'Rey de España · 1808', tJose - 0.1, tMd);
    } },
    { t0: tMd, set: Md, p0: [3.2, 1.45, -10.2], l0: [-0.6, 0.9, 0.5], p1: [2.8, 1.4, -9.4], l1: [-0.6, 0.9, 0.5], fov0: 40, act: (t) => {
      const run = clamp((t - tLev + 0.5) / 2.6);
      rebels.forEach((r, i) => { r.root.position.z = 2 + Math.floor(i / 5) * 1.4 - run * 5; K.pose(r, run > 0 && run < 1 ? C.run(t, 1.1, i) : A.fist(t, i, i % 2 ? 'R' : 'L')); r.setFace('squint', 'shout'); });
      line.forEach((s, i) => { K.pose(s, { ...C.aim(t, 0, i % 2), gun: 'aim' }); s.setFace('squint', 'neutral'); });
      vM.update(t); S.aimSun(Md, 0, -2);
      return film(t) + badge(t, '2 de mayo de 1808', 'Madrid se levanta', 'Comienza la guerra de independencia española', tLev - 0.2, tS - 0.1);
    } },
    { t0: tS, set: Si, p0: [-1.2, 2.5, -9.6], l0: [0.6, 0.2, 2.0], p1: [-0.6, 2.4, -8.8], l1: [1.0, 0.2, 2.0], fov0: 42, act: (t) => sierra(t)
        + badge(t, '1808 – 1814', 'La guerra de guerrillas', 'Emboscadas en caminos y montañas', tS + 0.3, tW - 0.1) },
    { t0: tW, set: Si, p0: [5.5, 1.3, 7.5], l0: [-1, 1.4, -4], p1: [4.8, 1.4, 6.5], l1: [-1, 1.5, -4], fov0: 40, act: (t) => sierra(t)
        + (() => { const k = ss(tPal - 0.15, tPal + 0.3, t) * (1 - ss(tF - 0.3, tF, t)); if (k <= 0) return '';
          return `<div style="position:absolute;inset:0;background:rgba(20,14,10,${0.55 * k})"></div><div style="position:absolute;left:0;right:0;top:300px;text-align:center;opacity:${k};transform:scale(${0.9 + 0.1 * k})">
            <div style="font:900 170px/1 'Inter Display',Inter;color:#fff;letter-spacing:.02em;text-shadow:0 8px 30px rgba(0,0,0,.6)">GUERRILLA</div>
            <div style="font:italic 600 40px Georgia,serif;color:#f3e7c9;margin-top:18px">«pequeña guerra» · una palabra española que adoptó el mundo</div>
            <div style="font:700 30px Inter;color:#e0b84a;letter-spacing:.12em;margin-top:22px">guérilla · guerrilla · Guerilla · guerriglia · герилья</div></div>`; })() },
    { t0: tF, set: Fe, p0: [0.9, 1.1, 2.3], l0: [-0.3, 0.8, -1.4], p1: [0.7, 1.05, 1.7], l1: [-0.3, 0.8, -1.4], fov0: 36, act: (t) => {
      { const p = A.sad(t, 2); p.head = [8, 6 * Math.sin(t * 0.6), 0]; K.pose(fern, p); } fern.setFace('flat', 'frown'); fern.root.position.y = 0.0;
      K.pose(guard, { ...C.idle(t, 4, 0.3), gun: 'port' }); guard.setFace('squint', 'neutral');
      return film(t) + badge(t, '1808 – 1814', 'Fernando VII, prisionero', 'El rey de España, retenido por Napoleón en Francia', tF + 0.3, tA - 0.1);
    } },
    { t0: tA, set: Am, p0: [-10.5, 46, 39], l0: [-11.0, 0, 9.6], p1: [-11.0, 44, 37], l1: [-11.5, 0, 9.2], fov0: 38, act: (t) => {
      sparks.forEach(s => s.update(t, tCol + 0.3 + s.d));
      return film(t) + sparks.map(s => acity(ctx, Am, s.c, fade(t, tCol + 0.35 + s.d, ctx.dur), 'c')).join('')
        + badge(t, '1808 – 1825', 'Las independencias', 'Las colonias españolas se levantan', tCol + 0.2, tD - 0.1);
    } },
    { t0: tD, set: Do, p0: [6.6, 7.6, 2.4], l0: [4.2, 9.6, -6.0], p1: [6.2, 8.0, 1.6], l1: [4.2, 10.0, -6.0], fov0: 38, act: (t) => dolores(t) },
    { t0: tD2, set: Do, p0: [0.5, 1.25, 3.9], l0: [0.1, 1.15, -2.0], p1: [0.4, 1.2, 3.2], l1: [0.1, 1.15, -2.0], fov0: 42, act: (t) => dolores(t)
        + nameplate(ctx, [0.2, 1.5, -1.8], 'Miguel Hidalgo', 'Cura de Dolores', tCura - 0.2, tGrito + 0.4)
        + badge(t, '16 de septiembre de 1810', 'El Grito de Dolores', 'Comienza la guerra de independencia de México', tGrito - 0.1, ctx.dur) },
  ];
  function sierra(t) {
    const hit = clamp((t - tGue - 0.2) / 2.5);
    col.update(t, { x: -6.5 + Math.min(t - tS, tGue - tS + 0.3) * 1.6 - hit * 0.5, z: 0.6, yaw: Math.PI / 2, march: hit < 0.2 ? 1 : 0, speed: 1.1 });
    for (let i = 0; i < col.n; i++) col.alive[i] = hit > 0.3 && (i * 7) % 11 < 3 * hit ? 0 : 1;
    gue.forEach((g, i) => { const shot = gShots.some(([j, f]) => j === i && t > f && t < f + 0.4); K.pose(g, { ...C.aim(t, shot ? 0.8 : 0, 1), gun: 'aim' }); g.setFace('squint', shot ? 'open' : 'neutral'); });
    vS.update(t); S.aimSun(Si, 0, -2);
    return film(t);
  }
  function dolores(t) {
    const ring = clamp((t - t1810 - 0.2) / 3.4), sw = Math.sin((t - t1810) * 4.6) * 0.5 * Math.sin(ring * Math.PI);
    Do.church.bell.rotation.x = sw;
    { const p = C.idle(t, 1, 0.3); const pull = 0.5 + 0.5 * Math.sin((t - t1810) * 4.6); p.armL = [-150 + 40 * pull, 0, -60]; p.armR = [-150 + 40 * pull, 0, 60]; p.elbL = [0, -20, 0]; p.elbR = [0, 20, 0]; K.pose(hid, p); hid.setFace('squint', 'open'); }
    hid.root.visible = t < tD2; const shout = t > tGrito - 0.15;
    K.pose(hid2, shout ? A.fist(t, 2, 'R') : A.orate(t, 2, 0.8)); hid2.setFace(shout ? 'squint' : C.blinkEye(t, 2), shout ? 'shout' : C.talkMouth(t, 2));
    crowd.forEach((c, i) => { K.pose(c, shout ? C.cheer(t + i * 0.15, i) : A.fist(t, i, i % 2 ? 'R' : 'L')); c.setFace(shout ? 'happy' : 'squint', shout ? 'teeth' : 'neutral'); });
    banner.wave(t * 0.6, 0.5); torches.forEach((g, i) => g.fire(t + i * 0.3, g.top));
    Do.glow.forEach((l, i) => (l.intensity = 6 + 1.5 * Math.sin(t * 9 + i * 3)));
    return film(t);
  }
  // musket volley of the French line in Madrid
  [0, 1].forEach(k => { const tt = tLev + 0.4 + k * 1.3; line.forEach((s, i) => { K.pose(s, { ...C.aim(tt, 0, i % 2), gun: 'aim' }); s.root.updateMatrixWorld(true); vM.add(tt + i * 0.05, F.muzzleWorld(s), [0, 0, 1], { puffs: 2, size: 1.0 }); }); });
  const inst = { scene: M, scenes: [M, MI, Pe, Md, Si, Fe, Am, Do], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
