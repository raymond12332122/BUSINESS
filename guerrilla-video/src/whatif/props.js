// Props for "¿Qué pasaría si...?": Mexico City and Washington, the world tour landmarks, the racecourse and the stage.
import * as THREE from 'three';
import { mesh, box, cyl, at, rng } from '../lib/props.js';
import { canvasTex } from './kit.js';
import { flagTex } from './flags.js';
export const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });
const basic = (color, o = {}) => new THREE.MeshBasicMaterial({ color, ...o });
const plane = (w, h, mat) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
const dyn = g => { g.userData.dynamic = true; return g; };   // keeps bake() from merging moving parts into the static set
const shadowy = g => { g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return g; };
// Repeating stone/tile textures for large surfaces.
function stoneTex(base, speck, { w = 256, h = 256, n = 900, blocks = 0, seed = 3 } = {}) {
  const r = rng(seed);
  const t = canvasTex(w, h, (x, W, H) => { x.fillStyle = base; x.fillRect(0, 0, W, H);
    for (let i = 0; i < n; i++) { x.fillStyle = speck[(r() * speck.length) | 0]; x.globalAlpha = 0.25 + r() * 0.4; x.fillRect(r() * W, r() * H, 1 + r() * 3, 1 + r() * 3); }
    x.globalAlpha = 1; if (blocks) { x.strokeStyle = 'rgba(0,0,0,.18)'; x.lineWidth = 2; for (let j = 0; j <= blocks; j++) { x.beginPath(); x.moveTo(0, j * H / blocks); x.lineTo(W, j * H / blocks); x.stroke();
      for (let i = 0; i <= blocks; i++) { const off = (j % 2) * W / blocks / 2; x.beginPath(); x.moveTo(i * W / blocks + off, j * H / blocks); x.lineTo(i * W / blocks + off, (j + 1) * H / blocks); x.stroke(); } } } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const tex = (t, rx, ry) => { const c = t.clone(); c.needsUpdate = true; c.repeat.set(rx, ry); return c; };

// ============================================================ Mexico City
// Palacio Nacional: three storeys of red tezontle with grey stone frames, iron balconies, a taller central body with
// the main door, the presidential balcony, the bell in its niche and the clock; flag on the roof. Front face at z = 0.
export function palacioNacional({ w = 44 } = {}) {
  const g = new THREE.Group();
  const red = stoneTex('#7a3a30', ['#4e221c', '#94584a', '#5e2c24', '#a06656'], { n: 2600, seed: 5 }), grey = stoneTex('#cfc4ac', ['#a89e88', '#e6dcc6', '#8e8672'], { n: 1200, blocks: 4, seed: 6 });
  const redM = new THREE.MeshStandardMaterial({ map: tex(red, w / 4, 3.5), roughness: 0.92 }), stoneM = new THREE.MeshStandardMaterial({ map: tex(grey, 2, 2), roughness: 0.85 });
  const H = 13, D = 6;
  g.add(at(mesh(new THREE.BoxGeometry(w, H, D), redM), 0, H / 2, -D / 2));
  // central body: slightly forward and taller
  const cw = 10; g.add(at(mesh(new THREE.BoxGeometry(cw, H + 3.2, D + 0.6), new THREE.MeshStandardMaterial({ map: tex(red, cw / 4, 4.2), roughness: 0.92 })), 0, (H + 3.2) / 2, -D / 2 + 0.3));
  // cornices and string courses
  for (const [y, hh, dd] of [[4.4, 0.35, 0.3], [8.7, 0.35, 0.3], [H, 0.55, 0.45]]) g.add(at(mesh(new THREE.BoxGeometry(w + 0.2, hh, D + dd), stoneM), 0, y, -D / 2 + dd / 2));
  g.add(at(mesh(new THREE.BoxGeometry(cw + 0.4, 0.6, D + 1.1), stoneM), 0, H + 3.2, -D / 2 + 0.55));
  // parapet with merlons
  for (let i = 0; i < w / 1.4; i++) { const x = -w / 2 + 0.7 + i * 1.4; if (Math.abs(x) < cw / 2) continue; g.add(at(mesh(new THREE.BoxGeometry(0.45, 0.6, 0.45), stoneM), x, H + 0.55, 0.05)); }
  // windows: ground floor plain, upper floors with stone frames, pediments and iron balconies
  const win = std('#2b2622', { roughness: 0.5 }), glass = std('#5a6a78', { roughness: 0.2, metalness: 0.3 }), iron = std('#1d1d1f', { metalness: 0.5, roughness: 0.5 });
  const bayX = []; for (let x = -w / 2 + 2.2; x <= w / 2 - 2.2; x += 2.75) if (Math.abs(x) > cw / 2 + 0.6) bayX.push(x);
  for (const x of bayX) for (const [fy, fh] of [[1.2, 2.2], [5.3, 2.6], [9.5, 2.5]]) {
    g.add(at(mesh(new THREE.BoxGeometry(1.3, fh, 0.1), fy > 2 ? glass : win), x, fy + fh / 2, 0.06));
    g.add(at(mesh(new THREE.BoxGeometry(1.7, fh + 0.4, 0.14), stoneM), x, fy + fh / 2, 0.02));
    if (fy > 2) { const ped = at(mesh(new THREE.BoxGeometry(1.9, 0.22, 0.4), stoneM), x, fy + fh + 0.3, 0.15); g.add(ped);
      g.add(at(mesh(new THREE.BoxGeometry(1.8, 0.12, 0.7), stoneM), x, fy - 0.06, 0.35));
      for (let k = 0; k < 7; k++) g.add(at(mesh(new THREE.BoxGeometry(0.03, 0.75, 0.03), iron), x - 0.8 + k * 0.266, fy + 0.35, 0.66)); g.add(at(mesh(new THREE.BoxGeometry(1.8, 0.04, 0.04), iron), x, fy + 0.74, 0.66)); }
  }
  // the central door (arched) and the presidential balcony above it
  const door = new THREE.Shape(); door.moveTo(-1.6, 0); door.lineTo(1.6, 0); door.lineTo(1.6, 3.6); door.absarc(0, 3.6, 1.6, 0, Math.PI, false); door.lineTo(-1.6, 0);
  g.add(at(mesh(new THREE.ShapeGeometry(door, 20), std('#3a2a1e', { roughness: 0.6 })), 0, 0, 0.65)); g.door = g.children[g.children.length - 1];
  const surround = new THREE.Shape(); surround.moveTo(-2.4, 0); surround.lineTo(2.4, 0); surround.lineTo(2.4, 3.8); surround.absarc(0, 3.8, 2.4, 0, Math.PI, false); surround.lineTo(-2.4, 0); surround.holes.push(new THREE.Path().moveTo(-1.6, 0).lineTo(1.6, 0).lineTo(1.6, 3.6).absarc(0, 3.6, 1.6, 0, Math.PI, false).lineTo(-1.6, 0));
  g.add(at(mesh(new THREE.ExtrudeGeometry(surround, { depth: 0.35, bevelEnabled: false, curveSegments: 20 }), stoneM), 0, 0, 0.3));
  for (const x of [-3.1, 3.1]) { g.add(at(mesh(new THREE.CylinderGeometry(0.28, 0.32, 4.4, 14), stoneM), x, 2.2, 0.75)); g.add(at(mesh(new THREE.CylinderGeometry(0.26, 0.3, 4.0, 14), stoneM), x, 6.9, 0.75)); }
  const balc = new THREE.Group(); balc.position.set(0, 5.0, 0.6); g.add(balc); g.balcony = balc;   // balcony floor at y = 5.0 + 0.15, its front at z = 1.9
  balc.add(at(mesh(new THREE.BoxGeometry(6.4, 0.3, 2.6), stoneM), 0, 0, 0.65));
  for (let k = 0; k < 25; k++) balc.add(at(mesh(new THREE.BoxGeometry(0.04, 1.0, 0.04), iron), -3.1 + k * 0.258, 0.65, 1.9));
  for (const sx of [-1, 1]) for (let k = 0; k < 9; k++) balc.add(at(mesh(new THREE.BoxGeometry(0.04, 1.0, 0.04), iron), sx * 3.15, 0.65, -0.6 + k * 0.31));
  balc.add(at(mesh(new THREE.BoxGeometry(6.4, 0.06, 0.08), std('#c9a227', { metalness: 0.6, roughness: 0.35 })), 0, 1.15, 1.9));
  balc.add(at(mesh(new THREE.BoxGeometry(2.6, 3.0, 0.1), std('#2b2622')), 0, 1.65, 0.03));   // the balcony doorway, on the face of the central body
  // bell niche, clock and coat of arms on the central body
  const niche = new THREE.Shape(); niche.moveTo(-0.9, 0); niche.lineTo(0.9, 0); niche.lineTo(0.9, 1.4); niche.absarc(0, 1.4, 0.9, 0, Math.PI, false);
  g.add(at(mesh(new THREE.ShapeGeometry(niche, 16), std('#1f1a16')), 0, 13.4, 0.62));
  const bell = mesh(new THREE.LatheGeometry([[0.0, 0.85], [0.18, 0.84], [0.28, 0.7], [0.34, 0.3], [0.5, 0.0], [0.46, -0.02]].map(([a, b]) => new THREE.Vector2(a, b)), 20), std('#a8822a', { metalness: 0.6, roughness: 0.35, side: THREE.DoubleSide }));
  bell.position.set(0, 13.8, 0.7); g.add(bell); g.bell = bell;
  const face = canvasTex(256, 256, (x, W) => { x.fillStyle = '#f4efe2'; x.beginPath(); x.arc(128, 128, 120, 0, 7); x.fill(); x.strokeStyle = '#2a2420'; x.lineWidth = 8; x.stroke();
    x.fillStyle = '#2a2420'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; x.fillRect(128 + Math.sin(a) * 98 - 4, 128 - Math.cos(a) * 98 - 10, 8, 20); } });
  const clock = at(mesh(new THREE.CircleGeometry(0.75, 32), new THREE.MeshStandardMaterial({ map: face, roughness: 0.6 })), 0, 11.4, 0.63); g.add(clock);
  const hand = (len, wdt) => { const p = new THREE.Group(); p.add(at(mesh(new THREE.BoxGeometry(wdt, len, 0.02), std('#1d1a17')), 0, len / 2, 0)); p.position.set(0, 11.4, 0.66); g.add(p); return p; };
  g.clockH = hand(0.4, 0.07); g.clockM = hand(0.6, 0.05);
  g.setTime = (h, m) => { g.clockM.rotation.z = -m / 60 * Math.PI * 2; g.clockH.rotation.z = -((h % 12) + m / 60) / 12 * Math.PI * 2; };
  g.setTime(6, 0); dyn(g.clockH); dyn(g.clockM); dyn(g.bell);
  // roof flagpole
  const fp = new THREE.Group(); fp.position.set(0, H + 3.5, -2); g.add(fp); g.roofFlag = fp;
  return shadowy(g);
}
// Colonial block for the sides of a plaza: tezontle or cantera façade with portales on the ground floor and
// balconied windows above (one painted bay repeated along the front), stone cornice on top. Front face at z = d / 2.
export function colonialBlock(w = 26, h = 13, { col = '#a8643f', stone = '#d9ccb0', d = 8, seed = 0, portal = true } = {}) {
  const g = new THREE.Group(), r = rng(seed + 5), bays = Math.max(2, Math.round(w / 3.4));
  const face = canvasTex(128, 512, (x, W, H) => {
    x.fillStyle = col; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 500; i++) { x.fillStyle = r() > 0.5 ? 'rgba(0,0,0,.09)' : 'rgba(255,255,255,.07)'; x.fillRect(r() * W, r() * H, 2, 2); }
    x.fillStyle = stone; x.fillRect(0, 0, W, 16); x.fillRect(0, H * 0.33, W, 7); x.fillRect(0, H * 0.66, W, 7);
    if (portal) { x.fillStyle = stone; x.fillRect(0, H * 0.7, 14, H * 0.3); x.fillRect(W - 14, H * 0.7, 14, H * 0.3);
      x.fillStyle = '#2a201a'; x.beginPath(); x.moveTo(20, H); x.lineTo(20, H * 0.8); x.arc(W / 2, H * 0.8, W / 2 - 20, Math.PI, 0); x.lineTo(W - 20, H); x.fill(); }
    else { x.fillStyle = '#2a2622'; x.fillRect(38, H * 0.76, 52, H * 0.24); }
    for (const fy of [0.4, 0.08]) { const y0 = H * fy + 20;
      x.fillStyle = stone; x.fillRect(30, y0 - 8, 68, H * 0.2 + 16);
      x.fillStyle = '#34404c'; x.fillRect(38, y0, 52, H * 0.2);
      x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(40, y0 + 2, 10, H * 0.2 - 4);
      x.fillStyle = '#1d1d1f'; x.fillRect(30, y0 + H * 0.2 - 22, 68, 4); for (let k = 0; k < 7; k++) x.fillRect(32 + k * 10.5, y0 + H * 0.2 - 22, 2.5, 22); } });
  face.wrapS = THREE.RepeatWrapping; face.repeat.set(bays, 1);
  const side = std(col, { roughness: 0.9 }), front = new THREE.MeshStandardMaterial({ map: face, roughness: 0.9 });
  g.add(at(mesh(new THREE.BoxGeometry(w, h, d), [side, side, side, side, front, side]), 0, h / 2, 0));
  g.add(at(mesh(new THREE.BoxGeometry(w + 0.4, 0.5, d + 0.4), std(stone)), 0, h + 0.25, 0));
  return shadowy(g);
}
// Hundreds of far-off chibi fans as instanced bodies, heads and ears; .update(t) makes them bounce.
export function massCrowd(n, [x0, z0, x1, z1], { seed = 1, face = null, jump = 1 } = {}) {
  const r = rng(seed), g = new THREE.Group(), lam = () => new THREE.MeshLambertMaterial({ color: '#ffffff' });
  const body = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.15, 0.3, 4, 8), lam(), n), head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.17, 10, 8), lam(), n);
  const ear = new THREE.InstancedMesh(new THREE.ConeGeometry(0.045, 0.13, 4), lam(), n * 2);
  const clothes = ['#c0392b', '#2a5ab8', '#f2f0ea', '#e8c020', '#2f8a3a', '#1d1d1f', '#e86a9a', '#8a5a3a', '#4fb0d8', '#0f6b3f'], hair = ['#3a2a20', '#1d1612', '#6a4a30', '#2e2420', '#8a5a3a', '#c8a060'];
  const P = [], c = new THREE.Color();
  for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0), hc = hair[(r() * hair.length) | 0];
    P.push({ x, z, yaw: face ? Math.atan2(face[0] - x, face[1] - z) : r() * 6.28, ph: r() * 6.28, f: 1.6 + r() * 1.4, a: (0.03 + r() * 0.06) * jump });
    body.setColorAt(i, c.set(clothes[(r() * clothes.length) | 0])); head.setColorAt(i, c.set(hc)); ear.setColorAt(2 * i, c.set(hc)); ear.setColorAt(2 * i + 1, c.set(hc)); }
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3();
  g.update = t => { P.forEach((p, i) => { const b = p.a * Math.max(0, Math.sin(t * p.f * Math.PI + p.ph));
    q.setFromEuler(e.set(0, p.yaw, 0)); body.setMatrixAt(i, m.compose(v.set(p.x, 0.36 + b, p.z), q, one)); head.setMatrixAt(i, m.compose(v.set(p.x, 0.8 + b, p.z), q, one));
    for (const s of [-1, 1]) { q.setFromEuler(e.set(0, p.yaw, -s * 0.3)); const ox = s * 0.09; ear.setMatrixAt(2 * i + (s > 0 ? 1 : 0), m.compose(v.set(p.x + Math.cos(p.yaw) * ox, 0.97 + b, p.z - Math.sin(p.yaw) * ox), q, one)); } });
    body.instanceMatrix.needsUpdate = head.instanceMatrix.needsUpdate = ear.instanceMatrix.needsUpdate = true; };
  g.add(body, head, ear); g.update(0); [body, head, ear].forEach(o => { o.frustumCulled = false; }); return dyn(g);
}
// Metropolitan Cathedral (background): twin bell towers with domed caps, nave front and the central dome.
export function catedral() {
  const g = new THREE.Group(), s = std('#b7a68c', { roughness: 0.9 }), d = std('#9c8b72', { roughness: 0.9 }), dome = std('#c8b48a', { roughness: 0.7 });
  g.add(at(mesh(new THREE.BoxGeometry(14, 11, 10), s), 0, 5.5, 0));
  for (const x of [-8.5, 8.5]) { g.add(at(mesh(new THREE.BoxGeometry(5, 16, 5), s), x, 8, 1.5)); g.add(at(mesh(new THREE.BoxGeometry(4, 5, 4), d), x, 18.5, 1.5));
    const cap = mesh(new THREE.SphereGeometry(1.9, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), dome); cap.scale.y = 1.5; cap.position.set(x, 21, 1.5); g.add(cap); }
  g.add(at(mesh(new THREE.CylinderGeometry(3.2, 3.6, 3, 16), d), 0, 12.5, -2)); const dm = mesh(new THREE.SphereGeometry(3.2, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), dome); dm.position.set(0, 14, -2); g.add(dm);
  const fr = new THREE.Shape([new THREE.Vector2(-5, 0), new THREE.Vector2(5, 0), new THREE.Vector2(0, 3)]); g.add(at(mesh(new THREE.ExtrudeGeometry(fr, { depth: 0.5, bevelEnabled: false }), d), 0, 11, 5));
  for (let i = 0; i < 3; i++) g.add(at(mesh(new THREE.BoxGeometry(1.6, 3.6, 0.2), std('#3a2e24')), -3.2 + i * 3.2, 1.8, 5.05));
  return shadowy(g);
}
// Wall clock with settable hands: .set(h, m).
export function wallClock(r = 0.32) {
  const g = new THREE.Group();
  const face = canvasTex(256, 256, (x) => { x.fillStyle = '#fbf8f0'; x.beginPath(); x.arc(128, 128, 124, 0, 7); x.fill(); x.lineWidth = 10; x.strokeStyle = '#2a2420'; x.stroke();
    x.fillStyle = '#2a2420'; x.font = '700 30px Georgia'; x.textAlign = 'center'; x.textBaseline = 'middle'; for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2; x.fillText(String(i), 128 + Math.sin(a) * 92, 128 - Math.cos(a) * 92); } });
  g.add(mesh(new THREE.CylinderGeometry(r * 1.08, r * 1.08, 0.05, 32), std('#5a3a24')).rotateX(Math.PI / 2));
  g.add(at(mesh(new THREE.CircleGeometry(r, 32), new THREE.MeshStandardMaterial({ map: face, roughness: 0.5 })), 0, 0, 0.027));
  const hand = (len, w, c) => { const p = new THREE.Group(); p.add(at(mesh(new THREE.BoxGeometry(w, len, 0.01), std(c)), 0, len / 2 - 0.02, 0)); p.position.z = 0.035; g.add(p); return p; };
  const hh = hand(r * 0.55, r * 0.09, '#1d1a17'), mm = hand(r * 0.8, r * 0.06, '#1d1a17'), ss2 = hand(r * 0.85, r * 0.02, '#c0272d');
  g.set = (h, m, s = 0) => { mm.rotation.z = -m / 60 * Math.PI * 2; hh.rotation.z = -((h % 12) + m / 60) / 12 * Math.PI * 2; ss2.rotation.z = -s / 60 * Math.PI * 2; };
  g.set(6, 0); return g;
}
// Executive desk with a leather pad, name plate, phone and document trays; top surface at y = 0.76.
export function deskExec({ w = 1.9, d = 0.9, plate = '' } = {}) {
  const g = new THREE.Group(), wood = std('#4a2c1a', { roughness: 0.45 }), dark = std('#2c1a10', { roughness: 0.5 });
  g.add(at(mesh(new THREE.BoxGeometry(w, 0.06, d), wood), 0, 0.73, 0));
  for (const sx of [-1, 1]) g.add(at(mesh(new THREE.BoxGeometry(0.5, 0.7, d - 0.06), dark), sx * (w / 2 - 0.27), 0.35, 0));
  g.add(at(mesh(new THREE.BoxGeometry(w - 1.1, 0.5, 0.04), dark), 0, 0.45, d / 2 - 0.04));
  g.add(at(mesh(new THREE.BoxGeometry(0.9, 0.006, 0.55), std('#1f3a2a', { roughness: 0.7 })), 0, 0.763, 0.02));
  if (plate) { const t = canvasTex(256, 64, (x, W, H) => { x.fillStyle = '#c9a227'; x.fillRect(0, 0, W, H); x.fillStyle = '#2a1e10'; x.font = '700 30px Georgia'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(plate, W / 2, H / 2); });
    const wd = std('#2c1a10', { roughness: 0.5 }), p = mesh(new THREE.BoxGeometry(0.34, 0.07, 0.04), [wd, wd, wd, wd, new THREE.MeshStandardMaterial({ map: t, metalness: 0.15, roughness: 0.45 }), wd]);
    p.position.set(0, 0.8, d / 2 - 0.12); p.rotation.x = -0.4; g.add(p); }
  g.top = 0.763; return shadowy(g);
}
// Rubber stamp (handle up), ink pad, and a document that can show a perfect red seal (.sealed(k)).
export function stamp() {
  const g = new THREE.Group();
  g.add(at(mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.02, 16), std('#5a3a24')), 0, 0.01, 0));
  g.add(at(mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.07, 10), std('#7a4e2c')), 0, 0.055, 0));
  g.add(at(mesh(new THREE.SphereGeometry(0.022, 12, 10), std('#6a4026')), 0, 0.1, 0));
  g.add(at(mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.006, 16), std('#8a1a1a')), 0, -0.002, 0)); return dyn(g);
}
export function inkPad() { const g = new THREE.Group(); g.add(at(mesh(new THREE.BoxGeometry(0.12, 0.02, 0.08), std('#2a2a2e')), 0, 0.01, 0)); g.add(at(mesh(new THREE.BoxGeometry(0.1, 0.004, 0.06), std('#7a1010')), 0, 0.021, 0)); return g; }
export function documentSheet(seed = 0) {
  const r = rng(seed + 9);
  const t = canvasTex(160, 220, (x, W, H) => { x.fillStyle = '#fbf9f2'; x.fillRect(0, 0, W, H); x.fillStyle = '#2a2a30'; x.font = '700 11px Georgia'; x.fillText('GOBIERNO DE MÉXICO', 14, 22);
    x.fillStyle = '#6a6a70'; for (let i = 0; i < 14; i++) x.fillRect(14, 40 + i * 10, (W - 28) * (0.55 + r() * 0.45), 3); x.fillRect(W - 70, H - 40, 56, 2); });
  const g = new THREE.Group(), p = plane(0.21, 0.29, new THREE.MeshStandardMaterial({ map: t, roughness: 0.9, side: THREE.DoubleSide })); p.rotation.x = -Math.PI / 2; g.add(p);
  const sealT = canvasTex(128, 128, (x) => { x.strokeStyle = '#b3121a'; x.lineWidth = 7; x.beginPath(); x.arc(64, 64, 54, 0, 7); x.stroke(); x.lineWidth = 3; x.beginPath(); x.arc(64, 64, 42, 0, 7); x.stroke();
    x.fillStyle = '#b3121a'; x.font = '900 18px Georgia'; x.textAlign = 'center'; x.fillText('APROBADO', 64, 70); });
  const seal = plane(0.07, 0.07, new THREE.MeshBasicMaterial({ map: sealT, transparent: true, opacity: 0, depthWrite: false })); seal.rotation.x = -Math.PI / 2; seal.position.set(0.05, 0.001, 0.09); g.add(seal);
  g.sealed = k => { seal.material.opacity = k; }; return dyn(g);
}
// Conference table (top at y = 0.76) with leather chairs along both sides.
export function conferenceTable(len = 6, wid = 1.6) {
  const g = new THREE.Group(), wood = std('#5a3420', { roughness: 0.35 });
  const top = mesh(new THREE.CapsuleGeometry(wid / 2, len - wid, 8, 24), wood); top.rotation.z = Math.PI / 2; top.scale.set(1, 1, 0.04 / wid * 2); top.position.y = 0.74;
  g.add(at(mesh(new THREE.BoxGeometry(len - wid, 0.06, wid), wood), 0, 0.73, 0)); for (const sx of [-1, 1]) g.add(at(mesh(new THREE.CylinderGeometry(wid / 2, wid / 2, 0.06, 24, 1, false, sx > 0 ? 0 : Math.PI, Math.PI), wood), sx * (len - wid) / 2, 0.73, 0));
  for (const x of [-(len - wid) / 2.5, 0, (len - wid) / 2.5]) g.add(at(mesh(new THREE.BoxGeometry(0.3, 0.7, wid * 0.4), std('#3a2214')), x, 0.35, 0));
  g.top = 0.76; return shadowy(g);
}
export function officeChair(color = '#2a1c14') {
  const g = new THREE.Group(), l = std(color, { roughness: 0.5 });
  g.add(at(mesh(new THREE.BoxGeometry(0.56, 0.1, 0.52), l), 0, 0.47, 0)); g.add(at(mesh(new THREE.BoxGeometry(0.56, 0.75, 0.1), l), 0, 0.88, -0.24));
  g.add(at(cyl(0.03, 0.03, 0.4, '#3a3a3e', 8), 0, 0.24, 0)); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; g.add(at(mesh(new THREE.BoxGeometry(0.04, 0.03, 0.3), std('#3a3a3e')), Math.sin(a) * 0.15, 0.04, Math.cos(a) * 0.15, 0, a, 0)); }
  g.seatY = 0.52; return shadowy(g);
}
// Microphone on a gooseneck for a podium (head at the top, pointing +z).
export function micStand(h = 0.35) {
  const g = new THREE.Group(); const c = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, h * 0.6, 0.02), new THREE.Vector3(0, h, 0.1)]);
  g.add(mesh(new THREE.TubeGeometry(c, 16, 0.006, 6), std('#1d1d1f', { metalness: 0.6 }))); g.add(at(mesh(new THREE.SphereGeometry(0.018, 10, 8), std('#2a2a2e')), 0, h + 0.01, 0.12)); return g;
}
// Handheld microphone (grip along -y, head at +y).
export function handMic(col = '#c9a227') {
  const g = new THREE.Group(); g.add(at(mesh(new THREE.CylinderGeometry(0.014, 0.01, 0.16, 12), std('#1d1d1f', { metalness: 0.5 })), 0, 0, 0));
  g.add(at(mesh(new THREE.SphereGeometry(0.024, 14, 10), std(col, { metalness: 0.7, roughness: 0.3 })), 0, 0.09, 0)); return g;
}
// Desk handset phone (receiver on its cradle; .receiver can be held).
export function deskPhone() {
  const g = new THREE.Group(); g.add(at(mesh(new THREE.BoxGeometry(0.2, 0.06, 0.16), std('#1d1d20', { roughness: 0.4 })), 0, 0.03, 0));
  const rec = new THREE.Group(); rec.add(at(mesh(new THREE.BoxGeometry(0.2, 0.03, 0.04), std('#1d1d20', { roughness: 0.4 })), 0, 0, 0));
  for (const s of [-1, 1]) rec.add(at(mesh(new THREE.BoxGeometry(0.05, 0.04, 0.05), std('#1d1d20')), s * 0.09, -0.01, 0));
  rec.position.set(0, 0.075, -0.03); g.add(rec); g.receiver = rec; return dyn(g);
}
// Smartphone (screen faces +z).
export function smartphone(screen = '#2a6ad0') {
  const g = new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(0.075, 0.15, 0.009), std('#141518', { roughness: 0.3 })));
  g.add(at(mesh(new THREE.PlaneGeometry(0.068, 0.138), basic(screen)), 0, 0, 0.0051)); return g;
}

