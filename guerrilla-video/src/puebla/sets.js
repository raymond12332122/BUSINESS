// Sets for the Puebla video.
import * as THREE from 'three';
import * as LP from '../lib/props.js';
import * as X from '../mx/props.js';
import * as N from '../narco/props.js';
import * as S from '../narco/sets.js';
import * as P from './props.js';

// ------------------------------------------------------------ small-town street at dawn (Esperanza), Pico de Orizaba behind
export function townStreet(light = 'dawn') {
  const s = S.nStage(light, ['#a8a090', '#9c9484'], { seed: 201 });
  S.road(s, { w: 7, len: 140, color: '#4a4a48' }); S.sidewalk(s, -4.6, 140, 2.0); S.sidewalk(s, 4.6, 140, 2.0);
  for (const side of [-1, 1]) { const row = P.townRow(11, { seed: 210 + side }); row.position.set(side * 7.1, 0, -12); row.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; s.add(row); }
  const ch = X.cathedral(); ch.scale.setScalar(0.75); ch.position.set(0, 0, -46); s.add(ch);
  const v = X.volcano(48, 44, true); v.position.set(-30, -2, -170); s.add(v);
  s.add(X.sierra({ z: -120, depth: 40, height: 14, seed: 202, base: '#6a6a5e', top: '#8a8a7a' }));
  for (let i = 0; i < 5; i++) for (const sx of [-1, 1]) { const l = N.streetLight(false, 4.6); l.position.set(sx * 4.2, 0, 14 - i * 11); l.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2; s.add(l); }
  return s;
}
// ------------------------------------------------------------ Pemex pipeline right-of-way through corn fields (Triángulo Rojo)
export function ductField(light = 'night') {
  const night = S.isNight(light);
  const s = S.nStage(light, night ? ['#2e2a20', '#2a261c'] : ['#7a6a4a', '#706044'], { seed: 220 }); if (night) S.stars(s);
  s.add(X.sierra({ z: -90, depth: 40, height: 18, seed: 221, base: night ? '#1c2030' : '#6a6a52', top: night ? '#262c40' : '#8a8a72' }));
  s.add(X.field(-34, -46, -4.6, 6, { kind: 'corn', spacing: 0.6, seed: 222, height: 1.25 }));
  s.add(X.field(4.6, -46, 34, 6, { kind: 'corn', spacing: 0.6, seed: 223, height: 1.25 }));
  s.add(LP.at(LP.box(9, 0.02, 80, night ? '#3a3022' : '#6a5838'), 0, 0.011, -10));
  for (let i = 0; i < 9; i++) { const m = P.pipeMarker(); m.position.set(-3.4, 0, 14 - i * 8); m.rotation.y = 0.3; s.add(m); }
  const tm = P.toma(); tm.position.set(0.2, 0, 0); s.add(tm); s.toma = tm;
  const lamp = new THREE.PointLight('#ffd9a0', night ? 12 : 0, 11, 1.4); lamp.position.set(1.0, 2.0, 1.6); s.add(lamp); s.lamp = lamp;
  if (night) { s.userData.hemi.intensity = 1.0; s.userData.sun.intensity = 0.75; }
  return s;
}
// ------------------------------------------------------------ evidence yard: seized weapons, drones, jammers and armoured SUVs
export function evidenceYard() {
  const s = S.nStage('day', ['#7e7a72', '#76726a'], { seed: 230 });
  s.add(LP.at(LP.box(34, 0.02, 22, '#86827a'), 0, 0.011, -3));
  const wt = N.canvasTex(1024, 256, (x, W, H) => { for (let i = 0; i < 64; i++) { x.fillStyle = i % 2 ? '#8a9096' : '#9ea4aa'; x.fillRect(i * W / 64, 0, W / 64, H); } });
  wt.wrapS = THREE.RepeatWrapping; wt.repeat.set(3, 1);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(34, 6), new THREE.MeshStandardMaterial({ map: wt, roughness: 0.6, metalness: 0.2 })); wall.position.set(0, 3, -9); s.add(wall);
  s.tables = [-2.5, 0, 2.5].map(x => { const t = P.table(2.2, 0.95); t.position.set(x, 0, -0.6); s.add(t); return t; });
  const top = 0.75;
  for (let i = 0; i < 6; i++) { const r = LP.rifle('#2e3138', '#2e3138'); r.scale.setScalar(1.9); r.rotation.set(0, Math.PI / 2, Math.PI / 2); r.position.set(-3.1, top + 0.05, -0.95 + i * 0.13 * 2.2); s.add(r); }
  for (let i = 0; i < 2; i++) { const b = P.barrett(); b.scale.setScalar(1.7); b.rotation.set(0, Math.PI / 2 + 0.05, Math.PI / 2); b.position.set(-0.3, top + 0.08, -0.8 + i * 0.6); s.add(b); }
  for (let i = 0; i < 2; i++) { const d = LP.drone(); d.scale.setScalar(1.6); d.position.set(1.9 + i * 0.7, top + 0.06, -0.8); s.add(d); }
  for (let i = 0; i < 2; i++) { const j = P.jammer(); j.position.set(2.0 + i * 0.75, top, -0.3); s.add(j); }
  [[-5.5, -5.2, 0.15], [5.6, -5.0, -0.2]].forEach(([x, z, r]) => { const v = N.suv('#141518'); v.position.set(x, 0, z); v.rotation.y = r; s.add(v); });
  s.userData.sun.intensity = 1.7; s.userData.hemi.intensity = 1.0;
  return s;
}
// ------------------------------------------------------------ Puebla's zócalo: cathedral, portales, trees and a fountain
export function pueblaZocalo(light = 'golden') {
  const s = S.nStage(light, ['#b8ad98', '#ada28c'], { seed: 240 });
  s.add(LP.at(LP.box(30, 0.02, 30, '#c8bca6'), 0, 0.011, -6));
  const cat = P.cathedralPuebla(); cat.position.set(0, 0, -27); s.add(cat); s.cathedral = cat;
  const cols = ['#c98a4a', '#d9a35a', '#b8643a', '#e0b070'];
  for (const side of [-1, 1]) for (let k = 0; k < 2; k++) { const p = P.portal(14, cols[(k + (side > 0 ? 2 : 0)) % 4], k + side); p.position.set(side * 17.5, 0, -12 + k * 15); p.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; s.add(p); }
  const f = P.fountain(); f.position.set(0, 0, -4); s.add(f);
  LP.scatter(s, (r, i) => LP.roundTree(1.3 + r() * 0.4, ['#3f7a32', '#4a8a3a', '#356a2c'][i % 3], i), 18, [-13, -16, 13, 8], 241, [[0, -4, 6], [0, 6, 5], [0, -12, 5], [0, -2, 4]]);
  for (let i = 0; i < 6; i++) for (const sx of [-1, 1]) { const l = N.streetLight(S.isNight(light), 4.0); l.position.set(sx * 3.2, 0, 6 - i * 4.4); s.add(l); }
  if (S.isNight(light)) {   // the cathedral is floodlit at night
    for (const sx of [-1, 1]) { const sp = new THREE.SpotLight('#ffd09a', 260, 60, 0.42, 0.6, 1.2); sp.position.set(sx * 7, 0.6, -15); sp.target.position.set(sx * 2.5, 9, -25.5); s.add(sp, sp.target); }
    const up = new THREE.PointLight('#ffcf8a', 30, 18, 1.2); up.position.set(0, 3, -20); s.add(up);
  }
  return s;
}
// ------------------------------------------------------------ Sierra Norte road at the Veracruz state line (Tenampulco)
export function sierraBorder(light = 'overcast') {
  const s = S.nStage(light, ['#5a7044', '#526640'], { seed: 250, bumps: 0.5 });
  s.add(X.sierra({ z: -75, depth: 40, height: 26, seed: 251, base: '#3e5a38', top: '#5e7a52' }));
  s.add(X.sierra({ z: -42, depth: 24, height: 11, seed: 252, base: '#4a6a40', top: '#6a8a58' }));
  S.road(s, { w: 7, len: 160, color: '#4a4a48' });
  LP.scatter(s, (r, i) => i % 3 ? LP.roundTree(1.7 + r() * 0.8, ['#2f6a32', '#3a7a3a', '#2a5a2a'][i % 3], i) : LP.pine(1.8 + r() * 0.6, '#24502c', i), 170, [-60, -80, 60, 30], 253, [[0, 0, 9], [0, -25, 6], [0, 20, 9], [4, 9, 7]]);
  const sg = P.roadSign('LÍMITE ESTATAL', 'PUEBLA · VERACRUZ'); sg.position.set(5.6, 0, -7); sg.rotation.y = -0.25; s.add(sg);
  const b = N.barrier(3.4); b.position.set(-1.75, 0, 0.5); s.add(b);
  for (let i = 0; i < 5; i++) { const c = N.cone(); c.position.set(-3.2 + i * 1.2, 0, 3.2); s.add(c); }
  const a = N.patrol('sedena'); a.position.set(-5.4, 0, -2.5); a.rotation.y = 0.5; s.add(a); s.army = a;
  const p = N.patrol('policia'); p.position.set(5.6, 0, 2.6); p.rotation.y = -0.6; s.add(p); s.patrol = p;
  return s;
}
// ------------------------------------------------------------ village municipal police station
export function villageStation(light = 'golden') {
  const s = S.nStage(light, ['#b9a98e', '#ad9d82'], { seed: 260 });
  s.add(LP.at(LP.box(90, 0.02, 6, '#5a5650'), 0, 0.011, 4.2));
  s.add(X.sierra({ z: -80, depth: 40, height: 16, seed: 261, base: '#6a7a5a', top: '#8a9a72' }));
  const st = P.copStation(); st.position.set(0, 0, -1.6); s.add(st);
  [[-6.5, '#d9b48a'], [-10.2, '#e2c9a2'], [6.6, '#c9967a'], [10.4, '#d6c08f']].forEach(([x, c], i) => { const h = X.adobe(3.4, 3.0, 2.6, c, i + 3); h.position.set(x, 0, -1.6); s.add(h); });
  const p = N.patrol('policia'); p.position.set(-3.6, 0, 2.0); p.rotation.y = Math.PI / 2 - 0.2; s.add(p); s.patrol = p;
  LP.scatter(s, (r, i) => LP.roundTree(1.4 + r() * 0.5, '#4a7a3a', i), 20, [-40, -30, 40, -6], 262, [[0, -2, 10]]);
  return s;
}
// ------------------------------------------------------------ state government press room
export function pressRoom(title = 'Gobierno de Puebla', sub = 'Estrategia "Cero Impunidad"') {
  const s = S.mananera({ podiumText: 'GOBIERNO DE PUEBLA' });
  const t = N.canvasTex(1024, 512, (x, W, H) => { const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#5a1f2a'); g.addColorStop(1, '#2a0f16'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = '#d4af37'; x.fillRect(W / 2 - 60, 318, 120, 5); x.textAlign = 'center'; x.fillStyle = '#ffffff'; x.font = '900 60px Inter'; x.fillText(title, W / 2, 396); x.fillStyle = '#e8d9b0'; x.font = '700 32px Inter'; x.fillText(sub, W / 2, 448); });
  s.screen.material = new THREE.MeshBasicMaterial({ map: t });
  return s;
}
