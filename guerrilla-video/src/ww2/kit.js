// WWII props, nation kits and helpers for the Blitzkrieg video.
import * as THREE from 'three';
import * as P from '../lib/props.js';
import * as G from '../lib/gear.js';
import * as F from '../lib/fx.js';
import { at, box, cyl, mesh, rng } from '../lib/props.js';

// ------------------------------------------------------------ nations (vest + helmet colors)
export const NATION = {
  de: { vest: '#5d6157', helmet: '#4f544d', rifle: '#2e3138' },
  fr: { vest: '#6f7f93', helmet: '#5f6f84', rifle: '#3b3a36' },
  uk: { vest: '#7a7350', helmet: '#6b6a45', rifle: '#3b3a36' },
  su: { vest: '#6b6a45', helmet: '#4f5a3a', rifle: '#3b3a36' },
  sw: { vest: '#e8ecef', helmet: '#e3e7ea', rifle: '#3b3a36' },   // Soviet winter smock
  us: { vest: '#6b6b45', helmet: '#59603f', rifle: '#3b3a36' },
  pl: { vest: '#6d6f52', helmet: '#5d6048', rifle: '#3b3a36' },
};

export function helmet(color, style = 'de') {
  const g = new THREE.Group();
  const dome = mesh(new THREE.SphereGeometry(0.36, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2.1), new THREE.MeshStandardMaterial({ color, roughness: 0.7, flatShading: true }));
  dome.scale.set(1.08, 0.62, 1.12); g.add(dome);
  const rimR = style === 'uk' ? 0.5 : 0.4;
  const rim = mesh(new THREE.CylinderGeometry(rimR, rimR * (style === 'de' ? 1.08 : 1.0), 0.04, 20), new THREE.MeshStandardMaterial({ color, roughness: 0.7, flatShading: true }));
  rim.position.y = 0.01; rim.scale.z = style === 'de' ? 1.08 : 1; g.add(rim);
  if (style === 'su' || style === 'sw') { const star = mesh(new THREE.CircleGeometry(0.05, 5), new THREE.MeshBasicMaterial({ color: '#d0302a' })); star.position.set(0, 0.12, 0.37); star.rotation.x = -0.4; g.add(star); }
  return g;
}

export function soldier(rig, nation = 'de', { helm = true, gun = true } = {}) {
  const N = NATION[nation];
  rig.attach('chest', P.vest(N.vest), [0, 0.395, -0.005]);
  if (helm) { const h = helmet(N.helmet, nation === 'uk' ? 'uk' : nation === 'su' || nation === 'sw' ? 'su' : 'de'); h.scale.setScalar(0.86); rig.attach('head', h, [0, 1.06, -0.03]); }
  if (gun) rig.equip(P.rifle(N.rifle, nation === 'de' ? '#5a4632' : '#7a5232'), G.HOLDS);
  rig.nation = nation; return rig;
}

// ------------------------------------------------------------ vehicles
function cross(size = 0.32) {
  const g = new THREE.Group();
  g.add(at(box(size, size * 0.3, 0.01, '#f2f2f2'), 0, 0, 0)); g.add(at(box(size * 0.3, size, 0.01, '#f2f2f2'), 0, 0, 0));
  g.add(at(box(size * 0.8, size * 0.16, 0.015, '#151515'), 0, 0, 0.002)); g.add(at(box(size * 0.16, size * 0.8, 0.015, '#151515'), 0, 0, 0.002));
  return g;
}
function star(size = 0.3) { const m = mesh(new THREE.CircleGeometry(size / 2, 5), new THREE.MeshBasicMaterial({ color: '#c8302a', side: THREE.DoubleSide })); m.rotation.z = Math.PI / 2; return m; }

export function tank(nation = 'de') {
  const col = { de: '#666b6e', su: '#4f5d36', us: '#5b6140', uk: '#6f6c4a', fr: '#6e7258', pl: '#5f6346' }[nation] || '#666b6e';
  const t = P.tank(col);
  const mark = () => (nation === 'de' ? cross() : nation === 'su' ? star() : (() => { const s = star(0.32); s.material = new THREE.MeshBasicMaterial({ color: '#f2f2f2', side: THREE.DoubleSide }); return s; })());
  if (nation === 'de' || nation === 'su' || nation === 'us') {
    const a = mark(); a.position.set(0.76, 0.55, 0.3); a.rotation.y = Math.PI / 2; t.body.add(a);
    const b = mark(); b.position.set(-0.76, 0.55, 0.3); b.rotation.y = -Math.PI / 2; t.body.add(b);
  }
  return t;
}

