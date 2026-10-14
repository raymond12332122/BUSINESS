// Costumes for the First World War video: chibis as French poilus (1914 red trousers and 1915+ horizon blue),
// British Tommies, German soldiers (Pickelhaube 1914, Stahlhelm 1916+), Austro-Hungarians, Americans, Ottomans,
// ANZACs, Indian and African colonial troops, nurses, Sarajevo civilians and the period's leaders (as stand-ins).
// Uniform colours come from the Napoleonic recolouring shader (dark -> mid -> light, gold accents).
import * as THREE from 'three';
import * as P from '../lib/props.js';
import * as G from '../lib/gear.js';
import { mesh, box, cyl, at } from '../lib/props.js';
import { hideEars, flattenAhoge, generic, wearHat, epaulettes, crossbelts, glasses, medals, OUTFITS as MXO } from '../mx/kit.js';
import { uniformize, musket, dropHairBits, tophat, bicorne } from '../napo/kit.js';
import * as RK from '../rusia/kit.js';
import * as C_ from '../lib/chars.js';
export { pose, freeze, blobShadow, CASTING } from '../rusia/kit.js';
export { hideEars, generic };

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.82, ...o });
const brass = () => std('#c9a227', { metalness: 0.6, roughness: 0.35 });
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function lathe(profile, color, seg = 32, opts = {}) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg);
  const m = mesh(g, typeof color === 'string' ? std(color, { side: THREE.DoubleSide, ...opts }) : color); m.castShadow = true; return m;
}
// Flat plate (half ellipse) for visors/peaks: w wide, d deep, pointing to +z, tilted down by `tilt`.
function peak(w, d, color, tilt = 0.25, thick = 0.014) {
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.absellipse(0, 0, w / 2, d, Math.PI, 0, true);
  const g = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: false, curveSegments: 20 }); g.rotateX(Math.PI / 2); g.translate(0, thick / 2, 0);
  const m = mesh(g, std(color, { roughness: 0.5 })); m.rotation.x = tilt; return m;
}

// ------------------------------------------------------------ palettes (dark -> main -> light trims, gold accents)
export const PAL = {
  ...RK.PAL,
  poilu14: { dark: '#7a1e1c', mid: '#2c3d6e', light: '#45598a', gold: '#c9a227' },       // capote gris-bleu, pantalon garance
  poilu: { dark: '#36475b', mid: '#7890a8', light: '#c4d0dc', gold: '#c9a227' },          // bleu horizon
  khaki: { dark: '#38321f', mid: '#7a6e48', light: '#c6b88e', gold: '#b89a4a' },
  feld: { dark: '#2c2e2a', mid: '#6b6f63', light: '#bfbfb2', gold: '#b8a04a' },
  hecht: { dark: '#3a4148', mid: '#8a97a2', light: '#d2d8dc', gold: '#c9a227' },          // Austro-Hungarian pike grey
  od: { dark: '#2c2a1a', mid: '#6b6540', light: '#bcb38a', gold: '#b89a4a' },             // US olive drab
  ottoman: { dark: '#3d3522', mid: '#8c7c52', light: '#d3c69c', gold: '#b89a4a' },
  tirailleur: { dark: '#141c33', mid: '#33426e', light: '#c9c2a8', gold: '#c0272d' },
  arab: { dark: '#8f846e', mid: '#e6dcc4', light: '#fbf8f0', gold: '#b8342f' },
  nurse: { dark: '#9a9890', mid: '#eceae2', light: '#ffffff', gold: '#c0272d' },
  ffGeneral: { dark: '#16161c', mid: '#7f9dbb', light: '#e8eef4', gold: '#d4af37' },      // Franz Ferdinand's light blue tunic
  sophie: { dark: '#b0a898', mid: '#efe9dc', light: '#ffffff', gold: '#c0272d' },
  suitDark: { dark: '#101013', mid: '#26262c', light: '#e8e4da', gold: '#8a7a55' },
  suitGrey: { dark: '#1e1f22', mid: '#4b4c50', light: '#ece8de', gold: '#8a7a55' },
  tweed: { dark: '#2a2016', mid: '#6a5640', light: '#e6dcc6', gold: '#8a7a55' },
  summer: { dark: '#3a3226', mid: '#b4a684', light: '#f4efe2', gold: '#b08d3a' },
  dress1: { dark: '#7a7f8c', mid: '#cfd6e4', light: '#ffffff', gold: '#b8342f' },
  dress2: { dark: '#8a7a6a', mid: '#e6d6c2', light: '#ffffff', gold: '#3a6a8a' },
  dress3: { dark: '#5a4a5a', mid: '#a88aa8', light: '#f2ecf4', gold: '#c9a227' },
  fjWhite: { dark: '#8a8a86', mid: '#efede6', light: '#ffffff', gold: '#d4af37' },
  kaiser: { dark: '#24261f', mid: '#5f6458', light: '#8e9184', gold: '#d4af37' },
  foch: { dark: '#2e3c4e', mid: '#6f879f', light: '#d0d8e0', gold: '#e2bd45' },
  pershing: { dark: '#2a2818', mid: '#615c3a', light: '#c9c09a', gold: '#d4af37' },
  driver: { dark: '#1a1c20', mid: '#3c4048', light: '#d6d2c6', gold: '#c9a227' },
  navyOff: { dark: '#0a0f1e', mid: '#1a2442', light: '#f2f2f0', gold: '#d4af37' },
};
const uni = (r, p) => uniformize(r, PAL[p] || p);

