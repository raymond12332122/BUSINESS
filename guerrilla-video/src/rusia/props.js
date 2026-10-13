// Props for the Russian Revolution video: the Winter Palace (red, as in 1905-1917), Petrograd buildings, the imperial
// train, Lenin's armoured car, the cruiser Aurora, trenches, banners in Cyrillic, the Red Square of 1924 and Coyoacán.
import * as THREE from 'three';
import * as LP from '../lib/props.js';
import * as MX from '../mx/props.js';
import * as NP from '../napo/props.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const { rng } = LP;
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o });
const flat = c => LP.mat(c);
function mesh(geo, m) { const o = new THREE.Mesh(geo, m.isMaterial ? m : flat(m)); o.castShadow = true; o.receiveShadow = true; return o; }
const box = (w, h, d, c) => mesh(new THREE.BoxGeometry(w, h, d), c);
const cyl = (r0, r1, h, c, s = 12) => mesh(new THREE.CylinderGeometry(r0, r1, h, s), c);
function at(o, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; }
export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const plane = (w, h, tex, shadow = true) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, transparent: true, side: THREE.DoubleSide })); m.castShadow = shadow; return m; };
const glassC = '#2b3644', frameC = '#d9cbb8';

// ------------------------------------------------------------ the Winter Palace (painted iron-red under Nicholas II)
export function winterPalace({ len = 60, h = 12, wall = '#8f3e30', trim = '#a85a48', lit = false } = {}) {
  const g = new THREE.Group(), d = 8;
  g.add(at(box(len, h, d, wall), 0, h / 2, 0));
  g.add(at(box(len + 0.4, 0.5, d + 0.4, trim), 0, 4.1, 0));                  // ground-floor cornice
  g.add(at(box(len + 0.8, 0.6, d + 0.8, trim), 0, h, 0));                    // main cornice
  for (let i = 0; i < 3; i++) g.add(at(box(len + 0.1, 0.12, d + 0.1, '#7a3226'), 0, 0.8 + i * 1.1, 0)); // rustication
  const win = (x, y, w, hh, arch) => {
    const gw = new THREE.Group();
    gw.add(at(box(w + 0.3, hh + 0.3, 0.12, frameC), 0, 0, 0)); const pane = new THREE.Mesh(new THREE.BoxGeometry(w, hh, 0.14), std(lit ? '#ffd28a' : glassC, lit ? { emissive: '#ffb860', emissiveIntensity: 0.9 } : { roughness: 0.3, metalness: 0.2 }));
    gw.add(pane); if (arch) gw.add(at(mesh(new THREE.CylinderGeometry(w / 2 + 0.15, w / 2 + 0.15, 0.12, 16, 1, false, -Math.PI / 2, Math.PI), frameC), 0, hh / 2, 0, Math.PI / 2, 0, 0));
    gw.position.set(x, y, d / 2 + 0.02); g.add(gw);
  };
  const step = 2.4;
  for (let x = -len / 2 + 1.6; x < len / 2 - 1; x += step) {
    if (Math.abs(x) < 6.2) continue;
    win(x, 2.2, 0.9, 1.6, true); win(x, 6.3, 0.95, 2.1, false); win(x, 9.9, 0.85, 1.4, false);
    for (const k of [-0.75, 0.75]) g.add(at(cyl(0.17, 0.19, h - 4.6, trim, 10), x + k, 4.35 + (h - 4.6) / 2, d / 2 + 0.25));  // paired columns
  }
  // central projection with the three gateways
  const C = new THREE.Group(); C.position.z = 0.7; g.add(C);
  C.add(at(box(12, h + 1.4, d + 0.6, wall), 0, (h + 1.4) / 2, 0)); C.add(at(box(12.6, 0.7, d + 1.2, trim), 0, h + 1.4, 0));
  for (const x of [-3.4, 0, 3.4]) {
    C.add(at(box(2.4, 3.6, 0.2, '#1a1612'), x, 1.8, d / 2 + 0.31));
    C.add(at(mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.2, 18, 1, false, -Math.PI / 2, Math.PI), '#1a1612'), x, 3.6, d / 2 + 0.31, Math.PI / 2, 0, 0));
    for (let i = 0; i < 7; i++) C.add(at(box(0.05, 3.4, 0.05, '#2b2b2b'), x - 1.0 + i * 0.33, 1.7, d / 2 + 0.45)); // iron gates
    C.add(at(box(2.5, 0.08, 0.06, '#c9a227'), x, 3.0, d / 2 + 0.46));
  }
  for (let x = -5.2; x <= 5.2; x += 1.3) C.add(at(cyl(0.2, 0.22, h - 3.6, trim, 10), x, 4.4 + (h - 3.6) / 2 - 0.3, d / 2 + 0.55));
  // roof statues / urns
  for (let x = -len / 2 + 1; x < len / 2; x += 2.4) { g.add(at(cyl(0.12, 0.16, 0.5, '#5a4636', 8), x, h + 0.55, d / 2 + 0.2)); g.add(at(mesh(new THREE.SphereGeometry(0.16, 8, 6), '#5a4636'), x, h + 0.9, d / 2 + 0.2)); }
  g.add(at(box(len, 2.2, d - 1, '#4a5058'), 0, h + 1.1, -0.4));            // roof
  return g;
}
// The Alexander Column with its angel.
export function alexanderColumn(H = 22) {
  const g = new THREE.Group(), granite = '#8a4a40';
  g.add(at(box(3.4, 0.6, 3.4, '#6a5a50'), 0, 0.3, 0)); g.add(at(box(2.8, 3.0, 2.8, granite), 0, 2.1, 0)); g.add(at(box(3.0, 0.3, 3.0, '#6a5a50'), 0, 3.75, 0));
  g.add(at(cyl(0.85, 1.0, H, granite, 24), 0, 3.9 + H / 2, 0));
  g.add(at(box(2.0, 0.6, 2.0, '#3a3430'), 0, 4.2 + H, 0)); g.add(at(cyl(0.6, 0.7, 1.2, '#3a3430', 16), 0, 5.0 + H, 0));
  const angel = new THREE.Group(); angel.position.y = 5.6 + H; g.add(angel);
  angel.add(at(mesh(new THREE.ConeGeometry(0.45, 1.6, 10), '#3d3a36'), 0, 0.8, 0)); angel.add(at(mesh(new THREE.SphereGeometry(0.25, 10, 8), '#3d3a36'), 0, 1.85, 0));
  for (const s of [-1, 1]) { const w = mesh(new THREE.ConeGeometry(0.35, 1.3, 4), '#3d3a36'); w.position.set(s * 0.45, 1.5, -0.2); w.rotation.set(0.2, 0, s * 0.5); w.scale.set(1, 1, 0.25); angel.add(w); }
  angel.add(at(box(0.08, 1.9, 0.08, '#3d3a36'), 0.45, 1.6, 0.1)); angel.add(at(box(0.6, 0.08, 0.08, '#3d3a36'), 0.45, 2.2, 0.1));
  return g;
}
// Four-storey Petrograd tenement / neoclassical block.
export function petroBuilding(w = 8, h = 9, color = '#d9b46a', seed = 0, { lit = 0 } = {}) {
  const g = new THREE.Group(), r = rng(seed + 11), d = 6;
  g.add(at(box(w, h, d, color), 0, h / 2, 0));
  const trim = new THREE.Color(color).offsetHSL(0, -0.05, 0.12).getStyle();
  g.add(at(box(w + 0.3, 0.35, d + 0.3, trim), 0, h, 0)); g.add(at(box(w + 0.15, 0.2, d + 0.15, trim), 0, 3.2, 0));
  const floors = Math.max(2, Math.round(h / 2.2) - 1), cols = Math.max(2, Math.round(w / 1.7));
  for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
    const x = -w / 2 + (c + 0.5) * w / cols, y = 1.6 + f * 2.2; if (f === 0 && c === Math.floor(cols / 2)) { g.add(at(box(1.0, 2.0, 0.1, '#3a2a20'), x, 1.0, d / 2 + 0.03)); continue; }
    const on = lit && r() < lit;
    g.add(at(box(0.85, 1.25, 0.08, frameC), x, y, d / 2 + 0.02));
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.66, 1.05, 0.1), std(on ? '#ffd690' : glassC, on ? { emissive: '#ffbe66', emissiveIntensity: 1.0 } : { roughness: 0.35 }));
    p.position.set(x, y, d / 2 + 0.03); g.add(p);
    if (f > 0) g.add(at(box(0.95, 0.12, 0.2, trim), x, y + 0.75, d / 2 + 0.08));
  }
  g.add(at(box(w, 0.9, d, '#5a5f66'), 0, h + 0.45, 0));
  return g;
}
// Cloth banner on two poles, Cyrillic slogan.
export function banner(text, { w = 3.2, h = 0.7, bg = '#b8241e', fg = '#f6efe0', poles = true, poleH = 2.6 } = {}) {
  const g = new THREE.Group();
  const tex = canvasTex(1024, 224, (x, W, H) => { x.fillStyle = bg; x.fillRect(0, 0, W, H); x.fillStyle = fg; let fs = 130; x.font = `900 ${fs}px Inter`; while (x.measureText(text).width > W - 60 && fs > 30) { fs -= 6; x.font = `900 ${fs}px Inter`; } x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, W / 2, H / 2 + 6); });
  const cloth = plane(w, h, tex); cloth.position.y = poleH - h / 2 - 0.05; g.add(cloth); g.cloth = cloth;
  if (poles) for (const s of [-1, 1]) g.add(at(cyl(0.025, 0.025, poleH, '#6a4a2f', 6), s * (w / 2 + 0.03), poleH / 2, 0));
  const base = cloth.geometry.attributes.position.array.slice();
  g.wave = (t, amp = 0.06) => { const p = cloth.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = base[i * 3], y = base[i * 3 + 1]; p.setZ(i, amp * Math.sin(x * 2.6 + t * 3.1) * (0.6 + 0.4 * Math.cos(y * 3))); } p.needsUpdate = true; };
  return g;
}
// Red flag on a pole (waves).
export function redFlag(poleH = 2.6, w = 1.1, h = 0.7, color = '#c0272d') {
  const g = new THREE.Group(); g.add(at(cyl(0.025, 0.025, poleH, '#6a4a2f', 6), 0, poleH / 2, 0));
  const geo = new THREE.PlaneGeometry(w, h, 12, 4); geo.translate(w / 2, 0, 0);
  const cloth = new THREE.Mesh(geo, std(color, { side: THREE.DoubleSide, roughness: 0.7 })); cloth.position.y = poleH - h / 2; cloth.castShadow = true; g.add(cloth);
  const base = geo.attributes.position.array.slice();
  g.wave = (t, amp = 0.09) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = base[i * 3]; p.setZ(i, amp * (x / w) * Math.sin(x * 4 - t * 4.2)); p.setY(i, base[i * 3 + 1] - 0.04 * (x / w)); } p.needsUpdate = true; geo.computeVertexNormals(); };
  return g;
}
// Icon carried in the 1905 procession (Gapon's marchers carried icons and portraits of the tsar).
export function icon(seed = 0) {
  const g = new THREE.Group();
  const tex = canvasTex(128, 160, (x, W, H) => { x.fillStyle = '#c9a227'; x.fillRect(0, 0, W, H); x.fillStyle = '#7a1f1f'; x.fillRect(10, 10, W - 20, H - 20); x.fillStyle = '#e9c98a'; x.beginPath(); x.arc(W / 2, 62, 22, 0, 7); x.fill(); x.fillStyle = '#d4af37'; x.beginPath(); x.arc(W / 2, 62, 34, 0, 7); x.lineWidth = 6; x.strokeStyle = '#f2d36a'; x.stroke(); x.fillStyle = '#3a2a5a'; x.fillRect(W / 2 - 26, 92, 52, 50); });
  const p = plane(0.42, 0.52, tex); p.position.y = 2.2; g.add(p); g.add(at(cyl(0.02, 0.02, 2.2, '#6a4a2f', 6), 0, 1.1, -0.02));
  return g;
}
// Gas street lamp (St Petersburg style).
export function gasLamp(lit = false, h = 3.4) {
  const g = new THREE.Group(); g.add(at(cyl(0.06, 0.09, h, '#2a2c2e', 8), 0, h / 2, 0));
  g.add(at(mesh(new THREE.CylinderGeometry(0.2, 0.12, 0.4, 6), std(lit ? '#ffe2a0' : '#d8d4c8', lit ? { emissive: '#ffcc70', emissiveIntensity: 1.4 } : {})), 0, h + 0.2, 0));
  g.add(at(mesh(new THREE.ConeGeometry(0.26, 0.2, 6), '#2a2c2e'), 0, h + 0.5, 0));
  if (lit) { const l = new THREE.PointLight('#ffc878', 6, 9, 1.6); l.position.set(0, h + 0.1, 0); g.add(l); }
  return g;
}

