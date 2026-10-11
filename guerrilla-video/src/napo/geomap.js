// Map of Europe 1792-1815 built from src/napo/europe.json (Natural Earth provinces grouped into historical states).
// Lambert azimuthal equal-area projection centred on Central Europe, ~1 unit per degree near the centre.
import * as THREE from 'three';
import { clamp, ss } from '../lib/util.js';

const D2R = Math.PI / 180, LON0 = 15 * D2R, LAT0 = 50 * D2R, R = 57.2958;
export function proj(lon, lat) {
  const l = lon * D2R - LON0, p = lat * D2R;
  const k = Math.sqrt(2 / (1 + Math.sin(LAT0) * Math.sin(p) + Math.cos(LAT0) * Math.cos(p) * Math.cos(l)));
  return [R * k * Math.cos(p) * Math.sin(l), -R * k * (Math.cos(LAT0) * Math.sin(p) - Math.sin(LAT0) * Math.cos(p) * Math.cos(l))];
}
export const H = 0.2;
export const pos = (lon, lat, y = H) => { const [x, z] = proj(lon, lat); return [x, y, z]; };

export const CITY = {
  'París': [2.35, 48.86], 'Londres': [-0.13, 51.51], 'Madrid': [-3.70, 40.42], 'Lisboa': [-9.14, 38.72], 'Roma': [12.50, 41.90],
  'Viena': [16.37, 48.21], 'Berlín': [13.40, 52.52], 'Moscú': [37.62, 55.75], 'San Petersburgo': [30.32, 59.93], 'Varsovia': [21.01, 52.23],
  'Ámsterdam': [4.90, 52.37], 'Bruselas': [4.35, 50.85], 'Waterloo': [4.40, 50.68], 'Hamburgo': [9.99, 53.55], 'Milán': [9.19, 45.46],
  'Nápoles': [14.27, 40.85], 'Venecia': [12.33, 45.44], 'Turín': [7.69, 45.07], 'Tolón': [5.93, 43.12], 'Ajaccio': [8.74, 41.92],
  'Austerlitz': [16.76, 49.15], 'Jena': [11.59, 50.93], 'Friedland': [21.02, 54.45], 'Tilsit': [21.88, 55.08], 'Leipzig': [12.37, 51.34],
  'Borodinó': [35.82, 55.52], 'Smolensk': [32.05, 54.78], 'Vilna': [25.28, 54.69], 'Kovno': [23.90, 54.90], 'Berézina': [28.35, 54.33],
  'Ulm': [9.99, 48.40], 'Wagram': [16.56, 48.30], 'Eylau': [20.63, 54.40], 'Dresde': [13.74, 51.05], 'Trafalgar': [-6.03, 36.18],
  'Cádiz': [-6.29, 36.53], 'Zaragoza': [-0.88, 41.65], 'Bayona': [-1.47, 43.49], 'Elba': [10.32, 42.78], 'Alejandría': [29.92, 31.20],
  'El Cairo': [31.24, 30.04], 'Boulogne': [1.61, 50.73], 'Marsella': [5.37, 43.30], 'Estrasburgo': [7.75, 48.58], 'Arcole': [11.28, 45.36],
  'Rivoli': [10.81, 45.57], 'Marengo': [8.65, 44.90], 'Fontainebleau': [2.70, 48.40], 'Cannes': [7.01, 43.55], 'Grenoble': [5.72, 45.19],
  'Lyon': [4.84, 45.76], 'Burgos': [-3.70, 42.34], 'Vitoria': [-2.67, 42.85], 'Salamanca': [-5.66, 40.97], 'Constantinopla': [28.98, 41.01],
  'Lodi': [9.50, 45.31], 'Castiglione': [10.49, 45.39], 'Mantua': [10.79, 45.16], 'Niza': [7.27, 43.70], 'Fréjus': [6.74, 43.43], 'Saint-Cloud': [2.22, 48.84],
  'Estocolmo': [18.07, 59.33], 'Copenhague': [12.57, 55.68], 'Brünn': [16.61, 49.20], 'Danzig': [18.65, 54.35], 'Königsberg': [20.51, 54.71],
};
export const NAMES = {
  FRA: 'Francia', GBR: 'Gran Bretaña', ESP: 'España', POR: 'Portugal', AUT: 'Austria', PRU: 'Prusia', RUS: 'Rusia', OTT: 'Imperio otomano',
  SWE: 'Suecia', DEN: 'Dinamarca y Noruega', HRE: 'Sacro Imperio', CRH: 'Confederación del Rin', GER: 'Confederación Germánica',
  POL: 'Polonia-Lituania', WAR: 'Ducado de Varsovia', NED: 'Países Bajos', SUI: 'Suiza', SAR: 'Cerdeña', GEN: 'Génova', VEN: 'Venecia',
  PAP: 'Estados Pontificios', NAP: 'Nápoles', SIC: 'Sicilia', TUS: 'Toscana', ITK: 'Reino de Italia', PER: 'Persia', MAR: 'Marruecos',
};
// Label anchors (lon, lat) per state; better than automatic centroids for states with outlying parts.
const LABEL_AT = {
  FRA: [2.4, 46.9], GBR: [-1.6, 52.6], ESP: [-3.6, 39.9], POR: [-8.0, 39.6], AUT: [18.2, 47.6], PRU: [14.4, 52.7], RUS: [33.5, 56.2],
  OTT: [33.0, 39.2], SWE: [15.0, 60.3], DEN: [9.4, 56.1], HRE: [10.2, 50.3], CRH: [10.6, 50.2], GER: [10.4, 49.6], POL: [24.5, 52.9],
  WAR: [20.0, 52.1], NED: [5.5, 52.3], SUI: [8.1, 46.8], ITK: [11.0, 45.4], NAP: [15.9, 40.7], PAP: [12.6, 42.9], PER: [46.0, 37.6],
  MAR: [-6.0, 32.4], SAR: [9.0, 40.1],
};
export const COLOR = {
  FRA: '#5b7bc4', GBR: '#c8695b', ESP: '#e6a560', POR: '#b8cf80', AUT: '#e6d27d', PRU: '#828a9b', RUS: '#7fae7a', OTT: '#d4b08e',
  SWE: '#b6a6d1', DEN: '#e2a8a2', HRE: '#cfc4a0', CRH: '#cfc4a0', GER: '#cfc4a0', POL: '#dc9c9c', WAR: '#dc9c9c', NED: '#e8a066',
  SUI: '#d99595', SAR: '#c6b4d8', GEN: '#d6c2a2', VEN: '#d7b27c', PAP: '#efe2b4', NAP: '#d8a5ba', SIC: '#d8a5ba', TUS: '#b9d2a9',
  ITK: '#a4b8df', PAR: '#d8c9b9', MOD: '#d8c9b9', RAG: '#d1c9b9', MON: '#d1c9b9', PER: '#d9c5a2', MAR: '#dacaa9', OTH: '#ddd4c0',
};
export const SAT = '#a4b8df'; // French satellite states
const PERIOD_COLOR = {
  '1805': { NED: SAT, SUI: SAT, ITK: SAT, TUS: SAT },
  '1812': { CRH: SAT, WAR: SAT, ITK: SAT, NAP: SAT, SUI: SAT, ESP: '#aab6d6' },
};
export const baseColor = (per, pol) => (PERIOD_COLOR[per] && PERIOD_COLOR[per][pol]) || COLOR[pol] || COLOR.OTH;

