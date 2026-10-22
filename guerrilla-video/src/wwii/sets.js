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
  for (let i = 0; i < 5; i++) { const b = NP.building(7, 9 + (i % 3) * 2, 6, cols[i % 4], { seed: i }); b.position.set(-14 + i * 7.2, 0, -9); s.add(b); }
  const front = LP.at(LP.box(9, 4.4, 0.4, '#5a4a3a'), 0, 2.2, -5.8); s.add(front);
  const sign = RP.signBoard('SOPA GRATIS · DESEMPLEADOS', { w: 5.2, h: 0.62, bg: '#26201a', fg: '#f0e6c8', border: '#a08a5a' }); sign.position.set(0, 3.55, -5.55); s.add(sign);
  s.add(LP.at(LP.box(1.4, 2.6, 0.1, '#2a2018'), -2.4, 1.3, -5.55));
  for (const x of [-3.9, 3.9]) { const w = LP.at(LP.box(1.8, 1.6, 0.06, '#3a4450'), x, 1.6, -5.56); s.add(w); }
  const table = LP.at(LP.box(1.6, 0.06, 0.7, '#6a4a2e'), 0.6, 0.62, -4.6); s.add(table);
  for (const x of [-0.1, 1.3]) for (const z of [-4.85, -4.35]) s.add(LP.at(LP.box(0.06, 0.6, 0.06, '#4a3420'), x, 0.3, z));
  s.add(LP.at(LP.cyl(0.26, 0.24, 0.36, '#5a5e62', 16), 0.3, 0.83, -4.6)); s.add(LP.at(LP.cyl(0.27, 0.27, 0.03, '#3a3e42', 16), 0.3, 1.02, -4.6));
  for (let i = 0; i < 6; i++) s.add(LP.at(LP.cyl(0.07, 0.06, 0.06, '#e8e2d4', 10), 0.9 + (i % 3) * 0.16, 0.68, -4.75 + Math.floor(i / 3) * 0.2));
  for (const x of [-7, 7]) { const l = LP.at(LP.cyl(0.06, 0.08, 3.6, '#2a2a2e', 8), x, 1.8, -4.2); s.add(l); }
  const paper = RP.newspapers('CRISIS', 1); paper.position.set(-1.6, 0.0, -1.2); paper.rotation.y = 0.5; s.add(paper);
  LK.outdoor(s, 'overcast', { kind: 'cobble', noGrass: true });
  return s;
}

// ------------------------------------------------------------ the dictators' tribune (dark, red backlight)
// Three plinths under spotlights in front of a red-lit wall; scenes stand the silhouettes on them.
export function tribune() {
  const s = WS.wStage('night', ['#141416', '#121214'], { groundSize: 120 });
  s.background = new THREE.Color('#07070a'); if (s.fog) { s.fog.color.set('#0a0a0e'); s.fog.near = 30; s.fog.far = 90; }
  const wallTex = P.OLD ? null : null;
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 26), new THREE.MeshBasicMaterial({ map: (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d');
    const g = x.createRadialGradient(256, 150, 10, 256, 150, 300); g.addColorStop(0, '#7a1a14'); g.addColorStop(0.5, '#3a0c0a'); g.addColorStop(1, '#0a0606'); x.fillStyle = g; x.fillRect(0, 0, 512, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })(), toneMapped: false }));
  wall.position.set(0, 11, -14); s.add(wall);
  s.plinths = [-5.2, 0, 5.2].map((x, i) => { const p = LP.at(LP.box(2.6, 1.2 + (i === 1 ? 0.6 : 0), 1.8, '#1c1c20'), x, (1.2 + (i === 1 ? 0.6 : 0)) / 2, -6); s.add(p); p.top = 1.2 + (i === 1 ? 0.6 : 0); p.x = x; return p; });
  s.spots = s.plinths.map(p => { const l = new THREE.SpotLight('#ff4a30', 60, 30, 0.45, 0.6, 1.2); l.position.set(p.x, 14, -2); l.target.position.set(p.x, p.top, -6); s.add(l, l.target); l.intensity = 0; return l; });
  const fill = new THREE.PointLight('#ff6040', 8, 30, 1.2); fill.position.set(0, 6, 4); s.add(fill);
  return s;
}
