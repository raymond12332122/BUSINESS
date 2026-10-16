// Costumes for the independence of the Americas video (1775-1825). Same era as the Napoleonic kit, which it builds on.
// Every hat here keeps the umamusume ears: they poke out through the hat, as in the games.
import * as THREE from 'three';
import * as P from '../lib/props.js';
import * as G from '../lib/gear.js';
import * as C_ from '../lib/chars.js';
import { mesh, box, cyl, at, rng } from '../lib/props.js';
import { flattenAhoge, generic, epaulettes, crossbelts, sombrero, glasses, rebozo, sarape } from '../mx/kit.js';
import * as N from '../napo/kit.js';
import { blobShadow, freeze } from '../rusia/kit.js';
export { blobShadow, freeze };

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

// ------------------------------------------------------------ small hats and accessories
// Morelos' white kerchief, tied over the head (the ears come out through it).
export function kerchief(color = '#f2eee4') {
  const g = new THREE.Group();
  const cap = mesh(new THREE.SphereGeometry(0.265, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.1), std(color, { roughness: 0.95 })); cap.scale.set(1, 0.72, 1.02); g.add(cap);
  const band = mesh(new THREE.TorusGeometry(0.255, 0.028, 6, 32), std(color, { roughness: 0.95 })); band.rotation.x = Math.PI / 2; band.position.y = 0.02; g.add(band);
  for (const s of [-1, 1]) { const t = mesh(new THREE.ConeGeometry(0.05, 0.16, 6), std(color, { roughness: 0.95 })); t.position.set(s * 0.05, -0.02, -0.28); t.rotation.set(-1.9, 0, s * 0.5); g.add(t); }
  return g;
}
export const crownHat = () => N.crown();
export function teacup() {
  const g = new THREE.Group(), w = std('#f6f2ea', { roughness: 0.4 });
  g.add(at(mesh(new THREE.CylinderGeometry(0.05, 0.035, 0.06, 14, 1, true), new THREE.MeshStandardMaterial({ color: '#f6f2ea', roughness: 0.4, side: THREE.DoubleSide })), 0, 0.03, 0));
  g.add(at(mesh(new THREE.CircleGeometry(0.046, 14), std('#7a4a22')), 0, 0.05, 0, -Math.PI / 2, 0, 0));
  g.add(at(mesh(new THREE.TorusGeometry(0.018, 0.005, 5, 10), w), 0.055, 0.032, 0, 0, 0, 0));
  g.add(at(mesh(new THREE.CylinderGeometry(0.075, 0.07, 0.008, 16), w), 0, 0, 0));
  return g;
}
export function quill() { const g = new THREE.Group(); const f = mesh(new THREE.ConeGeometry(0.025, 0.24, 5), std('#f4f1ea')); f.scale.z = 0.3; f.position.y = 0.12; g.add(f); g.add(at(cyl(0.004, 0.004, 0.08, '#3a2a1e', 4), 0, -0.02, 0)); return g; }
export function letter(color = '#efe6cc') { const m = mesh(new THREE.PlaneGeometry(0.14, 0.1), new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: 0.9 })); const g = new THREE.Group(); g.add(m); return g; }
export function machete() {
  const g = new THREE.Group();
  const bl = new THREE.Shape(); bl.moveTo(-0.012, 0); bl.lineTo(0.016, 0); bl.quadraticCurveTo(0.034, 0.25, 0.006, 0.42); bl.lineTo(-0.012, 0.38); bl.closePath();
  g.add(mesh(new THREE.ExtrudeGeometry(bl, { depth: 0.004, bevelEnabled: false }), std('#c8ccd0', { metalness: 0.75, roughness: 0.3 })));
  g.add(at(cyl(0.013, 0.013, 0.1, '#5a3a24', 6), 0, -0.05, 0.002));
  return g;
}
export function torch() {
  const g = new THREE.Group(); g.add(at(cyl(0.014, 0.018, 0.5, '#5a3a24', 6), 0, 0.1, 0));
  const f = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffb040' })); f.scale.y = 1.8; f.position.y = 0.4; g.add(f); g.flame = f; return g;
}

