import * as K from '../kit.js';
import * as S from '../sets.js';
import * as U from '../ui.js';
import * as RP from '../../rusia/props.js';
import { run, wt, walkIn } from '../../whatif/shots.js';
const { ss } = K;

// Chapter 7, the closet: the treasure never left the country; it sat on top of a closet in Perches's parents' house in
// Naucalpan, by Ciudad Satélite (the towers outside the window); the years turn on the calendar and nobody dares to buy;
// the joke: selling the Mona Lisa at a street market.
export function build(ctx) {
  const L = ctx.L;
  const t1 = L[1].t0, tSat = wt(L[1], 'satelite'), t2 = L[2].t0, t3 = L[3].t0;
  const R = S.recamara({ year: 1986 }), cl = R.closet;
  const per = K.person(R, 'oguri', 'perchesDia', 1.15, -0.15, -Math.PI / 2 + 0.2), sar = K.person(R, 'daiwa', 'sardinaDia', -0.4, -1.75, Math.PI / 2);
  K.seatOn(per, 0.42); R.lamp.position.set(-1.4, 1.5, 0.9); R.lamp.intensity = 3.2; R.lamp.distance = 6;
  const W = S.recamara({ year: 1986 });
  const Ti = S.tianguis(), seller = K.person(Ti, 'oguri', 'perchesDia', 0.1, -0.85, 0), passers = [[-3.5, 1.2, Math.PI / 2, 'spe'], [4, 1.6, -Math.PI / 2, 'tamamo'], [-5, 2.2, Math.PI / 2, 'doto']].map(([x, z, y, k]) => K.person(Ti, k, 'visitante', x, z, y));
  const act = t => {
    R.tick(t); Ti.tick(t);
    cl.top(ss(t1 + 0.6, t1 + 1.8, t));
    const yr = t < t2 + 2 ? 1986 : t < t2 + 4.2 ? 1987 : 1988; R.calendar.set(yr);
    K.act(per, K.A.seated(K.A.think, t, 1), t, { eye: 0.35, mouth: [0, 0] });
    K.act(sar, walkIn(sar, t, t2 + 0.3, [-0.4, -1.75], Math.PI / 2, 0.9, { seed: 2, speed: 0.3 }), t, { mouth: [0, 0] });
    K.act(seller, K.A.wave(t, 1), t, { smile: 0.9, eye: 'happy' });
    passers.forEach((r, i) => K.act(r, walkIn(r, t, t3 - 0.5 + i * 0.3, [[-3.5, 4, -5][i], [1.2, 1.6, 2.2][i]], [Math.PI / 2, -Math.PI / 2, Math.PI / 2][i], 6, { seed: i + 3, speed: 0.45 }), t, {}));
    return U.letterbox(1) + U.chapter(t, 0.2, t1 - 0.3, 7, 'EL CLÓSET') + U.tag(t, tSat - 0.6, t2 - 0.2, 'NAUCALPAN, ESTADO DE MÉXICO', 'JUNTO A CIUDAD SATÉLITE') +
      U.stamp(t, wt(L[2], 'famosas') + 0.1, t3 - 0.2, 'DEMASIADO FAMOSAS', { x: 1380, y: 330, size: 74, rot: -6 });
  };
  const sfx = [
    { t: 0, type: 'night', dur: t3, vol: 0.25 }, { t: 0, type: 'clock', dur: t3, vol: 0.18 }, { t: t1 + 0.6, type: 'creak', vol: 0.4 }, { t: t1 + 1.2, type: 'drawer', vol: 0.3 },
    { t: tSat, type: 'swoosh', vol: 0.2 }, { t: t2 + 2, type: 'paper', vol: 0.3 }, { t: t2 + 4.2, type: 'paper', vol: 0.3 },
    { t: t3 - 0.1, type: 'crowd', dur: ctx.dur - t3 + 0.1, vol: 0.25 }, { t: t3 + 0.6, type: 'chime', vol: 0.25 },
  ];
  const shots = [
    { t0: 0, set: R, p0: [0.2, 1.35, 2.2], l0: [-2.6, 1.3, -0.4], p1: [-0.3, 1.45, 1.5], l1: [-2.6, 1.6, -0.4], fov0: 52, act },
    { t0: t1 - 0.2, set: R, p0: [-1.1, 1.7, 0.2], l0: [-2.7, 2.0, -0.4], p1: [-1.35, 1.75, 0.0], l1: [-2.7, 2.0, -0.4], fov0: 48, act },
    { t0: tSat - 0.6, set: W, p0: [0.8, 1.45, 0.4], l0: [3, 2.4, -40], p1: [0.85, 1.42, 0.0], l1: [3, 2.4, -40], fov0: 46, act },
    { t0: t2 - 0.2, set: R, p0: [-0.9, 1.05, 1.5], l0: [1.0, 0.7, -0.5], p1: [-0.7, 1.0, 1.2], l1: [1.0, 0.7, -0.6], fov0: 50, act },
    { t0: t3 - 0.15, set: Ti, p0: [0.6, 0.85, 2.0], l0: [0, 0.65, -0.3], p1: [0.4, 0.8, 1.5], l1: [0, 0.65, -0.3], fov0: 46, act },
  ];
  const inst = { scene: R, scenes: [R, W, Ti], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
