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
import * as NS2 from '../napo/sets.js';
import * as MX from '../mx/props.js';
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

// ------------------------------------------------------------ 7 December 1941: Pearl Harbor (Battleship Row along x at z = -14)
export function pearlHarbor(light = 'morning') {
  const s = NS2.napoStage(light, [null, null], { seed: 2801, groundA: null, fog: ['#d8e2e8', 60, 260] });
  NS2.sea(s, { color: '#3a7a92', y: 0, size: 500 });
  const isl = new THREE.Mesh(new THREE.CylinderGeometry(30, 32, 1.2, 40), std('#7a9a58', { roughness: 1 })); isl.scale.set(1.6, 1, 0.5); isl.position.set(6, 0.1, -32); s.add(isl);
  s.add(LP.at(LP.box(90, 0.6, 3, '#9a9488'), 6, 0.3, -18.5));
  s.ships = [-28, -14, 0, 14, 28].map((x, i) => { const b = RP.dreadnought(30, '#7a8288'); b.position.set(x, -0.2, -14.5 + (i % 2) * -0.4); b.rotation.y = Math.PI / 2; s.add(b); return b; });
  s.add(MX.sierra({ x0: -200, x1: 200, z: -110, depth: 60, height: 26, seed: 2802, base: '#4e6a3a', top: '#6e8a4e' }));
  LP.scatter(s, (r, i) => LP.palm(1.4 + r() * 0.6, i), 18, [-30, 8, 30, 16], 2803);
  const pier = new THREE.Group(); pier.add(LP.at(LP.box(3, 0.2, 14, '#7a6a52'), 0, 0.6, 0)); for (let i = 0; i < 8; i++) for (const sx of [-1.3, 1.3]) pier.add(LP.at(LP.cyl(0.1, 0.1, 1.6, '#4a3a2a', 6), sx, 0, -6 + i * 1.7));
  pier.position.set(4, 0, 2); s.add(pier); s.pierY = 0.7;
  const shore = new THREE.Mesh(new THREE.BoxGeometry(160, 0.8, 30), std('#b8a888', { roughness: 1 })); shore.position.set(0, 0.2, 24); s.add(shore);
  return s;
}

// ------------------------------------------------------------ the open Pacific (Midway): sea, haze, a carrier task force
export function pacificSea(light = 'day') {
  const s = NS2.napoStage(light, [null, null], { seed: 2811, groundA: null, fog: ['#dfe8ee', 80, 340] });
  NS2.sea(s, { color: '#2e6a88', y: 0, size: 600 });
  W1.clouds(s, 18, { y: 40, spread: 300 });
  return s;
}

// ------------------------------------------------------------ an island beach under assault (Tarawa, Iwo Jima…): shore along x
export function islandBeach(light = 'day', { palms = true } = {}) {
  const s = NS2.napoStage(light, [null, null], { seed: 2821, groundA: null, fog: ['#e2e6e2', 60, 260] });
  NS2.sea(s, { color: '#3a8aa0', y: 0, size: 500 });
  const sand = new THREE.Mesh(new THREE.BoxGeometry(200, 1.0, 60), std('#e0d0a0', { roughness: 1 })); sand.position.set(0, -0.164, 30); sand.rotation.x = -0.012; s.add(sand);   // waterline at z = 2
  if (palms) LP.scatter(s, (r, i) => LP.palm(1.4 + r() * 0.8, i), 34, [-40, 6, 40, 34], 2822, [[2, 6, 7]]);
  for (const [x, z, k] of [[-12, 20, 1.4], [8, 26, 1.8], [22, 18, 1.1]]) W1.smokeFrom(s, new THREE.Vector3(x, 2, z), { n: 12, color: '#4a4440', size: 2.4 * k, rise: 24, drift: [4, 0, -3], life: 7, opacity: 0.7 });
  for (let i = 0; i < 3; i++) { const d = P.destroyer(); d.position.set(-40 + i * 34, 0, -70 - i * 10); d.rotation.y = Math.PI / 2; s.add(d); }
  return s;
}

