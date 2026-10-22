// Cast for the Second World War video. Same motion layer and anime finish as the what-if video (whatif/kit.js): the
// Allied and Mexican leaders are full-size stand-ins, each recalled by a hat or a prop; the Axis dictators and Stalin
// never become characters, only flat dark cut-out silhouettes. Chibis play the soldiers and civilians of 1939-45, in
// uniforms recoloured from their own clothes. No Nazi symbols anywhere. Hats never hide the ears.
import * as THREE from 'three';
import * as WK from '../whatif/kit.js';
import * as P from '../lib/props.js';
import { mesh, box, cyl, at } from '../lib/props.js';
import { generic, sombrero } from '../mx/kit.js';
import { uniformize } from '../napo/kit.js';
import { hat } from '../amer/kit.js';
import { HOLDS } from '../lib/gear.js';
import { stahlhelm, brodie, adrian, serviceCap, kepiFR, bowler, nurseVeil, pack, PAL as W1 } from '../ww1/kit.js';
export * from '../whatif/kit.js';
export { hat, sombrero };

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.82, ...o });
function lathe(profile, color, seg = 32, opts = {}) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg);
  const m = mesh(g, std(color, { side: THREE.DoubleSide, ...opts })); m.castShadow = true; return m;
}
const star = (r, color = '#c8302a') => { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 - Math.PI / 2, q = i % 2 ? r * 0.42 : r; s[i ? 'lineTo' : 'moveTo'](Math.cos(a) * q, -Math.sin(a) * q); }
  return mesh(new THREE.ShapeGeometry(s), new THREE.MeshStandardMaterial({ color, roughness: 0.5, side: THREE.DoubleSide })); };

// ------------------------------------------------------------ palettes (dark -> mid -> light, gold accents)
export const PAL = {
  feld: W1.feld, khaki: W1.khaki, od: W1.od, nurse: W1.nurse, suitDark: W1.suitDark, suitGrey: W1.suitGrey, tweed: W1.tweed,
  sov: { dark: '#2c2f1f', mid: '#6c6b45', light: '#c4bd96', gold: '#b8342f' }, sovWinter: { dark: '#8a8e90', mid: '#e8ecee', light: '#ffffff', gold: '#b8342f' },
  jp: { dark: '#3a3320', mid: '#86794a', light: '#d6c99c', gold: '#b8342f' }, it: { dark: '#2e3328', mid: '#6d735c', light: '#c6c7b4', gold: '#b8a04a' },
  fr40: { dark: '#3a3424', mid: '#7c7250', light: '#c9bd98', gold: '#c9a227' }, pl: { dark: '#2f321f', mid: '#6b6d50', light: '#c2c2a2', gold: '#c9a227' },
  desert: { dark: '#5a4a2a', mid: '#b49a62', light: '#ece0c0', gold: '#c9a227' }, afrika: { dark: '#4a4a30', mid: '#9a9466', light: '#e2dcb8', gold: '#b8a04a' },
  brasil: { dark: '#2c3020', mid: '#6a6a48', light: '#c8c4a0', gold: '#2f8a3a' },
  usNavy: { dark: '#0e1626', mid: '#21304e', light: '#f2f2f0', gold: '#c9a227' }, sailor: { dark: '#141c2c', mid: '#2c3c5c', light: '#efede6', gold: '#c9a227' },
  pilotMx: { dark: '#2e2a1c', mid: '#7a6e4a', light: '#d8ceac', gold: '#2f6a3a' }, flight: { dark: '#2a1e14', mid: '#6a4a30', light: '#d8c8a8', gold: '#c9a227' },
  rosie: { dark: '#152238', mid: '#33507e', light: '#f1ede4', gold: '#c0272d' }, worker: { dark: '#2a2420', mid: '#5a4a3a', light: '#e8dcc6', gold: '#8a7a55' },
  bracero: { dark: '#3a3020', mid: '#9a8a62', light: '#f0e8d4', gold: '#a08a5a' }, wren: { dark: '#11182a', mid: '#27345a', light: '#f2f0ea', gold: '#c9a227' },
  dressA: { dark: '#5a3a3a', mid: '#9a5a5a', light: '#f4ede4', gold: '#c9a227' }, dressB: { dark: '#2a3a4a', mid: '#4a6a8a', light: '#f2f0ea', gold: '#c9a227' },
  dressC: { dark: '#3a4a2a', mid: '#6a8a5a', light: '#f4f2e6', gold: '#c9a227' }, dressD: { dark: '#4a3a52', mid: '#7a6a8a', light: '#f4f0f4', gold: '#c9a227' },
  coatA: { dark: '#1e1a18', mid: '#4a3e36', light: '#d8d0c4', gold: '#8a7a55' }, coatB: { dark: '#1a1e24', mid: '#3e4652', light: '#d8d8d4', gold: '#8a7a55' },
  coatC: { dark: '#2a2016', mid: '#6a5640', light: '#e6dcc6', gold: '#8a7a55' }, kid: { dark: '#2a2a3a', mid: '#5a5a7a', light: '#f2f0ea', gold: '#c0272d' },
  fisher: { dark: '#2a2a1e', mid: '#5a5a3a', light: '#e6dfc8', gold: '#c9a227' }, diplo: { dark: '#101216', mid: '#24282f', light: '#f1efea', gold: '#8c7a55' },
  waaf: { dark: '#1a2230', mid: '#4a5a74', light: '#e6e6e0', gold: '#c9a227' }, afs: { dark: '#0e1218', mid: '#1e2632', light: '#c8c8c0', gold: '#c0272d' },
  panzer: { dark: '#0e0e10', mid: '#1e1e22', light: '#3c3c44', gold: '#c8c8c8' },
  roc: { dark: '#20262c', mid: '#4e5a64', light: '#c8ccc8', gold: '#c9a227' },
  sci: { dark: '#8a8a86', mid: '#eeeeea', light: '#ffffff', gold: '#6a8aa8' }, mourn: { dark: '#0e0e10', mid: '#24242a', light: '#d8d6d0', gold: '#6a6a6a' },
};
const uni = (r, p) => uniformize(r, PAL[p] || p);
const HAIRS = ['#3a2a20', '#2a2018', '#4a3428', '#1d1612', '#5a4030', '#2e2420', '#6a4a30'];
const anon = r => generic(r, HAIRS[(r.seed * 7 | 0) % HAIRS.length]);
const pick = (r, list) => list[Math.floor(r.seed * 7.3) % list.length];
const HELM = { scale: 0.9, y: 0.86, tilt: -0.04, cap: true };
const CAP = { scale: 0.88, y: 0.88, tilt: -0.05, cap: true };

