// Props for "Monopolio": the war-table city (the Siete Coronas tower, the rival's garage, shops, houses, figurine
// bases, price tags, the market-share counter), the CRT monitor, the glass dome, the check and the stamp, filing
// cabinets, the trophy shelf, the banner, rainy windows, the clock and the election board.
import * as THREE from 'three';
import { at, box, cyl, mesh } from '../lib/props.js';
import { canvasTex } from '../amer/look.js';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });
const R = seed => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const dyn = o => { o.userData.dynamic = true; return o; };
export const GOLD = '#d9a93a', NAVY = '#050b18';

// A canvas texture that can be redrawn: tex.redraw(fn) repaints only when the key changes.
export function liveTex(w, h, draw, { srgb = true } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4; tex.ctx = x; tex.W = w; tex.H = h; tex.key = null;
  tex.redraw = (key, fn = draw) => { if (key !== null && key === tex.key) return; tex.key = key; x.save(); x.clearRect(0, 0, w, h); fn(x, w, h); x.restore(); tex.needsUpdate = true; };
  if (draw) tex.redraw('init', draw);
  return tex;
}

// ------------------------------------------------------------ the war table
// Top surface in table-local metres: x in [-W/2, W/2], z in [-D/2, D/2]; streets are bands along x (avenues, fixed x)
// and z (streets, fixed z). The grid glows through an emissive map.
export const TABLE = { W: 1.8, D: 1.1, H: 0.8, ave: [-0.5, 0.06, 0.52], st: [-0.24, 0.2], road: 0.06 };
export function warTable() {
  const g = new THREE.Group(), { W, D, H } = TABLE;
  const wood = std('#2a1a12', { roughness: 0.55 }), brass = std(GOLD, { metalness: 0.75, roughness: 0.35 });
  g.add(at(box(W + 0.12, 0.08, D + 0.12, '#24160f'), 0, H - 0.04, 0));
  g.children[0].material = wood;
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = mesh(new THREE.BoxGeometry(0.08, H - 0.08, 0.08), wood); l.position.set(x * (W / 2 - 0.02), (H - 0.08) / 2, z * (D / 2 - 0.02)); g.add(l); }
  g.add(at(mesh(new THREE.BoxGeometry(W - 0.1, 0.05, 0.05), wood), 0, 0.18, D / 2 - 0.02), at(mesh(new THREE.BoxGeometry(W - 0.1, 0.05, 0.05), wood), 0, 0.18, -D / 2 + 0.02));
  for (const s of [-1, 1]) { g.add(at(mesh(new THREE.BoxGeometry(W + 0.14, 0.012, 0.012), brass), 0, H + 0.002, s * (D / 2 + 0.06))); g.add(at(mesh(new THREE.BoxGeometry(0.012, 0.012, D + 0.14), brass), s * (W / 2 + 0.06), H + 0.002, 0)); }
  const px = 1024, tex = canvasTex(px * 2, Math.round(px * 2 * D / W), (c, w, h) => {
    const sx = w / W, X = x => (x + W / 2) * sx, Z = z => (z + D / 2) * sx;
    c.fillStyle = '#02050c'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(70,150,255,0.18)'; c.lineWidth = 2;
    for (let x = -W / 2; x <= W / 2 + 1e-6; x += 0.05) { c.beginPath(); c.moveTo(X(x), 0); c.lineTo(X(x), h); c.stroke(); }
    for (let z = -D / 2; z <= D / 2 + 1e-6; z += 0.05) { c.beginPath(); c.moveTo(0, Z(z)); c.lineTo(w, Z(z)); c.stroke(); }
    c.strokeStyle = 'rgba(90,170,255,0.42)'; c.lineWidth = 3;
    for (let x = -W / 2; x <= W / 2 + 1e-6; x += 0.25) { c.beginPath(); c.moveTo(X(x), 0); c.lineTo(X(x), h); c.stroke(); }
    for (let z = -D / 2; z <= D / 2 + 1e-6; z += 0.25) { c.beginPath(); c.moveTo(0, Z(z)); c.lineTo(w, Z(z)); c.stroke(); }
    const rw = TABLE.road * sx;
    c.fillStyle = 'rgba(40,90,170,0.55)';
    for (const x of TABLE.ave) c.fillRect(X(x) - rw / 2, 0, rw, h);
    for (const z of TABLE.st) c.fillRect(0, Z(z) - rw / 2, w, rw);
    c.strokeStyle = 'rgba(150,215,255,0.95)'; c.lineWidth = 4; c.setLineDash([18, 16]);
    for (const x of TABLE.ave) { c.beginPath(); c.moveTo(X(x), 0); c.lineTo(X(x), h); c.stroke(); }
    for (const z of TABLE.st) { c.beginPath(); c.moveTo(0, Z(z)); c.lineTo(w, Z(z)); c.stroke(); }
    c.setLineDash([]); c.strokeStyle = 'rgba(120,200,255,0.9)'; c.lineWidth = 10; c.strokeRect(5, 5, w - 10, h - 10);
  }, { srgb: true });
  const topMat = new THREE.MeshStandardMaterial({ color: '#0a1428', roughness: 0.62, metalness: 0.05, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 1.0 });
  const top = new THREE.Mesh(new THREE.PlaneGeometry(W, D), topMat); top.rotation.x = -Math.PI / 2; top.position.y = H + 0.001; top.receiveShadow = true; g.add(top);
  g.topMat = dyn(top).material; g.top = H;
  return g;
}

// Windows texture for city blocks: dark glass with a grid of lit (warm) and unlit panes.
function windowsTex(seed, { cols = 6, rows = 10, lit = 0.6, warm = '#ffcf7a', glass = '#0c1424', frame = '#05080f' } = {}) {
  return canvasTex(128, 256, (c, w, h) => {
    const r = R(seed); c.fillStyle = frame; c.fillRect(0, 0, w, h);
    const cw = w / cols, rh = h / rows;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const on = r() < lit; c.fillStyle = on ? warm : glass; c.globalAlpha = on ? 0.75 + r() * 0.25 : 1;
      c.fillRect(i * cw + cw * 0.18, j * rh + rh * 0.2, cw * 0.64, rh * 0.55);
    }
    c.globalAlpha = 1;
  });
}
const winMat = (seed, o) => { const t = windowsTex(seed, o); return new THREE.MeshStandardMaterial({ color: '#0b1020', map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.9, roughness: 0.4, metalness: 0.3 }); };

