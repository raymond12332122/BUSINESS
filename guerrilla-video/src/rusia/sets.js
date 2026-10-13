// Sets for the Russian Revolution video (1905-1924, plus Coyoacán 1937-1940). Each builder returns a THREE.Scene.
// Scale: chibi ≈ 1.15 tall, so buildings and vehicles are ≈ real size × 0.65.
import * as THREE from 'three';
import * as LP from '../lib/props.js';
import { stage, aimSun, mood } from '../lib/stage.js';
import { L2 } from '../napo/sets.js';
import * as MX from '../mx/props.js';
import * as NP from '../napo/props.js';
import * as N from '../narco/props.js';
import * as P from './props.js';
import { mergeGeometries as mergeGeo } from 'three/addons/utils/BufferGeometryUtils.js';

export { aimSun, mood };
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o });
const at = LP.at, box = LP.box, cyl = LP.cyl;

export const LIGHT = {
  ...L2,
  snow: { skyTop: '#7a8aa3', skyHor: '#d8dde4', sunColor: '#eef2ff', sun: 1.5, hemi: 1.35, hemiSky: '#dfe8f5', hemiGround: '#9aa3ae', fog: ['#cdd3db', 28, 130] },
  snowDusk: { skyTop: '#33416a', skyHor: '#e3a37c', sunColor: '#ffc39a', sun: 1.3, hemi: 1.0, hemiSky: '#c9cfe6', hemiGround: '#7a7f8e', fog: ['#b9a7a4', 30, 140] },
  snowNight: { skyTop: '#05080f', skyHor: '#222c44', sunColor: '#9fb2ff', sun: 0.55, hemi: 0.75, hemiSky: '#7d8cc0', hemiGround: '#3a4054', fog: ['#151c2e', 22, 110] },
  night: { skyTop: '#05070f', skyHor: '#1c2640', sunColor: '#8fa4ff', sun: 0.5, hemi: 0.6, hemiSky: '#6c7fb0', hemiGround: '#24242c', fog: ['#121828', 20, 110] },
  summerNight: { skyTop: '#070c1c', skyHor: '#2c3a5c', sunColor: '#a8b8ff', sun: 0.45, hemi: 0.6, hemiSky: '#7080b0', hemiGround: '#2a2a26', fog: ['#1a2236', 18, 90] },
  grey: { skyTop: '#76808e', skyHor: '#c3c4c0', sunColor: '#e8e6e0', sun: 1.4, hemi: 1.35, hemiSky: '#dde2e8', hemiGround: '#7a7468', fog: ['#bdbdb6', 26, 120] },
  mexDay: { skyTop: '#3f7fd0', skyHor: '#eae2cc', sunColor: '#fff0d6', sun: 2.8, hemi: 1.15, hemiSky: '#e8f0ff', hemiGround: '#9a8460', fog: ['#e8e0cc', 45, 200] },
};
export const isNight = l => /night|Night/.test(l);
export const SNOW = ['#e9eef3', '#dfe5eb'];
const LOW = ['dusk', 'golden', 'sunrise', 'snowDusk', 'dawn'];
export function rStage(light = 'snow', ground = SNOW, extra = {}) {
  const L = LIGHT[light];
  const s = stage({ ...L, groundA: ground ? ground[0] : null, groundB: ground ? ground[1] : null, shadow: 18, sunPos: LOW.includes(light) ? [-12, 7, 6] : [7, 14, 8], seed: 7, ...extra });
  s.userData.sun.shadow.mapSize.set(1536, 1536);
  if (isNight(light)) s.userData.sun.castShadow = false;           // moonlight shadows are barely visible and cost ~40% of a frame
  ticker(s); return s;
}
export function stars(s, n = 600) {
  const r = LP.rng(77);
  s.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([...Array(n)].flatMap(() => { const a = r() * 6.28, b = r() * 1.2 + 0.15; return [Math.cos(a) * 300 * Math.cos(b), 300 * Math.sin(b), Math.sin(a) * 300 * Math.cos(b)]; }), 3)),
    new THREE.PointsMaterial({ color: '#ffffff', size: 1.3, sizeAttenuation: false, fog: false })));
}
// Point a beam group (beam built along -y) along dir.
export function aimBeam(g, dir) { g.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.clone().normalize()); }
// Merge the static meshes of each set into one mesh per material (SwiftShader is bound by draw calls).
// Skips skinned/instanced meshes, maps, anything under an object flagged userData.dynamic or exposing wave/update/aim/set.
const isDyn = o => { for (let p = o; p; p = p.parent) { const u = p.userData; if (u && u.dynamic) return true; if (p !== o && (typeof p.wave === 'function' || typeof p.update === 'function' || typeof p.aim === 'function' || typeof p.set === 'function')) return true; } return false; };
export function bake(s) {
  if (!s || s.mapGroup || s.userData.baked) return s;
  s.updateMatrixWorld(true);
  const groups = new Map();
  s.traverse(o => {
    if (!o.isMesh || o.isSkinnedMesh || o.isInstancedMesh || Array.isArray(o.material) || !o.visible || o.renderOrder || isDyn(o)) return;
    const m = o.material, g = o.geometry;
    if (!m || !m.isMaterial || m.isShaderMaterial || !g.attributes.position || !g.attributes.normal || g.morphAttributes?.position) return;
    if (g.attributes.color && !m.vertexColors) return;
    const attrs = Object.keys(g.attributes).sort().join(',');
    const uniq = Object.prototype.hasOwnProperty.call(m, 'onBeforeCompile') || m.map?.isCanvasTexture === false && /Mouth|Eyes/.test(m.name) ? m.uuid : '';
    const key = [uniq, m.type, m.color?.getHexString(), m.emissive?.getHexString(), m.emissiveIntensity, m.roughness, m.metalness, m.map?.uuid, m.side, m.transparent, m.opacity, m.flatShading, m.vertexColors, m.depthWrite, m.blending, o.castShadow, o.receiveShadow, attrs, !!g.index].join('|');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(o);
  });
  let removed = 0, added = 0;
  for (const list of groups.values()) {
    if (list.length < 2) continue;
    const geos = list.map(o => { const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld); for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv', 'color'].includes(k)) g.deleteAttribute(k); g.clearGroups(); return g; });
    const merged = mergeGeo(geos, false); if (!merged) continue;
    const mm = new THREE.Mesh(merged, list[0].material); mm.castShadow = list[0].castShadow; mm.receiveShadow = list[0].receiveShadow; mm.frustumCulled = false;
    s.add(mm); added++;
    for (const o of list) { o.parent.remove(o); removed++; }
    geos.forEach(g => g.dispose());
  }
  s.userData.baked = true; s.userData.bakeStats = [removed, added];
  return s;
}
export function bakeAll(scenes) { scenes.forEach(bake); }
// Things scenes should tick every frame: s.tick(t) runs them all.
function ticker(s) { s.ticks = s.ticks || []; s.tick = t => s.ticks.forEach(f => f(t)); return s.ticks; }
function smokeFrom(s, origin, opts) { const f = MX.smokeTrail(s, opts.n || 12, opts); ticker(s).push(t => f(t, origin, 1)); }

// Interior box room: back wall at z=-d/2, side walls at x=±w/2, open towards +z.
export function room({ w = 10, d = 8, h = 3.2, wall = '#6a4a32', lower = null, lowerH = 1.0, floor = '#5a3a24', ceil = '#e8dcc0', hemi = 0.85, sunI = 0.9, lights = [], bg = '#120c08', trim = null, wallTex = null } = {}) {
  const s = new THREE.Scene(); s.background = new THREE.Color(bg);
  const hl = new THREE.HemisphereLight('#ffe7c4', '#3a2a1e', hemi); s.add(hl);
  const sun = new THREE.DirectionalLight('#ffe0b0', sunI); sun.position.set(3, 8, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004;
  Object.assign(sun.shadow.camera, { left: -w / 2 - 2, right: w / 2 + 2, top: 8, bottom: -8, near: 0.5, far: 40 }); s.add(sun, sun.target);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), std(floor, { roughness: 0.6 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; s.add(fl);
  const wm = wallTex ? new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9, side: THREE.DoubleSide }) : std(wall, { roughness: 0.9, side: THREE.DoubleSide });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wm); back.position.set(0, h / 2, -d / 2); back.receiveShadow = true; s.add(back);
  for (const sx of [-1, 1]) { const side = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wm); side.position.set(sx * w / 2, h / 2, 0); side.rotation.y = -sx * Math.PI / 2; side.receiveShadow = true; s.add(side); }
  const ce = new THREE.Mesh(new THREE.PlaneGeometry(w, d), std(ceil, { side: THREE.DoubleSide })); ce.rotation.x = Math.PI / 2; ce.position.y = h; s.add(ce);
  if (lower) { s.add(at(box(w, lowerH, 0.06, lower), 0, lowerH / 2, -d / 2 + 0.03)); for (const sx of [-1, 1]) s.add(at(box(0.06, lowerH, d, lower), sx * (w / 2 - 0.03), lowerH / 2, 0)); }
  if (trim) { s.add(at(box(w, 0.18, 0.1, trim), 0, h - 0.2, -d / 2 + 0.05)); for (const sx of [-1, 1]) s.add(at(box(0.1, 0.18, d, trim), sx * (w / 2 - 0.05), h - 0.2, 0)); }
  for (const [x, y, z, i = 5, c = '#ffd9a0', dist = 14] of lights) { const l = new THREE.PointLight(c, i, dist, 1.4); l.position.set(x, y, z); s.add(l); }
  s.userData = { sun, hemi: hl, interior: true }; ticker(s); if (sunI < 0.4) sun.castShadow = false;
  return s;
}
// Window in a back wall (plane facing +z) showing a flat outside colour, with frame, cross bars and curtains.
function wallWindow(s, x, y, z, { w = 1.2, h = 1.8, out = '#a8c0d8', frame = '#e8e2d4', curtain = null, bars = false, glow = false } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); s.add(g);
  g.add(new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: out })));
  g.add(at(box(w + 0.14, 0.08, 0.08, frame), 0, h / 2, 0.04)); g.add(at(box(w + 0.14, 0.12, 0.14, frame), 0, -h / 2, 0.06));
  for (const sx of [-1, 1]) g.add(at(box(0.08, h, 0.08, frame), sx * w / 2, 0, 0.04));
  g.add(at(box(0.05, h, 0.05, frame), 0, 0, 0.03)); g.add(at(box(w, 0.05, 0.05, frame), 0, h * 0.18, 0.03));
  if (bars) for (let i = 1; i < 5; i++) g.add(at(box(0.03, h, 0.03, '#2a2a2a'), -w / 2 + i * w / 5, 0, 0.1));
  if (curtain) for (const sx of [-1, 1]) g.add(at(box(0.36, h + 0.5, 0.06, curtain), sx * (w / 2 + 0.12), 0.15, 0.12));
  if (glow) { const l = new THREE.PointLight(out, 2, 6, 1.5); l.position.set(0, 0, 0.8); g.add(l); }
  return g;
}
function deadTree(s = 1, seed = 0) {
  const g = new THREE.Group(), r = LP.rng(seed + 41), c = '#3e352c';
  g.add(at(cyl(0.06 * s, 0.12 * s, 2.6 * s, c, 6), 0, 1.3 * s, 0, (r() - 0.5) * 0.15, 0, (r() - 0.5) * 0.15));
  for (let i = 0; i < 4; i++) { const b = cyl(0.025 * s, 0.045 * s, (0.7 + r() * 0.6) * s, c, 5); const a = r() * 6.28; b.position.set(Math.cos(a) * 0.22 * s, (1.4 + r() * 1.0) * s, Math.sin(a) * 0.22 * s); b.rotation.set(Math.sin(a) * 0.8, 0, -Math.cos(a) * 0.8); g.add(b); }
  return g;
}
function snowRoofs(g) { g.traverse(o => { if (o.isMesh && o.geometry?.type === 'ExtrudeGeometry') o.material = std('#e6ebf0'); }); return g; }