// ------------------------------------------------------------ headgear (hat space: head radius ≈ 0.25, y = 0 at the brow)
// M1 helmet (US, 1941-): round dome, short even brim, net-less, chin strap down.
export function m1(color = '#59603f') {
  const g = new THREE.Group();
  g.add(lathe([[0.3, -0.01], [0.305, 0.0], [0.285, 0.02], [0.27, 0.09], [0.245, 0.17], [0.19, 0.24], [0.11, 0.28], [0, 0.295]], color, 36, { roughness: 0.75 }));
  for (const s of [-1, 1]) g.add(at(box(0.012, 0.16, 0.025, '#4a4a32'), s * 0.27, -0.07, 0.03));
  return g;
}
// SSh-40 (Soviet): tall dome, small flare at the rim, red star at the front.
export function ssh40(color = '#4f5a3a') {
  const g = new THREE.Group();
  g.add(lathe([[0.31, -0.02], [0.3, 0.0], [0.275, 0.03], [0.265, 0.11], [0.235, 0.2], [0.17, 0.27], [0.09, 0.305], [0, 0.315]], color, 36, { roughness: 0.75 }));
  const s = star(0.045); s.position.set(0, 0.13, 0.268); s.rotation.x = -0.25; g.add(s); return g;
}
// Side cap (Soviet pilotka with a red star, German Feldmütze, US garrison cap).
export function sideCap(color = '#6c6b45', { mark = null } = {}) {
  const g = new THREE.Group(), m = std(color, { roughness: 0.85, side: THREE.DoubleSide });
  const body = mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.13, 24, 1, true), m); body.scale.set(0.62, 1, 1.12); body.position.y = 0.06; g.add(body);
  const top = mesh(new THREE.BoxGeometry(0.02, 0.07, 0.5), m); top.position.y = 0.13; g.add(top);
  for (const sx of [-1, 1]) { const w = mesh(new THREE.PlaneGeometry(0.5, 0.12), m); w.position.set(sx * 0.12, 0.08, 0); w.rotation.y = Math.PI / 2; w.rotation.x = sx * 0.12; w.scale.set(1, 1, 1); g.add(w); }
  if (mark === 'star') { const s = star(0.035); s.position.set(0, 0.07, 0.282); g.add(s); }
  return g;
}
// Japanese field cap with a neck curtain and a yellow star.
export function jpCap(color = '#86794a') {
  const g = new THREE.Group(), m = std(color, { roughness: 0.85, side: THREE.DoubleSide });
  const dome = mesh(new THREE.SphereGeometry(0.255, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), m); dome.scale.set(1, 0.62, 1.04); g.add(dome);
  const peak = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.012, 24, 1, false, -Math.PI / 2.6, Math.PI / 1.3), m); peak.scale.set(1, 1, 1.15); peak.position.set(0, 0.0, 0.2); peak.rotation.x = 0.16; g.add(peak);
  for (let i = 0; i < 4; i++) { const a = Math.PI * (0.62 + i * 0.25), f = mesh(new THREE.PlaneGeometry(0.17, 0.2), m); f.position.set(Math.sin(a) * 0.255, -0.09, Math.cos(a) * 0.265); f.rotation.y = a; g.add(f); }
  const s = star(0.032, '#e0b830'); s.position.set(0, 0.09, 0.262); s.rotation.x = -0.3; g.add(s); return g;
}
// Italian M33 helmet: rounded, gently flared all round.
export function m33(color = '#6d735c') {
  return lathe([[0.32, -0.015], [0.3, 0.0], [0.27, 0.04], [0.262, 0.12], [0.23, 0.2], [0.16, 0.265], [0.08, 0.295], [0, 0.3]], color, 36, { roughness: 0.75 });
}
// Leather flight helmet with goggles pushed up on the forehead.
export function flightCap(color = '#5a3a24') {
  const g = new THREE.Group(), m = std(color, { roughness: 0.6 });
  const dome = mesh(new THREE.SphereGeometry(0.27, 28, 14, 0, Math.PI * 2, 0, Math.PI / 1.7), m); dome.scale.set(1, 0.85, 1.05); g.add(dome);
  for (const s of [-1, 1]) g.add(at(box(0.03, 0.2, 0.14, color), s * 0.26, -0.07, 0.0));
  const strap = mesh(new THREE.TorusGeometry(0.262, 0.012, 6, 32), std('#3a2a1e')); strap.rotation.x = Math.PI / 2 - 0.25; strap.position.set(0, 0.07, 0.02); g.add(strap);
  for (const s of [-1, 1]) { const lens = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 16), std('#9fc4d8', { roughness: 0.1, metalness: 0.4 })); lens.rotation.x = Math.PI / 2 - 0.4; lens.position.set(s * 0.07, 0.12, 0.24); g.add(lens);
    const rim = mesh(new THREE.TorusGeometry(0.052, 0.01, 6, 16), std('#7a6a4a', { metalness: 0.5 })); rim.rotation.x = -0.4; rim.position.set(s * 0.07, 0.125, 0.255); g.add(rim); }
  return g;
}
// Polka-dot bandana knotted on top (the riveter).
export function bandana(color = '#c0272d', dots = '#ffffff') {
  const tex = WK.canvasTex(128, 64, (x, W, H) => { x.fillStyle = color; x.fillRect(0, 0, W, H); x.fillStyle = dots; for (let i = 0; i < 40; i++) { x.beginPath(); x.arc((i * 23) % W + (i % 2) * 6, ((i * 37) % H), 3, 0, 7); x.fill(); } });
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, side: THREE.DoubleSide });
  const band = mesh(new THREE.SphereGeometry(0.265, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2.4), m); band.scale.set(1, 0.7, 1.05); g.add(band);
  const knot = mesh(new THREE.SphereGeometry(0.05, 10, 8), m); knot.scale.set(1.6, 0.8, 1); knot.position.set(0, 0.2, 0.15); g.add(knot);
  for (const s of [-1, 1]) { const e = mesh(new THREE.ConeGeometry(0.035, 0.12, 6), m); e.position.set(s * 0.07, 0.24, 0.16); e.rotation.z = s * 1.1; g.add(e); }
  return g;
}
// Seaman's knit watch cap.
export function watchCap(color = '#2a3048') { return lathe([[0.275, 0.0], [0.272, 0.06], [0.26, 0.11], [0.22, 0.19], [0.13, 0.25], [0, 0.27]], color, 28, { roughness: 0.95 }); }
// Homburg / fedora (civilian men, the 1940s).
export function fedora(color = '#3a3632', band = '#1a1a1a') {
  const g = new THREE.Group();
  g.add(lathe([[0.42, 0.0], [0.4, 0.015], [0.27, 0.02], [0.26, 0.1], [0.24, 0.17], [0.16, 0.2], [0.05, 0.18], [0, 0.19]], color, 32, { roughness: 0.85 }));
  g.add(lathe([[0.268, 0.025], [0.265, 0.065]], band, 32)); return g;
}

