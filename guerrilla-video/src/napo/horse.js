// Stylised chibi horse with animated legs, plus a riding pose for the chibi riders.
// The horse faces +z. Units match the chibi characters (rider ~1.15 tall). Legs are two-segment chains
// (upper + lower + hoof) so walk / trot / gallop / rear can be posed procedurally.
import * as THREE from 'three';
import { mesh, box, rng } from '../lib/props.js';

const D = THREE.MathUtils.DEG2RAD;
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...o });

function capsuleBetween(a, b, r0, r1, mat, seg = 12) {
  const dir = new THREE.Vector3().subVectors(b, a), L = dir.length();
  const g = new THREE.CylinderGeometry(r1, r0, L, seg, 3); g.translate(0, L / 2, 0);
  const m = mesh(g, mat); m.position.copy(a); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  const s0 = mesh(new THREE.SphereGeometry(r0, seg, 8), mat); s0.position.copy(a);
  const grp = new THREE.Group(); grp.add(m, s0); return grp;
}

export function horse({ coat = '#e9e4dc', mane = '#d8d2c6', hoof = '#3a3430', cloth = '#8a1f2a', trim = '#d4af37', seed = 1 } = {}) {
  const H = new THREE.Group();          // root: stands on the ground
  const body = new THREE.Group();       // pitches when rearing (pivot near the hind quarters)
  body.position.set(0, 0.64, -0.36); H.add(body);
  const C = std(coat), M = std(mane, { roughness: 0.9 }), K = std(hoof, { roughness: 0.5 }), dark = std('#1a1614', { roughness: 0.4 });
  const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };
  const Y = -0.64, Z = 0.36;            // body-local offsets: ground and mid-body
  // barrel
  const barrel = mesh(new THREE.CapsuleGeometry(0.25, 0.62, 8, 18), C); barrel.rotation.x = Math.PI / 2; barrel.scale.set(0.95, 1, 1.05); at(barrel, 0, 0.0, Z); body.add(barrel);
  const chest = mesh(new THREE.SphereGeometry(0.27, 18, 14), C); chest.scale.set(0.95, 1.05, 0.9); at(chest, 0, 0.03, Z + 0.4); body.add(chest);
  const rump = mesh(new THREE.SphereGeometry(0.28, 18, 14), C); rump.scale.set(1.0, 1.0, 0.95); at(rump, 0, 0.03, Z - 0.36); body.add(rump);
  // neck + head (head pivot at the top of the neck)
  const neckBase = new THREE.Vector3(0, 0.1, Z + 0.44), neckTop = new THREE.Vector3(0, 0.56, Z + 0.7);
  body.add(capsuleBetween(neckBase, neckTop, 0.2, 0.135, C, 14));
  const head = new THREE.Group(); head.position.copy(neckTop); body.add(head);
  const skull = mesh(new THREE.SphereGeometry(0.15, 16, 12), C); skull.scale.set(0.95, 0.95, 1.05); head.add(skull);
  const muzzle = mesh(new THREE.CapsuleGeometry(0.1, 0.22, 6, 12), C); muzzle.rotation.x = Math.PI / 2 + 0.55; muzzle.position.set(0, -0.1, 0.16); head.add(muzzle);
  const nose = mesh(new THREE.SphereGeometry(0.1, 12, 10), std(new THREE.Color(coat).multiplyScalar(0.85).getStyle())); nose.scale.set(1, 0.85, 0.9); nose.position.set(0, -0.2, 0.25); head.add(nose);
  for (const s of [-1, 1]) {
    const eye = mesh(new THREE.SphereGeometry(0.03, 10, 8), dark); eye.position.set(s * 0.12, 0.02, 0.06); head.add(eye);
    const hl = mesh(new THREE.SphereGeometry(0.009, 6, 4), new THREE.MeshBasicMaterial({ color: '#ffffff' })); hl.position.set(s * 0.145, 0.032, 0.075); head.add(hl);
    const ear = mesh(new THREE.ConeGeometry(0.04, 0.12, 8), C); ear.position.set(s * 0.07, 0.15, -0.04); ear.rotation.set(-0.2, 0, -s * 0.2); head.add(ear);
    const ns = mesh(new THREE.SphereGeometry(0.018, 8, 6), dark); ns.position.set(s * 0.045, -0.24, 0.33); head.add(ns);
  }
  // mane along the neck + forelock
  const r = rng(seed);
  for (let i = 0; i < 9; i++) {
    const u = i / 8, p = new THREE.Vector3().lerpVectors(neckBase, neckTop, u);
    const tuft = mesh(new THREE.SphereGeometry(0.075, 10, 8), M); tuft.scale.set(0.55, 1.1, 0.8);
    tuft.position.set(0, p.y + 0.11 - u * 0.02, p.z - 0.09 + u * 0.02); tuft.rotation.x = -0.6 + r() * 0.2; body.add(tuft);
  }
  const fore = mesh(new THREE.SphereGeometry(0.06, 10, 8), M); fore.scale.set(0.9, 0.7, 1.2); fore.position.set(0, 0.12, 0.08); head.add(fore);
  // tail
  const tail = new THREE.Group(); tail.position.set(0, 0.12, Z - 0.6); body.add(tail);
  const tc = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.12, -0.12), new THREE.Vector3(0, -0.38, -0.16), new THREE.Vector3(0, -0.56, -0.1)]);
  const tg = new THREE.TubeGeometry(tc, 16, 0.07, 10), tp = tg.attributes.position;
  for (let i = 0; i < tp.count; i++) { const u = Math.floor(i / 11) / 16, c = tc.getPointAt(Math.min(1, u)); const k = 0.7 + 0.6 * Math.sin(u * Math.PI * 0.9); tp.setXYZ(i, c.x + (tp.getX(i) - c.x) * k, c.y + (tp.getY(i) - c.y) * k, c.z + (tp.getZ(i) - c.z) * k); }
  tg.computeVertexNormals(); tail.add(mesh(tg, M));
  // saddle cloth (shabraque), saddle, bridle
  const shg = new THREE.CylinderGeometry(0.285, 0.285, 0.5, 24, 1, true, Math.PI - 1.75, 3.5); shg.rotateX(Math.PI / 2);
  const shab = mesh(shg, std(cloth, { side: THREE.DoubleSide })); shab.position.set(0, 0.0, Z + 0.02); body.add(shab);
  for (const s of [-1, 1]) { const tr = box(0.012, 0.03, 0.5, trim); tr.position.set(s * 0.255, -0.17, Z + 0.02); body.add(tr); }
  const saddle = mesh(new THREE.CapsuleGeometry(0.16, 0.2, 4, 12), std('#4a2f1d', { roughness: 0.5 })); saddle.rotation.x = Math.PI / 2; saddle.scale.set(1, 1, 0.35); saddle.position.set(0, 0.24, Z + 0.04); body.add(saddle);
  const pommel = mesh(new THREE.SphereGeometry(0.06, 10, 8), std('#4a2f1d', { roughness: 0.5 })); pommel.position.set(0, 0.3, Z + 0.22); body.add(pommel);
  const strap2 = mesh(new THREE.TorusGeometry(0.098, 0.009, 6, 28), std('#3a2418')); strap2.position.set(0, -0.15, 0.2); strap2.rotation.x = Math.PI / 2 + 0.55; strap2.scale.set(1.05, 1, 0.95); head.add(strap2);
  // reins from the bit to the saddle front
  const rein = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.2, 0.26).add(neckTop), new THREE.Vector3(0, 0.25, Z + 0.62), new THREE.Vector3(0, 0.3, Z + 0.3)]), 16, 0.008, 5), std('#3a2418')); body.add(rein);
  // legs: [x, y, z] of the hip/shoulder in body space
  const legs = {};
  const mkLeg = (name, x, z) => {
    const hip = new THREE.Group(); hip.position.set(x, -0.08, z); body.add(hip);
    hip.add(capsuleBetween(new THREE.Vector3(0, 0.05, 0), new THREE.Vector3(0, -0.28, 0), 0.1, 0.07, C));
    const knee = new THREE.Group(); knee.position.set(0, -0.28, 0); hip.add(knee);
    knee.add(capsuleBetween(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.22, 0), 0.06, 0.05, C));
    const fet = mesh(new THREE.SphereGeometry(0.065, 10, 8), M); fet.position.y = -0.22; fet.scale.set(1, 0.9, 1); knee.add(fet);
    const hf = mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.07, 12), K); hf.position.y = -0.275; knee.add(hf);
    legs[name] = { hip, knee };
  };
  mkLeg('FL', -0.13, Z + 0.4); mkLeg('FR', 0.13, Z + 0.4); mkLeg('HL', -0.14, Z - 0.38); mkLeg('HR', 0.14, Z - 0.38);
  H.body = body; H.head = head; H.tail = tail; H.legs = legs;
  H.seat = new THREE.Object3D(); H.seat.position.set(0, 0.29, Z + 0.02); body.add(H.seat);
  return H;
}

