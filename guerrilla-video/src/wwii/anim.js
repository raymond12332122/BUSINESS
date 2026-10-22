// Gestures for the Second World War video: everything from the what-if video (all on motion.stand(), so bodies keep
// breathing and shifting weight) plus looking up at the sky, marching with a slung rifle, aiming, crouching, typing,
// riveting, mourning and lighting candles.
import * as M from '../lib/motion.js';
import { sit } from '../whatif/anim.js';
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
export function march(D, seed = 0, amp = 1, stride = 1.05) { return M.gait(D, { amp, seed, stride }); }
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

// Seated at a desk, writing: the right hand (pen in a pinch) runs along a line on the sheet at world point P and comes
// back for the next one, the left hand holds the sheet flat, the eyes follow the pen. yaw = the writer's facing.
export function write(t, seed, P, yaw = 0, k = 1) {
  const p = sit(t, seed), rx = -cos(yaw), rz = sin(yaw), bx = -sin(yaw), bz = -cos(yaw);   // her right, and back toward her
  const ln = t * 0.42 + seed * 0.37, u = ln % 1, row = Math.floor(ln) % 3, run = ss(0, 0.86, u) - ss(0.86, 1, u);
  const along = -0.045 + 0.09 * run + 0.004 * sin(t * 23 + seed), back = 0.012 * row + 0.003 * sin(t * 17 + seed), up = 0.035 + 0.006 * max(0, sin(t * 11 + seed)) + 0.02 * ss(0.86, 0.93, u) * (1 - ss(0.95, 1, u));
  const pen = [P[0] + rx * along + bx * back, P[1] + up, P[2] + rz * along + bz * back];
  p.aR = ['world', ...pen]; p.aWR = k; p.plR = [-1, -0.8, -0.3]; p.hR = HAND.pinch;
  p.aL = ['world', P[0] - rx * 0.1 + bx * 0.02, P[1] + 0.03, P[2] - rz * 0.1 + bz * 0.02]; p.aWL = k; p.plL = [1, -0.8, -0.3]; p.hL = HAND.flat;
  p.waist = [p.waist[0] + 10 * k, p.waist[1], p.waist[2]]; p.chest = [p.chest[0] + 8 * k, p.chest[1], p.chest[2]];
  p.look = pen; p.lookW = 0.75 * k; return p;
}
// Standing in a queue with nothing left: shoulders down, head bowed, hands in the coat pockets; k = 0..1.
export function dejected(t, seed = 0, k = 1, o = {}) {
  const p = M.stand(t, seed, { amt: 0.45, speed: 0.6, ...o });
  return withArms(p, { aL: [0.95, 0.02, 0.62], aR: [-0.95, 0.02, 0.62], aWL: k, aWR: k, plL: [1, 0.2, -0.6], plR: [-1, 0.2, -0.6], hL: HAND.relax, hR: HAND.relax,
    head: add(p.head, [18 * k, 0, 0]), chest: add(p.chest, [7 * k, 0, 0]), shL: [0, 0, -4 * k], shR: [0, 0, 4 * k] });
}
// Holding a bowl in both hands in front of the waist (the soup line).
export function holdBowl(t, seed = 0, k = 1, o = {}) {
  const p = M.stand(t, seed, { amt: 0.4, ...o });
  return withArms(p, { aL: [0.2, 0.32, 1.55], aR: [-0.2, 0.32, 1.55], aWL: k, aWR: k, plL: [1, -1, 0], plR: [-1, -1, 0], hL: HAND.soft, hR: HAND.soft, head: add(p.head, [14 * k, 0, 0]) });
}
// Ladling soup: the right hand dips into the pot at world point A and pours at world point B; u = 0..1 within one ladle.
export function ladle(t, seed, A, B, u) {
  const p = M.stand(t, seed, { amt: 0.4 }), s = ss(0.0, 0.3, u) * (1 - ss(0.55, 0.85, u)), arc = sin(Math.PI * ss(0.3, 0.55, u)) * 0.08;
  const w = ss(0.3, 0.55, u) * (1 - ss(0.75, 1, u)), q = [A[0] + (B[0] - A[0]) * w, A[1] + (B[1] - A[1]) * w + arc + 0.04 * (1 - s), A[2] + (B[2] - A[2]) * w];
  return withArms(p, { aR: ['world', ...q], aWR: 1, plR: [-1, -0.6, 0], hR: HAND.grip, aL: [0.25, 0.3, 1.4], aWL: 0.7, plL: [1, -1, 0], hL: HAND.soft, look: q, lookW: 0.5 });
}
// Handshake: the right hand reaches a world point P (between the two people) and pumps; k = 0..1 reach.
export function handshake(t, seed, P, k = 1, pump = 1) {
  const p = M.stand(t, seed, { amt: 0.5 }), y = 0.014 * pump * sin(t * 9 + seed);
  p.aR = ['world', P[0], P[1] + y, P[2]]; p.aWR = k; p.plR = [-1, -0.7, -0.2]; p.hR = HAND.grip; p.chest = add(p.chest, [4 * k, 0, 0]); return p;
}
// Both hands on world points (lifting a bar, holding a rail): A for the left hand, B for the right.
export function hands(t, seed, A, B, k = 1, o = {}) {
  const p = M.stand(t, seed, { amt: 0.4, ...o });
  p.aL = ['world', ...A]; p.aR = ['world', ...B]; p.aWL = k; p.aWR = k; p.plL = [1, -0.5, -0.3]; p.plR = [-1, -0.5, -0.3]; p.hL = HAND.grip; p.hR = HAND.grip; return p;
}
// Seated and leaning toward something (the wireless): chest forward, hands on the knees, head tilted to listen; k = 0..1.
export function listen(t, seed = 0, k = 1) {
  const p = sit(t, seed);
  return withArms(p, { waist: add(p.waist, [10 * k, 0, 0]), chest: add(p.chest, [10 * k, 0, 0]), head: add(p.head, [6 * k, 4 * sin(t * 0.5 + seed), 10 * k]),
    armL: [-40, -14, -70], armR: [-40, 14, 70], elbL: [0, -60, 0], elbR: [0, 60, 0], hL: HAND.soft, hR: HAND.soft });
}
// One hand to the ear (headphones), the other hanging: a tank commander talking on the radio.
export function headset(t, seed = 0, k = 1) {
  const p = M.stand(t, seed, { amt: 0.4 });
  return withArms(p, { aL: ['head', 1.05, -0.2, 0.15], aWL: k, plL: [1, -0.6, 0.2], hL: HAND.soft, head: add(p.head, [-4, -8 * k, 0]) });
}
// Looking through binoculars: both hands at the eyes (the scene places the glasses between the wrists).
export function binoculars(t, seed = 0, k = 1) {
  const p = M.stand(t, seed, { amt: 0.4 });
  return withArms(p, { aL: ['head', 0.3, -0.1, 1.15], aR: ['head', -0.3, -0.1, 1.15], aWL: k, aWR: k, plL: [1, -0.8, -0.2], plR: [-1, -0.8, -0.2], hL: HAND.grip, hR: HAND.grip, head: add(p.head, [-3 * k, 0, 0]) });
}
// Shouldering a rifle equipped with lib/gear HOLDS (the rig's own grips place both hands): body squared to the
// target, cheek to the stock; recoil 0..1 kicks the shoulders back. Use with an outfit that equips the rifle.
export function aimRifle(t, seed = 0, recoil = 0, o = {}) {
  const p = M.stand(t, seed, { amt: 0.3, ...o }), r = recoil;
  p.gun = 'aim'; p.waist = add(p.waist, [6, -8, 0]); p.chest = add(p.chest, [4 - 5 * r, -6, 0]); p.head = [6 - 4 * r, 10, -4];
  delete p.aL; delete p.aR; return p;
}
// Carrying the rifle across the chest (port arms) while moving; mix with a gait for the legs.
export function portRifle(t, seed = 0, o = {}) { const p = M.stand(t, seed, { amt: 0.4, ...o }); p.gun = 'port'; delete p.aL; delete p.aR; return p; }
// Arms wrapped around the body, shoulders up, trembling (the winter of 1941).
export function shiver(t, seed = 0, k = 1, o = {}) {
  const p = M.stand(t, seed, { amt: 0.3, ...o }), j = 0.006 * sin(t * 38 + seed) * k;
  return withArms(p, { aL: [-0.55, 0.62 + j, 1.15], aR: [0.55, 0.58 - j, 1.2], aWL: k, aWR: k, plL: [1, -0.4, 0.2], plR: [-1, -0.4, 0.2], hL: HAND.soft, hR: HAND.soft,
    shL: [0, 0, 10 * k], shR: [0, 0, -10 * k], head: add(p.head, [12 * k + 2 * sin(t * 31), 0, 0]), chest: add(p.chest, [6 * k, 0, 0]) });
}
// Pulling a sled by a rope over the shoulder: leaning forward, both hands at the right shoulder; mix with a gait.
export function haul(t, seed = 0, k = 1) {
  const p = M.stand(t, seed, { amt: 0.3 });
  return withArms(p, { aR: [-0.45, 0.95, 0.4], aL: [-0.25, 0.85, 0.9], aWL: k, aWR: k, plL: [1, -0.6, 0], plR: [-1, -0.6, 0], hL: HAND.grip, hR: HAND.grip,
    waist: add(p.waist, [16 * k, 0, 0]), chest: add(p.chest, [8 * k, 0, 0]), head: add(p.head, [-6 * k, 0, 0]) });
}
// Hands over the ears (the guns are firing).
export function coverEars(t, seed = 0, k = 1) {
  const p = M.stand(t, seed, { amt: 0.4 });
  return withArms(p, { aL: ['head', 1.05, -0.35, 0.1], aR: ['head', -1.05, -0.35, 0.1], aWL: k, aWR: k, plL: [1, -0.5, 0.3], plR: [-1, -0.5, 0.3], hL: HAND.flat, hR: HAND.flat, head: add(p.head, [8 * k, 0, 0]) });
}
// "We can do it!": the right upper arm out to the side and the forearm bent straight up (fist), chin up; e = 0..1
// (FK on the right arm, like the wave: an IK target on one arm alone would reset the other).
export function flex(t, seed = 0, e = 1, o = {}) {
  const p = M.stand(t, seed, { amt: 0.4, wide: 1.3, ...o });
  const q = withArms({ ...p }, { armR: [-8, 18, 6], elbR: [0, 26, -105], hR: HAND.fist,
    head: add(p.head, [-6, -8, 4]), chest: add(p.chest, [-4, -6, 0]) });
  return e >= 1 ? q : M.mix(p, q, e);
}
