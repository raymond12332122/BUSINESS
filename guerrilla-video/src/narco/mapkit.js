// Maps for the corruption & cartels video: Mexico (states, reusing the Revolution map) restyled for today,
// and a present-day map of the Americas (Colombia -> Central America -> Mexico -> USA) for drug routes.
import * as THREE from 'three';
import * as GM from '../mx/geomap.js';
import { stage } from '../lib/stage.js';
import { label } from '../lib/kit.js';
import { ss, clamp } from '../lib/util.js';
import * as F from '../lib/fx.js';

// extra present-day places (added before the map is built so they get dots)
Object.assign(GM.CITY, {
  'Culiacán': [-107.39, 24.80], 'Tijuana': [-117.04, 32.53], 'Uruapan': [-102.06, 19.42], 'Iguala': [-99.54, 18.35], 'Tapalpa': [-103.76, 19.95],
  'Manzanillo': [-104.32, 19.05], 'Lázaro Cárdenas': [-102.2, 17.96], 'Reynosa': [-98.3, 26.08], 'Matamoros': [-97.5, 25.87], 'Morelia': [-101.19, 19.70],
  'Chilpancingo': [-99.5, 17.55], 'Acapulco': [-99.88, 16.85], 'Cancún': [-86.85, 21.16], 'San Diego': [-117.16, 32.72], 'El Paso': [-106.44, 31.76],
  'Phoenix': [-112.07, 33.45], 'Houston': [-95.37, 29.76], 'Badiraguato': [-107.55, 25.36],
});
export { GM };
export async function preload() { await GM.preload(); if (!AM) AM = await (await fetch('/src/narco/americas.json')).json(); }

export const LAND = { MEX: '#efe7d6', USA: '#d3d7de', OTHER: '#dcd6c8' };
export function mexMap({ light = 'day' } = {}) {
  const night = light === 'night';
  const s = stage({ groundA: null, skyTop: night ? '#0b1020' : '#4a6fa8', skyHor: night ? '#1d2840' : '#cfe0ea', fog: night ? ['#1d2840', 70, 220] : ['#cfe0ea', 70, 220],
    sunPos: [6, 18, 10], sun: night ? 1.1 : 2.3, hemi: night ? 0.7 : 1.3, shadow: 30 });
  const map = GM.buildMap({ railways: false }); s.add(map.group); s.map = map;
  for (const r of Object.values(map.regions)) { r.base = r.country === 'MEX' ? LAND.MEX : r.country === 'USA' ? LAND.USA : LAND.OTHER; r.mat.color.set(r.base); }
  return s;
}
export function city(ctx, s, name, k = 1, cls = 'c') {
  const d = s.map.dots[name]; if (d) d.visible = k > 0.01;
  const [lo, la] = GM.CITY[name];
  return label(ctx, GM.pos(lo, la, GM.H + 0.35), name, cls, k);
}
export function stateLabel(ctx, lon, lat, text, k = 1) { return label(ctx, GM.pos(lon, lat, GM.H + 0.05), text, 'st', k); }
export const fade = (t, a, b, f = 0.35) => ss(a, a + f, t) * (1 - ss(b - f, b, t));
// Pulsing ring marker on the Mexico map.
export function pulse(s, lon, lat, color = '#c0392b', size = 1) {
  const g = new THREE.Group(); const [x, y, z] = GM.pos(lon, lat); g.position.set(x, y + 0.03, z); s.add(g);
  const ring = F.ring(color, 0.6 * size); g.add(ring);
  const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * size, 0.22 * size, 0.06, 20), new THREE.MeshBasicMaterial({ color })); g.add(dot);
  g.update = (t, t0, t1 = 1e9) => { const k = t - t0; g.visible = k > 0 && t < t1; if (!g.visible) return; const rk = (k % 1.4) / 1.4; ring.scale.setScalar(0.6 + rk * 2.6); ring.material.opacity = 0.85 * (1 - rk); dot.scale.setScalar(clamp(k / 0.3)); };
  g.visible = false; return g;
}
// Soft translucent "zone of influence" disc on the Mexico map.
export function zone(s, lon, lat, r, color) {
  const [x, y, z] = GM.pos(lon, lat);
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, y + 0.02, z); m.renderOrder = 3; s.add(m);
  m.set = (k, o = 0.42) => { m.visible = k > 0.001; m.material.opacity = o * k; m.scale.setScalar(0.4 + 0.6 * k); };
  m.set(0); return m;
}

