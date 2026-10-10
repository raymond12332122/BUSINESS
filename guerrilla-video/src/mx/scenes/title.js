import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp, lerp } from '../../lib/util.js';
import { partTimes } from '../../lib/kit.js';
import * as X from '../props.js';
import * as K from '../kit.js';
import * as A from '../anim.js';
import { desert, aimSun } from '../sets.js';
import { runShots } from '../shots.js';
import { film, nameplate } from '../ui.js';

export function build(ctx) {
  const L = ctx.L;
  // ---- set 1: train crossing the desert at golden hour
  const S1 = desert('golden', { rail: 0, seed: 21, clear: [[6, 7, 5]] });
  const train = X.steamTrain(4); train.rotation.y = Math.PI / 2; S1.add(train);
  const riders = [];
  train.cars.forEach((car, ci) => {
    for (let k = 0; k < 3; k++) {
      const adelita = ci === 1 && k === 1;
      const r = K.person(car, adelita ? 'adelita' : ['doto', 'oguri', 'tamamo', 'helios'][(ci + k) % 4], adelita ? 'adelita' : 'rebelde', 0, -0.8 + k * 0.8, (k % 2 ? 1 : -1) * Math.PI / 2);
      r.root.position.y = car.roofY; r.mode = (ci + k) % 3; riders.push(r);
    }
  });
  const smoke = X.smokeTrail(S1, 16, { color: '#e8e2d6', size: 0.4, rise: 3, drift: [-2.5, 0, 0], life: 2.6 });
  // ---- set 2: the cast on a low rise
  const S2 = desert('golden', { seed: 22, clear: [[0, 6, 9]] });
  const order = [['diaz', 'Porfirio Díaz', 'El dictador'], ['madero', 'Francisco I. Madero', 'El demócrata'], ['zapata', 'Emiliano Zapata', 'El Caudillo del Sur'],
    ['villa', 'Pancho Villa', 'El Centauro del Norte'], ['huerta', 'Victoriano Huerta', 'El usurpador'], ['carranza', 'Venustiano Carranza', 'El Primer Jefe'],
    ['obregon', 'Álvaro Obregón', 'El general de Sonora'], ['adelita', 'Las Adelitas', 'Las soldaderas']];
  const cast = order.map(([w], i) => K.person(S2, w, w, -5.25 + i * 1.5, 6, 0));
  const flagMX = X.flag('mx', 4.2, 1.8, 1.1); flagMX.position.set(6.7, 0, 3.4); S2.add(flagMX);

  const sfx = [{ t: 0.2, type: 'train', dur: L[1].t0, vol: 0.8 }, { t: 0.3, type: 'whistle' }, { t: L[2].t0, type: 'sting' }];
  const shots = [
    { t0: 0, set: S1, p0: [9, 1.3, 7.5], l0: [-6, 1.8, 0], p1: [12, 1.5, 6.5], l1: [2, 1.6, 0], fov0: 42, act: (t) => {
      const x = -14 + t * 3.0; train.position.set(x, 0, 0);
      smoke(t, train.localToWorld(train.stack.clone()));
      riders.forEach((r, i) => { const p = r.mode === 0 ? { ...A.sit(t, r.seed), gun: 'port' } : r.mode === 1 ? { ...C.cheer(t * 0.8, i), gun: 'none' } : { ...C.idle(t, r.seed), gun: 'low' };
        K.pose(r, p); r.setFace(r.mode === 1 ? 'happy' : C.blinkEye(t, r.seed), r.mode === 1 ? 'teeth' : 'smile'); });
      aimSun(S1, x * 0.5, 0);
      const k = ss(1.0, 1.8, t) * (1 - ss(L[1].t0 - 0.6, L[1].t0, t));
      return film(t) + (k > 0 ? `<div class="title" style="top:110px;opacity:${k};transform:translateY(${(1 - ss(1.0, 1.8, t)) * 24}px)"><div class="k">1910 – 1920 · CONTADA CON CHIBIS</div><div class="h" style="font-size:128px">LA REVOLUCIÓN<br>MEXICANA</div></div>` : '');
    } },
    { t0: L[1].t0, set: S2, p0: [-5.25, 1.05, 9.6], l0: [-5.25, 0.85, 6], p1: [5.25, 1.05, 9.6], l1: [5.25, 0.85, 6], fov0: 34, ease: 'lin', act: (t) => {
      cast.forEach((c, i) => { const g = c.gun ? 'low' : 'none'; K.pose(c, { ...(i === 0 ? A.proud(t, c.seed) : C.idle(t, c.seed)), gun: g }); c.setFace(C.blinkEye(t, c.seed), i === 4 ? 'neutral' : 'smile'); });
      flagMX.wave(t); aimSun(S2, 0, 6);
      const span = L[1].t1 - L[1].t0;
      return film(t) + cast.map((c, i) => nameplate(ctx, [c.root.position.x, 1.42, c.root.position.z], order[i][1], order[i][2], L[1].t0 + 0.15 + i * span / 8 - 0.4, L[1].t0 + 0.15 + (i + 1) * span / 8 + 0.6)).join('');
    } },
    { t0: L[2].t0 - 0.2, set: S2, p0: [0, 1.45, 18.2], l0: [0, 1.0, 6], p1: [0, 1.4, 17.4], l1: [0, 1.0, 6], fov0: 32, act: (t) => {
      cast.forEach((c, i) => { K.pose(c, { ...C.cheer(t + i * 0.17, i), gun: 'none' }); c.setFace(i % 3 ? 'happy' : 'sparkle', 'teeth'); });
      flagMX.wave(t); aimSun(S2, 0, 6);
      const k = ss(L[2].t0, L[2].t0 + 0.5, t);
      return film(t) + `<div class="title" style="top:90px;opacity:${k}"><div class="k">ESTA ES</div><div class="h" style="font-size:112px">LA REVOLUCIÓN MEXICANA</div></div>`;
    } },
  ];
  const inst = { scene: S1, scenes: [S1, S2], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
