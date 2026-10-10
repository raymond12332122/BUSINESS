// Low-poly stylized props and environment pieces.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

const matCache = new Map();
export function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, flatShading: true, ...opts }));
  return matCache.get(key);
}

function mesh(geo, m, shadow = true) {
  const o = new THREE.Mesh(geo, typeof m === 'object' && m.isMaterial ? m : mat(m));
  o.castShadow = shadow; o.receiveShadow = true; return o;
}
const box = (w, h, d, c) => mesh(new THREE.BoxGeometry(w, h, d), c);
const cyl = (rt, rb, h, c, seg = 10) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), c);
function at(o, x, y, z, rx = 0, ry = 0, rz = 0) { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; }

// ---------------------------------------------------------------- sky + ground
export function sky(top, horizon, bottom = horizon) {
  const g = new THREE.SphereGeometry(400, 32, 16);
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(top) }, hor: { value: new THREE.Color(horizon) }, bot: { value: new THREE.Color(bottom) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform vec3 top,hor,bot; varying vec3 vP; void main(){ float h=vP.y; vec3 c = h>0. ? mix(hor,top,pow(h,0.6)) : mix(hor,bot,pow(-h,0.5)); gl_FragColor=vec4(c,1.); }',
  });
  const s = new THREE.Mesh(g, m); s.renderOrder = -10; return s;
}

export function ground(size, colA, colB, seed = 1, bumps = 0) {
  const g = new THREE.PlaneGeometry(size, size, 80, 80); g.rotateX(-Math.PI / 2);
  const r = rng(seed), A = new THREE.Color(colA), B = new THREE.Color(colB), c = new THREE.Color();
  const cols = [], pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const n = 0.5 + 0.25 * Math.sin(x * 0.21 + z * 0.13) + 0.25 * Math.sin(x * 0.07 - z * 0.19 + 2) ;
    c.copy(A).lerp(B, Math.min(1, Math.max(0, n + (r() - 0.5) * 0.25)));
    cols.push(c.r, c.g, c.b);
    if (bumps) { const d = Math.hypot(x, z); pos.setY(i, bumps * Math.max(0, (d - 30) / 40) * (Math.sin(x * 0.15) + Math.cos(z * 0.12) + 1.2)); }
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g.computeVertexNormals();
  const m = mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: false }), false);
  m.receiveShadow = true; return m;
}

// Flat strip (road / river / rail bed) along a polyline in XZ.
export function strip(points, width, color, y = 0.01, opts = {}) {
  const pos = [], idx = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i], q = points[Math.min(i + 1, points.length - 1)], o = points[Math.max(i - 1, 0)];
    const dx = q[0] - o[0], dz = q[1] - o[1], l = Math.hypot(dx, dz) || 1;
    const nx = -dz / l * width / 2, nz = dx / l * width / 2;
    pos.push(p[0] + nx, y, p[1] + nz, p[0] - nx, y, p[1] - nz);
    if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 1, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, ...opts }), false); m.receiveShadow = true; return m;
}

