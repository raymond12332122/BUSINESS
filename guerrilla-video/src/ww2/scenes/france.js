import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as P from '../../lib/props.js';
import * as F from '../../lib/fx.js';
import { stage, aimSun } from '../../lib/stage.js';
import { camPath, ss, clamp, along, yawTo, lerp } from '../../lib/util.js';
import { cast, badge, label, partTimes } from '../../lib/kit.js';
import * as W from '../kit.js';
import { preload as pre, board, place, mapLabel, M } from '../mapkit.js';

export const preload = pre;

export function build(ctx) {
  const L = ctx.L;
  // ---------------------------------------------------------- A: Maginot line
  const A = stage({ skyTop: '#6c8fc4', skyHor: '#e4e6df', groundA: '#93a862', groundB: '#7f9452', fog: ['#e2e4dc', 40, 160], sunPos: [-8, 12, 9], shadow: 20, seed: 231 });
  P.scatter(A, (r, i) => P.roundTree(1.1 + r() * 0.5, '#5a8a3a', i), 60, [-40, -40, 40, -15], 232);
  P.scatter(A, (r, i) => P.roundTree(1.1 + r() * 0.5, '#5a8a3a', i), 40, [-40, 9, 40, 40], 233);
  const bunkers = [-16, -8, 0, 8, 16].map(x => { const b = W.bunker(); b.position.set(x, 0, -1.5); A.add(b); return b; });
  for (let x = -20; x < 20; x += 0.6) { const w = P.box(0.08, 0.5, 0.08, '#6b5a45'); w.position.set(x, 0.25, -4); A.add(w); }
  const fr = [-8, -4, 0, 4, 8].map((x, i) => W.soldier(cast(A, ['doto', 'doto', 'doto', 'doto', 'doto'][i], null, x + 1.6, -0.2, Math.PI), 'fr'));
  // ---------------------------------------------------------- B: Ardennes forest
  const B = stage({ skyTop: '#55779f', skyHor: '#c9d3cf', groundA: '#5f7f3e', groundB: '#4d6c33', fog: ['#b8c3bb', 10, 60], sunPos: [5, 13, 6], sun: 2.0, shadow: 16, seed: 234 });
  B.add(P.strip([[-40, 0], [-10, 0.8], [10, -0.6], [40, 0]], 2.4, '#7a6a52', 0.02));
  P.scatter(B, (r, i) => (i % 3 ? P.pine(1.3 + r() * 0.9, '#2b5233', i) : P.roundTree(1.3 + r() * 0.6, '#3f6f30', i)), 260, [-40, -30, 40, 30], 235, [[0, 0, 2.3], [-14, 0.7, 2.5], [14, -0.4, 2.5], [-6, 6, 3], [5, 6.5, 3], [-1, 5.6, 3], [-3.5, 5.3, 3]]);
  const fTanks = [0, 1, 2, 3].map(() => { const t = W.tank('de'); B.add(t); return t; });
  const roadPts = [[-40, 0], [-10, 0.8], [10, -0.6], [40, 0]];
  // ---------------------------------------------------------- map: the sickle cut
  const Mp = stage({ groundA: null, skyTop: '#4a6fa8', skyHor: '#cfe0ea', fog: ['#cfe0ea', 60, 200], sunPos: [6, 18, 10], sun: 2.3, hemi: 1.3, shadow: 26 });
  const map = board(Mp);
  const maginot = M.arrow([[7.6, 49.2], [7.7, 48.6], [7.6, 47.8]], '#5a6fb0', 0.35, 0.3); maginot.set(1); Mp.add(maginot);
  const cut = M.arrow([[7.2, 50.3], [5.6, 49.8], [4.4, 49.7], [2.5, 50.0], [1.6, 50.1]], '#3b3f46', 0.9);
  const north = M.arrow([[7.0, 51.6], [5.4, 51.3], [3.8, 51.0]], '#3b3f46', 0.6);
  Mp.add(cut, north);
  const mc = W.soldier(cast(Mp, 'mcqueen', null), 'de', { gun: false }); place(mc, 9.8, 51.0, -1.0);
  const dm = W.soldier(cast(Mp, 'doto', null), 'fr'); place(dm, 2.2, 47.0, 0.5);
  // ---------------------------------------------------------- C: Dunkirk
  const D = stage({ skyTop: '#6d87a8', skyHor: '#d9d5c8', groundA: '#d8c79a', groundB: '#cbb889', fog: ['#d5d2c8', 30, 120], sunPos: [-6, 10, 8], sun: 2.2, shadow: 16, seed: 236 });
  const sea = new THREE.Mesh(new THREE.BoxGeometry(200, 0.4, 80), new THREE.MeshStandardMaterial({ color: '#5f8aa3', roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.92 }));
  sea.position.set(0, 0.2 - 0.02, 41.5); D.add(sea);
  const boats = [[-5, 6.5, 3], [1.5, 7.5, 3.4], [7, 6.8, 2.8], [-12, 12, 5], [14, 13, 5]].map(([x, z, l], i) => { const b = W.boat(i % 2 ? '#5f6b75' : '#6f6458', l); b.position.set(x, 0.12, z); b.rotation.y = Math.PI / 2 + (i % 2 ? 0.2 : -0.15); D.add(b); return b; });
  const big = W.boat('#4e5a63', 9); big.scale.setScalar(1.6); big.position.set(4, 0.1, 22); big.rotation.y = Math.PI / 2; D.add(big);
  const evac = [];
  ['tamamo', 'doto', 'tamamo', 'doto', 'tamamo', 'doto'].forEach((k, i) => evac.push(W.soldier(cast(D, k, null), i % 2 ? 'fr' : 'uk')));
  for (let i = 0; i < 14; i++) { const c = W.soldier(cast(D, i % 2 ? 'tamamo' : 'doto', null), i % 2 ? 'uk' : 'fr'); c.queue = i; evac.push(c); }
  const lw = [0, 1].map(() => { const p = W.plane('#5d6464', { mark: 'de' }); D.add(p); return p; });

  const tB = L[1].t0, tMap = L[1].t0 + 2.6, tD = L[2].t0 + 2.6;
  const pc = partTimes(L[1], ['Pero los tanques alemanes la rodearon,', 'cruzando el bosque de las Ardenas,', 'que se creía imposible de atravesar.']);
  const evMap = [
    { t: -1, names: M.expand(['germany', 'poland', 'nordic_occ']), color: M.COLORS.axis }, { t: -1, names: ['Poland', 'Denmark', 'Norway', 'Czechia'], color: M.COLORS.occupied },
    { t: -1, names: ['France', 'United Kingdom', 'Belgium', 'Netherlands', 'Luxembourg'], color: M.COLORS.allies }, { t: -1, names: M.expand(['ussr']), color: M.COLORS.ussr },
    { t: -1, names: M.expand(['neutral']), color: M.COLORS.neutral }, { t: -1, names: ['Italy'], color: M.COLORS.axis_minor },
    { t: tMap + 1.2, names: ['Netherlands', 'Belgium', 'Luxembourg'], color: M.COLORS.occupied },
    { t: L[2].t0 + 0.6, names: ['France'], color: M.COLORS.occupied },
  ];
  const sfx = [{ t: 0.3, type: 'wind', dur: 8, vol: 0.4 }, { t: tB, type: 'engine', dur: 2.8, vol: 0.8 }, { t: tMap, type: 'whoosh' }, { t: L[2].t0 + 0.6, type: 'sting2' },
    { t: tD, type: 'whoosh' }, { t: tD + 0.3, type: 'waves', dur: ctx.dur - tD, vol: 0.6 }, { t: tD + 2.5, type: 'plane', dur: 3, vol: 0.6 }];

  function update(t) {
    let html = '';
    if (t < tB) {
      this.current = A;
      fr.forEach((c, i) => { c.apply({ ...C.idle(t, c.seed + i), gun: 'low' }); c.setFace(C.blinkEye(t, c.seed + i), 'smile'); c.root.rotation.y = Math.PI + 0.2 * Math.sin(t * 0.3 + i); });
      camPath(ctx.camera, [{ t: 0, p: [-13, 1.9, -8.5], l: [-7, 0.7, -0.5], fov: 40 }, { t: tB, p: [4, 2.4, -9], l: [8, 0.7, -0.5], fov: 40 }], t);
      aimSun(A, ctx.camera.position.x, 0);
      html += badge(t, 'Francia · 1940', 'La Línea Maginot', 'Cientos de kilómetros de búnkeres en la frontera con Alemania', 1.6, tB);
      html += label(ctx, [-8, 1.6, -1.5], '“Aquí no pasan”', 'n', ss(4, 4.4, t));
    } else if (t < tMap) {
      this.current = B;
      fTanks.forEach((v, i) => { const pos = along(roadPts, (t - tB) * 4.2 + 25 - i * 4.6); v.position.set(pos.x, 0, pos.z); v.rotation.y = pos.yaw; v.body.position.y = 0.012 * Math.sin(t * 30 + i); });
      camPath(ctx.camera, [{ t: tB, p: [-6, 1.4, 5], l: [-12, 0.7, 0.6], fov: 42 }, { t: tMap, p: [-1, 1.8, 5.6], l: [-5, 0.7, 0.8], fov: 42 }], t);
      aimSun(B, ctx.camera.position.x - 4, 0);
      html += badge(t, 'Mayo de 1940', 'Por las Ardenas', 'Bosque cerrado y caminos estrechos: nadie los esperaba ahí', tB + 0.3, tMap);
    } else if (t < tD) {
      this.current = Mp;
      M.paint(map, evMap, t);
      cut.set(ss(tMap + 0.4, tMap + 3.2, t)); north.set(ss(tMap + 0.8, tMap + 2.8, t));
      mc.apply(t > tMap + 0.6 ? C.point(t, 1, 20) : C.idle(t, 1)); mc.setFace(C.blinkEye(t, 1), 'smile');
      const fell = t > L[2].t0 + 0.4;
      dm.apply({ ...(fell ? C.knocked(t - L[2].t0 - 0.4, 2) : C.lookAround(t, 2)), gun: 'none' }); dm.setFace(fell ? 'dizzy' : 'shock', fell ? 'wavy' : 'small');
      camPath(ctx.camera, [{ t: tMap, p: [-2.5, 12, 12.5], l: [-2, 0, 0.5], fov: 42 }, { t: tD, p: [-2.5, 13.5, 13.5], l: [-2, 0, 0.5], fov: 42 }], t);
      aimSun(Mp, 4, 0);
      html += mapLabel(ctx, 8.6, 48.4, 'Línea Maginot', ss(tMap + 0.2, tMap + 0.6, t), 'n', 0.5);
      html += mapLabel(ctx, 5.3, 50.0, 'Ardenas', ss(tMap + 1.0, tMap + 1.4, t), 'a', 0.5);
      html += mapLabel(ctx, 2.4, 51.1, 'Dunkerque', ss(tMap + 3.0, tMap + 3.4, t), 'r', 0.5);
      html += badge(t, '22 de junio de 1940', 'Francia se rinde', 'En unas seis semanas', L[2].t0 + 0.6, tD);
    } else {
      this.current = D;
      evac.forEach((c, i) => {
        let x, z;
        if (i < 6) { x = -6 + i * 2.4; z = -2.5 + (i % 2) * 0.8; }
        const k = c.queue ?? -1;
        if (k >= 0) { const d = (t - tD) * 1.1 + k * 0.9; x = -7 + (k % 7) * 2.2; z = -6 + ((d % 12)); }
        if (i < 6) { const d = (t - tD) * 0.9; z += d; }
        const depth = clamp((z - 1.0) / 3);
        c.root.position.set(x, -0.42 * depth, z); c.root.rotation.y = 0;
        c.apply({ ...C.walk(t, 0.8, i), gun: 'back' }); c.setFace(C.blinkEye(t, i), 'frown');
        c.root.visible = z < 6.2;
      });
      boats.forEach((b, i) => { b.position.y = 0.12 + 0.05 * Math.sin(t * 1.6 + i); b.rotation.z = 0.04 * Math.sin(t * 1.2 + i); });
      lw.forEach((p, i) => { const k = (t - tD - 2.5 - i * 0.4) * 10; p.position.set(-40 + k, 8 + i, 2 + i * 3); p.rotation.set(0, Math.PI / 2, 0); p.prop.rotation.z = t * 60; p.visible = k > 0 && k < 85; });
      camPath(ctx.camera, [{ t: tD, p: [9, 2.6, 9.5], l: [-1, 0.3, -1], fov: 44 }, { t: ctx.dur, p: [7.5, 2.8, 10.5], l: [-2, 0.3, -1], fov: 44 }], t);
      aimSun(D, 0, 2);
      html += badge(t, 'Dunkerque · mayo–junio 1940', 'Escape por mar', 'Más de 300 000 soldados aliados evacuados', tD + 0.3, ctx.dur);
    }
    return html;
  }
  const inst = { scene: A, scenes: [A, B, Mp, D], sfx };
  inst.update = update.bind(inst);
  return inst;
}
