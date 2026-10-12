// Map of Puebla for the Puebla video: 217 municipalities (INEGI 2022, coverage-simplified) extruded over the
// neighbouring states, with the Mexico–Veracruz highway, a schematic Pemex pipeline and city markers.
import * as THREE from 'three';
import { stage } from '../lib/stage.js';
import { label } from '../lib/kit.js';
import { ss, clamp } from '../lib/util.js';
import * as F from '../lib/fx.js';
import * as NM from '../narco/mapkit.js';

let PD = null;
export async function preload() { await NM.preload(); if (!PD) PD = await (await fetch('/src/puebla/puebla.json')).json(); }

export const LON0 = -97.85, LAT0 = 19.05, K = 6, COS = Math.cos(LAT0 * Math.PI / 180);
export const PH = 0.2, NH = 0.1; // Puebla / neighbours extrusion
export const pproj = (lon, lat) => [(lon - LON0) * K * COS, -(lat - LAT0) * K];
export const ppos = (lon, lat, y = PH) => { const [x, z] = pproj(lon, lat); return [x, y, z]; };
export const fade = (t, a, b, f = 0.35) => ss(a, a + f, t) * (1 - ss(b - f, b, t));
export { label };

export const CITY = {
  'Ciudad de México': [-99.13, 19.43], 'Puebla': [-98.198, 19.043], 'Veracruz': [-96.134, 19.18], 'Orizaba': [-97.1, 18.85],
  'Tehuacán': [-97.393, 18.462], 'Texmelucan': [-98.433, 19.285], 'Esperanza': [-97.367, 18.858], 'Atlixco': [-98.437, 18.908],
  'Tlaxcala': [-98.237, 19.318], 'Huauchinango': [-98.053, 20.176], 'Teziutlán': [-97.36, 19.817], 'Izúcar': [-98.47, 18.6],
};
// Autopista México–Puebla–Orizaba–Veracruz (150D), simplified.
export const HIGHWAY = [[-99.13, 19.43], [-98.95, 19.3], [-98.74, 19.34], [-98.56, 19.3], [-98.43, 19.28], [-98.37, 19.17], [-98.22, 19.06], [-98.05, 19.05],
  [-97.88, 19.0], [-97.74, 18.96], [-97.6, 18.9], [-97.45, 18.87], [-97.35, 18.85], [-97.22, 18.82], [-97.1, 18.84], [-96.93, 18.89], [-96.7, 18.98], [-96.45, 19.08], [-96.14, 19.18]];
// Pemex pipeline corridor through the Triángulo Rojo (schematic).
export const PIPELINE = [[-96.6, 18.72], [-97.0, 18.76], [-97.3, 18.79], [-97.52, 18.84], [-97.64, 18.94], [-97.8, 19.0], [-97.95, 19.04], [-98.08, 19.08],
  [-98.27, 19.15], [-98.43, 19.3], [-98.6, 19.36], [-98.82, 19.34], [-99.05, 19.38]];
export const TRIANGULO = ['Tepeaca', 'Acatzingo', 'Quecholac', 'Palmar de Bravo', 'Tecamachalco', 'Acajete'];
export const NEIGH_LABEL = { 'Veracruz': [-96.75, 19.75], 'Tlaxcala': [-98.15, 19.45], 'Hidalgo': [-98.75, 20.45], 'México': [-99.55, 19.75], 'Ciudad de México': [-99.15, 19.25],
  'Morelos': [-99.1, 18.75], 'Guerrero': [-99.5, 17.75], 'Oaxaca': [-97.0, 17.65] };

const COL = { pue: '#efe7d6', neigh: '#d9d3c5', land: '#d2ccbe', sea: '#8db6cd', muniLine: '#b8a98e', stateLine: '#9c8b6c', outline: '#5a4632' };

