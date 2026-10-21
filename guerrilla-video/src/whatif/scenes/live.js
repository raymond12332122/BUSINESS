import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as M from '../../lib/motion.js';
import { run, wt } from '../shots.js';
import { SASH } from './titulo.js';
const { ss, clamp, HAND } = M;
const fade = U.fade;
const V = () => new THREE.Vector3();
const wrist = (r, s) => { r.root.updateMatrixWorld(true); return r.j['wri' + s].bone.getWorldPosition(V()); };
const mouth = r => { r.root.updateMatrixWorld(true); const h = r.j.head.bone.getWorldPosition(V()), yaw = r.root.rotation.y; return h.add(V().set(Math.sin(yaw) * 0.08, 0.05, Math.cos(yaw) * 0.08)); };
const UP = new THREE.Vector3(0, 1, 0);
// The mic's head sits just off her lips while the hand is up at her face; lower, it rests upright in her fist.
function holdMic(mic, r, s) {
  const g = wrist(r, s), m = mouth(r), d = m.clone().sub(g), k = clamp((0.36 - d.length()) / 0.12), dir = d.normalize();
  mic.quaternion.identity().slerp(new THREE.Quaternion().setFromUnitVectors(UP, dir), k);
  mic.position.copy(g).add(V().set(0, 0.06, 0)).lerp(m.clone().addScaledVector(dir, -0.19), k);
}

// Idol performance: the Teio Step underneath, singing into the mic above (mic in the right hand, or mirrored to the left).
export function idol(t, seed, sing = 1, side = 'R') {
  const p = A.teioStep(t, seed, 124); if (sing <= 0) return p;
  const q = A.sing(t, seed, 0.8);
  if (side === 'R') return { ...p, aR: q.aR, aWR: sing, plR: q.plR, hR: q.hR, armL: q.armL, elbL: q.elbL, hL: q.hL };
  return { ...p, aL: ['head', 0.25, -0.95, 1.25], aWL: sing, plL: [1, -1, 0], hL: HAND.grip, armR: [q.armL[0], -q.armL[1], -q.armL[2]], elbR: [0, -q.elbL[1], 0], hR: q.hL };
}
// The 15 leaders' places on stage for the finale: front row of 8, back row of 7; Rudolf and Sirius in the middle.
export const SPOTS = (() => { const front = ['opera', 'creek', 'digital', 'rudolf', 'sirius', 'teio', 'golshi', 'turbo'], back = ['dotoB', 'grass', 'mcqueenB', 'groove', 'dia', 'tamamoB', 'suzukaB'];
  return [...front.map((k, i) => [k, -6.3 + i * 1.8, -2.3]), ...back.map((k, i) => [k, -5.4 + i * 1.8, -4.6])]; })();
export function drawScreen(stage, lines) {
  const { canvas: c, tex } = stage.screen, x = c.getContext('2d'), g = x.createLinearGradient(0, 0, c.width, c.height);
  g.addColorStop(0, '#ff4fa0'); g.addColorStop(0.5, '#5a3aff'); g.addColorStop(1, '#22c1ff'); x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = '900 118px Inter'; x.fillText(lines[0], c.width / 2, 230); x.font = '800 54px Inter'; x.fillText(lines[1], c.width / 2, 330); tex.needsUpdate = true;
}

