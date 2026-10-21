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
const emoji = (ctx, pos, ch, k, size = 80) => { if (k <= 0) return ''; const [x, y, ok] = ctx.project(pos); if (!ok) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%) scale(${0.6 + 0.4 * k});opacity:${k};font:${size}px 'Noto Color Emoji'">${ch}</div>`; };
// Striped parachute canopy with its lines (harness point at the origin).
function parachute() {
  const g = new THREE.Group(), tex = K.canvasTex(512, 64, (x, w, h) => { const c = ['#f2c14e', '#e84a5f', '#f4f2ec', '#2ab7ca']; for (let i = 0; i < 16; i++) { x.fillStyle = c[i % 4]; x.fillRect(i * w / 16, 0, w / 16 + 1, h); } });
  const can = new THREE.Mesh(new THREE.SphereGeometry(1.5, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2.6), new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.8 }));
  can.scale.set(1, 0.6, 1); can.position.y = 2.4; g.add(can); g.canopy = can;
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, top = new THREE.Vector3(Math.cos(a) * 1.15, 2.55, Math.sin(a) * 1.15), d = top.clone(), len = d.length();
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, len, 4), P.std('#e8e8e8')); l.position.copy(d.multiplyScalar(0.5)); l.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), top.clone().normalize()); g.add(l); }
  g.userData.dynamic = true; return g;
}

const WHO = { mx: 'rudolf', us: 'sirius', ca: 'creek', jp: 'grass', de: 'groove', fr: 'mcqueenB', it: 'opera', sm: 'dotoB', au: 'golshi', kr: 'digital', co: 'teio', br: 'dia', ar: 'tamamoB', ch: 'suzukaB', mc: 'turbo' };