// ============================================================ Washington
// Oval Office pieces: the Resolute desk, a sofa, a pool table with balls and a cue.
export function resoluteDesk() {
  const g = new THREE.Group(), wood = std('#3e2412', { roughness: 0.4 }), carve = std('#5a361c', { roughness: 0.45 });
  g.add(at(mesh(new THREE.BoxGeometry(1.95, 0.07, 1.0), wood), 0, 0.77, 0)); g.add(at(mesh(new THREE.BoxGeometry(1.85, 0.72, 0.9), carve), 0, 0.37, 0));
  const seal = canvasTex(256, 256, (x) => { x.fillStyle = '#5a361c'; x.fillRect(0, 0, 256, 256); x.strokeStyle = '#c9a227'; x.lineWidth = 8; x.beginPath(); x.arc(128, 128, 100, 0, 7); x.stroke(); x.fillStyle = '#c9a227'; x.beginPath(); x.arc(128, 128, 60, 0, 7); x.fill(); });
  g.add(at(mesh(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshStandardMaterial({ map: seal, roughness: 0.5 })), 0, 0.38, 0.452));
  g.top = 0.805; return shadowy(g);
}
export function sofa(color = '#e8dcc0', len = 2.2) {
  const g = new THREE.Group(), f = std(color, { roughness: 0.9 });
  g.add(at(mesh(new THREE.BoxGeometry(len, 0.42, 0.85), f), 0, 0.21, 0)); g.add(at(mesh(new THREE.BoxGeometry(len, 0.55, 0.22), f), 0, 0.6, -0.32));
  for (const s of [-1, 1]) g.add(at(mesh(new THREE.BoxGeometry(0.2, 0.62, 0.85), f), s * (len / 2 - 0.1), 0.31, 0));
  g.seatY = 0.42; return shadowy(g);
}
// Pool table, felt top at y = 0.8, playing area 2.24 x 1.12; .balls[i] (0 = cue ball) positions in table space.
export function poolTable() {
  const g = new THREE.Group(), W = 2.24, D = 1.12, Y = 0.8, wood = std('#4a2a16', { roughness: 0.35 }), felt = std('#1f6a42', { roughness: 0.95 });
  g.add(at(mesh(new THREE.BoxGeometry(W, 0.04, D), felt), 0, Y - 0.02, 0));
  g.add(at(mesh(new THREE.BoxGeometry(W + 0.3, 0.16, D + 0.3), wood), 0, Y - 0.1, 0));
  for (const [x, z, w2, d2] of [[0, D / 2 + 0.08, W + 0.3, 0.16], [0, -D / 2 - 0.08, W + 0.3, 0.16], [W / 2 + 0.08, 0, 0.16, D], [-W / 2 - 0.08, 0, 0.16, D]]) g.add(at(mesh(new THREE.BoxGeometry(w2, 0.07, d2), wood), x, Y + 0.02, z));
  for (const [x, z] of [[-W / 2, -D / 2], [0, -D / 2 - 0.02], [W / 2, -D / 2], [-W / 2, D / 2], [0, D / 2 + 0.02], [W / 2, D / 2]]) g.add(at(mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 14), std('#0c0c0c')), x, Y + 0.002, z));
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(at(mesh(new THREE.CylinderGeometry(0.07, 0.05, Y - 0.18, 10), wood), x * (W / 2), (Y - 0.18) / 2, z * (D / 2)));
  const cols = ['#f8f6ee', '#e8c020', '#1f3fa0', '#c0201c', '#5a2a8a', '#e8701c', '#1f6a2a', '#7a1a1a', '#151515', '#e8c020', '#1f3fa0', '#c0201c', '#5a2a8a', '#e8701c', '#1f6a2a', '#7a1a1a'];
  g.balls = cols.map((c, i) => { const b = mesh(new THREE.SphereGeometry(0.028, 14, 10), std(c, { roughness: 0.25 })); g.add(b); return b; });
  // rack: triangle with its apex towards -x, cue ball at +x
  const rack = []; for (let row = 0; row < 5; row++) for (let k = 0; k <= row; k++) rack.push([-0.45 - row * 0.049, (k - row / 2) * 0.057]);
  g.rest = [[0.56, 0], ...rack]; g.place = (pos = g.rest) => g.balls.forEach((b, i) => b.position.set(pos[i][0], Y + 0.028, pos[i][1])); g.place();
  g.balls.forEach(dyn); g.Y = Y; g.W = W; g.D = D; return shadowy(g);
}
export function cue() { const g = new THREE.Group(); g.add(at(mesh(new THREE.CylinderGeometry(0.006, 0.014, 1.45, 10), std('#c8a06a', { roughness: 0.4 })), 0, 0, 0)); g.add(at(mesh(new THREE.CylinderGeometry(0.014, 0.015, 0.35, 10), std('#2a1a10')), 0, -0.55, 0)); g.add(at(mesh(new THREE.CylinderGeometry(0.0065, 0.006, 0.02, 8), std('#3a6ad0')), 0, 0.73, 0)); return dyn(g); }
// A Belgian Malinois-like dog (fawn, black mask) with a simple procedural rig: .pose({ sit, walk, wag, head }).
export function dog({ coat = '#b8833e', mask = '#2a1c12', s = 1 } = {}) {
  const g = new THREE.Group(), c = std(coat, { roughness: 0.9 }), m = std(mask, { roughness: 0.9 });
  const body = new THREE.Group(); body.position.y = 0.42; g.add(body);
  const torso = mesh(new THREE.CapsuleGeometry(0.13, 0.42, 6, 14), c); torso.rotation.z = Math.PI / 2; torso.rotation.y = Math.PI / 2; body.add(torso);
  const neck = new THREE.Group(); neck.position.set(0, 0.06, 0.26); body.add(neck);
  neck.add(at(mesh(new THREE.CapsuleGeometry(0.075, 0.14, 4, 10), c), 0, 0.08, 0.03, -0.5, 0, 0));
  const head = new THREE.Group(); head.position.set(0, 0.19, 0.09); neck.add(head);
  head.add(at(mesh(new THREE.SphereGeometry(0.095, 14, 12), c), 0, 0, 0)); const snout = mesh(new THREE.CapsuleGeometry(0.045, 0.1, 4, 10), m); snout.rotation.x = Math.PI / 2; snout.position.set(0, -0.025, 0.11); head.add(snout);
  head.add(at(mesh(new THREE.SphereGeometry(0.02, 8, 6), std('#0a0a0a', { roughness: 0.3 })), 0, -0.01, 0.18));
  for (const sx of [-1, 1]) { const ear = mesh(new THREE.ConeGeometry(0.04, 0.11, 4), m); ear.position.set(sx * 0.055, 0.1, -0.01); ear.rotation.z = -sx * 0.25; head.add(ear);
    head.add(at(mesh(new THREE.SphereGeometry(0.013, 8, 6), std('#1a120c', { roughness: 0.2 })), sx * 0.045, 0.02, 0.075)); }
  const tail = new THREE.Group(); tail.position.set(0, 0.04, -0.33); body.add(tail); tail.add(at(mesh(new THREE.CapsuleGeometry(0.025, 0.22, 4, 8), c), 0, 0.08, -0.08, 0.9, 0, 0));
  const legs = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => { const L = new THREE.Group(); L.position.set(sx * 0.08, -0.04, sz * 0.2); body.add(L);
    L.add(at(mesh(new THREE.CapsuleGeometry(0.035, 0.26, 4, 8), c), 0, -0.17, 0)); L.add(at(mesh(new THREE.SphereGeometry(0.04, 8, 6), m), 0, -0.36, 0.02)); L.front = sz > 0; L.side = sx; return L; });
  g.pose = ({ sit = 0, walk = null, wag = 0, head: hd = 0, t = 0 } = {}) => {
    const w = walk == null ? 0 : 1, ph = (walk || 0) * Math.PI * 2;
    body.rotation.x = -0.5 * sit; body.position.y = 0.42 - 0.12 * sit;
    legs.forEach((L, i) => { const sw = w * 0.5 * Math.sin(ph + (L.front ? 0 : Math.PI) + (L.side > 0 ? Math.PI : 0));
      L.rotation.x = L.front ? sw + 0.5 * sit : sw - 1.3 * sit; L.scale.y = 1; });
    tail.rotation.y = wag * 0.6 * Math.sin(t * 14); tail.rotation.x = -0.3 * sit;
    head.rotation.x = hd; neck.rotation.x = 0.3 * sit;
  };
  g.pose(); g.scale.setScalar(s); return dyn(shadowy(g));
}
// Iron fence with a double gate (opens with .open(k)) between stone piers.
export function gateFence(len = 30) {
  const g = new THREE.Group(), iron = std('#1d1d1f', { metalness: 0.5, roughness: 0.5 }), stone = std('#e8e2d4', { roughness: 0.85 });
  for (let x = -len / 2; x <= len / 2; x += 0.18) { if (Math.abs(x) < 1.6) continue; g.add(at(mesh(new THREE.BoxGeometry(0.025, 1.9, 0.025), iron), x, 0.95, 0)); }
  for (const y of [0.25, 1.75]) for (const sx of [-1, 1]) g.add(at(mesh(new THREE.BoxGeometry(len / 2 - 1.6, 0.04, 0.03), iron), sx * (len / 4 + 0.8), y, 0));
  for (const x of [-1.75, 1.75]) { g.add(at(mesh(new THREE.BoxGeometry(0.5, 2.6, 0.5), stone), x, 1.3, 0)); g.add(at(mesh(new THREE.SphereGeometry(0.22, 12, 10), stone), x, 2.75, 0)); }
  const leaf = sx => { const L = new THREE.Group(); L.position.set(sx * 1.5, 0, 0); g.add(L);
    for (let k = 0; k <= 8; k++) L.add(at(mesh(new THREE.BoxGeometry(0.025, 2.0, 0.025), iron), -sx * k * 0.18, 1.0, 0));
    for (const y of [0.25, 1.0, 1.8]) L.add(at(mesh(new THREE.BoxGeometry(1.5, 0.04, 0.03), iron), -sx * 0.75, y, 0)); return L; };
  const a = dyn(leaf(-1)), b = dyn(leaf(1));
  g.open = k => { a.rotation.y = -k * 1.7; b.rotation.y = k * 1.7; }; g.open(0);
  return shadowy(g);
}
// Private jet with Sirius' livery (navy and gold); .gear(k) raises the wheels; nose at +z. Origin under the main gear.
export function privateJet() {
  const g = new THREE.Group(), white = std('#f4f4f2', { roughness: 0.35, metalness: 0.1 }), navy = std('#1c2a4a', { roughness: 0.4 }), gold = std('#c9a227', { metalness: 0.6, roughness: 0.3 });
  const fus = mesh(new THREE.CapsuleGeometry(0.75, 7.5, 8, 20), white); fus.rotation.x = Math.PI / 2; fus.position.set(0, 1.55, 0.3); g.add(fus);
  const nose = mesh(new THREE.ConeGeometry(0.75, 1.6, 20), white); nose.rotation.x = Math.PI / 2; nose.position.set(0, 1.5, 4.95); g.add(nose);
  const belly = mesh(new THREE.CylinderGeometry(0.755, 0.755, 7.0, 20, 1, true, Math.PI * 0.62, Math.PI * 0.76), navy); belly.rotation.x = Math.PI / 2; belly.position.set(0, 1.55, 0.2); g.add(belly);
  const stripe = mesh(new THREE.CylinderGeometry(0.758, 0.758, 7.0, 20, 1, true, Math.PI * 0.6, Math.PI * 0.03), gold); stripe.rotation.x = Math.PI / 2; stripe.position.copy(belly.position); g.add(stripe);
  const stripe2 = stripe.clone(); stripe2.rotation.y = 0; stripe2.geometry = new THREE.CylinderGeometry(0.758, 0.758, 7.0, 20, 1, true, Math.PI * 1.37, Math.PI * 0.03); g.add(stripe2);
  for (let i = 0; i < 7; i++) for (const s of [-1, 1]) { const w = mesh(new THREE.CircleGeometry(0.11, 12), std('#1f2a36', { roughness: 0.2 })); w.position.set(s * 0.74, 1.72, 2.4 - i * 0.62); w.rotation.y = s * Math.PI / 2; g.add(w); }
  const cock = mesh(new THREE.SphereGeometry(0.62, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2.4), std('#1f2a36', { roughness: 0.15, metalness: 0.3 })); cock.position.set(0, 1.78, 4.3); cock.scale.set(1, 0.55, 1.2); g.add(cock);
  for (const s of [-1, 1]) {
    const wing = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(4.6, -1.2), new THREE.Vector2(4.8, -1.8), new THREE.Vector2(0, -1.9)]);
    const wm = mesh(new THREE.ExtrudeGeometry(wing, { depth: 0.12, bevelEnabled: false }), white); wm.rotation.x = Math.PI / 2; wm.scale.x = s; wm.position.set(s * 0.6, 1.25, 1.1); g.add(wm);
    const wl = mesh(new THREE.BoxGeometry(0.06, 0.5, 0.5), navy); wl.position.set(s * 5.35, 1.45, -0.3); g.add(wl);
    const eng = mesh(new THREE.CapsuleGeometry(0.32, 1.1, 6, 14), white); eng.rotation.x = Math.PI / 2; eng.position.set(s * 1.25, 2.0, -2.9); g.add(eng);
    g.add(at(mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.14, 14), navy), s * 1.25, 2.0, -2.2, Math.PI / 2, 0, 0));
    const hs = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(1.9, -0.6), new THREE.Vector2(1.9, -1.0), new THREE.Vector2(0, -1.1)]);
    const h = mesh(new THREE.ExtrudeGeometry(hs, { depth: 0.08, bevelEnabled: false }), white); h.rotation.x = Math.PI / 2; h.scale.x = s; h.position.set(0, 4.2, -3.4); g.add(h);
  }
  const fin = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(1.6, 0), new THREE.Vector2(2.4, 2.4), new THREE.Vector2(1.5, 2.4)]);
  const f = mesh(new THREE.ExtrudeGeometry(fin, { depth: 0.1, bevelEnabled: false }), navy); f.rotation.y = -Math.PI / 2; f.position.set(0.05, 2.0, -2.6); g.add(f);
  const star = canvasTex(128, 128, (x) => { x.fillStyle = '#c9a227'; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 24 : 58; x.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); } x.fill(); });
  for (const s of [-1, 1]) { const st = mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: star, transparent: true, side: THREE.DoubleSide })); st.position.set(s * 0.11, 3.3, -3.75); st.rotation.y = s * Math.PI / 2; g.add(st); }
  const gearG = new THREE.Group(); g.add(gearG);
  for (const [x, z] of [[-0.9, -0.4], [0.9, -0.4], [0, 3.9]]) { const leg = new THREE.Group(); leg.position.set(x, 1.0, z); gearG.add(leg);
    leg.add(at(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.75, 8), std('#9a9da2', { metalness: 0.5 })), 0, -0.38, 0)); leg.add(at(mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.18, 16), std('#1d1d1f')), 0, -0.74, 0, 0, 0, Math.PI / 2)); }
  g.gear = k => { gearG.children.forEach(l => { l.scale.y = Math.max(0.05, k); l.position.y = 1.0 + 0.0 * k; }); }; g.gear(1);
  // passenger door + airstair on the left
  const door = new THREE.Group(); door.position.set(-0.76, 0.9, 3.2); g.add(door);
  for (let i = 0; i < 5; i++) door.add(at(mesh(new THREE.BoxGeometry(0.6, 0.05, 0.22), white), -0.18 - i * 0.2, -0.16 * i - 0.05, 0));
  g.door = door; return dyn(shadowy(g));
}

