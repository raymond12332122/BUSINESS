// Finishing pass for the independence of the Americas video: anime shading on the cast (cel ramp, rim light,
// ink outline), and a post-processing chain (soft bloom, filmic tone map, colour grade, vignette).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// ------------------------------------------------------------ cast shading
// Shared uniforms, so each set can retune the rim and outline for its light (night scenes want less rim).
export const LOOK = {
  rimColor: { value: new THREE.Color('#fff2dc') }, rimK: { value: 0.32 }, rimPow: { value: 2.6 },
  ink: { value: new THREE.Color('#2b1d1c') }, inkW: { value: 1.0 },
  shadeLo: { value: 0.62 }, shadeTint: { value: new THREE.Color('#b9a6c8') },
};
const RAMP = (() => {   // three-step cel ramp: shadow, a narrow soft step, light
  const d = new Uint8Array([90, 90, 90, 255, 168, 168, 168, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
const NOT_OUTLINED = /Eyes?\b|_eye|Mouth|Cheek|Brow|mayu|Front|Transparent|_face/i;   // big-model faces carry inner mouth/eye shells
const toonCache = new Map();

// Cel-shaded copy of a lit material: flat light/shadow bands tinted towards lilac in the shadow (anime style),
// plus a rim light. Keeps any onBeforeCompile patch already on the source (the uniform recolouring).
function toonOf(src) {
  if (toonCache.has(src)) return toonCache.get(src);
  const m = new THREE.MeshToonMaterial({ map: src.map, color: src.color, gradientMap: RAMP, side: src.side, transparent: src.transparent,
    opacity: src.opacity, alphaTest: src.alphaTest, depthWrite: src.depthWrite, name: src.name, emissive: src.emissive, emissiveMap: src.emissiveMap });
  const prev = src.onBeforeCompile, prevKey = src.customProgramCacheKey();
  m.onBeforeCompile = (sh, r) => {
    prev && prev.call(m, sh, r);
    Object.assign(sh.uniforms, { rimColor: LOOK.rimColor, rimK: LOOK.rimK, rimPow: LOOK.rimPow, shadeLo: LOOK.shadeLo, shadeTint: LOOK.shadeTint });
    sh.fragmentShader = 'uniform vec3 rimColor; uniform float rimK; uniform float rimPow; uniform float shadeLo; uniform vec3 shadeTint;\n' + sh.fragmentShader
      .replace('#include <opaque_fragment>', `
        {
          vec3 V = normalize(vViewPosition), Nn = normalize(normal);
          float fr = pow(1.0 - clamp(dot(Nn, V), 0.0, 1.0), rimPow);
          // lift the darkest band and tint it, so shadowed cloth keeps its colour instead of going muddy
          float l = dot(outgoingLight, vec3(0.299, 0.587, 0.114)), b = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114)) + 1e-4;
          float lit = clamp(l / b, 0.0, 2.0);
          outgoingLight = mix(outgoingLight, diffuseColor.rgb * shadeTint * shadeLo, (1.0 - smoothstep(0.35, 0.75, lit)) * 0.55);
          outgoingLight += rimColor * fr * rimK * (0.35 + 0.65 * diffuseColor.rgb);
        }
        #include <opaque_fragment>`);
  };
  m.customProgramCacheKey = () => prevKey + '|toon';
  toonCache.set(src, m); return m;
}

// Ink outline (inverted hull): a back-face shell pushed out along the skinned normals, in world units.
const inkMats = new Map();
function inkMat(scale) {
  const k = Math.round(scale * 1e5) / 1e5;
  if (inkMats.has(k)) return inkMats.get(k);
  const m = new THREE.MeshBasicMaterial({ color: LOOK.ink.value, side: THREE.BackSide });
  m.onBeforeCompile = sh => {
    sh.uniforms.inkW = LOOK.inkW; sh.uniforms.inkC = LOOK.ink; sh.uniforms.inkS = { value: 0.0032 / k };
    sh.vertexShader = 'uniform float inkW; uniform float inkS;\n' + sh.vertexShader.replace('#include <project_vertex>', `
      #ifdef USE_SKINNING
        vec3 inkN = normalize(objectNormal);
      #else
        vec3 inkN = normalize(normal);
      #endif
      transformed += inkN * inkS * inkW;
      #include <project_vertex>`);
    sh.fragmentShader = 'uniform vec3 inkC;\n' + sh.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4( inkC, opacity );');
  };
  m.customProgramCacheKey = () => 'ink' + k;
  inkMats.set(k, m); return m;
}

// Apply the anime finish to a spawned rig (call once per rig, after its outfit is on).
export function finish(rig, { outline = true } = {}) {
  if (rig.finished) return rig; rig.finished = true;
  rig.root.updateMatrixWorld(true);
  const add = [];
  rig.model.traverse(o => {
    if (!o.isMesh || !o.visible || o.userData.ink) return;
    const m = o.material; if (!m || Array.isArray(m)) return;
    if (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial || m.isMeshLambertMaterial || m.isMeshPhongMaterial) o.material = toonOf(m);
    if (!outline || (NOT_OUTLINED.test(m.name || '') && !/face0/.test(m.name || '')) || (m.transparent && m.opacity < 1) || m.alphaTest > 0 || !o.isSkinnedMesh) return;
    add.push(o);
  });
  for (const o of add) {
    const s = new THREE.Vector3(); o.getWorldScale(s); const sc = Math.max(1e-6, s.x / rig.root.scale.x);
    const ink = new THREE.SkinnedMesh(o.geometry, inkMat(sc)); ink.bind(o.skeleton, o.bindMatrix);
    ink.userData.ink = true; ink.frustumCulled = false; ink.castShadow = false; ink.receiveShadow = false;
    if (o.morphTargetInfluences) { ink.morphTargetInfluences = o.morphTargetInfluences; ink.morphTargetDictionary = o.morphTargetDictionary; }
    o.parent.add(ink); ink.position.copy(o.position); ink.quaternion.copy(o.quaternion); ink.scale.copy(o.scale);
    o.userData.inkShell = ink;
  }
  return rig;
}

// Toon + rim for props held or worn (hats, sabres) so they sit with the cast.
export function finishProp(obj) {
  obj.traverse(o => { if (o.isMesh && o.material && !Array.isArray(o.material) && o.material.isMeshStandardMaterial && !o.material.transparent) o.material = toonOf(o.material); });
  return obj;
}

// ------------------------------------------------------------ post-processing
const GRADE = {
  uniforms: { tDiffuse: { value: null }, sat: { value: 1.12 }, con: { value: 0.18 }, vign: { value: 0.22 }, warm: { value: 0.035 }, cool: { value: 0.045 },
    lift: { value: 0.012 }, aspect: { value: 16 / 9 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float sat, con, vign, warm, cool, lift, aspect; varying vec2 vUv;
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      c = mix(c, c * c * (3.0 - 2.0 * c), con);                                  // gentle S-curve
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c = mix(vec3(l), c, sat);                                                    // richer colour
      c += (1.0 - l) * cool * vec3(-0.35, 0.05, 0.6) + l * warm * vec3(0.6, 0.25, -0.45);   // teal shadows, warm highlights
      c = c * (1.0 - lift) + lift;
      vec2 d = (vUv - 0.5) * vec2(aspect, 1.0);
      c *= 1.0 - vign * smoothstep(0.45, 1.05, length(d));
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
    }`,
};
export function makePost(renderer, W, H) {
  const pr = renderer.getPixelRatio(), w = Math.round(W * pr), h = Math.round(H * pr);
  const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt); composer.setPixelRatio(pr); composer.setSize(W, H);
  const rp = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
  const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.28, 0.55, 1.05);
  const grade = new ShaderPass(GRADE);
  composer.addPass(rp); composer.addPass(bloom); composer.addPass(new OutputPass()); composer.addPass(grade);
  return {
    composer, bloom, grade,
    render(scene, camera) {
      const L = scene.userData.look || {};
      rp.scene = scene; rp.camera = camera;
      bloom.enabled = L.bloom !== 0; bloom.strength = L.bloom ?? 0.3; bloom.threshold = Math.max(1.5, L.bloomT ?? 1.5);
      const g = grade.uniforms; g.sat.value = L.sat ?? 1.12; g.con.value = L.con ?? 0.18; g.vign.value = L.vign ?? 0.22;
      g.warm.value = L.warm ?? 0.035; g.cool.value = L.cool ?? 0.045;
      LOOK.rimK.value = L.rim ?? 0.32; LOOK.rimColor.value.set(L.rimColor || '#fff2dc'); LOOK.inkW.value = L.ink ?? 1.0;
      LOOK.shadeTint.value.set(L.shadeTint || '#b9a6c8');
      composer.render();
    },
  };
}

// ------------------------------------------------------------ painted textures
const R = seed => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
export function canvasTex(w, h, draw, { repeat = null, srgb = true } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
}
const texCache = {};
// Greyscale detail (multiplies the ground's vertex colours): grass blades, dirt pebbles, sand ripples, snow, cobbles.
export function detailTex(kind) {
  if (texCache[kind]) return texCache[kind];
  const t = canvasTex(512, 512, (g, W, H) => {
    const r = R(kind.length * 977 + 13);
    g.fillStyle = '#d6d6d6'; g.fillRect(0, 0, W, H);
    const blot = (n, rad, a, lo, hi) => { for (let i = 0; i < n; i++) { const v = lo + r() * (hi - lo) | 0; g.fillStyle = `rgba(${v},${v},${v},${a})`; g.beginPath(); g.arc(r() * W, r() * H, rad * (0.4 + r()), 0, 7); g.fill(); } };
    if (kind === 'grass') {
      blot(60, 46, 0.22, 150, 255);
      for (let i = 0; i < 5200; i++) { const x = r() * W, y = r() * H, l = 5 + r() * 11, a = -Math.PI / 2 + (r() - 0.5) * 0.9, v = 120 + r() * 135 | 0;
        g.strokeStyle = `rgba(${v},${v},${v},0.55)`; g.lineWidth = 1 + r() * 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    } else if (kind === 'dirt') {
      blot(70, 40, 0.2, 150, 250); blot(1400, 2.2, 0.55, 110, 250); blot(160, 5, 0.45, 120, 200);
      for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(120,120,120,0.25)'; g.lineWidth = 1; g.beginPath(); let x = r() * W, y = r() * H; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 30; y += (r() - 0.5) * 30; g.lineTo(x, y); } g.stroke(); }
    } else if (kind === 'sand') {
      blot(50, 50, 0.16, 170, 255);
      for (let y = 0; y < H; y += 9) { g.strokeStyle = `rgba(150,150,150,${0.12 + r() * 0.1})`; g.lineWidth = 2; g.beginPath(); for (let x = 0; x <= W; x += 16) g.lineTo(x, y + Math.sin(x * 0.05 + y) * 3); g.stroke(); }
      blot(2400, 1.2, 0.4, 140, 255);
    } else if (kind === 'snow') {
      g.fillStyle = '#ececec'; g.fillRect(0, 0, W, H); blot(60, 60, 0.12, 200, 255); blot(900, 1.1, 0.7, 255, 255); blot(500, 1.6, 0.25, 190, 220);
    } else if (kind === 'cobble') {
      g.fillStyle = '#9a9a9a'; g.fillRect(0, 0, W, H);
      const n = 12, s = W / n;
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const ox = (j % 2) * s / 2, v = 175 + r() * 70 | 0, x = i * s + ox + 3 + r() * 2, y = j * s + 3 + r() * 2, w = s - 6 - r() * 3, h = s - 6 - r() * 3;
        g.fillStyle = `rgb(${v},${v},${v})`; g.beginPath(); g.roundRect(x % W, y, w, h, 9); g.fill(); if (x + w > W) { g.beginPath(); g.roundRect(x - W, y, w, h, 9); g.fill(); }
        g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.roundRect((x % W) + 3, y + 3, w * 0.6, h * 0.35, 6); g.fill(); }
      blot(900, 1.2, 0.35, 90, 160);
    } else if (kind === 'flag') {
      g.fillStyle = '#b8b8b8'; g.fillRect(0, 0, W, H);
      const rows = 6; for (let j = 0; j < rows; j++) { let x = -r() * 60; const h = H / rows; while (x < W) { const w = 50 + r() * 70, v = 185 + r() * 60 | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x + 2, j * h + 2, w - 4, h - 4); x += w; } }
      blot(1200, 1.3, 0.3, 100, 170);
    }
  }, { repeat: [1, 1] });
  texCache[kind] = t; return t;
}

// ------------------------------------------------------------ outdoor sets
const GTIME = { value: 0 };
export function tick(t) { GTIME.value = t; }
// Ground detail texture + a little brighter, so the vertex-colour washes read as grass / dirt / snow / cobbles.
export function groundDetail(s, kind = 'grass', { tile = 3.2, boost = 1.16 } = {}) {
  const gm = s.userData.ground; if (!gm) return s;
  const size = s.userData.groundSize || 300, t = detailTex(kind).clone(); t.needsUpdate = true; t.repeat.set(size / tile, size / tile);
  gm.material.map = t; gm.material.color.setScalar(boost); gm.material.needsUpdate = true; return s;
}
// Swaying grass tufts and wild flowers scattered around the action (instanced; no shadows).
export function grass(s, { area = [-22, -30, 22, 9], n = 7000, colors = null, flowers = 0.05, h = 0.1, clear = [], seed = 7 } = {}) {
  const r = R(seed);
  const blade = new THREE.BufferGeometry(); const P = [], N = [], VC = [];
  for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2 + r() * 0.5, cx = Math.cos(a) * 0.03, cz = Math.sin(a) * 0.03, x = Math.cos(a + 1.57) * 0.012, z = Math.sin(a + 1.57) * 0.012, lean = (r() - 0.5) * 0.06, hh = h * (0.6 + r() * 0.6);
    P.push(cx - x, 0, cz - z, cx + x, 0, cz + z, cx * 1.8 + lean, hh, cz * 1.8 + lean * 0.6); for (let q = 0; q < 3; q++) N.push(0, 1, 0); VC.push(0.72, 0.72, 0.72, 0.72, 0.72, 0.72, 1.45, 1.42, 1.25); continue;
    P.push(-x, 0, -z, x, 0, z, lean, hh, lean * 0.6); for (let q = 0; q < 3; q++) N.push(0, 1, 0); }
  blade.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); blade.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); blade.setAttribute('color', new THREE.Float32BufferAttribute(VC, 3));
  const mat = new THREE.MeshLambertMaterial({ color: '#ffffff', side: THREE.DoubleSide, vertexColors: true });
  mat.onBeforeCompile = sh => { sh.uniforms.gTime = GTIME; sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\n  normal = normalize(vNormal);');   // both faces lit from above
    sh.vertexShader = 'uniform float gTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    { vec4 wp = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0); float k = position.y * 4.0; transformed.x += k * 0.04 * sin(gTime * 1.7 + wp.x * 0.6 + wp.z * 0.3); transformed.z += k * 0.025 * sin(gTime * 1.3 + wp.z * 0.7); }`); };
  mat.customProgramCacheKey = () => 'grassSway';
  const im = new THREE.InstancedMesh(blade, mat, n); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color(); let k = 0;
  const gm = s.userData.ground, size = s.userData.groundSize || 300, gc = gm && gm.geometry.attributes.color, seg = 80, step = size / seg;
  const under = (x, z) => { const ix = Math.max(0, Math.min(seg, Math.round((x + size / 2) / step))), iy = Math.max(0, Math.min(seg, Math.round((z + size / 2) / step))), i = iy * (seg + 1) + ix; return c.setRGB(gc.getX(i), gc.getY(i), gc.getZ(i)); };
  const [x0, z0, x1, z1] = area;
  for (let i = 0; i < n * 3 && k < n; i++) {
    const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0);
    if (clear.some(([cx, cz, cr]) => Math.hypot(x - cx, z - cz) < cr)) continue;
    const sc = 0.7 + r() * 0.8; q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r() * 6.28);
    m4.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(sc, sc * (0.8 + r() * 0.6), sc)); im.setMatrixAt(k, m4);
    if (colors || !gc) c.set((colors || ['#5d8a35', '#6f9a3c', '#4f7a30', '#86a845'])[(r() * (colors || [0, 0, 0, 0]).length) | 0]); else under(x, z).offsetHSL(0.012, 0.06, 0);
    c.multiplyScalar(0.92 + r() * 0.3); im.setColorAt(k, c); k++;
  }
  im.count = k; im.castShadow = false; im.receiveShadow = true; im.frustumCulled = false; s.add(im);
  if (flowers > 0) {
    const fg = new THREE.SphereGeometry(0.022, 6, 4).scale(1, 0.6, 1), fm = new THREE.MeshLambertMaterial({ color: '#ffffff' }), fn = Math.round(n * flowers);
    const fi = new THREE.InstancedMesh(fg, fm, fn); const pal = ['#f4f1ea', '#f2d04a', '#e86a8a', '#c98ae0', '#f0a040'];
    for (let i = 0; i < fn; i++) { const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0); if (clear.some(([cx, cz, cr]) => Math.hypot(x - cx, z - cz) < cr)) { fi.setMatrixAt(i, m4.makeScale(0, 0, 0)); continue; }
      m4.makeTranslation(x, h * (0.6 + r() * 0.6), z); fi.setMatrixAt(i, m4); fi.setColorAt(i, c.set(pal[(r() * pal.length) | 0])); }
    fi.frustumCulled = false; s.add(fi);
  }
  return im;
}
// Painted sky: three-stop gradient, sun disc and halo, drifting fbm clouds (replaces the plain gradient dome).
export function paintedSky(s, { clouds = 0.5, sunCol = '#fff0d0', sun = 1, cloudCol = null, stars = 0 } = {}) {
  const sky = s.userData.sky; if (!sky) return s;
  const u = sky.material.uniforms, dl = s.userData.sun;
  const sd = dl ? dl.position.clone().sub(dl.target.position).normalize() : new THREE.Vector3(0.4, 0.5, -0.7);
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: u.top, hor: u.hor, bot: u.bot, sunDir: { value: sd }, sunCol: { value: new THREE.Color(sunCol) }, sunK: { value: sun }, cloudK: { value: clouds }, stars: { value: stars },
      cloudCol: { value: new THREE.Color(cloudCol || '#ffffff') }, gTime: GTIME },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `uniform vec3 top, hor, bot, sunDir, sunCol, cloudCol; uniform float sunK, cloudK, gTime, stars; varying vec3 vP;
      float hs(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float ns(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hs(i), hs(i + vec2(1, 0)), f.x), mix(hs(i + vec2(0, 1)), hs(i + vec2(1, 1)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++){ s += a * ns(p); p = p * 2.07 + 13.1; a *= 0.5; } return s; }
      void main(){
        vec3 d = normalize(vP); float h = d.y;
        vec3 c = h > 0.0 ? mix(hor, top, pow(h, 0.5)) : mix(hor, bot, pow(-h, 0.5));
        float sd = max(dot(d, sunDir), 0.0);
        c += sunCol * sunK * (pow(sd, 900.0) * 3.0 + pow(sd, 24.0) * 0.35 + pow(sd, 4.0) * 0.12);
        if (h > 0.0 && cloudK > 0.0) {
          vec2 uv = d.xz / (h + 0.18) * 1.3 + vec2(gTime * 0.004, 0.0);
          float n = fbm(uv * 1.7), n2 = fbm(uv * 3.1 + 5.0);
          float cl = smoothstep(0.62 - cloudK * 0.3, 0.92 - cloudK * 0.2, n) * smoothstep(0.0, 0.16, h);
          vec3 lit = mix(cloudCol, hor, 0.25) * (0.86 + 0.28 * n2) + sunCol * sunK * pow(sd, 6.0) * 0.5;
          vec3 shade = mix(hor, top, 0.35) * 0.95;
          c = mix(c, mix(shade, lit, smoothstep(0.35, 0.8, n2)), cl * 0.92);
        }
        if (stars > 0.0 && h > 0.0) { vec2 g = floor(d.xz / (h + 0.35) * 260.0); float st = step(0.9965, hs(g)) * (0.5 + 0.5 * hs(g + 7.0));
          c += vec3(0.9, 0.95, 1.0) * st * stars * smoothstep(0.04, 0.35, h); }
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  sky.material = m; return s;
}

// ------------------------------------------------------------ interiors
const shade = (hex, k) => new THREE.Color(hex).multiplyScalar(k).getStyle();
const stdM = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });
function floorTex(kind, base) {
  return canvasTex(512, 512, (g, W, H) => {
    const r = R(kind.length * 31 + 7), b = new THREE.Color(base);
    const col = k => `rgb(${Math.min(255, b.r * 255 * k) | 0},${Math.min(255, b.g * 255 * k) | 0},${Math.min(255, b.b * 255 * k) | 0})`;
    if (kind === 'planks') {
      const n = 8, h = H / n;
      for (let j = 0; j < n; j++) { let x = -r() * 200; while (x < W) { const w = 140 + r() * 160, k = 0.82 + r() * 0.3; g.fillStyle = col(k); g.fillRect(x, j * h, w, h);
        for (let q = 0; q < 7; q++) { g.strokeStyle = `rgba(0,0,0,${0.05 + r() * 0.06})`; g.lineWidth = 1; g.beginPath(); const yy = j * h + r() * h; g.moveTo(x, yy); g.bezierCurveTo(x + w * 0.3, yy + (r() - 0.5) * 6, x + w * 0.6, yy + (r() - 0.5) * 6, x + w, yy + (r() - 0.5) * 4); g.stroke(); }
        g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x, j * h, 2, h); x += w; }
        g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(0, j * h, W, 2); g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(0, j * h + 2, W, 2); }
    } else if (kind === 'marble') {
      const n = 4, s = W / n;
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const dark = (i + j) % 2; g.fillStyle = dark ? '#3a3236' : '#ece6dc'; g.fillRect(i * s, j * s, s, s);
        for (let q = 0; q < 5; q++) { g.strokeStyle = dark ? 'rgba(255,255,255,0.08)' : 'rgba(80,70,70,0.12)'; g.lineWidth = 1 + r() * 2; g.beginPath(); let x = i * s + r() * s, y = j * s; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 40; y += s / 6; g.lineTo(x, y); } g.stroke(); } }
      g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, H); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(W, i * s); g.stroke(); }
    } else if (kind === 'tiles') {
      const n = 8, s = W / n;
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { g.fillStyle = col(0.85 + r() * 0.3); g.fillRect(i * s + 2, j * s + 2, s - 4, s - 4); g.fillStyle = 'rgba(255,255,255,0.07)'; g.fillRect(i * s + 4, j * s + 4, s * 0.5, s * 0.25); }
      g.fillStyle = 'rgba(40,30,25,0.6)'; for (let i = 0; i <= n; i++) { g.fillRect(i * s - 2, 0, 4, H); g.fillRect(0, i * s - 2, W, 4); }
    } else { // flagstones
      g.fillStyle = col(0.6); g.fillRect(0, 0, W, H); const rows = 5;
      for (let j = 0; j < rows; j++) { let x = -r() * 80; const h = H / rows; while (x < W) { const w = 70 + r() * 110; g.fillStyle = col(0.8 + r() * 0.35); g.beginPath(); g.roundRect(x + 3, j * h + 3, w - 6, h - 6, 6); g.fill(); x += w; } }
    }
  });
}
function wallTex(kind, base, accent) {
  return canvasTex(512, 512, (g, W, H) => {
    const b = new THREE.Color(base), a = new THREE.Color(accent);
    g.fillStyle = b.getStyle(); g.fillRect(0, 0, W, H);
    const r = R(kind.length * 17 + 3);
    if (kind === 'damask') {
      g.fillStyle = a.getStyle(); g.globalAlpha = 0.28;
      for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const cx = i * 128 + (j % 2) * 64 + 64, cy = j * 128 + 64; g.save(); g.translate(cx, cy);
        for (let k = 0; k < 4; k++) { g.rotate(Math.PI / 2); g.beginPath(); g.ellipse(0, -26, 9, 24, 0, 0, 7); g.fill(); g.beginPath(); g.arc(18, -18, 6, 0, 7); g.fill(); }
        g.beginPath(); g.arc(0, 0, 9, 0, 7); g.fill(); g.restore(); }
      g.globalAlpha = 1;
    } else if (kind === 'stripes') {
      for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? a.getStyle() : 'rgba(0,0,0,0)'; g.globalAlpha = 0.22; g.fillRect(i * 32, 0, 14, H); } g.globalAlpha = 1;
    } else if (kind === 'plaster') {
      for (let i = 0; i < 900; i++) { const v = r(); g.fillStyle = `rgba(${v > 0.5 ? 255 : 0},${v > 0.5 ? 255 : 0},${v > 0.5 ? 255 : 0},0.035)`; g.beginPath(); g.arc(r() * W, r() * H, 4 + r() * 22, 0, 7); g.fill(); }
    } else if (kind === 'stone') {
      const rows = 7, h = H / rows; g.fillStyle = shade(base, 0.6); g.fillRect(0, 0, W, H);
      for (let j = 0; j < rows; j++) { let x = -(j % 2) * 60 - r() * 30; while (x < W) { const w = 90 + r() * 70; g.fillStyle = shade(base, 0.82 + r() * 0.3); g.fillRect(x + 3, j * h + 3, w - 6, h - 6); x += w; } }
    }
  });
}
function panelTex(base) {   // wainscot: raised panels with light/dark bevels
  return canvasTex(512, 256, (g, W, H) => {
    g.fillStyle = base; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 2; i++) { const x = i * 256 + 26, y = 30, w = 204, h = H - 60;
      g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(x, y, w, 6); g.fillRect(x, y, 6, h);
      g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(x, y + h - 6, w, 6); g.fillRect(x + w - 6, y, 6, h);
      g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(x + 20, y + 20, w - 40, h - 40); g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 3; g.strokeRect(x + 20, y + 20, w - 40, h - 40); }
  });
}
const FLAME = new THREE.MeshBasicMaterial({ color: new THREE.Color(5.0, 3.4, 1.4), toneMapped: true });
function flame() { const m = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), FLAME); m.scale.set(0.7, 1.6, 0.7); return m; }
function candle(h = 0.16) { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, h, 8), stdM('#f4ecd8')); c.position.y = h / 2; g.add(c);
  const f = flame(); f.position.y = h + 0.04; g.add(f); return g; }
export function candelabrum() {   // three-branch table candlestick
  const g = new THREE.Group(), brass = stdM('#c9a227', { metalness: 0.7, roughness: 0.3 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.03, 12), brass); base.position.y = 0.015; g.add(base);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.02, 0.26, 8), brass); stem.position.y = 0.15; g.add(stem);
  const arm = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.008, 6, 16, Math.PI), brass); arm.position.y = 0.26; arm.rotation.z = Math.PI; g.add(arm);
  for (const x of [-0.09, 0, 0.09]) { const c = candle(0.12); c.position.set(x, x ? 0.26 : 0.29, 0); g.add(c); }
  return g;
}
export function chandelier(r = 0.7, n = 8) {
  const g = new THREE.Group(), gold = stdM('#c9a227', { metalness: 0.7, roughness: 0.3 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.03, 8, 40), gold); ring.rotation.x = Math.PI / 2; g.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(r * 0.55, 0.025, 8, 32), gold); ring2.rotation.x = Math.PI / 2; ring2.position.y = 0.3; g.add(ring2);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 1.4, 8), gold); stem.position.y = 0.6; g.add(stem);
  const bob = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), gold); bob.position.y = -0.1; g.add(bob);
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const c = candle(); c.position.set(Math.cos(a) * r, 0.02, Math.sin(a) * r); g.add(c);
    const c2 = candle(0.12); c2.position.set(Math.cos(a + 0.4) * r * 0.55, 0.32, Math.sin(a + 0.4) * r * 0.55); g.add(c2);
    for (let k = 0; k < 3; k++) { const d = new THREE.Mesh(new THREE.OctahedronGeometry(0.025), new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.85 })); d.position.set(Math.cos(a + 0.2) * r * 0.95, -0.08 - k * 0.06, Math.sin(a + 0.2) * r * 0.95); g.add(d); } }
  const l = new THREE.PointLight('#ffcf8a', 5, 9, 1.6); l.position.y = 0.1; g.add(l);
  return g;
}
export function painting(w = 1.2, h = 0.9, { seed = 1, kind = 'landscape' } = {}) {
  const g = new THREE.Group(), gold = stdM('#b8902a', { metalness: 0.6, roughness: 0.35 });
  const tex = canvasTex(256, Math.round(256 * h / w), (c, W, H) => {
    const r = R(seed * 7 + 1);
    if (kind === 'portrait') { const bg = c.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#3a2a20'); bg.addColorStop(1, '#1a120c'); c.fillStyle = bg; c.fillRect(0, 0, W, H);
      c.fillStyle = ['#7a1f2a', '#1f3a6a', '#2a4a2a'][seed % 3]; c.beginPath(); c.ellipse(W / 2, H * 0.95, W * 0.38, H * 0.42, 0, 0, 7); c.fill();
      c.fillStyle = '#e8c8a8'; c.beginPath(); c.ellipse(W / 2, H * 0.42, W * 0.14, H * 0.13, 0, 0, 7); c.fill();
      c.fillStyle = '#e8e2d4'; c.beginPath(); c.ellipse(W / 2, H * 0.3, W * 0.18, H * 0.1, 0, Math.PI, 0); c.fill();
    } else { const sky = c.createLinearGradient(0, 0, 0, H * 0.6); sky.addColorStop(0, '#6a8ab0'); sky.addColorStop(1, '#e8d2a8'); c.fillStyle = sky; c.fillRect(0, 0, W, H);
      for (let k = 0; k < 3; k++) { c.fillStyle = ['#5a6a4a', '#4a5a3a', '#3a4a2a'][k]; c.beginPath(); c.moveTo(0, H); let x = 0; c.lineTo(0, H * (0.5 + k * 0.1)); while (x < W) { x += 20 + r() * 30; c.lineTo(x, H * (0.45 + k * 0.12) + (r() - 0.5) * 30); } c.lineTo(W, H); c.fill(); }
      c.fillStyle = 'rgba(255,240,200,0.5)'; c.beginPath(); c.arc(W * 0.7, H * 0.25, 14, 0, 7); c.fill(); }
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(0, 0, W, 6); c.fillRect(0, H - 6, W, 6);
  });
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 })); g.add(pic);
  for (const [x, y, ww, hh] of [[0, h / 2 + 0.04, w + 0.16, 0.08], [0, -h / 2 - 0.04, w + 0.16, 0.08], [w / 2 + 0.04, 0, 0.08, h], [-w / 2 - 0.04, 0, 0.08, h]]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(ww, hh, 0.06), gold); b.position.set(x, y, 0.02); g.add(b); }
  return g;
}
export function rug(w = 4, d = 2.6, { color = '#7a1f2a', border = '#c9a227', field = '#1f2e5a' } = {}) {
  const tex = canvasTex(512, Math.round(512 * d / w), (c, W, H) => {
    c.fillStyle = color; c.fillRect(0, 0, W, H); c.fillStyle = border; c.fillRect(12, 12, W - 24, H - 24); c.fillStyle = color; c.fillRect(22, 22, W - 44, H - 44);
    c.fillStyle = field; c.fillRect(40, 40, W - 80, H - 80);
    c.strokeStyle = border; c.lineWidth = 4; c.beginPath(); c.ellipse(W / 2, H / 2, W * 0.22, H * 0.28, 0, 0, 7); c.stroke();
    c.fillStyle = color; c.beginPath(); c.ellipse(W / 2, H / 2, W * 0.12, H * 0.16, 0, 0, 7); c.fill();
    for (let i = 0; i < 4; i++) { c.save(); c.translate(i % 2 ? W - 70 : 70, i < 2 ? 70 : H - 70); c.fillStyle = border; c.beginPath(); c.arc(0, 0, 16, 0, 7); c.fill(); c.restore(); }
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 })); m.rotation.x = -Math.PI / 2; m.position.y = 0.006; m.receiveShadow = true; return m;
}
// Shaft of light from a window: additive, fading towards the floor; dust motes drift through it.
export function lightShaft(from, to, w = 1.2, { color = '#ffe2b0', k = 0.16 } = {}) {
  const g = new THREE.Group(), len = from.distanceTo(to);
  const tex = canvasTex(64, 256, (c, W, H) => { const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
    const gx = c.createLinearGradient(0, 0, W, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(0.2, 'rgba(0,0,0,0)'); gx.addColorStop(0.8, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)'); c.globalCompositeOperation = 'destination-out'; c.fillStyle = gx; c.fillRect(0, 0, W, H); }, { srgb: false });
  const mat = new THREE.MeshBasicMaterial({ map: tex, color, transparent: true, opacity: k, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  for (let i = 0; i < 2; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, len), mat); p.position.y = -len / 2; p.rotation.y = i * Math.PI / 2; g.add(p); }
  g.position.copy(from); g.lookAt(to); g.rotateX(Math.PI / 2); g.renderOrder = 5;
  return g;
}
export function motes(parent, box, n = 120, seed = 3) {
  const r = R(seed), pos = [];
  for (let i = 0; i < n; i++) pos.push(box[0] + r() * (box[3] - box[0]), box[1] + r() * (box[4] - box[1]), box[2] + r() * (box[5] - box[2]));
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ color: '#fff0d0', size: 0.02, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending });
  m.onBeforeCompile = sh => { sh.uniforms.gTime = GTIME; sh.vertexShader = 'uniform float gTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    transformed.y += mod(gTime * 0.05 + position.x * 3.1, 0.6) - 0.3; transformed.x += 0.08 * sin(gTime * 0.4 + position.z * 5.0);`); };
  const p = new THREE.Points(g, m); parent.add(p); return p;
}
export function curtain(w = 1.0, h = 3.2, color = '#8a1f2a') {
  const geo = new THREE.PlaneGeometry(w, h, 24, 1), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, 0.06 * Math.sin(x / w * Math.PI * 7)); }
  geo.computeVertexNormals();
  const tex = canvasTex(256, 64, (c, W, H) => { c.fillStyle = color; c.fillRect(0, 0, W, H); for (let i = 0; i < 14; i++) { c.fillStyle = `rgba(0,0,0,${0.12 + 0.1 * Math.sin(i)})`; c.fillRect(i * W / 14, 0, W / 28, H); } });
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, side: THREE.DoubleSide }));
  const g = new THREE.Group(); g.add(m); const tie = new THREE.Mesh(new THREE.TorusGeometry(w * 0.32, 0.03, 6, 16), stdM('#c9a227', { metalness: 0.6 })); tie.rotation.x = Math.PI / 2; tie.scale.set(1, 0.4, 1); tie.position.y = -h * 0.18; g.add(tie);
  return g;
}
// Dress up a room built by mx interior(): textured floor, wainscot + wallpaper, crown moulding, pilasters,
// glazed windows with light shafts and motes, chandelier, paintings and a rug.
export function room(s, { floorKind = 'planks', floorCol = null, paper = 'damask', paperCol = null, paperAccent = '#c9a227', panelCol = null,
  pilasters = true, chandeliers = 1, paintings = 2, rugOpt = null, shafts = true, windowCol = '#fff2d6', warm = true } = {}) {
  const R0 = s.userData.room; if (!R0) return s;
  const { w, d, h, wall, floor } = R0;
  R0.fl.material = new THREE.MeshStandardMaterial({ map: floorTex(floorKind, floorCol || floor), roughness: floorKind === 'marble' ? 0.25 : 0.55, metalness: 0.0 });
  R0.fl.material.map.wrapS = R0.fl.material.map.wrapT = THREE.RepeatWrapping; R0.fl.material.map.repeat.set(w / 3, d / 3);
  const pt = wallTex(paper, paperCol || wall, paperAccent); pt.wrapS = pt.wrapT = THREE.RepeatWrapping; pt.repeat.set(w / 2.4, h / 2.4);
  R0.wm.map = pt; R0.wm.color.set('#ffffff'); R0.wm.needsUpdate = true;
  const pc = panelCol || shade(wall, 0.72), ph = Math.min(1.1, h * 0.24);
  const ptex = panelTex(pc); ptex.wrapS = THREE.RepeatWrapping;
  const wains = (len, x, z, ry) => { const t = ptex.clone(); t.needsUpdate = true; t.repeat.set(len / 1.6, 1); const m = new THREE.Mesh(new THREE.PlaneGeometry(len, ph), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }));
    m.position.set(x, ph / 2, z); m.rotation.y = ry; s.add(m); const cap = new THREE.Mesh(new THREE.BoxGeometry(len, 0.05, 0.06), stdM(shade(pc, 1.1))); cap.position.set(x, ph, z); cap.rotation.y = ry; s.add(cap); };
  wains(w, 0, -d / 2 + 0.03, 0); wains(d, -w / 2 + 0.03, 0, Math.PI / 2); wains(d, w / 2 - 0.03, 0, -Math.PI / 2);
  const crown = stdM('#e8dcc0', { roughness: 0.5 });
  for (const [len, x, z, ry] of [[w, 0, -d / 2 + 0.06, 0], [d, -w / 2 + 0.06, 0, Math.PI / 2], [d, w / 2 - 0.06, 0, Math.PI / 2]]) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(len, 0.18, 0.12), crown); c.position.set(x, h - 0.09, z); c.rotation.y = ry; s.add(c); }
  const pxs = R0.windows ? [-w / 2 + 0.4, -w / 6, w / 6, w / 2 - 0.4] : [0, 1, 2, 3, 4].map(i => -w / 2 + 0.4 + i * (w - 0.8) / 4);   // between the windows
  if (pilasters) for (const x of pxs) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.28, h - 0.2, 0.08), stdM(shade(wall, 1.15), { roughness: 0.6 })); p.position.set(x, (h - 0.2) / 2, -d / 2 + 0.06); s.add(p);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 0.14), crown); cap.position.set(x, h - 0.32, -d / 2 + 0.08); s.add(cap); }
  if (R0.windows) {
    // glazing bars over the existing bright window planes, and light pouring in
    const xs = [-w / 3, 0, w / 3];
    const gb = canvasTex(128, 256, (c, W, H) => { const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, windowCol); c.fillStyle = gr; c.fillRect(0, 0, W, H);
      c.fillStyle = '#5a4630'; for (let i = 0; i <= 3; i++) c.fillRect(i * W / 3 - 3, 0, 6, H); for (let j = 0; j <= 5; j++) c.fillRect(0, j * H / 5 - 3, W, 6); });
    s.traverse(o => { if (o.isMesh && o.material?.isMeshBasicMaterial && o.geometry?.parameters?.width === 1.2 && o.geometry?.parameters?.height === 2.2) { o.material = new THREE.MeshBasicMaterial({ map: gb, color: '#ffffff' }); } });
    if (shafts) for (const x of xs) { const from = new THREE.Vector3(x, 2.4, -d / 2 + 0.1), to = new THREE.Vector3(x + 0.8, 0, -d / 2 + 3.2); s.add(lightShaft(from, to, 1.2)); }
    if (shafts) motes(s, [-w / 2 + 1, 0.3, -d / 2 + 0.3, w / 2 - 1, 2.6, -d / 2 + 3.2], 140);
  }
  for (let i = 0; i < chandeliers; i++) { const c = chandelier(); c.position.set(chandeliers > 1 ? (i - (chandeliers - 1) / 2) * w / chandeliers : 0, h - 1.5, -0.6); s.add(c); }
  for (let i = 0; i < paintings; i++) { const sd = i % 2 ? 1 : -1; const p = painting(1.1, 0.85, { seed: i + 3, kind: i % 2 ? 'portrait' : 'landscape' }); p.position.set(sd * (w / 2 - 0.07), ph + 1.15, -d / 4 + Math.floor(i / 2) * 2.2); p.rotation.y = -sd * Math.PI / 2; s.add(p); }
  if (rugOpt) { const g = rug(...(rugOpt.size || [w * 0.5, d * 0.45]), rugOpt); g.position.set(rugOpt.x || 0, 0.006, rugOpt.z || 0); s.add(g); }
  if (warm) { s.userData.hemi.color.set('#ffe6c4'); }
  return s;
}

