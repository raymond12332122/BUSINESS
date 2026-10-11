// Map-board helpers for the Napoleonic video: Europe set, Americas set, tokens, labels, Minard band.
import * as THREE from 'three';
import * as GM from './geomap.js';
import * as K from './kit.js';
import { stage } from '../lib/stage.js';
import { label } from '../lib/kit.js';
import { ss, clamp } from '../lib/util.js';
import * as F from '../lib/fx.js';
import { puffTex } from '../mx/props.js';

let AMER = null;
export async function preload() { await GM.preload(); if (!AMER) AMER = await (await fetch('/src/napo/americas.json')).json(); }
export function mapSet({ per = '1805', rivers = true } = {}) {
  const s = stage({ groundA: null, skyTop: '#4a6fa8', skyHor: '#d7e4ea', fog: ['#d7e4ea', 70, 210], sunPos: [10, 40, 18], sun: 2.1, hemi: 1.35, shadow: 45 });
  const map = GM.buildMap({ rivers }); s.add(map.group); s.map = map; GM.setPeriod(map, per);
  return s;
}
export const fade = (t, a, b, f = 0.35) => ss(a, a + f, t) * (1 - ss(b - f, b, t));
export function city(ctx, s, name, k = 1, cls = 'c') {
  const d = s.map.dots[name]; if (d) d.visible = k > 0.01;
  const [lo, la] = GM.CITY[name];
  return label(ctx, GM.pos(lo, la, GM.H + 0.4), name, cls, k);
}
export function stateLabel(ctx, s, pol, k = 1, text = null) {
  const p = GM.labelPos(pol, s.map.per); if (!p) return '';
  return label(ctx, p, text || GM.NAMES[pol], 'st', k);
}
// Character standing on a round faction-coloured base.
export function token(s, who, outfit, lon, lat, color, yaw = 0, scale = 1.6) {
  const g = new THREE.Group(); s.add(g);
  g.add(GM.tokenBase(color));
  const r = K.person(g, who, outfit, 0, 0, yaw); r.root.position.y = 0.12;
  g.scale.setScalar(scale); g.r = r;
  g.setPos = (lo, la) => { const [x, y, z] = GM.pos(lo, la); g.position.set(x, y, z); };
  g.setPos(lon, lat); r.token = g; return r;
}
// Crossed sabres on a red disc (battle icon), drawn once.
let SWORDS = null;
function swordsTex() {
  if (SWORDS) return SWORDS;
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#fbf5e6'; g.beginPath(); g.arc(128, 128, 120, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#b8322a'; g.beginPath(); g.arc(128, 128, 104, 0, Math.PI * 2); g.fill();
  for (const sd of [-1, 1]) { g.save(); g.translate(128, 128); g.rotate(sd * Math.PI / 4);
    g.fillStyle = '#fbf5e6'; g.beginPath(); g.moveTo(-7, 52); g.lineTo(-7, -58); g.quadraticCurveTo(0, -78, 7, -62); g.lineTo(7, 52); g.fill();
    g.fillRect(-24, 50, 48, 10); g.fillStyle = '#e8c46a'; g.fillRect(-6, 60, 12, 26); g.beginPath(); g.arc(0, 90, 9, 0, Math.PI * 2); g.fill(); g.restore(); }
  SWORDS = new THREE.CanvasTexture(c); SWORDS.colorSpace = THREE.SRGBColorSpace; return SWORDS;
}
// Pulsing event marker (battle) with an icon sprite.
export function marker(s, lon, lat, icon = 'swords', color = '#c0272d', size = 1.25) {
  const g = new THREE.Group(); const [x, y, z] = GM.pos(lon, lat); g.position.set(x, y + 0.02, z); s.add(g);
  const ring = F.ring(color, 0.56 * size); g.add(ring);
  const ic = icon === 'swords' ? new THREE.Sprite(new THREE.SpriteMaterial({ map: swordsTex(), transparent: true, depthWrite: false })) : F.bubble(icon, { bg: null, font: 170 });
  ic.center.set(0.5, 0.0); ic.renderOrder = 8; g.add(ic);
  g.update = (t, t0, t1 = 1e9) => { const k = t - t0; g.visible = k > 0 && t < t1; if (!g.visible) return;
    const rk = (k % 1.4) / 1.4; ring.scale.setScalar(0.6 + rk * 2.2); ring.material.opacity = 0.8 * (1 - rk);
    const pop = clamp(k / 0.25), sc = size * (pop < 1 ? 1.25 * Math.sin(pop * Math.PI * 0.62) / Math.sin(Math.PI * 0.62) : 1) * (1 - ss(t1 - 0.25, t1, t)); ic.scale.set(sc, sc, 1); ic.position.y = 0.15; };
  g.visible = false; return g;
}
// Minard band: a ribbon whose width follows the army size along a path of [lon, lat, men].
export function minard(path, color, maxW = 2.2, maxMen = 600000, y = GM.H + 0.06) {
  const pts = path.map(([lo, la]) => { const [x, z] = GM.proj(lo, la); return new THREE.Vector3(x, y, z); });
  const N = pts.length; const pos = [], idx = [];
  for (let i = 0; i < N; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N - 1, i + 1)], d = new THREE.Vector3().subVectors(b, a).normalize();
    const n = new THREE.Vector3(-d.z, 0, d.x), w = Math.max(0.05, maxW * path[i][2] / maxMen) / 2;
    pos.push(pts[i].x + n.x * w, y, pts[i].z + n.z * w, pts[i].x - n.x * w, y, pts[i].z - n.z * w);
    if (i < N - 1) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.92, depthWrite: false })); m.renderOrder = 6;
  m.set = p => { m.visible = p > 0.001; g.setDrawRange(0, Math.floor(clamp(p) * (N - 1)) * 6); };
  m.set(0); return m;
}
// Little ship of the line for the map (about 1 unit long, bow towards +z), with billowing sails and a coloured ensign.
export function shipToken(color = '#c0272d', hullCol = '#3a2a20', band = '#e0b84a') {
  const g = new THREE.Group();
  const out = new THREE.Shape(); out.moveTo(0, 0.55); out.quadraticCurveTo(0.17, 0.3, 0.16, -0.05); out.lineTo(0.13, -0.42); out.lineTo(-0.13, -0.42); out.lineTo(-0.16, -0.05); out.quadraticCurveTo(-0.17, 0.3, 0, 0.55);
  const hg = new THREE.ExtrudeGeometry(out, { depth: 0.14, bevelEnabled: false }); hg.rotateX(-Math.PI / 2);
  const hull = new THREE.Mesh(hg, new THREE.MeshStandardMaterial({ color: hullCol, roughness: 0.7 })); g.add(hull);
  const bg = new THREE.ExtrudeGeometry(out, { depth: 0.035, bevelEnabled: false }); bg.rotateX(-Math.PI / 2);
  const bandM = new THREE.Mesh(bg, new THREE.MeshStandardMaterial({ color: band, roughness: 0.6 })); bandM.scale.set(1.04, 1, 1.01); bandM.position.y = 0.07; g.add(bandM);
  const sailMat = new THREE.MeshStandardMaterial({ color: '#f6f2e6', roughness: 0.9, side: THREE.DoubleSide });
  const mastMat = new THREE.MeshStandardMaterial({ color: '#4a3220' });
  for (const [z, h, w] of [[0.22, 0.62, 0.36], [-0.02, 0.74, 0.42], [-0.25, 0.54, 0.3]]) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, h, 5), mastMat); m.position.set(0, 0.14 + h / 2, z); g.add(m);
    const sg = new THREE.PlaneGeometry(w, h * 0.62, 6, 3), sp = sg.attributes.position;
    for (let i = 0; i < sp.count; i++) { const x = sp.getX(i) / w; sp.setZ(i, 0.09 * (1 - 4 * x * x)); }
    sg.computeVertexNormals(); const sm = new THREE.Mesh(sg, sailMat); sm.position.set(0, 0.14 + h * 0.55, z + 0.02); g.add(sm);
  }
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.1), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })); fl.rotation.y = Math.PI / 2; fl.position.set(0, 0.32, -0.48); g.add(fl);
  const pen = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.04), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })); pen.rotation.y = Math.PI / 2; pen.position.set(0, 0.9, -0.1); g.add(pen);
  return g;
}

