import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as A from '../anim.js';
import * as WM from '../wmap.js';
import { leader, NAMES } from '../leaders.js';

export { preload } from '../wmap.js';
const fz = (arr, poseFn, keep = () => false, face = 'neutral') => arr.forEach((c, i) => { if (keep(i)) return; c.setFace('open', face); K.freeze(c, poseFn(i)); });
const fade = WM.fade;

export function build(ctx) {
  const L = ctx.L;
  const tSar = wt(L[0], 'sarayevo'), tEst = wt(L[0], 'estudiante'), tMato = wt(L[0], 'mato'), tHer = wt(L[0], 'heredero');
  const tPot = wt(L[1], 'potencias'), tGuerra = wt(L[1], 'guerra'), tMor = wt(L[1], 'moririan'), tMill = wt(L[1], 'millones');
  const tPrim = wt(L[2], 'primera');

  // ---- 1. Sarajevo, the Appel Quay: the archduke's car passes the crowd
  const Sa = S.sarajevo('summer');
  const car = P.tourer(); car.position.set(-12, 0, 1.9); car.userData.dynamic = true; Sa.add(car);
  const seatY = 0.76;
  const ff = leader(car, 'franciscoFernando', -0.75, -0.2, Math.PI / 2); ff.root.position.y = seatY;
  const so = leader(car, 'sofia', -0.75, 0.24, Math.PI / 2); so.root.position.y = seatY;
  const dr = leader(car, 'chofer', 0.55, -0.22, Math.PI / 2); dr.root.position.y = seatY;
  [ff, so, dr].forEach(c => { c.root.scale.setScalar(0.92); });
  const crowdA = [...K.crowd(Sa, ['sarajevoHombre', 'sarajevoMujer'], 16, [-16, 6.5, -2.6, 7.7], { seed: 3, yaw: Math.PI }), ...K.crowd(Sa, ['sarajevoMujer', 'sarajevoHombre'], 10, [1.3, 6.5, 10, 7.7], { seed: 5, yaw: Math.PI })];
  const crowdB = K.crowd(Sa, ['sarajevoHombre', 'sarajevoMujer'], 16, [-16, -2.4, 10, -1.9], { seed: 4, yaw: 0, jitter: 0.2 });
  fz(crowdA, i => i % 3 ? C.idle(0.4, i, 0.4) : C.wave(0.3 + i, i), i => i % 5 === 0);
  fz(crowdB, i => i % 2 ? C.idle(0.4, i, 0.4) : C.wave(0.6 + i, i), i => i % 4 === 0);
  // ---- 2. Princip on the corner by Schiller's delicatessen
  const CAR = [0.9, 4.4, -0.9];   // where the car stops after the wrong turn
  const pr = leader(Sa, 'princip', -0.4, 6.4, Math.atan2(CAR[0] + 0.4, CAR[1] - 6.4));
  const runners = [-2.2, -1.6, 1.6, 2.4].map((x, i) => K.person(Sa, ['oguri', 'helios', 'tamamo', 'suzuka'][i], 'sarajevoHombre', x, 7.6 - (i % 2) * 0.4, Math.PI));
  const pistol = K.pistol();
  pr.attach('wriR', pistol, [-0.31, 0.47, -0.02], [0, -90, 0]);
  const flash = new THREE.PointLight('#ffd27a', 0, 6, 1.6); Sa.add(flash);
  // ---- 3. Map: the powers go to war
  const Mp = WM.europeMap({ period: 1914 });
  // ---- 4. A trench at dusk under star shells
  const Tr = S.trenchWF('dusk', { seed: 711 });
  const watch = [['doto', 'tommy', -1.2, -0.45], ['oguri', 'tommy', 0.5, -0.5], ['helios', 'tommy', 2.2, -0.45]].map(([w, o, x, z], i) => { const c = K.person(Tr, w, o, x, z, Math.PI); c.root.position.y = 0.55; return c; });
  fz(watch, i => ({ ...C.idle(0.3, i, 0.3), gun: 'port', head: [-6, 0, 0] }), () => false);
  const flare = new THREE.PointLight('#e8f0ff', 0, 60, 1.2); Tr.add(flare);
  const flareBall = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), new THREE.MeshBasicMaterial({ color: '#f4f8ff' })); Tr.add(flareBall);
  // ---- 5. Title over a field of poppies and wire
  const Ti = S.cemetery('dusk', { rows: 0, cols: 0 });
  for (let k = 0; k < 3; k++) { const w = P.wire(9, k); w.position.set(-9 + k * 9, 0, -6 - k * 0.8); Ti.add(w); }
  for (let k = 0; k < 5; k++) { const t = S.deadTree(1.2 + k * 0.1, k); t.position.set(-14 + k * 7, 0, -18 - (k % 2) * 5); Ti.add(t); }

  const tB = tEst - 0.35, tC = tMato - 0.15, tC2 = tHer - 0.1, tD = L[1].t0 - 0.35, tE = tMor - 0.3, tF = L[2].t0 - 0.4;
  const shots1 = [tMato + 0.02, tMato + 0.38];
  const sfx = [{ t: 0.0, type: 'crowd', dur: tB + 0.2, vol: 0.4 }, { t: 0.2, type: 'engine', dur: tB, vol: 0.25 }, { t: 0.4, type: 'cheer', vol: 0.3 },
    { t: tB, type: 'tension', vol: 0.35 }, ...shots1.map(x => ({ t: x, type: 'shot', vol: 0.75 })), { t: tC2, type: 'sting', vol: 0.5 },
    { t: tD, type: 'whoosh', vol: 0.4 }, { t: tPot, type: 'drums', dur: tE - tPot, vol: 0.3 }, { t: tE, type: 'wind', dur: ctx.dur - tE, vol: 0.3 }, { t: tE + 0.6, type: 'boom', vol: 0.35 },
    { t: tE + 1.8, type: 'boom', vol: 0.25 }, { t: tPrim - 0.3, type: 'sting2', vol: 0.45 }];

  const shots = [
    { t0: 0, set: Sa, p0: [-2.5, 1.25, -1.2], l0: [-9, 1.0, 3.5], p1: [-1.2, 1.2, -1.0], l1: [-1.0, 1.05, 3.5], fov0: 44, act: (t) => {
      Sa.tick(t); car.position.x = -12 + clamp(t / tB) * 12.5;
      K.pose(ff, A.waveSeated(t, 1)); ff.setFace(C.blinkEye(t, 1), 'smile'); K.pose(so, A.seated(t, 2)); so.setFace(C.blinkEye(t, 2), 'smile'); K.pose(dr, A.seated(t, 3, A.drive(t))); dr.setFace(C.blinkEye(t, 3), 'neutral');
      crowdA.forEach((c, i) => { if (c.frozen) return; K.pose(c, C.wave(t, i)); c.setFace(C.blinkEye(t, i), 'smile'); });
      crowdB.forEach((c, i) => { if (c.frozen) return; K.pose(c, C.wave(t, i)); c.setFace(C.blinkEye(t, i), 'smile'); });
      return U.film(t) + U.badge(t, 'Sarajevo · 28 de junio de 1914', 'La visita del archiduque', 'Bosnia, parte de Austria-Hungría', tSar - 0.3, tB);
    } },
    { t0: tB, set: Sa, p0: [0.55, 0.92, 4.85], l0: [-0.45, 0.68, 6.4], p1: [0.4, 0.9, 5.05], l1: [-0.45, 0.7, 6.4], fov0: 36, act: (t) => {
      Sa.tick(t); car.position.set(-30, 0, 2); car.rotation.y = 0;
      K.pose(pr, A.drawGun(t, ss(tB + 0.6, tC, t), 2)); pr.setFace(C.blinkEye(t, 2), 'frown');
      K.pose(ff, A.seated(t, 1)); K.pose(so, A.seated(t, 2)); K.pose(dr, A.seated(t, 3, A.drive(t)));
      runners.forEach((r, i) => { K.pose(r, C.idle(t, i)); r.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.nameplate(ctx, [-0.4, 1.32, 6.4], NAMES.princip[0], NAMES.princip[1], tEst, tC);
    } },
    { t0: tC, set: Sa, p0: [-0.95, 1.12, 7.45], l0: [CAR[0], 0.85, CAR[1]], p1: [-0.9, 1.1, 7.35], l1: [CAR[0], 0.85, CAR[1]], fov0: 42, act: (t) => {
      Sa.tick(t); car.position.set(CAR[0], 0, CAR[1]); car.rotation.y = CAR[2];
      K.pose(pr, A.shoot(t, shots1, 2)); pr.setFace('open', 'frown');
      const fl = shots1.reduce((m, ts) => Math.max(m, t >= ts ? 1 - (t - ts) / 0.12 : 0), 0); flash.intensity = 60 * Math.max(0, fl);
      pr.root.updateMatrixWorld(true); pistol.getWorldPosition(flash.position);
      K.pose(ff, A.seated(t, 1)); ff.setFace('open', 'open'); K.pose(so, A.seated(t, 2)); so.setFace('open', 'open'); K.pose(dr, A.seated(t, 3, A.drive(t)));
      return U.film(t) + (fl > 0.2 ? `<div style="position:absolute;inset:0;background:#fff;opacity:${(fl * 0.35).toFixed(3)}"></div>` : '');
    } },
    { t0: tC2, set: Sa, p0: [6.2, 2.6, -0.8], l0: [0.4, 0.7, 5.6], p1: [5.6, 2.4, -0.4], l1: [0.4, 0.7, 5.6], fov0: 42, act: (t) => {
      Sa.tick(t); flash.intensity = 0; car.position.set(CAR[0], 0, CAR[1]); car.rotation.y = CAR[2];
      K.pose(pr, { ...C.idle(t, 2, 0.3), armR: [-30, 0, 60] }); K.pose(ff, { ...A.seated(t, 1), chest: [18, 0, 0], head: [20, 0, 0] }); ff.setFace('closed', 'neutral'); K.pose(so, A.seated(t, 2)); so.setFace('closed', 'neutral');
      runners.forEach((r, i) => { const u = t - tC2; r.root.position.x = [-2.2, -1.6, 1.6, 2.4][i] + (i < 2 ? 1 : -1) * Math.min(1.2, u * 1.6); K.pose(r, A.charge(t, i, 1.1)); r.setFace('open', 'open'); });
      return U.film(t) + U.tint('#8a96a6', 0.4);
    } },
    { t0: tD, set: Mp, p0: [-2, 70, 46], l0: [-1, 0, 2], p1: [0, 82, 54], l1: [0, 0, 2], fov0: 40, act: (t) => {
      Mp.paint(1914);
      const kc = ss(tPot - 0.2, tPot + 0.6, t), ke = ss(tPot + 0.4, tGuerra, t);
      for (const st of ['GER', 'AUH']) Mp.tintState(1914, st, WM.COL.CENTRAL, kc, 0.8);
      Mp.tintState(1914, 'OTT', WM.COL.CENTRAL, ss(tGuerra, tGuerra + 0.8, t), 0.6); Mp.tintState(1914, 'BUL', WM.COL.CENTRAL, ss(tGuerra + 0.4, tGuerra + 1.2, t), 0.6);
      for (const st of ['FRA', 'RUE', 'GBR', 'SRB', 'BEL']) Mp.tintState(1914, st, WM.COL.ENTENTE, ke, 0.8);
      Mp.tintState(1914, 'ITA', WM.COL.ENTENTE, ss(tMor - 0.8, tMor, t), 0.6);
      return U.film(t) + WM.city(ctx, Mp, 'Sarajevo', fade(t, tD + 0.2, tE + 1), 'c')
        + U.big(t, tGuerra - 0.3, tE + 0.5, 'Agosto de 1914: Europa en guerra', { top: 110, size: 60 });
    } },
    { t0: tE, set: Tr, p0: [-3.4, 1.0, 0.6], l0: [2.5, 1.6, -3], p1: [-2.9, 1.0, 0.6], l1: [2.5, 1.7, -3], fov0: 46, act: (t) => {
      Tr.tick(t); const u = t - tE;
      flareBall.position.set(6 - u * 0.4, 9 - u * 1.2, -18); flare.position.copy(flareBall.position); flare.intensity = 140 * clamp(u / 0.4) * (1 - clamp((u - 2.4) / 0.6));
      flareBall.visible = flare.intensity > 1;
      return U.film(t) + U.black(0.15);
    } },
    { t0: tF, set: Ti, p0: [0, 0.7, 6.5], l0: [0, 1.6, -10], p1: [0, 0.9, 4.6], l1: [0, 1.9, -10], fov0: 44, act: (t) => {
      Ti.tick(t);
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,6,6,${(0.2 + 0.25 * ss(tPrim - 0.6, tPrim, t)).toFixed(3)})"></div>`
        + U.titleCard(t, tPrim - 0.5, ctx.dur + 1, '1914 · 1918', 'LA PRIMERA<br>GUERRA MUNDIAL', 'La Gran Guerra', 150);
    } },
  ];
  const inst = { scene: Sa, scenes: [Sa, Mp, Tr, Ti], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
