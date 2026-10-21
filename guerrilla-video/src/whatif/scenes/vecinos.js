import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as M from '../../lib/motion.js';
import * as WM from '../worldmap.js';
import { run, wt } from '../shots.js';
import { SASH } from './titulo.js';
const { ss, clamp } = M;
const fade = U.fade;
export const preload = WM.preload;

const put = (r, set, x, y, z, yaw) => { if (r.root.parent !== set) set.add(r.root); r.root.position.set(x, y, z); r.root.rotation.y = yaw; r.root.visible = true; return r; };
const ll = (lon, lat, y = 0.45) => new THREE.Vector3(...WM.wpos(lon, lat, y));
// A glowing tube along a polyline that draws itself (k 0..1).
function glowLine(pts, { r = 0.11, color = '#ffd34a', seg = 240 } = {}) {
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal'), geo = new THREE.TubeGeometry(curve, seg, r, 6, false);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, toneMapped: false })); const n = geo.index.count;
  m.set = k => { geo.setDrawRange(0, Math.floor(clamp(k) * n / 36) * 36); m.visible = k > 0.002; }; m.set(0); m.userData.dynamic = true; return m;
}
// Arc from a to b (world points) bulging upwards; returns the curve.
const arc = (a, b, h) => new THREE.QuadraticBezierCurve3(a, a.clone().lerp(b, 0.5).setY(Math.max(a.y, b.y) + h), b);

// Mexico–US border, west to east (approximate, for the glowing line).
const BORDER = [[-117.12, 32.53], [-114.72, 32.72], [-111.07, 31.33], [-108.21, 31.33], [-108.21, 31.78], [-106.53, 31.78], [-105.0, 30.7], [-104.4, 29.56],
  [-103.2, 28.98], [-102.4, 29.75], [-101.4, 29.77], [-100.9, 29.36], [-100.3, 28.3], [-99.5, 27.5], [-99.1, 26.5], [-98.2, 26.06], [-97.15, 25.95]];
const PORTS = [[-117.03, 32.54], [-115.47, 32.65], [-110.94, 31.33], [-106.45, 31.74], [-104.4, 29.56], [-100.52, 28.7], [-99.5, 27.5], [-97.5, 25.88]];
const FROM = [[-118.24, 34.05], [-87.63, 41.88], [-95.37, 29.76], [-96.8, 32.78], [-74.0, 40.7], [-112.07, 33.45]];
const TO = [[-101.19, 19.7], [-103.35, 20.67], [-101.68, 21.12], [-99.13, 19.43], [-96.73, 17.07], [-98.2, 19.04]];