// Gaits. phase advances with distance; 'rear' lifts the forehand.
export function animateHorse(H, t, gait = 'stand', { speed = 1, rear = 0, seed = 0 } = {}) {
  const L = H.legs, s = Math.sin, c = Math.cos;
  const set = (n, a, b) => { L[n].hip.rotation.x = a * D; L[n].knee.rotation.x = b * D; };
  let bob = 0, pitch = 0, headX = 0;
  if (gait === 'stand') {
    for (const n of ['FL', 'FR', 'HL', 'HR']) set(n, 0, 0);
    headX = 6 * s(t * 0.8 + seed); H.tail.rotation.y = 0.15 * s(t * 1.3 + seed);
    if (Math.floor((t + seed) % 7) === 3) set('FR', -18 * Math.max(0, s((t % 1) * Math.PI)), 30 * Math.max(0, s((t % 1) * Math.PI)));
  } else {
    const f = gait === 'walk' ? 1.2 : gait === 'trot' ? 2.0 : 2.7, ph = t * f * Math.PI * 2 * speed + seed;
    const A = gait === 'walk' ? 18 : gait === 'trot' ? 28 : 38;
    const offs = gait === 'gallop' ? { FL: 0, FR: 0.35, HL: 0.6, HR: 0.85 } : gait === 'trot' ? { FL: 0, HR: 0, FR: 0.5, HL: 0.5 } : { FL: 0, HR: 0.25, FR: 0.5, HL: 0.75 };
    for (const [n, o] of Object.entries(offs)) {
      const q = ph + o * Math.PI * 2, swing = s(q), lift = Math.max(0, c(q));
      const front = n[0] === 'F';
      set(n, -A * swing, (front ? 1 : -1) * (12 + 50 * lift * (gait === 'walk' ? 0.6 : 1)));
    }
    bob = (gait === 'walk' ? 0.01 : gait === 'trot' ? 0.03 : 0.05) * Math.abs(s(ph));
    pitch = (gait === 'gallop' ? 5 : 1.5) * s(ph);
    headX = (gait === 'gallop' ? 10 : 6) * s(ph + 0.5);
    H.tail.rotation.x = (gait === 'gallop' ? -0.6 : -0.2) + 0.1 * s(ph * 2);
  }
  if (rear > 0) {
    pitch = -38 * rear; bob = 0;
    set('FL', (-70 - 15 * s(t * 3)) * rear, 100 * rear); set('FR', (-50 - 15 * s(t * 3 + 1)) * rear, 115 * rear);
    set('HL', 34 * rear, -26 * rear); set('HR', 26 * rear, -16 * rear);
    headX = -14 * rear + 4 * s(t * 2); H.tail.rotation.x = -0.9 * rear;
  }
  H.body.rotation.x = pitch * D; H.body.position.y = 0.64 + bob + (rear > 0 ? 0.08 * rear : 0);
  H.head.rotation.x = headX * D;
}

