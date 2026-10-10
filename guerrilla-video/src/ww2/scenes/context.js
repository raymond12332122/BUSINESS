import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as F from '../../lib/fx.js';
import { stage, aimSun } from '../../lib/stage.js';
import { camPath, ss, clamp } from '../../lib/util.js';
import { cast, badge, partTimes } from '../../lib/kit.js';
import * as W from '../kit.js';
import { preload as pre, board, place, mapLabel, at, M } from '../mapkit.js';

export const preload = pre;

export function build(ctx) {
  const L = ctx.L;
  const scene = stage({ groundA: null, skyTop: '#4a6fa8', skyHor: '#cfe0ea', fog: ['#cfe0ea', 60, 200], sunPos: [6, 18, 10], sun: 2.3, hemi: 1.3, shadow: 26 });
  const map = board(scene);
  const C_ = M.COLORS;
  const mc = cast(scene, 'mcqueen', null), tm = cast(scene, 'tamamo', null), dt = cast(scene, 'doto', null), og = cast(scene, 'oguri', null);
  W.soldier(mc, 'de', { gun: false }); W.soldier(tm, 'uk'); W.soldier(dt, 'fr'); W.soldier(og, 'su');
  place(mc, 10.5, 51.2, 0.6); place(tm, -1.8, 53.0, 0.9); place(dt, 2.4, 46.8, 0.7); place(og, 37.5, 55.7, -0.7);
  const anger = [F.bubble('💢', { font: 130 }), F.bubble('💢', { font: 130 })]; anger.forEach(b => scene.add(b));
  const sweat = F.bubble('💦', { bg: null, font: 170 }); scene.add(sweat);

  const p1 = partTimes(L[1], ['Con Hitler en el poder, se rearmó y empezó a anexar territorios:', 'primero Austria,', 'luego Checoslovaquia.']);
  const p2 = partTimes(L[2], ['El primero de septiembre de mil novecientos treinta y nueve invadió Polonia.', 'Dos días después, Reino Unido y Francia le declararon la guerra.']);
  const tInv = p2[0] + 1.6, tSov = L[3].t0 + 2.0;
  const ev = [
    { t: -1, names: M.expand(['germany', 'poland', 'france', 'uk', 'benelux', 'italy', 'nordic_occ', 'balkans', 'axis_minor']), color: C_.other },
    { t: -1, names: ['Germany'], color: C_.axis }, { t: -1, names: M.expand(['ussr']), color: C_.ussr }, { t: -1, names: M.expand(['neutral']), color: C_.neutral },
    { t: -1, names: ['Italy'], color: C_.axis_minor },
    { t: p1[1], names: ['Austria'], color: C_.axis }, { t: p1[2], names: ['Czechia'], color: C_.axis },
    { t: p2[1] + 0.3, names: ['United Kingdom', 'France'], color: C_.allies },
    { t: tInv + 1.6, names: ['Poland'], color: C_.occupied },
  ];
  const arW = M.arrow([[13, 52.5], [17.5, 52.3], [21, 52.2]], '#3b3f46', 0.8);
  const arN = M.arrow([[18, 54.4], [19.5, 53.4], [20.6, 52.6]], '#3b3f46', 0.6);
  const arS = M.arrow([[17.5, 49.6], [19.3, 50.8], [20.4, 51.6]], '#3b3f46', 0.6);
  const arE = M.arrow([[27.5, 53.2], [25.5, 52.6], [23.6, 52.3]], '#c0453a', 0.7);
  [arW, arN, arS, arE].forEach(a => scene.add(a));
  const sfx = [{ t: p1[1], type: 'pop' }, { t: p1[2], type: 'pop' }, { t: tInv, type: 'whoosh' }, { t: tInv + 0.2, type: 'march', dur: 2.5, vol: 0.5 }, { t: p2[1] + 0.3, type: 'sting2' }, { t: tSov, type: 'whoosh' }];

  function update(t) {
    M.paint(map, ev, t);
    arW.set(ss(tInv, tInv + 1.6, t)); arN.set(ss(tInv + 0.2, tInv + 1.6, t)); arS.set(ss(tInv + 0.3, tInv + 1.7, t)); arE.set(ss(tSov, tSov + 1.4, t));
    // McQueen: dejected after WWI, then puffed up
    const sad = t < L[1].t0;
    mc.apply(sad ? C.tired(t, 1, 1) : t > tInv - 0.4 && t < tInv + 1.8 ? C.point(t, 1, -20) : C.idle(t, 1));
    mc.setFace(sad ? 'flat' : C.blinkEye(t, 1), sad ? 'wavy' : 'smile');
    for (const [c, i] of [[tm, 0], [dt, 1]]) {
      const mad = t > p2[1] + 0.2;
      c.apply({ ...(mad ? C.point(t, i, i ? 30 : -30) : C.idle(t, c.seed)), gun: 'none' });
      c.setFace(mad ? 'squint' : C.blinkEye(t, c.seed), mad ? 'shout' : 'neutral');
      const p = c.root.position; anger[i].position.set(p.x, p.y, p.z); F.popSprite(anger[i], t, p2[1] + 0.5 + i * 0.2, ctx.dur, 0.9, p.y + 3.4);
    }
    og.apply({ ...(t > tSov - 0.3 ? C.point(t, 3, 30) : C.idle(t, og.seed)), gun: 'none' }); og.setFace(C.blinkEye(t, og.seed), t > tSov ? 'smile' : 'neutral');
    const mp = mc.root.position; sweat.position.set(mp.x + 0.7, mp.y, mp.z); F.popSprite(sweat, t, 1.4, L[1].t0, 0.8, mp.y + 2.9);

    camPath(ctx.camera, [
      { t: 0, p: [3, 9, 9], l: [3, 0, 0.5], fov: 42 },
      { t: L[1].t0, p: [4, 16, 16], l: [5, 0, -0.5], fov: 42 },
      { t: L[2].t0, p: [6, 13, 13], l: [6, 0, 0], fov: 42 },
      { t: L[3].t0, p: [9, 15, 15], l: [10, 0, -0.5], fov: 44 },
      { t: ctx.dur, p: [10, 18, 17], l: [10, 0, -1], fov: 44 },
    ], t);
    aimSun(scene, 6, 0);

    let html = badge(t, '1918 · Tratado de Versalles', 'Alemania pierde', 'Territorios, colonias y un ejército de solo 100 000 hombres', 1.2, L[1].t0 + 0.2);
    const kl = ss(L[1].t0 + 0.4, L[1].t0 + 0.8, t);
    html += mapLabel(ctx, 10.5, 50.0, 'Alemania', kl, 'a', 0.5);
    html += mapLabel(ctx, 14.5, 47.4, 'Austria', ss(p1[1], p1[1] + 0.4, t) * (1 - ss(L[2].t0 + 1, L[2].t0 + 1.4, t)), 'a', 0.5);
    html += mapLabel(ctx, 15.5, 49.8, 'Checoslovaquia', ss(p1[2], p1[2] + 0.4, t) * (1 - ss(L[2].t0 + 1, L[2].t0 + 1.4, t)), 'a', 0.5);
    html += mapLabel(ctx, 19.5, 52.0, 'Polonia', ss(L[2].t0, L[2].t0 + 0.4, t), 'r', 0.5);
    html += mapLabel(ctx, -2.2, 54.6, 'Reino Unido', ss(p2[1], p2[1] + 0.4, t), 'n', 0.5) + mapLabel(ctx, 2.4, 45.5, 'Francia', ss(p2[1], p2[1] + 0.4, t), 'n', 0.5);
    html += mapLabel(ctx, 37.5, 54.2, 'URSS', ss(L[3].t0, L[3].t0 + 0.4, t), 'r', 0.5);
    html += badge(t, '1 de septiembre de 1939', 'Empieza la guerra', 'Mapa simplificado con fronteras actuales', L[2].t0 + 0.2, L[3].t0 + 0.2);
    html += badge(t, 'Pacto Mólotov-Ribbentrop', 'Polonia, repartida', 'Alemania por el oeste, la URSS por el este', L[3].t0 + 0.6, ctx.dur);
    return html;
  }
  return { scene, update, sfx };
}
