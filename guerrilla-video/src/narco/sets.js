// Environments for the corruption & cartels video (present-day Mexico, plus a few 1980s and US settings).
import * as THREE from 'three';
import * as LP from '../lib/props.js';
import { stage, aimSun, mood } from '../lib/stage.js';
import * as X from '../mx/props.js';
import * as MS from '../mx/sets.js';
import * as N from './props.js';

export const LIGHT = {
  ...MS.LIGHT,
  nightCity: { skyTop: '#05070f', skyHor: '#20283e', sunColor: '#8fa4ff', sun: 0.6, hemi: 0.8, hemiSky: '#6c7fb0', hemiGround: '#1e1e26', fog: ['#151b2c', 18, 90] },
  dawn: { skyTop: '#3d5a8a', skyHor: '#f0b88a', sunColor: '#ffc8a0', sun: 2.0, hemi: 1.0, hemiSky: '#ffd6bd', hemiGround: '#5a5042', fog: ['#d8b49a', 30, 160] },
};
export function nStage(light = 'day', ground = ['#9a9488', '#8e887c'], extra = {}) {
  const L = LIGHT[light];
  return stage({ ...L, groundA: ground[0], groundB: ground[1], shadow: 16, sunPos: light === 'dusk' || light === 'golden' || light === 'dawn' ? [-12, 7, 6] : [7, 14, 8], seed: 7, ...extra });
}
export const isNight = l => l === 'night' || l === 'nightCity';
export function stars(s, n = 500) {
  const r = LP.rng(77);
  s.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([...Array(n)].flatMap(() => { const a = r() * 6.28, b = r() * 1.2 + 0.15; return [Math.cos(a) * 300 * Math.cos(b), 300 * Math.sin(b), Math.sin(a) * 300 * Math.cos(b)]; }), 3)),
    new THREE.PointsMaterial({ color: '#ffffff', size: 1.3, sizeAttenuation: false, fog: false })));
}
// Asphalt road along z with lane markings (width w, centred at x).
export function road(s, { x = 0, w = 7, len = 220, z = 0, color = '#3a3b3e' } = {}) {
  s.add(LP.at(LP.box(w, 0.02, len, color), x, 0.011, z));
  for (let i = 0; i < len / 4; i++) s.add(LP.at(LP.box(0.14, 0.022, 1.8, '#e8e2c8'), x, 0.013, z - len / 2 + i * 4));
  for (const sx of [-1, 1]) s.add(LP.at(LP.box(0.12, 0.022, len, '#d8d2b8'), x + sx * (w / 2 - 0.3), 0.013, z));
}
export function sidewalk(s, x, len = 120, w = 2.2) { s.add(LP.at(LP.box(w, 0.16, len, '#a8a296'), x, 0.08, 0)); }

