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

function bigQ(t, a, b, txt, top = 380) {
  const k = ss(a, a + 0.35, t) * (1 - ss(b - 0.3, b, t)); if (k <= 0) return '';
  return `<div style="position:absolute;left:0;right:0;top:${top}px;text-align:center;opacity:${k};font:900 96px 'Inter Display',Inter;color:#fff;text-shadow:0 6px 30px rgba(0,0,0,.7);transform:scale(${0.92 + 0.08 * k})">${txt}</div>`;
}
function plataPlomo(t, a, b, tPla, tPlo) {
  const k = ss(a, a + 0.3, t) * (1 - ss(b - 0.3, b, t)); if (k <= 0) return '';
  const o1 = ss(tPla - 0.1, tPla + 0.25, t), o2 = ss(tPlo - 0.1, tPlo + 0.25, t);
  const card = (ic, txt, o, col) => `<div style="width:300px;padding:22px;border-radius:18px;background:rgba(14,16,22,.88);text-align:center;opacity:${o};transform:scale(${0.85 + 0.15 * o})"><div style="font-size:70px;line-height:1.1">${ic}</div><div style="font:900 52px 'Inter Display',Inter;color:${col};margin-top:6px">${txt}</div></div>`;
  return `<div style="position:absolute;left:0;right:0;top:150px;display:flex;gap:30px;justify-content:center;align-items:center;opacity:${k}">${card('💵', 'PLATA', o1, '#7ee0a0')}<div style="font:900 50px Inter;color:#fff;opacity:${o2}">o</div>${card(U.pistolIcon('#e9e6df', 110), 'PLOMO', o2, '#ff6b4a')}</div>`;
}

