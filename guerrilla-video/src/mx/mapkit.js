// Map-board helpers for the Revolution video: a lit map set, character tokens, city and state labels.
import * as THREE from 'three';
import * as GM from './geomap.js';
import * as K from './kit.js';
import { stage } from '../lib/stage.js';
import { label } from '../lib/kit.js';
import { ss, clamp } from '../lib/util.js';
import * as F from '../lib/fx.js';

export const preload = GM.preload;
export function mapSet({ railways = true } = {}) {
  const s = stage({ groundA: null, skyTop: '#4a6fa8', skyHor: '#cfe0ea', fog: ['#cfe0ea', 70, 220], sunPos: [6, 18, 10], sun: 2.3, hemi: 1.3, shadow: 30 });
  const map = GM.buildMap({ railways }); s.add(map.group); s.map = map;
  return s;
}
// A character standing on a round faction-coloured base, like a board-game piece.
export const TOKEN = 1.9;
export function token(s, who, outfit, lon, lat, faction, yaw = 0, scale = TOKEN) {
  const g = new THREE.Group(); s.add(g);
  const base = GM.tokenBase(GM.FACTION[faction] || faction); g.add(base);
  const r = K.person(g, who, outfit, 0, 0, yaw); r.root.position.y = 0.12; r.root.scale.setScalar(1);
  g.scale.setScalar(scale); g.r = r; g.setPos = (lo, la) => { const [x, y, z] = GM.pos(lo, la); g.position.set(x, y, z); };
  g.setPos(lon, lat); r.token = g; return r;
}
// City dot + label (label sits above the dot).
export function city(ctx, s, name, k = 1, cls = 'c') {
  const d = s.map.dots[name]; if (d) d.visible = k > 0.01;
  const [lo, la] = GM.CITY[name];
  return label(ctx, GM.pos(lo, la, GM.H + 0.35), name, cls, k);
}
export function stateLabel(ctx, lon, lat, text, k = 1) { return label(ctx, GM.pos(lon, lat, GM.H + 0.05), text, 'st', k); }
export const fade = (t, a, b, f = 0.35) => ss(a, a + f, t) * (1 - ss(b - f, b, t));
export { GM };

// Revolt marker: a flame that pops up with an expanding ring.
export function spark(s, lon, lat, color = '#e8742a') {
  const g = new THREE.Group(); const [x, y, z] = GM.pos(lon, lat); g.position.set(x, y + 0.02, z); s.add(g);
  const ring = F.ring(color, 0.6); g.add(ring);
  const fire = F.bubble('🔥', { bg: null, font: 170 }); fire.center.set(0.5, 0.15); g.add(fire);
  g.update = (t, t0) => {
    const k = t - t0; g.visible = k > 0; if (k <= 0) return;
    const rk = (k % 1.4) / 1.4; ring.scale.setScalar(0.5 + rk * 2.4); ring.material.opacity = 0.8 * (1 - rk);
    const sc = 1.15 * clamp(k / 0.25) * (1 + 0.06 * Math.sin(t * 9 + x)); fire.scale.set(sc, sc, 1);
  };
  g.visible = false; return g;
}
