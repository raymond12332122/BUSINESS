import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as MP from '../maps.js';
import * as M from '../../lib/motion.js';
import { run, wt, walkIn } from '../../whatif/shots.js';
const { ss, clamp, HAND } = M;
const fade = U.fade;
export const preload = MP.preload;
const V = () => new THREE.Vector3();
const CAST = ['oguri', 'tamamo', 'cafe', 'doto', 'mcqueen', 'daiwa', 'suzuka', 'helios', 'spe', 'hishi'];
// Japanese-held China and Manchuria in 1941 (lon/lat), drawn as a zone on the world map.
const CHINA_OCC = [[119, 53], [126, 53], [134, 48], [131, 43], [126, 40], [122, 39], [121, 31], [119, 26], [117, 23], [112, 22], [110, 26], [113, 30], [111, 35], [112, 40], [116, 43], [119, 48]];

export function build(ctx) {
  const L = ctx.L;
  const tJap = wt(L[0], 'japon'), tImp = wt(L[0], 'imperio'), tSie = wt(L[0], 'siete'), tAta = wt(L[0], 'ataco'), tSor = wt(L[0], 'sorpresa'), tPer = wt(L[0], 'perl');
  const tFra = wt(L[1], 'franklin'), tEnt = wt(L[1], 'entro'), tCon = wt(L[1], 'conquisto'), tPac = wt(L[1], 'pacifico'), tPero = wt(L[1], 'pero'), tCua = wt(L[1], 'cuatro'), tMid = wt(L[1], 'miduei');
  const tDes = wt(L[2], 'desde'), tIsl = wt(L[2], 'isla'), tMie = wt(L[2], 'mientras'), tChi = wt(L[2], 'china');
  const tA2 = tSie - 0.3, tB = L[1].t0 - 0.25, tC = tCon - 0.3, tD = tPero - 0.15, tE = L[2].t0 - 0.2, tE2 = tIsl - 0.3, tF = tMie - 0.1;

  // ================================================================ A1: Japan seeks an empire in Asia
  const Wm = MP.world({ center: 135, light: 'day' });
  const EMP = ['Japan', 'South Korea', 'North Korea', 'Taiwan']; Wm.keep(EMP);
  const occ = MP.wzone(Wm, CHINA_OCC, '#a8322a', { opacity: 0.55 });
  const japZ = MP.wzone(Wm, MP.JAPAN_1942, '#a8322a', { opacity: 0.45 });
  const actA1 = t => {
    const k = ss(tJap - 0.2, tJap + 0.4, t); EMP.forEach(n => Wm.paint(n, '#a8322a', k, 0.18)); occ.set(ss(tImp - 0.2, tImp + 0.6, t)); japZ.set(0);
    return U.film(t) + MP.wlabel(ctx, Wm, 138, 37, 'JAPÓN', fade(t, tJap - 0.1, tA2 + 1), 'st') + MP.wlabel(ctx, Wm, 124, 45, 'MANCHURIA (1931)', fade(t, tImp - 0.1, tA2 + 1), 'st')
      + MP.wlabel(ctx, Wm, 114, 31, 'CHINA OCUPADA (1937)', fade(t, tImp + 0.2, tA2 + 1), 'st');
  };
  const [ax, , az] = Wm.pos(128, 34);

  // ================================================================ A2: 7 December 1941 — Pearl Harbor
  const Ph = S.pearlHarbor('morning');
  const sailors = [[3.7, 6.6, Math.PI + 0.25], [4.5, 7.3, Math.PI - 0.1]].map(([x, z, y], i) => { const r = K.person(Ph, ['spe', 'daiwa'][i], 'marinero', x, z, y); r.root.position.y = Ph.pierY; return r; });
  const zeros = Array.from({ length: 6 }, (_, i) => { const p = P.aircraft('zero'); Ph.add(p); p.t0 = tA2 + 0.2 + i * 0.55; p.tx = -24 + i * 9; return p; });
  const hits = zeros.map(p => { const g = P.glow('#ffb060', 10, 0); Ph.add(g); return g; });
  Ph.ships.filter((b, i) => i % 2).forEach(b => S.W1.smokeFrom(Ph, new THREE.Vector3(b.position.x, 5, b.position.z), { n: 12, color: '#2a2624', size: 2.6, rise: 26, drift: [5, 0, -4], life: 6, opacity: 0.75 }));
  const actA2 = t => {
    sailors.forEach((r, i) => { r.root.position.y = Ph.pierY; K.act(r, i ? A.point(t, i + 1, 25, 40, 'R') : A.lookUp(t, i + 1, 1), t, { mouth: 'open', eye: 'shock' }); });
    zeros.forEach((p, i) => { const u = (t - p.t0) / 2.2; p.visible = u > -0.1 && u < 1.2;
      const S0 = V().set(p.tx - 30, 34, -60), E0 = V().set(p.tx, 6, -14.5), pos = S0.clone().lerp(E0, clamp(u)); if (u > 1) pos.add(V().set(18 * (u - 1), 12 * (u - 1), 10 * (u - 1)));
      p.position.copy(pos); p.lookAt(pos.clone().add(u < 1 ? E0.clone().sub(S0) : V().set(1, 0.7, 0.5))); p.spin(t);
      const kb = ss(p.t0 + 1.9, p.t0 + 2.05, t) * (1 - ss(p.t0 + 2.2, p.t0 + 3.0, t)); hits[i].position.set(p.tx, 3.5, -14.5); hits[i].material.opacity = 0.95 * kb; hits[i].scale.setScalar(8 + 16 * kb); });
    Ph.tick?.(t);
    return U.film(t) + U.stamp(t, tA2 + 0.2, tB + 0.2, '7 de diciembre de 1941', 'Pearl Harbor, Hawái')
      + U.popCard(t, tSor - 0.2, tB + 0.25, 'ATAQUE SORPRESA', 'Más de 2400 estadounidenses muertos', 'y la flota del Pacífico en llamas', { x: 1440, y: 140, w: 480, accent: '#b8342f' });
  };

  // ================================================================ B: Roosevelt signs the declaration of war
  const Ov = S.WS.ovalOffice();
  const chair = Ov.children.find(o => o.seatY !== undefined) || null;
  const fdr = K.stand_in(Ov, 'roosevelt', 0, -3.38, 0); K.seatOn(fdr, chair ? chair.seatY : 0.45); const yF = fdr.root.position.y;
  const doc = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.004, 0.21), new THREE.MeshStandardMaterial({ color: '#f3ecd8', roughness: 0.9 })); doc.position.set(0.05, Ov.desk.top + 0.003, -2.98); Ov.add(doc);
  const actB = t => {
    fdr.root.position.y = yF;
    K.act(fdr, A.write(t, 1, [0.05, Ov.desk.top, -2.98], 0, ss(tB + 0.2, tB + 0.7, t)), t, { mouth: t > tEnt && t < tEnt + 1.2 ? [0.3, 0] : [0, 0.1] });
    Ov.tick?.(t);
    return U.film(t) + U.who(t, tB + 0.2, tEnt + 0.5, 'Franklin D. Roosevelt', 'Presidente de Estados Unidos', { code: 'us', actor: 'Sirius Symboli' })
      + U.quoteAt(t, [['Una fecha que vivirá', tEnt - 0.6], ['en la infamia.', tEnt]], 'F. D. Roosevelt, 8 de diciembre de 1941', tEnt - 0.7, tC + 0.25, { left: 72, top: 560, w: 640, size: 40 });
  };

  // ================================================================ C: Japan conquers half the Pacific
  const actC = t => {
    EMP.forEach(n => Wm.paint(n, '#a8322a', 1, 0.18)); occ.set(1); japZ.set(ss(tC + 0.1, tPac + 0.4, t));
    return U.film(t) + [['FILIPINAS', 122, 12], ['INDONESIA', 113, -1], ['BIRMANIA', 96, 21], ['MALASIA', 102, 4], ['NUEVA GUINEA', 143, -5], ['ISLAS SALOMÓN', 159, -8]]
      .map(([n, lo, la], i) => MP.wlabel(ctx, Wm, lo, la, n, fade(t, tCon + i * 0.18, ctx.dur + 1), 'st')).join('')
      + U.popCard(t, tCon - 0.1, tD + 0.25, 'EN MEDIO AÑO', 'Japón conquistó medio Pacífico', 'de Birmania a las islas Salomón', { x: 1440, y: 140, w: 470, accent: '#a8322a' });
  };
  const [cx, , cz] = Wm.pos(135, 10);

  // ================================================================ D: Midway — dive bombers over a Japanese carrier
  const Sea = S.pacificSea('day');
  const cv = P.carrier(); cv.position.set(0, 0, 0); Sea.add(cv);
  const sbds = [0, 1, 2].map(i => { const p = P.aircraft('sbd'); Sea.add(p); p.t0 = tD + 0.1 + i * 0.7; return p; });
  const booms = sbds.map(() => { const g = P.glow('#ffb060', 14, 0); Sea.add(g); return g; });
  const fires = [[1, -8], [-0.8, 4], [0.6, 12]].map(([x, z], i) => { S.W1.smokeFrom(Sea, new THREE.Vector3(x, cv.deckY + 1, z), { n: 12, color: '#24201e', size: 2.4, rise: 22, drift: [5, 0, -3], life: 6, opacity: 0.8 });
    return S.W1.fireAt(Sea, new THREE.Vector3(x, cv.deckY + 0.6, z), { n: 12, size: 2.0, rise: 2.4, spread: 2.2, ph: i * 0.3 }); });
  const actD = t => {
    cv.position.z = (t - tD) * 1.2;
    sbds.forEach((p, i) => { const u = (t - p.t0) / 1.6; p.visible = u > -0.1 && u < 1.6; const tgt = V().set([1, -0.8, 0.6][i], cv.deckY + 3, [-8, 4, 12][i] + cv.position.z);
      const S0 = tgt.clone().add(V().set(-8, 46, -12)), pos = S0.clone().lerp(tgt, clamp(u)); if (u > 1) pos.add(V().set(10 * (u - 1), 14 * (u - 1) ** 1.5, 16 * (u - 1)));
      p.position.copy(pos); p.lookAt(pos.clone().add(u < 1 ? tgt.clone().sub(S0) : V().set(0.6, 0.8, 1))); p.spin(t);
      const kb = ss(p.t0 + 1.55, p.t0 + 1.7, t) * (1 - ss(p.t0 + 1.9, p.t0 + 2.8, t)); booms[i].position.copy(tgt).add(V().set(0, -2.4, 0)); booms[i].material.opacity = 0.95 * kb; booms[i].scale.setScalar(10 + 18 * kb); });
    fires.forEach((f, i) => { f.visible = t > sbds[i].t0 + 1.6; f.position.z = [-8, 4, 12][i] + cv.position.z; });
    Sea.tick?.(t);
    return U.film(t) + U.stamp(t, tD + 0.2, tE + 0.2, '4 de junio de 1942', 'Midway')
      + U.bigNumber(t, tCua - 0.2, tE + 0.25, '4 portaaviones', 'HUNDIDOS EN UN SOLO DÍA', { y: 200, size: 96, count: 0, band: true });
  };

  // ================================================================ E1: island to island — marines wade ashore
  const Ib = S.islandBeach('day');
  const craft = [[-3, -7.4], [2.5, -8.6], [7.5, -7.8]].map(([x, z], i) => { const c = P.OLD.landingCraft('#5a6450'); c.position.set(x, 0, z); c.ramp.rotation.x = 1.3; Ib.add(c); return c; });
  const marines = Array.from({ length: 9 }, (_, i) => { const r = K.person(Ib, CAST[(i + 4) % 10], 'marineArmado', -3.4 + (i % 3) * 5.4 + Math.floor(i / 3) * 0.5, -5.6 + Math.floor(i / 3) * 1.1, 0, { shadow: false }); r.x0 = r.root.position.x; r.z0 = r.root.position.z; return r; });
  const beachY = z => z < 2 ? -0.42 + Math.max(0, z + 9) * 0.035 : (z - 2) * 0.012;
  const actE = t => {
    marines.forEach((r, i) => { const D = (t - tE + 0.6) * 0.5, z = r.z0 + D; r.root.position.set(r.x0, Math.min(0.0, beachY(z)), z);
      K.act(r, M.mix(A.portRifle(t, i), M.gait(D / r.unit, { run: 0.4, amp: 1, seed: i }), 0.7), t, { mouth: 'neutral' }); });
    craft.forEach((c, i) => { c.position.y = 0.06 * Math.sin(t * 1.4 + i); });
    Ib.tick?.(t);
    return U.film(t) + U.stamp(t, tE + 0.2, tE2 + 0.2, 'Guadalcanal, Tarawa, Iwo Jima…', '1942 – 1945');
  };
  // E2: the island-hopping arrows across the map
  const hops = [[[160, -9.5], [166, -4], [173, 1.4]], [[173, 1.4], [170, 6], [167.7, 9]], [[167.7, 9], [156, 13], [145.7, 15.2]], [[145.7, 15.2], [143, 20], [141.3, 24.8]], [[141.3, 24.8], [134, 26], [127.8, 26.3]],
    [[147, -6], [135, -1], [125, 8]]].map(p => MP.warrow(Wm, p, '#3f6fb5', 0.8));
  const actE2 = t => {
    EMP.forEach(n => Wm.paint(n, '#a8322a', 1, 0.18)); occ.set(1); japZ.set(1 - 0.5 * ss(tE2, tF, t));
    hops.forEach((a, i) => a.set(ss(tE2 + i * 0.2, tE2 + 0.6 + i * 0.2, t)));
    return U.film(t) + [['Guadalcanal', 160, -9.5], ['Tarawa', 173, 1.4], ['Saipán', 145.7, 15.2], ['Iwo Jima', 141.3, 24.8], ['Okinawa', 127.8, 26.3]]
      .map(([n, lo, la], i) => MP.wlabel(ctx, Wm, lo, la, n, fade(t, tE2 + 0.1 + i * 0.2, ctx.dur + 1), 'c')).join('');
  };
  const [ex, , ez] = Wm.pos(150, 8);

  // ================================================================ F: China, resisting since 1937
  const Gw = S.greatWallSet('golden');
  const guards = [[-2.4, -1.45, 0.2], [0.6, -1.5, -0.1], [3.4, -1.25, 0.1]].map(([x, z, y], i) => { const r = K.person(Gw, ['hishi', 'oguri', 'doto'][i], i === 1 ? 'chinoArmado' : 'chino', x, z, y); r.root.position.y = Gw.walkY; return r; });
  const actF = t => {
    guards.forEach((r, i) => { r.root.position.y = Gw.walkY; K.act(r, i === 1 ? A.portRifle(t, i + 2) : i === 0 ? A.binoculars(t, i + 2, 1) : A.crossArms(t, i + 2), t, { mouth: 'neutral' }); });
    return U.film(t) + U.sides(t, tChi - 0.2, ctx.dur + 1, 'CHINA', [['cn', 'República de China']], { x: 1560, y: 120, accent: '#c0392b' })
      + U.popCard(t, tChi + 0.6, ctx.dur + 1, 'RESISTIÓ DESDE 1937', 'Entre 15 y 20 millones', 'de chinos murieron en la guerra', { x: 1440, y: 330, w: 470, accent: '#c0392b' });
  };

  const sfx = [
    { t: 0, type: 'tension', dur: tA2, vol: 0.25 }, { t: tJap, type: 'pop', vol: 0.3 }, { t: tImp, type: 'swoosh', vol: 0.3 },
    { t: tA2, type: 'waves', dur: tB - tA2, vol: 0.25 }, { t: tA2 + 0.2, type: 'plane', dur: tB - tA2, vol: 0.4 }, { t: tA2 + 0.6, type: 'siren', dur: tB - tA2 - 0.6, vol: 0.22 },
    ...zeros.map(p => ({ t: p.t0 + 1.9, type: 'bigboom', vol: 0.35 })), { t: tSor, type: 'sting', vol: 0.3 },
    { t: tB, type: 'clock', dur: tC - tB, vol: 0.18 }, { t: tB + 0.4, type: 'quill', dur: 2.5, vol: 0.25 }, { t: tEnt, type: 'gavel', vol: 0.4 },
    { t: tC, type: 'whoosh', vol: 0.3 }, { t: tC + 0.2, type: 'drum', dur: tD - tC, vol: 0.25 },
    { t: tD, type: 'waves', dur: tE - tD, vol: 0.3 }, { t: tD, type: 'plane', dur: tE - tD, vol: 0.4 }, ...sbds.map(p => ({ t: p.t0 + 1.55, type: 'bigboom', vol: 0.4 })), { t: tCua, type: 'sting2', vol: 0.3 },
    { t: tE, type: 'waves', dur: tE2 - tE, vol: 0.35 }, { t: tE, type: 'gunfire', dur: tE2 - tE, vol: 0.25 }, { t: tE + 0.3, type: 'splash', vol: 0.35 },
    { t: tE2, type: 'whoosh', vol: 0.3 }, ...hops.map((_, i) => ({ t: tE2 + i * 0.2, type: 'swoosh', vol: 0.22 })),
    { t: tF, type: 'wind', dur: ctx.dur - tF, vol: 0.25 }, { t: tF, type: 'drums', dur: ctx.dur - tF, vol: 0.22 },
  ];
  const shots = [
    { t0: 0, set: Wm, p0: [ax, 62, az + 34], l0: [ax, 0, az], p1: [ax, 54, az + 30], l1: [ax, 0, az], fov0: 40, act: actA1 },
    { t0: tA2, set: Ph, p0: [7.4, 1.75, 12.2], l0: [-1, 2.6, -16], p1: [7.0, 1.7, 11.4], l1: [-1, 3.2, -16], fov0: 46, act: actA2 },
    { t0: tB, set: Ov, p0: [0.8, 1.2, -1.5], l0: [0, 0.95, -3.3], p1: [0.62, 1.16, -1.8], l1: [0, 0.95, -3.3], fov0: 40, act: actB },
    { t0: tC, set: Wm, p0: [cx, 95, cz + 50], l0: [cx, 0, cz], p1: [cx, 88, cz + 46], l1: [cx, 0, cz], fov0: 40, act: actC },
    { t0: tD, set: Sea, p0: [24, 13, 28], l0: [0, 5, 4], p1: [22, 12, 25], l1: [0, 5, 6], fov0: 42, act: actD },
    { t0: tE, set: Ib, p0: [3.2, 0.95, 3.6], l0: [0.8, 0.4, -7], p1: [2.9, 0.9, 3.0], l1: [0.8, 0.4, -7], fov0: 46, act: actE },
    { t0: tE2, set: Wm, p0: [ex, 80, ez + 44], l0: [ex, 0, ez], p1: [ex - 4, 76, ez + 42], l1: [ex - 4, 0, ez], fov0: 40, act: actE2 },
    { t0: tF, set: Gw, p0: [1.0, 2.6, 4.6], l0: [0.4, 2.6, -2], p1: [0.8, 2.6, 3.8], l1: [0.4, 2.7, -2], fov0: 46, act: actF },
  ];
  const inst = { scene: Wm, scenes: [Wm, Ph, Ov, Sea, Ib, Gw], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
