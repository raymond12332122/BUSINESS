// Data graphics for the Puebla video (bars with direct labels, map legend, verdict card).
import { ss, clamp } from '../lib/util.js';
export * from '../narco/ui.js';

const K = (t, a, b, fi = 0.4, fo = 0.35) => ss(a, a + fi, t) * (1 - ss(b - fo, b, t));
const PANEL = 'background:rgba(14,16,22,.88);border-radius:18px;box-shadow:0 18px 50px rgba(0,0,0,.35)';
const fmt = (v, d = 0) => v.toLocaleString('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d });

// Horizontal bars, one series, values labelled at the bar end. rows: [label, value, appearAt, highlight?, note?, colour?]
export function hbars(t, a, b, title, rows, { x = 1080, y = 200, w = 720, max = null, unit = '', dec = 0, sub = '', note = '' } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const M = max || Math.max(...rows.map(r => r[1])) * 1.08, BW = w - 250;
  const body = rows.map(([lab, v, tt, hi, nt, col]) => {
    const g = ss(tt, tt + 0.9, t), o = ss(tt - 0.1, tt + 0.25, t);
    return `<div style="display:flex;align-items:center;gap:14px;margin:16px 0;opacity:${o}">
      <div style="width:170px;text-align:right;font:800 26px Inter;color:${hi ? '#fff' : '#c9ced6'}">${lab}</div>
      <div style="position:relative;width:${BW}px;height:40px"><div style="position:absolute;left:0;top:0;height:40px;width:${(v / M) * BW * g}px;background:${col || (hi ? '#ff6b4a' : '#7d8796')};border-radius:4px 6px 6px 4px"></div>
        <div style="position:absolute;top:2px;left:${(v / M) * BW * g + 12}px;font:900 30px 'Inter Display',Inter;color:#fff;white-space:nowrap">${fmt(v * g, dec || (Number.isInteger(v) ? 0 : 1))}${unit}${nt ? `<span style="font:700 19px Inter;color:#c9ced6;margin-left:10px">${nt}</span>` : ''}</div></div></div>`;
  }).join('');
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;padding:24px 28px 18px;${PANEL};opacity:${k};transform:translateY(${(1 - ss(a, a + 0.4, t)) * 20}px)">
    <div style="font:900 30px 'Inter Display',Inter;color:#fff">${title}</div>${sub ? `<div style="font:600 19px Inter;color:#aab0ba;margin-top:4px">${sub}</div>` : ''}
    <div style="margin-top:8px">${body}</div>${note ? `<div style="font:600 17px Inter;color:#9aa1ab;margin-top:4px">${note}</div>` : ''}</div>`;
}
// Two vertical bars (before / after) with a change badge.
export function pair(t, a, b, title, [l0, v0], [l1, v1], { x = 1330, y = 260, change = '', good = false, dec = 0, sub = '' } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const g1 = ss(a + 0.2, a + 1.0, t), g2 = ss(a + 0.9, a + 1.8, t), H = 240, M = Math.max(v0, v1) * 1.05, s = H / M;
  const bar = (v, gk, lab, col, xx) => `<div style="position:absolute;left:${xx}px;bottom:70px;width:150px;height:${v * s * gk}px;background:${col};border-radius:8px 8px 3px 3px"></div>
    <div style="position:absolute;left:${xx}px;width:150px;bottom:${78 + v * s * gk}px;text-align:center;font:900 44px 'Inter Display',Inter;color:#fff;opacity:${gk}">${fmt(v * gk, dec)}</div>
    <div style="position:absolute;left:${xx - 20}px;width:190px;bottom:16px;text-align:center;font:700 21px/1.15 Inter;color:#c9ced6">${lab}</div>`;
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:470px;height:570px;${PANEL};opacity:${k}">
    <div style="position:absolute;left:26px;top:18px;right:20px;font:900 27px/1.15 'Inter Display',Inter;color:#fff">${title}${sub ? `<div style="font:600 18px Inter;color:#aab0ba;margin-top:4px">${sub}</div>` : ''}</div>
    ${bar(v0, g1, l0, '#8a93a3', 50)}${bar(v1, g2, l1, good ? '#5fd08a' : '#ff6b4a', 270)}
    ${change ? `<div style="position:absolute;right:26px;top:122px;padding:4px 14px;border-radius:10px;background:${good ? 'rgba(95,208,138,.16)' : 'rgba(255,107,74,.16)'};font:900 38px 'Inter Display',Inter;color:${good ? '#7ee0a0' : '#ff8a6a'};opacity:${ss(a + 1.8, a + 2.2, t)}">${change}</div>` : ''}</div>`;
}
// Map legend: coloured swatch + text rows.
export function legend(t, a, b, title, rows, { x = 90, y = 150, w = 520 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;padding:20px 24px;${PANEL};opacity:${k}">
    <div style="font:900 26px 'Inter Display',Inter;color:#fff;margin-bottom:8px">${title}</div>
    ${rows.map(([c, txt, tt]) => `<div style="display:flex;align-items:center;gap:12px;margin:8px 0;opacity:${ss(tt, tt + 0.3, t)}"><div style="flex:none;width:22px;height:22px;border-radius:5px;background:${c}"></div><div style="font:700 21px/1.25 Inter;color:#e9e6df">${txt}</div></div>`).join('')}</div>`;
}
// Verdict: two columns ("todavía no" vs "señales de alerta"). left/right: [title, items[[txt, sub, t]], appearAt?]
export function verdict(t, a, b, left, right, { y = 160 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const col = ([title, items, ta = a], c) => { const o = ss(ta, ta + 0.4, t); return `<div style="flex:1;padding:24px 28px;${PANEL};border-top:8px solid ${c};opacity:${o};transform:translateY(${(1 - o) * 18}px)"><div style="font:900 40px 'Inter Display',Inter;color:${c};margin-bottom:8px">${title}</div>
    ${items.map(([txt, sub, tt]) => { const oi = ss(tt, tt + 0.35, t); return `<div style="margin:16px 0;opacity:${oi};transform:translateX(${(1 - oi) * 20}px)"><div style="font:800 31px/1.2 Inter;color:#fff">${txt}</div><div style="font:600 21px Inter;color:#aab0ba;margin-top:3px">${sub}</div></div>`; }).join('')}</div>`; };
  return `<div style="position:absolute;left:150px;right:150px;top:${y}px;display:flex;gap:40px;align-items:flex-start;opacity:${k}">${col(left, '#7fb2ff')}${col(right, '#ff7a5a')}</div>`;
}
// Numbered "what it would take" list (nothing is ticked off).
export function steps(t, a, b, title, items, { x = 90, y = 150, w = 780 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;padding:30px 34px;${PANEL};opacity:${k}">
    <div style="font:900 36px 'Inter Display',Inter;color:#fff;margin-bottom:12px">${title}</div>
    ${items.map(([txt, tt], i) => { const o = ss(tt, tt + 0.3, t); return `<div style="display:flex;align-items:center;gap:18px;margin:14px 0;opacity:${0.2 + 0.8 * o};transform:translateX(${(1 - o) * 14}px)"><div style="flex:none;width:46px;height:46px;border-radius:50%;background:${o > 0.5 ? '#e0a63a' : 'rgba(255,255,255,.15)'};display:flex;align-items:center;justify-content:center;font:900 26px Inter;color:#1d1a16">${i + 1}</div><div style="font:800 31px/1.2 Inter;color:#fff">${txt}</div></div>`; }).join('')}</div>`;
}
// Big centred line of text.
export function big(t, a, b, txt, { top = 400, size = 84 } = {}) {
  const k = ss(a, a + 0.35, t) * (1 - ss(b - 0.35, b, t)); if (k <= 0) return '';
  return `<div style="position:absolute;left:100px;right:100px;top:${top}px;text-align:center;opacity:${k};font:900 ${size}px/1.12 'Inter Display',Inter;color:#fff;text-shadow:0 6px 30px rgba(0,0,0,.7);transform:scale(${0.94 + 0.06 * k})">${txt}</div>`;
}
// Counter with decimals (same look as the narco counter).
export function counterD(t, a, b, x, y, value, label, { from = 0, dur = 1.2, color = '#ffffff', prefix = '', suffix = '', w = null, dec = 1 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const v = from + (value - from) * ss(a, a + dur, t);
  return `<div class="stat" style="left:${x}px;top:${y}px;opacity:${k};transform:scale(${0.9 + 0.1 * k});${w ? `width:${w}px;` : ''}"><div class="v" style="color:${color}">${prefix}${fmt(v, dec)}${suffix}</div><div class="l">${label}</div></div>`;
}