// ------------------------------------------------------------ gear
// A rifle slung across the back (barrel up over the right shoulder): no hands needed, nothing to clip.
export function slungRifle(r, metal = '#2e3138', wood = '#6a4a2e') {
  const g = new THREE.Group(), rf = P.rifle(metal, wood); rf.rotation.x = -Math.PI / 2; g.add(rf);
  const strap = mesh(new THREE.BoxGeometry(0.012, 0.42, 0.01), std('#4a3a26')); strap.position.set(0.0, 0.1, 0.02); g.add(strap);
  g.scale.setScalar(0.85); return r.wear('chest', g, [0.02, 0.4, -0.16], [0, 0, -28]);
}
// A rifle held in both hands (scene poses aim the left hand at .fore); returns the rifle group in the right hand.
export function handRifle(r, metal = '#2e3138', wood = '#6a4a2e') {
  const rf = P.rifle(metal, wood); return WK.holdIn(r, rf, 'R', [0, -0.03, 0.04], [0, 0, 0]);
}
const backpack = (r, c, roll) => r.wear('chest', pack(c, roll), [0, 0.39, -0.16]);
// A suitcase carried in one hand (refugees, evacuees).
export function suitcase(color = '#6a4a2e') {
  const g = new THREE.Group(); g.add(at(box(0.2, 0.15, 0.07, color), 0, -0.1, 0)); g.add(at(box(0.06, 0.012, 0.012, '#2a2018'), 0, -0.02, 0));
  for (const x of [-0.06, 0.06]) g.add(at(box(0.012, 0.155, 0.075, '#c9a227'), x, -0.1, 0)); return g;
}
// Name tag on a string (evacuated children).
// Radio headphones (tank crews): two ear cups and a band over the crown; head space like the hats, worn at the cheeks.
export function headphones(color = '#1a1a1c') {
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.2 });
  for (const sx of [-1, 1]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 18), m); c.rotation.z = Math.PI / 2; c.position.set(sx * 0.27, -0.16, 0.02); g.add(c); }
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.014, 6, 24, Math.PI), m); band.position.set(0, -0.16, 0.0); g.add(band);
  return g;
}
export function nameTag() { const g = new THREE.Group(); g.add(at(box(0.06, 0.04, 0.004, '#f4efe0'), 0, 0, 0)); return g; }

