// Props for the Puebla video: tractor-trailers, Pemex pipeline markers and an illegal tap, jerry cans,
// seized weapons, Puebla's cathedral and arcaded "portales", border and police-station signs.
import * as THREE from 'three';
import * as LP from '../lib/props.js';
import { at, box, cyl, mesh, rng } from '../lib/props.js';
import * as N from '../narco/props.js';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });
const glow = (color, k = 1.5) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: k, roughness: 0.5 });
const plane = (w, h, map, basic = true) => mesh(new THREE.PlaneGeometry(w, h), basic ? new THREE.MeshBasicMaterial({ map, transparent: true }) : new THREE.MeshStandardMaterial({ map, roughness: 0.8 }));
const tex = N.canvasTex;
const sh = o => { o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };

// ------------------------------------------------------------ tractor-trailer (front faces +z)
export function semi(color = '#b8432f', { night = false, trailer = '#e9e7e1', stripe = '#2a5a8a' } = {}) {
  const g = new THREE.Group(), b = new THREE.Group(); g.add(b);
  b.add(at(box(1.3, 1.4, 1.4, color), 0, 1.35, 2.6));                 // cab
  b.add(at(box(1.3, 0.72, 0.95, color), 0, 1.01, 3.77));               // hood
  b.add(at(box(1.16, 0.42, 0.03, '#18202a'), 0, 1.74, 3.31));          // windshield
  for (const s of [-1, 1]) b.add(at(box(0.02, 0.42, 0.7, '#18202a'), s * 0.655, 1.72, 2.85)); // side windows
  b.add(at(box(0.9, 0.5, 0.04, '#2a2c30'), 0, 1.0, 4.25));             // grille
  b.add(at(box(1.36, 0.18, 0.14, '#9aa0a6'), 0, 0.62, 4.28));          // bumper
  for (const s of [-1, 1]) {
    const hl = box(0.2, 0.12, 0.03, '#e8e4d0'); if (night) hl.material = glow('#fff2c8', 2.4); hl.position.set(s * 0.5, 0.92, 4.25); b.add(hl);
    b.add(at(cyl(0.05, 0.05, 1.1, '#9aa0a6', 10), s * 0.58, 2.35, 1.95));          // exhaust stacks
    const tank = cyl(0.2, 0.2, 0.8, '#b8bcc2', 14); tank.rotation.x = Math.PI / 2; tank.position.set(s * 0.6, 0.62, 2.3); b.add(tank);
  }
  b.add(at(box(0.9, 0.25, 9.2, '#26282c'), 0, 0.55, -1.3));           // chassis
  b.add(at(box(1.36, 1.85, 8.0, trailer), 0, 1.9, -2.3));             // trailer box
  for (const s of [-1, 1]) b.add(at(box(0.02, 0.22, 7.8, stripe), s * 0.69, 1.35, -2.3));
  for (const s of [-1, 1]) { const tl = box(0.14, 0.12, 0.03, '#8a1010'); tl.material = glow('#c81818', night ? 1.8 : 0.4); tl.position.set(s * 0.55, 1.05, -6.31); b.add(tl); }
  g.wheels = [];
  for (const z of [3.7, 2.05, 1.35, -4.9, -5.7]) for (const x of [-0.56, 0.56]) { const w = N.wheel(0.42, 0.32); w.position.set(x, 0.42, z); g.add(w); g.wheels.push(w); }
  if (night) { const L = new THREE.SpotLight('#fff0d0', 30, 26, 0.5, 0.6, 1.3); L.position.set(0, 1.0, 4.3); L.target.position.set(0, 0, 12); g.add(L, L.target); g.lamp = L; }
  g.body = b; g.drive = (t, speed = 1) => { for (const w of g.wheels) w.rotation.x = t * speed * 2.4; b.position.y = 0.01 * Math.sin(t * 11); };
  return sh(g);
}