// ---------------------------------------------------------------- vegetation
export function pine(s = 1, col = '#2f6b3a', seed = 0) {
  const g = new THREE.Group(), r = rng(seed + 7);
  g.add(at(cyl(0.08, 0.12, 0.8, '#6b4a2f', 6), 0, 0.4, 0));
  for (let i = 0; i < 3; i++) {
    const c = mesh(new THREE.ConeGeometry(0.9 - i * 0.22, 1.1, 7), new THREE.Color(col).offsetHSL(0, 0, (r() - 0.5) * 0.06).getStyle());
    at(c, 0, 1.0 + i * 0.6, 0, 0, r() * 3, 0); g.add(c);
  }
  g.scale.setScalar(s); return g;
}
export function roundTree(s = 1, col = '#4f8f3a', seed = 0, trunk = '#6b4a2f') {
  const g = new THREE.Group(), r = rng(seed + 3);
  g.add(at(cyl(0.07, 0.11, 1.0, trunk, 6), 0, 0.5, 0));
  for (let i = 0; i < 3; i++) {
    const b = mesh(new THREE.IcosahedronGeometry(0.55 + r() * 0.2, 0), new THREE.Color(col).offsetHSL(0, 0, (r() - 0.5) * 0.08).getStyle());
    at(b, (r() - 0.5) * 0.5, 1.2 + r() * 0.4, (r() - 0.5) * 0.5, r(), r(), r()); g.add(b);
  }
  g.scale.setScalar(s); return g;
}
export function birch(s = 1, seed = 0) { return roundTree(s, '#9cbf4a', seed, '#e8e4da'); }
export function palm(s = 1, seed = 0) {
  const g = new THREE.Group(), r = rng(seed + 11);
  const t = cyl(0.06, 0.1, 2.2, '#8a6a45', 6); at(t, 0, 1.1, 0, 0, 0, 0.08); g.add(t);
  for (let i = 0; i < 7; i++) {
    const leaf = mesh(new THREE.ConeGeometry(0.16, 1.4, 4), '#3f8a3a'); leaf.scale.set(1, 1, 0.25);
    const a = i / 7 * Math.PI * 2 + r();
    leaf.position.set(Math.cos(a) * 0.55 + 0.1, 2.1, Math.sin(a) * 0.55);
    leaf.rotation.set(0, -a, -Math.PI / 2 - 0.5); leaf.rotation.order = 'YXZ';
    g.add(leaf);
  }
  g.scale.setScalar(s); return g;
}
export function bush(s = 1, col = '#3e7f35', seed = 0) {
  const g = new THREE.Group(), r = rng(seed + 5);
  for (let i = 0; i < 4; i++) g.add(at(mesh(new THREE.IcosahedronGeometry(0.35 + r() * 0.15, 0), new THREE.Color(col).offsetHSL(0, 0, (r() - .5) * .08).getStyle()), (r() - 0.5) * 0.7, 0.25 + r() * 0.15, (r() - 0.5) * 0.5, r(), r(), r()));
  g.scale.setScalar(s); return g;
}
export function rock(s = 1, col = '#8a8a86', seed = 0) {
  const r = rng(seed); const g = new THREE.DodecahedronGeometry(0.5, 0);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * (0.8 + r() * 0.4), p.getY(i) * (0.6 + r() * 0.3), p.getZ(i) * (0.8 + r() * 0.4));
  g.computeVertexNormals(); const m = mesh(g, col); m.scale.setScalar(s); m.position.y = 0.15 * s; return m;
}
export function mountain(h, rad, col = '#8796a3', snow = false, seed = 0) {
  const g = new THREE.ConeGeometry(rad, h, 9, 4), r = rng(seed), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) if (p.getY(i) < h / 2 - 0.01) { p.setX(i, p.getX(i) * (0.85 + r() * 0.3)); p.setZ(i, p.getZ(i) * (0.85 + r() * 0.3)); }
  g.computeVertexNormals(); const grp = new THREE.Group(); grp.add(at(mesh(g, col, false), 0, h / 2, 0));
  if (snow) grp.add(at(mesh(new THREE.ConeGeometry(rad * 0.28, h * 0.28, 9), '#f2f4f5', false), 0, h * 0.86, 0));
  return grp;
}
// Scatter helper, avoiding a list of clear zones [x,z,r].
export function scatter(parent, maker, n, area, seed, clear = []) {
  const r = rng(seed);
  for (let i = 0, tries = 0; i < n && tries < n * 20; tries++) {
    const x = area[0] + r() * (area[2] - area[0]), z = area[1] + r() * (area[3] - area[1]);
    if (clear.some(([cx, cz, cr]) => Math.hypot(x - cx, z - cz) < cr)) continue;
    const o = maker(r, i); o.position.x += x; o.position.z += z; o.rotation.y = r() * 6.28; parent.add(o); i++;
  }
}

