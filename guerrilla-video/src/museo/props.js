// Props for "El robo del siglo" (Museo Nacional de Antropología, Nochebuena de 1985). Chibi scale: 1 unit ≈ 1.4 m.
// The treasures (Pakal's jade mask, the Zapotec bat god, the Mexica obsidian monkey, Mixtec gold), the museum's glass
// cases, stelae and the Sun Stone, El Paraguas, the Tláloc monolith, Paseo de la Reforma with its Christmas lamps, the
// Volkswagen sedán, the air-conditioning duct, the guards' Christmas table, the closet in Satélite, Acapulco at night,
// the wiretap desk and the 1989 police cars. Animated parts expose small functions (open, spin, blink, drive).
import * as THREE from 'three';
import { at, box, cyl, mesh, rng } from '../lib/props.js';
import { canvasTex } from '../amer/look.js';
import { wheel } from '../narco/props.js';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });
const glowM = (color, i = 1.5) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: i, roughness: 0.5 });
const basic = (color, o = {}) => new THREE.MeshBasicMaterial({ color, ...o });
const dyn = o => { o.userData.dynamic = true; return o; };
const sm = (geo, m) => { const o = new THREE.Mesh(geo, m); o.castShadow = true; o.receiveShadow = true; return o; };
export const GOLD = '#d9a93c';
export const goldM = () => std(GOLD, { metalness: 0.92, roughness: 0.28, emissive: '#3a2400', emissiveIntensity: 0.25, envMap: studioEnv(), envMapIntensity: 0.9 });

// ------------------------------------------------------------ textures
const texCache = {};
// Soft studio reflections (a cube of gradient canvases with two strip lights) for obsidian, jade and gold.
let ENV = null;
export function studioEnv() {
  if (ENV) return ENV;
  const face = top => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, top ? '#d8dce4' : '#3a3e48'); g.addColorStop(1, '#06070a'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    if (!top) { x.fillStyle = 'rgba(255,248,235,0.9)'; x.fillRect(30, 18, 68, 10); x.fillStyle = 'rgba(255,248,235,0.35)'; x.fillRect(10, 50, 14, 50); }
    return c; };
  ENV = new THREE.CubeTexture([face(false), face(false), face(true), face(false), face(false), face(false)]); ENV.colorSpace = THREE.SRGBColorSpace; ENV.needsUpdate = true;
  return ENV;
}
const once = (k, f) => texCache[k] || (texCache[k] = f());
// Jade mosaic: irregular greenstone tesserae with dark grout (repeat sets the tile size).
export function mosaicTex(seed = 3, cols = ['#2f7a4f', '#3f8f5a', '#5aa070', '#276a44', '#6fb585', '#1f5a3a'], grout = '#10241a', n = 18) {
  return once('mos' + seed + cols[0] + n, () => canvasTex(512, 512, (c, W, H) => { const r = rng(seed); c.fillStyle = grout; c.fillRect(0, 0, W, H);
    const s = W / n;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const x = i * s, y = j * s, k = () => (r() - 0.5) * s * 0.28;
      c.fillStyle = cols[Math.floor(r() * cols.length)]; c.beginPath();
      c.moveTo(x + 2 + k(), y + 2 + k()); c.lineTo(x + s - 2 + k(), y + 2 + k()); c.lineTo(x + s - 2 + k(), y + s - 2 + k()); c.lineTo(x + 2 + k(), y + s - 2 + k()); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x + 4, y + 4, s * 0.35, s * 0.18);
    } }));
}
// Carved stone (relief glyph blocks); returns { map, bump }.
export function carvedTex(seed = 1, base = '#8a8478', kind = 'glyphs') {
  return once('carve' + seed + base + kind, () => {
    const draw = (c, W, H, bump) => { const r = rng(seed);
      c.fillStyle = bump ? '#808080' : base; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 1600; i++) { const v = bump ? 110 + r() * 40 : 0; c.fillStyle = bump ? `rgb(${v},${v},${v})` : `rgba(0,0,0,${r() * 0.06})`; c.fillRect(r() * W, r() * H, 2 + r() * 4, 2 + r() * 4); }
      const hi = bump ? '#c8c8c8' : 'rgba(255,255,255,0.10)', lo = bump ? '#383838' : 'rgba(0,0,0,0.32)';
      if (kind === 'glyphs') {
        const cols = 4, rows = 8, gw = W / cols, gh = H / rows;
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
          const x = i * gw + 8, y = j * gh + 8, w = gw - 16, h = gh - 16;
          c.strokeStyle = lo; c.lineWidth = 6; c.beginPath(); c.roundRect(x, y, w, h, 14); c.stroke();
          c.strokeStyle = hi; c.lineWidth = 3; c.beginPath(); c.roundRect(x + 3, y + 3, w - 6, h - 6, 12); c.stroke();
          c.fillStyle = lo; for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(x + w * (0.25 + r() * 0.5), y + h * (0.3 + r() * 0.4), 5 + r() * 9, 4 + r() * 7, r() * 3, 0, 7); c.fill(); }
          c.strokeStyle = lo; c.lineWidth = 4; c.beginPath(); c.moveTo(x + 10, y + h * 0.7); c.bezierCurveTo(x + w * 0.4, y + h * (0.4 + r() * 0.5), x + w * 0.6, y + h * 0.9, x + w - 10, y + h * 0.6); c.stroke();
        }
      } else if (kind === 'relief') {   // bronze column relief: figures in bands
        for (let j = 0; j < 6; j++) { const y = j * H / 6; c.fillStyle = lo; c.fillRect(0, y, W, 6);
          for (let i = 0; i < 5; i++) { const x = i * W / 5 + 20; c.fillStyle = hi; c.beginPath(); c.ellipse(x + 30, y + 30, 14, 16, 0, 0, 7); c.fill(); c.fillRect(x + 18, y + 46, 24, 60); c.strokeStyle = hi; c.lineWidth = 6; c.beginPath(); c.moveTo(x + 18, y + 60); c.lineTo(x - 4, y + 90); c.moveTo(x + 42, y + 60); c.lineTo(x + 66, y + 40); c.stroke(); } }
      }
    };
    const map = canvasTex(512, 1024, (c, W, H) => draw(c, W, H, false));
    const bump = canvasTex(512, 1024, (c, W, H) => draw(c, W, H, true), { srgb: false });
    return { map, bump };
  });
}
// Panel of text (labels, signs): plane-ready texture.
export function textTex(lines, { w = 512, h = 128, bg = null, fg = '#ffffff', font = '700 54px Inter', align = 'center', pad = 16 } = {}) {
  return canvasTex(w, h, (c, W, H) => { if (bg) { c.fillStyle = bg; c.fillRect(0, 0, W, H); } c.fillStyle = fg; c.font = font; c.textAlign = align; c.textBaseline = 'middle';
    const L = Array.isArray(lines) ? lines : [lines], lh = H / L.length; L.forEach((t, i) => c.fillText(t, align === 'center' ? W / 2 : pad, lh * (i + 0.5) + 2)); });
}
const plane = (w, h, map, o = {}) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map, roughness: 0.8, transparent: true, ...o }));

