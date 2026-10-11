import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as F from '../../lib/fx.js';
import { ss, clamp } from '../../lib/util.js';
import * as N from '../props.js';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as FX from '../fx.js';
import * as A from '../../mx/anim.js';
import { Troop } from '../troops.js';
import { runShots, wt } from '../../mx/shots.js';
import { film, stamp } from '../../mx/ui.js';

// Numbered tactic card (top-left).
function tactic(t, a, b, n, title, sub, color = '#2f4590') {
  const k = ss(a, a + 0.35, t) * (1 - ss(b - 0.3, b, t)); if (k <= 0) return '';
  return `<div style="position:absolute;left:80px;top:80px;display:flex;align-items:center;gap:22px;opacity:${k};transform:translateX(${(1 - ss(a, a + 0.35, t)) * -40}px);
    background:rgba(20,16,14,.86);padding:18px 30px 18px 18px;border-radius:16px;border-left:8px solid #e0b84a;max-width:820px">
    <div style="flex:none;width:92px;height:92px;border-radius:50%;background:${color};border:5px solid #e0b84a;color:#fff;font:900 56px/82px 'Inter Display',Inter;text-align:center">${n}</div>
    <div><div style="font:900 52px/1.05 'Inter Display',Inter;color:#fff;letter-spacing:.01em">${title}</div><div style="font:600 26px/1.3 Inter;color:#e9dfcc;margin-top:6px">${sub}</div></div></div>`;
}

