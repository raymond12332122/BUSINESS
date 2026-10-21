import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as M from '../../lib/motion.js';
import { run, wt, walkIn } from '../shots.js';
import { SASH } from './titulo.js';
import { SPOTS, drawScreen, idol } from './live.js';
const { ss, clamp, HAND } = M;
const fade = U.fade;
const put = (r, set, x, y, z, yaw) => { if (r.root.parent !== set) set.add(r.root); r.root.position.set(x, y, z); r.root.rotation.y = yaw; r.root.visible = true; return r; };

export function build(ctx) {
  const L = ctx.L;
  const tVer = wt(L[0], 'verdad'), tDis = wt(L[0], 'discuten'), tRec = wt(L[0], 'reconcilian'), tNec = wt(L[0], 'necesitan');
  const tB = L[1].t0 - 0.25, tKm = wt(L[1], 'kilometros'), tFam = wt(L[1], 'familias'), tCom = wt(L[1], 'comercio'), tCor = wt(L[1], 'correr'), tJun = wt(L[1], 'juntos');
  const tC = L[2].t0 - 0.25, tCon = wt(L[2], 'concierto'), tCred = L[2].t1 + 0.3;

  // ================================================================ A: at the line on the bridge: they argue, make up, need each other
  const Br = S.bridge('golden'), DY = 3.27;
  const rud = K.leader(Br, 'rudolf', -0.6, 0, Math.PI / 2); K.fitSash(rud, SASH, { emblem: K.eagleKnot() });
  const sir = K.leader(Br, 'sirius', 0.6, 0, -Math.PI / 2);
  const HS = [0, DY + 0.98, 0];   // where the right hands meet
  const actA = t => {
    const step = ss(tRec - 0.5, tRec - 0.05, t), x = 0.6 - 0.22 * step, shake = ss(tRec - 0.1, tRec + 0.3, t), pump = Math.sin((t - tRec) * 9) * 0.03 * shake * (1 - ss(tNec, tNec + 0.4, t));
    put(rud, Br, -x, DY, -0.12, Math.PI / 2); put(sir, Br, x, DY, 0.12, -Math.PI / 2);   // offset so each right hand is near the middle
    fams.forEach(f => { f.r.root.visible = false; }); trucks.forEach(tr => { tr.visible = false; });
    const argue = t > tDis - 0.4 && t < tRec - 0.3;
    const pr = argue ? A.talk(t, 1, 1) : A.crossArms(t, 1), ps = argue ? A.talk(t, 2, 1) : A.crossArms(t, 2);
    const hand = (p, side) => { if (shake <= 0) return p; const q = { ...M.mix(p, A.stand(t, side === 'r' ? 1 : 2), shake) };
      q.aR = ['world', HS[0] + (side === 'r' ? -0.04 : 0.04), HS[1] + pump, HS[2]]; q.aWR = shake; q.hR = HAND.grip; q.plR = [-1, -0.6, -0.4];
      q.waist = [(q.waist?.[0] || 0) + 8 * shake, q.waist?.[1] || 0, q.waist?.[2] || 0]; return q; };
    K.act(rud, hand(pr, 'r'), t, { talk: argue ? 1 : false, smile: t > tRec ? 0.8 : 0.1, eye: argue ? 0.35 : 0.1 });
    K.act(sir, hand(ps, 's'), t, { talk: argue ? 1 : false, smile: t > tRec ? 0.6 : 0, eye: argue ? 0.45 : 0.15 });
    Br.tick?.(t);
    return U.film(t) + U.bigTitle(t, 0.4, tVer + 1.2, '¿QUÉ PASARÍA', 'de verdad?', '', { top: 70 });
  };

  // ================================================================ B: they run the bridge together, families and trucks around them
  const fams = [];
  for (let i = 0; i < 8; i++) { const dir = i % 2 ? 1 : -1, r = K.person(Br, ['oguri', 'cafe', 'helios', 'daiwa', 'hishi', 'tamamo', 'doto', 'spe'][i], i % 3 ? 'civil' : 'civilCap', 0, 0, dir > 0 ? Math.PI / 2 : -Math.PI / 2, { shadow: false });
    fams.push({ r, dir, x0: dir > 0 ? -28 + i * 2.2 : 12 - i * 2.2, z: dir > 0 ? -4.6 - (i % 3) * 0.5 : 4.6 + (i % 3) * 0.5, i }); }
  const trucks = [0, 1, 2].map(i => { const tr = P.truck(['#c0392b', '#2a5ab8', '#2f8a3a'][i]); Br.add(tr); return tr; });
  const RUN0 = -26, RUNLEN = 30;
  const actB = t => {
    const pR = walkIn(rud, t, tB, [RUN0, 0.75], Math.PI / 2, RUNLEN, { run: 0.7, speed: 0.95, seed: 1, acc: 0.6 }); rud.root.position.y = DY;
    const pS = walkIn(sir, t, tB, [RUN0, -0.75], Math.PI / 2, RUNLEN, { run: 0.7, speed: 0.95, seed: 2, acc: 0.6 }); sir.root.position.y = DY;
    const glance = ss(tJun - 0.4, tJun + 0.1, t);
    const rp = rud.root.position, sp = sir.root.position, m0 = rp.clone().add(sp).multiplyScalar(0.5);
    pR.look = [sp.x, DY + 1.2, sp.z]; pR.lookW = 0.7 * glance; pS.look = [rp.x, DY + 1.2, rp.z]; pS.lookW = 0.7 * glance;
    K.act(rud, pR, t, { smile: 0.5 + 0.4 * glance }); K.act(sir, pS, t, { smile: 0.3 + 0.5 * glance });
    fams.forEach(f => { f.r.root.visible = true; const p = walkIn(f.r, t, tB - 2, [f.x0, f.z], f.dir > 0 ? Math.PI / 2 : -Math.PI / 2, 30, { speed: 0.55, seed: f.i }); f.r.root.position.y = DY; K.act(f.r, p, t, { smile: 0.8 }); });
    trucks.forEach((tr, i) => { tr.visible = true; tr.position.set(m0.x - 11 - 15 * i, DY, i % 2 ? 3.1 : -3.1); tr.rotation.y = 0; });   // they follow behind the runners, never past the camera
    const c = ctx.camera, m = rp.clone().add(sp).multiplyScalar(0.5); c.position.set(m.x + 6.2, DY + 1.35, 0.4); c.lookAt(m.x, DY + 1.05, 0);
    Br.tick?.(t);
    return U.film(t) + U.popCard(t, tKm - 0.2, tFam - 0.1, 'FRONTERA', '3,142 km', 'compartidos', { x: 1500, y: 130, w: 420, accent: '#ffd34a', icon: '🌉' })
      + U.popCard(t, tFam - 0.1, tCom - 0.1, 'FAMILIAS', 'a los dos lados', '', { x: 1500, y: 130, w: 420, accent: '#e86a9a', icon: '👨‍👩‍👧' })
      + U.popCard(t, tCom - 0.1, tCor - 0.2, 'COMERCIO', '872,800 mdd', 'en 2025', { x: 1500, y: 130, w: 420, accent: '#2f8a4a', icon: '🚚' });
  };

  // ================================================================ C + credits: the finale on the Winning Live stage
  const St = S.liveStage(), Y = St.stage.top;
  drawScreen(St.stage, ['WINNING LIVE', 'GRAN CARRERA DE NORTEAMÉRICA']);
  const cast = SPOTS.map(([k, x, z]) => { const r = K.leader(St, k, x, z, 0); if (k === 'rudolf') K.fitSash(r, SASH, { emblem: K.eagleKnot() }); return { r, k, x, z, i: SPOTS.findIndex(s => s[0] === k) }; });
  St.confT0 = tCon - 0.2;
  const ROWS = Object.values(K.LEADERS).map(([uma, country, , quip]) => [uma, country === 'México' || country === 'Estados Unidos' ? `Presidenta de ${country}` : `Líder de ${country}`, quip]);
  const actC = t => {
    St.confetti.visible = t > tCon - 0.2;
    const bowK = ss(tCon - 0.4, tCon + 0.1, t) * (1 - ss(tCon + 1.4, tCon + 1.9, t));
    cast.forEach(c => { c.r.root.position.set(c.x, Y, c.z); c.r.root.rotation.set(0, 0, 0);
      const p = bowK > 0 ? M.mix(idol(t, c.i * 0.7, 0), A.bow(t, c.i, 1), bowK) : t > tCon + 1.6 ? A.wave(t, c.i, c.i % 2 ? 'R' : 'both') : idol(t, c.i * 0.7, 0);
      K.act(c.r, p, t, { smile: 0.9, eye: 0.15, mouth: [0.3, 0.9] }); });
    St.tick?.(t);
    return U.film(t) + U.credits(t, tCred, ctx.dur - 3.3, ROWS, { title: 'ELENCO', x: 1290, w: 560, speed: 1 })
      + U.bigTitle(t, ctx.dur - 3.4, ctx.dur + 1, 'GRACIAS POR VER', '¿Qué pasaría si…?', '', { top: 610 });
  };

  const sfx = [
    { t: 0, type: 'wind', dur: tB, vol: 0.2 }, { t: tDis - 0.4, type: 'crowd', dur: 1.2, vol: 0.15 }, { t: tRec, type: 'pop', vol: 0.3 }, { t: tNec, type: 'sting', vol: 0.2 },
    { t: tB, type: 'steps', dur: tC - tB, vol: 0.3 }, { t: tB, type: 'traffic', dur: tC - tB, vol: 0.25 },
    { t: tC, type: 'crowd', dur: ctx.dur - tC, vol: 0.4 }, { t: tCon - 0.2, type: 'cheer', vol: 0.6 }, { t: tCon, type: 'applause', dur: ctx.dur - tCon, vol: 0.4 },
  ];
  const shots = [
    { t0: 0, set: Br, p0: [0.1, DY + 1.35, 3.6], l0: [0, DY + 1.05, 0], p1: [0.05, DY + 1.3, 2.7], l1: [0, DY + 1.05, 0], fov0: 40, act: actA },
    { t0: tB, set: Br, p0: [0, DY + 1.4, 0], l0: [-10, DY + 1, 0], fov0: 42, act: actB },
    { t0: tC, set: St, p0: [0, 2.8, 12], l0: [0, 2.3, -3], p1: [0, 3.3, 15.5], l1: [0, 2.6, -3], fov0: 50, act: actC },
    { t0: tCred, set: St, p0: [-3.5, 3.6, 16], l0: [-1.8, 2.4, -3], p1: [-4.2, 4.8, 21], l1: [-2.2, 2.6, -3], fov0: 46, ease: 'lin', act: actC },
  ];
  const inst = { scene: Br, scenes: [Br, St], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