// ------------------------------------------------------------ China: the Great Wall over the hills
export function greatWallSet(light = 'golden') {
  const s = WS.wStage(light, ['#8a8a58', '#7e7e50'], { groundSize: 300 });
  const hAt = (x, z) => Math.max(0, 6 * Math.sin(x * 0.05 + 1) + 4 * Math.sin(z * 0.07) + 7) * (z < -6 ? 1 : 0.0) ;
  const hills = new THREE.PlaneGeometry(260, 200, 90, 70); hills.rotateX(-Math.PI / 2); const hp = hills.attributes.position;
  for (let i = 0; i < hp.count; i++) { const x = hp.getX(i), z = hp.getZ(i) - 70; hp.setY(i, Math.max(0, 6 * Math.sin(x * 0.05 + 1) + 4 * Math.sin(z * 0.07) + 7) * Math.min(1, Math.max(0, (-z - 6) / 10))); }
  hills.computeVertexNormals(); const hm = new THREE.Mesh(hills, std('#7a8050', { roughness: 1 })); hm.position.z = -70; hm.receiveShadow = true; s.add(hm);
  const hY = (x, z) => Math.max(0, 6 * Math.sin(x * 0.05 + 1) + 4 * Math.sin(z * 0.07) + 7) * Math.min(1, Math.max(0, (-z - 6) / 10));
  const pts = Array.from({ length: 22 }, (_, i) => [-60 + i * 6, -22 - 8 * Math.sin(i * 0.5) - (i % 3)]);
  s.add(P.greatWall(pts, hY));
  // a wall walk in the foreground for the soldiers (flat, at ground level)
  const near = P.greatWall([[-9, -1.2], [-3, -1.6], [3, -1.4], [9, -1.0]], () => 0); s.add(near); s.walkY = 2.0;
  LP.scatter(s, (r, i) => LP.pine(1.4 + r() * 0.6, '#3e5a30', i), 40, [-90, -110, 90, -30], 2831);
  LK.outdoor(s, light, { kind: 'grass', grass: { area: [-14, 0, 14, 10], n: 3000 } });
  return s;
}

// ------------------------------------------------------------ North Africa: the desert at El Alamein (dunes, scrub, an escarpment)
export function desert(light = 'golden') {
  const s = WS.wStage(light, ['#d8c08a', '#ccb47e'], { groundSize: 300, bumps: 0.4 });
  const r = LP.rng(2901);
  for (let i = 0; i < 26; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(5 + r() * 6, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), std('#d4bc86', { roughness: 1 })); d.scale.set(1.6, 0.18 + r() * 0.12, 1); d.position.set(-90 + r() * 180, 0, -20 - r() * 90); d.rotation.y = r() * 3; s.add(d); }
  s.add(MX.sierra({ x0: -220, x1: 220, z: -130, depth: 50, height: 9, seed: 2902, base: '#b89a6a', top: '#d0b282' }));
  for (let i = 0; i < 40; i++) s.add(LP.at(LP.bush(0.35 + r() * 0.3, '#7a7a4a', i), -30 + r() * 60, 0, 6 - r() * 50));
  const wreck = P.tank('pz4', { col: '#5a4e3a' }); wreck.scale.setScalar(0.48); wreck.position.set(-9, -0.1, -16); wreck.rotation.set(0.05, 0.8, -0.06); wreck.turret.rotation.y = -1.1; s.add(wreck);
  W1.smokeFrom(s, new THREE.Vector3(-9, 1.2, -16), { n: 10, color: '#2a2624', size: 1.4, rise: 14, drift: [3, 0, -2], life: 5, opacity: 0.7 });
  LK.outdoor(s, light, { kind: 'dirt', noGrass: true });
  return s;
}

