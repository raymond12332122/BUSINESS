// Sets for the Second World War video. Many rooms and landscapes come from the earlier videos (Versailles, the treaty
// room, the Mexican president's office, the Chamber of Deputies, the Oval Office, Dover, the night sea, the snow
// plain, the codebreakers' room, the war cemetery) and are dressed here for 1939-45; the rest is built below.
import * as THREE from 'three';
import * as LP from '../lib/props.js';
import * as WS from '../whatif/sets.js';
import * as W1 from '../ww1/sets.js';
import * as P from './props.js';
import * as LK from '../amer/look.js';
import * as RS from '../rusia/sets.js';
import * as AS from '../amer/sets.js';
import * as W1P from '../ww1/props.js';
import * as NS from '../napo/sets.js';
import * as NPR from '../napo/props.js';
import * as WP from '../whatif/props.js';
export const { bakeAll } = W1;
export { WS, W1 };
const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, ...o });
const ticker = s => { s.ticks = s.ticks || []; if (!s.tick) s.tick = t => s.ticks.forEach(f => f(t)); return s.ticks; };

// ------------------------------------------------------------ London in the Blitz (night)
// A blacked-out street of brick terraces running away from the camera (-z), St Paul's dome and Big Ben on the
// skyline, searchlights sweeping, barrage balloons, bombers overhead and fires glowing on the horizon.
export function blitzNight() {
  const s = WS.wStage('nightCity', ['#25262b', '#212226'], { groundSize: 260 });
  if (s.fog) { s.fog.color.set('#1c2234'); s.fog.near = 40; s.fog.far = 210; }
  P.stars(s, 700, 320, 5);
  const road = LP.at(LP.box(7, 0.02, 120, '#1c1d21'), 0, 0.011, -40); s.add(road);
  for (const x of [-4.6, 4.6]) s.add(LP.at(LP.box(2.2, 0.12, 120, '#3a3b40'), x, 0.06, -40));
  const cols = ['#6a3a2e', '#5a3428', '#74443a', '#5e3a30'];
  for (let i = 0; i < 9; i++) for (const side of [-1, 1]) {
    const w = 9 + (i * 7 % 3), h = 8 + ((i * 5 + (side > 0 ? 2 : 0)) % 4), b = P.terrace(w, h, 6, cols[(i + (side > 0 ? 1 : 0)) % 4], i * 2 + (side > 0 ? 1 : 0));
    b.position.set(side * 9, 0, 6 - i * 11.5); b.rotation.y = -side * Math.PI / 2; s.add(b);
  }
  const sp = P.stPauls(); sp.position.set(-22, 0, -120); sp.scale.setScalar(1.3); s.add(sp); s.stPauls = sp;
  const bb = P.bigBen(); bb.position.set(30, 0, -135); s.add(bb);
  s.lights = [[-40, -70, 0.3], [-8, -95, 1.7], [26, -80, 3.1], [55, -60, 4.4]].map(([x, z, ph]) => { const l = P.searchlight(); l.position.set(x, 0, z); s.add(l); l.ph = ph; return l; });
  s.balloons = [[-30, -60, 30], [14, -75, 36], [48, -100, 32], [-55, -110, 40]].map(([x, z, h]) => { const b = P.balloon(h); b.position.set(x, 0, z); s.add(b); return b; });
  s.fires = [[-36, 6, -150, 40], [18, 5, -160, 34], [60, 6, -140, 30], [-70, 4, -130, 26]].map(([x, y, z, k]) => { const g = P.glow('#ff6a20', k, 0.55); g.position.set(x, y, z); s.add(g); return g; });
  const amb = new THREE.PointLight('#ff8a40', 30, 120, 1.4); amb.position.set(0, 18, -150); s.add(amb);
  ticker(s).push(t => {
    s.lights.forEach(l => l.aim(0.5 * Math.sin(t * 0.23 + l.ph) + (l.position.x > 0 ? 0.25 : -0.25), 0.75 + 0.3 * Math.sin(t * 0.31 + l.ph * 1.7)));
    s.balloons.forEach(b => b.bob(t));
    s.fires.forEach((f, i) => { f.material.opacity = 0.45 + 0.15 * Math.sin(t * 3.1 + i * 2) + 0.08 * Math.sin(t * 7.3 + i); });
  });
  return s;
}

