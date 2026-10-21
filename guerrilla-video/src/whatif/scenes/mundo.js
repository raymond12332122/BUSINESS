import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as M from '../../lib/motion.js';
import * as WM from '../worldmap.js';
import { run, wt, walkIn } from '../shots.js';
const { ss, clamp, HAND } = M;
const fade = U.fade;
const V = () => new THREE.Vector3();
export const preload = WM.preload;

const wrist = (r, s) => { r.root.updateMatrixWorld(true); return r.j['wri' + s].bone.getWorldPosition(V()); };
const W = p => ['world', ...p];
const emoji = (ctx, pos, ch, k, size = 80) => { if (k <= 0) return ''; const [x, y, ok] = ctx.project(pos); if (!ok) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%) scale(${0.6 + 0.4 * k});opacity:${k};font:${size}px 'Noto Color Emoji'">${ch}</div>`; };
// Small café table with cakes on it (France).
function cafeTable() {
  const g = new THREE.Group(), top = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.03, 24), P.std('#f2efe6', { roughness: 0.4 })); top.position.y = 0.6; g.add(top);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.6, 10), P.std('#2a2a2e', { metalness: 0.5 })); leg.position.y = 0.3; g.add(leg);
  [['#f6c6d6', -0.14, 0.05], ['#f2e2b8', 0.14, -0.06], ['#8a4a2a', 0.0, 0.17]].forEach(([c, x, z]) => { const k = P.cake(c, 0.55); k.position.set(x, 0.615, z); g.add(k); });
  g.top = 0.615; return g;
}
// Olympic-style podium: [1st, 2nd, 3rd] block heights.
function podium() {
  const g = new THREE.Group(); [[0, 0.6, '#d4af37', '1'], [-1.0, 0.42, '#c0c4c8', '2'], [1.0, 0.28, '#b8733a', '3']].forEach(([x, h, c, n]) => {
    const tex = K.canvasTex(128, 128, (cx, w) => { cx.fillStyle = '#f4f2ec'; cx.fillRect(0, 0, w, w); cx.fillStyle = c; cx.font = '900 96px Inter'; cx.textAlign = 'center'; cx.fillText(n, 64, 100); });
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.95, h, 0.8), [P.std('#e8e4da'), P.std('#e8e4da'), P.std(c, { metalness: 0.4, roughness: 0.4 }), P.std('#e8e4da'), new THREE.MeshStandardMaterial({ map: tex }), P.std('#e8e4da')]);
    b.position.set(x, h / 2, 0); b.castShadow = b.receiveShadow = true; g.add(b); });
  g.h = [0.6, 0.42, 0.28]; return g;
}

