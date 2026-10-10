import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as P from '../../lib/props.js';
import * as F from '../../lib/fx.js';
import { stage, aimSun, mood } from '../../lib/stage.js';
import { camPath, ss, clamp, lerp } from '../../lib/util.js';
import { cast, badge, partTimes } from '../../lib/kit.js';
import * as W from '../kit.js';

export function build(ctx) {
  const L = ctx.L;
  const scene = stage({ skyTop: '#5c6a85', skyHor: '#c9c0b0', groundA: '#9a9182', groundB: '#857d70', fog: ['#b5ad9f', 20, 110], sunPos: [-8, 12, 9], sun: 2.0, hemi: 1.2, shadow: 22, seed: 321 });
  // a domed parliament building in ruins + rubble streets
  const hall = new THREE.Group(); hall.position.set(0, 0, -14); scene.add(hall);
  hall.add(P.at(P.box(14, 4, 6, '#b3a993'), 0, 2, 0));
  for (let i = 0; i < 6; i++) hall.add(P.at(P.cyl(0.25, 0.25, 3.4, '#c4bba6', 8), -3.2 + i * 1.3, 1.7, 3.2));
  hall.add(P.at(P.box(7, 0.5, 1.2, '#b3a993'), 0, 3.75, 3.4));
  const dome = new THREE.Mesh(new THREE.SphereGeometry(2.4, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#4e4a44', wireframe: true }));
  dome.position.set(0, 4, 0); hall.add(dome);
  for (const x of [-6.2, 6.2]) hall.add(P.at(P.box(1.6, 5.2, 1.6, '#a79d88'), x, 2.6, 2.4));
  for (let i = 0; i < 18; i++) { const r = P.rng(i + 50)(); const b = W.ruin(500 + i, 2 + r, 2 + r * 2.5); b.position.set((i % 2 ? 1 : -1) * (6 + (i % 3) * 3.4), 0, -6 + Math.floor(i / 2) * 3.2); b.rotation.y = r * 2; scene.add(b); }
  const fires = [[-7, 0.3, -4], [8, 0.3, 2], [-3, 4.4, -12]].map((p, i) => new F.Explosion(scene, p, -5, 0.8, 330 + i, { fire: 1, smokeColor: '#3a3836' }));
  const redFlag = P.flag('#c0302a', 2.2); redFlag.position.set(0, 4.2, -14); scene.add(redFlag);
  const white = P.flag('#ffffff', 2.0); white.position.set(-1.6, 0, -2.6); scene.add(white);
  const de = ['mcqueen', 'daiwa', 'suzuka', 'helios'].map((k, i) => W.soldier(cast(scene, k, null, -2.4 + i * 1.3, -3.2 + (i % 2) * 0.4, 0.1), 'de', { gun: false }));
  const guns = [0, 1, 2].map(i => { const r = P.rifle('#2e3138', '#5a4632'); r.position.set(-1.8 + i * 0.5, 0.05, -1.6); r.rotation.set(0, 0.6 * i, Math.PI / 2); scene.add(r); return r; });
  const sov = []; for (let i = 0; i < 6; i++) sov.push(W.soldier(cast(scene, i % 2 ? 'oguri' : 'tamamo', null), 'su'));
  const t34 = W.tank('su'); scene.add(t34);
  const winners = [['tamamo', 'uk'], ['cafe', 'us'], ['oguri', 'su'], ['doto', 'fr']].map(([k, n], i) => W.soldier(cast(scene, k, null, -2.4 + i * 1.6, 2.6, 0), n, { gun: false }));
  const confetti = (() => { const n = 300, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), r = P.rng(9), base = [];
    const pal = ['#e94c3d', '#f2c94c', '#4d7fc4', '#ffffff', '#3f9d5a'].map(c => new THREE.Color(c));
    for (let i = 0; i < n; i++) { base.push([-6 + r() * 12, r() * 6, -1 + r() * 7, r()]); const c = pal[i % 5]; col.set([c.r, c.g, c.b], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const p = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.09, vertexColors: true })); scene.add(p);
    p.update = t => { for (let i = 0; i < n; i++) { const [x, y, z, ph] = base[i]; pos[i * 3] = x + Math.sin(t * 2 + ph * 9) * 0.3; pos[i * 3 + 1] = ((y - t * (0.8 + ph)) % 6 + 6) % 6; pos[i * 3 + 2] = z; } g.attributes.position.needsUpdate = true; };
    return p; })();
  const pb = partTimes(L[0], ['En abril de mil novecientos cuarenta y cinco, las tropas soviéticas entraron en Berlín.', 'Hitler se suicidó,', 'y el ocho de mayo Alemania se rindió sin condiciones.']);
  const tEnter = 0.6, tSurr = pb[2], tEnd = L[1].t0 - 0.3;
  const sfx = [{ t: 0.3, type: 'engine', dur: 6, vol: 0.6 }, { t: 0.8, type: 'march', dur: 5, vol: 0.5 }, { t: tSurr, type: 'sting2' }, { t: tEnd, type: 'cheer' }, { t: tEnd + 0.4, type: 'bells', dur: ctx.dur - tEnd }];

  function update(t) {
    const peace = ss(tEnd - 0.4, tEnd + 1.0, t);
    mood(scene, { sun: lerp(2.0, 2.8, peace), skyHor: peace > 0.5 ? '#e9e0cc' : '#c9c0b0', skyTop: peace > 0.5 ? '#5e8bd0' : '#5c6a85', fog: [peace > 0.5 ? '#e0d8c6' : '#b5ad9f', 20, 110] });
    fires.forEach(f => f.update(t)); fires.forEach(f => { f.g.scale.setScalar(1 - peace * 0.9); });
    P.waveFlag(redFlag, t); redFlag.visible = t > tSurr + 0.6; P.waveFlag(white, t + 1); white.visible = t > tSurr;
    guns.forEach(g => { g.visible = t > tSurr; });
    de.forEach((c, i) => { const surr = t > tSurr; const pz = surr ? C.tired(t, i) : C.lookAround(t, i); if (surr) pz.head = [2, 0, 6 * Math.sin(t + i)]; c.apply(pz); c.setFace(surr ? 'flat' : 'shock', surr ? 'frown' : 'small'); c.root.visible = t < tEnd; });
    sov.forEach((c, i) => { const d = Math.min(1, (t - tEnter) / 4); c.root.position.set(-5 + i * 2, 0, lerp(16, 3.4 + (i % 2) * 0.6, d)); c.root.rotation.y = Math.PI;
      c.apply(d < 1 ? { ...C.runArmed(t, 1, i), gun: 'port' } : { ...C.idle(t, c.seed), gun: 'low' }); c.setFace(t > tSurr ? 'happy' : 'squint', t > tSurr ? 'smile' : 'neutral'); c.root.visible = t < tEnd; });
    t34.position.set(6, 0, lerp(20, 5, Math.min(1, (t - tEnter) / 4.5))); t34.rotation.y = Math.PI; t34.visible = t < tEnd;
    winners.forEach((c, i) => { c.root.visible = t >= tEnd; c.apply(C.cheer(t + i * 0.2, i)); c.setFace(i % 2 ? 'happy' : 'sparkle', 'teeth'); });
    confetti.visible = t > tEnd; confetti.update(t);
    camPath(ctx.camera, [
      { t: 0, p: [3, 2.4, 14], l: [0, 2, -6], fov: 44 },
      { t: tSurr - 0.2, p: [2, 2.0, 7], l: [-0.6, 1.0, -3], fov: 42 },
      { t: tSurr + 0.6, p: [1.2, 1.05, 2.4], l: [-0.6, 0.8, -3], fov: 42 },
      { t: tEnd - 0.05, p: [1.1, 1.05, 2.1], l: [-0.6, 0.85, -3], fov: 42 },
      { t: tEnd, p: [0, 1.5, 9.5], l: [0, 1.4, 1], fov: 42 },
      { t: ctx.dur, p: [0, 1.6, 9], l: [0, 1.5, 1], fov: 40 },
    ], t);
    aimSun(scene, 0, -2);
    let html = badge(t, 'Abril de 1945', 'La batalla de Berlín', '', 0.8, tSurr - 0.2);
    html += badge(t, '8 de mayo de 1945', 'Alemania se rinde', 'Rendición incondicional', tSurr + 0.3, tEnd);
    html += badge(t, 'Día de la Victoria en Europa', 'Fin de la guerra en Europa', 'En Asia, la guerra siguió hasta septiembre de 1945', tEnd + 0.4, ctx.dur);
    return html;
  }
  return { scene, update, sfx };
}
