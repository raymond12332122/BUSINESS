import * as THREE from 'three';
import * as K from '../kit.js';
import * as A from '../anim.js';
import * as S from '../sets.js';
import * as P from '../props.js';
import * as U from '../ui.js';
import * as M from '../../lib/motion.js';
import { run, wt, walkIn } from '../shots.js';
const { ss, clamp, HAND } = M;
const fade = U.fade;
const emoji = (ctx, pos, ch, k, size = 80) => { if (k <= 0) return ''; const [x, y, ok] = ctx.project(pos); if (!ok) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%) scale(${0.6 + 0.4 * k});opacity:${k};font:${size}px 'Noto Color Emoji'">${ch}</div>`; };
// A fan poster of her idol on an easel (Colombia): "KAICHŌ" with the colours of Rudolf's sash.
function kaichoPoster() {
  const g = new THREE.Group(), tex = K.canvasTex(256, 340, (x, w, h) => {
    x.fillStyle = '#fff6fa'; x.fillRect(0, 0, w, h); x.fillStyle = '#0f6b3f'; x.fillRect(0, 0, w / 3, 26); x.fillStyle = '#f6f3ea'; x.fillRect(w / 3, 0, w / 3, 26); x.fillStyle = '#c3262f'; x.fillRect(2 * w / 3, 0, w / 3, 26);
    x.fillStyle = '#7a2a1a'; x.beginPath(); x.arc(w / 2, 150, 70, 0, 7); x.fill(); x.fillStyle = '#f2e0d0'; x.beginPath(); x.arc(w / 2, 165, 50, 0, 7); x.fill();
    x.fillStyle = '#7a2a1a'; x.beginPath(); x.moveTo(w / 2 - 62, 110); x.lineTo(w / 2 - 40, 50); x.lineTo(w / 2 - 22, 100); x.fill(); x.beginPath(); x.moveTo(w / 2 + 62, 110); x.lineTo(w / 2 + 40, 50); x.lineTo(w / 2 + 22, 100); x.fill();
    x.fillStyle = '#f6f3ea'; x.beginPath(); x.ellipse(w / 2 + 6, 112, 26, 9, -0.3, 0, 7); x.fill();
    x.fillStyle = '#c3262f'; x.font = '900 44px Inter'; x.textAlign = 'center'; x.fillText('KAICHŌ', w / 2, 270); x.font = '900 40px Noto Color Emoji'; x.fillText('💖', w / 2, 322); });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 1.0), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 })); board.position.set(0, 1.25, 0.03); board.rotation.x = -0.1; g.add(board);
  for (const [x, z, r] of [[-0.3, 0.12, 0.12], [0.3, 0.12, -0.12], [0, -0.3, 0]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.7, 6), P.std('#7a5a3a')); l.position.set(x, 0.8, z); l.rotation.set(z < 0 ? -0.25 : 0.12, 0, r); g.add(l); }
  return g;
}
function crate() { const g = new THREE.Group(), b = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.6), P.std('#a8743e', { roughness: 0.9 })); b.position.y = 0.2; b.castShadow = b.receiveShadow = true; g.add(b);
  const lbl = K.canvasTex(256, 128, (x, w, h) => { x.fillStyle = '#a8743e'; x.fillRect(0, 0, w, h); x.fillStyle = '#4a2a10'; x.font = '900 40px Inter'; x.textAlign = 'center'; x.fillText('FRÁGIL', w / 2, 80); });
  const f = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3), new THREE.MeshStandardMaterial({ map: lbl })); f.position.set(0, 0.2, 0.302); g.add(f); g.top = 0.4; return g; }

