// Map of Europe for the First World War video: the empires and alliances of 1914 and the new states of 1923,
// built from province groups in europe1914.json (see tools/ww1_mapdata.py). Lambert conformal conic.
import * as THREE from 'three';
import { stage } from '../lib/stage.js';
import { label } from '../lib/kit.js';
import { ss, clamp } from '../lib/util.js';
import * as F from '../lib/fx.js';

let RD = null;
export async function preload() { if (!RD) RD = await (await fetch('/src/ww1/europe1914.json')).json(); }

// ---------------------------------------------------------------- projection (LCC, standard parallels 40°N / 60°N)
const D = Math.PI / 180, LON0 = 15, LAT0 = 50, R = 100, P1 = 40 * D, P2 = 60 * D;
const NN = Math.log(Math.cos(P1) / Math.cos(P2)) / Math.log(Math.tan(Math.PI / 4 + P2 / 2) / Math.tan(Math.PI / 4 + P1 / 2));
const FF = Math.cos(P1) * Math.pow(Math.tan(Math.PI / 4 + P1 / 2), NN) / NN;
const RHO0 = FF / Math.pow(Math.tan(Math.PI / 4 + LAT0 * D / 2), NN);
export function wproj(lon, lat) {
  const rho = FF / Math.pow(Math.tan(Math.PI / 4 + clamp(lat, -80, 89) * D / 2), NN), th = NN * (lon - LON0) * D;
  return [R * rho * Math.sin(th), -R * (RHO0 - rho * Math.cos(th))];
}
export const H = 0.12;
export const wpos = (lon, lat, y = H) => { const [x, z] = wproj(lon, lat); return [x, y, z]; };
export const fade = (t, a, b, f = 0.35) => ss(a, a + f, t) * (1 - ss(b - f, b, t));
export { label };