// The Siete Coronas tower: three stepped tiers of dark glass with gold-lit windows, gold trim and a seven-point crown.
// tower.grow(k) raises it from a stub (k = 0.3) to full height; tower.glow(k) dims or lights every window.
export function tower() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const trim = std(GOLD, { metalness: 0.8, roughness: 0.3, emissive: '#5a3a08', emissiveIntensity: 0.4 });
  const mats = [winMat(71, { cols: 6, rows: 12, lit: 0.7 }), winMat(72, { cols: 5, rows: 10, lit: 0.65 }), winMat(73, { cols: 4, rows: 8, lit: 0.75 })];
  let y = 0; const tiers = [[0.2, 0.24], [0.16, 0.2], [0.12, 0.15]], parts = [];
  tiers.forEach(([s, h], i) => {
    const part = new THREE.Group(); part.position.y = y; body.add(part); parts.push(part);
    const m = new THREE.Mesh(new THREE.BoxGeometry(s, h, s), [mats[i], mats[i], std('#05070d'), std('#05070d'), mats[i], mats[i]]);
    m.position.y = h / 2; m.castShadow = true; part.add(m);
    part.add(at(mesh(new THREE.BoxGeometry(s + 0.014, 0.01, s + 0.014), trim), 0, h, 0));
    y += h;
  });
  const crown = new THREE.Group(); crown.position.y = y + 0.004; body.add(crown); parts.push(crown);
  crown.add(at(mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.025, 14), trim), 0, 0.012, 0));
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, sp = mesh(new THREE.ConeGeometry(0.011, 0.045, 6), trim); sp.position.set(Math.sin(a) * 0.042, 0.045, Math.cos(a) * 0.042); crown.add(sp);
    const gem = mesh(new THREE.SphereGeometry(0.006, 8, 6), new THREE.MeshStandardMaterial({ color: '#ff2a3a', emissive: '#ff2030', emissiveIntensity: 1.2 })); gem.position.set(Math.sin(a) * 0.042, 0.071, Math.cos(a) * 0.042); crown.add(gem); }
  const beacon = new THREE.PointLight('#ffd27a', 0.0, 0.9, 1.6); beacon.position.y = y + 0.08; body.add(beacon);
  g.height = y + 0.08; g.mats = mats; g.body = body; g.beacon = beacon; dyn(g);
  g.grow = k => { body.scale.set(1, 0.3 + 0.7 * k, 1); };
  g.glow = k => { mats.forEach(m => { m.emissiveIntensity = 0.15 + 0.85 * k; }); beacon.intensity = 0.25 * k; };
  // split(k): the tiers and the crown drift apart (a court-ordered breakup), k = 0 whole .. 1 apart
  const home = parts.map(p => p.position.clone()), away = [[-0.16, 0.0, 0.1, 0.25], [0.14, 0.05, 0.12, -0.3], [-0.06, 0.12, -0.14, 0.4], [0.12, 0.2, -0.08, -0.5]];
  g.split = k => parts.forEach((p, i) => { const [dx, dy, dz, r] = away[i]; p.position.set(home[i].x + dx * k, home[i].y + dy * k, home[i].z + dz * k); p.rotation.set(r * 0.4 * k, r * k, r * 0.3 * k); });
  g.grow(1); g.glow(1);
  return g;
}
// Pixel icon sprites that float over the table (always facing the camera).
const ICONS = {
  foto: (c, W) => { c.fillStyle = '#5ab0ff'; c.fillRect(8, 20, W - 16, W - 40); c.fillStyle = '#0d1a2a'; c.beginPath(); c.moveTo(14, W - 26); c.lineTo(44, W - 62); c.lineTo(66, W - 40); c.lineTo(84, W - 58); c.lineTo(W - 14, W - 26); c.fill(); c.fillStyle = '#ffe26a'; c.beginPath(); c.arc(W - 36, 40, 10, 0, 7); c.fill(); },
  contacto: (c, W) => { c.fillStyle = '#ffb43a'; c.beginPath(); c.arc(W / 2, 40, 22, 0, 7); c.fill(); c.beginPath(); c.ellipse(W / 2, W - 22, 40, 30, 0, Math.PI, 0); c.fill(); },
  archivo: (c, W) => { c.fillStyle = '#e8d26a'; c.fillRect(10, 30, W - 20, W - 50); c.fillRect(10, 20, 44, 14); c.fillStyle = '#b89a3a'; c.fillRect(10, 44, W - 20, 6); },
  candado: (c, W) => { c.strokeStyle = '#ffd36a'; c.lineWidth = 10; c.beginPath(); c.arc(W / 2, 46, 24, Math.PI, 0); c.stroke(); c.fillStyle = '#ffd36a'; c.fillRect(W / 2 - 36, 46, 72, 56); c.fillStyle = '#3a2a08'; c.fillRect(W / 2 - 5, 62, 10, 22); },
  nube: (c, W) => { c.fillStyle = '#7ac8ff'; for (const [x, y, r] of [[40, 70, 22], [64, 56, 28], [88, 70, 22]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } c.fillRect(40, 70, 48, 22); },
};
export function icon(kind, size = 0.07) {
  const tex = canvasTex(128, 128, (c, W) => { c.imageSmoothingEnabled = false; c.shadowColor = 'rgba(255,255,255,0.6)'; c.shadowBlur = 10; ICONS[kind](c, W); });
  tex.magFilter = THREE.NearestFilter;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
  sp.scale.setScalar(size); sp.renderOrder = 8; sp.userData.dynamic = true;
  return sp;
}

// The rival's rented garage: corrugated roof, roll-up door, a warm lit window and a pink neon sign with the app's name.
export function garage(name = 'PÉTALO') {
  const g = new THREE.Group(), wall = std('#3a3f4a', { roughness: 0.9 });
  g.add(at(mesh(new THREE.BoxGeometry(0.13, 0.075, 0.1), wall), 0, 0.0375, 0));
  const roof = mesh(new THREE.BoxGeometry(0.15, 0.008, 0.115), std('#5a606a', { metalness: 0.5, roughness: 0.5 })); roof.position.set(0, 0.079, 0); roof.rotation.x = 0.08; g.add(roof);
  const doorT = canvasTex(64, 48, (c, w, h) => { c.fillStyle = '#6a6f78'; c.fillRect(0, 0, w, h); c.fillStyle = '#4a4e56'; for (let j = 0; j < h; j += 5) c.fillRect(0, j, w, 2); });
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.055), new THREE.MeshStandardMaterial({ map: doorT, roughness: 0.6, metalness: 0.4 })); door.position.set(-0.022, 0.028, 0.0505); g.add(door);
  const winM = new THREE.MeshStandardMaterial({ color: '#2a1a0a', emissive: '#ffb050', emissiveIntensity: 1.4 });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.025), winM); win.position.set(0.04, 0.045, 0.0505); g.add(win);
  const signT = liveTex(256, 64, (c, w, h) => { c.fillStyle = '#12040c'; c.fillRect(0, 0, w, h); c.font = "700 44px 'Pixelify Sans'"; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = '#ff5aa8'; c.shadowBlur = 14; c.fillStyle = '#ff8ac4'; c.fillText(name, w / 2, h / 2 + 2); });
  const signM = new THREE.MeshStandardMaterial({ color: '#000', emissive: '#ffffff', emissiveMap: signT, emissiveIntensity: 1.3, map: signT });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.025), signM); sign.position.set(0, 0.1, 0.03); g.add(sign);
  g.add(at(cyl(0.002, 0.002, 0.02, '#333', 4), -0.04, 0.083, 0.03), at(cyl(0.002, 0.002, 0.02, '#333', 4), 0.04, 0.083, 0.03));
  const lamp = new THREE.PointLight('#ffb060', 0.25, 0.5, 1.5); lamp.position.set(0.04, 0.05, 0.09); g.add(lamp);
  g.light = k => { winM.emissiveIntensity = 1.4 * k; signM.emissiveIntensity = 1.3 * k; lamp.intensity = 0.25 * k; };
  return dyn(g);
}

