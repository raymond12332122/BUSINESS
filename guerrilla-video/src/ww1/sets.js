// Sets for the First World War video (1914-1919, plus 1939 for the outro). Each builder returns a THREE.Scene.
// Scale: chibi ≈ 1.1 tall, so buildings and vehicles are ≈ real size × 0.65.
import * as THREE from 'three';
import * as LP from '../lib/props.js';
import * as MX from '../mx/props.js';
import * as NP from '../napo/props.js';
import * as RP from '../rusia/props.js';
import * as RS from '../rusia/sets.js';
import * as W2 from '../ww2/kit.js';
import * as P from './props.js';

export const { bake, bakeAll, room, rStage, stars, aimBeam, isNight } = RS;
export { RS };
export const LIGHT = {
  ...RS.LIGHT,
  summer: { skyTop: '#4d84d0', skyHor: '#eae4d0', sunColor: '#fff2da', sun: 2.6, hemi: 1.2, hemiSky: '#e8f0ff', hemiGround: '#8a7a58', fog: ['#e3dfcf', 50, 220] },
  mud: { skyTop: '#6b7280', skyHor: '#b9b6ac', sunColor: '#e6e0d2', sun: 1.5, hemi: 1.3, hemiSky: '#d6dae0', hemiGround: '#6a5a48', fog: ['#aeaaa0', 22, 120] },
  frost: { skyTop: '#7f90a8', skyHor: '#e3e3dc', sunColor: '#fff4e2', sun: 1.7, hemi: 1.3, hemiSky: '#e4ecf6', hemiGround: '#8a8a84', fog: ['#d8d8d2', 26, 130] },
  gas: { skyTop: '#6d7462', skyHor: '#c3c49a', sunColor: '#efe6c2', sun: 1.6, hemi: 1.25, hemiSky: '#dfe0c6', hemiGround: '#6a6448', fog: ['#b9b98e', 20, 110] },
  verdun: { skyTop: '#4b4e58', skyHor: '#b59a7e', sunColor: '#ffd3a8', sun: 1.4, hemi: 1.0, hemiSky: '#c9c2b8', hemiGround: '#4a3c30', fog: ['#9a8270', 18, 110] },
  morning: { skyTop: '#5d82be', skyHor: '#f0dcb8', sunColor: '#ffe6c0', sun: 2.3, hemi: 1.2, hemiSky: '#e6ecf6', hemiGround: '#7a6a50', fog: ['#e4d6be', 25, 140] },
};
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o });
const { at, box, cyl, mesh, rng } = LP;
export function stage(light = 'summer', ground = ['#8a9a5a', '#7c8c50'], extra = {}) {
  const L = LIGHT[light];
  return RS.rStage(light, ground, extra);
}
// Things scenes tick every frame: s.tick(t) runs them all (rStage/room install it).
const ticker = s => { s.ticks = s.ticks || []; if (!s.tick) s.tick = t => s.ticks.forEach(f => f(t)); return s.ticks; };
export function smokeFrom(s, origin, opts) { const f = MX.smokeTrail(s, opts.n || 12, opts); ticker(s).push(t => f(t, origin, 1)); }
export function fireAt(s, pos, opts = {}) { const g = new THREE.Group(); g.position.copy(pos); s.add(g); const f = MX.fireSprites(g, opts.n || 12, { size: opts.size || 1.2, rise: opts.rise || 1.6, spread: opts.spread || 1, life: 0.9 }); const o = new THREE.Vector3(); ticker(s).push(t => f(t + (opts.ph || 0), o, 1)); return g; }
function wallWindow(s, x, y, z, { w = 1.2, h = 1.8, out = '#a8c0d8', frame = '#e8e2d4', curtain = null, glow = false, ry = 0 } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; s.add(g);
  g.add(new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: out })));
  g.add(at(box(w + 0.14, 0.08, 0.08, frame), 0, h / 2, 0.04)); g.add(at(box(w + 0.14, 0.12, 0.14, frame), 0, -h / 2, 0.06));
  for (const sx of [-1, 1]) g.add(at(box(0.08, h, 0.08, frame), sx * w / 2, 0, 0.04));
  g.add(at(box(0.05, h, 0.05, frame), 0, 0, 0.03)); g.add(at(box(w, 0.05, 0.05, frame), 0, h * 0.18, 0.03));
  if (curtain) for (const sx of [-1, 1]) g.add(at(box(0.36, h + 0.5, 0.06, curtain), sx * (w / 2 + 0.12), 0.15, 0.12));
  if (glow) { const l = new THREE.PointLight(out, 2, 6, 1.5); l.position.set(0, 0, 0.8); g.add(l); }
  return g;
}
export function deadTree(s = 1, seed = 0, c = '#3e352c') {
  const g = new THREE.Group(), r = rng(seed + 41);
  g.add(at(cyl(0.06 * s, 0.13 * s, 2.4 * s, c, 6), 0, 1.2 * s, 0, (r() - 0.5) * 0.2, 0, (r() - 0.5) * 0.2));
  for (let i = 0; i < 3; i++) { const b = cyl(0.02 * s, 0.04 * s, (0.5 + r() * 0.6) * s, c, 5); const a = r() * 6.28; b.position.set(Math.cos(a) * 0.2 * s, (1.3 + r() * 0.9) * s, Math.sin(a) * 0.2 * s); b.rotation.set(Math.sin(a) * 0.8, 0, -Math.cos(a) * 0.8); g.add(b); }
  return g;
}
// Flat animated water plane. m.wave(t)
export function water(s, { color = '#2e4a5e', y = 0, w = 400, d = 400, x = 0, z = 0, amp = 1 } = {}) {
  const geo = new THREE.PlaneGeometry(w, d, 50, 50); geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.25 })); m.position.set(x, y, z); m.receiveShadow = true; m.userData.dynamic = true; s.add(m);
  const base = geo.attributes.position.array.slice();
  m.wave = t => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const X = base[i * 3], Z = base[i * 3 + 2]; p.setY(i, amp * (0.08 * Math.sin(X * 0.35 + t * 1.3) + 0.06 * Math.sin(Z * 0.5 - t * 1.1))); } p.needsUpdate = true; geo.computeVertexNormals(); };
  m.wave(0); ticker(s).push(t => m.wave(t)); return m;
}
// Clumps of cloud puffs high in the sky (for the air war).
export function clouds(s, n = 14, { y = 30, spread = 200, seed = 5, color = '#f4f2ee' } = {}) {
  const r = rng(seed), mat = std(color, { roughness: 1, flatShading: true });
  for (let i = 0; i < n; i++) { const g = new THREE.Group(); g.position.set((r() - 0.5) * spread, y + (r() - 0.5) * 10, -20 - r() * spread * 0.6);
    for (let k = 0; k < 6; k++) g.add(at(mesh(new THREE.IcosahedronGeometry(2 + r() * 2.5, 1), mat), (r() - 0.5) * 9, (r() - 0.5) * 2, (r() - 0.5) * 4)); g.scale.y = 0.6; s.add(g); }
}

