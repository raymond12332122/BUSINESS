// Sets for the Second World War video. Many rooms and landscapes come from the earlier videos (Versailles, the treaty
// room, the Mexican president's office, the Chamber of Deputies, the Oval Office, Dover, the night sea, the snow
// plain, the codebreakers' room, the war cemetery) and are dressed here for 1939-45; the rest is built below.
import * as THREE from 'three';
import * as LP from '../lib/props.js';
import * as WS from '../whatif/sets.js';
import * as W1 from '../ww1/sets.js';
import * as P from './props.js';
import * as LK from '../amer/look.js';
export const { bakeAll } = W1;
export { WS, W1 };
const ticker = s => { s.ticks = s.ticks || []; if (!s.tick) s.tick = t => s.ticks.forEach(f => f(t)); return s.ticks; };

// ------------------------------------------------------------ London in the Blitz (night)
// A blacked-out street of brick terraces running away from the camera (-z), St Paul's dome and Big Ben on the
// skyline, searchlights sweeping, barrage balloons, bombers overhead and fires glowing on the horizon.
export function blitzNight() {
  const s = WS.wStage('nightCity', ['#25262b', '#212226'], { groundSize: 260 });
  if (s.fog) { s.fog.color.set('#1c2234'); s.fog.near = 40; s.fog.far = 210; }
  P.stars(s, 700, 320, 5);
  const road = LP.at(LP.box(7, 0.02, 120, '#1c1d21'), 0, 0.011, -40); s.add(road);
  for (const x of [-4.6, 4.6]) s.add(LP.at(LP.box(2.2, 0.12, 120, '#3a3b40'), x, 0.06, -40));
  const cols = ['#6a3a2e', '#5a3428', '#74443a', '#5e3a30'];
  for (let i = 0; i < 9; i++) for (const side of [-1, 1]) {
    const w = 9 + (i * 7 % 3), h = 8 + ((i * 5 + (side > 0 ? 2 : 0)) % 4), b = P.terrace(w, h, 6, cols[(i + (side > 0 ? 1 : 0)) % 4], i * 2 + (side > 0 ? 1 : 0));
    b.position.set(side * 9, 0, 6 - i * 11.5); b.rotation.y = -side * Math.PI / 2; s.add(b);
  }
  const sp = P.stPauls(); sp.position.set(-22, 0, -120); sp.scale.setScalar(1.3); s.add(sp);
  const bb = P.bigBen(); bb.position.set(30, 0, -135); s.add(bb);
  s.lights = [[-40, -70, 0.3], [-8, -95, 1.7], [26, -80, 3.1], [55, -60, 4.4]].map(([x, z, ph]) => { const l = P.searchlight(); l.position.set(x, 0, z); s.add(l); l.ph = ph; return l; });
  s.balloons = [[-30, -60, 30], [14, -75, 36], [48, -100, 32], [-55, -110, 40]].map(([x, z, h]) => { const b = P.balloon(h); b.position.set(x, 0, z); s.add(b); return b; });
  s.fires = [[-36, 6, -150, 40], [18, 5, -160, 34], [60, 6, -140, 30], [-70, 4, -130, 26]].map(([x, y, z, k]) => { const g = P.glow('#ff6a20', k, 0.55); g.position.set(x, y, z); s.add(g); return g; });
  const amb = new THREE.PointLight('#ff8a40', 30, 120, 1.4); amb.position.set(0, 18, -150); s.add(amb);
  ticker(s).push(t => {
    s.lights.forEach(l => l.aim(0.5 * Math.sin(t * 0.23 + l.ph) + (l.position.x > 0 ? 0.25 : -0.25), 0.75 + 0.3 * Math.sin(t * 0.31 + l.ph * 1.7)));
    s.balloons.forEach(b => b.bob(t));
    s.fires.forEach((f, i) => { f.material.opacity = 0.45 + 0.15 * Math.sin(t * 3.1 + i * 2) + 0.08 * Math.sin(t * 7.3 + i); });
  });
  return s;
}

