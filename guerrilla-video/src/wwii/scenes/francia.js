import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as MP from '../maps.js';
import * as M from '../../lib/motion.js';
import * as MX from '../../mx/props.js';
import { run, wt, walkIn } from '../../whatif/shots.js';
const { ss, clamp, HAND } = M;
const EU = MP.EU, fade = U.fade;
export const preload = MP.preload;
const V = () => new THREE.Vector3();
const wrist = (r, s) => { r.root.updateMatrixWorld(true); return r.j['wri' + s].bone.getWorldPosition(V()); };
const CAST = ['oguri', 'tamamo', 'cafe', 'doto', 'mcqueen', 'daiwa', 'suzuka', 'helios', 'spe', 'hishi'];

export function build(ctx) {
  const L = ctx.L;
  const tFra = wt(L[0], 'francia'), tTan = wt(L[0], 'tanques'), tArd = wt(L[0], 'ardenas'), tRod = wt(L[0], 'rodearon'), tMar = wt(L[0], 'mar');
  const tDun = wt(L[1], 'dunkerque'), tBar = wt(L[1], 'barcos'), tPes = wt(L[1], 'pescadores'), tRes = wt(L[1], 'rescataron'), tTre = wt(L[1], 'trescientos'), tJun = wt(L[1], 'junio'), tPar = wt(L[1], 'paris');
  const tSol = wt(L[2], 'sola'), tWin = wt(L[2], 'uinston'), tJam = wt(L[2], 'jamas'), tPil = wt(L[2], 'pilotos'), tRad = wt(L[2], 'radar'), tGan = wt(L[2], 'ganaron'), tIng = wt(L[2], 'inglaterra'),
    tMie = wt(L[2], 'mientras'), tBom = wt(L[2], 'bombas'), tLon = wt(L[2], 'londres');
  const tB = tTan - 0.3, tC = tRod - 0.3, tD = L[1].t0 - 0.2, tD2 = tRes - 0.25, tE = tJun - 0.4, tF = L[2].t0 - 0.3, tG = tWin - 0.3, tH = tPil - 0.3, tH2 = tGan - 0.3, tI = tMie - 0.2;

  // ================================================================ A: 10 May 1940 — the Maginot Line keeps watch to the east
  const Mg = S.maginot('morning');
  const watch = K.person(Mg, 'hishi', 'frances', -0.7, -0.9, 0.12), mate = K.person(Mg, 'doto', 'frances', 0.55, -0.7, -0.15);
  const glasses = new THREE.Group(); for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.1, 10), new THREE.MeshStandardMaterial({ color: '#1e1e1e', roughness: 0.5 })); m.rotation.x = Math.PI / 2; m.position.x = sx * 0.03; glasses.add(m); }
  glasses.userData.dynamic = true; Mg.add(glasses);
  const actA = t => {
    K.act(watch, A.binoculars(t, 1, 1), t, { mouth: 'neutral' });
    const a = wrist(watch, 'L'), b = wrist(watch, 'R'); glasses.position.copy(a).add(b).multiplyScalar(0.5).add(V().set(0, 0.03, 0)); glasses.rotation.set(-0.05, watch.root.rotation.y, 0);
    K.act(mate, A.crossArms(t, 2), t, { mouth: 'neutral' });
    return U.film(t) + U.stamp(t, 0.5, tB + 0.2, '10 de mayo de 1940', 'Línea Maginot')
      + U.popCard(t, tFra - 0.2, tB + 0.25, 'LA LÍNEA MAGINOT', 'Francia esperaba el ataque por aquí…', 'una muralla de búnkeres en la frontera alemana', { x: 1440, y: 140, w: 500, accent: '#3f6fb5' });
  };

  // ================================================================ B: the Panzers come through the Ardennes
  const Ar = S.ardennes('morning');
  const col = [0, 1, 2, 3].map(i => { const tk = P.tank('pz4'); tk.scale.setScalar(0.48); Ar.add(tk); tk.z0 = -6 - i * 5.2; return tk; });
  const actB = t => {
    col.forEach((tk, i) => { const z = tk.z0 + (t - tB) * 1.5, x = Ar.roadX(z), x2 = Ar.roadX(z + 0.5); tk.position.set(x, 0, z); tk.rotation.y = Math.atan2(x2 - x, 0.5); tk.drive(z); tk.rock(t + i, 1); });
    return U.film(t) + U.popCard(t, tArd - 0.3, tC + 0.25, 'EL BOSQUE DE LAS ARDENAS', 'Lo creían intransitable para los tanques', 'Por ahí entró el grueso de los Panzer', { x: 1440, y: 140, w: 500, accent: '#b8342f' });
  };

  // ================================================================ C: the "sickle cut" — the Allied armies pinned against the sea
  const Mc = MP.europe({ period: 'w1939b' });
  const cut = EU.arrow(Mc, [[6.8, 50.25], [5.2, 49.75], [3.8, 49.85], [2.6, 50.0], [1.75, 50.2]], '#3a3f48', 0.5);
  const north = EU.arrow(Mc, [[7.0, 51.9], [5.6, 51.5], [4.5, 51.0]], '#3a3f48', 0.42);
  const pocket = EU.zone(Mc, [[1.8, 51.12], [2.6, 51.18], [3.7, 51.2], [4.3, 50.9], [3.6, 50.45], [2.6, 50.45], [1.9, 50.75]], '#3f6fb5', { opacity: 0.55 });
  const dk = EU.pulse(Mc, 2.38, 51.03, '#e0b84a', 1.0);
  const actC = t => {
    Mc.paint('w1939b', 'w1940', ss(tRod - 0.2, tMar + 0.3, t));
    cut.set(ss(tC + 0.1, tRod + 1.1, t)); north.set(ss(tC, tRod + 0.6, t)); pocket.set(ss(tRod + 0.6, tMar, t) * (0.75 + 0.25 * Math.sin(t * 6)));
    dk.update(t, tMar - 0.2);
    return U.film(t) + EU.chip(ctx, 5.6, 50.05, fade(t, tC + 0.1, ctx.dur + 1), 'Ardenas', '', '#3a3f48', 0.4)
      + EU.city(ctx, Mc, 'Dunkerque', fade(t, tMar - 0.3, ctx.dur + 1)) + EU.areaLabel(ctx, 3.0, 50.8, 'ALIADOS RODEADOS', fade(t, tRod + 0.6, ctx.dur + 1), 'st');
  };
  const [cx, , cz] = EU.wpos(3.8, 50.4);

  // ================================================================ D: Dunkirk — the long lines into the sea and the little ships
  const Dk = S.dunkirk('overcast');
  const LINES = [[1.0, -10.1], [5.0, -12.4], [-4.0, -11.5]];
  const wade = LINES.flatMap(([x, zh], j) => Array.from({ length: 10 }, (_, i) => { const r = K.person(Dk, CAST[(i + j * 3) % 10], (i + j) % 3 ? 'britanico' : 'frances', x + (i % 2 ? 0.06 : -0.05), zh + i * 0.72, Math.PI + (i % 2 ? 0.1 : -0.08), { shadow: false });
    r.x0 = r.root.position.x; r.z0 = r.root.position.z; r.j0 = j; r.i0 = i; return r; }));
  const waiting = K.crowd(Dk, ['britanico', 'frances', 'britanico'], 9, [-7, -1.0, 3.5, 1.5], { seed: 31, face: [0, -20] });
  // the rescue: a fisherman leans over the gunwale and hauls a soldier out of the water
  const boat0 = Dk.boats[0], hull = boat0.children[0];
  const fisher = K.person(hull, 'tamamo', 'pescador', 0.22, 0.1, Math.PI / 2); fisher.root.position.y = 0.36;
  const swimmer = K.person(Dk, 'cafe', 'britanico', 1.75, -12.72, -Math.PI / 2 + 0.3, { shadow: false });
  const actD = (t, close) => {
    wade.forEach(r => {
      const z = r.z0 - 0.07 * (t - tD) * (1 - 0.3 * r.j0), y = Dk.sandY(z);
      r.root.position.set(r.x0, Math.min(0.12, y), z);
      const st = A.stand(t, r.i0 + r.j0 * 3, { amt: 0.4 }); st.head = [st.head[0] + 10, st.head[1], st.head[2]];
      K.act(r, M.mix(st, M.gait((t - tD) * 0.07, { amp: 0.35, seed: r.i0 }), 0.6), t, { mouth: 'neutral' });
    });
    waiting.forEach((r, i) => K.act(r, i % 3 ? A.stand(t, i + 20) : A.crossArms(t, i + 20), t, { mouth: 'neutral' }));
    // the haul: hands meet over the gunwale and rise as she pulls
    const k = ss(tD2 + 0.4, tD2 + 2.6, t), P_ = [1.52, 0.42 + 0.22 * k, -12.63];
    const fp = A.hands(t, 3, [P_[0], P_[1] + 0.02, P_[2] + 0.06], [P_[0], P_[1] + 0.02, P_[2] - 0.06], 1, { amt: 0.2 }); fp.waist = [22 - 10 * k, 0, 0]; fp.chest = [10, 0, 0]; fp.hipY = -0.02;
    K.act(fisher, fp, t, { mouth: k > 0.2 ? 'open' : 'neutral' });
    swimmer.root.position.set(1.75 - 0.11 * k, Dk.sandY(-12.72) + 0.2 * k, -12.72 + 0.035 * k);
    const sw = A.hands(t, 4, [P_[0] + 0.04, P_[1] - 0.02, P_[2] + 0.05], [P_[0] + 0.04, P_[1] - 0.02, P_[2] - 0.05], 1); sw.head = [-14, 0, 0];
    K.act(swimmer, sw, t, { mouth: 'open' });
    Dk.tick?.(t);
    return U.film(t) + U.stamp(t, tD + 0.2, tE + 0.2, '26 de mayo – 4 de junio de 1940', 'Dunkerque')
      + (close ? U.bigNumber(t, tTre - 0.25, tE + 0.25, 338226, 'SOLDADOS RESCATADOS', { y: 200, size: 104, count: 1.5, band: true })
        : U.popCard(t, tPes - 0.35, tD2 + 0.25, 'LOS «PEQUEÑOS BARCOS»', 'Pesqueros, yates y lanchas', 'cruzaron el Canal para sacarlos de la playa', { x: 1440, y: 140, w: 500, accent: '#3f6fb5' }));
  };

  // ================================================================ E: 14 June 1940 — German troops march down the Champs-Élysées
  const Ch = S.champs('overcast');
  const parade = Array.from({ length: 16 }, (_, i) => { const r = K.person(Ch, CAST[i % 10], 'aleman', 0, 0, 0, { shadow: false }); r.c = i % 4; r.rw = Math.floor(i / 4); return r; });
  const parisian = K.person(Ch, 'daiwa', 'civilMujer', 4.5, -2.6, -Math.PI / 2 - 0.25), parisian2 = K.person(Ch, 'helios', 'civil', 5.05, -1.9, -Math.PI / 2 - 0.15);
  const actE = t => {
    const lead = -5.2 + (t - tE) * 0.32;
    parade.forEach(r => { r.root.position.set(-1.5 + r.c * 1.0, 0, lead - r.rw * 0.9); K.act(r, A.march(lead / r.unit, 0, 1, 1.4), t, { mouth: 'neutral' }); });
    K.act(parisian, A.mourn(t, 1, 1), t, { mouth: 'frown', eye: 'flat' });
    K.act(parisian2, M.mix(A.stand(t, 2), A.handOnHeart(t, 2, 1), 0.7), t, { mouth: 'frown' });
    return U.film(t) + U.stamp(t, tE + 0.2, tF + 0.2, '14 de junio de 1940', 'París')
      + U.popCard(t, tPar - 0.4, tF + 0.25, 'FRANCIA SE RINDE', 'Armisticio del 22 de junio', 'el norte queda ocupado; al sur, el régimen de Vichy', { x: 1440, y: 140, w: 520, accent: '#b8342f' });
  };

  // ================================================================ F: Britain alone
  const Mf = MP.europe({ period: 'w1940' });
  const uk = EU.pulse(Mf, -1.8, 52.8, '#3f6fb5', 2.2);
  const actF = t => {
    Mf.paint('w1940'); Mf.tintState('w1940', 'A_GBR', '#6f9fe8', 0.5 + 0.5 * Math.sin(t * 5) * ss(tSol - 0.2, tSol + 0.2, t), 0.5);
    uk.update(t, tSol - 0.2);
    return U.film(t) + U.popCard(t, tSol - 0.25, tG + 0.25, 'JUNIO DE 1940', 'Gran Bretaña, sola', 'frente a la Europa dominada por Hitler', { x: 1440, y: 140, w: 470, accent: '#3f6fb5' });
  };
  const [fx, , fz] = EU.wpos(4, 51.5);

  // ================================================================ G: "We shall never surrender" — Churchill in the House of Commons
  const Cm = S.commons();
  const wsc = K.stand_in(Cm, 'churchill', 0.86, 0.32, -Math.PI / 2);
  const mps = Cm.benches.filter(b => b.row < 2).flatMap((b, j) => [-3.2, -1.9, -0.6, 0.7, 2.0].map((z, i) => ({ b, z: z + (j % 2) * 0.3, i: i + j * 5 })))
    .filter(({ b, z }) => !(b.sx > 0 && b.row === 0 && Math.abs(z - 0.32) < 0.8))
    .map(({ b, z, i }) => { const r = K.person(Cm, CAST[i % 10], 'diputado', b.x, z, b.sx > 0 ? -Math.PI / 2 : Math.PI / 2, { shadow: false }); K.seatOn(r, b.y); r.y0 = r.root.position.y; r.k = i; return r; });
  const actG = t => {
    const v = ss(tJam - 0.35, tJam + 0.1, t) * (1 - ss(tH - 0.5, tH, t));
    K.act(wsc, M.mix(A.orate(t, 1, 0.9), A.vSign(t, 1, 1), v), t, { talk: t < tJam + 0.4 ? 0.9 : 0, smile: 0.2 });
    const cheer = ss(tJam + 0.1, tJam + 0.5, t);
    mps.forEach(r => { r.root.position.y = r.y0; K.act(r, r.k % 3 === 0 && cheer > 0 ? A.seated(A.wave, t, r.k, 'R') : A.sit(t, r.k), t, { mouth: cheer > 0.5 && r.k % 2 ? 'open' : 'neutral' }); });
    return U.film(t) + U.who(t, tG + 0.1, tJam - 0.3, 'Winston Churchill', 'Primer ministro del Reino Unido', { code: 'gb', actor: 'Tamamo Cross' })
      + U.quoteAt(t, [['Nunca', tJam - 0.75], ['nos rendiremos.', tJam - 0.2]], 'Winston Churchill, 4 de junio de 1940', tJam - 0.9, tH + 0.2, { left: 72, top: 520, w: 620, size: 44 });
  };

  // ================================================================ H: radar, the plotting table, and Spitfires over the Channel
  const Op = S.opsRoom(), TB = Op.table, TT = TB.position.y + TB.top;
  const LONDON = [-0.27, -0.55], plotters = [[-0.6, 1.85, Math.PI], [0.9, 1.85, Math.PI], [-2.15, 0.1, Math.PI / 2], [2.15, 0.6, -Math.PI / 2]].map(([x, z, y], i) => K.person(Op, ['daiwa', 'spe', 'hishi', 'mcqueen'][i], 'waaf', x, z, y));
  const rakes = plotters.map(() => { const r = P.rake(1.0); Op.add(r); return r; });
  const officers = [-1.2, 0.4, 1.8].map((x, i) => { const r = K.person(Op, ['oguri', 'tamamo', 'helios'][i], 'pilotoRAF', x, -2.55, 0); r.root.position.y = Op.galleryY; return r; });
  const counterAt = (i, t) => { const u = clamp((t - tH + i * 0.4) / 5.0), red = i < 5;
    const sx = -1.2 + (i % 5) * 0.55, sz = red ? 1.0 : -0.9, ex = LONDON[0] + (i % 5 - 2) * 0.12, ez = red ? LONDON[1] + 0.35 : LONDON[1] + 0.05;
    return [TB.position.x + sx + (ex - sx) * u * (red ? 0.6 : 0.4), TT, TB.position.z + sz + (ez - sz) * u * (red ? 0.6 : 0.4)]; };
  const actH = t => {
    TB.counters.forEach((c, i) => { const [x, y, z] = counterAt(i, t); c.position.set(x - TB.position.x, TB.top, z - TB.position.z); });
    plotters.forEach((r, i) => {
      const tgt = counterAt([0, 6, 2, 7][i], t), sh = V().set(r.root.position.x, 0, r.root.position.z), to = V().set(tgt[0], 0, tgt[2]).sub(sh).normalize();
      const hand = sh.clone().add(to.clone().multiplyScalar(0.2)); hand.y = 0.42;
      const pr = A.hands(t, i + 1, [hand.x - to.z * 0.04, hand.y, hand.z + to.x * 0.04], [hand.x + to.z * 0.04, hand.y - 0.02, hand.z - to.x * 0.04], 1); pr.waist = [12, 0, 0]; pr.chest = [8, 0, 0]; pr.look = tgt; pr.lookW = 0.6;
      K.act(r, pr, t, { mouth: 'neutral' });
      const rk = rakes[i], dir = V().set(...tgt).sub(hand); rk.position.copy(hand); rk.quaternion.setFromUnitVectors(V().set(0, -1, 0), dir.clone().normalize()); rk.scale.set(1, dir.length() / 1.0, 1);
    });
    officers.forEach((r, i) => { r.root.position.y = Op.galleryY; K.act(r, i === 1 ? A.phone(t, i + 7) : A.crossArms(t, i + 7), t, { mouth: i === 1 ? 'open' : 'neutral' }); });
    return U.film(t) + U.popCard(t, tRad - 0.3, tH2 + 0.25, 'EL RADAR', 'Veía venir a los aviones alemanes', 'y la RAF los esperaba en el aire', { x: 1440, y: 140, w: 470, accent: '#3f6fb5' });
  };
  const Sk = S.W1.skyStage('day', { ground: ['#6f8a4e', '#62803f'], clouds: 22 });
  const spit = P.aircraft('spitfire'), bf = P.aircraft('bf109'), heinkels = [0, 1, 2].map(() => P.aircraft('he111'));
  [spit, bf, ...heinkels].forEach(p => Sk.add(p));
  const smoke = MX.smokeTrail(Sk, 18, { color: '#3a3836', size: 0.9, rise: 0.6, drift: [-6, 0, 0], life: 1.6, opacity: 0.85 });
  const tracer = new THREE.Group(); for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 9, 4), new THREE.MeshBasicMaterial({ color: '#ffe08a', transparent: true, opacity: 0.8, toneMapped: false })); m.rotation.z = Math.PI / 2; m.position.set(4.8, 0, sx * 1.6); tracer.add(m); }
  tracer.userData.dynamic = true; Sk.add(tracer);
  const ALT = 34, X = t => -10 + (t - tH2) * 9;
  const actH2 = t => {
    const x = X(t), hit = ss(tIng - 0.2, tIng + 0.1, t);
    bf.position.set(x + 7, ALT + 0.3 - 1.5 * hit * (t - tIng + 0.2), 0.4); bf.rotation.set(0, Math.PI / 2, 0.25 * Math.sin(t * 2) + 0.6 * hit); bf.rotateX(0.25 * hit); bf.spin(t);
    spit.position.set(x, ALT + 0.5 * Math.sin(t * 1.5), -0.2); spit.rotation.set(0, Math.PI / 2, -0.15 * Math.sin(t * 2 + 1)); spit.spin(t);
    heinkels.forEach((h, i) => { h.position.set(x + 20 + i * 7, ALT + 6 + i * 0.8, -26 - i * 6); h.rotation.set(0, Math.PI / 2, 0); h.spin(t); });
    const fire = (t > tGan - 0.1 && t < tIng + 0.2) && Math.sin(t * 60) > -0.2; tracer.visible = fire; tracer.position.copy(spit.position); tracer.position.y -= 0.15;
    smoke(t, bf.position, hit); Sk.tick?.(t);
    return U.film(t) + U.stamp(t, tH2 + 0.1, tI + 0.2, 'julio – octubre de 1940', 'Batalla de Inglaterra');
  };

  // ================================================================ I: the Blitz — bombs on London, St Paul's in the smoke
  const Bl = S.blitzNight();
  for (const [x, z, k] of [[-36, -100, 1.6], [-6, -112, 1.4], [-44, -128, 1.2], [8, -96, 1.0], [-38, -80, 1.3]]) {
    S.W1.fireAt(Bl, new THREE.Vector3(x, 3, z), { n: 12, size: 4 * k, rise: 5, spread: 5 });
    S.W1.smokeFrom(Bl, new THREE.Vector3(x, 6, z), { n: 14, color: '#6a4a3a', size: 4.6 * k, rise: 34, drift: [8, 0, -4], life: 7, opacity: 0.75 });
    const g = P.glow('#ff7a2a', 22 * k, 0.6); g.position.set(x, 8, z - 4); Bl.add(g); }
  Bl.stPauls.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.color.multiplyScalar(0.3); } });   // the dome as a dark silhouette against the burning sky
  const backdrop = P.glow('#ff8a3a', 170, 0.55); backdrop.position.set(-24, 26, -170); Bl.add(backdrop);   // the sky lit by the fires behind St Paul's
  const rimL = new THREE.PointLight('#ff8a40', 220, 160, 1.2); rimL.position.set(-18, 14, -150); Bl.add(rimL);
  const flashes = Array.from({ length: 6 }, (_, i) => { const g = P.glow('#ffd090', 20, 0); g.position.set(-36 + i * 11, 5 + (i % 2) * 3, -70 - (i % 3) * 14); Bl.add(g); g.t0 = tI + 0.3 + i * 0.55; return g; });
  const flare = new THREE.PointLight('#ff9a50', 0, 60, 1.3); flare.position.set(-10, 10, -40); Bl.add(flare);
  const actI = t => {
    let fl = 0; flashes.forEach(g => { const k = Math.max(0, 1 - Math.abs(t - g.t0) / 0.45); g.material.opacity = 0.95 * k; g.scale.setScalar(14 + 34 * k); fl = Math.max(fl, k); });
    flare.intensity = 120 * fl; backdrop.material.opacity = 0.5 + 0.08 * Math.sin(t * 2.3); Bl.tick?.(t);
    return U.film(t) + U.stamp(t, tI + 0.2, ctx.dur + 1, 'septiembre de 1940 – mayo de 1941', 'el Blitz')
      + U.source(t, tLon - 0.6, ctx.dur + 1, 'Unos 43 000 civiles británicos murieron en el Blitz');
  };

  const sfx = [
    { t: 0, type: 'birds', dur: tB, vol: 0.2 }, { t: 0, type: 'wind', dur: tC, vol: 0.18 }, { t: tFra - 0.1, type: 'tension', dur: tC - tFra, vol: 0.25 },
    { t: tB - 0.2, type: 'engines', dur: tC - tB + 0.3, vol: 0.42 }, { t: tB, type: 'clank', vol: 0.4 },
    { t: tC, type: 'whoosh', vol: 0.3 }, { t: tC + 0.1, type: 'swoosh', vol: 0.3 }, { t: tMar - 0.2, type: 'sting', vol: 0.3 },
    { t: tD, type: 'waves', dur: tE - tD, vol: 0.35 }, { t: tD, type: 'crowd', dur: tE - tD, vol: 0.18 }, { t: tD + 0.5, type: 'plane', dur: 2.5, vol: 0.18 }, { t: tD + 1.4, type: 'boom', vol: 0.25 },
    { t: tD2 + 0.4, type: 'splash', vol: 0.4 }, { t: tTre - 0.2, type: 'tick', vol: 0.3 }, { t: tTre + 1.3, type: 'cheer', vol: 0.3 },
    { t: tE, type: 'march', dur: tF - tE, vol: 0.4 }, { t: tE, type: 'drum', dur: tF - tE, vol: 0.25 },
    { t: tF, type: 'whoosh', vol: 0.3 }, { t: tSol - 0.2, type: 'sting2', vol: 0.28 },
    { t: tG, type: 'crowd', dur: tH - tG, vol: 0.15 }, { t: tJam + 0.2, type: 'cheer', vol: 0.4 }, { t: tJam + 0.2, type: 'applause', dur: tH - tJam, vol: 0.3 },
    { t: tH, type: 'beep', vol: 0.3 }, { t: tH, type: 'typewriter', dur: tH2 - tH, vol: 0.12 }, { t: tH + 0.2, type: 'notify', vol: 0.25 },
    { t: tH2, type: 'plane', dur: tI - tH2, vol: 0.45 }, { t: tGan - 0.1, type: 'mg', dur: tIng + 0.2 - tGan + 0.1, vol: 0.35 }, { t: tIng, type: 'boom', vol: 0.35 },
    { t: tI, type: 'sirens', dur: ctx.dur - tI, vol: 0.32 }, { t: tI, type: 'fire', dur: ctx.dur - tI, vol: 0.3 }, { t: tI, type: 'engines', dur: ctx.dur - tI, vol: 0.2 },
    ...[0, 1, 2, 3, 4, 5].map(i => ({ t: tI + 0.3 + i * 0.55, type: i % 2 ? 'boom' : 'bigboom', vol: 0.32 })),
  ];
  const shots = [
    { t0: 0, set: Mg, p0: [1.7, 0.72, 5.8], l0: [0, 0.75, -0.5], p1: [1.3, 0.7, 5.0], l1: [0, 0.75, -0.5], fov0: 42, act: actA },
    { t0: tB, set: Ar, p0: [2.6, 0.55, 4.6], l0: [0, 0.85, -12], p1: [2.3, 0.5, 4.0], l1: [0, 0.85, -12], fov0: 44, act: actB },
    { t0: tC, set: Mc, p0: [cx, 16, cz + 9], l0: [cx, 0, cz], p1: [cx - 1, 14.5, cz + 8], l1: [cx - 1, 0, cz - 0.5], fov0: 40, act: actC },
    { t0: tD, set: Dk, p0: [7.2, 3.8, 7.6], l0: [0, -0.2, -9.5], p1: [6.2, 3.4, 6.6], l1: [0, -0.2, -10], fov0: 46, act: t => actD(t, false) },
    { t0: tD2, set: Dk, p0: [2.2, 0.82, -9.6], l0: [1.4, 0.55, -12.45], p1: [2.1, 0.8, -9.95], l1: [1.4, 0.55, -12.45], fov0: 40, act: t => actD(t, true) },
    { t0: tE, set: Ch, p0: [2.3, 0.82, 2.2], l0: [0, 2.2, -40], p1: [2.1, 0.8, 1.6], l1: [0, 2.2, -40], fov0: 44, act: actE },
    { t0: tF, set: Mf, p0: [fx, 30, fz + 16], l0: [fx, 0, fz], p1: [fx, 27, fz + 14], l1: [fx, 0, fz], fov0: 40, act: actF },
    { t0: tG, set: Cm, p0: [-0.55, 1.12, 2.3], l0: [0.85, 0.95, 0.05], p1: [-0.45, 1.08, 1.8], l1: [0.85, 0.95, 0.1], fov0: 40, act: actG },
    { t0: tH, set: Op, p0: [3.0, 2.4, 3.3], l0: [0, 0.3, 0.1], p1: [2.6, 2.25, 2.9], l1: [0, 0.3, 0.1], fov0: 46, act: actH },
    { t0: tH2, set: Sk, p0: [-14, ALT + 2.0, 9], l0: [-6, ALT, 0], p1: [2, ALT + 2.2, 9], l1: [9, ALT, 0], fov0: 44, ease: 'lin', act: actH2 },
    { t0: tI, set: Bl, p0: [4, 19, 14], l0: [-18, 13, -110], p1: [3.4, 18.4, 12.6], l1: [-18.5, 13, -110], fov0: 42, act: actI },
  ];
  const inst = { scene: Mg, scenes: [Mg, Ar, Mc, Dk, Ch, Mf, Cm, Op, Sk, Bl], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
