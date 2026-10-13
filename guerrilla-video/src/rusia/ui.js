// Overlays for the Russian Revolution video: calendars (Julian vs Gregorian), family icons, slogans with translation.
import { ss, clamp } from '../lib/util.js';
export * from '../puebla/ui.js';
export { timeline } from '../mx/ui.js';

const K = (t, a, b, fi = 0.4, fo = 0.35) => ss(a, a + fi, t) * (1 - ss(b - fo, b, t));
const PANEL = 'background:rgba(14,16,22,.88);border-radius:18px;box-shadow:0 18px 50px rgba(0,0,0,.35)';

// Two calendar pages: [label, month, day, year] each, with "+13 días" between them. tB reveals the second page.
export function calendar(t, a, b, left, right, tB, { x = 960, y = 230, note = '+13 días' } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const page = ([lab, mon, day, yr], o, accent) => `<div style="width:300px;opacity:${o};transform:translateY(${(1 - o) * 24}px)">
    <div style="font:800 22px Inter;color:#e9e6df;text-align:center;margin-bottom:10px;letter-spacing:.04em">${lab}</div>
    <div style="background:#f3ead6;border-radius:12px;overflow:hidden;box-shadow:0 14px 34px rgba(0,0,0,.4)">
      <div style="background:${accent};color:#fff;font:900 30px Inter;letter-spacing:.18em;text-align:center;padding:12px 0">${mon}</div>
      <div style="font:900 128px/1.05 'Inter Display',Inter;color:#1f1a16;text-align:center;padding-top:6px">${day}</div>
      <div style="font:800 30px Inter;color:#6b5a48;text-align:center;padding-bottom:16px">${yr}</div></div></div>`;
  const o2 = ss(tB, tB + 0.45, t);
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translateX(-50%);display:flex;align-items:center;gap:40px;opacity:${k}">
    ${page(left, ss(a, a + 0.4, t), '#7a2a24')}
    <div style="font:900 40px 'Inter Display',Inter;color:#ffb627;opacity:${o2};white-space:nowrap">→ ${note} →</div>
    ${page(right, o2, '#2a4a7a')}</div>`;
}
const PERSON = (c, w = 54) => `<svg width="${w}" height="${Math.round(w * 1.5)}" viewBox="0 0 40 60"><circle cx="20" cy="12" r="10" fill="${c}"/><path d="M4 58 L6 32 Q8 24 20 24 Q32 24 34 32 L36 58 Z" fill="${c}"/></svg>`;
// Rows of person icons: groups [[label, n, appearAt, colour]]. dim > 0 greys everything (after the fact).
export function family(t, a, b, title, groups, { x = 960, y = 210, dim = 0 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const body = groups.map(([lab, n, tt, col = '#e9e6df']) => { const o = ss(tt, tt + 0.35, t);
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;opacity:${o};transform:translateY(${(1 - o) * 16}px)"><div style="display:flex;gap:6px">${Array(n).fill(PERSON(col)).join('')}</div>
      <div style="font:800 24px Inter;color:#e9e6df">${lab}</div></div>`; }).join('');
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translateX(-50%);padding:24px 34px;${PANEL};opacity:${k};filter:grayscale(${dim}) brightness(${1 - 0.35 * dim})">
    <div style="font:900 32px 'Inter Display',Inter;color:#fff;text-align:center;margin-bottom:16px">${title}</div><div style="display:flex;gap:40px;align-items:flex-end">${body}</div></div>`;
}
// Cyrillic slogan with its Spanish translation underneath.
export function slogan(t, a, b, ru, es, { top = 150, size = 72 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  return `<div style="position:absolute;left:0;right:0;top:${top}px;text-align:center;opacity:${k};transform:scale(${0.94 + 0.06 * k})">
    <div style="display:inline-block;background:#b8241e;color:#f6efe0;font:900 ${size}px/1.1 'DejaVu Serif',serif;padding:14px 40px;border-radius:6px;box-shadow:0 14px 40px rgba(0,0,0,.45)">${ru}</div>
    <div style="font:800 40px Inter;color:#fff;margin-top:14px;text-shadow:0 3px 16px rgba(0,0,0,.7)">«${es}»</div></div>`;
}
// Small two-line tag pinned to a 3D point: Russian text + Spanish meaning.
export function tag(ctx, pos, ru, es, k = 1) {
  if (k <= 0) return ''; const [x, y, ok] = ctx.project(pos); if (!ok) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-100%) translateY(-10px);opacity:${k};text-align:center;padding:6px 14px;border-radius:10px;background:rgba(20,22,28,.88);white-space:nowrap">
    <div style="font:800 24px 'DejaVu Serif',serif;color:#ffd9a0">${ru}</div><div style="font:700 19px Inter;color:#e6e0d4">= ${es}</div></div>`;
}
// Three icon tiles in a row (e.g. paz, pan, tierra). items [[emojiOrSvg, label, appearAt]]
export function tiles(t, a, b, items, { top = 640, w = 230 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  return `<div style="position:absolute;left:0;right:0;top:${top}px;display:flex;justify-content:center;gap:26px;opacity:${k}">${items.map(([ic, lab, tt]) => { const o = ss(tt, tt + 0.3, t);
    return `<div style="width:${w}px;padding:16px 0 14px;${PANEL};text-align:center;opacity:${o};transform:translateY(${(1 - o) * 20}px) scale(${0.9 + 0.1 * o})"><div style="font-size:64px;line-height:1">${ic}</div><div style="font:900 34px 'Inter Display',Inter;color:#fff;margin-top:8px">${lab}</div></div>`; }).join('')}</div>`;
}
// Dark fade to black (k: 0..1).
export const black = k => k > 0 ? `<div style="position:absolute;inset:0;background:#000;opacity:${clamp(k)}"></div>` : '';
export const tint = (col, k) => k > 0 ? `<div style="position:absolute;inset:0;background:${col};opacity:${clamp(k)};mix-blend-mode:multiply"></div>` : '';
// List of things that did NOT exist (red ✗ boxes).
export function nolist(t, a, b, title, items, { x = 1150, y = 190, w = 640 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;padding:28px 34px;${PANEL};opacity:${k}">
    <div style="font:900 34px 'Inter Display',Inter;color:#fff;margin-bottom:10px">${title}</div>
    ${items.map(([txt, tt]) => { const o = ss(tt, tt + 0.3, t); return `<div style="display:flex;align-items:center;gap:18px;margin:14px 0;opacity:${0.2 + 0.8 * o};transform:translateX(${(1 - o) * 14}px)"><div style="flex:none;width:48px;height:48px;border-radius:12px;background:${o > 0.5 ? '#c0392b' : 'rgba(255,255,255,.15)'};display:flex;align-items:center;justify-content:center;font:900 32px Inter;color:#fff">${o > 0.5 ? '✗' : ''}</div><div style="font:800 34px/1.2 Inter;color:#fff">${txt}</div></div>`; }).join('')}</div>`;
}
// n of 10 people highlighted.
export function ofTen(t, a, b, n, label, { x = 960, y = 150, col = '#e0a63a' } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const icons = [...Array(10)].map((_, i) => { const o = ss(a + 0.1 + i * 0.06, a + 0.3 + i * 0.06, t); return `<span style="display:inline-block;opacity:${o};transform:translateY(${(1 - o) * 12}px)">${PERSON(i < n ? col : 'rgba(255,255,255,.28)', 50)}</span>`; }).join('');
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translateX(-50%);padding:22px 32px 18px;${PANEL};opacity:${k};text-align:center">
    <div style="display:flex;gap:8px;justify-content:center">${icons}</div><div style="font:900 40px 'Inter Display',Inter;color:#fff;margin-top:10px"><span style="color:${col}">${n} de cada 10</span> ${label}</div></div>`;
}
