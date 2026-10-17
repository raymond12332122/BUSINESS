// Props for the independence of the Americas video: period flags, Independence Hall, a New England meetinghouse,
// tea chests, a sugar mill, the Sugarloaf, a stone bridge, mules and a few hand props.
import * as THREE from 'three';
import { at, box, cyl, mesh, rng } from '../lib/props.js';
import * as LP from '../lib/props.js';
import { canvasTex } from '../mx/props.js';
import * as N from '../napo/props.js';
import { flagPole } from '../ww1/props.js';

export { flagPole };
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o });

// ------------------------------------------------------------ flags: draw(ctx, W, H)
const bands = (x, W, H, cols, vertical = false) => cols.forEach((c, i) => { x.fillStyle = c; vertical ? x.fillRect(i * W / cols.length, 0, W / cols.length + 1, H) : x.fillRect(0, i * H / cols.length, W, H / cols.length + 1); });
const starAt = (x, cx, cy, r, c = '#f4f1ea') => { x.fillStyle = c; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); x.fill(); };
export const FLAGS = {
  // thirteen stripes, thirteen stars in a ring (1777)
  usa: (x, W, H) => { for (let i = 0; i < 13; i++) { x.fillStyle = i % 2 ? '#f4f1ea' : '#b22234'; x.fillRect(0, i * H / 13, W, H / 13 + 1); }
    const cw = W * 0.42, ch = H * 7 / 13; x.fillStyle = '#2a2d62'; x.fillRect(0, 0, cw, ch);
    for (let i = 0; i < 13; i++) { const a = i / 13 * Math.PI * 2; starAt(x, cw / 2 + Math.cos(a) * ch * 0.33, ch / 2 + Math.sin(a) * ch * 0.33, ch * 0.07); } },
  // Great Union (before 1801): St George + St Andrew
  gbr: (x, W, H) => { x.fillStyle = '#1f3f8f'; x.fillRect(0, 0, W, H); x.strokeStyle = '#f4f1ea'; x.lineWidth = H * 0.18; x.beginPath(); x.moveTo(0, 0); x.lineTo(W, H); x.moveTo(W, 0); x.lineTo(0, H); x.stroke();
    x.fillStyle = '#f4f1ea'; x.fillRect(W * 0.4, 0, W * 0.2, H); x.fillRect(0, H * 0.36, W, H * 0.28); x.fillStyle = '#c8102e'; x.fillRect(W * 0.445, 0, W * 0.11, H); x.fillRect(0, H * 0.42, W, H * 0.16); },
  fra: (x, W, H) => bands(x, W, H, ['#2a3f8f', '#f4f1ea', '#ce1126'], true),
  bourbon: (x, W, H) => { x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, W, H); N.fleurs(x, W, H, '#c9a227', 3); },
  // Spanish army: the Cross of Burgundy
  burgundy: (x, W, H) => { x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, W, H); x.strokeStyle = '#b8241e'; x.lineCap = 'round'; x.lineWidth = H * 0.12;
    for (const [a, b, c, d] of [[0.12, 0.1, 0.88, 0.9], [0.88, 0.1, 0.12, 0.9]]) { x.beginPath(); x.moveTo(W * a, H * b); x.lineTo(W * c, H * d); x.stroke();
      for (let k = 1; k < 6; k++) { const u = k / 6, px = W * (a + (c - a) * u), py = H * (b + (d - b) * u); x.beginPath(); x.arc(px, py, H * 0.07, 0, 7); x.fillStyle = '#b8241e'; x.fill(); } } },
  esp: (x, W, H) => { bands(x, W, H, ['#c60b1e', '#ffc400', '#ffc400', '#c60b1e']); },
  // Haiti, 1803: Dessalines tore the white out of the French tricolour
  haiti: (x, W, H) => bands(x, W, H, ['#1f3f8f', '#c8102e'], true),
  guadalupe: null,
  // Army of the Three Guarantees: white, green, red diagonals, a star in each
  trigarante: (x, W, H) => { const band = c => { x.beginPath(); if (c <= 1) { x.moveTo(0, 0); x.lineTo(c * W, 0); x.lineTo(0, c * H); } else { x.moveTo(0, 0); x.lineTo(W, 0); x.lineTo(W, (c - 1) * H); x.lineTo((c - 1) * W, H); x.lineTo(0, H); } x.closePath(); x.fill(); };
    x.fillStyle = '#c8102e'; x.fillRect(0, 0, W, H); x.fillStyle = '#2f7a3a'; band(4 / 3); x.fillStyle = '#f4f1ea'; band(2 / 3);
    [[1 / 3, '#d4af37'], [1, '#f4f1ea'], [5 / 3, '#f4f1ea']].forEach(([u, c]) => starAt(x, u / 2 * W, u / 2 * H, H * 0.09, c)); },
  // Mexican Empire, 1821: vertical tricolour with a crowned eagle
  mexEmp: (x, W, H) => { bands(x, W, H, ['#2f7a3a', '#f4f1ea', '#c8102e'], true); x.fillStyle = '#6a4a22'; x.beginPath(); x.ellipse(W / 2, H * 0.56, W * 0.07, H * 0.16, 0, 0, 7); x.fill();
    x.fillStyle = '#d4af37'; x.fillRect(W / 2 - W * 0.05, H * 0.24, W * 0.1, H * 0.08); },
  colombia: (x, W, H) => { x.fillStyle = '#f2c40c'; x.fillRect(0, 0, W, H / 2); x.fillStyle = '#1f3f8f'; x.fillRect(0, H / 2, W, H / 4); x.fillStyle = '#c8102e'; x.fillRect(0, H * 0.75, W, H / 4 + 1); },
  plata: (x, W, H) => { bands(x, W, H, ['#74acdf', '#f4f1ea', '#74acdf']); x.fillStyle = '#e8b52a'; x.beginPath(); x.arc(W / 2, H / 2, H * 0.1, 0, 7); x.fill(); },
  andes: (x, W, H) => { bands(x, W, H, ['#74acdf', '#f4f1ea'], true); x.fillStyle = '#c9a227'; x.beginPath(); x.arc(W / 2, H / 2, H * 0.17, 0, 7); x.fill(); x.fillStyle = '#74acdf'; x.beginPath(); x.arc(W / 2, H / 2, H * 0.12, 0, 7); x.fill(); },
  chile: (x, W, H) => { x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, W, H / 2); x.fillStyle = '#d52b1e'; x.fillRect(0, H / 2, W, H / 2); x.fillStyle = '#0039a6'; x.fillRect(0, 0, W / 3, H / 2); starAt(x, W / 6, H / 4, H * 0.12); },
  peru: (x, W, H) => { x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, W, H); x.fillStyle = '#c8102e'; x.beginPath(); x.moveTo(0, 0); x.lineTo(W / 2, H / 2); x.lineTo(0, H); x.fill(); x.beginPath(); x.moveTo(W, 0); x.lineTo(W / 2, H / 2); x.lineTo(W, H); x.fill();
    x.fillStyle = '#e8b52a'; x.beginPath(); x.arc(W / 2, H / 2, H * 0.13, 0, 7); x.fill(); },
  bolivia: (x, W, H) => bands(x, W, H, ['#2f7a3a', '#c8102e', '#2f7a3a']),
  brasil: (x, W, H) => { x.fillStyle = '#2f7a3a'; x.fillRect(0, 0, W, H); x.fillStyle = '#f2c40c'; x.beginPath(); x.moveTo(W / 2, H * 0.08); x.lineTo(W * 0.93, H / 2); x.lineTo(W / 2, H * 0.92); x.lineTo(W * 0.07, H / 2); x.fill();
    x.fillStyle = '#1f4fa0'; x.beginPath(); x.arc(W / 2, H / 2, H * 0.2, 0, 7); x.fill(); x.fillStyle = '#d4af37'; x.fillRect(W / 2 - H * 0.08, H * 0.18, H * 0.16, H * 0.08); },
  portugal: (x, W, H) => { x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, W, H); x.fillStyle = '#1f3f8f'; x.beginPath(); x.arc(W / 2, H / 2, H * 0.24, 0, 7); x.fill(); x.strokeStyle = '#d4af37'; x.lineWidth = 4; x.beginPath(); x.arc(W / 2, H / 2, H * 0.24, 0, 7); x.stroke();
    x.fillStyle = '#f4f1ea'; x.fillRect(W / 2 - H * 0.1, H / 2 - H * 0.12, H * 0.2, H * 0.24); x.fillStyle = '#d4af37'; x.fillRect(W / 2 - H * 0.12, H * 0.15, H * 0.24, H * 0.08); },
  centro: (x, W, H) => { bands(x, W, H, ['#1f4fa0', '#f4f1ea', '#1f4fa0']); x.fillStyle = '#2f7a3a'; x.beginPath(); x.moveTo(W / 2 - H * 0.1, H * 0.6); x.lineTo(W / 2, H * 0.4); x.lineTo(W / 2 + H * 0.1, H * 0.6); x.fill(); },
  white: (x, W, H) => { x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, W, H); },
};
// Guadalupe banner (Hidalgo) comes from the Napoleonic video's drawing.
export function banner(kind, opts = {}) {
  if (kind === 'guadalupe') { const f = N.flag('guadalupe', opts.h || 3, opts.w || 1.0, opts.fh || 1.3, { vertical: true }); return f; }
  return flagPole(FLAGS[kind], opts);
}

