import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as MP from '../maps.js';
import * as M from '../../lib/motion.js';
import { run, wt } from '../../whatif/shots.js';
const { ss, clamp, HAND } = M;
const EU = MP.EU, fade = U.fade;
export const preload = MP.preload;
const V = () => new THREE.Vector3();
const wrist = (r, s) => { r.root.updateMatrixWorld(true); return r.j['wri' + s].bone.getWorldPosition(V()); };

// The Holocaust, told soberly: the map of the camps, a family walking into the ghetto, an empty wagon, candles,
// the gate of Birkenau in the fog, and Anne Frank writing her diary. No perpetrators on screen, no violence.
export function build(ctx) {
  const L = ctx.L;
  const tOcu = wt(L[0], 'ocupada'), tNaz = wt(L[0], 'nazis'), tHol = wt(L[0], 'holocausto');
  const tGue = wt(L[1], 'guetos'), tAse = wt(L[1], 'asesinaron'), tSei = wt(L[1], 'seis'), tDos = wt(L[1], 'dos'), tTam = wt(L[1], 'tambien'),
    tGit = wt(L[1], 'gitano'), tDis = wt(L[1], 'discapacidad'), tPri = wt(L[1], 'prisioneros'), tOpo = wt(L[1], 'opositores');
  const tAus = wt(L[2], 'auschwitz'), tUna = wt(L[2], 'una'), tAna = wt(L[2], 'ana'), tEsc = wt(L[2], 'escondida');
  const tB0 = tHol - 0.45, tB1 = L[1].t0 - 0.25, tB2 = tAse - 0.3, tB3 = tDos - 0.35, tB4 = tTam - 0.3, tC1 = L[2].t0 - 0.25, tC2 = tUna - 0.3, tC3 = L[2].t1 + 0.25;

  // ================================================================ A: occupied Europe, 1942 — where the camps were
  const Ma = MP.europe({ period: 'w1942' });
  const CAMPS = ['Chelmno', 'Treblinka', 'Sobibor', 'Majdanek', 'Belzec', 'Auschwitz'];
  const actA = t => {
    Ma.paint('w1942');
    return U.film(t) + EU.chip(ctx, 12.2, 49.2, fade(t, tOcu - 0.3, tB0 + 0.3), 'EUROPA OCUPADA', 'por la Alemania nazi · 1942', '#4b5059')
      + EU.city(ctx, Ma, 'Varsovia', fade(t, tNaz - 0.4, tB0 + 0.3), 'c', 'Varsovia (gueto)')
      + CAMPS.map((n, i) => EU.city(ctx, Ma, n, fade(t, tNaz + 0.25 * i, tB0 + 0.3))).join('');
  };
  const [ax, , az] = EU.wpos(19.5, 51.3);

  // ================================================================ B0: the title — one candle in the dark
  const Md = S.memorialDark();
  const one = P.memCandle(0.36, { seed: 7, light: true, power: 2.2 }); one.position.set(0, 0, 3.4); Md.add(one);
  const actB0 = t => { one.visible = true; one.update(t, 1); Md.three.forEach(c => { c.visible = false; }); Md.row.forEach(c => c.update(t, 1));
    return U.film(t) + U.solemn(t, tB0 + 0.25, tB1 + 0.3, 'EL HOLOCAUSTO', 'La Shoá', { y: 170 }); };

  // ================================================================ B1: Warsaw, 1940 — a family walks into the ghetto with what they can carry
  const Gh = S.ghetto('overcast');
  const fam = [['doto', 'civilMujer', -0.9, -8.7, 1], ['spe', 'ninoGueto', -0.45, -8.55, 0.8], ['hishi', 'civil', 0.05, -9.9, 1], ['daiwa', 'ninoGueto', 0.5, -9.75, 0.78]]
    .map(([who, o, x, z, sc], i) => { const r = K.person(Gh, who, o, x, z, 0, { shadow: false }); r.root.scale.setScalar(sc); r.x0 = x; r.z0 = z; r.i = i; return r; });
  const cases = [0, 2].map(i => { const c = K.suitcase(['#6a4a2e', '#4a3a30'][i / 2]); c.userData.dynamic = true; Gh.add(c); return { r: fam[i], c }; });
  const actB1 = t => {
    fam.forEach(r => { const D = (t - tB1 + 0.5) * 0.42, z = r.z0 + D; r.root.position.set(r.x0, 0, z);
      const p = M.gait(D / (r.unit * r.root.scale.x), { amp: 0.75, seed: r.i, stride: 0.9 });
      if (r.i === 0 || r.i === 2) { p.aR = [-1.25, -0.3, 0.15]; p.aWR = 1; p.plR = [-1, 0, -0.5]; p.hR = HAND.grip; p.aL = [0.95, -0.2, 0.35]; p.aWL = 1; p.plL = [1, -0.2, -0.6]; p.hL = HAND.soft; }
      else { p.aR = [-0.95, 0.05, 0.3]; p.aWR = 1; p.plR = [-1, -0.2, -0.6]; p.hR = HAND.soft; }
      p.head = [(p.head?.[0] || 0) + 10, (p.head?.[1] || 0) + (r.i % 2 ? 10 : 0), 0];
      K.act(r, p, t, { mouth: 'frown' }); });
    cases.forEach(({ r, c }) => { c.position.copy(wrist(r, 'R')).add(V().set(0, -0.01, 0)); c.rotation.set(0, r.root.rotation.y, 0); c.scale.setScalar(r.root.scale.x); });
    Gh.tick?.(t);
    return U.film(t) + U.stamp(t, tB1 + 0.3, tB2 + 0.2, 'noviembre de 1940', 'Gueto de Varsovia, Polonia ocupada');
  };

  // ================================================================ B2: an empty wagon on a siding in the fog — "six million"
  const Bk = S.birkenau();
  const ray = P.memCandle(0.3, { seed: 3, light: true, power: 1.4 }); ray.position.set(0, 0.3, 4.4); Bk.add(ray);
  const actB2 = t => { ray.visible = false; Bk.tick?.(t);
    return U.film(t) + U.bigNumber(t, tSei - 0.2, tB3 + 0.25, '6 000 000', 'JUDÍOS ASESINADOS', { y: 200, size: 110, count: 0, band: true }); };

  // ================================================================ B3: three candles; two go out — "two out of every three"
  const out1 = tDos + 0.35, out2 = tDos + 0.75;
  const actB3 = t => { one.visible = false; Md.three.forEach(c => { c.visible = true; });
    Md.three.forEach((c, i) => { const to = i === 0 ? out1 : i === 2 ? out2 : 1e9, k = 1 - ss(to, to + 0.25, t); c.update(t, k, t > to ? t - to : -1); });
    Md.row.forEach(c => c.update(t, 0));
    return U.film(t) + U.bigNumber(t, tDos - 0.15, tB4 + 0.25, '2 de cada 3', 'JUDÍOS DE EUROPA', { y: 190, size: 100, count: 0 }); };

  // ================================================================ B4: the memorial wall — the candles light one by one; the other victims
  const actB4 = t => { one.visible = false; Md.three.forEach(c => { c.visible = true; });
    Md.three.forEach(c => c.update(t, 0));
    Md.row.forEach((c, i) => c.update(t, ss(tB4 + 0.1 + i * 0.09, tB4 + 0.4 + i * 0.09, t)));
    return U.film(t) + U.memList(t, tB4 + 0.2, tC1 + 0.25, 'TAMBIÉN FUERON PERSEGUIDOS Y ASESINADOS',
      [['El pueblo gitano (romaní)', tGit - 0.3], ['Personas con discapacidad', tDis - 0.3], ['Prisioneros de guerra', tPri - 0.25], ['Opositores políticos', tOpo - 0.25]], { x: 1250, y: 150, w: 600 }); };

  // ================================================================ C1: the gate of Birkenau from the tracks; a candle on a sleeper
  const actC1 = t => { ray.visible = true; ray.update(t, 1); Bk.tick?.(t);
    return U.film(t) + U.stamp(t, tC1 + 0.2, tC2 + 0.2, '1940 – 1945', 'Auschwitz-Birkenau, Polonia ocupada')
      + U.bigNumber(t, tAus + 0.2, tC2 + 0.25, '1,1 millones', 'DE PERSONAS ASESINADAS EN AUSCHWITZ', { y: 200, size: 104, count: 0, band: true })
      + U.source(t, tAus + 0.8, tC2 + 0.25, 'El Ejército Rojo liberó Auschwitz el 27 de enero de 1945'); };

  // ================================================================ C2: Amsterdam — Anne Frank writes her diary in the Secret Annex; C3: the desk, the diary closed
  const Ax = S.annex();
  const ana = K.person(Ax, 'cafe', 'ana', 0.3, -1.62, 0); K.seatOn(ana, Ax.chair.top); const yA = ana.root.position.y;
  const dOpen = P.diary(true); dOpen.position.set(Ax.P[0], Ax.P[1], Ax.P[2]); Ax.add(dOpen);
  const dShut = P.diary(false); dShut.position.set(Ax.P[0] + 0.05, Ax.P[1], Ax.P[2] - 0.02); dShut.rotation.y = 0.25; Ax.add(dShut);
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.003, 0.085, 6), new THREE.MeshStandardMaterial({ color: '#2a2a3a', roughness: 0.4 })); pen.userData.dynamic = true; Ax.add(pen);
  const PG = [Ax.P[0] + 0.05, Ax.P[1] + 0.012, Ax.P[2]];
  const actC2 = t => { ana.root.visible = pen.visible = dOpen.visible = true; dShut.visible = false; ana.root.position.y = yA;
    const pause = ss(tEsc - 0.2, tEsc + 0.4, t) * (1 - ss(tEsc + 1.6, tEsc + 2.2, t));
    const p = M.mix(A.write(t, 2, PG, 0, 1), A.seated(A.lookUp, t, 2, 0.8), pause * 0.55);
    K.act(ana, p, t, { mouth: pause > 0.5 ? [0, 0.35] : 'neutral' });
    pen.position.copy(wrist(ana, 'R')).add(V().set(0, -0.012, 0.02)); pen.rotation.set(-0.5, 0, 0.35);
    return U.film(t) + U.who(t, tAna - 0.2, tC3 + 0.2, 'Ana Frank', '1929 – 1945 · murió en Bergen-Belsen, a los 15 años', { side: 'l' })
      + U.stamp(t, tC2 + 0.3, tC3 + 0.2, '1942 – 1944', 'el Anexo Secreto, Ámsterdam'); };
  const actC3 = t => { ana.root.visible = pen.visible = dOpen.visible = false; dShut.visible = true;
    return U.film(t) + U.source(t, tC3 + 0.3, ctx.dur + 1, 'Su diario se publicó en 1947 y hoy se lee en más de 70 idiomas'); };

  const sfx = [
    { t: 0, type: 'drone', dur: tB1, vol: 0.22 }, { t: tB0 + 0.2, type: 'hiss', vol: 0.08 },
    { t: tB1, type: 'wind', dur: tB2 - tB1, vol: 0.3 }, { t: tB1, type: 'steps', dur: tB2 - tB1, vol: 0.28 },
    { t: tB2, type: 'wind', dur: tB3 - tB2, vol: 0.4 }, { t: tB2 + 0.6, type: 'creak', vol: 0.12 },
    { t: tB3, type: 'drone', dur: tC1 - tB3, vol: 0.18 }, { t: out1, type: 'hiss', vol: 0.1 }, { t: out2, type: 'hiss', vol: 0.1 },
    { t: tC1, type: 'wind', dur: tC2 - tC1, vol: 0.42 },
    { t: tC2, type: 'clock', dur: ctx.dur - tC2, vol: 0.12 }, { t: tC2 + 0.2, type: 'quill', dur: tEsc - tC2, vol: 0.2 }, { t: tC3, type: 'paper', vol: 0.15 },
  ];
  const [bx, by, bz] = [0, 0.45, 1.2];
  const shots = [
    { t0: 0, set: Ma, p0: [ax, 21, az + 11], l0: [ax, 0, az], p1: [ax + 0.6, 18.5, az + 9.8], l1: [ax + 0.4, 0, az - 0.3], fov0: 40, act: actA },
    { t0: tB0, set: Md, p0: [0.05, 0.62, 4.5], l0: [0, 0.48, 3.4], p1: [0.02, 0.58, 4.15], l1: [0, 0.46, 3.4], fov0: 34, act: actB0 },
    { t0: tB1, set: Gh, p0: [0.9, 0.92, -5.4], l0: [-1.0, 0.72, -10.5], p1: [1.0, 0.92, -4.7], l1: [-1.0, 0.72, -10.5], fov0: 44, act: actB1 },
    { t0: tB2, set: Bk, p0: [-2.6, 1.05, 5.2], l0: [-6.3, 1.4, -3.5], p1: [-2.9, 1.0, 4.4], l1: [-6.3, 1.4, -3.5], fov0: 44, act: actB2 },
    { t0: tB3, set: Md, p0: [bx, 0.66, 2.75], l0: [bx, by, bz], p1: [bx, 0.62, 2.5], l1: [bx, by, bz], fov0: 38, act: actB3 },
    { t0: tB4, set: Md, p0: [-4.2, 0.9, 1.6], l0: [-1.2, 0.55, -2.8], p1: [-1.6, 0.85, 1.4], l1: [1.6, 0.55, -2.8], fov0: 44, act: actB4 },
    { t0: tC1, set: Bk, p0: [0, 0.55, 7.6], l0: [0, 3.0, -44], p1: [0, 0.6, 6.4], l1: [0, 3.1, -44], fov0: 42, act: actC1 },
    { t0: tC2, set: Ax, p0: [1.15, 0.9, 1.25], l0: [0.22, 0.6, -1.4], p1: [1.0, 0.86, 0.95], l1: [0.22, 0.6, -1.4], fov0: 42, act: actC2 },
    { t0: tC3, set: Ax, p0: [0.62, 0.66, -0.25], l0: [0.32, 0.38, -0.98], p1: [0.55, 0.62, -0.38], l1: [0.32, 0.38, -0.98], fov0: 40, act: actC3 },
  ];
  const inst = { scene: Ma, scenes: [Ma, Md, Gh, Bk, Ax], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