// ------------------------------------------------------------ title: missing-person posters at night
export function posterStreet() {
  const s = nStage('nightCity', ['#2a2b30', '#26272c'], { seed: 31 }); stars(s);
  const wall = N.posterWall(9, 2.8, 4); wall.position.set(0, 0, -2.2); s.add(wall);
  s.add(LP.at(LP.box(14, 0.16, 3, '#6a6660'), 0, 0.08, -1.2));
  for (let i = 0; i < 4; i++) { const b = N.building(5, 8 + (i % 2) * 3, 5, ['#5a5550', '#4e4a46', '#625c56', '#57524c'][i], { night: true, seed: i }); b.position.set(-9 + i * 6, 0, -6.5); s.add(b); }
  s.candles = []; for (let i = 0; i < 16; i++) { const c = N.candle(i); c.position.set(-3.4 + (i % 8) * 0.95 + (i % 3) * 0.1, 0.16, -1.45 + Math.floor(i / 8) * 0.35); s.add(c); s.candles.push(c); }
  for (let i = 0; i < 3; i++) { const cr = X.cross(i); cr.scale.setScalar(0.6); cr.position.set(-2.5 + i * 2.5, 0.16, -1.9); s.add(cr); }
  const sl = N.streetLight(true); sl.position.set(4.6, 0, -0.5); sl.rotation.y = Math.PI; s.add(sl);
  const warm = new THREE.PointLight('#ffb560', 6, 6, 1.5); warm.position.set(0, 0.8, -0.6); s.add(warm); s.warm = warm;
  return s;
}
// ------------------------------------------------------------ highway at night (convoys)
export function highway(light = 'nightCity') {
  const s = nStage(light, ['#5a5446', '#4e493e'], { seed: 32 }); if (isNight(light)) stars(s);
  road(s, { w: 7.5 });
  s.add(X.sierra({ z: -110, depth: 40, height: 16, seed: 33, base: isNight(light) ? '#1c2030' : '#7a6a5e', top: isNight(light) ? '#262c40' : '#9a8a7c' }));
  LP.scatter(s, (r, i) => [X.agave(0.8 + r() * 0.5, i), X.shrub(0.8 + r() * 0.4, i, '#5a5a3a'), X.nopal(0.8, i)][i % 3], 90, [-60, -80, 60, 30], 34, [[0, -25, 6], [0, 0, 6], [0, 25, 6]]);
  return s;
}
// ------------------------------------------------------------ 1980s: a cartel boss's ranch office
export function office80() {
  const s = MS.interior({ wall: '#7a5a3a', floor: '#4a3020', w: 10, d: 8, h: 3.6, lights: [[0, 3.1, 0.5]], windows: true, bulbs: true });
  const t = X.desk(); t.scale.set(1.4, 1.1, 1.1); t.position.set(0, 0, -0.75); s.add(t); s.tableY = 0.42 * 1.1;
  const cash = N.cash(9, 4); cash.position.set(0.35, s.tableY + 0.02, -0.75); s.add(cash);
  const br = N.briefcase(true); br.position.set(-0.5, s.tableY + 0.01, -0.8); br.rotation.y = 0.3; s.add(br);
  const c = X.chair(true); c.position.set(-0.6, 0, -1.75); c.rotation.y = 0; s.add(c);
  const head = new THREE.Group(); head.add(LP.at(LP.box(0.6, 0.5, 0.1, '#6b4a2f'), 0, 0, 0)); head.position.set(-2.6, 2.4, -3.95); s.add(head);
  const f = X.flag('mx', 2.2, 0.9, 0.55); f.position.set(3.4, 0, -3.3); s.add(f);
  return s;
}
// 1985 newsroom desk with typewriter (for the Camarena headline).
export function newsDesk() {
  const s = MS.interior({ wall: '#5f6a6e', floor: '#3e3a36', w: 8, d: 6, h: 3.2, lights: [[0, 2.8, 0.6]], windows: false, bulbs: true });
  const d = X.desk(); d.scale.set(1.4, 1.6, 1.4); d.position.set(0, 0, -0.4); s.add(d);
  const tw = N.typewriter(); tw.position.set(-0.3, 0.42 * 1.6 + 0.01, -0.35); s.add(tw);
  const dea = N.badgeDEA(); dea.rotation.x = -Math.PI / 2; dea.position.set(0.55, 0.42 * 1.6 + 0.012, -0.25); s.add(dea);
  for (let i = 0; i < 5; i++) s.add(LP.at(LP.box(0.32, 0.01, 0.24, ['#efe6cf', '#e6dcc0'][i % 2]), 0.45 + i * 0.03, 0.42 * 1.6 + 0.01 + i * 0.006, -0.6, 0, i * 0.2, 0));
  return s;
}
// ------------------------------------------------------------ the presidential morning press conference
export function mananera({ screen = null, podiumText = 'GOBIERNO DE MÉXICO' } = {}) {
  const s = MS.interior({ wall: '#b39a76', floor: '#4a2f22', w: 14, d: 10, h: 5.4, lights: [[-3, 4.6, 1], [3, 4.6, 1]], windows: false, bulbs: false });
  s.userData.sun.intensity = 1.1;
  // carved stone arches on the back wall
  for (let i = 0; i < 5; i++) { const x = -5.6 + i * 2.8; s.add(LP.at(LP.box(0.5, 5.4, 0.3, '#a68a64'), x - 1.4, 2.7, -4.85)); const a = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.14, 6, 18, Math.PI), LP.mat('#a68a64')); a.position.set(x, 3.6, -4.85); s.add(a); }
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 2.6), new THREE.MeshBasicMaterial({ color: '#1d3a5a' })); scr.position.set(0, 2.9, -4.55); s.add(scr); s.screen = scr;
  s.add(LP.at(LP.box(5.5, 2.9, 0.12, '#2a2a2e'), 0, 2.9, -4.62));
  const pod = N.podium(podiumText); pod.position.set(0, 0.25, -2.3); pod.scale.set(0.9, 0.46, 0.9); s.add(pod); s.podium = pod;
  s.add(LP.at(LP.box(4.2, 0.25, 2.6, '#5a3a28'), 0, 0.125, -2.6));
  for (const x of [-2.6, 2.6]) { const f = X.flag('mx', 3.2, 1.3, 0.8); f.position.set(x, 0.25, -3.6); s.add(f); (s.flags = s.flags || []).push(f); }
  for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) { const c = X.chair(false); c.position.set(-3.2 + i * 1.28, 0, 1.5 + r * 1.4); c.rotation.y = Math.PI; s.add(c); }
  return s;
}
// ------------------------------------------------------------ modern city avenue (day/dusk/night)
export function avenue(light = 'day', { seed = 41 } = {}) {
  const s = nStage(light, ['#8e8a80', '#86827a'], { seed }); if (isNight(light)) stars(s);
  road(s, { w: 8 }); sidewalk(s, -5.1); sidewalk(s, 5.1);
  const cols = ['#d9c9a8', '#c9b9a0', '#e2d6c0', '#b8a890', '#cfc2a8', '#a8b0b8'];
  for (let i = 0; i < 10; i++) for (const sx of [-1, 1]) { const h = 6 + ((i * 7 + (sx > 0 ? 3 : 0)) % 5) * 1.6; const b = N.building(4.6, h, 5, cols[(i + (sx > 0 ? 2 : 0)) % 6], { night: isNight(light), seed: i * 2 + (sx > 0) });
    b.position.set(sx * 9, 0, 30 - i * 6.2); b.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2; s.add(b); }
  for (let i = 0; i < 6; i++) for (const sx of [-1, 1]) { const l = N.streetLight(isNight(light)); l.position.set(sx * 4.6, 0, 24 - i * 10); l.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2; s.add(l); }
  return s;
}
// ------------------------------------------------------------ US federal courtroom (Brooklyn)
export function courtroom({ mx = false } = {}) {
  const s = MS.interior({ wall: '#8a6a4a', floor: '#5a3a26', w: 12, d: 10, h: 5, lights: [[-2, 4.4, 0.5], [2, 4.4, 0.5]], windows: false, bulbs: false });
  for (let i = 0; i < 9; i++) s.add(LP.at(LP.box(0.08, 5, 0.06, '#6a4a30'), -5.6 + i * 1.4, 2.5, -4.95));
  const bench = N.judgeBench(); bench.position.set(0, 0, -3.6); s.add(bench);
  const seal = new THREE.Mesh(new THREE.CircleGeometry(0.75, 32), new THREE.MeshStandardMaterial({ map: N.canvasTex(256, 256, (x, W) => { x.fillStyle = '#d4af37'; x.beginPath(); x.arc(W / 2, W / 2, 124, 0, 7); x.fill(); x.fillStyle = mx ? '#5a1f2a' : '#1d2a4a'; x.beginPath(); x.arc(W / 2, W / 2, 104, 0, 7); x.fill();
    x.fillStyle = '#e8e2d0'; x.textAlign = 'center';
    if (mx) { x.font = '900 24px Georgia'; x.fillText('PODER', W / 2, 102); x.fillText('JUDICIAL', W / 2, 134); x.fillText('DE LA', W / 2, 164); x.fillText('FEDERACIÓN', W / 2, 194); }
    else { x.font = '900 30px Georgia'; x.fillText('UNITED STATES', W / 2, 108); x.fillText('DISTRICT COURT', W / 2, 146); x.font = '600 22px Georgia'; x.fillText('E.D.N.Y.', W / 2, 180); } }) }));
  seal.position.set(0, 2.85, -4.86); seal.scale.setScalar(0.85); s.add(seal);
  s.userData.sun.intensity = 2.0; s.userData.hemi.intensity = 1.3;
  const us = X.flag(mx ? 'mx' : 'us', 3, 1.2, 0.75); us.position.set(-2.8, 0, -4.2); s.add(us); s.usFlag = us;
  for (const x of [-1.6, 1.6]) { const t = X.desk(); t.scale.set(1.2, 1.15, 0.9); t.position.set(x, 0, -0.6); s.add(t); }
  for (let r = 0; r < 2; r++) s.add(LP.at(LP.box(9, 0.5, 0.5, '#6a4026'), 0, 0.25, 2.2 + r * 1.3));
  return s;
}
// ------------------------------------------------------------ Ayotzinapa memorial: 43 empty desks
export function memorial43() {
  const s = nStage('dusk', ['#b9ad98', '#ada18c'], { seed: 43 });
  s.desks = [];
  for (let i = 0; i < 43; i++) { const d = N.pupitre(); const col = i % 9, row = Math.floor(i / 9); d.position.set(-4.4 + col * 1.1, 0, -1 - row * 1.25); s.add(d); s.desks.push(d); }
  // the red "+43" anti-monument (Paseo de la Reforma)
  const am = new THREE.Group(), R = '#c0272d', bx = (w, h, x, y) => am.add(LP.at(LP.box(w, h, 0.35, R), x, y, 0));
  bx(1.1, 0.3, -2.1, 2.05); bx(0.3, 1.1, -2.1, 2.05);
  bx(0.3, 1.0, -0.95, 2.65); bx(1.0, 0.3, -0.6, 2.0); bx(0.3, 1.9, -0.25, 2.2);
  bx(1.0, 0.3, 0.9, 3.05); bx(0.8, 0.3, 1.0, 2.25); bx(1.0, 0.3, 0.9, 1.4); bx(0.3, 1.95, 1.25, 2.22);
  am.add(LP.at(LP.box(4.6, 1.25, 0.9, '#8a8478'), -0.4, 0.625, 0));
  am.position.set(0, 0, -8.6); am.scale.setScalar(1.15); s.add(am);
  const ban = X.banner('NOS FALTAN 43', { w: 4.4, h: 0.8, bg: '#1d1d1d', fg: '#ffffff', accent: '#c0272d', size: 92, poles: false }); ban.position.set(-0.46, 0.72, -8.07); s.add(ban);
  s.candles = []; for (let i = 0; i < 20; i++) { const c = N.candle(i + 3); c.position.set(-4.6 + (i % 10) * 1.02, 0, 0.6 + Math.floor(i / 10) * 0.3); s.add(c); s.candles.push(c); }
  for (let i = 0; i < 5; i++) { const h = X.townhouse(3.2, 3.4, ['#d8d4cc', '#c4c8cc', '#e2ddd2', '#cfd2d4', '#dcd6ca'][i], i); h.position.set(-8 + i * 4, 0, -14); s.add(h); }
  return s;
}
// ------------------------------------------------------------ port at night: fuel tanker, trucks, containers
export function portNight() {
  const s = nStage('dusk', ['#6a665e', '#625e56'], { seed: 51 });
  const sea = new THREE.Mesh(new THREE.BoxGeometry(300, 0.4, 140), new THREE.MeshStandardMaterial({ color: '#3d5e74', roughness: 0.25, metalness: 0.15 })); sea.position.set(0, -0.1, -76); s.add(sea);
  s.add(LP.at(LP.box(80, 1.2, 4, '#5a5650'), 0, -0.4, -4.5));
  const ship = N.tankerShip(); ship.rotation.y = Math.PI / 2; ship.position.set(4, -2.2, -14); s.add(ship);
  const cr = N.gantryCrane(); cr.position.set(-14, 0, -2); s.add(cr);
  [['#b8432f', -18, 6], ['#2f5a8a', -18, 9], ['#3a7a4a', -15.4, 6], ['#c9a227', -15.4, 9]].forEach(([c, x, z]) => { const k = N.container(c); k.position.set(x, 0, z); s.add(k); });
  s.trucks = [0, 1].map(i => { const t = N.tankerTruck(); t.position.set(-5 + i * 5.5, 0, -0.6); t.rotation.y = Math.PI / 2 + 0.08; s.add(t); return t; });
  for (const x of [-16, -9, 9, 16]) { const l = N.streetLight(false, 6); l.position.set(x, 0, 1.6); s.add(l); }
  return s;
}
// ------------------------------------------------------------ prosecutor's office drowning in case files
export function fiscalia() {
  const s = MS.interior({ wall: '#c9c4b4', floor: '#6a6458', w: 12, d: 9, h: 3.4, lights: [[-2, 3.1, 0], [2, 3.1, 0]], windows: false, bulbs: false });
  s.userData.hemi.color.set('#eef2ff'); s.userData.sun.color.set('#f2f4ff');
  for (const x of [-2.5, 0, 2.5]) for (const z of [-2.6, 0.2]) { const fl = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.25), new THREE.MeshBasicMaterial({ color: '#f4f8ff' })); fl.position.set(x, 3.37, z); s.add(fl); }
  const d = X.desk(); d.scale.set(1.4, 0.95, 1.2); d.position.set(0, 0, -0.6); s.add(d);
  s.stacks = [];
  [[-0.85, -0.85, 4, 1], [0.85, -0.45, 3, 1], [-2.6, -2.9, 9], [-1.8, -3.6, 10], [-1.0, -3.9, 8], [1.9, -3.3, 9], [2.8, -2.6, 8], [3.6, -3.7, 10], [-3.6, -3.6, 9], [-3.4, -2.0, 6], [3.6, -1.4, 5], [0.4, -3.9, 7]].forEach(([x, z, n, top], i) => {
    const st = N.fileStack(n, i); st.position.set(x, top ? 0.42 * 0.95 + 0.03 : 0, z); st.scale.setScalar(top ? 0.62 : 1); st.rotation.y = top ? 0.2 * (i ? -1 : 1) : 0; s.add(st); s.stacks.push(st); });
  const tw = N.typewriter(); tw.position.set(0.34, 0.42 * 0.95 + 0.03, -0.82); tw.rotation.y = Math.PI - 0.25; tw.scale.setScalar(0.8); s.add(tw);
  const ch = X.chair(false); ch.position.set(0, 0, -1.35); ch.scale.set(1, 1.4, 1); s.add(ch);
  const ch2 = X.chair(false); ch2.position.set(0.95, 0, 0.05); ch2.rotation.y = 3.74; s.add(ch2);
  // waiting bench along the right wall
  s.add(LP.at(LP.box(0.5, 0.24, 2.6, '#6a5a48'), 3.0, 0.12, 0.9)); s.add(LP.at(LP.box(0.08, 0.6, 2.6, '#6a5a48'), 3.27, 0.5, 0.9));
  return s;
}
// ------------------------------------------------------------ clandestine lab in the sierra
export function labCamp(light = 'overcast') {
  const s = nStage(light, ['#6a6a48', '#5e5e40'], { seed: 61 });
  s.add(X.sierra({ z: -80, depth: 40, height: 22, seed: 62, base: '#4a5a3e', top: '#6a7a5a' }));
  LP.scatter(s, (r, i) => LP.pine(1.4 + r() * 0.8, '#2f5a36', i), 110, [-50, -60, 50, 20], 63, [[0, 0, 7.5]]);
  const t = N.tarp('#2f6a8a', 7, 5, 2.7); t.position.set(0, 0, -1); s.add(t);
  for (const [x, z] of [[-1.6, -1.6], [1.6, -1.0]]) { const lt = N.labTable(); lt.position.set(x, 0, z); lt.rotation.y = x < 0 ? 0.1 : -0.2; lt.scale.y = 0.65; s.add(lt); }
  [['#2a4a8a', -3.0, 0.6], ['#2a4a8a', -2.4, 1.1], ['#c9a227', -3.1, 1.5], ['#7a2a24', 2.9, 0.9], ['#2a4a8a', 3.3, 0.2], ['#e8e4dc', 2.6, -2.2]].forEach(([c, x, z]) => { const d = N.drum(c); d.position.set(x, 0, z); s.add(d); });
  const b = N.bricks(16, '#e8e4dc', 7); b.position.set(0.2, 0, 1.4); s.add(b);
  return s;
}
// ------------------------------------------------------------ small-town street with a corner shop
export function shopStreet(light = 'dusk') {
  const s = nStage(light, ['#b9a98e', '#ad9d82'], { seed: 71 });
  road(s, { x: 0, w: 6, len: 80, z: 6, color: '#5a5650' });
  const shop = N.tiendita(); shop.position.set(0, 0, 0); s.add(shop); s.shop = shop;
  const cols = ['#d9b48a', '#e2c9a2', '#c9967a', '#d6c08f', '#e0b9a0', '#9fb8a8'];
  for (let i = 0; i < 6; i++) { if (i === 2 || i === 3) continue; const h = X.townhouse(4, 3 + (i % 2) * 0.5, cols[i], i); h.position.set(-12 + i * 5, 0, -1.6); s.add(h); }
  const sl = N.streetLight(light === 'night'); sl.position.set(3.5, 0, 2.4); sl.rotation.y = Math.PI; s.add(sl);
  return s;
}
// ------------------------------------------------------------ lime orchard (Michoacán)
export function orchard(light = 'golden') {
  const s = nStage(light, ['#8a7a4a', '#7e6e42'], { seed: 66 });
  s.add(X.sierra({ z: -70, depth: 30, height: 16, seed: 67, base: '#5a6a44', top: '#7a8a5a' }));
  for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) { const tr = N.fruitTree(r === 3 ? 'aguacate' : 'limon', 1, r * 9 + i); tr.position.set(-12 + i * 3 + (r % 2) * 1.5, 0, -2.6 - r * 3.2); s.add(tr); }
  for (let i = 0; i < 7; i++) { const c = new THREE.Group(); c.add(LP.at(LP.box(0.5, 0.28, 0.36, '#a8865a'), 0, 0.14, 0)); c.add(LP.at(LP.box(0.46, 0.04, 0.32, '#8fc23a'), 0, 0.27, 0));
    c.position.set(1.0 + (i % 4) * 0.56, i < 4 ? 0 : 0.29, 0.4 + (i % 2) * 0.05); s.add(c); }
  return s;
}
// ------------------------------------------------------------ bus stop where kids get recruited by phone ads
export function busStop(light = 'day') {
  const s = avenue(light, { seed: 81 });
  const sh = new THREE.Group(); sh.add(LP.at(LP.box(3.2, 0.08, 1.4, '#3a4a5a'), 0, 2.4, 0)); for (const x of [-1.5, 1.5]) sh.add(LP.at(LP.cyl(0.05, 0.05, 2.4, '#3a3d42', 6), x, 1.2, -0.5));
  sh.add(LP.at(LP.box(3, 1.6, 0.04, '#a8c8d8'), 0, 1.3, -0.6)); sh.add(LP.at(LP.box(2.6, 0.06, 0.4, '#5a5e64'), 0, 0.5, -0.35));
  sh.position.set(-5, 0.16, 2); sh.rotation.y = Math.PI / 2; s.add(sh);
  return s;
}
// ------------------------------------------------------------ the US–Mexico border wall in the desert
export function border(light = 'golden') {
  const s = MS.desert(light, { clear: [[0, 0, 9], [0, 10, 6], [0, -10, 6]], seed: 91 });
  const w = N.borderWall(120, 5.5); w.position.set(0, 0, -2); s.add(w); s.wall = w;
  s.add(LP.at(LP.box(120, 0.02, 4, '#b8a07a'), 0, 0.012, 0.3)); s.add(LP.at(LP.box(120, 0.02, 4, '#b8a07a'), 0, 0.012, -4.3));
  const us = X.flag('us', 6, 1.6, 1.0); us.position.set(4, 0, -9); s.add(us); s.usFlag = us;
  const mx = X.flag('mx', 6, 1.6, 1.0); mx.position.set(-4, 0, 5); s.add(mx); s.mxFlag = mx;
  return s;
}
// ------------------------------------------------------------ Washington: the White House
export function whiteHouseSet(light = 'day') {
  const s = nStage(light, ['#7fa858', '#73994e'], { seed: 101 });
  const wh = N.whiteHouse(); wh.position.set(0, 0, -16); s.add(wh);
  s.add(LP.at(LP.box(60, 0.02, 6, '#d8d2c4'), 0, 0.012, -6));
  for (let i = 0; i < 60; i++) s.add(LP.at(LP.cyl(0.03, 0.03, 1.8, '#1d1d1d', 4), -30 + i, 0.9, 2)); s.add(LP.at(LP.box(60, 0.05, 0.05, '#1d1d1d'), 0, 1.75, 2));
  const f = X.flag('us', 9, 2.4, 1.5); f.position.set(0, 0, -7); s.add(f); s.flag = f;
  LP.scatter(s, (r, i) => LP.roundTree(1.6 + r() * 0.6, '#3f7a32', i), 40, [-50, -40, 50, -8], 102, [[0, -16, 16]]);
  return s;
}
// ------------------------------------------------------------ Culiacán, October 2019: burning blockades
export function culiacan(light = 'dusk') {
  const s = avenue(light, { seed: 111 });
  s.blaze = [];
  [[-1.8, -6], [1.5, -10], [-0.5, -16], [2.2, -22]].forEach(([x, z], i) => { const c = N.burntCar(i); c.position.set(x, 0, z); s.add(c); s.blaze.push({ c, x, z, fire: X.fireSprites(s, 16, { size: 1.0, rise: 1.8, spread: 1.2, life: 1.0 }), smoke: X.smokeTrail(s, 12, { color: '#2a2622', size: 1.6, rise: 9, drift: [0.8, 0, 0], life: 3.5, opacity: 0.7 }) }); });
  const l = new THREE.PointLight('#ff8a3a', 14, 26, 1.4); l.position.set(0, 3, -10); s.add(l); s.fireLight = l;
  return s;
}
// ------------------------------------------------------------ airfield: prisoner transfer flight
export function airfield(light = 'day') {
  const s = nStage(light, ['#7a7a74', '#72726c'], { seed: 121 });
  s.add(LP.at(LP.box(30, 0.02, 120, '#55565a'), 0, 0.011, -10)); for (let i = 0; i < 20; i++) s.add(LP.at(LP.box(0.4, 0.022, 3, '#e8e2c8'), 0, 0.013, 40 - i * 7));
  const j = N.jet(); j.position.set(3.5, 0, -2); j.rotation.y = -0.25; s.add(j); s.jet = j;
  const hangar = new THREE.Group(); hangar.add(LP.at(LP.box(26, 9, 18, '#b8bcc0'), 0, 4.5, 0)); const roof = new THREE.Mesh(new THREE.CylinderGeometry(9.2, 9.2, 26, 18, 1, false, -Math.PI / 2, Math.PI), LP.mat('#9aa0a6')); roof.rotation.z = Math.PI / 2; roof.position.y = 9; hangar.add(roof);
  hangar.position.set(-22, 0, -34); s.add(hangar);
  s.add(X.sierra({ z: -120, depth: 40, height: 14, seed: 122, base: '#7a8a9a', top: '#9aa8b4' }));
  return s;
}
// ------------------------------------------------------------ Tapalpa, Jalisco: pine-covered mountains
export function tapalpa(light = 'dawn') {
  const s = nStage(light, ['#5a6a44', '#52603e'], { seed: 131, bumps: 0.8 });
  s.add(X.sierra({ z: -90, depth: 50, height: 30, seed: 132, base: '#3a4a3a', top: '#5a6a58' }));
  s.add(X.sierra({ z: -55, depth: 30, height: 14, seed: 133, base: '#46583e', top: '#5e7050' }));
  LP.scatter(s, (r, i) => LP.pine(1.6 + r() * 1.2, ['#2a4a32', '#2f5636', '#24402c'][i % 3], i), 220, [-80, -80, 80, 30], 134, [[0, 0, 5]]);
  const cabin = new THREE.Group(); cabin.add(LP.at(LP.box(4, 2.6, 3.2, '#d8cfc0'), 0, 1.3, 0)); const rf = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.6, 4), LP.mat('#7a3a2a')); rf.rotation.y = Math.PI / 4; rf.position.y = 3.4; rf.scale.set(1, 1, 0.8); cabin.add(rf);
  cabin.position.set(-2, 0, -14); s.add(cabin); s.cabin = cabin;
  return s;
}
// ------------------------------------------------------------ dry field where searching mothers dig
export function searchField(light = 'golden') {
  const s = nStage(light, ['#b39a70', '#a68e66'], { seed: 141, bumps: 0.5 });
  s.add(X.sierra({ z: -100, depth: 40, height: 14, seed: 142, base: '#8a7a6a', top: '#a89482' }));
  LP.scatter(s, (r, i) => [X.shrub(0.8 + r() * 0.5, i, '#7a7a4a'), X.mesquite(0.9 + r() * 0.4, i), X.agave(0.7, i)][i % 3], 70, [-50, -60, 50, 25], 143, [[0, 0, 8]]);
  for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), LP.mat('#8a6e4a')); m.scale.set(1, 0.35, 1); m.position.set(-4 + i * 1.7, 0, -2.5 - (i % 2) * 1.5); s.add(m); }
  const fl = X.banner('¿DÓNDE ESTÁN?', { w: 4.2, h: 0.8, bg: '#f4efe2', fg: '#c0272d', accent: '#c0272d', size: 80 }); fl.position.set(-3.6, 1.55, -6.5); fl.rotation.y = 0.3; s.add(fl);
  return s;
}
// ------------------------------------------------------------ Zócalo march
export function zocaloMarch(light = 'overcast') {
  const s = MS.zocalo(light);
  const b1 = X.banner('¡BASTA DE VIOLENCIA!', { w: 4.6, h: 0.75, bg: '#f4efe2', fg: '#1d1d1d', accent: '#c0272d', size: 78 }); b1.position.set(-0.6, 1.75, 4.2); b1.rotation.y = Math.PI; s.add(b1); s.banners = [b1];
  const b2 = X.banner('GENERACIÓN Z', { w: 3.2, h: 0.65, bg: '#1d1d1d', fg: '#ffffff', accent: '#ffffff', size: 74 }); b2.position.set(2.8, 1.7, 7.4); b2.rotation.y = Math.PI - 0.2; s.add(b2); s.banners.push(b2);
  s.mflags = [[-3.4, 6.2], [1.6, 9.6]].map(([x, z]) => { const f = X.flag('mx', 3.0, 1.0, 0.65); f.position.set(x, 0, z); s.add(f); return f; });
  return s;
}
// ------------------------------------------------------------ municipal police checkpoint at night
export function checkpoint() {
  const s = highway('nightCity');
  const fl = new THREE.PointLight('#ffe2b8', 16, 14, 1.3); fl.position.set(-1.2, 3.6, 2.2); s.add(fl); s.flood = fl;
  s.userData.hemi && (s.userData.hemi.intensity = 1.1);
  const b = N.barrier(3.6); b.position.set(-1.6, 0, 0); s.add(b);
  for (let i = 0; i < 6; i++) { const c = N.cone(); c.position.set(-3.4 + i * 1.1, 0, 2.2); s.add(c); }
  const p = N.patrol('policia', { night: true }); p.position.set(-5.6, 0, -1.5); p.rotation.y = 0.4; s.add(p); s.patrol = p;
  const sl = N.streetLight(true, 5); sl.position.set(-4.5, 0, 0.8); s.add(sl);
  return s;
}
// ------------------------------------------------------------ town plaza at golden hour (ending)
export function plazaHope() { const s = MS.plaza('golden', 151); return s; }

export { aimSun, mood };
