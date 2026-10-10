import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as LP from '../../lib/props.js';
import { ss, clamp } from '../../lib/util.js';
import { badge } from '../../lib/kit.js';
import * as X from '../props.js';
import * as K from '../kit.js';
import * as A from '../anim.js';
import { plaza, zocalo, interior, aimSun } from '../sets.js';
import { runShots, wt } from '../shots.js';
import { film, nameplate, newspaper, doc, stamp } from '../ui.js';
import { mapSet, token, city, fade, GM } from '../mapkit.js';

export { preload } from '../mapkit.js';

export function build(ctx) {
  const L = ctx.L;
  // ---- campaign rally
  const R = plaza('golden', 41);
  const st = X.stage(4.2, 2.4); st.position.set(0, 0, -4.4); R.add(st);
  const ban = X.banner('SUFRAGIO EFECTIVO\nNO REELECCIÓN', { w: 4.4, h: 1.15, size: 74, bg: '#f3ead6', fg: '#2a2320', accent: '#9b2d22' }); ban.position.set(0, 2.85, -5.45); R.add(ban);
  for (const x of [-2.6, 2.6]) { const f = X.flag('mx', 3.4, 1.0, 0.62); f.position.set(x, 0, -5.4); R.add(f); }
  const flags = R.children.filter(o => o.wave);
  const bt = X.bunting(9); bt.position.set(0, 3.6, -1.5); R.add(bt);
  const madero = K.person(R, 'madero', 'madero', 0, -4.2, 0); madero.root.position.y = 0.5;
  const crowd = [];
  for (let i = 0; i < 18; i++) {
    const row = Math.floor(i / 6), x = -4.4 + (i % 6) * 1.25 + (row % 2) * 0.6, z = -1.0 + row * 1.4;
    crowd.push(K.person(R, ['doto', 'oguri', 'tamamo', 'helios', 'daiwa', 'suzuka'][i % 6], i % 3 === 1 ? 'politico' : 'campesino', x, z, Math.PI + (x * -0.04)));
  }
  // ---- jail
  const J = mxJail();
  const preso = K.person(J, 'madero', 'madero', -1.2, -0.75, 0.3); preso.root.position.y = 0.03;
  // ---- Díaz on the balcony + newspaper
  const Z = zocalo('day'); const [bx, by, bz] = Z.palacio.balcony;
  const diaz = K.person(Z, 'diaz', 'diaz', bx, bz - 16 + 0.1, 0); diaz.root.position.y = by;
  // ---- map: escape to San Antonio
  const M = mapSet();
  const md = token(M, 'madero', 'madero', ...GM.CITY['San Luis Potosí'], 'maderista', 0.3);
  const route = ['San Luis Potosí', 'Saltillo', 'Monterrey', 'Nuevo Laredo'].map(n => GM.CITY[n]).concat([GM.CITY['San Antonio']]);
  const arr = GM.arrow(route, GM.ARROW.maderista, 0.55); M.add(arr);
  const path = new THREE.CatmullRomCurve3(route.map(([lo, la]) => new THREE.Vector3(...GM.pos(lo, la))), false, 'centripetal');
  // ---- San Antonio: writing the plan by lamplight
  const W = interior({ wall: '#5a4636', floor: '#3e2c1e', w: 8, d: 7, h: 3.6, lights: [[0.6, 1.0, -0.5]], windows: false, bulbs: false });
  W.children.filter(o => o.isHemisphereLight).forEach(h => (h.intensity = 0.55)); W.userData.sun.intensity = 0.25;
  const desk = X.desk(); desk.position.set(0, 0, -0.6); W.add(desk);
  const chair = X.chair(); chair.position.set(0, 0, -1.25); W.add(chair);
  const lamp = new THREE.Group(); lamp.add(LP.at(LP.cyl(0.06, 0.08, 0.04, '#8a6a2a', 10), 0, 0.02, 0)); lamp.add(LP.at(LP.cyl(0.015, 0.015, 0.16, '#8a6a2a', 6), 0, 0.12, 0));
  const glass = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), new THREE.MeshBasicMaterial({ color: '#ffd98a' })); glass.position.y = 0.23; glass.scale.y = 1.5; lamp.add(glass);
  const chim = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.14, 12, 1, true), new THREE.MeshBasicMaterial({ color: '#ffe9b8', transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false })); chim.position.y = 0.25; lamp.add(chim);
  lamp.position.set(0.6, 0.45, -0.6); W.add(lamp);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.3), new THREE.MeshBasicMaterial({ color: '#1d2a4a' })); win.position.set(-1.6, 1.9, -3.48); W.add(win);
  for (const x of [-0.5, 0, 0.5]) W.add(LP.at(LP.box(0.04, 1.3, 0.03, '#3a2a1e'), -1.6 + x, 1.9, -3.46)); W.add(LP.at(LP.box(1.0, 0.04, 0.03, '#3a2a1e'), -1.6, 1.9, -3.46));
  const writer = K.person(W, 'madero', 'madero', 0, -1.15, 0); writer.root.position.y = 0.13;

  const tLema = wt(L[0], 'lema'), tSuf = wt(L[0], 'sufragio'), tGan = wt(L[1], 'declar') - 0.1, tPlan = wt(L[2], 'plan'), tUn = wt(L[2], 'un$'), tVein = wt(L[2], 'veinte');
  const sfx = [{ t: 0.2, type: 'crowd', dur: tLema, vol: 0.5 }, { t: tSuf + 0.2, type: 'cheer', vol: 0.8 }, { t: L[1].t0 - 0.1, type: 'clank' }, { t: tGan + 0.05, type: 'whoosh' },
    { t: L[2].t0 - 0.1, type: 'train', dur: 4.2, vol: 0.5 }, { t: tUn - 0.2, type: 'pop' }, { t: tVein + 0.1, type: 'thud', vol: 1.1 }];

  const shots = [
    { t0: 0, set: R, p0: [6.2, 2.3, 2.2], l0: [-0.9, 1.45, -3.2], p1: [5.4, 2.1, 1.2], l1: [-0.6, 1.5, -3.4], fov0: 40, act: (t) => {
      K.pose(madero, A.orate(t, 1, 0.8)); madero.setFace(C.blinkEye(t, 1), C.talkMouth(t, 1));
      crowd.forEach((c, i) => { K.pose(c, i % 3 === 0 ? { ...C.cheer(t + i * 0.3, i), gun: 'none' } : { ...C.idle(t, c.seed), gun: 'none' }); });
      flags.forEach((f, i) => f.wave(t + i)); aimSun(R, 0, -2);
      return film(t) + nameplate(ctx, [0, 2.05, -4.2], 'Francisco I. Madero', 'Candidato antirreeleccionista', 1.6, tLema - 0.3)
        + badge(t, '1910', 'Elecciones presidenciales', 'Madero recorre el país en campaña contra Díaz', 2.4, tLema - 0.25);
    } },
    { t0: tLema - 0.2, set: R, p0: [1.3, 1.15, -0.2], l0: [0, 1.95, -4.8], p1: [1.0, 1.2, -1.0], l1: [0, 2.0, -4.8], fov0: 44, act: (t) => {
      K.pose(madero, A.orate(t, 1, 1)); madero.setFace(t > tSuf ? 'open' : C.blinkEye(t, 1), C.talkMouth(t, 1));
      crowd.forEach((c, i) => K.pose(c, { ...C.cheer(t + i * 0.3, i), gun: 'none' }));
      flags.forEach((f, i) => f.wave(t + i)); aimSun(R, 0, -2);
      return film(t);
    } },
    { t0: L[1].t0 - 0.2, set: J, p0: [0.55, 0.95, 3.3], l0: [-0.9, 0.62, -0.7], p1: [0.45, 0.92, 2.8], l1: [-0.9, 0.62, -0.7], fov0: 38, act: (t) => {
      K.pose(preso, A.sit(t, 2, 6)); preso.setFace('flat', 'frown');
      return film(t) + badge(t, 'Junio de 1910', 'Madero, a la cárcel', 'Lo detienen en Monterrey y lo encierran en San Luis Potosí', L[1].t0 + 0.2, tGan - 0.1);
    } },
    { t0: tGan - 0.15, set: Z, p0: [-2.6, 2.4, -6.0], l0: [-2.4, 4.4, -13.9], p1: [-2.4, 2.6, -6.8], l1: [-2.3, 4.4, -13.9], fov0: 40, act: (t) => {
      K.pose(diaz, { ...C.wave(t, 1, 'R') }); diaz.setFace('happy', 'grin'); Z.flag.wave(t); aimSun(Z, 0, -6);
      return film(t) + newspaper(t, tGan, L[2].t0 - 0.05, { mast: 'EL IMPARCIAL', date: 'México, julio de 1910', head: '¡DÍAZ, REELECTO!', sub: 'El general gana las elecciones por octava vez', x: 36 });
    } },
    { t0: L[2].t0 - 0.2, set: M, p0: [0.6, 15, 9.5], l0: [2, 0, -2.4], p1: [1.2, 13, 7.5], l1: [2.2, 0, -2.8], fov0: 38, act: (t, u, lt) => {
      const p = clamp((t - L[2].t0 - 0.3) / 3.4); arr.set(p);
      const q = path.getPointAt(Math.max(0.0001, p * 0.985)), q2 = path.getPointAt(Math.min(1, p * 0.985 + 0.01));
      md.token.position.set(q.x, GM.H, q.z); md.root.rotation.y = Math.atan2(q2.x - q.x, q2.z - q.z);
      K.pose(md, p > 0 && p < 1 ? { ...C.walk(t, 1.2, 0), gun: 'none' } : { ...C.idle(t, 0), gun: 'none' }); md.setFace(C.blinkEye(t, 0), 'neutral');
      return film(t) + city(ctx, M, 'San Luis Potosí', fade(t, L[2].t0, tUn)) + city(ctx, M, 'San Antonio', fade(t, L[2].t0 + 2.6, tUn), 'c big')
        + badge(t, 'Octubre de 1910', 'Huida a Texas', 'Escapa disfrazado de ferrocarrilero', L[2].t0 + 0.6, tUn - 0.1);
    } },
    { t0: tUn - 0.25, set: W, p0: [1.5, 0.98, 1.7], l0: [-0.15, 0.8, -1.0], p1: [1.3, 0.96, 1.35], l1: [-0.15, 0.8, -1.0], fov0: 40, act: (t) => {
      { const p = A.sign(t, 3); p.head = [5, 0, 0]; p.chest = [5, 0, 0]; p.waist = [4, 0, 0]; K.pose(writer, p); } writer.setFace(C.blinkEye(t, 3), 'neutral');
      glass.material.color.setHSL(0.11, 1, 0.72 + 0.04 * Math.sin(t * 13));
      return film(t) + doc(t, tUn, ctx.dur, 'PLAN DE SAN LUIS', [['Madero desconoce la elección de Díaz…', tUn + 0.4], ['…y llama al pueblo a tomar las armas.', wt(L[2], 'levantarse')]],
        { left: 80, top: 90, width: 640, foot: 'San Antonio, Texas · 1910' })
        + stamp(t, '20 DE NOVIEMBRE<br>6 DE LA TARDE', tVein, ctx.dur, { x: 1390, y: 300, rot: -7 });
    } },
  ];
  const inst = { scene: R, scenes: [R, J, Z, M, W], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}

// Cell with a stone wall, a barred window and a bench (madero's prison in San Luis Potosí).
function mxJail() {
  const s = interior({ wall: '#8f8676', floor: '#6f685c', w: 6, d: 5, h: 3.2, lights: [[0, 2.8, 0.5]], windows: false });
  s.children.filter(o => o.isHemisphereLight).forEach(h => (h.intensity = 0.7));
  const j = X.jailCell(); j.position.set(0, 0, 0.2); s.add(j);
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 2.6), new THREE.MeshBasicMaterial({ color: '#fff1c8', transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide }));
  beam.position.set(0.55, 1.2, -0.6); beam.rotation.set(-0.5, 0, 0.2); s.add(beam);
  return s;
}
