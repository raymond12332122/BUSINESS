import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as P from '../../lib/props.js';
import * as F from '../../lib/fx.js';
import { stage, aimSun, mood } from '../../lib/stage.js';
import { camPath, ss, clamp, along, yawTo, lerp } from '../../lib/util.js';
import { cast, badge, label, partTimes } from '../../lib/kit.js';
import * as W from '../kit.js';
import { preload as pre, board, place, mapLabel, M } from '../mapkit.js';

export const preload = pre;

export function build(ctx) {
  const L = ctx.L;
  const base = [
    { t: -1, names: M.expand(['germany', 'poland', 'france', 'benelux', 'nordic_occ', 'balkans']), color: M.COLORS.occupied }, { t: -1, names: ['Germany', 'Austria'], color: M.COLORS.axis },
    { t: -1, names: ['United Kingdom'], color: M.COLORS.allies }, { t: -1, names: ['Russia', 'Georgia', 'Armenia', 'Azerbaijan', 'Kazakhstan'], color: M.COLORS.ussr },
    { t: -1, names: ['Ukraine', 'Belarus', 'Moldova', 'Lithuania', 'Latvia', 'Estonia'], color: M.COLORS.occupied },
    { t: -1, names: M.expand(['neutral']), color: M.COLORS.neutral }, { t: -1, names: [...M.expand(['axis_minor']), 'Italy'], color: M.COLORS.axis_minor },
  ];
  // ---------------------------------------------------------- map
  const Mp = stage({ groundA: null, skyTop: '#4a6fa8', skyHor: '#cfe0ea', fog: ['#cfe0ea', 60, 200], sunPos: [6, 18, 10], sun: 2.3, hemi: 1.3, shadow: 30 });
  const map = board(Mp);
  const toOil = M.arrow([[33, 48.5], [38, 46.5], [42, 44.5], [45.5, 43.2]], '#3b3f46', 1.0);
  const toSta = M.arrow([[35, 49.5], [40, 49.0], [44.2, 48.8]], '#3b3f46', 1.0);
  const back = [M.arrow([[44, 48.6], [39, 48.8], [33, 49.5], [27, 50.2]], '#c0453a', 1.2), M.arrow([[36, 54.5], [31, 54.2], [26, 53.8]], '#c0453a', 1.0)];
  [toOil, toSta, ...back].forEach(a => Mp.add(a));
  const oil = F.bubble('🛢️', { font: 130 }); Mp.add(oil);
  // ---------------------------------------------------------- ruined city
  const R = stage({ skyTop: '#59627a', skyHor: '#b9b2a6', groundA: '#9a9182', groundB: '#857d70', fog: ['#aaa398', 15, 90], sunPos: [6, 12, 8], sun: 1.8, hemi: 1.15, shadow: 18, seed: 281 });
  for (let i = 0; i < 26; i++) { const r = P.rng(i)(); const b = W.ruin(300 + i, 2 + r * 1.2, 2 + r * 2.4); const a = i / 26 * Math.PI * 2; const d = 9 + (i % 3) * 3.5; b.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); b.rotation.y = r * 3; R.add(b); }
  for (let i = 0; i < 5; i++) { const b = W.ruin(400 + i, 1.6, 1.2); const a = -0.6 - i * 0.55; b.position.set(Math.cos(a) * 6.6, 0, Math.sin(a) * 6.6); R.add(b); }
  const fires = [[-5, 0.3, 5], [6, 0.3, -2], [2, 0.3, 9]].map((p, i) => new F.Explosion(R, p, -5, 0.8, 290 + i, { fire: 1, smokeColor: '#3f3d3b' }));
  const ger = ['mcqueen', 'daiwa', 'suzuka', 'helios', 'daiwa', 'suzuka'].map((k, i) => W.soldier(cast(R, k, null), 'de', { gun: i > 0 }));
  const sov = []; for (let i = 0; i < 12; i++) sov.push(W.soldier(cast(R, i % 2 ? 'oguri' : 'tamamo', null), 'su'));
  const muz = [...ger.slice(1), ...sov.slice(0, 4)].map(c => new F.Muzzle(c.gun, 5));
  const ringL = M.arrow([[-2, -12], [-11, -7], [-12, 2], [-6, 9], [0, 10]], '#c0453a', 1.4, 0.06, true);
  const ringR = M.arrow([[2, -12], [11, -7], [12, 2], [6, 9], [0, 10]], '#c0453a', 1.4, 0.06, true);
  R.add(ringL, ringR);
  const wflag = P.flag('#ffffff', 1.8); R.add(wflag);
  const snowR = W.snow(R, 900, [-12, -10, 12, 12], 8, 9);

  const p1 = partTimes(L[1], ['La batalla se peleó calle por calle, entre ruinas.', 'Los soviéticos rodearon al Sexto Ejército alemán,', 'que se rindió en febrero de mil novecientos cuarenta y tres.']);
  const tCity = L[0].t1 + 0.2, tRing = p1[1], tSurr = p1[2], tBack = L[2].t0 - 0.2;
  muz.forEach((m, i) => m.fire(tCity + 0.2 + i * 0.13, tRing - 0.3));
  const sfx = [{ t: 0.5, type: 'whoosh' }, ...muz.flatMap((m, i) => m.shots().filter((_, j) => j % 2 === 0).map(t => ({ t, type: 'shot', vol: 0.25 }))),
    { t: tCity + 1.0, type: 'boom', vol: 0.5 }, { t: tRing, type: 'tension' }, { t: tSurr, type: 'wind', dur: tBack - tSurr, vol: 0.6 }, { t: tBack, type: 'whoosh' }];

  function update(t) {
    let html = '';
    if (t < tCity || t >= tBack) {
      this.current = Mp;
      const after = t >= tBack;
      M.paint(map, after ? [...base, { t: tBack + 0.8, names: ['Ukraine'], color: M.COLORS.ussr }] : base, t);
      toOil.set(after ? 1 : ss(1.0, 3.6, t)); toSta.set(after ? 1 : ss(2.4, 4.6, t));
      back.forEach((a, i) => a.set(after ? ss(tBack + 0.3 + i * 0.3, tBack + 2.6, t) : 0));
      const [ox, , oz] = [M.proj(46, 43)[0], 0, M.proj(46, 43)[1]]; oil.position.set(ox, 0, oz); F.popSprite(oil, t, 2.2, tCity, 1.6, 3.2);
      camPath(ctx.camera, after ? [{ t: tBack, p: [8, 13, 15], l: [9, 0, 1.5], fov: 46 }, { t: ctx.dur, p: [7, 14, 16], l: [8, 0, 1.5], fov: 46 }]
        : [{ t: 0, p: [10, 11, 15], l: [12, 0, 2.6], fov: 44 }, { t: tCity, p: [11, 10, 13.5], l: [12.5, 0, 2.6], fov: 42 }], t);
      aimSun(Mp, 11, 1);
      html += mapLabel(ctx, 44.5, 49.5, 'Stalingrado', ss(3.4, 3.8, t), 'r', 0.5) + mapLabel(ctx, 45.5, 42.2, 'Petróleo del Cáucaso', ss(2.4, 2.8, t) * (after ? 0 : 1), 'n', 0.5);
      if (!after) html += badge(t, 'Verano de 1942', 'Rumbo al petróleo', 'Sin petróleo, no hay tanques ni aviones', 1.0, tCity);
      else html += badge(t, '1943–1944', 'Ahora retrocede Alemania', 'El Ejército Rojo empuja hacia el oeste', tBack + 0.3, ctx.dur);
    } else {
      this.current = R;
      const winter = ss(tRing, tRing + 1.2, t);
      mood(R, { skyHor: winter > 0.5 ? '#c3cad4' : '#b9b2a6', fog: [winter > 0.5 ? '#c3cad4' : '#aaa398', 15, 90], sun: lerp(1.8, 1.1, winter), hemi: lerp(1.15, 1.25, winter) });
      R.children.forEach(o => { if (o.isMesh && o.geometry?.type === 'PlaneGeometry' && o.material?.vertexColors) o.material.color.setScalar(lerp(1, 1.5, winter)); });
      snowR.visible = winter > 0.3; snowR.update(t, 1);
      fires.forEach(f => f.update(t));
      const close = ss(tRing, tSurr, t);
      ger.forEach((c, i) => {
        const a = i / ger.length * Math.PI * 2;
        const x = Math.cos(a) * 1.6, z = Math.sin(a) * 1.6 + 0.5;
        c.root.position.set(x, 0, z); c.root.rotation.y = Math.atan2(x, z - 0.5);
        const surr = t > tSurr;
        let p = surr ? C.tired(t, i) : t < tRing ? { ...C.aim(t, muz[i - 1] ? muz[i - 1].recoil(t) : 0, i % 2), gun: 'aim' } : { ...C.lookAround(t, i), gun: 'low' };
        if (surr && i === 0) { p = C.idle(t, 0); p.armR = [-20, 0, -35]; p.elbR = [0, 0, -60]; }
        c.apply(p); c.setFace(surr ? 'flat' : t > tRing ? 'shock' : 'squint', surr ? 'frown' : t > tRing ? 'small' : 'neutral');
        if (muz[i - 1]) muz[i - 1].update(t);
      });
      wflag.position.set(0.2, 0, 0.6); wflag.visible = t > tSurr + 0.3; P.waveFlag(wflag, t);
      sov.forEach((c, i) => {
        const a = i / sov.length * Math.PI * 2, R0 = lerp(9.5, 4.2, close);
        c.root.position.set(Math.cos(a) * R0, 0, Math.sin(a) * R0 + 0.5); c.root.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a));
        const mz = muz[5 + i]; c.apply({ ...C.aim(t, mz ? mz.recoil(t) : 0, t < tRing ? 1 : 0), gun: 'aim' }); if (mz) mz.update(t);
        c.setFace(t > tSurr ? 'happy' : 'squint', t > tSurr ? 'smile' : 'neutral');
      });
      ringL.set(ss(tRing, tRing + 2.2, t)); ringR.set(ss(tRing + 0.1, tRing + 2.3, t));
      camPath(ctx.camera, [
        { t: tCity, p: [3.6, 1.6, 4.6], l: [0, 0.8, 0.3], fov: 46 },
        { t: tRing - 0.3, p: [2.8, 1.8, 5.0], l: [0, 0.8, 0.3], fov: 46 },
        { t: tRing + 0.2, p: [0, 22, 12], l: [0, 0, 0.5], fov: 46 },
        { t: tSurr - 0.2, p: [0, 23, 12], l: [0, 0, 0.5], fov: 46 },
        { t: tSurr + 0.2, p: [2.2, 1.6, 4.8], l: [0, 0.7, 0.5], fov: 40 },
        { t: tBack, p: [2.6, 1.7, 5.3], l: [0, 0.7, 0.5], fov: 40 },
      ], t);
      aimSun(R, 0, 0);
      html += badge(t, 'Stalingrado · 1942', 'Calle por calle', 'Una de las batallas más sangrientas de la historia', tCity + 0.3, tRing);
      html += label(ctx, [0, 1.6, 0.5], '6.º Ejército alemán', 'a', ss(tRing + 0.6, tRing + 1.0, t) * (1 - ss(tSurr - 0.4, tSurr, t)));
      html += label(ctx, [0, 1.2, -11], 'Cerco soviético', 'r', ss(tRing + 1.6, tRing + 2.0, t) * (1 - ss(tSurr - 0.4, tSurr, t)));
      html += badge(t, '2 de febrero de 1943', 'Rendición en Stalingrado', 'Unos 91 000 soldados alemanes capturados', tSurr + 0.3, tBack);
    }
    return html;
  }
  const inst = { scene: Mp, scenes: [Mp, R], sfx };
  inst.update = update.bind(inst);
  return inst;
}
