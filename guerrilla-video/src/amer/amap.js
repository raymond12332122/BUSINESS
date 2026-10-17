// Map of the Americas for the independence video: the colonial empires (1775-1810), the Spanish viceroyalties and the
// new states of 1825/1830, built from province groups in americas.json (see tools/amer_mapdata.py).
// Lambert azimuthal equal-area projection centred on the continent. Line widths scale with a uniform (s.lineW) so the
// same map reads in continent-wide shots and in close-ups of a single island.
import * as THREE from 'three';
import { stage } from '../lib/stage.js';
import { label } from '../lib/kit.js';
import { ss, clamp } from '../lib/util.js';
import * as F from '../lib/fx.js';

let RD = null;
export async function preload() { if (!RD) RD = await (await fetch('/src/amer/americas.json')).json(); }

// ---------------------------------------------------------------- projection
const D = Math.PI / 180, LON0 = -76, LAT0 = 12, R = 100;
const sP0 = Math.sin(LAT0 * D), cP0 = Math.cos(LAT0 * D);
export function aproj(lon, lat) {
  const p = lat * D, l = (lon - LON0) * D, cp = Math.cos(p), sp = Math.sin(p), cl = Math.cos(l);
  const k = Math.sqrt(2 / Math.max(1e-6, 1 + sP0 * sp + cP0 * cp * cl));
  return [R * k * cp * Math.sin(l), -R * k * (cP0 * sp - sP0 * cp * cl)];
}
export const H = 0.12;
export const apos = (lon, lat, y = H) => { const [x, z] = aproj(lon, lat); return [x, y, z]; };
export const fade = (t, a, b, f = 0.35) => ss(a, a + f, t) * (1 - ss(b - f, b, t));
export { label };

// ---------------------------------------------------------------- periods: which state owns each province group
const asg = (list, st) => Object.fromEntries(list.map(g => [g, st]));
const SPAIN_N = ['mxn', 'mex', 'chis', 'gtm', 'slv', 'hnd', 'nic', 'cri', 'pan', 'cub', 'pri'];
const SPAIN_S = ['col', 'ven', 'ecu', 'per', 'tara', 'bol', 'ataca', 'chl', 'arg', 'pry', 'ury'];
const COLONIAL = { bra: 'POR', ...asg(['bna', 'jam', 'bhs', 'blz', 'antb', 'bmu', 'cym'], 'GBR'), ...asg(['antf', 'guf', 'spm'], 'FRA'), ...asg(['sur', 'antn'], 'NLD'),
  ...asg(['antd', 'grl'], 'DAN'), ...asg(SPAIN_N, 'ESP'), ...asg(SPAIN_S, 'ESP'), bcy: 'IND', ore: 'IND', ak: 'IND', flk: 'IND' };
export const PERIODS = {
  1775: { ...COLONIAL, c13: 'C13', ...asg(['usw', 'wfla', 'fla'], 'GBR'), lou: 'ESP', hti: 'FRA', dom: 'ESP', tto: 'ESP', guy: 'NLD' },
  1800: { ...COLONIAL, ...asg(['c13', 'usw'], 'USA'), ...asg(['wfla', 'fla', 'lou'], 'ESP'), hti: 'FRA', dom: 'FRA', tto: 'GBR', guy: 'GBR', ak: 'RUS' },
  1810: { ...COLONIAL, ...asg(['c13', 'usw', 'lou'], 'USA'), ...asg(['wfla', 'fla'], 'ESP'), hti: 'HTI', dom: 'ESP', tto: 'GBR', guy: 'GBR', ak: 'RUS' },
  1825: { ...COLONIAL, ...asg(['c13', 'usw', 'lou', 'wfla', 'fla'], 'USA'), ore: 'JNT', ak: 'RUS', ...asg(['mxn', 'mex', 'chis'], 'MEX'),
    ...asg(['gtm', 'slv', 'hnd', 'nic', 'cri'], 'CAM'), ...asg(['pan', 'col', 'ven', 'ecu'], 'GCO'), ...asg(['per', 'tara'], 'PER'), ...asg(['bol', 'ataca'], 'BOL'),
    chl: 'CHL', arg: 'ARG', pry: 'PRY', ...asg(['bra', 'ury'], 'BRA'), ...asg(['hti', 'dom'], 'HTI'), ...asg(['cub', 'pri'], 'ESP'), ...asg(['tto', 'guy'], 'GBR') },
};
PERIODS[1830] = { ...PERIODS[1825], ury: 'URY', ...asg(['col', 'pan'], 'NGR'), ven: 'VEN', ecu: 'ECU' };
// Spanish America by viceroyalty / captaincy general (c. 1800)
PERIODS.virr = { ...PERIODS[1800], ...asg(['mxn', 'mex', 'lou', 'wfla', 'fla'], 'V_NES'), ...asg(['chis', 'gtm', 'slv', 'hnd', 'nic', 'cri'], 'V_GUA'),
  ...asg(['col', 'pan', 'ecu'], 'V_NGR'), ven: 'V_VEN', ...asg(['per', 'tara'], 'V_PER'), ...asg(['arg', 'ury', 'pry', 'bol', 'ataca'], 'V_RPL'), chl: 'V_CHL', ...asg(['cub', 'pri'], 'V_CUB') };
