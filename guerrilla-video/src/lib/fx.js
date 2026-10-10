// Deterministic effects: every update(t) is a pure function of time.
import * as THREE from 'three';
import { rng } from './props.js';
import { clamp, lerp } from './util.js';

const sphereGeo = new THREE.IcosahedronGeometry(1, 1);
const boxGeo = new THREE.BoxGeometry(1, 1, 1);

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
const flashTex = canvasTex(128, 128, (g, w, h) => {
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,230,1)'); gr.addColorStop(0.25, 'rgba(255,210,90,0.95)'); gr.addColorStop(0.6, 'rgba(255,120,20,0.35)'); gr.addColorStop(1, 'rgba(255,80,0,0)');
  g.fillStyle = gr; g.beginPath();
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = i % 2 ? 26 : 64; g.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); }
  g.fill();
});
const softTex = canvasTex(64, 64, (g) => {
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
});

export class Explosion {
  constructor(parent, pos, t0, size = 1, seed = 1, { fire = 0, smokeColor = '#6e6a66', light = 1 } = {}) {
    this.t0 = t0; this.size = size; this.pos = new THREE.Vector3(...pos); this.fire = fire; this.lightK = light;
    const g = this.g = new THREE.Group(); g.position.copy(this.pos); parent.add(g);
    const r = rng(seed);
    this.flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    g.add(this.flash);
    this.balls = [...Array(9)].map(() => {
      const m = new THREE.Mesh(sphereGeo, new THREE.MeshLambertMaterial({ color: '#ffb340', emissive: '#ff7a10', emissiveIntensity: 0.8, flatShading: true, transparent: true, depthWrite: false }));
      m.userData = { d: new THREE.Vector3(r() - 0.5, r() * 0.8 + 0.2, r() - 0.5).normalize(), s: 0.22 + r() * 0.22, sp: 0.6 + r() * 0.8 };
      g.add(m); return m;
    });
    this.smoke = [...Array(14)].map((_, i) => {
      const m = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({ color: new THREE.Color(smokeColor).offsetHSL(0, 0, (r() - 0.5) * 0.12), transparent: true, depthWrite: false, roughness: 1, flatShading: true }));
      m.userData = { d: new THREE.Vector3((r() - 0.5) * 1.4, 0.6 + r() * 0.9, (r() - 0.5) * 1.4), s: 0.28 + r() * 0.28, delay: r() * 0.4 };
      g.add(m); return m;
    });
    this.debris = [...Array(12)].map(() => {
      const m = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: r() > 0.5 ? '#3a3a35' : '#6b5a3a', flatShading: true }));
      m.userData = { v: new THREE.Vector3((r() - 0.5) * 6, 3 + r() * 4, (r() - 0.5) * 6), w: new THREE.Vector3(r() * 9, r() * 9, r() * 9), s: 0.06 + r() * 0.08 };
      m.castShadow = true; g.add(m); return m;
    });
    this.ring = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 32), new THREE.MeshBasicMaterial({ color: '#fff3d0', transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    this.ring.rotation.x = -Math.PI / 2; this.ring.position.y = 0.05; g.add(this.ring);
    this.light = new THREE.PointLight('#ffa040', 0, 14 * size, 1.5); this.light.position.y = 1; g.add(this.light);
    if (fire) {
      this.flames = [...Array(6)].map(() => {
        const m = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.6, 6), new THREE.MeshBasicMaterial({ color: r() > 0.5 ? '#ff8a1f' : '#ffc23a', transparent: true }));
        m.userData = { x: (r() - 0.5) * 0.8, z: (r() - 0.5) * 0.8, ph: r() * 6 }; g.add(m); return m;
      });
      this.fsmoke = [...Array(10)].map((_, i) => {
        const m = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({ color: '#3c3a38', transparent: true, depthWrite: false, flatShading: true }));
        m.userData = { ph: i / 10, x: (r() - 0.5) * 0.4 }; g.add(m); return m;
      });
    }
    this.update(-1);
  }
  update(T) {
    const t = T - this.t0, S = this.size, on = t >= 0;
    this.g.visible = on; if (!on) return;
    const f = clamp(t / 0.12);
    this.flash.scale.setScalar(S * 3.4 * f * (1 - clamp((t - 0.1) / 0.35)) + 0.001);
    this.flash.material.opacity = 1 - clamp((t - 0.1) / 0.35);
    this.light.intensity = 60 * S * this.lightK * Math.max(0, 1 - t / 0.6);
    for (const b of this.balls) {
      const u = b.userData, k = 1 - Math.exp(-t * 6);
      b.position.copy(u.d).multiplyScalar(k * S * u.sp); b.position.y += t * 0.6 * S;
      b.scale.setScalar(S * u.s * (0.4 + k) * (1 - clamp((t - 0.5) / 0.6)) + 0.001);
      b.material.color.setHSL(lerp(0.09, 0.01, clamp(t / 0.5)), 1, lerp(0.55, 0.25, clamp(t / 0.8)));
      b.material.emissive.setHSL(lerp(0.07, 0.0, clamp(t / 0.5)), 1, lerp(0.42, 0.08, clamp(t / 0.8)));
      b.material.opacity = 1 - clamp((t - 0.6) / 0.5); b.visible = t < 1.15;
    }
    for (const m of this.smoke) {
      const u = m.userData, s = Math.max(0, t - u.delay), k = 1 - Math.exp(-s * 1.2);
      m.position.set(u.d.x * k * S, (u.d.y * k * 1.5 + s * 0.25) * S, u.d.z * k * S);
      m.scale.setScalar(S * u.s * (0.3 + k * 1.3));
      m.material.opacity = clamp(s * 3) * 0.6 * (1 - clamp((s - 1.2) / 3.5));
      m.visible = m.material.opacity > 0.01;
    }
    for (const d of this.debris) {
      const u = d.userData, tt = Math.min(t, 2.5);
      let y = u.v.y * tt - 9.8 * tt * tt / 2; const landed = y < 0 && tt > 0.1;
      const tl = landed ? (u.v.y / 9.8) * 2 : tt;
      d.position.set(u.v.x * Math.min(tt, tl) * 0.6 * S, Math.max(0.03, y) * S * 0.6, u.v.z * Math.min(tt, tl) * 0.6 * S);
      d.rotation.set(u.w.x * Math.min(tt, tl), u.w.y * Math.min(tt, tl), u.w.z * Math.min(tt, tl));
      d.scale.setScalar(u.s * S * 1.4);
    }
    const rk = clamp(t / 0.5);
    this.ring.scale.setScalar(0.2 + rk * 3.5 * S); this.ring.material.opacity = 0.7 * (1 - rk); this.ring.visible = rk < 1;
    if (this.flames) {
      const fo = clamp((t - 0.3) * 2) * this.fire;
      for (const m of this.flames) { const u = m.userData; const fl = 0.75 + 0.25 * Math.sin(T * 17 + u.ph) * Math.sin(T * 7 + u.ph * 2);
        m.position.set(u.x * S, 0.3 * S * fl, u.z * S); m.scale.set(S * fo, S * fo * fl * 1.5, S * fo); m.visible = fo > 0.01; }
      for (const m of this.fsmoke) { const u = m.userData, ph = ((T * 0.35 + u.ph) % 1);
        m.position.set(u.x * S + ph * 0.6, (0.6 + ph * 3.2) * S, ph * 0.3); m.scale.setScalar(S * (0.25 + ph * 0.7));
        m.material.opacity = fo * 0.42 * Math.sin(ph * Math.PI); m.visible = fo > 0.01; }
    }
  }
}