// ------------------------------------------------------------ the treasures (built facing +z, base at y = 0)
// Funerary mask of K'inich Janaab' Pakal: a jade mosaic face with shell-and-obsidian eyes and jade ear flares. s = height.
export function pakalMask(s = 0.17) {
  const g = new THREE.Group(), u = new THREE.Group(); g.add(u); u.scale.setScalar(s); u.position.y = s * 0.62;
  g.add(at(box(s * 0.08, s * 0.16, s * 0.08, '#0c0c0c'), 0, s * 0.08, -s * 0.12));
  const jade = std('#ffffff', { map: mosaicTex(7, ['#2f7a4f', '#3f8f5a', '#4f9a68', '#276a44', '#5aa572', '#21603e', '#36825a'], '#0e2216', 30), roughness: 0.3, metalness: 0.08, envMap: studioEnv(), envMapIntensity: 0.6, side: THREE.DoubleSide });
  const fg = new THREE.SphereGeometry(0.5, 48, 32, 0, Math.PI, 0.08 * Math.PI, 0.84 * Math.PI), fp = fg.attributes.position;
  for (let i = 0; i < fp.count; i++) { const y = fp.getY(i); if (y < -0.15) { const k = (-0.15 - y) / 0.35; fp.setX(i, fp.getX(i) * (1 - 0.35 * k)); } }   // narrower jaw and chin
  fg.computeVertexNormals();
  const face = sm(fg, jade); face.scale.set(0.72, 1.0, 0.36); u.add(face);
  // brow ridge, nose, cheeks
  const jadeS = std('#ffffff', { map: mosaicTex(9, undefined, undefined, 10), roughness: 0.3 });
  const brow = sm(new THREE.CapsuleGeometry(0.03, 0.4, 4, 10), jadeS); brow.rotation.z = Math.PI / 2; brow.position.set(0, 0.16, 0.165); u.add(brow);
  const nose = sm(new THREE.ConeGeometry(0.07, 0.24, 4), jadeS); nose.position.set(0, -0.02, 0.19); nose.rotation.x = -0.3; nose.scale.set(1, 1, 0.75); u.add(nose);
  for (const sx of [-1, 1]) {
    const eye = sm(new THREE.SphereGeometry(0.1, 20, 12), std('#efe7d6', { roughness: 0.35 })); eye.scale.set(0.95, 0.42, 0.3); eye.position.set(sx * 0.13, 0.085, 0.17); eye.rotation.z = sx * -0.12; u.add(eye);
    const pup = sm(new THREE.SphereGeometry(0.033, 14, 10), std('#060608', { roughness: 0.12, metalness: 0.3 })); pup.scale.set(1, 1, 0.5); pup.position.set(sx * 0.115, 0.08, 0.197); u.add(pup);
    const flare = sm(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 24), std('#ffffff', { map: mosaicTex(11, ['#2a7048', '#3a8a58', '#4d9a68'], '#10241a', 6), roughness: 0.3, envMap: studioEnv(), envMapIntensity: 0.5 })); flare.rotation.x = Math.PI / 2; flare.position.set(sx * 0.42, 0.0, 0.02); u.add(flare);
    const bead = sm(new THREE.SphereGeometry(0.03, 12, 8), std('#2a6a44', { roughness: 0.25 })); bead.position.set(sx * 0.42, 0.0, 0.045); u.add(bead);
  }
  const lips = sm(new THREE.CapsuleGeometry(0.028, 0.13, 4, 10), jadeS); lips.rotation.z = Math.PI / 2; lips.position.set(0, -0.2, 0.15); u.add(lips);
  u.add(at(box(0.14, 0.016, 0.02, '#1a120c'), 0, -0.2, 0.172));
  return g;
}
// Zapotec bat god mask from Monte Albán: jade plates, tall ears, shell eyes, open fanged mouth and three pendants.
export function batMask(s = 0.17) {
  const g = new THREE.Group(), u = new THREE.Group(); g.add(u); u.scale.setScalar(s); u.position.y = s * 0.62;
  const jade = std('#ffffff', { map: mosaicTex(13, ['#2a7a50', '#3a8a5c', '#2f7048', '#4a9264'], '#0c1a12', 7), roughness: 0.26, metalness: 0.08, envMap: studioEnv(), envMapIntensity: 0.6 });
  const plate = new THREE.Shape(); plate.moveTo(-0.32, 0.22); plate.quadraticCurveTo(0, 0.3, 0.32, 0.22); plate.lineTo(0.3, -0.12); plate.quadraticCurveTo(0, -0.38, -0.3, -0.12); plate.closePath();
  u.add(sm(new THREE.ExtrudeGeometry(plate, { depth: 0.12, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025, bevelSegments: 2 }), jade));
  for (const sx of [-1, 1]) {
    const ear = new THREE.Shape(); ear.moveTo(0, 0); ear.lineTo(sx * 0.2, 0); ear.lineTo(sx * 0.17, 0.36); ear.closePath();
    const e = sm(new THREE.ExtrudeGeometry(ear, { depth: 0.07, bevelEnabled: false }), jade); e.position.set(sx * 0.1, 0.2, 0.02); u.add(e);
    const eye = sm(new THREE.CylinderGeometry(0.065, 0.065, 0.03, 20), std('#ece4d0', { roughness: 0.35 })); eye.rotation.x = Math.PI / 2; eye.position.set(sx * 0.14, 0.09, 0.16); u.add(eye);
    u.add(at(sm(new THREE.CylinderGeometry(0.028, 0.028, 0.035, 14), std('#0a0a0c', { roughness: 0.2 })), sx * 0.14, 0.09, 0.172, Math.PI / 2, 0, 0));
  }
  const leaf = new THREE.Shape(); leaf.moveTo(-0.06, 0); leaf.lineTo(0.06, 0); leaf.lineTo(0, 0.17); leaf.closePath();
  u.add(at(sm(new THREE.ExtrudeGeometry(leaf, { depth: 0.04, bevelEnabled: false }), jade), 0, -0.02, 0.16));
  u.add(at(box(0.3, 0.1, 0.05, '#120c08'), 0, -0.15, 0.15));
  for (const x of [-0.11, -0.04, 0.04, 0.11]) { const f = sm(new THREE.ConeGeometry(0.018, 0.07, 6), std('#f2ecdc', { roughness: 0.4 })); f.position.set(x, x * x > 0.005 ? -0.12 : -0.18, 0.18); f.rotation.z = Math.PI * (x * x > 0.005 ? 1 : 0); u.add(f); }
  for (const x of [-0.12, 0, 0.12]) { u.add(at(cyl(0.006, 0.006, 0.08, '#2a3a30', 6), x, -0.34, 0.06)); const p = sm(new THREE.CylinderGeometry(0.035, 0.03, 0.1, 12), jade); p.position.set(x, -0.43, 0.06); u.add(p); }
  return g;
}
// Mexica obsidian vessel in the form of a monkey (polished black glass with a crouching monkey wrapped round it).
export function monkeyVessel(s = 0.14) {
  const g = new THREE.Group(), u = new THREE.Group(); g.add(u); u.scale.setScalar(s);
  const obs = std('#121218', { roughness: 0.08, metalness: 0.45, envMap: studioEnv(), envMapIntensity: 1.4 });
  const prof = [[0, 0], [0.28, 0.02], [0.42, 0.18], [0.46, 0.42], [0.4, 0.66], [0.26, 0.82], [0.22, 0.9], [0.25, 0.98], [0.21, 1.0], [0.18, 0.92]].map(([x, y]) => new THREE.Vector2(x, y));
  u.add(sm(new THREE.LatheGeometry(prof, 36), obs));
  const head = sm(new THREE.SphereGeometry(0.21, 24, 16), obs); head.position.set(0, 0.86, 0.33); u.add(head);
  const muzzle = sm(new THREE.SphereGeometry(0.11, 16, 10), obs); muzzle.position.set(0, 0.8, 0.5); muzzle.scale.set(1.1, 0.8, 0.8); u.add(muzzle);
  for (const sx of [-1, 1]) {
    const eye = sm(new THREE.TorusGeometry(0.04, 0.014, 8, 16), obs); eye.position.set(sx * 0.08, 0.92, 0.51); u.add(eye);
    const ear = sm(new THREE.TorusGeometry(0.06, 0.022, 8, 16), obs); ear.position.set(sx * 0.21, 0.9, 0.3); ear.rotation.y = Math.PI / 2; u.add(ear);
    const arm = sm(new THREE.TorusGeometry(0.42, 0.045, 10, 30, Math.PI * 0.55), obs); arm.position.set(0, 0.5, 0); arm.rotation.set(Math.PI / 2, 0, sx > 0 ? -0.1 : Math.PI + 0.1 - Math.PI * 0.55); arm.scale.set(1, 1, 1); u.add(arm);
    const leg = sm(new THREE.SphereGeometry(0.12, 14, 10), obs); leg.position.set(sx * 0.22, 0.12, 0.3); leg.scale.set(0.8, 0.6, 1.2); u.add(leg);
  }
  const tail = sm(new THREE.TorusGeometry(0.28, 0.035, 8, 30, Math.PI * 1.3), obs); tail.position.set(0, 0.6, -0.36); tail.rotation.set(0, Math.PI / 2, 0.4); u.add(tail);
  return g;
}
// Mixtec gold pectoral of Yanhuitlán: turquoise mosaic shield, gold rim and boss, four arrows, little bells below.
export function pectoral(s = 0.15) {
  const g = new THREE.Group(), u = new THREE.Group(); g.add(u); u.scale.setScalar(s); u.position.y = s * 0.62;
  const gold = goldM();
  const tq = std('#ffffff', { map: mosaicTex(21, ['#2fa8a0', '#3cc0b0', '#24908a', '#56c8bc'], '#0c2a28', 14), roughness: 0.35 });
  const disc = sm(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 40), tq); disc.rotation.x = Math.PI / 2; u.add(disc);
  const rim = sm(new THREE.TorusGeometry(0.3, 0.035, 10, 48), gold); u.add(rim);
  const boss = sm(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 24), gold); boss.rotation.x = Math.PI / 2; boss.position.z = 0.03; u.add(boss);
  for (let i = 0; i < 4; i++) { const ar = sm(new THREE.CylinderGeometry(0.012, 0.012, 0.9, 6), gold); ar.rotation.z = Math.PI / 2; ar.position.set(0, -0.12 + i * 0.08, -0.03); u.add(ar);
    const tip = sm(new THREE.ConeGeometry(0.03, 0.07, 6), gold); tip.rotation.z = -Math.PI / 2; tip.position.set(0.48, -0.12 + i * 0.08, -0.03); u.add(tip); }
  for (let i = 0; i < 7; i++) { const x = -0.24 + i * 0.08; u.add(at(cyl(0.004, 0.004, 0.08, GOLD, 4), x, -0.36, 0)); const b = sm(new THREE.SphereGeometry(0.03, 12, 8), gold); b.scale.y = 1.2; b.position.set(x, -0.42, 0); u.add(b); }
  return g;
}
// A tray of small gold: discs, beads, rings and bells (cenote offerings, Mixtec jewellery), laid flat on a cloth.
export function goldTray(seed = 1, w = 0.42, d = 0.3) {
  const g = new THREE.Group(), r = rng(seed), gold = goldM();
  g.add(at(box(w, 0.012, d, '#3a1e1a'), 0, 0.006, 0));
  for (let i = 0; i < 9; i++) { const kind = i % 4, x = (r() - 0.5) * w * 0.8, z = (r() - 0.5) * d * 0.8;
    if (kind === 0) { const disc = sm(new THREE.CylinderGeometry(0.035, 0.035, 0.005, 20), gold); disc.position.set(x, 0.016, z); g.add(disc); }
    else if (kind === 1) { const ring = sm(new THREE.TorusGeometry(0.02, 0.005, 6, 16), gold); ring.rotation.x = Math.PI / 2; ring.position.set(x, 0.016, z); g.add(ring); }
    else if (kind === 2) { const b = sm(new THREE.SphereGeometry(0.014, 10, 8), gold); b.scale.y = 1.3; b.position.set(x, 0.026, z); g.add(b); }
    else { for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI, b = sm(new THREE.SphereGeometry(0.007, 8, 6), gold); b.position.set(x + Math.cos(a) * 0.05, 0.018, z + Math.sin(a) * 0.035); g.add(b); } }
  }
  return g;
}
export const ARTIFACT = { pakal: pakalMask, bat: batMask, monkey: monkeyVessel, pectoral, gold: goldTray };

