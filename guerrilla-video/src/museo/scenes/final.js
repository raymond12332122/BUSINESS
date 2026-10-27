import * as THREE from 'three';
import * as K from '../kit.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import { run, wt, walkIn } from '../../whatif/shots.js';
const { ss } = K;
const at3 = (m, x, y, z, rx = 0) => { m.position.set(x, y, z); m.rotation.x = rx; return m; };

// Chapter 10, epilogue: Sardina was never found (a figure walking away into the night, PRÓFUGO); 13 pieces never came
// back; Perches behind bars as the years turn; the museum's new cameras, alarms and guards, and the 2018 film; today the
// mask shines again for visitors; the closing pull-back over El Paraguas, the title and the cast.
export function build(ctx) {
  const L = ctx.L;
  const t1 = L[1].t0, t2 = L[2].t0, t3 = L[3].t0, tGua = wt(L[3], 'mas'), tPel = wt(L[3], '2018'), t4 = L[4].t0, t5 = L[5].t0, tEnd = L[5].t1;
  // ---- Sardina walks away down an empty, foggy avenue
  const R = S.reforma({ fireworks: false }); R.fog.near = 6; R.fog.far = 30;
  const sar = K.person(R, 'daiwa', 'sardina', -2, 9.4, 1.13);
  // ---- the hall today: empty spots, a security camera, a custodian
  const X = S.sala('maya', { night: false }); X.cases[0].piece.userData.dynamic = true;
  const cam = P.cctvCam(); cam.position.set(-1.6, 3.6, -4.25); cam.rotation.x = 0.35; cam.scale.setScalar(1.6); X.add(cam);
  const alarm = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#ff3a2a', emissive: '#ff2a1a', emissiveIntensity: 0.3 }));
  alarm.rotation.x = Math.PI / 2; alarm.position.set(-0.55, 3.7, -4.44); alarm.userData.dynamic = true; X.add(alarm);
  X.add(at3(new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 18), new THREE.MeshStandardMaterial({ color: '#2a2a2c' })), -0.55, 3.7, -4.46, Math.PI / 2));
  const cust = K.person(X, 'spe', 'custodio', -1.0, 0.3, 0);
  const vis = [[-0.6, -0.45, 2.6, 'suzuka'], [0.65, -0.5, -2.5, 'cafe'], [0.1, -0.3, Math.PI, 'doto']].map(([x, z, y, k]) => K.person(X, k, 'visitante', x, z, y));
  // ---- the cell
  const C = S.celda(), per = K.person(C, 'oguri', 'perchesDia', -1.4, -0.6, 0.9); K.seatOn(per, 0.42);
  const fillP = new THREE.PointLight('#b8c8f0', 3, 3, 1.5); fillP.position.set(-0.9, 1.4, 0.3); C.add(fillP);
  // ---- the crypt today with visitors round Pakal's mask
  const Cr = S.cripta({ night: false });
  const v2 = [[-1.75, 0.25, 1.1, 'tamamo'], [-0.05, 0.3, -1.25, 'doto']].map(([x, z, y, k]) => K.person(Cr, k, 'visitante', x, z, y));
  const cu2 = K.person(Cr, 'helios', 'custodio', 1.9, 1.6, -2.2);
  // ---- the patio at dusk for the last pull-back
  const Pt = S.patio();
  const act = t => {
    R.tick(t); X.tick?.(t); Pt.tick(t); cam.blink(t); alarm.material.emissiveIntensity = Math.floor(t * 2.2) % 2 ? 0.3 : 3.2;
    X.cases[0].piece.visible = !(t >= t1 - 0.3 && t < t2);   // the 13 that never came back: an empty case
    K.act(sar, walkIn(sar, t, 0.3, [-2, 9.4], 1.13, 8, { seed: 2, speed: 0.4 }), t, {});
    K.act(cust, walkIn(cust, t, tGua - 0.6, [-1.0, 0.3], 0, 1.6, { seed: 3, speed: 0.34 }), t, { eye: 'open' });
    vis.forEach((r, i) => K.act(r, i === 1 ? K.A.point(t, i, 0.4, 0.1) : i ? K.A.think(t, i) : K.A.stand(t, i), t, {}));
    K.act(per, K.A.seated(K.A.dejected || K.A.think, t, 1), t, { eye: 0.4, mouth: [0, 0] });
    const yr = 1989 + Math.floor(11 * ss(t2, t3 - 0.4, t)); C.calendar.set(yr);
    v2.forEach((r, i) => K.act(r, i === 0 ? K.A.point(t, i, 0.4, 0.1) : K.A.stand(t, i), t, { smile: 0.6, eye: i === 0 ? 'sparkle' : 'open' }));
    K.act(cu2, K.A.stand(t, 4), t, {});
    const film = t >= tPel - 0.2 && t < t4 - 0.15;
    return U.letterbox(1) + U.chapter(t, 0.2, t1 - 0.4, 10, 'EPÍLOGO') +
      U.dossier(t, 0.6, t1 - 0.2, 'A-2', ['RAMÓN SARDINA GARCÍA', 'Paradero desconocido', '', ''], { x: 1250, y: 150, w: 540, rot: 2, stampText: 'PRÓFUGO', stampAt: 1.6 }) +
      U.counter(t, wt(L[0], 'siete') - 0.2, t1 - 0.2, 'PIEZAS CON ÉL', 0, 7, { x: 1500, y: 680, dur: 0.8, pad: 1, size: 110 }) +
      U.counter(t, t1, t2 - 0.2, 'PIEZAS QUE NUNCA VOLVIERON', 0, 13, { x: 960, y: 430, dur: 1.0, pad: 2, size: 170, note: '7 CON SARDINA · 2 CAMBIADAS POR DROGA · 4 NUNCA LOCALIZADAS' }) + (t >= t1 - 0.1 && t < t2 - 0.1 ? U.black(0.45) : '') +
      U.counter(t, t2 + 0.2, t3 - 0.2, 'AÑOS EN PRISIÓN', 0, 10, { x: 420, y: 250, dur: 1.6, pad: 2, prefix: '+' }) +
      (film ? U.black(0.62 * ss(tPel - 0.2, tPel + 0.3, t)) + filmCard(t, tPel, t4 - 0.15) : '') +
      U.tag(t, t4 + 0.2, t5 - 0.2, 'HOY', 'SALA MAYA · MUSEO NACIONAL DE ANTROPOLOGÍA', { x: 96, y: 160 }) +
      (t > tEnd - 0.4 ? U.title(t, tEnd - 0.4, ctx.dur + 2) : '') +
      U.cast(t, t5 + 1.8, tEnd - 0.5, [['CARLOS PERCHES', 'Oguri Cap'], ['RAMÓN SARDINA', 'Daiwa Scarlet'], ['«EL CABO»', 'Hishi Akebono'], ['EL SUBPROCURADOR', 'Air Groove'], ['LOS 9 GUARDIAS', 'Tamamo Cross y compañía']], { x: 1180, y: 200 });
  };
  const filmCard = (t, a, b) => { const k = ss(a, a + 0.5, t) * (1 - ss(b - 0.4, b, t)); if (k <= 0) return '';
    return `<div style="position:absolute;left:0;right:0;top:300px;text-align:center;opacity:${k}">
      <div class="mono" style="font-size:26px;letter-spacing:.5em;color:#c9a24a">EN EL CINE · 2018</div>
      <div class="bebas" style="font-size:210px;line-height:1;color:#f4ecd8;text-shadow:0 8px 30px rgba(0,0,0,.8)">MUSEO</div>
      <div class="bebas" style="font-size:44px;letter-spacing:.18em;color:#e8dcc4">DIRIGIDA POR ALONSO RUIZPALACIOS · CON GAEL GARCÍA BERNAL</div>
      <div class="mono" style="font-size:24px;letter-spacing:.25em;color:#c9a24a;margin-top:14px">OSO DE PLATA AL MEJOR GUION · BERLINALE</div></div>`; };
  const sfx = [
    { t: 0, type: 'night', dur: t1, vol: 0.3 }, { t: 0.3, type: 'steps', dur: 3.5, vol: 0.2 }, { t: 1.6, type: 'stamp', vol: 0.65 }, { t: wt(L[0], 'siete'), type: 'tick', vol: 0.3 },
    { t: t1, type: 'sting', vol: 0.35 }, { t: t2, type: 'clank', vol: 0.5 }, { t: t2 + 0.3, type: 'paper', dur: 2, vol: 0.2 },
    { t: t3, type: 'hum', dur: tPel - t3, vol: 0.15 }, { t: t3 + 0.3, type: 'beep', vol: 0.25 }, { t: tPel - 0.2, type: 'projector', dur: t4 - tPel, vol: 0.35 },
    { t: t4, type: 'crowd', dur: t5 - t4, vol: 0.12 }, { t: t4 + 0.3, type: 'chime', vol: 0.3 }, { t: t5, type: 'fountain', dur: ctx.dur - t5, vol: 0.3 }, { t: tEnd - 0.4, type: 'hit', vol: 0.6 },
  ];
  const shots = [
    { t0: 0, set: R, p0: [-4.5, 1.1, 8.0], l0: [3, 0.8, 11.5], p1: [-4.0, 1.05, 8.2], l1: [4, 0.8, 11.8], fov0: 46, act },
    { t0: t1 - 0.15, set: X, p0: [0.0, 1.35, -0.4], l0: [0, 0.72, -1.2], fov0: 44, act },
    { t0: t2 - 0.15, set: C, p0: [0.2, 1.0, 2.6], l0: [-0.1, 0.95, -1.0], p1: [0.05, 0.98, 2.3], l1: [-0.15, 0.95, -1.0], fov0: 46, act },
    { t0: t3 - 0.15, set: X, p0: [-0.2, 3.05, -2.8], l0: [-1.2, 3.5, -4.3], p1: [-0.45, 3.15, -3.15], l1: [-1.25, 3.52, -4.3], fov0: 44, act },
    { t0: tGua - 0.45, set: X, p0: [-0.7, 1.1, 4.1], l0: [-0.6, 0.85, 0.5], p1: [-0.75, 1.08, 3.8], l1: [-0.6, 0.85, 0.5], fov0: 46, act },
    { t0: tPel - 0.2, set: Pt, p0: [0, 1.2, 13], l0: [0, 4.0, 0], fov0: 55, act },
    { t0: t4 - 0.15, set: Cr, p0: [-0.3, 1.2, 2.5], l0: [-0.9, 0.9, 0.45], p1: [-0.45, 1.12, 2.0], l1: [-0.9, 0.92, 0.45], fov0: 48, act },
    { t0: t5 - 0.1, set: Pt, p0: [2, 1.4, 5], l0: [0, 3.0, 0], p1: [6, 3.4, 18], l1: [0, 4.0, 0], fov0: 55, ease: 'inOut', act },
  ];
  const inst = { scene: R, scenes: [R, X, C, Cr, Pt], sfx, hideCaptions: t => t > tEnd + 0.1 };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