export function build(ctx) {
  const L = ctx.L;
  const tIg = wt(L[0], 'igual'), tBai = wt(L[0], 'bailando');
  const tBr = L[1].t0 - 0.1, tDest = wt(L[1], 'destino'), tExi = wt(L[1], 'existe'), tAr = wt(L[1], 'argentina') - 0.3, tPeq = wt(L[1], 'pequenita'), tHom = wt(L[1], 'hombro');
  const tCh = L[2].t0 - 0.3, tSil = wt(L[2], 'silencio'), tMc = wt(L[2], 'monaco') - 0.3, tVel = wt(L[2], 'velocidad'), tGas = wt(L[2], 'gasolina');

  // ================================================================ Colombia: Tokai Teio copies her "Kaichō"… but dancing
  const CO = S.country('co'), teio = K.leader(CO, 'teio', 0, 0, 0);
  const poster = kaichoPoster(); poster.position.set(-1.25, 0, -0.3); poster.rotation.y = 0.35; CO.add(poster);
  const actCO = t => {
    const copy = ss(tIg - 0.3, tIg + 0.2, t), dance = ss(tBai - 0.25, tBai + 0.25, t);
    let p = M.mix(A.wave(t, 1, 'R'), A.handOnHeart(t, 1, 1), copy);
    if (copy > 0) { p.head = [p.head[0] - 8 * copy, p.head[1], p.head[2]]; }
    if (dance > 0) p = M.mix(p, A.teioStep(t, 1), dance);
    K.act(teio, p, t, { smile: 0.9, eye: dance > 0.5 ? 0.6 : 0.1, mouth: dance > 0.5 ? [0.45, 1] : undefined });
    CO.tick?.(t);
    return U.film(t) + U.leader(t, 0.2, tBr + 0.1, 'teio', { side: 'r' }) + emoji(ctx, [0.55, 1.75, 0], '🎵', fade(t, tBai, tBr + 0.1, 0.2), 64) + emoji(ctx, [-0.5, 1.9, 0], '✨', fade(t, tBai + 0.3, tBr + 0.1, 0.2), 56);
  };

  // ================================================================ Brazil: Satono Diamond, "fate doesn't exist!"
  const BR = S.country('br'), dia = K.leader(BR, 'dia', 0, 0, 0);
  const actBR = t => {
    const k = ss(tDest - 0.5, tDest, t);
    const p = M.mix(A.handOnHeart(t, 1, 0.8), A.point(t, 1, 10, 30, 'R'), k);
    K.act(dia, p, t, { smile: 0.7, mouth: t > tDest - 0.2 && t < tExi + 0.6 ? [0.6, 0.6] : undefined });
    BR.tick?.(t);
    return U.film(t) + U.leader(t, tBr + 0.15, tAr + 0.1, 'dia', { side: 'l' }) + U.bubble(ctx, [0, 1.78, 0], '¡El destino no existe!', fade(t, tDest - 0.2, tAr + 0.1, 0.15), { size: 40 });
  };

  // ================================================================ Argentina: Tamamo Cross, small but feisty, climbs on a crate
  const AR = S.country('ar'), tama = K.leader(AR, 'tamamoB', -0.55, 0.15, 0.35), box = crate(); box.position.set(0.2, 0, 0.1); AR.add(box);
  const tUp = tPeq + 0.1;
  const actAR = t => {
    // walk two steps to the crate, hop up, then stand tall with fists up
    const up = ss(tUp, tUp + 0.35, t);
    let p;
    if (t < tUp) p = walkIn(tama, t, tAr + 0.4, [-0.55, 0.15], Math.PI / 2 + 0.35, 0.55, { speed: 0.18, seed: 1, after: tt => A.handsOnHips(tt, 1) });
    else { tama.root.position.set(0.2, box.top * up, 0.1); tama.root.rotation.y = 0.15 * (1 - up); p = t < tHom - 0.4 ? A.handsOnHips(t, 1) : A.point(t, 1, 0, 8, 'R'); p.lift = 0.1 * Math.sin(Math.PI * up); }
    K.act(tama, p, t, { mouth: t > tHom - 0.5 ? [0.7, 0.2] : [0.2, 0.6], eye: 0.25, smile: 0.4 });
    AR.tick?.(t);
    return U.film(t) + U.leader(t, tAr + 0.15, tCh + 0.1, 'tamamoB', { side: 'r' }) + U.bubble(ctx, [0.2, 1.95, 0.1], '¡¿A quién mirás desde arriba?!', fade(t, tHom - 0.5, tCh + 0.1, 0.15), { size: 34 });
  };

  // ================================================================ Switzerland: Silence Suzuka keeps it neutral and quiet
  const CH = S.country('ch'), suz = K.leader(CH, 'suzukaB', 0, 0, 0);
  const actCH = t => {
    const sh = ss(tSil - 0.4, tSil, t);
    K.act(suz, M.mix(A.stand(t, 1, { amt: 0.5 }), A.shush(t, 1, 1), sh), t, { smile: 0.4, eye: 0.35 });
    CH.tick?.(t);
    return U.film(t) + U.leader(t, tCh + 0.15, tMc + 0.1, 'suzukaB', { side: 'l' }) + emoji(ctx, [0.4, 1.7, 0], '🤫', fade(t, tSil, tMc + 0.1, 0.2), 70);
  };

  // ================================================================ Monaco: Twin Turbo, full throttle… until the tank is empty
  const MC = S.country('mc'), turbo = K.leader(MC, 'turbo', -9, 0.4, Math.PI / 2);
  const tGo = tMc + 0.35, runLen = 13.5;
  const actMC = t => {
    const tr = M.travel(t, tGo, runLen / turbo.unit, 1.25, 0.25);
    const p = walkIn(turbo, t, tGo, [-9, 0.4], Math.PI / 2, runLen, { speed: 1.25, run: 1, seed: 2, acc: 0.25, after: tt => A.winded(tt, 2, ss(tr.T, tr.T + 0.5, tt)) });
    K.act(turbo, p, t, { mouth: t < tr.T ? [0.6, 0.8] : [0.5, -0.3], eye: t < tr.T ? 0.2 : 0.75 });
    MC.tick?.(t);
    const fuel = 1 - ss(tGo, tGas, t);
    return U.film(t) + U.leader(t, tMc + 0.15, tVel, 'turbo', { side: 'r' }) + U.fuel(t, tVel - 0.4, ctx.dur + 1, fuel, { x: 1640, y: 120 })
      + U.bubble(ctx, [turbo.root.position.x, 1.7, 0.4], '¡TURBO A FONDO!', fade(t, tGo, tVel + 0.6, 0.15), { size: 34 })
      + emoji(ctx, [turbo.root.position.x, 1.75, 0.4], '💨', fade(t, tGas + 0.1, ctx.dur + 1, 0.2), 60);
  };

  const sfx = [
    { t: tBai, type: 'drums', dur: tBr - tBai, vol: 0.35 }, { t: tBr, type: 'waves', dur: tAr - tBr, vol: 0.3 }, { t: tDest - 0.2, type: 'sting', vol: 0.25 },
    { t: tUp, type: 'thud', vol: 0.4 }, { t: tHom - 0.5, type: 'shout', vol: 0.3 }, { t: tCh, type: 'wind', dur: tMc - tCh, vol: 0.25 },
    { t: tMc, type: 'harbor', dur: ctx.dur - tMc, vol: 0.25 }, { t: tGo, type: 'whoosh', vol: 0.4 }, { t: tGo + 0.2, type: 'steps', dur: 3.2, vol: 0.4 }, { t: tGas, type: 'sting2', vol: 0.3 },
  ];
  const shots = [
    { t0: 0, set: CO, p0: [1.7, 1.3, 3.0], l0: [-0.4, 1.0, -0.2], p1: [1.3, 1.25, 2.6], l1: [-0.3, 1.0, -0.1], fov0: 40, act: actCO },
    { t0: tBr, set: BR, p0: [-1.3, 0.8, 2.9], l0: [0, 1.3, -0.4], p1: [-1.0, 0.85, 2.5], l1: [0, 1.35, -0.4], fov0: 42, act: actBR },
    { t0: tAr, set: AR, p0: [1.6, 0.95, 3.2], l0: [0, 1.0, 0], p1: [1.2, 0.9, 2.8], l1: [0.1, 1.2, 0.1], fov0: 42, act: actAR },
    { t0: tCh, set: CH, p0: [-1.5, 1.3, 2.6], l0: [0, 1.15, -0.2], p1: [-1.1, 1.3, 2.2], l1: [0, 1.15, -0.2], fov0: 40, act: actCH },
    { t0: tMc, set: MC, p0: [-6.5, 1.2, 4.8], l0: [-6, 0.9, 0.4], p1: [3.8, 1.2, 4.6], l1: [4.5, 0.85, 0.4], fov0: 40, ease: 'inOut', act: actMC },
  ];
  const inst = { scene: CO, scenes: [CO, BR, AR, CH, MC], sfx };
  S.bakeAll(inst.scenes);
  inst.update = t => run(inst, ctx, shots, t);
  return inst;
}
