import * as THREE from 'three';
import * as C from '../lib/chars.js';
import * as P from '../lib/props.js';
import * as G from '../lib/gear.js';
import * as F from '../lib/fx.js';
import { stage, aimSun } from '../lib/stage.js';
import { camPath, ss, clamp, along, track, yawTo, lerp } from '../lib/util.js';
import { cast, badge, label } from '../lib/kit.js';

export function build(ctx) {
  const L = ctx.L;
  const scene = stage({ skyTop: '#6f8fb8', skyHor: '#d9dccf', groundA: '#8a8f5a', groundB: '#6f6a45', fog: ['#cfd2c6', 30, 140],
    sunPos: [-6, 11, 9], sun: 2.2, hemi: 1.3, hemiSky: '#e6eef8', hemiGround: '#5d5a40', shadow: 22, seed: 81 });
  const env = new THREE.Group(); scene.add(env);
  const road = P.strip([[-80, 0], [80, 0]], 2.8, '#55575a', 0.02); env.add(road);
  env.add(P.strip([[-80, 1.75], [80, 1.75]], 0.6, '#6b5a40', 0.018)); env.add(P.strip([[-80, -1.75], [80, -1.75]], 0.6, '#6b5a40', 0.018));
  // fields + birch groves
  for (let i = 0; i < 6; i++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), new THREE.MeshStandardMaterial({ color: i % 2 ? '#7d6f4a' : '#8f8a55', roughness: 1 })); f.rotation.x = -Math.PI / 2; f.position.set(-35 + i * 15, 0.012, 9); env.add(f); }
  P.scatter(env, (r, i) => (i % 4 ? P.birch(1.2 + r() * 0.6, i) : P.pine(1.2 + r() * 0.6, '#3a5a3c', i)), 160, [-50, -40, 50, -5], 82, [[-2.6, -7.3, 2.0], [-3.2, -8.6, 1.6], [-0.8, -9.6, 1.6], [-2.4, -11, 2], [0.6, -10.5, 2.2], [-1.36, -9.39, 1.5], [0.13, -8.37, 1.5]]);
  for (const [x, z] of [[-0.6, -5.6], [-5.4, -5.6], [-5.6, -8.8], [-4.4, -8.4]]) { const b = P.bush(0.9, '#566b33', x * 10); b.position.set(x, 0, z); env.add(b); }
  P.scatter(env, (r, i) => P.birch(1.1 + r() * 0.5, i + 7), 40, [-50, 15, 50, 40], 83);
  const vill = [[18, 14], [21, 16], [24, 13.5]].map(([x, z]) => { const h = P.house(2, 1.8, 1.3, '#e3ddd0', '#5a6d8a'); h.position.set(x, 0, z); env.add(h); return h; });

  // the column, moving +X then stuck
  const kinds = ['tank', 'apc', 'truck', 'tank', 'truck', 'apc'];
  const col = kinds.map((k, i) => { const v = k === 'tank' ? P.tank('#5b6247') : k === 'apc' ? P.apc('#5b6247') : P.truck('#5b6247', '#6a7356'); v.rotation.y = Math.PI / 2; scene.add(v); v.k = k; return v; });
  // the team in the treeline
  const team = [cast(scene, 'cafe', G.guerrilla, -3.4, -7.2, 0.5), cast(scene, 'oguri', G.guerrilla, -1.8, -6.6, 0.6, { weapon: 'tube' }), cast(scene, 'tamamo', G.guerrilla, -4.4, -6.2, 0.4)];
  const pad = new THREE.Group(); pad.add(P.at(P.box(0.16, 0.03, 0.11, '#2a2c30'), 0, 0, 0)); pad.add(P.at(P.box(0.12, 0.005, 0.08, '#5fd38a'), 0, 0.018, 0));
  team[0].attach('chest', pad, [0, 0.36, 0.17], [-40, 0, 0]);
  const dr = P.drone(); dr.scale.setScalar(1.8); scene.add(dr);
  const bomb = P.at(P.cyl(0.05, 0.05, 0.16, '#3a3f2a', 8), 0, 0, 0); scene.add(bomb);
  const missile = new THREE.Group(); missile.add(P.at(P.cyl(0.035, 0.035, 0.35, '#5a6a45', 8), 0, 0, 0, Math.PI / 2, 0, 0));
  const mflame = F.bubble('', { bg: null }); missile.add(mflame); scene.add(missile);
  const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: F.flashTex, blending: THREE.AdditiveBlending, depthWrite: false })); flare.scale.setScalar(0.5); flare.position.z = -0.25; missile.add(flare);
  const trail = [...Array(14)].map(() => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: '#d8d8d8', transparent: true, depthWrite: false })); scene.add(m); return m; });

  const tLaunch = L[1].t0 + 6.2, tHit1 = tLaunch + 0.9, tDrop = tHit1 + 1.0, tHit2 = tDrop + 0.9, tLeave = L[2].t0 + 0.6;
  const tPov0 = L[1].t0 + 2.2, tPov1 = tLaunch - 0.7;
  const stopX = 6; // lead vehicle x when hit
  const colX = (t, i) => { const lead = Math.min((t - tHit1) * 1.6, 0) + stopX; const gap = 5.2; return lead - i * gap + (t < tHit1 ? 0 : -Math.min((t - tHit1) * 0.8, 0.6) * i * 0.4); };
  const ex1 = new F.Explosion(scene, [0, 0.5, 0], tHit1, 1.5, 91, { fire: 1 });
  const ex2 = new F.Explosion(scene, [0, 0.5, 0], tHit2, 1.3, 92, { fire: 1 });
  const sfx = [{ t: 0.2, type: 'engine', dur: tHit1, vol: 0.6 }, { t: L[1].t0 + 0.5, type: 'drone', dur: tHit2 - L[1].t0 + 1, vol: 0.55 }, { t: tPov0, type: 'beep' },
    { t: tLaunch, type: 'missile' }, { t: tHit1, type: 'bigboom' }, { t: tDrop, type: 'click' }, { t: tHit2, type: 'boom' }, { t: tLeave, type: 'whoosh' }];

  // launch point: fixed, so every render worker agrees
  const P0 = () => { const yaw = yawTo([-1.8, -6.6], [stopX, 0.2]) - 0.15; return new THREE.Vector3(-1.8 + Math.sin(yaw) * 0.55, 0.42, -6.6 + Math.cos(yaw) * 0.55); };
  function update(t) {
    col.forEach((v, i) => {
      const x = colX(t, i); v.position.set(x, 0, 0.2);
      if (v.wheels) v.wheels.forEach(w => w.rotation.x = x * 4);
      const mv = t < tHit1; if (v.body) v.body.position.y = mv ? 0.01 * Math.sin(t * 25 + i) : 0;
      if (v.turret) v.turret.rotation.y = t > tHit1 + 0.6 && i === 3 ? 0.6 * Math.sin((t - tHit1) * 0.8) : 0;
    });
    const lead = col[0], last = col[col.length - 1];
    if (t > tHit1) { lead.body.rotation.z = 0.12 * clamp((t - tHit1) * 3); lead.turret.position.y = 0.88 + Math.max(0, Math.sin(clamp((t - tHit1) / 0.9) * Math.PI)) * 0.9; lead.turret.rotation.x = clamp((t - tHit1) / 0.9) * 0.6; }
    ex1.g.position.set(lead.position.x, 0.5, 0.2); ex2.g.position.set(last.position.x, 0.5, 0.2);
    ex1.update(t); ex2.update(t);

    // drone path: from the team, up and over the column, hover over the tail
    const dStart = [-3.4, 0.9, -7.0], dHover = () => [last.position.x + 0.2, 4.2, 0.4];
    const k = ss(L[1].t0 + 0.3, L[1].t0 + 3.6, t);
    const hv = dHover();
    const dp = [lerp(dStart[0], hv[0], k), lerp(dStart[1], hv[1], Math.min(1, k * 1.6)), lerp(dStart[2], hv[2], k)];
    const away = ss(tHit2 + 0.4, tHit2 + 3.5, t);
    dp[0] = lerp(dp[0], -3, away); dp[1] = lerp(dp[1], 1.0, away); dp[2] = lerp(dp[2], -7.5, away);
    dr.position.set(dp[0] + 0.05 * Math.sin(t * 3), dp[1] + 0.04 * Math.sin(t * 4.2), dp[2]);
    dr.rotation.set(0.1 * Math.sin(t * 2), 0.3 * Math.sin(t * 0.7), 0.08 * Math.sin(t * 2.3));
    dr.rotors.forEach((r, i) => r.rotation.y = t * 60 * (i % 2 ? 1 : -1));
    dr.visible = t > L[1].t0 + 0.2 && t < tLeave + 4;
    // drop
    const bt = t - tDrop; bomb.visible = bt > 0 && t < tHit2;
    bomb.position.set(hv[0], hv[1] - 0.2 - 0.5 * 9.8 * Math.max(0, bt) * Math.max(0, bt), hv[2]);

    // missile from Oguri's launcher to the lead vehicle
    const mt = clamp((t - tLaunch) / (tHit1 - tLaunch));
    missile.visible = t > tLaunch && t < tHit1;
    if (missile.visible) {
      const tgt = new THREE.Vector3(lead.position.x, 0.7, 0.2), p0 = missile.userData.p0 ||= P0();
      const p = p0.clone().lerp(tgt, mt); p.y += Math.sin(mt * Math.PI) * 1.0;
      const p2 = p0.clone().lerp(tgt, Math.min(1, mt + 0.02)); p2.y += Math.sin(Math.min(1, mt + 0.02) * Math.PI) * 1.0;
      missile.position.copy(p); missile.lookAt(p2);
    }
    trail.forEach((m, i) => {
      const age = i * 0.06, tt = t - age; const u = clamp((tt - tLaunch) / (tHit1 - tLaunch));
      const p0 = missile.userData.p0 ||= P0(); if (tt < tLaunch) { m.visible = false; return; }
      const tgt = new THREE.Vector3(lead.position.x, 0.7, 0.2), p = p0.clone().lerp(tgt, u); p.y += Math.sin(u * Math.PI) * 1.0;
      const life = t - tLaunch - u * (tHit1 - tLaunch) + age; m.position.copy(p); m.position.y += life * 0.1;
      m.scale.setScalar(0.08 + life * 0.12); m.material.opacity = 0.7 * clamp(1 - life / 2.5); m.visible = m.material.opacity > 0.02 && tt <= tHit1;
    });

    // team
    team.forEach((c, i) => {
      if (t < tLeave) {
        c.root.position.set(...[[-3.4, -7.2], [-1.8, -6.6], [-4.4, -6.2]][i].flatMap((v, j) => j ? [0, v] : [v]));
        if (i === 0) { c.root.rotation.y = 0.6; c.apply({ ...C.operate(t, c.seed), gun: 'back' }); c.setFace(C.blinkEye(t, c.seed, 'flat'), 'neutral'); }
        if (i === 1) { c.root.rotation.y = yawTo([-1.8, -6.6], [lead.position.x, 0.2]) - 0.15; const ready = ss(tLaunch - 1.6, tLaunch - 0.8, t);
          c.apply({ ...C.blend(C.crouch(t, c.seed, 0.7), C.aim(t, t > tLaunch ? Math.max(0, 1 - (t - tLaunch) * 4) : 0, 1), ready), gun: ready > 0.3 ? 'tube' : 'back' });
          c.setFace(t > tLaunch ? 'squint' : 'flat', t > tHit1 ? 'grin' : 'neutral'); }
        if (i === 2) { c.root.rotation.y = 0.8; c.apply({ ...C.point(t, c.seed, 10), gun: 'back' }); c.setFace(C.blinkEye(t, c.seed), t > tHit1 ? 'teeth' : 'small'); }
      } else {
        const d = Math.max(0, (t - tLeave - i * 0.15) * 3.2), x0 = [-3.4, -1.8, -4.4][i], z0 = [-7.2, -6.6, -6.2][i];
        const pos = along([[x0, z0], [x0 - 1.5, z0 - 4], [x0 - 3, -22]], d);
        c.root.position.set(pos.x, 0, pos.z); c.root.rotation.y = pos.yaw;
        c.apply({ ...C.runArmed(t, 1.1, i), gun: 'port' }); c.setFace('squint', 'grin');
      }
    });

    const pov = t >= tPov0 && t < tPov1;
    if (pov) {
      ctx.camera.position.set(hv[0] + 0.3 * Math.sin(t * 1.7), 4.0 + 0.05 * Math.sin(t * 5), hv[2] + 0.2 * Math.sin(t * 2.1));
      ctx.camera.lookAt(hv[0] + 2.5 + (t - tPov0) * 0.8, 0, 0.3); if (ctx.camera.fov !== 50) { ctx.camera.fov = 50; ctx.camera.updateProjectionMatrix(); }
    } else camPath(ctx.camera, [
      { t: 0, p: [-14, 8, 12], l: [-6, 0.3, 0], fov: 42 },
      { t: L[1].t0, p: [-10, 5, 9], l: [-4, 0.6, -2], fov: 42 },
      { t: tPov0, p: [-6, 2.6, 2.0], l: [-3, 1.6, -4.2], fov: 42 },
      { t: tPov1, p: [0.13, 0.95, -8.37], l: [-0.9, 0.55, -4.5], fov: 46 },
      { t: tLaunch + 0.3, p: [0.2, 1.0, -8.5], l: [-0.6, 0.6, -4.5], fov: 48 },
      { t: tHit1 + 0.25, p: [-6, 12, 21], l: [-7, 0, -1], fov: 50 },
      { t: tLeave - 0.5, p: [-8, 12.5, 22], l: [-7.5, 0, -1], fov: 50 },
      { t: tLeave + 0.4, p: [1.0, 2.0, -3.2], l: [-3, 0.6, -9], fov: 40 },
      { t: ctx.dur, p: [0.6, 2.4, -4.0], l: [-4, 0.6, -12], fov: 42 },
    ], t, t > tHit1 && t < tHit1 + 0.6 ? 0.06 * (1 - (t - tHit1) / 0.6) : 0);
    aimSun(scene, ctx.camera.position.x * 0.5 - 3, -2);

    let html = badge(t, '2022 · RUSSO-UKRAINIAN WAR', 'Battle of Kyiv', 'Small teams + cheap drones vs. long armored columns', L[1].t0 + 0.4, tPov0 + 0.2);
    if (pov) {
      const ts = (t - tPov0);
      html += `<div class="hud"><div class="cross"></div><div class="tx" style="left:60px;top:60px">● REC  CAM-1</div><div class="tx" style="right:60px;top:60px">ALT 120 m</div>
        <div class="tx" style="left:60px;bottom:170px">TGT: ARMORED COLUMN · 6 VEH</div><div class="tx" style="right:60px;bottom:170px">BAT ${(87 - ts * 0.6).toFixed(0)}%</div></div>`;
    }
    html += badge(t, 'Result', 'Column stopped cold', 'Lead and tail knocked out, everything else trapped', tHit2 + 0.6, L[2].t0 + 0.2);
    html += label(ctx, [lead.position.x, 2.6, 0.2], 'Lead hit', 'r', ss(tHit1 + 1.2, tHit1 + 1.5, t) * (1 - ss(tLeave - 0.6, tLeave - 0.3, t)));
    html += label(ctx, [last.position.x, 2.6, 0.2], 'Tail hit', 'r', ss(tHit2 + 1.0, tHit2 + 1.3, t) * (1 - ss(tLeave - 0.6, tLeave - 0.3, t)));
    return html;
  }
  return { scene, update, sfx };
}
