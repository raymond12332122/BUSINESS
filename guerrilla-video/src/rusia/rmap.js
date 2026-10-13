// Map of Eurasia for the Russian Revolution video: the Russian Empire (1914), Soviet Russia after Brest-Litovsk (1918)
// and the USSR (1922), built from province groups in russia.json (see tools/rusia_mapdata.py). Lambert conformal conic.
import * as THREE from 'three';
import { stage } from '../lib/stage.js';
import { label } from '../lib/kit.js';
import { ss, clamp } from '../lib/util.js';
import * as F from '../lib/fx.js';

let RD = null;
export async function preload() { if (!RD) RD = await (await fetch('/src/rusia/russia.json')).json(); }

// ---------------------------------------------------------------- projection (LCC, standard parallels 50°N / 66°N)
const D = Math.PI / 180, LON0 = 62, LAT0 = 56, R = 40, P1 = 50 * D, P2 = 66 * D;
const NN = Math.log(Math.cos(P1) / Math.cos(P2)) / Math.log(Math.tan(Math.PI / 4 + P2 / 2) / Math.tan(Math.PI / 4 + P1 / 2));
const FF = Math.cos(P1) * Math.pow(Math.tan(Math.PI / 4 + P1 / 2), NN) / NN;
const RHO0 = FF / Math.pow(Math.tan(Math.PI / 4 + LAT0 * D / 2), NN);
export function rproj(lon, lat) {
  const rho = FF / Math.pow(Math.tan(Math.PI / 4 + clamp(lat, -80, 89) * D / 2), NN), th = NN * (lon - LON0) * D;
  return [R * rho * Math.sin(th), -R * (RHO0 - rho * Math.cos(th))];
}
export const H = 0.12, NH = 0.08;            // land slab heights (states / background)
export const rpos = (lon, lat, y = H) => { const [x, z] = rproj(lon, lat); return [x, y, z]; };
export const fade = (t, a, b, f = 0.35) => ss(a, a + f, t) * (1 - ss(b - f, b, t));
export { label };

// ---------------------------------------------------------------- periods: which state owns each province group
const RUS_EMPIRE = ['rus', 'fin', 'est', 'lva', 'ltu', 'cpol', 'blr_w', 'blr_e', 'ukr_v', 'ukr_e', 'mda', 'geo', 'arm', 'aze', 'kars', 'casia'];
const AUH = ['aut', 'hun', 'cze', 'svk', 'svn', 'hrv', 'bih', 'apol', 'gal', 'buk', 'tcp'];
const base = () => ({});
export const PERIODS = {
  1914: Object.assign(base(), ...RUS_EMPIRE.map(g => ({ [g]: 'RUE' })), ...AUH.map(g => ({ [g]: 'AUH' })), { deu: 'GER', kal: 'GER', ppol: 'GER', tur: 'OTT' }),
  1918: Object.assign(base(), { rus: 'SOV', casia: 'SOV' }, ...['fin', 'est', 'lva', 'ltu', 'cpol', 'blr_w', 'blr_e', 'ukr_v', 'ukr_e'].map(g => ({ [g]: 'LOST_' + g })),
    { kars: 'OTT', tur: 'OTT', mda: 'ROU', rou: 'ROU', geo: 'TRC', arm: 'TRC', aze: 'TRC' }, ...AUH.map(g => ({ [g]: 'AUH' })), { deu: 'GER', kal: 'GER', ppol: 'GER' }),
  1922: Object.assign(base(), ...['rus', 'casia', 'ukr_e', 'blr_e', 'geo', 'arm', 'aze'].map(g => ({ [g]: 'USSR' })),
    ...['cpol', 'ppol', 'apol', 'blr_w', 'ukr_v', 'gal'].map(g => ({ [g]: 'POL' })), { mda: 'ROU', buk: 'ROU', rou: 'ROU', tcp: 'TCH', cze: 'TCH', svk: 'TCH', kars: 'TUR', tur: 'TUR', deu: 'GER', kal: 'GER' }),
};
export const COL = { sea: '#86a9c2', other: '#d3ccbc', land: '#d3ccbc', RUE: '#d9b77a', SOV: '#cf6b55', USSR: '#c84c3c', GER: '#9aa0a6', AUH: '#b8a88c', OTT: '#a8b48a',
  LOST: '#e9a48a', ROU: '#d1c4a8', TRC: '#d9c9a0', POL: '#d6b8b8', TCH: '#c6c0d4', TUR: '#c9c09a', stateLine: '#7d6a50', coast: '#6d5a44', river: '#7fa3bd' };
