// Environments for "¿Qué pasaría si...?". Each builder returns a THREE.Scene finished with the amer look
// (painted sky, ground detail, grading presets in scene.userData.look).
import * as THREE from 'three';
import * as LP from '../lib/props.js';
import { stage, aimSun, mood } from '../lib/stage.js';
import * as LK from '../amer/look.js';
import * as WS from '../ww1/sets.js';
export { aimSun, mood };
export const { bakeAll } = WS;
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o });

// Neutral photo studio for QA and line-ups.
export function studio(light = 'day') {
  const s = stage({ skyTop: '#6d8fc8', skyHor: '#efe3c8', groundA: '#a8a49a', groundB: '#9c988e', sunPos: [4, 9, 8], shadow: 10, hemiGround: '#8a8070' });
  s.userData.look = { warm: 0.04, bloom: 0.25 };
  return s;
}
import * as P from './props.js';
import * as NP from '../narco/props.js';
import * as NS from '../narco/sets.js';
import * as MS from '../mx/sets.js';
import * as MX from '../mx/props.js';
import { flagPole, flagTex } from './flags.js';

export const LIGHT = {
  ...NS.LIGHT,
  dawn: { skyTop: '#3d5a8a', skyHor: '#f3b98c', sunColor: '#ffc8a0', sun: 2.2, hemi: 1.05, hemiSky: '#ffd6bd', hemiGround: '#5a5042', fog: ['#e2b89c', 40, 200] },
  morning: { skyTop: '#5a8ed6', skyHor: '#f2e6cf', sunColor: '#fff0d4', sun: 2.8, hemi: 1.2, hemiSky: '#eaf2ff', hemiGround: '#9a8a6a', fog: ['#ece4d2', 50, 230] },
};
const LK_OF = { golden: 'golden', day: 'day', morning: 'day', dawn: 'sunrise', dusk: 'dusk', night: 'night', overcast: 'overcast', nightCity: 'night' };
export function wStage(light = 'day', ground = ['#b9b3a6', '#aea89a'], extra = {}) {
  const L = LIGHT[light] || LIGHT.day, low = ['golden', 'dusk', 'dawn'].includes(light);
  return stage({ ...L, groundA: ground[0], groundB: ground[1], shadow: 18, sunPos: low ? [-14, 8, 9] : [8, 15, 9], seed: 7, ...extra });
}
const finishOut = (s, light, o = {}) => LK.outdoor(s, LK_OF[light] || light, o);
// Per-frame animated bits registered by the builders: s.tick(t).
const ticker = s => { s.ticks = s.ticks || []; if (!s.tick) s.tick = t => s.ticks.forEach(f => f(t)); return s.ticks; };
const lamp = (h = 4) => { const g = new THREE.Group(), m = std('#2a2a2e', { metalness: 0.5, roughness: 0.5 }); g.add(LP.at(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, h, 10), m), 0, h / 2, 0));
  g.add(LP.at(new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), new THREE.MeshStandardMaterial({ color: '#fff6dc', emissive: '#ffe2a8', emissiveIntensity: 0.4 })), 0, h + 0.1, 0)); return g; };

// ------------------------------------------------------------ Mexico City: the Zócalo and the Palacio Nacional
// The palace façade faces +z at z = -24; the giant flag stands mid-plaza at z = 6; the cathedral closes the left side.
export function zocalo(light = 'golden') {
  const s = wStage(light, ['#b8b0a2', '#aca496'], { groundSize: 320 });
  const pal = P.palacioNacional(); pal.position.set(0, 0, -24); s.add(pal); s.palacio = pal;
  const rf = flagPole('mx', { h: 5, w: 3.2 }); rf.position.copy(pal.roofFlag.position); pal.add(rf); s.roofFlag = rf;
  const cat = P.catedral(); cat.position.set(-36, 0, -4); cat.rotation.y = Math.PI / 2; s.add(cat);
  // the other three sides of the plaza: colonial blocks with portales (east, south, west beyond the cathedral)
  const blocks = [[34, -12, -Math.PI / 2, 24, '#a85a48'], [34, 14, -Math.PI / 2, 24, '#b9876a'], [34, 40, -Math.PI / 2, 22, '#9a503e'],
    [-26, 54, Math.PI, 26, '#c9b590'], [2, 54, Math.PI, 26, '#b07a5a'], [30, 54, Math.PI, 24, '#a8643f'], [-34, 24, Math.PI / 2, 22, '#b9876a'], [-34, 46, Math.PI / 2, 18, '#a85a48']];
  blocks.forEach(([x, z, ry, w, col], i) => { const b = P.colonialBlock(w, 12 + (i % 3) * 1.5, { col, seed: i, portal: i !== 4 }); b.position.set(x, 0, z); b.rotation.y = ry; s.add(b); });
  const f = flagPole('mx', { h: 18, w: 10.5 }); f.position.set(0, 0, 6); s.add(f); s.flag = f;
  s.add(LP.at(new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.6, 24), std('#9a948a')), 0, 0.3, 6));
  for (const x of [-18, -10, 10, 18]) { const l = lamp(4.2); l.position.set(x, 0, -17); s.add(l); }
  finishOut(s, light, { kind: 'flag', noGrass: true, look: { bloom: 0.32 } });
  ticker(s).push(t => { f.wave(t, 0.8); rf.wave(t + 1.3, 0.7); });
  return s;
}

