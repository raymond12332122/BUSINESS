// Props for the Second World War video: London in the Blitz (searchlights, barrage balloons, St Paul's, Big Ben),
// aircraft and ships of 1939-45, and the memorial objects. Vehicles from the first WW2 video (ww2/kit.js) are reused.
import * as THREE from 'three';
import { mesh, box, cyl, at, rng } from '../lib/props.js';
import { canvasTex } from '../whatif/kit.js';
import * as OLD from '../ww2/kit.js';
import { puffTex } from '../mx/props.js';
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
// Muzzle blast: white-hot core, orange halo and a few smoke puffs blown forward (+z) and up. .set(u), u = seconds since the shot.
export function muzzleBlast({ size = 1, smoke = '#cfc4b0' } = {}) {
  const g = new THREE.Group(), core = glow('#fff4d6', 1, 0), halo = glow('#ff9a3a', 1, 0); g.add(halo, core);
  const puffs = [0, 1, 2, 3].map(i => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex(), color: smoke, transparent: true, depthWrite: false, opacity: 0 })); m.material.rotation = i * 2.4; m.userData.dynamic = true; g.add(m); return m; });
  g.set = u => {
    const kf = u >= 0 && u < 0.12 ? 1 - u / 0.12 : 0;
    core.material.opacity = kf; core.scale.setScalar(size * (0.5 + 1.2 * kf));
    halo.material.opacity = 0.55 * kf; halo.scale.setScalar(size * (1.2 + 2.8 * kf));
    puffs.forEach((m, i) => { const k = u >= 0 ? Math.min(1, u / (1.2 + 0.25 * i)) : 1, e = 1 - (1 - k) * (1 - k);
      m.position.set((i - 1.5) * 0.18 * size * e, (0.1 + 0.35 * i) * size * e, (0.3 + 0.45 * i) * size * e);
      m.scale.setScalar(size * (0.35 + (1.1 + 0.3 * i) * e)); m.material.opacity = 0.7 * (1 - k) * Math.min(1, u * 25); });
    return kf;
  };
  g.set(9); g.userData.dynamic = true; return g;
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

// ------------------------------------------------------------ armour
// Tanks of 1939-45, built in metres and scaled into the chibi world (s = 0.55): the Panzer IV, the T-34 and the
// Sherman. Each has a closed track loop around its sprocket, idler and road wheels; .drive(d) (d = distance driven,
// world units) turns every wheel and runs the track links round the loop, so the bottom run stays put on the ground.
// .turret yaws (rotation.y), .gun pitches (rotation.x).
const metal = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.18, ...o });
const TRACK = '#2b2a28', LINK = '#4a4844', RUBBER = '#1e1e1e';
function decal(w, h, draw, res = 128) {
  const tex = canvasTex(res, Math.round(res * h / w), (x, W, H) => draw(x, W, H));
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.05, roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -2 }));
}
const MARKS = {
  de: () => decal(0.62, 0.62, (x, W) => { const a = W * 0.14, b = W * 0.5; x.fillStyle = '#f2f0ea'; x.fillRect(b - a - 10, 6, 2 * a + 20, W - 12); x.fillRect(6, b - a - 10, W - 12, 2 * a + 20);
    x.fillStyle = '#141414'; x.fillRect(b - a, 16, 2 * a, W - 32); x.fillRect(16, b - a, W - 32, 2 * a); }),
  su: (n = '214') => decal(0.9, 0.42, (x, W, H) => { x.fillStyle = '#f2f0ea'; x.font = `900 ${Math.round(H * 0.86)}px "DejaVu Sans"`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(n, W / 2, H / 2 + 4); }, 256),
  us: () => decal(0.9, 0.9, (x, W) => { const c = W / 2; x.strokeStyle = '#f2f0ea'; x.lineWidth = W * 0.06; x.beginPath(); x.arc(c, c, W * 0.44, 0, 7); x.stroke(); x.fillStyle = '#f2f0ea'; x.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? W * 0.16 : W * 0.4, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(c + r * Math.cos(a), c + r * Math.sin(a)); } x.closePath(); x.fill(); }),
};
// Closed loop through the wheels in the (z, y) plane, counter-clockwise: forward along the ground, up round the front
// wheel, back along the top, down round the rear wheel. Returns the inner outline and a sampler at arc length s.
function loopPath(front, rear, zb0, zb1, t) {
  const tangentIn = (P, [cz, cy, r]) => Math.atan2(P[1] - cy, P[0] - cz) + Math.acos(Math.min(1, r / Math.hypot(P[0] - cz, P[1] - cy)));
  const tangentOut = (Q, [cz, cy, r]) => Math.atan2(Q[1] - cy, Q[0] - cz) - Math.acos(Math.min(1, r / Math.hypot(Q[0] - cz, Q[1] - cy)));
  const arc = ([cz, cy, r], a0, a1, n = 10) => { while (a1 < a0) a1 += Math.PI * 2; return Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cz + r * Math.cos(a), cy + r * Math.sin(a)]; }); };
  const B0 = [zb0, t], B1 = [zb1, t], topR = [rear[0], rear[1] + rear[2]], topF = [front[0], front[1] + front[2]];
  const fa = arc(front, tangentIn(B1, front), tangentOut(topR, front)), ra = arc(rear, tangentIn(fa[fa.length - 1], rear), tangentOut(B0, rear));
  const pts = [B0, B1, ...fa, ...ra];
  const seg = pts.map((p, i) => { const q = pts[(i + 1) % pts.length]; return Math.hypot(q[0] - p[0], q[1] - p[1]); }), perim = seg.reduce((a, b) => a + b, 0);
  const at_ = s => { s = ((s % perim) + perim) % perim; let i = 0; while (s > seg[i]) { s -= seg[i]; i++; } const p = pts[i], q = pts[(i + 1) % pts.length], u = s / seg[i];
    const tz = (q[0] - p[0]) / seg[i], ty = (q[1] - p[1]) / seg[i]; return [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u, ty, -tz]; };   // point and outward normal
  return { pts, perim, at: at_ };
}
function trackSide(spec, x, t = 0.07) {
  const g = new THREE.Group(), lp = loopPath(spec.front, spec.rear, spec.zb0, spec.zb1, t);
  const out = lp.pts.map((p, i) => { const q = lp.pts[(i + 1) % lp.pts.length], o = lp.pts[(i - 1 + lp.pts.length) % lp.pts.length], tz = q[0] - o[0], ty = q[1] - o[1], l = Math.hypot(tz, ty) || 1; return [p[0] + ty / l * t, p[1] - tz / l * t]; });
  const sh = new THREE.Shape(out.map(([z, y]) => new THREE.Vector2(z, y))); sh.holes.push(new THREE.Path(lp.pts.map(([z, y]) => new THREE.Vector2(z, y))));
  const geo = new THREE.ExtrudeGeometry(sh, { depth: spec.trackW, bevelEnabled: false, curveSegments: 4 }); geo.rotateY(-Math.PI / 2); geo.translate(spec.trackW / 2, 0, 0);
  const band = new THREE.Mesh(geo, metal(TRACK, { roughness: 0.9 })); band.castShadow = true; band.receiveShadow = true; g.add(band);
  const pitch = 0.17, n = Math.floor(lp.perim / pitch), links = new THREE.InstancedMesh(new THREE.BoxGeometry(spec.trackW * 1.04, 0.04, 0.075), metal(LINK, { roughness: 0.6, metalness: 0.4 }), n);
  links.castShadow = true; g.add(links);
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e = new THREE.Euler(), p3 = new THREE.Vector3(), s3 = new THREE.Vector3(1, 1, 1), step = lp.perim / n;
  g.drive = d => { for (let i = 0; i < n; i++) { const [z, y, nz, ny] = lp.at(i * step - d); e.set(Math.atan2(nz, ny), 0, 0); q4.setFromEuler(e); p3.set(0, y + ny * (t + 0.012), z + nz * (t + 0.012)); m4.compose(p3, q4, s3); links.setMatrixAt(i, m4); } links.instanceMatrix.needsUpdate = true; };
  g.position.x = x; g.drive(0); return g;
}
function roadWheel(r, w, { rim = '#3a3c36', hub = '#5a5c54', tyre = true, spokes = 0, col } = {}) {
  const g = new THREE.Group(), m = new THREE.Group(); m.rotation.z = Math.PI / 2; g.add(m);
  m.add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 24), metal(tyre ? RUBBER : rim, { roughness: 0.9 })));
  m.add(at(new THREE.Mesh(new THREE.CylinderGeometry(r * 0.82, r * 0.82, w * 1.04, 24), metal(col || rim)), 0, 0, 0));
  m.add(at(new THREE.Mesh(new THREE.CylinderGeometry(r * 0.3, r * 0.3, w * 1.25, 12), metal(hub)), 0, 0, 0));
  for (let i = 0; i < spokes; i++) { const a = i / spokes * Math.PI * 2, s = new THREE.Mesh(new THREE.BoxGeometry(r * 0.16, w * 1.08, r * 0.5), metal(hub)); s.position.set(Math.cos(a) * r * 0.5, 0, Math.sin(a) * r * 0.5); s.rotation.y = -a; m.add(s); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.r = r; return g;
}
function profileSlab(profile, width, material) {
  const sh = new THREE.Shape(profile.map(([z, y]) => new THREE.Vector2(z, y)));
  const geo = new THREE.ExtrudeGeometry(sh, { depth: width, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025, bevelSegments: 1 }); geo.rotateY(-Math.PI / 2); geo.translate(width / 2, 0, 0);
  const m = new THREE.Mesh(geo, material); m.castShadow = true; m.receiveShadow = true; return m;
}
const TANK = {
  pz4: { col: '#53595c', s: 0.55, lowerW: 1.95, trackW: 0.4, mark: 'de',
    lower: [[2.25, 0.42], [2.8, 0.82], [2.8, 1.08], [2.2, 1.36], [2.15, 1.96], [-1.4, 1.96], [-1.5, 1.52], [-2.8, 1.47], [-2.85, 0.82], [-2.45, 0.42]],
    front: [2.48, 0.86, 0.36], rear: [-2.62, 0.78, 0.3], roads: { n: 8, r: 0.27, z0: -2.0, z1: 1.8 }, rollers: 4, fender: 1.5,
    turret: { z: 0.1, y: 1.96, seg: 6, r0: 0.98, r1: 0.8, h: 0.74, sz: 1.32, gun: 3.15, gr: 0.055, brake: true, mantlet: [0.62, 0.52, 0.22], cupola: [-0.18, -0.78] } },
  t34: { col: '#4d5a34', s: 0.55, lowerW: 1.9, trackW: 0.5, mark: 'su',
    lower: [[2.55, 0.42], [3.0, 1.02], [-2.95, 1.02], [-2.7, 0.42]],
    upper: [[3.0, 1.02], [1.85, 1.56], [-2.25, 1.56], [-2.95, 1.12], [-2.95, 1.02]], upperW: 2.95,
    front: [2.72, 0.6, 0.3], rear: [-2.76, 0.6, 0.3], roads: { n: 5, r: 0.41, z0: -2.0, z1: 2.0, spokes: 6 }, rollers: null,
    turret: { z: 0.95, y: 1.56, seg: 6, r0: 1.08, r1: 0.88, h: 0.72, sz: 1.22, gun: 3.0, gr: 0.06, brake: false, mantlet: [0.66, 0.46, 0.34], hatches: true } },
  sherman: { col: '#55593a', s: 0.55, lowerW: 1.8, trackW: 0.42, mark: 'us',
    lower: [[2.3, 0.45], [2.82, 0.9], [2.82, 1.24], [-2.8, 1.24], [-2.8, 0.7], [-2.5, 0.45]],
    upper: [[2.82, 1.24], [1.78, 2.02], [-2.05, 2.02], [-2.75, 1.78], [-2.8, 1.24]], upperW: 2.6,
    front: [2.6, 0.84, 0.32], rear: [-2.62, 0.7, 0.3], roads: { n: 6, r: 0.255, bogies: [-1.6, 0, 1.6], pair: 0.33 }, rollers: 'bogies',
    turret: { z: 0.2, y: 2.02, seg: 20, r0: 0.95, r1: 0.86, h: 0.72, sz: 1.2, gun: 2.55, gr: 0.058, brake: false, mantlet: [0.7, 0.5, 0.26], dome: true, mg: true } },
};
export function tank(kind = 'pz4', { col = null, number = '214' } = {}) {
  const sp = TANK[kind], c = col || sp.col, M_ = metal(c), dark = metal(new THREE.Color(c).multiplyScalar(0.62).getStyle());
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  body.add(profileSlab(sp.lower, sp.lowerW, M_));
  if (sp.upper) body.add(profileSlab(sp.upper, sp.upperW, M_));
  const half = sp.lowerW / 2 + sp.trackW / 2 + 0.02, top = Math.max(...(sp.upper || sp.lower).map(p => p[1]));
  if (sp.fender) for (const sx of [-1, 1]) body.add(at(new THREE.Mesh(new THREE.BoxGeometry(sp.trackW + 0.12, 0.04, 5.9), M_), sx * half, sp.fender, 0));
  // wheels and track on each side
  const wheels = [], roads = sp.roads, t = 0.07;
  const zs = roads.bogies ? roads.bogies.flatMap(z => [z - roads.pair, z + roads.pair]) : Array.from({ length: roads.n }, (_, i) => roads.z0 + (roads.z1 - roads.z0) * i / (roads.n - 1));
  const topRun = z => { const [fz, fy, fr] = sp.front, [rz, ry, rr] = sp.rear, u = (z - rz) / (fz - rz); return ry + rr + (fy + fr - ry - rr) * u; };   // inner surface of the top run
  const rollerZ = sp.rollers === 'bogies' ? roads.bogies : sp.rollers ? Array.from({ length: sp.rollers }, (_, i) => -1.6 + 3.2 * i / (sp.rollers - 1)) : [];
  const sides = [-1, 1].map(sx => {
    const x = sx * half, side = new THREE.Group(); body.add(side);
    for (const z of zs) { const w = roadWheel(roads.r, sp.trackW * 0.8, { spokes: roads.spokes || 0, col: roads.spokes ? c : null }); w.position.set(x, t + roads.r, z); side.add(w); wheels.push(w); }
    for (const [cz, cy, r] of [sp.front, sp.rear]) { const w = roadWheel(r, sp.trackW * 0.7, { tyre: false, spokes: 8, col: '#3a3a36' }); w.position.set(x, cy, cz); side.add(w); wheels.push(w); }
    for (const z of rollerZ) { const w = roadWheel(0.1, sp.trackW * 0.5, { tyre: true }); w.position.set(x, topRun(z) - 0.1, z); side.add(w); wheels.push(w); }
    if (roads.bogies) for (const z of roads.bogies) { const y0 = t + roads.r, y1 = topRun(z) - 0.16; side.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.16, y1 - y0, 0.5), dark), x - sx * 0.02, (y0 + y1) / 2, z)); }
    const tr = trackSide({ front: sp.front, rear: sp.rear, zb0: zs[0], zb1: zs[zs.length - 1], trackW: sp.trackW }, x, t); side.add(tr); return tr;
  });
  // hull details
  if (kind === 'pz4') {
    body.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.04), metal('#141414')), 0.5, 1.72, 2.18));                         // driver's visor
    body.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), M_), -0.48, 1.68, 2.17));                                        // hull MG ball
    body.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 6), metal('#1a1a1a')), -0.48, 1.68, 2.33, Math.PI / 2, 0, 0));
    for (let i = 0; i < 6; i++) body.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.05, 0.16), metal(LINK)), -0.75 + i * 0.3, 1.27, 2.43, -0.9, 0, 0));   // spare track links
    body.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.8, 14), dark), 0, 1.0, -2.95, 0, 0, Math.PI / 2));             // muffler
  }
  if (kind === 't34') {
    body.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.36, 0.06), M_), -0.42, 1.24, 2.43, -1.05, 0, 0));                           // driver's hatch on the glacis
    body.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), M_), 0.55, 1.22, 2.45));
    for (const sx of [-1, 1]) body.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.75, 14), dark), sx * 1.25, 1.24, -1.75, Math.PI / 2, 0, 0));   // fuel drums
  }
  if (kind === 'sherman') {
    for (const sx of [-1, 1]) body.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.3, 0.5), M_), sx * 0.52, 1.92, 1.82, -0.25, 0, 0));    // drivers' hoods
    for (const sx of [-1, 1]) body.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.12, 12), metal('#d8d4c0', { emissive: '#3a3420' })), sx * 1.0, 1.42, 2.62, Math.PI / 2, 0, 0));
    body.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), M_), 0.45, 1.6, 2.32));
  }
  // turret
  const T = sp.turret, tur = new THREE.Group(); tur.position.set(0, T.y, T.z); body.add(tur);
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(T.r1, T.r0, T.h, T.seg), M_); shell.rotation.y = T.seg === 6 ? Math.PI / 6 : 0; shell.scale.z = T.sz; shell.position.y = T.h / 2; shell.castShadow = true; tur.add(shell);
  if (T.dome) { const d = new THREE.Mesh(new THREE.SphereGeometry(T.r1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), M_); d.scale.set(1, 0.3, T.sz); d.position.y = T.h; d.castShadow = true; tur.add(d); }
  if (kind === 'pz4') { tur.add(at(new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 0.7), M_), 0, T.h * 0.55, -1.15)); }   // stowage bin
  if (T.cupola) { const cu = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.26, 16), M_); cu.position.set(T.cupola[0], T.h + 0.13, T.cupola[1]); tur.add(cu); }
  if (T.hatches) for (const sx of [-1, 1]) tur.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16), dark), sx * 0.4, T.h + 0.04, -0.2));
  if (T.mg) { tur.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 6), metal('#1a1a1a')), 0.45, T.h + 0.45, 0.25, Math.PI / 2 - 0.15, 0, 0)); tur.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.1, 16), dark), 0.45, T.h + 0.17, -0.25)); }
  const gun = new THREE.Group(); gun.position.set(0, T.h * 0.5, T.r0 * T.sz * 0.92); tur.add(gun);
  const [mw, mh, md] = T.mantlet; gun.add(at(new THREE.Mesh(kind === 't34' ? new THREE.CylinderGeometry(mh * 0.55, mh * 0.55, mw, 16) : new THREE.BoxGeometry(mw, mh, md), M_), 0, 0, md / 2, 0, 0, kind === 't34' ? Math.PI / 2 : 0));
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(T.gr, T.gr * 1.25, T.gun, 12), M_); barrel.rotation.x = Math.PI / 2; barrel.position.z = md + T.gun / 2; barrel.castShadow = true; gun.add(barrel);
  if (T.brake) { gun.add(at(new THREE.Mesh(new THREE.CylinderGeometry(T.gr * 1.9, T.gr * 1.9, 0.24, 12), dark), 0, 0, md + T.gun - 0.1, Math.PI / 2, 0, 0)); }
  gun.muzzle = new THREE.Object3D(); gun.muzzle.position.z = md + T.gun + 0.05; gun.add(gun.muzzle);
  // markings
  for (const sx of [-1, 1]) {
    const m = sp.mark === 'su' ? MARKS.su(number) : MARKS[sp.mark](); m.rotation.y = sx * Math.PI / 2;
    if (sp.mark === 'de') m.position.set(sx * (sp.lowerW / 2 + 0.03), 1.68, -0.6);
    else if (sp.mark === 'us') m.position.set(sx * (sp.upperW / 2 + 0.03), 1.62, -0.4);
    else m.position.set(sx * (T.r0 * 0.93 + 0.02), T.h * 0.55, 0);
    (sp.mark === 'su' ? tur : body).add(m);
  }
  if (sp.mark === 'us') { const m = MARKS.us(); m.scale.setScalar(0.7); m.rotation.x = -Math.PI / 2; m.position.set(0, T.h + (T.dome ? T.r1 * 0.3 : 0) + 0.02, -0.3); tur.add(m); }
  body.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  g.scale.setScalar(sp.s); g.body = body; g.turret = tur; g.gun = gun; g.wheels = wheels; g.kind = kind;
  g.drive = d => { const dm = d / sp.s; wheels.forEach(w => { w.rotation.x = dm / w.r; }); sides.forEach(s => s.drive(dm)); };
  // a little life when moving: the hull rocks on its suspension (v = speed 0..1)
  g.rock = (t, v = 1) => { body.position.y = 0.012 * v * Math.sin(t * 9.1) ; body.rotation.x = 0.006 * v * Math.sin(t * 6.3 + 1); };
  return dyn(g);
}

