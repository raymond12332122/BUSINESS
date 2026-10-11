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

const screenTex = (title, sub) => N.canvasTex(1024, 512, (x, W, H) => {
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#5a1f2a'); g.addColorStop(1, '#2a0f16'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = '#d4af37'; x.fillRect(W / 2 - 60, 318, 120, 5); x.textAlign = 'center'; x.fillStyle = '#ffffff'; x.font = '900 60px Inter'; x.fillText(title, W / 2, 396);
  x.fillStyle = '#e8d9b0'; x.font = '700 32px Inter'; x.fillText(sub, W / 2, 448); });

// Big centred question / answer card.
function ask(t, q, tq, a, ta, b) {
  const k = ss(tq - 0.2, tq + 0.2, t) * (1 - ss(b - 0.3, b, t)); if (k <= 0) return '';
  const ka = ss(ta - 0.1, ta + 0.3, t);
  return `<div style="position:absolute;left:0;right:0;top:120px;text-align:center;opacity:${k}">
    <div style="font:900 84px 'Inter Display',Inter;color:#fff;text-shadow:0 6px 30px rgba(0,0,0,.6);transform:scale(${0.94 + 0.06 * k})">${q}</div>
    <div style="display:inline-block;margin-top:34px;padding:16px 30px;border-radius:16px;background:#f4efe2;color:#1d1a16;font:800 40px Inter;opacity:${ka};transform:translateY(${(1 - ka) * 20}px)">${a}</div></div>`;
}
// Stacked numbers on the left.
function tally(t, items, b) {
  return items.map(([v, lab, tt, col], i) => U.counter(t, tt, b, 100, 150 + i * 205, v, lab, { from: Math.round(v * 0.2), dur: 1.0, color: col, prefix: i === 0 ? '+' : '', w: 560 })).join('');
}