// ------------------------------------------------------------ trains, cars, ships
// Austin armoured car (Lenin spoke from one at the Finland Station).
export function armouredCar(color = '#4b5038') {
  const g = new THREE.Group();
  g.add(at(box(1.3, 0.9, 3.0, color), 0, 0.95, 0)); g.add(at(box(1.2, 0.5, 1.0, color), 0, 0.85, 1.75)); // body + bonnet
  for (const s of [-1, 1]) { const tr = new THREE.Group(); tr.position.set(s * 0.35, 1.55, -0.6); g.add(tr);
    tr.add(cyl(0.34, 0.36, 0.42, color, 14)); tr.add(at(cyl(0.035, 0.04, 0.7, '#222', 8), 0, 0, 0.5, Math.PI / 2, 0, 0)); }
  for (const [x, z] of [[-0.62, 1.4], [0.62, 1.4], [-0.62, -1.0], [0.62, -1.0]]) { g.add(at(cyl(0.36, 0.36, 0.16, '#1e1e1e', 16), x, 0.36, z, 0, 0, Math.PI / 2)); g.add(at(cyl(0.16, 0.16, 0.18, '#6a6a5e', 10), x, 0.36, z, 0, 0, Math.PI / 2)); }
  g.add(at(box(1.0, 0.06, 0.2, '#1a1a1a'), 0, 1.1, 2.26)); // radiator slit
  g.top = 1.4; return g;
}
// Cruiser Aurora: dark hull, three tall funnels, two masts.
export function aurora() {
  const g = new THREE.Group();
  const H = new THREE.Shape(); H.moveTo(-1.4, -7); H.lineTo(1.4, -7); H.lineTo(1.5, 5); H.quadraticCurveTo(1.2, 7.6, 0, 8.6); H.quadraticCurveTo(-1.2, 7.6, -1.5, 5); H.closePath();
  const hg = new THREE.ExtrudeGeometry(H, { depth: 1.9, bevelEnabled: false }); hg.rotateX(Math.PI / 2); hg.translate(0, 1.9, 0);
  g.add(mesh(hg, std('#2a2d30', { roughness: 0.6 }))); g.add(at(box(2.9, 0.18, 15.4, '#7a2a22'), 0, 0.1, 0.6));
  g.add(at(box(2.4, 0.9, 7.5, '#8a9096'), 0, 2.35, -0.4)); g.add(at(box(1.4, 0.9, 1.6, '#8a9096'), 0, 3.2, 3.2));
  for (let i = 0; i < 3; i++) { const z = -2.6 + i * 1.9; g.add(at(cyl(0.38, 0.38, 3.4, '#1e2022', 14), 0, 4.4, z)); g.add(at(cyl(0.4, 0.4, 0.3, '#c9b37a', 14), 0, 5.6, z)); }
  for (const z of [5.2, -5.6]) g.add(at(cyl(0.07, 0.07, 9, '#3a3a3a', 6), 0, 6.2, z));
  for (const z of [6.4, -6.3]) { const tur = new THREE.Group(); tur.position.set(0, 2.1, z); g.add(tur); tur.add(cyl(0.5, 0.55, 0.45, '#5f666c', 12)); tur.add(at(cyl(0.06, 0.07, 1.6, '#3a3f44', 8), 0, 0.05, z > 0 ? 0.85 : -0.85, Math.PI / 2, 0, 0)); }
  g.bow = new THREE.Vector3(0, 2.2, 7.4); g.funnelTops = [0, 1, 2].map(i => new THREE.Vector3(0, 6.1, -2.6 + i * 1.9));
  return g;
}
// Armoured train wagon (civil war) with a turret, red star and slogan.
export function armouredWagon(text = 'ВСЯ ВЛАСТЬ СОВЕТАМ', color = '#3f4a36') {
  const g = new THREE.Group();
  g.add(at(box(1.3, 1.2, 3.4, color), 0, 1.0, 0)); g.add(at(box(1.0, 0.25, 3.2, '#1e1e1e'), 0, 0.3, 0));
  for (const z of [1.1, -1.1]) for (const x of [-0.45, 0.45]) g.add(at(cyl(0.22, 0.22, 0.07, '#1e1e1e', 12), x, 0.22, z, 0, 0, Math.PI / 2));
  const tr = new THREE.Group(); tr.position.set(0, 1.85, 0.6); g.add(tr); tr.add(cyl(0.42, 0.46, 0.5, color, 14)); tr.add(at(cyl(0.06, 0.07, 1.1, '#222', 8), 0, 0.05, 0.75, Math.PI / 2, 0, 0));
  const tex = canvasTex(1024, 128, (x, W, H) => { x.fillStyle = color; x.fillRect(0, 0, W, H); x.fillStyle = '#e6d9b0'; let fs = 74; x.font = `900 ${fs}px Inter`; while (x.measureText(text).width > W - 40) { fs -= 4; x.font = `900 ${fs}px Inter`; } x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, W / 2, H / 2 + 3); });
  for (const s of [-1, 1]) { const p = plane(3.0, 0.38, tex); p.position.set(s * 0.66, 1.0, 0); p.rotation.y = s * Math.PI / 2; g.add(p); }
  const st = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, rr = i % 2 ? 0.1 : 0.24; const x = Math.sin(a) * rr, y = Math.cos(a) * rr; i ? st.lineTo(x, y) : st.moveTo(x, y); }
  for (const s of [-1, 1]) { const m = mesh(new THREE.ShapeGeometry(st), std('#c0272d', { side: THREE.DoubleSide })); m.position.set(s * 0.67, 1.45, -1.25); m.rotation.y = s * Math.PI / 2; g.add(m); }
  return g;
}

// ------------------------------------------------------------ war
// A stretch of trench: earth walls with plank revetment, sandbags and snow on the parapet.
export function trench(len = 16, { snow = true } = {}) {
  const g = new THREE.Group(), earth = '#5a4a3a';
  for (const z of [-1.0, 1.0]) { g.add(at(box(len, 1.2, 0.8, earth), 0, 0.6, z * 1.2)); if (snow) g.add(at(box(len, 0.08, 0.85, '#e6ebf0'), 0, 1.22, z * 1.2)); }
  g.add(at(box(len, 0.02, 1.6, '#4a3c2e'), 0, 0.01, 0));
  for (let x = -len / 2 + 0.4; x < len / 2; x += 0.5) g.add(at(box(0.42, 0.04, 0.6, '#6b5238'), x, 0.04, 0));        // duckboards
  for (let x = -len / 2; x < len / 2; x += 1.2) g.add(at(box(0.08, 1.15, 0.08, '#5a4632'), x, 0.58, -0.79));          // posts
  for (let i = 0; i < 4; i++) g.add(at(box(len, 0.22, 0.04, '#5e4a36'), 0, 0.2 + i * 0.27, -0.78));                   // planks
  const sb = MX.sandbags(Math.round(len / 0.34), 2); sb.position.set(0, 1.2, -1.2); g.add(sb);
  return g;
}
// Maxim machine gun on its wheeled Sokolov mount.
export function maxim() {
  const g = new THREE.Group(); g.add(at(box(0.18, 0.2, 0.8, '#3a4234'), 0, 0.42, 0)); g.add(at(cyl(0.07, 0.07, 0.6, '#2a2e26', 10), 0, 0.42, 0.65, Math.PI / 2, 0, 0));
  g.add(at(box(0.5, 0.3, 0.04, '#3a4234'), 0, 0.62, -0.05)); for (const s of [-1, 1]) g.add(at(cyl(0.18, 0.18, 0.05, '#2a2a2a', 12), s * 0.28, 0.18, -0.2, 0, 0, Math.PI / 2));
  return g;
}