// ------------------------------------------------------------ museum furniture
// Glass case on a pedestal. c.inside is the floor of the case (put the piece there); c.open(k) lifts the lid off and swings
// the front pane open; c.light is the narrow spot from the ceiling track (c.setLight(k)). Faces +z.
export function vitrine({ w = 0.62, d = 0.46, ped = 0.66, gh = 0.48, label = null, spot = 5.5, col = '#1b1916', hero = false } = {}) {
  const g = new THREE.Group();
  g.add(at(box(w, ped, d, col), 0, ped / 2, 0)); g.add(at(box(w + 0.02, 0.025, d + 0.02, '#2a2622'), 0, ped + 0.012, 0)); g.add(at(box(w + 0.03, 0.04, d + 0.03, '#0f0e0c'), 0, 0.02, 0));
  const glass = new THREE.MeshStandardMaterial({ color: '#cfe6f2', transparent: true, opacity: 0.14, roughness: 0.04, metalness: 0.1, depthWrite: false, side: THREE.DoubleSide });
  const frame = std('#9a9ea4', { metalness: 0.6, roughness: 0.3 });
  const y0 = ped + 0.025, yc = y0 + gh / 2;
  const fixed = new THREE.Group(); g.add(fixed);
  for (const sx of [-1, 1]) fixed.add(at(new THREE.Mesh(new THREE.PlaneGeometry(d, gh), glass), sx * w / 2, yc, 0, 0, Math.PI / 2, 0));
  fixed.add(at(new THREE.Mesh(new THREE.PlaneGeometry(w, gh), glass), 0, yc, -d / 2));
  for (const [x, z] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) fixed.add(at(box(0.012, gh, 0.012, frame), x, yc, z));
  // front pane hinged on its left edge; lid lifts and slides back
  const hinge = dyn(new THREE.Group()); hinge.position.set(-w / 2, yc, d / 2); g.add(hinge);
  hinge.add(at(new THREE.Mesh(new THREE.PlaneGeometry(w, gh), glass), w / 2, 0, 0)); hinge.add(at(box(0.012, gh, 0.012, frame), w, 0, 0));
  const lid = dyn(new THREE.Group()); lid.position.set(0, y0 + gh, 0); g.add(lid);
  lid.add(at(new THREE.Mesh(new THREE.PlaneGeometry(w, d), glass), 0, 0, 0, -Math.PI / 2, 0, 0));
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.7, 0.03), glowM('#fff3dc', 1.6)); strip.rotation.x = Math.PI / 2; strip.position.set(0, -0.012, -d / 2 + 0.05); lid.add(strip); g.strip = strip;
  for (const z of [-d / 2, d / 2]) lid.add(at(box(w, 0.012, 0.012, frame), 0, 0, z)); for (const x of [-w / 2, w / 2]) lid.add(at(box(0.012, 0.012, d, frame), x, 0, 0));
  g.open = k => { k = Math.max(0, Math.min(1, k)); hinge.rotation.y = -1.9 * k; lid.position.y = y0 + gh + 0.06 * Math.min(1, k * 3); lid.position.z = -d * 0.9 * Math.max(0, k * 1.5 - 0.5); lid.visible = k < 0.98; };
  const inside = new THREE.Group(); inside.position.y = y0; g.add(inside); g.inside = inside;
  inside.add(at(box(w * 0.5, 0.05, d * 0.45, '#0d0c0b'), 0, 0.025, -d * 0.05)); inside.top = 0.05;
  const l = new THREE.SpotLight('#fff1d8', spot, 4.2, 0.3, 0.55, 1.2); l.position.set(0, y0 + gh + 1.6, 0.45); l.target.position.set(0, y0 + 0.12, 0); g.add(l, l.target); g.light = l;
  if (hero) { l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -0.0005; }
  g.setLight = k => { l.intensity = spot * k; strip.material.emissiveIntensity = 1.6 * k; };
  if (label) { const p = plane(0.26, 0.07, textTex(label, { w: 512, h: 136, bg: '#e8e2d2', fg: '#1d1a16', font: '700 44px Inter' })); p.position.set(0, ped * 0.78, d / 2 + 0.002); g.add(p); }
  g.top = y0 + 0.05; g.dims = { w, d, ped, gh };
  return g;
}
// Maya stela: a tall carved slab on a low base.
export function stela(h = 2.2, w = 0.8, seed = 1) {
  const g = new THREE.Group(), T = carvedTex(seed, '#8c8576');
  g.add(at(sm(new THREE.BoxGeometry(w, h, 0.28), std('#ffffff', { map: T.map, bumpMap: T.bump, bumpScale: 2.5, roughness: 0.95 })), 0, h / 2 + 0.12, 0));
  g.add(at(box(w + 0.2, 0.12, 0.5, '#4a4640'), 0, 0.06, 0));
  return g;
}
// The Sun Stone: a carved disc on the wall (concentric glyph rings round the face of the sun). r = radius.
export function sunStone(r = 1.3) {
  const draw = (c, W, H, bump) => { const R = W / 2, rr = rng(5); c.fillStyle = bump ? '#7a7a7a' : '#958d7c'; c.fillRect(0, 0, W, H);
    const lo = bump ? '#303030' : 'rgba(30,24,18,0.55)', hi = bump ? '#d0d0d0' : 'rgba(255,248,230,0.16)';
    c.translate(R, R);
    const ring = (r0, r1, n, f) => { c.strokeStyle = lo; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, r1, 0, 7); c.stroke(); c.strokeStyle = hi; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, r1 - 5, 0, 7); c.stroke();
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; c.save(); c.rotate(a); f(r0, r1, i); c.restore(); } };
    ring(0.86 * R, 0.99 * R, 2, () => {});
    ring(0.7 * R, 0.86 * R, 16, (a, b) => { c.fillStyle = lo; c.beginPath(); c.moveTo(-14, -a - 6); c.lineTo(14, -a - 6); c.lineTo(0, -b + 8); c.closePath(); c.fill(); });
    ring(0.56 * R, 0.7 * R, 40, (a, b) => { c.fillStyle = lo; c.fillRect(-4, -b + 6, 8, b - a - 12); });
    ring(0.4 * R, 0.56 * R, 20, (a, b) => { c.strokeStyle = lo; c.lineWidth = 5; c.strokeRect(-20, -b + 8, 40, b - a - 16); c.fillStyle = lo; c.beginPath(); c.arc(0, -(a + b) / 2, 7 + rr() * 4, 0, 7); c.fill(); });
    ring(0.22 * R, 0.4 * R, 4, (a, b) => { c.fillStyle = lo; c.save(); c.rotate(Math.PI / 4); c.fillRect(-26, -b + 10, 52, b - a - 20); c.restore(); });
    c.fillStyle = lo; c.beginPath(); c.arc(0, 0, 0.22 * R, 0, 7); c.fill(); c.fillStyle = bump ? '#a0a0a0' : '#8a8272'; c.beginPath(); c.arc(0, 0, 0.19 * R, 0, 7); c.fill();
    c.fillStyle = lo; for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(sx * 26, -16, 14, 8, 0, 0, 7); c.fill(); } c.beginPath(); c.moveTo(-22, 28); c.lineTo(22, 28); c.lineTo(0, 62); c.closePath(); c.fill();
    for (let i = 0; i < 2600; i++) { const v = bump ? 90 + rr() * 60 : 0; c.fillStyle = bump ? `rgb(${v},${v},${v})` : `rgba(0,0,0,${rr() * 0.07})`; c.fillRect((rr() - 0.5) * W, (rr() - 0.5) * H, 3, 3); }
  };
  const map = canvasTex(1024, 1024, (c, W, H) => draw(c, W, H, false)), bump = canvasTex(1024, 1024, (c, W, H) => draw(c, W, H, true), { srgb: false });
  const g = new THREE.Group();
  const d = sm(new THREE.CylinderGeometry(r, r, 0.28, 72), [std('#837b6c', { roughness: 0.95 }), std('#ffffff', { map, bumpMap: bump, bumpScale: 3, roughness: 0.92 }), std('#837b6c')]);
  d.rotation.x = Math.PI / 2; g.add(d);
  return g;
}
// Track light fixture with a little glowing lens (ceiling mounted, pointing down).
export function trackLamp() { const g = new THREE.Group(); g.add(at(cyl(0.035, 0.035, 0.12, '#1a1a1c', 10), 0, -0.06, 0)); g.add(at(mesh(new THREE.CircleGeometry(0.03, 12), glowM('#fff1d8', 2)), 0, -0.121, 0, Math.PI / 2, 0, 0)); return g; }