// ---------------------------------------------------------------- periods: which state owns each province group
const asg = (list, st) => Object.fromEntries(list.map(g => [g, st]));
const AUH = ['aut', 'hun', 'cze', 'svk', 'svn', 'svnw', 'hrv', 'ist', 'bih', 'voj', 'trs', 'buk', 'tcp', 'apol', 'egal', 'tren', 'gor'];
const RUE = ['rus', 'cpol', 'vol', 'ukr', 'wblr', 'blr', 'mda', 'tnr', 'est', 'lva', 'ltu', 'vil', 'fin', 'cau', 'kars', 'casia'];
const OTT = ['tur', 'syr', 'lbn', 'pal', 'jor', 'irq', 'hej'];
export const PERIODS = {
  1914: { ...asg(AUH, 'AUH'), ...asg(RUE, 'RUE'), ...asg(OTT, 'OTT'), ...asg(['deu', 'als', 'nsch', 'mem', 'kal', 'gpol', 'ppol'], 'GER'),
    ...asg(['fra', 'tun', 'dza', 'mar'], 'FRA'), ...asg(['gbr', 'irl', 'egy', 'cyp', 'mlt', 'kwt'], 'GBR'), ...asg(['ita', 'lby'], 'ITA'),
    srb: 'SRB', mne: 'MNE', alb: 'ALB', rou: 'ROU', sdob: 'ROU', bgr: 'BUL', wthr: 'BUL', grc: 'GRC', bel: 'BEL', nld: 'NLD', lux: 'LUX', che: 'CHE', esp: 'ESP',
    prt: 'PRT', dnk: 'DNK', nor: 'NOR', swe: 'SWE', nej: 'NEJ', irn: 'PER' },
  1923: { ...asg(['deu', 'gpol', 'kal'], 'GER'), ...asg(['ppol', 'cpol', 'apol', 'egal', 'vol', 'wblr', 'vil'], 'POL'), ...asg(['cze', 'svk', 'tcp'], 'TCH'),
    aut: 'AUT', hun: 'HUN', ...asg(['svn', 'hrv', 'bih', 'voj', 'srb', 'mne'], 'YUG'), ...asg(['ita', 'tren', 'gor', 'svnw', 'ist', 'lby'], 'ITA'),
    ...asg(['rou', 'sdob', 'trs', 'buk', 'mda'], 'ROU'), ...asg(['rus', 'ukr', 'blr', 'tnr', 'cau', 'casia'], 'USSR'), fin: 'FIN', est: 'EST', lva: 'LVA', ...asg(['ltu', 'mem'], 'LTU'),
    ...asg(['tur', 'kars'], 'TUR'), ...asg(['grc', 'wthr'], 'GRC'), bgr: 'BUL', alb: 'ALB', ...asg(['syr', 'lbn'], 'FRM'), ...asg(['pal', 'jor', 'irq'], 'BRM'), hej: 'HEJ', nej: 'NEJ',
    ...asg(['fra', 'als', 'tun', 'dza', 'mar'], 'FRA'), ...asg(['gbr', 'cyp', 'mlt', 'kwt'], 'GBR'), irl: 'IRL', egy: 'EGY', bel: 'BEL', nld: 'NLD', lux: 'LUX', che: 'CHE', esp: 'ESP',
    prt: 'PRT', ...asg(['dnk', 'nsch'], 'DNK'), nor: 'NOR', swe: 'SWE', irn: 'PER' },
};
export const COL = {
  sea: '#8db0c6', other: '#d8d1c0', land: '#d8d1c0',
  GER: '#a9adb2', AUH: '#e2cf86', RUE: '#eaa982', OTT: '#bec992', FRA: '#a9c4e0', GBR: '#e6b0a8', ITA: '#b9d6a6', SRB: '#d7aac6', MNE: '#cbb0d2', ALB: '#d9c2a0',
  ROU: '#f3e6c0', BUL: '#c6b2da', GRC: '#a4d2d4', BEL: '#e8dc8e', NLD: '#f0c890', LUX: '#d8c8a8', CHE: '#e8c8c8', ESP: '#e3d2a6', PRT: '#c8dcb0', DNK: '#e4c4b0',
  NOR: '#c8d8c0', SWE: '#d4d8b0', NEJ: '#e2d6b4', PER: '#d6ceb4',
  POL: '#e6b6b8', TCH: '#c4bede', AUT: '#d6c08e', HUN: '#c9a87c', YUG: '#d7aac6', USSR: '#d06a58', FIN: '#c4dce8', EST: '#b8d0e0', LVA: '#d8b8a8', LTU: '#c8d8a0',
  TUR: '#bec992', FRM: '#bcd2e6', BRM: '#ecc4bc', HEJ: '#e8dcb0', IRL: '#b8dca8', EGY: '#e8d8b0',
  stateLine: '#7d6a50', coast: '#6d5a44', river: '#7fa3bd',
  ENTENTE: '#3f6fb5', CENTRAL: '#b8432f', NEUTRAL: '#c9c2b0',
};
export const NAME = { GER: 'IMPERIO ALEMÁN', AUH: 'AUSTRIA-HUNGRÍA', RUE: 'IMPERIO RUSO', OTT: 'IMPERIO OTOMANO', FRA: 'FRANCIA', GBR: 'GRAN BRETAÑA', ITA: 'ITALIA',
  SRB: 'SERBIA', ROU: 'RUMANIA', BUL: 'BULGARIA', GRC: 'GRECIA', BEL: 'BÉLGICA', ESP: 'ESPAÑA', POL: 'POLONIA', TCH: 'CHECOSLOVAQUIA', YUG: 'YUGOSLAVIA', AUT: 'AUSTRIA',
  HUN: 'HUNGRÍA', USSR: 'UNIÓN SOVIÉTICA', FIN: 'FINLANDIA', EST: 'ESTONIA', LVA: 'LETONIA', LTU: 'LITUANIA', TUR: 'TURQUÍA' };
const stateOf = (period, g) => PERIODS[period]?.[g] || ('own_' + g);
const colorOf = st => COL[st] || COL.other;