// ---------------------------------------------------------------- vehicles
export function wheel(r = 0.22, w = 0.16) { const m = cyl(r, r, w, '#222', 12); m.rotation.z = Math.PI / 2; return m; }
export function truck(color = '#5d6650', cover = '#6e7a5a') {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  body.add(at(box(0.95, 0.75, 0.85, color), 0, 0.68, 1.05));          // cab
  body.add(at(box(0.9, 0.3, 0.05, '#9fc3d6'), 0, 0.85, 1.48));         // windshield
  body.add(at(box(1.0, 0.18, 2.6, '#3a3d36'), 0, 0.36, 0.1));          // chassis
  body.add(at(box(1.0, 0.35, 1.75, color), 0, 0.6, -0.45));            // bed
  const c = mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.75, 10, 1, false, 0, Math.PI), cover);
  at(c, 0, 0.78, -0.45, Math.PI / 2, 0, -Math.PI / 2); c.rotation.order = 'ZXY'; c.rotation.set(Math.PI / 2, Math.PI / 2, 0);
  body.add(c);
  body.add(at(box(0.18, 0.12, 0.04, '#ffd884'), 0.32, 0.55, 1.48)); body.add(at(box(0.18, 0.12, 0.04, '#ffd884'), -0.32, 0.55, 1.48));
  g.wheels = [];
  for (const z of [1.0, -0.2, -0.75]) for (const x of [-0.5, 0.5]) { const w = at(wheel(), x, 0.22, z); w.rotation.z = Math.PI / 2; g.add(w); g.wheels.push(w); }
  g.body = body; return g;
}
export function tank(color = '#5a6248') {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  body.add(at(box(1.5, 0.45, 2.6, color), 0, 0.5, 0));
  body.add(at(box(1.62, 0.36, 2.8, '#2b2b28'), 0, 0.25, 0));
  const tur = new THREE.Group(); at(tur, 0, 0.88, -0.1); body.add(tur);
  tur.add(at(mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.38, 8), color), 0, 0, 0));
  const barrel = cyl(0.06, 0.07, 1.7, '#4a5040', 8); at(barrel, 0, 0.03, 1.15, Math.PI / 2, 0, 0); tur.add(barrel);
  g.turret = tur; g.body = body; g.wheels = []; return g;
}
export function apc(color = '#5a6248') {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  body.add(at(box(1.2, 0.6, 2.4, color), 0, 0.62, 0));
  body.add(at(box(1.0, 0.25, 0.5, color), 0, 0.85, 1.05, 0.6, 0, 0));
  body.add(at(cyl(0.18, 0.2, 0.2, color, 8), 0, 1.02, -0.2));
  body.add(at(cyl(0.025, 0.025, 0.7, '#333', 6), 0, 1.05, 0.15, Math.PI / 2, 0, 0));
  g.wheels = [];
  for (const z of [0.8, 0.0, -0.8]) for (const x of [-0.62, 0.62]) { const w = at(wheel(0.25, 0.18), x, 0.25, z); g.add(w); g.wheels.push(w); }
  g.body = body; return g;
}
export function train(color = '#3b3f45', wagons = 3) {
  const g = new THREE.Group();
  const loco = new THREE.Group(); g.add(loco);
  loco.add(at(box(1.0, 0.25, 2.6, '#222'), 0, 0.35, 0));
  loco.add(at(cyl(0.42, 0.42, 1.7, color, 12), 0, 0.85, 0.35, Math.PI / 2, 0, 0));
  loco.add(at(box(1.0, 1.0, 0.9, color), 0, 0.95, -0.85));
  loco.add(at(cyl(0.12, 0.16, 0.45, '#222', 8), 0, 1.4, 0.95));
  loco.add(at(box(1.1, 0.12, 1.1, '#7a2b22'), 0, 1.5, -0.85));
  for (const z of [0.9, 0.2, -0.5]) for (const x of [-0.45, 0.45]) loco.add(at(wheel(0.25, 0.08), x, 0.25, z));
  for (let i = 0; i < wagons; i++) {
    const w = new THREE.Group(); at(w, 0, 0, -2.4 - i * 2.4); g.add(w);
    w.add(at(box(1.0, 0.25, 2.2, '#222'), 0, 0.35, 0));
    w.add(at(box(1.05, 0.9, 2.1, i % 2 ? '#7a5a3a' : '#5d6650'), 0, 0.95, 0));
    for (const z of [0.7, -0.7]) for (const x of [-0.45, 0.45]) w.add(at(wheel(0.22, 0.08), x, 0.22, z));
  }
  return g;
}
export function railway(len, x0 = 0, z = 0) {
  const g = new THREE.Group();
  g.add(at(box(len, 0.08, 1.8, '#8d8273'), x0, 0.04, z));
  const sleepers = []; for (let x = -len / 2; x < len / 2; x += 0.5) sleepers.push(new THREE.BoxGeometry(0.18, 0.06, 1.4).translate(x0 + x, 0.1, z));
  const sm = mesh(mergeGeometries(sleepers), '#5a4632'); g.add(sm);
  for (const dz of [-0.45, 0.45]) g.add(at(box(len, 0.07, 0.06, '#9aa0a6'), x0, 0.16, z + dz));
  return g;
}

