// HTML overlays for the corruption & cartels video: data graphics, cards and source footnotes.
import { ss, clamp } from '../lib/util.js';
export { film, nameplate, newspaper, doc, stamp, card, shout } from '../mx/ui.js';
export { badge, quote, stat, label } from '../lib/kit.js';

const K = (t, a, b, fi = 0.4, fo = 0.35) => ss(a, a + fi, t) * (1 - ss(b - fo, b, t));
const fmt = n => Math.round(n).toLocaleString('es-MX');
const PANEL = 'background:rgba(14,16,22,.86);border-radius:18px;box-shadow:0 18px 50px rgba(0,0,0,.35)';

// Small source footnote, bottom-right above the captions.
export function source(t, a, b, text) {
  const k = K(t, a, b); if (k <= 0) return '';
  return `<div style="position:absolute;right:56px;bottom:198px;opacity:${0.9 * k};font:600 19px Inter;color:#e9e6df;background:rgba(14,16,22,.66);padding:7px 14px;border-radius:8px">${text}</div>`;
}
// Opening questions stacked in the centre.
export function questions(t, a, b, items) {
  const k = K(t, a, b); if (k <= 0) return '';
  return `<div style="position:absolute;left:0;right:0;top:250px;text-align:center;opacity:${k}">${items.map(([q, tt]) => { const o = ss(tt, tt + 0.35, t);
    return `<div style="font:900 70px/1.18 'Inter Display',Inter;color:#fff;text-shadow:0 5px 24px rgba(0,0,0,.6);opacity:${o};transform:translateY(${(1 - o) * 18}px);margin:10px 0">${q}</div>`; }).join('')}</div>`;
}
export function titleCard(t, a, b, kicker, title, sub = '', top = 130) {
  const k = K(t, a, b, 0.6, 0.5); if (k <= 0) return '';
  return `<div class="title" style="top:${top}px;opacity:${k};transform:scale(${0.95 + 0.05 * ss(a, a + 0.6, t)})"><div class="k">${kicker}</div><div class="h" style="font-size:104px;line-height:1.02">${title}</div>${sub ? `<div class="s">${sub}</div>` : ''}</div>`;
}
// Big number that counts up.
export function counter(t, a, b, x, y, value, label, { from = 0, dur = 1.2, color = '#ffffff', prefix = '', suffix = '', w = null } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const v = from + (value - from) * ss(a, a + dur, t);
  return `<div class="stat" style="left:${x}px;top:${y}px;opacity:${k};transform:scale(${0.9 + 0.1 * k});${w ? `width:${w}px;` : ''}"><div class="v" style="color:${color}">${prefix}${fmt(v)}${suffix}</div><div class="l">${label}</div></div>`;
}

// ------------------------------------------------------------ homicides per year (INEGI, death certificates)
export const INEGI = { 2006: 10452, 2007: 8867, 2008: 14006, 2009: 19803, 2010: 25757, 2011: 27213, 2012: 25967, 2013: 23063, 2014: 20010, 2015: 20762,
  2016: 24559, 2017: 32079, 2018: 36685, 2019: 36661, 2020: 36773, 2021: 35700, 2022: 33287, 2023: 32252, 2024: 33550, 2025: 27989 };
