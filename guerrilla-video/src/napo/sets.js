// Environments for the Napoleonic Wars video. Each builder returns a THREE.Scene.
import * as THREE from 'three';
import * as LP from '../lib/props.js';
import { stage, aimSun, mood } from '../lib/stage.js';
import { LIGHT, mxStage, interior } from '../mx/sets.js';
import * as MX from '../mx/props.js';
import * as N from './props.js';

export { aimSun, mood, interior, mxStage, LIGHT };
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o });

export const L2 = {
  ...LIGHT,
  snow: { skyTop: '#7a8aa3', skyHor: '#d8dde4', sunColor: '#eef2ff', sun: 1.5, hemi: 1.35, hemiSky: '#dfe8f5', hemiGround: '#9aa3ae', fog: ['#cdd3db', 18, 90] },
  blizzard: { skyTop: '#8a95a6', skyHor: '#c9ced6', sunColor: '#e6ecf5', sun: 1.0, hemi: 1.45, hemiSky: '#dfe6ef', hemiGround: '#a0a8b2', fog: ['#c3c9d1', 8, 48] },
  fire: { skyTop: '#140a10', skyHor: '#7a2a14', sunColor: '#ff9a50', sun: 1.2, hemi: 0.6, hemiSky: '#ff9a6a', hemiGround: '#2a1a14', fog: ['#4a1e14', 25, 110] },
  sunrise: { skyTop: '#5d76a8', skyHor: '#f4c99a', sunColor: '#ffd8a8', sun: 2.2, hemi: 1.15, hemiSky: '#ffe0c8', hemiGround: '#7a7a5a', fog: ['#e6d6c2', 14, 80] },
};
export function napoStage(light = 'day', ground = ['#8fa65a', '#7d9450'], extra = {}) {
  const L = L2[light];
  return stage({ ...L, groundA: ground[0], groundB: ground[1], shadow: 16, sunPos: light === 'dusk' || light === 'golden' || light === 'sunrise' ? [-12, 7, 6] : [7, 14, 8], seed: 7, ...extra });
}
export function sea(s, { color = '#3f7a96', y = 0.0, size = 400 } = {}) {
  const geo = new THREE.PlaneGeometry(size, size, 80, 80); geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.28, metalness: 0.1 })); m.position.y = y; m.receiveShadow = true; s.add(m);
  const base = geo.attributes.position.array.slice();
  m.wave = t => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = base[i * 3], z = base[i * 3 + 2];
    p.setY(i, 0.12 * Math.sin(x * 0.35 + t * 1.3) + 0.08 * Math.sin(z * 0.5 - t * 1.1) + 0.04 * Math.sin((x + z) * 1.1 + t * 2)); } p.needsUpdate = true; geo.computeVertexNormals(); };
  s.sea = m; return m;
}
function snowPeak(h, r, seed) { const v = MX.volcano(h, r, true); return v; }