// ------------------------------------------------------------ present-day Americas
let AM = null;
const D2R = Math.PI / 180, LON0 = -88 * D2R, LAT0 = 18 * D2R, R = 57.2958 * 0.62;
export function aproj(lon, lat) {
  const l = lon * D2R - LON0, p = lat * D2R;
  const k = Math.sqrt(2 / (1 + Math.sin(LAT0) * Math.sin(p) + Math.cos(LAT0) * Math.cos(p) * Math.cos(l)));
  return [R * k * Math.cos(p) * Math.sin(l), -R * k * (Math.cos(LAT0) * Math.sin(p) - Math.sin(LAT0) * Math.cos(p) * Math.cos(l))];
}
export const apos = (lon, lat, y = 0.12) => { const [x, z] = aproj(lon, lat); return [x, y, z]; };
export const ACOL = { USA: '#cfd6e2', MEX: '#e8c87a', COL: '#9fca8a', VEN: '#d9d3c4', ECU: '#d9d3c4', PER: '#d9d3c4', BRA: '#d9d3c4', CAN: '#e2e2de', OTH: '#d9d3c4',
  GTM: '#e2d6b4', BLZ: '#e2d6b4', HND: '#e2d6b4', SLV: '#e2d6b4', NIC: '#e2d6b4', CRI: '#e2d6b4', PAN: '#e2d6b4', CUB: '#ddd7c6', JAM: '#ddd7c6', HTI: '#ddd7c6', DOM: '#ddd7c6', BHS: '#ddd7c6', PRI: '#ddd7c6', GUY: '#d9d3c4', SUR: '#d9d3c4' };
export const ACITY = { 'Bogotá': [-74.07, 4.71], 'Medellín': [-75.57, 6.25], 'Cali': [-76.53, 3.45], 'Ciudad de México': [-99.13, 19.43], 'Guadalajara': [-103.35, 20.67],
  'Culiacán': [-107.39, 24.80], 'Tijuana': [-117.04, 32.53], 'Ciudad Juárez': [-106.44, 31.69], 'Los Ángeles': [-118.24, 34.05], 'Chicago': [-87.63, 41.88],
  'Nueva York': [-74.0, 40.71], 'Miami': [-80.19, 25.76], 'Washington': [-77.04, 38.9] };
