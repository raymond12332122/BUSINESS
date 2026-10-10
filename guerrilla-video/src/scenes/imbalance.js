import * as THREE from 'three';
import * as C from '../lib/chars.js';
import * as P from '../lib/props.js';
import * as G from '../lib/gear.js';
import * as F from '../lib/fx.js';
import { stage, aimSun } from '../lib/stage.js';
import { camPath, ss, clamp, along, track } from '../lib/util.js';
import { cast, label, stat } from '../lib/kit.js';

export function build(ctx) {
  const L = ctx.L;
  const scene = stage({ skyTop: '#5d8ad0', skyHor: '#dbe6ee', groundA: '#93b765', groundB: '#77a04f', fog: ['#dde6e8', 40, 180],
    sunPos: [6, 12, 9], sun: 2.6, shadow: 22, seed: 9 });
  const env = new THREE.Group(); scene.add(env);
  for (const [x, z, h, r] of [[-80, -110, 30, 34], [-10, -130, 40, 40], [60, -120, 32, 32]]) { const m = P.mountain(h, r, '#8a99a6', h > 35, x); m.position.set(x, 0, z); env.add(m); }
  // forest behind the guerrillas
  P.scatter(env, (r, i) => P.pine(1 + r() * 0.7, '#2c6436', i), 90, [12, -20, 34, 20], 21);
  P.scatter(env, (r, i) => P.roundTree(1 + r() * 0.5, '#4f8f3a', i), 30, [-40, -30, 40, -14], 22);
  P.scatter(env, (r, i) => P.rock(0.4 + r() * 0.5, '#8d8a80', i), 14, [-20, -12, 12, 14], 23, [[-9, 0, 9], [8, 0, 3]]);

  // the army: tanks, trucks and a block of soldiers facing +X
  const army = new THREE.Group(); scene.add(army);
  const tanks = [[-6, -3.2], [-6, 0], [-6, 3.2]].map(([x, z]) => { const v = P.tank('#59614a'); v.position.set(x, 0, z); v.rotation.y = Math.PI / 2; army.add(v); return v; });
  const trucks = [[-13, -2.2], [-13, 2.2]].map(([x, z]) => { const v = P.truck('#5a6350', '#6d7858'); v.position.set(x, 0, z); v.rotation.y = Math.PI / 2; army.add(v); return v; });
  const keys = ['mcqueen', 'daiwa', 'suzuka', 'helios'];
  const soldiers = [];
  for (let row = 0; row < 4; row++) for (let col = 0; col < 6; col++) {
    const c = cast(army, keys[(row + col) % 4], G.army, -9.6 + row * 0.85 * -1, -2.6 + col * 1.05 + (row % 2) * 0.2, Math.PI / 2);
    c.ph = (row * 6 + col) * 0.37; soldiers.push(c);
  }
  const flagA = P.flag('#4a5470', 2.8); flagA.position.set(-8, 0, -4.4); army.add(flagA);

  // the guerrillas
  const g = [cast(scene, 'oguri', G.guerrilla, 8.4, -0.6, -Math.PI / 2), cast(scene, 'tamamo', G.guerrilla, 8.9, 0.4, -Math.PI / 2 - 0.2), cast(scene, 'cafe', G.guerrilla, 9.3, -1.2, -Math.PI / 2 + 0.2)];
  const sweat = F.bubble('💦', { bg: null, font: 170 }); scene.add(sweat);
  const qs = [0, 1].map(() => { const b = F.bubble('?'); scene.add(b); return b; });

  const tAdv = L[2].t0 - 0.2, tFlee = L[3].t0 + 0.3;
  const sfx = [{ t: 0.3, type: 'march', dur: L[1].t0 - 0.3, vol: 0.7 }, { t: 0.4, type: 'engine', dur: 5, vol: 0.5 },
    { t: tAdv, type: 'march', dur: 6.5, vol: 0.8 }, { t: tAdv, type: 'engine', dur: 7, vol: 0.7 }, { t: L[1].t0 + 1.4, type: 'pop' }, { t: tFlee, type: 'whoosh' }];

  function update(t) {
    P.waveFlag(flagA, t);
    const adv = Math.max(0, t - tAdv) * 1.1;          // army advance distance
    army.position.x = Math.min(adv, 9.5);
    const marching = t < L[1].t0 || (t > tAdv && adv < 9.5);
    for (const v of [...tanks, ...trucks]) v.body.position.y = marching ? 0.012 * Math.sin(t * 30 + v.position.z) : 0;
    for (const c of soldiers) {
      const p = marching ? { ...C.walkArmed(t, 0.9, 0), gun: 'low' } : { ...C.idle(t, c.ph, 0.4), gun: 'low' };
      c.apply(p); c.setFace(C.blinkEye(t, c.ph), t > tAdv ? 'frown' : 'neutral');
    }
    // guerrillas: nervous, then they turn and run into the forest
    g.forEach((c, i) => {
      if (t < tFlee) {
        const scared = t > tAdv + 0.6;
        c.apply({ ...(scared ? C.crouch(t, c.seed, 0.25) : C.idle(t, c.seed)), gun: 'low' });
        c.setFace(scared ? 'shock' : C.blinkEye(t, c.seed), scared ? 'wavy' : (t > L[1].t0 ? 'small' : 'neutral'));
      } else {
        const d = Math.max(0, (t - tFlee - i * 0.15) * 3.4);
        const pos = along([[c.root.userData.x0 ??= c.root.position.x, c.root.userData.z0 ??= c.root.position.z], [13, (i - 1) * 1.2], [22, (i - 1) * 3]], d);
        c.root.position.set(pos.x, 0, pos.z); c.root.rotation.y = pos.yaw;
        c.apply({ ...C.runArmed(t, 1.15, i), gun: 'port' }); c.setFace('squint', 'grin');
      }
    });
    sweat.position.set(g[1].root.position.x + 0.3, 0, g[1].root.position.z + 0.2); F.popSprite(sweat, t, L[1].t0 + 1.4, tFlee, 0.38, 1.35);
    qs.forEach((b, i) => { const s = soldiers[2 + i * 12]; b.position.set(s.root.position.x + army.position.x, 0, s.root.position.z); F.popSprite(b, t, ctx.dur - 1.6 + i * 0.2, 99, 0.4, 1.55); });

    camPath(ctx.camera, [
      { t: 0, p: [-2, 5.5, 14], l: [-9, 0.6, 0], fov: 38 },
      { t: L[1].t0 - 0.4, p: [-1, 3.2, 9], l: [-8, 0.6, 0], fov: 38 },
      { t: L[1].t0 + 0.4, p: [5.2, 1.1, 2.6], l: [9, 0.6, -0.4], fov: 32 },
      { t: tAdv - 0.3, p: [5.6, 1.0, 2.2], l: [9, 0.6, -0.4], fov: 32 },
      { t: tAdv + 0.6, p: [1, 9, 22], l: [1, 0, 0], fov: 38 },
      { t: tFlee + 0.2, p: [3, 8, 20], l: [3, 0, 0], fov: 38 },
      { t: ctx.dur, p: [7, 6, 17], l: [8, 0.3, 0], fov: 38 },
    ], t, t > tAdv && t < tFlee ? 0.025 : 0);
    aimSun(scene, ctx.camera.position.x * 0.3 + 2, 0);

    let html = '';
    const k1 = ss(1.2, 1.6, t) * (1 - ss(L[1].t0 - 0.5, L[1].t0, t));
    html += stat(1300, 120, '10,000', 'soldiers', k1) + stat(1620, 120, '300', 'tanks', ss(1.8, 2.2, t) * (1 - ss(L[1].t0 - 0.5, L[1].t0, t)));
    const k2 = ss(L[1].t0 + 0.8, L[1].t0 + 1.2, t) * (1 - ss(tAdv - 0.3, tAdv, t));
    html += stat(160, 120, '30', 'fighters', k2, '#9be07a') + stat(420, 120, '0', 'tanks', k2, '#9be07a');
    const k3 = ss(tAdv + 0.8, tAdv + 1.2, t) * (1 - ss(tFlee + 1.5, tFlee + 2, t));
    html += label(ctx, [-6 + army.position.x, 2.4, 0], 'Army', 'a', k3) + label(ctx, [g[0].root.position.x, 1.7, 0], 'Guerrillas', 'g', k3);
    return html;
  }
  return { scene, update, sfx };
}
