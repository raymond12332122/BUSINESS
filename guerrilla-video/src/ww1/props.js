// Props for the First World War video. Scale: chibi ≈ 1.1 tall, so vehicles and buildings are ≈ real size × 0.65.
import * as THREE from 'three';
import * as LP from '../lib/props.js';
import * as MX from '../mx/props.js';
import * as RP from '../rusia/props.js';
export { RP, MX };
const { at, box, cyl, mesh, rng } = LP;
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.82, ...o });
export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const lathe = (profile, color, seg = 24, o = {}) => mesh(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg), std(color, { side: THREE.DoubleSide, ...o }));
const roundel = (r, cols) => { const g = new THREE.Group(); cols.forEach((c, i) => { const d = mesh(new THREE.CircleGeometry(r * (1 - i / cols.length), 20), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); d.position.z = i * 0.002; g.add(d); }); return g; };
function crossPattee(size = 0.3, col = '#141414', border = '#f2f2f2') {
  const g = new THREE.Group();
  const arm = (s, c, z) => { const sh = new THREE.Shape(); sh.moveTo(-s * 0.12, 0); sh.lineTo(s * 0.12, 0); sh.lineTo(s * 0.3, s); sh.lineTo(-s * 0.3, s); sh.closePath();
    for (let k = 0; k < 4; k++) { const m = mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.rotation.z = k * Math.PI / 2; m.position.z = z; g.add(m); } };
  arm(size * 0.55, border, 0); arm(size * 0.45, col, 0.002); return g;
}
export { roundel, crossPattee };