// Interiors are open at +z for the usual camera; reverse shots need that fourth wall (with a wainscot to match).
function closeRoom(s, w, d, h, paper, panel) {
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), std(paper)); wall.position.set(0, h / 2, d / 2 - 0.02); wall.rotation.y = Math.PI; s.add(wall);
  s.add(LP.at(LP.box(w, 1.1, 0.05, panel), 0, 0.55, d / 2 - 0.05)); s.add(LP.at(LP.box(w, 0.08, 0.08, panel), 0, 1.12, d / 2 - 0.06));
}
// ------------------------------------------------------------ council room at dawn (6:00 a.m.)
export function council(light = 'dawn') {
  const s = MS.interior({ wall: '#d8c8a8', floor: '#5a3a26', w: 12, d: 10, h: 4.4, lights: [[0, 3.8, 0]], windows: true, bulbs: false });
  LK.room(s, { floorKind: 'planks', floorCol: '#8a5a3a', paper: 'stripes', paperCol: '#e6d8bc', paperAccent: '#c9a227', panelCol: '#5a3a22', chandeliers: 1, paintings: 2, shafts: true, windowCol: '#ffd2a0' });
  s.userData.sun.color.set('#ffcf9a'); s.userData.sun.intensity = 2.0; s.userData.hemi.intensity = 1.25;
  const fillC = new THREE.PointLight('#ffe2c0', 5, 12, 1.3); fillC.position.set(0, 3.4, 2.5); s.add(fillC);
  closeRoom(s, 12, 10, 4.4, '#e6d8bc', '#5a3a22');
  // furniture at the cast's scale: the leaders stand ~1.42 tall, the chibi ministers sit on taller chairs
  const tb = P.conferenceTable(5.6, 1.5); tb.position.set(0, 0, -0.6); tb.scale.y = 0.6 / tb.top; tb.top = 0.6; s.add(tb); s.table = tb;
  s.chairs = [];
  for (let i = 0; i < 4; i++) for (const sz of [-1, 1]) { const c = P.officeChair(); c.scale.setScalar(0.8); c.seatY *= 0.8; c.position.set(-1.8 + i * 1.2, 0, -0.6 + sz * 0.98); c.rotation.y = sz > 0 ? Math.PI : 0; s.add(c); s.chairs.push(c); }
  const head = P.officeChair('#5a1a1a'); head.scale.setScalar(0.72); head.seatY *= 0.72; head.position.set(3.08, 0, -0.6); head.rotation.y = -Math.PI / 2; s.add(head); s.headChair = head;
  const clk = P.wallClock(0.36); clk.position.set(-3.2, 3.1, -4.93); s.add(clk); s.clock = clk;
  const f = flagPole('mx', { h: 2.8, w: 1.3, gold: true }); f.position.set(4.6, 0, -4.2); s.add(f); s.flag = f;
  for (let i = 0; i < 8; i++) { const d = P.documentSheet(i); d.position.set(-2 + i * 0.55, tb.top + 0.002, -0.6 + (i % 2 ? 0.45 : -0.45)); d.rotation.y = (i % 3 - 1) * 0.1; s.add(d); }
  s.userData.look = { warm: 0.06, bloom: 0.34, rimColor: '#ffd0a0', rim: 0.36 };
  ticker(s).push(t => f.wave(t, 0.25));
  return s;
}
// ------------------------------------------------------------ Rudolf's office: desk, stamp, flag, window
export function despacho(light = 'day') {
  const s = MS.interior({ wall: '#e2d4b8', floor: '#4a2e1e', w: 9, d: 8, h: 4.0, lights: [[0, 3.5, 0.5]], windows: true, bulbs: false });
  LK.room(s, { floorKind: 'planks', floorCol: '#8a5a3a', paper: 'damask', paperCol: '#e8dcc0', paperAccent: '#b89a5a', panelCol: '#4a2c1a', chandeliers: 0, paintings: 1, shafts: true, windowCol: '#fff0d0' });
  s.userData.sun.intensity = 2.0; s.userData.hemi.intensity = 1.2;
  const d = P.deskExec({ plate: 'PRESIDENTA' }); d.position.set(0, 0, -1.2); d.scale.setScalar(0.8); d.top *= 0.8; s.add(d); s.desk = d;   // sized for a 1.42 m leader
  const ch = P.officeChair('#3a1a12'); ch.scale.setScalar(0.72); ch.seatY *= 0.72; ch.position.set(0, 0, -1.45); s.add(ch); s.chair = ch;
  // she sits at z = -1.45 facing +z (shoulders ~ -1.65, arms ~0.35 long): the in-tray on her left (+x), the out-pile and
  // the ink pad on her right, the sheet to seal in front of her; papers face her
  const ph = P.deskPhone(); ph.position.set(0.58, d.top, -1.05); ph.rotation.y = Math.PI - 0.3; s.add(ph); s.phone = ph;
  const pad = P.inkPad(); pad.position.set(-0.3, d.top, -1.48); s.add(pad); s.pad = pad;
  s.docs = []; for (let i = 0; i < 6; i++) { const doc = P.documentSheet(i + 20); doc.position.set(0.28, d.top + 0.002 + i * 0.002, -1.33); doc.rotation.y = Math.PI + 0.04 * (i - 3); s.add(doc); s.docs.push(doc); }
  s.inTop = [0.28, d.top + 0.014, -1.33]; s.outPile = [-0.2, d.top + 0.002, -1.28];
  const done = P.documentSheet(40); done.position.set(0.04, d.top + 0.003, -1.32); done.rotation.y = Math.PI; s.add(done); s.sheet = done;
  const f = flagPole('mx', { h: 2.7, w: 1.25 }); f.position.set(-2.7, 0, -3.3); s.add(f); s.flag = f;
  s.userData.look = { warm: 0.05, bloom: 0.3 };
  ticker(s).push(t => f.wave(t, 0.2));
  return s;
}
// ------------------------------------------------------------ the morning press conference podium
export function mananera() {
  const s = NS.mananera({ podiumText: 'GOBIERNO DE MÉXICO' });
  s.podium.scale.set(1.0, 0.82, 0.9); s.floorY = 0.25;   // a podium for a full-size speaker; she stands on the 0.25 riser
  LK.room(s, { floorKind: 'planks', paper: 'plaster', paperCol: '#b39a76', paperAccent: '#c9a227', panelCol: '#4a2c1a', chandeliers: 0, paintings: 0, shafts: false, pilasters: false });
  const mic = P.micStand(0.3); mic.position.set(0, 0.25 + 1.05 * 0.82, -2.15); s.add(mic);
  s.screen.material = new THREE.MeshBasicMaterial({ map: canvasTexLocal(1024, 512, (x, W, H) => { const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0f3d2a'); g.addColorStop(1, '#5a1a24'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = '#f4efe2'; x.font = '900 64px Inter'; x.textAlign = 'center'; x.fillText('UN MUNDO DONDE TODAS', W / 2, H / 2 - 20); x.fillText('PUEDAN VIVIR FELICES', W / 2, H / 2 + 60); }) });
  s.flags.forEach(f => { f.position.x = Math.sign(f.position.x) * 3.6; });
  s.userData.look = { warm: 0.04, bloom: 0.3 };
  return s;
}
function canvasTexLocal(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
// ------------------------------------------------------------ Chamber of Deputies: curved rows of desks facing the rostrum
export function camara() {
  const s = MS.interior({ wall: '#7a5a3a', floor: '#3a2418', w: 20, d: 16, h: 7, lights: [[-4, 6, 2], [4, 6, 2], [0, 6, -3]], windows: false, bulbs: false });
  LK.room(s, { floorKind: 'tiles', floorCol: '#6a1a22', paper: 'plaster', paperCol: '#8a6a4a', panelCol: '#4a2c1a', chandeliers: 0, paintings: 0, shafts: false, pilasters: true });
  s.userData.sun.intensity = 1.8; s.userData.hemi.intensity = 1.5;
  for (const [x, z] of [[-5, 1], [5, 1], [0, -4]]) { const l = new THREE.PointLight('#ffe8c8', 6, 14, 1.2); l.position.set(x, 5.5, z); s.add(l); }
  const arms = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.8), new THREE.MeshStandardMaterial({ map: flagTex('mx', 300, 200), roughness: 0.9 })); arms.position.set(0, 4.4, -7.94); s.add(arms);
  s.seats = [];
  for (let row = 0; row < 4; row++) { const R = 4.2 + row * 1.25, n = 9 + row * 2;
    for (let i = 0; i < n; i++) { const a = -0.9 + 1.8 * (i + 0.5) / n, x = Math.sin(a) * R, z = Math.cos(a) * R - 3.5;
      // chibi deputies: desk tops 0.42 above their tier, chibi-sized chairs (seat top 0.24)
      const ty = row * 0.18, d = new THREE.Group(); d.add(LP.at(LP.box(0.9, 0.05, 0.42, '#9a6a40'), 0, ty + 0.4, 0)); d.add(LP.at(LP.box(0.9, ty + 0.4, 0.05, '#7a4a28'), 0, (ty + 0.4) / 2, 0.19));
      d.position.set(x, 0, z); d.rotation.y = a + Math.PI; s.add(d);
      const st = { x: Math.sin(a) * (R + 0.5), z: Math.cos(a) * (R + 0.5) - 3.5, yaw: a + Math.PI, y: ty, seat: ty + 0.24, row, a };
      const c = MX.chair(false); c.position.set(st.x, ty, st.z); c.rotation.y = st.yaw; s.add(c); st.chair = c; s.seats.push(st); }
    const tier = new THREE.Mesh(new THREE.RingGeometry(R + 0.2, R + 1.4, 48, 1, Math.PI / 2 - 0.95, 1.9), std('#5a2a22')); tier.rotation.x = -Math.PI / 2; tier.position.set(0, row * 0.18 + 0.005, -3.5); s.add(tier); }
  // the rostrum: a dais with the lectern; the speaker stands at s.speaker on top of it
  const rostrum = new THREE.Group(); rostrum.add(LP.at(LP.box(6, 0.5, 2.6, '#4a2a18'), 0, 0.25, 0)); rostrum.add(LP.at(LP.box(1.0, 0.95, 0.5, '#3a2014'), 0, 0.975, 0.75));
  rostrum.add(LP.at(LP.box(1.06, 0.05, 0.6, '#5a3420'), 0, 1.47, 0.75)); rostrum.add(LP.at(LP.box(6.4, 2.4, 0.3, '#3a2014'), 0, 1.2, -1.25)); rostrum.position.set(0, 0, -6.4); s.add(rostrum);
  s.speaker = [0, 0.5, -6.25]; s.lecternTop = [0, 1.495, -5.65];
  const door = new THREE.Group(); door.add(LP.at(LP.box(0.12, 2.5, 1.5, '#2a1a10'), 0, 1.25, 0)); door.add(LP.at(LP.box(0.16, 2.7, 0.12, '#c9a227'), 0, 1.35, 0.8)); door.add(LP.at(LP.box(0.16, 2.7, 0.12, '#c9a227'), 0, 1.35, -0.8));
  door.position.set(9.94, 0, -3.2); s.add(door); s.door = [9.4, -3.2];
  const f = flagPole('mx', { h: 4.2, w: 2.2 }); f.position.set(-4.6, 0, -7.2); s.add(f); s.flag = f;
  const clk = P.wallClock(0.55); clk.position.set(3.6, 4.4, -7.93); s.add(clk); s.clock = clk;
  for (const x of [-5, 5]) { const l = new THREE.PointLight('#ffe2c0', 5, 13, 1.3); l.position.set(x, 5, 6); s.add(l); }
  const back = new THREE.Mesh(new THREE.PlaneGeometry(20, 7), std('#8a6a4a')); back.position.set(0, 3.5, 7.98); back.rotation.y = Math.PI; s.add(back);   // the room is open at +z: close it for reverse shots
  s.add(LP.at(LP.box(20, 1.2, 0.06, '#4a2c1a'), 0, 0.6, 7.95));
  s.userData.look = { warm: 0.05, bloom: 0.28 };
  ticker(s).push(t => f.wave(t, 0.2));
  return s;
}

// ------------------------------------------------------------ Washington
// Joint Base Andrews-like airfield: runway along z, the jet lands from -z towards +z.
export function airfield(light = 'day') {
  const s = wStage(light, ['#7a8a5e', '#6e7e54'], { groundSize: 400 });
  s.add(LP.at(LP.box(14, 0.02, 400, '#4e5054'), 0, 0.011, 0)); for (let i = 0; i < 40; i++) s.add(LP.at(LP.box(0.35, 0.022, 4, '#ece6cc'), 0, 0.013, -190 + i * 10));
  for (const sx of [-1, 1]) s.add(LP.at(LP.box(0.25, 0.022, 400, '#ece6cc'), sx * 6.6, 0.013, 0));
  s.add(LP.at(LP.box(30, 0.02, 30, '#55575c'), -22, 0.012, 10));
  const tower = new THREE.Group(); tower.add(LP.at(LP.box(3, 14, 3, '#d8d4c8'), 0, 7, 0)); tower.add(LP.at(LP.box(4.6, 2.2, 4.6, '#3a4a5a'), 0, 15.1, 0)); tower.add(LP.at(LP.box(5, 0.4, 5, '#d8d4c8'), 0, 16.4, 0)); tower.position.set(-34, 0, -20); s.add(tower);
  const hang = new THREE.Group(); hang.add(LP.at(LP.box(26, 9, 18, '#c8ccd0'), 0, 4.5, 0)); const roof = new THREE.Mesh(new THREE.CylinderGeometry(9.2, 9.2, 26, 18, 1, false, -Math.PI / 2, Math.PI), std('#9aa0a6')); roof.rotation.z = Math.PI / 2; roof.position.y = 9; roof.scale.set(1, 0.4, 1); hang.add(roof); hang.position.set(-30, 0, 30); s.add(hang);
  const jet = P.privateJet(); s.add(jet); s.jet = jet;
  const f = flagPole('us', { h: 8, w: 4 }); f.position.set(-14, 0, 2); s.add(f); s.flag = f;
  finishOut(s, light, { kind: 'grass', grass: { area: [-40, -60, -8, 60], n: 5000, clear: [[-22, 10, 18]] } });
  ticker(s).push(t => f.wave(t, 0.8));
  return s;
}
// North Lawn of the White House; the fence and gate run along z = 3 (x across), the house at z = -16.
export function whiteHouse(light = 'day') {
  const s = wStage(light, ['#7fa858', '#73994e'], { groundSize: 300 });
  const wh = NP.whiteHouse(); wh.position.set(0, 0, -16); s.add(wh); s.house = wh;
  s.add(LP.at(LP.box(60, 0.02, 5, '#d8d2c4'), 0, 0.012, -6)); s.add(LP.at(LP.box(5, 0.02, 12, '#d8d2c4'), 0, 0.013, -2));
  const gate = P.gateFence(40); gate.position.set(0, 0, 4); s.add(gate); s.gate = gate;
  s.add(LP.at(LP.box(80, 0.02, 10, '#8a8a86'), 0, 0.011, 10));
  const f = flagPole('us', { h: 10, w: 4.5 }); f.position.set(0, 7.5, -16); s.add(f); s.flag = f;
  const ff = new THREE.Group(); for (const [x, z] of [[-10, -4], [10, -4]]) { const fo = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.5, 24), std('#e8e2d4')); fo.position.set(x, 0.25, z); s.add(fo); }
  LP.scatter(s, (r, i) => LP.roundTree(1.7 + r() * 0.6, '#3f7a32', i), 40, [-50, -40, 50, -9], 102, [[0, -16, 16]]);
  finishOut(s, light, { kind: 'grass', grass: { area: [-26, -14, 26, 3], n: 6000, clear: [[0, -4, 3.5], [0, -16, 12]] } });
  ticker(s).push(t => f.wave(t, 0.8));
  return s;
}
// The Oval Office with a pool table in the middle. Desk at the far end (z = -3.2), table at the centre.
export function ovalOffice() {
  const s = new THREE.Scene();
  const hemi = new THREE.HemisphereLight('#fff4e0', '#5a4a3a', 1.0); s.add(hemi);
  const sun = new THREE.DirectionalLight('#fff0d0', 1.6); sun.position.set(-3, 7, -6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 0.5, far: 30 }); s.add(sun, sun.target);
  const A = 5.2, B = 4.0, H = 4.6;   // ellipse half-axes (x, z) and height
  const wallM = new THREE.MeshStandardMaterial({ color: '#efe6cf', roughness: 0.85, side: THREE.BackSide });
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, H, 64, 1, true), wallM); wall.scale.set(A, 1, B); wall.position.y = H / 2; s.add(wall);
  const fl = new THREE.Mesh(new THREE.CircleGeometry(1, 64), new THREE.MeshStandardMaterial({ color: '#b8a888', roughness: 0.6 })); fl.rotation.x = -Math.PI / 2; fl.scale.set(A, B, 1); s.add(fl);
  const rugT = canvasTexLocal(1024, 800, (x, W, Hh) => { x.fillStyle = '#1f2f5a'; x.beginPath(); x.ellipse(W / 2, Hh / 2, W / 2, Hh / 2, 0, 0, 7); x.fill(); x.strokeStyle = '#c9a227'; x.lineWidth = 10; x.beginPath(); x.ellipse(W / 2, Hh / 2, W / 2 - 30, Hh / 2 - 30, 0, 0, 7); x.stroke();
    x.fillStyle = '#c9a227'; x.beginPath(); x.arc(W / 2, Hh / 2, 150, 0, 7); x.fill(); x.fillStyle = '#1f2f5a'; x.beginPath(); x.arc(W / 2, Hh / 2, 128, 0, 7); x.fill();
    x.fillStyle = '#c9a227'; for (let i = 0; i < 13; i++) { const a = i / 13 * Math.PI * 2; x.beginPath(); x.arc(W / 2 + Math.cos(a) * 112, Hh / 2 + Math.sin(a) * 112, 6, 0, 7); x.fill(); }
    x.beginPath(); x.ellipse(W / 2, Hh / 2 + 6, 50, 64, 0, 0, 7); x.fill(); });
  const rug = new THREE.Mesh(new THREE.CircleGeometry(1, 64), new THREE.MeshStandardMaterial({ map: rugT, roughness: 0.95, transparent: true })); rug.rotation.x = -Math.PI / 2; rug.scale.set(A * 0.78, B * 0.78, 1); rug.position.y = 0.005; s.add(rug);
  const ceil = new THREE.Mesh(new THREE.CircleGeometry(1, 64), new THREE.MeshStandardMaterial({ color: '#f4efe2', side: THREE.DoubleSide })); ceil.rotation.x = Math.PI / 2; ceil.scale.set(A, B, 1); ceil.position.y = H; s.add(ceil);
  const seal = new THREE.Mesh(new THREE.CircleGeometry(0.9, 32), std('#f8f4ea')); seal.rotation.x = Math.PI / 2; seal.position.y = H - 0.01; s.add(seal);
  // three tall windows behind the desk with gold drapes, flags either side
  for (const a of [-0.32, 0, 0.32]) { const ang = Math.PI + a, x = Math.sin(ang) * A * 0.985, z = Math.cos(ang) * B * 0.985;
    const w = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.8), new THREE.MeshBasicMaterial({ color: '#fff4dc' })); w.position.set(x, 2.1, z); w.lookAt(0, 2.1, 0); s.add(w);
    for (const k of [-1, 1]) { const dr = LK.curtain(0.55, 3.6, '#c9a24a'); dr.position.set(x + Math.cos(ang) * k * 0.75 * -1, 2.3, z + Math.sin(ang) * k * 0.75); dr.lookAt(0, 2.3, 0); s.add(dr); } }
  // furniture at the cast's scale (the leaders stand ~1.42 tall)
  const desk = P.resoluteDesk(); desk.position.set(0, 0, -B + 1.3); desk.scale.setScalar(0.82); desk.top *= 0.82; s.add(desk); s.desk = desk;
  const chair = P.officeChair('#2a1a12'); chair.scale.setScalar(0.72); chair.seatY *= 0.72; chair.position.set(0, 0, -B + 0.62); s.add(chair);
  for (const [code, x] of [['us', -1.6], ['un', 1.6]]) { const f = flagPole(code === 'un' ? 'us' : code, { h: 2.8, w: 1.2 }); f.position.set(x, 0, -B + 0.6); s.add(f); (s.flags = s.flags || []).push(f); }
  for (const sx of [-1, 1]) { const so = P.sofa('#ece2c8', 1.8); so.position.set(sx * 3.3, 0, -0.4); so.rotation.y = -sx * Math.PI / 2; s.add(so); }
  const pt = P.poolTable(); pt.position.set(0, 0, 0.6); pt.scale.setScalar(0.85); s.add(pt); s.pool = pt;
  for (const ang of [Math.PI * 0.62, Math.PI * 0.72, Math.PI * 1.28, Math.PI * 1.38]) { const x = Math.sin(ang) * A * 0.97, z = Math.cos(ang) * B * 0.97; const p = LK.painting(0.8, 1.0, { seed: Math.round(ang * 10), kind: 'portrait' }); p.position.set(x, 2.4, z); p.lookAt(0, 2.4, 0); s.add(p); }
  const light = new THREE.PointLight('#fff2d8', 6, 12, 1.4); light.position.set(0, 3.8, 1); s.add(light);
  s.userData = { sun, hemi, interior: true, look: { warm: 0.05, bloom: 0.3 } };
  s.background = new THREE.Color('#2a2420');
  ticker(s).push(t => s.flags.forEach((f, i) => f.wave(t + i, 0.2)));
  return s;
}

