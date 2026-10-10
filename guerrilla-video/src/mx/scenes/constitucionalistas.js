import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as LP from '../../lib/props.js';
import * as F from '../../lib/fx.js';
import { ss, clamp, lerp } from '../../lib/util.js';
import { badge } from '../../lib/kit.js';
import * as X from '../props.js';
import * as K from '../kit.js';
import * as A from '../anim.js';
import { desert, port, mxStage, aimSun } from '../sets.js';
import { runShots, wt } from '../shots.js';
import { film, nameplate } from '../ui.js';
import { mapSet, token, city, spark, fade, GM } from '../mapkit.js';

export { preload } from '../mapkit.js';

const CITY = GM.CITY;
export function build(ctx) {
  const L = ctx.L;
  const tVen = wt(L[0], 'venustiano') - 0.25, tFor = wt(L[0], 'form');
  const tSon = wt(L[1], 'sonora'), tObr = wt(L[1], 'alvaro'), tChi = wt(L[1], 'chihuahua'), tDiv = wt(L[1], 'division'), tSur = wt(L[1], 'sur'), tZap = wt(L[1], 'zapata');
  const tTren = wt(L[2], 'tren'), tCon = wt(L[2], 'con') - 0.2, tSold = wt(L[2], 'soldaderas'), tCoc = wt(L[2], 'cocinaban'), tCur = wt(L[2], 'curaban'), tPel = wt(L[2], 'peleaban'), tTam = wt(L[2], 'tambien');
  const tJun = wt(L[3], 'en$', 1) - 0.25, tZac = wt(L[3], 'aplasto');

  // ---- map: the whole country against Huerta
  const M = mapSet();
  const fedStates = ['Ciudad de México', 'México', 'Puebla', 'Veracruz', 'Hidalgo', 'Tlaxcala', 'Querétaro', 'Guanajuato', 'Jalisco', 'Michoacán', 'San Luis Potosí', 'Aguascalientes', 'Zacatecas', 'Oaxaca', 'Tamaulipas', 'Nuevo León', 'Colima', 'Nayarit', 'Sinaloa', 'Tabasco', 'Campeche', 'Yucatán', 'Quintana Roo', 'Chiapas', 'Baja California', 'Baja California Sur'];
  const ev = [{ t: -1, names: fedStates, color: GM.FACTION.federal },
    ...[['Coahuila', 0.9], ['Sonora', 1.3], ['Chihuahua', 1.6], ['Durango', 1.9]].map(([n, d]) => ({ t: d, names: [n], color: GM.FACTION.carrancista })),
    { t: 2.2, names: ['Morelos', 'Guerrero'], color: GM.FACTION.zapatista },
    { t: tObr + 1.6, names: ['Sinaloa', 'Nayarit'], color: GM.FACTION.carrancista }, { t: tObr + 2.4, names: ['Jalisco'], color: GM.FACTION.carrancista },
    { t: tDiv + 0.6, names: ['Zacatecas'], color: GM.FACTION.villista }, { t: tChi + 0.3, names: ['Chihuahua', 'Durango'], color: GM.FACTION.villista }];
  const sparks = [['Saltillo', 0.9], ['Hermosillo', 1.3], ['Chihuahua', 1.6], ['Durango', 1.9], ['Cuernavaca', 2.2]].map(([n, d]) => ({ s: spark(M, ...CITY[n]), t: d }));
  const obrArrow = GM.arrow([CITY['Hermosillo'], CITY['Guaymas'], [-108.99, 25.79], [-107.39, 24.8], CITY['Mazatlán'], CITY['Tepic'], CITY['Guadalajara']], GM.ARROW.carrancista, 0.55); M.add(obrArrow);
  const vilArrow = GM.arrow([CITY['Chihuahua'], CITY['Jiménez'], CITY['Torreón'], CITY['Zacatecas']], GM.ARROW.villista, 0.62); M.add(vilArrow);
  const tObrT = token(M, 'obregon', 'obregon', ...CITY['Hermosillo'], 'carrancista', 0), tVilT = token(M, 'villa', 'villa', ...CITY['Chihuahua'], 'villista', 0), tZapT = token(M, 'zapata', 'zapata', ...CITY['Cuernavaca'], 'zapatista', 0);
  [tObrT, tVilT, tZapT].forEach(r => (r.token.visible = false));
  // ---- Coahuila: Carranza raises an army
  const Co = desert('golden', { seed: 81, clear: [[0, 0, 8]] });
  const hac = X.hacienda(); hac.position.set(-3, 0, -14); hac.scale.setScalar(0.9); Co.add(hac);
  const carranza = K.person(Co, 'carranza', 'carranza', 0, 1.6, 0);
  const flagC = X.flag('mx', 3.4, 1.25, 0.78); flagC.position.set(-1.2, 0, 1.3); Co.add(flagC);
  const troops = []; for (let i = 0; i < 12; i++) { const x = -3.9 + (i % 6) * 1.55, z = -0.6 - Math.floor(i / 6) * 1.3; troops.push(K.person(Co, ['doto', 'oguri', 'tamamo', 'helios', 'daiwa', 'cafe'][i % 6], 'constitucionalista', x + (Math.floor(i / 6) % 2) * 0.7, z, 0)); }
  // ---- Villa's troop train
  const Tr = desert('golden', { rail: 0, seed: 82, clear: [[0, 7, 6]] });
  const train = X.steamTrain(5); train.rotation.y = Math.PI / 2; Tr.add(train);
  const riders = [];
  train.cars.forEach((car, ci) => { for (let k = 0; k < 3; k++) { const vi = ci === 0 && k === 1, ad = (ci + k) % 4 === 2;
    const r = K.person(car, vi ? 'villa' : ad ? 'adelita' : ['doto', 'oguri', 'suzuka', 'helios', 'cafe'][(ci + k) % 5], vi ? 'villa' : ad ? 'adelita' : 'rebelde', 0, -0.85 + k * 0.85, k % 2 ? Math.PI / 2 : -Math.PI / 2);
    r.root.position.y = car.roofY; r.mode = vi ? 3 : (ci + k) % 3; riders.push(r); } });
  const smoke = X.smokeTrail(Tr, 16, { color: '#e8e2d6', size: 0.45, rise: 3, drift: [-2.5, 0, 0], life: 2.6 });
  // ---- soldaderas' camp beside the stopped train
  const Ca = desert('golden', { rail: -4, seed: 83, clear: [[0, 0, 7]] });
  const train2 = X.steamTrain(3, { carColor: '#6f4a34' }); train2.rotation.y = Math.PI / 2; train2.position.set(-4, 0, -4); Ca.add(train2);
  const fire = X.campfire(); fire.position.set(-1.85, 0, 0.45); Ca.add(fire);
  const cook = K.person(Ca, 'adelita', 'adelita', -2.55, 0.15, 1.05);
  const wounded = K.person(Ca, 'oguri', 'rebelde', 0.15, -0.1, 0.2); wounded.root.position.y = 0.05; wounded.hat.visible = false;
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.035, 6, 24), new THREE.MeshStandardMaterial({ color: '#f3eee2' })); band.rotation.x = Math.PI / 2 + 0.25; wounded.attach('head', band, [0, 0.72, 0.02]);
  const nurse = K.person(Ca, 'doto', 'adelita', 0.62, -0.62, -0.35);
  const fighter = K.person(Ca, 'suzuka', 'adelita', 3.0, 0.6, Math.PI / 2 - 0.35); K.generic(fighter, '#4a2a22');
  const crate = LP.at(LP.box(0.5, 0.18, 0.4, '#7a5a36'), 0.15, 0.09, -0.15); Ca.add(crate);
  const muzF = new F.Muzzle(fighter.gun, 3); muzF.fire(tPel - 0.1, tPel + 2.2);
  // ---- Veracruz occupied
  const V = port('day');
  const ws = X.warship(); ws.scale.setScalar(1.25); ws.rotation.y = Math.PI / 2; ws.position.set(-2, 0, 19.5); V.add(ws);
  const usFlag = X.flag('us', 3.0, 1.3, 0.82); usFlag.position.set(4.9, 0.5, 6.8); V.add(usFlag);
  const marines = []; for (let i = 0; i < 8; i++) marines.push(K.person(V, ['oguri', 'tamamo', 'helios', 'doto'][i % 4], 'gringo', 2.4 + (i % 2) * 0.8, 0, Math.PI));
  marines.forEach(m => (m.root.position.y = 0.5));
  // ---- Zacatecas
  const Z = mxStage('day', ['#b89e78', '#a88e68'], { seed: 84 });
  const hill = X.bufa(); hill.position.set(4, -0.5, -26); Z.add(hill);
  Z.add(X.sierra({ z: -70, depth: 40, height: 12, seed: 85, base: '#8a6f5a', top: '#a08870' }));
  LP.scatter(Z, (r, i) => [X.nopal(0.9 + r() * 0.4, i), X.shrub(0.8 + r() * 0.4, i, '#8a8a52'), X.agave(0.8, i)][i % 3], 60, [-30, -30, 30, 12], 86, [[0, 0, 8]]);
  const villaZ = K.person(Z, 'villa', 'villa', -0.6, 1.2, -0.3);
  const charge = []; for (let i = 0; i < 9; i++) charge.push(K.person(Z, ['doto', 'oguri', 'suzuka', 'helios', 'cafe', 'daiwa', 'mcqueen', 'doto', 'oguri'][i], 'rebelde', -5 + i * 1.2, 4 + (i % 3) * 0.8, Math.PI - 0.15));
  const zBooms = [[0.6, [3, 0, -12]], [1.5, [6, 0, -16]], [2.4, [1, 0, -18]], [3.4, [7.5, 0, -11]], [4.4, [3.6, 0, -15]]];
  const booms = zBooms.map(([d, p], i) => new F.Explosion(Z, p, tJun + d, 1.6, 90 + i, { light: 0.25 }));
  const cn = X.cannon(); cn.scale.setScalar(1.4); cn.position.set(3.2, 0, 2.2); cn.rotation.y = Math.PI - 0.25; Z.add(cn);
  const cnFlash = [0.4, 1.9, 3.3].map(d => tJun + d);
  const cnSmoke = X.smokeTrail(Z, 10, { color: '#c8c2b8', size: 0.7, rise: 2.5, drift: [0.4, 0, -1.6], life: 2.8, opacity: 0.6 });
  // ---- Huerta flees on a German cruiser
  const H = port('dusk');
  const dresden = X.warship(); dresden.scale.setScalar(1.3); dresden.rotation.y = Math.PI / 2; dresden.position.set(0, 0, 13); H.add(dresden);
  const fillH = new THREE.DirectionalLight('#ffd2a8', 1.2); fillH.position.set(-6, 8, -14); H.add(fillH, fillH.target); fillH.target.position.set(0, 1, 12);
  const huerta = K.person(dresden, 'huerta', 'huerta', 1.0, -5.55, Math.PI / 2); huerta.root.position.y = 1.6; huerta.root.scale.setScalar(1 / 1.3);
  const dSmoke = dresden.funnelTops.map(() => X.smokeTrail(H, 10, { color: '#5d5a58', size: 0.7, rise: 4, drift: [-3, 0, 0], life: 3.4, opacity: 0.6 }));

  const sfx = [{ t: 0.3, type: 'whoosh' }, ...sparks.map(({ t }) => ({ t, type: 'pop', vol: 0.6 })), { t: tVen + 0.3, type: 'march', dur: L[1].t0 - tVen - 0.5, vol: 0.5 }, { t: tFor + 0.4, type: 'cheer', vol: 0.6 },
    { t: tObr - 0.3, type: 'pop' }, { t: tObr + 0.3, type: 'whoosh', vol: 0.5 }, { t: tChi - 0.3, type: 'pop' }, { t: tChi + 1.0, type: 'whoosh', vol: 0.5 }, { t: tZap - 0.3, type: 'pop' },
    { t: L[2].t0 - 0.3, type: 'train', dur: tCon - L[2].t0 + 0.6, vol: 0.9 }, { t: L[2].t0 + 0.2, type: 'whistle' }, { t: tPel, type: 'shot', vol: 0.5 }, { t: tPel + 0.35, type: 'shot', vol: 0.5 }, { t: tPel + 0.7, type: 'shot', vol: 0.5 },
    { t: L[3].t0 - 0.2, type: 'waves', dur: tJun - L[3].t0, vol: 0.5 }, { t: L[3].t0 + 0.8, type: 'march', dur: tJun - L[3].t0 - 1, vol: 0.5 },
    ...cnFlash.map(t => ({ t, type: 'boom', vol: 0.9 })), ...booms.map(b => ({ t: b.t0, type: 'bigboom', vol: 0.7 })), { t: tZac + 0.4, type: 'charge', vol: 0.9 },
    { t: L[4].t0 - 0.5, type: 'waves', dur: 5.5, vol: 0.5 }, { t: L[4].t0 + 0.6, type: 'whistle', vol: 0.5 }];

  const shots = [
    { t0: 0, set: M, p0: [-1.5, 30, 18], l0: [-1.5, 0, 1.5], p1: [-1, 27, 15.5], l1: [-1.2, 0, 1.2], fov0: 38, act: (t) => {
      GM.paint(M.map, ev, t); sparks.forEach(({ s, t: d }) => s.update(t, d)); obrArrow.set(0); vilArrow.set(0);
      return film(t) + badge(t, '1913', 'Todos contra Huerta', 'El norte y el sur se levantan en armas', 0.8, tVen - 0.2);
    } },
    { t0: tVen, set: Co, p0: [1.3, 1.25, 7.4], l0: [-0.2, 1.05, 0.4], p1: [1.0, 1.2, 6.4], l1: [-0.2, 1.05, 0.6], fov0: 38, act: (t) => {
      K.pose(carranza, A.orate(t, 1, 0.7)); carranza.setFace(C.blinkEye(t, 1), C.talkMouth(t, 1));
      troops.forEach((c, i) => { const ch = t > tFor + 0.4 && i % 2 === 0; K.pose(c, ch ? { ...C.cheer(t + i * 0.3, i), gun: 'back' } : { ...C.idle(t, c.seed), gun: 'port' }); c.setFace(ch ? 'happy' : C.blinkEye(t, c.seed), ch ? 'teeth' : 'neutral'); });
      flagC.wave(t); aimSun(Co, 0, 2);
      return film(t) + nameplate(ctx, [0, 1.62, 1.6], 'Venustiano Carranza', 'Gobernador de Coahuila', tVen + 0.4, tFor)
        + badge(t, 'Plan de Guadalupe · 1913', 'El Ejército Constitucionalista', 'Carranza se proclama Primer Jefe de la revolución contra Huerta', tFor - 0.2, L[1].t0 - 0.2);
    } },
    { t0: L[1].t0 - 0.35, set: M, p0: [-2.6, 15.5, 17.5], l0: [-2.4, 0, 0.2], p1: [-1.8, 14.5, 16.5], l1: [-1.8, 0, 0.4], fov0: 40, act: (t) => {
      GM.paint(M.map, ev, t); sparks.forEach(({ s }) => (s.visible = false));
      tObrT.token.visible = t > tSon - 0.2; tVilT.token.visible = t > tChi - 0.2; tZapT.token.visible = t > tSur;
      const po = clamp((t - tObr - 0.2) / 2.6), pv = clamp((t - tDiv + 0.6) / 2.4);
      obrArrow.set(po); vilArrow.set(pv);
      [[tObrT, tSon], [tVilT, tChi], [tZapT, tSur]].forEach(([r, a], i) => { const k = ss(a - 0.2, a + 0.2, t); r.token.scale.setScalar(K_TOKEN * (0.3 + 0.7 * k)); K.pose(r, { ...C.idle(t, i), gun: 'low' }); r.setFace(C.blinkEye(t, i), 'neutral'); });
      const lab = (r, name, role, a, dx = 0) => nameplate(ctx, [r.token.position.x + dx, r.token.position.y + 2.9, r.token.position.z], name, role, a, L[2].t0);
      return film(t) + lab(tObrT, 'Álvaro Obregón', 'Sonora', tObr - 0.2, -1.0) + lab(tVilT, 'Pancho Villa', 'División del Norte', tChi + 0.2, 1.2) + lab(tZapT, 'Emiliano Zapata', 'Morelos', tZap - 0.2);
    } },
    { t0: L[2].t0 - 0.2, set: Tr, p0: [4.5, 1.5, 6.4], l0: [-3, 1.8, 0], p1: [7.5, 1.6, 6.0], l1: [4, 1.7, 0], fov0: 40, act: (t, u, lt) => {
      const x = -6 + lt * 3.4; train.position.set(x, 0, 0); smoke(t, train.localToWorld(train.stack.clone()));
      riders.forEach((r, i) => { const p = r.mode === 3 ? { ...A.proud(t, 1), gun: 'back' } : r.mode === 0 ? { ...A.sit(t, r.seed), gun: 'port' } : r.mode === 1 ? { ...C.cheer(t * 0.8, i), gun: 'back' } : { ...C.idle(t, r.seed), gun: 'low' };
        K.pose(r, p); r.setFace(r.mode === 1 ? 'happy' : C.blinkEye(t, r.seed), r.mode === 1 ? 'teeth' : 'smile'); });
      aimSun(Tr, x * 0.5, 0);
      return film(t) + badge(t, 'La División del Norte', 'Un ejército sobre rieles', 'Villa usaba los trenes para mover miles de hombres', L[2].t0 + 0.4, tCon - 0.1);
    } },
    { t0: tCon, set: Ca, p0: [-2.6, 1.15, 4.2], l0: [-2.4, 0.75, 0.2], fov0: 38, act: (t, u) => {
      { const kx = [[tCon, -2.5], [tCoc + 0.5, -2.2], [tCur + 0.2, 0.5], [tPel - 0.6, 0.8], [tPel + 0.1, 2.9], [ctx.dur, 3.1]]; let x = kx[0][1];
        for (let i = 0; i < kx.length - 1; i++) if (t >= kx[i][0]) { const [a, xa] = kx[i], [b, xb] = kx[i + 1]; const e = clamp((t - a) / (b - a)); x = xa + (xb - xa) * e * e * (3 - 2 * e); }
        ctx.camera.position.set(x - 0.1, 1.12, 4.0); ctx.camera.lookAt(x, 0.72, 0.2); }
      fire.update(t);
      K.pose(cook, { ...A.cook(t, 1), gun: 'back' }); cook.setFace(C.blinkEye(t, 1), 'smile');
      K.pose(wounded, { ...A.sit(t, 2, -4), gun: 'none' }); wounded.setFace('flat', 'wavy');
      { const p = C.idle(t, 3, 0.4); p.armL = [-62, -30, -66]; p.armR = [-74, 24, 60]; p.elbL = [0, -58, 0]; p.elbR = [0, 52 + 10 * Math.sin(t * 4), 0]; p.waist = [8, 0, 0]; K.pose(nurse, { ...p, gun: 'back' }); } nurse.setFace(C.blinkEye(t, 3), 'small');
      K.pose(fighter, { ...C.aim(t, muzF.recoil(t), 1), gun: 'aim' }); muzF.update(t); fighter.setFace('squint', 'neutral');
      aimSun(Ca, 0, 0);
      return film(t) + nameplate(ctx, [-2.4, 1.5, 0.05], 'Las Adelitas', 'Soldaderas', tSold - 0.2, tCur - 0.2)
        + badge(t, 'Soldaderas', 'Cocinaban, curaban y peleaban', 'Sin ellas, los ejércitos revolucionarios no habrían resistido', tCur, L[3].t0 - 0.2);
    } },
    { t0: L[3].t0 - 0.25, set: V, p0: [7.4, 2.2, -0.6], l0: [1.5, 2.2, 10], p1: [6.8, 2.2, 0.2], l1: [1.0, 2.25, 10], fov0: 40, act: (t) => {
      marines.forEach((m, i) => { const z = 13 - Math.floor(i / 2) * 1.2 - (t - L[3].t0) * 0.9; m.root.position.z = z; K.pose(m, { ...C.walkArmed(t, 0.8, i * 0.4), gun: 'port' }); m.setFace(C.blinkEye(t, i), 'neutral'); });
      usFlag.wave(t); aimSun(V, 0, 4);
      return film(t) + badge(t, '21 de abril de 1914', 'Estados Unidos ocupa Veracruz', 'Los marines toman el puerto durante siete meses', L[3].t0 + 0.3, tJun - 0.1);
    } },
    { t0: tJun, set: Z, p0: [-1.2, 1.5, 9.5], l0: [2.2, 2.6, -14], p1: [-1.0, 1.4, 8.0], l1: [2.6, 2.6, -14], fov0: 40,
      shake: t => 0.03 * [...cnFlash, ...booms.map(b => b.t0)].reduce((a, c) => a + (t >= c ? Math.max(0, 1 - (t - c) * 4) : 0), 0), act: (t) => {
      const run = Math.max(0, t - tZac + 0.2);
      charge.forEach((c, i) => { c.root.position.z = 4 + (i % 3) * 0.8 - run * 2.4; K.pose(c, run > 0 ? { ...C.runArmed(t, 1.2, i), gun: 'port' } : { ...C.idle(t, c.seed), gun: 'port' }); c.setFace(run > 0 ? 'squint' : C.blinkEye(t, c.seed), run > 0 ? 'shout' : 'neutral'); });
      K.pose(villaZ, run > 0 ? { ...A.fist(t, 2), gun: 'back' } : { ...C.point(t, 2, -20), gun: 'back' }); villaZ.setFace('squint', 'shout');
      booms.forEach(b => b.update(t));
      const f = cnFlash.reduce((a, c) => (t >= c ? Math.max(a, 1 - (t - c) * 5) : a), 0); cn.position.z = 2.2 - f * 0.15;
      cnSmoke(t, new THREE.Vector3(3.0, 0.8, 1.2), 1); aimSun(Z, 0, -4);
      return film(t) + nameplate(ctx, [-0.6, 1.62, 1.2], 'Pancho Villa', 'División del Norte', tJun + 0.3, tZac)
        + badge(t, '23 de junio de 1914', 'La toma de Zacatecas', 'La batalla más sangrienta de la Revolución', tZac - 0.2, L[4].t0 - 0.3);
    } },
    { t0: L[4].t0 - 0.4, set: H, p0: [-4.8, 2.95, 7.9], l0: [-7.1, 2.75, 11.7], p1: [-5.1, 2.95, 8.5], l1: [-7.1, 2.75, 11.7], fov0: 36, act: (t) => {
      const sail = Math.max(0, t - L[4].t0 - 2.6); dresden.position.set(sail * 0.5 + sail * sail * 0.1, 0, 13);
      K.pose(huerta, A.proud(t, 3)); huerta.setFace(C.blinkEye(t, 3), 'frown');
      dresden.funnelTops.forEach((v, i) => dSmoke[i](t + i, dresden.localToWorld(v.clone()))); aimSun(H, 0, 4);
      return film(t) + badge(t, '15 de julio de 1914', 'Huerta renuncia', 'Huye del país a bordo del crucero alemán Dresden', L[4].t0, ctx.dur);
    } },
  ];
  const inst = { scene: M, scenes: [M, Co, Tr, Ca, V, Z, H], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
const K_TOKEN = 1.9;