// ------------------------------------------------------------ Sarajevo, 28 June 1914: the Appel Quay along the Miljacka, the Latin Bridge
// and Schiller's delicatessen on the corner of Franz Joseph Street. The quay runs along x; the river is at z < -3.
const FACADES = ['#e6c98e', '#e9dcc0', '#d9a88a', '#efe2c8', '#cfd6c0', '#e8c6a8', '#f0e6d0', '#d8c09a'];
export function facade(w = 7, h = 7, color = '#e6c98e', { floors = 3, shop = null, seed = 1, roof = '#8a4a34', lit = false } = {}) {
  const g = new THREE.Group(), r = rng(seed), trim = '#f6f0e2';
  g.add(at(box(w, h, 6, color), 0, h / 2, -3));
  g.add(at(box(w + 0.2, 0.3, 6.2, trim), 0, h - 0.15, -3)); g.add(at(box(w + 0.1, 0.18, 0.2, trim), 0, h * 0.33, 0.05));
  const rf = new THREE.Shape(); rf.moveTo(-w / 2 - 0.2, 0); rf.lineTo(w / 2 + 0.2, 0); rf.lineTo(w / 2 - 1.2, 1.6); rf.lineTo(-w / 2 + 1.2, 1.6); rf.closePath();
  const rg = new THREE.ExtrudeGeometry(rf, { depth: 6.2, bevelEnabled: false }); rg.translate(0, 0, -6.1); g.add(at(mesh(rg, std(roof)), 0, h, 0));
  const nwin = Math.max(2, Math.floor(w / 1.6));
  for (let f = 1; f < floors; f++) for (let i = 0; i < nwin; i++) { const x = -w / 2 + (i + 0.5) * w / nwin, y = h * 0.33 + (f - 0.5) * (h * 0.67 / (floors - 1)) + 0.3;
    g.add(at(box(0.62, 1.05, 0.06, lit ? '#ffd9a0' : '#3a4450'), x, y, 0.03)); g.add(at(box(0.8, 0.1, 0.12, trim), x, y + 0.6, 0.06)); g.add(at(box(0.76, 0.06, 0.14, trim), x, y - 0.56, 0.07)); }
  if (shop) { g.add(at(box(w * 0.8, h * 0.24, 0.05, '#3a2e26'), 0, h * 0.15, 0.03)); for (let i = 0; i < 2; i++) g.add(at(box(w * 0.3, h * 0.2, 0.06, '#8fa4b0'), (i ? 1 : -1) * w * 0.2, h * 0.15, 0.05));
    const t = P.canvasTex(512, 96, (x, W, H) => { x.fillStyle = '#2a3a2e'; x.fillRect(0, 0, W, H); x.fillStyle = '#e8d9a8'; x.font = 'bold 54px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(shop, W / 2, H / 2 + 3); });
    g.add(at(mesh(new THREE.PlaneGeometry(w * 0.7, w * 0.13), new THREE.MeshStandardMaterial({ map: t, roughness: 0.8 })), 0, h * 0.3, 0.07)); }
  else for (let i = 0; i < nwin; i++) g.add(at(box(0.7, 1.5, 0.05, '#4a3a30'), -w / 2 + (i + 0.5) * w / nwin, 0.75, 0.03));
  return g;
}
function stoneArchBridge(len = 12, w = 3.2, color = '#cfc6b2') {
  const g = new THREE.Group();
  const sh = new THREE.Shape(); sh.moveTo(-len / 2, -2.2); sh.lineTo(len / 2, -2.2); sh.lineTo(len / 2, 0.5); sh.quadraticCurveTo(0, 1.4, -len / 2, 0.5); sh.closePath();
  for (const [cx, rr] of [[-3.6, 1.2], [0, 1.6], [3.6, 1.2]]) { const h = new THREE.Path(); h.absarc(cx, -2.2, rr, 0, Math.PI, false); h.closePath(); sh.holes.push(h); }
  const geo = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false, curveSegments: 16 }); geo.translate(0, 0, -w / 2);
  g.add(mesh(geo, std(color))); for (const sz of [-1, 1]) g.add(at(box(len, 0.35, 0.18, '#d8d0bc'), 0, 0.95, sz * (w / 2 - 0.09)));
  return g;
}
function minaret(h = 14) { const g = new THREE.Group(); g.add(at(cyl(0.45, 0.55, h, '#efe8da', 12), 0, h / 2, 0)); g.add(at(cyl(0.75, 0.75, 0.25, '#e2dac8', 12), 0, h * 0.8, 0)); g.add(at(mesh(new THREE.ConeGeometry(0.5, 2.4, 12), std('#5a5a62')), 0, h + 1.2, 0)); return g; }
function mosque() { const g = new THREE.Group(); g.add(at(box(7, 4, 7, '#ebe3d2'), 0, 2, 0)); g.add(at(mesh(new THREE.SphereGeometry(3, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), std('#6a6a72')), 0, 4, 0)); const m = minaret(13); m.position.set(4.6, 0, 3); g.add(m); return g; }
export function sarajevo(light = 'summer', { crowd = true } = {}) {
  const s = stage(light, ['#bdb3a0', '#b0a690'], { seed: 601 });
  s.add(at(box(200, 0.04, 9, '#a69c8a'), 0, 0.02, 1.5));                                            // quay road
  for (let x = -100; x < 100; x += 0.9) s.add(at(box(0.85, 0.045, 8.8, '#ada392'), x, 0.022, 1.5));  // cobbles
  s.add(at(box(200, 0.16, 2.2, '#c9c0ae'), 0, 0.08, 7.0));                                           // pavement (house side)
  s.add(at(box(200, 0.5, 0.5, '#d8d0bc'), 0, 0.25, -3.2));                                          // river parapet
  s.add(at(box(200, 3.0, 2.0, '#b5ab98'), 0, -1.5, -4.4));                                          // embankment
  const riv = water(s, { color: '#5f7f7a', y: -1.6, w: 200, d: 14, z: -11, amp: 0.3 }); s.river = riv;
  s.add(at(box(200, 3.2, 3, '#b5ab98'), 0, -1.5, -19)); s.add(at(box(200, 0.04, 30, '#a9b07c'), 0, 0.0, -34));
  // houses on the quay (z ≈ 8 .. ), with Schiller's delicatessen on the corner at x ≈ 0 and Franz Joseph Street going off at x ≈ 3.2
  let x = -60; let i = 0;
  while (x < 60) { const w = 6 + (i % 3) * 1.5; if (x + w / 2 > -0.2 && x - w / 2 < 6.6) { x = 6.6 + w / 2; continue; }
    const f = facade(w, 7 + (i % 2) * 1.6, FACADES[i % FACADES.length], { floors: 3 + (i % 2), seed: i, shop: i % 4 === 1 ? ['KAFANA', 'HOTEL EUROPA', 'APOTEKA', 'BAZAR'][i % 4] : null });
    f.position.set(x, 0, 8.2); f.rotation.y = Math.PI; s.add(f); x += w + 0.05; i++; }
  const del = facade(6.2, 8, '#e3cfa4', { floors: 3, seed: 77, shop: 'MORITZ SCHILLER' }); del.position.set(-3.2, 0, 8.2); del.rotation.y = Math.PI; s.add(del);
  const del2 = facade(6.0, 8, '#e3cfa4', { floors: 3, seed: 78 }); del2.position.set(-0.1, 0, 11.2); del2.rotation.y = Math.PI / 2; s.add(del2);
  const opp = facade(6.0, 7.5, '#d9a88a', { floors: 3, seed: 79 }); opp.position.set(6.6, 0, 11.2); opp.rotation.y = -Math.PI / 2; s.add(opp);
  for (const [fx, ry] of [[-0.1, Math.PI / 2], [6.6, -Math.PI / 2]]) { const f = facade(6.0, 7.5, FACADES[(fx > 0) * 3 + 1], { floors: 3, seed: 80 + fx }); f.position.set(fx, 0, 17.3); f.rotation.y = ry; s.add(f); }
  s.add(at(box(6.2, 0.04, 30, '#a69c8a'), 3.4, 0.021, 20));                                          // Franz Joseph Street
  s.corner = new THREE.Vector3(1.0, 0, 6.6);
  const br = stoneArchBridge(13, 3.4); br.position.set(3.4, 0, -11); br.rotation.y = Math.PI / 2; s.add(br); s.bridge = br;
  for (let k = 0; k < 9; k++) { const l = RP.gasLamp(false, 3.0, false); l.position.set(-40 + k * 10, 0, -2.6); s.add(l); }
  // hills, mosques and minarets beyond the river
  for (const [mx, mz, h, rr, c] of [[-70, -120, 30, 70, '#86a066'], [20, -140, 40, 80, '#7c9860'], [100, -120, 28, 66, '#8aa46a'], [-140, -100, 24, 60, '#82a064'], [60, -170, 46, 90, '#7a9462']]) {
    const m = mesh(new THREE.SphereGeometry(1, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), std(c, { roughness: 1 })); m.scale.set(rr, h, rr * 0.6); m.position.set(mx, -2, mz); s.add(m); }
  for (const [mx, mz] of [[-14, -46], [22, -52]]) { const m = mosque(); m.position.set(mx, 0, mz); s.add(m); }
  for (const [mx, mz] of [[-30, -40], [8, -38], [40, -44]]) { const m = minaret(12); m.position.set(mx, 0, mz); s.add(m); }
  for (let k = 0; k < 16; k++) { const h = LP.house(4 + (k % 3), 4, 3 + (k % 2), FACADES[k % 8], '#9a4a34'); h.position.set(-60 + k * 8, 0, -30 - (k % 3) * 6); s.add(h); }
  // black-and-yellow flags along the route
  s.flags = [];
  for (let k = 0; k < 8; k++) { const f = P.flagPole(P.FLAGS.aut, { h: 2.6, w: 0.9, fh: 0.6 }); f.position.set(-34 + k * 9, 0, -2.9); f.rotation.y = -Math.PI / 2; s.add(f); s.flags.push(f); }
  ticker(s).push(t => s.flags.forEach((f, k) => f.wave(t + k)));
  return s;
}