// ------------------------------------------------------------ the world tour: one small diorama per country
// The leader stands near the origin facing +z; landmarks fill the background (z < 0).
const sc = (o, x, y, z, ry = 0, s = 1) => { o.position.set(x, y, z); o.rotation.y = ry; o.scale.multiplyScalar(s); return o; };
export function country(code) {
  const C = {
    ca: { light: 'day', ground: ['#eef2f4', '#e4e8ec'], kind: 'snow' }, jp: { light: 'day', ground: ['#8aa860', '#7e9c56'], kind: 'grass' },
    de: { light: 'day', ground: ['#a8a29a', '#9e988e'], kind: 'cobble' }, fr: { light: 'golden', ground: ['#c8bca4', '#beb29a'], kind: 'cobble' },
    it: { light: 'golden', ground: ['#c8b48a', '#bca87e'], kind: 'dirt' }, sm: { light: 'day', ground: ['#8aa860', '#7e9c56'], kind: 'grass' },
    au: { light: 'golden', ground: ['#c8743e', '#bc6a36'], kind: 'dirt' }, kr: { light: 'nightCity', ground: ['#3a3e4a', '#343844'], kind: 'cobble' },
    co: { light: 'day', ground: ['#c8a880', '#bc9c74'], kind: 'cobble' }, br: { light: 'day', ground: ['#e8d8a8', '#dccc9c'], kind: 'sand' },
    ar: { light: 'day', ground: ['#8e8a84', '#86827c'], kind: 'flag' }, ch: { light: 'morning', ground: ['#7aa858', '#6e9c4e'], kind: 'grass' },
    mc: { light: 'day', ground: ['#8e8e8c', '#868684'], kind: 'flag' },
  }[code];
  const s = wStage(C.light, C.ground, { groundSize: 260 }), add = (o, ...a) => s.add(sc(o, ...a));
  const f = flagPole(code, { h: 4.2, w: 2.0 }); add(f, 2.6, 0, -2.2); s.flag = f;
  const R = LP.rng(code.charCodeAt(0) * 7 + code.charCodeAt(1));
  if (code === 'ca') { add(P.logCabin(), -5, 0, -9, 0.3); for (let i = 0; i < 14; i++) add(P.mapleTree(0.9 + R() * 0.6, i), -16 + R() * 32, 0, -6 - R() * 18);
    s.boxes = [P.giftBox('MÉXICO'), P.giftBox('EE. UU.', '#b8a070')].map((b, i) => { add(b, -1.3 + i * 0.75, 0, 0.6, 0.2 - i * 0.3); return b; });
    for (let i = 0; i < 3; i++) add(P.syrupBottle(), -1.25 + i * 0.12, 0.43, 0.6); add(P.blanket(), 0.15, 0.43, 0.55, 0.1); }
  if (code === 'jp') { add(P.torii(4.6), 0, 0, -7); add(P.fuji(30), 10, 0, -120); for (let i = 0; i < 10; i++) add(P.sakura(1 + R() * 0.5, i), (i % 2 ? 1 : -1) * (4 + R() * 9), 0, -3 - R() * 16);
    for (const x of [-2.2, 2.2]) add(P.stoneLantern(), x, 0, -4.5); s.add(LP.at(LP.box(3, 0.02, 30, '#c8bca0'), 0, 0.012, -15)); }
  if (code === 'de') { add(P.clockTower(), 0, 0, -16); for (let i = 0; i < 4; i++) add(P.halfTimber(5, i), (i < 2 ? -1 : 1) * (9 + (i % 2) * 5.4), 0, -12 + (i % 2) * 0.6, 0); s.clock = s.children.find(o => o.clock)?.clock; }
  if (code === 'fr') { add(P.eiffel(22), -12.6, 0, -104); add(P.patisserie(), -3.2, 0, -4.2, 0.25); add(P.patisserie({ name: 'Boulangerie', awning: '#2a5ab8', wall: '#efe2cc', trim: '#5a2a3a', seed: 2 }), -10.6, 0, -3.2, 1.0);
    for (let i = 0; i < 4; i++) add(LP.roundTree(1.3, '#5f8a3a', i), 5.5 + i * 2.6, 0, -16 - i * 2.5); }   // the shop fronts face the camera, the tower stands clear on the right
  if (code === 'it') { add(P.colosseum(), 0, 0, -22); for (let i = 0; i < 10; i++) add(P.cypress(1 + R() * 0.4, i), (i % 2 ? 1 : -1) * (7 + R() * 10), 0, -8 - R() * 20); }
  if (code === 'sm') { add(P.sanMarino(), 0, 0, -24); for (let i = 0; i < 8; i++) add(LP.roundTree(1.2 + R() * 0.5, '#4f7f32', i), -14 + R() * 28, 0, -8 - R() * 8); }
  if (code === 'au') { add(P.uluru(), 6, 0, -70); for (let i = 0; i < 9; i++) add(P.eucalyptus(1 + R() * 0.4, i), (i % 2 ? 1 : -1) * (5 + R() * 14), 0, -6 - R() * 20);
    s.emus = [0, 1, 2, 3].map(i => { const e = P.emu(); add(e, 3 + i * 1.6, 0, -2 - i * 1.2, -1.2); return e; }); }
  if (code === 'kr') { add(P.seoulTower(), -8, 6, -60); for (let i = 0; i < 12; i++) add(P.neonBlock(5 + R() * 3, 12 + R() * 20, i), (i % 2 ? 1 : -1) * (7 + (i >> 1) * 4.5), 0, -10 - (i % 3) * 7);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(8, 4.5), new THREE.MeshBasicMaterial({ color: '#ffffff' })); scr.position.set(-1, 5.5, -9.5); s.add(scr); s.screen = scr;
    const key = new THREE.PointLight('#ffd6f0', 9, 12, 1.2); key.position.set(1.5, 3, 3); s.add(key); const rimL = new THREE.PointLight('#7ad8ff', 7, 12, 1.2); rimL.position.set(-2, 3, -3); s.add(rimL); }
  if (code === 'co') { ['#f2c14e', '#e86a5a', '#4ea8c8', '#8ac86a', '#f2884e', '#c86ab8'].forEach((c, i) => add(P.casaColonial(c, 5, i), -13 + i * 5.2, 0, -6.5)); for (let i = 0; i < 4; i++) add(LP.palm(1.1, i), -8 + i * 5.5, 0, -3.8); }
  if (code === 'br') { add(P.sugarloaf(), 18, 0, -70); add(P.christStatue(4), -22, 22, -90); s.add(LP.at(new THREE.Mesh(new THREE.ConeGeometry(14, 22, 12), std('#4f6a42', { flatShading: true })), -22, 11, -92));
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(400, 160), std('#3a8ab8', { roughness: 0.3 })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.03, -100); s.add(sea);
    const wt = canvasTexLocal(256, 64, (x, W, H) => { x.fillStyle = '#f4f0e6'; x.fillRect(0, 0, W, H); x.fillStyle = '#1d1d1f'; x.beginPath(); x.moveTo(0, H); for (let i = 0; i <= W; i += 4) x.lineTo(i, H / 2 + Math.sin(i / W * Math.PI * 4) * 14); x.lineTo(W, H); x.fill(); });
    wt.wrapS = THREE.RepeatWrapping; wt.repeat.set(12, 1); const walk = new THREE.Mesh(new THREE.PlaneGeometry(60, 2.2), new THREE.MeshStandardMaterial({ map: wt, roughness: 0.9 })); walk.rotation.x = -Math.PI / 2; walk.position.set(0, 0.012, -3.2); s.add(walk);
    for (let i = 0; i < 6; i++) add(LP.palm(1.2, i), -11 + i * 5.5, 0, -6); }   // no crown right behind the leader's head from the low camera
  if (code === 'ar') { add(P.obelisco(28), 0, 0, -26); for (let i = 0; i < 10; i++) add(P.jacaranda(1 + R() * 0.4, i), (i % 2 ? 1 : -1) * (7 + R() * 8), 0, -6 - R() * 18);
    s.add(LP.at(LP.box(26, 0.02, 80, '#4e5054'), 0, 0.011, -30)); for (let i = 0; i < 12; i++) add(NP.building(8, 14 + R() * 10, 8, ['#d8d0c0', '#c8c0b0', '#e2dccc'][i % 3], { seed: i }), (i % 2 ? 1 : -1) * 22, 0, -10 - (i >> 1) * 10, i % 2 ? -Math.PI / 2 : Math.PI / 2); }
  if (code === 'ch') { add(P.matterhorn(44), -8, 0, -90); add(P.matterhorn(30), 30, 0, -110, 1); add(P.chalet(), 7, 0, -12, -0.3); for (let i = 0; i < 12; i++) add(LP.pine(1.4 + R(), '#2f5a3a', i), (i % 2 ? 1 : -1) * (6 + R() * 18), 0, -8 - R() * 25); }
  if (code === 'mc') { add(P.casino(), -6, 0, -18, 0.2); const sea = new THREE.Mesh(new THREE.PlaneGeometry(300, 120), std('#2a7ab0', { roughness: 0.25 })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.05, -80); s.add(sea);
    for (let i = 0; i < 7; i++) add(P.yacht(7 + R() * 5, ['#f4f4f2', '#ffffff', '#1d2a3a'][i % 3]), -20 + i * 7, 0, -26 - R() * 8, Math.PI / 2 + (R() - 0.5) * 0.3); s.add(LP.at(LP.box(70, 0.4, 2, '#d8d0c0'), 0, 0.2, -21));
    // the Grand Prix street: asphalt under the runner, a red-and-white kerb and a striped barrier behind her
    s.add(LP.at(LP.box(70, 0.02, 2.2, '#3a3c40'), 0, 0.011, 0.5));
    for (let i = 0; i < 88; i++) s.add(LP.at(LP.box(0.8, 0.03, 0.3, i % 2 ? '#f4f4f2' : '#d42a2a'), -34.8 + i * 0.8, 0.016, -0.75));
    const ad = canvasTexLocal(1024, 64, (x, W, H) => { [['#d42a2a', '#ffffff', 'MONACO'], ['#f4f4f2', '#d42a2a', 'GRAND PRIX'], ['#1d4fb8', '#ffffff', 'TURBO ★'], ['#1d1d1f', '#f2c14e', 'MONTE-CARLO']].forEach(([bg, ink, txt], i) => {
      x.fillStyle = bg; x.fillRect(i * W / 4, 0, W / 4, H); x.fillStyle = ink; x.font = '900 34px Inter'; x.textAlign = 'center'; x.fillText(txt, i * W / 4 + W / 8, 45); }); });
    ad.wrapS = THREE.RepeatWrapping; ad.repeat.set(7, 1); const grey = std('#9a9ca0');
    s.add(LP.at(new THREE.Mesh(new THREE.BoxGeometry(70, 0.9, 0.22), [grey, grey, grey, grey, new THREE.MeshStandardMaterial({ map: ad, roughness: 0.6 }), grey]), 0, 0.45, -1.9));
    for (const x of [-14, -3, 8, 19]) add(LP.palm(1.3, x + 40), x, 0, -9);
    s.flag.position.set(2.6, 0, -12); }   // the flag stands back where the low camera sees it whole
  finishOut(s, C.light, { kind: C.kind, noGrass: C.kind !== 'grass', grass: { area: [-20, -20, 20, 6], n: 3500, clear: [[0, 0, 2.5]] }, look: code === 'kr' ? { bloom: 0.6, bloomT: 0.8 } : {} });
  ticker(s).push(t => f.wave(t, code === 'kr' ? 0.3 : 0.6));
  return s;
}