// ------------------------------------------------------------ El Paraguas, the Tláloc monolith, the façade, Reforma
// The umbrella of the central patio: one carved column holding a huge flat canopy, and a ring of water falling from the
// canopy's edge round the column into a round basin. W x D canopy at height H. g.tick(t) scrolls the falling water.
export function paraguas(W = 22, D = 15, H = 6.2) {
  const g = new THREE.Group(), conc = std('#8c8a84', { roughness: 0.95 });
  const T = carvedTex(4, '#7a6650', 'relief');
  g.add(at(sm(new THREE.CylinderGeometry(0.55, 0.62, H, 28), std('#ffffff', { map: T.map, bumpMap: T.bump, bumpScale: 3, roughness: 0.7, metalness: 0.35 })), 0, H / 2, 0));
  const can = sm(new THREE.BoxGeometry(W, 0.55, D), conc); can.position.y = H + 0.27; g.add(can);
  const under = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#9a978f'; c.fillRect(0, 0, w, h); c.strokeStyle = '#6a6862'; c.lineWidth = 10; for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(i * w / 8, 0); c.lineTo(i * w / 8, h); c.stroke(); c.beginPath(); c.moveTo(0, i * h / 8); c.lineTo(w, i * h / 8); c.stroke(); } }, { repeat: [W / 3, D / 3] });
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std('#ffffff', { map: under, roughness: 0.95 })); ceil.rotation.x = Math.PI / 2; ceil.position.y = H - 0.005; g.add(ceil);
  g.add(at(cyl(1.2, 0.6, 0.6, '#77746c', 28), 0, H - 0.25, 0));
  // water: a ring of streaks falling from the capital round the column
  const wt = canvasTex(256, 512, (c, w, h) => { c.clearRect(0, 0, w, h); const r = rng(8); for (let i = 0; i < 140; i++) { const x = r() * w, y = r() * h, l = 40 + r() * 120; const gr = c.createLinearGradient(0, y, 0, y + l); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,255,255,${0.35 + r() * 0.5})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(x, y, 1.5 + r() * 2, l); c.fillRect(x, y - h, 1.5, l); } }, { repeat: [6, 2], srgb: false });
  const water = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.6, H - 0.5, 40, 1, true), new THREE.MeshBasicMaterial({ map: wt, color: '#cfe2ff', transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  water.position.y = (H - 0.5) / 2; dyn(water); g.add(water);
  const basin = sm(new THREE.CylinderGeometry(2.4, 2.5, 0.35, 40), std('#5a5852', { roughness: 0.9 })); basin.position.y = 0.17; g.add(basin);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(2.25, 40), std('#1d2a36', { roughness: 0.08, metalness: 0.4 })); pool.rotation.x = -Math.PI / 2; pool.position.y = 0.3; g.add(pool);
  g.tick = t => { wt.offset.y = t * 1.6; };
  return g;
}
// The Tláloc monolith at the entrance on Reforma: a weathered block figure with goggle eyes and a fanged mouth.
export function tlaloc(h = 5) {
  const g = new THREE.Group(), T = carvedTex(12, '#6e695e'), st = std('#ffffff', { map: T.map, bumpMap: T.bump, bumpScale: 4, roughness: 1 });
  g.add(at(box(2.6, 0.5, 2.0, '#4e4a44'), 0, 0.25, 0));
  g.add(at(sm(new THREE.BoxGeometry(1.5, h * 0.62, 1.0), st), 0, 0.5 + h * 0.31, 0));
  g.add(at(sm(new THREE.BoxGeometry(1.75, h * 0.3, 1.1), st), 0, 0.5 + h * 0.77, 0));
  g.add(at(sm(new THREE.BoxGeometry(1.95, 0.35, 1.2), st), 0, 0.5 + h * 0.95, 0));
  const dark = std('#3a3630', { roughness: 1 });
  for (const sx of [-1, 1]) { const ring = sm(new THREE.TorusGeometry(0.22, 0.08, 10, 20), st); ring.position.set(sx * 0.4, 0.5 + h * 0.8, 0.56); g.add(ring); g.add(at(sm(new THREE.CircleGeometry(0.15, 16), dark), sx * 0.4, 0.5 + h * 0.8, 0.555)); }
  g.add(at(box(0.9, 0.18, 0.1, '#3a3630'), 0, 0.5 + h * 0.68, 0.53));
  for (const x of [-0.3, -0.1, 0.1, 0.3]) g.add(at(sm(new THREE.ConeGeometry(0.06, 0.25, 4), st), x, 0.5 + h * 0.64, 0.56, Math.PI, 0, 0));
  for (const sx of [-1, 1]) g.add(at(sm(new THREE.BoxGeometry(0.35, h * 0.5, 0.4), st), sx * 0.85, 0.5 + h * 0.36, 0.25));
  return g;
}
// Iron fence along the avenue: square bars with spear tips between stone posts. len along x.
export function fence(len = 20, h = 1.5) {
  const g = new THREE.Group(), n = Math.round(len / 0.13), iron = std('#16171a', { metalness: 0.6, roughness: 0.45 });
  const bars = new THREE.InstancedMesh(new THREE.BoxGeometry(0.025, h, 0.025), iron, n), tips = new THREE.InstancedMesh(new THREE.ConeGeometry(0.03, 0.09, 4), iron, n), m = new THREE.Matrix4();
  for (let i = 0; i < n; i++) { const x = -len / 2 + (i + 0.5) * len / n; m.makeTranslation(x, h / 2, 0); bars.setMatrixAt(i, m); m.makeTranslation(x, h + 0.04, 0); tips.setMatrixAt(i, m); }
  bars.castShadow = tips.castShadow = true; g.add(bars, tips);
  for (const y of [0.18, h - 0.12]) g.add(at(box(len, 0.04, 0.04, iron), 0, y, 0));
  for (let x = -len / 2; x <= len / 2 + 0.01; x += 4) g.add(at(box(0.32, h + 0.3, 0.32, '#8a857a'), x, (h + 0.3) / 2, 0));
  g.add(at(box(len, 0.3, 0.4, '#8a857a'), 0, 0.15, 0));
  return g;
}
// Street lamp on Reforma dressed for Christmas: a star of little bulbs on the post. g.blink(t) twinkles the bulbs.
export function reformaLamp(h = 5.2, starCol = '#ffd27a', { light = true } = {}) {
  const g = new THREE.Group(), iron = std('#2a2c30', { metalness: 0.5, roughness: 0.5 });
  g.add(at(cyl(0.06, 0.1, h, iron, 10), 0, h / 2, 0));
  g.add(at(box(0.9, 0.05, 0.05, iron), 0.42, h - 0.08, 0));
  g.add(at(mesh(new THREE.BoxGeometry(0.4, 0.12, 0.2), iron), 0.85, h - 0.14, 0));
  g.add(at(mesh(new THREE.PlaneGeometry(0.34, 0.16), glowM('#ffd9a0', 3)), 0.85, h - 0.205, 0, Math.PI / 2, 0, 0));
  if (light) { const L = new THREE.SpotLight('#ffcf8f', 40, 11, 0.8, 0.6, 1.2); L.position.set(0.85, h - 0.25, 0); L.target.position.set(0.85, 0, 0); g.add(L, L.target); }
  else { const pool = new THREE.Mesh(new THREE.CircleGeometry(2.4, 24), new THREE.MeshBasicMaterial({ color: '#ffcf8f', transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false })); pool.rotation.x = -Math.PI / 2; pool.position.set(0.85, 0.03, 0); g.add(pool); }
  const bulbs = [], N = 30, bm = glowM(starCol, 2.4), bm2 = glowM('#ff5a4a', 2.2);
  for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, k = (i % 6) / 6, sp = Math.floor(i / 6) / 5 * Math.PI * 2, r = 0.55 * (1 - 0.55 * Math.abs(((i % 6) - 3) / 3));
    const b = mesh(new THREE.SphereGeometry(0.035, 6, 4), i % 3 ? bm : bm2); b.position.set(Math.sin(sp + k * 1.25) * r * 0.9, h * 0.62 + Math.cos(sp + k * 1.25) * r, 0.12); g.add(b); bulbs.push(b); }
  g.blink = t => { bm.emissiveIntensity = 2.0 + 0.7 * Math.sin(t * 3); bm2.emissiveIntensity = 2.0 + 0.7 * Math.sin(t * 3 + 2); };
  return g;
}
// Low museum façade facing +z: white marble band over dark glass, the long entrance canopy and the name in bronze.
export function facade(W = 34, H = 5.2) {
  const g = new THREE.Group();
  const marble = canvasTex(512, 256, (c, w, h) => { const r = rng(6); c.fillStyle = '#d9d4c8'; c.fillRect(0, 0, w, h); for (let i = 0; i < 9; i++) { c.strokeStyle = 'rgba(120,112,100,0.35)'; c.lineWidth = 1 + r() * 2; c.beginPath(); let x = r() * w, y = 0; c.moveTo(x, y); while (y < h) { x += (r() - 0.5) * 40; y += 20; c.lineTo(x, y); } c.stroke(); }
    c.strokeStyle = 'rgba(80,76,70,0.5)'; c.lineWidth = 3; for (let x = 0; x < w; x += 128) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke(); }, { repeat: [W / 3, 1] });
  g.add(at(sm(new THREE.BoxGeometry(W, H * 0.55, 1.2), std('#ffffff', { map: marble, roughness: 0.6 })), 0, H * 0.72, 0));
  const glass = std('#0e1620', { roughness: 0.15, metalness: 0.6 });
  g.add(at(sm(new THREE.BoxGeometry(W - 0.6, H * 0.45, 0.2), glass), 0, H * 0.225, -0.4));
  for (let x = -W / 2 + 1; x < W / 2; x += 2) g.add(at(box(0.06, H * 0.45, 0.08, '#2a2c30'), x, H * 0.225, -0.28));
  // warm lobby glow behind the glass
  const lob = new THREE.Mesh(new THREE.PlaneGeometry(W - 1, H * 0.4), basic('#3a2a18')); lob.position.set(0, H * 0.22, -0.52); g.add(lob);
  const can = sm(new THREE.BoxGeometry(12, 0.25, 6), std('#cfcabd', { roughness: 0.7 })); can.position.set(0, H * 0.48, 2.6); g.add(can);
  for (const x of [-5.6, 5.6]) g.add(at(cyl(0.12, 0.12, H * 0.48, '#9a968c', 10), x, H * 0.24, 5.3));
  const name = plane(16, 0.75, textTex('MUSEO NACIONAL DE ANTROPOLOGÍA', { w: 2048, h: 96, fg: '#c9a46a', font: '700 64px "Playfair Display"' }), { metalness: 0.5, roughness: 0.4 });
  name.position.set(0, H * 0.86, 0.61); g.add(name);
  return g;
}

