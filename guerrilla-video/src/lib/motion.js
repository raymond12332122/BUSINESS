// Fluid full-body motion for the rigs in chars.js. Opt-in per rig: enhance(rig) wraps rig.apply(pose) and adds
//  - leg IK: pose.fL / pose.fR move each ankle target (chibi units, model axes, relative to its rest spot), so the feet stay
//    planted while the hips sway, bob or crouch; pose.heelL / heelR lift the heel (the toe stays down); pose.legIK blends to FK;
//  - fingers: pose.hL / pose.hR = [curl, thumb, spread, index, middle] (0..1; index/middle = 1 keeps that finger straight);
//  - long hair that hangs under gravity instead of swinging rigidly with the head, skirts and coat tails that make room for
//    the thighs, tails and hair with follow-through from pose.sec = { bob, sway, wind };
//  - collision: elbows, forearms and hands stay outside the body's own shape (a torso/skirt map, a head map and thigh
//    capsules measured from the mesh), long hair stays outside the back; the upper arm (or the lock of hair) turns about
//    its joint just enough;
//  - pose.look = [x, y, z] (world) turns chest, neck and head towards a point; pose.ears = [left, right] tilts the ears.
// Pose generators here (stand, gait, travel) are pure functions of time/distance, so any frame renders on its own.
import * as THREE from 'three';

const D2R = THREE.MathUtils.DEG2RAD;
const V = () => new THREE.Vector3(), Q = () => new THREE.Quaternion();
const _v = [V(), V(), V(), V(), V(), V()], _q = [Q(), Q(), Q(), Q()], _m = [new THREE.Matrix4(), new THREE.Matrix4()], _e = new THREE.Euler(0, 0, 0, 'YXZ');
const UP = new THREE.Vector3(0, 1, 0), ID = new THREE.Quaternion();
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const wpos = (o, out) => out.setFromMatrixPosition(o.matrixWorld);
const wquat = (o, out) => { o.matrixWorld.decompose(_v[5], out, _v[4]); return out; };
const findJ = (bones, n) => bones.find(b => b.name === n || (b.name.startsWith(n + '_') && /^\d+$/.test(b.name.slice(n.length + 1))));
const eulerQ = (r, out) => out.setFromEuler(_e.set(r[0] * D2R, r[1] * D2R, r[2] * D2R, 'YXZ'));
// local rotation for a delta given in model axes at the parent's rest frame (same convention as Rig.apply)
const deltaLocal = (J, dq, out) => out.copy(J.Ci).multiply(dq).multiply(J.C).multiply(J.rest);

// Hand shapes: [curl, thumb, spread, index straight, middle straight].
export const HAND = {
  relax: [0.28, 0.25, 0.15, 0, 0], soft: [0.18, 0.12, 0.2, 0, 0], open: [0.04, 0.02, 0.7, 0, 0], flat: [0, 0, 0.05, 0, 0],
  fist: [1, 0.85, 0, 0, 0], grip: [0.66, 0.55, 0, 0, 0], pinch: [0.45, 0.6, 0.1, 0, 0], point: [1, 0.8, 0, 1, 0], peace: [1, 0.8, 0.6, 1, 1],
};

export function enhance(rig) {
  if (rig.mo) return rig;
  const R = rig.root; R.updateWorldMatrix(true, true);
  const inv = new THREE.Matrix4().copy(R.matrixWorld).invert(), rq = wquat(R, Q()).invert();
  const bones = []; rig.model.traverse(o => { if (o.isBone) bones.push(o); });
  const rs = b => wpos(b, V()).applyMatrix4(inv);                 // rest position, root space
  const rqs = b => rq.clone().multiply(wquat(b, Q()));              // rest orientation, root space
  const Jof = b => { const C = rqs(b.parent); return { bone: b, rest: b.quaternion.clone(), C, Ci: C.clone().invert() }; };
  const mo = rig.mo = { fingers: { L: [], R: [] }, hair: [], skirt: [], tail: [], ears: [], y0: rig.model.position.y };
  const J = rig.j, u = rig.unit;
  // ---- legs
  mo.legs = {};
  for (const s of ['L', 'R']) {
    const T = J['th' + s], K = J['kn' + s], A = J['an' + s];
    const pT = rs(T.bone), pK = rs(K.bone), pA = rs(A.bone);
    mo.legs[s] = { T, K, A, a: pT.distanceTo(pK), b: pK.distanceTo(pA), dirA: pK.clone().sub(pT).normalize(), dirE: pA.clone().sub(pK).normalize(),
      ank: pA, ankQ: rqs(A.bone), kneeRest: pK, thighRest: pT };
  }
  mo.foot = 0.04 * u;   // ankle-to-ball length (heel lifts pivot about the ball)
  // ---- fingers (chibis have mitten hands: index, ring and thumb with two segments)
  for (const s of ['L', 'R']) for (const f of ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky']) {
    const segs = ['01', '02', '03'].map(n => findJ(bones, `${f}_${n}_${s}`)).filter(Boolean);
    if (segs.length) mo.fingers[s].push({ f, segs: segs.map(Jof) });
  }
  // ---- spring-bone chains: hair on the head, skirts/coat tails on the hips, the tail, the ears
  const chain = (root, pre) => { const out = [root]; for (let b = root; ;) { const c = b.children.find(x => x.isBone && x.name.startsWith(pre) && !/Handle|_end/.test(x.name)); if (!c) break; out.push(c); b = c; } return out; };
  const tipOf = list => { const last = list[list.length - 1], h = last.children.find(x => x.isBone); return h ? rs(h) : rs(last).add(rs(last).sub(rs(list.length > 1 ? list[list.length - 2] : last.parent)).multiplyScalar(0.5)); };
  const headP = rs(J.head.bone), hipP = rs(J.hip.bone), neckP = rs(J.neck.bone);
  for (const b of bones) {
    const p = b.parent?.name || '';
    if (b.name.startsWith('Sp_He_Hair') && !p.startsWith('Sp_He_Hair')) {
      const list = chain(b, 'Sp_He_Hair'), r0 = rs(b), tip = tipOf(list), rad = r0.clone().sub(headP).setY(0);
      mo.hair.push({ J: Jof(b), list: list.map(Jof), r0, tip, rad: rad.lengthSq() > 1e-10 ? rad.normalize() : new THREE.Vector3(0, 0, -1), len: r0.distanceTo(tip), drop: r0.y - tip.y });
    } else if (/^Sp_(Hi|Wa)_/.test(b.name) && !/Tail/.test(b.name) && !p.startsWith('Sp_')) {
      const list = chain(b, b.name.slice(0, 5)), r0 = rs(b), tip = tipOf(list), rad = r0.clone().sub(hipP).setY(0);
      if (rad.lengthSq() < 1e-10) continue;
      mo.skirt.push({ J: Jof(b), sub: list.slice(1).map(x => ({ ...Jof(x), d: rs(x).distanceTo(r0) })), r0, tip, len: r0.distanceTo(tip), rad: rad.normalize(), az: Math.atan2(rad.x, rad.z) });
    } else if (b.name.startsWith('Sp_Hi_Tail') && !p.startsWith('Sp_Hi_Tail')) mo.tail = chain(b, 'Sp_Hi_Tail').map(Jof);
    else if (/^Sp_He_Ear\d?_[LR]_00/.test(b.name)) mo.ears.push({ J: Jof(b), side: /_L_/.test(b.name) ? 0 : 1 });
  }
  mo.skirt.sort((a, b) => a.az - b.az);
  // head rest orientation (for hair gravity), hip rest frame (for skirts)
  mo.hipC = hipP; mo.headQ0 = rqs(J.head.bone); mo.hipM0 = new THREE.Matrix4().multiplyMatrices(inv, J.hip.bone.matrixWorld); mo.hipQ0 = rqs(J.hip.bone);
  const H = (rig.big ? 1 : 0.45);   // hair longer than this share of the head size hangs under gravity
  const headR = Math.max(0.05, (headP.y - neckP.y) * 2.2);
  for (const h of mo.hair) h.k = clamp((h.drop - 0.25 * headR * H) / (0.9 * headR * H)) * clamp(h.len / (0.5 * headR));
  buildShape(rig, mo, inv);
  const base = rig.apply.bind(rig);
  rig.apply = pose => apply(rig, pose, base);
  return rig;
}

