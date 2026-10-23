import * as THREE from 'three';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as SC from '../screens.js';
import * as P from '../props.js';
import { run, wt } from '../../whatif/shots.js';
const { ss } = K;

// The limit: "Pero no se pase" (a raised finger, thunder). The tower swallows the city and burns red; "los gobiernos la
// parten": lightning, the dome shatters, the tower breaks apart. The monitor: Standard Oil 1911 into 34, AT&T 1984 into
// 7; Mexico's antitrust commission. "Aunque, con los años...": the pieces drift back together.
export function build(ctx) {
  const L = ctx.L;
  const tPa = wt(L[0], 'pase'), tCu = wt(L[0], 'cuando'), tTr = wt(L[0], 'traga'), tPar = wt(L[0], 'parten');
  const tSt = wt(L[1], 'standard'), tPed = wt(L[1], 'pedazos'), tAT = wt(L[1], 'at'), tSie = wt(L[1], 'siete');
  const tMx = wt(L[2], 'méxico'), tAnti = wt(L[2], 'antimonopolio');
  const tAu = wt(L[3], 'aunque'), tVa = wt(L[3], 'varios'), tJu = wt(L[3], 'juntar');
  const O = S.office(), rud = K.host(O), tv = K.tvShot(O, 1.18, 0.0, 0.0);
  const dome = P.dome(0.92, 0.95); dome.scale.set(1, 1, 0.62); dome.position.set(0, K.TOP, 0); O.add(dome);
  // glass shards for the moment it breaks
  const rnd = (i => { const v = Math.sin(i * 91.7 + 13.1) * 43758.5453; return v - Math.floor(v); });
  const shardM = new THREE.MeshStandardMaterial({ color: '#cfe0ff', transparent: true, opacity: 0.55, roughness: 0.1, side: THREE.DoubleSide, emissive: '#6f90c8', emissiveIntensity: 0.5, depthWrite: false });
  const shards = Array.from({ length: 70 }, (_, i) => {
    const g = new THREE.BufferGeometry(), s = 0.03 + rnd(i) * 0.05;
    g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, s, rnd(i + 1) * s, 0, rnd(i + 2) * s, s, 0], 3)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, shardM); m.userData.dynamic = true; O.add(m);
    const a = rnd(i + 3) * Math.PI * 2, el = rnd(i + 4) * Math.PI * 0.45, p = new THREE.Vector3(Math.cos(a) * Math.cos(el) * 0.92, K.TOP + Math.sin(el) * 0.9, Math.sin(a) * Math.cos(el) * 0.57);
    const v = new THREE.Vector3(p.x * 1.8, 0.8 + rnd(i + 5) * 1.2, (p.z) * 2.2 + 0.3);
    return { m, p, v, r: new THREE.Vector3(rnd(i + 6) * 9, rnd(i + 7) * 9, rnd(i + 8) * 9) };
  });
  const act = t => {
    const close = t < tCu - 0.25; O.key.intensity = close ? 3.2 : 6; O.tableGlow.intensity = close ? 0.3 : 1.0; O.cityLight.intensity = close ? 0.05 : 0.4;
    const broken = t > tPar;
    dome.visible = !broken;
    shards.forEach(({ m, p, v, r }) => { const d = t - tPar; m.visible = d > 0 && d < 1.6;
      if (m.visible) { m.position.set(p.x + v.x * d, Math.max(K.TOP, p.y + v.y * d - 4.9 * d * d), p.z + v.z * d); m.rotation.set(r.x * d, r.y * d, r.z * d); m.material.opacity = 0.55 * (1 - d / 1.6); } });
    const burn = ss(tTr - 0.3, tPar, t) * (1 - ss(tAu, tJu + 0.8, t));
    O.tower.mats.forEach(m => m.emissive.setRGB(1, 1 - 0.88 * burn, 1 - 0.9 * burn));
    O.tower.split(ss(tPar, tPar + 0.6, t) * (1 - ss(tVa - 0.4, tJu + 0.7, t)));
    O.flow.share = () => 0; O.flow.lock = tt => tt < tPar ? 1 : 0;
    O.led.set(t < tPar ? `${Math.round(92 + 7 * ss(tCu, tPar, t))}%` : t < tVa ? '--%' : '92%');
    O.lightning = K.flashes([tPa + 0.1, tPar]);
    // she warns with a raised finger, then watches with her hands behind her back; the smile comes back at the end
    const p = t < tCu - 0.2 ? K.warn(t, 10, ss(L[0].t0 - 0.3, L[0].t0 + 0.2, t)) : K.mix(K.warn(t, 10, 1), K.behind(t, 10), ss(tCu - 0.2, tCu + 0.4, t));
    K.act(rud, p, t, t > tJu ? K.FACE.smug : t < tCu ? { ...K.FACE.talk(true, 0), eye: 0.15 } : K.FACE.smugTalk(t < L[3].t1));
    O.tv.draw('b' + Math.round(t * 24), (x, W, H) => t < tAT - 0.25 ? SC.breakup(x, W, H, ss(tSt, tPed + 0.4, t), 'STANDARD OIL', 1911, 34)
      : t < tMx - 0.3 ? SC.breakup(x, W, H, ss(tAT, tSie + 0.4, t), 'AT&T', 1984, 7) : SC.mexico(x, W, H, ss(tMx - 0.2, tAnti + 0.3, t)));
    return K.stamp(t + ctx.start);
  };
  const sfx = [
    { t: tPa + 0.1, type: 'thunder', vol: 0.75 },
    { t: tTr - 0.3, type: 'drone', dur: 2.6, vol: 0.35 }, { t: tPar, type: 'thunder', vol: 0.9 }, { t: tPar + 0.02, type: 'shatter', vol: 0.75 },
    { t: tSt - 0.25, type: 'crt', vol: 0.28 }, { t: tSt + 0.4, type: 'crack', vol: 0.3 }, { t: tAT + 0.2, type: 'crack', vol: 0.3 },
    { t: tMx - 0.2, type: 'beep', vol: 0.18 }, { t: tVa - 0.4, type: 'reverse', vol: 0.45 }, { t: tJu + 0.6, type: 'thud', vol: 0.4 },
  ];
  const shots = [
    { t0: 0, set: O, p0: [0.12, 1.36, 0.08], l0: [-0.02, 1.32, -0.82], p1: [0.1, 1.36, -0.05], l1: [-0.02, 1.32, -0.82], fov0: 44, act },
    { t0: tCu - 0.25, set: O, p0: [0.6, 1.7, 1.75], l0: [0.25, 0.95, -0.2], p1: [0.5, 1.55, 1.5], l1: [0.3, 1.0, -0.25], fov0: 52, act },
    { t0: tSt - 0.3, set: O, p0: tv.p, l0: tv.l, p1: tv.p.map((v, i) => v + (tv.l[i] - v) * 0.12), l1: tv.l, fov0: 50, act },
    { t0: tAu - 0.3, set: O, p0: [1.1, 1.05, 0.55], l0: [0.5, 1.12, -0.32], p1: [0.85, 1.1, 0.72], l1: [0.45, 1.15, -0.35], fov0: 50, ease: 'inOut', act },
  ];
  const inst = { scene: O, scenes: [O], sfx, capY: K.capLow([[tSt - 0.3, tAu - 0.3]]) };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