// Muzzle flash sprite that follows a gun muzzle. Fires during [a,b] at a given rate.
export class Muzzle {
  constructor(gun, rate = 7) {
    this.rate = rate; this.windows = [];
    this.s = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    this.s.scale.setScalar(0.001); (gun.muzzle || gun).add(this.s);
  }
  fire(a, b) { this.windows.push([a, b]); return this; }
  shots() { const out = []; for (const [a, b] of this.windows) for (let t = a; t < b; t += 1 / this.rate) out.push(t); return out; }
  recoil(t) { for (const [a, b] of this.windows) if (t >= a && t < b) { const ph = ((t - a) * this.rate) % 1; return Math.max(0, 1 - ph * 3); } return 0; }
  update(t) { const k = this.recoil(t); this.s.scale.setScalar(k > 0.45 ? 0.5 + 0.25 * k : 0.001); this.s.material.rotation = t * 37; }
}

// Tracer streaks between two world points during shot times.
export class Tracers {
  constructor(parent, color = '#ffe08a') {
    this.parent = parent; this.items = [];
    this.geo = new THREE.CylinderGeometry(0.012, 0.012, 1, 4); this.geo.rotateX(Math.PI / 2);
    this.mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
  }
  add(t0, from, to) { const m = new THREE.Mesh(this.geo, this.mat); m.visible = false; this.parent.add(m); this.items.push({ t0, from: new THREE.Vector3(...from), to: new THREE.Vector3(...to), m }); }
  update(t) {
    for (const it of this.items) {
      const k = (t - it.t0) / 0.16; it.m.visible = k >= 0 && k <= 1; if (!it.m.visible) continue;
      const a = it.from.clone().lerp(it.to, Math.max(0, k - 0.25)), b = it.from.clone().lerp(it.to, k);
      it.m.position.copy(a).lerp(b, 0.5); it.m.lookAt(b); it.m.scale.set(1, 1, a.distanceTo(b) + 0.01);
    }
  }
}