// ------------------------------------------------------------ vehicles
// Volkswagen sedán ("vocho"): rounded dome body with painted windows, fenders with round headlamps, running boards,
// chrome bumpers. Faces +z, about 2.9 x 1.1 x 1.08. night: lamps glow and throw light. g.drive(t, speed) turns the wheels.
export function vocho(color = '#ddd6c4', { night = false } = {}) {
  const g = new THREE.Group(), b = new THREE.Group(); g.add(b);
  const paint = std(color, { roughness: 0.32, metalness: 0.18, envMap: studioEnv(), envMapIntensity: 0.5 });
  const half = (sx, sy, sz, x, y, z, m = paint, th = Math.PI / 2) => { const o = sm(new THREE.SphereGeometry(1, 40, 20, 0, Math.PI * 2, 0, th), m); o.scale.set(sx, sy, sz); o.position.set(x, y, z); b.add(o); return o; };
  // the cabin dome carries the windows painted on its UV map (u: longitude, front = 0.25; v: roof -> belt line)
  const win = canvasTex(1024, 512, (c, W, H) => { c.fillStyle = color; c.fillRect(0, 0, W, H);
    const glass = (u0, u1, v0, v1, r = 30) => { c.fillStyle = '#0d1218'; c.beginPath(); c.roundRect(u0 * W, v0 * H, (u1 - u0) * W, (v1 - v0) * H, r); c.fill(); c.fillStyle = 'rgba(160,190,220,0.2)'; c.fillRect(u0 * W + 12, v0 * H + 10, (u1 - u0) * W * 0.35, 8); };
    glass(0.17, 0.33, 0.16, 0.56, 60);
    for (const uc of [0.5, 0.0, 1.0]) { glass(uc - 0.13, uc - 0.015, 0.24, 0.66, 40); glass(uc + 0.01, uc + 0.1, 0.27, 0.64, 46); }
    glass(0.71, 0.79, 0.26, 0.5, 40);
    c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 3; for (const u of [0.36, 0.64, 0.86, 0.14]) { c.beginPath(); c.moveTo(u * W, 0.66 * H); c.lineTo(u * W, H); c.stroke(); } }, { srgb: true });
  half(0.52, 0.5, 0.82, 0, 0.56, -0.12, std('#ffffff', { map: win, roughness: 0.32, metalness: 0.18, envMap: studioEnv(), envMapIntensity: 0.5 }));
  half(0.5, 0.3, 0.8, 0, 0.5, 0.52);                     // hood sloping to the bumper
  half(0.5, 0.38, 0.72, 0, 0.5, -0.72);                  // engine lid
  b.add(at(sm(new THREE.BoxGeometry(0.98, 0.26, 2.55), paint), 0, 0.37, -0.05));
  for (const [x, z] of [[-0.52, 0.86], [0.52, 0.86], [-0.52, -0.9], [0.52, -0.9]]) half(0.2, 0.36, 0.5, x, 0.2, z);
  const chrome = std('#cfd3d8', { metalness: 0.85, roughness: 0.2, envMap: studioEnv() });
  for (const sx of [-1, 1]) {
    b.add(at(box(0.18, 0.04, 0.8, '#1a1a1c'), sx * 0.58, 0.2, -0.02));
    const hl = mesh(new THREE.CircleGeometry(0.08, 18), night ? glowM('#fff4d6', 3) : std('#e8eef2', { roughness: 0.1, metalness: 0.6 })); hl.position.set(sx * 0.52, 0.5, 1.205); hl.rotation.x = -0.35; b.add(hl);
    b.add(at(mesh(new THREE.TorusGeometry(0.084, 0.012, 6, 18), chrome), sx * 0.52, 0.5, 1.2, -0.35, 0, 0));
    const tl = mesh(new THREE.CapsuleGeometry(0.03, 0.06, 4, 8), glowM('#c41818', night ? 1.8 : 0.3)); tl.position.set(sx * 0.52, 0.45, -1.33); b.add(tl);
  }
  for (const z of [1.33, -1.38]) { b.add(at(sm(new THREE.BoxGeometry(1.14, 0.05, 0.05), chrome), 0, 0.27, z)); for (const sx of [-1, 1]) b.add(at(box(0.04, 0.12, 0.05, '#cfd3d8'), sx * 0.3, 0.32, z)); }
  b.add(at(box(0.16, 0.03, 0.1, '#cfd3d8'), 0, 0.79, 0.7));
  g.wheels = [];
  for (const z of [0.86, -0.9]) for (const x of [-0.53, 0.53]) { const w = wheel(0.21, 0.13); w.position.set(x, 0.21, z); g.add(w); g.wheels.push(w); }
  if (night) { for (const sx of [-1, 1]) { const L = new THREE.SpotLight('#fff0d0', 14, 16, 0.45, 0.6, 1.4); L.position.set(sx * 0.5, 0.5, 1.25); L.target.position.set(sx * 0.6, 0, 7); g.add(L, L.target); } }
  g.body = b; g.drive = (t, speed = 1) => { for (const w of g.wheels) w.rotation.x = t * speed * 5; b.position.y = 0.008 * Math.sin(t * 17) * Math.min(1, speed); };
  return g;
}
// Boxy 1980s sedan (white with blue stripes and a light bar for the 1989 police). g.blink(t, on).
export function sedan80(color = '#e8e8e4', { police = false, night = false } = {}) {
  const g = new THREE.Group(), b = new THREE.Group(), paint = std(color, { roughness: 0.4, metalness: 0.1 }); g.add(b);
  b.add(at(sm(new THREE.BoxGeometry(1.1, 0.34, 3.0), paint), 0, 0.38, 0));
  b.add(at(sm(new THREE.BoxGeometry(1.0, 0.3, 1.4), paint), 0, 0.7, -0.15));
  const glass = std('#121820', { roughness: 0.1, metalness: 0.5 });
  b.add(at(box(0.96, 0.24, 0.03, glass), 0, 0.7, 0.56, -0.5, 0, 0)); b.add(at(box(0.96, 0.22, 0.03, glass), 0, 0.7, -0.87, 0.5, 0, 0));
  for (const sx of [-1, 1]) b.add(at(box(0.02, 0.2, 1.2, glass), sx * 0.505, 0.72, -0.15));
  for (const sx of [-1, 1]) { const hl = box(0.22, 0.09, 0.03, '#e8e4d0'); if (night) hl.material = glowM('#fff2c8', 2.4); hl.position.set(sx * 0.36, 0.42, 1.51); b.add(hl); b.add(at(box(0.18, 0.08, 0.03, '#8a1010'), sx * 0.4, 0.44, -1.51)); }
  b.add(at(box(1.12, 0.06, 0.06, '#b8bcc0'), 0, 0.24, 1.52)); b.add(at(box(1.12, 0.06, 0.06, '#b8bcc0'), 0, 0.24, -1.52));
  g.wheels = []; for (const z of [0.95, -0.95]) for (const x of [-0.52, 0.52]) { const w = wheel(0.21, 0.15); w.position.set(x, 0.21, z); g.add(w); g.wheels.push(w); }
  g.blink = () => {};
  if (police) {
    for (const sx of [-1, 1]) { b.add(at(box(0.01, 0.1, 2.9, '#1f3a7a'), sx * 0.555, 0.42, 0));
      const p = plane(1.0, 0.18, textTex('POLICÍA', { w: 512, h: 96, fg: '#1f3a7a', font: '900 72px Inter' }), { transparent: true }); p.position.set(sx * 0.557, 0.56, 0.05); p.rotation.y = sx * Math.PI / 2; b.add(p); }
    const bar = new THREE.Group(); bar.position.set(0, 0.88, -0.1); b.add(bar); bar.add(at(box(0.8, 0.05, 0.18, '#222'), 0, 0, 0));
    const red = mesh(new THREE.BoxGeometry(0.34, 0.09, 0.17), glowM('#ff2a2a', 0.3)); red.position.x = -0.2; bar.add(red);
    const blue = mesh(new THREE.BoxGeometry(0.34, 0.09, 0.17), glowM('#2a5aff', 0.3)); blue.position.x = 0.2; bar.add(blue);
    const lr = new THREE.PointLight('#ff3030', 0, 7, 1.6), lb = new THREE.PointLight('#3050ff', 0, 7, 1.6); lr.position.set(-0.3, 1.2, 0); lb.position.set(0.3, 1.2, 0); g.add(lr, lb);
    g.blink = (t, on = 1) => { const a = (Math.sin(t * 13) > 0 ? 1 : 0) * on, c = (1 - a) * on; red.material.emissiveIntensity = 0.3 + 2.8 * a; blue.material.emissiveIntensity = 0.3 + 2.8 * c; lr.intensity = (night ? 6 : 2) * a; lb.intensity = (night ? 6 : 2) * c; };
  }
  g.body = b; g.drive = (t, speed = 1) => { for (const w of g.wheels) w.rotation.x = t * speed * 4.6; };
  return g;
}

