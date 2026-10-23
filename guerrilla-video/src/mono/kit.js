// Rudolf's repertoire for the night briefing, the figurines on the war table and the 2D overlays of the short.
// Poses build on motion.stand, so she keeps breathing and shifting her weight while her hands work.
import * as THREE from 'three';
import * as M from '../lib/motion.js';
import * as WK from '../whatif/kit.js';
import * as P from './props.js';
import { HOST } from './sets.js';
const { ss, clamp, HAND } = M;
export { ss, clamp };
export const mix = M.mix;
const nz = (t, f, ph) => Math.sin(t * f + ph);
export const TOP = P.TABLE.H + 0.004;   // world height of the table top (where the city stands)

export function host(set, x = HOST[0], z = HOST[2], yaw = 0) { return WK.leader(set, 'rudolf', x, z, yaw); }
export const act = WK.act;

// Calm villain stance: hands clasped behind the back, chin a little up.
export function behind(t, seed = 0, o = {}) {
  const p = M.stand(t, seed, { amt: 0.55, ...o });
  return Object.assign(p, { aL: [0.3, 0.1, -1.25], aR: [-0.3, 0.1, -1.25], plL: [1, -0.4, -0.6], plR: [-1, -0.4, -0.6], hL: HAND.soft, hR: HAND.relax,
    chest: [p.chest[0] - 2, p.chest[1], p.chest[2]], head: [p.head[0] - 3, p.head[1], p.head[2]] });
}
// Fingertips together in front of the chest.
export function steeple(t, seed = 0, o = {}) {
  const p = M.stand(t, seed, { amt: 0.5, ...o }), b = 0.004 * nz(t, 1.4, seed);
  return Object.assign(p, { aL: [0.1, 0.6 + b, 2.2], aR: [-0.1, 0.6 + b, 2.2], plL: [1, -1, -0.2], plR: [-1, -1, -0.2], hL: HAND.open, hR: HAND.open,
    head: [p.head[0] + 3, p.head[1], p.head[2]] });
}
// Both hands on the back edge of the table, leaning over the city; k = how far she leans (0..1).
export function lean(t, seed = 0, k = 1, o = {}) {
  const p = M.stand(t, seed, { amt: 0.35, ...o }), x = HOST[0], z = -P.TABLE.D / 2 + 0.07;
  return Object.assign(p, {
    aL: ['world', x + 0.27, TOP + 0.01, z], aR: ['world', x - 0.27, TOP + 0.01, z], plL: [1, 0.2, -1], plR: [-1, 0.2, -1], hL: HAND.flat, hR: HAND.flat,
    waist: [p.waist[0] + 9 * k, p.waist[1], p.waist[2]], chest: [p.chest[0] + 8 * k, p.chest[1], p.chest[2]], head: [p.head[0] - 12 * k, p.head[1], p.head[2]],
    hipZ: -0.012 * k,
  });
}
// One hand resting on a world point (a piece, the check, the stamp) while the other hangs or rests on the table.
// w blends the reach in and out (0 = arm down).
export function handTo(t, seed, side, pt, w = 1, o = {}) {
  const p = o.base ? o.base(t) : M.stand(t, seed, { amt: 0.4 });
  p['a' + side] = ['world', ...pt]; p['aW' + side] = clamp(w); p['pl' + side] = side === 'R' ? [-1, -0.2, -0.6] : [1, -0.2, -0.6];
  p['h' + side] = o.hand || HAND.pinch;
  if (o.look !== false) { p.look = o.look || pt; p.lookW = 0.8 * clamp(w * 1.5); }
  return p;
}
// Point at a world point with the index finger: the hand goes 60% of the way from her shoulder towards it.
export function pointTo(t, seed, pt, side = 'R', k = 1, o = {}) {
  const p = o.base ? o.base(t) : M.stand(t, seed, { amt: 0.45 });
  const sh = new THREE.Vector3(HOST[0] + (side === 'R' ? -0.17 : 0.17), 1.15, HOST[2] + 0.02), T = new THREE.Vector3(...pt), d = T.clone().sub(sh), L = Math.min(0.42, d.length() * 0.6);
  const hand = sh.clone().add(d.normalize().multiplyScalar(L));
  p['a' + side] = ['world', hand.x, hand.y, hand.z]; p['aW' + side] = clamp(k); p['pl' + side] = side === 'R' ? [-1, -0.6, 0] : [1, -0.6, 0]; p['h' + side] = HAND.point;
  p.look = pt; p.lookW = 0.7 * clamp(k * 1.4);
  return p;
}
// Talking with small, controlled gestures (she never flails).
export function speak(t, seed = 0, e = 0.35, o = {}) {
  const p = M.stand(t, seed, { amt: 0.5, ...o }), b = 0.5 + 0.5 * nz(t, 2.4, seed), beat = Math.max(0, nz(t, 4.1, seed * 3)) ** 2;
  return Object.assign(p, {
    armR: [-30 - 26 * e * b, 18 * e, 76 - 8 * e], elbR: [0, 52 + 40 * e * b, 0], hR: M.mix({ h: HAND.relax }, { h: HAND.open }, e * (0.4 + 0.6 * beat)).h,
    aL: [0.3, 0.1, -1.25], plL: [1, -0.4, -0.6], hL: HAND.soft,
    head: [p.head[0] + 3 * beat * e, p.head[1] + 5 * nz(t, 0.8, seed) * e, p.head[2] + 2], chest: [p.chest[0], p.chest[1] - 4, p.chest[2]],
  });
}
// A raised index finger beside the face ("no se pase"); k blends it in.
export function warn(t, seed = 0, k = 1, o = {}) {
  const p = M.stand(t, seed, { amt: 0.45, ...o });
  return M.mix(p, Object.assign({ ...p }, { armR: [-28, 30, 40], elbR: [0, 118, 0], hR: HAND.point, aL: [0.3, 0.1, -1.25], plL: [1, -0.4, -0.6], hL: HAND.soft,
    head: [p.head[0] + 4, p.head[1] - 6, p.head[2] - 4] }), clamp(k));
}
// Camera position/target framing the CRT screen of set s from distance d (dy lifts the camera, dx slides it).
export function tvShot(s, d = 1.2, dy = 0.05, dx = 0) {
  s.updateMatrixWorld(true);
  const c = new THREE.Vector3(0, 1.26, 0.211).applyMatrix4(s.tv.matrixWorld), n = new THREE.Vector3(0, 0, 1).transformDirection(s.tv.matrixWorld), side = new THREE.Vector3(n.z, 0, -n.x);
  const p = c.clone().addScaledVector(n, d).addScaledVector(side, dx); p.y += dy;
  return { p: p.toArray(), l: c.toArray() };
}
// Caption height per time: lower (under the monitor) inside the given [t0, t1] windows.
export const capLow = wins => t => wins.some(([a, b]) => t >= a && t < b) ? 0.86 : 0.68;
// Face presets: speaking with a thin smile, the smug half-lidded look, a wink, a cold stare.
export const FACE = {
  talk: (on, smile = 0.3) => ({ talk: on ? 0.8 : false, smile }),
  smug: { eye: 'flat', mouth: [0, 0.75] },
  smugTalk: on => ({ eye: 0.35, talk: on ? 0.7 : false, smile: 0.55 }),
  wink: { eye: [1, 0.15], mouth: [0.05, 0.9] },
  cold: { eye: 0.2, mouth: [0, 0] },
};

