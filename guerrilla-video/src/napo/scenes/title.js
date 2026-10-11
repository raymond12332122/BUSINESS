import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as LP from '../../lib/props.js';
import { ss, clamp } from '../../lib/util.js';
import * as N from '../props.js';
import * as MX from '../../mx/props.js';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as FX from '../fx.js';
import * as A from '../../mx/anim.js';
import { horse, animateHorse, ridePose, seat } from '../horse.js';
import { Troop } from '../troops.js';
import { runShots, wt } from '../../mx/shots.js';
import { film, nameplate } from '../../mx/ui.js';
import { mapSet, city, fade, marker, GM } from '../mapkit.js';

export { preload } from '../mapkit.js';
const CITY = GM.CITY;

export function build(ctx) {
  const L = ctx.L;
  const tCor = wt(L[0], 'coron'), tLis = wt(L[1], 'lisboa'), tMos = wt(L[1], 'moscu'), tCasi = wt(L[1], 'casi'), tGue = wt(L[1], 'guerra');

  // ---- 1. Crossing the Alps (after David): rearing white horse, red cape, wind and snow
  const Al = S.alps('day'); S.mood(Al, { skyTop: '#3a6db8', skyHor: '#dfe8f0', fog: ['#e3eaf0', 70, 300] });
  for (const [x, z, k, sd] of [[-2.6, -1.6, 1.3, 3], [2.4, -2.4, 1.6, 5], [3.6, 0.6, 0.9, 7], [-3.8, 0.9, 0.8, 9]]) { const b = MX.boulder(k, sd, '#8d8a86'); b.position.set(x, 0, z); Al.add(b); }
  const hz = horse({ coat: '#f2eee6', mane: '#e4ddd0', cloth: '#9a1b2a', trim: '#d4af37', seed: 4 }); hz.position.set(0.25, 0, 0); hz.rotation.y = -Math.PI / 2 + 0.12; Al.add(hz);
  const nap = K.person(Al, 'napoleonAlps', 'napoleonAlps', 0, 0, 0);
  const snow = new FX.Snow(Al, { n: 700, box: [-7, 7, -0.5, 5, -5, 5], wind: [-3.2, -0.7, 0.3], size: 0.05 });
  // ---- 2. Imperial throne room: the new emperor
  const Th = S.palaceFR('#efe6d2', { imperial: true });
  const emp = K.person(Th, 'coronation', 'coronation', 0, -2.15, 0);
  // ---- 3. Europe 1812: from Lisbon to Moscow, everyone at war with him
  const M = mapSet({ per: '1812' });
  const west = GM.arrow([CITY['París'], CITY['Bayona'], CITY['Madrid'], CITY['Lisboa']], '#2f4590', 0.75); M.add(west);
  const east = GM.arrow([CITY['París'], CITY['Estrasburgo'], CITY['Berlín'], CITY['Vilna'], CITY['Smolensk'], CITY['Moscú']], '#2f4590', 0.75); M.add(east);
  const COAL = '#c0392b', coal = ['GBR', 'POR', 'ESP', 'AUT', 'PRU', 'RUS', 'SWE', 'SIC'];
  const ev = coal.map((p, i) => ({ t: tCasi + 0.05 + i * 0.2, pol: [p], color: COAL }));
  const booms = [['Trafalgar', 0], ['Austerlitz', 0.25], ['Jena', 0.5], ['Borodinó', 0.75], ['Leipzig', 1.0], ['Waterloo', 1.25], ['Zaragoza', 1.5]].map(([c, d]) => { const m = marker(M, ...CITY[c], 'swords', '#c0272d', 2.0); m.d = d; return m; });
  // ---- 4. The Grande Armée: emperor on horseback before his army
  const Ar = S.field('day', { ground: ['#9aae5e', '#8aa052'], seed: 31 });
  const hz2 = horse({ coat: '#efeae2', mane: '#ddd6c8', cloth: '#2a3f8f', trim: '#d4af37', seed: 6 }); hz2.position.set(0, 0, 0); hz2.rotation.y = 0.55; Ar.add(hz2);
  const rider = K.person(Ar, 'napoleon', 'napoleon', 0, 0, 0);
  const guards = [-1.5, 1.5].map((x, i) => K.person(Ar, ['doto', 'oguri'][i], 'grenadier', x, -0.6, 0));
  const flags = [];
  for (const [x, z] of [[-1.5, -1.6], [1.5, -1.6]]) { const f = N.flag('eagle', 2.4, 1.0, 0.72, { finial: 'eagle' }); f.position.set(x, 0, z); Ar.add(f); flags.push(f); }
  const troops = [[-9, -6], [0, -7], [9, -6], [-14, -14], [-4.5, -15], [4.5, -15], [14, -14]].map(([x, z], i) => { const tr = new Troop(Ar, { rows: 4, cols: 12, seed: 10 + i, hat: i < 3 ? 'bearskin' : 'shako', coat: i < 3 ? '#25336b' : '#2f4590' }); tr.x = x; tr.z = z; return tr; });
  const bigFlags = [[-9, -4.8], [0, -5.6], [9, -4.8], [-4.5, -13.5], [4.5, -13.5]].map(([x, z]) => { const f = N.flag('eagle', 3.2, 1.3, 0.85, { finial: 'eagle' }); f.position.set(x + 2.2, 0, z); Ar.add(f); return f; });

  const sfx = [{ t: 0.1, type: 'wind', dur: tCor - 0.2, vol: 0.7 }, { t: 0.9, type: 'neigh', vol: 0.8 }, { t: tCor - 0.05, type: 'sting2', vol: 0.6 },
    { t: tLis - 1.2, type: 'whoosh', vol: 0.6 }, { t: tMos - 0.6, type: 'whoosh', vol: 0.6 }, ...booms.map(b => ({ t: tGue - 0.6 + b.d, type: 'boom', vol: 0.35 })),
    { t: L[2].t0 - 0.5, type: 'drums', dur: ctx.dur - L[2].t0 + 0.4, vol: 0.7 }, { t: L[2].t0 - 0.1, type: 'sting', vol: 0.8 }];

  const tB = tCor - 0.08, tC = L[1].t0 - 0.15, tD = L[2].t0 - 0.45;
  const shots = [
    { t0: 0, set: Al, p0: [-1.25, 0.4, 6.6], l0: [-1.7, 1.05, 0], p1: [-1.05, 0.45, 5.7], l1: [-1.45, 1.1, 0], fov0: 34, act: (t) => {
      const rear = ss(0.2, 1.1, t) * (0.92 + 0.08 * Math.sin(t * 2.2));
      animateHorse(hz, t, 'stand', { rear, seed: 1 });
      const p = ridePose(t, 1); p.head = [0, 38, 0]; p.chest = [-4, 12, 0];
      K.pose(nap, { ...p, gun: 'none' }); seat(nap, hz, { upright: 0.65 }); nap.setFace(C.blinkEye(t, 2), 'neutral');
      nap.cape.wave(t, 0.95, -0.35); snow.update(t);
      S.aimSun(Al, 0, 0);
      const k = ss(0.8, 1.6, t) * (1 - ss(tB - 0.5, tB, t));
      return film(t) + (k > 0 ? `<div class="title" style="left:110px;right:auto;top:150px;text-align:left;opacity:${k};transform:translateX(${(1 - ss(0.8, 1.6, t)) * -30}px)"><div class="k">1803 – 1815 · CONTADAS CON CHIBIS</div><div class="h" style="font-size:124px">LAS GUERRAS<br>NAPOLEÓNICAS</div></div>` : '');
    } },
    { t0: tB, set: Th, p0: [0.45, 0.88, 1.1], l0: [0, 0.78, -2.2], p1: [0.32, 0.88, 0.5], l1: [0, 0.8, -2.2], fov0: 34, act: (t) => {
      const p = A.proud(t, 3); p.head = [-4, 6 * Math.sin(t * 0.5), 0]; K.pose(emp, p); emp.setFace(C.blinkEye(t, 3), 'neutral'); emp.cape.wave(t, 0.03, 0);
      return film(t) + nameplate(ctx, [0, 1.34, -2.15], 'Napoleón Bonaparte', 'Emperador de los franceses', tB + 0.35, tC + 0.2);
    } },
    { t0: tC, set: M, p0: [-3.2, 30, 19.5], l0: [-3.2, 0, 1.6], p1: [-3.2, 28, 17.6], l1: [-3.2, 0, 1.4], fov0: 38, act: (t) => {
      GM.paint(M.map, ev, t);
      west.set(clamp((t - (tLis - 1.3)) / 1.3)); east.set(clamp((t - (tMos - 0.9)) / 1.5));
      booms.forEach(b => b.update(t, tGue - 0.6 + b.d));
      const kl = fade(t, tCasi, ctx.dur);
      return film(t) + city(ctx, M, 'París', fade(t, tC + 0.3, ctx.dur), 'c big') + city(ctx, M, 'Lisboa', fade(t, tLis - 0.1, ctx.dur)) + city(ctx, M, 'Moscú', fade(t, tMos - 0.1, ctx.dur))
        + `<div style="position:absolute;left:80px;top:90px;opacity:${fade(t, tC + 0.4, ctx.dur)};font:800 26px Inter;color:#2a211b;background:rgba(243,234,214,.92);padding:14px 20px;border-radius:12px;line-height:1.7">
          <div><span style="display:inline-block;width:22px;height:22px;border-radius:5px;background:${GM.COLOR.FRA};vertical-align:-4px;margin-right:10px"></span>Imperio francés</div>
          <div><span style="display:inline-block;width:22px;height:22px;border-radius:5px;background:${GM.SAT};vertical-align:-4px;margin-right:10px"></span>Estados aliados de Napoleón</div>
          <div style="opacity:${kl}"><span style="display:inline-block;width:22px;height:22px;border-radius:5px;background:${COAL};vertical-align:-4px;margin-right:10px"></span>En guerra contra él</div></div>`;
    } },
    { t0: tD, set: Ar, p0: [-0.5, 1.0, 4.3], l0: [0, 1.15, -2], p1: [-0.3, 1.9, 9.8], l1: [0, 1.3, -4], fov0: 36, ease: 'out', act: (t) => {
      animateHorse(hz2, t, 'stand', { seed: 2 }); const p = ridePose(t, 2); p.armR = [-30, 40, 60]; p.elbR = [0, 100, 0]; K.pose(rider, { ...p, gun: 'none' }); seat(rider, hz2); rider.setFace(C.blinkEye(t, 4), 'neutral');
      guards.forEach((g, i) => { K.pose(g, { ...C.idle(t, i + 3, 0.4), gun: 'port' }); g.setFace(C.blinkEye(t, i + 5), 'neutral'); });
      flags.forEach((f, i) => f.wave(t + i)); bigFlags.forEach((f, i) => f.wave(t * 0.9 + i * 1.3));
      troops.forEach((tr, i) => tr.update(t, { x: tr.x, z: tr.z, march: 0 }));
      S.aimSun(Ar, 0, -4);
      const k = ss(L[2].t0 - 0.1, L[2].t0 + 0.5, t);
      return film(t) + `<div class="title" style="top:70px;opacity:${k};transform:scale(${0.94 + 0.06 * k})"><div class="k">ESTAS SON</div><div class="h" style="font-size:112px">LAS GUERRAS NAPOLEÓNICAS</div></div>`;
    } },
  ];
  const inst = { scene: Al, scenes: [Al, Th, M, Ar], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
