// Overlay helpers for the Revolution video.
import { ss, clamp } from '../lib/util.js';

let grainURL = null;
function grainTile() {
  if (grainURL) return grainURL;
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), d = g.createImageData(256, 256);
  let s = 1234567; const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = 0; i < d.data.length; i += 4) { const v = 96 + rnd() * 160; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0); grainURL = c.toDataURL(); return grainURL;
}
// Subtle film grain + vignette, offset every frame.
export function film(t) {
  const f = Math.floor(t * 24), x = (f * 97) % 256, y = (f * 61) % 256;
  return `<div class="grain" style="background-image:url(${grainTile()});background-position:${x}px ${y}px"></div><div class="vign"></div>`;
}
// Name plate above a character.
export function nameplate(ctx, pos, name, role, a, b = 1e9) {
  const k = ss(a, a + 0.35, ctx.t ?? 0) * (1 - ss(b - 0.35, b, ctx.t ?? 0));
  if (k <= 0) return '';
  const [x, y, ok] = ctx.project(pos); if (!ok) return '';
  return `<div class="np" style="left:${x}px;top:${y - 16}px;opacity:${k};transform:translate(-50%,-100%) translateY(${(1 - k) * 12}px)"><div class="n">${name}</div>${role ? `<div class="r">${role}</div>` : ''}</div>`;
}
export function shout(t, text, a, b, top = 300) {
  const k = ss(a, a + 0.25, t) * (1 - ss(b - 0.3, b, t)); if (k <= 0) return '';
  const sc = 0.7 + 0.3 * Math.min(1, (t - a) / 0.25) + 0.04 * Math.sin((t - a) * 6);
  return `<div class="shout" style="top:${top}px;opacity:${k};transform:scale(${sc})">${text}</div>`;
}
// Newspaper front page spinning in (classic newsreel trope).
export function newspaper(t, a, b, { mast = 'EL IMPARCIAL', date = '', head = '', sub = '', x = 50 } = {}) {
  const k = ss(a, a + 0.6, t), o = k * (1 - ss(b - 0.3, b, t)); if (o <= 0) return '';
  const rot = (1 - k) * 540 - 4, sc = 0.15 + 0.85 * k;
  return `<div style="position:absolute;left:${x}%;top:46%;width:700px;padding:26px 34px 30px;background:#efe6cf;color:#1f1a16;box-shadow:0 18px 50px rgba(0,0,0,.45);
    transform:translate(-50%,-50%) rotate(${rot}deg) scale(${sc});opacity:${o};font-family:Georgia,'Times New Roman',serif">
    <div style="text-align:center;font:900 64px/1 Georgia,serif;letter-spacing:.04em;border-bottom:4px double #1f1a16;padding-bottom:10px">${mast}</div>
    <div style="display:flex;justify-content:space-between;font:italic 600 18px Georgia,serif;border-bottom:2px solid #1f1a16;padding:6px 0;margin-bottom:14px"><span>${date}</span><span>Precio: 1 centavo</span></div>
    <div style="text-align:center;font:900 76px/1.02 Georgia,serif">${head}</div>
    <div style="text-align:center;font:italic 600 26px/1.3 Georgia,serif;margin-top:12px">${sub}</div>
    <div style="display:flex;gap:16px;margin-top:16px">${[0, 1, 2].map(() => `<div style="flex:1">${'<div style="height:7px;background:#b9ad93;margin:7px 0"></div>'.repeat(5)}</div>`).join('')}</div></div>`;
}
// Parchment document card (plans, decrees). parts: [[html, revealTime], ...]
export function doc(t, a, b, title, parts = [], { left = 90, top = 110, width = 620, foot = '' } = {}) {
  const k = ss(a, a + 0.45, t) * (1 - ss(b - 0.35, b, t)); if (k <= 0) return '';
  return `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;padding:30px 36px;background:linear-gradient(#f3e7c9,#e6d5ae);color:#2a2116;border-radius:4px;
    box-shadow:0 14px 40px rgba(0,0,0,.4);opacity:${k};transform:translateY(${(1 - ss(a, a + 0.45, t)) * 30}px) rotate(-1.2deg);font-family:Georgia,serif">
    <div style="font:900 44px/1.05 Georgia,serif;letter-spacing:.03em;border-bottom:3px solid #6b3a22;padding-bottom:10px;margin-bottom:12px">${title}</div>
    ${parts.map(([h, tt]) => `<div style="font:600 27px/1.35 Georgia,serif;margin:8px 0;opacity:${ss(tt, tt + 0.35, t)}">${h}</div>`).join('')}
    ${foot ? `<div style="text-align:right;font:italic 600 24px Georgia,serif;margin-top:14px;color:#6b3a22">${foot}</div>` : ''}</div>`;
}
// Big rubber-stamp style date.
export function stamp(t, text, a, b, { x = 1250, y = 560, rot = -8, color = '#b5332e' } = {}) {
  const k = ss(a, a + 0.18, t) * (1 - ss(b - 0.3, b, t)); if (k <= 0) return '';
  const sc = 1 + 0.6 * (1 - ss(a, a + 0.18, t));
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%) rotate(${rot}deg) scale(${sc});opacity:${k};border:7px solid ${color};color:${color};
    padding:12px 28px;font:900 46px/1.1 Inter;letter-spacing:.06em;text-align:center;border-radius:10px;background:rgba(243,234,214,.94);box-shadow:0 10px 30px rgba(0,0,0,.35)">${text}</div>`;
}