export function plane(color = '#6b7066', { kind = 'fighter', mark = null } = {}) {
  const g = new THREE.Group(), s = kind === 'bomber' ? 1.6 : 1;
  const m = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, flatShading: true });
  const fus = mesh(new THREE.CapsuleGeometry(0.16 * s, 1.3 * s, 4, 10), m(color)); fus.rotation.x = Math.PI / 2; g.add(fus);
  const wing = mesh(new THREE.BoxGeometry(2.4 * s, 0.05, 0.42 * s), m(color)); wing.position.set(0, -0.04, 0.15 * s); g.add(wing);
  const tail = mesh(new THREE.BoxGeometry(0.8 * s, 0.04, 0.25 * s), m(color)); tail.position.set(0, 0.02, -0.75 * s); g.add(tail);
  const fin = mesh(new THREE.BoxGeometry(0.04, 0.32 * s, 0.25 * s), m(color)); fin.position.set(0, 0.17 * s, -0.75 * s); g.add(fin);
  const canopy = mesh(new THREE.SphereGeometry(0.13 * s, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#9fd0e6', roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.6 }));
  canopy.scale.z = 1.8; canopy.position.set(0, 0.12 * s, 0.05 * s); g.add(canopy);
  const prop = new THREE.Group(); prop.position.z = 0.82 * s; g.add(prop);
  prop.add(at(box(0.05, 0.62 * s, 0.03, '#222'), 0, 0, 0)); prop.add(at(box(0.62 * s, 0.05, 0.03, '#222'), 0, 0, 0));
  g.add(at(mesh(new THREE.ConeGeometry(0.1 * s, 0.18 * s, 8), m('#333')), 0, 0, 0.8 * s, Math.PI / 2, 0, 0));
  if (kind === 'bomber') for (const x of [-0.6, 0.6]) g.add(at(mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8), m(color)), x, -0.05, 0.35, Math.PI / 2, 0, 0));
  if (mark === 'de') for (const x of [-0.85, 0.85]) { const c = cross(0.28); c.rotation.x = -Math.PI / 2; c.position.set(x * s, -0.01, 0.15 * s); g.add(c); }
  if (mark === 'uk') for (const x of [-0.85, 0.85]) {
    for (const [r, c] of [[0.17, '#1f3f8f'], [0.12, '#f2f2f2'], [0.07, '#c8302a']]) { const d = mesh(new THREE.CircleGeometry(r * s, 18), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); d.rotation.x = -Math.PI / 2; d.position.set(x * s, 0.0 + (0.2 - r) * 0.02, 0.15 * s); g.add(d); }
  }
  g.prop = prop; return g;
}

export function bunker(color = '#a6a49a') {
  const g = new THREE.Group();
  g.add(at(box(2.2, 1.0, 1.6, color), 0, 0.5, 0));
  g.add(at(box(1.2, 0.12, 0.05, '#222'), 0, 0.7, 0.81));
  const cup = mesh(new THREE.SphereGeometry(0.45, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), color); cup.position.set(0.4, 1.0, -0.2); g.add(cup);
  g.add(at(box(0.5, 0.06, 0.05, '#222'), 0.4, 1.18, 0.23));
  return g;
}

export function ruin(seed = 1, w = 2.2, h = 2.4, color = '#b9ad98') {
  const g = new THREE.Group(), r = rng(seed);
  for (let side = 0; side < 3; side++) {
    for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) {
      const top = h * (0.4 + 0.6 * r());
      if (j * h / 4 > top) continue;
      const b = box(w / 5 - 0.01, h / 4 - 0.01, 0.18, r() > 0.15 ? color : '#8f8676');
      if (side === 0) b.position.set(-w / 2 + (i + 0.5) * w / 5, (j + 0.5) * h / 4, w / 2);
      if (side === 1) { b.position.set(-w / 2, (j + 0.5) * h / 4, -w / 2 + (i + 0.5) * w / 5); b.rotation.y = Math.PI / 2; }
      if (side === 2) { b.position.set(-w / 2 + (i + 0.5) * w / 5, (j + 0.5) * h / 4, -w / 2); }
      if ((i === 1 || i === 3) && j === 2) continue; // windows
      g.add(b);
    }
  }
  for (let i = 0; i < 10; i++) { const k = P.rock(0.3 + r() * 0.4, '#9a9182', seed * 10 + i); k.position.set((r() - 0.5) * w * 1.4, 0.05, (r() - 0.3) * w * 1.4); g.add(k); }
  return g;
}