function shapesOf(polys) {
  return polys.map(poly => {
    const sh = new THREE.Shape(poly[0].map(([lo, la]) => new THREE.Vector2(...wproj(lo, la))));
    for (const h of poly.slice(1)) sh.holes.push(new THREE.Path(h.map(([lo, la]) => new THREE.Vector2(...wproj(lo, la)))));
    return sh;
  });
}
function slab(polys, y0, depth, color) {
  const geo = new THREE.ExtrudeGeometry(shapesOf(polys), { depth, bevelEnabled: false });
  geo.rotateX(Math.PI / 2); geo.translate(0, y0 + depth, 0);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.92, side: THREE.DoubleSide })); m.receiveShadow = true; return m;
}
// Many lon/lat polylines as one flat ribbon mesh (round joints keep thick lines solid).
export function ribbons(lines, w, y, color, { joints = false, opacity = 1, closed = false, dash = 0 } = {}) {
  const pos = [];
  for (const line of lines) {
    const pts = line.map(([lo, la]) => wproj(lo, la)), n = pts.length, segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[(i + 1) % n], dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz) || 1, nx = -dz / l * w, nz = dx / l * w;
      if (dash) { const m = Math.max(1, Math.round(l / dash)); for (let k = 0; k < m; k += 2) { const u0 = k / m, u1 = Math.min(1, (k + 1) / m), px = ax + dx * u0, pz = az + dz * u0, qx = ax + dx * u1, qz = az + dz * u1;
        pos.push(px + nx, y, pz + nz, px - nx, y, pz - nz, qx + nx, y, qz + nz, px - nx, y, pz - nz, qx - nx, y, qz - nz, qx + nx, y, qz + nz); } continue; }
      pos.push(ax + nx, y, az + nz, ax - nx, y, az - nz, bx + nx, y, bz + nz, ax - nx, y, az - nz, bx - nx, y, bz - nz, bx + nx, y, bz + nz);
      if (joints) for (let k = 0; k < 8; k++) {
        const a0 = k / 8 * Math.PI * 2, a1 = (k + 1) / 8 * Math.PI * 2;
        pos.push(bx, y, bz, bx + Math.cos(a1) * w, y, bz + Math.sin(a1) * w, bx + Math.cos(a0) * w, y, bz + Math.sin(a0) * w);
      }
    }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity, depthWrite: false }));
  m.renderOrder = 2; return m;
}

