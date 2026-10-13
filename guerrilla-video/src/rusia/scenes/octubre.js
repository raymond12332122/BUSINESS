import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import { runShots, wt } from '../../mx/shots.js';
import * as MX from '../../mx/props.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as A from '../anim.js';
import { leader, NAMES } from '../leaders.js';

export async function preload() {}
const fade = (t, a, b, f = 0.35) => ss(a, a + f, t) * (1 - ss(b - f, b, t));
const sepia = k => k > 0 ? `<div style="position:absolute;inset:0;background:#704214;mix-blend-mode:color;opacity:${0.85 * k}"></div><div style="position:absolute;inset:0;background:rgba(40,28,14,${0.18 * k})"></div>
  <div style="position:absolute;left:0;right:0;top:0;height:58px;background:#0b0b0b;opacity:${k}">${[...Array(14)].map((_, i) => `<div style="position:absolute;top:16px;left:${30 + i * 140}px;width:44px;height:26px;border-radius:5px;background:#e8e2d0"></div>`).join('')}</div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:58px;background:#0b0b0b;opacity:${k}">${[...Array(14)].map((_, i) => `<div style="position:absolute;top:16px;left:${30 + i * 140}px;width:44px;height:26px;border-radius:5px;background:#e8e2d0"></div>`).join('')}</div>` : '';

