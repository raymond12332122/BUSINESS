// Environments for the independence of the Americas video. Each builder returns a THREE.Scene.
// Reuses the Napoleonic sets for Dolores, the Spanish palace and open fields (same era).
import * as THREE from 'three';
import * as LP from '../lib/props.js';
import { aimSun, mood } from '../lib/stage.js';
import * as MX from '../mx/props.js';
import * as NS from '../napo/sets.js';
import * as N from '../napo/props.js';
import * as RP from '../rusia/props.js';
import * as WS from '../ww1/sets.js';
import * as P from './props.js';

export { aimSun, mood };
export const { doloresSet, palaceES, interior, sea, field, napoStage: stage, L2 } = NS;
export const { bakeAll, clouds, water, fireAt, smokeFrom } = WS;
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o });
// Per-frame animated bits registered by the builders: s.tick(t).
const ticker = s => { s.ticks = s.ticks || []; if (!s.tick) s.tick = t => s.ticks.forEach(f => f(t)); return s.ticks; };
export { ticker };

// ---------------------------------------------------------------- theatre stage (cast line-up)
export function theater() {
  const s = interior({ wall: '#1a1416', floor: '#6a4426', w: 26, d: 14, h: 9, lights: [], windows: false, bulbs: false });
  s.userData.sun.intensity = 0.25; s.userData.hemi.intensity = 0.55;
  const boards = new THREE.Mesh(new THREE.PlaneGeometry(26, 7), new THREE.MeshStandardMaterial({ map: MX.canvasTex(512, 160, (g, W, H) => { g.fillStyle = '#7a4e2c'; g.fillRect(0, 0, W, H); for (let i = 0; i < 40; i++) { g.fillStyle = i % 2 ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.05)'; g.fillRect(i * W / 40, 0, W / 40, H); } }), roughness: 0.7 }));
  boards.rotation.x = -Math.PI / 2; boards.position.set(0, 0.012, -2); s.add(boards);
  s.riser = LP.at(LP.box(15.5, 0.4, 1.8, '#5a3a20'), 0, 0.2, -3.3); s.add(s.riser); s.add(LP.at(LP.box(15.6, 0.06, 0.06, '#d4af37'), 0, 0.41, -2.4));
  const cur = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, side: THREE.DoubleSide });
  for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 9, 10, 1, true, 0, Math.PI), cur(i % 2 ? '#7a1420' : '#8e1a28')); f.position.set(sx * (12.4 - i * 0.8), 4.5, -5.6 + i * 0.25); f.rotation.y = sx > 0 ? Math.PI : 0; s.add(f); }
  const val = new THREE.Mesh(new THREE.BoxGeometry(26, 1.6, 0.4), cur('#8e1a28')); val.position.set(0, 8.3, -4.6); s.add(val);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(26, 0.12, 0.45), std('#d4af37', { metalness: 0.6, roughness: 0.35 })); trim.position.set(0, 7.48, -4.6); s.add(trim);
  // painted backdrop: the Americas on old paper
  s.backdrop = new THREE.Mesh(new THREE.PlaneGeometry(17, 8), new THREE.MeshStandardMaterial({ color: '#e8dcc0', roughness: 0.95 })); s.backdrop.position.set(0, 4.2, -6.9); s.add(s.backdrop);
  s.spots = [];
  for (const x of [-6, -2, 2, 6]) { const l = new THREE.SpotLight('#fff1d6', 22, 22, 0.42, 0.5, 1.2); l.position.set(x, 9, 4); l.target.position.set(x * 0.8, 0, -2); s.add(l, l.target); s.spots.push(l); }
  return s;
}
// ---------------------------------------------------------------- harbours
export function harbor({ light = 'night', sugarloaf = false, ships = 1, flag = 'gb' } = {}) {
  const s = stage(light, ['#5a4a3a', '#4f4232'], { seed: 301, groundSize: 60 });
  const w = sea(s, { color: light === 'night' ? '#14263a' : '#3f7a96', y: 0.0, size: 600 }); w.position.z = -40;
  // wharf (planks on posts) at the front
  const wharf = new THREE.Group(); wharf.add(LP.at(LP.box(22, 0.25, 6, '#6a4e34'), 0, 0.9, 0));
  for (let i = 0; i < 12; i++) for (const z of [-2.8, 2.8]) wharf.add(LP.at(LP.cyl(0.14, 0.14, 1.8, '#4a3626', 6), -10.5 + i * 1.9, 0.1, z));
  wharf.position.set(0, -0.3, -9); s.add(wharf); s.wharf = wharf;
  s.ships = [];
  for (let i = 0; i < ships; i++) { const sh = N.ship({ len: 11, flag, furled: 1, seed: i + 3 }); sh.position.set(-6 + i * 14, -0.2, -17 - i * 6); sh.rotation.y = Math.PI / 2 + (i ? 0.2 : 0); s.add(sh); s.ships.push(sh); }
  if (sugarloaf) { const sl = P.sugarloaf(30); sl.position.set(30, -0.5, -110); s.add(sl); const sl2 = P.sugarloaf(18); sl2.position.set(-60, -0.5, -130); s.add(sl2); }
  if (light === 'night') { s.lamps = []; for (const x of [-9, -3, 3, 9]) { const l = new THREE.PointLight('#ffb35a', 10, 12, 1.4); l.position.set(x, 2.8, -8.5); s.add(l); s.lamps.push(l); const lan = RP.gasLamp(true, 2.4, false); lan.position.set(x, 0.6, -6.4); s.add(lan); }
    s.userData.hemi.intensity = 0.8; }
  return s;
}
// ---------------------------------------------------------------- New England / Philadelphia
export function village(light = 'sunrise', { hall = false } = {}) {
  const s = stage(light, ['#7f9a52', '#6f8a48'], { seed: 311 });
  if (hall) { const h = P.independenceHall(); h.position.set(0, 0, -16); s.add(h); s.hall = h; }
  else { const m = P.meetinghouse(); m.position.set(6, 0, -14); m.rotation.y = -0.3; s.add(m); }
  for (let i = 0; i < 5; i++) { const h = N.townhouseFR(3.2, 3.6, ['#e8dcc4', '#c9967a', '#e2d6bf', '#9a4a34', '#efe6d2'][i], i + 40); h.position.set(-16 + i * 3.6, 0, -18 - (i % 2)); s.add(h); }
  LP.scatter(s, (r, i) => LP.roundTree(1.4 + r() * 0.6, ['#5f7f3a', '#6a8a40', '#c0702a'][i % 3], i), 40, [-50, -60, 50, -10], 312, [[0, -14, 9]]);
  for (let i = 0; i < 8; i++) s.add(LP.at(LP.box(2.2, 0.08, 0.06, '#e8e2d4'), -9 + i * 2.4, 0.55, -6.5));
  return s;
}
export function hall({ wall = '#a9b49a', floor = '#6a4a30', cloth = '#2f5a3a', w = 12, d = 9, night = false } = {}) {
  const s = interior({ wall, floor, w, d, h: 5.2, lights: night ? [[0, 2.6, 0.5]] : [[-2.5, 4.3, 0.5], [2.5, 4.3, 0.5]], windows: !night });
  if (night) { s.userData.sun.intensity = 0.25; s.userData.hemi.intensity = 0.45; }
  // panelling
  for (let i = 0; i < 7; i++) s.add(LP.at(LP.box(1.4, 2.2, 0.06, new THREE.Color(wall).multiplyScalar(0.85).getStyle()), -w / 2 + 1.2 + i * 1.65, 1.2, -d / 2 + 0.05));
  s.table = RP.tableCloth(4.4, 1.2, cloth); s.table.position.set(0, 0, -2.2); s.add(s.table);
  return s;
}
// ---------------------------------------------------------------- battlefields
export function battlefield(light = 'day', { ground = ['#8a9a5a', '#7a8a50'], earthworks = false, mountains = 0, snow = false, trees = 30, seed = 401, smoke = false } = {}) {
  const s = stage(light, ground, { seed, bumps: 0.5, ...(smoke ? { fog: ['#cfcac0', 16, 110] } : {}) });
  if (mountains) { s.add(MX.sierra({ z: -100, depth: 60, height: 22 * mountains, seed: seed + 1, base: snow ? '#8a8f9a' : '#6f7a62', top: snow ? '#f4f6f8' : '#8a947a' }));
    s.add(MX.sierra({ z: -60, depth: 30, height: 9 * mountains, seed: seed + 3, base: '#7a8060', top: '#949a76' })); }
  else s.add(MX.sierra({ z: -90, depth: 50, height: 7, seed: seed + 1, base: '#6f7a62', top: '#8a947a' }));
  if (trees) LP.scatter(s, (r, i) => (i % 3 ? LP.roundTree(1.2 + r() * 0.5, '#5f7f3a', i) : LP.pine(1.3 + r() * 0.5, '#3f5a3a', i)), trees, [-60, -60, 60, -20], seed + 2);
  if (earthworks) { for (let i = 0; i < 9; i++) { const g = N.gabion(1); g.position.set(-8 + i * 2, 0, -8); s.add(g); } s.add(LP.at(LP.box(20, 0.8, 1.6, '#7a6a4a'), 0, 0.3, -9.2)); }
  return s;
}
// ---------------------------------------------------------------- Saint-Domingue
export function tropics(light = 'day', { cane = true, mill = true, bonfire = false, seed = 501 } = {}) {
  const s = stage(light, ['#7a9a4a', '#6a8a40'], { seed, bumps: 0.4 });
  s.add(MX.sierra({ z: -110, depth: 60, height: 26, seed: seed + 1, base: '#4f6a3a', top: '#6a8a4a' }));
  s.add(MX.sierra({ z: -70, depth: 30, height: 12, seed: seed + 2, base: '#5a7a40', top: '#7a9a50' }));
  if (cane) { s.add(MX.field(-24, -16, -4, -5, { seed: 1, height: 1.9 })); s.add(MX.field(5, -18, 26, -6, { seed: 2, height: 1.9 })); }
  if (mill) { const m = P.sugarMill(); m.position.set(14, 0, -22); s.add(m); }
  LP.scatter(s, (r, i) => RP.palm(1.3 + r() * 0.6, i), 34, [-60, -60, 60, -14], seed + 3, [[0, -10, 6]]);
  if (bonfire) { const b = RP.bonfire(1.6, 3); b.position.set(0, 0, -4); s.add(b); s.fire = b;
    const fs = new THREE.Group(); fs.position.set(0, 0.3, -4); s.add(fs); const f = MX.fireSprites(fs, 16, { size: 0.9, rise: 2.0, spread: 0.7, life: 0.9 }); const o = new THREE.Vector3(); ticker(s).push(t => f(t, o, 1));
    const l = new THREE.PointLight('#ff9a40', 30, 18, 1.4); l.position.set(0, 1.6, -4); s.add(l); ticker(s).push(t => { l.intensity = 26 + 6 * Math.sin(t * 13) + 4 * Math.sin(t * 7.3); }); }
  return s;
}
// Stone cell with a barred window and snow outside (Fort de Joux, Jura).
export function cell() {
  const s = interior({ wall: '#7a7670', floor: '#5a5650', w: 6, d: 5, h: 3.6, lights: [], windows: false, bulbs: false });
  s.userData.sun.intensity = 0.3; s.userData.hemi.intensity = 0.95; s.userData.hemi.color.set('#9ab0d0');
  const cold = new THREE.PointLight('#bcd0ff', 8, 8, 1.2); cold.position.set(0.6, 2.4, -1.4); s.add(cold);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.7), new THREE.MeshBasicMaterial({ color: '#dfe8f4' })); win.position.set(0.6, 2.5, -2.46); s.add(win);
  for (let i = 0; i < 4; i++) s.add(LP.at(LP.box(0.04, 0.72, 0.04, '#2a2a2c'), 0.6 - 0.33 + i * 0.22, 2.5, -2.43));
  const beam = new THREE.SpotLight('#cfe0ff', 18, 9, 0.35, 0.6, 1.2); beam.position.set(0.6, 2.6, -2.2); beam.target.position.set(-0.4, 0, 0.6); s.add(beam, beam.target);
  s.add(LP.at(LP.box(1.8, 0.4, 0.8, '#4a3a2a'), -1.6, 0.2, -1.8));
  s.snow = RP.snowfall(s, { n: 200, area: [-0.2, 1.8, -3.2, 1.4, 3.4, -2.6], speed: 0.4, size: 0.02 });
  return s;
}
// ---------------------------------------------------------------- colonial plaza (cabildos, the Zócalo, Lima)
export function plaza(light = 'day', { cathedral = true, palace = true, arcade = true, flags = [], seed = 601 } = {}) {
  const s = stage(light, ['#c8b89a', '#bba98a'], { seed });
  if (palace) { const pal = MX.palacio(); pal.position.set(0, 0, -18); s.add(pal); s.palacio = pal; }
  if (cathedral) { const cat = MX.cathedral(); cat.position.set(-17, 0, -8); cat.rotation.y = Math.PI / 2; s.add(cat); }
  if (arcade) { const a = new THREE.Group(); for (let i = 0; i < 8; i++) { a.add(LP.at(LP.box(0.5, 3, 0.5, '#e6d4b2'), -8.4 + i * 2.4, 1.5, 0)); }
    a.add(LP.at(LP.box(19.5, 2.4, 3.2, '#e2c9a2'), 0, 4.2, -1.4)); a.add(LP.at(LP.box(19.5, 0.3, 3.4, '#c9a07a'), 0, 3.0, -1.4)); a.position.set(17, 0, -6); a.rotation.y = -Math.PI / 2; s.add(a); }
  s.flags = flags.map(([kind, x, z, h = 5]) => { const f = P.banner(kind, { h, w: 2.0, fh: 1.3 }); f.position.set(x, 0, z); s.add(f); return f; });
  return s;
}
// ---------------------------------------------------------------- the Andes
export function andes(light = 'snow', { snowing = true, seed = 701 } = {}) {
  const s = stage(light, ['#e9edf1', '#dfe5ea'], { seed, bumps: 0.6 });
  s.add(MX.sierra({ z: -110, depth: 60, height: 40, seed: seed + 1, base: '#8a8f9a', top: '#f4f6f8', x0: -200, x1: 200 }));
  for (const sd of [-1, 1]) s.add(MX.sierra({ x0: -80, x1: 80, z: sd * 22 - 10, depth: 16, height: 14, seed: seed + 2 + sd, base: '#9aa0a8', top: '#eef1f4', segX: 80 }));
  for (const [x, z, h, r] of [[-40, -80, 46, 30], [-6, -96, 56, 34], [30, -84, 50, 30], [70, -100, 58, 36]]) { const p = MX.volcano(h, r, true); p.position.set(x, 0, z); s.add(p); }
  for (const [x, z, k] of [[-3.2, -1.2, 1.1], [3.4, -2.0, 1.3], [-6, -5, 1.6], [6.5, -6, 1.8]]) { const b = MX.boulder(k, x * 3 | 0, '#8a8682'); b.position.set(x, 0, z); s.add(b); }
  s.add(LP.strip([[-60, 2], [-20, 0], [20, -1], [60, -4]], 2.6, '#cfd4da', 0.014));
  if (snowing) s.snow = RP.snowfall(s, { n: 1400, area: [-16, -2, -30, 16, 12, 10], speed: 1.0, size: 0.05 });
  return s;
}
// ---------------------------------------------------------------- southern sierra (Guerrero), Acatempan, Ayacucho valley
export function sierra(light = 'day', { ground = ['#9a8a5a', '#8a7a50'], height = 1, pines = true, seed = 801 } = {}) {
  const s = stage(light, ground, { seed, bumps: 0.8 });
  s.add(MX.sierra({ z: -110, depth: 60, height: 30 * height, seed: seed + 1, base: '#6a7a52', top: '#8a9a6a' }));
  for (const sd of [-1, 1]) s.add(MX.sierra({ x0: -70, x1: 70, z: sd * 26 - 12, depth: 18, height: 12 * height, seed: seed + 3 + sd, base: '#7a7a52', top: '#9a9a6a', segX: 80 }));
  LP.scatter(s, (r, i) => (pines && i % 2 ? LP.pine(1.4 + r() * 0.6, '#3f5a3a', i) : MX.shrub(0.9 + r() * 0.5, i, '#7d8a4e')), 60, [-50, -60, 50, -10], seed + 5, [[0, -8, 7]]);
  return s;
}
// ---------------------------------------------------------------- Ipiranga brook, São Paulo
export function brook(light = 'golden', { seed = 901 } = {}) {
  const s = stage(light, ['#7f9a52', '#6f8a48'], { seed, bumps: 0.5 });
  s.add(MX.sierra({ z: -100, depth: 50, height: 10, seed: seed + 1, base: '#5f7a4a', top: '#7a9a5a' }));
  s.add(LP.strip([[-60, -12], [-20, -10], [10, -12.5], [60, -11]], 3.0, '#5f8fa8', 0.02));
  LP.scatter(s, (r, i) => (i % 4 ? LP.roundTree(1.4 + r() * 0.6, '#4f7f3a', i) : RP.palm(1.2 + r() * 0.4, i)), 50, [-60, -60, 60, -16], seed + 2);
  return s;
}
