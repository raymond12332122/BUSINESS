// Poses for the First World War video (chibi arms are short: keep hands below the chin).
import * as C from '../lib/chars.js';
import { ss, clamp } from '../lib/util.js';
export * from '../rusia/anim.js';
const { sin, cos, max, min, abs } = Math;

// Pistol shot: right arm straight out at shoulder height; kicks up at each shot time in `shots`.
export function shoot(t, shots = [], seed = 0) {
  const p = C.idle(t, seed, 0.3); let k = 0;
  for (const ts of shots) if (t >= ts) k = max(k, 1 - min(1, (t - ts) / 0.22));
  p.armR = [-84 + 14 * k, 6, 66]; p.elbR = [0, 6, 0]; p.armL = [-20, 0, -70]; p.elbL = [0, -20, 0];
  p.chest = [0, -14, 0]; p.head = [0, -10, 0]; p.waist = [0, -6, 0]; return p;
}
// Raise the pistol from the hip (k = 0..1).
export function drawGun(t, k, seed = 0) { return C.blend({ ...C.idle(t, seed, 0.3), armR: [-20, 0, 70], elbR: [0, 40, 0] }, shoot(t, [], seed), clamp(k)); }
// Throwing a small bomb: wind-up then release at tr.
export function throwAt(t, tr, seed = 0) {
  const p = C.idle(t, seed, 0.3), u = clamp((t - (tr - 0.5)) / 0.5), v = clamp((t - tr) / 0.3);
  p.armR = [10 + 25 * u - 95 * v, 0, -40 + 20 * u + 90 * v]; p.elbR = [0, 0, -60 * (1 - v)]; p.chest = [-6 * u + 12 * v, -14 * u + 18 * v, 0]; return p;
}
// Shovelling earth (digging a trench).
export function dig(t, seed = 0) {
  const c = sin(t * 3.0 + seed), p = C.idle(t, seed, 0.2);
  p.waist = [22 + 10 * c, 0, 0]; p.chest = [10 + 6 * c, 0, 0]; p.head = [8, 0, 0];
  p.armL = [-52 - 10 * c, -14, -58]; p.armR = [-40 - 14 * c, 14, 62]; p.elbL = [0, -38, 0]; p.elbR = [0, 46, 0];
  p.thL = [-14, 0, 2]; p.thR = [10, 0, -2]; p.knL = [16, 0, 0]; p.knR = [8, 0, 0]; p.gun = 'none'; return p;
}
// Sitting on the fire step, hugging the rifle, scratching (lice) now and then.
export function scratch(t, seed = 0) {
  const p = C.idle(t, seed, 0.3), k = max(0, sin(t * 1.3 + seed));
  p.armR = [-26, 10, 20 - 40 * k]; p.elbR = [0, 0, -100 * k - 20]; p.head = [6, 10 * sin(t * 0.6 + seed), 8 * k]; return p;
}
// Looking through a trench periscope (hands up in front of the face).
export function peer(t, seed = 0) { const p = C.idle(t, seed, 0.2); p.armL = [-70, -20, -40]; p.armR = [-70, 20, 40]; p.elbL = [0, -70, 0]; p.elbR = [0, 70, 0]; p.head = [-4, 0, 0]; p.gun = 'none'; return p; }
// Hands on a steering wheel (seated pose is applied separately).
export function drive(t, seed = 0) { const p = C.idle(t, seed, 0.2); p.armL = [-62, -12, -52]; p.armR = [-62, 12, 52]; p.elbL = [0, -46, 0]; p.elbR = [0, 46, 0]; return p; }
// Seated in a car / on a bench (hip lowered), with optional arm pose merged in.
export function seated(t, seed = 0, arms = null) {
  const p = { hipY: -0.105, hipZ: -0.02, waist: [-4, 0, 0], chest: [2, 0, 1.5 * sin(t * 0.9 + seed)], head: [2 * sin(t * 0.7 + seed), 8 * sin(t * 0.33 + seed), 0],
    armL: [-38, 0, -70], armR: [-38, 0, 70], elbL: [0, -30, 0], elbR: [0, 30, 0], thL: [-84, 0, 4], thR: [-84, 0, -4], knL: [84, 0, 0], knR: [84, 0, 0], anL: [0, 0, 0], anR: [0, 0, 0] };
  if (arms) for (const k of ['armL', 'armR', 'elbL', 'elbR']) if (arms[k]) p[k] = arms[k];
  return p;
}
// Waving from a car (right hand up, gentle).
export function waveSeated(t, seed = 0) { const w = sin(t * 5 + seed); return seated(t, seed, { armR: [-20, 0, -20 + 10 * w], elbR: [0, 0, -70 - 10 * w] }); }
// Handshake / offering something forward with the right hand.
export function shake(t, seed = 0) { const p = C.idle(t, seed, 0.3); p.armR = [-58 + 4 * sin(t * 8), 6, 60]; p.elbR = [0, 18, 0]; return p; }
// Holding a present (or a bundle) in both hands in front.
export function hold(t, seed = 0) { const p = C.idle(t, seed, 0.3); p.armL = [-58, -14, -62]; p.armR = [-58, 14, 62]; p.elbL = [0, -40, 0]; p.elbR = [0, 40, 0]; return p; }
// Kicking a ball at tk.
export function kick(t, tk, seed = 0) { const p = C.idle(t, seed, 0.4), u = clamp((t - tk + 0.25) / 0.25), v = clamp((t - tk) / 0.25); p.thR = [30 * u - 90 * v + 30 * clamp((t - tk - 0.25) / 0.4), 0, -2]; p.knR = [40 * u - 40 * v, 0, 0]; p.armL = [-30, 0, -50]; p.armR = [30, 0, 50]; return p; }
// Crouching low with the arms over the head (shelling).
export function cower(t, seed = 0) { const p = C.crouch(t, seed, 1); p.armL = [-40, -10, 0]; p.armR = [-40, 10, 0]; p.elbL = [0, 0, 120]; p.elbR = [0, 0, -120]; p.head = [20, 0, 0]; p.gun = 'none'; return p; }
// Pulling on a gas mask: hands to the face.
export function mask(t, seed = 0) { const p = C.idle(t, seed, 0.3); p.armL = [-66, -26, -24]; p.armR = [-66, 26, 24]; p.elbL = [0, -96, 0]; p.elbR = [0, 96, 0]; p.head = [-4, 0, 0]; p.gun = 'none'; return p; }
// Blowing a whistle (officer, going over the top).
export function whistle(t, seed = 0) { const p = C.idle(t, seed, 0.3); p.armR = [-56, 22, 34]; p.elbR = [0, 112, 0]; p.head = [-6, 0, 0]; return p; }
// Climbing out over the parapet (u = 0..1 progress), then running.
export function overTop(t, u, seed = 0) { const p = C.runArmed(t, 0.9, seed); p.gun = 'port'; p.waist = [24 * (1 - u), 0, 0]; p.chest = [14 * (1 - u), 0, 0]; return p; }
// Walking forward in line with the rifle at port (the Somme, 1 July 1916).
export function advance(t, seed = 0, speed = 0.42) { const p = C.walkArmed(t, speed, seed); p.gun = 'port'; p.head = [4, 0, 0]; return p; }
// Lying on a bed (rotate the rig's root separately): arms by the side.
export function lie(t, seed = 0) { const p = C.idle(t, seed, 0.15); p.armL = [0, 0, -84]; p.armR = [0, 0, 84]; p.elbL = [0, 0, 0]; p.elbR = [0, 0, 0]; p.hipY = 0; p.anL = [0, 0, 0]; p.anR = [0, 0, 0]; return p; }
// Cheering: arms up, jumping a little (armistice).
export function jubilant(t, seed = 0) { const p = C.cheer(t, seed); p.hipY = (p.hipY || 0) + 0.03 * max(0, sin(t * 7 + seed)); return p; }
// Sitting at a desk writing (Zimmermann, codebreakers): the Russian 'sign' pose with less sway.
export function write(t, seed = 0) { const p = { hipY: -0.105, hipZ: -0.02, waist: [10, 0, 0], chest: [8, 0, 0], head: [18, 4 * sin(t * 0.5 + seed), 0],
  armL: [-55, -10, -74], armR: [-62 + 3 * sin(t * 11 + seed), 8 * sin(t * 5 + seed), 74], elbL: [0, -35, 0], elbR: [0, 24, 0],
  thL: [-84, 0, 4], thR: [-84, 0, -4], knL: [84, 0, 0], knR: [84, 0, 0], anL: [0, 0, 0], anR: [0, 0, 0] }; return p; }
// Shaking the head "no" (Carranza).
export function refuse(t, t0, seed = 0) { const p = C.idle(t, seed, 0.3), k = clamp((t - t0) / 1.2); p.head = [4, 22 * sin((t - t0) * 9) * (1 - k) * (t > t0 ? 1 : 0), 0]; p.armL = [-30, -10, -60]; p.elbL = [0, -60, 0]; return p; }