export function build(ctx) {
  const L = ctx.L;
  const tPri = wt(L[0], 'primero'), tCue = wt(L[0], 'cuerpos'), tMar = wt(L[0], 'marchaban'), tJun = wt(L[0], 'juntaban'), tBat = wt(L[0], 'batalla');
  const tCon = wt(L[1], 'concentraba'), tRom = wt(L[1], 'romper');
  const tTer = wt(L[2], 'tercero'), tDes = wt(L[2], 'destruir'), tGol = wt(L[2], 'golpe');
  const tMer = wt(L[3], 'merito'), tNob = wt(L[3], 'noble');

  // ---- 1. The tent: why did he win so often?
  const Tn = S.tent();
  const nap = K.person(Tn, 'napoleon', 'napoleon', 0.1, -1.65, 0);
  // ---- 2 & 4. The strategy board: corps on separate roads, then the decisive blow
  const Bd = S.board();
  const TW = 8.8, TD = 5.5, TY = 1.005;
  const P = (u, v) => new THREE.Vector3((u - 0.5) * TW, TY, (v - 0.5) * TD);
  const roads = [0.1, 0.38, 0.62, 0.9].map(y0 => new THREE.QuadraticBezierCurve3(P(0.05, y0), P(0.35, y0 * 0.5 + 0.25), P(0.66, 0.5 + (y0 - 0.5) * 0.55)));
  const corps = ['I', 'II', 'III', 'IV'].map((lab, i) => { const b = S.block('#2f4590', '#f4f1ea', lab); Bd.add(b); return b; });
  const foes = [[3.0, -0.75], [3.0, 0.0], [3.0, 0.75], [3.75, -0.4], [3.75, 0.4]].map(([x, z]) => { const b = S.block('#e8e4dc', '#1d1b1c', ''); b.position.set(x, TY, z); b.rotation.y = Math.PI; b.p0 = [x, z]; Bd.add(b); return b; });
  const boom = F.bubble('💥', { bg: null, font: 170 }); boom.visible = false; Bd.add(boom);
  // ---- 3. The grand battery
  const Fd = S.field('day', { seed: 41 });
  const guns = [-6, -3.6, -1.2, 1.2, 3.6, 6].map(x => { const g = N.fieldGun(); g.position.set(x, 0, 0); g.rotation.y = Math.PI; Fd.add(g); return g; });
  const crew = guns.map((g, i) => K.person(Fd, ['doto', 'oguri', 'helios', 'tamamo', 'suzuka', 'daiwa'][i], 'artillero', g.position.x + 0.7, 0.8, Math.PI - 0.4));
  const enemyL = new Troop(Fd, { rows: 3, cols: 10, seed: 81, coat: '#e8e4dc', hat: 'shako', hatColor: '#1d1b1c', plume: null, spacing: [0.66, 0.8] });
  const enemyR = new Troop(Fd, { rows: 3, cols: 10, seed: 82, coat: '#e8e4dc', hat: 'shako', hatColor: '#1d1b1c', plume: null, spacing: [0.66, 0.8] });
  const sv = new FX.Volleys(Fd, { size: 0.9, life: 5, drift: [0.3, 0.2, 0], flashSize: 1.0 });
  const salvo = [tCon + 0.3, tCon + 1.5, tRom - 0.3]; const fireT = [];
  guns.forEach((g, i) => salvo.forEach(s0 => { const tt = s0 + i * 0.07; g.updateMatrixWorld(true); const p = new THREE.Vector3(); g.muzzle.getWorldPosition(p); sv.add(tt, p, [0, 0.05, -1], { puffs: 3, size: 1.6 }); fireT.push([i, tt]); }));
  const dirt = new FX.Volleys(Fd, { color: '#8a7350', size: 1.0, life: 2.4, drift: [0, 0.3, 0], flashSize: 0.6 });
  salvo.forEach((s0, k) => { for (let j = 0; j < 5; j++) dirt.add(s0 + 0.55 + j * 0.06, [-1.6 + j * 0.8 + (k - 1) * 0.3, 0.2, -24 + (j % 2) * 0.8], [0, 1, 0], { puffs: 2, size: 1.4 }); });
  // ---- 5. Promotion by merit
  const Pm = S.field('golden', { seed: 51 });
  const napM = K.person(Pm, 'napoleon', 'napoleon', -0.55, 0.2, 1.05);
  const sold = K.person(Pm, 'oguri', 'fusilier', 0.55, 0.2, -1.05); [napM, sold].forEach(c => K.faceTint(c, '#f4dfd0'));
  const medal = K.star(); medal.scale.setScalar(1.7); medal.visible = false; sold.attach('chest', medal, [-0.07, 0.43, 0.13]);
  const ranks = new Troop(Pm, { rows: 2, cols: 16, seed: 90, coat: '#2f4590' });
  const flagP = N.flag('eagle', 3.0, 1.2, 0.8, { finial: 'eagle' }); flagP.position.set(-2.8, 0, -2.6); Pm.add(flagP);
  const spark = [...Array(8)].map(() => { const s = F.bubble('✨', { bg: null, font: 160 }); s.visible = false; Pm.add(s); return s; });

  const sfx = [{ t: 0.3, type: 'tick', vol: 0.4 }, { t: tPri - 0.1, type: 'pop', vol: 0.6 }, { t: tMar, type: 'march', dur: tJun - tMar + 0.8, vol: 0.5 }, { t: tBat - 0.1, type: 'thud', vol: 0.7 },
    { t: L[1].t0 - 0.1, type: 'pop', vol: 0.6 }, ...salvo.map(t => ({ t, type: 'broadside', vol: 0.7 })), { t: tTer - 0.1, type: 'pop', vol: 0.6 },
    { t: tDes, type: 'charge', vol: 0.5 }, { t: tGol, type: 'boom', vol: 0.7 }, { t: L[3].t0, type: 'drums', dur: 2.2, vol: 0.5 }, { t: tMer, type: 'sting2', vol: 0.6 }, { t: tMer + 0.1, type: 'cheer', vol: 0.5 }];

  const tB = tPri - 0.25, tA = L[1].t0 - 0.15, tB2 = tTer - 0.2, tP = L[3].t0 - 0.2;
  const shots = [
    { t0: 0, set: Tn, p0: [0.3, 1.55, 1.9], l0: [0.05, 0.7, -1.2], p1: [0.25, 1.45, 1.4], l1: [0.05, 0.7, -1.2], fov0: 40, act: (t) => {
      K.pose(nap, { ...C.idle(t, 2, 0.5), chest: [6, 0, 0], head: [10, 8 * Math.sin(t * 0.7), 0] }); nap.setFace(C.blinkEye(t, 2), 'neutral');
      const k = ss(0.6, 1.0, t) * (1 - ss(tB - 0.3, tB, t));
      return film(t) + (k > 0 ? `<div class="shout" style="top:150px;opacity:${k};transform:scale(${0.85 + 0.15 * ss(0.6, 1.0, t)})">¿Por qué ganaba tanto?</div>` : '');
    } },
    { t0: tB, set: Bd, p0: [-0.5, 7.2, 6.4], l0: [0.2, 1.0, 0.2], p1: [0.3, 6.6, 5.6], l1: [0.4, 1.0, 0.2], fov0: 40, act: (t) => board(t)
        + tactic(t, tPri, tA, '1', 'Velocidad', 'Cuerpos de ejército por caminos separados… que se juntan justo para la batalla') },
    { t0: tA, set: Fd, p0: [-9.0, 1.7, 5.0], l0: [1.0, 0.7, -10], p1: [-8.0, 1.8, 4.0], l1: [1.5, 0.6, -14], fov0: 40, act: (t) => {
      guns.forEach((g, i) => { const r = fireT.reduce((a, [j, f]) => a + (j === i && t > f ? Math.max(0, 1 - (t - f) * 3) : 0), 0); g.position.z = 0.25 * r; });
      crew.forEach((c, i) => { K.pose(c, C.crouch(t, i, 0.3)); c.setFace(C.blinkEye(t, i), 'neutral'); });
      const split = clamp((t - tRom - 0.2) / 1.6);
      enemyL.update(t, { x: -3.4 - split * 3, z: -24, march: split > 0 && split < 1 ? 1 : 0 }); enemyR.update(t, { x: 3.4 + split * 3, z: -24, march: split > 0 && split < 1 ? 1 : 0 });
      sv.update(t); dirt.update(t); S.aimSun(Fd, 0, -4);
      return film(t) + tactic(t, L[1].t0, tB2, '2', 'Artillería', 'Muchos cañones disparando a un solo punto para romper la línea enemiga');
    } },
    { t0: tB2, set: Bd, p0: [0.6, 6.0, 5.2], l0: [1.6, 1.0, 0.0], p1: [1.4, 5.0, 4.2], l1: [2.2, 1.0, 0.0], fov0: 40, act: (t) => board(t)
        + tactic(t, tTer, tP, '3', 'Batalla decisiva', 'Destruir al ejército enemigo de un solo golpe') },
    { t0: tP, set: Pm, p0: [0.0, 1.05, 3.3], l0: [0, 0.85, 0.2], p1: [0.0, 1.0, 2.7], l1: [0, 0.85, 0.2], fov0: 36, act: (t) => {
      const pin = t > tMer - 0.05;
      K.pose(napM, pin && t < tMer + 0.6 ? C.offer(t, 2, 1) : A.proud(t, 2)); napM.setFace(C.blinkEye(t, 2), pin ? 'smile' : 'neutral');
      K.pose(sold, { ...(t > tMer + 0.5 ? C.salute(t, 3) : C.idle(t, 3, 0.4)), gun: 'none' }); sold.setFace(t > tMer + 0.3 ? 'sparkle' : C.blinkEye(t, 3), t > tMer + 0.3 ? 'grin' : 'neutral');
      medal.visible = pin; ranks.update(t, { x: 0.5, z: -3.6 }); flagP.wave(t); S.aimSun(Pm, 0, 0);
      sold.root.updateMatrixWorld(true); const mp = new THREE.Vector3(); medal.getWorldPosition(mp);
      spark.forEach((s, i) => { const k = (t - tMer) / 1.2; s.visible = k > 0 && k < 1; if (!s.visible) return; const a = i / 8 * Math.PI * 2; s.position.set(mp.x + Math.cos(a) * (0.1 + 0.4 * k), mp.y + Math.sin(a) * (0.1 + 0.35 * k), mp.z + 0.1); const sc = 0.18 * Math.sin(k * Math.PI); s.scale.set(sc, sc, 1); });
      return film(t) + tactic(t, L[3].t0, ctx.dur, '+', 'Mérito', 'Cualquier soldado podía llegar a general', '#b5332e')
        + stamp(t, 'MÉRITO,<br>NO NOBLEZA', tNob - 0.4, ctx.dur, { x: 1580, y: 250, rot: -7 });
    } },
  ];
  function board(t) {
    corps.forEach((b, i) => { const u = clamp((t - tCue + 0.3 - i * 0.12) / (tBat - tCue - 0.2)), e = u * u * (3 - 2 * u);
      const push = clamp((t - tDes) / 0.9), p = roads[i].getPointAt(Math.min(1, e)); b.position.set(p.x + push * 0.55, TY, p.z * (1 - push * 0.35));
      const tg = roads[i].getTangentAt(Math.min(0.999, e)); b.rotation.y = Math.atan2(tg.x, tg.z) - Math.PI / 2; });
    foes.forEach((b, i) => { const k = clamp((t - tGol + 0.05 - i * 0.04) / 0.5); b.rotation.set(0, Math.PI, -k * Math.PI / 2 * (i % 2 ? 1 : -1) * 0.9); b.position.set(b.p0[0] + k * (0.6 + i * 0.1), TY + 0.1 * Math.sin(k * Math.PI), b.p0[1] * (1 + k * 0.5)); });
    boom.position.set(2.9, TY + 0.9, 0); F.popSprite(boom, t, tGol - 0.05, tGol + 0.9, 1.2, TY + 0.9);
    return film(t);
  }
  const inst = { scene: Tn, scenes: [Tn, Bd, Fd, Pm], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
