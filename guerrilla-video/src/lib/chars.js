// Character loading + procedural rig for the Uma-style chibi models.
// All models share one skeleton (Hip/Waist/Chest/Neck/Head, Shoulder/Arm/Elbow/Wrist, Thigh/Knee/Ankle)
// and ship in T-pose with no animations, so every motion here is procedural.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const D = THREE.MathUtils.DEG2RAD;

export const CAST = {
  oguri: 'oguri_cap', tamamo: 'tamano_cross', cafe: 'manhattan_cafe', doto: 'doto',
  mcqueen: 'mejiro_mcqueen', daiwa: 'daiwa_scarlet', suzuka: 'silence_suzuka', helios: 'daitaku_helios',
};

const JOINTS = {
  hip: 'Hip', waist: 'Waist', chest: 'Chest', neck: 'Neck', head: 'Head', tail: 'Tail_Ctrl',
  shL: 'Shoulder_L', armL: 'Arm_L', elbL: 'Elbow_L', wriL: 'Wrist_L',
  shR: 'Shoulder_R', armR: 'Arm_R', elbR: 'Elbow_R', wriR: 'Wrist_R',
  thL: 'Thigh_L', knL: 'Knee_L', anL: 'Ankle_L', thR: 'Thigh_R', knR: 'Knee_R', anR: 'Ankle_R',
};

// Expression atlases: 128px cells. Eyes texture 1024², mouth texture 512x1024.
const EYES = {
  open: [0, 0], open2: [0.25, 0], blink: [0, -0.25], happy: [0.25, -0.25], flat: [0.5, -0.25],
  squint: [0.75, -0.125], shock: [0, -0.375], sparkle: [0.25, -0.375], dizzy: [0.5, -0.375],
};
const MOUTH = {
  neutral: [0, 0], frown: [0.25, 0], open: [0.5, 0], smile: [0.75, 0], wavy: [0, -0.125],
  tongue: [0.25, -0.125], teeth: [0.5, -0.125], grin: [0.75, -0.125], big: [0.25, -0.25],
  cat: [0.5, -0.25], scream: [0.75, -0.25], small: [0.25, -0.375], tri: [0.5, -0.375], shout: [0.25, -0.5],
};

const cache = {};
export async function loadCast() {
  const loader = new GLTFLoader();
  await Promise.all(Object.entries(CAST).map(async ([k, file]) => {
    const g = await loader.loadAsync(`/models/${file}.glb`);
    cache[k] = g.scene;
  }));
}

function findBone(root, prefix) {
  let hit = null;
  root.traverse(o => { if (!hit && o.isBone && (o.name === prefix || o.name.startsWith(prefix + '_'))) hit = o; });
  return hit;
}

// Spawn a rigged character. Clones share geometry but get their own face materials.
export function spawn(key) {
  const src = cache[key];
  const model = SkeletonUtils.clone(src);
  const root = new THREE.Group();
  root.add(model);
  return new Rig(key, root, model);
}

