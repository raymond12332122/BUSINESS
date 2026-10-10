import * as THREE from 'three';
import * as C from '../../lib/chars.js';
import * as LP from '../../lib/props.js';
import { ss, clamp, lerp } from '../../lib/util.js';
import { partTimes, badge, label } from '../../lib/kit.js';
import * as F from '../../lib/fx.js';
import * as X from '../props.js';
import * as K from '../kit.js';
import * as A from '../anim.js';
import { zocalo, desert, morelos, mxStage, interior, aimSun } from '../sets.js';
import { runShots } from '../shots.js';
import { film, nameplate } from '../ui.js';

export function build(ctx) {
  const L = ctx.L;
  // ---- Palacio Nacional: Díaz on the balcony, a crowd below
  const Z = zocalo('day');
  const pal = Z.palacio, [bx, by, bz] = pal.balcony;
  const diaz = K.person(Z, 'diaz', 'diaz', bx, bz - 16 + 0.1, 0); diaz.root.position.y = by;
  const crowd = []; for (let i = 0; i < 16; i++) { const r = K.person(Z, ['doto', 'oguri', 'tamamo', 'cafe'][i % 4], i % 3 ? 'campesino' : 'politico', -6 + (i % 8) * 1.7 + (Math.floor(i / 8) % 2) * 0.8, -9.5 + Math.floor(i / 8) * 1.6, Math.PI); crowd.push(r); }
  // ---- modernization: iron bridge, train, factory chimneys, telegraph
  const M = desert('day', { seed: 31, clear: [[0, 0, 12]] });
  M.add(LP.strip([[0, -60], [0.8, -20], [-0.6, 20], [0.4, 60]], 9, '#8f7a5a', 0.012)); M.add(LP.strip([[0, -60], [0.8, -20], [-0.6, 20], [0.4, 60]], 6.5, '#5d8fa8', 0.02, { roughness: 0.25 }));
  const bridge = X.ironBridge(16); bridge.rotation.y = Math.PI / 2; bridge.position.set(0, 0.05, 0); M.add(bridge);
  M.add(LP.railway(60, -38, 0)); M.add(LP.railway(60, 38, 0));
  const trainM = X.steamTrain(3, { carColor: '#6f4a34' }); trainM.rotation.y = Math.PI / 2; M.add(trainM);
  const smokeM = X.smokeTrail(M, 16, { color: '#ebe6dc', size: 0.45, rise: 3, drift: [-2.5, 0, 0] });
  const fac = new THREE.Group(); fac.position.set(16, 0, -14); M.add(fac);
  fac.add(LP.at(LP.box(7, 3, 4, '#9a5a42'), 0, 1.5, 0)); for (const x of [-2.4, -0.8, 2.6]) fac.add(LP.at(LP.cyl(0.3, 0.38, 6, '#7d4a36', 10), x, 3, -1));
  const facSmoke = [0, 1, 2].map(() => X.smokeTrail(M, 8, { color: '#8a8580', size: 0.5, rise: 4, drift: [-2, 0, 0.5], life: 3.4, opacity: 0.6 }));
  const tel = X.telegraph(8, 4.5); tel.position.set(-34, 0, 3.2); M.add(tel);
  // ---- hacienda and fields
  const H = morelos('day', { cane: false, seed: 32 });
  const hac = X.hacienda(); hac.position.set(0, 0, -16); H.add(hac);
  H.add(X.field(-26, -13, -5, 3, { seed: 3, kind: 'cane', spacing: 0.5 })); H.add(X.field(9, -11, 26, 1, { seed: 4, kind: 'cane', spacing: 0.5 }));
  H.add(LP.strip([[-3.5, 14], [-2, 4], [0, -6], [0.5, -13]], 2.4, '#b8a070', 0.012));
  // far workers in the field (wide shot) and near carriers (medium shot)
  const carriers = []; for (let i = 0; i < 5; i++) { const r = K.person(H, ['doto', 'oguri', 'tamamo', 'helios', 'cafe'][i], 'campesino', 0, 0, 0);
    r.attach('chest', X.caneBundle(1.2, 10, i + 3), [0, 0.47, -0.2], [0, 0, i % 2 ? 22 : -22]); carriers.push(r); }
  const hacendado = K.person(H, 'mcqueen', 'politico', 0, 0, 0);
  K.wearHat(hacendado, K.sombrero('panama'), { scale: 0.86 });
  // ---- tienda de raya (company store)
  const T = mxStage('day', ['#cdb48c', '#bfa47a'], { seed: 33 });
  const store = X.tienda(); store.position.set(0, 0, -1.2); T.add(store);
  const sign = X.banner('TIENDA DE RAYA', { w: 3.4, h: 0.55, bg: '#3a2a1e', fg: '#f0e2c0', accent: '#c9a227', size: 64, poles: false }); sign.position.set(0, 2.78, 0.55); T.add(sign);
  for (const [x, z, c] of [[-7, -1, '#d9b48a'], [7.2, -1.5, '#c9967a'], [-11.5, -2, '#e2c9a2'], [11.5, -2.4, '#d6c08f']]) { const h = X.adobe(4, 3, 2.6, c, x | 0); h.position.set(x, 0, z); T.add(h); }
  T.add(LP.at(LP.box(3.2, 0.16, 0.9, '#7d5a3a'), 0, 0.08, -1.75));
  const clerk = K.person(T, 'mcqueen', 'politico', -0.55, -1.75, 0.45); clerk.root.position.y = 0.16;
  const peon = K.person(T, 'doto', 'campesino', 1.05, -0.2, -0.8);
  // ---- re-election: ballot box in a government hall
  const E = interior({ wall: '#7a2f2a', floor: '#5a3a24', w: 12, d: 9, h: 4.4, lights: [[-2.5, 3.8, 0], [2.5, 3.8, 0]], windows: false });
  const poster = X.banner('¡VIVA LA REELECCIÓN!', { w: 4.6, h: 0.9, bg: '#f3ead6', fg: '#2a2320', accent: '#1f7a3a', size: 80, poles: false }); poster.position.set(0.7, 2.45, -4.42); E.add(poster);
  const flagE = X.flag('mx', 3.2, 1.3, 0.8); flagE.position.set(-3.6, 0, -3.6); E.add(flagE);
  const tbl = new THREE.Group(); tbl.position.set(0.42, 0, -0.35); E.add(tbl);
  tbl.add(LP.at(LP.box(0.7, 0.04, 0.5, '#5a3a24'), 0, 0.5, 0)); for (const [x, z] of [[-0.3, -0.2], [0.3, -0.2], [-0.3, 0.2], [0.3, 0.2]]) tbl.add(LP.at(LP.box(0.04, 0.5, 0.04, '#4a2f1d'), x, 0.25, z));
  tbl.add(LP.at(LP.box(0.72, 0.18, 0.012, '#1f7a3a'), 0, 0.43, 0.256));
  const bb = X.ballotBox(); bb.position.set(0.42, 0.52, -0.35); E.add(bb);
  const slips = [0, 1, 2, 3, 4, 5, 6, 7].map(() => { const m = LP.box(0.15, 0.1, 0.004, '#f3ead6'); E.add(m); m.visible = false; return m; });
  const diaz2 = K.person(E, 'diaz', 'diaz', -0.32, -0.3, 0.25);
  const p2 = partTimes(L[2], ['Pero la riqueza se quedó en muy pocas manos.', 'Unas cuantas familias y grandes haciendas eran dueñas de casi toda la tierra,', 'mientras millones de campesinos trabajaban en ellas por salarios miserables,', 'muchos atrapados en deudas que nunca podían pagar.']);
  const sfx = [{ t: 0.4, type: 'crowd', dur: L[1].t0 - 0.6, vol: 0.5 }, { t: L[1].t0 + 0.1, type: 'train', dur: 5.5, vol: 0.7 }, { t: L[1].t0 + 0.3, type: 'whistle' },
    { t: p2[3] - 0.2, type: 'pop' }, ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ t: L[3].t0 + 0.8 + i * 0.42, type: 'tick', vol: 0.8 }))];
  const years = [1877, 1884, 1888, 1892, 1896, 1900, 1904, 1910];

  const shots = [
    { t0: 0, set: Z, p0: [6, 1.6, 4], l0: [0, 4.0, -13], p1: [2.2, 3.9, -8.2], l1: [0, 4.5, -13.8], fov0: 38, act: (t) => {
      K.pose(diaz, { ...C.wave(t, 1, 'R') }); diaz.setFace(C.blinkEye(t, 1), 'smile');
      crowd.forEach((c, i) => { K.pose(c, { ...(i % 4 === 0 ? C.cheer(t, i) : C.idle(t, c.seed)), gun: 'none' }); c.setFace(C.blinkEye(t, c.seed), 'smile'); });
      Z.flag.wave(t); aimSun(Z, 0, -6);
      return film(t) + nameplate(ctx, [bx, by + 1.45, bz - 16 + 0.1], 'Porfirio Díaz', 'Presidente', 2.2, L[1].t0) + badge(t, '1876 – 1911', 'El Porfiriato', 'Más de 30 años de Díaz en el poder', 4.4, L[1].t0);
    } },
    { t0: L[1].t0, set: M, p0: [10, 3.0, 13], l0: [2, 1.2, -2], p1: [8, 2.6, 13.5], l1: [0, 1.4, -3], fov0: 44, act: (t, u, lt) => {
      const x = -24 + lt * 6.5; trainM.position.set(x, 0.15, 0); smokeM(t, trainM.localToWorld(trainM.stack.clone()));
      fac.children.slice(1).forEach((ch, i) => facSmoke[i](t + i * 0.7, new THREE.Vector3(16 + [-2.4, -0.8, 2.6][i], 6.2, -15)));
      aimSun(M, 0, 0);
      return film(t) + badge(t, 'Modernización', 'De 640 a más de 19 000 km de vías', 'Ferrocarriles, fábricas e inversión extranjera', L[1].t0 + 0.6, L[2].t0);
    } },
    { t0: L[2].t0, set: H, p0: [10, 6.5, 14], l0: [-2, 1.2, -6], p1: [7.5, 5.2, 11], l1: [-1.5, 1.4, -7], fov0: 40, act: (t, u, lt) => {
      carriers.forEach((c, i) => { const z = 7 - i * 2.4 - lt * 0.55; c.root.position.set(-2.6 + (z - 7) * -0.12, 0, z); c.root.rotation.y = Math.PI + 0.12; K.pose(c, { ...C.walk(t, 0.55, i), gun: 'none' }); });
      hacendado.root.position.set(4, 0, -9.5); hacendado.root.rotation.y = 0.3; K.pose(hacendado, A.proud(t, 2));
      aimSun(H, 0, -4);
      return film(t) + label(ctx, [0, 6.6, -16], 'Hacienda', 'n', ss(L[2].t0 + 0.8, L[2].t0 + 1.2, t) * (1 - ss(p2[2] - 0.5, p2[2] - 0.2, t)))
        + badge(t, '1910', 'La tierra, en pocas manos', 'Unas cuantas familias poseían casi todo el campo', p2[1], p2[2] - 0.1);
    } },
    { t0: p2[2] - 0.1, set: H, p0: [1.6, 1.25, 5.4], l0: [-0.2, 1.0, 0], p1: [1.3, 1.2, 4.9], l1: [-0.2, 1.0, 0], fov0: 36, act: (t, u, lt) => {
      hacendado.root.position.set(0, 0, 1.2); hacendado.root.rotation.y = 0.55; K.pose(hacendado, A.proud(t, 2)); hacendado.setFace(C.blinkEye(t, 2), 'smile');
      carriers.forEach((c, i) => { const x = -5.2 + i * 1.7 + lt * 0.5; c.root.position.set(x, 0, -2.6 - (i % 2) * 0.7); c.root.rotation.y = Math.PI / 2;
        const p = C.walk(t, 0.5, i * 1.3); p.waist = [6, p.waist[1], 0]; p.chest = [4, p.chest[1], 0]; p.head = [3, 0, 0];
        p.armL = [-30, -10, -70]; p.armR = [-30, 10, 70]; p.elbL = [0, -75, 0]; p.elbR = [0, 75, 0];
        K.pose(c, { ...p, gun: 'none' }); c.setFace('flat', 'frown'); });
      aimSun(H, 0, -2);
      return film(t) + nameplate(ctx, [0, 1.55, 1.2], 'El hacendado', 'Dueño de la tierra', p2[2] + 0.2, p2[3] - 0.4)
        + badge(t, 'Peones', 'Jornadas de sol a sol', 'Un peón ganaba unos 25 centavos al día', p2[2] + 0.8, p2[3] - 0.2);
    } },
    { t0: p2[3] - 0.15, set: T, p0: [0.9, 1.12, 5.4], l0: [0.25, 0.86, -0.9], p1: [0.8, 1.1, 4.9], l1: [0.25, 0.86, -0.9], fov0: 36, act: (t) => {
      const cp = C.point(t, 3, 0); cp.armR = [-62 + 4 * Math.sin(t * 9), 10 * Math.sin(t * 4), 74]; cp.elbR = [0, 24, 0]; cp.head = [10, 0, 0]; cp.waist = [6, 0, 0];
      K.pose(clerk, cp); clerk.setFace(C.blinkEye(t, 3), 'grin');
      K.pose(peon, A.humble(t, 4)); peon.setFace('flat', 'frown');
      aimSun(T, 2, 4);
      const n = clamp((t - p2[3] - 0.3) / (L[3].t0 - p2[3] - 0.6), 0, 1), debt = (12.5 + n * 74.25).toFixed(2);
      const k = ss(p2[3] + 0.1, p2[3] + 0.4, t) * (1 - ss(L[3].t0 - 0.3, L[3].t0, t));
      const rows = [['Maíz', '3.00'], ['Frijol', '1.75'], ['Manta', '4.50'], ['Jabón', '0.50'], ['Préstamo', '8.00']];
      const ledger = k > 0 ? `<div style="position:absolute;left:90px;top:90px;width:420px;padding:22px 26px;background:#f3ead6;color:#2a2320;border-radius:6px;box-shadow:0 10px 30px rgba(0,0,0,.35);opacity:${k};transform:rotate(-2deg);font:600 26px Inter">
        <div style="font:800 20px Inter;letter-spacing:.18em;color:#8a2f2a">LIBRETA DE RAYA</div><div style="font:700 28px Inter;margin:6px 0 10px">Cuenta del peón</div>
        ${rows.map(([a, v], i) => `<div style="display:flex;justify-content:space-between;opacity:${ss(p2[3] + 0.3 + i * 0.35, p2[3] + 0.5 + i * 0.35, t)}"><span>${a}</span><span>$ ${v}</span></div>`).join('')}
        <div style="border-top:3px solid #2a2320;margin-top:10px;padding-top:8px;display:flex;justify-content:space-between;font:900 32px Inter;color:#b5332e"><span>DEBE</span><span>$ ${debt}</span></div></div>` : '';
      return film(t) + ledger + badge(t, 'Tiendas de raya', 'Deudas de por vida', 'Los peones compraban fiado y las deudas pasaban a sus hijos', p2[3] + 0.4, L[3].t0);
    } },
    { t0: L[3].t0, set: E, p0: [0.45, 1.0, 3.3], l0: [0.05, 0.8, -0.3], p1: [0.4, 0.98, 2.9], l1: [0.05, 0.8, -0.3], fov0: 36, act: (t) => {
      { const p = A.proud(t, 5); p.armL = [-72, 28, -78]; p.elbL = [0, -18, 0]; K.pose(diaz2, p); } diaz2.setFace(t > L[3].t0 + 1.4 ? 'happy' : C.blinkEye(t, 5), 'grin');
      flagE.wave(t * 0.4);
      slips.forEach((m, i) => { const t0 = L[3].t0 + 0.8 + i * 0.42, k = (t - t0) / 0.32; m.visible = k > 0 && k < 1; if (m.visible) m.position.set(0.42, 1.25 - k * 0.36, -0.35); });
      const n = clamp(Math.floor((t - L[3].t0 - 0.8) / 0.42) + 1, 0, 8);
      const chips = years.slice(0, n).map((y, i) => `<span style="display:inline-block;margin:6px;padding:8px 16px;border-radius:10px;background:#2a211b;color:#fff;font:800 30px Inter;border-bottom:4px solid #e0b84a">${y}</span>`).join('');
      const k = ss(L[3].t0 + 0.5, L[3].t0 + 0.9, t);
      return film(t) + (k > 0 ? `<div style="position:absolute;left:80px;top:80px;width:640px;opacity:${k}"><div style="font:800 24px Inter;letter-spacing:.2em;color:#e0b84a">DÍAZ, ELECTO EN</div><div style="margin-top:8px">${chips}</div></div>` : '');
    } },
  ];
  const inst = { scene: Z, scenes: [Z, M, H, T, E], sfx };
  inst.update = t => runShots(inst, ctx, shots, t);
  return inst;
}