// ------------------------------------------------------------ 1929: a breadline outside a soup kitchen (overcast)
import * as NP from '../narco/props.js';
import * as RP from '../rusia/props.js';
export function depression() {
  const s = WS.wStage('overcast', ['#8f8b84', '#85817a'], { groundSize: 180 });
  const cols = ['#9a8f80', '#8a8070', '#a69a88', '#7e776c'];
  for (let i = 0; i < 5; i++) { const b = NP.building(7, 9 + (i % 3) * 2, 6, cols[i % 4], { seed: i }); b.position.set(-14 + i * 7.2, 0, -8.8); s.add(b); }
  // the soup kitchen's shopfront (chibi scale: a door is 1.6 high); the line forms along it, the table at its left end
  s.add(LP.at(LP.box(7.5, 2.7, 0.3, '#5a4a3a'), 0, 1.35, -5.65));
  const sign = RP.signBoard('SOPA GRATIS · DESEMPLEADOS', { w: 3.4, h: 0.42, bg: '#26201a', fg: '#f0e6c8', border: '#a08a5a' }); sign.position.set(-0.4, 1.98, -5.47); s.add(sign);
  s.add(LP.at(LP.box(0.95, 1.7, 0.06, '#3a2a1c'), -2.75, 0.85, -5.49)); s.add(LP.at(LP.box(0.8, 1.58, 0.06, '#241a12'), -2.75, 0.79, -5.46));
  for (const x of [0.35, 2.45]) { s.add(LP.at(LP.box(1.4, 1.0, 0.06, '#2a241c'), x, 1.12, -5.49));
    s.add(LP.at(new THREE.Mesh(new THREE.PlaneGeometry(1.26, 0.86), new THREE.MeshStandardMaterial({ color: '#c8a868', emissive: '#a07838', emissiveIntensity: 0.5, roughness: 0.4 })), x, 1.12, -5.455)); }
  // trestle table with the pot and the bowls
  const T = s.table = { x: -1.3, z: -4.72, top: 0.41 };
  s.add(LP.at(LP.box(1.1, 0.04, 0.42, '#6a4a2e'), T.x, T.top - 0.02, T.z));
  for (const dx of [-0.5, 0.5]) for (const dz of [-0.17, 0.17]) s.add(LP.at(LP.box(0.035, T.top - 0.04, 0.035, '#4a3420'), T.x + dx, (T.top - 0.04) / 2, T.z + dz));
  s.pot = [T.x + 0.3, T.top, T.z - 0.04];
  s.add(LP.at(LP.cyl(0.15, 0.14, 0.2, '#5a5e62', 18), s.pot[0], T.top + 0.1, s.pot[2])); s.add(LP.at(LP.cyl(0.135, 0.135, 0.01, '#8a5a2a', 18), s.pot[0], T.top + 0.18, s.pot[2]));
  for (let i = 0; i < 4; i++) s.add(LP.at(LP.cyl(0.05, 0.04, 0.035, '#e8e2d4', 12), T.x - 0.4 + (i % 2) * 0.13, T.top + 0.018, T.z - 0.08 + Math.floor(i / 2) * 0.14));
  for (const x of [-4.2, 4.2]) { s.add(LP.at(LP.cyl(0.04, 0.06, 2.8, '#2a2a2e', 8), x, 1.4, -4.3)); s.add(LP.at(LP.cyl(0.13, 0.1, 0.22, '#3a3a3e', 8), x, 2.86, -4.3)); }
  const paper = RP.newspapers('CRISIS', 1); paper.position.set(-0.6, 0.0, -3.4); paper.rotation.y = 0.5; s.add(paper);
  LK.outdoor(s, 'overcast', { kind: 'cobble', noGrass: true });
  return s;
}