export class Rig {
  constructor(key, root, model) {
    this.key = key; this.root = root; this.model = model;
    this.faceMats = [];
    this.seed = [...key].reduce((a, c) => a + c.charCodeAt(0), 0) * 0.37 + Math.random() * 0;
    model.traverse(o => {
      if (!o.isMesh) return;
      o.frustumCulled = false; o.castShadow = true; o.receiveShadow = false;
      const m = o.material;
      if (/Front|Transparent/.test(m.name)) { o.visible = false; return; }
      const isFace = /Mouth|Eyes|Cheek|Brow|Eyebrow|face|Face|head_skibidi/.test(m.name);
      if (isFace) {
        // Anime faces read best unlit; lit decal quads also mismatch the face shading.
        const b = new THREE.MeshBasicMaterial({ map: m.map, transparent: m.transparent, opacity: m.opacity, alphaTest: m.alphaTest,
          depthWrite: m.depthWrite, side: m.side, color: 0xf2f0f0, name: m.name });
        if (/Mouth|Eyes/.test(m.name)) b.map = m.map.clone();
        if (/Cheek/.test(m.name)) b.opacity = 0.5;
        o.material = b; this.faceMats.push(b);
        if (/Mouth/.test(m.name)) { this.mouthMap = b.map; hideMouthPatch(o); }
        if (/Eyes/.test(m.name)) this.eyeMap = b.map;
        o.castShadow = false;
      } else if (m.normalMap) m.normalScale.set(0.6, 0.6);
    });
    // Rest pose, measured in model space.
    root.updateMatrixWorld(true);
    const invRoot = new THREE.Quaternion();
    this.j = {};
    for (const [k, name] of Object.entries(JOINTS)) {
      const b = findBone(model, name);
      if (!b) continue;
      const pw = new THREE.Quaternion(); b.parent.getWorldQuaternion(pw); pw.premultiply(invRoot);
      this.j[k] = { bone: b, rest: b.quaternion.clone(), C: pw, Ci: pw.clone().invert(), restPos: b.position.clone() };
    }
    const hp = this.j.hip;
    hp.parentQi = hp.Ci.clone(); // to convert model-space offsets into hip-parent space
    // Rest data for arm IK (model space).
    const wp = b => { const v = new THREE.Vector3(); b.getWorldPosition(v); return v; };
    const wq = b => { const q = new THREE.Quaternion(); b.getWorldQuaternion(q); return q; };
    this.ik = {};
    for (const side of ['L', 'R']) {
      const A = this.j['arm' + side].bone, E = this.j['elb' + side].bone, Wr = this.j['wri' + side].bone;
      const pa = wp(A), pe = wp(E), pw = wp(Wr);
      this.ik[side] = { a: pa.distanceTo(pe), b: pe.distanceTo(pw), dirA: pe.clone().sub(pa).normalize(), dirE: pw.clone().sub(pe).normalize(),
        shRest: wq(this.j['sh' + side].bone) };
    }
    this.chestRestInv = new THREE.Matrix4().copy(this.j.chest.bone.matrixWorld).invert();
    this.chestRestQ = wq(this.j.chest.bone);
    this.holder = new THREE.Group(); // model-space frame that rides on the chest
    this.attachRaw('chest', this.holder);
    this.gun = null; this.gunPresets = {};
    this.face = { eye: 'open', mouth: 'neutral' };
    this._q = new THREE.Quaternion(); this._e = new THREE.Euler(0, 0, 0, 'YXZ'); this._v = new THREE.Vector3();
  }

  // pose: { joint: [x,y,z] degrees (model axes, applied FK-style), hipY, hipZ, hipX }
  apply(pose) {
    for (const [k, J] of Object.entries(this.j)) {
      const r = pose[k];
      if (!r) { J.bone.quaternion.copy(J.rest); continue; }
      this._e.set(r[0] * D, r[1] * D, r[2] * D, 'YXZ');
      this._q.setFromEuler(this._e);
      // local = C^-1 * d * C * rest  (d expressed in model axes at the parent's rest frame)
      J.bone.quaternion.copy(J.Ci).multiply(this._q).multiply(J.C).multiply(J.rest);
    }
    const hp = this.j.hip;
    this._v.set(pose.hipX || 0, pose.hipY || 0, pose.hipZ || 0).applyQuaternion(hp.parentQi);
    hp.bone.position.copy(hp.restPos).add(this._v);
    // Weapon placement + IK hands
    let grips = null;
    if (this.gun) {
      const g = this.gunPresets[pose.gun || 'none'];
      this.gun.visible = !!g;
      if (g) { this.gun.position.copy(g.pos); this.gun.quaternion.copy(g.q); if (!pose.ikL && !pose.ikR) grips = g; }
    }
    const ikL = pose.ikL || grips?.L, ikR = pose.ikR || grips?.R;
    if (ikL || ikR) {
      this.model.updateMatrixWorld(true);
      if (ikL) this.solveArm('L', ikL, pose.poleL);
      if (ikR) this.solveArm('R', ikR, pose.poleR);
    }
  }

