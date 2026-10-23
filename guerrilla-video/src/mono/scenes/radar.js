import * as THREE from 'three';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as SC from '../screens.js';
import * as P from '../props.js';
import * as A from '../../whatif/anim.js';
import { run, wt } from '../../whatif/shots.js';
const { ss } = K;

// "Cómprelas pequeñas": she lifts a tiny house to her eye between two fingers. The monitor: deals above the notification
// threshold get reviewed, the small ones pass unseen; then the histogram piles up just below the line.
export function build(ctx) {
  const L = ctx.L;
  const tEs = wt(L[0], 'eso'), tCo = wt(L[0], 'cómprelas'), tPe = wt(L[0], 'pequeñas'), tDe = wt(L[0], 'debajo'), tAv = wt(L[0], 'avisar');
  const tCu = wt(L[1], 'curiosamente'), tMu = wt(L[1], 'muchas'), tJu = wt(L[1], 'justo'), tLi = wt(L[1], 'línea');
  const O = S.office(), rud = K.host(O), tv = K.tvShot(O, 0.98, 0.02, 0.04);
  const hs = P.house(77); hs.userData.dynamic = true; O.add(hs);
  const p0 = new THREE.Vector3(-0.15, K.TOP, -0.42), p1 = new THREE.Vector3(-0.07, 1.27, -0.56);
  const act = t => {
    const lift = ss(tCo - 0.1, tPe + 0.45, t), hp = p0.clone().lerp(p1, lift); hp.y += 0.04 * Math.sin(Math.PI * lift);
    hs.position.copy(hp); hs.rotation.set(0.15 * lift, 0.6 * lift + 0.2 * Math.sin(t * 0.8) * lift, 0);
    const reach = ss(tEs - 0.2, tCo - 0.1, t);
    const p = K.handTo(t, 7, 'R', [hp.x + 0.015, hp.y + 0.05, hp.z - 0.035], reach, { base: tt => K.behind(tt, 7), hand: A.HAND.pinch, look: hp.toArray() });
    K.act(rud, p, t, t > tLi + 0.15 ? K.FACE.wink : K.FACE.smugTalk(t > L[0].t0 && t < L[1].t1));
    O.led.set('80%'); O.flow.share = () => 0.02;
    O.tv.draw('r' + Math.round(t * 24), (x, W, H) => SC.radar(x, W, H, ss(tDe - 0.2, tAv + 0.6, t), ss(tMu - 0.3, tLi + 0.2, t)));
    return K.stamp(t + ctx.start);
  };
  const sfx = [
    { t: tCo, type: 'click', vol: 0.25 }, { t: tDe - 0.25, type: 'crt', vol: 0.28 }, { t: tDe, type: 'sonar', vol: 0.35 }, { t: tDe + 1.6, type: 'sonar', vol: 0.3 },
    { t: tMu - 0.2, type: 'beep', vol: 0.15 }, { t: tLi + 0.15, type: 'sting', vol: 0.25 },
  ];
  const shots = [
    { t0: 0, set: O, p0: [0.3, 1.3, 0.12], l0: [-0.06, 1.2, -0.66], p1: [0.24, 1.32, -0.02], l1: [-0.06, 1.24, -0.66], fov0: 48, act },
    { t0: tDe - 0.3, set: O, p0: tv.p, l0: tv.l, p1: tv.p.map((v, i) => v + (tv.l[i] - v) * 0.1), l1: tv.l, fov0: 50, act },
    { t0: tJu - 0.1, set: O, p0: [0.16, 1.32, -0.12], l0: [-0.03, 1.33, -0.82], p1: [0.12, 1.33, -0.2], l1: [-0.03, 1.33, -0.82], fov0: 44, act },
  ];
  const inst = { scene: O, scenes: [O], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
