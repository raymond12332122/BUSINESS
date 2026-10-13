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

export function build(ctx) {
  const L = ctx.L;
  const tMex = wt(L[0], 'mexico'), tTreinta = wt(L[0], 'treinta'), tLaz = wt(L[0], 'lazaro'), tAsilo = wt(L[0], 'asilo'), tCoy = wt(L[0], 'coyoacan'), tFrida = wt(L[0], 'frida'), tDiego = wt(L[0], 'diego');
  const tSob = wt(L[1], 'sobrevivio'), tAtaque = wt(L[1], 'ataque'), tSiq = wt(L[1], 'siqueiros'), tAgo = wt(L[1], 'agosto'), tAgente = wt(L[1], 'agente'), tRamon = wt(L[1], 'ramon'), tMato = wt(L[1], 'mato'), tPiolet = wt(L[1], 'piole');

  // ---- 1. Tampico, January 1937
  const Tp = S.tampico();
  const tro1 = leader(Tp, 'trotski', -4.6, -18, 0); tro1.root.position.y = 0.12;
  const natalia = K.person(Tp, 'daiwa', 'duquesa', -3.9, -18.6, 0); natalia.root.position.y = 0.12;
  // ---- 2. Cárdenas grants asylum
  const Of = S.mxOffice();
  const card = leader(Of, 'cardenas', Of.seat[0], Of.seat[2], 0); card.root.position.y = Of.seat[1];
  // ---- 3. Coyoacán: Frida and Diego
  const Co = S.coyoacan('golden');
  const tro2 = leader(Co, 'trotski', -0.4, -4.2, 0.4), frida = leader(Co, 'frida', 0.9, -3.4, -1.9), diego = leader(Co, 'diego', 1.6, -4.4, -1.6);
  // ---- 4. The house on Viena street, 24 May 1940
  const Hf = S.trotskyFort('night');
  const muz = [[-3.5, 2.6], [-1.8, 2.9], [0.6, 2.7], [2.4, 3.0]].map(([x, z]) => new THREE.Vector3(x, 0.5, z));
  const fx = P.volleyFx(Hf, muz, { color: '#d8d8d4', size: 0.45 });
  // ---- 5. The study, 20 August 1940
  const Sd = S.trotskyStudy();
  const tro3 = leader(Sd, 'trotski', Sd.seat[0], Sd.seat[2], 0); tro3.root.position.y = Sd.seat[1];
  const merc = leader(Sd, 'mercader', 0.35, -2.05, -0.8);

  const tB = tLaz - 0.35, tC = tCoy - 0.3, tD = L[1].t0 - 0.3, tE = tAgo - 0.4, tBlack = tMato - 0.25;
  const fireT = [tAtaque - 0.2, tAtaque + 0.35, tAtaque + 0.8];
  const sfx = [{ t: 0.0, type: 'harbor', dur: tB, vol: 0.4 }, { t: 0.4, type: 'waves', dur: tB, vol: 0.25 }, { t: tB, type: 'clock', dur: tC - tB, vol: 0.2 }, { t: tAsilo - 0.1, type: 'stamp', vol: 0.45 },
    { t: tC, type: 'birds', dur: tD - tC, vol: 0.3 }, { t: tD, type: 'night', dur: tE - tD, vol: 0.3 }, ...fireT.map(x => ({ t: x, type: 'gunfire', dur: 0.5, vol: 0.4 })),
    { t: tE, type: 'clock', dur: tBlack - tE, vol: 0.3 }, { t: tRamon - 0.1, type: 'tension', vol: 0.45 }, { t: tBlack, type: 'hit', vol: 0.55 }];

  const shots = [
    { t0: 0, set: Tp, p0: [-5.2, 1.25, -9.0], l0: [-1.0, 1.6, -21], p1: [-5.0, 1.2, -10.2], l1: [-1.0, 1.6, -21], fov0: 46, act: (t) => {
      Tp.tick(t); Tp.flag.children.forEach(() => {}); const u = t;
      tro1.root.position.z = -18 + u * 0.3; natalia.root.position.z = -18.6 + u * 0.3;
      K.pose(tro1, C.walk(t, 0.4, 1)); tro1.setFace(C.blinkEye(t, 1), 'neutral'); K.pose(natalia, C.walk(t, 0.4, 2)); natalia.setFace(C.blinkEye(t, 2), 'neutral');
      return U.film(t) + U.badge(t, 'Tampico · 9 de enero de 1937', 'Trotski llega a México', 'En el petrolero noruego Ruth', tMex - 0.3, tB);
    } },
    { t0: tB, set: Of, p0: [1.2, 1.05, 1.3], l0: [0, 0.55, -1.9], p1: [1.0, 1.0, 0.9], l1: [0, 0.55, -1.9], fov0: 42, act: (t) => {
      K.pose(card, t < tAsilo - 0.3 ? A.sit(t, 2) : A.sign(t, 2)); card.setFace(C.blinkEye(t, 2), 'neutral');
      return U.film(t) + U.nameplate(ctx, [0, Of.seat[1] + 1.05, Of.seat[2]], NAMES.cardenas[0], 'Le concede el asilo', tLaz - 0.2, tC);
    } },
    { t0: tC, set: Co, p0: [2.4, 1.1, 2.6], l0: [0.4, 0.75, -4], p1: [2.0, 1.05, 1.8], l1: [0.4, 0.75, -4], fov0: 42, act: (t) => {
      Co.tick(t);
      K.pose(tro2, A.talk(t, 1)); tro2.setFace(C.blinkEye(t, 1), 'smile');
      K.pose(frida, C.wave(t, 2)); frida.setFace(C.blinkEye(t, 2), 'smile');
      K.pose(diego, A.proud(t, 3)); diego.setFace(C.blinkEye(t, 3), 'smile');
      return U.film(t) + U.badge(t, 'Coyoacán · 1937', 'La Casa Azul', 'Trotski vive con Frida y Diego', tCoy - 0.2, tD)
        + U.nameplate(ctx, [0.9, 1.25, -3.4], NAMES.frida[0], '', tFrida - 0.15, tD) + U.nameplate(ctx, [1.6, 1.45, -4.4], NAMES.diego[0], '', tDiego - 0.15, tD);
    } },
    { t0: tD, set: Hf, p0: [3.2, 1.6, 9.5], l0: [-0.5, 2.4, -2], p1: [2.8, 1.5, 8.5], l1: [-0.5, 2.5, -2], fov0: 46, act: (t) => {
      Hf.tick(t); Hf.holes.visible = t > fireT[0] + 0.1;
      fireT.forEach(x => fx(t, x, new THREE.Vector3(0, 0, -1)));
      return U.film(t) + U.badge(t, '24 de mayo de 1940', 'Sobrevive a un ataque', 'Encabezado por el muralista David Alfaro Siqueiros', tSob - 0.2, tE);
    } },
    { t0: tE, set: Sd, p0: [0.9, 0.95, 0.9], l0: [-0.2, 0.55, -1.8], p1: [0.7, 0.92, 0.5], l1: [-0.2, 0.55, -1.8], fov0: 44, act: (t) => {
      K.pose(tro3, A.sign(t, 1)); tro3.setFace(C.blinkEye(t, 1), 'neutral');
      K.pose(merc, C.idle(t, 4, 0.3)); merc.setFace(C.blinkEye(t, 4), 'flat');
      return U.film(t) + U.nameplate(ctx, [0.35, 1.2, -2.05], NAMES.mercader[0], 'Agente de Stalin', tRamon - 0.15, tBlack)
        + U.black(ss(tBlack, tBlack + 0.25, t))
        + U.big(t, tBlack + 0.2, ctx.dur + 1, '20 de agosto de 1940', { top: 380, size: 64 })
        + U.big(t, tPiolet + 0.2, ctx.dur + 1, '<span style="font-size:34px;font-weight:700;color:#d9d4c8">Trotski murió al día siguiente</span>', { top: 480, size: 34 });
    } },
  ];
  const inst = { scene: Tp, scenes: [Tp, Of, Co, Hf, Sd], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
