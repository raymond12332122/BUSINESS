// Flat world map (Natural Earth 1:110m via world-atlas) coloured by the empires of 1914, for the global scenes.
import * as THREE from 'three';
import { stage } from '../lib/stage.js';
import { label } from '../lib/kit.js';
import { ss, clamp } from '../lib/util.js';
import * as F from '../lib/fx.js';

let TOPO = null;
export async function preload() { if (!TOPO) TOPO = await (await fetch('/node_modules/world-atlas/countries-110m.json')).json(); }
const LON0 = 10, KS = 0.55;
export const proj = (lon, lat) => [(lon - LON0) * KS, -lat * KS];
export const H = 0.1;
export const pos = (lon, lat, y = H) => { const [x, z] = proj(lon, lat); return [x, y, z]; };

function decode(topo) {
  const { scale: [sx, sy], translate: [tx, ty] } = topo.transform;
  const arcs = topo.arcs.map(a => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; }); });
  const arc = i => (i >= 0 ? arcs[i] : arcs[~i].slice().reverse());
  const ring = r => r.flatMap((i, k) => { const a = arc(i); return k ? a.slice(1) : a; });
  return topo.objects.countries.geometries.map(g => ({ name: g.properties.name,
    polys: g.type === 'Polygon' ? [g.arcs.map(ring)] : g.type === 'MultiPolygon' ? g.arcs.map(p => p.map(ring)) : [] }));
}
const E = (names, st) => Object.fromEntries(names.map(n => [n, st]));
export const EMPIRE = {
  ...E(['United Kingdom', 'Ireland', 'Canada', 'Australia', 'New Zealand', 'India', 'Pakistan', 'Bangladesh', 'Myanmar', 'Sri Lanka', 'South Africa', 'Egypt', 'Sudan', 'S. Sudan', 'Kenya', 'Uganda',
    'Nigeria', 'Ghana', 'Sierra Leone', 'Gambia', 'Zambia', 'Zimbabwe', 'Malawi', 'Botswana', 'Lesotho', 'eSwatini', 'Malaysia', 'Brunei', 'Somaliland', 'Guyana', 'Belize', 'Jamaica', 'Bahamas',
    'Trinidad and Tobago', 'Cyprus', 'N. Cyprus', 'Kuwait', 'Qatar', 'United Arab Emirates', 'Fiji', 'Solomon Is.', 'Falkland Is.'], 'GBR'),
  ...E(['France', 'Algeria', 'Tunisia', 'Morocco', 'Mauritania', 'Senegal', 'Mali', 'Guinea', "Côte d'Ivoire", 'Burkina Faso', 'Niger', 'Benin', 'Chad', 'Central African Rep.', 'Congo', 'Gabon',
    'Madagascar', 'Vietnam', 'Laos', 'Cambodia', 'Djibouti', 'New Caledonia', 'Vanuatu'], 'FRA'),
  ...E(['Germany', 'Namibia', 'Tanzania', 'Rwanda', 'Burundi', 'Cameroon', 'Togo', 'Papua New Guinea'], 'GER'),
  ...E(['Russia', 'Finland', 'Estonia', 'Latvia', 'Lithuania', 'Belarus', 'Ukraine', 'Moldova', 'Georgia', 'Armenia', 'Azerbaijan', 'Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Kyrgyzstan', 'Tajikistan', 'Poland'], 'RUE'),
  ...E(['Austria', 'Hungary', 'Czechia', 'Slovakia', 'Slovenia', 'Croatia', 'Bosnia and Herz.'], 'AUH'),
  ...E(['Turkey', 'Syria', 'Iraq', 'Lebanon', 'Israel', 'Palestine', 'Jordan', 'Saudi Arabia', 'Yemen'], 'OTT'),
  ...E(['Italy', 'Libya', 'Eritrea', 'Somalia'], 'ITA'), ...E(['Belgium', 'Dem. Rep. Congo'], 'BEL'), ...E(['Portugal', 'Angola', 'Mozambique', 'Guinea-Bissau', 'Timor-Leste'], 'PRT'),
  ...E(['Spain', 'W. Sahara', 'Eq. Guinea'], 'ESP'), ...E(['Netherlands', 'Indonesia', 'Suriname'], 'NLD'), ...E(['United States of America', 'Philippines', 'Puerto Rico'], 'USA'),
  ...E(['Japan', 'North Korea', 'South Korea', 'Taiwan'], 'JPN'), ...E(['China'], 'CHN'), ...E(['Mexico'], 'MEX'), ...E(['Serbia', 'Kosovo', 'Macedonia', 'Montenegro'], 'SRB'),
};
export const WCOL = { sea: '#8db0c6', other: '#d8d1c0', GBR: '#e6aaa2', FRA: '#a9c4e0', GER: '#a3a7ad', RUE: '#eaa982', AUH: '#e2cf86', OTT: '#bec992', ITA: '#b9d6a6', BEL: '#e8dc8e',
  PRT: '#c8dcb0', ESP: '#e3d2a6', NLD: '#f0c890', USA: '#b8d2c8', JPN: '#e8b8cc', CHN: '#ecdcb0', MEX: '#cfe0b4', SRB: '#d7aac6' };