// ------------------------------------------------------------------ body shape (measured once from the skinned mesh)
function buildShape(rig, mo, inv) {
  const J = rig.j, R = rig.root;
  const rs = b => wpos(b, V()).applyMatrix4(inv);
  const P = k => rs(J[k].bone);
  const hip = P('hip'), waist = P('waist'), chest = P('chest'), neck = P('neck'), head = P('head'), thL = P('thL'), knL = P('knL');
  const under = (b, a) => { for (let x = b; x; x = x.parent) if (x === a) return true; return false; };
  const cls = new Map();
  const classify = b => {
    if (cls.has(b)) return cls.get(b);
    let c = 'torso';
    if (under(b, J.armL.bone) || under(b, J.armR.bone) || /Roll|Elbow|Wrist|Hand|Index|Middle|Ring|Pinky|Thumb/.test(b.name)) c = 'arm';
    else if (under(b, J.head.bone)) { let sp = false; for (let x = b; x && x !== J.head.bone; x = x.parent) if (x.name.startsWith('Sp_')) sp = true; c = sp ? 'hair' : 'head'; }   // skull, face and hair cap; locks, ears and ribbons swing free
    else if (under(b, J.thL.bone) || under(b, J.thR.bone)) c = under(b, J.knL.bone) || under(b, J.knR.bone) ? 'shin' : 'thigh';
    cls.set(b, c); return c;
  };
  const y0 = knL.y + 0.3 * (thL.y - knL.y), y1 = neck.y + 0.15 * (head.y - neck.y), zc = hip.z;
  const NY = 34, NA = 36, tor = new Float32Array(NY * NA);
  const HP = 12, HA = 24, hd = new Float32Array(HP * HA);
  const hv = [], thv = { L: [], R: [] }, fore = { L: [], R: [] }, hand = { L: [], R: [] };
  const v = V(), sk = new THREE.Vector4(), sw = new THREE.Vector4();
  R.traverse(o => {
    if (!o.isSkinnedMesh || !o.visible) return;
    const g = o.geometry, pos = g.attributes.position, si = g.attributes.skinIndex, swa = g.attributes.skinWeight, n = pos.count, step = n > 60000 ? 3 : n > 20000 ? 2 : 1;
    for (let i = 0; i < n; i += step) {
      sk.fromBufferAttribute(si, i); sw.fromBufferAttribute(swa, i);
      let bi = sk.x, bw = sw.x; if (sw.y > bw) { bi = sk.y; bw = sw.y; } if (sw.z > bw) { bi = sk.z; bw = sw.z; } if (sw.w > bw) { bi = sk.w; bw = sw.w; }
      const bone = o.skeleton.bones[bi]; if (!bone) continue;
      v.fromBufferAttribute(pos, i); o.applyBoneTransform(i, v); v.applyMatrix4(o.matrixWorld).applyMatrix4(inv);
      const c = classify(bone);
      if (c === 'torso') {
        if (v.y < y0 || v.y >= y1) continue;
        const iy = Math.floor((v.y - y0) / (y1 - y0) * NY), dz = v.z - zc, ia = Math.floor(((Math.atan2(v.x, dz) / (2 * Math.PI) + 1) % 1) * NA) % NA, r = Math.hypot(v.x, dz);
        if (r > tor[iy * NA + ia]) tor[iy * NA + ia] = r;
      } else if (c === 'head') { if (v.y > neck.y + 0.25 * (head.y - neck.y)) hv.push(v.clone()); }
      else if (c === 'thigh') { const s = under(bone, J.thL.bone) ? 'L' : 'R'; thv[s].push(v.clone()); }
      else if (c === 'arm') {
        const s = under(bone, J.armL.bone) || /_L(_|$)/.test(bone.name) ? 'L' : 'R';
        if (under(bone, J['wri' + s].bone)) hand[s].push(v.clone()); else if (under(bone, J['elb' + s].bone)) fore[s].push(v.clone());
      }
    }
  });
  fillMap(tor, NY, NA);
  mo.tor = { map: tor, NY, NA, y0, y1, zc };
  // frames: chest above the chest joint, waist above the waist joint, hip below
  const fr = k => ({ bone: J[k].bone, M0: new THREE.Matrix4().multiplyMatrices(inv, J[k].bone.matrixWorld), inv: new THREE.Matrix4(), R: new THREE.Quaternion() });
  mo.frames = [{ ...fr('chest'), yMin: chest.y }, { ...fr('waist'), yMin: waist.y }, { ...fr('hip'), yMin: -1e9 }];
  for (const f of mo.frames) f.M0q = new THREE.Quaternion().setFromRotationMatrix(f.M0).invert();
  // head: radius per direction around the centre of the head's own vertices
  const bb = new THREE.Box3().setFromPoints(hv.length ? hv : [head]), hc = bb.getCenter(V());
  for (const p of hv) { const d = p.clone().sub(hc), r = d.length(); if (r < 1e-6) continue;
    const ip = Math.min(HP - 1, Math.floor(Math.acos(clamp(d.y / r, -1, 1)) / Math.PI * HP)), ia = Math.floor(((Math.atan2(d.x, d.z) / (2 * Math.PI) + 1) % 1) * HA) % HA;
    if (r > hd[ip * HA + ia]) hd[ip * HA + ia] = r; }
  fillMap(hd, HP, HA);
  mo.head = { map: hd, HP, HA, c: hc, M0: new THREE.Matrix4().multiplyMatrices(inv, J.head.bone.matrixWorld), inv: new THREE.Matrix4(), R: new THREE.Quaternion() };
  mo.head.M0q = new THREE.Quaternion().setFromRotationMatrix(mo.head.M0).invert();
  // capsule radii from the vertices around each segment (75th percentile distance)
  const segR = (pts, a, b, q = 0.75) => { if (pts.length < 8) return null; const ab = b.clone().sub(a), L2 = ab.lengthSq(); const ds = pts.map(p => { const t = clamp(p.clone().sub(a).dot(ab) / L2); return p.distanceTo(a.clone().addScaledVector(ab, t)); }).sort((x, y) => x - y); return ds[Math.floor(ds.length * q)]; };
  mo.arm = {}; mo.thigh = {};
  for (const s of ['L', 'R']) {
    const e = P('elb' + s), w = P('wri' + s), hp = hand[s];
    const dir = w.clone().sub(e).normalize();
    let len = 0; for (const p of hp) len = Math.max(len, p.clone().sub(w).dot(dir));
    len = len || 0.06 * (rig.ratio || 1);
    const tip = w.clone().addScaledVector(dir, len);
    // the arm itself, not loose cloth around it: puffy sleeves and frilled cuffs may brush the body
    const cap = 0.017 * (rig.ratio || 1);
    mo.arm[s] = { rF: Math.min(cap, segR(fore[s], e, w, 0.5) || cap), rH: Math.min(cap, segR(hp, w, tip, 0.5) || cap), len,
      handDir0: dir.clone().applyQuaternion(rqsOf(J['wri' + s].bone, inv).invert()) };
    mo.thigh[s] = { r: segR(thv[s], P('th' + s), P('kn' + s), 0.8) || 0.03 * (rig.unit || 1) };
  }
  mo.margin = 0.006 * (rig.ratio || 1);
  mo.body = { hipY: hip.y, neckY: neck.y, zc, sh: Math.abs(P('armL').x) };
}
// A point on/around the body from normalized coordinates, root space at rest (the frame arm IK targets live in).
//  torso [u, v, w]: v = 0 hip joint .. 1 neck; u = 1 / -1 on her left / right side surface; w = 1 on the front surface (0 = centre, -1 back)
//  head ['head', u, v, w]: unit = the head's radius in that direction, from the head's centre
export function bodyPoint(rig, a, out = new THREE.Vector3()) {
  const mo = rig.mo, T = mo.tor;
  if (a[0] === 'head') {
    const H = mo.head, rAt = (pol, az) => lookup(H.map, H.HP, H.HA, pol / Math.PI * H.HP - 0.5, ((az / (2 * Math.PI) + 1) % 1) * H.HA - 0.5);
    const [, u, v, w] = a;
    return out.set(u * rAt(Math.PI / 2, u >= 0 ? Math.PI / 2 : -Math.PI / 2), v * rAt(v >= 0 ? 0.3 : Math.PI - 0.3, 0), w * rAt(Math.PI / 2, w >= 0 ? 0 : Math.PI)).add(H.c);
  }
  const [u, v, w] = a, B = mo.body, y = B.hipY + v * (B.neckY - B.hipY);
  const fr = (T.y1 > T.y0) ? clamp((y - T.y0) / (T.y1 - T.y0) * T.NY - 0.5, 0, T.NY - 1) : 0, rAt = az => lookup(T.map, T.NY, T.NA, fr, ((az / (2 * Math.PI) + 1) % 1) * T.NA - 0.5);
  return out.set(u * rAt(u >= 0 ? Math.PI / 2 : -Math.PI / 2), y, B.zc + w * rAt(w >= 0 ? 0 : Math.PI));
}
// Normalized hand targets (pose.aL / aR, see bodyPoint) become arm-IK targets; pose.aWL / aWR (0..1) blend them with
// where the FK arms would put the wrists, so FK and contact poses cross-fade without pops.
function handTargets(rig, pose, base) {
  const R = rig.root, fkW = {}, need = ['L', 'R'].some(s => pose['a' + s] && (pose['aW' + s] ?? 1) < 1);
  const inv = new THREE.Matrix4(), chestRest = new THREE.Matrix4().copy(rig.chestRestInv).invert();
  if (need) {
    const p2 = { ...pose }; delete p2.aL; delete p2.aR; delete p2.ikL; delete p2.ikR; base(p2); R.updateWorldMatrix(true, true);
    inv.copy(R.matrixWorld).invert();
    const toRest = new THREE.Matrix4().multiplyMatrices(inv, rig.j.chest.bone.matrixWorld).invert().premultiply(chestRest);
    for (const s of ['L', 'R']) fkW[s] = { w: wpos(rig.j['wri' + s].bone, V()).applyMatrix4(inv).applyMatrix4(toRest), e: wpos(rig.j['elb' + s].bone, V()).applyMatrix4(inv), sh: wpos(rig.j['arm' + s].bone, V()).applyMatrix4(inv), wc: wpos(rig.j['wri' + s].bone, V()).applyMatrix4(inv) };
  }
  for (const s of ['L', 'R']) {
    const a = pose['a' + s]; if (!a) continue;
    const w = pose['aW' + s] ?? 1, T = bodyPoint(rig, a);
    if (w < 1) T.lerpVectors(fkW[s].w, T, w);
    pose['ik' + s] = T.toArray();
    const def = new THREE.Vector3(...(pose['pl' + s] || [s === 'L' ? 0.7 : -0.7, -1, -0.25]));
    if (w < 1) { const F = fkW[s], dir = F.wc.clone().sub(F.sh).normalize(), pe = F.e.clone().sub(F.sh); pe.addScaledVector(dir, -pe.dot(dir));
      if (pe.lengthSq() > 1e-10) def.normalize().lerp(pe.normalize(), 1 - w); }
    pose['pole' + s] = def.toArray();
  }
}
function rqsOf(b, inv) { const q = Q(); inv.decompose(_v[0], q, _v[1]); return q.multiply(wquat(b, Q())); }
// Fill empty bins of a (rows x cols, cols wrap) radius map from their neighbours, then dilate one bin (conservative).
function fillMap(m, NR, NC) {
  for (let pass = 0; pass < 2 * NC; pass++) {
    let empty = 0;
    for (let i = 0; i < NR; i++) for (let j = 0; j < NC; j++) {
      if (m[i * NC + j] > 0) continue; empty++;
      let s = 0, n = 0;
      for (const [di, dj] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const a = i + di, b = (j + dj + NC) % NC; if (a < 0 || a >= NR) continue; const x = m[a * NC + b]; if (x > 0) { s += x; n++; } }
      if (n) m[i * NC + j] = -s / n;   // negative marks "filled this pass"
    }
    for (let k = 0; k < m.length; k++) if (m[k] < 0) m[k] = -m[k];
    if (!empty) break;
  }
  const c = m.slice();
  for (let i = 0; i < NR; i++) for (let j = 0; j < NC; j++) {
    let x = c[i * NC + j];
    for (const [di, dj] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const a = i + di, b = (j + dj + NC) % NC; if (a >= 0 && a < NR) x = Math.max(x, c[a * NC + b] * 0.985); }
    m[i * NC + j] = x;
  }
}
const lookup = (m, NR, NC, fr, fc) => {   // bilinear, rows clamped, columns wrapped
  const r0 = clamp(Math.floor(fr), 0, NR - 1), r1 = Math.min(NR - 1, r0 + 1), tr = clamp(fr - r0), c0 = ((Math.floor(fc) % NC) + NC) % NC, c1 = (c0 + 1) % NC, tc = fc - Math.floor(fc);
  return (m[r0 * NC + c0] * (1 - tc) + m[r0 * NC + c1] * tc) * (1 - tr) + (m[r1 * NC + c0] * (1 - tc) + m[r1 * NC + c1] * tc) * tr;
};
// Penetration depth of a world point into the torso map (0 if outside); writes the outward normal (world) into n.
function torsoDepth(mo, P, rad, n) {
  const T = mo.tor, p = _v[0];
  for (const F of mo.frames) {
    p.copy(P).applyMatrix4(F.inv).applyMatrix4(F.M0);
    if (p.y < F.yMin) continue;
    if (p.y < T.y0 || p.y >= T.y1) return 0;
    const dz = p.z - T.zc, r = Math.hypot(p.x, dz); if (r < 1e-6) return 0;
    const rm = lookup(T.map, T.NY, T.NA, (p.y - T.y0) / (T.y1 - T.y0) * T.NY - 0.5, ((Math.atan2(p.x, dz) / (2 * Math.PI) + 1) % 1) * T.NA - 0.5);
    const d = rm + rad + mo.margin - r; if (d <= 0) return 0;
    n.set(p.x / r, 0, dz / r).applyQuaternion(F.M0q).applyQuaternion(F.R); return d;
  }
  return 0;
}
function headDepth(mo, P, rad, n) {
  const H = mo.head, p = _v[0].copy(P).applyMatrix4(H.inv).applyMatrix4(H.M0).sub(H.c), r = p.length(); if (r < 1e-6) return 0;
  const rm = lookup(H.map, H.HP, H.HA, Math.acos(clamp(p.y / r, -1, 1)) / Math.PI * H.HP - 0.5, ((Math.atan2(p.x, p.z) / (2 * Math.PI) + 1) % 1) * H.HA - 0.5);
  const d = rm + rad + mo.margin - r; if (d <= 0) return 0;
  n.copy(p).multiplyScalar(1 / r).applyQuaternion(H.M0q).applyQuaternion(H.R); return d;
}
function capsuleDepth(P, a, b, r, n) {
  const ab = _v[1].copy(b).sub(a), t = clamp(_v[2].copy(P).sub(a).dot(ab) / Math.max(1e-9, ab.lengthSq()));
  const c = _v[2].copy(a).addScaledVector(ab, t), d = P.distanceTo(c); if (d >= r || d < 1e-7) return 0;
  n.copy(P).sub(c).multiplyScalar(1 / d); return r - d;
}

