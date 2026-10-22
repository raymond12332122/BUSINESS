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
export const preload = MP.preload;
const V = () => new THREE.Vector3();
const CAST = ['oguri', 'tamamo', 'cafe', 'doto', 'mcqueen', 'daiwa', 'suzuka', 'helios', 'spe', 'hishi'];

export function build(ctx) {
  const L = ctx.L;
  const tDes = wt(L[0], 'desiertos'), tAla = wt(L[0], 'alamein'), tBri = wt(L[0], 'britanicos'), tRom = wt(L[0], 'romel'), tZor = wt(L[0], 'zorro');
  const tDsb = wt(L[1], 'desembarcaron'), tIta = wt(L[1], 'italia'), tMus = wt(L[1], 'mussolini'), tCay = wt(L[1], 'cayo'), tMon = wt(L[1], 'montanas'), tVei = wt(L[1], 'veinticinco'), tBra = wt(L[1], 'brasilenos');
  const tB = tBri - 0.25, tB2 = tRom - 0.3, tC = L[1].t0 - 0.3, tD = tMus - 0.35, tE = tMon - 0.4;

  // ================================================================ A: El Alamein, 23 October 1942 — the barrage at dusk
  const Ds = S.desert('dusk');
  const guns = [-4.5, -1.5, 1.5, 4.5].map((x, i) => { const g = P.fieldGun(); g.position.set(x, 0, -2.5 - (i % 2) * 0.6); g.rotation.y = Math.PI; Ds.add(g); g.ph = i * 0.37; return g; });
  const blasts = guns.map(() => { const b = P.muzzleBlast({ size: 0.9 }); b.rotation.y = Math.PI; Ds.add(b); return b; });
  const crews = guns.map((g, i) => K.person(Ds, CAST[(i + 2) % 10], 'desierto', g.position.x + 0.8, g.position.z + 0.9, Math.PI + 0.3, { shadow: false }));
  const glowLight = new THREE.PointLight('#ffb060', 0, 14, 1.4); glowLight.position.set(0, 2, -4); Ds.add(glowLight);
  const actA = t => {
    let fl = 0;
    guns.forEach((g, i) => { const u = ((t + g.ph) * 0.85) % 1, k = ss(0, 0.04, u) * (1 - ss(0.06, 0.35, u)); g.fire(k);
      g.updateMatrixWorld(true); blasts[i].position.copy(g.muzzle.getWorldPosition(V())); fl = Math.max(fl, blasts[i].set(u / 0.85)); });
    glowLight.intensity = 18 * fl;
    crews.forEach((r, i) => K.act(r, i % 2 ? A.coverEars(t, i, 1) : A.crouch(t, i, 0.5), t, { mouth: 'frown', eye: 'squint' }));
    Ds.tick?.(t);
    return U.film(t) + U.stamp(t, tDes - 0.2, tB + 0.2, '23 de octubre de 1942', 'El Alamein, Egipto');
  };

  // ================================================================ B1: the Eighth Army advances; B2: Rommel, the "Desert Fox"
  const Ds2 = S.desert('golden');
  const shermans = [[-3.5, -8], [3.0, -10]].map(([x, z]) => { const tk = P.tank('sherman', { col: '#a8986a' }); tk.scale.setScalar(0.48); tk.position.set(x, 0, z); Ds2.add(tk); tk.z0 = z; return tk; });
  const tommies = Array.from({ length: 6 }, (_, i) => { const r = K.person(Ds2, CAST[(i + 6) % 10], 'desiertoArmado', -1.4 + (i % 3) * 1.2, -4.6 - Math.floor(i / 3) * 1.1, 0, { shadow: false }); r.x0 = r.root.position.x; r.z0 = r.root.position.z; return r; });
  const actB = t => {
    shermans.forEach((tk, i) => { const z = tk.z0 + (t - tB) * 0.9; tk.position.z = z; tk.drive(z); tk.rock(t + i, 1); });
    tommies.forEach((r, i) => { const D = (t - tB + 0.4) * 0.4, z = r.z0 + D; r.root.position.set(r.x0, 0, z); K.act(r, M.mix(A.portRifle(t, i), M.gait(D / r.unit, { amp: 1, seed: i }), 0.7), t, { mouth: 'neutral' }); });
    Ds2.tick?.(t);
    return U.film(t) + U.popCard(t, tB + 0.1, tB2 + 0.25, 'EL 8.º EJÉRCITO', 'Los británicos frenan a Rommel', 'con australianos, indios, neozelandeses y sudafricanos', { x: 1440, y: 140, w: 500, accent: '#c9a227' });
  };
  const Dr = S.desert('dusk');
  const rtank = P.tank('pz4', { col: '#a8986a' }); rtank.scale.setScalar(0.48); rtank.position.set(0, 0, -6); rtank.rotation.y = 0.5; Dr.add(rtank);
  const fox = K.silhouette('rommel', 1.5); Dr.add(fox);
  const actB2 = t => {
    rtank.turret.updateMatrixWorld(true); const top = V().set(-0.2, 1.0, -0.4); rtank.turret.localToWorld(top); fox.position.copy(top); fox.position.y -= 0.62; fox.rotation.y = 0; fox.gesture(t, 0.9);
    Dr.tick?.(t);
    return U.film(t) + U.dark(t, tRom - 0.2, tC + 0.2, 'Erwin Rommel', 'General alemán, el «Zorro del Desierto»', { side: 'r' });
  };

  // ================================================================ C: Sicily, 10 July 1943 — the Allies land in Italy
  const Si = S.sicily('day');
  const lc = [[-2.5, -8], [3.5, -9]].map(([x, z]) => { const c = P.OLD.landingCraft('#5a6450'); c.position.set(x, 0, z); c.ramp.rotation.x = 1.3; Si.add(c); return c; });
  const gis = Array.from({ length: 8 }, (_, i) => { const r = K.person(Si, CAST[(i + 1) % 10], i % 2 ? 'britanico' : 'estadounidense', -3 + (i % 4) * 2.0 + (i >> 2) * 0.7, -3.6 + Math.floor(i / 4) * 1.3, 0, { shadow: false }); r.x0 = r.root.position.x; r.z0 = r.root.position.z; return r; });
  const beachY = z => z < 2 ? -0.42 + Math.max(0, z + 9) * 0.035 : (z - 2) * 0.012;
  const actC = t => {
    gis.forEach((r, i) => { const D = (t - tC + 0.6) * 0.5, z = r.z0 + D; r.root.position.set(r.x0, Math.min(0, beachY(z)), z); K.act(r, M.mix(A.stand(t, i), M.gait(D / r.unit, { amp: 1, seed: i }), 0.75), t, { mouth: 'neutral' }); });
    lc.forEach((c, i) => { c.position.y = 0.06 * Math.sin(t * 1.4 + i); });
    Si.tick?.(t);
    return U.film(t) + U.stamp(t, tC + 0.2, tD + 0.2, '10 de julio de 1943', 'Sicilia');
  };

  // ================================================================ D: Mussolini falls (his silhouette topples, the light goes out)
  const Tr = S.tribune();
  const mus = K.silhouette('mussolini', 3.0); mus.position.set(0, Tr.plinths[1].top, -6); Tr.add(mus);
  const actD = t => {
    const f = ss(tCay - 0.05, tCay + 0.6, t);
    mus.rotation.x = -1.45 * f * f; mus.position.y = Tr.plinths[1].top - 0.8 * f * f; mus.position.z = -6 - 0.6 * f; mus.material.opacity = 1 - ss(tCay + 0.4, tCay + 0.9, t); mus.gesture(t, 1.2);
    Tr.spots[1].intensity = 60 * (1 - ss(tCay + 0.1, tCay + 0.7, t)); Tr.beams[1].set(1 - ss(tCay + 0.1, tCay + 0.7, t));
    return U.film(t) + U.dark(t, tMus - 0.2, tE + 0.2, 'Benito Mussolini', 'Destituido y arrestado · 25 de julio de 1943', { side: 'l' });
  };

  // ================================================================ E: the Brazilian Expeditionary Force in the snowy Apennines
  const Ap = S.apennines('snow');
  const feb = Array.from({ length: 7 }, (_, i) => { const r = K.person(Ap, CAST[(i + 3) % 10], 'brasilenoArmado', -3.2 + i * 1.05, -3.6 - [0, 1.0, 0.4, 1.4, 0.2, 0.9, 0.5][i], Math.PI, { shadow: false }); r.x0 = r.root.position.x; r.z0 = r.root.position.z; return r; });
  const actE = t => {
    feb.forEach((r, i) => { const D = (t - tE + 0.3) * 0.24, z = r.z0 - D; r.root.position.set(r.x0, Ap.slopeY(r.x0, z), z);
      const p = M.mix(A.portRifle(t, i), M.gait(D / r.unit, { amp: 1, seed: i }), 0.7); p.waist = [(p.waist?.[0] || 0) + 10, p.waist?.[1] || 0, 0]; K.act(r, p, t, { mouth: 'neutral' }); });
    Ap.tick?.(t);
    return U.film(t) + U.stamp(t, tE + 0.2, ctx.dur + 1, 'invierno de 1944 – 1945', 'Montes Apeninos, Italia')
      + U.bigNumber(t, tVei - 0.2, ctx.dur + 1, '25 000', 'SOLDADOS BRASILEÑOS', { y: 200, size: 104, count: 0, band: true })
      + U.popCard(t, tBra - 0.1, ctx.dur + 1, 'LA FEB', 'El único ejército latinoamericano', 'que combatió en Europa', { x: 1440, y: 330, w: 470, accent: '#2f8a3a' });
  };

  const sfx = [
    { t: 0, type: 'wind', dur: tB, vol: 0.2 }, ...Array.from({ length: 12 }, (_, i) => ({ t: 0.3 + i * 0.48, type: i % 3 ? 'cannon' : 'boom', vol: 0.32 })),
    { t: tB, type: 'engines', dur: tB2 - tB, vol: 0.4 }, { t: tB, type: 'march', dur: tB2 - tB, vol: 0.25 },
    { t: tB2, type: 'wind', dur: tC - tB2, vol: 0.3 }, { t: tRom - 0.2, type: 'sting', vol: 0.3 },
    { t: tC, type: 'waves', dur: tD - tC, vol: 0.35 }, { t: tC + 0.2, type: 'splash', vol: 0.35 }, { t: tC, type: 'plane', dur: 2.5, vol: 0.2 },
    { t: tD, type: 'drone', dur: tE - tD, vol: 0.25 }, { t: tCay, type: 'crack', vol: 0.45 }, { t: tCay + 0.5, type: 'thud', vol: 0.45 },
    { t: tE, type: 'wind', dur: ctx.dur - tE, vol: 0.3 }, { t: tE, type: 'steps', dur: ctx.dur - tE, vol: 0.2 }, { t: tVei, type: 'drum', dur: 2, vol: 0.3 },
  ];
  const shots = [
    { t0: 0, set: Ds, p0: [7.8, 2.6, 5.4], l0: [0.3, 0.6, -3.4], p1: [7.1, 2.4, 4.6], l1: [0.3, 0.6, -3.4], fov0: 44, act: actA },
    { t0: tB, set: Ds2, p0: [2.4, 0.75, 3.2], l0: [-0.5, 0.8, -8], p1: [2.1, 0.72, 2.6], l1: [-0.5, 0.8, -8], fov0: 46, act: actB },
    { t0: tB2, set: Dr, p0: [1.9, 1.05, -0.4], l0: [0, 1.25, -6], p1: [1.6, 1.0, -1.3], l1: [0, 1.3, -6], fov0: 42, act: actB2 },
    { t0: tC, set: Si, p0: [2.4, 1.05, 5.2], l0: [-0.4, 0.5, -6], p1: [2.2, 1.0, 4.6], l1: [-0.4, 0.5, -6], fov0: 46, act: actC },
    { t0: tD, set: Tr, p0: [0, 1.6, 2.4], l0: [0, 3.0, -6], p1: [0, 1.7, 1.8], l1: [0, 3.0, -6], fov0: 46, act: actD },
    { t0: tE, set: Ap, p0: [0.5, 3.2, -12.6], l0: [-0.1, 1.0, -3.6], p1: [0.4, 3.1, -12.1], l1: [-0.1, 1.0, -3.6], fov0: 46, act: actE },
  ];
  const inst = { scene: Ds, scenes: [Ds, Ds2, Dr, Si, Tr, Ap], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
