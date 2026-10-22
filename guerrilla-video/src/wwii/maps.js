// Maps for the Second World War video.
// Europe 1938-45 reuses the WW1 province map (europe1914.json, Lambert conic) with new periods and colours: Axis in
// slate, Axis-occupied in grey, the Allies in blues, the USSR in red, neutrals in sand.
// The world map (Natural Earth 1:50m, equirectangular) can be centred on any longitude, so the Pacific stays whole.
import * as THREE from 'three';
import * as EU from '../ww1/wmap.js';
import { stage } from '../lib/stage.js';
import { label } from '../lib/kit.js';
import { ss, clamp } from '../lib/util.js';
import { flagTex } from '../whatif/flags.js';
export { EU };

// ------------------------------------------------------------ Europe
const asg = (list, st) => Object.fromEntries(list.map(g => [g, st]));
const SOV = ['rus', 'ukr', 'blr', 'tnr', 'cau', 'casia'];
const w1938 = { ...asg(['deu', 'gpol', 'kal', 'aut'], 'X_GER'), ...asg(['ita', 'tren', 'gor', 'svnw', 'ist', 'lby'], 'X_ITA'),
  ...asg(['gbr', 'cyp', 'mlt', 'kwt', 'pal', 'jor', 'irq', 'egy'], 'A_GBR'), ...asg(['fra', 'als', 'tun', 'dza', 'mar', 'syr', 'lbn'], 'A_FRA'),
  ...asg(['ppol', 'cpol', 'apol', 'egal', 'vol', 'wblr', 'vil'], 'A_POL'), ...asg(['cze', 'svk', 'tcp'], 'TCH'), ...asg(SOV, 'SOV') };
const w1939 = { ...w1938, cze: 'X_GER', mem: 'X_GER', svk: 'X_AXM', tcp: 'X_AXM', alb: 'X_ITA' };
const w1939b = { ...w1939, ...asg(['ppol', 'cpol', 'apol'], 'X_OCC'), ...asg(['egal', 'vol', 'wblr'], 'SOV') };
const w1940 = { ...w1939b, ...asg(['nld', 'bel', 'lux', 'dnk', 'nsch', 'nor', 'fra'], 'X_OCC'), als: 'X_GER', ...asg(['est', 'lva', 'ltu', 'vil', 'mda', 'buk'], 'SOV') };
const w1941 = { ...w1940, ...asg(['hun', 'rou', 'trs', 'sdob', 'bgr', 'svk', 'tcp', 'fin'], 'X_AXM'), ...asg(['svn', 'hrv', 'bih', 'srb', 'mne', 'voj', 'grc', 'wthr'], 'X_OCC'),
  ...asg(['est', 'lva', 'ltu', 'vil', 'wblr', 'blr', 'ukr', 'egal', 'vol', 'mda', 'buk'], 'X_OCC') };
const w1942 = { ...w1941, tnr: 'X_OCC', tun: 'X_OCC' };
const w1944 = { ...w1942, ...asg(['fra', 'als', 'bel', 'lux', 'tun'], 'A_FRA'), ...asg(['ukr', 'blr', 'est', 'lva', 'ltu', 'vil', 'mda', 'buk', 'egal', 'vol', 'wblr', 'tnr'], 'SOV'),
  ...asg(['rou', 'trs', 'sdob', 'bgr'], 'SOV'), fin: 'own', grc: 'A_OTH', ita: 'A_OTH', lby: 'A_GBR' };
const w1945 = { ...w1944, ...asg(['deu', 'gpol', 'kal', 'aut', 'als'], 'OCCALL'), als: 'A_FRA', ...asg(['ppol', 'cpol', 'apol', 'cze', 'svk', 'hun', 'srb', 'hrv', 'bih', 'svn', 'mne', 'voj'], 'SOVZ'),
  ...asg(['nld', 'dnk', 'nsch', 'nor'], 'A_OTH'), ...asg(['tren', 'gor', 'svnw', 'ist'], 'A_OTH') };