// A small shop with a coloured neon strip; a plain lit block; a little house.
export function shop(col = '#4fd1ff', seed = 1, h = 0.09) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.1, h, 0.09), [winMat(seed, { cols: 4, rows: 4, lit: 0.55 }), winMat(seed + 1, { cols: 4, rows: 4, lit: 0.55 }), std('#0a0d14'), std('#0a0d14'), winMat(seed + 2, { cols: 4, rows: 4, lit: 0.6 }), winMat(seed + 3, { cols: 4, rows: 4, lit: 0.5 })]);
  m.position.y = h / 2; g.add(m);
  g.add(at(mesh(new THREE.BoxGeometry(0.104, 0.008, 0.094), new THREE.MeshStandardMaterial({ color: '#000', emissive: col, emissiveIntensity: 1.6 })), 0, h * 0.42, 0));
  return g;
}
export function block(seed = 1, w = 0.07, d = 0.07, h = 0.12) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [winMat(seed % 9, { cols: 3, rows: 6, lit: 0.45 }), winMat((seed + 3) % 9, { cols: 3, rows: 6, lit: 0.45 }), std('#080b12'), std('#080b12'), winMat((seed + 5) % 9, { cols: 3, rows: 6, lit: 0.5 }), winMat((seed + 7) % 9, { cols: 3, rows: 6, lit: 0.4 })]);
  m.position.y = h / 2; return m;
}
export function house(seed = 1) {
  const g = new THREE.Group(), r = R(seed), wall = std(['#2b3346', '#33303e', '#2a3a3a'][seed % 3], { roughness: 0.9 });
  g.add(at(mesh(new THREE.BoxGeometry(0.05, 0.035, 0.045), wall), 0, 0.0175, 0));
  const roof = mesh(new THREE.ConeGeometry(0.042, 0.022, 4), std('#1a1d26')); roof.rotation.y = Math.PI / 4; roof.position.y = 0.046; g.add(roof);
  if (r() < 0.75) g.add(at(mesh(new THREE.PlaneGeometry(0.012, 0.012), new THREE.MeshStandardMaterial({ color: '#000', emissive: '#ffc26a', emissiveIntensity: 1.1 })), 0.01, 0.02, 0.0226));
  return g;
}
// A round black base for a figurine (the people on the table are game pieces).
export function pieceBase(r = 0.03) {
  const g = new THREE.Group();
  g.add(at(mesh(new THREE.CylinderGeometry(r, r * 1.08, 0.008, 20), std('#0b0b10', { roughness: 0.4, metalness: 0.3 })), 0, 0.004, 0));
  g.add(at(mesh(new THREE.TorusGeometry(r * 1.02, 0.0015, 4, 24), std(GOLD, { metalness: 0.8, roughness: 0.3 })), 0, 0.008, 0)); g.children[1].rotation.x = Math.PI / 2;
  return g;
}

// A price tag on a little pole; tag.set(text, colour) repaints it.
export function priceTag(text = '$10', col = '#f2c14e') {
  const g = new THREE.Group();
  g.add(at(cyl(0.0025, 0.0025, 0.12, '#9a9aa0', 6), 0, 0.06, 0));
  const tex = liveTex(160, 96);
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.042), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.65, side: THREE.DoubleSide, transparent: true }));
  tag.position.set(0, 0.135, 0); g.add(tag);
  g.set = (t, c = col) => tex.redraw(t + c, (x, w, h) => {
    x.fillStyle = '#0d0d12'; x.beginPath(); x.roundRect(4, 4, w - 8, h - 8, 10); x.fill(); x.strokeStyle = c; x.lineWidth = 5; x.stroke();
    x.font = "400 74px VT323"; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = c; x.fillText(t, w / 2, h / 2 + 3); });
  g.set(text, col); g.tag = tag; return dyn(g);
}