// ------------------------------------------------------------ the Atlantic world in 1810
const D2R = Math.PI / 180, ALON0 = -55 * D2R, ALAT0 = 8 * D2R, AR = 57.2958 * 0.55;
export function aproj(lon, lat) {
  const l = lon * D2R - ALON0, p = lat * D2R;
  const k = Math.sqrt(2 / (1 + Math.sin(ALAT0) * Math.sin(p) + Math.cos(ALAT0) * Math.cos(p) * Math.cos(l)));
  return [AR * k * Math.cos(p) * Math.sin(l), -AR * k * (Math.cos(ALAT0) * Math.sin(p) - Math.sin(ALAT0) * Math.cos(p) * Math.cos(l))];
}
export const ACOLOR = { ESP_COL: '#e6a560', ESP: '#e6a560', POR_COL: '#b8cf80', POR: '#b8cf80', USA: '#9fb7d8', GBR_COL: '#c8695b', GBR: '#c8695b', FRA: '#5b7bc4', HAI: '#c6b4d8', NED_COL: '#e8a066', OTH: '#ddd4c0' };
export const ACITY = { 'Ciudad de México': [-99.13, 19.43], 'Dolores': [-100.93, 21.16], 'Caracas': [-66.9, 10.5], 'Bogotá': [-74.07, 4.71], 'Quito': [-78.47, -0.18], 'Lima': [-77.04, -12.05],
  'Santiago': [-70.65, -33.45], 'Buenos Aires': [-58.38, -34.6], 'La Paz': [-68.15, -16.5], 'La Habana': [-82.38, 23.13], 'Madrid': [-3.7, 40.42], 'Cádiz': [-6.29, 36.53] };
