// Shot-based camera: each shot has its own set (THREE.Scene), camera move and action.
// Shots only change with hard cuts, so the camera never swoops between unrelated framings.
import * as THREE from 'three';
import { clamp } from '../lib/util.js';

const ease = { inOut: x => x * x * (3 - 2 * x), lin: x => x, out: x => 1 - (1 - x) * (1 - x), in: x => x * x };

// shots: [{ t0, set, p0, l0, p1?, l1?, fov0?, fov1?, ease?, act(t, u) -> html }]; each lasts until the next shot's t0.
export function runShots(inst, ctx, shots, t) {
  ctx.t = t;
  let i = 0; while (i + 1 < shots.length && t >= shots[i + 1].t0) i++;
  const s = shots[i], t1 = shots[i + 1] ? shots[i + 1].t0 : ctx.dur;
  const u = clamp((t - s.t0) / Math.max(0.001, t1 - s.t0)), e = (ease[s.ease || 'inOut'])(u);
  const p1 = s.p1 || s.p0, l1 = s.l1 || s.l0;
  const cam = ctx.camera;
  cam.position.set(...s.p0.map((v, k) => v + (p1[k] - v) * e));
  if (s.shake) { const k = s.shake(t); cam.position.x += Math.sin(t * 61) * k; cam.position.y += Math.sin(t * 47 + 1) * k; }
  cam.lookAt(...s.l0.map((v, k) => v + (l1[k] - v) * e));
  const fov = (s.fov0 || 38) + ((s.fov1 || s.fov0 || 38) - (s.fov0 || 38)) * e;
  if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
  inst.current = s.set;
  if (s.sun) s.sun(t);
  return (s.act ? s.act(t, u, t - s.t0) : '') || '';
}