// ------------------------------------------------------------ Sicily, July 1943: a beach below a white hill town (shore along x, sea at -z)
export function sicily(light = 'day') {
  const s = islandBeach(light, { palms: false });
  LP.scatter(s, (r, i) => LP.roundTree(0.9 + r() * 0.4, '#7a8a5a', i), 26, [-40, 8, 40, 30], 2912, [[2, 6, 7]]);   // olive groves
  const hill = new THREE.Mesh(new THREE.SphereGeometry(30, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), std('#a89a68', { roughness: 1 })); hill.scale.set(1.6, 0.42, 0.8); hill.position.set(6, 0, 52); s.add(hill);
  const r = LP.rng(2911);
  for (let i = 0; i < 24; i++) { const a = r() * Math.PI, d = 8 + r() * 14, x = 6 + Math.cos(a) * d * 1.4, z = 40 + Math.sin(a) * d * 0.5, y = 9.5 * Math.sqrt(Math.max(0, 1 - ((x - 6) / 48) ** 2 - ((z - 52) / 24) ** 2));
    const h = LP.house(2.2 + r(), 2, 1.6 + r(), ['#f2ece0', '#ece2cc', '#f6f0e4'][i % 3], '#c46a44'); h.position.set(x, y, z); h.rotation.y = r() * 0.6; s.add(h); }
  const ch = new THREE.Group(); ch.add(LP.at(LP.box(3, 3, 5, '#f2ece0'), 0, 1.5, 0)); ch.add(LP.at(LP.box(1.4, 6, 1.4, '#f2ece0'), 1.6, 3, 2)); ch.add(LP.at(new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), std('#c46a44')), 0, 3, 0));
  ch.position.set(6, 12, 52); s.add(ch);
  return s;
}

// ------------------------------------------------------------ the Apennines in winter (Monte Castello, 1945): a snowy slope rising to -z
export function apennines(light = 'snow') {
  const s = RS.rStage('snow', RS.SNOW, { seed: 2921, bumps: 0.8 });
  const sl = new THREE.PlaneGeometry(120, 80, 60, 40); sl.rotateX(-Math.PI / 2); const sp = sl.attributes.position;
  for (let i = 0; i < sp.count; i++) { const z = sp.getZ(i) - 40, x = sp.getX(i); sp.setY(i, Math.max(0, -z - 4) * 0.22 + 0.6 * Math.sin(x * 0.2) * Math.min(1, Math.max(0, (-z - 4) / 6))); }
  sl.computeVertexNormals(); const slope = new THREE.Mesh(sl, std('#e8eef2', { roughness: 0.95 })); slope.position.z = -40; slope.receiveShadow = true; s.add(slope);   // heights were computed at z - 40
  s.slopeY = (x, z) => Math.max(0, -z - 4) * 0.22 + 0.6 * Math.sin(x * 0.2) * Math.min(1, Math.max(0, (-z - 4) / 6));
  s.add(MX.sierra({ x0: -200, x1: 200, z: -120, depth: 60, height: 34, seed: 2922, base: '#8a8f9a', top: '#f4f6f8' }));
  { const r = LP.rng(2923); for (let i = 0; i < 120; i++) { const x = -50 + r() * 100, z = 34 - r() * 94; if (Math.abs(x) < 4.5 && z > -15 && z < 5) continue; const t = LP.pine(1.3 + r() * 0.6, '#2e4a34', i); t.position.set(x, s.slopeY(x, z) - 0.1, z); s.add(t); } }
  const sn = RP.snowfall(s, { area: [-14, 0, -20, 14, 10, 10], n: 1200 }); ticker(s).push(t => sn.update(t));
  LK.outdoor(s, light, { kind: 'snow', noGrass: true });
  return s;
}

