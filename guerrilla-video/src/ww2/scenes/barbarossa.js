import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as P from '../../lib/props.js';
import * as F from '../../lib/fx.js';
import { stage, aimSun } from '../../lib/stage.js';
import { camPath, ss, clamp, along, lerp } from '../../lib/util.js';
import { cast, badge, label, partTimes } from '../../lib/kit.js';
import * as W from '../kit.js';
import { preload as pre, board, place, mapLabel, M } from '../mapkit.js';

export const preload = pre;

const crossArms = p => { p.armL = [-60, -50, -70]; p.armR = [-60, 50, 70]; p.elbL = [0, -110, 0]; p.elbR = [0, 110, 0]; return p; };
function push(t, ph = 0) {
  const p = C.walk(t * 0.35, 0.6, ph);
  p.waist = [28, 0, 0]; p.chest = [12, 0, 0]; p.head = [-22, 0, 0];
  p.armL = [-84, -18, -84]; p.armR = [-84, 18, 84]; p.elbL = [0, -20, 0]; p.elbR = [0, 20, 0];
  return p;
}
function shiver(t, ph = 0) { const p = crossArms(C.tired(t, ph, 0.5)); const s = 3 * Math.sin(t * 40 + ph); p.chest = [8, 0, s]; p.head = [-4, s, s]; return p; }