export function build(ctx) {
  const L = ctx.L;
  const tCa = L[1].t0 - 0.3, tMama = wt(L[1], 'mama'), tCob = wt(L[1], 'cobijas'), tJar = wt(L[1], 'jarabe'), tPaz = wt(L[1], 'paces');
  const tJp = L[2].t0 - 0.3, tDul = wt(L[2], 'dulzura'), tNad = wt(L[2], 'nadie', 1), tEno = wt(L[2], 'enojada');
  const tDe = L[3].t0 - 0.3, tPun = wt(L[3], 'puntualidad'), tTaw = wt(L[3], 'tahuake'), tTar = wt(L[3], 'tarde');
  const tFr = L[4].t0 - 0.3, tPas = wt(L[4], 'pastelerias'), tDie = wt(L[4], 'dieta');
  const tIt = L[5].t0 - 0.3, tBel = wt(L[5], 'bella'), tSm = wt(L[5], 'san') - 0.3, tSeg = wt(L[5], 'segundo');
  const tAu = L[6].t0 - 0.3, tGue = wt(L[6], 'guerra'), tEmu = wt(L[6], 'emues');
  const tKr = L[7].t0 - 0.3, tDes = wt(L[7], 'desmayaria'), tUma = wt(L[7], 'umamusume');

  // ================================================================ intro: pins pop up around the world
  const Mp = WM.worldMap();
  const PINS = [['ca', -100, 58], ['jp', 138, 37], ['de', 10.5, 51], ['fr', 2.3, 46.6], ['it', 12.5, 42.8], ['sm', 12.45, 43.95], ['au', 134, -25], ['kr', 127.8, 36.3]].map(([c, lo, la]) => WM.pin(Mp, lo, la, c, { h: 4.6, w: 3.2 }));
  const actMap = t => { PINS.forEach((p, i) => p.set(ss(0.6 + i * 0.35, 1.0 + i * 0.35, t)));
    return U.film(t) + U.bigTitle(t, 0.5, tCa - 0.2, 'MIENTRAS TANTO…', 'El resto del mundo', 'también tendría líderes… peculiares', { top: 70 }); };

  // ================================================================ Canada: Super Creek mothers everybody
  const CA = S.country('ca'), creek = K.leader(CA, 'creek', 0, 0, 0);
  const syrup = P.syrupBottle(); syrup.userData.dynamic = true; CA.add(syrup);
  const box = CA.boxes[0]; box.updateMatrixWorld(true); const BOX = V().setFromMatrixPosition(box.matrixWorld);
  const actCA = t => {
    const pat = ss(tCob - 0.3, tCob + 0.1, t) * (1 - ss(tJar - 0.4, tJar - 0.1, t)), hold = ss(tJar - 0.2, tJar + 0.25, t);
    let p = A.handOnHeart(t, 1, ss(tMama - 0.3, tMama + 0.2, t) * (1 - ss(tCob - 0.5, tCob - 0.2, t)));
    if (pat > 0) { p.aR = W([BOX.x + 0.1, 0.5, BOX.z]); p.aWR = pat; p.hR = HAND.flat; p.waist = [p.waist[0] + 18 * pat, 0, 0]; p.look = [BOX.x, 0.4, BOX.z]; p.lookW = 0.7 * pat; }
    if (hold > 0) { p.aR = ['head', -0.9, 0.4, 1.6]; p.aWR = hold; p.hR = HAND.grip; p.plR = [-1, -0.6, 0]; }
    if (t > tPaz - 0.2) p = M.mix(p, A.fangirl(t, 1), ss(tPaz - 0.2, tPaz + 0.2, t));
    K.act(creek, p, t, { smile: 0.9, eye: 0.15 });
    const w = wrist(creek, 'R'); syrup.visible = hold > 0.5; syrup.position.set(w.x, w.y - 0.05, w.z + 0.02); syrup.scale.setScalar(1.6);
    CA.tick?.(t);
    return U.film(t) + U.leader(t, tCa + 0.15, tJp + 0.1, 'creek', { side: 'r' }) + emoji(ctx, [-0.45, 1.65, 0], '💕', fade(t, tPaz - 0.1, tJp + 0.1, 0.2), 72);
  };

  // ================================================================ Japan: Grass Wonder's sweet smile (and what lies behind it)
  const JP = S.country('jp'), grass = K.leader(JP, 'grass', 0, 0, 0);
  const actJP = t => {
    const bowK = ss(tJp + 0.8, tJp + 1.3, t) * (1 - ss(tJp + 2.2, tJp + 2.8, t)), menace = ss(tNad - 0.1, tNad + 0.4, t);
    const p = M.mix(A.bow(t, 1, bowK), A.handOnHeart(t, 1, 0.6), ss(tJp + 2.4, tJp + 3.0, t));
    K.act(grass, p, t, { smile: 0.9, eye: Math.max(0.25, 0.75 * menace) });
    JP.tick?.(t);
    return U.film(t) + U.leader(t, tJp + 0.15, tNad - 0.2, 'grass', { side: 'l' }) + U.menace(t, tNad - 0.1, tDe + 0.1);
  };

  // ================================================================ Germany: Air Groove and the late-comer
  const DE = S.country('de'), groove = K.leader(DE, 'groove', 0, 0, 0);
  const lateDe = K.person(DE, 'daiwa', 'civilCap', -6, 1.6, Math.PI / 2, { shadow: false });
  const actDE = t => {
    DE.clock?.set?.(8, 0, 0);
    const shout = ss(tTaw - 0.25, tTaw + 0.05, t);
    const p = t < tTaw - 0.3 ? A.handsOnHips(t, 1) : M.mix(A.handsOnHips(t, 1), A.point(t, 1, -55, 5, 'R'), shout);
    K.act(groove, p, t, { mouth: shout > 0.5 && t < tTaw + 1.0 ? [0.9, 0] : undefined, smile: 0.05, eye: 0.3 });
    const rp = walkIn(lateDe, t, tPun, [-6, 1.6], Math.PI / 2, 4.6, { speed: 1.6, run: 1, seed: 4, after: tt => A.bow(tt, 4, 0.8) });
    K.act(lateDe, rp, t, { eye: t > tTaw ? 'shock' : undefined, mouth: t > tTaw ? 'wavy' : 'open' });
    DE.tick?.(t);
    return U.film(t) + U.leader(t, tDe + 0.15, tTaw - 0.4, 'groove', { side: 'r' }) + U.bubble(ctx, [0, 1.75, 0], '¡TAWAKE!', fade(t, tTaw - 0.05, tFr + 0.1, 0.12), { size: 64, col: '#fff2ee', ink: '#b3121a' });
  };

  // ================================================================ France: Mejiro McQueen, the pâtisseries and the diet
  const FR = S.country('fr'), mcq = K.leader(FR, 'mcqueenB', 0, 0, 0);
  const tbl = cafeTable(); tbl.position.set(0.62, 0, 0.42); FR.add(tbl);
  const CAKE = [0.62, tbl.top + 0.1, 0.42];
  const actFR = t => {
    const reach = ss(tPas - 0.2, tPas + 0.6, t) * (1 - ss(tDie - 0.45, tDie - 0.1, t)), back = ss(tDie - 0.4, tDie, t);
    let p = A.handOnHeart(t, 1, 0.4);
    if (reach > 0) { p.aL = W([CAKE[0] - 0.08, CAKE[1] + 0.06, CAKE[2] - 0.05]); p.aWL = reach; p.hL = HAND.open; p.look = CAKE; p.lookW = 0.8 * reach; p.waist = [p.waist[0] + 8 * reach, 0, 0]; }
    if (back > 0) p = M.mix(p, A.shrug(t, 1, 0.4), back);
    K.act(mcq, p, t, { smile: back > 0.5 ? -0.1 : 0.6, eye: back > 0.5 ? 0.55 : 0.1 });
    FR.tick?.(t);
    return U.film(t) + U.leader(t, tFr + 0.15, tDie - 0.3, 'mcqueenB', { side: 'l' }) + U.bubble(ctx, [0, 1.72, 0], '¡No…! Estoy a dieta… 😣', fade(t, tDie - 0.1, tIt + 0.1, 0.15), { size: 30 });
  };

  // ================================================================ Italy: T.M. Opera O, the most beautiful leader in the world
  const IT = S.country('it'), opera = K.leader(IT, 'opera', 0, 0, 0);
  const actIT = t => {
    const p = A.point(t, 1, 25, 55, 'R'); p.armL = [-30, -40, -20]; p.elbL = [0, -15, 0]; p.hL = HAND.open; p.head = [-12, 10, 6];
    K.act(opera, p, t, { mouth: t > tBel - 0.6 && t < tBel + 0.8 ? [0.7, 0.8] : undefined, smile: 0.9 });
    IT.tick?.(t);
    return U.film(t) + U.leader(t, tIt + 0.15, tSm, 'opera', { side: 'r' }) + emoji(ctx, [-0.5, 1.9, 0.2], '✨', fade(t, tBel - 0.3, tSm, 0.2), 70) + emoji(ctx, [0.6, 1.5, 0.2], '🌹', fade(t, tBel, tSm, 0.2), 60);
  };

  // ================================================================ San Marino: Meisho Doto, second again (Italy on top, of course)
  const SM = S.country('sm'), pod = podium(); pod.position.set(0, 0, 0.2); SM.add(pod);
  const doto = K.leader(SM, 'dotoB', -1.0, 0, 0.2), op2 = K.leader(SM, 'opera', 0, 0, 0.2);
  const actSM = t => {
    doto.root.position.set(-1.0, pod.h[1], 0.2); op2.root.position.set(0, pod.h[0], 0.2);
    const sob = ss(tSeg - 0.2, tSeg + 0.3, t);
    const pd = M.mix(A.stand(t, 3), { ...A.stand(t, 3), aL: ['head', 0.4, 0.1, 1.15], aR: ['head', -0.4, 0.1, 1.15], plL: [1, -1, 0], plR: [-1, -1, 0], hL: HAND.soft, hR: HAND.soft, head: [14, 0, 0] }, sob);
    K.act(doto, pd, t, { eye: 0.55 + 0.4 * sob, mouth: [0.25 * sob, -0.5 * sob] });
    K.act(op2, A.cheer(t, 4), t, { mouth: [0.6, 0.9] });
    SM.tick?.(t);
    return U.film(t) + U.leader(t, tSm + 0.15, tAu + 0.1, 'dotoB', { side: 'l' }) + emoji(ctx, [-1.0, pod.h[1] + 1.65, 0.2], '😭', fade(t, tSeg - 0.1, tAu + 0.1, 0.2), 70);
  };

  // ================================================================ Australia: Gold Ship declares war on the emus
  const AU = S.country('au'), golshi = K.leader(AU, 'golshi', 0, 0, 0);
  const actAU = t => {
    const decl = ss(tGue - 0.3, tGue, t), charge = t > tEmu + 0.1;
    let p = decl > 0 ? M.mix(A.cheer(t, 1), A.point(t, 1, -35, 20, 'R'), decl) : A.cheer(t, 1);
    if (charge) p = walkIn(golshi, t, tEmu + 0.1, [0, 0], Math.atan2(4.5, -3.5), 6, { speed: 1.0, run: 1, seed: 1, after: tt => A.point(tt, 1, 0, 10, 'R') });
    else { golshi.root.position.set(0, 0, 0); golshi.root.rotation.y = 0; }
    K.act(golshi, p, t, { mouth: [0.8, 0.7], eye: 0.1 });
    AU.emus.forEach((e, i) => { const a = (t - tAu) * (0.9 + i * 0.1) + i * 1.6, R = 3.2 + i * 0.6, cx = 4.5, cz = -3.5;
      e.position.set(cx + Math.cos(a) * R, 0, cz + Math.sin(a) * R * 0.6); e.rotation.y = Math.atan2(-Math.sin(a) * R, Math.cos(a) * R * 0.6); e.pose(t + i, 1); });
    AU.tick?.(t);
    return U.film(t) + U.leader(t, tAu + 0.15, tGue - 0.3, 'golshi', { side: 'r' }) + U.bubble(ctx, [0, 1.8, 0], '¡GUERRA A LOS EMÚES! ⚔️', fade(t, tGue - 0.1, tKr + 0.1, 0.12), { size: 40 });
  };

  // ================================================================ South Korea: Agnes Digital faints from sheer joy
  const KR = S.country('kr'), agnes = K.leader(KR, 'digital', 0, 0, 0);
  KR.screen.material.map = K.canvasTex(1024, 576, (x, Wd, H) => { const g = x.createLinearGradient(0, 0, Wd, H); g.addColorStop(0, '#ff4fa0'); g.addColorStop(1, '#5a3aff'); x.fillStyle = g; x.fillRect(0, 0, Wd, H);
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = '900 96px Inter'; x.fillText('¡UMAMUSUME', Wd / 2, H / 2 - 20); x.fillText('AL PODER!', Wd / 2, H / 2 + 90); });
  KR.screen.material.color.set('#ffffff'); KR.screen.material.needsUpdate = true;
  const actKR = t => {
    const faint = ss(tDes, tDes + 0.6, t);
    agnes.root.position.set(0, 0, 0); agnes.root.rotation.set(-1.45 * faint * faint, 0, 0.15 * faint);
    const p = M.mix(A.fangirl(t, 1), { ...A.stand(t, 1, { amt: 0.1 }), armL: [-10, 0, -40], armR: [-10, 0, 40], elbL: [0, -10, 0], elbR: [0, 10, 0], head: [-10, 0, 10] }, faint);
    K.act(agnes, p, t, { eye: faint > 0.5 ? 1 : 0.1, mouth: faint > 0.5 ? [0.4, 0.9] : [0.6, 1.0] });
    KR.tick?.(t);
    const hearts = fade(t, tDes + 0.3, ctx.dur + 1, 0.2);
    return U.film(t) + U.leader(t, tKr + 0.15, tDes - 0.2, 'digital', { side: 'l' }) + U.bubble(ctx, [0, 1.75, 0], '¡Guehehe…! ¡Tantas umamusume…! 💕', fade(t, tKr + 1.6, tDes + 0.1, 0.2), { size: 28 })
      + emoji(ctx, [0.3, 0.7 + 0.15 * Math.sin(t * 3), -1.0], '💕', hearts, 60) + emoji(ctx, [-0.4, 0.9 + 0.15 * Math.sin(t * 3 + 1), -1.2], '💖', hearts, 50);
  };

  const sfx = [
    { t: 0.3, type: 'whoosh', vol: 0.3 }, ...PINS.map((p, i) => ({ t: 0.7 + i * 0.35, type: 'pop', vol: 0.25 })),
    { t: tCa, type: 'wind', dur: tJp - tCa, vol: 0.2 }, { t: tPaz, type: 'sting', vol: 0.2 },
    { t: tJp, type: 'birds', dur: tNad - tJp, vol: 0.25 }, { t: tNad - 0.1, type: 'drone', dur: tDe - tNad, vol: 0.35 },
    { t: tDe, type: 'clock', dur: tTaw - tDe, vol: 0.2 }, { t: tPun, type: 'steps', dur: 2.6, vol: 0.35 }, { t: tTaw, type: 'shout', vol: 0.5 },
    { t: tDie - 0.1, type: 'sting2', vol: 0.25 },
    { t: tIt, type: 'fanfare', vol: 0.3 }, { t: tSeg, type: 'sting', vol: 0.25 },
    { t: tAu, type: 'insects', dur: tKr - tAu, vol: 0.25 }, { t: tGue, type: 'horn', vol: 0.4 },
    { t: tKr, type: 'crowd', dur: ctx.dur - tKr, vol: 0.25 }, { t: tDes + 0.4, type: 'thud', vol: 0.4 },
  ];
  const shots = [
    { t0: 0, set: Mp, p0: [-20, 72, 40], l0: [20, 0, -20], p1: [-6, 62, 30], l1: [28, 0, -22], fov0: 50, act: actMap },
    { t0: tCa, set: CA, p0: [1.9, 1.35, 3.0], l0: [-0.3, 1.0, -0.2], p1: [1.5, 1.3, 2.6], l1: [-0.4, 0.95, -0.1], fov0: 40, act: actCA },
    { t0: tJp, set: JP, p0: [-1.6, 1.35, 3.2], l0: [0, 1.1, -0.5], p1: [-1.2, 1.3, 2.7], l1: [0, 1.1, -0.4], fov0: 40, act: actJP },
    { t0: tNad - 0.15, set: JP, p0: [0.2, 1.4, 1.6], l0: [0, 1.3, 0], p1: [0.15, 1.38, 1.25], l1: [0, 1.3, 0], fov0: 34, act: actJP },
    { t0: tDe, set: DE, p0: [2.2, 1.3, 3.4], l0: [-1.0, 1.0, -0.3], p1: [1.6, 1.3, 3.2], l1: [-1.4, 0.95, 0.2], fov0: 44, act: actDE },
    { t0: tFr, set: FR, p0: [1.9, 1.25, 2.4], l0: [0.2, 0.95, 0], p1: [1.6, 1.2, 2.1], l1: [0.25, 0.95, 0.05], fov0: 40, act: actFR },
    { t0: tIt, set: IT, p0: [-1.2, 0.7, 3.0], l0: [0, 1.35, -0.5], p1: [-0.9, 0.75, 2.6], l1: [0, 1.4, -0.5], fov0: 44, act: actIT },
    { t0: tSm, set: SM, p0: [-0.6, 1.5, 4.4], l0: [-0.4, 1.1, 0], p1: [-0.8, 1.45, 3.8], l1: [-0.5, 1.15, 0], fov0: 44, act: actSM },
    { t0: tAu, set: AU, p0: [-2.4, 1.4, 4.2], l0: [1.6, 0.9, -1.5], p1: [-2.0, 1.4, 3.8], l1: [2.2, 0.9, -2.0], fov0: 46, act: actAU },
    { t0: tKr, set: KR, p0: [1.6, 1.3, 3.0], l0: [0, 1.05, -0.3], p1: [1.4, 1.1, 2.6], l1: [0, 0.6, -0.5], fov0: 42, act: actKR },
  ];
  const inst = { scene: Mp, scenes: [Mp, CA, JP, DE, FR, IT, SM, AU, KR], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