Object.assign(EU.PERIODS, { w1938, w1939, w1939b, w1940, w1941, w1942, w1944, w1945 });
Object.assign(EU.COL, {
  X_GER: '#4b5059', X_OCC: '#9097a0', X_ITA: '#6c7660', X_AXM: '#8e927e', OCCALL: '#a9b6c4', SOVZ: '#d99a8c',
  A_GBR: '#3f6fb5', A_FRA: '#5f8fd6', A_POL: '#7aa6e6', A_OTH: '#89aee0', TCH: '#b9b2d6', SOV: '#c0453a',
});
Object.assign(EU.CITY, {
  'Dunkerque': [2.38, 51.03], 'Stalingrado': [44.5, 48.7], 'Leningrado': [30.31, 59.94], 'Kursk': [36.19, 51.73], 'El Alamein': [28.95, 30.83],
  'Normandía': [-0.6, 49.35], 'Múnich': [11.58, 48.14], 'Auschwitz': [19.2, 50.03], 'Núremberg': [11.08, 49.45], 'Yalta': [34.16, 44.5],
  'Sicilia': [14.1, 37.5], 'Ardenas': [5.6, 50.05], 'Viena': [16.37, 48.21], 'Praga': [14.42, 50.08], 'Varsovia': [21.01, 52.23], 'Oslo': [10.75, 59.91],
  'Copenhague': [12.57, 55.68], 'Bruselas': [4.35, 50.85], 'Atenas': [23.73, 37.98], 'Belgrado': [20.46, 44.82], 'Kiev': [30.52, 50.45], 'Tobruk': [23.96, 32.08],
});
export const NAME = { X_GER: 'ALEMANIA', X_ITA: 'ITALIA', A_GBR: 'REINO UNIDO', A_FRA: 'FRANCIA', A_POL: 'POLONIA', SOV: 'UNIÓN SOVIÉTICA', TCH: 'CHECOSLOVAQUIA' };
export async function preload() { await EU.preload(); await preloadWorld(); }
export function europe(o = {}) { const s = EU.europeMap({ period: 'w1938', ...o }); s.userData.near = 0.5; return s; }
// Eastern front lines (lon, lat) and the farthest German advance.
export const EAST = {
  dec1941: [[30.3, 59.7], [32.0, 58.6], [33.5, 57.2], [35.5, 56.3], [36.8, 55.5], [37.3, 54.4], [36.8, 52.8], [37.5, 51.6], [38.5, 49.8], [39.2, 48.2], [38.9, 47.2]],
  nov1942: [[30.3, 59.7], [32.0, 58.6], [33.5, 57.2], [34.4, 56.0], [35.2, 55.0], [36.4, 53.8], [37.0, 52.2], [38.8, 51.2], [41.0, 49.8], [43.4, 49.3], [44.5, 48.7], [44.0, 46.8], [43.8, 44.6], [42.0, 43.2]],
  aug1943: [[30.3, 59.7], [31.8, 58.4], [31.2, 56.2], [32.8, 54.9], [34.5, 53.4], [35.6, 52.0], [36.4, 50.4], [37.6, 49.0], [38.4, 47.6], [37.6, 46.6], [35.2, 46.0]],
  jan1945: [[21.0, 55.2], [21.6, 54.2], [21.0, 52.3], [21.4, 51.0], [21.0, 49.8], [19.6, 48.6], [19.0, 47.5], [18.6, 46.0]],
};
// Area held by the Axis in the USSR at its peak (Nov 1942): drawn as a translucent zone over 'rus'.
export const AXIS_RUS_1942 = [[28.0, 59.5], [30.3, 59.7], [32.0, 58.6], [33.5, 57.2], [34.4, 56.0], [35.2, 55.0], [36.4, 53.8], [37.0, 52.2], [38.8, 51.2], [41.0, 49.8],
  [43.4, 49.3], [44.5, 48.7], [44.0, 46.8], [43.8, 44.6], [42.0, 43.2], [38.5, 44.6], [37.5, 46.6], [33.0, 46.1], [32.0, 50.0], [31.5, 52.2], [30.8, 54.0], [28.6, 56.1], [27.8, 57.8]];

