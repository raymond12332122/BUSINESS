import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import { ss, clamp } from '../../lib/util.js';
import { mesh, box, cyl, at } from '../../lib/props.js';
import { runShots, wt } from '../../mx/shots.js';
import * as K from '../kit.js';
import * as U from '../ui.js';
import * as S from '../sets.js';
import * as A from '../anim.js';

export async function preload() {}
const CAST = ['doto', 'oguri', 'suzuka', 'helios', 'tamamo', 'mcqueen', 'daiwa', 'cafe'];
const fz = (arr, poseFn, keep = () => false, face = 'neutral') => arr.forEach((c, i) => { if (keep(i)) return; c.setFace('open', face); K.freeze(c, poseFn(i)); });
// Wheelbarrow heaped with bundles of banknotes (German hyperinflation, 1923). Faces +x; handles at -x.
function moneyBarrow() {
  const g = new THREE.Group(), wood = '#6a4a30';
  g.add(at(box(0.62, 0.05, 0.42, wood), 0, 0.26, 0)); for (const s of [-1, 1]) g.add(at(box(0.62, 0.16, 0.04, wood), 0, 0.34, s * 0.21)); g.add(at(box(0.04, 0.16, 0.42, wood), 0.31, 0.34, 0));
  for (const s of [-1, 1]) g.add(at(box(0.9, 0.035, 0.035, wood), -0.25, 0.27, s * 0.16, 0, 0, -0.12));
  const wh = mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 16), new THREE.MeshStandardMaterial({ color: '#3a3026', roughness: 0.8 })); wh.rotation.x = Math.PI / 2; wh.position.set(0.38, 0.11, 0); g.add(wh);
  const cols = ['#c9bf98', '#a9b894', '#d4b48a', '#b4b0c4'];
  for (let i = 0; i < 26; i++) { const b = box(0.13, 0.05, 0.07, cols[i % 4]); b.position.set(-0.22 + (i % 4) * 0.15, 0.31 + Math.floor(i / 12) * 0.055 + (i % 3) * 0.02, -0.13 + (Math.floor(i / 4) % 3) * 0.13); b.rotation.y = (i % 5 - 2) * 0.12; g.add(b); }
  return g;
}

