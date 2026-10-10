// Stylized 3D map of Europe (Natural Earth 1:50m via world-atlas), with animated territory colors and arrows.
import * as THREE from 'three';
import { clamp, ss } from './util.js';

const LON0 = 15, LAT0 = 52, K = 0.7, COS = Math.cos(LAT0 * Math.PI / 180);
const BOX = { lon: [-13, 58], lat: [33, 71.5] };
export const proj = (lon, lat) => [(lon - LON0) * K * COS, -(lat - LAT0) * K];

// Minimal TopoJSON decoder (quantized + delta-encoded arcs).
function decodeTopo(topo, objName) {
  const { scale: [sx, sy], translate: [tx, ty] } = topo.transform;
  const arcs = topo.arcs.map(a => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; }); });
  const arc = i => (i >= 0 ? arcs[i] : arcs[~i].slice().reverse());
  const ring = r => r.flatMap((i, k) => { const a = arc(i); return k ? a.slice(1) : a; });
  return topo.objects[objName].geometries.map(g => ({
    name: g.properties.name,
    polys: g.type === 'Polygon' ? [g.arcs.map(ring)] : g.type === 'MultiPolygon' ? g.arcs.map(p => p.map(ring)) : [],
  }));
}

// Country groups used for WWII-era coloring (modern borders, simplified).
export const GROUPS = {
  germany: ['Germany', 'Austria', 'Czechia'],
  poland: ['Poland'], france: ['France'], uk: ['United Kingdom'],
  benelux: ['Belgium', 'Netherlands', 'Luxembourg'],
  ussr: ['Russia', 'Ukraine', 'Belarus', 'Moldova', 'Lithuania', 'Latvia', 'Estonia', 'Georgia', 'Armenia', 'Azerbaijan', 'Kazakhstan'],
  italy: ['Italy'], nordic_occ: ['Norway', 'Denmark'],
  balkans: ['Serbia', 'Croatia', 'Slovenia', 'Bosnia and Herz.', 'Montenegro', 'Macedonia', 'North Macedonia', 'Kosovo', 'Greece', 'Albania'],
  axis_minor: ['Hungary', 'Romania', 'Bulgaria', 'Slovakia', 'Finland'],
  neutral: ['Spain', 'Portugal', 'Switzerland', 'Sweden', 'Ireland', 'Turkey', 'Iceland'],
};
export const COLORS = {
  axis: '#5b5f66', occupied: '#8f949c', axis_minor: '#9b9a86', allies: '#4d7fc4', ussr: '#c0453a', neutral: '#d9cfb3', other: '#c9c1a8',
  usa: '#3f9d5a',
};

// Sutherland-Hodgman clip of a lon/lat ring to the map box; rings crossing the antimeridian are dropped.
function clipRing(ring) {
  const lons = ring.map(p => p[0]);
  if (Math.max(...lons) - Math.min(...lons) > 180) ring = ring.filter(p => p[0] > -60);
  let out = ring;
  const edges = [[p => p[0] >= BOX.lon[0], (a, b) => cut(a, b, 0, BOX.lon[0])], [p => p[0] <= BOX.lon[1], (a, b) => cut(a, b, 0, BOX.lon[1])],
    [p => p[1] >= BOX.lat[0], (a, b) => cut(a, b, 1, BOX.lat[0])], [p => p[1] <= BOX.lat[1], (a, b) => cut(a, b, 1, BOX.lat[1])]];
  function cut(a, b, ax, v) { const k = (v - a[ax]) / (b[ax] - a[ax]); return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; }
  for (const [inside, inter] of edges) {
    const inp = out; out = [];
    for (let i = 0; i < inp.length; i++) {
      const cur = inp[i], prev = inp[(i + inp.length - 1) % inp.length];
      if (inside(cur)) { if (!inside(prev)) out.push(inter(prev, cur)); out.push(cur); }
      else if (inside(prev)) out.push(inter(prev, cur));
    }
    if (!out.length) return [];
  }
  return out;
}

let topoCache = null;
export async function loadMapData() {
  if (!topoCache) topoCache = await (await fetch('/node_modules/world-atlas/countries-50m.json')).json();
  return topoCache;
}