// ------------------------------------------------------------ Western Front trench (runs along x). The parapet faces -z (towards the enemy).
export function trenchWF(light = 'mud', { frost = false, xmas = false, enemy = true, mud = '#5a4a3a', seed = 701 } = {}) {
  const Y = 1.25, top = frost ? '#d9d8d2' : '#6a5a46';
  const s = stage(light, frost ? ['#d9d8d2', '#cfcec6'] : ['#6a5a46', '#5e4f3d'], { seed });
  const plain = new THREE.Group(); plain.position.y = Y; s.add(plain); s.plain = plain;
  for (const [z0, z1] of [[-140, -1.0], [1.0, 60]]) { const sl = new THREE.Mesh(new THREE.BoxGeometry(300, Y, z1 - z0), [std(mud), std(mud), std(top), std(top), std(mud), std(mud)]); sl.position.set(0, Y / 2, (z0 + z1) / 2); sl.receiveShadow = sl.castShadow = true; s.add(sl); }
  s.add(at(box(300, 0.03, 2.0, frost ? '#a8a49a' : '#4a3c2e'), 0, 0.015, 0));
  for (let x = -40; x < 40; x += 2.0) { const d = P.duckboard(1.96); d.position.set(x + 1, 0, 0); s.add(d); }
  for (const sz of [-1, 1]) { for (let x = -40; x < 40; x += 1.1) s.add(at(box(0.08, Y, 0.08, '#4a3a2a'), x, Y / 2, sz * 0.96)); for (let k = 0; k < 4; k++) s.add(at(box(80, 0.22, 0.04, ['#5a4632', '#4e3e2c', '#56442f', '#4a3a28'][k]), 0, 0.16 + k * 0.27, sz * 0.97)); }
  s.add(at(box(80, 0.3, 0.32, '#5a4a36'), 0, 0.42, -0.78));                                           // fire step
  const sb = MX.sandbags(80, 2); sb.position.set(0, Y, -1.25); s.add(sb);
  const sb2 = MX.sandbags(80, 1); sb2.position.set(0, Y, 1.25); s.add(sb2);
  for (const x of [-6, 5.5, 14]) { const l = P.ladder(1.7); l.position.set(x, 0, -0.85); l.rotation.x = -0.18; s.add(l); }
  const ps = P.periscope(); ps.position.set(-2.4, 0.6, -0.85); s.add(ps);
  const r = rng(seed + 1);
  for (let k = 0; k < 4; k++) { const w = P.wire(10, k); w.position.set(-15 + k * 10, Y, -7 - (k % 2) * 1.5); s.add(w); }
  for (let k = 0; k < 4; k++) { const w = P.wire(10, k + 9); w.position.set(-15 + k * 10, Y, -30 + (k % 2) * 1.5); s.add(w); }
  for (let k = 0; k < 26; k++) { const c = RP.crater(0.8 + r() * 1.5, frost); c.position.set((r() - 0.5) * 70, Y, -10 - r() * 18); s.add(c); }
  for (let k = 0; k < 10; k++) { const t = deadTree(0.9 + r() * 0.6, k); t.position.set((r() - 0.5) * 80, Y, -12 - r() * 40); s.add(t); }
  if (enemy) { const esb = MX.sandbags(120, 2); esb.position.set(0, Y, -33); s.add(esb); }
  for (const [x, z] of [[-30, -60], [12, -70], [40, -55]]) smokeFrom(s, new THREE.Vector3(x, Y + 0.5, z), { n: 10, color: '#6a6660', size: 2.4, rise: 14, drift: [4, 0, 0], life: 6, opacity: 0.5 });
  s.rats = [P.rat(), P.rat('#2a2622')]; s.rats.forEach((rt, k) => { rt.position.set(-3 + k * 1.5, 0.08, 0.3 - k * 0.4); rt.userData.dynamic = true; s.add(rt); });
  if (xmas) { const tr = P.xmasTree(1.3); tr.position.set(0.25, Y, -32.9); s.add(tr); s.tree = tr; const tr2 = P.xmasTree(0.7); tr2.position.set(-6, Y, -33.2); s.add(tr2); }
  s.Y = Y; return s;
}
// Shell-cratered ground (Verdun / the Somme): a deformed plane with dozens of overlapping craters and shattered stumps.
export function craterField(light = 'verdun', { size = 140, n = 170, seed = 801, color = ['#6b5541', '#5a4634'], stumps = 40, fort = false, green = 0, depth = 0.7 } = {}) {
  const s = stage(light, null, { seed });
  const geo = new THREE.PlaneGeometry(size, size, 180, 180); geo.rotateX(-Math.PI / 2);
  const r = rng(seed), cr = [...Array(n)].map(() => [(r() - 0.5) * size * 0.8, (r() - 0.5) * size * 0.8, 0.8 + r() * 2.6]);
  const hAt = (x, z) => { let y = 0.12 * Math.sin(x * 0.3) * Math.cos(z * 0.27), rim = 0;
    for (const [cx, cz, rr] of cr) { const d = Math.hypot(x - cx, z - cz) / rr; if (d < 1) y += -depth * rr * (1 - d * d); else if (d < 1.5) { const k = 1 - (d - 1) / 0.5; y += 0.35 * rr * k * k; rim = Math.max(rim, k); } }
    return [y, rim]; };
  const p = geo.attributes.position, cols = [], ca = new THREE.Color(color[0]), cb = new THREE.Color(color[1]), dk = new THREE.Color('#33281f'), lt = new THREE.Color('#8f7d66'), cg = new THREE.Color('#6f7a48'), tmp = new THREE.Color();
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); const [y, rim] = hAt(x, z); p.setY(i, y);
    tmp.copy(ca).lerp(cb, 0.5 + 0.5 * Math.sin(x * 1.7 + z * 1.3)); if (y < -0.2) tmp.lerp(dk, Math.min(1, -y / 1.2)); tmp.lerp(lt, rim * 0.45);
    if (green) tmp.lerp(cg, green * Math.max(0, 0.5 + 0.5 * Math.sin(x * 0.2 - z * 0.15)) * (y > -0.1 ? 1 : 0.3)); cols.push(tmp.r, tmp.g, tmp.b); }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); geo.computeVertexNormals();
  const gm = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: false })); gm.receiveShadow = true; s.add(gm); s.ground = gm;
  for (const [cx, cz, rr] of cr.slice(0, 40)) { const w = mesh(new THREE.CircleGeometry(rr * 0.55, 18), std('#5d6260', { roughness: 0.15, metalness: 0.35 })); w.rotation.x = -Math.PI / 2; w.position.set(cx, -depth * rr * (1 - 0.3), cz); s.add(w); }
  for (let k = 0; k < stumps; k++) { const x = (r() - 0.5) * size * 0.7, z = (r() - 0.5) * size * 0.7; const t = deadTree(0.6 + r() * 0.9, k + seed, '#3a3028'); t.position.set(x, hAt(x, z)[0] - 0.1, z); s.add(t); }
  for (let k = 0; k < 24; k++) { const x = (r() - 0.5) * size * 0.6, z = (r() - 0.5) * size * 0.6; const pl = box(1.2 + r(), 0.06, 0.2, '#5a4632'); pl.position.set(x, hAt(x, z)[0] + 0.05, z); pl.rotation.set(0, r() * 3, (r() - 0.5) * 0.4); s.add(pl); }
  for (let k = 0; k < 6; k++) { const x = (r() - 0.5) * 50, z = -10 - r() * 40; const w = P.wire(5, k + 40); w.position.set(x, hAt(x, z)[0], z); w.rotation.y = r() * 3; s.add(w); }
  if (fort) { const f = new THREE.Group(); f.position.set(8, 0, -40); s.add(f);
    for (let k = 0; k < 7; k++) f.add(at(box(3 + r() * 4, 1.5 + r() * 2.5, 3 + r() * 3, k % 2 ? '#8a8478' : '#7a746a'), (r() - 0.5) * 18, 0.8, (r() - 0.5) * 8, (r() - 0.5) * 0.3, r(), (r() - 0.5) * 0.3));
    f.add(at(box(16, 1.2, 1.2, '#8a8478'), 0, 0.6, 4)); }
  s.heightAt = (x, z) => hAt(x, z)[0];
  s.craters = cr; return s;
}
// Battery position: howitzers and field guns firing (s.guns[i].recoil(t, tf)).
export function battery(light = 'overcast', { n = 3 } = {}) {
  const s = stage(light, ['#7a7458', '#6c664c'], { seed: 821, bumps: 0.3 });
  s.guns = [];
  for (let i = 0; i < n; i++) { const h = P.howitzer(); h.position.set(-8 + i * 8, 0, -4 - (i % 2) * 2); h.rotation.y = -Math.PI / 2 + 0.15; h.userData.dynamic = true; s.add(h); s.guns.push(h);
    for (let k = 0; k < 5; k++) s.add(at(cyl(0.11, 0.11, 0.5, '#8a7a3a', 10), -8 + i * 8 + 1.6 + (k % 3) * 0.26, 0.25, -2.2 - Math.floor(k / 3) * 0.3)); s.add(at(box(0.9, 0.4, 0.5, '#5a4a32'), -8 + i * 8 - 1.8, 0.2, -2.4)); }
  LP.scatter(s, (rr, i) => deadTree(0.8 + rr() * 0.5, i), 16, [-60, -80, 60, -20], 822);
  return s;
}

