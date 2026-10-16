// Overlays for the independence of the Americas video: everything from the WW1 video plus umamusume cast cards
// (who plays whom, with a nod to her personality), independence date cards and the closing credits roll.
import { ss, clamp } from '../lib/util.js';
export * from '../ww1/ui.js';

const K = (t, a, b, fi = 0.4, fo = 0.35) => ss(a, a + fi, t) * (1 - ss(b - fo, b, t));
const PANEL = 'background:rgba(14,16,22,.88);border-radius:18px;box-shadow:0 18px 50px rgba(0,0,0,.35)';
const SHOE = (c = '#e0b84a', w = 34) => `<svg width="${w}" height="${w}" viewBox="0 0 40 40" style="display:block"><path d="M8 34 C3 22 6 8 20 6 C34 8 37 22 32 34 L26 34 C30 24 28 13 20 12 C12 13 10 24 14 34 Z" fill="${c}"/>
  ${[[9, 27], [8, 19], [12, 12], [31, 27], [32, 19], [28, 12]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#1a1712"/>`).join('')}</svg>`;

// Cast card: "UMA as FIGURE" + a line about her personality. side 'l' | 'r'.
export function cast(t, a, b, uma, figure, quirk, { side = 'l', top = 96, col = '#e0b84a', w = 660 } = {}) {
  const k = K(t, a, b, 0.45, 0.4); if (k <= 0) return '';
  const pos = side === 'l' ? `left:72px` : `right:72px`, dx = (1 - k) * (side === 'l' ? -40 : 40);
  return `<div style="position:absolute;${pos};top:${top}px;width:${w}px;padding:16px 24px 18px;${PANEL};border-left:8px solid ${col};opacity:${k};transform:translateX(${dx}px)">
    <div style="display:flex;align-items:center;gap:12px">${SHOE(col)}<div style="font:800 19px Inter;letter-spacing:.22em;color:${col}">ELENCO</div></div>
    <div style="font:900 38px/1.08 'Inter Display',Inter;color:#fff;margin-top:8px">${uma}</div>
    <div style="font:700 25px Inter;color:#d8d2c4;margin-top:2px">como <b style="color:#fff">${figure}</b></div>
    <div style="font:600 26px/1.3 Inter;color:#d6d0c2;margin-top:10px;font-style:italic">${quirk}</div></div>`;
}
// Independence card: country, date, a short note; flag colours as a stripe.
export function indep(t, a, b, country, date, note = '', flag = ['#c0392b', '#f4f1ea'], { x = 1500, y = 150, w = 420 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const stripe = flag.map(c => `<div style="flex:1;background:${c}"></div>`).join('');
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;transform:translateX(-50%) translateY(${(1 - k) * 20}px) scale(${0.94 + 0.06 * k});opacity:${k};${PANEL};overflow:hidden">
    <div style="display:flex;height:12px">${stripe}</div><div style="padding:16px 24px 18px;text-align:center">
    <div style="font:800 20px Inter;letter-spacing:.2em;color:#e0b84a">INDEPENDENCIA</div>
    <div style="font:900 44px/1.05 'Inter Display',Inter;color:#fff;margin-top:6px">${country}</div>
    <div style="font:800 28px Inter;color:#f2ede2;margin-top:6px">${date}</div>${note ? `<div style="font:600 20px/1.3 Inter;color:#c9c4b8;margin-top:8px">${note}</div>` : ''}</div></div>`;
}
// Year counter in a corner, e.g. the passing years on the map.
export function year(t, a, b, y, { x = 1700, top = 70, label = '' } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  return `<div style="position:absolute;left:${x}px;top:${top}px;transform:translateX(-50%);text-align:center;opacity:${k}">
    <div style="font:900 86px/1 'Inter Display',Inter;color:#fff;text-shadow:0 4px 20px rgba(0,0,0,.55)">${y}</div>${label ? `<div style="font:900 30px Inter;letter-spacing:.06em;color:#ffe2a0;margin-top:6px;text-shadow:0 2px 10px rgba(0,0,0,.7)">${label}</div>` : ''}</div>`;
}
// Closing credits: rows [uma, figure, quirk] scrolling up from tA to tB.
export function credits(t, a, b, rows, { title = 'ELENCO', x = 1290, w = 560, speed = 1 } = {}) {
  const k = K(t, a, b, 0.6, 0.6); if (k <= 0) return '';
  const rowH = 118, H = rows.length * rowH + 220, prog = clamp((t - a) / Math.max(0.1, b - a));
  const y = 1080 - prog * (H + 1080) * 0.5 * speed;
  const items = rows.map(([u, f, q]) => `<div style="height:${rowH}px"><div style="font:900 32px 'Inter Display',Inter;color:#fff">${u}</div>
    <div style="font:700 22px Inter;color:#e0b84a;margin-top:2px">${f}</div><div style="font:600 18px/1.3 Inter;color:#c9c4b8;margin-top:4px;font-style:italic">${q}</div></div>`).join('');
  return `<div style="position:absolute;left:${x}px;top:0;bottom:0;width:${w}px;overflow:hidden;opacity:${k};-webkit-mask-image:linear-gradient(transparent 0,#000 120px,#000 960px,transparent 1080px)">
    <div style="position:absolute;left:0;right:0;top:${y}px;padding:30px 36px;${PANEL}"><div style="font:900 30px Inter;letter-spacing:.3em;color:#e0b84a;margin-bottom:26px">${title}</div>${items}</div></div>`;
}
// Comic speech bubble pinned above a 3D point.
export function bubble(ctx, pos, text, k = 1, { w = 0, col = '#fffdf6', ink = '#1f1a16', size = 30 } = {}) {
  if (k <= 0) return ''; const [x, y, ok] = ctx.project(pos); if (!ok) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-100%) translateY(-22px) scale(${0.7 + 0.3 * k});transform-origin:50% 100%;opacity:${k}">
    <div style="${w ? `width:${w}px;` : 'white-space:nowrap;'}background:${col};color:${ink};font:900 ${size}px/1.15 'Inter Display',Inter;padding:12px 20px;border-radius:22px;border:4px solid #1f1a16;box-shadow:0 8px 20px rgba(0,0,0,.35);text-align:center">${text}</div>
    <div style="position:absolute;left:50%;bottom:-17px;transform:translateX(-50%);width:0;height:0;border:13px solid transparent;border-top:16px solid #1f1a16"></div>
    <div style="position:absolute;left:50%;bottom:-10px;transform:translateX(-50%);width:0;height:0;border:9px solid transparent;border-top:12px solid ${col}"></div></div>`;
}
// Social pyramid of colonial Spanish America: tiers [[label, sub, colour, appearAt]] top to bottom.
export function pyramid(t, a, b, tiers, { x = 1440, y = 140, w = 760 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const n = tiers.length;
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;transform:translateX(-50%);opacity:${k}">${tiers.map(([lab, sub, col, ta], i) => { const o = ss(ta, ta + 0.35, t), ww = 36 + 64 * (i + 1) / n;
    return `<div style="margin:0 auto 10px;width:${ww}%;padding:10px 0 12px;background:${col};border-radius:12px;text-align:center;box-shadow:0 10px 26px rgba(0,0,0,.35);opacity:${o};transform:translateY(${(1 - o) * 14}px)">
      <div style="font:900 32px 'Inter Display',Inter;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.35)">${lab}</div><div style="font:700 19px Inter;color:rgba(255,255,255,.9);margin-top:2px">${sub}</div></div>`; }).join('')}</div>`;
}
// Big title over the opening shot.
export function title(t, a, b, kicker, head, sub) {
  const k = K(t, a, b, 0.6, 0.5); if (k <= 0) return '';
  return `<div class="title" style="opacity:${k};transform:translateY(${(1 - k) * 20}px)"><div class="k">${kicker}</div><div class="h" style="font-size:112px">${head}</div><div class="s">${sub}</div></div>`;
}