function shapesOf(polys) {
  return polys.map(poly => {
    const sh = new THREE.Shape(poly[0].map(([lo, la]) => new THREE.Vector2(...pproj(lo, la))));
    for (const h of poly.slice(1)) sh.holes.push(new THREE.Path(h.map(([lo, la]) => new THREE.Vector2(...pproj(lo, la)))));
    return sh;
  });
}
function slab(polys, y0, depth, color) {
  const geo = new THREE.ExtrudeGeometry(shapesOf(polys), { depth, bevelEnabled: false });
  geo.rotateX(Math.PI / 2); geo.translate(0, y0 + depth, 0);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.92, side: THREE.DoubleSide });
  const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; return m;
}
// Many closed rings as one flat ribbon mesh (with round-ish joints so thick outlines stay solid).
function ribbons(rings, w, y, color, { joints = false, opacity = 1, closed = true } = {}) {
  const pos = [];
  for (const ring of rings) {
    const pts = ring.map(([lo, la]) => pproj(lo, la)), n = pts.length, segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[(i + 1) % n], dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz) || 1, nx = -dz / l * w, nz = dx / l * w;
      pos.push(ax + nx, y, az + nz, ax - nx, y, az - nz, bx + nx, y, bz + nz, ax - nx, y, az - nz, bx - nx, y, bz - nz, bx + nx, y, bz + nz);
      if (joints) for (let k = 0; k < 8; k++) {   // round joint at the segment end (kept in path order so partial draws work)
        const a0 = k / 8 * Math.PI * 2, a1 = (k + 1) / 8 * Math.PI * 2;
        pos.push(bx, y, bz, bx + Math.cos(a1) * w, y, bz + Math.sin(a1) * w, bx + Math.cos(a0) * w, y, bz + Math.sin(a0) * w);
      }
    }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: opacity < 1, opacity, depthWrite: false }));
  m.renderOrder = 2; return m;
}

