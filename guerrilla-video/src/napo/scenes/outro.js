import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import * as N from '../props.js';
import * as MX from '../../mx/props.js';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as A from '../../mx/anim.js';
import { runShots, wt } from '../../mx/shots.js';
import { film, nameplate } from '../../mx/ui.js';

const fade = (t, a, b, f = 0.35) => ss(a, a + f, t) * (1 - ss(b - f, b, t));

export function build(ctx) {
  const L = ctx.L;
  const tEmp = wt(L[0], 'emperador'), tY = wt(L[0], 'y$'), tIsla = wt(L[0], 'isla');

  // ---- 1. The young artillery officer (Toulon)
  const T = S.toulon('golden');
  const gun = N.fieldGun(); gun.position.set(-0.4, 0, 0.2); gun.rotation.y = Math.PI - 0.5; T.add(gun);
  const young = K.person(T, 'napoleonYoung', 'napoleonYoung', 0.6, 0.6, 0.5); K.faceTint(young, '#f6e4cf');
  // ---- 2. The emperor
  const Th = S.palaceFR('#efe6d2', { imperial: true });
  const emp = K.person(Th, 'coronation', 'coronation', 0, -2.15, 0); K.faceTint(emp, '#f6e6da');
  // ---- 3. Saint Helena at sunset
  const SH = S.stHelena();
  const hN = SH.island.heightAt(-0.6, -10.8), hC = Math.max(SH.island.heightAt(0.9, -6.4), SH.island.heightAt(0.6, -7.4), hN);
  const napH = K.person(SH, 'napoleon', 'napoleon', -0.6, -10.8, Math.PI + 0.25); napH.root.position.y = hN - 0.05;
  // ---- 4. The cast
  const F = S.field('golden', { ground: ['#9aa65e', '#8a9852'], seed: 77 });
  const order = [['nelson', 'nelson', 'Nelson'], ['josefina', 'josefina', 'Josefina'], ['zar', 'zar', 'Alejandro I'], ['napoleon', 'napoleon', 'Napoleón'], ['wellington', 'wellington', 'Wellington'], ['blucher', 'blucher', 'Blücher'], ['jose', 'jose', 'José Bonaparte'], ['hidalgo', 'hidalgo', 'Miguel Hidalgo']];
  const cast = order.map(([w, o], i) => K.person(F, w, o, -4.2 + i * 1.2, 6 - Math.abs(i - 3.5) * 0.1, 0));
  const flags = [['gb', -5.0], ['ru', -3.0], ['fr', -1.0], ['pr', 1.0], ['es', 3.0]].map(([k, x]) => { const f = N.flag(k, 2.35, 1.0, 0.62); f.position.set(x - 0.5, 0, 3.0); F.add(f); return f; });
  const mx = MX.flag('mx', 2.35, 1.0, 0.62); mx.position.set(4.5, 0, 3.0); F.add(mx); flags.push(mx);

  const sfx = [{ t: 0.3, type: 'cannon', vol: 0.4 }, { t: tEmp - 0.1, type: 'sting2', vol: 0.5 }, { t: tY - 0.1, type: 'waves', dur: L[1].t0 - tY + 0.4, vol: 0.5 }, { t: L[1].t0 - 0.1, type: 'sting', vol: 0.8 }];

  const tB = tEmp - 0.35, tC = tY - 0.2, tD = L[1].t0 - 0.35;
  const shots = [
    { t0: 0, set: T, p0: [2.6, 1.0, 3.6], l0: [0.3, 0.85, 0.2], p1: [2.2, 1.0, 3.0], l1: [0.3, 0.85, 0.2], fov0: 36, act: (t) => {
      K.pose(young, A.proud(t, 1)); young.setFace(C.blinkEye(t, 1), 'smile'); T.ships.forEach((s, i) => s.wave(t + i)); T.sea.wave(t); S.aimSun(T, 0, 0);
      return film(t);
    } },
    { t0: tB, set: Th, p0: [0.4, 0.88, 0.9], l0: [0, 0.8, -2.2], p1: [0.28, 0.9, 0.35], l1: [0, 0.82, -2.2], fov0: 34, act: (t) => {
      K.pose(emp, A.proud(t, 2)); emp.setFace(C.blinkEye(t, 2), 'neutral'); emp.cape.wave(t, 0.03, 0);
      return film(t);
    } },
    { t0: tC, set: SH, p0: [1.0, hC + 1.15, -6.0], l0: [-1.2, hN + 0.4, -24], p1: [0.85, hC + 1.05, -7.0], l1: [-1.2, hN + 0.4, -24], fov0: 38, act: (t) => {
      const p = A.sad(t, 4); p.head = [4, 0, 0]; K.pose(napH, p); napH.setFace('flat', 'frown'); SH.sea.wave(t);
      return film(t);
    } },
    { t0: tD, set: F, p0: [0, 1.15, 13.2], l0: [0, 1.05, 6], p1: [0, 1.4, 15.6], l1: [0, 1.15, 6], fov0: 32, ease: 'out', act: (t) => {
      cast.forEach((c, i) => { K.pose(c, i === 3 ? A.proud(t, i) : (t > L[1].t0 + 1.2 ? C.cheer(t + i * 0.17, i) : C.idle(t, i, 0.5))); c.setFace(t > L[1].t0 + 1.2 ? (i % 3 ? 'happy' : 'sparkle') : C.blinkEye(t, i), t > L[1].t0 + 1.2 ? 'teeth' : 'smile'); if (c.cape) c.cape.wave(t, 0.1, 0); });
      flags.forEach((f, i) => f.wave(t + i * 0.7)); S.aimSun(F, 0, 6);
      const k = ss(L[1].t0, L[1].t0 + 0.5, t);
      return film(t) + `<div class="title" style="top:80px;opacity:${k};transform:scale(${0.94 + 0.06 * k})"><div class="k">ESAS FUERON</div><div class="h" style="font-size:112px">LAS GUERRAS NAPOLEÓNICAS</div><div class="s">1803 – 1815</div></div>`
        + cast.map((c, i) => { const kk = fade(t, L[1].t1 + 0.2 + i * 0.08, ctx.dur); if (kk <= 0) return ''; const [x, y, ok] = ctx.project([c.root.position.x, 0.0, c.root.position.z]); return ok ? `<div class="lbl c" style="left:${x}px;top:${y + 46}px;opacity:${kk}">${order[i][2]}</div>` : ''; }).join('');
    } },
  ];
  const inst = { scene: T, scenes: [T, Th, SH, F], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
