import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as LP from '../../lib/props.js';
import * as F from '../../lib/fx.js';
import { ss, clamp } from '../../lib/util.js';
import { badge } from '../../lib/kit.js';
import * as X from '../props.js';
import * as K from '../kit.js';
import * as A from '../anim.js';
import { morelos, zocalo, interior, mxStage, aimSun, mood } from '../sets.js';
import { runShots, wt } from '../shots.js';
import { film, nameplate, timeline, stamp } from '../ui.js';
import { mapSet, token, city, fade, GM } from '../mapkit.js';

export { preload } from '../mapkit.js';

const CITY = GM.CITY;
export function build(ctx) {
  const L = ctx.L;
  const tEn = wt(L[0], 'en$') - 0.2, tZap = wt(L[0], 'zapata'), tEmb = wt(L[0], 'emboscada');
  const tObr = wt(L[1], 'y', 0) - 0.1, tMuch = wt(L[1], 'muchos') - 0.2, tFin = wt(L[1], 'fin');
  const names = ['madero', 'zapata', 'carranza', 'villa', 'obregon'].map(n => wt(L[2], n));
  // ---- Chinameca at dusk
  const H = morelos('dusk', { cane: true, seed: 121 });
  const hac = X.hacienda(); hac.position.set(0, 0, -9); H.add(hac);
  const wall = new THREE.Group(); for (const x of [-6.5, 6.5]) wall.add(LP.at(LP.box(9, 2.2, 0.5, '#d8c4a0'), x * 1.0, 1.1, -5.2)); H.add(wall);
  for (const x of [-2.2, 2.2]) H.add(LP.at(LP.box(0.8, 3.0, 0.8, '#d8c4a0'), x, 1.5, -5.2));
  H.add(LP.at(LP.box(5.2, 0.5, 0.9, '#d8c4a0'), 0, 3.2, -5.2));
  const guards = [-5.8, -4.6, -3.4, 3.4, 4.6, 5.8].map((x, i) => { const g = K.person(H, ['oguri', 'tamamo', 'helios', 'doto', 'daiwa', 'cafe'][i], 'constitucionalista', x, -5.0, 0); g.root.position.y = 2.2; return g; });
  const gMuz = guards.map(g => new F.Muzzle(g.gun, 3)); gMuz.forEach(m => m.fire(tEmb + 0.05, tEmb + 0.9));
  const zap = K.person(H, 'zapata', 'zapata', 0, 0, Math.PI), esc = [K.person(H, 'doto', 'zapatista', -0.9, 0.7, Math.PI), K.person(H, 'helios', 'zapatista', 0.9, 0.7, Math.PI)];
  const fallen = K.sombrero('charro'); fallen.scale.setScalar(0.8); fallen.rotation.set(0.25, 0.4, 0.15); fallen.position.set(0, 0.05, 0.5); H.add(fallen); fallen.visible = false;
  // ---- map: Carranza flees and falls
  const M = mapSet();
  const flee = GM.arrow([CITY['Ciudad de México'], [-98.5, 19.6], [-97.85, 20.15]], GM.ARROW.carrancista, 0.42); M.add(flee);
  const ct = token(M, 'carranza', 'carranza', ...CITY['Ciudad de México'], 'carrancista', 0, 1.2);
  const cross = F.bubble('✝', { bg: null, font: 190, fg: '#2a211b' }); M.add(cross);
  const fleePath = new THREE.CatmullRomCurve3([CITY['Ciudad de México'], [-98.5, 19.6], [-97.85, 20.15]].map(([lo, la]) => new THREE.Vector3(...GM.pos(lo, la))), false, 'centripetal');
  // ---- Obregón, president
  const Z = zocalo('day'); const [bx, by, bz] = Z.palacio.balcony;
  const obr = K.person(Z, 'obregon', 'obregon', bx, bz - 16 + 0.1, 0); obr.root.position.y = by; obr.attach('chest', K.sash(), [0, 0.4, 0]);
  const crowd = []; for (let i = 0; i < 12; i++) crowd.push(K.person(Z, ['doto', 'oguri', 'tamamo', 'helios', 'cafe', 'suzuka'][i % 6], i % 3 ? 'campesino' : 'politico', -5 + (i % 6) * 2, -9.6 + Math.floor(i / 6) * 1.5, Math.PI));
  // ---- end of the armed phase: Zócalo at dusk with a timeline
  const Zd = zocalo('dusk');
  // ---- the gallery of the fallen
  const G = interior({ wall: '#2e2420', floor: '#1e1712', w: 14, d: 8, h: 4.4, lights: [], windows: false, bulbs: false });
  G.userData.sun.intensity = 0.2; G.userData.hemi.intensity = 0.45;
  const who = [['madero', 'Madero', '1913'], ['zapata', 'Zapata', '1919'], ['carranza', 'Carranza', '1920'], ['villa', 'Villa', '1923'], ['obregon', 'Obregón', '1928']];
  const gal = who.map(([k, n, y], i) => { const x = -4.4 + i * 2.2; const ped = X.pedestal(n, '✝ ' + y); ped.position.set(x, 0, -1.2); G.add(ped);
    const r = K.person(G, k, k, x, -1.2, 0); r.root.position.y = ped.top; const sp = new THREE.SpotLight('#ffe7c0', 30, 9, 0.32, 0.5, 1.2); sp.position.set(x, 4.2, 1.2); sp.target.position.set(x, 1.4, -1.2); G.add(sp, sp.target); return { r, sp, x }; });

  const sfx = [{ t: 0.3, type: 'drone', dur: tEmb - 0.5, vol: 0.45 }, { t: tEmb + 0.05, type: 'shot', vol: 0.9 }, { t: tEmb + 0.2, type: 'shot', vol: 0.8 }, { t: tEmb + 0.38, type: 'shot', vol: 0.8 }, { t: tEmb + 0.6, type: 'shot', vol: 0.7 },
    { t: L[1].t0 - 0.3, type: 'bell', vol: 0.7 }, { t: tObr + 0.2, type: 'cheer', vol: 0.8 }, { t: tFin, type: 'thud', vol: 0.9 }, ...names.map(t => ({ t, type: 'bell', vol: 0.5 }))];

  const shots = [
    { t0: 0, set: H, p0: [2.0, 1.25, 7.0], l0: [0, 1.6, -5], p1: [1.4, 1.2, 5.4], l1: [0, 1.7, -5], fov0: 38, act: (t, u, lt) => {
      const z = 3.0 - lt * 0.45; zap.root.position.z = z; esc.forEach((e, i) => (e.root.position.z = z + 0.7));
      K.pose(zap, { ...C.walk(t, 0.55, 0), gun: 'low' }); esc.forEach((e, i) => K.pose(e, { ...C.walk(t, 0.55, 0.4 + i), gun: 'low' }));
      guards.forEach((g, i) => K.pose(g, { ...C.idle(t, g.seed), gun: 'port' })); aimSun(H, 0, -4);
      return film(t) + badge(t, '10 de abril de 1919', 'Emboscada en Chinameca', 'Zapata cae en una trampa de las tropas de Carranza', tEn, tEmb - 0.4);
    } },
    { t0: tEmb - 0.5, set: H, p0: [-2.6, 2.6, -2.2], l0: [-4.6, 2.9, -5.0], p1: [-2.5, 2.6, -2.4], l1: [-4.6, 2.9, -5.0], fov0: 40, act: (t) => {
      guards.forEach((g, i) => { K.pose(g, { ...C.aim(t, gMuz[i].recoil(t), 0), gun: 'aim' }); gMuz[i].update(t); g.setFace('squint', 'neutral'); }); aimSun(H, 0, -4);
      return film(t);
    } },
    { t0: tEmb + 0.75, set: H, p0: [1.0, 1.25, 3.4], l0: [0, 0.15, 0.4], p1: [0.85, 1.15, 3.0], l1: [0, 0.15, 0.4], fov0: 36, act: (t) => {
      fallen.visible = true; zap.root.visible = false; esc.forEach(e => (e.root.visible = false)); aimSun(H, 0, -4);
      return film(t) + `<div style="position:absolute;inset:0;background:rgba(0,0,0,${0.15 + 0.2 * ss(tEmb + 0.8, L[1].t0, t)})"></div>`;
    } },
    { t0: L[1].t0 - 0.3, set: M, p0: [1.6, 9, 9.0], l0: [3.2, 0, 2.6], p1: [1.9, 8.2, 8.0], l1: [3.4, 0, 2.4], fov0: 40, act: (t) => {
      zap.root.visible = true; esc.forEach(e => (e.root.visible = true)); fallen.visible = false;
      const p = clamp((t - L[1].t0) / 1.4); flee.set(p); const q = fleePath.getPointAt(Math.max(0.001, p)); ct.token.position.set(q.x, GM.H, q.z);
      K.pose(ct, { ...C.idle(t, 1), gun: 'none' }); ct.setFace('flat', 'frown');
      const [x, , z] = GM.pos(-97.85, 20.15); cross.position.set(x, 1.4, z); F.popSprite(cross, t, L[1].t0 + 1.5, tObr, 0.9, 1.6);
      return film(t) + city(ctx, M, 'Ciudad de México', fade(t, L[1].t0 - 0.2, tObr)) + badge(t, 'Mayo de 1920', 'Muere Carranza', 'Asesinado en Tlaxcalantongo, Puebla, cuando huía hacia Veracruz', L[1].t0 + 0.4, tObr);
    } },
    { t0: tObr, set: Z, p0: [1.6, 2.4, -5.8], l0: [0, 4.6, -13.9], p1: [1.2, 2.7, -7.2], l1: [0, 4.65, -13.9], fov0: 38, act: (t) => {
      K.pose(obr, C.wave(t, 1, 'R')); obr.setFace(C.blinkEye(t, 1), 'smile'); Z.flag.wave(t); aimSun(Z, 0, -6);
      crowd.forEach((c, i) => K.pose(c, C.cheer(t + i * 0.3, i)));
      return film(t) + nameplate(ctx, [bx, by + 1.6, bz - 16 + 0.1], 'Álvaro Obregón', 'Presidente', tObr + 0.3, tMuch) + badge(t, '1 de diciembre de 1920', 'Obregón, presidente', 'Llega al poder tras la caída de Carranza', tObr + 0.6, tMuch);
    } },
    { t0: tMuch, set: Zd, p0: [8, 3.0, 8], l0: [0, 3.0, -14], p1: [6, 2.7, 6.5], l1: [0, 3.0, -14], fov0: 40, act: (t) => {
      Zd.flag.wave(t); aimSun(Zd, 0, -6);
      const items = [['1910', 'Plan de San Luis', tMuch + 0.3], ['1913', 'Decena Trágica', tMuch + 0.7], ['1914', 'Cae Huerta', tMuch + 1.1], ['1917', 'Constitución', tMuch + 1.5], ['1920', 'Obregón, presidente', tMuch + 1.9]];
      return film(t) + timeline(t, tMuch, L[2].t0 - 0.1, items, clamp((t - tMuch - 0.2) / 1.8)) + stamp(t, 'FIN DE LA ETAPA ARMADA', tFin, L[2].t0 - 0.1, { x: 960, y: 330, rot: -4 });
    } },
    { t0: L[2].t0 - 0.1, set: G, p0: [0, 1.95, 8.8], l0: [0, 1.35, -1.2], p1: [0, 1.9, 8.2], l1: [0, 1.35, -1.2], fov0: 40, act: (t) => {
      gal.forEach(({ r, sp }, i) => { const k = ss(names[i], names[i] + 0.5, t); K.tint(r, new THREE.Color('#ffffff').lerp(new THREE.Color('#6d655c'), k).getStyle()); sp.intensity = 30 - 22 * k;
        K.pose(r, { ...(i === 3 ? C.idle(t, r.seed) : A.proud(t, r.seed)), gun: 'none' }); r.setFace(k > 0.5 ? 'flat' : C.blinkEye(t, r.seed), 'neutral'); });
      return film(t);
    } },
  ];
  const inst = { scene: H, scenes: [H, M, Z, Zd, G], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