let DATA = null;
export async function preload() { if (!DATA) DATA = await (await fetch('/src/napo/europe.json')).json(); }

// Thick polyline as a flat ribbon.
export function ribbon(pts, width, color, y = H + 0.004, { opacity = 1, dash = 0 } = {}) {
  const P = pts.map(([lo, la]) => proj(lo, la));
  const pos = [], idx = [];
  const nrm = (a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; return [-dz / l * width / 2, dx / l * width / 2]; };
  const quad = (a, b, na, nb) => { const k = pos.length / 3;
    pos.push(a[0] + na[0], y, a[1] + na[1], a[0] - na[0], y, a[1] - na[1], b[0] + nb[0], y, b[1] + nb[1], b[0] - nb[0], y, b[1] - nb[1]);
    idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); };
  if (!dash) for (let i = 0; i < P.length - 1; i++) {
    const n0 = i ? avg(nrm(P[i - 1], P[i]), nrm(P[i], P[i + 1])) : nrm(P[i], P[i + 1]);
    const n1 = i < P.length - 2 ? avg(nrm(P[i], P[i + 1]), nrm(P[i + 1], P[i + 2])) : nrm(P[i], P[i + 1]);
    quad(P[i], P[i + 1], n0, n1);
  } else {
    let on = true, carry = 0;
    for (let i = 0; i < P.length - 1; i++) {
      const a = P[i], b = P[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = nrm(a, b); let s = -carry;
      while (s < L) { const s0 = Math.max(0, s), s1 = Math.min(L, s + dash);
        if (on && s1 > s0) quad([a[0] + (b[0] - a[0]) * s0 / L, a[1] + (b[1] - a[1]) * s0 / L], [a[0] + (b[0] - a[0]) * s1 / L, a[1] + (b[1] - a[1]) * s1 / L], n, n);
        if (s + dash > L) { carry = L - s; break; } s += dash; on = !on; }
    }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide }));
  m.renderOrder = 2; return m;
}
function avg(a, b) { const x = (a[0] + b[0]) / 2, z = (a[1] + b[1]) / 2, l = Math.hypot(x, z) || 1, L = Math.hypot(a[0], a[1]); const k = L / l; return [x * Math.min(k, 3), z * Math.min(k, 3)]; }