// ------------------------------------------------------------ vehicles
// British Mark I/V tank: rhomboid hull with tracks running all round, side sponsons with guns.
export function markTank(color = '#6a6448', { female = false } = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const s = new THREE.Shape(); s.moveTo(-3.1, 0.25); s.lineTo(-2.1, 0); s.lineTo(2.2, 0); s.lineTo(3.25, 0.9); s.lineTo(2.9, 1.55); s.lineTo(-2.7, 1.55); s.lineTo(-3.25, 1.0); s.closePath();
  for (const z of [-1.0, 0.62]) { const geo = new THREE.ExtrudeGeometry(s, { depth: 0.38, bevelEnabled: false }); geo.translate(0, 0, z); const m = mesh(geo, std(color, { roughness: 0.75 })); m.castShadow = true; body.add(m);
    const tr = new THREE.ExtrudeGeometry(s, { depth: 0.4, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.06, bevelSegments: 1 }); tr.scale(1.0, 1.0, 1.0); tr.translate(0, 0, z - 0.01);
    const tm = mesh(tr, std('#3a3628', { roughness: 0.9 })); tm.scale.set(1.012, 1.03, 1); tm.position.y = -0.02; body.add(tm); }
  body.add(at(box(4.6, 1.15, 1.25, color), -0.1, 0.95, 0));
  body.add(at(box(1.0, 0.45, 0.9, color), -0.9, 1.75, 0));
  for (const sz of [-1, 1]) { const sp = new THREE.Group(); sp.position.set(0.1, 0.85, sz * 1.15); body.add(sp);
    sp.add(at(box(1.0, 0.75, 0.5, color), 0, 0, 0)); sp.add(at(cyl(female ? 0.05 : 0.07, female ? 0.05 : 0.07, female ? 0.6 : 0.9, '#2a2a24', 8), 0.55, 0.05, sz * 0.12, 0, 0, Math.PI / 2)); }
  // track plates (stripes) for texture
  for (let i = 0; i < 22; i++) { const x = -2.9 + i * 0.28; for (const z of [-1.21, 1.21]) body.add(at(box(0.05, 0.08, 0.02, '#2a2620'), x, 0.05, z)); }
  g.body = body; g.userData.dynamic = false; return g;
}
// 1910 open touring car (Gräf & Stift double phaeton) with folded roof, flags and running boards.
export function tourer(color = '#1e2a24', { flags = true, roofDown = true } = {}) {
  const g = new THREE.Group();
  g.add(at(box(2.9, 0.42, 1.08, color), 0, 0.55, 0));
  g.add(at(box(0.85, 0.36, 0.95, '#2a2a2a'), 1.55, 0.62, 0));                      // bonnet
  g.add(at(box(0.08, 0.42, 0.85, '#8a8a8a', ), 2.0, 0.66, 0));                       // radiator
  g.add(at(box(0.1, 0.36, 1.08, color), -0.15, 0.95, 0));                            // seat divide
  for (const [x, w] of [[0.55, 0.5], [-0.75, 0.75]]) { g.add(at(box(w, 0.12, 0.92, '#5a2a24'), x, 0.82, 0)); g.add(at(box(0.1, 0.36, 0.92, '#5a2a24'), x - w / 2, 0.98, 0)); }
  if (roofDown) { const rf = mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.0, 10, 1, false, 0, Math.PI), std('#1a1a1a')); rf.rotation.set(Math.PI / 2, 0, Math.PI / 2); rf.position.set(-1.35, 0.92, 0); g.add(rf); }
  g.add(at(box(0.04, 0.28, 0.9, '#9ab0b8', { }), 1.1, 1.12, 0));                     // windscreen
  for (const sz of [-1, 1]) { g.add(at(box(2.2, 0.04, 0.22, '#1a1a1a'), 0.2, 0.32, sz * 0.62));   // running boards
    for (const x of [1.4, -1.0]) { const w = new THREE.Group(); w.position.set(x, 0.36, sz * 0.52); g.add(w);
      w.add(at(cyl(0.36, 0.36, 0.1, '#1a1a1a', 18), 0, 0, 0, Math.PI / 2, 0, 0)); w.add(at(cyl(0.22, 0.22, 0.11, '#c9b88a', 14), 0, 0, 0, Math.PI / 2, 0, 0));
      for (let k = 0; k < 6; k++) w.add(at(box(0.03, 0.4, 0.03, '#c9b88a'), 0, 0, 0, 0, 0, k * Math.PI / 6)); }
    g.add(at(box(0.7, 0.05, 0.28, '#1a1a1a'), 1.4, 0.72, sz * 0.52)); g.add(at(box(0.7, 0.05, 0.28, '#1a1a1a'), -1.0, 0.72, sz * 0.52)); }
  for (const sz of [-1, 1]) g.add(at(mesh(new THREE.SphereGeometry(0.09, 12, 8), std('#e8e2c8', { emissive: '#3a3020' })), 2.05, 0.92, sz * 0.36));
  g.add(at(cyl(0.02, 0.02, 0.3, '#2a2a2a', 6), 0.9, 0.95, 0.25, 0, 0, -0.5)); g.add(at(cyl(0.12, 0.12, 0.02, '#2a2a2a', 16), 0.8, 1.06, 0.25, 0, 0, Math.PI / 2 - 0.5));
  if (flags) for (const sz of [-1, 1]) { g.add(at(cyl(0.012, 0.012, 0.5, '#c9a227', 5), 1.95, 1.05, sz * 0.5)); const f = new THREE.Group(); f.position.set(1.95, 1.22, sz * 0.5); g.add(f);
    f.add(at(box(0.004, 0.09, 0.22, '#f2c12e'), 0, 0.045, -0.11)); f.add(at(box(0.004, 0.09, 0.22, '#141414'), 0, -0.045, -0.11)); }
  g.seats = { front: [0.55, 0.88], back: [-0.75, 0.88] }; return g;
}
// Renault AG1 taxi of the Marne: red-and-black landaulet.
export function taxiMarne(color = '#8a2a24') {
  const g = new THREE.Group();
  g.add(at(box(2.2, 0.5, 1.0, '#1a1a1a'), 0, 0.6, 0));
  g.add(at(box(1.2, 0.75, 0.98, color), -0.45, 1.2, 0));
  g.add(at(box(0.62, 0.3, 0.9, '#1a1a1a'), 0.95, 0.7, 0));
  const hood = mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.62, 3, 1), std('#1a1a1a')); hood.rotation.set(0, 0, Math.PI / 2); hood.scale.set(1, 1, 0.65); hood.position.set(0.95, 0.78, 0); g.add(hood);
  for (const sz of [-1, 1]) { for (const x of [0.75, -0.75]) { const w = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 16), std('#141414')); w.rotation.x = Math.PI / 2; w.position.set(x, 0.3, sz * 0.48); g.add(w);
      g.add(at(cyl(0.18, 0.18, 0.09, '#9a2a24', 12), x, 0.3, sz * 0.49, Math.PI / 2, 0, 0)); }
    g.add(at(box(0.5, 0.42, 0.02, '#9ab0b8'), -0.45, 1.25, sz * 0.5)); }
  g.add(at(box(0.04, 0.45, 0.85, '#9ab0b8'), 0.35, 1.15, 0));
  g.add(at(box(0.18, 0.14, 0.14, '#e8e2c8'), 0.5, 1.3, 0.3));
  return g;
}
// Biplane (Allied: SPAD/Sopwith style) or Fokker Dr.I triplane (red). Faces +z.
export function warplane({ kind = 'biplane', color = '#8a7a4a', roundelCols = ['#1f3f8f', '#f2f2f2', '#c8302a'], cross = false } = {}) {
  const g = new THREE.Group(), m = c => std(c, { roughness: 0.7 });
  const fus = mesh(new THREE.CylinderGeometry(0.2, 0.06, 2.4, 8), m(color)); fus.rotation.x = Math.PI / 2; g.add(fus);
  g.add(at(cyl(0.24, 0.2, 0.32, '#2a2a2a', 12), 0, 0, 1.25, Math.PI / 2, 0, 0));
  const tiers = kind === 'tri' ? [-0.18, 0.18, 0.54] : [-0.16, 0.42];
  for (const y of tiers) g.add(at(box(kind === 'tri' ? 2.6 : 3.4, 0.05, 0.5, color), 0, y, 0.55));
  for (const x of [-1.0, 1.0]) g.add(at(box(0.04, tiers[tiers.length - 1] - tiers[0], 0.04, '#3a3024'), x, (tiers[0] + tiers[tiers.length - 1]) / 2, 0.55));
  for (const x of [-0.25, 0.25]) g.add(at(box(0.03, 0.4, 0.03, '#3a3024'), x, tiers[tiers.length - 1] / 2, 0.75));
  g.add(at(box(1.2, 0.03, 0.35, color), 0, 0.05, -1.05)); g.add(at(box(0.03, 0.42, 0.35, color), 0, 0.24, -1.1));
  for (const x of [-0.3, 0.3]) { g.add(at(box(0.03, 0.35, 0.03, '#2a2a2a'), x, -0.38, 0.7)); g.add(at(cyl(0.12, 0.12, 0.06, '#1a1a1a', 12), x, -0.56, 0.7, 0, 0, Math.PI / 2)); }
  const prop = new THREE.Group(); prop.position.z = 1.43; g.add(prop); prop.add(at(box(0.08, 1.0, 0.02, '#6a4a2a'), 0, 0, 0));
  const disc = mesh(new THREE.CircleGeometry(0.5, 20), new THREE.MeshBasicMaterial({ color: '#cfc8b8', transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false })); prop.add(disc);
  const top = tiers[tiers.length - 1];
  if (cross) { for (const x of [-1.15, 1.15]) { const c = crossPattee(0.42); c.rotation.x = -Math.PI / 2; c.position.set(x, top + 0.03, 0.55); g.add(c); } const t = crossPattee(0.32); t.rotation.y = Math.PI / 2; t.position.set(0.02, 0.25, -1.1); g.add(t); }
  else { for (const x of [-1.2, 1.2]) { const r = roundel(0.2, roundelCols); r.rotation.x = -Math.PI / 2; r.position.set(x, top + 0.03, 0.55); g.add(r); } }
  g.prop = prop; return g;
}
// Zeppelin: grey cigar hull with gondolas and cruciform fins. Long axis along x.
export function zeppelin(len = 22, color = '#a8aaa4') {
  const g = new THREE.Group();
  const prof = []; for (let i = 0; i <= 24; i++) { const u = i / 24, x = (u - 0.5) * len; const r = len * 0.075 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.08)), 0.55); prof.push([Math.max(0.001, r), x]); }
  const hull = lathe(prof, color, 24, { roughness: 0.6 }); hull.rotation.z = -Math.PI / 2; g.add(hull);
  for (let i = 1; i < 12; i++) { const x = (i / 12 - 0.5) * len; const r = len * 0.075 * Math.pow(Math.sin(Math.PI * Math.min(1, (i / 12) * 1.08)), 0.55); const ring = mesh(new THREE.TorusGeometry(r + 0.01, 0.025, 4, 24), std('#8a8c86')); ring.rotation.y = Math.PI / 2; ring.position.x = x; g.add(ring); }
  for (const [x, l] of [[len * 0.22, 1.6], [-len * 0.12, 1.2]]) g.add(at(box(l, 0.45, 0.55, '#6a6c66'), x, -len * 0.075 - 0.25, 0));
  for (const k of [0, 1, 2, 3]) { const f = box(len * 0.12, 0.05, len * 0.08, color); const a = k * Math.PI / 2; f.position.set(-len * 0.42, Math.sin(a) * len * 0.06, Math.cos(a) * len * 0.06); f.rotation.x = a; g.add(f); }
  return g;
}
// WWI U-boat: long low hull, conning tower, deck gun. Faces +x.
export function uboat(color = '#4a5058') {
  const g = new THREE.Group();
  const hull = mesh(new THREE.CapsuleGeometry(0.42, 7.0, 6, 14), std(color, { roughness: 0.55 })); hull.rotation.z = Math.PI / 2; hull.scale.set(1, 1, 0.8); g.add(hull);
  g.add(at(box(6.4, 0.12, 0.7, '#3a3e44'), 0, 0.38, 0));
  const tower = new THREE.Group(); tower.position.set(0.4, 0.4, 0); g.add(tower);
  tower.add(at(box(1.1, 0.75, 0.55, color), 0, 0.37, 0)); tower.add(at(cyl(0.03, 0.03, 0.9, '#2a2a2a', 6), 0.2, 1.15, 0)); tower.add(at(cyl(0.02, 0.02, 1.2, '#2a2a2a', 6), -0.2, 1.3, 0));
  g.add(at(cyl(0.05, 0.05, 0.8, '#2a2a2a', 8), 2.0, 0.62, 0, 0, 0, Math.PI / 2 - 0.15)); g.add(at(box(0.3, 0.3, 0.3, '#3a3e44'), 1.8, 0.55, 0));
  g.tower = tower; return g;
}
// Ocean liner with four funnels (Lusitania): black hull, white superstructure, red-black funnels. Faces +x.
export function liner(len = 26, { name = 'LUSITANIA' } = {}) {
  const g = new THREE.Group(), w = len * 0.11;
  const s = new THREE.Shape(); s.moveTo(-len / 2, 0); s.lineTo(len / 2 - 1.5, 0); s.quadraticCurveTo(len / 2 + 0.3, 0.6, len / 2 + 0.6, 2.4); s.lineTo(-len / 2 - 0.4, 2.3); s.quadraticCurveTo(-len / 2 - 0.2, 0.8, -len / 2, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false }); geo.translate(0, -1.0, -w / 2);
  g.add(mesh(geo, std('#141416', { roughness: 0.6 })));
  g.add(at(box(len + 0.4, 0.1, w + 0.02, '#8a2a24'), 0, -0.6, 0));
  g.add(at(box(len * 0.66, 0.9, w * 0.86, '#f2efe6'), -0.4, 1.75, 0)); g.add(at(box(len * 0.5, 0.6, w * 0.8, '#f2efe6'), -0.6, 2.5, 0));
  for (let i = 0; i < 30; i++) for (const y of [0.7, 1.75]) g.add(at(box(0.18, 0.12, 0.02, '#2a2a2a'), -len * 0.42 + i * len * 0.028, y, w / 2 + 0.01));
  for (let i = 0; i < 4; i++) { const f = new THREE.Group(); f.position.set(-len * 0.24 + i * len * 0.135, 2.8, 0); g.add(f);
    f.add(at(cyl(0.55, 0.6, 2.6, '#b8342a', 16), 0, 1.3, 0)); f.add(at(cyl(0.56, 0.56, 0.7, '#141414', 16), 0, 2.4, 0)); f.rotation.z = 0.08; }
  for (const x of [-len * 0.36, len * 0.36]) g.add(at(cyl(0.08, 0.1, 5.0, '#d8d2c2', 6), x, 4.5, 0));
  for (let i = 0; i < 8; i++) for (const sz of [-1, 1]) g.add(at(box(0.9, 0.3, 0.35, '#f2efe6'), -len * 0.3 + i * len * 0.075, 2.35, sz * (w / 2 - 0.1)));
  if (name) { const t = canvasTex(512, 64, (x, W, H) => { x.fillStyle = '#141416'; x.fillRect(0, 0, W, H); x.fillStyle = '#e8d9a8'; x.font = 'bold 44px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(name, W / 2, H / 2); });
    const p = mesh(new THREE.PlaneGeometry(3.2, 0.4), new THREE.MeshBasicMaterial({ map: t })); p.position.set(len / 2 - 2.2, 1.0, w / 2 + 0.02); g.add(p); }
  return g;
}
// Heavy howitzer (with a recoiling barrel) and the French 75 field gun.
export function howitzer(color = '#5a5e4e') {
  const g = new THREE.Group();
  for (const sz of [-1, 1]) { g.add(at(cyl(0.55, 0.55, 0.14, '#3a3426', 16), 0, 0.55, sz * 0.62, Math.PI / 2, 0, 0)); for (let k = 0; k < 8; k++) g.add(at(box(0.05, 1.0, 0.05, '#4a4232'), 0, 0.55, sz * 0.62, 0, 0, k * Math.PI / 8)); }
  g.add(at(box(0.5, 0.35, 1.1, color), 0, 0.7, 0)); g.add(at(box(2.2, 0.16, 0.3, color), -1.2, 0.35, 0, 0, 0, 0.18));
  const cradle = new THREE.Group(); cradle.position.set(0.1, 0.95, 0); cradle.rotation.z = 0.55; g.add(cradle);
  const barrel = new THREE.Group(); cradle.add(barrel);
  barrel.add(at(cyl(0.17, 0.2, 1.9, '#3a3e36', 14), 0.7, 0, 0, 0, 0, Math.PI / 2)); barrel.add(at(cyl(0.24, 0.24, 0.5, '#3a3e36', 14), -0.25, 0, 0, 0, 0, Math.PI / 2));
  g.add(at(box(0.6, 0.6, 0.06, color), 0.3, 1.2, 0.42)); g.add(at(box(0.6, 0.6, 0.06, color), 0.3, 1.2, -0.42));
  g.barrel = barrel; g.muzzle = new THREE.Vector3(1.75, 0, 0); g.cradle = cradle;
  g.recoil = (t, tf) => { const k = t >= tf ? Math.max(0, 1 - (t - tf) / 0.5) : 0; barrel.position.x = -0.35 * k * k; };
  return g;
}
export function gun75(color = '#5a6a5a') {
  const g = new THREE.Group();
  for (const sz of [-1, 1]) { g.add(at(cyl(0.42, 0.42, 0.08, '#4a3a2a', 16), 0, 0.42, sz * 0.5, Math.PI / 2, 0, 0)); for (let k = 0; k < 7; k++) g.add(at(box(0.04, 0.8, 0.04, '#5a4a32'), 0, 0.42, sz * 0.5, 0, 0, k * Math.PI / 7)); }
  g.add(at(box(0.08, 0.7, 0.85, color), 0.15, 0.62, 0));
  const barrel = new THREE.Group(); barrel.position.set(0.1, 0.62, 0); barrel.rotation.z = 0.12; g.add(barrel);
  barrel.add(at(cyl(0.06, 0.08, 1.6, '#3a4038', 12), 0.75, 0, 0, 0, 0, Math.PI / 2)); barrel.add(at(box(0.9, 0.16, 0.18, color), 0.1, -0.08, 0));
  g.add(at(box(1.6, 0.1, 0.12, color), -0.8, 0.3, 0, 0, 0, 0.25));
  g.barrel = barrel; g.recoil = (t, tf) => { const k = t >= tf ? Math.max(0, 1 - (t - tf) / 0.35) : 0; barrel.children.forEach(c => c.position.x = c.userData.x0 ?? (c.userData.x0 = c.position.x)); barrel.position.x = 0.1 - 0.25 * k * k; };
  return g;
}

// ------------------------------------------------------------ battlefield
// Barbed-wire entanglement on wooden stakes (x-length l), denser than the Mexican fence.
export function wire(l = 6, seed = 1) {
  const g = new THREE.Group(), r = rng(seed), wm = std('#4a443c', { metalness: 0.4, roughness: 0.6 });
  const n = Math.max(2, Math.round(l / 1.2));
  for (let i = 0; i <= n; i++) { const x = -l / 2 + i * l / n; g.add(at(cyl(0.025, 0.03, 0.75, '#4a3a28', 5), x, 0.36, 0, (r() - 0.5) * 0.3, 0, (r() - 0.5) * 0.25)); g.add(at(cyl(0.02, 0.025, 0.65, '#4a3a28', 5), x + 0.1, 0.3, 0.35, 0.5, 0, 0)); }
  for (let k = 0; k < 3; k++) { const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push(new THREE.Vector3(-l / 2 + u * l, 0.18 + 0.2 * k + 0.08 * Math.sin(u * 37 + k), 0.12 * Math.sin(u * 23 + k * 2))); }
    g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.008, 3, false), wm)); }
  const coil = []; for (let i = 0; i <= 160; i++) { const u = i / 160, a = u * l * 6.5; coil.push(new THREE.Vector3(-l / 2 + u * l, 0.22 + 0.2 * Math.sin(a), 0.6 + 0.2 * Math.cos(a))); }
  g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil), 320, 0.007, 3, false), wm));
  return g;
}
// Ladder to go over the top.
export function ladder(h = 1.6, color = '#6a5034') { const g = new THREE.Group(); for (const x of [-0.17, 0.17]) g.add(at(box(0.05, h, 0.05, color), x, h / 2, 0)); for (let y = 0.22; y < h; y += 0.26) g.add(at(box(0.36, 0.04, 0.04, color), 0, y, 0)); return g; }
// Trench periscope.
export function periscope() { const g = new THREE.Group(); g.add(at(box(0.08, 0.9, 0.06, '#5a5038'), 0, 0.45, 0)); g.add(at(box(0.08, 0.1, 0.14, '#5a5038'), 0, 0.92, 0.04)); g.add(at(box(0.06, 0.06, 0.01, '#9ab0c0'), 0, 0.92, 0.111)); return g; }
// Wooden duckboard section.
export function duckboard(l = 2) { const g = new THREE.Group(); for (const z of [-0.18, 0.18]) g.add(at(box(l, 0.05, 0.05, '#4a3a26'), 0, 0.03, z)); for (let x = -l / 2 + 0.08; x < l / 2; x += 0.16) g.add(at(box(0.11, 0.03, 0.48, '#6b5238'), x, 0.07, 0)); return g; }
// Rat (low-poly) for the trench floor.
export function rat(col = '#3a3430') { const g = new THREE.Group(); const b = mesh(new THREE.SphereGeometry(0.06, 8, 6), std(col)); b.scale.set(1.6, 0.8, 0.9); b.position.y = 0.045; g.add(b); g.add(at(mesh(new THREE.ConeGeometry(0.035, 0.07, 6), std(col)), 0.11, 0.045, 0, 0, 0, -Math.PI / 2)); g.add(at(cyl(0.006, 0.003, 0.16, '#6a5a50', 4), -0.15, 0.03, 0, 0, 0, Math.PI / 2 - 0.3)); return g; }
// Small decorated Christmas tree with candles (Christmas truce, 1914).
export function xmasTree(h = 0.9) {
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++) g.add(at(mesh(new THREE.ConeGeometry(h * (0.34 - i * 0.07), h * 0.36, 9), std('#2f5a3a', { roughness: 0.9 })), 0, h * (0.32 + i * 0.17), 0));
  g.add(at(cyl(0.035, 0.04, h * 0.25, '#4a3020', 6), 0, h * 0.12, 0));
  g.candles = [];
  for (let i = 0; i < 9; i++) { const a = i * 2.4, y = h * (0.35 + (i % 4) * 0.15), r = h * (0.27 - (i % 4) * 0.05);
    const c = new THREE.Group(); c.position.set(Math.cos(a) * r, y, Math.sin(a) * r); g.add(c);
    c.add(at(cyl(0.008, 0.008, 0.05, '#f2ecd8', 5), 0, 0.025, 0)); const fl = mesh(new THREE.SphereGeometry(0.012, 6, 4), new THREE.MeshBasicMaterial({ color: '#ffd27a' })); fl.scale.y = 1.8; fl.position.y = 0.065; c.add(fl); g.candles.push(fl); }
  const l = new THREE.PointLight('#ffcf8a', 1.6, 4, 1.6); l.position.y = h * 0.6; g.add(l);
  return g;
}
export function football() { return mesh(new THREE.IcosahedronGeometry(0.085, 1), std('#7a4a2a', { flatShading: true })); }
// Gas cloud: big soft yellow-green puffs drifting along +z; cloud.update(t, k) with k = 0..1 spread.
let PUFF = null;
function puffTex() {
  if (PUFF) return PUFF; const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const gr = x.createRadialGradient(32, 32, 2, 32, 32, 31); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  PUFF = new THREE.CanvasTexture(c); return PUFF;
}
export function gasCloud(parent, { n = 40, w = 24, color = '#b9c46a', size = 3.2, opacity = 0.55, seed = 3 } = {}) {
  const r = rng(seed), g = new THREE.Group(); parent.add(g);
  const ps = [...Array(n)].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex(), color, transparent: true, depthWrite: false, opacity: 0 })); s.userData = { x: (r() - 0.5) * w, z: r() * 4, ph: r() * 6, s: size * (0.7 + r() * 0.6) }; s.renderOrder = 5; g.add(s); return s; });
  g.userData.dynamic = true;
  g.update = (t, front = 0, k = 1) => ps.forEach(s => { const u = s.userData; const z = front - u.z; s.position.set(u.x + Math.sin(t * 0.4 + u.ph) * 0.6, u.s * 0.32 + 0.1 * Math.sin(t + u.ph), z); s.scale.setScalar(u.s * (1 + 0.15 * Math.sin(t * 0.7 + u.ph))); s.material.opacity = opacity * k; s.visible = k > 0.01; });
  return g;
}
// Field of poppies (instanced red flowers with dark centres).
export function poppies(parent, n = 600, [x0, z0, x1, z1] = [-10, -10, 10, 10], seed = 9, avoid = []) {
  const r = rng(seed), geo = new THREE.CircleGeometry(0.06, 7); geo.rotateX(-Math.PI / 2);
  const red = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: '#c8231e', roughness: 0.8, side: THREE.DoubleSide }), n);
  const stem = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.006, 0.006, 1, 4), new THREE.MeshStandardMaterial({ color: '#3f6a2a' }), n);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  let k = 0;
  for (let i = 0; i < n * 3 && k < n; i++) {
    const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0); if (avoid.some(([ax, az, rr]) => (x - ax) ** 2 + (z - az) ** 2 < rr * rr)) continue;
    const h = 0.18 + r() * 0.22, s = 0.7 + r() * 0.6;
    e.set((r() - 0.5) * 0.5, r() * 6, (r() - 0.5) * 0.5); q.setFromEuler(e);
    m.compose(new THREE.Vector3(x, h, z), q, new THREE.Vector3(s, s, s)); red.setMatrixAt(k, m);
    m.compose(new THREE.Vector3(x, h / 2, z), new THREE.Quaternion(), new THREE.Vector3(1, h, 1)); stem.setMatrixAt(k, m); k++;
  }
  red.count = stem.count = k; parent.add(red, stem); return red;
}
// White Latin cross (war cemetery).
export function whiteCross(h = 0.9) { const g = new THREE.Group(); g.add(at(box(0.08, h, 0.06, '#f2f0ea'), 0, h / 2, 0)); g.add(at(box(0.42, 0.08, 0.06, '#f2f0ea'), 0, h * 0.72, 0)); return g; }
// Powder keg with a burning fuse (the Balkans).
export function powderKeg(s = 1) {
  const g = new THREE.Group();
  g.add(at(lathe([[0.3, 0], [0.36, 0.2], [0.38, 0.4], [0.36, 0.6], [0.3, 0.8]], '#7a5232', 20), 0, 0, 0));
  for (const y of [0.1, 0.4, 0.7]) { const h = mesh(new THREE.TorusGeometry(0.36 - Math.abs(y - 0.4) * 0.15, 0.018, 5, 24), std('#2a2a2a', { metalness: 0.5 })); h.rotation.x = Math.PI / 2; h.position.y = y; g.add(h); }
  g.add(at(cyl(0.3, 0.3, 0.02, '#5a3a24', 20), 0, 0.8, 0));
  const t = canvasTex(256, 96, (x, W, H) => { x.fillStyle = '#e8d9b0'; x.fillRect(0, 0, W, H); x.fillStyle = '#141414'; x.font = 'bold 52px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('PÓLVORA', W / 2, H / 2 + 4); });
  const lab = mesh(new THREE.CylinderGeometry(0.381, 0.381, 0.2, 24, 1, true, -0.9, 1.8), new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 })); lab.position.y = 0.45; g.add(lab);
  const fuse = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0, 0.8, 0], [0.05, 0.95, 0.02], [0.15, 1.02, 0.08], [0.25, 1.0, 0.1]].map(v => new THREE.Vector3(...v))), 12, 0.012, 4), std('#3a3020')); g.add(fuse);
  const spark = mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffd27a' })); spark.position.set(0.25, 1.0, 0.1); g.add(spark);
  g.spark = spark; g.scale.setScalar(s); return g;
}
// Domino tile with a national flag on its face: tile.fall(k) tips it over (k = 0..1) towards +z.
export function domino(flagDraw, { w = 0.8, h = 1.6, d = 0.22 } = {}) {
  const g = new THREE.Group(), pivot = new THREE.Group(); pivot.position.z = d / 2; g.add(pivot);
  const t = canvasTex(160, 320, (x, W, H) => { x.fillStyle = '#f3ead6'; x.fillRect(0, 0, W, H); x.save(); x.translate(12, 12); flagDraw(x, W - 24, H * 0.55); x.restore(); x.fillStyle = '#1a1a1a'; for (const [cx, cy] of [[W / 2, H * 0.82]]) { x.beginPath(); x.arc(cx, cy, 12, 0, 7); x.fill(); } });
  const face = new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }); const mats = [std('#e8dfc8'), std('#e8dfc8'), std('#e8dfc8'), std('#e8dfc8'), face, face];
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats); b.castShadow = true; b.position.set(0, h / 2, -d / 2); pivot.add(b);
  g.fall = k => { pivot.rotation.x = Math.min(1, k) * 1.38; }; g.userData.dynamic = true; return g;
}
export const FLAGS = {
  aut: (x, W, H) => { x.fillStyle = '#141414'; x.fillRect(0, 0, W, H / 2); x.fillStyle = '#f2c12e'; x.fillRect(0, H / 2, W, H / 2); },
  srb: (x, W, H) => { ['#c6363c', '#0c4076', '#f2f2f2'].forEach((c, i) => { x.fillStyle = c; x.fillRect(0, i * H / 3, W, H / 3); }); },
  rus: (x, W, H) => { ['#f2f2f2', '#1c57a5', '#d52b1e'].forEach((c, i) => { x.fillStyle = c; x.fillRect(0, i * H / 3, W, H / 3); }); },
  ger: (x, W, H) => { ['#141414', '#f2f2f2', '#d52b1e'].forEach((c, i) => { x.fillStyle = c; x.fillRect(0, i * H / 3, W, H / 3); }); },
  fra: (x, W, H) => { ['#1f3f8f', '#f2f2f2', '#d52b1e'].forEach((c, i) => { x.fillStyle = c; x.fillRect(i * W / 3, 0, W / 3, H); }); },
  bel: (x, W, H) => { ['#141414', '#f2c12e', '#d52b1e'].forEach((c, i) => { x.fillStyle = c; x.fillRect(i * W / 3, 0, W / 3, H); }); },
  gbr: (x, W, H) => { x.fillStyle = '#1f3f8f'; x.fillRect(0, 0, W, H); x.strokeStyle = '#f2f2f2'; x.lineWidth = H * 0.2; x.beginPath(); x.moveTo(0, 0); x.lineTo(W, H); x.moveTo(W, 0); x.lineTo(0, H); x.stroke();
    x.strokeStyle = '#d52b1e'; x.lineWidth = H * 0.07; x.stroke(); x.fillStyle = '#f2f2f2'; x.fillRect(W * 0.4, 0, W * 0.2, H); x.fillRect(0, H * 0.38, W, H * 0.24); x.fillStyle = '#d52b1e'; x.fillRect(W * 0.44, 0, W * 0.12, H); x.fillRect(0, H * 0.43, W, H * 0.14); },
  usa: (x, W, H) => { for (let i = 0; i < 13; i++) { x.fillStyle = i % 2 ? '#f2f2f2' : '#b22234'; x.fillRect(0, i * H / 13, W, H / 13 + 1); } x.fillStyle = '#3c3b6e'; x.fillRect(0, 0, W * 0.45, H * 0.54); x.fillStyle = '#f2f2f2'; for (let i = 0; i < 5; i++) for (let j = 0; j < 6; j++) { x.beginPath(); x.arc(6 + j * W * 0.072, 6 + i * H * 0.1, 2.2, 0, 7); x.fill(); } },
  ita: (x, W, H) => { ['#008c45', '#f2f2f2', '#cd212a'].forEach((c, i) => { x.fillStyle = c; x.fillRect(i * W / 3, 0, W / 3, H); }); },
  mex: (x, W, H) => { ['#006847', '#f2f2f2', '#ce1126'].forEach((c, i) => { x.fillStyle = c; x.fillRect(i * W / 3, 0, W / 3, H); }); x.fillStyle = '#7a5a2a'; x.beginPath(); x.arc(W / 2, H / 2, H * 0.1, 0, 7); x.fill(); },
  ott: (x, W, H) => { x.fillStyle = '#c8102e'; x.fillRect(0, 0, W, H); x.fillStyle = '#f2f2f2'; x.beginPath(); x.arc(W * 0.45, H / 2, H * 0.24, 0, 7); x.fill(); x.fillStyle = '#c8102e'; x.beginPath(); x.arc(W * 0.5, H / 2, H * 0.2, 0, 7); x.fill(); },
};
// Flag on a pole that waves: flag.wave(t). draw(ctx, W, H) paints the cloth.
export function flagPole(draw, { h = 3, w = 1.2, fh = 0.8 } = {}) {
  const g = new THREE.Group(); g.add(at(cyl(0.025, 0.03, h, '#d8d2c2', 6), 0, h / 2, 0)); g.add(at(mesh(new THREE.SphereGeometry(0.05, 8, 6), std('#c9a227')), 0, h + 0.03, 0));
  const t = canvasTex(256, 170, (x, W, H) => draw(x, W, H));
  const geo = new THREE.PlaneGeometry(w, fh, 16, 4); geo.translate(w / 2, 0, 0);
  const cl = mesh(geo, new THREE.MeshStandardMaterial({ map: t, side: THREE.DoubleSide, roughness: 0.85 })); cl.position.set(0.03, h - fh / 2 - 0.05, 0); g.add(cl);
  const base = geo.attributes.position.array.slice();
  g.wave = tt => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = base[i * 3]; p.setZ(i, 0.09 * (x / w) * Math.sin(x * 4 - tt * 5)); } p.needsUpdate = true; geo.computeVertexNormals(); };
  g.wave(0); return g;
}
// Hospital bed (iron frame, white sheets).
export function bed() {
  const g = new THREE.Group(), iron = std('#e8e6e0', { metalness: 0.3, roughness: 0.5 });
  g.add(at(box(0.62, 0.14, 1.35, '#f2f0ea'), 0, 0.42, 0)); g.add(at(box(0.64, 0.06, 0.32, '#ffffff'), 0, 0.52, -0.5));
  for (const [x, z] of [[-0.3, -0.66], [0.3, -0.66], [-0.3, 0.66], [0.3, 0.66]]) g.add(at(cyl(0.015, 0.015, 0.4, '#d8d6d0', 6), x, 0.2, z));
  g.add(at(box(0.64, 0.42, 0.03, '#e8e6e0'), 0, 0.55, -0.67)); g.add(at(box(0.64, 0.25, 0.03, '#e8e6e0'), 0, 0.45, 0.67));
  g.add(at(box(0.6, 0.06, 0.9, '#cfd8d8'), 0, 0.5, 0.18));
  g.top = 0.52; return g;
}
// One bay of the Hall of Mirrors: an arched mirror panel framed in gilt with marble pilasters (faces +z).
export function mirrorBay(w = 2.0, h = 4.2) {
  const g = new THREE.Group(), gold = std('#c9a64a', { metalness: 0.65, roughness: 0.35 });
  const arch = new THREE.Shape(); const aw = w * 0.36, ah = h * 0.62; arch.moveTo(-aw, 0); arch.lineTo(aw, 0); arch.lineTo(aw, ah); arch.absarc(0, ah, aw, 0, Math.PI, false); arch.closePath();
  const mir = mesh(new THREE.ShapeGeometry(arch, 24), new THREE.MeshStandardMaterial({ color: '#b8c4cc', metalness: 0.9, roughness: 0.12, envMapIntensity: 1 })); mir.position.set(0, 0.5, 0.02); g.add(mir);
  for (let i = 1; i < 4; i++) g.add(at(box(0.025, ah + aw, 0.01, '#c9a64a'), -aw + i * aw / 2, 0.5 + (ah + aw) / 2, 0.03));
  for (let i = 1; i < 5; i++) g.add(at(box(aw * 2, 0.025, 0.01, '#c9a64a'), 0, 0.5 + i * ah / 5, 0.03));
  const fr = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-aw, 0], [-aw, ah], [-aw * 0.7, ah + aw * 0.72], [0, ah + aw], [aw * 0.7, ah + aw * 0.72], [aw, ah], [aw, 0]].map(([x, y]) => new THREE.Vector3(x, y + 0.5, 0.04))), 40, 0.05, 6), gold); g.add(fr);
  for (const sx of [-1, 1]) { g.add(at(box(0.3, h, 0.12, '#d8c8b0'), sx * (w / 2 - 0.15), h / 2, 0.06)); g.add(at(box(0.32, 0.25, 0.16, '#c9a64a'), sx * (w / 2 - 0.15), h - 0.12, 0.08)); }
  g.add(at(box(w, 0.5, 0.06, '#d8c8b0'), 0, 0.25, 0.03));
  return g;
}
// Code-groups telegram sheet as a texture (for desks).
export function cipherTex() {
  return canvasTex(512, 640, (x, W, H) => { x.fillStyle = '#efe6cc'; x.fillRect(0, 0, W, H); x.fillStyle = '#2a2420'; x.font = 'bold 30px monospace';
    const g = '130 13042 13401 8501 115 3528 416 17214 6491 11310 18147 18222 21560 10247 11518 23677 13605 3494 14936 98092 5905 11311 10392 10371 0302 21290 5161 39695 23571 17504 11269 18276 18101 0317 0228 17694 4473 22284 22200 19452 21589 67893 5569 13918 8958 12137 1333 4725 4458 5905 17166 13851 4458 17149 14471 6706'.split(' ');
    for (let i = 0; i < g.length; i++) x.fillText(g[i], 30 + (i % 5) * 95, 60 + Math.floor(i / 5) * 48); });
}
