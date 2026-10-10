// Period sets and props for the Mexican Revolution (1910–1920). Low-poly, warm palette.
import * as THREE from 'three';
import { at, box, cyl, mesh, rng, mat } from '../lib/props.js';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...o });
const smooth = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });

export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

// ------------------------------------------------------------ plants & terrain
export function agave(s = 1, seed = 0) {
  const g = new THREE.Group(), r = rng(seed + 31), m = std('#6f9a8c');
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2 + r() * 0.3, tilt = 0.5 + r() * 0.6, L = 0.6 + r() * 0.35;
    const leaf = mesh(new THREE.ConeGeometry(0.07, L, 4), m); leaf.geometry.translate(0, L / 2, 0);
    leaf.rotation.set(Math.sin(a) * tilt, 0, -Math.cos(a) * tilt); leaf.scale.z = 0.5; g.add(leaf);
  }
  g.scale.setScalar(s); return g;
}
export function nopal(s = 1, seed = 0) {
  const g = new THREE.Group(), r = rng(seed + 47), m = std('#5d8f43');
  const pad = (x, y, z, ry, rz, k = 1) => { const p = mesh(new THREE.SphereGeometry(0.16 * k, 8, 6), m); p.scale.set(1, 1.3, 0.28); p.position.set(x, y, z); p.rotation.set(0, ry, rz); g.add(p); return p; };
  pad(0, 0.2, 0, 0, 0, 1.1); pad(0.12, 0.48, 0, 0.3, -0.4); pad(-0.13, 0.46, 0.02, -0.2, 0.45); pad(0.2, 0.74, 0, 0.5, -0.2, 0.85); pad(-0.18, 0.72, 0, 0.1, 0.3, 0.8);
  if (r() > 0.4) for (let i = 0; i < 4; i++) { const f = mesh(new THREE.SphereGeometry(0.03, 6, 4), std('#c2304a')); f.position.set(-0.2 + i * 0.13, 0.86 + r() * 0.1, 0.02); g.add(f); }
  g.scale.setScalar(s); return g;
}
export function saguaro(s = 1, seed = 0) {
  const g = new THREE.Group(), r = rng(seed + 53), m = std('#4f7d45');
  g.add(at(mesh(new THREE.CapsuleGeometry(0.16, 2.2, 4, 10), m), 0, 1.25, 0));
  for (const side of [-1, 1]) if (r() > 0.25) {
    const h = 0.9 + r() * 0.6;
    g.add(at(mesh(new THREE.CapsuleGeometry(0.11, 0.35, 4, 8), m), side * 0.3, h, 0, 0, 0, Math.PI / 2));
    g.add(at(mesh(new THREE.CapsuleGeometry(0.11, 0.6, 4, 8), m), side * 0.47, h + 0.35, 0));
  }
  g.scale.setScalar(s); return g;
}
export function shrub(s = 1, seed = 0, col = '#7d8a4e') {
  const g = new THREE.Group(), r = rng(seed + 61);
  for (let i = 0; i < 4; i++) g.add(at(mesh(new THREE.IcosahedronGeometry(0.28 + r() * 0.12, 0), std(new THREE.Color(col).offsetHSL(0, 0, (r() - 0.5) * 0.08).getStyle())), (r() - 0.5) * 0.5, 0.2 + r() * 0.1, (r() - 0.5) * 0.4, r(), r(), r()));
  g.scale.setScalar(s); return g;
}
export function mesquite(s = 1, seed = 0) {
  const g = new THREE.Group(), r = rng(seed + 67);
  const trunk = mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.0, 6), std('#5d4632')); trunk.position.y = 0.5; trunk.rotation.z = (r() - 0.5) * 0.4; g.add(trunk);
  for (let i = 0; i < 5; i++) {
    const c = at(mesh(new THREE.IcosahedronGeometry(0.45 + r() * 0.2, 0), std(new THREE.Color('#6f8a45').offsetHSL(0, 0, (r() - 0.5) * 0.08).getStyle())), (r() - 0.5) * 1.1, 1.05 + r() * 0.35, (r() - 0.5) * 0.9, r(), r(), r());
    c.scale.set(1, 0.55, 1); g.add(c);
  }
  g.scale.setScalar(s); return g;
}
// Instanced field of stalks (sugar cane or corn) inside a rectangle.
export function field(x0, z0, x1, z1, { kind = 'cane', spacing = 0.42, seed = 5, height = 1.7 } = {}) {
  const g = new THREE.Group(), r = rng(seed);
  const pts = []; for (let x = x0; x < x1; x += spacing) for (let z = z0; z < z1; z += spacing) pts.push([x + (r() - 0.5) * spacing * 0.6, z + (r() - 0.5) * spacing * 0.6, 0.8 + r() * 0.4, r() * 6.28, (r() - 0.5) * 0.2]);
  const stalkG = new THREE.CylinderGeometry(0.025, 0.035, height, 5); stalkG.translate(0, height / 2, 0);
  const leafG = new THREE.ConeGeometry(0.06, height * 0.55, 3); leafG.translate(0, height * 0.27, 0);
  const stalks = new THREE.InstancedMesh(stalkG, std(kind === 'cane' ? '#8fa64a' : '#9aa84f'), pts.length);
  const leaves = new THREE.InstancedMesh(leafG, std(kind === 'cane' ? '#6f9a3a' : '#7f9a3a'), pts.length * 3);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), S = new THREE.Vector3();
  pts.forEach(([x, z, k, ry, lean], i) => {
    M.compose(V.set(x, 0, z), Q.setFromEuler(E.set(lean, ry, lean * 0.5)), S.set(1, k, 1)); stalks.setMatrixAt(i, M);
    for (let j = 0; j < 3; j++) M.compose(V.set(x, height * k * (0.35 + j * 0.2), z), Q.setFromEuler(E.set(0.9 + j * 0.15, ry + j * 2.1, 0)), S.set(0.6, k * 0.8, 0.25)), leaves.setMatrixAt(i * 3 + j, M);
  });
  stalks.castShadow = leaves.castShadow = true; stalks.receiveShadow = leaves.receiveShadow = true;
  g.add(stalks, leaves); return g;
}
export function volcano(h = 26, r = 30, snow = true) {
  const g = new THREE.Group();
  // smooth volcanic cone with a concave profile and a flattened crater rim
  const prof = []; for (let i = 0; i <= 16; i++) { const u = i / 16; prof.push(new THREE.Vector2(r * (0.06 + 0.94 * Math.pow(u, 1.6)), h * (1 - u))); }
  const geo = new THREE.LatheGeometry(prof, 40), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = p.getY(i), a = Math.atan2(z, x), k = 1 + 0.05 * Math.sin(a * 5 + 1) * (1 - y / h) + 0.03 * Math.sin(a * 11); p.setX(i, x * k); p.setZ(i, z * k); }
  geo.computeVertexNormals();
  const cols = [], A = new THREE.Color('#6f7d8c'), B = new THREE.Color('#8f9aa6'), W = new THREE.Color('#f4f6f8'), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) { const y = p.getY(i) / h, a = Math.atan2(p.getZ(i), p.getX(i)); const line = 0.74 + 0.04 * Math.sin(a * 7) + 0.03 * Math.sin(a * 13 + 2);
    if (snow && y > line) c.copy(W); else c.copy(A).lerp(B, y); cols.push(c.r, c.g, c.b); }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  g.add(mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, side: THREE.DoubleSide }), false));
  return g;
}
// Distant mountain range (sierra): a noisy ridge strip with height-tinted vertex colours.
export function sierra({ x0 = -160, x1 = 160, z = -100, depth = 40, height = 18, seed = 1, base = '#8a6a62', top = '#b89a88', segX = 160 } = {}) {
  const r = rng(seed), ph = [r() * 9, r() * 9, r() * 9, r() * 9];
  const g = new THREE.PlaneGeometry(x1 - x0, depth, segX, 14); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position, cols = [], A = new THREE.Color(base), B = new THREE.Color(top), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), zz = p.getZ(i), u = (zz + depth / 2) / depth;          // 0 back .. 1 front
    const ridge = 0.55 + 0.25 * Math.sin(x * 0.045 + ph[0]) + 0.15 * Math.sin(x * 0.11 + ph[1]) + 0.08 * Math.sin(x * 0.27 + ph[2] + zz * 0.05) + 0.04 * Math.sin(x * 0.61 + ph[3] + zz * 0.13);
    const prof = Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, u * 1.1))), 1.1) * (0.92 + 0.08 * Math.sin(x * 0.9 + zz * 0.7));
    const y = Math.max(0, height * ridge * prof);
    p.setY(i, y); c.copy(A).lerp(B, Math.min(1, y / height)); cols.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: false, roughness: 1 }));
  m.position.set((x0 + x1) / 2, -0.5, z); return m;
}

