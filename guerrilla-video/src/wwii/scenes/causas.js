import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as MP from '../maps.js';
import * as M from '../../lib/motion.js';
import * as RP from '../../rusia/props.js';
import { run, wt } from '../../whatif/shots.js';
const { ss, clamp, HAND } = M;
const EU = MP.EU, fade = U.fade;
export const preload = MP.preload;
const V = () => new THREE.Vector3();
const wrist = (r, s) => { r.root.updateMatrixWorld(true); return r.j['wri' + s].bone.getWorldPosition(V()); };

export function build(ctx) {
  const L = ctx.L;
  const tVer = wt(L[0], 'versalles'), tHum = wt(L[0], 'humillada'), tCol = wt(L[0], 'colonias'), tEnd = wt(L[0], 'endeudada');
  const tB = L[1].t0 - 0.3, tDep = wt(L[1], 'depresion'), tMil = wt(L[1], 'millones');
  const tC = L[2].t0 - 0.3, tDic = wt(L[2], 'dictadores'), tMus = wt(L[2], 'mussolini'), tHit = wt(L[2], 'hitler'), tJap = wt(L[2], 'japon'), tChi = wt(L[2], 'china');
  const tD = L[3].t0 - 0.3, tRea = wt(L[3], 'rearmo'), tAus = wt(L[3], 'austria'), tChe = wt(L[3], 'checoslovaquia'), tMie = wt(L[3], 'mientras'), tPot = wt(L[3], 'potencias'),
    tGue = wt(L[3], 'guerra'), tHac = wt(L[3], 'hacer');
  const tA2 = tVer - 0.3, tE = tAus - 0.55;

  // ================================================================ A: Versailles, 28 June 1919
  // As in Orpen's painting: the victors sit behind the long table, the German delegate signs at a small desk before it.
  const Hm = S.W1.hallOfMirrors();
  const desk = RP.desk(1.6, 0.8, '#4a3020'); desk.position.set(0, 0, -0.35); Hm.add(desk);
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.004, 0.14), new THREE.MeshStandardMaterial({ color: '#f3ecd8', roughness: 0.9 })); sheet.position.set(0.02, desk.top + 0.002, -0.24); Hm.add(sheet);
  const chair = RP.chairR('#5a3a24', '#7a2a24'); chair.position.set(0, 0, 0.0); chair.rotation.y = Math.PI; Hm.add(chair);
  const signer = K.person(Hm, 'oguri', 'diplomatico', 0, 0.0, Math.PI); K.seatOn(signer, chair.top); const ySign = signer.root.position.y;
  const second = K.person(Hm, 'helios', 'diplomatico', 0.6, 0.34, Math.PI + 0.45);
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.003, 0.085, 6), new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.4 })); pen.userData.dynamic = true; Hm.add(pen);
  const victors = [1, 2, 3].map(i => { const [x, , z] = Hm.seats(i), r = K.person(Hm, ['suzuka', 'cafe', 'doto'][i - 1], 'diplomatico', x, z + 0.02, 0); K.seatOn(r, 0.198); r.y0 = r.root.position.y; return r; });
  const sideL = K.crowd(Hm, ['diplomatico', 'civil', 'diplomatico'], 10, [-4.8, -9, -3.3, 4], { seed: 11, face: [0, -1.6] });
  const sideR = K.crowd(Hm, ['diplomatico', 'diplomatico', 'civil'], 10, [3.3, -9, 4.8, 4], { seed: 12, face: [0, -1.6] });
  const P0 = [0.02, desk.top, -0.24];
  const actA = t => {
    signer.root.position.y = ySign;
    K.act(signer, A.write(t, 1, P0, Math.PI, ss(tA2 - 0.6, tA2, t)), t, { mouth: 'frown' });
    const w = wrist(signer, 'R'); pen.position.copy(w).add(V().set(0, -0.012, -0.02)); pen.rotation.set(0.5, 0, -0.35);
    K.act(second, M.mix(A.stand(t, 2), A.crossArms(t, 2), 0.6), t, { mouth: 'frown' });
    victors.forEach((r, i) => { r.root.position.y = r.y0; K.act(r, A.seated(A.crossArms, t, i + 3), t, { mouth: 'neutral' }); });
    [...sideL, ...sideR].forEach((r, i) => K.act(r, A.stand(t, i + 7), t, { mouth: 'neutral' }));
    return U.film(t) + U.stamp(t, 0.5, tB + 0.2, '28 de junio de 1919', 'Versalles')
      + U.slam(t, tHum - 0.05, tB + 0.25, 'HUMILLADA', { x: 1430, y: 330, rot: -7 }) + U.slam(t, tCol - 0.05, tB + 0.25, 'SIN COLONIAS', { x: 1470, y: 490, rot: 5 })
      + U.slam(t, tEnd - 0.05, tB + 0.25, 'ENDEUDADA', { x: 1420, y: 650, rot: -4 }) + U.source(t, tEnd + 0.2, tB + 0.25, 'Reparaciones fijadas en 1921: 132 mil millones de marcos oro');
  };

  // ================================================================ B: 1929 — the soup line
  const Dp = S.depression(), T = Dp.table;
  const server = K.person(Dp, 'daiwa', 'civilMujer', T.x + 0.42, T.z - 0.36, 0.35);
  const ladleM = new THREE.Group(); ladleM.add(new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.2, 6), new THREE.MeshStandardMaterial({ color: '#9aa0a4', metalness: 0.6, roughness: 0.3 })));
  const cup = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#9aa0a4', metalness: 0.6, roughness: 0.3, side: THREE.DoubleSide })); cup.position.y = -0.1; ladleM.add(cup);
  ladleM.userData.dynamic = true; Dp.add(ladleM);
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.035, 12), new THREE.MeshStandardMaterial({ color: '#e8e2d4', roughness: 0.6 })); bowl.userData.dynamic = true; Dp.add(bowl);
  // the line runs along the shopfront toward the table, everyone facing -x
  const Q = ['spe', 'cafe', 'hishi', 'tamamo', 'mcqueen', 'oguri', 'suzuka'].map((k, i) => {
    const r = K.person(Dp, k, i === 2 || i === 5 ? 'civilMujer' : i % 2 ? 'refugiado' : 'civil', T.x + 0.82 + i * 0.55, T.z + 0.03 + (i % 2 ? 0.05 : -0.03), -Math.PI / 2 + (i % 2 ? 0.08 : -0.06)); r.x0 = r.root.position.x; return r; });
  // the line shuffles forward one small step, starting from the back
  const stepAt = i => tB + 1.4 + (6 - i) * 0.32;
  const actB = t => {
    const u = ((t - tB) / 2.2) % 1, bw = bowl.position;
    K.act(server, A.ladle(t, 4, [Dp.pot[0], Dp.pot[1] + 0.26, Dp.pot[2]], [bw.x + 0.02, bw.y + 0.14, bw.z], u), t, { mouth: 'neutral' });
    const w = wrist(server, 'R'); ladleM.position.copy(w).add(V().set(0, 0.02, 0.02)); ladleM.rotation.set(0.25, 0, 0);
    Q.forEach((r, i) => {
      if (i === 0) { K.act(r, A.holdBowl(t, 10), t, { mouth: 'neutral' }); const a = wrist(r, 'L'), b = wrist(r, 'R'); bowl.position.copy(a).add(b).multiplyScalar(0.5).add(V().set(0, 0.025, 0)); return; }
      const tr = M.travel(t, stepAt(i), 0.12 / r.unit, 0.25, 0.4);
      r.root.position.x = r.x0 - tr.D * r.unit;
      const st = A.dejected(t, 10 + i), g = M.gait(tr.D, { amp: tr.amp * 0.6, seed: i, stride: 0.6 });
      K.act(r, tr.moving ? M.mix(st, g, clamp(tr.amp * 1.4)) : st, t, { mouth: i % 3 ? 'neutral' : 'frown' });
    });
    return U.film(t) + U.stamp(t, tB + 0.25, tC + 0.2, '1929 – 1933', 'La Gran Depresión')
      + U.popCard(t, tMil - 0.25, tC + 0.25, 'ESTADOS UNIDOS · 1933', '1 de cada 4', 'trabajadores sin empleo', { x: 1460, y: 140, w: 470, accent: '#c9a227' })
      + U.popCard(t, tMil + 0.35, tC + 0.25, 'ALEMANIA · 1932', '6 millones', 'de desempleados', { x: 1460, y: 330, w: 470, accent: '#b8342f' });
  };

  // ================================================================ C: the dictators rise (silhouettes on a dark tribune)
  const Tr = S.tribune();
  const sils = [['mussolini', 0, tMus], ['hitler', 1, tHit], ['tojo', 2, tJap]].map(([k, i, t0]) => { const m = K.silhouette(k, 3.0), p = Tr.plinths[i]; m.position.set(p.x, p.top, -6.0); Tr.add(m); m.t0 = t0; m.i = i; return m; });
  const key = new THREE.SpotLight('#c8d4ff', 30, 30, 0.8, 0.7, 1.2); key.position.set(-4, 7, 7); key.target.position.set(0, 0.5, -1.2); Tr.add(key, key.target);
  // a block of soldiers marching across in step, and tanks for the rearmament
  const cols = 6, rows = 3, MV = 0.32, CS = 0.62, RS = 0.55;   // ~2.3 steps a second
  const troop = Array.from({ length: cols * rows }, (_, i) => { const r = K.person(Tr, ['oguri', 'doto', 'cafe', 'helios', 'tamamo', 'suzuka', 'spe', 'hishi', 'mcqueen'][i % 9], 'aleman', 0, 0, Math.PI / 2, { shadow: false }); r.c = i % cols; r.rw = Math.floor(i / cols); return r; });
  const tanks = [0, 1].map(() => { const tk = P.tank('pz4'); tk.scale.setScalar(0.48); tk.rotation.y = Math.PI / 2; Tr.add(tk); return tk; });
  const marchAll = (t, lead, z0) => troop.forEach(r => {
    const x = lead - r.c * CS, z = z0 - r.rw * RS; r.root.position.set(x, 0, z); r.root.visible = x > -7 && x < 7;
    K.act(r, A.march(lead / r.unit, 0, 1, 1.4), t, { mouth: 'neutral' });
  });
  const lights = (t, only = null) => sils.forEach(m => { const k = ss(m.t0 - 0.35, m.t0 + 0.2, t) * (only === null || only === m.i ? 1 : 0.55);
    m.material.opacity = ss(m.t0 - 0.35, m.t0 + 0.2, t); m.visible = m.material.opacity > 0.01; m.position.y = Tr.plinths[m.i].top - 0.3 * (1 - m.material.opacity); m.gesture(t + m.i, 1.4);
    Tr.spots[m.i].intensity = 60 * k; Tr.beams[m.i].set(k); });
  const actC = t => {
    lights(t); marchAll(t, -3.6 + MV * (t - tDic + 0.8), -0.9); tanks.forEach(tk => { tk.visible = false; });
    return U.film(t) + U.dark(t, tMus - 0.1, tHit - 0.2, 'Benito Mussolini', 'Dictador de Italia desde 1922', { side: 'l' })
      + U.dark(t, tHit - 0.1, tJap - 0.25, 'Adolf Hitler', 'Gobierna Alemania desde 1933', { side: 'r' })
      + U.dark(t, tJap - 0.1, tD + 0.2, 'Japón militarista', 'Invade Manchuria (1931) y China (1937)', { side: 'r' });
  };
  const actD = t => {
    lights(t, 1); marchAll(t, -0.6 + MV * (t - tD), -2.0);
    tanks.forEach((tk, i) => { const x = -2.6 + (t - tD) * 0.95 - i * 3.3; tk.visible = true; tk.position.set(x, 0, -0.55); tk.drive(x); tk.rock(t + i * 0.7, 1); });
    return U.film(t) + U.popCard(t, tRea - 0.15, tE + 0.2, 'VIOLANDO VERSALLES', 'Alemania se rearma', 'Servicio militar obligatorio desde 1935', { x: 1460, y: 140, w: 480, accent: '#b8342f' });
  };

  // ================================================================ E: the map — Austria, Czechoslovakia, Munich
  const Mp = MP.europe({ period: 'w1937' });
  const toAus = EU.arrow(Mp, [[11.6, 48.2], [13.4, 48.0], [16.0, 48.2]], '#3a3f48', 0.5), toCze = EU.arrow(Mp, [[13.0, 51.2], [14.0, 50.6], [14.6, 49.9]], '#3a3f48', 0.5);
  const london = EU.pulse(Mp, -0.13, 51.5, '#e0b84a', 1.2), munich = EU.pulse(Mp, 11.58, 48.14, '#e0b84a', 1.0);
  const actE = t => {
    const kA = ss(tAus - 0.15, tAus + 0.45, t), kC = ss(tChe - 0.1, tChe + 0.6, t);
    if (kC <= 0) Mp.paint('w1937', 'w1938', kA); else Mp.paint('w1938', 'w1939', kC);
    toAus.set(ss(tAus - 0.35, tAus + 0.35, t)); toCze.set(ss(tChe - 0.3, tChe + 0.4, t));
    munich.update(t, tMie - 0.1); london.update(t, tPot - 0.2);
    const pulseDark = ss(tHac - 0.4, tHac + 0.2, t) * (0.5 + 0.5 * Math.sin((t - tHac) * 7)) * (1 - ss(ctx.dur - 0.6, ctx.dur, t));
    Mp.tintState('w1939', 'X_GER', '#2a0d0b', pulseDark * 0.6, 0.6);
    return U.film(t) + EU.chip(ctx, 14.6, 47.4, fade(t, tAus - 0.1, ctx.dur + 1), 'AUSTRIA', 'anexada · marzo de 1938', '#4b5059')
      + EU.chip(ctx, 16.6, 49.9, fade(t, tChe - 0.05, ctx.dur + 1), 'CHECOSLOVAQUIA', 'los Sudetes (1938) y el resto (1939)', '#4b5059')
      + EU.chip(ctx, 9.0, 48.6, fade(t, tMie - 0.1, ctx.dur + 1), 'Acuerdo de Múnich', 'septiembre de 1938', '#e0b84a')
      + U.popCard(t, tPot - 0.2, ctx.dur + 1, 'APACIGUAMIENTO', '«Paz para nuestro tiempo»', 'Neville Chamberlain, primer ministro británico', { x: 1440, y: 140, w: 500, accent: '#3f6fb5' });
  };
  const [ax, , az] = EU.wpos(14.5, 49.2), [mx, , mz] = EU.wpos(8.5, 49.5);

  const sfx = [
    { t: 0, type: 'crowd', dur: tB, vol: 0.18 }, { t: 0.3, type: 'quill', dur: tB - 0.3, vol: 0.28 }, ...[tHum, tCol, tEnd].map(x => ({ t: x, type: 'stamp', vol: 0.5 })),
    { t: tB, type: 'wind', dur: tC - tB, vol: 0.25 }, { t: tB + 0.2, type: 'bubbling', dur: tC - tB - 0.2, vol: 0.18 }, { t: tMil - 0.2, type: 'pop', vol: 0.35 }, { t: tMil + 0.35, type: 'pop', vol: 0.35 },
    { t: tC, type: 'drone', dur: tD - tC, vol: 0.3 }, { t: tDic - 0.6, type: 'march', dur: tE - tDic + 0.6, vol: 0.32 }, ...[tMus, tHit, tJap].map(x => ({ t: x - 0.35, type: 'thud', vol: 0.5 })),
    { t: tD, type: 'engine', dur: tE - tD, vol: 0.35 }, { t: tD, type: 'clank', vol: 0.4 },
    { t: tE, type: 'whoosh', vol: 0.3 }, { t: tAus - 0.1, type: 'hit', vol: 0.4 }, { t: tChe - 0.05, type: 'hit', vol: 0.4 }, { t: tMie - 0.1, type: 'pop', vol: 0.35 }, { t: tPot - 0.2, type: 'paper', vol: 0.4 },
    { t: tGue, type: 'tension', dur: ctx.dur - tGue, vol: 0.3 },
  ];
  const shots = [
    { t0: 0, set: Hm, p0: [0.5, 1.7, 7.6], l0: [0, 0.5, -1.8], p1: [0.3, 1.25, 4.4], l1: [0, 0.5, -1.4], fov0: 40, act: actA },
    { t0: tA2, set: Hm, p0: [0.3, 0.56, -1.62], l0: [0.05, 0.56, 0.0], p1: [0.22, 0.56, -1.5], l1: [0.05, 0.56, 0.0], fov0: 38, act: actA },
    { t0: tB, set: Dp, p0: [0.15, 0.6, -0.5], l0: [0.15, 0.92, -4.7], p1: [0.6, 0.6, -0.75], l1: [0.6, 0.92, -4.7], fov0: 40, act: actB },
    { t0: tC, set: Tr, p0: [0, 0.78, 3.4], l0: [0, 2.6, -6], p1: [0, 0.86, 2.5], l1: [0, 2.75, -6], fov0: 50, act: actC },
    { t0: tD, set: Tr, p0: [-2.3, 0.95, 2.5], l0: [0.4, 1.45, -4], p1: [-2.0, 0.98, 2.2], l1: [0.6, 1.5, -4], fov0: 46, act: actD },
    { t0: tE, set: Mp, p0: [ax, 12, az + 8], l0: [ax, 0, az], p1: [mx, 19, mz + 12], l1: [mx, 0, mz - 0.5], fov0: 40, act: actE },
  ];
  const inst = { scene: Hm, scenes: [Hm, Dp, Tr, Mp], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
