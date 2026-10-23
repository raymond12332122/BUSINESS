import * as THREE from 'three';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as SC from '../screens.js';
import * as P from '../props.js';
import * as A from '../../whatif/anim.js';
import { run, wt } from '../../whatif/shots.js';
const { ss, clamp } = K;

// The rival: a rented garage lights up, five girls with an app that costs half; a price war would cost her far more
// (the monitor's bars), so she slides a check across the table instead. VENDIDO.
export function build(ctx) {
  const L = ctx.L;
  const tAp = wt(L[0], 'aparece'), tBa = wt(L[0], 'barato'), tCi = wt(L[0], 'cinco'), tMit = wt(L[0], 'mitad');
  const tGu = wt(L[1], 'guerra'), tUs = wt(L[1], 'usted'), tEl = wt(L[1], 'ellas'), tCua = wt(L[1], 'cuantos');
  const tNo = wt(L[2], 'no'), tCo = wt(L[2], 'cómprelas'), tChe = wt(L[2], 'cheque'), tGue = wt(L[2], 'guerra');
  const O = S.office(), rud = K.host(O), tv = K.tvShot(O, 0.98, 0.02, 0.04);
  // the five founders, game pieces in front of their garage; later two of them hold up the (to them) giant check
  const girls = [['spe', -0.75, 0.44], ['daiwa', -0.67, 0.47], ['suzuka', -0.59, 0.48], ['cafe', -0.51, 0.47], ['hishi', -0.43, 0.44]]
    .map(([w, x, z], i) => { const r = K.figurine(O.city, w, x, z, 0.1 * (2 - i)); r.i = i; return r; });
  const big = P.check(); big.scale.setScalar(0.62); big.rotation.x = Math.PI / 2; O.city.add(big);
  // her check slides down the empty avenue towards us
  const chk = P.check(); O.city.add(chk); chk.rotation.y = Math.PI / 2;
  const tagHome = [-0.1, -0.42];
  O.tagUs.position.set(tagHome[0], 0, tagHome[1]);
  const act = t => {
    O.garage.light(t < tAp - 0.1 ? 0 : t < tAp + 0.6 ? (Math.sin(t * 47) > 0 ? ss(tAp - 0.1, tAp + 0.5, t) : 0.15) : 1);
    O.tagThem.visible = t > tMit - 0.15; O.tagThem.scale.setScalar(0.001 + ss(tMit - 0.15, tMit + 0.15, t));
    O.flow.share = tt => 0.08 + 0.3 * ss(tAp, tMit + 1, tt) - 0.3 * ss(tGue - 0.5, tGue + 2, tt);
    O.led.set(t < tGue ? `${Math.round(61 - 4 * ss(tBa, tMit + 0.5, t))}%` : `${Math.round(57 + 23 * ss(tGue, tGue + 0.8, t))}%`);
    const u = ss(tCo - 0.05, tCo + 1.3, t), e = 1 - (1 - u) ** 3, cz = -0.42 + 0.8 * e;
    chk.visible = t > tNo - 0.1 && t < tChe - 0.2; chk.position.set(0.06, 0, cz);
    big.visible = t >= tChe - 0.2; big.position.set(-0.59, 0.066 + 0.004 * Math.sin(t * 3), 0.49);
    girls.forEach(r => { let p = A.stand(t, r.i + 1);
      if (t > tCi && t < tMit + 0.6 && r.i === 2) p = A.wave(t, 2);
      if (t >= tChe - 0.2 && (r.i === 1 || r.i === 3)) p = A.cheer(t, r.i);
      if (t >= tChe - 0.2) { p.look = [O.city.position.x - 0.59, K.TOP + 0.1, 0.6]; p.lookW = 0.5; }
      K.act(r, p, t, { mouth: t > tChe ? 'open' : 'smile', eye: t > tGue + 0.4 ? 'flat' : undefined }); });
    // Rudolf: watches; lifts her own price tag on the price war; puts the check down and sends it sliding
    let p;
    const tagPt = [tagHome[0], K.TOP + 0.13, tagHome[1]];
    if (t < tGu - 0.4) p = K.behind(t, 4);
    else if (t < tNo - 0.3) p = K.handTo(t, 4, 'R', tagPt, ss(tGu - 0.4, tGu + 0.2, t) * (1 - ss(tNo - 0.8, tNo - 0.3, t)), { base: tt => K.behind(tt, 4), hand: A.HAND.pinch });
    else { const w = ss(tNo - 0.3, tCo - 0.2, t) * (1 - ss(tCo + 0.35, tCo + 0.8, t)), hz = Math.min(cz, -0.3);
      p = K.handTo(t, 4, 'R', [0.08, K.TOP + 0.012, hz], w, { base: tt => K.lean(tt, 4, 0.4), hand: A.HAND.point, look: [0.06, K.TOP, 0.4] }); }
    K.act(rud, p, t, t > tGue + 0.2 ? K.FACE.smug : K.FACE.smugTalk(t > L[0].t0 && t < L[2].t1));
    O.tagUs.position.y = t > tGu - 0.4 && t < tNo - 0.3 ? 0.06 * ss(tGu - 0.1, tGu + 0.4, t) * (1 - ss(tNo - 0.7, tNo - 0.3, t)) : 0;
    O.tv.draw('w' + Math.round(t * 24), (x, W, H) => SC.priceWar(x, W, H, ss(tUs - 0.1, tCua + 0.3, t)));
    return K.stamp(t + ctx.start) + K.slam(t, tGue + 0.45, ctx.dur + 1, 'VENDIDO', { y: 600, size: 110 });
  };
  const sfx = [
    { t: tAp - 0.1, type: 'neon', dur: 2.5, vol: 0.35 }, { t: tMit - 0.15, type: 'pop', vol: 0.3 }, { t: tUs - 0.15, type: 'crt', vol: 0.28 },
    { t: tNo - 0.2, type: 'paper', vol: 0.4 }, { t: tCo + 0.05, type: 'slide', vol: 0.55 }, { t: tGue + 0.45, type: 'stamp', vol: 0.7 }, { t: tGue + 0.5, type: 'register', vol: 0.45 },
  ];
  const shots = [
    { t0: 0, set: O, p0: [-0.95, 1.5, 1.05], l0: [-0.6, 0.86, 0.3], p1: [-0.85, 1.22, 0.85], l1: [-0.6, 0.86, 0.33], fov0: 50, act },
    { t0: tCi - 0.3, set: O, p0: [-0.5, 0.9, 0.95], l0: [-0.6, 0.86, 0.4], p1: [-0.52, 0.89, 0.88], l1: [-0.6, 0.86, 0.41], fov0: 58, act },
    { t0: tGu - 0.35, set: O, p0: [0.38, 1.28, 0.35], l0: [-0.05, 1.12, -0.62], p1: [0.34, 1.27, 0.26], l1: [-0.06, 1.12, -0.62], fov0: 50, act },
    { t0: tUs - 0.2, set: O, p0: tv.p, l0: tv.l, p1: tv.p.map((v, i) => v + (tv.l[i] - v) * 0.1), l1: tv.l, fov0: 50, act },
    { t0: tNo - 0.3, set: O, p0: [0.06, 0.87, 0.78], l0: [0.04, 1.02, -0.6], p1: [0.06, 0.88, 0.72], l1: [0.04, 1.0, -0.6], fov0: 50, act },
    { t0: tChe - 0.2, set: O, p0: [-0.5, 0.9, 0.95], l0: [-0.6, 0.88, 0.42], p1: [-0.53, 0.89, 0.86], l1: [-0.6, 0.88, 0.43], fov0: 58, act },
  ];
  const inst = { scene: O, scenes: [O], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