// ------------------------------------------------------------ skies and seas
export function skyStage(light = 'day', { ground = ['#7f9a5a', '#6f8a4e'], clouds: nc = 16 } = {}) {
  const s = stage(light, ground, { seed: 901 });
  clouds(s, nc, { y: 34, spread: 260 });
  LP.scatter(s, (r, i) => (i % 3 ? LP.roundTree(1.4 + r() * 0.6, '#4f6b3a', i) : deadTree(1.2, i)), 60, [-120, -160, 120, -10], 902);
  return s;
}
export function nightCity({ searchlights = 3 } = {}) {
  const s = stage('night', ['#20242c', '#1a1e26'], { seed: 911 }); RS.stars(s, 500);
  const r = rng(912);
  for (let i = 0; i < 60; i++) { const w = 4 + r() * 5, h = 5 + r() * 10; const b = box(w, h, 5, '#141820'); b.position.set(-90 + i * 3.1, h / 2, -40 - r() * 30); s.add(b);
    for (let k = 0; k < 4; k++) if (r() > 0.55) s.add(at(box(0.5, 0.7, 0.05, '#ffd28a'), b.position.x + (r() - 0.5) * w * 0.7, 1 + r() * (h - 2), b.position.z + 2.53)); }
  const dome = mesh(new THREE.SphereGeometry(5, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), std('#1a1e26')); dome.position.set(10, 14, -55); s.add(dome); s.add(at(box(12, 14, 12, '#161a22'), 10, 7, -55));
  s.beams = [];
  for (let i = 0; i < searchlights; i++) { const b = RP.beam(90, 0.3, 4, '#dfe8ff', 0.16); const g = new THREE.Group(); g.position.set(-30 + i * 30, 1, -45); g.add(b); g.userData.dynamic = true; s.add(g); s.beams.push(g); }
  return s;
}
export function seaStage(light = 'day', { color = '#3c5a70' } = {}) {
  const s = stage(light, null, { seed: 921 });
  s.sea = water(s, { color, y: 0 });
  return s;
}

