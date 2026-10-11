// Props for the Napoleonic Wars video: ships of the line, fortresses, monuments, period furniture and flags.
import * as THREE from 'three';
import { at, box, cyl, mesh, rng } from '../lib/props.js';
import { canvasTex, puffTex } from '../mx/props.js';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o });
const flat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, flatShading: true, ...o });
export { canvasTex, puffTex };

// ------------------------------------------------------------ flags
function drawFlag(kind, g, W, H) {
  const tri = (cols, vertical = true) => cols.forEach((c, i) => { g.fillStyle = c; vertical ? g.fillRect(i * W / cols.length, 0, W / cols.length + 1, H) : g.fillRect(0, i * H / cols.length, W, H / cols.length + 1); });
  if (kind === 'fr') tri(['#2a3f8f', '#f6f3ea', '#ce1126']);
  else if (kind === 'eagle') { tri(['#2a3f8f', '#f6f3ea', '#ce1126']); g.fillStyle = '#c9a227'; g.font = `900 ${H * 0.34}px Georgia`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('N', W / 2, H / 2);
    g.strokeStyle = '#c9a227'; g.lineWidth = H * 0.04; g.strokeRect(H * 0.05, H * 0.05, W - H * 0.1, H - H * 0.1); }
  else if (kind === 'gb') {
    g.fillStyle = '#1f3f8f'; g.fillRect(0, 0, W, H);
    const diag = (w, c) => { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(0, 0); g.lineTo(W, H); g.moveTo(W, 0); g.lineTo(0, H); g.stroke(); };
    diag(H * 0.2, '#f6f3ea'); diag(H * 0.07, '#ce1126');
    g.fillStyle = '#f6f3ea'; g.fillRect(W / 2 - H * 0.17, 0, H * 0.34, H); g.fillRect(0, H / 2 - H * 0.17, W, H * 0.34);
    g.fillStyle = '#ce1126'; g.fillRect(W / 2 - H * 0.1, 0, H * 0.2, H); g.fillRect(0, H / 2 - H * 0.1, W, H * 0.2);
  } else if (kind === 'es') { tri(['#c60b1e', '#ffc400', '#ffc400', '#c60b1e'], false); g.fillStyle = '#c60b1e'; g.fillRect(W * 0.22, H * 0.35, W * 0.12, H * 0.3); g.fillStyle = '#c9a227'; g.fillRect(W * 0.235, H * 0.3, W * 0.09, H * 0.06); }
  else if (kind === 'ru') tri(['#f6f3ea', '#2a5fb8', '#ce1126'], false);
  else if (kind === 'stand') { g.fillStyle = '#f6f3ea'; g.fillRect(0, 0, W, H); g.strokeStyle = '#2a5fb8'; g.lineWidth = H * 0.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(W, H); g.moveTo(W, 0); g.lineTo(0, H); g.stroke(); }
  else if (kind === 'at') tri(['#1d1b1c', '#f2c40c'], false);
  else if (kind === 'pr') { tri(['#1d1b1c', '#f6f3ea', '#1d1b1c'], false); g.fillStyle = '#1d1b1c'; g.beginPath(); g.arc(W / 2, H / 2, H * 0.12, 0, Math.PI * 2); g.fill(); }
  else if (kind === 'se') { g.fillStyle = '#1f5fa8'; g.fillRect(0, 0, W, H); g.fillStyle = '#f2c40c'; g.fillRect(W * 0.3, 0, H * 0.2, H); g.fillRect(0, H * 0.4, W, H * 0.2); }
  else if (kind === 'bourbon') { g.fillStyle = '#f6f3ea'; g.fillRect(0, 0, W, H); fleurs(g, W, H, '#c9a227', 3); }
  else if (kind === 'royalblue') { g.fillStyle = '#1f3f8f'; g.fillRect(0, 0, W, H); fleurs(g, W, H, '#e2bd45', 3); }
  else if (kind === 'guadalupe') guadalupe(g, W, H);
  else if (kind === 'white') { g.fillStyle = '#f6f3ea'; g.fillRect(0, 0, W, H); }
}
function fleur(g, x, y, s, c) {
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = c; g.beginPath();
  g.moveTo(0, -1); g.bezierCurveTo(0.35, -0.6, 0.3, -0.1, 0, 0.15); g.bezierCurveTo(-0.3, -0.1, -0.35, -0.6, 0, -1); g.fill();
  for (const d of [-1, 1]) { g.beginPath(); g.moveTo(0.1 * d, 0.1); g.bezierCurveTo(0.9 * d, -0.4, 0.8 * d, 0.3, 0.35 * d, 0.45); g.bezierCurveTo(0.45 * d, 0.2, 0.3 * d, 0.15, 0.1 * d, 0.25); g.fill(); }
  g.fillRect(-0.45, 0.2, 0.9, 0.14); g.beginPath(); g.moveTo(-0.12, 0.34); g.lineTo(0.12, 0.34); g.lineTo(0, 0.9); g.fill(); g.restore();
}
export function fleurs(g, W, H, c, n = 4) { const s = W / n; for (let i = 0; i < n; i++) for (let j = 0; j < Math.ceil(H / s); j++) fleur(g, s * (i + 0.5) + (j % 2) * s * 0.5 - s * 0.25, s * (j + 0.5), s * 0.28, c); }
function guadalupe(g, W, H) {
  g.fillStyle = '#efe6cf'; g.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H * 0.52;
  for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; g.strokeStyle = i % 2 ? '#e8b84a' : '#d99a2b'; g.lineWidth = 4; g.beginPath(); g.moveTo(cx + Math.cos(a) * W * 0.16, cy + Math.sin(a) * H * 0.3); g.lineTo(cx + Math.cos(a) * W * 0.36, cy + Math.sin(a) * H * 0.44); g.stroke(); }
  g.fillStyle = '#f0c25a'; g.beginPath(); g.ellipse(cx, cy, W * 0.2, H * 0.36, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#c96a6a'; g.beginPath(); g.ellipse(cx, cy + H * 0.04, W * 0.07, H * 0.26, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#2f6b6a'; g.beginPath(); g.moveTo(cx, cy - H * 0.3); g.bezierCurveTo(cx - W * 0.16, cy - H * 0.2, cx - W * 0.15, cy + H * 0.2, cx - W * 0.06, cy + H * 0.3);
  g.lineTo(cx + W * 0.06, cy + H * 0.3); g.bezierCurveTo(cx + W * 0.15, cy + H * 0.2, cx + W * 0.16, cy - H * 0.2, cx, cy - H * 0.3); g.fill();
  g.fillStyle = '#c96a6a'; g.beginPath(); g.ellipse(cx, cy + H * 0.02, W * 0.045, H * 0.2, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e9c7a8'; g.beginPath(); g.arc(cx + W * 0.01, cy - H * 0.22, W * 0.035, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f2e9c2'; for (let i = 0; i < 14; i++) { g.beginPath(); g.arc(cx + (i % 2 ? 1 : -1) * W * (0.06 + (i % 3) * 0.025), cy - H * 0.2 + i * H * 0.03, 2.5, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#3a3a3a'; g.beginPath(); g.ellipse(cx, cy + H * 0.33, W * 0.12, H * 0.04, 0, 0, Math.PI); g.fill();
  g.strokeStyle = '#8a1f2a'; g.lineWidth = 10; g.strokeRect(8, 8, W - 16, H - 16);
}
export function flag(kind = 'fr', poleH = 3, w = 1.3, h = 0.8, { finial = 'ball', vertical = false } = {}) {
  const tex = canvasTex(vertical ? 200 : 256, vertical ? 260 : 160, (g, W, H) => drawFlag(kind, g, W, H));
  const gr = new THREE.Group();
  gr.add(at(cyl(0.035, 0.04, poleH, '#6b4a2f', 8), 0, poleH / 2, 0));
  if (finial === 'eagle') { const e = new THREE.Group(); e.add(at(mesh(new THREE.SphereGeometry(0.07, 10, 8), std('#d4af37', { metalness: 0.7, roughness: 0.3 })), 0, 0, 0));
    for (const s of [-1, 1]) { const wg = mesh(new THREE.ConeGeometry(0.05, 0.18, 4), std('#d4af37', { metalness: 0.7, roughness: 0.3 })); wg.rotation.z = s * 1.2; wg.position.set(s * 0.09, 0.06, 0); e.add(wg); }
    e.add(at(box(0.16, 0.03, 0.06, '#d4af37'), 0, -0.08, 0)); e.position.y = poleH + 0.1; gr.add(e); }
  else gr.add(at(mesh(new THREE.SphereGeometry(0.07, 8, 6), std('#c9a227', { metalness: 0.6 })), 0, poleH + 0.05, 0));
  const geo = new THREE.PlaneGeometry(w, h, 12, 3);
  const f = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.8 }));
  f.position.set(w / 2 + 0.04, poleH - h / 2 - 0.05, 0); f.castShadow = true; gr.add(f);
  gr.cloth = f; gr.base = geo.attributes.position.array.slice();
  gr.wave = (t, k = 1) => { const p = geo.attributes.position, a = gr.base; for (let i = 0; i < p.count; i++) { const x = a[i * 3] + w / 2; p.setZ(i, (Math.sin(x * 4 - t * 5) * 0.07 + Math.sin(x * 7 - t * 8 + a[i * 3 + 1] * 3) * 0.02) * x * k); } p.needsUpdate = true; geo.computeVertexNormals(); };
  return gr;
}
// Hanging banner / wall drape with a pattern.
export function drape(kind, w = 1.4, h = 3) {
  const tex = canvasTex(256, Math.round(256 * h / w), (g, W, H) => { drawFlag(kind, g, W, H); g.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 6; i++) g.fillRect(i * W / 6, 0, 3, H); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, side: THREE.DoubleSide }));
  return m;
}

