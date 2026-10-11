// Props for the corruption & cartels video (present-day Mexico). Low-poly, built from boxes/cylinders like the
// rest of the project. Animated props expose small update functions (spin, blink, flicker).
import * as THREE from 'three';
import * as LP from '../lib/props.js';
import { at, box, cyl, mesh, rng } from '../lib/props.js';
import * as F from '../lib/fx.js';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...o });
export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const glow = (color, i = 1.5) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: i, roughness: 0.4 });
function plane(w, h, map, basic = true) { return mesh(new THREE.PlaneGeometry(w, h), basic ? new THREE.MeshBasicMaterial({ map, transparent: true }) : new THREE.MeshStandardMaterial({ map, roughness: 0.8 })); }
function textTex(text, { w = 512, h = 128, bg = null, fg = '#ffffff', font = '900 72px Inter', align = 'center' } = {}) {
  return canvasTex(w, h, (x, W, H) => { if (bg) { x.fillStyle = bg; x.fillRect(0, 0, W, H); } x.fillStyle = fg; x.font = font; x.textAlign = align; x.textBaseline = 'middle'; x.fillText(text, align === 'center' ? W / 2 : 16, H / 2 + 4); });
}
export const wheel = (r = 0.24, w = 0.18) => { const g = new THREE.Group(); const t = cyl(r, r, w, '#1b1b1d', 14); t.rotation.z = Math.PI / 2; g.add(t); const hub = cyl(r * 0.55, r * 0.55, w + 0.01, '#9a9ca0', 10); hub.rotation.z = Math.PI / 2; g.add(hub); return g; };

