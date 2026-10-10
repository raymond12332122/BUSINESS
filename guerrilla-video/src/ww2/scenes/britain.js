import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as P from '../../lib/props.js';
import * as F from '../../lib/fx.js';
import { stage, aimSun } from '../../lib/stage.js';
import { camPath, ss, clamp, lerp } from '../../lib/util.js';
import { cast, badge, label } from '../../lib/kit.js';
import * as W from '../kit.js';

export function build(ctx) {
  const L = ctx.L;
  const scene = stage({ skyTop: '#4f7cc0', skyHor: '#dfe8ee', groundA: '#4d7a96', groundB: '#4a7590', fog: ['#d7e2ea', 50, 220], sunPos: [-8, 16, 10], sun: 2.6, hemi: 1.3, shadow: 22, seed: 241 });
  // cliffs: green plateau (y = 3) for z < 0, white chalk face, sea below
  const H = 3;
  const plateau = new THREE.Mesh(new THREE.BoxGeometry(200, H, 80), new THREE.MeshStandardMaterial({ color: '#7ea456', roughness: 1 }));
  plateau.position.set(0, H / 2, -40); plateau.receiveShadow = true; scene.add(plateau);
  const chalk = new THREE.Mesh(new THREE.BoxGeometry(200, H - 0.2, 0.6), new THREE.MeshStandardMaterial({ color: '#efeee6', roughness: 1, flatShading: true }));
  chalk.position.set(0, H / 2 - 0.1, 0.1); scene.add(chalk);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(400, 300), new THREE.MeshStandardMaterial({ color: '#4a7ea0', roughness: 0.3, metalness: 0.1 }));
  sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.3, 150); scene.add(sea);
  P.scatter(scene, (r, i) => { const t = P.roundTree(1.1 + r() * 0.4, '#4f8a3a', i); t.position.y = H; return t; }, 40, [-50, -40, 50, -8], 242, [[0, -3, 7]]);
  const rad = W.radar(); rad.position.set(-3, H, -5); scene.add(rad);
  const rings = [0, 1, 2].map(() => { const m = F.ring('#9fe3ff', 1); m.position.set(-3, H + 0.05, -5); m.material.opacity = 0; scene.add(m); return m; });
  const tm = W.soldier(cast(scene, 'tamamo', null, 0.8, -2.6, 0.2), 'uk');
  tm.root.userData.r = 1; tm.root.position.y = H;
  const uk2 = W.soldier(cast(scene, 'tamamo', null, -0.8, -3.4, 0.4), 'uk'); uk2.root.position.y = H;

  const bombers = [0, 1, 2].map(i => { const p = W.plane('#62686a', { kind: 'bomber', mark: 'de' }); scene.add(p); return p; });
  const spits = [0, 1, 2].map(i => { const p = W.plane('#6b6f4a', { mark: 'uk' }); scene.add(p); return p; });
  const trail = [...Array(22)].map(() => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: '#3d3b3a', transparent: true, depthWrite: false })); scene.add(m); return m; });
  const tHit = L[1].t0 + 2.0, tCrash = tHit + 2.6;
  const splash = new F.Explosion(scene, [0, 0.3, 0], tCrash, 1.4, 251, { smokeColor: '#e8eef2' });
  const tracer = new F.LiveTracer(scene, '#ffe08a');
  const sfx = [{ t: 0.4, type: 'plane', dur: ctx.dur - 0.8, vol: 0.8 }, { t: 1.2, type: 'beep' }, { t: L[1].t0 + 0.4, type: 'whoosh' },
    ...[0, 0.12, 0.24, 0.36, 0.48, 0.6].map(d => ({ t: tHit - 0.7 + d, type: 'shot', vol: 0.4 })), { t: tCrash, type: 'boom' }, { t: tCrash + 0.6, type: 'cheer' }];

  const bPath = (i, t) => { const z = 60 - t * 5.5, y = 11 + i * 0.8; return new THREE.Vector3((i - 1) * 4, y + Math.sin(t * 0.8 + i) * 0.2, z + Math.abs(i - 1) * 3); };
  const sPath = (i, t) => { const a = (t - L[1].t0) * 0.9 + i * 2.1; return new THREE.Vector3(Math.sin(a) * 9, 12 + Math.sin(a * 2) * 1.5, 22 + Math.cos(a) * 9 - Math.max(0, L[1].t0 - t) * 30); };

  function update(t) {
    rad.head.rotation.y = t * 1.6;
    rings.forEach((m, i) => { const k = ((t * 0.6 + i / 3) % 1); m.scale.setScalar(1 + k * 18); m.material.opacity = 0.6 * (1 - k); });
    bombers.forEach((p, i) => {
      let pos = bPath(i, t), next = bPath(i, t + 0.05);
      if (i === 1 && t > tHit) { const u = t - tHit; const h = bPath(i, tHit); pos = new THREE.Vector3(h.x + u * 1.5, Math.max(0.3, h.y - u * u * 1.6), h.z + u * 3); next = new THREE.Vector3(pos.x + 0.1, pos.y - 0.12 * u, pos.z + 0.25); p.visible = t < tCrash; }
      p.position.copy(pos); p.lookAt(next); if (i === 1 && t > tHit) p.rotateZ((t - tHit) * 2); p.prop.rotation.z = t * 50;
    });
    const hb = bombers[1].position;
    trail.forEach((m, j) => { const tt = t - j * 0.09; if (tt < tHit || t > tCrash + 2) { m.visible = false; return; }
      const u = tt - tHit, h = bPath(1, tHit); m.position.set(h.x + u * 1.5, Math.max(0.3, h.y - u * u * 1.6), h.z + u * 3); m.scale.setScalar(0.2 + j * 0.05); m.material.opacity = 0.7 * (1 - j / 22); m.visible = tt < tCrash; });
    splash.g.position.set(hb.x, 0.4, hb.z); splash.update(t);
    spits.forEach((p, i) => { const pos = sPath(i, t), nx = sPath(i, t + 0.05); p.position.copy(pos); p.lookAt(nx); p.rotateZ(-0.5); p.prop.rotation.z = t * 60; p.visible = t > L[1].t0 - 1.2; });
    if (t > tHit - 0.7 && t < tHit) { const k = ((t - tHit + 0.7) * 8) % 1; tracer.set(spits[0].position.clone(), bombers[1].position.clone(), k); } else tracer.set(new THREE.Vector3(), new THREE.Vector3(), -1);
    [tm, uk2].forEach((c, i) => {
      const happy = t > tCrash + 0.3;
      c.apply(happy ? C.cheer(t, i) : t > L[0].t0 + 1 ? { ...C.point(t, i, 0), armR: [-140, 0, 90] } : C.idle(t, c.seed));
      c.root.rotation.y = 0.2 + i * 0.2; c.setFace(happy ? 'sparkle' : t > L[1].t0 ? 'squint' : 'shock', happy ? 'teeth' : 'small');
    });
    camPath(ctx.camera, [
      { t: 0, p: [4, H + 1.4, -8], l: [0, H + 5, 30], fov: 46 },
      { t: L[0].t1 - 0.6, p: [3, H + 1.6, -7], l: [0, H + 6, 25], fov: 46 },
      { t: L[0].t1 - 0.5, p: [5.5, H + 1.6, -13], l: [-2.2, H + 2.6, -3.5], fov: 42 },
      { t: tHit - 1.2, p: [6, H + 1.8, -13.5], l: [-2, H + 3, -3.5], fov: 42 },
      { t: tHit - 1.1, p: [6, H + 2.5, -1], l: [0, 9, 20], fov: 50 },
      { t: tCrash + 0.5, p: [7, H + 2.5, 1], l: [3, 5, 14], fov: 50 },
      { t: tCrash + 0.6, p: [1.6, H + 1.3, 3.2], l: [0, H + 0.9, -3], fov: 40 },
      { t: ctx.dur, p: [1.4, H + 1.25, 2.6], l: [0, H + 0.9, -3], fov: 38 },
    ], t);
    if (t > tHit - 1.1 && t < tCrash + 0.5) { const tgt = t < tHit ? bombers[1].position : hb; ctx.camera.lookAt(tgt.x, Math.max(tgt.y, 1.5), tgt.z); }
    aimSun(scene, 0, 5);
    let html = badge(t, 'Batalla de Inglaterra · 1940', 'La pelea por el cielo', 'Sin dominar el aire, no había invasión', 1.0, L[1].t0);
    html += label(ctx, [-3, H + 6.2, -5], 'Radar', 'n', ss(L[1].t0 + 0.6, L[1].t0 + 1.0, t) * (1 - ss(tHit, tHit + 0.3, t)));
    html += badge(t, 'Julio–octubre de 1940', 'Alemania no pudo invadir', 'La primera gran derrota de Hitler', tCrash + 0.8, ctx.dur);
    return html;
  }
  return { scene, update, sfx };
}