// ------------------------------------------------------------ Pemex pipeline right-of-way
export function pipeMarker() {
  const g = new THREE.Group(); g.add(at(box(0.09, 1.1, 0.09, '#e2b21c'), 0, 0.55, 0));
  const t = tex(256, 168, (x, W, H) => { x.fillStyle = '#f2c21c'; x.fillRect(0, 0, W, H); x.fillStyle = '#111'; x.fillRect(0, 0, W, 8); x.fillRect(0, H - 8, W, 8);
    x.font = '900 58px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('PEMEX', W / 2, 52); x.font = '900 36px Inter'; x.fillText('PELIGRO', W / 2, 104); x.font = '800 22px Inter'; x.fillText('DUCTO DE GAS', W / 2, 140); });
  const p = plane(0.42, 0.28, t, false); p.position.set(0, 1.0, 0.05); g.add(p); const bk = p.clone(); bk.rotation.y = Math.PI; bk.position.z = -0.05; g.add(bk);
  return sh(g);
}
// An illegal tap: dug pit, exposed pipe, a valve and a hose.
export function toma() {
  const g = new THREE.Group();
  const pit = mesh(new THREE.CylinderGeometry(1.0, 0.85, 0.06, 24), std('#2e2218')); pit.position.y = 0.01; g.add(pit);
  const r = rng(9);
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + r() * 0.3; const m = mesh(new THREE.SphereGeometry(0.32 + r() * 0.12, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), std('#6a5034')); m.scale.set(1, 0.5, 1); m.position.set(Math.cos(a) * 1.15, 0, Math.sin(a) * 1.15); g.add(m); }
  const pipe = cyl(0.17, 0.17, 2.6, '#3a3d42', 18); pipe.rotation.z = Math.PI / 2; pipe.position.y = 0.06; g.add(pipe);
  const valve = new THREE.Group(); valve.position.set(0.1, 0.22, 0); g.add(valve);
  valve.add(at(cyl(0.05, 0.05, 0.3, '#8a8e94', 10), 0, 0, 0)); valve.add(at(box(0.16, 0.1, 0.12, '#b8432f'), 0, 0.12, 0));
  const wheel = mesh(new THREE.TorusGeometry(0.09, 0.015, 6, 18), std('#c0392b')); wheel.rotation.x = Math.PI / 2; wheel.position.y = 0.22; valve.add(wheel);
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.1, 0.28, 0), new THREE.Vector3(0.5, 0.4, 0.3), new THREE.Vector3(1.2, 0.1, 0.8), new THREE.Vector3(2.0, 0.05, 1.1), new THREE.Vector3(2.6, 0.5, 1.2)]);
  g.add(mesh(new THREE.TubeGeometry(curve, 40, 0.035, 8, false), std('#141414')));
  g.valve = valve; g.hoseEnd = new THREE.Vector3(2.6, 0.5, 1.2);
  return sh(g);
}
// 20-litre jerry can ("bidón").
export function bidon(color = '#e8e4dc') {
  const g = new THREE.Group(); g.add(at(box(0.26, 0.38, 0.17, color), 0, 0.19, 0));
  g.add(at(cyl(0.035, 0.035, 0.06, '#2a5a9a', 10), 0.07, 0.41, 0)); g.add(at(box(0.12, 0.03, 0.04, color), -0.04, 0.42, 0));
  return sh(g);
}

// ------------------------------------------------------------ seized weapons and gear
export function barrett() {
  const g = new THREE.Group(), c = '#26282c';
  g.add(at(box(0.07, 0.1, 0.5, c), 0, 0, 0));
  const br = cyl(0.014, 0.014, 0.5, '#1c1d20', 10); br.rotation.x = Math.PI / 2; br.position.set(0, 0.02, 0.5); g.add(br);
  g.add(at(box(0.05, 0.05, 0.08, '#1c1d20'), 0, 0.02, 0.77));
  const sc = cyl(0.026, 0.026, 0.24, '#141518', 12); sc.rotation.x = Math.PI / 2; sc.position.set(0, 0.1, 0.02); g.add(sc);
  g.add(at(box(0.06, 0.12, 0.22, c), 0, -0.01, -0.34)); g.add(at(box(0.04, 0.12, 0.05, c), 0, -0.09, 0.0));
  for (const s of [-1, 1]) { const l = cyl(0.008, 0.008, 0.2, '#1c1d20', 6); l.rotation.set(0.5, 0, s * 0.4); l.position.set(s * 0.04, -0.08, 0.36); g.add(l); }
  return sh(g);
}
export function jammer() {
  const g = new THREE.Group(); g.add(at(box(0.32, 0.12, 0.22, '#1d1f22'), 0, 0.06, 0));
  for (let i = 0; i < 6; i++) g.add(at(cyl(0.008, 0.008, 0.26, '#111', 5), -0.12 + i * 0.048, 0.25, -0.06 + (i % 2) * 0.1));
  g.add(at(box(0.06, 0.02, 0.01, '#3fd06a'), 0.1, 0.1, 0.111));
  return sh(g);
}
export function table(w = 2.2, d = 0.9, color = '#6a6e72') {
  const g = new THREE.Group(); g.add(at(box(w, 0.05, d, '#d8d4cc'), 0, 0.72, 0));
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(at(box(0.05, 0.72, 0.05, color), x * (w / 2 - 0.08), 0.36, z * (d / 2 - 0.08)));
  return sh(g);
}

