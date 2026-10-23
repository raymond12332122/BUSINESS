// The one set of "Monopolio": the Student Council president's office at a quarter to midnight. Rain on two tall
// windows, moonlight through them, a red Siete Coronas banner, filing cabinets, seven trophies, a banker's lamp,
// a CRT monitor and, in the middle, the war table: a glowing grid with a miniature city where customers are gold motes.
import * as THREE from 'three';
import { at, box, mesh } from '../lib/props.js';
import { canvasTex, motes } from '../amer/look.js';
import { bake } from '../rusia/sets.js';
import * as P from './props.js';
import * as WP from '../whatif/props.js';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });
const R = seed => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const bakeAll = scenes => scenes.forEach(bake);
export const ROOM = { w: 7, d: 7, h: 3.6 };
export const HOST = [0, 0, -0.82];   // where Rudolf stands behind the table, facing +z

function woodTex() {
  return canvasTex(512, 512, (c, W, H) => { const r = R(3); c.fillStyle = '#1b110b'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 4; i++) { const x = i * W / 4; c.fillStyle = '#22150d'; c.fillRect(x + 10, 10, W / 4 - 20, H - 20); c.strokeStyle = '#0e0805'; c.lineWidth = 6; c.strokeRect(x + 10, 10, W / 4 - 20, H - 20);
      c.strokeStyle = 'rgba(120,80,40,0.25)'; c.lineWidth = 2; c.strokeRect(x + 22, 22, W / 4 - 44, H - 44); }
    for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '90,60,30'},0.08)`; c.fillRect(r() * W, r() * H, 1 + r() * 2, 8 + r() * 30); } }, { repeat: [3, 1] });
}
function damaskTex() {
  return canvasTex(256, 256, (c, W, H) => { c.fillStyle = '#0d1424'; c.fillRect(0, 0, W, H); c.fillStyle = 'rgba(70,90,140,0.22)';
    for (const [x, y] of [[W / 2, H / 2], [0, 0], [W, 0], [0, H], [W, H]]) { c.save(); c.translate(x, y); for (let k = 0; k < 6; k++) { c.rotate(Math.PI / 3); c.beginPath(); c.ellipse(0, 26, 10, 26, 0, 0, 7); c.fill(); } c.beginPath(); c.arc(0, 0, 9, 0, 7); c.fill(); c.restore(); } }, { repeat: [10, 3] });
}
function parquetTex() {
  return canvasTex(512, 512, (c, W, H) => { const r = R(9); const n = 8, s = W / n;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const v = 20 + r() * 14; c.fillStyle = `rgb(${v + 12},${v},${v - 8})`; c.fillRect(i * s, j * s, s, s);
      c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 2; if ((i + j) % 2) for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(i * s + k * s / 4, j * s); c.lineTo(i * s + k * s / 4, j * s + s); c.stroke(); } else for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(i * s, j * s + k * s / 4); c.lineTo(i * s + s, j * s + k * s / 4); c.stroke(); }
      c.strokeRect(i * s, j * s, s, s); } }, { repeat: [4, 4] });
}

// Wall with rectangular openings: a plane-ish slab (thickness th) along x at z, from x0 to x1, height h, minus holes [x, y, w, h].
function slab(s, mat, { x0, x1, z, h, th = 0.14, holes = [] }) {
  const xs = [x0, x1, ...holes.flatMap(([x, , w]) => [x - w / 2, x + w / 2])].sort((a, b) => a - b);
  for (let i = 0; i < xs.length - 1; i++) {
    const a = xs[i], b = xs[i + 1], cx = (a + b) / 2, hole = holes.find(([x, , w]) => cx > x - w / 2 && cx < x + w / 2);
    const piece = (y0, y1) => { if (y1 - y0 < 1e-3) return; const m = new THREE.Mesh(new THREE.BoxGeometry(b - a, y1 - y0, th), mat); m.position.set(cx, (y0 + y1) / 2, z); m.castShadow = m.receiveShadow = true; s.add(m); };
    if (!hole) piece(0, h); else { const [, y, , hh] = hole; piece(0, y - hh / 2); piece(y + hh / 2, h); }
  }
}

export function office() {
  const s = new THREE.Scene(), { w, d, h } = ROOM;
  s.background = new THREE.Color('#020308'); s.fog = new THREE.Fog('#03060e', 5, 13);
  const ticks = []; s.tick = t => ticks.forEach(f => f(t));
  // ---- shell
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: parquetTex(), roughness: 0.38, metalness: 0.1 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; s.add(fl);
  const upper = new THREE.MeshStandardMaterial({ map: damaskTex(), roughness: 0.9 }), lower = new THREE.MeshStandardMaterial({ map: woodTex(), roughness: 0.55 });
  slab(s, upper, { x0: -w / 2, x1: w / 2, z: -d / 2, h, holes: [[-1.45, 1.75, 1.1, 2.2], [1.45, 1.75, 1.1, 2.2]] });
  for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(d, h), upper); m.position.set(sx * w / 2, h / 2, 0); m.rotation.y = -sx * Math.PI / 2; m.receiveShadow = true; s.add(m); }
  const front = new THREE.Mesh(new THREE.PlaneGeometry(w, h), upper); front.position.set(0, h / 2, d / 2); front.rotation.y = Math.PI; s.add(front);
  // wainscot on every wall, crown moulding, skirting
  const wain = 1.15;
  for (const [x, z, ry, len] of [[0, -d / 2 + 0.08, 0, w], [0, d / 2 - 0.02, Math.PI, w], [-w / 2 + 0.02, 0, Math.PI / 2, d], [w / 2 - 0.02, 0, -Math.PI / 2, d]]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(len, wain), lower); p.position.set(x, wain / 2, z); p.rotation.y = ry; p.receiveShadow = true; s.add(p);
    const cap = mesh(new THREE.BoxGeometry(len, 0.05, 0.05), std('#2a1a10', { roughness: 0.4 })); cap.position.set(x, wain + 0.02, z); cap.rotation.y = ry; s.add(cap);
    const crown = mesh(new THREE.BoxGeometry(len, 0.14, 0.08), std('#1a120c', { roughness: 0.5 })); crown.position.set(x, h - 0.07, z); crown.rotation.y = ry; s.add(crown);
  }
  // the back-wall panelling is drawn on the slab; cover its lower part with wood too (only between the windows' sills)
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(w, d), std('#07080c', { roughness: 0.9 })); ceil.rotation.x = Math.PI / 2; ceil.position.y = h; s.add(ceil);
  for (let i = -1; i <= 1; i++) s.add(at(box(w, 0.12, 0.18, '#0b0b10'), 0, h - 0.06, i * 1.6));
  // ---- windows with rain and the night city, and the moonlight through them
  s.windows = [-1.45, 1.45].map((x, i) => { const wdw = P.rainWindow(1.1, 2.2, i + 1); wdw.position.set(x, 1.75, -d / 2 - 0.02); s.add(wdw); return wdw; });
  for (const x of [-1.45, 1.45]) { s.add(at(box(1.3, 0.06, 0.24, '#1a110b'), x, 0.63, -d / 2 + 0.1)); }
  const moon = new THREE.DirectionalLight('#7f9cff', 2.4); moon.position.set(-1.2, 5.2, -9.5); moon.target.position.set(0.4, 0, 0.4); moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048); moon.shadow.bias = -0.0005; moon.shadow.normalBias = 0.02;
  Object.assign(moon.shadow.camera, { left: -5, right: 5, top: 6, bottom: -6, near: 1, far: 25 }); s.add(moon, moon.target);
  const hemi = new THREE.HemisphereLight('#24305a', '#07060a', 0.55); s.add(hemi);
  // ---- banner, clock, desk + lamp, cabinets, trophies, monitor, election board, door
  const ban = P.banner(1.0, 1.9); ban.position.set(0, 2.0, -d / 2 + 0.1); s.add(ban); s.banner = ban;
  const red = new THREE.PointLight('#ff2030', 2.4, 4.2, 1.6); red.position.set(0, 1.9, -d / 2 + 0.6); s.add(red); s.redLight = red;
  const clk = P.clock(0.24); clk.position.set(-2.75, 2.75, -d / 2 + 0.1); s.add(clk); s.clock = clk;
  const desk = WP.deskExec({ plate: '' }); desk.position.set(-2.35, 0, -2.55); desk.scale.setScalar(0.8); desk.rotation.y = 0.35; s.add(desk);
  const lamp = P.bankerLamp(); lamp.position.set(-2.55, desk.top * 0.8, -2.45); lamp.rotation.y = 0.35; s.add(lamp); s.lamp = lamp;
  s.desk = desk; s.deskTop = desk.top * 0.8;
  const ch = WP.officeChair('#2a0a0a'); ch.scale.setScalar(0.75); ch.position.set(-2.55, 0, -3.0); ch.rotation.y = 0.35; s.add(ch);
  for (let i = 0; i < 5; i++) { const doc = WP.documentSheet(i + 3); doc.position.set(-2.2 + i * 0.05, desk.top * 0.8 + 0.002 + i * 0.002, -2.4 + i * 0.03); doc.rotation.y = 0.35 + i * 0.1; s.add(doc); }
  s.cabinets = [];
  const labels = [['A-C', 'D-F', 'G-L', 'M-P'], ['Q-S', 'T-V', 'W-Z', '7-A'], ['ADQ-1', 'ADQ-2', 'ADQ-3', 'ADQ-4']];
  labels.forEach((lab, i) => { const cab = P.filingCabinet(lab, i); cab.position.set(w / 2 - 0.34, 0, -2.65 + i * 0.52); cab.rotation.y = -Math.PI / 2; s.add(cab); s.cabinets.push(cab); });
  const shelf = P.trophyShelf(); shelf.position.set(w / 2 - 0.16, 1.95, -2.1); shelf.rotation.y = -Math.PI / 2; s.add(shelf); s.trophies = shelf;
  const tv = P.crt(); tv.position.set(1.35, 0, -0.55); tv.rotation.y = -0.62; s.add(tv); s.tv = tv;
  const board = P.electionBoard(); board.position.set(-w / 2 + 0.03, 1.6, 0.4); board.rotation.y = Math.PI / 2; s.add(board); s.board = board;
  const boardLight = new THREE.SpotLight('#ffe2b0', 0.0, 3, 0.5, 0.7, 1.5); boardLight.position.set(-2.4, 2.8, 0.6); boardLight.target.position.set(-w / 2, 1.6, 0.4); s.add(boardLight, boardLight.target); s.boardLight = boardLight;
  // the door hangs on a hinge (s.door.rotation.y = PI / 2 is shut); behind it, a dim corridor
  const hinge = new THREE.Group(); hinge.position.set(-w / 2 + 0.05, 0, 2.7); hinge.rotation.y = Math.PI / 2; s.add(hinge); hinge.userData.dynamic = true;
  const door = new THREE.Group(); door.position.x = 0.5; hinge.add(door);
  door.add(at(box(1.0, 2.2, 0.06, '#1e130c'), 0, 1.1, 0));
  const glassT = canvasTex(256, 256, (c, W, H) => { c.fillStyle = '#9aa6b4'; c.fillRect(0, 0, W, H); c.fillStyle = '#1a1a1a'; c.font = "700 24px Silkscreen"; c.textAlign = 'center'; c.fillText('PRESIDENCIA', W / 2, H / 2 - 10); c.font = "700 16px Silkscreen"; c.fillText('CONSEJO ESTUDIANTIL', W / 2, H / 2 + 20); });
  const dg = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshStandardMaterial({ map: glassT, roughness: 0.3, transparent: true, opacity: 0.85, side: THREE.DoubleSide })); dg.position.set(0, 1.55, 0.035); door.add(dg);
  door.add(at(mesh(new THREE.SphereGeometry(0.035, 10, 8), std(P.GOLD, { metalness: 0.8, roughness: 0.3 })), 0.38, 1.05, 0.06));
  const voidM = new THREE.MeshBasicMaterial({ color: '#0a0d14' }), corridor = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.2), voidM); corridor.position.set(-w / 2 + 0.015, 1.1, 2.2); corridor.rotation.y = Math.PI / 2; s.add(corridor);
  const jamb = std('#140c07', { roughness: 0.5 }); for (const [y, z, hh, dd] of [[2.25, 2.2, 0.1, 1.2], [1.1, 1.65, 2.3, 0.1], [1.1, 2.75, 2.3, 0.1]]) s.add(at(mesh(new THREE.BoxGeometry(0.1, hh, dd), jamb), -w / 2 + 0.05, y, z));
  s.door = hinge;
  // light from the corridor through the open door (fades as the door shuts)
  const spill = new THREE.SpotLight('#ffd2a0', 0, 9, 0.32, 0.5, 1.2); spill.position.set(-w / 2 - 0.6, 1.9, 2.25); spill.target.position.set(-1.3, 0.9, -2.6); s.add(spill, spill.target); s.spill = spill;
  const corM = corridor.material; corM.color.set('#0a0d14');
  ticks.push(() => { const open = Math.max(0, Math.PI / 2 - hinge.rotation.y) / 0.95; spill.intensity = 14 * open; corM.color.setRGB(0.04 + 0.1 * open, 0.05 + 0.08 * open, 0.08 + 0.05 * open); });
  // ---- the war table and its city
  const tbl = P.warTable(); s.add(tbl); s.table = tbl;
  const city = new THREE.Group(); city.position.y = P.TABLE.H + 0.002; tbl.add(city); s.city = city;
  const tw = P.tower(); tw.position.set(0.55, 0, -0.3); city.add(tw); s.tower = tw;
  const gar = P.garage('PÉTALO'); gar.position.set(-0.6, 0, 0.3); gar.rotation.y = 0.25; city.add(gar); s.garage = gar;
  [[-0.22, -0.38, '#4fd1ff', 3], [0.26, 0.38, '#ff4fd8', 5], [-0.8, -0.36, '#5aff9a', 7], [0.8, 0.36, '#ffb43a', 9], [-0.25, 0.37, '#7a8cff', 11]].forEach(([x, z, col, sd]) => { const sh = P.shop(col, sd, 0.08 + (sd % 3) * 0.02); sh.position.set(x, 0, z); city.add(sh); });
  [[0.25, -0.38, 0.08, 0.08, 0.2], [-0.82, 0.08, 0.07, 0.07, 0.16], [0.82, -0.1, 0.07, 0.07, 0.18], [0.3, 0.06, 0.07, 0.06, 0.14]].forEach(([x, z, bw, bd, bh], i) => { const b = P.block(i + 2, bw, bd, bh); b.position.set(x, 0, z); city.add(b); });
  const reserved = [[0.55, -0.3, 0.17], [-0.6, 0.3, 0.12], [0.44, 0.48, 0.2], [-0.22, -0.38, 0.08], [0.26, 0.38, 0.08], [-0.8, -0.36, 0.08], [0.8, 0.36, 0.08], [-0.25, 0.37, 0.08], [0.25, -0.38, 0.08], [-0.82, 0.08, 0.07], [0.82, -0.1, 0.07], [0.3, 0.06, 0.07], [-0.45, 0.38, 0.06], [0.4, -0.12, 0.05], [-0.6, 0.44, 0.17], [-0.38, 0.33, 0.05], [-0.15, -0.42, 0.05]];
  const homes = [], rr = R(17), T = P.TABLE;
  for (let x = -0.84; x <= 0.84; x += 0.085) for (let z = -0.46; z <= 0.46; z += 0.085) {
    if (T.ave.some(a => Math.abs(x - a) < 0.065) || T.st.some(a => Math.abs(z - a) < 0.065)) continue;
    if (reserved.some(([rx, rz, r]) => Math.hypot(x - rx, z - rz) < r + 0.03) || rr() < 0.25) continue;
    const hs = P.house(homes.length); hs.position.set(x + (rr() - 0.5) * 0.015, 0, z + (rr() - 0.5) * 0.015); hs.rotation.y = Math.floor(rr() * 4) * Math.PI / 2; city.add(hs); homes.push([hs.position.x, hs.position.z]);
  }
  s.homes = homes;
  const led = P.ledCounter('CUOTA DE MERCADO'); led.position.set(0.44, 0, 0.5); led.rotation.y = -0.2; city.add(led); s.led = led;
  const tagUs = P.priceTag('$10', '#f2c14e'); tagUs.position.set(0.4, 0, -0.12); city.add(tagUs); s.tagUs = tagUs;
  const tagThem = P.priceTag('$5', '#ff8ac4'); tagThem.position.set(-0.36, 0, 0.32); city.add(tagThem); s.tagThem = tagThem;
  // the uplight from the table onto the host, and a cool key from the front-left for faces
  // villain lighting: a cold uplight from the table, a warm soft key from the lamp side, a red rim from behind
  const glow = new THREE.SpotLight('#5aa0ff', 1.0, 3.2, 0.32, 0.9, 1.5); glow.position.set(0, P.TABLE.H + 0.06, -0.05); glow.target.position.set(0, 1.5, -0.85); s.add(glow, glow.target); s.tableGlow = glow;
  const cityLight = new THREE.PointLight('#4f8fff', 0.4, 1.5, 1.6); cityLight.position.set(0, P.TABLE.H + 0.75, 0.3); s.add(cityLight); s.cityLight = cityLight;
  const key = new THREE.SpotLight('#ffe2c4', 6, 7, 0.36, 0.85, 1.6); key.position.set(-1.25, 2.35, 1.05); key.target.position.set(0, 1.3, -0.82); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; s.add(key, key.target); s.key = key;
  const rim = new THREE.PointLight('#ff2a3a', 4.5, 1.5, 2); rim.position.set(0.15, 1.7, -1.55); s.add(rim); s.rim = rim;
  // ---- customers: gold motes walking the streets from homes to a shop (the tower or the garage)
  const N = 220, pos = new Float32Array(N * 3), geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dots = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffcf6a', size: 0.016, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending }));
  dots.frustumCulled = false; dots.userData.dynamic = true; city.add(dots); s.dots = dots;
  const H = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const nearAve = x => T.ave.reduce((b, a) => Math.abs(a - x) < Math.abs(b - x) ? a : b), nearSt = z => T.st.reduce((b, a) => Math.abs(a - z) < Math.abs(b - z) ? a : b);
  const path = (from, to) => { const sz = nearSt(from[1]), ax = nearAve(to[0]); return [from, [from[0], sz], [ax, sz], [ax, to[1] > sz ? to[1] - 0.04 : to[1] + 0.04], [to[0], to[1]]]; };
  const along = (pts, u) => { let L = 0; const seg = []; for (let i = 0; i < pts.length - 1; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); seg.push(l); L += l; }
    let dd = u * L; for (let i = 0; i < seg.length; i++) { if (dd <= seg[i] || i === seg.length - 1) { const k = seg[i] ? Math.min(1, dd / seg[i]) : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]; } dd -= seg[i]; } return pts[pts.length - 1]; };
  s.flow = { share: () => 0.1, on: () => 1, lock: () => 0, dests: { us: [0.55, -0.22], them: [-0.6, 0.22] } };
  ticks.push(t => {
    const F = s.flow, on = F.on(t);
    for (let i = 0; i < N; i++) {
      const sp = 0.09 + 0.05 * H(i + 0.5), ph = H(i + 0.25) * 10, k = Math.floor(t * sp + ph), u = t * sp + ph - k;
      const home = homes[Math.floor(H(i * 7.3 + k * 13.1) * homes.length) % homes.length] || [0, 0];
      const tk = (k - ph) / sp, dest = H(i * 3.7 + k * 1.9) < F.share(tk) ? F.dests.them : F.dests.us;
      const lockK = F.lock(t);   // trapped inside the dome: drift in small loops instead of leaving
      let [x, z] = along(path(home, dest), ss(0, 1, u));
      if (lockK > 0) { const a = t * (0.6 + H(i) * 0.6) + i; x = x * (1 - lockK) + (home[0] + 0.03 * Math.cos(a)) * lockK; z = z * (1 - lockK) + (home[1] + 0.03 * Math.sin(a)) * lockK; }
      const vis = on * Math.min(1, u * 8, (1 - u) * 8) > 0.02;
      pos[i * 3] = x; pos[i * 3 + 1] = vis ? 0.012 + 0.004 * Math.sin(t * 6 + i) : -1; pos[i * 3 + 2] = z;
    }
    geo.attributes.position.needsUpdate = true;
  });
  // ---- weather and time: rain, lightning (s.lightning(t) -> 0..1), the clock, a breathing table glow
  s.lightning = () => 0; s.gridK = 1;
  ticks.push(t => {
    const L = s.lightning(t); s.windows.forEach(wd => { wd.tick(t); wd.flash(L); });
    moon.intensity = 2.4 + 9 * L; hemi.intensity = 0.55 + 1.6 * L; s.userData.look.flash = 0.2 * L;
    const sec = 47 * 60 + t; clk.set(23, Math.floor(sec / 60) % 60, sec % 60);
    tbl.topMat.emissiveIntensity = s.gridK * (0.85 + 0.12 * Math.sin(t * 2.1) + 0.05 * Math.sin(t * 13.7));
  });
  const dust = motes(s, [-1.4, 0.85, -1.2, 1.4, 2.2, 1.0], 70, 5); dust.material.color.set('#ffc860'); dust.material.size = 0.012; dust.material.opacity = 0.7;
  s.userData = { look: { bloom: 0.6, bloomT: 0.95, levels: 22, vign: 0.62, rim: 0.55, rimColor: '#8aa8ff', shadeTint: '#6a72a8' }, sun: moon, hemi, interior: true };
  return s;
}