// ------------------------------------------------------------ headgear (hat space: head ≈ radius 0.25, y=0 at the brow)
// Pickelhaube: leather (black, brass spike and plate) or with the grey field cover.
export function pickelhaube({ cover = true, plume = null } = {}) {
  const g = new THREE.Group(), col = cover ? '#7c7f70' : '#141414';
  g.add(lathe([[0.25, -0.01], [0.262, 0.05], [0.25, 0.13], [0.21, 0.2], [0.14, 0.25], [0.05, 0.275], [0, 0.28]], col, 32, { roughness: cover ? 0.9 : 0.35 }));
  const fv = peak(0.42, 0.13, col, 0.32); fv.position.set(0, 0.01, 0.2); g.add(fv);
  const rv = peak(0.4, 0.12, col, 0.45); rv.rotation.y = Math.PI; rv.position.set(0, 0.03, -0.2); g.add(rv);
  const sp = new THREE.Group(); sp.position.y = 0.27; g.add(sp);
  sp.add(at(mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.035, 12), cover ? std(col) : brass()), 0, 0.015, 0));
  sp.add(at(mesh(new THREE.ConeGeometry(0.024, 0.13, 10), cover ? std('#8a8c7c') : brass()), 0, 0.095, 0));
  if (!cover) { const pl = mesh(new THREE.CircleGeometry(0.075, 6), brass()); pl.position.set(0, 0.12, 0.245); pl.rotation.x = -0.32; pl.scale.y = 1.2; g.add(pl); }
  else { const n = box(0.07, 0.035, 0.005, '#a83a2a'); n.position.set(0, 0.11, 0.252); n.rotation.x = -0.32; g.add(n); }
  if (plume) { for (let i = 0; i < 7; i++) { const f = mesh(new THREE.SphereGeometry(0.045, 8, 6), std(plume)); const a = i / 7 * Math.PI * 2; f.scale.set(0.7, 2.2, 0.7); f.position.set(Math.cos(a) * 0.04, 0.42 - 0.02 * Math.abs(Math.sin(a)), Math.sin(a) * 0.04); f.rotation.set(Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4); g.add(f); } }
  return g;
}
// German steel helmet M1916 (coal scuttle): dome, flared skirt, short front peak, side lugs.
export function stahlhelm(color = '#565b52') {
  const g = new THREE.Group();
  g.add(lathe([[0.31, -0.13], [0.3, -0.1], [0.275, -0.07], [0.268, -0.03], [0.272, 0.04], [0.26, 0.12], [0.215, 0.2], [0.13, 0.26], [0.0, 0.282]], color, 36, { roughness: 0.6 }));
  const fp = peak(0.36, 0.09, color, 0.15, 0.016); fp.position.set(0, -0.025, 0.25); g.add(fp);
  for (const s of [-1, 1]) g.add(at(cyl(0.026, 0.026, 0.03, color, 10), s * 0.272, 0.08, 0.02, 0, 0, Math.PI / 2));
  return g;
}
// British Brodie helmet (also the US M1917): shallow bowl with a wide flat brim.
export function brodie(color = '#5a5838') {
  const g = new THREE.Group();
  g.add(lathe([[0.43, 0.0], [0.425, 0.012], [0.32, 0.03], [0.275, 0.06], [0.262, 0.12], [0.22, 0.19], [0.13, 0.225], [0.0, 0.235]], color, 36, { roughness: 0.6 }));
  return g;
}
// French Adrian helmet (M15): dome, crest, front and rear visors, grenade badge.
export function adrian(color = '#6c8199') {
  const g = new THREE.Group();
  g.add(lathe([[0.268, -0.01], [0.27, 0.05], [0.255, 0.13], [0.2, 0.205], [0.12, 0.25], [0, 0.265]], color, 36, { roughness: 0.55 }));
  const fv = peak(0.44, 0.14, color, 0.2); fv.position.set(0, 0.0, 0.2); g.add(fv);
  const rv = peak(0.46, 0.17, color, 0.28); rv.rotation.y = Math.PI; rv.position.set(0, 0.0, -0.2); g.add(rv);
  const cr = new THREE.Shape(); cr.moveTo(-0.2, 0); cr.quadraticCurveTo(0, 0.1, 0.2, 0); cr.lineTo(0.17, -0.02); cr.quadraticCurveTo(0, 0.06, -0.17, -0.02); cr.closePath();
  const cg = new THREE.ExtrudeGeometry(cr, { depth: 0.03, bevelEnabled: false }); cg.translate(0, 0, -0.015); cg.rotateY(Math.PI / 2);
  g.add(at(mesh(cg, std(color, { roughness: 0.5 })), 0, 0.235, 0));
  const b = mesh(new THREE.CircleGeometry(0.035, 12), std('#5a6a7c')); b.position.set(0, 0.12, 0.262); b.rotation.x = -0.35; g.add(b);
  return g;
}
// French kepi (1914): sloping drum with a coloured top, dark band and a black visor.
export function kepiFR({ top = '#b8342f', band = '#26335c', visor = '#141414', gold = 0 } = {}) {
  const g = new THREE.Group(), h = 0.24;
  const drum = mesh(new THREE.CylinderGeometry(0.2, 0.262, h, 28, 1, true), std(top, { side: THREE.DoubleSide })); drum.position.y = h / 2; g.add(drum);
  g.add(at(mesh(new THREE.CircleGeometry(0.2, 28), std(top)), 0, h, 0, -Math.PI / 2, 0, 0));
  const bd = mesh(new THREE.CylinderGeometry(0.24, 0.265, 0.09, 28, 1, true), std(band, { side: THREE.DoubleSide })); bd.position.y = 0.045; g.add(bd);
  for (let i = 0; i < gold; i++) { const r = mesh(new THREE.TorusGeometry(0.245 - i * 0.012, 0.007, 4, 28), brass()); r.rotation.x = Math.PI / 2; r.position.y = 0.11 + i * 0.035; g.add(r); }
  const v = peak(0.36, 0.13, visor, 0.32); v.position.set(0, 0.005, 0.23); g.add(v);
  g.rotation.x = -0.1; return g;
}
// Austro-Hungarian field cap (Feldkappe) with the front flap buttons and the imperial rosette.
export function feldkappe(color = '#8a97a2') {
  const g = new THREE.Group();
  g.add(lathe([[0.27, -0.01], [0.282, 0.05], [0.276, 0.12], [0.25, 0.17], [0.16, 0.185], [0, 0.19]], color, 32, { roughness: 0.95 }));
  g.add(at(box(0.32, 0.07, 0.02, color), 0, 0.045, 0.27));
  for (const s of [-1, 1]) g.add(at(mesh(new THREE.SphereGeometry(0.014, 8, 6), brass()), s * 0.05, 0.06, 0.282));
  const ros = mesh(new THREE.CircleGeometry(0.03, 14), brass()); ros.position.set(0, 0.125, 0.268); ros.rotation.x = -0.25; g.add(ros);
  const v = peak(0.32, 0.09, '#2a2a2a', 0.3); v.position.set(0, 0.0, 0.25); g.add(v);
  return g;
}
// Peaked service cap (British/US/officers): furazhka from the Russian kit with other colours.
export const serviceCap = (crown, band = crown, cockade = ['#c9a227', '#c9a227', '#c9a227']) => RK.furazhka({ crown, band, visor: '#3a2a1a', cockade });
// ANZAC slouch hat: wide brim pinned up on the left side.
export function slouchHat(color = '#8a7a58') {
  const g = new THREE.Group();
  const geo = new THREE.LatheGeometry([[0.4, 0], [0.39, 0.012], [0.27, 0.03], [0.255, 0.1], [0.23, 0.17], [0.16, 0.2], [0, 0.205]].map(([r, y]) => new THREE.Vector2(r, y)), 48);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), r = Math.hypot(x, z); if (r > 0.265 && y < 0.04) { const w = Math.pow(Math.max(0, x / r), 1.3); p.setY(i, y + (r - 0.265) * 2.0 * w); p.setX(i, x - (r - 0.265) * 0.5 * w); } }
  geo.computeVertexNormals();
  g.add(mesh(geo, std(color, { side: THREE.DoubleSide, roughness: 0.95 })));
  const band = mesh(new THREE.CylinderGeometry(0.258, 0.262, 0.045, 32, 1, true), std('#4a3a2a', { side: THREE.DoubleSide })); band.position.y = 0.055; g.add(band);
  const badge = mesh(new THREE.CircleGeometry(0.035, 10), brass()); badge.position.set(0.27, 0.16, 0.04); badge.rotation.y = Math.PI / 2 - 0.3; g.add(badge);
  return g;
}
// US campaign hat ("Montana peak").
export function campaignHat(color = '#8a7a52') {
  const g = new THREE.Group();
  g.add(lathe([[0.42, 0], [0.41, 0.01], [0.27, 0.025], [0.27, 0.04]], color, 36));
  const c = mesh(new THREE.ConeGeometry(0.27, 0.26, 4, 1, true), std(color, { side: THREE.DoubleSide })); c.rotation.y = Math.PI / 4; c.position.y = 0.16; g.add(c);
  return g;
}
// Indian Army turban (pagri) with a fan at the front.
export function turban(color = '#d6c49a', fan = null) {
  const g = new THREE.Group(), mat = std(color, { roughness: 0.95 });
  g.add(lathe([[0.275, -0.01], [0.29, 0.06], [0.285, 0.14], [0.25, 0.21], [0.16, 0.255], [0, 0.265]], mat));
  for (let i = 0; i < 4; i++) { const t = mesh(new THREE.TorusGeometry(0.27 - i * 0.035, 0.03, 6, 30), mat); t.rotation.set(Math.PI / 2 + (i % 2 ? 0.28 : -0.28), 0, i * 0.5); t.position.y = 0.05 + i * 0.05; g.add(t); }
  if (fan) { const f = mesh(new THREE.CircleGeometry(0.11, 14, 0, Math.PI), std(fan, { side: THREE.DoubleSide })); f.position.set(0, 0.25, 0.1); f.rotation.x = -0.2; g.add(f); }
  return g;
}
// Fez / chechia (red felt, black tassel).
export function fez(color = '#b8242a', tassel = '#141414', h = 0.2) {
  const g = new THREE.Group();
  g.add(at(mesh(new THREE.CylinderGeometry(0.17, 0.205, h, 24), std(color, { roughness: 0.95 })), 0, h / 2, 0));
  const ts = new THREE.Group(); ts.position.set(0, h, 0); g.add(ts);
  ts.add(at(cyl(0.006, 0.006, 0.12, tassel, 4), 0.05, -0.04, 0, 0, 0, 0.9));
  ts.add(at(mesh(new THREE.ConeGeometry(0.03, 0.09, 8), std(tassel)), 0.11, -0.1, 0, 0, 0, 0.3));
  return g;
}
// Ottoman kabalak: wrapped cloth helmet.
export function kabalak(color = '#9a8a5e') {
  const g = new THREE.Group(), mat = std(color, { roughness: 0.95 });
  g.add(at(mesh(new THREE.SphereGeometry(0.265, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat), 0, 0.0, 0));
  for (let i = 0; i < 4; i++) { const t = mesh(new THREE.TorusGeometry(0.255 - i * 0.04, 0.035, 6, 24), mat); t.rotation.set(Math.PI / 2 + 0.25 * (i % 2 ? 1 : -1), 0.3 * i, 0); t.position.y = 0.04 + i * 0.05; g.add(t); }
  return g;
}
// Bowler hat (Clemenceau, diplomats).
export function bowler(color = '#141416') {
  const g = new THREE.Group();
  g.add(lathe([[0.36, 0.03], [0.34, 0.0], [0.27, 0.02], [0.262, 0.08], [0.25, 0.16], [0.2, 0.22], [0.1, 0.25], [0, 0.255]], color, 32, { roughness: 0.5 }));
  return g;
}
// Straw boater with a dark band.
export function boater(color = '#e2cf98', band = '#1a1a2a') {
  const g = new THREE.Group();
  g.add(lathe([[0.4, 0], [0.4, 0.012], [0.26, 0.016], [0.26, 0.13], [0, 0.13]], color, 32, { roughness: 0.9 }));
  const b = mesh(new THREE.CylinderGeometry(0.262, 0.262, 0.04, 32, 1, true), std(band, { side: THREE.DoubleSide })); b.position.y = 0.04; g.add(b);
  return g;
}
// Franz Ferdinand's general's hat: black bicorne worn fore-and-aft under a cascade of green feathers.
export function plumedHat() {
  const g = new THREE.Group(), b = bicorne({ color: '#121214', trim: '#c9a227', cockadeCols: ['#c9a227', '#141414', '#c9a227'] }); g.add(b);
  const feather = std('#3f8a4a', { roughness: 0.9 }), dark = std('#2f6a3a', { roughness: 0.9 });
  for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2, ring = i % 2; const f = mesh(new THREE.SphereGeometry(0.045, 8, 6), ring ? dark : feather); f.scale.set(0.9, 0.55, 3.0);
    const r = 0.08 + ring * 0.05; f.position.set(Math.cos(a) * r, 0.27 - ring * 0.03, Math.sin(a) * r * 0.7); f.rotation.set(0, -a + Math.PI / 2, 0); f.rotateX(0.55 + ring * 0.25); g.add(f); }
  g.add(at(mesh(new THREE.SphereGeometry(0.08, 10, 8), feather), 0, 0.3, 0));
  return g;
}
// Lady's wide summer hat with feathers (Sophie, Sarajevo ladies).
export function ladyHat(color = '#f4f0e6', plume = '#ffffff', ribbon = '#c8b8a0') {
  const g = new THREE.Group();
  g.add(lathe([[0.46, 0.02], [0.45, 0.0], [0.3, 0.03], [0.27, 0.06], [0.26, 0.14], [0.2, 0.18], [0, 0.19]], color, 36, { roughness: 0.9 }));
  const rb = mesh(new THREE.CylinderGeometry(0.265, 0.268, 0.045, 32, 1, true), std(ribbon, { side: THREE.DoubleSide })); rb.position.y = 0.075; g.add(rb);
  for (let i = 0; i < 5; i++) { const f = mesh(new THREE.SphereGeometry(0.06, 8, 6), std(plume)); f.scale.set(0.6, 0.5, 2.0); f.position.set(-0.16 + i * 0.03, 0.17 + i * 0.012, -0.05 + i * 0.03); f.rotation.set(0.3, -0.8, 0); g.add(f); }
  return g;
}
// Nurse's veil with a red cross (and a white kerchief).
export function nurseVeil() {
  const g = new THREE.Group(), w = std('#f8f6f0', { side: THREE.DoubleSide, roughness: 0.95 });
  const d = mesh(new THREE.SphereGeometry(0.29, 28, 14, Math.PI / 2 + 0.7, Math.PI * 2 - 1.4, 0, Math.PI * 0.62), w); d.position.set(0, -0.08, -0.02); d.scale.set(1.05, 1.05, 1.1); g.add(d);
  const bd = mesh(new THREE.TorusGeometry(0.265, 0.03, 6, 28, Math.PI * 1.1), w); bd.rotation.set(-Math.PI / 2 + 0.2, 0, Math.PI * -0.05); bd.position.y = 0.04; g.add(bd);
  g.add(at(box(0.05, 0.016, 0.006, '#c0272d'), 0, 0.1, 0.27)); g.add(at(box(0.016, 0.05, 0.006, '#c0272d'), 0, 0.1, 0.271));
  return g;
}
// Keffiyeh with a black agal: a hood falling to the shoulders, face open.
export function keffiyeh(color = '#f4efe2', check = null) {
  const g = new THREE.Group();
  const tex = check ? canvasTex(128, 128, (x, W, H) => { x.fillStyle = color; x.fillRect(0, 0, W, H); x.strokeStyle = check; x.globalAlpha = 0.55; x.lineWidth = 2; for (let i = 0; i < W; i += 12) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(W, i); x.stroke(); } }) : null;
  if (tex) tex.repeat.set(3, 3), tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const mat = tex ? new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, side: THREE.DoubleSide }) : std(color, { side: THREE.DoubleSide, roughness: 0.95 });
  const cap = mesh(new THREE.SphereGeometry(0.29, 30, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), mat); cap.position.y = -0.02; cap.scale.set(1.06, 1.0, 1.06); g.add(cap);
  const drape = mesh(new THREE.CylinderGeometry(0.31, 0.4, 0.44, 30, 1, true, 0.85, Math.PI * 2 - 1.7), mat); drape.position.y = -0.23; g.add(drape);
  const agal = mesh(new THREE.TorusGeometry(0.29, 0.022, 6, 28), std('#141414')); agal.rotation.x = Math.PI / 2; agal.position.y = 0.1; g.add(agal);
  return g;
}
// Gas mask (worn over the face): rubberised face piece, two goggle eyes and a front filter can.
export function gasMask(color = '#4a4a3e') {
  const g = new THREE.Group();
  const f = mesh(new THREE.SphereGeometry(0.2, 20, 14, -Math.PI * 0.42, Math.PI * 0.84, Math.PI * 0.18, Math.PI * 0.62), std(color, { side: THREE.DoubleSide, roughness: 0.7 })); f.scale.set(1.15, 1.0, 0.75); g.add(f);
  for (const s of [-1, 1]) { const r = mesh(new THREE.TorusGeometry(0.052, 0.013, 6, 16), std('#2a2a24', { metalness: 0.4 })); r.position.set(s * 0.085, 0.04, 0.15); g.add(r);
    const gl = mesh(new THREE.CircleGeometry(0.048, 16), new THREE.MeshStandardMaterial({ color: '#9ab0b0', roughness: 0.1, metalness: 0.5 })); gl.position.set(s * 0.085, 0.04, 0.152); g.add(gl); }
  g.add(at(cyl(0.05, 0.055, 0.1, '#5a5a4a', 14), 0, -0.1, 0.17, Math.PI / 2 - 0.4, 0, 0));
  return g;
}

