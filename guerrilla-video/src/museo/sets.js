// Sets for "El robo del siglo". Night is the default: Paseo de la Reforma with its Christmas lamps and the museum's
// marble front with the Tláloc monolith; El Paraguas in the moonlit patio; the Maya, Oaxaca and Mexica halls with their
// glass cases; the Maya crypt with Pakal's mask; the air-conditioning duct; the guards' Christmas room; a family's
// Nochebuena dinner; the bedroom with the closet in Satélite; Acapulco at night; the 1989 wiretap room and the raid.
import * as THREE from 'three';
import * as LP from '../lib/props.js';
import { at, box, cyl, mesh, rng } from '../lib/props.js';
import { stage } from '../lib/stage.js';
import { canvasTex, motes, paintedSky, lightShaft } from '../amer/look.js';
import { bake, room as rRoom } from '../rusia/sets.js';
import * as P from './props.js';
import * as RP from '../rusia/props.js';
import * as WP from '../whatif/props.js';
import * as W1 from '../ww1/props.js';
import * as MX from '../mx/props.js';
import * as NP from '../narco/props.js';

export const bakeAll = scenes => scenes.forEach(bake);
const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, ...o });
const glowM = (c, i = 1.5) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: 0.5 });
const ticker = s => { s.ticks = s.ticks || []; if (!s.tick) s.tick = t => s.ticks.forEach(f => f(t)); return s.ticks; };
const dyn = o => { o.userData.dynamic = true; return o; };
const NIGHT_LOOK = { bloom: 0.55, bloomT: 0.9, cool: 0.12, warm: 0.06, vign: 0.5, rim: 0.3, rimColor: '#9fb4ff', shadeTint: '#7a82b8', sat: 1.04 };

// Wall slab along x at z with rectangular holes [x, y, w, h] (windows, doorways, duct openings).
function slab(s, mat, { x0, x1, z, h, th = 0.16, holes = [], y0 = 0 }) {
  const xs = [x0, x1, ...holes.flatMap(([x, , w]) => [x - w / 2, x + w / 2])].sort((a, b) => a - b);
  for (let i = 0; i < xs.length - 1; i++) {
    const a = xs[i], b = xs[i + 1], cx = (a + b) / 2, hole = holes.find(([x, , w]) => cx > x - w / 2 && cx < x + w / 2);
    const piece = (ya, yb) => { if (yb - ya < 1e-3 || b - a < 1e-3) return; const m = new THREE.Mesh(new THREE.BoxGeometry(b - a, yb - ya, th), mat); m.position.set(cx, (ya + yb) / 2, z); m.castShadow = m.receiveShadow = true; s.add(m); };
    if (!hole) piece(y0, h); else { const [, y, , hh] = hole; piece(y0, y - hh / 2); piece(y + hh / 2, h); }
  }
}
function plasterTex(base = '#2c2a27', seed = 3) {
  return canvasTex(512, 512, (c, W, H) => { const r = rng(seed); c.fillStyle = base; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 1400; i++) { const v = r(); c.fillStyle = `rgba(${v > 0.5 ? '255,255,255' : '0,0,0'},0.03)`; c.beginPath(); c.arc(r() * W, r() * H, 3 + r() * 18, 0, 7); c.fill(); } }, { repeat: [3, 2] });
}
function stoneFloorTex(base = '#2b2926', seed = 5, n = 4) {
  return canvasTex(512, 512, (c, W, H) => { const r = rng(seed), s = W / n; c.fillStyle = '#141312'; c.fillRect(0, 0, W, H);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const b = new THREE.Color(base).multiplyScalar(0.85 + r() * 0.3); c.fillStyle = b.getStyle(); c.fillRect(i * s + 2, j * s + 2, s - 4, s - 4);
      for (let k = 0; k < 4; k++) { c.strokeStyle = 'rgba(255,255,255,0.05)'; c.lineWidth = 1 + r() * 2; c.beginPath(); let x = i * s + r() * s, y = j * s; c.moveTo(x, y); for (let q = 0; q < 5; q++) { x += (r() - 0.5) * 30; y += s / 5; c.lineTo(x, y); } c.stroke(); } } }, { repeat: [5, 5] });
}
function blockWallTex(base = '#7e7666', seed = 7) {
  return canvasTex(512, 512, (c, W, H) => { const r = rng(seed), rows = 6, h = H / rows; c.fillStyle = new THREE.Color(base).multiplyScalar(0.5).getStyle(); c.fillRect(0, 0, W, H);
    for (let j = 0; j < rows; j++) { let x = -(j % 2) * 70 - r() * 30; while (x < W) { const w = 100 + r() * 80; c.fillStyle = new THREE.Color(base).multiplyScalar(0.8 + r() * 0.3).getStyle(); c.fillRect(x + 4, j * h + 4, w - 8, h - 8);
      for (let q = 0; q < 30; q++) { c.fillStyle = `rgba(0,0,0,${r() * 0.12})`; c.fillRect(x + r() * w, j * h + r() * h, 3, 3); } x += w; } } }, { repeat: [3, 1.5] });
}
// Mitla stepped-fret (greca) mosaic band, the emblem of the Oaxaca hall.
function grecaTex() {
  return canvasTex(1024, 256, (c, W, H) => { c.fillStyle = '#6e5a46'; c.fillRect(0, 0, W, H); c.fillStyle = '#c8b498'; const u = 32;
    for (let k = 0; k < W / (u * 4); k++) { const x = k * u * 4; c.fillRect(x, H - 2 * u, u * 3, u * 0.7); c.fillRect(x + u * 2.3, u, u * 0.7, H - 3 * u + u * 0.7); c.fillRect(x + u * 0.6, u, u * 2.4, u * 0.7); c.fillRect(x + u * 0.6, u, u * 0.7, u * 2); c.fillRect(x + u * 0.6, u * 2.3, u * 1.3, u * 0.7); }
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, 0, W, 10); c.fillRect(0, H - 10, W, 10); }, { repeat: [2, 1] });
}
// Exit sign glowing green over a doorway ("SALIDA").
function exitSign() { const t = P.textTex('SALIDA', { w: 256, h: 96, bg: '#0e3a1e', fg: '#9affb8', font: '900 64px Inter' }); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.19), new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: '#ffffff', emissiveIntensity: 1.2 })); const g = new THREE.Group(); g.add(m); const L = new THREE.PointLight('#5aff8a', 0.6, 2.4, 1.8); L.position.z = 0.3; g.add(L); return g; }

