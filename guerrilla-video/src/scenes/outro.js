import * as THREE from 'three';
import * as C from '../lib/chars.js';
import * as P from '../lib/props.js';
import * as G from '../lib/gear.js';
import * as F from '../lib/fx.js';
import { stage, aimSun } from '../lib/stage.js';
import { camPath, ss, clamp } from '../lib/util.js';
import { cast, partTimes } from '../lib/kit.js';

export function build(ctx) {
  const L = ctx.L;
  const scene = stage({ skyTop: '#3c5f9e', skyHor: '#f2b98a', groundA: '#8aa85a', groundB: '#6f9046', fog: ['#e9b892', 30, 160],
    sunPos: [-10, 5, -6], sunColor: '#ffbf8a', sun: 2.4, hemi: 1.05, hemiSky: '#ffd9b8', hemiGround: '#5a5a3f', shadow: 10, seed: 141 });
  const env = new THREE.Group(); scene.add(env);
  for (const [x, z, h, r] of [[-60, -90, 26, 30], [-5, -110, 36, 36], [55, -95, 28, 30]]) { const m = P.mountain(h, r, '#7b7f9a', h > 30, x); m.position.set(x, 0, z); env.add(m); }
  P.scatter(env, (r, i) => (i % 3 ? P.pine(1.2 + r() * 0.6, '#2e5a3a', i) : P.roundTree(1.2 + r() * 0.5, '#4a7a36', i)), 90, [-40, -40, 40, -6], 142);
  P.scatter(env, (r, i) => P.bush(0.8 + r() * 0.5, '#4a7a36', i), 20, [-14, -6, 14, 4], 143, [[0, 0, 6]]);
  const order = ['oguri', 'tamamo', 'cafe', 'doto', 'mcqueen', 'daiwa', 'suzuka', 'helios'];
  const all = order.map((k, i) => { const c = cast(scene, k, null, (i - 3.5) * 0.95, 0.3 * Math.abs(i - 3.5) - 0.6, -(i - 3.5) * 0.06); return c; });
  const parts = ['Hit and run.', 'Use the terrain.', 'Win over the people.', 'Cut the supply lines.', 'And outlast the enemy.'];
  const pt = partTimes(L[0], parts);
  const sfx = [...pt.map(t => ({ t, type: 'pop' })), { t: L[1].t0 - 0.1, type: 'sting' }];

  function update(t) {
    all.forEach((c, i) => {
      let p;
      if (t < L[1].t0 - 0.3) p = (i + Math.floor(t)) % 3 === 0 ? C.wave(t, c.seed, i % 2 ? 'L' : 'R') : C.idle(t, c.seed);
      else p = C.cheer(t + i * 0.13, i);
      c.apply(p);
      c.setFace(t > L[1].t0 - 0.3 ? (i % 3 === 0 ? 'sparkle' : 'happy') : C.blinkEye(t, c.seed), t > L[1].t0 - 0.3 ? 'teeth' : 'smile');
    });
    camPath(ctx.camera, [
      { t: 0, p: [0.8, 1.7, 10.6], l: [-2.0, 0.6, 0], fov: 38 },
      { t: L[1].t0 - 0.6, p: [0.4, 1.65, 10.2], l: [-2.1, 0.65, 0], fov: 38 },
      { t: L[1].t0 + 0.4, p: [0.3, 1.5, 8.2], l: [0.2, 0.75, 0], fov: 38 },
      { t: ctx.dur, p: [0.6, 1.5, 7.6], l: [0.4, 0.75, 0], fov: 36 },
    ], t);
    aimSun(scene, 0, 0);
    let html = '<div class="vign"></div>';
    const kl = ss(0.4, 0.8, t) * (1 - ss(L[1].t0 - 0.6, L[1].t0 - 0.2, t));
    if (kl > 0) html += `<div class="list" style="opacity:${kl}">${parts.map((n, i) => `<div class="i" style="opacity:${0.15 + 0.85 * ss(pt[i] - 0.1, pt[i] + 0.2, t)};transform:translateX(${(1 - ss(pt[i] - 0.1, pt[i] + 0.25, t)) * -30}px)"><div class="n">${i + 1}</div>${n.replace('And o', 'O').replace('.', '')}</div>`).join('')}</div>`;
    const ke = ss(L[1].t0 - 0.2, L[1].t0 + 0.3, t);
    if (ke > 0) html += `<div class="title" style="top:90px;opacity:${ke};transform:scale(${0.94 + 0.06 * ke})"><div class="k">THAT'S</div><div class="h" style="font-size:118px">GUERRILLA WARFARE</div><div class="s" style="opacity:${ss(L[1].t1 + 0.6, L[1].t1 + 1.2, t)}">Thanks for watching!</div></div>`;
    return html;
  }
  return { scene, update, sfx };
}