// ------------------------------------------------------------ vehicles
// Four-door pickup ("troca"). Facing +z. night: headlights glow.
export function pickup(color = '#2a2c30', { night = false, tint = '#1d2530', bedLoad = null } = {}) {
  const g = new THREE.Group(), b = new THREE.Group(); g.add(b);
  b.add(at(box(1.05, 0.42, 3.0, color), 0, 0.55, 0));                    // lower body
  b.add(at(box(1.0, 0.42, 1.25, color), 0, 0.97, 0.12));                  // cab
  b.add(at(box(0.98, 0.34, 0.04, tint), 0, 0.98, 0.76, -0.45, 0, 0));      // windshield
  for (const s of [-1, 1]) b.add(at(box(0.02, 0.3, 1.0, tint), s * 0.505, 1.0, 0.12)); // side windows
  b.add(at(box(1.0, 0.3, 0.6, color), 0, 0.62, 1.2));                      // hood
  b.add(at(box(1.0, 0.14, 0.08, '#16171a'), 0, 0.5, 1.53));                // grille
  for (const s of [-1, 1]) b.add(at(box(0.04, 0.3, 1.25, color), s * 0.5, 0.88, -0.86)); // bed walls
  b.add(at(box(1.0, 0.3, 0.04, color), 0, 0.88, -1.48));
  for (const s of [-1, 1]) { const hl = box(0.2, 0.09, 0.03, night ? '#fff6d8' : '#e8e4d0'); hl.material = night ? glow('#fff2c8', 2.2) : hl.material; hl.position.set(s * 0.36, 0.64, 1.52); b.add(hl);
    const tl = box(0.12, 0.12, 0.03, '#8a1010'); tl.material = glow('#c81818', night ? 1.6 : 0.4); tl.position.set(s * 0.44, 0.78, -1.5); b.add(tl); }
  if (bedLoad) { bedLoad.position.set(0, 0.74, -0.85); b.add(bedLoad); }
  g.wheels = [];
  for (const z of [1.0, -0.95]) for (const x of [-0.52, 0.52]) { const w = wheel(); w.position.set(x, 0.24, z); g.add(w); g.wheels.push(w); }
  if (night) { const L = new THREE.SpotLight('#fff0d0', 25, 22, 0.5, 0.6, 1.3); L.position.set(0, 0.7, 1.6); L.target.position.set(0, 0, 9); g.add(L, L.target); g.lamp = L; }
  g.body = b; g.drive = (t, speed = 1) => { for (const w of g.wheels) w.rotation.x = t * speed * 4; b.position.y = 0.012 * Math.sin(t * 13); };
  return g;
}
// Black SUV with dark windows.
export function suv(color = '#141518', { night = false } = {}) {
  const g = new THREE.Group(), b = new THREE.Group(); g.add(b);
  b.add(at(box(1.08, 0.5, 2.8, color), 0, 0.6, 0));
  b.add(at(box(1.04, 0.5, 2.0, color), 0, 1.1, -0.25));
  for (const s of [-1, 1]) b.add(at(box(0.02, 0.32, 1.8, '#0b0d10'), s * 0.525, 1.12, -0.25));
  b.add(at(box(1.0, 0.34, 0.04, '#0b0d10'), 0, 1.1, 0.77, -0.4, 0, 0));
  for (const s of [-1, 1]) { const hl = box(0.2, 0.08, 0.03, '#e8e4d0'); if (night) hl.material = glow('#fff2c8', 2.2); hl.position.set(s * 0.36, 0.72, 1.41); b.add(hl); }
  g.wheels = []; for (const z of [0.9, -0.9]) for (const x of [-0.54, 0.54]) { const w = wheel(0.26); w.position.set(x, 0.26, z); g.add(w); g.wheels.push(w); }
  g.drive = (t, speed = 1) => { for (const w of g.wheels) w.rotation.x = t * speed * 4; };
  return g;
}
// Police / National Guard pickup with a light bar that blinks red/blue.
export function patrol(kind = 'policia', { night = false } = {}) {
  const col = { policia: '#e9ecef', guardia: '#3a352c', sedena: '#4d5a3c', marina: '#e9ecef' }[kind] || '#e9ecef';
  const g = pickup(col, { night });
  const label = { policia: 'POLICÍA', guardia: 'GUARDIA NACIONAL', sedena: 'SEDENA', marina: 'MARINA' }[kind];
  const stripe = { policia: '#1f3a7a', guardia: '#c9b48a', sedena: '#e8e2c8', marina: '#1f3a7a' }[kind];
  for (const s of [-1, 1]) { const p = plane(1.6, 0.22, textTex(label, { w: 768, h: 96, bg: stripe, fg: kind === 'guardia' || kind === 'sedena' ? '#1d1a14' : '#ffffff', font: '900 64px Inter' }), false);
    p.position.set(s * 0.528, 0.6, -0.2); p.rotation.y = s * Math.PI / 2; g.body.add(p); }
  const bar = new THREE.Group(); bar.position.set(0, 1.21, 0.15); g.body.add(bar);
  bar.add(at(box(0.8, 0.06, 0.2, '#222'), 0, 0, 0));
  const red = mesh(new THREE.BoxGeometry(0.36, 0.09, 0.18), glow('#ff2a2a', 0.3)); red.position.x = -0.2; bar.add(red);
  const blue = mesh(new THREE.BoxGeometry(0.36, 0.09, 0.18), glow('#2a5aff', 0.3)); blue.position.x = 0.2; bar.add(blue);
  const lr = new THREE.PointLight('#ff3030', 0, 8, 1.6), lb = new THREE.PointLight('#3050ff', 0, 8, 1.6); lr.position.set(-0.3, 1.5, 0); lb.position.set(0.3, 1.5, 0); g.add(lr, lb);
  g.blink = (t, on = 1) => { const a = (Math.sin(t * 14) > 0 ? 1 : 0) * on, c = (1 - a) * on; red.material.emissiveIntensity = 0.3 + 2.6 * a; blue.material.emissiveIntensity = 0.3 + 2.6 * c; lr.intensity = (night ? 7 : 2) * a; lb.intensity = (night ? 7 : 2) * c; };
  g.blink(0, 0); return g;
}
export function armyTruck() { const t = LP.truck('#4d5a3c', '#5f6b4a'); return t; }
// Helicopter (army/navy). spin(t) turns the rotors.
export function helicopter(color = '#4a5638') {
  const g = new THREE.Group();
  const body = mesh(new THREE.CapsuleGeometry(0.62, 1.7, 6, 14), std(color, { roughness: 0.55 })); body.rotation.x = Math.PI / 2; body.scale.set(1, 1, 0.92); body.position.y = 1.1; g.add(body);
  const glass = mesh(new THREE.SphereGeometry(0.58, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), std('#1e2a36', { roughness: 0.2, metalness: 0.3 })); glass.rotation.x = Math.PI / 2 + 0.35; glass.position.set(0, 1.18, 1.05); g.add(glass);
  const boom = mesh(new THREE.CylinderGeometry(0.1, 0.2, 2.6, 8), std(color)); boom.rotation.x = Math.PI / 2; boom.position.set(0, 1.3, -2.3); g.add(boom);
  g.add(at(box(0.06, 0.7, 0.4, color), 0, 1.6, -3.5)); g.add(at(box(0.9, 0.05, 0.3, color), 0, 1.3, -3.3));
  for (const s of [-1, 1]) { g.add(at(box(0.06, 0.06, 2.0, '#2a2a2a'), s * 0.55, 0.15, 0.1)); for (const z of [-0.5, 0.6]) g.add(at(box(0.05, 0.42, 0.05, '#2a2a2a'), s * 0.5, 0.36, z)); }
  const mast = cyl(0.08, 0.08, 0.3, '#2a2a2a', 8); mast.position.set(0, 1.85, 0.1); g.add(mast);
  const rotor = new THREE.Group(); rotor.position.set(0, 2.0, 0.1); g.add(rotor);
  for (let i = 0; i < 4; i++) { const bl = box(5.2, 0.03, 0.22, '#1d1d1d'); bl.rotation.y = i * Math.PI / 4; rotor.add(bl); }
  const disc = mesh(new THREE.CircleGeometry(2.6, 32), new THREE.MeshBasicMaterial({ color: '#202020', transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide })); disc.rotation.x = -Math.PI / 2; rotor.add(disc);
  const tr = new THREE.Group(); tr.position.set(0.1, 1.65, -3.55); g.add(tr);
  for (let i = 0; i < 2; i++) { const bl = box(0.02, 0.8, 0.08, '#1d1d1d'); bl.rotation.x = i * Math.PI / 2; tr.add(bl); }
  g.spin = t => { rotor.rotation.y = t * 22; tr.rotation.x = t * 30; };
  return g;
}
// Government transport jet on the tarmac.
export function jet(color = '#f2f2f0', stripe = '#1f4f3a') {
  const g = new THREE.Group();
  const f = mesh(new THREE.CapsuleGeometry(0.9, 9, 6, 18), std(color, { roughness: 0.45 })); f.rotation.x = Math.PI / 2; f.position.y = 1.9; g.add(f);
  const st = mesh(new THREE.CylinderGeometry(0.905, 0.905, 9, 18, 1, true, Math.PI * 0.42, Math.PI * 0.16), std(stripe, { side: THREE.DoubleSide })); st.rotation.x = Math.PI / 2; st.position.y = 1.9; g.add(st);
  for (const s of [-1, 1]) { const w = box(5.2, 0.12, 1.6, color); w.position.set(s * 2.9, 1.5, 0.2); w.rotation.y = s * 0.28; g.add(w); const e = mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.2, 14), std('#b8bcc2')); e.rotation.x = Math.PI / 2; e.position.set(s * 2.2, 1.15, 0.6); g.add(e); }
  g.add(at(box(0.12, 2.0, 1.4, color), 0, 3.2, -4.4)); g.add(at(box(3.0, 0.1, 0.9, color), 0, 4.1, -4.6));
  for (let i = 0; i < 8; i++) for (const s of [-1, 1]) g.add(at(box(0.02, 0.2, 0.26, '#2a3440'), s * 0.9, 2.15, 3 - i * 0.7));
  const door = box(0.03, 1.1, 0.7, '#d8d8d6'); door.position.set(-0.91, 1.85, 3.2); g.add(door);
  const stairs = new THREE.Group(); for (let i = 0; i < 6; i++) stairs.add(at(box(0.7, 0.06, 0.28, '#9a9da2'), 0, 0.18 * i, -0.28 * i)); stairs.rotation.y = Math.PI / 2; stairs.position.set(-2.6, 0.05, 3.2); g.add(stairs);
  for (const [x, z] of [[0, 3.8], [-1.6, 0.2], [1.6, 0.2]]) g.add(at(cyl(0.14, 0.14, 0.9, '#2a2a2a', 8), x, 0.45, z));
  return g;
}
// Fuel tanker truck ("pipa").
export function tankerTruck(color = '#e9e9e6') {
  const g = new THREE.Group();
  g.add(at(box(1.05, 1.0, 1.1, '#c9302c'), 0, 0.85, 2.2)); g.add(at(box(1.0, 0.35, 0.04, '#1d2530'), 0, 1.1, 2.76, -0.3, 0, 0));
  g.add(at(box(0.9, 0.2, 4.6, '#2a2a2a'), 0, 0.4, -0.4));
  const tank = mesh(new THREE.CapsuleGeometry(0.62, 3.8, 6, 18), std(color, { metalness: 0.4, roughness: 0.35 })); tank.rotation.x = Math.PI / 2; tank.position.set(0, 1.15, -0.6); g.add(tank);
  const lab = plane(1.6, 0.4, textTex('INFLAMABLE', { w: 512, h: 128, bg: '#e2b21c', fg: '#1a1a1a', font: '900 64px Inter' }), false);
  for (const s of [-1, 1]) { const p = lab.clone(); p.position.set(s * 0.63, 1.15, -0.6); p.rotation.y = s * Math.PI / 2; g.add(p); }
  for (const z of [2.1, -1.4, -2.3]) for (const x of [-0.5, 0.5]) { const w = wheel(0.3, 0.22); w.position.set(x, 0.3, z); g.add(w); }
  return g;
}
// Oil/fuel tanker ship.
export function tankerShip(hull = '#7a2a24', deck = '#3a4a3a') {
  const g = new THREE.Group();
  const sh = new THREE.Shape(); sh.moveTo(-3, -18); sh.lineTo(3, -18); sh.lineTo(3, 14); sh.quadraticCurveTo(3, 18, 0, 20); sh.quadraticCurveTo(-3, 18, -3, 14); sh.closePath();
  const hg = new THREE.ExtrudeGeometry(sh, { depth: 3.2, bevelEnabled: false }); hg.rotateX(-Math.PI / 2); g.add(mesh(hg, std(hull)));
  const top = new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: false }); top.rotateX(-Math.PI / 2); const t2 = mesh(top, std('#1d1f22')); t2.position.y = 3.2; g.add(t2);
  const d = new THREE.ShapeGeometry(sh); d.rotateX(-Math.PI / 2); const dk = mesh(d, std(deck)); dk.position.y = 3.81; g.add(dk);
  g.add(at(box(5.2, 4.2, 4.5, '#efeeea'), 0, 5.9, -14.5)); for (let i = 0; i < 3; i++) g.add(at(box(5.25, 0.25, 4.55, '#2a3440'), 0, 4.8 + i * 1.2, -14.5));
  g.add(at(cyl(0.6, 0.7, 3.5, '#c9302c', 12), 0, 9.5, -16));
  for (let i = 0; i < 2; i++) g.add(at(cyl(0.18, 0.18, 26, '#9aa2a8', 8), (i % 2 ? 1 : -1) * 1.2, 4.1, 0, Math.PI / 2, 0, 0));
  return g;
}
export function container(color = '#b8432f', label = '') {
  const g = new THREE.Group(); g.add(at(box(2.4, 2.6, 6.0, color), 0, 1.3, 0));
  for (let i = 0; i < 14; i++) g.add(at(box(2.42, 2.4, 0.06, new THREE.Color(color).multiplyScalar(0.8).getStyle()), 0, 1.3, -2.8 + i * 0.43));
  return g;
}
export function gantryCrane(color = '#d8a21c') {
  const g = new THREE.Group();
  for (const [x, z] of [[-4, -3], [4, -3], [-4, 3], [4, 3]]) g.add(at(box(0.6, 18, 0.6, color), x, 9, z));
  g.add(at(box(9, 1.2, 1.2, color), 0, 18, -3)); g.add(at(box(9, 1.2, 1.2, color), 0, 18, 3));
  g.add(at(box(1.4, 1.2, 34, color), 0, 19, 8)); g.add(at(box(2, 2, 2, '#2a2a2a'), 0, 17.5, 14)); g.add(at(cyl(0.05, 0.05, 6, '#222', 4), 0, 14.5, 14));
  return g;
}

