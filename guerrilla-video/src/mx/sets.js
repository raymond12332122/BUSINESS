// Environment builders for the Revolution video. Each returns a THREE.Scene (via stage()).
import * as THREE from 'three';
import * as LP from '../lib/props.js';
import { stage, aimSun, mood } from '../lib/stage.js';
import * as X from './props.js';

export const LIGHT = {
  golden: { skyTop: '#4a6fae', skyHor: '#f2c48c', sunColor: '#ffd29a', sun: 2.7, hemi: 1.15, hemiSky: '#ffe2bd', hemiGround: '#9a7a52', fog: ['#efc999', 40, 190] },
  day: { skyTop: '#4f86cf', skyHor: '#e9e4d2', sunColor: '#fff1dc', sun: 2.7, hemi: 1.2, hemiSky: '#e8f0ff', hemiGround: '#9a8460', fog: ['#e6e1cf', 45, 200] },
  overcast: { skyTop: '#6a7486', skyHor: '#c9c6bc', sunColor: '#e8e2d6', sun: 1.7, hemi: 1.35, hemiSky: '#dfe4ea', hemiGround: '#8a8070', fog: ['#c7c3b8', 30, 140] },
  dusk: { skyTop: '#2b3558', skyHor: '#d9875a', sunColor: '#ffb27a', sun: 1.8, hemi: 0.95, hemiSky: '#ffc9a8', hemiGround: '#5a4a3a', fog: ['#c98a66', 30, 150] },
  night: { skyTop: '#070b18', skyHor: '#1c2640', sunColor: '#9fb4ff', sun: 0.5, hemi: 0.45, hemiSky: '#6c7fb0', hemiGround: '#2a2a33', fog: ['#141a2b', 15, 80] },
};

export function mxStage(light = 'day', ground = ['#d2b98d', '#c2a676'], extra = {}) {
  const L = LIGHT[light];
  return stage({ ...L, groundA: ground[0], groundB: ground[1], shadow: 16, sunPos: light === 'dusk' || light === 'golden' ? [-12, 7, 6] : [7, 14, 8], seed: 7, ...extra });
}

