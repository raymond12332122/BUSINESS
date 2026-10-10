import * as THREE from 'three';
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ss = (a, b, t) => { const x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x); };
export const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
export const easeIn = x => Math.pow(clamp(x), 3);
export const easeInOut = x => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const pulse = (t, a, b) => (t >= a && t < b ? 1 : 0);

// Keyframed value track: keys [[t, value], ...]; value = number or array. Smooth (ease in/out) between keys.
export function track(keys, t, ease = easeInOut) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, a] = keys[i - 1], [t1, b] = keys[i];
      const w = ease((t - t0) / (t1 - t0));
      return Array.isArray(a) ? a.map((v, k) => lerp(v, b[k], w)) : lerp(a, b, w);
    }
  }
  return keys[keys.length - 1][1];
}

// Camera path: keys [{t, p:[x,y,z], l:[x,y,z], fov}]
export function camPath(cam, keys, t, shake = 0) {
  const p = track(keys.map(k => [k.t, k.p]), t), l = track(keys.map(k => [k.t, k.l]), t);
  const fov = track(keys.map(k => [k.t, k.fov || 35]), t);
  cam.position.set(...p);
  if (shake) cam.position.add(new THREE.Vector3(Math.sin(t * 61) * shake, Math.sin(t * 47 + 1) * shake, Math.sin(t * 53 + 2) * shake));
  cam.lookAt(...l);
  if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
}

// Move along a polyline of [x,z] points at constant speed; returns {x,z,yaw,moving}
export function along(points, dist) {
  let rem = dist;
  for (let i = 1; i < points.length; i++) {
    const [ax, az] = points[i - 1], [bx, bz] = points[i], L = Math.hypot(bx - ax, bz - az);
    if (rem <= L || i === points.length - 1) {
      const w = clamp(rem / L);
      return { x: lerp(ax, bx, w), z: lerp(az, bz, w), yaw: Math.atan2(bx - ax, bz - az), done: rem >= L && i === points.length - 1 };
    }
    rem -= L;
  }
}
export function yawTo(from, to) { return Math.atan2(to[0] - from[0], to[1] - from[1]); }
