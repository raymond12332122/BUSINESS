import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as MP from '../maps.js';
import * as M from '../../lib/motion.js';
import { run, wt } from '../../whatif/shots.js';
const { ss, clamp } = M;
export const preload = MP.preload;

// Every country that fought, with the year it entered the war (Natural Earth names; the USSR as its successor states).
const SOV = ['Russia', 'Ukraine', 'Belarus', 'Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Kyrgyzstan', 'Tajikistan', 'Georgia', 'Armenia', 'Azerbaijan', 'Moldova', 'Lithuania', 'Latvia', 'Estonia'];
const WAR = [
  [1939.7, '#3d4148', ['Germany', 'Austria', 'Czechia']], [1939.7, '#7aa6e6', ['Poland']], [1939.75, '#3f6fb5', ['United Kingdom', 'France', 'Australia', 'New Zealand', 'Canada', 'India', 'South Africa']],
  [1940.4, '#9097a0', ['Norway', 'Denmark', 'Netherlands', 'Belgium', 'Luxembourg']], [1940.45, '#5a6450', ['Italy', 'Libya']], [1941.3, '#9097a0', ['Greece', 'Serbia', 'Croatia', 'Bosnia and Herz.', 'Slovenia', 'Montenegro', 'Macedonia', 'Kosovo']],
  [1941.5, '#c0453a', SOV], [1941.95, '#5a3a3a', ['Japan']], [1941.95, '#3f6fb5', ['United States of America', 'China', 'Philippines']],
  [1942.4, '#3f6fb5', ['Mexico', 'Brazil']], [1942.5, '#9a6a6a', ['Indonesia', 'Malaysia', 'Myanmar', 'Thailand', 'Vietnam', 'Laos', 'Cambodia', 'Papua New Guinea', 'South Korea', 'North Korea', 'Taiwan']],
  [1942.8, '#8a8f7c', ['Hungary', 'Romania', 'Bulgaria', 'Finland', 'Slovakia']], [1942.9, '#9097a0', ['Egypt', 'Tunisia', 'Ethiopia']],
];
export function build(ctx) {
  const L = ctx.L;
  const tY0 = wt(L[0], 'mil') - 0.1, tY1 = wt(L[0], 'cuarenta') + 0.4, tEu = wt(L[1], 'europa'), tAf = wt(L[1], 'africa'), tAs = wt(L[1], 'asia'), tOc = wt(L[1], 'oceanos');
  const tMu = wt(L[1], 'murieron'), tB = L[2].t0 - 0.35, tSeg = wt(L[2], 'segunda');
  const year = t => 1939 + 6 * ss(tY0, tY1 + 2.6, t) ** 0.9;

  // ================================================================ A: the world at night as the war spreads
  const Wm = MP.world({ center: 55, light: 'night' });
  Wm.keep(WAR.flatMap(w => w[2]));
  const bursts = [
    ...[[2, 49], [14, 52], [21, 52], [-1, 51], [31, 50], [37, 55], [44, 48], [12, 42]].map(([lo, la], i) => [lo, la, tEu - 0.1 + i * 0.09]),
    ...[[24, 32], [29, 31], [10, 34], [13, 32]].map(([lo, la], i) => [lo, la, tAf - 0.1 + i * 0.1]),
    ...[[116, 32], [121, 31], [96, 21], [104, 36], [126, 37], [122, 14]].map(([lo, la], i) => [lo, la, tAs - 0.1 + i * 0.09]),
    ...[[-35, 45], [-50, 35], [157, 21], [-177, 28], [152, -8], [160, 8], [-20, 15], [5, 60]].map(([lo, la], i) => [lo, la, tOc - 0.1 + i * 0.08]),
  ].map(([lo, la, t0]) => { const b = MP.wburst(Wm, lo, la, '#ff8a3a', 1.2); b.t0 = t0; return b; });
  const actA = t => {
    const y = year(t);
    WAR.forEach(([yr, col, names]) => { const k = ss(yr - 0.15, yr + 0.15, y); names.forEach(n => Wm.paint(n, col, k, 0.18)); });
    bursts.forEach(b => b.update(t, b.t0));
    const ys = Math.floor(year(t));
    return U.film(t) + (t > tY0 - 0.2 && t < tMu ? U.bigNumber(t, tY0, tMu, String(ys), '', { y: 140, size: 96, count: 0 }) : '')
      + U.bigNumber(t, tMu, tB + 0.3, '70 – 85 millones', 'DE MUERTOS', { y: 470, size: 110, count: 0, band: true });
  };

  // ================================================================ B: London at night, searchlights; a family looks up
  const Bl = S.blitzNight();
  const mum = K.person(Bl, 'daiwa', 'civilMujer', -3.45, 2.85, 0.12), kid = K.person(Bl, 'spe', 'nino', -2.75, 3.0, 0.05), dad = K.person(Bl, 'helios', 'civil', -4.2, 2.7, 0.2);
  const bombers = [0, 1, 2].map(i => { const b = P.bomber('#2a2e34'); b.scale.setScalar(2.2); Bl.add(b); return b; });
  const fill = new THREE.PointLight('#ffb070', 5, 9, 1.4); fill.position.set(-2.2, 2.2, 5.2); Bl.add(fill);   // glow from the burning end of the street
  const rim = new THREE.PointLight('#9ab4ff', 4, 10, 1.4); rim.position.set(-5.5, 3.2, 1.2); Bl.add(rim);
  const actB = t => {
    const u = t - tB;
    const sky = [0, 26, -40];
    K.act(mum, { ...A.holdHand(t, 1, 'L'), ...{ look: sky, lookW: 0.8 } }, t, { eye: 0.15, mouth: [0.15, 0] });
    K.act(kid, { ...A.lookUp(t, 2, 1), aR: [-0.55, 0.85, 0.6], aWR: 0.8, hR: M.HAND.soft, plR: [-1, -0.4, 0] }, t, { eye: 0.1, mouth: [0.35, 0] });
    K.act(dad, M.mix(A.lookUp(t, 3, 1), A.point(t, 3, 60, 25, 'R'), ss(tB + 0.6, tB + 1.2, t)), t, { eye: 0.15 });
    bombers.forEach((b, i) => { b.position.set(-60 + (u * 7 + i * 9) % 120, 38 + i * 3, -40 - i * 8); b.rotation.set(0, Math.PI / 2, 0); });
    Bl.tick?.(t);
    return U.film(t) + U.bigTitle(t, tSeg - 0.2, ctx.dur + 1, 'LA SEGUNDA', 'Guerra Mundial', '1939 – 1945', { top: 120 });
  };

  const sfx = [
    { t: 0, type: 'wind', dur: tB, vol: 0.25 }, { t: tY0, type: 'tick', vol: 0.3 }, { t: tEu, type: 'boom', vol: 0.35 }, { t: tAf, type: 'boom', vol: 0.3 }, { t: tAs, type: 'boom', vol: 0.3 },
    { t: tOc, type: 'bigboom', vol: 0.3 }, { t: tMu, type: 'sting', vol: 0.3 },
    { t: tB, type: 'siren', dur: ctx.dur - tB, vol: 0.32 }, { t: tB + 0.4, type: 'engines', dur: ctx.dur - tB - 0.4, vol: 0.3 }, { t: tSeg - 0.2, type: 'drum', dur: ctx.dur - tSeg + 0.2, vol: 0.3 },
  ];
  const shots = [
    { t0: 0, set: Wm, p0: [30, 120, 40], l0: [28, 0, -24], p1: [32, 92, 34], l1: [30, 0, -18], fov0: 40, ease: 'lin', act: actA },
    { t0: tB, set: Bl, p0: [-2.9, 0.92, 6.6], l0: [-3.3, 2.5, -8], p1: [-2.85, 0.9, 6.1], l1: [-3.2, 3.4, -8], fov0: 50, act: actB },
  ];
  const inst = { scene: Wm, scenes: [Wm, Bl], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