// ------------------------------------------------------------ aircraft
// Planes of 1939-45 from a few parameters (metres, nose toward +z, scaled by s): a lathed fuselage, tapered or
// elliptical wings (with an inverted gull for the Stuka), tail, engines with spinning propellers, canopy and markings.
// .spin(t) turns the propellers.
const glass = () => new THREE.MeshStandardMaterial({ color: '#9fc4d8', roughness: 0.08, metalness: 0.3, transparent: true, opacity: 0.55 });
function planform(span, root, tip, { sweep = 0, ellipse = false, n = 14 } = {}) {   // one half wing in (x = span, y = chord forward) from x = 0
  const pts = [];
  if (ellipse) { for (let i = 0; i <= n; i++) { const a = i / n * Math.PI / 2, x = Math.sin(a) * span, c = Math.cos(a) * root; pts.push([x, c * 0.42]); }
    for (let i = n; i >= 0; i--) { const a = i / n * Math.PI / 2, x = Math.sin(a) * span, c = Math.cos(a) * root; pts.push([x, -c * 0.58]); } }
  else pts.push([0, root * 0.4], [span, tip * 0.4 - sweep], [span + tip * 0.08, -sweep], [span, -tip * 0.6 - sweep], [0, -root * 0.6]);
  return pts;
}
function flatPart(pts, thick, material, mirror = false) {
  const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(mirror ? -x : x, y)));
  const geo = new THREE.ExtrudeGeometry(sh, { depth: thick, bevelEnabled: true, bevelThickness: thick * 0.35, bevelSize: thick * 0.4, bevelSegments: 2 }); geo.rotateX(Math.PI / 2); geo.translate(0, thick / 2, 0);
  const m = new THREE.Mesh(geo, material); m.castShadow = true; return m;
}
function prop(r, blades = 3, col = '#1e1e1e', spinner = '#2a2a2a') {
  const g = new THREE.Group(), hub = new THREE.Group(); g.add(hub);
  hub.add(at(new THREE.Mesh(new THREE.ConeGeometry(r * 0.16, r * 0.42, 16), metal(spinner)), 0, 0, r * 0.12, Math.PI / 2, 0, 0));
  for (let i = 0; i < blades; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(r * 0.14, r, r * 0.03), metal(col)); b.position.y = r / 2; const arm = new THREE.Group(); arm.rotation.z = i / blades * Math.PI * 2; b.rotation.y = 0.35; arm.add(b); hub.add(arm); }
  const disc = new THREE.Mesh(new THREE.CircleGeometry(r, 32), new THREE.MeshBasicMaterial({ color: '#2a2a2a', transparent: true, opacity: 0, depthWrite: false })); hub.add(disc);
  g.spin = (t, rpm = 22) => { hub.rotation.z = t * rpm; disc.material.opacity = rpm > 10 ? 0.16 : 0; }; return g;
}
const PLANES = {
  stuka: { s: 0.5, col: '#4a5640', under: '#9fb2c2', mark: 'de', len: 11.1, fus: [[-5.6, 0.12], [-4, 0.42], [-1, 0.62], [1.6, 0.66], [3.6, 0.62], [4.9, 0.55], [5.5, 0.3]], fh: 1.18,
    wing: { z: 1.3, y: -0.45, span: 6.9, root: 2.6, tip: 1.4, sweep: 0.15, gull: [2.0, -0.22, 0.2] }, tail: { z: -4.9, y: 0.25, span: 2.4, root: 1.4, tip: 0.8 }, fin: { z: -4.9, h: 1.5, root: 1.6, tip: 0.9 },
    nose: { r: 1.7, z: 5.6, blades: 3 }, canopy: { z: 0.9, len: 3.0, r: 0.42, y: 0.62 }, gear: 'spats', bomb: true },
  bf109: { s: 0.5, col: '#5a6458', under: '#a6b8c6', mark: 'de', len: 8.9, fus: [[-4.5, 0.1], [-3, 0.34], [0, 0.55], [2.2, 0.56], [3.8, 0.45], [4.4, 0.24]], fh: 1.12,
    wing: { z: 1.0, y: -0.35, span: 4.95, root: 2.2, tip: 1.0, sweep: 0.1, dihedral: 0.1 }, tail: { z: -3.9, y: 0.35, span: 1.6, root: 1.0, tip: 0.6 }, fin: { z: -3.9, h: 1.1, root: 1.1, tip: 0.6 },
    nose: { r: 1.5, z: 4.5, blades: 3 }, canopy: { z: 0.3, len: 1.8, r: 0.36, y: 0.5 } },
  spitfire: { s: 0.5, col: '#5e5a3c', under: '#c8d2b8', mark: 'uk', len: 9.1, fus: [[-4.6, 0.1], [-3, 0.32], [0, 0.55], [2.4, 0.55], [3.9, 0.42], [4.5, 0.2]], fh: 1.12,
    wing: { z: 1.0, y: -0.35, span: 5.6, root: 2.6, ellipse: true, dihedral: 0.1 }, tail: { z: -4.0, y: 0.3, span: 1.7, root: 1.1, ellipse: true }, fin: { z: -4.0, h: 1.2, root: 1.2, tip: 0.5 },
    nose: { r: 1.6, z: 4.6, blades: 3 }, canopy: { z: 0.1, len: 1.7, r: 0.36, y: 0.52 } },
  he111: { s: 0.5, col: '#4c5644', under: '#9fb2c2', mark: 'de', len: 16.4, fus: [[-8.2, 0.12], [-6, 0.6], [-1, 0.95], [4, 0.95], [6.8, 0.8], [8.0, 0.4]], fh: 1.15,
    wing: { z: 1.5, y: -0.3, span: 11.3, root: 4.6, tip: 1.8, sweep: 0.7, dihedral: 0.06 }, tail: { z: -7.3, y: 0.3, span: 3.6, root: 2.0, tip: 1.2 }, fin: { z: -7.3, h: 2.2, root: 2.2, tip: 1.2 },
    engines: [[-3.0, -0.15, 2.8], [3.0, -0.15, 2.8]], er: 1.7, glassNose: true },
  zero: { s: 0.5, col: '#b8b8a4', under: '#b8b8a4', mark: 'jp', len: 9.1, fus: [[-4.5, 0.1], [-3, 0.34], [0, 0.58], [2.4, 0.6], [3.9, 0.56], [4.5, 0.3]], fh: 1.08,
    wing: { z: 0.8, y: -0.4, span: 6.0, root: 2.6, tip: 1.2, sweep: 0.2, dihedral: 0.11 }, tail: { z: -3.9, y: 0.3, span: 1.8, root: 1.1, tip: 0.6 }, fin: { z: -4.0, h: 1.2, root: 1.2, tip: 0.6 },
    nose: { r: 1.45, z: 4.6, blades: 3, cowl: '#1c1c1c' }, canopy: { z: 0.1, len: 2.2, r: 0.36, y: 0.55 } },
  p47: { s: 0.5, col: '#59603f', under: '#9aa092', mark: 'us', len: 11.0, fus: [[-5.5, 0.12], [-3.6, 0.45], [0, 0.78], [2.8, 0.8], [4.6, 0.72], [5.4, 0.6]], fh: 1.18,
    wing: { z: 1.3, y: -0.45, span: 6.2, root: 2.9, ellipse: true, dihedral: 0.1 }, tail: { z: -4.7, y: 0.35, span: 2.2, root: 1.3, tip: 0.8 }, fin: { z: -4.8, h: 1.5, root: 1.6, tip: 0.8 },
    nose: { r: 1.85, z: 5.45, blades: 4, cowl: '#59603f' }, canopy: { z: 0.4, len: 2.0, r: 0.4, y: 0.75 } },
  sbd: { s: 0.5, col: '#5a6a7c', under: '#c8ccd0', mark: 'us', len: 10.1, fus: [[-5.0, 0.12], [-3.4, 0.42], [0, 0.66], [2.6, 0.7], [4.3, 0.64], [5.0, 0.5]], fh: 1.12,
    wing: { z: 1.0, y: -0.45, span: 6.2, root: 3.0, tip: 1.4, sweep: 0.15, dihedral: 0.09 }, tail: { z: -4.3, y: 0.3, span: 2.0, root: 1.3, tip: 0.8 }, fin: { z: -4.4, h: 1.4, root: 1.5, tip: 0.8 },
    nose: { r: 1.6, z: 5.05, blades: 3, cowl: '#5a6a7c' }, canopy: { z: -0.2, len: 3.0, r: 0.4, y: 0.62 } },
  b29: { s: 0.5, col: '#c8ccd0', under: '#c8ccd0', mark: 'us', metal: true, len: 30.2, fus: [[-15, 0.2], [-12, 1.2], [-6, 1.45], [8, 1.45], [12.5, 1.35], [14.6, 0.9], [15.1, 0.2]], fh: 1.0,
    wing: { z: 1.5, y: -0.2, span: 21.5, root: 5.8, tip: 1.6, sweep: 0.6, dihedral: 0.06 }, tail: { z: -13.4, y: 0.3, span: 6.0, root: 3.0, tip: 1.4 }, fin: { z: -13.6, h: 5.0, root: 4.6, tip: 1.8 },
    engines: [[-4.6, -0.1, 4.0], [-9.4, -0.1, 3.0], [4.6, -0.1, 4.0], [9.4, -0.1, 3.0]], er: 2.4, glassNose: true },
};
const PLANE_MARKS = {
  de: s => MARKS.de(), uk: s => decal(1, 1, (x, W) => [['#1f3f8f', 0.5], ['#f2f2f2', 0.33], ['#c8302a', 0.17]].forEach(([c, r]) => { x.fillStyle = c; x.beginPath(); x.arc(W / 2, W / 2, W * r - 2, 0, 7); x.fill(); })),
  jp: s => decal(1, 1, (x, W) => { x.fillStyle = '#f2f2f2'; x.beginPath(); x.arc(W / 2, W / 2, W * 0.5 - 2, 0, 7); x.fill(); x.fillStyle = '#c0242a'; x.beginPath(); x.arc(W / 2, W / 2, W * 0.42, 0, 7); x.fill(); }),
  us: s => decal(1.6, 0.8, (x, W, H) => { const c = W / 2, r = H * 0.47; x.fillStyle = '#f2f2f2'; x.fillRect(c - W * 0.46, H * 0.32, W * 0.92, H * 0.36); x.fillStyle = '#1f3a6a'; x.beginPath(); x.arc(c, H / 2, r, 0, 7); x.fill();
    x.fillStyle = '#f2f2f2'; x.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.38 : r * 0.92, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(c + rr * Math.cos(a), H / 2 + rr * Math.sin(a)); } x.closePath(); x.fill(); }, 256),
};
export function aircraft(kind = 'stuka', { col = null, mx = false } = {}) {
  const sp = PLANES[kind], g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const C = metal(col || sp.col, sp.metal ? { metalness: 0.75, roughness: 0.35 } : { roughness: 0.65 }), Und = metal(sp.under, sp.metal ? { metalness: 0.75, roughness: 0.35 } : { roughness: 0.65 }), dark = metal('#1c1c1c');
  // fuselage: lathe around the length axis, a little taller than wide
  const prof = [[sp.fus[0][0], 0], ...sp.fus, [sp.fus[sp.fus.length - 1][0], 0]];
  const rAt = z => { for (let i = 0; i + 1 < sp.fus.length; i++) { const [z0, r0] = sp.fus[i], [z1, r1] = sp.fus[i + 1]; if (z >= z0 && z <= z1) return r0 + (r1 - r0) * (z - z0) / (z1 - z0); } return sp.fus[0][1]; };
  const lat = new THREE.LatheGeometry(prof.map(([z, r]) => new THREE.Vector2(r, z)), 24); lat.rotateX(Math.PI / 2); lat.scale(1, sp.fh, 1);
  const fus = new THREE.Mesh(lat, C); fus.castShadow = true; body.add(fus);
  // wings (two halves; the Stuka's bend down then up at the gull)
  const W = sp.wing, half = sx => {
    const grp = new THREE.Group(); grp.position.set(0, W.y, W.z);
    if (W.gull) { const [gx, a1, a2] = W.gull, inner = planform(gx, W.root, W.root * 0.94), outer = planform(W.span - gx, W.root * 0.94, W.tip, { sweep: W.sweep });
      const a = flatPart(inner, 0.22, C, sx < 0); a.rotation.z = sx * a1; grp.add(a);
      const j = new THREE.Group(); j.position.set(sx * gx * Math.cos(a1), sx * gx * Math.sin(a1) * 1, 0); j.position.y = gx * Math.sin(a1); j.rotation.z = sx * a2; grp.add(j); j.add(flatPart(outer, 0.18, C, sx < 0)); }
    else { const p = flatPart(planform(W.span, W.root, W.tip, { sweep: W.sweep, ellipse: W.ellipse }), 0.2, C, sx < 0); p.rotation.z = sx * (W.dihedral || 0); grp.add(p); }
    body.add(grp); return grp; };
  const wl = half(1), wr = half(-1);
  const T = sp.tail; for (const sx of [1, -1]) { const p = flatPart(planform(T.span, T.root, T.tip || T.root * 0.5, { ellipse: T.ellipse }), 0.1, C, sx < 0); p.position.set(0, T.y, T.z); body.add(p); }
  const F = sp.fin, fin = new THREE.Shape([new THREE.Vector2(-F.root * 0.6, 0), new THREE.Vector2(F.root * 0.4, 0), new THREE.Vector2(F.tip * 0.2 - F.root * 0.15, F.h), new THREE.Vector2(-F.tip * 0.8 - F.root * 0.15, F.h)]);
  const fg = new THREE.ExtrudeGeometry(fin, { depth: 0.12, bevelEnabled: false }); fg.rotateY(-Math.PI / 2); fg.translate(0.06, 0, 0);
  const finM = new THREE.Mesh(fg, C); finM.position.set(0, 0.25, F.z); finM.castShadow = true; body.add(finM);
  // engines and propellers
  const props = [];
  if (sp.nose) { const N = sp.nose, cowl = new THREE.Mesh(new THREE.CylinderGeometry(sp.fus[sp.fus.length - 2][1] * 1.02, sp.fus[sp.fus.length - 3][1], 0.9, 24), metal(N.cowl || sp.col));
    cowl.rotation.x = Math.PI / 2; cowl.position.z = N.z - 0.7; cowl.scale.z = sp.fh; body.add(cowl); const p = prop(N.r, N.blades); p.position.z = N.z; body.add(p); props.push(p); }
  for (const [x, y, z] of sp.engines || []) { const n = new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 2.6, 6, 16), C); n.rotation.x = Math.PI / 2; n.position.set(x, W.y + y, z); body.add(n);
    const p = prop(sp.er, 3); p.position.set(x, W.y + y, z + 2.0); body.add(p); props.push(p); }
  // canopy / glazed nose
  if (sp.canopy) { const K_ = sp.canopy, c = new THREE.Mesh(new THREE.CapsuleGeometry(K_.r, K_.len, 6, 14), glass()); c.rotation.x = Math.PI / 2; c.scale.set(1, 1, 0.85); c.position.set(0, K_.y, K_.z); body.add(c); }
  if (sp.glassNose) { const z = sp.fus[sp.fus.length - 1][0], r = sp.fus[sp.fus.length - 2][1]; const n = new THREE.Mesh(new THREE.SphereGeometry(r * 0.95, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), glass()); n.rotation.x = Math.PI / 2; n.position.z = z - r * 0.7; body.add(n); }
  if (sp.gear === 'spats') for (const sx of [1, -1]) { const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 1.2, 4, 10), C); leg.scale.set(0.7, 1, 2.0); leg.position.set(sx * 2.0, -1.3, 1.7); leg.rotation.x = 0.15; body.add(leg);
    body.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.2, 14), dark), sx * 2.0, -1.95, 1.75, 0, 0, Math.PI / 2)); }
  if (sp.bomb) { const b = new THREE.Group(); b.add(new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 1.2, 4, 12), metal('#3a3a34'))); b.children[0].rotation.x = Math.PI / 2; b.position.set(0, -0.85, 1.0); body.add(b); g.bomb = b; }
  // markings on wings and fuselage sides
  const mk = PLANE_MARKS[sp.mark];
  if (mk) {
    const w = W.span, xs = 0.7 * w, ang = W.gull ? W.gull[2] : (W.dihedral || 0);
    const yTop = (W.gull ? W.gull[0] * Math.sin(W.gull[1]) + (xs - W.gull[0]) * Math.sin(W.gull[2]) : xs * Math.sin(ang)) + 0.2, chord = W.ellipse ? W.root * Math.cos(Math.asin(0.7)) : W.root + (W.tip - W.root) * 0.7;
    for (const sx of [1, -1]) { const m = mk(); m.scale.setScalar(Math.min(chord * 0.75, 1.6) * (sp.mark === 'us' ? 1.25 : 1)); m.rotation.set(-Math.PI / 2, 0, 0); const h = new THREE.Group(); h.rotation.z = sx * ang; h.add(m);
      h.position.set(sx * xs * Math.cos(ang), W.y + yTop, W.z - chord * 0.1 - (W.sweep || 0) * 0.7); body.add(h); }
    const zs = -sp.len * 0.22, rr = rAt(zs);
    for (const sx of [1, -1]) { const m = mk(); m.scale.setScalar(Math.min(rr * 1.5, 1.4) * (sp.mark === 'us' ? 1.2 : 1)); m.rotation.y = sx * Math.PI / 2; m.position.set(sx * (rr + 0.015), 0.0, zs); body.add(m); }
  }
  // the Mexican Expeditionary Air Force (Escuadrón 201): the tricolour triangle aft of the star, on both sides
  if (mx) { const zt = -sp.len * 0.36, rt = rAt(zt);
    for (const sx of [1, -1]) { const m = decal(1, 1, (x, W) => [['#1f7a3a', 0], ['#f2f2f2', 0.16], ['#c8302a', 0.32]].forEach(([c, k]) => { const p = W * k, h = W - 2 * p; x.fillStyle = c; x.beginPath(); x.moveTo(W / 2, 6 + p * 1.15); x.lineTo(W - 6 - p, W - 8 - p * 0.58); x.lineTo(6 + p, W - 8 - p * 0.58); x.closePath(); x.fill(); }));
      m.scale.setScalar(Math.min(rt * 1.7, 1.2)); m.rotation.y = sx * Math.PI / 2; m.position.set(sx * (rt + 0.016), 0.02, zt); body.add(m); } }
  body.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.scale.setScalar(sp.s); g.body = body; g.props = props; g.kind = kind;
  g.spin = (t, rpm = 24) => props.forEach((p, i) => p.spin(t + i * 0.37, rpm));
  return dyn(g);
}