// ------------------------------------------------------------ Paseo de la Reforma at night, the museum's front
// The avenue runs along x at z = 9..17; the fence stands at z = 4.6; the plaza and the Tláloc in front of the façade (z = -12).
export function reforma({ fireworks = true } = {}) {
  const s = stage({ skyTop: '#03050c', skyHor: '#1e2846', groundA: '#24252a', groundB: '#202126', sunPos: [-30, 40, -60], sunColor: '#8fa6ff', sun: 0.9, hemiSky: '#4a5a8a', hemiGround: '#16161c', hemi: 0.95, shadow: 30, groundSize: 300, seed: 11 });
  s.userData.sun.castShadow = false; s.fog = new THREE.Fog('#0d1220', 30, 140);
  paintedSky(s, { clouds: 0.12, sunCol: '#c8d4ff', sun: 0.5, stars: 1, cloudCol: '#3a4460' });
  const road = at(box(160, 0.02, 9, '#202125'), 0, 0.011, 13); s.add(road);
  for (let x = -78; x < 80; x += 4) s.add(at(box(2, 0.022, 0.12, '#cfc8a8'), x, 0.013, 13));
  s.add(at(box(160, 0.18, 2.4, '#5e5a52'), 0, 0.09, 7.4));    // sidewalk
  s.add(at(box(160, 0.04, 3.4, '#1a2418'), 0, 0.02, 4.8));    // grass strip
  const f = P.fence(80, 1.5); f.position.set(0, 0, 4.6); s.add(f); s.fence = f;
  s.add(at(box(60, 0.03, 16, '#6a665e'), 0, 0.015, -4));      // plaza
  const fac = P.facade(36, 5.4); fac.position.set(0, 0, -12); s.add(fac); s.facade = fac;
  for (const x of [-8, 8]) { const up = new THREE.SpotLight('#ffe8c8', 26, 14, 0.6, 0.7, 1.4); up.position.set(x, 0.3, -6); up.target.position.set(x * 0.8, 4.5, -11.4); s.add(up, up.target); }
  const tl = P.tlaloc(5); tl.position.set(-10.5, 0, 0.5); tl.rotation.y = 0.15; s.add(tl); s.tlaloc = tl;
  const tlL = new THREE.SpotLight('#ffd8a8', 34, 12, 0.5, 0.6, 1.4); tlL.position.set(-8.4, 0.4, 4); tlL.target.position.set(-10.5, 3, 0.5); s.add(tlL, tlL.target);
  s.lamps = [];
  for (let x = -40; x <= 40; x += 10) { const l = P.reformaLamp(5.2, x % 20 === 0 ? '#ffd27a' : '#9ad8ff'); l.position.set(x, 0, 8.6); l.rotation.y = -Math.PI / 2; s.add(l); s.lamps.push(l); }
  // Chapultepec trees behind the museum and along the avenue
  const r = rng(5);
  for (let i = 0; i < 40; i++) { const t = LP.roundTree(1.6 + r() * 1.2, ['#16241a', '#1a2a1e', '#13201a'][i % 3], i, '#1a140e'); t.position.set(-60 + i * 3 + r() * 2, 0, -22 - r() * 12); s.add(t); }
  for (let i = 0; i < 18; i++) { const t = LP.roundTree(1.2 + r() * 0.6, '#16261c', i + 50, '#1a140e'); t.position.set(-46 + i * 5.4 + r(), 0, 19 + r() * 2); s.add(t); }
  // the city glow on the horizon and a few far towers
  for (let i = 0; i < 9; i++) { const b = P.hotelTower(3 + r() * 2, 10 + r() * 16, i + 3); b.position.set(-70 + i * 18 + r() * 6, 0, 60 + r() * 20); b.rotation.y = r(); s.add(b); }
  const moon = new THREE.Mesh(new THREE.CircleGeometry(4, 32), new THREE.MeshBasicMaterial({ color: '#f2f0e4', fog: false })); moon.position.set(-60, 70, -150); moon.lookAt(0, 0, 0); s.add(moon);
  // fireworks over the city at midnight: bursts of glowing points that expand and fall
  if (fireworks) {
    const bursts = [[-30, 34, -90, 0.5, '#ff6a4a'], [26, 40, -110, 2.3, '#ffd24a'], [-6, 30, -80, 4.1, '#6ad2ff'], [44, 36, -95, 5.6, '#ff4ad2'], [-46, 42, -120, 7.2, '#9aff6a']];
    s.bursts = bursts.map(([x, y, z, ph, col]) => { const n = 90, pos = new Float32Array(n * 3), dir = []; const rr = rng(Math.round(ph * 10));
      for (let i = 0; i < n; i++) { const a = rr() * 6.28, b = Math.acos(2 * rr() - 1); dir.push([Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a)]); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const p = new THREE.Points(geo, new THREE.PointsMaterial({ color: col, size: 0.9, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
      p.position.set(x, y, z); dyn(p); p.frustumCulled = false; s.add(p); return { p, pos, dir, ph }; });
    ticker(s).push(t => s.bursts.forEach(B => { const u = ((t - B.ph) % 8 + 8) % 8, k = u < 2.2 ? u / 2.2 : -1;
      B.p.material.opacity = k < 0 ? 0 : (1 - k) * (k < 0.06 ? k / 0.06 : 1); const R = 7 * Math.sqrt(Math.max(0, k));
      for (let i = 0; i < B.dir.length; i++) { const d = B.dir[i]; B.pos[i * 3] = d[0] * R; B.pos[i * 3 + 1] = d[1] * R - 3 * k * k; B.pos[i * 3 + 2] = d[2] * R; } B.p.geometry.attributes.position.needsUpdate = true; }));
  }
  ticker(s).push(t => s.lamps.forEach(l => l.blink(t)));
  s.userData.look = { ...NIGHT_LOOK, bloom: 0.65, bloomT: 0.85 };
  return s;
}

// ------------------------------------------------------------ El Paraguas in the central patio (moonlight)
// The umbrella stands at the origin; the two-storey galleries line the patio at x = ±13; the long pond runs to -z.
export function patio({ night = true } = {}) {
  const s = stage({ skyTop: night ? '#04060e' : '#5a8ed6', skyHor: night ? '#1a2238' : '#e6e0d0', groundA: '#4a4842', groundB: '#46443e', sunPos: night ? [-14, 30, 10] : [10, 30, 8], sunColor: night ? '#9ab0ff' : '#fff0d8', sun: night ? 1.1 : 2.6,
    hemiSky: night ? '#3a4a78' : '#dfe8ff', hemiGround: '#1a1a1e', hemi: night ? 0.5 : 1.1, shadow: 26, groundSize: 200, seed: 21 });
  paintedSky(s, { clouds: night ? 0.1 : 0.4, sunCol: night ? '#c8d4ff' : '#fff0d0', sun: night ? 0.4 : 1, stars: night ? 1 : 0, cloudCol: night ? '#3a4460' : '#ffffff' });
  const pav = canvasTex(512, 512, (c, W, H) => { const r = rng(3); c.fillStyle = '#3a3834'; c.fillRect(0, 0, W, H); for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { c.fillStyle = new THREE.Color('#77736a').multiplyScalar(0.8 + r() * 0.3).getStyle(); c.fillRect(i * 64 + 2, j * 64 + 2, 60, 60); } }, { repeat: [24, 30] });
  s.add(at(new THREE.Mesh(new THREE.PlaneGeometry(26, 70), std('#ffffff', { map: pav, roughness: 0.7 })), 0, 0.012, -14, -Math.PI / 2, 0, 0));
  const um = P.paraguas(20, 14, 6.4); s.add(um); s.umbrella = um; ticker(s).push(t => um.tick(t));
  // the galleries: dark glass below, aluminium lattice above
  const lat = canvasTex(256, 256, (c, W, H) => { c.fillStyle = '#1a1c20'; c.fillRect(0, 0, W, H); c.fillStyle = '#a8acb0'; for (let i = 0; i < 8; i++) { c.fillRect(i * 32, 0, 6, H); } for (let j = 0; j < 8; j++) c.fillRect(0, j * 32 + 14, W, 3); }, { repeat: [20, 2] });
  for (const sx of [-1, 1]) {
    const g = new THREE.Group(); g.position.set(sx * 13, 0, -14); g.rotation.y = -sx * Math.PI / 2; s.add(g);
    g.add(at(box(70, 3.4, 0.2, '#0c1218'), 0, 1.7, 0.3)); g.children[0].material = std('#0c1218', { roughness: 0.12, metalness: 0.7 });
    for (let x = -34; x <= 34; x += 3) g.add(at(box(0.12, 3.4, 0.25, '#2a2c30'), x, 1.7, 0.4));
    g.add(at(new THREE.Mesh(new THREE.BoxGeometry(70, 3.8, 0.3), std('#ffffff', { map: lat, roughness: 0.5, metalness: 0.5 })), 0, 5.4, 0.3));
    g.add(at(box(70, 0.4, 3, '#5e5c56'), 0, 7.5, 0.0)); g.add(at(box(70, 7.6, 1, '#3e3c38'), 0, 3.8, -0.6));
    for (let k = 0; k < 3; k++) { const e = exitSign(); e.position.set(-20 + k * 20, 2.9, 0.5); g.add(e); }
  }
  // the long pond with its bronze snail, beyond the umbrella
  s.add(at(box(9, 0.3, 26, '#4a4842'), 0, 0.15, -30)); s.add(at(new THREE.Mesh(new THREE.PlaneGeometry(8.4, 25.4), std('#0e1824', { roughness: 0.05, metalness: 0.5 })), 0, 0.31, -30, -Math.PI / 2, 0, 0));
  const sn = new THREE.Mesh(new THREE.TorusKnotGeometry(0.7, 0.28, 64, 10, 1, 3), std('#5a4630', { metalness: 0.6, roughness: 0.4 })); sn.position.set(0, 1.0, -38); s.add(sn);
  if (night) { const glow = new THREE.PointLight('#9ab8ff', 8, 14, 1.4); glow.position.set(0, 1.2, 0); s.add(glow);
    for (const [x, z] of [[2.2, 2.2], [-2.2, 2.2], [2.2, -2.2], [-2.2, -2.2]]) { const up = new THREE.SpotLight('#cfe0ff', 22, 12, 0.45, 0.7, 1.2); up.position.set(x, 0.4, z); up.target.position.set(x * 0.3, 6.2, z * 0.3); s.add(up, up.target); }
    s.userData.sun.intensity = 1.6; s.userData.hemi.intensity = 0.8; }
  s.userData.look = night ? { ...NIGHT_LOOK, bloom: 0.5 } : { bloom: 0.3, bloomT: 1.2, cool: 0.05, warm: 0.05, vign: 0.3 };
  return s;
}

// ------------------------------------------------------------ the exhibition halls
// A dark hall (w x d x h) open towards +z, polished stone floor, track lights; kind sets the dressing and hero case:
//  maya: stelae and the cenote gold; oaxaca: the Mitla greca, the bat god and Mixtec gold; mexica: the Sun Stone and the
//  obsidian monkey. s.cases = [{ v (vitrine), piece, key }], s.hero = the main case. night: only case spots and exit signs.
export function sala(kind = 'maya', { night = true, w = 12, d = 9, h = 4.4 } = {}) {
  const s = new THREE.Scene(); s.background = new THREE.Color(night ? '#020306' : '#16140f');
  const wall = std('#ffffff', { map: plasterTex(kind === 'oaxaca' ? '#3a2e26' : kind === 'mexica' ? '#2e2a2a' : '#26302a', kind.length), roughness: 0.95 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), std('#ffffff', { map: stoneFloorTex('#2e2b28', kind.length + 2), roughness: 0.22, metalness: 0.1 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; s.add(fl);
  slab(s, wall, { x0: -w / 2, x1: w / 2, z: -d / 2, h });
  for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wall); m.position.set(sx * w / 2, h / 2, 0); m.rotation.y = -sx * Math.PI / 2; m.receiveShadow = true; s.add(m); }
  const front = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wall); front.position.set(0, h / 2, d / 2); front.rotation.y = Math.PI; s.add(front);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(w, d), std('#0c0c0e')); ceil.rotation.x = Math.PI / 2; ceil.position.y = h; s.add(ceil);
  for (const z of [-2, 1, 3.4]) { s.add(at(box(w - 1, 0.04, 0.06, '#1a1a1c'), 0, h - 0.02, z)); }
  s.add(at(box(w, 0.12, 0.04, '#141414'), 0, 0.06, -d / 2 + 0.1));
  const hemi = new THREE.HemisphereLight(night ? '#3a4a7a' : '#fff2e0', '#0c0c10', night ? 0.85 : 1.1); s.add(hemi);
  const key = new THREE.DirectionalLight(night ? '#7a90d8' : '#fff0d8', night ? 0.9 : 1.4); key.position.set(5, 7, 8); s.add(key, key.target);
  s.cases = [];
  const addCase = (key, x, z, o = {}) => { const v = P.vitrine({ hero: !!o.hero, spot: night ? 9 : 4, ...o }); v.position.set(x, 0, z); v.rotation.y = o.ry || 0; s.add(v);
    const piece = P.ARTIFACT[key](...(o.args || [])); piece.position.set(0, v.inside.top, -0.02); v.inside.add(piece); s.cases.push({ v, piece, key }); return v; };
  if (kind === 'maya') {
    [-4.6, -2.3, 2.3, 4.6].forEach((x, i) => { const st = P.stela(2.5 - (i % 2) * 0.3, 0.85, i + 1); st.position.set(x, 0, -d / 2 + 0.45); s.add(st);
      const L = new THREE.SpotLight('#ffe2b8', night ? 5 : 3, 6, 0.4, 0.7, 1.4); L.position.set(x, h - 0.2, -d / 2 + 2.2); L.target.position.set(x, 1.2, -d / 2 + 0.4); s.add(L, L.target); });
    s.hero = addCase('gold', 0, -1.2, { args: [3, 0.42, 0.3], label: 'OFRENDAS DEL CENOTE SAGRADO', hero: true });
    addCase('gold', -2.8, 1.2, { args: [5], label: 'ORO · CHICHÉN ITZÁ' }); addCase('gold', 2.8, 1.2, { args: [8], label: 'ORNAMENTOS MAYAS' });
    // the stairs down to the crypt (an opening in the floor at the right with steps and a rail)
    s.add(at(box(1.6, 0.9, 0.06, '#1a1a1c'), 4.7, 0.45, 3.0)); s.add(at(box(0.06, 0.9, 2.2, '#1a1a1c'), 3.9, 0.45, 2.0));
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.36), new THREE.MeshStandardMaterial({ map: P.textTex('TUMBA DE PAKAL ↓', { w: 512, h: 128, bg: '#1a1612', fg: '#e8dcc0', font: '700 46px Inter' }) })); sg.position.set(4.7, 1.25, 3.04); s.add(sg);
  } else if (kind === 'oaxaca') {
    const band = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.4, 1.1), std('#ffffff', { map: grecaTex(), roughness: 0.9 })); band.position.set(0, 2.9, -d / 2 + 0.09); s.add(band);
    const bandL = new THREE.SpotLight('#ffd8a8', night ? 6 : 3, 8, 0.7, 0.8, 1.4); bandL.position.set(0, h - 0.2, -d / 2 + 2.6); bandL.target.position.set(0, 2.9, -d / 2); s.add(bandL, bandL.target);
    s.hero = addCase('bat', 0, -1.0, { args: [0.2], label: 'DIOS MURCIÉLAGO · MONTE ALBÁN', hero: true });
    addCase('pectoral', -2.8, 0.8, { args: [0.18], label: 'PECTORAL DE YANHUITLÁN' }); addCase('gold', 2.8, 0.8, { args: [11], label: 'ORFEBRERÍA MIXTECA' });
  } else {
    const ss = P.sunStone(1.5); ss.position.set(0, 2.25, -d / 2 + 0.3); s.add(ss); s.sunStone = ss;
    const ssL = new THREE.SpotLight('#ffe0b0', night ? 9 : 4, 9, 0.42, 0.6, 1.3); ssL.position.set(0, h - 0.1, -d / 2 + 3.2); ssL.target.position.set(0, 2.2, -d / 2); s.add(ssL, ssL.target);
    s.hero = addCase('monkey', 0, 0.2, { args: [0.17], label: 'VASIJA DE OBSIDIANA · TEXCOCO', hero: true });
    addCase('gold', -3.2, 1.2, { args: [14], label: 'OFRENDAS MEXICAS' });
    for (const x of [-4.4, 4.4]) { const head = new THREE.Group(); head.add(at(box(0.9, 0.9, 1.0, '#7a7466'), 0, 0.45, 0)); head.add(at(mesh(new THREE.ConeGeometry(0.3, 0.6, 4), std('#6e685a')), 0, 0.5, 0.65, Math.PI / 2, Math.PI / 4, 0)); head.position.set(x, 0, -d / 2 + 1.0); s.add(head); }
  }
  for (const [x, z, ry] of [[-w / 2 + 0.05, 2.6, Math.PI / 2], [w / 2 - 0.05, -2.4, -Math.PI / 2]]) { const e = exitSign(); e.position.set(x, 2.6, z); e.rotation.y = ry; s.add(e); }
  const tag = { maya: 'SALA MAYA', oaxaca: 'SALA OAXACA', mexica: 'SALA MEXICA' }[kind];
  const name = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.42), new THREE.MeshStandardMaterial({ map: P.textTex(tag, { w: 1024, h: 136, fg: '#c9b48a', font: '400 110px "Bebas Neue", Inter' }), transparent: true })); name.position.set(-w / 2 + 2.2, 3.85, -d / 2 + 0.09); s.add(name);
  motes(s, [-w / 2 + 1, 0.4, -d / 2 + 0.5, w / 2 - 1, h - 0.6, d / 2 - 1], 90, kind.length);
  s.userData = { look: night ? { ...NIGHT_LOOK } : { bloom: 0.35, bloomT: 1.1, cool: 0.05, warm: 0.06, vign: 0.32, rim: 0.3 }, hemi, sun: key, interior: true, room: { w, d, h } };
  ticker(s);
  return s;
}