// ------------------------------------------------------------ interiors and buildings
export function iconCorner() { // a "beautiful corner" of icons with a red lamp
  const g = new THREE.Group();
  for (const [x, y, s] of [[0, 2.2, 1], [-0.45, 2.0, 0.7], [0.45, 2.0, 0.7]]) { const i = icon(x * 10 | 0); i.children[1].visible = false; i.position.set(x, y - 2.2, 0); i.scale.setScalar(s); g.add(i); }
  const lamp = mesh(new THREE.SphereGeometry(0.06, 10, 8), std('#ff5a3a', { emissive: '#ff3a1a', emissiveIntensity: 1.6 })); lamp.position.set(0, 1.62, 0.12); g.add(lamp);
  return g;
}
export function samovar(k = 0.6) { const g = new THREE.Group(); g.add(at(cyl(0.12, 0.16, 0.3, '#c9a227', 12), 0, 0.2, 0)); g.add(at(cyl(0.05, 0.1, 0.12, '#c9a227', 10), 0, 0.42, 0)); g.add(at(cyl(0.12, 0.08, 0.06, '#3a2a1e', 10), 0, 0.03, 0)); g.scale.setScalar(k); return g; }
// Ipatiev House (Yekaterinburg): two-storey stone house behind a tall plank palisade.
export function ipatievHouse() {
  const g = new THREE.Group();
  g.add(at(box(9, 3.0, 7, '#ece4d2'), 0, 1.5, 0)); g.add(at(box(9, 3.0, 7, '#f2ebdb'), 0, 4.5, 0));
  g.add(at(box(9.4, 0.25, 7.4, '#cfc4ae'), 0, 3.05, 0)); g.add(at(box(9.4, 0.3, 7.4, '#cfc4ae'), 0, 6.1, 0));
  const roof = new THREE.Shape(); roof.moveTo(-3.9, 0); roof.lineTo(0, 1.8); roof.lineTo(3.9, 0); roof.closePath();
  const rg = new THREE.ExtrudeGeometry(roof, { depth: 9.6, bevelEnabled: false }); rg.translate(0, 0, -4.8);
  const rm = mesh(rg, '#4a5a4a'); rm.rotation.y = Math.PI / 2; rm.position.y = 6.25; g.add(rm);
  for (let i = 0; i < 6; i++) for (const y of [1.6, 4.6]) { const x = -3.6 + i * 1.45; g.add(at(box(0.8, 1.3, 0.1, frameC), x, y, 3.52)); g.add(at(box(0.6, 1.1, 0.12, y < 2 ? '#1a1c20' : glassC), x, y, 3.53)); }
  for (let x = -6; x <= 6; x += 0.32) g.add(at(box(0.28, 4.2, 0.08, '#7a5c3c'), x, 2.1, 5.2));           // palisade
  for (const y of [0.9, 3.4]) g.add(at(box(12.2, 0.12, 0.08, '#5a4632'), 0, y, 5.13));
  return g;
}
// Tauride Palace hall (Constituent Assembly): white colonnade + rows of benches + presidium table.
export function hallColumns(n = 8, { gap = 2.4, h = 5.5, x = 0 } = {}) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) { const z = -i * gap; g.add(at(cyl(0.3, 0.34, h, '#f2eee4', 16), x, h / 2, z)); g.add(at(box(0.8, 0.3, 0.8, '#e6e0d2'), x, h, z)); g.add(at(box(0.8, 0.3, 0.8, '#e6e0d2'), x, 0.15, z)); }
  return g;
}
// Red Square in January 1924: Kremlin wall, Spasskaya tower (still with the eagle), St Basil's and the wooden mausoleum.
export function spasskaya() {
  const g = new THREE.Group(), brick = '#9a3b2c';
  g.add(at(box(4, 14, 4, brick), 0, 7, 0)); g.add(at(box(3.2, 4, 3.2, brick), 0, 16, 0)); g.add(at(box(2.6, 3, 2.6, '#f0ebe0'), 0, 19.5, 0));
  const tex = canvasTex(128, 128, (x, W, H) => { x.fillStyle = '#121212'; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); x.strokeStyle = '#d4af37'; x.lineWidth = 6; x.stroke(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; x.fillStyle = '#d4af37'; x.fillRect(64 + Math.sin(a) * 48 - 3, 64 - Math.cos(a) * 48 - 3, 6, 6); } x.strokeStyle = '#d4af37'; x.lineWidth = 5; x.beginPath(); x.moveTo(64, 64); x.lineTo(64, 26); x.moveTo(64, 64); x.lineTo(92, 70); x.stroke(); });
  for (const s of [0, 1, 2, 3]) { const p = plane(2.2, 2.2, tex); const a = s * Math.PI / 2; p.position.set(Math.sin(a) * 1.62, 16, Math.cos(a) * 1.62); p.rotation.y = a; g.add(p); }
  const t = mesh(new THREE.ConeGeometry(1.9, 6, 8), std('#2f5a3a', { flatShading: true })); t.position.y = 24; g.add(t);
  g.add(at(box(0.08, 1.2, 0.08, '#d4af37'), 0, 27.6, 0)); g.add(at(mesh(new THREE.SphereGeometry(0.4, 10, 8), std('#d4af37', { metalness: 0.6, roughness: 0.3 })), 0, 28.3, 0));
  return g;
}
export function stBasil() {
  const g = new THREE.Group();
  g.add(at(box(9, 4, 9, '#b84a3a'), 0, 2, 0));
  const D = [[0, 0, { r: 1.2, color: '#d4af37', h: 9 }], [-2.8, -2.8, { r: 1.0, color: '#2a6ab8', h: 6, stripes: ['#2a6ab8', '#f3eee2'] }], [2.8, -2.8, { r: 1.0, color: '#c0272d', h: 6.5, stripes: ['#c0272d', '#2f7a4a'] }],
    [-2.8, 2.8, { r: 1.0, color: '#e8b84a', h: 6, stripes: ['#e8b84a', '#2f7a4a'] }], [2.8, 2.8, { r: 1.0, color: '#2f7a4a', h: 6.2, stripes: ['#2f7a4a', '#e8b84a'] }]];
  for (const [x, z, o] of D) { const d = NP.onion(o); d.position.set(x, 3.5, z); g.add(d); }
  const spire = mesh(new THREE.ConeGeometry(1.4, 6, 8), std('#d9c9a8', { flatShading: true })); spire.position.set(0, 15, 0); g.add(spire);
  return g;
}
export function woodenMausoleum() { // the first, temporary mausoleum of January 1924
  const g = new THREE.Group(), w = '#4a3424';
  g.add(at(box(5, 2.2, 5, w), 0, 1.1, 0)); g.add(at(box(3.6, 1.0, 3.6, w), 0, 2.7, 0)); g.add(at(box(2.2, 0.8, 2.2, w), 0, 3.6, 0));
  const tex = canvasTex(512, 96, (x, W, H) => { x.fillStyle = '#4a3424'; x.fillRect(0, 0, W, H); x.fillStyle = '#e8e2d4'; x.font = '900 70px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('ЛЕНИН', W / 2, H / 2 + 4); });
  const p = plane(2.6, 0.5, tex); p.position.set(0, 1.6, 2.52); g.add(p);
  g.add(at(box(1.2, 1.4, 0.06, '#1a120c'), 0, 0.7, 2.52));
  return g;
}
// Coyoacán: a cobalt-blue wall (Casa Azul) and Trotsky's fortified house.
export function blueHouse(w = 14, h = 4) {
  const g = new THREE.Group(); g.add(at(box(w, h, 0.5, '#2a5bb3'), 0, h / 2, 0)); g.add(at(box(w + 0.1, 0.3, 0.6, '#c0392b'), 0, h, 0));
  for (const x of [-4, 0, 4]) { g.add(at(box(1.0, 1.8, 0.12, '#1a3a7a'), x, 2.2, 0.26)); g.add(at(box(1.2, 0.12, 0.14, '#c0392b'), x, 3.2, 0.27)); }
  g.add(at(box(1.6, 2.6, 0.14, '#5a2a1a'), 6, 1.3, 0.26));
  return g;
}
export function trotskyHouse() {
  const g = new THREE.Group(), wall = '#d9cfbf';
  g.add(at(box(16, 5.2, 0.6, wall), 0, 2.6, 0)); g.add(at(box(16.2, 0.25, 0.7, '#b8ad9a'), 0, 5.2, 0));
  for (const x of [-7.4, 7.4]) { g.add(at(box(2.2, 7.4, 2.2, '#cfc4b0'), x, 3.7, 0.2)); g.add(at(box(2.5, 0.3, 2.5, '#8a8274'), x, 7.4, 0.2));
    for (const s of [-1, 1]) g.add(at(box(0.5, 0.35, 0.05, '#1a1c20'), x + s * 0.5, 6.4, 1.32)); }
  g.add(at(box(2.2, 2.8, 0.2, '#4a4a4c'), 2, 1.4, 0.31));
  return g;
}
export function jacaranda(s = 1, seed = 0) { return LP.roundTree(1.5 * s, ['#8a6ad0', '#9a7ae0', '#7a5ac0'][seed % 3], seed, '#5a4632'); }
export function palm(s = 1, seed = 0) {
  const g = new THREE.Group(), r = rng(seed + 5); const h = 4 * s;
  g.add(at(cyl(0.12 * s, 0.18 * s, h, '#7a6248', 8), 0, h / 2, 0));
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + r(); const f = mesh(new THREE.ConeGeometry(0.22 * s, 2.2 * s, 4), std('#3f7a32', { flatShading: true })); f.scale.set(1, 1, 0.2); f.position.set(Math.sin(a) * 0.9 * s, h - 0.2 * s, Math.cos(a) * 0.9 * s); f.rotation.set(Math.cos(a) * 1.2, 0, -Math.sin(a) * 1.2); g.add(f); }
  return g;
}


// ------------------------------------------------------------ heraldry & lettering
// Double-headed eagle (Romanov arms), drawn into a 2D canvas context centred at (cx, cy), size s.
export function drawEagle(x, cx, cy, s, col = '#141414', gold = '#d4af37', crowns = true) {
  x.save(); x.translate(cx, cy); x.scale(s / 100, s / 100); x.fillStyle = col; x.strokeStyle = col; x.lineJoin = 'round';
  for (const k of [-1, 1]) {
    x.save(); x.scale(k, 1);
    x.beginPath(); x.moveTo(6, -6); x.bezierCurveTo(30, -40, 52, -58, 84, -64); x.lineTo(78, -50); x.lineTo(92, -46); x.lineTo(80, -32); x.lineTo(94, -26); x.lineTo(80, -14);
    x.lineTo(92, -6); x.lineTo(76, 2); x.bezierCurveTo(56, 6, 30, 14, 10, 18); x.closePath(); x.fill();      // wing with feathers
    x.beginPath(); x.moveTo(4, -14); x.bezierCurveTo(14, -30, 14, -44, 26, -52); x.lineTo(34, -50); x.lineTo(28, -46); x.bezierCurveTo(22, -40, 20, -28, 12, -12); x.closePath(); x.fill(); // neck + head
    x.fillStyle = gold; x.beginPath(); x.moveTo(34, -50); x.lineTo(42, -47); x.lineTo(33, -45); x.closePath(); x.fill(); x.fillStyle = col;  // beak
    x.beginPath(); x.moveTo(8, 30); x.lineTo(22, 52); x.lineTo(14, 54); x.lineTo(4, 38); x.closePath(); x.fill();        // leg
    x.restore();
  }
  x.beginPath(); x.ellipse(0, 6, 15, 26, 0, 0, Math.PI * 2); x.fill();                                                  // body
  x.beginPath(); x.moveTo(-14, 26); x.lineTo(0, 58); x.lineTo(14, 26); x.closePath(); x.fill();                        // tail
  x.fillStyle = '#b8241e'; x.beginPath(); x.moveTo(-10, -4); x.lineTo(10, -4); x.lineTo(10, 12); x.quadraticCurveTo(0, 24, -10, 12); x.closePath(); x.fill(); // breast shield
  x.fillStyle = gold;
  if (crowns) for (const [cx2, cy2, r] of [[-30, -64, 7], [30, -64, 7], [0, -78, 10]]) { x.beginPath(); x.moveTo(cx2 - r, cy2 + r * 0.6); x.lineTo(cx2 - r, cy2 - r * 0.2); x.lineTo(cx2 - r * 0.4, cy2 + r * 0.1); x.lineTo(cx2, cy2 - r); x.lineTo(cx2 + r * 0.4, cy2 + r * 0.1); x.lineTo(cx2 + r, cy2 - r * 0.2); x.lineTo(cx2 + r, cy2 + r * 0.6); x.closePath(); x.fill(); }
  x.restore();
}
export function eagleTex(bg = '#d4af37', col = '#141414', W = 256) { return canvasTex(W, W, (x, w, h) => { if (bg) { x.fillStyle = bg; x.fillRect(0, 0, w, h); } drawEagle(x, w / 2, h / 2 + w * 0.06, w * 0.42, col); }); }
// Flat sign with lettering (shop boards, station names). Old-style serif by default.
export function signBoard(text, { w = 3, h = 0.55, bg = '#1d2a22', fg = '#e8d9a8', font = '700 {s}px "DejaVu Serif"', border = '#c9a227', lit = false } = {}) {
  const W = 1024, H = Math.max(96, Math.round(W * h / w));
  const tex = canvasTex(W, H, (x) => { x.fillStyle = bg; x.fillRect(0, 0, W, H); if (border) { x.strokeStyle = border; x.lineWidth = H * 0.06; x.strokeRect(H * 0.06, H * 0.06, W - H * 0.12, H - H * 0.12); }
    let fs = H * 0.62; const f = () => font.replace('{s}', Math.round(fs)); x.font = f(); while (x.measureText(text).width > W * 0.9 && fs > 10) { fs -= 2; x.font = f(); }
    x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, W / 2, H / 2 + fs * 0.05); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lit ? new THREE.MeshBasicMaterial({ map: tex }) : new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }));
  return m;
}
// Soviet flag (hammer & sickle) texture.
export function sovietTex(W = 512) {
  return canvasTex(W, W * 2 / 3 | 0, (x, w, h) => { x.fillStyle = '#c8102e'; x.fillRect(0, 0, w, h); x.save(); x.translate(w * 0.17, h * 0.3); x.scale(w / 512, w / 512); x.fillStyle = '#f2c230';
    x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 6 : 15; x.lineTo(Math.cos(a) * r, Math.sin(a) * r - 46); } x.closePath(); x.fill();
    x.lineWidth = 9; x.strokeStyle = '#f2c230'; x.beginPath(); x.arc(-2, 6, 30, -0.2 * Math.PI, 0.95 * Math.PI); x.stroke();          // sickle blade
    x.save(); x.rotate(-0.78); x.fillRect(-4, -36, 9, 66); x.fillRect(-16, -40, 32, 13); x.restore(); x.restore(); });  // hammer
}