export function buildMap(topo, { height = 0.22 } = {}) {
  const group = new THREE.Group();
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(140, 110), new THREE.MeshStandardMaterial({ color: '#7fb3d5', roughness: 0.6 }));
  sea.rotation.x = -Math.PI / 2; sea.position.y = -0.02; sea.receiveShadow = true; group.add(sea);
  const countries = {};
  const lineMat = new THREE.LineBasicMaterial({ color: '#2f3135', transparent: true, opacity: 0.55 });
  for (const c of decodeTopo(topo, 'countries')) {
    const shapes = [], outlines = [];
    for (const poly of c.polys) {
      const outer = clipRing(poly[0]);
      if (outer.length < 3) continue;
      const pts = r => r.map(([lo, la]) => { const [x, z] = proj(lo, la); return new THREE.Vector2(x, z); });
      const sh = new THREE.Shape(pts(outer));
      for (const h of poly.slice(1)) { const hc = clipRing(h); if (hc.length >= 3) sh.holes.push(new THREE.Path(pts(hc))); }
      shapes.push(sh); outlines.push(pts(outer));
    }
    if (!shapes.length) continue;
    const geo = new THREE.ExtrudeGeometry(shapes, { depth: height, bevelEnabled: false });
    geo.rotateX(Math.PI / 2); geo.translate(0, height, 0);   // shape y -> world z, extrude upward
    const mat = new THREE.MeshStandardMaterial({ color: COLORS.other, roughness: 0.85, flatShading: true, side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; m.castShadow = true; group.add(m);
    for (const o of outlines) {
      const lg = new THREE.BufferGeometry().setFromPoints(o.map(v => new THREE.Vector3(v.x, height + 0.005, v.y)));
      group.add(new THREE.LineLoop(lg, lineMat));
    }
    countries[c.name] = { mesh: m, mat, base: new THREE.Color(COLORS.other) };
  }
  return { group, countries, height };
}

// Territory timeline: events [{t, names:[...], color}] (later events win); colors fade over 0.7s.
export function paint(map, events, t) {
  const col = {}, prev = {};
  for (const e of events) {
    for (const n of e.names) {
      if (t >= e.t) { prev[n] = col[n] ? { c: col[n].c, t: col[n].t } : null; col[n] = { c: e.color, t: e.t }; }
    }
  }
  const A = new THREE.Color(), B = new THREE.Color();
  for (const [n, c] of Object.entries(map.countries)) {
    const cur = col[n];
    if (!cur) { c.mat.color.copy(c.base); continue; }
    const k = ss(cur.t, cur.t + 0.7, t);
    A.set(prev[n] ? prev[n].c : '#' + c.base.getHexString()); B.set(cur.c);
    c.mat.color.copy(A).lerp(B, k);
  }
}
export const expand = names => names.flatMap(n => GROUPS[n] || [n]);

// Animated arrow along a lon/lat path. Reveal with arrow.set(progress 0..1).
export function arrow(path, color = '#d23a2a', width = 0.9, y = 0.5, xz = false) {
  const pts = path.map(([lo, la]) => xz ? new THREE.Vector3(lo, y, la) : new THREE.Vector3(proj(lo, la)[0], y, proj(lo, la)[1]));
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const N = 80, P = curve.getSpacedPoints(N), pos = [];
  for (let i = 0; i <= N; i++) {
    const tg = curve.getTangentAt(i / N), nx = -tg.z, nz = tg.x, l = Math.hypot(nx, nz) || 1, w = width / 2 * (0.75 + 0.25 * i / N);
    pos.push(P[i].x + nx / l * w, y, P[i].z + nz / l * w, P[i].x - nx / l * w, y, P[i].z - nz / l * w);
  }
  const idx = []; for (let i = 0; i < N; i++) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.92, depthWrite: false });
  const body = new THREE.Mesh(g, mat); body.renderOrder = 3;
  const hs = new THREE.Shape([new THREE.Vector2(0, width * 1.25), new THREE.Vector2(-width * 1.0, -width * 0.2), new THREE.Vector2(width * 1.0, -width * 0.2)]);
  const head = new THREE.Mesh(new THREE.ShapeGeometry(hs), mat); head.renderOrder = 3;
  const grp = new THREE.Group(); grp.add(body, head);
  grp.set = p => {
    p = clamp(p); grp.visible = p > 0.001;
    g.setDrawRange(0, Math.floor(p * N) * 6);
    const tip = curve.getPointAt(Math.max(0.001, p)), tg = curve.getTangentAt(Math.max(0.001, p));
    head.position.set(tip.x, y + 0.002, tip.z);
    head.rotation.set(-Math.PI / 2, 0, Math.atan2(-tg.x, -tg.z));
  };
  grp.set(0);
  return grp;
}
