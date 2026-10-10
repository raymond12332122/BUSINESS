import * as THREE from 'three';
import * as C from '../lib/chars.js';
import * as P from '../lib/props.js';
import * as G from '../lib/gear.js';
import * as F from '../lib/fx.js';
import { stage, aimSun, mood } from '../lib/stage.js';
import { camPath, ss, clamp, along, track, yawTo, lerp } from '../lib/util.js';
import { cast, badge, label, quote, partTimes } from '../lib/kit.js';

export function build(ctx) {
  const L = ctx.L;
  const scene = stage({ skyTop: '#5d8ad0', skyHor: '#e3e6dc', groundA: '#8db35e', groundB: '#76a04c', fog: ['#e0e3d6', 35, 150], sunPos: [6, 12, 8], shadow: 14, seed: 121 });
  const env = new THREE.Group(); scene.add(env);
  for (const [x, z, h, r] of [[-60, -90, 26, 30], [0, -110, 36, 36], [60, -95, 28, 30]]) { const m = P.mountain(h, r, '#8a99a6', h > 30, x); m.position.set(x, 0, z); env.add(m); }
  P.scatter(env, (r, i) => (i % 3 ? P.pine(1.2 + r() * 0.6, '#2e6838', i) : P.roundTree(1.2 + r() * 0.5, '#4a8a36', i)), 130, [-40, -35, 40, -8], 122, [[-6, -9.5, 3]]);
  P.scatter(env, (r, i) => P.roundTree(1.2 + r() * 0.5, '#4a8a36', i), 40, [-40, 14, 40, 35], 123);
  // army camp
  const camp = new THREE.Group(); scene.add(camp);
  [[-3, -2.5], [0, -3], [3, -2.5]].forEach(([x, z]) => { const t = P.tent('#6e7a5a'); t.position.set(x, 0, z); camp.add(t); });
  [[-5, 0, Math.PI / 2], [5, 0, -Math.PI / 2], [0, 3.2, 0]].forEach(([x, z, r]) => { const s = P.sandbags(6, 0.08); s.position.set(x, 0, z); s.rotation.y = r; camp.add(s); });
  const flag = P.flag('#4a5470', 3.0); flag.position.set(-1.5, 0, -0.5); camp.add(flag);
  const road = P.strip([[0, 3.2], [2, 8], [12, 14], [40, 18]], 2.2, '#a58e6a', 0.02); env.add(road);
  const trucks = [0, 1].map(i => { const v = P.truck('#5a6350', '#6d7858'); v.position.set(-1.6 + i * 3.2, 0, 5.5); v.rotation.y = 0.35; scene.add(v); return v; });
  const army = [cast(scene, 'mcqueen', G.army, -1.6, 0.4), cast(scene, 'daiwa', G.army, 0.2, 1.1), cast(scene, 'suzuka', G.army, 1.8, 0.2), cast(scene, 'helios', G.army, 3.2, 1.0)];
  const gs = [cast(scene, 'oguri', G.guerrilla, -6, -9), cast(scene, 'tamamo', G.guerrilla, -7, -9.6), cast(scene, 'cafe', G.guerrilla, -5, -9.8), cast(scene, 'doto', null, -7.8, -8.6)];
  const pokes = [L[0].t0 + 1.0, L[1].t0 + 0.9, L[1].t0 + 2.6, L[1].t0 + 4.0].map((tt, i) => new F.Explosion(scene, [[-6.5, 0.2, 2.5], [6, 0.2, -3], [-5, 0.2, -4.5], [6.5, 0.2, 3]][i], tt, 0.6, 130 + i, { smokeColor: '#8a857c' }));
  const zzz = F.bubble('💤', { font: 130 }); scene.add(zzz);
  const yrs = { a: L[1].t0 + 0.2, b: L[1].t1 + 0.4 };
  const tLeave = L[1].t1 - 1.4, tCheer = L[2].t0 - 0.6;
  const sfx = [{ t: 0.4, type: 'sting' }, ...pokes.map(p => ({ t: p.t0, type: 'boom', vol: 0.45 })), { t: yrs.a, type: 'clock', dur: yrs.b - yrs.a, vol: 0.5 },
    { t: tLeave + 0.6, type: 'engine', dur: 4.5, vol: 0.6 }, { t: tCheer + 0.2, type: 'cheer' }, { t: L[2].t0 + 0.3, type: 'sting2' }];

  function update(t) {
    const yearK = clamp((t - yrs.a) / (yrs.b - yrs.a));
    // the years pass: light goes from day to dusk and the soldiers wear out
    mood(scene, { sun: lerp(2.6, 1.7, yearK), sunColor: yearK > 0.5 ? '#ffc79a' : '#fff1dc', skyHor: yearK > 0.6 ? '#f0c9a0' : '#e3e6dc', skyTop: yearK > 0.6 ? '#4a6fb0' : '#5d8ad0', hemi: lerp(1.2, 0.95, yearK) });
    P.waveFlag(flag, t);
    flag.cloth.position.y = 3.0 - 0.3 - yearK * 1.4;
    pokes.forEach(p => p.update(t));
    const leave = Math.max(0, t - tLeave);
    army.forEach((c, i) => {
      const tiredK = ss(yrs.a + 0.8, yrs.b - 1.2, t);
      if (leave <= 0) {
        let p = { ...C.blend(C.idle(t, c.seed), C.tired(t, c.seed), tiredK), gun: 'low' };
        const jump = pokes.find(pk => t > pk.t0 && t < pk.t0 + 0.7);
        if (jump && tiredK < 0.6) { p = { ...C.lookAround(t * 2, i), gun: 'low' }; }
        c.root.rotation.y = 0.2 * Math.sin(i + t * 0.2); c.apply(p);
        c.setFace(jump && tiredK < 0.6 ? 'shock' : (tiredK > 0.5 ? 'flat' : C.blinkEye(t, c.seed)), tiredK > 0.5 ? 'wavy' : (jump ? 'small' : 'neutral'));
      } else {
        const tr = trucks[i % 2], d = leave * 1.6, x0 = c.root.userData.x0 ??= c.root.position.x, z0 = c.root.userData.z0 ??= c.root.position.z;
        const pos = along([[x0, z0], [tr.position.x + 0.1 * i, tr.position.z - 1.4]], d);
        c.root.position.set(pos.x, 0, pos.z); c.root.rotation.y = pos.yaw; c.root.visible = !pos.done;
        c.apply({ ...C.walk(t, 0.7, i), gun: 'back' }); c.setFace('flat', 'frown');
      }
    });
    trucks.forEach((v, i) => { const d = Math.max(0, t - tLeave - 2.2 - i * 0.4) * 3.4; if (d > 0) { const pos = along([[v.userData.x0 ??= v.position.x, 5.5], [2 + i, 8.5], [12, 14.5], [40, 18]], d); v.position.set(pos.x, 0, pos.z); v.rotation.y = pos.yaw; v.wheels.forEach(w => w.rotation.x = d * 4); } });
    zzz.position.set(army[1].root.position.x, 0, army[1].root.position.z); F.popSprite(zzz, t, yrs.a + 3.0, tLeave, 0.45, 1.6);
    // guerrillas peek, then come out and celebrate
    gs.forEach((c, i) => {
      const d = Math.max(0, t - tCheer + 1.6) * 3.2;
      const x0 = [-6, -7, -5, -7.8][i], z0 = [-9, -9.6, -9.8, -8.6][i];
      const pos = along([[x0, z0], [-3.6, -4.6], [-1.8 + i * 1.2, 0.6 + (i % 2) * 0.5]], d);
      c.root.position.set(pos.x, 0, pos.z); c.root.rotation.y = pos.done ? 0.0 : pos.yaw;
      c.apply(pos.done ? { ...C.cheer(t, i), gun: 'none' } : d > 0 ? { ...C.run(t, 1, i), gun: 'back' } : { ...C.crouch(t, i, 0.5), gun: 'back' });
      c.setFace(pos.done ? (i % 2 ? 'happy' : 'sparkle') : C.blinkEye(t, c.seed), pos.done ? 'teeth' : 'neutral');
    });

    camPath(ctx.camera, [
      { t: 0, p: [5, 6.5, 13.5], l: [0, 0.4, -1], fov: 40 },
      { t: L[1].t0, p: [4, 2.6, 7], l: [0.5, 0.6, 0.5], fov: 38 },
      { t: tLeave + 0.6, p: [3, 3, 8.5], l: [0.5, 0.6, 1], fov: 40 },
      { t: tCheer, p: [7, 5, 12], l: [2, 0.4, 4], fov: 44 },
      { t: L[2].t0 + 0.4, p: [0.6, 1.3, 6.0], l: [0.2, 0.9, 0.5], fov: 40 },
      { t: ctx.dur, p: [0.2, 1.4, 5.2], l: [0.2, 0.95, 0.5], fov: 40 },
    ], t);
    aimSun(scene, 0, 0);

    let html = '';
    const ks = ss(L[0].t0 + 1.4, L[0].t0 + 1.8, t) * (1 - ss(L[1].t0 - 0.2, L[1].t0 + 0.2, t));
    if (ks > 0) html += `<div class="badge" style="opacity:${ks}"><div class="e">Scoreboard</div><div class="t">Army: wins most battles</div><div class="s">Guerrillas: still there. Every single year.</div></div>`;
    const ky = ss(yrs.a, yrs.a + 0.3, t) * (1 - ss(tLeave + 1.2, tLeave + 1.6, t));
    if (ky > 0) {
      const yr = 1 + Math.floor(yearK * 9.999), cost = (yearK * yearK * 120 + yearK * 20).toFixed(0);
      html += `<div class="stat" style="left:72px;top:72px;opacity:${ky}"><div class="v">Year ${yr}</div><div class="l">of the war</div></div>`;
      html += `<div class="stat" style="left:360px;top:72px;opacity:${ky}"><div class="v" style="color:#ff8a7a">$${cost}B</div><div class="l">cost so far</div></div>`;
    }
    html += badge(t, 'Real examples', 'They went home', 'France left Algeria (1962) · the US left Vietnam (1973) · the USSR left Afghanistan (1989)', L[1].t0 + 2.6, L[2].t0);
    const qa = 'As Henry Kissinger put it:', q1 = 'The guerrilla wins if he does not lose.', q2 = 'The conventional army loses if it does not win.';
    const pt = partTimes(L[2], [qa, q1, q2]);
    html += quote(t, [[q1, pt[1] - 0.1], [q2, pt[2] - 0.1]], 'Henry Kissinger, 1969', L[2].t0 + 0.4, ctx.dur, 26);
    return html;
  }
  return { scene, update, sfx, hideCaptions: t => t > L[2].t0 + 0.6 };
}