// Rider sitting astride; returns a pose for rig.apply (merge arm poses as needed).
export function ridePose(t, seed = 0, bounce = 0) {
  const b = Math.sin(t * 6 + seed) * bounce;
  return {
    hipY: 0.0 + b * 0.01, hipZ: 0.0,
    waist: [2, 0, 0], chest: [2 + b * 2, 0, 0], head: [0, 5 * Math.sin(t * 0.5 + seed), 0],
    armL: [-40, -20, -60], armR: [-40, 20, 60], elbL: [0, -60, 0], elbR: [0, 60, 0],
    thL: [-40, -8, 48], thR: [-40, 8, -48], knL: [55, 0, 0], knR: [55, 0, 0], anL: [-10, 0, 0], anR: [-10, 0, 0],
    tail: [0, 0, 0],
  };
}
const SEAT_DROP = 0.3; // character root (feet) to hip height when seated astride
// Put a rider on a horse's seat (call every frame after animateHorse).
export function seat(rider, H, { upright = 0 } = {}) {
  H.updateMatrixWorld(true);
  const p = new THREE.Vector3(), q = new THREE.Quaternion();
  H.seat.getWorldPosition(p); H.seat.getWorldQuaternion(q);
  if (upright) { const hq = new THREE.Quaternion(); H.getWorldQuaternion(hq); q.slerp(hq, upright); }
  p.add(new THREE.Vector3(0, -SEAT_DROP, 0).applyQuaternion(q));
  const parent = rider.root.parent; parent.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(parent.matrixWorld).invert();
  p.applyMatrix4(inv);
  const pq = new THREE.Quaternion(); parent.getWorldQuaternion(pq); q.premultiply(pq.invert());
  rider.root.position.copy(p); rider.root.quaternion.copy(q);
}