  // Two-bone IK. target: model-space rest coordinates that ride along with the chest.
  solveArm(side, target, pole) {
    const K = this.ik[side], A = this.j['arm' + side], E = this.j['elb' + side];
    const toModel = new THREE.Matrix4().copy(this.root.matrixWorld).invert();
    const chestNow = new THREE.Matrix4().multiplyMatrices(toModel, this.j.chest.bone.matrixWorld);
    const T = new THREE.Vector3(...target).applyMatrix4(this.chestRestInv).applyMatrix4(chestNow);
    const S = new THREE.Vector3().setFromMatrixPosition(new THREE.Matrix4().multiplyMatrices(toModel, A.bone.matrixWorld));
    const dir = T.clone().sub(S); let d = dir.length(); dir.normalize();
    d = Math.min(d, (K.a + K.b) * 0.999);
    const x = (K.a * K.a - K.b * K.b + d * d) / (2 * d), h = Math.sqrt(Math.max(0, K.a * K.a - x * x));
    const pv = new THREE.Vector3(...(pole || [side === 'L' ? 0.6 : -0.6, -1, -0.3]));
    pv.sub(dir.clone().multiplyScalar(pv.dot(dir))).normalize();
    const Ep = S.clone().addScaledVector(dir, x).addScaledVector(pv, h);
    const Tp = S.clone().addScaledVector(dir, d);
    const u = Ep.clone().sub(S).normalize(), f = Tp.clone().sub(Ep).normalize();
    // accumulated delta of the arm's parent (shoulder), in model space
    const parentNow = new THREE.Quaternion(); A.bone.parent.getWorldQuaternion(parentNow);
    const rootQ = new THREE.Quaternion(); this.root.getWorldQuaternion(rootQ); parentNow.premultiply(rootQ.invert());
    const Dp = parentNow.multiply(K.shRest.clone().invert());
    const Darm = new THREE.Quaternion().setFromUnitVectors(K.dirA, u);
    const dArm = Dp.clone().invert().multiply(Darm);
    A.bone.quaternion.copy(A.Ci).multiply(dArm).multiply(A.C).multiply(A.rest);
    const fl = f.clone().applyQuaternion(Darm.clone().invert());
    const dEl = new THREE.Quaternion().setFromUnitVectors(K.dirE, fl);
    E.bone.quaternion.copy(E.Ci).multiply(dEl).multiply(E.C).multiply(E.rest);
  }

  // Give the rig a weapon with named holds: {name: {pos, dir, up, L, R}} in model-space rest coords.
  equip(obj, presets) {
    this.gun = obj; this.holder.add(obj);
    for (const [k, p] of Object.entries(presets)) {
      const dir = new THREE.Vector3(...p.dir).normalize(), up = new THREE.Vector3(...(p.up || [0, 1, 0]));
      const m = new THREE.Matrix4().lookAt(new THREE.Vector3(), dir.clone().negate(), up);
      const pos = new THREE.Vector3(...p.pos);
      const grip = s => s == null ? null : pos.clone().addScaledVector(dir, s).add(new THREE.Vector3(0, -0.035, 0)).toArray();
      this.gunPresets[k] = { pos, q: new THREE.Quaternion().setFromRotationMatrix(m), L: p.L !== undefined ? (Array.isArray(p.L) ? p.L : grip(p.L)) : null,
        R: p.R !== undefined ? (Array.isArray(p.R) ? p.R : grip(p.R)) : null };
    }
  }

  setFace(eye = 'open', mouth = 'neutral') {
    const e = EYES[eye] || EYES.open, m = MOUTH[mouth] || MOUTH.neutral;
    if (this.eyeMap) this.eyeMap.offset.set(e[0], e[1]);
    if (this.mouthMap) this.mouthMap.offset.set(m[0], m[1]);
  }

  attachRaw(jointKey, obj) { return this.attach(jointKey, obj); }
  // Attach a prop to a bone, giving its transform in model space for the rest pose.
  attach(jointKey, obj, pos = [0, 0, 0], rot = [0, 0, 0]) {
    const b = this.j[jointKey].bone;
    this.root.updateMatrixWorld(true);
    const want = new THREE.Matrix4().compose(new THREE.Vector3(...pos),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D)), new THREE.Vector3(1, 1, 1));
    // bone world relative to root
    const saved = this.root.matrixWorld.clone();
    const rootInv = saved.clone().invert();
    const bm = new THREE.Matrix4().multiplyMatrices(rootInv, b.matrixWorld);
    obj.matrixAutoUpdate = true;
    new THREE.Matrix4().copy(bm).invert().multiply(want).decompose(obj.position, obj.quaternion, obj.scale);
    b.add(obj);
    return obj;
  }
}

