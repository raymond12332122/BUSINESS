import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as MP from '../maps.js';
import * as M from '../../lib/motion.js';
import { run, wt } from '../../whatif/shots.js';
const { ss, clamp } = M;
const fade = U.fade;
export const preload = MP.preload;
const V = () => new THREE.Vector3();
const CAST = ['oguri', 'tamamo', 'cafe', 'doto', 'mcqueen', 'daiwa', 'suzuka', 'helios', 'spe', 'hishi'];
const flashDiv = k => k > 0.001 ? `<div style="position:absolute;inset:0;background:#fffaf0;opacity:${k.toFixed(3)}"></div>` : '';

// The bomb, told from afar: Japan fights on, the Trinity test, the B-29 at dawn, the cloud over Hiroshima seen from the
// hills, the map of the two cities, the Genbaku Dome with lanterns and paper cranes, the radio, the deck of the Missouri.
export function build(ctx) {
  const L = ctx.L;
  const tJap = wt(L[0], 'japon'), tSec = wt(L[0], 'secreto'), tAto = wt(L[0], 'atomica');
  const tSeis = wt(L[1], 'seis'), tUna = wt(L[1], 'una'), tHir = wt(L[1], 'hiroshima'), tTres = wt(L[1], 'tres'), tNag = wt(L[1], 'nagasaki'), tFin = wt(L[1], 'finales'), tDos = wt(L[1], 'doscientas');
  const tQui = wt(L[2], 'quince'), tEmp = wt(L[2], 'emperador'), tRad = wt(L[2], 'radio'), tFir = wt(L[2], 'firmo'), tSep = wt(L[2], 'septiembre'), tSeg = wt(L[2], 'segunda'), tTer = wt(L[2], 'terminado');
  const tA2 = tSec - 0.3, tB1 = L[1].t0 - 0.25, tB2 = tUna - 0.3, tB3 = tTres - 0.3, tB4 = tFin - 0.3, tC1 = L[2].t0 - 0.25, tC2 = tFir - 0.3, tC3 = tSeg - 0.3;

  // ================================================================ A1: 1945 — Japan fights on; Iwo Jima and Okinawa
  const Wm = MP.world({ center: 135, light: 'day' });
  const EMP = ['Japan']; Wm.keep(EMP);
  const ar = [[[146, 15], [143, 20], [141.3, 24.4]], [[133, 14], [129.5, 20], [127.9, 25.8]]].map(p => MP.warrow(Wm, p, '#3f6fb5', 0.7));
  const actA1 = t => { EMP.forEach(n => Wm.paint(n, '#a8322a', 1, 0.18)); ar.forEach((a, i) => a.set(ss(0.4 + i * 0.4, 2.2 + i * 0.4, t)));
    return U.film(t) + MP.wlabel(ctx, Wm, 141.3, 23.4, 'Iwo Jima', fade(t, 1.6, tA2 + 0.3), 'c', 0.8) + MP.wlabel(ctx, Wm, 127.9, 24.8, 'Okinawa', fade(t, 2.0, tA2 + 0.3), 'c', 0.8)
      + MP.wlabel(ctx, Wm, 138, 37.5, 'JAPÓN', fade(t, 0.4, tA2 + 0.3), 'st') + U.stamp(t, 0.5, tA2 + 0.2, '1945', 'el Pacífico'); };
  const [ax, , az] = Wm.pos(134, 28);

  // ================================================================ A2: the Trinity test — scientists in dark goggles watch the tower at dawn
  const Tr = S.trinity();
  const sci = [[CAST[7], -1.6], [CAST[2], -0.5], [CAST[4], 0.6], [CAST[9], 1.7]].map(([who, x], i) => { const r = K.person(Tr, who, i % 2 ? 'cientifico' : 'civil', x, -1.45, Math.PI + (x * -0.04)); r.i = i; return r; });
  const tFl = tAto + 0.15, ball = P.glow('#fff4e0', 6, 0); ball.position.set(-6, 21, -70); ball.material.fog = false; Tr.add(ball);
  const actA2 = t => { const k = t > tFl ? Math.exp(-(t - tFl) * 1.6) : 0;
    sci.forEach(r => K.act(r, A.salute(t, r.i, 1), t, { mouth: t > tFl ? 'open' : 'neutral', eye: t > tFl ? 'squint' : undefined }));
    ball.material.opacity = t > tFl ? 1 : 0; ball.scale.setScalar(6 + 60 * clamp((t - tFl) / 1.2));
    return U.film(t) + U.stamp(t, tA2 + 0.3, tB1 + 0.2, '16 de julio de 1945', 'Nuevo México, EE. UU.')
      + U.popCard(t, tA2 + 0.6, tB1 + 0.25, 'PROYECTO MANHATTAN', 'unas 130 000 personas', 'primera prueba: «Trinity»', { x: 1440, y: 140, w: 470, accent: '#c9a227' }) + flashDiv(0.95 * k); };

  // ================================================================ B1: 6 August 1945 — a B-29 above the clouds at morning
  const Sk = S.W1.skyStage('day', { ground: ['#5a7a4a', '#527040'], clouds: 26 });
  const b29 = P.aircraft('b29'); Sk.add(b29); const ALT = 46, X = t => -14 + (t - tB1) * 6;
  const actB1 = t => { b29.position.set(X(t), ALT, 0); b29.rotation.set(0, Math.PI / 2, 0.02 * Math.sin(t)); b29.spin(t);
    return U.film(t) + U.stamp(t, tB1 + 0.3, tB2 + 0.2, '6 de agosto de 1945', 'cielo de Japón'); };

  // ================================================================ B2: the cloud over Hiroshima, seen from the hills across the bay
  const Hf = S.hiroshimaFar();
  const flashH = P.glow('#fff2d0', 60, 0); flashH.position.set(-6, 12, -175); flashH.material.fog = false; Hf.add(flashH);
  const tBoom = tB2 + 0.25;
  const actB2 = t => { const u = clamp((t - tBoom) / 6); Hf.cloud.set(u * 0.9 + 0.1 * clamp((t - tBoom) / 0.6), t);
    flashH.material.opacity = t > tBoom ? Math.exp(-(t - tBoom) * 1.8) : 0;
    return U.film(t) + U.stamp(t, tB2 + 0.3, tB3 + 0.2, '6 de agosto de 1945, 8:15', 'Hiroshima, Japón') + flashDiv(t > tBoom ? 0.85 * Math.exp(-(t - tBoom) * 3.2) : 0); };

  // ================================================================ B3: the map — Hiroshima (6 August) and Nagasaki (9 August)
  const Jm = MP.world({ center: 135, light: 'day' }); Jm.keep(['Japan']);
  const bh = MP.wburst(Jm, 132.45, 34.39, '#ff7a2a', 0.45), bn = MP.wburst(Jm, 129.87, 32.75, '#ff7a2a', 0.45);
  const actB3 = t => { Jm.paint('Japan', '#a8322a', 1, 0.18); bh.update(t, tB3 + 0.1); bn.update(t, tNag - 0.3);
    return U.film(t) + MP.wlabel(ctx, Jm, 132.45, 35.3, 'Hiroshima · 6 de agosto', fade(t, tB3 + 0.1, ctx.dur + 1), 'c', 0.8)
      + MP.wlabel(ctx, Jm, 129.87, 31.6, 'Nagasaki · 9 de agosto', fade(t, tNag - 0.3, ctx.dur + 1), 'c', 0.8); };
  const [jx, , jz] = Jm.pos(132, 33.6);

  // ================================================================ B4: Hiroshima remembered — the Genbaku Dome, floating lanterns, paper cranes
  const Gd = S.genbakuDusk();
  const actB4 = t => U.film(t) + U.bigNumber(t, tDos - 0.3, tC1 + 0.25, 'más de 200 000', 'MUERTOS A FINALES DE 1945', { y: 200, size: 96, count: 0, band: true })
    + U.source(t, tB4 + 0.5, tC1 + 0.25, 'La Cúpula de la Bomba Atómica, hoy memorial de la paz');

  // ================================================================ C1: 15 August 1945 — a family listens to the emperor on the radio
  const Jr = S.japanRoom();
  const fam = [[-0.75, -0.45, 0.6], [0.75, -0.45, -0.6], [-0.35, 0.05, 0.25], [0.35, 0.05, -0.25]].map(([x, z, yaw], i) => { const r = K.person(Jr, CAST[(i + 1) % 10], i < 2 ? 'civil' : (i === 2 ? 'civilMujer' : 'ninoGueto'), x, z, Math.PI + yaw); K.seatOn(r, 0.08); r.y0 = r.root.position.y; r.i = i; return r; });
  const actC1 = t => { Jr.radio.glow?.(0.8 + 0.2 * Math.sin(t * 7));
    fam.forEach(r => { r.root.position.y = r.y0; K.act(r, A.seated(A.mourn, t, r.i, ss(tRad - 0.6, tRad + 0.4, t) * 0.9 + 0.1), t, { mouth: 'neutral', eye: t > tRad ? 'flat' : undefined }); });
    return U.film(t) + U.stamp(t, tC1 + 0.3, tC2 + 0.2, '15 de agosto de 1945', 'Japón')
      + U.dark(t, tEmp - 0.2, tC2 + 0.2, 'Hirohito', 'Emperador de Japón · anunció la rendición por radio', { side: 'r' }); };

  // ================================================================ C2: 2 September 1945 — the surrender is signed on the deck of the USS Missouri
  const Mo = S.missouri('morning');
  const rows = Array.from({ length: 10 }, (_, i) => { const r = K.person(Mo, CAST[i % 10], i % 3 === 0 ? 'diplomatico' : 'marinero', -3.4 + i * 0.75, -5.2 - (i % 2) * 0.35, 0, { shadow: false }); r.i = i; return r; });
  const signer = K.person(Mo, 'oguri', 'diplomatico', 0.05, -3.6, 0); const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.003, 0.085, 6), new THREE.MeshStandardMaterial({ color: '#1a1a1a' })); pen.userData.dynamic = true; Mo.add(pen);
  const actC2 = t => {
    rows.forEach(r => K.act(r, r.i % 3 === 0 ? A.crossArms(t, r.i) : A.stand(t, r.i), t, { mouth: 'neutral' }));
    K.act(signer, A.hands(t, 2, [-0.12, Mo.tableTop + 0.02, -3.35], [0.12 + 0.03 * Math.sin(t * 6), Mo.tableTop + 0.03, -3.32], 1), t, { mouth: 'neutral' });
    signer.root.updateMatrixWorld(true); pen.position.copy(signer.j.wriR.bone.getWorldPosition(V())).add(V().set(0, -0.01, 0.02)); pen.rotation.set(0.5, 0, -0.3);
    return U.film(t) + U.stamp(t, tC2 + 0.3, tC3 + 0.2, '2 de septiembre de 1945', 'bahía de Tokio')
      + U.slam(t, tSep - 0.1, tC3 + 0.25, 'RENDICIÓN DE JAPÓN', { x: 1380, y: 280, rot: -5, col: '#3f6fb5' }); };

  // ================================================================ C3: the war is over — doves over the bay at sunrise
  const sun = P.glow('#ffd8a0', 40, 0.8); sun.position.set(110, 4, 6); sun.material.fog = false; Mo.add(sun);
  const doves = Array.from({ length: 9 }, (_, i) => { const d = P.dove(i); d.p0 = V().set(24 + (i % 3) * 2.2, -1.4 + (i % 4) * 0.7, -12 - i * 0.9 + (i % 2) * 1.2); d.scale.setScalar(3.2); Mo.add(d); return d; });
  const actC3 = t => { const u = t - tC3;
    doves.forEach((d, i) => { d.position.set(d.p0.x - u * 0.8, d.p0.y + u * 0.35 + 0.3 * Math.sin(t * 2 + i), d.p0.z + u * 5.2); d.rotation.set(-0.1, -0.12, 0); d.flap(t); });
    rows.forEach(r => K.act(r, A.lookUp(t, r.i, 0.8), t, { mouth: 'smile' }));
    return U.film(t) + U.solemn(t, tSeg - 0.1, ctx.dur + 1, 'La Segunda Guerra Mundial había terminado', '1 de septiembre de 1939 – 2 de septiembre de 1945', { y: 140 }); };

  const sfx = [
    { t: 0, type: 'paper', vol: 0.25 }, { t: 0.5, type: 'whoosh', vol: 0.3 }, { t: 0, type: 'drums', dur: tA2, vol: 0.25 },
    { t: tA2, type: 'wind', dur: tB1 - tA2, vol: 0.3 }, { t: tA2 + 0.4, type: 'clock', dur: tFl - tA2 - 0.4, vol: 0.25 }, { t: tFl, type: 'bigboom', vol: 0.7 },
    { t: tB1, type: 'engines', dur: tB2 - tB1, vol: 0.4 }, { t: tB1, type: 'wind', dur: tB2 - tB1, vol: 0.3 },
    { t: tBoom, type: 'bigboom', vol: 0.6 }, { t: tBoom + 0.3, type: 'drone', dur: tB4 - tBoom, vol: 0.3 }, { t: tBoom + 0.5, type: 'wind', dur: tB3 - tBoom, vol: 0.35 },
    { t: tB3 + 0.1, type: 'thud', vol: 0.3 }, { t: tNag - 0.3, type: 'thud', vol: 0.3 },
    { t: tB4, type: 'waves', dur: tC1 - tB4, vol: 0.18 }, { t: tB4, type: 'birds', dur: tC1 - tB4, vol: 0.1 },
    { t: tC1, type: 'hiss', dur: tC2 - tC1, vol: 0.2 }, { t: tC1, type: 'clock', dur: tC2 - tC1, vol: 0.15 },
    { t: tC2, type: 'waves', dur: ctx.dur - tC2, vol: 0.3 }, { t: tSep - 0.1, type: 'stamp', vol: 0.45 }, { t: tC2 + 0.3, type: 'quill', dur: 1.6, vol: 0.25 },
    { t: tC3, type: 'birds', dur: ctx.dur - tC3, vol: 0.3 }, { t: tC3 + 0.2, type: 'riser', vol: 0.25 },
  ];
  const shots = [
    { t0: 0, set: Wm, p0: [ax, 34, az + 18], l0: [ax, 0, az], p1: [ax - 1, 30, az + 16], l1: [ax - 1, 0, az], fov0: 40, act: actA1 },
    { t0: tA2, set: Tr, p0: [2.9, 1.55, 2.4], l0: [-3.0, 1.2, -40], p1: [2.5, 1.5, 1.8], l1: [-3.4, 1.4, -40], fov0: 42, act: actA2 },
    { t0: tB1, set: Sk, p0: [X(tB1) - 10, ALT + 4, 26], l0: [X(tB1) + 2, ALT, 0], p1: [X(tB2) - 10, ALT + 4.5, 26], l1: [X(tB2) + 2, ALT, 0], fov0: 40, ease: 'lin', act: actB1 },
    { t0: tB2, set: Hf, p0: [1.5, 3.8, 9], l0: [-4, 22, -175], p1: [1.2, 3.6, 8.2], l1: [-4, 30, -175], fov0: 44, act: actB2 },
    { t0: tB3, set: Jm, p0: [jx, 22, jz + 12], l0: [jx, 0, jz], p1: [jx - 0.5, 20, jz + 11], l1: [jx - 0.5, 0, jz], fov0: 40, act: actB3 },
    { t0: tB4, set: Gd, p0: [4.6, 1.5, 6.8], l0: [-2.5, 2.4, -22], p1: [4.2, 1.45, 6.0], l1: [-2.8, 2.8, -22], fov0: 44, act: actB4 },
    { t0: tC1, set: Jr, p0: [2.45, 1.15, 1.0], l0: [-0.15, 0.3, -0.6], p1: [2.25, 1.1, 0.8], l1: [-0.15, 0.3, -0.65], fov0: 42, act: actC1 },
    { t0: tC2, set: Mo, p0: [1.6, 1.25, -0.6], l0: [-0.3, 0.55, -4.6], p1: [1.3, 1.2, -1.0], l1: [-0.3, 0.55, -4.6], fov0: 44, act: actC2 },
    { t0: tC3, set: Mo, p0: [13.6, -1.6, -1.0], l0: [40, 1.4, -1], p1: [13.6, -1.5, -0.6], l1: [40, 2.2, 2], fov0: 50, act: actC3 },
  ];
  const inst = { scene: Wm, scenes: [Wm, Tr, Sk, Hf, Jm, Gd, Jr, Mo], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
