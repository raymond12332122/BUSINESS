// Costumes and props for the Mexican Revolution video.
import * as THREE from 'three';
import * as P from '../lib/props.js';
import * as G from '../lib/gear.js';
import { at, box, cyl, mesh, rng } from '../lib/props.js';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });

// ------------------------------------------------------------ character tweaks
// Shrink the horse ears so hats sit naturally (ears are driven by Sp_He_Ear0_*_00 bones).
export function hideEars(rig, s = 0.06) {
  rig.model.traverse(o => { if (o.isBone && /^Sp_He_Ear0_[LR]_00/.test(o.name)) o.scale.setScalar(s); });
}
// Hide antenna-like hair strands that would poke through a hat.
export function flattenAhoge(rig, s = 0.2, re = /^Sp_He_Hair[01]_C_00/) {
  rig.model.traverse(o => { if (o.isBone && re.test(o.name)) o.scale.setScalar(s); });
}
// Anonymous extras: give clones a darker hair tint so crowds don't read as copies of the leaders.
export function generic(rig, hair = '#4a3428', skin = null) {
  rig.model.traverse(o => {
    if (!o.isMesh) return;
    const n = o.material.name || '';
    if (/hair/i.test(n)) { o.material = o.material.clone(); o.material.color.set(hair); }
  });
  rig.generic = true; return rig;
}

// ------------------------------------------------------------ hats (lathe profiles: [radius, height])
function lathe(profile, color, seg = 40, opts = {}) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg);
  const m = mesh(g, std(color, { side: THREE.DoubleSide, flatShading: false, ...opts })); m.castShadow = true; return m;
}
export function sombrero(style = 'charro', color = null) {
  const g = new THREE.Group();
  const S = {
    // Zapata: dark felt charro hat, tall crown, wide upturned brim, silver band
    charro: { col: '#4a3d35', band: '#c9c3b8', prof: [[0, 0.5], [0.1, 0.49], [0.19, 0.44], [0.25, 0.32], [0.29, 0.16], [0.31, 0.06], [0.36, 0.03], [0.55, 0.0], [0.7, 0.03], [0.78, 0.09], [0.8, 0.13], [0.78, 0.11], [0.68, 0.04], [0.5, -0.015], [0.33, -0.01], [0.31, 0.0]] },
    // Villa: tan felt sombrero, medium crown
    villa: { col: '#b39466', band: '#5a3d25', prof: [[0, 0.42], [0.12, 0.41], [0.21, 0.36], [0.27, 0.25], [0.3, 0.1], [0.32, 0.05], [0.4, 0.02], [0.58, 0.0], [0.7, 0.04], [0.74, 0.08], [0.72, 0.065], [0.6, 0.01], [0.42, -0.01], [0.32, 0.0]] },
    // campesino palm hat: light straw, round crown
    palm: { col: '#dcc483', band: '#8a6a3a', prof: [[0, 0.4], [0.14, 0.39], [0.23, 0.33], [0.29, 0.2], [0.31, 0.06], [0.36, 0.03], [0.6, 0.0], [0.74, 0.03], [0.78, 0.06], [0.76, 0.05], [0.6, 0.0], [0.36, -0.01], [0.31, 0.0]] },
    // texana / campaign hat (Obregón, Carranza, US troops)
    texana: { col: '#8a7350', band: '#3e2f22', prof: [[0, 0.3], [0.08, 0.31], [0.18, 0.29], [0.26, 0.2], [0.29, 0.08], [0.31, 0.03], [0.44, 0.01], [0.52, 0.02], [0.54, 0.035], [0.52, 0.02], [0.44, -0.005], [0.31, 0.0]] },
    panama: { col: '#efe6cf', band: '#2a2320', prof: [[0, 0.27], [0.08, 0.28], [0.18, 0.27], [0.26, 0.19], [0.29, 0.08], [0.31, 0.03], [0.44, 0.012], [0.5, 0.03], [0.52, 0.04], [0.5, 0.028], [0.44, -0.004], [0.31, 0.0]] },
    campaign: { col: '#7d6a45', band: '#4a3a24', prof: [[0, 0.27], [0.05, 0.285], [0.12, 0.27], [0.22, 0.2], [0.28, 0.1], [0.3, 0.04], [0.32, 0.02], [0.48, 0.008], [0.52, 0.0], [0.48, -0.006], [0.31, 0.0]] },
  }[style];
  const k = { charro: 0.64, villa: 0.7, palm: 0.62, texana: 0.9, campaign: 0.9, panama: 0.9 }[style];
  const prof = S.prof.map(([r, y]) => [r > 0.33 ? 0.33 + (r - 0.33) * k : r, y]);
  g.add(lathe(prof, color || S.col));
  const band = mesh(new THREE.CylinderGeometry(0.305, 0.31, 0.05, 40, 1, true), std(S.band, { side: THREE.DoubleSide }));
  band.position.y = 0.06; g.add(band);
  if (style === 'charro') for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; const d = mesh(new THREE.SphereGeometry(0.012, 6, 4), std('#e8e4dc', { metalness: 0.6, roughness: 0.3 })); d.position.set(Math.cos(a) * (0.33 + 0.29 * k), 0.022, Math.sin(a) * (0.33 + 0.29 * k)); g.add(d); }
  return g;
}
export function kepi(color = '#3d4a63') {
  // Kepi: soft-edged crown that leans forward over a short black visor, gold band and red piping.
  const g = new THREE.Group();
  const crown = lathe([[0, 0.31], [0.16, 0.31], [0.222, 0.302], [0.25, 0.28], [0.272, 0.21], [0.296, 0.11], [0.318, 0.025], [0.322, 0.0]], color, 36);
  crown.rotation.x = 0.2; crown.position.z = -0.025; g.add(crown);
  const pip = mesh(new THREE.TorusGeometry(0.22, 0.009, 4, 28), std('#9a2f2a')); pip.rotation.x = -Math.PI / 2 + 0.2; pip.position.set(0, 0.302, 0.036); g.add(pip);
  const vis = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.016, 24, 1, false, -0.8, 1.6), std('#141414', { roughness: 0.4 })); vis.position.set(0, 0.008, 0.03); vis.rotation.x = 0.22; g.add(vis);
  const band = mesh(new THREE.CylinderGeometry(0.322, 0.325, 0.05, 28, 1, true), std('#c9a227', { metalness: 0.5, roughness: 0.4, side: THREE.DoubleSide })); band.position.y = 0.03; g.add(band);
  return g;
}
export function bowler(color = '#1d1b1d') {
  const g = new THREE.Group();
  g.add(lathe([[0, 0.3], [0.14, 0.29], [0.24, 0.22], [0.28, 0.1], [0.29, 0.03], [0.36, 0.015], [0.4, 0.03], [0.38, 0.02], [0.3, 0.0]], color));
  return g;
}