export function americasNow() {
  const s = stage({ groundA: null, skyTop: '#4a6fa8', skyHor: '#d7e4ea', fog: ['#d7e4ea', 80, 230], sunPos: [10, 40, 18], sun: 2.1, hemi: 1.35, shadow: 45 });
  const g = new THREE.Group(); s.add(g);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(260, 220), new THREE.MeshStandardMaterial({ color: '#8db6cd', roughness: 0.6 })); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.02; g.add(sea);
  s.countries = {};
  for (const grp of AM.groups) {
    const shapes = grp.polys.map(poly => { const sh = new THREE.Shape(poly[0].map(([lo, la]) => new THREE.Vector2(...aproj(lo, la))));
      for (const h of poly.slice(1)) sh.holes.push(new THREE.Path(h.map(([lo, la]) => new THREE.Vector2(...aproj(lo, la))))); return sh; });
    const geo = new THREE.ExtrudeGeometry(shapes, { depth: 0.12, bevelEnabled: false }); geo.rotateX(Math.PI / 2); geo.translate(0, 0.12, 0);
    const base = ACOL[grp.code] || ACOL.OTH;
    const mat = new THREE.MeshStandardMaterial({ color: base, roughness: 0.92, side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; g.add(m); s.countries[grp.code] = { mesh: m, mat, base };
    for (const poly of grp.polys) for (const ring of poly) {
      const pts = [...ring, ring[0]].map(([lo, la]) => aproj(lo, la)); const pos = [];
      for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1], dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz) || 1, nx = -dz / l * 0.04, nz = dx / l * 0.04;
        pos.push(ax + nx, 0.125, az + nz, ax - nx, 0.125, az - nz, bx + nx, 0.125, bz + nz, ax - nx, 0.125, az - nz, bx - nx, 0.125, bz - nz, bx + nx, 0.125, bz + nz); }
      const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      const lm = new THREE.Mesh(lg, new THREE.MeshBasicMaterial({ color: '#4d5f6c', side: THREE.DoubleSide, depthWrite: false })); lm.renderOrder = 2; g.add(lm);
    }
  }
  s.dots = {};
  for (const [n, [lo, la]] of Object.entries(ACITY)) { const d = new THREE.Group(); const [x, y, z] = apos(lo, la);
    d.add(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 16), new THREE.MeshBasicMaterial({ color: '#f7f1e3' }))); d.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 16), new THREE.MeshBasicMaterial({ color: '#2b2622' })));
    d.position.set(x, y + 0.02, z); d.visible = false; s.add(d); s.dots[n] = d; }
  return s;
}
export function acity(ctx, s, name, k = 1, cls = 'c') { const d = s.dots[name]; if (d) d.visible = k > 0.01; const [lo, la] = ACITY[name]; return label(ctx, apos(lo, la, 0.5), name, cls, k); }
export function alabel(ctx, lon, lat, text, k = 1, cls = 'st') { return label(ctx, apos(lon, lat, 0.2), text, cls, k); }
// Outlined arrow following lon/lat waypoints; arrow.set(p) reveals it.
export function arrowOn(proj, path, color, width = 0.7, y = 0.3) {
  const pts = path.map(([lo, la]) => { const [x, z] = proj(lo, la); return new THREE.Vector3(x, y, z); });
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const N = 120, S = curve.getSpacedPoints(N);
  const mk = (w, col, dy, ro) => {
    const pos = [];
    for (let i = 0; i <= N; i++) { const tg = curve.getTangentAt(i / N), nx = -tg.z, nz = tg.x, l = Math.hypot(nx, nz) || 1, ww = w / 2 * (0.7 + 0.3 * i / N);
      pos.push(S[i].x + nx / l * ww, y + dy, S[i].z + nz / l * ww, S[i].x - nx / l * ww, y + dy, S[i].z - nz / l * ww); }
    const idx = []; for (let i = 0; i < N; i++) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide, depthWrite: false })); m.renderOrder = ro; return m;
  };
  const outline = mk(width + 0.18, '#fbf5e6', 0, 4), body = mk(width, color, 0.002, 5);
  const headShape = w => new THREE.Shape([new THREE.Vector2(0, w * 1.3), new THREE.Vector2(-w * 1.05, -w * 0.25), new THREE.Vector2(w * 1.05, -w * 0.25)]);
  const hO = new THREE.Mesh(new THREE.ShapeGeometry(headShape(width + 0.16)), new THREE.MeshBasicMaterial({ color: '#fbf5e6', side: THREE.DoubleSide, depthWrite: false })); hO.renderOrder = 4;
  const hB = new THREE.Mesh(new THREE.ShapeGeometry(headShape(width)), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, depthWrite: false })); hB.renderOrder = 5;
  const grp = new THREE.Group(); grp.add(outline, body, hO, hB);
  grp.set = p => {
    p = clamp(p); grp.visible = p > 0.001;
    const n = Math.floor(p * N) * 6; outline.geometry.setDrawRange(0, n); body.geometry.setDrawRange(0, n);
    const tip = curve.getPointAt(Math.max(0.001, p)), tg = curve.getTangentAt(Math.max(0.001, p)), rot = Math.atan2(-tg.x, -tg.z);
    hO.position.set(tip.x - tg.x * 0.06, y + 0.001, tip.z - tg.z * 0.06); hO.rotation.set(-Math.PI / 2, 0, rot);
    hB.position.set(tip.x, y + 0.003, tip.z); hB.rotation.set(-Math.PI / 2, 0, rot);
  };
  grp.set(0); return grp;
}
export const marrow = (path, color, width = 0.55) => arrowOn(GM.proj, path, color, width, GM.H + 0.12);
export const aarrow = (path, color, width = 0.7) => arrowOn(aproj, path, color, width, 0.3);
