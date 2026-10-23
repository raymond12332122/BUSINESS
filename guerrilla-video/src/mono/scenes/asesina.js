import * as THREE from 'three';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as SC from '../screens.js';
import * as P from '../props.js';
import * as A from '../../whatif/anim.js';
import { run, wt } from '../../whatif/shots.js';
const { ss } = K;

// "Y después... apague su app": the garage goes dark; the PÉTALO file goes into the drawer of bought-and-buried
// startups; on the desk, seven red pills out of a hundred sink into the tray (the pharma killer acquisitions).
export function build(ctx) {
  const L = ctx.L;
  const tAp = wt(L[0], 'apague'), tApp = wt(L[0], 'app');
  const tEc = wt(L[1], 'economistas'), tAd = wt(L[1], 'adquisiciones'), tAs = wt(L[1], 'asesinas');
  const tFa = wt(L[2], 'farmac'), tSi = wt(L[2], 'siete'), tEn = wt(L[2], 'enterrar'), tRi = wt(L[2], 'rival');
  const O = S.office(), tv = K.tvShot(O, 0.98, 0.02, 0.04);
  const girls = [['spe', -0.75, 0.44], ['daiwa', -0.67, 0.47], ['suzuka', -0.59, 0.48], ['cafe', -0.51, 0.47], ['hishi', -0.43, 0.44]]
    .map(([w, x, z], i) => { const r = K.figurine(O.city, w, x, z, 0.1 * (2 - i)); r.i = i; return r; });
  // Rudolf at the ADQ cabinet (the third, z = -1.61), facing it; the top drawer slides out towards her
  const cab = O.cabinets[2], rud = K.host(O, 2.42, -1.61, Math.PI / 2);
  const names = ['NUBE AZUL', 'KIWIPAGO', 'LUMEN', 'MAPACHE', 'BOTICA+', 'ÓRBITA', 'TACO.APP'];
  const old = P.folders(names, 0.42, 0.46); cab.drawers[0].body.add(old); old.position.y = 0.0;
  const pet = P.folders(['PÉTALO'], 0.42, 0.02); O.add(pet); pet.userData.dynamic = true;
  const drawerTop = new THREE.Vector3(2.66, 1.2, -1.61);
  // the pills under the banker's lamp
  const fileLight = new THREE.SpotLight('#cfdcff', 7, 4, 0.45, 0.7, 1.5); fileLight.position.set(2.2, 2.9, -0.9); fileLight.target.position.set(2.65, 1.05, -1.6); O.add(fileLight, fileLight.target);
  const tray = P.pillTray(); tray.position.set(-2.18, O.deskTop + 0.001, -2.36); tray.rotation.y = 0.35; O.add(tray);
  const act = t => {
    const off = ss(tAp - 0.05, tApp + 0.2, t), flick = t > tAp - 0.05 && t < tApp + 0.25 ? (Math.sin(t * 61) > 0 ? 1 : 0.2) : 1;
    O.garage.light((1 - off) * flick); O.tagThem.visible = t < tApp; O.flow.share = () => 0.02;
    girls.forEach(r => { const p = A.stand(t, r.i + 1); p.head = [p.head[0] + 22 * off, p.head[1], p.head[2]]; K.act(r, p, t, { mouth: 'neutral', eye: off > 0.5 ? 'flat' : undefined }); });
    O.led.set('80%');
    // the file: shown in her hand, then lowered into the drawer; the drawer opens before and slams after
    const open = ss(tEc - 0.6, tEc, t) * (1 - ss(tFa - 0.7, tFa - 0.45, t)); cab.open(0, 0.5 * open);
    const lower = ss(tAs - 0.1, tAs + 0.5, t), fp = new THREE.Vector3(2.6, 1.08, -1.58).lerp(new THREE.Vector3(2.7, 0.98, -1.61), lower);
    pet.position.copy(fp); pet.rotation.set(0, Math.PI / 2, 0); pet.visible = t > tEc - 0.4 && t < tFa - 0.5;
    if (t > tAs + 0.5) { pet.position.x = 2.62 - 0.5 * (1 - open) * 0; }
    const hold = ss(tEc - 0.4, tEc - 0.1, t) * (1 - ss(tAs + 0.45, tAs + 0.75, t));
    const p = K.handTo(t, 6, 'R', [fp.x - 0.02, fp.y + 0.085, fp.z + 0.05], hold, { base: tt => K.behind(tt, 6), hand: A.HAND.grip, look: drawerTop.toArray() });
    if (t > tAs - 0.25 && t < tFa) { p.look = [2.53, 1.41, -0.7]; p.lookW = ss(tAs - 0.25, tAs + 0.15, t); }
    K.act(rud, p, t, t > tAs + 0.3 ? K.FACE.smug : K.FACE.smugTalk(t > L[1].t0 && t < L[1].t1));
    tray.bury(ss(tEn - 0.1, tRi + 0.4, t));
    O.tv.draw('d' + Math.round(t * 24), (x, W, H) => SC.discontinued(x, W, H, ss(tApp - 0.1, tApp + 0.6, t)));
    return K.stamp(t + ctx.start)
      + K.tag(t, tAd - 0.1, tFa - 0.3, 'LOS ECONOMISTAS LES DICEN', '«killer acquisitions»', { col: '#e8484a' })
      + K.tag(t, tSi - 0.2, ctx.dur, 'ESTUDIO DE 2021 · FARMACÉUTICAS', 'hasta 7 de cada 100 compras', { col: '#e8484a' });
  };
  const sfx = [
    { t: tAp - 0.05, type: 'buzzoff', vol: 0.5 }, { t: tApp + 0.1, type: 'crt', vol: 0.25 }, { t: tEc - 0.6, type: 'drawer', vol: 0.5 },
    { t: tAs, type: 'sting', vol: 0.32 }, { t: tFa - 0.7, type: 'drawer', vol: 0.4 }, { t: tFa - 0.45, type: 'thud', vol: 0.55 },
    { t: tSi, type: 'tick', vol: 0.3 }, { t: tEn, type: 'drone', dur: 2.5, vol: 0.3 },
  ];
  const shots = [
    { t0: 0, set: O, p0: [-0.5, 0.9, 0.95], l0: [-0.6, 0.86, 0.41], p1: [-0.53, 0.89, 0.86], l1: [-0.6, 0.86, 0.42], fov0: 58, act },
    { t0: tApp + 0.05, set: O, p0: tv.p, l0: tv.l, fov0: 50, act },
    { t0: tEc - 0.3, set: O, p0: [2.52, 1.42, -0.66], l0: [2.56, 1.16, -1.62], p1: [2.54, 1.4, -0.8], l1: [2.58, 1.14, -1.62], fov0: 52, act },
    { t0: tAs + 0.35, set: O, p0: [2.66, 1.64, -1.28], l0: [2.72, 1.04, -1.62], p1: [2.68, 1.58, -1.34], l1: [2.73, 1.03, -1.62], fov0: 50, act },
    { t0: tFa - 0.3, set: O, p0: [-1.85, O.deskTop + 0.5, -1.98], l0: [-2.18, O.deskTop, -2.36], p1: [-1.95, O.deskTop + 0.38, -2.07], l1: [-2.18, O.deskTop, -2.36], fov0: 46, ease: 'out', act },
  ];
  const inst = { scene: O, scenes: [O], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