// ------------------------------------------------------------ body pieces
export function cananas() {
  const g = new THREE.Group();
  const beltMat = std('#6b4a2b'), brass = std('#d8b04a', { metalness: 0.7, roughness: 0.35 });
  for (const s of [1, -1]) {
    const t = new THREE.Group(); t.rotation.z = s * 0.72; g.add(t);
    const belt = mesh(new THREE.TorusGeometry(0.155, 0.02, 6, 36), beltMat); belt.scale.set(0.82, 1.32, 1.05); t.add(belt);
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.2; const b = mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.05, 6), brass);
      b.position.set(Math.cos(a) * 0.155 * 0.82, Math.sin(a) * 0.155 * 1.32, 0.165 * 1.05 * 0.02 + 0.162); b.position.z = 0.16; t.add(b); }
  }
  return g;
}
export function jacket(color, { buttons = null, trim = null } = {}) {
  const g = new THREE.Group();
  const v = mesh(new THREE.CylinderGeometry(0.1, 0.112, 0.16, 16), std(color)); v.scale.z = 0.92; g.add(v);
  if (buttons) for (let i = 0; i < 4; i++) { const b = mesh(new THREE.SphereGeometry(0.011, 6, 4), std(buttons, { metalness: 0.7, roughness: 0.3 })); b.position.set(0.035 * (i % 2 ? 1 : -1), 0.05 - Math.floor(i / 2) * 0.05, 0.1); g.add(b); }
  if (trim) { const t = mesh(new THREE.TorusGeometry(0.1, 0.008, 4, 20), std(trim, { metalness: 0.5 })); t.rotation.x = Math.PI / 2; t.position.y = 0.075; g.add(t); }
  return g;
}
export function epaulettes(color = '#d4af37') {
  const g = new THREE.Group();
  for (const s of [-1, 1]) { const e = mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.02, 12), std(color, { metalness: 0.6, roughness: 0.35 })); e.position.set(s * 0.13, 0, 0); g.add(e);
    for (let i = 0; i < 7; i++) { const f = mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.035, 4), std(color, { metalness: 0.6 })); const a = i / 7 * Math.PI * 2; f.position.set(s * 0.13 + Math.cos(a) * 0.045, -0.018, Math.sin(a) * 0.045); g.add(f); } }
  return g;
}
export function medals() {
  const g = new THREE.Group();
  ['#d4af37', '#c0c0c0', '#d4af37', '#b87333'].forEach((c, i) => { const m = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.006, 10), std(c, { metalness: 0.7, roughness: 0.3 }));
    m.rotation.x = Math.PI / 2; m.position.set(-0.05 + i * 0.03, 0, 0); g.add(m);
    const r = box(0.022, 0.02, 0.004, ['#b22222', '#2f6b3a', '#1f3f8f', '#b22222'][i]); r.position.set(-0.05 + i * 0.03, 0.022, 0); g.add(r); });
  return g;
}
export function glasses(dark = false) {
  const g = new THREE.Group(), frame = std(dark ? '#111' : '#7a6a4a', { metalness: 0.5, roughness: 0.4 });
  for (const s of [-1, 1]) {
    const r = mesh(new THREE.TorusGeometry(0.058, 0.008, 6, 20), frame); r.position.set(s * 0.1, 0, 0); g.add(r);
    if (dark) { const l = mesh(new THREE.CircleGeometry(0.056, 20), new THREE.MeshBasicMaterial({ color: '#141518', transparent: true, opacity: 0.92 })); l.position.set(s * 0.1, 0, 0.002); g.add(l); }
  }
  const br = box(0.06, 0.008, 0.008, dark ? '#111' : '#7a6a4a'); g.add(br);
  return g;
}
export function rebozo(color = '#7a3b5a') {
  const g = new THREE.Group();
  const t = mesh(new THREE.TorusGeometry(0.13, 0.04, 8, 24), std(color)); t.rotation.x = Math.PI / 2; t.scale.set(1, 0.85, 1); g.add(t);
  const tail = box(0.08, 0.2, 0.03, color); tail.position.set(0.07, -0.1, 0.1); tail.rotation.z = 0.2; g.add(tail);
  return g;
}
export function manta() { return jacket('#efe7d6'); }

