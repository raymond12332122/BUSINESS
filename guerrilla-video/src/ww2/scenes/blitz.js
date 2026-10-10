import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as P from '../../lib/props.js';
import * as F from '../../lib/fx.js';
import * as M from '../../lib/map.js';
import { stage, aimSun } from '../../lib/stage.js';
import { camPath, ss, clamp, along, yawTo, lerp } from '../../lib/util.js';
import { cast, badge, label, partTimes } from '../../lib/kit.js';
import * as W from '../kit.js';

export function build(ctx) {
  const L = ctx.L;
  const scene = stage({ skyTop: '#5d86c4', skyHor: '#dfe5e3', groundA: '#9aae5e', groundB: '#86994e', fog: ['#dfe3dc', 40, 170], sunPos: [8, 14, 9], shadow: 24, seed: 211 });
  const env = new THREE.Group(); scene.add(env);
  P.scatter(env, (r, i) => (i % 3 ? P.roundTree(1.1 + r() * 0.5, '#5a8a3a', i) : P.birch(1.1 + r() * 0.4, i)), 70, [-45, -40, 45, 30], 212, [[0, -4, 30]]);
  P.scatter(env, (r, i) => P.roundTree(1.1 + r() * 0.5, '#5a8a3a', i), 50, [-45, -40, 45, 40], 213, [[0, -2, 22]]);

  // Polish line: spread thin along z = 0
  const keys = ['oguri', 'tamamo', 'cafe', 'doto'];
  const line = [-12, -8.5, -5, -1.5, 1.5, 5, 8.5, 12].map((x, i) => {
    const c = W.soldier(cast(scene, keys[i % 4], null, x, 0.4, Math.PI), 'pl'); const sb = P.sandbags(4, 0.06); sb.position.set(x, 0, -0.4); scene.add(sb); c.x = x; return c;
  });
  // German wedge, concentrated at x = 0
  const wedge = [[0, -12], [-2.2, -15], [2.2, -15], [-4.4, -18], [4.4, -18]];
  const tanks = wedge.map(() => { const t = W.tank('de'); scene.add(t); return t; });
  const cmd = cast(scene, 'mcqueen', null); W.soldier(cmd, 'de', { gun: false });
  const inf = ['daiwa', 'suzuka', 'helios'].map(k => W.soldier(cast(scene, k, null), 'de'));
  const stukas = [0, 1, 2].map(() => { const p = W.plane('#5d6464', { mark: 'de' }); scene.add(p); return p; });
  const p1 = partTimes(L[1], ['Concentraba tanques y aviones en un solo punto,', 'rompía la línea enemiga', 'y avanzaba sin detenerse.']);
  const tDive = p1[0] + 1.2, tBomb = tDive + 1.2, tGo = p1[1] - 0.2;
  const bombs = [-1.4, 0.3, 1.8].map((x, i) => new F.Explosion(scene, [x, 0.3, 0.2], tBomb + i * 0.25, 1.0, 220 + i, { fire: 0.4, smokeColor: '#7d7873' }));
  const radio = F.bubble('📻', { font: 130 }); scene.add(radio);
  const flags = [0, 1].map(() => { const f = P.flag('#ffffff', 1.4); scene.add(f); return f; });
  // pincer arrows on the ground
  const arL = M.arrow([[0, 4], [-6, 7], [-12, 5], [-14, -3]], '#3b3f46', 1.2, 0.05, true);
  const arR = M.arrow([[0, 4], [6, 7], [12, 5], [14, -3]], '#3b3f46', 1.2, 0.05, true);
  const arC = M.arrow([[0, -10], [0, -2], [0, 4]], '#3b3f46', 1.6, 0.05, true);
  [arL, arR, arC].forEach(a => scene.add(a));
  const tWrap = L[2].t0 + 0.4, tFall = L[3].t0;
  const sfx = [{ t: 0.3, type: 'engine', dur: ctx.dur - 0.6, vol: 0.6 }, { t: tDive - 0.4, type: 'siren', dur: 1.8 }, ...bombs.map(b => ({ t: b.t0, type: 'boom', vol: 0.8 })),
    { t: tGo, type: 'march', dur: 4, vol: 0.5 }, { t: L[2].t0 + 0.6, type: 'beep' }, { t: tFall + 0.2, type: 'sting2' }];

  function update(t) {
    // tank movement: wait, punch through at x=0, then split into two pincers
    tanks.forEach((v, i) => {
      const [x0, z0] = wedge[i];
      const go = Math.max(0, t - tGo) * 2.6;
      let pos;
      if (i === 0) pos = along([[x0, z0], [0, 5], [0, 11]], go);
      else { const s = Math.sign(x0); pos = along([[x0, z0], [x0 * 0.4, 4], [s * 7, 7], [s * 12.5, 4.5], [s * 13.5, -3]], go * 1.25); }
      v.position.set(pos.x, 0, pos.z); v.rotation.y = pos.yaw; v.body.position.y = go > 0 && !pos.done ? 0.012 * Math.sin(t * 28 + i) : 0;
      if (v.wheels) v.wheels.forEach(w => w.rotation.x = go * 4);
    });
    const lead = tanks[0];
    cmd.root.position.set(lead.position.x, 0.52, lead.position.z - 0.1); cmd.root.rotation.y = lead.rotation.y;
    cmd.apply(t > L[2].t0 && t < L[2].t0 + 3 ? { ...C.point(t, 1, -30) } : C.idle(t, 1)); cmd.setFace(C.blinkEye(t, 1), t > L[2].t0 ? 'open' : 'smile');
    radio.position.set(lead.position.x, 0, lead.position.z); F.popSprite(radio, t, L[2].t0 + 0.4, L[2].t0 + 4, 0.5, 2.2);
    inf.forEach((c, i) => {
      const go = Math.max(0, t - tGo - 0.5) * 2.2, x0 = (i - 1) * 1.2;
      const pos = along([[x0, -10.5], [x0, 4.5]], go);
      c.root.position.set(pos.x, 0, pos.z); c.root.rotation.y = 0;
      c.apply(go > 0 && !pos.done ? { ...C.runArmed(t, 1, i), gun: 'port' } : { ...C.idle(t, c.seed), gun: 'low' }); c.setFace(C.blinkEye(t, c.seed), go > 0 ? 'grin' : 'neutral');
    });
    // Stukas dive on the centre of the line
    stukas.forEach((p, i) => {
      const k = (t - tDive - i * 0.25);
      const x = (i - 1) * 1.6;
      const pts = [[x, 16, -34], [x, 9, -12], [x, 3.5, -1.5], [x, 7, 8], [x, 18, 30]];
      const u = clamp((k + 1.6) / 4.2), seg = u * (pts.length - 1), j = Math.min(Math.floor(seg), pts.length - 2), f = seg - j;
      const a = pts[j], b = pts[j + 1]; p.position.set(lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f));
      p.lookAt(b[0], b[1], b[2]); p.prop.rotation.z = t * 60; p.visible = u > 0 && u < 1;
    });
    bombs.forEach(b => b.update(t));
    // defenders: alert, the centre gets knocked over, the rest are surrounded and give up
    line.forEach((c, i) => {
      const centre = Math.abs(c.x) < 2;
      let p, eye = C.blinkEye(t, c.seed), mouth = 'neutral';
      if (centre && t > tBomb) { p = C.knocked(t - tBomb, i); eye = 'dizzy'; mouth = 'wavy'; }
      else if (t > tFall) { p = C.tired(t, i); eye = 'flat'; mouth = 'frown'; }
      else if (t > tWrap + 2) { p = { ...C.lookAround(t, i), gun: 'low' }; eye = 'shock'; mouth = 'small'; }
      else p = { ...C.aim(t, 0, 1), gun: 'aim' };
      c.root.rotation.y = t > tWrap + 2 && !centre ? Math.PI + Math.sin(t + i) * 0.8 : Math.PI;
      c.apply(p); c.setFace(eye, mouth);
    });
    flags.forEach((f, i) => { f.position.set(i ? 6.8 : -6.8, 0, 1.2); f.visible = t > tFall + 0.4; P.waveFlag(f, t + i); });
    arC.set(ss(p1[1] - 0.6, p1[2], t)); arL.set(ss(tWrap, tWrap + 2.4, t)); arR.set(ss(tWrap + 0.2, tWrap + 2.6, t));

    camPath(ctx.camera, [
      { t: 0, p: [9, 11, 16], l: [0, 0, -6], fov: 42 },
      { t: tDive - 0.6, p: [7, 9, 14], l: [0, 0, -5], fov: 42 },
      { t: tDive - 0.2, p: [5.5, 2.2, 7.5], l: [0, 2.5, -3], fov: 44 },
      { t: tBomb + 1.2, p: [6, 2.4, 8.5], l: [0, 1.0, -2], fov: 44 },
      { t: p1[2] + 1.0, p: [7, 6, 15], l: [0, 0.5, 2], fov: 44 },
      { t: L[2].t0 + 0.2, p: [0, 26, 18], l: [0, 0, 1], fov: 46 },
      { t: tFall - 0.2, p: [0, 27, 17], l: [0, 0, 1.5], fov: 46 },
      { t: tFall + 0.3, p: [-3, 2.2, 6.5], l: [-6.8, 0.7, 0.4], fov: 38 },
      { t: ctx.dur, p: [-3.4, 2.0, 6.0], l: [-6.8, 0.7, 0.4], fov: 36 },
    ], t, t > tBomb && t < tBomb + 0.9 ? 0.07 * (1 - (t - tBomb) / 0.9) : 0);
    aimSun(scene, 0, 0);

    let html = badge(t, 'Blitzkrieg', 'Guerra relámpago', 'Tanques + aviones + radio, todo en un mismo punto', 1.0, tDive - 0.4);
    const kl = ss(1.6, 2.0, t) * (1 - ss(tDive - 0.6, tDive - 0.3, t));
    html += label(ctx, [0, 3.2, -15], 'Alemania: todo en un punto', 'a', kl) + label(ctx, [-8.5, 1.9, 0.4], 'Línea polaca: repartida', 'n', kl);
    html += label(ctx, [-13, 1.2, 1], 'Rodeados', 'r', ss(tWrap + 2.4, tWrap + 2.8, t) * (1 - ss(tFall - 0.4, tFall, t))) + label(ctx, [13, 1.2, 1], 'Rodeados', 'r', ss(tWrap + 2.4, tWrap + 2.8, t) * (1 - ss(tFall - 0.4, tFall, t)));
    html += badge(t, 'Septiembre–octubre 1939', 'Polonia cae', 'En unas cinco semanas', tFall + 0.2, ctx.dur);
    return html;
  }
  return { scene, update, sfx };
}