// LED counter: a label and a big amber number (VT323), e.g. CUOTA DE MERCADO 61%.
export function ledCounter(label = 'CUOTA DE MERCADO') {
  const g = new THREE.Group();
  g.add(at(box(0.34, 0.085, 0.04, '#0c0c10'), 0, 0.0425, 0));
  const tex = liveTex(512, 128);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.075), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.position.set(0, 0.0425, 0.0205); g.add(scr);
  g.set = (v, col = '#ffb43a') => tex.redraw(label + v + col, (x, w, h) => {
    x.fillStyle = '#060404'; x.fillRect(0, 0, w, h);
    x.font = "700 26px Silkscreen"; x.fillStyle = 'rgba(255,180,58,0.65)'; x.textBaseline = 'top'; x.fillText(label, 16, 12);
    x.font = "400 96px VT323"; x.textAlign = 'right'; x.textBaseline = 'alphabetic'; x.fillStyle = col; x.shadowColor = col; x.shadowBlur = 16; x.fillText(v, w - 18, h - 14); });
  g.set('61%'); return dyn(g);
}

// ------------------------------------------------------------ the office
// CRT monitor on a rolling stand; draw(key, fn) repaints the screen canvas (640x480) when key changes.
export function crt() {
  const g = new THREE.Group(), plast = std('#3a3a40', { roughness: 0.6 }), metal = std('#202024', { metalness: 0.7, roughness: 0.4 });
  g.add(at(mesh(new THREE.BoxGeometry(0.62, 0.5, 0.5), plast), 0, 1.25, -0.04));
  g.add(at(mesh(new THREE.BoxGeometry(0.42, 0.36, 0.2), plast), 0, 1.25, -0.36));
  const tex = liveTex(640, 480);
  const scrM = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.375), scrM); scr.position.set(0, 1.26, 0.212); g.add(scr);
  const bezel = mesh(new THREE.BoxGeometry(0.56, 0.43, 0.02), std('#2a2a2e', { roughness: 0.5 })); bezel.position.set(0, 1.26, 0.2); g.add(bezel); scr.position.z = 0.2105 + 0.001;
  g.add(at(mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 8), metal), 0, 0.5, -0.05), at(mesh(new THREE.BoxGeometry(0.44, 0.03, 0.4), metal), 0, 0.98, -0.05));
  for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + Math.PI / 4, leg = mesh(new THREE.BoxGeometry(0.3, 0.02, 0.03), metal); leg.position.set(Math.cos(a) * 0.14, 0.04, Math.sin(a) * 0.14 - 0.05); leg.rotation.y = -a; g.add(leg); }
  g.add(at(mesh(new THREE.SphereGeometry(0.006, 6, 4), new THREE.MeshBasicMaterial({ color: '#ff3020' })), 0.24, 1.07, 0.212));
  const glow = new THREE.PointLight('#7fb0ff', 0.8, 2.2, 1.6); glow.position.set(0, 1.26, 0.5); g.add(glow);
  g.tex = tex; g.screen = scr; g.glowLight = glow; g.draw = (key, fn) => tex.redraw(key, fn);
  return dyn(g);
}