// ------------------------------------------------------------ Puebla's cathedral (grey cantera, talavera dome)
const talaveraTex = (blue = '#1f4f9a', y = '#e8b81c') => tex(256, 256, (x, W) => {
  x.fillStyle = '#f2ead8'; x.fillRect(0, 0, W, W); const n = 8, c = W / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { x.fillStyle = (i + j) % 2 ? blue : y; x.beginPath(); x.moveTo(i * c + c / 2, j * c + 4); x.lineTo(i * c + c - 4, j * c + c / 2); x.lineTo(i * c + c / 2, j * c + c - 4); x.lineTo(i * c + 4, j * c + c / 2); x.fill(); }
});
export function cathedralPuebla() {
  const g = new THREE.Group(), stone = '#8e9196', trim = '#6f7378', dark = '#2c2a2a';
  g.add(at(box(11, 9, 22, stone), 0, 4.5, -9));                              // nave
  g.add(at(box(5.2, 12.5, 1.0, stone), 0, 6.25, 2.2));                        // central facade
  g.add(at(box(2.2, 3.8, 0.2, dark), 0, 1.9, 2.75));                          // portal
  const arch = mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.2, 18, 1, false, 0, Math.PI), std(dark)); arch.rotation.set(Math.PI / 2, 0, Math.PI / 2); arch.position.set(0, 3.8, 2.75); g.add(arch);
  for (let i = 0; i < 3; i++) g.add(at(box(5.4, 0.25, 1.2, trim), 0, 4.6 + i * 3.4, 2.25));
  for (const x of [-1.6, 1.6]) for (let f = 0; f < 3; f++) g.add(at(box(0.32, 2.6, 0.3, trim), x, 1.5 + f * 3.4, 2.75));
  g.add(at(box(1.2, 1.6, 0.15, dark), 0, 7.6, 2.75)); g.add(at(box(0.9, 1.2, 0.15, dark), 0, 10.6, 2.75));
  for (const x of [-4.6, 4.6]) {                                             // twin towers
    g.add(at(box(3.6, 14, 3.6, stone), x, 7, 1.5)); g.add(at(box(3.9, 0.35, 3.9, trim), x, 14.2, 1.5));
    g.add(at(box(3.0, 4.2, 3.0, stone), x, 16.5, 1.5)); g.add(at(box(3.3, 0.3, 3.3, trim), x, 18.75, 1.5));
    for (const [dx, dz, ry] of [[0, 1.52, 0], [0, -1.52, 0], [1.52, 0, Math.PI / 2], [-1.52, 0, Math.PI / 2]]) g.add(at(box(1.2, 2.4, 0.08, dark), x + dx, 16.4, 1.5 + dz, 0, ry, 0));
    g.add(at(box(2.3, 3.0, 2.3, stone), x, 20.4, 1.5));
    for (const [dx, dz, ry] of [[0, 1.17, 0], [0, -1.17, 0], [1.17, 0, Math.PI / 2], [-1.17, 0, Math.PI / 2]]) g.add(at(box(0.9, 1.7, 0.08, dark), x + dx, 20.3, 1.5 + dz, 0, ry, 0));
    const dm = mesh(new THREE.SphereGeometry(1.15, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), std(trim)); dm.scale.y = 1.25; dm.position.set(x, 21.9, 1.5); g.add(dm);
    g.add(at(cyl(0.22, 0.28, 0.9, stone, 10), x, 23.6, 1.5)); g.add(at(box(0.08, 0.7, 0.08, '#2a2620'), x, 24.4, 1.5)); g.add(at(box(0.36, 0.08, 0.08, '#2a2620'), x, 24.5, 1.5));
  }
  const dome = mesh(new THREE.SphereGeometry(3.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ map: talaveraTex(), roughness: 0.45 }));
  dome.material.map.wrapS = dome.material.map.wrapT = THREE.RepeatWrapping; dome.material.map.repeat.set(6, 2); dome.scale.y = 1.15; dome.position.set(0, 9.6, -12); g.add(dome);
  g.add(at(cyl(3.3, 3.3, 1.2, stone, 24), 0, 9.6, -12)); g.add(at(cyl(0.6, 0.7, 1.4, stone, 10), 0, 13.9, -12));
  for (let i = 0; i < 14; i++) g.add(at(box(0.08, 1.2, 0.08, '#1d1d1d'), -6.5 + i, 0.6, 5.4));   // atrium railing
  g.add(at(box(13.2, 0.08, 0.08, '#1d1d1d'), 0, 1.15, 5.4));
  return sh(g);
}
// Two-storey arcaded building ("portales") with a talavera tile band.
export function portal(w = 12, color = '#c98a4a', seed = 0) {
  const g = new THREE.Group(), r = rng(seed + 3), h = 7.2;
  g.add(at(box(w, h - 3.2, 3.2, color), 0, 3.2 + (h - 3.2) / 2, -0.4));        // upper floor
  g.add(at(box(w, 3.2, 0.3, '#d8cdb8'), 0, 1.6, -1.9));                       // ground-floor back wall
  g.add(at(box(w, 0.4, 3.6, '#d8cdb8'), 0, 3.0, -0.2));                       // arcade beam
  const n = Math.round(w / 1.6);
  for (let i = 0; i <= n; i++) g.add(at(cyl(0.16, 0.18, 2.8, '#e3d8c3', 10), -w / 2 + i * (w / n), 1.4, 1.35));
  for (let i = 0; i < n; i++) { const a = mesh(new THREE.TorusGeometry(w / n / 2 - 0.16, 0.12, 6, 14, Math.PI), std('#e3d8c3')); a.position.set(-w / 2 + (i + 0.5) * (w / n), 2.6, 1.35); g.add(a); }
  for (let i = 0; i < n; i++) { const x = -w / 2 + (i + 0.5) * (w / n);
    g.add(at(box(0.7, 1.3, 0.05, '#2a2320'), x, 4.8, 1.23)); g.add(at(box(0.9, 0.06, 0.35, '#3a3330'), x, 4.12, 1.35));
    if (r() < 0.5) g.add(at(box(0.5, 1.0, 0.05, ['#c0392b', '#2f6a8a', '#e8b81c'][i % 3]), x - 0.9, 1.3, -1.7)); }
  const band = plane(w, 0.5, talaveraTex(), false); band.material.map.wrapS = THREE.RepeatWrapping; band.material.map.repeat.set(w / 0.5, 1); band.position.set(0, 6.2, 1.21); g.add(band);
  g.add(at(box(w + 0.2, 0.3, 3.4, '#e6dcc6'), 0, h + 0.15, -0.4));
  return sh(g);
}
export function fountain() {
  const g = new THREE.Group(); g.add(at(cyl(1.8, 1.9, 0.5, '#a8a49a', 24), 0, 0.25, 0)); g.add(at(cyl(1.6, 1.6, 0.06, '#5f8fa8', 24), 0, 0.48, 0));
  g.add(at(cyl(0.25, 0.35, 1.6, '#9a968c', 12), 0, 1.2, 0)); g.add(at(cyl(0.6, 0.4, 0.2, '#a8a49a', 16), 0, 2.0, 0));
  const st = mesh(new THREE.CapsuleGeometry(0.18, 0.5, 4, 8), std('#5a5650')); st.position.set(0, 2.5, 0); g.add(st);
  return sh(g);
}

