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
  return `<div class="dstamp" style="position:absolute;${align}:${x}px;top:${y - 40}px;opacity:${k};transform:translateY(${(1 - k) * 12}px);font:800 30px 'DejaVu Sans Mono',monospace;color:#f4ecd8;letter-spacing:.08em;text-shadow:0 2px 10px rgba(0,0,0,.7)">
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
// A quiet list (the other victims): each item fades in at its cue time, a small candle-light dot before it.
export function memList(t, a, b, title, items, { x = 1300, y = 170, w = 560 } = {}) {
  const k = K(t, a, b, 0.5, 0.5); if (k <= 0) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;padding:22px 28px;${PANEL};opacity:${k};border-left:6px solid #c9a227">
    <div style="font:800 21px Inter;letter-spacing:.16em;color:#e0b84a;margin-bottom:12px">${title}</div>${items.map(([txt, tt]) => { const o = ss(tt, tt + 0.4, t);
      return `<div style="display:flex;align-items:center;gap:16px;margin:11px 0;opacity:${o};transform:translateX(${(1 - o) * 24}px)"><div style="width:12px;height:12px;border-radius:6px;background:#ffcf7a;box-shadow:0 0 14px #ffb04a;flex:none"></div><div style="font:700 31px Inter;color:#f4efe6">${txt}</div></div>`; }).join('')}</div>`;
}
// The human cost, as quiet bars on a dark panel: rows [label, valueText, lo, hi, cue] in millions (hi > lo draws the
// uncertain range lighter), plus an optional pictogram row (1 in n people) — values and labels in text colours.
export function lossChart(t, a, b, rows, picto = null, { x = 1180, y = 150, w = 640, max = 27 } = {}) {
  const k = K(t, a, b, 0.5, 0.5); if (k <= 0) return '';
  const bar = ([label, val, lo, hi, cue]) => { const o = ss(cue, cue + 0.5, t), wl = (w - 60) * lo / max * o, wr = (w - 60) * (hi - lo) / max * o;
    return `<div style="margin:12px 0 18px;opacity:${0.25 + 0.75 * ss(cue - 0.2, cue + 0.2, t)}"><div style="display:flex;justify-content:space-between;font:800 26px Inter;color:#f4efe6"><span>${label}</span><span style="color:#e0b84a">${val}</span></div>
      <div style="display:flex;height:16px;margin-top:8px"><div style="width:${wl}px;background:#c9a227;border-radius:4px 0 0 4px"></div><div style="width:${wr}px;background:rgba(201,162,39,.45);border-radius:0 4px 4px 0"></div></div></div>`; };
  const pic = picto ? (() => { const [label, val, n, cue] = picto, o = ss(cue, cue + 0.4, t);
    const fig = (dark) => `<svg width="34" height="54" viewBox="0 0 34 54"><circle cx="17" cy="10" r="8" fill="${dark ? '#c9a227' : 'rgba(244,239,230,.35)'}"/><rect x="7" y="20" width="20" height="32" rx="7" fill="${dark ? '#c9a227' : 'rgba(244,239,230,.35)'}"/></svg>`;
    return `<div style="margin:12px 0 4px;opacity:${0.25 + 0.75 * o}"><div style="display:flex;justify-content:space-between;font:800 26px Inter;color:#f4efe6"><span>${label}</span><span style="color:#e0b84a">${val}</span></div>
      <div style="display:flex;gap:10px;margin-top:10px">${Array.from({ length: n }, (_, i) => fig(i === 0 && o > 0.5)).join('')}</div></div>`; })() : '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;padding:24px 30px;${PANEL};opacity:${k}">
    <div style="font:800 20px Inter;letter-spacing:.16em;color:#e0b84a;margin-bottom:6px">MUERTOS EN LA GUERRA · MILLONES DE PERSONAS</div>${rows.map(bar).join('')}${pic}</div>`;
}
// Closing cast card, static so every line can be read: the big models and who they play (two columns), then the chibi
// cast in one paragraph and a closing note (no fixed row heights, so a long line wraps instead of overlapping the next).
export function castCard(t, a, b, leads, extras, note, { x = 1110, y = 50, w = 760 } = {}) {
  const k = K(t, a, b, 0.5, 0.45); if (k <= 0) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;padding:22px 30px;${PANEL};opacity:${k};transform:translateY(${(1 - k) * 16}px)">
    <div style="font:900 26px Inter;letter-spacing:.3em;color:#e0b84a;margin-bottom:6px">ELENCO</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;column-gap:24px">${leads.map(([u, f]) =>
      `<div style="margin:8px 0"><div style="font:900 32px/1.15 'Inter Display',Inter;color:#fff">${u}</div><div style="font:700 23px/1.25 Inter;color:#e0b84a">${f}</div></div>`).join('')}</div>
    <div style="font:600 22px/1.4 Inter;color:#d9d3c7;margin-top:12px">${extras}</div>
    <div style="font:600 19px Inter;color:#b8b2a6;font-style:italic;margin-top:10px">${note}</div></div>`;
}
