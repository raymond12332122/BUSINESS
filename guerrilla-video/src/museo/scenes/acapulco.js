import * as THREE from 'three';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as RP from '../../rusia/props.js';
import { run, wt, walkIn } from '../../whatif/shots.js';
const { ss, clamp } = K;

// Chapter 8, Acapulco: the bay at night, a disco terrace; Perches makes friends with traffickers and tries to trade the
// pieces; two of them change hands across a table; Salvador Gutiérrez, "El Cabo"; the neon sputters out on "perdición".
export function build(ctx) {
  const L = ctx.L;
  const t1 = L[1].t0, t2 = L[2].t0, tSal = wt(L[2], 'salvador'), t3 = L[3].t0;
  const A = S.acapulco();
  const per = K.person(A, 'oguri', 'perchesAca', -3.0, -0.35, Math.PI), n1 = K.person(A, 'mcqueen', 'narco', -3.35, -1.65, 0.25), n2 = K.person(A, 'tamamo', 'narco', -2.55, -1.7, -0.3);
  const dancers = K.crowd(A, 'fiesta', 6, [0.5, 0.4, 5, 2.8], { seed: 3, face: [0, -1] });
  const cabo = K.person(A, 'hishi', 'cabo', 2.0, -0.9, -0.9);
  for (const r of [per, n1, n2, cabo, ...dancers]) r.root.position.y = A.deckY;   // on the terrace deck, not sunk into it
  const gold = [0, 1].map(i => { const g = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.008, 18), P.goldM()); g.position.set(-3.08 + i * 0.12, 0.875, -0.75); A.add(g); g.userData.dynamic = true; return g; });
  const env = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.012, 0.1), new THREE.MeshStandardMaterial({ color: '#d8c8a0' })); env.position.set(-2.76, 0.876, -1.3); A.add(env); env.userData.dynamic = true;
  const act = t => {
    A.tick(t);
    K.act(per, K.A.talk(t, 1, 0.5), t, { talk: t > 0.6 && t < t1 ? 0.6 : false, smile: 0.4 });
    K.act(n1, K.A.crossArms(t, 2), t, { eye: 0.4 }); K.act(n2, K.A.stand(t, 3), t, { eye: 0.3 });
    dancers.forEach((r, i) => K.act(r, K.A.teioStep ? K.A.teioStep(t + i * 0.3, i, 118) : K.A.cheer(t, i), t, { eye: 'happy', smile: 0.8 }));
    const k = ss(t1 + 0.4, t1 + 2.2, t); gold.forEach((g, i) => { g.position.z = -0.75 - 0.42 * clamp(k * 1.2 - i * 0.2); }); env.position.z = -1.3 + 0.38 * ss(t1 + 2.0, t1 + 3.4, t);
    const turn = ss(tSal - 0.4, tSal + 0.6, t); cabo.root.rotation.y = -0.9 + 0.75 * turn;
    K.act(cabo, K.A.stand(t, 5, { amt: 0.4 }), t, { eye: t > t3 ? 0.45 : 'open', smile: 0.35 });
    if (t > t3 + 0.6) { A.neon.flicker(Math.sin(t * 40) > 0 ? 0.0 : 10); }
    return U.letterbox(1) + U.chapter(t, 0.2, t1 - 0.3, 8, 'ACAPULCO') + U.tag(t, 0.6, t1 - 0.2, 'GUERRERO', 'ACAPULCO · 1986', { x: 1300, y: 160 }) +
      U.counter(t, t1 + 0.3, t2 - 0.2, 'PIEZAS CAMBIADAS POR DROGA', 0, 2, { x: 1500, y: 330, dur: 1.6, pad: 1, size: 150 }) +
      U.dossier(t, tSal - 0.3, t3 + 0.2, 'B-7', ['SALVADOR GUTIÉRREZ', '«EL CABO»', 'Narcotraficante'], { x: 1240, y: 150, w: 520, rot: 2 });
  };
  const sfx = [
    { t: 0, type: 'waves', dur: ctx.dur, vol: 0.25 }, { t: 0, type: 'disco', dur: t3 + 0.6, vol: 0.32 }, { t: 0, type: 'crowd', dur: ctx.dur, vol: 0.12 }, { t: 0.4, type: 'neon', dur: 1.5, vol: 0.2 },
    { t: t1 + 0.5, type: 'slide', vol: 0.4 }, { t: t1 + 2.1, type: 'slide', vol: 0.35 }, { t: tSal - 0.3, type: 'typewriter', dur: 1.6, vol: 0.25 },
    { t: t3, type: 'sting', vol: 0.4 }, { t: t3 + 0.6, type: 'buzzoff', vol: 0.45 }, { t: t3 + 0.5, type: 'heart', dur: ctx.dur - t3, vol: 0.25 },
  ];
  const shots = [
    { t0: 0, set: A, p0: [1.5, 2.6, 2.8], l0: [-6, 2.5, -80], p1: [-0.5, 2.1, 1.4], l1: [-3, 1.2, -1.0], fov0: 50, act },
    { t0: 3.6, set: A, p0: [-1.8, 1.22, 0.6], l0: [-3.0, 1.1, -1.0], p1: [-2.1, 1.2, 0.3], l1: [-3.0, 1.1, -1.0], fov0: 46, act },
    { t0: t1 - 0.2, set: A, p0: [-2.95, 1.95, -0.7], l0: [-3.0, 0.87, -1.02], p1: [-2.97, 1.88, -0.74], l1: [-3.0, 0.87, -1.04], fov0: 40, act },
    { t0: t2 - 0.2, set: A, p0: [0.4, 1.35, 0.9], l0: [2.0, 1.15, -0.9], p1: [0.9, 1.32, 0.4], l1: [2.0, 1.16, -0.9], fov0: 44, act },
    { t0: t3 - 0.15, set: A, p0: [1.05, 1.28, 0.35], l0: [2.0, 1.15, -0.9], p1: [1.25, 1.26, 0.08], l1: [2.0, 1.16, -0.9], fov0: 42, act },
  ];
  const inst = { scene: A, scenes: [A], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
