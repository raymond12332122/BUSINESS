// Cast for "¿Qué pasaría si...?": every rig gets the fluid motion layer (lib/motion.js) and the anime finish
// (amer/look.js). Leaders are the full-proportion models in their own outfits; chibis play citizens, guards, aides and
// fans in present-day clothes. Hats never hide the ears: they come out through the hat.
import * as THREE from 'three';
import * as C_ from '../lib/chars.js';
import * as M from '../lib/motion.js';
import * as P from '../lib/props.js';
import { mesh, box, cyl, at } from '../lib/props.js';
import { generic, flattenAhoge, glasses } from '../mx/kit.js';
import { uniformize } from '../napo/kit.js';
import { cap, helmet, tie } from '../narco/kit.js';
import { hat } from '../amer/kit.js';
import { finish, finishProp } from '../amer/look.js';
import { blobShadow } from '../rusia/kit.js';
import { sit } from './anim.js';
export { blobShadow, finishProp };
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });
export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

// ------------------------------------------------------------ who governs where
// [umamusume, country, flag code, one-line personality nod]
export const LEADERS = {
  rudolf: ['Symboli Rudolf', 'México', 'mx', '«El Emperador»: siete coronas, juntas a las 6 a.m. y chistes malos.'],
  sirius: ['Sirius Symboli', 'Estados Unidos', 'us', 'Directa, piloto y entrenadora de perros. Odia las mentiras… y los chistes.'],
  creek: ['Super Creek', 'Canadá', 'ca', 'Se llama a sí misma «mamá» y consiente a todo el mundo.'],
  grass: ['Grass Wonder', 'Japón', 'jp', 'Sonrisa dulce, voluntad de hierro. Nadie quiere verla enojada.'],
  groove: ['Air Groove', 'Alemania', 'de', '«¡Tawake!»: puntualidad absoluta.'],
  mcqueenB: ['Mejiro McQueen', 'Francia', 'fr', 'Elegante heredera… eternamente a dieta.'],
  opera: ['T.M. Opera O', 'Italia', 'it', '«¡La Soberana más fuerte y hermosa!»'],
  dotoB: ['Meisho Doto', 'San Marino', 'sm', 'Torpe y pesimista, pero jamás se rinde.'],
  golshi: ['Gold Ship', 'Australia', 'au', 'Caos puro. Le declaró la guerra a los emúes.'],
  digital: ['Agnes Digital', 'Corea del Sur', 'kr', 'Superfan de todas las umamusume: «¡Guehehe!»'],
  teio: ['Tokai Teio', 'Colombia', 'co', 'Idolatra a su «Kaichō» Rudolf… y baila el Paso Teio.'],
  dia: ['Satono Diamond', 'Brasil', 'br', '«¡El destino no existe!»'],
  tamamoB: ['Tamamo Cross', 'Argentina', 'ar', 'Pequeñita pero peleonera: «el Rayo Blanco».'],
  suzukaB: ['Silence Suzuka', 'Suiza', 'ch', 'Neutral, callada y siempre adelante.'],
  turbo: ['Twin Turbo', 'Mónaco', 'mc', '«¡Turbo a fondo!»… hasta quedarse sin gasolina.'],
};

