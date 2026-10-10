import * as THREE from 'three';
import * as C from '../lib/chars.js';
import * as P from '../lib/props.js';
import * as G from '../lib/gear.js';
import * as F from '../lib/fx.js';
import { stage, aimSun } from '../lib/stage.js';
import { camPath, ss, clamp, along, track } from '../lib/util.js';
import { cast, chapter, badge, label } from '../lib/kit.js';

const BX = 300; // cutaway diorama set offset

export function build(ctx) {
  const L = ctx.L;
  const scene = stage({ skyTop: '#5a8fcf', skyHor: '#d8eadf', groundA: '#4f8a3a', groundB: '#3d7430', fog: ['#c9dccb', 18, 90],
    sunPos: [5, 13, 8], sun: 2.4, hemi: 1.25, shadow: 14, seed: 51, groundSize: 200 });
  const env = new THREE.Group(); scene.add(env);
  // jungle: steep green hills, palms, dense trees, ferns and swampy pools
  for (const [x, z, h, r] of [[-30, -45, 22, 14], [-8, -50, 30, 15], [16, -48, 24, 13], [36, -40, 18, 12], [-48, -30, 16, 12]]) { const m = P.mountain(h, r, '#3f6f3c', false, x + 3); m.position.set(x, 0, z); env.add(m); }
  const clear = [[0, 0, 3.2], [0, 6, 4], [-7, 4, 2.5], [6, 4, 3]];
  P.scatter(env, (r, i) => (i % 3 === 0 ? P.palm(1 + r() * 0.5, i) : P.roundTree(1.3 + r() * 0.7, '#2f7a33', i)), 140, [-35, -30, 35, -3], 52, clear);
  P.scatter(env, (r, i) => (i % 2 ? P.palm(0.9 + r() * 0.5, i + 3) : P.roundTree(1.2 + r() * 0.6, '#347d36', i)), 50, [-35, 9, 35, 30], 53, clear);
  P.scatter(env, (r, i) => P.bush(0.7 + r() * 0.7, '#2f7030', i), 90, [-25, -10, 25, 9], 54, [[0, 0, 2.3], [0, 6, 3.5], [3.4, 7.4, 1.8]]);
  for (const [x, z, r] of [[-9, 2, 2.2], [8, -2, 1.8], [-14, -6, 3]]) { const w = new THREE.Mesh(new THREE.CircleGeometry(r, 20), new THREE.MeshStandardMaterial({ color: '#5d8a86', roughness: 0.2, metalness: 0.1 })); w.rotation.x = -Math.PI / 2; w.position.set(x, 0.015, z); env.add(w); }
  const trap = P.trapdoor(); scene.add(trap);

  const g = [cast(scene, 'oguri', G.guerrilla, -12, -1), cast(scene, 'tamamo', G.guerrilla, -13, 0.5), cast(scene, 'cafe', G.guerrilla, -14, -0.5)];
  const patrol = [cast(scene, 'mcqueen', G.army, 0, 0), cast(scene, 'daiwa', G.army, 0, 0)];
  const qs = patrol.map(() => { const b = F.bubble('?'); scene.add(b); return b; });

  // ------------------------------------------------ cutaway set
  const B = new THREE.Group(); B.position.x = BX; scene.add(B);
  const gB = P.ground(120, '#4f8a3a', '#3d7430', 57); gB.position.set(0, 0, -62); B.add(gB);
  const earth = new THREE.Mesh(new THREE.BoxGeometry(22, 7, 6), new THREE.MeshStandardMaterial({ color: '#7a5434', roughness: 1 })); earth.position.set(0, -3.5, -3); B.add(earth);
  const band = new THREE.Mesh(new THREE.BoxGeometry(22.02, 2, 6.02), new THREE.MeshStandardMaterial({ color: '#6a462a', roughness: 1 })); band.position.set(0, -5.5, -3); B.add(band);
  const turf = new THREE.Mesh(new THREE.BoxGeometry(22.04, 0.25, 6.04), new THREE.MeshStandardMaterial({ color: '#4f8a3a', roughness: 1 })); turf.position.set(0, -0.1, -3); B.add(turf);
  const dark = new THREE.MeshBasicMaterial({ color: '#24170d' }), floor = new THREE.MeshStandardMaterial({ color: '#9a7350', roughness: 1 });
  const hole = (x0, x1, y0, y1) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, y1 - y0), dark); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0.012); B.add(m);
    const f = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.06, 0.8), floor); f.position.set((x0 + x1) / 2, y0 - 0.03, 0.4); f.receiveShadow = true; B.add(f);
  };
  hole(-8.2, -7.3, -2.2, 0.05); hole(-8.2, 4.6, -2.2, -1.0); hole(-3.4, 0.2, -2.7, -1.0);       // entrance shaft, upper passage, store room
  hole(3.7, 4.6, -4.6, -1.0); hole(-6.5, 8.6, -4.6, -3.4); hole(-5.6, -1.8, -5.2, -3.4); hole(7.7, 8.6, -4.6, 0.05);  // shaft, lower passage, living room, exit
  for (const [x, y] of [[-2.9, -2.7], [-2.4, -2.7], [-2.65, -2.35]]) { const c = P.crate(0.34); c.position.set(x, y, 0.5); B.add(c); }
  const lamp = (x, y) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffd27a' })); m.position.set(x, y, 0.3); B.add(m); const l = new THREE.PointLight('#ffb35a', 2.5, 4, 1.5); l.position.set(x, y, 0.8); B.add(l); };
  lamp(-1.2, -1.3); lamp(-3.8, -3.6); lamp(6, -3.6);
  const pot = P.barrel('#3a3a3a'); pot.scale.setScalar(0.6); pot.position.set(-4.8, -5.2, 0.45); B.add(pot);
  P.scatter(B, (r, i) => (i % 2 ? P.palm(0.9 + r() * 0.3, i) : P.bush(0.8, '#2f7030', i)), 9, [-10.5, -5.5, 10.5, -0.5], 58, [[-7.75, -1, 1.2], [8.15, -1, 1.2]]);
  P.scatter(B, (r, i) => P.roundTree(1.3 + r() * 0.5, '#2f7a33', i), 40, [-40, -60, 40, -7], 59);
  const gu = [cast(B, 'oguri', G.guerrilla), cast(B, 'tamamo', G.guerrilla), cast(B, 'cafe', G.guerrilla)];
  const topPatrol = cast(B, 'suzuka', G.army, 0, 0, Math.PI / 2); topPatrol.root.position.z = -1.5;

  // timing
  const tLid = L[2].t0 - 0.6, tDrop = [tLid + 0.5, tLid + 1.0, tLid + 1.5], tClose = tLid + 2.3;
  const tCutIn = tClose + 0.4, tCutOut = L[3].t0 - 0.5, tPatrol = L[3].t0 - 3.6;
  const sfx = [{ t: 0.3, type: 'sting' }, { t: tLid, type: 'creak' }, ...tDrop.map(t => ({ t, type: 'thud', vol: 0.5 })), { t: tClose, type: 'thud' },
    { t: tCutIn, type: 'whoosh' }, { t: tCutOut, type: 'whoosh' }, { t: L[3].t0 + 0.6, type: 'pop' }];

  function update(t) {
    const inB = t >= tCutIn && t < tCutOut;
    // trapdoor lid
    trap.lid.rotation.x = -1.9 * ss(tLid, tLid + 0.4, t) * (1 - ss(tClose, tClose + 0.35, t));
    // guerrillas sneak through the jungle toward the trapdoor
    const path = [[-12, -1], [-7, 1.5], [-4, -1.5], [-1.2, 0.2], [0, 0]];
    g.forEach((c, i) => {
      const d = Math.max(0, (t - 0.4) * 1.55 - i * 1.1);
      const pos = along(path, d);
      const tdI = tDrop[i];
      if (t < tdI - 0.5) {
        c.root.position.set(pos.x - (pos.done ? (i === 0 ? 0 : (i === 1 ? -0.7 : 0.7)) : 0), 0, pos.z + (pos.done ? 0.8 + i * 0.3 : 0));
        c.root.rotation.y = pos.done ? Math.PI : pos.yaw;
        c.apply(pos.done ? { ...C.crouch(t, c.seed, 0.4), gun: 'back' } : { ...C.blend(C.walk(t, 1.05, i), C.crouch(t, c.seed, 0.5), 0.35), gun: 'port' });
        c.setFace(C.blinkEye(t, c.seed, 'flat'), 'neutral');
      } else {
        // hop into the hole
        const k = clamp((t - (tdI - 0.5)) / 0.5), sink = clamp((t - tdI) / 0.35);
        c.root.position.set(0, 0.25 * Math.sin(k * Math.PI) - 1.5 * sink * sink, 0.05);
        c.apply({ ...C.crouch(t, c.seed, 0.6 * (1 - k)), gun: 'back' }); c.root.visible = sink < 1;
        c.setFace('squint', 'grin');
      }
    });
    // patrol arrives and finds nobody
    patrol.forEach((c, i) => {
      const d = Math.max(0, (t - tPatrol) * 1.6);
      const pos = along([[6.5 + i, -4.5 - i * 0.5], [3, -1.5], [1.1 + i * 0.6, 0.9 - i * 1.5]], d);
      c.root.position.set(pos.x, 0, pos.z);
      c.root.rotation.y = pos.done ? (i ? 0.4 : 2.2) : pos.yaw;
      c.apply(pos.done ? { ...C.lookAround(t, i * 2), gun: 'low' } : { ...C.walkArmed(t, 0.9, i), gun: 'low' });
      c.setFace(pos.done ? (i ? 'shock' : 'open') : C.blinkEye(t, c.seed), pos.done ? 'small' : 'neutral');
      c.root.visible = t > tPatrol;
    });
    qs.forEach((b, i) => { const p = patrol[i].root.position; b.position.set(p.x, 0, p.z); F.popSprite(b, t, L[3].t0 + 0.6 + i * 0.3, 99, 0.42, 1.55); });

    // cutaway: the trio moves through the tunnels
    if (inB) {
      const u = t - tCutIn;
      const routes = [
        [[-7.75, -2.2], [-1.8, -2.7 + 0.0]],                // to the store room
        [[-7.75, -2.2], [4.15, -2.2], [4.15, -4.6], [7.0, -4.6]],
        [[-3.6, -5.2], [-2.6, -5.2]],
      ];
      gu.forEach((c, i) => {
        const r = routes[i], d = Math.max(0, u * 1.45 - i * 0.6);
        const pos = along(r, d);
        // vertical shaft segments: climb (no rotation)
        const vertical = r.length > 2 && pos.x === 4.15 && pos.z < -2.21;
        c.root.position.set(pos.x, pos.z, 0.42);
        c.root.rotation.y = pos.done ? (i === 2 ? 0.5 : 0.2) : (vertical ? 0 : Math.PI / 2 * Math.sign(r[1][0] - r[0][0] || 1));
        if (i === 2) c.apply({ ...C.blend(C.idle(t, c.seed), C.offer(t, c.seed, 0.6), 0.6), gun: 'none' });
        else c.apply(pos.done ? { ...C.idle(t, c.seed), gun: 'back' } : { ...C.blend(C.walk(t, 1.0, i), C.crouch(t, c.seed, 0.45), 0.4), gun: 'back' });
        c.setFace(C.blinkEye(t, c.seed), i === 2 ? 'smile' : 'neutral');
      });
      const px = -9 + (t - tCutIn) * 1.1;
      topPatrol.root.position.set(px, 0, -1.6); topPatrol.root.rotation.y = Math.PI / 2;
      topPatrol.apply({ ...C.walkArmed(t, 0.8), gun: 'low' }); topPatrol.setFace(C.blinkEye(t, 3), 'neutral');
    }

    if (inB) camPath(ctx.camera, [{ t: tCutIn, p: [BX - 1.2, -1.0, 13.5], l: [BX - 0.8, -2.2, 0], fov: 44 }, { t: tCutOut, p: [BX + 0.8, -0.9, 13.5], l: [BX + 0.4, -2.1, 0], fov: 44 }], t);
    else camPath(ctx.camera, [
      { t: 0, p: [-6, 7, 14], l: [-4, 0.5, -1], fov: 40 },
      { t: L[1].t0, p: [-9, 2.4, 7.5], l: [-7.5, 0.6, 0], fov: 38 },
      { t: L[2].t0 - 1.4, p: [-3, 1.6, 5.4], l: [-1.4, 0.5, 0], fov: 36 },
      { t: tClose, p: [1.4, 1.5, 4.4], l: [0, 0.3, 0], fov: 36 },
      { t: tCutOut, p: [-1.8, 2.2, 6.4], l: [1.0, 0.5, -0.3], fov: 38 },
      { t: ctx.dur, p: [-2.4, 2.4, 7.2], l: [1.1, 0.6, -0.3], fov: 38 },
    ], t);
    aimSun(scene, inB ? BX : ctx.camera.position.x * 0.6, 0);

    let html = chapter(t, 2, 'Use the terrain', 0.3, L[1].t0 + 1.5);
    if (inB) {
      html += badge(t, 'VIETNAM · 1960s', 'Cu Chi tunnels', '200+ km of tunnels: hideouts, storerooms, kitchens', tCutIn + 0.3, tCutOut);
      const k = ss(tCutIn + 1.0, tCutIn + 1.4, t) * (1 - ss(tCutOut - 0.3, tCutOut, t));
      html += label(ctx, [BX - 7.75, 0.9, 0], 'Hidden entrance', 'n', k) + label(ctx, [BX - 1.6, -0.75, 0.3], 'Storeroom', 'n', k) +
        label(ctx, [BX - 3.7, -3.0, 0.3], 'Kitchen', 'n', k) + label(ctx, [BX + 8.15, 0.9, 0], 'Escape exit', 'n', k);
      html += label(ctx, [topPatrol.root.position.x + BX, 1.8, -1.6], 'Enemy patrol', 'a', k);
    }
    if (t > L[3].t0) html += label(ctx, [0, 0.35, 0.1], '▼ Trapdoor', 'g', ss(L[3].t0 + 1.4, L[3].t0 + 1.8, t));
    return html;
  }
  return { scene, update, sfx };
}