// Glass bell jar over the city: a lathe profile, faint glass with a bright fresnel rim, a gold base ring and knob.
export function dome(r = 0.62, h = 0.55) {
  const g = new THREE.Group(), pts = [];
  const cyl0 = h - r * 0.75;
  for (let i = 0; i <= 6; i++) pts.push(new THREE.Vector2(r, i / 6 * cyl0));
  for (let i = 1; i <= 16; i++) { const a = i / 16 * Math.PI / 2; pts.push(new THREE.Vector2(Math.cos(a) * r, cyl0 + Math.sin(a) * r * 0.75)); }
  const geo = new THREE.LatheGeometry(pts, 48);
  const glass = new THREE.MeshStandardMaterial({ color: '#bcd4ff', transparent: true, opacity: 0.13, roughness: 0.05, metalness: 0.1, depthWrite: false, side: THREE.DoubleSide, emissive: '#6fa0ff', emissiveIntensity: 0.0 });
  glass.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', `
      { float fr = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 3.0);
        outgoingLight += vec3(0.55, 0.75, 1.0) * fr * 2.6; diffuseColor.a = clamp(diffuseColor.a + fr * 0.7, 0.0, 1.0); }
      #include <opaque_fragment>`); };
  const shell = new THREE.Mesh(geo, glass); shell.renderOrder = 6; g.add(shell);
  const ring = mesh(new THREE.TorusGeometry(r, 0.012, 6, 64), std(GOLD, { metalness: 0.8, roughness: 0.3 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.006; g.add(ring);
  const knob = mesh(new THREE.SphereGeometry(0.03, 12, 10), std(GOLD, { metalness: 0.8, roughness: 0.3 })); knob.position.y = cyl0 + r * 0.75 + 0.02; g.add(knob);
  g.glass = glass; g.scale.set(1, 1, 0.7);
  return dyn(g);
}

// The check: Banco Imperial, payable to the rival, signed by the president.
export function check(payee = 'PÉTALO, S.A.', amount = '$ 4,000,000.00') {
  const tex = canvasTex(512, 224, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#e9e2c8'); gr.addColorStop(1, '#d6ceb0'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#7a6a3a'; c.lineWidth = 4; c.strokeRect(8, 8, w - 16, h - 16);
    c.fillStyle = '#5a1a1a'; c.font = "400 34px 'Jacquard 24'"; c.fillText('Banco Imperial', 24, 48);
    c.fillStyle = '#2a2a2a'; c.font = "700 18px Silkscreen"; c.fillText('PÁGUESE A LA ORDEN DE', 24, 92);
    c.font = "700 30px 'Pixelify Sans'"; c.fillText(payee, 24, 126);
    c.fillStyle = '#fff'; c.fillRect(300, 70, 190, 44); c.strokeStyle = '#2a2a2a'; c.lineWidth = 2; c.strokeRect(300, 70, 190, 44);
    c.fillStyle = '#1a1a1a'; c.font = "400 34px VT323"; c.fillText(amount, 306, 102);
    c.strokeStyle = '#1a2a6a'; c.lineWidth = 3; c.beginPath(); c.moveTo(300, 182); for (let i = 0; i < 18; i++) c.lineTo(300 + i * 10, 182 - 14 * Math.sin(i * 1.3) * (i % 3 ? 1 : 0.4)); c.stroke();
    c.fillStyle = '#2a2a2a'; c.font = "700 14px Silkscreen"; c.fillText('S. RUDOLF  ·  PRESIDENCIA', 300, 205);
    c.fillStyle = '#7a6a3a'; c.font = "400 22px VT323"; c.fillText('⑈0007⑈ 777 7777 77⑆', 24, 200);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.0745), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, side: THREE.DoubleSide, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.4 }));
  m.rotation.x = -Math.PI / 2; const g = new THREE.Group(); g.add(m); m.position.y = 0.0015; m.castShadow = true;
  return dyn(g);
}
// A contract sheet with a red "VENDIDO" stamp that can be shown.
export function contract(title = 'CONTRATO DE COMPRAVENTA') {
  const tex = liveTex(360, 480, null);
  const draw = stamped => tex.redraw('c' + stamped, (c, w, h) => {
    c.fillStyle = '#ece6d4'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#2a2a2a'; c.font = "700 20px Silkscreen"; c.textAlign = 'center'; c.fillText(title, w / 2, 46);
    c.fillStyle = 'rgba(40,40,40,0.55)'; for (let i = 0; i < 16; i++) c.fillRect(30, 80 + i * 20, w - 60 - (i % 4) * 30, 6);
    c.strokeStyle = '#2a2a2a'; c.beginPath(); c.moveTo(40, 430); c.lineTo(170, 430); c.moveTo(w - 170, 430); c.lineTo(w - 40, 430); c.stroke();
    if (stamped) { c.save(); c.translate(w / 2, h * 0.55); c.rotate(-0.22); c.strokeStyle = 'rgba(200,30,40,0.92)'; c.lineWidth = 10; c.strokeRect(-140, -52, 280, 104);
      c.fillStyle = 'rgba(200,30,40,0.92)'; c.font = "700 70px 'Pixelify Sans'"; c.textBaseline = 'middle'; c.fillText('VENDIDO', 0, 4); c.restore(); }
  });
  draw(false);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.2), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, side: THREE.DoubleSide }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.0012; const g = new THREE.Group(); g.add(m); g.stamp = draw;
  return dyn(g);
}
// Rubber stamp (handle up, rubber down), held by the knob.
export function rubberStamp() {
  const g = new THREE.Group();
  g.add(at(mesh(new THREE.BoxGeometry(0.06, 0.012, 0.04), std('#1a1a1a')), 0, 0.006, 0));
  g.add(at(mesh(new THREE.BoxGeometry(0.064, 0.018, 0.044), std('#5a2a1a', { roughness: 0.5 })), 0, 0.021, 0));
  g.add(at(mesh(new THREE.CylinderGeometry(0.008, 0.011, 0.05, 10), std('#3a1a10', { roughness: 0.4 })), 0, 0.055, 0));
  g.add(at(mesh(new THREE.SphereGeometry(0.017, 12, 10), std('#2a120a', { roughness: 0.35 })), 0, 0.088, 0));
  return dyn(g);
}

// Grey-green four-drawer filing cabinet; labels per drawer; cab.open(i, k) slides drawer i out by k (0..1).
export function filingCabinet(labels = ['A-F', 'G-M', 'N-R', 'S-Z'], seed = 1) {
  const g = new THREE.Group(), metal = std('#4a5048', { metalness: 0.45, roughness: 0.55 }), dark = std('#1a1c1a');
  const W = 0.48, D = 0.6, H = 1.32, dh = (H - 0.06) / 4;
  g.add(at(mesh(new THREE.BoxGeometry(W, H, D), metal), 0, H / 2, 0));
  g.drawers = [];
  labels.forEach((lab, i) => {
    const dr = new THREE.Group(); dr.position.set(0, 0.04 + dh * (3 - i) + dh / 2, D / 2); g.add(dr);
    dr.add(at(mesh(new THREE.BoxGeometry(W - 0.03, dh - 0.02, 0.02), metal), 0, 0, 0.01));
    dr.add(at(mesh(new THREE.BoxGeometry(0.14, 0.022, 0.02), std('#9a9a90', { metalness: 0.8, roughness: 0.3 })), 0, -0.04, 0.03));
    const lt = canvasTex(160, 64, (c, w, h) => { c.fillStyle = '#e9e2cc'; c.fillRect(0, 0, w, h); c.fillStyle = '#222'; c.font = "400 44px VT323"; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(lab, w / 2, h / 2 + 2); });
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.04), new THREE.MeshStandardMaterial({ map: lt, roughness: 0.9 })); tag.position.set(0, 0.05, 0.0215); dr.add(tag);
    // the drawer body (seen when open) with hanging folders
    const bodyG = new THREE.Group(); bodyG.position.z = -D / 2 + 0.02; dr.add(bodyG);
    bodyG.add(at(mesh(new THREE.BoxGeometry(W - 0.05, 0.01, D - 0.04), dark), 0, -dh / 2 + 0.03, 0));
    for (const sx of [-1, 1]) bodyG.add(at(mesh(new THREE.BoxGeometry(0.01, dh - 0.06, D - 0.04), metal), sx * (W / 2 - 0.03), 0, 0));
    dr.body = bodyG; g.drawers.push(dr); dyn(dr);
  });
  g.open = (i, k) => { g.drawers[i].position.z = D / 2 + k * (D - 0.1); };
  g.W = W; g.D = D; g.H = H; g.dh = dh;
  return g;
}
// Hanging folders with tabs (names of bought-and-buried startups), to put inside an open drawer body.
export function folders(names, w = 0.42, d = 0.5) {
  const g = new THREE.Group();
  names.forEach((nm, i) => {
    const z = -d / 2 + 0.03 + i * (d - 0.06) / Math.max(1, names.length - 1);
    const f = mesh(new THREE.BoxGeometry(w - 0.04, 0.2, 0.006), std(['#c8a05a', '#b8904a', '#d2aa62'][i % 3], { roughness: 0.9 })); f.position.set(0, -0.02, z); g.add(f);
    const tt = canvasTex(192, 48, (c, W, H) => { c.fillStyle = '#efe8d4'; c.fillRect(0, 0, W, H); c.fillStyle = '#8a1a1a'; c.font = "700 26px 'Pixelify Sans'"; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(nm, W / 2, H / 2 + 1); });
    const tab = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.03), new THREE.MeshStandardMaterial({ map: tt, roughness: 0.9 })); tab.position.set(-w / 2 + 0.1 + (i % 3) * 0.1, 0.095, z + 0.004); g.add(tab);
  });
  return g;
}

