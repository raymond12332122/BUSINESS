import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import * as K from '../../narco/kit.js';
import * as N from '../../narco/props.js';
import * as NS from '../../narco/sets.js';
import * as X from '../../mx/props.js';
import * as MA from '../../mx/anim.js';
import { runShots, wt } from '../../mx/shots.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as A from '../anim.js';

export { preload } from '../pmap.js';

function plataPlomo(t, a, b, tPla, tPlo) {
  const k = ss(a, a + 0.3, t) * (1 - ss(b - 0.3, b, t)); if (k <= 0) return '';
  const o1 = ss(tPla - 0.1, tPla + 0.25, t), o2 = ss(tPlo - 0.1, tPlo + 0.25, t);
  const card = (ic, txt, o, col) => `<div style="width:300px;padding:22px;border-radius:18px;background:rgba(14,16,22,.88);text-align:center;opacity:${o};transform:scale(${0.85 + 0.15 * o})"><div style="font-size:70px;line-height:1.1">${ic}</div><div style="font:900 52px 'Inter Display',Inter;color:${col};margin-top:6px">${txt}</div></div>`;
  return `<div style="position:absolute;left:0;right:0;top:150px;display:flex;gap:30px;justify-content:center;align-items:center;opacity:${k}">${card('💵', 'PLATA', o1, '#7ee0a0')}<div style="font:900 50px Inter;color:#fff;opacity:${o2}">o</div>${card(U.pistolIcon('#e9e6df', 110), 'PLOMO', o2, '#ff6b4a')}</div>`;
}

