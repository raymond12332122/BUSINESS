import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as P from '../../lib/props.js';
import { stage, aimSun } from '../../lib/stage.js';
import { camPath, ss } from '../../lib/util.js';
import { cast, partTimes } from '../../lib/kit.js';

export function build(ctx) {
  const L = ctx.L;
  const scene = stage({ skyTop: '#3c5f9e', skyHor: '#f2b98a', groundA: '#8aa85a', groundB: '#6f9046', fog: ['#e9b892', 30, 160],
    sunPos: [-10, 5, -6], sunColor: '#ffbf8a', sun: 2.4, hemi: 1.1, hemiSky: '#ffd9b8', hemiGround: '#5a5a3f', shadow: 10, seed: 351 });
  for (const [x, z, h, r] of [[-60, -90, 26, 30], [-5, -110, 36, 36], [55, -95, 28, 30]]) { const m = P.mountain(h, r, '#7b7f9a', h > 30, x); m.position.set(x, 0, z); scene.add(m); }
  P.scatter(scene, (r, i) => (i % 3 ? P.pine(1.2 + r() * 0.6, '#2e5a3a', i) : P.roundTree(1.2 + r() * 0.5, '#4a7a36', i)), 90, [-40, -40, 40, -6], 352);
  const order = ['oguri', 'tamamo', 'cafe', 'doto', 'mcqueen', 'daiwa', 'suzuka', 'helios'];
  const all = order.map((k, i) => cast(scene, k, null, (i - 3.5) * 0.95, 0.3 * Math.abs(i - 3.5) - 0.6, -(i - 3.5) * 0.06));
  const items = ['Victorias rápidas, guerra larga', '🛢️ Poco petróleo', '👥 Menos soldados', '🏭 Menos fábricas', '⚔️ Varios frentes a la vez'];
  const p1 = partTimes(L[1], ['Le faltaban petróleo,', 'soldados', 'y fábricas,', 'y peleaba contra enemigos mucho más grandes,', 'en varios frentes a la vez.']);
  const times = [L[0].t0 + 3.5, p1[0], p1[1], p1[2], p1[4]];
  const sfx = [...times.map(t => ({ t, type: 'pop' })), { t: L[2].t0 - 0.1, type: 'sting' }];

  function update(t) {
    all.forEach((c, i) => {
      const end = t > L[2].t1 + 0.3;
      c.apply(end ? C.wave(t, c.seed, i % 2 ? 'L' : 'R') : C.idle(t, c.seed));
      c.setFace(end ? (i % 3 === 0 ? 'happy' : 'open') : C.blinkEye(t, c.seed), end ? 'smile' : 'neutral');
    });
    camPath(ctx.camera, [
      { t: 0, p: [0.8, 1.7, 10.6], l: [-2.0, 0.6, 0], fov: 38 },
      { t: L[2].t0 - 0.6, p: [0.4, 1.65, 10.2], l: [-2.1, 0.65, 0], fov: 38 },
      { t: L[2].t0 + 0.4, p: [0.3, 1.5, 8.2], l: [0.2, 0.75, 0], fov: 38 },
      { t: ctx.dur, p: [0.3, 1.5, 7.6], l: [0.3, 0.75, 0], fov: 37 },
    ], t);
    aimSun(scene, 0, 0);
    let html = '<div class="vign"></div>';
    const kl = ss(0.4, 0.8, t) * (1 - ss(L[2].t0 - 0.6, L[2].t0 - 0.2, t));
    if (kl > 0) html += `<div class="title" style="top:70px;opacity:${kl}"><div class="k">¿POR QUÉ PERDIÓ ALEMANIA?</div></div>
      <div class="list" style="opacity:${kl}">${items.map((n, i) => `<div class="i" style="font-size:46px;opacity:${0.12 + 0.88 * ss(times[i] - 0.1, times[i] + 0.2, t)};transform:translateX(${(1 - ss(times[i] - 0.1, times[i] + 0.25, t)) * -30}px)"><div class="n">${i + 1}</div>${n}</div>`).join('')}</div>`;
    const ke = ss(L[2].t0 - 0.2, L[2].t0 + 0.3, t);
    if (ke > 0) html += `<div class="title" style="top:90px;opacity:${ke};transform:scale(${0.94 + 0.06 * ke})"><div class="k">LA LECCIÓN DE LA BLITZKRIEG</div>
      <div class="h" style="font-size:96px">VELOCIDAD SIN RECURSOS<br>NO BASTA</div><div class="s" style="opacity:${ss(L[2].t1 + 0.4, L[2].t1 + 1.0, t)}">¡Gracias por ver!</div></div>`;
    return html;
  }
  return { scene, update, sfx };
}
