import * as K from '../kit.js';
import * as S from '../sets.js';
import * as U from '../ui.js';
import * as P from '../props.js';
import * as RP from '../../rusia/props.js';
import { run, wt } from '../../whatif/shots.js';
const { ss } = K;

// Chapter 3, the plan: New Year's Day circled on the calendar; the museum was going to repair its air conditioning, and
// the way in was an air-conditioning duct (blueprint, then a ride down the duct); so the circle moves to Christmas Eve,
// when the guards' room had Christmas lights instead of patrols.
export function build(ctx) {
  const L = ctx.L;
  const t1 = L[1].t0, tRep = wt(L[1], 'reparar'), t2 = L[2].t0, tDuc = wt(L[2], 'ducto'), t3 = L[3].t0, tNoc = wt(L[3], 'nochebuena'), tVig = wt(L[3], 'cuando');
  const R = S.recamara({ year: 1985 }), D = S.ducto({ len: 16 }), G = S.guardia();
  const per = K.person(R, 'oguri', 'perches', -0.2, 0.9, 0.5), sar = K.person(R, 'daiwa', 'sardina', 0.55, -0.85, -2.6);
  const ch = RP.chairR('#5a3a24', '#3a3a3a', 0.46); ch.position.set(-0.2, 0, 0.9); ch.rotation.y = 0.5; R.add(ch); K.seatOn(per, ch.top + 0.005);
  const lamp = P.flashlight({ len: 5, power: 6, angle: 0.5 }); lamp.cone.visible = false; D.add(lamp);
  const act = t => {
    R.tick(t); G.tick(t);
    lamp.position.copy(ctx.camera.position); lamp.position.x += 0.12; lamp.position.y -= 0.1; lamp.rotation.set(0, Math.PI, 0); lamp.on(1);
    K.act(per, K.A.seated(K.A.think, t, 1), t, { eye: 0.3 }); K.act(sar, K.A.crossArms(t, 2), t, {});
    const blue = U.blueprint(t, t1 - 0.1, t2 - 0.05, 0, { duct: ss(tRep - 0.4, tRep + 1.2, t) }) + U.stamp(t, tRep + 0.4, t2 - 0.05, 'REPARACIÓN', { x: 600, y: 700, size: 70, rot: -6 });
    return U.letterbox(1) + U.chapter(t, 0.2, t1 - 0.3, 3, 'EL PLAN') +
      U.calendarPage(t, 0.3, t1 - 0.1, 31, 31, 0, { label: 'AÑO NUEVO' }) + blue +
      U.calendarPage(t, t3 - 0.1, ctx.dur - 0.2, 31, 24, ss(tNoc - 0.9, tNoc + 0.2, t), { label: t > tNoc - 0.2 ? 'NOCHEBUENA' : 'AÑO NUEVO', x: 1240, y: 150 }) +
      (t > t1 - 0.1 && t < t2 ? U.letterbox(1) : '');
  };
  const sfx = [
    { t: 0, type: 'clock', dur: t1, vol: 0.18 }, { t: 0.4, type: 'paper', vol: 0.35 }, { t: t1, type: 'whoosh', vol: 0.25 }, { t: tRep + 0.4, type: 'stamp', vol: 0.6 },
    { t: t2, type: 'hum', dur: t3 - t2, vol: 0.25 }, { t: t2, type: 'wind', dur: t3 - t2, vol: 0.15 }, { t: tDuc, type: 'creak', vol: 0.25 },
    { t: t3, type: 'paper', vol: 0.35 }, { t: tNoc - 0.6, type: 'swoosh', vol: 0.3 }, { t: tNoc + 0.1, type: 'sting', vol: 0.35 }, { t: tVig, type: 'radio', dur: ctx.dur - tVig, vol: 0.2 },
  ];
  const shots = [
    { t0: 0, set: R, p0: [1.6, 1.1, 2.3], l0: [-0.4, 0.75, 0.2], p1: [1.3, 1.0, 1.9], l1: [-0.4, 0.75, 0.3], fov0: 52, act },
    { t0: t1 - 0.1, set: R, p0: [1.3, 1.0, 1.9], l0: [-0.4, 0.75, 0.3], fov0: 52, act },
    { t0: t2 - 0.05, set: D, p0: [0, 0.42, -0.4], l0: [0, 0.41, -6], p1: [0, 0.4, -9.5], l1: [0, 0.4, -16], fov0: 62, ease: 'lin', act },
    { t0: t3 - 0.1, set: R, p0: [1.4, 1.05, 2.0], l0: [-0.6, 0.85, 0.0], fov0: 52, act },
    { t0: tVig - 0.15, set: G, p0: [0.4, 1.4, 2.6], l0: [-0.6, 0.9, -1.6], p1: [0.1, 1.25, 2.1], l1: [-0.8, 0.9, -1.8], fov0: 50, act },
  ];
  const inst = { scene: R, scenes: [R, D, G], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
