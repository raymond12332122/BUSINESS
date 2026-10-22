import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as MP from '../maps.js';
import * as M from '../../lib/motion.js';
import { flagPole } from '../../whatif/flags.js';
import { run, wt } from '../../whatif/shots.js';
const { ss, clamp } = M;
const EU = MP.EU, fade = U.fade;
export const preload = MP.preload;
const V = () => new THREE.Vector3();
const CAST = ['oguri', 'tamamo', 'cafe', 'doto', 'mcqueen', 'daiwa', 'suzuka', 'helios', 'spe', 'hishi'];

// The end in Europe: D-Day, the liberation of Paris, the Red Army's advance, Berlin, the bunker, and VE night in London.
export function build(ctx) {
  const L = ctx.L;
  const tDia = wt(L[0], 'dia'), tCas = wt(L[0], 'casi'), tCie = wt(L[0], 'ciento'), tDes = wt(L[0], 'desembarcaron'), tNor = wt(L[0], 'normandia'), tMay = wt(L[0], 'mayor');
  const tPar = wt(L[1], 'paris'), tEst = wt(L[1], 'este'), tRoj = wt(L[1], 'rojo');
  const tSov = wt(L[2], 'sovieticos'), tBer = wt(L[2], 'berlin'), tHit = wt(L[2], 'hitler'), tSui = wt(L[2], 'suicido'), tOch = wt(L[2], 'ocho'), tRin = wt(L[2], 'rindio');
  const tA2 = tCas - 0.3, tA3 = tMay - 0.3, tB1 = L[1].t0 - 0.25, tB2 = tEst - 0.3, tC1 = L[2].t0 - 0.25, tC2 = tHit - 0.3, tC3 = tOch - 0.3;

  // ================================================================ A1: dawn over the Channel — the boats head for the coast
  const Ch = S.channelFleet();
  Ch.boats.slice(0, 3).forEach((b, j) => { for (let i = 0; i < 6; i++) { const r = K.person(b, CAST[(i + j * 3) % 10], 'estadounidense', -0.45 + (i % 2) * 0.9, 1.6 - Math.floor(i / 2) * 1.2, 0, { shadow: false }); r.root.position.y = b.deck; r.i = i + j * 6; (b.crew = b.crew || []).push(r); } });
  const actA1 = t => {
    Ch.boats.slice(0, 3).forEach(b => b.crew.forEach(r => K.act(r, A.crouch(t, r.i, 0.25), t, { mouth: 'frown' })));
    return U.film(t) + U.stamp(t, 0.4, tA2 + 0.2, '6 de junio de 1944', 'Canal de la Mancha')
      + U.slam(t, tDia - 0.05, tA2 + 0.25, 'DÍA D', { x: 960, y: 300, rot: -4, col: '#3f6fb5', size: 96 });
  };

  // ================================================================ A2: inside a Higgins boat — the ramp drops on Omaha Beach
  const Nm = S.normandy('overcast');
  const hb = P.higgins(); hb.position.set(0, -0.12, -4.6); Nm.add(hb);
  const squad = Array.from({ length: 12 }, (_, i) => { const col = i % 3, row = Math.floor(i / 3), r = K.person(Nm, CAST[(i + 2) % 10], 'estadounidense', -0.75 + col * 0.75, -3.7 - row * 0.95, (col - 1) * 0.06, { shadow: false }); r.x0 = r.root.position.x; r.z0 = r.root.position.z; r.row = row; r.i = i; return r; });
  const tDrop = tDes + 0.05, yAt = z => z < -1.3 ? -0.12 + 0.21 : Math.max(-0.28, 0.09 - (z + 1.3) * 0.3);
  const actA2 = t => {
    const k = ss(tDrop, tDrop + 0.45, t); hb.ramp.rotation.x = 1.42 * k * k; hb.position.y = -0.12 + 0.05 * Math.sin(t * 1.5);
    squad.forEach(r => { const go = Math.max(0, t - tDrop - 0.2 - r.row * 0.22 - (r.i % 3) * 0.06), D = go * 1.15, z = r.z0 + D;
      r.root.position.set(r.x0 + (r.i % 3 - 1) * 0.15 * clamp(D), yAt(z) + (z < -1.3 ? hb.position.y + 0.12 : 0), z);
      K.act(r, go > 0 ? M.mix(A.stand(t, r.i), M.gait(D / r.unit, { amp: 1, seed: r.i, run: 0.4 }), clamp(go * 3)) : A.crouch(t, r.i, 0.3), t, { mouth: go > 0 ? 'open' : 'frown' }); });
    return U.film(t) + U.bigNumber(t, tCie - 0.2, tA3 + 0.25, '160 000', 'SOLDADOS ALIADOS', { y: 190, size: 104, count: 0, band: true, prefix: 'casi ' })
      + U.stamp(t, tA2 + 0.3, tA3 + 0.2, 'playa Omaha', 'Normandía, Francia');
  };

  // ================================================================ A3: the map — across the Channel to the five beaches
  const Mn = MP.europe({ period: 'w1944' });
  const crossings = [[[-1.4, 50.75], [-1.2, 50.1], [-0.9, 49.5]], [[-0.9, 50.8], [-0.6, 50.1], [-0.45, 49.45]], [[-0.2, 50.82], [0.1, 50.15], [-0.15, 49.4]]].map(p => EU.arrow(Mn, p, '#3f6fb5', 0.24));
  const head = EU.zone(Mn, [[-1.4, 49.4], [-0.9, 49.36], [-0.2, 49.3], [0.2, 49.28], [0.25, 49.1], [-0.6, 49.15], [-1.3, 49.2]], '#3f6fb5', { opacity: 0.6 });
  const actA3 = t => { Mn.paint('w1944');
    crossings.forEach((a, i) => a.set(ss(tA3 + 0.1 + i * 0.15, tA3 + 1.0 + i * 0.15, t))); head.set(ss(tA3 + 0.7, tA3 + 1.3, t));
    return U.film(t) + EU.areaLabel(ctx, -0.6, 48.75, 'NORMANDÍA', fade(t, tA3 + 0.5, ctx.dur + 1), 'st')
      + U.popCard(t, tA3 + 0.3, tB1 + 0.25, 'LA MAYOR INVASIÓN POR MAR', 'Utah · Omaha · Gold · Juno · Sword', 'las cinco playas del desembarco', { x: 1440, y: 140, w: 470, accent: '#3f6fb5' }); };
  const [nx, , nz] = EU.wpos(-0.7, 49.9);

  // ================================================================ B1: Paris, 26 August 1944 — de Gaulle walks down the Champs-Élysées
  const Pa = S.champs('overcast');
  const dg = K.stand_in(Pa, 'degaulle', 0, -9, 0);
  const escort = [[-1.1, -9.6], [1.1, -9.6], [-1.6, -11], [1.6, -11]].map(([x, z], i) => { const r = K.person(Pa, CAST[(i + 5) % 10], 'frances', x, z, 0, { shadow: false }); r.x0 = x; r.z0 = z; r.i = i; return r; });
  const crowdL = K.crowd(Pa, ['civil', 'civilMujer', 'civilMujer'], 22, [-7.6, -24, -4.9, 1], { seed: 41, face: [0, -8] });
  const crowdR = K.crowd(Pa, ['civilMujer', 'civil', 'frances'], 22, [4.9, -24, 7.6, 1], { seed: 42, face: [0, -8] });
  const flagsP = [-5, -12, -19, -26].flatMap(z => [-4.6, 4.6].map(x => { const f = flagPole('fr', { h: 3.0, w: 1.5 }); f.position.set(x, 0, z); Pa.add(f); return f; }));
  const tank = P.tank('sherman', { col: '#5a6040' }); tank.scale.setScalar(0.48); tank.position.set(2.6, 0, -18); Pa.add(tank);
  const actB1 = t => { const D = (t - tB1 + 0.5) * 0.36, z = -9 + D;
    dg.root.position.set(0, 0, z); K.act(dg, M.gait(D / dg.unit, { amp: 0.85, seed: 1 }), t, { smile: 0.3 });
    escort.forEach(r => { r.root.position.set(r.x0, 0, r.z0 + D); K.act(r, M.gait(D / r.unit, { amp: 0.9, seed: r.i }), t, { mouth: 'smile' }); });
    [...crowdL, ...crowdR].forEach((r, i) => K.act(r, i % 3 ? A.cheer(t, i) : A.wave(t, i, i % 2 ? 'R' : 'L'), t, { mouth: 'open' }));
    flagsP.forEach(f => f.wave(t, 0.6)); tank.position.z = -18 + D; tank.drive(D);
    return U.film(t) + U.stamp(t, tB1 + 0.3, tB2 + 0.2, 'agosto de 1944', 'París liberada')
      + U.who(t, tPar - 0.1, tB2 + 0.2, 'Charles de Gaulle', 'Líder de la Francia Libre', { code: 'fr', actor: 'Mejiro McQueen' }); };

  // ================================================================ B2: the Red Army sweeps west; the Allies push east
  const Mb = MP.europe({ period: 'w1944' });
  const red = [[[30, 53.8], [25, 53.2], [19.5, 52.8], [14.4, 52.6]], [[28, 49.5], [22.5, 50.2], [17.5, 51.2], [14.0, 52.0]], [[25, 46.5], [20, 47.4], [16.5, 48.2]]].map(p => EU.arrow(Mb, p, '#c0453a', 0.62));
  const blue = [[[1.0, 49.6], [5.5, 50.6], [9.5, 51.6], [12.2, 52.2]], [[4.0, 47.8], [8.5, 48.8], [11.5, 49.6]]].map(p => EU.arrow(Mb, p, '#3f6fb5', 0.55));
  const actB2 = t => { Mb.paint('w1944', 'w1945', ss(tB2 + 0.3, tC1, t));
    red.forEach((a, i) => a.set(ss(tB2 + i * 0.15, tRoj + 0.9 + i * 0.15, t))); blue.forEach((a, i) => a.set(ss(tB2 + 0.4 + i * 0.15, tRoj + 1.2, t)));
    return U.film(t) + EU.chip(ctx, 26, 51.5, fade(t, tRoj - 0.2, ctx.dur + 1), 'EJÉRCITO ROJO', 'avanza hacia Berlín', '#c0453a', 0.4)
      + EU.city(ctx, Mb, 'Berlín', fade(t, tB2 + 0.6, ctx.dur + 1)); };
  const [bx, , bz] = EU.wpos(18, 51);

  // ================================================================ C1: Berlin — Soviet soldiers raise their flag on the Reichstag
  const Be = S.berlin('overcast');
  const roofZ = -34 + 8 - 0.6, roofY = Be.reich.roofY;
  const TW = [-11.5, 11.45, -27.5];   // the top of the front-left corner tower
  const fl = flagPole('su', { h: 2.2, w: 1.4 }); fl.position.set(TW[0] + 0.5, TW[1], TW[2] + 0.6); Be.add(fl);
  const raisers = [[TW[0] - 0.05, TW[2] + 0.75, 0.5], [TW[0] + 1.2, TW[2] + 0.2, -0.4]].map(([x, z, yaw], i) => { const r = K.person(Be, CAST[(i + 3) % 10], 'sovietico', x, z, yaw); r.root.position.y = TW[1]; r.i = i; return r; });
  const advance = Array.from({ length: 6 }, (_, i) => { const r = K.person(Be, CAST[(i + 6) % 10], 'sovieticoArmado', -2.4 + (i % 3) * 1.6, -2 - Math.floor(i / 3) * 1.3, Math.PI, { shadow: false }); r.x0 = r.root.position.x; r.z0 = r.root.position.z; r.i = i; return r; });
  const t34 = P.tank('t34', { col: '#4a5a3a' }); t34.scale.setScalar(0.48); t34.position.set(5.5, 0, -6); t34.rotation.y = Math.PI + 0.2; Be.add(t34);
  const actC1 = t => {
    fl.wave(t, 1.0); const up = ss(tC1 + 0.2, tBer + 0.4, t); fl.position.y = TW[1] - 1.2 * (1 - up);
    const px = TW[0] + 0.5, pz = TW[2] + 0.6; K.act(raisers[0], A.hands(t, 3, [px, TW[1] + 0.62 - 0.3 * (1 - up), pz], [px, TW[1] + 0.86 - 0.3 * (1 - up), pz], 1), t, { mouth: 'open' });
    K.act(raisers[1], A.wave(t, 4, 'R'), t, { mouth: 'open' });
    advance.forEach(r => { const D = (t - tC1 + 0.3) * 0.4; r.root.position.set(r.x0, 0, r.z0 - D); K.act(r, M.mix(A.portRifle(t, r.i), M.gait(D / r.unit, { amp: 1, seed: r.i }), 0.7), t, { mouth: 'neutral' }); });
    return U.film(t) + U.stamp(t, tC1 + 0.3, tC2 + 0.2, 'abril – mayo de 1945', 'Berlín'); };

  // ================================================================ C2: the bunker — a silhouette at the end of the corridor; the light goes out
  const Bk = S.bunker();
  const sil = K.silhouette('hitler', 1.8); sil.position.set(0, 0, -3.6); Bk.add(sil);
  const actC2 = t => { const off = ss(tSui + 0.3, tSui + 0.45, t), fl2 = 0.75 + 0.25 * Math.sin(t * 37) * Math.sin(t * 13);
    Bk.bulb.intensity = 6 * fl2 * (1 - off); Bk.lamp.material.opacity = 0.9 * (1 - off); sil.gesture(t, 0.6); sil.material.opacity = 1 - off;
    return U.film(t) + U.dark(t, tHit - 0.2, tC3 + 0.2, 'Adolf Hitler', 'Se suicidó en su búnker el 30 de abril de 1945', { side: 'r' }); };

  // ================================================================ C3: VE night in London — the same street as the Blitz, now celebrating
  const Ln = S.blitzNight();
  Ln.fires.forEach(f => { f.visible = false; }); Ln.balloons.forEach(b => { b.visible = false; });
  const flood = [[-14, 2, -95], [-30, 2, -96]].map(([x, y, z]) => { const l = new THREE.SpotLight('#fff0d0', 900, 60, 0.35, 0.4, 1.2); l.position.set(x, y, z); l.target.position.set(-22, 14, -120); Ln.add(l, l.target); return l; });
  const party = K.crowd(Ln, ['civil', 'civilMujer', 'britanico', 'waaf', 'civilMujer'], 26, [-3.4, -8.5, 3.4, 0.6], { seed: 51, face: [0.8, 6] });
  party.filter((_, i) => i % 3 === 0).forEach((r, j) => K.holdIn(r, P.handFlag(j % 3 === 2 ? 'us' : 'gb', 1), 'R', [0, -0.02, 0.02]));   // little Union Jacks (and a few Stars and Stripes)
  const works = Array.from({ length: 7 }, (_, i) => { const g = P.glow(['#ffd27a', '#ff7a6a', '#8ad0ff', '#c8ff8a', '#ffb0f0', '#ffffff', '#ffd27a'][i], 1, 0); g.ph = i * 0.61; g.pos = V().set(-24 + (i * 37) % 48, 18 + (i * 13) % 14, -50 - (i * 29) % 40); g.material.fog = false; Ln.add(g); return g; });
  const actC3 = t => {
    party.forEach((r, i) => K.act(r, i % 3 === 0 ? A.wave(t, i, 'R') : i % 3 === 1 ? A.cheer(t, i) : A.clap(t, i), t, { mouth: 'open', eye: i % 4 ? undefined : 'happy' }));
    works.forEach(g => { const u = ((t + g.ph) * 0.55) % 1; g.position.copy(g.pos); g.material.opacity = u < 0.6 ? 1.0 * (1 - u / 0.6) : 0; g.scale.setScalar(6 + 40 * Math.min(1, u / 0.6)); });
    return U.film(t) + U.stamp(t, tC3 + 0.3, ctx.dur + 1, '8 de mayo de 1945', 'Londres · Día de la Victoria en Europa')
      + U.slam(t, tRin - 0.1, ctx.dur + 1, 'RENDICIÓN INCONDICIONAL', { x: 960, y: 260, rot: -4, col: '#b8342f', size: 64 }); };

  const sfx = [
    { t: 0, type: 'waves', dur: tA2, vol: 0.4 }, { t: 0, type: 'engines', dur: tA2, vol: 0.35 }, { t: 1.2, type: 'cannon', vol: 0.25 }, { t: 2.6, type: 'cannon', vol: 0.25 }, { t: tDia - 0.05, type: 'sting', vol: 0.4 },
    { t: tA2, type: 'waves', dur: tA3 - tA2, vol: 0.45 }, { t: tA2, type: 'engine', dur: tDrop - tA2, vol: 0.3 }, { t: tDrop, type: 'clank', vol: 0.5 }, { t: tDrop + 0.4, type: 'splash', vol: 0.45 },
    { t: tDrop + 0.5, type: 'shout', vol: 0.35 }, { t: tDrop + 0.6, type: 'gunfire', dur: tA3 - tDrop - 0.6, vol: 0.18 }, { t: tDrop + 1.0, type: 'boom', vol: 0.3 },
    { t: tA3, type: 'paper', vol: 0.3 }, { t: tA3 + 0.2, type: 'whoosh', vol: 0.3 },
    { t: tB1, type: 'cheer', dur: tB2 - tB1, vol: 0.45 }, { t: tB1, type: 'crowd', dur: tB2 - tB1, vol: 0.3 }, { t: tB1, type: 'march', dur: tB2 - tB1, vol: 0.2 },
    { t: tB2, type: 'whoosh', vol: 0.3 }, { t: tB2, type: 'drums', dur: tC1 - tB2, vol: 0.25 },
    { t: tC1, type: 'wind', dur: tC2 - tC1, vol: 0.3 }, { t: tC1, type: 'fire', dur: tC2 - tC1, vol: 0.25 }, { t: tC1 + 0.6, type: 'boom', vol: 0.25 }, { t: tBer, type: 'cheer', vol: 0.3 },
    { t: tC2, type: 'drone', dur: tC3 - tC2, vol: 0.3 }, { t: tSui + 0.3, type: 'click', vol: 0.4 },
    { t: tC3, type: 'cheer', dur: ctx.dur - tC3, vol: 0.5 }, { t: tC3, type: 'crowd', dur: ctx.dur - tC3, vol: 0.35 }, ...[0.5, 1.4, 2.2, 3.0, 3.7].map(d => ({ t: tC3 + d, type: 'pop', vol: 0.3 })), { t: tRin - 0.1, type: 'stamp', vol: 0.45 },
  ];
  const shots = [
    { t0: 0, set: Ch, p0: [8.5, 3.6, 9.5], l0: [-3, 0.6, -14], p1: [7.6, 3.3, 8.2], l1: [-3, 0.6, -14], fov0: 46, act: actA1 },
    { t0: tA2, set: Nm, p0: [0.45, 1.75, -7.9], l0: [0, 0.75, 3], p1: [0.3, 1.7, -5.6], l1: [0, 1.0, 12], fov0: 50, act: actA2 },
    { t0: tA3, set: Mn, p0: [nx, 9, nz + 6], l0: [nx, 0, nz], p1: [nx, 8, nz + 5.2], l1: [nx, 0, nz - 0.2], fov0: 40, act: actA3 },
    { t0: tB1, set: Pa, p0: [1.4, 1.8, 0.8], l0: [0, 1.5, -12], p1: [1.2, 1.75, 0.3], l1: [0, 1.5, -12], fov0: 44, act: actB1 },
    { t0: tB2, set: Mb, p0: [bx, 30, bz + 16], l0: [bx, 0, bz], p1: [bx - 2, 28, bz + 15], l1: [bx - 2, 0, bz], fov0: 40, act: actB2 },
    { t0: tC1, set: Be, p0: [2.6, 1.55, 3.4], l0: [-8.5, 7.8, -27], p1: [1.8, 1.6, 2.0], l1: [-9.5, 9.0, -27], fov0: 44, act: actC1 },
    { t0: tC2, set: Bk, p0: [0, 1.15, 3.2], l0: [0, 0.95, -3.6], p1: [0, 1.12, 2.5], l1: [0, 0.95, -3.6], fov0: 40, act: actC2 },
    { t0: tC3, set: Ln, p0: [1.4, 1.15, 4.4], l0: [-1.5, 3.2, -40], p1: [1.1, 1.2, 3.8], l1: [-1.5, 3.8, -40], fov0: 48, act: actC3 },
  ];
  const inst = { scene: Ch, scenes: [Ch, Nm, Mn, Pa, Mb, Be, Bk, Ln], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