function hideMouthPatch(mesh) {
  // The mouth mesh stacks a skin-colored patch (UV u>0.5) in front of the expression quad; drop it.
  const g = mesh.geometry.clone(); mesh.geometry = g;
  const uv = g.attributes.uv, idx = g.index.array, keep = [];
  for (let i = 0; i < idx.length; i += 3) if (uv.getX(idx[i]) < 0.5) keep.push(idx[i], idx[i + 1], idx[i + 2]);
  g.setIndex(keep);
}

// ---------------------------------------------------------------- poses
const L = 0.091, S = 0.105; // thigh, shin lengths
const sin = Math.sin, cos = Math.cos, PI = Math.PI;
export const clamp01 = x => Math.max(0, Math.min(1, x));
export const smooth = x => { x = clamp01(x); return x * x * (3 - 2 * x); };

function legDrop(th, kn) { const a = th * D, b = (th + kn) * D; return L * (1 - cos(a)) + S * (1 - cos(b)); }
function grounded(p, flatFeet = 1) {
  const dl = legDrop(p.thL?.[0] || 0, p.knL?.[0] || 0), dr = legDrop(p.thR?.[0] || 0, p.knR?.[0] || 0);
  p.hipY = (p.hipY || 0) - Math.min(dl, dr);
  if (flatFeet) {
    p.anL = [-(p.thL?.[0] || 0) - (p.knL?.[0] || 0) * flatFeet, 0, 0];
    p.anR = [-(p.thR?.[0] || 0) - (p.knR?.[0] || 0) * flatFeet, 0, 0];
  }
  return p;
}
const mirror = r => [r[0], -r[1], -r[2]];

export function blend(a, b, w) {
  if (w <= 0) return a; if (w >= 1) return b;
  const out = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[k], y = b[k];
    if (typeof x === 'number' || typeof y === 'number') out[k] = (x || 0) * (1 - w) + (y || 0) * w;
    else { const p = x || [0, 0, 0], q = y || [0, 0, 0]; out[k] = [0, 1, 2].map(i => p[i] * (1 - w) + q[i] * w); }
  }
  return out;
}

// Base standing pose with gentle idle motion.
export function idle(t, seed = 0, amt = 1) {
  const s = t * 1.6 + seed;
  const armL = [4 * sin(s * 0.8) * amt, 0, -74 + 2 * sin(s)];
  return grounded({
    waist: [1 * sin(s), 0, 0], chest: [2 * sin(s * 1.1), 0, 1.5 * sin(s * 0.5)],
    head: [3 * sin(s * 0.7 + 1) * amt, 6 * sin(s * 0.33 + seed) * amt, 3 * sin(s * 0.45) * amt],
    armL, armR: mirror([4 * sin(s * 0.8 + 1) * amt, 0, -74 + 2 * sin(s + 0.5)]),
    elbL: [0, -14, 0], elbR: [0, 14, 0],
    thL: [0, 0, 1.5], thR: [0, 0, -1.5], tail: [10 * sin(s * 0.9), 15 * sin(s * 0.6), 0],
  });
}

export function walk(t, speed = 1, seed = 0) {
  const f = 1.9 * speed, ph = t * f * 2 * PI + seed, a = 24 + 6 * speed;
  const p = {
    waist: [4, 6 * sin(ph), 0], chest: [2, -4 * sin(ph), 0], head: [-2, 2 * sin(ph), 0],
    armL: [26 * sin(ph), 0, -76], armR: mirror([-26 * sin(ph), 0, -76]),
    elbL: [0, -24, 0], elbR: [0, 24, 0],
    thL: [-a * sin(ph), 0, 2], thR: [a * sin(ph), 0, -2],
    knL: [35 * Math.max(0, cos(ph)) + 5, 0, 0], knR: [35 * Math.max(0, -cos(ph)) + 5, 0, 0],
    tail: [25, 18 * sin(ph), 0],
  };
  grounded(p, 0.6);
  p.hipY += 0.012 * Math.abs(sin(ph));
  return p;
}

