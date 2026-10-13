import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as P from '../props.js';

export async function preload() {}

export function build(ctx) {
  const L = ctx.L;
  const tDuro = wt(L[0], 'duro'), tNov = wt(L[0], 'noventa'), tHist = wt(L[0], 'historiadores'), tGolpe = wt(L[0], 'golpe'), tMin = wt(L[0], 'minoria'), tRev = wt(L[0], 'revolucion'), tPop = wt(L[0], 'popular');
  const tNadie = wt(L[1], 'nadie'), tCambio = wt(L[1], 'cambio'), tSiglo = wt(L[1], 'siglo'), tEsta = wt(L[1], 'esta');

  // ---- 1. 25 December 1991: the red flag comes down over the Kremlin
  const Kr = S.kremlinNight({ snowing: true });
  const red = Kr.sovietFlag, base = red.geometry.attributes.position.array.slice();
  const tri = new THREE.Mesh(new THREE.PlaneGeometry(3, 2, 10, 4), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, map: P.canvasTex(96, 64, (x, W, H) => { ['#f4f4f2', '#1f4fa8', '#d0262a'].forEach((c, i) => { x.fillStyle = c; x.fillRect(0, i * H / 3, W, H / 3 + 1); }); }) }));
  tri.position.copy(red.position); Kr.senate.add(tri);
  const wave = (m, t) => { const p = m.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = base[i * 3] + 1.5; p.setZ(i, 0.18 * (x / 3) * Math.sin(x * 2.4 - t * 3.6)); } p.needsUpdate = true; m.geometry.computeVertexNormals(); };
  // ---- 2. Historians disagree (Palace Square at night)
  const Ps = S.palaceSquare('snowNight', { snowing: true });
  // ---- 3. Last wide shot: Red Square at dusk
  const Rs = S.redSquare('snowDusk'); Rs.mausoleum.visible = false; Rs.fires.forEach(f => f.visible = false);
  const strollers = K.crowd(Rs, ['obrero', 'obrera', 'campesina', 'delegado'], 10, [-8, -12, 8, -2], { seed: 131 });

  const tB = tHist - 0.3, tC = L[1].t0 - 0.3;
  const sfx = [{ t: 0.0, type: 'wind', dur: tB, vol: 0.35 }, { t: tNov - 0.2, type: 'bells', dur: 3.0, vol: 0.3 }, { t: tB, type: 'whoosh', vol: 0.35 }, { t: tGolpe, type: 'pop', vol: 0.35 }, { t: tRev, type: 'pop', vol: 0.35 },
    { t: tC, type: 'swell', dur: ctx.dur - tC, vol: 0.4 }, { t: tEsta - 0.2, type: 'sting', vol: 0.55 }];
  const shots = [
    { t0: 0, set: Kr, p0: [0, 2.2, 10], l0: [0, 12, -40], p1: [0, 2.6, 7], l1: [0, 14.5, -40], fov0: 44, act: (t) => {
      Kr.tick(t); const k = ss(tNov - 0.2, tNov + 1.6, t), k2 = ss(tNov + 1.6, tB, t);
      red.position.y = 20 - 4.2 * k; red.visible = k < 0.98; tri.position.y = 15.8 + 4.2 * k2; tri.visible = k2 > 0.02; wave(red, t); wave(tri, t + 1);
      return U.film(t) + U.timeline(t, 0.5, tB, [['1917', 'Revolución', 0.6], ['1922', 'Nace la URSS', 0.9], ['1991', 'Fin de la URSS', tNov - 0.3]], ss(0.6, tNov + 0.2, t))
        + U.badge(t, '25 de diciembre de 1991', 'Fin de la Unión Soviética', 'Se arría la bandera roja del Kremlin', tNov - 0.1, tB);
    } },
    { t0: tB, set: Ps, p0: [3, 1.5, 10], l0: [-2, 4, -30], p1: [2.2, 1.6, 8], l1: [-2, 4.4, -30], fov0: 46, act: (t) => {
      Ps.tick(t);
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(6,8,14,.5)"></div>`
        + U.verdict(t, tHist - 0.2, tC, ['¿Golpe de una minoría?', [['Un partido pequeño tomó el poder por la fuerza', 'Richard Pipes · Orlando Figes', tMin - 0.2]], tGolpe - 0.3],
          ['¿Revolución popular?', [['Con apoyo de muchos obreros, soldados y campesinos', 'Alexander Rabinowitch · Sheila Fitzpatrick', tPop - 0.2]], tRev - 0.3], { y: 170 });
    } },
    { t0: tC, set: Rs, p0: [-10, 2.2, 12], l0: [4, 6, -26], p1: [-6, 7.5, 16], l1: [4, 8, -26], fov0: 46, act: (t) => {
      Rs.tick(t);
      strollers.forEach((s, i) => { K.pose(s, C.walk(t, 0.4, i)); s.root.position.x += 0.004 * (i % 2 ? 1 : -1); s.root.rotation.y = i % 2 ? Math.PI / 2 : -Math.PI / 2; s.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.big(t, tNadie - 0.2, tEsta - 0.3, 'Cambió el siglo XX', { top: 380, size: 80 })
        + `<div style="position:absolute;inset:0;background:rgba(6,8,14,${0.4 * ss(tEsta - 0.6, tEsta, t)})"></div>`
        + U.titleCard(t, tEsta - 0.25, ctx.dur + 1, '1917 · 1991', 'LA REVOLUCIÓN<br>RUSA', 'Gracias por ver', 170);
    } },
  ];
  const inst = { scene: Kr, scenes: [Kr, Ps, Rs], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
