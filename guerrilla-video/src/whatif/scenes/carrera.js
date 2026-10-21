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

// Position on the track by distance d measured on the rail lane; other lanes keep the same x on the straights and the
// same angle in the turns, so the field stays abreast.
function raceAt(d, lane) {
  const { L, R } = S.TRACK, r0 = R + 1.2, r = R + 1.2 + lane * 1.5, P = 2 * L + 2 * Math.PI * r0; d = ((d % P) + P) % P;
  if (d < L) return { x: -L / 2 + d, z: r, yaw: Math.PI / 2 };
  d -= L; if (d < Math.PI * r0) { const a = d / r0; return { x: L / 2 + Math.sin(a) * r, z: Math.cos(a) * r, yaw: Math.PI / 2 + a }; }
  d -= Math.PI * r0; if (d < L) return { x: L / 2 - d, z: -r, yaw: -Math.PI / 2 };
  d -= L; const a = d / r0; return { x: -L / 2 - Math.sin(a) * r, z: -Math.cos(a) * r, yaw: a - Math.PI / 2 };
}

export function build(ctx) {
  const L = ctx.L;
  const tGo = wt(L[0], 'arrancan') + 0.05, tVel = wt(L[0], 'velocidad'), tMit = wt(L[0], 'mitad'), tMas = wt(L[0], 'mas');
  const tGold = wt(L[1], 'gold'), tUlt = wt(L[1], 'ultima'), tCur = wt(L[1], 'curva'), tRem = wt(L[1], 'remontar');
  const tRec = wt(L[2], 'recta'), tRud = wt(L[2], 'rudolf'), tSir = wt(L[2], 'sirius'), tCab = wt(L[2], 'cabeza');
  const tMeta = wt(L[3], 'meta'), tEmp = wt(L[3], 'empate');

  const Rc = S.racecourse('day'), D0 = 250, DF = 98 + 2 * S.TRACK.L + 2 * Math.PI * (S.TRACK.R + 1.2), DIST = DF - D0;
  const AC = 0.6, V = DIST / (tMeta - tGo - AC);   // pace of the leaders: they reach the line together at "meta"
  const base = t => { const u = Math.max(0, t - tGo); if (t <= tMeta) return u > 0 ? V * (u - AC * (1 - Math.exp(-u / AC))) : 0;
    const d1 = V * (tMeta - tGo - AC * (1 - Math.exp(-(tMeta - tGo) / AC))), s = Math.min(t - tMeta, 3.2); return d1 + V * s - V * s * s / 6.4; };
  // [key, lane, offset(t)] — metres ahead (+) or behind (-) the leaders' pace
  const FIELD = [
    ['rudolf', 0, t => -2.0 * ss(tGo, tGo + 4, t) + 2.0 * ss(13, tMeta, t)],
    ['turbo', 1, t => 14 * ss(tGo, tVel + 0.3, t) - 34 * ss(tMit - 0.4, tMas + 2.0, t) - 12 * ss(tMas + 2, tMeta, t)],
    ['sirius', 2, t => -3.5 * ss(tGo, tGo + 4, t) + 3.5 * ss(12.5, tMeta, t)],
    ['teio', 3, t => 1.5 * ss(tGo, tGo + 5, t) - 4.5 * ss(13, tMeta, t)],
    ['tamamoB', 4, t => -1.0 * ss(tGo, tGo + 5, t) - 4.0 * ss(13, tMeta, t)],
    ['golshi', 5, t => -16 * ss(tGo, tUlt, t) + 13.5 * ss(tCur - 0.4, tMeta - 0.6, t)],
  ];
  const gate = Rc.gate, g0 = raceAt(D0, 2.5); gate.position.set(g0.x, 0, g0.z); gate.rotation.y = -Math.PI / 2;
  const runners = FIELD.map(([k, lane, off]) => { const r = K.leader(Rc, k, 0, 0, 0); if (k === 'rudolf') K.fitSash(r, SASH, { emblem: K.eagleKnot() }); return { r, k, lane, off }; });
  const dOf = (o, t) => D0 + base(t) + o.off(t) * ss(tGo, tGo + 0.8, t);
  const speedOf = (o, t) => (dOf(o, t + 0.05) - dOf(o, t - 0.05)) / 0.1;
  const place = t => runners.forEach(o => {
    const d = dOf(o, t), p = raceAt(d, o.lane), r = o.r, v = speedOf(o, t);
    r.root.position.set(p.x, 0, p.z); r.root.rotation.y = p.yaw;
    const amp = clamp(v / 5), D = (d - D0) / r.unit;
    let pose = M.mix(A.stand(t, 1), M.gait(D, { run: 1, amp: 1, stride: 1.5, sprint: 1, seed: o.lane }), amp);
    pose.waist = [(pose.waist?.[0] || 0) + 10 * amp, pose.waist?.[1] || 0, pose.waist?.[2] || 0]; pose.chest = [(pose.chest?.[0] || 0) + 6 * amp, pose.chest?.[1] || 0, pose.chest?.[2] || 0];
    if (o.k === 'turbo' && t > tMit) { const k = ss(tMit, tMas, t); pose.head = [(pose.head?.[0] || 0) + 16 * k, 0, 6 * k]; pose.waist[0] -= 8 * k; }
    if (t > tMeta + 0.4 && (o.k === 'rudolf' || o.k === 'sirius')) { pose = M.mix(pose, A.winded(t, o.lane, 1), ss(tMeta + 2.4, tMeta + 3.4, t));
      if (t > tEmp - 0.3) { const other = pos(o.k === 'rudolf' ? 'sirius' : 'rudolf'); pose.look = [other.x, 1.1, other.z]; pose.lookW = 0.8 * ss(tEmp - 0.3, tEmp + 0.3, t); } }
    const duo = o.k === 'rudolf' || o.k === 'sirius';
    const face = o.k === 'turbo' && t > tMit ? { eye: 0.8, mouth: [0.8, -0.3] } : duo && t > tEmp ? { eye: 0.2, mouth: [0.45, 0.9] } : t > tRec && duo ? { eye: 0.3, mouth: [0.5, -0.1] } : { eye: 0.1, mouth: [0.3, 0.2] };
    K.act(r, pose, t, face);
  });
  const pos = k => runners.find(o => o.k === k).r.root.position;
  const mid = (a, b) => pos(a).clone().add(pos(b)).multiplyScalar(0.5);
  Rc.screen.draw((x, w, h) => { x.fillStyle = '#0d1a12'; x.fillRect(0, 0, w, h); x.fillStyle = '#7dff9a'; x.font = '900 70px Inter'; x.textAlign = 'center'; x.fillText('GRAN CARRERA', w / 2, h / 2 - 20); x.fillText('DE NORTEAMÉRICA', w / 2, h / 2 + 60); });   // static for the whole race
  const act = (t, cam) => {
    gate.open(ss(tGo - 0.05, tGo + 0.25, t)); place(t);
    if (cam) cam(ctx.camera, t);
    return U.film(t);
  };
  // follow cameras (they override the shot's static framing)
  // follow cameras ride on the field's smooth pace, never on one runner's position (no jumps when the lead changes)
  const camTurbo = (c, t) => { const p = pos('turbo'); c.position.set(p.x + 3.0, 1.45, -38.6); c.lookAt(p.x - 2.5, 1.0, -40.9); };
  // trackside, just inside the rail and a few metres ahead of Twin Turbo: she runs out of gas while the field swallows her
  const camTired = (c, t) => { const dT = dOf(runners[1], t), a = raceAt(dT + 4.6, -1.0), b = raceAt(dT - 0.8, 1.2); c.position.set(a.x, 1.5, a.z); c.lookAt(b.x, 0.95, b.z); };
  const camGold = (c, t) => { const dg = dOf(runners[5], t), a = raceAt(dg - 5, 8.4), b = raceAt(dg + 1.5, 4); c.position.set(a.x, 2.4, a.z); c.lookAt(b.x, 1.0, b.z); };
  const camDuel = (c, t) => { const m = mid('rudolf', 'sirius'), k = ss(tCab - 0.3, tCab + 0.6, t); c.position.set(m.x + 7.5 - 2.5 * k, 1.35, m.z + 0.2); c.lookAt(m.x, 1.2, m.z); c.fov = 40 - 10 * k; c.updateProjectionMatrix(); };
  const FX = Rc.finishX;
  const camEnd = (c, t) => { const m = mid('rudolf', 'sirius'), dm = dOf(runners[0], t), a = raceAt(dm + 5.5, 1); c.position.set(a.x, 1.3, a.z); c.lookAt(m.x, 1.05, m.z); };
  const sfx = [
    { t: 0, type: 'crowd', dur: ctx.dur, vol: 0.4 }, { t: tGo - 0.05, type: 'bell', vol: 0.6 }, { t: tGo, type: 'clank', vol: 0.5 }, { t: tGo + 0.1, type: 'hooves', dur: tMeta - tGo + 1.5, vol: 0.45 },
    { t: tMit, type: 'sting2', vol: 0.25 }, { t: tCur, type: 'riser', dur: tRec - tCur, vol: 0.3 }, { t: tCab, type: 'drum', dur: tMeta - tCab, vol: 0.35 },
    { t: tMeta, type: 'cheer', vol: 0.6 }, { t: tMeta + 0.2, type: 'shutter', vol: 0.5 }, { t: tEmp, type: 'gavel', vol: 0.4 }, { t: tEmp + 0.1, type: 'applause', dur: ctx.dur - tEmp, vol: 0.45 },
  ];
  const shots = [
    { t0: 0, set: Rc, p0: [g0.x - 9, 1.0, g0.z + 1.5], l0: [g0.x, 1.3, g0.z], p1: [g0.x - 8, 1.0, g0.z + 1.2], l1: [g0.x, 1.3, g0.z], fov0: 44, act: t => act(t) },
    { t0: tGo + 0.9, set: Rc, p0: [0, 1, 0], l0: [0, 1, -40], fov0: 38, act: t => act(t, camTurbo) },
    { t0: tMit - 0.3, set: Rc, p0: [0, 1, 0], l0: [0, 1, -40], fov0: 42, act: t => act(t, camTired) },
    { t0: tGold - 0.3, set: Rc, p0: [0, 1, 0], l0: [0, 1, -40], fov0: 42, act: t => act(t, camGold) },
    { t0: tRec - 0.3, set: Rc, p0: [0, 1, 0], l0: [0, 1, 40], fov0: 40, act: t => act(t, camDuel) },
    // the photo-finish camera sits on the line; the image freezes as their heads cross it
    { t0: tMeta - 0.45, set: Rc, p0: [FX, 2.2, 35.5], l0: [FX, 0.95, 41.5], fov0: 34, act: t => act(Math.min(t, tMeta + 0.02)) + U.photoFinish(t, tMeta + 0.05, tEmp - 0.45, 'EMPATE', tEmp - 0.9) },
    { t0: tEmp - 0.5, set: Rc, p0: [0, 1, 0], l0: [0, 1, 0], fov0: 38, act: t => act(t, camEnd) + U.bigTitle(t, tEmp - 0.4, ctx.dur + 1, 'FOTO FINISH', '¡Empate!', 'Rudolf y Sirius, cabeza con cabeza', { top: 60 }) },
  ];
  const inst = { scene: Rc, scenes: [Rc], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
