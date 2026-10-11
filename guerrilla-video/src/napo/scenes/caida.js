import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as F from '../../lib/fx.js';
import { ss, clamp } from '../../lib/util.js';
import { badge } from '../../lib/kit.js';
import * as N from '../props.js';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as FX from '../fx.js';
import * as A from '../../mx/anim.js';
import { Troop } from '../troops.js';
import { runShots, wt } from '../../mx/shots.js';
import { film, nameplate, doc } from '../../mx/ui.js';
import { mapSet, city, fade, marker, GM } from '../mapkit.js';

export { preload } from '../mapkit.js';
const CITY = GM.CITY;

export function build(ctx) {
  const L = ctx.L;
  const tUnio = wt(L[0], 'unio'), t1813 = wt(L[0], 'en$'), tLeip = wt(L[0], 'leipzig'), tNac = wt(L[0], 'naciones');
  const tAli = wt(L[1], 'aliados'), tPar = wt(L[1], 'paris'), tAbd = wt(L[1], 'abdicar'), tDest = wt(L[1], 'desterrado'), tElba = wt(L[1], 'elba');

  // ---- 1. The Sixth Coalition closes in (map)
  const M = mapSet({ per: '1812' });
  const RED = '#c0392b';
  const arrows = [[[37.6, 55.7], [28, 54], [20, 52.4], CITY['Leipzig']], [[13.4, 52.5], CITY['Leipzig']], [[16.4, 48.2], [13.7, 50.4], CITY['Leipzig']], [[18.1, 59.3], [13.5, 54.6], [12.6, 52.6]], [[-3.7, 40.4], [-1.6, 43.3], [-0.6, 44.8]], [[-0.13, 51.5], [2.6, 51.0]]]
    .map((p, i) => { const a = GM.arrow(p, RED, 0.55); a.d = i * 0.15; M.add(a); return a; });
  const ev = [{ t: tUnio - 0.3, pol: ['RUS', 'PRU', 'AUT', 'SWE', 'GBR', 'ESP', 'POR', 'WAR', 'CRH'], color: '#d98a7e' }];
  // ---- 2. Leipzig: the Battle of the Nations
  const Le = S.leipzig();
  const nations = [['ru', -6, '#2f5038'], ['at', -2, '#e8e4dc'], ['pr', 2, '#232f4f'], ['se', 6, '#3a5f9a']].map(([fk, x, coat], i) => {
    const tr = new Troop(Le, { rows: 4, cols: 7, seed: 220 + i, coat, hat: 'shako', plume: null }); const f = N.flag(fk, 3.0, 1.3, 0.8); Le.add(f); return { tr, f, x, i }; });
  const french = new Troop(Le, { rows: 4, cols: 12, seed: 230, coat: '#2f4590', hat: 'shako' });
  const lv = new FX.Volleys(Le, { size: 0.9, life: 5, drift: [0.4, 0.2, 0], flashSize: 0.8 });
  nations.forEach((n, i) => { for (let k = 0; k < 2; k++) lv.volley(t1813 + 0.2 + i * 0.35 + k * 1.5, [...Array(6)].map((_, j) => [n.x - 2 + j * 0.8, 0.9, -5.4]), [0, 0, -1], 0.04, { puffs: 1, size: 1.2 }); });
  const haze = FX.haze(Le, { n: 14, box: [-20, 20, 1, 5, -22, 2], color: '#d8d4cc', size: 10, opacity: 0.3 });
  // ---- 3. The allies in Paris
  const Pa = S.paris1814();
  const allied = [['#2f5038', 'ru', -1.6], ['#232f4f', 'pr', 1.6]].map(([coat, fk, x], i) => { const tr = new Troop(Pa, { rows: 8, cols: 4, seed: 240 + i, coat, hat: 'shako', plume: null, spacing: [0.62, 0.72] }); const f = N.flag(fk, 2.6, 1.1, 0.7); Pa.add(f); return { tr, f, x }; });
  const pariz = [[-4.0, 2.0], [-4.2, -0.5], [4.0, 1.0], [4.1, -1.8]].map(([x, z], i) => K.person(Pa, ['doto', 'suzuka', 'helios', 'daiwa'][i], 'civil', x, z, x < 0 ? Math.PI / 2 : -Math.PI / 2));
  // ---- 4. Fontainebleau: the abdication
  const Fo = S.palaceFR('#e9dfc8');
  const desk = N.pedestalTable('#5a3a24', '#2f5a3a', 1.4, 0.8); desk.position.set(0, 0, -1.05); desk.scale.y = 0.5; Fo.add(desk);
  const chair = (() => { const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: '#7a2a2a' }); const seatM = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.5), m); seatM.position.y = 0.4; g.add(seatM); const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.06), m); back.position.set(0, 0.6, 0.25); g.add(back); return g; })();
  chair.position.set(0, 0, -1.78); chair.rotation.y = Math.PI; Fo.add(chair);
  const napF = K.person(Fo, 'napoleon', 'napoleon', 0, -1.72, 0);
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.24), new THREE.MeshStandardMaterial({ color: '#f3ead6' })); paper.rotation.x = -Math.PI / 2; paper.position.set(0.12, 0.432, -1.2); Fo.add(paper);
  // ---- 5. Elba
  const El = S.elba('day');
  const napE = K.person(El, 'napoleon', 'napoleon', 8.2, 0, 0.75); const hE = El.island.heightAt(8.2, 7.6);
  const brig = N.brig(5); brig.position.set(-8, 0, 19); brig.rotation.y = 1.2; El.add(brig);

  const sfx = [{ t: tUnio - 0.4, type: 'whoosh', vol: 0.6 }, { t: t1813 - 0.2, type: 'drums', dur: 2.0, vol: 0.5 }, ...lv.groups.map(t => ({ t, type: 'volley', vol: 0.45 })), { t: tNac, type: 'sting2', vol: 0.5 },
    { t: tAli - 0.3, type: 'march', dur: tAbd - tAli - 0.3, vol: 0.6 }, { t: tAli, type: 'crowd', dur: 2.6, vol: 0.4 }, { t: tAbd, type: 'tick', vol: 0.4 }, { t: tAbd + 0.6, type: 'thud', vol: 0.6 },
    { t: tDest - 0.2, type: 'waves', dur: ctx.dur - tDest, vol: 0.5 }];

  const tL = t1813 - 0.2, tP = L[1].t0 - 0.2, tF = tAbd - 0.9, tE = tDest - 0.2;
  const shots = [
    { t0: 0, set: M, p0: [0, 30, 21], l0: [-0.5, 0, 0.5], p1: [0, 27, 18.5], l1: [-0.5, 0, 0.0], fov0: 38, act: (t) => {
      GM.paint(M.map, ev, t); arrows.forEach(a => a.set(clamp((t - 0.4 - a.d) / 1.6)));
      return film(t) + badge(t, '1813', 'Toda Europa contra Napoleón', 'Rusia, Prusia, Austria, Suecia, Gran Bretaña…', 0.5, tL - 0.1);
    } },
    { t0: tL, set: Le, p0: [-3, 4.6, 11.5], l0: [0.5, 0.8, -12], p1: [-2.2, 4.2, 9.5], l1: [0.5, 0.9, -12], fov0: 40, act: (t) => {
      const adv = clamp((t - tL) / 5);
      nations.forEach(n => { n.tr.update(t, { x: n.x, z: -4 - adv * 3, yaw: Math.PI, march: 1, speed: 1 }); n.f.position.set(n.x + 1.6, 0, -2.6 - adv * 3); n.f.wave(t + n.i); n.f.visible = true; });
      french.update(t, { x: 0, z: -16 + adv * -2, yaw: 0, march: adv > 0.5 ? 1 : 0, speed: 1, tired: 0.3 });
      lv.update(t); haze(t); S.aimSun(Le, 0, -6);
      return film(t) + badge(t, 'Octubre de 1813', 'Leipzig: la Batalla de las Naciones', 'Medio millón de soldados de toda Europa', tLeip - 0.2, tP - 0.1)
        + nations.map(n => { const k = fade(t, tNac - 0.2 + n.i * 0.12, tP); if (k <= 0) return ''; const [x, y, ok] = ctx.project([n.x + 1.6, 3.3, -2.6 - 3 * adv]); return ok ? `<div class="lbl c" style="left:${x}px;top:${y}px;opacity:${k}">${['Rusia', 'Austria', 'Prusia', 'Suecia'][n.i]}</div>` : ''; }).join('');
    } },
    { t0: tP, set: Pa, p0: [3.2, 1.6, 9.5], l0: [-0.5, 1.6, -6], p1: [2.6, 1.55, 8.0], l1: [-0.5, 1.7, -6], fov0: 40, act: (t) => {
      const lt = t - tP;
      allied.forEach((a, i) => { a.tr.update(t, { x: a.x, z: -9 + lt * 1.4, yaw: 0, march: 1, speed: 1 }); a.f.position.set(a.x + 0.9, 0, -4.6 + lt * 1.4); a.f.wave(t + i); });
      pariz.forEach((c, i) => { K.pose(c, i % 2 ? A.humble(t, i) : C.idle(t, i, 0.4)); c.setFace(C.blinkEye(t, i), i % 2 ? 'frown' : 'neutral'); });
      return film(t) + badge(t, '31 de marzo de 1814', 'Los aliados entran en París', 'Rusos, prusianos y austriacos desfilan por la capital', tAli - 0.1, tF - 0.1);
    } },
    { t0: tF, set: Fo, p0: [0.55, 1.0, 0.75], l0: [0, 0.72, -1.7], p1: [0.45, 0.97, 0.35], l1: [0, 0.72, -1.7], fov0: 38, act: (t) => {
      const p = A.sign(t, 2); p.head = [5, 0, 0]; p.chest = [4, 0, 0]; K.pose(napF, p); napF.root.position.y = 0.11; napF.setFace('flat', 'frown');
      return film(t) + doc(t, tAbd - 0.4, tE, 'Acta de abdicación', [['Fontainebleau, 6 de abril de 1814', tAbd - 0.2], ['Napoleón renuncia al trono de Francia', tAbd + 0.3]], { left: 1160, top: 110, width: 640 });
    } },
    { t0: tE, set: El, p0: [19, 5.5, 25], l0: [4.0, 3.6, 3.0], p1: [14.6, hE + 2.4, 18.4], l1: [6.6, hE + 0.2, 5.8], fov0: 40, act: (t) => {
      napE.root.position.set(8.2, hE - 0.05, 7.6); K.pose(napE, A.sad(t, 3)); napE.setFace('flat', 'frown');
      brig.wave(t); brig.position.y = 0.05 * Math.sin(t * 1.2); El.sea.wave(t); S.aimSun(El, 0, 0);
      return film(t) + badge(t, '1814', 'Desterrado a la isla de Elba', 'Una pequeña isla del Mediterráneo, frente a Italia', tDest, ctx.dur);
    } },
  ];
  const inst = { scene: M, scenes: [M, Le, Pa, Fo, El], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
