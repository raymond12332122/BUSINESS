import * as THREE from 'three';
import * as C from '../lib/chars.js';
import * as P from '../lib/props.js';
import * as G from '../lib/gear.js';
import * as F from '../lib/fx.js';
import { stage, aimSun, mood } from '../lib/stage.js';
import { camPath, ss, clamp, along, track, yawTo, lerp } from '../lib/util.js';
import { cast, chapter, badge, label, stat } from '../lib/kit.js';

const BX = 500, CX = 1000; // desert (WWI) and snow (WWII) sets

export function build(ctx) {
  const L = ctx.L;
  const scene = stage({ groundA: null, sunPos: [6, 13, 8], shadow: 16, fog: ['#dfe6e0', 40, 160] });
  // ------------------------------------------------ A: supply line diagram
  const A = new THREE.Group(); scene.add(A);
  A.add(P.ground(220, '#93b765', '#77a04f', 71));
  const road = P.strip([[-16, 0], [-6, 1.2], [4, -0.6], [14, 0]], 1.8, '#a58e6a', 0.02); A.add(road);
  P.scatter(A, (r, i) => (i % 3 ? P.roundTree(1 + r() * 0.5, '#4f8f3a', i) : P.pine(1.1 + r() * 0.5, '#2e6838', i)), 70, [-40, -30, 40, -5], 72);
  P.scatter(A, (r, i) => P.roundTree(1 + r() * 0.5, '#4f8f3a', i), 40, [-40, 6, 40, 30], 73);
  // depot
  for (let i = 0; i < 3; i++) { const t = P.tent('#6e7a5a'); t.position.set(-18 + i * 1.8, 0, -2.6); A.add(t); }
  for (let i = 0; i < 6; i++) { const c = P.crate(0.45); c.position.set(-19 + (i % 3) * 0.55, (i > 2 ? 0.45 : 0), 2.2); A.add(c); }
  for (let i = 0; i < 4; i++) { const b = P.barrel(); b.position.set(-16.5 + i * 0.45, 0, 2.4); A.add(b); }
  // front line
  const sb = P.sandbags(7, 0.08); sb.position.set(15.5, 0, 0); sb.rotation.y = Math.PI / 2; A.add(sb);
  const ft = P.tank('#59614a'); ft.position.set(13.5, 0, -2.8); ft.rotation.y = Math.PI / 2; A.add(ft);
  const front = [cast(A, 'mcqueen', G.army, 14.9, -0.8, Math.PI / 2), cast(A, 'daiwa', G.army, 14.9, 0.9, Math.PI / 2)];
  const trucks = [0, 1, 2].map(i => { const v = P.truck('#5a6350', '#6d7858'); A.add(v); return v; });
  const icons = ['⛽', '🍞', '🔫'].map(e => { const b = F.bubble(e, { font: 130 }); A.add(b); return b; });
  const cutEx = new F.Explosion(A, [-1, 0.2, 0.6], L[1].t1 - 0.6, 1.1, 21, { fire: 0.6 });
  const emptyB = F.bubble('🪫', { font: 120 }); A.add(emptyB);
  const roadPts = [[-16, 0], [-6, 1.2], [4, -0.6], [14, 0]];
  const tCut = L[1].t1 - 0.6;

  // ------------------------------------------------ B: WWI Hejaz railway (desert)
  const B = new THREE.Group(); B.position.x = BX; scene.add(B);
  B.add(P.ground(220, '#e2c48e', '#d1ad72', 74));
  for (const [x, z, h, r] of [[-40, -60, 14, 26], [10, -70, 20, 30], [55, -55, 12, 22], [-70, -40, 10, 20]]) { const m = P.mountain(h, r, '#c9a26b', false, x); m.position.set(x, 0, z); B.add(m); }
  B.add(P.railway(120, 0, 0));
  P.scatter(B, (r, i) => (i % 4 ? P.rock(0.5 + r() * 0.9, '#b48b5a', i) : P.palm(0.9 + r() * 0.3, i)), 40, [-40, -30, 40, -3], 75, [[1, -5, 2.5]]);
  P.scatter(B, (r, i) => P.rock(0.4 + r() * 0.7, '#b48b5a', i), 20, [-40, 3, 40, 20], 76, [[6, 6, 4]]);
  const bigRock = P.rock(2.2, '#b08657', 4); bigRock.position.set(1.4, 0, -5.4); B.add(bigRock);
  const trainB = P.train('#3b3f45', 3); trainB.rotation.y = Math.PI / 2; B.add(trainB);
  const charge = new THREE.Group(); charge.add(P.at(P.box(0.22, 0.14, 0.14, '#b8332a'), 0, 0.22, 0)); charge.position.set(3, 0, 0.45); B.add(charge);
  const wire = P.strip([[3, 0.45], [2.4, -2], [1.2, -3.6]], 0.03, '#222', 0.03); B.add(wire);
  const plunger = new THREE.Group(); plunger.add(P.at(P.box(0.24, 0.2, 0.2, '#6b4a2f'), 0, 0.1, 0)); const handle = P.at(P.cyl(0.015, 0.015, 0.25, '#333', 5), 0, 0.3, 0); plunger.add(handle);
  plunger.add(P.at(P.box(0.2, 0.03, 0.03, '#333'), 0, 0.42, 0)); plunger.position.set(1.0, 0, -3.9); B.add(plunger);
  const bg = [cast(B, 'tamamo', G.guerrilla, 0, 0), cast(B, 'oguri', G.guerrilla, 0.6, -4.4)];
  const tBoom = L[2].t0 + 3.7, exB = new F.Explosion(B, [3, 0.3, 0.4], tBoom, 1.5, 31, { fire: 0.8, smokeColor: '#8a7a66' });
  const rails = [0, 1].map(i => { const r = P.box(1.4, 0.07, 0.06, '#9aa0a6'); r.position.set(3, 0.16, i ? 0.45 : -0.45); B.add(r); return r; });

  // ------------------------------------------------ C: WWII partisans (snowy forest at dusk)
  const Cg = new THREE.Group(); Cg.position.x = CX; scene.add(Cg);
  Cg.add(P.ground(220, '#e9eef3', '#cfd8e2', 77));
  Cg.add(P.railway(140, 0, 0));
  P.scatter(Cg, (r, i) => (i % 2 ? P.pine(1.2 + r() * 0.7, '#2b4a3a', i) : P.birch(1.2 + r() * 0.5, i)), 160, [-60, -40, 60, -3.5], 78, [[-3, -5, 2.5]]);
  P.scatter(Cg, (r, i) => (i % 2 ? P.pine(1.2 + r() * 0.7, '#2b4a3a', i) : P.birch(1.2 + r() * 0.5, i)), 90, [-60, 7, 60, 40], 79, [[-7, 9, 5], [-9, 13, 6], [-8, 11, 6]]);
  Cg.traverse(o => { if (o.isMesh && o.material?.color?.getHexString?.() === '9cbf4a') o.material = P.mat('#c9d6c0'); });
  const cg = [cast(Cg, 'cafe', G.guerrilla, -3.2, -4.6, 0.3), cast(Cg, 'tamamo', G.guerrilla, -2.2, -5.0, 0.1)];
  const exC = [-6, 2, 10, 18, 26].map((x, i) => new F.Explosion(Cg, [x, 0.3, 0], L[3].t0 + 2.2 + i * 0.55, 1.2, 40 + i, { fire: 0.7, smokeColor: '#4a4a4e' }));
  const trainC = P.train('#2c3036', 4); trainC.rotation.y = -Math.PI / 2; Cg.add(trainC);

  const sfx = [{ t: 0.3, type: 'sting' }, { t: 1.2, type: 'engine', dur: tCut - 1.0, vol: 0.45 }, { t: tCut, type: 'boom' },
    { t: L[2].t0 - 0.3, type: 'whoosh' }, { t: L[2].t0 + 0.2, type: 'train', dur: tBoom - L[2].t0 + 1.2, vol: 0.7 }, { t: tBoom - 0.15, type: 'click' }, { t: tBoom, type: 'bigboom' }, { t: tBoom + 0.5, type: 'brakes' },
    { t: L[3].t0 - 0.3, type: 'whoosh' }, ...exC.map(e => ({ t: e.t0, type: 'boom', vol: 0.75 })), { t: L[3].t0 + 0.4, type: 'wind', dur: L[3].t1 - L[3].t0 + 1, vol: 0.5 }];

  function update(t) {
    const set = t < L[2].t0 - 0.3 ? 'A' : t < L[3].t0 - 0.3 ? 'B' : 'C';
    if (set === 'A') mood(scene, { skyTop: '#5d8ad0', skyHor: '#dbe6ee', fog: ['#dfe6e0', 40, 160], sun: 2.6, sunColor: '#fff1dc', hemi: 1.2, hemiSky: '#e1efff', hemiGround: '#56663f' });
    if (set === 'B') mood(scene, { skyTop: '#4d86d0', skyHor: '#f3dfb5', fog: ['#efdcb8', 40, 170], sun: 3.0, sunColor: '#fff0d0', hemi: 1.2, hemiSky: '#fff3dd', hemiGround: '#a8875a' });
    if (set === 'C') mood(scene, { skyTop: '#1d2a4d', skyHor: '#c98a6a', fog: ['#7d7f95', 20, 110], sun: 1.3, sunColor: '#ffb48a', hemi: 0.9, hemiSky: '#9fb0d8', hemiGround: '#6e7488' });

    if (set === 'A') {
      const cut = t > tCut;
      trucks.forEach((v, i) => {
        let d = ((t * 2.2 + i * 10) % 33);
        if (cut) { const dc = ((tCut * 2.2 + i * 10) % 33); d = dc < 15 ? Math.min(dc + (t - tCut) * 2.2 * (1 - clamp((t - tCut) / 0.8)), 13.4 - i * 2.6) : dc; d = Math.min(d, dc < 15 ? 13.4 - i * 2.6 : dc); }
        const pos = along(roadPts, d); v.position.set(pos.x, 0, pos.z); v.rotation.y = pos.yaw; v.visible = d > 0.5 && d < 31.5;
        v.wheels.forEach(w => w.rotation.x = d * 4);
        const b = icons[i]; b.position.set(pos.x, 0, pos.z); F.popSprite(b, t, 1.0 + i * 0.4, cut ? tCut : 99, 1.5, 2.6);
        if (!v.visible) b.visible = false;
      });
      cutEx.update(t);
      const hungry = ss(tCut + 0.6, tCut + 1.4, t);
      front.forEach((c, i) => { c.apply({ ...C.blend(C.aim(t, 0, 0), C.tired(t, i, 1), hungry), gun: hungry > 0.5 ? 'low' : 'aim' }); c.setFace(hungry > 0.5 ? 'flat' : C.blinkEye(t, c.seed, 'flat'), hungry > 0.5 ? 'wavy' : 'neutral'); });
      emptyB.position.set(15, 0, 0); F.popSprite(emptyB, t, tCut + 1.0, 99, 1.2, 2.0);
      camPath(ctx.camera, [{ t: 0, p: [-3, 15, 22], l: [-1, 0, 0], fov: 46 }, { t: tCut - 0.4, p: [1, 13, 20], l: [0, 0, 0], fov: 46 }, { t: L[2].t0, p: [6, 6, 11], l: [7, 0.5, 0], fov: 40 }], t);
      aimSun(scene, ctx.camera.position.x, 0);
    }
    if (set === 'B') {
      const u = t - L[2].t0;
      // train rolls toward the charge, brakes after the blast
      const tx = u < 3.7 ? -30 + u * 6.2 : -30 + 3.7 * 6.2 + (1 - Math.exp(-(u - 3.7) * 1.4)) * 3.2;
      trainB.position.set(tx, 0, 0);
      rails.forEach((r, i) => { const k = clamp((t - tBoom) / 1.2); r.position.y = 0.16 + (t > tBoom ? (4 * k - 5 * k * k) * 1.5 : 0); r.rotation.z = (i ? 2 : -3) * k; r.position.x = 3 + (i ? 1 : -1) * k * 1.2; });
      charge.visible = t < tBoom;
      exB.update(t);
      // Tamamo plants the charge, then runs back to cover
      const tc = bg[0];
      if (u < 1.2) { tc.root.position.set(3, 0, 1.0); tc.root.rotation.y = Math.PI; tc.apply({ ...C.crouch(t, 1, 0.8), armL: [-70, -20, -70], armR: [-70, 20, 70], gun: 'back' }); }
      else { const d = (u - 1.2) * 3.2, pos = along([[3, 1.0], [2.4, -2.5], [1.9, -4.2]], d); tc.root.position.set(pos.x, 0, pos.z); tc.root.rotation.y = pos.done ? 0.4 : pos.yaw;
        tc.apply(pos.done ? { ...C.crouch(t, 1, 0.8), gun: 'back' } : { ...C.runArmed(t, 1.1), gun: 'port' }); }
      tc.setFace(u > 3.7 && u < 5 ? 'squint' : C.blinkEye(t, 2, 'open'), u > 3.7 ? 'grin' : 'neutral');
      const og = bg[1], press = ss(3.45, 3.65, u);
      og.root.position.set(0.6, 0, -4.35); og.root.rotation.y = 0.3;
      og.apply({ ...C.plunge(t, press), gun: 'back' }); og.setFace(u > 3.6 ? 'squint' : 'flat', u > 3.6 ? 'teeth' : 'neutral');
      handle.position.y = 0.3 - 0.12 * press;
      camPath(ctx.camera, [
        { t: L[2].t0 - 0.3, p: [BX + 6, 1.8, 6], l: [BX + 2, 0.5, 0], fov: 38 },
        { t: L[2].t0 + 2.2, p: [BX + 5.5, 2.4, 6.5], l: [BX + 1.5, 0.4, -2], fov: 40 },
        { t: tBoom - 0.2, p: [BX + 6.5, 3.2, 8.5], l: [BX - 1, 0.6, -1.5], fov: 42 },
        { t: L[3].t0 - 0.3, p: [BX + 7.5, 3.6, 9.5], l: [BX, 0.8, -1.5], fov: 42 },
      ], t, t > tBoom && t < tBoom + 0.6 ? 0.07 * (1 - (t - tBoom) / 0.6) : 0);
      aimSun(scene, BX + 2, 0);
    }
    if (set === 'C') {
      const u = t - L[3].t0;
      trainC.position.set(34 - Math.min(u, 2.5) * 3 - (u > 2.5 ? (1 - Math.exp(-(u - 2.5))) * 2 : 0), 0, 0);
      exC.forEach(e => e.update(t));
      cg.forEach((c, i) => { c.apply({ ...C.crouch(t, i, 0.7), gun: 'back' }); c.setFace(u > 2.2 ? 'squint' : 'flat', u > 2.2 ? 'grin' : 'neutral'); });
      camPath(ctx.camera, [
        { t: L[3].t0 - 0.3, p: [CX - 7, 2.4, 9], l: [CX + 2, 0.6, -1], fov: 40 },
        { t: ctx.dur, p: [CX - 9, 4.0, 13], l: [CX + 8, 0.6, -1], fov: 44 },
      ], t);
      aimSun(scene, CX + 4, 0);
    }
    scene.userData.sun.shadow.camera.updateProjectionMatrix();
    scene.background = null;

    let html = chapter(t, 4, 'Cut the supply lines', 0.3, L[1].t0 + 0.4);
    if (set === 'A') {
      const k = ss(2.0, 2.4, t) * (1 - ss(L[2].t0 - 0.8, L[2].t0 - 0.4, t));
      html += label(ctx, [-18, 2.4, 0], 'Depot', 'n', k) + label(ctx, [15, 2.0, 0], 'Front line', 'a', k);
      html += label(ctx, [-1, 1.6, 0.6], 'Supply road', 'n', k * (1 - ss(tCut - 0.3, tCut, t))) + label(ctx, [-1, 2.2, 0.6], '✂ Line cut', 'r', ss(tCut + 0.3, tCut + 0.6, t) * k);
    }
    if (set === 'B') html += badge(t, 'WORLD WAR I · 1916–1918', 'Hejaz Railway', 'T. E. Lawrence & the Arab Revolt kept blowing up the Ottoman line', L[2].t0 + 0.3, L[3].t0 - 0.3);
    if (set === 'C') html += badge(t, 'WORLD WAR II · 1941–1945', 'Partisan rail war', 'Soviet & Yugoslav partisans wrecked rail lines behind German lines', L[3].t0 + 0.3, ctx.dur);
    return html;
  }
  return { scene, update, sfx };
}