export function build(ctx) {
  const L = ctx.L;
  // ---------------------------------------------------------- map
  const Mp = stage({ groundA: null, skyTop: '#4a6fa8', skyHor: '#cfe0ea', fog: ['#cfe0ea', 60, 200], sunPos: [6, 18, 10], sun: 2.3, hemi: 1.3, shadow: 30 });
  const map = board(Mp);
  const ev = [
    { t: -1, names: M.expand(['germany', 'poland', 'france', 'benelux', 'nordic_occ', 'balkans']), color: M.COLORS.occupied }, { t: -1, names: ['Germany', 'Austria'], color: M.COLORS.axis },
    { t: -1, names: ['United Kingdom'], color: M.COLORS.allies }, { t: -1, names: M.expand(['ussr']), color: M.COLORS.ussr },
    { t: -1, names: M.expand(['neutral']), color: M.COLORS.neutral }, { t: -1, names: [...M.expand(['axis_minor']), 'Italy'], color: M.COLORS.axis_minor },
  ];
  const arrows = [
    M.arrow([[21, 54.5], [25, 56.5], [28.5, 58.6], [30.3, 59.9]], '#3b3f46', 1.0),
    M.arrow([[22, 52.5], [27.5, 53.8], [32.5, 54.8], [36.5, 55.6]], '#3b3f46', 1.3),
    M.arrow([[23, 50.4], [28, 50.2], [32.5, 49.0], [37.5, 48.0]], '#3b3f46', 1.1),
  ];
  arrows.forEach(a => Mp.add(a));
  const mc = W.soldier(cast(Mp, 'mcqueen', null), 'de', { gun: false }); place(mc, 17.5, 52.4, 1.3);
  const og = W.soldier(cast(Mp, 'oguri', null), 'su'); place(og, 39.5, 55.6, -1.2);
  // ---------------------------------------------------------- mud
  const Mu = stage({ skyTop: '#6b7684', skyHor: '#b8b9b1', groundA: '#6b5338', groundB: '#5a4430', fog: ['#a9a99f', 20, 90], sunPos: [5, 12, 7], sun: 1.6, hemi: 1.2, shadow: 14, seed: 261 });
  P.scatter(Mu, (r, i) => P.birch(1.1 + r() * 0.5, i), 60, [-40, -30, 40, -6], 262); P.scatter(Mu, (r, i) => P.birch(1.1 + r() * 0.5, i + 3), 30, [-40, 8, 40, 30], 263);
  for (let i = 0; i < 12; i++) { const w = new THREE.Mesh(new THREE.CircleGeometry(0.6 + (i % 3) * 0.4, 14), new THREE.MeshStandardMaterial({ color: '#4d3a28', roughness: 0.2 })); w.rotation.x = -Math.PI / 2; w.position.set(-12 + i * 2.3, 0.012, (i % 2) * 1.6 - 0.8); Mu.add(w); }
  const truck = P.truck('#5d6157', '#6a6e60'); truck.position.set(0, -0.2, 0); truck.rotation.y = Math.PI / 2; truck.body.rotation.z = 0.06; Mu.add(truck);
  const mtank = W.tank('de'); mtank.position.set(-6.5, -0.22, 0.3); mtank.rotation.y = Math.PI / 2 - 0.1; Mu.add(mtank);
  const pushers = ['daiwa', 'suzuka', 'helios'].map((k, i) => W.soldier(cast(Mu, k, null), 'de'));
  const mudDust = new F.Dust(Mu, 7, 24);
  for (let k = 0; k < 12; k++) mudDust.puff(L[2].t0 + k * 0.33, [-1.5 - (k % 3) * 0.5, 0, (k % 2 ? 0.6 : -0.6)]);
  // ---------------------------------------------------------- winter
  const Wn = stage({ skyTop: '#33435f', skyHor: '#a9b4c6', groundA: '#e8edf2', groundB: '#d5dde6', fog: ['#b7c0cc', 8, 60], sunPos: [5, 12, 7], sun: 1.0, hemi: 1.1, hemiSky: '#c6d4ea', shadow: 14, seed: 264 });
  P.scatter(Wn, (r, i) => (i % 2 ? P.pine(1.2 + r() * 0.6, '#2b4a3a', i) : P.birch(1.2 + r() * 0.4, i)), 120, [-40, -30, 40, 30], 265, [[0, 0, 6], [2, 6, 3], [-6, 3, 3]]);
  Wn.traverse(o => { if (o.isMesh && o.geometry?.type === 'IcosahedronGeometry') o.material = P.mat('#dde5e8'); });
  const ftank = W.tank('de'); ftank.position.set(-1.5, 0, -2.4); ftank.rotation.y = 0.5; Wn.add(ftank);
  const frozen = ['mcqueen', 'daiwa', 'suzuka'].map((k, i) => W.soldier(cast(Wn, k, null, (i - 1) * 1.3, 0.6 + (i % 2) * 0.5, 0.15 * (i - 1)), 'de', { gun: i > 0 }));
  const snowW = W.snow(Wn, 1500, [-12, -8, 12, 10], 8, 7);
  const ice = F.bubble('🥶', { font: 130 }); Wn.add(ice);
  const towers = new THREE.Group(); Wn.add(towers);
  for (const [x, h] of [[-14, 7], [-9, 9], [-4, 6.5]]) { const g = new THREE.Group(); g.add(P.at(P.box(1.6, h, 1.6, '#8c3a33'), 0, h / 2, 0));
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 10), P.mat('#d9b34a')); dome.scale.y = 1.3; dome.position.y = h + 0.9; g.add(dome);
    g.add(P.at(new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 10), P.mat('#d9b34a')), 0, h + 2.6, 0)); g.position.set(x, 0, -34); towers.add(g); }
  const reds = [];
  for (let i = 0; i < 8; i++) reds.push(W.soldier(cast(Wn, i % 2 ? 'oguri' : 'tamamo', null), 'sw'));
  const t34 = [0, 1].map(i => { const t = W.tank('su'); Wn.add(t); return t; });

  const tMud = L[2].t0, pw = partTimes(L[2], ['Pero la Unión Soviética era gigantesca.', 'Las distancias, el lodo', 'y después el invierno frenaron a los alemanes.']);
  const tWin = pw[2] - 0.3, tCA = L[3].t0 - 0.2;
  const sfx = [{ t: 0.6, type: 'march', dur: 8, vol: 0.6 }, { t: 1.0, type: 'engine', dur: 12, vol: 0.5 }, { t: tMud, type: 'whoosh' }, { t: tMud + 0.2, type: 'engine', dur: tWin - tMud, vol: 0.6 },
    { t: tWin, type: 'wind', dur: ctx.dur - tWin, vol: 0.9 }, { t: tCA + 0.4, type: 'charge' }, { t: tCA + 0.4, type: 'engine', dur: 4, vol: 0.6 }];

  function update(t) {
    let html = '';
    if (t < tMud) {
      this.current = Mp;
      M.paint(map, ev, t);
      arrows.forEach((a, i) => a.set(ss(1.2 + i * 0.3, L[1].t1 - 0.6, t) * (0.55 + 0.45 * ss(L[1].t0, L[1].t1, t))));
      mc.apply(C.point(t, 1, -10)); mc.setFace(C.blinkEye(t, 1), 'grin');
      og.apply({ ...C.lookAround(t, 3), gun: 'none' }); og.setFace('shock', 'small');
      camPath(ctx.camera, [{ t: 0, p: [14, 15, 15], l: [16, 0, -1], fov: 44 }, { t: tMud, p: [17, 17, 16], l: [18, 0, -2], fov: 46 }], t);
      aimSun(Mp, 15, 0);
      html += badge(t, '22 de junio de 1941', 'Operación Barbarroja', 'Más de 3 millones de soldados alemanes', 1.0, L[1].t0);
      html += mapLabel(ctx, 30.3, 60.6, 'Leningrado', ss(4, 4.4, t), 'r', 0.5) + mapLabel(ctx, 37.6, 56.4, 'Moscú', ss(4.3, 4.7, t), 'r', 0.5) + mapLabel(ctx, 30.5, 50.4, 'Kiev', ss(4.6, 5.0, t), 'r', 0.5);
      html += badge(t, '1941', 'Millones de prisioneros', 'Ejércitos soviéticos enteros quedaron rodeados', L[1].t0 + 0.6, tMud);
    } else if (t < tWin) {
      this.current = Mu;
      truck.wheels.forEach(w => w.rotation.x = t * 14); truck.body.position.y = 0.02 * Math.sin(t * 25);
      pushers.forEach((c, i) => { c.root.position.set(-1.75 - (i === 1 ? 0.5 : 0), -0.05, (i - 1) * 0.55); c.root.rotation.y = Math.PI / 2; c.apply({ ...push(t, i), gun: 'back' }); c.setFace('squint', 'wavy'); });
      mudDust.update(t);
      camPath(ctx.camera, [{ t: tMud, p: [-3.5, 1.3, 4.5], l: [-0.8, 0.6, 0], fov: 40 }, { t: tWin, p: [-4.2, 1.4, 4.8], l: [-1.2, 0.6, 0], fov: 40 }], t);
      aimSun(Mu, 0, 0);
      html += badge(t, 'Otoño de 1941', 'El barro', 'Las lluvias convierten los caminos en lodazales', tMud + 0.3, tWin);
    } else {
      this.current = Wn;
      snowW.update(t, 1.5);
      const ca = t > tCA;
      frozen.forEach((c, i) => {
        if (!ca) { c.apply({ ...shiver(t, i), gun: 'back' }); c.setFace('flat', 'wavy'); }
        else { const d = (t - tCA - 0.6) * 2.6; const p = d > 0 ? { ...C.run(t, 1, i), gun: 'back' } : { ...C.idle(t, i), gun: 'back' }; c.root.rotation.y = d > 0 ? Math.PI : 0; c.root.position.z = 0.6 + (i % 2) * 0.5 - Math.max(0, d); c.apply(p); c.setFace('shock', 'scream'); }
      });
      const p0 = frozen[1].root.position; ice.position.set(p0.x, 0, p0.z); F.popSprite(ice, t, tWin + 0.6, tCA, 0.45, 1.6);
      reds.forEach((c, i) => {
        const d = Math.max(0, t - tCA - 0.3 - (i % 4) * 0.15) * 3.0;
        c.root.position.set(-7 + i * 2, 0, 14 - d); c.root.rotation.y = Math.PI; c.root.visible = ca;
        c.apply({ ...C.runArmed(t, 1.1, i), gun: 'port' }); c.setFace('squint', 'shout');
      });
      t34.forEach((v, i) => { const d = Math.max(0, t - tCA) * 2.4; v.position.set(i ? 6 : -9, 0, 18 - d); v.rotation.y = Math.PI; v.visible = ca; });
      camPath(ctx.camera, [
        { t: tWin, p: [1.4, 0.95, 4.8], l: [0, 0.8, 0.5], fov: 40 },
        { t: tCA, p: [1.1, 0.95, 4.4], l: [0, 0.8, 0.5], fov: 38 },
        { t: tCA + 0.1, p: [2, 3.2, -5.5], l: [0, 0.8, 6], fov: 46 },
        { t: ctx.dur, p: [2.5, 3.6, -7], l: [0, 0.8, 5], fov: 48 },
      ], t);
      aimSun(Wn, 0, 2);
      html += badge(t, 'Invierno de 1941', '−30 °C', 'Sin ropa de invierno, motores congelados', tWin + 0.3, tCA);
      html += badge(t, 'Diciembre de 1941', 'Contraataque en Moscú', 'Tropas soviéticas preparadas para el frío', tCA + 0.4, ctx.dur);
    }
    return html;
  }
  const inst = { scene: Mp, scenes: [Mp, Mu, Wn], sfx };
  inst.update = update.bind(inst);
  return inst;
}
