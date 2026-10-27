// Overlays for "El robo del siglo" (1920x1080 layout): letterbox bars, the title, chapter cards, a security-camera
// time code, the blueprint of the museum with the route of the night, typewritten case files, counters, newspapers,
// red rubber stamps, a wiretap waveform and the closing cast card.
import { ss, clamp } from '../lib/util.js';
const K = (t, a, b, fi = 0.4, fo = 0.35) => ss(a, a + fi, t) * (1 - ss(b - fo, b, t));

// Cinema bars (k = 0..1 slides them in).
export const letterbox = (k, h = 104) => k <= 0 ? '' : `<div style="position:absolute;left:0;right:0;top:0;height:${h * k}px;background:#000"></div><div style="position:absolute;left:0;right:0;bottom:0;height:${h * k}px;background:#000"></div>`;
export const black = k => k > 0 ? `<div style="position:absolute;inset:0;background:#000;opacity:${clamp(k).toFixed(3)}"></div>` : '';
export const flash = k => k > 0 ? `<div style="position:absolute;inset:0;background:#fff;opacity:${clamp(k).toFixed(3)}"></div>` : '';

// The title: "EL ROBO DEL SIGLO" with a light sweep across the letters.
export function title(t, a, b) {
  const k = K(t, a, b, 0.9, 0.7); if (k <= 0) return '';
  const sweep = clamp((t - a - 0.4) / 1.6) * 140 - 20;
  return `<div style="position:absolute;left:0;right:0;top:330px;text-align:center;opacity:${k}">
    <div class="mono" style="font-size:30px;letter-spacing:.6em;color:#c9b48a;margin-bottom:14px">UNA HISTORIA REAL</div>
    <div class="bebas" style="font-size:250px;line-height:.9;color:transparent;background:linear-gradient(100deg,#d9c8a0 ${sweep - 12}%,#fff8e4 ${sweep}%,#d9c8a0 ${sweep + 12}%);-webkit-background-clip:text;background-clip:text;
      filter:drop-shadow(0 8px 30px rgba(0,0,0,.8));transform:scale(${1.04 - 0.04 * k})">EL ROBO DEL SIGLO</div>
    <div style="width:${760 * ss(a + 0.5, a + 1.4, t)}px;height:3px;background:#c9a24a;margin:22px auto 18px"></div>
    <div class="bebas" style="font-size:46px;letter-spacing:.24em;color:#efe6d2">MUSEO NACIONAL DE ANTROPOLOGÍA · NOCHEBUENA DE 1985</div></div>`;
}
// Chapter card (top-left): number and name, a thin gold rule.
export function chapter(t, a, b, n, text) {
  const k = K(t, a, b, 0.5, 0.45); if (k <= 0) return '';
  return `<div style="position:absolute;left:96px;top:150px;opacity:${k};transform:translateX(${(1 - k) * -30}px)">
    <div class="mono" style="font-size:26px;letter-spacing:.4em;color:#c9a24a">${String(n).padStart(2, '0')} / 10</div>
    <div class="bebas" style="font-size:96px;line-height:1;color:#f4ecd8;text-shadow:0 6px 24px rgba(0,0,0,.7)">${text}</div>
    <div style="width:${340 * k}px;height:3px;background:#c9a24a;margin-top:8px"></div></div>`;
}
// Security-camera time code: REC dot, camera name, date and running clock (clock0 in seconds after midnight).
export function cctv(t, a, b, cam, date, clock0, { frame = true } = {}) {
  const k = K(t, a, b, 0.2, 0.2); if (k <= 0) return '';
  const s = Math.floor(clock0 + (t - a)), hh = String(Math.floor(s / 3600) % 24).padStart(2, '0'), mm = String(Math.floor(s / 60) % 60).padStart(2, '0'), sc = String(s % 60).padStart(2, '0');
  const corner = (x, y, r) => `<div style="position:absolute;${x}:70px;${y}:70px;width:60px;height:60px;border-${y}:3px solid rgba(240,240,230,.75);border-${x}:3px solid rgba(240,240,230,.75)"></div>`;
  return `<div style="position:absolute;inset:0;opacity:${k}">${frame ? corner('left', 'top') + corner('right', 'top') + corner('left', 'bottom') + corner('right', 'bottom') : ''}
    <div class="mono" style="position:absolute;left:110px;top:96px;font-size:32px;color:#f0eee4;text-shadow:0 0 8px rgba(0,0,0,.9)"><span style="color:#ff3b3b;opacity:${Math.floor(t * 1.6) % 2 ? 0.25 : 1}">●</span> REC · ${cam}<br><span style="font-size:22px;letter-spacing:.3em;opacity:.75">RECREACIÓN</span></div>
    <div class="mono" style="position:absolute;right:110px;top:96px;font-size:32px;color:#f0eee4;text-align:right;text-shadow:0 0 8px rgba(0,0,0,.9)">${date}<br>${hh}:${mm}:${sc}</div></div>`;
}
// Location / time tag (lower-left above the captions).
export function tag(t, a, b, kicker, text, { x = 96, y = 820 } = {}) {
  const k = K(t, a, b, 0.4, 0.35); if (k <= 0) return '';
  return `<div class="dstamp" style="position:absolute;left:${x}px;top:${y}px;opacity:${k};transform:translateY(${(1 - k) * 10}px)">
    <div class="mono" style="font-size:24px;letter-spacing:.3em;color:#c9a24a;text-shadow:0 2px 8px #000">${kicker}</div>
    <div class="bebas" style="font-size:58px;line-height:1;color:#f4ecd8;text-shadow:0 3px 14px rgba(0,0,0,.8)">${text}</div></div>`;
}
// Typewritten case file on paper (a clip, a header, lines that type themselves in).
export function dossier(t, a, b, head, lines, { x = 1180, y = 170, w = 600, rot = 2, stampText = null, stampAt = null } = {}) {
  const k = K(t, a, b, 0.45, 0.4); if (k <= 0) return '';
  const typed = lines.map((l, i) => { const st = a + 0.5 + i * 0.5, n = Math.floor(clamp((t - st) / 0.5) * l.length); return `<div style="min-height:40px">${l.slice(0, n)}${n > 0 && n < l.length ? '▌' : ''}</div>`; }).join('');
  const st = stampText && t >= stampAt ? stamp(t, stampAt, b, stampText, { inline: true }) : '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;opacity:${k};transform:rotate(${rot}deg) translateY(${(1 - k) * 30}px)">
    <div style="background:#efe6d0;padding:30px 36px 34px;box-shadow:0 20px 60px rgba(0,0,0,.6);background-image:repeating-linear-gradient(0deg,rgba(0,0,0,.035) 0 2px,transparent 2px 38px)">
    <div style="position:absolute;left:40px;top:-22px;width:30px;height:70px;border:5px solid #9aa0a6;border-radius:16px"></div>
    <div class="mono" style="font-size:22px;letter-spacing:.3em;color:#8a2a22;border-bottom:2px solid #8a2a22;padding-bottom:8px;margin-bottom:16px">EXPEDIENTE · ${head}</div>
    <div class="type" style="font-size:31px;line-height:1.3;color:#1c1a18">${typed}</div>${st}</div></div>`;
}
// A red rubber stamp slammed onto the screen (or onto a dossier, inline).
export function stamp(t, a, b, text, { x = 960, y = 540, rot = -8, size = 78, col = '#c8302a', inline = false } = {}) {
  if (t < a) return ''; const k = clamp((t - a) / 0.14), out = 1 - ss(b - 0.3, b, t); if (out <= 0) return '';
  const sc = 1 + 0.9 * (1 - k) ** 2, pos = inline ? 'position:absolute;right:30px;bottom:40px' : `position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%) rotate(${rot}deg) scale(${sc})`;
  return `<div class="bebas" style="${pos};${inline ? `transform:rotate(${rot}deg) scale(${sc});` : ''}opacity:${Math.min(1, k * 1.5) * out};white-space:nowrap;font-size:${size}px;letter-spacing:.08em;color:${col};
    border:7px solid ${col};padding:0 26px;border-radius:8px;mix-blend-mode:normal;text-shadow:0 0 1px ${col}">${text}</div>`;
}
// Mechanical counter (from -> to) with a label.
export function counter(t, a, b, label, from, to, { x = 1500, y = 760, dur = 2.2, pad = 3, col = '#f4ecd8', suffix = '', prefix = '', fmt = null, size = 140, note = '' } = {}) {
  const k = K(t, a, b, 0.3, 0.3); if (k <= 0) return '';
  const v = Math.round(from + (to - from) * ss(a + 0.2, a + 0.2 + dur, t)), txt = fmt ? fmt(v) : String(v).padStart(pad, '0');
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%);opacity:${k};text-align:center">
    <div class="mono" style="font-size:24px;letter-spacing:.35em;color:#c9a24a;text-shadow:0 2px 8px #000;white-space:nowrap">${label}</div>
    <div class="bebas" style="font-size:${size}px;line-height:1;color:${col};text-shadow:0 6px 26px rgba(0,0,0,.8);white-space:nowrap">${prefix}${txt}${suffix}</div>
    ${note ? `<div class="mono" style="font-size:20px;letter-spacing:.15em;color:#d8d0c0;text-shadow:0 2px 8px #000">${note}</div>` : ''}</div>`;
}
// Newspaper front page spinning in (masthead, headline, sub-headline, a drawn photo of the empty case).
export function newspaper(t, a, b, head, sub, { x = 960, y = 520, rot = -4, spin = true, date = 'MÉXICO, D.F. · DICIEMBRE DE 1985', paper = 'EL DIARIO NACIONAL' } = {}) {
  const k = K(t, a, b, 0.6, 0.4); if (k <= 0) return '';
  const u = ss(a, a + 0.8, t), r = spin ? rot + (1 - u) * 540 : rot, s = 0.25 + 0.75 * u;
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:820px;transform:translate(-50%,-50%) rotate(${r}deg) scale(${s});opacity:${k}">
    <div style="background:#ece4d0;padding:24px 34px 30px;box-shadow:0 30px 80px rgba(0,0,0,.7)">
    <div class="play" style="font-weight:900;font-size:64px;text-align:center;color:#141210;border-bottom:4px double #141210;line-height:1.1">${paper}</div>
    <div class="mono" style="font-size:18px;text-align:center;color:#3a342c;margin:6px 0 12px;letter-spacing:.2em">${date}</div>
    <div class="anton" style="font-size:118px;line-height:.95;text-align:center;color:#141210">${head}</div>
    <div class="play" style="font-weight:700;font-size:34px;text-align:center;color:#2a2620;margin-top:12px">${sub}</div>
    <div style="display:flex;gap:18px;margin-top:16px"><div style="flex:1.2;height:150px;background:linear-gradient(180deg,#3a3630,#1a1814);position:relative">
      <div style="position:absolute;left:30%;top:22%;width:40%;height:56%;border:3px solid #9a948a"></div></div>
      <div style="flex:1">${Array.from({ length: 7 }, (_, i) => `<div style="height:10px;background:#8a8478;margin:6px 0;width:${90 - (i % 3) * 12}%"></div>`).join('')}</div></div></div></div>`;
}
// Blueprint of the museum (top view): the avenue, the fence, the U of halls round the patio and the umbrella; prog
// (0..1) draws the night's route in red (fence -> duct -> Maya -> Oaxaca -> Mexica -> back out).
export function blueprint(t, a, b, prog = 0, { labels = true, guards = 0, patrol = -1, note = '', duct = 0 } = {}) {
  const k = K(t, a, b, 0.5, 0.4); if (k <= 0) return '';
  const route = 'M 330 930 L 330 840 L 470 840 L 470 700 L 560 640 L 760 640 L 960 560 L 1160 640 L 1360 640 L 1450 700 L 1450 840 L 1590 840';
  const L = 2400, dash = L * clamp(prog);
  const g = (x, y) => `<g transform="translate(${x},${y})"><circle r="16" fill="#1a3a6a" stroke="#9ad0ff" stroke-width="3"/><text y="7" text-anchor="middle" fill="#9ad0ff" font-size="20" font-family="Share Tech Mono">P</text></g>`;
  const gpos = [[1240, 380], [1270, 400], [1250, 420], [1280, 380], [1300, 410], [1230, 405], [1265, 435], [1295, 440], [1310, 385]];
  return `<div style="position:absolute;inset:0;opacity:${k};background:radial-gradient(ellipse at center,#0f2f55 0%,#081a33 70%,#050f20 100%)">
    <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(140,190,255,.10) 1px,transparent 1px),linear-gradient(90deg,rgba(140,190,255,.10) 1px,transparent 1px);background-size:48px 48px"></div>
    <svg viewBox="0 0 1920 1080" style="position:absolute;inset:0;width:100%;height:100%" font-family="Share Tech Mono">
      <g fill="none" stroke="#cfe6ff" stroke-width="3" opacity="0.9">
        <rect x="380" y="180" width="1160" height="560" />
        <rect x="560" y="300" width="800" height="340" />
        <line x1="380" y1="300" x2="560" y2="300"/><line x1="1360" y1="300" x2="1540" y2="300"/>
        <line x1="760" y1="180" x2="760" y2="300"/><line x1="1160" y1="180" x2="1160" y2="300"/>
        <rect x="860" y="380" width="200" height="140" stroke-dasharray="10 8"/>
        <circle cx="960" cy="450" r="26"/>
        <line x1="140" y1="900" x2="1780" y2="900" stroke-dasharray="4 10"/>
      </g>
      <line x1="140" y1="960" x2="1780" y2="960" stroke="#cfe6ff" stroke-width="2" opacity=".6"/>
      ${labels ? `<g fill="#cfe6ff" font-size="26" letter-spacing="4">
        <text x="960" y="1000" text-anchor="middle">PASEO DE LA REFORMA</text><text x="960" y="890" text-anchor="middle" font-size="20">REJA</text>
        <text x="470" y="250" text-anchor="middle">SALA MAYA</text><text x="960" y="250" text-anchor="middle">SALA OAXACA</text><text x="1450" y="250" text-anchor="middle">SALA MEXICA</text>
        <text x="960" y="560" text-anchor="middle" font-size="22">PATIO · EL PARAGUAS</text></g>` : ''}
      <path d="${route}" fill="none" stroke="#ff4040" stroke-width="7" stroke-linecap="round" stroke-dasharray="${dash} ${L}" style="filter:drop-shadow(0 0 8px #ff3030)"/>
      ${prog > 0.02 ? `<circle cx="330" cy="930" r="10" fill="#ff4040"/>` : ''}
      ${guards ? gpos.slice(0, guards).map(([x, y]) => g(x, y)).join('') + `<text x="1270" y="490" fill="#9ad0ff" font-size="22" text-anchor="middle">9 POLICÍAS · UN SOLO LUGAR</text>` : ''}
      ${patrol >= 0 ? (() => { const loop = [[470, 240], [960, 240], [1450, 240], [1450, 690], [960, 690], [470, 690], [470, 240]], segs = loop.length - 1, u = (patrol % 1) * segs, i = Math.floor(u), f = u - i, [x0, y0] = loop[i], [x1, y1] = loop[i + 1];
        return `<polyline points="${loop.map(p => p.join(',')).join(' ')}" fill="none" stroke="#9ad0ff" stroke-width="3" stroke-dasharray="12 10" opacity=".7"/>${g(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f)}`; })() : ''}
      ${note ? `<text x="960" y="820" fill="#ffd27a" font-size="34" text-anchor="middle" letter-spacing="6">${note}</text>` : ''}
      ${duct > 0 ? `<path d="M 330 900 L 330 840 L 470 840 L 470 700" fill="none" stroke="#ffd27a" stroke-width="16" stroke-dasharray="${900 * duct} 900" opacity=".85"/><text x="500" y="790" fill="#ffd27a" font-size="26" letter-spacing="3">DUCTO DEL AIRE ACONDICIONADO</text>` : ''}
    </svg></div>`;
}
// Split-screen divider (a thin vertical bar at x, 0..1 of the width) and side labels.
export function divider(k, x = 0.5, left = '', right = '') {
  if (k <= 0) return '';
  const lab = (s, side) => s ? `<div class="mono" style="position:absolute;${side}:${side === 'left' ? 60 : 60}px;top:96px;font-size:26px;letter-spacing:.3em;color:#f0e8d8;background:rgba(0,0,0,.55);padding:6px 16px;opacity:${k}">${s}</div>` : '';
  return `<div style="position:absolute;left:${x * 1920 - 3}px;top:0;bottom:0;width:6px;background:#0a0a0a;opacity:${k}"></div>${lab(left, 'left')}${lab(right, 'right')}`;
}
// Wiretap: an intercepted call, a moving waveform and the line "LLAMADA INTERVENIDA".
export function wiretap(t, a, b, { x = 1360, y = 200, from = 'RECLUSORIO', to = 'SATÉLITE' } = {}) {
  const k = K(t, a, b, 0.4, 0.4); if (k <= 0) return '';
  const pts = Array.from({ length: 90 }, (_, i) => { const v = Math.sin(i * 0.5 + t * 9) * Math.sin(i * 0.13 + t * 2.3) * (0.5 + 0.5 * Math.sin(t * 5 + i * 0.07)); return `${i * 5},${40 + v * 34}`; }).join(' ');
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:480px;opacity:${k};background:rgba(4,10,6,.82);border:2px solid #3aff7a;padding:18px 22px;box-shadow:0 0 30px rgba(58,255,122,.2)">
    <div class="mono" style="font-size:24px;color:#3aff7a;letter-spacing:.2em"><span style="opacity:${Math.floor(t * 2) % 2 ? 0.3 : 1}">●</span> LLAMADA INTERVENIDA</div>
    <svg viewBox="0 0 450 80" style="width:100%;height:80px;margin:8px 0"><polyline points="${pts}" fill="none" stroke="#3aff7a" stroke-width="2.5"/></svg>
    <div class="mono" style="font-size:22px;color:#b8ffcf">${from} ⟶ ${to}</div></div>`;
}
// Closing cast card: who played whom.
export function cast(t, a, b, rows, { x = 1180, y = 230 } = {}) {
  const k = K(t, a, b, 0.6, 0.6); if (k <= 0) return '';
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:640px;opacity:${k}">
    <div class="mono" style="font-size:24px;letter-spacing:.4em;color:#c9a24a;margin-bottom:16px">REPARTO</div>
    ${rows.map(([who, actor], i) => `<div style="display:flex;justify-content:space-between;gap:20px;border-bottom:1px solid rgba(240,230,210,.18);padding:10px 0;opacity:${ss(a + 0.3 + i * 0.25, a + 0.7 + i * 0.25, t)}">
      <span class="bebas" style="font-size:40px;color:#f4ecd8">${who}</span><span style="font:italic 600 26px Inter;color:#cfc4ae;align-self:center">${actor}</span></div>`).join('')}</div>`;
}