// ------------------------------------------------------------ the dictators' tribune (dark, red backlight)
// Three plinths under spotlights in front of a red-lit wall; scenes stand the silhouettes on them.
export function tribune() {
  const s = WS.wStage('night', ['#141416', '#121214'], { groundSize: 120 });
  s.background = new THREE.Color('#07070a'); if (s.fog) { s.fog.color.set('#0a0a0e'); s.fog.near = 30; s.fog.far = 90; }
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 26), new THREE.MeshBasicMaterial({ map: (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d');
    const g = x.createRadialGradient(256, 150, 10, 256, 150, 300); g.addColorStop(0, '#7a1a14'); g.addColorStop(0.5, '#3a0c0a'); g.addColorStop(1, '#0a0606'); x.fillStyle = g; x.fillRect(0, 0, 512, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })(), toneMapped: false }));
  wall.position.set(0, 11, -14); s.add(wall);
  s.plinths = [-5.2, 0, 5.2].map((x, i) => { const p = LP.at(LP.box(2.6, 1.2 + (i === 1 ? 0.6 : 0), 1.8, '#1c1c20'), x, (1.2 + (i === 1 ? 0.6 : 0)) / 2, -6); s.add(p); p.top = 1.2 + (i === 1 ? 0.6 : 0); p.x = x; return p; });
  s.spots = s.plinths.map(p => { const l = new THREE.SpotLight('#ff4a30', 60, 30, 0.45, 0.6, 1.2); l.position.set(p.x, 14, -2); l.target.position.set(p.x, p.top, -6); s.add(l, l.target); l.intensity = 0; return l; });
  const fill = new THREE.PointLight('#ff6040', 8, 30, 1.2); fill.position.set(0, 6, 4); s.add(fill);
  // visible stage beams falling on each plinth (scenes fade them in with the spots: s.beams[i].set(k))
  const tex = (() => { const c = document.createElement('canvas'); c.width = 4; c.height = 128; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.6, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0.12)'); x.fillStyle = g; x.fillRect(0, 0, 4, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  s.beams = s.plinths.map(p => { const h = 11, m = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 1.7, h, 28, 1, true), new THREE.MeshBasicMaterial({ map: tex, color: '#ff9a7a', transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }));
    m.position.set(p.x, p.top + h / 2, -6); m.userData.dynamic = true; s.add(m);
    const pool = new THREE.Mesh(new THREE.CircleGeometry(1.5, 32), new THREE.MeshBasicMaterial({ color: '#ff8a6a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    pool.rotation.x = -Math.PI / 2; pool.position.set(p.x, p.top + 0.01, -6); pool.userData.dynamic = true; s.add(pool);
    m.set = k => { m.visible = pool.visible = k > 0.01; m.material.opacity = 0.32 * k; pool.material.opacity = 0.45 * k; }; m.set(0); return m; });
  return s;
}

// ------------------------------------------------------------ QA: the three tanks side by side on a plain ground
export function tankRow(d = 0) {
  const s = WS.wStage('day', ['#9a9686', '#8f8b7c'], { groundSize: 80 });
  ['pz4', 't34', 'sherman'].forEach((k, i) => { const tk = P.tank(k); tk.position.set(-4 + i * 4, 0, 0); tk.rotation.y = 0.6; tk.drive(d); s.add(tk); });
  return s;
}
// QA: every aircraft on a plain ground, nose toward +x
export function planeRow(spin = 0) {
  const s = WS.wStage('day', ['#9a9686', '#8f8b7c'], { groundSize: 120 });
  ['stuka', 'bf109', 'spitfire', 'zero', 'p47', 'he111', 'b29'].forEach((k, i) => { const p = P.aircraft(k); p.position.set(-14 + (i % 4) * 9, 2.2, i < 4 ? 0 : -14); p.rotation.y = Math.PI / 2; p.spin(spin); s.add(p); });
  return s;
}

// ------------------------------------------------------------ August 1939: the pact, signed in a dim room
// The treaty room from the Russia video, lights down to a lamp over the table; the scene throws the two dictators'
// shadows huge on the back wall (z = -3.5).
export function pactRoom() {
  const s = RS.treatyRoom();
  s.userData.hemi.intensity = 0.32; s.userData.sun.intensity = 0.25; s.background = new THREE.Color('#0a0806');
  s.traverse(o => { if (o.isPointLight) o.intensity *= 0.35; });
  const lamp = new THREE.SpotLight('#ffd8a0', 9, 8, 0.75, 0.6, 1.4); lamp.position.set(0, 2.6, -0.6); lamp.target.position.set(0, 0, -1.0); lamp.castShadow = true; s.add(lamp, lamp.target);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.2, 20, 1, true), new THREE.MeshStandardMaterial({ color: '#2f4a2f', side: THREE.DoubleSide, emissive: '#3a2a10', emissiveIntensity: 0.4 })); shade.position.set(0, 2.62, -1.0); s.add(shade);
  s.add(LP.at(LP.cyl(0.006, 0.006, 0.2, '#2a2a2a', 4), 0, 2.72, -1.0));
  const wash = new THREE.SpotLight('#ffcf9a', 7, 12, 0.9, 0.8, 1.2); wash.position.set(0, 1.2, 2.6); wash.target.position.set(0, 1.4, -3.5); s.add(wash, wash.target);   // the light that throws the shadows
  return s;
}

// ------------------------------------------------------------ 1 September 1939: the border post at dawn
// A dirt road (along z) through stubble fields, the striped barrier across it at z = 0, a sentry box and a sign.
export function border(light = 'dawn') {
  const s = WS.wStage(light, ['#8a8a5e', '#7e7e54'], { groundSize: 240 });
  s.add(LP.at(LP.box(3.0, 0.02, 220, '#9a8a6a'), 0, 0.011, -60));
  for (const x of [-1.25, 1.25]) s.add(LP.at(LP.box(0.35, 0.025, 220, '#8a7a5c'), x, 0.012, -60));
  const b = P.barrier(3.4); b.position.set(-1.7, 0, 0); s.add(b); s.barrier = b;
  const box = new THREE.Group(); box.add(LP.at(LP.box(0.8, 1.5, 0.8, '#e8e2d4'), 0, 0.75, 0)); box.add(LP.at(LP.box(0.95, 0.08, 0.95, '#5a4a3a'), 0, 1.54, 0));
  box.add(LP.at(LP.box(0.5, 0.6, 0.02, '#2a241c'), 0, 0.95, 0.41)); for (let i = 0; i < 4; i++) box.add(LP.at(LP.box(0.82, 0.12, 0.82, i % 2 ? '#c8202a' : '#f2f0ea'), 0, 0.12 + i * 0.12, 0));
  box.position.set(-2.8, 0, 0.9); box.rotation.y = 0.4; s.add(box);
  const sign = RP.signBoard('POLSKA', { w: 1.1, h: 0.42, bg: '#c8202a', fg: '#f2f0ea', border: '#f2f0ea', font: '900 {s}px "DejaVu Sans"' }); sign.position.set(2.4, 1.15, 0.25); s.add(sign);
  s.add(LP.at(LP.cyl(0.035, 0.035, 1.0, '#5a4a3a', 6), 2.4, 0.5, 0.2));
  for (let i = 0; i < 14; i++) { const z = 8 - i * 9; s.add(LP.at(LP.cyl(0.05, 0.07, 3.4, '#5a4a38', 6), 3.4, 1.7, z)); s.add(LP.at(LP.box(0.8, 0.05, 0.05, '#4a3a2a'), 3.4, 3.2, z)); }
  for (let i = 0; i < 40; i++) { const z = 4 - i * 2.2; for (const x of [-4.2, 4.6]) s.add(LP.at(LP.box(0.05, 0.6, 0.05, '#6a5a44'), x, 0.3, z)); }
  LP.scatter(s, (r, i) => LP.roundTree(1.4 + r() * 0.8, '#4a5a34', i), 30, [-80, -120, -12, -30], 2101);
  LP.scatter(s, (r, i) => LP.roundTree(1.4 + r() * 0.8, '#4a5a34', i), 30, [12, -120, 80, -30], 2102);
  for (let i = 0; i < 4; i++) { const h = LP.house(3, 2.6, 2.0, '#e2d8c4', '#7a4a3a'); h.position.set(-18 + i * 9, 0, -46 - (i % 2) * 6); s.add(h); }
  if (s.fog) { s.fog.color.set('#c8c4b8'); s.fog.near = 18; s.fog.far = 140; }
  LK.outdoor(s, light === 'dawn' ? 'sunrise' : light, { kind: 'grass' });
  return s;
}

