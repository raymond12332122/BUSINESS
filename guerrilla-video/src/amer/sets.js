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
import * as LK from './look.js';

export { aimSun, mood };
export const { sea, field, napoStage: stage, L2 } = NS;
// Rooms built straight from interior() get this video's finish too (wallpaper, wainscot, planked floor).
export function interior(o = {}) { const s = NS.interior(o); if (!o.plain) LK.room(s, { paper: o.paper || 'damask', paperAccent: '#2a1c14', chandeliers: 0, paintings: 2, shafts: !!o.windows, pilasters: false, ...(o.dress || {}) }); return s; }
// Napoleonic sets reused here, with this video's finish.
export function doloresSet() { const s = NS.doloresSet(); LK.outdoor(s, 'night', { kind: 'dirt', grass: { area: [-18, -10, 18, 12], n: 500 } }); return s; }
export function palaceES() { const s = NS.palaceES(); LK.room(s, { floorKind: 'marble', paper: 'damask', paperCol: '#7a1a24', paperAccent: '#d4af37', panelCol: '#4a1218', chandeliers: 2, paintings: 2, shafts: false, pilasters: false }); s.userData.look = { warm: 0.05, bloom: 0.3 }; return s; }
export const { bakeAll, clouds, water, fireAt, smokeFrom } = WS;
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o });
// Per-frame animated bits registered by the builders: s.tick(t).
const ticker = s => { s.ticks = s.ticks || []; if (!s.tick) s.tick = t => s.ticks.forEach(f => f(t)); return s.ticks; };
export { ticker };

