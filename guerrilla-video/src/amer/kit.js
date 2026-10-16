// Costumes for the independence of the Americas video (1775-1825). Same era as the Napoleonic kit, which it builds on.
// Every hat here keeps the umamusume ears: they poke out through the hat, as in the games.
import * as THREE from 'three';
import * as P from '../lib/props.js';
import * as G from '../lib/gear.js';
import * as C_ from '../lib/chars.js';
import { mesh, box, cyl, at, rng } from '../lib/props.js';
import { flattenAhoge, generic, epaulettes, crossbelts, sombrero, glasses } from '../mx/kit.js';
import * as N from '../napo/kit.js';

export { flattenAhoge, generic };
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });

// ------------------------------------------------------------ uniforms (luminance ramps, see napo/kit uniformize)
const U = {
  continental: { dark: '#121a30', mid: '#233660', light: '#e6d6ae', gold: '#c9a227' },
  militia: { dark: '#2a2018', mid: '#6a5238', light: '#e8dcc2', gold: '#b08d3a' },
  redcoat: { dark: '#4a1013', mid: '#b3262a', light: '#f3f0e8', gold: '#d4af37' },
  frances: { dark: '#8e8c84', mid: '#ece8de', light: '#ffffff', gold: '#d4af37' },
  colono: { dark: '#2a1e16', mid: '#7a5a3a', light: '#efe6d2', gold: '#b08d3a' },
  haiti: { dark: '#141c3a', mid: '#2a3f8f', light: '#f3f0e8', gold: '#d4af37' },
  cimarron: { dark: '#2c241c', mid: '#8a7458', light: '#eee6d4', gold: '#b08d3a' },
  insurgente: { dark: '#3a2c20', mid: '#a08a6a', light: '#efe7d6', gold: '#b08d3a' },
  realista: { dark: '#1c2440', mid: '#d9d3c4', light: '#f6f3ea', gold: '#d4af37' },
  patriota: { dark: '#10162e', mid: '#25336b', light: '#f3f0e8', gold: '#d4af37' },
  granadero: { dark: '#0e1430', mid: '#1d2a5a', light: '#f3f0e8', gold: '#d4af37' },
  llanero: { dark: '#3a3024', mid: '#d8ccb0', light: '#f4efe2', gold: '#b08d3a' },
  brasil: { dark: '#123222', mid: '#1f5a36', light: '#f0d84a', gold: '#d4af37' },
  portugues: { dark: '#10162e', mid: '#2a3a6a', light: '#f3f0e8', gold: '#d4af37' },
  criollo: { dark: '#141416', mid: '#2e2e34', light: '#f4f1ea', gold: '#c9a227' },
  dama: { dark: '#6a5a6e', mid: '#d8cce0', light: '#ffffff', gold: '#d4af37' },
  ...N.UNIFORMS,
};
export const uni = (r, name) => N.uniformize(r, U[name] || name);

// ------------------------------------------------------------ hats (ears kept)
// Like mx wearHat, but the ears stay: they come out through the hat. Antenna strands are still tucked.
// (attach() resets the prop's scale, so the size factor is applied afterwards.)
export function hat(rig, h, { y = 0.88, tilt = -0.05, scale = 1, cap = false } = {}) {
  if (!rig.big) { flattenAhoge(rig); if (cap) { flattenAhoge(rig, 0.02, /^Sp_He_Hair[01]_C_00/); if (rig.key === 'oguri') flattenAhoge(rig, 0.05, /^Sp_He_Hair3_C_00/); } }
  rig.hat = h; rig.wear('head', h, [0, y, -0.02], [tilt * 57.3, 0, 0]); h.scale.multiplyScalar(scale); return h;
}
// Tricorne (1770s-80s): low crown, brim cocked up on three sides into a triangle with a point at the front.
export function tricorne({ color = '#18161a', trim = null, cockadeCol = null, R = 0.36, H = 0.16 } = {}) {
  const g = new THREE.Group();
  const out = [];
  for (let i = 0; i < 96; i++) { // rounded triangle in the xz plane, corners at a = 0 (front) and +-120 deg
    const a = i / 96 * Math.PI * 2, k = Math.cos(3 * a);
    const r = R * (0.84 + 0.16 * Math.pow(Math.max(0, k), 3)) * (1 - 0.05 * Math.pow(Math.max(0, -k), 2));
    out.push([Math.sin(a) * r, Math.cos(a) * r]);
  }
  const sh = l => l.map(([x, z]) => new THREE.Vector2(x, -z));   // shape y = -z (rotateX(-90deg) maps it back)
  const outer = new THREE.Shape(sh(out)); outer.holes.push(new THREE.Path(sh(out.map(([x, z]) => [x * 0.93, z * 0.93])).reverse()));
  const wall = new THREE.ExtrudeGeometry(outer, { depth: 1, bevelEnabled: false, curveSegments: 4 }); wall.rotateX(-Math.PI / 2);
  const hgt = a => H * (0.5 + 0.5 * (1 - Math.cos(3 * a)) / 2);   // walls highest mid-side, dipping to the three points
  const p = wall.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), u = p.getY(i), z = p.getZ(i), a = Math.atan2(x, z), f = 1 + 0.12 * u; p.setXYZ(i, x * f, u * hgt(a), z * f); }
  wall.computeVertexNormals();
  const m = std(color, { roughness: 0.7, side: THREE.DoubleSide });
  g.add(mesh(wall, m));
  const brim = new THREE.ShapeGeometry(new THREE.Shape(sh(out)), 4); brim.rotateX(-Math.PI / 2); g.add(mesh(brim, m));
  const crown = mesh(new THREE.SphereGeometry(0.24, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), m); crown.scale.y = 0.7; g.add(crown);
  if (trim) { const c = new THREE.CatmullRomCurve3(out.filter((_, i) => i % 2 === 0).map(([x, z]) => { const a = Math.atan2(x, z); return new THREE.Vector3(x * 1.12, hgt(a), z * 1.12); }), true);
    g.add(mesh(new THREE.TubeGeometry(c, 96, 0.012, 5, true), std(trim, { roughness: 0.6 }))); }
  if (cockadeCol) { const ck = mesh(new THREE.CircleGeometry(0.045, 18), std(cockadeCol, { side: THREE.DoubleSide })); const a = -0.5; ck.position.set(Math.sin(a) * R * 0.98, H * 0.62, Math.cos(a) * R * 0.98); ck.rotation.y = a; g.add(ck); }
  return g;
}
export { bicorne, shako, phrygian, chambergo, tophat } from '../napo/kit.js';

