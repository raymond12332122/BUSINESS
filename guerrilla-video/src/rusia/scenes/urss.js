import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as A from '../anim.js';
import * as RM from '../rmap.js';
import { leader, NAMES } from '../leaders.js';

export { preload } from '../rmap.js';
const fade = RM.fade;
const EXILE = [[37.62, 55.75], [33.5, 51.5], [30.73, 46.48], [30.2, 43.6], [28.98, 41.01]];

export function build(ctx) {
  const L = ctx.L;
  const tVein = wt(L[0], 'veintiuno'), tLen = wt(L[0], 'lenin'), tApl = wt(L[0], 'aplasto'), tKron = wt(L[0], 'kronstat'), tLibres = wt(L[0], 'libres'), tPerm = wt(L[0], 'permitio'), tCom = wt(L[0], 'comercio');
  const tDic = wt(L[1], 'diciembre'), tNacio = wt(L[1], 'nacio'), tUnion = wt(L[1], 'union'), tEnero = wt(L[1], 'enero'), tMurio = wt(L[1], 'murio');
  const tTest = wt(L[2], 'testamento'), tStalin = wt(L[2], 'stalin'), tGros = wt(L[2], 'grosero'), tNadie = wt(L[2], 'nadie'), tStalin2 = wt(L[2], 'stalin', 1), tExp = wt(L[2], 'expulso'), tTro = wt(L[2], 'trotski');

  // ---- 1. Kronstadt: troops in white cross the ice
  const Kr = S.kronstadtIce('grey');
  const ice = K.crowd(Kr, ['camuflaje'], 18, [-6, -6, 6, 2], { seed: 121, yaw: Math.PI });
  ice.forEach(e => e.z0 = e.root.position.z);
  // ---- 2. NEP market
  const Nm = S.nepMarket('overcast');
  const buyers = K.crowd(Nm, ['obrera', 'obrero', 'campesina', 'delegado', 'campesino'], 16, [-2.6, -14, 2.6, 0], { seed: 122 });
  buyers.forEach((b, i) => { b.root.rotation.y = i % 2 ? Math.PI / 2 : -Math.PI / 2; });
  // ---- 3. Map: the USSR (30 December 1922)
  const Mp = RM.russiaMap({ period: 1922 });
  // ---- 4. Red Square, January 1924
  const Rs = S.redSquare('snowDusk');
  const mourners = K.crowd(Rs, ['obrero', 'obrera', 'soldadoRevolucion', 'ejercitoRojo', 'campesino'], 36, [-12, -14, 6, -4], { seed: 123, yaw: Math.PI });
  const mflags = [[-9, -9], [-3, -12], [3, -8]].map(([x, z], i) => { const f = P.redFlag(2.4, 0.9, 0.55); f.position.set(x, 0, z); Rs.add(f); const band = LP_band(); band.position.set(0.04, 2.4 - 0.05, 0); f.add(band); return f; });
  // ---- 5. Lenin's testament (the Kremlin at night)
  const Kn = S.kremlinNight({ snowing: true });
  // ---- 6. Stalin in his office
  const So = S.stalinOffice();
  const stalin = leader(So, 'stalin', So.seat[0], So.seat[2], 0); stalin.root.position.y = So.seat[1];
  // ---- 7. Map: Trotsky deported
  const Me = RM.russiaMap({ period: 1922 });
  const ex = RM.arrow(Me, EXILE, '#2a2a2a', 0.3);

  const tB = tPerm - 0.35, tC = L[1].t0 - 0.3, tD = tEnero - 0.4, tE = L[2].t0 - 0.3, tF = tNadie - 0.3, tG = tExp - 0.4;
  const sfx = [{ t: 0.0, type: 'wind', dur: tB, vol: 0.4 }, { t: tApl, type: 'boom', vol: 0.4 }, { t: tApl + 1.2, type: 'boom', vol: 0.3 }, { t: tB, type: 'crowd', dur: tC - tB, vol: 0.35 }, { t: tCom, type: 'cash', vol: 0.4 },
    { t: tC, type: 'whoosh', vol: 0.4 }, { t: tUnion, type: 'hit', vol: 0.45 }, { t: tD, type: 'bells', dur: tE - tD, vol: 0.3 }, { t: tD, type: 'wind', dur: tE - tD, vol: 0.3 },
    { t: tE, type: 'paper', vol: 0.45 }, { t: tGros - 0.1, type: 'tension', vol: 0.4 }, { t: tF, type: 'clock', dur: tG - tF, vol: 0.3 }, { t: tG, type: 'whoosh', vol: 0.4 }, { t: tTro, type: 'thud', vol: 0.4 }];

  const shots = [
    { t0: 0, set: Kr, p0: [1.2, 1.0, 6.0], l0: [0, 2.2, -100], p1: [1.0, 1.0, 4.4], l1: [0, 2.4, -100], fov0: 42, act: (t) => {
      const u = t;
      ice.forEach((e, i) => { e.root.position.z = e.z0 - u * 0.4; K.pose(e, A.march(t, i, 0.5)); e.setFace(C.blinkEye(t, i), 'frown'); });
      return U.film(t) + U.badge(t, 'Marzo de 1921 · Kronstadt', 'Rebelión de los marinos', 'Lenin envía al Ejército Rojo por el hielo', tVein - 0.2, tB)
        + U.slogan(t, tLibres - 0.5, tB, 'ВЛАСТЬ СОВЕТАМ, А НЕ ПАРТИЯМ', 'El poder a los sóviets, no a los partidos', { top: 560, size: 44 });
    } },
    { t0: tB, set: Nm, p0: [1.1, 1.15, 2.4], l0: [0, 0.75, -9], p1: [0.9, 1.1, 1.4], l1: [0, 0.75, -9], fov0: 44, act: (t) => {
      buyers.forEach((b, i) => { K.pose(b, i % 3 === 0 ? C.offer(t, i, 0.6) : A.talk(t, i)); b.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.badge(t, '1921', 'NEP · Nueva Política Económica', 'Vuelve algo de comercio privado', tPerm - 0.1, tC);
    } },
    { t0: tC, set: Mp, p0: [6, 52, 27], l0: [6, 0, -4], p1: [6, 47, 24], l1: [6, 0, -4], fov0: 40, act: (t) => {
      Mp.paint(1922); Mp.tintState(1922, 'USSR', '#c0392b', ss(tNacio - 0.3, tNacio + 0.6, t), 0.6);
      return U.film(t) + RM.areaLabel(ctx, 88, 61, 'URSS', fade(t, tUnion - 0.2, tD + 1), 'big').replace('class="lbl big"', 'class="lbl big r"')
        + U.badge(t, '30 de diciembre de 1922', 'Nace la Unión Soviética', 'Rusia, Ucrania, Bielorrusia y Transcaucasia', tDic - 0.2, tD);
    } },
    { t0: tD, set: Rs, p0: [-14, 2.6, 6], l0: [0, 2, -20], p1: [-12, 2.4, 4], l1: [0, 2.1, -20], fov0: 46, act: (t) => {
      Rs.tick(t); mflags.forEach((f, i) => f.wave(t + i));
      mourners.forEach((m, i) => { K.pose(m, A.cold(t, i)); m.setFace(C.blinkEye(t, i), 'flat'); });
      return U.film(t) + U.badge(t, '21 de enero de 1924', 'Muere Lenin', 'Miles lo despiden en la Plaza Roja a –30 °C', tMurio - 0.3, tE);
    } },
    { t0: tE, set: Kn, p0: [0, 2, 14], l0: [0, 10, -40], p1: [0, 2.2, 12], l1: [0, 10.5, -40], fov0: 46, act: (t) => {
      Kn.tick(t);
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(6,8,14,.45)"></div>`
        + U.doc(t, tTest - 0.3, tF, 'Carta al Congreso', [['«Stalin es demasiado grosero…', tStalin - 0.1], ['…propongo a los camaradas que piensen en la forma de apartarlo de ese puesto.»', tGros - 0.3]], { left: 560, top: 170, width: 800, foot: '— Lenin, enero de 1923' });
    } },
    { t0: tF, set: So, p0: [0.55, 0.95, -0.6], l0: [0, 0.6, -3.0], p1: [0.4, 0.9, -1.1], l1: [0, 0.6, -3.0], fov0: 44, act: (t) => {
      K.pose(stalin, A.sit(t, 1, 4)); stalin.setFace(C.blinkEye(t, 1), 'neutral');
      return U.film(t) + U.nameplate(ctx, [0, So.seat[1] + 1.05, So.seat[2]], NAMES.stalin[0], 'Se queda con el poder', tStalin2 - 0.2, tG);
    } },
    { t0: tG, set: Me, p0: [-11.5, 20, 13], l0: [-11.8, 0, 3.4], p1: [-11.5, 18.5, 12], l1: [-11.8, 0, 3.4], fov0: 40, act: (t) => {
      Me.paint(1922); Me.tintState(1922, 'USSR', '#c0392b', 1, 0.6); ex.set(ss(tG + 0.2, tTro + 0.6, t));
      return U.film(t) + RM.chip(ctx, 28.98, 41.01, fade(t, tTro - 0.3, ctx.dur + 1), '1929 · Trotski, expulsado', 'Primero a Turquía', '#2a2a2a')
        + RM.city(ctx, Me, 'Moscú', fade(t, tG, ctx.dur + 1));
    } },
  ];
  const inst = { scene: Kr, scenes: [Kr, Nm, Mp, Rs, Kn, So, Me], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
// Black mourning ribbon tied under a flag's finial.
function LP_band() { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.02), new THREE.MeshStandardMaterial({ color: '#111111' })); m.position.set(0, -0.2, 0.03); g.add(m); return g; }