export function buildMap({ rivers = true, cities = true, scale = 1 } = {}) {
  const group = new THREE.Group();
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(260, 200), new THREE.MeshStandardMaterial({ color: '#8db6cd', roughness: 0.6 }));
  sea.rotation.x = -Math.PI / 2; sea.position.set(0, -0.02, 0); sea.receiveShadow = true; group.add(sea);
  const groups = [];
  for (const g of DATA.groups) {
    const shapes = g.polys.map(poly => {
      const sh = new THREE.Shape(poly[0].map(([lo, la]) => new THREE.Vector2(...proj(lo, la))));
      for (const h of poly.slice(1)) sh.holes.push(new THREE.Path(h.map(([lo, la]) => new THREE.Vector2(...proj(lo, la)))));
      return sh;
    });
    const geo = new THREE.ExtrudeGeometry(shapes, { depth: H, bevelEnabled: false }); geo.rotateX(Math.PI / 2); geo.translate(0, H, 0);
    const mat = new THREE.MeshStandardMaterial({ color: COLOR.OTH, roughness: 0.92, side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; group.add(m);
    groups.push({ mesh: m, mat, p: g.p });
  }
  for (const l of DATA.lakes) {
    const sh = new THREE.Shape(l.map(([lo, la]) => new THREE.Vector2(...proj(lo, la))));
    const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({ color: '#8db6cd', roughness: 0.6, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.rotation.x = Math.PI / 2; m.position.y = H + 0.002; m.renderOrder = 1; group.add(m);
    group.add(ribbon([...l, l[0]], 0.03 * scale, '#4d6f86', H + 0.005));
  }
  const riverG = new THREE.Group(); group.add(riverG);
  if (rivers) for (const r of DATA.rivers) riverG.add(ribbon(r.pts, 0.045 * scale, '#5b90b3', H + 0.004, { opacity: 0.9 }));
  for (const l of DATA.coast) group.add(ribbon(l, 0.06 * scale, '#46677d', H + 0.006));
  const borders = {};
  for (const per of DATA.periods) { borders[per] = new THREE.Group(); borders[per].visible = false; group.add(borders[per]); }
  for (const b of DATA.inner) for (const per of b.periods) borders[per].add(ribbon(b.pts, 0.09 * scale, '#3a2e25', H + 0.008));
  const dots = {};
  if (cities) for (const [n, [lo, la]] of Object.entries(CITY)) {
    const d = new THREE.Group(); const [x, y, z] = pos(lo, la);
    d.add(new THREE.Mesh(new THREE.CylinderGeometry(0.16 * scale, 0.16 * scale, 0.05, 18), new THREE.MeshBasicMaterial({ color: '#f7f1e3' })));
    d.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1 * scale, 0.1 * scale, 0.07, 18), new THREE.MeshBasicMaterial({ color: '#2b2622' })));
    d.position.set(x, y + 0.03, z); d.visible = false; group.add(d); dots[n] = d;
  }
  const map = { group, groups, borders, dots, rivers: riverG, per: null };
  setPeriod(map, '1805');
  return map;
}

