import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as LP from '../../lib/props.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as A from '../anim.js';
import * as AM from '../amap.js';
import * as P from '../props.js';
import * as N from '../../napo/kit.js';
import { horse, animateHorse, ridePose } from '../../napo/horse.js';

export { preload } from '../amap.js';
const fade = AM.fade;
const CARD = (t, who, a, b, o = {}) => U.cast(t, a, b, ...K.CARD[who], o);
// Seat a rider on a (possibly scaled) horse; drop = rider's feet-to-hip height in the riding pose.
function seatOn(rider, H, drop) {
  H.updateMatrixWorld(true); const p = new THREE.Vector3(), q = new THREE.Quaternion(); H.seat.getWorldPosition(p); H.seat.getWorldQuaternion(q);
  p.add(new THREE.Vector3(0, -drop, 0).applyQuaternion(q)); const par = rider.root.parent; par.updateMatrixWorld(true);
  p.applyMatrix4(new THREE.Matrix4().copy(par.matrixWorld).invert()); rider.root.position.copy(p); rider.root.quaternion.copy(q);
}

export function build(ctx) {
  const L = ctx.L;
  const tBra = wt(L[0], 'brasil'), tHuy = wt(L[0], 'huyendo'), tCor = wt(L[0], 'corte'), tRio = wt(L[0], 'rio'), tCap = wt(L[0], 'capital'), tImp = wt(L[0], 'imperio');
  const tRey = wt(L[1], 'rey'), tLis = wt(L[1], 'lisboa'), tPed = wt(L[1], 'pedro'), tPor = wt(L[1], 'portugal'), tOrd = wt(L[1], 'ordeno'), tQue = wt(L[1], 'quedarse');
  const tSie = wt(L[2], 'siete'), tIpi = wt(L[2], 'ipiranga'), tGri = wt(L[2], 'grito'), tInd = wt(L[2], 'independencia'), tMue = wt(L[2], 'muerte'), tCon = wt(L[2], 'convirtio');
  const tB = tCor - 0.3, tC = L[1].t0 - 0.3, tD = tPor - 0.3, tE = L[2].t0 - 0.3, tF = tCon - 0.3;

  // ---- map: the court crosses the Atlantic
  const Mp = AM.americasMap({ period: 1810 });
  const [bx, , bz] = AM.apos(-48, -12);
  const voyage = AM.arrow(Mp, [[-22, 20], [-30, 5], [-35, -8], [-38.5, -12.97], [-41, -20], [-43.17, -22.91]], '#2f7a3a', 1.2);
  const pRio = AM.pulse(Mp, -43.17, -22.91, '#2f7a3a', 2.0);
  // ---- Rio de Janeiro harbour
  const Rj = S.harbor({ light: 'day', sugarloaf: true, ships: 2, flag: 'gb' });
  const joao = K.role(Rj, 'joao', -0.6, -10.6, 0); joao.root.position.y = 0.73;
  const court = [['mcqueen', 'dama', -1.6], ['helios', 'criollo', 0.5], ['spe', 'dama', 1.4], ['hishi', 'portugues', -2.6], ['oguri', 'portugues', 2.4]].map(([w, o, x]) => { const c = K.person(Rj, w, o, x, -10.4, 0); c.root.position.y = 0.73; return c; });
  const ped = K.role(Rj, 'pedro', 1.0, -9.6, -0.2); ped.root.position.y = 0.73;
  // ---- Ipiranga, 7 Sep 1822
  const Ip = S.brook('golden');
  const H = horse({ coat: '#5a3a26', mane: '#1d1612', cloth: '#2f7a3a', trim: '#d4af37', seed: 3 }); H.scale.setScalar(1.75); H.position.set(0.4, 0, -0.4); H.rotation.y = -1.25; H.userData.dynamic = true; Ip.add(H);
  const ped2 = K.role(Ip, 'pedro', 0, 0, 0); K.hold(ped2, N.sabre(), 'R', [0, -0.01, 0.02], [0, 0, 0], 1.0);
  const guard = K.crowd(Ip, 'brasileno', 9, [-4.8, -4.0, 4.8, -1.8], { seed: 121, yaw: 0.2 });
  // ---- the Empire of Brazil
  const Co = S.cathedral('brasil');
  const ped3 = K.role(Co, 'pedro', 0, -5.3, 0); ped3.root.position.y = 0.36;
  const guests = K.crowd(Co, ['brasileno', 'dama', 'criollo', 'brasileno'], 10, [-4, -3.8, 4, -1.2], { seed: 122, yaw: Math.PI });

  const sfx = [{ t: 0.2, type: 'whoosh', vol: 0.3 }, { t: tHuy, type: 'waves', dur: tB - tHuy, vol: 0.3 }, { t: tB, type: 'harbor', dur: tE - tB, vol: 0.3 }, { t: tB + 0.2, type: 'fanfare', vol: 0.3 },
    { t: tCap, type: 'bell', vol: 0.3 }, { t: tLis, type: 'horn', vol: 0.3 }, { t: tQue, type: 'sting2', vol: 0.35 }, { t: tE, type: 'hooves', dur: tGri - tE, vol: 0.35 }, { t: tGri, type: 'shout', vol: 0.45 },
    { t: tInd, type: 'crowd', dur: 3, vol: 0.4 }, { t: tF, type: 'organ', dur: ctx.dur - tF, vol: 0.3 }];

  const shots = [
    { t0: 0, set: Mp, p0: [bx - 6, 150, bz + 30], l0: [bx - 6, 0, bz - 18], p1: [bx - 8, 136, bz + 26], l1: [bx - 8, 0, bz - 14], fov0: 40, act: (t) => {
      Mp.paint(1810); Mp.zoom(1.6); voyage.set(ss(tHuy - 0.2, tCor + 0.8, t)); pRio.update(t, tCor + 0.6);
      return U.film(t) + U.badge(t, '1807-1808', 'La corte portuguesa huye de Napoleón', 'Más de 10.000 personas cruzan el Atlántico', tHuy - 0.3, tB + 0.1);
    } },
    { t0: tB, set: Rj, p0: [4.4, 2.2, -4.6], l0: [-0.4, 1.3, -11.0], p1: [3.8, 2.1, -5.2], l1: [-0.4, 1.3, -11.0], fov0: 44, act: (t) => {
      Rj.sea.wave(t); ped.root.visible = false; K.pose(joao, C.wave(t, 1)); joao.setFace(C.blinkEye(t, 1), 'smile'); court.forEach((c, i) => K.pose(c, C.idle(t, i)));
      return U.film(t) + U.card(t, tRio - 0.2, tC + 0.2, '1808–1821', 'Río de Janeiro', 'Capital de un imperio europeo… en América', { left: 90, top: 110, width: 560, accent: '#2f7a3a' });
    } },
    { t0: tC, set: Rj, p0: [2.6, 1.9, -6.0], l0: [0.4, 1.4, -10.0], p1: [2.2, 1.85, -6.6], l1: [0.4, 1.4, -10.0], fov0: 42, act: (t) => {
      Rj.sea.wave(t); ped.root.visible = true; const go = ss(tRey, tLis + 0.5, t); joao.root.position.z = -10.6 - 3.2 * go; joao.root.rotation.y = Math.PI * go;
      K.pose(joao, go > 0.1 && go < 0.95 ? C.walk(t, 0.4, 1) : C.wave(t, 1)); court.forEach((c, i) => { c.root.position.z = -10.4 - 3.2 * go * (i % 2); K.pose(c, C.idle(t, i)); });
      K.pose(ped, t > tQue - 0.4 ? A.fist(t, 2) : A.proud(t, 2)); ped.setFace(C.blinkEye(t, 2), t > tQue - 0.4 ? 'shout' : 'neutral');
      return U.film(t) + CARD(t, 'pedro', tPed - 0.4, tE + 0.2, { side: 'l' })
        + U.bubble(ctx, [1.0, 2.45, -9.6], '¡Me quedo! ¡El destino no existe!', fade(t, tQue - 0.5, tE), { size: 24 })
        + U.source(t, tQue - 0.2, tE + 0.2, '«Dia do Fico»: 9 de enero de 1822');
    } },
    { t0: tE, set: Ip, p0: [1.0, 1.9, 5.4], l0: [0.2, 1.7, -0.4], p1: [0.8, 1.85, 4.6], l1: [0.2, 1.75, -0.4], fov0: 44, act: (t) => {
      const up = ss(tGri - 0.4, tGri + 0.2, t); animateHorse(H, t, 'stand', { seed: 3, rear: 0.6 * up * (1 - ss(tMue + 0.6, tMue + 1.4, t)) });
      const p = ridePose(t, 3); const s2 = A.swordUp(t, 3, up); p.armR = s2.armR; p.elbR = s2.elbR; p.head = [-6 * up, 0, 0]; K.pose(ped2, p); seatOn(ped2, H, 0.86); ped2.setFace(C.blinkEye(t, 3), up > 0.5 ? 'shout' : 'neutral');
      guard.forEach((c, i) => K.pose(c, t > tGri ? (i % 2 ? A.swordUp(t, i, 1) : C.cheer(t, i)) : C.idle(t, i)));
      return U.film(t) + U.datePage(t, tE + 0.2, tGri - 0.2, 'Arroyo Ipiranga, São Paulo', 'SEPT.', '7', '1822', { x: 1640, y: 90, accent: '#2f7a3a', w: 250 })
        + U.shout(t, '¡Independencia o muerte!', tInd - 0.2, tF + 0.2, 110) + U.source(t, tGri, tF + 0.2, 'La frase viene de relatos escritos años después');
    } },
    { t0: tF, set: Co, p0: [0, 1.7, 0.4], l0: [0, 1.5, -6.0], p1: [0, 1.65, -0.8], l1: [0, 1.5, -6.0], fov0: 42, act: (t) => {
      K.pose(ped3, A.proud(t, 1)); ped3.setFace(C.blinkEye(t, 1), 'smile'); guests.forEach((c, i) => K.pose(c, A.clap(t, i)));
      return U.film(t) + U.indep(t, tF + 0.1, ctx.dur + 1, 'Brasil', '7 de septiembre de 1822', 'Imperio del Brasil · Pedro I, coronado el 1 de diciembre', ['#2f7a3a', '#f2c40c', '#2f7a3a'], { x: 1500, y: 140 });
    } },
  ];
  const inst = { scene: Mp, scenes: [Mp, Rj, Ip, Co], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
