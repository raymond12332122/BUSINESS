import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as LP from '../../lib/props.js';
import { ss, clamp } from '../../lib/util.js';
import { badge } from '../../lib/kit.js';
import * as N from '../props.js';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as FX from '../fx.js';
import * as A from '../../mx/anim.js';
import { runShots, wt } from '../../mx/shots.js';
import { film, nameplate } from '../../mx/ui.js';
import { mapSet, city, fade, shipToken, GM } from '../mapkit.js';

export { preload } from '../mapkit.js';
const CITY = GM.CITY;

export function build(ctx) {
  const L = ctx.L;
  const tProt = wt(L[0], 'protegida'), tFlota = wt(L[0], 'flota'), tNel = wt(L[1], 'nelson'), tDerr = wt(L[1], 'derroto'), tTraf = wt(L[1], 'trafalgar');
  const tNel2 = wt(L[1], 'nelson', 1), tPero = wt(L[1], 'pero'), tDom = wt(L[1], 'dominaron');

  // ---- 1. The white cliffs of Dover
  const D = S.dover();
  const dShips = [[-30, -16, 0.0], [-12, -24, 0.0], [8, -18, 0.0]].map(([x, z], i) => { const sh = N.ship({ len: 11, flag: 'gb', seed: 3 + i }); sh.rotation.y = Math.PI / 2; sh.x0 = x; sh.position.set(x, 0, z); D.add(sh); return sh; });
  // ---- 2. The Royal Navy in line ahead
  const O = S.openSea('day');
  const fleet = [...Array(6)].map((_, i) => { const sh = N.ship({ len: 10, flag: 'gb', decks: i % 3 ? 2 : 3, seed: 10 + i }); sh.rotation.y = Math.PI / 2; O.add(sh); sh.i = i; return sh; });
  // ---- 3. Nelson on the quarterdeck
  const Dk = S.deck('day');
  const nel = K.person(Dk, 'nelson', 'nelson', 0.9, -0.4, 0.6);
  const helm = K.person(Dk, 'helios', 'sailor', 0.0, 3.2, Math.PI);
  const tars = [[-3.4, -3.0], [3.4, -3.2], [-3.3, 4.8]].map(([x, z], i) => K.person(Dk, ['doto', 'tamamo', 'oguri'][i], 'sailor', x, z, x < 0 ? Math.PI / 2 : -Math.PI / 2));
  // ---- 4. Trafalgar: the British columns cut the Franco-Spanish line
  const B = S.openSea('overcast', { smoke: true });
  const line = [...Array(7)].map((_, i) => { const fl = i % 2 ? 'es' : 'fr'; const sh = N.ship({ len: 10, flag: fl, hull: fl === 'es' ? '#3a2a20' : '#2a2420', band: fl === 'es' ? '#b8342f' : '#d8b04a', seed: 20 + i }); sh.position.set(-24 + i * 8, 0, -6); sh.rotation.y = Math.PI / 2; B.add(sh); return sh; });
  const brits = [...Array(3)].map((_, i) => { const sh = N.ship({ len: 10, flag: 'gb', decks: 3, seed: 40 + i }); sh.position.set(-1 + i * 1.2, 0, 14 + i * 12); sh.rotation.y = Math.PI; B.add(sh); return sh; });
  const fire = new FX.Volleys(B, { size: 1.0, life: 6, drift: [0.5, 0.2, 0.2], flashSize: 1.4 });
  const portsOf = (sh, side) => { sh.updateMatrixWorld(true); return sh.ports.filter(p => Math.sign(p.x) === side).map(p => sh.localToWorld(p.clone())); };
  const tB0 = tDerr - 0.4, tBend = wt(L[1], 'nelson', 1) - 0.25;
  const uAt = t => clamp((t - (tDerr - 0.25)) / (tBend - (tDerr - 0.25)));
  const placeLine = (sh, i, t) => sh.position.set(-24 + i * 8 + uAt(t) * 3, 0, -6);
  const placeBrit = (sh, i, t) => sh.position.set(-1 + i * 1.2, 0, 14 + i * 12 - uAt(t) * 16);
  line.forEach((sh, i) => { for (let k = 0; k < 3; k++) { const tt = tB0 + 0.3 + i * 0.37 + k * 1.6; placeLine(sh, i, tt); fire.volley(tt, portsOf(sh, -1).filter((_, j) => j % 3 === 0), [0, 0, 1], 0.05, { puffs: 2, size: 1.5 }); } });
  brits.forEach((sh, i) => { for (let k = 0; k < 3; k++) for (const sd of [-1, 1]) { const tt = tB0 + 0.8 + i * 0.5 + k * 1.5 + (sd > 0 ? 0.3 : 0); placeBrit(sh, i, tt); fire.volley(tt, portsOf(sh, sd).filter((_, j) => j % 3 === 0), [sd, 0, 0], 0.05, { puffs: 2, size: 1.5 }); } });
  const haze = FX.haze(B, { n: 22, box: [-40, 40, 1, 6, -30, 8], color: '#dcd8d0', size: 12, opacity: 0.32 });
  // ---- 5. Nelson falls: the crew mourns, the flag at half-mast
  const Dk2 = S.deck('overcast');
  const flag2 = N.flag('gb', 4.2, 1.5, 0.9); flag2.position.set(-2.7, 0, -3.4); Dk2.add(flag2); flag2.cloth.position.y = 2.2;
  const mourn = [[-1.7, -2.2, 0.5], [-0.6, -1.6, 0.15], [0.6, -1.7, -0.15], [1.7, -2.3, -0.5], [0.0, -2.8, 0]].map(([x, z, y], i) => { return K.person(Dk2, ['doto', 'tamamo', 'oguri', 'helios', 'daiwa'][i], 'sailor', x, z, y); });
  const smoke2 = FX.haze(Dk2, { n: 14, box: [-8, 8, 1, 4, -12, -3], color: '#cfcbc4', size: 7, opacity: 0.4 });
  // ---- 6. Map: Britannia rules the waves
  const M = mapSet({ per: '1805' });
  const navy = [[-12, 47], [-8, 44], [-5, 50.5], [2, 51.2], [-11, 39], [-7, 36], [0, 37.8], [5, 39.5], [12, 37], [18, 34.5], [4, 56], [8, 57.5], [17, 56.5], [22, 58.2], [-17, 51]].map(([lo, la], i) => {
    const sh = shipToken('#c0272d'); const [x, y, z] = GM.pos(lo, la, 0.0); sh.position.set(x, 0.0, z); sh.rotation.y = i * 1.3; sh.scale.setScalar(1.3); sh.visible = false; M.add(sh); sh.d = i * 0.12; return sh; });

  const sfx = [{ t: 0.1, type: 'waves', dur: tFlota - 0.2, vol: 0.6 }, { t: 0.3, type: 'wind', dur: tFlota, vol: 0.3 }, { t: tFlota - 0.3, type: 'creak', vol: 0.5 },
    { t: L[1].t0 - 0.2, type: 'waves', dur: tDerr - L[1].t0, vol: 0.5 }, ...fire.times().filter((t, i) => i % 4 === 0).map(t => ({ t, type: 'cannon', vol: 0.35 })),
    { t: tNel2 - 0.2, type: 'sting2', vol: 0.6 }, { t: tPero, type: 'whoosh', vol: 0.5 }, { t: tDom, type: 'sting', vol: 0.6 }];

  const tO = tProt - 0.15, tDk = L[1].t0 - 0.1, tBt = tDerr - 0.25, tH = tNel2 - 0.25, tM = tPero - 0.2;
  const shots = [
    { t0: 0, set: D, p0: [6, 3.0, 14], l0: [-2, 8.5, -40], p1: [3, 3.4, 10], l1: [-4, 8.5, -40], fov0: 40, act: (t) => {
      dShips.forEach((sh, i) => { sh.position.x = sh.x0 + t * 2.2; sh.wave(t + i); sh.position.y = 0.06 * Math.sin(t * 1.1 + i); sh.rotation.z = 0.02 * Math.sin(t * 0.9 + i); });
      D.sea.wave(t); D.flag.wave(t);
      return film(t) + badge(t, '1805', 'Gran Bretaña', 'Una isla protegida por el mar', 0.4, tO - 0.1);
    } },
    { t0: tO, set: O, p0: [-12, 1.8, 13], l0: [-2, 3.0, 0], p1: [-4, 2.2, 13], l1: [6, 3.0, 0], fov0: 40, ease: 'lin', act: (t) => {
      fleet.forEach(sh => { sh.position.set(-18 + sh.i * 9 + (t - tO) * 2.4, 0.06 * Math.sin(t * 1.1 + sh.i), -0.5 * sh.i); sh.wave(t + sh.i); sh.rotation.z = 0.025 * Math.sin(t * 0.9 + sh.i); });
      O.sea.wave(t); S.aimSun(O, 0, 0);
      return film(t) + badge(t, 'La Royal Navy', 'La flota más poderosa del mundo', 'Más de cien barcos de guerra', tFlota - 0.2, tDk);
    } },
    { t0: tDk, set: Dk, p0: [3.1, 1.3, 2.6], l0: [0.6, 0.95, -0.7], p1: [2.8, 1.25, 2.1], l1: [0.6, 0.95, -0.7], fov0: 36, act: (t) => {
      K.pose(nel, A.proud(t, 1)); nel.setFace(C.blinkEye(t, 1), 'neutral');
      K.pose(helm, C.operate(t, 2)); helm.setFace(C.blinkEye(t, 2), 'neutral');
      tars.forEach((c, i) => { K.pose(c, A.work(t, i)); c.setFace(C.blinkEye(t, i + 3), 'neutral'); });
      Dk.sea.wave(t); S.aimSun(Dk, 0, 0);
      return film(t) + nameplate(ctx, [0.9, 1.45, -0.4], 'Horatio Nelson', 'Almirante británico', tNel - 0.1, tBt + 0.1);
    } },
    { t0: tBt, set: B, p0: [16, 9, 26], l0: [0, 1.5, 0], p1: [12, 7.5, 21], l1: [0, 1.5, -1], fov0: 40, act: (t) => {
      line.forEach((sh, i) => { placeLine(sh, i, t); sh.wave(t + i); sh.position.y = 0.05 * Math.sin(t + i); });
      brits.forEach((sh, i) => { placeBrit(sh, i, t); sh.wave(t + i); sh.position.y = 0.05 * Math.sin(t * 1.2 + i); });
      fire.update(t); haze(t); B.sea.wave(t); S.aimSun(B, 0, 0);
      return film(t) + badge(t, '21 de octubre de 1805', 'La batalla de Trafalgar', 'Nelson parte en dos la línea francoespañola', tBt + 0.3, tH - 0.1)
        + `<div style="position:absolute;left:80px;top:90px;opacity:${fade(t, tBt + 0.4, tH)};font:800 26px Inter;color:#fff;background:rgba(20,16,14,.78);padding:14px 20px;border-radius:12px;line-height:1.7">
          <div><span style="display:inline-block;width:22px;height:22px;border-radius:5px;background:#c0272d;vertical-align:-4px;margin-right:10px"></span>Gran Bretaña · 27 barcos</div>
          <div><span style="display:inline-block;width:22px;height:22px;border-radius:5px;background:#2f4590;vertical-align:-4px;margin-right:10px"></span>Francia y España · 33 barcos</div></div>`;
    } },
    { t0: tH, set: Dk2, p0: [0.2, 1.2, 1.9], l0: [-0.9, 1.25, -3.0], p1: [0.1, 1.15, 1.3], l1: [-0.9, 1.27, -3.0], fov0: 38, act: (t) => {
      smoke2(t); flag2.wave(t * 0.5, 0.6); Dk2.sea.wave(t); S.mood(Dk2, { sun: 1.3 });
      mourn.forEach((c, i) => { K.pose(c, A.sad(t, i)); c.setFace('flat', 'frown'); });
      return film(t) + `<div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,.45) 100%)"></div>`
        + badge(t, 'Trafalgar', 'Nelson muere en la batalla', 'Pero su flota obtiene una victoria total', tH + 0.3, tM - 0.1);
    } },
    { t0: tM, set: M, p0: [-5, 30, 21], l0: [-4, 0, 2.5], p1: [-5, 33, 24], l1: [-4, 0, 2.5], fov0: 38, act: (t) => {
      navy.forEach(sh => { sh.visible = t > tM + 0.3 + sh.d; const k = clamp((t - tM - 0.3 - sh.d) / 0.3); sh.scale.setScalar(1.6 * k * (1 + 0.25 * Math.sin(k * Math.PI))); sh.position.y = 0.05 * Math.sin(t * 2 + sh.d * 9); });
      return film(t) + city(ctx, M, 'Londres', fade(t, tM + 0.2, ctx.dur), 'c big')
        + `<div style="position:absolute;left:50%;top:110px;transform:translateX(-50%);opacity:${fade(t, tDom - 0.2, ctx.dur)};text-align:center;background:rgba(20,16,14,.82);padding:18px 40px;border-radius:14px;border-bottom:6px solid #c0272d">
          <div style="font:800 24px Inter;letter-spacing:.3em;color:#ffb627">1805 – 1815</div><div style="font:900 54px/1.1 'Inter Display',Inter;color:#fff">Gran Bretaña domina los mares</div></div>`;
    } },
  ];
  const inst = { scene: D, scenes: [D, O, Dk, B, Dk2, M], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