export function build(ctx) {
  const L = ctx.L;
  const tDiez = wt(L[0], 'diez'), tCiv = wt(L[0], 'civiles'), tGri = wt(L[0], 'gripe'), tMato = wt(L[0], 'mato'), tDec = wt(L[0], 'decenas');
  const tGran = wt(L[1], 'gran'), tGue2 = wt(L[1], 'guerra', 1), tTod = wt(L[1], 'todas');
  const tRen = wt(L[2], 'rencor'), tAle = wt(L[2], 'alemania'), tCri = wt(L[2], 'crisis'), tVein = wt(L[2], 'veinte'), tSeg = wt(L[2], 'segunda'), tMun = wt(L[2], 'mundial');
  const tB = tGri - 0.35, tC = L[1].t0 - 0.35, tD = L[2].t0 - 0.35, tE = tCri - 0.3, tF = tVein - 0.35;

  // ---- 1, 3. War cemetery with poppies at sunset; a helmet hung on a cross
  const Ce = S.cemetery('golden', { rows: 9, cols: 15 });
  const near = Ce.crosses.find(c => Math.abs(c.position.x) < 0.1 && c.position.z > -3.5);
  const helm = K.brodie(); helm.scale.setScalar(0.9); helm.position.set(near.position.x, 0.86, near.position.z + 0.05); helm.rotation.set(0.25, 0, 0.12); Ce.add(helm);
  // ---- 2. The 1918 flu: a hospital ward
  const Ho = S.hospital();
  const patients = Ho.beds.filter((_, i) => i % 3 !== 2).map((b, i) => { const c = K.person(b, CAST[i % 8], 'paciente', 0, 0.58, 0); c.root.position.y = 0.6; c.root.rotation.set(-Math.PI / 2, 0, 0); return c; });
  patients.forEach((c, i) => { c.setFace(i % 2 ? 'closed' : 'flat', 'frown'); K.freeze(c, A.lie(0.3, i)); });
  const nurses = [[0.45, -2.6, 0], [-1.75, -0.4, -Math.PI / 2]].map(([x, z, y], i) => K.person(Ho, ['daiwa', 'suzuka'][i], 'enfermera', x, z, y));
  // ---- 4-5. Germany after the war: resentment, then hyperinflation (1923)
  const Be = S.stage('overcast', ['#9a948a', '#8e887e']);
  [-13, -6.5, 0, 6.5, 13].forEach((x, i) => { const f = S.facade(6.4, 6 + (i % 2), ['#c9b48e', '#b8a48a', '#d4c4a0', '#a89a80', '#c4b08c'][i], { floors: 3, seed: 40 + i, roof: '#6a4a3a' }); f.position.set(x, 0, -6); Be.add(f); });
  Be.add(at(box(60, 0.12, 2.2, '#b9b2a6'), 0, 0.06, -4.9));
  const folk = K.crowd(Be, ['civil', 'civilMujer', 'civil', 'oficialAleman'], 12, [-5, -4.6, 3, -2.2], { seed: 1301, yaw: 0.2 });
  fz(folk, i => i % 4 === 3 ? A.fist(0.4 + i * 0.2, i) : i % 3 === 0 ? A.sad(0.3, i) : C.idle(0.3 + i * 0.1, i, 0.3), () => false, 'frown');
  const pusher = K.person(Be, 'helios', 'civil', 0, -0.4, Math.PI / 2), barrow = moneyBarrow(); barrow.scale.setScalar(1.25); barrow.userData.dynamic = true; Be.add(barrow);
  // ---- 6. 1939: Panzers at dusk
  const Pz = S.dusk1939(); Pz.tanks.forEach(tk => { tk.p0 = tk.position.clone(); });

  const sfx = [{ t: 0, type: 'wind', dur: tB, vol: 0.22 }, { t: 0.25, type: 'bell', vol: 0.35 }, { t: tDiez - 0.05, type: 'tick', vol: 0.3 }, { t: tCiv - 0.05, type: 'tick', vol: 0.25 },
    { t: tB, type: 'clock', dur: tC - tB, vol: 0.16 }, { t: tC, type: 'choir', dur: tD - tC + 0.4, vol: 0.22 }, { t: tC + 0.2, type: 'birds', dur: tD - tC, vol: 0.1 },
    { t: tD + 0.1, type: 'paper', vol: 0.45 }, { t: tD, type: 'crowd', dur: tE - tD, vol: 0.22 }, { t: tAle, type: 'sting', vol: 0.35 },
    { t: tE + 0.3, type: 'cash', vol: 0.4 }, { t: tE + 0.5, type: 'creak', vol: 0.3 },
    { t: tF, type: 'engine', dur: ctx.dur - tF, vol: 0.4 }, { t: tF + 0.2, type: 'clank', vol: 0.3 }, { t: tVein, type: 'tension', vol: 0.35 }, { t: tSeg - 0.05, type: 'sting2', vol: 0.45 }];

  const shots = [
    { t0: 0, set: Ce, p0: [0, 1.0, 4.0], l0: [0, 0.6, -10], p1: [0, 3.0, 6.5], l1: [0, 0.4, -10], fov0: 44, act: (t) => {
      Ce.tick(t);
      return U.film(t) + U.counter(t, tDiez - 0.3, tB + 0.3, 1220, 140, 10000000, 'soldados muertos', { from: 0, dur: 1.4, color: '#ff8a6a', prefix: '≈ ', w: 600 })
        + U.source(t, tCiv - 0.2, tB + 0.3, 'Y millones de civiles: entre 6 y 13 millones, según las estimaciones');
    } },
    { t0: tB, set: Ho, p0: [0.2, 1.45, 6.2], l0: [0, 0.55, -4], p1: [0.1, 1.35, 5.0], l1: [0, 0.55, -4], fov0: 46, act: (t) => {
      Ho.tick && Ho.tick(t); const u = t - tB;
      K.pose(nurses[0], C.walk(t, 0.35, 1)); nurses[0].root.position.set(0.45, 0, -2.6 + 0.35 * u); nurses[0].root.rotation.y = 0; nurses[0].setFace(C.blinkEye(t, 1), 'neutral');
      K.pose(nurses[1], C.offer(t, 2, 0.6)); nurses[1].setFace(C.blinkEye(t, 2), 'neutral');
      return U.film(t) + U.big(t, tGri - 0.2, tC + 0.2, 'La gripe de 1918', { top: 90, size: 60 })
        + U.source(t, tDec - 0.1, tC + 0.3, 'La llamada «gripe española» mató a entre 17 y 50 millones de personas, o más');
    } },
    { t0: tC, set: Ce, p0: [0.9, 0.62, -1.0], l0: [0, 0.7, -3.0], p1: [0.65, 0.66, -1.4], l1: [0, 0.72, -3.0], fov0: 40, act: (t) => {
      Ce.tick(t);
      return U.film(t) + U.big(t, tGran - 0.3, tD + 0.2, 'La Gran Guerra', { top: 90, size: 72 })
        + U.quote(t, [['La guerra que acabará', tGue2 - 0.15], ['con todas las guerras', tTod - 0.2]], 'frase popularizada a partir de H. G. Wells (1914)', tGue2 - 0.4, tD + 0.2, 70);
    } },
    { t0: tD, set: Be, p0: [3.4, 1.5, 6.0], l0: [-0.5, 1.0, -3.5], p1: [2.8, 1.45, 5.2], l1: [-0.5, 1.0, -3.5], fov0: 44, act: (t) => {
      Be.tick && Be.tick(t); pusher.root.visible = false; barrow.visible = false;
      return U.film(t) + U.newspaper(t, tD + 0.05, tE + 0.2, { mast: 'Deutsche Zeitung', date: '28 de junio de 1919', head: '¡VERGELTUNG!', sub: '«¡Venganza!»: un diario alemán el día de la firma', x: 30, price: 'Berlín' });
    } },
    { t0: tE, set: Be, p0: [1.6, 1.1, 3.4], l0: [-0.4, 0.55, -0.8], p1: [1.8, 1.05, 2.9], l1: [0.2, 0.55, -0.8], fov0: 42, act: (t) => {
      Be.tick && Be.tick(t); const u = t - tE, x = -1.6 + u * 0.45;
      pusher.root.visible = true; barrow.visible = true;
      pusher.root.position.set(x, 0, -0.4); K.pose(pusher, { ...C.walk(t, 0.45, 2), armL: [-38, 0, -66], armR: [-38, 0, 66], elbL: [0, -12, 0], elbR: [0, 12, 0] }); pusher.setFace(C.blinkEye(t, 2), 'frown');
      barrow.position.set(x + 0.62, 0, -0.4);
      return U.film(t) + U.counterD(t, tE + 0.2, tF + 0.3, 90, 150, 4.2, 'marcos por un dólar (noviembre de 1923)', { from: 0, dur: 1.1, color: '#ffcf6a', suffix: ' billones', w: 640, dec: 1 })
        + U.badge(t, 'Alemania · 1923', 'Hiperinflación', 'Y en 1929 llegó la Gran Depresión', tE + 0.3, tF)
        + U.source(t, tE + 0.6, tF + 0.3, 'Un billón = un millón de millones');
    } },
    { t0: tF, set: Pz, p0: [2.6, 1.0, -1.2], l0: [-4, 0.9, -10], p1: [2.2, 0.98, -1.8], l1: [-4, 0.9, -10], fov0: 46, act: (t) => {
      Pz.tick && Pz.tick(t); const d = (t - tF) * 0.9;
      Pz.tanks.forEach(tk => { tk.position.set(tk.p0.x - 0.565 * d, 0, tk.p0.z + 0.825 * d); });
      return U.film(t) + U.datePage(t, tVein - 0.2, tMun + 0.4, 'Alemania invade Polonia', 'SEPTIEMBRE', '1', '1939', { x: 1560, y: 110, accent: '#5a1a14' })
        + `<div style="position:absolute;inset:0;background:rgba(6,8,14,${0.55 * ss(tMun, tMun + 0.6, t)})"></div>`
        + U.titleCard(t, tMun + 0.35, ctx.dur + 1, '1914 · 1918', 'LA PRIMERA<br>GUERRA MUNDIAL', 'Gracias por ver', 170);
    } },
  ];
  const inst = { scene: Ce, scenes: [Ce, Ho, Be, Pz], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