// ------------------------------------------------------------ ships
// Ship of the line (two or three gun decks). Faces +z. Size: ~ len long. Sails can be set (0) or furled (1).
export function ship({ len = 10, hull = '#2a2420', band = '#d8b04a', sails = '#efe9da', flag: fk = 'gb', decks = 2, furled = 0, seed = 1 } = {}) {
  const g = new THREE.Group(), W = len * 0.27;
  const outline = s => { const L = len / 2; s.moveTo(0, L * 1.02); s.bezierCurveTo(W * 0.42, L * 0.85, W * 0.5, L * 0.45, W * 0.5, L * 0.1); s.lineTo(W * 0.48, -L * 0.8); s.lineTo(W * 0.34, -L);
    s.lineTo(-W * 0.34, -L); s.lineTo(-W * 0.48, -L * 0.8); s.lineTo(-W * 0.5, L * 0.1); s.bezierCurveTo(-W * 0.5, L * 0.45, -W * 0.42, L * 0.85, 0, L * 1.02); };
  const layer = (y0, h, k, color, ports = false) => {
    const s = new THREE.Shape(); outline(s);
    const geo = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 10 }); geo.rotateX(-Math.PI / 2);
    const m = mesh(geo, flat(color)); m.scale.set(k, 1, 1); m.position.y = y0; g.add(m);
    if (ports) for (const sd of [-1, 1]) for (let i = 0; i < 12; i++) { const z = -len * 0.38 + i * len * 0.066; const p = box(0.02, h * 0.42, len * 0.03, '#1a1512'); p.position.set(sd * W * 0.5 * k + sd * 0.012, y0 + h * 0.5, z); g.add(p); }
  };
  const lh = len * 0.045;
  layer(-lh * 2.2, lh * 2.2, 0.82, '#5a3524');            // below the waterline (copper-brown)
  let y = 0, k = 0.97;
  for (let d = 0; d < decks; d++) { layer(y, lh * 0.35, k, hull); y += lh * 0.35; layer(y, lh, k * 0.99, band, true); y += lh; k *= 0.97; }
  layer(y, lh * 0.5, k, hull); y += lh * 0.5;
  const deckY = y; g.deckY = deckY;
  // stern castle with windows
  g.add(at(box(W * 0.62 * k, lh * 1.6, len * 0.16, hull), 0, deckY + lh * 0.8, -len * 0.42));
  for (let i = 0; i < 5; i++) g.add(at(box(W * 0.08, lh * 0.5, 0.02, '#e8c46a'), -W * 0.24 + i * W * 0.12, deckY + lh * 0.7, -len * 0.505));
  // bowsprit
  const bs = cyl(0.05 * len / 10, 0.07 * len / 10, len * 0.32, '#4a3220', 8); bs.rotation.x = Math.PI / 2 - 0.35; bs.position.set(0, deckY + 0.2, len * 0.6); g.add(bs);
  // masts, yards and sails
  const sailMat = new THREE.MeshStandardMaterial({ color: sails, roughness: 0.9, side: THREE.DoubleSide });
  const masts = [[len * 0.28, 0.82], [0, 1.0], [-len * 0.27, 0.72]];
  g.sails = [];
  masts.forEach(([z, hk], mi) => {
    const H = len * 0.95 * hk;
    g.add(at(cyl(0.05 * len / 10, 0.09 * len / 10, H, '#4a3220', 8), 0, deckY + H / 2, z));
    const tiers = mi === 2 ? 2 : 3;
    for (let ti = 0; ti < tiers; ti++) {
      const yy = deckY + H * (0.33 + ti * 0.24), sw = W * (1.25 - ti * 0.28) * (mi === 2 ? 0.8 : 1), sh = H * 0.21;
      g.add(at(cyl(0.03 * len / 10, 0.03 * len / 10, sw * 1.08, '#4a3220', 6), 0, yy + sh / 2, z, 0, 0, Math.PI / 2));
      const sg = new THREE.PlaneGeometry(sw, sh, 8, 4), p = sg.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i) / sw, yv = p.getY(i) / sh; p.setZ(i, (1 - furled) * (0.09 * len / 10) * 6 * (1 - 4 * x * x) * (0.6 + 0.4 * (0.5 - yv))); p.setY(i, p.getY(i) * (1 - furled * 0.85) + furled * sh * 0.4); }
      sg.computeVertexNormals();
      const sm = new THREE.Mesh(sg, sailMat); sm.position.set(0, yy, z + 0.06); sm.castShadow = true; g.add(sm); g.sails.push(sm);
    }
    if (mi === 1 || fk) { const pen = new THREE.Mesh(new THREE.PlaneGeometry(len * 0.12, len * 0.02), std(fk === 'fr' ? '#2a3f8f' : fk === 'es' ? '#c60b1e' : '#c0272d', { side: THREE.DoubleSide })); pen.position.set(len * 0.06, deckY + H + 0.1, z); g.add(pen); }
  });
  // stays/ropes from the bowsprit to the foremast and from mast tops to the sides
  const ropeMat = new THREE.LineBasicMaterial({ color: '#2a2018' });
  const lines = [];
  masts.forEach(([z, hk]) => { const H = len * 0.95 * hk; for (const sd of [-1, 1]) lines.push(new THREE.Vector3(0, deckY + H * 0.9, z), new THREE.Vector3(sd * W * 0.5, deckY + 0.05, z - len * 0.04)); });
  lines.push(new THREE.Vector3(0, deckY + len * 0.95 * 0.82 * 0.95, len * 0.28), new THREE.Vector3(0, deckY + 0.3, len * 0.74));
  g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lines), ropeMat));
  // ensign at the stern
  const tex = canvasTex(256, 160, (c, Wd, Hd) => drawFlag(fk, c, Wd, Hd));
  const fg = new THREE.PlaneGeometry(len * 0.16, len * 0.1, 8, 2);
  const fm = new THREE.Mesh(fg, new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.8 }));
  fm.rotation.y = Math.PI / 2; fm.position.set(0, deckY + lh * 2.4, -len * 0.58); g.add(fm); g.add(at(cyl(0.02, 0.02, len * 0.18, '#4a3220', 6), 0, deckY + lh * 2.2, -len * 0.5, 0.9, 0, 0));
  const base = fg.attributes.position.array.slice();
  g.wave = t => { const p = fg.attributes.position; for (let i = 0; i < p.count; i++) { const x = base[i * 3] + len * 0.08; p.setZ(i, Math.sin(x * 2 - t * 5) * 0.05 * x); } p.needsUpdate = true; };
  // gun-port positions (world-ish, for broadside flashes)
  g.ports = []; for (const sd of [-1, 1]) for (let d = 0; d < decks; d++) for (let i = 0; i < 12; i++) g.ports.push(new THREE.Vector3(sd * W * 0.5 * (0.97 - d * 0.03) + sd * 0.1, lh * 0.35 * (d + 1) + lh * (d + 0.5), -len * 0.38 + i * len * 0.066));
  return g;
}
// Small two-masted brig / boat for escapes and harbours.
export function brig(len = 4, color = '#3a2a1e') { return ship({ len, decks: 1, hull: color, band: '#6b4a2f', flag: 'fr' }); }
export function rowboat(color = '#6b4a2f') {
  const g = new THREE.Group();
  const s = new THREE.Shape(); s.moveTo(0, 0.9); s.quadraticCurveTo(0.42, 0.4, 0.4, -0.5); s.lineTo(-0.4, -0.5); s.quadraticCurveTo(-0.42, 0.4, 0, 0.9);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.32, bevelEnabled: false }); geo.rotateX(-Math.PI / 2); g.add(mesh(geo, flat(color)));
  g.add(at(box(0.72, 0.04, 0.12, '#8a6a4a'), 0, 0.25, 0.1)); g.add(at(box(0.72, 0.04, 0.12, '#8a6a4a'), 0, 0.25, -0.3));
  return g;
}

