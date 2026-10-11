import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import { badge } from '../../lib/kit.js';
import * as X from '../props.js';
import * as K from '../kit.js';
import * as A from '../anim.js';
import { desert, plaza, aimSun } from '../sets.js';
import { runShots, wt } from '../shots.js';
import { film } from '../ui.js';

export function build(ctx) {
  const L = ctx.L;
  const tIdea = wt(L[0], 'sufragio') - 0.6;
  // ---- the train at sunset (callback to the opening)
  const S1 = desert('dusk', { rail: 0, seed: 141, clear: [[6, 7, 5]] });
  const train = X.steamTrain(4); train.rotation.y = Math.PI / 2; S1.add(train);
  const riders = [];
  train.cars.forEach((car, ci) => { for (let k = 0; k < 3; k++) { const r = K.person(car, ['doto', 'oguri', 'tamamo', 'helios', 'suzuka'][(ci + k) % 5], (ci + k) % 4 === 1 ? 'adelita' : 'rebelde', 0, -0.8 + k * 0.8, (k % 2 ? 1 : -1) * Math.PI / 2); r.root.position.y = car.roofY; r.mode = (ci + k) % 2; riders.push(r); } });
  const smoke = X.smokeTrail(S1, 16, { color: '#d8d0c4', size: 0.42, rise: 3, drift: [-2.5, 0, 0], life: 2.6 });
  // ---- Madero's banner in the evening wind
  const R = plaza('dusk', 142);
  const st = X.stage(4.2, 2.4); st.position.set(0, 0, -4.4); R.add(st);
  const ban = X.banner('SUFRAGIO EFECTIVO\nNO REELECCIÓN', { w: 4.4, h: 1.15, size: 74, bg: '#f3ead6', fg: '#2a2320', accent: '#9b2d22' }); ban.position.set(0, 2.85, -5.45); R.add(ban);
  const madero = K.person(R, 'madero', 'madero', 0, -4.2, 0); madero.root.position.y = 0.5;
  // ---- everyone together
  const S2 = desert('golden', { seed: 143, clear: [[0, 6, 9]] });
  const order = ['diaz', 'madero', 'zapata', 'villa', 'huerta', 'carranza', 'obregon', 'adelita'];
  const cast = order.map((w, i) => K.person(S2, w, w, -5.25 + i * 1.5, 6, 0));
  const flagMX = X.flag('mx', 4.2, 1.8, 1.1); flagMX.position.set(6.7, 0, 3.4); S2.add(flagMX);

  const sfx = [{ t: 0.2, type: 'train', dur: tIdea + 0.5, vol: 0.6 }, { t: 0.4, type: 'whistle', vol: 0.6 }, { t: wt(L[0], 'sufragio'), type: 'cheer', vol: 0.5 }, { t: L[1].t0 - 0.1, type: 'sting', vol: 0.9 }];
  const shots = [
    { t0: 0, set: S1, p0: [9, 1.3, 7.5], l0: [-4, 1.8, 0], p1: [12, 1.5, 6.5], l1: [3, 1.6, 0], fov0: 42, act: (t) => {
      const x = -10 + t * 3.0; train.position.set(x, 0, 0); smoke(t, train.localToWorld(train.stack.clone()));
      riders.forEach((r, i) => { K.pose(r, r.mode ? { ...A.sit(t, r.seed), gun: 'port' } : { ...C.idle(t, r.seed), gun: 'low' }); r.setFace(C.blinkEye(t, r.seed), 'neutral'); });
      aimSun(S1, x * 0.5, 0);
      return film(t) + badge(t, '1910 – 1920', 'Diez años de guerra', 'Cerca de un millón de vidas', 0.8, tIdea - 0.1);
    } },
    { t0: tIdea, set: R, p0: [0.95, 1.15, -1.6], l0: [0, 1.7, -4.8], p1: [0.8, 1.17, -2.1], l1: [0, 1.74, -4.8], fov0: 48, act: (t) => {
      K.pose(madero, A.orate(t, 1, 0.9)); madero.setFace(C.blinkEye(t, 1), C.talkMouth(t, 1)); aimSun(R, 0, -2);
      return film(t);
    } },
    { t0: L[1].t0 - 0.2, set: S2, p0: [0, 1.45, 18.2], l0: [0, 1.0, 6], p1: [0, 1.4, 16.6], l1: [0, 1.05, 6], fov0: 32, act: (t) => {
      cast.forEach((c, i) => { K.pose(c, { ...C.cheer(t + i * 0.17, i), gun: 'none' }); c.setFace(i % 3 ? 'happy' : 'sparkle', 'teeth'); });
      flagMX.wave(t); aimSun(S2, 0, 6);
      const k = ss(L[1].t0, L[1].t0 + 0.5, t), out = ss(ctx.dur - 1.2, ctx.dur - 0.1, t);
      return film(t) + `<div class="title" style="top:80px;opacity:${k}"><div class="k">1910 – 1920</div><div class="h" style="font-size:112px">LA REVOLUCIÓN MEXICANA</div></div>`
        + (out > 0 ? `<div style="position:absolute;inset:0;background:#000;opacity:${out}"></div>` : '');
    } },
  ];
  const inst = { scene: S1, scenes: [S1, R, S2], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