// ------------------------------------------------------------ Geneva: the summit under a dripping, colourful dome
export function summit() {
  const s = MS.interior({ wall: '#e8e4dc', floor: '#8a7a68', w: 22, d: 18, h: 9, lights: [[0, 7, 0]], windows: false, bulbs: false });
  LK.room(s, { floorKind: 'planks', floorCol: '#b89a78', paper: 'plaster', paperCol: '#ece8e0', paperAccent: '#c9c2b2', panelCol: '#8a8278', chandeliers: 0, paintings: 0, shafts: false, pilasters: false, warm: false });
  s.userData.sun.intensity = 1.4; s.userData.hemi.intensity = 1.5;
  // the flat ceiling gets an elliptical opening under the dome, and the dome an oculus with daylight at the top of its shaft
  const ceil = s.children.find(o => o.isMesh && o.geometry.type === 'PlaneGeometry' && Math.abs(o.position.y - 9) < 0.01 && Math.abs(o.rotation.x - Math.PI / 2) < 0.01);
  if (ceil) { const sh = new THREE.Shape(); sh.moveTo(-11, -9); sh.lineTo(11, -9); sh.lineTo(11, 9); sh.lineTo(-11, 9); sh.lineTo(-11, -9);
    const hole = new THREE.Path(); hole.absellipse(0, 0, 9.9, 8.4, 0, Math.PI * 2, true); sh.holes.push(hole); ceil.geometry.dispose(); ceil.geometry = new THREE.ShapeGeometry(sh, 48); }
  const domeM = new THREE.MeshStandardMaterial({ color: '#d8d0c4', side: THREE.BackSide, roughness: 0.9 }), OC = 0.24, ocR = 10 * Math.sin(OC);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(10, 40, 16, 0, Math.PI * 2, OC, Math.PI / 2 - OC), domeM); dome.scale.set(1, 0.32, 0.85); dome.position.y = 8.6; s.add(dome);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(ocR, ocR, 6, 40, 1, true), domeM); shaft.scale.z = 0.85; shaft.position.y = 8.6 + 3.2 * Math.cos(OC) + 2.95; s.add(shaft);
  const sky = new THREE.Mesh(new THREE.CircleGeometry(ocR, 40), new THREE.MeshBasicMaterial({ color: '#eaf3ff' })); sky.rotation.x = Math.PI / 2; sky.scale.y = 0.85; sky.position.y = shaft.position.y + 2.95; s.add(sky);
  closeRoom(s, 22, 18, 9, '#ece8e0', '#8a8278');   // the close-ups look toward +z
  const r = LP.rng(91), n = 900, im = new THREE.InstancedMesh(new THREE.ConeGeometry(0.18, 1, 6), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 }), n), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
  const pal = ['#e84a5f', '#2ab7ca', '#fed766', '#7bc950', '#9b5de5', '#f15bb5', '#00bbf9', '#fee440', '#f77f00'];
  for (let i = 0; i < n; i++) { let a, rr; do { a = r() * Math.PI * 2; rr = Math.sqrt(r()) * 9.5; } while (rr < ocR + 0.6);   // the oculus stays clear for the parachute
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr * 0.85, y = 8.6 + Math.sqrt(Math.max(0, 1 - (rr / 10) ** 2)) * 3.2 - 0.2, L = 0.4 + r() * 1.6;
    q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI); m4.compose(new THREE.Vector3(x, y - L / 2, z), q, new THREE.Vector3(0.6 + r() * 0.8, L, 0.6 + r() * 0.8)); im.setMatrixAt(i, m4); im.setColorAt(i, c.set(pal[(r() * pal.length) | 0])); }
  s.add(im);
  const tb = P.summitTable(4.4); tb.scale.y = 0.6 / tb.top; tb.top = 0.6; s.add(tb); s.table = tb;   // at the leaders' seated height
  s.seats = []; const codes = ['mx', 'us', 'ca', 'jp', 'de', 'fr', 'it', 'sm', 'au', 'kr', 'co', 'br', 'ar', 'ch', 'mc'];
  codes.forEach((code, i) => { const a = 0.55 + i * (Math.PI * 2 - 1.1) / (codes.length - 1), x = Math.sin(a) * 4.75, z = Math.cos(a) * 4.75;
    const ch = P.officeChair('#2a3a5a'); ch.scale.setScalar(0.72); ch.seatY *= 0.72; ch.position.set(x, 0, z); ch.rotation.y = a + Math.PI; s.add(ch); s.seats.push({ x, z, yaw: a + Math.PI, code, chair: ch, a });
    const f = flagPole(code, { h: 2.6, w: 1.0 }); f.position.set(Math.sin(a) * 8.4, 0, Math.cos(a) * 8.4); f.rotation.y = a + Math.PI / 2; s.add(f); (s.flags = s.flags || []).push(f); });
  for (const [x, z] of [[-6, 4], [6, 4], [0, -6]]) { const l = new THREE.PointLight('#ffffff', 7, 16, 1.2); l.position.set(x, 6, z); s.add(l); }
  s.userData.look = { warm: 0.02, cool: 0.04, bloom: 0.28 };
  ticker(s).push(t => s.flags.forEach((f, i) => f.wave(t + i * 0.7, 0.25)));
  return s;
}