// ------------------------------------------------------------ present-day palettes for the chibi extras
const PAL = {
  civ1: { dark: '#1d2638', mid: '#47689a', light: '#f3f3f1', gold: '#a08a5a' }, civ2: { dark: '#2a2420', mid: '#8a5a3a', light: '#efe6d6', gold: '#a08a5a' },
  civ3: { dark: '#2a2a2a', mid: '#7a3040', light: '#f0e8e0', gold: '#a08a5a' }, civ4: { dark: '#1e2a22', mid: '#4c7a5a', light: '#f2efe6', gold: '#a08a5a' },
  civ5: { dark: '#3a2a3a', mid: '#b0688a', light: '#fbf0f4', gold: '#a08a5a' }, civ6: { dark: '#2a2a1a', mid: '#c8a03a', light: '#fbf6e6', gold: '#a08a5a' },
  suit: { dark: '#101216', mid: '#24282f', light: '#f1efea', gold: '#8c7a55' }, suitNavy: { dark: '#0f1424', mid: '#252f4a', light: '#f1efea', gold: '#b89a5a' },
  suitGray: { dark: '#25272c', mid: '#55595f', light: '#f1efea', gold: '#8c7a55' },
  army: { dark: '#232a1b', mid: '#56613f', light: '#b4ae8a', gold: '#c9a227' }, gala: { dark: '#14200f', mid: '#2f4a24', light: '#f2efe6', gold: '#d4af37' },
  secret: { dark: '#08090b', mid: '#15171b', light: '#e9e9e9', gold: '#6a6a6a' }, chef: { dark: '#9aa4a8', mid: '#f4f4f2', light: '#ffffff', gold: '#c9c9c9' },
  staff: { dark: '#1a2a3a', mid: '#3a6a8a', light: '#f2f6f8', gold: '#c9a227' },
};
const uni = (r, p) => uniformize(r, PAL[p] || p);
const HAIRS = ['#3a2a20', '#2a2018', '#4a3428', '#1d1612', '#5a4030', '#2e2420', '#6a4a30'];
const anon = r => generic(r, HAIRS[(r.seed * 7 | 0) % HAIRS.length]);
const pick = (r, list) => list[Math.floor(r.seed * 7.3) % list.length];
const CAP = { scale: 0.88, y: 0.88, tilt: -0.05, cap: true };

export const OUTFITS = {
  self: r => r,
  // citizens in the Zócalo, on the street, at the race
  civil: r => { anon(r); uni(r, pick(r, ['civ1', 'civ2', 'civ3', 'civ4', 'civ5', 'civ6'])); return r; },
  civilCap: r => { OUTFITS.civil(r); hat(r, cap(pick(r, ['#7a2a2a', '#2a4a7a', '#2f2f2f', '#d8d2c4', '#2f6a3a'])), CAP); return r; },
  fan: r => { OUTFITS.civil(r); r.glow = r.mo ? holdGlow(r) : null; return r; },
  // government
  diputado: r => { anon(r); uni(r, pick(r, ['suit', 'suitNavy', 'suitGray'])); r.wear('chest', tie(pick(r, ['#7a1f2a', '#2a3a5a', '#3a5a2a', '#5a2a5a'])), [0, 0.47, 0.105]); return r; },
  aide: r => { anon(r); uni(r, 'staff'); return r; },
  soldado: r => { anon(r); uni(r, 'army'); hat(r, helmet('#4f5a3a'), { scale: 0.9, y: 0.86, tilt: -0.04, cap: true }); return r; },
  gala: r => { anon(r); uni(r, 'gala'); hat(r, cap('#1d2a18', { front: '★', fg: '#d4af37', brim: '#111' }), CAP); return r; },
  secreto: r => { anon(r); uni(r, 'secret'); r.wear('chest', tie('#15171b'), [0, 0.47, 0.105]); r.wear('head', shades(), [0, 0.69, 0.225]); return r; },
  chef: r => { anon(r); uni(r, 'chef'); hat(r, toque(), { scale: 0.9, y: 0.9, tilt: -0.02, cap: true }); return r; },
  reporter: r => { anon(r); uni(r, pick(r, ['civ1', 'suitGray', 'civ4'])); return r; },
};