// ---------------------------------------------------------------- theatre stage (cast line-up)
export function theater() {
  const s = NS.interior({ wall: '#1a1416', floor: '#6a4426', w: 26, d: 14, h: 9, lights: [], windows: false, bulbs: false });
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
  for (const x of [-6, -2, 2, 6]) { const l = new THREE.SpotLight('#fff1d6', 22, 22, 0.42, 0.5, 1.2); l.position.set(x, 9, 4); l.target.position.set(x * 0.8, 0, -2); s.add(l, l.target); s.spots.push(l);
    s.add(LK.lightShaft(new THREE.Vector3(x, 8.6, 3.4), new THREE.Vector3(x * 0.8, 0, -2.4), 1.6, { color: '#fff0d0', k: 0.07 })); }
  // gilded proscenium, footlights along the apron, dust in the beams
  const gold = std('#c9a227', { metalness: 0.6, roughness: 0.35 });
  for (const sx of [-1, 1]) { const p = LP.at(new THREE.Mesh(new THREE.BoxGeometry(0.7, 9.6, 0.5), gold), sx * 13.2, 4.8, -0.9); s.add(p);
    for (let i = 0; i < 6; i++) s.add(LP.at(new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.12, 0.6), gold), sx * 13.2, 0.8 + i * 1.6, -0.9)); }
  const arch = new THREE.Mesh(new THREE.TorusGeometry(13.2, 0.35, 8, 48, Math.PI), gold); arch.scale.set(1, 0.16, 1); arch.position.set(0, 7.6, -0.9); s.add(arch);
  for (let i = 0; i < 18; i++) { const x = -11 + i * 22 / 17; const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffe4a8' })); b.position.set(x, 0.1, 1.2); s.add(b);
    s.add(LP.at(new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.08, 0.12), std('#5a3a20', { metalness: 0.3 })), x, 0.03, 1.3)); }
  for (const x of [-7, 0, 7]) { const fl = new THREE.PointLight('#ffcf8a', 2.6, 8, 1.2); fl.position.set(x, 0.9, 2.4); s.add(fl); }
  LK.motes(s, [-9, 1.0, -4, 9, 7.5, 2], 260, 9);
  s.userData.look = { warm: 0.06, bloom: 0.42, bloomT: 0.9, rim: 0.4, rimColor: '#ffe6c0' };
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
    s.userData.hemi.intensity = 1.05; s.userData.hemi.color.set('#8aa0d8'); s.userData.sun.color.set('#a8bcff'); s.userData.sun.intensity = 1.1; }
  LK.outdoor(s, light, { kind: 'dirt', noGrass: true, look: light === 'night' ? { bloom: 0.55, bloomT: 0.8 } : {} });
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
  LK.outdoor(s, light, { grass: { area: [-24, -30, 24, 8], clear: [[0, -6, 1.2]] } });
  return s;
}
export function hall({ wall = '#a9b49a', floor = '#6a4a30', cloth = '#2f5a3a', w = 12, d = 9, night = false, paper = null, floorKind = 'planks', chairs = !night } = {}) {
  const s = NS.interior({ wall, floor, w, d, h: 5.2, lights: night ? [[0, 2.6, 0.5]] : [[-2.5, 4.3, 0.5], [2.5, 4.3, 0.5]], windows: !night, bulbs: false });
  if (night) { s.userData.sun.intensity = 0.25; s.userData.hemi.intensity = 0.45; }
  LK.room(s, { floorKind, paper: paper || (night ? 'damask' : 'plaster'), paperAccent: night ? '#2a1c14' : '#ffffff', chandeliers: night ? 0 : 1, paintings: 2, shafts: !night, pilasters: !night,
    rugOpt: { size: [5.0, 2.6], z: -0.9, color: night ? '#2a1814' : '#4a2a1c', border: night ? '#6a5030' : '#9a7a44', field: night ? '#1c1a20' : '#2e3a2c' } });
  s.table = RP.tableCloth(4.4, 1.2, cloth); s.table.position.set(0, 0, -2.2); s.add(s.table);
  if (chairs) for (const x of [-1.5, -0.5, 0.5, 1.5]) { const c = RP.chairR('#4a3020', '#5a2a24'); c.position.set(x, 0, -3.15); s.add(c); }
  // a candelabrum and papers on the table; at night it lights the room
  for (const x of night ? [-1.3, 1.3] : [1.5]) { const cb = LK.candelabrum(); cb.position.set(x, 0.805, -2.25); s.add(cb);
    if (night) { const l = new THREE.PointLight('#ffb866', 3.2, 9, 1.3); l.position.set(x, 1.6, -1.6); s.add(l); } }
  for (const [x, r] of [[-0.6, 0.2], [0.3, -0.15]]) { const pp = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.3), new THREE.MeshStandardMaterial({ color: '#efe6cf', roughness: 0.9 })); pp.rotation.set(-Math.PI / 2, 0, r); pp.position.set(x, 0.81, -2.1); s.add(pp); }
  if (night) s.userData.look = { warm: 0.07, cool: 0.06, bloom: 0.5, bloomT: 0.8, rim: 0.2, rimColor: '#ffc890' };
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
  LK.outdoor(s, light);
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
  LK.outdoor(s, light, { grass: { flowers: 0.08 } });
  return s;
}
// Stone cell with a barred window and snow outside (Fort de Joux, Jura).
export function cell() {
  const s = NS.interior({ wall: '#7a7670', floor: '#5a5650', w: 6, d: 5, h: 3.6, lights: [], windows: false, bulbs: false });
  s.userData.sun.intensity = 0.3; s.userData.hemi.intensity = 0.95; s.userData.hemi.color.set('#9ab0d0');
  const cold = new THREE.PointLight('#bcd0ff', 8, 8, 1.2); cold.position.set(0.6, 2.4, -1.4); s.add(cold);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.7), new THREE.MeshBasicMaterial({ color: '#dfe8f4' })); win.position.set(0.6, 2.5, -2.46); s.add(win);
  for (let i = 0; i < 4; i++) s.add(LP.at(LP.box(0.04, 0.72, 0.04, '#2a2a2c'), 0.6 - 0.33 + i * 0.22, 2.5, -2.43));
  const beam = new THREE.SpotLight('#cfe0ff', 18, 9, 0.35, 0.6, 1.2); beam.position.set(0.6, 2.6, -2.2); beam.target.position.set(-0.4, 0, 0.6); s.add(beam, beam.target);
  s.add(LP.at(LP.box(1.8, 0.4, 0.8, '#4a3a2a'), -1.6, 0.2, -1.8));
  s.snow = RP.snowfall(s, { n: 200, area: [-0.2, 1.8, -3.2, 1.4, 3.4, -2.6], speed: 0.4, size: 0.02 });
  // stone and flagstones, straw, a writing table with a candle, and the cold window light across the floor
  LK.room(s, { floorKind: 'flagstone', floorCol: '#8a857c', paper: 'stone', paperCol: '#8a857c', panelCol: '#5a5650', pilasters: false, chandeliers: 0, paintings: 0, shafts: false, warm: false });
  s.add(LK.lightShaft(new THREE.Vector3(0.6, 2.5, -2.4), new THREE.Vector3(-0.3, 0, 0.4), 0.8, { color: '#cfe0ff', k: 0.22 }));
  LK.motes(s, [-0.8, 0.3, -2.2, 1.2, 2.4, 0.4], 90, 5);
  for (let i = 0; i < 70; i++) { const st = LP.at(LP.box(0.26, 0.012, 0.012, ['#c9a85a', '#b8964a', '#d8b86a'][i % 3]), -1.9 + Math.random() * 0.9, 0.02 + Math.random() * 0.06, -1.6 + Math.random() * 0.8); st.rotation.y = Math.random() * 3.14; s.add(st); }
  const tb = new THREE.Group(); tb.add(LP.at(LP.box(1.0, 0.05, 0.55, '#4a3626'), 0, 0.76, 0)); for (const [x, z] of [[-0.44, -0.22], [0.44, -0.22], [-0.44, 0.22], [0.44, 0.22]]) tb.add(LP.at(LP.box(0.05, 0.74, 0.05, '#3a2a1c'), x, 0.37, z));
  tb.position.set(1.7, 0, -1.6); s.add(tb);
  const cd = LK.candelabrum(); cd.scale.setScalar(0.8); cd.position.set(1.55, 0.79, -1.6); s.add(cd); const cl = new THREE.PointLight('#ffb866', 3.5, 4, 1.6); cl.position.set(1.55, 1.15, -1.5); s.add(cl);
  const pap = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.22), new THREE.MeshStandardMaterial({ color: '#efe6cf' })); pap.rotation.x = -Math.PI / 2; pap.position.set(1.85, 0.795, -1.55); s.add(pap);
  s.userData.look = { cool: 0.09, warm: 0.03, bloom: 0.4, bloomT: 0.85, rim: 0.3, rimColor: '#bcd0ff', sat: 0.98 };
  return s;
}
// ---------------------------------------------------------------- colonial plaza (cabildos, the Zócalo, Lima)
export function plaza(light = 'day', { cathedral = true, palace = true, arcade = true, flags = [], seed = 601, furnish = {} } = {}) {
  const s = stage(light, ['#c8b89a', '#bba98a'], { seed });
  if (palace) { const pal = MX.palacio(); pal.position.set(0, 0, -18); s.add(pal); s.palacio = pal; }
  if (cathedral) { const cat = MX.cathedral(); cat.position.set(-17, 0, -8); cat.rotation.y = Math.PI / 2; s.add(cat); }
  if (arcade) { const a = new THREE.Group(); for (let i = 0; i < 8; i++) { a.add(LP.at(LP.box(0.5, 3, 0.5, '#e6d4b2'), -8.4 + i * 2.4, 1.5, 0)); }
    a.add(LP.at(LP.box(19.5, 2.4, 3.2, '#e2c9a2'), 0, 4.2, -1.4)); a.add(LP.at(LP.box(19.5, 0.3, 3.4, '#c9a07a'), 0, 3.0, -1.4)); a.position.set(17, 0, -6); a.rotation.y = -Math.PI / 2; s.add(a); }
  s.flags = flags.map(([kind, x, z, h = 5]) => { const f = P.banner(kind, { h, w: 2.0, fh: 1.3 }); f.position.set(x, 0, z); s.add(f); return f; });
  // the life of the square: a fountain, trees in planters, lamps, a few market stalls and benches
  if (furnish) {
    const fo = P.fountain(1.6); fo.position.set(furnish.fountain?.[0] ?? 0, 0, furnish.fountain?.[1] ?? -10.5); s.add(fo);
    for (const [x, z] of [[-9, -11], [9, -11], [-12.5, -2.5], [12.5, -2.5], [-9, 4], [9, 4]]) { const t = LP.roundTree(1.5, '#4f7a34', (x * 7 + z) | 0); t.position.set(x, 0, z); s.add(t);
      s.add(LP.at(LP.cyl(0.7, 0.75, 0.4, '#c9b48c', 8), x, 0.2, z)); }
    for (const [x, z] of [[-6, -8], [6, -8], [-6, 2.5], [6, 2.5]]) { const l = P.lampPost(); l.position.set(x, 0, z); s.add(l); }
    [['#c0392b', -11, -13.5, 0.3], ['#2f6aa0', -8.4, -14.2, 0.1], ['#d49a2a', 9.0, -14.0, -0.15], ['#3f7d3a', 11.6, -13.2, -0.35]].forEach(([c, x, z, r], i) => { const st = P.stall(c, i + 1); st.position.set(x, 0, z); st.rotation.y = r; s.add(st); });
    for (const [x, z, r] of [[-3.6, -12.4, 0], [3.6, -12.4, 0]]) { const b = P.bench(); b.position.set(x, 0, z); b.rotation.y = r; s.add(b); }
  }
  LK.outdoor(s, light, { kind: 'cobble' });
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
  LK.outdoor(s, light, { kind: 'snow', noGrass: true });
  return s;
}
// ---------------------------------------------------------------- southern sierra (Guerrero), Acatempan, Ayacucho valley
export function sierra(light = 'day', { ground = ['#9a8a5a', '#8a7a50'], height = 1, pines = true, seed = 801 } = {}) {
  const s = stage(light, ground, { seed, bumps: 0.8 });
  s.add(MX.sierra({ z: -110, depth: 60, height: 30 * height, seed: seed + 1, base: '#6a7a52', top: '#8a9a6a' }));
  for (const sd of [-1, 1]) s.add(MX.sierra({ x0: -70, x1: 70, z: sd * 26 - 12, depth: 18, height: 12 * height, seed: seed + 3 + sd, base: '#7a7a52', top: '#9a9a6a', segX: 80 }));
  LP.scatter(s, (r, i) => (pines && i % 2 ? LP.pine(1.4 + r() * 0.6, '#3f5a3a', i) : MX.shrub(0.9 + r() * 0.5, i, '#7d8a4e')), 60, [-50, -60, 50, -10], seed + 5, [[0, -8, 7]]);
  LK.outdoor(s, light);
  return s;
}
// ---------------------------------------------------------------- Ipiranga brook, São Paulo
export function brook(light = 'golden', { seed = 901 } = {}) {
  const s = stage(light, ['#7f9a52', '#6f8a48'], { seed, bumps: 0.5 });
  s.add(MX.sierra({ z: -100, depth: 50, height: 10, seed: seed + 1, base: '#5f7a4a', top: '#7a9a5a' }));
  s.add(LP.strip([[-60, -12], [-20, -10], [10, -12.5], [60, -11]], 3.0, '#5f8fa8', 0.02));
  LP.scatter(s, (r, i) => (i % 4 ? LP.roundTree(1.4 + r() * 0.6, '#4f7f3a', i) : RP.palm(1.2 + r() * 0.4, i)), 50, [-60, -60, 60, -16], seed + 2);
  LK.outdoor(s, light, { grass: { flowers: 0.1 } });
  return s;
}
// ---------------------------------------------------------------- cathedral nave (coronations), with flag drapes of `kind`
export function cathedral(kind = 'mexEmp') {
  const s = new THREE.Scene();
  s.add(new THREE.HemisphereLight('#fff1d8', '#5a4632', 0.95));
  const sun = new THREE.DirectionalLight('#ffe6c0', 1.6); sun.position.set(8, 14, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 0.5, far: 50 }); s.add(sun, sun.target);
  const nave = N.gothicNave({ len: 26, w: 12, h: 13 }); s.add(nave); nave.traverse(o => { if (o.isMesh) o.castShadow = false; });
  const tex = MX.canvasTex(160, 400, (g, W, H) => { P.FLAGS[kind](g, W, H); g.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 5; i++) g.fillRect(i * W / 5, 0, 3, H); });
  for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) { const d = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 3.2), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, side: THREE.DoubleSide })); d.position.set(sd * 4.7, 5.6, -8 + i * 4); d.rotation.y = -sd * Math.PI / 2; s.add(d); }
  for (const [x, z] of [[-3, -6], [3, -6], [-3, 2], [3, 2]]) { const l = new THREE.PointLight('#ffd9a0', 8, 16, 1.4); l.position.set(x, 5, z); s.add(l); }
  s.add(LP.at(LP.box(5, 0.36, 3, '#8a1f2a'), 0, 0.18, -6)); const th = N.throne({ fabric: '#8a1f2a' }); th.position.set(0, 0.36, -6.6); s.add(th);
  s.background = new THREE.Color('#2a2018');
  // sunlight slanting through the clerestory, candle stands along the aisle, a haze of incense
  for (const z of [-7, -3, 1]) s.add(LK.lightShaft(new THREE.Vector3(-5.6, 9.5, z), new THREE.Vector3(1.5, 0, z + 1.5), 1.6, { color: '#ffe2b0', k: 0.12 }));
  for (const sd of [-1, 1]) for (const z of [-4.6, -1.6, 1.4]) { const cs = new THREE.Group(); cs.add(LP.at(LP.cyl(0.03, 0.05, 1.3, '#c9a227', 8), 0, 0.65, 0)); const c = LK.candelabrum(); c.position.y = 1.3; cs.add(c); cs.position.set(sd * 2.4, 0, z); s.add(cs); }
  LK.motes(s, [-5, 0.5, -9, 5, 8, 3], 240, 13);
  s.userData = { sun, hemi: s.children[0], interior: true, look: { warm: 0.06, bloom: 0.42, bloomT: 0.85, rim: 0.36, rimColor: '#ffe2b8' } };
  return s;
}