// ------------------------------------------------------------ Hipódromo de las Américas
// Track centreline: home straight along +x at z = +R (finish near x = L/2 - 12), turns centred at x = +-L/2.
export const TRACK = { L: 110, R: 38, W: 14 };
export function trackPos(d, lane = 0) {
  const { L, R } = TRACK, r = R + 1.2 + lane * 1.5, P = 2 * L + 2 * Math.PI * r; d = ((d % P) + P) % P;
  if (d < L) return { x: -L / 2 + d, z: r, yaw: Math.PI / 2 };
  d -= L; if (d < Math.PI * r) { const a = d / r; return { x: L / 2 + Math.sin(a) * r, z: Math.cos(a) * r, yaw: Math.PI / 2 + a }; }
  d -= Math.PI * r; if (d < L) return { x: L / 2 - d, z: -r, yaw: -Math.PI / 2 };
  d -= L; const a = d / r; return { x: -L / 2 - Math.sin(a) * r, z: -Math.cos(a) * r, yaw: a - Math.PI / 2 };
}
export function racecourse(light = 'day') {
  const s = wStage(light, ['#6e9a4a', '#628e40'], { groundSize: 420 });
  if (s.fog) { s.fog.near = 170; s.fog.far = 700; }   // a big venue: keep the far turn and the city crisp from the air
  const { L, R, W } = TRACK;
  const dirt = new THREE.MeshStandardMaterial({ map: LK.detailTex('dirt').clone(), color: '#b08058', roughness: 1 }); dirt.map.needsUpdate = true; dirt.map.wrapS = dirt.map.wrapT = THREE.RepeatWrapping; dirt.map.repeat.set(0.25, 0.25);
  const shape = new THREE.Shape(); shape.moveTo(-L / 2, R + W); shape.lineTo(L / 2, R + W); shape.absarc(L / 2, 0, R + W, Math.PI / 2, -Math.PI / 2, true); shape.lineTo(-L / 2, -R - W); shape.absarc(-L / 2, 0, R + W, -Math.PI / 2, Math.PI / 2, true);
  const hole = new THREE.Path(); hole.moveTo(-L / 2, R); hole.lineTo(L / 2, R); hole.absarc(L / 2, 0, R, Math.PI / 2, -Math.PI / 2, true); hole.lineTo(-L / 2, -R); hole.absarc(-L / 2, 0, R, -Math.PI / 2, Math.PI / 2, true); shape.holes.push(hole);
  const tg = new THREE.ShapeGeometry(shape, 48); tg.rotateX(-Math.PI / 2); const trk = new THREE.Mesh(tg, dirt); trk.position.y = 0.015; trk.receiveShadow = true; s.add(trk);   // symmetric, so the flip of y -> -z does not matter
  const rail = (rr) => { const pts = []; for (let i = 0; i <= 200; i++) { const d = i / 200; const P2 = 2 * L + 2 * Math.PI * rr; let u = d * P2, x, z;
      if (u < L) { x = -L / 2 + u; z = rr; } else if ((u -= L) < Math.PI * rr) { x = L / 2 + Math.sin(u / rr) * rr; z = Math.cos(u / rr) * rr; } else if ((u -= Math.PI * rr) < L) { x = L / 2 - u; z = -rr; } else { u -= L; x = -L / 2 - Math.sin(u / rr) * rr; z = -Math.cos(u / rr) * rr; }
      pts.push(new THREE.Vector3(x, 1.0, z)); }
    const c = new THREE.CatmullRomCurve3(pts, true); s.add(new THREE.Mesh(new THREE.TubeGeometry(c, 400, 0.07, 6, true), std('#f6f6f2', { roughness: 0.4 })));
    for (let i = 0; i < 160; i++) { const p = c.getPointAt(i / 160); s.add(LP.at(LP.box(0.08, 1.0, 0.08, '#f6f6f2'), p.x, 0.5, p.z)); } };
  rail(R); rail(R + W);
  const gs = P.grandstand(80, 12); gs.position.set(0, 0, R + W + 3); s.add(gs); s.stand = gs;
  const fp = P.finishPost(); fp.position.set(L / 2 - 12, 0, R + W + 0.4); s.add(fp); s.finishPost = fp; s.finishX = L / 2 - 12;
  const scr = P.bigScreen(16, 8); scr.position.set(-10, 0, -4); scr.rotation.y = 0; s.add(scr); s.screen = scr;
  for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2; s.add(LP.at(LP.roundTree(1.6, '#3f7a32', i), Math.cos(a) * (L / 2.6), 0, Math.sin(a) * (R * 0.55))); }
  s.add(LP.at(new THREE.Mesh(new THREE.CircleGeometry(9, 32), std('#5a9ac0', { roughness: 0.2 })), 18, 0.03, 4, -Math.PI / 2, 0, 0));
  const city = new THREE.Group(); for (let i = 0; i < 40; i++) { const b = NP.building(6 + (i % 4) * 2, 10 + ((i * 7) % 11) * 3, 6, ['#b8b4ac', '#c8c2b6', '#a8a49c'][i % 3], { seed: i }); b.position.set(-160 + i * 8, 0, -120 - (i % 3) * 10); city.add(b); } s.add(city);
  const volc = new THREE.Mesh(new THREE.ConeGeometry(60, 44, 32), std('#7a8496', { roughness: 1 })); volc.position.set(80, 18, -240); s.add(volc); const cap = new THREE.Mesh(new THREE.ConeGeometry(18, 14, 32), std('#f2f4f8')); cap.position.set(80, 35, -240); s.add(cap);
  const gate = P.startGate(6, 1.5); s.add(gate); s.gate = gate;
  const banner = canvasTexLocal(1024, 128, (x, W2, H) => { x.fillStyle = '#0f5a3a'; x.fillRect(0, 0, W2, H); x.fillStyle = '#f4efe2'; x.font = '900 66px Inter'; x.textAlign = 'center'; x.fillText('HIPÓDROMO DE LAS AMÉRICAS', W2 / 2, 90); });
  const bn = new THREE.Mesh(new THREE.PlaneGeometry(30, 3.75), new THREE.MeshBasicMaterial({ map: banner })); bn.position.set(0, 9.6, R + W + 13.5); bn.rotation.y = Math.PI; s.add(bn);
  finishOut(s, light, { kind: 'grass', grass: { area: [-L / 2 - R + 6, -R + 4, L / 2 + R - 6, R - 4], n: 7000, clear: [[18, 4, 9.5]] }, look: { bloom: 0.3 } });
  return s;
}