// ------------------------------------------------------------ 3 September 1939: a family by the wireless
export function parlour() {
  const s = AS.interior({ wall: '#9a8c6a', floor: '#6a4a30', w: 5.4, d: 4.6, h: 2.4, lights: [[0.8, 2.0, 0.6]], windows: false, bulbs: false, paper: 'stripes', dress: { paperAccent: '#6a5a3a', rugOpt: { size: [2.4, 1.7], x: 0.2, z: 0.2, color: '#6a2a24', field: '#2a3048' } } });
  // window on the left wall with daylight and curtains
  const win = new THREE.Group(); win.position.set(-2.68, 1.25, -0.6); win.rotation.y = Math.PI / 2; s.add(win);
  win.add(new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.1), new THREE.MeshBasicMaterial({ color: '#e8eef2' })));
  for (const [w, h, x, y] of [[1.1, 0.06, 0, 0.58], [1.1, 0.08, 0, -0.58], [0.06, 1.2, -0.52, 0], [0.06, 1.2, 0.52, 0], [0.04, 1.1, 0, 0], [1.0, 0.04, 0, 0.18]]) win.add(LP.at(LP.box(w, h, 0.05, '#e8e2d4'), x, y, 0.03));
  for (const k of [-1, 1]) win.add(LP.at(LP.box(0.32, 1.5, 0.05, '#5a2a24'), k * 0.68, 0.05, 0.08));
  const sunL = new THREE.SpotLight('#fff0d8', 10, 9, 0.7, 0.8, 1.2); sunL.position.set(-3.6, 2.0, -0.6); sunL.target.position.set(0.4, 0, 0.2); sunL.castShadow = true; s.add(sunL, sunL.target);
  // fireplace with a mantel clock on the back wall
  const fp = new THREE.Group(); fp.position.set(-0.9, 0, -2.27); s.add(fp);
  fp.add(LP.at(LP.box(1.1, 0.75, 0.18, '#d8ccb4'), 0, 0.375, 0)); fp.add(LP.at(LP.box(0.6, 0.45, 0.06, '#1a1410'), 0, 0.23, 0.07)); fp.add(LP.at(LP.box(1.25, 0.05, 0.26, '#c8bca4'), 0, 0.77, 0.02));
  const clock = new THREE.Group(); clock.add(LP.at(LP.box(0.2, 0.16, 0.07, '#4a2a18'), 0, 0.08, 0)); clock.add(LP.at(new THREE.Mesh(new THREE.CircleGeometry(0.05, 20), new THREE.MeshStandardMaterial({ color: '#f2ead8' })), 0, 0.09, 0.036));
  clock.position.set(0, 0.795, 0.02); fp.add(clock);
  const pic = LK.painting(0.6, 0.45, { seed: 5, kind: 'landscape' }); pic.position.set(-0.9, 1.45, -2.27); s.add(pic);
  // the wireless on a side table, an armchair facing it, a tea table
  const tbl = new THREE.Group(); tbl.add(LP.at(LP.box(0.46, 0.03, 0.3, '#4a2c18'), 0, 0.33, 0)); for (const [x, z] of [[-0.2, -0.12], [0.2, -0.12], [-0.2, 0.12], [0.2, 0.12]]) tbl.add(LP.at(LP.box(0.025, 0.33, 0.025, '#4a2c18'), x, 0.165, z));
  tbl.position.set(1.2, 0, -1.6); s.add(tbl);
  const radio = P.radioSet(); radio.position.set(1.2, 0.345, -1.62); s.add(radio); s.radio = radio;
  const chair = RP.sofa(0.85, '#5a6a4a', '#3a2418'); chair.position.set(0.35, 0, -0.45); chair.rotation.y = 2.4; s.add(chair); s.chair = chair;
  const tea = new THREE.Group(); tea.add(LP.at(LP.cyl(0.16, 0.16, 0.025, '#4a2c18', 18), 0, 0.27, 0)); tea.add(LP.at(LP.cyl(0.02, 0.02, 0.27, '#4a2c18', 8), 0, 0.135, 0));
  tea.add(LP.at(LP.cyl(0.03, 0.025, 0.035, '#f2efe6', 12), 0.05, 0.3, 0)); tea.position.set(-0.4, 0, -0.2); s.add(tea);
  return s;
}