// ------------------------------------------------------------ accessories
// Dark wraparound glasses for chibi Secret Service agents.
export function shades() {
  const g = new THREE.Group(), m = std('#0c0d10', { roughness: 0.25, metalness: 0.4 });
  g.add(at(mesh(new THREE.BoxGeometry(0.26, 0.055, 0.02), m), 0, 0, 0));
  for (const s of [-1, 1]) g.add(at(box(0.012, 0.012, 0.16, '#0c0d10'), s * 0.135, 0.01, -0.08));
  return g;
}
// Chef's toque.
export function toque() {
  const g = new THREE.Group(), w = std('#fbfbf8', { roughness: 0.9 });
  g.add(at(mesh(new THREE.CylinderGeometry(0.2, 0.19, 0.12, 24), w), 0, 0.06, 0));
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, b = mesh(new THREE.SphereGeometry(0.12, 12, 10), w); b.position.set(Math.cos(a) * 0.1, 0.2, Math.sin(a) * 0.1); g.add(b); }
  g.add(at(mesh(new THREE.SphereGeometry(0.13, 12, 10), w), 0, 0.24, 0)); return g;
}
// Aviator sunglasses on a full-proportion face: lens centres on the eye centres, just in front of the face.
export function aviators(rig) {
  const bones = []; rig.model.traverse(o => { if (o.isBone) bones.push(o); });
  rig.root.updateWorldMatrix(true, true);
  const inv = new THREE.Matrix4().copy(rig.root.matrixWorld).invert();
  const cen = s => { const l = bones.filter(b => new RegExp(`^Eye_(up|bottom)_\\d+_${s}(_\\d+)?$`).test(b.name)); const v = new THREE.Vector3(); l.forEach(b => v.add(new THREE.Vector3().setFromMatrixPosition(b.matrixWorld).applyMatrix4(inv))); return v.multiplyScalar(1 / Math.max(1, l.length)); };
  const eL = cen('L'), eR = cen('R'), ipd = eL.distanceTo(eR), mid = eL.clone().add(eR).multiplyScalar(0.5);
  const front = M.bodyPoint(rig, ['head', 0, (mid.y - rig.mo.head.c.y) / 0.1 * 0, 1]);   // face surface straight ahead of the head centre
  const g = new THREE.Group();
  const frame = std('#c9a54a', { metalness: 0.7, roughness: 0.3 }), lens = new THREE.MeshStandardMaterial({ color: '#1a2230', roughness: 0.15, metalness: 0.5 });
  for (const s of [-1, 1]) {
    const sh = new THREE.Shape(); sh.moveTo(-0.5, 0.35); sh.bezierCurveTo(-0.55, -0.2, -0.2, -0.62, 0.1, -0.55); sh.bezierCurveTo(0.45, -0.45, 0.55, 0.0, 0.5, 0.35); sh.bezierCurveTo(0.2, 0.42, -0.2, 0.42, -0.5, 0.35);
    const l = mesh(new THREE.ShapeGeometry(sh, 16), lens); l.scale.set(s * 0.52, 0.52, 1); l.position.set(s * 0.5, 0, 0); g.add(l);
    const rim = mesh(new THREE.TorusGeometry(0.29, 0.025, 5, 24), frame); rim.scale.set(1, 0.85, 1); rim.position.set(s * 0.5, -0.03, -0.005); g.add(rim);
    const arm = mesh(new THREE.BoxGeometry(0.03, 0.03, 1.1), frame); arm.position.set(s * 0.82, 0.1, -0.55); g.add(arm);
  }
  g.add(at(mesh(new THREE.BoxGeometry(0.34, 0.035, 0.03), frame), 0, 0.2, 0));
  g.scale.setScalar(ipd);
  const head = rig.j.head.bone, p = new THREE.Vector3(mid.x, mid.y, Math.max(front.z, mid.z) + ipd * 0.12);
  rig.attach('head', g, p.toArray(), [0, 0, 0]); g.scale.setScalar(ipd);
  rig.shades = g; return g;
}
// A glowstick in the right hand (concert crowds); returns it so scenes can recolour it.
function holdGlow(r) {
  const s = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 8), new THREE.MeshBasicMaterial({ color: pick(r, ['#ff4fa0', '#4fd2ff', '#ffe14f', '#7dff6a']) }));
  return holdIn(r, s, 'R', [0, 0.06, 0.02]);
}
// Put a prop in a hand: attached to the wrist at its rest position (+ offset); full-size bodies scale both up.
export function holdIn(r, obj, side = 'R', off = [0, -0.04, 0.03], rot = [0, 0, 0], s = 1) {
  r.root.updateMatrixWorld(true);
  const key = side === 'R' ? 'wriR' : 'wriL', b = r.j[key].bone, k = r.ratio || 1;
  const p = new THREE.Vector3(); b.getWorldPosition(p); p.applyMatrix4(r.root.matrixWorld.clone().invert());
  const o = r.attach(key, obj, [p.x + off[0] * k, p.y + off[1] * k, p.z + off[2] * k], rot); o.scale.multiplyScalar(k * s); return o;
}

