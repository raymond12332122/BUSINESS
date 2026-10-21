import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as M from '../../lib/motion.js';
import { run, wt, walkIn } from '../shots.js';
import { SASH } from './titulo.js';
const { ss, clamp, HAND } = M;
const fade = U.fade;
const V = () => new THREE.Vector3();
const put = (r, set, x, y, z, yaw) => { if (r.root.parent !== set) set.add(r.root); r.root.position.set(x, y, z); r.root.rotation.y = yaw; r.root.visible = true; return r; };
const wrist = (r, s) => { r.root.updateMatrixWorld(true); return r.j['wri' + s].bone.getWorldPosition(V()); };
// A leash: a thin line between two world points, rebuilt each frame.
function leash() { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 5), P.std('#c0392b')); m.userData.dynamic = true;
  m.span = (a, b) => { const d = b.clone().sub(a), L = d.length(); m.position.copy(a).addScaledVector(d, 0.5); m.scale.set(1, L, 1); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); }; return m; }

export function build(ctx) {
  const L = ctx.L;
  const tHip = wt(L[0], 'hipodromo'), tAbi = wt(L[0], 'abierto');
  const tB = L[1].t0 - 0.3, tAma = wt(L[1], 'amanecer'), tEmp = wt(L[1], 'emperador'), tSir = wt(L[1], 'sirius'), tPat = wt(L[1], 'patadas'), tSal = wt(L[1], 'saltos'), tPas = wt(L[1], 'paseando');
  const tC = L[2].t0 - 0.3, tIns = wt(L[2], 'inscribirian'), tTe = wt(L[2], 'tokai'), tTu = wt(L[2], 'tuin'), tGo = wt(L[2], 'gold'), tTa = wt(L[2], 'tamamo');
  const tB2 = tSir - 0.25;

  // ================================================================ A: the Hipódromo de las Américas from the air
  const Day = S.racecourse('day');
  // ================================================================ B: dawn training
  const Dawn = S.racecourse('dawn');
  const board = (set, bg, ink, a, b) => set.screen.draw((x, w, h) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = ink; x.font = '900 70px Inter'; x.textAlign = 'center'; x.fillText(a, w / 2, h / 2 - 20); x.fillText(b, w / 2, h / 2 + 60); });
  board(Day, '#0d1a12', '#7dff9a', 'GRAN CARRERA', 'DE NORTEAMÉRICA'); board(Dawn, '#0b1426', '#9fc4ff', 'HIPÓDROMO', 'DE LAS AMÉRICAS');   // the infield screen is never a black hole
  const rud = K.leader(Dawn, 'rudolf', 0, 0, 0); K.fitSash(rud, SASH, { emblem: K.eagleKnot() });
  const sir = K.leader(Dawn, 'sirius', 0, 0, 0);
  const D0 = 20, RUNV = 0.95;   // her jog along the home straight (chibi units/s → about 3.2 m/s for her)
  const actB1 = t => {
    const tr = M.travel(t, tB - 0.2, 60 / rud.unit, RUNV, 0.5), d = D0 + tr.D * rud.unit, p0 = S.trackPos(d, 1);
    put(rud, Dawn, p0.x, 0, p0.z, p0.yaw); sir.root.visible = false;
    K.act(rud, M.gait(tr.D, { run: 0.85, amp: tr.amp, seed: 1 }), t, { smile: 0.3, eye: 0.1 });
    const c = ctx.camera; c.position.set(p0.x + 2.4, 1.25, p0.z - 3.6); c.lookAt(p0.x + 0.6, 1.0, p0.z);
    return U.film(t) + U.digital(t, tB + 0.2, tB2 + 0.2, '5:30', { sub: 'A.M. · ENTRENAMIENTO', col: '#ffb43a' })
      + U.popCard(t, tEmp - 0.3, tB2 + 0.2, 'DISCIPLINA', 'de emperador', '', { x: 1480, y: 330, w: 420, accent: '#0f6b3f', icon: '♛' });
  };
  // Sirius in the infield: savate kicks, jumps, then a walk with her dogs
  const SP = [8, 0, 26];
  const dogs = [0, 1].map(i => { const d = P.dog({ s: 0.9 }); Dawn.add(d); return d; }), leads = [leash(), leash()]; leads.forEach(l => Dawn.add(l));
  const kickU = t => { const a = (t - tPat + 0.15) / 0.75; return a < 0 || a > 2 ? -1 : a % 1; };
  const actB2 = t => {
    rud.root.visible = false;
    let p;
    if (t < tPas - 0.2) {
      put(sir, Dawn, SP[0], 0, SP[2], -0.5);
      const ku = kickU(t), hop = t > tSal - 0.1 && t < tPas - 0.2;
      p = ku >= 0 ? A.kick(t, 2, ku) : hop ? A.cheer(t, 2) : A.handsOnHips(t, 2);
    } else p = walkIn(sir, t, tPas - 0.2, [SP[0], SP[2]], -0.5 + Math.PI, 4, { speed: 0.3, seed: 2, after: tt => A.stand(tt, 2) });
    const walking = t > tPas - 0.2;
    if (walking) { p.hR = HAND.grip; p.hL = HAND.grip; }
    K.act(sir, p, t, { smile: 0.6, eye: 0.2 });
    // dogs at her heels, on the leash once she sets off
    const s = sir.root.position, yaw = sir.root.rotation.y, fwd = V().set(Math.sin(yaw), 0, Math.cos(yaw)), side = V().set(Math.cos(yaw), 0, -Math.sin(yaw));
    dogs.forEach((d, i) => { const sx = i ? -0.85 : 0.85, pos = s.clone().addScaledVector(side, sx).addScaledVector(fwd, walking ? 0.45 : -0.3);
      d.position.copy(pos); d.rotation.y = yaw; d.pose({ sit: walking ? 0 : 1, walk: walking ? (s.distanceTo(V().set(SP[0], 0, SP[2])) / 0.9) + i * 0.5 : null, wag: 1, head: 0, t });
      const hand = wrist(sir, i ? 'R' : 'L'); leads[i].visible = walking; if (walking) leads[i].span(hand, pos.clone().add(V().set(0, 0.62, 0)).addScaledVector(fwd, 0.25)); });
    return U.film(t) + U.popCard(t, tPat - 0.2, tC + 0.2, 'A SU MANERA', 'Savate · saltos · perros', '', { x: 1480, y: 140, w: 470, accent: '#2a4a8a', icon: '🥾' });
  };

  // ================================================================ C: the entry list on the home straight, grandstand behind
  const ROW = [['rudolf', -4.5], ['sirius', -2.7], ['teio', -0.9], ['turbo', 0.9], ['golshi', 2.7], ['tamamoB', 4.5]];
  const field = ROW.map(([k, x]) => ({ r: K.leader(Day, k, x, 44.5, Math.PI), k, x }));
  K.fitSash(field[0].r, SASH, { emblem: K.eagleKnot() });
  const named = { rudolf: tC + 0.4, sirius: tC + 0.8, teio: tTe, turbo: tTu, golshi: tGo, tamamoB: tTa };
  const POSE = { rudolf: (t, k) => A.handOnHeart(t, 1, k), sirius: t => A.crossArms(t, 2), teio: (t, k) => M.mix(A.stand(t, 3), A.teioStep(t, 3), k), turbo: (t, k) => M.mix(A.stand(t, 4), A.cheer(t, 4), k),
    golshi: (t, k) => M.mix(A.stand(t, 5), A.point(t, 5, 0, 70, 'R'), k), tamamoB: (t, k) => M.mix(A.stand(t, 6), A.handsOnHips(t, 6), k) };
  // the camera trucks along the line and presents each runner as she is named, then pulls back on the whole field
  const KEYS = [[tC, -3.6], [tIns + 0.15, -3.6], [tTe + 0.05, -1.2], [tTu + 0.05, 0.7], [tGo + 0.05, 2.5], [tTa + 0.05, 4.0], [tTa + 0.7, 4.2]];
  const lin = t => { if (t <= KEYS[0][0]) return KEYS[0][1]; for (let i = 1; i < KEYS.length; i++) if (t <= KEYS[i][0]) { const [a, x0] = KEYS[i - 1], [b, x1] = KEYS[i]; return x0 + (x1 - x0) * (t - a) / (b - a); } return KEYS[KEYS.length - 1][1]; };
  const camC = (c, t) => { let fx = 0; for (let k = -4; k <= 4; k++) fx += lin(t + k * 0.1) / 9;   // box-filtered: smooth starts and stops
    const back = ss(tTa + 0.5, ctx.dur - 0.2, t), x = fx * (1 - back), d = 4.4 + 2.6 * back;   // stops short of the inner rail
    c.position.set(x * 0.92, 1.25 + 0.15 * back, 44.5 - d); c.lookAt(x, 1.12, 44.5); c.fov = 42 + 6 * back; c.updateProjectionMatrix(); };
  const actC = t => {
    camC(ctx.camera, t);
    field.forEach(({ r, k, x }) => { r.root.position.set(x, 0, 44.5); r.root.rotation.y = Math.PI; const kk = ss(named[k] - 0.2, named[k] + 0.3, t);
      K.act(r, POSE[k](t, kk), t, { smile: 0.4 + 0.4 * kk, mouth: kk > 0.5 && (k === 'turbo' || k === 'golshi') ? [0.6, 0.9] : undefined }); });
    return U.film(t) + U.roster(t, tC + 0.2, ctx.dur + 1, ROW.map(([k]) => [k, named[k]]), { x: 1560, y: 110, w: 520 });
  };
  const actA = t => U.film(t) + U.bigTitle(t, 0.4, tAbi - 0.2, 'LA GRAN CARRERA DE', 'Norteamérica', '', { top: 70 })
    + U.popCard(t, tAbi - 0.2, tB + 0.2, 'HIPÓDROMO DE LAS AMÉRICAS', 'Ciudad de México', 'Abierto desde 1943', { x: 1480, y: 140, w: 560, accent: '#0f5a3a', icon: '🏇' });

  const sfx = [
    { t: 0, type: 'wind', dur: tB, vol: 0.25 }, { t: 0.4, type: 'fanfare', vol: 0.3 }, { t: tB, type: 'birds', dur: tC - tB, vol: 0.22 }, { t: tB, type: 'steps', dur: tB2 - tB, vol: 0.35 },
    { t: tPat, type: 'swoosh', vol: 0.35 }, { t: tPat + 0.75, type: 'swoosh', vol: 0.35 }, { t: tSal, type: 'thud', vol: 0.2 },
    { t: tC, type: 'crowd', dur: ctx.dur - tC, vol: 0.35 }, ...[tTe, tTu, tGo, tTa].map(x => ({ t: x, type: 'pop', vol: 0.3 })),
  ];
  const shots = [
    { t0: 0, set: Day, p0: [-95, 42, 95], l0: [5, 0, 15], p1: [-40, 24, 82], l1: [10, 2, 30], fov0: 46, act: actA },
    { t0: tB, set: Dawn, p0: [0, 1.25, 30], l0: [0, 1, 40], fov0: 40, act: actB1 },
    { t0: tB2, set: Dawn, p0: [SP[0] + 1.8, 1.25, SP[2] + 3.2], l0: [SP[0], 0.95, SP[2]], p1: [SP[0] + 2.4, 1.3, SP[2] + 2.0], l1: [SP[0] + 0.6, 0.9, SP[2] - 1.0], fov0: 42, act: actB2 },
    { t0: tC, set: Day, p0: [0, 1.4, 37.6], l0: [0, 1.15, 44.5], p1: [0, 1.4, 38.4], l1: [0, 1.15, 44.5], fov0: 48, act: actC },
  ];
  const inst = { scene: Day, scenes: [Day, Dawn], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
