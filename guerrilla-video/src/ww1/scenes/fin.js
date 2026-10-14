import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as F from '../../lib/fx.js';
import { ss, clamp } from '../../lib/util.js';
import { aimSun } from '../../lib/stage.js';
import { runShots, wt } from '../../mx/shots.js';
import { desert } from '../../mx/sets.js';
import * as X from '../../mx/props.js';
import { laugh } from '../../mx/anim.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as A from '../anim.js';
import * as WM from '../wmap.js';
import { leader, NAMES } from '../leaders.js';

export { preload } from '../wmap.js';
const fade = WM.fade;
const CAST = ['doto', 'oguri', 'suzuka', 'helios', 'tamamo', 'mcqueen', 'daiwa', 'cafe'];
const fz = (arr, poseFn, keep = () => false, face = 'neutral') => arr.forEach((c, i) => { if (keep(i)) return; c.setFace('open', face); K.freeze(c, poseFn(i)); });
// Remove loose debris (planks, stumps, wire) from a set's foreground so nothing odd sits right in front of the lens.
const clearNear = (s, x, z, r) => [...s.children].forEach(o => { if (o === s.ground || o.isLight || o === s.userData.sky || o.userData.dynamic || !(o.isMesh || o.isGroup)) return;
  if (Math.abs(o.position.x) + Math.abs(o.position.z) > 0.01 && Math.hypot(o.position.x - x, o.position.z - z) < r) s.remove(o); });
const whiteFlag = (x, W, H) => { x.fillStyle = '#f6f4ee'; x.fillRect(0, 0, W, H); x.fillStyle = 'rgba(0,0,0,.06)'; for (let i = 0; i < 6; i++) x.fillRect(i * W / 6, 0, 2, H); };

