import * as THREE from 'three';
import * as C from '../lib/chars.js';
import * as P from '../lib/props.js';
import * as G from '../lib/gear.js';
import * as F from '../lib/fx.js';
import { stage, aimSun } from '../lib/stage.js';
import { track, camPath, ss, clamp, along } from '../lib/util.js';

export function build(ctx) {
  const L = ctx.L;
  const scene = stage({ skyTop: '#4f7fcf', skyHor: '#f4d9b0', groundA: '#86b35a', groundB: '#6a9a45', fog: ['#e9d7b8', 30, 170],
    sunPos: [-6, 9, 8], sunColor: '#ffe2b8', sun: 2.8, hemi: 1.1, shadow: 10, seed: 4 });
  aimSun(scene, 0, 0);
  // backdrop
  const env = new THREE.Group(); scene.add(env);
  for (const [x, z, h, r] of [[-70, -120, 30, 32], [-20, -140, 44, 38], [35, -130, 36, 34], [85, -115, 28, 30]]) { const m = P.mountain(h, r, '#8a99a6', h > 40, x); m.position.set(x, 0, z); env.add(m); }
  P.scatter(env, (r, i) => (i % 3 ? P.pine(0.9 + r() * 0.6, '#2f6b3a', i) : P.roundTree(1 + r() * 0.5, '#4f8f3a', i)), 70, [-30, -26, 30, -7], 11);
  P.scatter(env, (r, i) => P.bush(0.8 + r() * 0.6, '#4a8a3a', i), 26, [-16, -7, 16, 6], 12, [[0, 0, 7]]);
  const flagG = P.flag('#3f7d2c', 2.4); flagG.position.set(-5.2, 0, -1.4); scene.add(flagG);
  const flagA = P.flag('#4a5470', 2.4); flagA.position.set(5.6, 0, -1.4); scene.add(flagA);

  // cast
  const mk = (k, kit, x, z = 0, yaw = 0) => { const c = C.spawn(k); kit && kit(c); c.root.position.set(x, 0, z); c.root.rotation.y = yaw; scene.add(c.root); return c; };
  const g = [mk('oguri', G.guerrilla, -3.3, 0.3, 0.25), mk('tamamo', G.guerrilla, -2.4, 0.6, 0.15), mk('cafe', G.guerrilla, -1.5, 0.2, 0.05)];
  const doto = mk('doto', null, 0.1, 0.9);
  const a = [mk('mcqueen', G.army, 1.6, 0.2, -0.05), mk('daiwa', G.army, 2.5, 0.5, -0.12), mk('suzuka', G.army, 3.4, 0.2, -0.2), mk('helios', G.army, 4.3, 0.5, -0.25)];
  const q1 = F.bubble('?'); scene.add(q1); const q2 = F.bubble('?'); scene.add(q2); const q3 = F.bubble('!'); scene.add(q3);
  const dust = new F.Dust(scene, 5, 24);

  const tRun = L[1].t1 - 2.4;   // "...vanish before it can hit back"
  const runPaths = [[[-3.3, 0.3], [-6.5, -2.5], [-11, -9]], [[-2.4, 0.6], [-6, -1.8], [-10, -10]], [[-1.5, 0.2], [-5.5, -3], [-9, -11]]];
  g.forEach((c, i) => [0, 0.25, 0.5].forEach(d => dust.puff(tRun + i * 0.12 + d, [c.root.position.x - d * 2.5, 0, c.root.position.z - d * 1.5])));

  const sfx = [{ t: 0.2, type: 'sting' }, { t: tRun, type: 'whoosh' }, { t: tRun + 1.0, type: 'pop' }];

  function update(t) {
    P.waveFlag(flagG, t); P.waveFlag(flagA, t + 1);
    // guerrillas: wave hello, then dash off into the treeline
    g.forEach((c, i) => {
      let p;
      if (t < tRun) {
        p = (t > 1.0 && t < 4.6 && i === 1) ? C.wave(t, c.seed) : { ...C.idle(t, c.seed), gun: 'low' };
        if (i === 0 && t > 4.6) p = { ...C.crouch(t, c.seed, ss(4.6, 5.4, t) * 0.5 + 0.0), gun: 'low' };
        c.setFace(C.blinkEye(t, c.seed), i === 1 && t < 4.6 ? 'grin' : 'neutral');
      } else {
        const d = (t - tRun - i * 0.12) * 3.4;
        const pos = along(runPaths[i], Math.max(0, d));
        c.root.position.set(pos.x, 0, pos.z); c.root.rotation.y = pos.yaw;
        p = d > 0 ? { ...C.runArmed(t, 1.1, i), gun: 'port' } : { ...C.crouch(t, c.seed, 0.4), gun: 'low' };
        c.setFace('squint', 'grin');
        c.root.visible = d < 13;
      }
      c.apply(p);
    });
    // villager
    { const p = t > L[2].t0 ? C.shrug(t, doto.seed) : C.wave(t, doto.seed, t < 4 ? 'L' : 'none');
      if (t > 4 && t <= L[2].t0) Object.assign(p, C.idle(t, doto.seed));
      doto.apply(p); doto.setFace(C.blinkEye(t, doto.seed, t > tRun + 0.5 ? 'open' : 'open'), t > L[2].t0 ? 'cat' : 'smile'); }
    // army: at attention, then confused
    a.forEach((c, i) => {
      const confused = t > tRun + 0.6;
      let p = confused ? { ...C.lookAround(t, c.seed + i), gun: 'low' } : { ...C.idle(t, c.seed, 0.5), gun: 'low' };
      if (!confused && t > 1.0 && t < 4.4 && i === 1) p = { ...C.wave(t, c.seed, 'L'), gun: 'low' };
      c.apply(p);
      c.setFace(confused ? (i % 2 ? 'shock' : 'open') : C.blinkEye(t, c.seed), confused ? (i % 2 ? 'small' : 'frown') : 'neutral');
    });
    const head = (c, dy = 1.5) => { const v = c.root.position; return [v.x, dy, v.z]; };
    q1.position.set(...head(a[0])); F.popSprite(q1, t, tRun + 1.0, 99, 0.42, 1.55);
    q2.position.set(...head(a[2])); F.popSprite(q2, t, tRun + 1.25, 99, 0.42, 1.55);
    q3.position.set(...head(a[3])); F.popSprite(q3, t, tRun + 1.5, 99, 0.42, 1.55);
    dust.update(t);

    camPath(ctx.camera, [
      { t: 0, p: [0.6, 3.4, 13.5], l: [0.4, 1.4, 0], fov: 34 },
      { t: L[1].t0, p: [0.4, 1.6, 9.6], l: [0.4, 0.7, 0], fov: 34 },
      { t: tRun + 0.3, p: [-0.2, 1.4, 8.6], l: [-0.6, 0.6, -1], fov: 36 },
      { t: L[2].t0, p: [2.6, 1.1, 5.6], l: [2.6, 0.75, 0], fov: 34 },
      { t: ctx.dur, p: [2.8, 1.0, 4.9], l: [2.8, 0.75, 0], fov: 33 },
    ], t);

    // overlay
    let html = '<div class="vign"></div>';
    const tk = ss(0.4, 1.2, t) * (1 - ss(L[1].t0 + 0.2, L[1].t0 + 0.8, t));
    if (tk > 0) html += `<div class="title" style="opacity:${tk};transform:translateY(${(1 - ss(0.4, 1.2, t)) * 30}px)">
      <div class="k">EXPLAINED WITH CHIBIS</div><div class="h">HOW GUERRILLA<br>WARFARE WORKS</div>
      <div class="s">From WWI to WWII to Ukraine</div></div>`;
    const lk = ss(L[1].t0 + 0.6, L[1].t0 + 1.1, t) * (1 - ss(tRun - 0.3, tRun, t));
    if (lk > 0) {
      const [gx, gy] = ctx.project([-2.4, 1.6, 0.4]), [ax, ay] = ctx.project([2.95, 1.6, 0.35]);
      html += `<div class="lbl g" style="left:${gx}px;top:${gy}px;opacity:${lk}">Guerrillas</div><div class="lbl a" style="left:${ax}px;top:${ay}px;opacity:${lk}">The Army</div>`;
    }
    return html;
  }
  return { scene, update, sfx };
}