// ------------------------------------------------------------ home front
// Cathedral-style wireless set (chibi scale): arched walnut cabinet, fretwork over the speaker cloth, a glowing dial.
// .glow(k) lights the dial.
export function radioSet() {
  const g = new THREE.Group(), wood = std('#5a3620', { roughness: 0.45 }), W = 0.3, H = 0.26, D = 0.16;
  g.add(at(new THREE.Mesh(new THREE.BoxGeometry(W, H, D), wood), 0, H / 2, 0));
  const arch = new THREE.Mesh(new THREE.CylinderGeometry(W / 2, W / 2, D, 24, 1, false, -Math.PI / 2, Math.PI), wood); arch.rotation.x = Math.PI / 2; arch.rotation.y = Math.PI / 2; arch.position.y = H; g.add(arch);
  const cloth = canvasTex(128, 160, (x, Wd, Hd) => { x.fillStyle = '#c8a878'; x.fillRect(0, 0, Wd, Hd); x.strokeStyle = '#3a2414'; x.lineWidth = 9;
    for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(14 + i * 25, Hd); x.quadraticCurveTo(Wd / 2, Hd * 0.1 + i * 6, Wd - 14 - i * 25, Hd); x.stroke(); } });
  const front = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.7, H * 0.95), new THREE.MeshStandardMaterial({ map: cloth, roughness: 0.9 })); front.position.set(0, H * 0.62, D / 2 + 0.002); g.add(front);
  const dialM = new THREE.MeshStandardMaterial({ color: '#f2d08a', emissive: '#ffb040', emissiveIntensity: 0.0, roughness: 0.4 });
  const dial = new THREE.Mesh(new THREE.CircleGeometry(0.035, 24), dialM); dial.position.set(0, 0.06, D / 2 + 0.003); g.add(dial);
  for (const x of [-0.09, 0.09]) g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 12), std('#2a1a10')), x, 0.05, D / 2 + 0.01, Math.PI / 2, 0, 0));
  const lamp = new THREE.PointLight('#ffb050', 0, 0.9, 1.6); lamp.position.set(0, 0.08, D / 2 + 0.08); g.add(lamp);
  g.glow = k => { dialM.emissiveIntensity = 1.6 * k; lamp.intensity = 0.6 * k; };
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
// Striped border barrier on its post; .open(k) swings the boom up (0 closed .. 1 open).
export function barrier(len = 3.8, h = 0.52) {
  const g = new THREE.Group();
  g.add(at(box(0.14, h + 0.12, 0.14, '#d8d2c4'), 0, (h + 0.12) / 2, 0)); g.add(at(box(0.12, h - 0.04, 0.12, '#d8d2c4'), len, (h - 0.04) / 2, 0));
  const tex = canvasTex(256, 16, (x, W, H) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#f2f0ea' : '#c8202a'; x.fillRect(i * W / 8, 0, W / 8, H); } });
  const boom = new THREE.Group(); boom.position.set(0, h, 0); g.add(boom); g.h = h;
  const bar = new THREE.Mesh(new THREE.BoxGeometry(len + 0.25, 0.08, 0.08), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 })); bar.position.x = (len + 0.25) / 2 - 0.25; boom.add(bar);
  boom.add(at(box(0.3, 0.14, 0.12, '#3a3a3a'), -0.3, 0, 0));   // counterweight
  g.open = k => { boom.rotation.z = 1.3 * k; }; g.boom = boom;
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return dyn(g);
}

