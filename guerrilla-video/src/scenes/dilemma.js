import * as THREE from 'three';
import * as C from '../lib/chars.js';
import * as P from '../lib/props.js';
import * as G from '../lib/gear.js';
import * as F from '../lib/fx.js';
import { stage, aimSun } from '../lib/stage.js';
import { camPath, ss, clamp, along, track, yawTo, lerp } from '../lib/util.js';
import { cast, badge, label, partTimes } from '../lib/kit.js';

export function build(ctx) {
  const L = ctx.L;
  const scene = stage({ skyTop: '#5d8ad0', skyHor: '#dbe6ee', groundA: '#9bbd68', groundB: '#85a957', fog: ['#dfe6e0', 50, 200], sunPos: [8, 16, 10], shadow: 18, seed: 101 });
  const env = new THREE.Group(); scene.add(env);
  // river + bridge
  const river = P.strip([[-30, -16], [-10, -6], [0, 0], [10, 6], [30, 18]], 2.6, '#5d9ac4', 0.025, { roughness: 0.25 }); env.add(river);
  const bridge = new THREE.Group(); bridge.add(P.at(P.box(3.6, 0.2, 1.6, '#8c7a62'), 0, 0.25, 0)); bridge.add(P.at(P.box(3.6, 0.25, 0.08, '#6b5a45'), 0, 0.45, 0.78)); bridge.add(P.at(P.box(3.6, 0.25, 0.08, '#6b5a45'), 0, 0.45, -0.78));
  bridge.rotation.y = -Math.atan2(6, 10) + Math.PI / 2 - Math.PI / 2; bridge.position.set(0, 0, 0); bridge.rotation.y = Math.atan2(10, 6) - Math.PI / 2 + Math.PI / 2; env.add(bridge);
  // roads between three towns
  const towns = [[-9, 5], [9, -5], [0, 12]];
  env.add(P.strip([[-9, 5], [-4, 2.5], [0, 0], [4, -2.5], [9, -5]], 1.4, '#b49c76', 0.02));
  env.add(P.strip([[-9, 5], [-4, 9], [0, 12]], 1.2, '#b49c76', 0.02));
  env.add(P.strip([[9, -5], [8, 4], [0, 12]], 1.2, '#b49c76', 0.02));
  towns.forEach(([x, z], ti) => { for (let i = 0; i < 4; i++) { const h = P.house(1.4, 1.3, 1.0, '#ece2cc', ['#a4553a', '#5a6d8a', '#7a5a3a'][ti]); h.position.set(x + (i % 2) * 2 - 1, 0, z + Math.floor(i / 2) * 2 - 1); h.rotation.y = i * 0.3; env.add(h); } });
  P.scatter(env, (r, i) => (i % 3 ? P.roundTree(1 + r() * 0.5, '#4f8f3a', i) : P.pine(1.1 + r() * 0.5, '#2e6838', i)), 110, [-28, -22, 28, 26], 102,
    [[-9, 5, 3.5], [9, -5, 3.5], [0, 12, 3.5], [0, 0, 3], [-4, 2.5, 2], [4, -2.5, 2], [-4, 9, 2], [8, 4, 2.5], [5.5, 7.5, 2], [-14, -2, 1.5], [-5.5, -9, 2], [13, 8, 2], [-13, 12, 2]]);
  // guard posts: roads, the bridge, towns
  const posts = [[-4, 2.5], [4, -2.5], [-4, 9], [8, 4], [0.9, -0.6], [-8.3, 6.6], [9.8, -3.6], [1.2, 10.5]];
  const kind = ['road', 'road', 'road', 'road', 'bridge', 'town', 'town', 'town'];
  const keys = ['mcqueen', 'daiwa', 'suzuka', 'helios'];
  const fort = [1.5, 1.8];
  const guards = posts.map(([x, z], i) => { const c = cast(scene, keys[i % 4], G.army, x, z, yawTo([x, z], [0, 0]) + Math.PI); c.post = [x, z]; c.ring = F.ring('#e0402e', 1.15); c.ring.position.set(x, 0.03, z); scene.add(c.ring); return c; });
  const gang = [cast(scene, 'oguri', G.guerrilla, -6, -3), cast(scene, 'tamamo', G.guerrilla, -6.6, -2.4), cast(scene, 'cafe', G.guerrilla, -5.6, -2.2)];
  const parts = ['It has to guard every road,', 'every bridge', 'and every town.', 'The guerrillas only have to hit one of them.'];
  const pt = partTimes(L[1], parts);
  const tHit = pt[3] + 1.6, tBunch = L[2].t0 + (L[2].t1 - L[2].t0) * 0.48;
  const ex = new F.Explosion(scene, [0.9, 0.3, -0.6], tHit, 1.1, 111, { fire: 0.5 });
  const flags = [[-14, -2], [-5.5, -9], [13, 8], [-13, 12], [6, -12], [16, -4], [-18, 6], [4, 17], [-8, 17], [18, 12]].map(([x, z], i) => { const f = P.flag('#3f7d2c', 1.6); f.position.set(x, 0, z); f.scale.setScalar(0.001); scene.add(f); const gl = F.glow('#5fd35f', 2.6); gl.position.set(x, 0.03, z); gl.material.opacity = 0; scene.add(gl); f.gl = gl; return f; });
  const sfx = [{ t: pt[0], type: 'pop' }, { t: pt[1], type: 'pop' }, { t: pt[2], type: 'pop' }, { t: tHit - 0.6, type: 'shot' }, { t: tHit, type: 'boom' }, { t: tBunch, type: 'march', dur: 2.2, vol: 0.6 }, ...flags.map((f, i) => ({ t: tBunch + 1.4 + i * 0.12, type: 'tick', vol: 0.5 }))];

  function update(t) {
    const bunch = ss(tBunch, tBunch + 2.0, t);
    guards.forEach((c, i) => {
      const [x0, z0] = c.post, ang = i / guards.length * Math.PI * 2;
      const fx = fort[0] + Math.cos(ang) * 1.1, fz = fort[1] + Math.sin(ang) * 1.1;
      const x = lerp(x0, fx, bunch), z = lerp(z0, fz, bunch); c.root.position.set(x, 0, z);
      const hit = i === 4 && t > tHit;
      const moving = t > tBunch && t < tBunch + 2.0;
      c.root.rotation.y = moving ? yawTo([x0, z0], [fx, fz]) : (bunch > 0.5 ? yawTo([fx, fz], fort) + Math.PI : yawTo([x0, z0], [0, 0]) + Math.PI);
      const p = hit ? C.knocked(t - tHit, i) : moving ? { ...C.walkArmed(t, 1.1, i), gun: 'low' } : { ...C.idle(t, c.seed + i), gun: 'low' };
      if (!hit && t > pt[3] && t < tBunch) p.head = [0, 30 * Math.sin(t * 1.6 + i), 0];
      c.apply(p); c.setFace(hit ? 'dizzy' : (t > pt[3] ? 'shock' : C.blinkEye(t, c.seed + i)), hit ? 'wavy' : 'neutral');
      c.root.visible = !(hit && bunch > 0.2);
      const kk = kind[i], on = (kk === 'road' && t > pt[0]) || (kk === 'bridge' && t > pt[1]) || (kk === 'town' && t > pt[2]);
      const start = kk === 'road' ? pt[0] : kk === 'bridge' ? pt[1] : pt[2];
      c.ring.position.set(x, 0.03, z);
      c.ring.scale.setScalar(on ? 1 + 0.25 * Math.max(0, Math.sin((t - start) * 6)) * Math.exp(-(t - start)) * 4 : 0.001);
      c.ring.material.opacity = on ? 0.85 * (1 - bunch * 0.6) : 0;
      if (hit && bunch > 0.2) c.ring.material.opacity = 0;
    });
    ex.update(t);
    // guerrillas strike the bridge post, then melt away
    gang.forEach((c, i) => {
      const a = [[-6, -3], [-6.6, -2.4], [-5.6, -2.2]][i];
      if (t < tHit - 1.6) { c.root.visible = t > pt[3] - 0.4; const d = Math.max(0, (t - pt[3] + 0.4) * 2.4); const pos = along([[a[0] - 4, a[1] - 3], a], d); c.root.position.set(pos.x, 0, pos.z); c.root.rotation.y = pos.yaw; c.apply({ ...C.runArmed(t, 1, i), gun: 'port' }); }
      else if (t < tHit + 0.5) { c.root.position.set(a[0], 0, a[1]); c.root.rotation.y = yawTo(a, [0.9, -0.6]); c.apply({ ...C.aim(t, (t > tHit - 0.8 && t < tHit) ? Math.abs(Math.sin(t * 20)) : 0, i === 1 ? 1 : 0), gun: 'aim' }); }
      else { const d = (t - tHit - 0.5) * 3, pos = along([a, [a[0] - 5, a[1] - 4]], d); c.root.position.set(pos.x, 0, pos.z); c.root.rotation.y = pos.yaw; c.apply({ ...C.runArmed(t, 1, i), gun: 'port' }); c.root.visible = d < 6; }
      c.setFace('squint', 'grin');
    });
    flags.forEach((f, i) => { const k = ss(tBunch + 1.4 + i * 0.12, tBunch + 1.7 + i * 0.12, t); f.scale.setScalar(Math.max(0.001, k)); f.gl.material.opacity = 0.5 * k; P.waveFlag(f, t + i); });

    camPath(ctx.camera, [
      { t: 0, p: [0, 26, 22], l: [0, 0, 2], fov: 42 },
      { t: pt[3], p: [-3, 22, 20], l: [0, 0, 2], fov: 42 },
      { t: pt[3] + 0.8, p: [-4, 7, 7], l: [-1, 0.4, -1], fov: 42 },
      { t: tHit + 1.6, p: [-4.5, 7.5, 7.5], l: [-1, 0.4, -1], fov: 42 },
      { t: L[2].t0 + 0.2, p: [0, 28, 20], l: [0, 0, 2.5], fov: 46 },
      { t: ctx.dur, p: [3, 30, 21], l: [1, 0, 2.5], fov: 46 },
    ], t);
    aimSun(scene, 0, 2);

    let html = badge(t, 'The occupier’s problem', 'Too much to guard', '', 0.6, L[1].t0 + 0.2);
    const ks = ss(L[2].t0 + 0.2, L[2].t0 + 0.6, t);
    if (ks > 0) {
      const a = 1 - ss(tBunch - 0.2, tBunch + 0.2, t), b = ss(tBunch + 0.4, tBunch + 0.8, t);
      html += `<div class="badge" style="opacity:${ks};left:72px;right:auto;top:72px;border-left-color:${b > 0.5 ? '#3f9d2c' : '#d24a3a'}">
        <div class="e" style="color:${b > 0.5 ? '#7fdc5f' : '#ff7a6a'}">${b > 0.5 ? 'Bunched up' : 'Spread out'}</div>
        <div class="t">${b > 0.5 ? 'Countryside lost' : 'Weak everywhere'}</div></div>`;
    }
    return html;
  }
  return { scene, update, sfx };
}
