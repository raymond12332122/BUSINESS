import * as THREE from 'three';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import { run, wt } from '../../whatif/shots.js';
const { ss } = K;

// "Y entonces, sólo entonces... suba los precios": the price tag climbs $10 > $14 > $19 and a red line climbs the
// tower. "¿A dónde más van a ir?": from inside the dome, three figurines look up at her through the glass.
export function build(ctx) {
  const L = ctx.L;
  const tSo = wt(L[0], 'sólo'), tSu = wt(L[0], 'suba'), tPr = wt(L[0], 'precios'), tDo = wt(L[1], 'dónde');
  const O = S.office(), rud = K.host(O);
  const dome = P.dome(0.92, 0.95); dome.scale.set(1, 1, 0.62); dome.position.set(0, K.TOP, 0); O.add(dome);
  const lock = P.icon('candado', 0.1); lock.position.set(0, K.TOP + 0.5, 0.58); O.add(lock);
  // red rising line up the tower's front face (a thin tube revealed from the bottom)
  const pts = []; for (let i = 0; i <= 14; i++) { const u = i / 14; pts.push(new THREE.Vector3(0.55 + 0.06 * Math.sin(i * 1.9) * (1 - u * 0.5), K.TOP + 0.02 + u * 0.62 + 0.02 * Math.sin(i * 3.1), -0.3 + 0.105)); }
  const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.2), 120, 0.004, 5, false);
  const red = new THREE.Mesh(tube, new THREE.MeshBasicMaterial({ color: '#ff2a2a', toneMapped: false })); red.userData.dynamic = true; O.add(red);
  const nIdx = tube.index.count;
  const folk = [['oguri', -0.3, 0.2, 0.3], ['tamamo', -0.2, 0.2, -0.1], ['doto', -0.12, 0.2, -0.4]].map(([w, x, z, y], i) => { const r = K.figurine(O.city, w, x, z, Math.PI + y); r.i = i; return r; });
  O.tagUs.position.set(0.4, 0, -0.12);
  const act = t => {
    const k = ss(tSu - 0.1, tPr + 0.7, t); tube.setDrawRange(0, Math.floor(nIdx * k / 3) * 3); red.visible = k > 0.001;
    O.tagUs.set(t < tSu ? '$10' : t < tPr ? '$14' : '$19', t < tPr ? '#f2c14e' : '#ff4a4a');
    O.led.set('92%'); O.flow.share = () => 0; O.flow.lock = () => 1;
    folk.forEach(r => { const p = K.mix(K.behind(t, r.i + 2), K.behind(t, r.i + 2), 0); p.look = [0, 1.6, -0.9]; p.lookW = ss(tDo - 0.6, tDo, t); K.act(r, p, t, { mouth: 'neutral', eye: t > tDo ? 'flat' : undefined }); });
    const p = K.steeple(t, 9); K.act(rud, p, t, t > L[1].t1 ? K.FACE.smug : K.FACE.smugTalk(t > L[0].t0));
    return K.stamp(t + ctx.start);
  };
  const sfx = [
    { t: tSu, type: 'register', vol: 0.55 }, { t: tPr, type: 'register', vol: 0.6 }, { t: tSu - 0.1, type: 'rise', vol: 0.35 },
    { t: tDo - 0.3, type: 'drone', dur: 2.2, vol: 0.32 },
  ];
  const shots = [
    { t0: 0, set: O, p0: [0.86, 0.96, 0.5], l0: [0.44, 0.98, -0.2], p1: [0.84, 1.04, 0.42], l1: [0.5, 1.3, -0.27], fov0: 52, ease: 'inOut', act },
    { t0: tDo - 0.3, set: O, p0: [0.06, 0.875, 0.5], l0: [0.0, 1.25, -0.82], p1: [0.06, 0.88, 0.42], l1: [0.0, 1.28, -0.82], fov0: 58, act },
  ];
  const inst = { scene: O, scenes: [O], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
