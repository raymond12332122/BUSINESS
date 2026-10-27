import * as THREE from 'three';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as RP from '../../rusia/props.js';
import { run, wt } from '../../whatif/shots.js';
const { ss, clamp } = K;

// Chapter 5, the job: torches on the glass, a case lid lifted (7 cases, 3 halls); piece by piece into the canvas
// suitcase (124 objects, 94 of gold); Pakal's mask rises out of its case; the security camera's clock races (half an
// hour? three hours?); out through the same duct with the suitcase, while the guards are still toasting.
export function build(ctx) {
  const L = ctx.L;
  const t1 = L[1].t0, t94 = wt(L[1], '94'), t2 = L[2].t0, t3 = L[3].t0, tMed = wt(L[3], 'media'), tTre = wt(L[3], 'tres'), t4 = L[4].t0, tSin = wt(L[4], 'sin');
  // ---- the Oaxaca hall: the bat god's case opened by torchlight
  const O = S.sala('oaxaca'), hv = O.hero;
  const a1 = K.person(O, 'oguri', 'perches', 0.32, -0.28, -2.65), a2 = K.person(O, 'daiwa', 'sardina', -0.5, -0.15, 2.55);
  a2.torch = K.giveTorch(a2);
  // ---- the suitcase filling up on the floor of the Maya hall
  const M = S.sala('maya'), bag = P.maleta(0.5, 0.32, 0.2); bag.position.set(0.7, 0, -0.35); bag.rotation.y = -0.4 + Math.PI; bag.open(1); M.add(bag); bag.userData.dynamic = true;
  const loot = new THREE.Group(); bag.add(loot); loot.userData.dynamic = true; const r = P.goldM(), rr = K.clamp, rnd = (i => () => (i = (i * 16807) % 2147483647) / 2147483647)(7);
  for (let i = 0; i < 36; i++) { const k = i % 3, m = new THREE.Mesh(k === 0 ? new THREE.CylinderGeometry(0.028, 0.028, 0.005, 14) : k === 1 ? new THREE.SphereGeometry(0.014, 8, 6) : new THREE.TorusGeometry(0.018, 0.005, 6, 12), r);
    m.position.set((rnd() - 0.5) * 0.4, 0.02 + rnd() * 0.07, (rnd() - 0.5) * 0.13); m.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); loot.add(m); }
  const b1 = K.person(M, 'oguri', 'perches', 0.95, 0.15, -2.2), b2 = K.person(M, 'daiwa', 'sardina', 0.15, -0.5, 1.2);
  b2.torch = K.giveTorch(b2);
  // ---- the crypt: the mask comes up out of its case
  const Cr = S.cripta(), mask = Cr.mask; mask.userData.dynamic = true;
  const c1 = K.person(Cr, 'oguri', 'perches', -0.62, 1.12, -2.7), c2 = K.person(Cr, 'daiwa', 'sardina', 0.05, 1.05, -2.1);
  c2.torch = K.giveTorch(c2);
  // ---- the Mexica hall on the security camera (empty, an open case, a torch sweeping)
  const X = S.sala('mexica'); X.hero.open(1); X.hero.inside.children.forEach(o => { if (o !== X.hero.inside.children[0]) o.visible = false; });
  const sweep = P.flashlight({ len: 4, power: 8 }); sweep.position.set(-2.5, 1.0, 2.5); X.add(sweep);
  const XL = X.userData.look, CCTV = { ...XL, sat: 0.12, tint: '#d4f0dc', grain: 0.09, vign: 0.62, con: 0.3, fringe: 1.6 }; X.userData.look = CCTV;
  // ---- the duct, crawling away with the suitcase; then the guards, still celebrating
  const D = S.ducto({ len: 16 }), d1 = K.person(D, 'oguri', 'perches', 0, -2, Math.PI), d2 = K.person(D, 'daiwa', 'sardina', 0, -0.6, Math.PI);
  const dfill = new THREE.PointLight('#ffcf9a', 1.6, 3.2, 1.5); dfill.position.set(0, 0.55, -0.4); D.add(dfill);
  const dbag = P.maleta(0.4, 0.26, 0.16); dbag.rotation.y = Math.PI / 2; D.add(dbag); dbag.userData.dynamic = true;
  for (const rg of [d1, d2]) { K.lie(rg); const f = P.flashlight({ len: 2.4, power: 3.5 }); f.cone.material.opacity = 0.04; rg.wear('head', f, [0, 0.62, 0.32], [-20, 0, 0]); }
  const G = S.guardia(), T = G.tableY;
  const gs = [[-0.9, -1.35, 0, 'tamamo'], [0, -1.35, 0, 'cafe'], [0.9, -1.35, 0, 'doto'], [-1.65, -0.6, Math.PI / 2, 'mcqueen'], [1.65, -0.6, -Math.PI / 2, 'suzuka']].map(([x, z, yaw, key]) => {
    const ch = RP.chairR('#3a3e44', '#2a2e34', 0.46); ch.position.set(x, 0, z); ch.rotation.y = yaw; G.add(ch); const rg = K.person(G, key, 'guardiaSin', x, z, yaw); K.seatOn(rg, ch.top + 0.005); return rg; });
  const act = t => {
    G.tick(t);
    // the bat god's case: lid off, Perches reaches in
    hv.open(ss(0.6, 2.0, t)); K.act(a1, K.reach(t, 1, [0, 0.86, -1.0], ss(1.6, 2.4, t)), t, { eye: 0.2 });
    K.act(a2, K.torch(t, 2, [0, 0.85, -1.0]), t, { eye: 0.2 }); a2.torch.on(1);
    // the suitcase fills (124 pieces in the counter, the visible loot grows)
    const n = Math.round(36 * ss(t1, t2 - 0.5, t)); loot.children.forEach((m, i) => { m.visible = i < n; });
    K.act(b1, K.reach(t, 1, [0.7, 0.18, -0.35], 1, { base: tt => K.A.crouch(tt, 1, 0.9) }), t, { eye: 0.25 });
    K.act(b2, K.torch(t, 2, [0.7, 0.1, -0.35]), t, {}); b2.torch.on(1);
    // the mask rises out of its case towards Perches
    Cr.hero.open(ss(t2 - 0.6, t2 + 0.3, t)); const mk = ss(t2 + 0.2, t3 - 0.6, t);
    mask.position.set(0, Cr.hero.inside.top + 0.2 * mk, -0.03 + 0.28 * mk);
    const mw = new THREE.Vector3(); mask.updateMatrixWorld(true); mask.getWorldPosition(mw);
    K.act(c1, K.reach(t, 1, [mw.x, mw.y + 0.1, mw.z], ss(t2 - 0.2, t2 + 0.4, t)), t, { eye: 0.15, mouth: [0.1, 0] });
    K.act(c2, K.torch(t, 2, [mw.x, mw.y + 0.1, mw.z]), t, { eye: 0.2 }); c2.torch.on(1);
    // the security camera: a torch sweeping across the dark hall
    sweep.rotation.y = 2.4 + 0.6 * Math.sin(t * 0.9); sweep.rotation.x = -0.15; sweep.on(1);
    // crawling away (towards -z), pushing the suitcase ahead
    for (const [rg, z0, sd] of [[d1, -2.2, 1], [d2, -0.8, 2]]) { const u2 = Math.max(0, t - t4 + 0.2) * 0.42, z = z0 - u2; rg.root.position.set(0, 0.04 + 0.012 * Math.abs(Math.sin(u2 * 9 + sd)), z);
      const p = K.crawl(t, sd, u2), sw = Math.sin(u2 * 9 + sd) * 0.06; p.aL = ['world', -0.15, 0, z - 0.62 + sw]; p.aR = ['world', 0.15, 0, z - 0.62 - sw]; p.aWL = p.aWR = 1; p.plL = [1, -1, 0]; p.plR = [-1, -1, 0]; K.act(rg, p, t, {}); }
    dbag.position.set(0, 0, d1.root.position.z - 0.95);
    gs.forEach((rg, i) => K.act(rg, i % 2 ? K.toast(t, i + 3, 1, { seated: true }) : K.mix(K.A.sit(t, i), K.A.sitTalk(t, i + 2, 0.8), 0.8), t, { eye: 'happy', talk: i % 2 ? false : 0.7, smile: 0.9 }));
    const cc = t >= t3 - 0.3 && t < t4 - 0.2, sec = 3600 + 2 * 60 + (cc ? (t - t3 + 0.3) ** 1.8 * 260 : 0);
    return U.letterbox(1) + U.chapter(t, 0.2, t1 - 0.3, 5, 'EL GOLPE') +
      U.counter(t, 0.8, t1 - 0.3, 'VITRINAS ABIERTAS', 0, 7, { x: 1560, y: 330, dur: 2.2, pad: 1, size: 120 }) + U.counter(t, 1.8, t1 - 0.3, 'SALAS', 0, 3, { x: 1560, y: 600, dur: 1.2, pad: 1, size: 120 }) +
      U.counter(t, t1 + 0.2, t2 - 0.3, 'PIEZAS EN LA MALETA', 0, 124, { x: 1500, y: 330, dur: t94 - t1 - 0.2 }) + U.counter(t, t94 - 0.1, t2 - 0.3, 'DE ORO', 0, 94, { x: 1500, y: 620, dur: 0.9, size: 110, col: '#e8c060', pad: 2 }) +
      (cc ? U.cctv(t, t3 - 0.3, t4 - 0.2, 'CÁMARA 7 · SALA MEXICA', '25·DIC·1985', sec - (t - t3 + 0.3)) : '') +
      U.stamp(t, tMed, t4 - 0.25, '¿30 MINUTOS?', { x: 620, y: 520, size: 76, rot: -6, col: '#e8c060' }) + U.stamp(t, tTre, t4 - 0.25, '¿3 HORAS?', { x: 1300, y: 640, size: 76, rot: 5, col: '#e8c060' });
  };
  const sfx = [
    { t: 0, type: 'hum', dur: t3, vol: 0.12 }, { t: 0.3, type: 'click', vol: 0.35 }, { t: 0.8, type: 'lock', vol: 0.4 }, { t: 1.3, type: 'glass', vol: 0.25 }, { t: 2.2, type: 'tick', vol: 0.25 },
    ...Array.from({ length: 9 }, (_, i) => ({ t: t1 + 0.4 + i * (t2 - t1 - 0.8) / 9, type: 'coins', vol: 0.32 })),
    { t: t2 - 0.6, type: 'lock', vol: 0.35 }, { t: t2 + 0.2, type: 'swell', vol: 0.3 }, { t: t2 + 0.3, type: 'whisper', dur: 1.6, vol: 0.12 },
    { t: t3 - 0.3, type: 'glitch', vol: 0.3 }, { t: t3 - 0.2, type: 'clock', dur: t4 - t3, vol: 0.3 }, { t: tMed, type: 'stamp', vol: 0.5 }, { t: tTre, type: 'stamp', vol: 0.5 },
    { t: t4 - 0.2, type: 'crawl', dur: tSin - t4, vol: 0.5 }, { t: tSin - 0.2, type: 'radio', dur: ctx.dur - tSin + 0.2, vol: 0.3 }, { t: tSin, type: 'laugh', vol: 0.4 }, { t: tSin + 1.2, type: 'clink', vol: 0.4 },
  ];
  const shots = [
    { t0: 0, set: O, p0: [1.75, 1.08, -1.45], l0: [-0.1, 0.82, -0.7], p1: [1.45, 1.02, -1.25], l1: [-0.1, 0.82, -0.65], fov0: 46, act },
    { t0: t1 - 0.2, set: M, p0: [0.45, 0.66, -1.25], l0: [0.8, 0.18, -0.25], p1: [0.5, 0.6, -1.05], l1: [0.8, 0.2, -0.2], fov0: 50, act },
    { t0: t2 - 0.2, set: Cr, p0: [-1.72, 1.16, 0.3], l0: [-0.75, 1.0, 0.95], p1: [-1.6, 1.14, 0.38], l1: [-0.72, 1.02, 0.98], fov0: 44, act },
    { t0: t3 - 0.3, set: X, p0: [3.4, 2.9, 3.6], l0: [0, 0.8, -0.6], fov0: 56, act },
    { t0: t4 - 0.2, set: D, p0: [0.15, 0.62, 0.1], l0: [-0.05, 0.25, -6], p1: [0.12, 0.6, -0.9], l1: [-0.05, 0.25, -7], fov0: 56, act },
    { t0: tSin - 0.2, set: G, p0: [0.3, 1.3, 2.5], l0: [0, 0.7, -1], p1: [0.15, 1.2, 2.1], l1: [0, 0.72, -1], fov0: 48, act },
  ];
  const inst = { scene: O, scenes: [O, M, Cr, X, D, G], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