// ------------------------------------------------------------ small gear
export function pistol() {
  const g = new THREE.Group(), m = std('#1a1a1c', { metalness: 0.5, roughness: 0.4 });
  g.add(at(mesh(new THREE.BoxGeometry(0.022, 0.03, 0.11), m), 0, 0.012, 0.03)); g.add(at(mesh(new THREE.BoxGeometry(0.02, 0.06, 0.03), std('#3a2a1e')), 0, -0.025, -0.01, -0.25, 0, 0));
  return g;
}
export function bombGrenade() { const g = new THREE.Group(); g.add(at(mesh(new THREE.BoxGeometry(0.05, 0.07, 0.04), std('#1a1a1a')), 0, 0, 0)); g.add(at(cyl(0.004, 0.004, 0.04, '#c9a227', 4), 0, 0.05, 0)); return g; }
export function stickGrenade() { const g = new THREE.Group(); g.add(at(cyl(0.012, 0.012, 0.2, '#7a5a3a', 6), 0, 0, 0)); g.add(at(cyl(0.035, 0.035, 0.08, '#4a4e44', 12), 0, 0.12, 0)); return g; }
export function shovel() { const g = new THREE.Group(); g.add(at(cyl(0.012, 0.012, 0.55, '#7a5a3a', 6), 0, 0, 0)); g.add(at(box(0.11, 0.14, 0.012, '#5a5e60'), 0, -0.33, 0.0)); return g; }
export function pipe() { const g = new THREE.Group(); g.add(at(cyl(0.006, 0.006, 0.08, '#3a2a1e', 5), 0, 0, 0.04, Math.PI / 2, 0, 0)); g.add(at(cyl(0.017, 0.014, 0.035, '#5a3a24', 8), 0, 0.012, 0.085)); return g; }
export function bouquet() { const g = new THREE.Group(); for (let i = 0; i < 7; i++) g.add(at(mesh(new THREE.SphereGeometry(0.028, 8, 6), std(['#c0272d', '#f2f0e6', '#e86a8a'][i % 3])), (i % 3 - 1) * 0.03, 0.04 + (i % 2) * 0.02, (Math.floor(i / 3) - 1) * 0.025)); g.add(at(cyl(0.012, 0.02, 0.1, '#3a6a3a', 6), 0, -0.03, 0)); return g; }
export function giftBox(col = '#b8342f') { const g = new THREE.Group(); g.add(at(box(0.09, 0.07, 0.09, col), 0, 0, 0)); g.add(at(box(0.095, 0.075, 0.018, '#e8d79a'), 0, 0, 0)); g.add(at(box(0.018, 0.075, 0.095, '#e8d79a'), 0, 0, 0)); return g; }
export function canteen() { return at(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 14), std('#5a5a44')), 0, 0, 0, Math.PI / 2, 0, 0); }
// Light pack + bedroll on the back; webbing pouches on the belt.
export function pack(color = '#6a6448', roll = '#5a5a50') {
  const g = new THREE.Group(); g.add(at(box(0.24, 0.2, 0.1, color), 0, 0, 0)); g.add(at(mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.3, 10), std(roll)), 0, 0.12, 0, 0, 0, Math.PI / 2)); return g;
}
const rifle = (r, wood = '#6a4a2c') => r.equip(musket('#2e2f32', wood, true), G.HOLDS);
const HAIR_BITS = { tamamo: [[-0.219, 0.957, 0.168], [-0.197, 0.91, 0.112]], suzuka: [[-0.243, 0.921, 0.086], [-0.246, 0.83, 0.094], [-0.285, 0.852, 0.039], [-0.178, 0.875, 0.099]] };
const hat = (r, h, o) => { const w = wearHat(r, h, o); if (HAIR_BITS[r.key]) dropHairBits(r, HAIR_BITS[r.key]); if (o?.cap && r.key === 'tamamo') flattenAhoge(r, 0.02, /^Sp_He_Ribbon\d_[LR]_00/); return w; };
const HELM = { scale: 0.9, y: 0.86, tilt: -0.04, cap: true };
const CAP = { scale: 0.9, y: 0.86, tilt: -0.04, cap: true };
const pick = (r, arr) => arr[Math.floor(r.seed * 7) % arr.length];
const backpack = (r, c, roll) => r.attach('chest', pack(c, roll), [0, 0.39, -0.16]);