export const COL = {
  sea: '#8db4c9', other: '#d8d1c0', land: '#d8d1c0', IND: '#d6cfbd',
  ESP: '#e9c769', POR: '#86bf86', GBR: '#de9a8a', C13: '#e7b2a6', FRA: '#93b3de', NLD: '#f0b47a', DAN: '#cdb2cf', RUS: '#bdb5a5',
  USA: '#a3bde4', JNT: '#cfc7d8', MEX: '#7fb878', CAM: '#8fcfcf', GCO: '#f2d468', PER: '#e98f86', BOL: '#c3a0d8', CHL: '#d9827e', ARG: '#a6d4ee',
  PRY: '#c7b388', URY: '#9cc0e6', BRA: '#b9d46c', HTI: '#6d8fd0', NGR: '#f2d468', VEN: '#f0b860', ECU: '#e4e07a',
  V_NES: '#e9c769', V_GUA: '#d9b35a', V_NGR: '#f0d98a', V_VEN: '#e6be7a', V_PER: '#e3a85e', V_RPL: '#f3dfa0', V_CHL: '#d8a75f', V_CUB: '#e8cf8e',
  stateLine: '#7d6a50', coast: '#6d5a44', river: '#7fa3bd',
  PATRIOT: '#2f6fb0', ROYAL: '#c0392b',
};
export const NAME = {
  ESP: 'IMPERIO ESPAÑOL', POR: 'BRASIL (PORTUGAL)', GBR: 'IMPERIO BRITÁNICO', C13: 'TRECE COLONIAS', FRA: 'FRANCIA', NLD: 'PAÍSES BAJOS', RUS: 'RUSIA',
  USA: 'ESTADOS UNIDOS', MEX: 'MÉXICO', CAM: 'CENTROAMÉRICA', GCO: 'GRAN COLOMBIA', PER: 'PERÚ', BOL: 'BOLIVIA', CHL: 'CHILE', ARG: 'PROVINCIAS UNIDAS', PRY: 'PARAGUAY',
  URY: 'URUGUAY', BRA: 'IMPERIO DEL BRASIL', HTI: 'HAITÍ', NGR: 'NUEVA GRANADA', VEN: 'VENEZUELA', ECU: 'ECUADOR',
  V_NES: 'NUEVA ESPAÑA', V_GUA: 'GUATEMALA', V_NGR: 'NUEVA GRANADA', V_VEN: 'VENEZUELA', V_PER: 'PERÚ', V_RPL: 'RÍO DE LA PLATA', V_CHL: 'CHILE', V_CUB: 'CUBA',
};
const stateOf = (period, g) => PERIODS[period]?.[g] || ('own_' + g);
const colorOf = st => COL[st] || COL.other;