// A calendar page for December 1985 with a red circle round one day (day moves the circle between days, k = 0..1).
export function calendarPage(t, a, b, from, to = from, k = 0, { x = 1240, y = 170, label = '' } = {}) {
  const v = K(t, a, b, 0.4, 0.35); if (v <= 0) return '';
  const cell = d => { const i = d - 1; return [(i % 7) * 76 + 38, Math.floor(i / 7) * 66 + 33]; };   // 1 Dec 1985 was a Sunday
  const [x0, y0] = cell(from), [x1, y1] = cell(to), cx = x0 + (x1 - x0) * ss(0, 1, k), cy = y0 + (y1 - y0) * ss(0, 1, k);
  const days = Array.from({ length: 31 }, (_, d) => { const [px, py] = cell(d + 1); return `<text x="${px}" y="${py + 10}" text-anchor="middle" font-size="30" fill="${(d + 1) % 7 === 1 ? '#b8302a' : '#2a2620'}">${d + 1}</text>`; }).join('');
  return `<div style="position:absolute;left:${x}px;top:${y}px;opacity:${v};transform:rotate(-2deg) translateY(${(1 - v) * 20}px);background:#f2ecdc;width:560px;box-shadow:0 24px 60px rgba(0,0,0,.6)">
    <div class="bebas" style="background:#b8302a;color:#fff;font-size:64px;text-align:center;padding:6px 0">DICIEMBRE 1985</div>
    <div class="mono" style="display:flex;justify-content:space-around;font-size:20px;color:#6a6258;padding:8px 6px 0">${['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => `<span>${d}</span>`).join('')}</div>
    <svg viewBox="0 0 532 400" style="width:532px;height:400px;margin:0 14px">${days}
      <ellipse cx="${cx}" cy="${cy}" rx="34" ry="28" fill="none" stroke="#d0201c" stroke-width="5" transform="rotate(-8 ${cx} ${cy})"/>
      ${label ? `<text x="${cx}" y="${cy - 38}" text-anchor="middle" font-size="24" fill="#d0201c" font-family="Special Elite">${label}</text>` : ''}</svg></div>`;
}