export function build(ctx) {
  const L = ctx.L;
  const tWin = wt(L[0], 'uining'), tB = L[1].t0 - 0.3, tJun = wt(L[1], 'juntas'), tNin = wt(L[1], 'ninas'), tLado = wt(L[1], 'lado');
  const tC = L[2].t0 - 0.3, tSub = wt(L[2], 'subirian'), tBai = wt(L[2], 'bailar'), tEll = wt(L[2], 'ellas');

  const St = S.liveStage(), Y = St.stage.top;
  drawScreen(St.stage, ['WINNING LIVE', 'GRAN CARRERA DE NORTEAMÉRICA']);
  const cast = SPOTS.map(([k, x, z]) => { const r = K.leader(St, k, x, z, 0); if (k === 'rudolf') K.fitSash(r, SASH, { emblem: K.eagleKnot() }); return { r, k, x, z }; });
  const rud = cast.find(c => c.k === 'rudolf'), sir = cast.find(c => c.k === 'sirius');
  const mics = [rud, sir].map(() => { const m = P.handMic(); m.userData.dynamic = true; m.scale.setScalar(1.4); St.add(m); return m; });
  St.confT0 = tEll; const order = cast.filter(c => c !== rud && c !== sir).sort((a, b) => Math.abs(a.x) - Math.abs(b.x));
  const rise = c => { const i = order.indexOf(c); return i < 0 ? null : tSub - 0.4 + i * 0.16; };   // the others ride the stage lifts up, centre first
  const act = t => {
    St.confetti.visible = t > tEll;
    cast.forEach(c => {
      const r = c.r, duo = c === rud || c === sir, t0 = duo ? null : rise(c);
      let y = Y; if (t0 !== null) { const k = ss(t0, t0 + 0.7, t); y = Y - 1.6 * (1 - k); r.root.visible = t > t0 - 0.05; }
      // Rudolf and Sirius start a little apart, come together on "juntas", side by side as when they were girls
      let x = c.x; if (duo) { const sx = c === rud ? -1 : 1, k = ss(tJun - 0.6, tJun + 0.4, t); x = sx * (1.7 - 1.15 * k); if (t < tB) x = sx * 1.7; }
      r.root.position.set(x, y, c.z); r.root.rotation.set(0, 0, 0);
      let p;
      if (duo) { const hands = ss(tLado - 0.4, tLado + 0.2, t) * (1 - ss(tC - 0.1, tC + 0.3, t)), free = c === rud ? 'L' : 'R';
        p = M.mix(A.stand(t, c === rud ? 1 : 2), idol(t, c === rud ? 1 : 2, 1, c === rud ? 'R' : 'L'), ss(tWin - 0.7, tWin - 0.1, t));
        if (hands > 0) { p['a' + free] = ['world', 0, Y + 1.38, c.z + 0.08]; p['aW' + free] = hands; p['h' + free] = HAND.soft; p['pl' + free] = [c === rud ? 1 : -1, -0.3, -0.5]; } }
      else p = idol(t, SPOTS.findIndex(s => s[0] === c.k) * 0.7, 0);
      K.act(r, p, t, { mouth: duo && t > tWin ? [0.35 + 0.35 * Math.abs(Math.sin(t * 7 + (c === rud ? 0 : 1))), 0.8] : [0.3, 0.9], eye: 0.15, smile: 0.9 });
    });
    [rud, sir].forEach((c, i) => holdMic(mics[i], c.r, c === rud ? 'R' : 'L'));
    St.tick?.(t);
    return U.film(t) + U.bigTitle(t, tWin - 0.3, tB + 0.2, 'EL CONCIERTO DE LAS GANADORAS', 'Winning Live', '', { top: 60 });
  };
  const sfx = [
    { t: 0, type: 'crowd', dur: ctx.dur, vol: 0.45 }, { t: tWin - 0.3, type: 'cheer', vol: 0.5 }, { t: tJun, type: 'applause', dur: 3, vol: 0.3 },
    { t: tSub - 0.4, type: 'riser', dur: 1.6, vol: 0.3 }, { t: tEll, type: 'cheer', vol: 0.6 }, { t: tEll, type: 'pop', vol: 0.4 },
  ];
  const shots = [
    { t0: 0, set: St, p0: [0, 3.4, 24], l0: [0, 3.2, -4], p1: [0, 2.8, 15], l1: [0, 2.6, -3], fov0: 46, act: t => { St.beamK = 1; return act(t); } },
    { t0: tB, set: St, p0: [0, 2.35, 4.4], l0: [0, 2.15, -2.3], p1: [0, 2.3, 3.6], l1: [0, 2.15, -2.3], fov0: 38, act: t => { St.beamK = 0.3; return act(t); } },
    { t0: tNin - 0.4, set: St, p0: [2.6, 1.6, 1.4], l0: [0, 2.0, -2.3], p1: [2.2, 1.65, 1.0], l1: [0, 2.05, -2.3], fov0: 36, act: t => { St.beamK = 0.3; return act(t); } },
    { t0: tC, set: St, p0: [0, 4.4, 13], l0: [0, 2.4, -3], p1: [0, 3.2, 8.8], l1: [0, 2.2, -3], fov0: 50, act: t => { St.beamK = 1; return act(t); } },
  ];
  const inst = { scene: St, scenes: [St], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