export function build(ctx) {
  const L = ctx.L;
  const tFoc = wt(L[0], 'focos'), tTom = wt(L[0], 'tomas'), tCre = wt(L[0], 'crecieron'), tTre = wt(L[0], 'treinta'), tIni = wt(L[0], 'inicios'), tY = wt(L[0], 'y$', 1), tAsa = wt(L[0], 'asaltos'), tPar = wt(L[0], 'paran');
  const tMuc = wt(L[1], 'muchas'), tPeq = wt(L[1], 'pequenas'), tMal = wt(L[1], 'mal'), tPla = wt(L[1], 'plata'), tPlo = wt(L[1], 'plomo');
  const tPart = wt(L[2], 'partido'), tAlc = wt(L[2], 'alcalde'), tMor = wt(L[2], 'morena'), tArm = wt(L[2], 'armenta'), tPid = wt(L[2], 'pidio'), tInc = wt(L[2], 'incluido'), tPos = wt(L[2], 'postular'), tVei = wt(L[2], 'veintisiete');

  // ---- 1. A gas-pipeline tap at night
  const D = S.ductField('night');
  const man = K.person(D, 'tamamo', 'huachicolero', 0.35, -0.75, 0.25);
  const cans = [[0.9, 0.55, '#e8e4dc'], [1.15, 0.3, '#2a5a9a'], [-0.5, 0.6, '#e8e4dc'], [-0.75, 0.25, '#b8432f']].map(([x, z, c]) => { const b = P.bidon(c); b.position.set(x, 0, z); D.add(b); return b; });
  const gasPlume = X.smokeTrail(D, 14, { color: '#aab4bc', size: 0.26, rise: 1.6, drift: [0.9, 0, -0.5], life: 2.0, opacity: 0.3 });
  // ---- 2. The highway at night: a trailer with a pickup on its tail
  const H = NS.highway('nightCity'); H.userData.hemi.intensity = 1.25;
  for (let i = 0; i < 6; i++) { const l = N.streetLight(true, 5); l.position.set(-4.4, 0, 8 - i * 10); l.rotation.y = Math.PI / 2; H.add(l); }
  const truck = P.semi('#2f5a8a', { night: true, stripe: '#b8432f' }); H.add(truck);
  const pk = N.pickup('#16171a', { night: true }); H.add(pk);
  // ---- 3. A village police station: plata o plomo
  const V = S.villageStation('golden');
  const cop = K.person(V, 'oguri', 'municipal', 1.4, 0.7, 0.5);
  const fixer = K.person(V, 'daiwa', 'civilCap', 2.2, 1.15, -1.2);
  K.hold(fixer, N.envelope(), 'R', [0.02, -0.03, 0.06], [0, 0, 0]);
  const truck2 = N.pickup('#16171a'); truck2.position.set(5.0, 0, 3.4); truck2.rotation.y = -0.5; V.add(truck2);
  const gun = K.person(V, 'helios', 'sicarioArmed', 3.95, 2.55, -0.75);
  // ---- 4. Esperanza: the mayor taken away
  const T = S.townStreet('dawn');
  const mayor = K.person(T, 'doto', 'alcalde', 0, 0, 0);
  const esc = [K.person(T, 'mcqueen', 'fgr', -0.75, 0, 0), K.person(T, 'suzuka', 'fgr', 0.75, 0, 0)];
  const cars = [N.patrol('marina'), N.suv('#141518')]; [[-2.4, -8, 0.15], [2.3, -11, -0.1]].forEach(([x, z, r], i) => { cars[i].position.set(x, 0, z); cars[i].rotation.y = r; T.add(cars[i]); });
  // ---- 5. The governor: no candidates linked to crime in 2027
  const Pr = S.pressRoom('Gobierno de Puebla', 'Conferencia de prensa');
  const arm = K.person(Pr, 'armenta', 'armenta', 0, -2.85, 0); arm.root.position.y = 0.25;

  const sfx = [{ t: 0.0, type: 'night', dur: tY, vol: 0.3 }, { t: 0.1, type: 'hiss', dur: tY - 0.2, vol: 0.32 }, { t: tFoc, type: 'hit', vol: 0.45 }, { t: tTre, type: 'pop', vol: 0.45 },
    { t: tY - 0.3, type: 'engines', dur: L[1].t0 - tY + 0.3, vol: 0.45 },
    { t: L[1].t0 - 0.3, type: 'whoosh', vol: 0.35 }, { t: tPla, type: 'cash', vol: 0.5 }, { t: tPlo, type: 'cock', vol: 0.55 },
    { t: tPart - 0.2, type: 'sirens', dur: tArm - tPart, vol: 0.25 }, { t: tMor, type: 'stamp', vol: 0.4 },
    { t: tArm - 0.4, type: 'swoosh', vol: 0.35 }, { t: tPid, type: 'pop', vol: 0.4 }, { t: tPos, type: 'pop', vol: 0.4 }];

  const tB = tY - 0.3, tC = L[1].t0 - 0.3, tD = tPart - 0.15, tE = tArm - 0.4;
  const shots = [
    { t0: 0, set: D, p0: [-1.5, 1.25, 3.6], l0: [0.9, 0.6, -0.6], p1: [-1.3, 1.2, 3.0], l1: [0.9, 0.6, -0.6], fov0: 40, act: (t) => {
      K.pose(man, A.fill(t, 1)); man.setFace(C.blinkEye(t, 1), 'neutral');
      D.lamp.intensity = 12 + 1.5 * Math.sin(t * 7) * Math.sin(t * 3.1);
      gasPlume(t, { x: 0.3, y: 0.25, z: 0 }, 1);
      return U.film(t) + U.big(t, tFoc - 0.3, tTom - 0.3, 'Los focos rojos siguen encendidos', { top: 380, size: 70 })
        + U.pair(t, tTom - 0.2, tB, 'Tomas clandestinas en ductos de gas LP', ['Ene.–mar. 2025', 116], ['Ene.–mar. 2026', 157], { x: 1330, y: 200, change: '+35 %', good: false, sub: 'Puebla' })
        + U.source(t, tIni, tB, 'Pemex, vía Observatorio IGAVIM');
    } },
    { t0: tB, set: H, p0: [-3.3, 1.1, 4.6], l0: [1.2, 1.3, -8], p1: [-3.1, 1.05, 3.8], l1: [1.2, 1.3, -7], fov0: 42, act: (t) => {
      const u = t - tB;
      truck.position.set(1.8, 0, -16 + u * 2.6); truck.drive(t, 1.4);
      pk.position.set(-0.5, 0, -21.5 + u * 2.75); pk.drive(t, 1.6);
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,10,16,.2)"></div>`
        + U.badge(t, 'Autopista Puebla–Orizaba', 'Los asaltos no paran', 'Robo al transporte de carga', tAsa - 0.2, tC);
    } },
    { t0: tC, set: V, p0: [1.3, 1.3, 6.0], l0: [2.65, 0.9, 1.1], p1: [1.4, 1.27, 5.3], l1: [2.65, 0.9, 1.1], fov0: 40, act: (t) => {
      V.patrol.blink(t, 0);
      K.pose(cop, { ...C.idle(t, 1, 0.4), head: [6, 0, 0] }); cop.setFace(C.blinkEye(t, 1), t > tPlo ? 'frown' : 'neutral');
      K.pose(fixer, C.offer(t, 2, 0.8)); fixer.setFace(C.blinkEye(t, 2), 'smile');
      K.pose(gun, { ...C.idle(t, 3, 0.3), gun: t > tPlo - 0.3 ? 'low' : 'port' }); gun.setFace(C.blinkEye(t, 3), 'neutral');
      return U.film(t) + U.badge(t, 'Policías municipales', 'Pocos agentes y sueldos bajos', 'Presa fácil del crimen', tMuc - 0.2, tPla - 0.4)
        + plataPlomo(t, tPla - 0.3, tD, tPla, tPlo);
    } },
    { t0: tD, set: T, p0: [1.1, 1.05, 4.4], l0: [-0.1, 0.9, -3], p1: [1.0, 1.0, 3.6], l1: [-0.1, 0.9, -3], fov0: 40, act: (t) => {
      const z = -2.4 + (t - tD) * 0.32;
      mayor.root.position.z = z; K.pose(mayor, A.cuffed(t, 1)); mayor.setFace(C.blinkEye(t, 1), 'frown');
      esc.forEach((e, i) => { e.root.position.z = z + 0.15; K.pose(e, A.escort(t, 2 + i)); e.setFace(C.blinkEye(t, 2 + i), 'neutral'); });
      cars[0].blink(t, 1);
      return U.film(t) + U.badge(t, 'No es cosa de un solo partido', 'El alcalde de Esperanza llegó por Morena', 'Detenido en septiembre de 2026 · presunto responsable', tD + 0.1, tE);
    } },
    { t0: tE, set: Pr, p0: [1.1, 1.2, 0.6], l0: [0, 1.12, -2.85], p1: [0.8, 1.18, 0.0], l1: [0, 1.12, -2.85], fov0: 38, act: (t) => {
      K.pose(arm, MA.orate(t, 1, 0.55)); arm.setFace(C.blinkEye(t, 1), C.talkMouth(t, 1)); Pr.flags.forEach(f => f.wave(t));
      return U.film(t) + U.doc(t, tPid - 0.4, ctx.dur + 1, 'Rumbo a las elecciones de 2027', [['Armenta pidió a todos los partidos, incluido Morena,', tPid - 0.2], ['no postular candidatos ligados al crimen', tPos - 0.2]], { left: 1170, top: 130, width: 640 });
    } },
  ];
  const inst = { scene: D, scenes: [D, H, V, T, Pr], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
