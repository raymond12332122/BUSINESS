import * as THREE from 'three';
import * as P from './props.js';

// Scene scaffold with sky, ground, sun + hemisphere light and fog.
export function stage({ skyTop = '#5b8fd8', skyHor = '#d6e7f3', groundA = '#7fae58', groundB = '#5f8f40', fog = null, sunPos = [8, 14, 6],
  sunColor = '#fff1dc', sun = 2.6, hemiSky = '#e1efff', hemiGround = '#56663f', hemi = 1.2, shadow = 14, groundSize = 300, seed = 1, bumps = 0, exposure } = {}) {
  const scene = new THREE.Scene();
  const skyMesh = P.sky(skyTop, skyHor); scene.add(skyMesh);
  if (fog) scene.fog = new THREE.Fog(fog[0], fog[1], fog[2]);
  const hl = new THREE.HemisphereLight(hemiSky, hemiGround, hemi); scene.add(hl);
  const dl = new THREE.DirectionalLight(sunColor, sun); dl.position.set(...sunPos); dl.castShadow = true;
  dl.shadow.mapSize.set(2048, 2048); dl.shadow.bias = -0.0004; dl.shadow.normalBias = 0.02;
  Object.assign(dl.shadow.camera, { left: -shadow, right: shadow, top: shadow, bottom: -shadow, near: 0.5, far: 80 });
  scene.add(dl); scene.add(dl.target);
  if (groundA) scene.add(P.ground(groundSize, groundA, groundB, seed, bumps));
  scene.userData = { sun: dl, hemi: hl, sky: skyMesh };
  return scene;
}
// Keep the shadow frustum centred on the action.
export function aimSun(scene, x, z) {
  const dl = scene.userData.sun, off = dl.userData.off || (dl.userData.off = dl.position.clone());
  dl.position.set(x + off.x, off.y, z + off.z); dl.target.position.set(x, 0, z); dl.target.updateMatrixWorld();
}

// Recolor lights/sky/fog for a sub-set within a scene.
export function mood(scene, { skyTop, skyHor, fog, sunColor, sun, hemiSky, hemiGround, hemi }) {
  const u = scene.userData;
  if (skyTop) u.sky.material.uniforms.top.value.set(skyTop);
  if (skyHor) u.sky.material.uniforms.hor.value.set(skyHor), u.sky.material.uniforms.bot.value.set(skyHor);
  if (fog) { scene.fog = scene.fog || new THREE.Fog(); scene.fog.color.set(fog[0]); scene.fog.near = fog[1]; scene.fog.far = fog[2]; }
  if (sunColor) u.sun.color.set(sunColor); if (sun != null) u.sun.intensity = sun;
  if (hemiSky) u.hemi.color.set(hemiSky); if (hemiGround) u.hemi.groundColor.set(hemiGround); if (hemi != null) u.hemi.intensity = hemi;
}
