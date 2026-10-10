// Map of Mexico (1910–1920) built from src/mx/mexico.json (Natural Earth, simplified).
import * as THREE from 'three';
import { clamp, ss } from '../lib/util.js';

export const LON0 = -102, LAT0 = 23.6, K = 1.0, COS = Math.cos(LAT0 * Math.PI / 180);
export const proj = (lon, lat) => [(lon - LON0) * K * COS, -(lat - LAT0) * K];
export const H = 0.14; // land extrusion height

export const CITY = {
  'Ciudad Juárez': [-106.44, 31.69], 'Chihuahua': [-106.09, 28.63], 'Torreón': [-103.41, 25.54], 'Zacatecas': [-102.57, 22.77],
  'Aguascalientes': [-102.29, 21.88], 'Celaya': [-100.81, 20.52], 'Querétaro': [-100.39, 20.59], 'Ciudad de México': [-99.13, 19.43],
  'Puebla': [-98.20, 19.04], 'Veracruz': [-96.13, 19.17], 'Monterrey': [-100.31, 25.67], 'Saltillo': [-101.0, 25.42],
  'San Luis Potosí': [-100.98, 22.15], 'Hermosillo': [-110.96, 29.07], 'Nogales': [-110.94, 31.31], 'Guaymas': [-110.9, 27.92],
  'Cuernavaca': [-99.23, 18.92], 'Columbus': [-107.64, 31.83], 'San Antonio': [-98.49, 29.42], 'Durango': [-104.67, 24.02],
  'Guadalajara': [-103.35, 20.67], 'Tampico': [-97.86, 22.23], 'Nuevo Laredo': [-99.51, 27.48], 'Mazatlán': [-106.41, 23.23],
  'Jiménez': [-104.92, 27.13], 'León': [-101.68, 21.12], 'Irapuato': [-101.35, 20.67], 'Orizaba': [-97.10, 18.85], 'Tepic': [-104.89, 21.5],
};
// Main railway lines around 1910 (simplified routes between stations).
export const RAILWAYS = [
  ['Ciudad Juárez', 'Chihuahua', 'Jiménez', 'Torreón', 'Zacatecas', 'Aguascalientes', 'León', 'Irapuato', 'Celaya', 'Querétaro', 'Ciudad de México'],
  ['Nuevo Laredo', 'Monterrey', 'Saltillo', 'San Luis Potosí', 'Querétaro'],
  ['Torreón', 'Saltillo'],
  ['Ciudad de México', 'Puebla', 'Orizaba', 'Veracruz'],
  ['Nogales', 'Hermosillo', 'Guaymas'],
  ['Monterrey', 'Tampico'],
  ['Irapuato', 'Guadalajara'],
];
// Arrow colours: deeper shades so they read on top of their own territory colour.
export const ARROW = { federal: '#3d4d6e', maderista: '#8f3a1c', villista: '#7a1d14', zapatista: '#9a6a0a', carrancista: '#25573a', usa: '#2f4f7f' };
export const FACTION = {
  land: '#e8dcc0', usa: '#cfc6ae', other: '#d9d0b8',
  porfirista: '#6f7f9c', federal: '#6f7f9c', maderista: '#c6643f', villista: '#b23a2e', zapatista: '#d8a32a',
  carrancista: '#4c8a5a', convencion: '#a8452f',
};

let DATA = null;
export async function preload() { if (!DATA) DATA = await (await fetch('/src/mx/mexico.json')).json(); }
export const pos = (lon, lat, y = H) => { const [x, z] = proj(lon, lat); return [x, y, z]; };