// ------------------------------------------------------------ Palace Square with the red Winter Palace and the Alexander Column
export function palaceSquare(light = 'snow', { lit = false, barricade = false, snowing = false } = {}) {
  const night = isNight(light);
  const s = rStage(light, SNOW, { seed: 301 });
  const pal = P.winterPalace({ len: 76, lit: night || lit }); pal.position.set(0, 0, -36); s.add(pal); s.palace = pal;
  s.add(at(box(76, 0.4, 1.6, '#eef2f5'), 0, 0.2, -31.2));
  for (const x of [-38, 38]) s.add(at(box(0.4, 0.2, 8, '#eef2f5'), x, 0.1, -36));
  const col = P.alexanderColumn(22); col.position.set(-10, 0, -15); s.add(col); s.column = col;
  for (let i = 0; i < 7; i++) { const l = P.gasLamp(night, 3.4, i % 3 === 0); l.position.set(-27 + i * 9, 0, -28.6); s.add(l); }
  // General Staff building with its arch (seen in reverse shots)
  const gs = new THREE.Group(); gs.position.set(0, 0, 44); gs.rotation.y = Math.PI; s.add(gs);
  gs.add(at(box(90, 9, 8, '#e3c27a'), 0, 4.5, 0)); gs.add(at(box(90.4, 0.4, 8.4, '#f3ead6'), 0, 9, 0));
  gs.add(at(box(14, 15, 9, '#e3c27a'), 0, 7.5, 0.6)); gs.add(at(box(14.4, 0.5, 9.4, '#f3ead6'), 0, 15, 0.6));
  const arch = new THREE.Shape(); arch.moveTo(-3, 0); arch.lineTo(3, 0); arch.lineTo(3, 6); arch.absarc(0, 6, 3, 0, Math.PI, false); arch.closePath();
  gs.add(at(LP.mesh(new THREE.ShapeGeometry(arch), '#2a2622'), 0, 0, 5.12));
  gs.add(at(box(5, 2.2, 3, '#3a3a34'), 0, 16.3, 0.6));
  for (let x = -43; x < 44; x += 2.6) if (Math.abs(x) > 7.5) for (const y of [2.4, 6.2]) gs.add(at(box(1.0, 1.7, 0.08, night ? '#ffd28a' : '#3a4450'), x, y, 4.02));
  if (barricade) {
    s.barricades = [];
    for (const [x, z] of [[-12, -25.5], [-4, -25], [4, -25], [12, -25.5]]) { const w = P.woodpile(6, 1.3, x | 0); w.position.set(x, 0, z); s.add(w); s.barricades.push(w); }
    s.fires = [[-17, -23], [17, -23]].map(([x, z], i) => { const f = P.bonfire(1, i); f.position.set(x, 0, z); s.add(f); ticker(s).push(t => f.update(t)); return f; });
  }
  if (night) { const fl = new THREE.PointLight('#ffcf8a', 30, 40, 1.2); fl.position.set(0, 6, -27); s.add(fl); }
  if (snowing) { const sn = P.snowfall(s, { area: [-20, 0, -30, 20, 14, 14] }); ticker(s).push(t => sn.update(t)); }
  return s;
}
// ------------------------------------------------------------ Petrograd street (Nevsky-style), with a bakery
export function petroStreet(light = 'snow', { lit = 0, bakery = true, snowing = false, len = 90 } = {}) {
  const night = isNight(light);
  const s = rStage(light, SNOW, { seed: 321 });
  s.add(at(box(9.2, 0.02, len, '#cfd5dc'), 0, 0.011, -20));
  for (const x of [-2.7, -1.5, 1.5, 2.7]) s.add(at(box(0.32, 0.022, len, '#bcbab4'), x, 0.013, -20));               // sledge/wheel ruts
  for (const x of [-0.55, 0.55]) s.add(at(box(0.07, 0.05, len, '#7a7e84'), x, 0.03, -20));                         // tram rails
  for (const sx of [-1, 1]) { s.add(at(box(2.4, 0.18, len, '#bfc3c6'), sx * 5.8, 0.09, -20)); s.add(at(box(0.7, 0.35, len, '#eef2f5'), sx * 4.75, 0.17, -20)); }
  const cols = ['#d9b46a', '#d99a8a', '#9aaab8', '#a8b89a', '#c9a46a', '#e0c9a0', '#b88a7a', '#d8cfa0'];
  s.left = []; s.right = [];
  for (let i = 0; i < 9; i++) for (const sx of [-1, 1]) {
    const w = 8 + ((i * 7 + (sx > 0 ? 3 : 0)) % 3), h = 9 + ((i + (sx > 0 ? 1 : 0)) % 3) * 1.1;
    const b = P.petroBuilding(w, h, cols[(i * 3 + (sx > 0 ? 5 : 0)) % cols.length], i * 2 + (sx > 0 ? 1 : 0), { lit: night ? 0.55 : lit });
    b.position.set(sx * 10.0, 0, 10 - i * 8.6); b.rotation.y = -sx * Math.PI / 2; s.add(b); (sx < 0 ? s.left : s.right).push(b);
  }
  if (bakery) {   // pre-1918 spelling: ХЛѢБЪ = bread
    const sg = P.signBoard('ХЛѢБЪ', { w: 3.4, h: 0.75, bg: '#7a2a1e', fg: '#f3e2b0' }); sg.position.set(-6.94, 3.45, -4.3); sg.rotation.y = Math.PI / 2; s.add(sg); s.bakerySign = sg;
    s.add(at(box(0.1, 1.9, 2.6, '#3a2a20'), -6.98, 1.2, -4.3)); s.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 2.2), std(night ? '#ffd690' : '#2b3644', night ? { emissive: '#ffbe66', emissiveIntensity: 0.8 } : { roughness: 0.3 })), -6.94, 1.25, -4.3));
    s.bakery = new THREE.Vector3(-6.4, 0, -4.3);
  }
  for (let i = 0; i < 8; i++) for (const sx of [-1, 1]) { const l = P.gasLamp(night, 3.4, (i + (sx > 0 ? 1 : 0)) % 3 === 0 && i < 5); l.position.set(sx * 4.4, 0, 8 - i * 9); s.add(l); }
  if (snowing) { const sn = P.snowfall(s, { area: [-12, 0, -30, 12, 12, 12] }); ticker(s).push(t => sn.update(t)); }
  return s;
}
// ------------------------------------------------------------ Pskov station at night: imperial train on the platform
export function pskovStation({ snowing = true } = {}) {
  const s = rStage('snowNight', SNOW, { seed: 311 });
  s.add(P.track(160));
  const tr = P.imperialTrain(3, { lit: true }); tr.position.set(0, 0, 18); s.add(tr); s.train = tr;
  const pf = P.platform(70, { snow: true, lamps: 7 }); pf.position.set(3.4, 0, -4); s.add(pf); s.platform = pf;
  const st = P.stationHouse('ПСКОВЪ', { lit: 0.7 }); st.position.set(12.4, 0, -6); st.rotation.y = -Math.PI / 2; s.add(st); s.station = st;
  const t2 = P.track(160); t2.position.x = -3.6; s.add(t2);
  smokeFrom(s, tr.stack.clone().add(tr.position), { color: '#c8ccd4', size: 0.6, rise: 4, drift: [-0.5, 0, -2.5], life: 3.2, opacity: 0.55 });
  const lamp = new THREE.PointLight('#ffd9a0', 10, 22, 1.4); lamp.position.set(4, 4, 0); s.add(lamp);
  if (snowing) { const sn = P.snowfall(s, { area: [-14, 0, -24, 14, 12, 14] }); ticker(s).push(t => sn.update(t)); }
  return s;
}
// ------------------------------------------------------------ saloon car interior (abdication, 2/15 March 1917)
export function trainSaloon() {
  const s = room({ w: 8, d: 3.0, h: 2.2, wall: '#3f5a40', lower: '#5a3422', lowerH: 0.75, floor: '#6a2a24', ceil: '#efe6d0', hemi: 0.75, sunI: 0.35, bg: '#0c0a08',
    trim: '#c9a227', lights: [[-2.0, 1.95, 0.2, 2.0, '#ffd9a0', 8], [2.0, 1.95, 0.2, 2.0, '#ffd9a0', 8], [0, 1.1, 0.5, 1.2, '#ffd9a0', 4]] });
  for (const x of [-2.6, 0, 2.6]) wallWindow(s, x, 1.25, -1.49, { w: 0.9, h: 0.8, out: '#18223c', frame: '#4a2a1a' });
  for (const x of [-2.6, 0, 2.6]) for (const sx of [-1, 1]) s.add(at(box(0.14, 1.0, 0.05, '#6a2228'), x + sx * 0.58, 1.3, -1.42));    // narrow drapes
  for (const x of [-2.0, 2.0]) { s.add(at(LP.mesh(new THREE.SphereGeometry(0.09, 12, 8), new THREE.MeshBasicMaterial({ color: '#fff0c8' })), x, 2.08, 0.2)); s.add(at(cyl(0.15, 0.04, 0.07, '#c9a227', 12), x, 2.16, 0.2)); }
  const d = P.desk(1.5, 0.7, '#4a2a1a'); d.position.set(0, 0, -0.55); s.add(d); s.desk = d;
  const lamp = P.deskLamp(true, '#2f6a3a'); lamp.position.set(0.24, d.top, -0.62); s.add(lamp);
  const pap = P.papers(3, 2); pap.position.set(-0.04, d.top, -0.5); s.add(pap); s.paper = pap;
  const ink = new THREE.Group(); ink.add(at(cyl(0.025, 0.025, 0.03, '#1a1a1a', 10), 0, 0.015, 0)); ink.add(at(cyl(0.003, 0.003, 0.09, '#e8e2d4', 4), 0.015, 0.05, 0, 0, 0, 0.4)); ink.position.set(-0.22, d.top, -0.62); s.add(ink);
  const ch = P.chairR('#4a2a1a', '#2f5a3a'); ch.position.set(0, 0, -0.98); s.add(ch); s.chair = ch; s.seat = [0, ch.top - 0.12, -0.93];
  const so = P.sofa(2.2, '#2f5a3a', '#4a2a1a'); so.position.set(-2.4, 0, -1.25); s.add(so);
  const so2 = P.sofa(1.8, '#2f5a3a', '#4a2a1a'); so2.position.set(2.5, 0, -1.25); s.add(so2);
  const ic = P.icon(4); ic.children[1].visible = false; ic.scale.setScalar(0.6); ic.position.set(-3.95, 0.05, 0.4); ic.rotation.y = Math.PI / 2; s.add(ic);
  s.add(at(box(8, 0.02, 0.9, '#7a3a2a'), 0, 0.012, 0.5));
  return s;
}
// ------------------------------------------------------------ peasant village (izbas, wattle fences, well sweep, birches, church)
export function village(light = 'overcast', { snow = false, famine = false } = {}) {
  const g = snow ? SNOW : ['#8a9a62', '#7a8a56'];
  const s = rStage(light, g, { seed: 331, bumps: 0.4 });
  s.houses = [];
  for (const [x, z, r] of [[-7.5, -7, 0.2], [-1.5, -10, 0.02], [4.5, -8, -0.25], [10.5, -10, -0.1], [-13.5, -11, 0.3], [16, -14, -0.3]]) {
    const h = NP.izba((x | 0) + 9); h.position.set(x, 0, z); h.rotation.y = r; if (snow) snowRoofs(h); s.add(h); s.houses.push(h);
    if (!famine) smokeFrom(s, new THREE.Vector3(x + 0.6, 3.7, z - 0.3), { n: 8, color: '#b8b4ae', size: 0.35, rise: 2.4, drift: [1.2, 0, 0], life: 3.4, opacity: 0.5 });
  }
  for (const [x, z, r] of [[-7.5, -3.6, 0.2], [4.5, -4.6, -0.25]]) { const f = P.wattle(6, 0.9, x | 0); f.position.set(x, 0, z); f.rotation.y = r; s.add(f); }
  const w = P.wellSweep(); w.position.set(1.0, 0, -4); s.add(w);
  if (!snow) for (const [x, z] of [[-11, -4], [9, -5]]) { const hs = NP.haystack(1); hs.position.set(x, 0, z); s.add(hs); }
  const ch = new THREE.Group(); ch.add(at(box(4, 5, 4, '#efe9dc'), 0, 2.5, 0)); const dm = NP.onion({ r: 1.0, color: snow ? '#3f6a8a' : '#3f6a8a', h: 1.2 }); dm.position.y = 5; ch.add(dm); ch.position.set(-4, 0, -34); s.add(ch);
  LP.scatter(s, (r, i) => (i % 4 ? LP.birch(1.3 + r() * 0.5, i) : LP.pine(1.4 + r() * 0.5, '#2f4a3a', i)), 70, [-60, -70, 60, -15], 332, [[-4, -34, 4]]);
  if (snow) s.traverse(o => { if (o.isMesh && o.geometry?.type === 'IcosahedronGeometry') o.material = std('#d8e0e4'); });
  return s;
}
// ------------------------------------------------------------ St George throne hall (white marble, gold, double-headed eagle)
export function throneHall() {
  const pq = P.canvasTex(512, 512, (x, W) => { for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { x.fillStyle = ['#6a4428', '#7a5232', '#5e3c24', '#734c2e'][(i + j * 3) % 4]; if ((i + j) % 2) x.fillRect(i * 32, j * 32, 32, 32); else { x.fillRect(i * 32, j * 32, 32, 32); x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(i * 32 + 15, j * 32, 2, 32); } } });
  pq.wrapS = pq.wrapT = THREE.RepeatWrapping; pq.repeat.set(4, 4);
  const s = room({ w: 16, d: 14, h: 7, wall: '#f2ede2', floor: '#5e3c24', ceil: '#f6f1e6', hemi: 0.95, sunI: 0.8, bg: '#1a140e', trim: '#d4af37',
    lights: [[-4, 6, 0, 6, '#ffe2b0', 18], [4, 6, 0, 6, '#ffe2b0', 18], [0, 5, -4, 6, '#ffe2b0', 14]] });
  s.children.find(o => o.isMesh && o.geometry.type === 'PlaneGeometry' && o.rotation.x < -1).material = new THREE.MeshStandardMaterial({ map: pq, roughness: 0.45 });
  s.add(at(box(2.6, 0.02, 14, '#8a1f2a'), 0, 0.012, 0));
  for (const sx of [-1, 1]) for (const z of [-5.0, 0.6]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 3.4), std('#c9d2d8', { metalness: 0.6, roughness: 0.15 })); m.position.set(sx * 7.96, 3.0, z + 1.15); m.rotation.y = -sx * Math.PI / 2; s.add(m); s.add(at(box(0.06, 3.7, 1.7, '#d4af37'), sx * 7.97, 3.0, z + 1.15)); }
  for (const sx of [-1, 1]) { s.add(at(box(0.6, 7, 0.3, '#ebe4d6'), sx * 2.6, 3.5, -6.9)); s.add(at(box(0.7, 0.4, 0.4, '#d4af37'), sx * 2.6, 6.6, -6.85)); for (const x of [4.6, 6.6]) { s.add(at(box(1.2, 3.0, 0.08, '#d9cdb0'), sx * x, 3.6, -6.96)); s.add(at(box(1.0, 2.8, 0.08, '#efe6d2'), sx * x, 3.6, -6.92)); } }
  for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) { const z = -5.6 + i * 2.3; for (const dz of [-0.35, 0.35]) { s.add(at(cyl(0.2, 0.22, 6.2, '#f6f2ea', 16), sx * 7.5, 3.1, z + dz)); s.add(at(box(0.5, 0.35, 0.5, '#d4af37'), sx * 7.5, 6.3, z + dz)); } }
  for (let i = 0; i < 3; i++) s.add(at(box(6.4 - i * 1.0, 0.15, 2.8 - i * 0.5, '#8a1f2a'), 0, 0.075 + i * 0.15, -5.4 - i * 0.2));
  const th = NP.throne({ fabric: '#8a1f2a', gold: '#d4af37', h: 2.4 }); th.scale.setScalar(0.62); th.position.set(0, 0.45, -6.0); s.add(th); s.throne = th; s.seat = [0, 0.45 + 0.61 * 0.62 - 0.12, -5.92];
  const back = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 5.4), std('#7a1a24')); back.position.set(0, 3.4, -6.95); s.add(back);
  const eg = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.8), new THREE.MeshStandardMaterial({ map: P.eagleTex(null, '#d4af37', 512), transparent: true, roughness: 0.4, metalness: 0.5 })); eg.position.set(0, 4.3, -6.9); s.add(eg);
  s.add(at(box(4.8, 0.5, 1.4, '#d4af37'), 0, 6.3, -6.4));
  for (const x of [-4, 0, 4]) { const c = NP.chandelier(); c.position.set(x, 5.6, -1 + (x === 0 ? -2 : 1)); s.add(c); }
  return s;
}
// ------------------------------------------------------------ Putilov works: sheds, chimneys, gate
export function factory(light = 'grey', { snow = true, strike = false } = {}) {
  const s = rStage(light, snow ? ['#d6d9dc', '#c6cacd'] : ['#8a8478', '#7c766a'], { seed: 341 });
  const a = P.factoryShed(40, 14, 7, { seed: 1 }); a.position.set(-2, 0, -26); s.add(a);
  const b = P.factoryShed(26, 12, 8, { seed: 2, brick: '#7a4030' }); b.position.set(26, 0, -16); b.rotation.y = -Math.PI / 2; s.add(b);
  const c = P.factoryShed(26, 12, 6, { seed: 3, brick: '#8a5038' }); c.position.set(-28, 0, -14); c.rotation.y = Math.PI / 2; s.add(c);
  s.chimneys = [[-12, -38, 26], [-2, -40, 30], [9, -37, 24]].map(([x, z, h]) => { const ch = P.chimney(h); ch.position.set(x, 0, z); s.add(ch);
    if (!strike) smokeFrom(s, new THREE.Vector3(x, h + 0.3, z), { n: 10, color: '#4a4846', size: 1.6, rise: 9, drift: [7, 0, 2], life: 5, opacity: 0.6 }); return ch; });
  const gate = P.factoryGate(); gate.position.set(0, 0, -10); s.add(gate); s.gate = gate;
  for (const sx of [-1, 1]) s.add(at(box(22, 3.0, 0.6, '#8a4a34'), sx * 15.5, 1.5, -10));
  s.add(at(box(9, 0.02, 30, snow ? '#b8bcbe' : '#6a665e'), 0, 0.012, 2));
  for (const [x, z] of [[14, -4], [16.5, -6]]) { const m = LP.mesh(new THREE.ConeGeometry(1.8, 1.6, 9), std('#26262a', { flatShading: true })); m.position.set(x, 0.8, z); s.add(m); }
  return s;
}
// ------------------------------------------------------------ clandestine basement (Bolshevik cell, Iskra)
export function basement() {
  const bt = P.canvasTex(512, 256, (x, W, H) => { x.fillStyle = '#5a3a2e'; x.fillRect(0, 0, W, H); for (let j = 0; j < 16; j++) for (let i = 0; i < 9; i++) { const off = (j % 2) * 28; x.fillStyle = ['#7a4a38', '#6e4232', '#835040', '#6a3e30'][(i * 7 + j * 3) % 4]; x.fillRect(i * 58 + off - 28 + 2, j * 16 + 2, 54, 12); } });
  bt.wrapS = bt.wrapT = THREE.RepeatWrapping; bt.repeat.set(4, 1.4);
  const s = room({ w: 6, d: 5, h: 2.0, wallTex: bt, floor: '#3a2a20', ceil: '#3a3028', hemi: 0.55, sunI: 0.25, bg: '#060504', lights: [[0, 0.9, 0.2, 5, '#ffb860', 6], [-1.8, 1.5, -0.8, 1.6, '#ffb860', 4]] });
  wallWindow(s, 1.2, 1.6, -2.49, { w: 0.7, h: 0.38, out: '#1c2438', bars: true, frame: '#3a3028' });
  const t = P.tableCloth(1.9, 1.0, '#4a3a2a', 0.76); t.position.set(0, 0, -0.5); s.add(t); s.table = t;
  const l = P.keroseneLamp(true); l.position.set(0.12, t.top, -0.5); s.add(l);
  const np = P.newspapers('ИСКРА', 10); np.position.set(-0.24, t.top, -0.56); np.rotation.y = 0.2; s.add(np);
  const pr = P.papers(5, 7); pr.position.set(0.28, t.top, -0.42); s.add(pr);
  const ps = P.press(); ps.position.set(-2.0, 0, -1.8); ps.rotation.y = 0.3; s.add(ps);
  const st = P.newspapers('ИСКРА', 30); st.position.set(-1.45, 0, -2.1); s.add(st);
  for (const [x, z, r] of [[-0.62, -0.5, Math.PI / 2], [0.62, -0.5, -Math.PI / 2]]) { const c = P.chairR('#4a3020', '#4a3020'); c.position.set(x, 0, z); c.rotation.y = r; s.add(c); }
  return s;
}
// ------------------------------------------------------------ assembly hall: Duma / Soviet / Smolny / Constituent Assembly
export function hall(kind = 'duma') {
  const red = kind !== 'duma' && kind !== 'constituent';
  const s = room({ w: 18, d: 18, h: 6.5, wall: kind === 'smolny' ? '#f2ede2' : '#efe8da', floor: '#7a5234', ceil: '#f6f1e6', hemi: 1.0, sunI: 0.8, bg: '#1a140e', trim: '#d9c9a0',
    lights: [[-4, 5.5, 0, 7, '#ffe2b0', 20], [4, 5.5, 0, 7, '#ffe2b0', 20], [0, 4.5, -6, 6, '#ffe2b0', 16]] });
  for (const sx of [-1, 1]) for (let i = 0; i < 7; i++) { const z = -8 + i * 2.6; s.add(at(cyl(0.26, 0.3, 6.1, '#f6f2ea', 16), sx * 7.8, 3.05, z)); s.add(at(box(0.7, 0.3, 0.7, '#e6dcc6'), sx * 7.8, 6.2, z)); }
  s.add(at(box(8, 0.36, 2.6, '#6a4a2e'), 0, 0.18, -7.6)); s.add(at(box(8.1, 0.04, 2.7, kind === 'duma' ? '#2f5a3a' : '#8a1f1f'), 0, 0.37, -7.6));
  const tb = P.tableCloth(8, 1.1, red ? '#a31f22' : '#2f5a3a'); tb.position.set(0, 0.36, -8.0); s.add(tb); s.presidium = tb;
  for (let i = 0; i < 7; i++) { const c = P.chairR('#4a3020', red ? '#8a1f1f' : '#2f5a3a'); c.position.set(-1.5 + i * 0.5, 0.36, -8.45); s.add(c); }
  const lec = P.lectern('#5a3a24', red ? '#a31f22' : null); lec.position.set(0, 0.36, -6.7); s.add(lec); s.lectern = lec; s.podium = [0, 0.36, -7.05];
  if (kind === 'duma') { const e = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), new THREE.MeshStandardMaterial({ map: P.eagleTex(null, '#d4af37', 512), transparent: true, metalness: 0.4, roughness: 0.5 })); e.position.set(0, 3.0, -8.95); s.add(e); }
  if (red) { const bn = P.banner(kind === 'smolny' ? 'ВСЯ ВЛАСТЬ СОВѢТАМЪ' : 'СОВѢТЪ РАБОЧИХЪ И СОЛДАТСКИХЪ ДЕПУТАТОВЪ', { w: 8, h: 0.9, poles: false, poleH: 3.6 }); bn.position.set(0, 0, -8.92); s.add(bn); s.bannerMain = bn; }
  s.benches = [];
  for (let r = 0; r < 8; r++) for (const sx of [-1, 1]) { const b = P.bench(6.5, '#6a4a2e'); b.position.set(sx * 1.85, 0, -4.4 + r * 0.95); b.rotation.y = Math.PI; s.add(b); s.benches.push(b); }
  s.seatsAt = (r, i, side) => [side * (0.6 + i * 0.42), 0.2 - 0.12, -4.4 + r * 0.95 - 0.05];
  for (const x of [-5, 0, 5]) { const c = NP.chandelier(); c.position.set(x, 5.4, -2); s.add(c); }
  return s;
}
// ------------------------------------------------------------ Eastern Front trench in winter
export function trenchSet(light = 'snow', { snowing = false } = {}) {
  const Y = 1.15;                                  // the plain sits at y=Y; the trench floor is the stage ground (y=0)
  const s = rStage(light, ['#d9dcda', '#c9ccc8'], { seed: 351 });
  const plain = new THREE.Group(); plain.position.y = Y; s.add(plain); s.plain = plain;
  const snowM = std('#e4e7e6'); 
  for (const [z0, z1] of [[-120, -1.0], [1.0, 120]]) { const sl = new THREE.Mesh(new THREE.BoxGeometry(300, Y, z1 - z0), [std('#5a4a3a'), std('#5a4a3a'), snowM, snowM, std('#5a4a3a'), std('#5a4a3a')]); sl.position.set(0, Y / 2, (z0 + z1) / 2); sl.receiveShadow = sl.castShadow = true; s.add(sl); }
  s.add(at(box(300, 0.02, 2.0, '#4a3c2e'), 0, 0.011, 0));
  for (let x = -60; x < 60; x += 0.5) s.add(at(box(0.42, 0.04, 0.6, '#6b5238'), x, 0.03, 0));                     // duckboards
  for (const sz of [-1, 1]) { for (let x = -60; x < 60; x += 1.2) s.add(at(box(0.08, Y, 0.08, '#4a3a2a'), x, Y / 2, sz * 0.96)); for (let i = 0; i < 4; i++) s.add(at(box(120, 0.22, 0.04, ['#5a4632', '#4e3e2c', '#56442f', '#4a3a28'][i]), 0, 0.16 + i * 0.27, sz * 0.97)); }
  const sb = MX.sandbags(120, 2); sb.position.set(0, Y, -1.25); s.add(sb);
  for (const z of [-6.5, -8.5]) for (let x = -24; x < 24; x += 8) { const w = MX.barbedWire(8); w.position.set(x + 4, Y, z); s.add(w); }
  const r = LP.rng(352);
  for (let i = 0; i < 22; i++) { const c = P.crater(0.8 + r() * 1.4); c.position.set((r() - 0.5) * 60, Y, -10 - r() * 40); s.add(c); }
  for (let i = 0; i < 9; i++) { const t = deadTree(1 + r() * 0.6, i); t.position.set((r() - 0.5) * 70, Y, -16 - r() * 40); s.add(t); }
  for (let i = 0; i < 6; i++) { const t = deadTree(0.9 + r() * 0.5, i + 20); t.position.set((r() - 0.5) * 60, Y, 8 + r() * 30); s.add(t); }
  const mg = P.maxim(); mg.position.set(2.5, Y + 0.18, -1.15); mg.userData.dynamic = true; s.add(mg); s.maxim = mg;
  for (const [x, z] of [[-30, -60], [12, -70], [40, -55]]) smokeFrom(s, new THREE.Vector3(x, Y + 0.5, z), { n: 10, color: '#6a6660', size: 2.4, rise: 14, drift: [4, 0, 0], life: 6, opacity: 0.55 });
  if (snowing) { const sn = P.snowfall(s, { area: [-16, 0, -24, 16, 12, 12] }); ticker(s).push(t => sn.update(t)); }
  s.Y = Y; return s;
}
// ------------------------------------------------------------ Stavka (army HQ, Mogilev): map table
export function stavka({ wall = '#8a6a48', lower = '#5a3a24', icon = true } = {}) {
  const s = room({ w: 9, d: 7, h: 2.8, wall, lower, lowerH: 0.8, floor: '#5a3a24', ceil: '#e8dcc0', hemi: 0.85, sunI: 0.7, trim: '#5a3a24', lights: [[0, 2.4, 0, 4]] });
  for (const x of [-2.6, 2.6]) wallWindow(s, x, 1.5, -3.49, { w: 1.1, h: 1.3, out: '#dfe6ee', curtain: '#6a2a24', glow: true });
  const map = P.canvasTex(1024, 640, (x, W, H) => { x.fillStyle = '#e9e0c8'; x.fillRect(0, 0, W, H); x.strokeStyle = '#7aa0c0'; x.lineWidth = 6;
    for (const k of [0, 1, 2]) { x.beginPath(); x.moveTo(80 + k * 300, 0); x.bezierCurveTo(140 + k * 300, 200, 40 + k * 300, 400, 120 + k * 300, H); x.stroke(); }
    x.strokeStyle = '#b8241e'; x.lineWidth = 10; x.beginPath(); x.moveTo(420, 0); for (let y = 0; y <= H; y += 40) x.lineTo(420 + 60 * Math.sin(y * 0.02) + (y % 80 ? 18 : -18), y); x.stroke();
    x.strokeStyle = '#2a4a8a'; x.lineWidth = 6; x.beginPath(); x.moveTo(470, 0); for (let y = 0; y <= H; y += 40) x.lineTo(470 + 60 * Math.sin(y * 0.02) + (y % 80 ? 18 : -18), y); x.stroke();
    x.fillStyle = '#3a3a3a'; for (let i = 0; i < 14; i++) { x.fillRect(560 + (i * 97) % 380, 60 + (i * 151) % 520, 14, 14); x.fillRect(100 + (i * 83) % 260, 50 + (i * 131) % 540, 14, 14); }
    x.fillStyle = '#b8241e'; for (let i = 0; i < 4; i++) { x.beginPath(); const y = 120 + i * 130; x.moveTo(360, y); x.lineTo(410, y - 18); x.lineTo(410, y + 18); x.fill(); } });
  const t = new THREE.Group(); t.add(at(box(3.4, 0.08, 2.2, '#4a3020'), 0, 0.84, 0)); for (const [x, z] of [[-1.5, -0.9], [1.5, -0.9], [-1.5, 0.9], [1.5, 0.9]]) t.add(at(box(0.1, 0.84, 0.1, '#4a3020'), x, 0.42, z));
  const mp = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.0), new THREE.MeshStandardMaterial({ map, roughness: 0.9 })); mp.rotation.x = -Math.PI / 2; mp.position.y = 0.885; t.add(mp);
  t.scale.setScalar(0.5); t.position.set(0, 0, -1.0); s.add(t); s.mapTable = t; s.mapTop = 0.445;
  const l = P.deskLamp(true); l.position.set(0.7, 0.445, -1.4); s.add(l);
  if (icon) { const ic = P.icon(2); ic.children[1].visible = false; ic.scale.setScalar(0.7); ic.position.set(-4.0, 0.0, -3.0); ic.rotation.y = Math.PI / 4; s.add(ic); }
  return s;
}
// ------------------------------------------------------------ the empress's mauve boudoir (Alexander Palace)
export function zarinaRoom() {
  const s = room({ w: 8, d: 6, h: 2.8, wall: '#a88ab8', lower: '#e8e0ee', lowerH: 0.6, floor: '#6a4a3a', ceil: '#f2ecf4', hemi: 0.9, sunI: 0.7, trim: '#efe6f2', lights: [[0, 2.3, 0.5, 3.5, '#ffe0c0']] });
  wallWindow(s, 1.9, 1.45, -2.99, { w: 1.1, h: 1.4, out: '#e8eef4', curtain: '#8a6a9a', glow: true });
  const ic = P.iconCorner(); ic.position.set(-2.6, 0.2, -2.95); ic.scale.setScalar(0.85); s.add(ic);
  for (const [x, y, w, h] of [[-1.1, 1.6, 0.36, 0.44], [-0.5, 1.7, 0.3, 0.38], [-0.9, 1.1, 0.26, 0.32]]) { const p = P.picture(w, h, (c, W, H) => { c.fillStyle = '#6a5a4a'; c.fillRect(0, 0, W, H); c.fillStyle = '#d9c9a8'; c.beginPath(); c.ellipse(W / 2, H * 0.45, W * 0.22, H * 0.25, 0, 0, 7); c.fill(); }); p.position.set(x, y, -2.97); s.add(p); }
  const so = P.sofa(2.0, '#c8b0d8', '#efe6f2'); so.position.set(-1.0, 0, -2.4); s.add(so); s.sofa = so;
  const tb = new THREE.Group(); tb.add(at(cyl(0.24, 0.24, 0.025, '#5a3a24', 20), 0, 0.3, 0)); tb.add(at(cyl(0.03, 0.05, 0.3, '#5a3a24', 8), 0, 0.15, 0)); tb.position.set(0.2, 0, -1.7); s.add(tb);
  const sm = P.samovar(0.55); sm.position.set(0.14, 0.31, -1.74); s.add(sm);
  for (const [x, z] of [[0.32, -1.62], [0.24, -1.88]]) s.add(at(cyl(0.02, 0.017, 0.035, '#f3eee2', 10), x, 0.33, z));
  const ch = P.chairR('#efe6f2', '#c8b0d8'); ch.position.set(0.8, 0, -1.45); ch.rotation.y = -1.2; s.add(ch);
  return s;
}
// ------------------------------------------------------------ Tsushima, May 1905: a Russian battleship burning at dusk
export function seaBattle() {
  const s = rStage('dusk', null, { seed: 361, groundA: null, fog: ['#c98a66', 40, 220] });
  const sea = waterPlane(s, { color: '#2e4a5e', y: 0 });
  const sh = P.dreadnought(34, '#5a6066'); sh.position.set(-4, -0.6, -40); sh.rotation.set(0.06, 0.5, 0.1); s.add(sh); s.ship = sh;
  s.burn = [[-3, 3.6, -36], [-6, 2.8, -44], [-2, 5, -40]].map(([x, y, z], i) => { const g = new THREE.Group(); g.position.set(x, y, z); s.add(g); const f = MX.fireSprites(g, 12, { size: 2.2, rise: 3, spread: 2, life: 0.9 }); const o = new THREE.Vector3(); ticker(s).push(t => f(t + i, o, 1)); return g; });
  for (const [x, z] of [[-3, -38], [-5, -42]]) smokeFrom(s, new THREE.Vector3(x, 6, z), { n: 12, color: '#2a2624', size: 3, rise: 18, drift: [9, 0, -3], life: 5, opacity: 0.75 });
  const fl = new THREE.PointLight('#ff8a3a', 60, 70, 1.4); fl.position.set(-3, 6, -36); s.add(fl);
  for (const [x, z] of [[40, -110], [58, -120], [74, -112]]) { const e = P.dreadnought(30, '#3a3e44'); e.position.set(x, -0.4, z); e.rotation.y = -1.2; s.add(e); }
  return s;
}
// Flat animated water plane. s.sea.wave(t)
function waterPlane(s, { color = '#1e3344', y = -1.0, size = 400, x = 0, z = 0, w = null, d = null } = {}) {
  const geo = new THREE.PlaneGeometry(w || size, d || size, 60, 60); geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.22, metalness: 0.25 })); m.position.set(x, y, z); m.receiveShadow = true; m.userData.dynamic = true; s.add(m);
  const base = geo.attributes.position.array.slice();
  m.wave = t => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const X = base[i * 3], Z = base[i * 3 + 2]; p.setY(i, 0.08 * Math.sin(X * 0.35 + t * 1.3) + 0.06 * Math.sin(Z * 0.5 - t * 1.1)); } p.needsUpdate = true; geo.computeVertexNormals(); };
  m.wave(0); s.sea = m; ticker(s).push(t => m.wave(t)); return m;
}
// ------------------------------------------------------------ summer 1914: troops marching down a country road
export function road1914(light = 'day') {
  const s = rStage(light, ['#8a9a5a', '#7c8c50'], { seed: 371, bumps: 0.4 });
  s.add(at(box(6, 0.02, 200, '#a8916a'), 0, 0.011, -40));
  for (const x of [-1.6, 1.6]) s.add(at(box(0.5, 0.022, 200, '#9a8460'), x, 0.013, -40));
  for (let i = 0; i < 16; i++) for (const sx of [-1, 1]) { const t = LP.birch(1.4 + (i % 3) * 0.2, i + (sx > 0 ? 50 : 0)); t.position.set(sx * (5 + (i % 2) * 0.8), 0, 12 - i * 6); s.add(t); }
  LP.scatter(s, (r, i) => (i % 3 ? LP.birch(1.3 + r() * 0.5, i) : LP.pine(1.4 + r() * 0.5, '#2f4a3a', i)), 60, [-70, -90, 70, 20], 372, [[0, -40, 9], [0, 0, 9], [0, 20, 9]]);
  const ch = new THREE.Group(); ch.add(at(box(4, 5, 4, '#efe9dc'), 0, 2.5, 0)); const dm = NP.onion({ r: 1.0, color: '#d4af37', h: 1.2 }); dm.position.y = 5; ch.add(dm); ch.position.set(14, 0, -60); s.add(ch);
  return s;
}
// ------------------------------------------------------------ Finland Station square, night of 3/16 April 1917
export function finlandSquare() {
  const s = rStage('night', ['#4a4c50', '#43454a'], { seed: 381 }); stars(s);
  const st = P.stationHouse('ФИНЛЯНДСКІЙ ВОКЗАЛЪ', { w: 34, h: 8, lit: 0.85, color: '#d6c8a6' }); st.position.set(0, 0, -22); s.add(st); s.station = st;
  const car = P.armouredCar('#3e4434'); car.scale.setScalar(1.25); car.position.set(0.5, 0, -6); car.rotation.y = 0.35; s.add(car); s.car = car;
  s.beams = [[-12, -30], [14, -29]].map(([x, z], i) => { const g = new THREE.Group(); g.position.set(x, 9, z); g.userData.dynamic = true; s.add(g); const b = P.beam(60, 0.35, 6, '#eaf0ff', 0.45); g.add(b); g.add(at(cyl(0.5, 0.5, 0.8, '#2a2a2a', 12), 0, 0, 0));
    g.aim = (t) => aimBeam(g, new THREE.Vector3((i ? -0.35 : 0.35) + 0.25 * Math.sin(t * 0.4 + i * 2), 0.9, 0.25 + 0.15 * Math.cos(t * 0.3 + i))); g.aim(0); ticker(s).push(t => g.aim(t)); return g; });
  s.flags = [[-6, -12], [7, -11], [-11, -4], [12, -3]].map(([x, z], i) => { const f = P.redFlag(4.2, 1.6, 1.0); f.position.set(x, 0, z); s.add(f); ticker(s).push(t => f.wave(t + i)); return f; });
  const bn = P.banner('ВСЯ ВЛАСТЬ СОВѢТАМЪ', { w: 7, h: 1.0, poleH: 4.4 }); bn.position.set(-2, 0, -14); s.add(bn); ticker(s).push(t => bn.wave(t)); s.bannerA = bn;
  for (let i = 0; i < 6; i++) { const l = P.gasLamp(true, 3.6, i % 2 === 0); l.position.set(-20 + i * 8, 0, -15); s.add(l); }
  const fl = new THREE.PointLight('#cfd8ff', 25, 30, 1.2); fl.position.set(0, 8, -2); s.add(fl);
  return s;
}
// ------------------------------------------------------------ the Neva at night: Aurora, bridge, the palace across the river
export function nevaNight({ aurora = true, frozen = false } = {}) {
  const s = rStage('night', null, { seed: 391, groundA: null, skyHor: '#2c3c62', hemi: 1.1, sun: 0.8, fog: ['#141c30', 40, 200] }); stars(s);
  if (frozen) { const ice = new THREE.Mesh(new THREE.PlaneGeometry(400, 64), std('#b8c4d0', { roughness: 0.35 })); ice.rotation.x = -Math.PI / 2; ice.position.set(0, -1.2, -34); ice.receiveShadow = true; s.add(ice);
    const r = LP.rng(392); for (let i = 0; i < 40; i++) s.add(at(LP.mesh(new THREE.CircleGeometry(0.6 + r() * 2.5, 9), std('#dfe6ee')), (r() - 0.5) * 160, -1.18, -6 - r() * 56, -Math.PI / 2, 0, r() * 3)); }
  else waterPlane(s, { color: '#16283a', y: -1.4, w: 400, d: 64, z: -34 });
  s.add(at(box(400, 3, 100, frozen ? '#8a8e96' : '#4a4a4e'), 0, -1.5, 50)); s.add(at(box(400, 3, 200, '#3e3e44'), 0, -1.5, -166));
  s.add(at(box(400, 0.25, 0.6, '#8a8078'), 0, 0.1, -0.2)); s.add(at(box(400, 0.25, 0.6, '#8a8078'), 0, 0.1, -66));   // granite parapets
  const pal = P.winterPalace({ len: 76, lit: true }); pal.position.set(20, 0, -76); pal.rotation.y = 0; s.add(pal); s.palace = pal;
  const pp = new THREE.Group(); pp.add(at(box(6, 14, 6, '#e8d49a'), 0, 7, 0)); pp.add(at(box(4, 6, 4, '#e8d49a'), 0, 17, 0)); pp.add(at(LP.mesh(new THREE.ConeGeometry(1.4, 24, 8), std('#d4af37', { metalness: 0.7, roughness: 0.3 })), 0, 32, 0)); pp.position.set(-70, 0, -90); s.add(pp);
  const br = new THREE.Group(); br.position.set(-26, 0, -34); s.add(br); br.add(at(box(9, 0.6, 66, '#3a3e44'), 0, 0.3, 0)); for (const sx of [-1, 1]) br.add(at(box(0.15, 0.7, 66, '#2a2c30'), sx * 4.4, 0.95, 0));
  for (let z = -28; z <= 28; z += 14) { br.add(at(box(3, 3, 6, '#5a5650'), 0, -1.6, z)); for (const sx of [-1, 1]) { const l = P.gasLamp(true, 3.2, z === 0 && sx > 0); l.position.set(sx * 4.2, 0.6, z); br.add(l); } }
  s.bridge = br;
  if (aurora) { const a = P.aurora(); a.scale.setScalar(2.4); a.position.set(6, -1.6, -26); a.rotation.y = -Math.PI / 2 + 0.25; s.add(a); s.aurora = a;
    for (const [x, y, z] of [[0, 6, 4], [0, 6, -4], [0, 9, 0]]) { const l = new THREE.PointLight('#ffd9a0', 8, 14, 1.4); l.position.set(x, y, z); a.add(l); }
    for (let i = 0; i < 14; i++) for (const sx of [-1, 1]) { const w = LP.mesh(new THREE.CircleGeometry(0.07, 8), new THREE.MeshBasicMaterial({ color: '#ffd690' })); w.position.set(sx * (1.46 + 0.01), 1.3, -5.5 + i * 0.8); w.rotation.y = sx * Math.PI / 2; a.add(w); }
    const sl = new THREE.Group(); sl.position.set(4, 9.5, -27); sl.userData.dynamic = true; s.add(sl); sl.add(P.beam(70, 0.3, 7, '#eaf0ff', 0.5)); aimBeam(sl, new THREE.Vector3(0.3, 0.05, -1)); s.searchlight = sl; }
  const moon = new THREE.DirectionalLight('#9fb4ff', 0.9); moon.position.set(-20, 30, 10); s.add(moon);
  for (let i = 0; i < 10; i++) { const l = P.gasLamp(true, 3.4, i % 3 === 1); l.position.set(-40 + i * 12, 0, 1.5); s.add(l); }
  return s;
}
// Close-up: the Aurora's forecastle with the bow gun (blank shot at 21:40, 25 Oct / 7 Nov 1917).
export function auroraDeck() {
  const s = rStage('night', null, { seed: 401, groundA: null, skyHor: '#2c3c62', hemi: 1.2, sun: 0.9 }); stars(s);
  waterPlane(s, { color: '#16283a', y: -2.5 });
  const dk = new THREE.Group(); s.add(dk); s.deck = dk;
  const sh = new THREE.Shape(); sh.moveTo(-4.5, -8); sh.lineTo(4.5, -8); sh.lineTo(4.5, 3); sh.quadraticCurveTo(3.6, 9, 0, 12); sh.quadraticCurveTo(-3.6, 9, -4.5, 3); sh.closePath();
  const hg = new THREE.ExtrudeGeometry(sh, { depth: 3, bevelEnabled: false }); hg.rotateX(-Math.PI / 2); dk.add(at(LP.mesh(hg, std('#2a2d30', { roughness: 0.6 })), 0, -3, 0));
  const top = new THREE.ShapeGeometry(sh); top.rotateX(-Math.PI / 2); dk.add(at(LP.mesh(top, std('#8a7a5e', { roughness: 0.8 })), 0, 0.01, 0));
  const rp = []; for (let z = -7.6; z < 11.6; z += 0.5) { const k = z < 3 ? 1 : Math.max(0.04, 1 - (z - 3) / 9.2); rp.push(k); for (const sx of [-1, 1]) dk.add(at(box(0.04, 0.9, 0.04, '#b8b8b0'), sx * 4.4 * k, 0.45, z)); }
  for (const sx of [-1, 1]) { const pts = rp.map((k, i) => new THREE.Vector3(sx * 4.4 * k, 0.9, -7.6 + i * 0.5)); dk.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.03, 5), std('#b8b8b0'))); }
  const lan = new THREE.PointLight('#ffcf8a', 7, 12, 1.4); lan.position.set(-1.5, 2.6, 3.5); s.add(lan); dk.add(at(LP.mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffe0a0' })), -1.5, 2.55, 3.5));
  const gun = new THREE.Group(); gun.position.set(0, 0, 5.2); dk.add(gun); s.gun = gun;
  gun.add(at(cyl(0.7, 0.8, 0.5, '#5f666c', 16), 0, 0.25, 0)); gun.add(at(box(1.6, 1.3, 1.6, '#5f666c'), 0, 1.05, -0.2));
  const barrel = cyl(0.16, 0.2, 3.6, '#3a3f44', 12); barrel.rotation.x = Math.PI / 2 - 0.12; barrel.position.set(0, 1.25, 1.9); gun.add(barrel); gun.muzzle = new THREE.Vector3(0, 1.45, 3.7);
  dk.add(at(box(3, 2.2, 2.6, '#8a9096'), 0, 1.1, -3.2)); dk.add(at(box(2, 1.0, 1.6, '#8a9096'), 0, 2.7, -3.3));
  for (let i = 0; i < 3; i++) dk.add(at(cyl(0.9, 0.9, 9, '#1e2022', 16), 0, 4.5, -7 - i * 4.4));
  dk.add(at(cyl(0.08, 0.08, 16, '#3a3a3a', 6), 0, 8, -1.2));
  const pal = P.winterPalace({ len: 76, lit: true }); pal.position.set(-10, -1.6, -150); pal.rotation.y = 0.5; s.add(pal);
  const flash = new THREE.PointLight('#ffd27a', 0, 30, 1.4); flash.position.set(0, 1.6, 9.5); s.add(flash); s.flash = flash;
  const l = new THREE.PointLight('#cfd8ff', 6, 16, 1.4); l.position.set(3, 4, 6); s.add(l);
  return s;
}
// ------------------------------------------------------------ Ipatiev House, Ekaterinburg, July 1918 (summer night)
export function ipatievNight() {
  const s = rStage('summerNight', ['#4a4a3e', '#424236'], { seed: 411, hemi: 1.0, sun: 0.8 }); stars(s);
  s.add(at(box(80, 0.02, 7, '#4a4844'), 0, 0.011, 8));
  const h = P.ipatievHouse(); h.position.set(0, 0, -2); s.add(h); s.house = h;
  const l = P.gasLamp(true, 3.6); l.position.set(-7.5, 0, 6); s.add(l); const l2 = P.gasLamp(true, 3.6); l2.position.set(6.5, 0, 6); s.add(l2);
  for (const x of [-2.15, 2.2]) s.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.1, 0.05), std('#ffd690', { emissive: '#ffb860', emissiveIntensity: 1.1 })), x, 4.6, 1.56));
  LP.scatter(s, (r, i) => LP.roundTree(1.6 + r() * 0.6, '#2a3a2a', i), 26, [-50, -40, 50, -8], 412, [[0, -2, 9]]);
  for (let i = 0; i < 5; i++) { const b = NP.izba(i + 20); b.position.set(-30 + i * 14 + (i > 1 ? 18 : 0), 0, -6); b.rotation.y = 0.1 * i; s.add(b); }
  return s;
}
// ------------------------------------------------------------ civil war: armoured train on the snowy steppe
export function steppe(light = 'snow', { snowing = false } = {}) {
  const s = rStage(light, SNOW, { seed: 421, bumps: 0.6 });
  s.add(P.track(240, { snow: true }));
  const tr = new THREE.Group(); tr.position.set(0, 0, 6); tr.userData.dynamic = true; s.add(tr); s.train = tr;
  const lo = P.locomotive({ color: '#2f3a2c', trim: '#3f4a36' }); tr.add(lo); lo.add(at(box(2.2, 1.9, 5.2, '#3f4a36'), 0, 2.0, 0.6));
  const star = P.canvasTex(256, 256, (x) => { x.fillStyle = '#c0272d'; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 48 : 118; x.lineTo(128 + Math.cos(a) * r, 136 + Math.sin(a) * r); } x.closePath(); x.fill(); });
  const sp = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshStandardMaterial({ map: star, transparent: true })); sp.position.set(0, 2.1, 3.57); lo.add(sp);
  s.wagons = [0, 1].map(i => { const w = armouredCarriage(i ? 'СМЕРТЬ БѢЛЫМЪ' : 'ВСЯ ВЛАСТЬ СОВЕТАМ'); w.position.z = -12 - i * 11; tr.add(w); return w; });
  smokeFrom(s, lo.stack.clone().add(tr.position), { color: '#5a5a5a', size: 0.8, rise: 5, drift: [-0.5, 0, -4], life: 3, opacity: 0.6 });
  MX.telegraph && (() => { const t = MX.telegraph(14, 8); t.position.set(-5, 0, 40); t.rotation.y = Math.PI / 2; s.add(t); })();
  LP.scatter(s, (r, i) => LP.birch(1.2 + r() * 0.5, i), 40, [-80, -100, 80, 40], 422, [[0, 0, 12], [0, -40, 10], [0, 40, 10]]);
  s.traverse(o => { if (o.isMesh && o.geometry?.type === 'IcosahedronGeometry') o.material = std('#d8e0e4'); });
  if (snowing) { const sn = P.snowfall(s, { area: [-16, 0, -24, 16, 12, 12] }); ticker(s).push(t => sn.update(t)); }
  return s;
}
function armouredCarriage(text) {
  const g = new THREE.Group(), col = '#3f4a36', L = 9;
  g.add(at(box(2.1, 2.0, L, col), 0, 1.85, 0)); g.add(at(box(2.2, 0.15, L + 0.1, '#2a3226'), 0, 2.9, 0));
  for (const z of [-L / 2 + 1.8, L / 2 - 1.8]) { g.add(at(box(1.6, 0.25, 2.0, '#232323'), 0, 0.5, z)); for (const dz of [-0.6, 0.6]) for (const sx of [-1, 1]) g.add(at(cyl(0.4, 0.4, 0.1, '#1c1c1c', 16), sx * 0.52, 0.4, z + dz, 0, 0, Math.PI / 2)); }
  g.add(at(box(1.7, 0.3, L - 0.6, '#1e1e1e'), 0, 0.8, 0));
  for (const z of [-L / 2 + 1.6, L / 2 - 1.6]) { const t = new THREE.Group(); t.position.set(0, 2.95, z); g.add(t); t.add(at(cyl(0.8, 0.9, 0.9, col, 16), 0, 0.45, 0)); t.add(at(cyl(0.1, 0.12, 2.2, '#222', 8), 0, 0.5, z > 0 ? 1.4 : -1.4, Math.PI / 2, 0, 0)); }
  for (const sx of [-1, 1]) { const sb = P.signBoard(text, { w: 6.6, h: 0.55, bg: col, fg: '#e6d9b0', border: null, font: '900 {s}px Inter' }); sb.position.set(sx * 1.06, 1.85, 0); sb.rotation.y = sx * Math.PI / 2; g.add(sb);
    for (const z of [-3.6, 3.6]) g.add(at(box(0.04, 0.12, 0.5, '#151515'), sx * 1.06, 2.5, z)); }
  return g;
}
// ------------------------------------------------------------ Cheka office (night)
export function chekaOffice() {
  const s = room({ w: 7, d: 5, h: 2.3, wall: '#4a524a', lower: '#2e3230', lowerH: 0.8, floor: '#3a2e24', ceil: '#5a5e58', hemi: 0.6, sunI: 0.3, bg: '#050505', lights: [[0, 2.0, 0.5, 2.2, '#c8d0ff'], [0.6, 1.0, -0.4, 2.0, '#ffd9a0', 5]] });
  wallWindow(s, -1.8, 1.4, -2.49, { w: 0.8, h: 1.0, out: '#0e1424', bars: true, frame: '#2e3230' });
  const d = P.desk(1.7, 0.85, '#2e2218'); d.position.set(0.4, 0, -1.2); s.add(d); s.desk = d;
  const lamp = P.deskLamp(true, '#2f6a3a'); lamp.position.set(0.68, d.top, -1.3); s.add(lamp);
  for (const [x, z, n] of [[0.2, -1.15, 9], [0.42, -1.1, 5]]) { const f = P.papers(n, x * 10 | 0); f.position.set(x, d.top, z); s.add(f); }
  s.add(at(box(0.5, 0.8, 0.4, '#3a3e3a'), 2.6, 0.4, -2.2)); s.add(at(cyl(0.05, 0.05, 0.03, '#c9a227', 12), 2.6, 0.55, -1.99, Math.PI / 2, 0, 0));
  for (let i = 0; i < 3; i++) s.add(at(box(0.32, 1.1, 0.3, '#5a4a36'), -3.0 + i * 0.34, 0.55, -2.3));
  const ch = P.chairR('#2e2218', '#3a2a20'); ch.position.set(0.4, 0, -1.6); s.add(ch); s.seat = [0.4, ch.top - 0.12, -1.55];
  return s;
}
// ------------------------------------------------------------ Kronstadt across the ice, March 1921
export function kronstadtIce(light = 'grey') {
  const s = rStage(light, ['#d4dce2', '#c8d1d8'], { seed: 431, fog: ['#c5c9cc', 50, 260] });
  const r = LP.rng(432);
  for (let i = 0; i < 30; i++) s.add(at(LP.mesh(new THREE.CircleGeometry(1 + r() * 4, 10), std('#e8edf0')), (r() - 0.5) * 120, 0.015, -r() * 90, -Math.PI / 2, 0, r() * 3));
  for (let i = 0; i < 18; i++) { const m = LP.mesh(new THREE.BoxGeometry(0.8 + r() * 1.4, 0.25 + r() * 0.35, 0.5 + r() * 0.8), std('#eef2f4', { flatShading: true })); m.position.set((r() - 0.5) * 90, 0.12, -6 - r() * 70); m.rotation.y = r() * 3; s.add(m); }
  const fort = new THREE.Group(); fort.position.set(0, 0, -110); s.add(fort); s.fort = fort;
  const sf = P.seaFort(70, 4); sf.traverse(o => { if (o.isMesh) o.material = std('#5a5048'); }); fort.add(sf); const cat = P.navalCathedral(); cat.position.set(6, 0, -14); fort.add(cat);
  for (let i = 0; i < 9; i++) { const b = P.petroBuilding(8, 7, ['#cfc4ae', '#bfb4a0', '#d6ccb4'][i % 3], 60 + i); b.position.set(-34 + i * 8.5, 0, -12); fort.add(b); }
  for (const [x, rot] of [[-22, 0.15], [24, -0.1]]) { const d = P.dreadnought(38, '#5f666c'); d.position.set(x, -0.6, 8); d.rotation.y = Math.PI / 2 + rot; fort.add(d); }
  return s;
}
// ------------------------------------------------------------ NEP street market (1921-1922)
export function nepMarket(light = 'overcast') {
  const s = rStage(light, ['#8a8680', '#7e7a74'], { seed: 441 });
  for (let i = 0; i < 6; i++) for (const sx of [-1, 1]) { const b = P.petroBuilding(8.5, 9.5, ['#d9b46a', '#b8a080', '#c9a46a', '#a8b0a0'][(i + (sx > 0)) % 4], 70 + i * 2 + (sx > 0)); b.position.set(sx * 11, 0, 4 - i * 9); b.rotation.y = -sx * Math.PI / 2; s.add(b); }
  s.stalls = [];
  for (let i = 0; i < 6; i++) for (const sx of [-1, 1]) { const st = P.stall(i * 2 + (sx > 0), ['#b8432f', '#2f6a8a', '#d9a23a', '#3a6a3a'][(i + (sx > 0 ? 2 : 0)) % 4]); st.position.set(sx * 4.2, 0, 2 - i * 4.2); st.rotation.y = -sx * Math.PI / 2; s.add(st); s.stalls.push(st); }
  const sg = P.signBoard('ТОРГОВЛЯ', { w: 4, h: 0.8, bg: '#2a3a2a', fg: '#f2e6c0' }); sg.position.set(-7.94, 3.6, -6); sg.rotation.y = Math.PI / 2; s.add(sg);
  return s;
}
// ------------------------------------------------------------ Red Square, January 1924 (Lenin's funeral, -30 °C, bonfires)
export function redSquare(light = 'snowDusk', { year = 1924 } = {}) {
  const s = rStage(light, isNight(light) ? ['#9ca2ac', '#949aa4'] : SNOW, { seed: 451 });
  const wall = NP.kremlinWall(70, 6); wall.position.set(-6, 0, -26); s.add(wall);
  const sp = P.spasskaya(); sp.position.set(30, 0, -26); s.add(sp); s.spasskaya = sp;
  const sb = P.stBasil(); sb.position.set(44, 0, -4); sb.rotation.y = -0.4; s.add(sb);
  const sen = new THREE.Group(); sen.add(at(box(26, 8, 10, '#e3c27a'), 0, 4, 0)); sen.add(at(cyl(5, 5, 3, '#efe6d0', 24), 0, 9.5, 0)); sen.add(at(LP.mesh(new THREE.SphereGeometry(5.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), std('#3f6a4a', { roughness: 0.5 })), 0, 11, 0));
  const pole = cyl(0.08, 0.08, 6, '#2a2a2a', 6); pole.position.set(0, 18, 0); sen.add(pole);
  const fg = new THREE.Mesh(new THREE.PlaneGeometry(3, 2, 10, 4), new THREE.MeshStandardMaterial({ map: P.sovietTex(), side: THREE.DoubleSide })); fg.position.set(1.55, 20, 0); fg.userData.dynamic = true; sen.add(fg); s.sovietFlag = fg;
  sen.position.set(0, 0, -40); s.add(sen); s.senate = sen;
  const mz = P.woodenMausoleum(); mz.position.set(0, 0, -19.5); mz.userData.dynamic = true; s.add(mz); s.mausoleum = mz;
  s.fires = [[-14, -8], [-4, -2], [8, -4], [18, -10], [-20, 0]].map(([x, z], i) => { const f = P.bonfire(1, i + 3); f.position.set(x, 0, z); s.add(f); ticker(s).push(t => f.update(t)); return f; });
  return s;
}
// ------------------------------------------------------------ Stalin's Kremlin office
export function stalinOffice() {
  const s = room({ w: 8, d: 8, h: 3.0, wall: '#d9cdb0', lower: '#4a3020', lowerH: 1.1, floor: '#5a3a24', ceil: '#efe6d0', hemi: 0.8, sunI: 0.6, trim: '#4a3020', lights: [[0, 2.6, 0, 4]] });
  for (const x of [-2.4, 2.4]) wallWindow(s, x, 1.7, -3.99, { w: 1.0, h: 1.5, out: '#c8d0d8', curtain: '#3a4a3a' });
  const tb = P.tableCloth(1.6, 6, '#2f5a3a', 0.78); tb.position.set(0, 0, 0.3); s.add(tb);
  for (let i = 0; i < 5; i++) for (const sx of [-1, 1]) { const c = P.chairR('#4a3020', '#3a2a20'); c.position.set(sx * 0.5, 0, -0.65 + i * 0.5); c.rotation.y = -sx * Math.PI / 2; s.add(c); }
  const d = P.desk(2.2, 1.0, '#3a2418'); d.position.set(0, 0, -2.6); s.add(d); s.desk = d;
  const lamp = P.deskLamp(true, '#2f6a3a'); lamp.position.set(0.36, d.top, -2.7); s.add(lamp);
  const ch = P.chairR('#3a2418', '#3a2a20'); ch.position.set(0, 0, -3.05); s.add(ch); s.seat = [0, ch.top - 0.12, -3.0];
  const por = P.picture(0.8, 1.04, drawLenin, '#8a6a3a'); por.position.set(0, 1.9, -3.96); s.add(por);
  return s;
}
// Simple painted portrait of Lenin (bald dome, goatee, dark suit) for frames and posters.
export function drawLenin(x, W, H) {
  x.fillStyle = '#5a4a3a'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#2a2a30'; x.beginPath(); x.moveTo(W * 0.12, H); x.quadraticCurveTo(W * 0.15, H * 0.66, W * 0.5, H * 0.64); x.quadraticCurveTo(W * 0.85, H * 0.66, W * 0.88, H); x.fill();
  x.fillStyle = '#efe9dc'; x.beginPath(); x.moveTo(W * 0.42, H * 0.66); x.lineTo(W * 0.5, H * 0.8); x.lineTo(W * 0.58, H * 0.66); x.fill();
  x.fillStyle = '#e2b896'; x.beginPath(); x.ellipse(W * 0.5, H * 0.42, W * 0.2, H * 0.21, 0, 0, 7); x.fill();
  x.fillStyle = '#8a5a3a'; x.beginPath(); x.moveTo(W * 0.38, H * 0.5); x.quadraticCurveTo(W * 0.5, H * 0.72, W * 0.62, H * 0.5); x.quadraticCurveTo(W * 0.5, H * 0.58, W * 0.38, H * 0.5); x.fill();
  x.fillRect(W * 0.31, H * 0.36, W * 0.04, H * 0.1); x.fillRect(W * 0.65, H * 0.36, W * 0.04, H * 0.1);
  x.fillStyle = '#2a2020'; x.fillRect(W * 0.41, H * 0.4, W * 0.05, H * 0.015); x.fillRect(W * 0.54, H * 0.4, W * 0.05, H * 0.015);
}
// ------------------------------------------------------------ Tampico, January 1937: tanker at the pier
export function tampico() {
  const s = rStage('mexDay', null, { seed: 461, groundA: null });
  waterPlane(s, { color: '#2f6f80', y: -0.9 });
  s.add(at(box(200, 1.6, 60, '#a8a49a'), 0, -0.8, 34));                                              // concrete quay
  s.add(at(box(200, 0.25, 0.6, '#8a867c'), 0, 0.12, 4.2));
  const pier = new THREE.Group(); pier.position.set(-4, 0, -10); s.add(pier); s.pier = pier;
  const pl = []; for (let z = -14; z < 14; z += 0.42) pl.push(new THREE.BoxGeometry(7.6, 0.12, 0.38).translate(0, 0, z)); pier.add(at(LP.mesh(mergeGeo(pl), std('#7a5c3c')), 0, 0.06, 0));
  for (let z = -13.5; z < 14; z += 2.7) for (const sx of [-1, 1]) pier.add(at(cyl(0.18, 0.2, 2.4, '#4a3828', 8), sx * 3.6, -1.1, z));
  for (const sx of [-1, 1]) for (let z = -12; z < 14; z += 6) pier.add(at(cyl(0.16, 0.2, 0.4, '#2a2a2a', 10), sx * 3.5, 0.32, z));
  const tk = N.tankerShip('#3a3c40', '#5a4a3a'); tk.position.set(9.5, -1.5, -14); tk.rotation.y = 0.04; s.add(tk); s.tanker = tk;
  tk.add(at(box(6.02, 0.5, 30, '#8a2a22'), 0, 0.3, -2));
  const nm = P.signBoard('RUTH', { w: 2.4, h: 0.6, bg: '#3a3c40', fg: '#f2efe6', border: null, font: '900 {s}px Inter' }); nm.position.set(-3.02, 2.5, 14); nm.rotation.y = -Math.PI / 2; tk.add(nm);
  for (let z = -16; z < 16; z += 0.8) tk.add(at(box(0.03, 0.6, 0.03, '#d8d4c8'), -2.9, 4.2, z)); tk.add(at(box(0.03, 0.03, 32, '#d8d4c8'), -2.9, 4.5, 0));
  const gw = P.canvasTex(256, 64, (x, W, H) => { x.fillStyle = '#7a6a52'; x.fillRect(0, 0, W, H); });
  const wh = new THREE.Group(); wh.position.set(-18, 0, 18); s.add(wh); wh.add(at(box(22, 6, 10, '#d9c8a8'), 0, 3, 0)); wh.add(at(box(22.4, 0.5, 10.4, '#b8a888'), 0, 6.1, 0)); for (let x = -9; x < 10; x += 4.5) wh.add(at(box(2.4, 3.4, 0.1, '#5a4a3a'), x, 1.7, -5.02));
  for (const [x, z] of [[-11, 7], [-25, 8], [4, 12], [12, 9]]) { const p = P.palm(1.35, x | 0); p.position.set(x, 0, z); s.add(p); }
  const f = MX.flag('mx', 6, 2.0, 1.3); f.position.set(-8.6, 0, -1); s.add(f); s.flag = f;
  for (let i = 0; i < 3; i++) { const c = LP.crate(0.6, '#8a6a3f'); c.position.set(-6.6 + i * 0.7, 0.12, -4 - (i % 2) * 0.7); s.add(c); }
  return s;
}
// ------------------------------------------------------------ Coyoacán street (Casa Azul) and Trotsky's house on Viena street
export function coyoacan(light = 'golden') {
  const s = rStage(light, ['#c9b48a', '#bba67c'], { seed: 471 });
  const cb = P.canvasTex(256, 256, (x) => { x.fillStyle = '#8a8070'; x.fillRect(0, 0, 256, 256); for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { x.fillStyle = ['#a09482', '#968a78', '#aa9e8a'][(i + j * 2) % 3]; x.beginPath(); x.ellipse(i * 32 + 16 + (j % 2) * 8, j * 32 + 16, 13, 12, 0, 0, 7); x.fill(); } });
  cb.wrapS = cb.wrapT = THREE.RepeatWrapping; cb.repeat.set(4, 40);
  const rd = new THREE.Mesh(new THREE.PlaneGeometry(8, 160), new THREE.MeshStandardMaterial({ map: cb, roughness: 0.95 })); rd.rotation.x = -Math.PI / 2; rd.position.set(0, 0.012, -30); rd.receiveShadow = true; s.add(rd);
  for (const sx of [-1, 1]) s.add(at(box(2.2, 0.18, 160, '#b8ab94'), sx * 5.1, 0.09, -30));
  const bh = P.blueHouse(26, 4.4); bh.position.set(-6.4, 0, -10); bh.rotation.y = Math.PI / 2; s.add(bh); s.casaAzul = bh;
  for (let i = 0; i < 5; i++) { const h = MX.townhouse(5, 3.4, ['#d9a35a', '#c98a4a', '#e0c9a0', '#b8643a', '#d6c08f'][i], i); h.position.set(8.5, 0, 2 - i * 6); h.rotation.y = -Math.PI / 2; s.add(h); }
  for (const [x, z, k] of [[-7.5, -2, 0], [-7.6, -16, 1], [7, -8, 2], [-7.4, -26, 0], [7.2, -22, 1]]) { const t = P.jacaranda(1.2, k); t.position.set(x, 0, z); s.add(t); }
  const pm = P.palm(1.4, 3); pm.position.set(-8, 0, -34); s.add(pm);
  return s;
}
export function trotskyFort(light = 'night') {
  const night = isNight(light);
  const s = rStage(light, ['#7a6e5a', '#6e6450'], { seed: 481 }); if (night) stars(s);
  s.add(at(box(80, 0.02, 7, '#5a554c'), 0, 0.011, 6));
  const h = P.trotskyHouse(); h.position.set(0, 0, -2); s.add(h); s.house = h;
  const holes = P.canvasTex(512, 256, (x, W, H) => { const r = LP.rng(5); for (let i = 0; i < 70; i++) { const px = W * 0.2 + r() * W * 0.6, py = H * 0.2 + r() * H * 0.6; x.fillStyle = 'rgba(30,24,20,0.85)'; x.beginPath(); x.arc(px, py, 3 + r() * 4, 0, 7); x.fill(); x.strokeStyle = 'rgba(120,110,96,0.6)'; x.lineWidth = 2; x.beginPath(); x.arc(px, py, 7 + r() * 4, 0, 7); x.stroke(); } });
  const hp = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.2), new THREE.MeshStandardMaterial({ map: holes, transparent: true, roughness: 0.9 })); hp.position.set(-1.5, 2.6, -1.68); hp.userData.dynamic = true; s.add(hp); s.holes = hp; hp.visible = false;
  const l = P.gasLamp(night, 3.8); l.position.set(-9, 0, 3.2); s.add(l);
  LP.scatter(s, (r, i) => (i % 3 ? P.jacaranda(1.1 + r() * 0.3, i) : P.palm(1.2, i)), 14, [-40, -30, 40, -6], 482, [[0, -2, 11]]);
  return s;
}
// Trotsky's study in Coyoacán (20 August 1940).
export function trotskyStudy() {
  const s = room({ w: 7, d: 5.5, h: 2.5, wall: '#efe9dc', floor: '#8a5a3c', ceil: '#f6f2ea', hemi: 1.0, sunI: 1.0, trim: '#d9cdb0', lights: [[0, 2.2, 0.5, 2.5, '#fff1dc']] });
  wallWindow(s, 1.3, 1.35, -2.74, { w: 1.4, h: 1.3, out: '#d8ecff', frame: '#6a4a2e', glow: true });
  const d = P.desk(1.8, 0.85, '#6a4a2e'); d.position.set(-0.5, 0, -1.4); s.add(d); s.desk = d;
  for (const [x, z, n] of [[-0.7, -1.35, 8], [-0.35, -1.3, 4]]) { const f = P.papers(n, n); f.position.set(x, d.top, z); s.add(f); }
  const bk = P.bookshelf(2.2, 2.4, 3); bk.position.set(-2.2, 0, -2.55); s.add(bk); const bk2 = P.bookshelf(1.6, 2.4, 5); bk2.position.set(-3.3, 0, -0.9); bk2.rotation.y = Math.PI / 2; s.add(bk2);
  const ch = P.chairR('#6a4a2e', '#4a3a2a'); ch.position.set(-0.5, 0, -1.82); s.add(ch); s.chair = ch; s.seat = [-0.5, ch.top - 0.12, -1.77];
  const dict = new THREE.Group(); dict.add(at(box(0.15, 0.07, 0.1, '#2a2a2a'), 0, 0.035, 0)); dict.add(at(cyl(0.025, 0.025, 0.11, '#8a8a8a', 10), 0, 0.08, 0, 0, 0, Math.PI / 2)); dict.position.set(-0.12, d.top, -1.5); s.add(dict);
  return s;
}
// ------------------------------------------------------------ the Kremlin at night (flag over the Senate dome)
export function kremlinNight({ snowing = true } = {}) {
  const s = redSquare('snowNight'); s.fires.forEach(f => f.visible = false); s.mausoleum.visible = false;
  for (const [x, y, z, i] of [[-6, 14, -32, 60], [6, 14, -32, 60], [0, 22, -34, 40], [-20, 8, -20, 30], [24, 10, -20, 30]]) { const l = new THREE.PointLight('#ffe2b0', i, 26, 1.3); l.position.set(x, y, z); s.add(l); }
  s.userData.hemi.groundColor.set('#2a2c34'); s.userData.sun.intensity = 0.35;
  if (snowing) { const sn = P.snowfall(s, { area: [-20, 0, -30, 20, 16, 12] }); ticker(s).push(t => sn.update(t)); }
  return s;
}
// ------------------------------------------------------------ Smolny Institute at night (Bolshevik HQ, 25 Oct 1917)
export function smolny() {
  const s = rStage('night', ['#4a4c50', '#43454a'], { seed: 491 }); stars(s);
  const b = new THREE.Group(); b.position.set(0, 0, -26); s.add(b);
  b.add(at(box(70, 10, 12, '#e6dcc0'), 0, 5, 0)); b.add(at(box(70.4, 0.5, 12.4, '#f3ecda'), 0, 10, 0));
  b.add(at(box(16, 2.6, 3, '#f3ecda'), 0, 9.6, 7)); const ped = new THREE.Shape(); ped.moveTo(-8.4, 0); ped.lineTo(0, 2.6); ped.lineTo(8.4, 0); ped.closePath(); b.add(at(LP.mesh(new THREE.ExtrudeGeometry(ped, { depth: 0.6, bevelEnabled: false }), '#f3ecda'), 0, 10.9, 7.9));
  for (let i = 0; i < 8; i++) b.add(at(cyl(0.45, 0.5, 8.3, '#f6f1e2', 16), -7 + i * 2, 4.4, 8.0));
  b.add(at(box(16, 0.8, 4, '#cfc6b0'), 0, 0.4, 8.6));
  const glow = std('#ffd690', { emissive: '#ffbe66', emissiveIntensity: 1.0 });
  for (let x = -33; x < 34; x += 2.6) if (Math.abs(x) > 8.5) for (const y of [2.3, 5.4, 8.2]) { b.add(at(box(1.0, 1.6, 0.08, '#f3ecda'), x, y, 6.02)); b.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 0.1), glow), x, y, 6.04)); }
  s.fires = [[-9, -12], [9, -12], [-16, -6]].map(([x, z], i) => { const f = P.bonfire(1, i + 7); f.position.set(x, 0, z); s.add(f); ticker(s).push(t => f.update(t)); return f; });
  const car = P.armouredCar('#3e4434'); car.scale.setScalar(1.25); car.position.set(12, 0, -6); car.rotation.y = -0.6; s.add(car);
  const fl = new THREE.PointLight('#ffd9a0', 30, 40, 1.2); fl.position.set(0, 6, -10); s.add(fl);
  return s;
}
// ------------------------------------------------------------ Kresty prison gate (Trotsky freed on bail, September 1917)
export function prisonGate(light = 'overcast') {
  const s = rStage(light, ['#8a8478', '#7c766a'], { seed: 501 });
  s.add(at(box(80, 6, 1.2, '#8a3e2c'), 0, 3, -12)); s.add(at(box(80.4, 0.4, 1.6, '#5a2a20'), 0, 6.1, -12));
  const gate = new THREE.Group(); gate.position.set(0, 0, -11.3); s.add(gate); gate.add(at(box(6, 8, 1.6, '#7a3626'), 0, 4, 0)); gate.add(at(box(3.2, 4.2, 0.2, '#2a2420'), 0, 2.1, 0.75));
  const arch = new THREE.Shape(); arch.moveTo(-1.6, 0); arch.lineTo(1.6, 0); arch.absarc(0, 0, 1.6, 0, Math.PI, false); arch.closePath(); gate.add(at(LP.mesh(new THREE.ShapeGeometry(arch), '#2a2420'), 0, 4.2, 0.76));
  const blk = new THREE.Group(); blk.position.set(-6, 0, -30); s.add(blk); for (const r of [0, Math.PI / 2]) { const w = box(40, 12, 7, '#8a4030'); w.position.y = 6; w.rotation.y = r; blk.add(w); }
  const ch = new THREE.Group(); ch.add(at(cyl(3, 3, 3, '#8a4030', 20), 0, 13.5, 0)); ch.add(at(LP.mesh(new THREE.SphereGeometry(3.1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), std('#5a6a6a')), 0, 15, 0)); blk.add(ch);
  return s;
}
// ------------------------------------------------------------ dark studio for introducing a leader
export function portraitStage(col = '#5a1414', { flag = null } = {}) {
  const s = new THREE.Scene(); s.background = new THREE.Color('#0a0808');
  s.add(new THREE.HemisphereLight('#ffe7d4', '#1a1212', 0.55));
  const key = new THREE.DirectionalLight('#fff1dc', 2.0); key.position.set(3, 5, 6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 0.5, far: 30 }); s.add(key, key.target);
  const rim = new THREE.DirectionalLight('#ffb080', 1.4); rim.position.set(-4, 3, -5); s.add(rim);
  const bg = P.canvasTex(1024, 512, (x, W, H) => { const g = x.createRadialGradient(W / 2, H * 0.45, 20, W / 2, H * 0.45, W * 0.55); g.addColorStop(0, col); g.addColorStop(1, '#070505'); x.fillStyle = g; x.fillRect(0, 0, W, H); });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(26, 13), new THREE.MeshBasicMaterial({ map: bg })); back.position.set(0, 4, -6); s.add(back);
  const fl = new THREE.Mesh(new THREE.CircleGeometry(9, 48), std('#1a1414', { roughness: 0.6 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; s.add(fl);
  if (flag) { const f = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), new THREE.MeshBasicMaterial({ map: flag === 'eagle' ? P.eagleTex('#8a6a1a', '#140c08', 512) : P.sovietTex(), transparent: true, opacity: 0.35 })); f.position.set(0, 3.4, -5.9); s.add(f); }
  s.userData = { sun: key, hemi: s.children[0], interior: true }; ticker(s);
  return s;
}
// ------------------------------------------------------------ 1917 summer front camp (Kerensky addresses the troops)
export function fieldCamp(light = 'day') {
  const s = rStage(light, ['#8a9a5a', '#7c8c50'], { seed: 511, bumps: 0.4 });
  for (const [x, z, r] of [[-8, -10, 0.3], [-3, -13, 0], [3, -12, -0.2], [9, -10, -0.4], [-13, -8, 0.5]]) { const t = LP.tent('#8a8a6a'); t.scale.setScalar(2.2); t.position.set(x, 0, z); t.rotation.y = r; s.add(t); }
  const cart = new THREE.Group(); cart.add(at(box(2.2, 0.15, 1.4, '#6b4a2f'), 0, 0.8, 0)); for (const sx of [-1, 1]) cart.add(at(cyl(0.45, 0.45, 0.08, '#4a3220', 14), sx * 0.75, 0.45, 0.75, Math.PI / 2, 0, 0)), cart.add(at(cyl(0.45, 0.45, 0.08, '#4a3220', 14), sx * 0.75, 0.45, -0.75, Math.PI / 2, 0, 0));
  cart.position.set(0, 0, -4); s.add(cart); s.cart = cart; s.cartTop = 0.88;
  LP.scatter(s, (r, i) => (i % 3 ? LP.birch(1.3 + r() * 0.5, i) : LP.pine(1.4 + r() * 0.5, '#2f4a3a', i)), 50, [-70, -80, 70, -18], 512);
  return s;
}
// ------------------------------------------------------------ spring countryside with a railway along x (the "sealed train", April 1917)
export function railLand(light = 'day') {
  const s = rStage(light, ['#8aa05a', '#7c9250'], { seed: 521, bumps: 0.5 });
  const tr = P.track(260); tr.rotation.y = Math.PI / 2; s.add(tr);
  const train = P.trainSet(3, i => ({ color: '#3f5a40', lit: false, band: '#d9c9a0' })); train.rotation.y = Math.PI / 2; train.userData.dynamic = true; s.add(train); s.train = train;
  LP.scatter(s, (r, i) => (i % 3 ? LP.birch(1.3 + r() * 0.5, i) : LP.pine(1.5 + r() * 0.5, '#2f4a3a', i)), 90, [-90, -70, 90, 50], 522, [[0, 0, 7], [-40, 0, 7], [40, 0, 7], [80, 0, 7], [-80, 0, 7], [-5, 9, 8], [0, 12, 9]]);
  for (let i = 0; i < 6; i++) { const h = NP.izba(i + 40); h.position.set(-30 + i * 13, 0, -16 - (i % 2) * 4); h.rotation.y = 0.2 * (i % 3); s.add(h); }
  const tg = MX.telegraph(16, 9); tg.position.set(-70, 0, -4.5); s.add(tg);
  return s;
}
// ------------------------------------------------------------ treaty table (Brest-Litovsk, 3 March 1918)
export function treatyRoom() {
  const s = room({ w: 9, d: 7, h: 2.8, wall: '#d6cdb6', lower: '#7a6a50', lowerH: 0.8, floor: '#6a4a30', ceil: '#efe6d0', hemi: 0.9, sunI: 0.7, trim: '#7a6a50', lights: [[0, 2.4, 0, 4], [2.2, 1.2, -1.0, 3, '#ffe2c0', 6]] });
  for (const x of [-2.6, 2.6]) wallWindow(s, x, 1.5, -3.49, { w: 1.1, h: 1.3, out: '#dfe6ee', curtain: '#5a4a3a', glow: true });
  const tb = P.tableCloth(4.4, 1.3, '#2f5a3a', 0.78, 0.5); tb.position.set(0, 0, -1.0); s.add(tb); s.table = tb;
  for (let i = 0; i < 4; i++) for (const sz of [-1, 1]) { const c = P.chairR('#4a3020', '#5a4a3a'); c.position.set(-1.0 + i * 0.66, 0, -1.0 + sz * 0.66); c.rotation.y = sz > 0 ? Math.PI : 0; s.add(c); }
  for (const [x, z, n] of [[-0.45, -1.0, 5], [0.4, -0.95, 3]]) { const f = P.papers(n, x * 10 | 0); f.position.set(x, tb.top, z); s.add(f); }
  const ink = new THREE.Group(); ink.add(at(cyl(0.025, 0.025, 0.03, '#1a1a1a', 10), 0, 0.015, 0)); ink.add(at(cyl(0.003, 0.003, 0.09, '#e8e2d4', 4), 0.015, 0.05, 0, 0, 0, 0.4)); ink.position.set(0, tb.top, -1.05); s.add(ink);
  s.seats = (i, side) => [-1.0 + i * 0.66, 0.08, -1.0 + side * 0.6];
  return s;
}
// Polling station in a village school (Constituent Assembly election, November 1917).
export function pollingStation() {
  const s = room({ w: 8, d: 6, h: 2.6, wall: '#cfc4a8', lower: '#7a5a3a', lowerH: 0.7, floor: '#6a4a30', ceil: '#e8dcc0', hemi: 0.95, sunI: 0.8, trim: '#7a5a3a', lights: [[0, 2.2, 0.5, 3]] });
  for (const x of [-2.4, 2.4]) wallWindow(s, x, 1.45, -2.99, { w: 1.0, h: 1.2, out: '#e6ecf2', curtain: null, glow: true });
  const tb = P.tableCloth(2.4, 1.0, '#8a1f1f', 0.78); tb.position.set(0, 0, -1.6); s.add(tb); s.table = tb;
  const bx = MX.ballotBox(); bx.scale.setScalar(0.6); bx.position.set(0, tb.top, -1.6); s.add(bx); s.box = bx;
  const sg = P.signBoard('ВЫБОРЫ ВЪ УЧРЕДИТЕЛЬНОЕ СОБРАНІЕ', { w: 4.4, h: 0.4, bg: '#efe6d0', fg: '#7a1f1f', border: '#7a1f1f' }); sg.position.set(0, 2.15, -2.98); s.add(sg);
  return s;
}

