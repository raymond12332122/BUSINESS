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
const fade = (t, a, b, f = 0.35) => ss(a, a + f, t) * (1 - ss(b - f, b, t));

const fz = (arr, poseFn, keep = () => false, face = 'neutral') => arr.forEach((c, i) => { if (keep(i)) return; c.setFace('open', face); K.freeze(c, poseFn(i)); });

export function build(ctx) {
  const L = ctx.L;
  const tOcho = wt(L[0], 'ocho'), tMujer = wt(L[0], 'mujer'), tPan = wt(L[0], 'pan'), tPocos = wt(L[0], 'pocos'), tHuelga = wt(L[0], 'huelga');
  const tSold = wt(L[1], 'soldados'), tZar = wt(L[1], 'zar'), tPskov = wt(L[1], 'pskof'), tTerm = wt(L[1], 'terminaban'), tTres = wt(L[1], 'trescientos'), tRom = wt(L[1], 'romanoff');
  const tCal = wt(L[2], 'calendario'), tFeb = wt(L[2], 'febrero'), tDos = wt(L[2], 'dos'), tGob = wt(L[2], 'gobierno'), tKer = wt(L[2], 'kerenski'), tSov = wt(L[2], 'soviet');

  // ---- 1. Women workers march for bread (8 March 1917)
  const St = S.petroStreet('snow', { snowing: true, bakery: false });
  const women = K.crowd(St, ['obrera', 'obrera', 'obrera', 'campesina'], 20, [-3.2, -12.5, 3.2, -6.5], { seed: 71 });
  women.forEach(w => w.z0 = w.root.position.z);
  const bread = [[-1.1, -6.2, 'ХЛѢБА!'], [1.4, -8.6, 'ХЛѢБА!']].map(([x, z, txt]) => { const b = P.banner(txt, { w: 1.7, h: 0.42, poleH: 1.25 }); b.position.set(x, 0, z); b.z0 = z; St.add(b); return b; });
  // ---- 2. The general strike fills the city
  const St2 = S.petroStreet('snow', { bakery: false });
  const mass = K.crowd(St2, ['obrero', 'obrera', 'obrero', 'obrera', 'campesino', 'guardiaRoja'], 46, [-4.2, -16, 4.2, -2], { seed: 72 });
  const flags2 = [[-2.6, -5], [1.8, -8], [-0.6, -11.5], [2.9, -13.5], [-3.2, -14.5]].map(([x, z], i) => { const f = P.redFlag(2.2, 0.9, 0.55); f.position.set(x, 0, z); St2.add(f); return f; });
  fz(mass, i => i % 3 === 0 ? A.rally(0.2 + i * 0.13, i) : i % 3 === 1 ? C.idle(0.3, i) : A.proud(0.3, i), () => false, 'open');
  // ---- 3. Soldiers join the crowd
  const St3 = S.petroStreet('snow', { bakery: false });
  const joined = K.crowd(St3, ['soldadoRevolucion', 'obrero', 'soldadoRevolucion', 'obrera', 'soldadoRevolucion'], 24, [-3.6, -9, 3.6, -2.5], { seed: 73 });
  const flags3 = [[-1.8, -4.2], [2.2, -6.5]].map(([x, z]) => { const f = P.redFlag(2.2, 0.9, 0.55); f.position.set(x, 0, z); St3.add(f); return f; });
  fz(joined, i => i % 5 !== 1 && i % 5 !== 3 ? (i % 2 ? { ...A.rally(0.4 + i * 0.1, i), gun: 'back' } : { ...C.cheer(0.4 + i * 0.1, i), gun: 'back' }) : C.cheer(0.3 + i * 0.1, i), i => i % 2 === 0, 'open');
  // ---- 4. Pskov: the imperial train
  const Ps = S.pskovStation();
  const guards = [[3.3, -6.2, 0.3], [3.5, -11.2, 0.5]].map(([x, z, y], i) => { const g = K.person(Ps, ['oguri', 'doto'][i], 'soldadoInvierno', x, z, y); g.root.position.y = Ps.platform.top; return g; });
  // ---- 5. The empty throne
  const Th = S.throneHall();
  // ---- 6. Two calendars
  const Sq = S.palaceSquare('snowDusk');
  // ---- 7. Dual power in the Tauride Palace
  const Du = S.hall('duma');
  const ministers = [-1.5, -1.0, -0.5, 0.5, 1.0, 1.5].map((x, i) => { const m = K.person(Du, ['doto', 'oguri', 'mcqueen', 'daiwa', 'cafe', 'tamamo'][i], 'delegado', x, -8.4, 0); m.root.position.y = 0.36 + 0.08; return m; });
  const ker = leader(Du, 'kerenski', 0, -7.05, 0); ker.root.position.y = 0.36;
  const Sv = S.hall('soviet');
  const deps = []; for (let r = 0; r < 6; r++) for (let i = 0; i < 6; i++) for (const sd of [-1, 1]) { if ((r * 7 + i * 3 + (sd > 0)) % 4 === 0) continue; const [x, y, z] = Sv.seatsAt(r, i, sd);
    const d = K.person(Sv, ['doto', 'oguri', 'helios', 'suzuka', 'mcqueen', 'daiwa', 'cafe', 'tamamo'][(r * 6 + i + (sd > 0 ? 3 : 0)) % 8], ['obrero', 'soldadoRevolucion', 'obrera', 'marinero', 'soldadoRevolucion'][(r + i * 2) % 5], x, z, Math.PI); d.root.position.y = y; deps.push(d); }
  const orator = K.person(Sv, 'helios', 'soldadoRevolucion', 0, -7.05, 0); orator.root.position.y = 0.36;
  fz(deps, i => A.sit(0.4, i));

  const tB = tPocos - 0.3, tC = L[1].t0 - 0.3, tD = tZar - 0.3, tE = tTerm - 0.4, tF = L[2].t0 - 0.3, tG = tDos - 0.5, tH = tSov - 0.6;
  const sfx = [{ t: 0.0, type: 'crowd', dur: tD, vol: 0.38 }, { t: 0.5, type: 'wind', dur: tB, vol: 0.25 }, { t: tB, type: 'drums', dur: tC - tB, vol: 0.3 }, { t: tC + 0.3, type: 'cheer', vol: 0.45 },
    { t: tD, type: 'hiss', dur: 2.5, vol: 0.22 }, { t: tD + 0.5, type: 'paper', vol: 0.4 }, { t: tE, type: 'bells', dur: tF - tE, vol: 0.25 }, { t: tTres, type: 'pop', vol: 0.4 },
    { t: tCal - 0.2, type: 'paper', vol: 0.35 }, { t: tFeb - 0.1, type: 'hit', vol: 0.45 }, { t: tG, type: 'crowd', dur: ctx.dur - tG, vol: 0.25 }, { t: tGob - 0.1, type: 'pop', vol: 0.35 }, { t: tSov - 0.1, type: 'pop', vol: 0.35 }];

  const shots = [
    { t0: 0, set: St, p0: [0.9, 1.1, 2.6], l0: [0, 1.0, -10], p1: [0.6, 1.05, 1.0], l1: [0, 1.0, -10], fov0: 44, act: (t) => {
      St.tick(t); const u = t;
      women.forEach((w, i) => { w.root.position.z = w.z0 + u * 0.32; K.pose(w, i % 4 === 1 ? A.rally(t, i) : C.walk(t, 0.45, i)); w.setFace(C.blinkEye(t, i), i % 4 === 1 ? 'open' : 'neutral'); });
      bread.forEach((b, i) => { b.position.z = b.z0 + u * 0.32; b.wave(t + i, 0.05); });
      return U.film(t) + U.badge(t, 'Petrogrado · 8 de marzo de 1917', 'Día de la Mujer', 'Las obreras textiles salen a pedir pan', tOcho - 0.2, tB)
        + U.tag(ctx, [bread[0].position.x, 1.35, bread[0].position.z], 'ХЛѢБА!', '¡Pan!', fade(t, tPan - 0.4, tB));
    } },
    { t0: tB, set: St2, p0: [5.5, 6.5, 9], l0: [0, 0, -12], p1: [4.6, 5.6, 7], l1: [0, 0, -12], fov0: 44, act: (t) => {
      St2.tick(t); flags2.forEach((f, i) => f.wave(t + i));
      mass.forEach((m, i) => { K.pose(m, i % 3 === 0 ? A.rally(t, i) : i % 3 === 1 ? C.idle(t, i) : A.proud(t, i)); m.setFace(C.blinkEye(t, i), i % 3 === 0 ? 'open' : 'neutral'); });
      return U.film(t) + U.counter(t, tHuelga - 0.2, tC, 110, 620, 300000, 'huelguistas en Petrogrado', { from: 20000, dur: 1.4, color: '#ffcf6a', prefix: '≈ ', w: 560 });
    } },
    { t0: tC, set: St3, p0: [-2.4, 1.1, 2.2], l0: [0.6, 0.85, -6], p1: [-2.0, 1.05, 1.4], l1: [0.6, 0.85, -6], fov0: 44, act: (t) => {
      St3.tick(t); flags3.forEach((f, i) => f.wave(t + i));
      joined.forEach((m, i) => { const sold = i % 5 !== 1 && i % 5 !== 3; K.pose(m, sold ? (i % 2 ? { ...A.rally(t, i), gun: 'back' } : { ...C.cheer(t, i), gun: 'back' }) : C.cheer(t, i)); m.setFace(C.blinkEye(t, i), 'open'); });
      return U.film(t) + U.badge(t, '12 de marzo de 1917', 'La tropa se une', 'Los soldados se niegan a disparar', tSold - 0.2, tD);
    } },
    { t0: tD, set: Ps, p0: [2.6, 1.55, -3.6], l0: [1.0, 2.0, -9], p1: [2.5, 1.6, -5.0], l1: [1.0, 2.0, -9.2], fov0: 44, act: (t) => {
      Ps.tick(t);
      guards.forEach((g, i) => { K.pose(g, A.guard(t, i)); g.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.badge(t, 'Pskov · 15 de marzo de 1917', 'Nicolás II abdica', 'En el vagón del tren imperial', tZar - 0.1, tE);
    } },
    { t0: tE, set: Th, p0: [0, 1.05, -2.6], l0: [0, 1.05, -6], p1: [0, 1.35, 2.4], l1: [0, 1.15, -6], fov0: 40, act: (t) => {
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(10,8,6,${0.3 * ss(tTres, tTres + 1, t)})"></div>`
        + U.counter(t, tTres - 0.2, tF, 1250, 150, 304, 'años de la dinastía Románov · 1613 – 1917', { from: 1, dur: 1.4, color: '#ffcf6a', w: 460 });
    } },
    { t0: tF, set: Sq, p0: [3, 1.6, 8], l0: [-2, 4, -30], p1: [2, 1.7, 6], l1: [-2, 4.4, -30], fov0: 46, act: (t) => {
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,10,16,.45)"></div>`
        + U.calendar(t, tCal - 0.3, tG, ['Calendario ruso (juliano)', 'FEBRERO', 23, 1917], ['Calendario occidental', 'MARZO', 8, 1917], tCal + 0.5, { y: 150 })
        + U.big(t, tFeb - 0.2, tG, 'REVOLUCIÓN DE FEBRERO', { top: 690, size: 70 });
    } },
    { t0: tG, set: Du, p0: [2.4, 1.35, -2.2], l0: [0, 0.75, -8.2], p1: [2.0, 1.3, -3.2], l1: [0, 0.75, -8.2], fov0: 42, act: (t) => {
      ministers.forEach((m, i) => { K.pose(m, A.sit(t, i)); m.setFace(C.blinkEye(t, i), 'neutral'); });
      K.pose(ker, A.orate(t, 3)); ker.setFace(C.blinkEye(t, 3), C.talkMouth(t, 3));
      return U.film(t) + U.dual(t, tDos - 0.3, tH, 'DOBLE PODER', ['Gobierno Provisional', 'Ministros liberales; desde julio, encabezado por Kérenski', tGob - 0.1, '#7fb2ff'], ['Sóviet de Petrogrado', 'Obreros y soldados elegidos en asambleas', tSov - 0.1, '#ff7a5a'])
        + U.nameplate(ctx, [0, 1.6, -7.05], NAMES.kerenski[0], 'Jefe del Gobierno Provisional (julio)', tKer - 0.15, tH);
    } },
    { t0: tH, set: Sv, p0: [-3.4, 2.4, 4.4], l0: [0, 0.5, -6.5], p1: [-3.0, 2.2, 3.6], l1: [0, 0.5, -6.5], fov0: 42, act: (t) => {
      Sv.bannerMain.wave(t, 0.02);
      deps.forEach((d, i) => { K.pose(d, A.sit(t, i)); d.setFace(C.blinkEye(t, i), 'neutral'); });
      K.pose(orator, A.orate(t, 2)); orator.setFace(C.blinkEye(t, 2), C.talkMouth(t, 2));
      return U.film(t) + U.dual(t, tH, ctx.dur + 1, 'DOBLE PODER', ['Gobierno Provisional', 'Ministros liberales; desde julio, encabezado por Kérenski', tH - 1, '#7fb2ff'], ['Sóviet de Petrogrado', 'Obreros y soldados elegidos en asambleas', tH - 1, '#ff7a5a']);
    } },
  ];
  const inst = { scene: St, scenes: [St, St2, St3, Ps, Th, Sq, Du, Sv], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