export function build(ctx) {
  const L = ctx.L;
  const tPor = wt(L[0], 'por'), tPq = wt(L[0], 'porque'), tNeg = wt(L[0], 'negocio'), tCli = wt(L[0], 'clientes'), tArm = wt(L[0], 'armas');
  const tMun = wt(L[1], 'municipios'), tPol = wt(L[1], 'policia'), tPag = wt(L[1], 'pagada'), tAme = wt(L[1], 'amenazada'), tCom = wt(L[1], 'comprada'), tPla = wt(L[1], 'plata'), tPlo = wt(L[1], 'plomo'),
    tY = wt(L[1], 'y$'), tFis = wt(L[1], 'fiscalias'), tJue = wt(L[1], 'jueces'), tCasi = wt(L[1], 'casi'), tCar = wt(L[1], 'carcel');
  const tNin = wt(L[2], 'ningun'), tPart = wt(L[2], 'partido'), tRes = wt(L[2], 'resuelto'), tNin2 = wt(L[2], 'ninguno'), tSolo = wt(L[2], 'solo');

  // ---- 1/2. Night highway: the business keeps moving
  const H = S.highway('dusk');
  const convoy = [0, 1, 2, 3].map(i => { const p = i === 1 ? N.tankerTruck() : N.pickup(['#1d1e22', '#2a2c30', '#141518', '#202226'][i], { night: true }); p.position.set(i % 2 ? 1.7 : -1.7, 0, -40 - i * 9); if (i === 1) p.rotation.y = Math.PI; H.add(p); return p; });
  // ---- 3. Municipal checkpoint: silver or lead
  const Cp = S.checkpoint();
  const cop = K.person(Cp, 'oguri', 'police', -2.4, 0.5, Math.PI / 2 - 0.2);
  const cop2 = K.person(Cp, 'suzuka', 'police', -3.3, 1.3, Math.PI / 2 + 0.3);
  const suv = N.suv('#2a2c30', { night: true }); suv.position.set(1.5, 0, -1.2); suv.rotation.y = Math.PI; Cp.add(suv);
  const n1 = K.person(Cp, 'daiwa', 'sicario', -0.9, 0.6, -Math.PI / 2 + 0.15), n2 = K.person(Cp, 'tamamo', 'sicarioArmed', 0.2, 1.4, -Math.PI / 2 - 0.2);
  K.hold(n1, N.envelope(), 'R', [0.02, -0.03, 0.06], [0, 0, 0]);
  // ---- 4. Prosecutor's archive
  const F = S.fiscalia();
  // ---- 5. Four presidents in front of the Palacio Nacional
  const Z = MS.zocalo('day');
  const PRES = [['calderon', 'Calderón', 'PAN · 2006–2012', '#7fb2ff'], ['pena', 'Peña Nieto', 'PRI · 2012–2018', '#7ee0a0'], ['amlo', 'López Obrador', 'MORENA · 2018–2024', '#ff9f9f'], ['sheinbaum', 'Sheinbaum', 'MORENA · 2024–', '#ff9f9f']];
  const pres = PRES.map(([w], i) => K.person(Z, w, w, -2.4 + i * 1.6, 6.5, 0));

  const sfx = [{ t: 0.0, type: 'engines', dur: L[1].t0, vol: 0.4 }, { t: tPor - 0.1, type: 'hit', vol: 0.5 }, { t: tNeg, type: 'pop', vol: 0.45 }, { t: tCli, type: 'pop', vol: 0.45 }, { t: tArm, type: 'pop', vol: 0.45 },
    { t: L[1].t0 - 0.3, type: 'night', dur: tY - L[1].t0, vol: 0.4 }, { t: tPla, type: 'cash', vol: 0.5 }, { t: tPlo, type: 'cock', vol: 0.55 },
    { t: tY - 0.3, type: 'paper', vol: 0.5 }, { t: tCar - 0.1, type: 'stamp', vol: 0.55 },
    { t: L[2].t0 - 0.3, type: 'riser', dur: 2.4, vol: 0.35 }, { t: tSolo, type: 'sting', vol: 0.5 }];

  const tB = tPq - 0.3, tC = L[1].t0 - 0.3, tD = tY - 0.3, tE = L[2].t0 - 0.3;
  const road = (t) => convoy.forEach((p, i) => { p.position.z = i === 1 ? 30 - (t * 8.5) % 75 : -40 - i * 9 + t * 9.5; if (p.drive) p.drive(t, 3); p.visible = p.position.z < 16 && p.position.z > -60; });
  const shots = [
    { t0: 0, set: H, p0: [4.6, 1.0, 8], l0: [-0.5, 1.2, -20], p1: [4.2, 0.95, 6.5], l1: [-0.5, 1.2, -20], fov0: 40, act: (t) => {
      road(t);
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,10,16,.35)"></div>` + bigQ(t, tPor - 0.2, tB + 0.25, '¿Por qué no se acaba?');
    } },
    { t0: tB, set: H, p0: [-4.2, 3.2, 10], l0: [0.5, 0.8, -12], p1: [-3.6, 2.8, 8], l1: [0.5, 0.8, -12], fov0: 40, act: (t) => {
      road(t);
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,10,16,.4)"></div>`
        + U.causes(t, tNeg - 0.4, tC, [['💵', 'Un negocio gigantesco', tNeg - 0.2], ['🇺🇸', 'Millones de clientes en EE. UU.', tCli - 0.3], [U.pistolIcon('#e9e6df', 120), 'Armas que no dejan de llegar', tArm - 0.2]], { y: 230 });
    } },
    { t0: tC, set: Cp, p0: [-0.5, 1.2, 4.5], l0: [-1.1, 0.8, 0.6], p1: [-0.6, 1.15, 3.9], l1: [-1.1, 0.8, 0.6], fov0: 40, act: (t) => {
      Cp.patrol.blink(t, 1);
      K.pose(cop, { ...C.idle(t, 1, 0.4), head: [6, 0, 0] }); cop.setFace(C.blinkEye(t, 1), t > tAme ? 'frown' : 'neutral');
      K.pose(cop2, C.idle(t, 2, 0.4)); cop2.setFace(C.blinkEye(t, 2), 'neutral');
      K.pose(n1, C.offer(t, 3, 0.8)); n1.setFace(C.blinkEye(t, 3), 'neutral');
      K.pose(n2, { ...C.idle(t, 4, 0.3), gun: t > tPlo - 0.3 ? 'low' : 'port' }); n2.setFace(C.blinkEye(t, 4), 'neutral');
      return U.film(t) + U.badge(t, 'Policías municipales', 'Mal pagados, amenazados o comprados', 'En muchos municipios, el crimen manda', tMun - 0.2, tPla - 0.4)
        + plataPlomo(t, tPla - 0.3, tD, tPla, tPlo);
    } },
    { t0: tD, set: F, p0: [0.3, 1.15, -1.75], l0: [-0.9, 1.25, -4.5], p1: [0.2, 1.12, -2.1], l1: [-0.9, 1.25, -4.5], fov0: 44, act: (t) => {
      return U.film(t) + `<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,10,16,0) 40%,rgba(8,10,16,.55) 65%)"></div>`
        + U.doc(t, tFis - 0.3, tE, 'Carpeta de investigación', [['Sin fiscales suficientes', tFis], ['Sin jueces que resuelvan', tJue], ['Sin detenidos', tCasi]], { left: 1170, top: 140, width: 620 })
        + U.stamp(t, 'ARCHIVADA', tCar - 0.1, tE, { x: 1460, y: 520, rot: -10 });
    } },
    { t0: tE, set: Z, p0: [0.2, 1.35, 12.5], l0: [0.2, 1.05, 5.0], p1: [0.2, 1.3, 11.2], l1: [0.2, 1.05, 5.0], fov0: 40, act: (t) => {
      Z.flag.wave(t);
      pres.forEach((p, i) => { K.pose(p, { ...C.idle(t, i, 0.4), head: [2, 0, 0] }); p.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.badge(t, '2006 – 2026', 'Cuatro presidentes', 'Ninguno lo ha resuelto', tNin - 0.2, ctx.dur + 1)
        + PRES.map(([, n, sub, col], i) => U.tag(ctx, [-2.4 + i * 1.6, 1.25, 6.5], n, sub, ss(tNin + i * 0.3, tNin + 0.3 + i * 0.3, t), col)).join('');
    } },
  ];
  const inst = { scene: H, scenes: [H, Cp, F, Z], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