// ------------------------------------------------------------ the Maya crypt (Pakal's tomb, lower level)
// Low stone chamber: the carved sarcophagus at the back, Pakal's mask in its case in front, the duct grille high in the
// left wall (s.grille.open(k) swings it down). night: a single cold work light and the case spot.
export function cripta({ night = true } = {}) {
  const s = new THREE.Scene(); s.background = new THREE.Color('#020304');
  const w = 7, d = 6, h = 2.9, stoneT = blockWallTex('#6e675a', 9), stone = std('#ffffff', { map: stoneT, roughness: 0.95 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), std('#ffffff', { map: stoneFloorTex('#3a3630', 9, 3), roughness: 0.35 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; s.add(fl);
  slab(s, stone, { x0: -w / 2, x1: w / 2, z: -d / 2, h });
  // left wall (x = -w/2) with the duct opening at z = -0.6, y = 2.35
  const lw = new THREE.Group(); lw.position.set(-w / 2, 0, 0); lw.rotation.y = Math.PI / 2; s.add(lw);
  slab(lw, stone, { x0: -d / 2, x1: d / 2, z: 0, h, holes: [[0.6, 2.32, 0.8, 0.62]] });
  const rw = new THREE.Mesh(new THREE.PlaneGeometry(d, h), stone); rw.position.set(w / 2, h / 2, 0); rw.rotation.y = -Math.PI / 2; s.add(rw);
  const fw = new THREE.Mesh(new THREE.PlaneGeometry(w, h), stone); fw.position.set(0, h / 2, d / 2); fw.rotation.y = Math.PI; s.add(fw);
  s.add(at(new THREE.Mesh(new THREE.PlaneGeometry(w, d), std('#1a1814')), 0, h, 0, Math.PI / 2, 0, 0));
  for (let i = 0; i < 4; i++) s.add(at(box(w, 0.18, 0.3, '#4e483e'), 0, h - 0.09, -d / 2 + 0.6 + i * 1.6));   // corbel beams
  // the duct mouth: a short metal sleeve behind the opening and a louvred grille on a hinge at its bottom edge
  const sleeve = new THREE.Group(); sleeve.position.set(-w / 2 - 0.5, 2.32, -0.6); s.add(sleeve);
  const metal = std('#8a9096', { metalness: 0.7, roughness: 0.4, side: THREE.DoubleSide });
  for (const [y, rz] of [[-0.3, 0], [0.3, 0]]) sleeve.add(at(new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.78), metal), 0, y, 0, Math.PI / 2, 0, rz));
  for (const z of [-0.39, 0.39]) sleeve.add(at(new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.6), metal), 0, 0, z));
  const gh = dyn(new THREE.Group()); gh.position.set(-w / 2 + 0.06, 2.01, -0.6); s.add(gh);
  const grille = new THREE.Group(); gh.add(grille); grille.add(at(box(0.03, 0.62, 0.8, '#9aa0a6'), 0, 0.31, 0));
  for (let i = 0; i < 7; i++) grille.add(at(box(0.05, 0.02, 0.76, '#5a6066'), 0.02, 0.06 + i * 0.08, 0, 0, 0, 0.5));
  s.grille = { open: k => { gh.rotation.z = -1.75 * Math.max(0, Math.min(1, k)); } }; s.duct = new THREE.Vector3(-w / 2, 2.32, -0.6);
  // the sarcophagus: a huge carved lid on a block
  const lidT = P.carvedTex(17, '#8c8474');
  const sar = new THREE.Group(); sar.position.set(0.6, 0, -d / 2 + 1.25); s.add(sar);
  sar.add(at(box(2.2, 0.75, 1.2, '#5e584c'), 0, 0.375, 0));
  sar.add(at(new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 1.5), [std('#6e6658'), std('#6e6658'), std('#ffffff', { map: lidT.map, bumpMap: lidT.bump, bumpScale: 3, roughness: 0.9 }), std('#6e6658'), std('#6e6658'), std('#6e6658')]), 0, 0.84, 0));
  const v = P.vitrine({ w: 0.6, d: 0.46, ped: 0.72, gh: 0.5, label: 'MÁSCARA FUNERARIA DE PAKAL', hero: true, spot: night ? 11 : 6 }); v.position.set(-0.9, 0, 0.5); v.rotation.y = 0.3; s.add(v);
  const mask = P.pakalMask(0.2); mask.position.set(0, v.inside.top, -0.03); v.inside.add(mask); s.hero = v; s.mask = mask;
  s.jade = null;
  const hemi = new THREE.HemisphereLight(night ? '#3a4a6a' : '#ffeacc', '#0a0a0a', night ? 0.75 : 1.0); s.add(hemi);
  const work = new THREE.PointLight(night ? '#8aa0d0' : '#ffe2b0', night ? 3.2 : 6, 9, 1.4); work.position.set(2.4, h - 0.3, 1.8); s.add(work);
  const sarL = new THREE.SpotLight('#ffd8a8', night ? 9 : 8, 6, 0.55, 0.7, 1.2); sarL.position.set(0.6, h - 0.1, 0.4); sarL.target.position.set(0.6, 0.8, -d / 2 + 1.25); s.add(sarL, sarL.target);
  motes(s, [-w / 2 + 0.5, 0.3, -d / 2 + 0.4, w / 2 - 0.5, h - 0.3, d / 2 - 0.6], 80, 4);
  s.userData = { look: night ? { ...NIGHT_LOOK, bloom: 0.6 } : { bloom: 0.35, bloomT: 1.1, cool: 0.05, warm: 0.06, vign: 0.35 }, hemi, interior: true, room: { w, d, h } };
  ticker(s);
  return s;
}

