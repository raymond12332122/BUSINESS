import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as LP from '../../lib/props.js';
import * as F from '../../lib/fx.js';
import { ss, clamp } from '../../lib/util.js';
import { badge } from '../../lib/kit.js';
import * as N from '../props.js';
import * as MX from '../../mx/props.js';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as FX from '../fx.js';
import * as A from '../../mx/anim.js';
import { horse, animateHorse, ridePose, seat } from '../horse.js';
import { Troop } from '../troops.js';
import { runShots, wt } from '../../mx/shots.js';
import { film, nameplate, stamp } from '../../mx/ui.js';
import { mapSet, city, fade, marker, GM } from '../mapkit.js';

export { preload } from '../mapkit.js';
const CITY = GM.CITY;

export function build(ctx) {
  const L = ctx.L;
  const tBat = wt(L[0], 'batalla'), tBat2 = wt(L[0], 'batalla', 1), tDesp = wt(L[0], 'despues'), tEgi = wt(L[0], 'egipto');
  const tVol = wt(L[1], 'volvio'), tGol = wt(L[1], 'golpe'), tConv = wt(L[1], 'convirtio');
  const tCat = wt(L[2], 'catedral'), tPapa = wt(L[2], 'papa'), tPuso = wt(L[2], 'puso'), tCor = wt(L[2], 'corona');

  // ---- 1. Italy 1796-97: battle after battle
  const M = mapSet({ per: '1792' });
  const it = GM.arrow([CITY['Niza'], CITY['Lodi'], CITY['Castiglione'], CITY['Arcole'], CITY['Rivoli']], '#2f4590', 0.2); M.add(it);
  const wins = [['Lodi', 0], ['Castiglione', 0.45], ['Arcole', 0.9], ['Rivoli', 1.35]].map(([c, d]) => { const m = marker(M, ...CITY[c], 'swords', '#2f4590', 0.42); m.d = d; m.c = c; return m; });
  // ---- 2. Egypt 1798: the pyramids
  const E = S.egypt();
  const hz = horse({ coat: '#efeae2', mane: '#ddd6c8', cloth: '#2a3f8f', trim: '#d4af37', seed: 8 }); hz.position.set(0.3, 0, 0); hz.rotation.y = -0.5; E.add(hz);
  const napE = K.person(E, 'napoleonYoung', 'napoleonYoung', 0, 0, 0);
  const sq = [[-6, -9, 0.2], [5, -12, -0.2]].map(([x, z, yaw], i) => { const tr = new Troop(E, { rows: 4, cols: 9, seed: 30 + i, hat: 'bicorne', hatColor: '#151517' }); tr.x = x; tr.z = z; tr.yaw = yaw; return tr; });
  const flE = N.flag('fr', 2.8, 1.1, 0.7); flE.position.set(-6, 0, -7.2); E.add(flE);
  const fusE = [[-1.6, -1.2], [2.0, -1.6]].map(([x, z], i) => K.person(E, ['doto', 'helios'][i], 'fusilier', x, z, -0.2 + i * 0.3));
  // ---- 3. Back to Paris (map)
  const M2 = mapSet({ per: '1792' });
  const back = GM.arrow([CITY['Alejandría'], [20, 34.5], [12, 37.5], CITY['Fréjus'], CITY['Lyon'], CITY['París']], '#2f4590', 0.55); M2.add(back);
  // ---- 4. Saint-Cloud, 18 Brumaire: the coup
  const H = S.councilHall();
  const deps = []; for (let i = 0; i < 10; i++) { const [h, z] = H.tiers[i < 5 ? 0 : 1]; const d = K.person(H, ['doto', 'oguri', 'suzuka', 'helios', 'tamamo', 'mcqueen', 'daiwa'][i % 7], 'deputy', 0, z, 0); d.root.position.y = h; d.x0 = -4.4 + (i % 5) * 2.1 + (i >= 5 ? 1.0 : 0); deps.push(d); }
  const napH = K.person(H, 'napoleonYoung', 'napoleonYoung', 2.6, 2.4, -0.4);
  const gren = []; for (let i = 0; i < 6; i++) gren.push(K.person(H, ['oguri', 'helios', 'doto', 'tamamo', 'suzuka', 'daiwa'][i], 'grenadier', 3.0 + (i % 3) * 0.75, 3.4 + Math.floor(i / 3) * 0.8, -0.35));
  // ---- 5. Notre-Dame, 2 December 1804: he crowns himself
  const ND = S.notreDame();
  const emp = K.person(ND, 'coronationBare', 'coronationBare', 0, -7.4, 0);
  const crown = K.crown({ velvet: '#8a1f2a' }); crown.scale.setScalar(0.92); ND.add(crown);
  const pope = K.person(ND, 'papa', 'papa', -2.2, -7.05, 0.9);
  const throne = MX.chair(true); throne.position.set(-2.27, 0, -7.17); throne.rotation.y = 0.9; ND.add(throne);
  const guests = [-1, 1].map((sd, i) => { const tr = new Troop(ND, { rows: 3, cols: 9, seed: 50 + i, hat: 'none', musket: false, coat: i ? '#3a3f6a' : '#6a3a3f', pants: '#e8e2d4', belts: '#d4af37', spacing: [0.7, 0.7], jitter: 0.12 }); tr.sd = sd; return tr; });
  const crowd = [[-3.3, -5.2, 1.3], [-3.4, -3.6, 1.4], [3.3, -5.2, -1.3], [3.4, -3.6, -1.4], [-3.2, -2.0, 1.4], [3.2, -2.0, -1.4]].map(([x, z, y], i) => K.person(ND, ['doto', 'helios', 'tamamo', 'suzuka', 'oguri', 'daiwa'][i], i % 2 ? 'marshal' : 'diplomat', x, z, y));
  const jos = K.person(ND, 'josefina', 'josefina', 1.5, -6.2, -0.7);
  const stars = [...Array(10)].map((_, i) => { const s = F.bubble('✨', { bg: null, font: 160 }); s.visible = false; ND.add(s); return s; });

  const sfx = [{ t: tBat, type: 'cannon', vol: 0.5 }, { t: tBat2, type: 'cannon', vol: 0.5 }, { t: tDesp - 0.1, type: 'wind', dur: 3.0, vol: 0.4 }, { t: tDesp + 0.3, type: 'neigh', vol: 0.5 },
    { t: tVol - 0.6, type: 'whoosh', vol: 0.5 }, { t: tGol - 0.4, type: 'drums', dur: 1.6, vol: 0.6 }, { t: tGol + 0.1, type: 'thud', vol: 0.9 }, { t: tConv + 0.3, type: 'sting2', vol: 0.6 },
    { t: L[2].t0 - 0.3, type: 'choir', dur: ctx.dur - L[2].t0, vol: 0.5 }, { t: tCor + 0.15, type: 'sting', vol: 0.8 }, { t: tCor + 0.3, type: 'bells', dur: 2.6, vol: 0.4 }];

  const tE = tDesp - 0.15, tM2 = L[1].t0 - 0.12, tH = tGol - 0.55, tH2 = tConv - 0.1, tN = L[2].t0 - 0.2, tN2 = tPuso - 1.2;
    const shots = [
    { t0: 0, set: M, p0: [-3.9, 6.2, 10.0], l0: [-3.8, 0, 4.9], p1: [-3.7, 5.4, 9.0], l1: [-3.6, 0, 4.7], fov0: 38, act: (t) => {
      it.set(clamp((t - 0.3) / 2.6));
      wins.forEach(w => w.update(t, tBat - 0.25 + w.d));
      const list = wins.map(w => `<span style="opacity:${0.15 + 0.85 * ss(tBat - 0.25 + w.d, tBat + w.d, t)}">${w.c}</span>`).join(' · ');
      return film(t) + badge(t, '1796 – 1797', 'La campaña de Italia', list, 0.3, tE - 0.1) + city(ctx, M, 'Niza', fade(t, 0.3, tE), 'c');
    } },
    { t0: tE, set: E, p0: [1.6, 0.85, 5.2], l0: [0.0, 1.3, -6], p1: [1.2, 0.9, 4.2], l1: [0.0, 1.35, -6], fov0: 38, act: (t) => {
      animateHorse(hz, t, 'stand', { seed: 3 }); const p = ridePose(t, 3); p.head = [0, 22, 0]; K.pose(napE, { ...p, gun: 'none' }); seat(napE, hz); napE.setFace(C.blinkEye(t, 2), 'neutral');
      sq.forEach(tr => tr.update(t, { x: tr.x, z: tr.z, yaw: tr.yaw })); fusE.forEach((f, i) => { K.pose(f, { ...C.idle(t, i + 4, 0.5), gun: 'port' }); f.setFace(C.blinkEye(t, i + 4), 'neutral'); });
      flE.wave(t); S.aimSun(E, 0, -2);
      return film(t) + badge(t, '1798', 'La campaña de Egipto', 'Napoleón lleva su ejército hasta las pirámides', tE + 0.3, tM2 - 0.1);
    } },
    { t0: tM2, set: M2, p0: [2.4, 24, 26], l0: [2.4, 0, 9.4], p1: [1.6, 23, 24.5], l1: [1.6, 0, 8.8], fov0: 38, act: (t) => {
      back.set(clamp((t - tM2 - 0.2) / 2.0));
      return film(t) + city(ctx, M2, 'Alejandría', fade(t, tM2, tH), 'c') + city(ctx, M2, 'París', fade(t, tVol, tH), 'c big')
        + badge(t, 'Octubre de 1799', 'Regresa a Francia', 'Deja a su ejército en Egipto y vuelve a París', tM2 + 0.3, tH - 0.1);
    } },
    { t0: tH, set: H, p0: [0.4, 1.5, 6.4], l0: [0.4, 1.0, -2.5], p1: [0.2, 1.4, 5.6], l1: [0.4, 1.0, -2.5], fov0: 40, act: (t) => coup(t)
        + stamp(t, 'GOLPE DE ESTADO<br>18 DE BRUMARIO', tGol, tH2, { x: 1400, y: 260, rot: -6 }) },
    { t0: tH2, set: H, p0: [1.7, 1.0, 4.6], l0: [2.6, 0.95, 2.4], p1: [1.85, 1.0, 4.15], l1: [2.6, 0.95, 2.4], fov0: 36, act: (t) => coup(t)
        + badge(t, '1799', 'Primer Cónsul', 'El hombre más poderoso de Francia', tConv + 0.1, tN) },
    { t0: tN, set: ND, p0: [0.0, 1.5, -1.6], l0: [0, 1.25, -8.5], p1: [0.0, 1.4, -2.7], l1: [0, 1.2, -8.5], fov0: 42, act: (t) => coro(t)
        + badge(t, '2 de diciembre de 1804', 'La coronación', 'Catedral de Notre Dame, París', tN + 0.4, tPapa - 0.2)
        + nameplate(ctx, [-2.2, 1.3, -7.05], 'Pío VII', 'El Papa', tPapa - 0.15, tN2) },
    { t0: tN2, set: ND, p0: [0.75, 0.95, -4.5], l0: [0, 0.92, -7.4], p1: [0.6, 0.95, -4.9], l1: [0, 0.95, -7.4], fov0: 36, act: (t) => coro(t) },
  ];
  function coup(t) {
    const enter = clamp((t - tGol + 0.4) / 1.8);
    deps.forEach((d, i) => { const flee = clamp((t - tGol - 0.2 - (i % 3) * 0.15) / 2.2); d.root.position.x = d.x0 - flee * 7; d.root.rotation.y = flee > 0 ? -Math.PI / 2 : 0;
      K.pose(d, flee > 0 && flee < 1 ? C.run(t, 1, i) : t > tGol - 0.6 ? A.handsUp(t, i) : A.orate(t, i, 0.6)); d.setFace(t > tGol - 0.6 ? 'shock' : C.blinkEye(t, i), t > tGol - 0.6 ? 'scream' : C.talkMouth(t, i)); });
    gren.forEach((g, i) => { g.root.position.z = 3.4 + Math.floor(i / 3) * 0.8 - enter * 3.2; K.pose(g, enter > 0 && enter < 1 ? { ...C.walkArmed(t, 1, i), gun: 'port' } : { ...C.idle(t, i, 0.4), gun: 'port' }); g.setFace('squint', 'neutral'); });
    const stepIn = clamp((t - tH2 + 0.2) / 1.2); napH.root.position.set(2.6, 0, 2.4 - stepIn * 0.2); K.pose(napH, stepIn > 0 ? A.proud(t, 5) : C.point(t, 5, -20)); napH.setFace(C.blinkEye(t, 5), stepIn > 0 ? 'smile' : 'shout');
    H.flag.wave(t * 0.4);
    return film(t);
  }
  const crownAt = (y, z) => emp.attach('head', crown, [0, y, z]);
  function coro(t) {
    const lift = clamp((t - tPuso + 0.1) / 0.55), down = clamp((t - tCor - 0.05) / 0.45);
    if (t < tPuso - 0.1) { K.pose(emp, C.offer(t, 2, 1)); crownAt(0.14, 0.24); }
    else { const p = C.idle(t, 2, 0.3); const k = 1 - down; p.armL = [-150 * k - 20 * (1 - k), 0, -40 * k - 70 * (1 - k)]; p.armR = [-150 * k - 20 * (1 - k), 0, 40 * k + 70 * (1 - k)]; p.elbL = [0, -10, 0]; p.elbR = [0, 10, 0]; K.pose(emp, p);
      if (down < 1) crownAt(0.14 + (1.24 - 0.14) * Math.sin(lift * Math.PI / 2) - (1.24 - 0.84) * down * down, 0.24 - 0.26 * lift); else if (!emp.crowned) { crownAt(0.84, -0.02); emp.crowned = true; } }
    if (t < tPuso - 0.1) emp.crowned = false;
    emp.setFace(t > tCor + 0.3 ? 'happy' : C.blinkEye(t, 2), t > tCor + 0.3 ? 'smile' : 'neutral'); emp.cape.wave(t, 0.02, 0);
    { const p = A.sit(t, 3, 0); p.armR = t > tCor ? [-40, 30, 30] : [-38, 0, 70]; p.elbR = t > tCor ? [0, 60, 0] : [0, 30, 0]; K.pose(pope, p); pope.root.position.y = 0.06; } pope.setFace(C.blinkEye(t, 3), 'neutral');
    crowd.forEach((c, i) => { K.pose(c, t > tCor + 0.2 ? A.clap(t, i) : C.idle(t, i, 0.4)); c.setFace(t > tCor + 0.2 ? 'happy' : C.blinkEye(t, i + 6), t > tCor + 0.2 ? 'smile' : 'neutral'); });
    K.pose(jos, A.humble(t, 7)); jos.setFace(C.blinkEye(t, 7), t > tCor + 0.2 ? 'smile' : 'neutral');
    const sp = t - tCor - 0.3; emp.root.updateMatrixWorld(true); const hp = new THREE.Vector3(); crown.getWorldPosition(hp);
    stars.forEach((s, i) => { const k = sp / 1.4; s.visible = k > 0 && k < 1; if (!s.visible) return; const a = i / stars.length * Math.PI * 2;
      s.position.set(hp.x + Math.cos(a) * (0.2 + k * 0.6), hp.y + 0.1 + Math.sin(a) * (0.2 + k * 0.5), hp.z + 0.1); const sc = 0.22 * Math.sin(k * Math.PI); s.scale.set(sc, sc, 1); });
    guests.forEach(g => g.update(t, { x: g.sd * 3.9, z: -4.2, yaw: -g.sd * Math.PI / 2 }));
    ND.nave.candles.forEach((c, i) => c.scale.set(1, 1.8 + 0.3 * Math.sin(t * 9 + i * 2), 1));
    return film(t);
  }
  const inst = { scene: M, scenes: [M, E, M2, H, ND], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