// ---------------------------------------------------------------- St James's: the throne room (George III's tea)
export function palace() {
  const w = 14, d = 11, h = 6.2;
  const s = NS.interior({ wall: '#1f3270', floor: '#5a3a24', w, d, h, lights: [[-3.2, h - 1.6, 0.6], [3.2, h - 1.6, 0.6]], windows: false, bulbs: false });
  LK.room(s, { floorKind: 'marble', paper: 'damask', paperCol: '#22357a', paperAccent: '#d4af37', panelCol: '#16245a', chandeliers: 2, paintings: 0, shafts: false, pilasters: false,
    rugOpt: { size: [3.0, 6.6], z: 1.0, color: '#7a1424', border: '#d4af37', field: '#8a1a2a' } });
  LK.sideWindows(s, { side: 1, zs: [-3.0, 0.6, 4.2] });
  for (const [z, k] of [[-3.0, 'portrait'], [0.6, 'landscape'], [3.8, 'portrait']]) { const p = LK.painting(1.3, 1.7, { seed: (z * 3) | 0 + 9, kind: k }); p.position.set(-w / 2 + 0.07, 3.0, z); p.rotation.y = Math.PI / 2; s.add(p); }
  // dais in two steps, the throne under a canopy, the cloth of estate with the royal arms behind
  s.add(LP.at(LP.box(5.6, 0.18, 3.2, '#6a1220'), 0, 0.09, -3.9)); s.add(LP.at(LP.box(4.4, 0.18, 2.6, '#7a1424'), 0, 0.27, -4.15));
  for (const [ww, y, z] of [[5.62, 0.18, -2.3], [4.42, 0.36, -2.85]]) s.add(LP.at(LP.box(ww, 0.035, 0.035, '#d4af37'), 0, y, z));
  const th = N.throne({ fabric: '#7a1424' }); th.position.set(0, 0.36, -4.5); s.add(th); s.throne = th;
  const coe = P.clothOfEstate(2.6, 3.8); coe.position.set(0, 2.6, -d / 2 + 0.09); s.add(coe);
  const can = P.canopy(3.0, 1.7); can.position.set(0, 4.6, -d / 2 + 0.85); s.add(can);
  const tt = P.teaTable(); tt.position.set(1.65, 0.36, -3.9); s.add(tt);
  const fs = P.footstool(); fs.position.set(0, 0.36, -3.62); s.add(fs); s.footstool = fs;
  for (const x of [-2.6, 2.6]) { const f = P.banner('gbr', { h: 3.4, w: 1.3, fh: 0.9 }); f.position.set(x, 0.36, -4.9); s.add(f); }
  s.userData.look = { warm: 0.05, cool: 0.05, bloom: 0.34, bloomT: 0.95, rim: 0.36 };
  return s;
}
