// Cast for "El robo del siglo": chibis play everyone in 1985-89 (the two students in black, the nine police guards in
// navy with peaked caps, families at dinner, Acapulco nightlife, the 1989 agents) and the full-size Air Groove stands in
// for the prosecutor who cracked the case. Hats never hide the ears. Poses build on motion.stand like the other videos.
import * as THREE from 'three';
import * as WK from '../whatif/kit.js';
import * as M from '../lib/motion.js';
import * as A from '../wwii/anim.js';
import { generic } from '../mx/kit.js';
import { uniformize } from '../napo/kit.js';
import { hat } from '../amer/kit.js';
import { serviceCap } from '../ww1/kit.js';
import { watchCap, headphones, fedora } from '../wwii/kit.js';
import * as P from './props.js';
export { embrace } from '../amer/anim.js';
export * from '../whatif/kit.js';
export { A };
const { ss, clamp, HAND } = M;
export { ss, clamp, HAND };
export const mix = M.mix, seq = M.seq;
const nz = (t, f, ph) => Math.sin(t * f + ph);
const add = (v, d) => [(v?.[0] || 0) + d[0], (v?.[1] || 0) + d[1], (v?.[2] || 0) + d[2]];

export const PAL = {
  negro: { dark: '#08080a', mid: '#16161a', light: '#2a2a30', gold: '#3a3a40' }, negro2: { dark: '#0a0a0c', mid: '#1c1a1a', light: '#34302e', gold: '#3a3a40' },
  policia: { dark: '#0e1424', mid: '#1f2a44', light: '#4a5a7a', gold: '#c9a227' },
  casa1: { dark: '#3a1e1e', mid: '#9a2a2a', light: '#f2ece0', gold: '#c9a227' }, casa2: { dark: '#1e2a3a', mid: '#3a5a8a', light: '#f2efe6', gold: '#c9a227' },
  casa3: { dark: '#2a3a24', mid: '#4a7a4a', light: '#f4f0e4', gold: '#c9a227' }, casa4: { dark: '#3a2a1e', mid: '#a0703a', light: '#f6efe0', gold: '#c9a227' },
  casa5: { dark: '#3a2a3a', mid: '#8a5a8a', light: '#f6eef4', gold: '#c9a227' },
  tropical: { dark: '#3a1a2a', mid: '#e0507a', light: '#f8e8c8', gold: '#e8c84a' }, tropical2: { dark: '#1a2a3a', mid: '#2aa8c8', light: '#fff4e0', gold: '#e8c84a' },
  traje: { dark: '#14161a', mid: '#2a2e36', light: '#e8e6e0', gold: '#8c7a55' }, traje2: { dark: '#2a241c', mid: '#5a4e3e', light: '#ece6da', gold: '#8c7a55' },
  judicial: { dark: '#1a1c20', mid: '#3a3e46', light: '#d8d4ca', gold: '#8c7a55' },
  hoy1: { dark: '#1d2638', mid: '#47689a', light: '#f3f3f1', gold: '#a08a5a' }, hoy2: { dark: '#2a2420', mid: '#c87a3a', light: '#efe6d6', gold: '#a08a5a' },
  hoy3: { dark: '#2a2a2a', mid: '#7a3040', light: '#f0e8e0', gold: '#a08a5a' }, custodio: { dark: '#20242a', mid: '#4a525e', light: '#e8e8e4', gold: '#c9a227' },
};
const uni = (r, p) => uniformize(r, PAL[p] || p);
const pick = (r, list) => list[Math.floor(r.seed * 7.3) % list.length];
const CAP = { scale: 0.88, y: 0.88, tilt: -0.05, cap: true };
const KNIT = { scale: 0.9, y: 0.86, tilt: -0.03, cap: true };

