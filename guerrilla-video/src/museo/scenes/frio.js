import * as THREE from 'three';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as RP from '../../rusia/props.js';
import { run, wt } from '../../whatif/shots.js';
const { ss } = K;

// Cold open: Christmas Eve 1985 over Paseo de la Reforma (fireworks, Christmas lamps), a family's Nochebuena dinner,
// the museum asleep with its glowing cases, El Paraguas in the moonlight, two silhouettes at the fence, the title.
export function build(ctx) {
  const L = ctx.L;
  const t1 = L[1].t0, tPon = wt(L[1], 'ponche'), tAbr = wt(L[1], 'abrazos'), t2 = L[2].t0, tGu = wt(L[2], 'guarda', 1), t3 = L[3].t0, tDos = wt(L[3], 'dos'), tRobo = wt(L[3], 'robo'), tEnd = L[3].t1;
  // ---- Reforma at night: two cars passing, the students at the fence later
  const R = S.reforma();
  const cars = [['#c8b89a', 0.0, 11.2, 1], ['#7a1f2a', 3.0, 14.8, -1]].map(([col, ph, z, dir]) => { const c = P.sedan80(col, { night: true }); c.position.set(-40 * dir, 0, z); c.rotation.y = dir * Math.PI / 2; R.add(c); c.userData.dynamic = true; return { c, ph, z, dir }; });
  const per = K.person(R, 'oguri', 'perches', -1.55, 5.35, Math.PI + 0.15), sar = K.person(R, 'daiwa', 'sardina', -0.85, 5.45, Math.PI - 0.1);
  const rim = new THREE.SpotLight('#9ab8ff', 16, 6, 0.5, 0.6, 1.2); rim.position.set(-1.2, 2.6, 2.6); rim.target.position.set(-1.2, 0.8, 5.4); R.add(rim, rim.target);
  // ---- the family dinner
  const C = S.cena(), T = C.tableY;
  const seats = [[-0.55, -1.15, 0], [0.15, -1.15, 0], [0.75, -1.15, 0], [-1.45, -0.5, Math.PI / 2], [1.45, -0.5, -Math.PI / 2]];
  const fam = seats.map(([x, z, yaw], i) => { const ch = RP.chairR('#5a3a24', '#7a2a24', 0.46); ch.position.set(x, 0, z); ch.rotation.y = yaw; C.add(ch);
    const r = K.person(C, ['spe', 'tamamo', 'doto', 'mcqueen', 'helios'][i], 'familia', x, z, yaw); K.seatOn(r, ch.top + 0.005); return r; });
  const hugA = K.person(C, 'suzuka', 'familia', -2.0, -1.75, 1.2), hugB = K.person(C, 'hishi', 'familia', -1.6, -1.55, -1.9);
  // ---- the hall and the patio
  const M = S.sala('maya'), Pt = S.patio();
  const act = t => {
    for (const { c, ph, z, dir } of cars) { const x = -40 * dir + dir * ((t * 9 + ph * 20) % 80); c.position.x = x; c.drive(t, 1); }
    R.tick(t); Pt.tick(t); C.tick(t);
    fam.forEach((r, i) => { const toastK = ss(tPon - 0.3, tPon + 0.4, t) * (1 - ss(tPon + 2.4, tPon + 3.2, t));
      K.act(r, i % 2 === 0 ? K.toast(t, i, toastK, { seated: true }) : K.mix(K.A.sit(t, i), K.A.sitTalk(t, i, 0.6), 0.7), t, { talk: i % 2 === 1 ? 0.6 : false, smile: 0.6 }); });
    const hk = ss(tAbr - 0.4, tAbr + 0.5, t);
    hugA.root.position.x = -2.0 + 0.12 * hk; hugB.root.position.x = -1.6 - 0.1 * hk;
    K.act(hugA, K.mix(K.A.stand(t, 3), K.embrace(t, 3, hk), hk), t, { eye: hk > 0.5 ? 'happy' : 'open', smile: 0.8 });
    K.act(hugB, K.mix(K.A.wave(t, 4), K.embrace(t, 4, hk), hk), t, { eye: hk > 0.5 ? 'happy' : 'open', smile: 0.8 });
    K.act(per, K.A.stand(t, 1, { amt: 0.3 }), t, {}); K.act(sar, K.A.stand(t, 2, { amt: 0.3 }), t, {});
    return U.letterbox(1) + U.tag(t, 1.0, t1 - 0.3, 'CIUDAD DE MÉXICO', '24 DE DICIEMBRE DE 1985') +
      U.tag(t, tGu + 0.2, t3 - 0.3, 'BOSQUE DE CHAPULTEPEC', 'MUSEO NACIONAL DE ANTROPOLOGÍA') +
      (t > tEnd - 0.2 ? U.black(0.5 * ss(tEnd - 0.2, tEnd + 0.6, t)) + U.title(t, tEnd + 0.1, ctx.dur + 1) : '');
  };
  const sfx = [
    { t: 0, type: 'night', dur: t1, vol: 0.35 }, { t: 0.8, type: 'pop', vol: 0.25 }, { t: 2.9, type: 'pop', vol: 0.2 }, { t: 4.7, type: 'pop', vol: 0.22 },
    { t: 0.2, type: 'engine', dur: 5, vol: 0.12 }, { t: t1, type: 'crowd', dur: t2 - t1, vol: 0.16 }, { t: tPon + 0.3, type: 'clink', vol: 0.5 }, { t: tAbr, type: 'laugh', vol: 0.25 },
    { t: t2, type: 'night', dur: tGu - t2, vol: 0.3 }, { t: t2 + 0.3, type: 'bells', dur: 4.5, vol: 0.18 }, { t: tGu, type: 'hum', dur: t3 - tGu, vol: 0.12 },
    { t: t3, type: 'fountain', dur: tDos - t3, vol: 0.4 }, { t: tDos, type: 'night', dur: tEnd - tDos, vol: 0.3 }, { t: tDos, type: 'heart', dur: tEnd - tDos, vol: 0.25 },
    { t: tEnd + 0.15, type: 'hit', vol: 0.8 }, { t: tEnd + 0.1, type: 'swell', vol: 0.3 },
  ];
  const shots = [
    { t0: 0, set: R, p0: [26, 20, 42], l0: [-2, 6, -20], p1: [12, 4.6, 26], l1: [-4, 3.2, -6], fov0: 50, ease: 'out', act },
    { t0: t1 - 0.3, set: C, p0: [0.3, 1.15, 2.7], l0: [0, 0.55, -0.6], p1: [0.15, 0.95, 1.85], l1: [0.1, 0.6, -0.6], fov0: 48, act },
    { t0: t2 - 0.2, set: R, p0: [-1.0, 1.5, 10.5], l0: [-6.2, 3.0, -6], p1: [-2.4, 2.0, 6.0], l1: [-6.0, 3.2, -8], fov0: 52, act },
    { t0: tGu - 0.15, set: M, p0: [-3.3, 1.05, 2.8], l0: [0, 0.9, -1.2], p1: [-1.1, 0.98, 1.7], l1: [0.2, 0.85, -1.2], fov0: 46, act },
    { t0: t3 - 0.2, set: Pt, p0: [10, 1.6, 9], l0: [0, 3.4, 0], p1: [7, 1.3, 11.5], l1: [0, 3.6, 0], fov0: 55, act },
    { t0: tDos - 0.15, set: R, p0: [0.6, 0.75, 8.2], l0: [-1.4, 1.3, -6], p1: [0.2, 0.72, 7.3], l1: [-1.4, 1.35, -6], fov0: 44, act },
    { t0: tEnd - 0.05, set: Pt, p0: [0, 1.0, 13], l0: [0, 4.0, 0], p1: [0, 1.0, 11], l1: [0, 4.2, 0], fov0: 55, act },
  ];
  const inst = { scene: R, scenes: [R, C, M, Pt], sfx, hideCaptions: t => t > tEnd + 0.05 };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
