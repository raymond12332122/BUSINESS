// Extra poses for the Puebla video.
import * as C from '../lib/chars.js';
const { sin } = Math;

// Walking with the hands cuffed behind the back, head down.
export function cuffed(t, seed = 0, speed = 0.45) {
  const p = C.walk(t, speed, seed);
  p.armL = [34, 18, -62]; p.armR = [34, -18, 62]; p.elbL = [0, 58, 0]; p.elbR = [0, -58, 0];
  p.head = [12, 4 * sin(t * 0.7 + seed), 0]; p.gun = 'none';
  return p;
}
export function cuffedStand(t, seed = 0) {
  const p = C.idle(t, seed, 0.3);
  p.armL = [34, 18, -62]; p.armR = [34, -18, 62]; p.elbL = [0, 58, 0]; p.elbR = [0, -58, 0];
  p.head = [12, 4 * sin(t * 0.5 + seed), 0]; p.gun = 'none';
  return p;
}
// Escort walking with the rifle held low.
export function escort(t, seed = 0, speed = 0.45) { return { ...C.walkArmed(t, speed, seed), gun: 'low' }; }
// Crouched over the tap, filling a jerry can.
export function fill(t, seed = 0) {
  const p = C.crouch(t, seed, 0.75);
  p.armR = [-62 + 6 * sin(t * 2 + seed), 16, 70]; p.elbR = [0, 40, 0]; p.armL = [-55, -16, -70]; p.elbL = [0, -40, 0]; p.head = [18, 0, 0]; p.gun = 'none';
  return p;
}