// ------------------------------------------------------------ outfits and casting
const musket = (r, c = '#3b3a36', w = '#7a5232', bay = true) => r.equip(N.musket(c, w, bay), G.HOLDS);
const TRI = { scale: 0.95, y: 0.88, tilt: -0.06 }, BIC = { y: 0.88, tilt: -0.04, cap: true }, SHK = { y: 0.86, tilt: 0.04, cap: true };
const pickHair = r => ['#3a2a20', '#2a2018', '#4a3428', '#1d1612', '#5a4030', '#2e2420'][(r.seed * 7 | 0) % 6];
const sabre = r => hold(r, N.sabre(), 'R', [0, -0.02, 0.02], [0, 0, 0]);
export const OUTFITS = {
  // --- troops and crowds (anonymous: darker hair so they don't read as the named characters)
  continental: r => { generic(r, pickHair(r)); uni(r, 'continental'); hat(r, tricorne({ trim: '#efe6d2', cockadeCol: '#1d1b1c' }), TRI); r.wear('chest', crossbelts('#efe6d2'), [0, 0.39, 0]); musket(r); return r; },
  miliciano: r => { generic(r, pickHair(r)); uni(r, 'militia'); hat(r, tricorne({ color: '#3a2c22' }), TRI); musket(r, '#3b3a36', '#7a5232', false); return r; },
  casaca: r => { generic(r, pickHair(r)); uni(r, 'redcoat'); hat(r, tricorne({ trim: '#f4f1ea' }), TRI); r.wear('chest', crossbelts('#f4f1ea'), [0, 0.39, 0]); musket(r, '#3b3a36', '#6a4428'); return r; },
  frances: r => { generic(r, pickHair(r)); uni(r, 'frances'); hat(r, tricorne({ trim: '#e8c84a' }), TRI); r.wear('chest', crossbelts('#f4f1ea'), [0, 0.39, 0]); musket(r); return r; },
  colono: r => { generic(r, pickHair(r)); uni(r, 'colono'); hat(r, tricorne({ color: '#2a2220' }), TRI); return r; },
  frances1802: r => { generic(r, pickHair(r)); uni(r, 'french'); hat(r, N.bicorne({ cockadeCols: ['#2a3f8f', '#f4f1ea', '#c0272d'] }), BIC); r.wear('chest', crossbelts('#f4f1ea'), [0, 0.39, 0]); musket(r); return r; },
  haitiano: r => { generic(r, '#1d1612'); uni(r, 'haiti'); hat(r, N.bicorne({ cockadeCols: ['#c0272d', '#2a3f8f', '#c0272d'] }), BIC); r.wear('chest', crossbelts('#f4f1ea'), [0, 0.39, 0]); musket(r); return r; },
  rebelde: r => { generic(r, '#1d1612'); uni(r, 'cimarron'); hold(r, machete(), 'R', [0, -0.02, 0.03], [0, 0, 0]); return r; },
  trabajador: r => { generic(r, '#1d1612'); uni(r, 'cimarron'); hat(r, sombrero('palm'), { scale: 0.8, y: 0.9, tilt: -0.08, cap: true }); return r; },
  peninsular: r => { generic(r, '#3a2a20'); uni(r, 'realista'); hat(r, N.bicorne({ cockadeCols: ['#c0272d', '#c0272d', '#c0272d'] }), BIC); return r; },
  criollo: r => { generic(r, pickHair(r)); uni(r, 'criollo'); hat(r, N.tophat('#1d1b1c'), { scale: 0.9, y: 0.88, tilt: -0.04 }); return r; },
  dama: r => { generic(r, pickHair(r)); uni(r, 'dama'); return r; },
  indigena: r => { generic(r, '#141012'); uni(r, 'insurgente'); r.wear('chest', sarape(), [0, 0.4, 0]); return r; },
  insurgente: r => { generic(r, pickHair(r)); uni(r, 'insurgente'); hat(r, sombrero('palm'), { scale: 0.85, y: 0.9, tilt: -0.08, cap: true }); hold(r, machete(), 'R', [0, -0.02, 0.03], [0, 0, 0]); return r; },
  insurgenteF: r => { generic(r, pickHair(r)); uni(r, 'insurgente'); hat(r, N.chambergo('#c9b07a'), { y: 0.9, tilt: -0.06, cap: true }); musket(r, '#3b3a36', '#7a5232', false); return r; },
  realista: r => { generic(r, pickHair(r)); uni(r, 'realista'); hat(r, N.shako({ plate: '#d4af37', plume: '#c0272d' }), SHK); r.wear('chest', crossbelts('#f4f1ea'), [0, 0.39, 0]); musket(r); return r; },
  patriota: r => { generic(r, pickHair(r)); uni(r, 'patriota'); hat(r, N.shako({ plate: '#d4af37', plume: '#e8c84a' }), SHK); r.wear('chest', crossbelts('#f4f1ea'), [0, 0.39, 0]); musket(r); return r; },
  granadero: r => { generic(r, pickHair(r)); uni(r, 'granadero'); hat(r, N.shako({ color: '#151517', plate: '#d4af37', plume: '#c0272d', bell: 0.05, tall: 0.26 }), SHK); hold(r, N.sabre(), 'R', [0, -0.02, 0.02]); return r; },
  llanero: r => { generic(r, pickHair(r)); uni(r, 'llanero'); hat(r, N.chambergo('#d8c49a'), { y: 0.9, tilt: -0.06, cap: true }); r.equip(N.lance('#5a3a24'), { low: { pos: [0.12, 0.33, 0.05], dir: [0, 1, 0.05], R: [0.1, 0.33, 0.1] } }); return r; },
  trigarante: r => { generic(r, pickHair(r)); uni(r, 'patriota'); hat(r, N.shako({ plate: '#d4af37', plume: '#2f7a3a' }), SHK); r.wear('chest', crossbelts('#f4f1ea'), [0, 0.39, 0]); musket(r); return r; },
  brasileno: r => { generic(r, pickHair(r)); uni(r, 'brasil'); hat(r, N.shako({ plate: '#d4af37', plume: '#f0d84a' }), SHK); hold(r, N.sabre(), 'R', [0, -0.02, 0.02]); return r; },
  portugues: r => { generic(r, pickHair(r)); uni(r, 'portugues'); hat(r, N.bicorne({ cockadeCols: ['#2a3f8f', '#f4f1ea', '#2a3f8f'] }), BIC); musket(r); return r; },
  oficial: r => { uni(r, 'patriota'); hat(r, N.bicorne({ trim: '#e2bd45', plume: '#c0272d', cockadeCols: ['#f0d84a', '#2a3f8f', '#c0272d'] }), BIC); r.wear('chest', epaulettes('#e2bd45'), [0, 0.475, -0.01]); return r; },
  // --- named characters played by chibis (own hair kept)
  napoleon: r => { uni(r, 'napoleon'); hat(r, N.bicorne(), { y: 0.9, tilt: -0.05, cap: true }); return r; },
  fernando: r => { uni(r, 'royal'); hat(r, N.crown(), { y: 0.88, tilt: 0.04 }); r.wear('chest', N.sash(['#c0272d', '#e8c84a', '#c0272d']), [0, 0.4, 0]); return r; },
  joseB: r => { uni(r, 'royal'); hat(r, N.crown({ velvet: '#2a3f8f' }), { y: 0.88, tilt: 0.04 }); r.wear('chest', N.sash(['#2a3f8f', '#2a3f8f']), [0, 0.4, 0]); return r; },
  dessalines: r => { uni(r, 'haiti'); hat(r, N.bicorne({ trim: '#e2bd45', plume: '#c0272d', cockadeCols: ['#c0272d', '#2a3f8f', '#c0272d'] }), BIC); r.wear('chest', epaulettes('#e2bd45'), [0, 0.475, -0.01]); sabre(r); return r; },
  morelos: r => { uni(r, 'criollo'); hat(r, kerchief(), { y: 0.86, tilt: 0.02 }); r.wear('chest', N.waistSash('#2a2a30'), [0, 0.3, 0]); return r; },
  allende: r => { uni(r, { dark: '#10162e', mid: '#2a3f8f', light: '#c0272d', gold: '#d4af37' }); hat(r, N.bicorne({ trim: '#e2bd45', cockadeCols: ['#c0272d', '#f4f1ea', '#c0272d'] }), BIC); r.wear('chest', epaulettes('#e2bd45'), [0, 0.475, -0.01]); return r; },
  leona: r => { uni(r, 'dama'); r.wear('chest', rebozo('#4a5a7a'), [0, 0.47, -0.01]); return r; },
  ohiggins: r => { uni(r, 'patriota'); hat(r, N.bicorne({ trim: '#e2bd45', cockadeCols: ['#2a3f8f', '#f4f1ea', '#c0272d'] }), BIC); r.wear('chest', epaulettes('#e2bd45'), [0, 0.475, -0.01]); r.wear('chest', N.sash(['#2a3f8f', '#f4f1ea', '#c0272d']), [0, 0.4, 0]); return r; },
  galvez: r => { uni(r, 'realista'); hat(r, tricorne({ trim: '#e2bd45', cockadeCol: '#c0272d' }), TRI); r.wear('chest', epaulettes('#e2bd45'), [0, 0.475, -0.01]); r.wear('chest', N.sash(['#c0272d', '#c0272d']), [0, 0.4, 0]); return r; },
  virrey: r => { uni(r, 'realista'); hat(r, N.bicorne({ trim: '#e2bd45', plume: '#f4f1ea', cockadeCols: ['#c0272d', '#c0272d', '#c0272d'] }), BIC); r.wear('chest', epaulettes('#e2bd45'), [0, 0.475, -0.01]); r.wear('chest', N.sash(['#c0272d', '#c0272d']), [0, 0.4, 0]); return r; },
  joao: r => { uni(r, 'royal'); hat(r, N.bicorne({ trim: '#e2bd45', cockadeCols: ['#2a3f8f', '#f4f1ea', '#2a3f8f'] }), BIC); r.wear('chest', N.sash(['#2a3f8f', '#c0272d']), [0, 0.4, 0]); return r; },
  golshiCameo: r => r,
  self: r => r,
  // --- leaders: full-proportion models keep their race outfits; period hats and props go on top
  lider: r => r,
  lWashington: r => { hat(r, tricorne({ trim: '#e2bd45', cockadeCol: '#1d1b1c' }), { ...TRI, scale: 1.2 }); return r; },
  lFranklin: r => { r.wear('head', glasses(false), [0, 0.69, 0.235]); return r; },
  lKing: r => { hat(r, N.crown(), { y: 0.86, tilt: 0.04, scale: 1.1 }); r.cape = r.wear('chest', N.cape('#9a1b2a', '#f6f2ea', { w: 0.5, h: 0.5, ermine: true }), [0, 0.5, -0.1]); return r; },
  lToussaint: r => { hat(r, N.bicorne({ trim: '#e2bd45', plume: '#c0272d', cockadeCols: ['#2a3f8f', '#f4f1ea', '#c0272d'] }), { ...BIC, scale: 1.15 }); return r; },
  lPedro: r => { hat(r, N.bicorne({ trim: '#e2bd45', plume: '#2f7a3a', cockadeCols: ['#2f7a3a', '#f0d84a', '#2f7a3a'] }), { ...BIC, scale: 1.15 }); return r; },
  lBic: r => { hat(r, N.bicorne({ trim: '#e2bd45', plume: '#f4f1ea', cockadeCols: ['#f0d84a', '#2a3f8f', '#c0272d'] }), BIC); return r; },
  lTri: r => { hat(r, tricorne({ trim: '#e2bd45', cockadeCol: '#1d1b1c' }), TRI); r.wear('chest', epaulettes('#e2bd45'), [0, 0.475, -0.01]); return r; },
  lShk: r => { hat(r, N.shako({ plate: '#d4af37', plume: '#c0272d' }), SHK); r.wear('chest', crossbelts('#f4f1ea'), [0, 0.39, 0]); musket(r); return r; },
};
// Put a prop in a hand: attached to the wrist at its rest position (+ offset); full-size bodies scale both up.
export function hold(r, obj, side = 'R', off = [0, -0.04, 0.03], rot = [0, 0, 0], s = 1) {
  r.root.updateMatrixWorld(true);
  const key = side === 'R' ? 'wriR' : 'wriL', b = r.j[key].bone, k = r.ratio || 1;
  const p = new THREE.Vector3(); b.getWorldPosition(p); p.applyMatrix4(r.root.matrixWorld.clone().invert());
  const o = r.attach(key, obj, [p.x + off[0] * k, p.y + off[1] * k, p.z + off[2] * k], rot); o.scale.multiplyScalar(k * s); return o;
}
// Who plays whom: role -> [model key, outfit]. CARD: role -> [umamusume, historical figure, personality nod].
export const ROLES = {
  washington: ['groove', 'lWashington'], jefferson: ['grass', 'lider'], franklin: ['golshi', 'lFranklin'], lafayette: ['digital', 'lider'],
  jorge3: ['mcqueenB', 'lKing'], galvez: ['hishi', 'galvez'], toussaint: ['tamamoB', 'lToussaint'], dessalines: ['oguri', 'dessalines'],
  napoleon: ['daiwa', 'napoleon'], fernando: ['mcqueen', 'fernando'], jose: ['tamamo', 'joseB'], josefa: ['creek', 'lider'], hidalgo: ['turbo', 'lider'],
  allende: ['helios', 'allende'], morelos: ['oguri', 'morelos'], leona: ['cafe', 'leona'], guerrero: ['dotoB', 'lider'], iturbide: ['opera', 'lider'],
  bolivar: ['rudolf', 'lider'], sucre: ['teio', 'lider'], sanmartin: ['suzukaB', 'lider'], ohiggins: ['spe', 'ohiggins'], pedro: ['dia', 'lPedro'],
  golshiC: ['golshiB', 'golshiCameo'], virrey: ['suzuka', 'virrey'], joao: ['doto', 'joao'],
};
export const CARD = {
  washington: ['Air Groove', 'George Washington', '«La Emperatriz»: estricta, disciplinada… y le grita «¡tawake!» (¡tonto!) a quien se distrae. También cultiva flores, como el granjero de Mount Vernon.'],
  jefferson: ['Grass Wonder', 'Thomas Jefferson', 'Sonrisa dulce y voluntad de hierro. El Congreso le recortó el borrador… y nadie quiere ver su sonrisa cuando se enoja.'],
  franklin: ['Gold Ship', 'Benjamin Franklin', 'Caos puro y genio inventor: si hay tormenta, ella saca el papalote. Le dice «cajero automático» a su entrenador… y Franklin acabó en el billete de 100 dólares.'],
  lafayette: ['Agnes Digital', 'Marqués de Lafayette', 'Superfan número uno («¡guehehe!») de todas las umamusumes. Lafayette cruzó el océano por admiración a Washington.'],
  jorge3: ['Mejiro McQueen', 'Jorge III', 'Heredera digna que sirve primero la leche y luego el té… así que imagina lo que sintió con el Motín del Té.'],
  galvez: ['Hishi Akebono', 'Bernardo de Gálvez', 'Gigante amable (1,80 m) que le da de comer a todos: «¡Buono, buono!». Gálvez abasteció a los rebeldes.'],
  toussaint: ['Tamamo Cross', 'Toussaint Louverture', '«¡El Rayo Blanco!»: pequeñita, peleonera y salida de la pobreza. A Toussaint de niño le decían «palito enclenque».'],
  dessalines: ['Oguri Cap', 'Jean-Jacques Dessalines', 'Siguió corriendo cuando su rival Tamamo se retiró… como Dessalines terminó la guerra de Toussaint.'],
  napoleon: ['Daiwa Scarlet', 'Napoleón', '«¡El segundo lugar no sirve!». Siempre la número uno… y Napoleón se coronó él mismo.'],
  fernando: ['Mejiro McQueen', 'Fernando VII', 'Otra vez McQueen de monarca que pierde un imperio. Esta vez, sin pastelitos de consuelo.'],
  jose: ['Tamamo Cross', 'José Bonaparte', 'Rey impuesto por su hermano. Tamamo, en papel doble, no está nada contenta.'],
  josefa: ['Super Creek', 'Josefa Ortiz de Domínguez', 'Se llama a sí misma «mamá» y siempre pone a salvo a los suyos… como la corregidora que avisó a tiempo.'],
  hidalgo: ['Twin Turbo', 'Miguel Hidalgo', '«¡Turbo a fondo!»: sale a toda velocidad desde el primer segundo… aunque luego se quede sin gasolina.'],
  allende: ['Daitaku Helios', 'Ignacio Allende', 'Fiestera de «¡buena vibra!». Allende, capitán de dragones, encabezaba la conspiración.'],
  morelos: ['Oguri Cap', 'José María Morelos', 'Tranquila, siempre con hambre y corre «por la gente de su pueblo»: el «Siervo de la Nación».'],
  leona: ['Manhattan Cafe', 'Leona Vicario', 'Callada y misteriosa, sigue a una «amiga» que nadie más ve: perfecta espía de Los Guadalupes.'],
  guerrero: ['Meisho Doto', 'Vicente Guerrero', 'Torpe y pesimista, pero jamás se rinde. Quedó segunda de Opera O cinco veces seguidas… y al final le ganó.'],
  iturbide: ['T.M. Opera O', 'Agustín de Iturbide', '«¡Ja, ja, ja! ¡Soy la Soberana más fuerte y hermosa!». Ya traía corona y capa de casa.'],
  bolivar: ['Symboli Rudolf', 'Simón Bolívar', '«El Emperador»: presidenta idealista del consejo estudiantil… y reina de los chistes malos.'],
  sucre: ['Tokai Teio', 'Antonio José de Sucre', 'Idolatra a Rudolf como Sucre a Bolívar. Volvió de tres fracturas con su famoso «Paso Teio».'],
  sanmartin: ['Silence Suzuka', 'José de San Martín', 'Callada, no le gustan las multitudes y siempre corre al frente: «No le cedo la punta a nadie».'],
  ohiggins: ['Special Week', "Bernardo O'Higgins", 'Criada por «dos mamás», como O\'Higgins por padres adoptivos. Idolatra a Suzuka… y no suelta lo suyo: «¡Agemasen!».'],
  pedro: ['Satono Diamond', 'Pedro I', '«¡El destino no existe!». Rompió la maldición de su familia, como Pedro rompió con Portugal.'],
  golshiC: ['Gold Ship', '…¿ella misma?', 'Nadie la invitó a esta escena. Nadie sabe de dónde sacó ese lanzacohetes.'],
};
let seedCounter = 0;
export function person(parent, who, outfit = who, x = 0, z = 0, yaw = 0) {
  const role = ROLES[who], key = role ? role[0] : who;
  const r = C_.spawn(key); r.seed = (seedCounter++ * 1.37) % 10; OUTFITS[role && outfit === who ? role[1] : outfit](r);
  r.root.position.set(x, 0, z); r.root.rotation.y = yaw; parent.add(r.root); r.who = who; return r;
}
export const role = (parent, who, x = 0, z = 0, yaw = 0) => person(parent, who, who, x, z, yaw);
// Crowd of extras laid out on a grid inside [x0, z0, x1, z1] (blob shadows instead of shadow maps).
const CHIBIS = ['oguri', 'tamamo', 'cafe', 'doto', 'mcqueen', 'daiwa', 'suzuka', 'helios', 'spe', 'hishi'];
export function crowd(parent, outfit, n, [x0, z0, x1, z1], { seed = 1, yaw = 0, cast = CHIBIS, jitter = 0.35, yawJ = 0.4 } = {}) {
  const r = P.rng(seed), out = [];
  const cols = Math.ceil(Math.sqrt(n * (x1 - x0) / Math.max(0.1, z1 - z0)));
  for (let i = 0; i < n; i++) {
    const cx = i % cols, cz = Math.floor(i / cols), rows = Math.ceil(n / cols);
    const x = x0 + (cx + 0.5) / cols * (x1 - x0) + (r() - 0.5) * jitter, z = z0 + (cz + 0.5) / rows * (z1 - z0) + (r() - 0.5) * jitter;
    const o = Array.isArray(outfit) ? outfit[i % outfit.length] : outfit;
    out.push(blobShadow(person(parent, cast[(i + seed) % cast.length], o, x, z, yaw + (r() - 0.5) * yawJ)));
  }
  return out;
}
export { pose } from '../mx/kit.js';
