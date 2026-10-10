import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as P from '../../lib/props.js';
import * as F from '../../lib/fx.js';
import { stage, aimSun } from '../../lib/stage.js';
import { camPath, ss, clamp, lerp } from '../../lib/util.js';
import { cast, badge, label, partTimes } from '../../lib/kit.js';
import * as W from '../kit.js';
import { preload as pre, board, place, mapLabel, M } from '../mapkit.js';

export const preload = pre;

export function build(ctx) {
  const L = ctx.L;
  // ---------------------------------------------------------- Normandy beach
  const B = stage({ skyTop: '#6b86ad', skyHor: '#d4d3c9', groundA: '#d6c597', groundB: '#c8b688', fog: ['#cfcfc7', 30, 140], sunPos: [-6, 12, 9], sun: 2.2, hemi: 1.25, shadow: 18, seed: 301 });
  const sea = new THREE.Mesh(new THREE.BoxGeometry(220, 0.4, 90), new THREE.MeshStandardMaterial({ color: '#5a8095', roughness: 0.3, transparent: true, opacity: 0.93 }));
  sea.position.set(0, 0.18, 47); B.add(sea);
  const bluff = new THREE.Mesh(new THREE.BoxGeometry(220, 2.2, 40), new THREE.MeshStandardMaterial({ color: '#7d9a55', roughness: 1 })); bluff.position.set(0, 1.1, -30); B.add(bluff);
  for (const x of [-8, 6]) { const b = W.bunker('#9b9a90'); b.position.set(x, 2.2, -10.6); b.rotation.y = 0; B.add(b); }
  for (let i = 0; i < 14; i++) { const h = new THREE.Group(); for (const r of [0, Math.PI / 2, Math.PI / 4]) { const bar = P.box(0.9, 0.08, 0.08, '#4a4a46'); bar.rotation.set(0.6, r, 0); h.add(bar); } h.position.set(-14 + i * 2.2, 0.35, 1.5 + (i % 2) * 1.5); B.add(h); }
  const craft = [-6, 0, 6].map((x, i) => { const c = W.landingCraft(); c.position.set(x, 0.15, 14); B.add(c); return c; });
  const ships = [-25, 5, 30].map((x, i) => { const s = W.boat('#5b646b', 8); s.scale.setScalar(1.8); s.position.set(x, 0.1, 45 + i * 6); s.rotation.y = Math.PI / 2; B.add(s); return s; });
  const troops = [];
  for (let i = 0; i < 12; i++) troops.push(W.soldier(cast(B, ['cafe', 'tamamo', 'cafe', 'doto'][i % 4], null), ['us', 'uk', 'us', 'fr'][i % 4]));
  const blasts = [[-3, 0.2, -2.5], [4, 0.2, -4], [-9, 0.2, -1.5], [8, 0.2, 0]].map((p, i) => new F.Explosion(B, p, 0, 0.8, 310 + i, { smokeColor: '#b9ab8a' }));
  const planes = [0, 1, 2, 3].map(() => { const p = W.plane('#5b6140', { mark: 'uk' }); B.add(p); return p; });
  // ---------------------------------------------------------- map: two fronts
  const Mp = stage({ groundA: null, skyTop: '#4a6fa8', skyHor: '#cfe0ea', fog: ['#cfe0ea', 60, 200], sunPos: [6, 18, 10], sun: 2.3, hemi: 1.3, shadow: 30 });
  const map = board(Mp);
  const west = [M.arrow([[-0.8, 49.4], [2, 49.1], [5.5, 49.8], [9, 50.6]], '#4d7fc4', 1.3), M.arrow([[2.5, 46.5], [5.5, 47.6], [8, 48.6]], '#4d7fc4', 0.9)];
  const east = [M.arrow([[30, 54.5], [25.5, 53.6], [20.5, 52.6], [16.5, 52.4]], '#c0453a', 1.4), M.arrow([[28, 48.5], [24, 47.5], [20, 47.3]], '#c0453a', 1.0)];
  [...west, ...east].forEach(a => Mp.add(a));
  const mc = W.soldier(cast(Mp, 'mcqueen', null), 'de', { gun: false }); place(mc, 11.5, 50.8, 0);
  const sw = F.bubble('💦', { bg: null, font: 170 }); Mp.add(sw);
  const pd = partTimes(L[0], ['En junio de mil novecientos cuarenta y cuatro, los aliados desembarcaron en Normandía.', 'Casi al mismo tiempo, el Ejército Rojo lanzó una ofensiva gigantesca en el este.']);
  const tLand = 1.4, tMap = pd[1] - 0.2;
  blasts.forEach((b, i) => { b.t0 = tLand + 1.6 + i * 1.1; });
  const ev0 = [
    { t: -1, names: M.expand(['germany', 'poland', 'france', 'benelux', 'nordic_occ', 'balkans']), color: M.COLORS.occupied }, { t: -1, names: ['Germany', 'Austria'], color: M.COLORS.axis },
    { t: -1, names: ['United Kingdom'], color: M.COLORS.allies }, { t: -1, names: ['Russia', 'Ukraine', 'Georgia', 'Armenia', 'Azerbaijan', 'Kazakhstan', 'Moldova'], color: M.COLORS.ussr },
    { t: -1, names: ['Belarus', 'Lithuania', 'Latvia', 'Estonia'], color: M.COLORS.occupied }, { t: -1, names: M.expand(['neutral']), color: M.COLORS.neutral }, { t: -1, names: [...M.expand(['axis_minor']), 'Italy'], color: M.COLORS.axis_minor },
    { t: tMap + 2.0, names: ['France', 'Belgium', 'Luxembourg'], color: M.COLORS.allies }, { t: tMap + 2.2, names: ['Belarus', 'Lithuania', 'Latvia', 'Estonia'], color: M.COLORS.ussr },
  ];
  const sfx = [{ t: 0.3, type: 'waves', dur: tMap, vol: 0.6 }, { t: tLand + 0.6, type: 'clank' }, ...blasts.map(b => ({ t: b.t0, type: 'boom', vol: 0.55 })), { t: tLand + 1, type: 'march', dur: 5, vol: 0.5 },
    { t: tLand + 2, type: 'plane', dur: 4, vol: 0.5 }, { t: tMap, type: 'whoosh' }, { t: L[1].t0, type: 'tension' }];

  function update(t) {
    let html = '';
    if (t < tMap) {
      this.current = B;
      craft.forEach((c, i) => { const k = ss(0, tLand, t); c.position.z = lerp(14, 5.2, k); c.position.y = 0.15 + 0.05 * Math.sin(t * 2 + i); c.ramp.rotation.x = 1.45 * ss(tLand + 0.3, tLand + 0.9, t); });
      ships.forEach((s, i) => { s.position.y = 0.1 + 0.08 * Math.sin(t + i); });
      troops.forEach((c, i) => {
        const cr = craft[i % 3], d = Math.max(0, (t - tLand - 0.8 - Math.floor(i / 3) * 0.45)) * 2.6;
        const x = cr.position.x + ((i % 3) - 1) * 0.5 + (Math.floor(i / 3) % 2) * 0.3, z = cr.position.z + 0.4 - d;
        c.root.position.set(x, z > 2.5 ? -0.3 * clamp((z - 2.5) / 2) : 0, z); c.root.rotation.y = Math.PI; c.root.visible = d > 0 || t < tLand + 0.8 ? d > 0.05 : false;
        c.apply({ ...C.runArmed(t, 1.0, i), gun: 'port' }); c.setFace('squint', 'shout');
      });
      blasts.forEach(b => b.update(t));
      planes.forEach((p, i) => { const k = (t - tLand - 2 - i * 0.3) * 11; p.position.set(-45 + k, 9 + i * 0.7, -6 - i * 2.5); p.rotation.set(0, Math.PI / 2, 0); p.prop.rotation.z = t * 60; p.visible = k > 0 && k < 95; });
      camPath(ctx.camera, [
        { t: 0, p: [3, 2.0, 22], l: [0, 0.8, 6], fov: 42 },
        { t: tLand + 0.7, p: [3, 1.9, 19], l: [0, 0.8, 5], fov: 42 },
        { t: tLand + 0.75, p: [2.5, 1.6, -4.5], l: [0, 0.9, 5], fov: 46 },
        { t: tMap, p: [4.5, 2.6, -7], l: [0, 0.7, 4], fov: 48 },
      ], t);
      aimSun(B, 0, 2);
      html += badge(t, '6 de junio de 1944', 'Día D: Normandía', 'El mayor desembarco de la historia', 0.8, tMap);
    } else {
      this.current = Mp;
      M.paint(map, ev0, t);
      west.forEach((a, i) => a.set(ss(tMap + 0.4 + i * 0.3, tMap + 2.8, t) * (0.6 + 0.4 * ss(L[1].t0, L[1].t1, t))));
      east.forEach((a, i) => a.set(ss(tMap + 0.8 + i * 0.3, tMap + 3.2, t) * (0.6 + 0.4 * ss(L[1].t0, L[1].t1, t))));
      const sq = ss(L[1].t0, L[1].t1, t);
      mc.root.scale.set(2.2 * (1 - 0.18 * sq), 2.2 * (1 + 0.08 * sq), 2.2);
      mc.apply(C.lookAround(t * 1.6, 1)); mc.setFace('shock', 'wavy');
      sw.position.set(mc.root.position.x + 0.7, mc.root.position.y, mc.root.position.z); F.popSprite(sw, t, L[1].t0 + 0.3, ctx.dur, 0.8, mc.root.position.y + 2.9);
      camPath(ctx.camera, [{ t: tMap, p: [4, 16, 15], l: [4, 0, 0.5], fov: 48 }, { t: ctx.dur, p: [3.5, 13.5, 12.5], l: [3.5, 0, 0.5], fov: 46 }], t);
      aimSun(Mp, 4, 0);
      html += mapLabel(ctx, 0, 48.6, 'Día D', ss(tMap + 0.6, tMap + 1.0, t), 'n', 0.5) + mapLabel(ctx, 28, 55.3, 'Operación Bagratión', ss(tMap + 1.0, tMap + 1.4, t), 'r', 0.5);
      html += badge(t, 'Verano de 1944', 'Dos frentes', 'Aliados por el oeste, Ejército Rojo por el este', L[1].t0, ctx.dur);
    }
    return html;
  }
  const inst = { scene: B, scenes: [B, Mp], sfx };
  inst.update = update.bind(inst);
  return inst;
}
