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

// Screen behind the lectern at the morning press conference.
const screenTex = (title, sub) => N.canvasTex(1024, 512, (x, W, H) => {
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#5a1f2a'); g.addColorStop(1, '#2a0f16'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = '#d4af37'; x.fillRect(W / 2 - 60, 318, 120, 5); x.textAlign = 'center'; x.fillStyle = '#ffffff'; x.font = '900 60px Inter'; x.fillText(title, W / 2, 396);
  x.fillStyle = '#e8d9b0'; x.font = '700 32px Inter'; x.fillText(sub, W / 2, 448); });

export function build(ctx) {
  const L = ctx.L;
  const t18 = wt(L[0], 'dieciocho'), tAMLO = wt(L[0], 'andres'), tPro = wt(L[0], 'prometio'), tAbr = wt(L[0], 'abrazos'), tBal = wt(L[0], 'balazos'), tCau = wt(L[0], 'causas'), tPob = wt(L[0], 'pobreza');
  const tCreo = wt(L[1], 'creo'), tGN = wt(L[1], 'guardia'), tEj = wt(L[1], 'ejercito'), tPero = wt(L[1], 'pero'), tViol = wt(L[1], 'violento'), tCerca = wt(L[1], 'cerca');
  const t19 = wt(L[2], 'diecinueve'), tCul = wt(L[2], 'culiacanazo'), tCap = wt(L[2], 'capturo'), tOv = wt(L[2], 'ovidio'), tSol = wt(L[2], 'solto'), tAtq = wt(L[2], 'ataques');

  // ---- 1. Morning press conference
  const Mn = S.mananera(); Mn.screen.material = new THREE.MeshBasicMaterial({ map: screenTex('La mañanera', 'Conferencia de prensa matutina') });
  const amlo = K.person(Mn, 'amloSuit', 'amloSuit', 0, -2.85, 0); amlo.root.position.y = 0.25;
  const press = K.crowd(Mn, 'civil', 6, [-2.6, 1.6, 2.6, 2.9], { seed: 31, yaw: Math.PI });
  // ---- 2. The National Guard
  const A = S.avenue('day', { seed: 47 });
  const gn = []; for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) gn.push(K.person(A, ['oguri', 'doto', 'helios', 'suzuka', 'tamamo', 'mcqueen'][(i + r * 2) % 6], 'guardia', -3.0 + i * 1.2, -2 - r * 1.3, 0));
  const tr = N.armyTruck(); tr.position.set(4.6, 0, -6.5); tr.rotation.y = -0.4; A.add(tr);
  // ---- 4. Culiacán, 17 October 2019
  const Cu = S.culiacan('dusk');
  const gun = [[-2.6, -3.2, 0.5], [2.8, -5.0, -0.4], [-3.4, -8.5, 0.3]].map(([x, z, y], i) => K.person(Cu, ['tamamo', 'daiwa', 'helios'][i], 'sicarioArmed', x, z, y));
  const pk = N.pickup('#151618'); pk.position.set(3.4, 0, -2.4); pk.rotation.y = -0.5; Cu.add(pk);

  const sfx = [{ t: 0.4, type: 'crowd', dur: L[1].t0 - 0.6, vol: 0.25 }, { t: tAbr - 0.05, type: 'sting', vol: 0.4 },
    { t: L[1].t0 - 0.35, type: 'march', dur: 3.4, vol: 0.45 }, { t: tPero - 0.3, type: 'whoosh', vol: 0.4 }, { t: tCerca - 0.1, type: 'hit', vol: 0.55 },
    { t: L[2].t0 - 0.35, type: 'fire', dur: ctx.dur - L[2].t0 + 0.35, vol: 0.4 }, { t: tCul, type: 'gunfire', dur: 2.2, vol: 0.3 }, { t: tCap, type: 'sirens', dur: 2.5, vol: 0.3 },
    { t: tSol - 0.05, type: 'stamp', vol: 0.6 }, { t: tAtq, type: 'gunfire', dur: 1.8, vol: 0.25 }];

  const tB = L[1].t0 - 0.3, tC = tPero - 0.25, tD = L[2].t0 - 0.3;
  const shots = [
    { t0: 0, set: Mn, p0: [1.1, 1.2, 0.6], l0: [0, 1.12, -2.85], p1: [0.8, 1.18, 0.0], l1: [0, 1.12, -2.85], fov0: 38, act: (t) => {
      K.pose(amlo, t > tPro - 0.2 && t < tB - 0.3 ? MA.orate(t, 1, 0.7) : C.idle(t, 1, 0.5)); amlo.setFace(C.blinkEye(t, 1), t > tPro - 0.2 && t < tB - 0.3 ? C.talkMouth(t, 1) : 'smile');
      press.forEach((p, i) => { K.pose(p, C.idle(t, i + 2, 0.3)); p.setFace(C.blinkEye(t, i + 2), 'neutral'); });
      Mn.flags.forEach(f => f.wave(t));
      return U.film(t) + U.badge(t, 'Diciembre de 2018', 'Llega López Obrador', 'Una nueva estrategia de seguridad', t18 - 0.2, tAbr - 0.3)
        + U.nameplate(ctx, [0, 1.42, -2.85], 'Andrés Manuel López Obrador', 'Presidente 2018–2024', tAMLO - 0.2, tAbr - 0.2)
        + U.quote(t, [['Abrazos,', tAbr - 0.1], ['no balazos', tBal - 0.1]], 'López Obrador', tAbr - 0.25, tCau - 0.2, 26)
        + U.doc(t, tCau - 0.2, tB, 'La idea', [['Atender las causas', tCau - 0.1], ['Becas y programas sociales contra la pobreza', tPob - 0.2], ['En lugar de la guerra frontal', tPob + 0.9]], { left: 1150, top: 120, width: 640 });
    } },
    { t0: tB, set: A, p0: [2.6, 1.3, 5.6], l0: [-0.4, 0.95, -2.4], p1: [2.2, 1.25, 4.6], l1: [-0.4, 0.95, -2.4], fov0: 40, act: (t) => {
      gn.forEach((g, i) => { K.pose(g, { ...C.idle(t, i, 0.25), gun: 'port' }); g.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.badge(t, '2019', 'Nace la Guardia Nacional', 'Y el Ejército recibe más tareas: aduanas, puertos, obras', tGN - 0.3, tC + 0.2);
    } },
    { t0: tC, set: A, p0: [2.2, 1.25, 4.6], l0: [-0.4, 0.95, -2.4], fov0: 40, act: (t) => {
      gn.forEach((g, i) => { K.pose(g, { ...C.idle(t, i, 0.25), gun: 'port' }); g.setFace(C.blinkEye(t, i), 'neutral'); });
      const prog = ss(tC + 0.2, tViol + 0.8, t);
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,10,16,${0.78 * ss(tC, tC + 0.4, t)})"></div>`
        + U.homChart(t, tC, tD + 0.3, { upto: 2024, progress: prog, bands: [[2006.92, 2012.92, 'Calderón', '#7f8c8d', tC + 0.3], [2012.92, 2018.92, 'Peña Nieto', '#95a5a6', tC + 0.5], [2018.92, 2024.75, 'López Obrador', '#c0392b', tViol - 0.4]] })
        + (t > tCerca - 0.2 ? `<div style="position:absolute;left:1228px;top:470px;padding:14px 22px;background:#f4efe2;border-radius:14px;color:#1d1a16;opacity:${ss(tCerca - 0.2, tCerca + 0.2, t) * (1 - ss(tD, tD + 0.3, t))};box-shadow:0 10px 30px rgba(0,0,0,.35)"><div style="font:900 40px 'Inter Display',Inter">≈199,600</div><div style="font:700 21px Inter">asesinatos en su sexenio</div></div>` : '');
    } },
    { t0: tD, set: Cu, p0: [1.0, 1.5, 5.5], l0: [-0.2, 1.4, -12], p1: [0.6, 1.45, 4.0], l1: [-0.2, 1.4, -12], fov0: 42, act: (t) => {
      Cu.blaze.forEach(({ c, x, z, fire, smoke }, i) => { fire(t + i * 0.37, { x, y: 0.6, z }); smoke(t + i * 0.61, { x, y: 1.2, z }); });
      Cu.fireLight.intensity = 14 + 3 * Math.sin(t * 11) * Math.sin(t * 5.3);
      gun.forEach((g, i) => { K.pose(g, { ...C.idle(t, i, 0.3), gun: 'port' }); g.setFace(C.blinkEye(t, i), 'frown'); });
      return U.film(t) + U.badge(t, '17 de octubre de 2019', 'El “Culiacanazo”', 'Culiacán, Sinaloa', t19 - 0.2, ctx.dur + 1)
        + U.wanted(t, tOv - 0.3, ctx.dur + 1, 'Ovidio Guzmán', 'Hijo de “El Chapo”', { x: 1250, y: 260, stampTxt: 'LIBERADO', tStamp: tSol })
        + U.source(t, tAtq, ctx.dur + 1, 'Fue recapturado en enero de 2023 y extraditado a EE. UU.');
    } },
  ];
  const inst = { scene: Mn, scenes: [Mn, A, Cu], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
