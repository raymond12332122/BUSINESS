// Deterministic period effects for the Napoleonic video: snow, black-powder volleys, embers.
import * as THREE from 'three';
import { rng } from '../lib/props.js';
import { flashTex, softTex } from '../lib/fx.js';
import { puffTex } from '../mx/props.js';
import { clamp } from '../lib/util.js';

// Falling / wind-blown snow inside a box that follows nothing (place it around the camera's view).
export class Snow {
  constructor(parent, { n = 400, box = [-10, 10, 0, 6, -8, 8], wind = [1.5, -0.8, 0], size = 0.06, color = '#ffffff', opacity = 0.9, seed = 5 } = {}) {
    const r = rng(seed); this.box = box; this.wind = wind; this.n = n;
    this.p0 = new Float32Array(n * 3); this.ph = new Float32Array(n);
    for (let i = 0; i < n; i++) { this.p0[i * 3] = box[0] + r() * (box[1] - box[0]); this.p0[i * 3 + 1] = box[2] + r() * (box[3] - box[2]); this.p0[i * 3 + 2] = box[4] + r() * (box[5] - box[4]); this.ph[i] = r() * 6.28; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
    this.pts = new THREE.Points(g, new THREE.PointsMaterial({ map: softTex, color, size, transparent: true, opacity, depthWrite: false, sizeAttenuation: true }));
    this.pts.frustumCulled = false; this.pts.renderOrder = 7; parent.add(this.pts); this.update(0);
  }
  update(t, k = 1) {
    const [x0, x1, y0, y1, z0, z1] = this.box, p = this.pts.geometry.attributes.position, w = this.wind;
    const wrap = (v, a, b) => a + ((((v - a) % (b - a)) + (b - a)) % (b - a));
    for (let i = 0; i < this.n; i++) {
      const s = Math.sin(t * 1.3 + this.ph[i]) * 0.25;
      p.setXYZ(i, wrap(this.p0[i * 3] + w[0] * t + s, x0, x1), wrap(this.p0[i * 3 + 1] + w[1] * t, y0, y1), wrap(this.p0[i * 3 + 2] + w[2] * t + s * 0.6, z0, z1));
    }
    p.needsUpdate = true; this.pts.material.opacity = 0.9 * k; this.pts.visible = k > 0.01;
  }
}

// Black-powder fire: a flash at the muzzle and a white smoke cloud that bursts forward, swells and drifts.
// add(t0, pos, dir) schedules one shot; update(t) poses everything (pure function of t).
export class Volleys {
  constructor(parent, { color = '#ebe7df', size = 0.45, life = 4.5, drift = [0.25, 0.12, 0], flashSize = 0.5, max = 400 } = {}) {
    this.parent = parent; this.o = { color, size, life, drift, flashSize }; this.shots = []; this.pool = []; this.fpool = []; this.max = max;
  }
  add(t0, pos, dir = [0, 0, 1], { puffs = 2, size = 1, seed = this.shots.length + 1 } = {}) {
    const r = rng(seed * 7 + 3), d = new THREE.Vector3(...dir).normalize();
    this.shots.push({ t0, pos: new THREE.Vector3(...(pos.isVector3 ? pos.toArray() : pos)), d, size,
      puffs: [...Array(puffs)].map((_, i) => ({ k: 0.45 + r() * 0.9 + i * 0.25, up: (r() - 0.3) * 0.25, side: (r() - 0.5) * 0.35, s: 0.7 + r() * 0.6, rot: r() * 6.28 })) });
    return this;
  }
  // a row of shooters firing together (rolling volley): positions array, start time, ripple delay
  volley(t0, positions, dir, ripple = 0.03, opt = {}) { positions.forEach((p, i) => this.add(t0 + i * ripple + (i % 3) * 0.012, p, dir, { ...opt, seed: Math.floor(t0 * 100) + i })); return this; }
  sprite(pool, map, additive) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map, color: additive ? '#ffffff' : this.o.color, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, fog: true }));
    m.renderOrder = additive ? 6 : 4; this.parent.add(m); pool.push(m); return m;
  }
  update(t) {
    let si = 0, fi = 0; const { life, drift, size, flashSize } = this.o;
    for (const s of this.shots) {
      const a = t - s.t0; if (a < 0 || a > life) continue;
      if (a < 0.09) { const f = this.fpool[fi] || this.sprite(this.fpool, flashTex, true); fi++; f.visible = true; f.position.copy(s.pos).addScaledVector(s.d, 0.12 * s.size); f.scale.setScalar(flashSize * s.size * (1 - a / 0.12)); f.material.rotation = s.t0 * 37; }
      for (const p of s.puffs) {
        const m = this.pool[si] || this.sprite(this.pool, puffTex(), false); si++;
        const burst = 1 - Math.exp(-a * 5), u = a / life;
        m.visible = true;
        m.position.copy(s.pos).addScaledVector(s.d, p.k * burst * s.size);
        m.position.x += drift[0] * a + p.side * burst * s.size; m.position.y += drift[1] * a + p.up * burst * s.size; m.position.z += drift[2] * a;
        m.scale.setScalar(size * s.size * p.s * (0.35 + 1.6 * Math.sqrt(u) + 0.6 * burst));
        m.material.opacity = 0.85 * Math.min(1, a * 12) * Math.pow(1 - u, 1.4); m.material.rotation = p.rot + a * 0.2;
      }
    }
    for (let i = si; i < this.pool.length; i++) this.pool[i].visible = false;
    for (let i = fi; i < this.fpool.length; i++) this.fpool[i].visible = false;
  }
  // [t] list of shot times (for sound events)
  times() { return this.shots.map(s => s.t0); }
}

