import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as U from '../ui.js';
import * as M from '../../lib/motion.js';
import { run, wt } from '../../whatif/shots.js';
const { ss, clamp } = M;

// The close: a field of poppies at golden hour round a memorial; the ordinary people of the whole video stand together;
// the camera rises to the sky; the cast rolls and the title closes.
export function build(ctx) {
  const L = ctx.L;
  const tOdi = wt(L[0], 'odio'), tGen = wt(L[0], 'gente'), tLib = wt(L[0], 'libertad'), tRec = wt(L[1], 'recordarla'), tNun = wt(L[1], 'nunca');
  const tB = tGen - 0.6, tC = L[1].t0 - 0.3;

  const Pf = S.poppyField('golden');
  // the people of the video, in a loose arc round the memorial (z = -3), facing the camera
  const ROLES = [['daiwa', 'remachadora'], ['suzuka', 'sovietico'], ['cafe', 'wren'], ['doto', 'enfermera'], ['spe', 'bracero'], ['oguri', 'pilotoMx'],
    ['tamamo', 'britanico'], ['helios', 'estadounidense'], ['mcqueen', 'frances'], ['hishi', 'chino'], ['daiwa', 'brasileno'], ['suzuka', 'brujaNoche']];
  const people = ROLES.map(([who, o], i) => { const a = -1.0 + 2.0 * i / (ROLES.length - 1), R = 2.6 + (i % 2) * 0.55, x = Math.sin(a) * R, z = -3 + Math.cos(a) * R * 0.9 - 0.4;
    const r = K.person(Pf, who, o, x, z, Math.atan2(-x * 0.3, 6 - z) * 0.6, { shadow: false }); r.i = i; return r; });
  const child = K.person(Pf, 'spe', 'ninoGueto', 0.5, -1.7, Math.PI); child.root.scale.setScalar(0.8);
  const act = t => { const on = t > tB - 0.05; people.forEach(r => { r.root.visible = on; }); child.root.visible = on;
    people.forEach(r => { const p = t > tLib - 0.3 && r.i % 3 === 1 ? A.holdHand(t, r.i, r.i % 2 ? 'L' : 'R') : A.stand(t, r.i); p.head = [(p.head?.[0] || 0) - 4, p.head?.[1] || 0, 0];
      K.act(r, p, t, { mouth: t > tGen ? 'smile' : 'neutral', eye: t > tRec && r.i % 4 === 0 ? 'happy' : undefined }); });
    K.act(child, A.setDown(t, 3, clamp(0.5 + 0.5 * Math.sin(Math.min(Math.PI / 2, (t - tB) * 0.9)))), t, { mouth: 'neutral' });
    return U.film(t)
      + U.castCard(t, tB + 0.9, ctx.dur - 3.55, [['Tamamo Cross', 'Winston Churchill'], ['Sirius Symboli', 'Franklin D. Roosevelt'], ['Mejiro McQueen', 'Charles de Gaulle'], ['Symboli Rudolf', 'Manuel Ávila Camacho']],
        'Oguri Cap, Manhattan Cafe, Meisho Doto, Daiwa Scarlet, Silence Suzuka, Daitaku Helios, Special Week, Hishi Akebono y Tamamo Cross como soldados, obreras, pilotos, enfermeras y civiles.',
        'Los dictadores sólo aparecen como siluetas.')
      + U.bigTitle(t, ctx.dur - 3.4, ctx.dur + 1, 'LA SEGUNDA GUERRA MUNDIAL', '1939 – 1945', 'Recordar para que nunca vuelva a pasar', { top: 600 });
  };

  const sfx = [
    { t: 0, type: 'wind', dur: ctx.dur, vol: 0.25 }, { t: 0, type: 'birds', dur: ctx.dur, vol: 0.18 }, { t: tOdi - 0.1, type: 'drone', dur: 1.6, vol: 0.15 },
    { t: tC, type: 'swell', vol: 0.3 }, { t: ctx.dur - 3.4, type: 'bell', vol: 0.3 },
  ];
  const shots = [
    { t0: 0, set: Pf, p0: [0.7, 0.32, 0.4], l0: [0, 1.5, -3], p1: [0.5, 0.42, 0.9], l1: [0, 1.6, -3], fov0: 44, act },
    { t0: tB, set: Pf, p0: [0.8, 1.15, 4.2], l0: [0, 0.75, -3], p1: [0.6, 1.3, 6.8], l1: [0, 0.8, -3], fov0: 46, act },
    { t0: tC, set: Pf, p0: [0.6, 1.35, 6.9], l0: [0, 0.85, -3], p1: [0.2, 7.5, 12], l1: [0, 6.5, -30], fov0: 48, act },
  ];
  const inst = { scene: Pf, scenes: [Pf], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
