import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as MP from '../maps.js';
import * as M from '../../lib/motion.js';
import * as RS from '../../rusia/sets.js';
import * as RP from '../../rusia/props.js';
import { run, wt, walkIn } from '../../whatif/shots.js';
const { ss, clamp, HAND } = M;
const EU = MP.EU, fade = U.fade;
export const preload = MP.preload;
const V = () => new THREE.Vector3();
const wrist = (r, s) => { r.root.updateMatrixWorld(true); return r.j['wri' + s].bone.getWorldPosition(V()); };
const CAST = ['oguri', 'tamamo', 'cafe', 'doto', 'mcqueen', 'daiwa', 'suzuka', 'helios', 'spe', 'hishi'];
const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, ...o });
// A small wooden sled with a water can, and its rope.
function sled() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.6), std('#7a5a3a')); base.position.set(0, 0.1, 0); g.add(base);
  for (const x of [-0.15, 0.15]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.66), std('#4a3a2a')); r.position.set(x, 0.03, 0.02); g.add(r);
    for (const z of [-0.2, 0.2]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.07, 0.025), std('#4a3a2a')); l.position.set(x, 0.065, z); g.add(l); } }
  const can = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.24, 14), std('#7a8288', { metalness: 0.4, roughness: 0.5 })); can.position.set(0, 0.24, -0.05); g.add(can);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.userData.dynamic = true; return g;
}
function rope() { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1, 5), std('#5a4a3a')); m.userData.dynamic = true;
  m.span = (a, b) => { const d = b.clone().sub(a); m.position.copy(a).addScaledVector(d, 0.5); m.scale.set(1, d.length(), 1); m.quaternion.setFromUnitVectors(V().set(0, 1, 0), d.normalize()); }; return m; }

