// Costumes for the Russian Revolution video: chibis as tsarist soldiers, Cossacks, workers, peasants, sailors,
// Red Guards, Red Army men, White officers. Uniform colours come from the Napoleonic recolouring shader.
import * as THREE from 'three';
import * as P from '../lib/props.js';
import * as G from '../lib/gear.js';
import * as C_ from '../lib/chars.js';
import { mesh, box, cyl, at, rng } from '../lib/props.js';
import { hideEars, flattenAhoge, generic, wearHat, epaulettes, crossbelts, glasses, cananas } from '../mx/kit.js';
import { uniformize, papakha, musket, sabre, dropHairBits, tiara, tophat } from '../napo/kit.js';
export { pose } from '../mx/kit.js';
export { hideEars, generic };

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.82, ...o });
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function lathe(profile, color, seg = 32, opts = {}) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg);
  const m = mesh(g, std(color, { side: THREE.DoubleSide, ...opts })); m.castShadow = true; return m;
}

// ------------------------------------------------------------ palettes (dark -> main -> light trims, gold accents)
export const PAL = {
  tsarSoldier: { dark: '#2e2a20', mid: '#6f6a4c', light: '#c9bf9a', gold: '#b89a4a' },
  greatcoat: { dark: '#2c2924', mid: '#6a6256', light: '#b8ad98', gold: '#b89a4a' },
  officer: { dark: '#24261c', mid: '#5e6244', light: '#ece2c6', gold: '#d9b44a' },
  cossack: { dark: '#101216', mid: '#262a33', light: '#b8342f', gold: '#c9a227' },
  cadet: { dark: '#121417', mid: '#2b3036', light: '#cfc8b6', gold: '#d4af37' },
  sailor: { dark: '#0a0f1e', mid: '#1a2442', light: '#f2f2f0', gold: '#d4af37' },
  worker: { dark: '#171719', mid: '#3a3734', light: '#c9bfa8', gold: '#8a7a55' },
  worker2: { dark: '#161c2a', mid: '#384861', light: '#d6d0be', gold: '#8a7a55' },
  peasant: { dark: '#3a3024', mid: '#b9ab8c', light: '#f1ead8', gold: '#b23a2e' },
  woman: { dark: '#1d1918', mid: '#4b3b38', light: '#e9dfca', gold: '#8a7a55' },
  woman2: { dark: '#1b1d22', mid: '#3d4656', light: '#ebe3cf', gold: '#8a7a55' },
  redArmy: { dark: '#27291c', mid: '#646646', light: '#bdb48c', gold: '#b8342f' },
  white: { dark: '#2a2a20', mid: '#6b6a4e', light: '#efe6cc', gold: '#e0bb4c' },
  chekist: { dark: '#08080a', mid: '#1c1c20', light: '#55555c', gold: '#3a3a3a' },
  priest: { dark: '#0d0c0d', mid: '#262427', light: '#e9e4d8', gold: '#c9a227' },
  royalWhite: { dark: '#b2aba0', mid: '#efe9de', light: '#ffffff', gold: '#d4af37' },
  tsar: { dark: '#1f2619', mid: '#4d583c', light: '#efe8d6', gold: '#e2bd45' },
  suit: { dark: '#121216', mid: '#2b2b31', light: '#ece8de', gold: '#8c7a55' },
  mex: { dark: '#2a2420', mid: '#6b5a48', light: '#efe7d6', gold: '#c9a227' },
  stalinT: { dark: '#2a2a22', mid: '#6a6852', light: '#a8a68a', gold: '#7a7860' },
  kerenskiT: { dark: '#2e2a1e', mid: '#7a6a48', light: '#c9b88a', gold: '#8a7a55' },
  rasputinT: { dark: '#0c0b0c', mid: '#1e1c22', light: '#d9cdb4', gold: '#8a6a3a' },
  leather: { dark: '#0a0a0b', mid: '#1a1a1d', light: '#3a3a40', gold: '#5a5a5a' },
  tehuana: { dark: '#3a0f1e', mid: '#9a1f3a', light: '#f2c84a', gold: '#2f7a4a' },
  overall: { dark: '#1e2632', mid: '#3e5068', light: '#e9e2d0', gold: '#8a7a55' },
  raincoat: { dark: '#4a3e2c', mid: '#a8956e', light: '#e2d6b8', gold: '#6a5a3a' },
  general: { dark: '#24261c', mid: '#5a5e40', light: '#ece2c6', gold: '#e2bd45' },
  feldgrau: { dark: '#2e302c', mid: '#6a6e64', light: '#c9c8bc', gold: '#c9a227' },
};
const uni = (r, p) => uniformize(r, PAL[p] || p);

