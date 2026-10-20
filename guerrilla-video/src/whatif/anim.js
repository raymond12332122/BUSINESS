// Gestures for the what-if video, all built on motion.stand() so the body keeps breathing and shifting its weight
// while the arms act. Contact poses (arms folded, hands on hips, hand on heart) aim slightly into the body and let
// motion.js's collision settle the hands on its surface, so they fit every body shape.
import * as M from '../lib/motion.js';
export { stand, gait, travel, mix, seq, blink, talkJaw, HAND } from '../lib/motion.js';
const { sin, cos, max, min, abs, PI } = Math;
const { ss, clamp, HAND } = M;
const nz = (t, f, ph) => sin(t * f + ph);
const withArms = (p, a) => Object.assign(p, a);

// Arms folded across the chest (Sirius' default).
export function crossArms(t, seed = 0, o = {}) {
  const p = M.stand(t, seed, { amt: 0.8, ...o }), b = sin(t * 1.5 + seed);
  return withArms(p, { aL: [-0.62, 0.6 + 0.01 * b, 1.25], aR: [0.6, 0.55 + 0.01 * b, 1.5], plL: [1, -0.45, 0.15], plR: [-1, -0.45, 0.15], hL: HAND.soft, hR: HAND.relax,
    chest: [p.chest[0] - 2, p.chest[1], p.chest[2]] });
}
// Hands on the hips.
export function handsOnHips(t, seed = 0, o = {}) {
  const p = M.stand(t, seed, { amt: 0.8, wide: 1.5, ...o });
  return withArms(p, { aL: [1.25, 0.14, 0.05], aR: [-1.25, 0.14, 0.05], plL: [1, 0, -0.75], plR: [-1, 0, -0.75], hL: HAND.flat, hR: HAND.flat, chest: [p.chest[0] - 3, p.chest[1], p.chest[2]] });
}
// Hand on the heart (sincere promise) — side 'R' by default; k 0..1.
export function handOnHeart(t, seed = 0, k = 1, o = {}) {
  const p = M.stand(t, seed, { amt: 0.7, ...o });
  return withArms(p, { aR: [0.3, 0.62, 1.3], aWR: k, plR: [-0.8, -1, 0], hR: M.mix({ h: HAND.relax }, { h: HAND.flat }, k).h, head: [p.head[0] + 4 * k, p.head[1], p.head[2]] });
}
// Talking with beat gestures; e = energy 0..1. Hands come up in front, open on stressed beats, the head nods.
export function talk(t, seed = 0, e = 0.6, o = {}) {
  const p = M.stand(t, seed, { amt: 0.7, ...o });
  const b1 = 0.5 + 0.5 * nz(t, 3.1, seed), b2 = 0.5 + 0.5 * nz(t, 2.3, seed + 2), beat = max(0, nz(t, 5.2, seed * 3)) ** 2;
  const lift = e * (0.55 + 0.45 * nz(t, 0.7, seed + 1));
  return withArms(p, {
    armL: [-18 - 30 * lift * b2, -20 * lift, -78 + 10 * lift], armR: [-22 - 34 * lift * b1, 22 * lift, 78 - 12 * lift],
    elbL: [0, -30 - 60 * lift * b2, 0], elbR: [0, 34 + 64 * lift * b1, 0],
    hL: M.mix({ h: HAND.relax }, { h: HAND.open }, lift * b2).h, hR: M.mix({ h: HAND.relax }, { h: HAND.open }, lift * (0.4 + 0.6 * beat)).h,
    head: [p.head[0] + 4 * beat * e, p.head[1] + 6 * nz(t, 0.9, seed) * e, p.head[2]], chest: [p.chest[0], p.chest[1] + 4 * nz(t, 0.8, seed + 1) * e, p.chest[2]],
  });
}
// Oratory at a podium: right hand gestures out over the audience, left rests forward.
export function orate(t, seed = 0, e = 0.8, o = {}) {
  const p = M.stand(t, seed, { amt: 0.6, ...o }), sw = nz(t, 1.3, seed), beat = max(0, nz(t, 4.4, seed)) ** 2;
  return withArms(p, { armR: [-62 - 14 * beat * e, -10 + 24 * sw * e, 62], elbR: [0, 38 - 14 * beat, 0], hR: HAND.open,
    armL: [-40, -16, -74], elbL: [0, -60, 0], hL: HAND.relax, head: [p.head[0] - 3, p.head[1] + 10 * sw * e, p.head[2]] });
}
// Pointing: yaw (deg, + to her left), elev (deg above horizontal).
export function point(t, seed = 0, yaw = 0, elev = 0, side = 'R', o = {}) {
  const p = M.stand(t, seed, { amt: 0.6, ...o });
  if (side === 'R') withArms(p, { armR: [-92 - elev, yaw, 90], elbR: [0, 8, 0], hR: HAND.point });
  else withArms(p, { armL: [-92 - elev, yaw, -90], elbL: [0, -8, 0], hL: HAND.point });
  p.head = [-elev * 0.5, yaw * 0.7, 0]; p.chest = [p.chest[0], p.chest[1] + yaw * 0.15, p.chest[2]];
  return p;
}
// Wave hello/goodbye.
export function wave(t, seed = 0, side = 'R', o = {}) {
  const p = M.stand(t, seed, { amt: 0.7, ...o }), w = sin(t * 8 + seed);
  if (side === 'R' || side === 'both') withArms(p, { armR: [-12, 0, -18], elbR: [0, 10, -72 - 22 * w], hR: HAND.open });
  if (side === 'L' || side === 'both') withArms(p, { armL: [-12, 0, 18], elbL: [0, -10, 72 + 22 * w], hL: HAND.open });
  p.head = [p.head[0] - 3, p.head[1], p.head[2] + 5]; return p;
}
// Cheer: arms up and a little hop (u = how high the hop is right now, from hop()).
export function cheer(t, seed = 0, o = {}) {
  const p = M.stand(t, seed, { amt: 0.5, ...o }), ph = t * 2 * PI * 1.5 + seed, up = abs(sin(ph));
  withArms(p, { armL: [-10, 0, 38 + 12 * up], armR: [-10, 0, -38 - 12 * up], elbL: [0, -14, 20], elbR: [0, 14, -20], hL: HAND.fist, hR: HAND.fist });
  p.head = [-8, p.head[1] * 0.5, 5 * sin(ph)]; p.hipY = p.hipY - 0.012 * (1 - up); p.sec = { bob: up - 0.5, sway: 0, wind: 0 };
  p.lift = 0.05 * max(0, sin(ph)) ** 2; return p;
}
// Shrug.
export function shrug(t, seed = 0, k = 1, o = {}) {
  const p = M.stand(t, seed, { amt: 0.6, ...o });
  return withArms(p, { armL: [-26 * k - 3, 28 * k, -66 + 4 * k], armR: [-26 * k - 3, -28 * k, 66 - 4 * k], elbL: [0, -84 * k - 14, 0], elbR: [0, 84 * k + 14, 0],
    hL: HAND.open, hR: HAND.open, shL: [0, 0, 8 * k], shR: [0, 0, -8 * k], head: [p.head[0], p.head[1], 10 * k] });
}
// Hand to the chin (thinking).
export function think(t, seed = 0, o = {}) {
  const p = crossArms(t, seed, o);
  return withArms(p, { aR: ['head', -0.12, -1.05, 0.85], plR: [-0.5, -1, 0.2], hR: HAND.pinch, head: [p.head[0] + 6, p.head[1] * 0.5, -6] });
}
// Phone held to the right ear.
export function phone(t, seed = 0, o = {}) {
  const p = M.stand(t, seed, { amt: 0.7, ...o });
  return withArms(p, { aR: ['head', -1.1, -0.75, 0.15], plR: [-1, -0.9, 0.1], hR: HAND.grip, head: [p.head[0] + 3, p.head[1] * 0.5, -8 + p.head[2] * 0.3] });
}
// Polite bow (k 0..1).
export function bow(t, seed = 0, k = 1, o = {}) {
  const p = M.stand(t, seed, { amt: 0.4, ...o });
  return withArms(p, { waist: [26 * k, 0, 0], chest: [12 * k, 0, 0], head: [10 * k, 0, 0], hipZ: -0.012 * k, armL: [-18 * k, -20 * k, -82], armR: [-18 * k, 20 * k, 82], elbL: [0, -30 * k - 10, 0], elbR: [0, 30 * k + 10, 0] });
}
// Clap hands in front of the chest.
export function clap(t, seed = 0, rate = 3, o = {}) {
  const p = M.stand(t, seed, { amt: 0.6, ...o }), c = 0.5 + 0.5 * cos(t * rate * 2 * PI);
  return withArms(p, { aL: [0.22 + 0.5 * c, 0.66, 1.7], aR: [-0.22 - 0.5 * c, 0.66, 1.7], plL: [1, -1, 0], plR: [-1, -1, 0], hL: HAND.flat, hR: HAND.flat });
}
// Hands clasped at the chest, bouncing (Agnes overwhelmed with joy).
export function fangirl(t, seed = 0, o = {}) {
  const p = M.stand(t, seed, { amt: 0.4, ...o }), b = abs(sin(t * 7 + seed));
  withArms(p, { aL: [0.14, 0.74, 1.35], aR: [-0.14, 0.74, 1.35], plL: [1, -1, -0.1], plR: [-1, -1, -0.1], hL: HAND.soft, hR: HAND.soft });
  p.hipY += 0.012 * b; p.head = [-6, 8 * sin(t * 3), 7 * sin(t * 5)]; p.sec = { bob: b - 0.5, sway: 0.3 * sin(t * 3), wind: 0 }; return p;
}
// A speech at a microphone held in the right hand.
export function sing(t, seed = 0, e = 0.8, o = {}) {
  const p = M.stand(t, seed, { amt: 0.6, ...o }), sw = nz(t, 1.1, seed);
  return withArms(p, { aR: ['head', -0.25, -0.95, 1.25], plR: [-1, -1, 0], hR: HAND.grip, armL: [-30 - 30 * e * (0.5 + 0.5 * sw), -20, -60 + 20 * e], elbL: [0, -40, 0], hL: HAND.open,
    head: [p.head[0] - 4, p.head[1] * 0.4 + 6 * sw * e, p.head[2]] });
}
// Seated on a chair (seat height relative to the knee is handled by seatAt()); arms on the lap or a desk.
export function sit(t, seed = 0, o = {}) {
  const p = M.stand(t, seed, { amt: 0.4, ...o });
  return withArms(p, { hipY: -0.098, hipZ: -0.045, fL: [0.005, 0, 0.06], fR: [-0.005, 0, 0.06], hip: [0, 0, 0], waist: [-2, p.waist[1], 0], chest: [4, p.chest[1], p.chest[2] * 0.3],
    armL: [-46, -10, -76], armR: [-46, 10, 76], elbL: [0, -44, 0], elbR: [0, 44, 0], fyL: 4, fyR: -4, sec: { bob: 0, sway: 0, wind: 0 } });
}
// Stamping a document at a desk while seated: u = 0..1 within one stamp (lift, press, lift).
export function stamp(t, seed = 0, u = 0, o = {}) {
  const p = sit(t, seed, o), press = ss(0.35, 0.5, u) * (1 - ss(0.62, 0.85, u)), lift = 1 - press;
  return withArms(p, { armR: [-52 - 10 * lift, 16, 70 - 8 * lift], elbR: [0, 66 - 28 * press + 10 * lift, 0], hR: HAND.grip, armL: [-56, -14, -72], elbL: [0, -70, 0], hL: HAND.flat,
    chest: [8 + 4 * press, p.chest[1], 0], head: [16, 0, 0] });
}
// High savate kick with the right leg (u = 0..1 over one kick).
export function kick(t, seed = 0, u = 0, o = {}) {
  const p = M.stand(t, seed, { amt: 0.3, ...o }), k = ss(0.1, 0.4, u) * (1 - ss(0.62, 0.95, u));
  return withArms(p, { fR: [-0.02 * k, 0.17 * k, 0.15 * k], heelL: 8 * k, hip: [0, -18 * k, 10 * k], waist: [-14 * k, -10 * k, -12 * k], chest: [-6 * k, -8 * k, -6 * k], hipX: 0.012 * k, hipY: -0.006 - 0.008 * k,
    head: [6 * k, 14 * k, 6 * k], armL: [-60 * k, -20, -50 - 20 * k], armR: [30 * k, 20, 58 + 18 * k], elbL: [0, -90 * k, 0], elbR: [0, 50 * k, 0], hL: HAND.fist, hR: HAND.fist, fyL: 6 + 40 * k });
}
// Military salute: right hand flat at the brow.
export function salute(t, seed = 0, k = 1, o = {}) {
  const p = M.stand(t, seed, { amt: 0.3, ...o });
  return withArms(p, { aR: ['head', -0.55, 0.45, 0.9], aWR: k, plR: [-1, 0.1, 0.2], hR: HAND.flat, head: [p.head[0] - 2, p.head[1] * 0.3, p.head[2] * 0.3] });
}
// Yawn: arms stretch up and out, head back (sleepy cabinet at 6 a.m.).
export function yawn(t, seed = 0, k = 1, o = {}) {
  const p = M.stand(t, seed, { amt: 0.4, ...o });
  return withArms(p, { armL: [-10, 0, -76 + 100 * k], armR: [-10, 0, 76 - 100 * k], elbL: [0, -20 - 30 * k, 0], elbR: [0, 20 + 30 * k, 0], head: [p.head[0] - 14 * k, p.head[1], p.head[2]], chest: [p.chest[0] - 6 * k, 0, 0], hL: HAND.open, hR: HAND.open });
}
// Seated talk at a table: forearms on the table top, beat gestures with the right hand.
export function sitTalk(t, seed = 0, e = 0.6, o = {}) {
  const p = sit(t, seed, o), beat = Math.max(0, Math.sin(t * 5 + seed)) ** 2, b1 = 0.5 + 0.5 * Math.sin(t * 3.1 + seed);
  return withArms(p, { armL: [-58, -18, -76], elbL: [0, -64, 0], armR: [-62 - 18 * e * b1, 14, 70], elbR: [0, 54 + 30 * e * b1, 0], hR: M.mix({ h: HAND.relax }, { h: HAND.open }, e * beat).h,
    head: [8 + 4 * beat * e, 10 * Math.sin(t * 0.8 + seed) * e, 0] });
}