// ------------------------------------------------------------ railway (chibi scale ≈ real × 0.65)
// Straight track along z (ballast, sleepers, rails).
export function track(len = 80, { gauge = 1.05, ballast = '#7d766c', snow = false } = {}) {
  const g = new THREE.Group();
  g.add(at(box(2.6, 0.12, len, snow ? '#d9dee4' : ballast), 0, 0.06, 0));
  const sl = []; for (let z = -len / 2; z < len / 2; z += 0.55) sl.push(new THREE.BoxGeometry(2.0, 0.08, 0.22).translate(0, 0.15, z));
  g.add(mesh(mergeGeometries(sl), '#4e3e2e'));
  for (const s of [-1, 1]) { g.add(at(box(0.08, 0.1, len, '#8a9096'), s * gauge / 2, 0.24, 0)); g.add(at(box(0.04, 0.02, len, '#c9cdd2'), s * gauge / 2, 0.3, 0)); }
  return g;
}
function wheelset(r, gauge, col = '#1c1c1c') { const g = new THREE.Group(); for (const s of [-1, 1]) { g.add(at(cyl(r, r, 0.1, col, 18), s * gauge / 2, 0, 0, 0, 0, Math.PI / 2)); g.add(at(cyl(r * 0.45, r * 0.45, 0.12, '#5a5650', 10), s * gauge / 2, 0, 0, 0, 0, Math.PI / 2)); } g.add(at(cyl(0.05, 0.05, gauge, '#2a2a2a', 6), 0, 0, 0, 0, 0, Math.PI / 2)); return g; }
// Passenger / saloon car: long axis along z. Body from y0 to y0+H. .doors gives door positions.
export function railCar({ color = '#1d3556', len = 11, lit = false, crest = false, band = '#d4af37', roof = '#3a3d40', gauge = 1.05 } = {}) {
  const g = new THREE.Group(), W = 2.0, y0 = 0.82, H = 2.1, top = y0 + H;
  g.add(at(box(W, H, len, color), 0, y0 + H / 2, 0));
  const rs = new THREE.Shape(); rs.moveTo(-W / 2 - 0.06, 0); rs.lineTo(W / 2 + 0.06, 0); rs.quadraticCurveTo(0, 0.62, -W / 2 - 0.06, 0);
  const rg = new THREE.ExtrudeGeometry(rs, { depth: len + 0.2, bevelEnabled: false }); rg.translate(0, 0, -(len + 0.2) / 2); g.add(at(mesh(rg, roof), 0, top, 0));
  g.add(at(box(0.9, 0.26, len - 2, roof), 0, top + 0.36, 0));                                           // clerestory
  for (let z = -len / 2 + 1.6; z < len / 2 - 1.4; z += 0.9) for (const s of [-1, 1]) g.add(at(box(0.02, 0.12, 0.5, lit ? '#ffcf80' : '#20262e'), s * 0.46, top + 0.36, z));
  g.add(at(box(W + 0.04, 0.06, len + 0.02, band), 0, y0 + 0.62, 0)); g.add(at(box(W + 0.04, 0.05, len + 0.02, band), 0, top - 0.18, 0));
  const glow = std(lit ? '#ffd690' : '#2b3644', lit ? { emissive: '#ffb860', emissiveIntensity: 1.0 } : { roughness: 0.25, metalness: 0.2 });
  const n = Math.floor((len - 2.4) / 1.05);
  for (let i = 0; i < n; i++) { const z = -((n - 1) * 1.05) / 2 + i * 1.05; if (crest && Math.abs(z) < 0.6) continue;
    for (const s of [-1, 1]) { g.add(at(box(0.04, 0.84, 0.72, '#c9b98a'), s * (W / 2 + 0.005), y0 + 1.25, z)); g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.72, 0.6), glow), s * (W / 2 + 0.01), y0 + 1.25, z)); } }
  if (crest) { const t = eagleTex(null, '#d4af37', 256); for (const s of [-1, 1]) { const p = plane(0.9, 0.9, t, false); p.position.set(s * (W / 2 + 0.03), y0 + 1.2, 0); p.rotation.y = s * Math.PI / 2; g.add(p); } }
  for (const e of [-1, 1]) {                                                                          // end vestibules, railings, steps
    const z = e * (len / 2 + 0.35); g.add(at(box(W - 0.2, 0.08, 0.7, '#2a2a2a'), 0, y0, z));
    for (const s of [-1, 1]) { g.add(at(box(0.04, 0.9, 0.04, '#3a3a3a'), s * (W / 2 - 0.15), y0 + 0.45, z + e * 0.3)); for (let k = 0; k < 2; k++) g.add(at(box(0.36, 0.05, 0.22, '#2a2a2a'), s * (W / 2 - 0.3), y0 - 0.25 - k * 0.25, z)); }
    g.add(at(box(W - 0.3, 0.04, 0.04, '#3a3a3a'), 0, y0 + 0.9, z + e * 0.3));
    for (const s of [-1, 1]) g.add(at(cyl(0.09, 0.09, 0.25, '#2a2a2a', 8), s * 0.6, y0 - 0.15, e * (len / 2 + 0.75), Math.PI / 2, 0, 0)); // buffers
  }
  g.add(at(box(W - 0.4, 0.3, len - 0.6, '#1e1e1e'), 0, y0 - 0.15, 0));
  for (const zb of [-len / 2 + 1.8, len / 2 - 1.8]) { g.add(at(box(W - 0.5, 0.25, 2.0, '#232323'), 0, 0.5, zb)); for (const dz of [-0.6, 0.6]) { const w = wheelset(0.4, gauge); w.position.set(0, 0.4, zb + dz); g.add(w); } }
  g.y0 = y0; g.len = len; g.width = W; g.top = top + 0.62;
  return g;
}
// Steam locomotive + tender at the same scale; faces +z (front at z = +3.6).
export function locomotive({ color = '#1e2224', trim = '#8a2a22', gauge = 1.05 } = {}) {
  const g = new THREE.Group(), black = std(color, { metalness: 0.35, roughness: 0.55 }), brass = std('#c9a227', { metalness: 0.7, roughness: 0.35 });
  g.add(at(mesh(new THREE.CylinderGeometry(0.78, 0.78, 5.0, 22), black), 0, 2.05, 0.6, Math.PI / 2, 0, 0));          // boiler
  g.add(at(mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.9, 22), black), 0, 2.05, 3.0, Math.PI / 2, 0, 0));          // smokebox
  g.add(at(mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.06, 22), std('#141414')), 0, 2.05, 3.47, Math.PI / 2, 0, 0));
  for (const z of [-0.6, 1.0, 2.2]) g.add(at(mesh(new THREE.TorusGeometry(0.79, 0.03, 6, 26), brass), 0, 2.05, z));
  g.add(at(mesh(new THREE.CylinderGeometry(0.26, 0.2, 0.8, 14), black), 0, 3.15, 2.9)); g.add(at(mesh(new THREE.CylinderGeometry(0.32, 0.26, 0.14, 14), black), 0, 3.55, 2.9)); // chimney
  g.add(at(mesh(new THREE.SphereGeometry(0.34, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), brass), 0, 2.78, 1.2)); g.add(at(mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.2, 14), black), 0, 2.72, 1.2));
  g.add(at(box(2.1, 2.3, 1.7, color), 0, 2.15, -2.4)); g.add(at(box(2.3, 0.12, 2.0, trim), 0, 3.35, -2.35));            // cab
  for (const s of [-1, 1]) g.add(at(box(0.04, 0.7, 0.8, '#2b3644'), s * 1.06, 2.6, -2.35));
  g.add(at(box(1.9, 0.3, 6.6, '#141414'), 0, 0.95, 0.2)); g.add(at(box(2.2, 0.14, 6.8, trim), 0, 1.17, 0.2));          // frame + running board
  for (const z of [-0.9, 0.6, 2.1]) { const w = wheelset(0.62, gauge, '#2a1a16'); w.position.set(0, 0.62, z); g.add(w); }
  for (const s of [-1, 1]) g.add(at(box(0.06, 0.08, 3.2, '#9aa0a6'), s * 0.62, 0.62, 0.6));                            // coupling rods
  for (const s of [-1, 1]) g.add(at(cyl(0.09, 0.09, 0.3, '#2a2a2a', 8), s * 0.6, 1.0, 3.75, Math.PI / 2, 0, 0));
  const lamp = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.22, 12), std('#ffe9a8', { emissive: '#ffcf6a', emissiveIntensity: 1.2 })); lamp.rotation.x = Math.PI / 2; lamp.position.set(0, 2.95, 3.5); g.add(lamp);
  const tender = new THREE.Group(); tender.position.z = -5.2; g.add(tender);
  tender.add(at(box(2.0, 1.5, 3.6, color), 0, 1.65, 0)); tender.add(at(box(1.8, 0.3, 3.2, '#121212'), 0, 2.45, 0)); tender.add(at(box(1.8, 0.3, 3.4, '#141414'), 0, 0.75, 0));
  for (const z of [-1.1, 1.1]) { const w = wheelset(0.4, gauge); w.position.set(0, 0.4, z); tender.add(w); }
  g.stack = new THREE.Vector3(0, 3.7, 2.9); g.len = 7.4; g.back = -7.1;
  return g;
}
// Whole train along -z from the loco at z=0: [loco, cars...]. Returns group with .cars.
export function trainSet(cars = 3, carOpts = {}) {
  const g = new THREE.Group(); const L = locomotive(); g.add(L); g.loco = L; g.cars = []; let z = L.back - 0.8;
  for (let i = 0; i < cars; i++) { const c = railCar(typeof carOpts === 'function' ? carOpts(i) : carOpts); z -= c.len / 2 + 0.75; c.position.z = z; z -= c.len / 2 + 0.75; g.add(c); g.cars.push(c); }
  g.stack = L.stack; return g;
}
export function imperialTrain(cars = 3, { lit = false } = {}) { return trainSet(cars, i => ({ color: '#1d3556', lit, crest: i === 1, band: '#d4af37' })); }
// Station platform along z (top at y=h) with a cast-iron canopy.
export function platform(len = 40, { w = 4, h = 0.62, canopy = true, snow = false, lamps = 0 } = {}) {
  const g = new THREE.Group();
  g.add(at(box(w, h, len, '#8a8276'), 0, h / 2, 0)); g.add(at(box(0.3, 0.02, len, snow ? '#eef2f5' : '#d8d2c2'), -w / 2 + 0.15, h + 0.01, 0));
  if (snow) g.add(at(box(w - 0.6, 0.04, len, '#e6ebf0'), 0.3, h + 0.02, 0));
  if (canopy) { for (let z = -len / 2 + 2; z < len / 2; z += 4.5) { g.add(at(cyl(0.07, 0.09, 3.6, '#2e3a34', 8), 0.4, h + 1.8, z)); g.add(at(box(2.8, 0.06, 0.08, '#2e3a34'), 0.4, h + 3.55, z)); }
    const roof = box(w + 0.6, 0.1, len, '#5a6660'); roof.position.set(0.3, h + 3.7, 0); roof.rotation.z = -0.06; g.add(roof);
    if (snow) { const sn = box(w + 0.6, 0.08, len, '#eef2f5'); sn.position.set(0.3, h + 3.79, 0); sn.rotation.z = -0.06; g.add(sn); } }
  g.lamps = []; for (let i = 0; i < lamps; i++) { const l = gasLamp(true, 2.6); l.position.set(-w / 2 + 0.5, h, -len / 2 + (i + 0.5) * len / lamps); g.add(l); g.lamps.push(l); }
  g.top = h; return g;
}
// Station building with a clock pediment and a name board (pre-1918 spelling).
export function stationHouse(name = 'ПСКОВЪ', { w = 22, h = 7, color = '#d9c9a0', lit = 0.6, seed = 3 } = {}) {
  const g = new THREE.Group(), r = rng(seed), d = 7;
  g.add(at(box(w, h, d, color), 0, h / 2, 0)); g.add(at(box(w + 0.4, 0.4, d + 0.4, '#efe6d0'), 0, h, 0)); g.add(at(box(w + 0.2, 0.25, d + 0.2, '#efe6d0'), 0, 3.4, 0));
  g.add(at(box(7, h + 2.6, d + 0.6, color), 0, (h + 2.6) / 2, 0.2)); g.add(at(box(7.4, 0.4, d + 1.0, '#efe6d0'), 0, h + 2.6, 0.2));
  const ped = new THREE.Shape(); ped.moveTo(-3.7, 0); ped.lineTo(0, 1.6); ped.lineTo(3.7, 0); ped.closePath();
  g.add(at(mesh(new THREE.ExtrudeGeometry(ped, { depth: 0.6, bevelEnabled: false }), '#efe6d0'), 0, h + 2.8, d / 2 - 0.2));
  const clock = canvasTex(128, 128, (x, W) => { x.fillStyle = '#f6f1e4'; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); x.strokeStyle = '#1a1a1a'; x.lineWidth = 5; x.stroke(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; x.fillStyle = '#1a1a1a'; x.fillRect(64 + Math.sin(a) * 48 - 3, 64 - Math.cos(a) * 48 - 3, 6, 6); } x.lineWidth = 6; x.beginPath(); x.moveTo(64, 64); x.lineTo(64 + 30, 64 - 14); x.moveTo(64, 64); x.lineTo(64 - 6, 64 - 44); x.stroke(); });
  const ck = plane(1.4, 1.4, clock, false); ck.position.set(0, h + 1.6, d / 2 + 0.52); g.add(ck);
  const sb = signBoard(name, { w: 6.0, h: 0.8 }); sb.position.set(0, h - 0.7, d / 2 + 0.52); g.add(sb);
  const glow = std('#ffd690', { emissive: '#ffbe66', emissiveIntensity: 1.0 }), dark = std(glassC, { roughness: 0.3 });
  for (let x = -w / 2 + 1.4; x < w / 2 - 1; x += 1.9) for (const y of [1.7, 5.0]) { if (Math.abs(x) < 3.8 && y < 3) continue;
    g.add(at(box(1.05, 1.75, 0.08, '#efe6d0'), x, y, d / 2 + (Math.abs(x) < 3.8 ? 0.52 : 0.02))); g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.5, 0.1), r() < lit ? glow : dark), x, y, d / 2 + (Math.abs(x) < 3.8 ? 0.54 : 0.04)));
    g.add(at(mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.08, 14, 1, false, -Math.PI / 2, Math.PI), '#efe6d0'), x, y + 0.88, d / 2 + (Math.abs(x) < 3.8 ? 0.52 : 0.02), Math.PI / 2, 0, 0)); }
  for (const x of [-1.6, 1.6]) { g.add(at(box(1.6, 2.6, 0.1, '#3a2a1e'), x, 1.3, d / 2 + 0.55)); g.add(at(box(1.4, 0.9, 0.12, lit ? '#ffd690' : glassC), x, 3.0, d / 2 + 0.56)); }
  g.add(at(box(w, 0.8, d - 0.6, '#5a6066'), 0, h + 0.6, -0.2));
  return g;
}