export const CITY = {
  'Sarajevo': [18.41, 43.86], 'Viena': [16.37, 48.21], 'Berlín': [13.4, 52.52], 'París': [2.35, 48.86], 'Londres': [-0.13, 51.51], 'Petrogrado': [30.31, 59.94],
  'Moscú': [37.62, 55.75], 'Belgrado': [20.46, 44.82], 'Bruselas': [4.35, 50.85], 'Roma': [12.5, 41.9], 'Constantinopla': [28.98, 41.01], 'Verdún': [5.38, 49.16],
  'Ypres': [2.88, 50.85], 'Somme': [2.66, 50.0], 'Marne': [3.3, 48.95], 'Galípoli': [26.4, 40.25], 'Versalles': [2.13, 48.8], 'Compiègne': [2.83, 49.42], 'Lieja': [5.57, 50.63],
  'Varsovia': [21.01, 52.23], 'Bucarest': [26.1, 44.43], 'Sofía': [23.32, 42.7], 'Atenas': [23.73, 37.98], 'Budapest': [19.04, 47.5], 'Praga': [14.42, 50.08],
  'Tannenberg': [20.1, 53.5], 'Brest-Litovsk': [23.69, 52.1], 'Caporetto': [13.55, 46.25], 'Riga': [24.11, 56.95], 'Amiens': [2.3, 49.89], 'Spa': [5.86, 50.49],
  'Madrid': [-3.7, 40.42], 'Estocolmo': [18.07, 59.33], 'Jerusalén': [35.21, 31.77], 'Bagdad': [44.36, 33.31], 'Damasco': [36.29, 33.51], 'El Cairo': [31.24, 30.04],
  'Medina': [39.61, 24.47], 'Áqaba': [35.0, 29.53], 'Berna': [7.45, 46.95], 'Ámsterdam': [4.9, 52.37], 'Salónica': [22.94, 40.64], 'Kiel': [10.13, 54.32],
};
// Front lines (lon, lat).
export const FRONT = {
  west: [[2.73, 51.15], [2.86, 51.0], [2.95, 50.88], [2.85, 50.8], [2.82, 50.62], [2.8, 50.43], [2.78, 50.29], [2.71, 50.12], [2.66, 50.0], [2.85, 49.8], [2.98, 49.58], [3.3, 49.44],
    [3.6, 49.45], [4.03, 49.3], [4.5, 49.2], [4.95, 49.2], [5.38, 49.27], [5.6, 49.1], [5.55, 48.92], [5.9, 48.95], [6.05, 48.9], [6.4, 48.75], [6.9, 48.5], [7.05, 48.2], [7.15, 47.9], [7.1, 47.65], [7.05, 47.5]],
  marne1914: [[2.6, 49.15], [2.88, 48.96], [3.3, 48.8], [3.75, 48.75], [4.2, 48.72], [4.9, 48.85], [5.3, 49.05]],
  east: [[24.1, 56.95], [26.5, 55.9], [26.8, 54.8], [26.0, 53.13], [26.1, 52.1], [25.3, 50.75], [25.6, 49.55], [25.9, 48.3], [26.5, 47.7]],
  italy: [[10.5, 46.55], [11.1, 45.95], [11.7, 45.9], [12.4, 46.5], [13.0, 46.6], [13.6, 46.3], [13.6, 46.0], [13.55, 45.75], [13.7, 45.65]],
  salonika: [[20.4, 40.9], [21.4, 41.0], [22.5, 41.15], [23.5, 41.2], [24.0, 40.85]],
  somme1: [[2.62, 50.17], [2.7, 50.08], [2.73, 50.0], [2.85, 49.96], [2.92, 49.88]], somme2: [[2.66, 50.13], [2.76, 50.08], [2.84, 50.06], [2.93, 49.98], [2.95, 49.88]],
};
export const ARROW = {
  schlieffen: [[6.1, 50.8], [5.57, 50.63], [4.35, 50.85], [3.95, 50.45], [3.29, 49.85], [2.65, 49.2]],
  ardennes: [[6.15, 49.65], [4.95, 49.7], [4.03, 49.26], [3.8, 48.95]],
};