// Shelf of seven gold trophies (the seven crowns) under a little spotlight.
export function trophyShelf() {
  const g = new THREE.Group(), wood = std('#2a180e', { roughness: 0.5 }), gold = std(GOLD, { metalness: 0.85, roughness: 0.25, emissive: '#3a2404', emissiveIntensity: 0.3 });
  g.add(at(mesh(new THREE.BoxGeometry(1.5, 0.04, 0.3), wood), 0, 0, 0));
  const prof = [[0, 0], [0.04, 0], [0.04, 0.012], [0.012, 0.02], [0.01, 0.06], [0.02, 0.07], [0.055, 0.1], [0.06, 0.15], [0.05, 0.15], [0.045, 0.11], [0, 0.1]].map(([x, y]) => new THREE.Vector2(x, y));
  const cup = new THREE.LatheGeometry(prof, 20);
  for (let i = 0; i < 7; i++) {
    const t = new THREE.Mesh(cup, gold); const s = 0.9 + (i % 3) * 0.15; t.scale.setScalar(s); t.position.set(-0.6 + i * 0.2, 0.02, 0); t.castShadow = true; g.add(t);
    for (const sd of [-1, 1]) { const h = mesh(new THREE.TorusGeometry(0.022, 0.004, 6, 12, Math.PI), gold); h.position.set(-0.6 + i * 0.2 + sd * 0.058 * s, 0.02 + 0.12 * s, 0); h.rotation.z = sd * Math.PI / 2; g.add(h); }
  }
  const sp = new THREE.SpotLight('#ffe0a0', 2.2, 2.5, 0.6, 0.6, 1.4); sp.position.set(0, 0.9, 0.35); sp.target.position.set(0, 0, 0); g.add(sp, sp.target);
  return g;
}

// Red velvet banner with gold fringe, the seven-point crown and the house name.
export function banner(w = 1.0, h = 1.9) {
  const g = new THREE.Group();
  const tex = canvasTex(512, Math.round(512 * h / w), (c, W, H) => {
    const gr = c.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, '#3a0408'); gr.addColorStop(0.5, '#7a0e16'); gr.addColorStop(1, '#3a0408'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 9; i++) { c.fillStyle = `rgba(0,0,0,${0.08 + 0.06 * Math.sin(i * 1.7)})`; c.fillRect(i * W / 9, 0, W / 18, H); }
    c.strokeStyle = '#d9a93a'; c.lineWidth = 10; c.strokeRect(22, 22, W - 44, H - 120);
    c.lineWidth = 3; c.strokeRect(38, 38, W - 76, H - 152);
    const cx = W / 2, cy = H * 0.3, R0 = W * 0.27, top = cy - R0 * 0.62, val = cy - R0 * 0.02, base = cy + R0 * 0.36;
    c.fillStyle = '#d9a93a'; c.beginPath(); c.moveTo(cx - R0, base);
    for (let i = 0; i < 7; i++) { const xl = cx - R0 + i * 2 * R0 / 7, xr = xl + 2 * R0 / 7; c.lineTo(xl, i ? val : top + R0 * 0.25); c.lineTo((xl + xr) / 2, top); c.lineTo(xr, i < 6 ? val : top + R0 * 0.25); }
    c.lineTo(cx + R0, base); c.closePath(); c.fill();
    c.fillStyle = '#b8862a'; c.fillRect(cx - R0 * 1.04, base - R0 * 0.05, R0 * 2.08, R0 * 0.24);
    c.fillStyle = '#ff2a3a'; for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(cx - R0 + (i + 0.5) * 2 * R0 / 7, top - R0 * 0.06, R0 * 0.065, 0, 7); c.fill(); }
    c.fillStyle = '#3a0408'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(cx - R0 * 0.8 + i * R0 * 0.4, base + R0 * 0.07, R0 * 0.05, 0, 7); c.fill(); }
    c.fillStyle = '#d9a93a'; c.textAlign = 'center'; c.font = `400 ${Math.round(W * 0.16)}px 'Jacquard 24'`; c.fillText('Siete', cx, H * 0.62); c.fillText('Coronas', cx, H * 0.62 + W * 0.17);
    c.font = `700 ${Math.round(W * 0.045)}px Silkscreen`; c.fillText('S.A. DE C.V.', cx, H * 0.62 + W * 0.27);
    for (let i = 0; i < 20; i++) { c.fillStyle = i % 2 ? '#d9a93a' : '#b8862a'; c.fillRect(22 + i * (W - 44) / 20, H - 100, (W - 44) / 20 - 3, 80); }
  });
  const geo = new THREE.PlaneGeometry(w, h, 16, 1), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, 0.015 * Math.sin(p.getX(i) / w * Math.PI * 6));
  geo.computeVertexNormals();
  const cloth = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, side: THREE.DoubleSide })); g.add(cloth);
  const rod = mesh(new THREE.CylinderGeometry(0.018, 0.018, w + 0.25, 10), std(GOLD, { metalness: 0.8, roughness: 0.3 })); rod.rotation.z = Math.PI / 2; rod.position.y = h / 2 + 0.03; g.add(rod);
  for (const s of [-1, 1]) g.add(at(mesh(new THREE.SphereGeometry(0.03, 10, 8), std(GOLD, { metalness: 0.8, roughness: 0.3 })), s * (w / 2 + 0.13), h / 2 + 0.03, 0));
  return g;
}

