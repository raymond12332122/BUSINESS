import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as P from '../../lib/props.js';
import * as F from '../../lib/fx.js';
import { stage, aimSun } from '../../lib/stage.js';
import { camPath, ss, clamp, along } from '../../lib/util.js';
import { cast, label } from '../../lib/kit.js';
import * as W from '../kit.js';

export function build(ctx) {
  const L = ctx.L;
  const scene = stage({ skyTop: '#2f4370', skyHor: '#e9a86e', groundA: '#7d8a4e', groundB: '#66733f', fog: ['#c99a76', 30, 160],
    sunPos: [-10, 6, -8], sunColor: '#ffc28a', sun: 2.4, hemi: 1.35, hemiSky: '#ffd2b0', hemiGround: '#4e5236', shadow: 16, seed: 201 });
  const env = new THREE.Group(); scene.add(env);
  for (const [x, z, h, r] of [[-70, -110, 26, 34], [0, -130, 34, 40], [70, -115, 28, 32]]) { const m = P.mountain(h, r, '#7a7790', false, x); m.position.set(x, 0, z); env.add(m); }
  P.scatter(env, (r, i) => (i % 2 ? P.pine(1.1 + r() * 0.6, '#34573a', i) : P.roundTree(1.2 + r() * 0.5, '#566f35', i)), 80, [-45, -40, 45, -9], 202);
  P.scatter(env, (r, i) => P.roundTree(1.2 + r() * 0.5, '#566f35', i), 30, [-45, 14, 45, 40], 203);
  const road = P.strip([[-60, 0], [60, 0]], 3.2, '#8d7c5e', 0.02); env.add(road);

  // German column rolling right
  const tanks = [0, 1, 2].map(i => { const t = W.tank('de'); t.rotation.y = Math.PI / 2; scene.add(t); return t; });
  const de = ['mcqueen', 'daiwa', 'suzuka', 'helios'].map((k, i) => W.soldier(cast(scene, k, null, 0, 0, Math.PI / 2), 'de', { gun: i > 0 }));
  const planes = [0, 1, 2].map(i => { const p = W.plane('#5d6464', { mark: 'de' }); scene.add(p); return p; });
  // the Allies watching from the ridge
  const al = [['oguri', 'su'], ['tamamo', 'uk'], ['cafe', 'us'], ['doto', 'fr']].map(([k, n], i) => W.soldier(cast(scene, k, null, 0, 0), n));
  const sfx = [{ t: 0.1, type: 'sting' }, { t: 0.3, type: 'engine', dur: ctx.dur - 0.3, vol: 0.7 }, { t: 1.2, type: 'plane', dur: 4.5, vol: 0.7 }, { t: L[1].t0 + 1.2, type: 'march', dur: 4, vol: 0.5 }, { t: L[2].t0, type: 'sting2' }];

  function update(t) {
    const x0 = -16 + t * 1.6;
    tanks.forEach((v, i) => { v.position.set(x0 - i * 4.6, 0, 0.2); v.body.position.y = 0.012 * Math.sin(t * 30 + i); v.turret.rotation.y = 0.15 * Math.sin(t * 0.4 + i); });
    de.forEach((c, i) => {
      c.root.position.set(x0 + 2.2 - i * 1.15 - (i ? 1.0 : 0), 0, 2.4 + (i % 2) * 0.5); c.root.rotation.y = Math.PI / 2;
      c.apply(i ? { ...C.walkArmed(t, 1.0, i * 0.5), gun: 'port' } : { ...C.walk(t, 1.0) }); c.setFace(C.blinkEye(t, c.seed), i ? 'neutral' : 'smile');
    });
    planes.forEach((p, i) => { const k = (t - 1.2 - i * 0.35) * 9; p.position.set(-40 + k, 7 + i * 0.6 + Math.sin(t + i) * 0.2, -4 + i * 2.5); p.rotation.set(0, Math.PI / 2, 0.05 * Math.sin(t * 2 + i)); p.prop.rotation.z = t * 60; p.visible = k > 0 && k < 90; });
    al.forEach((c, i) => {
      c.root.position.set(6.5 + i * 1.0, 0, -5.4 - (i % 2) * 0.4); c.root.rotation.y = -0.25 + i * 0.12;
      const p = t > L[1].t0 + 2.5 ? { ...C.idle(t, c.seed), gun: 'low' } : { ...C.idle(t, c.seed), gun: 'back' };
      if (t > L[1].t0 + 3.2) { p.armL = [-60, -50, -70]; p.armR = [-60, 50, 70]; p.elbL = [0, -110, 0]; p.elbR = [0, 110, 0]; p.gun = 'back'; }
      c.apply(p); c.setFace(t > L[1].t0 + 3.2 ? 'flat' : C.blinkEye(t, c.seed), t > L[1].t0 + 3.2 ? 'frown' : 'neutral');
    });
    camPath(ctx.camera, [
      { t: 0, p: [-2, 2.2, 12], l: [-6, 1.4, 0], fov: 38 },
      { t: L[1].t0, p: [3, 2.0, 10.5], l: [-1, 1.0, 0], fov: 38 },
      { t: L[1].t0 + 2.6, p: [8.0, 1.4, -1.2], l: [8.0, 0.8, -5.4], fov: 38 },
      { t: ctx.dur, p: [8.0, 1.3, -1.8], l: [8.0, 0.85, -5.4], fov: 36 },
    ], t);
    aimSun(scene, ctx.camera.position.x, 0);
    let html = '<div class="vign"></div>';
    const tk = ss(0.4, 1.2, t) * (1 - ss(L[1].t0 - 0.2, L[1].t0 + 0.4, t));
    if (tk > 0) html += `<div class="title" style="opacity:${tk};transform:translateY(${(1 - ss(0.4, 1.2, t)) * 30}px)">
      <div class="k">LA SEGUNDA GUERRA MUNDIAL CON CHIBIS</div><div class="h" style="font-size:150px">BLITZKRIEG</div>
      <div class="s">Cómo Alemania conquistó Europa… y por qué perdió la guerra</div></div>`;
    const k2 = ss(L[1].t0 + 3.4, L[1].t0 + 3.8, t);
    if (k2 > 0) { const lb = (c, s) => label(ctx, [c.root.position.x, 1.75, c.root.position.z], s, 'a', k2);
      html += lb(al[0], 'URSS') + lb(al[1], 'Reino Unido') + lb(al[2], 'EE. UU.') + lb(al[3], 'Francia'); }
    return html;
  }
  return { scene, update, sfx };
}