const stateOf = (period, g) => PERIODS[period]?.[g] || ('own_' + g);
const colorOf = (st) => COL[st] || (st.startsWith('LOST_') ? COL.LOST : COL.other);

function shapesOf(polys) {
  return polys.map(poly => {
    const sh = new THREE.Shape(poly[0].map(([lo, la]) => new THREE.Vector2(...rproj(lo, la))));
    for (const h of poly.slice(1)) sh.holes.push(new THREE.Path(h.map(([lo, la]) => new THREE.Vector2(...rproj(lo, la)))));
    return sh;
  });
}
function slab(polys, y0, depth, color) {
  const geo = new THREE.ExtrudeGeometry(shapesOf(polys), { depth, bevelEnabled: false });
  geo.rotateX(Math.PI / 2); geo.translate(0, y0 + depth, 0);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.92, side: THREE.DoubleSide });
  const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; return m;
}
// Many lon/lat polylines as one flat ribbon mesh (round joints keep thick lines solid).
export function ribbons(lines, w, y, color, { joints = false, opacity = 1, closed = false } = {}) {
  const pos = [];
  for (const line of lines) {
    const pts = line.map(([lo, la]) => rproj(lo, la)), n = pts.length, segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[(i + 1) % n], dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz) || 1, nx = -dz / l * w, nz = dx / l * w;
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
  'Petrogrado': [30.31, 59.94], 'Moscú': [37.62, 55.75], 'Kiev': [30.52, 50.45], 'Varsovia': [21.01, 52.23], 'Riga': [24.11, 56.95], 'Helsinki': [24.94, 60.17],
  'Minsk': [27.56, 53.9], 'Brest-Litovsk': [23.69, 52.1], 'Odesa': [30.73, 46.48], 'Sebastopol': [33.52, 44.6], 'Tiflis': [44.79, 41.72], 'Bakú': [49.87, 40.41],
  'Ekaterimburgo': [60.6, 56.84], 'Omsk': [73.37, 54.99], 'Irkutsk': [104.3, 52.29], 'Vladivostok': [131.89, 43.12], 'Arcángel': [40.54, 64.54],
  'Múrmansk': [33.08, 68.97], 'Kronstadt': [29.77, 59.99], 'Pskov': [28.33, 57.82], 'Tsaritsin': [44.51, 48.71], 'Samara': [50.15, 53.2], 'Kazán': [49.12, 55.79],
  'Oriol': [36.06, 52.97], 'Berlín': [13.4, 52.52], 'Viena': [16.37, 48.21], 'Mogilev': [30.33, 53.9], 'Port Arthur': [121.25, 38.8], 'Tokio': [139.69, 35.69],
  'Constantinopla': [28.98, 41.01], 'Zúrich': [8.54, 47.37], 'Estocolmo': [18.07, 59.33], 'Sassnitz': [13.64, 54.52], 'Tornio': [24.15, 65.85], 'Luga': [29.85, 58.74], 'Novorosíisk': [37.77, 44.72], 'Chita': [113.5, 52.03], 'Jabárovsk': [135.07, 48.48], 'Cheliábinsk': [61.4, 55.16],
};
// Trans-Siberian railway (simplified) and the main pre-war line St Petersburg - Moscow.
export const TRANSSIB = [[37.62, 55.75], [39.9, 57.63], [44.0, 56.33], [49.12, 55.79], [56.25, 58.0], [60.6, 56.84], [65.53, 57.15], [69.0, 56.1], [73.37, 54.99],
  [76.0, 55.1], [82.92, 55.03], [87.1, 55.3], [92.87, 56.01], [97.0, 56.0], [104.3, 52.29], [107.6, 51.83], [113.5, 52.03], [118.0, 51.4], [124.0, 52.5],
  [128.0, 49.5], [132.0, 48.0], [135.07, 48.48], [134.0, 46.0], [132.5, 44.5], [131.89, 43.12]];

