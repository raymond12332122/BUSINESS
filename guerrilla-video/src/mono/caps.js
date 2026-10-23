// One word at a time, like a late-night briefing: each spoken word replaces the last, in a pixel font.
// Key words light up gold (money, power) or red (the eerie part).
const norm = w => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9&]/g, '');
const HOT = new Set(['mercado', 'entero', 'crezca', 'barato', 'mitad', 'millones', 'cheque', 'pequenas', 'linea', 'precios', 'mexico',
  'treinta', 'cuatro', 'siete', 'pedazos', 'antimonopolio', 'consejo', 'estudiantil', 'monopolio', 'standard', 'oil', 'at&t']);
const RED = new Set(['ley', 'apague', 'asesinas', 'enterrar', 'duela', 'adentro', 'esto', 'parten', 'juntar', 'guerra', 'contra']);

export function caption(lines, t, inst) {
  for (const l of lines) {
    if (t < l.t0 - 0.1 || t > l.t1 + 0.35 || !l.words?.length) continue;
    const toks = l.text.split(/\s+/).filter(Boolean), ws = l.words, same = toks.length === ws.length;
    let i = -1;
    for (let k = 0; k < ws.length; k++) if (t >= ws[k].t0 - 0.06) i = k;
    if (i < 0) return '';
    const word = same ? toks[i] : ws[i].w, k = norm(word), dt = t - (ws[i].t0 - 0.06);
    const cls = RED.has(k) ? ' red' : HOT.has(k) ? ' hot' : '';
    const y = inst.capY ? inst.capY(t) : 0.68, s = 1 + 0.14 * Math.max(0, 1 - dt / 0.09);
    return `<div class="wcap${cls}" style="top:${(y * 100).toFixed(2)}%;transform:translateY(-50%) scale(${s.toFixed(3)})">${word.replace(/\.\.\.$/, '…')}</div>`;
  }
  return '';
}
