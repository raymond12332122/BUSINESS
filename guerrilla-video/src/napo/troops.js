// Instanced chibi-proportioned soldiers for massed formations in the background (one draw call per body part).
import * as THREE from 'three';

const HATS = {
  shako: () => { const g = new THREE.CylinderGeometry(0.21, 0.19, 0.26, 12); g.translate(0, 0.13, 0); return g; },
  bearskin: () => { const g = new THREE.SphereGeometry(0.24, 12, 10); g.scale(1, 1.45, 1); g.translate(0, 0.16, -0.02); return g; },
  bicorne: () => { const g = new THREE.SphereGeometry(0.3, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2); g.scale(1.35, 0.55, 0.45); return g; },
  papakha: () => { const g = new THREE.CylinderGeometry(0.22, 0.22, 0.26, 12); g.translate(0, 0.13, 0); return g; },
  round: () => { const g = new THREE.CylinderGeometry(0.34, 0.36, 0.05, 14); const c = new THREE.CylinderGeometry(0.2, 0.21, 0.18, 12); c.translate(0, 0.1, 0); return mergeTwo(g, c); },
  none: null,
};
function mergeTwo(a, b) {
  const pa = a.toNonIndexed().attributes, pb = b.toNonIndexed().attributes;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([...pa.position.array, ...pb.position.array], 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute([...pa.normal.array, ...pb.normal.array], 3)); return g;
}
export class Troop {
  constructor(parent, { rows = 4, cols = 8, spacing = [0.62, 0.75], coat = '#2f4590', pants = '#ece6d8', hat = 'shako', hatColor = '#151517', plume = '#c0272d',
    skin = '#f1d3c2', hair = '#3a2a20', musket = true, belts = '#f4f1ea', scale = 1, jitter = 0.08, seed = 1 } = {}) {
    this.n = rows * cols; this.rows = rows; this.cols = cols; this.spacing = spacing; this.scale = scale; this.group = new THREE.Group(); parent.add(this.group);
    const mk = (geo, color, opts = {}) => { const m = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...opts }), this.n); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; this.group.add(m); return m; };
    const body = new THREE.CapsuleGeometry(0.17, 0.2, 4, 10); body.translate(0, 0.43, 0);
    const head = new THREE.SphereGeometry(0.26, 14, 12); head.translate(0, 0.82, 0);
    const hairG = new THREE.SphereGeometry(0.275, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62); hairG.rotateX(-0.5); hairG.translate(0, 0.84, -0.03);
    const eyes = new THREE.SphereGeometry(0.035, 6, 6); const e2 = eyes.clone(); eyes.translate(-0.09, 0.8, 0.235); e2.translate(0.09, 0.8, 0.235);
    const leg = new THREE.CapsuleGeometry(0.06, 0.16, 3, 8); leg.translate(0, -0.12, 0);
    const belt = new THREE.TorusGeometry(0.17, 0.018, 4, 18); belt.rotateZ(0.7); belt.scale(0.82, 1.3, 1.06); belt.translate(0, 0.47, 0);
    this.parts = {
      body: mk(body, coat), head: mk(head, skin), hair: mk(hairG, hair), eyeL: mk(eyes, '#1d1b1c'), eyeR: mk(e2, '#1d1b1c'),
      legL: mk(leg, pants), legR: mk(leg.clone(), pants), belt: mk(belt, belts),
    };
    if (HATS[hat]) { const hg = HATS[hat](); hg.translate(0, 1.0, 0); this.parts.hat = mk(hg, hatColor); }
    if (plume && (hat === 'shako' || hat === 'bearskin')) { const pg = new THREE.SphereGeometry(0.05, 6, 6); pg.translate(hat === 'bearskin' ? -0.2 : 0, hat === 'bearskin' ? 1.36 : 1.3, 0.12); this.parts.plume = mk(pg, plume); }
    if (musket) { const mg = new THREE.BoxGeometry(0.035, 0.035, 0.85); mg.rotateX(-1.25); mg.translate(0.2, 0.62, 0.05); this.parts.musket = mk(mg, '#4a3424'); }
    const r = (() => { let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();
    this.off = [...Array(this.n)].map(() => [(r() - 0.5) * jitter, (r() - 0.5) * jitter, r() * 6.28]);
    this.alive = new Array(this.n).fill(1);
    this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._e = new THREE.Euler(); this._v = new THREE.Vector3(); this._s = new THREE.Vector3(1, 1, 1);
    this._b = new THREE.Matrix4(); this._l = new THREE.Matrix4();
  }
  // x, z: formation centre; yaw: facing; march: 0 stand .. 1 marching; t: time; spread: random spacing; fall: per-soldier knocked flag via this.alive
  update(t, { x = 0, z = 0, y = 0, yaw = 0, march = 0, speed = 1, tired = 0, aim = 0 } = {}) {
    const P = this.parts, s = this.scale, [sx, sz] = this.spacing;
    let i = 0;
    for (let rr = 0; rr < this.rows; rr++) for (let c = 0; c < this.cols; c++, i++) {
      const [jx, jz, ph] = this.off[i];
      const lx = (c - (this.cols - 1) / 2) * sx + jx, lz = -(rr - (this.rows - 1) / 2) * sz + jz;
      const ca = Math.cos(yaw), sa = Math.sin(yaw);
      const wx = x + (lx * ca + lz * sa) * s, wz = z + (-lx * sa + lz * ca) * s;
      const w = t * 7 * speed + ph, bob = march * Math.abs(Math.sin(w)) * 0.035 * s;
      const alive = this.alive[i];
      const tilt = alive ? (tired * 0.35 + march * 0.06) : 1.35;
      this._q.setFromEuler(this._e.set(tilt, yaw + (alive ? 0 : 0.4), 0, 'YXZ'));
      this._b.compose(this._v.set(wx, y + bob + (alive ? 0 : 0.12), wz), this._q, this._s.set(s, s, s));
      for (const k of ['body', 'head', 'hair', 'eyeL', 'eyeR', 'belt', 'hat', 'plume', 'musket']) if (P[k]) P[k].setMatrixAt(i, this._b);
      for (const [k, sg] of [['legL', 1], ['legR', -1]]) {
        const sw = march * 0.6 * Math.sin(w) * sg * (alive ? 1 : 0);
        this._l.compose(this._v.set(sg * 0.08, 0.27, 0), this._q.setFromEuler(this._e.set(sw, 0, 0)), this._s.set(1, 1, 1));
        this._m.multiplyMatrices(this._b, this._l); P[k].setMatrixAt(i, this._m);
      }
    }
    for (const m of Object.values(P)) m.instanceMatrix.needsUpdate = true;
  }
}