// ------------------------------------------------------------ outfits and casting
const musket = (r, c = '#3b3a36', w = '#7a5232', bay = true) => r.equip(N.musket(c, w, bay), G.HOLDS);
const TRI = { scale: 0.95, y: 0.88, tilt: -0.06 }, BIC = { y: 0.88, tilt: -0.04, cap: true }, SHK = { y: 0.86, tilt: 0.04, cap: true };
export const OUTFITS = {
  continental: r => { generic(r, '#3a2a20'); uni(r, 'continental'); hat(r, tricorne({ trim: '#efe6d2', cockadeCol: '#1d1b1c' }), TRI); r.wear('chest', crossbelts('#efe6d2'), [0, 0.39, 0]); musket(r); return r; },
  miliciano: r => { generic(r, '#3a2a20'); uni(r, 'militia'); hat(r, tricorne({ color: '#3a2c22' }), TRI); musket(r, '#3b3a36', '#7a5232', false); return r; },
  casaca: r => { generic(r, '#4a3428'); uni(r, 'redcoat'); hat(r, tricorne({ trim: '#f4f1ea' }), TRI); r.wear('chest', crossbelts('#f4f1ea'), [0, 0.39, 0]); musket(r, '#3b3a36', '#6a4428'); return r; },
  realista: r => { generic(r, '#3a2c26'); uni(r, 'realista'); hat(r, N.shako({ plate: '#d4af37', plume: '#c0272d' }), SHK); r.wear('chest', crossbelts('#f4f1ea'), [0, 0.39, 0]); musket(r); return r; },
  patriota: r => { generic(r, '#3a2c26'); uni(r, 'patriota'); hat(r, N.shako({ plate: '#d4af37', plume: '#e8c84a' }), SHK); r.wear('chest', crossbelts('#f4f1ea'), [0, 0.39, 0]); musket(r); return r; },
  oficial: r => { uni(r, 'patriota'); hat(r, N.bicorne({ trim: '#e2bd45', plume: '#c0272d', cockadeCols: ['#f0d84a', '#2a3f8f', '#c0272d'] }), BIC); r.wear('chest', epaulettes('#e2bd45'), [0, 0.475, -0.01]); return r; },
  insurgente: r => { generic(r, '#2a2018'); uni(r, 'insurgente'); hat(r, N.chambergo('#c9b07a'), { scale: 0.86, y: 0.9, tilt: -0.06, cap: true }); return r; },
  haitiano: r => { generic(r, '#1d1612'); uni(r, 'haiti'); hat(r, N.bicorne({ cockadeCols: ['#c0272d', '#2a3f8f', '#c0272d'] }), BIC); r.wear('chest', crossbelts('#f4f1ea'), [0, 0.39, 0]); musket(r); return r; },
  // leaders (full-proportion models keep their race outfits; period hats/sashes/props are added on top)
  lider: r => r,
  lBic: r => { hat(r, N.bicorne({ trim: '#e2bd45', plume: '#f4f1ea', cockadeCols: ['#f0d84a', '#2a3f8f', '#c0272d'] }), BIC); return r; },
  lTri: r => { hat(r, tricorne({ trim: '#e2bd45', cockadeCol: '#1d1b1c' }), TRI); r.wear('chest', epaulettes('#e2bd45'), [0, 0.475, -0.01]); return r; },
  lShk: r => { hat(r, N.shako({ plate: '#d4af37', plume: '#c0272d' }), SHK); r.wear('chest', crossbelts('#f4f1ea'), [0, 0.39, 0]); musket(r); return r; },
};
// Put a prop in a hand: attached to the wrist at its rest position (+ offset); full-size bodies scale both up.
export function hold(r, obj, side = 'R', off = [0, -0.04, 0.03], rot = [0, 0, 0]) {
  r.root.updateMatrixWorld(true);
  const key = side === 'R' ? 'wriR' : 'wriL', b = r.j[key].bone, k = r.ratio || 1;
  const p = new THREE.Vector3(); b.getWorldPosition(p); p.applyMatrix4(r.root.matrixWorld.clone().invert());
  const o = r.attach(key, obj, [p.x + off[0] * k, p.y + off[1] * k, p.z + off[2] * k], rot); o.scale.multiplyScalar(k); return o;
}
export const CASTING = {};

let seedCounter = 0;
export function person(parent, who, outfit = who, x = 0, z = 0, yaw = 0) {
  const key = CASTING[who] || who;
  const r = C_.spawn(key); r.seed = (seedCounter++ * 1.37) % 10; OUTFITS[outfit](r);
  r.root.position.set(x, 0, z); r.root.rotation.y = yaw; parent.add(r.root); r.who = who; return r;
}
export { pose } from '../mx/kit.js';