// Rising embers / sparks for burning cities.
export class Embers {
  constructor(parent, { n = 160, box = [-20, 20, 0, 12, -30, -8], color = '#ffb050', size = 0.18, rise = 1.6, seed = 9 } = {}) {
    const r = rng(seed); this.box = box; this.n = n; this.rise = rise;
    this.p0 = new Float32Array(n * 3); this.ph = new Float32Array(n);
    for (let i = 0; i < n; i++) { this.p0[i * 3] = box[0] + r() * (box[1] - box[0]); this.p0[i * 3 + 1] = box[2] + r() * (box[3] - box[2]); this.p0[i * 3 + 2] = box[4] + r() * (box[5] - box[4]); this.ph[i] = r() * 6.28; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
    this.pts = new THREE.Points(g, new THREE.PointsMaterial({ map: softTex, color, size, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
    this.pts.frustumCulled = false; this.pts.renderOrder = 7; parent.add(this.pts);
  }
  update(t) {
    const [x0, x1, y0, y1, z0, z1] = this.box, p = this.pts.geometry.attributes.position;
    for (let i = 0; i < this.n; i++) {
      const h = y1 - y0, y = y0 + ((this.p0[i * 3 + 1] - y0 + this.rise * t) % h);
      p.setXYZ(i, this.p0[i * 3] + Math.sin(t * 1.7 + this.ph[i]) * 0.5 + (y - y0) * 0.25, y, this.p0[i * 3 + 2] + Math.cos(t * 1.3 + this.ph[i]) * 0.3);
    }
    p.needsUpdate = true; this.pts.material.opacity = 0.75 + 0.25 * Math.sin(t * 13);
  }
}

// Low drifting smoke bank (battlefield haze) made of big soft sprites.
export function haze(parent, { n = 18, box = [-20, 20, 0.5, 3, -30, -6], color = '#d8d4cc', size = 8, opacity = 0.35, seed = 4 } = {}) {
  const r = rng(seed), arr = [];
  for (let i = 0; i < n; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex(), color, transparent: true, opacity, depthWrite: false, fog: true }));
    m.position.set(box[0] + r() * (box[1] - box[0]), box[2] + r() * (box[3] - box[2]), box[4] + r() * (box[5] - box[4])); m.scale.setScalar(size * (0.7 + r() * 0.6)); m.material.rotation = r() * 6; m.renderOrder = 3;
    m.userData.x = m.position.x; m.userData.ph = r() * 6; parent.add(m); arr.push(m); }
  return (t, k = 1) => arr.forEach(m => { m.position.x = m.userData.x + Math.sin(t * 0.1 + m.userData.ph) * 1.5 + t * 0.15; m.material.opacity = opacity * k; m.visible = k > 0.01; });
}