export function factory(color = '#a0583f', roof = '#5a5e64') {
  const g = new THREE.Group();
  g.add(at(box(6, 2.4, 3.6, color), 0, 1.2, 0));
  for (let i = 0; i < 4; i++) { const r = mesh(new THREE.CylinderGeometry(0.01, 0.95, 0.8, 3), roof); r.rotation.set(0, 0, 0); r.scale.set(1, 1, 3.6 / 1.65); r.position.set(-2.25 + i * 1.5, 2.8, 0); r.rotation.y = Math.PI / 2; g.add(r); }
  for (const x of [-2.2, -1.2]) g.add(at(cyl(0.22, 0.28, 2.6, '#7d4a36', 10), x, 3.6, -1.2));
  g.add(at(box(1.6, 1.3, 0.05, '#2a2a2a'), 1.6, 0.65, 1.81));
  for (let i = 0; i < 4; i++) g.add(at(box(0.6, 0.5, 0.05, '#ffe7a8'), -2.4 + i * 1.0, 1.6, 1.81));
  g.chimneys = [[-2.2, 4.9, -1.2], [-1.2, 4.9, -1.2]];
  return g;
}

export function boat(color = '#5f6b75', len = 3) {
  const g = new THREE.Group();
  const hull = box(1.1, 0.5, len, color); hull.position.y = 0.15; g.add(hull);
  const bow = mesh(new THREE.ConeGeometry(0.56, 0.9, 4), color); bow.rotation.set(Math.PI / 2, Math.PI / 4, 0); bow.scale.set(1, 1, 0.45); bow.position.set(0, 0.15, len / 2 + 0.4); g.add(bow);
  g.add(at(box(0.7, 0.6, 0.9, '#d9d6cf'), 0, 0.7, -0.4)); g.add(at(cyl(0.08, 0.1, 0.6, '#333', 6), 0, 1.2, -0.4));
  return g;
}
export function landingCraft(color = '#6b7160') {
  const g = new THREE.Group();
  g.add(at(box(1.6, 0.7, 2.6, color), 0, 0.25, 0));
  const inner = box(1.3, 0.1, 2.3, '#4f554a'); inner.position.y = 0.45; g.add(inner);
  const ramp = new THREE.Group(); ramp.position.set(0, -0.05, 1.3); g.add(ramp);
  const rp = box(1.5, 0.75, 0.08, color); rp.position.y = 0.37; ramp.add(rp);
  g.ramp = ramp; return g;
}

export function snow(parent, n = 900, area = [-15, -10, 15, 10], h = 8, seed = 4) {
  const r = rng(seed), pos = new Float32Array(n * 3), base = [];
  for (let i = 0; i < n; i++) base.push([area[0] + r() * (area[2] - area[0]), r() * h, area[1] + r() * (area[3] - area[1]), r()]);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: '#ffffff', size: 0.07, transparent: true, opacity: 0.9, depthWrite: false }));
  parent.add(pts);
  pts.update = (t, wind = 1) => {
    for (let i = 0; i < n; i++) {
      const [x, y, z, ph] = base[i];
      const yy = ((y - t * (0.9 + ph * 0.6)) % h + h) % h;
      pos[i * 3] = x + Math.sin(t * 1.3 + ph * 9) * 0.3 + ((t * wind * 1.5 + ph * 20) % 6) - 3; pos[i * 3 + 1] = yy; pos[i * 3 + 2] = z + Math.cos(t + ph * 7) * 0.3;
    }
    g.attributes.position.needsUpdate = true;
  };
  return pts;
}

export function candle(seed = 0) {
  const g = new THREE.Group(), r = rng(seed);
  const hgt = 0.18 + r() * 0.2;
  g.add(at(cyl(0.05, 0.055, hgt, '#efe8d8', 10), 0, hgt / 2, 0));
  const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: F.flashTex, color: '#ffc46b', blending: THREE.AdditiveBlending, depthWrite: false }));
  fl.position.y = hgt + 0.06; fl.scale.set(0.1, 0.16, 1); g.add(fl);
  g.flicker = t => { const k = 0.85 + 0.15 * Math.sin(t * 13 + seed * 3) * Math.sin(t * 7.3 + seed); fl.scale.set(0.1 * k, 0.17 * k, 1); };
  return g;
}

export function radar() {
  const g = new THREE.Group();
  for (const [x, z] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) g.add(at(cyl(0.04, 0.06, 5, '#8a8f94', 5), x * 0.6, 2.5, z * 0.6, x * 0.08, 0, -z * 0.08));
  const head = new THREE.Group(); head.position.y = 5.1; g.add(head);
  head.add(at(box(1.6, 0.6, 0.06, '#9aa0a6'), 0, 0, 0));
  for (let i = 0; i < 5; i++) head.add(at(box(0.04, 0.6, 0.12, '#5a5e64'), -0.7 + i * 0.35, 0, 0.05));
  g.head = head; return g;
}

export { cross, star };
