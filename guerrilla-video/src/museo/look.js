// Finishing pass for "El robo del siglo": the anime cast shading of amer/look.js (cel ramp, rim, ink) under a heist-film
// grade. HDR clamp (so a gold glint never blooms into a blob), bloom on lamps and flashlights, a cold-shadow / warm-light
// split, gentle halation, 35 mm grain, slight lens fringing and a vignette. Per scene in scene.userData.look:
// bloom, bloomT, clamp, sat, con, vign, warm, cool, lift, grain, fringe, flash, tint, rim, rimColor, ink, shadeTint.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { Pass } from 'three/addons/postprocessing/Pass.js';
import { LOOK, tick as amerTick } from '../amer/look.js';

const TIME = { value: 0 };
export function tick(T) { TIME.value = T; amerTick(T); }   // amer's clock drives the drifting dust motes

// Several (scene, camera) panels side by side (split-screen shots).
class SplitPass extends Pass {
  constructor() { super(); this.views = null; this.needsSwap = false; }
  render(renderer, writeBuffer, readBuffer) {
    const W = readBuffer.width, H = readBuffer.height;
    for (const v of this.views) {
      const x = Math.round(v.x * W), w = Math.round(v.w * W);
      readBuffer.viewport.set(x, 0, w, H); readBuffer.scissor.set(x, 0, w, H); readBuffer.scissorTest = true;
      renderer.setRenderTarget(readBuffer);
      if (v.scene.userData.sky) v.scene.userData.sky.position.copy(v.camera.position);
      renderer.render(v.scene, v.camera);
    }
    readBuffer.viewport.set(0, 0, W, H); readBuffer.scissor.set(0, 0, W, H); readBuffer.scissorTest = false;
    renderer.setRenderTarget(readBuffer);
  }
}
const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const CLAMP = { uniforms: { tDiffuse: { value: null }, cap: { value: 2.4 } }, vertexShader: VS,
  fragmentShader: 'uniform sampler2D tDiffuse; uniform float cap; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv); float m = max(max(c.r, c.g), c.b); gl_FragColor = vec4(m > cap ? c.rgb * (cap / m) : c.rgb, c.a); }' };
const GRADE = {
  uniforms: { tDiffuse: { value: null }, time: TIME, sat: { value: 1.05 }, con: { value: 0.2 }, vign: { value: 0.42 }, warm: { value: 0.05 }, cool: { value: 0.09 },
    lift: { value: 0.01 }, grain: { value: 0.035 }, fringe: { value: 0.8 }, flash: { value: 0 }, tint: { value: new THREE.Color('#ffffff') }, res: { value: new THREE.Vector2(1920, 1080) } },
  vertexShader: VS,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float time, sat, con, vign, warm, cool, lift, grain, fringe, flash; uniform vec3 tint; uniform vec2 res; varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec2 d = vUv - 0.5; float e = dot(d, d);
      vec2 off = d * fringe * 0.006 * (0.4 + 2.0 * e);
      vec3 c = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
      c = mix(c, c * c * (3.0 - 2.0 * c), con);
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c = mix(vec3(l), c, sat) * tint;
      c += (1.0 - l) * cool * vec3(-0.3, 0.06, 0.55) + l * warm * vec3(0.65, 0.25, -0.5);
      c = c * (1.0 - lift) + lift;
      c *= 1.0 - vign * smoothstep(0.32, 0.95, length(d * vec2(res.x / res.y, 1.0)) / 0.95);
      float g = hash(floor(vUv * res / 1.5) + floor(time * 24.0) * 17.0) - 0.5;
      c += g * grain * (0.6 + 0.8 * (1.0 - l));
      c = mix(c, vec3(1.0), flash);
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
    }`,
};
export function makePost(renderer, W, H) {
  const pr = renderer.getPixelRatio(), w = Math.round(W * pr), h = Math.round(H * pr);
  const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt); composer.setPixelRatio(pr); composer.setSize(W, H);
  const rp = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
  const clamp = new ShaderPass(CLAMP), bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.5, 0.55, 1.0), grade = new ShaderPass(GRADE);
  grade.uniforms.res.value.set(w, h);
  composer.addPass(rp); composer.addPass(clamp); composer.addPass(bloom); composer.addPass(new OutputPass()); composer.addPass(grade);
  const split = new SplitPass();
  return {
    composer, bloom, grade,
    render(scene, camera, views = null) {
      if (views) scene = views[0].scene;
      const L = scene.userData.look || {};
      rp.scene = scene; rp.camera = camera; split.views = views; composer.passes[0] = views ? split : rp;
      clamp.uniforms.cap.value = L.clamp ?? 2.4;
      bloom.enabled = L.bloom !== 0; bloom.strength = L.bloom ?? 0.5; bloom.threshold = L.bloomT ?? 1.0; bloom.radius = L.bloomR ?? 0.55;
      const g = grade.uniforms; g.sat.value = L.sat ?? 1.05; g.con.value = L.con ?? 0.2; g.vign.value = L.vign ?? 0.42;
      g.warm.value = L.warm ?? 0.05; g.cool.value = L.cool ?? 0.09; g.lift.value = L.lift ?? 0.01; g.grain.value = L.grain ?? 0.035;
      g.fringe.value = L.fringe ?? 0.8; g.flash.value = L.flash ?? 0; g.tint.value.set(L.tint || '#ffffff');
      LOOK.rimK.value = L.rim ?? 0.32; LOOK.rimColor.value.set(L.rimColor || '#fff2dc'); LOOK.inkW.value = L.ink ?? 1.0;
      LOOK.shadeTint.value.set(L.shadeTint || '#b9a6c8'); LOOK.shadeLo.value = L.shadeLo ?? 0.62;
      composer.render();
    },
  };
}
