// Extra gestures for the Revolution video (chibi arms are short: keep hands below the chin).
import * as C from '../lib/chars.js';
const { sin, cos } = Math;

export function handsUp(t, seed = 0) {
  const p = C.idle(t, seed, 0.3);
  p.armL = [-10, 0, 12]; p.armR = [-10, 0, -12]; p.elbL = [0, 0, 92]; p.elbR = [0, 0, -92];
  p.head = [10, 8 * sin(t * 0.8 + seed), 0]; p.gun = 'none';
  return p;
}
export function sit(t, seed = 0, lean = 0) {
  return {
    hipY: -0.105, hipZ: -0.02,
    waist: [-4 + lean, 0, 0], chest: [2 + lean * 0.5, 0, 1.5 * sin(t * 0.9 + seed)], head: [2 * sin(t * 0.7 + seed), 8 * sin(t * 0.33 + seed), 2 * sin(t * 0.5)],
    armL: [-38, 0, -70], armR: [-38, 0, 70], elbL: [0, -30, 0], elbR: [0, 30, 0],
    thL: [-88, 0, 6], thR: [-88, 0, -6], knL: [88, 0, 0], knR: [88, 0, 0], anL: [0, 0, 0], anR: [0, 0, 0],
    tail: [0, 0, 0],
  };
}
export function laugh(t, seed = 0) { const p = sit(t, seed, -6); p.chest = [-8 + 4 * sin(t * 14), 0, 0]; p.head = [-14 + 5 * sin(t * 14), 0, 4]; p.armL = [-60, -20, -50]; p.elbL = [0, -70, 0]; return p; }
export function orate(t, seed = 0, k = 1) {
  const p = C.idle(t, seed);
  const pump = 0.5 + 0.5 * sin(t * 3.2 + seed);
  p.armR = [-30 - 20 * pump * k, 0, -18 - 22 * pump * k]; p.elbR = [0, 0, -70 * k];
  p.armL = [-55, -10, -78]; p.elbL = [0, -40, 0];
  p.chest = [-4, -8 * sin(t * 0.7), 0]; p.head = [-8, 12 * sin(t * 0.6 + seed), 0];
  return p;
}
export function work(t, seed = 0) {
  const s = sin(t * 2.6 + seed), p = C.idle(t, seed, 0.2);
  p.waist = [30 + 8 * s, 0, 0]; p.chest = [12 + 6 * s, 0, 0]; p.head = [-14, 0, 0];
  p.armL = [-70 - 20 * s, -15, -78]; p.armR = [-70 - 20 * s, 15, 78]; p.elbL = [0, -30, 0]; p.elbR = [0, 30, 0];
  p.thL = [-12, 0, 6]; p.thR = [-12, 0, -6]; p.knL = [18, 0, 0]; p.knR = [18, 0, 0];
  p.hipY = (p.hipY || 0) - 0.012; p.gun = 'none';
  return p;
}
export function sign(t, seed = 0) {
  const p = sit(t, seed, 14);
  p.armR = [-62 + 4 * sin(t * 9), 10 * sin(t * 4), 74]; p.elbR = [0, 24, 0];
  p.armL = [-55, -10, -74]; p.elbL = [0, -35, 0]; p.head = [18, 0, 0];
  return p;
}
export function sad(t, seed = 0) { const p = C.tired(t, seed, 0.8); p.head = [16, 6 * sin(t * 0.6), 0]; return p; }
export function proud(t, seed = 0) { const p = C.idle(t, seed); p.chest = [-8, 0, 0]; p.head = [-10, 6 * sin(t * 0.5 + seed), 0]; p.armL = [-20, -40, -60]; p.armR = [-20, 40, 60]; p.elbL = [0, -100, 0]; p.elbR = [0, 100, 0]; return p; }
export function cook(t, seed = 0) { const p = C.crouch(t, seed, 0.55); p.armR = [-60 + 10 * sin(t * 3), 20, 70]; p.elbR = [0, 60 + 15 * sin(t * 3), 0]; p.gun = 'none'; return p; }
// Standing meekly, hands clasped low in front (keeps the head level so hats don't tip).
export function humble(t, seed = 0) {
  const p = C.idle(t, seed, 0.4);
  p.head = [6, 4 * sin(t * 0.5 + seed), 2 * sin(t * 0.7)]; p.chest = [4, 0, 0];
  p.armL = [-22, -34, -64]; p.armR = [-22, 34, 64]; p.elbL = [0, -62, 0]; p.elbR = [0, 62, 0];
  return p;
}
// Applause: hands meeting in front of the chest.
export function clap(t, seed = 0) {
  const p = C.idle(t, seed, 0.5), k = 0.5 + 0.5 * sin(t * 15 + seed * 3);
  p.armL = [-55, -38 + 10 * k, -66]; p.armR = [-55, 38 - 10 * k, 66]; p.elbL = [0, -70 - 12 * k, 0]; p.elbR = [0, 70 + 12 * k, 0];
  p.head = [-2, 4 * sin(t + seed), 0];
  return p;
}
// Raising a fist (rallying), one arm up.
export function fist(t, seed = 0, side = 'R') {
  const p = C.idle(t, seed), pump = 0.5 + 0.5 * sin(t * 5 + seed);
  if (side === 'R') { p.armR = [-20, 0, -30 - 25 * pump]; p.elbR = [0, 0, -60]; } else { p.armL = [-20, 0, 30 + 25 * pump]; p.elbL = [0, 0, 60]; }
  p.head = [-4, 0, 0]; return p;
}