// ------------------------------------------------------------ inside the air-conditioning duct
// A square galvanised tunnel (inner a x a) running from z = 0 to z = -len, with seams and rivets; a grille at the far end
// with light slipping through it (the crypt beyond). Dust hangs in the air.
export function ducto({ a = 0.82, len = 14 } = {}) {
  const s = new THREE.Scene(); s.background = new THREE.Color('#000000');
  const t = canvasTex(512, 512, (c, W, H) => { const r = rng(4); c.fillStyle = '#8c939a'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '40,44,50'},${0.05 + r() * 0.06})`; c.beginPath(); c.ellipse(r() * W, r() * H, 10 + r() * 50, 4 + r() * 18, r() * 3, 0, 7); c.fill(); }
    c.fillStyle = '#5a6066'; c.fillRect(0, 0, W, 10); c.fillStyle = '#b8bec4'; c.fillRect(0, 10, W, 4);
    c.fillStyle = '#4a5056'; for (let x = 16; x < W; x += 40) { c.beginPath(); c.arc(x, 24, 4, 0, 7); c.fill(); }
    for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(60,50,40,0.12)'; c.fillRect(r() * W, r() * H, 1 + r() * 3, 20 + r() * 60); } }, { repeat: [1, len / 0.9] });
  const m = std('#ffffff', { map: t, metalness: 0.55, roughness: 0.42, side: THREE.DoubleSide });
  for (const [x, y, rz] of [[0, 0, 0], [0, a, Math.PI], [-a / 2, a / 2, -Math.PI / 2], [a / 2, a / 2, Math.PI / 2]]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(a, len), m); p.rotation.set(-Math.PI / 2, 0, 0); const g = new THREE.Group(); g.add(p); g.position.set(x, y, -len / 2); g.rotation.z = rz; p.receiveShadow = true; s.add(g);
  }
  for (let z = 0; z > -len; z -= 0.9) for (const [x, y, w2, h2] of [[0, 0.005, a, 0.01], [0, a - 0.005, a, 0.01], [-a / 2 + 0.005, a / 2, 0.01, a], [a / 2 - 0.005, a / 2, 0.01, a]]) s.add(at(box(w2 || 0.01, h2 || 0.01, 0.04, '#6a7076'), x, y, z));
  const end = new THREE.Group(); end.position.set(0, a / 2, -len); s.add(end);
  end.add(at(box(a, a, 0.02, '#1a1c1e'), 0, 0, -0.04));
  const slit = glowM('#ffd9a8', 1.6);
  for (let i = 0; i < 8; i++) { end.add(at(mesh(new THREE.PlaneGeometry(a * 0.9, 0.025), slit), 0, -a / 2 + 0.08 + i * 0.09, -0.02)); end.add(at(box(a * 0.92, 0.05, 0.03, '#5a6066'), 0, -a / 2 + 0.11 + i * 0.09, 0, 0.6, 0, 0)); }
  const beyond = new THREE.PointLight('#ffcf98', 1.2, 4, 1.6); beyond.position.set(0, a / 2, -len + 0.5); s.add(beyond); s.endLight = beyond;
  s.add(new THREE.HemisphereLight('#2a3450', '#000000', 0.3));
  motes(s, [-a / 2 + 0.05, 0.05, -len + 0.4, a / 2 - 0.05, a - 0.05, -0.2], 160, 7);
  s.userData = { look: { ...NIGHT_LOOK, bloom: 0.7, bloomT: 0.8, vign: 0.62, grain: 0.05 }, interior: true, a, len };
  ticker(s);
  return s;
}

// ------------------------------------------------------------ the guards' room on Christmas Eve
// Table along x at z = -0.6 (top at s.tableY): cookies, glasses, a bottle, a radio; a little tree with lights in the corner,
// lights strung along the back wall, lockers, a wall clock at 1:00 and the December 1985 calendar.
export function guardia() {
  const s = rRoom({ w: 8, d: 6.5, h: 3.0, wall: '#5e6a62', lower: '#3e4842', lowerH: 1.0, floor: '#4a4640', ceil: '#d8d4c8', hemi: 0.45, sunI: 0.3, bg: '#0a0a0a',
    lights: [[0, 2.6, 0, 4.5, '#e8f0ff', 9], [-2.6, 1.6, -2.2, 1.6, '#ffb06a', 5]] });
  const tube = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.12), glowM('#f2f6ff', 1.3)); tube.position.set(0, 2.96, 0); s.add(tube);
  const t = RP.tableCloth(2.6, 1.0, '#7a1f2a', 0.42, 1); t.position.set(0, 0, -0.6); s.add(t); s.tableY = t.top;
  const top = t.top;
  const cp = P.cookiesPlate(); cp.position.set(-0.3, top, -0.55); s.add(cp);
  const cp2 = P.cookiesPlate(); cp2.position.set(0.75, top, -0.75); s.add(cp2);
  s.cups = [[-0.85, -0.4], [-0.55, -0.85], [0.1, -0.35], [0.4, -0.8], [0.95, -0.45], [1.15, -0.85]].map(([x, z], i) => { const g = P.glassCup(0.2 + (i % 3) * 0.1); g.position.set(x, top, z); s.add(g); return g; });
  const b = P.bottle(); b.position.set(0.25, top, -0.62); s.add(b); const b2 = P.bottle('#2a4a1a', '#f2e6c8'); b2.position.set(-1.05, top, -0.7); s.add(b2);
  const rd = P.radio80(); rd.position.set(0.55, top, -0.98); rd.rotation.y = -0.2; s.add(rd); s.radio = rd;
  const tree = W1.xmasTree(1.3); tree.position.set(-3.2, 0, -2.6); s.add(tree);
  const tl = P.xmasLights([[-3.6, 2.5, -3.2], [-2, 2.2, -3.2], [-0.4, 2.5, -3.2], [1.2, 2.2, -3.2], [2.8, 2.5, -3.2], [3.6, 2.3, -3.2]], 46); s.add(tl); s.lights = tl;
  for (let i = 0; i < 5; i++) { const l = new THREE.Group(); l.add(at(box(0.5, 1.9, 0.45, '#5a6a78'), 0, 0.95, 0)); for (let k = 0; k < 3; k++) l.add(at(box(0.3, 0.03, 0.01, '#3a4652'), 0, 1.6 - k * 0.06, 0.23)); l.position.set(3.6, 0, -2.6 + i * 0.52); l.rotation.y = -Math.PI / 2; s.add(l); }
  const clk = WP.wallClock(0.24); clk.position.set(1.6, 2.35, -3.2); s.add(clk); s.clock = clk;
  const cal = P.calendar(1985); cal.position.set(-1.4, 1.75, -3.2); s.add(cal);
  const cap = new THREE.Group(); cap.add(at(cyl(0.12, 0.13, 0.08, '#1d2436', 14), 0, 0.04, 0)); cap.add(at(box(0.2, 0.012, 0.12, '#0e0e10'), 0, 0.01, 0.12)); cap.position.set(1.3, top, -0.3); s.add(cap);
  ticker(s).push(tt => { tl.blink(tt); if (clk.set) clk.set(1, Math.floor(tt / 60) % 60, tt % 60); });
  s.userData.look = { bloom: 0.5, bloomT: 0.95, cool: 0.06, warm: 0.07, vign: 0.42, rim: 0.3, sat: 1.06 };
  return s;
}

// ------------------------------------------------------------ Nochebuena at home (1985): the family dinner
export function cena() {
  const s = rRoom({ w: 7, d: 6, h: 2.8, wall: '#c9b48e', lower: '#7a5a3a', lowerH: 0.9, floor: '#5a3a24', ceil: '#efe6d4', hemi: 0.55, sunI: 0.35, bg: '#0a0806',
    lights: [[0, 2.3, -0.4, 6, '#ffcf8a', 9], [-2.6, 1.4, -2.0, 2.4, '#ffb070', 5]] });
  const t = RP.tableCloth(2.4, 1.1, '#f2ece0', 0.42, 1); t.position.set(0, 0, -0.5); s.add(t); s.tableY = t.top;
  const top = t.top;
  const dish = (x, z, food, r = 0.12) => { const g = new THREE.Group(); g.add(at(cyl(r, r * 0.85, 0.03, '#f4f0e8', 20), 0, 0.015, 0)); g.add(at(mesh(new THREE.SphereGeometry(r * 0.75, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), std(food, { roughness: 0.7 })), 0, 0.03, 0)); g.children[1].scale.y = 0.45; g.position.set(x, top, z); s.add(g); };
  dish(0, -0.5, '#b8742a', 0.2); dish(-0.65, -0.4, '#c84a2a'); dish(0.65, -0.4, '#3a5a2a'); dish(-0.3, -0.85, '#e8d8a8'); dish(0.35, -0.85, '#8a3a1a');
  for (const [x, z] of [[-0.9, -0.2], [-0.3, -0.15], [0.3, -0.15], [0.9, -0.2]]) { s.add(at(cyl(0.09, 0.08, 0.012, '#f4f0e8', 18), x, top + 0.006, z)); const c = P.glassCup(0.6, '#c8242a'); c.position.set(x + 0.12, top, z - 0.08); s.add(c); }
  for (const x of [-0.5, 0.5]) { const c = new THREE.Group(); c.add(at(cyl(0.02, 0.02, 0.16, '#f4ecd8', 8), 0, 0.08, 0)); c.add(at(mesh(new THREE.SphereGeometry(0.014, 6, 4), new THREE.MeshBasicMaterial({ color: '#ffd27a' })), 0, 0.18, 0)); c.position.set(x, top, -0.62); s.add(c); }
  const tree = W1.xmasTree(1.6); tree.position.set(-2.7, 0, -2.3); s.add(tree);
  const tl = P.xmasLights([[-3.0, 1.4, -2.0], [-2.6, 1.1, -2.6], [-2.3, 0.9, -2.1], [-2.8, 0.6, -2.5], [-2.4, 0.4, -2.0]], 30); s.add(tl);
  // nochebuenas (poinsettias) and a little nativity on a side table
  for (const [x, z] of [[2.6, -2.5], [2.9, -1.6]]) { const p = new THREE.Group(); p.add(at(cyl(0.12, 0.09, 0.18, '#7a3a1a', 12), 0, 0.09, 0)); for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28; const l = mesh(new THREE.ConeGeometry(0.06, 0.2, 4), std(i % 3 ? '#c41a2a' : '#2a5a2a')); l.position.set(Math.cos(a) * 0.1, 0.26, Math.sin(a) * 0.1); l.rotation.set(Math.sin(a) * 1.1, 0, -Math.cos(a) * 1.1); p.add(l); } p.position.set(x, 0, z); s.add(p); }
  const st = new THREE.Group(); st.add(at(box(1.0, 0.6, 0.45, '#5a3a24'), 0, 0.3, 0)); st.add(at(box(0.5, 0.3, 0.3, '#8a6a3a'), 0, 0.75, 0)); st.add(at(mesh(new THREE.ConeGeometry(0.32, 0.18, 4), std('#6a4a2a')), 0, 0.99, 0, 0, Math.PI / 4, 0));
  for (let i = 0; i < 5; i++) st.add(at(cyl(0.025, 0.03, 0.09, ['#3a5a8a', '#8a3a3a', '#d8c8a8', '#6a4a2a', '#e8d8a8'][i], 8), -0.3 + i * 0.15, 0.65, 0.14)); st.position.set(2.5, 0, 0.6); st.rotation.y = -1.2; s.add(st);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.3), new THREE.MeshBasicMaterial({ color: '#0e1830' })); win.position.set(1.4, 1.5, -2.97); s.add(win);
  for (const sx of [-1, 1]) s.add(at(box(0.3, 1.6, 0.05, '#7a1f2a'), 1.4 + sx * 0.72, 1.5, -2.93));
  ticker(s).push(tt => tl.blink(tt));
  s.userData.look = { bloom: 0.5, bloomT: 0.95, warm: 0.09, cool: 0.04, vign: 0.4, rim: 0.34, rimColor: '#ffd8a8', sat: 1.08 };
  return s;
}

// ------------------------------------------------------------ the bedroom in Satélite (night) with the closet
// The closet stands against the left wall (s.closet, facing +x); the back-wall window looks onto the towers.
export function recamara({ night = true, year = 1986 } = {}) {
  const s = new THREE.Scene(); s.background = new THREE.Color(night ? '#03050c' : '#8aa8c8');
  const w = 6, d = 5, h = 2.6;
  const wallM = std(night ? '#8a8270' : '#d8ccb0', { roughness: 0.95 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), std('#6a4a30', { roughness: 0.6 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; s.add(fl);
  slab(s, wallM, { x0: -w / 2, x1: w / 2, z: -d / 2, h, holes: [[0.9, 1.5, 1.5, 1.2]] });
  for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallM); m.position.set(sx * w / 2, h / 2, 0); m.rotation.y = -sx * Math.PI / 2; s.add(m); }
  s.add(at(new THREE.Mesh(new THREE.PlaneGeometry(w, d), std('#e8e0d0')), 0, h, 0, Math.PI / 2, 0, 0));
  for (const [x, y, ww, hh] of [[0.9, 2.12, 1.6, 0.06], [0.9, 0.88, 1.6, 0.08], [0.12, 1.5, 0.06, 1.3], [1.68, 1.5, 0.06, 1.3], [0.9, 1.5, 0.04, 1.2]]) s.add(at(box(ww, hh, 0.1, '#e8e4dc'), x, y, -d / 2 + 0.02));
  for (const sx of [-1, 1]) s.add(at(box(0.32, 1.8, 0.05, '#4a5a7a'), 0.9 + sx * 0.95, 1.45, -d / 2 + 0.1));
  // outside: night sky, Satélite rooftops and the towers lit by the moon
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(200, 80), new THREE.MeshBasicMaterial({ color: night ? '#0b1428' : '#9ab8d8', fog: false })); sky.position.set(0, 20, -90); s.add(sky);
  const tw = P.torres(0.32); tw.position.set(4, -1.5, -60); s.add(tw); s.torres = tw;
  const r = rng(9); for (let i = 0; i < 26; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(2 + r() * 2, 1 + r() * 1.5, 2), std(night ? '#1a1c22' : '#b8a890')); b.position.set(-24 + i * 2.2, -0.2, -14 - r() * 10); s.add(b);
    if (night && r() < 0.6) { const win2 = mesh(new THREE.PlaneGeometry(0.3, 0.3), glowM('#ffcf8a', 1.2)); win2.position.set(b.position.x + (r() - 0.5), b.position.y + 0.2, b.position.z + 1.01); s.add(win2); } }
  const moon = new THREE.DirectionalLight(night ? '#8aa0ff' : '#fff0d8', night ? 1.6 : 3); moon.position.set(6, 12, -20); moon.target.position.set(0, 0, 0); s.add(moon, moon.target);
  const tL = new THREE.DirectionalLight(night ? '#9ab0ff' : '#ffffff', night ? 1.2 : 0); tL.position.set(-10, 20, 0); tL.target.position.set(3, 0, -40); s.add(tL, tL.target);
  const hemi = new THREE.HemisphereLight(night ? '#2a3456' : '#fff0e0', '#141010', night ? 0.35 : 1.0); s.add(hemi);
  const lamp = new THREE.PointLight('#ffc888', night ? 2.2 : 0, 5, 1.6); lamp.position.set(1.9, 1.0, 1.0); s.add(lamp); s.lamp = lamp;
  const bed = new THREE.Group(); bed.position.set(1.6, 0, 0.2); s.add(bed);
  bed.add(at(box(1.1, 0.26, 1.9, '#4a3020'), 0, 0.13, 0)); bed.add(at(box(1.04, 0.14, 1.84, '#f2eee4'), 0, 0.33, 0)); bed.add(at(box(1.08, 0.06, 1.3, '#3a5a8a'), 0, 0.42, 0.28));
  bed.add(at(box(0.7, 0.1, 0.32, '#ffffff'), 0, 0.45, -0.7)); bed.add(at(box(1.12, 0.7, 0.06, '#4a3020'), 0, 0.35, -0.97));
  s.add(at(box(0.5, 0.5, 0.45, '#5a3a24'), 2.4, 0.25, 1.5)); const lampP = RP.deskLamp(true, '#c8a050', 0.9); lampP.position.set(2.4, 0.5, 1.5); s.add(lampP);
  const cl = P.closet(1.5, 2.15, 0.55); cl.position.set(-w / 2 + 0.3, 0, -0.4); cl.rotation.y = Math.PI / 2; s.add(cl); s.closet = cl;
  const bag = P.duffel(0.62, 0.15); bag.position.set(0, cl.shelfY, 0.02); cl.add(bag); s.bag = dyn(bag);
  const cal = P.calendar(year); cal.position.set(-0.7, 1.7, -d / 2 + 0.09); s.add(cal); s.calendar = cal;
  const poster = RP.picture(0.6, 0.85, (c, W, H) => { c.fillStyle = '#1a1a2a'; c.fillRect(0, 0, W, H); c.fillStyle = '#e8c84a'; c.font = '900 40px "Bebas Neue", Inter'; c.textAlign = 'center'; c.fillText('MÉXICO 86', W / 2, 60); c.fillStyle = '#e8e8e8'; c.beginPath(); c.arc(W / 2, H / 2 + 20, 60, 0, 7); c.fill(); c.fillStyle = '#1a1a1a'; for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28; c.beginPath(); c.arc(W / 2 + Math.cos(a) * 34, H / 2 + 20 + Math.sin(a) * 34, 12, 0, 7); c.fill(); } }, '#2a2a2a');
  poster.position.set(w / 2 - 0.05, 1.6, -0.6); poster.rotation.y = -Math.PI / 2; s.add(poster);
  s.userData = { look: night ? { ...NIGHT_LOOK, bloom: 0.5 } : { bloom: 0.3, bloomT: 1.1, warm: 0.06, cool: 0.04, vign: 0.3 }, hemi, sun: moon, interior: true, room: { w, d, h } };
  ticker(s);
  return s;
}

// ------------------------------------------------------------ Acapulco at night: the bay, the hotels, a disco terrace
// The terrace (wood deck at y = 0.3) is at the origin facing the bay (-z); hotels curve round the bay far away.
export function acapulco() {
  const s = stage({ skyTop: '#060814', skyHor: '#2a2440', groundA: '#2a2620', groundB: '#26221c', sunPos: [20, 30, -60], sunColor: '#9aa8ff', sun: 0.5, hemiSky: '#4a4a7a', hemiGround: '#141018', hemi: 0.6, shadow: 14, groundSize: 60, seed: 41 });
  s.userData.sun.castShadow = false; paintedSky(s, { clouds: 0.15, sunCol: '#d8d8ff', sun: 0.3, stars: 1, cloudCol: '#4a4466' });
  s.fog = new THREE.Fog('#141428', 40, 220);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(600, 400), std('#0c1424', { roughness: 0.12, metalness: 0.6 })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, -0.05, -200); s.add(sea);
  const moonGlow = new THREE.Mesh(new THREE.PlaneGeometry(4, 120), new THREE.MeshBasicMaterial({ color: '#c8d0ff', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); moonGlow.rotation.x = -Math.PI / 2; moonGlow.position.set(30, 0.02, -120); s.add(moonGlow);
  const moon = new THREE.Mesh(new THREE.CircleGeometry(5, 32), new THREE.MeshBasicMaterial({ color: '#f4f2e6', fog: false })); moon.position.set(40, 60, -300); s.add(moon);
  const r = rng(12);
  for (let i = 0; i < 26; i++) { const a = -0.25 + i / 25 * 1.9, R = 150, x = Math.cos(Math.PI - a) * R * 1.3, z = -40 - Math.sin(a + 0.25) * R * 0.9;
    const tw = P.hotelTower(5 + r() * 4, 14 + r() * 26, i + 7); tw.position.set(x, 0, z); tw.rotation.y = r() * 3; s.add(tw); }
  for (let i = 0; i < 14; i++) { const hill = new THREE.Mesh(new THREE.SphereGeometry(40 + r() * 30, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), std('#0e1018', { roughness: 1 })); hill.scale.y = 0.5; hill.position.set(-260 + i * 40, 0, -260 - r() * 40); s.add(hill); }
  const lights = new Float32Array(900 * 3); for (let i = 0; i < 900; i++) { lights[i * 3] = -260 + r() * 520; lights[i * 3 + 1] = 2 + r() * 22; lights[i * 3 + 2] = -230 - r() * 60; }
  const lp = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(lights, 3)), new THREE.PointsMaterial({ color: '#ffcf8a', size: 1.6, sizeAttenuation: false, fog: false })); s.add(lp);
  // the terrace: deck, rail, palms, string lights, the neon sign on the club wall behind
  s.add(at(box(14, 0.3, 8, '#5a3e28'), 0, 0.15, 0)); for (let x = -7; x <= 7; x += 0.7) s.add(at(box(0.05, 0.9, 0.05, '#e8e0d0'), x, 0.75, -4)); s.add(at(box(14, 0.06, 0.08, '#e8e0d0'), 0, 1.2, -4));
  s.add(at(box(14, 4, 0.4, '#1e1a24'), 0, 2, 4.2));
  const ns = P.neonSign('DISCO', '#ff3ab0', 3.2, 0.9); ns.position.set(-2, 2.9, 3.98); ns.rotation.y = Math.PI; s.add(ns); s.neon = ns;
  const ns2 = P.neonSign('ACAPULCO', '#3ad8ff', 3.6, 0.8); ns2.position.set(3.6, 3.1, 3.98); ns2.rotation.y = Math.PI; s.add(ns2);
  for (const [x, z] of [[-6.2, -3], [6.2, -3.2], [-6.5, 2.6], [6.4, 2.4]]) { const p = LP.palm(1.5, x * 3); p.position.set(x, 0.3, z); s.add(p); }
  const sl = P.xmasLights([[-6, 2.6, -3.6], [-3, 2.3, -3.4], [0, 2.6, -3.6], [3, 2.3, -3.4], [6, 2.6, -3.6]], 40); s.add(sl);
  for (const [x, z] of [[-3, -1], [2.5, -1.4]]) { s.add(at(cyl(0.45, 0.45, 0.04, '#e8e2d4', 18), x, 0.85, z)); s.add(at(cyl(0.04, 0.04, 0.55, '#2a2a2a', 6), x, 0.575, z)); }
  const warm = new THREE.PointLight('#ff9a6a', 5, 10, 1.4); warm.position.set(0, 2.6, 1.0); s.add(warm);
  const pink = new THREE.PointLight('#ff4ab8', 3, 9, 1.5); pink.position.set(-2, 2.2, 2.6); s.add(pink);
  ticker(s).push(t => { ns.flicker(t); ns2.flicker(t + 0.7); sl.blink(t); moonGlow.material.opacity = 0.1 + 0.03 * Math.sin(t * 1.3); });
  s.userData.look = { ...NIGHT_LOOK, bloom: 0.7, bloomT: 0.8, warm: 0.08, sat: 1.12, rimColor: '#ff9ad8', rim: 0.35 };
  s.deckY = 0.3;
  return s;
}

// ------------------------------------------------------------ 1989: the wiretap room (Procuraduría)
// Desk at the origin (top at s.deskY) with the reel deck and a lamp; the case board on the back wall; blinds on the left.
export function escucha() {
  const s = rRoom({ w: 7, d: 6, h: 2.9, wall: '#6a6450', lower: '#4a4436', lowerH: 0.95, floor: '#3a3630', ceil: '#cfc8b8', hemi: 0.3, sunI: 0.25, bg: '#050505',
    lights: [[0.1, 2.0, 0.7, 3.5, '#ffd090', 5]] });
  const dk = RP.desk(2.4, 1.1, '#3a2a1c', 0.72); dk.position.set(0, 0, -0.4); s.add(dk); s.deskY = dk.top;
  const deck = P.reelDeck(); deck.position.set(-0.35, dk.top, -0.55); s.add(deck); s.deck = deck;
  const deck2 = P.reelDeck(); deck2.position.set(0.3, dk.top, -0.62); deck2.rotation.y = -0.15; s.add(deck2); s.deck2 = deck2;
  const lamp = RP.deskLamp(true, '#2f5a3a', 0.8); lamp.position.set(0.8, dk.top, -0.4); s.add(lamp);
  const ph = WP.deskPhone(); ph.position.set(-0.85, dk.top, -0.25); s.add(ph);
  const pp = RP.papers(5, 3, 0.8); pp.position.set(0.1, dk.top, -0.05); s.add(pp);
  const board = P.caseBoard(2.4, 1.4); board.position.set(0, 1.75, -2.94); s.add(board); s.board = board;
  const bL = new THREE.SpotLight('#ffe2b0', 4, 5, 0.5, 0.7, 1.4); bL.position.set(0, 2.8, -1.2); bL.target.position.set(0, 1.75, -3); s.add(bL, bL.target);
  // venetian blinds on the left wall: dark slats with the street light striping through
  const bl = new THREE.Group(); bl.position.set(-3.47, 1.6, -0.8); bl.rotation.y = Math.PI / 2; s.add(bl);
  bl.add(at(mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ color: '#2a3450' })), 0, 0, -0.02));
  for (let i = 0; i < 16; i++) bl.add(at(box(1.44, 0.05, 0.02, '#c8c0a8'), 0, -0.68 + i * 0.09, 0, 0.5, 0, 0));
  const street = new THREE.SpotLight('#9ab0e0', 3, 7, 0.5, 0.5, 1.3); street.position.set(-4.5, 2.2, -0.8); street.target.position.set(0, 0.8, -0.4); s.add(street, street.target);
  ticker(s).push(t => { deck.spin(t); deck2.spin(t * 0.8 + 1); });
  s.userData.look = { bloom: 0.5, bloomT: 0.95, cool: 0.08, warm: 0.08, vign: 0.5, rim: 0.32, sat: 0.98 };
  return s;
}

// ------------------------------------------------------------ June 1989: the raid on the house in Satélite (dawn)
// A suburban street along x; the house at the origin (front door at z = -1.6); police cars pull up at z = 3.
export function redada({ night = false } = {}) {
  const s = night ? stage({ skyTop: '#03050c', skyHor: '#18203a', groundA: '#2a2a2c', groundB: '#262628', sunPos: [-30, 30, -20], sunColor: '#8aa0ff', sun: 0.6, hemiSky: '#3a4a78', hemiGround: '#121216', hemi: 0.55, shadow: 16, groundSize: 220, seed: 51 })
    : stage({ skyTop: '#1a2a4a', skyHor: '#c89a8a', groundA: '#3e3c38', groundB: '#3a3834', sunPos: [-30, 6, -20], sunColor: '#ffb890', sun: 1.0, hemiSky: '#8aa0c8', hemiGround: '#2a2622', hemi: 0.8, shadow: 16, groundSize: 220, seed: 51 });
  paintedSky(s, night ? { clouds: 0.1, sunCol: '#c8d4ff', sun: 0.3, stars: 1, cloudCol: '#3a4460' } : { clouds: 0.35, sunCol: '#ffc8a0', sun: 0.6, stars: 0.2, cloudCol: '#8a7a8a' });
  if (night) { s.userData.sun.castShadow = false; for (const x of [-8, 0, 8, 16]) { const l = NP.streetLight(true, 4.2); l.position.set(x, 0, 1.2); l.rotation.y = Math.PI; s.add(l); } }
  s.add(at(box(120, 0.02, 7, '#2a2a2c'), 0, 0.011, 4)); s.add(at(box(120, 0.14, 1.6, '#8a867c'), 0, 0.07, -0.2));
  const house = (x, col, seed) => { const g = new THREE.Group(); g.position.set(x, 0, -4.5); s.add(g); const r = rng(seed);
    g.add(at(box(6.2, 2.8, 5, col), 0, 1.4, -1)); g.add(at(box(6.6, 0.2, 5.4, '#5a544a'), 0, 2.9, -1));
    g.add(at(box(2.4, 2.0, 0.08, '#4a4440'), -1.7, 1.0, 1.52)); g.add(at(box(1.0, 2.0, 0.1, '#5a3a24'), 1.1, 1.0, 1.53));
    for (const wx of [2.4]) g.add(at(mesh(new THREE.PlaneGeometry(0.9, 0.8), glowM(r() < 0.5 ? '#ffcf8a' : '#3a4050', 0.6)), wx, 1.7, 1.52));
    g.add(at(box(6.2, 1.2, 0.08, '#2a2a2c'), 0, 0.6, 3.2)); for (let k = -3; k <= 3; k += 0.25) g.add(at(box(0.03, 1.2, 0.03, '#1a1a1c'), k, 0.6, 3.2));
    return g; };
  ['#c8b89a', '#d8c8a8', '#b8a88a', '#c8a888', '#d0c0a0'].forEach((c, i) => { const h = house(-16 + i * 8, c, i); if (i === 2) s.house = h; });
  const tw = P.torres(0.45); tw.position.set(30, 0, -90); s.add(tw);
  s.cars = night ? [] : [[-3.2, 3.4, 0.25], [3.4, 3.0, -0.2], [9, 4.6, 0.05]].map(([x, z, ry]) => { const c = P.sedan80('#e8e8e4', { police: true, night: false }); c.position.set(x, 0, z); c.rotation.y = Math.PI / 2 + ry; s.add(c); return c; });
  if (night) { const c = P.sedan80('#3a3e44', { night: true }); c.position.set(-6, 0, 5.2); c.rotation.y = Math.PI / 2; s.add(c); s.watchCar = c; }
  const fill = new THREE.DirectionalLight('#9ab0d8', 1.1); fill.position.set(6, 8, 20); fill.target.position.set(0, 1, -4); s.add(fill, fill.target);
  ticker(s).push(t => s.cars.forEach((c, i) => c.blink(t + i * 0.3, 1)));
  s.userData.look = night ? { ...NIGHT_LOOK } : { bloom: 0.45, bloomT: 1.0, warm: 0.07, cool: 0.08, vign: 0.4, rim: 0.36, rimColor: '#ffc8a8' };
  return s;
}

// ------------------------------------------------------------ line-up wall (height chart) for the case files
export function lineup({ tint = '#2a3040' } = {}) {
  const s = new THREE.Scene(); s.background = new THREE.Color('#050608');
  const chart = canvasTex(1024, 512, (c, W, H) => { c.fillStyle = '#c8ccd0'; c.fillRect(0, 0, W, H); c.strokeStyle = '#2a2c30'; c.fillStyle = '#2a2c30'; c.font = '700 26px "Share Tech Mono", monospace';
    for (let i = 0; i <= 20; i++) { const y = H - i * H / 20; c.lineWidth = i % 5 ? 2 : 5; c.beginPath(); c.moveTo(0, y); c.lineTo(i % 5 ? 60 : W, y); c.stroke(); if (i % 5 === 0 && i) c.fillText(`${(i * 0.1 + 0.0).toFixed(1)} m`, 70, y + 26); } });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), std('#ffffff', { map: chart, roughness: 0.9 })); wall.position.set(0, 1.5, -1.2); s.add(wall);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), std('#2a2a2c')); fl.rotation.x = -Math.PI / 2; s.add(fl);
  const key = new THREE.SpotLight('#fff4e0', 22, 9, 0.6, 0.5, 1.2); key.position.set(0, 3.2, 3.2); key.target.position.set(0, 0.7, -0.4); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); s.add(key, key.target);
  s.add(new THREE.HemisphereLight('#8a94b0', '#141414', 0.6));
  s.userData = { look: { bloom: 0.35, bloomT: 1.1, cool: 0.05, warm: 0.04, vign: 0.55, sat: 0.9, rim: 0.3 }, interior: true };
  ticker(s); return s;
}
// ------------------------------------------------------------ a tianguis stall (the joke: selling the Mona Lisa there)
export function tianguis() {
  const s = stage({ skyTop: '#5a8ed6', skyHor: '#f0e6d0', groundA: '#9a9488', groundB: '#8e887c', sunPos: [8, 14, 9], sunColor: '#fff0d8', sun: 2.4, hemi: 1.1, shadow: 10, groundSize: 80, seed: 61 });
  paintedSky(s, { clouds: 0.4 });
  const st = new THREE.Group(); s.add(st);
  st.add(at(box(2.2, 0.06, 1.0, '#8a6a4a'), 0, 0.55, 0)); for (const [x, z] of [[-1, -0.4], [1, -0.4], [-1, 0.4], [1, 0.4]]) st.add(at(cyl(0.03, 0.03, 0.55, '#6a4a2a', 6), x, 0.27, z));
  const aw = canvasTex(256, 64, (c, W, H) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#e8407a' : '#f2f0ea'; c.fillRect(i * W / 8, 0, W / 8, H); } });
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.6), std('#ffffff', { map: aw, side: THREE.DoubleSide })); roof.position.set(0, 1.75, 0); roof.rotation.x = -Math.PI / 2 + 0.25; st.add(roof);
  for (const [x, z] of [[-1.2, -0.7], [1.2, -0.7], [-1.2, 0.7], [1.2, 0.7]]) st.add(at(cyl(0.025, 0.025, 1.8, '#4a4a4a', 6), x, 0.9, z));
  const mask = P.pakalMask(0.22); mask.position.set(0, 0.58, 0); st.add(mask); s.mask = mask;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.3), std('#ffffff', { map: P.textTex(['SE VENDE', '¡BARATO!'], { w: 512, h: 248, bg: '#f2e6c8', fg: '#c0272d', font: '700 72px "Special Elite", monospace' }) })); sign.position.set(0.62, 0.78, 0.2); sign.rotation.x = -0.2; st.add(sign);
  const r = rng(4); for (let i = 0; i < 7; i++) st.add(at(mesh(new THREE.SphereGeometry(0.06, 10, 8), std(['#e8a23a', '#c8302a', '#3a8a3a', '#e8d84a'][i % 4])), -0.85 + r() * 0.5, 0.64, -0.3 + r() * 0.5));
  for (let i = 0; i < 6; i++) { const b = new THREE.Group(); b.add(at(box(1.6, 0.05, 0.9, '#7a5a3a'), 0, 0.55, 0)); const rf = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.4), std(['#3a7ac8', '#e8c83a', '#3ab87a', '#e87a3a'][i % 4], { side: THREE.DoubleSide })); rf.position.set(0, 1.7, 0); rf.rotation.x = -Math.PI / 2 + 0.25; b.add(rf); b.position.set((i % 2 ? 1 : -1) * (3 + Math.floor(i / 2) * 2.4), 0, -1.5 - Math.floor(i / 2) * 1.6); s.add(b); }
  s.userData.look = { bloom: 0.3, bloomT: 1.2, warm: 0.06, cool: 0.03, vign: 0.3, sat: 1.15 };
  ticker(s); return s;
}
// ------------------------------------------------------------ interrogation room (1989): one lamp over a table
export function interrogatorio() {
  const s = rRoom({ w: 5, d: 5, h: 2.8, wall: '#4a4e4a', lower: '#3a3e3a', lowerH: 1.0, floor: '#2e2e2c', ceil: '#3a3a38', hemi: 0.18, sunI: 0.15, bg: '#020202', lights: [] });
  const t = RP.desk(1.4, 0.8, '#5a5a5e', 0.6); t.position.set(0, 0, -0.2); s.add(t); s.tableY = t.top;
  const lamp = new THREE.Group(); lamp.add(at(cyl(0.005, 0.005, 1.0, '#222', 4), 0, 0.5, 0)); lamp.add(at(mesh(new THREE.ConeGeometry(0.2, 0.16, 18, 1, true), std('#2a2c2e', { side: THREE.DoubleSide })), 0, -0.02, 0));
  lamp.add(at(mesh(new THREE.SphereGeometry(0.05, 10, 8), glowM('#fff2d0', 3)), 0, -0.05, 0)); lamp.position.set(0, 2.0, -0.2); s.add(lamp);
  const L = new THREE.SpotLight('#ffe8c0', 6.5, 4, 0.75, 0.5, 1.3); L.position.set(0, 1.95, 0.05); L.target.position.set(0, 0, -0.2); L.castShadow = true; L.shadow.mapSize.set(1024, 1024); s.add(L, L.target);
  const mirror = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.9), std('#1a2028', { roughness: 0.08, metalness: 0.8 })); mirror.position.set(0, 1.5, -2.47); s.add(mirror);
  s.userData.look = { bloom: 0.5, bloomT: 0.95, warm: 0.07, cool: 0.08, vign: 0.6, sat: 0.9, rim: 0.3 };
  return s;
}
// ------------------------------------------------------------ prison cell
export function celda() {
  const s = rRoom({ w: 5, d: 4, h: 2.8, wall: '#7a766c', lower: '#5a5850', lowerH: 1.0, floor: '#4a4844', ceil: '#6a6860', hemi: 0.35, sunI: 0.2, bg: '#050505', lights: [] });
  const bars = new THREE.Group(); for (let x = -2.2; x <= 2.2; x += 0.16) bars.add(at(cyl(0.02, 0.02, 2.8, '#2a2a2c', 6), x, 1.4, 1.2)); bars.add(at(box(4.6, 0.06, 0.06, '#2a2a2c'), 0, 2.3, 1.2)); bars.add(at(box(4.6, 0.06, 0.06, '#2a2a2c'), 0, 0.3, 1.2)); s.add(bars);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.35), new THREE.MeshBasicMaterial({ color: '#c8d8f0' })); win.position.set(0.6, 2.1, -1.97); s.add(win);
  for (let x = 0.38; x <= 0.84; x += 0.09) s.add(at(box(0.02, 0.36, 0.03, '#2a2a2c'), x, 2.1, -1.95));
  s.add(lightShaft(new THREE.Vector3(0.6, 2.1, -1.9), new THREE.Vector3(0.1, 0, 0.4), 0.6, { color: '#cfe0ff', k: 0.14 }));
  const sun = new THREE.SpotLight('#cfe0ff', 10, 6, 0.4, 0.5, 1.2); sun.position.set(0.6, 2.2, -2.2); sun.target.position.set(0, 0, 0.6); s.add(sun, sun.target);
  s.add(at(box(0.8, 0.36, 1.8, '#5a4a3a'), -1.6, 0.18, -0.6)); s.add(at(box(0.76, 0.06, 1.76, '#c8c4b8'), -1.6, 0.39, -0.6));
  const cal = P.calendar(1989); cal.position.set(1.4, 1.5, -1.95); s.add(cal); s.calendar = cal;
  s.userData.look = { bloom: 0.45, bloomT: 1.0, cool: 0.1, warm: 0.03, vign: 0.55, sat: 0.85 };
  ticker(s); return s;
}