// progress: fraction of the 2006..upto series drawn. bands: [[y0, y1, label, color]] shaded presidential terms.
export function homChart(t, a, b, { upto = 2025, progress = 1, labels = [], bands = [], x = 960, y = 470, w = 1180, h = 520, title = 'Asesinatos por año en México' } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const Y0 = 2006, Y1 = 2025, VMAX = 40000, pad = { l: 92, r: 40, t: bands.length ? 100 : 76, b: 84 };
  const W = w - pad.l - pad.r, H = h - pad.t - pad.b;
  const px = yr => pad.l + (yr - Y0) / (Y1 - Y0) * W, py = v => pad.t + H - v / VMAX * H;
  const yrs = Object.keys(INEGI).map(Number).filter(yr => yr <= upto);
  const n = Math.max(1, (yrs.length - 1) * clamp(progress)), last = Math.floor(n), frac = n - last;
  const pts = yrs.slice(0, last + 1).map(yr => [px(yr), py(INEGI[yr])]);
  if (frac > 0 && last + 1 < yrs.length) { const [x0, y0] = [px(yrs[last]), py(INEGI[yrs[last]])], [x1, y1] = [px(yrs[last + 1]), py(INEGI[yrs[last + 1]])]; pts.push([x0 + (x1 - x0) * frac, y0 + (y1 - y0) * frac]); }
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
  const area = pts.length > 1 ? `${path}L${pts[pts.length - 1][0].toFixed(1)},${pad.t + H}L${pts[0][0].toFixed(1)},${pad.t + H}Z` : '';
  const grid = [10000, 20000, 30000, 40000].map(v => `<line x1="${pad.l}" x2="${pad.l + W}" y1="${py(v)}" y2="${py(v)}" stroke="rgba(255,255,255,.12)" stroke-width="1.5"/><text x="${pad.l - 14}" y="${py(v) + 7}" fill="#aab0ba" font-size="20" font-weight="700" text-anchor="end">${v / 1000} mil</text>`).join('');
  const ticks = [2006, 2010, 2014, 2018, 2022, 2025].map(yr => `<text x="${px(yr)}" y="${pad.t + H + 34}" fill="#c9ced6" font-size="22" font-weight="700" text-anchor="middle">${yr}</text>`).join('');
  const bandSvg = bands.map(([a0, a1, lab, col, tt = 0]) => { const o = ss(tt, tt + 0.4, t); if (o <= 0) return ''; const x0 = px(Math.max(Y0, a0)), x1 = px(Math.min(Y1, a1));
    return `<rect x="${x0}" y="${pad.t}" width="${x1 - x0}" height="${H}" fill="${col}" opacity="${0.22 * o}"/><text x="${(x0 + x1) / 2}" y="${pad.t - 12}" fill="#e8e4dc" opacity="${o}" font-size="21" font-weight="800" text-anchor="middle">${lab}</text>`; }).join('');
  const lab = labels.map(([yr, tt, txt]) => { const o = ss(tt, tt + 0.35, t); if (o <= 0 || yr > upto) return ''; const X = px(yr), Yv = py(INEGI[yr]);
    return `<circle cx="${X}" cy="${Yv}" r="9" fill="#ff6b4a" stroke="#14161c" stroke-width="3" opacity="${o}"/><g opacity="${o}"><rect x="${X - 92}" y="${Yv - 66}" width="184" height="44" rx="10" fill="#f4efe2"/><text x="${X}" y="${Yv - 36}" fill="#1d1a16" font-size="25" font-weight="900" text-anchor="middle">${txt || fmt(INEGI[yr])}</text></g>`; }).join('');
  return `<div style="position:absolute;left:${x - w / 2}px;top:${y - h / 2}px;width:${w}px;height:${h}px;${PANEL};opacity:${k};transform:translateY(${(1 - ss(a, a + 0.4, t)) * 24}px)">
    <div style="position:absolute;left:28px;top:18px;font:900 30px 'Inter Display',Inter;color:#fff">${title}</div>
    <svg width="${w}" height="${h}" style="position:absolute;inset:0;font-family:Inter">${bandSvg}${grid}
      <path d="${area}" fill="rgba(255,107,74,.16)"/><path d="${path}" fill="none" stroke="#ff6b4a" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>${ticks}${lab}</svg>
    <div style="position:absolute;right:24px;bottom:12px;font:600 17px Inter;color:#9aa1ab">Fuente: INEGI, defunciones por homicidio (2025 preliminar)</div></div>`;
}
// Two-bar comparison (official daily homicide average).
export function dailyBars(t, a, b, { x = 1370, y = 300 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const g1 = ss(a + 0.2, a + 1.0, t), g2 = ss(a + 0.9, a + 1.8, t), H = 300, s = H / 90;
  const bar = (v, gk, lab, col, xx) => `<div style="position:absolute;left:${xx}px;bottom:70px;width:150px;height:${v * s * gk}px;background:${col};border-radius:8px 8px 3px 3px"></div>
    <div style="position:absolute;left:${xx}px;width:150px;bottom:${78 + v * s * gk}px;text-align:center;font:900 44px 'Inter Display',Inter;color:#fff;opacity:${gk}">${(v * gk).toFixed(1)}</div>
    <div style="position:absolute;left:${xx - 20}px;width:190px;bottom:16px;text-align:center;font:700 21px/1.15 Inter;color:#c9ced6">${lab}</div>`;
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:470px;height:500px;${PANEL};opacity:${k}">
    <div style="position:absolute;left:26px;top:18px;right:20px;font:900 28px/1.15 'Inter Display',Inter;color:#fff">Homicidios dolosos al día<div style="font:600 19px Inter;color:#aab0ba;margin-top:4px">Promedio diario · cifras oficiales (SESNSP)</div></div>
    ${bar(86.9, g1, 'Sept. 2024', '#8a93a3', 50)}${bar(40.8, g2, 'Ago. 2026', '#ff6b4a', 270)}
    <div style="position:absolute;right:26px;top:118px;font:900 40px 'Inter Display',Inter;color:#7ee0a0;opacity:${ss(a + 1.8, a + 2.2, t)}">−53%</div></div>`;
}
// 100 people: 93 never report the crime, 7 report it, fewer than 1 case is solved.
export function dots100(t, a, b, tNo, tYes, tOne, { x = 1060, y = 210 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const cells = [];
  for (let i = 0; i < 100; i++) {
    const col = i < 93 ? (t > tNo ? '#6c727c' : '#d8dbe0') : i < 99 ? (t > tYes ? '#4f8fe8' : '#d8dbe0') : (t > tOne ? '#ffc23a' : t > tYes ? '#4f8fe8' : '#d8dbe0');
    const pop = i === 99 && t > tOne ? `transform:scale(${1 + 0.25 * Math.sin((t - tOne) * 6) * Math.exp(-(t - tOne) * 1.5)})` : '';
    cells.push(`<div style="width:36px;height:36px;border-radius:50%;background:${col};opacity:${ss(a + i * 0.006, a + 0.3 + i * 0.006, t)};${pop}"></div>`);
  }
  const leg = (c, txt, tt) => `<div style="display:flex;align-items:center;gap:12px;margin:8px 0;opacity:${ss(tt, tt + 0.35, t)}"><div style="width:26px;height:26px;border-radius:50%;background:${c}"></div><div style="font:800 27px Inter;color:#fff">${txt}</div></div>`;
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:580px;padding:26px 30px;${PANEL};opacity:${k}">
    <div style="font:900 32px 'Inter Display',Inter;color:#fff;margin-bottom:16px">De cada 100 delitos…</div>
    <div style="display:grid;grid-template-columns:repeat(10,36px);gap:12px 16px">${cells.join('')}</div>
    <div style="margin-top:18px">${leg('#6c727c', '93 no se denuncian', tNo)}${leg('#4f8fe8', '7 se denuncian', tYes)}${leg('#ffc23a', 'menos de 1 se resuelve', tOne)}</div></div>`;
}
// Semicircular gauge (Corruption Perceptions Index).
export function gauge(t, a, b, value, { x = 1180, y = 230, title = '', sub = '', max = 100, color = '#ff6b4a' } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const v = value * ss(a + 0.3, a + 1.5, t), ang = Math.PI * (1 - v / max), R = 170, cx = 280, cy = 250;
  const arc = (a0, a1, col, w) => { const x0 = cx + R * Math.cos(a0), y0 = cy - R * Math.sin(a0), x1 = cx + R * Math.cos(a1), y1 = cy - R * Math.sin(a1); return `<path d="M${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`; };
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:560px;height:470px;${PANEL};opacity:${k}">
    <div style="position:absolute;left:26px;top:20px;right:20px;font:900 28px/1.15 'Inter Display',Inter;color:#fff">${title}</div>
    <svg width="560" height="470" style="position:absolute;inset:0">${arc(Math.PI, 0.0001, 'rgba(255,255,255,.14)', 34)}${v > 0.2 ? arc(Math.PI, ang, color, 34) : ''}
      <text x="${cx}" y="${cy - 10}" fill="#fff" font-family="Inter Display,Inter" font-weight="900" font-size="96" text-anchor="middle">${Math.round(v)}</text>
      <text x="${cx}" y="${cy + 34}" fill="#aab0ba" font-family="Inter" font-weight="700" font-size="24" text-anchor="middle">de ${max}</text>
      <text x="${cx - R}" y="${cy + 54}" fill="#8a909a" font-family="Inter" font-weight="700" font-size="20" text-anchor="middle">0</text><text x="${cx + R}" y="${cy + 54}" fill="#8a909a" font-family="Inter" font-weight="700" font-size="20" text-anchor="middle">100</text></svg>
    <div style="position:absolute;left:26px;right:26px;bottom:26px;font:700 24px/1.3 Inter;color:#e9e6df">${sub}</div></div>`;
}
// Smartphone with a recruitment "job offer" (a known lure; fictional text).
export function phoneAd(t, a, b, { x = 1250, y = 140 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const msg = ss(a + 0.6, a + 1.0, t);
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:360px;height:700px;border-radius:52px;background:#111;padding:18px;box-shadow:0 24px 60px rgba(0,0,0,.5);opacity:${k};transform:rotate(-4deg) translateY(${(1 - ss(a, a + 0.5, t)) * 60}px)">
    <div style="width:100%;height:100%;border-radius:38px;background:linear-gradient(#1f2a3a,#0f1520);overflow:hidden;position:relative;font-family:Inter">
      <div style="height:64px;background:#2a3a52;color:#fff;font:800 24px Inter;display:flex;align-items:center;padding-left:22px">Empleos</div>
      <div style="margin:22px 16px;padding:20px;background:#f4f1ea;border-radius:16px;color:#1d1a16;opacity:${msg};transform:translateY(${(1 - msg) * 20}px)">
        <div style="font:900 30px/1.1 'Inter Display',Inter">SE BUSCAN GUARDIAS DE SEGURIDAD</div>
        <div style="font:800 34px Inter;color:#1f8a4a;margin-top:12px">$4,000 a la semana</div>
        <div style="font:600 22px/1.35 Inter;margin-top:10px">Sin experiencia · Hospedaje y comida · Edad 16 a 25</div>
        <div style="margin-top:16px;background:#25d366;color:#fff;font:800 24px Inter;text-align:center;padding:12px;border-radius:12px">Escríbenos ya</div></div>
      <div style="margin:0 16px;font:700 20px/1.3 Inter;color:#ffb4a8;opacity:${ss(a + 1.6, a + 2.0, t)}">⚠ Ofertas así se usan para reclutar jóvenes</div>
    </div></div>`;
}
// Checklist of proposals.
export function checklist(t, a, b, title, items, { x = 90, y = 150, w = 760 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;padding:30px 34px;${PANEL};opacity:${k}">
    <div style="font:900 36px 'Inter Display',Inter;color:#fff;margin-bottom:12px">${title}</div>
    ${items.map(([txt, tt]) => { const o = ss(tt, tt + 0.3, t); return `<div style="display:flex;align-items:center;gap:18px;margin:14px 0;opacity:${0.25 + 0.75 * o}"><div style="flex:none;width:46px;height:46px;border-radius:12px;background:${o > 0.5 ? '#3fae6a' : 'rgba(255,255,255,.15)'};display:flex;align-items:center;justify-content:center;font:900 30px Inter;color:#fff">${o > 0.5 ? '✓' : ''}</div><div style="font:800 32px/1.2 Inter;color:#fff">${txt}</div></div>`; }).join('')}</div>`;
}
// Two columns: what improves / what gets worse.
export function scoreboard(t, a, b, good, bad, { y = 170 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const col = (title, items, c, icon) => `<div style="flex:1;padding:26px 30px;${PANEL};border-top:8px solid ${c}"><div style="font:900 34px 'Inter Display',Inter;color:${c};margin-bottom:10px">${icon} ${title}</div>
    ${items.map(([txt, sub, tt]) => { const o = ss(tt, tt + 0.35, t); return `<div style="margin:14px 0;opacity:${o};transform:translateX(${(1 - o) * 20}px)"><div style="font:800 32px Inter;color:#fff">${txt}</div><div style="font:600 21px Inter;color:#aab0ba;margin-top:2px">${sub}</div></div>`; }).join('')}</div>`;
  return `<div style="position:absolute;left:150px;right:150px;top:${y}px;display:flex;gap:40px;opacity:${k}">${col('Mejora', good, '#5fd08a', '▼')}${col('Empeora', bad, '#ff7a5a', '▲')}</div>`;
}
// Cards with an icon per cause.
export function causes(t, a, b, items, { y = 150 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  return `<div style="position:absolute;left:110px;right:110px;top:${y}px;display:flex;gap:28px;justify-content:center;opacity:${k}">${items.map(([icon, txt, tt]) => { const o = ss(tt, tt + 0.35, t);
    return `<div style="width:380px;padding:26px 24px;${PANEL};text-align:center;opacity:${o};transform:translateY(${(1 - o) * 30}px) scale(${0.94 + 0.06 * o})"><div style="font-size:78px;line-height:1">${icon}</div><div style="font:800 32px/1.2 Inter;color:#fff;margin-top:14px">${txt}</div></div>`; }).join('')}</div>`;
}
// Icon row (what cartels do besides drugs).
export function icons(t, a, b, items, { y = 760 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  return `<div style="position:absolute;left:0;right:0;top:${y}px;display:flex;gap:22px;justify-content:center;opacity:${k}">${items.map(([ic, txt, tt]) => { const o = ss(tt, tt + 0.3, t);
    return `<div style="padding:14px 22px;${PANEL};display:flex;align-items:center;gap:12px;opacity:${o};transform:translateY(${(1 - o) * 24}px)"><span style="font-size:44px">${ic}</span><span style="font:800 28px Inter;color:#fff">${txt}</span></div>`; }).join('')}</div>`;
}
// Mugshot-style card with a silhouette (no real faces).
export function wanted(t, a, b, name, sub, { x = 1240, y = 170, stampTxt = '', tStamp = 1e9 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const st = ss(tStamp, tStamp + 0.2, t);
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:520px;padding:24px;${PANEL};opacity:${k};transform:translateX(${(1 - ss(a, a + 0.4, t)) * 40}px)">
    <div style="display:flex;gap:22px;align-items:center"><div style="width:150px;height:180px;border-radius:12px;background:linear-gradient(#5a5f69,#3a3e46);position:relative;overflow:hidden">
      <div style="position:absolute;left:43px;top:28px;width:64px;height:64px;border-radius:50%;background:#1d1f24"></div><div style="position:absolute;left:18px;top:100px;width:114px;height:110px;border-radius:57px 57px 0 0;background:#1d1f24"></div></div>
      <div><div style="font:900 40px/1.05 'Inter Display',Inter;color:#fff">${name}</div><div style="font:600 23px/1.3 Inter;color:#c9ced6;margin-top:10px">${sub}</div></div></div>
    ${stampTxt ? `<div style="position:absolute;right:26px;bottom:20px;transform:rotate(-10deg) scale(${1 + 0.5 * (1 - st)});opacity:${st};border:6px solid #e34a3a;color:#e34a3a;padding:6px 16px;font:900 34px Inter;border-radius:8px;background:rgba(20,20,24,.6)">${stampTxt}</div>` : ''}</div>`;
}
// "7 out of 10" traced guns: a row of pistol silhouettes, the first n highlighted.
const PISTOL = (c) => `<svg width="96" height="62" viewBox="0 0 64 40"><path d="M4 7h48l7 4v7H33l-3 3-2 15H14l4-15H4z" fill="${c}"/><rect x="30" y="20" width="6" height="7" rx="2" fill="none" stroke="${c}" stroke-width="2.5"/></svg>`;
export function guns10(t, a, b, n, tHi, { x = 1060, y = 170, title = '', sub = '' } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const cells = []; for (let i = 0; i < 10; i++) { const on = i < n && t > tHi + i * 0.08; cells.push(`<div style="opacity:${ss(a + i * 0.04, a + 0.3 + i * 0.04, t)}">${PISTOL(on ? '#5aa0ff' : 'rgba(255,255,255,.22)')}</div>`); }
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:640px;padding:26px 30px;${PANEL};opacity:${k}">
    <div style="font:900 32px/1.15 'Inter Display',Inter;color:#fff;margin-bottom:18px">${title}</div>
    <div style="display:grid;grid-template-columns:repeat(5,96px);gap:14px 22px">${cells.join('')}</div>
    <div style="font:700 25px/1.3 Inter;color:#e9e6df;margin-top:16px;opacity:${ss(tHi, tHi + 0.4, t)}">${sub}</div></div>`;
}
export const pistolIcon = (c = '#e9e6df', w = 96) => `<svg width="${w}" height="${Math.round(w * 0.62)}" viewBox="0 0 64 40" style="display:inline-block"><path d="M4 7h48l7 4v7H33l-3 3-2 15H14l4-15H4z" fill="${c}"/><rect x="30" y="20" width="6" height="7" rx="2" fill="none" stroke="${c}" stroke-width="2.5"/></svg>`;
// Small two-line label above a 3D point (name + sub).
export function tag(ctx, pos, name, sub, k, col = '#f4efe2') {
  if (k <= 0) return ''; const [x, y, ok] = ctx.project(pos); if (!ok) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-100%) scale(${0.85 + 0.15 * k});opacity:${k};text-align:center;padding:8px 16px;border-radius:12px;background:rgba(20,22,28,.88);box-shadow:0 8px 24px rgba(0,0,0,.35)">
    <div style="font:900 26px 'Inter Display',Inter;color:#fff;white-space:nowrap">${name}</div><div style="font:800 18px Inter;color:${col};letter-spacing:.06em;white-space:nowrap">${sub}</div></div>`;
}