// ============================================================ the world tour
const tree = (trunkH, crown, col, { trunk = '#6b4a2f', r = 1, seed = 0, blobs = 5, squash = 0.85 } = {}) => {
  const g = new THREE.Group(), rr = rng(seed + 31); g.add(at(mesh(new THREE.CylinderGeometry(0.06 * r, 0.1 * r, trunkH, 8), std(trunk)), 0, trunkH / 2, 0));
  for (let i = 0; i < blobs; i++) { const b = mesh(new THREE.IcosahedronGeometry(crown * (0.55 + rr() * 0.35), 1), std(Array.isArray(col) ? col[i % col.length] : col, { flatShading: true, roughness: 0.9 }));
    b.position.set((rr() - 0.5) * crown, trunkH + crown * 0.4 + rr() * crown * 0.5, (rr() - 0.5) * crown); b.scale.y = squash; g.add(b); }
  return shadowy(g);
};
// Canada
export const mapleTree = (s = 1, seed = 0) => { const t = tree(1.4 * s, 1.0 * s, ['#c0392b', '#d35400', '#e67e22', '#b03a2e'], { seed, r: s }); return t; };
export function logCabin() {
  const g = new THREE.Group(), log = std('#8a5a34', { roughness: 0.9 });
  for (let i = 0; i < 7; i++) for (const [w, d, x, z] of [[5, 0.3, 0, 1.8], [5, 0.3, 0, -1.8], [0.3, 3.9, 2.4, 0], [0.3, 3.9, -2.4, 0]]) { const c = mesh(new THREE.CylinderGeometry(0.17, 0.17, Math.max(w, d), 8), log); c.rotation.z = w > d ? Math.PI / 2 : 0; c.rotation.x = d > w ? Math.PI / 2 : 0; c.position.set(x, 0.17 + i * 0.32, z); g.add(c); }
  const roof = mesh(new THREE.ConeGeometry(3.9, 1.8, 4), std('#5a3a2a')); roof.rotation.y = Math.PI / 4; roof.scale.set(1.0, 1, 0.72); roof.position.y = 3.2; g.add(roof);
  g.add(at(box(0.9, 1.6, 0.1, '#4a2e1a'), 0.6, 0.8, 1.98)); g.add(at(box(0.7, 0.6, 0.1, '#ffe2a0'), -1.2, 1.3, 1.98)); g.add(at(box(0.5, 2.2, 0.5, '#7a7a76'), 1.6, 3.6, -0.6));
  return shadowy(g);
}
export function giftBox(label = 'MÉXICO', col = '#c8a070') {
  const g = new THREE.Group(), t = canvasTex(256, 128, (x, W, H) => { x.fillStyle = col; x.fillRect(0, 0, W, H); x.fillStyle = '#c0392b'; x.font = '900 34px Inter'; x.textAlign = 'center'; x.fillText(label, W / 2, H / 2 + 2); x.fillStyle = '#c0392b'; x.beginPath(); x.moveTo(W / 2, H - 46); x.lineTo(W / 2 + 14, H - 20); x.lineTo(W / 2, H - 26); x.lineTo(W / 2 - 14, H - 20); x.closePath(); x.fill(); });
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.85 }), plain = std(col);
  g.add(at(mesh(new THREE.BoxGeometry(0.6, 0.42, 0.45), [plain, plain, plain, plain, m, m]), 0, 0.21, 0)); g.add(at(box(0.62, 0.03, 0.1, '#c0392b'), 0, 0.43, 0));
  return dyn(shadowy(g));
}
export function syrupBottle() { const g = new THREE.Group(); g.add(at(mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.18, 12), std('#a8521a', { roughness: 0.2, transparent: true, opacity: 0.9 })), 0, 0.09, 0)); g.add(at(cyl(0.02, 0.02, 0.05, '#e8e2d4', 8), 0, 0.2, 0)); return g; }
export function blanket(col = '#c0392b') { const g = new THREE.Group(); for (let i = 0; i < 3; i++) g.add(at(box(0.5, 0.06, 0.36, i % 2 ? '#f2efe6' : col), 0, 0.03 + i * 0.06, 0)); return g; }
// Japan
export function torii(h = 4.2) {
  const g = new THREE.Group(), red = std('#c8321e', { roughness: 0.6 }), blk = std('#1d1a17');
  for (const sx of [-1, 1]) { g.add(at(mesh(new THREE.CylinderGeometry(0.17, 0.2, h, 14), red), sx * 1.5, h / 2, 0)); g.add(at(mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.4, 14), blk), sx * 1.5, 0.2, 0)); }
  g.add(at(box(4.0, 0.22, 0.32, '#c8321e'), 0, h - 0.7, 0)); const top = mesh(new THREE.BoxGeometry(4.8, 0.3, 0.45), blk); top.position.y = h + 0.05; g.add(top);
  const kasagi = mesh(new THREE.BoxGeometry(4.6, 0.22, 0.4), red); kasagi.position.y = h - 0.15; g.add(kasagi); g.add(at(box(0.22, 0.6, 0.2, '#c8321e'), 0, h - 0.4, 0));
  return shadowy(g);
}
export const sakura = (s = 1, seed = 0) => tree(1.2 * s, 1.1 * s, ['#f6b8cc', '#f9c9d8', '#f2a5be', '#fbd6e2'], { seed, r: s, trunk: '#4a3028', blobs: 6 });
export function stoneLantern() { const g = new THREE.Group(), st = std('#9a978e', { roughness: 0.95 }); g.add(at(mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.2, 6), st), 0, 0.1, 0)); g.add(at(mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.7, 8), st), 0, 0.55, 0));
  g.add(at(mesh(new THREE.BoxGeometry(0.4, 0.3, 0.4), st), 0, 1.05, 0)); g.add(at(mesh(new THREE.BoxGeometry(0.22, 0.16, 0.42), basic('#ffe0a0')), 0, 1.05, 0)); g.add(at(mesh(new THREE.ConeGeometry(0.42, 0.3, 4), st), 0, 1.35, 0, 0, Math.PI / 4, 0)); return shadowy(g); }
