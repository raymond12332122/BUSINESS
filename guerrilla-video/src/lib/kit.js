// Small helpers shared by scenes: cast spawning and overlay HTML builders.
import * as C from './chars.js';
import * as P from './props.js';
import { ss } from './util.js';
import { tr } from './i18n.js';

export function cast(scene, key, kit, x = 0, z = 0, yaw = 0, opts) {
  const c = C.spawn(key); if (kit) kit(c, opts);
  c.root.position.set(x, 0, z); c.root.rotation.y = yaw; scene.add(c.root); return c;
}
export function villager(c) { c.attach('head', P.strawHat(), [0, 1.13, -0.02]); c.team = 'v'; return c; }

export function chapter(t, num, title, a, b) {
  const k = ss(a, a + 0.5, t) * (1 - ss(b - 0.5, b, t));
  if (k <= 0) return '';
  const x = (1 - ss(a, a + 0.5, t)) * -60;
  return `<div class="chap" style="opacity:${k};transform:translateX(${x}px)"><div class="k">Rule ${num}</div><div class="h">${title}</div>
    <div class="bar" style="width:${ss(a + 0.2, a + 0.9, t) * 100}%"></div></div>`;
}
export function badge(t, era, title, sub, a, b) {
  const k = ss(a, a + 0.4, t) * (1 - ss(b - 0.4, b, t));
  if (k <= 0) return '';
  return `<div class="badge" style="opacity:${k};transform:translateX(${(1 - ss(a, a + 0.4, t)) * 50}px)"><div class="e">${era}</div><div class="t">${title}</div>${sub ? `<div class="s">${sub}</div>` : ''}</div>`;
}
// Quote card whose parts reveal at given times.
export function quote(t, parts, author, a, b, top = 50) {
  const k = ss(a, a + 0.4, t) * (1 - ss(b - 0.4, b, t));
  if (k <= 0) return '';
  const body = parts.map(([txt, tt]) => `<span style="opacity:${0.18 + 0.82 * ss(tt, tt + 0.3, t)}">${txt}</span>`).join(' ');
  return `<div class="quote" style="top:${top}%;opacity:${k};transform:translate(-50%,-50%) scale(${0.96 + 0.04 * ss(a, a + 0.4, t)})"><div class="q">“${body}”</div><div class="a">— ${author}</div></div>`;
}
export function label(ctx, pos, text, cls, k = 1) {
  if (k <= 0) return '';
  const [x, y, ok] = ctx.project(pos); if (!ok) return '';
  return `<div class="lbl ${cls}" style="left:${x}px;top:${y}px;opacity:${k}">${text}</div>`;
}
export function stat(x, y, v, l, k = 1, color = '#fff') {
  if (k <= 0) return '';
  return `<div class="stat" style="left:${x}px;top:${y}px;opacity:${k};transform:scale(${0.9 + 0.1 * k})"><div class="v" style="color:${color}">${v}</div><div class="l">${l}</div></div>`;
}
// Split a narration line into n timed parts (by character length), returns start times.
export function partTimes(line, parts) {
  parts = parts.map(tr);
  if (line.words && line.words.length) {
    // start of each part = timestamp of its first spoken word
    let wi = 0; const out = [];
    for (const p of parts) { out.push(line.words[Math.min(wi, line.words.length - 1)].t0); wi += p.trim().split(/\s+/).length; }
    return out;
  }
  const tot = parts.reduce((a, p) => a + p.length, 0); let acc = line.t0; const out = [];
  for (const p of parts) { out.push(acc); acc += (line.t1 - line.t0) * p.length / tot; }
  return out;
}