// ------------------------------------------------------------ the heist kit
// Flashlight: a black torch whose beam is a spot light plus a faint additive cone (len). g.on(k).
export function flashlight({ len = 2.6, angle = 0.32, power = 9, color = '#fff2d6' } = {}) {
  const g = new THREE.Group();
  g.add(at(cyl(0.022, 0.018, 0.16, '#141416', 10), 0, 0, 0.0, Math.PI / 2, 0, 0)); g.add(at(cyl(0.03, 0.022, 0.04, '#1c1c1e', 10), 0, 0, 0.09, Math.PI / 2, 0, 0));
  const lens = mesh(new THREE.CircleGeometry(0.026, 14), glowM(color, 3)); lens.position.z = 0.111; g.add(lens);
  const L = new THREE.SpotLight(color, power, len * 2.2, angle, 0.45, 1.3); L.position.z = 0.1; L.target.position.set(0, 0, 3); g.add(L, L.target);
  const ct = canvasTex(64, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }, { srgb: false });
  const cone = new THREE.Mesh(new THREE.ConeGeometry(Math.tan(angle) * len, len, 24, 1, true), new THREE.MeshBasicMaterial({ map: ct, color, transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  cone.rotation.x = Math.PI / 2; cone.position.z = 0.1 + len / 2; cone.renderOrder = 6; g.add(cone);
  g.beam = L; g.cone = cone; g.on = k => { L.intensity = power * k; cone.material.opacity = 0.09 * k; lens.material.emissiveIntensity = 3 * k; };
  return dyn(g);
}
// Canvas suitcase (khaki with leather straps). g.open(k) swings the lid. Base at y = 0, handle up.
export function maleta(w = 0.46, h = 0.3, d = 0.17) {
  const g = new THREE.Group(), tex = canvasTex(256, 256, (c, W, H) => { const r = rng(4); c.fillStyle = '#7a7052'; c.fillRect(0, 0, W, H); for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,230'},0.06)`; c.fillRect(r() * W, r() * H, 2, 1); } });
  const can = std('#ffffff', { map: tex, roughness: 0.95 }), strap = std('#4a2e1a', { roughness: 0.6 });
  g.add(at(sm(new THREE.BoxGeometry(w, h * 0.55, d), can), 0, h * 0.275, 0));
  const lid = dyn(new THREE.Group()); lid.position.set(0, h * 0.55, -d / 2); g.add(lid);
  lid.add(at(sm(new THREE.BoxGeometry(w, h * 0.45, d), can), 0, h * 0.225, d / 2));
  for (const x of [-w * 0.3, w * 0.3]) { g.add(at(box(0.04, h * 0.56, d + 0.01, strap), x, h * 0.28, 0)); lid.add(at(box(0.04, h * 0.46, d + 0.01, strap), x, h * 0.23, d / 2)); }
  lid.add(at(mesh(new THREE.TorusGeometry(0.05, 0.012, 6, 12, Math.PI), strap), 0, h * 0.46, d / 2));
  g.open = k => { lid.rotation.x = -1.9 * Math.max(0, Math.min(1, k)); };
  return g;
}
// Sports duffel bag (navy with a white stripe), zip on top. Lying along x.
export function duffel(len = 0.62, r = 0.15, col = '#1d2a4a') {
  const g = new THREE.Group(), m = std(col, { roughness: 0.85 });
  const body = sm(new THREE.CapsuleGeometry(r, len - 2 * r, 6, 16), m); body.rotation.z = Math.PI / 2; body.scale.set(1, 1, 0.82); body.position.y = r * 0.85; g.add(body);
  const stripe = sm(new THREE.CylinderGeometry(r * 1.01, r * 1.01, 0.05, 16, 1, true), std('#e8e6e0')); stripe.rotation.z = Math.PI / 2; stripe.scale.set(1, 1, 0.82); stripe.position.set(len * 0.28, r * 0.85, 0); g.add(stripe);
  g.add(at(box(len * 0.75, 0.01, 0.02, '#c8c8c8'), 0, r * 1.68, 0));
  for (const x of [-0.1, 0.1]) g.add(at(mesh(new THREE.TorusGeometry(0.07, 0.012, 6, 14, Math.PI), std('#141416')), x, r * 1.65, 0));
  return g;
}
// A piece wrapped in toilet paper (white crumpled bundle); peel = 0..1 opens it to show gold underneath.
export function bundle(seed = 1, s = 0.07, peel = 0) {
  const g = new THREE.Group(), r = rng(seed);
  const geo = new THREE.IcosahedronGeometry(s, 2), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const k = 1 + (r() - 0.5) * 0.28; p.setXYZ(i, p.getX(i) * k * 1.3, p.getY(i) * k * 0.75, p.getZ(i) * k); }
  geo.computeVertexNormals();
  const paper = sm(geo, std('#f3f1ea', { roughness: 0.98, flatShading: true })); paper.position.y = s * 0.7; g.add(paper);
  if (peel > 0) { paper.scale.setScalar(1 - 0.5 * peel); paper.position.x = -s * 0.8 * peel; const gd = sm(new THREE.CylinderGeometry(s * 0.7, s * 0.7, s * 0.12, 20), goldM()); gd.position.set(s * 0.4 * peel, s * 0.12, 0); g.add(gd); }
  return g;
}

// ------------------------------------------------------------ the guards' Christmas
export function cookiesPlate() {
  const g = new THREE.Group(); g.add(at(cyl(0.13, 0.11, 0.015, '#efeae0', 24), 0, 0.008, 0)); const r = rng(3);
  for (let i = 0; i < 7; i++) { const a = r() * 6.28, d = r() * 0.07; g.add(at(cyl(0.032, 0.032, 0.012, ['#b07a3a', '#8a5a2a', '#c89a5a'][i % 3], 12), Math.cos(a) * d, 0.022 + (i > 4 ? 0.012 : 0), Math.sin(a) * d)); }
  return g;
}
// A drinking glass with a little liquor left (k = fill 0..1).
export function glassCup(k = 0.15, liquor = '#a85a1a') {
  const g = new THREE.Group();
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.026, 0.1, 14, 1, true), new THREE.MeshStandardMaterial({ color: '#dfeef6', transparent: true, opacity: 0.25, roughness: 0.05, depthWrite: false, side: THREE.DoubleSide })), 0, 0.05, 0));
  if (k > 0) g.add(at(mesh(new THREE.CylinderGeometry(0.027, 0.026, 0.1 * k, 14), std(liquor, { transparent: true, opacity: 0.75, roughness: 0.1 })), 0, 0.05 * k + 0.002, 0));
  return g;
}
export function bottle(col = '#3a1e0e', label = '#e8d8a8') {
  const g = new THREE.Group(), prof = [[0, 0], [0.045, 0], [0.047, 0.16], [0.03, 0.2], [0.016, 0.23], [0.016, 0.29], [0, 0.29]].map(([x, y]) => new THREE.Vector2(x, y));
  g.add(sm(new THREE.LatheGeometry(prof, 18), std(col, { roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.92 })));
  g.add(at(mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.07, 18, 1, true), std(label, { side: THREE.DoubleSide })), 0, 0.09, 0));
  return g;
}
// Portable radio (1980s, silver with a speaker grille and a glowing dial).
export function radio80() {
  const g = new THREE.Group(); g.add(at(box(0.34, 0.18, 0.09, '#b8bcc0'), 0, 0.09, 0));
  const gr = canvasTex(128, 64, (c, w, h) => { c.fillStyle = '#2a2c30'; c.fillRect(0, 0, w, h); c.fillStyle = '#5a5e64'; for (let y = 4; y < h; y += 6) for (let x = 4; x < w; x += 6) { c.beginPath(); c.arc(x, y, 1.6, 0, 7); c.fill(); } });
  for (const x of [-0.1, 0.1]) g.add(at(mesh(new THREE.CircleGeometry(0.055, 18), std('#ffffff', { map: gr })), x, 0.085, 0.046));
  g.add(at(mesh(new THREE.PlaneGeometry(0.12, 0.03), glowM('#ffb24a', 1.2)), 0, 0.15, 0.046));
  g.add(at(cyl(0.004, 0.004, 0.4, '#c8c8c8', 4), 0.12, 0.38, 0, 0, 0, -0.35)); g.add(at(box(0.24, 0.02, 0.02, '#2a2c30'), 0, 0.2, 0));
  return g;
}
// String of Christmas lights along a polyline of world points (multicoloured bulbs). g.blink(t).
export function xmasLights(points, n = 40) {
  const g = new THREE.Group(), curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.004, 4, false), std('#1a2a1a')));
  const cols = ['#ff3a3a', '#3aff6a', '#ffd23a', '#3a8aff', '#ff6ad2'], mats = cols.map(c => glowM(c, 2.2));
  for (let i = 0; i < n; i++) { const b = mesh(new THREE.SphereGeometry(0.016, 8, 6), mats[i % mats.length]); b.position.copy(curve.getPoint((i + 0.5) / n)); b.position.y -= 0.012; g.add(b); }
  g.blink = t => mats.forEach((m, i) => { m.emissiveIntensity = Math.sin(t * 2.2 + i * 1.3) > -0.2 ? 2.4 : 0.4; });
  return g;
}

