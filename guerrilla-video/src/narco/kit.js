// Costumes for the corruption & cartels video: present-day suits, uniforms and gear.
// Outfits recolour the chibi clothes with the Napoleonic uniform shader (napo/kit.js uniformize) and add modern
// hats, vests and accessories on top.
import * as THREE from 'three';
import * as P from '../lib/props.js';
import * as G from '../lib/gear.js';
import * as C_ from '../lib/chars.js';
import { mesh, box, cyl, at } from '../lib/props.js';
import { hideEars, flattenAhoge, generic, wearHat, glasses, sombrero } from '../mx/kit.js';
import { uniformize, sash, faceTint, dropHairBits } from '../napo/kit.js';

export { faceTint, generic, hideEars };
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function lathe(profile, color, seg = 32, opts = {}) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg);
  const m = mesh(g, std(color, { side: THREE.DoubleSide, ...opts })); m.castShadow = true; return m;
}

// ------------------------------------------------------------ palettes (dark -> main -> light trims)
export const PAL = {
  suit: { dark: '#101216', mid: '#24282f', light: '#f1efea', gold: '#8c7a55' },
  suitNavy: { dark: '#0f1424', mid: '#252f4a', light: '#f1efea', gold: '#b89a5a' },
  suitGray: { dark: '#25272c', mid: '#55595f', light: '#f1efea', gold: '#8c7a55' },
  suitAmlo: { dark: '#1e2025', mid: '#353940', light: '#6c7078', gold: '#8c7a55' },
  army: { dark: '#232a1b', mid: '#56613f', light: '#b4ae8a', gold: '#3a3f2c' },
  guardia: { dark: '#2e2b24', mid: '#7d7262', light: '#cfc5b0', gold: '#4a4232' },
  marina: { dark: '#16223a', mid: '#34507a', light: '#8aa0bc', gold: '#c9a227' },
  police: { dark: '#0b1222', mid: '#1d2b4e', light: '#dfe4ec', gold: '#c9a227' },
  police80: { dark: '#3a3324', mid: '#8a7b58', light: '#e6dcc2', gold: '#c9a227' },
  narco80: { dark: '#2a1e14', mid: '#8a6a44', light: '#f1e6cf', gold: '#d4af37' },
  sicario: { dark: '#0e0e0f', mid: '#25262a', light: '#55575c', gold: '#3a3a3a' },
  civ1: { dark: '#1d2638', mid: '#47689a', light: '#f3f3f1', gold: '#a08a5a' },
  civ2: { dark: '#2a2420', mid: '#8a5a3a', light: '#efe6d6', gold: '#a08a5a' },
  civ3: { dark: '#2a2a2a', mid: '#7a3040', light: '#f0e8e0', gold: '#a08a5a' },
  civ4: { dark: '#1e2a22', mid: '#4c7a5a', light: '#f2efe6', gold: '#a08a5a' },
  buscadora: { dark: '#3a3a40', mid: '#e9e5dd', light: '#ffffff', gold: '#c9a227' },
  judge: { dark: '#08080a', mid: '#18181d', light: '#d8d8d8', gold: '#8a8a8a' },
  lab: { dark: '#7c8a8e', mid: '#dbe3e5', light: '#f6f8f8', gold: '#c9c9c9' },
  farmer: { dark: '#2a2420', mid: '#6b5a48', light: '#efe7d6', gold: '#c9a227' },
  prisoner: { dark: '#5a3a14', mid: '#d4892e', light: '#f2d9b0', gold: '#c97a1e' },
  fgr: { dark: '#0c0d10', mid: '#1c1f26', light: '#cfd3da', gold: '#d4af37' },
  policeMun: { dark: '#1a2a40', mid: '#3d5a80', light: '#e6eaf0', gold: '#c9a227' },
};
const uni = (r, p) => uniformize(r, PAL[p] || p);