export function fuji(h = 26) { const g = new THREE.Group(); g.add(mesh(new THREE.ConeGeometry(h * 1.6, h, 40, 1, true), std('#5a6a8a', { roughness: 1 })).translateY(h / 2)); const cap = mesh(new THREE.ConeGeometry(h * 0.55, h * 0.35, 40), std('#f4f6fa', { roughness: 0.9 })); cap.position.y = h * 0.84; g.add(cap); return g; }
// Germany
export function clockTower() {
  const g = new THREE.Group(), st = std('#c8b89a', { roughness: 0.9 }), roofM = std('#3a5a4a', { roughness: 0.7 });
  g.add(at(mesh(new THREE.BoxGeometry(10, 9, 5), st), 0, 4.5, 0)); g.add(at(mesh(new THREE.BoxGeometry(3.2, 20, 3.2), st), 0, 10, 0.5));
  const sp = mesh(new THREE.ConeGeometry(2.4, 5, 4), roofM); sp.rotation.y = Math.PI / 4; sp.position.set(0, 22.5, 0.5); g.add(sp);
  for (let i = 0; i < 6; i++) for (let f = 0; f < 2; f++) if (Math.abs(i - 2.5) > 1) g.add(at(mesh(new THREE.PlaneGeometry(0.9, 1.6), std('#2a3440')), -4 + i * 1.6, 2.2 + f * 3.4, 2.51));
  const roof = mesh(new THREE.ConeGeometry(7.2, 3, 4), std('#8a3a2a')); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.5); roof.position.y = 10.5; g.add(roof);
  const ck = wallClock(1.1); ck.position.set(0, 16, 2.15); g.add(ck); g.clock = ck; return shadowy(g);
}
export function halfTimber(w = 5, seed = 0) {
  const g = new THREE.Group(), r = rng(seed + 5), wallC = ['#f2e8d4', '#efe2c8', '#f6eedf'][seed % 3];
  g.add(at(mesh(new THREE.BoxGeometry(w, 7, 5), std(wallC)), 0, 3.5, 0));
  const beam = std('#4a2c1a'); for (const y of [0.2, 3.4, 6.8]) g.add(at(box(w + 0.05, 0.2, 0.06, '#4a2c1a'), 0, y, 2.52));
  for (let i = 0; i <= Math.round(w / 1.2); i++) { const x = -w / 2 + i * w / Math.round(w / 1.2); g.add(at(box(0.18, 7, 0.06, '#4a2c1a'), x, 3.5, 2.52)); const d = mesh(new THREE.BoxGeometry(0.15, 3.6, 0.05), beam); d.rotation.z = (i % 2 ? 1 : -1) * 0.35; d.position.set(x + 0.5, 5.1, 2.53); if (i < Math.round(w / 1.2)) g.add(d); }
  const roof = mesh(new THREE.ConeGeometry(w * 0.85, 3.4, 4), std('#9a3a2a')); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.75); roof.position.y = 8.6; g.add(roof);
  for (let i = 0; i < 3; i++) g.add(at(mesh(new THREE.PlaneGeometry(0.8, 1.0), std('#3a4a5a')), -w / 3 + i * w / 3, 4.8, 2.56));
  return shadowy(g);
}
// France
export function eiffel(h = 30) {
  const g = new THREE.Group(), m = std('#7a5a40', { roughness: 0.7, metalness: 0.3 });
  const lvl = [[0, 9.5], [0.19, 5.0], [0.38, 3.0], [0.62, 1.2], [1, 0.3]];
  for (let k = 0; k < lvl.length - 1; k++) { const [y0, w0] = lvl[k], [y1, w1] = lvl[k + 1];
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const a = new THREE.Vector3(sx * w0 / 2, y0 * h, sz * w0 / 2), b = new THREE.Vector3(sx * w1 / 2, y1 * h, sz * w1 / 2);
      const L = a.distanceTo(b), c = mesh(new THREE.BoxGeometry(0.35 * (1 - y0 * 0.7), L, 0.35 * (1 - y0 * 0.7)), m); c.position.copy(a).add(b).multiplyScalar(0.5); c.lookAt(b); c.rotateX(Math.PI / 2); g.add(c); }
    if (k < 3) { const pw = w1 + 0.6; g.add(at(mesh(new THREE.BoxGeometry(pw, 0.35, pw), m), 0, y1 * h, 0)); }
    for (let j = 0; j < 4; j++) for (let q = 0; q < 6; q++) { const t = q / 6, yy = (y0 + (y1 - y0) * t) * h, ww = w0 + (w1 - w0) * t, ang = j * Math.PI / 2;
      const br = mesh(new THREE.BoxGeometry(ww, 0.07, 0.07), m); br.position.set(Math.sin(ang) * ww / 2, yy, Math.cos(ang) * ww / 2); br.rotation.y = ang; br.rotation.z = (q % 2 ? 0.5 : -0.5); g.add(br); } }
  const arch = mesh(new THREE.TorusGeometry(3.2, 0.3, 6, 24, Math.PI), m); arch.position.set(0, 2.6, 4.6); g.add(arch); const arch2 = arch.clone(); arch2.position.set(0, 2.6, -4.6); g.add(arch2);
  g.add(at(mesh(new THREE.ConeGeometry(0.22, 2.6, 6), m), 0, h + 1.2, 0)); return shadowy(g);
}
export function patisserie() {
  const g = new THREE.Group();
  g.add(at(mesh(new THREE.BoxGeometry(7, 5.5, 3), std('#f2ecdf')), 0, 2.75, -1.5));
  const sign = canvasTex(512, 96, (x, W, H) => { x.fillStyle = '#2a3a5a'; x.fillRect(0, 0, W, H); x.fillStyle = '#e8c860'; x.font = 'italic 700 52px Georgia'; x.textAlign = 'center'; x.fillText('Pâtisserie', W / 2, 64); });
  g.add(at(mesh(new THREE.PlaneGeometry(4.2, 0.8), new THREE.MeshStandardMaterial({ map: sign })), 0, 3.9, 0.02));
  const aw = canvasTex(256, 64, (x, W, H) => { for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#c0392b'; x.fillRect(i * W / 16, 0, W / 16 + 1, H); } });
  const awn = mesh(new THREE.PlaneGeometry(6.2, 1.2), new THREE.MeshStandardMaterial({ map: aw, side: THREE.DoubleSide })); awn.position.set(0, 3.15, 0.5); awn.rotation.x = -1.0; g.add(awn);
  g.add(at(mesh(new THREE.PlaneGeometry(5.4, 1.9), std('#d8e8f0', { roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.35 })), 0, 1.55, 0.05));
  g.add(at(box(5.6, 0.12, 0.7, '#e8dcc0'), 0, 0.85, -0.3));
  const cols = ['#f6c6d6', '#7a4a2a', '#f2e6b8', '#c0392b', '#8fd0a0', '#f4a460'];
  for (let i = 0; i < 9; i++) { const c = cake(cols[i % 6], 0.55); c.position.set(-2.4 + i * 0.6, 0.91, -0.3); g.add(c); }
  g.add(at(box(1.0, 2.2, 0.05, '#2a3a5a'), 2.9, 1.1, 0.02));
  return shadowy(g);
}
export function cake(col = '#f6c6d6', s = 1) {
  const g = new THREE.Group(); g.add(at(mesh(new THREE.CylinderGeometry(0.16 * s, 0.17 * s, 0.14 * s, 18), std(col, { roughness: 0.6 })), 0, 0.07 * s, 0));
  g.add(at(mesh(new THREE.CylinderGeometry(0.165 * s, 0.165 * s, 0.03 * s, 18), std('#fff8ec')), 0, 0.15 * s, 0)); g.add(at(mesh(new THREE.SphereGeometry(0.035 * s, 10, 8), std('#c0182a', { roughness: 0.3 })), 0, 0.19 * s, 0)); return g;
}
// Italy and San Marino
export function colosseum() {
  const g = new THREE.Group(), st = std('#d8c4a0', { roughness: 0.95 }), dark = std('#7a6a52');
  const A = 9, B = 7.2;
  for (let lvl = 0; lvl < 4; lvl++) { const n = 40, ph = lvl === 3 ? 2.0 : 2.8, y0 = lvl * 2.9;
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; if (lvl === 3 && i > 22) continue; if (lvl >= 2 && i > 30) continue;
      const x = Math.cos(a) * A, z = Math.sin(a) * B, pier = mesh(new THREE.BoxGeometry(0.55, ph, 0.9), st); pier.position.set(x, y0 + ph / 2, z); pier.rotation.y = -a; g.add(pier);
      const lin = mesh(new THREE.BoxGeometry(1.45, 0.4, 0.95), st); lin.position.set(Math.cos(a + Math.PI / n) * A, y0 + ph - 0.2, Math.sin(a + Math.PI / n) * B); lin.rotation.y = -a - Math.PI / 2 + Math.PI / 2; g.add(lin); } }
  const inner = mesh(new THREE.CylinderGeometry(1, 1, 7, 48, 1, true), new THREE.MeshStandardMaterial({ color: '#b8a480', side: THREE.DoubleSide })); inner.scale.set(A - 1.4, 1, B - 1.4); inner.position.y = 3.5; g.add(inner);
  return shadowy(g);
}
export const cypress = (s = 1, seed = 0) => { const g = new THREE.Group(); g.add(at(cyl(0.08 * s, 0.1 * s, 0.6 * s, '#5a3a24', 6), 0, 0.3 * s, 0)); const c = mesh(new THREE.ConeGeometry(0.45 * s, 3.6 * s, 10), std('#2f4a2a', { roughness: 0.95 })); c.position.y = 2.2 * s; c.scale.x = 0.9; g.add(c); return shadowy(g); };
export function sanMarino() {
  const g = new THREE.Group(), rock = std('#9a8a72', { roughness: 1, flatShading: true }), st = std('#d8ccb4', { roughness: 0.9 });
  const hill = mesh(new THREE.IcosahedronGeometry(9, 2), rock); hill.scale.set(1.4, 0.75, 0.9); hill.position.y = -1.5; g.add(hill);
  for (const [x, z, h] of [[-5, 0.5, 4.2], [0, 1, 3.4], [5, 0.2, 2.8]]) { const tw = new THREE.Group(); tw.add(at(mesh(new THREE.BoxGeometry(1.4, h, 1.4), st), 0, h / 2, 0)); for (let k = 0; k < 4; k++) tw.add(at(mesh(new THREE.BoxGeometry(0.3, 0.4, 0.3), st), (k % 2 ? 0.55 : -0.55), h + 0.2, (k < 2 ? 0.55 : -0.55)));
    const cap = mesh(new THREE.ConeGeometry(0.9, 1.4, 4), std('#8a3a2a')); cap.rotation.y = Math.PI / 4; cap.position.y = h + 1.0; tw.add(cap); tw.position.set(x, 5.2 - Math.abs(x) * 0.12, z); g.add(tw); }
  return shadowy(g);
}
// Australia
export function uluru() { const g = new THREE.Group(); const m = mesh(new THREE.SphereGeometry(10, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), std('#b5502a', { roughness: 1, flatShading: true })); m.scale.set(3.2, 0.9, 1.2); g.add(m); return g; }
export const eucalyptus = (s = 1, seed = 0) => tree(2.2 * s, 1.2 * s, ['#7a9a6a', '#8aa878', '#6a8a5a'], { seed, r: s, trunk: '#e8e2d4', blobs: 4, squash: 0.6 });
// Emu: grey-brown body, long neck, two legs; .pose(t, run) animates a run cycle.
export function emu() {
  const g = new THREE.Group(), f = std('#6a5a48', { roughness: 1 }), skin = std('#3a4a6a'), legM = std('#5a4a3a');
  const body = new THREE.Group(); body.position.y = 1.0; g.add(body);
  const b = mesh(new THREE.SphereGeometry(0.4, 14, 10), f); b.scale.set(0.8, 0.75, 1.1); body.add(b);
  const neck = mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.7, 8), skin); neck.position.set(0, 0.4, 0.32); neck.rotation.x = 0.3; body.add(neck);
  const head = mesh(new THREE.SphereGeometry(0.09, 10, 8), skin); head.position.set(0, 0.76, 0.44); body.add(head); body.add(at(mesh(new THREE.ConeGeometry(0.035, 0.12, 6), std('#2a2420')), 0, 0.74, 0.55, Math.PI / 2, 0, 0));
  const legs = [-1, 1].map(sx => { const L = new THREE.Group(); L.position.set(sx * 0.12, -0.15, 0); body.add(L); L.add(at(mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.85, 6), legM), 0, -0.42, 0)); L.add(at(box(0.1, 0.03, 0.16, '#5a4a3a'), 0, -0.85, 0.05)); return L; });
  g.pose = (t, run = 1) => { const ph = t * 9 * run; legs.forEach((L, i) => L.rotation.x = Math.sin(ph + i * Math.PI) * 0.7 * run); body.position.y = 1.0 + 0.05 * Math.abs(Math.sin(ph)) * run; neck.rotation.x = 0.3 + 0.1 * Math.sin(ph * 2) * run; };
  g.pose(0, 0); return dyn(shadowy(g));
}
// South Korea (Seoul by night): towers with lit windows and coloured neon strips (no lettering), N Seoul Tower.
export function neonBlock(w = 6, h = 18, seed = 0) {
  const g = new THREE.Group(), r = rng(seed + 61);
  const win = canvasTex(128, 256, (x, W, H) => { x.fillStyle = '#1a1e2a'; x.fillRect(0, 0, W, H); for (let j = 0; j < 24; j++) for (let i = 0; i < 8; i++) { x.fillStyle = r() < 0.55 ? ['#ffd890', '#ffe8c0', '#9fd0ff'][(r() * 3) | 0] : '#232838'; x.fillRect(i * 16 + 3, j * 10 + 2, 10, 6); } });
  const m = new THREE.MeshStandardMaterial({ map: win, emissiveMap: win, emissive: '#ffffff', emissiveIntensity: 0.8, roughness: 0.6 });
  g.add(at(mesh(new THREE.BoxGeometry(w, h, w), m), 0, h / 2, 0));
  const neon = ['#ff3d8a', '#3de0ff', '#b84dff', '#ffe03d', '#3dff8a'];
  for (let i = 0; i < 3; i++) { const c = neon[(seed + i) % neon.length]; g.add(at(mesh(new THREE.BoxGeometry(w * (0.4 + r() * 0.4), 0.5, 0.1), basic(c)), (r() - 0.5) * w * 0.3, h * (0.25 + i * 0.22), w / 2 + 0.06)); }
  return g;
}
export function seoulTower() { const g = new THREE.Group(), m = std('#d8dce4', { roughness: 0.5 }); g.add(at(mesh(new THREE.CylinderGeometry(0.6, 1.4, 22, 16), m), 0, 11, 0)); g.add(at(mesh(new THREE.CylinderGeometry(2.6, 2.2, 2.4, 20), m), 0, 21, 0)); g.add(at(mesh(new THREE.CylinderGeometry(2.62, 2.62, 0.8, 20), basic('#ff8ad0')), 0, 21.2, 0)); g.add(at(mesh(new THREE.CylinderGeometry(0.15, 0.3, 8, 8), m), 0, 26, 0)); return g; }
// Colombia (Cartagena): bright two-storey houses with wooden balconies and bougainvillea.
export function casaColonial(col = '#f2c14e', w = 5, seed = 0) {
  const g = new THREE.Group();
  g.add(at(mesh(new THREE.BoxGeometry(w, 6, 4), std(col, { roughness: 0.9 })), 0, 3, 0)); g.add(at(box(w + 0.2, 0.3, 4.2, '#f6efe0'), 0, 6.1, 0));
  for (let i = 0; i < 2; i++) { const x = -w / 4 + i * w / 2; g.add(at(box(1.0, 2.0, 0.1, '#5a3a24'), x, 1.1, 2.02)); g.add(at(box(1.0, 1.6, 0.1, '#3a5a7a'), x, 4.0, 2.02)); }
  const balc = new THREE.Group(); balc.position.set(0, 3.0, 2.4); g.add(balc); balc.add(at(box(w * 0.85, 0.12, 0.8, '#6a4228'), 0, 0, 0)); for (let k = 0; k < 14; k++) balc.add(at(box(0.05, 0.8, 0.05, '#6a4228'), -w * 0.42 + k * w * 0.85 / 13, 0.4, 0.38));
  balc.add(at(box(w * 0.85, 0.1, 0.06, '#6a4228'), 0, 0.82, 0.38)); balc.add(at(box(w * 0.85 + 0.2, 0.12, 1.0, '#8a5a34'), 0, 2.4, -0.05));
  const bg = std('#d6336c', { roughness: 0.9, flatShading: true }), r = rng(seed + 3); for (let k = 0; k < 6; k++) { const b = mesh(new THREE.IcosahedronGeometry(0.35 + r() * 0.2, 0), bg); b.position.set(-w / 2 + 0.4 + r() * 1.0, 2.4 + r() * 2.8, 2.15); g.add(b); }
  return shadowy(g);
}
// Brazil: Sugarloaf (two rounded granite peaks) and the Christ the Redeemer silhouette on Corcovado.
export function sugarloaf() { const g = new THREE.Group(), m = std('#6a7462', { roughness: 1, flatShading: true });
  const a = mesh(new THREE.SphereGeometry(9, 20, 14), m); a.scale.set(0.9, 2.2, 0.9); a.position.set(0, 0, 0); g.add(a); const b = mesh(new THREE.SphereGeometry(7, 18, 12), m); b.scale.set(1.3, 1.1, 1); b.position.set(-14, 0, 4); g.add(b);
  const veg = std('#3f6a3a', { roughness: 1, flatShading: true }); for (const [x, z, s] of [[-6, 6, 4], [5, 7, 3.5], [-18, 9, 4]]) { const v = mesh(new THREE.IcosahedronGeometry(s, 1), veg); v.position.set(x, 1.5, z); v.scale.y = 0.6; g.add(v); } return g; }
