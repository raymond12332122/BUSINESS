import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as LP from '../../lib/props.js';
import * as F from '../../lib/fx.js';
import { ss, clamp } from '../../lib/util.js';
import { badge, label } from '../../lib/kit.js';
import * as X from '../props.js';
import * as K from '../kit.js';
import * as A from '../anim.js';
import { zocalo, interior, mxStage, aimSun } from '../sets.js';
import { runShots, wt } from '../shots.js';
import { film, nameplate } from '../ui.js';
import { mapSet, token, city, fade, GM } from '../mapkit.js';

export { preload } from '../mapkit.js';

const CITY = GM.CITY;
export function build(ctx) {
  const L = ctx.L;
  const tRomp = wt(L[1], 'rompieron'), tDic = wt(L[1], 'en$') - 0.2, tTom = wt(L[1], 'tomaron') - 0.4, tFoto = wt(L[1], 'foto'), tSilla = wt(L[1], 'silla');
  const tObr = wt(L[2], 'alvaro'), tCon = wt(L[2], 'con$') - 0.3, tTrin = wt(L[2], 'trincheras'), tAlam = wt(L[2], 'alambre'), tAmet = wt(L[2], 'ametralladoras');
  // ---- the convention: two camps face off across the table
  const Cv = interior({ wall: '#5a3a34', floor: '#4a3424', w: 12, d: 9, h: 4.6, lights: [[-2, 4, 0], [2, 4, 0]] });
  const tbl = new THREE.Group(); tbl.add(LP.at(LP.box(1.4, 0.06, 3.2, '#5a3a24'), 0, 0.5, 0)); for (const [x, z] of [[-0.6, -1.5], [0.6, -1.5], [-0.6, 1.5], [0.6, 1.5]]) tbl.add(LP.at(LP.box(0.06, 0.5, 0.06, '#4a2f1d'), x, 0.25, z));
  tbl.add(LP.at(LP.box(1.42, 0.3, 0.02, '#1f7a3a'), 0, 0.37, 1.6)); tbl.position.set(0, 0, -0.6); Cv.add(tbl);
  const flagCv = X.flag('mx', 3.6, 1.4, 0.85); flagCv.position.set(-0.4, 0, -4.2); Cv.add(flagCv);
  const vil = K.person(Cv, 'villa', 'villa', -1.15, 0.2, Math.PI / 2 - 0.45), zap = K.person(Cv, 'zapata', 'zapata', -1.15, -1.0, Math.PI / 2 - 0.25);
  const car = K.person(Cv, 'carranza', 'carranza', 1.15, 0.2, -Math.PI / 2 + 0.45), obr = K.person(Cv, 'obregon', 'obregon', 1.15, -1.0, -Math.PI / 2 + 0.25);
  const spark = F.bubble('⚡', { bg: null, font: 190 }); Cv.add(spark);
  // ---- map: the split
  const M = mapSet();
  const conv = ['Chihuahua', 'Durango', 'Zacatecas', 'Aguascalientes', 'Coahuila', 'San Luis Potosí', 'Guanajuato', 'Jalisco', 'Querétaro', 'Hidalgo', 'Michoacán', 'Nayarit', 'Sinaloa', 'Sonora', 'Baja California', 'Baja California Sur', 'Nuevo León', 'Colima'];
  const ev = [{ t: -1, names: ['Veracruz', 'Tamaulipas', 'Tabasco', 'Campeche', 'Yucatán', 'Quintana Roo', 'Chiapas', 'Oaxaca'], color: GM.FACTION.carrancista },
    { t: -1, names: conv, color: GM.FACTION.carrancista }, { t: -1, names: ['Morelos', 'Guerrero', 'Puebla', 'México', 'Ciudad de México', 'Tlaxcala'], color: GM.FACTION.carrancista },
    { t: tRomp - 0.1, names: conv, color: GM.FACTION.villista }, { t: tRomp + 0.2, names: ['Morelos', 'Guerrero', 'Puebla', 'México', 'Tlaxcala'], color: GM.FACTION.zapatista }, { t: tRomp + 0.6, names: ['Ciudad de México'], color: GM.FACTION.convencion }];
  const retreat = GM.arrow([CITY['Ciudad de México'], CITY['Puebla'], CITY['Orizaba'], CITY['Veracruz']], GM.ARROW.carrancista, 0.5); M.add(retreat);
  const vIn = GM.arrow([CITY['Aguascalientes'], CITY['León'], CITY['Querétaro'], CITY['Ciudad de México']], GM.ARROW.villista, 0.5); M.add(vIn);
  const zIn = GM.arrow([CITY['Cuernavaca'], CITY['Ciudad de México']], GM.ARROW.zapatista, 0.5); M.add(zIn);
  const carT = token(M, 'carranza', 'carranza', ...CITY['Veracruz'], 'carrancista', -0.6, 1.25);
  // ---- parade in the Zócalo
  const Z = zocalo('day');
  const pv = K.person(Z, 'villa', 'villa', -0.55, 0, 0), pz = K.person(Z, 'zapata', 'zapata', 0.55, 0, 0);
  const marchers = []; for (let i = 0; i < 10; i++) marchers.push(K.person(Z, ['doto', 'oguri', 'suzuka', 'helios', 'cafe'][i % 5], i % 2 ? 'zapatista' : 'rebelde', -1.6 + (i % 4) * 1.05, 0, 0));
  const lookers = []; for (let i = 0; i < 8; i++) lookers.push(K.person(Z, ['daiwa', 'mcqueen', 'tamamo', 'doto'][i % 4], 'politico', (i < 4 ? -4.6 : 4.6) + (i % 2) * (i < 4 ? -0.7 : 0.7), -6 + (i % 4) * 1.6, i < 4 ? Math.PI / 2 : -Math.PI / 2));
  // ---- the famous photo in the presidential chair
  const Ph = interior({ wall: '#7a2f2a', floor: '#5a3a24', w: 10, d: 8, h: 4.4, lights: [[-1.5, 3.8, 0.5], [1.5, 3.8, 0.5]] });
  const chair = X.chair(true); chair.scale.setScalar(1.25); chair.position.set(-0.45, 0, -1.6); Ph.add(chair);
  const chair2 = X.chair(false); chair2.position.set(0.6, 0, -1.6); Ph.add(chair2);
  const sv = K.person(Ph, 'villa', 'villa', -0.45, -1.45, 0); sv.root.position.y = 0.15; sv.hat.visible = false;
  const sz = K.person(Ph, 'zapata', 'zapata', 0.6, -1.45, -0.15); sz.root.position.y = 0.12;
  
  const back = Ph.children.length; const others = [0, 1, 2, 3].map(i => K.person(Ph, ['doto', 'oguri', 'suzuka', 'helios'][i], i % 2 ? 'zapatista' : 'rebelde', [-1.9, -1.2, 1.4, 2.1][i], -2.4, [0.3, 0.15, -0.15, -0.3][i]));
  const cam = X.photoCamera(); cam.position.set(1.75, 0, 1.2); cam.rotation.y = Math.PI + 0.75; Ph.add(cam);
  // ---- Celaya
  const Ce = mxStage('day', ['#b9a37a', '#a9936a'], { seed: 91 });
  Ce.add(X.sierra({ z: -90, depth: 40, height: 10, seed: 92, base: '#8a7a6a', top: '#a09080' }));
  LP.scatter(Ce, (r, i) => [X.mesquite(0.9 + r() * 0.4, i), X.shrub(0.7 + r() * 0.4, i, '#8a8a52'), X.agave(0.8, i)][i % 3], 50, [-35, -60, 35, -14], 93);
  for (let i = 0; i < 7; i++) { const sb = X.sandbags(6, 2); sb.position.set(-7.5 + i * 2.5, 0, 0); Ce.add(sb); }
  const wire = X.barbedWire(18); wire.position.set(0, 0, -1.9); Ce.add(wire);
  const mgs = [-4.4, 0.6, 5.6].map(x => { const m = X.machineGun(); m.position.set(x, 0.32, -0.25); m.rotation.y = Math.PI; Ce.add(m); return m; });
  const gunners = mgs.map((m, i) => K.person(Ce, ['oguri', 'tamamo', 'daiwa'][i], 'constitucionalista', m.position.x, 0.45, Math.PI));
  const obrC = K.person(Ce, 'obregon', 'obregon', 2.8, 0.7, Math.PI + 0.2);
  const riflemen = [-6.2, -2.4, 3.2, 7.0].map((x, i) => K.person(Ce, ['helios', 'doto', 'cafe', 'suzuka'][i], 'constitucionalista', x, 0.5, Math.PI));
  const villistas = []; for (let i = 0; i < 12; i++) villistas.push(K.person(Ce, ['doto', 'oguri', 'suzuka', 'helios', 'cafe', 'mcqueen'][i % 6], 'rebelde', -8 + i * 1.45, -22 - (i % 3) * 1.4, 0));
  const mgMuz = mgs.map(m => new F.Muzzle(m, 9)); mgMuz.forEach((m, i) => m.fire(L[2].t0 + 0.6 + i * 0.2, ctx.dur));
  const rMuz = riflemen.map(r => new F.Muzzle(r.gun, 2)); rMuz.forEach((m, i) => m.fire(L[2].t0 + 1.0 + i * 0.3, ctx.dur));
  const cBooms = [[1.4, [-5, 0, -16]], [2.6, [2, 0, -19]], [3.8, [6, 0, -14]], [5.0, [-2, 0, -20]], [6.3, [4, 0, -17]], [7.6, [-6, 0, -18]]].map(([d, p], i) => new F.Explosion(Ce, p, L[2].t0 + d, 1.2, 120 + i, { light: 0.2 }));

  const sfx = [{ t: 1.4, type: 'sting2', vol: 0.7 }, { t: tRomp, type: 'whoosh' }, { t: tDic + 0.3, type: 'march', dur: tFoto - tDic - 0.4, vol: 0.6 }, { t: tDic + 0.4, type: 'cheer', vol: 0.6 },
    { t: tFoto + 0.25, type: 'click', vol: 1.0 }, { t: tFoto + 0.3, type: 'pop', vol: 0.6 },
    ...mgMuz.map((m, i) => ({ t: L[2].t0 + 0.6 + i * 0.2, type: 'mg', dur: ctx.dur - L[2].t0 - 0.8, vol: 0.5 })), ...cBooms.map(b => ({ t: b.t0, type: 'boom', vol: 0.6 }))];

  const tShot = tFoto + 0.3;
  const shots = [
    { t0: 0, set: Cv, p0: [0, 2.1, 5.0], l0: [0, 0.85, -0.6], p1: [0, 1.95, 4.3], l1: [0, 0.85, -0.6], fov0: 40, act: (t) => {
      const angry = t > 1.2;
      K.pose(vil, { ...(angry ? A.fist(t, 1, 'R') : C.idle(t, 1)), gun: 'back' }); vil.setFace(angry ? 'squint' : C.blinkEye(t, 1), angry ? 'shout' : 'neutral');
      K.pose(zap, { ...C.idle(t, 2), gun: 'back' }); zap.setFace(angry ? 'squint' : C.blinkEye(t, 2), angry ? 'frown' : 'neutral');
      K.pose(car, C.idle(t, 3)); car.setFace(angry ? 'squint' : C.blinkEye(t, 3), angry ? 'frown' : 'neutral');
      K.pose(obr, { ...(angry ? C.point(t, 4, 10) : C.idle(t, 4)), gun: 'back' }); obr.setFace(angry ? 'squint' : C.blinkEye(t, 4), angry ? 'shout' : 'neutral');
      spark.position.set(0, 0, -0.7); F.popSprite(spark, t, 1.3, L[1].t0 - 0.2, 0.65, 1.55 + 0.03 * Math.sin(t * 30));
      flagCv.wave(t * 0.3);
      return film(t) + badge(t, 'Octubre de 1914', 'La Convención de Aguascalientes', 'Los jefes revolucionarios no logran ponerse de acuerdo', 0.6, L[1].t0 - 0.2);
    } },
    { t0: L[1].t0 - 0.2, set: M, p0: [1.0, 15, 13.5], l0: [1.2, 0, 2.6], p1: [1.4, 13.5, 12], l1: [1.4, 0, 2.6], fov0: 40, act: (t) => {
      GM.paint(M.map, ev, t);
      retreat.set(clamp((t - tRomp - 0.4) / 1.8)); vIn.set(clamp((t - tDic) / 1.6)); zIn.set(clamp((t - tDic - 0.4) / 1.0));
      carT.token.position.set(...GM.pos(...CITY['Veracruz'])); carT.token.visible = t > tRomp + 1.8; K.pose(carT, C.idle(t, 1)); carT.setFace(C.blinkEye(t, 1), 'frown');
      return film(t) + city(ctx, M, 'Ciudad de México', fade(t, L[1].t0, tTom), 'c big') + city(ctx, M, 'Veracruz', fade(t, tRomp + 1.2, tTom))
        + `<div style="position:absolute;left:80px;top:90px;opacity:${fade(t, tRomp, tTom)};font:800 26px Inter;color:#2a211b;background:rgba(243,234,214,.92);padding:14px 20px;border-radius:12px;line-height:1.7">
          <div><span style="display:inline-block;width:22px;height:22px;border-radius:5px;background:${GM.FACTION.villista};vertical-align:-4px;margin-right:10px"></span>Villa</div>
          <div><span style="display:inline-block;width:22px;height:22px;border-radius:5px;background:${GM.FACTION.zapatista};vertical-align:-4px;margin-right:10px"></span>Zapata</div>
          <div><span style="display:inline-block;width:22px;height:22px;border-radius:5px;background:${GM.FACTION.carrancista};vertical-align:-4px;margin-right:10px"></span>Carranza</div></div>`;
    } },
    { t0: tTom - 0.1, set: Z, p0: [1.6, 1.25, 3.6], l0: [-0.1, 1.1, -4], p1: [1.3, 1.22, 2.4], l1: [-0.1, 1.1, -4], fov0: 40, act: (t, u, lt) => {
      const z = -5.5 + lt * 0.7; pv.root.position.z = z; pz.root.position.z = z;
      K.pose(pv, { ...C.walk(t, 0.7, 0), gun: 'low' }); pv.setFace('happy', 'grin'); K.pose(pz, { ...C.walk(t, 0.7, 0.5), gun: 'low' }); pz.setFace(C.blinkEye(t, 2), 'smile');
      marchers.forEach((m, i) => { m.root.position.z = z - 1.3 - Math.floor(i / 4) * 1.2; K.pose(m, { ...C.walkArmed(t, 0.7, i * 0.3), gun: 'port' }); });
      lookers.forEach((c, i) => K.pose(c, C.cheer(t + i * 0.4, i))); Z.flag.wave(t); aimSun(Z, 0, -2);
      return film(t) + badge(t, '6 de diciembre de 1914', 'Villa y Zapata en la capital', 'Sus ejércitos desfilan por la Ciudad de México', tTom + 0.2, tFoto - 0.4);
    } },
    { t0: tFoto - 0.5, set: Ph, p0: [0.1, 1.2, 2.9], l0: [0.05, 0.85, -1.5], p1: [0.1, 1.18, 2.6], l1: [0.05, 0.85, -1.5], fov0: 36, act: (t) => {
      const tt = Math.min(t, tShot);
      { const p = A.laugh(tt, 1); p.armR = [-40, 0, 70]; p.elbR = [0, 30, 0]; K.pose(sv, { ...p, gun: 'none' }); } sv.setFace(tt > tShot - 0.6 ? 'happy' : C.blinkEye(tt, 1), 'teeth');
      { const p = A.sit(tt, 2, 0); p.armL = [-55, -30, -50]; p.armR = [-55, 30, 50]; p.elbL = [0, -60, 0]; p.elbR = [0, 60, 0]; K.pose(sz, { ...p, gun: 'none' }); } sz.setFace(C.blinkEye(tt, 2), 'neutral');
      others.forEach((c, i) => K.pose(c, { ...C.idle(tt, c.seed), gun: 'low' }));
      cam.flash.intensity = t > tShot - 0.05 && t < tShot + 0.15 ? 60 : 0;
      const frozen = t > tShot, w = ss(tShot, tShot + 0.12, t), fl = Math.max(0, 1 - Math.abs(t - tShot) * 7);
      return film(t) + (frozen ? `<div style="position:absolute;inset:0;background:#704214;mix-blend-mode:color;opacity:${0.75 * w}"></div><div style="position:absolute;inset:0;box-shadow:inset 0 0 0 40px #f3ead6, inset 0 0 0 46px #d9cdb2;opacity:${w}"></div>
          <div style="position:absolute;left:50%;bottom:150px;transform:translateX(-50%);font:italic 600 28px Georgia,serif;color:#f3ead6;text-shadow:0 2px 8px #000;opacity:${ss(tShot + 0.3, tShot + 0.7, t)}">Palacio Nacional · 6 de diciembre de 1914</div>` : '')
        + (fl > 0 ? `<div style="position:absolute;inset:0;background:#fff;opacity:${fl}"></div>` : '');
    } },
    { t0: L[2].t0 - 0.15, set: Ce, p0: [-3.2, 2.7, 5.2], l0: [0.5, 0.5, -14], p1: [-2.6, 2.5, 4.4], l1: [0.5, 0.5, -14], fov0: 40,
      shake: t => 0.02 * cBooms.reduce((a, b) => a + (t >= b.t0 ? Math.max(0, 1 - (t - b.t0) * 4) : 0), 0), act: (t) => celaya(t) + badge(t, 'Abril de 1915', 'Las batallas de Celaya', 'Obregón detiene las cargas de la División del Norte', tObr, tCon - 0.1)
        + nameplate(ctx, [2.8, 1.62, 0.7], 'Álvaro Obregón', 'Ejército Constitucionalista', tObr - 0.1, tCon - 0.2) },
    { t0: tCon, set: Ce, p0: [-6.6, 1.0, -4.6], l0: [-3.4, 0.6, -0.4], p1: [-6.0, 1.0, -4.2], l1: [-3.2, 0.6, -0.4], fov0: 42, act: (t) => celaya(t)
        + label(ctx, [-1.0, 0.55, 0.0], 'Trincheras', 'n', fade(t, tTrin - 0.1, ctx.dur)) + label(ctx, [-5.6, 0.68, -1.9], 'Alambre de púas', 'n', fade(t, tAlam - 0.1, ctx.dur))
        + label(ctx, [-4.4, 1.32, -0.25], 'Ametralladoras', 'r', fade(t, tAmet - 0.1, ctx.dur)) },
  ];
  function celaya(t) {
    mgMuz.forEach(m => m.update(t)); rMuz.forEach(m => m.update(t)); cBooms.forEach(b => b.update(t));
    gunners.forEach((g, i) => { const p = C.crouch(t, i, 0.7); p.armL = [-60, -25, -60]; p.armR = [-60, 25, 60]; p.elbL = [0, -40, 0]; p.elbR = [0, 40, 0]; K.pose(g, { ...p, gun: 'none' }); g.setFace('squint', 'neutral'); });
    riflemen.forEach((r, i) => { K.pose(r, { ...C.aim(t, rMuz[i].recoil(t), 1), gun: 'aim' }); r.setFace('squint', 'neutral'); });
    K.pose(obrC, { ...C.point(t, 3, 12), gun: 'back' }); obrC.setFace('squint', C.talkMouth(t, 3));
    villistas.forEach((v, i) => { const run = Math.max(0, t - L[2].t0 - 0.3 - (i % 4) * 0.2); v.root.position.z = Math.min(-9.5 - (i % 3) * 1.2, -22 - (i % 3) * 1.4 + run * 2.1);
      const stopped = v.root.position.z >= -9.5 - (i % 3) * 1.2 - 0.01; K.pose(v, stopped ? { ...C.crouch(t, i, 0.8), gun: 'port' } : { ...C.runArmed(t, 1.1, i), gun: 'port' }); v.setFace('squint', stopped ? 'frown' : 'shout'); });
    aimSun(Ce, 0, -6);
    return film(t);
  }
  const inst = { scene: Cv, scenes: [Cv, M, Z, Ph, Ce], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