export const apos = (lon, lat, y = 0.12) => { const [x, z] = aproj(lon, lat); return [x, y, z]; };
export function americasSet() {
  const s = stage({ groundA: null, skyTop: '#4a6fa8', skyHor: '#d7e4ea', fog: ['#d7e4ea', 70, 200], sunPos: [10, 40, 18], sun: 2.1, hemi: 1.35, shadow: 45 });
  const g = new THREE.Group(); s.add(g);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(240, 200), new THREE.MeshStandardMaterial({ color: '#8db6cd', roughness: 0.6 })); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.02; g.add(sea);
  s.owners = {};
  for (const grp of AMER.groups) {
    const shapes = grp.polys.map(poly => { const sh = new THREE.Shape(poly[0].map(([lo, la]) => new THREE.Vector2(...aproj(lo, la))));
      for (const h of poly.slice(1)) sh.holes.push(new THREE.Path(h.map(([lo, la]) => new THREE.Vector2(...aproj(lo, la))))); return sh; });
    const geo = new THREE.ExtrudeGeometry(shapes, { depth: 0.12, bevelEnabled: false }); geo.rotateX(Math.PI / 2); geo.translate(0, 0.12, 0);
    const mat = new THREE.MeshStandardMaterial({ color: ACOLOR[grp.owner] || ACOLOR.OTH, roughness: 0.92, side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; g.add(m); s.owners[grp.owner] = { mesh: m, mat, base: ACOLOR[grp.owner] || ACOLOR.OTH };
    for (const poly of grp.polys) for (const ring of poly) {
      const pts = [...ring, ring[0]].map(([lo, la]) => aproj(lo, la)); const pos = [];
      for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1], dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz) || 1, nx = -dz / l * 0.035, nz = dx / l * 0.035;
        pos.push(ax + nx, 0.125, az + nz, ax - nx, 0.125, az - nz, bx + nx, 0.125, bz + nz, ax - nx, 0.125, az - nz, bx - nx, 0.125, bz - nz, bx + nx, 0.125, bz + nz); }
      const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      const lm = new THREE.Mesh(lg, new THREE.MeshBasicMaterial({ color: '#3d5a6e', side: THREE.DoubleSide, depthWrite: false })); lm.renderOrder = 2; g.add(lm);
    }
  }
  s.dots = {};
  for (const [n, [lo, la]] of Object.entries(ACITY)) { const d = new THREE.Group(); const [x, y, z] = apos(lo, la);
    d.add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16), new THREE.MeshBasicMaterial({ color: '#f7f1e3' }))); d.add(new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.06, 16), new THREE.MeshBasicMaterial({ color: '#2b2622' })));
    d.position.set(x, y + 0.02, z); d.visible = false; s.add(d); s.dots[n] = d; }
  return s;
}
export function acity(ctx, s, name, k = 1, cls = 'c') { const d = s.dots[name]; if (d) d.visible = k > 0.01; const [lo, la] = ACITY[name]; return label(ctx, apos(lo, la, 0.45), name, cls, k); }
// Revolt spark on the Americas map.
export function aspark(s, lon, lat, color = '#e8742a') {
  const g = new THREE.Group(); const [x, y, z] = apos(lon, lat); g.position.set(x, y + 0.02, z); s.add(g);
  const ring = F.ring(color, 0.45); g.add(ring);
  const fire = F.bubble('🔥', { bg: null, font: 170 }); fire.center.set(0.5, 0.15); g.add(fire);
  g.update = (t, t0) => { const k = t - t0; g.visible = k > 0; if (k <= 0) return; const rk = (k % 1.4) / 1.4; ring.scale.setScalar(0.5 + rk * 2.2); ring.material.opacity = 0.8 * (1 - rk);
    const sc = 0.9 * clamp(k / 0.25) * (1 + 0.06 * Math.sin(t * 9 + x)); fire.scale.set(sc, sc, 1); };
  g.visible = false; return g;
}
export { GM };
