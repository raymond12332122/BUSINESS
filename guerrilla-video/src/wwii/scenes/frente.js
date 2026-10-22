import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as M from '../../lib/motion.js';
import { label } from '../../lib/kit.js';
import { run, wt } from '../../whatif/shots.js';
const { ss, clamp, HAND } = M;
const V = () => new THREE.Vector3();
const CAST = ['oguri', 'tamamo', 'cafe', 'doto', 'mcqueen', 'daiwa', 'suzuka', 'helios', 'spe', 'hishi'];

// The home front: the aircraft plants and the women who ran them, the Soviet women at the front and the Night Witches,
// Bletchley Park, and the science the war sped up.
export function build(ctx) {
  const L = ctx.L;
  const tTre = wt(L[0], 'trescientos'), tMil = wt(L[0], 'millones'), tInd = wt(L[0], 'industria');
  const tOch = wt(L[1], 'ochocientas'), tBru = wt(L[1], 'brujas'), tBom = wt(L[1], 'bombardeaban'), tBip = wt(L[1], 'biplanos');
  const tBle = wt(L[2], 'bletchley'), tTur = wt(L[2], 'turing'), tMuj = wt(L[2], 'mujeres'), tEni = wt(L[2], 'enigma'), tAce = wt(L[2], 'acelero'),
    tRad = wt(L[2], 'radar'), tPen = wt(L[2], 'penicilina'), tCoh = wt(L[2], 'cohetes'), tCom = wt(L[2], 'computadoras');
  const tA2 = tMil - 0.35, tB1 = L[1].t0 - 0.25, tB2 = tBru - 0.35, tC1 = L[2].t0 - 0.25, tC2 = tAce - 0.3;

  // ================================================================ A: an aircraft plant, 1943 — women rivet the fighters on the line
  const Pl = S.aircraftPlant();
  const near = Pl.planes[0][0], nx = near.position.x;
  const riv = [[CAST[5], -3.6, 0.92, 0.3], [CAST[8], -4.45, 0.9, 0.22]].map(([who, z, y, sx], i) => { const r = K.person(Pl, who, 'remachadora', nx + sx + 0.32, z, -Math.PI / 2, { shadow: false }); r.z = z; r.y = y; r.sx = sx; r.i = i; return r; });
  const sparks = riv.map(() => { const g = P.glow('#ffe6a0', 0.25, 0); Pl.add(g); return g; });
  const walkers = [[CAST[1], 1.1, -16, 0], [CAST[3], 0.7, -9.5, 0]].map(([who, x, z, yaw], i) => { const r = K.person(Pl, who, i ? 'obrero' : 'remachadora', x, z, yaw, { shadow: false }); r.x0 = x; r.z0 = z; r.yaw = yaw; return r; });
  const rosie = K.person(Pl, 'oguri', 'remachadora', 0.35, 1.0, -0.1);
  const actA = t => {
    riv.forEach((r, i) => { const jt = 0.006 * Math.sin(t * 53 + i), x = nx + r.sx, P0 = [x, r.y + 0.04 + jt, r.z + 0.05], P1 = [x, r.y - 0.02 + jt, r.z - 0.08];
      K.act(r, A.hands(t, i + 2, P0, P1, 1), t, { mouth: 'neutral', eye: 'squint' });
      const on = Math.sin(t * 9 + i * 2) > 0.2; sparks[i].position.set(x - 0.02, r.y + 0.01, r.z); sparks[i].material.opacity = on ? 0.9 : 0; sparks[i].scale.setScalar(on ? 0.18 + 0.1 * Math.random() : 0.1); });
    walkers.forEach((r, i) => { const D = (t + i * 3) * 0.35, dz = D; r.root.position.set(r.x0, 0, r.z0 + dz); K.act(r, M.gait(D / r.unit, { amp: 0.8, seed: i + 5 }), t, { mouth: 'neutral' }); });
    rosie.root.visible = false;
    return U.film(t) + U.stamp(t, 0.4, tA2 + 0.2, '1943', 'una fábrica de aviones, Estados Unidos')
      + U.bigNumber(t, tTre - 0.2, tA2 + 0.25, '300 000', 'AVIONES FABRICADOS EN ESTADOS UNIDOS', { y: 200, size: 108, count: 0, band: true });
  };
  // A2: Rosie the Riveter — "We can do it!"
  const actA2 = t => {
    riv.forEach((r, i) => K.act(r, A.hands(t, i + 2, [nx + r.sx, r.y + 0.04, r.z + 0.05], [nx + r.sx, r.y - 0.02, r.z - 0.08], 1), t, { mouth: 'neutral', eye: 'squint' }));
    const e = ss(tA2 + 0.35, tA2 + 0.85, t); rosie.root.visible = true;
    K.act(rosie, M.mix(A.rivet(t, 9, 0.6), A.flex(t, 9, 1), e), t, { mouth: e > 0.5 ? 'smile' : 'neutral' });
    rosie.root.updateMatrixWorld(true); const hp = rosie.j.head.bone.getWorldPosition(V()).add(V().set(-0.42, 0.36, 0));
    return U.film(t) + U.bubble(ctx, hp, '¡Podemos hacerlo!', ss(tA2 + 0.6, tA2 + 0.9, t) * (1 - ss(tB1 - 0.2, tB1 + 0.1, t)), { size: 34 })
      + U.popCard(t, tMil + 0.2, tB1 + 0.25, 'ROSIE LA REMACHADORA', 'Millones de mujeres', 'entraron a trabajar en la industria', { x: 1440, y: 140, w: 470, accent: '#c0272d' });
  };

  // ================================================================ B1: more than 800,000 Soviet women went to the front
  const Wf = S.plains('golden', { burning: false });
  const sov = Array.from({ length: 7 }, (_, i) => { const r = K.person(Wf, CAST[(i + 2) % 10], 'sovieticoArmado', -2.4 + (i % 4) * 1.5 + (i >> 2) * 0.7, -3.4 - (i >> 2) * 1.4, 0, { shadow: false }); r.x0 = r.root.position.x; r.z0 = r.root.position.z; r.i = i; return r; });
  const actB1 = t => {
    sov.forEach(r => { const D = (t - tB1 + 0.4) * 0.42, z = r.z0 + D; r.root.position.set(r.x0, 0, z); K.act(r, M.mix(A.portRifle(t, r.i), A.march(D / r.unit, r.i, 0.95), 0.7), t, { mouth: 'neutral' }); });
    return U.film(t) + U.bigNumber(t, tOch - 0.2, tB2 + 0.25, '800 000', 'MUJERES SOVIÉTICAS FUERON AL FRENTE', { y: 200, size: 108, count: 0, band: true, prefix: '+' });
  };

  // ================================================================ B2: the Night Witches — a Po-2 glides over the lines in the dark, engine idling
  const Nf = S.nightFront(), ALT = Nf.ALT;
  const po = P.biplane();
  const crew = [[0.42, 'mcqueen'], [-0.38, 'suzuka']].map(([z, who], i) => { const r = K.person(po, who, 'brujaNoche', 0, z, 0, { shadow: false }); K.seatOn(r, -0.02); r.y0 = r.root.position.y; r.i = i; return r; });
  Nf.add(po); po.rotation.y = Math.PI / 2;
  const moonFill = new THREE.PointLight('#a8bcff', 5, 9, 1.2); moonFill.position.set(-1.5, 3, 2.5); po.add(moonFill);   // moonlight on the crew and the wings
  const VX = 3.2, X = t => -6 + (t - tB2) * VX, durB2 = tC1 - tB2;
  const flash = P.glow('#ffb060', 30, 0); Nf.add(flash);
  const tDrop = tBom + 0.35;
  const actB2 = t => {
    const x = X(t), roll = 0.06 * Math.sin(t * 0.9), pitch = -0.03;
    po.position.set(x, ALT + 0.25 * Math.sin(t * 0.7), 0); po.rotation.set(pitch, Math.PI / 2, roll, 'YXZ'); po.spin(t, 7);
    crew.forEach(r => { r.root.position.y = r.y0; const p = A.sit(t, r.i + 3); p.head = [p.head[0] - 4, p.head[1] + (r.i ? -14 : 6) * Math.sin(t * 0.6 + r.i), 0]; K.act(r, p, t, { mouth: 'neutral' }); });
    po.bombs.forEach((b, i) => { const dt = t - tDrop - i * 0.25; if (dt <= 0) { b.position.copy(b.home); b.visible = true; return; }
      b.position.set(b.home.x, b.home.y - 2.4 * dt * dt, b.home.z - 0.9 * dt); b.visible = dt < 2.2; });
    const fk = t - (tDrop + 1.9); flash.position.set(x - 1.5, 2, -10); flash.material.opacity = fk > 0 ? 0.9 * Math.exp(-fk * 2.2) : 0; flash.scale.setScalar(20 + 30 * Math.max(0, fk));
    return U.film(t) + U.popCard(t, tBru - 0.1, tC1 + 0.25, 'LAS BRUJAS DE LA NOCHE', '588.º Regimiento de Bombardeo Nocturno', 'unas 24 000 misiones, con tripulaciones sólo de mujeres', { x: 1440, y: 140, w: 480, accent: '#c8302a' })
      + U.stamp(t, tB2 + 0.3, tC1 + 0.2, '1942 – 1945', 'frente oriental, de noche');
  };

  // ================================================================ C1: Bletchley Park — the bombe, an Enigma machine, Turing and the women codebreakers
  const Bp = S.bletchley();
  const turing = K.person(Bp, 'helios', 'turing', 0.45, -1.2, 0.35);
  const wrens = [[CAST[2], -0.5, -2.36, -Math.PI / 2 - 0.6], [CAST[9], 1.2, -1.33, 0]].map(([who, x, z, yaw], i) => { const r = K.person(Bp, who, 'wren', x, z, yaw); r.i = i; return r; });
  const enP = Bp.enigma.position, bmP = Bp.bombe.position;
  const actC1 = t => {
    Bp.bombe.spin(t); Bp.enigma.lamp(t > tEni - 0.6 ? Math.floor(t * 4.3 * 7) % 26 : -1);
    K.act(turing, A.think(t, 4), t, { mouth: 'neutral' });
    const [w0, w1] = wrens;
    K.act(w0, A.hands(t, 6, [bmP.x + 0.56, 0.66, bmP.z + 0.3], [bmP.x + 0.68, 0.64 + 0.01 * Math.sin(t * 3), bmP.z + 0.3], 1), t, { mouth: 'neutral' });
    const k = Math.floor(t * 4.3) % 9, kz = 0.075 - (k % 3) * 0.022, kx = -0.08 + (k % 7) * 0.024, j = 0.01 * Math.max(0, Math.sin(t * 27));   // the machine is turned toward her: local (x, z) -> world (-x, -z)
    K.act(w1, A.hands(t, 7, [enP.x + 0.07, Bp.table + 0.1, enP.z - 0.06], [enP.x - kx, Bp.table + 0.1 + j, enP.z - kz], 1), t, { mouth: 'neutral' });
    return U.film(t) + U.stamp(t, tC1 + 0.2, tC2 + 0.2, '1943', 'Bletchley Park, Inglaterra')
      + U.who(t, tTur - 0.2, tC2 + 0.2, 'Alan Turing', 'Matemático británico · diseñó la «bomba» que ayudaba a descifrar Enigma', { side: 'l', w: 640 })
      + U.popCard(t, tMuj + 0.1, tC2 + 0.25, 'BLETCHLEY PARK', 'Tres de cada cuatro eran mujeres', 'los criptólogos polacos habían roto Enigma primero', { x: 1440, y: 330, w: 470, accent: '#3f6fb5' });
  };

  // ================================================================ C2: the science the war sped up — four exhibits light up as they are named
  const Ex = S.exhibit();
  const CUES = [[tRad, 'RADAR'], [tPen, 'PENICILINA'], [tCoh, 'COHETES'], [tCom, 'COMPUTADORAS']];
  const actC2 = t => {
    Ex.spots.forEach((l, i) => { l.intensity = 26 * ss(CUES[i][0] - 0.3, CUES[i][0] + 0.1, t); });
    return U.film(t) + CUES.map(([tc, name], i) => label(ctx, V().set(Ex.X[i], Ex.TOP + (i === 2 ? 1.75 : i === 0 ? 1.55 : 1.0), 0), name, 'w', ss(tc - 0.2, tc + 0.2, t))).join('');
  };

  const sfx = [
    { t: 0, type: 'clank', vol: 0.3 }, { t: 0, type: 'factory', dur: tB1, vol: 0.35 }, ...Array.from({ length: 9 }, (_, i) => ({ t: 0.3 + i * 0.55, type: 'click', vol: 0.18 })),
    { t: 0.5, type: 'clank', vol: 0.22 }, { t: tA2 + 0.6, type: 'swoosh', vol: 0.3 }, { t: tA2 + 0.9, type: 'pop', vol: 0.3 },
    { t: tB1, type: 'wind', dur: tB2 - tB1, vol: 0.35 }, { t: tB1, type: 'march', dur: tB2 - tB1, vol: 0.3 },
    { t: tB2, type: 'wind', dur: tC1 - tB2, vol: 0.5 }, { t: tB2, type: 'engine', dur: tC1 - tB2, vol: 0.12 }, { t: tDrop, type: 'whoosh', vol: 0.3 }, { t: tDrop + 1.9, type: 'boom', vol: 0.3 },
    { t: tC1, type: 'tick', dur: tC2 - tC1, vol: 0.18 }, { t: tC1 + 0.3, type: 'typewriter', dur: tC2 - tC1 - 0.3, vol: 0.18 },
    ...CUES.map(([tc]) => ({ t: tc, type: 'click', vol: 0.3 })), { t: tC2, type: 'beep', vol: 0.15 },
  ];
  const shots = [
    { t0: 0, set: Pl, p0: [0.3, 1.15, -1.9], l0: [-2.7, 0.75, -4.4], p1: [0.1, 1.12, -2.2], l1: [-2.7, 0.75, -4.5], fov0: 46, act: actA },
    { t0: tA2, set: Pl, p0: [0.85, 0.78, 3.0], l0: [0.25, 0.62, 0.9], p1: [0.8, 0.76, 2.7], l1: [0.25, 0.64, 0.9], fov0: 40, act: actA2 },
    { t0: tB1, set: Wf, p0: [1.0, 0.85, 2.3], l0: [-0.3, 0.7, -3.5], p1: [0.85, 0.85, 1.9], l1: [-0.3, 0.7, -3.5], fov0: 44, act: actB1 },
    { t0: tB2, set: Nf, p0: [X(tB2) - 1.6, ALT + 0.55, 4.6], l0: [X(tB2) + 0.3, ALT + 0.3, 0], p1: [X(tB2 + durB2) - 2.2, ALT + 0.45, 4.2], l1: [X(tB2 + durB2) + 0.3, ALT + 0.3, 0], fov0: 42, ease: 'lin', act: actB2 },
    { t0: tC1, set: Bp, p0: [2.5, 1.05, 2.1], l0: [-0.5, 0.65, -2.0], p1: [2.2, 1.0, 1.6], l1: [-0.5, 0.65, -2.1], fov0: 44, act: actC1 },
    { t0: tC2, set: Ex, p0: [-3.4, 1.45, 4.2], l0: [-2.4, 0.95, 0], p1: [1.2, 1.6, 7.6], l1: [0.6, 0.95, 0], fov0: 44, act: actC2 },
  ];
  const inst = { scene: Pl, scenes: [Pl, Wf, Nf, Bp, Ex], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