// ------------------------------------------------------------------ per-frame solve
function apply(rig, pose, base) {
  const mo = rig.mo, J = rig.j, R = rig.root;
  if (pose.look) lookAt(rig, pose);
  if (pose.aL || pose.aR) handTargets(rig, pose, base);
  base(pose);
  rig.model.position.y = mo.y0 + (pose.lift || 0) * rig.unit;   // hops and jumps: the whole body leaves the ground
  R.updateWorldMatrix(true, true);
  const rootQ = wquat(R, Q()), rootQi = rootQ.clone().invert();
  if ((pose.fL || pose.fR) && (pose.legIK ?? 1) > 0) for (const s of ['L', 'R']) solveLeg(rig, s, pose, rootQ, rootQi);
  hands(mo, pose);
  ears(mo, pose);
  hair(rig, pose, rootQ, rootQi);
  skirt(rig, pose, rootQ, rootQi);
  tail(mo, pose);
  R.updateWorldMatrix(false, true);
  collideArms(rig, pose);
}

function lookAt(rig, pose) {
  const hp = wpos(rig.j.head.bone, _v[0]), d = _v[1].fromArray(pose.look).sub(hp).applyQuaternion(wquat(rig.root, _q[0]).invert());
  const w = pose.lookW ?? 1;
  const yaw = clamp(Math.atan2(d.x, d.z) / D2R, -80, 80) * w, pitch = clamp(Math.atan2(d.y, Math.hypot(d.x, d.z)) / D2R, -35, 30) * w;
  const add = (k, x, y) => { const r = pose[k] ? pose[k].slice() : [0, 0, 0]; r[0] += x; r[1] += y; pose[k] = r; };
  add('chest', -0.15 * pitch, 0.22 * yaw); add('neck', -0.3 * pitch, 0.28 * yaw); add('head', -0.45 * pitch, 0.42 * yaw);
}

