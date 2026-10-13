import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as A from '../anim.js';
import { leader, NAMES } from '../leaders.js';

export async function preload() {}

export function build(ctx) {
  const L = ctx.L;
  const tMarzo = wt(L[0], 'marzo'), tRen = wt(L[0], 'renuncio'), tVag = wt(L[0], 'vagon');
  const tOcho = wt(L[1], 'ocho'), tLenin = wt(L[1], 'lenin'), tTomo = wt(L[1], 'tomo'), tNoche = wt(L[1], 'noche');
  const tNacio = wt(L[2], 'nacio'), tEsta = wt(L[2], 'esta'), tRev = wt(L[2], 'revolucion');

  // ---- 1. Pskov station at night: the imperial train under the snow
  const St = S.pskovStation();
  const guards = [[3.4, -3.5, 0.5], [3.3, -8.4, 0.3], [3.6, -13.8, 0.6], [3.1, 1.5, 0.2]].map(([x, z, y], i) => { const g = K.person(St, ['doto', 'oguri', 'tamamo', 'helios'][i], 'soldadoInvierno', x, z, y); g.root.position.y = St.platform.top; return g; });
  // ---- 2. Inside the saloon car: Nicholas II signs
  const Sa = S.trainSaloon();
  const tsar = leader(Sa, 'nicolas', Sa.seat[0], Sa.seat[2], 0); tsar.root.position.y = Sa.seat[1];
  const envoys = [K.person(Sa, 'suzuka', 'delegado', -0.95, -0.45, 1.25), K.person(Sa, 'daiwa', 'delegado', -1.45, -0.05, 1.05)];
  // ---- 3. Smolny at night: Lenin speaks to the Red Guards
  const Sm = S.smolny();
  const lenin = leader(Sm, 'lenin', 0, -16.0, 0); lenin.root.position.y = 0.8;
  const reds = K.crowd(Sm, ['guardiaRoja', 'marinero', 'guardiaRoja', 'obrero'], 18, [-5, -13.2, 5, -7.5], { seed: 11, yaw: Math.PI });
  const smFlags = [[-3.5, -9.5], [3.2, -10.5]].map(([x, z], i) => { const f = P.redFlag(3.4, 1.3, 0.85); f.position.set(x, 0, z); Sm.add(f); return f; });
  // ---- 4. Palace Square, night of 25 October: Red Guards cross to the palace
  const Ps = S.palaceSquare('snowNight', { barricade: true });
  const runners = K.crowd(Ps, ['guardiaRoja', 'marinero', 'guardiaRoja', 'ejercitoRojo'], 12, [-5, -6, 5, 0], { seed: 23, yaw: Math.PI });
  runners.forEach(r => r.z0 = r.root.position.z);
  // ---- 5. The Kremlin at night, the red flag over the Senate
  const Kr = S.kremlinNight();
  const fl = Kr.sovietFlag, flBase = fl.geometry.attributes.position.array.slice();
  const waveFlag = t => { const p = fl.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = flBase[i * 3] + 1.5; p.setZ(i, 0.18 * (x / 3) * Math.sin(x * 2.4 - t * 3.6)); } p.needsUpdate = true; fl.geometry.computeVertexNormals(); };

  const tB = tRen - 0.55, tC = L[1].t0 - 0.35, tC2 = tTomo - 0.3, tD = L[2].t0 - 0.35;
  const sfx = [{ t: 0.0, type: 'wind', dur: tB + 0.3, vol: 0.35 }, { t: 0.2, type: 'hiss', dur: 3.0, vol: 0.22 }, { t: tB + 0.3, type: 'paper', vol: 0.45 }, { t: tVag - 0.1, type: 'stamp', vol: 0.5 },
    { t: tC, type: 'crowd', dur: tD - tC, vol: 0.4 }, { t: tC2, type: 'charge', vol: 0.4 }, { t: tC2 + 0.4, type: 'whistle', vol: 0.3 },
    { t: tD, type: 'bells', dur: ctx.dur - tD, vol: 0.32 }, { t: tEsta - 0.2, type: 'sting', vol: 0.55 }];

  const shots = [
    { t0: 0, set: St, p0: [2.35, 1.55, 9.5], l0: [1.2, 1.7, -9], p1: [2.45, 1.5, 3.2], l1: [1.2, 1.8, -10], fov0: 46, act: (t) => {
      St.tick(t);
      guards.forEach((g, i) => { K.pose(g, A.guard(t, i + 1)); g.setFace(C.blinkEye(t, i + 1), 'neutral'); });
      return U.film(t) + U.badge(t, 'Pskov · marzo de 1917', 'El tren del zar', 'Detenido en la estación, de noche', tMarzo - 0.2, tB);
    } },
    { t0: tB, set: Sa, p0: [0.62, 0.95, 0.95], l0: [-0.12, 0.55, -0.8], p1: [0.42, 0.86, 0.55], l1: [-0.08, 0.55, -0.8], fov0: 46, act: (t) => {
      K.pose(tsar, A.sign(t, 1)); tsar.setFace(C.blinkEye(t, 1), 'frown');
      envoys.forEach((e, i) => { K.pose(e, A.humble(t, i + 3)); e.setFace(C.blinkEye(t, i + 3), 'neutral'); });
      return U.film(t) + U.stamp(t, 'ABDICA', tVag - 0.1, tC, { x: 1430, y: 430, rot: -9 });
    } },
    { t0: tC, set: Sm, p0: [2.4, 1.55, -5.0], l0: [0, 1.3, -16], p1: [1.9, 1.45, -6.6], l1: [0, 1.35, -16], fov0: 40, act: (t) => {
      Sm.tick(t); smFlags.forEach((f, i) => f.wave(t + i));
      K.pose(lenin, A.orate(t, 2)); lenin.setFace(C.blinkEye(t, 2), C.talkMouth(t, 2));
      reds.forEach((r, i) => { K.pose(r, i % 3 ? { ...A.rally(t, i), gun: 'back' } : { ...A.guard(t, i), gun: 'port' }); r.setFace(C.blinkEye(t, i), i % 3 ? 'open' : 'neutral'); });
      return U.film(t) + U.nameplate(ctx, [0, 2.15, -16.0], NAMES.lenin[0], 'Líder de los bolcheviques', tLenin - 0.15, tC2);
    } },
    { t0: tC2, set: Ps, p0: [1.4, 1.05, 3.4], l0: [-1, 2.4, -30], p1: [1.1, 1.0, 2.2], l1: [-1, 2.6, -30], fov0: 46, act: (t) => {
      Ps.tick(t); const u = t - tC2;
      runners.forEach((r, i) => { r.root.position.z = r.z0 - u * (2.6 + (i % 3) * 0.25); K.pose(r, A.charge(t, i, 0.95)); r.setFace(C.blinkEye(t, i), 'open'); });
      return U.film(t) + U.badge(t, 'Petrogrado · 25 de octubre de 1917', 'Los bolcheviques', 'toman el poder en una noche', tTomo - 0.1, tD);
    } },
    { t0: tD, set: Kr, p0: [0, 1.8, 10], l0: [0, 10, -40], p1: [0, 3.4, 6], l1: [0, 14.5, -40], fov0: 44, act: (t) => {
      Kr.tick(t); waveFlag(t);
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(6,8,14,${0.15 + 0.3 * ss(tEsta - 0.5, tEsta, t)})"></div>`
        + U.titleCard(t, tEsta - 0.25, ctx.dur + 1, '1917 · 1922', 'LA REVOLUCIÓN<br>RUSA', 'Del último zar a la Unión Soviética', 150);
    } },
  ];
  const inst = { scene: St, scenes: [St, Sa, Sm, Ps, Kr], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
