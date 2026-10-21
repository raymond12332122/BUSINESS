import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as M from '../../lib/motion.js';
import { run, wt, walkIn } from '../shots.js';
const { ss, clamp, HAND } = M;
const fade = U.fade;
const V = () => new THREE.Vector3();

const put = (r, set, x, y, z, yaw) => { if (r.root.parent !== set) set.add(r.root); r.root.position.set(x, y, z); r.root.rotation.y = yaw; r.root.visible = true; return r; };
const wrist = (r, s) => { r.root.updateMatrixWorld(true); return r.j['wri' + s].bone.getWorldPosition(V()); };
const lerp3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const path = (u, keys) => { let i = 0; while (i + 1 < keys.length && u >= keys[i + 1][0]) i++; if (i + 1 >= keys.length) return keys[i][1]; const [u0, p0] = keys[i], [u1, p1] = keys[i + 1]; return lerp3(p0, p1, ss(u0, u1, u)); };
const W = p => ['world', ...p];
const angTo = (a, b, k) => a + ((((b - a) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI) * k;

// "PROHIBIDO EL PASO" sign on a post (origin at the foot of the post).
function noEntry() {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.25, 8), P.std('#5a5a5e', { metalness: 0.4 })); post.position.y = 0.62; g.add(post);
  const tex = K.canvasTex(256, 160, (x, w, h) => { x.fillStyle = '#f4f2ec'; x.fillRect(0, 0, w, h); x.strokeStyle = '#c0201c'; x.lineWidth = 12; x.strokeRect(6, 6, w - 12, h - 12);
    x.fillStyle = '#c0201c'; x.font = '900 36px Inter'; x.textAlign = 'center'; x.fillText('PROHIBIDO', w / 2, 70); x.fillText('EL PASO', w / 2, 116); });
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.39, 0.02), [P.std('#ddd'), P.std('#ddd'), P.std('#ddd'), P.std('#ddd'), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }), P.std('#ddd')]);
  board.position.y = 1.1; g.add(board); g.userData.dynamic = true; return g;
}