export function rockPile(s = 1, seed = 0, col = '#a08a6a') {
  const g = new THREE.Group(), r = rng(seed);
  for (let i = 0; i < 6; i++) { const geo = new THREE.DodecahedronGeometry(0.5 + r() * 0.5, 0), p = geo.attributes.position;
    for (let k = 0; k < p.count; k++) p.setXYZ(k, p.getX(k) * (0.8 + r() * 0.4), p.getY(k) * (0.6 + r() * 0.3), p.getZ(k) * (0.8 + r() * 0.4)); geo.computeVertexNormals();
    g.add(at(mesh(geo, std(new THREE.Color(col).offsetHSL(0, 0, (r() - 0.5) * 0.1).getStyle())), (r() - 0.5) * 2, 0.3 + r() * 0.5, (r() - 0.5) * 2, r(), r(), r())); }
  g.scale.setScalar(s); return g;
}

// ------------------------------------------------------------ buildings
export function adobe(w = 2.4, d = 2, h = 1.5, color = '#d8b48a', seed = 0) {
  const g = new THREE.Group(), r = rng(seed + 71);
  g.add(at(box(w, h, d, color), 0, h / 2, 0));
  g.add(at(box(w + 0.06, 0.12, d + 0.06, new THREE.Color(color).offsetHSL(0, 0, -0.06).getStyle()), 0, h + 0.06, 0));
  for (let i = 0; i < Math.floor(w / 0.45); i++) g.add(at(cyl(0.04, 0.04, 0.3, '#6b4a2f', 5), -w / 2 + 0.3 + i * 0.45, h - 0.15, d / 2 + 0.1, Math.PI / 2, 0, 0));
  g.add(at(box(0.5, 0.95, 0.04, '#5a3d24'), (r() - 0.5) * w * 0.3, 0.47, d / 2 + 0.01));
  g.add(at(box(0.36, 0.36, 0.04, '#2a2522'), w * 0.3, h * 0.6, d / 2 + 0.01));
  return g;
}
export function hacienda() {
  const g = new THREE.Group();
  const wall = '#e2cfae', trim = '#b5713f';
  g.add(at(box(10, 2.6, 3.2, wall), 0, 1.3, 0));                        // casa grande
  g.add(at(box(10.2, 0.25, 3.4, trim), 0, 2.72, 0));
  for (let i = 0; i < 9; i++) {                                           // portico arches
    const x = -4.4 + i * 1.1;
    g.add(at(box(0.18, 1.6, 0.18, '#d6c09a'), x, 0.8, 1.9));
    const arch = mesh(new THREE.TorusGeometry(0.46, 0.08, 5, 12, Math.PI), std('#d6c09a')); arch.position.set(x + 0.55, 1.6, 1.9); g.add(arch);
  }
  g.add(at(box(10.4, 0.18, 1.2, trim), 0, 2.15, 1.85));
  for (let i = 0; i < 7; i++) g.add(at(box(0.5, 0.7, 0.05, '#4a3220'), -4 + i * 1.33, 1.1, 1.61));
  // chapel with bell tower and dome
  const ch = new THREE.Group(); ch.position.set(6.6, 0, -0.3); g.add(ch);
  ch.add(at(box(2.4, 3.6, 3.6, '#e8d6b5'), 0, 1.8, 0));
  ch.add(at(box(1.1, 2.0, 1.1, '#e8d6b5'), -0.7, 4.6, 1.2)); ch.add(at(box(1.25, 0.2, 1.25, trim), -0.7, 5.6, 1.2));
  const bell = mesh(new THREE.ConeGeometry(0.22, 0.32, 10), std('#8a6a2a', { metalness: 0.6, roughness: 0.4 })); bell.position.set(-0.7, 4.9, 1.2); ch.add(bell);
  const dome = mesh(new THREE.SphereGeometry(0.9, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), std('#c98a4a')); dome.position.set(0.3, 3.6, -0.5); ch.add(dome);
  ch.add(at(box(0.08, 0.6, 0.08, '#3a2a1a'), -0.7, 5.95, 1.2)); ch.add(at(box(0.36, 0.08, 0.08, '#3a2a1a'), -0.7, 6.05, 1.2));
  ch.add(at(box(0.8, 1.4, 0.05, '#5a3d24'), 0, 0.7, 1.81));
  return g;
}
export function palacio() {
  // Palacio Nacional: long red tezontle façade with stone trim, central balcony and bell.
  const g = new THREE.Group(), red = '#8a4a3a', stone = '#ddd0b4';
  g.add(at(box(22, 5.2, 3, red), 0, 2.6, 0));
  g.add(at(box(22.2, 0.3, 3.2, stone), 0, 5.35, 0)); g.add(at(box(22.2, 0.25, 3.2, stone), 0, 2.6, 0));
  for (let f = 0; f < 2; f++) for (let i = 0; i < 17; i++) {
    const x = -10 + i * 1.25; if (Math.abs(x) < 1.2 && f === 1) continue;
    g.add(at(box(0.62, 1.15, 0.06, '#2a2320'), x, 1.15 + f * 2.5, 1.51)); g.add(at(box(0.8, 0.12, 0.1, stone), x, 1.82 + f * 2.5, 1.53));
  }
  g.add(at(box(3.2, 6.4, 3.2, red), 0, 3.2, 0.1)); g.add(at(box(3.4, 0.3, 3.4, stone), 0, 6.5, 0.1));
  g.add(at(box(1.4, 2.1, 0.06, '#2a2320'), 0, 1.05, 1.72));
  // balcony
  g.add(at(box(2.6, 0.12, 0.9, stone), 0, 3.7, 2.1)); for (let i = 0; i < 9; i++) g.add(at(cyl(0.025, 0.025, 0.5, '#2a2320', 5), -1.2 + i * 0.3, 3.98, 2.5));
  g.add(at(box(2.6, 0.06, 0.06, '#2a2320'), 0, 4.24, 2.5)); g.add(at(box(1.1, 1.5, 0.06, '#2a2320'), 0, 4.45, 1.72));
  const bell = mesh(new THREE.ConeGeometry(0.3, 0.42, 12), std('#8a6a2a', { metalness: 0.6, roughness: 0.4 })); bell.position.set(0, 7.0, 0.5); g.add(bell);
  g.add(at(box(0.9, 0.12, 0.9, stone), 0, 7.3, 0.5));
  g.balcony = [0, 3.76, 2.1];
  return g;
}
export function cathedral() {
  const g = new THREE.Group(), stone = '#b9ab92', dark = '#8f826b';
  g.add(at(box(9, 7, 6, stone), 0, 3.5, 0)); g.add(at(box(3.6, 9, 0.6, stone), 0, 4.5, 3.1));
  for (const x of [-5.5, 5.5]) {
    g.add(at(box(2.4, 9, 2.4, stone), x, 4.5, 1.5)); g.add(at(box(2.0, 2.4, 2.0, dark), x, 10.2, 1.5));
    const bell = mesh(new THREE.SphereGeometry(1.0, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), std(stone)); bell.scale.y = 1.6; bell.position.set(x, 11.4, 1.5); g.add(bell);
    g.add(at(box(0.12, 0.9, 0.12, '#3a3226'), x, 13.2, 1.5)); g.add(at(box(0.5, 0.12, 0.12, '#3a3226'), x, 13.35, 1.5));
  }
  const dome = mesh(new THREE.SphereGeometry(2.2, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), std('#c9b994')); dome.position.set(0, 7, -1); g.add(dome);
  g.add(at(box(1.6, 3, 0.1, '#3a2c20'), 0, 1.5, 3.42));
  return g;
}
export function townhouse(w = 3, h = 3.2, color = '#c9a07a', seed = 0) {
  const g = new THREE.Group(), r = rng(seed + 81);
  g.add(at(box(w, h, 2.4, color), 0, h / 2, 0)); g.add(at(box(w + 0.1, 0.18, 2.5, '#ddd0b4'), 0, h + 0.09, 0));
  for (let f = 0; f < 2; f++) for (let i = 0; i < Math.floor(w / 1.0); i++) g.add(at(box(0.45, 0.8, 0.05, '#2a2320'), -w / 2 + 0.55 + i * 1.0, 0.9 + f * 1.4, 1.21));
  return g;
}

