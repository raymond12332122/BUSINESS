// Gestures for the Second World War video: everything from the what-if video (all on motion.stand(), so bodies keep
// breathing and shifting weight) plus looking up at the sky, marching with a slung rifle, aiming, crouching, typing,
// riveting, mourning and lighting candles.
import * as M from '../lib/motion.js';
export * from '../whatif/anim.js';
const { sin, cos, max, min, abs, PI } = Math;
const { ss, clamp, HAND } = M;
const nz = (t, f, ph) => sin(t * f + ph);
const withArms = (p, a) => Object.assign(p, a);
const add = (v, d) => [(v?.[0] || 0) + d[0], (v?.[1] || 0) + d[1], (v?.[2] || 0) + d[2]];

// Looking up at the sky (searchlights, bombers): head and chest tilt back; k = 0..1.
export function lookUp(t, seed = 0, k = 1, o = {}) {
  const p = M.stand(t, seed, { amt: 0.5, ...o });
  p.head = add(p.head, [-28 * k + 3 * nz(t, 0.7, seed), 6 * nz(t, 0.4, seed + 1) * k, 0]); p.chest = add(p.chest, [-6 * k, 0, 0]); return p;
}
// Holding a child's hand (side 'L' or 'R') while standing: the arm hangs down and slightly out.
export function holdHand(t, seed = 0, side = 'L', o = {}) {
  const p = M.stand(t, seed, { amt: 0.5, ...o }), sx = side === 'L' ? 1 : -1;
  p['a' + side] = [sx * 0.55, -0.15, 0.35]; p['h' + side] = HAND.soft; p['pl' + side] = [sx, -0.2, -0.6]; return p;
}
// Marching (rifle slung on the back): a firm gait with a strong arm swing; D = distance walked in body units.
export function march(D, seed = 0, amp = 1) { return M.gait(D, { amp, seed, stride: 1.05 }); }
// Crouched behind cover, peeking; k = 0..1 (legs fold, chest leans in).
export function crouch(t, seed = 0, k = 1, o = {}) {
  const p = M.stand(t, seed, { amt: 0.4, ...o });
  p.lift = -0.22 * k; p.fL = [0.05, 0, 0.12 * k]; p.fR = [-0.05, 0, -0.06 * k]; p.waist = add(p.waist, [22 * k, 0, 0]); p.chest = add(p.chest, [10 * k, 0, 0]); p.head = add(p.head, [-14 * k, 0, 0]);
  return p;
}
// Hands on a desk in front (typing, Morse key, Enigma keyboard): fingers tap on a rhythm; seated callers combine with seated().
export function typeKeys(t, seed = 0, k = 1, o = {}) {
  const p = M.stand(t, seed, { amt: 0.4, ...o }), a = 0.012 * sin(t * 17 + seed), b = 0.012 * sin(t * 15 + seed + 1.3);
  return withArms(p, { aL: [0.16, 0.33 + a, 1.65], aR: [-0.16, 0.33 + b, 1.65], aWL: k, aWR: k, plL: [1, -1, 0], plR: [-1, -1, 0], hL: HAND.relax, hR: HAND.relax, head: add(p.head, [12 * k, 0, 0]) });
}
// Riveting overhead/forward: both hands hold the rivet gun forward at chest height and judder.
export function rivet(t, seed = 0, k = 1, o = {}) {
  const p = M.stand(t, seed, { amt: 0.5, wide: 1.2, ...o }), j = 0.008 * sin(t * 47 + seed);
  return withArms(p, { aL: [0.08, 0.55 + j, 1.85], aR: [-0.14, 0.5 + j, 1.7], aWL: k, aWR: k, plL: [1, -0.6, 0], plR: [-1, -0.6, 0], hL: HAND.grip, hR: HAND.grip });
}
// Head bowed, hands clasped in front (mourning, remembrance).
export function mourn(t, seed = 0, k = 1, o = {}) {
  const p = M.stand(t, seed, { amt: 0.35, ...o });
  return withArms(p, { aL: [0.05, 0.12, 1.25], aR: [-0.05, 0.1, 1.25], aWL: k, aWR: k, plL: [1, -1, 0], plR: [-1, -1, 0], hL: HAND.soft, hR: HAND.soft, head: add(p.head, [24 * k, 0, 0]), chest: add(p.chest, [4 * k, 0, 0]) });
}
// Bending down to set something on the ground (a candle, a stone, a flower); k = 0..1 down, the right hand reaches low.
export function setDown(t, seed = 0, k = 1, o = {}) {
  const p = M.stand(t, seed, { amt: 0.3, ...o });
  p.lift = -0.18 * k; p.fL = [0.04, 0, 0.1 * k]; p.waist = add(p.waist, [34 * k, 0, 0]); p.chest = add(p.chest, [16 * k, 0, 0]); p.head = add(p.head, [10 * k, 0, 0]);
  p.aR = [-0.12, -0.25 - 0.25 * k, 1.9]; p.aWR = k; p.plR = [-1, -0.6, 0]; p.hR = HAND.pinch; return p;
}
// Victory sign with the right hand raised (Churchill), e = 0..1.
export function vSign(t, seed = 0, e = 1, o = {}) {
  const p = M.stand(t, seed, { amt: 0.6, ...o });
  return withArms(p, { aR: ['head', -0.55, 0.15, 0.55], aWR: e, plR: [-1, -0.4, -0.2], hR: HAND.peace, head: add(p.head, [-4 * e, -6 * e, 0]) });
}
// Arms raised in celebration with a slight bounce (liberation, V-E Day): use whatif cheer() for the bounce.
// Saluting the flag at attention: whatif salute().