export function christStatue(h = 3) { const g = new THREE.Group(), m = std('#e8e2d4', { roughness: 0.8 }); g.add(at(mesh(new THREE.BoxGeometry(0.5, 0.8, 0.5), m), 0, 0.4, 0)); g.add(at(mesh(new THREE.CylinderGeometry(0.22, 0.35, h * 0.7, 10), m), 0, 0.8 + h * 0.35, 0));
  g.add(at(mesh(new THREE.BoxGeometry(h * 0.95, 0.2, 0.2), m), 0, 0.8 + h * 0.62, 0)); g.add(at(mesh(new THREE.SphereGeometry(0.17, 10, 8), m), 0, 0.8 + h * 0.78, 0)); return g; }
// Argentina: the Obelisco of Buenos Aires.
export function obelisco(h = 26) { const g = new THREE.Group(), m = std('#eee8dc', { roughness: 0.7 }); const sh = mesh(new THREE.CylinderGeometry(0.9, 1.7, h, 4), m); sh.rotation.y = Math.PI / 4; sh.position.y = h / 2; g.add(sh);
  const tip = mesh(new THREE.ConeGeometry(1.27, 2.2, 4), m); tip.rotation.y = Math.PI / 4; tip.position.y = h + 1.1; g.add(tip); g.add(at(mesh(new THREE.PlaneGeometry(0.5, 0.9), std('#3a3a3a')), 0, 0.45, 1.2)); return shadowy(g); }