// Per-light finishing presets: sky clouds/stars, rim light and grade.
const LIGHTS = {
  day: { clouds: 0.5, sunCol: '#fff3dc', look: {} },
  golden: { clouds: 0.45, sunCol: '#ffd9a0', look: { warm: 0.06, cool: 0.03, rimColor: '#ffd9a8', rim: 0.4 } },
  sunrise: { clouds: 0.5, sunCol: '#ffd2a8', look: { warm: 0.05, rimColor: '#ffd2b0', rim: 0.38 } },
  dusk: { clouds: 0.55, sunCol: '#ffb070', look: { warm: 0.07, cool: 0.06, rimColor: '#ffb888', rim: 0.42, bloom: 0.36 } },
  overcast: { clouds: 0.95, sunCol: '#f0eee8', sun: 0.3, look: { sat: 1.05 } },
  night: { clouds: 0.15, sunCol: '#b8c8ff', sun: 0.4, stars: 1, cloudCol: '#56607a', look: { cool: 0.08, warm: 0.05, rimColor: '#9fb4ff', rim: 0.22, bloom: 0.5, bloomT: 0.85, sat: 1.06 } },
  snow: { clouds: 0.75, sunCol: '#f4f6ff', sun: 0.5, cloudCol: '#f0f2f6', look: { cool: 0.06, sat: 1.08, rim: 0.25 } },
  alpine: { clouds: 0.3, sunCol: '#fff4e0', sun: 1.0, cloudCol: '#ffffff', look: { cool: 0.05, sat: 1.12, rim: 0.32 } },   // clear high-altitude summer air
  blizzard: { clouds: 0.95, sunCol: '#e8ecf4', sun: 0.2, cloudCol: '#dfe3ea', look: { cool: 0.07, sat: 1.05, rim: 0.2 } },
  fire: { clouds: 0.3, sunCol: '#ff9a50', look: { warm: 0.08, bloom: 0.5, bloomT: 0.85 } },
};
function kindOf(s) {
  const gm = s.userData.ground; if (!gm) return null;
  const c = gm.geometry.attributes.color, avg = new THREE.Color(0, 0, 0), t = new THREE.Color();
  for (let i = 0; i < c.count; i += 97) { t.setRGB(c.getX(i), c.getY(i), c.getZ(i)); avg.add(t); }
  avg.multiplyScalar(97 / c.count); const hsl = avg.getHSL({});
  if (hsl.l > 0.7) return 'snow';
  if (hsl.h > 0.16 && hsl.h < 0.42 && hsl.s > 0.15) return 'grass';
  return 'dirt';
}
// Outdoor finish: ground detail (+ grass), painted sky, grade and rim for the light.
export function outdoor(s, light = 'day', { kind = null, grass: gOpt = {}, noGrass = false, look = {} } = {}) {
  const L = LIGHTS[light] || LIGHTS.day, k = kind || kindOf(s);
  if (k) groundDetail(s, k, k === 'cobble' || k === 'flag' ? { tile: 2.2, boost: 1.12 } : {});
  if (k === 'grass' && !noGrass) grass(s, { ...gOpt });
  if (k === 'dirt' && !noGrass) grass(s, { n: 1800, flowers: 0.0, h: 0.08, ...gOpt });
  paintedSky(s, { clouds: L.clouds, sunCol: L.sunCol, sun: L.sun ?? 1, stars: L.stars || 0, cloudCol: L.cloudCol });
  s.userData.look = { ...L.look, ...look };
  return s;
}
// Tall windows in a side wall (x = side * w/2) with glazing, drapes, and sunlight slanting onto the floor.
export function sideWindows(s, { side = -1, zs = [-2.4, 1.2], wy = 2.6, ww = 1.3, wh = 3.0, sun = '#ffe6b8', shafts = true, drape = '#7a1424' } = {}) {
  const { w } = s.userData.room, x = side * (w / 2 - 0.02);
  const gb = canvasTex(128, 300, (c, W, H) => { const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#fffaf0'); gr.addColorStop(1, '#ffe2b0'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(160,200,230,0.35)'; c.fillRect(0, 0, W, H * 0.45);
    c.fillStyle = '#e8dcc0'; for (let i = 0; i <= 3; i++) c.fillRect(i * W / 3 - 3, 0, 6, H); for (let j = 0; j <= 6; j++) c.fillRect(0, j * H / 6 - 3, W, 6); });
  for (const z of zs) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), new THREE.MeshBasicMaterial({ map: gb })); win.position.set(x, wy, z); win.rotation.y = -side * Math.PI / 2; s.add(win);
    const arch = new THREE.Mesh(new THREE.CircleGeometry(ww / 2, 20, 0, Math.PI), new THREE.MeshBasicMaterial({ color: '#fff4dc' })); arch.position.set(x, wy + wh / 2, z); arch.rotation.y = -side * Math.PI / 2; s.add(arch);
    const fr = stdM('#e8dcc0', { roughness: 0.5 });
    for (const [dz, dy, sw, sh] of [[0, -wh / 2 - 0.06, ww + 0.3, 0.12], [-(ww / 2 + 0.06), 0, 0.12, wh], [ww / 2 + 0.06, 0, 0.12, wh]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, sh, sw), fr); b.position.set(x - side * 0.04, wy + dy, z + dz); s.add(b); }
    for (const k of [-1, 1]) { const c = curtain(0.7, wh + 0.9, drape); c.position.set(x - side * 0.1, wy + 0.3, z + k * (ww / 2 + 0.3)); c.rotation.y = -side * Math.PI / 2; s.add(c); }
    if (shafts) { const from = new THREE.Vector3(x, wy + 0.4, z), to = new THREE.Vector3(x - side * 4.2, 0, z + 1.6); s.add(lightShaft(from, to, 1.3, { k: 0.2, color: sun }));
      const pool = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3.0), new THREE.MeshBasicMaterial({ color: sun, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }));
      pool.rotation.x = -Math.PI / 2; pool.rotation.z = side * 0.35; pool.position.set(x - side * 3.4, 0.012, z + 1.3); s.add(pool); }
  }
  const dl = s.userData.sun; dl.position.set(x * 3, 9, (zs[0] + zs[zs.length - 1]) / 2 + 6); dl.target.position.set(0, 0, 0); dl.color.set(sun); dl.intensity = 1.9;
  if (shafts) motes(s, [x - side * 0.4, 0.4, zs[0] - 1, x - side * 4.4, wy + 1.4, zs[zs.length - 1] + 2], 180, 11);
  return s;
}
// A window onto the sea at night (Kingston harbour): stars, moon and its path on the water, framed and draped.
export function nightWindow(w = 1.5, h = 1.6, drape = '#5a1a1a') {
  const g = new THREE.Group();
  const tex = canvasTex(256, Math.round(256 * h / w), (c, W, H) => {
    const sky = c.createLinearGradient(0, 0, 0, H * 0.62); sky.addColorStop(0, '#0a1430'); sky.addColorStop(1, '#2a3f6a'); c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.62);
    const r = R(41); for (let i = 0; i < 70; i++) { c.fillStyle = `rgba(255,255,240,${0.4 + r() * 0.6})`; c.fillRect(r() * W, r() * H * 0.55, 1.5, 1.5); }
    c.fillStyle = '#f6f0d8'; c.beginPath(); c.arc(W * 0.66, H * 0.2, W * 0.07, 0, 7); c.fill();
    const sea = c.createLinearGradient(0, H * 0.62, 0, H); sea.addColorStop(0, '#1a2f52'); sea.addColorStop(1, '#0a1428'); c.fillStyle = sea; c.fillRect(0, H * 0.62, W, H * 0.38);
    for (let i = 0; i < 26; i++) { c.fillStyle = `rgba(255,245,210,${0.5 - i * 0.015})`; c.fillRect(W * 0.66 - (6 + i * 0.6) + (r() - 0.5) * 6, H * 0.63 + i * H * 0.014, 12 + i * 1.2, 2); }
    c.fillStyle = '#5a4630'; for (let i = 0; i <= 2; i++) c.fillRect(i * W / 2 - 3, 0, 6, H); for (let j = 0; j <= 3; j++) c.fillRect(0, j * H / 3 - 3, W, 6);
  });
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex })); g.add(pane);
  const fr = stdM('#4a3424', { roughness: 0.6 });
  for (const [x, y, ww, hh] of [[0, h / 2 + 0.05, w + 0.2, 0.1], [0, -h / 2 - 0.05, w + 0.3, 0.1], [w / 2 + 0.05, 0, 0.1, h], [-w / 2 - 0.05, 0, 0.1, h]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(ww, hh, 0.08), fr); b.position.set(x, y, 0.03); g.add(b); }
  for (const sd of [-1, 1]) { const c = curtain(0.55, h + 0.7, drape); c.position.set(sd * (w / 2 + 0.25), 0.1, 0.1); g.add(c); }
  const moonlight = new THREE.PointLight('#9fb4ff', 1.6, 6, 1.4); moonlight.position.set(0, 0, 0.8); g.add(moonlight);
  return g;
}