// ------------------------------------------------------------ hats & headgear
// Baseball cap; `front` text is printed on the crown (POLICÍA, GN...).
export function cap(color = '#1d2b4e', { front = '', fg = '#e8e4d8', brim = null } = {}) {
  const g = new THREE.Group();
  const dome = mesh(new THREE.SphereGeometry(0.255, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), std(color, { roughness: 0.85 }));
  dome.scale.set(1, 0.62, 1.04); g.add(dome);
  const b = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.014, 24, 1, false, -Math.PI / 2.6, Math.PI / 1.3), std(brim || color, { roughness: 0.85 }));
  b.scale.set(1, 1, 1.1); b.position.set(0, 0.008, 0.2); b.rotation.x = 0.14; g.add(b);
  const btn = mesh(new THREE.SphereGeometry(0.018, 8, 6), std(color)); btn.position.y = 0.16; g.add(btn);
  if (front) {
    const tex = canvasTex(256, 64, (x, W, H) => { x.fillStyle = fg; x.font = '900 40px Inter, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(front, W / 2, H / 2 + 2); });
    const p = mesh(new THREE.PlaneGeometry(0.2, 0.05), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    p.position.set(0, 0.075, 0.245); p.rotation.x = -0.32; g.add(p);
  }
  return g;
}
// Modern combat helmet (rounded, with a rim and side rails).
export function helmet(color = '#4f5a3a') {
  const g = new THREE.Group();
  const d = mesh(new THREE.SphereGeometry(0.29, 28, 14, 0, Math.PI * 2, 0, Math.PI / 1.85), std(color, { roughness: 0.75 }));
  d.scale.set(1, 0.78, 1.08); g.add(d);
  const rim = mesh(new THREE.TorusGeometry(0.27, 0.02, 6, 28), std(color, { roughness: 0.7 })); rim.rotation.x = Math.PI / 2; rim.scale.set(1, 1.08, 1); rim.position.y = 0.0; g.add(rim);
  for (const s of [-1, 1]) g.add(at(box(0.02, 0.04, 0.16, '#2a2a2a'), s * 0.285, 0.05, 0));
  const nvg = box(0.08, 0.05, 0.03, '#2a2a2a'); nvg.position.set(0, 0.16, 0.27); g.add(nvg);
  return g;
}
// Wide-brimmed sun hat (searching mothers, farmers).
export function sunHat(color = '#e8dcc0', band = '#7a3b5a') {
  const g = new THREE.Group();
  g.add(lathe([[0, 0.2], [0.17, 0.19], [0.23, 0.12], [0.25, 0.02], [0.44, 0.0], [0.46, -0.02], [0.3, 0.0], [0.24, 0.0]], color, 32, { roughness: 0.95 }));
  const b = mesh(new THREE.CylinderGeometry(0.245, 0.25, 0.04, 28, 1, true), std(band, { side: THREE.DoubleSide })); b.position.y = 0.04; g.add(b);
  return g;
}
// Balaclava / neck gaiter pulled over the mouth and nose.
export function gaiter(color = '#151515') {
  const g = new THREE.Group();
  const m = mesh(new THREE.CylinderGeometry(0.165, 0.15, 0.16, 20, 1, true, -Math.PI * 0.62, Math.PI * 1.24), std(color, { side: THREE.DoubleSide, roughness: 0.95 }));
  m.scale.set(1.05, 1, 1.0); g.add(m); return g;
}
// Half-face respirator for the lab cooks.
export function respirator() {
  const g = new THREE.Group();
  const f = mesh(new THREE.SphereGeometry(0.08, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), std('#2a2c30', { roughness: 0.5 })); f.rotation.x = Math.PI / 2; f.scale.set(1.15, 0.9, 0.9); g.add(f);
  for (const s of [-1, 1]) { const c = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 14), std('#d48a2a', { roughness: 0.5 })); c.rotation.z = Math.PI / 2 + s * 0.5; c.rotation.y = s * 0.4; c.position.set(s * 0.075, -0.01, 0.05); g.add(c); }
  return g;
}
export function goggles() {
  const g = new THREE.Group(); const m = std('#a8d0e0', { transparent: true, opacity: 0.55, roughness: 0.2, metalness: 0.2 });
  g.add(at(box(0.24, 0.07, 0.04, '#2a2c30'), 0, 0, -0.01)); for (const s of [-1, 1]) g.add(at(mesh(new THREE.BoxGeometry(0.09, 0.05, 0.02), m), s * 0.055, 0, 0.015));
  return g;
}