// ------------------------------------------------------------ 1940: France, Dunkirk, the Battle of Britain
// A Dunkirk "little ship": pointed wooden hull, wheelhouse, short mast (chibi scale, ~3 long, bow toward +z). .bob(t).
export function smallBoat(col = '#3a5a7a', { cabin = true, trim = '#e8e2d4', seed = 0 } = {}) {
  const g = new THREE.Group(), hull = new THREE.Group(); g.add(hull);
  const L = 3.0, B = 1.0, sh = new THREE.Shape([[-B / 2, -L / 2], [B / 2, -L / 2], [B / 2, L * 0.15], [0, L / 2], [-B / 2, L * 0.15]].map(([x, z]) => new THREE.Vector2(x, z)));
  const hg = new THREE.ExtrudeGeometry(sh, { depth: 0.55, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.08, bevelSegments: 2 }); hg.rotateX(-Math.PI / 2); hg.translate(0, -0.2, 0);
  hull.add(new THREE.Mesh(hg, std(col, { roughness: 0.6 })));
  const dk = new THREE.ShapeGeometry(sh); dk.rotateX(-Math.PI / 2); hull.add(at(new THREE.Mesh(dk, std('#a88a62')), 0, 0.36, 0));
  const rail = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.05, bevelEnabled: false }), std(trim)); rail.geometry.rotateX(-Math.PI / 2); rail.position.y = 0.35; rail.scale.set(1.02, 1, 1.01); hull.add(rail);
  if (cabin) { hull.add(at(box(0.7, 0.5, 0.8, trim), 0, 0.6, -0.55)); hull.add(at(box(0.8, 0.06, 0.9, '#5a4a3a'), 0, 0.88, -0.55));
    for (const sx of [-1, 1]) hull.add(at(box(0.02, 0.18, 0.5, '#2a3440'), sx * 0.36, 0.68, -0.55)); hull.add(at(box(0.5, 0.18, 0.02, '#2a3440'), 0, 0.68, -0.14)); }
  hull.add(at(cyl(0.03, 0.035, 1.6, '#5a4a3a', 6), 0, 1.15, 0.45));
  hull.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  g.bob = t => { hull.position.y = 0.04 * Math.sin(t * 1.3 + seed); hull.rotation.z = 0.05 * Math.sin(t * 1.1 + seed * 2); hull.rotation.x = 0.03 * Math.sin(t * 0.9 + seed); };
  return dyn(g);
}
// Destroyer (offshore at Dunkirk): grey hull, bridge, two raked funnels, gun mounts (bow toward +z, ~24 long).
export function destroyer(col = '#7a828a') {
  const g = new THREE.Group(), L = 24, W = 2.6;
  const sh = new THREE.Shape(); sh.moveTo(-W / 2, -L / 2); sh.lineTo(W / 2, -L / 2); sh.lineTo(W / 2, L / 2 - 6); sh.quadraticCurveTo(W / 2, L / 2 - 1.5, 0, L / 2); sh.quadraticCurveTo(-W / 2, L / 2 - 1.5, -W / 2, L / 2 - 6); sh.closePath();
  const hg = new THREE.ExtrudeGeometry(sh, { depth: 1.6, bevelEnabled: false }); hg.rotateX(-Math.PI / 2); g.add(new THREE.Mesh(hg, std('#5a6068', { roughness: 0.6 })));
  const dk = new THREE.ShapeGeometry(sh); dk.rotateX(-Math.PI / 2); g.add(at(new THREE.Mesh(dk, std('#6a6a62')), 0, 1.61, 0));
  g.add(at(box(1.8, 1.4, 3.0, col), 0, 2.3, 4.5)); g.add(at(box(1.4, 0.8, 1.6, col), 0, 3.4, 4.8)); g.add(at(cyl(0.08, 0.1, 5, '#3a3f44', 6), 0, 5.5, 3.8));
  for (const z of [0.5, -2.8]) { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 2.6, 14), std(col)); f.position.set(0, 3.0, z); f.rotation.x = -0.15; g.add(f); g.add(at(cyl(0.58, 0.58, 0.25, '#1a1a1a', 14), 0, 4.3, z - 0.2)); }
  for (const z of [8.5, 6.6, -6.5, -9.0]) { const t = new THREE.Group(); t.position.set(0, 1.6, z); g.add(t); t.add(at(box(1.0, 0.6, 1.2, col), 0, 0.3, 0)); t.add(at(cyl(0.07, 0.07, 1.6, '#3a3f44', 6), 0, 0.35, z > 0 ? 1.2 : -1.2, Math.PI / 2, 0, 0)); }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
// Arc de Triomphe (scaled for the chibi Champs-Élysées): two great piers, the arch, the attic.
export function arcTriomphe(col = '#d8ccb4') {
  const g = new THREE.Group(), m = std(col, { roughness: 0.85 });
  for (const sx of [-1, 1]) { g.add(at(new THREE.Mesh(new THREE.BoxGeometry(4.6, 11, 7.2), m), sx * 5.0, 5.5, 0)); g.add(at(new THREE.Mesh(new THREE.BoxGeometry(4.0, 3.2, 0.12), std('#bfb39a')), sx * 5.0, 4.2, 3.62)); }
  g.add(at(new THREE.Mesh(new THREE.BoxGeometry(14.6, 4.5, 7.2), m), 0, 13.25, 0));
  const arch = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.7, 7.2, 24, 1, false, -Math.PI / 2, Math.PI), m); arch.rotation.x = Math.PI / 2; arch.rotation.z = Math.PI / 2; arch.position.y = 8.3; g.add(arch);
  g.add(at(new THREE.Mesh(new THREE.BoxGeometry(5.4, 2.7, 7.2), m), 0, 9.65, 0));
  g.add(at(new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.5, 7.8), std('#c8bca4')), 0, 15.5, 0)); g.add(at(new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.4, 7.8), std('#c8bca4')), 0, 11.1, 0));
  return shadowy(g);
}
// Maginot Line casemate: a concrete blockhouse half sunk in a grassy mound, with gun embrasures and a steel cupola.
export function casemate() {
  const g = new THREE.Group(), conc = std('#a8a498', { roughness: 0.95 });
  const mound = new THREE.Mesh(new THREE.SphereGeometry(6, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), std('#6e8a48', { roughness: 1 })); mound.scale.set(1.2, 0.32, 0.8); mound.position.z = -2.4; g.add(mound);
  g.add(at(new THREE.Mesh(new THREE.BoxGeometry(5.4, 1.9, 3.2), conc), 0, 0.95, 0.4));
  g.add(at(new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.35, 3.6), conc), 0, 2.0, 0.4));
  for (const x of [-1.4, 0.2, 1.6]) g.add(at(box(0.7, 0.26, 0.06, '#141414'), x, 1.15, 2.02));
  const cup = new THREE.Mesh(new THREE.SphereGeometry(0.75, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), std('#5a5e58', { roughness: 0.5, metalness: 0.4 })); cup.position.set(1.4, 2.15, 0.0); g.add(cup);
  for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + 0.4; g.add(at(box(0.18, 0.06, 0.04, '#141414'), 1.4 + Math.sin(a) * 0.62, 2.45, Math.cos(a) * 0.62, 0, a, 0)); }
  return shadowy(g);
}
// RAF operations room plotting table: a map of south-east England and the Channel, with raid counters.
export function plotTable(w = 3.6, d = 2.6) {
  const g = new THREE.Group();
  const tex = canvasTex(1024, 740, (x, W, H) => {
    x.fillStyle = '#9ec2d4'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#d8d0a8'; x.beginPath(); [[0, 0], [W, 0], [W, H * 0.32], [W * 0.86, H * 0.36], [W * 0.78, H * 0.48], [W * 0.62, H * 0.5], [W * 0.46, H * 0.55], [W * 0.3, H * 0.52], [W * 0.14, H * 0.58], [0, H * 0.6]].forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.fill();
    x.fillStyle = '#c8c0a0'; x.beginPath(); [[W * 0.5, H], [W * 0.62, H * 0.86], [W * 0.84, H * 0.8], [W, H * 0.74], [W, H]].forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.fill();
    x.strokeStyle = 'rgba(40,40,40,0.35)'; x.lineWidth = 2; for (let i = 0; i <= 12; i++) { x.beginPath(); x.moveTo(i * W / 12, 0); x.lineTo(i * W / 12, H); x.stroke(); } for (let j = 0; j <= 9; j++) { x.beginPath(); x.moveTo(0, j * H / 9); x.lineTo(W, j * H / 9); x.stroke(); }
    x.fillStyle = '#2a2a2a'; x.font = '700 30px "DejaVu Sans"'; x.fillText('LONDRES', W * 0.42, H * 0.22); x.fillText('CANAL DE LA MANCHA', W * 0.36, H * 0.68); x.fillText('FRANCIA', W * 0.7, H * 0.93);
  });
  g.add(at(box(w + 0.2, 0.36, d + 0.2, '#4a3a28'), 0, 0.18, 0));
  const top = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 })); top.rotation.x = -Math.PI / 2; top.position.y = 0.365; g.add(top); g.top = 0.365;
  g.counters = Array.from({ length: 9 }, (_, i) => { const c = new THREE.Group(); c.add(at(box(0.16, 0.05, 0.1, i < 5 ? '#c0392b' : '#2a4a8a'), 0, 0.025, 0)); c.add(at(box(0.04, 0.12, 0.04, '#e8e2d4'), 0.05, 0.08, 0)); c.userData.dynamic = true; g.add(c); return c; });
  return g;
}
export function rake(len = 0.7) { const g = new THREE.Group(); g.add(at(cyl(0.008, 0.008, len, '#8a6a3a', 6), 0, -len / 2, 0)); g.add(at(box(0.16, 0.02, 0.02, '#5a4a3a'), 0, -len, 0)); return dyn(g); }