// Rain-streaked window onto the night city: frame + mullions, a city backdrop, a scrolling rain layer and droplets.
// win.tick(t) scrolls the rain; win.flash(k) lights the sky (lightning).
export function rainWindow(w = 1.1, h = 2.2, seed = 1) {
  const g = new THREE.Group();
  const city = canvasTex(512, Math.round(512 * h / w), (c, W, H) => {
    const r = R(seed + 11), sky = c.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#04070f'); sky.addColorStop(0.55, '#0e1a33'); sky.addColorStop(1, '#1a2440'); c.fillStyle = sky; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) { c.fillStyle = `rgba(60,80,120,${0.08 + r() * 0.08})`; c.beginPath(); c.ellipse(r() * W, H * (0.1 + r() * 0.3), W * (0.3 + r() * 0.4), H * 0.04, 0, 0, 7); c.fill(); }
    let x = 0; while (x < W) { const bw = 20 + r() * 60, bh = H * (0.2 + r() * 0.45); c.fillStyle = `rgb(${8 + r() * 10},${12 + r() * 10},${24 + r() * 14})`; c.fillRect(x, H - bh, bw, bh);
      for (let yy = H - bh + 8; yy < H - 6; yy += 9) for (let xx = x + 4; xx < x + bw - 4; xx += 7) if (r() < 0.22) { c.fillStyle = r() < 0.8 ? 'rgba(255,200,120,0.85)' : 'rgba(170,210,255,0.8)'; c.fillRect(xx, yy, 3, 4); }
      if (r() < 0.3) { c.fillStyle = '#ff3030'; c.fillRect(x + bw / 2, H - bh - 3, 3, 3); }
      x += bw + 2; }
    const fog = c.createLinearGradient(0, H * 0.5, 0, H); fog.addColorStop(0, 'rgba(40,60,100,0)'); fog.addColorStop(1, 'rgba(40,60,100,0.35)'); c.fillStyle = fog; c.fillRect(0, 0, W, H);
  });
  const cityM = new THREE.MeshBasicMaterial({ map: city, toneMapped: true, color: '#ffffff' });
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), cityM); g.add(pane);
  const rainT = canvasTex(256, 512, (c, W, H) => { const r = R(seed + 5); for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H, l = 10 + r() * 30; c.strokeStyle = `rgba(190,210,255,${0.1 + r() * 0.3})`; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 2, y + l); c.stroke(); } }, { srgb: false });
  rainT.wrapS = rainT.wrapT = THREE.RepeatWrapping; rainT.repeat.set(w / 0.6, h / 1.2);
  const rain = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: rainT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.6 }));
  rain.position.z = 0.01; g.add(rain);
  const dropT = canvasTex(256, 512, (c, W, H) => { const r = R(seed + 9); for (let i = 0; i < 140; i++) { const x = r() * W, y = r() * H, s = 1 + r() * 3; c.fillStyle = `rgba(200,220,255,${0.15 + r() * 0.35})`; c.beginPath(); c.ellipse(x, y, s, s * 1.5, 0, 0, 7); c.fill(); if (r() < 0.3) { c.fillRect(x - 0.5, y, 1, 10 + r() * 30); } } }, { srgb: false });
  dropT.wrapS = dropT.wrapT = THREE.RepeatWrapping; dropT.repeat.set(w / 0.8, h / 1.6);
  const drops = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: dropT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55 }));
  drops.position.z = 0.02; g.add(drops);
  const fr = std('#1a110b', { roughness: 0.6 });
  for (const [x, y, ww, hh] of [[0, h / 2 + 0.05, w + 0.2, 0.1], [0, -h / 2 - 0.05, w + 0.24, 0.1], [w / 2 + 0.05, 0, 0.1, h + 0.2], [-w / 2 - 0.05, 0, 0.1, h + 0.2], [0, 0, 0.04, h], [0, h / 6, w, 0.035], [0, -h / 6, w, 0.035], [0, h / 2 - 0.02, w, 0.03]]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(ww, hh, 0.09), fr); b.position.set(x, y, 0.04); b.castShadow = true; g.add(b); }
  g.tick = t => { rainT.offset.y = t * 1.6; dropT.offset.y = -t * 0.035; };
  g.flash = k => { cityM.color.setScalar(1 + 5 * k); };
  return dyn(g);
}

// Wall clock showing a quarter to midnight; clock.set(h, m, s) moves the hands.
export function clock(r = 0.26) {
  const g = new THREE.Group();
  const face = canvasTex(256, 256, (c, W) => { c.fillStyle = '#e8e0c8'; c.beginPath(); c.arc(W / 2, W / 2, W / 2 - 4, 0, 7); c.fill(); c.fillStyle = '#1a1a1a'; c.font = "700 30px Silkscreen"; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2; c.fillText(String(i), W / 2 + Math.sin(a) * W * 0.36, W / 2 - Math.cos(a) * W * 0.36); } });
  g.add(at(mesh(new THREE.CylinderGeometry(r + 0.03, r + 0.03, 0.05, 32), std('#2a1a10', { roughness: 0.5 })), 0, 0, -0.02)); g.children[0].rotation.x = Math.PI / 2;
  const f = new THREE.Mesh(new THREE.CircleGeometry(r, 32), new THREE.MeshStandardMaterial({ map: face, roughness: 0.7 })); f.position.z = 0.006; g.add(f);
  const hand = (len, wd, col) => { const p = new THREE.Group(); p.add(at(mesh(new THREE.BoxGeometry(wd, len, 0.004), std(col)), 0, len / 2 - 0.02, 0)); p.position.z = 0.012; g.add(p); return p; };
  const hh = hand(r * 0.55, 0.018, '#111'), mh = hand(r * 0.8, 0.012, '#111'), sh = hand(r * 0.85, 0.005, '#a01818');
  g.set = (h, m, s) => { sh.rotation.z = -s / 60 * Math.PI * 2; mh.rotation.z = -(m + s / 60) / 60 * Math.PI * 2; hh.rotation.z = -((h % 12) + m / 60) / 12 * Math.PI * 2; };
  g.set(11, 47, 0);
  return dyn(g);
}