// ------------------------------------------------------------ the Holocaust, told soberly: places and remembrance, no perpetrators, no violence
import { canvasTex } from '../whatif/kit.js';
// Warsaw, 1940: a grey street of tenements (chibi scale), closed at the far end by the ghetto wall: brick, barbed wire, a shut gate.
export function ghetto(light = 'overcast') {
  const s = WS.wStage(light, ['#7a766e', '#706c64'], { groundSize: 200 });
  if (s.fog) { s.fog.color.set('#a6a49e'); s.fog.near = 16; s.fog.far = 80; }
  s.add(LP.at(LP.box(6.2, 0.02, 80, '#5e5a54'), 0, 0.011, -24));
  for (const x of [-3.9, 3.9]) s.add(LP.at(LP.box(1.6, 0.1, 80, '#8a857c'), x, 0.05, -24));
  const cols = ['#8a8074', '#7a7268', '#958a7a', '#6e6860'];
  for (let i = 0; i < 7; i++) for (const sx of [-1, 1]) { const j = sx > 0 ? 1 : 0, b = P.terrace(7, 6 + ((i * 3 + j) % 3) * 0.8, 5, cols[(i + j) % 4], 60 + i * 2 + j); b.position.set(sx * 7.2, 0, 4 - i * 7.2); b.rotation.y = -sx * Math.PI / 2; s.add(b); }
  const bt = canvasTex(256, 128, (x, W, H) => { x.fillStyle = '#4a3a32'; x.fillRect(0, 0, W, H); for (let j = 0; j < 16; j++) for (let i = -1; i < 17; i++) { const v = 0.82 + ((i * 7 + j * 11) % 9) / 36; x.fillStyle = `rgb(${138 * v | 0},${82 * v | 0},${62 * v | 0})`; x.fillRect(i * 16 + (j % 2) * 8 + 1, j * 8 + 1, 14, 6); } });
  bt.wrapS = bt.wrapT = THREE.RepeatWrapping; bt.repeat.set(5, 1.2);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(9.4, 2.3, 0.35), new THREE.MeshStandardMaterial({ map: bt, roughness: 0.95 })); wall.position.set(0, 1.15, -15); wall.castShadow = wall.receiveShadow = true; s.add(wall);
  s.add(LP.at(LP.box(1.9, 1.75, 0.1, '#3e3226'), 0, 0.875, -14.8));
  for (const x of [-0.6, -0.3, 0, 0.3, 0.6]) s.add(LP.at(LP.box(0.03, 1.7, 0.04, '#2a2018'), x, 0.875, -14.74));
  const bw = MX.barbedWire(9.4); bw.position.set(0, 2.3, -15); bw.scale.set(1, 0.8, 1); s.add(bw);
  const lamp = NP.streetLight(false, 3.2); lamp.position.set(-3.3, 0, -6); s.add(lamp);
  LK.outdoor(s, light, { kind: 'cobble', noGrass: true });
  return s;
}
// Auschwitz-Birkenau in winter fog: the railway runs straight through the arch of the gatehouse; fences, bare trees, a lone wagon.
export function birkenau() {
  const s = RS.rStage('snow', RS.SNOW, { seed: 3101, bumps: 0.25 });
  if (s.fog) { s.fog.color.set('#b4b8be'); s.fog.near = 8; s.fog.far = 95; }
  const tr = RP.track(150, { snow: true }); tr.position.set(0, 0, -55); s.add(tr);
  const gh = P.gatehouse(); gh.position.set(0, 0, -44); s.add(gh); s.gate = gh;
  const side = RP.track(60, { snow: true }); side.position.set(-6.5, 0, -12); s.add(side);
  const car = P.boxcar(); car.position.set(-6.5, 0.1, -3); s.add(car); s.wagon = car;
  for (const sx of [-1, 1]) for (let i = 0; i < 14; i++) { const z = 8 - i * 3.6, x = sx * 12; s.add(LP.at(LP.box(0.16, 2.4, 0.16, '#a8a49c'), x, 1.2, z));
    if (i) for (const y of [0.6, 1.2, 1.8, 2.3]) s.add(LP.at(LP.box(0.012, 0.012, 3.6, '#55524c'), x, y, z + 1.8)); }
  const sn = RP.snowfall(s, { area: [-14, 0, -20, 14, 10, 10], n: 700, speed: 0.6 }); ticker(s).push(t => sn.update(t));
  LK.outdoor(s, 'overcast', { kind: 'snow', noGrass: true });
  return s;
}
// A dark memorial hall: black stone floor, a long wall of blank plaques, candles along its foot. s.row (candles), s.three (tall candles).
export function memorialDark() {
  const s = new THREE.Scene(); s.background = new THREE.Color('#060709'); s.fog = new THREE.Fog('#060709', 7, 24);
  s.add(new THREE.HemisphereLight('#4a4a58', '#0a0a0c', 0.35));
  const key = new THREE.SpotLight('#ffd9a8', 14, 30, 0.5, 0.7, 1.4); key.position.set(0, 7, 5); key.target.position.set(0, 0, -2); s.add(key, key.target);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshStandardMaterial({ color: '#141518', roughness: 0.62, metalness: 0.05 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; s.add(fl);
  const pt = canvasTex(512, 128, (x, W, H) => { x.fillStyle = '#1c1d22'; x.fillRect(0, 0, W, H); for (let i = 0; i < 8; i++) { x.fillStyle = '#26282e'; x.fillRect(i * 64 + 4, 8, 56, H - 16); x.fillStyle = 'rgba(200,190,170,0.18)'; for (let j = 0; j < 9; j++) x.fillRect(i * 64 + 12, 20 + j * 11, 30 + ((i * 13 + j * 7) % 12), 3); } });
  pt.wrapS = THREE.RepeatWrapping; pt.repeat.set(3, 1);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(18, 2.6, 0.5), new THREE.MeshStandardMaterial({ map: pt, roughness: 0.6 })); wall.position.set(0, 1.3, -3.2); wall.receiveShadow = true; s.add(wall);
  s.row = Array.from({ length: 34 }, (_, i) => { const c = P.memCandle(0.16 + ((i * 7) % 5) * 0.03, { seed: i }); c.position.set(-8 + i * 0.48 + ((i * 5) % 3) * 0.06, 0, -2.75 + ((i * 3) % 4) * 0.12); s.add(c); return c; });
  for (const [x, z] of [[-4, -2.5], [0, -2.5], [4, -2.5]]) { const l = new THREE.PointLight('#ffb766', 1.6, 5, 1.6); l.position.set(x, 0.45, z); s.add(l); }
  s.three = [-0.55, 0, 0.55].map((x, i) => { const c = P.memCandle(0.42, { seed: 40 + i, light: true, power: 1.6 }); c.position.set(x, 0, 1.2); s.add(c); return c; });
  ticker(s); s.userData = { interior: true };
  return s;
}
// Amsterdam, 1942–44: Anne's room in the Secret Annex — faded wallpaper with her pictures pasted on it, a window on the chestnut tree,
// a small desk facing the room (she sits behind it, the window at her back). s.desk.top, s.chair, s.P (the page she writes on).
export function annex() {
  const s = RS.room({ w: 5.4, d: 4.6, h: 2.5, wall: '#b4a684', lower: '#6a5a44', lowerH: 0.62, floor: '#5e4632', ceil: '#e2dac6', hemi: 0.7, sunI: 0.5,
    lights: [[0.5, 1.7, -1.4, 2.6, '#ffe6bc', 6], [-1.6, 2.2, 1.0, 1.4, '#ffe2b8', 7]], bg: '#1a140e' });
  const win = new THREE.Group(); win.position.set(0.3, 1.32, -2.29); s.add(win);
  win.add(new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.1), new THREE.MeshBasicMaterial({ map: P.annexView(), toneMapped: false })));
  for (const [w, h, x, y] of [[1.12, 0.07, 0, 0.58], [1.12, 0.1, 0, -0.58], [0.07, 1.2, -0.53, 0], [0.07, 1.2, 0.53, 0], [0.04, 1.1, 0, 0], [1.0, 0.04, 0, 0.18]]) win.add(LP.at(LP.box(w, h, 0.06, '#e8e2d4'), x, y, 0.03));
  const sun = new THREE.SpotLight('#fff0d0', 10, 9, 0.6, 0.6, 1.2); sun.position.set(0.3, 1.5, -2.6); sun.target.position.set(0, 0.3, 0.4); s.add(sun, sun.target);
  const pics = canvasTex(256, 256, (x, W, H) => { x.clearRect(0, 0, W, H); const cs = ['#d8c8a8', '#c8b8a0', '#e0d4bc', '#b8a890', '#d0c0a4']; for (let i = 0; i < 14; i++) { const px = (i * 61) % 200 + 10, py = ((i * 97) % 190) + 10, w = 34 + (i * 13) % 20, h = 44 + (i * 7) % 18;
    x.save(); x.translate(px + w / 2, py + h / 2); x.rotate(((i * 37) % 11 - 5) / 60); x.fillStyle = cs[i % 5]; x.fillRect(-w / 2, -h / 2, w, h); x.fillStyle = 'rgba(60,50,40,0.55)'; x.beginPath(); x.ellipse(0, -h * 0.08, w * 0.22, h * 0.24, 0, 0, 7); x.fill(); x.fillRect(-w * 0.3, h * 0.18, w * 0.6, h * 0.22); x.restore(); } });
  const pm = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.2), new THREE.MeshStandardMaterial({ map: pics, transparent: true, roughness: 0.9 })); pm.position.set(-1.35, 1.35, -2.28); s.add(pm);
  const desk = RP.desk(1.3, 0.62, '#5a3e28'); desk.position.set(0.3, 0, -1.05); s.add(desk); s.desk = desk;
  const chair = RP.chairR('#5a3e28', '#6a4a30'); chair.position.set(0.3, 0, -1.62); s.add(chair); s.chair = chair;
  const bed = new THREE.Group(); bed.add(LP.at(LP.box(0.72, 0.22, 1.5, '#5a3e28'), 0, 0.11, 0)); bed.add(LP.at(LP.box(0.68, 0.08, 1.46, '#d8d0bc'), 0, 0.26, 0)); bed.add(LP.at(LP.box(0.5, 0.07, 0.28, '#efe8d8'), 0, 0.33, -0.55)); bed.add(LP.at(LP.box(0.7, 0.05, 0.8, '#7a5a5a'), 0, 0.31, 0.3)); bed.position.set(-2.1, 0, -0.9); s.add(bed);
  const shelf = RP.bookshelf(1.0, 1.6, 7, 0.5); shelf.position.set(2.45, 0, -0.6); shelf.rotation.y = -Math.PI / 2; s.add(shelf);
  const lamp = RP.deskLamp(true, '#7a5a2a', 0.38); lamp.position.set(-0.12, desk.top, -1.0); s.add(lamp);
  s.P = [0.3, desk.top, -0.95];
  return s;
}