// ------------------------------------------------------------ buildings
// Gable roof: triangular prism along x (length len, span d, height h), eaves at height y.
export function gable(len, d, h, color, y) {
  const sh = new THREE.Shape([new THREE.Vector2(-d / 2, 0), new THREE.Vector2(d / 2, 0), new THREE.Vector2(0, h)]);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false }); geo.translate(0, 0, -len / 2); geo.rotateY(Math.PI / 2);
  const m = mesh(geo, std(color, { flatShading: true })); m.position.y = y; return m;
}
// Independence Hall, Philadelphia: red brick, white trim, tall white steeple.
export function independenceHall() {
  const g = new THREE.Group(), brick = '#9a4a34', trim = '#f2ece0';
  g.add(at(box(16, 6, 6, brick), 0, 3, 0));
  g.add(at(box(16.3, 0.35, 6.3, trim), 0, 6.05, 0)); g.add(at(box(16.1, 0.3, 6.1, trim), 0, 3.0, 0));
  g.add(gable(16.4, 6.4, 1.7, '#4a4c52', 6.2));
  for (let f = 0; f < 2; f++) for (let i = 0; i < 9; i++) { const x = -7 + i * 1.75; if (Math.abs(x) < 0.9) continue;
    const w = box(0.9, 1.6, 0.1, '#2a3440'); w.position.set(x, 1.6 + f * 3, 3.02); g.add(w); const fr = box(1.1, 1.8, 0.06, trim); fr.position.set(x, 1.6 + f * 3, 3.0); g.add(fr); }
  g.add(at(box(1.4, 2.6, 0.14, '#3a2a1e'), 0, 1.3, 3.04)); g.add(at(box(1.9, 0.3, 0.3, trim), 0, 2.75, 3.06));
  // tower and steeple
  g.add(at(box(3.4, 9.5, 3.4, brick), 0, 4.75, -3.6));
  g.add(at(box(3.6, 0.3, 3.6, trim), 0, 9.6, -3.6));
  const t1 = mesh(new THREE.CylinderGeometry(1.25, 1.45, 2.6, 8), std(trim)); t1.position.set(0, 11.0, -3.6); g.add(t1);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const w = box(0.3, 1.4, 0.06, '#2a3440'); w.position.set(Math.sin(a) * 1.3, 11.0, -3.6 + Math.cos(a) * 1.3); w.rotation.y = a; g.add(w); }
  const t2 = mesh(new THREE.CylinderGeometry(0.85, 1.05, 1.8, 8), std(trim)); t2.position.set(0, 13.2, -3.6); g.add(t2);
  const sp = mesh(new THREE.ConeGeometry(0.75, 3.2, 8), std(trim)); sp.position.set(0, 15.7, -3.6); g.add(sp);
  const clk = mesh(new THREE.CircleGeometry(0.7, 24), std('#f6f2ea')); clk.position.set(0, 8.0, -1.88); g.add(clk);
  const rim = mesh(new THREE.TorusGeometry(0.7, 0.06, 6, 24), std('#2a2420')); rim.position.set(0, 8.0, -1.87); g.add(rim);
  return g;
}
// New England meetinghouse (Lexington green).
export function meetinghouse() {
  const g = new THREE.Group(), w = '#f2ede2';
  g.add(at(box(7, 4.2, 5, w), 0, 2.1, 0));
  g.add(gable(7.3, 5.3, 1.9, '#5a5a60', 4.2));
  g.add(at(box(1.8, 3.2, 1.8, w), 0, 5.8, 2.0)); const sp = mesh(new THREE.ConeGeometry(1.0, 3.2, 8), std(w)); sp.position.set(0, 9.0, 2.0); g.add(sp);
  for (let i = 0; i < 3; i++) for (const y of [1.3, 3.1]) { const win = box(0.7, 1.1, 0.08, '#2a3440'); win.position.set(-2.2 + i * 2.2, y, 2.52); g.add(win); }
  g.add(at(box(1.0, 2.0, 0.1, '#5a3a24'), 0, 1.0, 2.55));
  return g;
}
export function teaChest(seed = 0) {
  const g = new THREE.Group(), r = rng(seed + 3);
  g.add(at(box(0.42, 0.36, 0.42, ['#8a6a3f', '#7a5a34', '#9a7848'][seed % 3]), 0, 0.18, 0));
  const lab = mesh(new THREE.PlaneGeometry(0.26, 0.16), new THREE.MeshStandardMaterial({ map: canvasTex(128, 80, (x, W, H) => { x.fillStyle = '#e8dcc0'; x.fillRect(0, 0, W, H); x.fillStyle = '#7a2a24'; x.font = '900 34px Georgia'; x.textAlign = 'center'; x.fillText('TEA', W / 2, H * 0.62); }) }));
  lab.position.set(0, 0.2, 0.212); g.add(lab);
  g.rotation.y = (r() - 0.5) * 0.4; return g;
}
// Sugar mill: round stone tower with a chimney and a cattle mill wheel.
export function sugarMill() {
  const g = new THREE.Group();
  g.add(at(cyl(2.0, 2.3, 3.6, '#b8a88e', 18), 0, 1.8, 0));
  g.add(at(cyl(0.55, 0.75, 6.5, '#9a7a62', 12), 2.6, 3.25, -0.6));
  g.add(at(box(4.6, 2.4, 3.2, '#c9b898'), -3.6, 1.2, 0.2));
  const roof = gable(4.9, 3.5, 1.1, '#8a4a34', 2.4); roof.position.set(-3.6, 0, 0.2); g.add(roof);
  const ring = mesh(new THREE.TorusGeometry(3.2, 0.05, 4, 40), std('#6a5a46')); ring.rotation.x = Math.PI / 2; ring.position.set(0, 0.04, 0); g.add(ring);
  return g;
}
// Pão de Açúcar (Sugarloaf) and its neighbours, for Guanabara Bay.
export function sugarloaf(h = 26) {
  const g = new THREE.Group(), r = rng(12);
  const mk = (H, R, x, z, sx = 1) => { const prof = []; for (let i = 0; i <= 14; i++) { const u = i / 14; prof.push(new THREE.Vector2(R * Math.pow(Math.max(0.0001, 1 - u), 0.55) * (1 + 0.04 * Math.sin(u * 9)), u * H)); }
    const m = mesh(new THREE.LatheGeometry(prof, 20), std('#6f6a62', { flatShading: true })); m.scale.x = sx; m.position.set(x, 0, z); g.add(m);
    const cap = mesh(new THREE.SphereGeometry(R * 0.55, 10, 8), std('#3f6a3a', { flatShading: true })); cap.scale.y = 0.4; cap.position.set(x, H * 0.25, z); cap.scale.x = sx * 1.2; g.add(cap); };
  mk(h, h * 0.33, 0, 0, 0.8); mk(h * 0.55, h * 0.3, -h * 0.55, h * 0.1, 1.1); mk(h * 0.35, h * 0.25, h * 0.45, -h * 0.05);
  return g;
}
// Small stone bridge over a stream (Boyacá).
export function stoneBridge(len = 8, w = 2.6) {
  const g = new THREE.Group(), st = std('#9a8f80', { flatShading: true });
  const sh = new THREE.Shape(); sh.moveTo(-len / 2, 0); sh.lineTo(-len / 2, 1.3); sh.quadraticCurveTo(0, 1.9, len / 2, 1.3); sh.lineTo(len / 2, 0); sh.lineTo(len * 0.3, 0); sh.quadraticCurveTo(0, 1.3, -len * 0.3, 0); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false }); geo.translate(0, 0, -w / 2);
  const m = mesh(geo, st); m.rotation.y = Math.PI / 2; g.add(m);
  for (const s of [-1, 1]) { const par = mesh(new THREE.BoxGeometry(0.25, 0.45, len * 0.98), st); par.position.set(s * (w / 2 - 0.12), 1.8, 0); g.add(par); }
  return g;
}
// Pack mule (a smaller, brown horse with long ears) for the crossing of the Andes.
import { horse } from '../napo/horse.js';
export function mule(seed = 0, { pack = true } = {}) {
  const H = horse({ coat: ['#6a4a34', '#7a5a3e', '#5a3f2c'][seed % 3], mane: '#2a2018', cloth: '#6a5a40', trim: '#8a7a5a', seed });
  H.scale.setScalar(0.82);
  for (const s of [-1, 1]) { const e = mesh(new THREE.ConeGeometry(0.05, 0.26, 6), std('#5a3f2c')); e.position.set(s * 0.07, 0.2, 0.0); e.rotation.z = -s * 0.25; H.head.add(e); }
  if (pack) { const p = new THREE.Group(); for (const s of [-1, 1]) p.add(at(box(0.2, 0.28, 0.45, '#8a7452'), s * 0.3, 0, 0)); p.add(at(box(0.5, 0.12, 0.5, '#6a5a40'), 0, 0.18, 0)); p.position.set(0, 0.3, 0); H.body.add(p); }
  return H;
}
// A church bell hanging from a beam (Dolores).
export function bell(s = 1) {
  const g = new THREE.Group();
  const prof = [[0, 0.5], [0.12, 0.49], [0.17, 0.4], [0.2, 0.2], [0.28, 0.04], [0.3, 0], [0.27, 0.0]].map(([r, y]) => new THREE.Vector2(r, y - 0.5));
  const b = mesh(new THREE.LatheGeometry(prof, 24), new THREE.MeshStandardMaterial({ color: '#b8893a', metalness: 0.7, roughness: 0.35, side: THREE.DoubleSide })); g.add(b);
  g.scale.setScalar(s); return g;
}
// Crown on a cushion (coronations).
export function crownCushion() {
  const g = new THREE.Group(); const c = N.cushion('#8a1f2a'); g.add(c); const cr = N.crown(); cr.scale.setScalar(0.7); cr.position.y = 0.08; g.add(cr); return g;
}

