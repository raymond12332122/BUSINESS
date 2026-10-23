import * as K from '../kit.js';
import * as S from '../sets.js';
import * as SC from '../screens.js';
import { run, wt } from '../../whatif/shots.js';
const { ss } = K;

// Rule one, scale: the Siete Coronas tower grows out of the table and the share climbs; the monitor shows the cost of
// each new customer falling towards nothing; Rudolf leans over the little shops, for whom every customer is expensive.
export function build(ctx) {
  const L = ctx.L;
  const tCr = wt(L[0], 'crezca'), tMi = wt(L[1], 'mientras'), tCl = wt(L[1], 'clientes'), tUno = wt(L[1], 'uno'), tRi = wt(L[1], 'rivales'), tCa = wt(L[1], 'caro');
  const O = S.office(), rud = K.host(O), tv = K.tvShot(O, 1.18, 0.0, 0.0);
  const grow = t => ss(tCr - 0.45, tCr + 0.55, t);
  O.tagUs.visible = false;
  const act = t => {
    const g = grow(t); O.tower.grow(g); O.tower.glow(0.35 + 0.65 * g);
    O.led.set(`${Math.round(41 + 20 * g)}%`);
    O.flow.share = tt => 0.3 - 0.22 * grow(tt);
    const p = t < tRi - 0.3 ? K.behind(t, 3) : K.mix(K.behind(t, 3), K.lean(t, 3, 1), ss(tRi - 0.3, tRi + 0.5, t));
    K.act(rud, p, t, t < tRi ? K.FACE.smugTalk(t > L[0].t0 && t < L[0].t1 + 0.1 || t > L[1].t0) : K.FACE.smugTalk(t < L[1].t1));
    O.tv.draw('c' + Math.round(t * 24), (x, W, H) => SC.costCurve(x, W, H, ss(tCl - 0.2, tUno + 0.6, t)));
    return K.stamp(t + ctx.start);
  };
  const sfx = [
    { t: tCr - 0.15, type: 'rise', vol: 0.55 }, { t: tCr + 0.2, type: 'beep', vol: 0.12 }, { t: tCr + 0.6, type: 'beep', vol: 0.12 },
    { t: tMi + 0.35, type: 'crt', vol: 0.3 }, { t: tRi - 0.25, type: 'creak', vol: 0.2 }, { t: tCa, type: 'sting', vol: 0.2 },
  ];
  const shots = [
    { t0: 0, set: O, p0: [0.02, 1.0, 0.5], l0: [0.55, 1.0, -0.3], p1: [0.08, 1.04, 0.4], l1: [0.55, 1.22, -0.3], fov0: 52, ease: 'inOut', act },
    { t0: tMi + 0.35, set: O, p0: tv.p, l0: tv.l, p1: tv.p.map((v, i) => v + (tv.l[i] - v) * 0.12), l1: tv.l, fov0: 50, act },
    { t0: tRi - 0.25, set: O, p0: [-0.32, 0.88, 0.32], l0: [-0.05, 1.22, -0.72], p1: [-0.28, 0.9, 0.2], l1: [-0.04, 1.25, -0.72], fov0: 56, ease: 'out', act },
  ];
  const inst = { scene: O, scenes: [O], sfx, capY: K.capLow([[tMi + 0.35, tRi - 0.25]]) };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