Object.assign(WK.OUTFITS, {
  // the two students, dressed in black for the night (Perches with darker hair, Sardina with a lighter brown)
  perches: r => { generic(r, '#1a1410'); uni(r, 'negro'); hat(r, watchCap('#121214'), KNIT); return r; },
  sardina: r => { generic(r, '#4a3424'); uni(r, 'negro2'); hat(r, watchCap('#1a1818'), KNIT); return r; },
  perchesDia: r => { generic(r, '#1a1410'); uni(r, 'casa2'); return r; },
  sardinaDia: r => { generic(r, '#4a3424'); uni(r, 'casa4'); return r; },
  perchesAca: r => { generic(r, '#1a1410'); uni(r, 'tropical2'); return r; },
  // the museum's night guards (police) and the families
  guardia: r => { generic(r, pick(r, ['#2a2018', '#1d1612', '#3a2a20', '#4a3428'])); uni(r, 'policia'); hat(r, serviceCap('#1a2238', '#0e1424', ['#c9a227', '#c9a227', '#c9a227']), CAP); return r; },
  guardiaSin: r => { generic(r, pick(r, ['#2a2018', '#1d1612', '#3a2a20', '#4a3428'])); uni(r, 'policia'); return r; },
  familia: r => { generic(r, pick(r, ['#2a2018', '#4a3428', '#5a4030', '#1d1612', '#6a4a30'])); uni(r, pick(r, ['casa1', 'casa2', 'casa3', 'casa4', 'casa5'])); return r; },
  // Acapulco nightlife and the traffickers (dark glasses)
  fiesta: r => { generic(r, pick(r, ['#2a2018', '#4a3428', '#5a4030', '#1d1612'])); uni(r, pick(r, ['tropical', 'tropical2', 'casa5', 'casa1'])); return r; },
  narco: r => { generic(r, '#1d1612'); uni(r, pick(r, ['tropical', 'traje2'])); hat(r, fedora('#e8e2d0', '#3a2a1a'), { scale: 0.86, y: 0.9, tilt: -0.04, cap: true }); return r; },
  cabo: r => { generic(r, '#141010'); uni(r, 'tropical'); hat(r, fedora('#f2ece0', '#1a1a1a'), { scale: 0.86, y: 0.9, tilt: -0.04, cap: true }); return r; },
  // 1989: judicial police agents and the technician on the wiretaps
  agente: r => { generic(r, pick(r, ['#2a2018', '#1d1612', '#3a2a20'])); uni(r, pick(r, ['judicial', 'traje'])); return r; },
  tecnico: r => { generic(r, '#2a2018'); uni(r, 'traje'); r.wear('head', headphones(), [0, 0.88, -0.02]); return r; },
  // the 'international gang' everyone imagined
  mafia: r => { generic(r, '#141010'); uni(r, 'traje'); hat(r, fedora('#1a1a1c', '#0a0a0a'), { scale: 0.86, y: 0.9, tilt: -0.04, cap: true }); return r; },
  // today: visitors and a museum custodian
  visitante: r => { generic(r, pick(r, ['#2a2018', '#4a3428', '#5a4030', '#1d1612', '#6a4a30'])); uni(r, pick(r, ['hoy1', 'hoy2', 'hoy3', 'casa3'])); return r; },
  custodio: r => { generic(r, '#2a2018'); uni(r, 'custodio'); hat(r, serviceCap('#3a424e', '#20242a', ['#c9a227', '#c9a227', '#c9a227']), CAP); return r; },
});