export function build(ctx) {
  const L = ctx.L;
  const tIgn = wt(L[0], 'ignorarse'), tB = L[1].t0 - 0.25, tKm = wt(L[1], 'kilometros'), tCru = wt(L[1], 'cruzan'), tMil = wt(L[1], 'millon');
  const tC = L[2].t0 - 0.2, tDol = wt(L[2], 'dolares'), tPri = wt(L[2], 'primer'), tD = L[3].t0 - 0.2, tRem = wt(L[3], 'remesas'), tFam = wt(L[3], 'familias');

  // ================================================================ A: back to back on the border line
  const Br = S.bridge('golden'), DY = 3.27;
  const rud = K.leader(Br, 'rudolf', -0.55, 0.25, -Math.PI / 2); K.fitSash(rud, SASH, { emblem: K.eagleKnot() });
  const sir = K.leader(Br, 'sirius', 0.55, -0.25, Math.PI / 2);
  const glance = (t, t0) => ss(t0, t0 + 0.35, t) * (1 - ss(t0 + 1.0, t0 + 1.35, t));
  const actA = t => {
    put(rud, Br, -0.55, DY, 0.25, -Math.PI / 2); put(sir, Br, 0.55, DY, -0.25, Math.PI / 2);
    const gr = glance(t, tIgn - 0.25), gs = glance(t, tIgn + 0.05);
    const pr = A.crossArms(t, 1), ps = A.crossArms(t, 2);
    pr.head = [pr.head[0], pr.head[1] - 62 * gr, pr.head[2]]; pr.neck = [0, -20 * gr, 0];
    ps.head = [ps.head[0], ps.head[1] + 62 * gs, ps.head[2]]; ps.neck = [0, 20 * gs, 0];
    K.act(rud, pr, t, { smile: 0.2 }); K.act(sir, ps, t, { smile: 0.05, eye: 0.25 * gs });
    return U.film(t) + U.bigTitle(t, 0.4, tB - 0.2, 'EL PROBLEMA', 'Vecinas', 'No pueden ignorarse', { top: 70 });
  };

  // ================================================================ B + D: the map of North America
  const Mp = WM.worldMap(); Mp.keep(['Mexico', 'United States of America']);
  const border = glowLine(BORDER.map(([lo, la]) => ll(lo, la, 0.5))); Mp.add(border);
  const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff6c8', toneMapped: false }), PORTS.length * 6);
  dots.frustumCulled = false; dots.userData.dynamic = true; Mp.add(dots);
  const m4 = new THREE.Matrix4(), hide = new THREE.Matrix4().makeScale(0, 0, 0);
  const crossings = (t, k) => { PORTS.forEach(([lo, la], i) => { for (let j = 0; j < 6; j++) { const ph = (t * 0.55 + j / 6 + i * 0.37) % 1, dir = j % 2 ? 1 : -1, p = ll(lo + (j - 2.5) * 0.12, la, 0.55);
    p.z += dir * (ph - 0.5) * 2.4; dots.setMatrixAt(i * 6 + j, k > 0 ? m4.makeTranslation(p.x, p.y + 0.12 * Math.sin(ph * Math.PI), p.z) : hide); } }); dots.instanceMatrix.needsUpdate = true; };
  // remittances: golden arcs from US cities to Mexican states, coins riding them
  const arcs = FROM.map((f, i) => { const a = ll(...f, 0.5), b = ll(...TO[i], 0.5); return arc(a, b, 2.5 + a.distanceTo(b) * 0.18); });
  const arcLines = arcs.map(c => { const g = glowLine(c.getPoints(60), { r: 0.07, color: '#ffcf3a', seg: 120 }); Mp.add(g); return g; });
  const coins = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 16), new THREE.MeshStandardMaterial({ color: '#ffd24a', metalness: 0.7, roughness: 0.25, emissive: '#5a3a00' }), arcs.length * 4);
  coins.frustumCulled = false; coins.userData.dynamic = true; Mp.add(coins);
  const q = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1);
  const coinFlow = (t, k) => arcs.forEach((c, i) => { for (let j = 0; j < 4; j++) { const u = ((t - tD) * 0.32 + j / 4 + i * 0.13) % 1;
    coins.setMatrixAt(i * 4 + j, k > 0 && t > tD + 0.8 ? m4.compose(c.getPoint(u), q.setFromEuler(e.set(Math.PI / 2, 0, t * 5 + j)), one) : hide); } coins.instanceMatrix.needsUpdate = true; });
  const pins = [WM.pin(Mp, -102, 23.5, 'mx'), WM.pin(Mp, -99, 38.5, 'us')];
  const paint = k => { Mp.paint('Mexico', '#2f8a4a', k); Mp.paint('United States of America', '#3a5a9a', k); };
  const actB = t => {
    paint(ss(tB, tB + 0.8, t)); pins.forEach((p, i) => p.set(ss(tB + 0.2 + i * 0.2, tB + 0.7 + i * 0.2, t)));
    border.set(ss(tB + 0.6, tKm + 0.2, t)); crossings(t, t > tCru - 0.2 ? 1 : 0); arcLines.forEach(g => g.set(0)); coinFlow(t, 0);
    return U.film(t) + U.counter(t, tKm - 0.3, tC + 0.3, 1290, 130, 3142, 'kilómetros de frontera', { dur: 1.2, suffix: ' km' })
      + U.popCard(t, tMil - 0.2, tC + 0.3, 'CRUCES AL DÍA', '≈ 1 millón', 'de personas, en ambos sentidos', { x: 1500, y: 340, w: 480, accent: '#ffd34a', icon: '↕' })
      + U.source(t, tKm, tC + 0.3, 'Secretaría de Relaciones Exteriores (SRE)');
  };
  const actD = t => {
    paint(1); pins.forEach(p => p.set(1)); border.set(1); crossings(t, 0);
    arcLines.forEach((g, i) => g.set(ss(tD + 0.2 + i * 0.25, tD + 1.4 + i * 0.25, t))); coinFlow(t, 1);
    return U.film(t) + U.counter(t, tRem - 0.4, ctx.dur + 1, 1290, 130, 61719, 'millones de dólares en remesas (2025)', { dur: 1.4, prefix: '$' })
      + U.source(t, tRem, ctx.dur + 1, 'Banco de México, febrero de 2026');
  };

  // ================================================================ C: the busiest trade on Earth crosses the bridge
  const trucks = [];
  const TC = ['#c0392b', '#2a5ab8', '#e8c020', '#2f8a3a', '#e86a1c', '#f2f0ea', '#5a2a8a', '#1d1d1f'];
  for (let i = 0; i < 10; i++) { const tr = P.truck(TC[i % TC.length], i % 3 ? '#e8e6e0' : '#c8ccd0'); tr.lane = i < 6 ? 1 : -1; tr.x0 = (i % 6) * 16 + (i >= 6 ? 7 : 0); Br.add(tr); trucks.push(tr); }
  const traffic = t => trucks.forEach(tr => { const x = ((tr.x0 + 9 * t) % 100) - 50; tr.position.set(tr.lane * x, DY, tr.lane * -2.9); tr.rotation.y = tr.lane > 0 ? 0 : Math.PI; });
  const actC = t => {
    rud.root.visible = false; sir.root.visible = false; traffic(t);
    return U.film(t) + U.counter(t, tDol - 0.4, tD + 0.3, 1290, 130, 872800, 'millones de dólares en comercio (2025)', { dur: 1.5, prefix: '$' })
      + U.popCard(t, tPri - 0.2, tD + 0.3, 'PRIMER SOCIO COMERCIAL', 'de Estados Unidos: México', '≈ 70,000 camiones de carga cruzan al día', { x: 1500, y: 340, w: 500, accent: '#2f8a4a', icon: '🇲🇽' })
      + U.source(t, tDol, tD + 0.3, 'U.S. Census Bureau · Congressional Research Service');
  };

  const sfx = [
    { t: 0, type: 'wind', dur: tB, vol: 0.25 }, { t: 0.4, type: 'sting', vol: 0.3 }, { t: tIgn - 0.25, type: 'swoosh', vol: 0.25 },
    { t: tB, type: 'whoosh', vol: 0.3 }, { t: tKm - 0.3, type: 'riser', dur: 1.2, vol: 0.2 }, { t: tC, type: 'traffic', dur: tD - tC, vol: 0.4 },
    { t: tDol, type: 'cash', vol: 0.4 }, { t: tD, type: 'whoosh', vol: 0.3 }, { t: tRem, type: 'cash', vol: 0.4 },
  ];
  const shots = [
    { t0: 0, set: Br, p0: [0.3, DY + 1.25, 4.6], l0: [0, DY + 1.0, 0], p1: [0.2, DY + 1.3, 3.6], l1: [0, DY + 1.05, 0], fov0: 40, act: actA },
    { t0: tB, set: Mp, p0: [-58.5, 19, -2.5], l0: [-58.5, 0, -15.6], p1: [-58.0, 13, -6.5], l1: [-58.0, 0, -16.6], fov0: 40, act: actB },
    { t0: tC, set: Br, p0: [-16, 10, 15], l0: [0, DY, 0], p1: [-9, 7, 12], l1: [2, DY, 0], fov0: 42, act: actC },
    { t0: tD, set: Mp, p0: [-50, 34, 6], l0: [-52, 0, -15.5], p1: [-51, 30, 3], l1: [-52.5, 0, -15], fov0: 42, act: actD },
  ];
  const inst = { scene: Br, scenes: [Br, Mp], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