// ------------------------------------------------------------ palace tea service and royal fittings
export function teapot(col = '#f4efe6', trim = '#3a5a9a') {
  const g = new THREE.Group(), por = std(col, { roughness: 0.25 }), tr = std(trim, { roughness: 0.3 });
  const body = mesh(new THREE.SphereGeometry(0.09, 18, 14), por); body.scale.set(1, 0.82, 1); body.position.y = 0.075; g.add(body);
  g.add(at(mesh(new THREE.TorusGeometry(0.09, 0.006, 6, 24), tr), 0, 0.075, 0, Math.PI / 2, 0, 0));
  const lid = mesh(new THREE.SphereGeometry(0.05, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), por); lid.position.y = 0.135; g.add(lid);
  g.add(at(mesh(new THREE.SphereGeometry(0.014, 8, 6), tr), 0, 0.19, 0));
  const sp = mesh(new THREE.CylinderGeometry(0.012, 0.022, 0.12, 8), por); sp.position.set(0.1, 0.1, 0); sp.rotation.z = -0.9; g.add(sp);
  g.add(at(mesh(new THREE.TorusGeometry(0.045, 0.01, 6, 14, Math.PI * 1.3), por), -0.095, 0.085, 0, 0, 0, Math.PI * 0.4));
  return g;
}
export function cupOnly() {   // teacup without its saucer (the saucer goes in the other hand)
  const g = new THREE.Group(), w = std('#f6f2ea', { roughness: 0.3 });
  g.add(at(mesh(new THREE.CylinderGeometry(0.045, 0.032, 0.055, 16, 1, true), std('#f6f2ea', { roughness: 0.3, side: THREE.DoubleSide })), 0, 0.028, 0));
  g.add(at(mesh(new THREE.CircleGeometry(0.042, 16), std('#7a4a22', { roughness: 0.2 })), 0, 0.046, 0, -Math.PI / 2, 0, 0));
  g.add(at(mesh(new THREE.CircleGeometry(0.032, 14), w), 0, 0.001, 0, Math.PI / 2, 0, 0));
  g.add(at(mesh(new THREE.TorusGeometry(0.016, 0.0045, 5, 10), w), 0.05, 0.03, 0));
  g.add(at(mesh(new THREE.TorusGeometry(0.045, 0.003, 4, 20), std('#d4af37', { metalness: 0.6, roughness: 0.3 })), 0, 0.055, 0, Math.PI / 2, 0, 0));
  return g;
}
export function saucer() { const g = new THREE.Group(); g.add(at(mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.012, 20), std('#f6f2ea', { roughness: 0.3 })), 0, 0, 0));
  g.add(at(mesh(new THREE.TorusGeometry(0.072, 0.003, 4, 24), std('#d4af37', { metalness: 0.6, roughness: 0.3 })), 0, 0.006, 0, Math.PI / 2, 0, 0)); return g; }