// ------------------------------------------------------------ world map (centred on a chosen longitude)
let TOPO = null;
async function preloadWorld() { if (!TOPO) TOPO = await (await fetch('/node_modules/world-atlas/countries-50m.json')).json(); }
export const K = 0.55;
export const LAND = '#e9e2cf', SEA = '#86b4cc';
function decode(topo) {
  const { scale: [sx, sy], translate: [tx, ty] } = topo.transform;
  const arcs = topo.arcs.map(a => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; }); });
  const arc = i => (i >= 0 ? arcs[i] : arcs[~i].slice().reverse());
  const ring = r => r.flatMap((i, k) => { const a = arc(i); return k ? a.slice(1) : a; });
  return topo.objects.countries.geometries.map(g => ({ name: g.properties.name,
    polys: g.type === 'Polygon' ? [g.arcs.map(ring)] : g.type === 'MultiPolygon' ? g.arcs.map(p => p.map(ring)) : [] }));
}
export function world({ center = 0, light = 'day' } = {}) {
  const night = light === 'night';
  const s = stage({ groundA: null, skyTop: night ? '#0b1020' : '#4a6fa8', skyHor: night ? '#1d2840' : '#d7e4ea', fog: night ? ['#1d2840', 140, 380] : ['#d7e4ea', 140, 380],
    sunPos: [20, 60, 30], sun: night ? 1.0 : 2.0, hemi: night ? 0.7 : 1.4, shadow: 110 });
  s.userData.near = 0.5; s.center = center;
  const wrapLon = lo => { let l = lo; while (l < center - 180) l += 360; while (l >= center + 180) l -= 360; return l; };
  s.pos = (lon, lat, y = 0.25) => [wrapLon(lon) * K, y, -lat * K];
  const g = new THREE.Group(); s.add(g);
  const seaTex = (() => { const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const x = c.getContext('2d');
    const gr = x.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, night ? '#1a2a40' : '#7fb0c9'); gr.addColorStop(0.5, night ? '#20324c' : '#8fbdd3'); gr.addColorStop(1, night ? '#182638' : '#7aa9c2'); x.fillStyle = gr; x.fillRect(0, 0, 1024, 512);
    x.strokeStyle = 'rgba(255,255,255,0.16)'; x.lineWidth = 1.5; for (let i = 0; i <= 12; i++) { const px = i / 12 * 1024; x.beginPath(); x.moveTo(px, 0); x.lineTo(px, 512); x.stroke(); }
    for (let i = 0; i <= 6; i++) { const py = i / 6 * 512; x.beginPath(); x.moveTo(0, py); x.lineTo(1024, py); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(360 * K, 180 * K), new THREE.MeshStandardMaterial({ map: seaTex, roughness: 0.7 }));
  sea.rotation.x = -Math.PI / 2; sea.position.set(center * K, -0.02, 0); sea.receiveShadow = true; g.add(sea);
  const big = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshStandardMaterial({ color: night ? '#182638' : '#7fb0c9', roughness: 0.8 })); big.rotation.x = -Math.PI / 2; big.position.y = -0.05; g.add(big);
  s.countries = {};
  const edgeMat = new THREE.LineBasicMaterial({ color: '#8a7f68', transparent: true, opacity: 0.55 });
  for (const c of decode(TOPO)) {
    const shapes = [], pts = [];
    for (const poly of c.polys) {
      if (poly[0].every(([, la]) => la < -58)) continue;   // Antarctica
      // wrap each ring as a whole around its mean longitude so countries never tear across the seam
      const rings = poly.map(r => { const lons = r.map(p => p[0]); let fixed = Math.max(...lons) - Math.min(...lons) > 180 ? r.map(([lo, la]) => [lo < 0 ? lo + 360 : lo, la]) : r;
        const mean = fixed.reduce((a, p) => a + p[0], 0) / fixed.length, sh = wrapLon(mean) - mean; return fixed.map(([lo, la]) => [lo + sh, la]); });
      const sh = new THREE.Shape(rings[0].map(([lo, la]) => new THREE.Vector2(lo * K, la * K)));
      for (const h of rings.slice(1)) sh.holes.push(new THREE.Path(h.map(([lo, la]) => new THREE.Vector2(lo * K, la * K))));
      shapes.push(sh);
      for (const r of rings) for (let i = 0; i < r.length - 1; i++) pts.push(r[i][0] * K, 0.215, -r[i][1] * K, r[i + 1][0] * K, 0.215, -r[i + 1][1] * K);
    }
    if (!shapes.length) continue;
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); const edges = new THREE.LineSegments(lg, edgeMat); g.add(edges);
    const geo = new THREE.ExtrudeGeometry(shapes, { depth: 0.2, bevelEnabled: false }); geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshStandardMaterial({ color: LAND, roughness: 0.92 });
    const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; m.castShadow = true; g.add(m);
    s.countries[c.name] = { mesh: m, mat, base: LAND, edges };
  }
  s.keep = names => names.forEach(n => { const c = s.countries[n]; if (c) { c.mesh.userData.dynamic = true; c.edges.userData.dynamic = true; } });
  s.paint = (name, color, k = 1, lift = 0.12) => { const c = s.countries[name]; if (!c) return; c.mat.color.set(c.base).lerp(new THREE.Color(color), clamp(k)); c.mesh.position.y = lift * clamp(k); c.edges.position.y = c.mesh.position.y; };
  return s;
}
// Translucent area (lon/lat ring) over the world map.
export function wzone(s, ring, color, { opacity = 0.5, y = 0.36 } = {}) {
  const sh = new THREE.Shape(ring.map(([lo, la]) => { const [x, , z] = s.pos(lo, la); return new THREE.Vector2(x, -z); }));
  const geo = new THREE.ShapeGeometry(sh, 24); geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
  m.position.y = y; m.renderOrder = 3; m.userData.dynamic = true; s.add(m);
  m.set = k => { m.visible = k > 0.001; m.material.opacity = opacity * clamp(k); }; m.set(0); return m;
}
// Arrow along lon/lat waypoints over the world map; arrow.set(p) reveals it.
export function warrow(s, path, color, width = 1.0, y = 0.42) {
  const pts = path.map(([lo, la]) => { const [x, , z] = s.pos(lo, la); return new THREE.Vector3(x, y, z); });
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal'), N = 120, S = curve.getSpacedPoints(N);
  const mk = (w, col, dy, ro) => { const pos = [];
    for (let i = 0; i <= N; i++) { const tg = curve.getTangentAt(i / N), nx = -tg.z, nz = tg.x, l = Math.hypot(nx, nz) || 1, ww = w / 2 * (0.7 + 0.3 * i / N);
      pos.push(S[i].x + nx / l * ww, y + dy, S[i].z + nz / l * ww, S[i].x - nx / l * ww, y + dy, S[i].z - nz / l * ww); }
    const idx = []; for (let i = 0; i < N; i++) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide, depthWrite: false })); m.renderOrder = ro; return m; };
  const outline = mk(width + 0.3, '#fbf5e6', 0, 4), body = mk(width, color, 0.002, 5);
  const head = (w, col, ro) => { const m = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0, w * 1.3), new THREE.Vector2(-w * 1.05, -w * 0.25), new THREE.Vector2(w * 1.05, -w * 0.25)])),
    new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide, depthWrite: false })); m.renderOrder = ro; return m; };
  const hO = head(width + 0.28, '#fbf5e6', 4), hB = head(width, color, 5);
  const grp = new THREE.Group(); grp.add(outline, body, hO, hB); grp.userData.dynamic = true; s.add(grp);
  grp.set = p => { p = clamp(p); grp.visible = p > 0.001; const n = Math.floor(p * N) * 6; outline.geometry.setDrawRange(0, n); body.geometry.setDrawRange(0, n);
    const tip = curve.getPointAt(Math.max(0.001, p)), tg = curve.getTangentAt(Math.max(0.001, p)), rot = Math.atan2(-tg.x, -tg.z);
    hO.position.set(tip.x - tg.x * 0.08, y + 0.001, tip.z - tg.z * 0.08); hO.rotation.set(-Math.PI / 2, 0, rot); hB.position.set(tip.x, y + 0.003, tip.z); hB.rotation.set(-Math.PI / 2, 0, rot); };
  grp.set(0); return grp;
}
// Flag pin on the world map (pops up with .set(k)).
export function wpin(s, lon, lat, code, { h = 3.0, w = 2.0 } = {}) {
  const g = new THREE.Group(); const [x, , z] = s.pos(lon, lat, 0); g.position.set(x, 0.2, z); s.add(g); g.userData.dynamic = true;
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, h, 8), new THREE.MeshStandardMaterial({ color: '#f2efe6', metalness: 0.3, roughness: 0.4 })).translateY(h / 2));
  g.add(new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), new THREE.MeshStandardMaterial({ color: '#c0392b', roughness: 0.4 })).translateY(h + 0.06));
  const f = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 2 / 3), new THREE.MeshStandardMaterial({ map: flagTex(code), side: THREE.DoubleSide, roughness: 0.8 })); f.position.set(w / 2 + 0.05, h - w / 3, 0); g.add(f);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.set = k => { g.visible = k > 0.001; g.scale.set(1, Math.max(0.001, 1 - Math.pow(1 - clamp(k), 3)), 1); }; g.set(0); return g;
}
// Pulsing burst (explosion marker) on the world map.
export function wburst(s, lon, lat, color = '#ff7a2a', size = 1) {
  const g = new THREE.Group(); const [x, , z] = s.pos(lon, lat, 0.4); g.position.set(x, 0.4, z); s.add(g); g.userData.dynamic = true;
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.1, 32), new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; g.add(ring);
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), new THREE.MeshBasicMaterial({ color: '#fff2c8', transparent: true, depthWrite: false })); dot.rotation.x = -Math.PI / 2; dot.position.y = 0.01; g.add(dot);
  g.scale.setScalar(size);
  g.update = (t, t0, t1 = 1e9) => { const k = t - t0; g.visible = k > 0 && t < t1; if (!g.visible) return; const rk = (k % 1.2) / 1.2; ring.scale.setScalar(0.6 + rk * 2.2); ring.material.opacity = 0.9 * (1 - rk); dot.material.opacity = 0.6 + 0.4 * Math.sin(k * 9); };
  g.visible = false; return g;
}
export const wlabel = (ctx, s, lon, lat, text, k = 1, cls = 'st', y = 0.6) => label(ctx, s.pos(lon, lat, y), text, cls, k);
// The Japanese empire at its height (mid-1942), as a lon/lat ring over Asia and the Pacific.
export const JAPAN_1942 = [[122, 53], [135, 50], [145, 51], [156, 50], [165, 51], [178, 52], [180, 30], [167, 19], [175, 2], [160, -10], [148, -10], [140, -8], [130, -11], [118, -10], [105, -8],
  [95, 5], [92, 22], [98, 27], [105, 24], [110, 22], [113, 25], [116, 30], [113, 35], [112, 40], [116, 43], [118, 48]];
