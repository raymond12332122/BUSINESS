// Props for the Second World War video: London in the Blitz (searchlights, barrage balloons, St Paul's, Big Ben),
// aircraft and ships of 1939-45, and the memorial objects. Vehicles from the first WW2 video (ww2/kit.js) are reused.
import * as THREE from 'three';
import { mesh, box, cyl, at, rng } from '../lib/props.js';
import { canvasTex } from '../whatif/kit.js';
import * as OLD from '../ww2/kit.js';
export { OLD };
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });
const dyn = g => { g.userData.dynamic = true; return g; };
const shadowy = g => { g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return g; };
function lathe(profile, color, seg = 32, opts = {}) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg);
  return mesh(g, std(color, { side: THREE.DoubleSide, ...opts }));
}

// ------------------------------------------------------------ light and atmosphere
// Soft additive glow sprite (fires on the horizon, flashes, lamps).
const glowTex = (() => { let t = null; return () => t || (t = canvasTex(128, 128, (x, W, H) => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); })); })();
export function glow(color = '#ff7a2a', size = 10, opacity = 0.7) {
  const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  m.scale.setScalar(size); m.userData.dynamic = true; return m;
}
// Searchlight: a drum on a mount and a long soft beam; .aim(yaw, pitch) points it (radians, pitch up from the horizon).
export function searchlight({ len = 80, r1 = 4.2, color = '#d8e6ff', opacity = 0.42 } = {}) {
  const g = new THREE.Group(), yawG = new THREE.Group(), pitchG = new THREE.Group(); g.add(yawG); yawG.add(pitchG); yawG.position.y = 0.9;
  g.add(at(cyl(0.5, 0.6, 0.5, '#2a2c30', 12), 0, 0.25, 0)); pitchG.add(at(cyl(0.42, 0.42, 0.7, '#3a3c42', 16), 0, 0, 0, Math.PI / 2, 0, 0));
  pitchG.add(at(mesh(new THREE.CircleGeometry(0.38, 20), new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false })), 0, 0, 0.36));
  const tex = canvasTex(4, 128, (x, W, H) => { const gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.7, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,1)'); x.fillStyle = gr; x.fillRect(0, 0, W, H); });
  const geo = new THREE.CylinderGeometry(r1, 0.35, len, 24, 1, true); geo.translate(0, len / 2, 0); geo.rotateX(Math.PI / 2);
  const beam = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }));
  beam.position.z = 0.36; pitchG.add(beam); g.beam = beam;
  g.aim = (yaw, pitch) => { yawG.rotation.y = yaw; pitchG.rotation.x = -pitch; };
  g.aim(0, 0.8); return dyn(g);
}
// Barrage balloon on its cable; .bob(t) sways it.
export function balloon(h = 28, color = '#a8acb0') {
  const g = new THREE.Group(), bag = new THREE.Group(); bag.position.y = h; g.add(bag);
  const env = mesh(new THREE.SphereGeometry(1, 20, 14), std(color, { roughness: 0.6 })); env.scale.set(1.5, 1.5, 3.4); bag.add(env);
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + Math.PI / 2, f = mesh(new THREE.SphereGeometry(1, 12, 8), std(color, { roughness: 0.6 })); f.scale.set(0.12, 0.8, 0.9);
    f.position.set(Math.cos(a) * 1.1, Math.sin(a) * 1.1, -2.9); f.rotation.z = a - Math.PI / 2; bag.add(f); }
  const cable = mesh(new THREE.CylinderGeometry(0.02, 0.02, h, 4), std('#3a3a3e')); cable.position.y = h / 2; g.add(cable);
  g.bob = t => { bag.rotation.y = 0.3 * Math.sin(t * 0.13 + h); bag.position.y = h + 0.4 * Math.sin(t * 0.4 + h); };
  return dyn(g);
}
// Night stars on a dome.
export function stars(s, n = 600, R = 300, seed = 3) {
  const r = rng(seed), pos = []; for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, e = 0.08 + r() * 1.3; pos.push(Math.cos(a) * Math.cos(e) * R, Math.sin(e) * R, Math.sin(a) * Math.cos(e) * R); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ color: '#dfe6ff', size: 1.4, sizeAttenuation: false, transparent: true, opacity: 0.8, toneMapped: false })); s.add(p); return p;
}

