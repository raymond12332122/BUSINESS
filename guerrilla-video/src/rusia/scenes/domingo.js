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
const vote = (t, seed) => { const p = A.sit(t, seed); p.armR = [-15, 0, -25]; p.elbR = [0, 0, -70]; return p; };

const fz = (arr, poseFn, keep = () => false, face = 'neutral') => arr.forEach((c, i) => { if (keep(i)) return; c.setFace('open', face); K.freeze(c, poseFn(i)); });

export function build(ctx) {
  const L = ctx.L;
  const tJap = wt(L[0], 'japon'), tMarcha = wt(L[0], 'marcha'), tPal = wt(L[0], 'palacio');
  const tDisp = wt(L[1], 'dispararon'), tCien = wt(L[1], 'cien'), tDom = wt(L[1], 'domingo');
  const tHuel = wt(L[2], 'huelgas'), tMot = wt(L[2], 'motines'), tSov = wt(L[2], 'soviets'), tCons = wt(L[2], 'consejos'), tZar = wt(L[2], 'zar'), tDuma = wt(L[2], 'duma'), tNunca = wt(L[2], 'nunca');

  // ---- 1. Tsushima, May 1905
  const Sb = S.seaBattle();
  // ---- 2-4. Palace Square, 22 January 1905
  const Ps = S.palaceSquare('snow');
  const marchers = K.crowd(Ps, ['obrero', 'obrera', 'obrero', 'obrera', 'campesino'], 22, [-3.4, -1.5, 3.4, 6.5], { seed: 41, yaw: Math.PI });
  const gapon = K.person(Ps, 'tamamo', 'cura', 0, -2.4, Math.PI); marchers.push(gapon);
  const carried = [];
  [[gapon, 'icon'], [marchers[2], 'portrait'], [marchers[5], 'khorugv'], [marchers[9], 'icon'], [marchers[13], 'portrait'], [marchers[16], 'khorugv']].forEach(([m, kind]) => {
    const o = kind === 'icon' ? P.icon(3) : kind === 'portrait' ? P.portraitPole() : P.khorugv(); o.scale.setScalar(0.42); o.position.set(0, -0.45, 0.16); m.attach('chest', o, [0, 0.3, 0.17]); m.carry = true; carried.push(o); });
  marchers.forEach((m, i) => { m.p0 = m.root.position.clone(); m.fall = i % 5 === 2 ? 1 : 0; m.flee = !m.fall && i % 3 !== 0; });
  const line = [...Array(9)].map((_, i) => K.person(Ps, ['doto', 'oguri', 'helios', 'suzuka', 'mcqueen', 'daiwa', 'cafe', 'tamamo', 'doto'][i], 'soldadoInvierno', -4.4 + i * 1.1, -14 - (i % 2) * 0.25, 0));
  const officer = K.person(Ps, 'mcqueen', 'oficialZar', 5.9, -14.6, -0.4);
  const muzzles = line.map(s => new THREE.Vector3(s.root.position.x - 0.03, 0.47, s.root.position.z + 0.5));
  const fx = P.volleyFx(Ps, muzzles);
  // ---- 5. Strike at the works
  const F = S.factory('grey', { snow: true, strike: true });
  const strikers = K.crowd(F, ['obrero', 'obrero', 'obrera'], 14, [-3.5, -8.5, 3.5, -4.5], { seed: 51 });
  const stB = P.banner('СТАЧКА!', { w: 3.0, h: 0.6, poleH: 1.7 }); stB.position.set(0, 0, -6.2); F.add(stB);
  fz(strikers, i => i % 3 ? A.proud(0.3, i) : A.rally(0.3, i), () => false, 'open');
  // ---- 6. A workers' soviet
  const Sv = S.hall('soviet');
  const deps = []; for (let r = 0; r < 6; r++) for (let i = 0; i < 6; i++) for (const sd of [-1, 1]) { if ((r * 7 + i * 3 + (sd > 0)) % 4 === 0) continue; const [x, y, z] = Sv.seatsAt(r, i, sd);
    const d = K.person(Sv, ['doto', 'oguri', 'helios', 'suzuka', 'mcqueen', 'daiwa', 'cafe', 'tamamo'][(r * 6 + i + (sd > 0 ? 3 : 0)) % 8], ['obrero', 'obrera', 'soldadoZar', 'obrero', 'marinero'][(r + i * 2) % 5], x, z, Math.PI); d.root.position.y = y; deps.push(d); }
  const speaker = K.person(Sv, 'helios', 'delegado', 0, -7.05, 0); speaker.root.position.y = 0.36;
  fz(deps, i => A.sit(0.4, i), i => i % 3 === 0);
  // ---- 7. The Duma
  const Du = S.hall('duma');
  const deputies = []; for (let r = 0; r < 6; r++) for (let i = 0; i < 6; i++) for (const sd of [-1, 1]) { if ((r * 5 + i * 3 + (sd > 0)) % 5 === 0) continue; const [x, y, z] = Du.seatsAt(r, i, sd);
    const d = K.person(Du, ['doto', 'oguri', 'helios', 'suzuka', 'mcqueen', 'daiwa', 'cafe', 'tamamo'][(r * 6 + i + (sd > 0 ? 5 : 0)) % 8], ['delegado', 'delegado', 'campesino', 'delegado'][(r + i) % 4], x, z, Math.PI); d.root.position.y = y; deputies.push(d); }
  fz(deputies, i => A.sit(0.4, i));
  // ---- 8. The tsar keeps the power
  const Th = S.throneHall();
  const tsar = leader(Th, 'nicolas', Th.seat[0], Th.seat[2], 0); tsar.root.position.y = Th.seat[1];

  const tB = tMarcha - 0.35, tC = L[1].t0 - 0.3, tD = tCien - 0.5, tE = L[2].t0 - 0.3, tF = tSov - 0.5, tG = tZar - 0.4, tH = tNunca - 0.35;
  const tv = tDisp + 0.12;
  const sfx = [{ t: 0.0, type: 'fire', dur: tB, vol: 0.35 }, { t: 0.3, type: 'boom', vol: 0.45 }, { t: tB, type: 'bells', dur: tC - tB + 0.3, vol: 0.28 }, { t: tB, type: 'choir', dur: tv - tB, vol: 0.22 },
    { t: tv, type: 'volley', vol: 0.75 }, { t: tv + 0.3, type: 'crowd', dur: 3.5, vol: 0.4 }, { t: tDom - 0.1, type: 'hit', vol: 0.6 },
    { t: tE, type: 'crowd', dur: tF - tE, vol: 0.3 }, { t: tF, type: 'gavel', vol: 0.4 }, { t: tDuma - 0.1, type: 'pop', vol: 0.4 }, { t: tH, type: 'tension', vol: 0.45 }];

  const march = (t) => {
    Ps.tick(t);
    for (const [i, m] of marchers.entries()) {
      const u = Math.min(t, tv) - tB, z = m.p0.z - Math.max(0, u) * 0.3;
      if (t < tv) { m.root.position.set(m.p0.x, 0, z); m.root.rotation.y = Math.PI; K.pose(m, m.carry ? A.carry(t, i) : C.walk(t, 0.42, i)); m.setFace(C.blinkEye(t, i), 'neutral'); continue; }
      if (m.fall) { m.root.position.set(m.p0.x, 0, z); K.pose(m, A.fallAt(t, tv + 0.1 + (i % 4) * 0.08, i)); m.setFace('flat', 'frown'); continue; }
      if (m.flee) { const k = ss(tv + 0.2, tv + 0.6, t); m.root.rotation.y = Math.PI * (1 - k); m.root.position.set(m.p0.x + Math.sin(i) * 0.3 * k, 0, z + Math.max(0, t - tv - 0.4) * 1.1); K.pose(m, k > 0.5 ? A.flee(t, i) : C.idle(t, i)); m.setFace('shock', 'scream'); continue; }
      m.root.position.set(m.p0.x, 0, z); K.pose(m, A.handsUp(t, i)); m.setFace('shock', 'open');
    }
    carried.forEach((o, i) => { o.visible = t < tv + 0.25 || i % 2 === 0; });
    line.forEach((s, i) => { K.pose(s, t < tv - 1.2 ? A.guard(t, i) : A.volley(t, tv, i)); s.setFace(C.blinkEye(t, i), 'frown'); });
    K.pose(officer, t < tv - 0.6 ? C.idle(t, 3) : C.point(t, 3, 0)); officer.setFace('open', t > tv - 0.6 && t < tv + 0.3 ? 'shout' : 'frown');
    fx(t, tv);
  };
  const shots = [
    { t0: 0, set: Sb, p0: [6, 3.2, 12], l0: [-3, 4, -40], p1: [3, 2.8, 8], l1: [-3, 4.4, -40], fov0: 40, act: (t) => {
      Sb.tick(t);
      return U.film(t) + U.badge(t, '1904–1905', 'Guerra contra Japón', 'Rusia pierde su flota en Tsushima', 0.4, tB);
    } },
    { t0: tB, set: Ps, p0: [2.2, 1.45, 10.5], l0: [-0.5, 2.6, -30], p1: [1.8, 1.4, 8.6], l1: [-0.5, 2.8, -30], fov0: 46, act: (t) => {
      march(t);
      return U.film(t) + U.badge(t, 'San Petersburgo · 22 de enero de 1905', 'Una marcha pacífica', 'Con íconos y retratos del zar', tMarcha - 0.1, tC);
    } },
    { t0: tC, set: Ps, p0: [6.6, 0.95, -11.2], l0: [-1.5, 0.62, -14.6], p1: [6.2, 0.92, -11.6], l1: [-1.5, 0.62, -14.6], fov0: 42, shake: (t) => 0.02 * Math.max(0, 1 - Math.abs(t - tv) / 0.25), act: (t) => {
      march(t);
      return U.film(t);
    } },
    { t0: tD, set: Ps, p0: [4.6, 1.05, 4.2], l0: [-1.2, 0.55, -7], p1: [4.2, 1.0, 3.4], l1: [-1.2, 0.55, -7], fov0: 44, act: (t) => {
      march(t);
      return U.film(t) + U.tint('#8a1010', 0.25 * ss(tDom - 0.4, tDom, t)) + U.stat(1200, 150, '100 – 200', 'muertos (cifra discutida)', ss(tCien - 0.2, tCien + 0.2, t) * (1 - ss(tE - 0.35, tE, t)), '#ff8a6a')
        + U.big(t, tDom - 0.15, tE, 'DOMINGO SANGRIENTO', { top: 420, size: 96 });
    } },
    { t0: tE, set: F, p0: [2.6, 1.15, 3.6], l0: [0, 1.2, -10], p1: [2.2, 1.1, 2.6], l1: [0, 1.25, -10], fov0: 44, act: (t) => {
      F.tick(t); stB.wave(t);
      strikers.forEach((w, i) => { K.pose(w, i % 3 ? A.proud(t, i) : A.rally(t, i)); w.setFace(C.blinkEye(t, i), i % 3 ? 'frown' : 'open'); });
      return U.film(t) + U.tag(ctx, [0, 1.95, -6.2], 'СТАЧКА', 'huelga', fade2(t, tE + 0.3, tF)) + U.icons(t, tHuel - 0.2, tF, [['✊', 'Huelgas', tHuel - 0.1], ['⚓', 'Motines', tMot - 0.1]], { y: 760 });
    } },
    { t0: tF, set: Sv, p0: [3.6, 2.5, 4.6], l0: [0, 0.5, -6.5], p1: [3.2, 2.3, 3.8], l1: [0, 0.5, -6.5], fov0: 42, act: (t) => {
      Sv.bannerMain.wave(t, 0.02);
      deps.forEach((d, i) => { K.pose(d, (i % 3 === 0 && t > tCons) ? vote(t, i) : A.sit(t, i)); d.setFace(C.blinkEye(t, i), 'neutral'); });
      K.pose(speaker, A.orate(t, 2)); speaker.setFace(C.blinkEye(t, 2), C.talkMouth(t, 2));
      return U.film(t) + U.badge(t, '1905', 'Nacen los sóviets', 'Consejos elegidos por obreros y soldados', tSov - 0.2, tG);
    } },
    { t0: tG, set: Du, p0: [-3.8, 2.5, 4.4], l0: [0, 0.6, -7], p1: [-3.4, 2.3, 3.6], l1: [0, 0.6, -7], fov0: 42, act: (t) => {
      deputies.forEach((d, i) => { K.pose(d, A.sit(t, i)); d.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.badge(t, '1906', 'La Duma', 'Un parlamento con poderes limitados', tDuma - 0.2, tH);
    } },
    { t0: tH, set: Th, p0: [0, 1.0, -1.6], l0: [0, 0.95, -6], p1: [0, 0.98, -2.8], l1: [0, 0.98, -6], fov0: 40, act: (t) => {
      K.pose(tsar, A.sit(t, 1, -2)); tsar.setFace(C.blinkEye(t, 1), 'frown');
      return U.film(t) + U.source(t, tNunca + 0.3, ctx.dur + 1, 'Leyes Fundamentales de 1906: el zar conserva el veto, nombra al gobierno y puede disolver la Duma');
    } },
  ];
  const inst = { scene: Sb, scenes: [Sb, Ps, F, Sv, Du, Th], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
const fade2 = (t, a, b, f = 0.35) => ss(a, a + f, t) * (1 - ss(b - f, b, t));