// ------------------------------------------------------------ September 1939: Polish farmland, a village burning on the horizon
export function plains(light = 'day', { burning = true } = {}) {
  const s = WS.wStage(light, ['#8a9458', '#7e884e'], { groundSize: 300 });
  const strips = [['#c8b46a', 0.0], ['#a89a68', 0.2], ['#8aa05a', -0.1], ['#b8a870', 0.3], ['#9aa860', 0.1]];
  for (let i = 0; i < 18; i++) { const [c, a] = strips[i % strips.length], m = new THREE.Mesh(new THREE.PlaneGeometry(22, 7 + (i * 3) % 5), new THREE.MeshStandardMaterial({ color: c, roughness: 1, polygonOffset: true, polygonOffsetFactor: -1 }));
    m.rotation.x = -Math.PI / 2; m.rotation.z = a; m.position.set(-40 + (i % 4) * 24 + (i * 7) % 5, 0.008, 10 - Math.floor(i / 4) * 16); m.receiveShadow = true; s.add(m); }
  s.add(LP.at(LP.box(2.6, 0.02, 260, '#9a8a6a'), 6, 0.012, -60));
  LP.scatter(s, (r, i) => LP.roundTree(1.2 + r() * 0.8, '#4a6234', i), 26, [-90, -110, -20, -40], 2201);
  LP.scatter(s, (r, i) => LP.roundTree(1.2 + r() * 0.8, '#4a6234', i), 26, [24, -110, 90, -40], 2202);
  for (let i = 0; i < 16; i++) s.add(LP.at(LP.pine(1.8, '#3e5a30', i), 9, 0, 6 - i * 8));
  const houses = [];
  for (let i = 0; i < 7; i++) { const h = LP.house(3.2, 2.8, 2.2, ['#e2d8c4', '#d8ccb0', '#e8dcc8'][i % 3], '#7a4a3a'); h.position.set(-30 + i * 7 + (i % 2) * 2, 0, -70 - (i % 3) * 5); h.rotation.y = (i % 3) * 0.3; s.add(h); houses.push(h); }
  const church = new THREE.Group(); church.add(LP.at(LP.box(4, 4, 7, '#e8e2d4'), 0, 2, 0)); church.add(LP.at(LP.box(2, 8, 2, '#e8e2d4'), 0, 4, 3.6)); church.add(LP.at(new THREE.Mesh(new THREE.ConeGeometry(1.5, 3, 4), std('#5a4a3a')), 0, 9.5, 3.6, 0, Math.PI / 4, 0));
  church.position.set(4, 0, -78); s.add(church);
  if (burning) for (const [x, z, k] of [[-23, -72, 1], [-9, -76, 1.2], [11, -71, 0.9]]) {
    W1.fireAt(s, new THREE.Vector3(x, 1.6, z), { n: 12, size: 2.2 * k, rise: 2.6, spread: 2.4 });
    W1.smokeFrom(s, new THREE.Vector3(x, 3, z), { n: 14, color: '#3a3632', size: 2.4 * k, rise: 22, drift: [6, 0, -2], life: 6, opacity: 0.8 });
  }
  LK.outdoor(s, light, { kind: 'grass', grass: { area: [-14, -18, 18, 8], n: 5000 } });
  return s;
}

// ------------------------------------------------------------ May 1940: the Maginot Line, facing east (+z is the front)
export function maginot(light = 'morning') {
  const s = WS.wStage(light, ['#7a9452', '#6e884a'], { groundSize: 260 });
  const c = P.casemate(); c.position.set(0, 0, -3.2); s.add(c);
  for (let i = 0; i < 3; i++) { const w = W1P.wire(9, i); w.position.set(-6 + i * 6, 0, 3.5 + (i % 2) * 0.6); s.add(w); }
  for (let r = 0; r < 4; r++) for (let i = 0; i < 26; i++) { const x = -13 + i * 1.0 + (r % 2) * 0.5, h = 0.5 + ((i * 7 + r) % 3) * 0.12; s.add(LP.at(LP.box(0.12, h, 0.12, '#4a4440'), x, h / 2, 6.5 + r * 0.8, 0.12 * (i % 2 ? 1 : -1), 0, 0)); }
  LP.scatter(s, (r, i) => LP.roundTree(1.5 + r() * 0.7, '#3e5a30', i), 50, [-90, 30, 90, 90], 2301);
  for (let i = 0; i < 6; i++) { const b = P.casemate(); b.position.set(-60 + i * 24, 0, -8 - (i % 2) * 4); b.scale.setScalar(0.8); s.add(b); }
  LK.outdoor(s, light, { kind: 'grass', grass: { area: [-12, -6, 12, 10], n: 5000 } });
  return s;
}