// ------------------------------------------------------------ London
// St Paul's Cathedral: portico block, colonnaded drum, dome, lantern and cross.
export function stPauls(col = '#c9c2b4') {
  const g = new THREE.Group();
  g.add(at(box(22, 10, 12, col), 0, 5, 0)); g.add(at(box(12, 7, 22, col), 0, 3.5, 0));
  for (const x of [-9, 9]) { g.add(at(box(3.4, 9, 3.4, col), x, 13, 5)); g.add(at(lathe([[1.4, 0], [1.2, 2], [0.4, 3.4], [0, 3.8]], col), x, 17.5, 5)); }
  const drum = lathe([[6.2, 0], [6.2, 5], [5.6, 5.2], [5.6, 7]], col, 40); drum.position.y = 10; g.add(drum);
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; g.add(at(cyl(0.28, 0.28, 4.6, '#d8d2c4', 8), Math.cos(a) * 6.6, 12.4, Math.sin(a) * 6.6)); }
  g.add(at(lathe([[5.6, 0], [5.4, 2], [4.6, 4], [3.2, 5.6], [1.6, 6.5], [0, 6.8]], '#9aa0a4', 40, { roughness: 0.5, metalness: 0.3 }), 0, 17, 0));
  g.add(at(cyl(0.9, 1.1, 2.6, col, 12), 0, 24.6, 0)); g.add(at(lathe([[1.0, 0], [0.6, 0.9], [0, 1.2]], '#c9a227', 12, { metalness: 0.6, roughness: 0.3 }), 0, 25.9, 0));
  g.add(at(box(0.2, 1.4, 0.2, '#c9a227'), 0, 27.6, 0)); g.add(at(box(0.8, 0.2, 0.2, '#c9a227'), 0, 27.9, 0));
  return shadowy(g);
}
// Elizabeth Tower ("Big Ben"): square shaft, clock faces, belfry and a tall spire.
export function bigBen(col = '#c8b48a') {
  const g = new THREE.Group();
  g.add(at(box(4, 34, 4, col), 0, 17, 0)); g.add(at(box(4.6, 6, 4.6, col), 0, 37, 0));
  const face = canvasTex(128, 128, (x, W) => { x.fillStyle = '#f2ead2'; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); x.strokeStyle = '#2a2420'; x.lineWidth = 4; x.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; x.fillStyle = '#2a2420'; x.fillRect(64 + Math.cos(a) * 48 - 2, 64 + Math.sin(a) * 48 - 2, 5, 5); }
    x.lineWidth = 5; x.beginPath(); x.moveTo(64, 64); x.lineTo(64, 24); x.moveTo(64, 64); x.lineTo(92, 70); x.stroke(); });
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2, f = mesh(new THREE.CircleGeometry(1.8, 28), new THREE.MeshStandardMaterial({ map: face, emissive: '#f2d89a', emissiveIntensity: 0.25, roughness: 0.6 }));
    f.position.set(Math.sin(a) * 2.32, 37, Math.cos(a) * 2.32); f.rotation.y = a; g.add(f); }
  g.add(at(box(4.2, 4, 4.2, col), 0, 42, 0)); g.add(at(mesh(new THREE.ConeGeometry(3.1, 9, 4), std('#5a5e58', { roughness: 0.6 })), 0, 48.5, 0, 0, Math.PI / 4, 0));
  return shadowy(g);
}
// A brick terrace house block for London streets (blacked-out windows, chimney stacks).
export function terrace(w = 10, h = 9, d = 6, col = '#6a3a2e', seed = 0) {
  const g = new THREE.Group(), r = rng(seed + 7);
  g.add(at(box(w, h, d, col), 0, h / 2, 0));
  const tex = canvasTex(256, 256, (x, W, H) => { x.fillStyle = col; x.fillRect(0, 0, W, H); const cols = Math.max(2, Math.round(w / 2)), rows = 3;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const lit = r() > 0.93; x.fillStyle = lit ? '#e8b860' : '#14161c'; x.fillRect(i * W / cols + W / cols * 0.25, j * H / rows + H / rows * 0.2, W / cols * 0.5, H / rows * 0.55);
      x.strokeStyle = '#d8d0c0'; x.lineWidth = 3; x.strokeRect(i * W / cols + W / cols * 0.25, j * H / rows + H / rows * 0.2, W / cols * 0.5, H / rows * 0.55); } });
  const front = mesh(new THREE.PlaneGeometry(w * 0.96, h * 0.92), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.08 }));
  front.position.set(0, h * 0.48, d / 2 + 0.02); g.add(front);
  for (let i = 0; i < Math.round(w / 3); i++) { const x = -w / 2 + 1.5 + i * 3; g.add(at(box(0.8, 1.6, 0.8, '#5a3026'), x, h + 0.8, -d * 0.2)); for (const k of [-0.18, 0.18]) g.add(at(cyl(0.12, 0.12, 0.5, '#8a4a30', 6), x + k, h + 1.85, -d * 0.2)); }
  g.add(at(box(w + 0.3, 0.4, d + 0.3, '#4a2a22'), 0, h + 0.2, 0));
  return shadowy(g);
}
// Twin-engine bomber seen high overhead (the Blitz): reuses the first video's plane, dark grey.
export const bomber = (col = '#3a3e44') => dyn(OLD.plane(col, { kind: 'bomber' }));
export const fighter = (col = '#5a6a4a', mark = null) => dyn(OLD.plane(col, { kind: 'fighter', mark }));