// ------------------------------------------------------------ the Eastern Front
// Shell of a bombed apartment block: four walls with blown-out windows and a jagged top (alpha-cut canvas), no roof.
export function ruinBlock(w = 8, h = 9, d = 6, col = '#b9a48a', seed = 0) {
  const g = new THREE.Group(), r = rng(seed + 31);
  const wall = (len, hh, sd) => {
    const W = 256, H = Math.round(256 * hh / len), rr = rng(sd);
    const tex = canvasTex(W, H, (x) => {
      x.fillStyle = col; x.fillRect(0, 0, W, H);
      for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(40,30,24,${0.05 + rr() * 0.12})`; x.fillRect(rr() * W, rr() * H, 6 + rr() * 30, 4 + rr() * 20); }
      x.globalCompositeOperation = 'destination-out'; x.fillStyle = 'rgba(0,0,0,1)';
      const cols = Math.max(2, Math.round(len / 1.4)), rows = Math.max(2, Math.round(hh / 1.6));
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const cx = (i + 0.5) * W / cols, cy = (j + 0.45) * H / rows, ww = W / cols * (0.42 + rr() * 0.2), hh2 = H / rows * (0.5 + rr() * 0.15);
        x.beginPath(); x.rect(cx - ww / 2, cy - hh2 / 2, ww, hh2); if (rr() < 0.25) x.arc(cx + (rr() - 0.5) * ww, cy, ww * 0.9, 0, 7); x.fill(); }
      x.beginPath(); x.moveTo(0, 0); let y = H * (0.05 + rr() * 0.3); for (let s = 0; s <= 24; s++) { y = Math.max(0, Math.min(H * 0.6, y + (rr() - 0.5) * H * 0.18)); x.lineTo(s / 24 * W, y); } x.lineTo(W, 0); x.closePath(); x.fill();
      x.globalCompositeOperation = 'source-over';
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(len, hh), new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.95 }));
    m.castShadow = true; m.receiveShadow = true; return m;
  };
  for (const [len, x, z, ry] of [[w, 0, d / 2, 0], [w, 0, -d / 2, Math.PI], [d, w / 2, 0, Math.PI / 2], [d, -w / 2, 0, -Math.PI / 2]]) { const m = wall(len, h, seed * 7 + Math.round(x * 3 + z * 5)); m.position.set(x, h / 2, z); m.rotation.y = ry; g.add(m); }
  for (let f = 1; f < 3; f++) if (r() < 0.7) { const sl = box(w * (0.4 + r() * 0.5), 0.2, d * 0.9, '#8a7a68'); sl.position.set((r() - 0.5) * w * 0.3, f * h / 3.2, 0); sl.rotation.z = (r() - 0.5) * 0.5; g.add(sl); }
  return shadowy(g);
}
// Heap of rubble: broken masonry lumps and a few beams.
export function rubble(rad = 2.4, seed = 0, col = '#8a7a68') {
  const g = new THREE.Group(), r = rng(seed + 77);
  for (let i = 0; i < 26; i++) { const a = r() * Math.PI * 2, d = r() * rad, s = 0.2 + r() * 0.5 * (1 - d / rad * 0.6);
    const m = mesh(new THREE.DodecahedronGeometry(s, 0), new THREE.Color(col).offsetHSL(0, 0, (r() - 0.5) * 0.12).getStyle()); m.position.set(Math.cos(a) * d, s * 0.5, Math.sin(a) * d); m.rotation.set(r() * 3, r() * 3, r() * 3); m.scale.y = 0.6; g.add(m); }
  for (let i = 0; i < 4; i++) { const b = box(0.12, 0.12, 1.6 + r(), '#4a3a2a'); b.position.set((r() - 0.5) * rad, 0.4, (r() - 0.5) * rad); b.rotation.set(r() - 0.5, r() * 3, 0.4); g.add(b); }
  return shadowy(g);
}
// The Stalingrad grain elevator: tall concrete silos with a head house.
export function elevator() {
  const g = new THREE.Group(), c = '#a8a296';
  for (let i = 0; i < 6; i++) g.add(at(cyl(1.6, 1.6, 20, c, 18), -5 + i * 3.2, 10, 0));
  g.add(at(box(19, 20, 3, c), 0, 10, 0)); g.add(at(box(5, 9, 5, c), 9, 24.5, 0));
  for (let i = 0; i < 8; i++) g.add(at(box(1.2, 1.6, 0.1, '#1a1816'), -8 + i * 2.2, 14 + (i % 2) * 2, 1.56));
  return shadowy(g);
}
// A torn document (the pact): two halves along a jagged tear; .tear(k) pulls them apart (0 whole .. 1 apart).
export function tornDoc(title, lines, { w = 1.6, h = 2.1 } = {}) {
  const g = new THREE.Group(), tearX = j => 0.5 + 0.035 * Math.sin(j * 1.7) + 0.02 * Math.sin(j * 4.1);
  const draw = (x, W, H) => { x.fillStyle = '#efe6cf'; x.fillRect(0, 0, W, H); x.fillStyle = '#2a2420'; x.textAlign = 'center';
    x.font = '700 30px "DejaVu Serif"'; title.split('\n').forEach((t, i) => x.fillText(t, W / 2, 70 + i * 40));
    x.font = '22px "DejaVu Serif"'; x.textAlign = 'left'; for (let i = 0; i < 14; i++) x.fillRect(46, 190 + i * 30, W - 92 - (i % 3) * 40, 3);
    x.textAlign = 'center'; lines.forEach((t, i) => x.fillText(t, W / 2, H - 120 + i * 30));
    x.strokeStyle = '#1a2a6a'; x.lineWidth = 3; for (const sx of [0.28, 0.72]) { x.beginPath(); x.moveTo(W * sx - 60, H - 50); x.bezierCurveTo(W * sx - 20, H - 80, W * sx + 10, H - 20, W * sx + 60, H - 55); x.stroke(); } };
  const half = left => { const tex = canvasTex(512, 672, (x, W, H) => { draw(x, W, H); x.globalCompositeOperation = 'destination-out'; x.beginPath();
      if (left) { x.moveTo(W, 0); for (let j = 0; j <= 30; j++) x.lineTo(tearX(j) * W, j / 30 * H); x.lineTo(W, H); }
      else { x.moveTo(0, 0); for (let j = 0; j <= 30; j++) x.lineTo(tearX(j) * W, j / 30 * H); x.lineTo(0, H); }
      x.closePath(); x.fill(); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9 }));
    const piv = new THREE.Group(); piv.add(m); g.add(piv); return piv; };
  const L = half(true), R = half(false);
  g.tear = k => { L.position.set(-0.6 * k, -0.25 * k * k, 0.1 * k); L.rotation.set(0.2 * k, 0.5 * k, 0.35 * k); R.position.set(0.6 * k, -0.35 * k * k, 0.12 * k); R.rotation.set(-0.15 * k, -0.45 * k, -0.4 * k); };
  g.tear(0); return dyn(g);
}

// ------------------------------------------------------------ the Pacific
// Aircraft carrier (Akagi/Kaga style for Midway): long flight deck with markings, starboard island, hull; bow +z.
export function carrier(col = '#6a6e72', { japanese = true } = {}) {
  const g = new THREE.Group(), L = 46, W = 5.4;
  const sh = new THREE.Shape(); sh.moveTo(-W / 2, -L / 2); sh.lineTo(W / 2, -L / 2); sh.lineTo(W / 2, L / 2 - 8); sh.quadraticCurveTo(W / 2, L / 2 - 2, 0, L / 2); sh.quadraticCurveTo(-W / 2, L / 2 - 2, -W / 2, L / 2 - 8); sh.closePath();
  const hg = new THREE.ExtrudeGeometry(sh, { depth: 2.4, bevelEnabled: false }); hg.rotateX(-Math.PI / 2); g.add(new THREE.Mesh(hg, std('#4e5458', { roughness: 0.6 })));
  for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) g.add(at(cyl(0.12, 0.12, 0.8, '#3a3e42', 6), sx * (W / 2 - 0.2), 3.0, -L / 2 + 6 + i * 6));
  const deckTex = canvasTex(128, 1024, (x, Wd, H) => { x.fillStyle = japanese ? '#a88a62' : '#5a5e5a'; x.fillRect(0, 0, Wd, H); x.strokeStyle = 'rgba(40,30,20,0.25)'; x.lineWidth = 2; for (let i = 0; i < 64; i++) { x.beginPath(); x.moveTo(0, i * 16); x.lineTo(Wd, i * 16); x.stroke(); }
    x.fillStyle = '#f2f0ea'; x.fillRect(Wd / 2 - 2, 0, 4, H); if (japanese) { x.fillStyle = '#c0242a'; x.beginPath(); x.arc(Wd / 2, 120, 40, 0, 7); x.fill(); } });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(W + 1.2, 0.2, L + 2), [std('#6a5a44'), std('#6a5a44'), new THREE.MeshStandardMaterial({ map: deckTex, roughness: 0.85 }), std('#6a5a44'), std('#6a5a44'), std('#6a5a44')]);
  deck.position.y = 3.6; g.add(deck);
  for (const sx of [-1, 1]) for (let i = 0; i < 7; i++) g.add(at(box(0.18, 1.2, 0.18, '#4a4e52'), sx * (W / 2 + 0.3), 2.9, -L / 2 + 4 + i * 6.6));
  const isl = new THREE.Group(); isl.position.set(W / 2 - 0.2, 3.7, 3); g.add(isl);
  isl.add(at(box(1.2, 2.2, 3.2, col), 0, 1.1, 0)); isl.add(at(box(1.4, 0.9, 2.0, col), 0, 2.6, 0.3)); isl.add(at(cyl(0.08, 0.1, 3, '#3a3e42', 6), 0, 4.2, -0.4));
  const fun = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 1.8, 12), std('#3a3a3a')); fun.position.set(0.2, 1.4, -2.4); fun.rotation.z = -0.5; isl.add(fun);
  g.deckY = 3.7; g.L = L; g.W = W;
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
// A stretch of the Great Wall along a path of [x, z] points over the hills: wall, crenellations and watchtowers.
export function greatWall(pts, hAt = () => 0, col = '#b8a888') {
  const g = new THREE.Group(), m = std(col, { roughness: 0.95 }), dark = std('#8a7c64', { roughness: 0.95 });
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], y0 = hAt(x0, z0), y1 = hAt(x1, z1), len = Math.hypot(x1 - x0, z1 - z0), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, my = (y0 + y1) / 2;
    const seg = new THREE.Group(); seg.position.set(mx, my, mz); seg.rotation.y = Math.atan2(x1 - x0, z1 - z0); seg.rotation.x = -Math.atan2(y1 - y0, len); g.add(seg);
    seg.add(at(new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.0, len + 0.05), m), 0, 0.6, 0));
    for (let k = 0; k < Math.floor(len / 0.6); k++) for (const sx of [-0.62, 0.62]) seg.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.3, 0.3), dark), sx, 1.75, -len / 2 + 0.3 + k * 0.6));
    if (i % 3 === 0) { const tw = new THREE.Group(); tw.position.set(x0, y0, z0); g.add(tw); tw.add(at(new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.4, 2.4), m), 0, 1.3, 0));
      for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) tw.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), dark), a * 1.0, 3.2, b * 1.0));
      for (const sx of [-1, 1]) tw.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.3), std('#1a1814')), sx * 1.21, 2.0, 0)); }
  }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
// British 25-pounder field gun: shield, barrel on a cradle, two wheels, trail; .fire(k) recoils the barrel.
export function fieldGun(col = '#8a7c58') {
  const g = new THREE.Group(), m = metal(col), dark = metal('#2a2a26');
  const cradle = new THREE.Group(); cradle.position.set(0, 0.62, 0); cradle.rotation.x = -0.18; g.add(cradle);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.065, 1.5, 12), m); barrel.rotation.x = Math.PI / 2; barrel.position.z = 0.6; cradle.add(barrel);
  cradle.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.14, 12), dark), 0, 0, 1.38, Math.PI / 2, 0, 0));
  cradle.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.2, 0.7), m), 0, -0.05, 0.05));
  g.add(at(new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.62, 0.05), m), 0, 0.6, 0.35, -0.12, 0, 0));
  for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.12, 18), dark); w.rotation.z = Math.PI / 2; w.position.set(sx * 0.52, 0.33, 0.12); g.add(w); }
  g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 1.5), m), 0, 0.22, -0.7, 0.18, 0, 0));
  g.fire = k => { barrel.position.z = 0.6 - 0.18 * k; };
  g.muzzle = new THREE.Object3D(); g.muzzle.position.set(0, 0, 1.46); cradle.add(g.muzzle);
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return dyn(g);
}

// ------------------------------------------------------------ remembrance (the Holocaust is told without people being hurt)
// A memorial candle: .update(t, k, since): k = how lit (1 burning .. 0 out); since = seconds since it went out (a thin wisp rises).
export function memCandle(h = 0.32, { seed = 0, light = false, power = 1.2, col = '#efe8d8' } = {}) {
  const g = new THREE.Group();
  g.add(at(cyl(0.06, 0.065, h, col, 16), 0, h / 2, 0)); g.add(at(cyl(0.004, 0.004, 0.03, '#1a1a1a', 4), 0, h + 0.015, 0));
  const halo = glow('#ff9a40', 1, 0.3), flame = glow('#ffcf7a', 1, 1), core = glow('#fff6e0', 1, 1);
  halo.position.y = h + 0.06; flame.position.y = h + 0.075; core.position.y = h + 0.06; g.add(halo, flame, core);
  const pl = light ? new THREE.PointLight('#ffb766', 0, 5, 1.6) : null; if (pl) { pl.position.y = h + 0.18; g.add(pl); }
  const wisp = [0, 1, 2].map(i => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex(), color: '#c8c2b8', transparent: true, depthWrite: false, opacity: 0 })); m.material.rotation = i * 2.1; m.userData.dynamic = true; g.add(m); return m; });
  g.update = (t, k = 1, since = -1) => {
    const f = (0.88 + 0.12 * Math.sin(t * 13 + seed * 3) * Math.sin(t * 7.3 + seed)) * k;
    flame.scale.set(0.085 * f, 0.19 * f, 1); core.scale.set(0.035 * f, 0.08 * f, 1); halo.scale.setScalar(0.85 * f);
    flame.material.opacity = Math.min(1, k * 1.4); core.material.opacity = k; halo.material.opacity = 0.3 * k; flame.visible = core.visible = halo.visible = k > 0.01;
    if (pl) pl.intensity = power * f;
    wisp.forEach((m, i) => { const u = since >= 0 ? (since - i * 0.25) / 2.2 : -1, on = u > 0 && u < 1;
      m.visible = on; if (!on) return; m.position.set(0.05 * Math.sin(u * 6 + i * 2), h + 0.05 + u * 0.75, 0.03 * Math.cos(u * 5 + i)); m.scale.set(0.03 + 0.1 * u, 0.06 + 0.2 * u, 1); m.material.opacity = 0.32 * (1 - u) * Math.min(1, u * 8); });
  };
  g.update(0); g.userData.dynamic = true; return g;
}
// A closed wooden freight wagon (the deportation trains), standing on a track; facing +z along its length.
export function boxcar(col = '#5e3a2c') {
  const g = new THREE.Group(), L = 5.2, W = 1.7, H = 1.9, y0 = 0.62;
  const tex = canvasTex(256, 128, (x, w, h) => { x.fillStyle = col; x.fillRect(0, 0, w, h); for (let i = 0; i < 26; i++) { x.fillStyle = `rgba(0,0,0,${0.12 + (i * 37 % 10) / 60})`; x.fillRect(i * w / 26, 0, 2, h); }
    x.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 40; i++) x.fillRect((i * 53) % w, (i * 29) % h, 6, 1); });
  const body = mesh(new THREE.BoxGeometry(W, H, L), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 })); body.position.y = y0 + H / 2; g.add(body);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, L + 0.1, 24, 1, true, -0.55, 1.1), new THREE.MeshStandardMaterial({ color: '#3a3430', roughness: 0.8, side: THREE.DoubleSide }));
  roof.rotation.x = -Math.PI / 2; roof.position.y = y0 + H - 1.6 * Math.cos(0.55) + 0.02; g.add(roof);   // axis along z, the arc on top
  const gab = new THREE.Shape(); for (let i = 0; i <= 12; i++) { const u = -0.55 + 1.1 * i / 12; gab[i ? 'lineTo' : 'moveTo'](1.6 * Math.sin(u), 1.6 * Math.cos(u) - 1.6 * Math.cos(0.55)); }
  for (const z of [L / 2, -L / 2]) { const e = new THREE.Mesh(new THREE.ShapeGeometry(gab, 12), new THREE.MeshStandardMaterial({ color: col, roughness: 0.9, side: THREE.DoubleSide })); e.position.set(0, y0 + H + 0.02, z); g.add(e); }   // the curved tops of the end walls
  for (const sx of [-1, 1]) {
    g.add(at(box(0.04, H * 0.86, 1.5, '#4e3024'), sx * (W / 2 + 0.02), y0 + H * 0.46, 0.2));   // the sliding door
    g.add(at(box(0.05, 0.05, 2.0, '#2a2622'), sx * (W / 2 + 0.05), y0 + H * 0.9, 0.2));         // its rail
    const win = at(box(0.03, 0.2, 0.36, '#0e0c0a'), sx * (W / 2 + 0.03), y0 + H * 0.8, -L / 2 + 0.5); g.add(win);  // the small barred vent
    for (let i = 0; i < 3; i++) g.add(at(box(0.04, 0.22, 0.02, '#4a4a4a'), sx * (W / 2 + 0.05), y0 + H * 0.8, -L / 2 + 0.38 + i * 0.12));
  }
  g.add(at(box(W + 0.1, 0.16, L + 0.3, '#1e1c1a'), 0, y0 - 0.06, 0));
  for (const z of [-L / 2 + 0.9, L / 2 - 0.9]) for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.1, 18), std('#2a2826')); w.rotation.z = Math.PI / 2; w.position.set(sx * 0.53, 0.36, z); g.add(w); }
  for (const z of [-L / 2 - 0.2, L / 2 + 0.2]) for (const sx of [-1, 1]) g.add(at(cyl(0.09, 0.09, 0.18, '#2a2826', 10), sx * 0.6, y0 + 0.05, z, Math.PI / 2, 0, 0));   // buffers
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
// The Birkenau gatehouse: long low brick wings, the central tower with its hipped roof, the arch the railway runs through.
export function gatehouse() {
  const g = new THREE.Group(), bt = canvasTex(256, 128, (x, W, H) => { x.fillStyle = '#4a2c22'; x.fillRect(0, 0, W, H); for (let j = 0; j < 16; j++) for (let i = -1; i < 17; i++) { const v = 0.85 + ((i * 7 + j * 13) % 9) / 40; x.fillStyle = `rgb(${120 * v | 0},${70 * v | 0},${54 * v | 0})`; x.fillRect(i * 16 + (j % 2) * 8 + 1, j * 8 + 1, 14, 6); } });
  bt.wrapS = bt.wrapT = THREE.RepeatWrapping;
  const brick = (w, h, d, rx, ry) => { const t = bt.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 })); };
  const roofM = std('#2e2a28', { roughness: 0.85 }), dark = new THREE.MeshBasicMaterial({ color: '#0a0908' });
  for (const sx of [-1, 1]) {
    const w = brick(34, 4.2, 6, 14, 2); w.position.set(sx * (2.7 + 17), 2.1, 0); g.add(w);
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(34, 1.4, 4.4), roofM); ridge.position.set(sx * (2.7 + 17), 4.2 + 0.55, 0); g.add(ridge);
    for (let i = 0; i < 11; i++) { const win = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.9), dark); win.position.set(sx * (5 + i * 3), 2.6, 3.01); g.add(win); }
  }
  const tw = brick(5.6, 10, 6.8, 3, 5); tw.position.set(0, 5, 0); g.add(tw);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 4.4, 2.6, 4, 1), roofM); cap.rotation.y = Math.PI / 4; cap.scale.set(1, 1, 1.15); cap.position.y = 11.3; g.add(cap);
  const hut = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.0, 3.6), std('#d8d2c4', { roughness: 0.8 })); hut.position.y = 10.2; g.add(hut);   // the watch room: a band of windows under the roof
  for (const [x, z, ry] of [[0, 1.81, 0], [0, -1.81, Math.PI], [1.81, 0, Math.PI / 2], [-1.81, 0, -Math.PI / 2]]) for (let i = -1; i <= 1; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), dark); p.position.set(x + (ry === 0 || ry === Math.PI ? i * 1.05 : 0), 10.2, z + (ry === 0 || ry === Math.PI ? 0 : i * 1.05)); p.rotation.y = ry; g.add(p); }
  const sh = new THREE.Shape(); sh.moveTo(-1.5, 0); sh.lineTo(1.5, 0); sh.lineTo(1.5, 2.6); sh.absarc(0, 2.6, 1.5, 0, Math.PI, false); sh.lineTo(-1.5, 0);
  for (const z of [3.42, -3.42]) { const arch = new THREE.Mesh(new THREE.ShapeGeometry(sh, 16), dark); arch.position.set(0, 0, z); if (z < 0) arch.rotation.y = Math.PI; g.add(arch); }
  g.traverse(o => { if (o.isMesh && !o.material.isMeshBasicMaterial) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
// Anne Frank's diary (the red-and-white checked autograph book): open = pages spread for writing, closed = the book alone.
export function diary(open = false) {
  const g = new THREE.Group();
  const ck = canvasTex(64, 64, (x, W, H) => { x.fillStyle = '#f0e8d8'; x.fillRect(0, 0, W, H); x.fillStyle = 'rgba(184,52,47,0.85)'; for (let i = 0; i < 8; i += 2) { x.fillRect(i * 8, 0, 8, H); x.fillRect(0, i * 8, W, 8); } x.fillStyle = 'rgba(60,20,16,0.35)'; for (let i = 0; i < 8; i++) x.fillRect(i * 8 + 3, 0, 1, H); });
  const coverM = new THREE.MeshStandardMaterial({ map: ck, roughness: 0.8 });
  if (!open) { const b = mesh(new THREE.BoxGeometry(0.11, 0.024, 0.14), [std('#e8e0cc'), std('#e8e0cc'), coverM, std('#7a2a24'), std('#e8e0cc'), std('#e8e0cc')]); b.position.y = 0.012; g.add(b); return g; }
  const pg = canvasTex(64, 80, (x, W, H) => { x.fillStyle = '#f6f0e2'; x.fillRect(0, 0, W, H); x.strokeStyle = 'rgba(40,40,80,0.55)'; x.lineWidth = 1; for (let j = 8; j < H - 6; j += 5) { x.beginPath(); x.moveTo(6, j); for (let i = 6; i < W - 6; i += 3) x.lineTo(i, j + Math.sin(i * 1.7 + j) * 0.8); x.stroke(); } });
  g.add(at(mesh(new THREE.BoxGeometry(0.23, 0.004, 0.145), coverM), 0, 0.002, 0));
  for (const sx of [-1, 1]) { const p = mesh(new THREE.BoxGeometry(0.105, 0.012, 0.135), [std('#efe8d8'), std('#efe8d8'), new THREE.MeshStandardMaterial({ map: pg, roughness: 0.9 }), std('#efe8d8'), std('#efe8d8'), std('#efe8d8')]); p.position.set(sx * 0.056, 0.01, 0); p.rotation.z = -sx * 0.04; g.add(p); }
  return g;
}
// What Anne saw from the attic: the chestnut tree, the gables of the canal houses, a pale sky (a canvas for a window).
export function annexView() {
  return canvasTex(256, 256, (x, W, H) => {
    const sky = x.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#9fb8cc'); sky.addColorStop(1, '#dfe6e8'); x.fillStyle = sky; x.fillRect(0, 0, W, H);
    x.fillStyle = '#5a4a44'; for (let i = 0; i < 6; i++) { const bx = i * 46 - 10, bh = 70 + (i * 37 % 40); x.beginPath(); x.moveTo(bx, H); x.lineTo(bx, H - bh); x.lineTo(bx + 20, H - bh - 26); x.lineTo(bx + 40, H - bh); x.lineTo(bx + 40, H); x.fill(); }
    x.fillStyle = '#3a2e26'; x.fillRect(58, 120, 16, 136);
    for (const [cx, cy, r] of [[66, 96, 58], [30, 120, 40], [104, 112, 44], [70, 52, 42]]) { const gr = x.createRadialGradient(cx - 10, cy - 12, 4, cx, cy, r); gr.addColorStop(0, '#7a9a5a'); gr.addColorStop(1, '#3e5a32'); x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); }
  });
}

// ------------------------------------------------------------ the home front, the Night Witches, the codebreakers, the science
const redStar = (s = 0.4) => decal(s, s, (x, W) => { x.fillStyle = '#c8302a'; x.strokeStyle = '#f2f0ea'; x.lineWidth = W * 0.05; x.beginPath();
  for (let i = 0; i < 10; i++) { const r = i % 2 ? W * 0.19 : W * 0.46, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(W / 2 + r * Math.cos(a), W / 2 + r * Math.sin(a)); } x.closePath(); x.stroke(); x.fill(); });
// The Polikarpov Po-2 biplane of the Night Witches, at chibi scale (two open cockpits a seated chibi fits: front at z = 0.42,
// rear at z = -0.38, seat height 0 = the fuselage axis). Nose toward +z. .spin(t, rpm), .bombs (two small bombs under the wings).
export function biplane({ col = '#4a5a3a', under = '#9fb0b8' } = {}) {
  const g = new THREE.Group(), C = metal(col, { roughness: 0.8, metalness: 0.05 }), Un = metal(under, { roughness: 0.8, metalness: 0.05 }), dark = metal('#1c1c1c'), wood = metal('#8a6a40', { roughness: 0.6 });
  const prof = [[-2.1, 0.0], [-2.1, 0.05], [-1.3, 0.18], [-0.4, 0.29], [0.6, 0.31], [1.4, 0.3], [1.85, 0.27], [1.95, 0.0]];
  const lat = new THREE.LatheGeometry(prof.map(([z, r]) => new THREE.Vector2(r, z)), 18); lat.rotateX(Math.PI / 2); lat.scale(1, 1.15, 1);
  g.add(mesh(lat, C));
  for (const z of [0.42, -0.38]) { const rim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 6, 20), dark); rim.rotation.x = Math.PI / 2; rim.scale.set(1, 1.25, 1); rim.position.set(0, 0.33, z); g.add(rim); }
  g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.02), new THREE.MeshStandardMaterial({ color: '#cfe0e8', transparent: true, opacity: 0.45, roughness: 0.1 })), 0, 0.42, 0.66, -0.4, 0, 0));   // little windscreen
  const wing = (span, chord, y, z) => { const w = new THREE.Group(); w.position.set(0, y, z);
    const top = new THREE.Mesh(new THREE.BoxGeometry(span, 0.05, chord), [C, C, C, Un, C, C]); w.add(top);
    for (const sx of [-1, 1]) w.add(at(new THREE.Mesh(new THREE.CylinderGeometry(chord / 2, chord / 2, 0.05, 14, 1, false, 0, Math.PI), [C, C, Un]), sx * span / 2, 0, 0, 0, 0, 0));
    w.children.slice(1).forEach((m, i) => { m.rotation.set(0, i ? 0 : Math.PI, 0); });
    return w; };
  const up = wing(5.4, 0.68, 0.86, 1.12), lo = wing(4.9, 0.62, -0.3, 1.02); g.add(up, lo);
  for (const sx of [-1, 1]) {
    for (const dz of [-0.24, 0.24]) g.add(at(cyl(0.018, 0.018, 1.16, '#3a3a34', 6), sx * 1.75, 0.28, 1.08 + dz));                 // interplane struts
    g.add(at(cyl(0.016, 0.016, 0.62, '#3a3a34', 6), sx * 0.24, 0.58, 1.2, 0, 0, -sx * 0.25));                                     // cabane struts
    const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 16), dark); wh.rotation.z = Math.PI / 2; wh.position.set(sx * 0.42, -0.62, 1.3); g.add(wh);
    g.add(at(cyl(0.015, 0.015, 0.5, '#2a2a28', 5), sx * 0.3, -0.42, 1.3, 0, 0, sx * 0.55));
    const st = redStar(0.36); st.position.set(sx * 0.215, 0.05, -1.25); st.rotation.y = sx * Math.PI / 2; st.rotation.x = 0; g.add(st);
  }
  g.add(at(box(1.7, 0.03, 0.42, col), 0, 0.06, -1.88)); const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.lineTo(0.5, 0); fin.lineTo(0.22, 0.56); fin.lineTo(0, 0.56); fin.closePath();
  const fm = new THREE.Mesh(new THREE.ExtrudeGeometry(fin, { depth: 0.03, bevelEnabled: false }), C); fm.rotation.y = -Math.PI / 2; fm.position.set(0.015, 0.06, -2.15); g.add(fm);
  const rs = redStar(0.3); rs.position.set(0.035, 0.3, -1.98); rs.rotation.y = Math.PI / 2; g.add(rs); const rs2 = redStar(0.3); rs2.position.set(-0.035, 0.3, -1.98); rs2.rotation.y = -Math.PI / 2; g.add(rs2);
  const eng = new THREE.Group(); eng.position.z = 1.92; g.add(eng); eng.add(at(cyl(0.12, 0.12, 0.12, '#2a2a2a', 14), 0, 0, 0, Math.PI / 2, 0, 0));
  for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5, c = at(cyl(0.05, 0.05, 0.2, '#3a3a3a', 8), Math.sin(a) * 0.17, Math.cos(a) * 0.17, 0, 0, 0, -a); eng.add(c); }
  const hub = new THREE.Group(); hub.position.z = 2.05; g.add(hub); hub.add(at(cyl(0.05, 0.05, 0.08, '#2a2a2a', 10), 0, 0, 0, Math.PI / 2, 0, 0));
  for (const sx of [-1, 1]) hub.add(at(box(0.07, 0.68, 0.025, '#6a4a2a'), 0, sx * 0.36, 0, 0, sx * 0.3, 0));
  hub.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.72, 24), new THREE.MeshBasicMaterial({ color: '#b8b0a0', transparent: true, opacity: 0, depthWrite: false })), 0, 0, 0.02)); const disc = hub.children[hub.children.length - 1];
  g.bombs = [-0.75, 0.75].map(x => { const b = new THREE.Group(); b.add(at(cyl(0.05, 0.05, 0.3, '#3a3a36', 10), 0, 0, 0, Math.PI / 2, 0, 0)); b.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 6), dark), 0, 0, 0.15));
    b.add(at(box(0.14, 0.012, 0.06, '#2a2a28'), 0, 0, -0.17)); b.add(at(box(0.012, 0.14, 0.06, '#2a2a28'), 0, 0, -0.17)); b.position.set(x, -0.4, 1.0); b.home = b.position.clone(); g.add(b); return b; });
  g.spin = (t, rpm = 24) => { hub.rotation.z = t * rpm; disc.material.opacity = rpm > 10 ? 0.16 : 0; };
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return dyn(g);
}
// The Turing–Welchman "bombe": a tall cabinet with three banks of twelve coloured drums that turn. Front at +z. .spin(t).
export function bombe() {
  const g = new THREE.Group(), W = 1.45, H = 1.38, D = 0.48;
  g.add(at(box(W, H, D, '#2c2c2e'), 0, H / 2 + 0.06, 0)); g.add(at(box(W + 0.06, 0.06, D + 0.06, '#1a1a1c'), 0, 0.03, 0));
  g.add(at(box(W - 0.06, 0.18, 0.02, '#4a4a4c'), 0, H - 0.05, D / 2 + 0.01));
  const cols = ['#d8d4c8', '#b8342f', '#2f6a9a', '#2f7a4a', '#c9a227', '#8a5aa8'];
  g.drums = [];
  for (let row = 0; row < 3; row++) for (let i = 0; i < 12; i++) {
    const d = new THREE.Group(); d.position.set(-W / 2 + 0.1 + i * (W - 0.2) / 11, 0.34 + row * 0.33, D / 2 + 0.03); g.add(d);
    d.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.05, 18), std(cols[(i + row * 2) % 6], { roughness: 0.45 })), 0, 0, 0, Math.PI / 2, 0, 0));
    d.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.056, 10), std('#1a1a1a')), 0, 0, 0, Math.PI / 2, 0, 0));
    d.add(at(box(0.012, 0.03, 0.006, '#f4f0e6'), 0, 0.034, 0.028)); d.rate = [3.2, 1.1, 0.4][row] * (1 + (i % 3) * 0.07); g.drums.push(d);
  }
  for (const sx of [-1, 1]) g.add(at(box(0.04, H - 0.1, D - 0.04, '#3a3a3c'), sx * (W / 2 + 0.01), H / 2 + 0.06, 0));
  g.spin = t => g.drums.forEach((d, i) => { d.rotation.z = -t * d.rate + i; });
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return dyn(g);
}
// An Enigma machine with the lid open (front at +z): keyboard, lampboard, three rotors, plugboard. .lamp(i) lights lamp i (-1 = none).
export function enigma() {
  const g = new THREE.Group(), W = 0.26, D = 0.22;
  g.add(at(box(W, 0.08, D, '#4a3424'), 0, 0.04, 0)); g.add(at(box(W - 0.01, 0.004, D - 0.01, '#1a1a1a'), 0, 0.081, 0));
  g.add(at(box(W, 0.12, 0.012, '#4a3424'), 0, 0.14, -D / 2 - 0.004));                                                       // the open lid
  const keyM = std('#ece6d6', { roughness: 0.5 }), lampOff = new THREE.MeshStandardMaterial({ color: '#c8c2b0', roughness: 0.3 });
  const rows = [9, 8, 9];
  rows.forEach((n, r) => { for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * 0.024; g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.008, 10), keyM), x, 0.088, 0.075 - r * 0.022)); } });
  g.lamps = [];
  rows.forEach((n, r) => { for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * 0.024, m = new THREE.Mesh(new THREE.SphereGeometry(0.008, 10, 6), lampOff.clone()); m.position.set(x, 0.084, 0.0 - r * 0.022); g.add(m); g.lamps.push(m); } });
  for (let i = 0; i < 3; i++) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.016, 16), std('#6a6a64', { metalness: 0.4 })); w.rotation.z = Math.PI / 2; w.position.set(-0.03 + i * 0.03, 0.095, -0.08); g.add(w); }
  g.add(at(box(W - 0.02, 0.05, 0.004, '#141414'), 0, 0.035, D / 2 + 0.002));
  for (let i = 0; i < 13; i++) for (const y of [0.025, 0.045]) g.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.0035, 8), new THREE.MeshBasicMaterial({ color: '#c9a227' })), -0.11 + i * 0.0183, y, D / 2 + 0.005));
  let on = -1;
  g.lamp = i => { if (i === on) return; if (on >= 0) { g.lamps[on].material.emissive.set('#000000'); g.lamps[on].material.color.set('#c8c2b0'); } on = i;
    if (i >= 0) { g.lamps[i].material.emissive.set('#ffd060'); g.lamps[i].material.emissiveIntensity = 2.2; g.lamps[i].material.color.set('#fff2c0'); } };
  return dyn(g);
}
// Colossus (1944): racks of glowing valves and the "bedstead" that ran the paper tape over its wheels. Front at +z. .spin(t).
export function colossus() {
  const g = new THREE.Group();
  const vt = canvasTex(128, 256, (x, W, H) => { x.fillStyle = '#4a4e52'; x.fillRect(0, 0, W, H); for (let j = 0; j < 16; j++) for (let i = 0; i < 8; i++) { const gr = x.createRadialGradient(8 + i * 16, 8 + j * 16, 1, 8 + i * 16, 8 + j * 16, 6);
    gr.addColorStop(0, (i * 3 + j) % 5 ? '#ffcf7a' : '#ff9a40'); gr.addColorStop(1, 'rgba(60,40,20,0.2)'); x.fillStyle = gr; x.beginPath(); x.arc(8 + i * 16, 8 + j * 16, 6, 0, 7); x.fill(); } });
  for (const sx of [-1, 1]) { const r = mesh(new THREE.BoxGeometry(0.8, 1.32, 0.32), [metal('#5a5e62'), metal('#5a5e62'), metal('#5a5e62'), metal('#5a5e62'), new THREE.MeshStandardMaterial({ map: vt, emissive: '#ffffff', emissiveMap: vt, emissiveIntensity: 0.55, roughness: 0.6 }), metal('#5a5e62')]);
    r.position.set(sx * 0.43, 0.66, -0.2); g.add(r); }
  const bed = new THREE.Group(); bed.position.set(0, 0, 0.35); g.add(bed);
  for (const sx of [-1, 1]) { bed.add(at(box(0.04, 0.72, 0.04, '#2a2a2c'), sx * 0.45, 0.36, 0)); }
  bed.add(at(box(0.94, 0.04, 0.04, '#2a2a2c'), 0, 0.72, 0)); bed.add(at(box(0.94, 0.04, 0.04, '#2a2a2c'), 0, 0.3, 0));
  g.wheels = [-0.36, -0.12, 0.12, 0.36].map((x, i) => { const w = new THREE.Group(); w.position.set(x, i % 2 ? 0.62 : 0.4, 0.03); bed.add(w);
    w.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16), metal('#8a8e92', { metalness: 0.5 })), 0, 0, 0, Math.PI / 2, 0, 0)); w.add(at(box(0.15, 0.012, 0.024, '#3a3a3c'), 0, 0, 0.012)); return w; });
  const tp = []; for (const [x, y] of [[-0.44, 0.4], [-0.36, 0.48], [-0.12, 0.7], [0.12, 0.48], [0.36, 0.7], [0.44, 0.62], [0.36, 0.32], [-0.36, 0.32], [-0.44, 0.4]]) tp.push(new THREE.Vector3(x, y, 0.045));
  bed.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tp, true), 60, 0.006, 3, true), new THREE.MeshStandardMaterial({ color: '#f4f0e2', roughness: 0.8 })));
  g.spin = t => g.wheels.forEach((w, i) => { w.rotation.z = -t * (6 + i); });
  return dyn(g);
}
// A V-2 rocket as a museum model (black-and-white test paint, four fins). Stands on its fins at y = 0.
export function v2(h = 1.6) {
  const g = new THREE.Group(), k = h / 14;
  const prof = [[0, 0.0], [0, 0.62], [1.2, 0.82], [5.6, 0.84], [8.6, 0.8], [11.4, 0.5], [13.2, 0.18], [14, 0.0]].map(([y, r]) => new THREE.Vector2(r * k, y * k));
  const tex = canvasTex(128, 128, (x, W, H) => { x.fillStyle = '#f2f0ea'; x.fillRect(0, 0, W, H); x.fillStyle = '#141414'; x.fillRect(0, H * 0.25, W / 4, H * 0.25); x.fillRect(W / 2, H * 0.25, W / 4, H * 0.25); x.fillRect(W / 4, H * 0.5, W / 4, H * 0.15); x.fillRect(W * 0.75, H * 0.5, W / 4, H * 0.15); });
  g.add(mesh(new THREE.LatheGeometry(prof, 24), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 })));
  const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.lineTo(1.9 * k, 0); fin.lineTo(1.2 * k, 3.6 * k); fin.lineTo(0, 4.6 * k); fin.closePath();
  for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.ExtrudeGeometry(fin, { depth: 0.12 * k, bevelEnabled: false }), std(i % 2 ? '#141414' : '#f2f0ea')); const a = i * Math.PI / 2 + Math.PI / 4; f.position.set(Math.cos(a) * 0.55 * k, 0, Math.sin(a) * 0.55 * k); f.rotation.y = -a; g.add(f); }
  return g;
}
// Penicillin: a culture flask and a Petri dish with the green mould (Fleming's plate).
export function penicillin() {
  const g = new THREE.Group(), glass = new THREE.MeshStandardMaterial({ color: '#d8ece8', transparent: true, opacity: 0.45, roughness: 0.08, metalness: 0.1, depthWrite: false });
  const fl = [[0, 0.0], [0.16, 0.0], [0.17, 0.02], [0.17, 0.12], [0.06, 0.32], [0.05, 0.42], [0.06, 0.44]].map(([r, y]) => new THREE.Vector2(r, y));
  g.add(at(new THREE.Mesh(new THREE.LatheGeometry(fl, 24), glass), -0.12, 0, 0));
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.16, 0.08, 24), new THREE.MeshStandardMaterial({ color: '#e8c860', transparent: true, opacity: 0.8, roughness: 0.3 })), -0.12, 0.045, 0));
  const mold = canvasTex(64, 64, (x, W) => { x.fillStyle = '#e6e2c8'; x.fillRect(0, 0, W, W); for (const [cx, cy, r] of [[30, 28, 12], [44, 40, 6], [20, 44, 5], [40, 18, 4]]) { const gr = x.createRadialGradient(cx, cy, 1, cx, cy, r); gr.addColorStop(0, '#f4f2e0'); gr.addColorStop(0.5, '#4a8a4a'); gr.addColorStop(1, 'rgba(74,138,74,0.2)'); x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); } });
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.02, 28), new THREE.MeshStandardMaterial({ map: mold, roughness: 0.6 })), 0.16, 0.01, 0.06));
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 28, 1, true), glass), 0.16, 0.016, 0.06));
  return g;
}
// A radar dish on a turning pedestal (museum model): .head turns about y; the bowl looks toward +z, tilted up.
export function radarDish(r = 0.42) {
  const g = new THREE.Group(), m = metal('#c8ccd0', { metalness: 0.5, roughness: 0.35, side: THREE.DoubleSide });
  g.add(at(cyl(0.14, 0.18, 0.12, '#4a4e52', 16), 0, 0.06, 0)); g.add(at(cyl(0.035, 0.035, 0.46, '#6a6e72', 8), 0, 0.35, 0));
  const head = new THREE.Group(); head.position.y = 0.6; g.add(head); g.head = head;
  const tilt = new THREE.Group(); tilt.rotation.x = -0.45; head.add(tilt);
  const dish = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 10, 0, Math.PI * 2, 0, 0.8), m); dish.rotation.x = -Math.PI / 2; dish.position.z = r * 0.62; tilt.add(dish);
  tilt.add(at(cyl(0.012, 0.012, r * 0.9, '#3a3e42', 6), 0, 0, r * 0.12, Math.PI / 2, 0, 0)); tilt.add(at(box(0.05, 0.05, 0.07, '#2a2e32'), 0, 0, r * 0.56));
  tilt.add(at(box(0.16, 0.1, 0.12, '#4a4e52'), 0, 0, -0.04));
  return dyn(g);
}

// ------------------------------------------------------------ Mexico in the war
import { flagTex } from '../whatif/flags.js';
// A 1940s tanker, bow toward +z: long low hull (waterline at y = 0.8 of the hull), the bridge house amidships, the engine
// house and funnel aft. flag = true paints the Mexican flag and «MÉXICO» on both sides, as neutral ships did (lit at night).
export function tanker({ len = 36, flag = true } = {}) {
  const g = new THREE.Group(), W = 4.4, H = 3.0;
  const sh = new THREE.Shape(); sh.moveTo(-W / 2, -len / 2 + 2); sh.quadraticCurveTo(-W / 2, -len / 2, 0, -len / 2); sh.quadraticCurveTo(W / 2, -len / 2, W / 2, -len / 2 + 2);
  sh.lineTo(W / 2, len / 2 - 6); sh.quadraticCurveTo(W / 2, len / 2 - 1.2, 0, len / 2); sh.quadraticCurveTo(-W / 2, len / 2 - 1.2, -W / 2, len / 2 - 6); sh.closePath();
  const part = (y0, h, col) => { const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false }); geo.rotateX(-Math.PI / 2); geo.rotateY(Math.PI); const m = mesh(geo, std(col, { roughness: 0.7 })); m.position.y = y0; g.add(m); return m; };
  part(0, 0.85, '#6a2a22'); part(0.85, H - 0.85, '#2a2c30');
  const dk = new THREE.ShapeGeometry(sh); dk.rotateX(-Math.PI / 2); dk.rotateY(Math.PI); g.add(at(mesh(dk, std('#5a4a3a')), 0, H + 0.01, 0));
  const white = '#e8e4d8';
  g.add(at(box(3.6, 2.2, 3.4, white), 0, H + 1.1, len * 0.14)); g.add(at(box(2.8, 1.1, 2.6, white), 0, H + 2.75, len * 0.14)); g.add(at(box(3.0, 0.12, 2.8, '#3a3a3a'), 0, H + 3.36, len * 0.14));
  g.add(at(box(4.0, 2.2, 6.2, white), 0, H + 1.1, -len * 0.36)); g.add(at(cyl(0.65, 0.75, 3.2, '#1e1e1e', 14), 0, H + 3.7, -len * 0.38)); g.add(at(cyl(0.68, 0.68, 0.5, '#c9a227', 14), 0, H + 4.6, -len * 0.38));
  g.add(at(box(0.5, 0.08, len * 0.62, '#4a4a46'), 0, H + 1.05, -len * 0.08));
  for (const z of [len * 0.4, len * 0.14 - 2.2, -len * 0.2]) g.add(at(cyl(0.08, 0.1, 6, '#3a3a3a', 6), 0, H + 3, z));
  for (let i = 0; i < 10; i++) g.add(at(box(W - 0.6, 0.18, 0.18, '#3a3430'), 0, H + 0.1, -len * 0.25 + i * 1.9));
  g.lights = [];
  if (flag) for (const sx of [-1, 1]) {
    const f = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 4.4), new THREE.MeshStandardMaterial({ map: flagTex('mx', 300, 200), roughness: 0.8, emissive: '#ffffff', emissiveIntensity: 0.0 }));
    f.material.emissiveMap = f.material.map; f.position.set(sx * (W / 2 + 0.02), 2.0, len * 0.3); f.rotation.y = sx * Math.PI / 2; g.add(f); g.lights.push(f);
    const tx = canvasTex(512, 96, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#f4f0e6'; x.font = '900 78px "DejaVu Sans"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('MÉXICO', w / 2, h / 2 + 4); });
    const n = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.7), new THREE.MeshStandardMaterial({ map: tx, transparent: true, roughness: 0.8, emissive: '#ffffff', emissiveMap: tx, emissiveIntensity: 0.0 }));
    n.position.set(sx * (W / 2 + 0.02), 2.0, -len * 0.02); n.rotation.y = sx * Math.PI / 2; g.add(n); g.lights.push(n);
  }
  g.lit = k => g.lights.forEach(m => { m.material.emissiveIntensity = 0.55 * k; });
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return dyn(g);
}
// A tank wagon (PEMEX) and an ore wagon for the oil-and-metals train; gauge 1.05 like the tracks; length along z.
export function tankCar(text = 'PEMEX', col = '#1e1e20') {
  const g = new THREE.Group(), len = 7.4;
  g.add(at(box(2.0, 0.3, len, '#2a2622'), 0, 0.95, 0)); g.add(at(cyl(1.0, 1.0, len - 0.6, col, 20), 0, 2.08, 0, Math.PI / 2, 0, 0));
  for (const e of [-1, 1]) g.add(at(new THREE.Mesh(new THREE.SphereGeometry(1.0, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), std(col)), 0, 2.08, e * (len / 2 - 0.3), e * Math.PI / 2, 0, 0));
  g.add(at(cyl(0.35, 0.35, 0.45, col, 12), 0, 3.2, 0)); g.add(at(box(2.1, 0.06, 0.6, '#3a3a36'), 0, 3.1, 0));
  const tx = canvasTex(512, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#f2ece0'; x.font = '900 92px "DejaVu Sans"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h / 2 + 6); });
  for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.8), new THREE.MeshStandardMaterial({ map: tx, transparent: true, roughness: 0.8 })); p.position.set(sx * 1.01, 2.1, 0); p.rotation.y = sx * Math.PI / 2; g.add(p); }
  for (const z of [-len / 2 + 1.2, len / 2 - 1.2]) for (const dz of [-0.55, 0.55]) for (const sx of [-1, 1]) g.add(at(cyl(0.42, 0.42, 0.12, '#1a1a1a', 14), sx * 0.52, 0.42, z + dz, 0, 0, Math.PI / 2));
  g.len = len; return dyn(g);
}
export function oreCar(ore = '#6a5a4a') {
  const g = new THREE.Group(), len = 6.6;
  g.add(at(box(2.0, 0.3, len, '#2a2622'), 0, 0.95, 0));
  for (const sx of [-1, 1]) g.add(at(box(0.1, 1.2, len, '#5a3a2a'), sx * 0.98, 1.7, 0)); for (const e of [-1, 1]) g.add(at(box(2.0, 1.2, 0.1, '#5a3a2a'), 0, 1.7, e * (len / 2 - 0.05)));
  const heap = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), std(ore, { roughness: 1, flatShading: true })); heap.scale.set(0.95, 0.55, len / 2 - 0.2); heap.position.y = 2.1; g.add(heap);
  for (const z of [-len / 2 + 1.1, len / 2 - 1.1]) for (const dz of [-0.55, 0.55]) for (const sx of [-1, 1]) g.add(at(cyl(0.42, 0.42, 0.12, '#1a1a1a', 14), sx * 0.52, 0.42, z + dz, 0, 0, Math.PI / 2));
  g.len = len; return dyn(g);
}

// ------------------------------------------------------------ 1944–1945: D-Day, Berlin
// A Higgins boat (LCVP) at chibi scale, bow toward +z: open hull, the steel ramp hinged at the bow (g.ramp.rotation.x:
// 0 = up, ~1.45 = down on the sand), the coxswain's station aft. Deck at y = g.deck; holds a 3 x 4 squad.
export function higgins(col = '#6a6e5a') {
  const g = new THREE.Group(), L = 6.4, W = 2.5, H = 1.15, wood = std(col, { roughness: 0.85 }), steel = metal('#5a5e58');
  g.add(at(mesh(new THREE.BoxGeometry(W, 0.3, L), wood), 0, 0.05, 0)); g.deck = 0.21;
  g.add(at(box(W - 0.2, 0.02, L - 0.3, '#4a4e44'), 0, 0.21, 0));
  for (const sx of [-1, 1]) g.add(at(mesh(new THREE.BoxGeometry(0.12, H, L), wood), sx * (W / 2 - 0.06), H / 2, 0));
  g.add(at(mesh(new THREE.BoxGeometry(W, H, 0.12), wood), 0, H / 2, -L / 2 + 0.06));
  for (const sx of [-1, 1]) g.add(at(box(0.14, 0.08, L, '#3a3c36'), sx * (W / 2 - 0.06), H + 0.04, 0));
  const ramp = new THREE.Group(); ramp.position.set(0, 0.12, L / 2); g.add(ramp); g.ramp = ramp;
  ramp.add(at(mesh(new THREE.BoxGeometry(W - 0.1, H + 0.15, 0.1), steel), 0, (H + 0.15) / 2, 0.04));
  for (let i = 0; i < 4; i++) ramp.add(at(box(W - 0.2, 0.04, 0.03, '#4a4e48'), 0, 0.2 + i * 0.28, -0.02));
  const cox = new THREE.Group(); cox.add(at(box(0.9, 0.5, 0.6, '#5a5e52'), 0, H + 0.25, 0)); cox.position.set(0.55, 0, -L / 2 + 0.5); g.add(cox);
  g.L = L; g.W = W;
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return dyn(g);
}
// A Czech hedgehog: three steel angle beams crossed at right angles (beach obstacle).
export function hedgehog(s = 1.1) {
  const g = new THREE.Group(), m = metal('#3a3a36', { roughness: 0.6 });
  [[0.62, 0, 0.62], [-0.62, 0, 0.62], [0, 0.62, 0]].forEach(([rx, ry, rz], i) => { const b = mesh(new THREE.BoxGeometry(0.09, 1.5, 0.09), m); b.rotation.set(i === 2 ? Math.PI / 2 : rx, ry, i === 2 ? 0.62 : rz); g.add(b); });
  g.position.y = 0.42 * s; g.scale.setScalar(s); return g;
}
// The Reichstag in 1945: stone block with corner towers, the portico, the bare steel ribs of the burnt dome. Front at +z.
export function reichstag() {
  const g = new THREE.Group(), stone = std('#a49c8a', { roughness: 0.95 }), dark = '#2a2622';
  const wt = canvasTex(256, 128, (x, W, H) => { x.fillStyle = '#a49c8a'; x.fillRect(0, 0, W, H); for (let j = 0; j < 3; j++) for (let i = 0; i < 12; i++) { x.fillStyle = (i * 7 + j * 3) % 5 ? '#141210' : '#3a2a20'; x.fillRect(6 + i * 21, 14 + j * 40, 11, 24); }
    for (let i = 0; i < 9; i++) { const gr = x.createRadialGradient((i * 53) % W, (i * 31) % H, 2, (i * 53) % W, (i * 31) % H, 30); gr.addColorStop(0, 'rgba(20,16,12,0.55)'); gr.addColorStop(1, 'rgba(20,16,12,0)'); x.fillStyle = gr; x.fillRect(0, 0, W, H); } });
  const facade = (w, h) => new THREE.MeshStandardMaterial({ map: (() => { const t = wt.clone(); t.needsUpdate = true; t.wrapS = THREE.RepeatWrapping; t.repeat.set(w / 10, 1); return t; })(), roughness: 0.95 });
  g.add(at(mesh(new THREE.BoxGeometry(26, 8, 16), [facade(16, 8), facade(16, 8), stone, stone, facade(26, 8), facade(26, 8)]), 0, 4, 0));
  for (const [x, z] of [[-11.5, -6.5], [11.5, -6.5], [-11.5, 6.5], [11.5, 6.5]]) { g.add(at(mesh(new THREE.BoxGeometry(5, 11, 5), [facade(5, 11), facade(5, 11), stone, stone, facade(5, 11), facade(5, 11)]), x, 5.5, z)); g.add(at(box(5.4, 0.5, 5.4, '#8a8272'), x, 11.2, z)); }
  g.add(at(box(11, 1.2, 3.2, '#9a9282'), 0, 0.6, 9.2)); for (let i = 0; i < 6; i++) g.add(at(cyl(0.38, 0.42, 6.4, '#b0a896', 12), -4.5 + i * 1.8, 4.4, 9.6));
  const ped = new THREE.Shape(); ped.moveTo(-5.8, 0); ped.lineTo(5.8, 0); ped.lineTo(0, 2.2); ped.closePath(); const pm = new THREE.Mesh(new THREE.ExtrudeGeometry(ped, { depth: 2.6, bevelEnabled: false }), stone); pm.position.set(0, 7.6, 8.1); g.add(pm);
  g.add(at(box(12, 0.6, 3.0, '#8a8272'), 0, 7.6, 9.4));
  const ribM = metal('#2a2826', { metalness: 0.6, roughness: 0.5 }), dome = new THREE.Group(); dome.position.y = 8; g.add(dome);
  dome.add(at(box(9, 2.2, 9, '#8a8272'), 0, 1.1, 0));
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, pts = []; for (let k = 0; k <= 10; k++) { const p = k / 10 * Math.PI / 2; pts.push(new THREE.Vector3(Math.cos(a) * 4.2 * Math.cos(p), 2.2 + 4.6 * Math.sin(p), Math.sin(a) * 4.2 * Math.cos(p))); }
    dome.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.07, 4, false), ribM)); }
  for (const h of [0.3, 0.6, 0.85]) { const r = 4.2 * Math.cos(h * Math.PI / 2), ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.06, 4, 32), ribM); ring.rotation.x = Math.PI / 2; ring.position.y = 2.2 + 4.6 * Math.sin(h * Math.PI / 2); dome.add(ring); }
  g.roofY = 8; g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
// A small hand flag on a stick (crowds): code from whatif/flags. Origin at the bottom of the stick.
export function handFlag(code = 'gb', s = 1) {
  const g = new THREE.Group(); g.add(at(cyl(0.006, 0.006, 0.34, '#d8d0c0', 5), 0, 0.17, 0));
  const f = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.13), new THREE.MeshStandardMaterial({ map: flagTex(code, 150, 100), side: THREE.DoubleSide, roughness: 0.8 })); f.position.set(0.105, 0.27, 0); g.add(f); g.flag = f;
  g.scale.setScalar(s); return dyn(g);
}

// ------------------------------------------------------------ 1945: the bomb, Hiroshima remembered, the end
// The Trinity test tower: a steel lattice with the shot cab on top (seen far away at dawn).
export function trinityTower(h = 20) {
  const g = new THREE.Group(), m = metal('#3a3a3a', { roughness: 0.6 }), b = h * 0.18, tp = h * 0.05;
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const a = new THREE.Vector3(sx * b, 0, sz * b), c = new THREE.Vector3(sx * tp, h, sz * tp), d = c.clone().sub(a);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, d.length(), 5), m); leg.position.copy(a).add(c).multiplyScalar(0.5); leg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(leg); }
  for (let i = 1; i < 8; i++) { const y = h * i / 8, w = b + (tp - b) * i / 8; for (const [x, z, ry] of [[0, w, 0], [0, -w, 0], [w, 0, Math.PI / 2], [-w, 0, Math.PI / 2]]) g.add(at(box(2 * w, 0.08, 0.08, '#3a3a3a'), x, y, z, 0, ry, 0)); }
  g.add(at(box(tp * 2 + 0.8, 1.0, tp * 2 + 0.8, '#5a5a56'), 0, h + 0.5, 0));
  return g;
}
// A mushroom cloud seen from afar: .set(u, t) grows it (u 0..1) — the stem rises, the cap swells and rolls; glowing at first.
export function mushroom(H = 60) {
  const g = new THREE.Group(), r = rng(31), mats = [];
  const mk = (col) => { const m = new THREE.MeshStandardMaterial({ color: col, roughness: 1, flatShading: true, emissive: '#ff8a3a', emissiveIntensity: 0 }); mats.push(m); return m; };
  const stem = [], cap = [];
  for (let i = 0; i < 14; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), mk(i < 4 ? '#b8a898' : '#d8ccbc')); s.k = i / 13; s.j = [(r() - 0.5) * 0.3, (r() - 0.5) * 0.3]; g.add(s); stem.push(s); }
  for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2 + r() * 0.2, rr = 0.55 + r() * 0.45, s = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), mk(['#efe6d8', '#e2d6c4', '#d6c8b4'][i % 3])); s.a = a; s.rr = rr; s.dy = (r() - 0.3) * 0.35; s.sz = 0.7 + r() * 0.5; g.add(s); cap.push(s); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.32, 8, 26), mk('#e8dccb')); ring.rotation.x = Math.PI / 2; g.add(ring);
  const base = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2), mk('#8a7a6a')); g.add(base);
  g.set = (u, t = 0) => {
    const e = 1 - Math.pow(1 - clampU(u), 2.2), top = H * (0.2 + 0.8 * e), capR = H * (0.12 + 0.22 * e), glow = Math.max(0, 1 - u * 2.2);
    stem.forEach(s => { const y = top * s.k * 0.92, w = H * (0.035 + 0.03 * (1 - s.k) + 0.02 * e); s.position.set(s.j[0] * w, y, s.j[1] * w); s.scale.set(w * 1.3, H * 0.07, w * 1.3); s.rotation.y = t * 0.2 + s.k * 3; });
    cap.forEach(s => { const a = s.a + t * 0.05; s.position.set(Math.cos(a) * capR * s.rr, top + capR * (0.15 + s.dy), Math.sin(a) * capR * s.rr); s.scale.setScalar(capR * 0.45 * s.sz); s.rotation.set(t * 0.1 + s.a, s.a, 0); });
    ring.position.y = top - capR * 0.1; ring.scale.set(capR * 0.95, capR * 0.95, capR * 0.6);
    base.scale.set(H * (0.1 + 0.25 * e), H * (0.03 + 0.05 * e), H * (0.1 + 0.25 * e));
    mats.forEach(m => { m.emissiveIntensity = 1.6 * glow; });
    g.visible = u > 0.001;
  };
  const clampU = v => Math.min(1, Math.max(0, v));
  g.set(0); return dyn(g);
}
// The Genbaku Dome (Hiroshima Prefectural Industrial Promotion Hall) as it stands today: a three-storey shell, the stair
// tower and the bare oval dome frame. Front toward +z.
export function genbaku() {
  const g = new THREE.Group(), wall = canvasTex(256, 128, (x, W, H) => { x.fillStyle = '#a89a86'; x.fillRect(0, 0, W, H); for (let j = 0; j < 3; j++) for (let i = 0; i < 10; i++) { x.fillStyle = '#2a2420'; x.fillRect(8 + i * 25, 12 + j * 40, 12, 26); }
    for (let i = 0; i < 14; i++) { x.fillStyle = `rgba(60,50,40,${0.2 + (i % 3) * 0.1})`; x.fillRect((i * 37) % W, (i * 23) % H, 18, 8); } });
  wall.wrapS = THREE.RepeatWrapping;
  const wm = (rx) => { const t = wall.clone(); t.needsUpdate = true; t.wrapS = THREE.RepeatWrapping; t.repeat.set(rx, 1); return new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 }); };
  const shell = (w, h, d, x, z) => { for (const [px, pz, ry, len] of [[0, d / 2, 0, w], [0, -d / 2, 0, w], [w / 2, 0, Math.PI / 2, d], [-w / 2, 0, Math.PI / 2, d]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(len, h, 0.35), wm(len / 8)); m.position.set(x + px, h / 2, z + pz); m.rotation.y = ry; g.add(m); } };
  shell(16, 6, 9, 0, 0);
  shell(5, 9, 5, 0, 1.0);
  const rib = metal('#3a3632', { metalness: 0.5, roughness: 0.6 }), dome = new THREE.Group(); dome.position.set(0, 9, 1.0); g.add(dome);
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, pts = []; for (let k = 0; k <= 10; k++) { const p = k / 10 * Math.PI / 2; pts.push(new THREE.Vector3(Math.cos(a) * 2.5 * Math.cos(p), 3.4 * Math.sin(p), Math.sin(a) * 2.2 * Math.cos(p))); }
    dome.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.06, 4, false), rib)); }
  for (const h of [0.35, 0.7]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 4, 32), rib); ring.rotation.x = Math.PI / 2; ring.scale.set(2.5 * Math.cos(h * Math.PI / 2), 2.2 * Math.cos(h * Math.PI / 2), 1); ring.position.y = 3.4 * Math.sin(h * Math.PI / 2); dome.add(ring); }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
// A paper crane (origami), about 0.12 long; col = paper colour.
export function paperCrane(col = '#e84a5a') {
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: col, roughness: 0.7, side: THREE.DoubleSide, flatShading: true });
  const tri = (pts) => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3)); geo.computeVertexNormals(); return new THREE.Mesh(geo, m); };
  g.add(tri([[0, 0, -0.06], [0, 0.025, 0], [0, 0, 0.05]]));                                   // body
  g.add(tri([[0, 0.02, -0.01], [0.07, 0.035, 0.0], [0, 0.02, 0.02]])); g.add(tri([[0, 0.02, -0.01], [-0.07, 0.035, 0.0], [0, 0.02, 0.02]]));   // wings
  g.add(tri([[0, 0.0, 0.04], [0, 0.06, 0.07], [0, 0.0, 0.05]])); g.add(tri([[0, 0.0, -0.05], [0, 0.05, -0.08], [0, 0.0, -0.06]]));          // neck and tail
  return g;
}
// A floating paper lantern (tōrō nagashi): a small glowing box on a wooden base. .bob(t).
export function floatLantern(seed = 0, col = '#ffd890') {
  const g = new THREE.Group(); g.add(at(box(0.22, 0.04, 0.22, '#6a4a2e'), 0, 0.02, 0));
  g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.2, 0.18), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.4, roughness: 0.8 })), 0, 0.14, 0));
  const gl = glow('#ffcf7a', 0.9, 0.55); gl.position.y = 0.16; g.add(gl);
  g.bob = t => { g.position.y = 0.03 * Math.sin(t * 1.4 + seed); g.rotation.z = 0.05 * Math.sin(t * 1.1 + seed * 2); };
  return dyn(g);
}
// A white dove with flapping wings, flying toward its +z. .flap(t).
export function dove(seed = 0) {
  const g = new THREE.Group(), m = std('#f4f2ee', { roughness: 0.7, emissive: '#ffffff', emissiveIntensity: 0.35 });
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), m); b.scale.set(0.8, 0.8, 1.6); g.add(b); g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), m), 0, 0.05, 0.19));
  g.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 6), m), 0, 0, -0.24, -Math.PI / 2, 0, 0));
  const wings = [1, -1].map(sx => { const w = new THREE.Group(); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.16), new THREE.MeshStandardMaterial({ color: '#f8f6f2', side: THREE.DoubleSide, roughness: 0.7, emissive: '#ffffff', emissiveIntensity: 0.35 })); p.rotation.x = -Math.PI / 2; p.position.x = sx * 0.17; w.add(p); w.position.set(sx * 0.05, 0.03, 0); g.add(w); return w; });
  g.flap = t => { const a = 0.7 * Math.sin(t * 9 + seed * 2); wings[0].rotation.z = a; wings[1].rotation.z = -a; };
  return dyn(g);
}
