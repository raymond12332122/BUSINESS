// Poses for the Russian Revolution video (chibi arms are short: keep hands below the chin).
import * as C from '../lib/chars.js';
import { ss } from '../lib/util.js';
export { sit, sign, orate, clap, fist, humble, proud, handsUp, sad, work } from '../mx/anim.js';
const { sin } = Math;

// Marching in step with the rifle at port (diagonal across the chest).
export function march(t, seed = 0, speed = 0.55) { const p = C.walkArmed(t, speed, seed); p.gun = 'port'; p.head = [0, 0, 0]; return p; }
// Standing guard, rifle at port or grounded.
export function guard(t, seed = 0, gun = 'port') { return { ...C.idle(t, seed, 0.35), gun }; }
// Charging with the rifle.
export function charge(t, seed = 0, speed = 0.9) { return { ...C.runArmed(t, speed, seed), gun: 'port' }; }
// Firing line: aims, recoils at the volley time tv.
export function volley(t, tv, seed = 0, kneel = 0) { const r = tv != null ? Math.max(0, 1 - Math.abs(t - tv - 0.06) / 0.18) * (t >= tv ? 1 : 0) : 0; return { ...C.aim(t, r, kneel), gun: 'aim' }; }
// Walking then dropping to the ground at tf (non-graphic: they sit/fall back).
export function fallAt(t, tf, seed = 0, speed = 0.45) { if (t < tf) return C.walk(t, speed, seed); return C.blend(C.walk(tf, speed, seed), C.knocked(t - tf, seed), ss(tf, tf + 0.35, t)); }
// Fleeing (run away, arms up).
export function flee(t, seed = 0, speed = 1.0) { const p = C.run(t, speed, seed); p.armL = [-20, 0, 40 + 10 * sin(t * 9)]; p.armR = [-20, 0, -40 - 10 * sin(t * 9)]; p.elbL = [0, 0, 40]; p.elbR = [0, 0, -40]; return p; }
// Holding a banner pole / icon in front with both hands while walking.
export function carry(t, seed = 0, speed = 0.4) { const p = C.walk(t, speed, seed); p.armL = [-62, -24, -70]; p.armR = [-62, 24, 70]; p.elbL = [0, -70, 0]; p.elbR = [0, 70, 0]; p.head = [0, 0, 0]; return p; }
export function carryStand(t, seed = 0) { const p = C.idle(t, seed, 0.4); p.armL = [-62, -24, -70]; p.armR = [-62, 24, 70]; p.elbL = [0, -70, 0]; p.elbR = [0, 70, 0]; return p; }
// Cheering with a raised fist (crowds at rallies).
export function rally(t, seed = 0) { const p = C.idle(t, seed), up = 0.5 + 0.5 * sin(t * 4.2 + seed * 2.1); p.armR = [-20, 0, -32 - 26 * up]; p.elbR = [0, 0, -58]; p.head = [-3, 6 * sin(t + seed), 0]; return p; }
// Shivering in the cold, arms hugged.
export function cold(t, seed = 0) { const p = C.idle(t, seed, 0.3); p.armL = [-40, -50, -60]; p.armR = [-40, 50, 60]; p.elbL = [0, -110, 0]; p.elbR = [0, 110, 0]; p.chest = [8 + 2 * sin(t * 25 + seed), 0, 1.5 * sin(t * 31 + seed)]; p.head = [10, 0, 0]; return p; }
// Pointing at something on a table (map).
export function pointDown(t, seed = 0) { const p = C.idle(t, seed, 0.3); p.waist = [12, 0, 0]; p.chest = [10, 0, 0]; p.armR = [-64, 8, 76]; p.elbR = [0, 12, 0]; p.head = [18, 0, 0]; return p; }
// Talking with small hand gestures.
export function talk(t, seed = 0) { const p = C.idle(t, seed), g = 0.5 + 0.5 * sin(t * 2.6 + seed); p.armR = [-40 - 14 * g, 18, 74]; p.elbR = [0, 46 + 18 * g, 0]; return p; }