function solveLeg(rig, s, pose, rootQ, rootQi) {
  const L = rig.mo.legs[s], R = rig.root, w = pose.legIK ?? 1, u = rig.unit;
  const off = pose['f' + s] || [0, 0, 0], heel = (pose['heel' + s] || 0) * D2R;
  // ankle target (root space): rest spot + offset; a lifted heel raises the ankle about the ball of the foot
  const T = _v[0].set(off[0], off[1], off[2]).multiplyScalar(u).add(L.ank);
  if (heel > 0) { T.y += rig.mo.foot * Math.sin(heel); T.z += rig.mo.foot * (1 - Math.cos(heel)); }
  const inv = _m[0].copy(R.matrixWorld).invert();
  const S = wpos(L.T.bone, _v[1]).applyMatrix4(inv);
  const dir = _v[2].copy(T).sub(S); let d = dir.length(); dir.normalize();
  d = clamp(d, Math.abs(L.a - L.b) * 1.05 + 1e-4, (L.a + L.b) * 0.9995);
  const x = (L.a * L.a - L.b * L.b + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L.a * L.a - x * x));
  const pole = _v[3].set(s === 'L' ? 0.12 : -0.12, 0, 1).applyEuler(_e.set(0, ((pose['fy' + s] || 0)) * D2R, 0, 'YXZ'));
  pole.addScaledVector(dir, -pole.dot(dir)).normalize();
  const E = _v[4].copy(S).addScaledVector(dir, x).addScaledVector(pole, h);
  const uA = E.clone().sub(S).normalize(), uE = T.clone().sub(E).normalize();
  // thigh: rotate its rest direction onto uA, relative to the hip's current delta
  const parentNow = rootQi.clone().multiply(wquat(L.T.bone.parent, _q[0]));
  const Dp = parentNow.multiply(L.T.C.clone().invert());
  const Dth = new THREE.Quaternion().setFromUnitVectors(L.dirA, uA);
  const yawQ = new THREE.Quaternion().setFromAxisAngle(uA, (pose['fy' + s] || 0) * D2R);   // turn the knee/foot out about the thigh
  Dth.premultiply(yawQ);
  const qT = deltaLocal(L.T, Dp.clone().invert().multiply(Dth), Q());
  const fl = uE.clone().applyQuaternion(Dth.clone().invert());
  const qK = deltaLocal(L.K, new THREE.Quaternion().setFromUnitVectors(L.dirE, fl), Q());
  if (w < 1) { L.T.bone.quaternion.slerp(qT, w); L.K.bone.quaternion.slerp(qK, w); } else { L.T.bone.quaternion.copy(qT); L.K.bone.quaternion.copy(qK); }
  L.T.bone.updateMatrixWorld(true);
  // ankle: flat on the ground (rest orientation in root space), pitched by the heel lift, turned with the foot
  const want = new THREE.Quaternion().setFromEuler(_e.set(heel, (pose['fy' + s] || 0) * D2R, 0, 'YXZ')).multiply(L.ankQ);
  const kneeNow = rootQi.clone().multiply(wquat(L.K.bone, _q[1]));
  const qA = kneeNow.invert().multiply(want);
  if (w < 1) L.A.bone.quaternion.slerp(qA, w); else L.A.bone.quaternion.copy(qA);
  L.A.bone.updateMatrixWorld(true);
}