// Thick polyline as a flat ribbon (WebGL lines are always 1px).
export function ribbon(pts, width, color, y = H + 0.004, { dash = 0, opacity = 1 } = {}) {
  const P = pts.map(([lo, la]) => proj(lo, la));
  const pos = [], idx = [];
  const addQuad = (a, b, na, nb) => {
    const k = pos.length / 3;
    pos.push(a[0] + na[0], y, a[1] + na[1], a[0] - na[0], y, a[1] - na[1], b[0] + nb[0], y, b[1] + nb[1], b[0] - nb[0], y, b[1] - nb[1]);
    idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
  };
  const nrm = (a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; return [-dz / l * width / 2, dx / l * width / 2]; };
  if (!dash) {
    for (let i = 0; i < P.length - 1; i++) {
      const n0 = i ? avg(nrm(P[i - 1], P[i]), nrm(P[i], P[i + 1])) : nrm(P[i], P[i + 1]);
      const n1 = i < P.length - 2 ? avg(nrm(P[i], P[i + 1]), nrm(P[i + 1], P[i + 2])) : nrm(P[i], P[i + 1]);
      addQuad(P[i], P[i + 1], n0, n1);
    }
  } else {
    // dashes of length `dash` along the path
    let on = true, carry = 0;
    for (let i = 0; i < P.length - 1; i++) {
      const a = P[i], b = P[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = nrm(a, b);
      let s = -carry;
      while (s < L) {
        const s0 = Math.max(0, s), s1 = Math.min(L, s + dash);
        if (on && s1 > s0) addQuad([a[0] + (b[0] - a[0]) * s0 / L, a[1] + (b[1] - a[1]) * s0 / L], [a[0] + (b[0] - a[0]) * s1 / L, a[1] + (b[1] - a[1]) * s1 / L], n, n);
        if (s + dash > L) { carry = L - s; break; }
        s += dash; on = !on;
      }
    }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: false, side: THREE.DoubleSide }));
  m.renderOrder = 2; return m;
}
function avg(a, b) { const x = (a[0] + b[0]) / 2, z = (a[1] + b[1]) / 2, l = Math.hypot(x, z) || 1, L = Math.hypot(a[0], a[1]); const k = L / l; return [x * Math.min(k, 3), z * Math.min(k, 3)]; }

export function buildMap({ railways = true, cities = true } = {}) {
  const group = new THREE.Group();
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(160, 120), new THREE.MeshStandardMaterial({ color: '#7fb0cc', roughness: 0.55 }));
  sea.rotation.x = -Math.PI / 2; sea.position.y = -0.02; sea.receiveShadow = true; group.add(sea);
  // soft shallow-water halo along coasts
  const regions = {};
  for (const r of DATA.regions) {
    const shapes = r.polys.map(poly => {
      const sh = new THREE.Shape(poly[0].map(([lo, la]) => new THREE.Vector2(...proj(lo, la))));
      for (const h of poly.slice(1)) sh.holes.push(new THREE.Path(h.map(([lo, la]) => new THREE.Vector2(...proj(lo, la)))));
      return sh;
    });
    const geo = new THREE.ExtrudeGeometry(shapes, { depth: H, bevelEnabled: false });
    geo.rotateX(Math.PI / 2); geo.translate(0, H, 0);
    const base = r.country === 'MEX' ? FACTION.land : r.country === 'USA' ? FACTION.usa : FACTION.other;
    const mat = new THREE.MeshStandardMaterial({ color: base, roughness: 0.9, side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; group.add(m);
    regions[r.name] = { mesh: m, mat, base, country: r.country, label: r.label };
  }
  for (const l of DATA.lines.state) group.add(ribbon(l, 0.035, '#9c8b6c', H + 0.003, { opacity: 0.75 }));
  for (const l of DATA.lines.coast) group.add(ribbon(l, 0.06, '#4d6f86', H + 0.004));
  for (const l of DATA.lines.intl) group.add(ribbon(l, 0.11, '#3b2f26', H + 0.005));
  const rail = new THREE.Group(); group.add(rail);
  if (railways) for (const r of RAILWAYS) {
    const pts = r.map(n => CITY[n]);
    rail.add(ribbon(pts, 0.11, '#2b2622', H + 0.006));
    rail.add(ribbon(pts, 0.045, '#f3ead6', H + 0.008, { dash: 0.22 }));
  }
  const dots = {};
  if (cities) for (const [n, [lo, la]] of Object.entries(CITY)) {
    const d = new THREE.Group(); const [x, y, z] = pos(lo, la);
    const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 18), new THREE.MeshBasicMaterial({ color: '#f7f1e3' }));
    const c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.07, 18), new THREE.MeshBasicMaterial({ color: '#2b2622' }));
    d.add(c1, c2); d.position.set(x, y + 0.03, z); d.visible = false; group.add(d); dots[n] = d;
  }
  return { group, regions, rail, dots };
}