export function russiaMap({ light = 'day', period = 1914 } = {}) {
  const night = light === 'night';
  const s = stage({ groundA: null, skyTop: night ? '#0b1020' : '#4a6fa8', skyHor: night ? '#1d2840' : '#cfe0ea', fog: night ? ['#1d2840', 120, 420] : ['#cfe0ea', 120, 420],
    sunPos: [10, 30, 16], sun: night ? 1.1 : 2.2, hemi: night ? 0.75 : 1.3, shadow: 60 });
  const g = new THREE.Group(); s.add(g); s.mapGroup = g;
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ color: COL.sea, roughness: 0.6 })); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.02; g.add(sea);
  g.add(slab(RD.land, 0, 0.05, COL.land));
  s.groups = {};
  for (const gr of RD.groups) {
    const main = RUS_EMPIRE.includes(gr.id) || AUH.includes(gr.id) || ['deu', 'kal', 'ppol', 'tur', 'rou'].includes(gr.id);
    const m = slab(gr.polys, 0.0, main ? H : NH, COL.other); m.castShadow = false; g.add(m);
    s.groups[gr.id] = { mesh: m, mat: m.material, lab: gr.lab, area: gr.area };
  }
  for (const lk of RD.lakes) { const m = slab(lk.polys, 0, H + 0.006, COL.sea); m.material.roughness = 0.5; g.add(m); }
  s.rivers = ribbons(RD.rivers.map(r => r.line), 0.035, H + 0.008, COL.river, { opacity: 0.85 }); g.add(s.rivers);
  // borders for each period: an edge is drawn only when its two sides belong to different states
  s.borders = {};
  const coast = RD.arcs.filter(a => !a.b).map(a => a.line);
  g.add(ribbons(coast, 0.03, H + 0.012, COL.coast, { opacity: 0.75 }));
  for (const per of Object.keys(PERIODS)) {
    const lines = RD.arcs.filter(a => a.b && stateOf(per, a.a) !== stateOf(per, a.b)).map(a => a.line);
    const thick = RD.arcs.filter(a => a.b && (stateOf(per, a.a).match(/^(RUE|SOV|USSR)$/) || stateOf(per, a.b).match(/^(RUE|SOV|USSR)$/)) && stateOf(per, a.a) !== stateOf(per, a.b)).map(a => a.line);
    const grp = new THREE.Group();
    grp.add(ribbons(lines, 0.035, H + 0.014, COL.stateLine, { opacity: 0.85 }));
    grp.add(ribbons(thick, 0.07, H + 0.016, '#4a3424', { joints: true, opacity: 1 }));
    grp.visible = false; g.add(grp); s.borders[per] = grp;
  }
  s.dots = {};
  for (const [n, [lo, la]] of Object.entries(CITY)) {
    const d = new THREE.Group(); const [x, , z] = rpos(lo, la);
    d.add(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 18), new THREE.MeshBasicMaterial({ color: '#f7f1e3' })));
    d.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 18), new THREE.MeshBasicMaterial({ color: '#2b2622' })));
    d.position.set(x, H + 0.04, z); d.visible = false; g.add(d); s.dots[n] = d;
  }
  // Trans-Siberian: dark band + light dashes, revealed with drawRange
  const tsBand = ribbons([TRANSSIB], 0.07, H + 0.02, '#3b3631', { joints: true }); const tsDash = [];
  for (let i = 0; i < TRANSSIB.length - 1; i++) { const [a, b] = [TRANSSIB[i], TRANSSIB[i + 1]]; for (let k = 0; k < 4; k += 2) tsDash.push([[a[0] + (b[0] - a[0]) * k / 4, a[1] + (b[1] - a[1]) * k / 4], [a[0] + (b[0] - a[0]) * (k + 1) / 4, a[1] + (b[1] - a[1]) * (k + 1) / 4]]); }
  const tsD = ribbons(tsDash, 0.022, H + 0.024, '#f3ead6');
  s.transsib = new THREE.Group(); s.transsib.add(tsBand, tsD); g.add(s.transsib);
  s.transsib.set = p => { p = clamp(p); s.transsib.visible = p > 0.001; tsBand.geometry.setDrawRange(0, Math.floor(p * (TRANSSIB.length - 1)) * (6 + 24)); tsD.geometry.setDrawRange(0, Math.floor(p * tsDash.length) * 6); };
  s.transsib.set(0);
  // colouring: paint(period) once per frame, optionally blending to another period, then tint() highlights
  const tmp = new THREE.Color();
  s.paint = (per, to = null, k = 0) => {
    for (const [id, gr] of Object.entries(s.groups)) {
      gr.mat.color.set(colorOf(stateOf(per, id)));
      if (to && k > 0) gr.mat.color.lerp(tmp.set(colorOf(stateOf(to, id))), clamp(k));
    }
    for (const [p, b] of Object.entries(s.borders)) b.visible = false;
    const bp = to && k > 0.5 ? to : per; s.borders[bp].visible = true;
  };
  s.tint = (id, color, k = 1, amt = 0.8) => { const gr = s.groups[id]; if (!gr || k <= 0) return; gr.mat.color.lerp(tmp.set(color), amt * clamp(k)); };
  s.tintState = (per, st, color, k = 1, amt = 0.8) => { for (const id of Object.keys(s.groups)) if (stateOf(per, id) === st || (st === 'LOST' && stateOf(per, id).startsWith('LOST_'))) s.tint(id, color, k, amt); };
  s.groupsOf = (per, st) => Object.keys(s.groups).filter(id => stateOf(per, id) === st);
  s.paint(period);
  return s;
}
// Pulsing ring at a lon/lat.
export function pulse(s, lon, lat, color = '#c0392b', size = 1) {
  const g = new THREE.Group(); const [x, , z] = rpos(lon, lat); g.position.set(x, H + 0.03, z); s.add(g);
  const ring = F.ring(color, 0.6 * size); g.add(ring);
  const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * size, 0.2 * size, 0.06, 20), new THREE.MeshBasicMaterial({ color })); g.add(dot);
  g.update = (t, t0, t1 = 1e9) => { const k = t - t0; g.visible = k > 0 && t < t1; if (!g.visible) return; const rk = (k % 1.4) / 1.4; ring.scale.setScalar(0.6 + rk * 2.6); ring.material.opacity = 0.85 * (1 - rk); dot.scale.setScalar(clamp(k / 0.3)); };
  g.visible = false; return g;
}
// Soft translucent polygon (an area of control) drawn over the map; zone.set(k) fades it in.
export function zone(s, ring, color, { opacity = 0.5, y = H + 0.03 } = {}) {
  const sh = new THREE.Shape(ring.map(([lo, la]) => new THREE.Vector2(...rproj(lo, la))));
  const geo = new THREE.ShapeGeometry(sh, 24); geo.rotateX(Math.PI / 2);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
  m.position.y = y; m.renderOrder = 3; s.add(m);
  m.set = k => { m.visible = k > 0.001; m.material.opacity = opacity * clamp(k); };
  m.set(0); return m;
}
// Outlined arrow following lon/lat waypoints; arrow.set(p) reveals it.
export function arrow(s, path, color, width = 0.5, y = H + 0.08) {
  const pts = path.map(([lo, la]) => { const [x, z] = rproj(lo, la); return new THREE.Vector3(x, y, z); });
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
export function city(ctx, s, name, k = 1, cls = 'c', text = name) { const d = s.dots[name]; if (d) d.visible = k > 0.01; const [lo, la] = CITY[name]; return label(ctx, rpos(lo, la, H + 0.35), text, cls, k); }
export function areaLabel(ctx, lon, lat, text, k = 1, cls = 'st') { return label(ctx, rpos(lon, lat, H + 0.05), text, cls, k); }
// Rich chip at a lon/lat: title + one line of detail, with a coloured underline.
export function chip(ctx, lo, la, k, title, sub = '', col = '#c0392b', dy = 0.35) {
  if (k <= 0) return ''; const [x, y, ok] = ctx.project(rpos(lo, la, H + dy)); if (!ok) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-100%) scale(${0.8 + 0.2 * k});opacity:${k};text-align:center;padding:7px 14px 8px;border-radius:12px;background:rgba(20,22,28,.9);border-bottom:4px solid ${col};box-shadow:0 8px 24px rgba(0,0,0,.35);white-space:nowrap">
    <div style="font:900 24px 'Inter Display',Inter;color:#fff">${title}</div>${sub ? `<div style="font:700 17px Inter;color:#e6e0d4;margin-top:2px">${sub}</div>` : ''}</div>`;
}