export function cakeStand() {
  const g = new THREE.Group(), gold = std('#d4af37', { metalness: 0.6, roughness: 0.3 }), por = std('#f6f2ea', { roughness: 0.3 });
  g.add(at(cyl(0.01, 0.01, 0.42, '#d4af37', 8), 0, 0.21, 0));
  const cols = ['#f2b8c6', '#f6e3a8', '#c8e0b0', '#e8c49a', '#f4f1ea'];
  [[0.16, 0.04], [0.12, 0.18], [0.085, 0.31]].forEach(([r, y], i) => { g.add(at(mesh(new THREE.CylinderGeometry(r, r * 0.9, 0.01, 22), por), 0, y, 0));
    const n = 5 + (2 - i) * 2; for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, cake = mesh(new THREE.CylinderGeometry(0.024, 0.026, 0.026, 10), std(cols[(k + i) % cols.length], { roughness: 0.6 }));
      cake.position.set(Math.cos(a) * r * 0.62, y + 0.018, Math.sin(a) * r * 0.62); g.add(cake); g.add(at(mesh(new THREE.SphereGeometry(0.009, 6, 4), std('#c0303a')), cake.position.x, y + 0.036, cake.position.z)); } });
  g.add(at(mesh(new THREE.TorusGeometry(0.03, 0.006, 6, 12), gold), 0, 0.44, 0));
  return g;
}
export function teaTable(cloth = '#f4f1ea') {
  const g = new THREE.Group(), wood = std('#5a3420', { roughness: 0.4 });
  g.add(at(mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.04, 28), wood), 0, 0.72, 0));
  g.add(at(mesh(new THREE.CylinderGeometry(0.47, 0.5, 0.12, 28, 1, true), std(cloth, { side: THREE.DoubleSide, roughness: 0.9 })), 0, 0.68, 0));
  g.add(at(cyl(0.05, 0.07, 0.68, '#5a3420', 10), 0, 0.36, 0));
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2, l = mesh(new THREE.BoxGeometry(0.06, 0.05, 0.36), wood); l.position.set(Math.cos(a) * 0.16, 0.03, Math.sin(a) * 0.16); l.rotation.y = -a + Math.PI / 2; g.add(l); }
  const tp = teapot(); tp.position.set(-0.18, 0.74, 0.05); g.add(tp);
  const cs = cakeStand(); cs.position.set(0.16, 0.74, -0.1); g.add(cs);
  for (const [x, z] of [[-0.05, 0.28], [0.25, 0.22]]) { const sc = saucer(); sc.position.set(x, 0.745, z); g.add(sc); const c = cupOnly(); c.position.set(x, 0.752, z); g.add(c); }
  return g;
}
// The royal arms on a cloth of estate: shield quartered (England, Scotland, Ireland, Hanover) under a crown.
export function clothOfEstate(w = 2.2, h = 3.4, fabric = '#7a1424') {
  const tex = canvasTex(256, Math.round(256 * h / w), (g, W, H) => {
    g.fillStyle = fabric; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(212,175,55,0.18)'; for (let j = 0; j < 9; j++) for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(i * W / 5 + (j % 2) * W / 10, j * H / 8, 5, 0, 7); g.fill(); }
    const cx = W / 2, cy = H * 0.42, sw = W * 0.34, sh = W * 0.42;
    g.fillStyle = '#d4af37'; g.beginPath(); g.moveTo(cx - sw * 0.6, cy - sh * 0.62); for (let k = 0; k <= 4; k++) g.lineTo(cx - sw * 0.6 + k * sw * 0.3, cy - sh * 0.62 - (k % 2 ? 26 : 12)); g.lineTo(cx + sw * 0.6, cy - sh * 0.52); g.lineTo(cx - sw * 0.6, cy - sh * 0.52); g.fill();
    g.save(); g.beginPath(); g.moveTo(cx - sw / 2, cy - sh / 2); g.lineTo(cx + sw / 2, cy - sh / 2); g.lineTo(cx + sw / 2, cy + sh * 0.1); g.quadraticCurveTo(cx + sw / 2, cy + sh / 2, cx, cy + sh * 0.62); g.quadraticCurveTo(cx - sw / 2, cy + sh / 2, cx - sw / 2, cy + sh * 0.1); g.closePath(); g.clip();
    [['#c0272d', 0, 0], ['#d4af37', 1, 0], ['#2a4fa0', 0, 1], ['#c0272d', 1, 1]].forEach(([c, i, j]) => { g.fillStyle = c; g.fillRect(cx - sw / 2 + i * sw / 2, cy - sh / 2 + j * sh * 0.56, sw / 2, sh * 0.56); });
    g.fillStyle = '#d4af37'; for (const [i, j] of [[0, 0], [1, 1]]) for (let k = 0; k < 3; k++) g.fillRect(cx - sw / 2 + i * sw / 2 + sw * 0.12, cy - sh / 2 + j * sh * 0.56 + 12 + k * 16, sw * 0.26, 6);
    g.restore(); g.strokeStyle = '#d4af37'; g.lineWidth = 4; g.strokeRect(10, 10, W - 20, H - 20);
  });
  const m = mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 })); return m;
}
export function canopy(w = 2.6, d = 1.4, fabric = '#7a1424') {
  const g = new THREE.Group(), gold = std('#d4af37', { metalness: 0.6, roughness: 0.35 });
  g.add(at(box(w, 0.16, d, fabric), 0, 0, 0)); g.add(at(box(w + 0.06, 0.05, d + 0.06, '#d4af37'), 0, 0.09, 0));
  for (let i = 0; i < 26; i++) { const x = -w / 2 + (i + 0.5) * w / 26; const f = mesh(new THREE.ConeGeometry(0.035, 0.16, 6), gold); f.rotation.x = Math.PI; f.position.set(x, -0.15, d / 2 + 0.01); g.add(f); }
  const crown = mesh(new THREE.SphereGeometry(0.16, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), gold); crown.position.set(0, 0.08, d / 2 - 0.1); g.add(crown);
  g.add(at(mesh(new THREE.SphereGeometry(0.04, 8, 6), gold), 0, 0.26, d / 2 - 0.1));
  return g;
}
export function footstool(col = '#7a1424') { const g = new THREE.Group(); g.add(at(box(0.6, 0.14, 0.36, col), 0, 0.12, 0)); for (const [x, z] of [[-0.25, -0.13], [0.25, -0.13], [-0.25, 0.13], [0.25, 0.13]]) g.add(at(cyl(0.02, 0.025, 0.08, '#d4af37', 6), x, 0.04, z)); return g; }