// Territory timeline: events [{t, names, color}] (later wins), colours fade over 0.8 s.
export function paint(map, events, t) {
  const cur = {}, prev = {};
  for (const e of events) for (const n of e.names) if (t >= e.t) { prev[n] = cur[n] ? cur[n].c : null; cur[n] = { c: e.color, t: e.t }; }
  const A = new THREE.Color(), B = new THREE.Color();
  for (const [n, r] of Object.entries(map.regions)) {
    const c = cur[n];
    if (!c) { r.mat.color.set(r.base); continue; }
    A.set(prev[n] || r.base); B.set(c.c); r.mat.color.copy(A).lerp(B, ss(c.t, c.t + 0.8, t));
  }
}

// Arrow with a dark outline, revealed by arrow.set(p).
export function arrow(path, color, width = 0.7, y = H + 0.12) {
  const pts = path.map(([lo, la]) => { const [x, z] = proj(lo, la); return new THREE.Vector3(x, y, z); });
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const N = 90, S = curve.getSpacedPoints(N);
  const mk = (w, col, dy, ro) => {
    const pos = [];
    for (let i = 0; i <= N; i++) {
      const tg = curve.getTangentAt(i / N), nx = -tg.z, nz = tg.x, l = Math.hypot(nx, nz) || 1, ww = w / 2 * (0.7 + 0.3 * i / N);
      pos.push(S[i].x + nx / l * ww, y + dy, S[i].z + nz / l * ww, S[i].x - nx / l * ww, y + dy, S[i].z - nz / l * ww);
    }
    const idx = []; for (let i = 0; i < N; i++) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide, depthWrite: false })); m.renderOrder = ro; return m;
  };
  const outline = mk(width + 0.16, '#fbf5e6', 0, 4), body = mk(width, color, 0.002, 5);
  const headShape = w => new THREE.Shape([new THREE.Vector2(0, w * 1.3), new THREE.Vector2(-w * 1.05, -w * 0.25), new THREE.Vector2(w * 1.05, -w * 0.25)]);
  const hO = new THREE.Mesh(new THREE.ShapeGeometry(headShape(width + 0.14)), new THREE.MeshBasicMaterial({ color: '#fbf5e6', side: THREE.DoubleSide, depthWrite: false })); hO.renderOrder = 4;
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

// Round stand under a character token on the map, rimmed in the faction colour.
export function tokenBase(color) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.56, 0.12, 28), new THREE.MeshStandardMaterial({ color: '#3a302a', roughness: 0.6 }));
  m.position.y = 0.06; m.castShadow = true; g.add(m);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 8, 32), new THREE.MeshStandardMaterial({ color, roughness: 0.5 }));
  rim.rotation.x = Math.PI / 2; rim.position.y = 0.12; g.add(rim);
  return g;
}

// Polyline (as a THREE curve) through a list of cities, for things that travel along railways.
export function railPath(names) {
  const pts = names.map(n => { const [x, z] = proj(...CITY[n]); return new THREE.Vector3(x, H + 0.05, z); });
  const c = new THREE.CurvePath();
  for (let i = 0; i < pts.length - 1; i++) c.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
  return c;
}