export function worldMap({ light = 'day' } = {}) {
  const s = stage({ groundA: null, skyTop: '#4a6fa8', skyHor: '#cfe0ea', fog: ['#cfe0ea', 200, 600], sunPos: [10, 40, 16], sun: 2.1, hemi: 1.35, shadow: 100 });
  const g = new THREE.Group(); s.add(g); s.mapGroup = g;
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(1400, 900), new THREE.MeshStandardMaterial({ color: WCOL.sea, roughness: 0.6 })); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.02; g.add(sea);
  s.countries = {};
  const borders = [];
  for (const c of decode(TOPO)) {
    if (c.name === 'Antarctica' || c.name === 'Fr. S. Antarctic Lands') continue;
    const shapes = [];
    for (const poly of c.polys) {
      const fix = ring => { const lons = ring.map(p => p[0]); if (Math.max(...lons) - Math.min(...lons) > 180) return ring.map(([lo, la]) => [lo < LON0 - 180 ? lo + 360 : lo, la]); return ring.map(([lo, la]) => [lo < LON0 - 180 ? lo + 360 : lo, la]); };
      const rings = poly.map(fix);
      const sh = new THREE.Shape(rings[0].map(([lo, la]) => new THREE.Vector2(...proj(lo, la))));
      for (const h of rings.slice(1)) sh.holes.push(new THREE.Path(h.map(([lo, la]) => new THREE.Vector2(...proj(lo, la)))));
      shapes.push(sh); borders.push(rings[0]);
    }
    const geo = new THREE.ExtrudeGeometry(shapes, { depth: H, bevelEnabled: false }); geo.rotateX(Math.PI / 2); geo.translate(0, H, 0);
    const st = EMPIRE[c.name] || 'other';
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: WCOL[st] || WCOL.other, roughness: 0.9, side: THREE.DoubleSide })); m.receiveShadow = true; g.add(m);
    s.countries[c.name] = { mesh: m, mat: m.material, st };
  }
  const pts = []; for (const r of borders) for (let i = 0; i < r.length - 1; i++) { if (Math.abs(r[i][0] - r[i + 1][0]) > 60) continue; const [ax, az] = proj(...r[i]), [bx, bz] = proj(...r[i + 1]); pts.push(ax, H + 0.004, az, bx, H + 0.004, bz); }
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  g.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: '#6d5a44', transparent: true, opacity: 0.6 })));
  const tmp = new THREE.Color();
  s.reset = () => { for (const c of Object.values(s.countries)) c.mat.color.set(WCOL[c.st] || WCOL.other); };
  s.tintEmpire = (st, color, k = 1, amt = 0.85) => { if (k <= 0) return; for (const c of Object.values(s.countries)) if (c.st === st) c.mat.color.lerp(tmp.set(color), amt * clamp(k)); };
  s.tintCountry = (name, color, k = 1, amt = 0.85) => { const c = s.countries[name]; if (c && k > 0) c.mat.color.lerp(tmp.set(color), amt * clamp(k)); };
  s.dim = (k, keep = []) => { for (const [n, c] of Object.entries(s.countries)) if (!keep.includes(c.st) && !keep.includes(n)) c.mat.color.lerp(tmp.set('#cfc8b8'), 0.6 * clamp(k)); };
  return s;
}
export function pulse(s, lon, lat, color = '#c0392b', size = 1) {
  const g = new THREE.Group(); const [x, , z] = pos(lon, lat); g.position.set(x, H + 0.03, z); s.add(g);
  const ring = F.ring(color, 0.6 * size); g.add(ring);
  const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * size, 0.2 * size, 0.06, 20), new THREE.MeshBasicMaterial({ color })); g.add(dot);
  g.update = (t, t0, t1 = 1e9) => { const k = t - t0; g.visible = k > 0 && t < t1; if (!g.visible) return; const rk = (k % 1.4) / 1.4; ring.scale.setScalar(0.6 + rk * 2.6); ring.material.opacity = 0.85 * (1 - rk); dot.scale.setScalar(clamp(k / 0.3)); };
  g.visible = false; return g;
}
export function wlabel(ctx, lon, lat, text, k = 1, cls = 'c', y = 0.4) { return label(ctx, pos(lon, lat, H + y), text, cls, k); }