function shapesOf(polys) {
  return polys.map(poly => {
    const sh = new THREE.Shape(poly[0].map(([lo, la]) => new THREE.Vector2(...aproj(lo, la))));
    for (const h of poly.slice(1)) sh.holes.push(new THREE.Path(h.map(([lo, la]) => new THREE.Vector2(...aproj(lo, la)))));
    return sh;
  });
}
function slab(polys, y0, depth, color) {
  const geo = new THREE.ExtrudeGeometry(shapesOf(polys), { depth, bevelEnabled: false });
  geo.rotateX(Math.PI / 2); geo.translate(0, y0 + depth, 0);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.92, side: THREE.DoubleSide })); m.receiveShadow = true; return m;
}
// Many lon/lat polylines as one flat ribbon mesh. Each vertex stores its centre-line point and its side offset, so the
// width follows the shared uniform W.value at draw time (round joints keep thick lines solid).
const W = { value: 1 };
export function ribbons(lines, w, y, color, { joints = false, opacity = 1, closed = false, dash = 0 } = {}) {
  const pos = [], off = [];
  const quad = (ax, az, bx, bz, nx, nz) => { pos.push(ax, y, az, ax, y, az, bx, y, bz, ax, y, az, bx, y, bz, bx, y, bz); off.push(nx, nz, -nx, -nz, nx, nz, -nx, -nz, -nx, -nz, nx, nz); };
  for (const line of lines) {
    const pts = line.map(([lo, la]) => aproj(lo, la)), n = pts.length, segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[(i + 1) % n], dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz) || 1, nx = -dz / l * w, nz = dx / l * w;
      if (dash) { const m = Math.max(1, Math.round(l / dash)); for (let k = 0; k < m; k += 2) { const u0 = k / m, u1 = Math.min(1, (k + 1) / m); quad(ax + dx * u0, az + dz * u0, ax + dx * u1, az + dz * u1, nx, nz); } continue; }
      quad(ax, az, bx, bz, nx, nz);
      if (joints) for (let k = 0; k < 8; k++) {
        const a0 = k / 8 * Math.PI * 2, a1 = (k + 1) / 8 * Math.PI * 2;
        pos.push(bx, y, bz, bx, y, bz, bx, y, bz); off.push(0, 0, Math.cos(a1) * w, Math.sin(a1) * w, Math.cos(a0) * w, Math.sin(a0) * w);
      }
    }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('off', new THREE.Float32BufferAttribute(off, 2));
  const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity, depthWrite: false });
  mat.onBeforeCompile = sh => { sh.uniforms.uW = W; sh.vertexShader = 'attribute vec2 off; uniform float uW;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n transformed.xz += off * uW;'); };
  mat.customProgramCacheKey = () => 'ribbon-w';
  const m = new THREE.Mesh(g, mat); m.frustumCulled = false; m.renderOrder = 2; return m;
}

export const CITY = {
  'Boston': [-71.06, 42.36], 'Lexington': [-71.23, 42.45], 'Filadelfia': [-75.17, 39.95], 'Nueva York': [-74.0, 40.71], 'Yorktown': [-76.51, 37.24],
  'Saratoga': [-73.64, 43.0], 'Charleston': [-79.93, 32.78], 'Washington': [-77.04, 38.9], 'Nueva Orleans': [-90.07, 29.95], 'Quebec': [-71.21, 46.81],
  'Cabo Francés': [-72.2, 19.76], 'Puerto Príncipe': [-72.34, 18.54], 'Santo Domingo': [-69.93, 18.49], 'La Habana': [-82.37, 23.11], 'Kingston': [-76.79, 18.0],
  'Ciudad de México': [-99.13, 19.43], 'Dolores': [-100.93, 21.16], 'Guanajuato': [-101.26, 21.02], 'Querétaro': [-100.39, 20.59], 'Valladolid': [-101.19, 19.7],
  'Chilpancingo': [-99.5, 17.55], 'Acapulco': [-99.88, 16.86], 'Veracruz': [-96.13, 19.17], 'Iguala': [-99.54, 18.35], 'Córdoba': [-96.93, 18.88], 'Guadalajara': [-103.35, 20.67],
  'Guatemala': [-90.51, 14.63], 'Caracas': [-66.9, 10.48], 'Bogotá': [-74.07, 4.71], 'Quito': [-78.47, -0.18], 'Guayaquil': [-79.89, -2.19], 'Cartagena': [-75.51, 10.39],
  'Angostura': [-63.55, 8.12], 'Boyacá': [-73.4, 5.45], 'Carabobo': [-68.1, 10.1], 'Lima': [-77.04, -12.05], 'Callao': [-77.15, -12.06], 'Ayacucho': [-74.22, -13.16],
  'Junín': [-75.99, -11.15], 'Cuzco': [-71.97, -13.53], 'La Paz': [-68.15, -16.5], 'Chuquisaca': [-65.26, -19.03], 'Potosí': [-65.75, -19.58], 'Buenos Aires': [-58.38, -34.6],
  'Tucumán': [-65.22, -26.82], 'Mendoza': [-68.83, -32.89], 'Santiago': [-70.65, -33.45], 'Chacabuco': [-70.68, -33.0], 'Maipú': [-70.76, -33.51], 'Valparaíso': [-71.62, -33.05],
  'Montevideo': [-56.16, -34.9], 'Asunción': [-57.58, -25.26], 'Río de Janeiro': [-43.17, -22.91], 'São Paulo': [-46.63, -23.55], 'Salvador': [-38.5, -12.97],
  'Panamá': [-79.52, 8.98], 'Puerto Cabello': [-68.01, 10.47], 'Cádiz': [-6.29, 36.53],
};

