// Shot runner for the what-if video: mx/shots runShots plus each set's per-frame tick.
import { runShots, wt } from '../mx/shots.js';
import * as M from '../lib/motion.js';
export { wt };
export function run(inst, ctx, shots, t) { const html = runShots(inst, ctx, shots, t); inst.current?.tick?.(t); return html; }
// Walk a rig from a start point along its facing (yaw) for len world units starting at t0, then stand.
// Returns the pose for time t and moves the root; `after(t)` gives the pose once she has stopped.
export function walkIn(r, t, t0, [x0, z0], yaw, len, { speed = 0.22, after = null, run = 0, seed = 0, acc = 0.7 } = {}) {
  const u = r.unit, tr = M.travel(t, t0, len / u, speed, acc);
  r.root.position.set(x0 + Math.sin(yaw) * tr.D * u, r.root.position.y, z0 + Math.cos(yaw) * tr.D * u); r.root.rotation.y = yaw;
  const g = M.gait(tr.D, { amp: tr.amp, run, seed }), st = after ? after(t) : M.stand(t, seed);
  return tr.moving ? M.mix(st, g, M.clamp(tr.amp * 1.6)) : M.mix(st, g, 0);
}