// ------------------------------------------------------------ poses
// On all fours, crawling along +z: the rig's root is pitched forward (lie(r)), so a seated pose becomes a kneel.
// u = distance crawled (body units); hands are planted on the floor in world space by the caller (crawlHands).
export function lie(r, k = 1) { r.root.rotation.x = Math.PI / 2 * k; return r; }
export function crawl(t, seed = 0, u = 0, o = {}) {
  const p = A.sit(t, seed, { amt: 0.25 }), c = Math.sin(u * 9 + seed), c2 = Math.sin(u * 9 + seed + Math.PI);
  return Object.assign(p, {
    hipY: -0.105, hipZ: -0.03, hip: [0, 3 * c, 0], waist: [-6, 2 * c, 0], chest: [-10, -2 * c, 0], neck: [-25, 0, 0], head: [-38 + 3 * Math.sin(u * 18), 4 * c, 0],
    fL: [0.01, 0.02 + 0.025 * Math.max(0, c), 0.06 + 0.04 * c], fR: [-0.01, 0.02 + 0.025 * Math.max(0, c2), 0.06 + 0.04 * c2],
    hL: HAND.flat, hR: o.torch ? HAND.grip : HAND.flat, tail: [40, 10 * c, 0], sec: { bob: 0.2 * c, sway: 0.1 * c, wind: 0 },
  });
}
// Holding a flashlight forward at chest height (right hand), the beam towards a world point; the left hand free or on the case.
export function torch(t, seed = 0, aim = null, o = {}) {
  const p = o.base ? o.base(t) : M.stand(t, seed, { amt: 0.35 });
  Object.assign(p, { aR: [-0.12, 0.42, 1.55], aWR: 1, plR: [-1, -0.2, 0], hR: HAND.grip });
  if (aim) { p.look = aim; p.lookW = 0.7; }
  return p;
}
// Carrying the suitcase (right hand down at the side, gripping the handle); walk with M.gait mixed by the caller.
export function carry(p, side = 'R') { p['a' + side] = side === 'R' ? [-0.34, -0.05, 0.25] : [0.34, -0.05, 0.25]; p['aW' + side] = 1; p['h' + side] = HAND.grip; p['pl' + side] = side === 'R' ? [-1, -0.3, 0] : [1, -0.3, 0]; return p; }
// Both hands into the open case at world point pt (lifting a piece out); k blends in.
export function reach(t, seed, pt, k = 1, o = {}) {
  const p = o.base ? o.base(t) : M.stand(t, seed, { amt: 0.3 });
  p.aL = ['world', pt[0] + 0.07, pt[1], pt[2]]; p.aR = ['world', pt[0] - 0.07, pt[1], pt[2]]; p.aWL = p.aWR = clamp(k);
  p.plL = [1, -0.4, -0.2]; p.plR = [-1, -0.4, -0.2]; p.hL = p.hR = HAND.pinch; p.look = pt; p.lookW = 0.8 * clamp(k * 1.5);
  p.waist = add(p.waist, [10 * k, 0, 0]); p.chest = add(p.chest, [8 * k, 0, 0]);
  return p;
}
// A toast: the right hand raises the glass to head height (k), the left rests; laughing heads.
export function toast(t, seed = 0, k = 1, o = {}) {
  const p = o.seated ? A.sit(t, seed) : M.stand(t, seed, { amt: 0.5 });
  const b = 0.5 + 0.5 * Math.sin(t * 2.1 + seed);
  Object.assign(p, { aR: ['head', -0.45, -0.1 + 0.25 * k, 0.75], aWR: clamp(0.3 + 0.7 * k), plR: [-1, -0.3, 0], hR: HAND.grip, head: add(p.head, [-8 * k * b, 5 * nz(t, 1.3, seed), 0]) });
  return p;
}
// Climbing a fence: hands up on the top rail (world points), one knee raised; k = 0..1 through the climb.
export function climb(t, seed, railL, railR, k = 0) {
  const p = M.stand(t, seed, { amt: 0.2 });
  p.aL = ['world', ...railL]; p.aR = ['world', ...railR]; p.aWL = p.aWR = 1; p.hL = p.hR = HAND.grip; p.plL = [1, 0.4, -0.8]; p.plR = [-1, 0.4, -0.8];
  p.fR = [-0.01, 0.12 * Math.sin(Math.PI * k), 0.06 * Math.sin(Math.PI * k)]; p.head = add(p.head, [-14, 0, 0]);
  return p;
}
// Taking a photo: both hands up at the face holding an (imaginary) camera; k blends in.
export function photo(t, seed = 0, k = 1) {
  const p = M.stand(t, seed, { amt: 0.3 });
  return Object.assign(p, { aL: ['head', 0.2, -0.08, 0.62], aR: ['head', -0.2, -0.08, 0.62], aWL: clamp(k), aWR: clamp(k), plL: [1, 0, -0.3], plR: [-1, 0, -0.3], hL: HAND.grip, hR: HAND.grip });
}
// Handcuffed, hands behind the back, head down (the 1989 arrest).
export function cuffs(t, seed = 0, o = {}) {
  const p = M.stand(t, seed, { amt: 0.3, ...o });
  return Object.assign(p, { aL: [0.12, 0.05, -1.3], aR: [-0.12, 0.05, -1.3], aWL: 1, aWR: 1, plL: [1, -0.4, -0.6], plR: [-1, -0.4, -0.6], hL: HAND.fist, hR: HAND.fist, head: add(p.head, [18, 0, 0]), chest: add(p.chest, [4, 0, 0]) });
}

// ------------------------------------------------------------ props in hands
// A lit flashlight in the right hand; returns the torch (torch.on(k)).
export function giveTorch(r, side = 'R') { const f = P.flashlight(); WK.holdIn(r, f, side, [0, -0.02, 0.03], [0, side === 'R' ? -Math.PI / 2 : Math.PI / 2, 0], 1 / (r.ratio || 1) * 0.9); return f; }
// The canvas suitcase hanging from the right hand (handle in the grip).
export function giveCase(r) { const c = P.maleta(0.4, 0.26, 0.15); const g = new THREE.Group(); c.position.set(0, -0.27, 0); c.rotation.y = Math.PI / 2; g.add(c); WK.holdIn(r, g, 'R', [0, -0.03, 0.02], [0, 0, 0]); g.userData.dynamic = true; return g; }