export function build(ctx) {
  const L = ctx.L;
  const tJun = wt(L[0], 'junio'), tRom = wt(L[0], 'rompio'), tInv = wt(L[0], 'invadio'), tTre = wt(L[0], 'tres');
  const tLen = wt(L[1], 'leningrado'), tNov = wt(L[1], 'novecientos'), tHam = wt(L[1], 'hambre'), tPer = wt(L[1], 'pero'), tFre = wt(L[1], 'frenaron'), tMos = wt(L[1], 'moscu');
  const tSta = wt(L[2], 'stalingrado'), tLib = wt(L[2], 'libro'), tSan = wt(L[2], 'sangrientas'), tFeb = wt(L[2], 'febrero'), tRin = wt(L[2], 'rindio'), tDes = wt(L[2], 'desde'), tRet = wt(L[2], 'retrocedio');
  const tA2 = tInv - 0.3, tB = L[1].t0 - 0.25, tC = tPer - 0.15, tC2 = tFre - 0.25, tD = L[2].t0 - 0.17, tD2 = tLib + 0.55, tE = tFeb - 0.45, tF = tDes - 0.25;

  // ================================================================ A1: 22 June 1941 — the pact torn in two, Hitler's silhouette behind it
  const Tr = S.tribune();
  const doc = P.tornDoc('TRATADO DE NO AGRESIÓN\nENTRE ALEMANIA Y LA URSS', ['Moscú, 23 de agosto de 1939']); doc.position.set(0, 2.55, -1.6); Tr.add(doc);
  const hit = K.silhouette('hitler', 3.0); hit.position.set(0, Tr.plinths[1].top, -6); Tr.add(hit);
  const docLight = new THREE.SpotLight('#ffe8d0', 14, 8, 0.6, 0.6, 1.2); docLight.position.set(0.6, 3.6, 1.2); docLight.target.position.set(0, 2.55, -1.6); Tr.add(docLight, docLight.target);
  const actA1 = t => {
    const k = ss(tRom - 0.05, tRom + 0.75, t); doc.tear(k); doc.visible = k < 0.999;
    hit.gesture(t, 1.3); Tr.spots[1].intensity = 60 * ss(tRom, tRom + 0.4, t); Tr.beams[1].set(ss(tRom, tRom + 0.4, t));
    return U.film(t) + U.stamp(t, tJun - 0.1, tA2 + 0.2, '22 de junio de 1941', '');
  };

  // ================================================================ A2: Operation Barbarossa — the long line of tanks at dawn
  const Pl = S.plains('golden');
  const line = [-12, -7.5, -3, 1.5, 6, 10.5].map((x, i) => { const tk = P.tank('pz4'); tk.scale.setScalar(0.48); tk.position.set(x, 0, -9 - (i % 2) * 2.2); Pl.add(tk); tk.z0 = tk.position.z; return tk; });
  const inf = Array.from({ length: 10 }, (_, i) => { const r = K.person(Pl, CAST[i % 10], 'aleman', -4 + (i % 5) * 1.0, -6 - Math.floor(i / 5) * 0.8, 0, { shadow: false }); r.x0 = r.root.position.x; r.z0 = r.root.position.z; return r; });
  const stk = [0, 1].map(() => { const p = P.aircraft('stuka'); Pl.add(p); return p; });
  const actA2 = t => {
    line.forEach((tk, i) => { const z = tk.z0 + (t - tA2) * 1.0; tk.position.z = z; tk.drive(z); tk.rock(t + i, 1); });
    inf.forEach((r, i) => { const D = (t - tA2) * 0.32; r.root.position.set(r.x0, 0, r.z0 + D); K.act(r, A.march(D / r.unit, 0, 1, 1.4), t, { mouth: 'neutral' }); });
    stk.forEach((p, i) => { p.position.set(-30 + (t - tA2) * 14 + i * 6, 16 + i * 2, -26 - i * 5); p.rotation.set(0, Math.PI / 2, 0); p.spin(t); });
    Pl.tick?.(t);
    return U.film(t) + U.popCard(t, tInv - 0.15, tB + 0.25, 'OPERACIÓN BARBARROJA', 'La mayor invasión de la historia', 'del mar Báltico al mar Negro', { x: 1440, y: 140, w: 480, accent: '#b8342f' })
      + U.bigNumber(t, tTre - 0.2, tB + 0.25, '3 millones', 'DE SOLDADOS ALEMANES', { y: 860, size: 96, count: 0, band: true });
  };

  // ================================================================ B: the siege of Leningrad — water from the Neva on sleds, the bread queue
  const Ln = RS.petroStreet('snowDusk', { snowing: true, bakery: false, lit: 0.15 });
  const sg = RP.signBoard('ХЛЕБ', { w: 2.0, h: 0.6, bg: '#5a2a1e', fg: '#f3e2b0' }); sg.position.set(-6.94, 2.4, -5.0); sg.rotation.y = Math.PI / 2; Ln.add(sg);
  const queue = Array.from({ length: 5 }, (_, i) => { const r = K.person(Ln, CAST[(i + 3) % 10], i % 2 ? 'civilMujer' : 'refugiado', -5.9 + (i % 2) * 0.08, -4.6 + i * 0.62, Math.PI + (i % 2 ? 0.1 : -0.1), { shadow: false }); return r; });
  const haulers = [[0.6, -9, 0], [-1.6, -12, 1]].map(([x, z, i]) => { const r = K.person(Ln, ['daiwa', 'spe'][i], i ? 'nino' : 'civilMujer', x, z, 0); const s_ = sled(); Ln.add(s_); const rp = rope(); Ln.add(rp); return { r, s: s_, rp, x, z, i }; });
  const actB = t => {
    queue.forEach((r, i) => K.act(r, A.dejected(t, i + 2, 1), t, { mouth: 'neutral' }));
    haulers.forEach(h => {
      const D = (t - tB + 1) * 0.22 * (h.i ? 0.85 : 1), z = h.z + D;
      h.r.root.position.set(h.x, 0, z); const p = M.mix(A.haul(t, h.i + 5), M.gait(D / h.r.unit, { amp: 0.8, seed: h.i, stride: 0.8 }), 0.55);
      p.aR = [-0.45, 0.95, 0.4]; p.aL = [-0.25, 0.85, 0.9]; p.aWL = 1; p.aWR = 1; p.hL = HAND.grip; p.hR = HAND.grip;
      K.act(h.r, p, t, { mouth: 'neutral' });
      h.s.position.set(h.x - 0.1, 0, z - 0.95); const hand = wrist(h.r, 'R'), knot = V().set(h.x - 0.1, 0.12, z - 0.62); h.rp.span(knot, hand);
    });
    Ln.tick?.(t);
    return U.film(t) + U.stamp(t, tB + 0.2, tC + 0.2, 'Leningrado · 1941 – 1944', 'el sitio')
      + U.bigNumber(t, tNov - 0.2, tHam - 0.3, '872 días', 'DE SITIO', { y: 200, size: 96, count: 0, band: true })
      + U.popCard(t, tHam - 0.35, tC + 0.25, 'RACIÓN DE PAN', '125 gramos al día', 'en el invierno de 1941 a 1942', { x: 1440, y: 140, w: 470, accent: '#b8342f' });
  };

  // ================================================================ C1: December 1941 — the Germans freeze before Moscow
  const Wb = S.winterField('blizzard');
  const stuck = P.tank('pz4'); stuck.scale.setScalar(0.48); stuck.position.set(-1.2, -0.06, -3.4); stuck.rotation.set(0.04, 0.5, -0.05); Wb.add(stuck);
  const frozen = [[0.1, -1.6, -0.3], [0.75, -2.1, -0.9], [-0.55, -1.1, 0.4]].map(([x, z, y], i) => K.person(Wb, ['hishi', 'mcqueen', 'oguri'][i], 'alemanGorro', x, z, y));
  const actC = t => {
    frozen.forEach((r, i) => K.act(r, A.shiver(t, i + 1, 1), t, { mouth: 'frown', eye: i === 1 ? 'flat' : undefined }));
    Wb.tick?.(t);
    return U.film(t) + U.stamp(t, tC + 0.15, tC2 + 0.2, 'Diciembre de 1941', 'hasta −40 °C');
  };

  // ================================================================ C2: the Soviet counter-attack in the snow
  const Ws = S.winterField('snow', { blizzard: false });
  const skiers = Array.from({ length: 7 }, (_, i) => { const r = K.person(Ws, CAST[(i + 5) % 10], 'sovieticoInviernoArmado', -3 + i * 1.0 + (i % 2) * 0.2, -7 - (i % 3) * 1.2, Math.PI * 0, { shadow: false }); r.x0 = r.root.position.x; r.z0 = r.root.position.z; return r; });
  const t34s = [[-4.2, -12], [4.0, -13.5]].map(([x, z]) => { const tk = P.tank('t34'); tk.scale.setScalar(0.48); tk.position.set(x, 0, z); Ws.add(tk); tk.z0 = z; return tk; });
  const actC2 = t => {
    skiers.forEach((r, i) => { const D = (t - tC2 + 0.5) * 0.55, z = r.z0 + D; r.root.position.set(r.x0, 0, z);
      K.act(r, M.mix(A.portRifle(t, i), M.gait(D / r.unit, { run: 0.6, amp: 1, seed: i }), 0.7), t, { mouth: i % 2 ? 'open' : 'neutral' }); });
    t34s.forEach((tk, i) => { const z = tk.z0 + (t - tC2) * 1.3; tk.position.z = z; tk.drive(z); tk.rock(t + i, 1); });
    Ws.tick?.(t);
    return U.film(t) + U.popCard(t, tMos - 0.4, tD + 0.25, 'BATALLA DE MOSCÚ', 'La primera gran derrota', 'del ejército alemán en tierra', { x: 1440, y: 140, w: 470, accent: '#c0453a' });
  };

  // ================================================================ D: Stalingrad — the city fought for house by house
  const Sg = S.stalingrad('overcast');
  const runners = Array.from({ length: 4 }, (_, i) => { const r = K.person(Sg, CAST[(i + 2) % 10], 'sovieticoArmado', -5 - i * 0.9, -3.2 - (i % 2) * 0.6, Math.PI / 2, { shadow: false }); r.x0 = r.root.position.x; r.z0 = r.root.position.z; return r; });
  const cover = P.rubble(1.0, 9); cover.position.set(1.6, 0, -1.2); Sg.add(cover);
  const shooter = K.person(Sg, 'tamamo', 'sovieticoArmado', 1.6, -0.55, Math.PI + 0.35);
  const mate = K.person(Sg, 'daiwa', 'sovieticoArmado', 2.25, -0.3, Math.PI - 0.2);
  const flash = P.glow('#ffd27a', 0.5, 0); Sg.add(flash);
  const actD = (t, close) => {
    runners.forEach((r, i) => { const tr = M.travel(t, tD + 0.2 + i * 0.35, 9 / r.unit, 1.2, 0.5); r.root.position.set(r.x0 + tr.D * r.unit, 0, r.z0);
      K.act(r, M.mix(A.portRifle(t, i), M.gait(tr.D, { run: 0.7, amp: tr.amp, seed: i }), clamp(tr.amp * 1.5)), t, { mouth: 'neutral' }); r.root.visible = !close; });
    const shot = (t * 0.9) % 1, rec = ss(0.0, 0.05, shot) * (1 - ss(0.05, 0.3, shot));
    K.act(shooter, A.aimRifle(t, 3, rec, { wide: 1 }), t, { mouth: 'frown', eye: 'squint' });
    const mz = shooter.gun?.muzzle ? shooter.gun.muzzle.getWorldPosition(V()) : wrist(shooter, 'L'); flash.position.copy(mz); flash.material.opacity = 0.9 * (1 - ss(0.02, 0.12, shot)) * (shot < 0.12 ? 1 : 0); flash.scale.setScalar(0.35 + 0.4 * rec);
    const cp = A.crouch(t, 4, 1); cp.gun = 'port'; K.act(mate, cp, t, { mouth: 'neutral' });
    Sg.tick?.(t);
    return U.film(t) + U.stamp(t, tD + 0.2, tE + 0.2, 'agosto de 1942 – febrero de 1943', 'Stalingrado')
      + (close ? U.bigNumber(t, tSan - 0.25, tE + 0.25, 'casi 2 millones', 'DE MUERTOS, HERIDOS Y PRISIONEROS', { y: 200, size: 92, count: 0, band: true })
        : U.popCard(t, tSta + 1.0, tD2 + 0.25, 'CASA POR CASA', 'Se peleaba por cada edificio', 'y cada piso de cada edificio', { x: 1440, y: 140, w: 470, accent: '#c0453a' }));
  };

  // ================================================================ E: February 1943 — the 6th Army walks into captivity
  const Sw = S.stalingrad('snow', { snow: true });
  const pows = Array.from({ length: 9 }, (_, i) => { const r = K.person(Sw, CAST[(i + 1) % 10], 'alemanGorro', -0.4 + (i % 2) * 0.55, -12 + i * 1.05, 0, { shadow: false }); r.z0 = r.root.position.z; r.x0 = r.root.position.x; return r; });
  const guard = K.person(Sw, 'suzuka', 'sovieticoInviernoArmado', 1.9, -2.2, -Math.PI / 2 + 0.4);
  const actE = t => {
    pows.forEach((r, i) => { const D = (t - tE + 2) * 0.24, z = r.z0 + D; r.root.position.set(r.x0, 0, z);
      K.act(r, M.mix(A.dejected(t, i, 1), M.gait(D / r.unit, { amp: 0.7, seed: i, stride: 0.8 }), 0.55), t, { mouth: 'neutral', eye: i % 3 ? undefined : 'flat' }); });
    K.act(guard, A.portRifle(t, 9), t, { mouth: 'neutral' });
    Sw.tick?.(t);
    return U.film(t) + U.stamp(t, tE + 0.2, tF + 0.2, '2 de febrero de 1943', 'Stalingrado')
      + U.popCard(t, tRin - 0.3, tF + 0.25, 'EL 6.º EJÉRCITO SE RINDE', '91 000 prisioneros alemanes', 'la gran derrota de Hitler', { x: 1440, y: 140, w: 480, accent: '#c0453a' });
  };

  // ================================================================ F: the map — from then on the front only moved west
  const Mf = MP.europe({ period: 'w1942' });
  const zone = EU.zone(Mf, MP.AXIS_RUS_1942, '#4b5059', { opacity: 0.55 });
  const fronts = ['nov1942', 'aug1943', 'jan1945'].map(k => EU.front(Mf, MP.EAST[k], { color: '#7a1e14', width: 0.22 }));
  const pushes = [[[44, 49], [38, 48.6], [33, 48.4]], [[37, 55.4], [32, 54.6], [27, 53.8]], [[35, 51], [29, 50.6], [24, 50.6]]].map(p => EU.arrow(Mf, p, '#c0453a', 0.6));
  const actF = t => {
    const u1 = ss(tF + 0.2, tF + 1.0, t), u2 = ss(tDes + 0.4, tRet, t), u3 = ss(tRet - 0.2, ctx.dur - 0.6, t);
    Mf.paint('w1942', 'w1944', u3);
    zone.set(1 - 0.8 * u2 - 0.2 * u3);
    fronts[0].set(u1 * (1 - ss(tDes + 0.6, tDes + 1.0, t))); fronts[1].set(ss(tDes + 0.4, tDes + 1.2, t) * (1 - ss(tRet + 0.4, tRet + 0.8, t))); fronts[2].set(ss(tRet + 0.2, tRet + 1.2, t));
    pushes.forEach((a, i) => a.set(ss(tDes + i * 0.3, tDes + 1.4 + i * 0.3, t)));
    return U.film(t) + EU.city(ctx, Mf, 'Stalingrado', fade(t, tF, ctx.dur + 1)) + EU.city(ctx, Mf, 'Kursk', fade(t, tDes + 0.4, ctx.dur + 1))
      + U.popCard(t, tDes - 0.1, ctx.dur + 1, 'DESDE ENTONCES', 'El Ejército Rojo avanza hacia el oeste', 'de Kursk (1943) a Berlín (1945)', { x: 1440, y: 140, w: 500, accent: '#c0453a' });
  };
  const [fx, , fz] = EU.wpos(34, 51.5);

  const sfx = [
    { t: 0, type: 'tension', dur: tA2, vol: 0.28 }, { t: tRom - 0.05, type: 'paper', vol: 0.55 }, { t: tRom + 0.05, type: 'sting', vol: 0.35 }, { t: tRom + 0.1, type: 'thud', vol: 0.4 },
    { t: tA2, type: 'engines', dur: tB - tA2, vol: 0.45 }, { t: tA2 + 0.3, type: 'plane', dur: 3.0, vol: 0.3 }, { t: tA2, type: 'march', dur: tB - tA2, vol: 0.25 }, { t: tTre - 0.2, type: 'drum', dur: 1.4, vol: 0.3 },
    { t: tB, type: 'wind', dur: tC2 - tB, vol: 0.3 }, { t: tB, type: 'steps', dur: tC - tB, vol: 0.15 }, { t: tB + 0.3, type: 'clock', dur: tC - tB - 0.3, vol: 0.18 },
    { t: tC, type: 'wind', dur: tC2 - tC, vol: 0.45 }, { t: tC2, type: 'charge', vol: 0.45 }, { t: tC2, type: 'engines', dur: tD - tC2, vol: 0.35 }, { t: tC2 + 0.3, type: 'shout', vol: 0.35 },
    { t: tD, type: 'gunfire', dur: tE - tD, vol: 0.35 }, { t: tD + 0.4, type: 'boom', vol: 0.35 }, { t: tD + 1.8, type: 'bigboom', vol: 0.3 }, { t: tD2, type: 'mg', dur: 1.2, vol: 0.25 }, { t: tD2 + 1.6, type: 'boom', vol: 0.3 },
    ...[0, 1, 2].map(i => ({ t: tD2 + 0.05 + i * 1.11, type: 'shot', vol: 0.4 })),
    { t: tE, type: 'wind', dur: tF - tE, vol: 0.3 }, { t: tE, type: 'steps', dur: tF - tE, vol: 0.22 }, { t: tRin - 0.1, type: 'sting2', vol: 0.3 },
    { t: tF, type: 'whoosh', vol: 0.3 }, ...[0, 1, 2].map(i => ({ t: tDes + i * 0.3, type: 'swoosh', vol: 0.28 })), { t: tF, type: 'drums', dur: ctx.dur - tF, vol: 0.3 },
  ];
  const shots = [
    { t0: 0, set: Tr, p0: [0, 2.6, 1.6], l0: [0, 2.55, -1.6], p1: [0, 2.6, 0.9], l1: [0, 2.6, -1.6], fov0: 40, act: actA1 },
    { t0: tA2, set: Pl, p0: [9, 0.75, 1.0], l0: [-2, 1.0, -9], p1: [8.2, 0.7, 0.4], l1: [-2, 1.0, -8], fov0: 46, act: actA2 },
    { t0: tB, set: Ln, p0: [1.4, 0.95, 4.6], l0: [-1.4, 0.95, -8], p1: [1.2, 0.9, 3.9], l1: [-1.4, 0.95, -8], fov0: 44, act: actB },
    { t0: tC, set: Wb, p0: [2.2, 0.85, 2.0], l0: [-0.5, 0.6, -2.4], p1: [1.95, 0.82, 1.7], l1: [-0.5, 0.6, -2.4], fov0: 44, act: actC },
    { t0: tC2, set: Ws, p0: [1.6, 0.5, 3.4], l0: [0, 0.9, -10], p1: [1.4, 0.48, 2.9], l1: [0, 0.9, -10], fov0: 46, act: actC2 },
    { t0: tD, set: Sg, p0: [7.5, 3.4, 8.5], l0: [-2, 0.8, -8], p1: [6.6, 3.0, 7.4], l1: [-2, 0.8, -8], fov0: 46, act: t => actD(t, false) },
    { t0: tD2, set: Sg, p0: [3.3, 0.72, 1.3], l0: [1.6, 0.5, -1.2], p1: [3.1, 0.7, 1.0], l1: [1.6, 0.5, -1.2], fov0: 42, act: t => actD(t, true) },
    { t0: tE, set: Sw, p0: [3.6, 1.15, 4.2], l0: [-0.4, 0.55, -6], p1: [3.2, 1.1, 3.6], l1: [-0.4, 0.55, -6], fov0: 44, act: actE },
    { t0: tF, set: Mf, p0: [fx, 26, fz + 13], l0: [fx, 0, fz], p1: [fx - 3, 28, fz + 14], l1: [fx - 3, 0, fz], fov0: 40, act: actF },
  ];
  const inst = { scene: Tr, scenes: [Tr, Pl, Ln, Wb, Ws, Sg, Sw, Mf], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