// ------------------------------------------------------------ outfits
Object.assign(WK.OUTFITS, {
  // soldiers
  aleman: r => { anon(r); uni(r, 'feld'); hat(r, stahlhelm('#55594f'), HELM); backpack(r, '#5a5e52', '#4a4e44'); slungRifle(r); return r; },
  waaf: r => { anon(r); uni(r, 'waaf'); hat(r, sideCap('#3e4c64'), CAP); return r; },
  bombero: r => { anon(r); uni(r, 'afs'); hat(r, brodie('#2a2a2c'), { scale: 0.9, y: 0.88, tilt: -0.02, cap: true }); return r; },
  tanquista: r => { anon(r); uni(r, 'panzer'); hat(r, sideCap('#1a1a1e'), CAP); r.wear('head', headphones(), [0, 0.88, -0.02]); return r; },
  alemanGorro: r => { anon(r); uni(r, 'feld'); hat(r, sideCap('#62665b'), CAP); return r; },
  afrika: r => { anon(r); uni(r, 'afrika'); hat(r, sideCap('#a49c70'), CAP); slungRifle(r); return r; },
  britanico: r => { anon(r); uni(r, 'khaki'); hat(r, brodie('#5a5838'), { scale: 0.9, y: 0.88, tilt: -0.02, cap: true }); backpack(r, '#7a6e4a', '#6a6448'); slungRifle(r, '#2e3138', '#7a5232'); return r; },
  desierto: r => { anon(r); uni(r, 'desert'); hat(r, brodie('#8a7a52'), { scale: 0.9, y: 0.88, tilt: -0.02, cap: true }); slungRifle(r, '#2e3138', '#7a5232'); return r; },
  frances: r => { anon(r); uni(r, 'fr40'); hat(r, adrian('#6c6a50'), HELM); backpack(r, '#5a5a48', '#6a6a58'); slungRifle(r); return r; },
  polaco: r => { anon(r); uni(r, 'pl'); hat(r, stahlhelm('#5d6048'), HELM); slungRifle(r); return r; },
  sovietico: r => { anon(r); uni(r, 'sov'); hat(r, ssh40('#4f5a3a'), HELM); slungRifle(r); return r; },
  chino: r => { anon(r); uni(r, 'roc'); hat(r, adrian('#4a5458'), HELM); slungRifle(r); return r; },
  chinoArmado: r => { anon(r); uni(r, 'roc'); hat(r, adrian('#4a5458'), HELM); r.equip(P.rifle('#2e3138', '#6a4a2e'), HOLDS); return r; },
  marineArmado: r => { anon(r); uni(r, 'od'); hat(r, m1('#4f5a38'), HELM); r.equip(P.rifle('#2e3138', '#7a5232'), HOLDS); return r; },
  brasilenoArmado: r => { anon(r); uni(r, 'brasil'); hat(r, m1('#5d6044'), HELM); r.equip(P.rifle('#2e3138', '#7a5232'), HOLDS); return r; },
  desiertoArmado: r => { anon(r); uni(r, 'desert'); hat(r, brodie('#8a7a52'), { scale: 0.9, y: 0.88, tilt: -0.02, cap: true }); r.equip(P.rifle('#2e3138', '#7a5232'), HOLDS); return r; },
  sovieticoArmado: r => { anon(r); uni(r, 'sov'); hat(r, ssh40('#4f5a3a'), HELM); r.equip(P.rifle('#2e3138', '#6a4a2e'), HOLDS); return r; },
  sovieticoInviernoArmado: r => { anon(r); uni(r, 'sovWinter'); hat(r, ssh40('#e6eaec'), HELM); r.equip(P.rifle('#2e3138', '#6a4a2e'), HOLDS); return r; },
  sovieticoGorro: r => { anon(r); uni(r, 'sov'); hat(r, sideCap('#6c6b45', { mark: 'star' }), CAP); slungRifle(r); return r; },
  sovieticoInvierno: r => { anon(r); uni(r, 'sovWinter'); hat(r, ssh40('#e6eaec'), HELM); slungRifle(r); return r; },
  estadounidense: r => { anon(r); uni(r, 'od'); hat(r, m1('#59603f'), HELM); backpack(r, '#6a6440', '#5a5636'); slungRifle(r, '#2e3138', '#7a5232'); return r; },
  marine: r => { anon(r); uni(r, 'od'); hat(r, m1('#4f5a38'), HELM); slungRifle(r, '#2e3138', '#7a5232'); return r; },
  japones: r => { anon(r); uni(r, 'jp'); hat(r, jpCap('#86794a'), CAP); slungRifle(r, '#2e3138', '#6a4a2e'); return r; },
  italiano: r => { anon(r); uni(r, 'it'); hat(r, m33('#6d735c'), HELM); slungRifle(r); return r; },
  brasileno: r => { anon(r); uni(r, 'brasil'); hat(r, m1('#5d6044'), HELM); slungRifle(r, '#2e3138', '#7a5232'); return r; },
  // air and sea
  pilotoRAF: r => { anon(r); uni(r, 'flight'); hat(r, flightCap('#4a3424'), { scale: 0.9, y: 0.84, tilt: -0.04, cap: true }); return r; },
  pilotoMx: r => { anon(r); uni(r, 'pilotMx'); hat(r, flightCap('#5a3a24'), { scale: 0.9, y: 0.84, tilt: -0.04, cap: true }); return r; },
  mecanicoMx: r => { anon(r); uni(r, 'pilotMx'); hat(r, sideCap('#7a6e4a'), CAP); return r; },
  brujaNoche: r => { anon(r); uni(r, 'flight'); hat(r, flightCap('#3a2a1e'), { scale: 0.9, y: 0.84, tilt: -0.04, cap: true }); return r; },
  marinero: r => { anon(r); uni(r, 'sailor'); hat(r, watchCap(pick(r, ['#2a3048', '#3a2a2a', '#2a2a2a'])), { scale: 0.92, y: 0.86, tilt: -0.04, cap: true }); return r; },
  pescador: r => { anon(r); uni(r, 'fisher'); hat(r, watchCap(pick(r, ['#5a3a2a', '#2a3a4a', '#4a4a30'])), { scale: 0.92, y: 0.86, tilt: -0.04, cap: true }); return r; },
  // the home front
  remachadora: r => { anon(r); uni(r, 'rosie'); hat(r, bandana(), { scale: 0.92, y: 0.84, tilt: -0.04 }); return r; },
  obrero: r => { anon(r); uni(r, pick(r, ['worker', 'coatC'])); hat(r, sideCap(pick(r, ['#3a3a40', '#4a3a2a'])), CAP); return r; },
  descifradora: r => { anon(r); uni(r, pick(r, ['dressA', 'dressB', 'dressC', 'dressD', 'wren'])); return r; },
  cientifico: r => { anon(r); uni(r, 'sci'); return r; },
  enfermera: r => { anon(r); uni(r, 'nurse'); hat(r, nurseVeil(), { scale: 0.86, y: 0.88, tilt: -0.04 }); return r; },
  civil: r => { anon(r); uni(r, pick(r, ['coatA', 'coatB', 'coatC', 'tweed', 'suitGrey'])); if (r.seed * 3 % 1 < 0.5) hat(r, fedora(pick(r, ['#3a3632', '#2a2a2e', '#4a3a2a'])), CAP); return r; },
  civilMujer: r => { anon(r); uni(r, pick(r, ['dressA', 'dressB', 'dressC', 'dressD', 'coatB'])); return r; },
  nino: r => { anon(r); uni(r, 'kid'); r.wear('chest', nameTag(), [0.05, 0.44, 0.105]); return r; },
  refugiado: r => { anon(r); uni(r, pick(r, ['coatA', 'coatB', 'coatC'])); return r; },
  ana: r => { anon(r); uni(r, 'dressB'); return r; },
  turing: r => { anon(r); uni(r, 'tweed'); return r; },
  wren: r => { anon(r); uni(r, 'wren'); return r; },
  ninoGueto: r => { anon(r); uni(r, pick(r, ['kid', 'coatC'])); return r; },
  duelo: r => { anon(r); uni(r, 'mourn'); return r; },
  bracero: r => { anon(r); uni(r, 'bracero'); hat(r, sombrero('palm'), { scale: 0.8, y: 0.9, tilt: -0.05 }); return r; },
  diputado: r => { anon(r); uni(r, pick(r, ['diplo', 'suitDark', 'suitGrey'])); return r; },
  diplomatico: r => { anon(r); uni(r, pick(r, ['diplo', 'suitDark', 'suitGrey'])); return r; },
});