// ---------------------------------------------------------------- buildings & gear
export function house(w = 2, d = 2, h = 1.4, wall = '#e8dcc4', roof = '#a4553a') {
  const g = new THREE.Group();
  g.add(at(box(w, h, d, wall), 0, h / 2, 0));
  const r = mesh(new THREE.CylinderGeometry(0.01, w * 0.78, 0.9, 4, 1), roof);
  at(r, 0, h + 0.45, 0, 0, Math.PI / 4, 0); r.scale.set(1, 1, d / w); g.add(r);
  g.add(at(box(0.45, 0.8, 0.05, '#6b4a2f'), 0, 0.4, d / 2 + 0.01));
  g.add(at(box(0.35, 0.3, 0.05, '#9fc3d6'), w * 0.3, h * 0.6, d / 2 + 0.01));
  g.add(at(box(0.35, 0.3, 0.05, '#9fc3d6'), -w * 0.3, h * 0.6, d / 2 + 0.01));
  return g;
}
export function hut(s = 1) {
  const g = new THREE.Group();
  g.add(at(cyl(0.9, 0.9, 1.0, '#c9a46a', 8), 0, 0.5, 0));
  g.add(at(mesh(new THREE.ConeGeometry(1.25, 0.9, 8), '#b08a4a'), 0, 1.45, 0));
  g.add(at(box(0.4, 0.7, 0.1, '#5a3d22'), 0, 0.35, 0.86));
  g.scale.setScalar(s); return g;
}
export function tower(color = '#7a6a55') {
  const g = new THREE.Group();
  for (const [x, z] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) g.add(at(cyl(0.06, 0.06, 2.6, color, 6), x, 1.3, z));
  g.add(at(box(1.6, 0.12, 1.6, color), 0, 2.6, 0));
  g.add(at(box(1.6, 0.4, 0.06, color), 0, 2.85, 0.78)); g.add(at(box(1.6, 0.4, 0.06, color), 0, 2.85, -0.78));
  g.add(at(box(0.06, 0.4, 1.6, color), 0.78, 2.85, 0)); g.add(at(box(0.06, 0.4, 1.6, color), -0.78, 2.85, 0));
  g.add(at(mesh(new THREE.ConeGeometry(1.25, 0.6, 4), '#6b4a2f'), 0, 3.6, 0, 0, Math.PI / 4, 0));
  for (const [x, z] of [[-0.6, 0.6], [0.6, 0.6]]) g.add(at(cyl(0.04, 0.04, 0.9, color, 6), x, 3.1, z));
  return g;
}
export function tent(color = '#6e7a5a') {
  const g = new THREE.Group();
  const t = mesh(new THREE.CylinderGeometry(0.01, 1.0, 1.0, 4, 1), color); at(t, 0, 0.5, 0, 0, Math.PI / 4, 0); t.scale.set(1.3, 1, 1); g.add(t);
  return g;
}
export function sandbags(n = 5, curve = 0) {
  const g = new THREE.Group();
  for (let row = 0; row < 2; row++) for (let i = 0; i < n - row; i++) {
    const b = mesh(new THREE.CapsuleGeometry(0.09, 0.22, 2, 6), '#b8a274'); b.rotation.z = Math.PI / 2;
    const x = (i - (n - row - 1) / 2) * 0.34; b.position.set(x, 0.09 + row * 0.16, curve * x * x); g.add(b);
  }
  return g;
}
export function crate(s = 0.4, color = '#8a6a3f') { const g = new THREE.Group(); g.add(at(box(s, s, s, color), 0, s / 2, 0)); g.add(at(box(s * 1.02, s * 0.12, s * 1.02, '#5e472a'), 0, s / 2, 0)); return g; }
export function barrel(color = '#4f6e8a') { const g = new THREE.Group(); g.add(at(cyl(0.18, 0.18, 0.5, color, 10), 0, 0.25, 0)); return g; }
export function flag(color = '#c0392b', poleH = 2.2) {
  const g = new THREE.Group();
  g.add(at(cyl(0.025, 0.025, poleH, '#ccc', 6), 0, poleH / 2, 0));
  const f = mesh(new THREE.PlaneGeometry(0.8, 0.5, 6, 1), new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: 0.9 }));
  f.position.set(0.42, poleH - 0.3, 0); g.add(f); g.cloth = f; g.cloth0 = f.geometry.attributes.position.array.slice();
  return g;
}
export function waveFlag(fl, t) {
  const p = fl.cloth.geometry.attributes.position, a = fl.cloth0;
  for (let i = 0; i < p.count; i++) { const x = a[i * 3]; p.setZ(i, Math.sin(x * 6 - t * 6) * 0.06 * (x + 0.4)); }
  p.needsUpdate = true;
}