// ------------------------------------------------------------ 1929: a breadline outside a soup kitchen (overcast)
import * as NP from '../narco/props.js';
import * as RP from '../rusia/props.js';
export function depression() {
  const s = WS.wStage('overcast', ['#8f8b84', '#85817a'], { groundSize: 180 });
  const cols = ['#9a8f80', '#8a8070', '#a69a88', '#7e776c'];
  for (let i = 0; i < 5; i++) { const b = NP.building(7, 9 + (i % 3) * 2, 6, cols[i % 4], { seed: i }); b.position.set(-14 + i * 7.2, 0, -8.8); s.add(b); }
  // the soup kitchen's shopfront (chibi scale: a door is 1.6 high); the line forms along it, the table at its left end
  s.add(LP.at(LP.box(7.5, 2.7, 0.3, '#5a4a3a'), 0, 1.35, -5.65));
  const sign = RP.signBoard('SOPA GRATIS · DESEMPLEADOS', { w: 3.4, h: 0.42, bg: '#26201a', fg: '#f0e6c8', border: '#a08a5a' }); sign.position.set(-0.4, 1.98, -5.47); s.add(sign);
  s.add(LP.at(LP.box(0.95, 1.7, 0.06, '#3a2a1c'), -2.75, 0.85, -5.49)); s.add(LP.at(LP.box(0.8, 1.58, 0.06, '#241a12'), -2.75, 0.79, -5.46));
  for (const x of [0.35, 2.45]) { s.add(LP.at(LP.box(1.4, 1.0, 0.06, '#2a241c'), x, 1.12, -5.49));
    s.add(LP.at(new THREE.Mesh(new THREE.PlaneGeometry(1.26, 0.86), new THREE.MeshStandardMaterial({ color: '#c8a868', emissive: '#a07838', emissiveIntensity: 0.5, roughness: 0.4 })), x, 1.12, -5.455)); }
  // trestle table with the pot and the bowls
  const T = s.table = { x: -1.3, z: -4.72, top: 0.41 };
  s.add(LP.at(LP.box(1.1, 0.04, 0.42, '#6a4a2e'), T.x, T.top - 0.02, T.z));
  for (const dx of [-0.5, 0.5]) for (const dz of [-0.17, 0.17]) s.add(LP.at(LP.box(0.035, T.top - 0.04, 0.035, '#4a3420'), T.x + dx, (T.top - 0.04) / 2, T.z + dz));
  s.pot = [T.x + 0.3, T.top, T.z - 0.04];
  s.add(LP.at(LP.cyl(0.15, 0.14, 0.2, '#5a5e62', 18), s.pot[0], T.top + 0.1, s.pot[2])); s.add(LP.at(LP.cyl(0.135, 0.135, 0.01, '#8a5a2a', 18), s.pot[0], T.top + 0.18, s.pot[2]));
  for (let i = 0; i < 4; i++) s.add(LP.at(LP.cyl(0.05, 0.04, 0.035, '#e8e2d4', 12), T.x - 0.4 + (i % 2) * 0.13, T.top + 0.018, T.z - 0.08 + Math.floor(i / 2) * 0.14));
  for (const x of [-4.2, 4.2]) { s.add(LP.at(LP.cyl(0.04, 0.06, 2.8, '#2a2a2e', 8), x, 1.4, -4.3)); s.add(LP.at(LP.cyl(0.13, 0.1, 0.22, '#3a3a3e', 8), x, 2.86, -4.3)); }
  const paper = RP.newspapers('CRISIS', 1); paper.position.set(-0.6, 0.0, -3.4); paper.rotation.y = 0.5; s.add(paper);
  LK.outdoor(s, 'overcast', { kind: 'cobble', noGrass: true });
  return s;
}

// ------------------------------------------------------------ the dictators' tribune (dark, red backlight)
// Three plinths under spotlights in front of a red-lit wall; scenes stand the silhouettes on them.
export function tribune() {
  const s = WS.wStage('night', ['#141416', '#121214'], { groundSize: 120 });
  s.background = new THREE.Color('#07070a'); if (s.fog) { s.fog.color.set('#0a0a0e'); s.fog.near = 30; s.fog.far = 90; }
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 26), new THREE.MeshBasicMaterial({ map: (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d');
    const g = x.createRadialGradient(256, 150, 10, 256, 150, 300); g.addColorStop(0, '#7a1a14'); g.addColorStop(0.5, '#3a0c0a'); g.addColorStop(1, '#0a0606'); x.fillStyle = g; x.fillRect(0, 0, 512, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })(), toneMapped: false }));
  wall.position.set(0, 11, -14); s.add(wall);
  s.plinths = [-5.2, 0, 5.2].map((x, i) => { const p = LP.at(LP.box(2.6, 1.2 + (i === 1 ? 0.6 : 0), 1.8, '#1c1c20'), x, (1.2 + (i === 1 ? 0.6 : 0)) / 2, -6); s.add(p); p.top = 1.2 + (i === 1 ? 0.6 : 0); p.x = x; return p; });
  s.spots = s.plinths.map(p => { const l = new THREE.SpotLight('#ff4a30', 60, 30, 0.45, 0.6, 1.2); l.position.set(p.x, 14, -2); l.target.position.set(p.x, p.top, -6); s.add(l, l.target); l.intensity = 0; return l; });
  const fill = new THREE.PointLight('#ff6040', 8, 30, 1.2); fill.position.set(0, 6, 4); s.add(fill);
  // visible stage beams falling on each plinth (scenes fade them in with the spots: s.beams[i].set(k))
  const tex = (() => { const c = document.createElement('canvas'); c.width = 4; c.height = 128; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.6, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0.12)'); x.fillStyle = g; x.fillRect(0, 0, 4, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  s.beams = s.plinths.map(p => { const h = 11, m = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 1.7, h, 28, 1, true), new THREE.MeshBasicMaterial({ map: tex, color: '#ff9a7a', transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }));
    m.position.set(p.x, p.top + h / 2, -6); m.userData.dynamic = true; s.add(m);
    const pool = new THREE.Mesh(new THREE.CircleGeometry(1.5, 32), new THREE.MeshBasicMaterial({ color: '#ff8a6a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    pool.rotation.x = -Math.PI / 2; pool.position.set(p.x, p.top + 0.01, -6); pool.userData.dynamic = true; s.add(pool);
    m.set = k => { m.visible = pool.visible = k > 0.01; m.material.opacity = 0.32 * k; pool.material.opacity = 0.45 * k; }; m.set(0); return m; });
  return s;
}

// ------------------------------------------------------------ QA: the three tanks side by side on a plain ground
export function tankRow(d = 0) {
  const s = WS.wStage('day', ['#9a9686', '#8f8b7c'], { groundSize: 80 });
  ['pz4', 't34', 'sherman'].forEach((k, i) => { const tk = P.tank(k); tk.position.set(-4 + i * 4, 0, 0); tk.rotation.y = 0.6; tk.drive(d); s.add(tk); });
  return s;
}