// ------------------------------------------------------------ headgear
// Peaked service cap (furazhka) with an oval cockade.
export function furazhka({ crown = '#6f6a4c', band = '#6f6a4c', visor = '#141414', cockade = ['#d27a2a', '#141414', '#f2ede2'] } = {}) {
  const g = new THREE.Group();
  g.add(at(mesh(new THREE.CylinderGeometry(0.235, 0.24, 0.085, 32, 1, true), std(band, { side: THREE.DoubleSide })), 0, 0.045, 0));
  const top = mesh(new THREE.CylinderGeometry(0.29, 0.245, 0.06, 32), std(crown)); top.scale.set(1, 1, 0.94); top.position.set(0, 0.115, -0.01); top.rotation.x = -0.06; g.add(top);
  const v = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.012, 24, 1, false, -Math.PI / 2.4, Math.PI / 1.2), std(visor, { roughness: 0.4, metalness: 0.2 }));
  v.scale.set(1, 1, 0.95); v.position.set(0, 0.012, 0.1); v.rotation.x = 0.25; g.add(v);
  cockade.forEach((c, i) => { const d = mesh(new THREE.CircleGeometry(0.03 - i * 0.008, 16), std(c, { side: THREE.DoubleSide })); d.scale.set(0.8, 1, 1); d.position.set(0, 0.055, 0.241 + i * 0.002); g.add(d); });
  return g;
}
// Budenovka: pointed cloth helmet with a big red star (Red Army, 1919-).
export function budenovka(color = '#646646', starCol = '#b8342f') {
  const g = new THREE.Group();
  g.add(lathe([[0, 0.42], [0.03, 0.4], [0.1, 0.31], [0.19, 0.2], [0.245, 0.11], [0.26, 0.04], [0.258, 0.0]], color, 32, { roughness: 0.95 }));
  const tip = mesh(new THREE.SphereGeometry(0.025, 10, 8), std(color)); tip.position.y = 0.425; g.add(tip);
  const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, rr = i % 2 ? 0.045 : 0.11; const x = Math.sin(a) * rr, y = Math.cos(a) * rr; i ? s.lineTo(x, y) : s.moveTo(x, y); }
  const st = mesh(new THREE.ExtrudeGeometry(s, { depth: 0.01, bevelEnabled: false }), std(starCol, { roughness: 0.7 }));
  st.position.set(0, 0.17, 0.205); st.rotation.x = -0.42; g.add(st);
  const flap = mesh(new THREE.CylinderGeometry(0.262, 0.262, 0.07, 28, 1, true, Math.PI * 0.62, Math.PI * 0.76), std(color, { side: THREE.DoubleSide })); flap.position.y = 0.0; g.add(flap);
  return g;
}
// Sailor's peakless cap (beskozyrka) with the ship's name on the band and two ribbons at the back.
export function beskozyrka(text = 'АВРОРА', { top = '#151b2e', band = '#0d0d10', piping = '#f2f2f0' } = {}) {
  const g = new THREE.Group();
  const tex = canvasTex(512, 64, (x, W, H) => { x.fillStyle = band; x.fillRect(0, 0, W, H); x.fillStyle = '#d9b44a'; x.font = '900 40px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, W / 4, H / 2 + 2); });
  const b = mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.07, 36, 1, true), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, side: THREE.DoubleSide }));
  b.rotation.y = Math.PI / 2 + 0.25; b.position.y = 0.04; g.add(b);
  const t = mesh(new THREE.CylinderGeometry(0.285, 0.245, 0.055, 36), std(top)); t.position.y = 0.1; g.add(t);
  g.add(at(mesh(new THREE.TorusGeometry(0.285, 0.008, 6, 36), std(piping)), 0, 0.127, 0, Math.PI / 2, 0, 0));
  for (const s of [-1, 1]) { const rb = mesh(new THREE.PlaneGeometry(0.035, 0.26), std('#0d0d10', { side: THREE.DoubleSide })); rb.position.set(s * 0.04, -0.09, -0.235); rb.rotation.set(0.18, 0, s * 0.12); g.add(rb); }
  return g;
}
// Worker's peaked cloth cap (kartuz).
export function kartuz(color = '#2b2a2c') {
  const g = new THREE.Group();
  const c = mesh(new THREE.SphereGeometry(0.27, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), std(color, { roughness: 0.95 })); c.scale.set(1, 0.42, 1.04); c.position.y = 0.02; g.add(c);
  const v = mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.014, 24, 1, false, -Math.PI / 2.6, Math.PI / 1.3), std(color, { roughness: 0.9 })); v.scale.set(1, 1, 1.0); v.position.set(0, 0.015, 0.14); v.rotation.x = 0.2; g.add(v);
  return g;
}
// Headscarf (platok): covers the hair, leaves the face open, knotted under the chin.
export function platok(color = '#a8342e', pattern = '#e8d9b0') {
  const g = new THREE.Group();
  const tex = canvasTex(128, 128, (x, W, H) => { x.fillStyle = color; x.fillRect(0, 0, W, H); x.fillStyle = pattern; for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) if ((i + j) % 2 === 0) { x.beginPath(); x.arc(i * 16 + 8, j * 16 + 8, 2.6, 0, 7); x.fill(); } });
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, side: THREE.DoubleSide });
  const gap = 1.25; // open wedge in front for the face
  const d = mesh(new THREE.SphereGeometry(0.3, 32, 18, Math.PI / 2 + gap / 2, Math.PI * 2 - gap, 0, Math.PI * 0.7), mat);
  d.scale.set(1.04, 1.0, 1.04); d.position.set(0, -0.1, -0.01); g.add(d);
  const brow = mesh(new THREE.TorusGeometry(0.29, 0.03, 6, 28, Math.PI * 0.9), mat); brow.rotation.set(-Math.PI / 2 + 0.25, 0, Math.PI * 0.05); brow.position.set(0, 0.0, 0.0); g.add(brow);
  const k = mesh(new THREE.SphereGeometry(0.028, 10, 8), std(color)); k.position.set(0, -0.42, 0.1); g.add(k);
  return g;
}
// Tall fur hat (papakha); grey for soldiers, black with a red top for Cossacks.
export function papakhaR(furCol = '#4a4239', top = '#6a6256', h = 0.24) {
  const g = new THREE.Group(); h = Math.min(h, 0.19);            // lower, rounded fur hat (a tall straight cylinder reads as a stovepipe on chibis)
  const prof = [[0.0, h + 0.012], [0.16, h + 0.01], [0.24, h - 0.012], [0.282, h - 0.05], [0.29, h * 0.45], [0.284, 0.02], [0.27, 0]];
  const geo = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 32), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)), y = p.getY(i); const k = 1 + 0.03 * Math.sin(a * 13 + y * 37) * Math.cos(a * 5); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); }
  geo.computeVertexNormals(); const f = mesh(geo, std(furCol, { roughness: 1, side: THREE.DoubleSide })); g.add(f);
  g.add(at(mesh(new THREE.CircleGeometry(0.2, 28), std(top, { side: THREE.DoubleSide })), 0, h + 0.014, 0, -Math.PI / 2, 0, 0));
  return g;
}
// Fur hat with ear flaps (ushanka).
export function ushanka(color = '#3a3028', fur = '#5a4a3a') {
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(0.29, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)), y = p.getY(i); const k = 1 + 0.02 * Math.sin(a * 13 + y * 40); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); }
  geo.computeVertexNormals(); const c = mesh(geo, std(color, { roughness: 1 })); c.scale.set(1, 0.6, 1); c.position.y = 0.02; g.add(c);
  const band = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.09, 28, 1, true), std(fur, { roughness: 1, side: THREE.DoubleSide })); band.position.y = 0.05; g.add(band);
  for (const s of [-1, 1]) { const f = mesh(new THREE.BoxGeometry(0.05, 0.16, 0.14), std(fur, { roughness: 1 })); f.position.set(s * 0.28, -0.04, 0.0); g.add(f); }
  return g;
}
export const fur = (top = '#6a6256') => papakha(top);