// ------------------------------------------------------------ the Winning Live concert (night)
export function liveStage() {
  const s = wStage('night', ['#1a1a22', '#16161e'], { groundSize: 200 });
  s.userData.sun.intensity = 0.4; s.userData.hemi.intensity = 0.5;
  const st = P.concertStage(); s.add(st); s.stage = st;
  for (const [x, c] of [[-5, '#ff7ac0'], [0, '#ffffff'], [5, '#7ad8ff']]) { const l = new THREE.SpotLight(c, 60, 30, 0.5, 0.6, 1.2); l.position.set(x, 12, 8); l.target.position.set(x * 0.4, 1, -3); s.add(l, l.target); }
  const fill = new THREE.PointLight('#ffe8f4', 14, 20, 1.3); fill.position.set(0, 4, 4); s.add(fill);
  const r = LP.rng(17), n = 600, sticks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 6), new THREE.MeshBasicMaterial({ color: '#ffffff' }), n), m4 = new THREE.Matrix4(), c = new THREE.Color();
  const pal = ['#ff4fa0', '#4fd2ff', '#ffe14f', '#7dff6a', '#b84dff']; s.stickBase = [];
  for (let i = 0; i < n; i++) { const x = (r() - 0.5) * 34, z = 4 + r() * 22; s.stickBase.push([x, 1.6 + r() * 0.4, z, r() * 6]); sticks.setColorAt(i, c.set(pal[(r() * pal.length) | 0])); }
  s.add(sticks); s.sticks = sticks;
  const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshLambertMaterial({ color: '#2a2430' }), n); s.stickBase.forEach(([x, y, z], i) => { m4.makeTranslation(x, 1.25, z); heads.setMatrixAt(i, m4); }); s.add(heads);
  const conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.08, 0.05), new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide }), 500); s.confBase = [];
  for (let i = 0; i < 500; i++) { s.confBase.push([(r() - 0.5) * 18, 10 + r() * 8, -6 + r() * 12, r() * 6.28, 0.5 + r()]); conf.setColorAt(i, c.set(['#ff4fa0', '#ffe14f', '#4fd2ff', '#ffffff', '#b84dff'][i % 5])); } conf.visible = false; s.add(conf); s.confetti = conf;
  s.userData.look = { bloom: 0.7, bloomT: 0.75, warm: 0.04, cool: 0.08, rimColor: '#ffb8e8', rim: 0.45, sat: 1.15 };
  ticker(s).push(t => {
    s.stickBase.forEach(([x, y, z, ph], i) => { const a = Math.sin(t * 4.2 + ph) * 0.5; m4.makeRotationZ(a).setPosition(x + Math.sin(t * 4.2 + ph) * 0.12, y, z); sticks.setMatrixAt(i, m4); }); sticks.instanceMatrix.needsUpdate = true;
    st.beams.forEach((h, i) => { h.rotation.z = 0.45 * Math.sin(t * 0.9 + i * 0.8); h.rotation.x = 0.25 * Math.sin(t * 0.7 + i); h.beam.material.opacity = (0.08 + 0.05 * Math.sin(t * 3 + i)) * (s.beamK ?? 1); });   // scenes dim the beams for close shots
    st.floorLights.forEach((l, i) => l.material.color.setHSL(((t * 0.2 + i * 0.1) % 1), 0.8, 0.6));
    if (conf.visible) { s.confBase.forEach(([x, y, z, ph, sp], i) => { const tt = t - (s.confT0 || 0); m4.makeRotationFromEuler(new THREE.Euler(tt * 3 * sp + ph, tt * 2 + ph, 0)).setPosition(x + Math.sin(tt + ph) * 0.6, y - ((tt * sp * 1.4) % 18), z); conf.setMatrixAt(i, m4); }); conf.instanceMatrix.needsUpdate = true; }
  });
  return s;
}