// Cork board with the student-council election notice: one candidate, the rest of the lines empty.
export function electionBoard() {
  const g = new THREE.Group();
  const tex = canvasTex(640, 448, (c, W, H) => {
    const r = R(7); c.fillStyle = '#7a5532'; c.fillRect(0, 0, W, H); for (let i = 0; i < 2600; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '40,25,10' : '160,120,70'},0.35)`; c.fillRect(r() * W, r() * H, 2, 2); }
    c.save(); c.translate(W * 0.5, H * 0.5); c.rotate(-0.02);
    c.fillStyle = '#f2ecdc'; c.fillRect(-170, -190, 340, 380);
    c.fillStyle = '#7a0e16'; c.font = "400 40px 'Jacquard 24'"; c.textAlign = 'center'; c.fillText('Elecciones', 0, -140); c.font = "700 20px Silkscreen"; c.fillText('CONSEJO ESTUDIANTIL', 0, -108);
    c.fillStyle = '#222'; c.font = "700 18px Silkscreen"; c.textAlign = 'left'; c.fillText('CANDIDATAS:', -140, -66);
    c.font = "700 26px 'Pixelify Sans'"; c.fillText('1. Symboli Rudolf', -140, -28);
    c.strokeStyle = '#999'; c.lineWidth = 2; for (let i = 0; i < 5; i++) { c.fillStyle = '#999'; c.font = "700 22px 'Pixelify Sans'"; c.fillText(`${i + 2}.`, -140, 12 + i * 34); c.beginPath(); c.moveTo(-108, 14 + i * 34); c.lineTo(140, 14 + i * 34); c.stroke(); }
    c.restore();
    c.fillStyle = '#d02030'; for (const [x, y] of [[W * 0.5 - 150, H * 0.5 - 175], [W * 0.5 + 150, H * 0.5 - 175]]) { c.beginPath(); c.arc(x, y, 8, 0, 7); c.fill(); }
    c.save(); c.translate(W * 0.8, H * 0.78); c.rotate(0.12); c.fillStyle = '#f4e04a'; c.fillRect(-60, -50, 120, 100); c.fillStyle = '#333'; c.font = "700 22px 'Pixelify Sans'"; c.textAlign = 'center'; c.fillText('¿nadie', 0, -10); c.fillText('más?', 0, 18); c.restore();
  });
  g.add(at(mesh(new THREE.BoxGeometry(1.04, 0.74, 0.03), std('#3a2414', { roughness: 0.6 })), 0, 0, -0.016));
  const b = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.7), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 })); b.position.z = 0.001; g.add(b);
  return g;
}

// Green banker's lamp with a warm bulb light.
export function bankerLamp() {
  const g = new THREE.Group(), brass = std(GOLD, { metalness: 0.8, roughness: 0.3 });
  g.add(at(mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.02, 16), brass), 0, 0.01, 0), at(mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 8), brass), 0, 0.16, 0));
  const shade = mesh(new THREE.CylinderGeometry(0.04, 0.11, 0.08, 16, 1, true, 0, Math.PI), new THREE.MeshStandardMaterial({ color: '#0e5a2a', emissive: '#0a6a2a', emissiveIntensity: 0.6, roughness: 0.3, side: THREE.DoubleSide }));
  shade.rotation.set(0, Math.PI / 2, Math.PI / 2); shade.position.set(0, 0.3, 0); shade.scale.set(1, 1.6, 1); g.add(shade);
  const bulb = new THREE.PointLight('#ffb866', 1.6, 3.2, 1.5); bulb.position.set(0, 0.26, 0.06); g.add(bulb); g.bulb = bulb;
  return g;
}

// Pill capsules on a tray (100), for the pharma "killer acquisitions" figure; pills.bury(k) sinks the marked ones.
export function pillTray(n = 100, marked = [7, 23, 38, 44, 61, 76, 92]) {
  const g = new THREE.Group(), cols = 10, gap = 0.032;
  g.add(at(mesh(new THREE.BoxGeometry(cols * gap + 0.04, 0.012, cols * gap + 0.04), std('#16181e', { roughness: 0.4, metalness: 0.4 })), 0, 0.006, 0));
  const cap = new THREE.CapsuleGeometry(0.006, 0.012, 4, 8), white = std('#e8e6e0', { roughness: 0.4 }), red = std('#c81e2a', { roughness: 0.4, emissive: '#5a0008', emissiveIntensity: 0.6 });
  g.pills = [];
  for (let i = 0; i < n; i++) { const p = new THREE.Mesh(cap, marked.includes(i) ? red : white); p.rotation.z = Math.PI / 2; p.rotation.y = (i * 0.7) % 1;
    p.position.set((i % cols - (cols - 1) / 2) * gap, 0.019, (Math.floor(i / cols) - (cols - 1) / 2) * gap); g.add(p); if (marked.includes(i)) g.pills.push(p); }
  g.bury = k => g.pills.forEach((p, j) => { const kk = Math.min(1, Math.max(0, k * 1.6 - j * 0.09)); p.position.y = 0.019 - 0.03 * kk; p.scale.setScalar(1 - 0.5 * kk); });
  return dyn(g);
}
