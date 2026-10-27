import * as THREE from 'three';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import { run, wt, walkIn } from '../../whatif/shots.js';
const { ss } = K;

// Chapter 6, the morning: 8 a.m. shift change, a guard finds the cases open and empty; the cookies and the glasses left
// from the party; the nine guards lined up for questioning; the front page; Interpol, customs, airports and the experts'
// theory (professionals); the 50-million-peso reward that was never paid.
export function build(ctx) {
  const L = ctx.L;
  const t1 = L[1].t0, t2 = L[2].t0, t3 = L[3].t0, t4 = L[4].t0, tExp = wt(L[4], 'expertos'), t5 = L[5].t0, tNun = wt(L[5], 'nunca');
  // ---- the Oaxaca hall in the morning: cases open and empty
  const O = S.sala('oaxaca', { night: false });
  for (const c of O.cases) { c.v.open(1); c.piece.visible = false; }
  const g1 = K.person(O, 'spe', 'guardia', 2.6, 3.2, -2.5), g2 = K.person(O, 'tamamo', 'guardia', 3.6, 3.8, -2.6);
  // ---- the guards' room, empty, in grey morning light
  const G = S.guardia(); G.userData.look = { ...G.userData.look, sat: 0.85, warm: 0.02, cool: 0.1 };
  // ---- the line-up of the nine
  const Lu = S.lineup(), keys = ['tamamo', 'cafe', 'doto', 'mcqueen', 'suzuka', 'helios', 'spe', 'hishi', 'doto'];
  const nine = keys.map((k, i) => K.person(Lu, k, 'guardia', -2.0 + i * 0.5, 0.15 + (i % 2) * 0.05, 0));
  // ---- police at the museum's door (Reforma, grey morning)
  const R = S.reforma({ fireworks: false });
  const cars = [[-2.5, -3.2, 0.3], [2.6, -3.6, -0.4], [6.5, -2.8, 0.1]].map(([x, z, ry]) => { const c = P.sedan80('#e8e8e4', { police: true, night: true }); c.position.set(x, 0, z); c.rotation.y = ry; R.add(c); return c; });
  const cops = [[-1.0, -6.6, 0.2], [0.6, -6.9, -0.3], [3.8, -6.2, 0.4], [1.8, -5.6, 2.8]].map(([x, z, y], i) => K.person(R, ['helios', 'mcqueen', 'hishi', 'cafe'][i], 'agente', x, z, y));
  const act = t => {
    G.tick(t); R.tick(t); cars.forEach((c, i) => c.blink(t + i * 0.37, 1));
    const gw = walkIn(g1, t, 0.4, [2.6, 3.2], -2.5, 2.2, { seed: 1, speed: 0.4 });
    const shock = ss(3.4, 4.0, t);
    K.act(g1, K.mix(gw, K.A.stand(t, 1), shock * 0.0), t, shock > 0.5 ? { eye: 'shock', mouth: 'open' } : {});
    K.act(g2, walkIn(g2, t, 1.6, [3.6, 3.8], -2.6, 1.6, { seed: 2, speed: 0.38 }), t, t > 4.6 ? { eye: 'shock', mouth: 'open' } : {});
    nine.forEach((r, i) => K.act(r, K.A.stand(t, i, { amt: 0.25 }), t, { eye: i % 3 === 0 ? 0.4 : 'open', mouth: [0, 0] }));
    cops.forEach((r, i) => K.act(r, i === 3 ? K.A.phone(t, i) : K.A.talk(t, i, 0.4), t, { talk: i === 3 ? 0.6 : false }));
    return U.letterbox(1) + U.chapter(t, 0.3, t1 - 0.4, 6, 'LA MAÑANA') +
      U.cctv(t, 0.0, t1 - 0.2, 'CÁMARA 4 · SALA OAXACA', '25·DIC·1985', 8 * 3600 - 2, { frame: false }) +
      U.stamp(t, t2 + 0.5, t3 - 0.15, 'DETENIDOS', { x: 960, y: 230, size: 96, rot: -4 }) +
      U.newspaper(t, t3 - 0.15, t4 - 0.05, '¡EL ROBO DEL SIGLO!', 'Desaparecen piezas invaluables del Museo de Antropología') +
      U.stamp(t, t4 + 0.3, t5 - 0.2, 'INTERPOL', { x: 560, y: 300, size: 70, rot: -6, col: '#e8c060' }) + U.stamp(t, t4 + 1.1, t5 - 0.2, 'ADUANAS', { x: 960, y: 420, size: 70, rot: 4, col: '#e8c060' }) +
      U.stamp(t, t4 + 1.9, t5 - 0.2, 'AEROPUERTOS', { x: 1380, y: 300, size: 70, rot: -3, col: '#e8c060' }) +
      U.dossier(t, tExp - 0.2, t5 - 0.15, 'HIPÓTESIS', ['Banda internacional', 'de profesionales'], { x: 1240, y: 520, w: 520, rot: 2 }) +
      U.counter(t, t5 - 0.1, ctx.dur + 1, 'RECOMPENSA', 0, 50000000, { x: 960, y: 470, dur: 1.4, fmt: v => '$' + v.toLocaleString('en-US'), size: 150, note: 'PESOS · ASOCIACIÓN DE AMIGOS DEL MUSEO' }) +
      U.stamp(t, tNun + 0.1, ctx.dur + 1, 'NUNCA SE PAGÓ', { x: 960, y: 700, size: 80, rot: -7 }) + (t >= t5 - 0.1 ? U.black(0.55) : '');
  };
  const sfx = [
    { t: 0, type: 'steps', dur: 2.6, vol: 0.3 }, { t: 3.5, type: 'sting', vol: 0.45 }, { t: 3.6, type: 'heart', dur: 3, vol: 0.2 },
    { t: t1, type: 'clock', dur: t2 - t1, vol: 0.2 }, { t: t2, type: 'camera', dur: 2.2, vol: 0.35 }, { t: t2 + 0.5, type: 'stamp', vol: 0.6 },
    { t: t3 - 0.15, type: 'whoosh', vol: 0.35 }, { t: t3 + 0.6, type: 'press', vol: 0.45 },
    { t: t4, type: 'sirens', dur: tExp - t4, vol: 0.25 }, { t: t4 + 0.3, type: 'stamp', vol: 0.5 }, { t: t4 + 1.1, type: 'stamp', vol: 0.5 }, { t: t4 + 1.9, type: 'stamp', vol: 0.5 },
    { t: tExp - 0.2, type: 'typewriter', dur: 1.8, vol: 0.3 }, { t: t5, type: 'register', vol: 0.4 }, { t: tNun + 0.1, type: 'stamp', vol: 0.7 },
  ];
  const shots = [
    { t0: 0, set: O, p0: [-2.2, 1.25, 3.0], l0: [1.0, 0.8, -0.2], p1: [-1.7, 1.15, 2.6], l1: [1.0, 0.8, -0.3], fov0: 50, act },
    { t0: t1 - 0.2, set: G, p0: [0.9, 0.95, 0.55], l0: [0.2, 0.42, -0.6], p1: [0.6, 0.85, 0.35], l1: [0.1, 0.42, -0.65], fov0: 44, act },
    { t0: t2 - 0.15, set: Lu, p0: [0, 0.85, 4.2], l0: [0, 0.65, 0], p1: [0, 0.8, 3.7], l1: [0, 0.65, 0], fov0: 48, act },
    { t0: t3 - 0.15, set: Lu, p0: [0, 0.8, 3.7], l0: [0, 0.65, 0], fov0: 48, act },
    { t0: t4 - 0.05, set: R, p0: [4.5, 1.6, 3.0], l0: [1.2, 1.1, -6.2], p1: [3.2, 1.5, 1.6], l1: [1.0, 1.1, -6.4], fov0: 50, act },
    { t0: t5 - 0.15, set: R, p0: [3.2, 1.5, 1.6], l0: [1.0, 1.1, -6.4], fov0: 50, act },
  ];
  const inst = { scene: O, scenes: [O, G, Lu, R], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