// ------------------------------------------------------------ body accessories
// Tactical vest with a printed back/front panel (POLICÍA, GUARDIA NACIONAL, MARINA, DEA...).
export function tacVest(color = '#2a2f38', text = '', fg = '#f2efe6') {
  const g = P.vest(color);
  if (text) {
    const tex = canvasTex(256, 64, (x, W, H) => { x.fillStyle = fg; x.font = `900 ${text.length > 9 ? 30 : 40}px Inter, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, W / 2, H / 2 + 2); });
    for (const s of [1, -1]) { const p = mesh(new THREE.PlaneGeometry(0.17, 0.045), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
      p.position.set(0, 0.025, s * 0.104); if (s < 0) p.rotation.y = Math.PI; g.add(p); }
  }
  return g;
}
export function tie(color = '#7a1f2a') {
  const g = new THREE.Group();
  const k = box(0.03, 0.022, 0.014, color); g.add(k);
  const b = mesh(new THREE.ConeGeometry(0.022, 0.11, 4), std(color)); b.rotation.x = Math.PI; b.rotation.y = Math.PI / 4; b.scale.z = 0.4; b.position.y = -0.065; g.add(b);
  return g;
}
// Presidential sash (green-white-red) with the gold eagle knot at the hip.
export function bandaPresidencial() {
  const g = sash(['#0f6b3f', '#f6f3ea', '#c3262f'], 0.07);
  const knot = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 14), std('#d4af37', { metalness: 0.7, roughness: 0.3 }));
  knot.rotation.x = Math.PI / 2; knot.position.set(0.1, -0.13, 0.08); g.add(knot);
  return g;
}
export function goldChain() {
  const t = mesh(new THREE.TorusGeometry(0.11, 0.008, 6, 26), std('#d4af37', { metalness: 0.85, roughness: 0.25 })); t.rotation.x = Math.PI / 2 - 0.35; t.scale.set(1, 1.15, 1);
  return new THREE.Group().add(t);
}
// T-shirt print: a missing person's photo with "TE BUSCAMOS" (no real faces or names).
export function fichaPrint(seed = 0) {
  const tex = canvasTex(160, 200, (x, W, H) => {
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H); x.fillStyle = '#c0272d'; x.font = '900 22px Inter'; x.textAlign = 'center'; x.fillText('TE BUSCAMOS', W / 2, 26);
    x.fillStyle = ['#d9cbb8', '#cdbfa8', '#e2d4c0'][seed % 3]; x.fillRect(30, 38, 100, 120);
    x.fillStyle = '#6b5a4a'; x.beginPath(); x.arc(80, 82, 24, 0, 7); x.fill(); x.beginPath(); x.ellipse(80, 150, 42, 34, 0, Math.PI, 0); x.fill();
    x.fillStyle = '#2a2320'; x.font = '700 16px Inter'; x.fillText('¿LO HAS VISTO?', W / 2, 186);
  });
  const p = mesh(new THREE.PlaneGeometry(0.12, 0.15), new THREE.MeshBasicMaterial({ map: tex })); return new THREE.Group().add(p);
}
export function apron(color = '#d9d0bd') { const a = box(0.2, 0.18, 0.01, color); return new THREE.Group().add(a); }

// ------------------------------------------------------------ outfits
// Ear ornaments in the hair mesh float beside the head once the ears are hidden and poke out of hats.
const HAIR_BITS = { tamamo: [[-0.219, 0.957, 0.168], [-0.197, 0.91, 0.112]], suzuka: [[-0.243, 0.921, 0.086], [-0.246, 0.83, 0.094], [-0.285, 0.852, 0.039], [-0.178, 0.875, 0.099]] };
const hat = (r, h, o) => { const w = wearHat(r, h, o); if (HAIR_BITS[r.key]) dropHairBits(r, HAIR_BITS[r.key]); if (o?.cap && r.key === 'tamamo') flattenAhoge(r, 0.02, /^Sp_He_Ribbon\d_[LR]_00/); return w; };
const rifle = (r, c = '#2e3138') => r.equip(P.rifle(c, c), G.HOLDS);
function politician(r, pal = 'suit', { sashOn = false, specs = false, tieCol = '#7a1f2a' } = {}) {
  uni(r, pal); hideEars(r); flattenAhoge(r);
  if (sashOn) r.attach('chest', bandaPresidencial(), [0, 0.4, 0]); else r.attach('chest', tie(tieCol), [0, 0.47, 0.105]);
  if (specs) r.attach('head', glasses(false), [0, 0.69, 0.2]);
  return r;
}
// Oguri's gold headband diamonds and blue ear ornament (hair-mesh islands) read as costume jewellery on a politician.
const OGURI_BITS = [[-0.164, 0.9, 0.175], [-0.093, 0.926, 0.212], [0, 0.938, 0.228], [0.093, 0.926, 0.212], [0.164, 0.9, 0.175], [-0.17, 1.027, 0.006], [-0.176, 0.98, 0.003], [-0.187, 1.045, 0.012], [-0.158, 1.003, 0.003]];
export const OUTFITS = {
  // real people (nameplates in the scenes say who they are)
  calderon: r => { generic(r, '#2a221d'); return politician(r, 'suit', { sashOn: true, specs: true }); },
  pena: r => { generic(r, '#1d1916'); return politician(r, 'suitNavy', { sashOn: true }); },
  amlo: r => { dropHairBits(r, OGURI_BITS); return politician(r, 'suitAmlo', { sashOn: true }); },
  amloSuit: r => { dropHairBits(r, OGURI_BITS); return politician(r, 'suitAmlo', {}); },
  sheinbaum: r => politician(r, 'suitNavy', { sashOn: true }),
  sheinbaumSuit: r => politician(r, 'suitNavy', { tieCol: '#b8a37a' }),
  harfuch: r => { generic(r, '#1d1916'); return politician(r, 'suit', { tieCol: '#2a3a5a' }); },
  garcialuna: r => { generic(r, '#211b17'); return politician(r, 'suitGray', { tieCol: '#3a2a4a' }); },
  official: r => { generic(r, '#2e2420'); return politician(r, 'suit', {}); },
  judge: r => { generic(r, '#2a2420'); uni(r, 'judge'); hideEars(r); flattenAhoge(r); r.attach('head', glasses(false), [0, 0.69, 0.2]); return r; },
  // security forces
  soldier: r => { generic(r, '#2a221a'); uni(r, 'army'); hat(r, helmet('#4f5a3a'), { scale: 0.9, y: 0.86, tilt: -0.04, cap: true }); r.attach('chest', tacVest('#3f4830', 'SEDENA', '#e8e2c8'), [0, 0.395, -0.005]); rifle(r); return r; },
  guardia: r => { generic(r, '#2a221a'); uni(r, 'guardia'); hat(r, cap('#2a2824', { front: 'GN', fg: '#d8c58a' }), { scale: 0.88, y: 0.88, tilt: -0.05, cap: true }); r.attach('chest', tacVest('#3a352c', 'GUARDIA NACIONAL', '#e8dcc0'), [0, 0.395, -0.005]); rifle(r); return r; },
  marino: r => { generic(r, '#2a221a'); uni(r, 'marina'); hat(r, helmet('#253b60'), { scale: 0.9, y: 0.86, tilt: -0.04, cap: true }); r.attach('chest', tacVest('#1b2a45', 'MARINA', '#e8ecf2'), [0, 0.395, -0.005]); rifle(r); return r; },
  police: r => { generic(r, '#2a221a'); uni(r, 'police'); hat(r, cap('#141d33', { front: 'POLICÍA', fg: '#e8e4d8' }), { scale: 0.88, y: 0.88, tilt: -0.05, cap: true }); r.attach('chest', tacVest('#1a2238', 'POLICÍA', '#f2efe6'), [0, 0.395, -0.005]); return r; },
  policeArmed: r => { OUTFITS.police(r); rifle(r); return r; },
  police80: r => { generic(r, '#2a221a'); uni(r, 'police80'); hat(r, cap('#4a4232', { front: '', brim: '#2a2620' }), { scale: 0.88, y: 0.88, tilt: -0.05, cap: true }); return r; },
  dea: r => { generic(r, '#3a2a20'); uni(r, 'police'); r.attach('chest', tacVest('#1a1f2a', 'DEA', '#f2d36a'), [0, 0.395, -0.005]); hideEars(r); flattenAhoge(r); return r; },
  // crime (generic, no real faces)
  narco80: r => { generic(r, '#1d1612'); uni(r, 'narco80'); hat(r, sombrero('texana', '#e8dcc0'), { scale: 0.8 }); r.attach('chest', goldChain(), [0, 0.47, 0.01]); return r; },
  sicario: r => { generic(r, '#151210'); uni(r, 'sicario'); hat(r, cap('#151515'), { scale: 0.88, y: 0.88, tilt: -0.05, cap: true }); r.attach('head', gaiter(), [0, 0.6, 0.02]); return r; },
  sicarioArmed: r => { OUTFITS.sicario(r); rifle(r, '#1e1f22'); return r; },
  cook: r => { generic(r, '#2a221a'); uni(r, 'lab'); hat(r, cap('#d9e2e4'), { scale: 0.88, y: 0.88, tilt: -0.05, cap: true }); r.attach('head', respirator(), [0, 0.6, 0.2]); return r; },
  prisoner: r => { generic(r, '#1d1612'); uni(r, 'prisoner'); hideEars(r); flattenAhoge(r); return r; },
  // civilians
  civil: r => { generic(r, ['#2e2420', '#3a2a20', '#1d1916', '#4a3428'][Math.floor(r.seed * 7) % 4]); uni(r, ['civ1', 'civ2', 'civ3', 'civ4'][Math.floor(r.seed * 3) % 4]); hideEars(r); flattenAhoge(r); return r; },
  civilCap: r => { OUTFITS.civil(r); hat(r, cap(['#7a2a2a', '#2a4a7a', '#2f2f2f', '#d8d2c4'][Math.floor(r.seed * 5) % 4]), { scale: 0.88, y: 0.88, tilt: -0.05, cap: true }); return r; },
  joven: r => { generic(r, ['#2e2420', '#1d1916', '#4a3428'][Math.floor(r.seed * 7) % 3]); uni(r, ['civ1', 'civ4', 'civ3'][Math.floor(r.seed * 3) % 3]); hideEars(r); flattenAhoge(r); return r; },
  shopkeeper: r => { generic(r, '#3a2a20'); uni(r, 'civ2'); hideEars(r); flattenAhoge(r); r.attach('chest', apron(), [0, 0.36, 0.1]); return r; },
  farmer: r => { generic(r, '#2a2018'); uni(r, 'farmer'); hat(r, sombrero('palm'), { scale: 0.82 }); return r; },
  buscadora: r => { generic(r, ['#2e2420', '#4a3428', '#6a6460'][Math.floor(r.seed * 7) % 3]); uni(r, 'buscadora'); hat(r, sunHat('#e8dcc0', ['#7a3b5a', '#2a5a7a', '#c0272d'][Math.floor(r.seed * 5) % 3]), { scale: 0.86, y: 0.9, tilt: -0.06 }); r.attach('chest', fichaPrint(Math.floor(r.seed * 3)), [0, 0.43, 0.108]); return r; },
  marcha: r => { OUTFITS.joven(r); return r; },
  // Puebla video
  armenta: r => { generic(r, '#1d1916'); return politician(r, 'suit', { tieCol: '#7a1f2a' }); },
  alcalde: r => { generic(r, '#2a221d'); return politician(r, 'suitGray', { tieCol: '#5a2a2a' }); },
  fgr: r => { generic(r, '#2a221a'); uni(r, 'fgr'); hat(r, cap('#111216', { front: 'FGR', fg: '#d4af37' }), { scale: 0.88, y: 0.88, tilt: -0.05, cap: true }); r.attach('chest', tacVest('#15171c', 'FGR', '#d4af37'), [0, 0.395, -0.005]); rifle(r); return r; },
  estatal: r => { generic(r, '#2a221a'); uni(r, 'police'); hat(r, cap('#141d33', { front: 'ESTATAL', fg: '#e8e4d8' }), { scale: 0.88, y: 0.88, tilt: -0.05, cap: true }); r.attach('chest', tacVest('#1a2238', 'POLICÍA ESTATAL', '#f2efe6'), [0, 0.395, -0.005]); rifle(r); return r; },
  municipal: r => { generic(r, '#2a221a'); uni(r, 'policeMun'); hat(r, cap('#22344f', { front: 'MUNICIPAL', fg: '#e8e4d8' }), { scale: 0.88, y: 0.88, tilt: -0.05, cap: true }); r.attach('chest', tacVest('#22344f', 'MUNICIPAL', '#f2efe6'), [0, 0.395, -0.005]); return r; },
  huachicolero: r => { OUTFITS.civilCap(r); r.attach('head', gaiter(), [0, 0.6, 0.02]); return r; },
  trailero: r => { OUTFITS.civilCap(r); return r; },
  marchaSombrero: r => { OUTFITS.joven(r); hat(r, sombrero('palm'), { scale: 0.8 }); return r; },
  student: r => { generic(r, '#1d1916'); uni(r, 'civ1'); hideEars(r); flattenAhoge(r); return r; },
};
export const CASTING = { armenta: 'suzuka', calderon: 'mcqueen', pena: 'doto', amlo: 'oguri', amloSuit: 'oguri', sheinbaum: 'cafe', sheinbaumSuit: 'cafe', harfuch: 'helios', garcialuna: 'tamamo', judge: 'daiwa' };

let seedCounter = 0;
export function person(parent, who, outfit = who, x = 0, z = 0, yaw = 0) {
  const key = CASTING[who] || who;
  const r = C_.spawn(key); r.seed = (seedCounter++ * 1.37) % 10; OUTFITS[outfit](r);
  r.root.position.set(x, 0, z); r.root.rotation.y = yaw; parent.add(r.root); r.who = who; return r;
}
// Crowd helper: n people of an outfit on a jittered grid.
export function crowd(parent, outfit, n, [x0, z0, x1, z1], { seed = 1, yaw = 0, cast = ['doto', 'oguri', 'suzuka', 'helios', 'tamamo', 'mcqueen', 'daiwa', 'cafe'] } = {}) {
  const r = P.rng(seed), out = [];
  const cols = Math.ceil(Math.sqrt(n * (x1 - x0) / Math.max(0.1, z1 - z0)));
  for (let i = 0; i < n; i++) {
    const cx = i % cols, cz = Math.floor(i / cols), rows = Math.ceil(n / cols);
    const x = x0 + (cx + 0.5) / cols * (x1 - x0) + (r() - 0.5) * 0.35, z = z0 + (cz + 0.5) / rows * (z1 - z0) + (r() - 0.5) * 0.35;
    out.push(person(parent, cast[i % cast.length], outfit, x, z, yaw + (r() - 0.5) * 0.4));
  }
  return out;
}
export { pose } from '../mx/kit.js';
export { dropHairBits };

// Put a prop in a character's hand: attaches to the wrist bone at its rest-pose position (+ offset).
export function hold(r, obj, side = 'R', off = [0, -0.04, 0.03], rot = [0, 0, 0]) {
  r.root.updateMatrixWorld(true);
  const key = side === 'R' ? 'wriR' : 'wriL', b = r.j[key].bone;
  const p = new THREE.Vector3(); b.getWorldPosition(p); p.applyMatrix4(r.root.matrixWorld.clone().invert());
  return r.attach(key, obj, [p.x + off[0], p.y + off[1], p.z + off[2]], rot);
}
