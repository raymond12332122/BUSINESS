// Costumes for the Napoleonic Wars video: uniform recolouring, period hats and accessories.
import * as THREE from 'three';
import * as P from '../lib/props.js';
import * as G from '../lib/gear.js';
import * as C_ from '../lib/chars.js';
import { mesh, box, cyl, at, rng } from '../lib/props.js';
import { hideEars, flattenAhoge, generic, wearHat, epaulettes, crossbelts, glasses } from '../mx/kit.js';

export { hideEars, flattenAhoge, generic, wearHat };
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });

// ------------------------------------------------------------ uniform recolouring
// The chibi outfits are one texture per model. A small shader edit keeps skin and gold trim, and remaps every
// other texel's luminance onto a three-colour ramp (dark -> coat colour -> facings), so any outfit becomes a
// period uniform while keeping its folds and seams.
export const UNIFORMS = {
  napoleon: { dark: '#2b2d31', mid: '#7a7c80', light: '#f2efe6', gold: '#d4af37' },
  french: { dark: '#141c3a', mid: '#2f4590', light: '#f3f0e8', gold: '#d4af37' },
  guard: { dark: '#10162e', mid: '#25336b', light: '#f3f0e8', gold: '#d4af37' },
  marshal: { dark: '#121a36', mid: '#22336e', light: '#f3f0e8', gold: '#e2bd45' },
  british: { dark: '#4a1013', mid: '#b3262a', light: '#f3f0e8', gold: '#d4af37' },
  navy: { dark: '#0c1226', mid: '#1d2a50', light: '#f3f0e8', gold: '#d9b23c' },
  russian: { dark: '#14221a', mid: '#2f5038', light: '#f0ede4', gold: '#d4af37' },
  tsar: { dark: '#16261c', mid: '#2c4a34', light: '#f6f3ea', gold: '#e2bd45' },
  austrian: { dark: '#7d7b74', mid: '#e3ded2', light: '#ffffff', gold: '#d4af37' },
  prussian: { dark: '#0f1526', mid: '#232f4f', light: '#ece8de', gold: '#d4af37' },
  cossack: { dark: '#111a33', mid: '#2a3a68', light: '#b8342f', gold: '#d4af37' },
  spanish: { dark: '#2a1d14', mid: '#6e4b2e', light: '#e8dcc2', gold: '#c9a227' },
  sansculotte: { dark: '#2a2622', mid: '#5f5a52', light: '#ece4d2', gold: '#c9a227' },
  peasant: { dark: '#2c241c', mid: '#7b6248', light: '#e6dcc6', gold: '#b08d3a' },
  priest: { dark: '#0e0d0e', mid: '#262427', light: '#f2efe8', gold: '#c9a227' },
  pope: { dark: '#b8b2a6', mid: '#efeae0', light: '#ffffff', gold: '#d4af37' },
  empress: { dark: '#a8a196', mid: '#ece6da', light: '#ffffff', gold: '#d4af37' },
  austrianbride: { dark: '#7a8aa6', mid: '#c9d6ee', light: '#ffffff', gold: '#d4af37' },
  royal: { dark: '#1a2250', mid: '#2c3c8f', light: '#f6f3ea', gold: '#e2bd45' },
  diplomat: { dark: '#121214', mid: '#2a2a30', light: '#f4f1ea', gold: '#c9a227' },
  mexican: { dark: '#2a2420', mid: '#6b5a48', light: '#efe7d6', gold: '#c9a227' },
};
const uniCache = new Map();
function uniformMaterial(src, U) {
  const key = src.uuid + JSON.stringify(U);
  if (uniCache.has(key)) return uniCache.get(key);
  const m = src.clone();
  const u = { uDark: { value: new THREE.Color(U.dark) }, uMid: { value: new THREE.Color(U.mid) }, uLight: { value: new THREE.Color(U.light) }, uGold: { value: new THREE.Color(U.gold) } };
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, u);
    sh.fragmentShader = 'uniform vec3 uDark; uniform vec3 uMid; uniform vec3 uLight; uniform vec3 uGold;\n' + sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
      {
        vec3 cs = pow(max(diffuseColor.rgb, vec3(0.0)), vec3(1.0 / 2.2));
        float mx = max(cs.r, max(cs.g, cs.b)), mn = min(cs.r, min(cs.g, cs.b)), dl = mx - mn;
        float sat = mx > 0.001 ? dl / mx : 0.0;
        float h = 0.0;
        if (dl > 0.0001) {
          if (mx == cs.r) h = mod((cs.g - cs.b) / dl, 6.0); else if (mx == cs.g) h = (cs.b - cs.r) / dl + 2.0; else h = (cs.r - cs.g) / dl + 4.0;
          h /= 6.0;
        }
        float lum = dot(cs, vec3(0.299, 0.587, 0.114));
        float skin = step(h, 0.115) * step(0.06, sat) * step(sat, 0.42) * step(0.70, mx) * step(cs.b, cs.g) * step(cs.g, cs.r);
        float gold = step(0.08, h) * step(h, 0.17) * step(0.45, sat) * step(0.45, mx);
        vec3 o = mix(pow(uDark, vec3(1.0 / 2.2)), pow(uMid, vec3(1.0 / 2.2)), smoothstep(0.05, 0.5, lum));
        o = mix(o, pow(uLight, vec3(1.0 / 2.2)), smoothstep(0.78, 0.94, lum));
        vec3 g = pow(uGold, vec3(1.0 / 2.2)) * (0.65 + 0.5 * lum);
        vec3 res = mix(o, g, gold);
        res = mix(res, cs, skin);
        diffuseColor.rgb = pow(res, vec3(2.2));
      }`);
  };
  m.customProgramCacheKey = () => 'uniform-v1';
  uniCache.set(key, m); return m;
}
export function uniformize(rig, name) {
  const U = typeof name === 'string' ? UNIFORMS[name] : name;
  rig.model.traverse(o => { if (o.isMesh && /mbdy|^body$|^Body$/.test(o.material.name)) o.material = uniformMaterial(o.material, U); });
  rig.uniform = name; return rig;
}

// ------------------------------------------------------------ hats
function lathe(profile, color, seg = 40, opts = {}) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg);
  const m = mesh(g, std(color, { side: THREE.DoubleSide, ...opts })); m.castShadow = true; return m;
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function cockade(r = 0.07, cols = ['#2a3f8f', '#f4f1ea', '#c0272d']) {
  const g = new THREE.Group();
  cols.forEach((c, i) => { const d = mesh(new THREE.CircleGeometry(r * (1 - i * 0.3), 24), new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, side: THREE.DoubleSide })); d.position.z = 0.002 * i; g.add(d); });
  return g;
}
// Bicorne seen from the front: a crescent. 'side' = worn sideways (Napoleon), 'fore' = fore-and-aft (Nelson, admirals).
export function bicorne({ color = '#16151a', trim = null, cockadeCols = ['#2a3f8f', '#f4f1ea', '#c0272d'], plume = null, w = 1.0 } = {}) {
  const g = new THREE.Group();
  const s = new THREE.Shape();
  const W = 0.44 * w, Hh = 0.25;
  s.moveTo(-W, 0.06);
  s.bezierCurveTo(-W * 0.75, 0.0, -W * 0.3, -0.02, 0, -0.02);
  s.bezierCurveTo(W * 0.3, -0.02, W * 0.75, 0.0, W, 0.06);
  s.bezierCurveTo(W * 0.78, 0.14, W * 0.55, Hh * 0.95, 0, Hh);
  s.bezierCurveTo(-W * 0.55, Hh * 0.95, -W * 0.78, 0.14, -W, 0.06);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.02, bevelSegments: 3, curveSegments: 24 });
  geo.translate(0, 0, -0.08);
  // pinch the back so it reads as two flaps rather than a slab
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const k = 1 - 0.55 * Math.max(0, y / Hh) ; p.setZ(i, z * (0.45 + 0.55 * k)); }
  geo.computeVertexNormals();
  g.add(mesh(geo, std(color, { roughness: 0.65 })));
  if (trim) for (const zz of [0.1, -0.1]) { const t = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-W, 0.06], [-W * 0.55, Hh * 0.92], [0, Hh + 0.012], [W * 0.55, Hh * 0.92], [W, 0.06]].map(([x, y]) => new THREE.Vector3(x, y, zz))), 40, 0.009, 6), std(trim, { metalness: 0.6, roughness: 0.35 })); g.add(t); }
  const ck = cockade(0.05, cockadeCols); ck.position.set(W * 0.42, 0.14, 0.108); g.add(ck);
  const loop = box(0.018, 0.085, 0.008, trim || '#3a3a3a'); loop.position.set(W * 0.42, 0.14, 0.118); g.add(loop);
  if (plume) { const pl = mesh(new THREE.SphereGeometry(0.05, 10, 8), std(plume)); pl.scale.set(1.8, 0.55, 0.9); pl.position.set(0, Hh - 0.015, 0); g.add(pl); }
  return g;
}
// Shako: tall cylinder with brass plate, peak and plume/pompom.
export function shako({ color = '#151517', plate = '#c9a227', plume = '#c0272d', pompom = true, tall = 0.3, bell = 0.03, front = false } = {}) {
  const g = new THREE.Group();
  const r0 = 0.25, r1 = r0 + bell;
  g.add(lathe([[0, tall], [r1 - 0.02, tall], [r1, tall - 0.01], [r0, 0.0], [r0 - 0.01, 0.0]], color, 32));
  g.add(at(mesh(new THREE.CircleGeometry(r1, 32), std(color)), 0, tall, 0, -Math.PI / 2, 0, 0));
  const band = mesh(new THREE.CylinderGeometry(r1 + 0.004, r1 + 0.004, 0.035, 32, 1, true), std(plate, { metalness: 0.5, roughness: 0.4, side: THREE.DoubleSide })); band.position.y = tall - 0.03; g.add(band);
  const pl = mesh(new THREE.CircleGeometry(0.06, 4), std(plate, { metalness: 0.6, roughness: 0.35, side: THREE.DoubleSide })); pl.scale.set(0.8, 1.15, 1); pl.position.set(0, tall * 0.48, r0 + bell * 0.5 + 0.008); pl.rotation.x = -Math.atan(bell / tall); g.add(pl);
  if (front) { const fs = new THREE.Shape(); fs.moveTo(-0.17, 0); fs.lineTo(0.17, 0); fs.lineTo(0.15, 0.1); fs.quadraticCurveTo(0, 0.2, -0.15, 0.1); fs.closePath();
    const fp = mesh(new THREE.ShapeGeometry(fs), std(color, { side: THREE.DoubleSide })); fp.position.set(0, tall - 0.01, r1 - 0.015); g.add(fp); }
  const peak = mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.014, 24, 1, false, -0.85, 1.7), std('#0e0e0f', { roughness: 0.35 })); peak.position.set(0, 0.012, 0.03); peak.rotation.x = 0.18; g.add(peak);
  if (pompom) { const pp = mesh(new THREE.SphereGeometry(0.042, 10, 8), std(plume)); pp.scale.y = 0.8; pp.position.set(0, tall + (front ? 0.17 : 0.03), r1 - 0.03); g.add(pp); }
  else { const pl2 = mesh(new THREE.CapsuleGeometry(0.03, 0.16, 4, 8), std(plume)); pl2.position.set(0, tall + 0.09, r1 - 0.05); g.add(pl2); }
  // chin scales
  for (const s of [-1, 1]) { const c = box(0.016, 0.12, 0.01, plate); c.position.set(s * 0.25, -0.05, 0.05); c.rotation.z = s * 0.12; g.add(c); }
  return g;
}
// Imperial Guard bearskin: tall fur cap, red top patch, plume on the left.
export function bearskin({ plume = '#c0272d', plate = '#c9a227' } = {}) {
  const g = new THREE.Group();
  const prof = []; for (let i = 0; i <= 18; i++) { const u = i / 18; prof.push([0.27 + 0.05 * Math.sin(u * Math.PI) - 0.17 * Math.pow(u, 4), u * 0.46]); }
  prof.push([0.0, 0.47]);
  const geo = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 36), p = geo.attributes.position, r = rng(5);
  for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)), y = p.getY(i); const k = 1 + 0.025 * Math.sin(a * 9 + y * 20) + 0.015 * Math.sin(a * 23); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); }
  geo.computeVertexNormals();
  g.add(mesh(geo, std('#18161a', { roughness: 1 })));
  const patch = mesh(new THREE.CircleGeometry(0.08, 18), std('#b3262a', { side: THREE.DoubleSide })); patch.position.set(0, 0.4, -0.2); patch.rotation.x = 0.75; g.add(patch);
  const pl = mesh(new THREE.CapsuleGeometry(0.03, 0.22, 4, 8), std(plume)); pl.position.set(-0.25, 0.36, 0.04); pl.rotation.z = 0.08; g.add(pl);
  const pt = mesh(new THREE.CircleGeometry(0.055, 4), std(plate, { metalness: 0.6, roughness: 0.35, side: THREE.DoubleSide })); pt.scale.set(0.8, 1.1, 1); pt.position.set(0, 0.1, 0.295); g.add(pt);
  return g;
}
// Phrygian cap (bonnet rouge) of the revolutionaries.
export function phrygian(color = '#c0272d') {
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(0.31, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = y / 0.31; p.setXYZ(i, x * (1 - 0.3 * k * k), y * 1.05, z + k * k * 0.12); }
  geo.computeVertexNormals();
  g.add(mesh(geo, std(color, { roughness: 0.9 })));
  const tc = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.28, 0.02), new THREE.Vector3(0, 0.36, 0.14), new THREE.Vector3(0, 0.32, 0.28), new THREE.Vector3(0, 0.22, 0.34)]);
  const tg = new THREE.TubeGeometry(tc, 20, 0.1, 12), tp = tg.attributes.position;
  for (let i = 0; i < tp.count; i++) { const u = Math.floor(i / 13) / 20; const cx = tc.getPointAt(Math.min(1, u)); tp.setXYZ(i, cx.x + (tp.getX(i) - cx.x) * (1 - 0.75 * u), cx.y + (tp.getY(i) - cx.y) * (1 - 0.75 * u), cx.z + (tp.getZ(i) - cx.z) * (1 - 0.75 * u)); }
  tg.computeVertexNormals(); g.add(mesh(tg, std(color, { roughness: 0.9 })));
  const ck = cockade(0.06); ck.position.set(0.17, 0.12, 0.22); ck.rotation.y = 0.6; g.add(ck);
  return g;
}
// Golden laurel wreath (Napoleon's coronation).
export function laurel(color = '#e2bd45') {
  const g = new THREE.Group(), m = std(color, { metalness: 0.75, roughness: 0.3 });
  const N = 26;
  for (let i = 0; i < N; i++) {
    const a = -Math.PI * 0.92 + (i / (N - 1)) * Math.PI * 1.84;
    for (const s of [-1, 1]) { const l = mesh(new THREE.SphereGeometry(0.05, 8, 6), m); l.scale.set(0.5, 0.3, 1.25);
      l.position.set(Math.sin(a) * 0.3, 0.02 + s * 0.035, Math.cos(a) * 0.3); l.rotation.set(0, a + s * 0.6, s * 0.5); g.add(l); }
  }
  const ring = mesh(new THREE.TorusGeometry(0.3, 0.012, 6, 40, Math.PI * 1.84), m); ring.rotation.set(Math.PI / 2, 0, Math.PI / 2 + Math.PI * 0.08); g.add(ring);
  return g;
}
// Royal crown (Bourbon / generic kings): gold band, arches, cross, red velvet.
export function crown({ gold = '#e2bd45', velvet = '#8a1f2a', jewels = true } = {}) {
  const g = new THREE.Group(), m = std(gold, { metalness: 0.8, roughness: 0.28 });
  const bandC = mesh(new THREE.CylinderGeometry(0.26, 0.25, 0.12, 32, 1, true), new THREE.MeshStandardMaterial({ color: gold, metalness: 0.8, roughness: 0.28, side: THREE.DoubleSide })); bandC.position.y = 0.06; g.add(bandC);
  const cap = mesh(new THREE.SphereGeometry(0.24, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), std(velvet)); cap.position.y = 0.1; cap.scale.y = 0.8; g.add(cap);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; const arch = mesh(new THREE.TorusGeometry(0.25, 0.014, 6, 24, Math.PI), m); arch.rotation.set(0, a, 0); arch.position.y = 0.1; arch.scale.y = 0.85; g.add(arch); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const f = mesh(new THREE.ConeGeometry(0.03, 0.07, 4), m); f.position.set(Math.cos(a) * 0.255, 0.15, Math.sin(a) * 0.255); g.add(f);
    if (jewels) { const j = mesh(new THREE.SphereGeometry(0.018, 8, 6), std(i % 2 ? '#c0272d' : '#2a5fb8', { roughness: 0.2, metalness: 0.2 })); j.position.set(Math.cos(a) * 0.262, 0.06, Math.sin(a) * 0.262); g.add(j); } }
  const orb = mesh(new THREE.SphereGeometry(0.035, 10, 8), m); orb.position.y = 0.33; g.add(orb);
  g.add(at(box(0.016, 0.08, 0.016, gold), 0, 0.38, 0)); g.add(at(box(0.05, 0.016, 0.016, gold), 0, 0.39, 0));
  return g;
}
export function zucchetto(color = '#f6f3ec') { const m = mesh(new THREE.SphereGeometry(0.2, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2.6), std(color)); return new THREE.Group().add(m); }
// Cossack papakha (fur hat with coloured top).
export function papakha(top = '#b8342f') {
  const g = new THREE.Group();
  const geo = new THREE.CylinderGeometry(0.3, 0.29, 0.32, 28, 4), p = geo.attributes.position, r = rng(9);
  for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)), y = p.getY(i); const k = 1 + 0.03 * Math.sin(a * 11 + y * 30); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); }
  geo.computeVertexNormals(); const f = mesh(geo, std('#221e1b', { roughness: 1 })); f.position.y = 0.16; g.add(f);
  g.add(at(mesh(new THREE.CircleGeometry(0.26, 24), std(top, { side: THREE.DoubleSide })), 0, 0.322, 0, -Math.PI / 2, 0, 0));
  return g;
}
// Spanish wide-brimmed hat (chambergo / sombrero calañés).
export function chambergo(color = '#1d1b1c') {
  const g = new THREE.Group();
  g.add(lathe([[0, 0.24], [0.15, 0.24], [0.24, 0.2], [0.28, 0.08], [0.3, 0.03], [0.5, 0.02], [0.54, 0.04], [0.52, 0.03], [0.48, 0.0], [0.3, -0.005]], color));
  const band = mesh(new THREE.CylinderGeometry(0.29, 0.3, 0.05, 32, 1, true), std('#8a1f2a', { side: THREE.DoubleSide })); band.position.y = 0.06; g.add(band);
  return g;
}
export function tophat(color = '#151416') {
  const g = new THREE.Group();
  g.add(lathe([[0, 0.5], [0.24, 0.5], [0.25, 0.48], [0.23, 0.06], [0.26, 0.02], [0.4, 0.03], [0.42, 0.06], [0.4, 0.04], [0.3, 0.0]], color));
  return g;
}

// ------------------------------------------------------------ accessories
export function sash(colors = ['#2a3f8f', '#f4f1ea', '#c0272d'], width = 0.075) {
  const g = new THREE.Group();
  const c = document.createElement('canvas'); c.width = 96; c.height = 8; const x = c.getContext('2d');
  colors.forEach((col, i) => { x.fillStyle = col; x.fillRect(i * 96 / colors.length, 0, 96 / colors.length + 1, 8); });
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const geo = new THREE.TorusGeometry(0.16, width / 2, 2, 40);
  const m = mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }));
  m.scale.set(0.8, 1.35, 1.0); m.rotation.z = -0.75;
  const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getY(i), 0.5);
  g.add(m); return g;
}
export function waistSash(color = '#c0272d') { const t = mesh(new THREE.CylinderGeometry(0.155, 0.16, 0.06, 28, 1, true), std(color, { side: THREE.DoubleSide })); t.scale.set(1, 1, 0.9); return new THREE.Group().add(t); }
export function star(color = '#e8e4dc') { // Légion d'honneur style breast star
  const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, r = i % 2 ? 0.02 : 0.045; const x = Math.sin(a) * r, y = Math.cos(a) * r; i ? s.lineTo(x, y) : s.moveTo(x, y); }
  const m = mesh(new THREE.ExtrudeGeometry(s, { depth: 0.006, bevelEnabled: false }), std(color, { metalness: 0.7, roughness: 0.3 }));
  const c = mesh(new THREE.CircleGeometry(0.014, 12), std('#c0272d')); c.position.z = 0.008; const g = new THREE.Group(); g.add(m, c); return g;
}
export function musket(color = '#3b3a36', wood = '#7a5232', bayonet = true) {
  const g = P.rifle(color, wood);
  if (bayonet) { const b = mesh(new THREE.ConeGeometry(0.008, 0.2, 4), std('#c8ccd0', { metalness: 0.8, roughness: 0.25 })); b.rotation.x = Math.PI / 2; b.position.set(0.012, 0.0, 0.46); g.add(b); }
  return g;
}
export function sabre() {
  const g = new THREE.Group();
  const blade = mesh(new THREE.BoxGeometry(0.012, 0.5, 0.004), std('#d6dade', { metalness: 0.85, roughness: 0.2 })); blade.position.y = 0.27; g.add(blade);
  g.add(at(box(0.06, 0.012, 0.02, '#c9a227'), 0, 0.02, 0)); g.add(at(cyl(0.012, 0.012, 0.07, '#3a2a1e', 6), 0, -0.02, 0));
  return g;
}
export function lance(color = '#5a3a24') {
  const g = new THREE.Group();
  g.add(at(cyl(0.012, 0.012, 1.9, color, 6), 0, 0.3, 0));
  const tip = mesh(new THREE.ConeGeometry(0.02, 0.12, 4), std('#c8ccd0', { metalness: 0.8, roughness: 0.25 })); tip.position.y = 1.31; g.add(tip);
  const pen = mesh(new THREE.PlaneGeometry(0.16, 0.08), std('#b8342f', { side: THREE.DoubleSide })); pen.position.set(0.08, 1.15, 0); g.add(pen);
  return g;
}
export function telescope() {
  const g = new THREE.Group();
  g.add(at(cyl(0.022, 0.026, 0.2, '#c9a227', 10), 0, 0, 0, Math.PI / 2, 0, 0)); g.add(at(cyl(0.017, 0.02, 0.14, '#3a2a1e', 10), 0, 0, 0.16, Math.PI / 2, 0, 0));
  return g;
}

// ------------------------------------------------------------ outfits and casting
const hat = (r, h, o) => wearHat(r, h, o);
const bic = (o = {}) => bicorne(o);
export const OUTFITS = {
  napoleon: r => { uniformize(r, 'napoleon'); hat(r, bic(), { scale: 0.86, y: 0.88, tilt: -0.05, cap: true }); return r; },
  napoleonYoung: r => { uniformize(r, 'french'); hat(r, bic({ plume: '#c0272d' }), { scale: 0.82, y: 0.88, tilt: -0.05, cap: true }); r.attach('chest', epaulettes(), [0, 0.475, -0.01]); return r; },
  emperor: r => { uniformize(r, 'royal'); hat(r, laurel(), { scale: 1.02, y: 0.72, tilt: 0.12 }); r.attach('chest', star(), [0.07, 0.43, 0.12]); return r; },
  josefina: r => { uniformize(r, 'empress'); r.attach('head', crown({ velvet: '#f0e6d8' }), [0, 0.84, -0.02]); r.hat = null; return r; },
  marialuisa: r => { uniformize(r, 'austrianbride'); r.attach('head', crown({ velvet: '#c9d6ee' }), [0, 0.84, -0.02]); return r; },
  nelson: r => { uniformize(r, 'navy'); const b = bic({ trim: '#d9b23c', cockadeCols: ['#1d1b1c', '#1d1b1c', '#1d1b1c'] }); b.rotation.y = Math.PI / 2; hat(r, b, { scale: 0.8, y: 0.88, tilt: 0, cap: true });
    r.attach('chest', epaulettes('#d9b23c'), [0, 0.475, -0.01]); r.attach('chest', star(), [0.07, 0.43, 0.12]); return r; },
  wellington: r => { uniformize(r, 'diplomat'); hat(r, bic({ cockadeCols: ['#1d1b1c', '#1d1b1c', '#1d1b1c'] }), { scale: 0.84, y: 0.88, tilt: -0.04, cap: true }); return r; },
  blucher: r => { uniformize(r, 'prussian'); hat(r, shako({ color: '#151517', plate: '#e8e4dc', plume: '#e8e4dc', pompom: false }), { scale: 0.86, y: 0.86, tilt: 0.04, cap: true }); r.attach('chest', epaulettes(), [0, 0.475, -0.01]); return r; },
  zar: r => { uniformize(r, 'tsar'); hat(r, bic({ trim: '#e2bd45', plume: '#f4f1ea', cockadeCols: ['#1d1b1c', '#e2bd45', '#1d1b1c'] }), { scale: 0.84, y: 0.88, tilt: -0.04, cap: true }); r.attach('chest', epaulettes('#e2bd45'), [0, 0.475, -0.01]); r.attach('chest', sash(['#2a6ab8', '#2a6ab8']), [0, 0.4, 0]); return r; },
  jose: r => { uniformize(r, 'royal'); r.attach('head', crown(), [0, 0.84, -0.02]); r.attach('chest', sash(['#c0272d', '#e8c84a', '#c0272d']), [0, 0.4, 0]); hideEars(r); flattenAhoge(r); return r; },
  hidalgo: r => { uniformize(r, 'priest'); return r; },
  papa: r => { uniformize(r, 'pope'); hat(r, zucchetto(), { scale: 1, y: 0.86, tilt: 0.08 }); return r; },
  king: r => { uniformize(r, 'royal'); r.attach('head', crown(), [0, 0.84, -0.02]); return r; },
  marshal: r => { uniformize(r, 'marshal'); hat(r, bic({ trim: '#e2bd45', plume: '#f4f1ea' }), { scale: 0.84, y: 0.88, tilt: -0.04, cap: true }); r.attach('chest', epaulettes('#e2bd45'), [0, 0.475, -0.01]); return r; },
  fusilier: r => { generic(r, '#3a2c26'); uniformize(r, 'french'); hat(r, shako(), { scale: 0.9, y: 0.86, tilt: 0.04, cap: true }); r.attach('chest', crossbelts('#f4f1ea'), [0, 0.39, 0]); r.equip(musket(), G.HOLDS); return r; },
  grenadier: r => { generic(r, '#2e2420'); uniformize(r, 'guard'); hat(r, bearskin(), { scale: 0.86, y: 0.84, tilt: 0.02, cap: true }); r.attach('chest', crossbelts('#f4f1ea'), [0, 0.39, 0]); r.equip(musket(), G.HOLDS); return r; },
  artillero: r => { generic(r, '#3a2c26'); uniformize(r, 'guard'); hat(r, shako({ plume: '#c0272d' }), { scale: 0.9, y: 0.86, tilt: 0.04, cap: true }); return r; },
  redcoat: r => { generic(r, '#4a3428'); uniformize(r, 'british'); hat(r, shako({ plate: '#d8d4c8', plume: '#f4f1ea', front: true, bell: 0.0, tall: 0.36 }), { scale: 0.88, y: 0.86, tilt: 0.04, cap: true });
    r.attach('chest', crossbelts('#f4f1ea'), [0, 0.39, 0]); r.equip(musket('#3b3a36', '#6a4428'), G.HOLDS); return r; },
  sailor: r => { generic(r, '#4a3428'); uniformize(r, 'navy'); hat(r, (() => { const g = new THREE.Group(); g.add(lathe([[0, 0.12], [0.22, 0.12], [0.26, 0.08], [0.28, 0.02], [0.36, 0.02], [0.37, 0.0], [0.28, -0.01]], '#151517')); return g; })(), { scale: 0.9, y: 0.88, tilt: -0.05, cap: true }); return r; },
  russo: r => { generic(r, '#3a2c26'); uniformize(r, 'russian'); hat(r, shako({ plate: '#d4af37', plume: '#1d1b1c' }), { scale: 0.9, y: 0.86, tilt: 0.04, cap: true }); r.attach('chest', crossbelts('#f4f1ea'), [0, 0.39, 0]); r.equip(musket(), G.HOLDS); return r; },
  austriaco: r => { generic(r, '#3a2c26'); uniformize(r, 'austrian'); hat(r, shako({ color: '#1d1b1c', plate: '#d4af37', plume: '#d4af37', tall: 0.36 }), { scale: 0.9, y: 0.86, tilt: 0.04, cap: true }); r.attach('chest', crossbelts('#1d1b1c'), [0, 0.39, 0]); r.equip(musket(), G.HOLDS); return r; },
  prusiano: r => { generic(r, '#3a2c26'); uniformize(r, 'prussian'); hat(r, shako({ plate: '#e8e4dc', plume: '#e8e4dc' }), { scale: 0.9, y: 0.86, tilt: 0.04, cap: true }); r.attach('chest', crossbelts('#f4f1ea'), [0, 0.39, 0]); r.equip(musket(), G.HOLDS); return r; },
  cosaco: r => { generic(r, '#2a2018'); uniformize(r, 'cossack'); hat(r, papakha(), { scale: 0.9, y: 0.86, tilt: 0.02, cap: true }); return r; },
  guerrillero: r => { generic(r, '#2a2018'); uniformize(r, 'spanish'); hat(r, chambergo(), { scale: 0.86, y: 0.9, tilt: -0.06, cap: true }); r.attach('chest', crossbelts('#3a2a1e'), [0, 0.39, 0]); r.equip(musket('#3b3a36', '#7a5232', false), G.HOLDS); return r; },
  madrileno: r => { generic(r, '#2a2018'); uniformize(r, 'peasant'); hat(r, chambergo('#3a2c22'), { scale: 0.86, y: 0.9, tilt: -0.06, cap: true }); return r; },
  sansculotte: r => { generic(r, '#3a2a20'); uniformize(r, 'sansculotte'); hat(r, phrygian(), { scale: 0.86, y: 0.86, tilt: -0.05, cap: true }); return r; },
  sansPike: r => { generic(r, '#3a2a20'); uniformize(r, 'sansculotte'); hat(r, phrygian(), { scale: 0.86, y: 0.86, tilt: -0.05, cap: true }); r.equip(musket('#3b3a36', '#7a5232', true), G.HOLDS); return r; },
  campesinoMx: r => { generic(r, '#2a2018'); uniformize(r, 'mexican'); hat(r, chambergo('#c9b07a'), { scale: 0.86, y: 0.9, tilt: -0.06, cap: true }); return r; },
  diplomat: r => { generic(r, '#2e2420'); uniformize(r, 'diplomat'); r.attach('chest', sash(['#c0272d', '#c0272d']), [0, 0.4, 0]); hideEars(r); return r; },
  civil: r => { generic(r, '#2e2420'); uniformize(r, 'diplomat'); hat(r, tophat(), { scale: 0.86, y: 0.88, tilt: -0.04, cap: true }); return r; },
};
export const CASTING = { napoleon: 'cafe', napoleonYoung: 'cafe', emperor: 'cafe', josefina: 'daiwa', marialuisa: 'doto', nelson: 'suzuka', wellington: 'helios', blucher: 'tamamo', zar: 'mcqueen', jose: 'doto', hidalgo: 'oguri', papa: 'tamamo' };

let seedCounter = 0;
export function person(parent, who, outfit = who, x = 0, z = 0, yaw = 0) {
  const key = CASTING[who] || who;
  const r = C_.spawn(key); r.seed = (seedCounter++ * 1.37) % 10; OUTFITS[outfit](r);
  r.root.position.set(x, 0, z); r.root.rotation.y = yaw; parent.add(r.root); r.who = who; return r;
}
export { pose } from '../mx/kit.js';