// ------------------------------------------------------------ 1914: departure, the Marne, digging in
// Railway station in August 1914: troop train chalked "Nach Paris!" and a cheering crowd's platform. Track along x at z = 0.
export function station1914(light = 'summer', { chalk = 'NACH PARIS!' } = {}) {
  const s = stage(light, ['#b8b0a0', '#aaa290'], { seed: 1001 });
  const tr = RP.track(160); tr.rotation.y = Math.PI / 2; s.add(tr);
  const train = RP.trainSet(3, i => ({ color: '#4a5a3a', band: '#c9b88a', lit: false })); train.rotation.y = Math.PI / 2; train.position.x = -6; train.userData.dynamic = true; s.add(train); s.train = train;
  const pf = RP.platform(60, { lamps: 0 }); pf.rotation.y = Math.PI / 2; pf.position.set(0, 0, 3.6); s.add(pf); s.platform = pf;
  const t = P.canvasTex(1024, 128, (x, W, H) => { x.clearRect(0, 0, W, H); x.fillStyle = 'rgba(245,245,240,0.92)'; x.font = 'bold 84px "Comic Sans MS", cursive'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(chalk, W / 2, H / 2); });
  s.chalk = [];
  for (const cx of [-14, -3, 8]) { const m = mesh(new THREE.PlaneGeometry(6, 0.75), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false })); m.position.set(cx, 1.55, 1.36); train.add(m); s.chalk.push(m); }
  const st = RP.stationHouse('BAHNHOF', { lit: 0 }); st.position.set(0, 0, 13); st.rotation.y = Math.PI; s.add(st);
  s.flags = [P.FLAGS.ger, P.FLAGS.ger, P.FLAGS.aut].map((f, i) => { const fl = P.flagPole(f, { h: 3.2, w: 1.1, fh: 0.7 }); fl.position.set(-10 + i * 10, 0.62, 6.0); s.add(fl); return fl; });
  ticker(s).push(tt => s.flags.forEach((f, i) => f.wave(tt + i)));
  return s;
}
// Tree-lined French road at dusk with a column of Paris taxis (along x).
export function marneRoad(light = 'dusk', { taxis = 7 } = {}) {
  const s = stage(light, ['#7f8a52', '#727d48'], { seed: 1011, bumps: 0.3 });
  s.add(at(box(200, 0.03, 5.2, '#9a8a6a'), 0, 0.015, 0));
  for (let i = 0; i < 26; i++) for (const sz of [-1, 1]) { const t = LP.roundTree(1.8 + (i % 3) * 0.2, '#4f6a3a', i + (sz > 0 ? 40 : 0)); t.position.set(-60 + i * 5, 0, sz * 3.6); s.add(t); }
  s.taxis = [];
  for (let i = 0; i < taxis; i++) { const tx = P.taxiMarne(i % 3 === 1 ? '#2a3a5a' : '#8a2a24'); tx.position.set(-4 - i * 3.2, 0, -1.1); tx.userData.dynamic = true; s.add(tx); s.taxis.push(tx); }
  LP.scatter(s, (r, i) => LP.house(3 + r() * 2, 3, 2.6, '#e6dcc4', '#9a4a34'), 10, [-80, -60, 80, -20], 1012);
  return s;
}
// Open field where soldiers dig the first trench line (a spoil bank along x at z = -1).
export function digField(light = 'overcast') {
  const s = stage(light, ['#7d8a52', '#6f7c48'], { seed: 1021, bumps: 0.3 });
  const sp = mesh(new THREE.CylinderGeometry(0.7, 0.9, 60, 10, 1, false, 0, Math.PI), std('#6a5440')); sp.rotation.z = Math.PI / 2; sp.scale.set(1, 1, 0.8); sp.position.set(0, 0, -1.2); s.add(sp);
  s.add(at(box(60, 0.03, 1.6, '#4e3e2e'), 0, 0.02, 0.3));
  for (let k = 0; k < 6; k++) { const w = P.wire(8, k); w.position.set(-24 + k * 9, 0, -6); s.add(w); }
  LP.scatter(s, (r, i) => LP.roundTree(1.5 + r() * 0.5, '#5a7040', i), 30, [-80, -90, 80, -14], 1022);
  return s;
}

