import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as N from '../props.js';
import * as MA from '../../mx/anim.js';
import { runShots, wt } from '../../mx/shots.js';
import * as U from '../ui.js';

export { preload } from '../mapkit.js';
const PANEL = 'background:rgba(14,16,22,.86);border-radius:18px;box-shadow:0 18px 50px rgba(0,0,0,.35)';
const tri = (up, c) => `<svg width="34" height="30" viewBox="0 0 34 30"><path d="${up ? 'M17 2L32 28H2Z' : 'M17 28L32 2H2Z'}" fill="${c}"/></svg>`;

// Two opposite trends side by side.
function trends(t, a, b, rows, { x = 1180, y = 170 } = {}) {
  const k = ss(a, a + 0.4, t) * (1 - ss(b - 0.35, b, t)); if (k <= 0) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:600px;padding:24px 30px;${PANEL};opacity:${k}">${rows.map(([lab, up, col, tt, note]) => {
    const o = ss(tt, tt + 0.35, t);
    return `<div style="display:flex;align-items:center;gap:18px;margin:10px 0;opacity:${o};transform:translateX(${(1 - o) * 20}px)">${tri(up, col)}<div style="font:900 40px 'Inter Display',Inter;color:#fff">${lab}</div><div style="font:700 26px Inter;color:${col};margin-left:auto">${note}</div></div>`; }).join('')}</div>`;
}
// Turnout bar: 13 % voted.
function turnout(t, a, b, pct, { x = 1170, y = 330 } = {}) {
  const k = ss(a, a + 0.4, t) * (1 - ss(b - 0.35, b, t)); if (k <= 0) return '';
  const g = ss(a + 0.3, a + 1.3, t);
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:620px;padding:26px 30px;${PANEL};opacity:${k}">
    <div style="font:900 30px 'Inter Display',Inter;color:#fff">Participación en la elección judicial</div>
    <div style="display:flex;align-items:baseline;gap:14px;margin:12px 0 14px"><div style="font:900 84px 'Inter Display',Inter;color:#ffb35a">${Math.round(pct * g)}%</div><div style="font:700 26px Inter;color:#c9ced6">de los votantes</div></div>
    <div style="height:30px;border-radius:15px;background:rgba(255,255,255,.14);overflow:hidden"><div style="width:${pct * g}%;height:100%;background:#ffb35a;border-radius:15px"></div></div>
    <div style="font:700 22px Inter;color:#9aa1ab;margin-top:10px">87% no votó</div></div>`;
}