// Musket volley smoke for this video: grey and translucent, blown forward from the muzzles so the shooters stay visible.
let PUFF = null;
function puffTex() { return PUFF || (PUFF = canvasTex(128, 128, (g, W, H) => { const gr = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
  gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); })); }
export function volleySmoke(parent, origins, { color = '#b9b4aa', size = 0.34, opacity = 0.5 } = {}) {
  const puffs = [], flashes = [];
  origins.forEach((o, i) => {
    for (let k = 0; k < 3; k++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex(), color, transparent: true, depthWrite: false })); m.visible = false; parent.add(m); puffs.push([m, o, k, i]); }
    const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex(), color: '#ffcf70', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); f.visible = false; parent.add(f); flashes.push([f, o]);
  });
  return (t, tv, dir = new THREE.Vector3(0, 0, 1)) => {
    const u = t - tv;
    for (const [m, o, k, i] of puffs) { const v = u - k * 0.06 - (i % 3) * 0.03; m.visible = v > 0 && v < 2.6; if (!m.visible) continue; const e = 1 - Math.exp(-v * 2.4);
      m.position.copy(o).addScaledVector(dir, 0.45 + 0.9 * e + k * 0.22).add(new THREE.Vector3(0, 0.18 * v + k * 0.04, 0)); m.scale.setScalar(size * (0.35 + 1.4 * e + k * 0.15)); m.material.opacity = opacity * (1 - v / 2.6); }
    for (const [f, o] of flashes) { f.visible = u > 0 && u < 0.08; if (f.visible) { f.position.copy(o).addScaledVector(dir, 0.18); f.scale.setScalar(0.32); f.material.opacity = 1; } }
  };
}