// ------------------------------------------------------------ the home front, the Night Witches, Bletchley Park, the science
// An aircraft plant (1943): a long hall, two lines of fighters on low jigs nose toward +z, skylights, hanging lamps.
// s.planes[line][i]; the near plane of the left line is at (-3.2, 0.85, -2.5); the aisle is x = 0.
export function aircraftPlant() {
  const s = RS.room({ w: 26, d: 76, h: 10, wall: '#b4b0a4', lower: '#6a6e72', lowerH: 1.6, floor: '#8c8a84', ceil: '#5e6064', hemi: 1.0, sunI: 0.7,
    lights: [[0, 8, 0, 30, '#fff2dc', 40], [0, 8, -20, 30, '#fff2dc', 40]], bg: '#2a2c30' });
  s.fog = new THREE.Fog('#a8a8a4', 30, 80);
  for (let i = 0; i < 12; i++) { const z = 30 - i * 6.2; s.add(LP.at(LP.box(26, 0.35, 0.3, '#3a3e44'), 0, 9.2, z)); s.add(LP.at(LP.box(0.2, 1.2, 0.2, '#3a3e44'), 0, 8.5, z));
    const lamp = new THREE.Group(); lamp.add(LP.at(LP.cyl(0.02, 0.02, 2.6, '#2a2a2a', 4), 0, 7.6, 0)); lamp.add(LP.at(new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.4, 16, 1, true), new THREE.MeshStandardMaterial({ color: '#2f5a3a', side: THREE.DoubleSide })), 0, 6.2, 0));
    const gl = P.glow('#fff0c8', 2.2, 0.55); gl.position.y = 6.0; lamp.add(gl); for (const x of [-5.5, 5.5]) { const l = lamp.clone(); l.position.set(x, 0, z); s.add(l); } }
  for (let i = 0; i < 6; i++) { const sk = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), new THREE.MeshBasicMaterial({ color: '#eef4f8' })); sk.rotation.x = Math.PI / 2; sk.position.set(-6 + (i % 2) * 12, 9.95, 24 - Math.floor(i / 2) * 20); s.add(sk); }
  for (const x of [-1.8, 1.8]) s.add(LP.at(LP.box(0.12, 0.012, 70, '#d8b830'), x, 0.006, -4));
  s.planes = [-3.2, 3.2].map((x, li) => Array.from({ length: 5 }, (_, i) => { const p = P.aircraft('p47', { col: li ? '#8a8e88' : '#59603f' }); p.position.set(x, 0.85, -2.5 - i * 7.5); s.add(p);
    for (const dz of [-1.0, 1.4]) s.add(LP.at(LP.box(0.5, 0.42, 0.3, '#c9a227'), x, 0.21, p.position.z + dz)); return p; }));
  s.add(LP.at(LP.box(1.4, 0.75, 0.7, '#5a5e62'), 2.0, 0.375, 4.2)); s.add(LP.at(LP.box(1.2, 0.04, 0.6, '#9a9e9e'), 2.0, 0.77, 4.2));   // a workbench
  return s;
}
// Night over the front (1943): a dark plain far below with a few fires, searchlights, the moon and stars. Flying height ALT = 26.
export function nightFront() {
  const s = WS.wStage('nightCity', ['#1a1e1a', '#161a16'], { groundSize: 400 });
  if (s.fog) { s.fog.color.set('#0e1424'); s.fog.near = 30; s.fog.far = 170; }
  P.stars(s, 900, 320, 9);
  const moon = new THREE.Mesh(new THREE.CircleGeometry(5, 32), new THREE.MeshBasicMaterial({ color: '#f4f0dc', fog: false, toneMapped: false })); moon.position.set(-70, 70, -160); moon.lookAt(0, 26, 0); s.add(moon);
  const mg = P.glow('#c8d4ff', 40, 0.35); mg.position.copy(moon.position); mg.material.fog = false; s.add(mg);
  s.fires = [[-30, -40], [10, -60], [40, -30], [-60, -80], [25, -95], [-8, -25]].map(([x, z], i) => { W1.fireAt(s, new THREE.Vector3(x, 0.5, z), { n: 8, size: 3, rise: 3, spread: 3, ph: i }); const g = P.glow('#ff7a2a', 18, 0.5); g.position.set(x, 2, z); s.add(g); return g; });
  s.lights = [[-20, -50, 0.4], [30, -70, 2.1], [0, -110, 3.3]].map(([x, z, ph]) => { const l = P.searchlight({ len: 140, r1: 5 }); l.position.set(x, 0, z); s.add(l); l.ph = ph; return l; });
  ticker(s).push(t => s.lights.forEach(l => l.aim(0.6 * Math.sin(t * 0.21 + l.ph), 0.9 + 0.2 * Math.sin(t * 0.27 + l.ph))));
  s.ALT = 26;
  return s;
}
// Bletchley Park, Hut 11A (1943): cream-painted wooden walls, the bombe against the back wall, a table with an Enigma machine and
// message sheets, blackout curtains. s.bombe, s.table (top y), s.enigma.
export function bletchley() {
  const s = RS.room({ w: 7.4, d: 6.4, h: 2.7, wall: '#d4ccb2', lower: '#5e5444', lowerH: 0.7, floor: '#6a5a48', ceil: '#e4dcc8', hemi: 0.75, sunI: 0.4,
    lights: [[-1.2, 2.3, -0.6, 3.5, '#ffe6bc', 7], [1.6, 2.3, 0.6, 3.0, '#ffe6bc', 7]] });
  const bm = P.bombe(); bm.position.set(-1.2, 0, -2.85); s.add(bm); s.bombe = bm;
  const tb = RP.desk(1.6, 0.8, '#5a4030'); tb.position.set(1.4, 0, -0.9); s.add(tb); s.table = tb.top;
  const en = P.enigma(); en.position.set(1.2, tb.top, -0.98); en.rotation.y = Math.PI; s.add(en); s.enigma = en;   // its keyboard toward the far side of the table
  for (let i = 0; i < 5; i++) { const sh = LP.at(LP.box(0.1, 0.002, 0.14, '#f2ecd8'), 1.6 + (i % 3) * 0.12, tb.top + 0.002 + i * 0.002, -0.95 + (i % 2) * 0.1); sh.rotation.y = (i * 0.37) % 0.6 - 0.3; s.add(sh); }
  for (const x of [-3.0, 2.2]) { s.add(LP.at(LP.box(1.1, 1.1, 0.04, '#1a1a20'), x, 1.6, -3.17)); for (const dx of [-0.62, 0.62]) s.add(LP.at(LP.box(0.24, 1.5, 0.06, '#2a3a5a'), x + dx, 1.5, -3.12)); }
  for (const [x, z] of [[-1.2, -1.8], [1.4, -0.9]]) { const l = new THREE.Group(); l.add(LP.at(LP.cyl(0.006, 0.006, 0.7, '#2a2a2a', 4), 0, 2.35, 0)); l.add(LP.at(new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.14, 16, 1, true), new THREE.MeshStandardMaterial({ color: '#2f5a3a', side: THREE.DoubleSide, emissive: '#2f5a3a', emissiveIntensity: 0.3 })), 0, 1.98, 0));
    const g = P.glow('#fff0c8', 0.6, 0.6); g.position.y = 1.92; l.add(g); l.position.set(x, 0, z); s.add(l); }
  const cork = LP.at(LP.box(1.4, 0.8, 0.03, '#a8865a'), 2.0, 1.45, -3.17); s.add(cork);
  for (let i = 0; i < 9; i++) s.add(LP.at(LP.box(0.16, 0.2, 0.005, ['#f2ecd8', '#e8e0c8', '#f6f0e0'][i % 3]), 1.5 + (i % 4) * 0.3, 1.25 + Math.floor(i / 4) * 0.25, -3.15));
  return s;
}
// The science the war sped up, as a museum: four plinths in a row along x under spotlights (radar, penicillin, rockets, computers).
// s.items[i], s.spots[i] (intensity set by the scene), s.X[i] the plinth x positions, s.TOP plinth top height.
export function exhibit() {
  const s = new THREE.Scene(); s.background = new THREE.Color('#0c1220'); s.fog = new THREE.Fog('#0c1220', 9, 30);
  s.add(new THREE.HemisphereLight('#8a9aba', '#141820', 0.9));
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.MeshStandardMaterial({ color: '#1a2030', roughness: 0.5 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; s.add(fl);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(60, 12), new THREE.MeshStandardMaterial({ color: '#141c2c', roughness: 0.9 })); back.position.set(0, 6, -4); s.add(back);
  s.X = [-3.6, -1.2, 1.2, 3.6]; s.TOP = 0.62;
  s.X.forEach(x => { const p = LP.at(LP.box(0.9, s.TOP, 0.9, '#d8d4cc'), x, s.TOP / 2, 0); p.castShadow = p.receiveShadow = true; s.add(p); });
  const rad = P.radarDish(0.42); rad.scale.setScalar(1.25); rad.position.set(s.X[0], s.TOP, 0); s.add(rad);
  const pen = P.penicillin(); pen.scale.setScalar(1.3); pen.position.set(s.X[1], s.TOP, 0); s.add(pen);
  const v = P.v2(1.5); v.position.set(s.X[2], s.TOP, 0); s.add(v);
  const co = P.colossus(); co.scale.setScalar(0.62); co.position.set(s.X[3], s.TOP, 0); s.add(co);
  s.items = [rad, pen, v, co];
  s.spots = s.X.map(x => { const l = new THREE.SpotLight('#fff2dc', 0, 10, 0.4, 0.45, 1.0); l.position.set(x, 5.2, 2.2); l.target.position.set(x, s.TOP + 0.4, 0); l.castShadow = true; l.shadow.mapSize.set(512, 512); s.add(l, l.target); return l; });
  ticker(s).push(t => { rad.head.rotation.y = 0.6 * Math.sin(t * 0.8); co.spin(t); });
  s.userData = { interior: true };
  return s;
}