// ------------------------------------------------------------ the Ardennes: a narrow road through dense pine forest (road along z)
export function ardennes(light = 'morning') {
  const s = WS.wStage(light, ['#4e5e3a', '#46563a'], { groundSize: 240 });
  if (s.fog) { s.fog.color.set('#b8c0b0'); s.fog.near = 8; s.fog.far = 70; }
  const road = []; for (let i = 0; i < 40; i++) { const z = 10 - i * 3, x = 2.2 * Math.sin(z * 0.06); road.push([x, z]); s.add(LP.at(LP.box(3.4, 0.02, 3.2, '#8a7c64'), x, 0.011, z, 0, Math.atan(0.13 * Math.cos(z * 0.06)), 0)); }
  s.roadX = z => 2.2 * Math.sin(z * 0.06);
  const r = LP.rng(2401);
  for (let i = 0; i < 260; i++) { const z = 12 - r() * 120, side = r() < 0.5 ? -1 : 1, x = s.roadX(z) + side * (2.6 + r() * 16); const t = LP.pine(1.8 + r() * 1.4, ['#2e4a2a', '#344e2c', '#2a4426'][i % 3], i); t.position.set(x, 0, z); s.add(t); }
  for (let i = 0; i < 30; i++) { const z = 10 - r() * 100, x = s.roadX(z) + (r() < 0.5 ? -1 : 1) * (2.0 + r() * 1.2); s.add(LP.at(new THREE.Mesh(new THREE.DodecahedronGeometry(0.3 + r() * 0.4, 0), std('#7a7a72')), x, 0.15, z)); }
  LK.outdoor(s, light, { kind: 'grass', grass: { area: [-8, -30, 8, 8], n: 3000, colors: ['#4a5e34', '#3e5230'] } });
  return s;
}

// ------------------------------------------------------------ Dunkirk, late May 1940: the beach, the long lines into the sea, the little ships
// Shore along x; dry sand for z > -4, the sea floor slopes down so a chibi wading at z = -9 is in to the waist.
export function dunkirk(light = 'overcast') {
  const s = WS.wStage(light, ['#d8c8a0', '#cdbd94'], { groundSize: 300 });
  s.sandY = z => z > -3 ? 0.12 - Math.max(0, -z) * 0.01 : 0.09 - (-z - 3) * 0.045;
  if (s.userData.ground) s.userData.ground.position.y = -6;
  const sg = new THREE.PlaneGeometry(240, 110, 120, 110); sg.rotateX(-Math.PI / 2); const sp = sg.attributes.position;
  for (let i = 0; i < sp.count; i++) { const z = sp.getZ(i) + 5; sp.setY(i, Math.max(-3, s.sandY(z)) + 0.02 * Math.sin(sp.getX(i) * 0.9) * (z > -3 ? 1 : 0)); }
  sg.computeVertexNormals(); const sand = new THREE.Mesh(sg, std('#d4c49a', { roughness: 1 })); sand.position.z = 5; sand.receiveShadow = true; s.add(sand); s.userData.sand = sand;
  W1.water(s, { color: '#4a6a78', y: 0.0, w: 400, d: 300, z: -150, amp: 0.6 });
  // dunes and the burning town behind
  for (let i = 0; i < 14; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), std('#cdbd8e')); d.scale.set(1.4, 0.35, 0.8); d.position.set(-70 + i * 11, 0, 22 + (i % 3) * 3); s.add(d); }
  for (let i = 0; i < 6; i++) { const h = NPR.townhouseFR(4, 6, ['#d8ccb4', '#cbbfa6', '#e0d4bc'][i % 3], i); h.position.set(20 + i * 5, 0, 40); s.add(h); }
  for (const [x, z, k] of [[26, 46, 1.4], [40, 52, 1.8], [12, 58, 1.2]]) W1.smokeFrom(s, new THREE.Vector3(x, 4, z), { n: 16, color: '#2a2624', size: 3.2 * k, rise: 40, drift: [-14, 0, -6], life: 9, opacity: 0.85 });
  // the East Mole: a long wooden jetty out to sea
  const mole = new THREE.Group(); mole.position.set(-14, 0, 0); s.add(mole);
  mole.add(LP.at(LP.box(1.4, 0.08, 46, '#6a5a44'), 0, 0.75, -24)); for (let i = 0; i < 24; i++) for (const sx of [-0.6, 0.6]) mole.add(LP.at(LP.cyl(0.07, 0.07, 1.6, '#4a3a2a', 6), sx, 0.0, -2 - i * 1.9));
  s.mole = mole;
  const ds = P.destroyer(); ds.position.set(8, 0, -48); ds.rotation.y = Math.PI / 2 + 0.2; s.add(ds); s.destroyer = ds;
  const ds2 = P.destroyer(); ds2.position.set(-34, 0, -70); ds2.rotation.y = Math.PI / 2 - 0.1; ds2.scale.setScalar(0.9); s.add(ds2);
  s.boats = [['#3a5a7a', 1, -12.6, 0.3], ['#7a3a2a', 5.0, -14.9, -0.5], ['#2a5a3a', -4.0, -14.0, 0.9], ['#5a4a6a', 9, -19, 0.2], ['#3a3a3a', -9, -20, -0.3]].map(([c, x, z, r], i) => {
    const b = P.smallBoat(c, { seed: i }); b.position.set(x, 0, z); b.rotation.y = r; s.add(b); return b; });
  ticker(s).push(t => s.boats.forEach(b => b.bob(t)));
  LK.outdoor(s, light, { kind: 'dirt', noGrass: true });
  return s;
}