// ------------------------------------------------------------ outfits
export const OUTFITS = {
  ...RK.OUTFITS,
  // France
  poilu14: r => { generic(r, '#2e2418'); uni(r, 'poilu14'); hat(r, kepiFR({}), CAP); backpack(r, '#5a4a32', '#3a4a6a'); rifle(r); return r; },
  poilu: r => { generic(r, '#2e2418'); uni(r, 'poilu'); hat(r, adrian(), HELM); backpack(r, '#5a5a48', '#6a7a8a'); rifle(r); return r; },
  poiluMask: r => { OUTFITS.poilu(r); r.attach('head', gasMask('#5a5e52'), [0, 0.6, 0.12]); r.masked = true; return r; },
  foch: r => { generic(r, '#a8a8a8'); uni(r, 'foch'); hat(r, kepiFR({ top: '#b8342f', band: '#1e2a48', gold: 2 }), CAP); r.attach('chest', medals(), [-0.04, 0.44, 0.11]); return r; },
  taxista: r => { generic(r, '#2a2018'); uni(r, 'driver'); hat(r, RK.kartuz('#1e1e22'), CAP); return r; },
  // Britain and the Empire
  tommy: r => { generic(r, '#3a2a20'); uni(r, 'khaki'); hat(r, brodie(), { scale: 0.9, y: 0.88, tilt: -0.02, cap: true }); backpack(r, '#7a6e4a', '#6a6448'); rifle(r, '#7a5232'); return r; },
  tommyCap: r => { generic(r, '#3a2a20'); uni(r, 'khaki'); hat(r, serviceCap('#7a6e48', '#7a6e48'), CAP); rifle(r, '#7a5232'); return r; },
  tommyMask: r => { OUTFITS.tommy(r); r.attach('head', gasMask('#6a6248'), [0, 0.6, 0.12]); r.masked = true; return r; },
  oficialBritanico: r => { generic(r, '#3a2a20'); uni(r, 'khaki'); hat(r, serviceCap('#7a6e48', '#7a6e48'), CAP); r.attach('chest', crossbelts('#5a3a22'), [0, 0.39, 0]); return r; },
  anzac: r => { generic(r, '#3a2a20'); uni(r, 'khaki'); hat(r, slouchHat(), { scale: 0.88, y: 0.88, tilt: -0.02, cap: true }); rifle(r, '#7a5232'); return r; },
  sepoy: r => { generic(r, '#1a1412'); uni(r, 'khaki'); hat(r, turban('#d6c49a', '#d6c49a'), { scale: 0.88, y: 0.86, tilt: -0.04, cap: true }); rifle(r, '#7a5232'); return r; },
  canadiense: r => { OUTFITS.tommy(r); return r; },
  // Germany
  aleman14: r => { generic(r, '#3a2a20'); uni(r, 'feld'); hat(r, pickelhaube({ cover: true }), { scale: 0.9, y: 0.86, tilt: -0.04, cap: true }); backpack(r, '#6a5a40', '#5a5e52'); rifle(r); return r; },
  aleman: r => { generic(r, '#3a2a20'); uni(r, 'feld'); hat(r, stahlhelm(), HELM); backpack(r, '#5a5e52', '#4a4e44'); rifle(r); return r; },
  alemanMask: r => { OUTFITS.aleman(r); r.attach('head', gasMask(), [0, 0.6, 0.12]); r.masked = true; return r; },
  asalto: r => { generic(r, '#3a2a20'); uni(r, 'feld'); hat(r, stahlhelm(), HELM); r.attach('chest', crossbelts('#3a3020'), [0, 0.39, 0]); rifle(r); return r; },
  kaiser: r => { generic(r, '#5a4a3a'); uni(r, 'kaiser'); hat(r, pickelhaube({ cover: false, plume: '#f4f4f0' }), { scale: 0.9, y: 0.86, tilt: -0.04, cap: true }); r.attach('chest', epaulettes('#d4af37'), [0, 0.475, -0.01]); r.attach('chest', medals(), [-0.04, 0.44, 0.11]); return r; },
  zimmermann: r => { generic(r, '#4a3a2a'); uni(r, 'suitDark'); hideEars(r); flattenAhoge(r); return r; },
  // Austria-Hungary and Sarajevo
  austriaco: r => { generic(r, '#3a2a20'); uni(r, 'hecht'); hat(r, feldkappe(), CAP); backpack(r, '#6a5a40', '#7a8690'); rifle(r); return r; },
  archiduque: r => { generic(r, '#3a2a20'); uni(r, 'ffGeneral'); hat(r, plumedHat(), { scale: 0.9, y: 0.9, tilt: -0.02, cap: true }); r.attach('chest', medals(), [-0.04, 0.44, 0.11]); return r; },
  sofia: r => { generic(r, '#5a3a24'); uni(r, 'sophie'); hat(r, ladyHat(), { scale: 0.86, y: 0.9, tilt: -0.04 }); return r; },
  francisco: r => { generic(r, '#d8d8d8'); uni(r, 'fjWhite'); hideEars(r); flattenAhoge(r); r.attach('chest', medals(), [-0.04, 0.44, 0.11]); return r; },
  chofer: r => { generic(r, '#2a2018'); uni(r, 'driver'); hat(r, serviceCap('#3c4048', '#2a2a2e'), CAP); return r; },
  princip: r => { generic(r, '#1d1612'); uni(r, 'suitDark'); hideEars(r); flattenAhoge(r); return r; },
  conspirador: r => { generic(r, '#2a1e16'); uni(r, 'suitGrey'); hat(r, RK.kartuz('#2a2a2e'), CAP); return r; },
  sarajevoHombre: r => { generic(r, pick(r, ['#2e2420', '#3a2a20', '#1d1916'])); uni(r, pick(r, ['suitGrey', 'tweed', 'summer'])); hat(r, pick(r, [fez(), boater(), RK.kartuz('#3a3530'), fez()]), pick(r, [CAP])); return r; },
  sarajevoMujer: r => { generic(r, pick(r, ['#4a3428', '#2e2420', '#6a4a30'])); uni(r, pick(r, ['dress1', 'dress2', 'dress3'])); hat(r, ladyHat(pick(r, ['#f4f0e6', '#e8d8c0', '#d8c8e0']), '#ffffff', pick(r, ['#8a3a3a', '#3a5a8a', '#6a5a3a'])), { scale: 0.82, y: 0.9, tilt: -0.04 }); return r; },
  soldadoSerbio: r => { generic(r, '#2e2418'); uni(r, 'khaki'); hat(r, RK.kartuz('#5a5a40'), CAP); rifle(r); return r; },
  // USA and Mexico
  doughboy: r => { generic(r, '#3a2a20'); uni(r, 'od'); hat(r, brodie('#58563a'), { scale: 0.9, y: 0.88, tilt: -0.02, cap: true }); backpack(r, '#6a6440', '#5a5636'); rifle(r, '#7a5232'); return r; },
  doughboyHat: r => { generic(r, '#3a2a20'); uni(r, 'od'); hat(r, campaignHat(), { scale: 0.86, y: 0.88, tilt: -0.02, cap: true }); backpack(r, '#6a6440', '#5a5636'); rifle(r, '#7a5232'); return r; },
  pershing: r => { generic(r, '#8a8a8a'); uni(r, 'pershing'); hat(r, serviceCap('#615c3a', '#4a4630'), CAP); r.attach('chest', medals(), [-0.04, 0.44, 0.11]); return r; },
  wilson: r => { generic(r, '#8a8a8a'); uni(r, 'suitDark'); hideEars(r); flattenAhoge(r); r.attach('head', glasses(false), [0, 0.62, 0.235]); return r; },
  carranza: r => { generic(r, '#d8d8d8'); uni(r, 'suitGrey'); MXO.carranza(r); return r; },
  villa: r => { generic(r, '#2a1e16'); uni(r, 'mex'); MXO.villa(r); return r; },
  // Ottomans, Arabs, Africa
  otomano: r => { generic(r, '#1d1612'); uni(r, 'ottoman'); hat(r, kabalak(), CAP); rifle(r); return r; },
  arabe: r => { generic(r, '#1d1612'); uni(r, 'arab'); hat(r, keffiyeh('#f4efe2', '#b8342f'), { scale: 0.9, y: 0.84, tilt: -0.03 }); rifle(r, '#7a5232'); return r; },
  tirador: r => { generic(r, '#1a1412'); uni(r, 'tirailleur'); hat(r, fez('#c0272d', '#1a2a5a', 0.17), CAP); rifle(r); return r; },
  // Peace conference, home front
  clemenceau: r => { generic(r, '#d8d8d8'); uni(r, 'suitDark'); hat(r, bowler(), { scale: 0.86, y: 0.88, tilt: -0.03, cap: true }); return r; },
  lloydGeorge: r => { generic(r, '#d0d0d0'); uni(r, 'suitGrey'); hideEars(r); flattenAhoge(r); return r; },
  orlando: r => { generic(r, '#d0d0d0'); uni(r, 'suitDark'); hideEars(r); flattenAhoge(r); return r; },
  diplomatico: r => { generic(r, pick(r, ['#2e2420', '#4a3a2a', '#1d1916'])); uni(r, pick(r, ['suitDark', 'suitGrey'])); hideEars(r); flattenAhoge(r); return r; },
  diplomaticoChistera: r => { generic(r, '#2e2420'); uni(r, 'suitDark'); hat(r, tophat('#141416'), { scale: 0.82, y: 0.88, tilt: -0.03, cap: true }); return r; },
  descifrador: r => { generic(r, pick(r, ['#2e2420', '#4a3a2a', '#1d1916'])); uni(r, pick(r, ['tweed', 'suitGrey'])); hideEars(r); flattenAhoge(r); return r; },
  marinoBritanico: r => { generic(r, '#2a2018'); uni(r, 'navyOff'); hat(r, serviceCap('#f2f2f0', '#141414'), CAP); return r; },
  enfermera: r => { generic(r, '#4a3428'); uni(r, 'nurse'); hat(r, nurseVeil(), { scale: 0.86, y: 0.88, tilt: -0.04 }); return r; },
  paciente: r => { generic(r, pick(r, ['#2e2420', '#4a3a2a'])); uni(r, { dark: '#8a8a84', mid: '#dcdad2', light: '#f6f4ee', gold: '#a8a8a0' }); hideEars(r); flattenAhoge(r); return r; },
  civil: r => { generic(r, pick(r, ['#2e2420', '#3a2a20', '#1d1916', '#4a3428'])); uni(r, pick(r, ['suitGrey', 'tweed', 'summer', 'worker'])); hat(r, pick(r, [bowler('#2a2622'), RK.kartuz('#3a3530'), boater()]), CAP); return r; },
  civilMujer: r => { generic(r, pick(r, ['#4a3428', '#2e2420', '#6a4a30'])); uni(r, pick(r, ['dress1', 'dress2', 'dress3', 'woman'])); hat(r, ladyHat(pick(r, ['#f4f0e6', '#e8d8c0', '#3a3a44']), '#ffffff', pick(r, ['#8a3a3a', '#3a5a8a'])), { scale: 0.8, y: 0.9, tilt: -0.04 }); return r; },
};

