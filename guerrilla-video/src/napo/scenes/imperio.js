import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import { badge } from '../../lib/kit.js';
import * as N from '../props.js';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as A from '../../mx/anim.js';
import { runShots, wt } from '../../mx/shots.js';
import { film, nameplate } from '../../mx/ui.js';
import { mapSet, city, fade, token, GM } from '../mapkit.js';

export { preload } from '../mapkit.js';
const CITY = GM.CITY;

export function build(ctx) {
  const L = ctx.L;
  const tImp = wt(L[0], 'imperio'), tAlto = wt(L[0], 'alto'), tHam = wt(L[1], 'hamburgo'), tRom = wt(L[1], 'roma'), tHer = wt(L[1], 'hermanos');
  const tEsp = wt(L[1], 'espana'), tIta = wt(L[1], 'italia'), tAle = wt(L[1], 'alemania');
  const tHere = wt(L[2], 'heredero'), tJos = wt(L[2], 'josefina'), tCas = wt(L[2], 'caso'), tPri = wt(L[2], 'princesa');

  // ---- 1-2. The Empire at its height (map 1812)
  const M = mapSet({ per: '1812' });
  const emp = token(M, 'emperor', 'emperor', ...CITY['París'], '#2f4590', 0.3, 2.3);
  const HR = GM.ribbon([CITY['Hamburgo'], [10.5, 50.0], [8.9, 46.5], [10.2, 44.0], CITY['Roma']], 0.22, '#f4f1ea', GM.H + 0.02, { dash: 0.45 }); HR.visible = false; M.add(HR);
  const kings = [
    ['jose', 'jose', 'Madrid', 'José', 'Rey de España', () => tEsp - 0.15],
    ['marshal', 'marshal', 'Nápoles', 'Murat', 'Rey de Nápoles', () => tIta - 0.15],
    ['emperor2', 'king', [9.5, 51.3], 'Jerónimo', 'Rey de Westfalia', () => tAle - 0.15],
  ].map(([who, outfit, c, name, role, tf]) => { const ll = typeof c === 'string' ? CITY[c] : c; const r = token(M, who === 'emperor2' ? 'oguri' : who === 'marshal' ? 'tamamo' : who, outfit, ...ll, '#5b7bc4', 0, 2.1);
    r.token.visible = false; return { r, ll, name, role, t0: tf() }; });
  const evM = [{ t: tHam - 0.2, pol: ['FRA'], color: '#3f63b8' }];
  // ---- 3. The Tuileries: Josephine leaves, Marie-Louise arrives
  const P = S.palaceFR('#efe6d2');
  const nap = K.person(P, 'napoleon', 'napoleon', 0, -1.2, 0);
  const jos = K.person(P, 'josefina', 'josefina', -0.9, -0.9, 0.6);
  const ml = K.person(P, 'marialuisa', 'marialuisa', 3.6, -0.4, -Math.PI / 2);

  const sfx = [{ t: 0.3, type: 'sting2', vol: 0.5 }, { t: tHam - 0.1, type: 'whoosh', vol: 0.5 }, ...kings.map(k => ({ t: k.t0, type: 'pop', vol: 0.6 })),
    { t: tJos - 0.3, type: 'tension', vol: 0.35 }, { t: tCas + 0.1, type: 'bells', dur: 2.2, vol: 0.45 }];

  const tP = L[2].t0 - 0.2;
  const shots = [
    { t0: 0, set: M, p0: [-3.4, 22, 13], l0: [-4.6, 0, 1.4], p1: [-3.0, 27, 16.5], l1: [-3.8, 0, 1.6], fov0: 38, act: (t) => {
      GM.paint(M.map, evM, t); K.pose(emp, C.idle(t, 1, 0.5)); emp.setFace(C.blinkEye(t, 1), 'smile');
      HR.visible = t > tHam - 0.1; HR.material.opacity = ss(tHam - 0.1, tHam + 0.4, t);
      kings.forEach(k => { const v = t > k.t0; k.r.token.visible = v; if (v) { const s = clamp((t - k.t0) / 0.3); k.r.token.scale.setScalar(2.1 * (s < 1 ? 1.2 * Math.sin(s * Math.PI * 0.62) / Math.sin(Math.PI * 0.62) : 1)); }
        K.pose(k.r, C.idle(t, k.t0, 0.5)); k.r.setFace(C.blinkEye(t, k.t0), 'smile'); });
      return film(t) + badge(t, '1810', 'El Imperio en su punto más alto', 'Francia y sus estados aliados dominan el continente', 0.5, tHer - 0.2)
        + city(ctx, M, 'Hamburgo', fade(t, tHam - 0.1, tHer + 0.6), 'c') + city(ctx, M, 'Roma', fade(t, tRom - 0.1, tHer + 0.6), 'c')
        + kings.map(k => nameplate(ctx, GM.pos(k.ll[0], k.ll[1], GM.H + 3.0), k.name, k.role, k.t0, ctx.dur)).join('');
    } },
    { t0: tP, set: P, p0: [0.4, 1.15, 3.4], l0: [0.5, 0.85, -1.0], p1: [0.6, 1.1, 2.7], l1: [0.8, 0.85, -1.0], fov0: 40, act: (t) => {
      const leave = clamp((t - tJos + 0.2) / 2.4), enter = clamp((t - tCas + 0.3) / 1.8);
      jos.root.position.set(-0.9 - leave * 2.6, 0, -0.9 + leave * 0.3); jos.root.rotation.y = leave > 0 ? -Math.PI / 2 - 0.3 : 0.6;
      K.pose(jos, leave > 0 && leave < 1 ? C.walk(t, 0.6, 1) : { ...A.sad(t, 1), head: [7, 5 * Math.sin(t * 0.6), 0] }); jos.setFace(t > tHere ? 'flat' : C.blinkEye(t, 1), 'frown');
      ml.root.position.set(3.6 - enter * 2.5, 0, -0.4 - enter * 0.4); ml.root.rotation.y = enter < 1 ? -Math.PI / 2 : -0.7;
      K.pose(ml, enter > 0 && enter < 1 ? C.walk(t, 0.7, 2) : A.humble(t, 2)); ml.setFace(C.blinkEye(t, 2), 'smile');
      nap.root.rotation.y = t < tCas ? -0.5 : 0.6; K.pose(nap, C.idle(t, 3, 0.5)); nap.setFace(C.blinkEye(t, 3), t > tCas ? 'smile' : 'neutral');
      return film(t) + nameplate(ctx, [jos.root.position.x, 1.45, jos.root.position.z], 'Josefina', 'Emperatriz · 1804–1809', tHere - 0.2, tJos + 1.0)
        + nameplate(ctx, [ml.root.position.x, 1.45, ml.root.position.z], 'María Luisa de Austria', 'Emperatriz · 1810', tPri - 0.1, ctx.dur)
        + badge(t, '1810', 'Una boda imperial', 'Napoleón busca un heredero para su trono', tP + 0.3, tJos - 0.3);
    } },
  ];
  const inst = { scene: M, scenes: [M, P], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
