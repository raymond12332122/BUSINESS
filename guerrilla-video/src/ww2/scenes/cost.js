import * as THREE from 'three';
import * as P from '../../lib/props.js';
import { stage } from '../../lib/stage.js';
import { camPath, ss } from '../../lib/util.js';
import * as W from '../kit.js';

// A quiet memorial: no characters, just candles in the dark.
export function build(ctx) {
  const L = ctx.L;
  const scene = stage({ skyTop: '#05070c', skyHor: '#141823', groundA: '#1b1d22', groundB: '#15171b', fog: ['#0c0e13', 6, 30], sunPos: [2, 10, 6], sun: 0.15, hemi: 0.25, hemiSky: '#3a4258', shadow: 10, seed: 341 });
  const candles = [];
  for (let row = 0; row < 14; row++) for (let i = 0; i < 18; i++) {
    const c = W.candle(row * 18 + i); c.position.set(-8.5 + i + (row % 2) * 0.5, 0, -row * 1.1); scene.add(c); candles.push(c);
  }
  const glow = new THREE.PointLight('#ffb35a', 6, 18, 1.6); glow.position.set(0, 1.5, -4); scene.add(glow);
  const sfx = [];

  function update(t) {
    candles.forEach(c => c.flicker(t));
    glow.intensity = 6 + 0.6 * Math.sin(t * 9) * Math.sin(t * 5.3);
    camPath(ctx.camera, [{ t: 0, p: [0, 1.4, 6], l: [0, 0.3, -4], fov: 40 }, { t: ctx.dur, p: [0, 1.0, 3.5], l: [0, 0.3, -5], fov: 40 }], t);
    const k = ss(1.0, 2.0, t) * (1 - ss(ctx.dur - 1.0, ctx.dur - 0.2, t));
    const k2 = ss(6.0, 7.0, t) * (1 - ss(ctx.dur - 1.0, ctx.dur - 0.2, t));
    return `<div style="position:absolute;left:0;right:0;top:150px;text-align:center;opacity:${k}">
      <div style="font:900 72px/1.1 'Inter Display',Inter;color:#f3ead8">70–85 millones de muertos</div>
      <div style="font:600 30px Inter;color:#c9c2b3;margin-top:12px">en todo el mundo, la mayoría civiles</div></div>
      <div style="position:absolute;left:0;right:0;top:330px;text-align:center;opacity:${k2}">
      <div style="font:800 52px/1.1 'Inter Display',Inter;color:#f3ead8">6 millones de judíos</div>
      <div style="font:600 30px Inter;color:#c9c2b3;margin-top:10px">asesinados en el Holocausto</div></div>`;
  }
  return { scene, update, sfx, quiet: true };
}
