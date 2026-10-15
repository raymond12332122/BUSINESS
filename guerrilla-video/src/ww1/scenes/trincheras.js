import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as A from '../anim.js';

export async function preload() {}
const fz = (arr, poseFn, keep = () => false, face = 'neutral') => arr.forEach((c, i) => { if (keep(i)) return; c.setFace('open', face); K.freeze(c, poseFn(i)); });

export function build(ctx) {
  const L = ctx.L;
  const tLodo = wt(L[0], 'lodo'), tRat = wt(L[0], 'ratas'), tPio = wt(L[0], 'piojos'), tFrio = wt(L[0], 'frio'), tEntre = wt(L[0], 'entre'), tTie = wt(L[0], 'tierra'),
    tAla = wt(L[0], 'alambre'), tCra = wt(L[0], 'crateres'), tCad = wt(L[0], 'cadaveres');
  const tAtc = wt(L[1], 'atacar'), tCampo = wt(L[1], 'campo'), tAmet = wt(L[1], 'ametralladoras'), tCien = wt(L[1], 'cientos');
  const tNav = wt(L[2], 'navidad'), tTram = wt(L[2], 'tramos'), tBri = wt(L[2], 'britanicos'), tCant = wt(L[2], 'cantar'), tReg = wt(L[2], 'regalos'), tTreg = wt(L[2], 'tregua');

  // ---- 1-3. a muddy British trench, no man's land, going over the top
  const T1 = S.trenchWF('mud', { seed: 721 }); const Y = T1.Y;
  const sit = [['oguri', -2.2], ['helios', -0.8], ['doto', 0.8]].map(([w, x], i) => { const c = K.person(T1, w, 'tommy', x, -0.62, 0); c.root.position.y = 0.46; return c; });
  const stand = K.person(T1, 'suzuka', 'tommy', -3.6, 0.2, 0.5);
  const off = K.person(T1, 'mcqueen', 'oficialBritanico', 5.0, -0.3, Math.PI);
  const climb = [['tamamo', 5.5], ['daiwa', 6.4], ['cafe', 4.4], ['oguri', 3.4]].map(([w, x]) => K.person(T1, w, 'tommy', x, -0.55, Math.PI));
  const helm = K.brodie(); helm.scale.setScalar(0.85); helm.position.set(-1.5, Y + 0.02, -13); helm.rotation.set(0.3, 0.6, 0.2); T1.add(helm);
  // German machine gun on the far parapet
  const mg = P.RP.maxim(); mg.position.set(0.4, Y + 0.25, -32.4); mg.rotation.y = Math.PI; mg.userData.dynamic = true; T1.add(mg);
  const gunner = K.person(T1, 'cafe', 'aleman', 0.4, -33.1, 0); gunner.root.position.y = Y - 0.2;
  const mgFlash = new THREE.PointLight('#ffd27a', 0, 8, 1.5); mgFlash.position.set(0.4, Y + 0.55, -33.6); T1.add(mgFlash);
  const mgSpr = new THREE.Sprite(new THREE.SpriteMaterial({ color: '#ffd890', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); mgSpr.position.set(0.4, Y + 0.5, -33.8); mgSpr.scale.setScalar(0.5); T1.add(mgSpr);
  // ---- 4. Christmas Eve 1914: candles on the German parapet
  const T2 = S.trenchWF('night', { frost: true, xmas: true, seed: 731 }); S.stars(T2, 500);
  const singers = [-1.4, -0.3, 0.8, 1.9].map((x, i) => { const c = K.person(T2, ['cafe', 'helios', 'suzuka', 'tamamo'][i], 'aleman', x, -32.4, 0); c.root.position.y = T2.Y + 0.05; return c; });
  const moon = new THREE.PointLight('#c8d4ff', 30, 80, 1.2); moon.position.set(4, 14, -24); T2.add(moon);
  // ---- 5-6. Christmas Day: the truce in no man's land
  const T3 = S.trenchWF('frost', { frost: true, xmas: true, seed: 741 });
  const brits = [['oguri', -1.2, -14.4], ['doto', 0.6, -14.0], ['helios', 2.4, -14.6], ['mcqueen', -3.0, -15.6]].map(([w, x, z]) => K.person(T3, w, 'tommyCap', x, z, Math.PI));
  const germs = [['cafe', -1.0, -16.0], ['suzuka', 0.8, -15.6], ['tamamo', 2.6, -16.2], ['daiwa', -2.8, -17.0]].map(([w, x, z]) => K.person(T3, w, 'aleman14', x, z, 0));
  [...brits, ...germs].forEach(c => { c.root.position.y = T3.Y; });
  const gifts = [K.giftBox('#b8342f'), K.giftBox('#2f5a8a')]; gifts[0].scale.setScalar(1.6); gifts[1].scale.setScalar(1.6);
  brits[1].attach('wriR', gifts[0], [-0.3, 0.44, 0.05]); germs[1].attach('wriR', gifts[1], [-0.3, 0.44, 0.05]);
  const ball = P.football(); ball.scale.setScalar(1.3); ball.userData.dynamic = true; T3.add(ball);
  const crowdT = [...K.crowd(T3, 'tommyCap', 6, [-9, -16.5, -4.5, -13.5], { seed: 31, yaw: Math.PI / 2 }), ...K.crowd(T3, 'aleman14', 6, [4.5, -17.5, 9, -14.5], { seed: 32, yaw: -Math.PI / 2 })];
  crowdT.forEach(c => { c.root.position.y = T3.Y; });
  fz(crowdT, i => i % 3 ? C.idle(0.5, i, 0.4) : C.wave(0.4 + i, i), () => false, 'smile');

  const tB = tEntre - 0.35, tC = L[1].t0 - 0.35, tD = tAmet - 0.25, tE = L[2].t0 - 0.35, tF = tBri - 0.35, tG = tTreg - 0.6;
  const mgOn = t => t > tD + 0.2 && t < tE; const mgK = t => mgOn(t) ? (Math.sin(t * 60) > 0 ? 1 : 0.2) : 0;
  const sfx = [{ t: 0, type: 'wind', dur: tC, vol: 0.25 }, { t: 0.1, type: 'drone', dur: tC, vol: 0.15 }, ...[tLodo, tRat, tPio, tFrio].map(x => ({ t: x - 0.05, type: 'tick', vol: 0.3 })),
    { t: tB + 0.5, type: 'boom', vol: 0.2 }, { t: tC + 0.1, type: 'whistle', vol: 0.55 }, { t: tC + 0.5, type: 'charge', vol: 0.45 }, { t: tD + 0.2, type: 'mg', dur: tE - tD - 0.2, vol: 0.55 },
    { t: tE, type: 'night', dur: tF - tE, vol: 0.3 }, { t: tE + 0.3, type: 'choir', dur: tF - tE + 2, vol: 0.32 }, { t: tF, type: 'birds', dur: ctx.dur - tF, vol: 0.15 },
    { t: tF + 0.2, type: 'laugh', vol: 0.25 }, { t: tReg + 0.8, type: 'cheer', vol: 0.3 }, { t: tTreg - 0.3, type: 'bells', dur: ctx.dur - tTreg + 0.3, vol: 0.25 }];

  const ratRun = (t) => T1.rats.forEach((r, i) => { const u = ((t * 0.55 + i * 0.5) % 1); r.position.set(-4 + u * 9 + i, 0.08, 0.3 - i * 0.35); r.rotation.y = 0; });
  const shots = [
    { t0: 0, set: T1, p0: [3.4, 0.95, 0.55], l0: [-1.0, 0.6, -0.4], p1: [3.0, 0.9, 0.55], l1: [-1.2, 0.6, -0.4], fov0: 44, act: (t) => {
      T1.tick(t); ratRun(t);
      sit.forEach((c, i) => { K.pose(c, i === 1 ? A.seated(t, i, A.scratch(t, i)) : A.seated(t, i)); c.setFace(C.blinkEye(t, i), i === 1 ? 'frown' : 'neutral'); });
      K.pose(stand, { ...A.cold(t, 3), gun: 'none' }); stand.setFace(C.blinkEye(t, 3), 'frown');
      return U.film(t) + U.tiles(t, tLodo - 0.3, tB + 0.2, [['🟫', 'lodo', tLodo - 0.1], ['🐀', 'ratas', tRat - 0.1], ['🦟', 'piojos', tPio - 0.1], ['❄️', 'frío', tFrio - 0.1]], { top: 60, w: 210 });
    } },
    { t0: tB, set: T1, p0: [0.2, Y + 0.45, -1.4], l0: [0, Y + 0.2, -22], p1: [0.2, Y + 0.6, -1.6], l1: [0, Y + 0.1, -22], fov0: 46, act: (t) => {
      T1.tick(t); mgFlash.intensity = 0; mgSpr.visible = false;
      return U.film(t) + U.big(t, tTie - 0.3, tC + 0.2, 'Tierra de nadie', { top: 110, size: 64 })
        + U.pin(ctx, [-2.2, Y + 0.75, -7.3], 'alambre de púas', '', ss(tAla - 0.2, tAla + 0.2, t) * (1 - ss(tC - 0.4, tC, t))) + U.pin(ctx, [3.0, Y + 0.4, -12], 'cráteres', '', ss(tCra - 0.2, tCra + 0.2, t) * (1 - ss(tC - 0.4, tC, t)));
    } },
    { t0: tC, set: T1, p0: [9.0, 0.8, 0.55], l0: [4.6, 1.25, -0.9], p1: [8.6, 0.85, 0.55], l1: [4.4, 1.35, -1.0], fov0: 50, act: (t) => {
      T1.tick(t); const u = t - tC;
      K.pose(off, A.whistle(t, 1)); off.setFace('open', 'open');
      climb.forEach((c, i) => { const s = clamp((u - 0.4 - i * 0.3) / 0.9); c.root.position.set([5.5, 6.4, 4.4, 3.4][i], s * (Y - 0.05), -0.55 - s * 1.0 - Math.max(0, u - 1.3 - i * 0.3) * 1.2);
        K.pose(c, A.overTop(t, s, i)); c.setFace(C.blinkEye(t, i), 'open'); });
      return U.film(t);
    } },
    { t0: tD, set: T1, p0: [1.9, Y + 0.55, -31.4], l0: [0.3, Y + 0.42, -33.0], p1: [1.75, Y + 0.53, -31.6], l1: [0.3, Y + 0.42, -33.0], fov0: 46, shake: t => mgOn(t) ? 0.01 : 0, act: (t) => {
      T1.tick(t); const k = mgK(t); mgFlash.intensity = 25 * k; mgSpr.visible = k > 0.5; mgSpr.scale.setScalar(0.35 + 0.25 * Math.random());
      K.pose(gunner, { ...C.crouch(t, 1, 0.6), armL: [-70, -10, -50], armR: [-70, 10, 50], elbL: [0, -30, 0], elbR: [0, 30, 0], gun: 'none' }); gunner.setFace('open', 'frown');
      return U.film(t) + U.counter(t, tCien - 0.3, tE, 1240, 140, 500, 'disparos por minuto (ametralladora MG 08)', { from: 0, dur: 1.0, color: '#ff8a6a', prefix: '≈ ', w: 560 });
    } },
    { t0: tE, set: T2, p0: [0.6, T2.Y + 0.5, -27.5], l0: [0.3, T2.Y + 0.9, -33], p1: [0.5, T2.Y + 0.55, -28.3], l1: [0.3, T2.Y + 0.9, -33], fov0: 44, act: (t) => {
      T2.tick(t); mgFlash.intensity = 0;
      T2.tree.candles.forEach((c, i) => c.scale.setScalar(0.8 + 0.3 * Math.sin(t * 13 + i * 2)));
      singers.forEach((c, i) => { K.pose(c, { ...C.idle(t, i, 0.4), head: [-6, 0, 3 * Math.sin(t * 2 + i)] }); c.setFace('closed', 'open'); });
      return U.film(t) + U.badge(t, 'Nochebuena de 1914', '«Stille Nacht»', 'Villancicos desde las trincheras alemanas', tNav - 0.3, tF);
    } },
    { t0: tF, set: T3, p0: [6.0, T3.Y + 1.6, -9.5], l0: [0, T3.Y + 0.6, -15.3], p1: [5.2, T3.Y + 1.4, -10.2], l1: [0, T3.Y + 0.6, -15.3], fov0: 42, act: (t) => {
      T3.tick(t);
      brits.forEach((c, i) => { K.pose(c, i === 0 ? A.shake(t, i) : i === 1 ? A.hold(t, i) : C.wave(t, i)); c.setFace(C.blinkEye(t, i), 'smile'); });
      germs.forEach((c, i) => { K.pose(c, i === 0 ? A.shake(t, i + 4) : i === 1 ? A.hold(t, i + 4) : i === 3 ? A.kick(t, tReg + 0.6, i) : C.wave(t, i + 4)); c.setFace(C.blinkEye(t, i + 4), 'smile'); });
      const kb = clamp((t - tReg - 0.6) / 1.4); ball.position.set(-2.4 + kb * 3.4, T3.Y + 0.09 + Math.sin(Math.PI * kb) * 0.9, -16.7 + kb * 1.8);
      return U.film(t);
    } },
    { t0: tG, set: T3, p0: [0, T3.Y + 2.6, -5.5], l0: [0, T3.Y + 0.6, -16], p1: [0, T3.Y + 2.2, -7.0], l1: [0, T3.Y + 0.6, -16], fov0: 46, act: (t) => {
      T3.tick(t);
      brits.forEach((c, i) => { K.pose(c, C.wave(t, i)); c.setFace(C.blinkEye(t, i), 'smile'); }); germs.forEach((c, i) => { K.pose(c, C.wave(t, i + 4)); c.setFace(C.blinkEye(t, i + 4), 'smile'); });
      ball.position.set(1.0, T3.Y + 0.09, -14.9);
      return U.film(t) + U.titleCard(t, tTreg - 0.3, ctx.dur + 1, 'Navidad de 1914', 'LA TREGUA DE NAVIDAD', 'Británicos y alemanes, juntos por un día', 110);
    } },
  ];
  const inst = { scene: T1, scenes: [T1, T2, T3], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
