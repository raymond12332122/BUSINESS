// Finishing pass for the vertical short: the scene is drawn at half resolution (hard 2x2 pixels at 720x1280),
// glowing lights bloom, then a late-90s console pass quantises it to a reduced palette with 4x4 ordered dithering,
// adds per-pixel grain, slight colour fringing at the edges, a cold grade and a heavy vignette.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { LOOK } from '../amer/look.js';

const TIME = { value: 0 };
export function tick(T) { TIME.value = T; }

const PSX = {
  uniforms: { tDiffuse: { value: null }, res: { value: new THREE.Vector2(360, 640) }, time: TIME, levels: { value: 22 },
    vign: { value: 0.62 }, grain: { value: 0.045 }, fringe: { value: 0.9 }, sat: { value: 0.96 }, con: { value: 0.12 },
    tint: { value: new THREE.Color('#d9e2ff') }, lift: { value: 0.012 }, flash: { value: 0 }, glitch: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform vec2 res; uniform float time, levels, vign, grain, fringe, sat, con, lift, flash, glitch; uniform vec3 tint;
    varying vec2 vUv;
    float bayer(vec2 p) {   // 4x4 ordered-dither threshold in [0, 1)
      vec2 q = mod(p, 4.0); float x = q.x, y = q.y;
      float b2 = mod(x, 2.0) * 2.0 + mod(y, 2.0) * 3.0 - 4.0 * mod(x, 2.0) * mod(y, 2.0);   // 0 2 / 3 1
      vec2 h = floor(q / 2.0); float b2h = h.x * 2.0 + h.y * 3.0 - 4.0 * h.x * h.y;
      return (b2 * 4.0 + b2h + 0.5) / 16.0;
    }
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec2 px = floor(vUv * res);
      if (glitch > 0.0) {   // torn bands: whole rows of pixels slide sideways for a frame or two
        float band = floor(px.y / 7.0), tt = floor(time * 30.0), r = hash(vec2(band, tt));
        if (r < glitch * 0.5) px.x += floor((hash(vec2(band + 3.0, tt)) - 0.5) * 60.0 * glitch);
      }
      vec2 uv = (px + 0.5) / res, d = uv - 0.5;
      float e = dot(d, d);
      vec2 off = vec2((fringe + 9.0 * glitch) * (0.35 + 2.4 * e) / res.x, 0.0);
      vec3 c = vec3(texture2D(tDiffuse, uv + off).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - off).b);
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(vec3(l), c, sat) * tint;
      c = (c - 0.5) * (1.0 + con) + 0.5 + lift;
      c *= 1.0 - vign * smoothstep(0.18, 0.62, length(d * vec2(1.0, 0.62)));
      c += (hash(px + floor(time * 24.0) * 37.0) - 0.5) * grain;
      c = mix(c, vec3(1.0), flash);
      c = floor(clamp(c, 0.0, 1.0) * levels + bayer(px)) / levels;
      gl_FragColor = vec4(c, 1.0);
    }`,
};

export function makePost(renderer, W, H) {
  const pr = renderer.getPixelRatio() * 0.5, w = Math.round(W * pr), h = Math.round(H * pr);
  const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt); composer.setPixelRatio(pr); composer.setSize(W, H);
  const rp = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
  const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.7, 0.6, 0.9);
  const psx = new ShaderPass(PSX); psx.uniforms.res.value.set(w, h);
  composer.addPass(rp); composer.addPass(bloom); composer.addPass(new OutputPass()); composer.addPass(psx);
  return {
    composer, bloom, psx,
    render(scene, camera) {
      const L = scene.userData.look || {};
      rp.scene = scene; rp.camera = camera;
      bloom.enabled = L.bloom !== 0; bloom.strength = L.bloom ?? 0.7; bloom.threshold = L.bloomT ?? 0.9; bloom.radius = L.bloomR ?? 0.6;
      const u = psx.uniforms; u.levels.value = L.levels ?? 22; u.vign.value = L.vign ?? 0.62; u.grain.value = L.grain ?? 0.045;
      u.sat.value = L.sat ?? 0.96; u.con.value = L.con ?? 0.12; u.tint.value.set(L.tint || '#d9e2ff'); u.lift.value = L.lift ?? 0.012;
      u.flash.value = L.flash ?? 0; u.glitch.value = L.glitch ?? 0;
      LOOK.rimK.value = L.rim ?? 0.5; LOOK.rimColor.value.set(L.rimColor || '#9fb8ff'); LOOK.inkW.value = L.ink ?? 0.8;
      LOOK.shadeTint.value.set(L.shadeTint || '#7d86b8'); LOOK.shadeLo.value = L.shadeLo ?? 0.5;
      composer.render();
    },
  };
}
