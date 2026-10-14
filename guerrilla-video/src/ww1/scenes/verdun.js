import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as A from '../anim.js';
import * as WM from '../wmap.js';

export { preload } from '../wmap.js';
const fade = WM.fade;
const fz = (arr, poseFn, keep = () => false, face = 'neutral') => arr.forEach((c, i) => { if (keep(i)) return; c.setFace('open', face); K.freeze(c, poseFn(i)); });

export function build(ctx) {
  const L = ctx.L;
  const tMil = wt(L[0], 'mil'), tMat = wt(L[0], 'matanzas'), tVer = wt(L[0], 'verdun'), tPel = wt(L[0], 'pelearon'), tDiez = wt(L[0], 'diez'), tSet = wt(L[0], 'setecientos'), tDes = wt(L[0], 'desaparecidos');
  const tSom = wt(L[1], 'somme'), tPri = wt(L[1], 'primer'), tEj = wt(L[1], 'ejercito'), tCin = wt(L[1], 'cincuenta'), tCasi = wt(L[1], 'casi'), tMuer = wt(L[1], 'muertos');
  const tTerm = wt(L[2], 'termino'), tNov = wt(L[2], 'noviembre'), tAv = wt(L[2], 'avanzado'), tDiez2 = wt(L[2], 'diez');

  // ---- 1-2. Verdun: moonscape, a French shell-hole position
  const V = S.craterField('verdun', { fort: true, n: 190, seed: 771 });
  const hole = V.craters.filter(c => c[2] > 1.9).reduce((b, c) => (Math.hypot(c[0], c[1] - 3) < Math.hypot(b[0], b[1] - 3) ? c : b));
  const [hx, hz, hr] = hole, hy = V.heightAt(hx, hz);
  const poil = [[-0.45, -0.42], [0.1, -0.5], [0.55, -0.38]].map(([dx, dz], i) => { const x = hx + dx * hr, z = hz + dz * hr; const c = K.person(V, ['oguri', 'doto', 'helios'][i], 'poilu', x, z, Math.PI + (i - 1) * 0.25); c.root.position.y = V.heightAt(x, z) + 0.02; return c; });
  for (const [x, z] of [[-12, -18], [6, -24], [16, -12], [-20, -30]]) S.smokeFrom(V, new THREE.Vector3(x, 0.5, z), { n: 10, color: '#4a4440', size: 2.6, rise: 12, drift: [3, 0, 0], life: 6, opacity: 0.55 });
  // ---- 3. the Somme, 1 July 1916: walking into no man's land
  const Sm = S.craterField('morning', { green: 0.7, depth: 0.32, n: 60, stumps: 14, seed: 781 });
  for (let k = 0; k < 6; k++) { const w = P.wire(9, k + 70); w.position.set(-22 + k * 9, Sm.heightAt(-22 + k * 9, -14), -14); Sm.add(w); }
  const line = []; for (let r = 0; r < 2; r++) for (let c = 0; c < 7; c++) { const x = -6 + c * 2.0 + r * 1.0, z = 4 + r * 2.5; const p = K.person(Sm, ['oguri', 'doto', 'helios', 'tamamo', 'suzuka', 'mcqueen', 'daiwa'][(c + r) % 7], 'tommy', x, z, Math.PI); line.push(p); }
  line.forEach(p => { p.x0 = p.root.position.x; p.z0 = p.root.position.z; });
  // ---- 4. map: how far they got
  const Mp = WM.europeMap({ period: 1914 });
  const s1 = WM.front(Mp, WM.FRONT.somme1, { color: '#2a4a8a', width: 0.022 }), s2 = WM.front(Mp, [[2.66, 50.15], [2.78, 50.1], [2.86, 50.06], [2.97, 49.96], [2.98, 49.86]], { color: '#b8432f', width: 0.022 });
  const somDots = [['Albert', 2.65, 50.0], ['Bapaume', 2.85, 50.1], ['Péronne', 2.93, 49.93]];
  const dotM = somDots.map(([n, lo, la]) => { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 12), new THREE.MeshBasicMaterial({ color: '#2b2622' })); d.position.set(...WM.wpos(lo, la, WM.H + 0.03)); Mp.add(d); return d; });

  const tB = tVer - 0.35, tC = L[1].t0 - 0.3, tD = L[2].t0 - 0.35;
  const sfx = [{ t: 0, type: 'wind', dur: tC, vol: 0.3 }, ...[0.6, 2.1, 3.4, 4.6].map(x => ({ t: x, type: 'boom', vol: 0.35 })), { t: tMat - 0.1, type: 'sting', vol: 0.4 },
    { t: tB, type: 'gunfire', dur: tC - tB, vol: 0.25 }, ...[tB + 1, tB + 3.2, tB + 5.5].map(x => ({ t: x, type: 'bigboom', vol: 0.35 })), { t: tSet - 0.1, type: 'tick', vol: 0.35 },
    { t: tC, type: 'whistle', vol: 0.5 }, { t: tC + 0.4, type: 'march', dur: tD - tC, vol: 0.3 }, { t: tC + 1.6, type: 'mg', dur: tD - tC - 1.6, vol: 0.3 }, { t: tCin - 0.1, type: 'tick', vol: 0.35 }, { t: tCasi, type: 'tick', vol: 0.35 },
    { t: tD, type: 'whoosh', vol: 0.3 }, { t: tDiez2 - 0.1, type: 'sting2', vol: 0.4 }];

  const shots = [
    { t0: 0, set: V, p0: [-6, 3.2, 18], l0: [6, 0.4, -30], p1: [-4, 2.8, 14], l1: [6, 0.4, -30], fov0: 46, act: (t) => {
      V.tick(t);
      return U.film(t) + U.big(t, tMil - 0.2, tB + 0.3, '1916', { top: 120, size: 110 }) + U.big(t, tMat - 0.3, tB + 0.3, 'el año de las grandes matanzas', { top: 260, size: 46 });
    } },
    { t0: tB, set: V, p0: [hx + hr * 0.75, hy + 1.9, hz + hr * 0.85], l0: [hx, hy + 0.55, hz - hr * 0.55], p1: [hx + hr * 0.6, hy + 1.75, hz + hr * 0.7], l1: [hx, hy + 0.55, hz - hr * 0.55], fov0: 46, act: (t) => {
      V.tick(t);
      poil.forEach((c, i) => { K.pose(c, i === 1 ? { ...A.guard(t, i), gun: 'aim' } : A.cower(t, i)); c.setFace(C.blinkEye(t, i), 'frown'); });
      return U.film(t) + U.badge(t, 'Verdún · febrero–diciembre de 1916', 'Franceses contra alemanes', 'diez meses de combate', tVer - 0.2, tSet - 0.4)
        + U.slogan(t, tPel - 0.2, tSet - 0.3, 'ON NE PASSE PAS !', 'No pasarán', { top: 640, size: 54 })
        + U.counter(t, tSet - 0.3, tC, 1220, 150, 700000, 'muertos, heridos y desaparecidos', { from: 0, dur: 1.4, color: '#ff8a6a', prefix: '≈ ', w: 560 });
    } },
    { t0: tC, set: Sm, p0: [2.5, 1.2, 9.5], l0: [-1, 0.9, -6], p1: [2.0, 1.15, 7.5], l1: [-1, 0.9, -8], fov0: 44, act: (t) => {
      Sm.tick(t); const u = t - tC;
      line.forEach((p, i) => { const z = p.z0 - u * 0.75; p.root.position.set(p.x0, Sm.heightAt(p.x0, z), z); K.pose(p, A.advance(t, i)); p.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.datePage(t, tSom - 0.2, tCin - 0.3, 'Batalla del Somme', 'JULIO', '1', '1916', { x: 960, y: 110 })
        + U.counter(t, tCin - 0.3, tD + 0.3, 1230, 130, 57470, 'bajas británicas el primer día', { from: 0, dur: 1.2, color: '#ffcf6a', w: 560 })
        + U.counter(t, tCasi - 0.2, tD + 0.3, 1230, 330, 19240, 'muertos', { from: 0, dur: 1.0, color: '#ff8a6a', w: 560 });
    } },
    { t0: tD, set: Mp, p0: [-13.25, 2.0, 0.2], l0: [-13.3, 0, -1.25], p1: [-13.2, 1.6, -0.1], l1: [-13.25, 0, -1.25], fov0: 40, act: (t) => {
      Mp.paint(1914); s1.set(1); s2.set(ss(tTerm - 0.2, tAv, t));
      return U.film(t) + somDots.map(([n, lo, la], i) => WM.label(ctx, WM.wpos(lo, la, WM.H + 0.08), n, 'c', fade(t, tD + 0.2 + i * 0.15, ctx.dur + 1))).join('')
        + U.pin(ctx, WM.wpos(2.62, 50.2, WM.H + 0.05), '1 de julio', 'línea británica', fade(t, tD + 0.2, ctx.dur + 1), '#6f9be0')
        + U.pin(ctx, WM.wpos(2.98, 49.84, WM.H + 0.05), '18 de noviembre', 'fin de la batalla', fade(t, tNov - 0.2, ctx.dur + 1), '#e8735a')
        + U.big(t, tDiez2 - 0.3, ctx.dur + 1, 'Avance: unos 10 km en casi 5 meses', { top: 110, size: 50 })
        + U.source(t, tAv, ctx.dur + 1, 'Más de un millón de bajas en total en el Somme');
    } },
  ];
  const inst = { scene: V, scenes: [V, Sm, Mp], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