export function build(ctx) {
  const L = ctx.L;
  const tOct = wt(L[0], 'octubre'), tCla = wt(L[0], 'claudia'), tDe = wt(L[0], 'de$', 1), tLos = wt(L[0], 'los'), tCam = wt(L[0], 'cambio');
  const tOmar = wt(L[1], 'omar'), tApo = wt(L[1], 'aposto'), tInt = wt(L[1], 'inteligencia'), tRep = wt(L[1], 'reporta'), t67 = wt(L[1], 'sesenta'), tMil = wt(L[1], 'miles'), t92 = wt(L[1], 'noventa'), tEnv = wt(L[1], 'enviados');
  const tFeb = wt(L[2], 'febrero'), tEj = wt(L[2], 'ejercito'), tAbat = wt(L[2], 'abatio'), tMen = wt(L[2], 'mencho'), tLid = wt(L[2], 'lider'), tY = wt(L[2], 'y$'), tCif = wt(L[2], 'cifras'), tMit = wt(L[2], 'mitad');

  // ---- 1/2. Morning press conference (Sheinbaum, then García Harfuch)
  const Mn = S.mananera(); Mn.screen.material = new THREE.MeshBasicMaterial({ map: screenTex('La mañanera', 'Conferencia de prensa matutina') });
  const scr1 = Mn.screen.material, scr0 = new THREE.MeshBasicMaterial({ color: '#2a1016' }), scr2 = new THREE.MeshBasicMaterial({ map: screenTex('Gabinete de Seguridad', 'Informe de resultados') });
  const csp = K.person(Mn, 'sheinbaumSuit', 'sheinbaumSuit', 0, -2.85, 0); csp.root.position.y = 0.25;
  const ogh = K.person(Mn, 'harfuch', 'harfuch', 0, -2.85, 0); ogh.root.position.y = 0.25;
  // ---- 3. Airfield: prisoners handed over to the US
  const Af = S.airfield('day');
  // single file walking to the plane: escort, prisoner, escort, prisoner...
  const file = [0, 1, 2, 3, 4, 5].map(i => K.person(Af, ['helios', 'doto', 'oguri', 'tamamo', 'suzuka', 'daiwa'][i], i % 2 ? 'prisoner' : 'marino', 0.4 + (i % 2) * 0.35, 0.45 + i * 0.72, -Math.PI / 2 + 0.25));
  // ---- 4. Tapalpa, Jalisco
  const Tp = S.tapalpa('dawn');
  const helis = [[-6, 8.5, -12, 0.4], [5, 10.5, -18, -0.3]].map(([x, y, z, r]) => { const h = N.helicopter('#4a5638'); h.position.set(x, y, z); h.rotation.y = r; Tp.add(h); h.base = [x, y, z]; return h; });
  const sold = [0, 1, 2].map(i => K.person(Tp, ['mcqueen', 'cafe', 'helios'][i], 'soldier', -1.2 + i * 1.3, -6.5 + (i % 2) * 0.8, Math.PI + 0.2 - i * 0.2));
  // ---- 5. Palacio Nacional
  const Z = MS.zocalo('day');

  const sfx = [{ t: 0.4, type: 'crowd', dur: tDe - 0.6, vol: 0.22 }, { t: tCla, type: 'sting', vol: 0.4 },
    { t: tDe - 0.3, type: 'whoosh', vol: 0.45 }, { t: tLos, type: 'pop', vol: 0.4 },
    { t: L[1].t0 - 0.3, type: 'swoosh', vol: 0.4 }, { t: tRep - 0.4, type: 'jet', dur: L[2].t0 - tRep, vol: 0.35 }, { t: t67, type: 'pop', vol: 0.45 }, { t: tMil, type: 'pop', vol: 0.45 }, { t: t92, type: 'pop', vol: 0.45 },
    { t: L[2].t0 - 0.3, type: 'heli', dur: tY - L[2].t0, vol: 0.45 }, { t: tAbat, type: 'stamp', vol: 0.6 },
    { t: tY - 0.3, type: 'riser', dur: 2.0, vol: 0.35 }, { t: tMit, type: 'hit', vol: 0.55 }];

  const tB = tDe - 0.3, tC = L[1].t0 - 0.3, tC2 = tRep - 0.35, tD = L[2].t0 - 0.3, tE = tY - 0.3;
  const podium = (t, who, other) => { who.root.visible = true; other.root.visible = false;
    K.pose(who, MA.orate(t, 1, 0.55)); who.setFace(C.blinkEye(t, 1), C.talkMouth(t, 1)); Mn.flags.forEach(f => f.wave(t)); };
  const shots = [
    { t0: 0, set: Mn, p0: [1.1, 1.2, 0.6], l0: [0, 1.12, -2.85], p1: [0.8, 1.18, 0.0], l1: [0, 1.12, -2.85], fov0: 38, act: (t) => {
      Mn.screen.material = scr1; podium(t, csp, ogh);
      return U.film(t) + U.badge(t, '1 de octubre de 2024', 'Llega Claudia Sheinbaum', 'Primera mujer presidenta de México', tOct - 0.2, tB)
        + U.nameplate(ctx, [0, 1.42, -2.85], 'Claudia Sheinbaum', 'Presidenta 2024–2030', tCla - 0.2, tB);
    } },
    { t0: tB, set: Mn, p0: [-1.5, 1.05, -0.4], l0: [0, 1.1, -2.85], p1: [-1.15, 1.05, -0.9], l1: [0, 1.1, -2.85], fov0: 36, act: (t) => {
      Mn.screen.material = scr0; podium(t, csp, ogh);
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,10,16,${0.8 * ss(tB, tB + 0.4, t)})"></div>`
        + ask(t, '¿De verdad no hace nada?', tB + 0.2, 'Los datos dicen que sí cambió la estrategia', tLos - 0.1, tC);
    } },
    { t0: tC, set: Mn, p0: [0.9, 1.2, 0.3], l0: [0, 1.12, -2.85], p1: [0.7, 1.18, -0.2], l1: [0, 1.12, -2.85], fov0: 38, act: (t) => {
      Mn.screen.material = scr2; podium(t, ogh, csp);
      return U.film(t) + U.nameplate(ctx, [0, 1.42, -2.85], 'Omar García Harfuch', 'Secretario de Seguridad', tOmar - 0.2, tC2);
    } },
    { t0: tC2, set: Af, p0: [-7.0, 1.45, 1.2], l0: [2.0, 1.15, 0.0], p1: [-6.2, 1.4, 1.4], l1: [2.0, 1.15, 0.0], fov0: 40, act: (t) => {
      file.forEach((p, i) => { const pr = i % 2 === 1;
        K.pose(p, pr ? { ...MA.humble(t, i), head: [10, 0, 0] } : { ...C.idle(t, i, 0.3), gun: 'port' }); p.setFace(C.blinkEye(t, i), pr ? 'frown' : 'neutral'); });
      return U.film(t) + `<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,10,16,.6) 0%,rgba(8,10,16,0) 45%)"></div>`
        + tally(t, [[67200, 'detenidos por delitos de alto impacto', t67 - 0.2, '#ffffff'], [2771, 'laboratorios y narcoalmacenes inhabilitados', tMil - 0.2, '#ffd27a'], [92, 'capos enviados a Estados Unidos', t92 - 0.2, '#7ec8ff']], tD)
        + U.source(t, t67, tD, 'SSPC, oct. 2024 – ago. 2026 · cifras del propio gobierno');
    } },
    { t0: tD, set: Tp, p0: [6.5, 2.4, 9.5], l0: [-1.5, 4.5, -12], p1: [5.6, 2.3, 8.0], l1: [-1.5, 4.8, -12], fov0: 42, act: (t) => {
      helis.forEach((h, i) => { h.spin(t); const u = t - tD; h.position.set(h.base[0] + u * (i ? -0.6 : 0.8), h.base[1] + 0.25 * Math.sin(t * 1.3 + i), h.base[2] + u * 0.5); });
      sold.forEach((s, i) => { K.pose(s, { ...C.idle(t, i, 0.3), gun: 'port' }); s.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.badge(t, '22 de febrero de 2026', 'Cae “El Mencho”', 'Operativo del Ejército en Tapalpa, Jalisco', tFeb - 0.2, tE)
        + U.wanted(t, tMen - 0.4, tE, 'Nemesio Oseguera, “El Mencho”', 'Líder del Cártel Jalisco Nueva Generación', { x: 1250, y: 300, stampTxt: 'ABATIDO', tStamp: tAbat + 0.5 })
        + U.source(t, tLid, tE, 'Murió tras ser herido en el operativo · hubo bloqueos y quema de vehículos en 20 estados');
    } },
    { t0: tE, set: Z, p0: [-3.8, 1.9, 13], l0: [-3.0, 4.4, -16], p1: [-3.4, 1.85, 10.5], l1: [-3.0, 4.6, -16], fov0: 42, act: (t) => {
      Z.flag.wave(t);
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,10,16,${0.25 * ss(tE, tE + 0.4, t)})"></div>`
        + U.badge(t, 'Cifras oficiales', 'Bajan los homicidios', 'Septiembre de 2024 → agosto de 2026', tE + 0.2, ctx.dur + 1)
        + U.dailyBars(t, tCif - 0.3, ctx.dur + 1, { x: 1330, y: 290 });
    } },
  ];
  const inst = { scene: Mn, scenes: [Mn, Af, Tp, Z], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