export const jacaranda = (s = 1, seed = 0) => tree(1.6 * s, 1.2 * s, ['#9a7ad8', '#b08ae0', '#8a6ac8'], { seed, r: s, trunk: '#4a3a2a', blobs: 5, squash: 0.7 });
// Switzerland: Matterhorn-like peak and a chalet.
export function matterhorn(h = 40) { const g = new THREE.Group(); const m = mesh(new THREE.ConeGeometry(h * 0.45, h, 5, 3), std('#6a6a74', { roughness: 1, flatShading: true })); m.position.y = h / 2; m.rotation.y = 0.4;
  const p = m.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y > -h / 2 + 1 && y < h / 2 - 1) { p.setX(i, p.getX(i) * (1 + 0.15 * Math.sin(i * 1.7))); p.setZ(i, p.getZ(i) * (1 + 0.12 * Math.cos(i * 2.3))); } } m.geometry.computeVertexNormals(); g.add(m);
  const snow = mesh(new THREE.ConeGeometry(h * 0.2, h * 0.42, 5), std('#f4f6fa', { roughness: 0.9, flatShading: true })); snow.position.y = h * 0.79; snow.rotation.y = 0.4; g.add(snow); return g; }
export function chalet() { const g = new THREE.Group(); g.add(at(mesh(new THREE.BoxGeometry(5, 3, 4), std('#8a5a34')), 0, 1.5, 0)); g.add(at(mesh(new THREE.BoxGeometry(5.1, 1.2, 4.1), std('#e8e2d4')), 0, 0.6, 0));
  const roof = mesh(new THREE.ConeGeometry(4.2, 2.0, 4), std('#5a3a2a')); roof.rotation.y = Math.PI / 4; roof.scale.set(1.2, 1, 0.9); roof.position.y = 4.0; g.add(roof);
  for (let i = 0; i < 3; i++) g.add(at(box(0.7, 0.8, 0.08, '#e8e2d4'), -1.6 + i * 1.6, 2.1, 2.02)); g.add(at(box(4.4, 0.1, 0.6, '#6a4228'), 0, 1.4, 2.3)); return shadowy(g); }