// ------------------------------------------------------------ other fronts
// Gallipoli: a narrow beach under steep scrubby cliffs; boats come in from +z (the sea).
export function gallipoli(light = 'morning') {
  const s = stage(light, ['#d9c9a0', '#cdbb90'], { seed: 1031 });
  s.sea = water(s, { color: '#3f7a90', y: -0.05, z: 60, d: 110 });
  const cliffs = new THREE.Group(); s.add(cliffs);
  const r = rng(1032);
  for (let i = 0; i < 26; i++) { const h = 5 + r() * 5; const m = mesh(new THREE.IcosahedronGeometry(1, 1), std(['#b89a6a', '#a88a5c', '#9a8a5a'][i % 3], { flatShading: true })); m.scale.set(6 + r() * 4, h, 4 + r() * 2); m.position.set(-60 + i * 4.8, h * 0.45 - 0.5, -13 - r() * 5); m.rotation.y = r() * 3; cliffs.add(m); }
  for (let i = 0; i < 12; i++) { const m = mesh(new THREE.IcosahedronGeometry(1, 1), std('#6a7a44', { flatShading: true })); m.scale.set(3 + r() * 3, 2 + r() * 2, 2); m.position.set(-55 + i * 10, 7 + r() * 3, -17 - r() * 3); cliffs.add(m); }
  LP.scatter(s, (rr, i) => LP.bush(0.8 + rr() * 0.6, '#6a7a44', i), 70, [-50, -16, 50, -5], 1033);
  s.boats = [];
  for (let i = 0; i < 4; i++) { const b = NP.rowboat ? NP.rowboat('#5a4632') : box(3, 0.6, 1.2, '#5a4632'); b.position.set(-9 + i * 6, 0.05, 10 + (i % 2) * 3); b.rotation.y = Math.PI / 2; b.userData.dynamic = true; s.add(b); s.boats.push(b); }
  const ship = RP.dreadnought(30, '#7a8288'); ship.position.set(10, -0.5, 70); ship.rotation.y = 0.2; s.add(ship);
  return s;
}
// Desert with the Hejaz railway (along x) for the Arab Revolt.
export function desertRail(light = 'golden') {
  const s = stage(light, ['#e2c48e', '#d1ad72'], { seed: 1041, bumps: 0.4 });
  const tr = RP.track(200, { ballast: '#b89a6a' }); tr.rotation.y = Math.PI / 2; s.add(tr);
  for (const [x, z, h, rr] of [[-40, -60, 14, 26], [10, -70, 20, 30], [55, -55, 12, 22], [-70, -40, 10, 20]]) { const m = LP.mountain(h, rr, '#c9a26b', false, x); m.position.set(x, 0, z); s.add(m); }
  LP.scatter(s, (r, i) => (i % 4 ? LP.rock(0.5 + r() * 0.9, '#b48b5a', i) : LP.palm(0.9 + r() * 0.3, i)), 40, [-40, -30, 40, -4], 1042, [[0, 0, 3]]);
  const train = RP.trainSet(2, i => ({ color: '#3b3f45', band: '#8a7a5a' })); train.rotation.y = Math.PI / 2; train.position.x = 8; train.userData.dynamic = true; s.add(train); s.train = train;
  return s;
}