// ------------------------------------------------------------ accessories
export function redBow() {
  const g = new THREE.Group();
  for (const s of [-1, 1]) { const l = mesh(new THREE.ConeGeometry(0.03, 0.06, 4), std('#c0272d', { roughness: 0.6 })); l.rotation.z = s * Math.PI / 2; l.position.x = s * 0.028; g.add(l); }
  g.add(mesh(new THREE.SphereGeometry(0.014, 8, 6), std('#a81f26')));
  return g;
}
export function crossOrth(color = '#d9b44a') {
  const g = new THREE.Group(); g.add(at(box(0.012, 0.07, 0.008, color), 0, 0, 0)); g.add(at(box(0.045, 0.01, 0.008, color), 0, 0.012, 0)); g.add(at(box(0.03, 0.008, 0.008, color), 0, -0.018, 0, 0, 0, 0.35));
  return g;
}
const rifle = r => r.equip(musket('#2e2f32', '#6a4a2c', true), G.HOLDS);

// ------------------------------------------------------------ outfits
const HAIR_BITS = { tamamo: [[-0.219, 0.957, 0.168], [-0.197, 0.91, 0.112]], suzuka: [[-0.243, 0.921, 0.086], [-0.246, 0.83, 0.094], [-0.285, 0.852, 0.039], [-0.178, 0.875, 0.099]] };
const hat = (r, h, o) => { const w = wearHat(r, h, o); if (HAIR_BITS[r.key]) dropHairBits(r, HAIR_BITS[r.key]); if (o?.cap && r.key === 'tamamo') flattenAhoge(r, 0.02, /^Sp_He_Ribbon\d_[LR]_00/); return w; };
const CAP = { scale: 0.9, y: 0.86, tilt: -0.04, cap: true };
const pick = (r, arr) => arr[Math.floor(r.seed * 7) % arr.length];
export const OUTFITS = {
  soldadoZar: r => { generic(r, '#2e2418'); uni(r, 'tsarSoldier'); hat(r, furazhka({}), CAP); rifle(r); return r; },
  soldadoInvierno: r => { generic(r, '#2e2418'); uni(r, 'greatcoat'); hat(r, papakhaR('#5a5046', '#6a6256', 0.22), { scale: 0.88, y: 0.84, tilt: -0.04, cap: true }); rifle(r); return r; },
  cosaco: r => { generic(r, '#1d1612'); uni(r, 'cossack'); hat(r, papakhaR('#1e1b19', '#b8342f', 0.26), { scale: 0.88, y: 0.84, tilt: -0.04, cap: true }); r.attach('chest', cananas(), [0, 0.39, 0]); rifle(r); return r; },
  oficialZar: r => { generic(r, '#2a221a'); uni(r, 'officer'); hat(r, furazhka({ crown: '#5e6244', band: '#7a2a24' }), CAP); r.attach('chest', epaulettes('#d9b44a'), [0, 0.475, -0.01]); r.attach('chest', crossbelts('#5a4630'), [0, 0.39, 0]); return r; },
  cadete: r => { generic(r, '#2a221a'); uni(r, 'cadet'); hat(r, furazhka({ crown: '#2b3036', band: '#8a2a2a' }), CAP); rifle(r); return r; },
  obrero: r => { generic(r, pick(r, ['#2e2420', '#3a2a20', '#1d1916', '#4a3428'])); uni(r, pick(r, ['worker', 'worker2'])); hat(r, kartuz(pick(r, ['#2b2a2c', '#3a3530', '#2a3040'])), CAP); return r; },
  obrera: r => { generic(r, pick(r, ['#2e2420', '#4a3428', '#3a2a20'])); uni(r, pick(r, ['woman', 'woman2'])); hat(r, platok(pick(r, ['#a8342e', '#2f5a8a', '#6a2a5a', '#3a6a3a'])), { scale: 0.86, y: 0.9, tilt: -0.02 }); return r; },
  campesino: r => { generic(r, '#3a2a20'); uni(r, 'peasant'); hat(r, pick(r, [kartuz('#3a3530'), ushanka()]), CAP); return r; },
  campesina: r => { generic(r, '#4a3428'); uni(r, 'peasant'); hat(r, platok(pick(r, ['#c0392b', '#d9a23a', '#2f5a8a'])), { scale: 0.86, y: 0.9, tilt: -0.02 }); return r; },
  marinero: r => { generic(r, '#1d1916'); uni(r, 'sailor'); hat(r, beskozyrka('АВРОРА'), CAP); r.attach('chest', cananas(), [0, 0.39, 0]); rifle(r); return r; },
  soldadoRevolucion: r => { OUTFITS.soldadoInvierno(r); r.attach('chest', redBow(), [0.07, 0.46, 0.115]); return r; },
  guardiaRoja: r => { OUTFITS.obrero(r); r.attach('chest', redBow(), [0.07, 0.46, 0.115]); rifle(r); return r; },
  ejercitoRojo: r => { generic(r, '#2a221a'); uni(r, 'redArmy'); hat(r, budenovka('#646646'), { scale: 0.88, y: 0.84, tilt: -0.04, cap: true }); rifle(r); return r; },
  blanco: r => { generic(r, '#2a221a'); uni(r, 'white'); hat(r, furazhka({ crown: '#efe6cc', band: '#1a1a1a' }), CAP); r.attach('chest', epaulettes('#e0bb4c'), [0, 0.475, -0.01]); rifle(r); return r; },
  chekista: r => { generic(r, '#1d1612'); uni(r, 'chekist'); hat(r, kartuz('#141416'), CAP); return r; },
  cura: r => { generic(r, '#2a1e16'); uni(r, 'priest'); hideEars(r); flattenAhoge(r); r.attach('chest', crossOrth(), [0, 0.42, 0.12]); return r; },
  duquesa: r => { generic(r, pick(r, ['#5a3a24', '#7a5a3a', '#3a2a20'])); uni(r, 'royalWhite'); hideEars(r); flattenAhoge(r); return r; },
  delegado: r => { generic(r, '#2a221a'); uni(r, 'suit'); hideEars(r); flattenAhoge(r); return r; },
  mexicano: r => { generic(r, '#2a2018'); uni(r, 'mex'); hideEars(r); flattenAhoge(r); return r; },
  // fallbacks for leaders if no full-size model is available
  zarChibi: r => { generic(r, '#4a3426'); uni(r, 'tsar'); hat(r, furazhka({ crown: '#4d583c', band: '#8a2a2a' }), CAP); r.attach('chest', epaulettes('#e2bd45'), [0, 0.475, -0.01]); return r; },
  leninChibi: r => { generic(r, '#3a2a20'); uni(r, 'suit'); hat(r, kartuz('#1a1a1c'), CAP); r.attach('chest', redBow(), [0.07, 0.46, 0.115]); return r; },
  leninSinGorra: r => { generic(r, '#3a2a20'); uni(r, 'suit'); hideEars(r); flattenAhoge(r); r.attach('chest', redBow(), [0.07, 0.46, 0.115]); return r; },
  zarinaChibi: r => { generic(r, '#8a5a34'); uni(r, 'royalWhite'); hideEars(r); flattenAhoge(r); r.attach('head', tiara(), [0, 0.96, 0.02], [-8, 0, 0]); return r; },
  trotskiChibi: r => { generic(r, '#1d1916'); uni(r, 'suit'); hideEars(r); r.attach('head', glasses(false), [0, 0.62, 0.235]); return r; },
  trotskiRojo: r => { generic(r, '#1d1916'); uni(r, 'leather'); hat(r, furazhka({ crown: '#1a1a1d', band: '#1a1a1d', cockade: ['#c0272d', '#c0272d', '#c0272d'] }), CAP); r.attach('head', glasses(false), [0, 0.62, 0.235]); return r; },
  stalinChibi: r => { generic(r, '#1d1612'); uni(r, 'stalinT'); hideEars(r); flattenAhoge(r); return r; },
  kerenskiChibi: r => { generic(r, '#3a2a20'); uni(r, 'kerenskiT'); hideEars(r); flattenAhoge(r); return r; },
  rasputinChibi: r => { generic(r, '#2a1e16'); uni(r, 'rasputinT'); hideEars(r); r.attach('chest', crossOrth('#c9a227'), [0, 0.42, 0.12]); return r; },
  kornilovChibi: r => { generic(r, '#2a221a'); uni(r, 'general'); hat(r, papakhaR('#1e1b19', '#c9a227', 0.24), { scale: 0.88, y: 0.84, tilt: -0.04, cap: true }); r.attach('chest', epaulettes('#e2bd45'), [0, 0.475, -0.01]); r.attach('chest', crossbelts('#5a4630'), [0, 0.39, 0]); return r; },
  generalBlanco: r => { generic(r, '#2a221a'); uni(r, 'white'); hat(r, furazhka({ crown: '#efe6cc', band: '#8a2a2a' }), CAP); r.attach('chest', epaulettes('#e0bb4c'), [0, 0.475, -0.01]); r.attach('chest', crossbelts('#5a4630'), [0, 0.39, 0]); return r; },
  fridaChibi: r => { generic(r, '#1a1412'); uni(r, 'tehuana'); hideEars(r); flattenAhoge(r); r.attach('head', flowerCrown(), [0, 0.95, -0.02], [-6, 0, 0]); return r; },
  diegoChibi: r => { generic(r, '#2a2018'); uni(r, 'overall'); hat(r, tophat('#4a3a2a'), { scale: 0.86, y: 0.9, tilt: -0.04 }); return r; },
  cardenasChibi: r => { generic(r, '#1d1612'); uni(r, 'suit'); hideEars(r); flattenAhoge(r); return r; },
  mercaderChibi: r => { generic(r, '#2a1e16'); uni(r, 'raincoat'); hideEars(r); flattenAhoge(r); return r; },
  oficialAleman: r => { generic(r, '#3a2a20'); uni(r, 'feldgrau'); hat(r, furazhka({ crown: '#6a6e64', band: '#8a2a24', cockade: ['#141414', '#f2ede2', '#b8241e'] }), CAP); r.attach('chest', epaulettes('#c9c8bc'), [0, 0.475, -0.01]); return r; },
  soldadoBlanco: r => { generic(r, '#2a221a'); uni(r, 'white'); hat(r, furazhka({ crown: '#efe6cc', band: '#1a1a1a' }), CAP); rifle(r); return r; },
  camuflaje: r => { generic(r, '#2a221a'); uni(r, { dark: '#9aa4aa', mid: '#e6eaec', light: '#f6f8f8', gold: '#c8cfd2' }); hat(r, ushanka('#e8ecee', '#d0d6da'), CAP); rifle(r); return r; },
};
// Ring of flowers (Frida Kahlo).
export function flowerCrown() {
  const g = new THREE.Group(), cols = ['#c0272d', '#f2c84a', '#e86a8a', '#c0272d', '#f29a3a', '#9a2a8a', '#c0272d'];
  for (let i = 0; i < 7; i++) { const a = -1.2 + i * 0.4; const f = mesh(new THREE.SphereGeometry(i === 3 ? 0.07 : 0.05, 10, 8), std(cols[i])); f.position.set(Math.sin(a) * 0.24, 0.02 + Math.cos(a) * 0.05, Math.cos(a) * 0.12 - 0.02); g.add(f); }
  for (let i = 0; i < 6; i++) { const a = -1.0 + i * 0.4; const l = mesh(new THREE.SphereGeometry(0.03, 6, 4), std('#2f7a4a')); l.scale.set(1.4, 0.5, 1); l.position.set(Math.sin(a) * 0.27, -0.02, Math.cos(a) * 0.1 - 0.04); g.add(l); }
  return g;
}
export const CASTING = {};

