import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as LP from '../../lib/props.js';
import * as F from '../../lib/fx.js';
import { ss, clamp } from '../../lib/util.js';
import { badge } from '../../lib/kit.js';
import * as X from '../props.js';
import * as K from '../kit.js';
import * as A from '../anim.js';
import { mxStage, zocalo, interior, aimSun } from '../sets.js';
import { runShots, wt } from '../shots.js';
import { film, nameplate } from '../ui.js';

export function build(ctx) {
  const L = ctx.L;
  const tTra = wt(L[1], 'traicion') - 0.1, tHu = wt(L[2], 'huerta') - 0.15;
  // ---- Decena Trágica: artillery in the streets of Mexico City
  const D = mxStage('overcast', ['#a89f90', '#9a9182'], { seed: 71, hemi: 0.75, sun: 1.1, fog: ['#a9a59c', 25, 110] });
  const cols = ['#a8705a', '#b8a070', '#b8907a', '#a8825f', '#9a8070'];
  for (let i = 0; i < 6; i++) { const a = X.townhouse(3.4, 3.4 + (i % 2) * 0.6, cols[i % 5], i); a.position.set(-5.2, 0, 8 - i * 3.6); a.rotation.y = Math.PI / 2; D.add(a);
    const b = X.townhouse(3.4, 3.2 + ((i + 1) % 2) * 0.7, cols[(i + 2) % 5], i + 7); b.position.set(5.2, 0, 8 - i * 3.6); b.rotation.y = -Math.PI / 2; D.add(b); }
  const ciu = new THREE.Group(); ciu.add(LP.at(LP.box(9, 5, 3, '#8f8676'), 0, 2.5, 0)); ciu.add(LP.at(LP.box(3, 7, 3, '#8f8676'), 0, 3.5, 0.2));
  for (let i = 0; i < 7; i++) ciu.add(LP.at(LP.box(0.5, 0.9, 0.05, '#2a2622'), -3.6 + i * 1.2, 3.2, 1.52)); ciu.position.set(0, 0, -16); D.add(ciu); // La Ciudadela
  const can = X.cannon(); can.scale.setScalar(1.3); can.position.set(-1.2, 0, 2.2); can.rotation.y = Math.PI; D.add(can);
  const sb = X.sandbags(7, 2); sb.position.set(0.6, 0, 1.2); D.add(sb);
  const fed = [0, 1, 2].map(i => K.person(D, ['oguri', 'tamamo', 'helios'][i], 'federal', 0.0 + i * 0.75, 1.75 + (i % 2) * 0.2, Math.PI));
  const muz = fed.map(c => new F.Muzzle(c.gun, 4)); muz.forEach((m, i) => m.fire(1.0 + i * 0.4, 7.5));
  const booms = [[1.4, [-4.4, 2.6, 5.5]], [2.9, [4.3, 1.6, 7.5]], [4.4, [-2.4, 0.4, 9.5]], [5.7, [4.4, 3.0, 3.0]], [6.9, [-4.3, 1.8, 8.5]]].map(([t0, p], i) => new F.Explosion(D, p, t0, 1.2, 70 + i, { fire: 0.6, light: 0.2 }));
  const canFlash = [0.8, 3.6, 6.3];
  const canSmoke = X.smokeTrail(D, 10, { color: '#a8a39b', size: 0.6, rise: 2.5, drift: [0.5, 0, -1.5], life: 2.6, opacity: 0.55 });
  const flash = new THREE.PointLight('#ffcf8a', 0, 18, 1.4); flash.position.set(-1.2, 1.5, 0.6); D.add(flash);
  // ---- palace: Huerta and Madero
  const P = interior({ wall: '#7a2f2a', floor: '#5a3a24', w: 12, d: 9, h: 4.6, lights: [[-2, 4.0, 0], [2, 4.0, 0]] });
  const madero = K.person(P, 'madero', 'presidente', -0.75, -0.6, 0.85), huerta = K.person(P, 'huerta', 'huerta', 0.75, -0.9, -0.85);
  const guards = [0, 1].map(i => K.person(P, ['oguri', 'tamamo'][i], 'federal', 1.6 + i * 0.7, -2.2 - i * 0.4, -0.7));
  // ---- memorial for Madero
  const N = mxStage('night', ['#4a4438', '#3e392f'], { seed: 72 });
  const cr = X.cross(1); cr.scale.setScalar(1.9); cr.position.set(0, 0, -0.7); N.add(cr);
  const fl = X.cempasuchil(22, 3); fl.position.set(0, 0, 0.42); fl.scale.set(1.6, 1, 0.6); N.add(fl);
  const candles = [-0.55, -0.3, 0.3, 0.55].map((x, i) => { const g = new THREE.Group(); g.add(LP.at(LP.cyl(0.035, 0.035, 0.18 + (i % 2) * 0.06, '#f3ead6', 8), 0, 0.1, 0));
    const fla = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffcf6a' })); fla.scale.y = 1.8; fla.position.y = 0.24 + (i % 2) * 0.06; g.add(fla); g.position.set(x, 0, 0.25 + (i % 2) * 0.12); N.add(g); return fla; });
  const glow = new THREE.PointLight('#ffb862', 3, 6, 1.6); glow.position.set(0, 0.5, 0.6); N.add(glow);
  const portrait = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.0), new THREE.MeshStandardMaterial({ map: X.canvasTex(320, 400, (g, W, H) => {
    g.fillStyle = '#2a2018'; g.fillRect(0, 0, W, H); g.strokeStyle = '#c9a227'; g.lineWidth = 14; g.strokeRect(10, 10, W - 20, H - 20);
    g.fillStyle = '#e8dcc0'; g.textAlign = 'center'; g.font = '800 40px Georgia'; g.fillText('Francisco I.', W / 2, 170); g.fillText('Madero', W / 2, 220); g.font = '600 34px Georgia'; g.fillStyle = '#c9a227'; g.fillText('1873 – 1913', W / 2, 290); }), roughness: 0.7 }));
  portrait.scale.setScalar(0.62); portrait.position.set(0, 0.42, -0.05); portrait.rotation.x = -0.18; N.add(portrait);
  N.add(LP.at(LP.box(0.07, 0.5, 0.05, '#4a3220'), 0, 0.25, -0.2, 0.25, 0, 0));
  // ---- Huerta, dictator on the balcony
  const Z = zocalo('overcast'); const [bx, by, bz] = Z.palacio.balcony;
  const dict = K.person(Z, 'huerta', 'huerta', bx, bz - 16 + 0.1, 0); dict.root.position.y = by; dict.attach('chest', K.sash(), [0, 0.4, 0]);
  const ranks = []; for (let i = 0; i < 12; i++) ranks.push(K.person(Z, ['oguri', 'tamamo', 'helios', 'doto'][i % 4], 'federal', -4.4 + (i % 6) * 1.75, -9.6 + Math.floor(i / 6) * 1.5, Math.PI));

  const sfx = [{ t: 0.4, type: 'boom', vol: 0.8 }, ...canFlash.map(t => ({ t, type: 'boom', vol: 1.0 })), ...booms.map(b => ({ t: b.t0, type: 'bigboom', vol: 0.7 })),
    { t: 1.0, type: 'shot', vol: 0.5 }, { t: 2.2, type: 'shot', vol: 0.5 }, { t: 4.1, type: 'shot', vol: 0.5 }, { t: 5.3, type: 'shot', vol: 0.5 },
    { t: tTra, type: 'sting2', vol: 0.9 }, { t: L[2].t0 - 0.2, type: 'bell', vol: 0.6 }, { t: tHu + 0.2, type: 'drone', dur: 3.5, vol: 0.5 }];

  const shots = [
    { t0: 0, set: D, p0: [1.6, 1.1, -4.6], l0: [-0.1, 1.0, 3.5], p1: [1.3, 1.05, -3.8], l1: [-0.1, 1.05, 3.5], fov0: 42,
      shake: t => 0.035 * [...canFlash, ...booms.map(b => b.t0)].reduce((a, c) => a + Math.max(0, 1 - Math.abs(t - c - 0.05) * 5), 0), act: (t) => {
      fed.forEach((c, i) => { K.pose(c, { ...C.aim(t, muz[i].recoil(t), 1), gun: 'aim' }); muz[i].update(t); c.setFace('squint', 'shout'); });
      booms.forEach(b => b.update(t));
      const f = canFlash.reduce((a, c) => (t >= c ? Math.max(a, 1 - (t - c) * 6) : a), 0); flash.intensity = Math.max(0, f) * 10; can.position.z = 2.2 - Math.max(0, f) * 0.12;
      canSmoke(t, new THREE.Vector3(-1.2, 0.7, 0.8), 1); aimSun(D, 0, -2);
      return film(t) + badge(t, 'Febrero de 1913', 'La Decena Trágica', 'Diez días de combates en la Ciudad de México', 1.2, L[1].t0 - 0.4);
    } },
    { t0: L[1].t0 - 0.35, set: P, p0: [-1.9, 1.3, 1.9], l0: [0.6, 1.05, -0.9], p1: [-1.7, 1.3, 1.5], l1: [0.6, 1.05, -0.9], fov0: 36, act: (t) => {
      K.pose(madero, A.proud(t, 1)); madero.setFace(C.blinkEye(t, 1), 'smile');
      K.pose(huerta, C.salute(t, 2)); huerta.setFace(C.blinkEye(t, 2), 'neutral');
      guards.forEach((g, i) => K.pose(g, { ...C.idle(t, g.seed), gun: 'port' }));
      return film(t) + nameplate(ctx, [0.75, 1.62, -0.9], 'Victoriano Huerta', 'General del ejército federal', L[1].t0 + 0.4, tTra - 0.2);
    } },
    { t0: tTra - 0.15, set: P, p0: [-0.5, 1.2, 2.5], l0: [0.3, 0.95, -1.0], p1: [-0.4, 1.18, 2.1], l1: [0.3, 0.95, -1.0], fov0: 36, shake: t => 0.02 * Math.max(0, 1 - (t - tTra) * 2), act: (t) => {
      K.pose(madero, A.handsUp(t, 1)); madero.setFace('shock', 'open');
      K.pose(huerta, { ...C.idle(t, 2), chest: [-4, 0, 0] }); huerta.setFace('squint', 'grin');
      guards.forEach((g, i) => K.pose(g, { ...C.aim(t, 0, 0), gun: 'aim' }));
      const k = Math.max(0, 1 - (t - tTra) * 1.6);
      return film(t) + `<div style="position:absolute;inset:0;background:radial-gradient(circle,rgba(160,20,20,0) 35%,rgba(150,10,10,${0.25 + 0.4 * k}) 100%)"></div>`;
    } },
    { t0: L[2].t0 - 0.25, set: N, p0: [0.45, 0.85, 2.4], l0: [0, 0.6, -0.3], p1: [0.3, 0.8, 1.95], l1: [0, 0.6, -0.3], fov0: 38, act: (t) => {
      candles.forEach((m, i) => m.scale.set(1, 1.8 + 0.25 * Math.sin(t * 17 + i * 2), 1)); glow.intensity = 3 + 0.4 * Math.sin(t * 11);
      return film(t) + badge(t, '22 de febrero de 1913', 'Madero es asesinado', 'Junto con el vicepresidente José María Pino Suárez', L[2].t0, tHu);
    } },
    { t0: tHu, set: Z, p0: [1.8, 2.2, -5.6], l0: [0, 4.6, -13.9], p1: [1.4, 2.6, -7.0], l1: [0, 4.65, -13.9], fov0: 38, act: (t) => {
      K.pose(dict, A.proud(t, 3)); dict.setFace(C.blinkEye(t, 3), 'grin');
      ranks.forEach((r, i) => K.pose(r, { ...C.salute(t, i), gun: 'none' })); Z.flag.wave(t); aimSun(Z, 0, -6);
      return film(t) + nameplate(ctx, [bx, by + 1.6, bz - 16 + 0.1], 'Victoriano Huerta', 'Dictador', tHu + 0.3, ctx.dur)
        + badge(t, '1913 – 1914', 'La dictadura de Huerta', 'Disuelve el Congreso y persigue a sus opositores', tHu + 0.6, ctx.dur);
    } },
  ];
  const inst = { scene: D, scenes: [D, P, N, Z], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
