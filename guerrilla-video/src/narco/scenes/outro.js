import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as N from '../props.js';
import * as MS from '../../mx/sets.js';
import * as MA from '../../mx/anim.js';
import { runShots, wt } from '../../mx/shots.js';
import * as U from '../ui.js';

export { preload } from '../mapkit.js';

function center(t, a, b, txt, { top = 400, size = 76 } = {}) {
  const k = ss(a, a + 0.4, t) * (1 - ss(b - 0.4, b, t)); if (k <= 0) return '';
  return `<div style="position:absolute;left:120px;right:120px;top:${top}px;text-align:center;opacity:${k};font:900 ${size}px/1.15 'Inter Display',Inter;color:#fff;text-shadow:0 6px 30px rgba(0,0,0,.75);transform:translateY(${(1 - k) * 16}px)">${txt}</div>`;
}

export function build(ctx) {
  const L = ctx.L;
  const tEsp = wt(L[0], 'especialistas'), tPol = wt(L[0], 'policias'), tSeg = wt(L[0], 'seguir'), tCas = wt(L[0], 'castigar'), tDar = wt(L[0], 'dar'), tQue = wt(L[0], 'que$'), tCon = wt(L[0], 'consumo');
  const tEst = wt(L[1], 'estamos'), tAlg = wt(L[1], 'algunos'), tMej = wt(L[1], 'mejoran'), tEmp = wt(L[1], 'empeoran'), tLo = wt(L[1], 'lo$'), tSin = wt(L[1], 'sin'), tReg = wt(L[1], 'regresa');
  const tEsta = wt(L[2], 'esta');

  // ---- 1. A plaza at golden hour: what could work
  const P = S.plazaHope();
  const folks = [[2.2, 1.2, 0.9], [3.1, 1.6, -0.5], [1.4, 3.4, 0.6], [2.5, 3.8, -0.3], [4.4, 0.2, 0.2], [0.4, 0.4, 0.8]].map(([x, z, y], i) => K.person(P, ['doto', 'suzuka', 'cafe', 'helios', 'mcqueen', 'tamamo'][i], i % 3 === 2 ? 'joven' : 'civil', x, z, y));
  // ---- 2. Zócalo at dusk
  const Z = MS.zocalo('dusk');
  // ---- 3. Candles for the victims
  const Pc = S.posterStreet();
  // ---- 4. Final card over the night highway
  const H = S.highway('nightCity');

  const sfx = [{ t: 0.2, type: 'birds', dur: L[1].t0 - 0.4, vol: 0.3 }, ...[tPol, tSeg, tCas, tDar, tQue].map(t => ({ t, type: 'tick', vol: 0.35 })),
    { t: L[1].t0 - 0.3, type: 'whoosh', vol: 0.4 }, { t: tMej, type: 'pop', vol: 0.4 }, { t: tEmp, type: 'pop', vol: 0.4 },
    { t: tLo - 0.3, type: 'swell', dur: 5.0, vol: 0.35 }, { t: L[2].t0 - 0.2, type: 'hit', vol: 0.55 }];

  const tB = L[1].t0 - 0.3, tC = tLo - 0.3, tD = L[2].t0 - 0.3;
  const shots = [
    { t0: 0, set: P, p0: [6.5, 1.7, 8.5], l0: [1.4, 1.0, -1.5], p1: [5.6, 1.6, 7.2], l1: [1.4, 1.0, -1.5], fov0: 40, act: (t) => {
      folks.forEach((f, i) => { K.pose(f, i % 2 ? C.idle(t, i, 0.5) : MA.clap(t, i)); f.setFace(C.blinkEye(t, i), i % 2 ? C.talkMouth(t, i) : 'smile'); });
      return U.film(t) + `<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,10,16,.55) 0%,rgba(8,10,16,0) 55%)"></div>`
        + U.checklist(t, tEsp - 0.2, tB, '¿Qué podría funcionar?', [['Policías y fiscalías profesionales', tPol - 0.1], ['Seguir el dinero', tSeg - 0.1], ['Castigar a políticos coludidos', tCas - 0.1], ['Opciones para los jóvenes', tDar - 0.1], ['Que EE. UU. frene armas y consumo', tQue - 0.1]], { x: 90, y: 140, w: 760 });
    } },
    { t0: tB, set: Z, p0: [0, 2.2, 14], l0: [0, 4.2, -16], p1: [0, 2.0, 9], l1: [0, 4.6, -16], fov0: 42, act: (t) => {
      Z.flag.wave(t);
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,10,16,${0.35 + 0.3 * ss(tAlg - 0.4, tAlg, t)})"></div>`
        + center(t, tEst - 0.2, tAlg - 0.2, '¿Estamos cayendo poco a poco?', { top: 420, size: 84 })
        + U.scoreboard(t, tAlg - 0.2, tC, [['Homicidios', '−53% desde 2024, según cifras oficiales', tMej - 0.1], ['Golpes a los cárteles', '“El Mencho” abatido · 92 capos enviados a EE. UU.', tMej + 0.25]],
          [['Desapariciones', '132,735 personas desaparecidas', tEmp - 0.1], ['Extorsión', 'Récord en más de una década', tEmp + 0.25], ['Impunidad', 'Cerca del 99% de los delitos', tEmp + 0.6]], { y: 150 });
    } },
    { t0: tC, set: Pc, p0: [0.3, 1.25, 5.2], l0: [0, 1.05, -2.2], p1: [0.2, 1.15, 3.8], l1: [0, 1.05, -2.2], fov0: 40, act: (t) => {
      Pc.candles.forEach(c => c.flicker(t)); Pc.warm.intensity = 5.5 + 0.8 * Math.sin(t * 9) * Math.sin(t * 4.3);
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,10,16,.35)"></div>`
        + center(t, tSin - 0.3, tD + 0.2, 'Sin justicia, la violencia<br>siempre regresa.', { top: 360, size: 80 });
    } },
    { t0: tD, set: H, p0: [4.6, 1.0, 8], l0: [-0.5, 1.2, -20], p1: [4.2, 0.9, 6], l1: [-0.5, 1.2, -20], fov0: 40, act: (t) => {
      return U.film(t) + U.titleCard(t, tD + 0.2, ctx.dur + 1, 'MÉXICO · 2026', 'CORRUPCIÓN, CÁRTELES<br>Y NARCOTRÁFICO', 'Gracias por ver', 150);
    } },
  ];
  const inst = { scene: P, scenes: [P, Z, Pc, H], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
