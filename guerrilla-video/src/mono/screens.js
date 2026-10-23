// What the CRT monitor shows (640x480 canvas): phosphor charts and notices, redrawn per frame by the scenes.
// Every function takes (x, W, H, k...) and draws a complete frame; frame() adds the CRT scanlines and vignette.
const AMBER = '#ffb43a', GREEN = '#59ff8a', RED = '#ff4a4a', CREAM = '#efe6d2', DIM = 'rgba(255,180,58,0.35)';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

export function frame(x, W, H, draw, { tint = '#030806' } = {}) {
  x.fillStyle = tint; x.fillRect(0, 0, W, H);
  draw();
  x.fillStyle = 'rgba(0,0,0,0.28)'; for (let y = 0; y < H; y += 4) x.fillRect(0, y, W, 2);
  const g = x.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.78); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.75)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
}
const head = (x, W, txt, col = AMBER) => { x.font = "700 32px Silkscreen"; x.fillStyle = col; x.textAlign = 'left'; x.fillText(txt, 28, 44); x.fillRect(28, 54, W - 56, 3); };

// Idle: the house crest and the market share.
export function idle(x, W, H, share = '61%') {
  frame(x, W, H, () => {
    x.textAlign = 'center'; x.fillStyle = AMBER; x.font = "400 70px 'Jacquard 24'"; x.fillText('Siete Coronas', W / 2, 170);
    x.font = "700 22px Silkscreen"; x.fillStyle = DIM; x.fillText('CUOTA DE MERCADO', W / 2, 260);
    x.font = "400 150px VT323"; x.fillStyle = AMBER; x.fillText(share, W / 2, 390);
  });
}
// Cost per customer falls as the customer count grows (k = 0..1 of the curve drawn).
export function costCurve(x, W, H, k) {
  frame(x, W, H, () => {
    head(x, W, 'COSTO POR CLIENTE');
    const x0 = 70, y0 = 420, x1 = W - 40, y1 = 90;
    x.strokeStyle = DIM; x.lineWidth = 2; x.beginPath(); x.moveTo(x0, y1); x.lineTo(x0, y0); x.lineTo(x1, y0); x.stroke();
    x.font = "400 30px VT323"; x.fillStyle = DIM; x.textAlign = 'right'; x.fillText('CLIENTES →', x1, y0 + 34); x.save(); x.translate(x0 - 18, y1 + 10); x.rotate(-Math.PI / 2); x.textAlign = 'right'; x.fillText('$', 0, 0); x.restore();
    x.strokeStyle = AMBER; x.lineWidth = 5; x.beginPath();
    const n = 80, f = u => y0 - 20 - (y0 - y1 - 40) * (0.08 + 0.92 / (1 + u * 9));
    for (let i = 0; i <= n * k; i++) { const u = i / n, px = x0 + u * (x1 - x0); i ? x.lineTo(px, f(u)) : x.moveTo(px, f(u)); }
    x.stroke();
    const u = k, px = x0 + u * (x1 - x0), py = f(u); x.fillStyle = '#fff'; x.beginPath(); x.arc(px, py, 8, 0, 7); x.fill();
    if (k > 0.85) { x.font = "400 34px VT323"; x.fillStyle = GREEN; x.textAlign = 'right'; x.fillText('USTED: CASI GRATIS', x1, f(1) - 30); }
  });
}
// A price war: what lowering prices costs each side (bars grow with k).
export function priceWar(x, W, H, k) {
  frame(x, W, H, () => {
    head(x, W, 'COSTO DE UNA GUERRA DE PRECIOS', RED);
    const base = 410, bars = [['USTED', 0.95, RED, 'MILLONES DE CLIENTES'], ['ELLAS', 0.07, '#ff8ac4', 'UNOS CUANTOS']];
    bars.forEach(([lab, v, col, sub], i) => {
      const bx = 110 + i * 250, bw = 150, h = 300 * v * ss(i * 0.25, i * 0.25 + 0.6, k);
      x.fillStyle = col; x.fillRect(bx, base - h, bw, h);
      x.font = "700 24px Silkscreen"; x.fillStyle = CREAM; x.textAlign = 'center'; x.fillText(lab, bx + bw / 2, base + 34);
      x.font = "400 26px VT323"; x.fillStyle = DIM; x.fillText(sub, bx + bw / 2, base + 58);
    });
  });
}
// The rival's app, switched off.
export function discontinued(x, W, H, k, name = 'PÉTALO') {
  frame(x, W, H, () => {
    const on = 1 - k, cx = W / 2;
    x.fillStyle = `rgba(255,138,196,${0.15 + 0.85 * on})`; x.beginPath(); x.roundRect(cx - 80, 80, 160, 160, 34); x.fill();
    x.fillStyle = `rgba(30,6,16,${0.6 + 0.4 * on})`; for (let i = 0; i < 5; i++) { x.save(); x.translate(cx, 160); x.rotate(i / 5 * Math.PI * 2); x.beginPath(); x.ellipse(0, -30, 16, 32, 0, 0, 7); x.fill(); x.restore(); }
    x.font = "700 40px 'Pixelify Sans'"; x.textAlign = 'center'; x.fillStyle = `rgba(255,170,210,${0.3 + 0.7 * on})`; x.fillText(name, cx, 300);
    if (k > 0.05) { x.font = "700 30px Silkscreen"; x.fillStyle = RED; x.globalAlpha = ss(0.05, 0.4, k); x.fillText('SERVICIO', cx, 370); x.fillText('DESCONTINUADO', cx, 410); x.globalAlpha = 1; }
  });
}
// Merger review threshold: deals as blips over time; the big ones get reviewed, the small ones pass unseen.
// k: 0..1 progress; pile: 0..1 shows the histogram of deal sizes bunching just below the line.
export function radar(x, W, H, k, pile = 0) {
  frame(x, W, H, () => {
    head(x, W, 'COMPRAS DE EMPRESAS', GREEN);
    const ly = 250, x0 = 40, x1 = W - 40;
    x.setLineDash([14, 10]); x.strokeStyle = RED; x.lineWidth = 3; x.beginPath(); x.moveTo(x0, ly); x.lineTo(x1, ly); x.stroke(); x.setLineDash([]);
    x.font = "700 22px Silkscreen"; x.fillStyle = RED; x.textAlign = 'left'; x.fillText('UMBRAL: AVISO OBLIGATORIO', x0, ly - 12);
    x.font = "400 34px VT323"; x.fillStyle = 'rgba(89,255,138,0.75)'; x.fillText('GRANDES: LAS REVISAN', x0, 100); x.fillText('PEQUEÑAS: NADIE SE ENTERA', x0, H - 26);
    if (pile < 0.02) {
      const r = (i => { const v = Math.sin(i * 91.7) * 43758.5453; return v - Math.floor(v); });
      for (let i = 0; i < 40; i++) { const tx = x0 + r(i) * (x1 - x0), appear = r(i + 100) * 0.9; if (k < appear) continue;
        const big = r(i + 50) < 0.25, y = big ? 120 + r(i + 7) * 100 : ly + 20 + r(i + 9) * 170, a = ss(appear, appear + 0.08, k);
        x.fillStyle = big ? `rgba(255,74,74,${a})` : `rgba(89,255,138,${a})`; x.fillRect(tx - 5, y - 5, 10, 10);
        if (big) { x.strokeStyle = `rgba(255,74,74,${a})`; x.strokeRect(tx - 12, y - 12, 24, 24); } }
    } else {
      // histogram of deal sizes: bars stand up from the bottom; the tallest sit just below the threshold
      const n = 18; for (let i = 0; i < n; i++) { const size = i / (n - 1), bx = x0 + 20 + i * ((x1 - x0 - 40) / n);
        const hgt = (i < 13 ? 30 + 6 * i : i === 13 ? 70 : i === 14 ? 120 : i === 15 ? 165 : 0) * ss(0, 1, pile * 1.3 - i * 0.02);
        x.fillStyle = i >= 13 ? GREEN : 'rgba(89,255,138,0.45)'; x.fillRect(bx, H - 50 - hgt * 0.95, (x1 - x0 - 40) / n - 6, hgt * 0.95); }
      x.save(); x.translate(x0 + 20 + 15.5 * ((x1 - x0 - 40) / 18), ly); x.strokeStyle = RED; x.lineWidth = 3; x.beginPath(); x.moveTo(0, -20); x.lineTo(0, H); x.stroke(); x.restore();
    }
  });
}
// Antitrust breakups: one block splits into n pieces (k = 0..1 of the split).
export function breakup(x, W, H, k, name, year, n) {
  frame(x, W, H, () => {
    head(x, W, `${name} · ${year}`, AMBER);
    const cols = Math.ceil(Math.sqrt(n * 1.4)), rows = Math.ceil(n / cols), cw = 380 / cols, rh = 260 / rows, cx = W / 2, cy = 270;
    for (let i = 0; i < n; i++) {
      const c = i % cols, r = Math.floor(i / cols), tx = cx - 190 + c * cw + cw / 2, ty = cy - 130 + r * rh + rh / 2;
      const gx = cx + (tx - cx) * (1 + 0.55 * k), gy = cy + (ty - cy) * (1 + 0.55 * k), wob = k * 6 * Math.sin(i * 2.3);
      x.fillStyle = i % 2 ? '#e8a33a' : '#ffb43a'; x.fillRect(gx - cw / 2 + 2 + wob, gy - rh / 2 + 2, cw - 4 - 6 * k, rh - 4 - 6 * k);
    }
    x.font = "400 64px VT323"; x.fillStyle = CREAM; x.textAlign = 'center'; x.fillText(`1 → ${Math.round(1 + (n - 1) * ss(0.1, 0.9, k))}`, cx, 455);
  });
}
// Mexico's competition authority.
export function mexico(x, W, H, k) {
  frame(x, W, H, () => {
    const cx = W / 2; x.globalAlpha = ss(0, 0.3, k);
    x.fillStyle = '#0f7a3a'; x.fillRect(cx - 150, 70, 100, 90); x.fillStyle = '#efe6d2'; x.fillRect(cx - 50, 70, 100, 90); x.fillStyle = '#c8202a'; x.fillRect(cx + 50, 70, 100, 90);
    x.font = "700 28px Silkscreen"; x.fillStyle = CREAM; x.textAlign = 'center';
    x.fillText('COMISIÓN NACIONAL', cx, 240); x.fillText('ANTIMONOPOLIO', cx, 280);
    x.font = "400 34px VT323"; x.fillStyle = AMBER; x.fillText('MÉXICO · DESDE 2025', cx, 340);
    x.font = "400 28px VT323"; x.fillStyle = DIM; x.fillText('SUSTITUYÓ A LA COFECE', cx, 380); x.globalAlpha = 1;
  });
}
// Static noise burst (for glitches and cuts).
export function noise(x, W, H, seed) {
  const img = x.createImageData(W / 4, H / 4); let s = seed * 9301 + 49297;
  for (let i = 0; i < img.data.length; i += 4) { s = (s * 9301 + 49297) % 233280; const v = s / 233280 * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  const c = document.createElement('canvas'); c.width = W / 4; c.height = H / 4; c.getContext('2d').putImageData(img, 0, 0);
  x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, W, H);
}
