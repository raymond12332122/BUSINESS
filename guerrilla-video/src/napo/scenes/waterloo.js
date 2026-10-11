import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as F from '../../lib/fx.js';
import { ss, clamp } from '../../lib/util.js';
import { badge } from '../../lib/kit.js';
import * as N from '../props.js';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as FX from '../fx.js';
import * as A from '../../mx/anim.js';
import { horse, animateHorse, ridePose, seat } from '../horse.js';
import { Troop } from '../troops.js';
import { runShots, wt } from '../../mx/shots.js';
import { film, nameplate, stamp } from '../../mx/ui.js';
import { mapSet, city, fade, GM } from '../mapkit.js';

export { preload } from '../mapkit.js';
const CITY = GM.CITY;

export function build(ctx) {
  const L = ctx.L;
  const tEsc = wt(L[0], 'escapo'), tDes = wt(L[0], 'desembarco'), tEje = wt(L[0], 'ejercito'), tVol = wt(L[0], 'volvio'), tGob = wt(L[0], 'goberno'), tCien = wt(L[0], 'cien');
  const tWat = wt(L[1], 'waterloo'), tBri = wt(L[1], 'britanicos'), tWel = wt(L[1], 'wellington'), tPru = wt(L[1], 'prusianos'), tBlu = wt(L[1], 'blucher');
  const tDef = wt(L[2], 'derrota'), tSta = wt(L[2], 'santa'), tAtl = wt(L[2], 'atlantico'), tMur = wt(L[2], 'murio');

  // ---- 1. Night escape from Elba
  const Ns = S.nightSea();
  const brig = N.brig(5); brig.rotation.y = Math.PI / 2 + 0.3; Ns.add(brig);
  // ---- 2. Laffrey: the soldiers join him
  const La = S.laffrey();
  const napL = K.person(La, 'napoleon', 'napoleon', 0.3, 2.5, Math.PI);
  const sold = [-1.8, -0.9, 0, 0.9, 1.8].map((x, i) => K.person(La, ['oguri', 'doto', 'helios', 'tamamo', 'daiwa'][i], 'fusilier', x, -2.2, 0));
  const royal = N.flag('bourbon', 2.4, 1.0, 0.65); royal.position.set(2.6, 0, -2.8); La.add(royal);
  const tri = N.flag('fr', 2.4, 1.0, 0.65); tri.position.set(2.6, 0, -2.8); La.add(tri);
  // ---- 3. The Hundred Days (map)
  const M = mapSet({ per: '1815' });
  const route = GM.arrow([CITY['Cannes'], CITY['Grenoble'], CITY['Lyon'], CITY['París']], '#2f4590', 0.5); M.add(route);
  // ---- 4-6. Waterloo
  const W = S.waterloo('overcast');
  const reds = [[-6, -14], [0, -15], [6, -14]].map(([x, z], i) => { const tr = new Troop(W, { rows: 3, cols: 9, seed: 300 + i, coat: '#b3262a', hat: 'shako', plume: null, belts: '#f4f1ea' }); tr.x = x; tr.z = z; return tr; });
  const blues = [[-5, 2], [1, 3], [7, 2]].map(([x, z], i) => { const tr = new Troop(W, { rows: 5, cols: 7, seed: 310 + i, coat: '#2f4590', hat: 'shako' }); tr.x = x; tr.z0 = z; return tr; });
  const wv = new FX.Volleys(W, { size: 1.0, life: 5, drift: [0.4, 0.2, 0], flashSize: 0.8 });
  reds.forEach((r, i) => { for (let k = 0; k < 3; k++) wv.volley(tWat - 0.2 + i * 0.3 + k * 1.3, [...Array(8)].map((_, j) => [r.x - 2.8 + j * 0.8, 0.95, r.z + 1.2]), [0, 0, 1], 0.03, { puffs: 1, size: 1.2 }); });
  const wHz = horse({ coat: '#7a5232', mane: '#2a1d14', cloth: '#8a1f2a', trim: '#d4af37', seed: 31 }); wHz.position.set(2.5, 0, -10.5); wHz.rotation.y = -1.0; W.add(wHz);
  const well = K.person(W, 'wellington', 'wellington', 0, 0, 0);
  const bHz = horse({ coat: '#3a2a1e', mane: '#1d1814', cloth: '#232f4f', trim: '#e8e4dc', seed: 32 }); bHz.position.set(-22, 0, -6); bHz.rotation.y = Math.PI / 2 - 0.3; W.add(bHz);
  const blu = K.person(W, 'blucher', 'blucher', 0, 0, 0);
  const prus = [[-27, -5], [-30, -9]].map(([x, z], i) => { const tr = new Troop(W, { rows: 4, cols: 8, seed: 320 + i, coat: '#232f4f', hat: 'shako', plume: null }); tr.x = x; tr.z = z; return tr; });
  const prFlag = N.flag('pr', 2.6, 1.1, 0.7); W.add(prFlag);
  const haze = FX.haze(W, { n: 14, box: [-25, 25, 1, 5, -24, -2], color: '#d4d0c8', size: 10, opacity: 0.2 });
  // ---- 7. Defeat at dusk
  const Df = S.field('dusk', { ground: ['#7a7a52', '#6a6a48'], seed: 330, smoke: true });
  const dHz = horse({ coat: '#efeae2', mane: '#ddd6c8', cloth: '#2a3f8f', seed: 33 }); dHz.position.set(0, 0, 0); dHz.rotation.y = 0.9; Df.add(dHz);
  const napD = K.person(Df, 'napoleon', 'napoleon', 0, 0, 0);
  const guard = new Troop(Df, { rows: 4, cols: 10, seed: 340, coat: '#25336b', hat: 'bearskin' });
  const dHaze = FX.haze(Df, { n: 14, box: [-20, 20, 1, 5, -18, 2], color: '#b8a8a0', size: 10, opacity: 0.35 });
  // ---- 8-9. Saint Helena
  const SH = S.stHelena();
  const napH = K.person(SH, 'napoleon', 'napoleon', 0, 0, Math.PI);
  const hN = SH.island.heightAt(-0.6, -10.8), hC = Math.max(SH.island.heightAt(0.9, -6.4), SH.island.heightAt(0.6, -7.4), hN);

  const sfx = [{ t: 0.1, type: 'waves', dur: tDes, vol: 0.6 }, { t: tDes - 0.2, type: 'drums', dur: 2.0, vol: 0.4 }, { t: tVol + 0.3, type: 'cheer', vol: 0.8 },
    { t: tGob - 0.2, type: 'whoosh', vol: 0.5 }, ...wv.times().filter((t, i) => i % 4 === 0).map(t => ({ t, type: 'volley', vol: 0.5 })), { t: tWat - 0.3, type: 'cannon', vol: 0.6 },
    { t: tPru - 0.3, type: 'march', dur: 2.4, vol: 0.5 }, { t: tDef - 0.1, type: 'sting2', vol: 0.6 }, { t: tSta - 0.4, type: 'waves', dur: ctx.dur - tSta, vol: 0.6 }, { t: tSta, type: 'wind', dur: ctx.dur - tSta, vol: 0.4 }];

  const tL = tDes - 0.2, tM = tGob - 0.2, tW = L[1].t0 - 0.15, tWe = tWel - 0.6, tBl = tPru - 0.4, tD = tDef - 0.25, tS = tSta - 0.35, tS2 = tMur - 0.6;
  const shots = [
    { t0: 0, set: Ns, p0: [-5, 2.0, 10], l0: [2, 1.8, -6], p1: [-3.5, 2.0, 8.5], l1: [4, 1.8, -8], fov0: 40, act: (t) => {
      brig.position.set(-4 + t * 2.2, 0.05 * Math.sin(t * 1.2), -4 - t * 0.8); brig.wave(t); Ns.sea.wave(t);
      return film(t) + badge(t, 'Febrero de 1815', 'Napoleón escapa de Elba', 'Con unos mil hombres, en secreto y de noche', 0.4, tL - 0.1);
    } },
    { t0: tL, set: La, p0: [-2.6, 1.3, 5.6], l0: [0.4, 0.9, -2.0], p1: [-2.2, 1.25, 4.6], l1: [0.4, 0.9, -2.0], fov0: 38, act: (t) => {
      const walk = clamp((t - tL) / 2.4); napL.root.position.z = 2.5 - walk * 2.2; K.pose(napL, walk < 1 ? C.walk(t, 0.6, 1) : A.proud(t, 1)); napL.setFace(C.blinkEye(t, 1), 'neutral');
      const join = t > tVol - 0.1;
      sold.forEach((s, i) => { K.pose(s, join ? { ...C.cheer(t + i * 0.2, i), gun: 'none' } : { ...C.aim(t, 0, 0), gun: 'aim' }); s.setFace(join ? 'happy' : 'squint', join ? 'teeth' : 'neutral'); });
      royal.visible = !join; tri.visible = join; royal.wave(t); tri.wave(t);
      return film(t) + badge(t, 'Marzo de 1815', '«¡Soldados, aquí está su emperador!»', 'Las tropas enviadas a detenerlo se pasan a su lado', tEje - 0.2, tM - 0.1);
    } },
    { t0: tM, set: M, p0: [-6.8, 13, 13], l0: [-6.8, 0, 3.0], p1: [-6.8, 12, 11.5], l1: [-6.8, 0, 2.6], fov0: 38, act: (t) => {
      route.set(clamp((t - tM - 0.2) / 1.6));
      return film(t) + city(ctx, M, 'Cannes', fade(t, tM, tW), 'c') + city(ctx, M, 'Grenoble', fade(t, tM + 0.5, tW), 'c') + city(ctx, M, 'Lyon', fade(t, tM + 0.9, tW), 'c') + city(ctx, M, 'París', fade(t, tM + 1.4, tW), 'c big')
        + badge(t, 'Marzo – junio de 1815', 'Los Cien Días', 'Napoleón vuelve a gobernar Francia', tCien - 0.4, tW - 0.1);
    } },
    { t0: tW, set: W, p0: [-9, 4.5, 11], l0: [1, 1.0, -10], p1: [-7.5, 4.0, 9], l1: [1, 1.0, -10], fov0: 40, act: (t) => waterloo(t)
        + badge(t, '18 de junio de 1815', 'La batalla de Waterloo', 'Hoy en Bélgica', tWat - 0.2, tWe - 0.1) },
    { t0: tWe, set: W, p0: [5.5, 1.85, -6.6], l0: [2.3, 1.4, -10.8], p1: [5.1, 1.8, -7.1], l1: [2.3, 1.4, -10.8], fov0: 36, act: (t) => waterloo(t)
        + nameplate(ctx, [2.5, 2.1, -10.5], 'Duque de Wellington', 'Ejército británico', tWel - 0.2, tBl + 0.2) },
    { t0: tBl, set: W, p0: [-18.5, 1.7, -2.4], l0: [-21.5, 1.35, -6.0], p1: [-18.9, 1.65, -2.9], l1: [-21.5, 1.35, -6.0], fov0: 38, act: (t) => waterloo(t)
        + nameplate(ctx, [bHz.position.x, 2.1, bHz.position.z], 'Gebhard von Blücher', 'Ejército prusiano', tBlu - 0.25, tD + 0.2) },
    { t0: tD, set: Df, p0: [1.8, 1.1, 3.4], l0: [-0.2, 1.3, -1.0], p1: [1.5, 1.08, 2.9], l1: [-0.2, 1.3, -1.0], fov0: 38, act: (t) => {
      animateHorse(dHz, t, 'stand', { seed: 9 }); const p = ridePose(t, 9); p.head = [12, 0, 0]; K.pose(napD, p); seat(napD, dHz); napD.setFace('flat', 'frown');
      guard.update(t, { x: -2, z: -9 - (t - tD) * 0.6, yaw: Math.PI, march: 1, speed: 0.8, tired: 0.4 }); dHaze(t); S.aimSun(Df, 0, -2);
      return film(t) + stamp(t, 'DERROTA<br>DEFINITIVA', tDef + 0.2, tS, { x: 1400, y: 300, rot: -8, color: '#7a1f1f' });
    } },
    { t0: tS, set: SH, p0: [62, 3.0, 95], l0: [0, 4, 0], p1: [55, 3.2, 84], l1: [0, 4, 0], fov0: 36, act: (t) => {
      SH.sea.wave(t); napH.root.visible = false;
      return film(t) + badge(t, '1815', 'Santa Elena', 'Una isla en medio del Atlántico, a casi 2 000 km de África', tSta, tS2 - 0.1);
    } },
    { t0: tS2, set: SH, p0: [1.0, hC + 1.15, -6.0], l0: [-1.2, hN + 0.4, -24], p1: [0.9, hC + 1.1, -6.8], l1: [-1.2, hN + 0.4, -24], fov0: 38, act: (t) => {
      napH.root.visible = true; napH.root.position.set(-0.6, hN - 0.05, -10.8); napH.root.rotation.y = Math.PI + 0.25;
      const p = A.sad(t, 4); p.head = [4, 0, 0]; K.pose(napH, p); napH.setFace('flat', 'frown'); SH.sea.wave(t);
      return film(t) + badge(t, '5 de mayo de 1821', 'Muere en el exilio', 'Tenía 51 años', tMur - 0.1, ctx.dur);
    } },
  ];
  function waterloo(t) {
    const adv = clamp((t - tW) / 6);
    blues.forEach(tr => { const z = tr.z0 - adv * 7; tr.update(t, { x: tr.x, z, yaw: Math.PI, march: adv < 1 ? 1 : 0, speed: 1.1 }); });
    reds.forEach(tr => tr.update(t, { x: tr.x, z: tr.z, yaw: 0 }));
    animateHorse(wHz, t, 'stand', { seed: 3 }); { const p = ridePose(t, 3); p.head = [0, 35, 0]; K.pose(well, p); } seat(well, wHz); well.setFace(C.blinkEye(t, 3), 'neutral');
    const come = clamp((t - tPru + 0.6) / 2.4);
    bHz.position.x = -22 + come * 3.0; animateHorse(bHz, t, come > 0 && come < 1 ? 'trot' : 'stand', { seed: 4 }); { const p = ridePose(t, 4, come > 0 && come < 1 ? 0.6 : 0); K.pose(blu, p); } seat(blu, bHz); blu.setFace(C.blinkEye(t, 4), 'shout');
    prus.forEach(tr => tr.update(t, { x: tr.x + come * 3.0, z: tr.z, yaw: Math.PI / 2, march: come > 0 && come < 1 ? 1 : 0 }));
    prFlag.position.set(-25.5 + come * 3.0, 0, -7.0); prFlag.wave(t);
    wv.update(t); haze(t); S.aimSun(W, 0, -6);
    return film(t);
  }
  const inst = { scene: Ns, scenes: [Ns, La, M, W, Df, SH], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