// The Ipatiev House basement room: empty, a bare bulb, two chairs (non-graphic memorial framing).
export function ipatievBasement() {
  const wp = P.canvasTex(256, 256, (x, W, H) => { x.fillStyle = '#d9cfb8'; x.fillRect(0, 0, W, H); for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? 'rgba(150,130,100,.18)' : 'rgba(255,255,255,.08)'; x.fillRect(i * 16, 0, 8, H); } });
  wp.wrapS = wp.wrapT = THREE.RepeatWrapping; wp.repeat.set(4, 1);
  const s = room({ w: 6, d: 5, h: 2.1, wallTex: wp, floor: '#5a4636', ceil: '#cfc4ae', hemi: 0.35, sunI: 0.1, bg: '#050505', lights: [[0, 1.85, -0.6, 3.5, '#ffd9a0', 6]] });
  s.add(at(LP.mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: '#fff2c8' })), 0, 1.9, -0.6)); s.add(at(cyl(0.006, 0.006, 0.2, '#2a2a2a', 4), 0, 2.0, -0.6));
  wallWindow(s, 1.6, 1.65, -2.49, { w: 0.7, h: 0.5, out: '#0c1220', bars: true, frame: '#5a4a3a' });
  for (const [x, z, r] of [[-0.35, -1.4, 0.25], [0.4, -1.5, -0.2]]) { const c = P.chairR('#4a3020', '#6a4a3a'); c.position.set(x, 0, z); c.rotation.y = r; s.add(c); }
  return s;
}
// ------------------------------------------------------------ Mexican presidential office (Lázaro Cárdenas, 1936)
export function mxOffice() {
  const s = room({ w: 8, d: 6, h: 2.8, wall: '#e9dfc8', lower: '#6a4a30', lowerH: 0.8, floor: '#7a5234', ceil: '#f2ead8', hemi: 1.0, sunI: 0.9, trim: '#c9a227', lights: [[0, 2.4, 0.5, 3.5]] });
  for (const x of [-2.4, 2.4]) wallWindow(s, x, 1.5, -2.99, { w: 1.1, h: 1.4, out: '#d8ecff', curtain: '#7a1f2a', glow: true });
  const d = P.desk(2.0, 0.9, '#5a3a24'); d.position.set(0, 0, -1.6); s.add(d); s.desk = d;
  const ch = P.chairR('#5a3a24', '#7a1f2a'); ch.position.set(0, 0, -2.05); s.add(ch); s.seat = [0, ch.top - 0.12, -2.0];
  const f = MX.flag('mx', 2.2, 0.9, 0.56); f.position.set(1.4, 0, -2.6); s.add(f); s.flag = f;
  const pp = P.papers(4, 3); pp.position.set(-0.15, d.top, -1.55); s.add(pp);
  const l = P.deskLamp(true, '#2f6a3a'); l.position.set(0.32, d.top, -1.7); s.add(l);
  return s;
}