export function build(ctx) {
  const L = ctx.L;
  const tRus = wt(L[0], 'rusia'), tMar = wt(L[0], 'marzo'), tFir = wt(L[0], 'firmo'), tPaz = wt(L[0], 'paz');
  const tOf = wt(L[1], 'ofensiva'), tPero = wt(L[1], 'pero'), tDiez = wt(L[1], 'diez'), tMan = wt(L[1], 'mando'), tPer = wt(L[1], 'pershing'), tMis = wt(L[1], 'mismo'), tPers = wt(L[1], 'perseguido');
  const tTan = wt(L[2], 'tanques'), tSoc = wt(L[2], 'socios'), tRin = wt(L[2], 'rindieron'), tKai = wt(L[2], 'kaiser');
  const tFir2 = wt(L[3], 'firmo'), tVag = wt(L[3], 'vagon'), tA = wt(L[3], 'a$'), tOnce = wt(L[3], 'once', 1), tCan = wt(L[3], 'canones'), tCal = wt(L[3], 'callaron');
  const tB = tMar - 0.35, tC = L[1].t0 - 0.3, tD = tPero - 0.3, tE = tMan - 0.5, tF = tMis - 0.35, tG = L[2].t0 - 0.3, tH = tSoc - 0.35, tI = tKai - 0.3, tJ = L[3].t0 - 0.3,
    tK = tFir2 - 0.25, tL = tA - 0.3, tM = tCan - 0.2;

  // ---- 1. Petrograd, 1917: revolution
  const St = S.RS.petroStreet('snow', { bakery: false, snowing: true });
  const mass = K.crowd(St, ['soldadoRevolucion', 'obrero', 'marinero', 'obrera', 'guardiaRoja', 'obrero'], 30, [-4, -14, 4, -3], { seed: 901 });
  const flagsR = [[-2.6, -5], [1.8, -7.5], [-0.6, -11], [2.9, -12.5]].map(([x, z]) => { const f = P.RP.redFlag(2.2, 0.9, 0.55); f.position.set(x, 0, z); St.add(f); return f; });
  fz(mass, i => ({ ...(i % 3 === 0 ? A.rally(0.2 + i * 0.13, i) : i % 3 === 1 ? C.cheer(0.3 + i * 0.1, i) : A.proud(0.3, i)), gun: 'back' }), () => false, 'open');
  // ---- 2. Brest-Litovsk, 3 March 1918
  const Tr = S.RS.treatyRoom();
  const ger = [0, 1, 2, 3].map(i => { const [x, y, z] = Tr.seats(i, -1); const g = K.person(Tr, ['mcqueen', 'daiwa', 'suzuka', 'tamamo'][i], 'oficialAleman', x, z, 0); g.root.position.y = y; return g; });
  const sov = [0, 1, 2, 3].map(i => { const [x, y, z] = Tr.seats(i, 1); const g = K.person(Tr, ['oguri', 'helios', 'doto', 'cafe'][i], 'delegado', x, z, Math.PI); g.root.position.y = y; return g; });
  // ---- 3. Spring Offensive, 21 March 1918: stormtroopers in the fog
  const Of = S.openField('morning', { mist: true, green: 0.25 }); clearNear(Of, 0, 3, 6);
  const storm = [0, 1, 2, 3, 4, 5].map(i => { const c = K.person(Of, CAST[i], 'asalto', 0, 0, Math.PI / 2); c.x0 = -6.5 + (i % 3) * 1.3 - Math.floor(i / 3) * 0.7; c.z0 = 0.4 + Math.floor(i / 3) * 1.4 + (i % 3) * 0.25; return c; });
  const booms = [[-3, -9, 0.5], [5, -13, 1.4], [1, -7.5, 2.3], [-7, -12, 2.9]].map(([x, z, dt], i) => new F.Explosion(Of, [x, Of.heightAt(x, z), z], tC + dt, 1.2, 911 + i, { smokeColor: '#5a5650', dull: true }));
  for (const [x, z] of [[-10, -16], [8, -20], [16, -14]]) S.smokeFrom(Of, new THREE.Vector3(x, 0.5, z), { n: 10, color: '#6a6660', size: 2.4, rise: 9, drift: [2, 0, 0], life: 6, opacity: 0.45 });
  // ---- 4-5. Saint-Nazaire: the Americans arrive; Pershing
  const Pt = S.portFrance('overcast');
  const colU = [...Array(16)].map((_, i) => K.person(Pt, CAST[i % 8], 'doughboy', 0, 0, Math.PI / 2));
  const ramp = [0, 1].map(i => K.person(Pt, CAST[(i + 3) % 8], 'doughboy', -2, -7, 0));
  const per = leader(Pt, 'pershing', 3.6, 0.9, 0.25);
  const marchU = t => colU.forEach((c, i) => { const r = i >> 1; c.root.position.set(-8 + r * 1.25 + (t - tD) * 0.75 - (i % 2) * 0.4, 0, -0.9 - (i % 2) * 0.8); K.pose(c, { ...C.walkArmed(t, 0.75, i * 0.37), gun: 'back' }); c.setFace(C.blinkEye(t, i), 'neutral'); });
  // ---- 6. Flashback, Mexico 1916: Villa watches Pershing's column go by
  const Ds = desert('golden', { seed: 102, clear: [[0, 0, 6], [-3, -14, 8]] });
  for (const [x, z, r, sd] of [[0.35, -0.95, 0.75, 1], [-0.9, -1.05, 0.62, 2], [1.55, -0.55, 0.55, 3], [-2.1, -0.6, 0.5, 4], [2.6, 0.2, 0.42, 5]]) { const b = X.boulder(r, sd); b.position.x = x; b.position.z = z; Ds.add(b); }
  const vil = leader(Ds, 'villa', 0.55, -0.15, Math.PI + 0.35);
  const far = [...Array(8)].map((_, i) => K.person(Ds, CAST[i % 8], 'doughboyHat', 0, 0, -Math.PI / 2));
  const perD = leader(Ds, 'pershing', 0, 0, -Math.PI / 2);
  // ---- 7. Amiens, 8 August 1918: tanks out of the fog
  const Am = S.openField('morning', { mist: true, green: 0.45 }); clearNear(Am, 1, 0, 5.5);
  const tanks = [[-7.5, -9.5], [-3.6, -7.2], [0.6, -8.6], [4.6, -7.0], [8.6, -9.8]].map(([x, z], i) => { const tk = P.markTank(['#6a6448', '#5e5a40', '#706a4c'][i % 3], { female: i % 2 === 1 }); tk.scale.setScalar(0.62); tk.userData.dynamic = true; tk.x0 = x; tk.z0 = z; Am.add(tk); return tk; });
  const inf = [...Array(6)].map((_, i) => { const c = K.person(Am, CAST[(i + 2) % 8], 'tommy', 0, 0, 0); c.x0 = -6.2 + i * 2.4; c.z0 = -12.0 - (i % 2) * 1.0; return c; });
  // ---- 8. Map: Germany's partners give up
  const Mp = WM.europeMap({ period: 1914 });
  const wflags = [[23.32, 42.7], [32.85, 39.93], [16.37, 48.21]].map(([lo, la]) => { const f = P.flagPole(whiteFlag, { h: 2.6, w: 1.5, fh: 1.0 }); f.children[0].material = new THREE.MeshStandardMaterial({ color: '#3a3026', roughness: 0.7 }); WM.placeOn(Mp, f, lo, la, 2.0); f.visible = false; return f; });
  // ---- 9. The Kaiser's train to the Netherlands
  const Ks = S.kaiserStation(), top = Ks.platform.top;
  const kai = leader(Ks, 'kaiser', 3.4, 2.7, -Math.PI / 2); kai.root.position.y = top;
  const esc = [[4.4, 2.25], [4.6, 3.15]].map(([x, z], i) => { const c = K.person(Ks, ['oguri', 'cafe'][i], 'oficialAleman', x, z, -Math.PI / 2); c.root.position.y = top; c.x0 = x; return c; });
  // ---- 10-11. Compiègne: the carriage at night, the signature
  const Cg = S.compiegne('night');
  const sent = [[-3.3, 1.8], [3.3, 1.8]].map(([x, z], i) => K.person(Cg, ['doto', 'helios'][i], 'poilu', x, z, i ? -0.3 : 0.3));
  const lamp = new THREE.PointLight('#ffd9a0', 9, 12, 1.4); lamp.position.set(0, 2.4, 2.4); Cg.add(lamp);
  const Wg = S.wagonInterior();
  const seatAt = (rig, i, side) => { const [x, y, z] = Wg.seats(i, side); rig.root.position.set(x, y, z); rig.root.rotation.y = side > 0 ? Math.PI : 0; return rig; };
  const fo = seatAt(leader(Wg, 'foch'), 1, -1);
  const allies = [seatAt(K.person(Wg, 'suzuka', 'marinoBritanico'), 0, -1), seatAt(K.person(Wg, 'mcqueen', 'foch'), 2, -1)];
  const germ = [seatAt(K.person(Wg, 'cafe', 'oficialAleman'), 0, 1), seatAt(K.person(Wg, 'oguri', 'diplomatico'), 1, 1), seatAt(K.person(Wg, 'helios', 'diplomatico'), 2, 1)];
  // ---- 12-13. The front, 11:00: the guns fall silent
  const Tz = S.trenchWF('mud', { seed: 951 }); const Y = Tz.Y;
  const waitT = [['oguri', -2.0], ['helios', -0.7], ['doto', 0.6]].map(([w, x]) => { const c = K.person(Tz, w, 'tommy', x, -0.62, 0); c.root.position.y = 0.46; return c; });
  const offT = K.person(Tz, 'mcqueen', 'oficialBritanico', -2.9, 0.0, 1.0);
  const joy = [...Array(7)].map((_, i) => { const c = K.person(Tz, CAST[i], 'tommy', -3.3 + i * 1.1, -1.95 - (i % 2) * 0.55, Math.PI); c.root.position.y = Y - 0.05; return c; });

  const s1 = tH + 0.25, s2 = tH + 0.6, s3 = tH + 0.95, tLaugh = tPers + 0.35;
  const sfx = [{ t: 0, type: 'crowd', dur: tB, vol: 0.35 }, { t: 0.2, type: 'wind', dur: tB, vol: 0.2 }, { t: tRus, type: 'pop', vol: 0.3 },
    { t: tB, type: 'clock', dur: tC - tB, vol: 0.2 }, { t: tFir + 0.3, type: 'paper', vol: 0.45 }, { t: tPaz, type: 'stamp', vol: 0.35 },
    { t: tC, type: 'gunfire', dur: tD - tC, vol: 0.3 }, { t: tC + 0.1, type: 'charge', vol: 0.35 }, ...booms.map(b => ({ t: b.t0, type: 'bigboom', vol: 0.4 })),
    { t: tD, type: 'harbor', dur: tF - tD, vol: 0.3 }, { t: tD, type: 'march', dur: tF - tD, vol: 0.35 }, { t: tDiez - 0.05, type: 'tick', vol: 0.35 },
    { t: tF, type: 'wind', dur: tG - tF, vol: 0.3 }, { t: tF + 0.05, type: 'whoosh', vol: 0.3 }, { t: tLaugh, type: 'laugh', vol: 0.6 },
    { t: tG, type: 'engine', dur: tH - tG + 0.3, vol: 0.45 }, { t: tG + 0.3, type: 'clank', vol: 0.3 }, { t: tG + 0.2, type: 'march', dur: tH - tG, vol: 0.25 },
    { t: tH, type: 'whoosh', vol: 0.3 }, ...[s1, s2, s3].map(x => ({ t: x, type: 'pop', vol: 0.4 })),
    { t: tI, type: 'train', dur: tJ - tI, vol: 0.35 }, { t: tI + 0.2, type: 'wind', dur: tJ - tI, vol: 0.2 },
    { t: tJ, type: 'night', dur: tK - tJ, vol: 0.25 }, { t: tK, type: 'clock', dur: tL - tK, vol: 0.25 }, { t: tK + 0.4, type: 'paper', vol: 0.45 }, { t: tVag - 0.1, type: 'stamp', vol: 0.5 },
    { t: tL, type: 'clock', dur: tOnce - tL, vol: 0.35 }, { t: tL + 0.15, type: 'boom', vol: 0.3 }, { t: tL + 0.85, type: 'boom', vol: 0.25 }, { t: tOnce, type: 'bell', vol: 0.5 },
    { t: tM + 0.1, type: 'cheer', vol: 0.5 }, { t: tM, type: 'bells', dur: ctx.dur - tM, vol: 0.35 }, { t: tM + 0.4, type: 'crowd', dur: ctx.dur - tM - 0.4, vol: 0.3 }];

  const shots = [
    { t0: 0, set: St, p0: [5.5, 6.5, 9], l0: [0, 0, -11], p1: [4.6, 5.6, 7], l1: [0, 0, -11], fov0: 44, act: (t) => {
      St.tick(t); flagsR.forEach((f, i) => f.wave(t + i));
      return U.film(t) + U.badge(t, 'Rusia · 1917', 'Revolución', 'Cae el zar y los bolcheviques toman el poder', tRus - 0.3, tB);
    } },
    { t0: tB, set: Tr, p0: [1.9, 2.5, 0.9], l0: [-0.5, 0.45, -1.3], p1: [1.7, 2.4, 0.6], l1: [-0.5, 0.45, -1.3], fov0: 42, act: (t) => {
      ger.forEach((g, i) => { K.pose(g, i === 1 && t > tFir ? A.sign(t, i) : A.sit(t, i)); g.setFace(C.blinkEye(t, i), 'neutral'); });
      sov.forEach((g, i) => { K.pose(g, i === 2 && t > tFir ? A.sign(t, i + 4) : A.sit(t, i + 4)); g.setFace(C.blinkEye(t, i + 4), 'frown'); });
      return U.film(t) + U.badge(t, 'Brest-Litovsk · 3 de marzo de 1918', 'Rusia firma la paz', 'y sale de la guerra', tMar - 0.2, tC)
        + U.source(t, tPaz, tC, 'Alemania pudo llevar sus tropas del este al frente occidental');
    } },
    { t0: tC, set: Of, p0: [2.2, 1.0, 7.6], l0: [-1.5, 0.8, 0], p1: [3.0, 1.0, 7.2], l1: [1.0, 0.8, 0], fov0: 44, shake: t => booms.some(b => t > b.t0 && t < b.t0 + 0.3) ? 0.03 : 0, act: (t) => {
      Of.tick(t); booms.forEach(b => b.update(t)); const u = t - tC;
      storm.forEach((c, i) => { const x = c.x0 + u * 2.2; c.root.position.set(x, Of.heightAt(x, c.z0), c.z0); K.pose(c, A.charge(t, i)); c.setFace('squint', 'shout'); });
      return U.film(t) + U.badge(t, '21 de marzo de 1918', 'Ofensiva de primavera', 'La última gran ofensiva alemana', tOf - 0.3, tD);
    } },
    { t0: tD, set: Pt, p0: [5, 2.4, 8], l0: [-1, 1.0, -4], p1: [4.2, 2.3, 7.2], l1: [-1, 1.0, -4], fov0: 46, act: (t) => {
      Pt.tick(t); marchU(t); per.root.visible = false;
      ramp.forEach((c, i) => { const s = clamp(0.08 + i * 0.42 + (t - tD) * 0.13); c.root.position.set(-2, 1.72 + (0.14 - 1.72) * s + 0.03, -7.7 + 4.1 * s); K.pose(c, { ...C.walkArmed(t, 0.6, i), gun: 'back' }); c.setFace(C.blinkEye(t, i + 9), 'neutral'); });
      return U.film(t) + U.counter(t, tDiez - 0.3, tE + 0.3, 1230, 130, 10000, 'soldados de EE. UU. llegaban cada día', { from: 0, dur: 1.2, color: '#ffcf6a', w: 560 })
        + U.source(t, tDiez + 0.5, tE + 0.3, 'Francia, 1918 · más de 2 millones de soldados de EE. UU. al final de la guerra');
    } },
    { t0: tE, set: Pt, p0: [4.6, 1.05, 3.1], l0: [3.5, 0.85, 0.5], p1: [4.4, 1.02, 2.7], l1: [3.5, 0.85, 0.5], fov0: 42, act: (t) => {
      Pt.tick(t); marchU(t); per.root.visible = true;
      K.pose(per, A.proud(t, 1)); per.setFace(C.blinkEye(t, 1), 'neutral');
      return U.film(t) + U.nameplate(ctx, [3.6, 1.36, 0.9], NAMES.pershing[0], NAMES.pershing[1], tPer - 0.3, tF);
    } },
    { t0: tF, set: Ds, p0: [2.9, 0.95, 2.6], l0: [-1.4, 0.55, -9], p1: [2.7, 0.93, 2.3], l1: [-1.4, 0.55, -9], fov0: 40, act: (t) => {
      const lt = t - tF, laughing = t > tLaugh, turn = ss(tPers, tLaugh, t);
      vil.root.rotation.y = Math.PI + 0.35 - turn * 2.6;
      K.pose(vil, laughing ? { ...laugh(t, 1), hipY: -0.03, waist: [-4, 0, 0], thL: [-20, 0, 2], thR: [-20, 0, -2], knL: [30, 0, 0], knR: [30, 0, 0], gun: 'back' } : { ...C.crouch(t, 1, 0.5), gun: 'back' });
      vil.setFace(laughing ? 'happy' : 'squint', laughing ? 'teeth' : 'smile');
      far.forEach((c, i) => { c.root.position.set(3.4 - lt * 1.1 - (i % 4) * 1.0, 0, -13 - Math.floor(i / 4) * 0.8); K.pose(c, { ...C.walkArmed(t, 0.75, i * 0.4), gun: 'port' }); });
      perD.root.position.set(3.4 - lt * 1.1 - 4.3, 0, -13.4); K.pose(perD, C.walk(t, 0.75, 3));
      aimSun(Ds, 0, -4);
      return U.film(t) + U.tint('#d8b07a', 0.35) + U.pin(ctx, [perD.root.position.x, 1.5, -13.4], 'Pershing', 'México, 1916', ss(tF + 0.3, tF + 0.6, t))
        + U.badge(t, '1916 · México', 'La Expedición Punitiva', 'Persiguió a Pancho Villa once meses… y no lo atrapó', tMis - 0.1, tG);
    } },
    { t0: tG, set: Am, p0: [1.4, 0.8, 2.6], l0: [0, 1.0, -7], p1: [1.1, 0.85, 1.8], l1: [0, 1.0, -7], fov0: 46, act: (t) => {
      Am.tick(t); const u = t - tG;
      tanks.forEach((tk, i) => { const z = tk.z0 + u * 0.6; tk.position.set(tk.x0, Math.max(-0.05, Am.heightAt(tk.x0, z)) + 0.05, z); tk.rotation.set(0, -Math.PI / 2, 0.035 * Math.sin(u * 2.2 + i)); });
      inf.forEach((c, i) => { const z = c.z0 + u * 0.75; c.root.position.set(c.x0, Am.heightAt(c.x0, z), z); K.pose(c, A.advance(t, i)); c.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.badge(t, 'Amiens · 8 de agosto de 1918', 'Contraataque aliado', 'Con más de 500 tanques', tTan - 0.4, tH)
        + U.source(t, tTan, tH, '«El día negro del ejército alemán» (general Ludendorff)');
    } },
    { t0: tH, set: Mp, p0: [11, 40, 34], l0: [11, 0, 6], p1: [10.5, 37, 31], l1: [10.5, 0, 6], fov0: 40, act: (t) => {
      Mp.paint(1914);
      for (const st of ['GER', 'AUH', 'OTT', 'BUL']) Mp.tintState(1914, st, WM.COL.CENTRAL, 1, 0.8);
      [['BUL', s1], ['OTT', s2], ['AUH', s3]].forEach(([st, ta], i) => { const k = ss(ta - 0.1, ta + 0.25, t); Mp.tintState(1914, st, '#a9a392', k, 0.9); const f = wflags[i]; f.visible = k > 0.05; f.scale.setScalar(2.0 * (0.3 + 0.7 * k)); f.wave(t + i); });
      return U.film(t) + U.dateStrip(t, tH, tI + 0.3, [['29 sept.', 'Bulgaria', s1, '#f2efe8'], ['30 oct.', 'Imperio otomano', s2, '#f2efe8'], ['3 nov.', 'Austria-Hungría', s3, '#f2efe8']], { top: 96 })
        + WM.areaLabel(ctx, 10.5, 51.3, 'ALEMANIA, SOLA', fade(t, tRin - 0.1, tI + 1), 'st');
    } },
    { t0: tI, set: Ks, p0: [-1.2, top + 1.0, 4.8], l0: [3.0, top + 0.6, 2.6], p1: [-0.9, top + 0.95, 4.6], l1: [3.0, top + 0.6, 2.6], fov0: 42, act: (t) => {
      Ks.tick(t); const lt = t - tI;
      kai.root.position.x = 3.4 - lt * 0.5; K.pose(kai, { ...C.walk(t, 0.5, 2), head: [14, 0, 0] }); kai.setFace(C.blinkEye(t, 2), 'frown');
      esc.forEach((c, i) => { c.root.position.x = c.x0 - lt * 0.5; K.pose(c, C.walk(t, 0.5, i + 4)); c.setFace(C.blinkEye(t, i + 4), 'neutral'); });
      return U.film(t) + U.nameplate(ctx, [kai.root.position.x, top + 1.35, 2.7], NAMES.kaiser[0], NAMES.kaiser[1], tI + 0.2, tJ)
        + U.badge(t, '10 de noviembre de 1918', 'Huye a los Países Bajos', 'Había abdicado el día anterior', tKai - 0.1, tJ);
    } },
    { t0: tJ, set: Cg, p0: [6.5, 1.4, 8.0], l0: [0, 1.6, 0], p1: [5.4, 1.35, 6.8], l1: [0, 1.6, 0], fov0: 42, act: (t) => {
      Cg.tick(t); sent.forEach((c, i) => { K.pose(c, A.guard(t, i)); c.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.datePage(t, tJ + 0.2, tK + 0.2, 'Armisticio', 'NOVIEMBRE', '11', '1918', { x: 1560, y: 110, accent: '#2a4a7a' });
    } },
    { t0: tK, set: Wg, p0: [3.4, 1.75, 0.6], l0: [-0.6, 0.6, -0.5], p1: [3.1, 1.7, 0.5], l1: [-0.6, 0.6, -0.5], fov0: 46, act: (t) => {
      K.pose(fo, A.sit(t, 1)); fo.setFace(C.blinkEye(t, 1), 'neutral');
      allies.forEach((c, i) => { K.pose(c, A.sit(t, i + 2)); c.setFace(C.blinkEye(t, i + 2), 'neutral'); });
      germ.forEach((c, i) => { K.pose(c, i === 1 && t > tK + 0.4 ? A.sign(t, i + 5) : A.sit(t, i + 5)); c.setFace(C.blinkEye(t, i + 5), 'frown'); });
      return U.film(t) + U.nameplate(ctx, [fo.root.position.x, 1.3, fo.root.position.z], NAMES.foch[0], NAMES.foch[1], tK + 0.3, tL)
        + U.stamp(t, 'ARMISTICIO', tVag - 0.1, tL + 0.2, { x: 560, y: 330, rot: -7 })
        + U.badge(t, 'Bosque de Compiègne', 'Se firma el armisticio', 'Hacia las 5 de la mañana; entra en vigor a las 11', tK + 0.2, tL);
    } },
    { t0: tL, set: Tz, p0: [1.2, 1.0, 0.9], l0: [-1.4, 0.65, -0.5], p1: [1.0, 0.98, 0.8], l1: [-1.5, 0.65, -0.5], fov0: 50, act: (t) => {
      Tz.tick(t); joy.forEach(c => { c.root.visible = false; }); waitT.forEach(c => { c.root.visible = true; }); offT.root.visible = true;
      waitT.forEach((c, i) => { K.pose(c, A.seated(t, i)); c.setFace(C.blinkEye(t, i), 'neutral'); });
      K.pose(offT, { ...C.idle(t, 5, 0.3), armL: [-50, -35, -55], elbL: [0, -115, 0], head: [24, 8, 0], gun: 'none' }); offT.setFace('open', 'neutral');
      const mm = 59 + ss(tOnce - 0.25, tOnce + 0.05, t);
      return U.film(t) + U.clock(t, tL + 0.1, tM + 0.3, 10, mm, { x: 330, y: 150, size: 280 });
    } },
    { t0: tM, set: Tz, p0: [0.4, Y + 0.45, -6.0], l0: [0, Y + 0.95, -1.6], p1: [0.3, Y + 0.5, -5.4], l1: [0, Y + 0.95, -1.6], fov0: 50, act: (t) => {
      Tz.tick(t); waitT.forEach(c => { c.root.visible = false; }); offT.root.visible = false;
      joy.forEach((c, i) => { c.root.visible = true; K.pose(c, { ...A.jubilant(t, i), gun: 'back' }); c.setFace('happy', 'teeth'); });
      return U.film(t) + U.titleCard(t, tCal - 0.25, ctx.dur + 1, '11 de noviembre de 1918 · 11:00', 'LOS CAÑONES CALLARON', 'Termina la lucha en el frente occidental', 110);
    } },
  ];
  const inst = { scene: St, scenes: [St, Tr, Of, Pt, Ds, Am, Mp, Ks, Cg, Wg, Tz], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