function hands(mo, pose) {
  for (const s of ['L', 'R']) {
    const h = pose['h' + s] || HAND.relax, sg = s === 'L' ? -1 : 1;
    for (const F of mo.fingers[s]) {
      const n = F.segs.length;
      if (F.f === 'Thumb') {
        const c = h[1];
        F.segs.forEach((J, i) => { const a = [26, 30, 26][n === 2 ? i * 2 : i] * c; eulerQ([a, i === 0 ? -sg * 22 * c : 0, sg * 6 * c * (i === 0)], _q[0]); J.bone.quaternion.copy(deltaLocal(J, _q[0], _q[1])); });
        continue;
      }
      const straight = F.f === 'Index' ? h[3] : F.f === 'Middle' ? h[4] : 0;
      const extra = { Index: -0.08, Middle: 0, Ring: 0.06, Pinky: 0.12 }[F.f];
      const c = clamp(h[0] * (1 - straight) + extra * h[0]), spr = { Index: 1, Middle: 0.3, Ring: -0.4, Pinky: -1 }[F.f] * h[2] * 9 * (1 - 0.6 * c);
      F.segs.forEach((J, i) => { const a = (n === 2 ? [78, 150][i] : [74, 92, 64][i]) * c; eulerQ([0, i === 0 ? sg * spr : 0, sg * a], _q[0]); J.bone.quaternion.copy(deltaLocal(J, _q[0], _q[1])); });
    }
  }
}

function ears(mo, pose) {
  const e = pose.ears; if (!mo.ears.length) return;
  for (const E of mo.ears) {
    const a = e ? e[E.side] : 0, droop = pose.earDroop || 0;
    eulerQ([a, 0, (E.side ? 1 : -1) * droop], _q[0]); E.J.bone.quaternion.copy(deltaLocal(E.J, _q[0], _q[1]));
  }
}

// Long hair hangs: undo part of the head's rotation at each lock's root, then add follow-through from the body's motion.
function hair(rig, pose, rootQ, rootQi) {
  const mo = rig.mo; if (!mo.hair.length) return;
  const sec = pose.sec || {}, headNow = rootQi.clone().multiply(wquat(rig.j.head.bone, _q[0]));
  const dHead = headNow.multiply(_q[1].copy(mo.headQ0).invert());          // head rotation since rest (root space)
  const undo = dHead.clone().invert();
  for (const h of mo.hair) {
    const J = h.J, k = h.k * (pose.hairK ?? 0.75); if (k <= 0.01 && !sec.wind) { J.bone.quaternion.copy(J.rest); continue; }
    const Pn = rootQi.clone().multiply(wquat(J.bone.parent, _q[2]));       // parent (head) now, root space
    const W = Pn.clone().multiply(J.rest);                                  // lock's orientation if it followed the head rigidly
    const corr = new THREE.Quaternion().slerp(undo, k);
    // follow-through: lift outward with the bob, swing sideways with the sway, stream back with the wind
    const out = _v[0].copy(h.rad).applyQuaternion(dHead).setY(0); if (out.lengthSq() < 1e-8) out.set(0, 0, -1); out.normalize();
    const ax = _v[1].crossVectors(out, UP).normalize();
    const lift = ((sec.bob || 0) * 7 + Math.abs(sec.wind || 0) * 8) * D2R * Math.min(1, h.k + 0.2);
    const dyn = new THREE.Quaternion().setFromAxisAngle(ax, lift)
      .multiply(_q[3].setFromAxisAngle(_v[2].set(1, 0, 0), (sec.wind || 0) * 26 * D2R * (0.4 + 0.6 * h.k)))
      .multiply(new THREE.Quaternion().setFromAxisAngle(_v[2].set(0, 0, 1), (sec.sway || 0) * 9 * D2R * h.k));
    const Wn = dyn.multiply(corr).multiply(W);
    J.bone.quaternion.copy(Pn.invert().multiply(Wn));
  }
}

