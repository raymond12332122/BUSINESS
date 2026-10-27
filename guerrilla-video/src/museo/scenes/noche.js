import * as THREE from 'three';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as RP from '../../rusia/props.js';
import { run, wt, walkIn } from '../../whatif/shots.js';
const { ss, clamp } = K;

// Chapter 4, the night: Christmas dinner as if nothing; black clothes and the Volkswagen down Reforma; about 1 a.m. over
// the fence (security-camera time code); on all fours down the duct with torches; the grille in the Maya crypt swings
// open. Meanwhile (split screen) the nine guards toast Christmas together while the two stand before Pakal's case.
export function build(ctx) {
  const L = ctx.L;
  const t1 = L[1].t0, tSal = wt(L[1], 'salieron'), t2 = L[2].t0, tRej = wt(L[2], 'saltaron'), t3 = L[3].t0, tSot = wt(L[3], 'sotano'), t4 = L[4].t0, tCel = wt(L[4], 'celebrando');
  // ---- dinner
  const C = S.cena();
  const seats = [[-0.55, -1.15, 0], [0.15, -1.15, 0], [0.75, -1.15, 0], [-1.45, -0.5, Math.PI / 2], [1.45, -0.5, -Math.PI / 2]];
  const fam = seats.map(([x, z, yaw], i) => { const ch = RP.chairR('#5a3a24', '#7a2a24', 0.46); ch.position.set(x, 0, z); ch.rotation.y = yaw; C.add(ch);
    const r = K.person(C, i === 1 ? 'oguri' : ['spe', 'tamamo', 'doto', 'mcqueen', 'helios'][i], i === 1 ? 'perchesDia' : 'familia', x, z, yaw); K.seatOn(r, ch.top + 0.005); return r; });
  // ---- Reforma: the vocho parked, the two walk to it; then it drives off
  const R = S.reforma({ fireworks: false });
  const car = P.vocho('#ddd6c4', { night: true }); car.position.set(4, 0, 10.4); car.rotation.y = -Math.PI / 2; R.add(car); car.userData.dynamic = true;
  const w1 = K.person(R, 'oguri', 'perches', 8.6, 9.2, -Math.PI / 2), w2 = K.person(R, 'daiwa', 'sardina', 9.3, 9.0, -Math.PI / 2);
  // ---- the fence (same avenue, the stretch by the Tláloc)
  const f1 = K.person(R, 'oguri', 'perches', -4.3, 4.95, Math.PI), f2 = K.person(R, 'daiwa', 'sardina', -3.6, 4.95, Math.PI);
  // ---- the duct (they crawl towards the camera, which looks back up the duct)
  const D = S.ducto({ len: 16 });
  const c1 = K.person(D, 'oguri', 'perches', 0, -6, 0), c2 = K.person(D, 'daiwa', 'sardina', 0, -7.4, 0);
  for (const r of [c1, c2]) { K.lie(r); const f = P.flashlight({ len: 2.4, power: 3.5 }); f.cone.material.opacity = 0.04; r.wear('head', f, [0, 0.62, 0.32], [-20, 0, 0]); r.torch = f;
    const fill = new THREE.PointLight('#ffd9a8', 1.2, 1.6, 1.6); fill.position.set(0, 0.5, 0.9); r.root.add(fill); }
  // ---- the crypt: grille, then the two before Pakal's case
  const Cr = S.cripta();
  const peek = P.flashlight({ len: 3.4, power: 10 }); peek.position.set(-3.7, 2.35, -0.6); peek.rotation.y = Math.PI / 2; Cr.add(peek);
  const k1 = K.person(Cr, 'oguri', 'perches', -0.35, 1.3, -2.5), k2 = K.person(Cr, 'daiwa', 'sardina', 0.25, 1.05, -2.0);
  k1.torch = K.giveTorch(k1); k2.torch = K.giveTorch(k2);
  // ---- the guards' Christmas (split screen, left)
  const G = S.guardia(), T = G.tableY;
  const gs = [[-0.9, -1.35, 0, 'tamamo'], [0, -1.35, 0, 'cafe'], [0.9, -1.35, 0, 'doto'], [-1.65, -0.6, Math.PI / 2, 'mcqueen'], [1.65, -0.6, -Math.PI / 2, 'suzuka']].map(([x, z, yaw, key]) => {
    const ch = RP.chairR('#3a3e44', '#2a2e34', 0.46); ch.position.set(x, 0, z); ch.rotation.y = yaw; G.add(ch); const r = K.person(G, key, 'guardiaSin', x, z, yaw); K.seatOn(r, ch.top + 0.005); return r; });
  const gst = [[-2.1, -1.7, 0.6, 'helios'], [2.15, -1.6, -0.5, 'spe'], [-0.5, -2.05, 0.1, 'hishi'], [0.7, -2.1, -0.15, 'doto']].map(([x, z, yaw, key]) => K.person(G, key, 'guardia', x, z, yaw));
  const RL = R.userData.look, CCTV = { ...RL, sat: 0.12, tint: '#d4f0dc', grain: 0.09, vign: 0.62, bloom: 0.5, con: 0.3, fringe: 1.6 };
  const camA = new THREE.PerspectiveCamera(46, (ctx.W * 0.5) / ctx.H, 0.1, 200), camB = new THREE.PerspectiveCamera(46, (ctx.W * 0.5) / ctx.H, 0.1, 200);
  const act = (t, u, lt) => {
    R.tick(t); C.tick(t); G.tick(t); D.tick?.(t);
    fam.forEach((r, i) => K.act(r, i === 1 ? K.A.seated(K.A.stand, t, 1) : K.mix(K.A.sit(t, i), K.A.sitTalk(t, i, 0.6), 0.7), t, { talk: i !== 1 && i % 2 === 0 ? 0.6 : false, smile: i === 1 ? 0.15 : 0.6 }));
    // walk to the car, then gone (inside); the car pulls away at tSal
    for (const [r, x0, z0, sd] of [[w1, 8.6, 9.2, 1], [w2, 9.3, 9.0, 2]]) { const p = walkIn(r, t, t1 + 0.2 + sd * 0.25, [x0, z0], -Math.PI / 2 - 0.12, 3.2, { seed: sd, speed: 0.42 }); r.root.visible = t < tSal - 0.1; K.act(r, p, t, {}); }
    const dv = Math.max(0, t - tSal); car.position.x = 4 - (dv * dv * 0.9 + dv * 2.0); car.drive(t, Math.min(1, dv)); car.position.z = 10.4 + Math.min(0.6, dv * 0.4);
    // the follow shot pans with the car as it pulls away down the avenue
    if (t >= tSal + 0.2 && t < t2 - 0.1) ctx.camera.lookAt(car.position.x - 1.2, 0.65, car.position.z);
    // the fence: hands up on the rail, a knee up, then over (cut)
    const ck = clamp((t - tRej) / 1.4);
    K.act(f1, K.climb(t, 1, [-4.15, 1.42, 4.68], [-4.45, 1.42, 4.68], ck), t, {}); K.act(f2, K.climb(t, 2, [-3.45, 1.42, 4.68], [-3.75, 1.42, 4.68], clamp(ck - 0.3)), t, {});
    f1.root.position.y = 0.42 * ss(tRej + 0.4, tRej + 1.6, t); f2.root.position.y = 0.42 * ss(tRej + 0.8, tRej + 2.0, t);
    // the crawl: towards +z (the camera), hands planted ahead, small bob
    for (const [r, z0, sd] of [[c1, -9, 1], [c2, -10.6, 2]]) {
      const u2 = Math.max(0, t - t3 + 0.3) * 0.42, z = z0 + u2; r.root.position.set(0, 0.04 + 0.012 * Math.abs(Math.sin(u2 * 9 + sd)), z);
      const p = K.crawl(t, sd, u2), sw = Math.sin(u2 * 9 + sd) * 0.06; r.root.updateMatrixWorld(true);
      p.aL = ['world', 0.15, 0.0, z + 0.62 + sw]; p.aR = ['world', -0.15, 0.0, z + 0.62 - sw]; p.aWL = p.aWR = 1; p.plL = [1, -1, 0]; p.plR = [-1, -1, 0];
      K.act(r, p, t, { eye: 0.25 });
    }
    // the grille swings open, a beam pokes out and sweeps
    Cr.grille.open(ss(tSot - 0.2, tSot + 0.6, t)); peek.on(ss(tSot + 0.3, tSot + 0.6, t)); peek.rotation.y = Math.PI / 2 + 0.35 * Math.sin((t - tSot) * 1.3); peek.rotation.x = 0.3;
    for (const [r, sd] of [[k1, 1], [k2, 2]]) { K.act(r, K.torch(t, sd, [-0.9, 0.95, 0.5]), t, { eye: 0.2 }); r.torch.on(1); }
    gs.forEach((r, i) => K.act(r, i % 2 ? K.toast(t, i + 3, ss(tCel - 0.6, tCel, t), { seated: true }) : K.mix(K.A.sit(t, i), K.A.sitTalk(t, i + 2, 0.8), 0.8), t, { eye: i % 2 ? 'happy' : 'open', talk: i % 2 ? false : 0.7, smile: 0.9 }));
    gst.forEach((r, i) => K.act(r, i % 2 ? K.toast(t, i + 7, 1) : K.A.talk(t, i + 5, 0.7), t, { eye: 'happy', talk: i % 2 ? false : 0.7, smile: 0.9 }));
    // split-screen cameras
    camA.position.set(0.2 - 0.15 * ss(t4, ctx.dur, t), 1.25, 2.4 - 0.3 * ss(t4, ctx.dur, t)); camA.lookAt(0, 0.7, -1.0);
    camB.position.set(-1.75, 1.18, -0.6); camB.lookAt(-0.15, 0.82, 1.2);
    const cc = t >= t2 - 0.1 && t < t3 - 0.15;
    R.userData.look = cc ? CCTV : RL;
    return U.letterbox(1) + U.chapter(t, 0.2, t1 - 0.3, 4, 'LA NOCHE') + U.tag(t, 0.6, t1 - 0.3, 'NOCHEBUENA', '24 DE DICIEMBRE DE 1985', { x: 1300, y: 160 }) +
      (cc ? U.cctv(t, t2 - 0.1, t3 - 0.15, 'CÁMARA 2 · PASEO DE LA REFORMA', '25·DIC·1985', 3600 - 6 - (t2 - 0.1)) : '') +
      U.tag(t, tSot + 0.2, t4 - 0.3, 'SÓTANO', 'SALA MAYA') +
      (t >= t4 - 0.2 ? U.divider(ss(t4 - 0.2, t4 + 0.2, t), 0.5, 'SALA DE GUARDIAS', 'SÓTANO · SALA MAYA') : '');
  };
  const sfx = [
    { t: 0, type: 'crowd', dur: t1, vol: 0.14 }, { t: 0.4, type: 'clink', vol: 0.3 }, { t: t1 - 0.2, type: 'night', dur: t3 - t1, vol: 0.3 },
    { t: t1 + 0.3, type: 'steps', dur: 1.8, vol: 0.25 }, { t: tSal - 0.5, type: 'cardoor', vol: 0.45 }, { t: tSal - 0.1, type: 'vw', dur: t2 - tSal + 0.4, vol: 0.45 },
    { t: tRej, type: 'fence', vol: 0.55 }, { t: tRej + 1.0, type: 'fence', vol: 0.4 }, { t: tRej + 2.1, type: 'thud', vol: 0.3 },
    { t: t3 - 0.15, type: 'crawl', dur: tSot - t3, vol: 0.55 }, { t: t3 - 0.1, type: 'click', vol: 0.4 }, { t: tSot - 0.2, type: 'creak', vol: 0.5 }, { t: tSot + 0.3, type: 'click', vol: 0.35 },
    { t: t4 - 0.2, type: 'radio', dur: ctx.dur - t4 + 0.2, vol: 0.3 }, { t: t4, type: 'laugh', vol: 0.35 }, { t: tCel, type: 'clink', vol: 0.5 }, { t: tCel + 0.8, type: 'laugh', vol: 0.3 }, { t: t4, type: 'heart', dur: ctx.dur - t4, vol: 0.2 },
  ];
  const shots = [
    { t0: 0, set: C, p0: [0.5, 1.05, 1.9], l0: [0.15, 0.6, -1.0], p1: [0.3, 0.92, 1.25], l1: [0.15, 0.62, -1.1], fov0: 46, act },
    { t0: t1 - 0.2, set: R, p0: [11.2, 1.35, 5.0], l0: [6.2, 0.7, 9.9], p1: [10.6, 1.3, 5.3], l1: [5.6, 0.7, 10.0], fov0: 50, act },
    { t0: tSal + 0.2, set: R, p0: [-1, 0.9, 7.0], l0: [1.5, 0.6, 10.6], p1: [-8, 1.0, 7.4], l1: [-10, 0.6, 11], fov0: 50, ease: 'in', act },
    { t0: t2 - 0.1, set: R, p0: [-1.2, 3.3, 7.8], l0: [-3.9, 0.9, 4.8], p1: [-1.25, 3.3, 7.7], l1: [-3.9, 1.0, 4.8], fov0: 46, act },
    { t0: t3 - 0.15, set: D, p0: [0.18, 0.62, -3.6], l0: [-0.05, 0.25, -9], p1: [0.15, 0.6, -4.4], l1: [-0.05, 0.25, -9], fov0: 56, act },
    { t0: tSot - 0.25, set: Cr, p0: [1.2, 1.3, 1.9], l0: [-3.4, 2.2, -0.6], p1: [0.9, 1.4, 1.5], l1: [-3.4, 2.25, -0.6], fov0: 46, act },
    { t0: t4 - 0.2, set: G, p0: [0, 1.25, 2.4], l0: [0, 0.7, -1], fov0: 46, act },
  ];
  const inst = { scene: C, scenes: [C, R, D, Cr, G], sfx };
  inst.views = t => t >= t4 - 0.2 ? [{ scene: G, camera: camA, x: 0, w: 0.5 }, { scene: Cr, camera: camB, x: 0.5, w: 0.5 }] : null;
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
