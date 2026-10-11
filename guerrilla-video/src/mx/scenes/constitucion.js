import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as LP from '../../lib/props.js';
import { ss, clamp } from '../../lib/util.js';
import { badge } from '../../lib/kit.js';
import * as X from '../props.js';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as W2 from '../../ww2/kit.js';
import { zocalo, interior, mxStage, morelos, aimSun } from '../sets.js';
import { runShots, wt } from '../shots.js';
import { film, nameplate, card, stamp } from '../ui.js';

export function build(ctx) {
  const L = ctx.L;
  const tEn = wt(L[0], 'en$') - 0.25, tFir = wt(L[0], 'firmo'), tProt = wt(L[1], 'protegia') - 0.15, tDecl = wt(L[1], 'y', 0) - 0.05, tPet = wt(L[1], 'petroleo'), tVig = wt(L[2], 'vigente');
  // ---- Carranza in power
  const Z = zocalo('day'); const [bx, by, bz] = Z.palacio.balcony;
  const car = K.person(Z, 'carranza', 'carranza', bx, bz - 16 + 0.1, 0); car.root.position.y = by; car.attach('chest', K.sash(), [0, 0.4, 0]);
  const crowd = []; for (let i = 0; i < 10; i++) crowd.push(K.person(Z, ['doto', 'oguri', 'tamamo', 'helios', 'cafe'][i % 5], i % 2 ? 'politico' : 'campesino', -4 + (i % 5) * 2, -9.6 + Math.floor(i / 5) * 1.5, Math.PI));
  // ---- Querétaro: the constituent congress
  const Q = interior({ wall: '#6a2a2a', floor: '#4a3020', w: 12, d: 9, h: 5, lights: [[-2.5, 4.3, 0], [2.5, 4.3, 0]], windows: false });
  for (const x of [-4.6, -2.3, 2.3, 4.6]) Q.add(LP.at(LP.box(0.5, 5, 0.2, '#5a2222'), x, 2.5, -4.4));
  const stg = LP.at(LP.box(8, 0.4, 2.6, '#5a3a24'), 0, 0.2, -3.2); Q.add(stg);
  const ban = X.banner('CONSTITUYENTE · 1917', { w: 4.0, h: 0.7, size: 64, bg: '#f3ead6', fg: '#2a2320', accent: '#9b2d22', poles: false }); ban.position.set(-1.1, 2.75, -4.3); Q.add(ban);
  const flagQ = X.flag('mx', 3.6, 1.4, 0.85); flagQ.position.set(-3.4, 0.4, -3.8); Q.add(flagQ);
  const tbl = new THREE.Group(); tbl.add(LP.at(LP.box(3.4, 0.06, 0.9, '#5a3a24'), 0, 0.5, 0)); tbl.add(LP.at(LP.box(3.42, 0.42, 0.02, '#1f7a3a'), 0, 0.29, 0.46));
  for (const [x, z] of [[-1.6, -0.4], [1.6, -0.4], [-1.6, 0.4], [1.6, 0.4]]) tbl.add(LP.at(LP.box(0.06, 0.5, 0.06, '#4a2f1d'), x, 0.25, z)); tbl.position.set(0, 0.4, -3.0); Q.add(tbl);
  const book = X.constitutionBook(); book.scale.setScalar(0.62); book.position.set(0.15, 0.93, -2.95); Q.add(book);
  const deps = [-1.3, -0.55, 0.85, 1.55].map((x, i) => K.person(Q, ['oguri', 'tamamo', 'helios', 'daiwa'][i], 'politico', x, -3.75, 0)); deps.forEach(d => (d.root.position.y = 0.4));
  const signer = K.person(Q, 'carranza', 'carranza', 0.15, -3.75, 0); signer.root.position.y = 0.4;
  const seats = [];
  // ---- land, work and oil
  const T = morelos('day', { cane: false, seed: 111 });
  T.add(X.field(-10, -9, 10, -3, { kind: 'corn', seed: 112, spacing: 0.5, height: 1.4 }));
  const ej = X.banner('EJIDO', { w: 2.0, h: 0.6, size: 92, bg: '#f3ead6', fg: '#2a2320', accent: '#1f7a3a' }); ej.position.set(-1.4, 2.0, -1.8); T.add(ej);
  const camp = []; for (let i = 0; i < 6; i++) camp.push(K.person(T, ['doto', 'oguri', 'tamamo', 'helios', 'cafe', 'suzuka'][i], 'campesino', -2.6 + i * 1.05, -0.4 + (i % 2) * 0.6, 0));
  const Fa = mxStage('day', ['#b8ad98', '#a89d88'], { seed: 113 });
  const fac = W2.factory('#9a5a42', '#5a5e64'); fac.position.set(0, 0, -7); Fa.add(fac);
  const facSmoke = [0, 1].map(i => X.smokeTrail(Fa, 10, { color: '#8a8580', size: 0.6, rise: 4.5, drift: [1.5, 0, 0], life: 3.4, opacity: 0.55 }));
  const workers = []; for (let i = 0; i < 6; i++) { const w = K.person(Fa, ['oguri', 'doto', 'helios', 'tamamo', 'daiwa', 'cafe'][i], 'politico', -2.7 + i * 1.08, -0.5 + (i % 2) * 0.6, 0); w.attach('head', K.bowler('#3a3a3a'), [0, 0.9, -0.02]); K.hideEars(w); workers.push(w); }
  const strike = X.banner('8 HORAS', { w: 2.0, h: 0.6, size: 86, bg: '#b5332e', fg: '#f3ead6', accent: '#f3ead6' }); strike.position.set(0.3, 2.1, -0.9); Fa.add(strike);
  const O = mxStage('golden', ['#b9a98a', '#a99978'], { seed: 114 });
  O.add(X.sierra({ z: -80, depth: 40, height: 9, seed: 115, base: '#6f7a5a', top: '#8a9470' }));
  LP.scatter(O, (r, i) => LP.palm(1.2 + r() * 0.4, i), 30, [-30, -40, 30, -8], 116);
  const ders = [[-5, -14], [0.5, -18], [5.5, -13], [10, -19]].map(([x, z]) => { const d = X.derrick(6.5); d.position.set(x, 0, z); O.add(d); return d; });
  const flagO = X.flag('mx', 4.0, 1.6, 1.0); flagO.position.set(3.2, 0, -4.5); O.add(flagO);
  const gush = X.smokeTrail(O, 12, { color: '#1c1a18', size: 0.35, rise: 3.5, drift: [0.3, 0, 0], life: 1.6, opacity: 0.85 });
  // ---- the book, today
  const B = interior({ wall: '#3a2a22', floor: '#2a1e16', w: 8, d: 7, h: 4, lights: [[0, 2.6, 1.2]], windows: false, bulbs: false });
  B.userData.sun.intensity = 0.35;
  const ped = X.pedestal('1917', 'Constitución'); ped.position.set(0, 0, -0.6); B.add(ped);
  const book2 = X.constitutionBook(); book2.position.set(0, ped.top + 0.02, -0.6); B.add(book2);
  const flagB = X.flag('mx', 2.7, 1.2, 0.75); flagB.position.set(-1.35, 0, -1.6); B.add(flagB);
  const spot = new THREE.SpotLight('#fff1d0', 40, 12, 0.45, 0.5, 1.2); spot.position.set(0.5, 4, 2); spot.target.position.set(0, 1, -0.6); B.add(spot, spot.target);

  const sfx = [{ t: 0.3, type: 'crowd', dur: tEn, vol: 0.4 }, { t: tFir, type: 'creak', vol: 0.5 }, { t: tFir + 0.6, type: 'cheer', vol: 0.6 },
    { t: L[1].t0 - 0.1, type: 'pop' }, { t: tProt, type: 'pop' }, { t: tProt + 0.2, type: 'factory', dur: tDecl - tProt, vol: 0.4 }, { t: tDecl, type: 'pop' }, { t: L[2].t0 - 0.1, type: 'sting', vol: 0.6 }, { t: tVig, type: 'thud' }];

  const shots = [
    { t0: 0, set: Z, p0: [1.6, 2.4, -5.8], l0: [0, 4.6, -13.9], p1: [1.2, 2.7, -7.2], l1: [0, 4.65, -13.9], fov0: 38, act: (t) => {
      K.pose(car, C.wave(t, 1, 'R')); car.setFace(C.blinkEye(t, 1), 'smile'); Z.flag.wave(t); aimSun(Z, 0, -6);
      crowd.forEach((c, i) => K.pose(c, i % 3 ? C.idle(t, c.seed) : C.cheer(t, i)));
      return film(t) + nameplate(ctx, [bx, by + 1.6, bz - 16 + 0.1], 'Venustiano Carranza', 'Presidente', 0.8, tEn - 0.2) + badge(t, '1915 – 1920', 'Carranza en el poder', 'Su gobierno es reconocido como el de México', 1.2, tEn - 0.2);
    } },
    { t0: tEn, set: Q, p0: [1.6, 1.8, 3.6], l0: [0, 1.2, -3.2], p1: [1.2, 1.7, 2.6], l1: [0, 1.2, -3.2], fov0: 38, act: (t) => {
      { const p = C.idle(t, 2); p.armR = [-62 + 4 * Math.sin(t * 9), 10 * Math.sin(t * 4), 74]; p.elbR = [0, 24, 0]; p.waist = [10, 0, 0]; p.head = [10, 0, 0]; K.pose(signer, p); } signer.setFace(C.blinkEye(t, 2), 'neutral');
      deps.forEach((d, i) => K.pose(d, t > tFir + 0.5 ? A.clap(t, i) : C.idle(t, d.seed)));
      seats.forEach((d, i) => K.pose(d, t > tFir + 0.5 ? A.clap(t, i + 3) : C.idle(t, d.seed))); flagQ.wave(t * 0.4);
      return film(t) + badge(t, '5 de febrero de 1917', 'La Constitución de Querétaro', 'Redactada por el Congreso Constituyente', tEn + 0.6, L[1].t0 - 0.2);
    } },
    { t0: L[1].t0 - 0.2, set: T, p0: [0.4, 1.3, 5.2], l0: [-0.4, 1.2, -0.6], p1: [0.3, 1.25, 4.6], l1: [-0.4, 1.25, -0.6], fov0: 40, act: (t) => {
      camp.forEach((c, i) => { K.pose(c, C.cheer(t + i * 0.3, i)); c.setFace(i % 2 ? 'happy' : 'sparkle', 'teeth'); }); aimSun(T, 0, 0);
      return film(t) + card(t, L[1].t0, tProt, 'ARTÍCULO 27', 'Reparto de tierras', 'Los pueblos recuperan tierras como ejidos', { icon: '🌽' });
    } },
    { t0: tProt, set: Fa, p0: [0.5, 1.3, 5.0], l0: [-0.2, 1.4, -2], p1: [0.4, 1.25, 4.4], l1: [-0.2, 1.4, -2], fov0: 40, act: (t) => {
      workers.forEach((w, i) => { K.pose(w, i % 2 ? A.fist(t, i) : C.cheer(t + i * 0.3, i)); w.setFace('happy', 'teeth'); });
      facSmoke.forEach((f, i) => f(t + i, new THREE.Vector3(-1.2 + i * 2.2, 6.2, -7.6))); aimSun(Fa, 0, 0);
      return film(t) + card(t, tProt + 0.05, tDecl, 'ARTÍCULO 123', 'Derechos laborales', 'Jornada de 8 horas, salario mínimo y derecho de huelga', { icon: '🛠️' });
    } },
    { t0: tDecl, set: O, p0: [1.2, 1.9, 6.5], l0: [2.0, 3.0, -12], p1: [0.9, 1.85, 5.5], l1: [2.0, 3.0, -12], fov0: 40, act: (t) => {
      flagO.wave(t); gush(t, new THREE.Vector3(0.5, 6.8, -18), 1); aimSun(O, 0, -6);
      return film(t) + card(t, tPet - 0.2, L[2].t0 - 0.1, 'ARTÍCULO 27', 'El subsuelo es de la nación', 'El petróleo y los minerales pertenecen a México', { icon: '🛢️' });
    } },
    { t0: L[2].t0 - 0.2, set: B, p0: [0.75, 1.65, 2.3], l0: [-0.2, 1.25, -0.7], p1: [0.6, 1.6, 1.8], l1: [-0.2, 1.22, -0.7], fov0: 38, act: (t) => {
      flagB.wave(t * 0.4);
      return film(t) + stamp(t, 'VIGENTE HOY', tVig, ctx.dur, { x: 1440, y: 300, rot: -8, color: '#1f7a3a' })
        + badge(t, '1917 → hoy', 'La Constitución de 1917', 'Con cientos de reformas, sigue rigiendo a México', L[2].t0 + 0.3, tVig - 0.1);
    } },
  ];
  const inst = { scene: Z, scenes: [Z, Q, T, Fa, O, B], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
