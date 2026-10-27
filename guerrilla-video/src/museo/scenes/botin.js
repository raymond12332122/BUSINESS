import * as K from '../kit.js';
import * as S from '../sets.js';
import * as U from '../ui.js';
import { run, wt } from '../../whatif/shots.js';
const { ss } = K;

// Chapter 1, the loot: the Maya hall at night, then each treasure in its glowing case: Pakal's jade mask in the crypt,
// the Zapotec bat god, the Mexica obsidian monkey under the Sun Stone (with its black-market value), Mixtec gold and the
// offerings from the sacred cenote of Chichén Itzá.
export function build(ctx) {
  const L = ctx.L;
  const t1 = L[1].t0, tPal = wt(L[1], 'palenque'), tMos = wt(L[1], 'mosaico'), t2 = L[2].t0, t3 = L[3].t0, tSeg = wt(L[3], 'segun'), t27 = wt(L[3], '27'), t4 = L[4].t0, tCen = wt(L[4], 'ofrendas');
  const M = S.sala('maya'), Cr = S.cripta(), O = S.sala('oaxaca'), X = S.sala('mexica');
  const fmt = v => '$' + v.toLocaleString('en-US');
  const act = t => {
    return U.letterbox(1) + U.chapter(t, 0.3, t1 - 0.4, 1, 'EL BOTÍN') +
      U.tag(t, tPal, t2 - 0.3, 'PALENQUE, CHIAPAS · SIGLO VII', 'MÁSCARA FUNERARIA DE PAKAL') +
      U.tag(t, t2 + 0.3, t3 - 0.3, 'MONTE ALBÁN, OAXACA', 'DIOS MURCIÉLAGO ZAPOTECA') +
      U.tag(t, t3 + 0.3, tSeg - 0.1, 'TEXCOCO · CULTURA MEXICA', 'VASIJA DE OBSIDIANA') +
      U.counter(t, t27 - 0.5, t4 - 0.2, 'VALOR EN EL MERCADO NEGRO', 0, 27000000, { x: 1420, y: 470, dur: 1.4, fmt, size: 120, note: 'DÓLARES · SEGÚN UN CURADOR DEL MUSEO' }) +
      U.tag(t, t4 + 0.3, tCen - 0.1, 'OAXACA · CULTURA MIXTECA', 'PECTORAL DE YANHUITLÁN') +
      U.tag(t, tCen + 0.2, ctx.dur - 0.3, 'YUCATÁN', 'CENOTE SAGRADO DE CHICHÉN ITZÁ');
  };
  const sfx = [
    { t: 0, type: 'hum', dur: ctx.dur, vol: 0.12 }, { t: 0, type: 'night', dur: ctx.dur, vol: 0.12 }, { t: 0.4, type: 'swoosh', vol: 0.25 },
    { t: t1, type: 'chime', vol: 0.3 }, { t: t2, type: 'chime', vol: 0.25 }, { t: t3, type: 'chime', vol: 0.25 }, { t: t27 - 0.2, type: 'register', vol: 0.35 },
    { t: t4, type: 'chime', vol: 0.22 }, { t: tCen, type: 'chime', vol: 0.22 },
  ];
  const shots = [
    { t0: 0, set: M, p0: [3.6, 1.15, 3.6], l0: [0, 0.85, -1.2], p1: [1.6, 1.0, 2.2], l1: [0, 0.85, -1.2], fov0: 50, act },
    { t0: t1 - 0.2, set: Cr, p0: [-0.45, 0.98, 1.75], l0: [-0.9, 0.93, 0.5], p1: [-0.7, 0.95, 1.08], l1: [-0.9, 0.93, 0.5], fov0: 40, act },
    { t0: t2 - 0.15, set: O, p0: [0.35, 0.98, 0.35], l0: [0, 0.87, -1.0], p1: [0.08, 0.92, -0.32], l1: [0, 0.86, -1.0], fov0: 42, act },
    { t0: t3 - 0.15, set: X, p0: [0.7, 0.62, 1.7], l0: [0, 1.15, -1.2], p1: [0.3, 0.7, 1.15], l1: [0, 1.0, -0.4], fov0: 46, act },
    { t0: t4 - 0.15, set: O, p0: [-2.62, 0.95, 1.75], l0: [-2.8, 0.86, 0.8], p1: [-2.76, 0.9, 1.35], l1: [-2.8, 0.86, 0.8], fov0: 40, act },
    { t0: tCen - 0.15, set: M, p0: [0.0, 1.35, -0.45], l0: [0, 0.72, -1.2], p1: [0.15, 1.12, -0.6], l1: [0, 0.72, -1.22], fov0: 44, act },
  ];
  const inst = { scene: M, scenes: [M, Cr, O, X], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
