import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as M from '../../lib/motion.js';
import { run, wt } from '../shots.js';
import { SASH, earTwitch } from './titulo.js';
const { ss, clamp, HAND } = M;
const fade = U.fade;
const V = () => new THREE.Vector3();

const put = (r, set, x, y, z, yaw) => { if (r.root.parent !== set) set.add(r.root); r.root.position.set(x, y, z); r.root.rotation.y = yaw; r.root.visible = true; return r; };
const wrist = (r, s) => { r.root.updateMatrixWorld(true); return r.j['wri' + s].bone.getWorldPosition(V()); };
const angTo = (a, b, k) => a + ((((b - a) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI) * k;
// A phone held at the ear: follows the wrist, turned along the side of the face.
function holdPhone(r, ph, yaw, off = [0, 0.04, 0.02]) { const w = wrist(r, 'R'); ph.position.set(w.x + off[0], w.y + off[1], w.z + off[2]); ph.rotation.set(0, yaw + Math.PI / 2, 0.25); }
// Anime rivalry spark between two eye lines (screen space).
function spark(ctx, a, b, k, t) {
  if (k <= 0) return ''; const [x1, y1, o1] = ctx.project(a), [x2, y2, o2] = ctx.project(b); if (!o1 || !o2) return '';
  const n = 9, pts = []; for (let i = 0; i <= n; i++) { const u = i / n, j = i === 0 || i === n ? 0 : (Math.sin(t * 40 + i * 2.3) * 22); pts.push(`${x1 + (x2 - x1) * u},${y1 + (y2 - y1) * u + j}`); }
  return `<svg style="position:absolute;left:0;top:0;opacity:${k}" width="1920" height="1080"><polyline points="${pts.join(' ')}" fill="none" stroke="#fff6a8" stroke-width="7" style="filter:drop-shadow(0 0 10px #ffd400) drop-shadow(0 0 22px #ff9a00)"/></svg>`;
}

export function build(ctx) {
  const L = ctx.L;
  const tLla = wt(L[0], 'llamada'), tOnce = wt(L[0], 'once'), tChi = wt(L[1], 'chiste'), tEnt = wt(L[1], 'entre'), tBarr = wt(L[1], 'barras'), tEst = wt(L[1], 'estrellas');
  const tCol = wt(L[2], 'colgaria'), tDes = wt(L[3], 'desde'), tDue = wt(L[3], 'duelo'), tRud = wt(L[3], 'rudolf'), tSir = wt(L[3], 'sirius'), tSal = wt(L[3], 'saltandose');
  const tFon = wt(L[4], 'fondo'), tMis = wt(L[4], 'mismo'), tPero = wt(L[4], 'pero'), tAdm = wt(L[4], 'admitir');
  const tCall = tLla - 0.1, tEnd = tCall + 11;   // the call lasts eleven seconds; Sirius hangs up on "colgaría"
  const tB = L[3].t0 - 0.35;

  // ================================================================ A: the call, split screen — Rudolf in her office, Sirius in the Oval Office
  const D = S.despacho(), OV = S.ovalOffice();
  const rud = K.leader(D, 'rudolf', 0.95, -2.2, 0); K.fitSash(rud, SASH, { emblem: K.eagleKnot() });
  const sir = K.leader(OV, 'sirius', 0, 1.5, 0);
  const rec = D.phone.receiver; D.add(rec); rec.userData.dynamic = true;
  const cell = P.smartphone('#1d2a3a'); cell.userData.dynamic = true; OV.add(cell);
  const camL = new THREE.PerspectiveCamera(36, 0.5 * ctx.W / ctx.H, 0.1, 200), camR = new THREE.PerspectiveCamera(36, 0.5 * ctx.W / ctx.H, 0.1, 200);
  camL.position.set(1.05, 1.3, 0.25); camL.lookAt(0.95, 1.12, -2.2); camR.position.set(0.15, 1.3, 3.95); camR.lookAt(0, 1.12, 1.5);
  const hung = t => t > tEnd;
  // overlays over each half of the split: project with that panel's camera into its half of the frame
  const projWith = (cam, x0, w) => ({ project(v) { cam.updateMatrixWorld(); const p = new THREE.Vector3(...v).project(cam); return [x0 + (p.x + 1) / 2 * w, (1 - p.y) / 2 * ctx.H, p.z < 1]; } });
  const ctxL = projWith(camL, 0, ctx.W / 2);
  const actA = t => {
    put(rud, D, 0.95, 0, -2.2, 0); put(sir, OV, 0, 0, 1.5, 0);
    const drop = ss(tEnd - 0.1, tEnd + 0.5, t);
    const pr = M.mix(A.phone(t, 1), A.stand(t, 1), ss(tEnd + 1.2, tEnd + 1.8, t));
    pr.ears = t < tEnd + 0.3 ? [earTwitch(t, tBarr - 0.1), earTwitch(t, tEst + 0.1)].reduce((a, b) => [a[0] + b[0], a[1] + b[1]]) : [-22 * ss(tEnd + 0.4, tEnd + 0.9, t), -22 * ss(tEnd + 0.4, tEnd + 0.9, t)];
    K.act(rud, pr, t, { talk: t > tEnt - 0.1 && t < tEst + 0.7 ? 0.9 : false, smile: t < tEnd ? 0.8 : 0.1, mouth: t > tEnd + 0.3 ? [0.25, -0.2] : undefined });
    holdPhone(rud, rec, 0, [0, 0.03, 0.02]); rec.scale.setScalar(1.25);
    const ps = M.mix(A.phone(t, 2), A.crossArms(t, 2), 0); const hold = 1 - drop; ps.aWR = hold; if (drop > 0.5) { ps.armR = [-40, 10, 60]; ps.elbR = [0, 80, 0]; }
    K.act(sir, ps, t, { eye: t > tBarr ? 0.45 : 0.1, mouth: t > tBarr ? [0, -0.3] : [0, 0.1], smile: 0 });
    holdPhone(sir, cell, 0, [0, 0.02, 0.02]); OV.tick?.(t);
    const html = U.callBar(t, tCall, tB + 0.2, Math.min(t, tEnd) - tCall, { ended: hung(t) })
      + U.bubble(ctxL, [0.95, 1.58, -2.2], '«Entre nosotras no hay<br>barreras… ¡solo barras<br>y estrellas!» 😄', fade(t, tEnt - 0.15, tEst + 0.9, 0.2), { w: 470, size: 28 })
      + U.bubble(ctxL, [0.95, 1.58, -2.2], '…¿Hola?', fade(t, tEnd + 0.7, tB, 0.2), { size: 34 });
    return U.film(t) + html;
  };

  // ================================================================ B + C: every meeting a duel, face to face across the cabinet table
  const C = S.council('day'); C.remove(C.headChair);
  C.chairs.filter(c => c.position.x < 0 || Math.abs(c.position.x - 0.6) < 0.1).forEach(c => C.remove(c));   // clear the camera side and the middle
  const RZ = -1.75, SZ = 0.55;   // Rudolf on the far side facing +z, Sirius on the near side facing -z
  const r2 = K.leader(C, 'rudolf', 0, RZ, 0); K.fitSash(r2, SASH, { emblem: K.eagleKnot() });
  const s2 = K.leader(C, 'sirius', 0, SZ, Math.PI);
  const EYE_R = [0, 1.3, RZ + 0.1], EYE_S = [0, 1.3, SZ - 0.1], TT = 0.64;
  const lean = (p, k) => { p.waist = [p.waist[0] + 10 * k, p.waist[1], p.waist[2]]; p.chest = [p.chest[0] + 8 * k, p.chest[1], p.chest[2]]; return p; };
  const onTable = (p, z, k) => { p.aL = ['world', 0.24, TT, z]; p.aR = ['world', -0.24, TT, z]; p.aWL = p.aWR = k; p.hL = p.hR = HAND.flat; p.plL = [1, 0, -0.6]; p.plR = [-1, 0, -0.6]; return lean(p, k); };
  const actB = t => {
    put(r2, C, 0, 0, RZ, 0); put(s2, C, 0, 0, SZ, Math.PI);
    const rTalk = t > tRud - 0.2 && t < tSir - 0.3, sTalk = t > tSir - 0.2 && t < tSal + 0.6, palm = ss(tSal + 0.4, tSal + 0.8, t);
    const glare = ss(tB + 0.3, tB + 0.8, t) * (1 - ss(tRud - 0.4, tRud, t));
    let pr = rTalk ? A.talk(t, 1, 0.8) : onTable(A.stand(t, 1), RZ + 0.42, glare);
    if (palm > 0) pr = M.mix(pr, { ...A.stand(t, 1), aR: ['head', 0.05, 0.25, 1.15], plR: [-0.6, -1, 0.2], hR: HAND.flat, head: [18, 0, 0] }, palm);
    K.act(r2, pr, t, { talk: rTalk ? 0.8 : false, smile: rTalk ? 0.6 : 0.15, eye: palm > 0.5 ? 0.9 : glare * 0.35 });
    const ps = sTalk ? A.talk(t, 2, 0.7) : t > tSal + 0.5 ? A.shrug(t, 2, ss(tSal + 0.5, tSal + 0.9, t)) : onTable(A.stand(t, 2), SZ - 0.42, glare);
    K.act(s2, ps, t, { talk: sTalk ? 0.8 : false, smile: t > tSal ? 0.6 : 0.1, eye: glare * 0.4 });
    C.tick?.(t);
    return U.film(t) + spark(ctx, EYE_R, EYE_S, fade(t, tDue - 0.3, tRud - 0.25, 0.2), t)
      + U.versus(t, tRud - 0.3, tFon - 0.2, ['Rudolf', 'Reglas claras para ayudar a todos', 'mx', '#0f6b3f'], ['Sirius', 'Libertad para ayudar a cada quien', 'us', '#2a4a8a'], { ta: tRud - 0.3, tb: tSir - 0.3 });
  };
  // C: same wish, neither will admit it: backs turned, the same thought, a glance, and "¡Hmph!"
  const actC = t => {
    const turn = ss(tFon - 0.4, tFon + 0.3, t), peek = ss(tPero - 0.1, tPero + 0.25, t) * (1 - ss(tAdm - 0.2, tAdm + 0.1, t));
    put(r2, C, 0, 0, RZ, angTo(0, Math.PI, turn)); put(s2, C, 0, 0, SZ, angTo(Math.PI, 0, turn));
    const pr = A.crossArms(t, 1), ps = A.crossArms(t, 2);
    pr.head = [pr.head[0], pr.head[1] + 70 * peek, pr.head[2]]; pr.neck = [0, 22 * peek, 0];
    ps.head = [ps.head[0], ps.head[1] - 70 * peek, ps.head[2]]; ps.neck = [0, -22 * peek, 0];
    K.act(r2, pr, t, { smile: 0.15, mouth: t > tAdm ? [0.3, -0.2] : undefined }); K.act(s2, ps, t, { smile: 0.1, mouth: t > tAdm ? [0.3, -0.2] : undefined });
    C.tick?.(t);
    const th = fade(t, tMis - 0.4, tPero - 0.1, 0.25), hm = fade(t, tAdm - 0.05, ctx.dur + 1, 0.15);
    return U.film(t) + U.bubble(ctx, [0, 1.85, RZ], '🌎😊', th, { size: 52 }) + U.bubble(ctx, [0, 1.85, SZ], '🌎😊', th, { size: 52 })
      + U.bubble(ctx, [0, 1.8, RZ], '¡Hmph!', hm, { size: 32 }) + U.bubble(ctx, [0, 1.8, SZ], '¡Hmph!', hm, { size: 32 });
  };

  const sfx = [
    { t: tCall - 0.6, type: 'beep', vol: 0.4 }, { t: tCall - 0.2, type: 'beep', vol: 0.4 }, { t: tEst + 0.4, type: 'sting2', vol: 0.25 },
    { t: tEnd, type: 'click', vol: 0.6 }, { t: tEnd + 0.15, type: 'beep', vol: 0.3 }, { t: tEnd + 0.45, type: 'beep', vol: 0.3 }, { t: tEnd + 0.75, type: 'beep', vol: 0.3 },
    { t: tB, type: 'whoosh', vol: 0.3 }, { t: tDue - 0.3, type: 'crack', vol: 0.35 }, { t: tSal + 0.5, type: 'thud', vol: 0.25 },
    { t: tFon - 0.4, type: 'swoosh', vol: 0.25 }, { t: tMis - 0.4, type: 'pop', vol: 0.3 }, { t: tAdm, type: 'swoosh', vol: 0.3 },
  ];
  const shots = [
    { t0: 0, set: D, p0: [1.05, 1.3, 0.25], l0: [0.95, 1.12, -2.2], fov0: 36, act: actA },
    { t0: tB, set: C, p0: [-3.6, 1.45, -0.65], l0: [0, 1.15, -0.6], p1: [-3.1, 1.4, -0.6], l1: [0, 1.15, -0.6], fov0: 40, act: actB },
    { t0: tRud - 0.25, set: C, p0: [0.55, 1.5, SZ + 0.85], l0: [0, 1.2, RZ], p1: [0.45, 1.48, SZ + 0.7], l1: [0, 1.2, RZ], fov0: 34, act: actB },
    { t0: tSir - 0.25, set: C, p0: [-0.55, 1.5, RZ - 0.85], l0: [0, 1.2, SZ], p1: [-0.45, 1.48, RZ - 0.7], l1: [0, 1.2, SZ], fov0: 34, act: actB },
    { t0: tSal - 0.2, set: C, p0: [-3.3, 1.5, -0.6], l0: [0, 1.1, -0.6], p1: [-3.0, 1.5, -0.6], l1: [0, 1.1, -0.6], fov0: 40, act: actB },
    { t0: tFon - 0.6, set: C, p0: [-3.5, 1.55, -0.6], l0: [0, 1.15, -0.6], p1: [-3.2, 1.5, -0.6], l1: [0, 1.15, -0.6], fov0: 42, act: actC },
  ];
  const inst = { scene: D, scenes: [D, OV, C], sfx };
  S.bakeAll(inst.scenes);
  inst.views = t => t < tB ? [{ scene: D, camera: camL, x: 0, w: 0.5 }, { scene: OV, camera: camR, x: 0.5, w: 0.5 }] : null;
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
