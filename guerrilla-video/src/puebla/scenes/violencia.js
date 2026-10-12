import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import * as K from '../../narco/kit.js';
import * as N from '../../narco/props.js';
import * as NS from '../../narco/sets.js';
import * as MA from '../../mx/anim.js';
import { runShots, wt } from '../../mx/shots.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as PM from '../pmap.js';

export { preload } from '../pmap.js';
const CAST = ['doto', 'oguri', 'suzuka', 'mcqueen', 'tamamo', 'daiwa', 'helios', 'cafe'];

export function build(ctx) {
  const L = ctx.L;
  const tPreg = wt(L[0], 'pregunta'), tPue = wt(L[0], 'puebla'), tSin = wt(L[0], 'sinaloa'), tJal = wt(L[0], 'jalisco'), tSeg = wt(L[0], 'segun'), tNov = wt(L[0], 'novecientos'), tAse = wt(L[0], 'asesinatos');
  const tQui = wt(L[1], 'quince'), tProm = wt(L[1], 'promedio'), tSin2 = wt(L[1], 'sinaloa'), tGue = wt(L[1], 'guerra'), tCin = wt(L[1], 'cincuenta'), tCua = wt(L[1], 'cuatro');
  const tCasa = wt(L[2], 'casa'), tTasa = wt(L[2], 'tasa'), tPar = wt(L[2], 'parecida'), tMil = wt(L[2], 'miles'), tDes = wt(L[2], 'desaparecidos');
  const tRob = wt(L[3], 'robos'), tExt = wt(L[3], 'extorsion'), tImp = wt(L[3], 'impacto'), tIni = wt(L[3], 'inicios'), tTasa3 = wt(L[3], 'tasa'), tSeis = wt(L[3], 'seis'), tPob = wt(L[3], 'poblados');

  // ---- 1/2/3. Puebla's zócalo on an ordinary afternoon
  const Z = S.pueblaZocalo('golden');
  const walkers = [[-1.3, 1.5, 1, 0.42], [1.25, 0.5, 1, 0.38], [-0.55, -2.5, 1, 0.34], [0.75, -4.0, 1, 0.4], [-2.0, -1.0, 1, 0.36], [2.0, 3.0, 1, 0.38]]
    .map(([x, z, dir, sp], i) => { const p = K.person(Z, CAST[i % CAST.length], 'civil', x, z, dir > 0 ? 0 : Math.PI); Object.assign(p, { dir, sp, z0: z }); return p; });
  const walk = (t) => walkers.forEach((p, i) => { p.root.position.z = p.z0 + p.dir * p.sp * 0.71 * t; K.pose(p, C.walk(t, p.sp, i)); p.setFace(C.blinkEye(t, i), 'neutral'); });
  const Mp = PM.pueblaMap();
  // ---- 4. Jalisco: a search collective in a dry field
  const F = NS.searchField('golden');
  const moms = [[-2.0, -1.8, 0.5, 'c'], [-0.3, -3.1, -0.2, 's'], [1.5, -2.1, -0.6, 'c']].map(([x, z, y, p], i) => { const r = K.person(F, ['doto', 'mcqueen', 'cafe'][i], 'buscadora', x, z, y); r.mode = p; return r; });
  [[-1.3, -2.7, 0.25], [2.2, -3.0, -0.3]].forEach(([x, z, r]) => { const sh = N.shovel(); sh.position.set(x, -0.08, z); sh.rotation.set(0.12, r, -0.14); F.add(sh); });
  // ---- 5. A corner shop: robbery and extortion
  const Sh = NS.shopStreet('day');
  const keeper = K.person(Sh, 'mcqueen', 'shopkeeper', 0.35, -1.35, 0.15);
  const sic = [K.person(Sh, 'tamamo', 'sicario', -0.55, 0.7, Math.PI + 0.4), K.person(Sh, 'daiwa', 'sicario', 1.65, 1.6, 0.55)];
  const moto = N.pickup('#18191c'); moto.position.set(-4.6, 0, 4.2); moto.rotation.y = Math.PI / 2; Sh.add(moto);

  const sfx = [{ t: 0.0, type: 'crowd', dur: L[1].t0, vol: 0.18 }, { t: 0.3, type: 'birds', dur: 6.0, vol: 0.2 }, { t: tPreg, type: 'hit', vol: 0.4 },
    { t: tSeg - 0.3, type: 'swoosh', vol: 0.35 }, { t: tNov, type: 'pop', vol: 0.5 },
    { t: L[1].t0 - 0.3, type: 'whoosh', vol: 0.35 }, { t: tQui, type: 'pop', vol: 0.4 }, { t: tProm, type: 'pop', vol: 0.35 }, { t: tCin, type: 'hit', vol: 0.5 },
    { t: L[2].t0 - 0.3, type: 'wind', dur: L[3].t0 - L[2].t0, vol: 0.32 }, { t: tTasa, type: 'pop', vol: 0.35 }, { t: tMil, type: 'hit', vol: 0.45 },
    { t: L[3].t0 - 0.3, type: 'traffic', dur: ctx.dur - L[3].t0 + 0.3, vol: 0.28 }, { t: tTasa3, type: 'pop', vol: 0.5 }];

  const tB = tSeg - 0.3, tC = L[1].t0 - 0.3, tD = L[2].t0 - 0.35, tE = L[3].t0 - 0.35;
  const rates = (t) => U.hbars(t, tC + 0.2, tD, 'Asesinatos por cada 100 mil habitantes, 2025', [
    ['Sinaloa', 57, tCin - 0.2, false, `<span style="opacity:${ss(tCua - 0.1, tCua + 0.3, t)}">casi 4 veces Puebla</span>`, '#c0392b'],
    ['Nacional', 21.4, tProm - 0.1, false, '', '#7d8796'],
    ['Puebla', 15, tQui - 0.1, true, 'por debajo del promedio', '#ff8a3a']], { x: 600, y: 230, w: 760, max: 62, dec: 0, sub: 'Defunciones por homicidio, cifras preliminares' });
  const shop = (t) => {
    K.pose(keeper, { ...MA.humble(t, 1), head: [-6, 0, 0] }); keeper.setFace(C.blinkEye(t, 1), 'frown');
    K.pose(sic[0], { ...C.point(t, 2, 0), head: [0, 0, 0] }); sic[0].setFace(C.blinkEye(t, 2), 'frown');
    K.pose(sic[1], C.idle(t, 3, 0.3)); sic[1].setFace(C.blinkEye(t, 3), 'frown');
  };
  const shots = [
    { t0: 0, set: Z, p0: [0.6, 2.3, 14.5], l0: [0, 3.0, -10], p1: [0.5, 2.2, 13.2], l1: [0, 3.1, -10], fov0: 44, act: (t) => {
      walk(t);
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,10,16,${0.3 * ss(tPreg - 0.3, tPreg + 0.2, t)})"></div>`
        + U.questions(t, tPreg - 0.1, tB, [['¿Puebla ya es tan violenta', tPue - 0.2], ['como Sinaloa o Jalisco?', tSin - 0.2]]);
    } },
    { t0: tB, set: Mp, p0: [-3.2, 31, 11.5], l0: [-3.2, 0, -1.6], p1: [-3.2, 30, 11.0], l1: [-3.2, 0, -1.6], fov0: 40, act: (t) => {
      Mp.reset(); Mp.tintAll('#b03a2e', ss(tNov - 0.3, tNov + 0.9, t), 0.6);
      return U.film(t) + `<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,10,16,.5) 0%,rgba(8,10,16,0) 45%)"></div>`
        + U.badge(t, 'INEGI · 2025', '¿Cuánta violencia hay?', 'Asesinatos registrados en Puebla', tSeg - 0.1, tC)
        + U.counter(t, tNov - 0.2, tC, 110, 330, 966, 'asesinatos en Puebla en 2025 (8.4 % menos que en 2024)', { from: 300, dur: 1.2, color: '#ffb35a', w: 600 })
        + U.source(t, tAse, tC, 'INEGI, defunciones por homicidio 2025 (cifras preliminares)');
    } },
    { t0: tC, set: Z, p0: [0.0, 6.5, 20.0], l0: [0, 4.0, -14], p1: [0.0, 6.0, 18.0], l1: [0, 4.0, -14], fov0: 44, act: (t) => {
      walk(t);
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,10,16,.62)"></div>` + rates(t)
        + U.source(t, tQui, tD, 'INEGI, defunciones por homicidio 2025 (cifras preliminares)');
    } },
    { t0: tD, set: F, p0: [2.6, 1.25, 2.6], l0: [-0.5, 0.55, -2.4], p1: [2.2, 1.2, 2.1], l1: [-0.5, 0.55, -2.4], fov0: 40, act: (t) => {
      moms.forEach((m, i) => { K.pose(m, m.mode === 'c' ? C.crouch(t, i, 0.8) : { ...MA.sad(t, i), head: [8, 0, 0] }); m.setFace(C.blinkEye(t, i), 'frown'); });
      return U.film(t) + `<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,10,16,0) 45%,rgba(8,10,16,.55) 72%)"></div>`
        + U.badge(t, 'Jalisco · casa del CJNG', 'Una tasa parecida a la de Puebla', '≈16 asesinatos por cada 100 mil habitantes (estimada)', tCasa - 0.3, tMil - 0.4)
        + U.counter(t, tMil - 0.2, ctx.dur + 1, 1180, 300, 16143, 'registros de personas desaparecidas en Jalisco (2019 – abril de 2026)', { from: 4000, dur: 1.2, color: '#ffd27a', w: 620 })
        + U.source(t, tTasa, tE, 'INEGI 2025: 1,396 asesinatos en Jalisco · Registro Estatal de Personas Desaparecidas de Jalisco');
    } },
    { t0: tE, set: Sh, p0: [3.6, 1.7, 7.6], l0: [-1.5, 1.55, -0.6], p1: [3.3, 1.65, 7.0], l1: [-1.5, 1.55, -0.6], fov0: 40, act: (t) => {
      Sh.shop.shutter.visible = false; shop(t);
      return U.film(t) + `<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,10,16,.62) 0%,rgba(8,10,16,0) 50%)"></div>`
        + U.badge(t, 'Eso sí', 'Delitos de alto impacto', 'Robos, extorsión, secuestro y más', tRob - 0.3, ctx.dur + 1)
        + U.counter(t, tTasa3 - 0.3, ctx.dur + 1, 110, 300, 298, 'delitos de alto impacto por cada 100 mil habitantes: la tasa más alta entre los 6 estados más poblados', { from: 100, dur: 1.1, color: '#ff8a6a', w: 640 })
        + U.source(t, tSeis, ctx.dur + 1, 'Consejo Ciudadano de Seguridad y Justicia de Puebla, enero–mayo de 2026');
    } },
  ];
  const inst = { scene: Z, scenes: [Z, Mp, F, Sh], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
