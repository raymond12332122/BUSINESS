import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as U from '../ui.js';
import * as M from '../../lib/motion.js';
import { run, wt, walkIn } from '../shots.js';

export const SASH = ['#0f6b3f', '#f6f3ea', '#c3262f'];
const fade = U.fade;

export function build(ctx) {
  const L = ctx.L;
  const tRud = wt(L[0], 'rudolf'), tCor = wt(L[0], 'coronas'), tEmp = wt(L[0], 'emperador'), tMex = wt(L[0], 'mexico');
  const tSir = wt(L[1], 'sirius'), tBla = wt(L[1], 'blanca'), tB = L[1].t0 - 0.35, tC = L[2].t0 - 0.3, tEle = wt(L[2], 'elenco');

  // ---- A: the Zócalo at golden hour, Rudolf walks up from the Palacio Nacional
  const Z = S.zocalo('golden');
  const rud = K.leader(Z, 'rudolf', 0, -11.5, 0); K.fitSash(rud, SASH, { emblem: K.eagleKnot() });
  const guards = [-2.4, 2.4].map(x => K.person(Z, x < 0 ? 'oguri' : 'spe', 'soldado', x, -23.0, 0));
  const walkers = [['helios', -12, -16, Math.PI / 2], ['cafe', 11, -14, -Math.PI / 2], ['daiwa', -8, -19, Math.PI / 2], ['hishi', 9, -18.5, -Math.PI / 2]]
    .map(([k, x, z, y], i) => ({ r: K.person(Z, k, i % 2 ? 'civil' : 'civilCap', x, z, y, { shadow: false }), x, z, y, i }));
  const rudPose = t => walkIn(rud, t, 0.2, [0, -11.5], 0, 4.2, { speed: 0.21, seed: 1,
    after: tt => M.seq(tt, [[0, x => A.stand(x, 1)], [tEmp - 0.2, x => ({ ...A.handOnHeart(x, 1, M.ss(tEmp - 0.2, tEmp + 0.5, x)), ears: earTwitch(x, tEmp + 0.1) })]], 0.6) });

  // ---- B: Washington, Sirius strides across the North Lawn
  const W = S.whiteHouse('golden');
  const sir = K.leader(W, 'sirius', 0.4, -6.5, 0);
  const sirPose = t => walkIn(sir, t, tB + 0.1, [0.4, -6.5], 0, 4.4, { speed: 0.24, seed: 2, after: tt => M.seq(tt, [[0, x => A.stand(x, 2)], [tBla - 0.6, x => A.crossArms(x, 2)]], 0.7) });

  // ---- C: the whole cast on one stage
  const Ln = S.lineup();
  const order = ['tamamoB', 'digital', 'dotoB', 'mcqueenB', 'groove', 'creek', 'sirius', 'rudolf', 'grass', 'opera', 'golshi', 'teio', 'dia', 'suzukaB', 'turbo'];
  const POSE = { tamamoB: A.handsOnHips, digital: A.fangirl, dotoB: A.think, mcqueenB: (t, s) => A.handOnHeart(t, s, 1), groove: A.crossArms, creek: (t, s) => A.wave(t, s, 'L'),
    sirius: A.crossArms, rudolf: (t, s) => A.handOnHeart(t, s, 1), grass: (t, s) => A.bow(t, s, 0.35), opera: (t, s) => A.point(t, s, 20, 55, 'R'), golshi: A.cheer, teio: (t, s) => A.wave(t, s, 'both'),
    dia: (t, s) => A.point(t, s, -15, 15, 'R'), suzukaB: A.stand, turbo: A.cheer };
  const cast = order.map((k, i) => { const r = K.leader(Ln, k, -10.15 + i * 1.45, -2.6, 0); r.root.position.y = Ln.floorY; return r; });
  K.fitSash(cast[7], SASH, { emblem: K.eagleKnot() });

  const lineAct = t => { cast.forEach((r, i) => K.act(r, POSE[order[i]](t, i * 1.3), t, { smile: 0.5, mouth: order[i] === 'golshi' || order[i] === 'turbo' ? [0.5, 0.8] : undefined })); return U.film(t); };
  const sfx = [{ t: 0, type: 'traffic', dur: tB, vol: 0.18 }, { t: tB, type: 'birds', dur: tC - tB, vol: 0.25 }, { t: tC, type: 'applause', dur: 4, vol: 0.35 }, { t: tC - 0.1, type: 'whoosh', vol: 0.3 }];

  const shots = [
    { t0: 0, set: Z, p0: [2.4, 0.95, -1.6], l0: [0, 1.75, -12], p1: [1.35, 1.2, -4.1], l1: [0, 1.25, -7.2], fov0: 46, fov1: 38, act: t => {
      Z.palacio.setTime(18, 30); K.act(rud, rudPose(t), t, { smile: 0.45 });
      guards.forEach((g, i) => K.act(g, A.stand(t, i + 3, { amt: 0.3 }), t));
      walkers.forEach(w => { const p = walkIn(w.r, t, 0.3 + w.i * 0.6, [w.x, w.z], w.y, 30, { speed: 0.2, seed: w.i }); K.act(w.r, p, t); });
      return U.film(t) + U.bigTitle(t, 0.4, tRud - 0.2, '¿QUÉ PASARÍA SI…?', '', '', { top: 120 })
        + U.leader(t, tRud - 0.3, tB + 0.1, 'rudolf', { side: 'l', line: '«El Emperador»: la única umamusume con siete coronas.' })
        + U.popCard(t, tCor - 0.1, tB, 'SIETE CORONAS', '♛ ♛ ♛ ♛ ♛ ♛ ♛', '', { x: 1530, y: 140, w: 470 });
    } },
    { t0: tB, set: W, p0: [1.6, 1.35, 2.6], l0: [0.4, 1.5, -6], p1: [1.0, 1.3, 1.2], l1: [0.4, 1.2, -2.0], fov0: 42, fov1: 36, act: t => {
      K.act(sir, sirPose(t), t, { smile: t > tBla ? 0.55 : 0.15 });
      return U.film(t) + U.leader(t, tSir - 0.3, tC + 0.1, 'sirius', { side: 'r', line: 'Amiga de la infancia… y eterna rival de Rudolf.' });
    } },
    { t0: tC, set: Ln, p0: [-9.2, 1.45, 2.6], l0: [-8.4, 1.3, -2.6], p1: [-3.2, 1.45, 2.6], l1: [-2.4, 1.3, -2.6], fov0: 34, ease: 'lin', act: lineAct },
    { t0: tEle - 0.1, set: Ln, p0: [0.6, 1.5, 5.6], l0: [-0.3, 1.35, -2.6], p1: [0.2, 1.55, 7.6], l1: [-0.3, 1.45, -2.6], fov0: 50, fov1: 58, act: t => lineAct(t)
      + U.bigTitle(t, tEle + 0.1, ctx.dur + 1, '¿QUÉ PASARÍA SI…', 'Rudolf gobernara México', 'y Sirius, Estados Unidos?', { top: 60 }) },
  ];
  const inst = { scene: Z, scenes: [Z, W, Ln], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
// Ears flick twice when a pun comes to mind (Rudolf's tell).
export function earTwitch(t, t0) { const u = t - t0; if (u < 0 || u > 0.9) return [0, 0]; const k = Math.sin(u * 22) * Math.exp(-u * 3) * 28; return [k, -k * 0.8]; }