export function run(t, speed = 1, seed = 0) {
  const f = 2.7 * speed, ph = t * f * 2 * PI + seed;
  const p = {
    waist: [14, 10 * sin(ph), 0], chest: [6, -6 * sin(ph), 0], head: [-14, 3 * sin(ph), 0],
    armL: [50 * sin(ph), 0, -70], armR: mirror([-50 * sin(ph), 0, -70]),
    elbL: [0, -75, 0], elbR: [0, 75, 0],
    thL: [-45 * sin(ph) - 10, 0, 2], thR: [45 * sin(ph) - 10, 0, -2],
    knL: [70 * Math.max(0, cos(ph)) + 15, 0, 0], knR: [70 * Math.max(0, -cos(ph)) + 15, 0, 0],
    tail: [45, 25 * sin(ph), 0],
  };
  grounded(p, 0.4);
  p.hipY += 0.03 * Math.abs(sin(ph));
  return p;
}

// Run while carrying a rifle across the chest.
export function runArmed(t, speed = 1, seed = 0) {
  const p = run(t, speed, seed);
  const ph = t * 2.7 * speed * 2 * PI + seed;
  p.armL = [-50 + 6 * sin(ph), -20, -60]; p.armR = mirror([-40 + 6 * sin(ph), -10, -75]);
  p.elbL = [0, -80, 0]; p.elbR = [0, 70, 0];
  return p;
}
export function walkArmed(t, speed = 1, seed = 0) {
  const p = walk(t, speed, seed);
  p.armL = [-50, -20, -60]; p.armR = mirror([-40, -10, -75]); p.elbL = [0, -80, 0]; p.elbR = [0, 70, 0];
  return p;
}

export function crouch(t = 0, seed = 0, depth = 1) {
  const s = t * 1.4 + seed;
  return grounded({
    waist: [22 * depth, 0, 0], chest: [10 * depth + 2 * sin(s), 0, 0], head: [-18 * depth, 8 * sin(s * 0.4), 0],
    armL: [-30, 0, -70], armR: mirror([-30, 0, -70]), elbL: [0, -60, 0], elbR: [0, 60, 0],
    thL: [-70 * depth, 0, 6], thR: [-70 * depth, 0, -6], knL: [120 * depth, 0, 0], knR: [120 * depth, 0, 0],
    tail: [30, 10 * sin(s), 0],
  });
}

// Shouldered rifle, standing or kneeling. recoil 0..1
export function aim(t = 0, recoil = 0, kneel = 0) {
  const r = recoil;
  const base = {
    waist: [6, -8, 0], chest: [4 - 5 * r, -6, 0], head: [6 - 4 * r, 10, -4],
    armL: [-82 + 8 * r, -24, -88], armR: mirror([-70 + 8 * r, -2, -86]),
    elbL: [0, -38, 0], elbR: [0, 70, 0],
    thL: [-10, 0, 6], thR: [8, 0, -6], tail: [10, 0, 0],
  };
  if (kneel) {
    base.thL = [-80 * kneel, 0, 6]; base.knL = [80 * kneel, 0, 0];
    base.thR = [10 * kneel, 0, -6]; base.knR = [100 * kneel, 0, 0];
    const p = grounded(base, 1); p.anR = [-40 * kneel, 0, 0]; return p;
  }
  return grounded(base);
}

export function wave(t, seed = 0, side = 'R') {
  const p = idle(t, seed);
  const w = 26 * sin(t * 9);
  if (side === 'R' || side === 'both') { p.armR = [-15, 0, -25]; p.elbR = [0, 0, -70 - w]; }
  if (side === 'L' || side === 'both') { p.armL = [-15, 0, 25]; p.elbL = [0, 0, 70 + w]; }
  p.head[2] += 6;
  return p;
}

export function cheer(t, seed = 0) {
  const ph = t * 2 * PI * 1.6 + seed;
  const up = Math.abs(sin(ph));
  const p = grounded({
    waist: [-4, 0, 0], chest: [-6, 0, 4 * sin(ph)], head: [-12, 0, 6 * sin(ph)],
    armL: [-15, 0, 38 + 10 * up], armR: mirror([-15, 0, 38 + 10 * up]), elbL: [0, 0, 25], elbR: [0, 0, -25],
    thL: [-20 * up, 0, 4], thR: [-20 * up, 0, -4], knL: [40 * up, 0, 0], knR: [40 * up, 0, 0],
    tail: [40, 30 * sin(ph * 2), 0],
  });
  p.hipY += 0.09 * up;
  return p;
}

export function point(t, seed = 0, yaw = 0) {
  const p = idle(t, seed);
  p.armR = [-86, yaw, -90].map((v, i) => i === 2 ? 90 : v); // forward
  p.armR = [-96, yaw, 90]; p.elbR = [0, 6, 0]; p.head = [0, -yaw * 0.6, 0];
  return p;
}

