import * as THREE from 'three';
import * as C from '../lib/chars.js';
import * as P from '../lib/props.js';
import * as G from '../lib/gear.js';
import * as F from '../lib/fx.js';
import { stage, aimSun, mood } from '../lib/stage.js';
import { camPath, ss, clamp, along, track, yawTo, lerp } from '../lib/util.js';
import { cast, chapter, badge, label, partTimes, villager } from '../lib/kit.js';

export function build(ctx) {
  const L = ctx.L;
  const scene = stage({ skyTop: '#5c8fd0', skyHor: '#e8e2c8', groundA: '#9cb86a', groundB: '#86a556', fog: ['#e2dfc6', 25, 110],
    sunPos: [6, 12, 7], sun: 2.6, shadow: 12, seed: 61 });
  const env = new THREE.Group(); scene.add(env);
  // rice paddies + village huts around a plaza
  for (let i = 0; i < 8; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.06, 4), new THREE.MeshStandardMaterial({ color: i % 2 ? '#79a85a' : '#86b866', roughness: 0.4 }));
    p.position.set(-24 + (i % 4) * 6, 0.03, -16 - Math.floor(i / 4) * 4.6); env.add(p); }
  const hutPos = [[-5.5, -3.5], [-1.5, -5.6], [3, -5], [6.2, -2], [-6.5, 1.8], [6.5, 3]];
  hutPos.forEach(([x, z], i) => { const h = P.hut(1.15); h.position.set(x, 0, z); h.rotation.y = yawTo([x, z], [0, 0]); env.add(h); });
  const well = new THREE.Group(); well.add(P.at(P.cyl(0.55, 0.6, 0.5, '#9a958a', 12), 0, 0.25, 0)); well.position.set(0.5, 0, -1.5); env.add(well);
  P.scatter(env, (r, i) => (i % 2 ? P.palm(1 + r() * 0.4, i) : P.roundTree(1.2 + r() * 0.4, '#4f8f3a', i)), 40, [-30, -12, 30, 18], 62, [[0, 0, 9.5]]);
  P.scatter(env, (r, i) => P.roundTree(1.3 + r() * 0.5, '#3f7f35', i), 60, [-40, -40, 40, -22], 63);
  const basket = P.crate(0.26, '#c7a25a'); scene.add(basket);

  // villagers (straw hats) + guerrillas among them
  const vpos = [[-2.6, 0.6], [2.2, 1.4], [-0.8, 2.4], [3.6, -1.0], [-3.8, -1.2], [1.0, 3.6]];
  const vil = vpos.map(([x, z], i) => { const c = villager(cast(scene, 'doto', null, x, z)); c.home = [x, z]; c.ph = i * 1.3; return c; });
  const g = [cast(scene, 'oguri', G.guerrilla, -0.6, 0.4), cast(scene, 'tamamo', G.guerrilla, 1.4, -0.4), cast(scene, 'cafe', G.guerrilla, 0.4, 1.8)];
  g.forEach(c => c.home = [c.root.position.x, c.root.position.z]);
  // a recruit: a villager who takes up a scarf
  const recruitScarf = P.bandana('#3f6b2e'); vil[2].attach('chest', recruitScarf, [0, 0.495, -0.01]); recruitScarf.visible = false;
  const recruitHat = vil[2].root.getObjectByProperty('type', 'Group'); // set below
  const hats = vil.map(v => { let h = null; v.j.head.bone.traverse(o => { if (!h && o.children.length && o.children[0].geometry?.type === 'ConeGeometry') h = o; }); return h; });
  const patrol = cast(scene, 'mcqueen', G.army, 9, 6, 0);
  const icons = ['🍚', '🏠', '🙋', '📍'].map(e => { const b = F.bubble(e, { font: 130 }); scene.add(b); return b; });
  const bang = F.bubble('!'); scene.add(bang);
  const sweat = F.bubble('💦', { bg: null, font: 170 }); scene.add(sweat);

  const parts = ['Locals give food,', 'shelter,', 'new recruits,', 'and most importantly, information: where the enemy is, and where it\'s going.'];
  const pt = partTimes(L[2], parts);
  const tTurn = L[3].t0 + 0.3;
  const sfx = [{ t: 0.3, type: 'sting' }, ...pt.map(t => ({ t: t + 0.1, type: 'pop' })), { t: tTurn + 1.6, type: 'pop' }, { t: tTurn, type: 'tension' }];

  function update(t) {
    const lose = ss(tTurn, tTurn + 2.0, t);
    mood(scene, { sun: lerp(2.6, 1.6, lose), sunColor: lose > 0.5 ? '#ffd2b0' : '#fff1dc', hemi: lerp(1.2, 0.8, lose) });
    // villagers mill around; at "lose support" they turn their backs and walk away
    vil.forEach((c, i) => {
      const [hx, hz] = c.home;
      let x = hx + 0.5 * Math.sin(t * 0.35 + c.ph), z = hz + 0.4 * Math.cos(t * 0.3 + c.ph);
      let p = { ...C.walk(t, 0.55, c.ph) };
      let yaw = Math.atan2(0.5 * 0.35 * Math.cos(t * 0.35 + c.ph), -0.4 * 0.3 * Math.sin(t * 0.3 + c.ph));
      if (t > pt[0] - 0.4 && t < tTurn) { // gather around the guerrillas, attentive
        x = lerp(x, hx * 0.8, 0.5); z = lerp(z, hz * 0.8, 0.5); p = C.idle(t, c.ph); yaw = yawTo([x, z], [0.2, 0.6]);
      }
      if (i === 0 && t > pt[0] - 0.6 && t < pt[1] + 0.3) { x = -1.6; z = 0.9; yaw = yawTo([x, z], [-0.6, 0.4]); p = C.offer(t, c.ph, ss(pt[0] - 0.4, pt[0], t)); }
      if (i === 2 && t > pt[2] - 0.2 && t < tTurn) { p = C.cheer(t, c.ph); }
      if (i === 3 && t > pt[3] - 0.4 && t < tTurn) { x = 2.2; z = -0.1; yaw = yawTo([x, z], [1.4, -0.4]); p = C.idle(t, c.ph); p.head = [10, 0, 18]; p.chest = [12, 0, 6]; }
      if (t >= tTurn) {
        const k = ss(tTurn, tTurn + 0.6, t), d = Math.max(0, t - tTurn - 0.6) * 1.3;
        const away = Math.atan2(hx, hz);
        x = hx + Math.sin(away) * d; z = hz + Math.cos(away) * d; yaw = away;
        p = d > 0 ? C.walk(t, 0.8, c.ph) : C.idle(t, c.ph); if (i === 2) recruitScarf.visible = false;
      }
      c.root.position.set(x, 0, z); c.root.rotation.y = yaw;
      if (i === 2) { recruitScarf.visible = t > pt[2] && t < tTurn; if (hats[2]) hats[2].visible = !(t > pt[2] && t < tTurn); }
      c.apply(p);
      c.setFace(t >= tTurn ? 'flat' : (i === 2 && t > pt[2] && t < tTurn ? 'sparkle' : C.blinkEye(t, c.ph)), t >= tTurn ? 'frown' : (i === 3 && t > pt[3] ? 'small' : 'smile'));
    });
    // basket: in villager 0's hands, then to Oguri
    { const v = vil[0].root.position, o = g[0].root.position; const k = ss(pt[1] - 0.6, pt[1] - 0.1, t);
      basket.visible = t > pt[0] - 0.4 && t < tTurn; basket.position.set(lerp(v.x + 0.35, o.x - 0.3, k), 0.33, lerp(v.z + 0.1, o.z + 0.2, k)); }
    // guerrillas
    g.forEach((c, i) => {
      const [hx, hz] = c.home;
      let p = { ...C.idle(t, c.seed), gun: 'back' }, yaw = yawTo([hx, hz], [0, 0]) + Math.PI;
      if (t < pt[0] - 0.5) { // fish in the sea: wander with the crowd
        const x = hx + 0.6 * Math.sin(t * 0.4 + i * 2), z = hz + 0.5 * Math.cos(t * 0.33 + i);
        c.root.position.set(x, 0, z); yaw = Math.atan2(0.6 * 0.4 * Math.cos(t * 0.4 + i * 2), -0.5 * 0.33 * Math.sin(t * 0.33 + i)); p = { ...C.walk(t, 0.55, i), gun: 'back' };
      }
      if (i === 0 && t > pt[0] - 0.6 && t < tTurn) { yaw = yawTo([c.root.position.x, c.root.position.z], [-1.6, 0.9]); p = { ...C.offer(t, c.seed, ss(pt[1] - 0.6, pt[1] - 0.2, t)), gun: 'back' }; }
      if (i === 1 && t > pt[3] - 0.4 && t < tTurn) { yaw = yawTo([c.root.position.x, c.root.position.z], [2.2, -0.1]); p.head = [6, 0, -10]; }
      if (t >= tTurn) { p = { ...C.crouch(t, c.seed, 0.25), gun: 'low' }; yaw = yawTo([c.root.position.x, c.root.position.z], [3.6, 4.2]); }
      c.root.rotation.y = yaw; c.apply(p);
      c.setFace(t >= tTurn + 1.4 ? 'shock' : C.blinkEye(t, c.seed), t >= tTurn + 1.4 ? 'wavy' : (t > pt[0] ? 'smile' : 'neutral'));
    });
    // patrol shows up
    { const d = Math.max(0, t - (tTurn + 0.6)) * 1.8, pos = along([[9, 7], [3.6, 4.2]], d);
      patrol.root.position.set(pos.x, 0, pos.z); patrol.root.rotation.y = pos.done ? yawTo([3.6, 4.2], [0, 0.5]) : pos.yaw; patrol.root.visible = t > tTurn + 0.5;
      patrol.apply(pos.done ? { ...C.point(t, 2, 0), gun: 'none' } : { ...C.walkArmed(t, 1, 0), gun: 'low' }); patrol.setFace('open', pos.done ? 'open' : 'neutral');
      bang.position.set(patrol.root.position.x, 0, patrol.root.position.z); F.popSprite(bang, t, tTurn + 1.6, 99, 0.42, 1.55); }

    const anchors = [vil[0].root.position, hutPos[0], vil[2].root.position, vil[3].root.position];
    icons.forEach((b, i) => { const a = anchors[i]; const ax = a.x ?? a[0], az = a.z ?? a[1]; b.position.set(ax, 0, az); F.popSprite(b, t, pt[i], i === 3 ? tTurn : pt[i] + 2.4, 0.5, i === 1 ? 2.4 : 1.6); });
    sweat.position.set(g[1].root.position.x + 0.3, 0, g[1].root.position.z); F.popSprite(sweat, t, tTurn + 1.4, 99, 0.36, 1.35);

    camPath(ctx.camera, [
      { t: 0, p: [0, 7, 13], l: [0, 0.5, 0], fov: 40 },
      { t: L[1].t0, p: [0, 9.5, 8.5], l: [0.2, 0, 0.6], fov: 40 },
      { t: L[1].t1, p: [1.2, 8.5, 8.0], l: [0.4, 0, 0.6], fov: 40 },
      { t: pt[0] - 0.2, p: [-2.0, 1.3, 3.6], l: [-1.1, 0.6, 0.6], fov: 36 },
      { t: pt[2] - 0.3, p: [-1.4, 1.5, 4.4], l: [-0.6, 0.65, 0.9], fov: 38 },
      { t: pt[3] - 0.1, p: [3.6, 1.4, 2.6], l: [1.8, 0.65, -0.2], fov: 36 },
      { t: tTurn, p: [4.0, 1.6, 3.2], l: [1.6, 0.6, 0.0], fov: 38 },
      { t: ctx.dur, p: [-0.6, 5.0, 10.5], l: [1.6, 0.4, 1.4], fov: 42 },
    ], t);
    aimSun(scene, 0, 0);

    let html = chapter(t, 3, 'The people', 0.3, L[1].t0 + 0.6);
    const kf = ss(L[1].t0 + 0.8, L[1].t0 + 1.2, t) * (1 - ss(pt[0] - 0.8, pt[0] - 0.4, t));
    html += label(ctx, [g[0].root.position.x, 1.5, g[0].root.position.z], '🐟 Guerrilla = fish', 'g', kf);
    html += label(ctx, [vil[4].root.position.x, 1.5, vil[4].root.position.z], '🌊 People = sea', 'n', ss(L[1].t0 + 2.0, L[1].t0 + 2.4, t) * (1 - ss(pt[0] - 0.8, pt[0] - 0.4, t)));
    const names = ['Food', 'Shelter', 'Recruits', 'Information'];
    const kl = ss(pt[0], pt[0] + 0.3, t) * (1 - ss(tTurn - 0.3, tTurn, t));
    if (kl > 0) html += `<div class="list" style="opacity:${kl};left:72px;top:58%">${names.map((n, i) => `<div class="i" style="font-size:40px;opacity:${0.25 + 0.75 * ss(pt[i], pt[i] + 0.3, t)}"><div class="n" style="width:54px;height:54px;font-size:28px">${i + 1}</div>${n}</div>`).join('')}</div>`;
    html += badge(t, 'Intel', 'Patrol at the bridge, 6 AM', 'Locals see everything and tell the guerrillas', pt[3] + 1.4, tTurn);
    html += badge(t, 'Without the people', 'Nowhere to hide', 'No food, no shelter, no warning', tTurn + 1.8, ctx.dur);
    return html;
  }
  return { scene, update, sfx };
}