// A sash fitted to the body: a ribbon on the torso surface from one shoulder down across the chest to the opposite
// hip and round the back, skinned to chest/waist/hip so it bends with the body. cols: stripes across its width.
export function fitSash(rig, cols, { shoulder = 'R', width = 0.07, lift = 0.006, emblem = null } = {}) {
  const mo = rig.mo, B = mo.body, T = mo.tor, J = rig.j, R = rig.root;
  R.updateWorldMatrix(true, true);
  const inv = new THREE.Matrix4().copy(R.matrixWorld).invert();
  const yOf = k => new THREE.Vector3().setFromMatrixPosition(J[k].bone.matrixWorld).applyMatrix4(inv).y;
  const yChest = yOf('chest'), yWaist = yOf('waist'), yHip = yOf('hip');
  const sgn = shoulder === 'R' ? -1 : 1, top = B.neckY - 0.06 * (B.neckY - B.hipY), low = B.hipY + 0.12 * (B.neckY - B.hipY);
  const D = Math.PI / 180, N = 90, w = width * (rig.big ? 1 : 0.62);
  // closed path (azimuth, height): over the shoulder, across the front, low on the far hip, back up behind.
  // Near the shoulder top it leaves the torso map and runs midway between the neck and the arm joint.
  const path = u => { const az = u <= 0.5 ? sgn * (75 - 320 * u) * D : -sgn * (85 + 200 * (2 * u - 1)) * D; return { az, y: top + (low - top) * (0.5 - 0.5 * Math.cos(u * 2 * Math.PI)) }; };
  const surf = (az, y) => { const fr = Math.max(0, Math.min(T.NY - 1, (y - T.y0) / (T.y1 - T.y0) * T.NY - 0.5)); const col = ((az / (2 * Math.PI)) % 1 + 1) % 1 * T.NA - 0.5;
    const r0 = Math.floor(fr), r1 = Math.min(T.NY - 1, r0 + 1), tr = fr - r0, c0 = ((Math.floor(col) % T.NA) + T.NA) % T.NA, c1 = (c0 + 1) % T.NA, tc = col - Math.floor(col);
    const m = T.map, rr = (m[r0 * T.NA + c0] * (1 - tc) + m[r0 * T.NA + c1] * tc) * (1 - tr) + (m[r1 * T.NA + c0] * (1 - tc) + m[r1 * T.NA + c1] * tc) * tr;
    const r = rr + lift * (rig.big ? 1 : 0.62); return new THREE.Vector3(Math.sin(az) * r, y, T.zc + Math.cos(az) * r); };
  const P = k => new THREE.Vector3().setFromMatrixPosition(J[k].bone.matrixWorld).applyMatrix4(inv);
  const shP = P(shoulder === 'R' ? 'armR' : 'armL'), nkP = P('neck'), topPt = nkP.clone().lerp(shP, 0.55); topPt.y = shP.y + mo.arm[shoulder].rF * 1.6 + lift;
  const pts = []; for (let i = 0; i <= N; i++) { const u = i / N, p = path(u), sp = surf(p.az, p.y), wt = Math.max(0, 1 - Math.min(u, 1 - u) / 0.14); pts.push(sp.lerp(topPt, wt * wt * (3 - 2 * wt))); }
  // skin to the nearest body mesh's skeleton
  let body = null; rig.model.traverse(o => { if (o.isSkinnedMesh && o.skeleton.bones.includes(J.chest.bone) && (!body || o.geometry.attributes.position.count > body.geometry.attributes.position.count)) body = o; });
  const toBody = new THREE.Matrix4().copy(body.matrixWorld).invert().multiply(R.matrixWorld);
  const bi = k => body.skeleton.bones.indexOf(J[k].bone);
  const iC = bi('chest'), iW = bi('waist'), iH = bi('hip');
  const pos = [], uv = [], si = [], sw = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const p = pts[i], t = pts[Math.min(N, i + 1)].clone().sub(pts[Math.max(0, i - 1)]).normalize(), n = new THREE.Vector3(p.x, 0, p.z - T.zc).normalize();
    const side = new THREE.Vector3().crossVectors(t, n).normalize();
    for (const s of [-0.5, 0.5]) {
      const v = p.clone().addScaledVector(side, s * w); pos.push(...v.clone().applyMatrix4(toBody).toArray()); uv.push(s + 0.5, i / N);
      const y = v.y, wc = Math.max(0, Math.min(1, (y - yWaist) / Math.max(1e-4, yChest - yWaist))), wh = Math.max(0, Math.min(1, (yWaist - y) / Math.max(1e-4, yWaist - yHip)));
      if (y >= yChest) { si.push(iC, 0, 0, 0); sw.push(1, 0, 0, 0); } else if (y >= yWaist) { si.push(iC, iW, 0, 0); sw.push(wc, 1 - wc, 0, 0); } else { si.push(iW, iH, 0, 0); sw.push(1 - wh, wh, 0, 0); }
    }
    if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4)); g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4)); g.setIndex(idx); g.computeVertexNormals();
  const tex = canvasTex(96, 8, (x, W, H) => { cols.forEach((c, k) => { x.fillStyle = c; x.fillRect(k * W / cols.length, 0, W / cols.length + 1, H); }); x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(0, 0, 3, H); x.fillRect(W - 3, 0, 3, H); });
  const sash = new THREE.SkinnedMesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, side: THREE.DoubleSide, name: 'sash' }));
  sash.bind(body.skeleton, body.bindMatrix); sash.castShadow = true; sash.frustumCulled = false;
  body.parent.add(sash); sash.position.copy(body.position); sash.quaternion.copy(body.quaternion); sash.scale.copy(body.scale);
  // emblem (gold knot) where the sash crosses the low hip
  if (emblem) { const lowPt = pts[Math.round(N * 0.5)], k = new THREE.Group(); k.add(emblem); const nrm = new THREE.Vector3(lowPt.x, 0, lowPt.z - T.zc).normalize();
    const e = rig.attach('hip', k, lowPt.clone().addScaledVector(nrm, 0.012).toArray(), [0, Math.atan2(nrm.x, nrm.z) / D, 0]); e.scale.setScalar(rig.big ? 1 : 0.62); rig.sashKnot = e; }
  rig.sash = sash; return sash;
}
// Gold medallion with the eagle for the Mexican sash.
export function eagleKnot() {
  const g = new THREE.Group();
  const tex = canvasTex(128, 128, (x, W) => { x.fillStyle = '#d4af37'; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill(); x.fillStyle = '#8a6a1a'; x.beginPath(); x.arc(64, 64, 50, 0, 7); x.fill();
    x.fillStyle = '#e8c860'; x.beginPath(); x.ellipse(64, 60, 20, 26, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(30, 52); x.quadraticCurveTo(64, 20, 98, 52); x.quadraticCurveTo(64, 40, 30, 52); x.fill();
    x.fillStyle = '#2f6a3a'; x.fillRect(40, 92, 48, 8); });
  g.add(mesh(new THREE.CircleGeometry(0.035, 24), new THREE.MeshStandardMaterial({ map: tex, metalness: 0.5, roughness: 0.35 })));
  return g;
}

// ------------------------------------------------------------ spawning
let seedCounter = 0;
export function person(parent, key, outfit = 'self', x = 0, z = 0, yaw = 0, { shadow = true, outline = true } = {}) {
  const r = C_.spawn(key); r.seed = (seedCounter++ * 1.37) % 10;
  M.enhance(r);
  OUTFITS[outfit](r);
  r.root.position.set(x, 0, z); r.root.rotation.y = yaw; r.root.userData.dynamic = true;
  parent.add(r.root); finish(r, { outline });
  if (!shadow) blobShadow(r, r.big ? 0.9 : 0.62);
  r.who = key; return r;
}
export const leader = (parent, key, x = 0, z = 0, yaw = 0) => person(parent, key, 'self', x, z, yaw);
const CHIBIS = ['oguri', 'tamamo', 'cafe', 'doto', 'mcqueen', 'daiwa', 'suzuka', 'helios', 'spe', 'hishi'];
// Extras on a jittered grid inside [x0, z0, x1, z1], blob shadows instead of shadow maps.
export function crowd(parent, outfit, n, [x0, z0, x1, z1], { seed = 1, yaw = 0, cast = CHIBIS, jitter = 0.35, yawJ = 0.4, face = null } = {}) {
  const rnd = P.rng(seed), out = [];
  const cols = Math.ceil(Math.sqrt(n * (x1 - x0) / Math.max(0.1, z1 - z0)));
  for (let i = 0; i < n; i++) {
    const cx = i % cols, cz = Math.floor(i / cols), rows = Math.ceil(n / cols);
    const x = x0 + (cx + 0.5) / cols * (x1 - x0) + (rnd() - 0.5) * jitter, z = z0 + (cz + 0.5) / rows * (z1 - z0) + (rnd() - 0.5) * jitter;
    const o = Array.isArray(outfit) ? outfit[i % outfit.length] : outfit;
    let y = yaw + (rnd() - 0.5) * yawJ; if (face) y = Math.atan2(face[0] - x, face[1] - z) + (rnd() - 0.5) * yawJ * 0.5;
    out.push(person(parent, cast[(i + seed) % cast.length], o, x, z, y, { shadow: false }));
  }
  return out;
}

// ------------------------------------------------------------ driving rigs each frame
// Pose + face in one call: face = { eye: 'open'|number, mouth: 'smile'|number|[open, smile], talk: bool }
export function act(r, pose, t, face = {}) {
  r.apply(pose);
  const bl = M.blink(t, r.seed);
  if (r.faceRig) {
    const eye = typeof face.eye === 'number' ? Math.max(face.eye, bl) : face.eye && face.eye !== 'open' ? face.eye : bl;
    const mouth = face.talk ? [M.talkJaw(t, r.seed, face.talk === true ? 1 : face.talk), face.smile ?? 0.3] : face.mouth ?? [0, face.smile ?? 0.25];
    r.setFace(eye, mouth);
  } else {
    const eye = face.eye && face.eye !== 'open' && typeof face.eye === 'string' ? face.eye : bl > 0.5 ? 'blink' : 'open';
    const mouth = face.talk ? (M.talkJaw(t, r.seed) > 0.45 ? 'open' : 'small') : typeof face.mouth === 'string' ? face.mouth : 'smile';
    r.setFace(eye, mouth);
  }
  return r;
}
// Place a rig on a path at distance d (world units) from its start; turns it along the path.
export function onPath(r, pts, d) {
  let i = 0, acc = 0;
  while (i < pts.length - 2 && acc + Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]) < d) { acc += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); i++; }
  const [ax, az] = pts[i], [bx, bz] = pts[i + 1], L = Math.hypot(bx - ax, bz - az) || 1, u = Math.min(1, Math.max(0, (d - acc) / L));
  r.root.position.x = ax + (bx - ax) * u; r.root.position.z = az + (bz - az) * u; r.root.rotation.y = Math.atan2(bx - ax, bz - az);
  return r;
}
// Seat a rig so its pelvis rests on a seat top at world height y (feet dangle when the seat is taller than her knees).
export function seatOn(r, y) {
  r.root.position.y = 0; r.apply(sit(0, r.seed)); r.root.updateMatrixWorld(true);
  const hp = new THREE.Vector3(); r.j.hip.bone.getWorldPosition(hp);
  r.root.position.y = y + (r.big ? 0.1 : 0.05) - hp.y; return r;
}