// ------------------------------------------------------------ flags & banners
export function flag(kind = 'mx', poleH = 3, w = 1.3, h = 0.8) {
  const tex = canvasTex(256, 160, (g, W, H) => {
    if (kind === 'mx') {
      ['#006847', '#f6f3ea', '#ce1126'].forEach((c, i) => { g.fillStyle = c; g.fillRect(i * W / 3, 0, W / 3 + 1, H); });
      g.fillStyle = '#7a5a2a'; g.beginPath(); g.ellipse(W / 2, H / 2, 20, 24, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#3f7d3a'; g.lineWidth = 5; g.beginPath(); g.arc(W / 2, H / 2 + 4, 28, 0.3, Math.PI - 0.3); g.stroke();
    } else if (kind === 'us') {
      for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#f6f3ea' : '#b22234'; g.fillRect(0, i * H / 13, W, H / 13 + 1); }
      g.fillStyle = '#3c3b6e'; g.fillRect(0, 0, W * 0.42, H * 7 / 13); g.fillStyle = '#f6f3ea';
      for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) { g.beginPath(); g.arc(8 + c * 12.5, 7 + r * 13, 2.6, 0, Math.PI * 2); g.fill(); }
    } else if (kind === 'white') { g.fillStyle = '#f6f3ea'; g.fillRect(0, 0, W, H); }
    else if (kind === 'red') { g.fillStyle = '#b5332e'; g.fillRect(0, 0, W, H); }
  });
  const gr = new THREE.Group();
  gr.add(at(cyl(0.035, 0.04, poleH, '#d9d2c2', 8), 0, poleH / 2, 0));
  gr.add(at(mesh(new THREE.SphereGeometry(0.07, 8, 6), std('#c9a227', { metalness: 0.6 })), 0, poleH + 0.05, 0));
  const geo = new THREE.PlaneGeometry(w, h, 10, 2);
  const f = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.8 }));
  f.position.set(w / 2 + 0.04, poleH - h / 2 - 0.05, 0); f.castShadow = true; gr.add(f);
  gr.cloth = f; gr.base = geo.attributes.position.array.slice(); gr.w = w;
  gr.wave = t => { const p = geo.attributes.position, a = gr.base; for (let i = 0; i < p.count; i++) { const x = a[i * 3] + w / 2; p.setZ(i, Math.sin(x * 4 - t * 5) * 0.07 * x); } p.needsUpdate = true; geo.computeVertexNormals(); };
  return gr;
}
export function banner(text, { w = 4, h = 0.8, bg = '#f3ead6', fg = '#2a2320', accent = '#9b2d22', font = 'Inter Display', size = 72, poles = true } = {}) {
  const tex = canvasTex(1024, Math.round(1024 * h / w), (g, W, H) => {
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.strokeStyle = accent; g.lineWidth = 10; g.strokeRect(10, 10, W - 20, H - 20);
    g.fillStyle = fg; g.font = `900 ${size}px "${font}", Inter, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const lines = text.split('\n'); lines.forEach((l, i) => g.fillText(l, W / 2, H / 2 + (i - (lines.length - 1) / 2) * size * 1.1));
  });
  const gr = new THREE.Group();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 12, 2), new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.85 }));
  m.castShadow = true; gr.add(m); gr.cloth = m;
  if (poles) for (const s of [-1, 1]) gr.add(at(cyl(0.035, 0.035, h + 1.6, '#6b4a2f', 6), s * (w / 2 + 0.05), -0.8 + 0.05, 0));
  return gr;
}
export function bunting(len = 6, colors = ['#006847', '#f6f3ea', '#ce1126']) {
  const g = new THREE.Group();
  const n = Math.floor(len / 0.32);
  for (let i = 0; i < n; i++) { const tri = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.28, 3), std(colors[i % colors.length], { side: THREE.DoubleSide })); tri.rotation.x = Math.PI; tri.scale.z = 0.12; tri.position.set(-len / 2 + i * 0.32, -0.16 - 0.08 * Math.sin(i / (n - 1) * Math.PI), 0); g.add(tri); }
  return g;
}

// ------------------------------------------------------------ furniture & small props
export function stage(w = 4, d = 2.4) {
  const g = new THREE.Group();
  g.add(at(box(w, 0.5, d, '#8a6440'), 0, 0.25, 0));
  for (let i = 0; i < 3; i++) g.add(at(box(1.0, 0.16, 0.3, '#7a5636'), 0, 0.08 + i * 0.16, d / 2 + 0.75 - i * 0.3));
  const b = bunting(w, ['#006847', '#f6f3ea', '#ce1126']); b.position.set(0, 0.5, d / 2 + 0.02); b.scale.y = 0.8; g.add(b);
  return g;
}
export function ballotBox() {
  const g = new THREE.Group();
  g.add(at(box(0.5, 0.42, 0.36, '#7a5232'), 0, 0.21, 0)); g.add(at(box(0.22, 0.02, 0.04, '#1a1410'), 0, 0.425, 0));
  g.add(at(box(0.52, 0.02, 0.38, '#5a3a24'), 0, 0.41, 0)); g.add(at(box(0.52, 0.03, 0.38, '#5a3a24'), 0, 0.015, 0));
  return g;
}
export function jailCell() {
  const g = new THREE.Group();
  g.add(at(box(4, 3, 0.3, '#8f8676'), 0, 1.5, -1.6)); g.add(at(box(0.3, 3, 3.4, '#8f8676'), -2, 1.5, 0)); g.add(at(box(0.3, 3, 3.4, '#8f8676'), 2, 1.5, 0));
  g.add(at(box(4.3, 0.2, 3.4, '#6f685c'), 0, 3.0, 0));
  for (let i = 0; i < 12; i++) g.add(at(cyl(0.025, 0.025, 3, '#2a2826', 6), -1.8 + i * 0.33, 1.5, 1.6));
  g.add(at(box(4, 0.08, 0.06, '#2a2826'), 0, 2.6, 1.6)); g.add(at(box(4, 0.08, 0.06, '#2a2826'), 0, 0.4, 1.6));
  g.add(at(box(0.6, 0.5, 0.05, '#7fb0d8'), 0.8, 2.2, -1.44)); for (let i = 0; i < 4; i++) g.add(at(cyl(0.015, 0.015, 0.5, '#2a2826', 5), 0.6 + i * 0.13, 2.2, -1.42));
  g.add(at(box(1.4, 0.3, 0.6, '#6b4a2f'), -1.2, 0.35, -1.1));
  return g;
}
export function desk() {
  const g = new THREE.Group();
  g.add(at(box(1.6, 0.06, 0.8, '#5a3a24'), 0, 0.42, 0));
  for (const [x, z] of [[-0.72, -0.32], [0.72, -0.32], [-0.72, 0.32], [0.72, 0.32]]) g.add(at(box(0.06, 0.42, 0.06, '#4a2f1d'), x, 0.21, z));
  g.add(at(box(0.36, 0.006, 0.26, '#f3ead6'), 0.1, 0.455, 0.08, 0, 0.1, 0)); g.add(at(cyl(0.04, 0.05, 0.07, '#1d1b1d', 8), -0.4, 0.49, 0.1));
  return g;
}
export function chair(ornate = false) {
  const g = new THREE.Group(), wood = ornate ? '#b8912a' : '#5a3a24', seat = ornate ? '#8a1f2a' : '#5a3a24';
  const o = ornate ? { metalness: 0.5, roughness: 0.35 } : {};
  g.add(at(mesh(new THREE.BoxGeometry(0.6, 0.08, 0.55), std(seat, ornate ? {} : {})), 0, 0.2, 0));
  for (const [x, z] of [[-0.26, -0.24], [0.26, -0.24], [-0.26, 0.24], [0.26, 0.24]]) g.add(at(mesh(new THREE.BoxGeometry(0.06, 0.2, 0.06), std(wood, o)), x, 0.1, z));
  g.add(at(mesh(new THREE.BoxGeometry(0.62, ornate ? 1.1 : 0.7, 0.07), std(wood, o)), 0, ornate ? 0.75 : 0.55, -0.26));
  if (ornate) {
    g.add(at(mesh(new THREE.BoxGeometry(0.46, 0.8, 0.02), std(seat)), 0, 0.72, -0.22));
    const crest = mesh(new THREE.TorusGeometry(0.2, 0.04, 6, 14, Math.PI), std(wood, o)); crest.position.set(0, 1.3, -0.26); g.add(crest);
    for (const x of [-0.3, 0.3]) g.add(at(mesh(new THREE.BoxGeometry(0.06, 0.06, 0.5), std(wood, o)), x, 0.42, 0));
  }
  return g;
}
export function photoCamera() {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; const leg = mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.1, 5), std('#5a3a24')); leg.position.set(Math.cos(a) * 0.2, 0.52, Math.sin(a) * 0.2); leg.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35); g.add(leg); }
  g.add(at(box(0.3, 0.3, 0.38, '#3a2a1e'), 0, 1.12, 0)); g.add(at(cyl(0.08, 0.1, 0.16, '#1a1a1a', 12), 0, 1.12, 0.26, Math.PI / 2, 0, 0));
  g.add(at(box(0.34, 0.03, 0.4, '#1a1a1a'), 0, 1.29, -0.05));
  g.flash = new THREE.PointLight('#fff6e0', 0, 12, 1.5); g.flash.position.set(0, 1.5, 0.3); g.add(g.flash);
  return g;
}
export function pedestal(text = '', sub = '') {
  const g = new THREE.Group();
  g.add(at(box(1.1, 0.9, 1.1, '#cfc6b4'), 0, 0.45, 0)); g.add(at(box(1.25, 0.12, 1.25, '#bdb3a0'), 0, 0.96, 0)); g.add(at(box(1.25, 0.12, 1.25, '#bdb3a0'), 0, 0.06, 0));
  const tex = canvasTex(512, 256, (c, W, H) => { c.fillStyle = '#3a2f22'; c.fillRect(0, 0, W, H); c.strokeStyle = '#c9a227'; c.lineWidth = 8; c.strokeRect(8, 8, W - 16, H - 16);
    c.fillStyle = '#f0e6cf'; c.textAlign = 'center'; c.font = '800 54px Inter'; c.fillText(text, W / 2, 112); c.font = '600 40px Inter'; c.fillStyle = '#d9c38a'; c.fillText(sub, W / 2, 182); });
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 })); plaque.position.set(0, 0.5, 0.56); g.add(plaque);
  g.top = 1.02; return g;
}
export function cross(seed = 0) {
  const g = new THREE.Group(), r = rng(seed);
  g.add(at(box(0.08, 0.8, 0.06, '#6b4a2f'), 0, 0.4, 0)); g.add(at(box(0.44, 0.07, 0.06, '#6b4a2f'), 0, 0.58, 0)); g.rotation.z = (r() - 0.5) * 0.12;
  return g;
}
export function cempasuchil(n = 12, seed = 0) {
  const g = new THREE.Group(), r = rng(seed);
  for (let i = 0; i < n; i++) { const f = mesh(new THREE.IcosahedronGeometry(0.07 + r() * 0.03, 1), std(r() > 0.3 ? '#f08c1a' : '#f6b21a')); f.position.set((r() - 0.5) * 0.7, 0.08 + r() * 0.06, (r() - 0.5) * 0.5); g.add(f); }
  return g;
}

// ------------------------------------------------------------ military
export function cannon(color = '#3b3f3a') {
  const g = new THREE.Group();
  const barrel = mesh(new THREE.CylinderGeometry(0.06, 0.09, 1.2, 10), std(color, { metalness: 0.4 })); barrel.rotation.x = Math.PI / 2 - 0.12; barrel.position.set(0, 0.5, 0.25); g.add(barrel);
  g.add(at(box(0.4, 0.3, 0.06, '#4a4d48'), 0, 0.45, -0.05));
  for (const s of [-1, 1]) { const w = mesh(new THREE.TorusGeometry(0.3, 0.04, 6, 16), std('#5a3a24')); w.rotation.y = Math.PI / 2; w.position.set(s * 0.28, 0.32, 0); g.add(w);
    for (let k = 0; k < 6; k++) { const sp = box(0.02, 0.56, 0.02, '#5a3a24'); sp.rotation.x = k / 6 * Math.PI; sp.position.set(s * 0.28, 0.32, 0); g.add(sp); } }
  const trail = box(0.08, 0.08, 1.1, '#4a4d48'); trail.position.set(0, 0.2, -0.6); trail.rotation.x = -0.25; g.add(trail);
  g.muzzle = new THREE.Object3D(); g.muzzle.position.set(0, 0.57, 0.85); g.add(g.muzzle);
  return g;
}
export function machineGun() {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + 0.5; const l = mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 5), std('#2a2a2a')); l.position.set(Math.cos(a) * 0.15, 0.2, Math.sin(a) * 0.15); l.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); g.add(l); }
  g.add(at(box(0.12, 0.12, 0.35, '#2a2a2a'), 0, 0.43, 0)); g.add(at(cyl(0.05, 0.05, 0.45, '#3d4a3a', 10), 0, 0.45, 0.35, Math.PI / 2, 0, 0));
  g.add(at(cyl(0.014, 0.014, 0.2, '#1a1a1a', 6), 0, 0.45, 0.66, Math.PI / 2, 0, 0)); g.add(at(box(0.25, 0.2, 0.02, '#3d4a3a'), 0, 0.5, 0.12));
  g.muzzle = new THREE.Object3D(); g.muzzle.position.set(0, 0.45, 0.78); g.add(g.muzzle);
  return g;
}
export function barbedWire(len = 8) {
  const g = new THREE.Group();
  for (let x = -len / 2; x <= len / 2; x += 1) g.add(at(cyl(0.025, 0.03, 0.7, '#5a4632', 5), x, 0.35, 0, 0, 0, (x % 2 ? 0.15 : -0.15)));
  for (const y of [0.25, 0.45, 0.62]) { const w = box(len, 0.01, 0.01, '#5d5d5a'); w.position.y = y; g.add(w);
    for (let x = -len / 2; x < len / 2; x += 0.25) { const b = box(0.06, 0.06, 0.01, '#5d5d5a'); b.position.set(x, y, 0); b.rotation.z = Math.PI / 4; g.add(b); } }
  return g;
}
export function sandbags(n = 6, rows = 2) {
  const g = new THREE.Group();
  for (let r = 0; r < rows; r++) for (let i = 0; i < n - r; i++) { const b = mesh(new THREE.CapsuleGeometry(0.09, 0.22, 2, 6), std('#b8a274')); b.rotation.z = Math.PI / 2; b.position.set((i - (n - r - 1) / 2) * 0.34, 0.09 + r * 0.16, 0); g.add(b); }
  return g;
}

// ------------------------------------------------------------ vehicles
export function steamTrain(cars = 4, { carColor = '#7a4a32' } = {}) {
  const g = new THREE.Group(), loco = new THREE.Group(); g.add(loco);
  const black = std('#232220', { metalness: 0.3, roughness: 0.6 }), red = std('#8a2a22');
  loco.add(at(mesh(new THREE.CylinderGeometry(0.42, 0.42, 2.2, 14), black), 0, 0.95, 0.5, Math.PI / 2, 0, 0));
  loco.add(at(mesh(new THREE.BoxGeometry(1.1, 1.2, 1.1), black), 0, 1.05, -1.0)); loco.add(at(mesh(new THREE.BoxGeometry(1.25, 0.1, 1.3), red), 0, 1.7, -1.0));
  const stack = mesh(new THREE.CylinderGeometry(0.22, 0.1, 0.55, 10), black); stack.position.set(0, 1.55, 1.25); loco.add(stack);
  loco.add(at(mesh(new THREE.SphereGeometry(0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), std('#b8912a', { metalness: 0.6 })), 0, 1.35, 0.4));
  const cc = mesh(new THREE.ConeGeometry(0.55, 0.6, 4), red); cc.rotation.set(Math.PI / 2, Math.PI / 4, 0); cc.scale.set(1, 1, 0.5); cc.position.set(0, 0.35, 1.75); loco.add(cc);
  loco.add(at(mesh(new THREE.BoxGeometry(1.0, 0.3, 3.2), black), 0, 0.4, 0.1));
  loco.add(at(mesh(new THREE.SphereGeometry(0.1, 8, 6), std('#ffe9a8', { emissive: '#ffcf6a', emissiveIntensity: 0.6 })), 0, 1.15, 1.62));
  for (const z of [1.0, 0.2, -0.6]) for (const x of [-0.48, 0.48]) loco.add(at(mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 14), red), x, 0.32, z, 0, 0, Math.PI / 2));
  const tender = new THREE.Group(); tender.position.z = -2.4; g.add(tender);
  tender.add(at(mesh(new THREE.BoxGeometry(1.0, 0.8, 1.6), black), 0, 0.75, 0)); tender.add(at(mesh(new THREE.BoxGeometry(0.9, 0.2, 1.4), std('#1a1918')), 0, 1.2, 0));
  g.cars = [];
  for (let i = 0; i < cars; i++) {
    const c = new THREE.Group(); c.position.z = -4.6 - i * 3.0; g.add(c);
    c.add(at(mesh(new THREE.BoxGeometry(1.1, 1.3, 2.7), std(carColor)), 0, 1.05, 0));
    c.add(at(mesh(new THREE.BoxGeometry(1.2, 0.08, 2.8), std('#4a3424')), 0, 1.74, 0));
    c.add(at(mesh(new THREE.BoxGeometry(0.04, 0.9, 1.0), std('#5a3a24')), 0.56, 1.0, 0));
    c.add(at(mesh(new THREE.BoxGeometry(1.0, 0.25, 2.8), black), 0, 0.3, 0));
    for (const z of [0.9, -0.9]) for (const x of [-0.45, 0.45]) c.add(at(mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.07, 12), black), x, 0.22, z, 0, 0, Math.PI / 2));
    c.roofY = 1.78; g.cars.push(c);
  }
  g.stack = new THREE.Vector3(0, 1.85, 1.25);
  return g;
}
export function steamship(hull = '#24211f', { funnels = 2, funnel = '#d8b04a', name = '' } = {}) {
  const g = new THREE.Group();
  const H = new THREE.Shape(); H.moveTo(-1.3, -6); H.lineTo(1.3, -6); H.lineTo(1.3, 4.5); H.quadraticCurveTo(1.2, 6.2, 0, 7.2); H.quadraticCurveTo(-1.2, 6.2, -1.3, 4.5); H.closePath();
  const hg = new THREE.ExtrudeGeometry(H, { depth: 1.6, bevelEnabled: false }); hg.rotateX(Math.PI / 2); hg.translate(0, 1.6, 0);
  g.add(mesh(hg, std(hull)));
  g.add(at(box(2.6, 0.25, 13.2, '#8a2a22'), 0, 0.12, 0.6));
  g.add(at(box(2.2, 1.1, 6, '#efe9dc'), 0, 2.15, -0.8)); g.add(at(box(1.8, 0.8, 3.4, '#efe9dc'), 0, 3.1, -0.4));
  for (let i = 0; i < 12; i++) g.add(at(cyl(0.07, 0.07, 0.04, '#2a2a2a', 8), 1.11, 2.2, -3.4 + i * 0.5, 0, 0, Math.PI / 2));
  for (let i = 0; i < funnels; i++) { const f = mesh(new THREE.CylinderGeometry(0.42, 0.42, 2.0, 14), std(funnel)); f.position.set(0, 4.3, -1.6 + i * 2.0); f.rotation.x = -0.12; g.add(f);
    g.add(at(cyl(0.43, 0.43, 0.35, '#1a1a1a', 14), 0, 5.2, -1.6 + i * 2.0 - 0.11, -0.12, 0, 0)); }
  for (const z of [-4.5, 5.2]) g.add(at(cyl(0.06, 0.06, 6, '#5a3a24', 6), 0, 4.5, z));
  g.funnelTops = [...Array(funnels)].map((_, i) => new THREE.Vector3(0, 5.5, -1.75 + i * 2.0));
  return g;
}
export function warship() {
  const g = steamship('#7d858c', { funnels: 3, funnel: '#6f777e' });
  for (const z of [4.2, -4.4]) { const tur = new THREE.Group(); tur.position.set(0, 1.9, z); g.add(tur);
    tur.add(at(cyl(0.7, 0.8, 0.5, '#6f777e', 12), 0, 0, 0)); for (const x of [-0.18, 0.18]) tur.add(at(cyl(0.06, 0.07, 1.8, '#5a6168', 8), x, 0.05, z > 0 ? 0.95 : -0.95, Math.PI / 2, 0, 0)); }
  return g;
}
export function ironBridge(len = 12) {
  const g = new THREE.Group(), steel = '#3d3f42';
  g.add(at(box(1.6, 0.18, len, '#4a3a2c'), 0, 0, 0));
  for (const x of [-0.85, 0.85]) {
    g.add(at(box(0.08, 0.08, len, steel), x, 1.4, 0)); g.add(at(box(0.08, 0.08, len, steel), x, 0.1, 0));
    for (let z = -len / 2; z <= len / 2; z += 1.2) { g.add(at(box(0.07, 1.4, 0.07, steel), x, 0.75, z)); const d = box(0.05, 1.85, 0.05, steel); d.position.set(x, 0.75, z + 0.6); d.rotation.x = 0.7; g.add(d); }
  }
  for (let z = -len / 2; z <= len / 2; z += 2.4) g.add(at(box(1.7, 0.06, 0.06, steel), 0, 1.42, z));
  return g;
}
export function telegraph(n = 6, gap = 4) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) { g.add(at(cyl(0.04, 0.05, 2.8, '#5a3a24', 5), i * gap, 1.4, 0)); g.add(at(box(0.6, 0.05, 0.05, '#5a3a24'), i * gap, 2.6, 0)); }
  for (const x of [-0.25, 0.25]) { const w = box(0.012, 0.012, 1, '#2a2a2a'); w.scale.z = (n - 1) * gap; w.rotation.y = Math.PI / 2; w.position.set((n - 1) * gap / 2, 2.62, x); g.add(w); }
  return g;
}
export function woodBuilding(w = 3, h = 2.6, color = '#a88664', sign = '') {
  const g = new THREE.Group();
  g.add(at(box(w, h, 2.4, color), 0, h / 2, 0)); g.add(at(box(w, 0.7, 0.12, color), 0, h + 0.3, 1.14));
  g.add(at(box(w + 0.2, 0.08, 0.9, '#6b4a2f'), 0, h * 0.62, 1.6)); for (const x of [-w / 2, w / 2]) g.add(at(box(0.08, h * 0.62, 0.08, '#6b4a2f'), x, h * 0.31, 2.0));
  g.add(at(box(0.6, 1.2, 0.04, '#3a2a1e'), 0, 0.6, 1.21)); for (const x of [-w * 0.3, w * 0.3]) g.add(at(box(0.5, 0.6, 0.04, '#ffd98a'), x, 1.2, 1.21));
  if (sign) { const tex = canvasTex(512, 96, (c, W, H) => { c.fillStyle = '#3a2a1e'; c.fillRect(0, 0, W, H); c.fillStyle = '#f0e2c0'; c.font = '800 56px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(sign, W / 2, H / 2); });
    const s = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.8, w * 0.15), new THREE.MeshStandardMaterial({ map: tex })); s.position.set(0, h + 0.3, 1.21); g.add(s); }
  return g;
}
export function waterTower() {
  const g = new THREE.Group();
  for (const [x, z] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) g.add(at(box(0.1, 3, 0.1, '#5a3a24'), x, 1.5, z));
  g.add(at(cyl(1.0, 1.0, 1.4, '#7a5a3a', 14), 0, 3.7, 0)); g.add(at(mesh(new THREE.ConeGeometry(1.1, 0.6, 14), std('#5a3a24')), 0, 4.7, 0));
  return g;
}

// ------------------------------------------------------------ effects helpers
// Soft puff texture: a few overlapping radial blobs, so smoke reads as cloud rather than balls.
let PUFF = null;
export function puffTex() {
  if (PUFF) return PUFF;
  PUFF = canvasTex(128, 128, (g, W) => {
    const r = rng(77);
    for (let i = 0; i < 7; i++) {
      const x = W / 2 + (r() - 0.5) * 34, y = W / 2 + (r() - 0.5) * 34, rad = 30 + r() * 22;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.22)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, W, W);
    }
  });
  return PUFF;
}
// Looping smoke puffs from an emitter point (deterministic). Camera-facing soft sprites.
export function smokeTrail(parent, n = 12, { color = '#d8d4cc', size = 0.35, rise = 2.2, drift = [-1.5, 0, 0], life = 2.4, opacity = 0.75 } = {}) {
  const puffs = [...Array(n)].map((_, i) => {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex(), color, transparent: true, depthWrite: false, fog: true }));
    m.userData.ph = i / n; m.material.rotation = i * 2.399; m.renderOrder = 3; parent.add(m); return m;
  });
  return (t, origin, on = 1) => {
    for (const m of puffs) {
      const k = ((t / life + m.userData.ph) % 1);
      const j = m.userData.ph * 17.3;
      m.position.set(origin.x + drift[0] * k + Math.sin(j) * 0.3 * k, origin.y + rise * k, origin.z + drift[2] * k + Math.cos(j) * 0.3 * k);
      m.scale.setScalar(size * 2.6 * (0.55 + k * 2.4)); m.material.opacity = opacity * Math.min(1, k * 7) * (1 - k) * on; m.visible = on > 0.01;
      m.material.rotation = j + k * 0.8;
    }
  };
}

// ------------------------------------------------------------ porfiriato extras
// Bundle of cut sugar cane tied with rope (carried across the back).
export function caneBundle(len = 1.25, n = 10, seed = 5) {
  const g = new THREE.Group(), r = rng(seed), m = [std('#a7b45a'), std('#8fa64a'), std('#c2b86a')];
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2, rr = 0.03 + r() * 0.045, L = len * (0.9 + r() * 0.2);
    const c = mesh(new THREE.CylinderGeometry(0.021, 0.025, L, 5), m[i % 3]); c.rotation.z = Math.PI / 2;
    c.position.set((r() - 0.5) * 0.08, Math.cos(a) * rr, Math.sin(a) * rr); g.add(c);
  }
  for (const x of [-0.28, 0.28]) { const k = mesh(new THREE.TorusGeometry(0.085, 0.014, 5, 14), std('#7a5a36')); k.rotation.y = Math.PI / 2; k.position.x = x; g.add(k); }
  return g;
}
// Company store (tienda de raya): adobe front with an open counter, shelves of goods and a painted sign.
export function tienda() {
  const g = new THREE.Group(), wall = '#d6b88e', wood = '#6b4a2f', dark = '#4a3220';
  // shell: back wall, side walls, roof slab, front wall pieces around a wide opening
  g.add(at(box(6, 3.2, 0.25, wall), 0, 1.6, -1.6));
  for (const x of [-3, 3]) g.add(at(box(0.25, 3.2, 3.4, wall), x, 1.6, 0));
  g.add(at(box(6.3, 0.18, 3.6, new THREE.Color(wall).offsetHSL(0, 0, -0.06).getStyle()), 0, 3.25, 0));
  g.add(at(box(6, 0.9, 0.25, wall), 0, 2.75, 1.6));
  for (const x of [-2.55, 2.55]) g.add(at(box(0.9, 3.2, 0.25, wall), x, 1.6, 1.6));
  for (let i = 0; i < 13; i++) g.add(at(cyl(0.05, 0.05, 0.42, wood, 5), -2.9 + i * 0.48, 3.0, 1.85, Math.PI / 2, 0, 0)); // vigas
  const floor = box(5.8, 0.04, 3.3, '#a88a62'); floor.position.y = 0.02; g.add(floor);
  // shelves with goods on the back wall
  const r = rng(12);
  for (const y of [0.95, 1.5, 2.05]) {
    g.add(at(box(4.6, 0.05, 0.42, wood), 0, y, -1.27));
    for (let x = -2.1; x < 2.15; x += 0.26 + r() * 0.12) {
      const k = r();
      if (k < 0.35) g.add(at(cyl(0.07, 0.07, 0.22, ['#c9a26a', '#9a5a3a', '#e8dcc0'][(r() * 3) | 0], 8), x, y + 0.135, -1.25));          // jars / tins
      else if (k < 0.6) { const b = at(cyl(0.035, 0.045, 0.24, ['#3f6a4a', '#5a3a2a', '#2f4a5a'][(r() * 3) | 0], 8), x, y + 0.145, -1.22); g.add(b); g.add(at(cyl(0.015, 0.02, 0.07, '#2a2a2a', 6), x, y + 0.29, -1.22)); } // bottles
      else if (k < 0.85) { const s = mesh(new THREE.SphereGeometry(0.13, 10, 8), std('#cdb68a')); s.scale.set(1, 0.85, 0.8); s.position.set(x, y + 0.12, -1.24); g.add(s); } // sacks
      else g.add(at(box(0.2, 0.14, 0.18, '#b07a4a'), x, y + 0.095, -1.24));                                                              // boxes
    }
  }
  // sacks of corn and beans on the floor, a barrel
  for (const [x, z, c] of [[-2.3, 0.6, '#d9c08f'], [-2.0, 1.05, '#cdb68a'], [2.3, 0.8, '#c9b07f']]) { const s = mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.5, 10), std(c)); s.position.set(x, 0.25, z); g.add(s);
    const top = mesh(new THREE.SphereGeometry(0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), std(x < 0 && z > 1 ? '#7a2a22' : '#e8c35a')); top.position.set(x, 0.5, z); top.scale.y = 0.4; g.add(top); }
  g.add(at(cyl(0.24, 0.24, 0.62, '#7a5232', 12), 2.25, 0.31, 0.15));
  // counter
  const ctr = new THREE.Group(); ctr.position.set(0, 0, 0.35); g.add(ctr);
  ctr.add(at(box(2.8, 0.5, 0.08, wood), 0, 0.25, 0.26)); for (const x of [-1.4, 1.4]) ctr.add(at(box(0.08, 0.5, 0.55, wood), x, 0.25, 0));
  ctr.add(at(box(2.95, 0.06, 0.66, '#7d5a3a'), 0, 0.53, 0));
  for (let i = 0; i < 6; i++) ctr.add(at(box(0.36, 0.3, 0.02, dark), -1.15 + i * 0.46, 0.25, 0.305));
  // ledger, inkwell and a scale on the counter
  const book = new THREE.Group(); book.position.set(-0.35, 0.565, 0.02); book.rotation.y = 0.25; ctr.add(book);
  book.add(at(box(0.42, 0.025, 0.3, '#3a2418'), 0, 0, 0)); for (const s of [-1, 1]) book.add(at(box(0.19, 0.012, 0.27, '#f3ead6'), s * 0.1, 0.018, 0, 0, 0, -s * 0.06));
  ctr.add(at(cyl(0.035, 0.04, 0.06, '#1d1b1d', 8), 0.0, 0.59, -0.05));
  const sc = new THREE.Group(); sc.position.set(0.9, 0.56, 0); ctr.add(sc);
  sc.add(at(cyl(0.012, 0.02, 0.3, '#8a6a2a', 6), 0, 0.15, 0)); sc.add(at(box(0.4, 0.015, 0.015, '#8a6a2a'), 0, 0.3, 0));
  for (const s of [-1, 1]) sc.add(at(cyl(0.08, 0.06, 0.02, '#b8912a', 10), s * 0.19, 0.2, 0));
  g.ledger = new THREE.Vector3(-0.35, 0.6, 0.37);
  return g;
}
