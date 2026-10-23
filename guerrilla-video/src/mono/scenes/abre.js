import * as K from '../kit.js';
import * as S from '../sets.js';
import { run, wt } from '../../whatif/shots.js';
const { PI } = Math;

// Cold open: lightning, Rudolf at the rainy window with her back to us; she turns ("Buenas noches, Entrenador"),
// the door swings shut by itself, the war table lights up and she smiles: "sin romper una sola ley".
export function build(ctx) {
  const L = ctx.L;
  const tNo = wt(L[0], 'noches'), tEn = wt(L[0], 'entrenador'), tPa = wt(L[0], 'pase'), tCi = wt(L[0], 'cierre'), tPu = wt(L[0], 'puerta');
  const tC = L[1].t0 - 0.25, tQu = wt(L[1], 'quedarse'), tMe = wt(L[1], 'mercado'), tSin = wt(L[1], 'sin'), tLey = wt(L[1], 'ley');
  const O = S.office(), rud = K.host(O, -1.3, -2.75, PI);
  O.lightning = K.flashes([0.35, tLey + 0.12]);
  const atWindow = t => K.turn(rud, t, tNo - 0.2, tEn + 0.45, PI, 0.12, tt => K.behind(tt, 2));
  const act = t => {
    const win = t < tC;
    if (win) { rud.root.position.set(-1.3, 0, -2.75); K.act(rud, atWindow(t), t, { ...K.FACE.smugTalk(t > L[0].t0 && t < L[0].t1), eye: t < tEn ? 0.3 : 0.35 }); }
    else { rud.root.position.set(...S.HOST); rud.root.rotation.y = 0;
      K.act(rud, K.steeple(t, 2), t, t > tLey - 0.1 ? K.FACE.smug : K.FACE.smugTalk(t > L[1].t0 && t < L[1].t1)); }
    // the door shuts on its own; the grid and the tower wake up for "un mercado entero"
    O.door.rotation.y = PI / 2 - 0.95 * (1 - K.ss(tCi, tPu + 0.55, t));
    const g = win ? 0.25 : K.ss(tC, tMe + 0.3, t); O.gridK = 0.25 + 0.75 * g; O.tower.glow(win ? 0.3 : K.ss(tQu, tMe + 0.4, t));
    O.flow.on = () => win ? 0 : K.ss(tQu, tMe + 0.5, t);
    O.led.set('61%');
    return K.stamp(t + ctx.start);
  };
  const sfx = [
    { t: 0, type: 'rain', dur: 400, vol: 0.42 }, { t: 0, type: 'clock', dur: 400, vol: 0.14 }, { t: 0.4, type: 'thunder', vol: 0.75 },
    { t: tEn - 0.1, type: 'creak', vol: 0.18 }, { t: tCi, type: 'creak', vol: 0.45 }, { t: tPu + 0.55, type: 'door', vol: 0.6 },
    { t: tC, type: 'swell', vol: 0.25 }, { t: tQu, type: 'hum', dur: 3, vol: 0.3 }, { t: tLey + 0.12, type: 'thunder', vol: 0.9 },
  ];
  const shots = [
    { t0: 0, set: O, p0: [-1.22, 1.22, -0.55], l0: [-1.32, 1.42, -3.6], p1: [-1.25, 1.28, -1.15], l1: [-1.3, 1.4, -3.6], fov0: 50, ease: 'out', act },
    { t0: tPa - 0.35, set: O, p0: [-0.72, 1.32, -1.3], l0: [-1.3, 1.3, -2.75], p1: [-0.8, 1.33, -1.55], l1: [-1.3, 1.32, -2.75], fov0: 44, act },
    { t0: tC, set: O, p0: [0.05, 2.75, 1.75], l0: [0, 0.85, -0.25], p1: [0.0, 2.05, 1.35], l1: [0, 0.95, -0.35], fov0: 52, ease: 'inOut', act },
    { t0: tSin - 0.3, set: O, p0: [0.22, 1.0, 0.32], l0: [0, 1.32, -0.82], p1: [0.15, 1.04, 0.12], l1: [0, 1.33, -0.82], fov0: 42, ease: 'out', act },
  ];
  const inst = { scene: O, scenes: [O], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