// ------------------------------------------------------------ the border bridge over the Río Bravo at sunset
export function bridge(light = 'golden') {
  const s = wStage(light, ['#b89a70', '#ac8e66'], { groundSize: 400, bumps: 0.4 });
  const br = P.borderBridge(90); br.rotation.y = Math.PI / 2; s.add(br); s.bridge = br;
  const water = new THREE.Mesh(new THREE.PlaneGeometry(60, 400), std('#5a7a8a', { roughness: 0.25, metalness: 0.1 })); water.rotation.x = -Math.PI / 2; water.position.set(0, 0.2, 0); s.add(water); s.water = water;
  for (const sx of [-1, 1]) { const f = flagPole(sx < 0 ? 'mx' : 'us', { h: 7, w: 3 }); f.position.set(sx * 38, 3.3, 7.5); s.add(f); (s.flags = s.flags || []).push(f); }
  s.add(MX.sierra({ z: -120, depth: 40, height: 22, seed: 211, base: '#8a6a52', top: '#b08a6a' })); s.add(MX.sierra({ z: -80, depth: 24, height: 10, seed: 212, base: '#9a7a5e', top: '#b89a78' }));
  for (let i = 0; i < 26; i++) { const b = NP.building(5, 6 + (i * 7 % 9) * 2, 5, ['#c8b098', '#d8c8a8', '#b8a088'][i % 3], { seed: i }); b.position.set((i < 13 ? -1 : 1) * (60 + (i % 13) * 7), 0, -30 - (i % 4) * 9); s.add(b); }
  finishOut(s, light, { kind: 'dirt', noGrass: true, look: { warm: 0.08, bloom: 0.4 } });
  ticker(s).push(t => s.flags.forEach((f, i) => f.wave(t + i, 0.8)));
  return s;
}

