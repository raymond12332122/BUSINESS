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
