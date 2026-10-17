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