// ------------------------------------------------------------ street furniture, fire, light, snow
// Stack of firewood logs (the cadets' barricade in front of the Winter Palace, Oct 1917).
export function woodpile(len = 4, h = 1.2, seed = 0) {
  const g = new THREE.Group(), r = rng(seed + 31), rows = Math.round(h / 0.22);
  for (let j = 0; j < rows; j++) for (let x = -len / 2 + 0.12; x < len / 2; x += 0.24) { const l = cyl(0.11, 0.11, 1.0 + r() * 0.2, ['#7a5a3a', '#6a4a2e', '#8a6a44'][(r() * 3) | 0], 7); l.rotation.x = Math.PI / 2; l.position.set(x + (j % 2) * 0.12, 0.11 + j * 0.21, (r() - 0.5) * 0.12); g.add(l); }
  return g;
}
// Bonfire: logs, rising flame sprites and a flickering light. .update(t)
export function bonfire(s = 1, seed = 0) {
  const g = new THREE.Group(), r = rng(seed + 7);
  for (let i = 0; i < 6; i++) { const l = cyl(0.06 * s, 0.07 * s, 0.9 * s, '#4a3220', 6); l.rotation.set(Math.PI / 2 - 0.5, i * 1.05 + r() * 0.3, 0, 'YXZ'); l.position.y = 0.18 * s; g.add(l); }
  g.add(at(mesh(new THREE.CircleGeometry(0.7 * s, 16), std('#2a2420')), 0, 0.02, 0, -Math.PI / 2, 0, 0));
  const fire = MX.fireSprites(g, 12, { size: 0.9 * s, rise: 1.3 * s, spread: 0.5 * s, life: 0.8 });
  const light = new THREE.PointLight('#ff9a40', 9 * s, 9 * s, 1.5); light.position.y = 0.7 * s; g.add(light);
  const o = new THREE.Vector3(0, 0.15 * s, 0); g.update = t => { fire(t + seed, o, 1); light.intensity = 9 * s * (0.85 + 0.15 * Math.sin(t * 13 + seed) * Math.sin(t * 7.3)); };
  g.update(0); return g;
}
// Searchlight beam: additive cone from the origin along -y, fading with distance and at grazing angles.
export function beam(len = 30, r0 = 0.25, r1 = 3.5, color = '#e8eeff', op = 0.16) {
  const geo = new THREE.CylinderGeometry(r0, r1, len, 32, 8, true); geo.translate(0, -len / 2, 0);
  const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({
    uniforms: { col: { value: new THREE.Color(color) }, op: { value: op } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'varying float vV; varying vec3 vN; varying vec3 vP; void main(){ vV = uv.y; vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vP = mv.xyz; gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 col; uniform float op; varying float vV; varying vec3 vN; varying vec3 vP; void main(){ float e = abs(dot(normalize(vN), normalize(-vP))); gl_FragColor = vec4(col * op * pow(vV, 1.6) * pow(e, 1.2), 1.); }',
  }));
  m.renderOrder = 5; m.frustumCulled = false; return m;
}
// Falling snow: deterministic points in a box around the camera target. .update(t)
export function snowfall(parent, { n = 1600, area = [-16, -2, -30, 16, 12, 10], speed = 1.1, size = 0.06, color = '#ffffff', drift = 0.4 } = {}) {
  const [x0, y0, z0, x1, y1, z1] = area, r = rng(321), base = [], pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) base.push([x0 + r() * (x1 - x0), r() * (y1 - y0), z0 + r() * (z1 - z0), r() * 6.28, 0.7 + r() * 0.6]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const tex = canvasTex(32, 32, (x) => { const gr = x.createRadialGradient(16, 16, 0, 16, 16, 15); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); });
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, map: tex, transparent: true, depthWrite: false, opacity: 0.9 })); parent.add(pts);
  pts.update = t => { const H = y1 - y0; for (let i = 0; i < n; i++) { const [x, y, z, ph, v] = base[i]; let yy = (y - t * speed * v) % H; if (yy < 0) yy += H;
    pos[i * 3] = x + Math.sin(t * 0.8 + ph) * drift; pos[i * 3 + 1] = y0 + yy; pos[i * 3 + 2] = z + Math.cos(t * 0.6 + ph) * drift * 0.5; } geo.attributes.position.needsUpdate = true; };
  pts.update(0); pts.frustumCulled = false; return pts;
}
// Shell crater (dark ring of churned earth).
export function crater(r = 1.6, snow = true) {
  const g = new THREE.Group();
  g.add(at(mesh(new THREE.CircleGeometry(r, 20), std('#3a3028')), 0, 0.02, 0, -Math.PI / 2, 0, 0));
  const rim = mesh(new THREE.TorusGeometry(r, 0.3, 6, 20), std(snow ? '#8a8078' : '#5a4a3a', { flatShading: true })); rim.rotation.x = Math.PI / 2; rim.scale.z = 0.5; g.add(rim);
  return g;
}
// Wattle fence (pletень) segment along x.
export function wattle(len = 6, h = 0.9, seed = 0) {
  const g = new THREE.Group(), r = rng(seed + 13);
  for (let x = -len / 2; x <= len / 2; x += 0.5) g.add(at(cyl(0.035, 0.04, h + 0.25, '#5a4632', 5), x, (h + 0.25) / 2, 0, (r() - 0.5) * 0.08, 0, (r() - 0.5) * 0.08));
  for (let i = 0; i < 6; i++) g.add(at(box(len, 0.08, 0.06, i % 2 ? '#7a6244' : '#6a5238'), 0, 0.15 + i * h / 6, (i % 2 - 0.5) * 0.04));
  return g;
}
// Well sweep (журавль): post + long pivoting pole + bucket.
export function wellSweep() {
  const g = new THREE.Group(); g.add(at(box(0.9, 0.6, 0.9, '#6a5238'), 0, 0.3, 0)); g.add(at(cyl(0.08, 0.1, 3.2, '#5a4632', 6), 1.4, 1.6, 0));
  const pole = cyl(0.05, 0.05, 6, '#6a5238', 6); pole.position.set(1.4, 3.1, 0); pole.rotation.z = 1.0; g.add(pole);
  g.add(at(cyl(0.015, 0.015, 2.6, '#3a3028', 4), -1.1, 2.0, 0)); g.add(at(cyl(0.16, 0.13, 0.3, '#6a5238', 10), -1.1, 0.7, 0));
  return g;
}