let seedCounter = 0;
export function person(parent, who, outfit = who, x = 0, z = 0, yaw = 0) {
  const key = RK.CASTING[who] || who;
  const r = C_.spawn(key); r.seed = (seedCounter++ * 1.37) % 10; OUTFITS[outfit](r);
  r.root.position.set(x, 0, z); r.root.rotation.y = yaw; r.root.userData.dynamic = true; parent.add(r.root); r.who = who;
  r.root.traverse(o => { if (o.isMesh && o.material?.normalMap) { o.material.normalMap = null; o.material.needsUpdate = true; } });
  r.root.traverse(o => { if (!o.isSkinnedMesh) return; if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); o.boundingSphere = o.geometry.boundingSphere.clone(); o.boundingSphere.radius *= 1.6; o.frustumCulled = true; });
  return r;
}
export function crowd(parent, outfit, n, [x0, z0, x1, z1], { seed = 1, yaw = 0, cast = ['doto', 'oguri', 'suzuka', 'helios', 'tamamo', 'mcqueen', 'daiwa', 'cafe'], jitter = 0.35, yawJ = 0.4 } = {}) {
  const r = P.rng(seed), out = [];
  const cols = Math.ceil(Math.sqrt(n * (x1 - x0) / Math.max(0.1, z1 - z0)));
  for (let i = 0; i < n; i++) {
    const cx = i % cols, cz = Math.floor(i / cols), rows = Math.ceil(n / cols);
    const x = x0 + (cx + 0.5) / cols * (x1 - x0) + (r() - 0.5) * jitter, z = z0 + (cz + 0.5) / rows * (z1 - z0) + (r() - 0.5) * jitter;
    const o = Array.isArray(outfit) ? outfit[i % outfit.length] : outfit;
    out.push(RK.blobShadow(person(parent, cast[i % cast.length], o, x, z, yaw + (r() - 0.5) * yawJ)));
  }
  return out;
}