// A chibi figurine on a black base, standing on the war table (parent = the city group, table-local x, z).
export function figurine(city, who, x, z, yaw = 0, s = 0.062, outfit = 'self') {
  const base = P.pieceBase(0.032); base.position.set(x, 0, z); city.add(base);
  const r = WK.person(city, who, outfit, x, z, yaw, { shadow: false, outline: true });
  r.root.scale.setScalar(s); r.root.position.y = 0.008; r.base = base;
  return r;
}

// Lightning: a quick double flicker after each strike time (0..1).
export const flashes = times => t => times.reduce((m, t0) => { const d = t - t0; if (d < 0 || d > 0.9) return m;
  return Math.max(m, Math.exp(-d * 7) * (0.55 + 0.45 * Math.cos(d * 38)) * (d < 0.05 ? d / 0.05 : 1)); }, 0);
// Turn on the spot from yaw a to yaw b between t0 and t1, stepping (returns the pose; sets the root yaw).
export function turn(r, t, t0, t1, a, b, base) {
  const k = ss(t0, t1, t); r.root.rotation.y = a + (b - a) * k;
  if (k <= 0 || k >= 1) return base(t);
  return M.mix(base(t), M.gait(k * 0.26, { amp: Math.sin(Math.PI * k) * 0.9 }), Math.sin(Math.PI * k));
}

