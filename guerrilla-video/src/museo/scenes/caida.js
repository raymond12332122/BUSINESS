import * as THREE from 'three';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as RP from '../../rusia/props.js';
import { run, wt, walkIn } from '../../whatif/shots.js';
const { ss, clamp } = K;

// Chapter 9, the fall: January 1989, El Cabo arrested on another drug case; in the interrogation room he trades a secret
// for a lighter sentence; the deputy prosecutor (Air Groove) has the prison calls tapped and Perches comes up on the line;
// 45 days of surveillance; June 1989, the raid: the closet, the sports bag, 111 pieces wrapped in toilet paper; Perches
// in handcuffs, seven more arrested.
export function build(ctx) {
  const L = ctx.L;
  const t1 = L[1].t0, t2 = L[2].t0, tLin = wt(L[2], 'linea'), t3 = L[3].t0, t4 = L[4].t0, tClo = wt(L[4], 'closet'), t111 = wt(L[4], '111'), t5 = L[5].t0;
  // ---- January 1989: El Cabo arrested (a grey street, police cars)
  const Rd = S.redada();
  const cabo = K.person(Rd, 'hishi', 'cabo', -1.2, 1.4, 0.3), ag1 = K.person(Rd, 'helios', 'agente', -1.75, 1.2, 0.3), ag2 = K.person(Rd, 'cafe', 'agente', -0.6, 1.1, 0.2);
  // ---- the interrogation room
  const I = S.interrogatorio(), ch = RP.chairR('#3a3a3c', '#2a2a2c', 0.46); ch.position.set(0, 0, -0.85); I.add(ch);
  const cabo2 = K.person(I, 'hishi', 'cabo', 0, -0.85, 0); K.seatOn(cabo2, ch.top + 0.005);
  const q = K.person(I, 'mcqueen', 'agente', 0.8, -1.05, -1.29);
  // ---- the wiretap room: Air Groove (the deputy prosecutor) and a technician on headphones
  const E = S.escucha(), ch2 = RP.chairR('#3a2a1c', '#2a2a2c', 0.46); ch2.position.set(-0.35, 0, 0.35); ch2.rotation.y = Math.PI; E.add(ch2);
  const tec = K.person(E, 'spe', 'tecnico', -0.35, 0.35, Math.PI); K.seatOn(tec, ch2.top + 0.005);
  const fis = K.leader(E, 'groove', 1.35, 0.75, -0.55);
  // ---- 45 days: the watch car across the street (night)
  const Wn = S.redada({ night: true });
  // ---- June 1989: the raid at dawn, then the closet
  const Rd2 = S.redada();
  const team = [[-1.6, 2.4, Math.PI], [-0.9, 2.6, Math.PI], [0.2, 2.5, Math.PI], [0.9, 2.8, Math.PI]].map(([x, z, y], i) => K.person(Rd2, ['helios', 'cafe', 'mcqueen', 'suzuka'][i], 'agente', x, z, y));
  const B = S.recamara({ night: false, year: 1989 }), cl = B.closet; cl.top(1); cl.slide(1); B.bag.visible = false;
  const bag = P.duffel(0.62, 0.15); bag.position.set(1.6, 0.47, 0.25); bag.rotation.y = 0.3; B.add(bag); bag.userData.dynamic = true;
  const bundles = new THREE.Group(); B.add(bundles); bundles.userData.dynamic = true;
  for (let i = 0; i < 9; i++) { const b = P.bundle(i + 2, 0.06, i === 4 ? 0.9 : 0); b.position.set(1.2 + (i % 3) * 0.16, 0.48, 0.45 + Math.floor(i / 3) * 0.16); b.rotation.y = i; bundles.add(b); }
  const a1 = K.person(B, 'helios', 'agente', 0.75, 0.75, 2.0);
  // ---- Perches led out in handcuffs
  const per = K.person(Rd2, 'oguri', 'perchesDia', 0.5, -1.0, 0), e1 = K.person(Rd2, 'mcqueen', 'agente', 0.95, -1.15, 0), e2 = K.person(Rd2, 'suzuka', 'agente', 0.05, -1.2, 0);
  const act = t => {
    Rd.tick(t); E.tick(t); Rd2.tick(t); B.tick(t); Wn.tick(t);
    K.act(cabo, K.cuffs(t, 1), t, { eye: 0.4, mouth: [0, 0] }); K.act(ag1, K.A.stand(t, 2), t, {}); K.act(ag2, K.A.stand(t, 3), t, {});
    K.act(cabo2, K.A.seated(K.A.talk, t, 1, 0.6), t, { talk: t > t1 + 0.3 && t < t2 - 0.4 ? 0.6 : false, eye: 0.3, smile: 0.2 });
    K.act(q, K.A.crossArms(t, 4), t, { eye: 0.3 });
    K.act(tec, K.A.seated(K.A.headset || K.A.stand, t, 1), t, { eye: t > tLin ? 'shock' : 0.3 });
    K.act(fis, K.mix(K.A.crossArms(t, 2), K.A.point(t, 2, 0.6, 0.25), ss(tLin - 0.2, tLin + 0.5, t)), t, { eye: t > tLin ? 'open' : 0.12, mouth: [0, 0.1] });
    team.forEach(r => { r.root.visible = t < t5 - 0.3; });
    team.forEach((r, i) => K.act(r, walkIn(r, t, t4 + 1.4 + i * 0.15, [[-1.6, -0.9, 0.2, 0.9][i], [2.4, 2.6, 2.5, 2.8][i]], Math.PI, 1.6, { seed: i, speed: 0.55, run: 0.4 }), t, {}));
    const pk = ss(t111 - 0.6, t111 + 0.6, t);
    K.act(a1, K.reach(t, 1, [1.4, 0.55, 0.55], ss(tClo + 0.4, tClo + 1.2, t)), t, { eye: t > t111 ? 'shock' : 'open' });
    bundles.children[4].visible = true; bundles.scale.setScalar(0.7 + 0.3 * pk);
    for (const [r, x0, sd] of [[per, 0.5, 1], [e1, 0.95, 2], [e2, 0.05, 3]]) { const p = walkIn(r, t, t5 - 0.6, [x0, -1.0 - (sd > 1 ? 0.15 : 0)], 0, 2.2, { seed: sd, speed: 0.36 }); K.act(r, r === per ? K.mix(p, K.cuffs(t, 1), 0.65) : p, t, r === per ? { eye: 0.4, mouth: [0, 0] } : {}); }
    return U.letterbox(1) + U.chapter(t, 0.2, t1 - 0.4, 9, 'LA CAÍDA') + U.tag(t, 0.6, t1 - 0.3, 'GUADALAJARA', 'ENERO DE 1989', { x: 1300, y: 160 }) +
      U.dossier(t, t1 + 0.4, t2 - 0.2, 'DECLARACIÓN', ['Sabe quién tiene', 'las piezas del museo'], { x: 1250, y: 170, w: 520, rot: 2 }) +
      U.tag(t, t2 + 0.2, tLin - 0.2, 'SUBPROCURADOR', 'JAVIER COELLO TREJO', { x: 96, y: 160 }) + U.wiretap(t, t2 + 0.8, t3 - 0.2) +
      U.dossier(t, tLin - 0.1, t3 - 0.2, 'A-1', ['CARLOS PERCHES TREVIÑO'], { x: 1250, y: 470, w: 560, rot: -2, stampText: 'IDENTIFICADO', stampAt: tLin + 0.5 }) +
      U.counter(t, t3 - 0.1, t4 - 0.2, 'DÍAS DE VIGILANCIA', 1, 45, { x: 1500, y: 330, dur: 2.2, pad: 2 }) +
      U.tag(t, t4 + 0.2, tClo - 0.3, 'CIUDAD SATÉLITE', 'JUNIO DE 1989', { x: 1300, y: 160 }) +
      U.counter(t, t111 - 0.3, t5 - 0.2, 'PIEZAS RECUPERADAS', 0, 111, { x: 1500, y: 330, dur: 1.6 }) +
      U.stamp(t, t5 + 0.6, ctx.dur + 1, 'DETENIDO', { x: 1380, y: 330, size: 100, rot: -6 }) + U.stamp(t, wt(L[5], 'siete'), ctx.dur + 1, '+7', { x: 1560, y: 520, size: 90, rot: 4 });
  };
  const sfx = [
    { t: 0, type: 'sirens', dur: t1 - 0.3, vol: 0.3 }, { t: 1.2, type: 'cuffs', vol: 0.5 }, { t: t1 - 0.2, type: 'door', vol: 0.4 }, { t: t1, type: 'hum', dur: t2 - t1, vol: 0.25 },
    { t: t1 + 0.4, type: 'typewriter', dur: 2, vol: 0.25 }, { t: t2, type: 'reel', dur: t3 - t2, vol: 0.35 }, { t: t2 + 0.8, type: 'beep', vol: 0.3 }, { t: tLin, type: 'sting', vol: 0.4 }, { t: tLin + 0.5, type: 'stamp', vol: 0.6 },
    { t: t3 - 0.1, type: 'night', dur: t4 - t3, vol: 0.3 }, { t: t3, type: 'clock', dur: t4 - t3, vol: 0.3 },
    { t: t4, type: 'sirens', dur: tClo - t4, vol: 0.35 }, { t: t4 + 1.2, type: 'brakes', vol: 0.4 }, { t: t4 + 1.6, type: 'steps', dur: 2, vol: 0.35 }, { t: tClo - 0.4, type: 'knock', vol: 0.5 },
    { t: tClo + 0.4, type: 'zipper', vol: 0.5 }, { t: t111 - 0.5, type: 'paper', vol: 0.4 }, { t: t111, type: 'swell', vol: 0.3 }, { t: t5, type: 'cuffs', vol: 0.55 }, { t: t5 + 0.6, type: 'stamp', vol: 0.7 }, { t: wt(L[5], 'siete'), type: 'stamp', vol: 0.5 },
  ];
  const shots = [
    { t0: 0, set: Rd, p0: [1.6, 1.15, 4.6], l0: [-1.2, 0.75, 1.2], p1: [1.1, 1.1, 4.0], l1: [-1.2, 0.75, 1.2], fov0: 48, act },
    { t0: t1 - 0.2, set: I, p0: [0.0, 1.15, 1.6], l0: [0, 0.7, -0.85], p1: [0.0, 1.05, 1.1], l1: [0, 0.72, -0.85], fov0: 46, act },
    { t0: t2 - 0.2, set: E, p0: [1.6, 1.5, 2.4], l0: [0.2, 0.95, -0.6], p1: [1.3, 1.45, 2.0], l1: [0.2, 0.95, -0.7], fov0: 50, act },
    { t0: tLin - 0.2, set: E, p0: [0.3, 1.35, 1.2], l0: [0, 1.6, -2.9], p1: [0.2, 1.4, 0.8], l1: [0, 1.65, -2.9], fov0: 46, act },
    { t0: t3 - 0.15, set: Wn, p0: [-8.5, 1.1, 8.5], l0: [-1.0, 1.4, -4.5], p1: [-8.2, 1.1, 8.1], l1: [-1.0, 1.4, -4.5], fov0: 42, act },
    { t0: t4 - 0.2, set: Rd2, p0: [3.5, 1.4, 7.0], l0: [-0.5, 1.0, -2.0], p1: [2.6, 1.3, 5.8], l1: [-0.5, 1.0, -2.6], fov0: 50, act },
    { t0: tClo - 0.3, set: B, p0: [2.5, 1.3, 2.0], l0: [1.35, 0.5, 0.45], p1: [2.3, 1.2, 1.7], l1: [1.35, 0.5, 0.5], fov0: 48, act },
    { t0: t5 - 0.2, set: Rd2, p0: [0.6, 1.0, 3.8], l0: [0.5, 0.75, -0.2], p1: [0.6, 0.98, 3.4], l1: [0.5, 0.75, 0.2], fov0: 48, act },
  ];
  const inst = { scene: Rd, scenes: [Rd, I, E, Wn, Rd2, B], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