export function build(ctx) {
  const L = ctx.L;
  const tWas = wt(L[0], 'washington'), tAvi = wt(L[0], 'avion'), tSi = wt(L[0], 'si$'), tLic = wt(L[0], 'licencia');
  const tA2 = tWas + 0.05, tA3 = tAvi + 0.5, tB = L[1].t0 - 0.3;
  const tDir = wt(L[1], 'directa'), tRod = wt(L[1], 'rodeos'), tAdu = wt(L[1], 'aduladores'), tOdia = wt(L[1], 'odia'), tMen = wt(L[1], 'mentiras'), tPla = wt(L[1], 'platicas'), tChi = wt(L[1], 'chistes');
  const tB2 = tOdia - 0.2, tC = L[2].t0 - 0.25, tFue = wt(L[2], 'fuera'), tMira = wt(L[2], 'mira'), tAun = wt(L[2], 'aunque'), tRom = wt(L[2], 'romper'), tReg = wt(L[2], 'regla');
  const tC2 = tAun - 0.15, tD = L[3].t0 - 0.2, tBil = wt(L[3], 'billar'), tEnt = wt(L[3], 'entrenaria'), tPer = wt(L[3], 'perros'), tSer = wt(L[3], 'servicio'), tSec = wt(L[3], 'secreto');
  const tD2 = tEnt + 0.1;

  // ================================================================ A: she lands her own jet at Andrews
  const AF = S.airfield('morning'), jet = AF.jet;
  const sir = K.leader(AF, 'sirius', -2.15, 21.2, -Math.PI / 2); K.aviators(sir);
  const tTD = 3.4, v0 = 34.5, zTD = -20, stopT = 2.2;
  const jetAt = t => { if (t < tTD) { const z = zTD - v0 * (tTD - t); return { z, y: (zTD - z) * 0.0875, pitch: 0.07 + 0.05 * ss(tTD - 1.2, tTD - 0.2, t) }; }
    const tau = Math.min(t - tTD, stopT), a = v0 / stopT; return { z: zTD + v0 * tau - 0.5 * a * tau * tau, y: 0, pitch: 0.12 * (1 - ss(tTD, tTD + 0.9, t)) }; };
  const placeJet = t => { const j = jetAt(t); jet.position.set(0, j.y, j.z); jet.rotation.set(-j.pitch, 0, 0); return j; };
  const crew = [['oguri', -6.5, 12.5, 0.6], ['helios', 5.5, 12.0, -0.6]].map(([k, x, z, y]) => K.person(AF, k, 'aide', x, z, y, { shadow: false }));
  const aides = [['cafe', -5.6, 19.7, 0.35], ['daiwa', -6.9, 19.4, 0.1], ['hishi', -8.2, 19.8, 0.45]].map(([k, x, z, y], i) => ({ r: K.person(AF, k, 'aide', x, z, y, { shadow: false }), x, z, y, i }));
  const actA = (t, mode) => {
    const j = placeJet(t); sir.shades.visible = true;
    put(sir, AF, -2.15, 0, 21.2, -Math.PI / 2);
    if (mode === 'land') sir.root.visible = false;
    else {
      K.act(sir, walkIn(sir, t, tA3 - 0.35, [-2.15, 21.2], -Math.PI / 2, 1.5, { speed: 0.25, seed: 2, after: tt => M.seq(tt, [[0, x => A.stand(x, 2)], [tSi + 0.35, x => A.salute(x, 2, ss(tSi + 0.35, tSi + 0.7, x) * (1 - ss(tLic + 0.9, tLic + 1.3, x)))]], 0.45) }), t, { smile: t > tSi ? 0.6 : 0.3 }); }
    crew.forEach((r, i) => K.act(r, A.salute(t, i + 5, ss(tA3 - 0.4, tA3, t)), t));
    aides.forEach(a => K.act(a.r, A.stand(t, a.i + 7), t));
    if (mode === 'land') ctx.camera.lookAt(0, j.y + 1.5, j.z + 2);
    return U.film(t) + (mode === 'stairs' ? U.popCard(t, tLic - 0.2, tB + 0.3, 'LICENCIA DE PILOTO', 'Sirius Symboli', 'Capitana de su propio avión', { x: 1480, y: 140, w: 560, accent: '#2a4a8a', icon: '✈' }) : '');
  };

  // ================================================================ B1: on the tarmac she walks straight past the flatterers
  const LINES = ['¡Bienvenida, Excelentísima<br>Señora Presidenta!', '¡Qué aterrizaje<br>tan elegante!', '¿Le traigo una<br>alfombra roja?'];
  const actB1 = t => {
    placeJet(t); sir.shades.visible = true;
    put(sir, AF, -3.65, 0, 21.2, -Math.PI / 2);
    K.act(sir, walkIn(sir, t, tB - 0.1, [-3.65, 21.2], -Math.PI / 2, 5.0, { speed: 0.27, seed: 2 }), t, { smile: 0.1 });
    const sp = sir.root.position; let html = '';
    aides.forEach(a => { const t0 = tB + 0.3 + a.i * 1.3, near = ss(t0 - 0.2, t0 + 0.3, t), passed = sp.x < a.x + 0.3;
      const p = M.mix(A.stand(t, a.i + 7), A.bow(t, a.i + 7, 0.5), near * (passed ? 0.3 : 1)); p.look = [sp.x, 1.3, sp.z]; p.lookW = 0.8;
      K.act(a.r, p, t, { talk: t > t0 && t < t0 + 1.7, smile: 0.9 });
      html += U.bubble(ctx, [a.x, 1.25, a.z], LINES[a.i], fade(t, t0, t0 + 1.9, 0.2), { size: 26 }); });
    html += U.bubble(ctx, [sp.x, 1.75, sp.z], 'No.', fade(t, tB2 - 0.95, tB2 + 0.1, 0.15), { size: 34 });
    return U.film(t) + html + U.noList(t, tDir - 0.3, tB2 + 0.2, 'DIRECTA. SIN…', [['rodeos', tRod], ['aduladores', tAdu]]);
  };

  // ================================================================ B2 + C + D2: the North Lawn of the White House
  const WH = S.whiteHouse('day');
  const joker = K.person(WH, 'spe', 'aide', 1.25, -6.0, -2.02, { shadow: false });
  const actB2 = t => {
    sir.shades.visible = false; put(sir, WH, 0, 0, -6.6, 0); joker.root.visible = true;
    const glare = ss(tChi - 0.1, tChi + 0.25, t);
    K.act(sir, { ...A.crossArms(t, 2), look: [1.25, 1.0, -6.0], lookW: 0.35 + 0.4 * glare }, t, { eye: 0.42 * glare, mouth: [0, -0.4 * glare], smile: 0 });
    const telling = t > tChi - 1.6 && t < tChi;
    K.act(joker, M.mix(A.talk(t, 3, 0.8), A.stand(t, 3, { amt: 0.2 }), glare), t, { talk: telling, eye: glare > 0.5 ? 'shock' : undefined, mouth: glare > 0.5 ? 'wavy' : 'smile' });
    const [x, y, ok] = ctx.project([0.25, 1.62, -6.6]), ang = fade(t, tChi + 0.1, tC + 0.2, 0.15);
    return U.film(t) + U.bubble(ctx, [1.25, 1.2, -6.0], '¿Sabe qué le dijo un<br>semáforo a otro? ¡No me…', fade(t, tChi - 1.6, tChi + 0.15, 0.2), { size: 26 })
      + (ang > 0 && ok ? `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-100%) scale(${0.7 + 0.3 * ang});opacity:${ang};font:84px 'Noto Color Emoji'">💢</div>` : '')
      + U.noList(t, tOdia - 0.1, tC + 0.2, 'ODIA', [['Mentiras', tMen], ['Pláticas inútiles', tPla], ['Chistes malos', tChi]]);
  };

  // C1: she opens the gate to the people left outside
  const gate = WH.gate, people = [];
  for (let i = 0; i < 7; i++) { const x = -1.3 + (i % 4) * 0.85 + (i > 3 ? 0.42 : 0), z = 5.7 + (i > 3 ? 1.1 : 0) + (i % 2) * 0.25;
    people.push({ r: K.person(WH, ['oguri', 'cafe', 'helios', 'daiwa', 'hishi', 'tamamo', 'doto'][i], i % 3 ? 'civil' : 'civilCap', x, z, Math.PI, { shadow: false }), x, z, i }); }
  const tPush = tC + 2.6, tOpen = tPush + 0.75;
  const gateK = t => ss(tPush, tOpen, t);
  const leafPt = (sx, k) => { const ang = -sx * k * 1.7, px = sx * 1.5, lx = -sx * 1.2; return [px + lx * Math.cos(ang), 1.0, 4 - lx * Math.sin(ang)]; };   // a bar near the leaf's free end
  const SIGN0 = [-2.0, 0, 2.95], sign = noEntry(); sign.position.set(...SIGN0); sign.rotation.y = 0.5; WH.add(sign);
  const peopleAct = t => people.forEach(p => { const t0 = tOpen + 0.2 + p.i * 0.22;
    K.act(p.r, walkIn(p.r, t, t0, [p.x, p.z], Math.PI, 5.2, { speed: 0.9, seed: p.i, after: tt => A.wave(tt, p.i, 'R') }), t, { smile: 0.9, eye: t > t0 ? 'happy' : undefined }); });
  const SPOT = [-1.35, 2.55];   // where she stands aside once the gate is open
  const actC1 = t => {
    sir.shades.visible = false; gate.open(gateK(t));
    put(sir, WH, 0, 0, 1.4, 0);
    let p;
    if (t < tPush + 0.75) {
      p = walkIn(sir, t, tC + 0.1, [0, 1.4], 0, 1.75, { speed: 0.27, seed: 2, after: tt => A.stand(tt, 2) });
      const k = ss(tPush - 0.35, tPush, t) * (1 - ss(tOpen - 0.05, tOpen + 0.3, t)), gk = gateK(t);
      if (k > 0) { p.aL = W(leafPt(-1, gk)); p.aR = W(leafPt(1, gk)); p.aWL = p.aWR = k; p.hL = p.hR = HAND.flat; }
    } else {
      const yaw = Math.atan2(SPOT[0], SPOT[1] - 3.15);
      p = walkIn(sir, t, tOpen + 0.05, [0, 3.15], yaw, Math.hypot(SPOT[0], SPOT[1] - 3.15), { speed: 0.22, seed: 2, after: tt => A.wave(tt, 2, 'L') });
      const tr = M.travel(t, tOpen + 0.05, Math.hypot(SPOT[0], SPOT[1] - 3.15) / sir.unit, 0.22, 0.7);
      sir.root.rotation.y = angTo(yaw, 0.35, ss(tr.T - 0.3, tr.T + 0.35, t));
    }
    K.act(sir, p, t, { smile: 0.55 });
    peopleAct(t);
    return U.film(t);
  };
  // C2: ...and pulls the "no entry" sign out of the lawn and throws it away
  const tGrab = tRom - 0.45, tPull = tRom + 0.3, tRel = tReg - 0.35, tLand = tRel + 0.75;
  const signPost = (lift, k = 0) => [SIGN0[0], SIGN0[1] + lift + 0.75 + k * 0.25, SIGN0[2]];
  const REL = [SPOT[0] + 0.3, 1.85 - 1.0, SPOT[1] - 0.45];   // where the sign leaves her hand (end of the swing, minus the hand-to-foot offset)
  const actC2 = t => {
    sir.shades.visible = false; gate.open(1);
    put(sir, WH, SPOT[0], 0, SPOT[1], 0); sir.root.rotation.y = angTo(0.35, Math.atan2(SIGN0[0] - SPOT[0], SIGN0[2] - SPOT[1]), ss(tC2, tC2 + 0.5, t));
    const lift = 0.45 * ss(tGrab + 0.25, tPull, t);
    const p = A.stand(t, 2, { amt: 0.5 });
    p.hipY = (p.hipY || 0) - 0.03 * ss(tGrab, tGrab + 0.25, t) * (1 - ss(tPull - 0.1, tPull + 0.2, t));
    const hold = ss(tGrab - 0.15, tGrab + 0.15, t) * (1 - ss(tRel - 0.05, tRel + 0.25, t));
    if (t < tPull + 0.15) { p.aL = W(signPost(lift, 0)); p.aR = W(signPost(lift, 1)); }
    else { const u = ss(tPull + 0.15, tRel, t), sw = path(u, [[0, signPost(0.45, 1)], [0.5, [SPOT[0] + 0.15, 1.75, SPOT[1] - 0.05]], [1, [SPOT[0] + 0.3, 1.85, SPOT[1] - 0.45]]]);
      p.aR = W(sw); p.aL = W(signPost(0.45, 0)); p.aWL = 1 - ss(tPull + 0.1, tPull + 0.4, t); }
    p.aWR = hold; if (p.aWL === undefined) p.aWL = hold; p.hL = p.hR = HAND.grip; p.plL = [1, -0.8, -0.2]; p.plR = [-1, -0.6, -0.3];
    p.look = t < tRel ? [SIGN0[0], 1.0 + lift, SIGN0[2]] : [-1.0, 0.3, -1.6]; p.lookW = 0.6;
    K.act(sir, p, t, { smile: t > tPull ? 0.75 : 0.3, mouth: t > tRel && t < tRel + 0.6 ? [0.5, 0.8] : undefined });
    // the sign: in the lawn, then in her hand, then flying over her shoulder
    if (t < tPull + 0.15) { sign.position.set(SIGN0[0], lift, SIGN0[2]); sign.rotation.set(0, 0.5, 0); }
    else if (t < tRel) { const w = wrist(sir, 'R'); sign.position.set(w.x, w.y - 1.0, w.z); sign.rotation.set(-1.2 * ss(tPull + 0.15, tRel, t), 0.5, 0); }
    else { const k = (Math.min(t, tLand) - tRel) / (tLand - tRel), from = REL, to = [0.2, -0.25, 1.6];
      sign.position.set(from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k + 2.2 * k * (1 - k), from[2] + (to[2] - from[2]) * k);
      sign.rotation.set(-1.2 - (2 * Math.PI - 0.8) * k, 0.5, 0); }   // one full turn, then it sticks in the lawn at a tilt
    peopleAct(t);
    return U.film(t) + U.popCard(t, tReg - 0.1, tD + 0.3, 'REGLA ROTA', '«Prohibido el paso»', 'La primera de muchas', { x: 1480, y: 140, w: 520, accent: '#c0201c', icon: '✕' });
  };

  // ================================================================ D1: a pool table in the Oval Office
  const OV = S.ovalOffice(), pool = OV.pool;
  const tStr = tBil - 0.3, cueP = P.cue(); OV.add(cueP);
  const PT = new THREE.Matrix4();
  const toW = (x, y, z) => V().set(x, y, z).applyMatrix4(PT);
  const balls = pool.rest.map(([x, z]) => [x, z]); balls[0] = [0.75, 0];   // cue ball close to her end so her short arms reach the bridge
  const Rb = 0.028, HX = pool.W / 2 - Rb, HZ = pool.D / 2 - Rb;
  const fold = (v, h) => { const w = 4 * h, m = ((v + h) % w + w) % w; return m < 2 * h ? m - h : 3 * h - m; };   // reflect off the cushions
  const rr = (i, k) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
  const tHit = tStr + 0.32;   // cue ball reaches the rack
  const ballPos = (i, t) => {
    const [x0, z0] = balls[i];
    if (i === 0) { if (t < tStr) return [x0, z0]; const tau = Math.min(t, tHit) - tStr, d = (x0 - (balls[1][0] + 0.056)) * tau / (tHit - tStr);
      if (t < tHit) return [x0 - d, z0]; const s2 = 0.18 * (1 - Math.exp(-2.5 * (t - tHit))); return [fold(x0 - d - s2, HX), fold(0.04 * s2, HZ)]; }
    if (t < tHit) return [x0, z0];
    const a = Math.atan2(z0 + (rr(i, 1) - 0.5) * 0.05, x0 - balls[1][0] - 0.05) + (rr(i, 2) - 0.5) * 0.6, v = 1.1 + rr(i, 3) * 1.6 + (i === 1 ? 0.8 : 0), kf = 1.6;
    const s = v / kf * (1 - Math.exp(-kf * (t - tHit))), dx = Math.cos(a) * s * (i === 1 ? -1 : 1), dz = Math.sin(a) * s;
    return [fold(x0 + (i === 1 ? -Math.abs(dx) : dx), HX), fold(z0 + dz, HZ)];
  };
  // One-handed and cocky: the cue rests on the end rail, the left hand stays on her hip, then she looks straight at us.
  const STANCE = [1.55, 0, 0.86], CUE = 0.69, CL = 1.45 * CUE, TIP = 0.73 * CUE;
  const actD1 = t => {
    sir.shades.visible = false;
    pool.updateMatrixWorld(true); PT.copy(pool.matrixWorld);
    pool.balls.forEach((b, i) => { const [x, z] = ballPos(i, t); b.position.set(x, pool.Y + Rb, z); });
    put(sir, OV, STANCE[0], 0, STANCE[2], -Math.PI / 2 + 0.2);
    const cb = balls[0], stroke = t < tStr - 0.55 ? 0.05 + 0.05 * (0.5 - 0.5 * Math.cos((t - tD) * 7)) : t < tStr - 0.12 ? 0.05 + 0.13 * ss(tStr - 0.55, tStr - 0.2, t) : 0.18 - 0.24 * ss(tStr - 0.12, tStr + 0.02, t);
    const tip = toW(cb[0] + Rb + stroke, pool.Y + Rb, cb[1]), rail = toW(pool.W / 2 + 0.08, pool.Y + 0.07, cb[1]), dir = rail.sub(tip).normalize();
    const grip = tip.clone().addScaledVector(dir, 0.62);
    const settle = ss(tD, tD + 0.5, t), after = ss(tHit + 0.1, tHit + 0.5, t);
    const p = A.stand(t, 2, { amt: 0.35 });
    p.waist = [p.waist[0] + 12 * settle, p.waist[1], p.waist[2]]; p.chest = [p.chest[0] + 10 * settle, p.chest[1], p.chest[2]];
    p.aR = W([grip.x, grip.y, grip.z]); p.plR = [-1, -0.2, -0.6]; p.hR = HAND.grip;
    p.aL = [1.25, 0.14, 0.05]; p.plL = [1, 0, -0.75]; p.hL = HAND.flat;
    p.look = after > 0.5 ? ctx.camera.position.toArray() : [toW(cb[0], 0, 0).x, pool.Y * 0.85, STANCE[2] - 0.26]; p.lookW = 0.8;
    K.act(sir, p, t, { smile: 0.3 + 0.55 * after, eye: 0.12 });
    cueP.scale.setScalar(CUE); cueP.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().negate()); cueP.position.copy(tip).addScaledVector(dir, TIP);
    return U.film(t);
  };

  // ================================================================ D2: she trains the Secret Service dogs herself
  const dogs = [-0.8, 0, 0.8].map((x, i) => { const d = P.dog({ s: 0.95 }); d.position.set(7, 0, -4.85 - (i === 1 ? 0 : 0.15)); WH.add(d); return { d, x, z: -4.9 + (i === 1 ? 0.15 : 0), i }; });
  const agents = [[-2.2, -5.3, 1.2], [2.2, -5.3, -1.2]].map(([x, z, y], i) => K.person(WH, i ? 'oguri' : 'suzuka', 'secreto', x, z, y, { shadow: false }));
  const actD2 = t => {
    sir.shades.visible = true; gate.open(1); joker.root.visible = false;
    put(sir, WH, 0, 0, -6.2, 0);
    const cmd = ss(tPer - 0.1, tPer + 0.25, t) * (1 - ss(tSec + 0.6, tSec + 1.0, t));
    const p = M.mix(A.handsOnHips(t, 2), A.point(t, 2, 0, 18, 'R'), cmd);
    if (cmd > 0) { p.hR = HAND.flat; }
    K.act(sir, p, t, { smile: 0.5 });
    dogs.forEach(o => { const t0 = tD2 + 0.05 + o.i * 0.12, tr = M.travel(t, t0, 7 - o.x, 5.5, 0.35), x = 7 - tr.D;
      const sitK = ss(tPer + 0.15 + o.i * 0.13, tPer + 0.45 + o.i * 0.13, t);
      o.d.position.set(x, 0, o.z); o.d.rotation.y = angTo(-Math.PI / 2, Math.PI, ss(tr.T - 0.25, tr.T + 0.2, t));
      o.d.pose({ sit: sitK, walk: tr.moving ? tr.D / 1.1 : null, wag: 0.3 + 0.7 * sitK, head: -0.15 * sitK, t }); });
    agents.forEach((r, i) => { const squat = i === 1 ? ss(tSec - 0.1, tSec + 0.3, t) : 0;
      const q = M.mix(A.crossArms(t, i + 4), { ...A.sit(t, i + 4), hipY: -0.13, hipZ: -0.03 }, squat);
      K.act(r, q, t, { eye: t > tSer ? 'shock' : undefined, mouth: t > tSer ? 'small' : 'neutral' }); });
    return U.film(t) + U.popCard(t, tSer - 0.2, ctx.dur + 1, 'SERVICIO SECRETO', 'Entrenadora en jefe: la Presidenta', '', { x: 1480, y: 140, w: 560, accent: '#1d2a4a', icon: '🐕' });
  };

  const sfx = [
    { t: 0, type: 'jet', dur: tA3 + 1, vol: 0.55 }, { t: tTD, type: 'brakes', vol: 0.4 }, { t: tA3, type: 'wind', dur: tB2 - tA3, vol: 0.2 },
    { t: tB, type: 'steps', dur: tB2 - tB, vol: 0.3 }, { t: tB2 - 0.95, type: 'thud', vol: 0.15 },
    { t: tB2, type: 'birds', dur: tD - tB2, vol: 0.22 }, { t: tChi + 0.1, type: 'sting2', vol: 0.3 },
    { t: tPush, type: 'creak', vol: 0.5 }, { t: tOpen + 0.2, type: 'crowd', dur: tD - tOpen, vol: 0.3 }, { t: tRel, type: 'whoosh', vol: 0.4 }, { t: tLand, type: 'thud', vol: 0.4 },
    { t: tStr, type: 'click', vol: 0.6 }, { t: tHit, type: 'crack', vol: 0.5 }, { t: tD2, type: 'birds', dur: ctx.dur - tD2, vol: 0.2 },
    { t: tPer + 0.2, type: 'whistle', vol: 0.3 }, { t: tSec, type: 'pop', vol: 0.35 },
  ];
  const shots = [
    { t0: 0, set: AF, p0: [-24, 1.7, -14], l0: [0, 6, -100], fov0: 30, act: t => actA(t, 'land') },
    { t0: tA2, set: AF, p0: [-7.5, 1.3, 28.5], l0: [0, 1.6, 20], p1: [-7.2, 1.3, 28.0], l1: [-0.5, 1.6, 21], fov0: 40, act: t => actA(t, 'land') },
    { t0: tA3, set: AF, p0: [-5.3, 1.25, 23.7], l0: [-2.7, 1.15, 21.2], p1: [-5.6, 1.25, 23.2], l1: [-3.2, 1.15, 21.2], fov0: 36, act: t => actA(t, 'stairs') },
    { t0: tB, set: AF, p0: [-9.8, 1.25, 23.9], l0: [-4.8, 1.1, 21.2], p1: [-11.0, 1.25, 23.5], l1: [-8.4, 1.1, 21.2], fov0: 38, act: actB1 },
    { t0: tB2, set: WH, p0: [2.9, 1.25, -3.3], l0: [0.55, 1.0, -6.4], p1: [2.7, 1.25, -3.6], l1: [0.55, 1.0, -6.4], fov0: 38, act: actB2 },
    { t0: tC, set: WH, p0: [5.4, 2.1, 8.2], l0: [-0.3, 0.9, 3.4], p1: [5.0, 2.0, 7.6], l1: [-0.4, 0.9, 3.2], fov0: 44, act: actC1 },
    { t0: tC2, set: WH, p0: [-3.7, 1.25, 0.1], l0: [-1.55, 1.05, 2.6], p1: [-3.9, 1.3, -0.2], l1: [-1.5, 1.1, 2.2], fov0: 44, act: actC2 },
    { t0: tD, set: OV, p0: [0.5, 1.6, 3.4], l0: [0.3, 0.7, 0.3], p1: [0.9, 1.3, 2.5], l1: [0.6, 0.75, 0.5], fov0: 44, fov1: 38, act: actD1 },
    { t0: tD2, set: WH, p0: [3.6, 1.05, -4.3], l0: [-0.2, 0.62, -5.5], p1: [3.3, 1.05, -4.5], l1: [-0.2, 0.62, -5.5], fov0: 42, act: actD2 },
  ];
  const inst = { scene: AF, scenes: [AF, WH, OV], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
