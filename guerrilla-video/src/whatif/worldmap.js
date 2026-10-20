// World map for the tour of the other leaders (Natural Earth 1:50m via world-atlas), equirectangular.
// Countries are thin extrusions on a sea plane; scenes recolour them and plant flag pins.
import * as THREE from 'three';
import { stage } from '../lib/stage.js';
import { flagTex } from './flags.js';

let TOPO = null;
export async function preload() { if (!TOPO) TOPO = await (await fetch('/node_modules/world-atlas/countries-50m.json')).json(); }
export const K = 0.55;
export const wpos = (lon, lat, y = 0.25) => [lon * K, y, -lat * K];
function decode(topo) {
  const { scale: [sx, sy], translate: [tx, ty] } = topo.transform;
  const arcs = topo.arcs.map(a => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; }); });
  const arc = i => (i >= 0 ? arcs[i] : arcs[~i].slice().reverse());
  const ring = r => r.flatMap((i, k) => { const a = arc(i); return k ? a.slice(1) : a; });
  return topo.objects.countries.geometries.map(g => ({ name: g.properties.name,
    polys: g.type === 'Polygon' ? [g.arcs.map(ring)] : g.type === 'MultiPolygon' ? g.arcs.map(p => p.map(ring)) : [] }));
}
export const LAND = '#e9e2cf', SEA = '#86b4cc';
export function worldMap({ light = 'day' } = {}) {
  const s = stage({ groundA: null, skyTop: '#4a6fa8', skyHor: '#d7e4ea', fog: ['#d7e4ea', 140, 380], sunPos: [20, 60, 30], sun: 2.0, hemi: 1.4, shadow: 110 });
  s.userData.near = 0.5;
  const g = new THREE.Group(); s.add(g);
  const seaTex = (() => { const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const x = c.getContext('2d');
    const gr = x.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#7fb0c9'); gr.addColorStop(0.5, '#8fbdd3'); gr.addColorStop(1, '#7aa9c2'); x.fillStyle = gr; x.fillRect(0, 0, 1024, 512);
    x.strokeStyle = 'rgba(255,255,255,0.18)'; x.lineWidth = 1.5; for (let lo = -180; lo <= 180; lo += 30) { const px = (lo + 180) / 360 * 1024; x.beginPath(); x.moveTo(px, 0); x.lineTo(px, 512); x.stroke(); }
    for (let la = -90; la <= 90; la += 30) { const py = (90 - la) / 180 * 512; x.beginPath(); x.moveTo(0, py); x.lineTo(1024, py); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(360 * K, 180 * K), new THREE.MeshStandardMaterial({ map: seaTex, roughness: 0.7 }));
  sea.rotation.x = -Math.PI / 2; sea.position.y = -0.02; sea.receiveShadow = true; g.add(sea);
  const big = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshStandardMaterial({ color: '#7fb0c9', roughness: 0.8 })); big.rotation.x = -Math.PI / 2; big.position.y = -0.05; g.add(big);
  s.countries = {};
  const edgeMat = new THREE.LineBasicMaterial({ color: '#8a7f68', transparent: true, opacity: 0.55 });
  for (const c of decode(TOPO)) {
    const shapes = [];
    for (const poly of c.polys) {
      const fix = r => { const lons = r.map(p => p[0]); return Math.max(...lons) - Math.min(...lons) > 180 ? r.map(([lo, la]) => [lo < 0 ? lo + 360 : lo, la]) : r; };
      const rings = poly.map(fix); if (rings[0].every(([, la]) => la < -58)) continue;   // Antarctica
      const sh = new THREE.Shape(rings[0].map(([lo, la]) => new THREE.Vector2(lo * K, la * K)));
      for (const h of rings.slice(1)) sh.holes.push(new THREE.Path(h.map(([lo, la]) => new THREE.Vector2(lo * K, la * K))));
      shapes.push(sh);
      const pts = []; for (const r of rings) { for (let i = 0; i < r.length - 1; i++) pts.push(r[i][0] * K, 0.215, -r[i][1] * K, r[i + 1][0] * K, 0.215, -r[i + 1][1] * K); }
      const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); g.add(new THREE.LineSegments(lg, edgeMat));
    }
    if (!shapes.length) continue;
    const geo = new THREE.ExtrudeGeometry(shapes, { depth: 0.2, bevelEnabled: false }); geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshStandardMaterial({ color: LAND, roughness: 0.92 });
    const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; m.castShadow = true; g.add(m);
    s.countries[c.name] = { mesh: m, mat, base: LAND };
  }
  s.paint = (name, color, k = 1) => { const c = s.countries[name]; if (!c) return; c.mat.color.set(c.base).lerp(new THREE.Color(color), k); c.mesh.position.y = 0.12 * k; };
  return s;
}
// A flag pin standing on the map at lon/lat (pops up with .set(k)).
export function pin(s, lon, lat, code, { h = 2.2, w = 1.4 } = {}) {
  const g = new THREE.Group(); const [x, , z] = wpos(lon, lat, 0); g.position.set(x, 0.2, z); s.add(g);
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, h, 8), new THREE.MeshStandardMaterial({ color: '#f2efe6', metalness: 0.3, roughness: 0.4 })).translateY(h / 2));
  g.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), new THREE.MeshStandardMaterial({ color: '#c0392b', roughness: 0.4 })).translateY(h + 0.05));
  const f = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 2 / 3), new THREE.MeshStandardMaterial({ map: flagTex(code), side: THREE.DoubleSide, roughness: 0.8 }));
  f.position.set(w / 2 + 0.03, h - w / 3, 0); g.add(f);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.set = k => { g.visible = k > 0.001; const e = k < 1 ? 1 - Math.pow(1 - k, 3) * Math.cos(k * 8) * 0.0 : 1; g.scale.set(1, Math.max(0.001, e), 1); };
  g.set(0); return g;
}
