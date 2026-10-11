import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as LP from '../../lib/props.js';
import { ss, clamp } from '../../lib/util.js';
import { badge } from '../../lib/kit.js';
import * as N from '../props.js';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as FX from '../fx.js';
import * as A from '../../mx/anim.js';
import { Troop } from '../troops.js';
import { runShots, wt } from '../../mx/shots.js';
import { film, nameplate, stamp } from '../../mx/ui.js';
import { mapSet, city, fade, marker, GM } from '../mapkit.js';

export { preload } from '../mapkit.js';
const CITY = GM.CITY;

export function build(ctx) {
  const L = ctx.L;
  const t1789 = wt(L[0], 'en$'), tTomo = wt(L[0], 'tomo'), tPocos = wt(L[0], 'pocos'), tAbol = wt(L[0], 'abolio'), tEjec = wt(L[0], 'ejecuto');
  const tAter = wt(L[1], 'aterrados'), tAli = wt(L[1], 'aliaron'), tCom = wt(L[1], 'comenzaron'), tNap = wt(L[2], 'napoleon'), tArt = wt(L[2], 'artilleria');

  // ---- 1. Paris, 14 July 1789: the crowd storms the Bastille
  const B = S.bastilleSet(); B.flags.forEach(f => (f.visible = false));
  const mob = [];
  for (let i = 0; i < 14; i++) { const r = K.person(B, ['doto', 'oguri', 'suzuka', 'helios', 'tamamo', 'mcqueen', 'daiwa'][i % 7], i % 3 === 0 ? 'sansPike' : 'sansculotte', 0, 0, Math.PI);
    r.lane = -3.2 + (i % 7) * 1.05 + (Math.floor(i / 7) % 2) * 0.5; r.row = Math.floor(i / 7); mob.push(r); }
  const crowd = new Troop(B, { rows: 5, cols: 14, coat: '#6a5a48', pants: '#e6dcc6', hat: 'round', hatColor: '#2a2622', plume: null, musket: true, belts: '#c0272d', seed: 4, jitter: 0.25, spacing: [0.7, 0.8] });
  const banner = N.flag('fr', 2.6, 1.1, 0.7); B.add(banner);
  const fx = new FX.Volleys(B, { size: 0.9, life: 5, drift: [0.4, 0.25, 0] });
  for (let k = 0; k < 7; k++) for (const [x, z] of [[-6, -13], [-2, -12.6], [2, -12.6], [6, -13]]) if ((k + x) % 2 === 0) fx.add(1.0 + k * 1.05 + (x + 6) * 0.07, [x, 8.6, z], [0, -0.15, 1], { puffs: 2, size: 2.2 });
  // ---- 2. The royal throne: the crown falls
  const T = S.throneRoom();
  const cush = N.cushion('#8a1f2a'); cush.position.set(0, 0.36 + 0.62, -3.42); T.add(cush);
  const crown = K.crown(); crown.scale.setScalar(0.9); T.add(crown);
  // ---- 3. Europe 1792: the kings unite against France
  const M = mapSet({ per: '1792' });
  const kings = [['Londres', 0], ['Viena', 0.15], ['Berlín', 0.3], ['Madrid', 0.45], ['San Petersburgo', 0.6], ['Nápoles', 0.75], ['Ámsterdam', 0.9]].map(([c, d]) => { const m = marker(M, ...CITY[c], '👑', '#d4af37', 1.9); m.d = d; m.c = c; return m; });
  const COAL = '#c0392b';
  const arrows = [[['Viena', 'Múnich'], 'Estrasburgo'], [['Berlín', 'Colonia'], 'Bruselas'], [['Londres'], 'Boulogne'], [['Madrid', 'Zaragoza'], 'Bayona'], [['Turín'], 'Marsella']].map(([from, to], i) => {
    const pts = [...from.map(c => CITY[c] || { 'Múnich': [11.58, 48.14], 'Colonia': [6.96, 50.94], 'Turín': [7.69, 45.07] }[c]), CITY[to]];
    const a = GM.arrow(pts, COAL, 0.6); a.d = i * 0.18; M.add(a); return a; });
  const ev = [{ t: tAli - 0.1, pol: ['AUT', 'PRU', 'GBR', 'ESP', 'SAR', 'NED', 'NAP', 'RUS', 'HRE', 'POR'], color: '#d98a7e' }, { t: tAli + 0.2, pol: ['FRA'], color: '#4f6fc0' }];
  // ---- 4. Toulon, 1793: the young artillery officer
  const Tl = S.toulon('golden');
  const guns = [-1.8, 0.6, 3.0].map((x, i) => { const g = N.fieldGun(); g.position.set(x, 0, 0.6); g.rotation.y = Math.PI + (i - 1) * 0.08; Tl.add(g); return g; });
  const crew = [[-2.5, 0.9], [-0.1, 1.1], [2.3, 0.9]].map(([x, z], i) => K.person(Tl, ['doto', 'helios', 'tamamo'][i], 'artillero', x, z, Math.PI - 0.3));
  const young = K.person(Tl, 'napoleonYoung', 'napoleonYoung', 4.4, 0.9, Math.PI - 0.45);
  const gfx = new FX.Volleys(Tl, { size: 0.7, life: 4.2, drift: [0.3, 0.15, 0] });
  guns.forEach((g, i) => { for (let k = 0; k < 3; k++) { const tt = L[2].t0 + 0.6 + i * 0.7 + k * 1.9; g.updateMatrixWorld(true); const p = new THREE.Vector3(); g.muzzle.getWorldPosition(p); gfx.add(tt, p, [0, 0.05, -1], { puffs: 3, size: 1.4 }); g.fireTimes = (g.fireTimes || []).concat(tt); } });
  const splash = new FX.Volleys(Tl, { color: '#f4f8fa', size: 1.2, life: 2.0, drift: [0, 0.4, 0] });
  Tl.ships.forEach((sh, i) => { for (let k = 0; k < 3; k++) splash.add(L[2].t0 + 1.5 + i * 0.7 + k * 1.9, [sh.position.x + (k - 1) * 3, -1.8, sh.position.z + 3], [0, 1, 0], { puffs: 2, size: 1.6 }); });

  const sfx = [{ t: 0.2, type: 'crowd', dur: 8.0, vol: 0.7 }, ...fx.times().map(t => ({ t, type: 'boom', vol: 0.25 })), { t: tTomo + 0.2, type: 'cheer', vol: 0.8 },
    { t: tAbol + 0.25, type: 'clank', vol: 0.7 }, { t: tEjec + 0.1, type: 'thud', vol: 0.9 }, { t: tEjec + 0.1, type: 'sting2', vol: 0.5 },
    { t: tAter, type: 'tension', vol: 0.5 }, { t: tAli, type: 'whoosh', vol: 0.6 }, { t: tCom, type: 'drums', dur: L[2].t0 - tCom, vol: 0.6 },
    ...guns.flatMap(g => g.fireTimes.map(t => ({ t, type: 'cannon', vol: 0.6 })))];

  const tA = 0, tB = tPocos - 0.15, tC = L[1].t0 - 0.15, tD = L[2].t0 - 0.2;
  const shots = [
    { t0: tA, set: B, p0: [5.5, 2.4, 9.5], l0: [-0.5, 3.2, -10], p1: [3.6, 1.9, 5.0], l1: [-0.3, 3.6, -12], fov0: 40, act: (t) => {
      const run = clamp((t - t1789 + 0.2) / 4.2);
      mob.forEach((r, i) => { const z = 2.6 - r.row * 1.3 - run * 8.6 + (i % 3) * 0.2; r.root.position.set(r.lane, 0, z);
        const go = run > 0 && run < 1; K.pose(r, go ? { ...C.runArmed(t, 1.1, i), gun: 'port' } : t > tTomo ? { ...C.cheer(t + i * 0.13, i), gun: r.gun ? 'port' : 'none' } : { ...A.fist(t, i, i % 2 ? 'R' : 'L'), gun: r.gun ? 'low' : 'none' });
        r.setFace(go ? 'squint' : t > tTomo ? 'happy' : 'squint', go ? 'shout' : 'teeth'); });
      crowd.update(t, { x: 0.2, z: 6.4 - run * 8.0, yaw: Math.PI, march: run > 0 && run < 1 ? 1 : 0, speed: 1.6 });
      banner.position.set(0.9, 0, 3.6 - run * 8.4); banner.wave(t);
      fx.update(t); S.aimSun(B, 0, -3);
      return film(t) + badge(t, '14 de julio de 1789', 'La toma de la Bastilla', 'El pueblo de París asalta la fortaleza-prisión del rey', 3.9, tB - 0.2);
    } },
    { t0: tB, set: T, p0: [0, 1.25, 1.6], l0: [0, 1.15, -3.4], p1: [0, 1.15, 0.6], l1: [0, 1.1, -3.4], fov0: 34, act: (t) => {
      const f = clamp((t - tAbol - 0.15) / 0.55), roll = clamp((t - tAbol - 0.7) / 1.0);
      const y0 = 0.36 + 0.62 + 0.12, y = f < 1 ? y0 - (y0 - 0.02) * f * f : 0.02 + 0.06 * Math.abs(Math.sin(roll * 9)) * (1 - roll);
      crown.position.set(0.15 * f + 0.9 * roll, y, -3.42 + 0.7 * f + 0.8 * roll); crown.rotation.set(1.2 * f + roll * 0.3, roll * 4, 0.9 * f + roll * 0.6);
      const dark = ss(tEjec - 0.05, tEjec + 0.6, t);
      S.mood(T, { hemi: 0.9 * (1 - 0.7 * dark), sun: 1.4 * (1 - 0.8 * dark) });
      return film(t) + `<div style="position:absolute;inset:0;background:#2a0606;opacity:${0.45 * dark}"></div>`
        + stamp(t, 'MONARQUÍA<br>ABOLIDA · 1792', tAbol + 0.6, tEjec - 0.05, { x: 1360, y: 330 })
        + badge(t, '21 de enero de 1793', 'Luis XVI es ejecutado', 'Francia se convierte en república', tEjec + 0.25, tC);
    } },
    { t0: tC, set: M, p0: [-3.0, 21, 15], l0: [-3.6, 0, 1.4], p1: [-3.6, 19, 13.4], l1: [-4.2, 0, 1.4], fov0: 38, act: (t) => {
      GM.paint(M.map, ev, t);
      kings.forEach(k => { k.update(t, L[1].t0 + k.d, tAli + 1.2); if (t > tAter && t < tAli) k.children[1].position.x = 0.06 * Math.sin(t * 40 + k.d * 9); });
      arrows.forEach(a => a.set(clamp((t - tAli - a.d) / 1.0)));
      return film(t) + city(ctx, M, 'París', fade(t, tC + 0.2, ctx.dur), 'c big')
        + `<div style="position:absolute;left:50%;top:120px;transform:translateX(-50%) scale(${0.9 + 0.1 * ss(tCom, tCom + 0.4, t)});opacity:${fade(t, tCom - 0.1, ctx.dur)};text-align:center;background:rgba(20,16,14,.82);padding:18px 40px;border-radius:14px;border-bottom:6px solid #c0392b">
          <div style="font:800 24px Inter;letter-spacing:.3em;color:#ffb627">1792 – 1815</div><div style="font:900 58px/1.1 'Inter Display',Inter;color:#fff">Más de veinte años de guerras</div></div>`;
    } },
    { t0: tD, set: Tl, p0: [4.0, 1.6, 6.6], l0: [0.0, 0.6, -6], p1: [3.0, 1.45, 5.2], l1: [0.0, 0.5, -8], fov0: 40, act: (t) => toulon(t)
        + badge(t, 'Tolón, 1793', 'El sitio de Tolón', 'Sus cañones expulsan a la flota británica del puerto', L[2].t0 + 0.3, tNap - 0.7) },
    { t0: tNap - 0.7, set: Tl, p0: [5.9, 1.05, -1.9], l0: [4.3, 0.92, 0.9], p1: [5.5, 1.02, -1.3], l1: [4.3, 0.92, 0.9], fov0: 36, act: (t) => toulon(t)
        + nameplate(ctx, [4.4, 1.42, 0.9], 'Napoleón Bonaparte', 'Joven oficial de artillería', tNap - 0.3, ctx.dur) },
  ];
  function toulon(t) {
    crew.forEach((c, i) => { const rec = guns[i].fireTimes.some(f => t > f && t < f + 0.5); K.pose(c, rec ? A.humble(t, i) : C.crouch(t, i, 0.35)); c.setFace(rec ? 'squint' : C.blinkEye(t, i), rec ? 'open' : 'neutral'); });
    guns.forEach((g, i) => { const r = g.fireTimes.reduce((a, f) => a + (t > f ? Math.max(0, 1 - (t - f) * 3) : 0), 0); g.position.z = 0.6 + 0.18 * r; });
    K.pose(young, A.proud(t, 2)); young.setFace(C.blinkEye(t, 7), 'neutral');
    Tl.ships.forEach((sh, i) => { sh.wave(t + i); sh.position.y = -2.2 + 0.05 * Math.sin(t * 1.2 + i); });
    Tl.sea.wave(t); gfx.update(t); splash.update(t); S.aimSun(Tl, 1, 0);
    return film(t);
  }
  const inst = { scene: B, scenes: [B, T, M, Tl], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
