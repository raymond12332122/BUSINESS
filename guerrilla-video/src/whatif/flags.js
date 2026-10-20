// Simplified national flags drawn on canvases (3:2 unless the flag's own ratio matters for recognition).
import * as THREE from 'three';

const star = (x, cx, cy, r, n = 5, inner = 0.4, rot = -Math.PI / 2) => {
  x.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr = i % 2 ? r * inner : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  x.closePath(); x.fill();
};
const vtri = (x, W, H, cols) => cols.forEach((c, i) => { x.fillStyle = c; x.fillRect(i * W / 3, 0, W / 3 + 1, H); });
const htri = (x, W, H, cols, w = cols.map(() => 1)) => { const s = w.reduce((a, b) => a + b, 0); let y = 0; cols.forEach((c, i) => { x.fillStyle = c; x.fillRect(0, y, W, H * w[i] / s + 1); y += H * w[i] / s; }); };
// Small emblems are suggested, not reproduced: a coloured device in the right place reads as the flag at video size.
const DRAW = {
  mx: (x, W, H) => { vtri(x, W, H, ['#006847', '#ffffff', '#ce1126']); x.fillStyle = '#8a5a2a'; x.beginPath(); x.ellipse(W / 2, H / 2, H * 0.13, H * 0.16, 0, 0, 7); x.fill();
    x.fillStyle = '#5a7a3a'; x.beginPath(); x.ellipse(W / 2, H * 0.64, H * 0.17, H * 0.05, 0, 0, 7); x.fill(); x.fillStyle = '#6a3a1a'; x.beginPath(); x.ellipse(W / 2 + H * 0.02, H * 0.44, H * 0.06, H * 0.05, 0, 0, 7); x.fill(); },
  us: (x, W, H) => { for (let i = 0; i < 13; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#b22234'; x.fillRect(0, i * H / 13, W, H / 13 + 1); }
    x.fillStyle = '#3c3b6e'; x.fillRect(0, 0, W * 0.4, H * 7 / 13); x.fillStyle = '#ffffff';
    for (let r = 0; r < 9; r++) for (let c = 0; c < (r % 2 ? 5 : 6); c++) star(x, W * 0.4 * ((c + (r % 2 ? 1 : 0.5)) / 6), H * 7 / 13 * ((r + 0.7) / 9.4), H * 0.025); },
  ca: (x, W, H) => { x.fillStyle = '#d52b1e'; x.fillRect(0, 0, W, H); x.fillStyle = '#ffffff'; x.fillRect(W / 4, 0, W / 2, H); x.fillStyle = '#d52b1e';
    const cx = W / 2, cy = H / 2, s = H * 0.36; x.beginPath();
    const pts = [[0, -1], [0.12, -0.72], [0.3, -0.8], [0.25, -0.38], [0.6, -0.62], [0.55, -0.48], [0.82, -0.52], [0.72, -0.28], [0.85, -0.18], [0.45, 0.12], [0.5, 0.3], [0.06, 0.22], [0.06, 0.62], [-0.06, 0.62], [-0.06, 0.22], [-0.5, 0.3], [-0.45, 0.12], [-0.85, -0.18], [-0.72, -0.28], [-0.82, -0.52], [-0.55, -0.48], [-0.6, -0.62], [-0.25, -0.38], [-0.3, -0.8], [-0.12, -0.72]];
    pts.forEach(([a, b], i) => i ? x.lineTo(cx + a * s, cy + b * s) : x.moveTo(cx + a * s, cy + b * s)); x.closePath(); x.fill(); },
  jp: (x, W, H) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H); x.fillStyle = '#bc002d'; x.beginPath(); x.arc(W / 2, H / 2, H * 0.3, 0, 7); x.fill(); },
  de: (x, W, H) => htri(x, W, H, ['#000000', '#dd0000', '#ffce00']),
  fr: (x, W, H) => vtri(x, W, H, ['#0055a4', '#ffffff', '#ef4135']),
  it: (x, W, H) => vtri(x, W, H, ['#009246', '#ffffff', '#ce2b37']),
  sm: (x, W, H) => { htri(x, W, H, ['#ffffff', '#5eb6e4']); x.fillStyle = '#d4af37'; x.beginPath(); x.ellipse(W / 2, H / 2, H * 0.12, H * 0.15, 0, 0, 7); x.fill(); x.fillStyle = '#5eb6e4'; x.fillRect(W / 2 - H * 0.07, H * 0.45, H * 0.14, H * 0.1); },
  au: (x, W, H) => { x.fillStyle = '#00008b'; x.fillRect(0, 0, W, H); x.save(); x.beginPath(); x.rect(0, 0, W / 2, H / 2); x.clip();
    x.strokeStyle = '#ffffff'; x.lineWidth = H * 0.1; x.beginPath(); x.moveTo(0, 0); x.lineTo(W / 2, H / 2); x.moveTo(W / 2, 0); x.lineTo(0, H / 2); x.stroke();
    x.strokeStyle = '#c8102e'; x.lineWidth = H * 0.035; x.stroke(); x.fillStyle = '#ffffff'; x.fillRect(W / 4 - H * 0.05, 0, H * 0.1, H / 2); x.fillRect(0, H / 4 - H * 0.05, W / 2, H * 0.1);
    x.fillStyle = '#c8102e'; x.fillRect(W / 4 - H * 0.03, 0, H * 0.06, H / 2); x.fillRect(0, H / 4 - H * 0.03, W / 2, H * 0.06); x.restore();
    x.fillStyle = '#ffffff'; star(x, W / 4, H * 0.75, H * 0.1, 7, 0.45); [[0.75, 0.8], [0.62, 0.45], [0.75, 0.18], [0.87, 0.38], [0.81, 0.55]].forEach(([a, b], i) => star(x, W * a, H * b, H * (i === 4 ? 0.03 : 0.055), i === 4 ? 5 : 7, 0.45)); },
  kr: (x, W, H) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H); const r = H * 0.25, cx = W / 2, cy = H / 2;
    x.fillStyle = '#cd2e3a'; x.beginPath(); x.arc(cx, cy, r, Math.PI, 0); x.fill(); x.fillStyle = '#0047a0'; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI); x.fill();
    x.fillStyle = '#cd2e3a'; x.beginPath(); x.arc(cx - r / 2, cy, r / 2, 0, 7); x.fill(); x.fillStyle = '#0047a0'; x.beginPath(); x.arc(cx + r / 2, cy, r / 2, 0, 7); x.fill();
    x.fillStyle = '#000000'; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => { x.save(); x.translate(cx + sx * W * 0.3, cy + sy * H * 0.28); x.rotate(sx * sy * 0.98); for (let i = 0; i < 3; i++) x.fillRect(-H * 0.1, -H * 0.07 + i * H * 0.05, H * 0.2, H * 0.03); x.restore(); }); },
  co: (x, W, H) => htri(x, W, H, ['#fcd116', '#003893', '#ce1126'], [2, 1, 1]),
  br: (x, W, H) => { x.fillStyle = '#009c3b'; x.fillRect(0, 0, W, H); x.fillStyle = '#ffdf00'; x.beginPath(); x.moveTo(W * 0.08, H / 2); x.lineTo(W / 2, H * 0.1); x.lineTo(W * 0.92, H / 2); x.lineTo(W / 2, H * 0.9); x.fill();
    x.fillStyle = '#002776'; x.beginPath(); x.arc(W / 2, H / 2, H * 0.22, 0, 7); x.fill(); x.strokeStyle = '#ffffff'; x.lineWidth = H * 0.03; x.beginPath(); x.arc(W / 2 + H * 0.1, H * 0.85, H * 0.42, -2.4, -1.35); x.stroke(); },
  ar: (x, W, H) => { htri(x, W, H, ['#74acdf', '#ffffff', '#74acdf']); x.fillStyle = '#f6b40e'; x.beginPath(); x.arc(W / 2, H / 2, H * 0.08, 0, 7); x.fill(); x.strokeStyle = '#f6b40e'; x.lineWidth = 2; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; x.beginPath(); x.moveTo(W / 2 + Math.cos(a) * H * 0.09, H / 2 + Math.sin(a) * H * 0.09); x.lineTo(W / 2 + Math.cos(a) * H * 0.14, H / 2 + Math.sin(a) * H * 0.14); x.stroke(); } },
  ch: (x, W, H) => { x.fillStyle = '#da291c'; x.fillRect(0, 0, W, H); x.fillStyle = '#ffffff'; const s = H * 0.12; x.fillRect(W / 2 - s / 2, H / 2 - s * 1.6, s, s * 3.2); x.fillRect(W / 2 - s * 1.6, H / 2 - s / 2, s * 3.2, s); },
  mc: (x, W, H) => htri(x, W, H, ['#ce1126', '#ffffff']),
  un: (x, W, H) => { x.fillStyle = '#5b92e5'; x.fillRect(0, 0, W, H); x.strokeStyle = '#ffffff'; x.lineWidth = H * 0.02; for (const r of [0.08, 0.16, 0.24]) { x.beginPath(); x.arc(W / 2, H * 0.47, H * r, 0, 7); x.stroke(); }
    x.beginPath(); x.moveTo(W / 2 - H * 0.24, H * 0.47); x.lineTo(W / 2 + H * 0.24, H * 0.47); x.moveTo(W / 2, H * 0.23); x.lineTo(W / 2, H * 0.71); x.stroke(); },
};
export const FLAG_CODES = Object.keys(DRAW);
const cache = new Map();
export function flagTex(code, w = 300, h = 200) {
  const k = `${code}|${w}x${h}`; if (cache.has(k)) return cache.get(k);
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  (DRAW[code] || DRAW.un)(x, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; cache.set(k, t); return t;
}
// CSS for an overlay chip: the flag as a data URL.
const urls = new Map();
export function flagURL(code) {
  if (urls.has(code)) return urls.get(code);
  const c = document.createElement('canvas'); c.width = 150; c.height = 100; (DRAW[code] || DRAW.un)(c.getContext('2d'), 150, 100);
  const u = c.toDataURL(); urls.set(code, u); return u;
}
// A waving flag on a pole: returns a group with .wave(t). Cloth is a subdivided plane bent with travelling sines.
export function flagPole(code, { h = 3.2, w = 1.5, pole = '#d8d8d8', gold = true } = {}) {
  const g = new THREE.Group();
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, h, 10), new THREE.MeshStandardMaterial({ color: pole, metalness: 0.5, roughness: 0.4 })); p.position.y = h / 2; p.castShadow = true; g.add(p);
  if (gold) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), new THREE.MeshStandardMaterial({ color: '#d4af37', metalness: 0.7, roughness: 0.3 })); b.position.y = h + 0.04; g.add(b); }
  const fh = w * 2 / 3, geo = new THREE.PlaneGeometry(w, fh, 24, 8); geo.translate(w / 2, 0, 0);
  const cloth = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: flagTex(code), side: THREE.DoubleSide, roughness: 0.85 }));
  cloth.position.set(0.03, h - fh / 2 - 0.05, 0); cloth.castShadow = true; g.add(cloth);
  const base = geo.attributes.position.array.slice();
  g.wave = (t, k = 1) => { const a = geo.attributes.position.array;
    for (let i = 0; i < a.length; i += 3) { const x = base[i], y = base[i + 1], u = x / w; a[i + 2] = k * u * (0.09 * Math.sin(x * 4.2 - t * 6.5) + 0.04 * Math.sin(x * 7.1 + y * 2.0 - t * 9.3)); a[i + 1] = y - k * u * u * 0.06; }
    geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); };
  g.wave(0); g.cloth = cloth; return g;
}
