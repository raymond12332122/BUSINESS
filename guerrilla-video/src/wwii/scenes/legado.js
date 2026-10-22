import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as MP from '../maps.js';
import * as M from '../../lib/motion.js';
import { canvasTex } from '../../whatif/kit.js';
import { run, wt } from '../../whatif/shots.js';
const { ss, clamp } = M;
const fade = U.fade;
export const preload = MP.preload;
const V = () => new THREE.Vector3();
const CAST = ['oguri', 'tamamo', 'cafe', 'doto', 'mcqueen', 'daiwa', 'suzuka', 'helios', 'spe', 'hishi'];

// The legacy: the price (a cemetery, civilians in the ruins, the losses), the United Nations with Mexico among its
// founders, Nuremberg (the accused only as silhouettes), the Universal Declaration of Human Rights, the Cold War.
export function build(ctx) {
  const L = ctx.L;
  const tPre = wt(L[0], 'precio'), tMay = wt(L[0], 'mayoria'), tUni = wt(L[0], 'union'), tVei = wt(L[0], 'veintisiete'), tChi = wt(L[0], 'china'), tPol = wt(L[0], 'polonia'), tCasi = wt(L[0], 'casi');
  const tNac = wt(L[1], 'naciones'), tMex = wt(L[1], 'mexico'), tJef = wt(L[1], 'jefes'), tNur = wt(L[1], 'nuremberg'), tDes = wt(L[1], 'despues'), tDec = wt(L[1], 'declaracion');
  const tPar = wt(L[2], 'partido'), tEst = wt(L[2], 'estados'), tUn2 = wt(L[2], 'union'), tGue = wt(L[2], 'guerra');
  const tA2 = tMay - 0.3, tA3 = tUni - 0.3, tB1 = L[1].t0 - 0.25, tB2 = tJef - 0.3, tB3 = tDes - 0.3, tC1 = L[2].t0 - 0.25;
  const total = t => U.bigNumber(t, tPre - 0.2, tA3 + 0.3, '70 – 85 millones', 'DE MUERTOS · LA MAYORÍA, CIVILES', { y: 180, size: 92, count: 0, band: true });

  // ================================================================ A1: a war cemetery — a woman lays flowers at a cross
  const Ce = S.cemetery('overcast');
  const mourner = K.person(Ce, 'doto', 'duelo', 0.15, 2.8, Math.PI);
  const bunch = new THREE.Group(); [['#c8201e', 0], ['#f4f0e6', 0.05], ['#c8201e', -0.05]].forEach(([c, dx]) => bunch.add(LP_at(new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshStandardMaterial({ color: c })), dx, 0.04, 0)));
  bunch.position.set(0.12, 0, 2.2); bunch.userData.dynamic = true; Ce.add(bunch);
  const actA1 = t => { const k = 0.5 + 0.5 * Math.sin(Math.min(Math.PI / 2, (t - 0.2) * 1.2)); K.act(mourner, A.setDown(t, 2, clamp(k)), t, { mouth: 'frown', eye: 'flat' });
    return U.film(t) + total(t); };

  // ================================================================ A2: civilians walk through the ruins with what they could save
  const Ru = S.berlin('overcast');
  [[-4.6, 9, 0], [5.2, 11, 1], [-6.5, 15, 2], [3.4, 17, 3]].forEach(([x, z, i]) => { const b = P.ruinBlock(4 + i % 2, 4.5 + i, 3.5, ['#b9a48a', '#a8a090', '#c2b49a', '#9a8c7a'][i], 90 + i); b.position.set(x, 0, z); b.rotation.y = 0.3 * (i % 2 ? 1 : -1); Ru.add(b); const rb = P.rubble(1.2, 95 + i, '#857664'); rb.position.set(x * 0.6, 0, z - 3); Ru.add(rb); });
  const walkers = [['spe', 'refugiado', -1.2, 3.0], ['cafe', 'civilMujer', -0.4, 3.4], ['daiwa', 'ninoGueto', 0.1, 3.1, 0.8], ['hishi', 'refugiado', 1.0, 3.6]].map(([who, o, x, z, sc = 1], i) => { const r = K.person(Ru, who, o, x, z, Math.PI, { shadow: false }); r.root.scale.setScalar(sc); r.x0 = x; r.z0 = z; r.i = i; return r; });
  const actA2 = t => { walkers.forEach(r => { const D = (t - tA2 + 0.3) * 0.36, z = r.z0 - D; r.root.position.set(r.x0, 0, z); const p = M.gait(D / (r.unit * r.root.scale.x), { amp: 0.7, seed: r.i, stride: 0.9 }); p.head = [(p.head?.[0] || 0) + 12, p.head?.[1] || 0, 0]; K.act(r, p, t, { mouth: 'frown' }); });
    return U.film(t) + total(t); };

  // ================================================================ A3: the losses, on a quiet panel over the memorial candles
  const Md = S.memorialDark();
  const actA3 = t => { Md.three.forEach(c => { c.visible = false; }); Md.row.forEach((c, i) => c.update(t, 1));
    return U.film(t) + U.lossChart(t, tA3 + 0.1, tB1 + 0.3, [['Unión Soviética', 'unos 27', 27, 27, tVei - 0.2], ['China', '15 – 20', 15, 20, tChi - 0.1]], ['Polonia', 'casi 1 de cada 6 habitantes', 6, tCasi - 0.1], { x: 1150, y: 170, w: 660 }); };

  // ================================================================ B1: the United Nations, 1945 — Mexico among the 51 founders
  const Un = S.unHall();
  const delegate = K.person(Un, 'mcqueen', 'diplomatico', 0.1, -1.98, 0); delegate.root.position.y = Un.stageY; const yD = Un.stageY;
  const others = [-2.3, -1.6, -0.95, 1.15, 1.8, 2.5].map((x, i) => { const z = -1.95 - (i % 2) * 0.35, r = K.person(Un, CAST[(i + 2) % 10], 'diplomatico', x, z, Math.atan2(0.1 - x, -1.6 - z), { shadow: false }); r.root.position.y = Un.stageY; r.i = i; return r; });
  const actB1 = t => { const P0 = [0.1, Un.table + 0.01, -1.6]; delegate.root.position.y = yD; poster.visible = false; eleanor.root.visible = false; others.forEach(r => { r.root.visible = true; }); delegate.root.visible = true;
    K.act(delegate, A.hands(t, 1, [P0[0] - 0.12, P0[1], P0[2] - 0.05], [P0[0] + 0.06 + 0.03 * Math.sin(t * 5), P0[1] + 0.01, P0[2] + 0.02], 1), t, { mouth: 'neutral' });
    others.forEach(r => K.act(r, t > tMex ? A.clap(t, r.i) : A.stand(t, r.i), t, { mouth: t > tMex ? 'smile' : 'neutral' }));
    return U.film(t) + U.stamp(t, tB1 + 0.3, tB2 + 0.2, 'junio – octubre de 1945', 'San Francisco · la Carta de la ONU')
      + U.popCard(t, tNac - 0.2, tB2 + 0.25, 'NACIONES UNIDAS', '51 países fundadores', 'entre ellos, México', { x: 1440, y: 140, w: 460, accent: '#5b92e5' }); };

  // ================================================================ B2: Nuremberg — the accused only as silhouettes in the dock, the guards behind
  const Nu = S.nuremberg();
  const accused = Nu.dock.map(([x, z, y], i) => { const s = K.silhouette('defendant', 1.15); s.position.set(x, y - 0.05, z); s.rotation.y = Math.PI / 2; s.ph = i * 0.37; Nu.add(s); return s; });
  const guards = [-2.2, -0.4, 1.4].map((z, i) => { const r = K.person(Nu, CAST[(i + 4) % 10], 'mp', -5.15, z, Math.PI / 2, { shadow: false }); r.i = i; return r; });
  const judges = [-0.4, 0.8, 2.0].map((x, i) => { const r = K.person(Nu, CAST[(i + 7) % 10], 'diplomatico', x, -4.1, 0, { shadow: false }); r.root.position.y = 0.15; r.i = i; return r; });
  const actB2 = t => { accused.forEach(s => s.gesture(t + s.ph, 0.4)); guards.forEach(r => K.act(r, A.stand(t, r.i), t, { mouth: 'neutral' })); judges.forEach(r => K.act(r, A.stand(t, r.i + 3), t, { mouth: 'neutral' }));
    return U.film(t) + U.stamp(t, tB2 + 0.3, tB3 + 0.2, 'noviembre de 1945 – octubre de 1946', 'Núremberg, Alemania')
      + U.popCard(t, tNur - 0.3, tB3 + 0.25, 'LOS JUICIOS DE NÚREMBERG', 'Los jefes nazis, ante un tribunal', 'por crímenes de guerra y contra la humanidad', { x: 1440, y: 140, w: 480, accent: '#6a7262' }); };

  // ================================================================ B3: 1948 — the Universal Declaration of Human Rights
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.66), new THREE.MeshStandardMaterial({ roughness: 0.85, map: canvasTex(320, 420, (x, W, H) => { x.fillStyle = '#f4ecd8'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#1f3a6a'; x.font = '900 26px "DejaVu Sans"'; x.textAlign = 'center'; ['DECLARACIÓN', 'UNIVERSAL', 'DE LOS DERECHOS', 'HUMANOS'].forEach((l, i) => x.fillText(l, W / 2, 50 + i * 32));
    x.fillStyle = 'rgba(40,40,60,0.45)'; for (let j = 0; j < 14; j++) x.fillRect(30, 190 + j * 15, W - 60 - (j * 23) % 70, 5); }) }));
  poster.userData.dynamic = true; Un.add(poster);
  const eleanor = K.person(Un, 'tamamo', 'civilMujer', 1.6, -0.2, -0.25);
  const actB3 = t => { delegate.root.position.y = yD; poster.visible = true; eleanor.root.visible = true; others.forEach(r => { r.root.visible = false; }); delegate.root.visible = false; K.act(delegate, A.stand(t, 1), t, { mouth: 'smile' }); others.forEach(r => K.act(r, A.clap(t, r.i), t, { mouth: 'smile' }));
    const ep = eleanor.root.position, fw = V().set(Math.sin(-0.25), 0, Math.cos(-0.25)), c = V().set(ep.x, 0.27, ep.z).addScaledVector(fw, 0.3);
    poster.position.copy(c); poster.rotation.set(-0.08, -0.25, 0);
    const side = V().set(Math.cos(-0.25), 0, -Math.sin(-0.25));
    K.act(eleanor, A.hands(t, 5, c.clone().addScaledVector(side, 0.22).add(V().set(0, 0.24, -0.02)).toArray(), c.clone().addScaledVector(side, -0.22).add(V().set(0, 0.24, -0.02)).toArray(), 1), t, { mouth: 'smile' });
    return U.film(t) + U.stamp(t, tB3 + 0.3, tC1 + 0.2, '10 de diciembre de 1948', 'París')
      + U.who(t, tDec - 0.2, tC1 + 0.2, 'Eleanor Roosevelt', 'Presidió la comisión que redactó la Declaración', { code: 'un', side: 'l' }); };

  // ================================================================ C1: the world split in two — the Cold War begins
  const Wm = MP.world({ center: -10, light: 'day' });
  const WEST = ['United States of America', 'Canada', 'United Kingdom', 'France', 'Italy', 'Belgium', 'Netherlands', 'Luxembourg', 'Norway', 'Denmark', 'Portugal', 'Iceland', 'Greece', 'Turkey'];
  const EAST = ['Russia', 'Ukraine', 'Belarus', 'Poland', 'Czechia', 'Slovakia', 'Hungary', 'Romania', 'Bulgaria', 'Lithuania', 'Latvia', 'Estonia', 'Moldova', 'Georgia', 'Armenia', 'Azerbaijan', 'Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Kyrgyzstan', 'Tajikistan', 'Albania', 'Mongolia'];
  Wm.keep([...WEST, ...EAST, 'Germany']);
  const eastDE = MP.wzone(Wm, [[10.9, 54.2], [14.2, 53.9], [14.6, 52.6], [15.0, 51.1], [12.1, 50.3], [10.4, 50.6], [10.1, 51.5], [10.6, 52.8]], '#a8322a', { opacity: 0.85 });
  const westDE = MP.wzone(Wm, [[10.9, 54.2], [10.6, 52.8], [10.1, 51.5], [10.4, 50.6], [12.1, 50.3], [13.8, 48.6], [13.0, 47.5], [9.6, 47.5], [7.6, 47.6], [6.1, 49.5], [6.0, 51.8], [7.0, 53.6], [8.6, 54.9]], '#3f6fb5', { opacity: 0.85 });
  const IC = [[10.9, 54.4], [10.7, 52.8], [10.2, 51.5], [10.5, 50.5], [12.2, 50.2], [13.8, 48.7], [16.9, 48.6], [16.5, 46.9], [13.7, 45.7]];
  const wall = MP.wzone(Wm, [...IC.map(([lo, la]) => [lo - 0.35, la]), ...IC.slice().reverse().map(([lo, la]) => [lo + 0.35, la])], '#141414', { opacity: 0.95 });
  const actC1 = t => { const kw = ss(tEst - 0.4, tEst + 0.4, t), ke = ss(tUn2 - 0.4, tUn2 + 0.4, t);
    WEST.forEach(n => Wm.paint(n, '#3f6fb5', kw, 0.16)); EAST.forEach(n => Wm.paint(n, '#a8322a', ke, 0.16)); westDE.set(kw); eastDE.set(ke); wall.set(ss(tPar - 0.2, tPar + 0.4, t));
    return U.film(t) + MP.wlabel(ctx, Wm, -100, 40, 'ESTADOS UNIDOS', kw, 'st') + MP.wlabel(ctx, Wm, 45, 57, 'UNIÓN SOVIÉTICA', ke, 'st')
      + MP.wlabel(ctx, Wm, 15.5, 50.5, '«cortina de hierro»', fade(t, tPar, ctx.dur + 1), 'c', 0.9)
      + U.slam(t, tGue - 0.1, ctx.dur + 1, 'LA GUERRA FRÍA', { x: 960, y: 250, rot: -4, col: '#1a1a1a', size: 78 }); };
  const [cx, , cz] = Wm.pos(-20, 46);

  const sfx = [
    { t: 0, type: 'wind', dur: tA2, vol: 0.3 }, { t: 0, type: 'birds', dur: tA2, vol: 0.08 },
    { t: tA2, type: 'wind', dur: tA3 - tA2, vol: 0.35 }, { t: tA2, type: 'steps', dur: tA3 - tA2, vol: 0.2 },
    { t: tA3, type: 'drone', dur: tB1 - tA3, vol: 0.2 }, ...[tVei, tChi, tPol].map(x => ({ t: x - 0.2, type: 'tick', vol: 0.25 })),
    { t: tB1, type: 'crowd', dur: tB2 - tB1, vol: 0.15 }, { t: tB1 + 0.4, type: 'quill', dur: 1.8, vol: 0.25 }, { t: tMex, type: 'applause', dur: 2.2, vol: 0.4 },
    { t: tB2, type: 'gavel', vol: 0.4 }, { t: tB2 + 0.2, type: 'crowd', dur: tB3 - tB2, vol: 0.1 },
    { t: tB3, type: 'applause', dur: tC1 - tB3, vol: 0.35 }, { t: tDec, type: 'paper', vol: 0.3 },
    { t: tC1, type: 'drone', dur: ctx.dur - tC1, vol: 0.3 }, { t: tPar - 0.2, type: 'thud', vol: 0.4 }, { t: tGue - 0.1, type: 'stamp', vol: 0.5 },
  ];
  const shots = [
    { t0: 0, set: Ce, p0: [2.9, 1.05, 6.6], l0: [-1.0, 0.35, -4], p1: [2.6, 1.0, 6.0], l1: [-1.0, 0.4, -4], fov0: 44, act: actA1 },
    { t0: tA2, set: Ru, p0: [1.4, 1.0, -1.6], l0: [-0.2, 0.7, 4], p1: [1.2, 1.0, -2.0], l1: [-0.2, 0.7, 3.4], fov0: 46, act: actA2 },
    { t0: tA3, set: Md, p0: [-5.2, 0.85, 1.4], l0: [-2.2, 0.5, -2.8], p1: [-2.6, 0.85, 1.2], l1: [0.6, 0.5, -2.8], fov0: 44, act: actA3 },
    { t0: tB1, set: Un, p0: [0.5, 1.25, 1.9], l0: [0.0, 0.95, -2.2], p1: [0.4, 1.22, 1.5], l1: [0.0, 0.95, -2.2], fov0: 46, act: actB1 },
    { t0: tB2, set: Nu, p0: [-0.6, 1.45, 2.9], l0: [-4.4, 0.65, -0.5], p1: [-0.9, 1.4, 2.5], l1: [-4.4, 0.65, -0.6], fov0: 46, act: actB2 },
    { t0: tB3, set: Un, p0: [1.2, 1.05, 1.9], l0: [1.6, 0.62, -0.3], p1: [1.22, 1.02, 1.6], l1: [1.6, 0.62, -0.3], fov0: 36, act: actB3 },
    { t0: tC1, set: Wm, p0: [cx, 66, cz + 30], l0: [cx, 0, cz], p1: [cx + 2, 60, cz + 27], l1: [cx + 2, 0, cz], fov0: 40, act: actC1 },
  ];
  const inst = { scene: Ce, scenes: [Ce, Ru, Md, Un, Nu, Wm], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
const LP_at = (o, x, y, z) => { o.position.set(x, y, z); return o; };