// ------------------------------------------------------------ leaders (full-size stand-ins)
// key -> [model key, name, role]
export const WHO = {
  churchill: ['tamamoB', 'Winston Churchill', 'Primer ministro del Reino Unido'],
  roosevelt: ['sirius', 'Franklin D. Roosevelt', 'Presidente de Estados Unidos'],
  degaulle: ['mcqueenB', 'Charles de Gaulle', 'Líder de la Francia Libre'],
  avila: ['rudolf', 'Manuel Ávila Camacho', 'Presidente de México (1940–1946)'],
};
export const SASH = ['#0f6b3f', '#f6f3ea', '#c3262f'];
// A cigar between two fingers of the right hand (Churchill).
export function cigar() { const g = new THREE.Group(); g.add(at(cyl(0.011, 0.012, 0.13, '#5a3a22', 8), 0, 0, 0, 0, 0, Math.PI / 2)); g.add(at(cyl(0.0115, 0.0115, 0.012, '#e8e0d0', 8), 0.065, 0, 0, 0, 0, Math.PI / 2));
  const ember = mesh(new THREE.SphereGeometry(0.011, 8, 6), new THREE.MeshBasicMaterial({ color: '#ff6a2a' })); ember.position.x = 0.072; g.add(ember); return g; }
export function stand_in(set, key, x = 0, z = 0, yaw = 0) {
  const [model] = WHO[key], r = WK.leader(set, model, x, z, yaw); r.wwii = key;
  if (key === 'churchill') { hat(r, bowler('#1a1a1c'), { scale: 0.9, y: 0.88, tilt: -0.04 }); r.cigar = WK.holdIn(r, cigar(), 'R', [0.0, -0.03, 0.04], [0, 0, 0], 0.45); }
  if (key === 'degaulle') hat(r, kepiFR({ top: '#6a6a50', band: '#2a2a2a', visor: '#141414', gold: 2 }), { scale: 0.9, y: 1.04, tilt: -0.04 });   // her crown sits higher than the mapped brow
  if (key === 'avila') WK.fitSash(r, SASH, { emblem: WK.eagleKnot() });
  return r;
}
// ------------------------------------------------------------ silhouettes (the dictators are never characters)
// Flat cut-outs drawn on a canvas: black figures with a faint red rim, two gesture frames for a little life.
const SIL = {
  hitler: (x, k) => { podium(x); body(x, { cap: 'peak' }); arm(x, 'R', k ? [[300, 330], [372, 268], [384, 196]] : [[300, 330], [372, 330], [388, 286]], 26); fist(x, k ? [384, 188] : [390, 280]); arm(x, 'L', [[212, 330], [170, 420], [196, 470]], 26); },
  mussolini: (x, k) => { rail(x); body(x, { cap: 'bald', tilt: k ? -0.12 : -0.05 }); arm(x, 'R', [[300, 330], [352, 410], [300, 470]], 28); arm(x, 'L', [[212, 330], [160, 410], [212, 470]], 28); },
  rommel: (x, k) => { body(x, { cap: 'peak' }); x.fillStyle = BLACK; x.fillRect(214, 192, 84, 16); for (const sx of [236, 276]) { x.beginPath(); x.arc(sx, 200, 13, 0, 7); x.fill(); }   // goggles on the cap
    arm(x, 'R', k ? [[300, 330], [372, 300], [440, 268]] : [[300, 330], [350, 420], [318, 470]], 26); arm(x, 'L', [[212, 330], [200, 400], [236, 372]], 26); x.fillRect(222, 352, 34, 26); },
  stalin: (x, k) => { body(x, { cap: 'peak', coat: true }); arm(x, 'R', [[300, 330], [330, 420], k ? [300, 400] : [296, 430]], 28); pipe(x, k ? [300, 392] : [296, 422]); arm(x, 'L', [[212, 330], [196, 440], [204, 520]], 28); },
  tojo: (x, k) => { body(x, { cap: 'peak', glasses: true }); arm(x, 'R', [[300, 330], [318, 440], [312, 540]], 26); arm(x, 'L', [[212, 330], [190, 440], k ? [214, 520] : [206, 530]], 26); sword(x); },
  hirohito: (x, k) => { mic(x); body(x, { cap: 'peak', glasses: true }); arm(x, 'R', [[300, 330], [318, 440], [312, 540]], 26); arm(x, 'L', [[212, 330], [196, 440], [204, 540]], 26); },
};
const BLACK = '#0b0b0e';
function body(x, { cap = 'peak', coat = false, glasses = false, tilt = 0 } = {}) {
  x.fillStyle = BLACK;
  x.beginPath(); x.moveTo(196, 320); x.quadraticCurveTo(256, 296, 316, 320); x.lineTo(coat ? 336 : 312, coat ? 880 : 610); x.lineTo(coat ? 176 : 200, coat ? 880 : 610); x.closePath(); x.fill();   // torso
  if (!coat) { x.fillRect(206, 600, 44, 300); x.fillRect(262, 600, 44, 300); }                                                                              // legs
  x.fillRect(196, 896, 60, 22); x.fillRect(256, 896, 60, 22);
  x.save(); x.translate(256, 250); x.rotate(tilt);
  x.fillRect(-26, 34, 52, 44);                                                                                                                              // neck
  x.beginPath(); x.ellipse(0, 0, 54, 64, 0, 0, Math.PI * 2); x.fill();                                                                                      // head
  if (cap === 'peak') { x.beginPath(); x.ellipse(0, -46, 74, 30, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.ellipse(0, -18, 62, 12, 0, 0, Math.PI * 2); x.fill(); }
  if (glasses) { x.strokeStyle = 'rgba(160,160,170,0.55)'; x.lineWidth = 4; for (const s of [-1, 1]) { x.beginPath(); x.arc(s * 22, 4, 13, 0, 7); x.stroke(); } }
  x.restore();
}
function arm(x, side, pts, w) { x.strokeStyle = BLACK; x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(...pts[0]); for (const p of pts.slice(1)) x.lineTo(...p); x.stroke(); }
function fist(x, [cx, cy]) { x.fillStyle = BLACK; x.beginPath(); x.arc(cx, cy, 20, 0, 7); x.fill(); }
function podium(x) { x.fillStyle = BLACK; x.beginPath(); x.moveTo(150, 520); x.lineTo(362, 520); x.lineTo(340, 920); x.lineTo(172, 920); x.closePath(); x.fill(); x.fillRect(196, 470, 120, 56); }
function rail(x) { x.fillStyle = BLACK; x.fillRect(80, 560, 352, 26); for (let i = 0; i < 9; i++) x.fillRect(96 + i * 40, 586, 14, 330); x.fillRect(80, 900, 352, 24); }
function pipe(x, [cx, cy]) { x.strokeStyle = BLACK; x.lineWidth = 9; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx - 30, cy - 18); x.stroke(); x.fillStyle = BLACK; x.fillRect(cx - 44, cy - 34, 18, 22); }
function sword(x) { x.strokeStyle = BLACK; x.lineWidth = 12; x.beginPath(); x.moveTo(196, 560); x.quadraticCurveTo(150, 700, 160, 860); x.stroke(); }
function mic(x) { x.fillStyle = BLACK; x.fillRect(370, 360, 10, 560); x.beginPath(); x.ellipse(375, 350, 22, 34, 0, 0, 7); x.fill(); x.fillRect(340, 900, 70, 20); }
export function silhouette(kind, h = 2.6) {
  const frames = [0, 1].map(k => WK.canvasTex(512, 960, (x, W, H) => {
    x.shadowColor = 'rgba(210,50,30,0.85)'; x.shadowBlur = 22; SIL[kind](x, k); x.shadowBlur = 0; SIL[kind](x, k); }));
  const mat = new THREE.MeshBasicMaterial({ map: frames[0], transparent: true, alphaTest: 0.02, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(h * 512 / 960, h), mat); m.geometry.translate(0, h / 2, 0);
  m.userData.dynamic = true; m.frames = frames;
  m.gesture = (t, rate = 1.6) => { const k = Math.floor(t * rate) % 2; if (mat.map !== frames[k]) { mat.map = frames[k]; mat.needsUpdate = true; } m.scale.y = 1 + 0.012 * Math.sin(t * 5); };
  return m;
}
// A huge soft shadow of the same figure thrown on a wall behind (menace without a face).
export function shadowOf(sil, s = 3.2, opacity = 0.55) {
  const mat = new THREE.MeshBasicMaterial({ map: sil.frames[0], transparent: true, opacity, depthWrite: false, color: '#000000', toneMapped: false });
  const m = new THREE.Mesh(sil.geometry, mat); m.scale.setScalar(s); m.userData.dynamic = true;
  m.follow = () => { mat.map = sil.material.map; }; return m;
}