// Skirts and coat tails swing out of the way of the thighs (each panel clears the knee by the thigh's radius).
function skirt(rig, pose, rootQ, rootQi) {
  const mo = rig.mo; if (!mo.skirt.length) return;
  rig.root.updateWorldMatrix(false, true);
  const inv = _m[0].copy(rig.root.matrixWorld).invert();
  const hipM = _m[1].multiplyMatrices(inv, rig.j.hip.bone.matrixWorld).invert().premultiply(mo.hipM0);   // root space now -> hip rest frame
  const knees = ['L', 'R'].map(s => ({ k: wpos(rig.j['kn' + s].bone, V()).applyMatrix4(inv).applyMatrix4(hipM), k0: mo.legs[s].kneeRest, r: mo.thigh[s].r, t0: mo.legs[s].thighRest }));
  const sec = pose.sec || {}, push = [];
  for (const S of mo.skirt) {
    let best = 0;
    const st = S.tip.clone().sub(S.r0), phS = Math.atan2(st.dot(S.rad), -st.y);
    let drape = 0;
    for (const K of knees) {
      const dk = K.k.clone().sub(K.k0).setY(0); if (dk.lengthSq() < 1e-10) continue;
      const fromHip = K.k.clone().sub(mo.hipC).setY(0); if (fromHip.lengthSq() < 1e-10) continue;
      const wLat = ss(0.45, 0.92, fromHip.normalize().dot(S.rad));
      if (wLat <= 0) continue;
      // the point of the thigh level with this panel's hem (the knee, if the panel reaches past it)
      const A = K.k.clone().sub(K.t0), B = K.t0.clone().sub(S.r0), aa = A.lengthSq(), ab = A.dot(B), disc = ab * ab - aa * (B.lengthSq() - S.len * S.len);
      const tt = disc < 0 ? 1 : clamp((-ab + Math.sqrt(disc)) / aa);
      const uk = A.multiplyScalar(tt).add(B), dist = uk.length(), phK = Math.atan2(uk.dot(S.rad), -uk.y);
      const marg = Math.asin(clamp(K.r * 1.15 / Math.max(dist, 1e-6), 0, 0.95)), need = (phK + marg - phS) * wLat;
      if (need > best) { best = need; const kd = K.k.distanceTo(S.r0); drape = tt >= 1 && S.len > 1.05 * kd ? kd : 0; }
    }
    push.push(Math.max(0, best)); S.drape = drape;
  }
  // neighbouring panels follow each other a little so the hem stays smooth
  const n = push.length, sm = push.map((p, i) => Math.max(p, 0.42 * push[(i + 1) % n], 0.42 * push[(i - 1 + n) % n]));
  const dHip = rootQi.clone().multiply(wquat(rig.j.hip.bone, _q[0])).multiply(_q[1].copy(mo.hipQ0).invert());
  mo.skirt.forEach((S, i) => {
    const J = S.J, back = Math.max(0, -S.rad.z);
    const ang = Math.min(1.45, sm[i]) + ((sec.bob || 0) * 3 + Math.abs(sec.wind || 0) * 10 * back) * D2R;
    if (ang <= 1e-4) { J.bone.quaternion.copy(J.rest); for (const c of S.sub) c.bone.quaternion.copy(c.rest); return; }
    const out = _v[0].copy(S.rad).applyQuaternion(dHip), ax = _v[1].crossVectors(out, UP).normalize();
    const Pn = rootQi.clone().multiply(wquat(J.bone.parent, _q[2]));
    const W = Pn.clone().multiply(J.rest), Wn = new THREE.Quaternion().setFromAxisAngle(ax, ang).multiply(W);
    J.bone.quaternion.copy(Pn.invert().multiply(Wn));
    // long panels fold back down past the knee instead of sticking out
    for (const c of S.sub) c.bone.quaternion.copy(c.rest);
    // the fold goes at the last joint before the knee (not the hem joint), and is gentler the further it is from the knee
    const inner = S.drape && sm[i] > 0.25 ? S.sub.slice(0, -1).filter(c => c.d >= 0.45 * S.drape && c.d <= 1.2 * S.drape) : [];
    const fold = inner[inner.length - 1];
    if (fold) { J.bone.updateMatrixWorld(true); const P2 = rootQi.clone().multiply(wquat(fold.bone.parent, _q[2])), fa = 0.85 * sm[i] * Math.min(1, fold.d / S.drape);
      fold.bone.quaternion.copy(P2.clone().invert().multiply(new THREE.Quaternion().setFromAxisAngle(ax, -fa).multiply(P2.multiply(fold.rest)))); }
  });
}

function tail(mo, pose) {
  if (!mo.tail.length) return;
  const sec = pose.sec || {}, n = mo.tail.length;
  mo.tail.forEach((J, i) => { const k = (i + 1) / n; eulerQ([(sec.bob || 0) * 6 * k - (sec.wind || 0) * 10 * k, (sec.sway || 0) * 14 * k, 0], _q[0]); J.bone.quaternion.copy(deltaLocal(J, _q[0], _q[1])); });
}

// Keep elbows, forearms and hands outside the body: turn the upper arm about the shoulder just enough.
function collideArms(rig, pose) {
  const mo = rig.mo, J = rig.j;
  for (const F of mo.frames) { F.inv.copy(F.bone.matrixWorld).invert(); wquat(F.bone, F.R); }
  mo.head.inv.copy(J.head.bone.matrixWorld).invert(); wquat(J.head.bone, mo.head.R);
  const thA = { L: wpos(J.thL.bone, V()), R: wpos(J.thR.bone, V()) }, knA = { L: wpos(J.knL.bone, V()), R: wpos(J.knR.bone, V()) };
  const sc = rig.root.getWorldScale(V()).x;
  const n = V(), best = V(), tmp = V();
  for (const s of ['L', 'R']) {
    if (pose.noCollide === s || pose.noCollide === true) continue;
    const A = mo.arm[s], arm = J['arm' + s].bone, elb = J['elb' + s].bone, wri = J['wri' + s].bone;
    for (let it = 0; it < 5; it++) {
      const S = wpos(arm, V()), E = wpos(elb, V()), W = wpos(wri, V());
      const hd = A.handDir0.clone().applyQuaternion(wquat(wri, Q()));
      const pts = [[E, A.rF * 1.05], [E.clone().lerp(W, 0.5), A.rF], [W, A.rF * 0.9], [W.clone().addScaledVector(hd, A.len * 0.5 * sc), A.rH], [W.clone().addScaledVector(hd, A.len * 0.9 * sc), A.rH * 0.7]];
      let dmax = 0, P = null;
      for (const [p, r] of pts) {
        let d = torsoDepth(mo, p, r * sc, tmp); if (d > dmax) { dmax = d; best.copy(tmp); P = p; }
        d = headDepth(mo, p, r * sc, tmp); if (d > dmax) { dmax = d; best.copy(tmp); P = p; }
        for (const t of ['L', 'R']) { d = capsuleDepth(p, thA[t], knA[t], (mo.thigh[t].r + r) * sc + mo.margin, tmp); if (d > dmax) { dmax = d; best.copy(tmp); P = p; } }
      }
      if (dmax <= 1e-5) break;
      const lever = P.clone().sub(S), ax = new THREE.Vector3().crossVectors(lever, best);
      if (ax.lengthSq() < 1e-12) ax.set(0, 0, 1);
      const ang = Math.min(0.45, Math.atan2(dmax * 1.08, lever.length()));
      const qw = new THREE.Quaternion().setFromAxisAngle(ax.normalize(), ang);
      const pq = wquat(arm.parent, Q()).invert(), aq = wquat(arm, Q());
      arm.quaternion.copy(pq.multiply(qw.multiply(aq)));
      arm.updateMatrixWorld(true);
    }
  }
}