// ------------------------------------------------------------ architecture
export function bastille() {
  const g = new THREE.Group(), stone = '#8f877a', top = '#7d7569';
  const towers = [[-6, -3], [-2, -3.4], [2, -3.4], [6, -3], [-6, 3], [-2, 3.4], [2, 3.4], [6, 3]];
  for (const [x, z] of towers) {
    g.add(at(cyl(1.5, 1.6, 9, stone, 20), x, 4.5, z));
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.add(at(box(0.42, 0.55, 0.32, top), x + Math.cos(a) * 1.45, 9.25, z + Math.sin(a) * 1.45, 0, -a, 0)); }
    for (let k = 0; k < 3; k++) g.add(at(box(0.22, 0.6, 0.06, '#2a2622'), x + 0.0, 3 + k * 2.2, z + (z > 0 ? 1.58 : -1.58)));
  }
  g.add(at(box(12, 8, 6.6, stone), 0, 4, 0));
  for (let i = 0; i < 24; i++) for (const zz of [-3.3, 3.3]) g.add(at(box(0.36, 0.5, 0.3, top), -5.6 + i * 0.49, 8.2, zz));
  g.add(at(box(2.2, 3.4, 0.2, '#3a2a1e'), 0, 1.7, 3.45)); // gate
  g.add(at(box(2.6, 0.2, 3.2, '#5a4632'), 0, 0.1, 5.0)); // drawbridge
  return g;
}
export function pyramid(size = 20, color = '#d8bf8a') {
  const m = mesh(new THREE.ConeGeometry(size * 0.75, size * 0.62, 4, 1), flat(color)); m.rotation.y = Math.PI / 4; m.position.y = size * 0.31; m.castShadow = true; return m;
}
export function izba(seed = 0, w = 3, d = 2.6) {
  const g = new THREE.Group(), r = rng(seed + 3), log = new THREE.Color('#7a5638').offsetHSL(0, 0, (r() - 0.5) * 0.08).getStyle();
  for (let i = 0; i < 8; i++) { g.add(at(cyl(0.13, 0.13, w + 0.3, log, 7), 0, 0.13 + i * 0.25, d / 2, 0, 0, Math.PI / 2)); g.add(at(cyl(0.13, 0.13, w + 0.3, log, 7), 0, 0.13 + i * 0.25, -d / 2, 0, 0, Math.PI / 2));
    g.add(at(cyl(0.13, 0.13, d + 0.3, log, 7), w / 2, 0.26 + i * 0.25, 0, Math.PI / 2, 0, 0)); g.add(at(cyl(0.13, 0.13, d + 0.3, log, 7), -w / 2, 0.26 + i * 0.25, 0, Math.PI / 2, 0, 0)); }
  g.add(at(box(w - 0.1, 2, d - 0.1, log), 0, 1.0, 0));
  const roof = new THREE.Shape(); roof.moveTo(-d / 2 - 0.35, 0); roof.lineTo(0, 1.5); roof.lineTo(d / 2 + 0.35, 0); roof.lineTo(-d / 2 - 0.35, 0);
  const rg = new THREE.ExtrudeGeometry(roof, { depth: w + 0.6, bevelEnabled: false }); rg.translate(0, 0, -(w + 0.6) / 2);
  const rm = mesh(rg, flat('#5a4a3a')); rm.rotation.y = Math.PI / 2; rm.position.y = 2.05; g.add(rm);
  g.add(at(box(0.5, 0.5, 0.05, '#e8c46a'), w * 0.2, 1.2, d / 2 + 0.14)); g.add(at(box(0.62, 0.62, 0.04, '#d8c09a'), w * 0.2, 1.2, d / 2 + 0.12));
  return g;
}
export function haystack(s = 1) { const m = mesh(new THREE.ConeGeometry(0.9, 1.6, 10), flat('#c9a75a')); m.position.y = 0.8; const g = new THREE.Group(); g.add(m); g.add(at(mesh(new THREE.SphereGeometry(0.9, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), flat('#c9a75a')), 0, 0, 0)); g.scale.setScalar(s); return g; }
export function onion({ r = 1, color = '#d4af37', drum = '#f0ebe0', h = 3, stripes = null } = {}) {
  const g = new THREE.Group();
  g.add(at(cyl(r * 0.8, r * 0.85, h, drum, 16), 0, h / 2, 0));
  const prof = [[0, 0], [r * 1.0, 0.0], [r * 1.12, r * 0.45], [r * 0.95, r * 0.95], [r * 0.45, r * 1.35], [r * 0.12, r * 1.65], [0.04, r * 1.85], [0, r * 1.9]];
  const geo = new THREE.LatheGeometry(prof.map(([a, b]) => new THREE.Vector2(a, b)), 24);
  let mat = std(color, { metalness: color === '#d4af37' ? 0.6 : 0.1, roughness: 0.35 });
  if (stripes) { const tex = canvasTex(256, 64, (c, W, H) => { for (let i = 0; i < 8; i++) { c.fillStyle = stripes[i % stripes.length]; c.fillRect(i * W / 8, 0, W / 8 + 1, H); } }); tex.wrapS = THREE.RepeatWrapping; mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }); }
  const d = mesh(geo, mat); d.position.y = h; g.add(d);
  g.add(at(box(0.05, r * 0.7, 0.05, '#d4af37'), 0, h + r * 2.2, 0)); g.add(at(box(r * 0.4, 0.05, 0.05, '#d4af37'), 0, h + r * 2.35, 0));
  return g;
}
export function kremlinWall(len = 30, h = 4.5) {
  const g = new THREE.Group(), brick = '#9a3b2c';
  g.add(at(box(len, h, 1.6, brick), 0, h / 2, 0));
  for (let x = -len / 2 + 0.4; x < len / 2; x += 0.9) { const m = new THREE.Shape(); m.moveTo(-0.3, 0); m.lineTo(0.3, 0); m.lineTo(0.3, 0.45); m.lineTo(0.12, 0.3); m.lineTo(0, 0.55); m.lineTo(-0.12, 0.3); m.lineTo(-0.3, 0.45); m.lineTo(-0.3, 0);
    const mg = mesh(new THREE.ExtrudeGeometry(m, { depth: 0.5, bevelEnabled: false }), flat(brick)); mg.position.set(x, h, 0.3); g.add(mg); }
  for (const x of [-len / 2, 0, len / 2]) { g.add(at(box(2.6, h + 3.5, 2.6, brick), x, (h + 3.5) / 2, 0)); const t = mesh(new THREE.ConeGeometry(1.9, 3.2, 4), flat('#2f5a3a')); t.rotation.y = Math.PI / 4; t.position.set(x, h + 3.5 + 1.6, 0); g.add(t); }
  return g;
}
export function townhouseFR(w = 3.2, h = 4.2, color = '#e2d6bf', seed = 0) {
  const g = new THREE.Group();
  g.add(at(box(w, h, 2.6, color), 0, h / 2, 0));
  const roof = new THREE.Shape(); roof.moveTo(-1.35, 0); roof.lineTo(-0.9, 1.3); roof.lineTo(0.9, 1.3); roof.lineTo(1.35, 0);
  const rg = new THREE.ExtrudeGeometry(roof, { depth: w, bevelEnabled: false }); rg.translate(0, 0, -w / 2);
  const rm = mesh(rg, flat('#6f7884')); rm.rotation.y = Math.PI / 2; rm.position.y = h; g.add(rm);
  for (let f = 0; f < 3; f++) for (let i = 0; i < Math.floor(w / 0.9); i++) { const x = -w / 2 + 0.5 + i * 0.9;
    g.add(at(box(0.42, 0.85, 0.05, '#3a3e48'), x, 0.9 + f * 1.2, 1.31)); if (f === 1) g.add(at(box(0.6, 0.06, 0.18, '#2a2a2a'), x, 0.5 + f * 1.2, 1.4)); }
  for (let i = 0; i < Math.floor(w / 1.2); i++) { const dm = box(0.45, 0.5, 0.4, '#e8e2d4'); dm.position.set(-w / 2 + 0.7 + i * 1.2, h + 0.6, 0.9); g.add(dm); }
  return g;
}
export function spanishHouse(w = 3, h = 3.6, color = '#efe6d2', seed = 0) {
  const g = new THREE.Group();
  g.add(at(box(w, h, 2.4, color), 0, h / 2, 0));
  const roof = new THREE.Shape(); roof.moveTo(-1.3, 0); roof.lineTo(0, 0.7); roof.lineTo(1.3, 0);
  const rg = new THREE.ExtrudeGeometry(roof, { depth: w + 0.2, bevelEnabled: false }); rg.translate(0, 0, -(w + 0.2) / 2);
  const rm = mesh(rg, flat('#b5603f')); rm.rotation.y = Math.PI / 2; rm.position.y = h; g.add(rm);
  for (let i = 0; i < Math.floor(w / 1.2); i++) { const x = -w / 2 + 0.7 + i * 1.2;
    g.add(at(box(0.5, 1.0, 0.05, '#3a2a1e'), x, h * 0.66, 1.21)); g.add(at(box(0.8, 0.06, 0.4, '#2a2a2a'), x, h * 0.66 - 0.5, 1.4));
    for (let k = 0; k < 6; k++) g.add(at(box(0.02, 0.4, 0.02, '#2a2a2a'), x - 0.35 + k * 0.14, h * 0.66 - 0.3, 1.58)); }
  g.add(at(box(0.7, 1.3, 0.05, '#4a2f1d'), -w / 4, 0.65, 1.21));
  return g;
}
// Mexican baroque parish church (Dolores Hidalgo) with a bell tower and a hanging bell.
export function dolores() {
  const g = new THREE.Group(), stone = '#c9937a', light = '#e3c2a8';
  g.add(at(box(6, 6.5, 10, stone), 0, 3.25, -5));
  g.add(at(box(6.6, 9, 0.8, stone), 0, 4.5, 0));
  const fs = new THREE.Shape(); fs.moveTo(-3.3, 0); fs.lineTo(3.3, 0); fs.lineTo(3.3, 0.6); fs.quadraticCurveTo(1.6, 0.8, 1.2, 2.2); fs.lineTo(-1.2, 2.2); fs.quadraticCurveTo(-1.6, 0.8, -3.3, 0.6);
  g.add(at(mesh(new THREE.ExtrudeGeometry(fs, { depth: 0.8, bevelEnabled: false }), flat(stone)), 0, 9, -0.4));
  for (const x of [-2.4, -1.2, 1.2, 2.4]) g.add(at(cyl(0.14, 0.16, 6.6, light, 10), x, 3.3, 0.5));
  for (const y of [3.0, 6.3]) g.add(at(box(6.8, 0.25, 0.3, light), 0, y, 0.5));
  const door = new THREE.Shape(); door.moveTo(-0.8, 0); door.lineTo(0.8, 0); door.lineTo(0.8, 2.0); door.absarc(0, 2.0, 0.8, 0, Math.PI, false); door.lineTo(-0.8, 0);
  g.add(at(mesh(new THREE.ShapeGeometry(door), std('#3a2418')), 0, 0, 0.42));
  const win = new THREE.Mesh(new THREE.CircleGeometry(0.5, 20), new THREE.MeshBasicMaterial({ color: '#ffcf7a' })); win.position.set(0, 5.2, 0.42); g.add(win);
  // bell tower on the right
  const T = new THREE.Group(); T.position.set(4.2, 0, -0.6); g.add(T);
  T.add(at(box(2.4, 9.5, 2.4, stone), 0, 4.75, 0));
  T.add(at(box(2.0, 2.6, 2.0, stone), 0, 10.8, 0));
  const arch = new THREE.Shape(); arch.moveTo(-0.6, 0); arch.lineTo(0.6, 0); arch.lineTo(0.6, 1.2); arch.absarc(0, 1.2, 0.6, 0, Math.PI, false); arch.lineTo(-0.6, 0);
  T.add(at(mesh(new THREE.ShapeGeometry(arch), std('#1a1412')), 0, 9.9, 1.01));
  const bell = mesh(new THREE.LatheGeometry([[0, 0.55], [0.18, 0.54], [0.3, 0.4], [0.36, 0.12], [0.46, 0.0], [0.42, -0.02], [0, -0.02]].map(([a, b]) => new THREE.Vector2(a, b)), 20), std('#8a6a2a', { metalness: 0.6, roughness: 0.4, side: THREE.DoubleSide }));
  const bellPivot = new THREE.Group(); bellPivot.position.set(0, 11.2, 0.6); bellPivot.add(bell); bell.position.y = -0.62; T.add(bellPivot); g.bell = bellPivot;
  const dome = mesh(new THREE.SphereGeometry(1.0, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), flat('#e8d6b5')); dome.position.set(0, 12.1, 0); T.add(dome);
  T.add(at(box(0.08, 0.7, 0.08, '#2a2018'), 0, 13.4, 0)); T.add(at(box(0.4, 0.08, 0.08, '#2a2018'), 0, 13.5, 0));
  g.rope = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 10.5, 5), std('#8a7350')); g.rope.position.set(4.2, 5.4, 1.4); g.add(g.rope);
  return g;
}
// Gothic nave (Notre-Dame de Paris): columns, pointed arches, stained glass, rose window, altar.
export function gothicNave({ len = 26, w = 12, h = 13 } = {}) {
  const g = new THREE.Group(), stone = '#cfc4ae', dark = '#a89c86';
  const floorTex = canvasTex(512, 512, (c, W, H) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = (i + j) % 2 ? '#d8cdb6' : '#8f8472'; c.fillRect(i * 64, j * 64, 64, 64); } });
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(w / 2, len / 2);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, len), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.6 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; g.add(fl);
  const carpet = new THREE.Mesh(new THREE.PlaneGeometry(2.2, len * 0.9), std('#8a1f2a')); carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.01, 0); carpet.receiveShadow = true; g.add(carpet);
  const archShape = (sw, sh) => { const s = new THREE.Shape(); s.moveTo(-sw / 2, 0); s.lineTo(-sw / 2, sh); s.quadraticCurveTo(-sw / 2, sh + sw * 0.75, 0, sh + sw * 0.95); s.quadraticCurveTo(sw / 2, sh + sw * 0.75, sw / 2, sh); s.lineTo(sw / 2, 0); return s; };
  const archBand = (ow, iw, lh) => { const s = new THREE.Shape(); s.moveTo(-ow / 2, 0); s.lineTo(-ow / 2, lh); s.quadraticCurveTo(-ow / 2, lh + ow * 0.75, 0, lh + ow * 0.95); s.quadraticCurveTo(ow / 2, lh + ow * 0.75, ow / 2, lh);
    s.lineTo(ow / 2, 0); s.lineTo(iw / 2, 0); s.lineTo(iw / 2, lh); s.quadraticCurveTo(iw / 2, lh + iw * 0.75, 0, lh + iw * 0.95); s.quadraticCurveTo(-iw / 2, lh + iw * 0.75, -iw / 2, lh); s.lineTo(-iw / 2, 0); s.lineTo(-ow / 2, 0); return s; };
  const bays = Math.floor(len / 4);
  for (const sd of [-1, 1]) {
    // wall with stained glass windows
    const wall = mesh(new THREE.BoxGeometry(0.6, h, len), flat(dark)); wall.position.set(sd * (w / 2 + 0.3), h / 2, 0); g.add(wall);
    for (let i = 0; i < bays; i++) {
      const z = -len / 2 + 2 + i * 4;
      g.add(at(cyl(0.38, 0.45, h * 0.62, stone, 12), sd * (w / 2 - 1.1), h * 0.31, z));
      const glass = canvasTex(64, 160, (c, W, H) => { const cols = ['#2a4fa8', '#c0272d', '#e8b84a', '#2f7a4a', '#7a3b9a']; for (let a = 0; a < 6; a++) for (let b = 0; b < 15; b++) { c.fillStyle = cols[(a * 3 + b * 7 + i) % 5]; c.fillRect(a * W / 6, b * H / 15, W / 6 - 1, H / 15 - 1); } });
      const win = new THREE.Mesh(new THREE.ShapeGeometry(archShape(1.6, 3.4)), new THREE.MeshBasicMaterial({ map: glass, color: '#e8e0ff' }));
      const uv = win.geometry.attributes.uv, pp = win.geometry.attributes.position; for (let k = 0; k < uv.count; k++) uv.setXY(k, (pp.getX(k) + 0.8) / 1.6, pp.getY(k) / 4.9);
      win.position.set(sd * (w / 2 - 0.01), h * 0.5, z + 2); win.rotation.y = -sd * Math.PI / 2; g.add(win);
    }
    // arcade arches between columns
    for (let i = 0; i < bays - 1; i++) { const z = -len / 2 + 4 + i * 4;
      const ar = mesh(new THREE.ExtrudeGeometry(archBand(3.9, 3.1, 0.0), { depth: 0.5, bevelEnabled: false }), flat(stone));
      ar.rotation.y = Math.PI / 2; ar.position.set(sd * (w / 2 - 1.35), h * 0.62 - 0.05, z); g.add(ar); }
  }
  // vault ceiling ribs
  for (let i = 0; i < bays; i++) { const z = -len / 2 + 2 + i * 4; const rib = mesh(new THREE.TorusGeometry(w / 2 - 1.1, 0.16, 6, 24, Math.PI), flat(stone)); rib.position.set(0, h * 0.62, z); rib.scale.y = 0.75; g.add(rib); }
  const ceil = mesh(new THREE.PlaneGeometry(w, len), new THREE.MeshStandardMaterial({ color: '#b8ad98', side: THREE.DoubleSide })); ceil.rotation.x = Math.PI / 2; ceil.position.y = h * 0.62 + (w / 2 - 1.1) * 0.75; g.add(ceil);
  // apse wall with rose window
  const apse = mesh(new THREE.BoxGeometry(w, h, 0.6), flat(dark)); apse.position.set(0, h / 2, -len / 2 - 0.3); g.add(apse);
  const rose = canvasTex(512, 512, (c, W) => { const cx = W / 2; c.fillStyle = '#1a1a3a'; c.fillRect(0, 0, W, W);
    for (let ring = 4; ring >= 1; ring--) for (let i = 0; i < 12 * ring; i++) { const a0 = i / (12 * ring) * Math.PI * 2, a1 = (i + 1) / (12 * ring) * Math.PI * 2; c.fillStyle = ['#2a4fa8', '#c0272d', '#e8b84a', '#7a3b9a', '#2f7a4a'][(i + ring) % 5];
      c.beginPath(); c.moveTo(cx, cx); c.arc(cx, cx, ring * W / 8.4, a0, a1); c.closePath(); c.fill(); c.strokeStyle = '#1a1412'; c.lineWidth = 4; c.stroke(); }
    c.fillStyle = '#e8b84a'; c.beginPath(); c.arc(cx, cx, W / 14, 0, Math.PI * 2); c.fill(); });
  const rw = new THREE.Mesh(new THREE.CircleGeometry(2.6, 48), new THREE.MeshBasicMaterial({ map: rose })); rw.position.set(0, h * 0.68, -len / 2 + 0.02); g.add(rw);
  // altar platform, steps, candles
  g.add(at(box(w * 0.7, 0.4, 4, '#cfc4ae'), 0, 0.2, -len / 2 + 2.6)); g.add(at(box(w * 0.7, 0.2, 0.6, '#cfc4ae'), 0, 0.1, -len / 2 + 4.9));
  g.add(at(box(2.6, 1.1, 1.0, '#e8dcc0'), 0, 0.95, -len / 2 + 1.4)); g.add(at(box(2.7, 0.1, 1.1, '#d4af37'), 0, 1.52, -len / 2 + 1.4));
  g.add(at(box(0.08, 1.2, 0.08, '#d4af37'), 0, 2.15, -len / 2 + 1.4)); g.add(at(box(0.6, 0.08, 0.08, '#d4af37'), 0, 2.4, -len / 2 + 1.4));
  g.candles = [];
  for (const x of [-1.0, -0.6, 0.6, 1.0]) { g.add(at(cyl(0.05, 0.06, 0.5, '#f3ead6', 8), x, 1.82, -len / 2 + 1.3)); const fl2 = mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffcf6a' })); fl2.scale.y = 1.8; fl2.position.set(x, 2.13, -len / 2 + 1.3); g.add(fl2); g.candles.push(fl2); }
  // god rays
  for (let i = 0; i < 3; i++) { const ray = new THREE.Mesh(new THREE.PlaneGeometry(1.8, h * 1.2), new THREE.MeshBasicMaterial({ color: '#fff3d6', transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    ray.position.set(w / 2 - 2.2, h * 0.45, -len / 2 + 6 + i * 6); ray.rotation.set(0, 0, 0.5); g.add(ray); }
  return g;
}
export function throne({ fabric = '#1f3f8f', gold = '#d4af37', h = 2.2 } = {}) {
  const g = new THREE.Group(), gm = std(gold, { metalness: 0.7, roughness: 0.3 });
  g.add(at(mesh(new THREE.BoxGeometry(1.0, 0.12, 0.9), std(fabric)), 0, 0.55, 0));
  for (const [x, z] of [[-0.42, -0.36], [0.42, -0.36], [-0.42, 0.36], [0.42, 0.36]]) g.add(at(mesh(new THREE.BoxGeometry(0.1, 0.55, 0.1), gm), x, 0.27, z));
  const back = new THREE.Shape(); back.moveTo(-0.55, 0); back.lineTo(0.55, 0); back.lineTo(0.55, h * 0.6); back.quadraticCurveTo(0.55, h * 0.75, 0, h * 0.8); back.quadraticCurveTo(-0.55, h * 0.75, -0.55, h * 0.6);
  const bm = mesh(new THREE.ExtrudeGeometry(back, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.04, bevelSegments: 2 }), gm); bm.position.set(0, 0.55, -0.48); g.add(bm);
  const pad = new THREE.Shape(); pad.moveTo(-0.42, 0.1); pad.lineTo(0.42, 0.1); pad.lineTo(0.42, h * 0.55); pad.quadraticCurveTo(0.42, h * 0.68, 0, h * 0.72); pad.quadraticCurveTo(-0.42, h * 0.68, -0.42, h * 0.55);
  const pm = mesh(new THREE.ShapeGeometry(pad), std(fabric)); pm.position.set(0, 0.55, -0.31); g.add(pm);
  for (const x of [-0.5, 0.5]) { g.add(at(mesh(new THREE.BoxGeometry(0.1, 0.1, 0.8), gm), x, 0.95, 0)); g.add(at(mesh(new THREE.SphereGeometry(0.08, 10, 8), gm), x, 0.95, 0.42)); }
  g.add(at(mesh(new THREE.SphereGeometry(0.1, 10, 8), gm), 0, 0.55 + h * 0.8 + 0.04, -0.41));
  return g;
}
export function cushion(color = '#8a1f2a') {
  const g = new THREE.Group(); const c = mesh(new THREE.BoxGeometry(0.6, 0.12, 0.6, 4, 1, 4), std(color)); const p = c.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = p.getY(i); p.setY(i, y * (1 - 0.6 * (x * x + z * z) / 0.18)); } c.geometry.computeVertexNormals(); g.add(c);
  for (const [x, z] of [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]]) g.add(at(mesh(new THREE.SphereGeometry(0.03, 6, 4), std('#d4af37', { metalness: 0.6 })), x, 0, z));
  return g;
}
export function pedestalTable(color = '#5a3a24', top = '#2f5a3a', w = 2.4, d = 1.4) {
  const g = new THREE.Group();
  g.add(at(box(w, 0.08, d, color), 0, 0.78, 0)); g.add(at(box(w + 0.04, 0.02, d + 0.04, top), 0, 0.83, 0));
  for (const [x, z] of [[-w / 2 + 0.1, -d / 2 + 0.1], [w / 2 - 0.1, -d / 2 + 0.1], [-w / 2 + 0.1, d / 2 - 0.1], [w / 2 - 0.1, d / 2 - 0.1]]) g.add(at(box(0.08, 0.78, 0.08, color), x, 0.39, z));
  return g;
}
export function chandelier(color = '#d4af37') {
  const g = new THREE.Group(), gm = std(color, { metalness: 0.7, roughness: 0.3 });
  g.add(at(cyl(0.02, 0.02, 1.2, color, 6), 0, 0.6, 0));
  const ring = mesh(new THREE.TorusGeometry(0.55, 0.03, 6, 24), gm); ring.rotation.x = Math.PI / 2; g.add(ring);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const fl = mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff0c8' })); fl.position.set(Math.cos(a) * 0.55, 0.12, Math.sin(a) * 0.55); g.add(fl); }
  const l = new THREE.PointLight('#ffd9a0', 5, 12, 1.5); l.position.y = 0.1; g.add(l);
  return g;
}
export function book({ title = 'CODE CIVIL', sub = 'DES FRANÇAIS', year = '1804', w = 1.2, d = 0.85 } = {}) {
  const g = new THREE.Group();
  const page = canvasTex(512, 720, (c, W, H) => { c.fillStyle = '#f3ead6'; c.fillRect(0, 0, W, H); c.fillStyle = '#2a2116'; c.textAlign = 'center';
    c.font = '800 54px Georgia'; c.fillText(title, W / 2, 200); c.font = '700 40px Georgia'; c.fillText(sub, W / 2, 260); c.font = 'italic 600 34px Georgia'; c.fillText(year, W / 2, 340);
    c.fillStyle = '#b9ad93'; for (let i = 0; i < 9; i++) c.fillRect(70, 410 + i * 30, W - 140, 9); });
  const text = canvasTex(512, 720, (c, W, H) => { c.fillStyle = '#f3ead6'; c.fillRect(0, 0, W, H); c.fillStyle = '#2a2116'; c.font = '800 34px Georgia'; c.fillText('Art. 8', 60, 110);
    c.font = 'italic 600 26px Georgia'; c.fillText('Tout Français jouira', 60, 160); c.fillText('des droits civils.', 60, 196); c.fillStyle = '#b9ad93'; for (let i = 0; i < 14; i++) c.fillRect(60, 250 + i * 30, W - 120, 9); });
  g.add(at(box(w * 1.12, 0.06, d * 1.06, '#2a3f6f'), 0, 0.03, 0));
  for (const [sd, tex] of [[-1, page], [1, text]]) { const p = new THREE.Mesh(new THREE.BoxGeometry(w * 0.52, 0.05, d), [std('#efe6d0'), std('#efe6d0'), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }), std('#efe6d0'), std('#efe6d0'), std('#efe6d0')]);
    p.position.set(sd * w * 0.27, 0.085, 0); p.rotation.z = -sd * 0.05; g.add(p); }
  return g;
}
// Gun with a bronze barrel on an olive-green carriage (French Gribeauval system).
export function fieldGun({ barrel = '#a8783a', carriage = '#4f5a34' } = {}) {
  const g = new THREE.Group();
  const b = mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.25, 12), std(barrel, { metalness: 0.65, roughness: 0.35 })); b.rotation.x = Math.PI / 2 - 0.1; b.position.set(0, 0.52, 0.22); g.add(b);
  g.add(at(mesh(new THREE.SphereGeometry(0.06, 8, 6), std(barrel, { metalness: 0.65, roughness: 0.35 })), 0, 0.58, -0.4));
  for (const s of [-1, 1]) { g.add(at(box(0.06, 0.18, 1.2, carriage), s * 0.12, 0.38, -0.25, -0.22, 0, 0));
    const w = mesh(new THREE.TorusGeometry(0.33, 0.035, 6, 18), std('#5a3a24')); w.rotation.y = Math.PI / 2; w.position.set(s * 0.3, 0.34, 0); g.add(w);
    for (let k = 0; k < 6; k++) { const sp = box(0.025, 0.62, 0.025, '#5a3a24'); sp.rotation.x = k / 6 * Math.PI; sp.position.set(s * 0.3, 0.34, 0); g.add(sp); }
    g.add(at(cyl(0.06, 0.06, 0.08, '#3a2a1e', 8), s * 0.3, 0.34, 0, 0, 0, Math.PI / 2)); }
  g.add(at(box(0.66, 0.06, 0.06, '#3a2a1e'), 0, 0.34, 0));
  g.muzzle = new THREE.Object3D(); g.muzzle.position.set(0, 0.58, 0.86); g.add(g.muzzle);
  return g;
}
export function gabion(s = 1) { const g = new THREE.Group(); const m = mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.7, 12, 3, true), std('#8a6a3a', { side: THREE.DoubleSide })); m.position.y = 0.35; g.add(m); g.add(at(mesh(new THREE.CircleGeometry(0.31, 12), std('#7a5a2a')), 0, 0.68, 0, -Math.PI / 2, 0, 0)); g.scale.setScalar(s); return g; }
export function wagon(cover = '#e6dcc4') {
  const g = new THREE.Group();
  g.add(at(box(1.2, 0.3, 2.4, '#6b4a2f'), 0, 0.6, 0));
  const cv = mesh(new THREE.CylinderGeometry(0.62, 0.62, 2.3, 16, 1, true, -Math.PI / 2, Math.PI), std(cover, { side: THREE.DoubleSide })); cv.rotation.x = Math.PI / 2; cv.position.y = 0.78; g.add(cv);
  for (const [x, z] of [[-0.62, -0.8], [0.62, -0.8], [-0.62, 0.8], [0.62, 0.8]]) { const w = mesh(new THREE.TorusGeometry(0.36, 0.04, 6, 18), std('#4a3220')); w.rotation.y = Math.PI / 2; w.position.set(x, 0.38, z); g.add(w);
    for (let k = 0; k < 6; k++) { const sp = box(0.025, 0.68, 0.025, '#4a3220'); sp.rotation.x = k / 6 * Math.PI; sp.position.set(x, 0.38, z); g.add(sp); } }
  return g;
}
export function cross(seed = 0) { const g = new THREE.Group(), r = rng(seed); g.add(at(box(0.08, 0.8, 0.06, '#6b4a2f'), 0, 0.4, 0)); g.add(at(box(0.44, 0.07, 0.06, '#6b4a2f'), 0, 0.58, 0)); g.rotation.z = (r() - 0.5) * 0.12; return g; }
