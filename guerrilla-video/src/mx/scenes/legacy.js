import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as LP from '../../lib/props.js';
import * as F from '../../lib/fx.js';
import { ss, clamp } from '../../lib/util.js';
import { badge, stat } from '../../lib/kit.js';
import * as X from '../props.js';
import * as K from '../kit.js';
import * as A from '../anim.js';
import { mxStage, plaza, desert, aimSun } from '../sets.js';
import { runShots, wt } from '../shots.js';
import { film, nameplate, card } from '../ui.js';
import { mapSet, fade, GM } from '../mapkit.js';

export { preload } from '../mapkit.js';

const CITY = GM.CITY;
export function build(ctx) {
  const L = ctx.L;
  const tMil = wt(L[0], 'millon'), tY = wt(L[0], 'y', 0) - 0.15, tRep = wt(L[1], 'reparto'), tDer = wt(L[1], 'derechos'), tMex = wt(L[1], 'mexico'), tVi = wt(L[2], 'villa'), tZa = wt(L[2], 'zapata'), tAd = wt(L[2], 'adelitas'), tLey = wt(L[2], 'leyenda');
  // ---- crosses and cempasúchil at dusk
  const D = mxStage('dusk', ['#6a5a48', '#5e4f3e'], { seed: 131 });
  D.add(X.sierra({ z: -70, depth: 40, height: 10, seed: 132, base: '#4a3e3e', top: '#6a5a5a' }));
  for (let i = 0; i < 42; i++) { const r = LP.rng(i + 7); const x = -9 + (i % 7) * 3 + (r() - 0.5) * 0.8, z = -2 - Math.floor(i / 7) * 2.6 + (r() - 0.5) * 0.6; const c = X.cross(i); c.position.set(x, 0, z); D.add(c);
    const fl = X.cempasuchil(8, i); fl.position.set(x, 0, z + 0.25); fl.scale.setScalar(0.7); D.add(fl); }
  const candles = []; for (let i = 0; i < 14; i++) { const r = LP.rng(i + 40); const m = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffcf6a' })); m.scale.y = 1.8; m.position.set(-8 + r() * 16, 0.22, -1.6 - r() * 14); D.add(m); D.add(LP.at(LP.cyl(0.03, 0.03, 0.18, '#f3ead6', 6), m.position.x, 0.09, m.position.z)); candles.push(m); }
  // ---- map: migration north
  const M = mapSet({ railways: false });
  const routes = [[[-103.3, 20.7], [-106.5, 27], [-110.9, 31.3], [-112, 33.4]], [[-101.7, 21.1], [-103.4, 25.5], [-106.4, 31.7], [-106.6, 33.5]], [[-100.3, 25.7], [-99.5, 27.5], [-98.5, 29.4], [-97.7, 31.0]],
    [[-99.1, 19.4], [-100.9, 22.1], [-99.5, 27.5], [-96.8, 32.8]], [[-104.7, 24.0], [-106.4, 31.7], [-108.5, 33.2]], [[-102.6, 22.8], [-104.9, 27.1], [-106.4, 31.7], [-104.5, 32.9]]];
  const arrows = routes.map(r => { const a = GM.arrow(r, '#7a5a3a', 0.32); M.add(a); return a; });
  // ---- what was born: a festive plaza
  const P = plaza('day', 133);
  for (const z of [-3, 0.5]) { const b = X.bunting(14); b.position.set(0, 3.4, z); P.add(b); }
  const ej = X.banner('TIERRA · TRABAJO · EDUCACIÓN', { w: 5.2, h: 0.65, size: 60, bg: '#f3ead6', fg: '#2a2320', accent: '#1f7a3a' }); ej.position.set(0, 2.5, -5); P.add(ej);
  const fest = []; for (let i = 0; i < 12; i++) fest.push(K.person(P, ['doto', 'oguri', 'tamamo', 'helios', 'cafe', 'suzuka', 'daiwa', 'mcqueen'][i % 8], ['campesino', 'politico', 'campesino', 'adelita'][i % 4], -4.2 + (i % 6) * 1.65, -1.6 + Math.floor(i / 6) * 1.6, 0));
  // ---- legends at sunset
  const S = desert('golden', { seed: 134, clear: [[0, 0, 7]] });
  const villa = K.person(S, 'villa', 'villa', -1.05, 0.2, 0.25), zapata = K.person(S, 'zapata', 'zapata', 0.05, -0.2, 0), adel = K.person(S, 'adelita', 'adelita', 1.1, 0.25, -0.25);
  const flg = X.flag('mx', 3.8, 1.5, 0.95); flg.position.set(-0.4, 0, -1.4); S.add(flg);
  const shine = new THREE.PointLight('#ffd9a0', 4, 8, 1.5); shine.position.set(0, 2.2, 2); S.add(shine);

  const sfx = [{ t: 0.4, type: 'wind', dur: L[0].t0 + 5.5, vol: 0.4 }, { t: tMil, type: 'bell', vol: 0.6 }, { t: tY + 0.2, type: 'whoosh' }, { t: tRep - 0.1, type: 'pop' }, { t: tDer - 0.1, type: 'pop' }, { t: tMex - 0.1, type: 'pop' },
    { t: L[1].t0, type: 'cheer', vol: 0.6 }, { t: tLey - 0.2, type: 'sting', vol: 0.8 }];

  const shots = [
    { t0: 0, set: D, p0: [0.6, 1.3, 4.6], l0: [0, 0.6, -6], p1: [0.3, 1.6, 3.2], l1: [0, 0.7, -8], fov0: 40, act: (t) => {
      candles.forEach((m, i) => m.scale.set(1, 1.8 + 0.3 * Math.sin(t * 13 + i), 1)); aimSun(D, 0, -4);
      const n = Math.round(1000000 * ss(tMil - 0.6, tMil + 0.7, t)).toLocaleString('es-MX').replace(/,/g, '\u2009');
      return film(t) + stat(960, 260, '≈ ' + n, 'muertos entre 1910 y 1920', ss(tMil - 0.8, tMil - 0.4, t) * (1 - ss(tY - 0.3, tY, t)), '#ffd27a');
    } },
    { t0: tY, set: M, p0: [-2.5, 17, 11], l0: [-2.5, 0, -3.2], p1: [-2.5, 16, 9.5], l1: [-2.5, 0, -3.6], fov0: 40, act: (t) => {
      arrows.forEach((a, i) => a.set(clamp((t - tY - 0.2 - i * 0.18) / 1.4)));
      return film(t) + stat(960, 170, 'Cientos de miles', 'huyeron a Estados Unidos', fade(t, tY + 0.4, L[1].t0 - 0.1), '#ffffff');
    } },
    { t0: L[1].t0 - 0.2, set: P, p0: [0.3, 1.4, 6.2], l0: [0, 1.4, -2], p1: [0.2, 1.35, 5.0], l1: [0, 1.4, -2], fov0: 40, act: (t) => {
      fest.forEach((c, i) => { K.pose(c, i % 3 ? C.cheer(t + i * 0.3, i) : A.clap(t, i)); c.setFace(i % 2 ? 'happy' : 'sparkle', 'teeth'); }); aimSun(P, 0, -2);
      const cards = [['🌽', 'Reparto de tierras', tRep], ['🛠️', 'Derechos laborales', tDer], ['🇲🇽', 'El México moderno', tMex]];
      return film(t) + `<div style="position:absolute;left:0;right:0;top:110px;display:flex;justify-content:center;gap:26px">${cards.map(([ic, tx, tt]) => { const k = ss(tt - 0.1, tt + 0.25, t) * (1 - ss(L[2].t0 - 0.3, L[2].t0, t));
        return `<div style="opacity:${k};transform:translateY(${(1 - k) * 30}px);background:rgba(32,25,20,.9);border-bottom:6px solid #e0b84a;border-radius:14px;padding:18px 26px;color:#fff;font:900 34px Inter;text-align:center;min-width:300px"><div style="font-size:56px;line-height:1.1">${ic}</div>${tx}</div>`; }).join('')}</div>`;
    } },
    { t0: L[2].t0 - 0.15, set: S, p0: [1.8, 0.85, 4.4], l0: [0, 1.15, 0], p1: [-1.2, 0.9, 4.0], l1: [0, 1.2, 0], fov0: 36, act: (t) => {
      K.pose(villa, { ...A.proud(t, 1), gun: 'back' }); villa.setFace(C.blinkEye(t, 1), 'smile');
      K.pose(zapata, { ...C.idle(t, 2), gun: 'low' }); zapata.setFace(C.blinkEye(t, 2), 'neutral');
      K.pose(adel, { ...C.idle(t, 3), gun: 'port' }); adel.setFace(C.blinkEye(t, 3), 'smile');
      flg.wave(t); aimSun(S, 0, 4);
      return film(t) + nameplate(ctx, [-1.05, 1.62, 0.2], 'Pancho Villa', '', tVi - 0.1, ctx.dur) + nameplate(ctx, [0.05, 1.66, -0.2], 'Emiliano Zapata', '', tZa - 0.1, ctx.dur) + nameplate(ctx, [1.1, 1.6, 0.25], 'Las Adelitas', '', tAd - 0.1, ctx.dur)
        + `<div class="title" style="top:70px;opacity:${ss(tLey - 0.1, tLey + 0.4, t)}"><div class="h" style="font-size:96px">LEYENDAS</div></div>`;
    } },
  ];
  const inst = { scene: D, scenes: [D, M, P, S], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