export function rifle(color = '#3a3a3a', wood = '#7a5232') {
  const g = new THREE.Group();
  g.add(at(box(0.035, 0.05, 0.28, color), 0, 0, 0.02));
  g.add(at(cyl(0.008, 0.008, 0.2, '#222', 6), 0, 0.012, 0.26, Math.PI / 2, 0, 0));
  g.add(at(box(0.03, 0.06, 0.13, wood), 0, -0.012, -0.17));
  g.add(at(box(0.025, 0.07, 0.035, '#222'), 0, -0.05, 0.05, 0.3, 0, 0));
  g.add(at(box(0.03, 0.035, 0.12, wood), 0, -0.02, 0.17));
  g.muzzle = new THREE.Object3D(); g.muzzle.position.set(0, 0.012, 0.37); g.add(g.muzzle);
  g.scale.setScalar(1.15);
  return g;
}
export function launcher() {
  const g = new THREE.Group();
  g.add(at(cyl(0.035, 0.035, 0.6, '#4d5a3a', 10), 0, 0, 0.0, Math.PI / 2, 0, 0));
  g.add(at(cyl(0.048, 0.048, 0.07, '#3a4430', 10), 0, 0, 0.29, Math.PI / 2, 0, 0));
  g.add(at(cyl(0.045, 0.04, 0.06, '#3a4430', 10), 0, 0, -0.29, Math.PI / 2, 0, 0));
  g.add(at(box(0.05, 0.05, 0.08, '#222'), -0.06, 0.05, 0.05));
  g.muzzle = new THREE.Object3D(); g.muzzle.position.set(0, 0, 0.34); g.add(g.muzzle);
  return g;
}
export function drone() {
  const g = new THREE.Group();
  g.add(at(box(0.22, 0.07, 0.22, '#33363b'), 0, 0, 0));
  g.add(at(box(0.08, 0.06, 0.06, '#111'), 0, -0.05, 0.08));
  g.rotors = [];
  for (const [x, z] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const arm = box(0.22, 0.025, 0.03, '#2a2c30'); arm.position.set(x * 0.13, 0.01, z * 0.13); arm.rotation.y = Math.atan2(-z, x); g.add(arm);
    const rot = new THREE.Group(); rot.position.set(x * 0.21, 0.05, z * 0.21);
    rot.add(at(box(0.24, 0.006, 0.03, '#bbb'), 0, 0, 0)); rot.add(at(cyl(0.025, 0.025, 0.05, '#222', 6), 0, -0.02, 0));
    g.add(rot); g.rotors.push(rot);
  }
  g.add(at(mesh(new THREE.SphereGeometry(0.02, 6, 4), new THREE.MeshBasicMaterial({ color: '#ff3b30' })), 0, 0.04, -0.12));
  return g;
}
export function bandana(color = '#3d5a2a') {
  const g = new THREE.Group();
  const t = mesh(new THREE.TorusGeometry(0.105, 0.03, 6, 14), color); t.rotation.x = Math.PI / 2; t.scale.set(1, 0.9, 1); g.add(t);
  const knot = mesh(new THREE.ConeGeometry(0.06, 0.11, 4), color); knot.position.set(0, -0.03, 0.09); knot.rotation.x = Math.PI; g.add(knot);
  return g;
}
export function vest(color = '#4a5160') {
  const g = new THREE.Group();
  const v = mesh(new THREE.CylinderGeometry(0.098, 0.108, 0.15, 12), color); v.scale.set(1, 1, 0.92); g.add(v);
  for (const x of [-0.045, 0, 0.045]) g.add(at(box(0.035, 0.05, 0.025, '#363c49'), x, -0.025, 0.1));
  g.add(at(box(0.05, 0.03, 0.01, '#c9a227'), 0.05, 0.04, 0.1));
  return g;
}
export function sash(color = '#5b4a2a') {
  const g = new THREE.Group();
  const t = mesh(new THREE.TorusGeometry(0.15, 0.022, 5, 18), color); t.scale.set(0.95, 1.2, 0.85); t.rotation.set(0, Math.PI / 2, 0.75); t.rotation.order = 'YZX'; g.add(t);
  return g;
}
export function backpack(color = '#55603f') {
  const g = new THREE.Group(); g.add(at(box(0.2, 0.2, 0.1, color), 0, 0, 0)); g.add(at(box(0.16, 0.06, 0.05, '#454e33'), 0, -0.05, 0.06)); return g;
}
export function strawHat() {
  const g = new THREE.Group();
  const c = mesh(new THREE.ConeGeometry(0.46, 0.2, 18, 1, true), new THREE.MeshStandardMaterial({ color: '#d9b96a', roughness: 0.9, side: THREE.DoubleSide, flatShading: true }));
  g.add(c); return g;
}

// Hinged trapdoor + hole for the tunnel scene.
export function trapdoor() {
  const g = new THREE.Group();
  const hole = mesh(new THREE.CircleGeometry(0.42, 16), new THREE.MeshBasicMaterial({ color: '#0d0a07' }), false); hole.rotation.x = -Math.PI / 2; hole.position.y = 0.012; g.add(hole);
  const lid = new THREE.Group(); lid.position.set(0, 0.02, -0.42); g.add(lid);
  const l = mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.05, 16), '#6a5a3a'); l.position.set(0, 0, 0.42); lid.add(l);
  const grass = mesh(new THREE.IcosahedronGeometry(0.16, 0), '#4c7d36'); grass.position.set(0.1, 0.06, 0.42); grass.scale.y = 0.5; lid.add(grass);
  g.lid = lid; return g;
}

export { at, box, cyl, mesh };