// ------------------------------------------------------------------ pose generators
const nz = (t, f, ph) => Math.sin(t * f + ph);
// Standing with life in it: slow weight shifts with a contrapposto tilt, breathing, relaxed arms and wandering glances.
export function stand(t, seed = 0, o = {}) {
  const a = o.amt ?? 1, sp = o.speed ?? 1, T = t * sp, sd = seed * 1.7;
  const shift = (0.62 * nz(T, 0.31, sd) + 0.28 * nz(T, 0.53, sd + 1.3) + 0.1 * nz(T, 1.07, sd + 2.1)) * a;
  const br = Math.sin(t * 1.5 + seed), wide = o.wide ?? 0;
  const gl = 7 * nz(T, 0.19, sd + 0.3) + 4 * nz(T, 0.43, sd + 2.2);
  return {
    hipX: 0.0095 * shift, hipY: -0.007 - 0.003 * Math.abs(shift), hipZ: 0.0015 * nz(T, 0.2, sd + 3),
    hip: [0, 2.5 * nz(T, 0.23, sd + 0.5) * a, -3.2 * shift],
    waist: [1.2 + 0.5 * br, -1.2 * nz(T, 0.23, sd + 0.5) * a, 2.0 * shift],
    chest: [0.8 - 1.4 * br, -0.8 * nz(T, 0.27, sd + 2) * a, 1.3 * shift],
    neck: [0, 0.3 * gl * a, -0.5 * shift],
    head: [2 + 2.2 * nz(T, 0.37, sd + 1) * a, 0.7 * gl * a, 2.2 * nz(T, 0.29, sd + 4) * a - 0.8 * shift],
    shL: [0, 0, 1.1 * br], shR: [0, 0, -1.1 * br],
    armL: [-3 + 2.5 * nz(T, 0.5, sd + 1) * a, 0, -77 + 2 * br + 1.2 * shift], armR: [-3 + 2.5 * nz(T, 0.5, sd + 2) * a, 0, 77 - 2 * br + 1.2 * shift],
    elbL: [0, -15 - 4 * nz(T, 0.4, sd + 1), 0], elbR: [0, 15 + 4 * nz(T, 0.4, sd + 3), 0],
    fL: [0.004 * wide, 0, 0.003], fR: [-0.004 * wide, 0, -0.003], legIK: 1, fyL: 6, fyR: -6,
    hL: HAND.relax, hR: HAND.relax,
    tail: [8 + 5 * nz(T, 0.6, sd + 1), 10 * nz(T, 0.45, sd + 2), 0],
    sec: { sway: 0.25 * shift, bob: 0.15 * br, wind: 0 },
  };
}

// Walk (run = 0) to run (run = 1) cycle driven by the distance travelled D (chibi units): the root must move D * rig.unit
// along its facing, then the stance foot stays put on the ground. amp (0..1) eases strides in and out at starts and stops.
export function gait(D, o = {}) {
  const run = o.run || 0, L = (a, b) => a + (b - a) * run, amp = o.amp ?? 1, sd = o.seed || 0;
  // R: how far a planted foot travels under the body during its stance; duty: share of the cycle on the ground
  const R0 = L(0.12, 0.14) * (o.stride || 1), duty = L(0.6, 0.34) - 0.04 * (o.sprint || 0), lam = R0 / duty, Rr = R0 * amp, lift = L(0.02, 0.075) * amp;
  const ph = D / lam + (o.phase || 0), toe = L(22, 35);
  const foot = p => {
    p = ((p % 1) + 1) % 1;
    if (p < duty) { const u = p / duty; return { z: Rr / 2 - Rr * u, y: 0, heel: toe * ss(0.62, 1, u) * amp - 8 * (1 - ss(0, 0.12, u)) * amp * (1 - run) }; }
    // swing: the foot leaves and lands at rest in the world (zero ground speed), so root-relative it starts and ends at -speed
    const v = (p - duty) / (1 - duty), e = 0.5 - 0.5 * Math.cos(Math.PI * v);
    return { z: -Rr / 2 + lam * amp * (e - v * (1 - duty)), y: lift * Math.sin(Math.PI * Math.pow(v, L(0.85, 0.7))), heel: (toe * (1 - ss(0, 0.45, v)) - L(10, 4) * ss(0.55, 0.9, v)) * amp };
  };
  const fl = foot(ph), fr = foot(ph + 0.5), pl = ph * 2 * Math.PI, mid = pl - Math.PI * duty;
  const c2 = Math.cos(2 * mid), sway = Math.cos(mid);
  const yaw = L(6, 9) * Math.cos(pl) * amp, A = L(22, 46) * amp, arm = Math.cos(pl + 0.35);
  const lean = L(2, 11 + 6 * (o.sprint || 0));
  // hips: walking rides highest over the planted foot, running dips at mid-stance and floats in the flight phase
  const hipY = -0.007 * (1 - amp) + (L(-0.009, -0.018) + L(0.0045, -0.006) * c2) * amp;
  return {
    hipX: L(0.006, 0.002) * sway * amp, hipY, hipZ: L(0, 0.01) * amp,
    hip: [L(0, 4) * amp, -yaw, L(2, 1.2) * sway * amp],
    waist: [lean * 0.6 * amp, yaw * 0.55, -L(1.6, 0.9) * sway * amp], chest: [lean * 0.4 * amp - L(0, 2) * c2 * amp, yaw * 0.45, -L(0.6, 0.3) * sway * amp],
    neck: [0, yaw * 0.2, 0], head: [-lean * 0.75 * amp + L(1.5, 3) * c2 * amp + (o.headDown || 0), yaw * 0.25, 0],
    armL: [A * arm, 0, -L(79, 72)], armR: [-A * arm, 0, L(79, 72)],
    elbL: [0, -L(18, 88) - L(10, 8) * Math.max(0, -arm), 0], elbR: [0, L(18, 88) + L(10, 8) * Math.max(0, arm), 0],
    fL: [-L(0.003, 0.006), fl.y, fl.z], fR: [L(0.003, 0.006), fr.y, fr.z], heelL: fl.heel, heelR: fr.heel, legIK: 1,
    hL: run > 0.5 ? HAND.grip : HAND.relax, hR: run > 0.5 ? HAND.grip : HAND.relax,
    tail: [L(18, 40), L(14, 22) * Math.sin(pl + sd), 0],
    sec: { bob: -c2 * L(0.5, 1) * amp, sway: sway * L(0.5, 0.3) * amp, wind: L(0, 1) * (o.wind ?? 1) * Math.min(1, amp * 1.5) },
  };
}
// Cadence helper: cycle length (chibi units) of gait() for these options, e.g. speed = cycles per second * gaitCycle(o).
export function gaitCycle(o = {}) { const run = o.run || 0; return (0.12 + 0.02 * run) * (o.stride || 1) / (0.6 - 0.26 * run - 0.04 * (o.sprint || 0)); }

