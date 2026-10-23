import * as K from '../kit.js';
import * as S from '../sets.js';
import * as SC from '../screens.js';
import { run, wt } from '../../whatif/shots.js';
const { ss } = K;

// "Con esto termina la sesión": the city goes dark, the CRT collapses to a dot. "...por qué nadie se atreve a postularse
// contra mí": the election notice, one candidate. A wink, black, and the title.
export function build(ctx) {
  const L = ctx.L;
  const tTe = wt(L[0], 'termina'), tSe = wt(L[0], 'sesión'), tEn = wt(L[0], 'entrenador');
  const tEx = wt(L[1], 'explica'), tNa = wt(L[1], 'nadie'), tCon = wt(L[1], 'contra'), tEs = wt(L[1], 'estudiantil');
  const tEnd = L[1].t1 + 0.9;
  const O = S.office(), rud = K.host(O);
  const act = t => {
    const dark = ss(tTe, tEn + 0.4, t);
    O.gridK = 1 - 0.9 * dark; O.tower.glow(1 - 0.85 * dark); O.flow.on = () => 1 - dark; O.led.set('92%');
    O.boardLight.intensity = 4 * ss(tEx - 0.3, tEx + 0.3, t);
    const crtOff = ss(tSe, tSe + 0.35, t);
    O.tv.draw('o' + Math.round(crtOff * 30), (x, W, H) => { SC.idle(x, W, H, '92%'); if (crtOff > 0) { x.fillStyle = '#000'; const hh = H * (1 - crtOff) / 2, ww = W * Math.max(0.01, 1 - crtOff * 1.4) / 2;
      x.fillRect(0, 0, W, H / 2 - hh); x.fillRect(0, H / 2 + hh, W, H / 2 - hh); x.fillRect(0, 0, W / 2 - ww, H); x.fillRect(W / 2 + ww, 0, W / 2 - ww, H); if (crtOff > 0.95) { x.fillStyle = '#000'; x.fillRect(0, 0, W, H); } } });
    O.tv.glowLight.intensity = 0.8 * (1 - crtOff);
    const p = t < tTe ? K.steeple(t, 11) : K.behind(t, 11);
    K.act(rud, p, t, t > tEs + 0.1 ? K.FACE.wink : K.FACE.smugTalk(t > L[0].t0 && t < L[1].t1));
    return K.stamp(t + ctx.start) + K.black(ss(tEnd - 0.4, tEnd, t)) + K.title(t, tEnd + 0.2, ctx.dur + 1, 'Monopolio', 'ASÍ FUNCIONAN');
  };
  ctx.noCapsAfter = tEnd;
  const sfx = [
    { t: tTe, type: 'powerdown', vol: 0.5 },
    { t: tSe, type: 'crtoff', vol: 0.45 }, { t: tEx - 0.3, type: 'click', vol: 0.4 }, { t: tNa, type: 'sting', vol: 0.22 },
    { t: tEs + 0.1, type: 'chime', vol: 0.3 }, { t: tEnd + 0.2, type: 'bell', vol: 0.4 }, { t: tEnd + 0.1, type: 'thunder', vol: 0.5 },
  ];
  const shots = [
    { t0: 0, set: O, p0: [0, 1.28, 1.35], l0: [0, 1.12, -0.7], p1: [0, 1.3, 1.05], l1: [0, 1.15, -0.72], fov0: 50, act },
    { t0: tEx - 0.3, set: O, p0: [-2.25, 1.66, 0.52], l0: [-3.47, 1.58, 0.4], p1: [-2.6, 1.62, 0.44], l1: [-3.47, 1.58, 0.4], fov0: 46, ease: 'out', act },
    { t0: tCon - 0.2, set: O, p0: [0.14, 1.34, -0.05], l0: [0, 1.33, -0.82], p1: [0.1, 1.34, -0.16], l1: [0, 1.33, -0.82], fov0: 42, act },
  ];
  const inst = { scene: O, scenes: [O], sfx, hideCaptions: t => t > tEnd };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
