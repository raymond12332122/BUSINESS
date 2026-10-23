import * as THREE from 'three';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import { run, wt } from '../../whatif/shots.js';
const { ss } = K;

// The cage: a glass dome comes down over the whole city; photos, contacts and files fly inside; a lock. Gold lines tie
// every home to its neighbours (the network) and a rival app outside can't get in. Then she leans in and asks the
// viewer, from the other side of the glass, which app they are watching this on.
export function build(ctx) {
  const L = ctx.L;
  const tHa = wt(L[0], 'haga'), tDu = wt(L[0], 'duela'), tFo = wt(L[0], 'fotos'), tCo = wt(L[0], 'contactos'), tAr = wt(L[0], 'archivos'), tAd = wt(L[0], 'adentro');
  const tTd = wt(L[1], 'todos'), tAq = wt(L[1], 'aquí'), tNi = wt(L[1], 'ninguna'), tBu = wt(L[1], 'buena');
  const tPo = wt(L[2], 'por'), tApp = wt(L[2], 'app'), tEsto = wt(L[2], 'esto');
  const O = S.office(), rud = K.host(O);
  const dome = P.dome(0.92, 0.95); dome.scale.set(1, 1, 0.62); O.add(dome);
  const land = tDu + 0.15, drop = t => 1.3 * (1 - ss(tHa - 0.25, land, t) ** 1.6);
  // icons flying in, and the lock on the glass
  const fly = [['foto', tFo, [0.14, 1.1, 0.8]], ['contacto', tCo, [0.27, 0.95, 0.76]], ['archivo', tAr, [0.2, 1.14, 0.72]]].map(([k, t0, from]) => { const sp = P.icon(k, 0.11); O.add(sp); return { sp, t0, from: new THREE.Vector3(...from) }; });
  const lock = P.icon('candado', 0.09); lock.position.set(0.12, K.TOP + 0.26, 0.6); O.add(lock);
  const rivalApp = P.icon('nube', 0.12); rivalApp.position.set(0.4, K.TOP + 0.26, 0.7); O.add(rivalApp);
  // the network: each home linked to its two nearest neighbours, revealed segment by segment
  const pos = [];
  O.homes.forEach(([x, z], i) => { const near = O.homes.map(([a, b], j) => [Math.hypot(a - x, b - z), j]).filter(([d, j]) => j !== i && d < 0.22).sort((a, b) => a[0] - b[0]).slice(0, 2);
    near.forEach(([, j]) => { if (j > i) pos.push(x, 0.075, z, O.homes[j][0], 0.075, O.homes[j][1]); }); });
  const ng = new THREE.BufferGeometry(); ng.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const net = new THREE.LineSegments(ng, new THREE.LineBasicMaterial({ color: '#ffd98a', transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  const nodes = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(O.homes.flatMap(([x, z]) => [x, 0.075, z]), 3)),
    new THREE.PointsMaterial({ color: '#ffe2a0', size: 0.022, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  nodes.userData.dynamic = true; O.city.add(nodes);
  net.userData.dynamic = true; O.city.add(net); const nSeg = pos.length / 6;
  const act = t => {
    dome.position.set(0, K.TOP + drop(t), 0);
    fly.forEach(({ sp, t0, from }) => { const u = ss(t0 - 0.1, t0 + 0.75, t), to = new THREE.Vector3(0, K.TOP + 0.28, 0);
      sp.visible = t > t0 - 0.15 && u < 1; sp.position.lerpVectors(from, to, u * u); sp.scale.setScalar(0.06 * (1 - 0.6 * u) * ss(t0 - 0.15, t0, t)); });
    lock.visible = t > tAd - 0.05; lock.scale.setScalar(0.09 * (1 + 0.4 * Math.max(0, 1 - (t - tAd) / 0.2)));
    ng.setDrawRange(0, 2 * Math.floor(nSeg * ss(tTd - 0.2, tAq + 0.8, t))); nodes.visible = t > tTd - 0.3; nodes.material.opacity = ss(tTd - 0.3, tTd + 0.3, t);
    O.flow.lock = tt => ss(tTd - 0.3, tAq + 0.3, tt); O.flow.share = () => 0;
    const dying = ss(tNi, tBu + 0.5, t); rivalApp.visible = t > tNi - 0.6 && dying < 1;
    rivalApp.material.opacity = (1 - dying) * (Math.sin(t * 23) > -0.3 ? 1 : 0.4); rivalApp.scale.setScalar(0.12 * (1 - 0.3 * dying));
    O.led.set(`${Math.round(80 + 12 * ss(tTd, tAq + 0.5, t))}%`);
    O.userData.look.glitch = t > tPo - 0.3 ? Math.max(0, 1 - Math.abs(t - tApp - 0.1) / 0.18) * 0.7 + Math.max(0, 1 - Math.abs(t - tEsto - 0.25) / 0.25) * 0.9 : 0;
    O.tableGlow.intensity = t > tPo - 0.3 ? 0.35 : 1.0; O.cityLight.intensity = t > tPo - 0.3 ? 0.08 : 0.4;
    const p = t < tPo - 0.3 ? K.steeple(t, 8) : K.lean(t, 8, 0.7);
    if (t > tPo - 0.3) { p.look = [0, 1.36, 0.6]; p.lookW = 0.9; }
    K.act(rud, p, t, t > tEsto + 0.35 ? K.FACE.smug : K.FACE.smugTalk(t < L[2].t1));
    return K.stamp(t + ctx.start);
  };
  const sfx = [
    { t: tHa - 0.25, type: 'whoosh', vol: 0.3 }, { t: land, type: 'glass', vol: 0.6 },
    { t: tFo, type: 'swoosh', vol: 0.25 }, { t: tCo, type: 'swoosh', vol: 0.25 }, { t: tAr, type: 'swoosh', vol: 0.25 }, { t: tAd - 0.05, type: 'lock', vol: 0.6 },
    { t: tTd - 0.2, type: 'chime', vol: 0.25 }, { t: tNi, type: 'buzzoff', vol: 0.3 },
    { t: tPo - 0.3, type: 'heart', dur: 3.6, vol: 0.4 }, { t: tApp + 0.05, type: 'glitch', vol: 0.4 }, { t: tEsto + 0.2, type: 'glitch', vol: 0.5 },
  ];
  const shots = [
    { t0: 0, set: O, p0: [0.0, 2.3, 2.0], l0: [0, 1.0, -0.25], p1: [0.0, 2.0, 1.75], l1: [0, 0.98, -0.25], fov0: 50, act },
    { t0: tFo - 0.3, set: O, p0: [0.3, 1.02, 1.12], l0: [0, 1.02, 0], p1: [0.22, 1.0, 1.0], l1: [0, 1.0, 0], fov0: 52, act },
    { t0: tTd - 0.3, set: O, p0: [0.45, 1.95, 1.0], l0: [0, 0.82, -0.02], p1: [0.35, 1.8, 0.85], l1: [0, 0.82, -0.02], fov0: 52, act },
    { t0: tPo - 0.3, set: O, p0: [0.05, 1.33, -0.12], l0: [0, 1.33, -0.82], p1: [0.02, 1.34, -0.3], l1: [0, 1.34, -0.82], fov0: 42, ease: 'lin', act },
  ];
  const inst = { scene: O, scenes: [O], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