// ------------------------------------------------------------ offices and halls
const portraitTex = (bg, coat, face = '#e8d0b8') => (x, W, H) => { x.fillStyle = bg; x.fillRect(0, 0, W, H); x.fillStyle = coat; x.beginPath(); x.ellipse(W / 2, H * 0.9, W * 0.38, H * 0.32, 0, 0, 7); x.fill(); x.fillStyle = face; x.beginPath(); x.ellipse(W / 2, H * 0.42, W * 0.16, H * 0.17, 0, 0, 7); x.fill(); };
// Wood-panelled ministry office (Berlin, Vienna): desk facing +z, portrait behind, window.
export function office({ wall = '#7a5a40', lower = '#4a3020', portrait = ['#3a2a20', '#4a4e44'], flag = null } = {}) {
  const s = room({ w: 8, d: 6, h: 2.9, wall, lower, lowerH: 0.9, floor: '#5a3a24', ceil: '#e8dcc0', hemi: 0.85, sunI: 0.7, trim: '#c9a227', lights: [[0, 2.4, 0.5, 3.5], [1.2, 1.2, -1.6, 2.2, '#ffe0b0', 5]] });
  wallWindow(s, 2.5, 1.5, -2.99, { w: 1.1, h: 1.4, out: '#dfe6ee', curtain: '#6a2a24', glow: true });
  const pic = RP.picture(0.75, 0.95, portraitTex(...portrait)); pic.position.set(-0.6, 1.75, -2.96); s.add(pic);
  const d = RP.desk(2.0, 0.9, '#4a2a1a'); d.position.set(0, 0, -1.4); s.add(d); s.desk = d;
  const ch = RP.chairR('#4a2a1a', '#6a2a24'); ch.position.set(0, 0, -1.85); s.add(ch); s.seat = [0, ch.top - 0.12, -1.8];
  const pp = RP.papers(4, 5); pp.position.set(-0.15, d.top, -1.35); s.add(pp);
  const l = RP.deskLamp(true, '#2f6a3a'); l.position.set(0.32, d.top, -1.5); s.add(l);
  const sh = RP.bookshelf ? RP.bookshelf() : null; if (sh) { sh.position.set(-3.2, 0, -2.7); s.add(sh); }
  if (flag) { const f = P.flagPole(flag, { h: 1.6, w: 0.6, fh: 0.4 }); f.position.set(1.3, 0, -2.6); s.add(f); s.flag = f; }
  return s;
}
// Room 40 (Admiralty, London): long tables with code books, papers and green lamps.
export function room40() {
  const s = room({ w: 10, d: 7, h: 3.0, wall: '#b8ae96', lower: '#5a4632', lowerH: 0.9, floor: '#6a4a30', ceil: '#ece2c8', hemi: 0.8, sunI: 0.55, trim: '#5a4632',
    lights: [[-2.4, 1.4, -0.8, 3, '#ffe2b0', 6], [2.4, 1.4, -0.8, 3, '#ffe2b0', 6], [0, 2.6, 1, 3]] });
  for (const x of [-3.2, 0, 3.2]) wallWindow(s, x, 1.7, -3.49, { w: 1.0, h: 1.3, out: '#9aa8b4', curtain: '#4a3a2a' });
  s.tables = [];
  for (const [x, z] of [[-2.2, -1.2], [2.2, -1.2]]) { const t = RP.tableCloth(3.2, 1.2, '#3a5a3a', 0.78, 0.5); t.position.set(x, 0, z); s.add(t); s.tables.push(t);
    for (const dx of [-0.5, 0.5]) { const l = RP.deskLamp(true, '#2f6a3a'); l.position.set(x + dx, t.top, z - 0.15); s.add(l); }
    const pp = RP.papers(6, x * 3 | 0); pp.position.set(x, t.top, z + 0.05); s.add(pp); }
  const cb = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshStandardMaterial({ map: P.cipherTex(), roughness: 0.9 })); cb.position.set(-4.95, 1.6, -0.5); cb.rotation.y = Math.PI / 2; s.add(cb);
  s.seatsAt = (i) => { const t = s.tables[i % 2]; return [t.position.x + (Math.floor(i / 2) - 0.5) * 0.9, 0.08, t.position.z + 0.62]; };
  for (let i = 0; i < 4; i++) { const [x, , z] = s.seatsAt(i); const c = RP.chairR('#4a3020', '#5a4a3a'); c.position.set(x, 0, z + 0.05); c.rotation.y = Math.PI; s.add(c); }
  return s;
}
// The US Congress: rostrum with flags and an eagle, rows of desks.
export function capitol() {
  const s = room({ w: 12, d: 9, h: 4.0, wall: '#e9e1cc', lower: '#6a4a30', lowerH: 1.0, floor: '#7a3a2a', ceil: '#efe6cf', hemi: 1.0, sunI: 0.9, trim: '#c9a227', lights: [[0, 3.4, 0, 6]] });
  const ros = new THREE.Group(); ros.position.set(0, 0, -3.4); s.add(ros);
  ros.add(at(box(4.4, 0.9, 1.2, '#5a3a24'), 0, 0.45, 0)); ros.add(at(box(2.2, 1.5, 0.9, '#6a4a30'), 0, 0.75, -0.6));
  const lec = RP.lectern ? RP.lectern() : null; if (lec) { lec.position.set(0, 0.9, 0.2); ros.add(lec); }
  s.podium = [0, 0.9, -3.2];
  for (const x of [-2.6, 2.6]) { const f = P.flagPole(P.FLAGS.usa, { h: 3.0, w: 1.1, fh: 0.7 }); f.position.set(x, 0, -4.1); s.add(f); }
  const eg = new THREE.Mesh(new THREE.CircleGeometry(0.7, 24), new THREE.MeshStandardMaterial({ map: RP.eagleTex ? RP.eagleTex('#c9a227') : null, color: '#c9a227', metalness: 0.5, roughness: 0.4 })); eg.position.set(0, 3.0, -4.45); s.add(eg);
  for (let row = 0; row < 3; row++) for (let i = -3; i <= 3; i++) { const d = RP.desk(1.0, 0.5, '#5a3a24'); d.position.set(i * 1.5, 0, 0.6 + row * 1.4); d.rotation.y = Math.PI; s.add(d); }
  return s;
}
// Hall of Mirrors at Versailles: mirrors on one side (x < 0), windows on the other, chandeliers, the treaty table.
export function hallOfMirrors() {
  const s = room({ w: 12, d: 40, h: 6.0, wall: '#e9dcc0', floor: '#8a6a44', ceil: '#d9b878', hemi: 1.05, sunI: 0.9, trim: '#c9a64a', bg: '#1a120a',
    lights: [[0, 5, -8, 10, '#ffe8c0', 22], [0, 5, 6, 10, '#ffe8c0', 22]] });
  for (let i = 0; i < 9; i++) { const z = -16 + i * 4; const m = P.mirrorBay(4.0, 5.6); m.position.set(-5.95, 0, z); m.rotation.y = Math.PI / 2; s.add(m);
    const w = P.mirrorBay(4.0, 5.6); w.position.set(5.95, 0, z); w.rotation.y = -Math.PI / 2; w.traverse(o => { if (o.isMesh && o.material.metalness > 0.8) o.material = new THREE.MeshBasicMaterial({ color: '#e8eef4' }); }); s.add(w); }
  for (let k = -3; k <= 3; k++) { const c = NP.chandelier('#d4af37'); c.position.set(0, 4.0, k * 5.4); c.scale.setScalar(1.2); s.add(c); }
  for (let k = 0; k < 8; k++) { const p = mesh(new THREE.PlaneGeometry(3.6, 3.6), new THREE.MeshStandardMaterial({ map: P.canvasTex(128, 128, (x, W, H) => { const g = x.createRadialGradient(W / 2, H / 2, 4, W / 2, H / 2, W / 1.6); g.addColorStop(0, '#e8c890'); g.addColorStop(0.6, '#b8885a'); g.addColorStop(1, '#6a4a2a'); x.fillStyle = g; x.fillRect(0, 0, W, H); x.strokeStyle = '#d4af37'; x.lineWidth = 8; x.strokeRect(4, 4, W - 8, H - 8); }), roughness: 0.8 })); p.rotation.x = Math.PI / 2; p.position.set(0, 5.98, -16 + k * 4.6); s.add(p); }
  const tb = RP.tableCloth(5.0, 1.4, '#3a5a3a', 0.78, 0.5); tb.position.set(0, 0, -2.0); s.add(tb); s.table = tb;
  for (let i = 0; i < 5; i++) { const c = RP.chairR('#5a3a24', '#7a2a24'); c.position.set(-1.6 + i * 0.8, 0, -2.6); s.add(c); }
  const pp = RP.papers(3, 2); pp.position.set(0, tb.top, -1.85); s.add(pp); s.treaty = pp;
  s.seats = i => [-1.6 + i * 0.8, 0.08, -2.55];
  return s;
}
// Field hospital ward (1918 flu): two rows of beds along z, windows, a stove.
export function hospital() {
  const s = room({ w: 9, d: 14, h: 3.0, wall: '#e6e2d6', lower: '#9aa89a', lowerH: 1.0, floor: '#8a7a64', ceil: '#f2eee4', hemi: 1.0, sunI: 0.8, trim: '#9aa89a', lights: [[0, 2.6, -2, 5], [0, 2.6, 3, 5]] });
  for (const z of [-5, -1.5, 2]) { wallWindow(s, -4.49, 1.6, z, { w: 1.0, h: 1.2, out: '#e8eef2', ry: Math.PI / 2 }); }
  s.beds = [];
  for (let i = 0; i < 6; i++) for (const sx of [-1, 1]) { const b = P.bed(); b.position.set(sx * 2.6, 0, -5.5 + i * 2.0); b.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2; s.add(b); s.beds.push(b); }
  return s;
}
// War cemetery at sunset: rows of white crosses in a field of poppies.
export function cemetery(light = 'golden', { rows = 9, cols = 15 } = {}) {
  const s = stage(light, ['#6f8a4a', '#62803f'], { seed: 1101 });
  s.crosses = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const x = (c - (cols - 1) / 2) * 1.5, z = -3 - r * 1.8; const cr = P.whiteCross(0.9); cr.position.set(x, 0, z); s.add(cr); s.crosses.push(cr); }
  P.poppies(s, 1800, [-16, -22, 16, 6], 1102, s.crosses.map(c => [c.position.x, c.position.z, 0.25]));
  LP.scatter(s, (r, i) => LP.roundTree(1.6 + r() * 0.6, '#3f5a30', i), 26, [-60, -70, 60, -26], 1103);
  return s;
}
// Spring 1918 / Amiens: open rolling field with mist, for advancing tanks and stormtroopers.
export function openField(light = 'morning', { mist = false, green = 0.5 } = {}) {
  const s = craterField(light, { n: 70, size: 160, stumps: 20, green, depth: 0.35, color: ['#7a6a4e', '#6a5a42'], seed: 1111 });
  if (mist) s.fog = new THREE.Fog('#d8d0c0', 8, 60);
  return s;
}
// Forest of Compiègne: the railway carriage in the clearing (track along x).
export function compiegne(light = 'dawn') {
  const s = stage(light === 'dawn' ? 'morning' : light, ['#6a7a48', '#5e6e40'], { seed: 1121 });
  const tr = RP.track(80); tr.rotation.y = Math.PI / 2; s.add(tr);
  const car = RP.railCar({ color: '#3a2a20', len: 11, lit: true, band: '#c9a227' }); car.rotation.y = Math.PI / 2; s.add(car); s.car = car;
  LP.scatter(s, (r, i) => (i % 2 ? LP.pine(2.0 + r() * 0.6, '#2f4a32', i) : LP.roundTree(2.0 + r() * 0.5, '#3f5a32', i)), 140, [-60, -50, 60, 40], 1122, [[0, 0, 9], [-10, 0, 8], [10, 0, 8], [0, 9, 8]]);
  s.fog = new THREE.Fog('#c8ccc0', 10, 70);
  return s;
}
// Inside Foch's carriage: long table with green cloth, both delegations.
export function wagonInterior() {
  const s = room({ w: 9, d: 3.2, h: 2.3, wall: '#6a4a30', lower: '#3a2618', lowerH: 0.8, floor: '#4a3020', ceil: '#e8dcc0', hemi: 0.8, sunI: 0.4, bg: '#0c0a08', trim: '#c9a227',
    lights: [[-2.0, 2.0, 0.2, 2.2, '#ffd9a0', 8], [2.0, 2.0, 0.2, 2.2, '#ffd9a0', 8]] });
  for (const x of [-3, -1, 1, 3]) wallWindow(s, x, 1.3, -1.59, { w: 0.8, h: 0.7, out: '#8a9aa8', frame: '#3a2618' });
  const tb = RP.tableCloth(4.2, 1.1, '#2f5a3a', 0.78, 0.5); tb.position.set(0, 0, -0.5); s.add(tb); s.table = tb;
  const pp = RP.papers(4, 7); pp.position.set(0, tb.top, -0.45); s.add(pp);
  s.seats = (i, side) => [-1.2 + i * 0.8, 0.08, -0.5 + side * 0.55];
  return s;
}
// Port in France (Saint-Nazaire, 1917-18): quay along x with a troopship moored behind it.
export function portFrance(light = 'overcast') {
  const s = stage(light, ['#b5ab98', '#a89e8a'], { seed: 1131 });
  water(s, { color: '#5f7f8a', y: -0.6, z: -30, d: 50 });
  s.add(at(box(200, 0.6, 1.2, '#8a8478'), 0, -0.3, -5.6));
  const sh = MX.steamship('#3a3e44', { funnels: 2, funnel: '#3a3e44' }); sh.rotation.y = Math.PI / 2; sh.scale.setScalar(2.2); sh.position.set(2, -1.0, -10); s.add(sh); s.ship = sh;
  for (let k = 0; k < 2; k++) { const g = new THREE.Group(); g.add(at(box(0.9, 0.06, 4.6, '#6a5a44'), 0, 0.9, -2.3, 0.35, 0, 0)); g.position.set(-2 + k * 6, 0, -3.4); s.add(g); }
  for (let k = 0; k < 6; k++) s.add(at(box(1.2, 0.9, 0.9, '#7a6a4a'), -14 + k * 2.4, 0.45, 2.6 + (k % 2)));
  for (let k = 0; k < 4; k++) { const c = box(0.5, 6, 0.5, '#3a3a3a'); c.position.set(-20 + k * 14, 3, -4.6); s.add(c); s.add(at(box(6, 0.4, 0.4, '#3a3a3a'), -20 + k * 14 + 2.5, 6, -4.6)); }
  s.flags = [P.FLAGS.usa, P.FLAGS.fra].map((f, i) => { const fl = P.flagPole(f, { h: 3.4, w: 1.2, fh: 0.8 }); fl.position.set(-6 + i * 12, 0, 1.0); s.add(fl); return fl; });
  ticker(s).push(t => s.flags.forEach((f, i) => f.wave(t + i)));
  return s;
}
// Station at Spa / Eijsden, November 1918: the Kaiser's train in grey dawn light.
export function kaiserStation() {
  const s = stage('overcast', ['#9a9a90', '#8e8e84'], { seed: 1141 });
  const tr = RP.track(160); tr.rotation.y = Math.PI / 2; s.add(tr);
  const train = RP.imperialTrain(3, { lit: true }); train.rotation.y = Math.PI / 2; train.position.x = -4; train.userData.dynamic = true; s.add(train); s.train = train;
  const pf = RP.platform(60, { lamps: 5 }); pf.rotation.y = Math.PI / 2; pf.position.set(0, 0, 3.6); s.add(pf); s.platform = pf;
  s.fog = new THREE.Fog('#b8b8b0', 14, 80);
  return s;
}
// 1939: dusk over a field, a column of Panzers (outro).
export function dusk1939() {
  const s = stage('dusk', ['#5a5a40', '#4e4e38'], { seed: 1151 });
  s.tanks = [];
  for (let i = 0; i < 5; i++) { const t = W2.tank('de'); t.position.set(-6 + i * 4.2, 0, -6 - i * 2.5); t.rotation.y = -0.6; t.userData.dynamic = true; s.add(t); s.tanks.push(t); }
  LP.scatter(s, (r, i) => LP.roundTree(1.6 + r() * 0.6, '#2f3a26', i), 40, [-70, -80, 70, -20], 1152);
  return s;
}
