import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as LP from '../../lib/props.js';
import { ss, clamp } from '../../lib/util.js';
import { badge } from '../../lib/kit.js';
import * as X from '../props.js';
import * as K from '../kit.js';
import * as A from '../anim.js';
import { desert, morelos, plaza, port, aimSun } from '../sets.js';
import { runShots, wt } from '../shots.js';
import { film, nameplate } from '../ui.js';
import { mapSet, token, city, spark, fade, GM } from '../mapkit.js';

export { preload } from '../mapkit.js';

export function build(ctx) {
  const L = ctx.L;
  const tNorte = wt(L[0], 'norte'), tOro = wt(L[0], 'pascual'), tVilla = wt(L[0], 'francisco'), tPancho = wt(L[0], 'pancho'), tSur = wt(L[0], 'sur') - 0.35, tZap = wt(L[0], 'emiliano');
  const tJua = wt(L[1], 'tomaron'), tRen = wt(L[2], 'renunci'), tNunca = wt(L[2], 'nunca');
  // ---- map: the spark spreads
  const M = mapSet();
  const sparks = [['Chihuahua', 0.6], ['Durango', 1.0], ['Torreón', 1.3], ['Hermosillo', 1.6], ['Cuernavaca', 1.9], ['Puebla', 2.2], ['Zacatecas', 2.4]].map(([n, d]) => ({ s: spark(M, ...GM.CITY[n]), t: d }));
  const ev = [['Chihuahua', 0.6], ['Durango', 1.0], ['Coahuila', 1.3], ['Sonora', 1.6], ['Morelos', 1.9], ['Puebla', 2.2], ['Guerrero', 2.3], ['Zacatecas', 2.4]].map(([n, d]) => ({ t: d, names: [n], color: GM.FACTION.maderista }));
  const juarezArrow = GM.arrow([GM.CITY['Chihuahua'], [-106.6, 30.1], GM.CITY['Ciudad Juárez']], GM.ARROW.maderista, 0.5); M.add(juarezArrow);
  // ---- north: Orozco and Villa with their men
  const N = desert('golden', { seed: 51, clear: [[0, 2, 7]] });
  const villa = K.person(N, 'villa', 'villa', 0.75, 2.2, -0.15), orozco = K.person(N, 'helios', 'orozco', -0.85, 2.0, 0.2);
  const men = []; for (let i = 0; i < 8; i++) { const x = -4.2 + i * 1.2 + (i > 3 ? 1.8 : 0), z = 0.2 - Math.abs(i - 3.5) * 0.12; men.push(K.person(N, ['doto', 'oguri', 'suzuka', 'daiwa', 'cafe', 'mcqueen', 'tamamo', 'doto'][i], 'rebelde', x, z, 0)); }
  const flagN = X.flag('mx', 3.2, 1.2, 0.75); flagN.position.set(-2.6, 0, 0.6); N.add(flagN);
  // ---- south: Zapata in Morelos
  const S = morelos('day', { cane: true, seed: 52 });
  const zapata = K.person(S, 'zapata', 'zapata', 0, 2.5, 0);
  const zmen = []; for (let i = 0; i < 6; i++) zmen.push(K.person(S, ['doto', 'helios', 'tamamo', 'cafe', 'suzuka', 'daiwa'][i], 'zapatista', -3.2 + i * 1.3 + (i > 2 ? 0.9 : 0), 1.0 - Math.abs(i - 2.5) * 0.1, 0));
  // ---- Ciudad Juárez taken
  const Jz = plaza('day', 53);
  const jFlag = X.flag('mx', 3.6, 1.4, 0.85); jFlag.position.set(0.6, 0, -1.4); Jz.add(jFlag);
  const jmen = []; for (let i = 0; i < 9; i++) jmen.push(K.person(Jz, i === 4 ? 'tamamo' : ['doto', 'oguri', 'suzuka', 'daiwa', 'cafe', 'mcqueen', 'helios', 'doto', 'oguri'][i], i === 4 ? 'villa' : 'rebelde', -3.6 + i * 0.9, 1.0 + (i % 2) * 0.7, 0));
  const smokes = [[-8, -10], [6, -12], [10, -6]].map(([x, z]) => ({ f: X.smokeTrail(Jz, 10, { color: '#7d756c', size: 0.9, rise: 7, drift: [1.5, 0, 0], life: 4, opacity: 0.55 }), o: new THREE.Vector3(x, 2.5, z) }));
  // ---- Díaz leaves from Veracruz
  const P = port('dusk');
  const ship = X.steamship('#4a4440', { funnels: 2, funnel: '#c9a227' }); ship.scale.setScalar(1.3); ship.rotation.y = Math.PI / 2; ship.position.set(0, 0, 13); P.add(ship);
  const fill = new THREE.DirectionalLight('#ffd2a8', 1.3); fill.position.set(-6, 8, -14); P.add(fill, fill.target); fill.target.position.set(0, 1, 12);
  const diaz = K.person(ship, 'diaz', 'diaz', 0.95, -4.6, Math.PI / 2); diaz.root.position.y = 1.6; diaz.root.scale.setScalar(1 / 1.3);
  const shipSmoke = ship.funnelTops.map(() => X.smokeTrail(P, 10, { color: '#5d5a58', size: 0.7, rise: 4, drift: [-3, 0, 0], life: 3.4, opacity: 0.6 }));
  const wavers = [0, 1, 2].map(i => K.person(P, ['doto', 'cafe', 'suzuka'][i], 'politico', 2.2 + i * 0.9, 4.6 + (i % 2) * 0.7, Math.PI - 0.25)); wavers.forEach(w => (w.root.position.y = 0.5));

  const sfx = [{ t: 0.3, type: 'whoosh' }, ...sparks.map(({ t }) => ({ t, type: 'pop', vol: 0.6 })), { t: tNorte - 0.2, type: 'wind', dur: tSur - tNorte, vol: 0.4 },
    { t: tPancho + 0.3, type: 'cheer', vol: 0.7 }, { t: L[1].t0 + 0.6, type: 'shot', vol: 0.6 }, { t: L[1].t0 + 1.0, type: 'shot', vol: 0.5 }, { t: L[1].t0 + 1.6, type: 'boom', vol: 0.7 },
    { t: tJua + 0.4, type: 'cheer', vol: 0.9 }, { t: L[2].t0 - 0.6, type: 'waves', dur: 7, vol: 0.5 }, { t: L[2].t0 + 0.5, type: 'whistle', vol: 0.6 }];

  const shots = [
    { t0: 0, set: M, p0: [-1.5, 30, 18], l0: [-1.5, 0, 1.5], p1: [-1, 27, 15.5], l1: [-1.2, 0, 1.2], fov0: 38, act: (t) => {
      sparks.forEach(({ s, t: d }) => s.update(t, d)); GM.paint(M.map, ev, t); juarezArrow.set(0);
      return film(t) + badge(t, 'Noviembre de 1910', 'Estalla la revolución', 'Levantamientos en el norte y en el sur', 0.9, tNorte - 0.35);
    } },
    { t0: tNorte - 0.25, set: N, p0: [0.4, 1.3, 9.0], l0: [-0.2, 1.0, 1.2], p1: [0.2, 1.25, 7.6], l1: [-0.1, 1.0, 1.4], fov0: 36, act: (t) => {
      K.pose(villa, { ...C.idle(t, 1), gun: 'low' }); villa.setFace(C.blinkEye(t, 1), t > tPancho ? 'grin' : 'smile');
      K.pose(orozco, { ...C.idle(t, 2), gun: 'port' }); orozco.setFace(C.blinkEye(t, 2), 'neutral');
      men.forEach((c, i) => { const cheer = t > tPancho + 0.2 && i % 2 === 0; K.pose(c, cheer ? { ...C.cheer(t + i * 0.3, i), gun: 'back' } : { ...C.idle(t, c.seed), gun: i % 3 ? 'low' : 'port' }); c.setFace(cheer ? 'happy' : C.blinkEye(t, c.seed), cheer ? 'teeth' : 'neutral'); });
      flagN.wave(t); aimSun(N, 0, 2);
      return film(t) + nameplate(ctx, [-0.85, 1.5, 2.0], 'Pascual Orozco', 'Chihuahua', tOro - 0.2, tSur - 0.2) + nameplate(ctx, [0.75, 1.55, 2.2], 'Francisco «Pancho» Villa', 'Chihuahua', tVilla - 0.1, tSur - 0.2);
    } },
    { t0: tSur - 0.2, set: S, p0: [1.0, 1.25, 7.6], l0: [0, 1.0, 1.6], p1: [0.7, 1.2, 6.6], l1: [0, 1.0, 1.8], fov0: 36, act: (t) => {
      K.pose(zapata, { ...C.idle(t, 3), gun: 'low' }); zapata.setFace(C.blinkEye(t, 3), 'neutral');
      zmen.forEach((c, i) => { K.pose(c, { ...C.idle(t, c.seed), gun: i % 2 ? 'port' : 'low' }); c.setFace(C.blinkEye(t, c.seed), 'neutral'); });
      aimSun(S, 0, 2);
      return film(t) + nameplate(ctx, [0, 1.62, 2.5], 'Emiliano Zapata', 'Morelos', tZap - 0.1, L[1].t0 - 0.3);
    } },
    { t0: L[1].t0 - 0.2, set: M, p0: [-4.6, 13.5, 4.2], l0: [-4.0, 0, -4.9], p1: [-4.5, 12, 3.0], l1: [-4.0, 0, -5.3], fov0: 38, act: (t) => {
      sparks.forEach(({ s }) => (s.visible = false)); GM.paint(M.map, ev, t);
      juarezArrow.set(clamp((t - L[1].t0 - 0.2) / 2.0));
      return film(t) + city(ctx, M, 'Chihuahua', fade(t, L[1].t0, tJua + 0.3)) + city(ctx, M, 'Ciudad Juárez', fade(t, L[1].t0 + 0.6, tJua + 0.4), 'c big');
    } },
    { t0: tJua + 0.3, set: Jz, p0: [2.4, 1.2, 7.6], l0: [-0.2, 1.3, 0.6], p1: [2.0, 1.15, 6.8], l1: [-0.2, 1.3, 0.6], fov0: 40, act: (t) => {
      jmen.forEach((c, i) => { K.pose(c, { ...C.cheer(t + i * 0.27, i), gun: 'back' }); c.setFace(i % 3 ? 'happy' : 'sparkle', 'teeth'); });
      jFlag.wave(t); smokes.forEach(({ f, o }, i) => f(t + i, o)); aimSun(Jz, 0, 0);
      return film(t) + badge(t, '10 de mayo de 1911', 'Cae Ciudad Juárez', 'Los rebeldes toman la ciudad fronteriza', tJua + 0.6, L[2].t0 - 0.1);
    } },
    { t0: L[2].t0 - 0.3, set: P, p0: [-3.3, 2.95, 8.0], l0: [-5.6, 2.75, 11.8], p1: [-3.6, 2.9, 8.5], l1: [-5.7, 2.75, 11.8], fov0: 36, act: (t) => {
      ship.position.set(0, 0, 13); K.pose(diaz, C.wave(t, 4, 'L')); diaz.setFace(C.blinkEye(t, 4, 'flat'), 'frown');
      ship.funnelTops.forEach((v, i) => shipSmoke[i](t + i, ship.localToWorld(v.clone()))); aimSun(P, 0, 4);
      return film(t) + badge(t, '25 de mayo de 1911', 'Díaz renuncia', 'Sale de Veracruz rumbo a Francia en el vapor Ypiranga', tRen, tNunca - 0.1);
    } },
    { t0: tNunca - 0.35, set: P, p0: [3.4, 2.6, -2.4], l0: [1.5, 1.9, 13], p1: [3.6, 2.6, -2.2], l1: [4.5, 2.0, 13], fov0: 38, act: (t) => {
      const sail = Math.max(0, t - tNunca + 0.6); ship.position.set(sail * 1.6 + sail * sail * 0.25, 0, 13 + sail * 0.6);
      K.pose(diaz, C.wave(t, 4, 'L')); diaz.setFace('flat', 'frown');
      wavers.forEach((c, i) => { K.pose(c, { ...C.wave(t + i, i, i % 2 ? 'L' : 'R'), gun: 'none' }); });
      ship.funnelTops.forEach((v, i) => shipSmoke[i](t + i, ship.localToWorld(v.clone()))); aimSun(P, 0, 4);
      return film(t) + badge(t, '1915', 'Muere en el exilio', 'Porfirio Díaz murió en París y nunca regresó a México', tNunca + 0.2, ctx.dur);
    } },
  ];
  const inst = { scene: M, scenes: [M, N, S, Jz, P], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
