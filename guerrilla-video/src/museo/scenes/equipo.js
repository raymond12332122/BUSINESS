import * as THREE from 'three';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as U from '../ui.js';
import { run, wt, walkIn } from '../../whatif/shots.js';
const { ss } = K;

// Chapter 2, the crew: not an international gang (three shady figures get stamped NO) but two veterinary students in
// their twenties; their case files; fifty visits in six months round El Paraguas; photos, sketches and an eye on the
// guards; the patrol rule on the blueprint (26 halls every two hours).
export function build(ctx) {
  const L = ctx.L;
  const tNo = wt(L[0], 'mafia'), t1 = L[1].t0, tCar = wt(L[1], 'carlos'), tRam = wt(L[1], 'ramon'), t2 = L[2].t0, t3 = L[3].t0, tFot = wt(L[3], 'fotos'), tDib = wt(L[3], 'dibujos'), tObs = wt(L[3], 'observaban'), t4 = L[4].t0, tRut = wt(L[4], 'ellos');
  // ---- the imagined gang, then the real two at the height chart
  const G = S.lineup(), mafia = [-0.75, 0, 0.75].map((x, i) => K.person(G, ['hishi', 'mcqueen', 'cafe'][i], 'mafia', x, 0.1, 0));
  const Lu = S.lineup(), per = K.person(Lu, 'oguri', 'perchesDia', -0.42, 0.1, 0.05), sar = K.person(Lu, 'daiwa', 'sardinaDia', 0.42, 0.1, -0.05);
  // ---- daytime visits: the patio with visitors, then a hall
  const Pt = S.patio({ night: false });
  const vis = K.crowd(Pt, 'visitante', 10, [-7, -6, 7, 4], { seed: 5, face: [0, 0] });
  const p2 = K.person(Pt, 'oguri', 'perchesDia', 5.5, 3.8, -2.2), s2 = K.person(Pt, 'daiwa', 'sardinaDia', 6.1, 4.3, -2.2);
  const O = S.sala('oaxaca', { night: false });
  const p3 = K.person(O, 'oguri', 'perchesDia', 0.55, 0.0, -0.35), s3 = K.person(O, 'daiwa', 'sardinaDia', -0.6, 0.1, -0.2);
  const g3 = K.person(O, 'spe', 'guardia', -4.5, -2.6, Math.PI / 2);
  const act = t => {
    Pt.tick(t);
    mafia.forEach((r, i) => K.act(r, K.A.crossArms(t, i + 4), t, { eye: 0.4, mouth: [0, 0] }));
    K.act(per, K.A.stand(t, 1, { amt: 0.4 }), t, { eye: t > tCar && t < tCar + 0.5 ? 'blink' : 'open' }); K.act(sar, K.A.stand(t, 2, { amt: 0.4 }), t, {});
    vis.forEach((r, i) => K.act(r, K.A.stand(t, i), t, {}));
    K.act(p2, walkIn(p2, t, t2 - 0.3, [5.5, 3.8], -2.25, 3.4, { seed: 1, speed: 0.36 }), t, { smile: 0.4 });
    K.act(s2, walkIn(s2, t, t2 - 0.1, [6.1, 4.3], -2.25, 3.4, { seed: 2, speed: 0.36 }), t, { smile: 0.3 });
    const gw = walkIn(g3, t, tObs - 1.6, [-4.5, -2.6], Math.PI / 2, 3.6, { seed: 5, speed: 0.36 });
    K.act(g3, gw, t, {});
    const look = ss(tObs - 0.3, tObs + 0.4, t), gp = g3.root.position;
    const pp = K.mix(K.photo(t, 1, ss(tFot - 0.5, tFot, t) * (1 - ss(tFot + 1.2, tFot + 1.6, t))), K.A.stand(t, 1), look); if (look > 0) { pp.look = [gp.x, 0.9, gp.z]; pp.lookW = look; }
    K.act(p3, pp, t, {});
    const sp = K.mix(K.A.think(t, 2), K.A.stand(t, 2), look); if (look > 0) { sp.look = [gp.x, 0.9, gp.z]; sp.lookW = look; }
    K.act(s3, sp, t, {});
    const fl = Math.max(0, 1 - Math.abs(t - tFot - 0.1) / 0.12);
    return U.letterbox(1) + U.chapter(t, 0.2, t1 - 0.4, 2, 'EL EQUIPO') + U.stamp(t, tNo + 0.2, t1 - 0.1, 'NO', { x: 960, y: 560, size: 230, rot: -10 }) +
      U.dossier(t, tCar - 0.3, t2 - 0.1, 'A-1', ['CARLOS PERCHES TREVIÑO', 'Estudiante de veterinaria', 'UNAM · veinteañero', 'Sin antecedentes'], { x: 1250, y: 170, w: 540, rot: 2 }) +
      U.dossier(t, tRam - 0.3, t2 - 0.1, 'A-2', ['RAMÓN SARDINA GARCÍA', 'Estudiante de veterinaria', 'UNAM · veinteañero', 'Sin antecedentes'], { x: 120, y: 190, w: 540, rot: -2 }) +
      U.counter(t, t2 + 0.2, t3 - 0.2, 'VISITAS AL MUSEO', 1, 50, { x: 1560, y: 300, dur: 3.0, pad: 2, note: 'EN SEIS MESES' }) +
      U.flash(fl * 0.8) + U.blueprint(t, t4 - 0.1, ctx.dur + 1, 0, { patrol: Math.max(0, (t - t4) / 4.5), note: tRut < t ? '26 SALAS · RONDÍN CADA 2 HORAS' : '26 SALAS' }) + (t > t4 ? U.letterbox(1) : '');
  };
  const sfx = [
    { t: 0, type: 'hum', dur: t1, vol: 0.12 }, { t: tNo + 0.2, type: 'stamp', vol: 0.7 }, { t: tCar - 0.3, type: 'paper', vol: 0.4 }, { t: tCar, type: 'typewriter', dur: 2.4, vol: 0.3 },
    { t: tRam - 0.3, type: 'paper', vol: 0.4 }, { t: tRam, type: 'typewriter', dur: 2.4, vol: 0.3 },
    { t: t2, type: 'crowd', dur: t4 - t2, vol: 0.14 }, { t: t2, type: 'fountain', dur: t3 - t2, vol: 0.25 }, { t: t2 + 0.3, type: 'tick', vol: 0.2 },
    { t: tFot + 0.1, type: 'shutter', vol: 0.55 }, { t: tDib, type: 'quill', dur: 1.8, vol: 0.3 }, { t: tObs - 1.2, type: 'steps', dur: 2.6, vol: 0.25 },
    { t: t4, type: 'whoosh', vol: 0.3 }, { t: t4 + 0.2, type: 'clock', dur: ctx.dur - t4, vol: 0.2 },
  ];
  const shots = [
    { t0: 0, set: G, p0: [0, 0.8, 3.4], l0: [0, 0.65, 0], p1: [0, 0.75, 2.9], l1: [0, 0.65, 0], fov0: 44, act },
    { t0: t1 - 0.15, set: Lu, p0: [-0.7, 0.75, 3.0], l0: [-0.3, 0.62, 0], p1: [-0.4, 0.72, 2.5], l1: [-0.05, 0.62, 0], fov0: 44, act },
    { t0: t2 - 0.1, set: Pt, p0: [10.5, 1.1, 12], l0: [1, 3.4, 0], p1: [8.5, 1.0, 10], l1: [0.8, 3.6, 0], fov0: 54, act },
    { t0: t3 - 0.1, set: O, p0: [1.6, 1.1, 2.0], l0: [-0.2, 0.75, -0.6], p1: [1.2, 1.0, 1.6], l1: [-0.3, 0.75, -0.5], fov0: 50, act },
    { t0: t4 - 0.1, set: O, p0: [1.2, 1.0, 1.6], l0: [-0.3, 0.75, -0.5], fov0: 50, act },
  ];
  const inst = { scene: G, scenes: [G, Lu, Pt, O], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