// ------------------------------------------------------------ furniture
// Built at human size, then scaled by k (KF ≈ chibi size: seat ≈ 0.2, desk top ≈ 0.36). .top is the scaled top height.
export const KF = 0.44;
const sc = (g, k) => { g.scale.setScalar(k); if (g.top != null) g.top *= k; return g; };
export function bench(len = 3, col = '#6a4a2e', k = KF) { const g = new THREE.Group(); g.add(at(box(len, 0.08, 0.4, col), 0, 0.42, 0)); g.add(at(box(len, 0.45, 0.06, col), 0, 0.68, -0.2)); for (const x of [-len / 2 + 0.15, len / 2 - 0.15]) g.add(at(box(0.08, 0.42, 0.36, col), x, 0.21, 0)); g.top = 0.46; return sc(g, k); }
export function tableCloth(w = 4, d = 1.1, cloth = '#8a1f1f', h = 0.78, k = KF) { const g = new THREE.Group(); g.add(at(box(w, 0.05, d, '#5a3a24'), 0, h, 0)); g.add(at(box(w + 0.04, h - 0.04, d + 0.04, cloth), 0, (h - 0.04) / 2 + 0.02, 0)); g.top = h + 0.03; return sc(g, k); }
export function lectern(col = '#5a3a24', cloth = null, k = 0.55) { const g = new THREE.Group(); g.add(at(box(0.8, 1.1, 0.6, col), 0, 0.55, 0)); const t = box(0.9, 0.06, 0.7, col); t.position.set(0, 1.15, 0.02); t.rotation.x = 0.25; g.add(t); if (cloth) g.add(at(box(0.82, 0.7, 0.02, cloth), 0, 0.6, 0.31)); g.top = 1.18; return sc(g, k); }
export function desk(w = 1.6, d = 0.8, col = '#4a3020', k = KF) { const g = new THREE.Group(); g.add(at(box(w, 0.06, d, col), 0, 0.76, 0)); g.add(at(box(0.5, 0.72, d - 0.05, col), -w / 2 + 0.27, 0.36, 0)); g.add(at(box(0.5, 0.72, d - 0.05, col), w / 2 - 0.27, 0.36, 0)); g.add(at(box(w - 0.02, 0.04, d - 0.02, '#2f5a3a'), 0, 0.795, 0)); g.top = 0.82; return sc(g, k); }
export function chairR(col = '#4a3020', seat = '#7a2a24', k = 0.4) { const g = new THREE.Group(); g.add(at(box(0.48, 0.07, 0.46, seat), 0, 0.46, 0)); g.add(at(box(0.48, 0.6, 0.06, col), 0, 0.78, -0.21)); for (const [x, z] of [[-0.2, -0.19], [0.2, -0.19], [-0.2, 0.19], [0.2, 0.19]]) g.add(at(box(0.05, 0.45, 0.05, col), x, 0.22, z)); g.top = 0.495; return sc(g, k); }
export function sofa(w = 2, col = '#2f5a3a', wood = '#4a3020', k = 0.4) { const g = new THREE.Group(); g.add(at(box(w, 0.4, 0.8, col), 0, 0.35, 0)); g.add(at(box(w, 0.6, 0.18, col), 0, 0.8, -0.32)); for (const s of [-1, 1]) g.add(at(box(0.16, 0.35, 0.8, col), s * (w / 2 - 0.08), 0.65, 0)); g.add(at(box(w + 0.04, 0.1, 0.84, wood), 0, 0.12, 0)); g.top = 0.55; return sc(g, k); }
export function deskLamp(lit = true, shade = '#2f6a3a', k = 0.5) { const g = new THREE.Group(); g.add(at(cyl(0.08, 0.1, 0.04, '#c9a227', 12), 0, 0.02, 0)); g.add(at(cyl(0.015, 0.015, 0.36, '#c9a227', 6), 0, 0.2, 0));
  g.add(at(mesh(new THREE.CylinderGeometry(0.06, 0.15, 0.13, 14, 1, true), std(shade, { side: THREE.DoubleSide, emissive: lit ? shade : '#000', emissiveIntensity: 0.4 })), 0, 0.4, 0));
  if (lit) { const l = new THREE.PointLight('#ffd9a0', 2.2, 3, 1.6); l.position.y = 0.33; g.add(l); g.add(at(mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff3c8' })), 0, 0.36, 0)); } return sc(g, k); }
export function keroseneLamp(lit = true, k = 0.55) { const g = new THREE.Group(); g.add(at(cyl(0.07, 0.09, 0.12, '#8a6a3a', 10), 0, 0.06, 0)); g.add(at(mesh(new THREE.SphereGeometry(0.06, 10, 8), std('#fff0c8', { emissive: '#ffb050', emissiveIntensity: lit ? 2 : 0, transparent: true, opacity: 0.9 })), 0, 0.18, 0)); g.add(at(cyl(0.035, 0.04, 0.14, '#e8e2d4', 8), 0, 0.28, 0));
  if (lit) { const l = new THREE.PointLight('#ffb860', 3.5, 6, 1.5); l.position.y = 0.22; g.add(l); } return sc(g, k); }
export function bookshelf(w = 1.6, h = 2.0, seed = 0, k = 0.62) { const g = new THREE.Group(), r = rng(seed + 9); g.add(at(box(w, h, 0.36, '#4a3020'), 0, h / 2, 0));
  for (let q = 0; q < 4; q++) { const y = 0.12 + q * (h - 0.2) / 4; let x = -w / 2 + 0.08; while (x < w / 2 - 0.12) { const bw = 0.04 + r() * 0.05, bh = 0.26 + r() * 0.12; g.add(at(box(bw, bh, 0.26, ['#7a2a24', '#2a4a6a', '#3a5a3a', '#6a5a3a', '#2a2a2a', '#8a6a3a'][(r() * 6) | 0]), x + bw / 2, y + bh / 2, 0.06)); x += bw + 0.008; } }
  return sc(g, k); }
export function papers(n = 6, seed = 0, k = 0.5) { const g = new THREE.Group(), r = rng(seed + 3); for (let i = 0; i < n; i++) g.add(at(box(0.21, 0.004, 0.29, '#f3ecd8'), (r() - 0.5) * 0.4, 0.003 + i * 0.004, (r() - 0.5) * 0.25, 0, (r() - 0.5) * 0.6, 0)); return sc(g, k); }
// Framed picture from a draw function.
export function picture(w = 0.8, h = 1.0, draw, frame = '#c9a227') { const g = new THREE.Group(); g.add(at(box(w + 0.12, h + 0.12, 0.05, frame), 0, 0, 0)); const p = plane(w, h, canvasTex(256, Math.round(256 * h / w), draw), false); p.position.z = 0.03; g.add(p); return g; }
// Hand printing press (clandestine newspaper).
export function press(k = 0.6) { const g = new THREE.Group(), iron = '#2a2c2e'; g.add(at(box(0.9, 0.7, 0.6, iron), 0, 0.35, 0)); for (const s of [-1, 1]) g.add(at(box(0.08, 0.9, 0.08, iron), s * 0.4, 1.1, 0)); g.add(at(box(0.9, 0.12, 0.3, iron), 0, 1.55, 0)); g.add(at(cyl(0.03, 0.03, 0.7, '#8a8a8a', 6), 0, 1.25, 0)); g.add(at(box(0.6, 0.06, 0.45, '#5a3a24'), 0, 0.74, 0)); return sc(g, k); }
// Newspaper stack with a masthead.
export function newspapers(title = 'ИСКРА', n = 8, k = 0.5) { const g = new THREE.Group(); const t = canvasTex(256, 352, (x, W, H) => { x.fillStyle = '#efe6d0'; x.fillRect(0, 0, W, H); x.fillStyle = '#1a1a1a'; x.font = '900 64px "DejaVu Serif"'; x.textAlign = 'center'; x.fillText(title, W / 2, 70); x.fillRect(16, 84, W - 32, 4); for (let i = 0; i < 18; i++) x.fillRect(16 + (i % 2) * 120, 104 + (i >> 1) * 26, 104, 8); });
  for (let i = 0; i < n; i++) g.add(at(box(0.3, 0.006, 0.42, '#efe6d0'), 0, 0.003 + i * 0.007, 0, 0, (i % 3) * 0.04, 0)); const top = plane(0.3, 0.42, t, false); top.rotation.x = -Math.PI / 2; top.position.y = n * 0.007 + 0.002; g.add(top); return sc(g, k); }
// Market stall with an awning and goods.
export function stall(seed = 0, awning = '#b8432f', k = 0.6) { const g = new THREE.Group(), r = rng(seed + 17); g.add(at(box(2.2, 0.8, 0.9, '#6a4a2e'), 0, 0.4, 0)); for (const x of [-1.05, 1.05]) for (const z of [-0.4, 0.4]) g.add(at(cyl(0.035, 0.035, 2.2, '#5a3a24', 5), x, 1.1, z));
  const aw = box(2.5, 0.05, 1.3, awning); aw.position.set(0, 2.15, 0.15); aw.rotation.x = 0.18; g.add(aw);
  for (let i = 0; i < 7; i++) { const q = (r() * 4) | 0; const m = q === 0 ? mesh(new THREE.SphereGeometry(0.13, 8, 6), '#7aa04a') : q === 1 ? mesh(new THREE.CapsuleGeometry(0.07, 0.2, 3, 6), '#c9944a') : q === 2 ? box(0.18, 0.14, 0.14, '#8a6a3a') : mesh(new THREE.SphereGeometry(0.1, 8, 6), '#c0392b'); m.position.set(-0.85 + i * 0.28, 0.9, (r() - 0.5) * 0.4); if (q === 1) m.rotation.z = Math.PI / 2; g.add(m); }
  return sc(g, k); }

// ------------------------------------------------------------ ships & fortresses
// Dreadnought (Gangut class: Petropavlovsk / Sevastopol at Kronstadt): long hull, 4 triple turrets, 2 funnels. Along z.
export function dreadnought(len = 34, col = '#6f777e') {
  const g = new THREE.Group(); const W = 3.6;
  const sh = new THREE.Shape(); sh.moveTo(-W / 2, -len / 2); sh.lineTo(W / 2, -len / 2); sh.lineTo(W / 2, len / 2 - 5); sh.quadraticCurveTo(W / 2, len / 2 - 1, 0, len / 2); sh.quadraticCurveTo(-W / 2, len / 2 - 1, -W / 2, len / 2 - 5); sh.closePath();
  const hg = new THREE.ExtrudeGeometry(sh, { depth: 2.2, bevelEnabled: false }); hg.rotateX(-Math.PI / 2); g.add(mesh(hg, std('#4a5056', { roughness: 0.6 })));
  const dk = new THREE.ShapeGeometry(sh); dk.rotateX(-Math.PI / 2); g.add(at(mesh(dk, '#7a6a52'), 0, 2.21, 0));
  for (const z of [-len * 0.36, -len * 0.12, len * 0.1, len * 0.32]) { const tr = new THREE.Group(); tr.position.set(0, 2.2, z); g.add(tr); tr.add(at(cyl(1.0, 1.1, 0.7, col, 14), 0, 0.35, 0)); for (const x of [-0.35, 0, 0.35]) tr.add(at(cyl(0.08, 0.09, 2.6, '#4a5056', 8), x, 0.4, z > 0 ? 1.5 : -1.5, Math.PI / 2, 0, 0)); }
  g.add(at(box(2.2, 1.6, 4, col), 0, 3.0, len * 0.22)); g.add(at(box(1.6, 1.2, 2, col), 0, 4.2, len * 0.22));
  for (const z of [-len * 0.02, len * 0.2]) g.add(at(cyl(0.55, 0.6, 3.4, '#3e4448', 14), 0, 4.0, z - 1.2));
  for (const z of [-len * 0.24, len * 0.28]) g.add(at(cyl(0.12, 0.12, 9, '#3a3f44', 6), 0, 6.5, z));
  return g;
}
// Kronstadt Naval Cathedral silhouette (big central dome).
export function navalCathedral() { const g = new THREE.Group(), c = '#cfc6b4'; g.add(at(box(12, 7, 12, c), 0, 3.5, 0)); g.add(at(cyl(4.2, 4.2, 4, c, 24), 0, 9, 0)); g.add(at(mesh(new THREE.SphereGeometry(4.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), std('#6a7a6a', { roughness: 0.5 })), 0, 11, 0)); g.add(at(box(0.2, 2.2, 0.2, '#d4af37'), 0, 16.3, 0)); for (const [x, z] of [[-5, -5], [5, -5], [-5, 5], [5, 5]]) { g.add(at(cyl(1.0, 1.0, 2.5, c, 12), x, 8.2, z)); g.add(at(mesh(new THREE.SphereGeometry(1.05, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), '#6a7a6a'), x, 9.45, z)); } return g; }
// Low brick fort with gun embrasures.
export function seaFort(w = 30, h = 4) { const g = new THREE.Group(); g.add(at(box(w, h, 6, '#7a6a5a'), 0, h / 2, 0)); for (let x = -w / 2 + 1.5; x < w / 2; x += 3) g.add(at(box(0.8, 0.6, 0.1, '#1a1816'), x, h * 0.6, 3.02)); g.add(at(box(w + 0.4, 0.3, 6.4, '#5a4e42'), 0, h, 0)); return g; }

// ------------------------------------------------------------ industry
// Factory shed with a saw-tooth roof (Putilov works), along x.
export function factoryShed(w = 30, d = 12, h = 6, { brick = '#8a4a34', lit = 0, seed = 0 } = {}) {
  const g = new THREE.Group(), r = rng(seed + 5);
  g.add(at(box(w, h, d, brick), 0, h / 2, 0));
  const n = Math.round(w / 3);
  for (let i = 0; i < n; i++) { const x = -w / 2 + (i + 0.5) * w / n; const s = new THREE.Shape(); s.moveTo(-w / n / 2, 0); s.lineTo(w / n / 2, 0); s.lineTo(w / n / 2, 1.6); s.closePath();
    g.add(at(mesh(new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }), '#4a4e52'), x, h, -d / 2)); g.add(at(box(0.05, 1.5, d, lit ? '#ffcf80' : '#7a8a96'), x + w / n / 2 - 0.03, h + 0.78, 0)); }
  const glow = std('#ffcf80', { emissive: '#ffb050', emissiveIntensity: 0.9 }), dark = std('#3a4450', { roughness: 0.3 });
  for (let x = -w / 2 + 1.5; x < w / 2 - 1; x += 3) { g.add(at(box(1.8, 2.6, 0.1, '#5a2a20'), x, h * 0.5 + 0.4, d / 2 + 0.01)); g.add(at(new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.3, 0.1), r() < lit ? glow : dark), x, h * 0.5 + 0.4, d / 2 + 0.03)); }
  return g;
}
export function chimney(h = 22, r0 = 0.9, r1 = 1.4, col = '#7a3a2a') { const g = new THREE.Group(); g.add(at(cyl(r0, r1, h, col, 16), 0, h / 2, 0)); g.add(at(cyl(r0 + 0.15, r0 + 0.15, 0.6, '#3a2a22', 16), 0, h - 0.3, 0)); for (const y of [h * 0.3, h * 0.6]) g.add(at(cyl(r1 * 0.95 - (y / h) * (r1 - r0) + 0.06, r1 * 0.95 - (y / h) * (r1 - r0) + 0.06, 0.3, '#5a2a20', 16), 0, y, 0)); g.top = new THREE.Vector3(0, h + 0.3, 0); return g; }
// Factory gate: two brick piers and an iron arch with the works' name.
export function factoryGate(name = 'ПУТИЛОВСКІЙ ЗАВОДЪ', w = 7) { const g = new THREE.Group(); for (const s of [-1, 1]) { g.add(at(box(1.2, 4.2, 1.2, '#8a4a34'), s * w / 2, 2.1, 0)); g.add(at(box(1.4, 0.3, 1.4, '#5a2a20'), s * w / 2, 4.35, 0)); }
  const sb = signBoard(name, { w: w - 0.6, h: 0.7, bg: '#1e2224', fg: '#e8e2d4', border: null }); sb.position.set(0, 4.6, 0.62); g.add(sb); g.add(at(box(w - 0.6, 0.12, 0.12, '#1e2224'), 0, 4.2, 0.6));
  for (const s of [-1, 1]) for (let i = 0; i < 7; i++) g.add(at(box(0.05, 3.2, 0.05, '#1e2224'), s * (0.25 + i * 0.4), 1.6, 0.1)); return g; }

