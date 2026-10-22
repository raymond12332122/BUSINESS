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