export function europeMap({ light = 'day', period = 1914 } = {}) {
  const night = light === 'night';
  const s = stage({ groundA: null, skyTop: night ? '#0b1020' : '#4a6fa8', skyHor: night ? '#1d2840' : '#cfe0ea', fog: night ? ['#1d2840', 160, 520] : ['#cfe0ea', 160, 520],
    sunPos: [10, 30, 16], sun: night ? 1.1 : 2.2, hemi: night ? 0.75 : 1.3, shadow: 60 });
  const g = new THREE.Group(); s.add(g); s.mapGroup = g;
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), new THREE.MeshStandardMaterial({ color: COL.sea, roughness: 0.6 })); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.02; g.add(sea);
  g.add(slab(RD.land, 0, 0.05, COL.land));
  s.groups = {};
  for (const gr of RD.groups) { const m = slab(gr.polys, 0.0, H, COL.other); m.castShadow = false; g.add(m); s.groups[gr.id] = { mesh: m, mat: m.material, lab: gr.lab, area: gr.area }; }
  for (const lk of RD.lakes) { const m = slab(lk.polys, 0, H + 0.006, COL.sea); m.material.roughness = 0.5; g.add(m); }
  s.rivers = ribbons(RD.rivers.map(r => r.line), 0.05, H + 0.008, COL.river, { opacity: 0.85 }); g.add(s.rivers);
  const coast = RD.arcs.filter(a => !a.b).map(a => a.line);
  g.add(ribbons(coast, 0.04, H + 0.012, COL.coast, { opacity: 0.75 }));
  s.borders = {};
  for (const per of Object.keys(PERIODS)) {
    const lines = RD.arcs.filter(a => a.b && stateOf(per, a.a) !== stateOf(per, a.b)).map(a => a.line);
    const grp = new THREE.Group(); grp.add(ribbons(lines, 0.07, H + 0.014, '#5a4a38', { joints: true, opacity: 0.9 }));
    grp.visible = false; g.add(grp); s.borders[per] = grp;
  }
  s.dots = {};
  for (const [n, [lo, la]] of Object.entries(CITY)) {
    const d = new THREE.Group(); const [x, , z] = wpos(lo, la);
    d.add(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 18), new THREE.MeshBasicMaterial({ color: '#f7f1e3' })));
    d.add(new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.07, 18), new THREE.MeshBasicMaterial({ color: '#2b2622' })));
    d.position.set(x, H + 0.04, z); d.visible = false; g.add(d); s.dots[n] = d;
  }
  const tmp = new THREE.Color();
  s.paint = (per, to = null, k = 0) => {
    for (const [id, gr] of Object.entries(s.groups)) {
      gr.mat.color.set(colorOf(stateOf(per, id)));
      if (to && k > 0) gr.mat.color.lerp(tmp.set(colorOf(stateOf(to, id))), clamp(k));
    }
    for (const b of Object.values(s.borders)) b.visible = false;
    s.borders[to && k > 0.5 ? to : per].visible = true;
  };
  s.tint = (id, color, k = 1, amt = 0.8) => { const gr = s.groups[id]; if (!gr || k <= 0) return; gr.mat.color.lerp(tmp.set(color), amt * clamp(k)); };
  s.tintState = (per, st, color, k = 1, amt = 0.8) => { for (const id of Object.keys(s.groups)) if (stateOf(per, id) === st) s.tint(id, color, k, amt); };
  s.groupsOf = (per, st) => Object.keys(s.groups).filter(id => stateOf(per, id) === st);
  s.paint(period);
  return s;
}
// Front line that draws itself: front.set(p) with p = 0..1. Dark band with a light core (reads as a trench line).
export function front(s, path, { color = '#7a1e14', width = 0.16, y = H + 0.03, dash = 0 } = {}) {
  const band = ribbons([path], width, y, color, { joints: true, dash });
  const core = ribbons([path], width * 0.35, y + 0.002, '#f4e6c8', { joints: true, dash });
  const grp = new THREE.Group(); grp.add(band, core); s.add(grp);
  const per = (m) => m.geometry.attributes.position.count / 3 / Math.max(1, path.length - 1);   // triangles per segment
  grp.set = p => { p = clamp(p); grp.visible = p > 0.001; for (const m of [band, core]) { const tps = per(m), segs = Math.floor(p * (path.length - 1) + 0.999); m.geometry.setDrawRange(0, Math.round(segs * tps) * 3); } };
  grp.set(0); return grp;
}
// Pulsing ring at a lon/lat.
export function pulse(s, lon, lat, color = '#c0392b', size = 1) {
  const g = new THREE.Group(); const [x, , z] = wpos(lon, lat); g.position.set(x, H + 0.03, z); s.add(g);
  const ring = F.ring(color, 0.6 * size); g.add(ring);
  const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * size, 0.2 * size, 0.06, 20), new THREE.MeshBasicMaterial({ color })); g.add(dot);
  g.update = (t, t0, t1 = 1e9) => { const k = t - t0; g.visible = k > 0 && t < t1; if (!g.visible) return; const rk = (k % 1.4) / 1.4; ring.scale.setScalar(0.6 + rk * 2.6); ring.material.opacity = 0.85 * (1 - rk); dot.scale.setScalar(clamp(k / 0.3)); };
  g.visible = false; return g;
}
// Soft translucent polygon (an area) drawn over the map; zone.set(k) fades it in.
export function zone(s, ring, color, { opacity = 0.5, y = H + 0.03 } = {}) {
  const sh = new THREE.Shape(ring.map(([lo, la]) => new THREE.Vector2(...wproj(lo, la))));
  const geo = new THREE.ShapeGeometry(sh, 24); geo.rotateX(Math.PI / 2);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
  m.position.y = y; m.renderOrder = 3; s.add(m);
  m.set = k => { m.visible = k > 0.001; m.material.opacity = opacity * clamp(k); };
  m.set(0); return m;
}
// Outlined arrow following lon/lat waypoints; arrow.set(p) reveals it.
export function arrow(s, path, color, width = 0.6, y = H + 0.08) {
  const pts = path.map(([lo, la]) => { const [x, z] = wproj(lo, la); return new THREE.Vector3(x, y, z); });
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
  const outline = mk(width + 0.22, '#fbf5e6', 0, 4), body = mk(width, color, 0.002, 5);
  const headShape = w => new THREE.Shape([new THREE.Vector2(0, w * 1.3), new THREE.Vector2(-w * 1.05, -w * 0.25), new THREE.Vector2(w * 1.05, -w * 0.25)]);
  const hO = new THREE.Mesh(new THREE.ShapeGeometry(headShape(width + 0.2)), new THREE.MeshBasicMaterial({ color: '#fbf5e6', side: THREE.DoubleSide, depthWrite: false })); hO.renderOrder = 4;
  const hB = new THREE.Mesh(new THREE.ShapeGeometry(headShape(width)), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, depthWrite: false })); hB.renderOrder = 5;
  const grp = new THREE.Group(); grp.add(outline, body, hO, hB); s.add(grp);
  grp.set = p => {
    p = clamp(p); grp.visible = p > 0.001;
    const n = Math.floor(p * N) * 6; outline.geometry.setDrawRange(0, n); body.geometry.setDrawRange(0, n);
    const tip = curve.getPointAt(Math.max(0.001, p)), tg = curve.getTangentAt(Math.max(0.001, p)), rot = Math.atan2(-tg.x, -tg.z);
    hO.position.set(tip.x - tg.x * 0.06, y + 0.001, tip.z - tg.z * 0.06); hO.rotation.set(-Math.PI / 2, 0, rot);
    hB.position.set(tip.x, y + 0.003, tip.z); hB.rotation.set(-Math.PI / 2, 0, rot);
  };
  grp.set(0); return grp;
}
// 3D object standing on the map at lon/lat (scale in map units).
export function placeOn(s, obj, lon, lat, scale = 1, y = H) { const [x, , z] = wpos(lon, lat, y); obj.position.set(x, y, z); obj.scale.setScalar(scale); s.add(obj); return obj; }
export function city(ctx, s, name, k = 1, cls = 'c', text = name) { const d = s.dots[name]; if (d) d.visible = k > 0.01; const [lo, la] = CITY[name]; return label(ctx, wpos(lo, la, H + 0.5), text, cls, k); }
export function areaLabel(ctx, lon, lat, text, k = 1, cls = 'st') { return label(ctx, wpos(lon, lat, H + 0.05), text, cls, k); }
// Rich chip at a lon/lat: title + one line of detail, with a coloured underline.
export function chip(ctx, lo, la, k, title, sub = '', col = '#c0392b', dy = 0.5) {
  if (k <= 0) return ''; const [x, y, ok] = ctx.project(wpos(lo, la, H + dy)); if (!ok) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-100%) scale(${0.8 + 0.2 * k});opacity:${k};text-align:center;padding:7px 14px 8px;border-radius:12px;background:rgba(20,22,28,.9);border-bottom:4px solid ${col};box-shadow:0 8px 24px rgba(0,0,0,.35);white-space:nowrap">
    <div style="font:900 24px 'Inter Display',Inter;color:#fff">${title}</div>${sub ? `<div style="font:700 17px Inter;color:#e6e0d4;margin-top:2px">${sub}</div>` : ''}</div>`;
}