// ------------------------------------------------------------ Satélite: the closet, the towers, the calendar
// Wardrobe with two sliding doors and a top compartment (the bag sits up there). g.slide(k) opens the right door,
// g.top(k) swings open the top doors. Faces +z, width w.
export function closet(w = 1.4, h = 2.1, d = 0.5) {
  const g = new THREE.Group(), wood = std('#6a4a30', { roughness: 0.6 }), dark = std('#2a1a10', { roughness: 0.9 });
  g.add(at(box(w, h, 0.03, '#2a1a10'), 0, h / 2, -d / 2));
  for (const sx of [-1, 1]) g.add(at(box(0.03, h, d, wood), sx * w / 2, h / 2, 0));
  for (const y of [0.02, h * 0.78, h]) g.add(at(box(w, 0.03, d, wood), 0, y, 0));
  g.add(at(mesh(new THREE.PlaneGeometry(w - 0.06, h * 0.76), dark), 0, h * 0.39 + 0.02, -d / 2 + 0.02));
  g.add(at(cyl(0.012, 0.012, w - 0.06, '#9a9a9a', 6), 0, h * 0.7, 0, 0, 0, Math.PI / 2));
  const r = rng(2); for (let i = 0; i < 6; i++) g.add(at(box(0.05, 0.6 + r() * 0.3, 0.32, ['#3a4a6a', '#7a3a3a', '#d8d2c4', '#4a5a3a'][i % 4]), -w / 2 + 0.2 + i * 0.16, h * 0.7 - 0.38, 0));
  const panel = canvasTex(256, 512, (c, W, H) => { c.fillStyle = '#8a6440'; c.fillRect(0, 0, W, H); const rr = rng(5); for (let i = 0; i < 60; i++) { c.strokeStyle = `rgba(60,36,18,${0.15 + rr() * 0.2})`; c.lineWidth = 1 + rr() * 2; c.beginPath(); let x = rr() * W; c.moveTo(x, 0); for (let y = 0; y <= H; y += 32) c.lineTo(x + Math.sin(y * 0.02 + i) * 6, y); c.stroke(); } c.strokeStyle = '#3a2412'; c.lineWidth = 8; c.strokeRect(4, 4, W - 8, H - 8); });
  const pm = std('#ffffff', { map: panel, roughness: 0.55 });
  const doors = [-1, 1].map(sx => { const dr = dyn(at(sm(new THREE.BoxGeometry(w / 2, h * 0.76, 0.03), pm), sx * w / 4, h * 0.39 + 0.02, d / 2 - (sx > 0 ? 0.02 : 0.05))); g.add(dr); return dr; });
  g.slide = k => { doors[1].position.x = w / 4 - (w / 2) * 0.95 * Math.max(0, Math.min(1, k)); };
  const tops = [-1, 1].map(sx => { const hg = dyn(new THREE.Group()); hg.position.set(sx * w / 2, h * 0.89, d / 2); g.add(hg); hg.add(at(sm(new THREE.BoxGeometry(w / 2, h * 0.2, 0.03), pm), -sx * w / 4, 0, 0)); return hg; });
  g.top = k => { k = Math.max(0, Math.min(1, k)); tops[0].rotation.y = -1.7 * k; tops[1].rotation.y = 1.7 * k; };
  g.shelfY = h * 0.78 + 0.015; g.dims = { w, h, d };
  return g;
}
// The five Torres de Satélite (triangular prisms in red, yellow, white, blue and ochre). Heights in units.
export function torres(scale = 1) {
  const g = new THREE.Group(), cols = ['#c8322a', '#e8b830', '#ebe6dc', '#3a6ab0', '#c87a2a'], hs = [37, 30, 52, 50, 40];
  hs.forEach((h, i) => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(3.2, 0); sh.lineTo(1.2, 4.2); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: h * 0.72, bevelEnabled: false }); geo.rotateX(-Math.PI / 2);
    const m = sm(geo, std(cols[i], { roughness: 0.8 })); m.position.set(-10 + i * 4.6, 0, (i % 2) * 3.4 - (i === 2 ? 2 : 0)); m.rotation.y = i * 0.6; g.add(m); });
  g.scale.setScalar(scale); return g;
}
// Wall calendar with a big year; g.set(year).
export function calendar(year = 1986) {
  const g = new THREE.Group(); let cur = null;
  const pic = (y) => canvasTex(256, 360, (c, W, H) => { c.fillStyle = '#f4efe2'; c.fillRect(0, 0, W, H); c.fillStyle = '#b8322a'; c.fillRect(0, 0, W, 120);
    c.fillStyle = '#ffffff'; c.font = '900 92px "Bebas Neue", Inter'; c.textAlign = 'center'; c.fillText(String(y), W / 2, 100);
    c.fillStyle = '#2a2622'; c.font = '700 22px Inter'; for (let r = 0; r < 5; r++) for (let k = 0; k < 7; k++) c.fillText(String(r * 7 + k + 1 <= 31 ? r * 7 + k + 1 : ''), 22 + k * 35, 160 + r * 40); });
  const texs = {}, p = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.59), std('#ffffff', { roughness: 0.9 })); g.add(p); dyn(p);
  g.add(at(box(0.06, 0.03, 0.02, '#8a8a8a'), 0, 0.3, 0.01));
  g.set = y => { if (y === cur) return; cur = y; p.material.map = texs[y] || (texs[y] = pic(y)); p.material.needsUpdate = true; };
  g.set(year); return g;
}

