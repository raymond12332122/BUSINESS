import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import { badge, stat } from '../../lib/kit.js';
import * as N from '../props.js';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as A from '../../mx/anim.js';
import { runShots, wt } from '../../mx/shots.js';
import { film, doc } from '../../mx/ui.js';
import { mapSet, city, fade, stateLabel, GM } from '../mapkit.js';

export { preload } from '../mapkit.js';
const CITY = GM.CITY;

export function build(ctx) {
  const L = ctx.L;
  const tCon = wt(L[0], 'congreso'), tDib = wt(L[0], 'dibujar'), tMap = wt(L[0], 'mapa');
  const tCos = wt(L[1], 'costaron'), tMil = wt(L[1], 'millones'), tPero = wt(L[1], 'pero'), tCam = wt(L[1], 'cambiaron');
  const tCod = wt(L[2], 'codigo'), tLey = wt(L[2], 'leyes'), tMex = wt(L[2], 'mexico'), tIde = wt(L[2], 'ideas'), tIgu = wt(L[2], 'igualdad'), tExt = wt(L[2], 'extendieron');

  // ---- 1. The Congress of Vienna
  const V = S.vienna();
  const dipl = [[-1.3, -1.55, 0.1], [0, -1.6, 0], [1.3, -1.55, -0.1], [-2.05, -0.6, Math.PI / 2], [2.05, -0.6, -Math.PI / 2]].map(([x, z, y], i) =>
    K.person(V, ['zar', 'wellington', 'tamamo', 'oguri', 'doto', 'suzuka', 'daiwa'][i], i === 0 ? 'zar' : i === 1 ? 'wellington' : 'diplomat', x, z, y));
  const papers = [[-0.8, -0.45], [0.6, -0.2], [0, 0.1]].map(([x, z], i) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.3), new THREE.MeshStandardMaterial({ color: '#f3ead6' })); p.rotation.set(-Math.PI / 2, 0, i * 0.4); p.position.set(x, 0.526, z - 0.6); V.add(p); return p; });
  // ---- 2. The map is redrawn (1812 -> 1815)
  const M = mapSet({ per: '1812' });
  // ---- 3. Millions of lives
  const Me = S.memorial();
  // ---- 4. The Civil Code
  const Co = S.codeRoom();
  // ---- 5. Equality before the law spreads (map 1815)
  const M2 = mapSet({ per: '1815' });
  const order = ['FRA', 'NED', 'SUI', 'SAR', 'GER', 'ESP', 'POR', 'PAP', 'TUS', 'NAP', 'SIC', 'AUT', 'PRU', 'DEN', 'POL', 'SWE'];
  const ev2 = order.map((p, i) => ({ t: tIde + 0.1 + i * 0.16, pol: [p], color: '#f0c862' }));

  const sfx = [{ t: 0.2, type: 'crowd', dur: tDib, vol: 0.35 }, { t: tDib - 0.05, type: 'whoosh', vol: 0.6 }, { t: tCos - 0.2, type: 'drone', dur: tPero - tCos, vol: 0.4 },
    { t: tPero + 0.1, type: 'sting2', vol: 0.4 }, { t: tCod, type: 'pop', vol: 0.4 }, { t: tMex, type: 'pop', vol: 0.5 }, { t: tIde, type: 'sting', vol: 0.5 }];

  const tM = tDib - 0.9, tMe = L[1].t0 - 0.15, tC = tPero - 0.15, tM2 = tIde - 0.3;
  const shots = [
    { t0: 0, set: V, p0: [0.3, 1.42, 3.5], l0: [0, 0.78, -1.0], p1: [0.25, 1.38, 3.2], l1: [0, 0.8, -1.0], fov0: 42, act: (t) => {
      dipl.forEach((d, i) => { K.pose(d, (i + Math.floor(t * 0.8)) % 3 === 0 ? A.orate(t, i, 0.8) : C.idle(t, i, 0.5)); d.setFace(C.blinkEye(t, i), (i + Math.floor(t * 0.8)) % 3 === 0 ? C.talkMouth(t, i) : 'neutral'); });
      return film(t) + badge(t, '1814 – 1815', 'El Congreso de Viena', 'Los vencedores se reparten Europa', tCon - 0.2, tM - 0.1);
    } },
    { t0: tM, set: M, p0: [-1.5, 30, 20], l0: [-1.5, 0, 1.0], p1: [-1.5, 28.5, 18.5], l1: [-1.5, 0, 1.0], fov0: 38, act: (t) => {
      GM.setPeriod(M.map, t < tDib + 0.15 ? '1812' : '1815');
      const flash = Math.max(0, 1 - Math.abs(t - tDib - 0.15) * 5);
      return film(t) + `<div style="position:absolute;inset:0;background:#fbf5e6;opacity:${0.85 * flash}"></div>`
        + [['GER', 'Confederación Germánica', 0.3], ['NED', 'Países Bajos', 0.45], ['PRU', 'Prusia', 0.6], ['AUT', 'Austria', 0.75], ['RUS', 'Rusia', 0.9]].map(([pol, txt, d]) => { const k = fade(t, tDib + d, ctx.dur); const p = GM.labelPos(pol, M.map.per); if (k <= 0 || !p) return '';
          const [x, y, ok] = ctx.project(p); return ok ? `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%);opacity:${k};font:900 28px Inter;letter-spacing:.06em;color:#2a211b;text-shadow:0 0 6px #fbf5e6,0 0 12px #fbf5e6;white-space:nowrap">${txt}</div>` : ''; }).join('')
        + `<div style="position:absolute;left:80px;top:90px;font:900 64px 'Inter Display',Inter;color:#2a211b;opacity:${0.25 + 0.75 * fade(t, tM, ctx.dur)}">${t < tDib + 0.15 ? '1812' : '1815'}</div>`;
    } },
    { t0: tMe, set: Me, p0: [1.2, 1.4, 5.5], l0: [-0.5, 0.6, -6], p1: [0.8, 1.6, 4.5], l1: [-0.5, 0.6, -6], fov0: 40, act: (t) => {
      S.aimSun(Me, 0, -4);
      return film(t) + `<div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,.4) 100%)"></div>`
        + stat(760, 140, 'Entre 3 y 6 millones', 'de muertos, soldados y civiles', fade(t, tMil - 0.3, tC), '#f3d2a8');
    } },
    { t0: tC, set: Co, p0: [0.35, 1.45, 2.9], l0: [-0.45, 0.9, -0.6], p1: [0.3, 1.4, 2.4], l1: [-0.45, 0.92, -0.6], fov0: 38, act: (t) => {
      const k = ss(tC, tC + 1.0, t); Co.userData.sun.intensity = 0.35 + 0.5 * k;
      return film(t) + doc(t, tCod - 0.1, tM2, 'El Código Civil · 1804', [['Todos los ciudadanos, iguales ante la ley', tCod + 0.3], ['Inspiró leyes en Europa y América', tLey], ['México: Código Civil de 1870', tMex - 0.1]], { left: 1150, top: 120, width: 660 });
    } },
    { t0: tM2, set: M2, p0: [-2.5, 30, 20.5], l0: [-2.5, 0, 1.0], p1: [-2.0, 32, 22], l1: [-2.0, 0, 1.0], fov0: 38, act: (t) => {
      GM.paint(M2.map, ev2, t);
      return film(t) + city(ctx, M2, 'París', fade(t, tM2 + 0.2, ctx.dur), 'c big')
        + `<div style="position:absolute;left:50%;top:110px;transform:translateX(-50%) scale(${0.92 + 0.08 * ss(tIgu - 0.2, tIgu + 0.3, t)});opacity:${fade(t, tIgu - 0.3, ctx.dur)};text-align:center;background:rgba(20,16,14,.82);padding:18px 40px;border-radius:14px;border-bottom:6px solid #f0c862">
          <div style="font:800 24px Inter;letter-spacing:.3em;color:#ffb627">LAS IDEAS DE LA REVOLUCIÓN</div><div style="font:900 56px/1.1 'Inter Display',Inter;color:#fff">Igualdad ante la ley</div></div>`;
    } },
  ];
  const inst = { scene: V, scenes: [V, M, Me, Co, M2], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
