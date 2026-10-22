// Overlays for the Second World War video: everything from the what-if video (titles, cards, bubbles, credits, film
// grain, counters) plus name cards for historical people, dark cards for the dictators, date stamps and big numbers.
import { ss, clamp } from '../lib/util.js';
import { flagURL } from '../whatif/flags.js';
export * from '../whatif/ui.js';

const K = (t, a, b, fi = 0.4, fo = 0.35) => ss(a, a + fi, t) * (1 - ss(b - fo, b, t));
const PANEL = 'background:rgba(14,16,22,.88);border-radius:18px;box-shadow:0 18px 50px rgba(0,0,0,.35)';
const flagImg = (code, w = 60) => `<img src="${flagURL(code)}" style="width:${w}px;height:${Math.round(w * 2 / 3)}px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,.4);display:block">`;

// Name card for a historical person: flag, name, role, and the umamusume who plays them (small, italic).
export function who(t, a, b, name, role, { code = null, actor = null, side = 'l', top = 92, w = 600 } = {}) {
  const k = K(t, a, b, 0.45, 0.4); if (k <= 0) return '';
  const pos = side === 'l' ? 'left:72px' : 'right:72px', dx = (1 - k) * (side === 'l' ? -40 : 40);
  return `<div style="position:absolute;${pos};top:${top}px;width:${w}px;padding:18px 24px;${PANEL};opacity:${k};transform:translateX(${dx}px)">
    <div style="display:flex;align-items:center;gap:16px">${code ? flagImg(code) : ''}<div>
    <div style="font:900 36px/1.1 'Inter Display',Inter;color:#fff">${name}</div>
    <div style="font:700 22px/1.3 Inter;color:#e0b84a;margin-top:4px">${role}</div></div></div>
    ${actor ? `<div style="font:600 19px Inter;color:#b8b2a6;margin-top:10px;font-style:italic">Interpretado por ${actor}</div>` : ''}</div>`;
}
// Dark card for the dictators (they only ever appear as silhouettes).
export function dark(t, a, b, name, role, { side = 'r', top = 92, w = 560 } = {}) {
  const k = K(t, a, b, 0.45, 0.4); if (k <= 0) return '';
  const pos = side === 'l' ? 'left:72px' : 'right:72px', dx = (1 - k) * (side === 'l' ? -40 : 40);
  return `<div style="position:absolute;${pos};top:${top}px;width:${w}px;padding:16px 24px;background:rgba(10,8,8,.9);border-left:6px solid #b8342f;border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.45);opacity:${k};transform:translateX(${dx}px)">
    <div style="font:900 34px/1.1 'Inter Display',Inter;color:#f2ece4">${name}</div><div style="font:700 21px/1.3 Inter;color:#d8a49a;margin-top:4px">${role}</div></div>`;
}
// Date stamp in a corner, like a newsreel caption.
export function stamp(t, a, b, date, place = '', { x = 72, y = 940, align = 'left' } = {}) {
  const k = K(t, a, b, 0.35, 0.35); if (k <= 0) return '';
  return `<div style="position:absolute;${align}:${x}px;top:${y - 40}px;opacity:${k};transform:translateY(${(1 - k) * 12}px);font:800 30px 'DejaVu Sans Mono',monospace;color:#f4ecd8;letter-spacing:.08em;text-shadow:0 2px 10px rgba(0,0,0,.7)">
    ${date}${place ? `<span style="color:#e0b84a"> · ${place}</span>` : ''}</div>`;
}
// A big number that counts up (value in units; fmt adds thousands separators), with a label under it.
export function bigNumber(t, a, b, value, text, { x = 960, y = 470, count = 1.2, prefix = '', suffix = '', col = '#fff', accent = '#e0b84a', size = 120, band = false } = {}) {
  const k = K(t, a, b, 0.4, 0.4); if (k <= 0) return '';
  const v = Math.round(value * ss(a, a + count, t)), s = typeof value === 'number' ? v.toLocaleString('es-MX') : value;
  return (band ? `<div style="position:absolute;left:0;right:0;top:${y - size * 0.95}px;height:${size * 1.9 + 20}px;background:linear-gradient(90deg,rgba(8,10,16,0),rgba(8,10,16,.72) 25%,rgba(8,10,16,.72) 75%,rgba(8,10,16,0));opacity:${k}"></div>` : '')
    + `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%) scale(${0.9 + 0.1 * k});opacity:${k};text-align:center">
    <div style="font:900 ${size}px/1 'Inter Display',Inter;color:${col};text-shadow:0 6px 30px rgba(0,0,0,.6)">${prefix}${s}${suffix}</div>
    <div style="font:800 34px Inter;color:${accent};margin-top:10px;letter-spacing:.04em;text-shadow:0 3px 14px rgba(0,0,0,.6)">${text}</div></div>`;
}
// Row of flags with names (who fought on which side).
export function sides(t, a, b, title, items, { x = 960, y = 140, accent = '#3f6fb5' } = {}) {
  const k = K(t, a, b, 0.4, 0.4); if (k <= 0) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translateX(-50%);opacity:${k};padding:14px 22px;${PANEL};border-top:6px solid ${accent}">
    <div style="font:900 22px Inter;letter-spacing:.2em;color:#e6e0d4;text-align:center;margin-bottom:10px">${title}</div>
    <div style="display:flex;gap:18px">${items.map(([code, name], i) => { const o = ss(a + 0.15 * i, a + 0.15 * i + 0.3, t);
      return `<div style="opacity:${o};text-align:center">${code ? flagImg(code, 54) : ''}<div style="font:800 18px Inter;color:#fff;margin-top:6px;white-space:nowrap">${name}</div></div>`; }).join('')}</div></div>`;
}
// Soft memorial overlay text (the Holocaust, the cost).
export function solemn(t, a, b, line1, line2 = '', { y = 420 } = {}) {
  const k = K(t, a, b, 0.8, 0.8); if (k <= 0) return '';
  return `<div style="position:absolute;left:0;right:0;top:${y}px;text-align:center;opacity:${k}">
    <div style="font:800 64px/1.15 'Inter Display',Inter;color:#f4efe6;text-shadow:0 4px 24px rgba(0,0,0,.7)">${line1}</div>
    ${line2 ? `<div style="font:600 32px/1.4 Inter;color:#d8d0c2;margin-top:14px;text-shadow:0 3px 14px rgba(0,0,0,.7)">${line2}</div>` : ''}</div>`;
}
// A rubber-stamp word that slams onto the screen (drops from bigger, lands with a slight tilt).
export function slam(t, a, b, text, { x = 960, y = 540, rot = -6, col = '#b8342f', size = 60 } = {}) {
  if (t < a) return ''; const k = clamp((t - a) / 0.16), out = 1 - ss(b - 0.35, b, t); if (out <= 0) return '';
  const sc = 1 + 0.7 * (1 - k) ** 2;
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%) rotate(${rot}deg) scale(${sc});opacity:${Math.min(1, k * 1.6) * out};white-space:nowrap;
    font:900 ${size}px 'Inter Display',Inter;letter-spacing:.06em;color:${col};border:7px solid ${col};border-radius:12px;padding:4px 24px;background:rgba(250,244,230,.86);box-shadow:0 12px 34px rgba(0,0,0,.4)">${text}</div>`;
}
