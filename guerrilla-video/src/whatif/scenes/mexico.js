import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as M from '../../lib/motion.js';
import { flagTex } from '../flags.js';
import { run, wt, walkIn } from '../shots.js';
import { SASH, earTwitch } from './titulo.js';
const { ss, clamp, HAND } = M;
const fade = U.fade;
const V = () => new THREE.Vector3();

// One Rudolf for the whole scene: each shot moves her into its set.
const put = (r, set, x, y, z, yaw) => { if (r.root.parent !== set) set.add(r.root); r.root.position.set(x, y, z); r.root.rotation.y = yaw; return r; };
const wrist = (r, s) => { r.root.updateMatrixWorld(true); return r.j['wri' + s].bone.getWorldPosition(V()); };
const lerp3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
// Smooth path through keyed points: keys = [[u, [x, y, z]], ...] (eases in and out of every key).
const path = (u, keys) => { let i = 0; while (i + 1 < keys.length && u >= keys[i + 1][0]) i++; if (i + 1 >= keys.length) return keys[i][1]; const [u0, p0] = keys[i], [u1, p1] = keys[i + 1]; return lerp3(p0, p1, ss(u0, u1, u)); };
const W = p => ['world', ...p];

// A cloth banner hung from the balcony that unrolls from the top (k 0..1), with its roll travelling down.
function banner(lines, w = 5.6, h = 1.5) {
  const g = new THREE.Group();
  const tex = K.canvasTex(1024, 276, (x, Wd, H) => { x.fillStyle = '#f6f1e4'; x.fillRect(0, 0, Wd, H); x.fillStyle = '#0f6b3f'; x.fillRect(0, 0, 70, H); x.fillStyle = '#c3262f'; x.fillRect(Wd - 70, 0, 70, H);
    x.fillStyle = '#1d2a22'; x.textAlign = 'center'; x.font = '900 70px Inter'; x.fillText(lines[0], Wd / 2, 118); x.fillText(lines[1], Wd / 2, 208); });
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, side: THREE.DoubleSide });
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); g.add(cloth);
  const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, w + 0.1, 12), new THREE.MeshStandardMaterial({ color: '#e8e0cc', roughness: 0.9 })); roll.rotation.z = Math.PI / 2; g.add(roll);
  g.set = k => { k = clamp(k); cloth.visible = k > 0.01; cloth.scale.y = Math.max(0.01, k); cloth.position.y = -h * k / 2; tex.repeat.set(1, Math.max(0.01, k)); tex.offset.set(0, 1 - k); roll.position.y = -h * k - 0.04; };
  g.set(0); g.userData.dynamic = true; return g;
}
// Hand flag on a stick (the stick stays upright above the fist).
function miniFlag() {
  const g = new THREE.Group(), stick = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.34, 6), P.std('#8a6a4a')); stick.position.y = 0.12; g.add(stick);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.12), new THREE.MeshStandardMaterial({ map: flagTex('mx', 96, 64), side: THREE.DoubleSide, roughness: 0.8 })); f.position.set(0.09, 0.23, 0); g.add(f);
  g.userData.dynamic = true; return g;
}
function mug() { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.025, 0.07, 14), P.std('#f2efe6', { roughness: 0.4 }))); const c = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.005, 6, 12), P.std('#f2efe6')); c.position.x = 0.032; g.add(c); g.userData.dynamic = true; return g; }