// ------------------------------------------------------------ crime props
export function drum(color = '#2a4a8a') { const g = new THREE.Group(); g.add(at(cyl(0.28, 0.28, 0.85, color, 16), 0, 0.425, 0)); for (const y of [0.2, 0.65]) g.add(at(cyl(0.29, 0.29, 0.04, new THREE.Color(color).multiplyScalar(0.7).getStyle(), 16), 0, y, 0)); return g; }
export function flask(color = '#9ad0b8') {
  const g = new THREE.Group(); const m = std(color, { transparent: true, opacity: 0.7, roughness: 0.15 });
  g.add(at(mesh(new THREE.SphereGeometry(0.11, 12, 10), m), 0, 0.11, 0)); g.add(at(mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.14, 8), m), 0, 0.26, 0)); return g;
}
export function labTable() {
  const g = new THREE.Group(); g.add(at(box(2.2, 0.06, 0.9, '#b9bdc0'), 0, 0.8, 0));
  for (const [x, z] of [[-1, -0.38], [1, -0.38], [-1, 0.38], [1, 0.38]]) g.add(at(box(0.05, 0.8, 0.05, '#7a7e82'), x, 0.4, z));
  const pot = mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.35, 16, 1, true), std('#a8acb0', { metalness: 0.6, roughness: 0.3, side: THREE.DoubleSide })); pot.position.set(-0.55, 1.0, 0); g.add(pot);
  g.add(at(cyl(0.3, 0.3, 0.06, '#3a3a3a', 16), -0.55, 0.86, 0));
  [['#9ad0b8', 0.1], ['#d8c86a', 0.35], ['#c8a0d8', 0.6]].forEach(([c, x]) => { const f = flask(c); f.position.set(x, 0.83, -0.15); g.add(f); });
  for (let i = 0; i < 4; i++) g.add(at(box(0.22, 0.08, 0.16, '#e8e4dc'), 0.4 + (i % 2) * 0.25, 0.87, 0.22 + Math.floor(i / 2) * 0.0));
  return g;
}
// Tarp shelter over a jungle/mountain lab.
export function tarp(color = '#2f6a8a', w = 6, d = 4.5, h = 2.6) {
  const g = new THREE.Group();
  for (const [x, z] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) g.add(at(cyl(0.05, 0.05, h, '#6b4a2f', 6), x, h / 2, z));
  const t = mesh(new THREE.PlaneGeometry(w + 0.6, d + 0.6, 6, 4), std(color, { side: THREE.DoubleSide, roughness: 0.9 }));
  const p = t.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, -0.25 * Math.cos(x / (w / 2) * 1.4) * Math.cos(y / (d / 2) * 1.3)); }
  t.geometry.computeVertexNormals(); t.rotation.x = -Math.PI / 2; t.position.y = h; g.add(t); return g;
}
export function pills(n = 40, color = '#5aa8e8', seed = 1) {
  const g = new THREE.Group(), r = rng(seed), m = std(color, { roughness: 0.4 });
  for (let i = 0; i < n; i++) { const p = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 10), m); p.position.set((r() - 0.5) * 0.5, 0.008 + r() * 0.02, (r() - 0.5) * 0.35); p.rotation.set(r() * 0.4, r() * 6, r() * 0.4); g.add(p); }
  return g;
}
export function brick(color = '#c8b98a') { return at(box(0.3, 0.12, 0.2, color), 0, 0.06, 0); }
export function bricks(n = 12, color = '#c8b98a', seed = 2) { const g = new THREE.Group(), r = rng(seed); for (let i = 0; i < n; i++) { const b = brick(color); b.position.set((i % 4) * 0.32 - 0.48, 0.06 + Math.floor(i / 8) * 0.12, Math.floor((i % 8) / 4) * 0.22 - 0.11); b.rotation.y = (r() - 0.5) * 0.15; g.add(b); } return g; }
// Stack of banknotes (green-grey bands).
export function cash(n = 6, seed = 3) {
  const g = new THREE.Group(), r = rng(seed);
  const tex = canvasTex(128, 64, (x, W, H) => { x.fillStyle = '#9fb48f'; x.fillRect(0, 0, W, H); x.strokeStyle = '#5f7a5a'; x.lineWidth = 6; x.strokeRect(6, 6, W - 12, H - 12); x.fillStyle = '#e8e0c8'; x.fillRect(W / 2 - 6, 0, 12, H); });
  const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 });
  const side = std('#c8d4b4');
  for (let i = 0; i < n; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.1), [side, side, m, side, side, side]); b.castShadow = true; b.position.set((i % 3) * 0.21 - 0.21, 0.03 + Math.floor(i / 3) * 0.06, (r() - 0.5) * 0.05); b.rotation.y = (r() - 0.5) * 0.2; g.add(b); }
  return g;
}
export function envelope() { const g = new THREE.Group(); g.add(at(box(0.26, 0.02, 0.16, '#d9c79a'), 0, 0, 0)); const f = mesh(new THREE.ConeGeometry(0.15, 0.02, 3), std('#cdb985')); f.rotation.set(0, Math.PI / 2, Math.PI / 2); f.scale.set(1, 1, 0.5); f.position.set(0, 0.011, 0.04); g.add(f); return g; }
export function briefcase(open = true) {
  const g = new THREE.Group(); g.add(at(box(0.6, 0.1, 0.42, '#2a2420'), 0, 0.05, 0));
  if (open) { const lid = at(box(0.6, 0.42, 0.04, '#2a2420'), 0, 0.31, -0.21); g.add(lid); const c = cash(9, 5); c.scale.setScalar(0.9); c.position.set(0, 0.1, 0); g.add(c); }
  return g;
}
export function gunCrate(open = true) {
  const g = new THREE.Group(); g.add(at(box(1.3, 0.35, 0.5, '#5a6a3e'), 0, 0.175, 0));
  if (open) for (let i = 0; i < 4; i++) { const r = LP.rifle('#262729', '#262729'); r.scale.setScalar(1.6); r.rotation.set(-Math.PI / 2, 0, Math.PI / 2); r.position.set(-0.45 + i * 0.3, 0.36, 0); g.add(r); }
  return g;
}