function stripeTex(colors, n = 12) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256; const g = c.getContext('2d');
  for (let i = 0; i < n; i++) { g.fillStyle = colors[i % colors.length]; g.fillRect(0, i * 256 / n, 64, 256 / n + 1); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
// Diagonal sash across the chest (shoulder to hip). colors: stripes across the band's width.
export function sash(colors = ['#1f7a3a', '#f4f1ea', '#c0272d'], width = 0.075) {
  const g = new THREE.Group();
  const c = document.createElement('canvas'); c.width = 96; c.height = 8; const x = c.getContext('2d');
  colors.forEach((col, i) => { x.fillStyle = col; x.fillRect(i * 96 / colors.length, 0, 96 / colors.length + 1, 8); });
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const geo = new THREE.TorusGeometry(0.16, width / 2, 2, 40); // flat-ish ring = band
  const m = mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }));
  m.scale.set(0.8, 1.35, 1.0); m.rotation.z = -0.75;
  // map the stripes across the band: torus uv.y runs around the tube
  const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getY(i), 0.5);
  g.add(m); return g;
}
export function crossbelts(color = '#ece6d6') {
  const g = new THREE.Group();
  for (const s of [1, -1]) { const t = mesh(new THREE.TorusGeometry(0.155, 0.014, 4, 36), std(color)); t.scale.set(0.82, 1.32, 1.05); t.rotation.z = s * 0.72; g.add(t); }
  const buckle = box(0.04, 0.04, 0.01, '#c9a227'); buckle.position.set(0, -0.02, 0.17); g.add(buckle);
  return g;
}
export function sarape(colors = ['#b5332e', '#e0a43a', '#2f6b8a', '#efe6d2', '#3f7d4e']) {
  const g = new THREE.Group();
  const tex = stripeTex(colors, 15);
  const geo = new THREE.TorusGeometry(0.15, 0.05, 10, 30);
  const m = mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 })); m.scale.set(1, 1.25, 0.95); m.rotation.z = 0.7; g.add(m);
  return g;
}