// Monaco: yachts in the harbour and the casino front.
export function yacht(len = 8, col = '#f4f4f2') { const g = new THREE.Group(); const hull = mesh(new THREE.CapsuleGeometry(1.1, len, 6, 14), std(col, { roughness: 0.3 })); hull.rotation.x = Math.PI / 2; hull.scale.set(1, 1, 0.55); hull.position.y = 0.4; g.add(hull);
  g.add(at(mesh(new THREE.BoxGeometry(1.8, 1.0, len * 0.5), std('#ffffff', { roughness: 0.3 })), 0, 1.2, -0.5)); g.add(at(mesh(new THREE.BoxGeometry(1.6, 0.25, len * 0.45), std('#2a3a4a', { roughness: 0.2 })), 0, 1.5, -0.5));
  g.add(at(mesh(new THREE.BoxGeometry(1.2, 0.7, len * 0.25), std('#ffffff')), 0, 1.9, -0.9)); return g; }
export function casino() { const g = new THREE.Group(), st = std('#efe2c4', { roughness: 0.8 }); g.add(at(mesh(new THREE.BoxGeometry(14, 6, 6), st), 0, 3, 0));
  for (const x of [-5.5, 5.5]) { g.add(at(mesh(new THREE.BoxGeometry(2.2, 9, 2.2), st), x, 4.5, 2)); const d = mesh(new THREE.SphereGeometry(1.2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), std('#5a7a6a')); d.position.set(x, 9, 2); g.add(d); }
  for (let i = 0; i < 6; i++) g.add(at(mesh(new THREE.PlaneGeometry(0.9, 2.2), std('#2a3a4a')), -3.5 + i * 1.4, 2.2, 3.01)); g.add(at(box(14.4, 0.4, 6.4, '#d8c8a8'), 0, 6.2, 0)); return shadowy(g); }
// Geneva summit: round table with a gap, chairs, flags on poles behind.
export function summitTable(R = 4.2) { const g = new THREE.Group(), w = std('#6a4428', { roughness: 0.4 });
  const top = mesh(new THREE.RingGeometry(R - 0.9, R, 64, 1, 0.35, Math.PI * 2 - 0.7), w); top.rotation.x = -Math.PI / 2; top.position.y = 0.76; g.add(top);
  const edge = mesh(new THREE.CylinderGeometry(R, R, 0.08, 64, 1, true, 0.35 + Math.PI / 2, Math.PI * 2 - 0.7), w); edge.position.y = 0.72; g.add(edge);
  for (let i = 0; i < 10; i++) { const a = 0.6 + i * (Math.PI * 2 - 1.2) / 9; g.add(at(mesh(new THREE.BoxGeometry(0.12, 0.72, 0.12), w), Math.sin(a) * (R - 0.45), 0.36, Math.cos(a) * (R - 0.45))); }
  const felt = mesh(new THREE.CircleGeometry(R - 0.95, 48), std('#2a4a7a', { roughness: 1 })); felt.rotation.x = -Math.PI / 2; felt.position.y = 0.01; g.add(felt);
  g.top = 0.77; return shadowy(g); }

// ============================================================ racecourse
// Starting gate for n runners along x (stall width w); the front doors open with .open(k). Runners face +z.
export function startGate(n = 6, w = 1.4) {
  const g = new THREE.Group(), frame = std('#e8e6e0', { metalness: 0.4, roughness: 0.4 }), green = std('#2f7a3a', { roughness: 0.6 });
  const W = n * w;
  g.add(at(mesh(new THREE.BoxGeometry(W + 0.6, 0.35, 2.2), frame), 0, 3.0, 0)); g.add(at(mesh(new THREE.BoxGeometry(W + 0.6, 0.6, 0.12), green), 0, 3.35, 1.1));
  for (let i = 0; i <= n; i++) { const x = -W / 2 + i * w; g.add(at(mesh(new THREE.BoxGeometry(0.1, 3.0, 2.2), frame), x, 1.5, 0)); g.add(at(mesh(new THREE.BoxGeometry(0.06, 1.2, 1.8), green), x, 1.3, 0)); }
  const numT = i => canvasTex(64, 64, (x) => { x.fillStyle = ['#ffffff', '#1d1d1f', '#c0392b', '#2a5ab8', '#e8c020', '#2f8a3a'][i % 6]; x.fillRect(0, 0, 64, 64); x.fillStyle = i % 6 === 0 || i % 6 === 4 ? '#1d1d1f' : '#ffffff'; x.font = '900 44px Inter'; x.textAlign = 'center'; x.fillText(String(i + 1), 32, 48); });
  g.doors = [];
  for (let i = 0; i < n; i++) { const x = -W / 2 + (i + 0.5) * w;
    g.add(at(mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: numT(i) })), x, 2.55, 1.12));
    for (const s of [-1, 1]) { const d = new THREE.Group(); d.position.set(x + s * w / 2 - s * 0.05, 0, 1.1); g.add(d);
      d.add(at(mesh(new THREE.BoxGeometry(w / 2 - 0.08, 1.7, 0.05), std('#d8d8d4', { metalness: 0.3 })), -s * (w / 4 - 0.02), 1.15, 0)); d.side = s; g.doors.push(d); } }
  g.doors.forEach(dyn); g.open = k => g.doors.forEach(d => d.rotation.y = d.side * k * 1.7); g.open(0);
  return shadowy(g);
}
// Finish post: white pole with the round red-and-white disc, and the photo-finish camera box.
export function finishPost() { const g = new THREE.Group(); g.add(at(cyl(0.08, 0.1, 4.4, '#f4f4f2', 10), 0, 2.2, 0));
  const disc = canvasTex(128, 128, (x) => { x.fillStyle = '#ffffff'; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill(); x.fillStyle = '#c0392b'; x.beginPath(); x.arc(64, 64, 40, 0, 7); x.fill(); });
  const d = mesh(new THREE.CircleGeometry(0.6, 32), new THREE.MeshBasicMaterial({ map: disc, side: THREE.DoubleSide })); d.position.y = 4.6; g.add(d); g.add(at(box(0.5, 0.4, 0.5, '#2a2a2e'), 0, 3.6, 0)); return shadowy(g); }
