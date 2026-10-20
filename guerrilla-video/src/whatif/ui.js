// Overlays for "¿Qué pasaría si...?": leader cards with flags, counters, the phone-call timer, versus panels,
// the photo finish, plus everything from the earlier videos (bubbles, titles, credits, film grain).
import { ss, clamp } from '../lib/util.js';
import { flagURL } from './flags.js';
import { LEADERS } from './kit.js';
export * from '../amer/ui.js';
export { counter, source, tag, titleCard } from '../narco/ui.js';

const K = (t, a, b, fi = 0.4, fo = 0.35) => ss(a, a + fi, t) * (1 - ss(b - fo, b, t));
const PANEL = 'background:rgba(14,16,22,.88);border-radius:18px;box-shadow:0 18px 50px rgba(0,0,0,.35)';
const flagImg = (code, w = 66) => `<img src="${flagURL(code)}" style="width:${w}px;height:${Math.round(w * 2 / 3)}px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,.4);display:block">`;
export const fade = (t, a, b, f = 0.35) => ss(a, a + f, t) * (1 - ss(b - f, b, t));

// Leader card: flag + country, the umamusume's name, and a line about her personality.
export function leader(t, a, b, key, { side = 'l', top = 92, role = null, line = null, w = 640 } = {}) {
  const k = K(t, a, b, 0.45, 0.4); if (k <= 0) return '';
  const [uma, country, code, quip] = LEADERS[key];
  const pos = side === 'l' ? 'left:72px' : 'right:72px', dx = (1 - k) * (side === 'l' ? -40 : 40);
  return `<div style="position:absolute;${pos};top:${top}px;width:${w}px;padding:18px 24px 18px;${PANEL};opacity:${k};transform:translateX(${dx}px)">
    <div style="display:flex;align-items:center;gap:16px">${flagImg(code)}<div><div style="font:800 19px Inter;letter-spacing:.2em;color:#e0b84a">${(role || (key === 'rudolf' || key === 'sirius' ? 'PRESIDENTA' : 'LÍDER')).toUpperCase()}</div>
    <div style="font:900 30px 'Inter Display',Inter;color:#fff">${country}</div></div></div>
    <div style="font:900 40px/1.08 'Inter Display',Inter;color:#fff;margin-top:12px">${uma}</div>
    <div style="font:600 25px/1.32 Inter;color:#d6d0c2;margin-top:8px;font-style:italic">${line || quip}</div></div>`;
}
// Small floating chip with flag and name pinned to a 3D point (on the world map).
export function chip(ctx, pos, code, name, k, { sub = '' } = {}) {
  if (k <= 0) return ''; const [x, y, ok] = ctx.project(pos); if (!ok) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-100%) translateY(-14px) scale(${0.8 + 0.2 * k});opacity:${k};display:flex;align-items:center;gap:10px;padding:8px 14px 8px 10px;${PANEL};border-radius:14px">
    ${flagImg(code, 42)}<div><div style="font:900 24px 'Inter Display',Inter;color:#fff;white-space:nowrap">${name}</div>${sub ? `<div style="font:700 17px Inter;color:#e0b84a;white-space:nowrap">${sub}</div>` : ''}</div></div>`;
}
// Digital clock card (e.g. 5:59 -> 6:00 a.m.).
export function digital(t, a, b, text, { x = 1600, y = 120, sub = '', col = '#ff4a3a' } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translateX(-50%) scale(${0.92 + 0.08 * k});opacity:${k};padding:14px 30px;${PANEL};text-align:center">
    <div style="font:700 78px/1 'DejaVu Sans Mono',monospace;color:${col};letter-spacing:.06em;text-shadow:0 0 18px ${col}88">${text}</div>${sub ? `<div style="font:800 20px Inter;color:#e6e0d4;margin-top:6px;letter-spacing:.12em">${sub}</div>` : ''}</div>`;
}
// Phone-call bar: who is on the line and the running time.
export function callBar(t, a, b, secs, { ended = false } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const s = Math.max(0, Math.floor(secs)), mm = String(Math.floor(s / 60)).padStart(2, '0'), ss2 = String(s % 60).padStart(2, '0');
  return `<div style="position:absolute;left:50%;top:60px;transform:translateX(-50%) translateY(${(1 - k) * -20}px);opacity:${k};display:flex;align-items:center;gap:18px;padding:12px 26px;${PANEL};border-radius:40px">
    ${flagImg('mx', 48)}<div style="font:800 22px Inter;color:#fff">Rudolf</div>
    <div style="font:700 44px 'DejaVu Sans Mono',monospace;color:${ended ? '#ff5a4a' : '#7dff9a'};min-width:150px;text-align:center">${mm}:${ss2}</div>
    <div style="font:800 22px Inter;color:#fff">Sirius</div>${flagImg('us', 48)}${ended ? `<div style="font:900 22px Inter;color:#ff5a4a;letter-spacing:.12em">LLAMADA FINALIZADA</div>` : ''}</div>`;
}
// A list that crosses items out as they are named: items = [[text, time], ...].
export function noList(t, a, b, title, items, { x = 1340, y = 170, w = 470 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;padding:20px 26px;${PANEL};opacity:${k}">
    <div style="font:800 20px Inter;letter-spacing:.2em;color:#e0b84a;margin-bottom:10px">${title}</div>${items.map(([txt, tt]) => { const o = ss(tt, tt + 0.3, t);
      return `<div style="display:flex;align-items:center;gap:14px;margin:8px 0;opacity:${0.25 + 0.75 * o}"><div style="font:900 40px Inter;color:#ff4a3a;transform:scale(${0.6 + 0.4 * o})">✕</div><div style="font:800 32px Inter;color:#fff">${txt}</div></div>`; }).join('')}</div>`;
}
// Two opposed positions, left and right of the frame.
export function versus(t, a, b, L, R, { ta = a, tb = a } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const side = (s, [head, sub, code, col], tt) => { const o = ss(tt, tt + 0.4, t);
    return `<div style="position:absolute;${s}:70px;top:130px;width:520px;padding:20px 26px;${PANEL};border-top:8px solid ${col};opacity:${k * o};transform:translateY(${(1 - o) * 20}px)">
      <div style="display:flex;align-items:center;gap:14px">${flagImg(code, 54)}<div style="font:900 44px 'Inter Display',Inter;color:#fff">${head}</div></div><div style="font:700 26px/1.3 Inter;color:#e6e0d4;margin-top:10px">${sub}</div></div>`; };
  return side('left', L, ta) + side('right', R, tb);
}
// Card that pops in (pilot licence, ranking badges).
export function popCard(t, a, b, kicker, title, sub = '', { x = 1520, y = 150, w = 520, accent = '#e0b84a', icon = '' } = {}) {
  const k = K(t, a, b), pop = 1 + 0.12 * Math.sin(clamp((t - a) / 0.35) * Math.PI); if (k <= 0) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;transform:translateX(-50%) scale(${pop * (0.9 + 0.1 * k)});opacity:${k};padding:20px 26px;${PANEL};border-left:8px solid ${accent}">
    ${icon ? `<div style="font:900 54px Inter;color:${accent};float:right;line-height:1">${icon}</div>` : ''}<div style="font:800 20px Inter;letter-spacing:.2em;color:${accent}">${kicker}</div>
    <div style="font:900 40px/1.1 'Inter Display',Inter;color:#fff;margin-top:6px">${title}</div>${sub ? `<div style="font:600 24px/1.3 Inter;color:#d6d0c2;margin-top:8px">${sub}</div>` : ''}</div>`;
}
// Fuel gauge sweeping from full to empty (Twin Turbo).
export function fuel(t, a, b, level, { x = 1640, y = 140 } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  const ang = -120 + 240 * clamp(level), col = level < 0.2 ? '#ff4a3a' : '#7dff9a';
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:240px;height:150px;transform:translateX(-50%);opacity:${k};${PANEL};overflow:hidden">
    <div style="position:absolute;left:20px;top:22px;width:200px;height:200px;border-radius:50%;border:10px solid #3a3d44;border-top-color:#7dff9a;border-left-color:#e8c020;border-right-color:#ff4a3a;transform:rotate(-45deg)"></div>
    <div style="position:absolute;left:116px;top:30px;width:8px;height:100px;background:${col};border-radius:4px;transform-origin:4px 92px;transform:rotate(${-ang}deg)"></div>
    <div style="position:absolute;left:14px;bottom:10px;font:900 26px Inter;color:#ff4a3a">E</div><div style="position:absolute;right:16px;bottom:10px;font:900 26px Inter;color:#7dff9a">F</div>
    <div style="position:absolute;left:0;right:0;top:8px;text-align:center;font:800 16px Inter;color:#e6e0d4;letter-spacing:.2em">TURBO</div></div>`;
}
// Photo-finish frame: sepia vignette, the finish line, and a verdict stamp.
export function photoFinish(t, a, b, verdict, tv) {
  const k = K(t, a, b, 0.15, 0.4); if (k <= 0) return '';
  const v = ss(tv, tv + 0.2, t), sc = 1 + 0.5 * (1 - v);
  return `<div style="position:absolute;inset:0;opacity:${k};background:radial-gradient(ellipse at center, rgba(120,90,40,0) 50%, rgba(40,25,10,.55) 100%);mix-blend-mode:multiply"></div>
    <div style="position:absolute;left:50%;top:0;bottom:0;width:4px;background:rgba(255,40,40,.85);opacity:${k};box-shadow:0 0 12px rgba(255,0,0,.6)"></div>
    <div style="position:absolute;left:80px;top:70px;opacity:${k};font:800 26px 'DejaVu Sans Mono',monospace;color:#fff;letter-spacing:.2em;text-shadow:0 2px 8px #000">FOTO FINISH · ${(t * 1000 % 1000).toFixed(0).padStart(3, '0')}</div>
    ${v > 0 ? `<div style="position:absolute;left:50%;top:44%;transform:translate(-50%,-50%) rotate(-8deg) scale(${sc});opacity:${v};border:9px solid #e8c020;color:#e8c020;padding:14px 46px;font:900 110px/1 'Inter Display',Inter;letter-spacing:.06em;border-radius:16px;background:rgba(20,16,10,.82);text-shadow:0 4px 18px rgba(0,0,0,.6)">${verdict}</div>` : ''}`;
}
// Sign-up board with names ticking in.
export function roster(t, a, b, rows, { x = 1500, y = 130, w = 560, title = 'INSCRITAS' } = {}) {
  const k = K(t, a, b); if (k <= 0) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;transform:translateX(-50%);opacity:${k};padding:22px 28px;${PANEL};border-top:8px solid #0f5a3a">
    <div style="font:900 24px Inter;letter-spacing:.2em;color:#7dd8a0;margin-bottom:12px">${title}</div>${rows.map(([key, tt], i) => { const o = ss(tt, tt + 0.3, t), [uma, , code] = LEADERS[key];
      return `<div style="display:flex;align-items:center;gap:14px;margin:9px 0;opacity:${o};transform:translateX(${(1 - o) * 30}px)"><div style="font:900 28px Inter;color:#e0b84a;width:34px">${i + 1}</div>${flagImg(code, 44)}<div style="font:800 30px Inter;color:#fff">${uma}</div></div>`; }).join('')}</div>`;
}
// Big centred kicker + headline for the opening.
export function bigTitle(t, a, b, kicker, head, sub = '', { top = 150 } = {}) {
  const k = K(t, a, b, 0.6, 0.5); if (k <= 0) return '';
  return `<div style="position:absolute;left:0;right:0;top:${top}px;text-align:center;opacity:${k};transform:translateY(${(1 - k) * 24}px)">
    <div style="font:900 34px Inter;letter-spacing:.32em;color:#ffd36a;text-shadow:0 3px 14px rgba(0,0,0,.6)">${kicker}</div>
    <div style="font:900 96px/1.02 'Inter Display',Inter;color:#fff;margin-top:12px;text-shadow:0 6px 28px rgba(0,0,0,.55)">${head}</div>
    ${sub ? `<div style="font:800 36px/1.3 Inter;color:#f2ede2;margin-top:14px;text-shadow:0 3px 14px rgba(0,0,0,.6)">${sub}</div>` : ''}</div>`;
}
// Japanese "menacing" letters drifting around a smiling Grass Wonder.
export function menace(t, a, b, { x = 1250, y = 220 } = {}) {
  const k = K(t, a, b, 0.5, 0.4); if (k <= 0) return '';
  return `<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 55%, rgba(40,0,60,0) 30%, rgba(40,0,60,.55) 100%);opacity:${k}"></div>` +
    [0, 1, 2, 3].map(i => `<div style="position:absolute;left:${x + (i % 2) * 140 - 60}px;top:${y + i * 120 + Math.sin(t * 3 + i) * 10}px;opacity:${k};font:900 ${84 - i * 6}px 'IPAGothic',sans-serif;color:#b04aff;text-shadow:0 0 14px #2a004a, 3px 3px 0 #2a004a;transform:rotate(${-8 + i * 5}deg) scale(${1 + 0.05 * Math.sin(t * 6 + i)})">ゴ</div>`).join('');
}
