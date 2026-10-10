import * as THREE from 'three';
import * as C from '../lib/chars.js';
import * as P from '../lib/props.js';
import * as G from '../lib/gear.js';
import * as F from '../lib/fx.js';
import { stage, aimSun } from '../lib/stage.js';
import { camPath, ss, clamp, along, yawTo, track } from '../lib/util.js';
import { cast, chapter, quote, label, partTimes, badge } from '../lib/kit.js';

export function build(ctx) {
  const L = ctx.L;
  const scene = stage({ skyTop: '#5f8fd4', skyHor: '#d9e8ee', groundA: '#6f9e4c', groundB: '#5a8a3e', fog: ['#cfdccf', 30, 120],
    sunPos: [-7, 12, 6], sun: 2.5, shadow: 16, seed: 31 });
  const env = new THREE.Group(); scene.add(env);
  const road = P.strip([[-60, 1.5], [-30, 0.6], [-10, 0], [10, 0], [30, -0.8], [60, -1.6]], 2.6, '#a58e6a', 0.02); env.add(road);
  P.scatter(env, (r, i) => (i % 4 ? P.pine(1.1 + r() * 0.8, '#2e6838', i) : P.roundTree(1.2 + r() * 0.6, '#4a8a36', i)), 150, [-45, -40, 45, -6.5], 41, [[0, -6.5, 5.5]]);
  P.scatter(env, (r, i) => (i % 3 ? P.pine(1.1 + r() * 0.8, '#2e6838', i) : P.roundTree(1.2 + r() * 0.6, '#4a8a36', i)), 110, [-45, 11, 45, 35], 42);
  P.scatter(env, (r, i) => P.bush(0.8 + r() * 0.5, '#3f7d34', i + 50), 26, [-40, 3, 40, 10], 44, [[4.5, 2.6, 2.2], [4.8, 6.8, 2.6], [8, 9, 2.6], [9, 3.5, 2.2], [-6, 5, 2]]);
  P.scatter(env, (r, i) => P.bush(0.8 + r() * 0.5, '#3f7d34', i), 40, [-40, -6, 40, -2.8], 43, [[0, -3.9, 3]]);
  // ambush cover: a line of bushes on the ridge
  for (let i = 0; i < 6; i++) { const b = P.bush(1.05, '#3c7a32', 90 + i); b.position.set(-2.6 + i * 1.05, 0, -3.7 + (i % 2) * 0.15); env.add(b); }

  // convoy along +X
  const truck1 = P.truck('#5a6350', '#6d7858'), truck2 = P.truck('#5a6350', '#6d7858');
  for (const v of [truck1, truck2]) { v.rotation.y = Math.PI / 2; scene.add(v); }
  for (const v of [truck1, truck2]) for (let i = 0; i < 3; i++) { const c = P.crate(0.32, '#8a6a3f'); c.position.set(-0.1 + (i % 2) * 0.3, 0.78, -0.2 - i * 0.45); v.body.add(c); }
  const esc = [cast(scene, 'mcqueen', G.army, 0, 0, Math.PI / 2), cast(scene, 'daiwa', G.army, 0, 0, Math.PI / 2), cast(scene, 'suzuka', G.army, 0, 0, Math.PI / 2)];
  const escOff = [[3.4, 0.3], [0.2, 1.45], [-5.2, 1.45]]; // relative to truck1
  const g = [cast(scene, 'oguri', G.guerrilla, -1.6, -4.7), cast(scene, 'tamamo', G.guerrilla, 0.1, -4.9), cast(scene, 'cafe', G.guerrilla, 1.7, -4.6)];
  g.forEach(c => { c.root.userData.x0 = c.root.position.x; c.root.userData.z0 = c.root.position.z; });
  // reinforcements
  const apc = P.apc('#59614a'); apc.rotation.y = -Math.PI / 2; scene.add(apc);
  const reinf = [cast(scene, 'helios', G.army, 0, 0, 0)];
  const qs = reinf.map(() => { const b = F.bubble('?'); scene.add(b); return b; });
  const sig = F.bubble('✊', { font: 140 }); scene.add(sig);

  const tHit = L[1].t1 + 1.3, tFire = tHit - 0.7, tStop = tFire + 1.4, tRun = tStop + 0.5;
  const tB1 = tHit, tB2 = tHit + 0.75;
  const tArr = L[2].t0 + 0.4, tOut = tArr + 2.4;
  const truckX = t => 1.5 * (Math.min(t, tHit) - tHit) - 0.4; // truck1 x position; stops at the ambush point
  const ex1 = new F.Explosion(scene, [0, 0.4, 0], tB1, 1.3, 7, { fire: 1 });
  const ex2 = new F.Explosion(scene, [0, 0.4, 0], tB2, 1.0, 8, { fire: 1 });
  const muz = g.map(c => new F.Muzzle(c.gun, 7).fire(tFire + 0.05 * g.indexOf(c), tStop - 0.2));
  const tr = g.map(() => new F.LiveTracer(scene));
  const dust = new F.Dust(scene, 9, 16);
  const sfx = [{ t: 0.0, type: 'engine', dur: tHit + 0.2, vol: 0.55 }, { t: 0.3, type: 'sting' }, { t: tFire - 0.9, type: 'click' },
    ...muz.flatMap((m, i) => m.shots().map(t => ({ t, type: 'shot', vol: 0.55 - i * 0.08 }))), { t: tB1, type: 'bigboom' }, { t: tB2, type: 'boom' },
    { t: tRun, type: 'whoosh' }, { t: tArr - 1.5, type: 'engine', dur: 3.2, vol: 0.7 }, { t: tOut + 0.6, type: 'pop' }, { t: L[3].t0, type: 'sting2' }];

  function update(t) {
    const x1 = truckX(t), x2 = x1 - 5.2;
    truck1.position.set(x1, 0, 0.2); truck2.position.set(x2, 0, 0.2);
    // explosion jolts
    const j1 = t > tB1 ? Math.max(0, Math.sin(clamp((t - tB1) / 0.6) * Math.PI)) : 0;
    truck1.body.position.y = j1 * 0.5; truck1.body.rotation.z = j1 * 0.25; truck1.body.rotation.x = j1 * 0.1;
    const j2 = t > tB2 ? Math.max(0, Math.sin(clamp((t - tB2) / 0.5) * Math.PI)) : 0;
    truck2.body.position.y = j2 * 0.3; truck2.body.rotation.z = -j2 * 0.15;
    const moving = t < tHit;
    for (const v of [truck1, truck2]) { if (moving) v.body.position.y += 0.01 * Math.sin(t * 28); v.wheels.forEach(w => w.rotation.x = moving ? t * 6 : tHit * 6); }
    for (const v of [truck1, truck2]) v.body.traverse(o => { if (o.material && o.material.color && t > tB1 + 0.4 && v === truck1) o.material = darken(o.material); });
    ex1.g.position.set(x1 + 0.3, 0.4, 0.2); ex2.g.position.set(x2 + 0.6, 0.4, 0.2);
    ex1.update(t); ex2.update(t);

    esc.forEach((c, i) => {
      const [dx, dz] = escOff[i];
      if (t < tHit) { c.root.position.set(x1 + dx, 0, dz); c.root.rotation.y = Math.PI / 2; c.apply({ ...C.walkArmed(t, 0.75, i), gun: 'low' }); c.setFace(C.blinkEye(t, c.seed), 'neutral'); }
      else {
        const k = clamp((t - tHit) / 0.35), push = (1 - Math.exp(-(t - tHit) * 5)) * (i === 0 ? 1.2 : 1.6);
        c.root.position.set(tHit * 0 + truckX(tHit) + dx + (i === 0 ? push : 0), 0, dz + (i === 0 ? 0 : push));
        c.root.rotation.y = Math.PI / 2 + (i === 0 ? 0 : -Math.PI / 2);
        c.apply({ ...C.blend(C.walk(t), C.knocked(t - tHit, i), k), gun: 'none' }); c.setFace('dizzy', 'wavy');
      }
    });

    // guerrillas
    g.forEach((c, i) => {
      const tgt = [truck1.position.x + (i - 1) * 0.6, truck1.position.z];
      if (t < tFire - 0.4) {
        c.root.position.set(c.root.userData.x0 ??= c.root.position.x, 0, c.root.userData.z0 ??= c.root.position.z);
        c.root.rotation.y = yawTo([c.root.position.x, c.root.position.z], [-4, 0]) * 0.6;
        const p = { ...C.crouch(t, c.seed, 0.9), gun: 'low' };
        if (i === 0 && t > L[1].t0 + 3.5) p.head = [-10, -30 + 15 * Math.sin(t * 0.7), 0];
        if (i === 0 && t > tFire - 1.4) { p.armR = [-20, 0, -20]; p.elbR = [0, 0, -90]; p.ikR = null; p.gun = 'none'; }
        c.apply(p); c.setFace(C.blinkEye(t, c.seed, 'flat') === 'blink' ? 'blink' : (i === 1 ? 'open' : 'flat'), 'neutral');
      } else if (t < tRun) {
        c.root.rotation.y = yawTo([c.root.position.x, c.root.position.z], tgt);
        const rec = muz[i].recoil(t);
        c.apply({ ...C.blend(C.crouch(t, c.seed, 0.9), C.aim(t, rec), ss(tFire - 0.4, tFire - 0.1, t)), gun: 'aim' });
        c.setFace('squint', t < tStop ? 'shout' : 'grin');
      } else {
        const d = Math.max(0, (t - tRun - i * 0.12) * 3.6);
        const x0 = c.root.userData.x0, z0 = c.root.userData.z0;
        const pos = along([[x0, z0], [x0 + (i - 1) * 0.8, z0 - 3.5], [x0 + (i - 1) * 2, -16]], d);
        c.root.position.set(pos.x, 0, pos.z); c.root.rotation.y = pos.yaw;
        c.apply({ ...C.runArmed(t, 1.15, i), gun: 'port' }); c.setFace('squint', 'grin');
        c.root.visible = d < 14;
      }
      muz[i].update(t);
      // tracers
      const shots = muz[i].shots(); let last = null; for (const s of shots) if (s <= t) last = s;
      if (last !== null && t - last < 0.16 && t < tRun) tr[i].set(F.muzzleWorld(c), new THREE.Vector3(tgt[0] + Math.sin(last * 13) * 0.5, 0.6 + Math.sin(last * 7) * 0.3, 0.2), (t - last) / 0.16);
      else tr[i].set(new THREE.Vector3(), new THREE.Vector3(), -1);
    });
    sig.position.set(g[0].root.position.x, 0, g[0].root.position.z); F.popSprite(sig, t, tFire - 1.4, tFire - 0.3, 0.36, 1.25);

    // reinforcements roll in to an empty forest
    const ax = track([[tArr - 2.2, 22], [tArr, 4.5]], t, x => 1 - Math.pow(1 - x, 2));
    apc.position.set(ax, 0, -0.3); apc.visible = t > tArr - 2.3;
    apc.wheels.forEach(w => w.rotation.x = -ax * 4);
    reinf.forEach((c, i) => {
      const on = t > tArr + 0.4 + i * 0.25; c.root.visible = on;
      c.root.position.set(ax + (i ? -0.3 : 0.9), 0, -1.6 - ss(tArr + 0.4, tArr + 1.2, t) * (1.2 + i * 0.6));
      c.root.rotation.y = Math.PI + 0.3 * (i ? 1 : -1);
      c.apply({ ...(t > tOut - 0.8 ? C.lookAround(t, i * 2) : C.idle(t, c.seed)), gun: 'low' });
      c.setFace(t > tOut ? 'shock' : 'open', t > tOut ? 'small' : 'frown');
    });
    qs.forEach((b, i) => { const r = reinf[i].root.position; b.position.set(r.x, 0, r.z); F.popSprite(b, t, tOut + 0.6 + i * 0.3, ctx.dur, 0.42, 1.55); });
    dust.update(t);

    camPath(ctx.camera, [
      { t: 0, p: [10, 10, 17], l: [-4, 0, -1.5], fov: 38 },
      { t: L[1].t0 - 0.2, p: [6, 6.5, 12], l: [-2, 0.4, -2.5], fov: 36 },
      { t: L[1].t0 + 0.3, p: [-0.6, 1.7, -8.9], l: [0, 0.4, -1.2], fov: 36 },
      { t: L[1].t0 + 3.4, p: [0.5, 1.6, -8.4], l: [0, 0.4, -1.2], fov: 34 },
      { t: L[1].t0 + 3.9, p: [4.5, 0.8, 2.6], l: [-6, 0.8, 0], fov: 34 },
      { t: tFire - 1.2, p: [3.8, 0.9, 2.9], l: [-3, 0.8, 0], fov: 34 },
      { t: tFire - 0.6, p: [4.8, 2.6, 6.8], l: [-0.4, 0.6, -2], fov: 40 },
      { t: tRun + 0.6, p: [4.2, 2.8, 7.4], l: [0, 0.6, -2.5], fov: 40 },
      { t: tArr - 1.6, p: [8, 3.5, 9], l: [2.5, 0.6, -1.5], fov: 40 },
      { t: L[3].t0 - 0.2, p: [7, 2.2, 6.5], l: [3, 0.7, -1.6], fov: 38 },
      { t: L[3].t0 + 0.2, p: [9.5, 1.5, 3.6], l: [-3, 1.1, 0], fov: 40 },
      { t: ctx.dur, p: [8.5, 1.7, 4.4], l: [-3, 1.2, 0], fov: 38 },
    ], t, t > tB1 && t < tB1 + 0.7 ? 0.08 * (1 - (t - tB1) / 0.7) : 0);
    aimSun(scene, ctx.camera.position.x * 0.5, -1);

    // overlay
    let html = chapter(t, 1, 'Hit and run', 0.3, L[1].t0 + 1.2);
    html += badge(t, 'Target', 'Supply convoy', 'Lightly guarded, easy to predict', L[1].t0 + 3.5, tFire - 0.6);
    html += badge(t, '⏱ Time on target', 'Under 1 minute', 'Then gone before help arrives', tOut + 0.3, L[3].t0 - 0.2);
    const parts = ['Mao Zedong summed it up:', 'The enemy advances, we retreat.', 'The enemy camps, we harass.', 'The enemy tires, we attack.', 'The enemy retreats, we pursue.'];
    const pt = partTimes(L[3], parts);
    html += quote(t, parts.slice(1).map((p, i) => [p, pt[i + 1] - 0.1]), 'Mao Zedong, 1930s guerrilla doctrine', L[3].t0 + 0.4, ctx.dur, 34);
    return html;
  }
  const dark = new Map();
  function darken(m) { if (dark.has(m)) return dark.get(m); if ([...dark.values()].includes(m)) return m; const d = m.clone(); d.color = m.color.clone().multiplyScalar(0.35); dark.set(m, d); return d; }
  return { scene, update, sfx, hideCaptions: t => t > L[3].t0 + 0.4 };
}
