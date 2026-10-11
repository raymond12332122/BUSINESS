import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as N from '../props.js';
import * as MS from '../../mx/sets.js';
import { runShots, wt } from '../../mx/shots.js';
import * as U from '../ui.js';

export { preload } from '../mapkit.js';

export function build(ctx) {
  const L = ctx.L;
  const tCasi = wt(L[0], 'casi'), tInegi = wt(L[0], 'inegi'), tMas = wt(L[0], 'mas'), tDes = wt(L[0], 'desaparecidos');
  const tQ1 = wt(L[1], 'como'), tQ2 = wt(L[1], 'de$'), tQ3 = wt(L[1], 'y$');

  // ---- 1. Missing-person posters and candles at night
  const P = S.posterStreet();
  const m1 = K.person(P, 'doto', 'buscadora', -1.3, -1.35, Math.PI + 0.25);
  const m2 = K.person(P, 'mcqueen', 'buscadora', 0.9, -0.95, Math.PI - 0.35);
  K.faceTint(m1, '#c9c2d8'); K.faceTint(m2, '#c9c2d8');
  // ---- 2. Palacio Nacional at dusk
  const Z = MS.zocalo('dusk');
  // ---- 3. Highway at night: a convoy of pickups
  const H = S.highway('nightCity');
  const convoy = [0, 1, 2].map(i => { const p = N.pickup(['#1d1e22', '#2a2c30', '#141518'][i], { night: true }); p.position.set(i % 2 ? 1.7 : -1.7, 0, -40 - i * 9); H.add(p); return p; });

  const sfx = [{ t: 0.0, type: 'drone', dur: 11.2, vol: 0.45 }, { t: tCasi - 0.1, type: 'pop', vol: 0.4 }, { t: tMas, type: 'pop', vol: 0.4 },
    { t: L[1].t0 - 0.3, type: 'whoosh', vol: 0.4 }, { t: tQ1, type: 'tick', vol: 0.3 }, { t: tQ2, type: 'tick', vol: 0.3 }, { t: tQ3, type: 'tick', vol: 0.3 },
    { t: L[2].t0 - 0.6, type: 'engines', dur: ctx.dur - L[2].t0 + 0.6, vol: 0.55 }, { t: L[2].t0, type: 'hit', vol: 0.7 }];

  const tB = L[1].t0 - 0.3, tC = L[2].t0 - 0.35;
  const shots = [
    { t0: 0, set: P, p0: [0.3, 1.25, 5.2], l0: [0, 1.05, -2.2], p1: [0.2, 1.15, 3.6], l1: [0, 1.05, -2.2], fov0: 40, act: (t) => {
      P.candles.forEach(c => c.flicker(t)); P.warm.intensity = 5.5 + 0.8 * Math.sin(t * 9) * Math.sin(t * 4.3);
      K.pose(m1, { ...C.idle(t, 1, 0.4), head: [6, 0, 0] }); m1.setFace('flat', 'frown');
      K.pose(m2, { ...C.crouch(t, 2, 0.8) }); m2.setFace(C.blinkEye(t, 2), 'frown');
      return U.film(t) + U.counter(t, tCasi - 0.1, tB, 160, 180, 27989, 'asesinatos en 2025', { from: 0, dur: 1.3, color: '#ff8a6a', w: 520 })
        + U.counter(t, tMas - 0.1, tB, 160, 400, 132735, 'personas desaparecidas', { from: 0, dur: 1.3, color: '#ffd27a', w: 520 })
        + U.source(t, tInegi, tB, 'INEGI (2025, preliminar) · Registro Nacional de Personas Desaparecidas (ago. 2026)');
    } },
    { t0: tB, set: Z, p0: [0, 2.2, 14], l0: [0, 4.2, -16], p1: [0, 2.0, 9], l1: [0, 4.6, -16], fov0: 42, act: (t) => {
      Z.flag.wave(t);
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,10,16,.35)"></div>`
        + U.questions(t, tB + 0.1, tC + 0.1, [['¿Cómo llegamos aquí?', tQ1 - 0.1], ['¿Estamos cayendo poco a poco?', tQ2 - 0.1], ['¿Qué hace el gobierno?', tQ3 - 0.1]]);
    } },
    { t0: tC, set: H, p0: [4.6, 1.0, 8], l0: [-0.5, 1.2, -20], p1: [4.2, 0.9, 6], l1: [-0.5, 1.2, -20], fov0: 40, act: (t) => {
      convoy.forEach((p, i) => { p.position.z = -38 - i * 9 + (t - tC) * 9.5; p.drive(t, 3); p.visible = p.position.z < 14; });
      return U.film(t) + U.titleCard(t, L[2].t0 - 0.1, ctx.dur + 1, 'MÉXICO · 2026', 'CORRUPCIÓN, CÁRTELES<br>Y NARCOTRÁFICO', '¿Por qué la violencia no se acaba?', 150);
    } },
  ];
  const inst = { scene: P, scenes: [P, Z, H], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
