import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as LP from '../../lib/props.js';
import * as F from '../../lib/fx.js';
import { ss, clamp } from '../../lib/util.js';
import { badge } from '../../lib/kit.js';
import * as X from '../props.js';
import * as K from '../kit.js';
import * as A from '../anim.js';
import { desert, columbusSet, aimSun } from '../sets.js';
import { runShots, wt } from '../shots.js';
import { film, nameplate } from '../ui.js';
import { mapSet, token, city, fade, GM } from '../mapkit.js';

export { preload } from '../mapkit.js';

const CITY = GM.CITY;
export function build(ctx) {
  const L = ctx.L;
  const tEn = wt(L[0], 'en$') - 0.2, tAt = wt(L[0], 'ataco') - 0.15, tPero = wt(L[1], 'pero') - 0.2, tNun = wt(L[1], 'nunca');
  // ---- map: retreat north, then the raid across the border
  const M = mapSet();
  const villaZone = ['Chihuahua', 'Durango'];
  const ev = [{ t: -1, names: ['Chihuahua', 'Durango', 'Zacatecas', 'Aguascalientes', 'Coahuila', 'Sonora', 'Sinaloa'], color: GM.FACTION.villista },
    { t: 1.6, names: ['Zacatecas', 'Aguascalientes', 'Coahuila', 'Sinaloa'], color: GM.FACTION.carrancista }, { t: 2.6, names: ['Sonora', 'Durango'], color: GM.FACTION.carrancista }];
  const back = GM.arrow([CITY['Celaya'], CITY['Aguascalientes'], CITY['Zacatecas'], CITY['Torreón'], CITY['Jiménez'], CITY['Chihuahua']], GM.ARROW.villista, 0.55); M.add(back);
  const raid = GM.arrow([CITY['Chihuahua'], [-107.2, 30.4], [-107.62, 31.1], CITY['Columbus']], GM.ARROW.villista, 0.45); M.add(raid);
  const vt = token(M, 'villa', 'villa', ...CITY['Celaya'], 'villista', 0, 1.6);
  const pathBack = new THREE.CatmullRomCurve3([CITY['Celaya'], CITY['Aguascalientes'], CITY['Zacatecas'], CITY['Torreón'], CITY['Jiménez'], CITY['Chihuahua']].map(([lo, la]) => new THREE.Vector3(...GM.pos(lo, la))), false, 'centripetal');
  // ---- Columbus, New Mexico at night
  const N = columbusSet();
  const raiders = []; for (let i = 0; i < 7; i++) raiders.push(K.person(N, ['doto', 'oguri', 'suzuka', 'helios', 'cafe', 'daiwa', 'mcqueen'][i], 'rebelde', -4.8 + i * 1.25, 3.0 + (i % 2) * 0.9, Math.PI - 0.25));
  const muz = raiders.map(r => new F.Muzzle(r.gun, 2.5)); muz.forEach((m, i) => m.fire(tAt + 0.2 + i * 0.15, L[1].t0));
  const fire = X.fireSprites(N, 18, { size: 1.1, rise: 2.2, spread: 2.4, life: 1.0 });
  const fireLight = new THREE.PointLight('#ff9a40', 0, 16, 1.4); fireLight.position.set(2, 3.5, -4.5); N.add(fireLight);
  const fireSmoke = X.smokeTrail(N, 12, { color: '#3c3a38', size: 0.9, rise: 6, drift: [1.5, 0, 0], life: 3.6, opacity: 0.5 });
  // ---- the Punitive Expedition crossing the desert
  const D = desert('day', { seed: 101, clear: [[0, 0, 9]] });
  const truck = LP.truck('#6a6a4a', '#8a8a62'); truck.rotation.y = Math.PI / 2; D.add(truck);
  const col = []; for (let i = 0; i < 10; i++) col.push(K.person(D, ['oguri', 'tamamo', 'helios', 'doto', 'daiwa'][i % 5], 'gringo', 0, 0, Math.PI / 2));
  const plane = X.biplane('#8a7a4a'); D.add(plane);
  const dust = X.smokeTrail(D, 10, { color: '#d8c49a', size: 0.6, rise: 0.8, drift: [-2, 0, 0], life: 2.0, opacity: 0.55 });
  const flagUS = X.flag('us', 2.6, 0.9, 0.58);
  // ---- Villa hiding in the sierra, watching them pass
  const S = desert('golden', { seed: 102, clear: [[0, 0, 6], [-3, -14, 8]] });
  for (const [x, z, r, sd] of [[0.35, -0.95, 0.75, 1], [-0.9, -1.05, 0.62, 2], [1.55, -0.55, 0.55, 3], [-2.1, -0.6, 0.5, 4], [2.6, 0.2, 0.42, 5]]) { const b = X.boulder(r, sd); b.position.x = x; b.position.z = z; S.add(b); }
  const hid = K.person(S, 'villa', 'villa', 0.55, -0.15, Math.PI + 0.35);
  const pals = [K.person(S, 'doto', 'adelita', -0.75, -0.25, Math.PI + 0.1)];
  const far = []; for (let i = 0; i < 8; i++) far.push(K.person(S, ['oguri', 'tamamo', 'helios', 'doto'][i % 4], 'gringo', 0, 0, -Math.PI / 2));
  const sfx = [{ t: 0.3, type: 'whoosh' }, { t: tEn + 0.2, type: 'pop' }, { t: tAt - 0.2, type: 'charge', vol: 0.8 },
    ...[0, 0.3, 0.55, 0.9, 1.2, 1.6, 1.9, 2.3, 2.8, 3.2].map((d, i) => ({ t: tAt + 0.2 + d, type: 'shot', vol: 0.5 + (i % 2) * 0.2 })), { t: tAt + 0.6, type: 'fire', dur: L[1].t0 - tAt, vol: 0.5 },
    { t: L[1].t0 - 0.2, type: 'march', dur: tPero - L[1].t0, vol: 0.6 }, { t: L[1].t0 + 0.5, type: 'engine', dur: tPero - L[1].t0 - 0.6, vol: 0.4 }, { t: L[1].t0 + 1.2, type: 'plane', dur: 3, vol: 0.5 },
    { t: tNun + 0.2, type: 'laugh', vol: 0.8 }];

  const shots = [
    { t0: 0, set: M, p0: [-2.6, 17, 14], l0: [-2.2, 0, 0.6], p1: [-3.2, 16, 11.5], l1: [-2.8, 0, -1.2], fov0: 40, act: (t) => {
      GM.paint(M.map, ev, t); raid.set(0);
      const p = clamp((t - 0.5) / 2.8); back.set(p); const q = pathBack.getPointAt(Math.max(0.001, p));
      vt.token.position.set(q.x, GM.H, q.z); vt.token.scale.setScalar(1.6); K.pose(vt, { ...C.idle(t, 1), gun: 'low' }); vt.setFace('flat', 'frown');
      return film(t) + city(ctx, M, 'Celaya', fade(t, 0, 1.6)) + city(ctx, M, 'Chihuahua', fade(t, 2.4, tEn));
    } },
    { t0: tEn, set: M, p0: [-5.6, 11.5, 2.0], l0: [-5.3, 0, -6.0], p1: [-5.7, 10.5, 1.0], l1: [-5.5, 0, -6.4], fov0: 40, act: (t) => {
      GM.paint(M.map, ev, t); back.set(1); vt.token.scale.setScalar(1.15);
      const p = clamp((t - tEn - 0.2) / 1.3); raid.set(p); vt.token.position.set(...GM.pos(...CITY['Chihuahua'])); vt.token.visible = true;
      K.pose(vt, { ...C.point(t, 1, -20), gun: 'back' }); vt.setFace('squint', 'grin');
      return film(t) + city(ctx, M, 'Columbus', fade(t, tEn + 0.6, tAt + 0.2), 'c big') + `<div style="position:absolute;left:50%;top:120px;transform:translateX(-50%);font:900 30px Inter;letter-spacing:.2em;color:#2a211b;opacity:${fade(t, tEn + 0.3, tAt + 0.2) * 0.8}">ESTADOS UNIDOS</div>`;
    } },
    { t0: tAt, set: N, p0: [7.2, 1.15, 5.4], l0: [-1.2, 1.4, -1.6], p1: [6.6, 1.1, 4.8], l1: [-1.2, 1.5, -1.6], fov0: 40, act: (t) => {
      const lt = t - tAt;
      raiders.forEach((r, i) => { K.pose(r, { ...C.aim(t, muz[i].recoil(t), i % 2), gun: 'aim' }); muz[i].update(t); r.setFace('squint', 'shout'); });
      const f = ss(0.4, 1.4, lt); fire(t, new THREE.Vector3(2, 2.7, -4.7), f);
      fireLight.intensity = 22 * f * (0.85 + 0.15 * Math.sin(t * 13)); fireSmoke(t, new THREE.Vector3(2, 3.6, -5.6), f); N.flag.wave(t);
      return film(t) + badge(t, '9 de marzo de 1916', 'Ataque a Columbus', 'Unos 500 villistas atacan este pueblo de Nuevo México', tAt + 0.4, L[1].t0 - 0.1);
    } },
    { t0: L[1].t0 - 0.25, set: D, p0: [0.8, 1.55, 8.6], l0: [-2.2, 1.6, 0], p1: [3.2, 1.6, 8.4], l1: [1.2, 1.7, 0], fov0: 40, act: (t, u, lt) => {
      const x0 = -1.5 + lt * 1.0; truck.position.set(x0 + 1.0, 0, -1.6);
      col.forEach((c, i) => { c.root.position.set(x0 - (i % 5) * 1.05 - 0.4, 0, 0.8 + Math.floor(i / 5) * 0.8); K.pose(c, { ...C.walkArmed(t, 0.75, i * 0.37), gun: 'port' }); c.setFace(C.blinkEye(t, i), 'neutral'); });
      dust(t, new THREE.Vector3(x0 - 0.4, 0.3, -1.6));
      plane.position.set(-10 + lt * 3.6, 3.3, -6.5); plane.rotation.set(0, Math.PI / 2, 0.05 * Math.sin(t)); plane.prop.rotation.z = t * 40;
      aimSun(D, 0, 0);
      return film(t) + badge(t, '1916 – 1917', 'La Expedición Punitiva', 'Unos 10 000 soldados de EE. UU. al mando del general Pershing', L[1].t0 + 0.3, tPero - 0.1);
    } },
    { t0: tPero, set: S, p0: [2.9, 0.95, 2.6], l0: [-1.4, 0.55, -9], p1: [2.7, 0.93, 2.3], l1: [-1.4, 0.55, -9], fov0: 40, act: (t, u, lt) => {
      const laughing = t > tNun + 0.25, turn = ss(tNun + 0.25, tNun + 0.6, t);
      hid.root.rotation.y = Math.PI + 0.35 - turn * 2.6;
      K.pose(hid, laughing ? { ...A.laugh(t, 1), hipY: -0.03, waist: [-4, 0, 0], thL: [-20, 0, 2], thR: [-20, 0, -2], knL: [30, 0, 0], knR: [30, 0, 0], gun: 'back' } : { ...C.crouch(t, 1, 0.5), gun: 'back' });
      hid.setFace(laughing ? 'happy' : 'squint', laughing ? 'teeth' : 'smile');
      pals.forEach((p, i) => { K.pose(p, { ...C.crouch(t, i + 2, 0.55), gun: 'back' }); p.setFace(laughing ? 'happy' : C.blinkEye(t, i), laughing ? 'grin' : 'neutral'); });
      far.forEach((c, i) => { c.root.position.set(3 - lt * 1.1 - (i % 4) * 1.0, 0, -13 - Math.floor(i / 4) * 0.8); K.pose(c, { ...C.walkArmed(t, 0.75, i * 0.4), gun: 'port' }); });
      aimSun(S, 0, -4);
      return film(t) + badge(t, '1917', 'Nunca lo atraparon', 'Las tropas de EE. UU. se retiran sin capturar a Villa', tNun - 0.2, ctx.dur);
    } },
  ];
  const inst = { scene: M, scenes: [M, N, D, S], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