// Distance covered at time t by a move starting at t0 over len (chibi units) at cruise speed v (units/s), with eased
// starts and stops (acc s each). Returns { D, amp } for gait().
export function travel(t, t0, len, v, acc = 0.7) {
  let T = len / v + acc; if (len / v < acc) { v = len / acc; T = 2 * acc; }
  const tau = t - t0, ramp = r => v * (r / 2 - acc / (2 * Math.PI) * Math.sin(Math.PI * r / acc));
  let D;
  if (tau <= 0) D = 0; else if (tau < acc) D = ramp(tau); else if (tau < T - acc) D = v * acc / 2 + v * (tau - acc); else if (tau < T) D = len - ramp(T - tau); else D = len;
  const vel = tau <= 0 || tau >= T ? 0 : tau < acc ? 0.5 - 0.5 * Math.cos(Math.PI * tau / acc) : tau > T - acc ? 0.5 - 0.5 * Math.cos(Math.PI * (T - tau) / acc) : 1;
  return { D, amp: clamp(vel * 1.6), moving: vel > 0, T: t0 + T };
}

// Blend two poses (w: 0 -> a, 1 -> b). Rotations missing from one pose count as rest; targets (feet, hands, gaze) and
// follow-through missing from one pose are taken from the other, so mixing never sends a foot or hand to the origin.
const TARGET = new Set(['fL', 'fR', 'ikL', 'ikR', 'look', 'poleL', 'poleR', 'aL', 'aR', 'plL', 'plR']);
export function mix(a, b, w) {
  if (w <= 0) return a; if (w >= 1) return b;
  const out = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[k], y = b[k];
    if (k === 'sec') { const p = x || {}, q = y || {}; out.sec = { bob: (p.bob || 0) * (1 - w) + (q.bob || 0) * w, sway: (p.sway || 0) * (1 - w) + (q.sway || 0) * w, wind: (p.wind || 0) * (1 - w) + (q.wind || 0) * w }; continue; }
    if (typeof x === 'string' || typeof y === 'string' || typeof x === 'boolean' || typeof y === 'boolean') { out[k] = w < 0.5 ? (x ?? y) : (y ?? x); continue; }
    if (k === 'legIK') { out[k] = (x ?? 0) * (1 - w) + (y ?? 0) * w; continue; }
    if (typeof x === 'number' || typeof y === 'number') { out[k] = (x || 0) * (1 - w) + (y || 0) * w; continue; }
    if (TARGET.has(k) && (!x || !y)) { out[k] = x || y; const wk = k === 'look' ? 'lookW' : k === 'aL' ? 'aWL' : k === 'aR' ? 'aWR' : null;
      if (wk) out[wk] = ((x ? a : b)[wk] ?? 1) * (x ? 1 - w : w); continue; }
    if (k === 'lookW' || k === 'aWL' || k === 'aWR') { const tk = { lookW: 'look', aWL: 'aL', aWR: 'aR' }[k]; if (a[tk] && b[tk]) out[k] = (x ?? 1) * (1 - w) + (y ?? 1) * w; continue; }
    if ((k === 'aL' || k === 'aR') && x[0] !== y[0]) { out[k] = w < 0.5 ? x : y; continue; }
    const n = Math.max(x?.length || 0, y?.length || 0), d = k === 'hL' || k === 'hR' ? HAND.relax : null;
    out[k] = Array.from({ length: n }, (_, i) => typeof (x || d)?.[i] === 'string' ? (x || d)[i] : ((x || d)?.[i] || 0) * (1 - w) + ((y || d)?.[i] || 0) * w);
  }
  return out;
}
// Cross-fade a sequence of pose functions: keys = [[t0, f0], [t1, f1], ...]; each switch blends over bl seconds.
export function seq(t, keys, bl = 0.5) {
  let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0] - bl / 2) i++;
  const [ti, f] = keys[i], p = f(t);
  if (i === 0 || t >= ti + bl / 2) return p;
  return mix(keys[i - 1][1](t), p, ss(ti - bl / 2, ti + bl / 2, t));
}

// Continuous eyelid closure (0 open .. 1 shut): quick close, slower open, at seeded irregular intervals.
export function blink(t, seed = 0, every = 3.4) {
  const k = Math.floor((t + seed * 3.1) / every), r = x => (Math.sin(x * 127.1 + seed * 311.7) * 43758.5453) % 1, j = Math.abs(r(k)) * every * 0.6;
  const tb = k * every - seed * 3.1 + j, u = t - tb;
  if (u < 0 || u > 0.2) return 0;
  return u < 0.06 ? ss(0, 0.06, u) : 1 - ss(0.06, 0.2, u);
}
// Jaw opening while speaking (0..1): syllable-rate flaps with natural variation.
export function talkJaw(t, seed = 0, k = 1) {
  const v = 0.5 + 0.32 * Math.sin(t * 15.7 + seed) + 0.22 * Math.sin(t * 9.3 + seed * 2) + 0.12 * Math.sin(t * 23.1 + seed * 3);
  return clamp(v, 0, 1) * k * 0.85;
}