// ------------------------------------------------------------ 14 June 1940: the Champs-Élysées (avenue along z, the Arc at the far end)
export function champs(light = 'overcast') {
  const s = WS.wStage(light, ['#a8a49a', '#9e9a90'], { groundSize: 300 });
  s.add(LP.at(LP.box(9, 0.02, 200, '#6a6a6c'), 0, 0.011, -60));
  for (const x of [-6.2, 6.2]) s.add(LP.at(LP.box(3.4, 0.08, 200, '#b8b2a6'), x, 0.04, -60));
  for (const sx of [-1, 1]) for (let i = 0; i < 11; i++) { const h = NPR.townhouseFR(5.2, 5.6, ['#e2d6bf', '#d8ccb4', '#e8dcc6'][i % 3], i); h.scale.setScalar(1.25); h.position.set(sx * 12.5, 0, 8 - i * 8.2); h.rotation.y = -sx * Math.PI / 2; s.add(h); }
  for (const sx of [-1, 1]) for (let i = 0; i < 15; i++) s.add(LP.at(LP.roundTree(1.1, '#5a7a3a', i + (sx > 0 ? 40 : 0)), sx * 7.4, 0, 8 - i * 5.5));
  const arc = P.arcTriomphe(); arc.position.set(0, 0, -92); s.add(arc); if (s.fog) s.fog.far = Math.max(s.fog.far, 240);
  const ef = WP.eiffel(30); ef.position.set(-46, 0, -90); s.add(ef);
  LK.outdoor(s, light, { kind: 'cobble', noGrass: true });
  return s;
}

// ------------------------------------------------------------ June 1940: the House of Commons (aisle along z, the Speaker's chair at -z)
export function commons() {
  const s = AS.interior({ wall: '#5a4630', floor: '#3a2a1c', w: 9, d: 11, h: 4.2, lights: [[0, 3.6, 0], [0, 3.6, -3]], windows: false, bulbs: false, paper: 'stripes', dress: { paperAccent: '#3a2a1c', paintings: 0 } });
  s.userData.hemi.intensity = 0.75;
  s.benches = [];
  for (const sx of [-1, 1]) for (let row = 0; row < 3; row++) {
    const x = sx * (1.25 + row * 0.62), y = 0.2 + row * 0.2, base = y - 0.05;
    if (row) s.add(LP.at(LP.box(0.62, base, 9.4, '#3a2a1c'), x, base / 2, -0.4));
    s.add(LP.at(LP.box(0.5, 0.06, 9.2, '#2f5a3a'), x, y, -0.4)); s.add(LP.at(LP.box(0.5, Math.max(0.04, y - 0.06), 9.2, '#3a2a1c'), x, (y - 0.06) / 2, -0.4));
    s.add(LP.at(LP.box(0.08, 0.3, 9.2, '#2f5a3a'), x + sx * 0.27, y + 0.15, -0.4));
    s.benches.push({ x, y: y + 0.03, sx, row });
  }
  const tb = new THREE.Group(); tb.add(LP.at(LP.box(1.0, 0.54, 2.6, '#4a3020'), 0, 0.27, 0)); tb.add(LP.at(LP.box(1.04, 0.03, 2.64, '#2f5a3a'), 0, 0.555, 0));
  for (const sz of [-1, 1]) tb.add(LP.at(LP.box(0.26, 0.16, 0.2, '#7a5a30'), sz * 0.36, 0.65, 0.9 * sz));
  tb.position.set(0, 0, -0.6); s.add(tb); s.table = tb; s.dispatch = [[0.36, 0.73, 0.3], [-0.36, 0.73, -1.5]];
  const sp = new THREE.Group(); sp.add(LP.at(LP.box(1.2, 1.5, 0.8, '#4a3020'), 0, 0.75, 0)); sp.add(LP.at(LP.box(1.4, 0.2, 1.0, '#6a4a2a'), 0, 2.4, 0.1)); for (const sx of [-0.6, 0.6]) sp.add(LP.at(LP.box(0.1, 2.4, 0.1, '#4a3020'), sx, 1.2, 0.4));
  sp.position.set(0, 0, -4.9); s.add(sp);
  return s;
}