// ---------------------------------------------------------------- the Alps (title)
export function alps(light = 'golden') {
  const s = napoStage(light, ['#e9edf1', '#dfe5ea'], { seed: 11 });
  s.add(MX.sierra({ z: -110, depth: 60, height: 34, seed: 12, base: '#8a8f9a', top: '#f4f6f8', x0: -200, x1: 200 }));
  for (const [x, z, h, r] of [[-38, -70, 34, 26], [-8, -88, 44, 30], [26, -74, 38, 26], [60, -95, 46, 32], [-70, -90, 40, 30]]) { const p = snowPeak(h, r, x); p.position.set(x, 0, z); s.add(p); }
  LP.scatter(s, (r, i) => (i % 4 ? LP.pine(1.4 + r() * 0.8, '#2f4a3a', i) : MX.rockPile(0.6 + r() * 0.6, i, '#7d7a76')), 70, [-40, -40, 40, -6], 13, [[0, -8, 6]]);
  for (const [x, z, k] of [[-3.2, -1.2, 1.1], [3.4, -2.0, 1.3], [-6, -5, 1.6], [6.5, -6, 1.8]]) { const b = MX.boulder(k, x * 3 | 0, '#8a8682'); b.position.set(x, 0, z); s.add(b); }
  return s;
}
// ---------------------------------------------------------------- Paris 1789: the Bastille
export function bastilleSet() {
  const s = napoStage('day', ['#b9ad94', '#ab9f86'], { seed: 21, fog: ['#d8d2c4', 40, 160] });
  const b = N.bastille(); b.position.set(0, 0, -16); s.add(b);
  for (let i = 0; i < 5; i++) { const h = N.townhouseFR(3.4, 4 + (i % 2) * 0.6, ['#e2d6bf', '#d8c8a8', '#e8dcc4', '#d2c2a2', '#e6d9c0'][i], i); h.position.set(-16 + i * 3.6, 0, -6); h.rotation.y = 0.5; s.add(h);
    const h2 = N.townhouseFR(3.4, 4.2 - (i % 2) * 0.5, ['#d8c8a8', '#e8dcc4', '#e2d6bf', '#e6d9c0', '#d2c2a2'][i], i + 5); h2.position.set(10 + i * 3.6, 0, -4 - i * 1.2); h2.rotation.y = -0.6; s.add(h2); }
  // the far side of the square (seen when looking back at the crowd)
  for (let i = 0; i < 9; i++) { const h = N.townhouseFR(3.4, 4 + (i % 3) * 0.5, ['#e2d6bf', '#d8c8a8', '#e8dcc4', '#d2c2a2', '#e6d9c0'][i % 5], i + 20); h.position.set(-15 + i * 3.6, 0, 17 + (i % 2) * 0.6); h.rotation.y = Math.PI; s.add(h); }
  s.flags = [];
  for (const [x, z] of [[-2.5, -9.6], [2.8, -9.4]]) { const f = N.flag('fr', 4.2, 1.6, 1.0); f.position.set(x, 0, z); s.add(f); s.flags.push(f); }
  return s;
}
// ---------------------------------------------------------------- royal throne room (fleur-de-lis)
export function throneRoom() {
  const s = interior({ wall: '#24356f', floor: '#5a3a24', w: 12, d: 9, h: 5.2, lights: [[-2.5, 4.3, 0.5], [2.5, 4.3, 0.5]], windows: false });
  const tex = MX.canvasTex(512, 256, (g, W, H) => { g.fillStyle = '#24356f'; g.fillRect(0, 0, W, H); N.fleurs(g, W, H, '#c9a227', 8); });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(3, 1);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(12, 5.2), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 })); back.position.set(0, 2.6, -4.48); s.add(back);
  s.add(LP.at(LP.box(4.6, 0.36, 2.4, '#8a1f2a'), 0, 0.18, -3.2)); s.add(LP.at(LP.box(5, 0.18, 2.8, '#8a1f2a'), 0, 0.09, -3.0));
  const th = N.throne({ fabric: '#1f3f8f' }); th.position.set(0, 0.36, -3.5); s.add(th); s.throne = th;
  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 3.6, 24, 1, true, -Math.PI / 2, Math.PI), std('#8a1f2a', { side: THREE.DoubleSide })); canopy.position.set(0, 3.2, -4.0); s.add(canopy);
  s.add(LP.at(LP.box(3.8, 0.4, 1.1, '#c9a227'), 0, 5.0, -3.9));
  for (const x of [-4.2, 4.2]) { const d = N.drape('royalblue', 1.4, 3.8); d.position.set(x, 2.4, -4.4); s.add(d); }
  return s;
}
// ---------------------------------------------------------------- Toulon 1793: battery above the harbour
export function toulon(light = 'golden') {
  const s = napoStage(light, ['#9c9a62', '#8c8a56'], { seed: 31, fog: ['#e8d4b0', 50, 220] });
  sea(s, { color: '#3f7a96', y: -2.2 });
  const hill = new THREE.Mesh(new THREE.CylinderGeometry(14, 22, 2.4, 40, 1), std('#8f8a5a')); hill.position.set(0, -1.2, -2); s.add(hill);
  for (let i = 0; i < 7; i++) { const h = N.townhouseFR(3.2, 3.6, ['#e8dcc4', '#d8c8a8', '#e2d6bf'][i % 3], i); h.position.set(-30 + i * 4, -2.2, -42); h.scale.setScalar(1.4); s.add(h); }
  s.ships = [];
  for (const [x, z, r] of [[-16, -34, 0.6], [6, -40, -0.4], [24, -36, 0.9]]) { const sh = N.ship({ len: 11, flag: 'gb', furled: 0.4, seed: x | 0 }); sh.position.set(x, -2.2, z); sh.rotation.y = r; s.add(sh); s.ships.push(sh); }
  for (let i = 0; i < 5; i++) { const g = N.gabion(0.7); g.position.set(-3.6 + i * 0.62, 0, -0.4 + (i % 2) * 0.08); s.add(g); }
  LP.scatter(s, (r, i) => (i % 3 ? MX.shrub(0.8 + r() * 0.5, i, '#7d8a4e') : LP.pine(1.2 + r() * 0.4, '#3f6b3a', i)), 30, [-14, -8, 14, 10], 32, [[0, 2, 5], [5, 5, 4.5], [5.5, -1.5, 3]]);
  return s;
}
// ---------------------------------------------------------------- Egypt
export function egypt() {
  const s = napoStage('golden', ['#e2c690', '#d8b980'], { seed: 41, skyTop: '#5a8cc8', skyHor: '#f3d9a8', fog: ['#f0d6a4', 50, 260] });
  for (const [x, z, sz] of [[-26, -70, 34], [8, -82, 40], [36, -66, 24]]) { const p = N.pyramid(sz); p.position.set(x, 0, z); s.add(p); }
  const nile = LP.strip([[-200, -30], [-40, -28], [40, -36], [200, -34]], 10, '#4f8aa6', 0.03, { roughness: 0.25 }); s.add(nile);
  LP.scatter(s, (r, i) => LP.palm(1.4 + r() * 0.5, i), 26, [-60, -42, 60, -22], 42);
  LP.scatter(s, (r, i) => MX.rockPile(0.5 + r() * 0.4, i, '#c8a878'), 14, [-30, -16, 30, 10], 43, [[0, 2, 7]]);
  return s;
}
// ---------------------------------------------------------------- Saint-Cloud council hall
export function councilHall() {
  const s = interior({ wall: '#7a5a3a', floor: '#5a3a24', w: 14, d: 10, h: 5.6, lights: [[-3, 4.8, 0], [3, 4.8, 0]] });
  s.tiers = [];
  for (let r = 0; r < 3; r++) { const h = 0.25 * (r + 1), z = -2.2 - r * 1.1; s.add(LP.at(LP.box(12, h, 1.1, '#4a3220'), 0, h / 2, z)); s.add(LP.at(LP.box(12, 0.04, 0.06, '#c9a227'), 0, h, z + 0.55)); s.tiers.push([h, z]); }
  s.add(LP.at(LP.box(2.4, 0.95, 0.9, '#6b2a22'), 0, 0.475, -0.7)); s.add(LP.at(LP.box(2.5, 0.06, 1.0, '#c9a227'), 0, 0.97, -0.7));
  const f = N.flag('fr', 3.6, 1.4, 0.85); f.position.set(-5.6, 0, -4.4); s.add(f); s.flag = f;
  for (const x of [-3.6, 3.6]) { const d = N.drape('fr', 1.1, 2.6); d.position.set(x, 3.4, -4.95); s.add(d); }
  return s;
}
// ---------------------------------------------------------------- Notre-Dame
export function notreDame() {
  const s = new THREE.Scene();
  s.add(new THREE.HemisphereLight('#fff1d8', '#5a4632', 0.95));
  const sun = new THREE.DirectionalLight('#ffe6c0', 1.6); sun.position.set(8, 14, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 0.5, far: 50 }); s.add(sun, sun.target);
  const nave = N.gothicNave({ len: 26, w: 12, h: 13 }); s.add(nave); s.nave = nave; nave.traverse(o => { if (o.isMesh) o.castShadow = false; });
  for (const sd of [-1, 1]) for (let i = 0; i < 5; i++) { const b = N.drape(i % 2 ? 'bees' : 'royalblue', 1.0, 3.2); b.position.set(sd * 4.7, 5.6, -9 + i * 4); b.rotation.y = -sd * Math.PI / 2; s.add(b); }
  for (const [x, z] of [[-3, -6], [3, -6], [-3, 2], [3, 2]]) { const l = new THREE.PointLight('#ffd9a0', 8, 16, 1.4); l.position.set(x, 5, z); s.add(l); }
  for (let i = 0; i < 4; i++) { const c = N.chandelier(); c.position.set(0, 6.5, -8 + i * 5); s.add(c); }
  s.background = new THREE.Color('#2a2018');
  s.userData = { sun, hemi: s.children[0], interior: true };
  return s;
}
// ---------------------------------------------------------------- the white cliffs of Dover
export function dover() {
  const s = napoStage('day', [null, null], { seed: 51, groundA: null, fog: ['#dfe6ea', 80, 320] });
  sea(s, { color: '#3f7a96', y: 0, size: 600 });
  const top = x => 13 + 2.2 * Math.sin(x * 0.05 + 1) + 1.2 * Math.sin(x * 0.13) + 0.5 * Math.sin(x * 0.37);
  const W = 300, segX = 240, Z = -40;
  const face = new THREE.PlaneGeometry(W, 1, segX, 16), fp = face.attributes.position, fc = [];
  const A = new THREE.Color('#f6f3ec'), B = new THREE.Color('#cfc9bd'), c = new THREE.Color();
  for (let i = 0; i < fp.count; i++) { const x = fp.getX(i), v = fp.getY(i) + 0.5, h = top(x);
    const n = 0.45 * Math.sin(x * 1.7) + 0.5 * Math.sin(x * 0.6 + v * 3) + 0.25 * Math.sin(x * 3.1 + v * 7) + 0.3 * Math.sin(x * 0.23 + 2);
    fp.setXYZ(i, x, -1.5 + v * (h + 1.5), Z + n - v * 3.0);
    c.copy(A).lerp(B, Math.min(1, Math.max(0, 0.45 + 0.35 * Math.sin(x * 2.3 + v * 5) + 0.25 * Math.sin(x * 0.4) - 0.3 * v))); fc.push(c.r, c.g, c.b); }
  face.setAttribute('color', new THREE.Float32BufferAttribute(fc, 3)); face.computeVertexNormals();
  const fm = new THREE.Mesh(face, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true })); fm.receiveShadow = true; s.add(fm);
  const cap = new THREE.PlaneGeometry(W, 60, segX, 8); cap.rotateX(-Math.PI / 2); const cp = cap.attributes.position, cc = [], G1 = new THREE.Color('#6f9a48'), G2 = new THREE.Color('#5d8a3e');
  for (let i = 0; i < cp.count; i++) { const x = cp.getX(i), zz = cp.getZ(i), u = (zz + 30) / 60; // 1 near the edge
    const n = 0.45 * Math.sin(x * 1.7) + 0.5 * Math.sin(x * 0.6 + 3) + 0.25 * Math.sin(x * 3.1 + 7) + 0.3 * Math.sin(x * 0.23 + 2);
    const zE = Z + n - 3.0; cp.setXYZ(i, x, top(x) + (1 - u) * 1.5 + 0.05, zE - (1 - u) * 60);
    c.copy(G1).lerp(G2, 0.5 + 0.5 * Math.sin(x * 0.3 + u * 4)); cc.push(c.r, c.g, c.b); }
  cap.setAttribute('color', new THREE.Float32BufferAttribute(cc, 3)); cap.computeVertexNormals();
  s.add(new THREE.Mesh(cap, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 })));
  // Dover Castle keep and the flag
  const k = new THREE.Group(); k.add(LP.at(LP.box(5, 6, 5, '#b9b2a2'), 0, 3, 0));
  for (const [x, z] of [[-2.5, -2.5], [2.5, -2.5], [-2.5, 2.5], [2.5, 2.5]]) k.add(LP.at(LP.box(1.2, 7.2, 1.2, '#b0a998'), x, 3.6, z));
  for (let i = 0; i < 8; i++) k.add(LP.at(LP.box(0.6, 0.6, 0.6, '#b0a998'), -2.1 + i * 0.6, 6.3, 2.5));
  k.position.set(-14, top(-14) + 1.2, Z - 12); s.add(k);
  const f = N.flag('gb', 4.5, 2.2, 1.3); f.position.set(-14, top(-14) + 7.2, Z - 12); s.add(f); s.flag = f;
  return s;
}
// ---------------------------------------------------------------- open sea (battles, fleets)
export function openSea(light = 'day', { smoke = false } = {}) {
  const s = napoStage(light, [null, null], { seed: 61, groundA: null, fog: smoke ? ['#c8c4bc', 20, 120] : ['#dfe6ea', 60, 280] });
  sea(s, { color: '#3d7592', y: 0 });
  return s;
}
// ---------------------------------------------------------------- HMS Victory quarterdeck
export function deck(light = 'day') {
  const s = napoStage(light, [null, null], { seed: 71, groundA: null, fog: ['#c8c4bc', 18, 100] });
  sea(s, { color: '#3d7592', y: -3 });
  const plank = MX.canvasTex(256, 256, (g, W, H) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#b08a5a' : '#a47e50'; g.fillRect(0, i * H / 8, W, H / 8); g.fillStyle = '#6b4a2f'; g.fillRect(0, i * H / 8, W, 2); } });
  plank.wrapS = plank.wrapT = THREE.RepeatWrapping; plank.repeat.set(3, 6);
  const d = new THREE.Mesh(new THREE.PlaneGeometry(10, 24), new THREE.MeshStandardMaterial({ map: plank, roughness: 0.8 })); d.rotation.x = -Math.PI / 2; d.receiveShadow = true; s.add(d);
  for (const sd of [-1, 1]) { s.add(LP.at(LP.box(0.3, 1.1, 24, '#3a2a20'), sd * 5, 0.55, 0)); s.add(LP.at(LP.box(0.36, 0.12, 24, '#d8b04a'), sd * 5, 1.12, 0)); }
  s.add(LP.at(LP.cyl(0.32, 0.38, 30, '#5a3a24', 12), 0, 15, -4));
  const wheel = new THREE.Group(); wheel.position.set(0, 1.0, 2.6); s.add(wheel);
  const wr = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 8, 24), std('#6b4a2f')); wheel.add(wr);
  for (let i = 0; i < 8; i++) { const sp = LP.box(0.04, 1.4, 0.04, '#6b4a2f'); sp.rotation.z = i / 8 * Math.PI; wheel.add(sp); }
  s.add(LP.at(LP.box(0.2, 1.0, 0.2, '#5a3a24'), 0, 0.5, 2.6));
  for (const sd of [-1, 1]) for (const z of [-7, -3, 5]) { const c = N.fieldGun({ barrel: '#2a2a2a', carriage: '#6b2a22' }); c.position.set(sd * 4.2, 0, z); c.rotation.y = sd * Math.PI / 2; s.add(c); }
  const lines = []; for (const sd of [-1, 1]) for (let i = 0; i < 6; i++) lines.push(new THREE.Vector3(sd * 5, 1.1, -8 + i * 1.2), new THREE.Vector3(sd * 0.3, 26, -4));
  s.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lines), new THREE.LineBasicMaterial({ color: '#2a2018' })));
  return s;
}
// ---------------------------------------------------------------- Austerlitz: frosty hills at dawn
export function austerlitz() {
  const s = napoStage('sunrise', ['#8f9a6a', '#83905e'], { seed: 81, bumps: 1.2, sunPos: [-7, 5, -14], hemi: 1.45 });
  s.add(MX.sierra({ z: -80, depth: 50, height: 9, seed: 82, base: '#6f7a62', top: '#8a947a' }));
  const pr = new THREE.Mesh(new THREE.SphereGeometry(30, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2), std('#86915f')); pr.scale.set(1.6, 0.18, 1); pr.position.set(6, -0.5, -40); pr.receiveShadow = true; s.add(pr);
  s.hillY = (x, z) => { const a = (x - 6) / 48, b = (z + 40) / 30, q = 1 - a * a - b * b; return q > 0 ? -0.5 + 5.4 * Math.sqrt(q) : 0; };
  LP.scatter(s, (r, i) => LP.roundTree(1.2 + r() * 0.5, '#5f7f3a', i), 40, [-60, -60, 60, -20], 83);
  for (let i = 0; i < 6; i++) { const h = LP.house(2, 2, 1.4, '#e8dcc4', '#8a4a32'); h.position.set(-30 + i * 2.6, 0, -26 - (i % 2) * 2); s.add(h); }
  const sunDisk = new THREE.Mesh(new THREE.CircleGeometry(6, 32), new THREE.MeshBasicMaterial({ color: '#ffe2b0', fog: false })); sunDisk.position.set(-60, 14, -160); sunDisk.lookAt(0, 0, 0); s.add(sunDisk); s.sunDisk = sunDisk;
  const fogLayer = new THREE.Mesh(new THREE.PlaneGeometry(220, 70), new THREE.MeshBasicMaterial({ color: '#f2ece2', transparent: true, opacity: 0.55, depthWrite: false })); fogLayer.rotation.x = -Math.PI / 2; fogLayer.position.set(0, 1.4, -70); s.add(fogLayer); s.fogLayer = fogLayer;
  return s;
}
// ---------------------------------------------------------------- Tilsit raft on the Niemen
export function tilsit() {
  const s = napoStage('day', ['#7f9a52', '#708c48'], { seed: 91 });
  const river = LP.strip([[-200, 0], [200, 0]], 26, '#4f87a2', 0.03, { roughness: 0.25 }); s.add(river);
  const raft = new THREE.Group(); s.add(raft); s.raft = raft;
  for (let i = 0; i < 12; i++) raft.add(LP.at(LP.cyl(0.18, 0.18, 7, '#8a6a42', 8), -3.3 + i * 0.6, 0.12, 0, Math.PI / 2, 0, 0));
  raft.add(LP.at(LP.box(7.4, 0.12, 7.2, '#a07c4e'), 0, 0.3, 0));
  const pav = new THREE.Group(); pav.position.set(0, 0.36, -1.4); raft.add(pav);
  pav.add(LP.at(LP.box(4.2, 2.6, 2.4, '#f3eee2'), 0, 1.3, 0));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.1, 1.4, 4), std('#f3eee2')); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.62); roof.position.y = 3.3; pav.add(roof);
  pav.add(LP.at(LP.box(4.3, 0.18, 2.5, '#d4af37'), 0, 2.62, 0));
  const shield = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), new THREE.MeshStandardMaterial({ map: MX.canvasTex(128, 128, (g, W) => { g.fillStyle = '#2a3f8f'; g.fillRect(0, 0, W, W); g.fillStyle = '#d4af37'; g.font = '900 90px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('N', W / 2, W / 2 + 4); }) }));
  shield.position.set(0, 3.4, 0.75); pav.add(shield);
  const door = LP.box(1.1, 2.0, 0.05, '#8a2a2a'); door.position.set(0, 1.0, 1.22); pav.add(door); pav.add(LP.at(LP.box(1.3, 0.12, 0.08, '#d4af37'), 0, 2.05, 1.24));
  s.flags = [];
  for (const [x, k] of [[-3.3, 'fr'], [3.3, 'ru']]) { const f = N.flag(k, 3.2, 1.2, 0.75); f.position.set(x, 0.36, -3.2); raft.add(f); s.flags.push(f); }
  for (const sd of [-1, 1]) LP.scatter(s, (r, i) => LP.roundTree(1.1 + r() * 0.5, '#5f8f3a', i), 30, [-50, sd * 16, 50, sd * 34], 92 + sd);
  return s;
}
// ---------------------------------------------------------------- strategy board (tactics)
export function board() {
  const s = interior({ wall: '#3a2a22', floor: '#2a1e16', w: 14, d: 12, h: 9, lights: [[0, 5.5, 0]], windows: false, bulbs: false });
  s.userData.sun.intensity = 0.9; s.userData.sun.position.set(2, 10, 4);
  const top = MX.canvasTex(1024, 640, (g, W, H) => {
    g.fillStyle = '#7f9a5a'; g.fillRect(0, 0, W, H);
    const r = LP.rng(7); for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${60 + r() * 40},${90 + r() * 40},${40 + r() * 30},0.25)`; g.beginPath(); g.arc(r() * W, r() * H, 10 + r() * 40, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = '#4f87a2'; g.lineWidth = 14; g.beginPath(); g.moveTo(W * 0.62, 0); g.bezierCurveTo(W * 0.58, H * 0.3, W * 0.72, H * 0.6, W * 0.66, H); g.stroke();
    g.fillStyle = 'rgba(110,100,70,0.35)'; for (const [x, y, rr] of [[0.75, 0.3, 90], [0.8, 0.72, 70], [0.2, 0.2, 60]]) { g.beginPath(); g.arc(x * W, y * H, rr, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = 'rgba(80,60,40,0.85)'; g.lineWidth = 6; g.setLineDash([18, 12]);
    for (const [x0, y0] of [[0.05, 0.1], [0.05, 0.38], [0.05, 0.62], [0.05, 0.9]]) { g.beginPath(); g.moveTo(x0 * W, y0 * H); g.quadraticCurveTo(W * 0.35, y0 * H * 0.5 + H * 0.25, W * 0.74, H * 0.5); g.stroke(); }
  });
  const table = new THREE.Group(); s.add(table); s.table = table;
  table.add(LP.at(LP.box(9.2, 0.3, 5.9, '#5a3a24'), 0, 0.85, 0));
  const tt = new THREE.Mesh(new THREE.PlaneGeometry(8.8, 5.5), new THREE.MeshStandardMaterial({ map: top, roughness: 0.95 })); tt.rotation.x = -Math.PI / 2; tt.position.y = 1.005; tt.receiveShadow = true; table.add(tt);
  for (const [x, z] of [[-4.3, -2.6], [4.3, -2.6], [-4.3, 2.6], [4.3, 2.6]]) table.add(LP.at(LP.box(0.3, 0.85, 0.3, '#4a2f1d'), x, 0.42, z));
  return s;
}
// wooden unit block with a little flag (board pieces)
export function block(color = '#2f4590', flagCol = '#f4f1ea', label = '') {
  const g = new THREE.Group();
  g.add(LP.at(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.28, 0.42), std(color, { roughness: 0.6 })), 0, 0.14, 0));
  g.add(LP.at(LP.cyl(0.012, 0.012, 0.5, '#3a2a1e', 5), -0.25, 0.5, 0));
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.16), new THREE.MeshStandardMaterial({ map: MX.canvasTex(64, 40, (c, W, H) => { c.fillStyle = flagCol; c.fillRect(0, 0, W, H); if (label) { c.fillStyle = '#1d1b1c'; c.font = '800 26px Georgia'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, W / 2, H / 2 + 2); } }), side: THREE.DoubleSide }));
  fl.position.set(-0.12, 0.66, 0); g.add(fl);
  return g;
}
// ---------------------------------------------------------------- open battlefield
export function field(light = 'day', { ground = ['#8fa65a', '#7d9450'], seed = 101, trees = true, smoke = false } = {}) {
  const s = napoStage(light, ground, { seed, bumps: 0.6, ...(smoke ? { fog: ['#cfcac0', 18, 110] } : {}) });
  s.add(MX.sierra({ z: -90, depth: 50, height: 8, seed: seed + 1, base: '#6f7a62', top: '#8a947a' }));
  if (trees) LP.scatter(s, (r, i) => LP.roundTree(1.2 + r() * 0.5, '#5f7f3a', i), 50, [-70, -70, 70, -24], seed + 2);
  return s;
}
// ---------------------------------------------------------------- Napoleon's tent
export function tent() {
  const s = interior({ wall: '#e8dcc0', floor: '#7a6448', w: 8, d: 7, h: 4, lights: [[0, 2.4, 0.5]], windows: false, bulbs: false });
  s.userData.sun.intensity = 0.4; s.userData.hemi.intensity = 0.7;
  const t = N.pedestalTable('#5a3a24', '#e8dcc0', 2.6, 1.5); t.position.set(0, 0, -0.6); t.scale.y = 0.62; s.add(t); s.tableTop = 0.53;
  const map = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.3), new THREE.MeshStandardMaterial({ map: MX.canvasTex(512, 300, (g, W, H) => { g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, W, H); g.strokeStyle = '#6b4a2f'; g.lineWidth = 3;
    const rr = LP.rng(17); for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(rr() * W, rr() * H); g.bezierCurveTo(rr() * W, rr() * H, rr() * W, rr() * H, rr() * W, rr() * H); g.stroke(); }
    g.fillStyle = '#2f4590'; for (let i = 0; i < 6; i++) g.fillRect(80 + i * 50, 120 + (i % 2) * 30, 26, 14); g.fillStyle = '#c0272d'; for (let i = 0; i < 4; i++) g.fillRect(330 + i * 30, 90 + (i % 2) * 50, 26, 14); }), roughness: 0.9 }));
  map.rotation.x = -Math.PI / 2; map.position.set(0, 0.535, -0.6); s.add(map);
  for (const x of [-1.0, 1.0]) { const c = MX.campfire ? null : null; const cd = new THREE.Group(); cd.add(LP.at(LP.cyl(0.04, 0.05, 0.28, '#f3ead6', 8), 0, 0.14, 0));
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffcf6a' })); fl.scale.y = 1.8; fl.position.y = 0.32; cd.add(fl); cd.position.set(x, 0.535, -0.3); s.add(cd); }
  const l = new THREE.PointLight('#ffb862', 6, 8, 1.5); l.position.set(0, 1.6, 0); s.add(l);
  return s;
}
// ---------------------------------------------------------------- Spain: Madrid street, mountain pass, throne room
export function madrid(light = 'day') {
  const s = napoStage(light, ['#c9b48e', '#bba680'], { seed: 111 });
  for (let i = 0; i < 6; i++) { const a = N.spanishHouse(3.2, 3.6 + (i % 2) * 0.6, ['#efe6d2', '#e8d8b8', '#f2e8d8'][i % 3], i); a.position.set(-5.5, 0, 8 - i * 3.4); a.rotation.y = Math.PI / 2; s.add(a);
    const b = N.spanishHouse(3.2, 3.4 + ((i + 1) % 2) * 0.7, ['#e8d8b8', '#f2e8d8', '#efe6d2'][i % 3], i + 9); b.position.set(5.5, 0, 8 - i * 3.4); b.rotation.y = -Math.PI / 2; s.add(b); }
  const ch = new THREE.Group(); ch.add(LP.at(LP.box(5, 6, 4, '#e2d2b2'), 0, 3, 0)); ch.add(LP.at(LP.box(1.8, 4, 1.8, '#e2d2b2'), -1.6, 8, 0.8));
  const dm = new THREE.Mesh(new THREE.SphereGeometry(1.3, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), std('#6a7484')); dm.position.set(0.8, 6, -0.4); ch.add(dm); ch.position.set(0, 0, -16); s.add(ch);
  return s;
}
export function sierraPass() {
  const s = napoStage('golden', ['#b8a07a', '#a89070'], { seed: 121 });
  s.add(MX.sierra({ z: -70, depth: 50, height: 18, seed: 122, base: '#8a7a62', top: '#a89878' }));
  for (const sd of [-1, 1]) { const ridge = MX.sierra({ x0: -60, x1: 60, z: sd * 18, depth: 10, height: 7, seed: 123 + sd, base: '#9a8466', top: '#b49c78', segX: 80 }); s.add(ridge); }
  s.add(LP.strip([[-60, 0.5], [0, 0], [60, -0.5]], 3.2, '#a88e66', 0.012));
  for (const [x, z, k] of [[-2.1, -4.4, 0.62], [0.4, -4.6, 0.7], [2.9, -4.3, 0.6], [5.3, -4.5, 0.66], [-4.6, -4.5, 0.7]]) { const b = MX.boulder(k, x * 7 | 0, '#9a8064'); b.position.set(x, 0.1, z); s.add(b); }
  LP.scatter(s, (r, i) => (i % 2 ? MX.shrub(0.8 + r() * 0.4, i, '#7d8a4e') : LP.pine(1.2 + r() * 0.5, '#3f5a3a', i)), 40, [-40, -30, 40, -6], 124, [[0, -4, 7]]);
  return s;
}
export function palaceES() {
  const s = interior({ wall: '#8a1f2a', floor: '#5a3a24', w: 12, d: 9, h: 5.2, lights: [[-2.5, 4.3, 0.5], [2.5, 4.3, 0.5]], windows: false });
  s.add(LP.at(LP.box(4.6, 0.36, 2.4, '#8a1f2a'), 0, 0.18, -3.2)); s.add(LP.at(LP.box(4.64, 0.05, 0.05, '#c9a227'), 0, 0.36, -2.0));
  const th = N.throne({ fabric: '#8a1f2a' }); th.position.set(0, 0.36, -3.5); s.add(th);
  for (const x of [-4.2, 4.2]) { const d = N.drape('es', 1.4, 3.8); d.position.set(x, 2.4, -4.4); s.add(d); }
  const arms = new THREE.Mesh(new THREE.CircleGeometry(0.9, 32), new THREE.MeshStandardMaterial({ map: MX.canvasTex(256, 256, (g, W) => { g.fillStyle = '#c9a227'; g.beginPath(); g.arc(W / 2, W / 2, W / 2, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#c60b1e'; g.fillRect(W * 0.25, W * 0.25, W * 0.25, W * 0.25); g.fillRect(W * 0.5, W * 0.5, W * 0.25, W * 0.25); g.fillStyle = '#f6f3ea'; g.fillRect(W * 0.5, W * 0.25, W * 0.25, W * 0.25); g.fillRect(W * 0.25, W * 0.5, W * 0.25, W * 0.25); }) }));
  arms.position.set(0, 4.0, -4.45); s.add(arms);
  return s;
}
// ---------------------------------------------------------------- Dolores, Nueva España, night of 15–16 Sep 1810
export function doloresSet() {
  const s = napoStage('night', ['#7a6a52', '#6a5a46'], { seed: 131, hemi: 0.95, sun: 0.9, fog: ['#1a1e2e', 30, 120] });
  const ch = N.dolores(); ch.position.set(0, 0, -6); s.add(ch); s.church = ch;
  const lantern = new THREE.PointLight('#ffb060', 10, 9, 1.4); lantern.position.set(4.2, 10.6, -3.6); s.add(lantern); s.lantern = lantern;
  for (let i = 0; i < 4; i++) { const h = MX.adobe(3, 2.4, 2.2, ['#d9b48a', '#c9967a', '#d6c08f', '#e2c9a2'][i], i); h.position.set(-14 + i * 4, 0, -2 - (i % 2)); h.rotation.y = 0.2; s.add(h); }
  const moon = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 12), new THREE.MeshBasicMaterial({ color: '#f3ecd6', fog: false })); moon.position.set(-40, 40, -120); s.add(moon);
  s.glow = []; for (const [x, z] of [[-3, 3], [3, 2.5], [0, 5]]) { const l = new THREE.PointLight('#ffa040', 6, 10, 1.6); l.position.set(x, 1.8, z); s.add(l); s.glow.push(l); }
  return s;
}
// ---------------------------------------------------------------- palace interiors
export function palaceFR(wall = '#efe6d2', { imperial = false } = {}) {
  const s = interior({ wall, floor: '#7a5a3a', w: 12, d: 9, h: 5.2, lights: [[-2.5, 4.3, 0.5], [2.5, 4.3, 0.5]], windows: !imperial });
  for (const x of [-5.95, 5.95]) for (let i = 0; i < 3; i++) s.add(LP.at(LP.box(0.06, 4.6, 0.2, '#c9a227'), x * 0.999, 2.4, -3 + i * 3));
  const c = N.chandelier(); c.position.set(0, 4.0, 0); s.add(c);
  const th = N.throne({ fabric: imperial ? '#8a1f2a' : '#1f3f8f' }); th.position.set(0, imperial ? 0.3 : 0, -3.7); s.add(th); s.throne = th;
  if (imperial) {
    s.add(LP.at(LP.box(4.4, 0.3, 2.2, '#8a1f2a'), 0, 0.15, -3.5)); s.add(LP.at(LP.box(4.44, 0.05, 0.05, '#d4af37'), 0, 0.3, -2.4)); s.add(LP.at(LP.box(4.44, 0.05, 0.05, '#d4af37'), 0, 0.05, -2.4));
    const tex = MX.canvasTex(512, 640, (g, W, H) => {
      const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, '#5e0f18'); gr.addColorStop(0.5, '#9a1b2a'); gr.addColorStop(1, '#5e0f18'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(0,0,0,0.18)'; for (let i = 0; i < 9; i++) g.fillRect(i * W / 9, 0, 6, H);
      g.fillStyle = '#d4af37'; for (let j = 0; j < 7; j++) for (let i = 0; i < 6; i++) { if (j < 4 && i > 0 && i < 5) continue; const x = (i + 0.5 + (j % 2) * 0.25) * W / 6, y = (j + 0.5) * H / 7;
        g.beginPath(); g.ellipse(x, y, 7, 11, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(x - 9, y - 6, 8, 4, -0.5, 0, Math.PI * 2); g.ellipse(x + 9, y - 6, 8, 4, 0.5, 0, Math.PI * 2); g.fill(); }
      g.strokeStyle = '#d4af37'; g.lineWidth = 10; g.beginPath(); g.arc(W / 2, H * 0.3, 150, Math.PI * 0.62, Math.PI * 2.38); g.stroke();
      for (let k = 0; k < 18; k++) { const a = Math.PI * 0.66 + k / 17 * Math.PI * 1.68; for (const sd of [-1, 1]) { g.save(); g.translate(W / 2 + Math.cos(a) * 150, H * 0.3 + Math.sin(a) * 150); g.rotate(a + sd * 0.9); g.beginPath(); g.ellipse(0, 0, 22, 8, 0, 0, Math.PI * 2); g.fill(); g.restore(); } }
      g.font = '900 210px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('N', W / 2, H * 0.3 + 12);
      g.lineWidth = 12; g.strokeRect(14, 14, W - 28, H - 28); });
    const back = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 5.0), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 })); back.position.set(0, 2.6, -4.46); s.add(back);
    const crownTop = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.5, 32, 1, true, -Math.PI / 2, Math.PI), std('#8a1f2a', { side: THREE.DoubleSide })); crownTop.position.set(0, 5.0, -4.5); s.add(crownTop);
    s.add(LP.at(LP.box(5.2, 0.14, 0.2, '#d4af37'), 0, 4.75, -2.05));
    for (const x of [-2.9, 2.9]) { const d = N.drape('bees', 1.2, 4.6); d.position.set(x, 2.5, -4.42); s.add(d); }
  }
  return s;
}
// ---------------------------------------------------------------- Russia
export function niemen() {
  const s = napoStage('day', ['#7f9a52', '#708c48'], { seed: 141 });
  s.add(LP.strip([[-200, 2], [200, 2]], 14, '#4f87a2', 0.03, { roughness: 0.25 }));
  s.bridges = [];
  for (const x of [-7, 0, 7]) { const b = new THREE.Group(); b.position.set(x, 0, 2); s.add(b); s.bridges.push(b);
    for (let i = 0; i < 6; i++) b.add(LP.at(LP.box(1.4, 0.35, 0.9, '#5a4632'), 0, 0.12, -6 + i * 2.4));
    b.add(LP.at(LP.box(1.8, 0.1, 15, '#a07c4e'), 0, 0.42, 0)); }
  LP.scatter(s, (r, i) => (i % 3 ? LP.birch(1.3 + r() * 0.5, i) : LP.pine(1.3 + r() * 0.5, '#2f4a3a', i)), 60, [-60, -60, 60, -14], 142);
  return s;
}
export function russianVillage(light = 'overcast') {
  const s = napoStage(light, ['#8a9a62', '#7a8a56'], { seed: 151 });
  s.houses = [];
  for (const [x, z, r] of [[-7, -6, 0.2], [-2, -9, 0.0], [3.5, -7, -0.25], [9, -9, -0.1], [-12, -10, 0.3]]) { const h = N.izba(x | 0); h.position.set(x, 0, z); h.rotation.y = r; s.add(h); s.houses.push(h); }
  for (const [x, z] of [[-4.5, -2.5], [6, -3]]) { const hs = N.haystack(1); hs.position.set(x, 0, z); s.add(hs); }
  LP.scatter(s, (r, i) => LP.birch(1.3 + r() * 0.5, i), 50, [-60, -60, 60, -14], 152);
  return s;
}
export function borodino() {
  const s = field('overcast', { ground: ['#8a8a5a', '#7a7a50'], seed: 161, smoke: true });
  const red = new THREE.Shape(); red.moveTo(-6, 0); red.lineTo(6, 0); red.lineTo(4, 1.6); red.lineTo(-4, 1.6);
  const rg = new THREE.ExtrudeGeometry(red, { depth: 2.4, bevelEnabled: false }); rg.translate(0, 0, -1.2);
  const rm = new THREE.Mesh(rg, std('#7a6a4a', { flatShading: true })); rm.position.set(0, 0, -10); s.add(rm);
  s.guns = []; for (let i = 0; i < 4; i++) { const c = N.fieldGun({ barrel: '#3a3a36', carriage: '#3f5a3a' }); c.position.set(-3 + i * 2, 1.6, -9.2); s.add(c); s.guns.push(c); }
  return s;
}
export function moscow() {
  const s = napoStage('fire', ['#3a3a36', '#33332f'], { seed: 171 });
  const wall = N.kremlinWall(40, 4.5); wall.position.set(0, 0, -22); s.add(wall);
  const spots = [[-10, -30, { r: 1.4, color: '#d4af37', h: 9 }], [-4, -32, { r: 1.8, color: '#d4af37', h: 11 }], [3, -30, { r: 1.2, color: '#d4af37', h: 8 }],
    [10, -28, { r: 1.0, color: '#2a6ab8', h: 6, stripes: ['#2a6ab8', '#f3eee2'] }], [13, -26, { r: 0.9, color: '#c0272d', h: 5, stripes: ['#c0272d', '#2f7a4a'] }], [16, -28, { r: 1.0, color: '#e8b84a', h: 6, stripes: ['#e8b84a', '#2f7a4a'] }]];
  for (const [x, z, o] of spots) { const d = N.onion(o); d.position.set(x, 0, z); s.add(d); }
  const bell = new THREE.Group(); bell.add(LP.at(LP.box(3, 18, 3, '#f0ebe0'), 0, 9, 0)); const top = N.onion({ r: 1.6, h: 0.2 }); top.position.y = 18; bell.add(top); bell.position.set(-1, 0, -38); s.add(bell);
  for (let i = 0; i < 8; i++) { const h = N.townhouseFR(3.2, 3.4, ['#c9b8a0', '#b8a890'][i % 2], i); h.position.set(-24 + i * 6.5, 0, -12 - (i % 3) * 2); s.add(h); }
  s.fires = []; for (const [x, z] of [[-14, -14], [-5, -16], [8, -15], [18, -13], [-20, -26], [22, -24]]) { const l = new THREE.PointLight('#ff7a30', 30, 30, 1.6); l.position.set(x, 4, z); s.add(l); s.fires.push(l); }
  return s;
}
export function winterPalace() {
  const s = interior({ wall: '#3f6a52', floor: '#6b4a2f', w: 12, d: 9, h: 5.2, lights: [[-2.5, 4.3, 0.5], [2.5, 4.3, 0.5]] });
  for (const x of [-5.95, 5.95]) for (let i = 0; i < 3; i++) s.add(LP.at(LP.box(0.06, 4.6, 0.25, '#e8e2d4'), x * 0.999, 2.4, -3 + i * 3));
  const c = N.chandelier(); c.position.set(0, 4.0, 0); s.add(c);
  const t = N.pedestalTable('#5a3a24', '#2f5a3a', 2.0, 1.1); t.position.set(0.6, 0, -1.0); s.add(t);
  const letter = new THREE.Group(); letter.add(LP.at(LP.box(0.36, 0.01, 0.24, '#f3ead6'), 0, 0, 0)); letter.add(LP.at(LP.cyl(0.04, 0.04, 0.012, '#c0272d', 12), 0, 0.01, 0)); letter.position.set(0.5, 0.85, -0.9); letter.rotation.y = 0.3; s.add(letter); s.letter = letter;
  return s;
}
export function snowPlain(light = 'snow') {
  const s = napoStage(light, ['#e8edf2', '#dde3ea'], { seed: 181, bumps: 0.8 });
  LP.scatter(s, (r, i) => (i % 3 ? LP.birch(1.3 + r() * 0.5, i) : LP.pine(1.3 + r() * 0.6, '#2b4a3a', i)), 90, [-60, -60, 60, 40], 182, [[0, 0, 9], [0, 12, 8]]);
  s.traverse(o => { if (o.isMesh && o.geometry?.type === 'IcosahedronGeometry') o.material = LP.mat('#dde5e8'); });
  return s;
}
// ---------------------------------------------------------------- Paris 1814, Fontainebleau, Elba, Saint Helena, Vienna
export function paris1814() {
  const s = napoStage('overcast', ['#b0a894', '#a29a86'], { seed: 191 });
  for (let i = 0; i < 6; i++) { const a = N.townhouseFR(3.4, 4.4, ['#e2d6bf', '#d8c8a8', '#e8dcc4'][i % 3], i); a.position.set(-6, 0, 8 - i * 3.6); a.rotation.y = Math.PI / 2; s.add(a);
    const b = N.townhouseFR(3.4, 4.2, ['#d8c8a8', '#e8dcc4', '#e2d6bf'][i % 3], i + 7); b.position.set(6, 0, 8 - i * 3.6); b.rotation.y = -Math.PI / 2; s.add(b); }
  const nd = new THREE.Group(); for (const x of [-2.6, 2.6]) nd.add(LP.at(LP.box(3.4, 14, 3.4, '#c9bfa8'), x, 7, 0)); nd.add(LP.at(LP.box(9, 9, 3, '#c9bfa8'), 0, 4.5, 0.2));
  const roseTex = MX.canvasTex(256, 256, (g, W) => { const c = W / 2; g.fillStyle = '#c9bfa8'; g.fillRect(0, 0, W, W); g.fillStyle = '#34406e'; g.beginPath(); g.arc(c, c, 122, 0, 7); g.fill();
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; g.fillStyle = ['#8a2f3f', '#3a64a8', '#c9a23a', '#3a64a8'][i % 4]; g.beginPath(); g.arc(c + Math.cos(a) * 88, c + Math.sin(a) * 88, 21, 0, 7); g.fill(); }
    for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * Math.PI * 2; g.fillStyle = ['#c9a23a', '#8a2f3f'][i % 2]; g.beginPath(); g.arc(c + Math.cos(a) * 48, c + Math.sin(a) * 48, 15, 0, 7); g.fill(); }
    g.fillStyle = '#c9a23a'; g.beginPath(); g.arc(c, c, 17, 0, 7); g.fill(); g.strokeStyle = '#c9bfa8'; g.lineWidth = 5;
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; g.beginPath(); g.moveTo(c + Math.cos(a) * 26, c + Math.sin(a) * 26); g.lineTo(c + Math.cos(a) * 122, c + Math.sin(a) * 122); g.stroke(); }
    g.lineWidth = 9; g.beginPath(); g.arc(c, c, 66, 0, 7); g.stroke(); g.lineWidth = 12; g.beginPath(); g.arc(c, c, 122, 0, 7); g.stroke(); });
  const rose = new THREE.Mesh(new THREE.CircleGeometry(1.4, 32), new THREE.MeshStandardMaterial({ map: roseTex, roughness: 0.5, emissive: '#ffffff', emissiveMap: roseTex, emissiveIntensity: 0.25 })); rose.position.set(0, 6.4, 1.75); nd.add(rose); nd.position.set(0, 0, -26); s.add(nd);
  return s;
}
export function elba(light = 'day') {
  const s = napoStage(light, [null, null], { seed: 201, groundA: null, fog: ['#dfe6ea', 80, 360] });
  sea(s, { color: '#3f86a6', y: 0, size: 900 });
  const isl = rockIsland(15, 5, 9, { rock: '#8a7a68', grass: '#7d9a52' }); s.add(isl); s.island = isl;
  const villa = new THREE.Group(); villa.add(LP.at(LP.box(4, 2.4, 2.6, '#efe2c8'), 0, 1.2, 0)); villa.add(LP.at(LP.box(4.4, 0.4, 3, '#b5603f'), 0, 2.6, 0));
  for (let i = 0; i < 4; i++) villa.add(LP.at(LP.box(0.45, 0.8, 0.05, '#3a3e48'), -1.4 + i * 0.95, 1.3, 1.32));
  villa.add(LP.at(LP.box(4.1, 3, 2.7, '#cdbf9e'), 0, -1.5, 0)); const vy = Math.min(...[[-2, 0], [2, 0], [0, -1.3], [0, 1.3]].map(([dx, dz]) => isl.heightAt(-2 + dx, -2 + dz)));
  villa.position.set(-2, vy, -2); s.add(villa);
  for (let i = 0; i < 18; i++) { const r = LP.rng(i + 70); const x = -10 + r() * 18, z = -8 + r() * 14, y = isl.heightAt(x, z); if (y < 3 || Math.hypot(x + 2, z + 2) < 3) continue; const t = LP.pine(1.1 + r() * 0.4, '#3f6b3a', i); t.position.set(x, y - 0.1, z); s.add(t); }
  return s;
}
// Rocky island: a noisy heightfield with steep cliffs, rock-coloured sides and a green top. Returns a mesh with .heightAt(x, z).
export function rockIsland(R = 14, H = 6, seed = 3, { rock = '#6a5648', grass = '#6f7f48' } = {}) {
  const g = new THREE.PlaneGeometry(R * 2.6, R * 2.6, 120, 120); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position, r = LP.rng(seed), ph = [...Array(6)].map(() => r() * 6.28), cols = [], A = new THREE.Color(rock), B = new THREE.Color(grass), c = new THREE.Color();
  const hAt = (x, z) => { const a = Math.atan2(z, x), d = Math.hypot(x, z) / R;
    const edge = 1 + 0.12 * Math.sin(a * 3 + ph[0]) + 0.07 * Math.sin(a * 7 + ph[1]) + 0.04 * Math.sin(a * 13 + ph[2]);
    const k = d / edge; if (k > 1.15) return -1.5;
    const cliff = 1 - Math.min(1, Math.max(0, (k - 0.82) / 0.2)); const top = 1 + 0.25 * Math.sin(x * 0.35 + ph[3]) * Math.cos(z * 0.3 + ph[4]) + 0.15 * Math.sin(x * 0.9 + z * 0.7 + ph[5]);
    return -1.5 + (H + 1.5) * Math.pow(cliff, 0.6) * (k < 0.82 ? top * (1 - 0.25 * k) : 0.75 + 0.25 * top); };
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = hAt(x, z); p.setY(i, y); }
  g.computeVertexNormals(); const n = g.attributes.normal;
  for (let i = 0; i < p.count; i++) { const up = n.getY(i), y = p.getY(i); c.copy(A).lerp(B, up > 0.7 && y > H * 0.35 ? 1 : 0).offsetHSL(0, 0, (r() - 0.5) * 0.04); cols.push(c.r, c.g, c.b); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true })); m.receiveShadow = true; m.castShadow = true;
  m.heightAt = hAt; return m;
}
export function stHelena() {
  const s = napoStage('dusk', [null, null], { seed: 211, groundA: null, fog: ['#c98a66', 90, 420], sunPos: [-10, 6, -16] });
  sea(s, { color: '#2f5a74', y: 0, size: 900 });
  const isl = rockIsland(16, 7, 5); s.add(isl); s.island = isl;
  const house = new THREE.Group(); house.add(LP.at(LP.box(4, 1.8, 2.4, '#e8dcc4'), 0, 0.9, 0)); house.add(LP.at(LP.box(4.3, 0.3, 2.7, '#7a4a32'), 0, 1.95, 0));
  for (let i = 0; i < 4; i++) house.add(LP.at(LP.box(0.4, 0.7, 0.05, '#3a3e48'), -1.4 + i * 0.95, 0.95, 1.22));
  house.add(LP.at(LP.box(4.1, 3, 2.5, '#b8ab90'), 0, -1.5, 0)); const hy = Math.min(...[[-2, 0], [2, 0], [0, -1.2], [0, 1.2]].map(([dx, dz]) => isl.heightAt(-4 + dx, 2 + dz)));
  house.position.set(-4, hy, 2); s.add(house);
  for (let i = 0; i < 14; i++) { const r = LP.rng(i + 40); const x = -9 + r() * 14, z = -4 + r() * 10, y = isl.heightAt(x, z); if (y < 4) continue; const t = LP.roundTree(0.9 + r() * 0.4, '#4f6f3a', i); t.position.set(x, y - 0.1, z); s.add(t); }
  return s;
}
export function vienna() {
  const s = interior({ wall: '#f0e8d8', floor: '#8a6a4a', w: 14, d: 10, h: 6, lights: [[-3, 4.8, 0], [3, 4.8, 0]] });
  for (const x of [-6.95, 6.95]) for (let i = 0; i < 4; i++) s.add(LP.at(LP.box(0.06, 5.4, 0.25, '#d4af37'), x * 0.999, 2.8, -4 + i * 2.6));
  for (const x of [-3, 3]) { const c = N.chandelier(); c.position.set(x, 4.6, 0); s.add(c); }
  const t = N.pedestalTable('#5a3a24', '#2f5a3a', 3.8, 1.3); t.position.set(0, 0, -0.6); t.scale.y = 0.62; s.add(t); s.table = t;
  return s;
}
export function memorial() {
  const s = napoStage('dusk', ['#6a6a4a', '#5e5e42'], { seed: 221, fog: ['#b98a6a', 20, 110] });
  for (let i = 0; i < 40; i++) { const r = LP.rng(i + 3); const c = N.cross(i); c.position.set(-12 + (i % 8) * 3.2 + (r() - 0.5), 0, -3 - Math.floor(i / 8) * 3 + (r() - 0.5)); s.add(c); }
  return s;
}
export function codeRoom() {
  const s = interior({ wall: '#3a2a22', floor: '#2a1e16', w: 8, d: 7, h: 4, lights: [[0, 2.6, 1.2]], windows: false, bulbs: false });
  s.userData.sun.intensity = 0.35;
  const ped = MX.pedestal('1804', 'Código Napoleónico'); ped.position.set(0, 0, -0.6); s.add(ped);
  const bk = N.book(); bk.position.set(0, ped.top + 0.02, -0.6); s.add(bk);
  const spot = new THREE.SpotLight('#fff1d0', 40, 12, 0.45, 0.5, 1.2); spot.position.set(0.5, 4, 2); spot.target.position.set(0, 1, -0.6); s.add(spot, spot.target);
  return s;
}
// Laffrey: alpine meadow road
export function laffrey() {
  const s = napoStage('day', ['#8fa65a', '#7d9450'], { seed: 231 });
  s.add(MX.sierra({ z: -90, depth: 60, height: 26, seed: 232, base: '#7d8a8a', top: '#eef2f4' }));
  s.add(LP.strip([[0, 30], [0, 0], [-3, -30], [-10, -70]], 3.4, '#b8a070', 0.012));
  LP.scatter(s, (r, i) => LP.pine(1.3 + r() * 0.6, '#2f5a3a', i), 60, [-50, -60, 50, -10], 233, [[0, -20, 6]]);
  return s;
}
// Waterloo: wheat fields, ridge and a farm (Hougoumont)
export function waterloo(light = 'overcast') {
  const s = field(light, { ground: ['#9aa060', '#8a9056'], seed: 241, smoke: true });
  s.add(MX.field(-30, -26, -6, -10, { kind: 'corn', seed: 242, spacing: 0.55, height: 1.3 }));
  const farm = new THREE.Group(); farm.add(LP.at(LP.box(12, 2.2, 0.5, '#d8cbb0'), 0, 1.1, 0)); farm.add(LP.at(LP.box(0.5, 2.2, 8, '#d8cbb0'), -6, 1.1, -4)); farm.add(LP.at(LP.box(0.5, 2.2, 8, '#d8cbb0'), 6, 1.1, -4));
  const hb = LP.house(4, 3, 2.6, '#e2d4b8', '#8a4a32'); hb.position.set(0, 0, -4); farm.add(hb); farm.position.set(14, 0, -22); s.add(farm);
  return s;
}
// Night sea with moon
export function nightSea() {
  const s = napoStage('night', [null, null], { seed: 251, groundA: null, fog: ['#1f2a44', 50, 220], hemi: 1.15, sun: 1.1, skyHor: '#2a3a60' });
  sea(s, { color: '#24405e', y: 0 });
  const moon = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 12), new THREE.MeshBasicMaterial({ color: '#f3ecd6', fog: false })); moon.position.set(30, 30, -120); s.add(moon);
  const glint = new THREE.Mesh(new THREE.PlaneGeometry(6, 80), new THREE.MeshBasicMaterial({ color: '#c8d4ea', transparent: true, opacity: 0.18, depthWrite: false })); glint.rotation.x = -Math.PI / 2; glint.position.set(14, 0.3, -60); s.add(glint);
  const isl = new THREE.Mesh(new THREE.SphereGeometry(16, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), std('#232a2e', { flatShading: true })); isl.scale.set(1.4, 0.35, 1); isl.position.set(-30, -0.5, -50); s.add(isl);
  return s;
}
// Leipzig: town on the horizon
export function leipzig() {
  const s = field('overcast', { ground: ['#8a9a5a', '#7a8a50'], seed: 261, smoke: true, trees: false });
  const town = new THREE.Group();
  for (let i = 0; i < 9; i++) { const h = LP.house(2.2, 2.2, 1.8 + (i % 3) * 0.4, '#e2d4b8', '#8a4a32'); h.position.set(-12 + i * 3, 0, (i % 2) * 2); town.add(h); }
  const st = new THREE.Group(); st.add(LP.at(LP.box(1.6, 8, 1.6, '#cfc0a2'), 0, 4, 0)); const sp = new THREE.Mesh(new THREE.ConeGeometry(1.1, 3.2, 8), std('#4f6f6a')); sp.position.y = 9.6; st.add(sp); st.position.set(2, 0, -2); town.add(st);
  town.position.set(0, 0, -34); s.add(town);
  return s;
}