// Northern desert (Chihuahua / Sonora / Coahuila).
export function desert(light = 'golden', { clear = [], seed = 3, rail = null } = {}) {
  const s = mxStage(light, ['#d9bf8f', '#c8aa78'], { seed });
  s.add(X.sierra({ z: -120, depth: 50, height: 22, seed: seed + 2, base: '#8a6f6a', top: '#a88a80' }));
  s.add(X.sierra({ z: -85, depth: 30, height: 10, seed: seed + 5, base: '#a07a5e', top: '#b8926e' }));
  const keep = [...clear, ...(rail ? [[0, rail, 4]] : [])];
  const inRail = (z) => rail != null && Math.abs(z - rail) < 2.2;
  LP.scatter(s, (r, i) => [X.agave(0.8 + r() * 0.5, i), X.nopal(0.9 + r() * 0.5, i), X.shrub(0.7 + r() * 0.5, i, '#8a8a52'), X.mesquite(0.8 + r() * 0.4, i)][i % 4], 120, [-45, -45, 45, 30], seed + 11, keep);
  if (rail != null) s.add(LP.railway(140, 0, rail));
  return s;
}
// Morelos valley: sugar cane, a hacienda and Popocatépetl.
export function morelos(light = 'day', { cane = true, seed = 4 } = {}) {
  const s = mxStage(light, ['#8fa65a', '#7d9450'], { seed });
  s.add(X.sierra({ z: -120, depth: 50, height: 16, seed: seed + 2, base: '#6f7f7a', top: '#8a9a94' }));
  const v = X.volcano(30, 26); v.position.set(-30, 0, -100); s.add(v);
  const v2 = X.volcano(24, 22, true); v2.position.set(10, 0, -108); s.add(v2);
  if (cane) { s.add(X.field(-26, -14, -6, -4, { seed: 1 })); s.add(X.field(6, -16, 26, -5, { seed: 2 })); }
  LP.scatter(s, (r, i) => (i % 3 ? LP.roundTree(1.2 + r() * 0.5, '#5f8f3a', i) : X.mesquite(1.0 + r() * 0.4, i)), 60, [-60, -60, 60, -18], seed + 5);
  return s;
}
// Town plaza with adobe and colonial houses around an open square.
export function plaza(light = 'day', seed = 5) {
  const s = mxStage(light, ['#cdb48c', '#bfa47a'], { seed });
  const cols = ['#d9b48a', '#e2c9a2', '#c9967a', '#d6c08f', '#e0b9a0'];
  for (let i = 0; i < 7; i++) { const h = X.townhouse(3, 3 + (i % 2) * 0.6, cols[i % 5], i); h.position.set(-10.5 + i * 3.5, 0, -9); s.add(h); }
  for (let i = 0; i < 4; i++) { const h = X.adobe(3, 2.4, 2.2, cols[(i + 2) % 5], i); h.position.set(-12, 0, -4 + i * 3.2); h.rotation.y = Math.PI / 2; s.add(h); const h2 = X.adobe(3, 2.4, 2.2, cols[(i + 3) % 5], i + 9); h2.position.set(12, 0, -4 + i * 3.2); h2.rotation.y = -Math.PI / 2; s.add(h2); }
  const ch = new THREE.Group(); ch.add(LP.at(LP.box(4, 4.2, 4, '#e6d4b2'), 0, 2.1, 0)); ch.add(LP.at(LP.box(1.5, 2.6, 1.5, '#e6d4b2'), -1.2, 5.4, 1.2));
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.3, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), LP.mat('#c98a4a')); dome.position.set(0.6, 4.2, -0.6); ch.add(dome);
  ch.position.set(0, 0, -14); s.add(ch);
  return s;
}
// Mexico City Zócalo: Palacio Nacional, Cathedral and the square.
export function zocalo(light = 'day') {
  const s = mxStage(light, ['#c8bfae', '#bdb3a0'], { seed: 6 });
  const pal = X.palacio(); pal.position.set(0, 0, -16); s.add(pal); s.palacio = pal;
  const cat = X.cathedral(); cat.position.set(-17, 0, -6); cat.rotation.y = Math.PI / 2; s.add(cat);
  for (let i = 0; i < 4; i++) { const h = X.townhouse(3.4, 3.4, ['#c9967a', '#d6c08f', '#e0b9a0', '#cfa483'][i], i); h.position.set(17, 0, -10 + i * 4); h.rotation.y = -Math.PI / 2; s.add(h); }
  const f = X.flag('mx', 6, 2.4, 1.5); f.position.set(0, 0, 2); s.add(f); s.flag = f;
  return s;
}
// Interior room (palace office/hall or theatre).
export function interior({ wall = '#7a2f2a', floor = '#5a3a24', w = 12, d = 10, h = 4.2, lights = [[0, 3.6, 0]], windows = true, bulbs = true } = {}) {
  const s = new THREE.Scene();
  s.add(new THREE.HemisphereLight('#ffe7c4', '#3a2a1e', 0.9));
  const sun = new THREE.DirectionalLight('#ffe0b0', 1.4); sun.position.set(4, 8, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 0.5, far: 40 }); s.add(sun, sun.target);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color: floor, roughness: 0.6 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; s.add(fl);
  const wm = new THREE.MeshStandardMaterial({ color: wall, roughness: 0.9, side: THREE.DoubleSide });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wm); back.position.set(0, h / 2, -d / 2); back.receiveShadow = true; s.add(back);
  for (const sx of [-1, 1]) { const side = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wm); side.position.set(sx * w / 2, h / 2, 0); side.rotation.y = -sx * Math.PI / 2; s.add(side); }
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color: '#d9cbb0', side: THREE.DoubleSide })); ceil.rotation.x = Math.PI / 2; ceil.position.y = h; s.add(ceil);
  s.add(LP.at(LP.box(w, 0.25, 0.08, '#c9a227'), 0, h - 0.3, -d / 2 + 0.05)); s.add(LP.at(LP.box(w, 0.6, 0.06, '#3a2418'), 0, 0.3, -d / 2 + 0.04));
  if (windows) for (const x of [-w / 3, 0, w / 3]) { const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.2), new THREE.MeshBasicMaterial({ color: '#ffe9c4' })); win.position.set(x, 2.1, -d / 2 + 0.02); s.add(win);
    s.add(LP.at(LP.box(1.5, 0.12, 0.1, '#c9a227'), x, 3.25, -d / 2 + 0.06)); for (const k of [-0.75, 0.75]) s.add(LP.at(LP.box(0.35, 2.6, 0.08, '#8a1f2a'), x + k, 2.1, -d / 2 + 0.07)); }
  for (const [x, y, z] of lights) { const l = new THREE.PointLight('#ffd9a0', 6, 14, 1.4); l.position.set(x, y, z); s.add(l);
    if (!bulbs) continue;
    const ch = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), new THREE.MeshBasicMaterial({ color: '#fff0c8' })); ch.position.set(x, y + 0.25, z); s.add(ch); }
  s.background = new THREE.Color('#1a120c');
  s.userData = { sun, hemi: s.children[0], interior: true };
  return s;
}
// Port (Veracruz): water, pier, warehouses.
export function port(light = 'day') {
  const s = mxStage(light, ['#cbb79a', '#bba786'], { seed: 8 });
  const sea = new THREE.Mesh(new THREE.BoxGeometry(260, 0.4, 120), new THREE.MeshStandardMaterial({ color: '#4f8aa6', roughness: 0.25, metalness: 0.1 })); sea.position.set(0, 0.0, 62); s.add(sea);
  s.add(LP.at(LP.box(4, 0.5, 14, '#7a6450'), 3, 0.25, 8));
  for (let i = 0; i < 9; i++) s.add(LP.at(LP.cyl(0.12, 0.12, 1.2, '#5a4632', 6), 1.1 + (i % 2) * 3.8, 0.0, 2 + Math.floor(i / 2) * 3.2));
  for (let i = 0; i < 5; i++) { const h = X.townhouse(3.6, 3 + (i % 2), ['#e2c9a2', '#c9967a', '#d6c08f', '#e0b9a0', '#cfa483'][i], i); h.position.set(-14 + i * 4, 0, -8); s.add(h); }
  return s;
}
// Small US border town at night (Columbus, New Mexico).
export function columbusSet() {
  const s = mxStage('night', ['#8a7d66', '#7a6d58'], { seed: 9 });
  const names = ['HOTEL', 'GENERAL STORE', 'BANK', 'POST OFFICE'];
  names.forEach((n, i) => { const b = X.woodBuilding(3.2, 2.6 + (i % 2) * 0.5, ['#a88664', '#9a7a5a', '#b3926e', '#8f7356'][i], n); b.position.set(-6 + i * 4, 0, -6); s.add(b); });
  const wt = X.waterTower(); wt.position.set(10, 0, -9); s.add(wt);
  const f = X.flag('us', 4.5, 1.5, 0.95); f.position.set(-10, 0, -3); s.add(f); s.flag = f;
  const moon = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 12), new THREE.MeshBasicMaterial({ color: '#f3ecd6', fog: false })); moon.position.set(40, 45, -120); s.add(moon);
  const stars = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([...Array(600)].flatMap((_, i) => { const r = LP.rng(i)(), a = r * 6.28, b = LP.rng(i + 999)() * 1.2 + 0.15; return [Math.cos(a) * 300 * Math.cos(b), 300 * Math.sin(b), Math.sin(a) * 300 * Math.cos(b)]; }), 3)),
    new THREE.PointsMaterial({ color: '#ffffff', size: 1.4, sizeAttenuation: false, fog: false }));
  s.add(stars);
  return s;
}

export { aimSun, mood };