// Sprite with emoji / text, for "?" "!" bubbles and icons.
export function bubble(text, { w = 256, h = 256, bg = 'rgba(255,255,255,0.95)', fg = '#222', font = 150, round = true, border = '#222' } = {}) {
  const tex = canvasTex(w, h, (g) => {
    if (bg) {
      g.fillStyle = bg; g.strokeStyle = border; g.lineWidth = 8;
      g.beginPath(); if (round) g.roundRect(10, 10, w - 20, h - 50, 40); else g.rect(10, 10, w - 20, h - 50); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(w / 2 - 22, h - 42); g.lineTo(w / 2, h - 8); g.lineTo(w / 2 + 22, h - 42); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(w / 2 - 22, h - 42); g.lineTo(w / 2, h - 8); g.lineTo(w / 2 + 22, h - 42); g.stroke();
      g.fillRect(w / 2 - 18, h - 50, 36, 12);
    }
    g.fillStyle = fg; g.font = `800 ${font}px Inter, "Noto Color Emoji", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, w / 2, (h - 40) / 2 + 12);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  s.scale.set(0.45 * w / h, 0.45, 1); s.renderOrder = 5; return s;
}
// Pop-in animation for a sprite between [a,b].
export function popSprite(s, t, a, b, base = 0.45, y0 = 1.55) {
  const on = t >= a && t < b; s.visible = on; if (!on) return;
  const k = clamp((t - a) / 0.25), out = clamp((b - t) / 0.2);
  const sc = base * (k < 1 ? 1.2 * Math.sin(k * Math.PI * 0.62) / Math.sin(Math.PI * 0.62) : 1) * out;
  s.scale.set(sc * s.material.map.image.width / s.material.map.image.height, sc, 1);
  s.position.y = y0 + 0.05 * Math.sin(t * 4);
}

// Ground ring marker (team color).
export function ring(color, r = 0.45) {
  const m = new THREE.Mesh(new THREE.RingGeometry(r * 0.8, r, 40), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.02; return m;
}

// Soft glow disc / pulse marker on the ground.
export function glow(color, r = 1) {
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, 40), new THREE.MeshBasicMaterial({ color, map: softTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.03; return m;
}

// Little dust puffs kicked up at a point.
export class Dust {
  constructor(parent, seed = 3, n = 8) {
    const r = rng(seed); this.events = [];
    this.puffs = [...Array(n)].map(() => {
      const m = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({ color: '#c8b893', transparent: true, depthWrite: false, flatShading: true }));
      m.userData = { dx: (r() - 0.5) * 0.6, dz: (r() - 0.5) * 0.6, s: 0.08 + r() * 0.08 }; parent.add(m); m.visible = false; return m;
    });
  }
  // emit at time t0, position p
  puff(t0, p) { this.events.push({ t0, p }); }
  update(t) {
    let i = 0;
    for (const m of this.puffs) m.visible = false;
    for (const e of this.events) {
      const k = (t - e.t0) / 0.9; if (k < 0 || k > 1) continue;
      for (let j = 0; j < 4 && i < this.puffs.length; j++, i++) {
        const m = this.puffs[i], u = m.userData; m.visible = true;
        m.position.set(e.p[0] + u.dx * k, 0.05 + k * 0.25, e.p[2] + u.dz * k); m.scale.setScalar(u.s * (0.5 + k * 1.5)); m.material.opacity = 0.7 * (1 - k);
      }
    }
  }
}

export { canvasTex, flashTex, softTex };

// A single tracer streak placed explicitly each frame (k = 0..1 progress).
export class LiveTracer {
  constructor(parent, color = '#ffe08a') {
    const g = new THREE.CylinderGeometry(0.014, 0.014, 1, 4); g.rotateX(Math.PI / 2);
    this.m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color })); this.m.visible = false; parent.add(this.m);
  }
  set(from, to, k) {
    this.m.visible = k >= 0 && k <= 1; if (!this.m.visible) return;
    const a = from.clone().lerp(to, Math.max(0, k - 0.3)), b = from.clone().lerp(to, k);
    this.m.position.copy(a).lerp(b, 0.5); this.m.lookAt(b); this.m.scale.set(1, 1, a.distanceTo(b) + 0.01);
  }
}
export function muzzleWorld(rig) { rig.root.updateMatrixWorld(true); const v = new THREE.Vector3(); (rig.gun.muzzle || rig.gun).getWorldPosition(v); return v; }
