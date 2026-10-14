// Overlays for the First World War video: everything from the Russian Revolution video plus a cipher telegram,
// a periscope/crosshair mask, alliance cards and a date strip.
import { ss, clamp } from '../lib/util.js';
export * from '../rusia/ui.js';

const K = (t, a, b, fi = 0.4, fo = 0.35) => ss(a, a + fi, t) * (1 - ss(b - fo, b, t));
const PANEL = 'background:rgba(14,16,22,.88);border-radius:18px;box-shadow:0 18px 50px rgba(0,0,0,.35)';
// Telegram sheet: header, rows of code groups that resolve into the decoded Spanish text at tDec.
const GROUPS = '130 13042 13401 8501 115 3528 416 17214 6491 11310 18147 18222 21560 10247 11518 23677 13605 3494 14936 98092 5905 11311 10392 10371 0302 21290 5161 39695 23571 17504 11269 18276 18101 0317 0228 17694 4473 22284 22200 19452 21589 67893 5569 13918 8958 12137'.split(' ');
export function telegram(t, a, b, tDec, decoded, { x = 1210, y = 120, w = 600, head = 'TELEGRAMA · BERLÍN → MÉXICO · 16 ENE. 1917' } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const d = ss(tDec, tDec + 0.8, t);
  const codes = GROUPS.map((g, i) => `<span style="display:inline-block;width:92px;opacity:${1 - d * 0.85}">${g}</span>`).join('');
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;padding:24px 30px;background:#efe6cc;border-radius:6px;box-shadow:0 18px 50px rgba(0,0,0,.45);opacity:${k};transform:rotate(-1.5deg) translateY(${(1 - k) * 20}px)">
    <div style="font:900 20px Inter;letter-spacing:.08em;color:#6a4a2a;border-bottom:2px solid #6a4a2a;padding-bottom:8px;margin-bottom:12px">${head}</div>
    <div style="position:relative"><div style="font:700 23px/1.55 'DejaVu Sans Mono',monospace;color:#2a2420">${codes}</div>
    <div style="position:absolute;inset:0;font:700 30px/1.35 'DejaVu Serif',serif;color:#1f1a16;opacity:${d};background:rgba(239,230,204,${0.85 * d});padding-top:6px">${decoded}</div></div></div>`;
}
// Periscope / binocular mask with a crosshair (U-boat attack).
export function scope(k = 1) {
  if (k <= 0) return '';
  return `<div style="position:absolute;inset:0;opacity:${k};background:radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0, rgba(0,0,0,0) 400px, rgba(6,10,14,.97) 404px)"></div>
    <div style="position:absolute;left:960px;top:140px;width:2px;height:800px;background:rgba(10,14,18,.7);opacity:${k}"></div><div style="position:absolute;left:560px;top:540px;width:800px;height:2px;background:rgba(10,14,18,.7);opacity:${k}"></div>
    ${[-3, -2, -1, 1, 2, 3].map(i => `<div style="position:absolute;left:${960 + i * 100 - 1}px;top:528px;width:2px;height:24px;background:rgba(10,14,18,.7);opacity:${k}"></div>`).join('')}`;
}
// Two alliance cards side by side: [title, members[], colour, appearAt] each.
export function alliances(t, a, b, l, r, { top = 640 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const card = ([title, members, col, ta], side) => { const o = ss(ta, ta + 0.4, t); return `<div style="position:absolute;${side}:120px;top:${top}px;width:620px;padding:18px 26px;${PANEL};border-top:7px solid ${col};opacity:${o * k};transform:translateY(${(1 - o) * 18}px)">
    <div style="font:900 36px 'Inter Display',Inter;color:${col};letter-spacing:.04em">${title}</div><div style="font:800 26px Inter;color:#f2ede2;margin-top:6px">${members.join(' · ')}</div></div>`; };
  return card(l, 'left') + card(r, 'right');
}
// Horizontal strip of dated events lighting up one by one: items [[date, text, at, colour]].
export function dateStrip(t, a, b, items, { top = 120 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  return `<div style="position:absolute;left:0;right:0;top:${top}px;display:flex;justify-content:center;gap:14px;opacity:${k}">${items.map(([d, txt, ta, col = '#ffb627']) => { const o = ss(ta, ta + 0.3, t);
    return `<div style="width:260px;padding:12px 14px;${PANEL};border-left:6px solid ${col};opacity:${0.25 + 0.75 * o};transform:translateY(${(1 - o) * 10}px)"><div style="font:900 22px Inter;color:${col}">${d}</div><div style="font:800 21px/1.25 Inter;color:#f2ede2;margin-top:4px">${txt}</div></div>`; }).join('')}</div>`;
}
// Big clock face showing hh:mm (armistice at 11:00).
export function clock(t, a, b, hh, mm, { x = 1560, y = 170, size = 220 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const ah = (hh % 12 + mm / 60) * 30, am = mm * 6, ticks = [...Array(12)].map((_, i) => `<div style="position:absolute;left:${size / 2 - 3}px;top:8px;width:6px;height:${size * 0.08}px;background:#2a2420;transform-origin:3px ${size / 2 - 8}px;transform:rotate(${i * 30}deg)"></div>`).join('');
  return `<div style="position:absolute;left:${x - size / 2}px;top:${y}px;width:${size}px;height:${size}px;border-radius:50%;background:#f3ead6;border:8px solid #6a4a2a;box-shadow:0 14px 40px rgba(0,0,0,.45);opacity:${k}">${ticks}
    <div style="position:absolute;left:${size / 2 - 5}px;top:${size * 0.22}px;width:10px;height:${size * 0.3}px;background:#1f1a16;border-radius:5px;transform-origin:5px ${size * 0.28}px;transform:rotate(${ah}deg)"></div>
    <div style="position:absolute;left:${size / 2 - 3}px;top:${size * 0.08}px;width:6px;height:${size * 0.44}px;background:#1f1a16;border-radius:3px;transform-origin:3px ${size * 0.42}px;transform:rotate(${am}deg)"></div>
    <div style="position:absolute;left:${size / 2 - 10}px;top:${size / 2 - 10}px;width:20px;height:20px;border-radius:50%;background:#b8241e"></div></div>`;
}
// Red diagonal strike-through over a label-like card (fallen empires).
export function struck(t, a, b, items, tStrike, { top = 150 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  return `<div style="position:absolute;left:0;right:0;top:${top}px;display:flex;justify-content:center;gap:18px;opacity:${k}">${items.map(([txt, tt, ts = tStrike + i * 0.25], i) => { const o = ss(tt, tt + 0.3, t), st = ss(ts, ts + 0.3, t);
    return `<div style="position:relative;padding:12px 22px;${PANEL};opacity:${o};transform:translateY(${(1 - o) * 12}px)"><div style="font:900 30px 'Inter Display',Inter;color:#f2ede2;opacity:${1 - 0.45 * st}">${txt}</div>
      <div style="position:absolute;left:10px;right:10px;top:50%;height:6px;background:#d4362a;transform:scaleX(${st});transform-origin:left;border-radius:3px"></div></div>`; }).join('')}</div>`;
}
// Two-line label pinned to a 3D point (title + detail).
export function pin(ctx, pos, title, sub = '', k = 1, col = '#ffb627') {
  if (k <= 0) return ''; const [x, y, ok] = ctx.project(pos); if (!ok) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-100%) translateY(-10px) scale(${0.85 + 0.15 * k});opacity:${k};text-align:center;padding:7px 15px;border-radius:10px;background:rgba(20,22,28,.9);border-bottom:4px solid ${col};white-space:nowrap">
    <div style="font:900 25px 'Inter Display',Inter;color:#fff">${title}</div>${sub ? `<div style="font:700 18px Inter;color:#e6e0d4;margin-top:2px">${sub}</div>` : ''}</div>`;
}
// Single calendar page (label above).
export function datePage(t, a, b, label, mon, day, yr, { x = 960, y = 120, accent = '#7a2a24', w = 280 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;transform:translateX(-50%) translateY(${(1 - k) * 20}px);opacity:${k}">
    ${label ? `<div style="font:800 22px Inter;color:#f2ede2;text-align:center;margin-bottom:10px;letter-spacing:.04em;text-shadow:0 2px 10px rgba(0,0,0,.6)">${label}</div>` : ''}
    <div style="background:#f3ead6;border-radius:12px;overflow:hidden;box-shadow:0 14px 34px rgba(0,0,0,.4)">
      <div style="background:${accent};color:#fff;font:900 28px Inter;letter-spacing:.18em;text-align:center;padding:10px 0">${mon}</div>
      <div style="font:900 112px/1.05 'Inter Display',Inter;color:#1f1a16;text-align:center;padding-top:4px">${day}</div>
      <div style="font:800 28px Inter;color:#6b5a48;text-align:center;padding-bottom:14px">${yr}</div></div></div>`;
}