export function build(ctx) {
  const L = ctx.L;
  const tP = wt(L[0], 'puntual'), tImp = wt(L[0], 'impecable'), tCien = wt(L[0], 'ciento');
  const tB = tImp - 0.12, tA2 = 2.7, tC = L[1].t0 - 0.25, tMun = wt(L[1], 'mundo'), tFel = wt(L[1], 'felices'), tLema = wt(L[1], 'lema');
  const tC2 = tFel - 0.15, tD = wt(L[2], 'juntas') - 0.2, tE = wt(L[2], 'documentos') - 0.15, tSel = wt(L[2], 'sellados'), tPerf = wt(L[2], 'perfecta');
  const tF = wt(L[2], 'chiste') - 0.25, tF2 = wt(L[2], 'cuando') - 0.12, tOc = wt(L[2], 'ocurre'), tMuev = wt(L[2], 'mueven');
  const tG = L[3].t0 - 0.3, tRei = wt(L[3], 'reirian'), tG2 = wt(L[3], 'pero') - 0.45, tTar = wt(L[3], 'tarde');

  // ================================================================ A: 6 a.m., the Zócalo — Rudolf walks up to the Palacio
  const Z1 = S.zocalo('dawn');
  const rud = K.leader(Z1, 'rudolf', 0, -15, Math.PI); K.fitSash(rud, SASH, { emblem: K.eagleKnot() });
  const guards = [-2.4, 2.4].map((x, i) => K.person(Z1, i ? 'spe' : 'oguri', 'soldado', x, -22.9, 0));
  const early = [['hishi', -9, -9, Math.PI / 2 + 0.2, 'civilCap'], ['daiwa', 10, -6, -Math.PI / 2, 'civil']].map(([k, x, z, y, o], i) => ({ r: K.person(Z1, k, o, x, z, y, { shadow: false }), x, z, y, i }));
  const walkA = t => walkIn(rud, t, 0.15, [0, -15], Math.PI, 4.0, { speed: 0.27, seed: 1, after: tt => M.seq(tt, [[0, x => A.stand(x, 1)], [tP + 0.1, x => A.handOnHeart(x, 1, 0.0)]], 0.5) });
  const actA = t => {
    Z1.palacio.setTime(t < tP ? 5 : 6, t < tP ? 59 : 0); Z1.palacio.bell.rotation.z = t > tP ? Math.sin((t - tP) * 7) * 0.25 * Math.exp(-(t - tP) * 0.8) : 0;
    put(rud, Z1, 0, 0, -15, Math.PI); K.act(rud, walkA(t), t, { smile: 0.4 });
    guards.forEach((g, i) => K.act(g, A.salute(t, i + 3, ss(tP - 0.6, tP - 0.1, t)), t, { eye: t > tP - 0.6 ? 'open' : undefined, mouth: 'neutral' }));
    early.forEach(w => K.act(w.r, walkIn(w.r, t, w.i * 0.4, [w.x, w.z], w.y, 30, { speed: 0.18, seed: w.i + 4 }), t));
    return U.film(t) + U.digital(t, tA2 + 0.2, tB + 0.3, t < tP ? '5:59' : '6:00', { sub: t < tP ? 'A.M.' : 'A.M. · PUNTUAL', col: t < tP ? '#ff4a3a' : '#7dff9a' });
  };

  // ================================================================ B: her office — a plan for each of 130.9 million
  // She sorts the in-tray: the left hand lifts a sheet, both hands hold it while she reads, the right hand files it.
  const D = S.despacho(), DZ = -1.45;
  put(rud, D, 0, 0, DZ, 0); K.seatOn(rud, D.chair.seatY); const ySeat = rud.root.position.y;
  const top = D.desk.top, NM = 3, period = (tC - tB) / 2;
  const sheets = Array.from({ length: NM }, (_, i) => { const d = P.documentSheet(60 + i); D.add(d); return d; });
  const IN = D.inTop, OUT = D.outPile;
  const pickL = [IN[0] - 0.04, top + 0.05, IN[2] - 0.09], dropR = [OUT[0] + 0.01, top + 0.06, OUT[2] - 0.09];
  const restL = [0.17, top + 0.04, -1.47], restR = [-0.17, top + 0.04, -1.47], readL = [0.1, top + 0.15, -1.41], readR = [-0.1, top + 0.15, -1.41];
  const LK_ = [[0, restL], [0.1, pickL], [0.14, pickL], [0.27, readL], [0.62, readL], [0.74, restL], [1, restL]];
  const RK_ = [[0, restR], [0.22, restR], [0.33, readR], [0.62, readR], [0.78, dropR], [0.84, dropR], [0.92, [-0.18, top + 0.1, -1.42]], [1, restR]];
  const lean = (p, k) => { p.waist = [p.waist[0] + 6 * k, p.waist[1], p.waist[2]]; p.chest = [p.chest[0] + 5 * k, p.chest[1], p.chest[2]]; return p; };
  const sortPose = t => {
    const c = Math.min(NM - 1, Math.floor(Math.max(0, t - tB) / period)), u = clamp((t - tB - c * period) / period);
    const p = lean(A.sit(t, 1), 1);
    p.aL = W(path(u, LK_)); p.aR = W(path(u, RK_)); p.plL = [1, -0.7, -0.4]; p.plR = [-1, -0.7, -0.4];
    p.hL = u > 0.08 && u < 0.66 ? HAND.pinch : HAND.relax; p.hR = u > 0.28 && u < 0.84 ? HAND.pinch : HAND.relax;
    p.look = u < 0.14 ? IN : u < 0.66 ? [0, top + 0.17, -1.36] : u < 0.86 ? OUT : [0, top + 0.05, -1.2]; p.lookW = u > 0.2 && u < 0.66 ? 0.7 : 0.5;
    return { p, c, u };
  };
  const offL = V().set(IN[0] - pickL[0], IN[1] - pickL[1], IN[2] - pickL[2]), offR = V().set(OUT[0] - dropR[0], OUT[1] - dropR[1], OUT[2] - dropR[2]), offM = V().set(0, 0.03, 0.06);
  const placeSheets = (c, u) => sheets.forEach((s, i) => {
    s.rotation.set(0, Math.PI + 0.03 * (i - 1), 0);
    if (i > c || (i === c && u < 0.12)) { s.position.set(IN[0], IN[1] + (NM - 1 - i) * 0.002, IN[2]); return; }
    if (i < c || u >= 0.82) { s.position.set(OUT[0], OUT[1] + i * 0.002, OUT[2]); return; }
    const l = wrist(rud, 'L'), r = wrist(rud, 'R'), mid = l.clone().add(r).multiplyScalar(0.5).add(offM);
    const a = l.clone().add(offL).lerp(mid, ss(0.3, 0.36, u)), at = a.lerp(r.clone().add(offR), ss(0.62, 0.68, u));
    s.position.copy(at); s.rotation.x = -0.95 * ss(0.14, 0.3, u) * (1 - ss(0.62, 0.8, u));
  });
  const actB = t => {
    put(rud, D, 0, ySeat, DZ, 0);
    const { p, c, u } = sortPose(t); K.act(rud, p, t, { smile: 0.35 }); placeSheets(c, u);
    return U.film(t) + U.counter(t, tCien - 0.25, tC + 0.3, 1180, 150, 130900000, 'mexicanos · un plan para cada uno', { dur: 1.8 }) + U.source(t, tCien, tC + 0.3, 'INEGI, Encuesta Intercensal 2025');
  };

  // ================================================================ C: the balcony — the motto over the Zócalo
  const Z2 = S.zocalo('morning');
  const BAL = [0, 5.15, -22.2];
  const ban = banner(['UN MUNDO DONDE TODAS', 'PUEDAN VIVIR FELICES']); ban.position.set(0, 4.85, -21.4); Z2.add(ban);
  const fans = K.crowd(Z2, ['civil', 'civilCap'], 34, [-8.5, -18.4, 8.5, -9.5], { seed: 3, face: [0, -22.5] });
  const mass = P.massCrowd(700, [-24, -9, 24, 14], { seed: 4, face: [0, -22.5] }); Z2.add(mass);
  const mass2 = P.massCrowd(160, [-18, -19, -9.2, -9], { seed: 5, face: [0, -22.5] }), mass3 = P.massCrowd(160, [9.2, -19, 18, -9], { seed: 6, face: [0, -22.5] }); Z2.add(mass2, mass3);
  const flags = fans.map((r, i) => i % 3 === 0 ? (() => { const f = miniFlag(); Z2.add(f); return f; })() : null);
  const fanPose = (r, i, t) => { const sd = i * 1.7; switch (i % 4) { case 0: return A.wave(t, sd, 'R'); case 1: return A.cheer(t, sd); case 2: return A.clap(t, sd, 2.6); default: return A.wave(t, sd, 'both'); } };
  const actC = t => {
    put(rud, Z2, BAL[0], BAL[1], BAL[2], 0);
    K.act(rud, M.seq(t, [[0, x => A.wave(x, 1, 'R')], [tLema - 0.3, x => A.handOnHeart(x, 1, 1)]], 0.6), t, { smile: 0.7, mouth: t < tLema ? [0.25, 0.9] : undefined });
    ban.set(ss(tMun - 0.5, tFel - 0.3, t)); [mass, mass2, mass3].forEach(m => m.update(t));
    fans.forEach((r, i) => { K.act(r, fanPose(r, i, t), t, { mouth: i % 4 === 1 ? 'open' : 'smile', eye: i % 5 === 0 ? 'happy' : undefined });
      const f = flags[i]; if (f) { f.position.copy(wrist(r, 'R')).add(V().set(0, 0.015, 0)); f.rotation.set(0, r.root.rotation.y, 0.35 * Math.cos(t * 8 + i * 1.7)); } });
    return U.film(t) + U.popCard(t, tLema - 0.2, tD + 0.3, 'LEMA DE GOBIERNO', 'Un mundo donde todas puedan vivir felices', '', { x: 1440, y: 130, w: 640, accent: '#0f6b3f' });
  };

  // ================================================================ D: 6:00 a.m. cabinet meeting — the ministers are not awake yet
  const C = S.council('dawn');
  C.clock.position.set(5.93, 2.55, -0.6); C.clock.rotation.y = -Math.PI / 2;
  const mins = C.chairs.map((ch, i) => { const r = K.person(C, ['cafe', 'oguri', 'helios', 'daiwa', 'spe', 'hishi', 'suzuka', 'doto'][i], i % 3 ? 'diputado' : 'aide', ch.position.x, ch.position.z, ch.rotation.y); K.seatOn(r, ch.seatY); return r; });
  const cup = mug(); C.add(cup);
  // chairs alternate near (+z, odd) / far (-z, even) side; the far side faces the camera: two yawn, one dozes, one drinks coffee
  const ROLE = { 0: 'yawn', 2: 'doze', 4: 'coffee', 6: 'yawn', 3: 'doze' };
  const minPose = (i, t) => { const sd = i * 2.1;
    if (ROLE[i] === 'yawn') return A.seated(A.yawn, t, sd, 0.55 + 0.45 * Math.sin(t * 1.7 + i));
    if (ROLE[i] === 'doze') { const p = A.sit(t, sd); p.head = [24 + 6 * Math.sin(t * 1.1 + i), 0, 10]; p.chest = [10, 0, 0]; return p; }
    if (ROLE[i] === 'coffee') { const p = A.sit(t, sd); p.aR = ['head', -0.1, -0.55, 1.25]; p.plR = [-0.6, -1, 0]; p.hR = HAND.grip; return p; }
    return A.sit(t, sd); };
  const actD = t => {
    put(rud, C, 3.08, ySeat, -0.6, -Math.PI / 2);
    C.clock.set(6, 0, (t - tD) % 60);
    K.act(rud, { ...A.sitTalk(t, 1, 0.75), look: [-1, 0.9, -0.6], lookW: 0.5 }, t, { talk: true, smile: 0.6 });
    mins.forEach((r, i) => K.act(r, ROLE[i] === 'doze' ? minPose(i, t) : { ...minPose(i, t), look: [3.08, 1.0, -0.6], lookW: 0.75 }, t, { eye: ROLE[i] === 'doze' ? 'blink' : ROLE[i] === 'yawn' ? 'squint' : 'flat', mouth: ROLE[i] === 'yawn' ? 'open' : 'wavy' }));
    cup.position.copy(wrist(mins[4], 'R')).add(V().set(0, 0.03, 0));
    return U.film(t) + U.digital(t, tD + 0.1, tE + 0.2, '6:00', { sub: 'A.M. · JUNTA DE GABINETE', col: '#ffb43a' });
  };

  // ================================================================ E: the stamp comes down with perfect precision
  const stampP = P.stamp(); D.add(stampP);
  D.sheet.updateMatrixWorld(true);
  const PAD = D.pad.position, SEAL = D.sheet.localToWorld(V().set(0.05, 0, 0.09)).toArray(); SEAL[1] = top;
  const SOFF = [0, 0.122, -0.04];   // wrist above and behind the stamp's origin (the fist closes round the knob)
  const SK = (() => { const up = (p, h) => [p[0], p[1] + h, p[2]], pad = [PAD.x, top + 0.028, PAD.z], seal = [SEAL[0], top + 0.009, SEAL[2]];
    return [[tE, up(pad, 0.14)], [tE + 0.25, pad], [tE + 0.35, pad], [tE + 0.6, up(pad, 0.16)], [tSel - 0.38, up(seal, 0.14)], [tSel, seal], [tSel + 0.25, seal], [tSel + 0.55, up(seal, 0.16)], [tF, up(seal, 0.18)]]; })();
  const actE = t => {
    put(rud, D, 0, ySeat, DZ, 0); placeSheets(NM, 1);
    const sp = path(t, SK), p = lean(A.sit(t, 1), 1);
    p.aR = W(sp.map((v, i) => v + SOFF[i])); p.plR = [-1, -0.5, -0.3]; p.hR = HAND.grip;
    p.aL = W([0.17, top + 0.04, -1.42]); p.plL = [1, -0.7, -0.4]; p.hL = HAND.flat; p.look = SEAL; p.lookW = 0.9;
    K.act(rud, p, t, { smile: 0.45 });
    const w = wrist(rud, 'R'); stampP.position.set(w.x - SOFF[0], w.y - SOFF[1], w.z - SOFF[2]); stampP.rotation.set(0, 0, 0);
    D.sheet.sealed(ss(tSel - 0.02, tSel + 0.04, t));
    return U.film(t) + U.popCard(t, tPerf - 0.15, tF + 0.3, 'PRECISIÓN', 'Error: 0.0 mm', '', { x: 1500, y: 150, w: 460, accent: '#c3262f', icon: '✓' });
  };

  // ================================================================ F: the morning press conference — a bad joke, and her ears give it away
  const Mn = S.mananera();
  const press = [];
  for (let row = 0; row < 3; row++) for (let i = 0; i < 6; i++) { if ((row * 6 + i) % 4 === 3) continue;
    const r = K.person(Mn, ['oguri', 'cafe', 'helios', 'spe', 'hishi', 'daiwa', 'suzuka', 'tamamo', 'mcqueen', 'doto'][(row * 6 + i) % 10], 'reporter', -3.2 + i * 1.28, 1.5 + row * 1.4, Math.PI, { shadow: false });
    K.seatOn(r, 0.24); r.cam = (row * 6 + i) % 3 === 0; press.push(r); }
  const phones = press.map(r => { if (!r.cam) return null; const ph = P.smartphone('#9ad0ff'); ph.userData.dynamic = true; Mn.add(ph); return ph; });
  const pressPose = (r, i, t) => { const p = A.sit(t, i * 1.3); if (r.cam) { p.aR = ['head', 0.15, 0.1, 2.3]; p.plR = [-0.8, -1, 0]; p.hR = HAND.grip; } p.head = [p.head[0] + 3, p.head[1] * 0.4, p.head[2]]; return p; };
  const HEAD = [0, 1.55, -2.85];   // her head on the 0.25 riser
  const actF = t => {
    put(rud, Mn, 0, 0.25, -2.85, 0);
    const telling = t < tF2 - 0.2;
    const p = telling ? A.orate(t, 1, 0.8) : A.talk(t, 1, 0.5);
    p.ears = [earTwitch(t, tOc), earTwitch(t, tMuev), earTwitch(t, tMuev + 0.45)].reduce((a, b) => [a[0] + b[0], a[1] + b[1]], [0, 0]);
    K.act(rud, p, t, { talk: t < tF2 + 0.3 || (t > tOc + 0.4 && t < tMuev - 0.2) ? 0.8 : false, smile: t > tF + 2.4 ? 0.85 : 0.5 });
    press.forEach((r, i) => { K.act(r, pressPose(r, i, t), t, { eye: t > tF + 2.4 ? 'flat' : undefined, mouth: t > tF + 2.4 ? 'wavy' : 'neutral' });
      const ph = phones[i]; if (ph) { ph.position.copy(wrist(r, 'R')).add(V().set(0, 0.04, -0.03)); ph.rotation.set(0, Math.PI, 0); } });
    const q = fade(t, tF + 0.15, tF + 2.3, 0.25), a = fade(t, tF + 2.2, tF2 + 0.05, 0.25);
    const bulb = fade(t, tOc - 0.05, tOc + 1.1, 0.15), [bx, by, ok] = ctx.project([0.3, HEAD[1] + 0.1, HEAD[2]]);
    return U.film(t) + U.bubble(ctx, [0, HEAD[1] + 0.4, HEAD[2]], '¿Qué le dice una iguana<br>a su hermana gemela?', q, { w: 560, size: 30 })
      + U.bubble(ctx, [0, HEAD[1] + 0.4, HEAD[2]], '¡Somos iguanitas! 😄', a, { size: 36 })
      + (bulb > 0 && ok ? `<div style="position:absolute;left:${bx}px;top:${by}px;transform:translate(-50%,-100%) scale(${0.6 + 0.4 * bulb});opacity:${bulb};font:96px 'Noto Color Emoji'">💡</div>` : '');
  };

  // ================================================================ G: the Chamber — nobody laughs, nobody is late
  const Cm = S.camara();
  const late = Cm.seats.find(s => s.row === 0 && s.a > 0.7);   // the empty seat at the right end of the front row
  const deps = Cm.seats.filter(s => s !== late && (s.row < 3 || s.a * 10 % 2 < 1.2)).map((st, i) => {
    const r = K.person(Cm, ['oguri', 'cafe', 'helios', 'spe', 'hishi', 'daiwa', 'suzuka', 'tamamo', 'mcqueen', 'doto'][i % 10], 'diputado', st.x, st.z, st.yaw, { shadow: false });
    r.root.position.y = 0; K.seatOn(r, st.seat); r.st = st; return r; });
  const runner = K.person(Cm, 'daiwa', 'diputado', Cm.door[0], Cm.door[1], -Math.PI / 2, { shadow: false });
  K.seatOn(runner, late.seat); const yLate = runner.root.position.y;
  const RUN = [Cm.door, [5.4, -1.6], [4.17, -0.83], [late.x, late.z]];
  const runLen = RUN.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - RUN[i][0], p[1] - RUN[i][1]), 0);
  const tRun = tG2 + 0.1;
  const actRunner = t => {
    const tr = M.travel(t, tRun, runLen, 3.3, 0.35), arrive = tr.T, k = ss(arrive - 0.05, arrive + 0.4, t);
    K.onPath(runner, RUN, tr.D); runner.root.visible = t >= tRun;   // behind the door until she bursts in
    const yaw = runner.root.rotation.y; runner.root.rotation.y = yaw + (((late.yaw - yaw + 3 * Math.PI) % (2 * Math.PI)) - Math.PI) * ss(arrive - 0.15, arrive + 0.3, t);
    runner.root.position.y = yLate * k + 0.05 * Math.sin(Math.PI * k);
    const g = M.gait(tr.D, { amp: tr.amp, run: 1, seed: 3 });
    K.act(runner, M.mix(M.mix(A.stand(t, 3), g, clamp(tr.amp * 1.6)), A.sit(t, 3), k), t, { eye: t < arrive ? 'shock' : 'happy', mouth: t < arrive ? 'tri' : 'smile' });
    return arrive;
  };
  const SPK = Cm.speaker;
  const tG3 = tTar + 0.55;
  const actG = (t, mode) => {
    put(rud, Cm, SPK[0], SPK[1], SPK[2], 0);
    const arrive = actRunner(t), rp = runner.root.position;
    let p;
    if (mode === 'joke') p = A.talk(t, 1, 0.6);
    else { p = A.stand(t, 1); p.look = [rp.x, 1.0, rp.z]; p.lookW = 0.6 * ss(tRun + 0.3, tRun + 0.8, t) * (1 - ss(arrive + 0.4, arrive + 1.0, t));
      const nod = ss(arrive + 0.5, arrive + 0.8, t) * (1 - ss(arrive + 1.0, arrive + 1.4, t)); p.head = [p.head[0] + 14 * nod, p.head[1], p.head[2]]; }
    K.act(rud, p, t, { talk: mode === 'joke' && t < tRei - 0.3, smile: mode === 'joke' ? 0.8 : 0.4 + 0.4 * ss(arrive + 0.4, arrive + 0.9, t) });
    deps.forEach((r, i) => { const q = A.sit(t, i * 1.1); if (mode !== 'joke' && t > tRun) { q.look = [rp.x, rp.y + 0.6, rp.z]; q.lookW = 0.7 * ss(tRun + 0.2 + (i % 5) * 0.06, tRun + 0.6, t); }
      K.act(r, q, t, { eye: mode === 'joke' ? 'flat' : t > tRun ? 'open' : 'flat', mouth: mode === 'joke' ? 'neutral' : 'small' }); });
    return arrive;
  };
  const clockAt = (t, arrive) => { const done = t > arrive + 0.35, left = Math.max(0, arrive + 0.35 - t);
    Cm.clock.set(done ? 6 : 5, done ? 0 : 59, done ? 0 : 60 - left);
    return { done, text: done ? '6:00:00' : `5:59:${String(Math.min(59, 60 - Math.ceil(left))).padStart(2, '0')}` }; };
  const actG1 = t => { const arrive = actG(t, 'joke'); clockAt(t, arrive);
    const q = fade(t, tG + 0.05, tG2 + 0.1, 0.25), cri = fade(t, tRei + 0.1, tG2 + 0.1, 0.3);
    return U.film(t) + U.bubble(ctx, [SPK[0] - 0.55, SPK[1] + 1.05, SPK[2] + 1.6], '¿Qué le dijo un techo a otro?<br>¡Techo de menos! 😄', q, { w: 520, size: 30 })
      + (cri > 0 ? `<div style="position:absolute;left:0;right:0;top:830px;text-align:center;opacity:${cri};font:italic 800 46px Inter;color:#f2ede2;text-shadow:0 3px 12px #000">cri… cri…</div>` : '');
  };
  // G2: the camera follows the latecomer from the door to her seat
  const DOORP = [Cm.door[0] + 0.3, 0.7, Cm.door[1]], SEATP = [late.x, 0.55, late.z];
  const actG2 = t => { const arrive = actG(t, 'late'), c = clockAt(t, arrive);
    const k = ss(tRun - 0.1, arrive + 0.1, t), L = lerp3(DOORP, SEATP, k); ctx.camera.lookAt(L[0], L[1], L[2]);
    return U.film(t) + U.digital(t, tG2 + 0.1, ctx.dur + 1, c.text, { x: 1600, y: 120, sub: c.done ? 'A TIEMPO' : 'SESIÓN', col: c.done ? '#7dff9a' : '#ff4a3a' });
  };
  const actG3 = t => { const arrive = actG(t, 'nod'), c = clockAt(t, arrive);
    return U.film(t) + U.digital(t, tG2 + 0.1, ctx.dur + 1, c.text, { x: 1600, y: 120, sub: c.done ? 'A TIEMPO' : 'SESIÓN', col: c.done ? '#7dff9a' : '#ff4a3a' });
  };

  const sfx = [
    { t: 0, type: 'birds', dur: tB, vol: 0.2 }, { t: 0.2, type: 'steps', dur: 4.6, vol: 0.25 }, { t: tP, type: 'bell', vol: 0.5 },
    { t: tB, type: 'clock', dur: tC - tB, vol: 0.12 }, ...[0, 1].map(i => ({ t: tB + i * period + 0.3, type: 'paper', vol: 0.35 })),
    { t: tC, type: 'crowd', dur: tD - tC, vol: 0.45 }, { t: tC + 0.2, type: 'cheer', vol: 0.4 }, { t: tMun - 0.4, type: 'swoosh', vol: 0.3 },
    { t: tD, type: 'clock', dur: tE - tD, vol: 0.25 }, { t: tE + 0.3, type: 'thud', vol: 0.2 }, { t: tSel, type: 'stamp', vol: 0.6 }, { t: tPerf, type: 'sting', vol: 0.25 },
    { t: tF, type: 'camera', dur: tF2 - tF, vol: 0.2 }, { t: tOc, type: 'pop', vol: 0.4 }, { t: tMuev, type: 'pop', vol: 0.3 },
    { t: tRei, type: 'night', dur: tG2 - tRei + 0.3, vol: 0.45 }, { t: tG2 + 0.1, type: 'door', vol: 0.5 }, { t: tG2 + 0.2, type: 'steps', dur: 2.4, vol: 0.4 }, { t: tTar + 0.4, type: 'bell', vol: 0.3 },
  ];

  const shots = [
    { t0: 0, set: Z1, p0: [0.55, 1.28, -17.5], l0: [0, 1.15, -15.0], p1: [0.45, 1.3, -19.1], l1: [0, 1.15, -17.1], fov0: 40, ease: 'lin', act: actA },
    { t0: tA2, set: Z1, p0: [2.6, 1.15, -12.6], l0: [0, 2.6, -22], p1: [2.0, 1.2, -13.8], l1: [0, 2.8, -22], fov0: 46, act: actA },
    { t0: tB, set: D, p0: [0.62, 0.96, -0.68], l0: [0, 0.84, -1.55], p1: [0.5, 0.94, -0.8], l1: [0, 0.83, -1.55], fov0: 40, act: actB },
    { t0: tC, set: Z2, p0: [1.7, 1.4, -11.2], l0: [0, 5.55, -22.2], p1: [1.2, 1.5, -12.3], l1: [0, 5.6, -22.2], fov0: 27, act: actC },
    { t0: tC2, set: Z2, p0: [-1.15, 7.3, -23.25], l0: [0.8, 0.4, -12], p1: [-1.4, 7.5, -23.3], l1: [0.8, 0.6, -11], fov0: 52, act: actC },
    { t0: tD, set: C, p0: [4.35, 1.62, 0.1], l0: [-1.2, 0.72, -0.6], p1: [4.15, 1.6, 0.0], l1: [-1.2, 0.72, -0.62], fov0: 46, act: actD },
    { t0: tE, set: D, p0: [-0.62, 0.95, -0.85], l0: [0, 0.64, -1.32], p1: [-0.45, 0.88, -0.98], l1: [0.03, 0.62, -1.28], fov0: 34, fov1: 30, act: actE },
    { t0: tF, set: Mn, p0: [1.25, 1.45, 2.25], l0: [0, 1.42, -2.85], p1: [0.95, 1.45, 1.8], l1: [0, 1.45, -2.85], fov0: 34, act: actF },
    { t0: tF2, set: Mn, p0: [0.62, 1.62, -1.75], l0: [0, 1.5, -2.85], p1: [0.5, 1.58, -1.95], l1: [0, 1.52, -2.85], fov0: 28, act: actF },
    { t0: tG, set: Cm, p0: [0.9, 2.15, -7.3], l0: [0, 0.6, 1.0], p1: [0.7, 2.1, -7.1], l1: [0, 0.6, 1.2], fov0: 46, act: actG1 },
    { t0: tG2, set: Cm, p0: [-0.6, 1.35, -4.5], l0: [8, 0.7, -3], p1: [-0.3, 1.35, -4.3], l1: [4, 0.6, -0.5], fov0: 32, act: actG2 },
    { t0: tG3, set: Cm, p0: [0.7, 1.98, -4.85], l0: [0, 1.62, -6.25], p1: [0.6, 1.95, -5.0], l1: [0, 1.62, -6.25], fov0: 30, act: actG3 },
  ];
  const inst = { scene: Z1, scenes: [Z1, D, Z2, C, Mn, Cm], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
