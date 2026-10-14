import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as A from '../anim.js';

export async function preload() {}
const fz = (arr, poseFn, keep = () => false, face = 'neutral') => arr.forEach((c, i) => { if (keep(i)) return; c.setFace('open', face); K.freeze(c, poseFn(i)); });

export function build(ctx) {
  const L = ctx.L;
  const tRom = wt(L[0], 'romper'), tArm = wt(L[0], 'armas'), tAbr = wt(L[0], 'abril'), tYp = wt(L[0], 'ipres'), tGas = wt(L[0], 'gas'), tEsc = wt(L[0], 'escala');
  const tAv = wt(L[1], 'aviones'), tZep = wt(L[1], 'zepelines'), tSub = wt(L[1], 'submarinos'), tDiec = wt(L[1], 'dieciseis'), tTanq = wt(L[1], 'tanques'), tBrit = wt(L[1], 'britanicos');
  const tArt = wt(L[2], 'artilleria'), tCan = wt(L[2], 'canones'), tMay = wt(L[2], 'mayoria'), tHer = wt(L[2], 'heridas');

  // ---- 1-2. Ypres, April 1915: the gas cloud
  const G = S.trenchWF('gas', { seed: 751 }); const Y = G.Y;
  const cloud = P.gasCloud(G, { n: 50, w: 30, size: 3.8, opacity: 0.78, color: '#c6cf5a' });
  const masked = [['oguri', 'poiluMask', -1.6], ['doto', 'tommyMask', -0.5], ['helios', 'poiluMask', 0.6], ['suzuka', 'tommyMask', 1.7]].map(([w, o, x], i) => { const c = K.person(G, w, o, x, -0.62, Math.PI); c.root.position.y = 0.8; return c; });
  // ---- 3. dogfight
  const Sk = S.skyStage('day');
  const fok = P.warplane({ kind: 'tri', color: '#b8241e', cross: true }), sop = P.warplane({ kind: 'biplane', color: '#8a7a4a' });
  Sk.add(fok, sop); fok.userData.dynamic = sop.userData.dynamic = true;
  const tracer = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 3, 4), new THREE.MeshBasicMaterial({ color: '#ffe08a' })); Sk.add(tracer); tracer.userData.dynamic = true;
  // ---- 4. zeppelin over a city at night
  const Nc = S.nightCity();
  const zep = P.zeppelin(26); zep.position.set(-10, 26, -40); zep.userData.dynamic = true; Nc.add(zep);
  // ---- 5. U-boat
  const Sea = S.seaStage('overcast', { color: '#3a5462' });
  const ub = P.uboat(); ub.scale.setScalar(1.4); ub.position.set(0, -0.2, -14); ub.userData.dynamic = true; Sea.add(ub);
  // ---- 6. the first tanks, the Somme, September 1916
  const Tk = S.craterField('overcast', { n: 90, depth: 0.45, stumps: 26, seed: 761 });
  const tank = P.markTank('#6a6448'); tank.scale.setScalar(0.62); tank.userData.dynamic = true; Tk.add(tank);
  const inf = [0, 1, 2, 3].map(i => K.person(Tk, ['oguri', 'doto', 'helios', 'tamamo'][i], 'tommy', -1.5 + i * 1.0, 4 + (i % 2) * 0.8, Math.PI));
  inf.forEach(c => { c.x0 = c.root.position.x; c.z0 = c.root.position.z; });
  // ---- 7. artillery
  const Bt = S.battery('overcast', { n: 3 });
  const crew = [[-8, -2.2], [0, -2.2], [8, -4.2]].map(([x, z], i) => K.person(Bt, ['cafe', 'mcqueen', 'daiwa'][i], 'poilu', x + 1.6, z + 1.2, -Math.PI / 2 - 0.3));
  const flashes = Bt.guns.map(g => { const l = new THREE.PointLight('#ffb060', 0, 14, 1.5); Bt.add(l); return l; });
  const fireT = [tArt - 0.2, tArt + 0.6, tCan, tCan + 0.9, tMay, tHer + 0.3];

  const tB = tAbr - 0.35, tC = L[1].t0 - 0.35, tD = tZep - 0.3, tE = tSub - 0.3, tF = tDiec - 0.3, tG = L[2].t0 - 0.35;
  const sfx = [{ t: 0, type: 'wind', dur: tC, vol: 0.3 }, { t: 0.5, type: 'hiss', dur: tC - 0.5, vol: 0.35 }, { t: tGas, type: 'tension', vol: 0.35 }, { t: tYp, type: 'sting2', vol: 0.35 },
    { t: tC, type: 'plane', dur: tD - tC + 0.3, vol: 0.45 }, { t: tC + 0.5, type: 'mg', dur: 1.2, vol: 0.3 }, { t: tD, type: 'siren', dur: tE - tD, vol: 0.3 }, { t: tD + 0.2, type: 'drone', dur: tE - tD, vol: 0.3 },
    { t: tE, type: 'waves', dur: tF - tE, vol: 0.4 }, { t: tE + 0.2, type: 'bubbling', dur: tF - tE, vol: 0.2 }, { t: tF, type: 'engine', dur: tG - tF, vol: 0.45 }, { t: tF + 0.2, type: 'clank', vol: 0.35 },
    ...fireT.map((x, i) => ({ t: x, type: i % 2 ? 'cannon' : 'bigboom', vol: 0.5 }))];

  const shots = [
    { t0: 0, set: G, p0: [0.4, Y + 1.0, -0.4], l0: [0, Y + 0.6, -30], p1: [0.4, Y + 1.0, -1.2], l1: [0, Y + 0.6, -30], fov0: 46, act: (t) => {
      G.tick(t); cloud.update(t, -24 + t * 2.2, ss(0.2, 1.6, t));
      return U.film(t) + U.big(t, tArm - 0.3, tB + 0.3, 'Armas nuevas', { top: 110, size: 66 });
    } },
    { t0: tB, set: G, p0: [2.0, 1.85, -3.6], l0: [0.0, 1.3, -0.6], p1: [1.7, 1.8, -3.2], l1: [0.0, 1.3, -0.6], fov0: 46, act: (t) => {
      G.tick(t); const u = t - tB; cloud.update(t, -2.5 + u * 0.7, 1);
      masked.forEach((c, i) => { K.pose(c, { ...C.idle(t, i, 0.3), gun: 'port', head: [-4, 0, 0] }); });
      return U.film(t) + U.tint('#b8c46a', 0.18 + 0.18 * ss(tGas, tEsc, t)) + U.badge(t, 'Ypres · 22 de abril de 1915', 'Gas de cloro', 'El primer ataque con gas a gran escala', tYp - 0.3, tC);
    } },
    { t0: tC, set: Sk, p0: [0, 21.5, 9], l0: [0, 24, -6], p1: [1.5, 21.8, 8], l1: [0.5, 24, -6], fov0: 50, act: (t) => {
      Sk.tick(t); const u = t - tC, a = u * 0.95 - 0.6;
      sop.position.set(Math.sin(a) * 6, 24 + Math.sin(u * 1.3) * 1.0, -6 + Math.cos(a) * 3.5); sop.rotation.set(0, a + Math.PI / 2, -0.5);
      const b = a - 0.6; fok.position.set(Math.sin(b) * 6.6, 23.6 + Math.sin(u * 1.3 - 0.6) * 1.0, -6 + Math.cos(b) * 3.9); fok.rotation.set(0, b + Math.PI / 2, -0.55);
      sop.prop.rotation.z = t * 40; fok.prop.rotation.z = t * 40;
      tracer.visible = Math.sin(t * 30) > 0.3; tracer.position.copy(fok.position).lerp(sop.position, 0.5); tracer.lookAt(sop.position); tracer.rotateX(Math.PI / 2);
      return U.film(t) + U.pin(ctx, [fok.position.x, fok.position.y + 1.2, fok.position.z], 'Fokker alemán', 'el «Barón Rojo» volaba uno así', ss(tAv, tAv + 0.3, t));
    } },
    { t0: tD, set: Nc, p0: [8, 4, 10], l0: [-6, 20, -40], p1: [8, 4.5, 8], l1: [-2, 21, -40], fov0: 44, act: (t) => {
      Nc.tick(t); const u = t - tD; zep.position.x = -10 + u * 1.8;
      Nc.beams.forEach((b, i) => { const ang = Math.sin(t * 0.5 + i * 1.7) * 0.35; S.aimBeam(b, new THREE.Vector3(Math.sin(ang) + (zep.position.x - b.position.x) * 0.02, 1, -0.3)); });
      return U.film(t) + U.pin(ctx, [zep.position.x, zep.position.y + 3, zep.position.z], 'Zepelín', 'bombardeos sobre Londres', ss(tZep - 0.1, tZep + 0.3, t));
    } },
    { t0: tE, set: Sea, p0: [6.5, 1.6, -4], l0: [0, 0.9, -14], p1: [6.0, 1.5, -5], l1: [0.5, 0.9, -14], fov0: 42, act: (t) => {
      Sea.tick(t); const u = t - tE; ub.position.x = -3 + u * 1.2; ub.position.y = -0.3 + 0.05 * Math.sin(t * 1.2); ub.rotation.z = 0.02 * Math.sin(t * 0.9);
      return U.film(t) + U.pin(ctx, [ub.position.x, 3.0, -14], 'Submarino alemán', 'U-Boot', ss(tSub - 0.1, tSub + 0.3, t));
    } },
    { t0: tF, set: Tk, p0: [6.5, 1.1, 0.5], l0: [0, 0.8, -0.5], p1: [6.0, 1.05, -0.5], l1: [0, 0.8, -1.8], fov0: 44, act: (t) => {
      Tk.tick(t); const u = t - tF; const z = 2 - u * 0.8; tank.position.set(0, Math.max(-0.05, Tk.heightAt(0, z)) + 0.05, z); tank.rotation.set(0.05 * Math.sin(u * 2), Math.PI / 2, 0);
      inf.forEach((c, i) => { const zz = c.z0 - u * 0.8; c.root.position.set(c.x0, Tk.heightAt(c.x0, zz), zz); K.pose(c, A.advance(t, i)); c.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.badge(t, '15 de septiembre de 1916', 'Los primeros tanques', 'británicos, en el Somme', tTanq - 0.3, tG);
    } },
    { t0: tG, set: Bt, p0: [5.5, 1.3, 1.5], l0: [-3, 1.1, -4.5], p1: [4.8, 1.25, 1.0], l1: [-3, 1.1, -4.5], fov0: 46, shake: t => fireT.some(ft => t > ft && t < ft + 0.25) ? 0.04 : 0, act: (t) => {
      Bt.tick(t);
      Bt.guns.forEach((g, i) => { const mine = fireT.filter((_, k) => k % 3 === i); let last = -9; for (const ft of mine) if (t >= ft) last = ft; g.recoil(t, last);
        const k = Math.max(0, 1 - (t - last) / 0.2); flashes[i].intensity = 80 * k; g.updateMatrixWorld(true); flashes[i].position.set(g.position.x - 1.6, 2.6, g.position.z); });
      crew.forEach((c, i) => { K.pose(c, A.cower(t, i)); c.setFace('closed', 'frown'); });
      return U.film(t) + U.counter(t, tCan - 0.3, ctx.dur + 1, 1220, 140, 60, 'de las heridas las causó la artillería', { from: 0, dur: 1.2, color: '#ff8a6a', prefix: '≈ ', suffix: ' %', w: 560 })
        + U.source(t, tHer, ctx.dur + 1, 'Heridas de la infantería británica; otras estimaciones dan dos tercios de todas las bajas');
    } },
  ];
  const inst = { scene: G, scenes: [G, Sk, Nc, Sea, Tk, Bt], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