// ------------------------------------------------------------ the wiretap desk
// Reel-to-reel recorder: two reels that turn (g.spin(t)), VU meter glow, tape between the reels.
export function reelDeck() {
  const g = new THREE.Group(); g.add(at(box(0.5, 0.36, 0.14, '#3a3e44'), 0, 0.18, 0)); g.add(at(box(0.48, 0.34, 0.01, '#2a2c30'), 0, 0.18, 0.071));
  const rt = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#c8ccd0'; c.beginPath(); c.arc(64, 64, 62, 0, 7); c.fill(); c.fillStyle = '#5a3a20'; c.beginPath(); c.arc(64, 64, 46, 0, 7); c.fill(); c.fillStyle = '#c8ccd0'; for (let i = 0; i < 3; i++) { c.save(); c.translate(64, 64); c.rotate(i * 2.094); c.beginPath(); c.moveTo(-8, 10); c.lineTo(8, 10); c.lineTo(5, 44); c.lineTo(-5, 44); c.fill(); c.restore(); } c.fillStyle = '#2a2a2a'; c.beginPath(); c.arc(64, 64, 9, 0, 7); c.fill(); });
  const reels = [-0.12, 0.12].map(x => { const r = dyn(mesh(new THREE.CircleGeometry(0.1, 32), std('#ffffff', { map: rt, roughness: 0.4, metalness: 0.3, transparent: true }))); r.position.set(x, 0.24, 0.078); g.add(r); return r; });
  g.add(at(box(0.24, 0.004, 0.004, '#3a2414'), 0, 0.15, 0.08));
  g.add(at(mesh(new THREE.PlaneGeometry(0.1, 0.04), glowM('#ffcf6a', 1.2)), -0.1, 0.07, 0.077)); g.add(at(mesh(new THREE.PlaneGeometry(0.1, 0.04), glowM('#ffcf6a', 1.2)), 0.1, 0.07, 0.077));
  g.spin = t => { reels[0].rotation.z = -t * 3; reels[1].rotation.z = -t * 3.4; };
  return g;
}
// Headphones (worn by the agent listening): a band and two padded cups.
export function headphones(s = 1) {
  const g = new THREE.Group(); g.add(at(mesh(new THREE.TorusGeometry(0.2, 0.016, 6, 20, Math.PI), std('#1a1a1c')), 0, 0, 0));
  for (const sx of [-1, 1]) g.add(at(cyl(0.07, 0.07, 0.05, '#2a2a2e', 16), sx * 0.2, -0.02, 0, 0, 0, Math.PI / 2));
  g.scale.setScalar(s); return g;
}
// Cork board with photos, notes and red string (the case wall). draw(c, W, H) adds custom pins.
export function caseBoard(w = 2.0, h = 1.2, extra = null) {
  const t = canvasTex(1024, 614, (c, W, H) => { const r = rng(11); c.fillStyle = '#a07a4a'; c.fillRect(0, 0, W, H); for (let i = 0; i < 9000; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '60,40,20' : '200,160,110'},0.25)`; c.fillRect(r() * W, r() * H, 2, 2); }
    c.strokeStyle = '#5a3a20'; c.lineWidth = 18; c.strokeRect(0, 0, W, H);
    const pins = [];
    const card = (x, y, w2, h2, draw, rot = 0) => { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(-w2 / 2 + 6, -h2 / 2 + 8, w2, h2); c.fillStyle = '#f2ede2'; c.fillRect(-w2 / 2, -h2 / 2, w2, h2); draw(-w2 / 2, -h2 / 2, w2, h2); c.restore(); pins.push([x, y - h2 / 2 + 10]); };
    card(180, 170, 210, 160, (x, y, w2, h2) => { c.fillStyle = '#1d2a22'; c.fillRect(x + 10, y + 10, w2 - 20, h2 - 44); c.fillStyle = '#4f9a6a'; c.beginPath(); c.ellipse(x + w2 / 2, y + 66, 34, 46, 0, 0, 7); c.fill(); c.fillStyle = '#222'; c.font = '700 20px "Special Elite", monospace'; c.fillText('PAKAL', x + 14, y + h2 - 12); }, -0.05);
    card(520, 130, 230, 150, (x, y, w2, h2) => { c.fillStyle = '#2a2a2e'; c.fillRect(x + 10, y + 10, w2 - 20, h2 - 44); c.fillStyle = '#d8d0bc'; c.beginPath(); c.ellipse(x + w2 / 2, y + 66, 70, 30, 0, Math.PI, 0); c.fill(); c.fillRect(x + w2 / 2 - 80, y + 64, 160, 22); c.fillStyle = '#222'; c.font = '700 20px "Special Elite", monospace'; c.fillText('VW SEDÁN', x + 14, y + h2 - 12); }, 0.04);
    card(840, 200, 200, 230, (x, y, w2, h2) => { c.fillStyle = '#d9d4c8'; c.fillRect(x + 10, y + 10, w2 - 20, h2 - 44); c.fillStyle = '#3a3a3a'; c.beginPath(); c.arc(x + w2 / 2, y + 78, 38, 0, 7); c.fill(); c.fillRect(x + w2 / 2 - 50, y + 116, 100, 70); c.fillStyle = '#c0272d'; c.font = '900 60px Inter'; c.fillText('?', x + w2 / 2 - 16, y + 100); c.fillStyle = '#222'; c.font = '700 20px "Special Elite", monospace'; c.fillText('"EL CABO"', x + 14, y + h2 - 12); }, -0.03);
    card(330, 430, 260, 150, (x, y, w2, h2) => { c.fillStyle = '#222'; c.font = '700 24px "Special Elite", monospace'; ['124 PIEZAS', 'SALA MAYA', 'SALA OAXACA', 'SALA MEXICA'].forEach((s, i) => c.fillText(s, x + 16, y + 34 + i * 30)); }, 0.03);
    card(700, 470, 230, 130, (x, y, w2, h2) => { c.fillStyle = '#222'; c.font = '700 22px "Special Elite", monospace'; ['ACAPULCO', 'GUADALAJARA', 'SATÉLITE'].forEach((s, i) => c.fillText(s, x + 16, y + 34 + i * 30)); }, -0.04);
    if (extra) extra(c, W, H, card);
    c.strokeStyle = '#d0201c'; c.lineWidth = 4; c.beginPath(); const order = [0, 1, 2, 4, 3, 0]; order.forEach((k, i) => { const [x, y] = pins[k]; if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke();
    for (const [x, y] of pins) { c.fillStyle = '#c0272d'; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.arc(x - 3, y - 3, 3, 0, 7); c.fill(); } });
  const g = new THREE.Group(); g.add(at(sm(new THREE.BoxGeometry(w, h, 0.04), std('#ffffff', { map: t, roughness: 0.9 })), 0, 0, 0));
  return g;
}

// ------------------------------------------------------------ Acapulco at night
// Hotel tower with lit windows (some rooms dark), seen across the bay.
export function hotelTower(w = 3, h = 14, seed = 1) {
  const r = rng(seed), t = canvasTex(128, 512, (c, W, H) => { c.fillStyle = '#1a1c24'; c.fillRect(0, 0, W, H); for (let y = 8; y < H; y += 16) for (let x = 6; x < W; x += 16) { const on = r() < 0.55; c.fillStyle = on ? (r() < 0.2 ? '#ffd9a0' : '#ffbf70') : '#22252e'; c.fillRect(x, y, 10, 8); } });
  const m = new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: '#ffffff', emissiveIntensity: 0.9, roughness: 0.8 });
  const g = new THREE.Group(); g.add(at(new THREE.Mesh(new THREE.BoxGeometry(w, h, w * 0.6), m), 0, h / 2, 0)); return g;
}
// Neon sign: glowing text in a dark frame. g.flicker(t).
export function neonSign(text = 'DISCO', col = '#ff3ab0', w = 2.4, h = 0.7) {
  const t = canvasTex(1024, 300, (c, W, H) => { c.fillStyle = '#0a0a0e'; c.fillRect(0, 0, W, H); c.shadowColor = col; c.shadowBlur = 40; c.strokeStyle = col; c.lineWidth = 12; c.font = '400 220px "Bebas Neue", Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.strokeText(text, W / 2, H / 2 + 10); c.shadowBlur = 0; c.strokeStyle = '#ffe8f6'; c.lineWidth = 4; c.strokeText(text, W / 2, H / 2 + 10); });
  const m = new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: '#ffffff', emissiveIntensity: 1.6, roughness: 0.6 });
  const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.PlaneGeometry(w, h), m));
  const L = new THREE.PointLight(col, 4, 6, 1.6); L.position.z = 0.6; g.add(L);
  g.flicker = (tt, off = null) => { const k = off != null ? off / 10 : Math.sin(tt * 23) > 0.93 ? 0.35 : 1; m.emissiveIntensity = 1.6 * k; L.intensity = 4 * k; };
  return g;
}
// Security camera on a wall bracket with a blinking red light (g.blink(t)); looks along +z.
export function cctvCam() {
  const g = new THREE.Group(); g.add(at(box(0.06, 0.06, 0.25, '#2a2c30'), 0, 0, -0.12));
  const head = new THREE.Group(); head.position.z = 0.0; g.add(head);
  head.add(at(box(0.14, 0.12, 0.3, '#e8e8e4'), 0, -0.06, 0.08)); head.add(at(cyl(0.04, 0.04, 0.03, '#0a0a0c', 14), 0, -0.06, 0.24, Math.PI / 2, 0, 0));
  const led = mesh(new THREE.SphereGeometry(0.012, 8, 6), glowM('#ff2a2a', 2)); led.position.set(0.05, -0.02, 0.235); head.add(led);
  g.blink = t => { led.material.emissiveIntensity = Math.floor(t * 1.5) % 2 ? 0.2 : 2.5; head.rotation.y = 0.5 * Math.sin(t * 0.4); };
  g.userData.dynamic = true; return g;
}