// Show one period's borders and base colours.
export function setPeriod(map, per) {
  if (map.per === per) return;
  map.per = per; const k = DATA.periods.indexOf(per);
  for (const [p, g] of Object.entries(map.borders)) g.visible = p === per;
  for (const g of map.groups) { g.pol = g.p[k]; g.base = baseColor(per, g.pol); g.mat.color.set(g.base); }
}
// Colour timeline: events [{t, pol: [...], color}] apply to every group whose state (in the current period) is listed.
export function paint(map, events, t) {
  const A = new THREE.Color(), B = new THREE.Color();
  for (const g of map.groups) {
    let cur = null, prev = null;
    for (const e of events) if (t >= e.t && e.pol.includes(g.pol)) { prev = cur ? cur.color : null; cur = e; }
    if (!cur) { g.mat.color.set(g.base); continue; }
    A.set(prev || g.base); B.set(cur.color); g.mat.color.copy(A).lerp(B, ss(cur.t, cur.t + 0.8, t));
  }
}
export function labelPos(pol, per) {
  const a = LABEL_AT[pol] || (DATA.labels[per] && DATA.labels[per][pol]);
  return a ? pos(a[0], a[1], H + 0.05) : null;
}
export function stateArea(pol, per) { const a = DATA.labels[per] && DATA.labels[per][pol]; return a ? a[2] : 0; }

// Campaign arrow (cream outline), revealed by arrow.set(p).
export function arrow(path, color, width = 0.8, y = H + 0.14) {
  const pts = path.map(([lo, la]) => { const [x, z] = proj(lo, la); return new THREE.Vector3(x, y, z); });
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const N = 120, S = curve.getSpacedPoints(N);
  const mk = (w, col, dy, ro) => {
    const p = [];
    for (let i = 0; i <= N; i++) { const tg = curve.getTangentAt(i / N), nx = -tg.z, nz = tg.x, l = Math.hypot(nx, nz) || 1, ww = w / 2 * (0.7 + 0.3 * i / N);
      p.push(S[i].x + nx / l * ww, y + dy, S[i].z + nz / l * ww, S[i].x - nx / l * ww, y + dy, S[i].z - nz / l * ww); }
    const idx = []; for (let i = 0; i < N; i++) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide, depthWrite: false })); m.renderOrder = ro; return m;
  };
  const outline = mk(width + 0.18, '#fbf5e6', 0, 4), body = mk(width, color, 0.002, 5);
  const head = w => new THREE.Shape([new THREE.Vector2(0, w * 1.3), new THREE.Vector2(-w * 1.05, -w * 0.25), new THREE.Vector2(w * 1.05, -w * 0.25)]);
  const hO = new THREE.Mesh(new THREE.ShapeGeometry(head(width + 0.16)), new THREE.MeshBasicMaterial({ color: '#fbf5e6', side: THREE.DoubleSide, depthWrite: false })); hO.renderOrder = 4;
  const hB = new THREE.Mesh(new THREE.ShapeGeometry(head(width)), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, depthWrite: false })); hB.renderOrder = 5;
  const grp = new THREE.Group(); grp.add(outline, body, hO, hB); grp.curve = curve;
  grp.set = p => {
    p = clamp(p); grp.visible = p > 0.001;
    const n = Math.floor(p * N) * 6; outline.geometry.setDrawRange(0, n); body.geometry.setDrawRange(0, n);
    const tip = curve.getPointAt(Math.max(0.001, p)), tg = curve.getTangentAt(Math.max(0.001, p)), rot = Math.atan2(-tg.x, -tg.z);
    hO.position.set(tip.x - tg.x * 0.06, y + 0.001, tip.z - tg.z * 0.06); hO.rotation.set(-Math.PI / 2, 0, rot);
    hB.position.set(tip.x, y + 0.003, tip.z); hB.rotation.set(-Math.PI / 2, 0, rot);
  };
  grp.set(0); return grp;
}
export function tokenBase(color) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.56, 0.12, 28), new THREE.MeshStandardMaterial({ color: '#3a302a', roughness: 0.6 }));
  m.position.y = 0.06; m.castShadow = true; g.add(m);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 8, 32), new THREE.MeshStandardMaterial({ color, roughness: 0.5 }));
  rim.rotation.x = Math.PI / 2; rim.position.y = 0.12; g.add(rim);
  return g;
}
