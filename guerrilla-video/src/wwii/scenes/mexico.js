import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as MP from '../maps.js';
import * as M from '../../lib/motion.js';
import * as RP from '../../rusia/props.js';
import * as MX from '../../mx/props.js';
import { run, wt } from '../../whatif/shots.js';
const { ss, clamp } = M;
const fade = U.fade;
export const preload = MP.preload;
const V = () => new THREE.Vector3();
const CAST = ['oguri', 'tamamo', 'cafe', 'doto', 'mcqueen', 'daiwa', 'suzuka', 'helios', 'spe', 'hishi'];
const put = (r, set, x, y, z, yaw) => { if (r.root.parent !== set) set.add(r.root); r.root.position.set(x, y, z); r.root.rotation.y = yaw; return r; };

// Mexico in the war: the tankers sunk off Florida, Ávila Camacho before Congress, oil and metals, the braceros, and the
// Escuadrón 201 over the Philippines.
export function build(ctx) {
  const L = ctx.L;
  const tMex = wt(L[0], 'mexico'), tMay = wt(L[0], 'mayo'), tSub = wt(L[0], 'submarinos'), tHun = wt(L[0], 'hundieron'), tPot = wt(L[0], 'potrero'), tFaj = wt(L[0], 'faja');
  const tAvi = wt(L[1], 'avila'), tCon = wt(L[1], 'congreso'), tEje = wt(L[1], 'eje'), tEnv = wt(L[1], 'envio'), tMet = wt(L[1], 'metales'), tBra = wt(L[1], 'braceros');
  const tEsc = wt(L[2], 'escuadron'), tFue = wt(L[2], 'fuerza'), tFil = wt(L[2], 'filipinas'), tVol = wt(L[2], 'volo'), tCin = wt(L[2], 'cinco', 1);   // the first «cinco» is in «cuarenta y cinco»
  const tA1 = tMay - 0.3, tA2 = tPot - 0.45, tB1 = L[1].t0 - 0.25, tB2 = tEnv - 0.3, tB3 = tBra - 0.3, tC1 = L[2].t0 - 0.25, tC1b = tFue - 0.3, tC2 = tVol - 0.3, tC3 = tCin - 0.3;

  // ================================================================ A0 / A2: the Gulf of Mexico and the Florida Strait
  const Wm = MP.world({ center: -88, light: 'day' });
  Wm.keep(['Mexico']);
  const POT = [-80.1, 25.6], FAJ = [-82.6, 24.2];
  const bPot = MP.wburst(Wm, POT[0], POT[1], '#ff7a2a', 0.5), bFaj = MP.wburst(Wm, FAJ[0], FAJ[1], '#ff7a2a', 0.5);
  const mxPin = MP.wpin(Wm, -102, 23.5, 'mx', { h: 2.2, w: 1.5 });
  const actA0 = t => {
    Wm.paint('Mexico', '#3f8a4a', ss(0.4, 1.2, t), 0.14); mxPin.set(ss(0.6, 1.2, t)); bPot.update(t, 1e9); bFaj.update(t, 1e9);
    return U.film(t) + U.bigTitle(t, 0.5, tA1 + 0.2, 'AMÉRICA LATINA EN LA GUERRA', '¿Y México?', '', { top: 130 });
  };
  const actA2 = t => {
    Wm.paint('Mexico', '#3f8a4a', 1, 0.14); mxPin.set(1); bPot.update(t, tPot - 0.2); bFaj.update(t, tFaj - 0.2);
    return U.film(t) + MP.wlabel(ctx, Wm, POT[0] + 0.2, POT[1] + 1.3, 'Potrero del Llano · 13 de mayo', fade(t, tPot - 0.2, ctx.dur + 1), 'c', 0.9)
      + MP.wlabel(ctx, Wm, FAJ[0] - 0.3, FAJ[1] - 1.0, 'Faja de Oro · 20 de mayo', fade(t, tFaj - 0.2, ctx.dur + 1), 'c', 0.9)
      + MP.wlabel(ctx, Wm, -102, 19.5, 'MÉXICO', fade(t, tA2, ctx.dur + 1), 'st');
  };
  const [gx, , gz] = Wm.pos(-90, 24), [fx, , fz] = Wm.pos(-83, 24.5);

  // ================================================================ A1: a lit Mexican tanker at night; a torpedo from the dark
  const Ns = S.nightSea();
  const tk = P.tanker(); tk.rotation.y = -Math.PI / 2; tk.position.set(8, -0.8, -16); Ns.add(tk);
  const flood = new THREE.PointLight('#ffe6b0', 0, 16, 1.4); flood.position.set(8, 4, -11.5); Ns.add(flood);
  const wake = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1), new THREE.MeshBasicMaterial({ color: '#dfe8ee', transparent: true, opacity: 0.75, depthWrite: false })); wake.rotation.x = -Math.PI / 2; Ns.add(wake);
  const boom = P.glow('#ffb060', 22, 0); Ns.add(boom); const boomL = new THREE.PointLight('#ff9a40', 0, 60, 1.3); Ns.add(boomL);
  const fire = S.W1.fireAt(Ns, new THREE.Vector3(0, 2.4, -14), { n: 14, size: 3.2, rise: 3.5, spread: 3 });
  const smoke = MX.smokeTrail(Ns, 14, { color: '#1e1c1c', size: 3.2, rise: 22, drift: [6, 0, -4], life: 5, opacity: 0.8 });
  const tHit = tHun + 0.15, IMP = V().set(5.5, 0.4, -13.8);
  const actA1 = t => {
    const x = 8 - (t - tA1) * 1.6, list = 0.08 * ss(tHit, tHit + 2.5, t);
    tk.position.set(x, -0.8 - 0.5 * ss(tHit, tHit + 3, t), -16); tk.rotation.set(0, -Math.PI / 2, list); tk.lit(1 - 0.6 * ss(tHit, tHit + 0.3, t));
    flood.position.set(x - 3, 4, -11.5); flood.intensity = 30 * (1 - 0.6 * ss(tHit, tHit + 0.3, t));
    const u = clamp((t - (tSub - 0.3)) / Math.max(0.1, tHit - tSub + 0.3)), hx = x - 2.5, sx = hx - 4, sz = 18;   // the wake runs from the dark toward the hull
    const tipZ = sz + (-13.6 - sz) * u, tipX = sx + (hx - sx) * u; wake.visible = t > tSub - 0.3 && t < tHit + 0.2;
    const len = Math.max(0.1, Math.hypot(tipX - sx, tipZ - sz)); wake.scale.set(1, len, 1); wake.position.set((tipX + sx) / 2, 0.15, (tipZ + sz) / 2); wake.rotation.z = Math.atan2(tipX - sx, -(tipZ - sz)) * -1;
    const kb = t > tHit ? Math.exp(-(t - tHit) * 2.4) : 0; boom.position.set(hx, 2, -13.5); boom.material.opacity = 0.95 * kb; boom.scale.setScalar(16 + 30 * (1 - kb));
    boomL.position.set(hx, 4, -12); boomL.intensity = 400 * kb + 60 * ss(tHit, tHit + 0.5, t);
    fire.position.set(hx, 2.4, -14); fire.visible = t > tHit; fire.scale.setScalar(Math.max(0.01, ss(tHit, tHit + 1.2, t))); smoke(t, V().set(hx, 4, -14.5), ss(tHit + 0.2, tHit + 1.0, t));
    return U.film(t) + U.stamp(t, tA1 + 0.3, tA2 + 0.2, 'mayo de 1942', 'frente a Florida');
  };

  // ================================================================ B1: Ávila Camacho asks Congress to declare war on the Axis
  const Cm = S.WS.camara();
  const avila = K.stand_in(Cm, 'avila', 0, -6.25, 0); const SPK = Cm.speaker;
  const deps = Cm.seats.filter(st => st.row < 3 || st.a * 10 % 2 < 1.2).map((st, i) => {
    const r = K.person(Cm, CAST[i % 10], 'diputado', st.x, st.z, st.yaw, { shadow: false }); r.root.position.y = 0; K.seatOn(r, st.seat); r.y0 = r.root.position.y; r.i = i; return r; });
  const actB1 = t => {
    put(avila, Cm, SPK[0], SPK[1], SPK[2], 0);
    K.act(avila, A.orate(t, 1, 0.75), t, { talk: t < tEnv - 0.4, smile: 0.15 });
    const cl = ss(tEje + 0.3, tEje + 0.6, t);
    deps.forEach(r => { r.root.position.y = r.y0; K.act(r, cl > 0 && r.i % 2 ? A.seated(A.clap, t, r.i) : A.sit(t, r.i), t, { mouth: cl > 0 ? 'open' : 'neutral' }); });
    return U.film(t) + U.who(t, tAvi - 0.2, tEje + 0.2, 'Manuel Ávila Camacho', 'Presidente de México (1940 – 1946)', { code: 'mx', actor: 'Symboli Rudolf' })
      + U.slam(t, tEje - 0.05, tB2 + 0.25, 'ESTADO DE GUERRA', { x: 1400, y: 300, rot: -5, col: '#1f7a3a' }) + U.source(t, tEje + 0.3, tB2 + 0.25, 'Vigente desde el 22 de mayo de 1942, contra Alemania, Italia y Japón');
  };

  // ================================================================ B2: oil and metals go north by rail
  const Nr = S.northRail('golden');
  const train = new THREE.Group(); Nr.add(train);
  const loco = RP.locomotive({ color: '#1e2224', trim: '#2f7a4a' }); train.add(loco);
  let zc = loco.back - 0.8; const cars = [P.tankCar(), P.tankCar(), P.oreCar('#7a5a3a'), P.tankCar(), P.oreCar('#5a5a5e')];
  cars.forEach(c => { zc -= c.len / 2 + 0.6; c.position.z = zc; zc -= c.len / 2 + 0.6; train.add(c); });
  train.rotation.y = Math.PI / 2;
  const puff = MX.smokeTrail(Nr, 12, { color: '#3a3634', size: 0.9, rise: 4, drift: [-5, 0, 0], life: 2.4, opacity: 0.7 });
  const actB2 = t => { train.position.set(-4 + (t - tB2) * 3.2, 0, 0); train.updateMatrixWorld(true); puff(t, loco.localToWorld(loco.stack.clone()), 1);
    return U.film(t) + U.popCard(t, tEnv, tB3 + 0.25, 'PETRÓLEO Y METALES', 'México abasteció a los Aliados', 'petróleo, cobre, plomo, zinc y plata', { x: 1440, y: 140, w: 470, accent: '#1f7a3a' }); };

  // ================================================================ B3: the braceros in the fields of the United States
  const Bf = S.braceroField('day');
  const bra = Array.from({ length: 6 }, (_, i) => { const r = K.person(Bf, CAST[(i + 4) % 10], 'bracero', -2.85 + (i % 3) * 1.9 + 0.47, -1.5 - Math.floor(i / 3) * 2.6 - (i % 2) * 0.5, 0.3 * (i % 2 ? 1 : -1), { shadow: false }); r.i = i; return r; });
  const actB3 = t => {
    bra.forEach(r => { const k = 0.55 + 0.45 * Math.sin(t * 1.3 + r.i * 1.7); K.act(r, A.setDown(t, r.i, Math.max(0, k)), t, { mouth: 'neutral' }); });
    return U.film(t) + U.popCard(t, tBra - 0.1, tC1 + 0.25, 'EL PROGRAMA BRACERO (1942 – 1964)', 'Unos 4,6 millones de contratos', 'para trabajar en el campo y los ferrocarriles de EE. UU.', { x: 1440, y: 140, w: 500, accent: '#c9a227' });
  };

  // ================================================================ C1: Luzon, 1945 — the Escuadrón 201 on its airstrip
  const Lz = S.luzonField('morning');
  const pil = [[CAST[0], -0.55, -4.85], [CAST[4], 0.25, -4.7], [CAST[7], 1.05, -4.8], [CAST[2], 1.85, -4.95]].map(([who, x, z], i) => { const r = K.person(Lz, who, 'pilotoMx', x, z, 0.08 * (1.5 - i)); r.i = i; return r; });
  const mec = [[CAST[3], -3.6, -4.2, Math.PI / 2], [CAST[9], 1.9, -6.6, -Math.PI / 2 + 0.4]].map(([who, x, z, yaw], i) => { const r = K.person(Lz, who, 'mecanicoMx', x, z, yaw); r.i = i; return r; });
  const actC1 = t => {
    pil.forEach(r => K.act(r, r.i % 2 ? A.crossArms(t, r.i) : A.handsOnHips(t, r.i), t, { mouth: 'smile' }));
    mec.forEach(r => K.act(r, r.i ? A.crossArms(t, r.i + 5) : A.typeKeys(t, r.i + 4, 0.8), t, { mouth: 'neutral' }));
    Lz.planes.forEach((p, i) => p.spin(t, i === 1 && t > tFue ? 22 : 0));
    return U.film(t) + U.stamp(t, tC1 + 0.2, tC2 + 0.2, '1945', 'Luzón, Filipinas')
      + U.who(t, tEsc - 0.2, tC2 + 0.25, 'Escuadrón 201', 'Fuerza Aérea Expedicionaria Mexicana · unos 300 hombres', { code: 'mx' });
  };

  // C1b: a P-47 of the 201 rolls down the steel matting and lifts off
  const tko = P.aircraft('p47', { col: '#7a7e74', mx: true }); Lz.add(tko);
  const actC1b = t => { const u = Math.max(0, t - tC1b), z = 14 - 4 * u - 3.2 * u * u, lift = ss(1.9, 2.6, u) * (u - 1.9) * 1.6;
    tko.position.set(1.2, 1.08 + Math.max(0, lift), z); tko.rotation.set(-0.2 + 0.2 * ss(0.8, 1.6, u) - 0.08 * ss(1.9, 2.6, u), Math.PI, 0); tko.spin(t, 30);
    pil.forEach(r => K.act(r, A.wave(t, r.i, r.i % 2 ? 'R' : 'L'), t, { mouth: 'smile' })); Lz.planes.forEach(p => p.spin(t, 0));
    return U.film(t) + U.who(t, tEsc - 0.2, tC2 + 0.25, 'Escuadrón 201', 'Fuerza Aérea Expedicionaria Mexicana · unos 300 hombres', { code: 'mx' }); };
  // ================================================================ C2: P-47s of the 201 over Luzon; C3: five planes into the sunset
  const Sk = S.W1.skyStage('day', { ground: ['#4e7a3e', '#467036'], clouds: 20 });
  const fl = [0, 1, 2].map(() => { const p = P.aircraft('p47', { col: '#7a7e74', mx: true }); Sk.add(p); return p; });
  const ALT = 30, X = t => -10 + (t - tC2) * 8;
  const actC2 = t => { const x = X(t);
    fl.forEach((p, i) => { p.position.set(x - i * 4.2, ALT + i * 0.7 + 0.3 * Math.sin(t * 1.3 + i), -i * 3.4); p.rotation.set(0, Math.PI / 2, -0.06 * Math.sin(t * 1.1 + i)); p.spin(t); });
    return U.film(t) + U.popCard(t, tFil - 0.1, tC3 + 0.25, 'LAS «ÁGUILAS AZTECAS»', 'Decenas de misiones de combate', 'integrados al 58.º Grupo de Caza de EE. UU.', { x: 1440, y: 140, w: 470, accent: '#1f7a3a' }); };
  const Sd = S.W1.skyStage('dusk', { ground: ['#3e5a34', '#365030'], clouds: 16 });
  const five = [0, 1, 2, 3, 4].map(() => { const p = P.aircraft('p47', { col: '#6a6e66', mx: true }); Sd.add(p); return p; });
  const actC3 = t => { const d = (t - tC3) * 7;
    five.forEach((p, i) => { const off = [[0, 0], [-3.2, 2.6], [3.2, 2.6], [-6.4, 5.2], [6.4, 5.2]][i]; p.position.set(off[0], ALT + 0.6 * Math.sin(t + i) + (i % 2) * 0.5, -20 - d - off[1]); p.rotation.set(0.05, Math.PI, 0); p.spin(t); });
    return U.film(t) + U.solemn(t, tCin - 0.1, ctx.dur + 1, 'Cinco de sus pilotos no regresaron', 'Escuadrón 201 · Filipinas, 1945', { y: 150 }); };

  const sfx = [
    { t: 0, type: 'paper', vol: 0.3 }, { t: 0.5, type: 'sting', vol: 0.25 },
    { t: tA1, type: 'waves', dur: tA2 - tA1, vol: 0.4 }, { t: tA1, type: 'engine', dur: tA2 - tA1, vol: 0.12 }, { t: tSub - 0.3, type: 'swoosh', vol: 0.25 },
    { t: tHit, type: 'bigboom', vol: 0.55 }, { t: tHit + 0.3, type: 'fire', dur: tA2 - tHit - 0.3, vol: 0.35 },
    { t: tA2, type: 'paper', vol: 0.25 }, { t: tPot - 0.2, type: 'tick', vol: 0.25 }, { t: tFaj - 0.2, type: 'tick', vol: 0.25 },
    { t: tB1, type: 'crowd', dur: tB2 - tB1, vol: 0.18 }, { t: tEje - 0.05, type: 'stamp', vol: 0.4 }, { t: tEje + 0.3, type: 'applause', dur: 2.0, vol: 0.4 },
    { t: tB2, type: 'train', dur: tB3 - tB2, vol: 0.45 },
    { t: tB3, type: 'birds', dur: tC1 - tB3, vol: 0.3 }, { t: tB3, type: 'wind', dur: tC1 - tB3, vol: 0.15 },
    { t: tC1, type: 'engines', dur: tC2 - tC1, vol: 0.3 }, { t: tC1, type: 'steps', dur: tC2 - tC1, vol: 0.2 },
    { t: tC2, type: 'plane', dur: tC3 - tC2, vol: 0.5 }, { t: tC3, type: 'plane', dur: 2.5, vol: 0.25 }, { t: tC3 + 0.2, type: 'drone', dur: ctx.dur - tC3, vol: 0.2 },
  ];
  const shots = [
    { t0: 0, set: Wm, p0: [gx, 30, gz + 16], l0: [gx, 0, gz], p1: [gx + 1, 26, gz + 13], l1: [gx + 1, 0, gz - 0.5], fov0: 40, act: actA0 },
    { t0: tA1, set: Ns, p0: [-9, 3.6, 26], l0: [1, 2.2, -16], p1: [-9.5, 3.4, 24], l1: [-1, 2.2, -16], fov0: 42, act: actA1 },
    { t0: tA2, set: Wm, p0: [fx, 14, fz + 8], l0: [fx, 0, fz], p1: [fx + 0.5, 12, fz + 7], l1: [fx + 0.5, 0, fz - 0.3], fov0: 40, act: actA2 },
    { t0: tB1, set: Cm, p0: [1.7, 2.05, -4.5], l0: [0, 1.72, -6.25], p1: [1.5, 2.0, -4.75], l1: [0, 1.74, -6.25], fov0: 38, act: actB1 },
    { t0: tB2, set: Nr, p0: [14, 1.4, 6.5], l0: [-2, 2.2, 0], p1: [14.5, 1.5, 7.2], l1: [2, 2.2, 0], fov0: 44, act: actB2 },
    { t0: tB3, set: Bf, p0: [2.2, 1.6, 4.4], l0: [-0.4, 0.35, -3.6], p1: [1.9, 1.55, 3.9], l1: [-0.4, 0.35, -3.6], fov0: 44, act: actB3 },
    { t0: tC1, set: Lz, p0: [1.0, 1.0, -0.9], l0: [0.6, 1.05, -7.0], p1: [0.85, 0.98, -1.5], l1: [0.6, 1.05, -7.0], fov0: 46, act: actC1 },
    { t0: tC1b, set: Lz, p0: [4.6, 0.7, 2.0], l0: [1.2, 1.3, -6], p1: [4.4, 0.75, 1.0], l1: [1.2, 2.2, -16], fov0: 46, act: actC1b },
    { t0: tC2, set: Sk, p0: [X(tC2) - 6, ALT + 2.2, 11], l0: [X(tC2) - 2, ALT, -2], p1: [X(tC3) - 6, ALT + 2.4, 11], l1: [X(tC3) - 2, ALT, -2], fov0: 44, ease: 'lin', act: actC2 },
    { t0: tC3, set: Sd, p0: [0, ALT + 2.5, -8], l0: [0, ALT + 1.5, -40], p1: [0, ALT + 2.8, -10], l1: [0, ALT + 1.8, -50], fov0: 44, act: actC3 },
  ];
  const inst = { scene: Wm, scenes: [Wm, Ns, Cm, Nr, Bf, Lz, Sk, Sd], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