// ------------------------------------------------------------ an RAF sector operations room: the plotting table and the gallery
export function opsRoom() {
  const s = RS.room({ w: 8, d: 7, h: 3.4, wall: '#6a6a5a', lower: '#3a3a30', lowerH: 1.0, floor: '#4a4036', ceil: '#d8d4c4', hemi: 0.55, sunI: 0.3, lights: [[0, 2.9, 0.5, 6, '#ffe2b8', 8], [0, 2.9, -2, 4, '#ffe2b8', 8]] });
  const tb = P.plotTable(3.4, 2.4); tb.position.set(0, 0, 0.3); s.add(tb); s.table = tb;
  const gal = new THREE.Group(); gal.add(LP.at(LP.box(8, 1.1, 1.6, '#4a3a2a'), 0, 0.55, 0)); gal.add(LP.at(LP.box(8, 0.5, 0.06, '#3a2a1e'), 0, 1.35, 0.8));
  gal.add(LP.at(new THREE.Mesh(new THREE.PlaneGeometry(8, 0.9), new THREE.MeshStandardMaterial({ color: '#a8c0d0', transparent: true, opacity: 0.18, roughness: 0.1 })), 0, 2.05, 0.8));
  gal.position.set(0, 0, -2.7); s.add(gal); s.galleryY = 1.1;
  const tote = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 0.9), new THREE.MeshBasicMaterial({ map: (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 96; const x = c.getContext('2d');
    x.fillStyle = '#1a1a16'; x.fillRect(0, 0, 512, 96); for (let i = 0; i < 12; i++) for (let j = 0; j < 4; j++) { x.fillStyle = ['#e04a3a', '#e8c24a', '#4ac06a', '#3a3a34'][(i * 3 + j * 5) % 4]; x.fillRect(10 + i * 41, 10 + j * 20, 30, 12); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })() }));
  tote.position.set(0, 2.85, -3.47); s.add(tote);
  const clock = new THREE.Mesh(new THREE.CircleGeometry(0.3, 24), new THREE.MeshStandardMaterial({ color: '#f2ead8' })); clock.position.set(3.0, 2.85, -3.46); s.add(clock);
  return s;
}

// ------------------------------------------------------------ Stalingrad, 1942-43: a city of ruins (streets along z and x)
export function stalingrad(light = 'overcast', { snow = false } = {}) {
  const s = WS.wStage(light, snow ? ['#d8dde2', '#cfd5da'] : ['#6e6458', '#655c50'], { groundSize: 260 });
  if (s.fog) { s.fog.color.set(snow ? '#c8ccd2' : '#a89c8c'); s.fog.near = 14; s.fog.far = 110; }
  const r = LP.rng(snow ? 2601 : 2501), cols = ['#b9a48a', '#a8a090', '#c2b49a', '#9a8c7a'];
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { if ((i === 2 && j < 4) || (j === 1 && i < 4)) continue;   // keep two streets clear
    const b = P.ruinBlock(6 + r() * 3, 6 + r() * 6, 5 + r() * 2, cols[(i + j) % 4], i * 5 + j); b.position.set(-22 + i * 11 + (r() - 0.5) * 2, 0, 4 - j * 12 + (r() - 0.5) * 2); b.rotation.y = (r() - 0.5) * 0.2; s.add(b); }
  for (let i = 0; i < 16; i++) { const rb = P.rubble(1.6 + r() * 1.6, i, snow ? '#9a9890' : '#857664'); rb.position.set(-26 + r() * 52, 0, 8 - r() * 56); s.add(rb); }
  const el = P.elevator(); el.position.set(-30, 0, -70); el.rotation.y = 0.3; s.add(el);
  const wreck = P.tank('pz4', { col: '#2e2e2c' }); wreck.scale.setScalar(0.48); wreck.position.set(4.2, -0.12, -9); wreck.rotation.set(0.06, -0.7, 0.08); wreck.turret.rotation.y = 0.9; s.add(wreck);
  if (!snow) { for (const [x, z, k] of [[-14, -30, 1.4], [10, -44, 1.8], [-34, -52, 1.2], [22, -24, 1.0]]) { W1.smokeFrom(s, new THREE.Vector3(x, 4, z), { n: 14, color: '#3a3430', size: 3 * k, rise: 30, drift: [5, 0, -3], life: 8, opacity: 0.7 }); W1.fireAt(s, new THREE.Vector3(x, 1.5, z), { n: 10, size: 1.8 * k, rise: 2, spread: 2 }); } }
  else { const sn = RP.snowfall(s, { area: [-14, 0, -24, 14, 12, 8], n: 1800 }); ticker(s).push(t => sn.update(t)); }
  LK.outdoor(s, light, { kind: snow ? 'snow' : 'dirt', noGrass: true });
  return s;
}

// ------------------------------------------------------------ winter 1941: open snowfield before Moscow, birches, a blizzard
export function winterField(light = 'blizzard', { blizzard = true } = {}) {
  const s = RS.rStage('snow', RS.SNOW, { seed: 2701, bumps: 0.6 });
  if (s.fog) { s.fog.color.set('#d4dae0'); s.fog.near = blizzard ? 6 : 20; s.fog.far = blizzard ? 48 : 140; }
  LP.scatter(s, (r, i) => LP.birch(1.3 + r() * 0.5, i), 60, [-70, -90, 70, 20], 2702, [[0, 0, 10]]);
  const sn = RP.snowfall(s, { area: [-14, 0, -20, 14, 10, 10], n: blizzard ? 3200 : 1200, speed: blizzard ? 2.2 : 1.0, drift: blizzard ? 2.4 : 0.4 }); ticker(s).push(t => sn.update(t));
  LK.outdoor(s, light, { kind: 'snow', noGrass: true });
  return s;
}
