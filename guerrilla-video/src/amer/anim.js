// Poses for the independence of the Americas video: everything from the WW1/Russia/Mexico videos plus bell ringing,
// embraces, raised sabres, sipping tea and throwing crates.
import * as C from '../lib/chars.js';
import { ss, clamp } from '../lib/util.js';
export * from '../ww1/anim.js';
const { sin, cos, max, abs } = Math;

// Pulling a bell rope with both hands (Dolores).
export function ringBell(t, seed = 0, speed = 3.2) { const k = 0.5 + 0.5 * sin(t * speed + seed), p = C.idle(t, seed, 0.3);
  p.armL = [-150 + 45 * k, 0, -90]; p.armR = [-150 + 45 * k, 0, 90]; p.elbL = [0, -20 - 20 * k, 0]; p.elbR = [0, 20 + 20 * k, 0];
  p.chest = [-6 + 10 * k, 0, 0]; p.head = [-14 + 8 * k, 0, 0]; p.hipY = (p.hipY || 0) - 0.01 * k; return p; }
// Embrace: arms forward and around (k: 0..1 how closed the arms are).
export function embrace(t, seed = 0, k = 1) { const p = C.idle(t, seed, 0.2);
  p.armL = [-70 * k, 0, -74 + 4 * k]; p.armR = [-70 * k, 0, 74 - 4 * k]; p.elbL = [0, -14 - 70 * k, 0]; p.elbR = [0, 14 + 70 * k, 0]; p.chest = [4 * k, 0, 0]; p.head = [6 * k, 0, 0]; return p; }
// Sabre (or hat) raised high in the right hand.
export function swordUp(t, seed = 0, k = 1) { const p = C.idle(t, seed, 0.3), w = sin(t * 5 + seed) * 6;
  p.armR = [-20 * k, 0, 74 - 150 * k + w]; p.elbR = [0, 14 - 4 * k, 0]; p.chest = [-6 * k, 0, 0]; p.head = [-10 * k, 0, 0]; return p; }
// Lifting a teacup to the lips (the right hand comes up to the mouth).
export function sip(t, seed = 0, k = 1) { const p = C.idle(t, seed, 0.3);
  p.armR = [-56 * k, 22 * k, 74 - 40 * k]; p.elbR = [0, 14 + 98 * k, 0]; p.armL = [-40, -10, -60]; p.elbL = [0, -70, 0]; p.head = [6 * k, 0, 0]; return p; }
// Holding something in front with both hands (a document, a crate).
export function present(t, seed = 0) { const p = C.idle(t, seed, 0.3); p.armL = [-60, -12, -64]; p.armR = [-60, 12, 64]; p.elbL = [0, -46, 0]; p.elbR = [0, 46, 0]; p.head = [10, 0, 0]; return p; }
// Heave a crate over the rail: lift (u < 0.5) then throw (u > 0.5); u = 0..1 over one throw.
export function heave(t, u, seed = 0) { const p = C.idle(t, seed, 0.2), up = ss(0, 0.5, u), fw = ss(0.5, 0.8, u) * (1 - ss(0.85, 1, u));
  const ax = -60 - 90 * up + 70 * fw;
  p.armL = [ax, -10, -64 + 30 * up]; p.armR = [ax, 10, 64 - 30 * up]; p.elbL = [0, -40 + 20 * up, 0]; p.elbR = [0, 40 - 20 * up, 0];
  p.chest = [-10 * up + 18 * fw, 0, 0]; p.waist = [12 * fw, 0, 0]; p.head = [-8 * up + 10 * fw, 0, 0]; return p; }
// Slumped and defeated (a captured viceroy, a dying leader).
export function slump(t, seed = 0) { const p = C.tired(t, seed, 1); p.head = [24, 8 * sin(t * 0.5 + seed), 0]; return p; }
// Kneeling (laying down arms, surrender).
export function kneel(t, seed = 0) { const p = C.crouch(t, seed, 1); p.head = [14, 0, 0]; return p; }
// Excited fangirl bounce (Agnes Digital): hands clasped at the chest, bouncing.
export function fangirl(t, seed = 0) { const b = abs(sin(t * 7 + seed)), p = C.idle(t, seed, 0.3);
  p.armL = [-62, -24, -70]; p.armR = [-62, 24, 70]; p.elbL = [0, -100, 0]; p.elbR = [0, 100, 0]; p.hipY = (p.hipY || 0) + 0.025 * b; p.head = [-8, 10 * sin(t * 3), 8 * sin(t * 5)]; return p; }
// Theatrical pose (Opera O): one arm flung out, chin up.
export function diva(t, seed = 0) { const p = C.idle(t, seed, 0.3), w = sin(t * 2 + seed) * 6; p.armR = [-10, 0, -20 + w]; p.elbR = [0, 0, -10]; p.armL = [-70, -10, -70]; p.elbL = [0, -60, 0]; p.chest = [-8, 0, 0]; p.head = [-14, 10, 0]; return p; }
// Facepalm (Teio hearing Rudolf's pun): right hand to the forehead.
export function facepalm(t, seed = 0) { const p = C.idle(t, seed, 0.3); p.armR = [-70, 30, 30]; p.elbR = [0, 120, 0]; p.head = [16, 0, 0]; return p; }
