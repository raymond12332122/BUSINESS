import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as F from '../../lib/fx.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as A from '../anim.js';
import * as MK from '../../mx/mapkit.js';
import { leader, NAMES } from '../leaders.js';

export { preload } from '../../mx/mapkit.js';
const fade = MK.fade, GM = MK.GM;

export function build(ctx) {
  const L = ctx.L;
  const tSub = wt(L[0], 'submarinos'), tSin = wt(L[0], 'sin'), tQuin = wt(L[0], 'quince'), tLus = wt(L[0], 'lusitania'), tMur = wt(L[0], 'murieron'), tCien = wt(L[0], 'ciento', 1), tEst = wt(L[0], 'estadounidenses');
  const tEne = wt(L[1], 'enero'), tMin = wt(L[1], 'ministro'), tZim = wt(L[1], 'tsimerman'), tOfr = wt(L[1], 'ofrecio'), tAli = wt(L[1], 'alianza'), tSi = wt(L[1], 'si$'), tRec = wt(L[1], 'recuperaria'),
    tTex = wt(L[1], 'texas'), tNue = wt(L[1], 'nuevo'), tAri = wt(L[1], 'arizona');
  const tBri = wt(L[2], 'britanicos'), tDes = wt(L[2], 'descifraron'), tPub = wt(L[2], 'publico'), tVen = wt(L[2], 'venustiano'), tRech = wt(L[2], 'rechazo'), tNeu = wt(L[2], 'neutral'),
    tAbr = wt(L[2], 'abril'), tDecl = wt(L[2], 'declaro'), tAle = wt(L[2], 'alemania');

  // ---- 1-3. the Lusitania
  const Sea = S.seaStage('day', { color: '#3e6276' });
  const lus = P.liner(26); lus.position.set(0, 0.2, -46); lus.userData.dynamic = true; Sea.add(lus);
  const wake = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1), new THREE.MeshBasicMaterial({ color: '#f2f6f8', transparent: true, opacity: 0.85 })); wake.rotation.x = -Math.PI / 2; wake.userData.dynamic = true; Sea.add(wake);
  const hit = new F.Explosion(Sea, [2, 0.5, -42.8], tLus - 0.35, 2.2, 71, { smokeColor: '#6a6a66' });
  const boats = [0, 1, 2].map(i => { const b = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 0.6), new THREE.MeshStandardMaterial({ color: '#f2efe6' })); b.position.set(-6 + i * 4, 0.1, -40); b.userData.dynamic = true; Sea.add(b); return b; });
  // ---- 4. Berlin: Zimmermann writes the telegram
  const Of = S.office({ wall: '#6a5040', lower: '#3a2618', portrait: ['#3a3430', '#4a4e44'], flag: P.FLAGS.ger });
  const zim = leader(Of, 'zimmermann', Of.seat[0], Of.seat[2], 0); zim.root.position.y = Of.seat[1];
  // ---- 5. map: what Germany offered Mexico
  const M = MK.mapSet({ railways: false }); M.userData.baked = true;
  const offer = ['Texas', 'New Mexico', 'Arizona'];
  const arTx = GM.arrow([[-100.3, 25.7], [-99, 28.5], [-98.5, 31.2]], '#2f7a4a', 0.55); M.add(arTx);
  const arNm = GM.arrow([[-106.1, 28.6], [-106.5, 31.4], [-106.2, 33.6]], '#2f7a4a', 0.55); M.add(arNm);
  const arAz = GM.arrow([[-110.9, 29.1], [-111.4, 31.6], [-112.0, 33.5]], '#2f7a4a', 0.55); M.add(arAz);
  // ---- 6. Room 40, London
  const R40 = S.room40();
  const cods = [0, 1, 2, 3].map(i => { const [x, y, z] = R40.seatsAt(i); const c = K.person(R40, ['doto', 'oguri', 'suzuka', 'helios'][i], i === 3 ? 'marinoBritanico' : 'descifrador', x, z, Math.PI); c.root.position.y = y; return c; });
  // ---- 7. Mexico City: Carranza
  const Mx = S.RS.mxOffice();
  const car = leader(Mx, 'carranza', Mx.seat[0], Mx.seat[2], 0); car.root.position.y = Mx.seat[1];
  // ---- 8. Washington: Wilson asks Congress for war
  const Cp = S.capitol();
  const wil = leader(Cp, 'wilson', Cp.podium[0], Cp.podium[2], 0); wil.root.position.y = Cp.podium[1];
  const cong = K.crowd(Cp, ['diplomatico', 'diplomaticoChistera'], 14, [-5, 0.3, 5, 3.4], { seed: 41, yaw: Math.PI });
  cong.forEach((c, i) => { c.setFace('open', 'neutral'); K.freeze(c, i % 3 ? C.idle(0.3, i, 0.3) : A.clap(0.3, i)); });

  const tB = tQuin - 0.35, tC = tMur - 0.35, tD = L[1].t0 - 0.3, tE = tSi - 0.35, tF = L[2].t0 - 0.35, tG = tVen - 0.35, tH = tAbr - 0.35;
  const sfx = [{ t: 0, type: 'waves', dur: tC + 4, vol: 0.4 }, { t: 0.3, type: 'drone', dur: tB, vol: 0.2 }, { t: tSin, type: 'beep', vol: 0.3 }, { t: tLus - 0.35, type: 'bigboom', vol: 0.6 },
    { t: tLus, type: 'creak', vol: 0.4 }, { t: tC + 0.4, type: 'sting', vol: 0.4 }, { t: tD, type: 'clock', dur: tE - tD, vol: 0.22 }, { t: tOfr, type: 'typewriter', dur: 2.5, vol: 0.3 },
    { t: tE, type: 'whoosh', vol: 0.3 }, ...[tTex, tNue, tAri].map(x => ({ t: x, type: 'pop', vol: 0.4 })), { t: tF, type: 'typewriter', dur: tG - tF, vol: 0.3 }, { t: tPub, type: 'paper', vol: 0.45 },
    { t: tRech, type: 'stamp', vol: 0.5 }, { t: tH, type: 'crowd', dur: ctx.dur - tH, vol: 0.3 }, { t: tDecl, type: 'gavel', vol: 0.5 }, { t: tAle + 0.3, type: 'cheer', vol: 0.3 }];

  const shots = [
    { t0: 0, set: Sea, p0: [0, 1.2, 6], l0: [0, 1.4, -46], p1: [1.2, 1.2, 6], l1: [0.5, 1.4, -46], fov0: 22, act: (t) => {
      Sea.tick(t); hit.update(-1); lus.position.x = -8 + t * 1.2;
      const u = clamp((t - 1.5) / (tB - 1.5)); wake.visible = t > 1.5; wake.scale.y = 1 + u * 40; wake.position.set(0.6, 0.06, 4 - u * 20);
      return U.film(t) + U.scope(1) + U.pin(ctx, [lus.position.x, 7, -46], 'Lusitania', 'transatlántico británico', ss(tSin - 0.2, tSin + 0.2, t));
    } },
    { t0: tB, set: Sea, p0: [18, 3, -18], l0: [0, 2.5, -45], p1: [16, 2.8, -20], l1: [0, 2.5, -45], fov0: 40, act: (t) => {
      Sea.tick(t); wake.visible = false; hit.update(t); lus.position.x = -8 + tB * 1.2;
      return U.film(t) + U.badge(t, '7 de mayo de 1915 · frente a Irlanda', 'Hunden el Lusitania', 'un submarino alemán lo torpedea sin aviso', tQuin - 0.2, tC);
    } },
    { t0: tC, set: Sea, p0: [22, 4, -14], l0: [0, 1.0, -45], p1: [20, 3.5, -16], l1: [0, 0.6, -45], fov0: 40, act: (t) => {
      Sea.tick(t); hit.update(t); const u = clamp((t - tC) / (tD - tC));
      lus.position.y = 0.2 - u * 3.0; lus.rotation.set(0.12 * u, 0, -0.16 * u);
      boats.forEach((b, i) => { b.position.set(-4 + i * 3.6 + u * (i - 1), 0.1 + 0.05 * Math.sin(t * 2 + i), -39 + u * 3); });
      return U.film(t) + U.counter(t, tMur - 0.2, tD + 0.3, 1230, 130, 1198, 'muertos', { from: 0, dur: 1.2, color: '#ff8a6a', w: 520 })
        + U.counter(t, tCien - 0.2, tD + 0.3, 1230, 330, 128, 'eran estadounidenses', { from: 0, dur: 1.0, color: '#ffcf6a', w: 520 });
    } },
    { t0: tD, set: Of, p0: [0.95, 1.0, 1.05], l0: [0, 0.62, -1.7], p1: [0.75, 0.95, 0.75], l1: [0, 0.62, -1.7], fov0: 40, act: (t) => {
      K.pose(zim, A.write(t, 1)); zim.setFace(C.blinkEye(t, 1), 'neutral'); Of.flag.wave(t);
      return U.film(t) + U.datePage(t, tEne - 0.3, tMin, '', 'ENERO', '16', '1917', { x: 1560, y: 120 })
        + U.nameplate(ctx, [0, 1.22, -1.75], NAMES.zimmermann[0], NAMES.zimmermann[1], tZim - 0.3, tE)
        + U.telegram(t, tAli - 0.4, tE + 0.2, 1e9, '', { x: 1200, y: 130, w: 640 });
    } },
    { t0: tE, set: M, p0: [-104.5 + 102, 13, 11], l0: [-104.5 + 102, 0, -2.5], fov0: 40, act: (t) => {
      const [cx, , cz] = GM.pos(-105.6, 30.2); ctx.camera.position.set(cx, 13.5, cz + 11.0); ctx.camera.lookAt(cx, 0, cz - 0.6);
      GM.paint(M.map, [{ t: -1, names: offer, color: GM.FACTION.usa || '#b8c8d8' }, { t: tTex - 0.1, names: ['Texas'], color: '#3f8a5a' }, { t: tNue - 0.1, names: ['New Mexico'], color: '#3f8a5a' }, { t: tAri - 0.1, names: ['Arizona'], color: '#3f8a5a' }], t);
      arTx.set(ss(tTex - 0.2, tTex + 0.5, t)); arNm.set(ss(tNue - 0.2, tNue + 0.5, t)); arAz.set(ss(tAri - 0.2, tAri + 0.5, t));
      return U.film(t) + MK.stateLabel(ctx, -99.5, 31.5, 'TEXAS', fade(t, tTex - 0.2, ctx.dur + 1)) + MK.stateLabel(ctx, -106, 34.4, 'NUEVO MÉXICO', fade(t, tNue - 0.2, ctx.dur + 1))
        + MK.stateLabel(ctx, -111.7, 34.2, 'ARIZONA', fade(t, tAri - 0.2, ctx.dur + 1)) + MK.stateLabel(ctx, -102.5, 24.5, 'MÉXICO', fade(t, tE, ctx.dur + 1))
        + U.card(t, tSi - 0.2, tF + 0.3, 'La oferta secreta de Alemania', 'Si EE. UU. entraba en la guerra…', 'México «recuperaría» lo perdido en 1848', { left: 1220, top: 90, width: 620, accent: '#3f8a5a' });
    } },
    { t0: tF, set: R40, p0: [0, 1.6, 2.4], l0: [0, 0.7, -1.2], p1: [0.3, 1.5, 2.0], l1: [0, 0.7, -1.2], fov0: 46, act: (t) => {
      cods.forEach((c, i) => { K.pose(c, A.write(t, i)); c.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.badge(t, 'Sala 40 · Londres', 'Descifradores británicos', 'interceptan y descifran el telegrama', tBri - 0.2, tPub - 0.3)
        + U.telegram(t, tDes - 0.6, tPub - 0.1, tDes + 0.3, '«…haremos la guerra juntos… México reconquistará el territorio perdido de Texas, Nuevo México y Arizona…»', { x: 1200, y: 130, w: 640 })
        + U.newspaper(t, tPub - 0.1, tG + 0.2, { mast: 'THE DAILY NEWS', date: '1 de marzo de 1917', head: 'GERMANY SEEKS AN ALLIANCE WITH MEXICO', sub: 'Alemania busca una alianza con México', x: 60 });
    } },
    { t0: tG, set: Mx, p0: [0.9, 1.0, 0.6], l0: [0, 0.62, -1.9], p1: [0.7, 0.95, 0.35], l1: [0, 0.62, -1.9], fov0: 40, act: (t) => {
      Mx.flag && Mx.flag.wave && Mx.flag.wave(t);
      const sh = t > tRech ? 22 * Math.sin((t - tRech) * 9) * (1 - clamp((t - tRech) / 1.2)) : 0; K.pose(car, { ...A.seated(t, 1), head: [4, sh, 0] }); car.setFace(C.blinkEye(t, 1), 'neutral');
      return U.film(t) + U.nameplate(ctx, [0, 1.25, -2.0], NAMES.carranza[0], NAMES.carranza[1], tVen - 0.2, tH)
        + U.stamp(t, 'RECHAZADA', tRech, tH + 0.2, { x: 1350, y: 480, rot: -8 }) + U.big(t, tNeu - 0.3, tH + 0.2, 'México se mantiene neutral', { top: 110, size: 56 });
    } },
    { t0: tH, set: Cp, p0: [1.8, 2.5, 3.6], l0: [0, 1.45, -3.2], p1: [1.3, 2.3, 2.6], l1: [0, 1.5, -3.2], fov0: 42, act: (t) => {
      K.pose(wil, A.orate(t, 1, 0.6)); wil.setFace(C.blinkEye(t, 1), C.talkMouth(t, 1));
      return U.film(t) + U.datePage(t, tAbr - 0.2, ctx.dur + 1, 'Estados Unidos entra en la guerra', 'ABRIL', '6', '1917', { x: 1560, y: 110, accent: '#2a4a7a' })
        + U.nameplate(ctx, [0, 2.35, -3.2], NAMES.wilson[0], NAMES.wilson[1], tH + 0.2, tDecl);
    } },
  ];
  const inst = { scene: Sea, scenes: [Sea, Of, M, R40, Mx, Cp], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