export function pueblaMap({ light = 'day' } = {}) {
  const night = light === 'night';
  const s = stage({ groundA: null, skyTop: night ? '#0b1020' : '#4a6fa8', skyHor: night ? '#1d2840' : '#cfe0ea', fog: night ? ['#1d2840', 60, 200] : ['#cfe0ea', 60, 200],
    sunPos: [6, 18, 10], sun: night ? 1.1 : 2.2, hemi: night ? 0.75 : 1.3, shadow: 30 });
  const g = new THREE.Group(); s.add(g); s.mapGroup = g;
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), new THREE.MeshStandardMaterial({ color: COL.sea, roughness: 0.6 })); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.02; g.add(sea);
  g.add(slab(PD.land, 0, 0.06, COL.land));
  s.states = {};
  for (const st of PD.states) { const m = slab(st.polys, 0.06, NH - 0.06, COL.neigh); g.add(m); s.states[st.name] = { mesh: m, mat: m.material, base: new THREE.Color(COL.neigh) }; }
  g.add(ribbons(PD.states.flatMap(st => st.polys.flatMap(p => p)), 0.03, NH + 0.004, COL.stateLine, { opacity: 0.8 }));
  s.munis = {};
  for (const mu of PD.munis) {
    const m = slab(mu.polys, 0.0, PH, COL.pue); m.castShadow = false; g.add(m);
    s.munis[mu.name] = { mesh: m, mat: m.material, base: new THREE.Color(COL.pue), lab: mu.lab, area: mu.area };
  }
  g.add(ribbons(PD.munis.flatMap(mu => mu.polys.flatMap(p => p)), 0.012, PH + 0.004, COL.muniLine, { opacity: 0.9 }));
  g.add(ribbons(PD.outline.flatMap(p => p), 0.045, PH + 0.008, COL.outline, { joints: true }));
  // highway: dark band with a light dashed centre
  const hw = HIGHWAY;
  s.highway = new THREE.Group(); g.add(s.highway);
  const hwBand = ribbons([hw], 0.09, PH + 0.012, '#3b3631', { joints: true, closed: false }); s.highway.add(hwBand);
  const dash = []; for (let i = 0; i < hw.length - 1; i++) { const [a, b] = [hw[i], hw[i + 1]]; for (let k = 0; k < 4; k += 2) dash.push([[a[0] + (b[0] - a[0]) * k / 4, a[1] + (b[1] - a[1]) * k / 4], [a[0] + (b[0] - a[0]) * (k + 1) / 4, a[1] + (b[1] - a[1]) * (k + 1) / 4]]); }
  const hwDash = ribbons(dash, 0.025, PH + 0.016, '#f3ead6', { closed: false }); s.highway.add(hwDash);
  s.highway.set = p => { p = clamp(p); s.highway.visible = p > 0.001; hwBand.geometry.setDrawRange(0, Math.floor(p * (hw.length - 1)) * 30 + 30 * (p >= 1 ? 0 : 0)); hwDash.geometry.setDrawRange(0, Math.floor(p * dash.length) * 6); };
  s.highway.set(0);
  // schematic pipeline: orange dashes
  const pd = []; for (let i = 0; i < PIPELINE.length - 1; i++) { const [a, b] = [PIPELINE[i], PIPELINE[i + 1]]; for (let k = 0; k < 6; k += 2) pd.push([[a[0] + (b[0] - a[0]) * k / 6, a[1] + (b[1] - a[1]) * k / 6], [a[0] + (b[0] - a[0]) * (k + 1) / 6, a[1] + (b[1] - a[1]) * (k + 1) / 6]]); }
  s.pipeline = ribbons(pd, 0.05, PH + 0.02, '#e07a1f', { closed: false }); g.add(s.pipeline);
  s.pipeline.set = p => { p = clamp(p); s.pipeline.visible = p > 0.001; s.pipeline.geometry.setDrawRange(0, Math.floor(p * pd.length) * 6); };
  s.pipeline.set(0);
  // city dots
  s.dots = {};
  for (const [n, [lo, la]] of Object.entries(CITY)) {
    const d = new THREE.Group(); const [x, , z] = ppos(lo, la);
    d.add(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 18), new THREE.MeshBasicMaterial({ color: '#f7f1e3' })));
    d.add(new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.07, 18), new THREE.MeshBasicMaterial({ color: '#2b2622' })));
    d.position.set(x, PH + 0.04, z); d.visible = false; g.add(d); s.dots[n] = d;
  }
  // colouring helpers (call reset() once per frame, then tint what you need)
  s.reset = () => { for (const m of Object.values(s.munis)) m.mat.color.copy(m.base); for (const st of Object.values(s.states)) st.mat.color.copy(st.base); };
  s.tint = (name, color, k = 1, amt = 0.8) => { const m = s.munis[name] || s.states[name]; if (!m || k <= 0) return; m.mat.color.copy(m.base).lerp(new THREE.Color(color), amt * clamp(k)); };
  s.tintAll = (color, k, amt = 0.35) => { if (k <= 0) return; const c = new THREE.Color(color); for (const m of Object.values(s.munis)) m.mat.color.lerp(c, amt * clamp(k)); };
  s.dim = (k, except = []) => { if (k <= 0) return; const c = new THREE.Color('#bdb6a8'); for (const [n, m] of Object.entries(s.munis)) if (!except.includes(n)) m.mat.color.lerp(c, 0.45 * clamp(k)); };
  return s;
}
// Pulsing ring at a lon/lat.
export function pulse(s, lon, lat, color = '#c0392b', size = 1) {
  const g = new THREE.Group(); const [x, , z] = ppos(lon, lat); g.position.set(x, PH + 0.03, z); s.add(g);
  const ring = F.ring(color, 0.6 * size); g.add(ring);
  const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * size, 0.2 * size, 0.06, 20), new THREE.MeshBasicMaterial({ color })); g.add(dot);
  g.update = (t, t0, t1 = 1e9) => { const k = t - t0; g.visible = k > 0 && t < t1; if (!g.visible) return; const rk = (k % 1.4) / 1.4; ring.scale.setScalar(0.6 + rk * 2.6); ring.material.opacity = 0.85 * (1 - rk); dot.scale.setScalar(clamp(k / 0.3)); };
  g.visible = false; return g;
}
export const muniLab = (s, name) => s.munis[name].lab;
export function mlabel(ctx, s, name, k = 1, cls = 'c', text = name, dy = 0.3) { const [lo, la] = s.munis[name].lab; return label(ctx, ppos(lo, la, PH + dy), text, cls, k); }
export function clabel(ctx, s, name, k = 1, cls = 'c', text = name) { const d = s.dots[name]; if (d) d.visible = k > 0.01; const [lo, la] = CITY[name]; return label(ctx, ppos(lo, la, PH + 0.35), text, cls, k); }
export function slabel(ctx, name, k = 1, text = name.toUpperCase()) { const [lo, la] = NEIGH_LABEL[name]; return label(ctx, ppos(lo, la, NH + 0.05), text, 'st', k); }
// Rich chip above a municipality: name + one line of detail.
export function chip(ctx, s, name, k, sub = '', col = '#c0392b', { dy = 0.35, title = name } = {}) {
  if (k <= 0) return ''; const [lo, la] = s.munis[name].lab; return chipAt(ctx, lo, la, k, title, sub, col, dy);
}
// Same chip at any lon/lat.
export function chipAt(ctx, lo, la, k, title, sub = '', col = '#c0392b', dy = 0.35) {
  if (k <= 0) return ''; const [x, y, ok] = ctx.project(ppos(lo, la, PH + dy)); if (!ok) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-100%) scale(${0.8 + 0.2 * k});opacity:${k};text-align:center;padding:7px 14px 8px;border-radius:12px;background:rgba(20,22,28,.9);border-bottom:4px solid ${col};box-shadow:0 8px 24px rgba(0,0,0,.35);white-space:nowrap">
    <div style="font:900 24px 'Inter Display',Inter;color:#fff">${title}</div>${sub ? `<div style="font:700 17px Inter;color:#e6e0d4;margin-top:2px">${sub}</div>` : ''}</div>`;
}