// ------------------------------------------------------------ outfits
// Each outfit takes a rig and dresses it. Hats ride on the head bone.
const HEAD_Y = 0.92;
export function wearHat(rig, hat, { y = HEAD_Y, tilt = -0.12, scale = 0.86, cap = false } = {}) {
  hideEars(rig); flattenAhoge(rig); rig.hat = hat;
  if (cap) { flattenAhoge(rig, 0.02, /^Sp_He_Hair[01]_C_00/); flattenAhoge(rig, 0.3, /^Sp_He_(Hair0_[LR]|Ribbon\d_[LR])_00/); } // close-fitting caps: tuck top strands and ribbons
  hat.scale.setScalar(scale); rig.attach('head', hat, [0, y, -0.02], [tilt * 57.3, 0, 0]); return hat;
}
export const OUTFITS = {
  diaz: r => { r.attach('chest', sash(), [0, 0.4, 0]); r.attach('chest', epaulettes(), [0, 0.475, -0.01]); r.attach('chest', medals(), [-0.04, 0.44, 0.11]); return r; },
  madero: r => r,
  presidente: r => { r.attach('chest', sash(), [0, 0.4, 0]); return r; },
  villa: r => { wearHat(r, sombrero('villa')); r.attach('chest', cananas(), [0, 0.39, 0]); r.equip(P.rifle('#3b3a36', '#8a5a32'), G.HOLDS); return r; },
  zapata: r => { wearHat(r, sombrero('charro'), { scale: 0.78 }); r.attach('chest', cananas(), [0, 0.39, 0]); r.equip(P.rifle('#3b3a36', '#8a5a32'), G.HOLDS); return r; },
  huerta: r => { wearHat(r, kepi('#34405a'), { scale: 1.0, tilt: 0.04, y: 0.86, cap: true }); r.attach('chest', epaulettes(), [0, 0.475, -0.01]); r.attach('head', glasses(true), [0, 0.69, 0.2]); return r; },
  carranza: r => { wearHat(r, sombrero('texana', '#c9bfa8'), { scale: 0.86 }); r.attach('head', glasses(false), [0, 0.69, 0.2]); return r; },
  obregon: r => { wearHat(r, sombrero('texana')); r.attach('chest', crossbelts('#5a4630'), [0, 0.39, 0]); r.equip(P.rifle('#3b3a36', '#7a5232'), G.HOLDS); return r; },
  adelita: r => { wearHat(r, sombrero('palm'), { scale: 0.82 }); r.attach('chest', rebozo('#8a3b4a'), [0, 0.47, -0.01]); r.attach('chest', cananas(), [0, 0.39, 0]); r.equip(P.rifle('#3b3a36', '#8a5a32'), G.HOLDS); return r; },
  campesino: r => { generic(r); wearHat(r, sombrero('palm')); r.attach('chest', sarape(), [0, 0.4, 0]); return r; },
  rebelde: r => { generic(r); wearHat(r, sombrero(['palm', 'villa'][(r.seed | 0) % 2])); r.attach('chest', cananas(), [0, 0.39, 0]); r.equip(P.rifle('#3b3a36', '#8a5a32'), G.HOLDS); return r; },
  federal: r => { generic(r, '#3a2c26'); wearHat(r, kepi('#3d4a63'), { scale: 1.0, tilt: 0.04, y: 0.86, cap: true }); r.attach('chest', crossbelts(), [0, 0.39, 0]); r.equip(P.rifle('#2e3138', '#5a4632'), G.HOLDS); return r; },
  constitucionalista: r => { generic(r, '#3d2c22'); wearHat(r, sombrero('texana')); r.attach('chest', cananas(), [0, 0.39, 0]); r.equip(P.rifle('#3b3a36', '#7a5232'), G.HOLDS); return r; },
  gringo: r => { generic(r, '#6a5236'); wearHat(r, sombrero('campaign')); r.attach('chest', crossbelts('#5a4a30'), [0, 0.39, 0]); r.equip(P.rifle('#2e3138', '#5a4632'), G.HOLDS); return r; },
  politico: r => { generic(r, '#2e2420'); return r; },
  orozco: r => { generic(r, '#3a2a20'); wearHat(r, sombrero('texana')); r.attach('chest', cananas(), [0, 0.39, 0]); r.equip(P.rifle('#3b3a36', '#8a5a32'), G.HOLDS); return r; },
  zapatista: r => { generic(r, '#2e2218'); wearHat(r, sombrero('palm')); r.attach('chest', cananas(), [0, 0.39, 0]); r.equip(P.rifle('#3b3a36', '#8a5a32'), G.HOLDS); return r; },
};
export const CASTING = { diaz: 'mcqueen', madero: 'cafe', villa: 'tamamo', zapata: 'oguri', huerta: 'daiwa', carranza: 'suzuka', obregon: 'helios', adelita: 'doto' };

// Spawn a character dressed in an outfit and add it to a parent (scene or group).
import * as C_ from '../lib/chars.js';
let seedCounter = 0;
export function person(parent, who, outfit = who, x = 0, z = 0, yaw = 0) {
  const key = CASTING[who] || who;
  const r = C_.spawn(key); r.seed = (seedCounter++ * 1.37) % 10; OUTFITS[outfit](r);
  r.root.position.set(x, 0, z); r.root.rotation.y = yaw; parent.add(r.root); r.who = who; return r;
}

// Apply a pose; characters wearing hats never tilt the head far back (that would show the dark brim underside).
export function pose(r, p) {
  if (r.hat && p.head) p.head = [Math.min(12, Math.max(p.head[0], -3)), p.head[1], p.head[2]];
  if (r.hat && p.chest) p.chest = [Math.min(14, Math.max(p.chest[0], -4)), p.chest[1], p.chest[2]];
  if (r.hat && p.waist && !p.bend) p.waist = [Math.min(10, p.waist[0]), p.waist[1], p.waist[2]];
  r.apply(p);
}
