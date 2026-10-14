import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as A from '../anim.js';
import * as WM from '../wmap.js';
import { leader, NAMES } from '../leaders.js';

export { preload } from '../wmap.js';
const fade = WM.fade;
const fz = (arr, poseFn, keep = () => false, face = 'neutral') => arr.forEach((c, i) => { if (keep(i)) return; c.setFace('open', face); K.freeze(c, poseFn(i)); });

export function build(ctx) {
  const L = ctx.L;
  const tApoyo = wt(L[0], 'apoyo'), tCulpo = wt(L[0], 'culpo'), tDecl = wt(L[0], 'declaro'), tVeint = wt(L[0], 'veintiocho');
  const tMov = wt(L[1], 'movilizo'), tDef = wt(L[1], 'defender'), tAle = wt(L[1], 'alemania'), tDecl2 = wt(L[1], 'declaro'), tRus2 = wt(L[1], 'rusia', 1), tDias = wt(L[1], 'dias'), tFra = wt(L[1], 'francia');
  const tPar = wt(L[2], 'paris'), tInv = wt(L[2], 'invadio'), tBel = wt(L[2], 'belgica'), tNeu = wt(L[2], 'neutral'), tAgo = wt(L[2], 'agosto'), tGB = wt(L[2], 'gran'), tEntro = wt(L[2], 'entro'), tAli = wt(L[2], 'alianzas'), tArr = wt(L[2], 'arrastrado');

  // ---- 1. Vienna: Franz Joseph signs
  const Of = S.office({ wall: '#e8dcc0', lower: '#7a5a3a', portrait: ['#5a4a3a', '#efe9de'], flag: P.FLAGS.aut });
  const fj = leader(Of, 'franciscoJose', Of.seat[0], Of.seat[2], 0); fj.root.position.y = Of.seat[1];
  // ---- 2. dominoes on the war-room map table
  const Dm = S.RS.stavka({ wall: '#3a3430', lower: '#2a2420', icon: false });
  const FL = ['aut', 'srb', 'rus', 'ger', 'fra', 'bel', 'gbr'], DATES = ['28 jul.', '', '30 jul.', '1 ago.', '3 ago.', '4 ago.', '4 ago.'];
  const doms = FL.map((f, i) => { const d = P.domino(P.FLAGS[f], { w: 0.15, h: 0.3, d: 0.045 }); d.position.set(-0.66 + i * 0.22, Dm.mapTop, -1.0); d.rotation.y = Math.PI / 2; Dm.add(d); return d; });
  const fallT = [tDecl, tDecl + 0.45, tMov, tDecl2, tFra, tBel, tEntro];
  const angleAt = (i, t) => (i + 1 < doms.length ? 0.82 : 1.4) * ss(fallT[i], fallT[i] + 0.3, t);
  const tickDom = t => doms.forEach((d, i) => d.children[0].rotation.x = angleAt(i, t));
  const domLight = new THREE.SpotLight('#ffe2b0', 18, 6, 0.6, 0.6, 1.2); domLight.position.set(0, 2.2, 0.2); domLight.target.position.set(0, 0.45, -1.0); Dm.add(domLight, domLight.target);
  // ---- 3. Russia mobilises
  const Rd = S.RS.road1914('day');
  const col = []; for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) { const p = K.person(Rd, ['doto', 'oguri', 'helios', 'tamamo', 'suzuka', 'mcqueen'][(r + c) % 6], 'soldadoZar', -0.8 + c * 0.8, -2 - r * 1.1, Math.PI); col.push(p); }
  col.forEach(p => { p.z0 = p.root.position.z; });
  // ---- 4. map: through Belgium; then everybody at war
  const Mp = WM.europeMap({ period: 1914 });
  const schl = WM.arrow(Mp, WM.ARROW.schlieffen, '#b8432f', 0.7);
  const belP = WM.pulse(Mp, 4.6, 50.6, '#e8c84a', 2.0);

  const tB = tCulpo - 0.3, tC = L[1].t0 - 0.3, tD = tAle - 0.35, tE = L[2].t0 - 0.3, tF = tNeu + 0.25, tG = tAli - 0.35;
  const sfx = [{ t: 0.2, type: 'clock', dur: tB, vol: 0.25 }, { t: 0.5, type: 'paper', vol: 0.4 }, { t: tVeint - 0.1, type: 'stamp', vol: 0.5 },
    ...fallT.map(x => ({ t: x + 0.3, type: 'click', vol: 0.5 })), { t: tC, type: 'march', dur: tD - tC, vol: 0.45 }, { t: tC + 0.3, type: 'drums', dur: tD - tC - 0.3, vol: 0.25 },
    { t: tE, type: 'whoosh', vol: 0.35 }, { t: tInv, type: 'march', dur: 3, vol: 0.3 }, { t: tF, type: 'tension', vol: 0.3 }, { t: tG, type: 'sting2', vol: 0.45 }];

  const shots = [
    { t0: 0, set: Of, p0: [0.9, 1.0, 1.0], l0: [0, 0.62, -1.75], p1: [0.7, 0.95, 0.75], l1: [0, 0.62, -1.75], fov0: 40, act: (t) => {
      K.pose(fj, A.write(t, 1)); fj.setFace(C.blinkEye(t, 1), 'frown'); Of.flag.wave(t);
      return U.film(t) + U.nameplate(ctx, [0, 1.25, -1.8], NAMES.franciscoJose[0], NAMES.franciscoJose[1], 0.4, tB)
        + U.card(t, tApoyo - 0.3, tB + 0.2, 'Berlín', 'Alemania le da su apoyo total', '«cheque en blanco» · 5 de julio', { left: 80, top: 90, width: 600, accent: '#e8735a' });
    } },
    { t0: tB, set: Dm, p0: [-1.12, 0.6, -0.68], l0: [-0.5, 0.56, -1.0], p1: [-1.05, 0.6, -0.7], l1: [-0.45, 0.56, -1.0], fov0: 40, act: (t) => {
      tickDom(t);
      return U.film(t) + U.stamp(t, '28 JULIO 1914 · GUERRA A SERBIA', tVeint - 0.1, tC + 0.2, { x: 1250, y: 200, rot: -6 });
    } },
    { t0: tC, set: Rd, p0: [3.2, 1.3, 2.5], l0: [0, 0.8, -6], p1: [2.6, 1.3, 1.5], l1: [0, 0.8, -6], fov0: 42, act: (t) => {
      const u = t - tC; col.forEach((p, i) => { p.root.position.z = p.z0 + u * 0.9; K.pose(p, A.march(t, i)); p.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.badge(t, '30 de julio de 1914', 'Rusia moviliza', 'para defender a Serbia', tMov - 0.2, tD);
    } },
    { t0: tD, set: Dm, p0: [-0.45, 0.6, -0.66], l0: [0.15, 0.55, -1.0], p1: [-0.25, 0.6, -0.68], l1: [0.3, 0.55, -1.0], fov0: 40, act: (t) => {
      tickDom(t);
      return U.film(t) + U.dateStrip(t, tAle - 0.2, tE + 0.3, [['1 ago.', 'Alemania declara la guerra a Rusia', tAle - 0.1, '#e8735a'], ['3 ago.', 'Alemania declara la guerra a Francia', tDias, '#e8735a']], { top: 80 });
    } },
    { t0: tE, set: Mp, p0: [-12, 14, 8], l0: [-12, 0, -1], p1: [-12.5, 12, 7], l1: [-12.5, 0, -0.5], fov0: 42, act: (t) => {
      Mp.paint(1914); Mp.tintState(1914, 'GER', WM.COL.CENTRAL, 1, 0.7); Mp.tintState(1914, 'BEL', '#e8c84a', ss(tBel - 0.3, tBel + 0.2, t), 0.6);
      schl.set(ss(tInv - 0.4, tNeu + 0.4, t)); belP.update(t, tBel - 0.1);
      return U.film(t) + WM.city(ctx, Mp, 'París', fade(t, tPar - 0.3, tF + 1), 'c') + WM.chip(ctx, 4.6, 50.6, fade(t, tNeu - 0.3, tF + 1), 'Bélgica', 'país neutral', '#e8c84a');
    } },
    { t0: tF, set: Dm, p0: [0.1, 0.6, -0.68], l0: [0.62, 0.55, -1.0], p1: [0.2, 0.6, -0.7], l1: [0.66, 0.55, -1.0], fov0: 40, act: (t) => {
      tickDom(t);
      return U.film(t) + U.dateStrip(t, tAgo - 0.3, tG + 0.3, [['4 ago.', 'Alemania invade Bélgica', tAgo - 0.2, '#e8735a'], ['4 ago.', 'Gran Bretaña entra en la guerra', tGB - 0.1, '#6fa0e0']], { top: 80 });
    } },
    { t0: tG, set: Dm, p0: [-1.0, 0.95, -0.35], l0: [0.05, 0.5, -1.0], p1: [-0.9, 0.9, -0.4], l1: [0.1, 0.5, -1.0], fov0: 40, act: (t) => {
      tickDom(t);
      return U.film(t) + U.dateStrip(t, tG - 0.1, ctx.dur + 1, [['28 jul.', 'Austria-Hungría → Serbia', tG, '#e8735a'], ['30 jul.', 'Rusia moviliza', tG + 0.25, '#6fa0e0'],
        ['1 ago.', 'Alemania → Rusia', tG + 0.5, '#e8735a'], ['3 ago.', 'Alemania → Francia', tG + 0.75, '#e8735a'], ['4 ago.', 'Gran Bretaña entra', tG + 1.0, '#6fa0e0']], { top: 80 });
    } },
  ];
  const inst = { scene: Of, scenes: [Of, Dm, Rd, Mp], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
