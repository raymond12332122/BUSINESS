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
import { leader, NAMES } from '../leaders.js';

export async function preload() {}
const fz = (arr, poseFn, keep = () => false, face = 'neutral') => arr.forEach((c, i) => { if (keep(i)) return; c.setFace('open', face); K.freeze(c, poseFn(i)); });

export function build(ctx) {
  const L = ctx.L;
  const tArch = wt(L[0], 'archiduque'), tHer = wt(L[0], 'heredero'), tVis = wt(L[0], 'visito'), tCap = wt(L[0], 'capital'), tSof = wt(L[0], 'sofia');
  const tAt = wt(L[1], 'atentado'), tBomba = wt(L[1], 'bomba'), tFallo = wt(L[1], 'fallo'), tTarde = wt(L[1], 'tarde'), tChof = wt(L[1], 'chofer'), tCalle = wt(L[1], 'calle'),
    tFreno = wt(L[1], 'freno'), tGav = wt(L[1], 'gavrilo'), tJov = wt(L[1], 'joven');
  const tDisp = wt(L[2], 'disparo'), tDos = wt(L[2], 'dos'), tVec = wt(L[2], 'veces'), tMur = wt(L[2], 'murieron');

  const Sa = S.sarajevo('summer');
  // the motorcade: the archduke's car (third) and the car behind it
  const car = P.tourer(); car.userData.dynamic = true; Sa.add(car);
  const car2 = P.tourer('#2a2a30', { flags: false }); car2.userData.dynamic = true; Sa.add(car2);
  const seatY = 0.76;
  const ff = leader(car, 'franciscoFernando', -0.75, -0.2, Math.PI / 2); ff.root.position.y = seatY;
  const so = leader(car, 'sofia', -0.75, 0.24, Math.PI / 2); so.root.position.y = seatY;
  const dr = leader(car, 'chofer', 0.55, -0.22, Math.PI / 2); dr.root.position.y = seatY;
  const off2 = [K.person(car2, 'helios', 'oficialBritanico', -0.75, 0, Math.PI / 2), K.person(car2, 'tamamo', 'chofer', 0.55, -0.22, Math.PI / 2)];
  off2.forEach(c => { c.root.position.y = seatY; });
  [ff, so, dr, ...off2].forEach(c => c.root.scale.setScalar(0.92));
  // crowds on both sides of the quay
  const crowdA = [...K.crowd(Sa, ['sarajevoHombre', 'sarajevoMujer'], 26, [-30, 6.5, -2.6, 7.7], { seed: 13, yaw: Math.PI }), ...K.crowd(Sa, ['sarajevoMujer', 'sarajevoHombre'], 14, [1.3, 6.5, 16, 7.7], { seed: 15, yaw: Math.PI })];
  const crowdB = K.crowd(Sa, ['sarajevoHombre', 'sarajevoMujer'], 22, [-30, -2.4, 14, -1.9], { seed: 14, yaw: 0, jitter: 0.2 });
  fz(crowdA, i => i % 3 ? C.idle(0.4, i, 0.4) : C.wave(0.3 + i, i), i => i % 6 === 0);
  fz(crowdB, i => i % 2 ? C.idle(0.4, i, 0.4) : C.wave(0.6 + i, i), i => i % 5 === 0);
  // the bomb thrower on the river side and the bomb
  const cab = leader(Sa, 'cabrinovic', -6.0, -1.7, 0.2);
  const bomb = K.bombGrenade(); bomb.scale.setScalar(1.6); bomb.visible = false; bomb.userData.dynamic = true; Sa.add(bomb);
  const boom = new F.Explosion(Sa, [-11.8, 0.1, 1.9], tFallo - 0.05, 0.9, 41, { smokeColor: '#8a8680', dull: true });
  // Princip on the corner
  const CAR = [0.9, 4.4, -0.9];
  const pr = leader(Sa, 'princip', -0.4, 6.4, Math.atan2(CAR[0] + 0.4, CAR[1] - 6.4));
  const pistol = K.pistol(); pr.attach('wriR', pistol, [-0.31, 0.47, -0.02], [0, -90, 0]);
  const flash = new THREE.PointLight('#ffd27a', 0, 6, 1.6); Sa.add(flash);
  // the wrong turn: a dashed arrow on the street
  const path = new THREE.CatmullRomCurve3([[-12, 0.06, 1.9], [-2, 0.06, 1.9], [2.2, 0.06, 2.6], [3.4, 0.06, 6.0], [3.5, 0.06, 10]].map(v => new THREE.Vector3(...v)));
  const pathPts = path.getSpacedPoints(80);
  const arrowG = new THREE.Group(); Sa.add(arrowG); arrowG.userData.dynamic = true; arrowG.visible = false;
  pathPts.forEach((p, i) => { if (i % 2) return; const d = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.02, 0.12), new THREE.MeshBasicMaterial({ color: '#e8432f' })); d.position.copy(p); const nx = pathPts[Math.min(i + 1, 80)]; d.lookAt(nx.x, p.y, nx.z); d.rotateY(Math.PI / 2); d.renderOrder = 3; arrowG.add(d); });
  const carOnPath = u => { const p = path.getPointAt(clamp(u)), q = path.getTangentAt(clamp(u)); car.position.set(p.x, 0, p.z); car.rotation.y = Math.atan2(-q.z, q.x); };

  const tB = tVis - 0.35, tC = tSof - 0.6, tD = L[1].t0 - 0.3, tE = tTarde - 0.35, tF = tFreno + 0.15, tG = L[2].t0 - 0.3, tH = tMur - 0.4;
  const shotsT = [tDos + 0.02, tVec + 0.02];
  const sfx = [{ t: 0.0, type: 'crowd', dur: tD + 2.5, vol: 0.35 }, { t: 0.0, type: 'engine', dur: tB, vol: 0.25 }, { t: tB, type: 'birds', dur: tC - tB, vol: 0.2 },
    { t: tAt, type: 'tension', vol: 0.3 }, { t: tFallo - 0.05, type: 'bigboom', vol: 0.55 }, { t: tFallo + 0.1, type: 'crowd', dur: 2.5, vol: 0.35 },
    { t: tE, type: 'engine', dur: tF - tE + 0.4, vol: 0.28 }, { t: tFreno - 0.1, type: 'brakes', vol: 0.45 }, { t: tGav - 0.1, type: 'tension', vol: 0.35 },
    ...shotsT.map(x => ({ t: x, type: 'shot', vol: 0.75 })), { t: tH, type: 'sting', vol: 0.45 }, { t: tH + 0.3, type: 'wind', dur: ctx.dur - tH, vol: 0.25 }];

  const seatedAll = t => { K.pose(ff, A.waveSeated(t, 1)); ff.setFace(C.blinkEye(t, 1), 'smile'); K.pose(so, A.seated(t, 2)); so.setFace(C.blinkEye(t, 2), 'smile'); K.pose(dr, A.seated(t, 3, A.drive(t))); dr.setFace(C.blinkEye(t, 3), 'neutral');
    off2.forEach((c, i) => K.pose(c, i ? A.seated(t, 4, A.drive(t)) : A.seated(t, 5))); };
  const crowds = t => { for (const arr of [crowdA, crowdB]) arr.forEach((c, i) => { if (c.frozen) return; K.pose(c, C.wave(t, i)); c.setFace(C.blinkEye(t, i), 'smile'); }); };
  const shots = [
    { t0: 0, set: Sa, p0: [-12.5, 1.15, 0.2], l0: [-9.5, 0.9, 2.0], fov0: 38, act: (t) => {
      Sa.tick(t); arrowG.visible = false; car.position.set(-10.5 + t * 1.6, 0, 1.9); car.rotation.y = 0; car2.position.set(-17 + t * 1.6, 0, 1.9); seatedAll(t); crowds(t);
      ctx.camera.position.set(car.position.x + 1.4, 1.2, -0.9); ctx.camera.lookAt(car.position.x - 0.5, 0.95, 2.4);
      K.pose(cab, C.idle(t, 6)); K.pose(pr, C.idle(t, 7));
      return U.film(t) + U.nameplate(ctx, [car.position.x - 0.75, 1.62, 1.7], NAMES.franciscoFernando[0], NAMES.franciscoFernando[1], tArch - 0.1, tB);
    } },
    { t0: tB, set: Sa, p0: [-24, 11, -16], l0: [-4, 0.5, 4], p1: [-20, 10, -15], l1: [-2, 0.5, 4], fov0: 44, act: (t) => {
      Sa.tick(t); car.position.set(-10.5 + t * 1.6, 0, 1.9); car2.position.set(-17 + t * 1.6, 0, 1.9); seatedAll(t);
      return U.film(t) + U.badge(t, 'Sarajevo · 28 de junio de 1914', 'Capital de Bosnia', 'Anexada por Austria-Hungría en 1908', tCap - 0.4, tC);
    } },
    { t0: tC, set: Sa, p0: [-1.0, 1.25, 0.2], l0: [0, 1.0, 2.1], fov0: 36, act: (t) => {
      Sa.tick(t); car.position.set(-10.5 + t * 1.6, 0, 1.9); car2.position.set(-17 + t * 1.6, 0, 1.9); seatedAll(t);
      ctx.camera.position.set(car.position.x + 1.5, 1.2, 4.0); ctx.camera.lookAt(car.position.x - 0.7, 0.98, 2.2);
      return U.film(t) + U.nameplate(ctx, [car.position.x - 0.75, 1.5, 2.15], NAMES.sofia[0], NAMES.sofia[1], tSof - 0.3, tD);
    } },
    { t0: tD, set: Sa, p0: [-4.6, 1.7, -5.4], l0: [-10.0, 0.8, 1.6], p1: [-4.9, 1.65, -5.2], l1: [-10.2, 0.8, 1.6], fov0: 46, act: (t) => {
      Sa.tick(t); const cx = -10.5 + 0.7 * (t - tD) - 1.0; car.position.set(cx + 1.5, 0, 1.9); car.rotation.y = 0; car2.position.set(-12.6, 0, 1.9); seatedAll(t); crowds(t);
      cab.root.position.set(-7.0, 0, -1.6); cab.root.rotation.y = 0.5; K.pose(cab, A.throwAt(t, tBomba - 0.1, 6)); cab.setFace('open', 'frown');
      const u = clamp((t - (tBomba - 0.1)) / 0.55); bomb.visible = t > tBomba - 0.1 && t < tFallo - 0.05;
      bomb.position.set(-7.0 + (car.position.x - 1.2 + 7.0) * u, 1.0 + 1.4 * Math.sin(Math.PI * u), -1.6 + 3.6 * u);
      if (t > tBomba + 0.45) bomb.position.set(car.position.x - 1.6 - (t - tBomba - 0.45) * 2.0, 0.1, 2.2);
      boom.update(t); flash.intensity = 0;
      const cr = t > tFallo; for (const arr of [crowdA, crowdB]) arr.forEach((c, i) => { if (c.frozen) return; K.pose(c, cr ? A.cower(t, i) : C.wave(t, i)); c.setFace('open', cr ? 'open' : 'smile'); });
      return U.film(t) + U.stamp(t, 'BOMBA', tFallo, tE, { x: 1420, y: 420, rot: -8 });
    } },
    { t0: tE, set: Sa, p0: [-3, 12.5, -6], l0: [1.2, 0, 4.4], p1: [-2.5, 11.5, -5.0], l1: [1.4, 0, 4.6], fov0: 42, act: (t) => {
      Sa.tick(t); boom.update(-1); bomb.visible = false; car2.position.set(-30, 0, 1.9); arrowG.visible = true;
      const u = ss(tE, tFreno, t) * 0.82; carOnPath(u); seatedAll(t);
      arrowG.visible = true; arrowG.children.forEach((d, i) => { d.visible = i / arrowG.children.length < ss(tE + 0.2, tCalle + 0.6, t); });
      K.pose(pr, C.idle(t, 7));
      return U.film(t) + U.pin(ctx, [3.5, 0.3, 9.0], 'Calle Francisco José', 'la vuelta equivocada', ss(tCalle - 0.3, tCalle + 0.2, t)) + U.pin(ctx, [-3.2, 3.2, 7.0], 'Tienda de Schiller', 'ahí esperaba Princip', ss(tFreno - 0.2, tFreno + 0.2, t));
    } },
    { t0: tF, set: Sa, p0: [0.55, 0.92, 4.85], l0: [-0.45, 0.68, 6.4], p1: [0.4, 0.9, 5.05], l1: [-0.45, 0.7, 6.4], fov0: 36, act: (t) => {
      Sa.tick(t); arrowG.visible = false; car.position.set(-30, 0, 1.9);
      K.pose(pr, A.drawGun(t, ss(tJov, tG, t) * 0.4, 2)); pr.setFace(C.blinkEye(t, 2), 'frown');
      return U.film(t) + U.nameplate(ctx, [-1.0, 1.0, 6.45], NAMES.princip[0], NAMES.princip[1], tGav - 0.2, tG);
    } },
    { t0: tG, set: Sa, p0: [-0.3, 1.32, 7.55], l0: [0.9, 0.72, 4.4], p1: [-0.25, 1.3, 7.45], l1: [0.9, 0.72, 4.4], fov0: 42, act: (t) => {
      Sa.tick(t); car.position.set(CAR[0], 0, CAR[1]); car.rotation.y = CAR[2];
      K.pose(pr, A.shoot(t, shotsT, 2)); pr.setFace('open', 'frown');
      const fl = shotsT.reduce((m, ts) => Math.max(m, t >= ts ? 1 - (t - ts) / 0.12 : 0), 0); flash.intensity = 60 * Math.max(0, fl);
      pr.root.updateMatrixWorld(true); pistol.getWorldPosition(flash.position);
      K.pose(ff, A.seated(t, 1)); ff.setFace('open', 'open'); K.pose(so, A.seated(t, 2)); so.setFace('open', 'open'); K.pose(dr, A.seated(t, 3, A.drive(t)));
      return U.film(t) + (fl > 0.2 ? `<div style="position:absolute;inset:0;background:#fff;opacity:${(fl * 0.35).toFixed(3)}"></div>` : '');
    } },
    { t0: tH, set: Sa, p0: [9, 1.8, -1.5], l0: [-2, 1.0, 3.0], p1: [8.2, 1.7, -1.3], l1: [-2, 1.0, 3.0], fov0: 40, act: (t) => {
      Sa.tick(t); flash.intensity = 0; const u = t - tH; car.position.set(-1.5 - u * 2.8, 0, 1.9); car.rotation.y = Math.PI;
      K.pose(ff, { ...A.seated(t, 1), chest: [20, 0, 0], head: [24, 0, 0] }); ff.setFace('closed', 'neutral'); K.pose(so, { ...A.seated(t, 2), chest: [16, 0, 8] }); so.setFace('closed', 'neutral');
      for (const arr of [crowdA, crowdB]) arr.forEach((c, i) => { if (c.frozen) return; K.pose(c, A.sad ? A.sad(t, i) : C.idle(t, i)); c.setFace('closed', 'neutral'); });
      return U.film(t) + U.tint('#8a96a6', 0.45) + U.black(ss(ctx.dur - 1.2, ctx.dur, t) * 0.4);
    } },
  ];
  const inst = { scene: Sa, scenes: [Sa], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