// ------------------------------------------------------------ places & street furniture
// Modern concrete building with a window grid (lit windows at night).
export function building(w = 6, h = 9, d = 5, color = '#c9c2b4', { night = false, seed = 0, sign = '' } = {}) {
  const g = new THREE.Group(), r = rng(seed + 11);
  g.add(at(box(w, h, d, color), 0, h / 2, 0));
  const cols = Math.max(2, Math.round(w / 1.3)), rows = Math.max(2, Math.round(h / 1.5));
  const tex = canvasTex(cols * 32, rows * 32, (x) => { for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const lit = night && r() > 0.55;
    x.fillStyle = lit ? ['#ffd88a', '#ffe9b8', '#f6c070'][Math.floor(r() * 3)] : night ? '#1a2030' : '#3a4a5a'; x.fillRect(i * 32 + 7, j * 32 + 6, 18, 20); } });
  const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, emissive: night ? '#ffffff' : '#000000', emissiveMap: night ? tex : null, emissiveIntensity: night ? 0.9 : 0, roughness: 0.6 });
  const front = mesh(new THREE.PlaneGeometry(w * 0.92, h * 0.85), mat); front.position.set(0, h * 0.5, d / 2 + 0.01); g.add(front);
  if (sign) { const s = plane(w * 0.7, 0.6, textTex(sign, { w: 512, h: 96, bg: '#1d2a3a', fg: '#ffffff', font: '900 56px Inter' }), !night); s.position.set(0, 0.9, d / 2 + 0.03); if (night) s.material = new THREE.MeshBasicMaterial({ map: s.material.map }); g.add(s); }
  return g;
}
export function streetLight(night = false, h = 4.2) {
  const g = new THREE.Group(); g.add(at(cyl(0.06, 0.09, h, '#3a3d42', 8), 0, h / 2, 0)); g.add(at(box(0.08, 0.08, 1.0, '#3a3d42'), 0, h, 0.45));
  const lamp = mesh(new THREE.BoxGeometry(0.3, 0.08, 0.4), night ? glow('#ffd9a0', 2.5) : std('#d8d4c8')); lamp.position.set(0, h - 0.04, 0.9); g.add(lamp);
  if (night) { const l = new THREE.PointLight('#ffcf8a', 9, 10, 1.6); l.position.set(0, h - 0.3, 0.9); g.add(l); }
  return g;
}
export function cone() { const g = new THREE.Group(); g.add(at(mesh(new THREE.ConeGeometry(0.16, 0.5, 12), std('#e8641c')), 0, 0.25, 0)); g.add(at(cyl(0.11, 0.11, 0.06, '#f2f2f2', 12), 0, 0.28, 0)); return g; }
export function barrier(w = 3) {
  const g = new THREE.Group(); for (const s of [-1, 1]) g.add(at(box(0.12, 0.9, 0.12, '#d8d4c8'), s * w / 2, 0.45, 0));
  const tex = canvasTex(256, 32, (x, W, H) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#d32a2a'; x.fillRect(i * W / 8, 0, W / 8, H); } });
  const b = mesh(new THREE.BoxGeometry(w, 0.14, 0.06), new THREE.MeshStandardMaterial({ map: tex })); b.position.y = 0.8; g.add(b); return g;
}
// Steel bollard border wall segment along x.
export function borderWall(len = 40, h = 5.5) {
  const g = new THREE.Group(), n = Math.floor(len / 0.32);
  const geo = new THREE.BoxGeometry(0.16, h, 0.16), m = std('#5d3a28', { roughness: 0.6, metalness: 0.3 });
  const inst = new THREE.InstancedMesh(geo, m, n); const M = new THREE.Matrix4();
  for (let i = 0; i < n; i++) { M.makeTranslation(-len / 2 + i * 0.32, h / 2, 0); inst.setMatrixAt(i, M); }
  inst.castShadow = true; g.add(inst); g.add(at(box(len, 0.5, 0.3, '#4e3022'), 0, h + 0.1, 0)); return g;
}
// Lectern with microphones (the morning press conference).
export function podium(text = 'GOBIERNO DE MÉXICO') {
  const g = new THREE.Group();
  const shp = new THREE.Shape([new THREE.Vector2(-0.42, 0), new THREE.Vector2(0.42, 0), new THREE.Vector2(0.36, 1.05), new THREE.Vector2(-0.36, 1.05)]);
  const body = mesh(new THREE.ExtrudeGeometry(shp, { depth: 0.5, bevelEnabled: false }), std('#6b3a24', { roughness: 0.55 })); body.position.z = -0.25; g.add(body);
  g.add(at(box(0.86, 0.05, 0.62, '#4e2a1a'), 0, 1.07, 0, -0.18, 0, 0));
  const tex = canvasTex(512, 256, (x, W, H) => { x.fillStyle = '#7a1f2e'; x.fillRect(0, 0, W, H); x.fillStyle = '#d4af37'; x.beginPath(); x.arc(W / 2, 88, 54, 0, 7); x.lineWidth = 8; x.strokeStyle = '#d4af37'; x.stroke();
    x.font = '900 34px Inter'; x.textAlign = 'center'; x.fillText(text, W / 2, 190); x.fillRect(W / 2 - 30, 70, 60, 34); });
  const front = plane(0.68, 0.34, tex, false); front.position.set(0, 0.68, 0.26); front.rotation.x = -0.055; g.add(front);
  for (const s of [-1, 0, 1]) { const st = cyl(0.008, 0.008, 0.32, '#222', 6); st.position.set(s * 0.1, 1.24, 0.12); st.rotation.x = 0.35; g.add(st); g.add(at(mesh(new THREE.SphereGeometry(0.03, 8, 6), std('#1a1a1a')), s * 0.1, 1.39, 0.18)); }
  return g;
}
// US courtroom judge's bench.
export function judgeBench() {
  const g = new THREE.Group(); g.add(at(box(4, 1.4, 1.2, '#6a4026'), 0, 0.7, 0)); g.add(at(box(4.2, 0.08, 1.3, '#4a2a18'), 0, 1.42, 0));
  for (let i = 0; i < 5; i++) g.add(at(box(0.7, 1.1, 0.04, '#7a4a2e'), -1.6 + i * 0.8, 0.7, 0.61));
  return g;
}
export function whiteHouse() {
  const g = new THREE.Group(); const W = '#f4f2ec';
  g.add(at(box(22, 7, 8, W), 0, 3.5, 0)); g.add(at(box(22.6, 0.6, 8.4, '#e6e2d8'), 0, 7.2, 0));
  const por = new THREE.Group(); por.position.set(0, 0, 4); g.add(por);
  for (let i = 0; i < 6; i++) por.add(at(cyl(0.32, 0.36, 6.4, W, 12), -3.75 + i * 1.5, 3.2, 1.5));
  const ped = new THREE.Shape([new THREE.Vector2(-4.6, 0), new THREE.Vector2(4.6, 0), new THREE.Vector2(0, 1.6)]);
  const pg = mesh(new THREE.ExtrudeGeometry(ped, { depth: 3.2, bevelEnabled: false }), std(W)); pg.position.set(0, 6.6, 0); por.add(pg);
  por.add(at(box(9.4, 0.4, 3.3, W), 0, 6.5, 1.6));
  for (let r = 0; r < 2; r++) for (let i = 0; i < 12; i++) { if (Math.abs(i - 5.5) < 2.4) continue; g.add(at(box(0.9, 1.5, 0.05, '#3a4656'), -10 + i * 1.8, 2 + r * 3, 4.02)); }
  g.add(at(box(6, 0.4, 3, '#e6e2d8'), 0, 0.2, 6.5));
  return g;
}
// Wall plastered with missing-person posters ("fichas de búsqueda"); no real names or faces.
export function posterWall(w = 8, h = 2.6, seed = 4) {
  const r = rng(seed);
  const tex = canvasTex(1024, 340, (x, W, H) => {
    x.fillStyle = '#8f8676'; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 60; i++) { const px = r() * (W - 90), py = r() * (H - 120), pw = 74 + r() * 18, ph = 100 + r() * 20, rot = (r() - 0.5) * 0.18;
      x.save(); x.translate(px + pw / 2, py + ph / 2); x.rotate(rot); x.fillStyle = ['#f6f3ea', '#fff8d8', '#ffe9ea', '#eef4ff'][Math.floor(r() * 4)]; x.fillRect(-pw / 2, -ph / 2, pw, ph);
      x.fillStyle = ['#c0272d', '#2a2a2a', '#c0272d', '#2a4a8a'][Math.floor(r() * 4)]; x.fillRect(-pw / 2, -ph / 2, pw, 16);
      x.fillStyle = '#ffffff'; x.font = '900 11px Inter'; x.textAlign = 'center'; x.fillText('SE BUSCA', 0, -ph / 2 + 12);
      x.fillStyle = ['#d9cbb8', '#cdbfa8', '#e2d4c0', '#c9b8a0'][Math.floor(r() * 4)]; x.fillRect(-pw / 2 + 10, -ph / 2 + 22, pw - 20, ph * 0.48);
      x.fillStyle = '#6b5a4a'; x.beginPath(); x.arc(0, -ph / 2 + 22 + ph * 0.18, pw * 0.14, 0, 7); x.fill(); x.beginPath(); x.ellipse(0, -ph / 2 + 22 + ph * 0.48, pw * 0.26, ph * 0.13, 0, Math.PI, 0); x.fill();
      x.fillStyle = '#4a4440'; for (let k = 0; k < 3; k++) x.fillRect(-pw / 2 + 10, ph * 0.12 + k * 9, (pw - 20) * (0.6 + r() * 0.4), 4);
      x.restore(); }
  });
  const g = new THREE.Group(); g.add(at(box(w, h, 0.3, '#8f8676'), 0, h / 2, -0.16));
  const p = plane(w, h, tex, false); p.position.set(0, h / 2, 0.0); g.add(p); return g;
}
export function candle(seed = 0) {
  const g = new THREE.Group(), r = rng(seed); const hgt = 0.14 + r() * 0.16;
  g.add(at(cyl(0.045, 0.05, hgt, ['#efe8d8', '#d84a3a', '#e8c86a'][seed % 3], 10), 0, hgt / 2, 0));
  const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: F.flashTex, color: '#ffc46b', blending: THREE.AdditiveBlending, depthWrite: false })); fl.position.y = hgt + 0.05; fl.scale.set(0.09, 0.15, 1); g.add(fl);
  g.flicker = t => { const k = 0.85 + 0.15 * Math.sin(t * 13 + seed * 3) * Math.sin(t * 7.3 + seed); fl.scale.set(0.09 * k, 0.16 * k, 1); };
  return g;
}
// School desk (pupitre) for the Ayotzinapa memorial.
export function pupitre() {
  const g = new THREE.Group(); g.add(at(box(0.62, 0.04, 0.44, '#b8935e'), 0, 0.72, 0.05)); g.add(at(box(0.44, 0.04, 0.42, '#b8935e'), 0, 0.42, -0.42));
  g.add(at(box(0.44, 0.36, 0.04, '#b8935e'), 0, 0.62, -0.64));
  for (const [x, z] of [[-0.26, 0.24], [0.26, 0.24], [-0.2, -0.6], [0.2, -0.6]]) g.add(at(cyl(0.015, 0.015, 0.72, '#3a3d42', 5), x, 0.36, z));
  return g;
}
// Stack of case files / archive boxes.
export function fileStack(n = 6, seed = 1) {
  const g = new THREE.Group(), r = rng(seed);
  for (let i = 0; i < n; i++) { const b = box(0.5, 0.3, 0.38, ['#c9b48a', '#d8c79e', '#bfa77a'][i % 3]); b.position.set((r() - 0.5) * 0.06, 0.15 + i * 0.3, (r() - 0.5) * 0.06); b.rotation.y = (r() - 0.5) * 0.25; g.add(b);
    const lab = box(0.2, 0.08, 0.005, '#f4efe2'); lab.position.set(b.position.x, b.position.y, b.position.z + 0.19); lab.rotation.y = b.rotation.y; g.add(lab); }
  return g;
}
// Office computer monitor (screen faces +z).
export function monitor() {
  const g = new THREE.Group();
  g.add(at(box(0.26, 0.02, 0.18, '#2a2c30'), 0, 0.01, 0)); g.add(at(box(0.05, 0.2, 0.04, '#2a2c30'), 0, 0.12, -0.02));
  g.add(at(box(0.58, 0.38, 0.05, '#1d1f23'), 0, 0.4, 0));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.32), new THREE.MeshBasicMaterial({ color: '#a9c8e8' })); scr.position.set(0, 0.4, 0.027); g.add(scr);
  return g;
}
export function phone(screen = null) {
  const g = new THREE.Group(); g.add(at(box(0.09, 0.17, 0.012, '#151618'), 0, 0, 0)); if (screen) { const s = plane(0.08, 0.155, screen); s.position.z = 0.007; g.add(s); } return g;
}
// Corner shop ("abarrotes") with an awning and shelves.
export function tiendita(name = 'ABARROTES LUPITA', wall = '#e8b84a') {
  const g = new THREE.Group(), W = 5, H = 3.2, D = 3.6, ox0 = -2.0, ox1 = 1.2, oh = 2.2;
  g.add(at(box(W, H, 0.1, wall), 0, H / 2, -D + 0.05)); for (const sx of [-1, 1]) g.add(at(box(0.1, H, D, wall), sx * (W / 2 - 0.05), H / 2, -D / 2));
  g.add(at(box(W, 0.1, D, '#d8d2c4'), 0, H - 0.05, -D / 2));
  g.add(at(box(ox0 + W / 2, H, 0.12, wall), (-W / 2 + ox0) / 2, H / 2, -0.06)); g.add(at(box(W / 2 - ox1, H, 0.12, wall), (W / 2 + ox1) / 2, H / 2, -0.06));
  g.add(at(box(ox1 - ox0, H - oh, 0.12, wall), (ox0 + ox1) / 2, oh + (H - oh) / 2, -0.06));
  g.add(at(box(W - 0.2, 0.02, D - 0.2, '#b8b0a0'), 0, 0.011, -D / 2));
  const sign = plane(4.4, 0.6, textTex(name, { w: 1024, h: 140, bg: '#c0272d', fg: '#ffffff', font: '900 92px Inter' }), false); sign.position.set(0, 2.75, 0.01); g.add(sign);
  const aw = mesh(new THREE.BoxGeometry(5.2, 0.06, 1.1), std('#2f6a8a')); aw.position.set(0, 2.3, 0.5); aw.rotation.x = 0.25; g.add(aw);
  for (let i = 0; i < 3; i++) { const sh = box(3.6, 0.05, 0.4, '#8a6a44'); sh.position.set(-0.3, 0.45 + i * 0.5, -3.3); g.add(sh);
    for (let k = 0; k < 11; k++) g.add(at(box(0.18, 0.26, 0.14, ['#c0272d', '#e8c84a', '#2a6ab8', '#3a8a4a', '#f2f2f2'][(k + i) % 5]), -1.8 + k * 0.3, 0.6 + i * 0.5, -3.3)); }
  for (let i = 0; i < 2; i++) { const sh = box(0.4, 0.05, 2.2, '#8a6a44'); sh.position.set(-2.15, 0.5 + i * 0.55, -1.9); g.add(sh);
    for (let k = 0; k < 7; k++) g.add(at(box(0.14, 0.24, 0.18, ['#e8c84a', '#c0272d', '#f2f2f2', '#3a8a4a'][(k + i) % 4]), -2.15, 0.64 + i * 0.55, -2.8 + k * 0.3)); }
  g.add(at(box(1.5, 0.55, 0.55, '#c9b48a'), 0.35, 0.275, -0.75)); g.add(at(box(1.56, 0.04, 0.6, '#a8865a'), 0.35, 0.57, -0.75)); // counter
  g.add(at(box(0.8, 1.6, 0.6, '#e9ecef'), 1.6, 0.8, -3.1)); g.add(at(box(0.7, 1.3, 0.02, '#a8d8e8'), 1.6, 0.85, -2.79)); // fridge
  const lamp = new THREE.PointLight('#fff2d8', 4, 7, 1.5); lamp.position.set(0, 2.8, -1.6); g.add(lamp);
  const sh = new THREE.Group(); g.add(sh); g.shutter = sh; sh.visible = false; // rolled-down metal shutter with a "closed" sign
  for (let i = 0; i < 14; i++) sh.add(at(box(ox1 - ox0 + 0.1, 0.15, 0.03, i % 2 ? '#9aa0a6' : '#8a9096'), (ox0 + ox1) / 2, 0.08 + i * 0.157, 0.02));
  const cl = plane(1.5, 0.55, textTex('CERRADO', { w: 640, h: 220, bg: '#f4f1ea', fg: '#c0272d', font: '900 120px Inter' }), false); cl.position.set((ox0 + ox1) / 2, 1.25, 0.045); cl.rotation.z = 0.05; sh.add(cl);
  return g;
}
// Lime / avocado tree with fruit.
export function fruitTree(kind = 'limon', s = 1, seed = 0) {
  const g = LP.roundTree(1.1 * s, kind === 'limon' ? '#3f7a32' : '#2f5a2a', seed);
  const r = rng(seed + 5), m = std(kind === 'limon' ? '#8fc23a' : '#2a3a1a', { roughness: 0.6 });
  for (let i = 0; i < 18; i++) { const a = r() * 6.28, h = 1.1 + r() * 0.9; const f = mesh(new THREE.SphereGeometry(kind === 'limon' ? 0.06 : 0.08, 8, 6), m); f.scale.y = kind === 'limon' ? 1 : 1.35;
    f.position.set(Math.cos(a) * 0.62 * s, h * s, Math.sin(a) * 0.62 * s); g.add(f); }
  return g;
}
// Burnt-out car for road blockades.
export function burntCar(seed = 0) {
  const g = new THREE.Group(), r = rng(seed);
  g.add(at(box(1.0, 0.45, 2.4, '#2a2622'), 0, 0.42, 0)); g.add(at(box(0.95, 0.36, 1.3, '#1f1c1a'), 0, 0.82, -0.15));
  for (const z of [0.8, -0.8]) for (const x of [-0.5, 0.5]) { const w = cyl(0.16, 0.16, 0.12, '#111', 10); w.rotation.z = Math.PI / 2; w.position.set(x, 0.16, z); g.add(w); }
  g.rotation.y = (r() - 0.5) * 0.6; return g;
}
export function shovel() { const g = new THREE.Group(); g.add(at(cyl(0.015, 0.015, 1.1, '#8a6a44', 5), 0, 0.55, 0)); g.add(at(box(0.16, 0.22, 0.02, '#7a7e82'), 0, 0.02, 0)); return g; }
export function rod() { const g = new THREE.Group(); g.add(at(cyl(0.008, 0.008, 1.3, '#6a6e72', 4), 0, 0.65, 0)); g.add(at(box(0.18, 0.02, 0.02, '#6a6e72'), 0, 1.3, 0)); return g; }
// Protest sign on a stick.
export function sign(text, { bg = '#ffffff', fg = '#1d1d1d', w = 0.9, h = 0.55 } = {}) {
  const g = new THREE.Group(); g.add(at(cyl(0.012, 0.012, 1.0, '#8a6a44', 5), 0, 0.5, 0));
  const p = plane(w, h, canvasTex(512, 312, (x, W, H) => { x.fillStyle = bg; x.fillRect(0, 0, W, H); x.fillStyle = fg; x.font = `900 ${text.length > 10 ? 64 : 88}px Inter`; x.textAlign = 'center'; x.textBaseline = 'middle';
    const words = text.split(' '); if (words.length > 2) { const half = Math.ceil(words.length / 2); x.fillText(words.slice(0, half).join(' '), W / 2, H / 2 - 50); x.fillText(words.slice(half).join(' '), W / 2, H / 2 + 50); } else x.fillText(text, W / 2, H / 2); }), false);
  p.position.y = 1.15; g.add(p); const back = p.clone(); back.rotation.y = Math.PI; g.add(back); return g;
}
export function typewriter() {
  const g = new THREE.Group(); g.add(at(box(0.5, 0.14, 0.4, '#2a2c30'), 0, 0.07, 0)); g.add(at(box(0.46, 0.08, 0.16, '#1d1f22'), 0, 0.16, -0.12));
  g.add(at(cyl(0.04, 0.04, 0.56, '#1a1a1a', 10), 0, 0.22, -0.16, 0, 0, Math.PI / 2)); g.add(at(box(0.36, 0.26, 0.005, '#f4efe2'), 0, 0.34, -0.17, -0.2, 0, 0));
  return g;
}
export function badgeDEA() {
  const tex = canvasTex(256, 256, (x, W) => { x.fillStyle = '#d4af37'; x.beginPath(); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, rr = i % 2 ? 90 : 120; x.lineTo(W / 2 + Math.sin(a) * rr, W / 2 - Math.cos(a) * rr); } x.fill();
    x.fillStyle = '#1d2a4a'; x.beginPath(); x.arc(W / 2, W / 2, 62, 0, 7); x.fill(); x.fillStyle = '#ffffff'; x.font = '900 46px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('DEA', W / 2, W / 2); });
  return plane(0.3, 0.3, tex);
}
export { box, cyl, at, mesh, rng };
