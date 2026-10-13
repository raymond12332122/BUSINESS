import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as A from '../anim.js';
import * as RM from '../rmap.js';
import { leader, NAMES } from '../leaders.js';

export { preload } from '../rmap.js';
const fade = RM.fade;

const fz = (arr, poseFn, keep = () => false, face = 'neutral') => arr.forEach((c, i) => { if (keep(i)) return; c.setFace('open', face); K.freeze(c, poseFn(i)); });

export function build(ctx) {
  const L = ctx.L;
  const tMay = wt(L[0], 'mayoria'), tElec = wt(L[0], 'eleccion'), tAsam = wt(L[0], 'asamblea'), tVein = wt(L[0], 'veinticuatro'), tCuar = wt(L[0], 'cuarenta'), tSoc = wt(L[0], 'socialistas');
  const tLen = wt(L[1], 'lenin'), tDis = wt(L[1], 'disolvio'), tSig = wt(L[1], 'siguiente'), tEne = wt(L[1], 'enero');
  const tMarzo = wt(L[2], 'marzo'), tFirmo = wt(L[2], 'firmo'), tBrest = wt(L[2], 'brest'), tCed = wt(L[2], 'cediendo'), tTercio = wt(L[2], 'tercio');

  // ---- 1. Voting for the Constituent Assembly
  const Vo = S.pollingStation();
  const voters = K.crowd(Vo, ['campesino', 'obrera', 'soldadoZar', 'campesina', 'obrero'], 8, [-0.4, -1.0, 0.4, 2.6], { seed: 101, yaw: Math.PI });
  const clerks = [K.person(Vo, 'helios', 'delegado', -0.9, -2.2, 0.3), K.person(Vo, 'daiwa', 'obrera', 0.9, -2.2, -0.3)];
  // ---- 2/3. The Constituent Assembly in the Tauride Palace
  const Ca = S.hall('constituent');
  const deps = []; for (let r = 0; r < 6; r++) for (let i = 0; i < 6; i++) for (const sd of [-1, 1]) { if ((r * 3 + i * 5 + (sd > 0)) % 5 === 0) continue; const [x, y, z] = Ca.seatsAt(r, i, sd);
    const d = K.person(Ca, ['doto', 'oguri', 'helios', 'suzuka', 'mcqueen', 'daiwa', 'cafe', 'tamamo'][(r * 6 + i + (sd > 0 ? 5 : 0)) % 8], ['delegado', 'campesino', 'delegado', 'obrero'][(r + i) % 4], x, z, Math.PI); d.root.position.y = y; d.seat = [x, y, z]; deps.push(d); }
  const sailors = [[-3.4, 2.6], [3.4, 2.4], [-3.6, -1.0], [3.6, -1.4]].map(([x, z], i) => K.person(Ca, ['doto', 'oguri', 'tamamo', 'helios'][i], 'marinero', x, z, x < 0 ? Math.PI / 2 : -Math.PI / 2));
  const chief = K.person(Ca, 'suzuka', 'marinero', 0.2, -6.9, 0); chief.root.position.y = 0.36;
  fz(deps, i => A.sit(0.4, i), i => i % 3 === 0);
  // ---- 4. Brest-Litovsk: the treaty
  const Tr = S.treatyRoom();
  const ger = [0, 1, 2, 3].map(i => { const [x, y, z] = Tr.seats(i, -1); const g = K.person(Tr, ['mcqueen', 'daiwa', 'suzuka', 'tamamo'][i], 'oficialAleman', x, z, 0); g.root.position.y = y; return g; });
  const sov = [0, 1, 2, 3].map(i => { const [x, y, z] = Tr.seats(i, 1); const g = K.person(Tr, ['oguri', 'helios', 'doto', 'cafe'][i], 'delegado', x, z, Math.PI); g.root.position.y = y; return g; });
  // ---- 5. Map: what Russia gave up
  const Mp = RM.russiaMap({ period: 1914 });
  const pB = RM.pulse(Mp, ...RM.CITY['Brest-Litovsk'], '#c0392b', 0.8);

  const tB = tElec - 0.3, tC = L[1].t0 - 0.3, tD = tMarzo - 0.4, tE = tCed - 0.5;
  const rows = [['Eseristas', 40, tCuar - 0.15, false, '', '#5fae6a'], ['Bolcheviques', 24, tVein - 0.15, true, '', '#d0453a'], ['Kadetes', 5, tSoc + 0.4, false, 'liberales', '#4a7ab8'], ['Mencheviques', 3, tSoc + 0.6, false, '', '#d9822b']];
  const sfx = [{ t: 0.2, type: 'crowd', dur: tB, vol: 0.2 }, { t: 1.5, type: 'paper', vol: 0.4 }, { t: tB, type: 'whoosh', vol: 0.35 }, { t: tVein, type: 'pop', vol: 0.4 }, { t: tCuar, type: 'pop', vol: 0.4 },
    { t: tC, type: 'crowd', dur: tD - tC, vol: 0.3 }, { t: tDis, type: 'gavel', vol: 0.5 }, { t: tSig, type: 'stamp', vol: 0.5 },
    { t: tD, type: 'clock', dur: tE - tD, vol: 0.25 }, { t: tFirmo + 0.3, type: 'paper', vol: 0.45 }, { t: tE, type: 'whoosh', vol: 0.4 }, { t: tTercio, type: 'hit', vol: 0.5 }];

  const shots = [
    { t0: 0, set: Vo, p0: [2.5, 1.0, 0.6], l0: [0, 0.5, -1.2], p1: [2.2, 0.95, 0.2], l1: [0, 0.5, -1.3], fov0: 44, act: (t) => {
      voters.forEach((v, i) => { K.pose(v, i === 0 ? C.offer(t, i, 0.7) : C.idle(t, i, 0.4)); v.setFace(C.blinkEye(t, i), 'neutral'); });
      clerks.forEach((c, i) => { K.pose(c, A.talk(t, i)); c.setFace(C.blinkEye(t, i + 3), 'neutral'); });
      return U.film(t) + U.badge(t, 'Noviembre de 1917', 'Elección de la Asamblea Constituyente', 'Votaron más de 40 millones de personas', 0.4, tB)
        + U.tag(ctx, [0, 2.4, -2.98], 'УЧРЕДИТЕЛЬНОЕ СОБРАНІЕ', 'Asamblea Constituyente', fade(t, 1.0, tB));
    } },
    { t0: tB, set: Ca, p0: [-3.6, 2.6, 4.6], l0: [0, 0.5, -6.6], p1: [-3.2, 2.4, 3.8], l1: [0, 0.5, -6.6], fov0: 42, act: (t) => {
      deps.forEach((d, i) => { K.pose(d, A.sit(t, i)); d.setFace(C.blinkEye(t, i), 'neutral'); });
      sailors.forEach(s => s.root.visible = false); chief.root.visible = false;
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,10,16,.35)"></div>`
        + U.hbars(t, tB + 0.2, tC, 'Asamblea Constituyente · votos', rows, { x: 960, y: 170, w: 860, max: 44, unit: ' %', sub: 'Eseristas = socialistas revolucionarios · resultados aproximados' })
        + U.source(t, tSoc, tC, 'El resto de los votos fue para partidos nacionales y menores');
    } },
    { t0: tC, set: Ca, p0: [2.6, 1.55, -6.2], l0: [-0.3, 0.45, 0.5], p1: [2.2, 1.5, -6.6], l1: [-0.3, 0.45, 0.5], fov0: 44, act: (t) => {
      const u = ss(tC, tSig + 0.5, t);
      deps.forEach((d, i) => { const up = i % 3 === 0 && t > tSig; K.pose(d, up ? A.sad(t, i) : A.sit(t, i)); d.root.position.y = up ? 0 : d.seat[1]; d.setFace(C.blinkEye(t, i), up ? 'frown' : 'neutral'); });
      sailors.forEach((s, i) => { s.root.visible = true; s.root.position.z = [2.6, 2.4, -1.0, -1.4][i] - 1.2 * u; K.pose(s, u < 1 ? { ...C.walkArmed(t, 0.5, i), gun: 'port' } : A.guard(t, i)); s.setFace(C.blinkEye(t, i), 'frown'); });
      chief.root.visible = true; K.pose(chief, A.talk(t, 5)); chief.setFace(C.blinkEye(t, 5), C.talkMouth(t, 5));
      return U.film(t) + U.badge(t, 'Enero de 1918', 'Disuelta', 'La Asamblea solo sesionó un día', tLen - 0.2, tD)
        + U.stamp(t, 'DISUELTA', tSig - 0.1, tD, { x: 1380, y: 420, rot: -7 })
        + U.source(t, tDis + 0.2, tD, '«La guardia está cansada»: un marinero ordena desalojar la sala');
    } },
    { t0: tD, set: Tr, p0: [2.7, 1.3, -1.0], l0: [-0.4, 0.3, -1.0], p1: [2.45, 1.25, -1.0], l1: [-0.4, 0.3, -1.0], fov0: 40, act: (t) => {
      ger.forEach((g, i) => { K.pose(g, i === 1 && t > tFirmo ? A.sign(t, i) : A.sit(t, i)); g.setFace(C.blinkEye(t, i), 'neutral'); });
      sov.forEach((g, i) => { K.pose(g, i === 2 && t > tFirmo ? A.sign(t, i + 4) : A.sit(t, i + 4)); g.setFace(C.blinkEye(t, i + 4), 'frown'); });
      return U.film(t) + U.badge(t, 'Brest-Litovsk · 3 de marzo de 1918', 'Paz con Alemania', 'Rusia sale de la Primera Guerra Mundial', tMarzo - 0.2, tE);
    } },
    { t0: tE, set: Mp, p0: [-12.5, 19, 6.5], l0: [-12.5, 0, -3], p1: [-12, 17, 5], l1: [-12, 0, -3], fov0: 40, act: (t) => {
      const k = ss(tE + 0.2, tE + 1.4, t); Mp.paint(1914, 1918, k); Mp.tintState(1918, 'LOST', '#ffb03a', k * (0.75 + 0.25 * Math.sin(t * 5) ** 2), 0.85); Mp.tintState(1918, 'SOV', '#9a4436', k, 0.45);
      pB.update(t, tE);
      return U.film(t) + RM.city(ctx, Mp, 'Brest-Litovsk', fade(t, tE, ctx.dur + 1)) + RM.areaLabel(ctx, 27.5, 57.2, 'TIERRAS CEDIDAS', fade(t, tE + 0.8, ctx.dur + 1), 'big').replace('class="lbl big"', 'class="lbl big r"')
        + U.stat(1210, 560, '1/3', 'de la población del imperio', ss(tTercio - 0.2, tTercio + 0.2, t), '#ff8a6a')
        + U.source(t, tTercio + 0.4, ctx.dur + 1, 'Unos 55 millones de personas y más de la mitad de su industria');
    } },
  ];
  const inst = { scene: Vo, scenes: [Vo, Ca, Tr, Mp], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