// ------------------------------------------------------------ plaza furniture
export function fountain(r = 1.6) {
  const g = new THREE.Group(), stone = std('#d8ccb4', { roughness: 0.85 }), dark = std('#b8ac94', { roughness: 0.9 });
  g.add(at(mesh(new THREE.CylinderGeometry(r, r * 1.04, 0.5, 8), stone), 0, 0.25, 0));
  const water = mesh(new THREE.CircleGeometry(r * 0.92, 24), new THREE.MeshStandardMaterial({ color: '#4f8aa8', roughness: 0.15, metalness: 0.2 })); water.rotation.x = -Math.PI / 2; water.position.y = 0.42; g.add(water);
  g.add(at(mesh(new THREE.CylinderGeometry(0.16, 0.24, 1.3, 10), dark), 0, 0.95, 0));
  g.add(at(mesh(new THREE.CylinderGeometry(0.6, 0.18, 0.22, 12), stone), 0, 1.55, 0));
  g.add(at(mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.5, 8), dark), 0, 1.85, 0));
  g.add(at(mesh(new THREE.SphereGeometry(0.16, 10, 8), stone), 0, 2.15, 0));
  const jet = mesh(new THREE.ConeGeometry(0.55, 0.9, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#cfe8f4', transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false }));
  jet.position.y = 1.2; jet.rotation.x = Math.PI; g.add(jet);
  return g;
}
export function stall(awning = '#c0392b', seed = 1) {
  const g = new THREE.Group(), wood = std('#6a4a2c'), r = rng(seed);
  for (const [x, z] of [[-0.9, -0.5], [0.9, -0.5], [-0.9, 0.5], [0.9, 0.5]]) g.add(at(cyl(0.04, 0.04, 2.0, '#6a4a2c', 6), x, 1.0, z));
  g.add(at(box(2.0, 0.08, 1.1, '#7a5636'), 0, 0.8, 0));
  const tex = canvasTex(128, 64, (c, W, H) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#f4efe2' : awning; c.fillRect(i * W / 8, 0, W / 8, H); } });
  const aw = mesh(new THREE.PlaneGeometry(2.3, 1.4), new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.9 })); aw.position.set(0, 2.05, 0.15); aw.rotation.x = -Math.PI / 2 + 0.35; g.add(aw);
  const fruit = ['#e8a030', '#c0302a', '#7aa83a', '#f2d04a', '#9a3a6a'];
  for (let i = 0; i < 4; i++) { const cr = box(0.42, 0.18, 0.34, '#8a6a42'); cr.position.set(-0.7 + i * 0.47, 0.93, 0.05); g.add(cr);
    for (let k = 0; k < 6; k++) g.add(at(mesh(new THREE.SphereGeometry(0.05, 8, 6), std(fruit[(i + k) % fruit.length], { roughness: 0.5 })), -0.82 + i * 0.47 + (k % 3) * 0.1, 1.05, -0.03 + Math.floor(k / 3) * 0.12)); }
  return g;
}
export function lampPost(h = 3.0) {
  const g = new THREE.Group(), iron = std('#2a2a2c', { roughness: 0.5, metalness: 0.4 });
  g.add(at(cyl(0.05, 0.08, h, '#2a2a2c', 8), 0, h / 2, 0));
  g.add(at(mesh(new THREE.CylinderGeometry(0.16, 0.1, 0.32, 6, 1, true), new THREE.MeshStandardMaterial({ color: '#fff2c8', emissive: '#ffcf80', emissiveIntensity: 0.25, transparent: true, opacity: 0.85, side: THREE.DoubleSide })), 0, h + 0.12, 0));
  g.add(at(mesh(new THREE.ConeGeometry(0.2, 0.18, 6), iron), 0, h + 0.36, 0));
  return g;
}
export function bench() { const g = new THREE.Group(); g.add(at(box(1.6, 0.08, 0.42, '#7a5636'), 0, 0.45, 0)); g.add(at(box(1.6, 0.36, 0.06, '#7a5636'), 0, 0.68, -0.2));
  for (const x of [-0.7, 0.7]) g.add(at(box(0.08, 0.45, 0.4, '#2a2a2c'), x, 0.22, 0)); return g; }