// ------------------------------------------------------------ signs and small buildings
export function roadSign(top, bottom, { w = 4.4, h = 1.6, bg = '#1f6a3a' } = {}) {
  const g = new THREE.Group(); for (const s of [-1, 1]) g.add(at(cyl(0.07, 0.07, 3.6, '#8a8e94', 8), s * (w / 2 - 0.4), 1.8, 0));
  const t = tex(1024, 372, (x, W, H) => { x.fillStyle = bg; x.fillRect(0, 0, W, H); x.strokeStyle = '#f2f2f2'; x.lineWidth = 10; x.strokeRect(14, 14, W - 28, H - 28);
    const fit = (txt, wt, size) => { let s = size; x.font = `${wt} ${s}px Inter`; while (x.measureText(txt).width > W - 90 && s > 20) { s -= 4; x.font = `${wt} ${s}px Inter`; } };
    x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle'; fit(top, 800, 70); x.fillText(top, W / 2, 120); fit(bottom, 900, 112); x.fillText(bottom, W / 2, 250); });
  const p = plane(w, h, t, false); p.position.set(0, 3.0, 0.08); g.add(p); g.add(at(box(w, h, 0.08, '#9aa0a6'), 0, 3.0, 0));
  return sh(g);
}
export function copStation(text = 'SEGURIDAD PÚBLICA MUNICIPAL') {
  const g = new THREE.Group(); g.add(at(box(6, 3, 3.2, '#ece4d0'), 0, 1.5, 0)); g.add(at(box(6.1, 0.4, 3.3, '#2f4f7f'), 0, 0.2, 0));
  g.add(at(box(6.3, 0.2, 3.5, '#d8cdb8'), 0, 3.1, 0)); g.add(at(box(1.0, 2.0, 0.06, '#3a3d42'), 1.6, 1.0, 1.61));
  for (const x of [-1.6, -0.2]) g.add(at(box(0.9, 0.9, 0.06, '#2a3a4a'), x, 1.7, 1.61));
  const t = tex(1024, 128, (x, W, H) => { x.fillStyle = '#2f4f7f'; x.fillRect(0, 0, W, H); x.fillStyle = '#fff'; x.font = '900 64px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, W / 2, H / 2 + 3); });
  const p = plane(5.2, 0.65, t, false); p.position.set(0, 2.6, 1.62); g.add(p);
  return sh(g);
}
// Colourful one/two-storey town houses lining a street.
export function townRow(n = 8, { seed = 1, side = 1, cols = ['#e2b07a', '#d98a6a', '#e8d0a0', '#9fc0b0', '#e0a0a0', '#c8b0d8', '#f0d890', '#a8c8e0'] } = {}) {
  const g = new THREE.Group(), r = rng(seed); let x = 0;
  for (let i = 0; i < n; i++) {
    const w = 3 + r() * 1.6, h = r() < 0.4 ? 5.4 : 3.2, c = cols[Math.floor(r() * cols.length)];
    const b = new THREE.Group(); b.add(at(box(w, h, 3, c), 0, h / 2, 0)); b.add(at(box(w + 0.05, 0.4, 3.05, '#f2ead8'), 0, 0.2, 0));
    b.add(at(box(w + 0.1, 0.16, 3.1, '#e8dcc6'), 0, h + 0.08, 0));
    b.add(at(box(0.9, 2.0, 0.05, ['#5a3a24', '#2f4f6f', '#6a2a24'][i % 3]), -w / 2 + 0.9, 1.0, 1.51));
    b.add(at(box(0.8, 0.9, 0.05, '#2a2320'), w / 2 - 0.9, 1.7, 1.51)); if (h > 4) for (let k = 0; k < 2; k++) b.add(at(box(0.7, 1.0, 0.05, '#2a2320'), -w / 2 + 0.9 + k * (w - 1.8), 4.0, 1.51));
    b.position.set(x + w / 2, 0, 0); g.add(b); x += w + 0.02;
  }
  g.length = x; g.children.forEach(c => (c.position.x -= x / 2));
  return sh(g);
}