// Grandstand along x (length L), tiers rising away from the track (+z), roof on columns, a seated crowd of coloured dots.
export function grandstand(L = 70, rows = 12) {
  const g = new THREE.Group(), con = std('#cfcbc2', { roughness: 0.9 }), r = rng(77);
  for (let i = 0; i < rows; i++) g.add(at(mesh(new THREE.BoxGeometry(L, 0.45, 0.9), con), 0, 0.8 + i * 0.45, 1.2 + i * 0.9));
  g.add(at(mesh(new THREE.BoxGeometry(L, rows * 0.45 + 1, 1.0), con), 0, (rows * 0.45 + 1) / 2, 1.2 + rows * 0.9 + 0.3));
  const roofH = rows * 0.45 + 5; const roof = mesh(new THREE.BoxGeometry(L + 2, 0.3, rows * 0.9 + 5), std('#f2f0ea')); roof.position.set(0, roofH, 1.2 + rows * 0.45 - 1); roof.rotation.x = -0.12; g.add(roof);
  for (let i = 0; i <= 8; i++) g.add(at(cyl(0.18, 0.18, roofH, '#9a9894', 8), -L / 2 + i * L / 8, roofH / 2, rows * 0.9 + 1.4));
  const n = Math.floor(L / 0.55) * rows, im = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.17, 0.25, 4, 8), new THREE.MeshLambertMaterial({ color: '#ffffff' }), n), m4 = new THREE.Matrix4(), c = new THREE.Color();
  const pal = ['#c0392b', '#2a5ab8', '#f2f0ea', '#e8c020', '#2f8a3a', '#1d1d1f', '#e86a9a', '#8a5a3a', '#4fb0d8'];
  let k = 0; for (let i = 0; i < rows; i++) for (let j = 0; j < Math.floor(L / 0.55); j++) { if (r() < 0.12) continue; m4.makeTranslation(-L / 2 + 0.3 + j * 0.55 + (r() - 0.5) * 0.1, 1.35 + i * 0.45, 1.2 + i * 0.9); im.setMatrixAt(k, m4); im.setColorAt(k, c.set(pal[(r() * pal.length) | 0])); k++; }
  im.count = k; g.add(im); g.crowd = im;
  const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.13, 8, 6), new THREE.MeshLambertMaterial({ color: '#ffffff' }), k); const hc = ['#3a2a20', '#1d1612', '#6a4a30', '#c8a060', '#8a8a8a'];
  for (let i = 0; i < k; i++) { im.getMatrixAt(i, m4); m4.elements[13] += 0.3; heads.setMatrixAt(i, m4); heads.setColorAt(i, c.set(hc[(r() * hc.length) | 0])); } g.add(heads); g.heads = heads;
  return g;
}
// Big screen on two legs (results board), its face is a canvas the scene can redraw: .draw(fn).
export function bigScreen(w = 12, h = 6.5) {
  const g = new THREE.Group(); for (const s of [-1, 1]) g.add(at(box(0.5, 6, 0.5, '#5a5a5e'), s * w * 0.35, 3, 0));
  g.add(at(box(w + 0.6, h + 0.6, 0.6, '#1d1d20'), 0, 6 + h / 2, -0.1));
  const c = document.createElement('canvas'); c.width = 768; c.height = Math.round(768 * h / w); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const face = mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t })); face.position.set(0, 6 + h / 2, 0.21); g.add(face);
  g.draw = fn => { fn(c.getContext('2d'), c.width, c.height); t.needsUpdate = true; }; dyn(face); return g;
}

// Semi-trailer truck for the border bridge (cab at +x, length ~9.5), scaled to the cast.
export function truck(col = '#c0392b', trailer = '#e8e6e0') {
  const g = new THREE.Group();
  g.add(at(mesh(new THREE.BoxGeometry(1.9, 1.9, 2.1), std(col, { roughness: 0.4 })), 3.6, 1.55, 0));
  g.add(at(mesh(new THREE.BoxGeometry(0.06, 0.8, 1.8), std('#2a3440', { roughness: 0.15, metalness: 0.3 })), 4.57, 1.95, 0));
  g.add(at(mesh(new THREE.BoxGeometry(6.6, 2.3, 2.15), std(trailer, { roughness: 0.6 })), -0.8, 1.95, 0));
  g.add(at(mesh(new THREE.BoxGeometry(8.8, 0.25, 1.6), std('#2a2a2e')), 0.2, 0.62, 0));
  for (const x of [3.8, 2.4, -2.6, -3.5]) for (const z of [-0.85, 0.85]) g.add(at(mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 14), std('#151515')), x, 0.42, z, Math.PI / 2, 0, 0));
  return dyn(shadowy(g));
}

// ============================================================ the Winning Live stage
export function concertStage() {
  const g = new THREE.Group(), dark = std('#1d1d22', { roughness: 0.6 }), truss = std('#b8bcc4', { metalness: 0.6, roughness: 0.35 });
  g.add(at(mesh(new THREE.BoxGeometry(16, 1.0, 9), dark), 0, 0.5, -4.5)); g.add(at(mesh(new THREE.BoxGeometry(16.2, 0.06, 9.2), std('#2a2a34', { roughness: 0.3, metalness: 0.2 })), 0, 1.03, -4.5));
  for (let i = 0; i < 5; i++) g.add(at(box(4 - i * 0.0, 0.2, 0.4, '#2a2a30'), 0, 0.1 + i * 0.2, 0.25 + 0.4 * (4 - i)));
  const edge = mesh(new THREE.BoxGeometry(16, 0.05, 0.05), basic('#ff5fa8')); edge.position.set(0, 1.03, 0.02); g.add(edge);
  for (const sx of [-1, 1]) { g.add(at(mesh(new THREE.BoxGeometry(0.4, 9, 0.4), truss), sx * 8.6, 4.5, -1)); g.add(at(mesh(new THREE.BoxGeometry(0.4, 9, 0.4), truss), sx * 8.6, 4.5, -8));
    g.add(at(mesh(new THREE.BoxGeometry(1.6, 3.2, 1.4), dark), sx * 9.8, 1.6, -0.8)); }
  g.add(at(mesh(new THREE.BoxGeometry(17.6, 0.4, 0.4), truss), 0, 9, -1)); g.add(at(mesh(new THREE.BoxGeometry(17.6, 0.4, 0.4), truss), 0, 9, -8));
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const scr = mesh(new THREE.PlaneGeometry(14, 7), new THREE.MeshBasicMaterial({ map: t })); scr.position.set(0, 5.0, -8.9); g.add(scr); g.screen = { canvas: c, tex: t };
  g.add(at(box(14.6, 7.6, 0.3, '#121216'), 0, 5.0, -9.1));
  // moving heads: cone beams (additive) hung on the front truss
  g.beams = [];
  for (let i = 0; i < 8; i++) { const x = -7 + i * 2; const head = new THREE.Group(); head.position.set(x, 8.7, -1.2); g.add(head);
    head.add(at(mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.4, 10), dark), 0, 0, 0));
    const beam = mesh(new THREE.ConeGeometry(1.6, 12, 24, 1, true), new THREE.MeshBasicMaterial({ color: ['#ff4fa0', '#4fd2ff', '#ffe14f', '#b84dff'][i % 4], transparent: true, opacity: 0.11, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    beam.position.y = -6; head.add(beam); head.beam = beam; g.beams.push(head); }
  g.floorLights = []; for (let i = 0; i < 10; i++) { const l = mesh(new THREE.CircleGeometry(0.25, 16), basic('#ffffff')); l.rotation.x = -Math.PI / 2; l.position.set(-7 + i * 1.55, 1.04, -0.5); g.add(l); g.floorLights.push(l); }
  g.beams.forEach(dyn); g.floorLights.forEach(dyn); dyn(scr); g.top = 1.06; return g;
}

// ============================================================ the border bridge (Ciudad Juárez - El Paso)
export function borderBridge(len = 70) {
  const g = new THREE.Group(), con = std('#cfc8b8', { roughness: 0.9 }), asph = std('#4a4c50', { roughness: 0.95 });
  g.add(at(mesh(new THREE.BoxGeometry(14, 0.5, len), con), 0, 3.0, 0)); g.add(at(mesh(new THREE.BoxGeometry(12, 0.04, len), asph), 0, 3.27, 0));
  for (let i = 0; i < len / 4; i++) g.add(at(box(0.15, 0.02, 1.8, '#e8e2c8'), 0, 3.3, -len / 2 + 2 + i * 4));
  for (const sx of [-1, 1]) { g.add(at(mesh(new THREE.BoxGeometry(0.3, 1.1, len), con), sx * 6.9, 3.8, 0)); g.add(at(mesh(new THREE.BoxGeometry(0.12, 0.12, len), std('#8a8e94', { metalness: 0.5 })), sx * 6.9, 4.45, 0)); }
  for (let i = 0; i < 5; i++) g.add(at(mesh(new THREE.BoxGeometry(3, 3, 3), con), 0, 1.5, -len / 2 + 7 + i * (len - 14) / 4));
  const plaque = canvasTex(512, 128, (x, W, H) => { x.fillStyle = '#d8d0b8'; x.fillRect(0, 0, W, H); x.fillStyle = '#2a2420'; x.font = '900 46px Inter'; x.textAlign = 'center'; x.fillText('MÉXICO', W * 0.25, 78); x.fillText('USA', W * 0.75, 78); x.fillRect(W / 2 - 3, 10, 6, H - 20); });
  for (const sx of [-1, 1]) { const p = mesh(new THREE.PlaneGeometry(1.8, 0.45), new THREE.MeshStandardMaterial({ map: plaque })); p.position.set(sx * 6.74, 3.95, 0); p.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2; g.add(p); }
  g.add(at(box(12, 0.03, 0.25, '#d8b84a'), 0, 3.31, 0));
  return shadowy(g);
}