export function build(ctx) {
  const L = ctx.L;
  const tNoche = wt(L[0], 'noche'), tGuard = wt(L[0], 'guardias'), tTro = wt(L[0], 'trotski'), tOcup = wt(L[0], 'ocuparon'), tPuen = wt(L[0], 'puentes'), tEst = wt(L[0], 'estaciones'), tTel = wt(L[0], 'telegrafo'), tCasi = wt(L[0], 'casi');
  const tAur = wt(L[1], 'aurora'), tDisp = wt(L[1], 'disparo'), tFog = wt(L[1], 'fogueo'), tMad = wt(L[1], 'madrugada'), tCayo = wt(L[1], 'cayo'), tComb = wt(L[1], 'combate'), tGran = wt(L[1], 'gran'), tPel = wt(L[1], 'peliculas'), tRecr = wt(L[1], 'recreacion');
  const tLen = wt(L[2], 'lenin'), tPaz = wt(L[2], 'paz'), tTierra = wt(L[2], 'tierra'), tViejo = wt(L[2], 'viejo'), tOct = wt(L[2], 'octubre'), tSiete = wt(L[2], 'siete');

  // ---- 1. Smolny at night
  const Sm = S.smolny();
  const reds = K.crowd(Sm, ['guardiaRoja', 'marinero', 'soldadoRevolucion', 'guardiaRoja'], 22, [-6, -12, 6, -5], { seed: 91 });
  reds.forEach((r, i) => { r.root.rotation.y = i % 2 ? Math.PI * 0.85 : -0.4; });
  // ---- 2. Trotsky at the map (Military Revolutionary Committee)
  const Mr = S.stavka({ wall: '#e3dccb', lower: '#a89a7c', icon: false });
  const tro = leader(Mr, 'trotski', 0, -1.85, 0);
  const aides = [K.person(Mr, 'doto', 'guardiaRoja', -1.05, -1.6, Math.PI / 2 - 0.3), K.person(Mr, 'daiwa', 'marinero', 1.05, -1.7, -Math.PI / 2 + 0.3)];
  // ---- 3. A bridge taken by Red Guards
  const Br = S.nevaNight({ aurora: false });
  const post = K.crowd(Br, ['guardiaRoja', 'marinero', 'guardiaRoja'], 9, [-29, -11, -23, -5], { seed: 92 }); post.forEach(p => p.root.position.y = 0.6);
  // ---- 4. The Aurora's bow gun
  const Dk = S.auroraDeck();
  const crew = [K.person(Dk, 'doto', 'marinero', -1.1, 4.6, 0.4), K.person(Dk, 'oguri', 'marinero', 1.2, 4.4, -0.4), K.person(Dk, 'tamamo', 'marinero', 0.4, 2.8, 0.1)];
  const gunSmoke = MX.smokeTrail(Dk, 12, { color: '#b8bcc4', size: 0.55, rise: 1.6, drift: [-0.6, 0, 4.5], life: 2.4, opacity: 0.55 });
  // ---- 5. The Winter Palace falls, almost without a fight
  const Ps = S.palaceSquare('snowNight', { barricade: true });
  const enter = K.crowd(Ps, ['guardiaRoja', 'marinero', 'soldadoRevolucion', 'guardiaRoja'], 14, [-4.5, -19, 4.5, -14], { seed: 93, yaw: Math.PI });
  enter.forEach(e => e.z0 = e.root.position.z);
  const cadets = [-2.4, -1.2, 1.2, 2.4].map((x, i) => K.person(Ps, ['helios', 'mcqueen', 'suzuka', 'cafe'][i], 'cadete', x, -23.6, 0));
  // ---- 6. The movie version (sepia)
  const Pm = S.palaceSquare('snowNight', { barricade: true });
  const storm = K.crowd(Pm, ['guardiaRoja', 'marinero', 'soldadoRevolucion', 'obrero'], 34, [-9, -10, 9, 2], { seed: 94, yaw: Math.PI });
  storm.forEach(e => e.z0 = e.root.position.z);
  // ---- 7. The Congress of Soviets: Lenin's decrees
  const Hs = S.hall('smolny');
  const lenin = leader(Hs, 'leninBare', 0, -7.05, 0); lenin.root.position.y = 0.36;
  const delegates = []; for (let r = 0; r < 6; r++) for (let i = 0; i < 6; i++) for (const sd of [-1, 1]) { if ((r * 5 + i * 7 + (sd > 0)) % 4 === 0) continue; const [x, y, z] = Hs.seatsAt(r, i, sd);
    const d = K.person(Hs, ['doto', 'oguri', 'helios', 'suzuka', 'mcqueen', 'daiwa', 'cafe', 'tamamo'][(r * 6 + i + (sd > 0 ? 3 : 0)) % 8], ['obrero', 'soldadoRevolucion', 'marinero', 'obrera', 'campesino'][(r + i * 2) % 5], x, z, Math.PI); d.root.position.y = y; delegates.push(d); }
  // ---- 8. Old calendar vs new
  const Sq = S.smolny();

  const tB = tTro - 0.45, tC = tOcup - 0.3, tD = L[1].t0 - 0.3, tE = tMad - 0.3, tF = tGran - 0.3, tG = L[2].t0 - 0.3, tH = tViejo - 0.4;
  const tFire = tDisp + 0.25;
  const sfx = [{ t: 0.0, type: 'night', dur: tD, vol: 0.3 }, { t: 0.3, type: 'crowd', dur: tB, vol: 0.3 }, { t: tB, type: 'clock', dur: tC - tB, vol: 0.25 },
    { t: tPuen, type: 'tick', vol: 0.4 }, { t: tEst, type: 'tick', vol: 0.4 }, { t: tTel, type: 'tick', vol: 0.4 },
    { t: tD, type: 'waves', dur: tE - tD, vol: 0.35 }, { t: tFire, type: 'cannon', vol: 0.85 }, { t: tE, type: 'wind', dur: tF - tE, vol: 0.3 }, { t: tCayo, type: 'creak', vol: 0.4 },
    { t: tF, type: 'charge', vol: 0.35 }, { t: tF + 0.2, type: 'gunfire', dur: tG - tF - 0.4, vol: 0.25 }, { t: tRecr - 0.1, type: 'stamp', vol: 0.5 },
    { t: tG, type: 'crowd', dur: tH - tG, vol: 0.35 }, { t: tPaz - 0.1, type: 'paper', vol: 0.4 }, { t: tTierra - 0.1, type: 'paper', vol: 0.4 }, { t: tH + 0.4, type: 'paper', vol: 0.35 }, { t: tSiete - 0.1, type: 'hit', vol: 0.45 }];

  const shots = [
    { t0: 0, set: Sm, p0: [4.2, 1.6, 1.0], l0: [0, 3.0, -24], p1: [3.4, 1.5, -1.0], l1: [0, 3.0, -24], fov0: 46, act: (t) => {
      Sm.tick(t);
      reds.forEach((r, i) => { K.pose(r, i % 3 ? { ...A.guard(t, i), gun: 'port' } : A.talk(t, i)); r.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.badge(t, 'Petrogrado · noche del 25 de octubre de 1917', 'El Smolny', 'Cuartel general de los bolcheviques', tNoche - 0.2, tB);
    } },
    { t0: tB, set: Mr, p0: [0.95, 1.05, 1.3], l0: [0, 0.5, -1.4], p1: [0.7, 1.0, 0.9], l1: [0, 0.52, -1.4], fov0: 44, act: (t) => {
      K.pose(tro, A.pointDown(t, 1)); tro.setFace(C.blinkEye(t, 1), C.talkMouth(t, 1));
      aides.forEach((a, i) => { K.pose(a, { ...A.guard(t, i), gun: 'port' }); a.setFace(C.blinkEye(t, i + 2), 'neutral'); });
      return U.film(t) + U.nameplate(ctx, [0, 1.15, -1.85], NAMES.trotski[0], 'Comité Militar Revolucionario', tTro - 0.1, tC);
    } },
    { t0: tC, set: Br, p0: [-23.0, 1.6, -0.6], l0: [-26.4, 1.0, -9], p1: [-23.4, 1.55, -1.6], l1: [-26.4, 1.0, -9], fov0: 44, act: (t) => {
      Br.tick(t);
      post.forEach((p, i) => { K.pose(p, { ...A.guard(t, i), gun: i % 2 ? 'port' : 'low' }); p.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.checklist(t, tPuen - 0.35, tD, 'Ocupan Petrogrado', [['Puentes', tPuen], ['Estaciones', tEst], ['Telégrafo', tTel]], { x: 1150, y: 170, w: 600 })
        + U.big(t, tCasi - 0.1, tD, 'Casi sin resistencia', { top: 640, size: 60 });
    } },
    { t0: tD, set: Dk, p0: [6.0, 2.5, 3.6], l0: [0, 1.2, 6.6], p1: [5.4, 2.4, 3.2], l1: [0, 1.2, 6.8], fov0: 46, shake: t => 0.05 * Math.max(0, 1 - Math.abs(t - tFire) / 0.3), act: (t) => {
      Dk.tick(t);
      crew.forEach((c, i) => { K.pose(c, t > tFire - 0.1 && t < tFire + 0.6 ? A.cold(t, i) : C.idle(t, i, 0.5)); c.setFace(C.blinkEye(t, i), t > tFire && t < tFire + 0.8 ? 'squint' : 'neutral'); });
      const kf = Math.max(0, 1 - Math.abs(t - tFire - 0.04) / 0.1); Dk.flash.intensity = 25 * kf;
      gunSmoke(t - tFire, new THREE.Vector3(0, 1.5, 9.2), t > tFire ? 1 : 0);
      return U.film(t) + `<div style="position:absolute;inset:0;background:#fff3c8;opacity:${0.22 * kf}"></div>` + U.badge(t, '21:40 · crucero Aurora', 'Un cañonazo de fogueo', 'Sin proyectil: era una señal', tAur - 0.2, tE);
    } },
    { t0: tE, set: Ps, p0: [3.2, 2.3, -12.5], l0: [0, 0.7, -27], p1: [2.8, 2.2, -13.6], l1: [0, 0.75, -27], fov0: 44, act: (t) => {
      Ps.tick(t); const u = t - tE;
      enter.forEach((e, i) => { e.root.position.z = e.z0 - u * 0.45; K.pose(e, { ...C.walkArmed(t, 0.55, i), gun: 'port' }); e.setFace(C.blinkEye(t, i), 'neutral'); });
      cadets.forEach((c, i) => { K.pose(c, A.handsUp(t, i)); c.setFace(C.blinkEye(t, i), 'frown'); });
      return U.film(t) + U.badge(t, 'Madrugada del 26 de octubre', 'Cae el Palacio de Invierno', 'Los cadetes se rinden casi sin combatir', tMad - 0.2, tF);
    } },
    { t0: tF, set: Pm, p0: [0.8, 1.0, 5.5], l0: [-0.5, 2.6, -30], p1: [0.6, 1.0, 4.0], l1: [-0.5, 2.8, -30], fov0: 46, act: (t) => {
      Pm.tick(t); const u = t - tF;
      storm.forEach((e, i) => { e.root.position.z = e.z0 - u * (2.4 + (i % 4) * 0.2); K.pose(e, A.charge(t, i, 1.0)); e.setFace(C.blinkEye(t, i), 'shout'); });
      return U.film(t) + sepia(ss(tF, tF + 0.3, t)) + U.stamp(t, 'RECREACIÓN', tRecr - 0.15, tG, { x: 1380, y: 300, rot: -8 })
        + U.source(t, tPel - 0.2, tG, 'La «toma» épica: recreación de 1920 y la película «Octubre» (Eisenstein, 1927)');
    } },
    { t0: tG, set: Hs, p0: [2.3, 1.55, -3.4], l0: [0, 0.95, -7.4], p1: [2.0, 1.5, -4.0], l1: [0, 0.95, -7.4], fov0: 42, act: (t) => {
      Hs.bannerMain.wave(t, 0.02);
      K.pose(lenin, A.orate(t, 1)); lenin.setFace(C.blinkEye(t, 1), C.talkMouth(t, 1));
      delegates.forEach((d, i) => { K.pose(d, A.sit(t, i)); d.setFace(C.blinkEye(t, i), 'neutral'); });
      return U.film(t) + U.nameplate(ctx, [0, 1.6, -7.05], NAMES.lenin[0], 'Jefe del nuevo gobierno', tLen - 0.1, tPaz - 0.3)
        + U.doc(t, tPaz - 0.4, tH, 'Decretos', [['📜 Decreto sobre la paz', tPaz - 0.2], ['📜 Decreto sobre la tierra', tTierra - 0.2]], { left: 1170, top: 120, width: 640 });
    } },
    { t0: tH, set: Sq, p0: [3, 1.6, 4], l0: [0, 4, -24], p1: [2.4, 1.6, 2.5], l1: [0, 4.2, -24], fov0: 46, act: (t) => {
      Sq.tick(t);
      return U.film(t) + `<div style="position:absolute;inset:0;background:rgba(8,10,16,.5)"></div>`
        + U.calendar(t, tViejo - 0.2, ctx.dur + 1, ['Calendario ruso (juliano)', 'OCTUBRE', 25, 1917], ['Calendario occidental', 'NOVIEMBRE', 7, 1917], tSiete - 0.3, { y: 150 })
        + U.big(t, tOct - 0.2, ctx.dur + 1, 'REVOLUCIÓN DE OCTUBRE', { top: 690, size: 70 });
    } },
  ];
  const inst = { scene: Sm, scenes: [Sm, Mr, Br, Dk, Ps, Pm, Hs, Sq], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