export function lookAround(t, seed = 0) {
  const p = idle(t, seed);
  p.head = [4, 42 * sin(t * 1.7 + seed), 6 * sin(t * 3.4)];
  p.chest[1] = 12 * sin(t * 1.7 + seed - 0.4);
  return p;
}

export function tired(t, seed = 0, amt = 1) {
  const p = idle(t * 0.5, seed, 0.4);
  p.head = [28 * amt, 0, 6 * sin(t * 0.8)]; p.chest = [18 * amt, 0, 0]; p.waist = [10 * amt, 0, 0];
  p.armL = [8, 0, -86]; p.armR = mirror([8, 0, -86]); p.elbL = [0, -4, 0]; p.elbR = [0, 4, 0];
  return p;
}

// Knocked onto the backside, legs out (cartoon "oof").
export function knocked(t, seed = 0) {
  const w = 8 * sin(t * 6 + seed) * Math.exp(-t * 0.8);
  return {
    hipY: -0.19, hipZ: -0.04,
    waist: [-14 + w, 0, 0], chest: [-6, 0, w], head: [6, 20 * sin(t * 3 + seed), 12 * sin(t * 2.4)],
    armL: [30, 0, -40], armR: mirror([30, 0, -40]), elbL: [0, -20, 0], elbR: [0, 20, 0],
    thL: [-86, 0, 18], thR: [-86, 0, -18], knL: [6, 0, 0], knR: [6, 0, 0], anL: [-10, 0, 0], anR: [-10, 0, 0],
    tail: [0, 0, 0],
  };
}

// Hands something forward (offering/receiving).
export function offer(t, seed = 0, amt = 1) {
  const p = idle(t, seed);
  p.armL = blend({ a: p.armL }, { a: [-70, -30, -86] }, amt).a; p.armR = blend({ a: p.armR }, { a: mirror([-70, -30, -86]) }, amt).a;
  p.elbL = [0, -40 * amt - 14, 0]; p.elbR = [0, 40 * amt + 14, 0];
  return p;
}

// Holding a controller / tablet in front.
export function operate(t, seed = 0) {
  const p = idle(t, seed, 0.3);
  p.armL = [-40, -36, -80]; p.armR = mirror([-40, -36, -80]); p.elbL = [0, -90, 0]; p.elbR = [0, 90, 0];
  p.head = [22, 0, 4 * sin(t)]; p.chest = [6, 0, 0];
  return p;
}

// Push down a plunger.
export function plunge(t, press = 0) {
  const p = crouch(t, 0, 0.7);
  p.armL = [-55 + 30 * press, -30, -82]; p.armR = mirror([-55 + 30 * press, -30, -82]);
  p.elbL = [0, -40 + 30 * press, 0]; p.elbR = [0, 40 - 30 * press, 0];
  p.chest = [18 + 14 * press, 0, 0];
  return p;
}

// Salute / point at map.
export function salute(t, seed = 0) {
  const p = idle(t, seed);
  p.armR = [-30, 50, 40]; p.elbR = [0, 0, 135]; p.head = [-4, 0, 0];
  return p;
}

export function shrug(t, seed = 0) {
  const p = idle(t, seed);
  const s = 0.5 + 0.5 * sin(t * 3);
  p.armL = [-30, 30, -50 + 10 * s]; p.armR = mirror([-30, 30, -50 + 10 * s]);
  p.elbL = [0, -70, 0]; p.elbR = [0, 70, 0]; p.head = [0, 0, 12];
  return p;
}

// Auto-blinking eyes; returns 'blink' during blinks.
export function blinkEye(t, seed, eye = 'open') {
  if (eye !== 'open' && eye !== 'open2') return eye;
  const per = 3.1 + (seed % 1.3);
  const ph = ((t + seed * 1.7) % per + per) % per;
  return ph < 0.13 ? 'blink' : eye;
}
// Mouth flap while "talking".
export function talkMouth(t, seed = 0) {
  const v = sin(t * 17 + seed) + 0.6 * sin(t * 11.3 + seed * 2);
  return v > 0.6 ? 'open' : v > -0.2 ? 'small' : 'neutral';
}
