import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as MP from '../maps.js';
import * as M from '../../lib/motion.js';
import { run, wt, walkIn } from '../../whatif/shots.js';
const { ss, clamp, HAND } = M;
const EU = MP.EU, fade = U.fade;
export const preload = MP.preload;
const V = () => new THREE.Vector3();

export function build(ctx) {
  const L = ctx.L;
  const tAgo = wt(L[0], 'agosto'), tHit = wt(L[0], 'hitler'), tSta = wt(L[0], 'stalin'), tOdi = wt(L[0], 'odiaban'), tFir = wt(L[0], 'firmaron'), tPac = wt(L[0], 'pacto'), tRep = wt(L[0], 'repartirse');
  const tSep = wt(L[1], 'septiembre'), tInv = wt(L[1], 'invadio'), tDos = wt(L[1], 'dos'), tRei = wt(L[1], 'reino'), tGue = wt(L[1], 'guerra');
  const tRel = wt(L[2], 'relampago'), tTan = wt(L[2], 'tanques'), tAvi = wt(L[2], 'aviones'), tRad = wt(L[2], 'radio'), tRom = wt(L[2], 'rompian'), tSov = wt(L[2], 'sovieticos'), tCay = wt(L[2], 'cayo'), tCin = wt(L[2], 'cinco');
  const tB = tRep - 0.3, tC = L[1].t0 - 0.25, tD = tDos - 0.25, tE = L[2].t0 - 0.3, tF = tAvi - 0.3, tG = tRad - 0.3, tH = tRom + 0.55;

  // ================================================================ A: 23 August 1939 — Molotov signs, Ribbentrop looks on, their masters' shadows on the wall
  // (staged like the famous photograph of the signing in the Kremlin)
  const Pr = S.pactRoom(), TT = Pr.table.top;
  const mol = K.person(Pr, 'doto', 'diplomatico', 0.32, -1.58, 0); K.seatOn(mol, 0.198); const yMol = mol.root.position.y;
  const rib = K.person(Pr, 'oguri', 'diplomatico', 0.98, -1.98, -0.25);
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.004, 0.14), new THREE.MeshStandardMaterial({ color: '#f3ecd8', roughness: 0.9 })); sheet.position.set(0.33, TT + 0.002, -1.4); Pr.add(sheet);
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.003, 0.085, 6), new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.4 })); pen.userData.dynamic = true; Pr.add(pen);
  const shad = [['hitler', -1.2, tHit, 1], ['stalin', 1.5, tSta, -1]].map(([k, x, t0, sx]) => { const sil = K.silhouette(k, 2.5), sh = K.shadowOf(sil, 1.0, 0.7);
    sh.position.set(x, 0.12, -3.44); sh.scale.x = sx; Pr.add(sh); sh.sil = sil; sh.t0 = t0; return sh; });
  const actA = t => {
    mol.root.position.y = yMol;
    const kw = ss(tFir - 0.5, tFir, t);
    K.act(mol, M.mix(A.seated(A.crossArms, t, 2), A.write(t, 2, [0.33, TT, -1.4], 0, 1), kw), t, { mouth: 'neutral' });
    const w = mol.root.parent ? (mol.root.updateMatrixWorld(true), mol.j.wriR.bone.getWorldPosition(V())) : V(); pen.position.copy(w).add(V().set(0, -0.012, 0.02)); pen.rotation.set(-0.5, 0, 0.35); pen.visible = kw > 0.5;
    K.act(rib, M.mix(A.crossArms(t, 1), A.handsOnHips(t, 1), ss(tFir, tFir + 0.6, t)), t, { mouth: t > tFir ? 'smile' : 'neutral' });
    shad.forEach(sh => { sh.sil.gesture(t, 1.1); sh.follow(); sh.material.opacity = 0.72 * ss(sh.t0 - 0.3, sh.t0 + 0.4, t); sh.visible = sh.material.opacity > 0.01; });
    return U.film(t) + U.stamp(t, tAgo - 0.1, tB + 0.2, '23 de agosto de 1939', 'Moscú')
      + U.dark(t, tHit - 0.1, tFir - 0.2, 'Adolf Hitler', 'Alemania nazi', { side: 'l' }) + U.dark(t, tSta - 0.1, tFir - 0.2, 'Iósif Stalin', 'Unión Soviética comunista', { side: 'r' })
      + U.popCard(t, tFir - 0.1, tB + 0.25, 'PACTO MOLOTOV-RIBBENTROP', 'No agresión…', '…y un protocolo secreto', { x: 1440, y: 140, w: 480, accent: '#b8342f' });
  };

  // ================================================================ B: the secret protocol — eastern Europe split in two
  const Mb = MP.europe({ period: 'w1939' });
  const LINE = [[22.6, 55.0], [22.0, 53.9], [21.6, 53.2], [21.2, 52.7], [21.0, 52.25], [21.4, 51.6], [21.7, 50.9], [21.9, 50.4], [22.4, 49.9], [22.7, 49.4], [22.9, 49.0]];
  const line = EU.front(Mb, LINE, { color: '#1a1a1a', width: 0.2 });
  const WEST = ['ppol', 'cpol', 'apol'], EAST = ['egal', 'vol', 'wblr', 'vil', 'est', 'lva', 'fin', 'mda'];
  const actB = t => {
    Mb.paint('w1939'); const k = ss(tRep - 0.1, tRep + 0.7, t);
    WEST.forEach(id => Mb.tint(id, '#868c95', k, 0.92)); EAST.forEach(id => Mb.tint(id, '#dc8a7e', k, 0.92));
    line.set(ss(tB + 0.1, tRep + 0.5, t));
    return U.film(t) + EU.areaLabel(ctx, 18.6, 52.4, 'PARA ALEMANIA', fade(t, tRep, ctx.dur + 1), 'st') + EU.areaLabel(ctx, 26.2, 53.2, 'PARA LA URSS', fade(t, tRep + 0.15, ctx.dur + 1), 'st')
      + U.popCard(t, tB + 0.2, tC + 0.25, 'PROTOCOLO SECRETO', 'Se repartían el este de Europa', 'Polonia, los países bálticos, Finlandia y Besarabia', { x: 1440, y: 140, w: 500, accent: '#b8342f' });
  };
  const [bx, , bz] = EU.wpos(23.5, 53.5);

  // ================================================================ C: 1 September 1939, dawn — the barrier goes up
  const Bd = S.border('dawn'), bar = Bd.barrier, PIV = [-1.7, bar.h, 0];
  const lifter = K.person(Bd, 'helios', 'aleman', 0.9, 0.3, Math.PI), mate = K.person(Bd, 'cafe', 'aleman', 1.55, 0.95, Math.PI - 0.5);
  const column = [0, 1, 2, 3].map(i => K.person(Bd, ['tamamo', 'suzuka', 'spe', 'mcqueen'][i], 'aleman', 0.32, 2.3 + i * 0.6, Math.PI));
  const tk = P.tank('pz4'); tk.scale.setScalar(0.48); tk.rotation.y = Math.PI; Bd.add(tk);
  const tUp = tSep - 0.2, kOpen = t => 0.12 * ss(tUp, tUp + 0.7, t) + 0.88 * ss(tUp + 0.7, tUp + 1.9, t);
  const barPt = (k, d) => { const a = 1.3 * k; return [PIV[0] + d * Math.cos(a), PIV[1] + d * Math.sin(a), 0.0]; };
  const actC = t => {
    const k = kOpen(t); bar.open(k);
    const grip = ss(tUp - 0.4, tUp, t) * (1 - ss(tUp + 0.75, tUp + 1.1, t)), d = 2.6;
    const pL = barPt(k, d - 0.12), pR = barPt(k, d + 0.12);
    K.act(lifter, M.mix(A.stand(t, 3), A.hands(t, 3, [pL[0], pL[1] + 0.02, 0.06], [pR[0], pR[1] + 0.02, 0.06], 1), grip), t, { mouth: 'neutral' });
    K.act(mate, A.point(t, 4, 25, 5, 'L'), t, { mouth: 'neutral' });
    column.forEach((r, i) => K.act(r, walkIn(r, t, tUp + 0.7 + i * 0.3, [0.32, 2.3 + i * 0.6], Math.PI, 7, { speed: 0.5, seed: i + 5 }), t, { mouth: 'neutral' }));
    const tz = 5.6 - Math.max(0, t - (tUp + 0.4)) * 1.6; tk.position.set(-0.75, 0, tz); tk.drive(-tz); tk.rock(t, t > tUp + 0.6 ? 1 : 0);
    Bd.tick?.(t);
    return U.film(t) + U.stamp(t, tSep - 0.25, tD + 0.2, '1 de septiembre de 1939', 'frontera polaca')
      + U.popCard(t, tInv - 0.2, tD + 0.25, 'COMIENZA LA GUERRA', 'Alemania invade Polonia', 'sin declaración de guerra', { x: 1440, y: 140, w: 470, accent: '#b8342f' });
  };

  // ================================================================ D: 3 September — the family by the wireless
  const Pa = S.parlour(), ch = Pa.chair;
  const dad = K.person(Pa, 'oguri', 'civil', ch.position.x, ch.position.z, 2.4); K.seatOn(dad, ch.top); const yDad = dad.root.position.y;
  const mum = K.person(Pa, 'daiwa', 'civilMujer', 0.75, 0.2, 2.75), kid = K.person(Pa, 'spe', 'nino', 0.1, -0.95, 2.12);
  const actD = t => {
    dad.root.position.y = yDad; Pa.radio.glow(1);
    K.act(dad, A.listen(t, 1, 1), t, { mouth: 'neutral', eye: t > tGue ? 'shock' : undefined });
    K.act(mum, A.handOnHeart(t, 2, ss(tRei - 0.3, tRei + 0.3, t)), t, { mouth: t > tGue ? 'frown' : 'neutral' });
    K.act(kid, M.mix(A.stand(t, 3), A.mourn(t, 3, 0.4), 0.7), t, { mouth: 'small' });
    return U.film(t) + U.stamp(t, tD + 0.1, tE + 0.2, '3 de septiembre de 1939', 'Londres')
      + U.quoteAt(t, [['…este país está en guerra con Alemania.', tRei - 0.3]], 'Neville Chamberlain, por la radio', tRei - 0.5, tE + 0.2, { left: 72, top: 560, w: 640, size: 34 })
      + U.sides(t, tRei - 0.1, tE + 0.25, 'DECLARAN LA GUERRA A ALEMANIA', [['gb', 'Reino Unido'], ['fr', 'Francia']], { x: 1560, y: 120, accent: '#3f6fb5' });
  };

  // ================================================================ E-G: Blitzkrieg — tanks, dive bombers, radio
  const Pl = S.plains('day');
  const wedge = [[0, -7], [-3.2, -9.5], [3.2, -9.5], [-6.4, -12], [6.4, -12]].map(([x, z], i) => { const t_ = P.tank('pz4'); t_.scale.setScalar(0.48); t_.position.set(x, 0, z); Pl.add(t_); t_.z0 = z; return t_; });
  const stukas = [0, 1, 2].map(() => { const p = P.aircraft('stuka'); Pl.add(p); return p; });
  const blasts = [0, 1, 2].map(() => { const g = P.glow('#ffb060', 9, 0); Pl.add(g); return g; });
  const TGT = [[-6, -34], [-1, -38], [4, -33]];
  const cmdTank = P.tank('pz4'); cmdTank.scale.setScalar(0.48); cmdTank.position.set(-14, 0, 0); Pl.add(cmdTank);
  const cmd = K.person(Pl, 'cafe', 'tanquista', 0, 0, 0);
  const actE = t => {
    wedge.forEach((w, i) => { const z = w.z0 + (t - tE + 1) * 1.1; w.position.z = z; w.drive(z); w.rock(t + i, 1); w.visible = true; });
    stukas.forEach(p => { p.visible = false; }); blasts.forEach(b => { b.material.opacity = 0; }); cmd.root.visible = false; cmdTank.visible = false;
    Pl.tick?.(t);
    return U.film(t) + U.bigTitle(t, tRel - 0.3, tF + 0.25, 'BLITZKRIEG', 'Guerra relámpago', 'tanques · aviones · radio', { top: 90 });
  };
  const actF = t => {
    wedge.forEach((w, i) => { const z = w.z0 + (t - tE + 1) * 1.1; w.position.z = z; w.drive(z); });
    stukas.forEach((p, i) => {
      const t0 = tF - 0.6 + i * 0.42, u = (t - t0) / 1.7, [gx, gz] = TGT[i];
      const S0 = V().set(gx - 26, 36, gz - 10), E0 = V().set(gx, 6, gz), pull = ss(0.85, 1.25, u);
      const pos = S0.clone().lerp(E0, clamp(u)); pos.y += 10 * pull * (u - 0.85); pos.x += 8 * pull * (u - 0.85);
      p.visible = u > -0.2 && u < 1.8; p.position.copy(pos);
      const dir = E0.clone().sub(S0).normalize().lerp(V().set(0.7, 0.7, 0).normalize(), pull); p.lookAt(pos.clone().add(dir)); p.spin(t);
      const b = blasts[i], kb = ss(t0 + 1.55, t0 + 1.7, t) * (1 - ss(t0 + 1.9, t0 + 2.6, t)); b.position.set(gx, 2.2, gz); b.material.opacity = 0.9 * kb; b.scale.setScalar(6 + 10 * kb);
    });
    Pl.tick?.(t); cmd.root.visible = false; cmdTank.visible = false;
    return U.film(t);
  };
  const actG = t => {
    stukas.forEach(p => { p.visible = false; }); wedge.forEach(w => { w.visible = false; });
    cmdTank.visible = true; cmdTank.position.set(0, 0, -2); cmdTank.rotation.y = 0.25; cmdTank.rock(t, 0.4);
    cmdTank.turret.updateMatrixWorld(true); const hatch = V().set(-0.18, 0.74 + 0.26, -0.78); cmdTank.turret.localToWorld(hatch);
    cmd.root.visible = true; cmd.root.position.set(hatch.x, hatch.y - 0.6, hatch.z); cmd.root.rotation.y = 0.25 + 0.35;
    K.act(cmd, A.headset(t, 2, 1), t, { talk: 0.9 });
    Pl.tick?.(t);
    return U.film(t) + U.popCard(t, tRad - 0.2, tH + 0.2, 'LA CLAVE', 'Cada tanque con radio', 'tanques y aviones atacan juntos', { x: 1440, y: 140, w: 460, accent: '#c9a227' });
  };

  // ================================================================ H: the map — Poland falls in five weeks
  const Mh = MP.europe({ period: 'w1939' });
  const GER = [[[16.0, 53.9], [17.6, 53.6], [18.6, 53.3]], [[20.4, 54.1], [20.8, 53.3], [21.0, 52.45]], [[16.6, 51.1], [18.6, 51.7], [20.7, 52.1]], [[20.0, 49.3], [21.2, 50.2], [22.3, 51.0]]]
    .map(p => EU.arrow(Mh, p, '#3a3f48', 0.55));
  const SOVA = [[[28.2, 54.0], [26.0, 53.4], [24.0, 52.8]], [[27.6, 50.6], [25.6, 50.4], [23.8, 50.2]]].map(p => EU.arrow(Mh, p, '#a8322a', 0.55));
  const wars = EU.pulse(Mh, 21.01, 52.23, '#b8342f', 1.1);
  const actH = t => {
    const kf = ss(tCay - 0.1, tCay + 0.7, t); Mh.paint('w1939', 'w1939b', kf);
    GER.forEach((a, i) => a.set(ss(tH - 0.2 + i * 0.18, tH + 0.9 + i * 0.18, t)));
    SOVA.forEach((a, i) => a.set(ss(tSov - 0.2 + i * 0.2, tSov + 0.9 + i * 0.2, t)));
    wars.update(t, tH + 0.9);
    return U.film(t) + EU.city(ctx, Mh, 'Varsovia', fade(t, tH + 0.5, ctx.dur + 1))
      + U.dark(t, tSov - 0.15, tCay - 0.2, '17 de septiembre', 'La Unión Soviética invade por el este', { side: 'r', w: 520 })
      + U.bigNumber(t, tCin - 0.2, ctx.dur + 1, '5 semanas', '1 DE SEPTIEMBRE – 6 DE OCTUBRE DE 1939', { y: 860, size: 96, count: 0, band: true });
  };
  const [hx, , hz] = EU.wpos(21.0, 52.2);

  const sfx = [
    { t: 0, type: 'clock', dur: tB, vol: 0.2 }, { t: 0.4, type: 'steps', dur: 5.0, vol: 0.22 }, { t: 0.2, type: 'drone', dur: tC, vol: 0.22 }, ...[tHit, tSta].map(x => ({ t: x - 0.25, type: 'thud', vol: 0.45 })),
    { t: tFir + 0.1, type: 'stamp', vol: 0.3 }, { t: tB, type: 'whoosh', vol: 0.3 }, { t: tRep, type: 'swoosh', vol: 0.35 },
    { t: tC, type: 'birds', dur: tD - tC, vol: 0.18 }, { t: tC, type: 'wind', dur: tD - tC, vol: 0.2 }, { t: tUp - 0.1, type: 'creak', vol: 0.5 }, { t: tUp + 1.2, type: 'march', dur: tD - tUp - 1.2, vol: 0.3 },
    { t: tUp + 1.3, type: 'engine', dur: tD - tUp - 1.3, vol: 0.32 }, { t: tInv, type: 'sting', vol: 0.3 },
    { t: tD, type: 'hiss', dur: tE - tD, vol: 0.12 }, { t: tD, type: 'clock', dur: tE - tD, vol: 0.18 }, { t: tGue, type: 'sting2', vol: 0.3 },
    { t: tE, type: 'engines', dur: tG - tE, vol: 0.4 }, { t: tRel - 0.35, type: 'riser', dur: 0.4, vol: 0.3 }, { t: tRel, type: 'bigboom', vol: 0.35 },
    { t: tF - 0.4, type: 'siren', dur: 1.8, vol: 0.28 }, { t: tF - 0.2, type: 'plane', dur: tG - tF + 0.4, vol: 0.35 }, ...[0, 1, 2].map(i => ({ t: tF - 0.6 + i * 0.42 + 1.55, type: 'bigboom', vol: 0.4 })),
    { t: tG, type: 'engine', dur: tH - tG, vol: 0.25 }, { t: tG, type: 'hiss', dur: tH - tG, vol: 0.12 }, { t: tG + 0.1, type: 'click', vol: 0.4 },
    { t: tH, type: 'whoosh', vol: 0.3 }, ...[0, 1, 2, 3].map(i => ({ t: tH - 0.1 + i * 0.18, type: 'swoosh', vol: 0.25 })), { t: tSov - 0.1, type: 'swoosh', vol: 0.3 }, { t: tCay, type: 'sting', vol: 0.32 },
    { t: tH, type: 'drums', dur: ctx.dur - tH, vol: 0.25 },
  ];
  const shots = [
    { t0: 0, set: Pr, p0: [0.15, 0.98, 2.2], l0: [0.25, 1.0, -2.6], p1: [0.28, 0.86, 1.25], l1: [0.32, 0.92, -2.4], fov0: 46, act: actA },
    { t0: tB, set: Mb, p0: [bx, 27, bz + 13], l0: [bx, 0, bz], p1: [bx, 25, bz + 12], l1: [bx, 0, bz], fov0: 40, act: actB },
    { t0: tC, set: Bd, p0: [4.3, 1.3, 4.9], l0: [-0.3, 0.5, -0.6], p1: [3.9, 1.24, 4.4], l1: [-0.3, 0.5, -0.6], fov0: 40, act: actC },
    { t0: tD, set: Pa, p0: [1.74, 0.84, -1.95], l0: [0.15, 0.45, -0.35], p1: [1.68, 0.8, -1.85], l1: [0.15, 0.45, -0.35], fov0: 48, act: actD },
    { t0: tE, set: Pl, p0: [2.4, 0.5, 4.2], l0: [-0.4, 0.95, -12], p1: [2.0, 0.46, 3.4], l1: [-0.4, 0.95, -12], fov0: 44, act: actE },
    { t0: tF, set: Pl, p0: [5.0, 0.7, 2.0], l0: [-6, 10, -24], p1: [4.6, 0.7, 1.6], l1: [-4, 8, -26], fov0: 50, act: actF },
    { t0: tG, set: Pl, p0: [1.45, 1.55, 0.25], l0: [-0.12, 1.32, -2.3], p1: [1.3, 1.52, 0.05], l1: [-0.12, 1.32, -2.3], fov0: 40, act: actG },
    { t0: tH, set: Mh, p0: [hx, 13, hz + 8], l0: [hx, 0, hz], p1: [hx, 15, hz + 9.5], l1: [hx, 0, hz], fov0: 40, act: actH },
  ];
  const inst = { scene: Pr, scenes: [Pr, Mb, Bd, Pa, Pl, Mh], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