// ------------------------------------------------------------ procession & volley
// Simple painted portrait of Nicholas II (beard, khaki tunic) for marchers' portraits and frames.
export function drawTsar(x, W, H) {
  x.fillStyle = '#3a4a6a'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#5a5e40'; x.beginPath(); x.moveTo(W * 0.1, H); x.quadraticCurveTo(W * 0.14, H * 0.66, W * 0.5, H * 0.64); x.quadraticCurveTo(W * 0.86, H * 0.66, W * 0.9, H); x.fill();
  x.fillStyle = '#d9b44a'; x.fillRect(W * 0.16, H * 0.7, W * 0.14, H * 0.04); x.fillRect(W * 0.7, H * 0.7, W * 0.14, H * 0.04);
  x.fillStyle = '#e2b896'; x.beginPath(); x.ellipse(W * 0.5, H * 0.4, W * 0.18, H * 0.2, 0, 0, 7); x.fill();
  x.fillStyle = '#6a4a30'; x.beginPath(); x.ellipse(W * 0.5, H * 0.24, W * 0.19, H * 0.08, 0, Math.PI, 0); x.fill();
  x.beginPath(); x.moveTo(W * 0.33, H * 0.44); x.quadraticCurveTo(W * 0.5, H * 0.72, W * 0.67, H * 0.44); x.quadraticCurveTo(W * 0.5, H * 0.54, W * 0.33, H * 0.44); x.fill();
  x.fillStyle = '#2a2020'; x.fillRect(W * 0.41, H * 0.38, W * 0.05, H * 0.015); x.fillRect(W * 0.54, H * 0.38, W * 0.05, H * 0.015);
}
// Portrait on a pole (carried by the 1905 marchers).
export function portraitPole(draw = drawTsar, h = 2.2) {
  const g = new THREE.Group(); g.add(at(cyl(0.02, 0.02, h, '#6a4a2f', 6), 0, h / 2, -0.02));
  const p = new THREE.Group(); p.add(at(box(0.5, 0.62, 0.04, '#c9a227'), 0, 0, 0)); const pl = plane(0.42, 0.54, canvasTex(160, 206, draw), false); pl.position.z = 0.025; p.add(pl); p.position.y = h; g.add(p);
  return g;
}
// Church banner (khorugv): cloth hanging from a cross-bar with a painted saint and a fringe.
export function khorugv(h = 2.6) {
  const g = new THREE.Group(); g.add(at(cyl(0.022, 0.022, h + 0.3, '#c9a227', 6), 0, (h + 0.3) / 2, -0.02)); g.add(at(box(0.7, 0.03, 0.03, '#c9a227'), 0, h, 0));
  const tex = canvasTex(160, 220, (x, W, H) => { x.fillStyle = '#8a1f2a'; x.fillRect(0, 0, W, H); x.fillStyle = '#d4af37'; x.fillRect(8, 8, W - 16, H - 40); x.fillStyle = '#7a1f1f'; x.fillRect(16, 16, W - 32, H - 56);
    x.fillStyle = '#e9c98a'; x.beginPath(); x.arc(W / 2, 70, 18, 0, 7); x.fill(); x.strokeStyle = '#f2d36a'; x.lineWidth = 5; x.beginPath(); x.arc(W / 2, 70, 28, 0, 7); x.stroke(); x.fillStyle = '#3a2a5a'; x.fillRect(W / 2 - 22, 98, 44, 60);
    for (let i = 0; i < 8; i++) { x.fillStyle = '#d4af37'; x.beginPath(); x.moveTo(i * W / 8, H - 32); x.lineTo((i + 0.5) * W / 8, H); x.lineTo((i + 1) * W / 8, H - 32); x.fill(); } });
  const p = plane(0.62, 0.86, tex, false); p.position.set(0, h - 0.45, 0.01); g.add(p);
  g.add(at(mesh(new THREE.SphereGeometry(0.05, 8, 6), std('#d4af37', { metalness: 0.7, roughness: 0.3 })), 0, h + 0.33, 0));
  return g;
}
// Musket smoke + flashes for a firing line. origins: Vector3[]; update(t, tv)
export function volleyFx(parent, origins, { color = '#e8e6e0', size = 0.5 } = {}) {
  const puffs = [], flashes = [];
  origins.forEach((o, i) => {
    for (let k = 0; k < 3; k++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: MX.puffTex(), color, transparent: true, depthWrite: false })); m.renderOrder = 3; m.visible = false; parent.add(m); puffs.push([m, o, k, i]); }
    const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: MX.puffTex(), color: '#ffd27a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); f.renderOrder = 4; f.visible = false; parent.add(f); flashes.push([f, o]);
  });
  return (t, tv, dir = new THREE.Vector3(0, 0, 1)) => {
    const u = t - tv;
    for (const [m, o, k, i] of puffs) { const v = u - k * 0.05 - (i % 3) * 0.02; m.visible = v > 0 && v < 3.2; if (!m.visible) continue; const e = 1 - Math.exp(-v * 2.2);
      m.position.copy(o).addScaledVector(dir, 0.25 + 0.6 * e + k * 0.15).add(new THREE.Vector3(0, 0.25 * v, 0)); m.scale.setScalar(size * (0.4 + 1.6 * e + k * 0.2)); m.material.opacity = 0.8 * (1 - v / 3.2); m.material.rotation = i + k; }
    for (const [f, o] of flashes) { f.visible = u > 0 && u < 0.09; if (f.visible) { f.position.copy(o).addScaledVector(dir, 0.12); f.scale.setScalar(0.5); f.material.opacity = 1; } }
  };
}
// Orthodox grave cross (three bars, the lowest one slanted).
export function orthCross(seed = 0, s = 1) {
  const g = new THREE.Group(), r = rng(seed + 61), c = ['#5a4632', '#4e3c2a', '#6a5238'][seed % 3];
  g.add(at(box(0.06, 0.9, 0.05, c), 0, 0.45, 0)); g.add(at(box(0.22, 0.05, 0.05, c), 0, 0.78, 0)); g.add(at(box(0.4, 0.05, 0.05, c), 0, 0.64, 0));
  const f = box(0.26, 0.045, 0.05, c); f.position.set(0, 0.3, 0); f.rotation.z = -0.38; g.add(f);
  g.rotation.set((r() - 0.5) * 0.1, (r() - 0.5) * 0.3, (r() - 0.5) * 0.12); g.scale.setScalar(s); return g;
}