export function americasMap({ light = 'day', period = 1775 } = {}) {
  const night = light === 'night';
  const s = stage({ groundA: null, skyTop: night ? '#0b1020' : '#4a6fa8', skyHor: night ? '#1d2840' : '#cfe0ea', fog: night ? ['#1d2840', 260, 900] : ['#cfe0ea', 260, 900],
    sunPos: [20, 60, 30], sun: night ? 1.1 : 2.2, hemi: night ? 0.75 : 1.3, shadow: 120 });
  const g = new THREE.Group(); s.add(g); s.mapGroup = g; s.userData.near = 1;
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400, 64, 64), new THREE.MeshStandardMaterial({ color: COL.sea, roughness: 0.6 })); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.02; g.add(sea);   // subdivided: one huge clipped triangle loses depth precision and can draw over the land
  g.add(slab(RD.land, 0, 0.05, COL.land));
  s.groups = {};
  for (const gr of RD.groups) { const m = slab(gr.polys, 0.0, H, COL.other); m.castShadow = false; g.add(m); s.groups[gr.id] = { mesh: m, mat: m.material, lab: gr.lab, area: gr.area }; }
  for (const lk of RD.lakes) { const m = slab(lk.polys, 0, H + 0.006, COL.sea); m.material.roughness = 0.5; g.add(m); }
  s.rivers = ribbons(RD.rivers.map(r => r.line), 0.05, H + 0.008, COL.river, { opacity: 0.85 }); g.add(s.rivers);
  g.add(ribbons(RD.arcs.filter(a => !a.b).map(a => a.line), 0.04, H + 0.012, COL.coast, { opacity: 0.75 }));
  s.borders = {};
  for (const per of Object.keys(PERIODS)) {
    const lines = RD.arcs.filter(a => a.b && stateOf(per, a.a) !== stateOf(per, a.b)).map(a => a.line);
    const grp = new THREE.Group(); grp.add(ribbons(lines, 0.07, H + 0.014, '#5a4a38', { joints: true, opacity: 0.9 }));
    grp.visible = false; g.add(grp); s.borders[per] = grp;
  }
  s.dots = {};
  for (const [n, [lo, la]] of Object.entries(CITY)) {
    const d = new THREE.Group(); const [x, , z] = apos(lo, la);
    d.add(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 18), new THREE.MeshBasicMaterial({ color: '#f7f1e3' })));
    d.add(new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.07, 18), new THREE.MeshBasicMaterial({ color: '#2b2622' })));
    d.position.set(x, H + 0.04, z); d.visible = false; g.add(d); s.dots[n] = d;
  }
  // zoom(k): line widths and city dots for the current camera distance (1 = the European-map scale of earlier videos)
  s.zoom = k => { W.value = k; for (const d of Object.values(s.dots)) d.scale.set(k, 1, k); };
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
  s.paint(period); s.zoom(1);
  return s;
}
// Pulsing ring at a lon/lat.
export function pulse(s, lon, lat, color = '#c0392b', size = 1) {
  const g = new THREE.Group(); const [x, , z] = apos(lon, lat); g.position.set(x, H + 0.03, z); s.add(g);
  const ring = F.ring(color, 0.6 * size); g.add(ring);
  const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * size, 0.2 * size, 0.06, 20), new THREE.MeshBasicMaterial({ color })); g.add(dot);
  g.update = (t, t0, t1 = 1e9) => { const k = t - t0; g.visible = k > 0 && t < t1; if (!g.visible) return; const rk = (k % 1.4) / 1.4; ring.scale.setScalar(0.6 + rk * 2.6); ring.material.opacity = 0.85 * (1 - rk); dot.scale.setScalar(clamp(k / 0.3)); };
  g.visible = false; return g;
}
// Outlined arrow following lon/lat waypoints; arrow.set(p) reveals it.
export function arrow(s, path, color, width = 0.6, y = H + 0.08) {
  const pts = path.map(([lo, la]) => { const [x, z] = aproj(lo, la); return new THREE.Vector3(x, y, z); });
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
  const outline = mk(width + 0.22 * width / 0.6, '#fbf5e6', 0, 4), body = mk(width, color, 0.002, 5);
  const headShape = w => new THREE.Shape([new THREE.Vector2(0, w * 1.3), new THREE.Vector2(-w * 1.05, -w * 0.25), new THREE.Vector2(w * 1.05, -w * 0.25)]);
  const hO = new THREE.Mesh(new THREE.ShapeGeometry(headShape(width * 1.33)), new THREE.MeshBasicMaterial({ color: '#fbf5e6', side: THREE.DoubleSide, depthWrite: false })); hO.renderOrder = 4;
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
// Soft translucent polygon (an area) drawn over the map; zone.set(k) fades it in.
export function zone(s, ring, color, { opacity = 0.5, y = H + 0.03 } = {}) {
  const sh = new THREE.Shape(ring.map(([lo, la]) => new THREE.Vector2(...aproj(lo, la))));
  const geo = new THREE.ShapeGeometry(sh, 24); geo.rotateX(Math.PI / 2);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
  m.position.y = y; m.renderOrder = 3; s.add(m);
  m.set = k => { m.visible = k > 0.001; m.material.opacity = opacity * clamp(k); };
  m.set(0); return m;
}
// 3D object standing on the map at lon/lat (scale in map units).
export function placeOn(s, obj, lon, lat, scale = 1, y = H) { const [x, , z] = apos(lon, lat, y); obj.position.set(x, y, z); obj.scale.setScalar(scale); s.add(obj); return obj; }
export function city(ctx, s, name, k = 1, cls = 'c', text = name) { const d = s.dots[name]; if (d) d.visible = k > 0.01; const [lo, la] = CITY[name]; return label(ctx, apos(lo, la, H + 0.5), text, cls, k); }
export function areaLabel(ctx, lon, lat, text, k = 1, cls = 'st', size = 26) {
  if (cls !== 'st') return label(ctx, apos(lon, lat, H + 0.05), text, cls, k);
  if (k <= 0) return ''; const [x, y, ok] = ctx.project(apos(lon, lat, H + 0.05)); if (!ok) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%) scale(${0.85 + 0.15 * k});opacity:${k};font:900 ${size}px Inter;letter-spacing:.16em;color:rgba(46,30,16,.9);white-space:nowrap;text-shadow:0 0 8px rgba(255,250,235,.95),0 0 3px rgba(255,250,235,.95)">${text}</div>`;
}
// Rich chip at a lon/lat: title + one line of detail, with a coloured underline.
export function chip(ctx, lo, la, k, title, sub = '', col = '#c0392b', dy = 0.5) {
  if (k <= 0) return ''; const [x, y, ok] = ctx.project(apos(lo, la, H + dy)); if (!ok) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-100%) scale(${0.8 + 0.2 * k});opacity:${k};text-align:center;padding:7px 14px 8px;border-radius:12px;background:rgba(20,22,28,.9);border-bottom:4px solid ${col};box-shadow:0 8px 24px rgba(0,0,0,.35);white-space:nowrap">
    <div style="font:900 24px 'Inter Display',Inter;color:#fff">${title}</div>${sub ? `<div style="font:700 17px Inter;color:#e6e0d4;margin-top:2px">${sub}</div>` : ''}</div>`;
}
// The continent drawn on old paper (theatre backdrop): a canvas texture of the land polygons.
export function paperMap(W = 1024, H = 1024, { paper = '#e8dcc0', land = '#d2bf94', ink = '#6a4a2a', title = '' } = {}) {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = paper; g.fillRect(0, 0, W, H);
  const r = LPrng(5); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(120,90,50,${0.03 + r() * 0.05})`; g.fillRect(r() * W, r() * H, 2 + r() * 6, 2 + r() * 6); }
  // fit the projected continent into the canvas
  const pts = RD.land.flatMap(p => p[0]).filter(([lo, la]) => lo < -30 && lo > -170 && la > -58 && la < 72).map(([lo, la]) => aproj(lo, la));
  const xs = pts.map(p => p[0]), zs = pts.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs);
  const k = Math.min(W * 0.9 / (x1 - x0), H * 0.9 / (z1 - z0)), ox = W / 2 - k * (x0 + x1) / 2, oz = H / 2 - k * (z0 + z1) / 2;
  g.fillStyle = land; g.strokeStyle = ink; g.lineWidth = 2.2; g.lineJoin = 'round';
  for (const poly of RD.land) { const ring = poly[0]; if (!ring.some(([lo, la]) => lo < -30 && lo > -170 && la > -58)) continue;
    g.beginPath(); ring.forEach(([lo, la], i) => { const [x, z] = aproj(lo, la); i ? g.lineTo(ox + x * k, oz + z * k) : g.moveTo(ox + x * k, oz + z * k); }); g.closePath(); g.fill(); g.stroke(); }
  g.strokeStyle = 'rgba(106,74,42,.25)'; g.lineWidth = 1; for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(0, i * H / 8); g.lineTo(W, i * H / 8); g.stroke(); g.beginPath(); g.moveTo(i * W / 8, 0); g.lineTo(i * W / 8, H); g.stroke(); }
  if (title) { g.fillStyle = ink; g.font = `italic 700 ${W * 0.045}px Georgia`; g.textAlign = 'center'; g.fillText(title, W * 0.73, H * 0.12); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function LPrng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