// ------------------------------------------------------------ the cast line-up: a stage with every flag behind
export function lineup() {
  const s = MS.interior({ wall: '#1d2238', floor: '#2a2430', w: 26, d: 12, h: 9, lights: [], windows: false, bulbs: false });
  s.userData.sun.intensity = 1.6; s.userData.hemi.intensity = 1.6; s.userData.hemi.color.set('#fff0e8');
  const fillL = new THREE.PointLight('#fff2e0', 10, 16, 1.1); fillL.position.set(0, 3.2, 3.5); s.add(fillL);
  const stg = new THREE.Mesh(new THREE.BoxGeometry(22, 0.5, 5), std('#6a4a36', { roughness: 0.4 })); stg.position.set(0, 0.25, -2.5); s.add(stg); s.floorY = 0.5;
  const edge = new THREE.Mesh(new THREE.BoxGeometry(22, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: '#e8c060' })); edge.position.set(0, 0.5, 0.01); s.add(edge);
  const codes = ['ar', 'kr', 'sm', 'fr', 'de', 'ca', 'us', 'mx', 'jp', 'it', 'au', 'co', 'br', 'ch', 'mc'];
  codes.forEach((c, i) => { const b = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.87), new THREE.MeshStandardMaterial({ map: flagTex(c), roughness: 0.9 })); b.position.set(-10.15 + i * 1.45, 3.1 + (i % 2) * 0.45, -5.9); s.add(b);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.5, 6), std('#c9a227', { metalness: 0.6 })); rod.rotation.z = Math.PI / 2; rod.position.set(b.position.x, b.position.y + 0.47, -5.88); s.add(rod); });
  s.codes = codes;
  for (let i = 0; i < 5; i++) { const l = new THREE.SpotLight(['#fff1d6', '#ffe0f0', '#e0f0ff'][i % 3], 40, 22, 0.5, 0.6, 1.2); l.position.set(-10 + i * 5, 8.5, 5); l.target.position.set(-8 + i * 4, 0.5, -2.4); s.add(l, l.target); }
  for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 9, 10, 1, true, 0, Math.PI), new THREE.MeshStandardMaterial({ color: i % 2 ? '#7a1420' : '#8e1a28', side: THREE.DoubleSide, roughness: 0.9 })); f.position.set(sx * (12.4 - i * 0.8), 4.5, -5.4 + i * 0.25); f.rotation.y = sx > 0 ? Math.PI : 0; s.add(f); }
  LK.motes(s, [-10, 1.0, -5, 10, 7.5, 2], 200, 9);
  s.userData.look = { warm: 0.05, bloom: 0.4, rim: 0.4, rimColor: '#ffe6d0' };
  return s;
}