export function build(ctx) {
  const L = ctx.L;
  const tCri = wt(L[0], 'criticas'), tOrg = wt(L[0], 'organizaciones'), tMex = wt(L[0], 'mexico'), tBaj = wt(L[0], 'bajan'), tSub = wt(L[0], 'suben'), tDes = wt(L[0], 'desapariciones');
  const tExt = wt(L[1], 'extorsion'), tMax = wt(L[1], 'maximos'), tPoc = wt(L[1], 'pocos'), tNex = wt(L[1], 'nexos'), tHas = wt(L[1], 'hasta'), tWas = wt(L[1], 'washington'), tArr = wt(L[1], 'arrestar'), tFun = wt(L[1], 'funcionarios');
  const tRef = wt(L[2], 'reforma'), tJue = wt(L[2], 'jueces'), t13 = wt(L[2], 'trece'), tY = wt(L[2], 'y$'), tNov = wt(L[2], 'noviembre'), tAse = wt(L[2], 'asesinato'), tMan = wt(L[2], 'manzo'), tUru = wt(L[2], 'uruapan'), tMil = wt(L[2], 'miles'), tMar = wt(L[2], 'marchar');

  // ---- 1/2. Searching mothers in a dry field
  const F = S.searchField('golden');
  const moms = [[-2.2, -1.6, 0.5, 'c'], [-0.4, -3.2, -0.2, 's'], [1.4, -2.0, -0.6, 'c'], [3.2, -3.6, -0.9, 's']].map(([x, z, y, p], i) => { const r = K.person(F, ['doto', 'mcqueen', 'cafe', 'suzuka'][i], 'buscadora', x, z, y); r.mode = p; return r; });
  [[-1.4, -2.6, 0.25], [2.2, -3.1, -0.3], [0.5, -4.4, 0.15]].forEach(([x, z, r]) => { const sh = N.shovel(); sh.position.set(x, -0.08, z); sh.rotation.set(0.12, r, -0.14); F.add(sh); });
  // ---- 3a. Closed shop; 3b. a deal at night; 3c. Washington
  const Sh = S.shopStreet('dusk'); Sh.shop.shutter.visible = true;
  const Av = S.avenue('night', { seed: 53 });
  const suv = N.suv('#141518', { night: true }); suv.position.set(-1.9, 0, -3.2); suv.rotation.y = 0.1; Av.add(suv);
  const pol = K.person(Av, 'suzuka', 'official', -0.5, -0.5, 1.35), boss = K.person(Av, 'daiwa', 'narco80', 0.5, -0.5, -1.35);
  K.hold(boss, N.briefcase(false), 'R', [0.0, -0.08, 0.02], [0, 0, 0]);
  const W = S.whiteHouseSet('day');
  // ---- 4. The new judges
  const Ct = S.courtroom({ mx: true });
  const judges = [-1.2, 0, 1.2].map((x, i) => { const j = K.person(Ct, ['daiwa', 'suzuka', 'helios'][i], 'judge', x, -4.45, 0); j.root.position.y = 1.2; return j; });
  // ---- 5. Generation Z march
  const Z = S.zocaloMarch('overcast');
  const crowd = K.crowd(Z, 'marcha', 16, [-5, 3.2, 5, 10.5], { seed: 77, yaw: Math.PI });
  const hats = K.crowd(Z, 'marchaSombrero', 8, [-4.4, 3.6, 4.4, 9.6], { seed: 78, yaw: Math.PI });

  const sfx = [{ t: 0.0, type: 'wind', dur: L[1].t0 - 0.3, vol: 0.35 }, { t: tOrg - 0.3, type: 'whoosh', vol: 0.35 }, { t: tBaj, type: 'tick', vol: 0.35 }, { t: tSub, type: 'pop', vol: 0.45 },
    { t: L[1].t0 - 0.3, type: 'shutter', vol: 0.45 }, { t: tMax, type: 'hit', vol: 0.45 }, { t: tPoc - 0.3, type: 'night', dur: tHas - tPoc, vol: 0.35 }, { t: tHas - 0.3, type: 'swoosh', vol: 0.4 },
    { t: L[2].t0 - 0.3, type: 'gavel', vol: 0.55 }, { t: t13, type: 'pop', vol: 0.45 },
    { t: tY - 0.3, type: 'crowd', dur: ctx.dur - tY + 0.3, vol: 0.45 }, { t: tMil, type: 'drums', dur: 3.0, vol: 0.4 }];

  const tB = tOrg - 0.3, tC = L[1].t0 - 0.3, tC2 = tPoc - 0.3, tC3 = tHas - 0.3, tD = L[2].t0 - 0.3, tE = tY - 0.3;
  const field = (t) => moms.forEach((m, i) => { K.pose(m, m.mode === 'c' ? C.crouch(t, i, 0.8) : { ...MA.sad(t, i), head: [8, 0, 0] }); m.setFace(C.blinkEye(t, i), 'frown'); });
  const shots = [
    { t0: 0, set: F, p0: [4.6, 1.7, 5.2], l0: [-0.6, 0.6, -3.0], p1: [4.0, 1.6, 4.4], l1: [-0.6, 0.6, -3.0], fov0: 40, act: (t) => {
      field(t);
      return U.film(t) + U.badge(t, 'Las críticas', 'Madres buscadoras', 'Colectivos que buscan a sus desaparecidos', tCri - 0.3, tB + 0.2);
    } },
    { t0: tB, set: F, p0: [0.6, 1.0, 1.4], l0: [-1.9, 0.6, -1.9], p1: [0.4, 0.98, 1.0], l1: [-1.9, 0.6, -1.9], fov0: 40, act: (t) => {
      field(t);
      return U.film(t) + `<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,10,16,0) 45%,rgba(8,10,16,.55) 70%)"></div>`
        + trends(t, tBaj - 0.45, tC, [['Homicidios', false, '#7ee0a0', tBaj - 0.15, 'bajan'], ['Desapariciones', true, '#ff6b4a', tSub - 0.15, 'suben']], { x: 1200, y: 170 })
        + U.counter(t, tDes - 0.2, tC, 1200, 450, 132735, 'personas desaparecidas y no localizadas', { from: 90000, dur: 1.2, color: '#ffd27a', w: 600 })
        + U.source(t, tDes, tC, 'México Evalúa · Causa en Común · Registro Nacional de Personas Desaparecidas (ago. 2026)');
    } },
    { t0: tC, set: Sh, p0: [0.2, 1.5, 7.6], l0: [-0.4, 1.5, 0], p1: [0.1, 1.5, 6.6], l1: [-0.4, 1.5, 0], fov0: 44, act: (t) => {
      return U.film(t) + `<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,10,16,.65) 0%,rgba(8,10,16,0) 50%)"></div>`
        + U.counter(t, tExt - 0.1, tC2, 110, 280, 6562, 'víctimas de extorsión en el primer semestre de 2026: el más alto en 11 años', { from: 2000, dur: 1.1, color: '#ffb35a', w: 620 })
        + U.source(t, tMax, tC2, 'Coparmex con datos del SESNSP · el gobierno reporta bajas en su promedio diario');
    } },
    { t0: tC2, set: Av, p0: [0.35, 1.05, 2.5], l0: [0, 0.8, -0.6], p1: [0.3, 1.0, 2.0], l1: [0, 0.8, -0.6], fov0: 40, act: (t) => {
      K.pose(pol, C.offer(t, 1, 0.6)); pol.setFace(C.blinkEye(t, 1), 'smile');
      K.pose(boss, C.offer(t, 2, 0.8)); boss.setFace(C.blinkEye(t, 2), 'smile');
      return U.film(t) + U.badge(t, 'Narcopolítica', 'Pocos llegan a juicio', 'Políticos señalados por nexos con el crimen', tPoc - 0.1, tC3 + 0.2);
    } },
    { t0: tC3, set: W, p0: [5.5, 1.6, 10], l0: [-1.5, 3.4, -16], p1: [4.8, 1.6, 8.8], l1: [-1.5, 3.6, -16], fov0: 40, act: (t) => {
      W.flag.wave(t);
      return U.film(t) + U.doc(t, tWas - 0.3, tD, 'Lo que exige Washington', [['Arrestar y enjuiciar a funcionarios ligados al crimen', tArr - 0.2], ['Ya retiró visas a políticos mexicanos', tFun + 0.1]], { left: 90, top: 120, width: 640 });
    } },
    { t0: tD, set: Ct, p0: [2.6, 1.9, 2.8], l0: [0, 1.75, -4.2], p1: [2.2, 1.85, 2.2], l1: [0, 1.75, -4.2], fov0: 40, act: (t) => {
      judges.forEach((j, i) => { K.pose(j, { ...C.idle(t, i, 0.25), head: [4, 0, 0] }); j.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.badge(t, '1 de junio de 2025', 'La elección judicial', 'Jueces y ministros electos por voto popular', tRef - 0.2, tE)
        + turnout(t, t13 - 0.4, tE, 13, { x: 1170, y: 330 }) + U.source(t, t13, tE, 'INE, cómputos de la elección judicial 2025');
    } },
    { t0: tE, set: Z, p0: [4.0, 1.45, -0.6], l0: [-0.6, 1.05, 6.0], p1: [3.4, 1.4, -0.2], l1: [-0.6, 1.05, 6.0], fov0: 42, act: (t) => {
      const u = t - tE;
      [...crowd, ...hats].forEach((p, i) => { p.root.position.z = (p.z0 ??= p.root.position.z) - u * 0.35; K.pose(p, C.walk(t, 0.35, i)); p.setFace(C.blinkEye(t, i), i % 3 ? 'neutral' : 'frown'); });
      Z.banners.forEach((b, i) => { b.position.z = (b.z0 ??= b.position.z) - u * 0.35; }); Z.mflags.forEach((f, i) => { f.position.z = (f.z0 ??= f.position.z) - u * 0.35; f.wave(t + i); });
      return U.film(t) + U.badge(t, '15 de noviembre de 2025', 'Marcha de la Generación Z', 'Tras el asesinato de Carlos Manzo, alcalde de Uruapan', tNov - 0.2, ctx.dur + 1)
        + U.source(t, tUru, ctx.dur + 1, 'Los sombreros recordaban a Manzo, asesinado el 1 de noviembre de 2025');
    } },
  ];
  const inst = { scene: F, scenes: [F, Sh, Av, W, Ct, Z], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