export function build(ctx) {
  const L = ctx.L;
  const tCaos = wt(L[1], 'caos'), tPar = wt(L[1], 'paracaidas'), tOp = wt(L[1], 'opera'), tAria = wt(L[1], 'aria'), tAg = wt(L[1], 'agnes'), tDes = wt(L[1], 'desmayo'), tVec = wt(L[1], 'veces');
  const tCr = wt(L[2], 'super'), tProp = wt(L[2], 'propuso'), tAcu = wt(L[2], 'acuerdo'), tUma = wt(L[2], 'umamusume'), tCar = wt(L[2], 'carrera');
  const tB = tCaos - 0.3, tB2 = tOp - 0.25, tB3 = tAg - 0.25, tC = tCr - 0.3, tC2 = tAcu + 0.2, tC3 = tCar - 0.5;

  const Sm = S.summit(), seats = {};
  const cast = Sm.seats.map(st => { const r = K.leader(Sm, WHO[st.code], st.x, st.z, st.yaw); if (st.code === 'mx') K.fitSash(r, SASH, { emblem: K.eagleKnot() });
    K.seatOn(r, st.chair.seatY); r.st = st; r.ySeat = r.root.position.y; seats[st.code] = r; return r; });
  const golshi = seats.au, opera = seats.it, agnes = seats.kr, creek = seats.ca;
  // whoever stands up pushes her chair back, so she never stands inside it
  Sm.seats.forEach(st => { st.chair.userData.dynamic = true; st.c0 = st.chair.position.clone(); });
  const slide = (st, k) => st.chair.position.set(st.c0.x + Math.sin(st.a) * 0.42 * k, 0, st.c0.z + Math.cos(st.a) * 0.42 * k);
  const chute = parachute(); Sm.add(chute);
  const mic = P.handMic(); mic.userData.dynamic = true; Sm.add(mic);
  const LAND = [0, 0, 0.6];
  const tFall0 = tCaos - 0.2, tLand = tPar + 0.45, Y0 = 13.2;   // she hangs in the oculus shaft when the shot opens
  const creekHead = () => { const c = creek.st; return [c.x, 1.35, c.z]; };

  const act = t => {
    const lookCreek = ss(tProp - 0.2, tProp + 0.4, t);
    cast.forEach((r, i) => {
      const st = r.st; r.root.position.set(st.x, r.ySeat, st.z); r.root.rotation.set(0, st.yaw, 0);
      if (r === golshi || r === opera || r === creek) return;
      let p = i % 3 === 0 ? A.sitTalk(t, i * 1.3, 0.4) : A.sit(t, i * 1.3);
      if (r === seats.us) p = A.seated(A.crossArms, t, 2);
      if (r === agnes) { const f1 = ss(tDes - 0.05, tDes + 0.25, t) * (1 - ss(tDes + 0.45, tDes + 0.6, t)), f2 = ss(tVec - 0.1, tVec + 0.2, t), f = Math.max(f1, f2);
        if (t < tDes - 0.1) p = A.seated(A.fangirl, t, 5); else p = M.mix(A.seated(A.fangirl, t, 5), { ...A.sit(t, 5), head: [24, 6, 30], chest: [10, 0, 12], waist: [4, 0, 6] }, f); }   // slumps onto one shoulder, clear of the chair back
      const ears = t > tUma - 0.1 ? [16 * ss(tUma - 0.1, tUma + 0.2, t), 16 * ss(tUma - 0.1, tUma + 0.2, t)] : undefined;
      const rise = ss(tCar - 0.1, tCar + 0.5, t);
      if (rise > 0) { r.root.position.y = r.ySeat * (1 - rise); p = M.mix(p, A.cheer(t, i * 1.3), rise); }
      slide(st, rise);
      if (lookCreek > 0 && r !== agnes) { p.look = creekHead(); p.lookW = 0.8 * lookCreek; }
      if (ears) p.ears = ears;
      const faint = r === agnes && t > tDes - 0.05 && (t < tDes + 0.55 || t > tVec - 0.1);
      K.act(r, p, t, { eye: faint ? 1 : rise > 0.5 ? 0.1 : undefined, mouth: rise > 0.5 ? [0.6, 0.9] : faint ? [0.4, 0.8] : undefined, smile: 0.35 });
    });
    // Gold Ship drops in by parachute and lands in the middle of the table
    const fall = ss(tFall0, tLand, t), y = Y0 * (1 - fall), sway = 0.3 * Math.sin(t * 2.2) * (1 - fall);
    golshi.root.position.set(LAND[0] + sway, t < tB ? -50 : y, LAND[2]); golshi.root.rotation.set(0, 0, 0); golshi.root.visible = t >= tB;
    K.act(golshi, t < tLand ? { ...A.cheer(t, 1), lift: 0 } : A.cheer(t, 1), t, { mouth: [0.7, 0.9] });
    chute.visible = t >= tB && t < tLand + 1.6; chute.position.set(golshi.root.position.x, y + 0.1, LAND[2] - 0.3 * ss(tLand, tLand + 1.2, t));
    chute.canopy.scale.set(1, 0.6 * (1 - 0.8 * ss(tLand, tLand + 1.0, t)), 1); chute.rotation.x = -1.2 * ss(tLand, tLand + 1.2, t);
    // Opera O stands and sings her aria
    const stand = ss(tOp - 0.4, tOp, t), op = opera.st;
    opera.root.position.set(op.x, opera.ySeat * (1 - stand), op.z); opera.root.rotation.set(0, op.yaw, 0); slide(op, stand);
    K.act(opera, M.mix(A.sit(t, 7), A.sing(t, 7, 0.9), stand), t, { mouth: t > tOp && t < tAg + 1 ? [0.5 + 0.3 * Math.sin(t * 6), 0.6] : undefined, eye: t > tAria ? 0.6 : undefined });
    const w = wrist(opera, 'R'); mic.visible = stand > 0.5; mic.position.set(w.x, w.y + 0.03, w.z); mic.rotation.set(0.3, op.yaw, 0);
    // Super Creek rises and makes her proposal
    const cs = ss(tCr - 0.2, tCr + 0.3, t), cr = creek.st;
    creek.root.position.set(cr.x, creek.ySeat * (1 - cs), cr.z); creek.root.rotation.set(0, cr.yaw, 0); slide(cr, cs);
    K.act(creek, M.mix(A.sit(t, 9), t > tProp ? A.talk(t, 9, 0.5) : A.handOnHeart(t, 9, 1), cs), t, { talk: t > tProp && t < tCar + 0.6 ? 0.8 : false, smile: 0.9, eye: 0.15 });
    Sm.tick?.(t);
    const notes = fade(t, tAria - 0.4, tAg, 0.2), opH = [op.x, 1.9, op.z];
    return U.film(t) + U.bigTitle(t, 0.5, tB - 0.2, 'GINEBRA, SUIZA', 'La Cumbre', 'Para calmar las cosas', { top: 70 })
      + U.popCard(t, tCaos - 0.1, tC, 'ESTADO DE LA CUMBRE', 'Caos total', '', { x: 1520, y: 120, w: 420, accent: '#e84a5f', icon: '🌀' })
      + emoji(ctx, opH, '🎶', notes, 72) + emoji(ctx, [agnes.st.x, 1.6, agnes.st.z], '💫', fade(t, tDes, tC, 0.15), 64)
      + U.bubble(ctx, [cr.x, 1.75, cr.z], '¿Y si lo decidimos<br>como umamusume?', fade(t, tAcu + 0.3, tCar - 0.4, 0.2), { size: 30 })
      + U.bigTitle(t, tCar - 0.1, ctx.dur + 1, '¡QUE LO DECIDA', 'una carrera!', '', { top: 80 });
  };

  const sfx = [
    { t: 0, type: 'crowd', dur: tB, vol: 0.25 }, { t: tFall0, type: 'wind', dur: tLand - tFall0, vol: 0.4 }, { t: tLand, type: 'thud', vol: 0.5 },
    { t: tOp, type: 'choir', dur: tAg + 0.8 - tOp, vol: 0.35 }, { t: tDes, type: 'thud', vol: 0.3 }, { t: tVec, type: 'thud', vol: 0.3 },
    { t: tCr, type: 'pop', vol: 0.3 }, { t: tUma, type: 'sting', vol: 0.25 }, { t: tCar, type: 'cheer', vol: 0.5 }, { t: tCar + 0.1, type: 'fanfare', vol: 0.35 },
  ];
  const opS = opera.st, agS = agnes.st, crS = creek.st;
  const toward = (st, d, h) => [st.x * (1 - d / 4.75), h, st.z * (1 - d / 4.75)];   // a point d metres inward from a seat
  // close-ups from just above the table ring, a little to one side of the seat (the ring would hide her at table height)
  const near = (st, h, side = 1) => { const a = st.a + side * 0.2, r = 3.95; return [Math.sin(a) * r, h, Math.cos(a) * r]; };
  const shots = [
    { t0: 0, set: Sm, p0: [0, 7.2, 9.5], l0: [0, 1.0, 0], p1: [2.5, 5.8, 8.5], l1: [0, 1.2, 0], fov0: 50, act },
    { t0: tB, set: Sm, p0: [0.3, 1.3, 5.8], l0: [0, 3.8, 0.6], p1: [0.2, 1.25, 5.4], l1: [0, 1.3, 0.6], fov0: 50, act: t => { const h = act(t), g = golshi.root.position; ctx.camera.lookAt(g.x, Math.max(1.2, g.y + 1.6), g.z); return h; } },
    { t0: tB2, set: Sm, p0: near(opS, 1.24, -1), l0: [opS.x, 1.12, opS.z], p1: near(opS, 1.22, -0.8), l1: [opS.x, 1.16, opS.z], fov0: 40, act },
    { t0: tB3, set: Sm, p0: near(agS, 1.35, -1), l0: [agS.x, 0.95, agS.z], p1: near(agS, 1.3, -0.8), l1: [agS.x, 0.92, agS.z], fov0: 40, act },
    { t0: tC, set: Sm, p0: near(crS, 1.3), l0: [crS.x, 1.08, crS.z], p1: near(crS, 1.26, 0.8), l1: [crS.x, 1.14, crS.z], fov0: 40, act },
    { t0: tC2, set: Sm, p0: [-0.8, 3.3, 7.6], l0: [0.6, 0.9, 0], p1: [-0.5, 3.0, 7.0], l1: [0.8, 0.9, 0], fov0: 55, act },
    { t0: tC3, set: Sm, p0: [0, 6.4, 8.2], l0: [0, 1.0, 0], p1: [0, 5.0, 7.0], l1: [0, 1.1, 0], fov0: 52, act },
  ];
  const inst = { scene: Sm, scenes: [Sm], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