// ------------------------------------------------------------ overlays (1080x1920 layout)
const K = (t, a, b, fi = 0.3, fo = 0.3) => ss(a, a + fi, t) * (1 - ss(b - fo, b, t));
// Camcorder-style timestamp in the corner: 23:47:12 and a blinking dot.
export function stamp(t, label = 'SESIÓN NOCTURNA', clock0 = 23 * 3600 + 47 * 60 + 2) {
  const s = Math.floor(clock0 + t), hh = String(Math.floor(s / 3600) % 24).padStart(2, '0'), mm = String(Math.floor(s / 60) % 60).padStart(2, '0'), sc = String(s % 60).padStart(2, '0');
  return `<div class="vt" style="position:absolute;left:64px;top:92px;font-size:52px;color:#e9e2d0;text-shadow:0 0 8px rgba(0,0,0,.9),3px 3px 0 #000;letter-spacing:.06em">
    <span style="color:#ff3b3b;opacity:${Math.floor(t * 1.6) % 2 ? 0.2 : 1}">●</span> ${label}<br><span style="font-size:44px;opacity:.85">${hh}:${mm}:${sc}</span></div>`;
}
// Gothic title card.
export function title(t, a, b, head, sub = '', { top = 720 } = {}) {
  const k = K(t, a, b, 0.6, 0.5); if (k <= 0) return '';
  return `<div style="position:absolute;left:0;right:0;top:${top}px;text-align:center;opacity:${k}">
    <div class="goth" style="font-size:250px;line-height:1;color:#e3b54c;text-shadow:0 0 30px rgba(255,60,40,.45),0 8px 0 #000">${head}</div>
    ${sub ? `<div class="silk" style="margin-top:26px;font-size:40px;font-weight:700;letter-spacing:.2em;color:#e8dfcd;text-shadow:0 4px 0 #000">${sub}</div>` : ''}</div>`;
}
// A red rubber-stamp word slammed onto the frame.
export function slam(t, a, b, text, { x = 540, y = 760, rot = -8, size = 92, col = '#e0333b' } = {}) {
  if (t < a) return ''; const k = clamp((t - a) / 0.14), out = 1 - ss(b - 0.3, b, t); if (out <= 0) return '';
  const sc = 1 + 0.8 * (1 - k) ** 2;
  return `<div class="silk" style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%) rotate(${rot}deg) scale(${sc});opacity:${Math.min(1, k * 1.5) * out};
    white-space:nowrap;font-size:${size}px;font-weight:700;letter-spacing:.06em;color:${col};border:9px solid ${col};padding:2px 30px;background:rgba(10,4,6,.55);text-shadow:0 0 18px rgba(255,40,40,.5)">${text}</div>`;
}
// Small dossier label (case file tag) near the top.
export function tag(t, a, b, kicker, text, { top = 230, col = '#e3b54c' } = {}) {
  const k = K(t, a, b, 0.35, 0.3); if (k <= 0) return '';
  return `<div style="position:absolute;left:64px;right:64px;top:${top}px;opacity:${k};transform:translateY(${(1 - k) * -14}px)">
    <div class="silk" style="font-size:30px;font-weight:700;letter-spacing:.2em;color:${col};text-shadow:3px 3px 0 #000">${kicker}</div>
    <div class="vt" style="font-size:84px;line-height:1.0;color:#f1e9d8;text-shadow:4px 4px 0 #000">${text}</div></div>`;
}
// Black frame with a pixel "letterbox" fade for cuts to black.
export const black = k => k > 0 ? `<div style="position:absolute;inset:0;background:#000;opacity:${clamp(k).toFixed(3)}"></div>` : '';
