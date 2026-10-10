import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as P from '../../lib/props.js';
import * as F from '../../lib/fx.js';
import { stage, aimSun } from '../../lib/stage.js';
import { camPath, ss, clamp, along, lerp } from '../../lib/util.js';
import { cast, badge, label, stat, partTimes } from '../../lib/kit.js';
import * as W from '../kit.js';

export function build(ctx) {
  const L = ctx.L;
  const scene = stage({ skyTop: '#5f86c2', skyHor: '#e2e3dd', groundA: '#8fa35d', groundB: '#7c904f', fog: ['#dfe0da', 40, 170], sunPos: [-8, 14, 10], shadow: 22, seed: 271 });
  P.scatter(scene, (r, i) => P.roundTree(1.1 + r() * 0.5, '#5a8a3a', i), 60, [-50, -45, 50, -16], 272);
  // two factories with runways: Germany (left) and the USA (right)
  const fDE = W.factory('#8d8a80', '#4f5358'); fDE.position.set(-9, 0, -8); scene.add(fDE);
  const fUS = W.factory('#a0583f', '#5a5e64'); fUS.position.set(9, 0, -8); fUS.scale.set(1.25, 1.15, 1.15); scene.add(fUS);
  for (const x of [-9, 9]) scene.add(P.strip([[x + 1.6, -6], [x + 1.6, 30]], 1.8, '#7d7a72', 0.02));
  const smoke = [...fDE.chimneys.map(c => [-9 + c[0], c[1], -8 + c[2]]), ...fUS.chimneys.map(c => [9 + c[0] * 1.25, c[1] * 1.15, -8 + c[2] * 1.15])].map((p, i) => {
    return [...Array(6)].map((_, j) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: '#8b8784', transparent: true, depthWrite: false })); m.userData = { p, ph: j / 6 }; scene.add(m); return m; });
  }).flat();
  const planesDE = [...Array(4)].map(() => { const p = W.plane('#62686a', { mark: 'de' }); p.scale.setScalar(0.8); scene.add(p); return p; });
  const planesUS = [...Array(14)].map(() => { const p = W.plane('#6b6f4a'); p.scale.setScalar(0.8); scene.add(p); return p; });
  // characters
  const cafe = W.soldier(cast(scene, 'cafe', null, 6.2, -2.6, -0.4), 'us');
  const tama = W.soldier(cast(scene, 'tamamo', null, 4.6, -2.0, -0.3), 'uk');
  const ogu = W.soldier(cast(scene, 'oguri', null, 7.8, -2.0, -0.5), 'su');
  const mcq = W.soldier(cast(scene, 'mcqueen', null, -5.5, -2.0, 0.4), 'de', { gun: false });
  const flags = [['#2f4f9f', 4.6], ['#c0302a', 7.8], ['#3a6fb0', 6.2]].map(([c, x]) => { const f = P.flag(c, 2.4); f.position.set(x - 0.5, 0, -3.2); scene.add(f); return f; });
  const anger = F.bubble('💢', { font: 130 }); scene.add(anger);
  const sweat = F.bubble('💦', { bg: null, font: 170 }); scene.add(sweat);
  const tProd = L[2].t0 + 2.0;
  const sfx = [{ t: 0.5, type: 'sting' }, { t: 2.2, type: 'boom', vol: 0.4 }, { t: L[1].t0 + 0.3, type: 'pop' }, { t: L[1].t0 + 1.1, type: 'pop' }, { t: L[1].t0 + 1.9, type: 'pop' },
    { t: tProd, type: 'factory', dur: ctx.dur - tProd, vol: 0.6 }, { t: tProd + 1, type: 'plane', dur: ctx.dur - tProd - 1, vol: 0.5 }];

  function update(t) {
    // allies step forward one by one on L1
    const allies = [tama, ogu, cafe];
    allies.forEach((c, i) => {
      const on = i === 2 || t > L[1].t0 + 0.3 + i * 0.8;
      c.root.visible = on;
      const mad = i === 2 && t > 1.6 && t < L[1].t0;
      c.apply({ ...(mad ? C.point(t, 2, 20) : t > L[1].t0 + 3 && t < L[2].t0 ? C.cheer(t, i) : C.idle(t, c.seed)), gun: mad || t > L[1].t0 + 3 ? 'none' : 'low' });
      c.setFace(mad ? 'squint' : C.blinkEye(t, c.seed), mad ? 'shout' : t > L[1].t0 + 3 ? 'teeth' : 'neutral');
    });
    flags.forEach((f, i) => { f.visible = allies[i].root.visible; P.waveFlag(f, t + i); });
    const pa = cafe.root.position; anger.position.set(pa.x, 0, pa.z); F.popSprite(anger, t, 1.8, L[1].t0, 0.45, 1.6);
    mcq.apply(t > L[1].t0 + 2 ? C.tired(t, 1) : C.idle(t, 1)); mcq.setFace(t > L[1].t0 + 2 ? 'shock' : C.blinkEye(t, 1), t > L[1].t0 + 2 ? 'wavy' : 'neutral');
    sweat.position.set(mcq.root.position.x + 0.3, 0, mcq.root.position.z); F.popSprite(sweat, t, L[1].t0 + 2.4, ctx.dur, 0.36, 1.35);
    // production: planes roll out and take off; the US line is ~2.5x faster
    const fly = (p, x, k) => { // k: 0..1 along taxi + takeoff
      const z = lerp(-5.5, 34, k), y = k < 0.35 ? 0.35 : 0.35 + (k - 0.35) * 18;
      p.position.set(x + 1.6, y, z); p.rotation.set(-(k > 0.35 ? 0.25 : 0), 0, 0); p.prop.rotation.z = t * 60; p.visible = k > 0 && k < 1;
    };
    planesDE.forEach((p, i) => fly(p, -9, t < tProd ? -1 : (((t - tProd) / 6.5 + i / 4) % 1) * (t - tProd > i * 1.6 ? 1 : -1)));
    planesUS.forEach((p, i) => fly(p, 9, t < tProd ? -1 : (((t - tProd) / 6.5 + i / 14) % 1) * (t - tProd > i * 0.46 ? 1 : -1)));
    smoke.forEach(m => { const { p, ph } = m.userData; const k = (t * 0.25 + ph) % 1; m.position.set(p[0] + k * 1.5, p[1] + k * 3, p[2]); m.scale.setScalar(0.3 + k * 0.8); m.material.opacity = 0.5 * Math.sin(k * Math.PI); });

    camPath(ctx.camera, [
      { t: 0, p: [6.5, 1.5, 3.2], l: [6.2, 0.9, -2.6], fov: 38 },
      { t: L[1].t0 - 0.2, p: [6.2, 1.6, 3.6], l: [6.2, 0.9, -2.6], fov: 38 },
      { t: L[1].t0 + 0.2, p: [0.6, 2.0, 6.2], l: [0.6, 0.9, -2.4], fov: 50 },
      { t: L[2].t0 + 1.0, p: [0.6, 2.1, 6.6], l: [0.6, 0.9, -2.4], fov: 50 },
      { t: tProd, p: [0, 7, 22], l: [0, 2.5, -2], fov: 46 },
      { t: ctx.dur, p: [0, 8, 24], l: [0, 3, -2], fov: 48 },
    ], t);
    aimSun(scene, 0, -2);

    let html = badge(t, '7 de diciembre de 1941', 'Pearl Harbor', 'Cuatro días después, Alemania declara la guerra a EE. UU.', 1.4, L[1].t0);
    const k1 = ss(L[1].t0 + 2.4, L[1].t0 + 2.8, t) * (1 - ss(tProd - 0.4, tProd, t));
    html += label(ctx, [-5.5, 1.7, -2], 'Alemania', 'a', k1) + label(ctx, [6.2, 2.9, -2.4], 'Imperio británico · URSS · EE. UU.', 'n', k1);
    const kp = ss(tProd, tProd + 0.4, t), prog = clamp((t - tProd) / (L[2].t1 - tProd + 0.5));
    if (kp > 0) {
      const fmt = n => Math.round(n).toLocaleString('es-MX');
      html += stat(330, 90, fmt(120000 * prog), 'aviones · Alemania', kp, '#c9ccd2');
      html += stat(1250, 90, fmt(300000 * prog), 'aviones · EE. UU.', kp, '#9be07a');
      html += `<div class="stat" style="left:760px;top:260px;opacity:${kp * 0.9};font:700 22px Inter;padding:10px 18px">Total 1939–1945 (aprox.)</div>`;
    }
    return html;
  }
  return { scene, update, sfx };
}