let seedCounter = 0;
export function person(parent, who, outfit = who, x = 0, z = 0, yaw = 0) {
  const key = CASTING[who] || who;
  const r = C_.spawn(key); r.seed = (seedCounter++ * 1.37) % 10; OUTFITS[outfit](r);
  r.root.position.set(x, 0, z); r.root.rotation.y = yaw; parent.add(r.root); r.who = who; return r;
}
export function crowd(parent, outfit, n, [x0, z0, x1, z1], { seed = 1, yaw = 0, cast = ['doto', 'oguri', 'suzuka', 'helios', 'tamamo', 'mcqueen', 'daiwa', 'cafe'] } = {}) {
  const r = rng(seed), out = [];
  const cols = Math.ceil(Math.sqrt(n * (x1 - x0) / Math.max(0.1, z1 - z0)));
  for (let i = 0; i < n; i++) {
    const cx = i % cols, cz = Math.floor(i / cols), rows = Math.ceil(n / cols);
    const x = x0 + (cx + 0.5) / cols * (x1 - x0) + (r() - 0.5) * 0.35, z = z0 + (cz + 0.5) / rows * (z1 - z0) + (r() - 0.5) * 0.35;
    const o = Array.isArray(outfit) ? outfit[i % outfit.length] : outfit;
    out.push(person(parent, cast[i % cast.length], o, x, z, yaw + (r() - 0.5) * 0.4));
  }
  return out;
}
