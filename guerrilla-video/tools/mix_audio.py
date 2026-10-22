"""Synthesize SFX + a music bed and mix them under the narration.

Usage: python3 tools/mix_audio.py [lang]  ->  build[/<lang>]/mix.wav (44.1 kHz stereo)
Everything is generated procedurally with numpy (seeded), so the mix is reproducible.
"""
import json, os, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import sys
LANG = sys.argv[1] if len(sys.argv) > 1 else 'en'
VIDEO = sys.argv[2] if len(sys.argv) > 2 else 'guerrilla'
B = os.path.join(ROOT, 'build', *([] if VIDEO == 'guerrilla' else [VIDEO]), *([] if LANG == 'en' else [LANG]))
SR = 44100
rng = np.random.default_rng(7)
TL = json.load(open(os.path.join(B, 'timeline.json')))
EV = json.load(open(os.path.join(B, 'events.json')))
TOTAL = TL['total'] + 0.5
N = int(TOTAL * SR)


def t_(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR))
def env_exp(d, k): return np.exp(-t_(d) * k)


def fft_filter(x, lo=None, hi=None, sr=SR):
    n = 1 << (len(x) - 1).bit_length()  # power-of-two length keeps the FFT fast
    X = np.fft.rfft(x, n); f = np.fft.rfftfreq(n, 1 / sr); m = np.ones_like(f)
    if hi: m *= 1 / (1 + (f / hi) ** 4)
    if lo: m *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X * m, n)[:len(x)]


def sweep(f0, f1, d, shape='sine'):
    t = t_(d); f = f0 * (f1 / f0) ** (t / d); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) if shape == 'sine' else 2 * ((ph / (2 * np.pi)) % 1) - 1


def fade(x, a=0.01, b=0.05):
    n = len(x); ia, ib = min(int(a * SR), n // 2), min(int(b * SR), n // 2)   # short clips: fades take at most half each
    if ia: x[:ia] *= np.linspace(0, 1, ia)
    if ib: x[-ib:] *= np.linspace(1, 0, ib)
    return x


def norm(x, p=1.0): return x / (np.max(np.abs(x)) + 1e-9) * p


# ------------------------------------------------------------------ SFX
def shot():
    d = 0.35
    crack = fft_filter(noise(d), lo=900) * env_exp(d, 38)
    body = fft_filter(noise(d), hi=1200) * env_exp(d, 14) * 0.8
    thump = np.sin(2 * np.pi * 95 * t_(d)) * env_exp(d, 22)
    return norm(crack + body + thump) * 0.9


def boom(big=False):
    d = 3.2 if big else 2.0
    rumble = fft_filter(noise(d), hi=260 if big else 380) * env_exp(d, 1.6 if big else 2.4)
    crack = fft_filter(noise(d), lo=600) * env_exp(d, 18)
    sub = sweep(70, 28, d) * env_exp(d, 2.2 if big else 3.2)
    x = norm(rumble) * 1.0 + crack * 0.35 + sub * 0.9
    if big:
        cr = np.zeros(int(d * SR))
        for _ in range(40):
            i = rng.integers(int(0.3 * SR), int(2.6 * SR)); L = int(0.01 * SR)
            cr[i:i + L] += rng.standard_normal(L) * np.exp(-np.arange(L) / (L / 4)) * 0.25
        x += fft_filter(cr, lo=1500) * env_exp(d, 0.8)
    x[:int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
    return norm(x) * (1.0 if big else 0.85)


def whoosh():
    d = 0.8; t = t_(d); e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    x = fft_filter(noise(d), lo=300, hi=3500) * e
    return norm(x) * 0.45


def pop():
    d = 0.12; return fade(sweep(520, 980, d) * env_exp(d, 30), 0.002, 0.02) * 0.35


def click():
    d = 0.08; x = noise(d) * env_exp(d, 120) * 0.6 + np.sin(2 * np.pi * 2200 * t_(d)) * env_exp(d, 60) * 0.3
    return x * 0.6


def thud():
    d = 0.25; return (sweep(120, 55, d) * env_exp(d, 18) + fft_filter(noise(d), hi=500) * env_exp(d, 30) * 0.4) * 0.7


def creak():
    d = 0.6; t = t_(d); f = 160 + 90 * np.sin(2 * np.pi * 1.3 * t) + 25 * np.sin(2 * np.pi * 23 * t)
    x = 2 * ((np.cumsum(f) / SR) % 1) - 1
    return fade(fft_filter(x, lo=200, hi=1800) * 0.25 * np.sin(np.pi * t / d), 0.02, 0.1)


def chord(freqs, d, bright=1800, k=1.2):
    t = t_(d); x = np.zeros_like(t)
    for f in freqs:
        for det in (-0.004, 0.004):
            x += 2 * ((f * (1 + det) * t) % 1) - 1
    x = fft_filter(x, hi=bright) * np.exp(-t * k)
    return fade(norm(x), 0.01, 0.3)


def sting():
    x = chord([73.4, 110, 146.8, 174.6], 2.2) * 0.38; th = thud(); x[:len(th)] += th * 0.5; return x
def sting2(): return chord([146.8, 220, 293.7, 349.2], 2.0, 2400) * 0.3
def tension():
    d = 2.5; t = t_(d)
    x = sum(np.sin(2 * np.pi * f * t) for f in (55, 58.3, 82.4)) * (t / d) ** 1.5
    return fade(x / 3 * 0.45, 0.05, 0.4)


def beep():
    d = 0.4; t = t_(d); x = np.sin(2 * np.pi * 1250 * t) * (((t > 0.0) & (t < 0.08)) | ((t > 0.16) & (t < 0.24)))
    return x * 0.18


def tick():
    d = 0.05; return fft_filter(noise(d), lo=2500) * env_exp(d, 140) * 0.35


def missile():
    d = 1.3; t = t_(d)
    x = fft_filter(noise(d), lo=400, hi=6000) * np.minimum(1, t * 8) * np.exp(-t * 1.2)
    ig = fft_filter(noise(d), hi=600) * env_exp(d, 10)
    return norm(x * 0.7 + ig) * 0.6


def brakes():
    d = 1.4; t = t_(d); x = np.sin(2 * np.pi * (2300 + 60 * np.sin(2 * np.pi * 9 * t)) * t) * np.sin(np.pi * t / d)
    return fade(x * 0.12, 0.05, 0.2)


def cheer():
    notes = [523.3, 659.3, 784, 1046.5]; out = np.zeros(int(1.6 * SR))
    for i, f in enumerate(notes):
        s = int(i * 0.12 * SR); d = 1.6 - i * 0.12; t = t_(d)
        tone = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 3)
        out[s:s + len(tone)] += tone
    return fade(out * 0.18, 0.005, 0.2)


# loops (duration given)
def engine(d):
    t = t_(d); f0 = 38 + 2 * np.sin(2 * np.pi * 0.3 * t)
    ph = np.cumsum(f0) / SR
    x = sum(np.sin(2 * np.pi * k * ph) / k for k in range(1, 7)) * (1 + 0.3 * np.sin(2 * np.pi * 7.5 * t))
    x = x * 0.5 + fft_filter(noise(d), hi=300) * 0.6
    return fade(norm(x) * 0.35, 0.6, 0.8)


def march(d):
    out = np.zeros(int(d * SR)); step = 0.5
    for k in range(int(d / step)):
        for j in range(5):  # many boots, slightly spread
            s = int((k * step + rng.uniform(0, 0.05)) * SR)
            b = thud()[: int(0.2 * SR)] * rng.uniform(0.4, 0.7)
            out[s:s + len(b)] += b[: len(out) - s]
    return fade(norm(out) * 0.45, 0.3, 0.4)


def drone(d):
    t = t_(d); f = 185 + 6 * np.sin(2 * np.pi * 0.7 * t) + 3 * np.sin(2 * np.pi * 5 * t)
    ph = np.cumsum(f) / SR; x = (2 * (ph % 1) - 1) + 0.5 * (2 * ((ph * 2.01) % 1) - 1)
    x = fft_filter(x, lo=120, hi=2600)
    return fade(norm(x) * 0.22, 0.8, 1.2)


def train(d):
    t = t_(d); out = fft_filter(noise(d), hi=200) * 0.5
    for k in range(int(d * 4)):
        s = int(k * 0.25 * SR); L = int(0.12 * SR)
        if s + L < len(out): out[s:s + L] += fft_filter(noise(0.12), lo=500, hi=4000) * np.exp(-np.arange(L) / (L / 3)) * (0.9 if k % 2 else 0.5)
    wh = np.zeros_like(out); L = int(1.2 * SR)
    wh[:L] = (np.sin(2 * np.pi * 690 * t_(1.2)) + np.sin(2 * np.pi * 870 * t_(1.2))) * np.sin(np.pi * t_(1.2) / 1.2) * 0.25
    return fade(norm(out) * 0.4 + wh, 0.4, 0.5)


def wind(d):
    t = t_(d); x = fft_filter(noise(d), lo=150, hi=900) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.25 * t))
    return fade(norm(x) * 0.3, 1.0, 1.0)


def clock(d):
    out = np.zeros(int(d * SR)); tk = tick()
    for k in range(int(d / 0.5)):
        s = int(k * 0.5 * SR); out[s:s + len(tk)] += tk[: len(out) - s] * (1.0 if k % 2 else 0.7)
    return out * 1.4


def plane(d):
    t = t_(d); f = 95 + 8 * np.sin(2 * np.pi * 0.3 * t); ph = np.cumsum(f) / SR
    x = sum(np.sin(2 * np.pi * k * ph) / k for k in range(1, 9)) * (1 + 0.4 * np.sin(2 * np.pi * 24 * t))
    x = fft_filter(x, hi=1600) + fft_filter(noise(d), lo=200, hi=1200) * 0.4
    return fade(norm(x) * 0.3, 1.0, 1.2)


def siren(d):
    t = t_(d); f = 520 + 700 * np.clip(t / d, 0, 1) ** 0.7
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.4 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return fade(x * 0.22 * np.minimum(1, t * 2), 0.1, 0.3)


def waves(d):
    t = t_(d); x = fft_filter(noise(d), lo=80, hi=1400) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.13 * t) ** 2)
    return fade(norm(x) * 0.35, 1.0, 1.0)


def factory(d):
    out = np.zeros(int(d * SR))
    for k in range(int(d / 0.4)):
        s = int(k * 0.4 * SR); hit = (np.sin(2 * np.pi * 180 * t_(0.12)) + fft_filter(noise(0.12), lo=1500) * 0.6) * env_exp(0.12, 30)
        out[s:s + len(hit)] += hit[: len(out) - s] * (0.6 if k % 2 else 0.35)
    out += fft_filter(noise(d), hi=250) * 0.25
    return fade(out * 0.5, 0.5, 0.8)


def clank():
    d = 0.6; t = t_(d); x = sum(np.sin(2 * np.pi * f * t) for f in (310, 470, 830)) * env_exp(d, 9) + noise(d) * env_exp(d, 40) * 0.5
    return norm(x) * 0.45


def bells(d):
    out = np.zeros(int(d * SR))
    for k, f in enumerate([523.3, 659.3, 784, 659.3, 1046.5, 784, 659.3, 523.3] * 3):
        s = int(k * 0.5 * SR); L = int(2.0 * SR); tt = np.arange(L) / SR
        tone = (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 2.76 * tt) + 0.25 * np.sin(2 * np.pi * f * 5.4 * tt)) * np.exp(-tt * 2.2)
        if s < len(out): out[s:s + L] += tone[: len(out) - s]
    return fade(out * 0.08, 0.01, 0.8)


def charge():
    d = 2.2; t = t_(d); x = np.zeros_like(t)
    for f in (98, 123.5, 146.8, 196):
        x += 2 * ((f * t * (1 + 0.05 * t)) % 1) - 1
    x = fft_filter(x, hi=1500) * np.minimum(1, t * 2) * np.exp(-t * 0.6)
    roll = fft_filter(noise(d), lo=300, hi=3000) * (0.5 + 0.5 * np.sin(2 * np.pi * 14 * t)) * np.exp(-t * 1.2)
    return norm(x * 0.6 + roll * 0.5) * 0.5


def ks(f, d=1.6, bright=0.5, decay=0.996):
    """Karplus-Strong plucked string, vectorised one period at a time."""
    n = int(d * SR); P = max(2, int(SR / f)); y = np.zeros(n + P + 1)
    y[:P] = rng.uniform(-1, 1, P) * (1 - bright) + rng.uniform(-1, 1, P) * bright
    y[:P] = np.convolve(y[:P], [0.5, 0.5], 'same') if bright < 0.5 else y[:P]
    for k in range(P, n, P):
        a = y[k - P:k]; b = y[k - P + 1:k + 1] if k + 1 <= len(y) else a
        m = min(P, n - k); y[k:k + m] = (0.5 * (a[:m] + b[:m])) * decay
    return y[:n] * np.exp(-t_(d) * 0.6)


def whistle():
    d = 1.6; t = t_(d); e = np.minimum(1, t * 6) * np.minimum(1, (d - t) * 3)
    x = sum(np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 5 * t)) for f in (523, 659, 784)) / 3
    x += fft_filter(noise(d), lo=900, hi=4000) * 0.35
    return fade(x * e * 0.35, 0.02, 0.2)


def bell():
    d = 4.0; t = t_(d); f = 196
    x = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * k) for a, m, k in ((1, 1, 0.9), (0.6, 2.0, 1.3), (0.45, 2.4, 1.8), (0.3, 3.0, 2.2), (0.2, 4.2, 3.0), (0.25, 0.5, 0.7)))
    x[:int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
    return norm(x) * 0.42


def laugh():
    out = np.zeros(int(1.0 * SR))
    for i, f in enumerate([784, 659.3, 784, 987.8]):
        s = int(i * 0.13 * SR); x = ks(f, 0.5, 0.7)
        out[s:s + len(x)] += x[: len(out) - s]
    return fade(norm(out) * 0.3, 0.003, 0.2)


def crowd(d):
    t = t_(d); x = np.zeros(int(d * SR))
    for k in range(6):
        mod = 0.5 + 0.5 * np.sin(2 * np.pi * (2.3 + k * 0.7) * t + k) * np.sin(2 * np.pi * (0.31 + k * 0.11) * t + 2 * k)
        x += fft_filter(noise(d), lo=250 + k * 60, hi=1400 + k * 150) * np.maximum(0, mod)
    return fade(norm(x) * 0.3, 0.8, 1.0)


def mg(d):
    out = np.zeros(int(d * SR)); sh = shot()[: int(0.12 * SR)]
    for k in range(int(d * 9)):
        s = int((k / 9 + rng.uniform(0, 0.01)) * SR)
        if s < len(out): out[s:s + len(sh)] += sh[: len(out) - s] * rng.uniform(0.5, 0.8)
    return fade(out * 0.6, 0.02, 0.2)


def fire(d):
    t = t_(d); x = fft_filter(noise(d), hi=700) * 0.4
    cr = np.zeros(int(d * SR))
    for _ in range(int(d * 25)):
        i = rng.integers(0, max(1, len(cr) - 400)); L = int(rng.uniform(0.002, 0.008) * SR)
        cr[i:i + L] += rng.standard_normal(L) * np.exp(-np.arange(L) / (L / 3)) * rng.uniform(0.3, 1)
    x += fft_filter(cr, lo=1200)
    return fade(norm(x) * 0.35, 0.5, 0.8)



# ---- Napoleonic additions
def neigh():
    d = 1.3; t = t_(d); u = t / d
    f = 600 + 900 * np.sin(np.pi * np.clip(u * 1.4, 0, 1)) ** 0.7 * (1 - 0.5 * u) + 40 * np.sin(2 * np.pi * 13 * t)
    ph = np.cumsum(f) / SR; x = (2 * (ph % 1) - 1) * 0.6 + np.sin(2 * np.pi * ph) * 0.4
    x = fft_filter(x, lo=400, hi=3200) * np.sin(np.pi * np.clip(u, 0, 1)) ** 0.6 * (1 + 0.5 * np.sin(2 * np.pi * 26 * t))
    x += fft_filter(noise(d), lo=800, hi=4000) * np.exp(-((u - 0.85) / 0.1) ** 2) * 0.4
    return fade(norm(x) * 0.4, 0.02, 0.15)


def cannon():
    d = 2.4; t = t_(d)
    sub = sweep(62, 26, d) * env_exp(d, 2.6)
    body = fft_filter(noise(d), hi=420) * env_exp(d, 2.2)
    crack = fft_filter(noise(d), lo=700) * env_exp(d, 25)
    x = norm(body) * 0.9 + sub * 1.0 + crack * 0.45
    x[:int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))
    return norm(x) * 0.85


def volley():
    d = 1.6; out = np.zeros(int(d * SR))
    for k in range(14):
        s = int(rng.uniform(0, 0.35) * SR); sh = shot(); sh = fft_filter(sh, hi=3500)
        out[s:s + len(sh)] += sh[: len(out) - s] * rng.uniform(0.35, 0.7)
    out += fft_filter(noise(d), hi=700) * env_exp(d, 3.0) * 0.25
    return norm(out) * 0.75


def broadside():
    d = 3.2; out = np.zeros(int(d * SR)); c = cannon()
    for k in range(9):
        s = int((k * 0.16 + rng.uniform(0, 0.05)) * SR)
        out[s:s + len(c)] += c[: len(out) - s] * (1 - k * 0.06)
    return norm(out) * 0.9


def drums(d):
    out = np.zeros(int(d * SR)); bt = 60 / 108
    def snare(g):
        L = 0.16; x = fft_filter(noise(L), lo=900, hi=6000) * env_exp(L, 28) + np.sin(2 * np.pi * 190 * t_(L)) * env_exp(L, 40) * 0.5
        return x * g
    bass = sweep(95, 50, 0.3) * env_exp(0.3, 10)
    for b in range(int(d / bt) + 1):
        t0 = b * bt
        if b % 2 == 0:
            i = int(t0 * SR); out[i:i + len(bass)] += bass[: max(0, len(out) - i)] * 0.8
        pat = [0, 0.5] if b % 4 != 3 else [0, 0.25, 0.5, 0.75]
        for p in pat:
            i = int((t0 + p * bt) * SR); s_ = snare(0.55 if p else 0.8); out[i:i + len(s_)] += s_[: max(0, len(out) - i)]
    return fade(norm(out) * 0.5, 0.05, 0.4)


def choir(d):
    t = t_(d); x = np.zeros_like(t)
    for f in (146.8, 220.0, 293.7, 370.0):
        for det in (-0.006, 0.0, 0.007):
            ff = f * (1 + det) * (1 + 0.004 * np.sin(2 * np.pi * 5.2 * t + f))
            x += 2 * ((np.cumsum(ff) / SR) % 1) - 1
    v = fft_filter(x, lo=600, hi=1100) * 1.0 + fft_filter(x, lo=1000, hi=1500) * 0.5 + fft_filter(x, lo=200, hi=900) * 0.35
    e = np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / 1.2)
    return fade(norm(v * e) * 0.35, 0.05, 0.3)


# ------------------------------------------------------------------ extra SFX for the cartels video
def hit():
    d = 2.2; t = t_(d)
    sub = sweep(85, 36, d) * env_exp(d, 2.6)
    body = fft_filter(noise(d), hi=420) * env_exp(d, 5.5) * 0.8
    air = fft_filter(noise(d), lo=1800, hi=7000) * env_exp(d, 9) * 0.18
    x = sub + body + air; x[:int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))
    y = x.copy()
    for dms, g in ((43, 0.3), (89, 0.22), (151, 0.15), (233, 0.1)):
        dd = int(dms * SR / 1000); y[dd:] += x[:-dd] * g
    return norm(y) * 0.8


def stamp():
    d = 0.35; t = t_(d)
    thump = sweep(150, 70, d) * env_exp(d, 26)
    slap = fft_filter(noise(d), lo=900, hi=4500) * env_exp(d, 60) * 0.7
    return fade(norm(thump + slap) * 0.75, 0.001, 0.05)


def swoosh():
    d = 0.6; t = t_(d); e = (t / d) ** 2 * np.exp(-((t / d) - 0.85) ** 2 * 18) * 3
    x = fft_filter(noise(d), lo=900, hi=7000) * np.clip(e, 0, 1)
    return norm(x) * 0.42


def gavel():
    def knock():
        d = 0.32; t = t_(d)
        x = (np.sin(2 * np.pi * 520 * t) * 0.8 + np.sin(2 * np.pi * 1180 * t) * 0.45 + np.sin(2 * np.pi * 2350 * t) * 0.2) * env_exp(d, 24)
        x += fft_filter(noise(d), lo=1500) * env_exp(d, 140) * 0.6 + sweep(160, 90, d) * env_exp(d, 30) * 0.6
        return x
    out = np.zeros(int(0.8 * SR)); a = knock()
    for k, g in ((0.0, 1.0), (0.19, 0.75)):
        i = int(k * SR); out[i:i + len(a)] += a[: len(out) - i] * g
    return fade(norm(out) * 0.75, 0.001, 0.1)


def cash():
    d = 1.3; t = t_(d)
    clk = np.zeros(int(d * SR)); c = click()
    for k in (0.0, 0.06): i = int(k * SR); clk[i:i + len(c)] += c
    ding = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * k) for a, f, k in ((1, 2093, 3.2), (0.6, 2637, 3.8), (0.4, 4186, 5.0)))
    ding = np.concatenate([np.zeros(int(0.12 * SR)), ding])[: len(t)]
    return fade(norm(clk * 0.5 + ding * 0.6) * 0.5, 0.001, 0.2)


def paper():
    d = 0.7; t = t_(d); out = np.zeros(len(t))
    for k in range(5):
        a = rng.uniform(0, d - 0.15); L = int(rng.uniform(0.05, 0.14) * SR); i = int(a * SR)
        seg = fft_filter(noise((L + 0.5) / SR), lo=1800, hi=8000)[:L]; out[i:i + len(seg)] += seg * np.hanning(len(seg)) * rng.uniform(0.4, 1)
    return fade(norm(out) * 0.38, 0.005, 0.08)


def cock():
    d = 0.45; out = np.zeros(int(d * SR))
    for k, f in ((0.0, 3100), (0.16, 2400)):
        L = int(0.06 * SR); tt = t_(0.06)
        x = fft_filter(noise(0.06), lo=1500)[:L] * np.exp(-tt * 90) + np.sin(2 * np.pi * f * tt) * np.exp(-tt * 70) * 0.5
        i = int(k * SR); out[i:i + L] += x
    return fade(norm(out) * 0.6, 0.001, 0.05)


def notify():
    d = 0.5; out = np.zeros(int(d * SR))
    for k, f in ((0.0, 1046.5), (0.12, 1568.0)):
        tt = t_(0.3); x = (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 12) * np.minimum(1, tt / 0.004)
        i = int(k * SR); out[i:i + len(x)] += x[: len(out) - i]
    return fade(out * 0.32, 0.001, 0.1)


def shutter():
    d = 1.5; t = t_(d)
    rattle = fft_filter(noise(d), lo=300, hi=3500) * (0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 22 * t))) * np.minimum(1, t / 0.08)
    rattle *= np.where(t < 1.15, 1.0, np.exp(-(t - 1.15) * 30))
    bang = np.zeros(len(t)); i = int(1.15 * SR); b = (fft_filter(noise(0.35), hi=1600) * env_exp(0.35, 18) + sweep(140, 60, 0.35) * env_exp(0.35, 20))
    bang[i:i + len(b)] += b[: len(bang) - i] * 1.4
    return fade(norm(rattle * 0.6 + bang) * 0.55, 0.01, 0.1)


def riser(d):
    t = t_(d); u = t / d
    x = fft_filter(noise(d), lo=400, hi=6000) * u ** 2 * 0.6 + sweep(180, 900, d, 'saw') * u ** 2.5 * 0.25
    x = fft_filter(x, hi=5000)
    return fade(norm(x) * 0.42, 0.05, 0.06)


def gunfire(d):
    out = np.zeros(int(d * SR)); s0 = shot()
    tt = 0.05
    while tt < d - 0.1:
        n = 1 if rng.uniform() < 0.6 else int(rng.integers(2, 5))
        for q in range(n):
            i = int((tt + q * 0.11) * SR)
            if i < len(out): out[i:i + len(s0)] += s0[: len(out) - i] * rng.uniform(0.35, 0.9)
        tt += rng.uniform(0.25, 0.7)
    out = fft_filter(out, hi=2600); y = out.copy()
    for dms, g in ((70, 0.35), (160, 0.25), (290, 0.15)):
        dd = int(dms * SR / 1000); y[dd:] += out[:-dd] * g
    return fade(norm(y) * 0.5, 0.01, 0.3)


def typewriter(d):
    out = np.zeros(int(d * SR)); c = click()
    tt = 0.0
    while tt < d - 0.3:
        i = int(tt * SR); out[i:i + len(c)] += c[: len(out) - i] * rng.uniform(0.5, 1.0); tt += rng.uniform(0.07, 0.16)
    b = bell()[: int(0.6 * SR)] * 0.25; i = max(0, len(out) - len(b) - 1); out[i:i + len(b)] += fft_filter(b, lo=1200)[: len(out) - i]
    return fade(out * 0.6, 0.01, 0.05)


def traffic(d):
    t = t_(d); x = fft_filter(noise(d), hi=320) * 0.55
    for k in range(int(d / 2.5) + 1):
        c0 = rng.uniform(0, max(0.1, d - 2.0)); dur = 2.2; i = int(c0 * SR); n = min(int(dur * SR), len(x) - i)
        if n <= 0: continue
        tt = t_(dur)[:n]; e = np.exp(-((tt - dur / 2) / (dur / 4)) ** 2)
        x[i:i + n] += fft_filter(noise(dur), lo=200, hi=1800)[:n] * e * 0.8
    return fade(norm(x) * 0.32, 0.6, 0.8)


def swell(d):
    t = t_(d); x = np.zeros(len(t))
    for f in (293.7, 369.99, 440.0, 587.3):
        for det in (-0.004, 0.004):
            x += 2 * ((f * (1 + det) * t) % 1) - 1
    x = fft_filter(x, hi=1600) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
    return fade(norm(x) * 0.3, 0.05, 0.3)


def jet(d):
    t = t_(d)
    whine = sum(np.sin(2 * np.pi * f * t * (1 + 0.002 * np.sin(2 * np.pi * 0.3 * t))) * a for f, a in ((3150, 0.25), (4720, 0.12)))
    roar = fft_filter(noise(d), lo=120, hi=1400) * 0.8
    return fade(norm(roar + whine * 0.5) * 0.38, 0.6, 0.8)


def heli(d):
    t = t_(d); slap = np.maximum(0, np.sin(2 * np.pi * 17 * t)) ** 6
    x = fft_filter(noise(d), hi=900) * (0.35 + 0.9 * slap) + np.sin(2 * np.pi * 34 * t) * slap * 0.6
    x += fft_filter(noise(d), lo=2500, hi=6000) * 0.05
    return fade(norm(x) * 0.5, 0.8, 1.0)


def harbor(d):
    t = t_(d); x = waves(d) * 0.8
    hs = 2.0; i = int(min(1.0, d * 0.3) * SR); tt = t_(hs)
    horn = sum(a * np.sin(2 * np.pi * f * tt) for f, a in ((98, 1), (196, 0.5), (294, 0.3), (392, 0.15))) * np.minimum(1, tt / 0.2) * np.minimum(1, (hs - tt) / 0.4)
    x[i:i + len(horn)] += fft_filter(horn, hi=900)[: len(x) - i] * 0.35
    return fade(norm(x) * 0.4, 0.5, 0.8)


def bubbling(d):
    out = np.zeros(int(d * SR))
    for _ in range(int(d * 14)):
        i = int(rng.uniform(0, max(0.01, d - 0.08)) * SR); dd = rng.uniform(0.02, 0.06); tt = t_(dd)
        f0 = rng.uniform(280, 700); x = np.sin(2 * np.pi * np.cumsum(f0 * (1 + tt * 6)) / SR) * np.exp(-tt * 60)
        out[i:i + len(x)] += x[: len(out) - i] * rng.uniform(0.3, 1)
    out += fft_filter(noise(d), hi=400) * 0.08
    return fade(norm(out) * 0.35, 0.2, 0.3)


def birds(d):
    out = np.zeros(int(d * SR))
    for _ in range(int(d * 2.2)):
        i = int(rng.uniform(0, max(0.01, d - 0.4)) * SR); n = int(rng.integers(1, 4))
        for q in range(n):
            dd = rng.uniform(0.05, 0.12); tt = t_(dd); f0 = rng.uniform(2600, 4200); f1 = f0 * rng.uniform(0.7, 1.3)
            x = np.sin(2 * np.pi * np.cumsum(f0 + (f1 - f0) * tt / dd) / SR) * np.sin(np.pi * tt / dd)
            j = i + int(q * 0.13 * SR); out[j:j + len(x)] += x[: len(out) - j] * 0.5
    return fade(out * 0.3, 0.3, 0.4)


def night(d):
    t = t_(d); chirp = (np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 28 * t) > 0.3) * (np.sin(2 * np.pi * 1.6 * t) > 0)).astype(float)
    x = chirp * 0.25 + fft_filter(noise(d), hi=500) * 0.25
    return fade(norm(x) * 0.25, 0.5, 0.6)


def pour(d):   # liquid pouring into a jerrycan
    t = t_(d); x = fft_filter(noise(d), lo=250, hi=1800) * (0.55 + 0.45 * np.abs(np.sin(2 * np.pi * 5.3 * t) * np.sin(2 * np.pi * 1.7 * t + 1)))
    n = int(0.06 * SR); k = np.arange(n) / SR
    for _ in range(int(d * 9)):
        i = int(rng.random() * max(1, len(t) - n)); f = 500 + 900 * rng.random()
        x[i:i + n] += np.sin(2 * np.pi * (f + f * 5 * k) * k) * np.exp(-k * 60) * 0.6
    return fade(norm(x) * 0.35, 0.3, 0.5)


def hiss(d):   # gas escaping from a tapped pipeline
    t = t_(d); x = fft_filter(noise(d), lo=2500, hi=9000) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.7 * t))
    return fade(norm(x) * 0.3, 0.4, 0.6)


def camera(d):   # press photographers: shutter clicks
    out = np.zeros(int(d * SR)); tt = 0.05
    while tt < d - 0.2:
        cd = 0.09; c = noise(cd) * env_exp(cd, 140) * 0.7 + np.sin(2 * np.pi * 1800 * t_(cd)) * env_exp(cd, 90) * 0.25
        c2 = np.zeros(int(0.14 * SR)); c2[:len(c)] += c; j = int(0.05 * SR); c2[j:j + len(c)] += c[: len(c2) - j] * 0.6
        i = int(tt * SR); x = c2[: len(out) - i]; out[i:i + len(x)] += x * (0.6 + 0.4 * rng.random()); tt += 0.16 + rng.random() * 0.4
    return fade(norm(out) * 0.4, 0.01, 0.1)


# ------------------------------------------------------------------ extra SFX for the independence of the Americas video
def hz(m): return 440 * 2 ** ((m - 69) / 12)


def room(x, taps=((23, 0.25), (41, 0.18), (67, 0.12), (103, 0.08), (157, 0.05))):
    y = x.copy()
    for dms, g in taps:
        dd = int(dms * SR / 1000); y[dd:] += x[:-dd] * g
    return y


def brass_tone(f, d):
    tt = t_(d); x = sum(2 * ((f * (1 + dt) * tt) % 1) - 1 for dt in (-0.004, 0.004)) / 2
    e = np.minimum(1, tt / 0.03) * (0.75 + 0.25 * np.exp(-tt * 4)) * np.minimum(1, (d - tt) / 0.08)
    return fft_filter(x, hi=1400 + 2 * f) * e


def fanfare():   # trumpets: three pickups and a held chord
    out = np.zeros(int(1.9 * SR))
    for m, t0, d in ((67, 0.0, 0.13), (67, 0.15, 0.13), (67, 0.30, 0.13), (72, 0.45, 1.2), (64, 0.45, 1.2), (60, 0.45, 1.2)):
        x = brass_tone(hz(m), d) * (0.6 if m < 67 else 1.0); i = int(t0 * SR); out[i:i + len(x)] += x[: len(out) - i]
    return fade(norm(room(out)) * 0.5, 0.005, 0.3)


def horn():   # a courier's post horn call
    out = np.zeros(int(1.7 * SR))
    for m, t0, d in ((60, 0.0, 0.22), (64, 0.24, 0.22), (67, 0.48, 0.22), (72, 0.72, 0.85)):
        x = fft_filter(brass_tone(hz(m), d), hi=1800); i = int(t0 * SR); out[i:i + len(x)] += x[: len(out) - i]
    return fade(norm(room(out)) * 0.4, 0.005, 0.3)


def drumroll(d):   # military snare roll that swells into an accent
    n = int(d * SR); out = np.zeros(n); L = 0.09
    pool = [fft_filter(noise(L), lo=800, hi=6000) * env_exp(L, 45) + np.sin(2 * np.pi * 210 * t_(L)) * env_exp(L, 50) * 0.4 for _ in range(6)]
    tt, k = 0.0, 0
    while tt < d - 0.15:
        i = int(tt * SR); x = pool[k % 6][: n - i]; out[i:i + len(x)] += x * (0.3 + 0.6 * (tt / d) ** 1.5) * (1.0 if k % 2 else 0.8)
        tt += 1 / 24 + rng.uniform(-0.003, 0.003); k += 1
    i = int(max(0, d - 0.15) * SR); acc = pool[0] * 1.3
    bd = sweep(95, 48, 0.3) * env_exp(0.3, 10); out[i:i + len(acc)] += acc[: n - i]; out[i:i + len(bd)] += bd[: n - i] * 0.8
    return fade(norm(room(out)) * 0.5, 0.05, 0.02)


def quill(d):   # nib scratching on paper
    out = np.zeros(int(d * SR)); tt = 0.02
    while tt < d - 0.15:
        L = rng.uniform(0.04, 0.13); seg = fft_filter(noise(L + 0.01), lo=2500, hi=7500)[: int(L * SR)]; u = np.linspace(0, 1, len(seg))
        seg = seg * np.sin(np.pi * u) ** 0.7 * (1 + 0.5 * np.sin(2 * np.pi * rng.uniform(25, 60) * u * L))
        i = int(tt * SR); out[i:i + len(seg)] += seg[: len(out) - i] * rng.uniform(0.4, 1)
        tt += L + rng.uniform(0.02, 0.09) + (0.25 if rng.uniform() < 0.12 else 0)
    return fade(norm(out) * 0.3, 0.01, 0.08)


def hooves(d):   # a few horses galloping on dirt
    out = np.zeros(int(d * SR))
    def clop():
        L = 0.07; tt = t_(L)
        return np.sin(2 * np.pi * rng.uniform(380, 520) * tt) * env_exp(L, 70) * 0.6 + fft_filter(noise(L), lo=600, hi=3500) * env_exp(L, 90) * 0.7 + sweep(140, 70, L) * env_exp(L, 40) * 0.5
    pool = [clop() for _ in range(8)]
    for h in range(4):
        stride = rng.uniform(0.42, 0.48); tt = rng.uniform(0, stride); g = rng.uniform(0.5, 1)
        while tt < d - 0.1:
            for p in (0, 0.11, 0.2):
                i = int((tt + p + rng.uniform(-0.006, 0.006)) * SR)
                if i < len(out): c = pool[rng.integers(0, 8)]; out[i:i + len(c)] += c[: len(out) - i] * g * (1.0 if p == 0.2 else 0.75)
            tt += stride
    out += fft_filter(noise(d), hi=300) * 0.15
    return fade(norm(out) * 0.45, 0.3, 0.4)


def applause(d):
    n = int(d * SR); out = np.zeros(n)
    pool = [fft_filter(noise(0.03), lo=rng.uniform(700, 1400), hi=rng.uniform(3500, 6500)) * env_exp(0.03, rng.uniform(140, 220)) for _ in range(16)]
    for _ in range(int(d * 70)):
        i = int(rng.uniform(0, max(0.01, d - 0.03)) * SR); c = pool[rng.integers(0, 16)]
        out[i:i + len(c)] += c[: n - i] * rng.uniform(0.3, 1)
    t = t_(d); e = np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / min(1.2, d * 0.4))
    return fade(norm(out * e) * 0.55, 0.05, 0.3)


def shout():   # a crowd crying "¡Viva!"
    d = 1.4; t = t_(d); x = np.zeros(len(t))
    for k in range(10):
        f0 = rng.uniform(130, 300); s = rng.uniform(0, 0.12)
        ph = np.cumsum(f0 * (1 + 0.25 * np.sin(np.pi * np.clip(t / 0.9, 0, 1)) + 0.01 * np.sin(2 * np.pi * 6 * t))) / SR
        x += (2 * (ph % 1) - 1) * np.clip((t - s) / 0.06, 0, 1) * np.exp(-np.maximum(0, t - s - 0.5) * 3.5) * rng.uniform(0.5, 1)
    v = fft_filter(x, lo=500, hi=900) + fft_filter(x, lo=1000, hi=1500) * 0.6 + fft_filter(x, lo=2300, hi=3000) * 0.25
    v += fft_filter(noise(d), lo=600, hi=3000) * np.exp(-t * 3) * 0.15
    return fade(norm(room(v)) * 0.45, 0.01, 0.3)


def organ(d):   # cathedral organ, D G A D
    n = int(d * SR); out = np.zeros(n); seg = 2.6
    prog = [[50, 57, 62, 66], [55, 59, 62, 67], [57, 61, 64, 69], [50, 57, 62, 66]]
    for k in range(int(d / seg) + 1):
        ia = int(k * seg * SR); L = min(int((seg + 0.4) * SR), n - ia)
        if L <= 0: break
        tt = np.arange(L) / SR; ch = prog[k % 4]; y = np.zeros(L)
        for m in ch + [ch[0] - 12]:
            for h, a in ((1, 1), (2, 0.5), (3, 0.3), (4, 0.25), (6, 0.12), (8, 0.08)):
                if hz(m) * h < 6000: y += a * np.sin(2 * np.pi * hz(m) * h * tt)
        out[ia:ia + L] += y * np.minimum(1, tt / 0.12) * np.minimum(1, (seg + 0.4 - tt) / 0.4)
    return fade(norm(room(out, ((37, 0.35), (61, 0.28), (97, 0.22), (149, 0.16), (233, 0.11), (367, 0.07)))) * 0.3, 0.3, 1.0)


def harpsichord(d):   # baroque arpeggios over a Pachelbel-style ground
    n = int(d * SR); out = np.zeros(n); memo_ = {}
    def pl(m):
        if m not in memo_: memo_[m] = ks(hz(m), 0.9, 0.95, 0.995) + 0.35 * ks(hz(m + 12), 0.9, 0.95, 0.993)
        return memo_[m]
    def add(x, t0, g):
        i = int(t0 * SR)
        if i < n: x = x[: n - i]; out[i:i + len(x)] += x * g
    PROG = [(38, [62, 66, 69]), (45, [61, 64, 69]), (47, [62, 66, 71]), (42, [61, 66, 69]), (43, [62, 67, 71]), (38, [62, 66, 69]), (43, [62, 67, 71]), (45, [61, 64, 69])]
    s16 = 60 / 112 / 4; tt, k = 0.0, 0
    while tt < d - 0.2:
        bass, ch = PROG[(k // 8) % 8]; q = k % 8
        if q == 0: add(pl(bass), tt, 0.7); add(pl(bass + 12), tt, 0.4)
        add(pl([ch[0], ch[1], ch[2], ch[0] + 12, ch[2], ch[1], ch[2], ch[0] + 12][q]), tt, 0.45)
        tt += s16; k += 1
    return fade(norm(room(fft_filter(out, lo=150))) * 0.35, 0.05, 0.6)


def curtain():   # heavy stage curtain sweeping across its rod
    d = 1.8; t = t_(d); u = t / d
    x = fft_filter(noise(d), lo=200, hi=2500) * np.sin(np.pi * u) ** 1.2 * (0.8 + 0.2 * np.sin(2 * np.pi * 3.1 * t))
    x += fft_filter(noise(d), lo=2500, hi=6000) * np.sin(np.pi * u) ** 3 * 0.3
    for _ in range(14):
        i = int(rng.uniform(0, 1.2) * SR); L = int(0.02 * SR); x[i:i + L] += np.sin(2 * np.pi * rng.uniform(1800, 2600) * t_(0.02)) * env_exp(0.02, 160) * 0.25
    return fade(norm(x) * 0.4, 0.05, 0.3)


def crack():   # a map tearing apart
    d = 0.8; n = int(d * SR); out = np.zeros(n)
    for _ in range(260):
        i = int(rng.uniform(0, 0.6) ** 1.3 * SR); L = int(rng.uniform(0.001, 0.004) * SR)
        out[i:i + L] += rng.standard_normal(L) * np.exp(-np.arange(L) / (L / 3)) * rng.uniform(0.3, 1)
    out = fft_filter(out, lo=900, hi=7000) + fft_filter(noise(d), lo=500, hi=3000) * env_exp(d, 6) * 0.2
    th = sweep(130, 60, 0.25) * env_exp(0.25, 16); out[:len(th)] += th * 0.5
    return fade(norm(out) * 0.55, 0.002, 0.15)


def whisper(d):
    t = t_(d); x = np.zeros(len(t))
    for v in range(2):
        syl = np.maximum(0, np.sin(2 * np.pi * rng.uniform(3.5, 5.5) * t + rng.uniform(0, 6))) ** 1.5 * (0.15 + 0.85 * (np.sin(2 * np.pi * rng.uniform(0.4, 0.7) * t + v * 2) > -0.3))
        nz = noise(d); x += (fft_filter(nz, lo=1500, hi=3500) + fft_filter(nz, lo=4500, hi=7000) * 0.6) * syl
    return fade(norm(x) * 0.25, 0.1, 0.3)


def steps(d):   # boots on a stone floor
    out = np.zeros(int(d * SR)); tt, k = 0.05, 0
    while tt < d - 0.15:
        L = 0.12; x = sweep(150, 80, L) * env_exp(L, 35) * 0.8 + fft_filter(noise(L), lo=500, hi=3000) * env_exp(L, 60) * 0.5
        i = int(tt * SR); out[i:i + len(x)] += x[: len(out) - i] * (1.0 if k % 2 else 0.8)
        tt += 0.52 + rng.uniform(-0.03, 0.03); k += 1
    return fade(norm(room(out)) * 0.45, 0.01, 0.1)


def doorknock():
    out = np.zeros(int(0.9 * SR))
    for k, g in ((0.0, 1.0), (0.22, 0.85), (0.44, 0.95)):
        d = 0.18; tt = t_(d)
        x = (np.sin(2 * np.pi * 190 * tt) * 0.9 + np.sin(2 * np.pi * 420 * tt) * 0.4) * env_exp(d, 35) + fft_filter(noise(d), lo=400, hi=2500) * env_exp(d, 90) * 0.8
        i = int(k * SR); out[i:i + len(x)] += x[: len(out) - i] * g
    return fade(norm(room(out)) * 0.6, 0.001, 0.08)


def door():   # creak, then a heavy slam
    d = 1.4; out = np.zeros(int(d * SR)); cr = creak(); out[:len(cr)] += cr * 0.8
    L = 0.5; sl = sweep(110, 45, L) * env_exp(L, 9) + fft_filter(noise(L), hi=1500) * env_exp(L, 25) * 0.8 + fft_filter(noise(L), lo=1500) * env_exp(L, 60) * 0.3
    i = int(0.62 * SR); out[i:i + len(sl)] += sl[: len(out) - i]
    return fade(norm(room(out)) * 0.6, 0.01, 0.2)


def splash():   # a crate hitting the water
    d = 1.2; t = t_(d)
    x = fft_filter(noise(d), lo=300, hi=3000) * np.exp(-t * 5) * np.minimum(1, t / 0.01)
    pl = sweep(260, 90, 0.2) * env_exp(0.2, 14); x[:len(pl)] += pl * 0.7
    for _ in range(7):
        i = int(rng.uniform(0.15, 0.9) * SR); dd = rng.uniform(0.02, 0.05); tt = t_(dd); f0 = rng.uniform(500, 1200)
        b = np.sin(2 * np.pi * np.cumsum(f0 * (1 + tt * 8)) / SR) * np.exp(-tt * 60); x[i:i + len(b)] += b[: len(x) - i] * 0.3
    return fade(norm(x) * 0.5, 0.002, 0.2)


def insects(d):   # cicadas over the cane fields
    t = t_(d)
    x = fft_filter(noise(d), lo=4000, hi=7500) * (0.5 + 0.5 * np.sin(2 * np.pi * 85 * t)) ** 2 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.18 * t) ** 2)
    return fade(norm(x) * 0.22 + birds(d) * 0.5, 1.0, 1.0)


ONE = {'shot': shot, 'boom': lambda: boom(False), 'bigboom': lambda: boom(True), 'whoosh': whoosh, 'pop': pop, 'click': click,
       'thud': thud, 'creak': creak, 'sting': sting, 'sting2': sting2, 'tension': tension, 'beep': beep, 'tick': tick,
       'missile': missile, 'brakes': brakes, 'cheer': cheer, 'clank': clank, 'charge': charge, 'whistle': whistle, 'bell': bell, 'laugh': laugh,
       'neigh': neigh, 'cannon': cannon, 'volley': volley, 'broadside': broadside,
       'hit': hit, 'stamp': stamp, 'swoosh': swoosh, 'gavel': gavel, 'cash': cash, 'paper': paper, 'cock': cock, 'notify': notify, 'shutter': shutter,
       'fanfare': fanfare, 'horn': horn, 'shout': shout, 'curtain': curtain, 'crack': crack, 'knock': doorknock, 'door': door, 'splash': splash}
LOOP = {'engine': engine, 'march': march, 'drone': drone, 'train': train, 'wind': wind, 'clock': clock,
        'plane': plane, 'siren': siren, 'waves': waves, 'factory': factory, 'bells': bells, 'crowd': crowd, 'mg': mg, 'fire': fire,
        'drums': drums, 'choir': choir, 'riser': riser, 'gunfire': gunfire, 'engines': engine, 'sirens': siren, 'typewriter': typewriter, 'traffic': traffic,
        'swell': swell, 'jet': jet, 'heli': heli, 'harbor': harbor, 'bubbling': bubbling, 'birds': birds, 'night': night,
        'pour': pour, 'hiss': hiss, 'camera': camera,
        'drum': drumroll, 'quill': quill, 'hooves': hooves, 'applause': applause, 'organ': organ, 'harpsichord': harpsichord, 'whisper': whisper, 'steps': steps, 'insects': insects}

sfx = np.zeros(N)
cache = {}
for e in EV:
    ty, t0, vol = e['type'], e['t'], e.get('vol', 1.0)
    if ty in LOOP: x = LOOP[ty](max(0.3, e.get('dur', 2)))
    else:
        if ty not in cache or ty in ('shot', 'splash'): cache[ty] = ONE[ty]()
        x = cache[ty]
    i = int(t0 * SR); x = x[: max(0, N - i)]
    sfx[i:i + len(x)] += x * vol

# ------------------------------------------------------------------ narration
with wave.open(os.path.join(B, 'narration.wav')) as w:
    nsr = w.getframerate(); nar = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
nar = np.interp(np.arange(N) / SR, np.arange(len(nar)) / nsr, nar, right=0)
nar = norm(nar, 0.92)

# ------------------------------------------------------------------ corrido bed for the Revolution video (3/4, guitarrón + guitar + violin)
MOODS = {'title': 'bright', 'porfiriato': 'calm', 'madero': 'bright', 'uprising': 'bright', 'ayala': 'bright', 'huerta': 'tense', 'constitucionalistas': 'bright',
         'split': 'tense', 'columbus': 'bright', 'constitucion': 'calm', 'fates': 'somber', 'legacy': 'somber', 'outro': 'bright'}
NOTE = lambda name: 440 * 2 ** ((name - 69) / 12)
def corrido():
    bpm = 138; beat = 60 / bpm; bar = 3 * beat
    G = {'G': [55, 59, 62], 'D7': [50, 54, 57, 60], 'C': [48, 52, 55], 'Em': [52, 55, 59], 'B7': [47, 51, 54, 57], 'Am': [45, 48, 52]}
    prog = {'bright': ['G', 'G', 'D7', 'D7', 'D7', 'D7', 'G', 'G', 'C', 'C', 'G', 'G', 'D7', 'D7', 'G', 'G'],
            'calm': ['G', 'G', 'C', 'C', 'G', 'G', 'D7', 'D7'], 'tense': ['Em', 'Em', 'B7', 'B7', 'Am', 'Am', 'B7', 'B7'], 'somber': ['Em', 'Em', 'Am', 'Am', 'Em', 'Em', 'B7', 'B7']}
    # simple original violin line (MIDI), one note per beat, 0 = rest; 16 bars
    mel = [67, 71, 74, 74, 72, 71, 69, 0, 66, 69, 72, 72, 71, 69, 66, 62, 66, 69, 67, 0, 0, 0, 71, 74,
           76, 76, 74, 72, 76, 72, 71, 74, 71, 67, 0, 0, 66, 69, 72, 74, 72, 69, 67, 71, 67, 67, 0, 0]   # 16 bars, aligned with 'bright'
    L, R = np.zeros(N), np.zeros(N)
    cacheK = {}
    def pl(f, d, br):
        k = (round(f, 1), d, br)
        if k not in cacheK: cacheK[k] = ks(f, d, br)
        return cacheK[k]
    def add(x, t0, gl, gr):
        i = int(t0 * SR)
        if i >= N: return
        x = x[: N - i]; L[i:i + len(x)] += x * gl; R[i:i + len(x)] += x * gr
    def mood_at(t):
        for sc in TL['scenes']:
            if sc['start'] <= t < sc['start'] + sc['dur']: return MOODS.get(sc['id'], 'bright')
        return 'bright'
    nb = int(TOTAL / bar) + 1
    for b in range(nb):
        t0 = b * bar; m = mood_at(t0 + bar / 2); pr = prog[m]; ch = G[pr[b % len(pr)]]
        root = NOTE(ch[0] - 12); fifth = NOTE(ch[2] - 12) if len(ch) > 2 else root * 1.5
        bass = root if b % 2 == 0 else fifth
        if m == 'somber':
            add(pl(bass, 2.4, 0.2) * 0.9, t0, 0.55, 0.55)
            for j, n in enumerate(ch[:3]): add(np.sin(2 * np.pi * NOTE(n) * t_(bar)) * np.sin(np.pi * t_(bar) / bar) * 0.18, t0, 0.5, 0.5)
            continue
        add(pl(bass, 1.4, 0.25) * 1.0, t0, 0.55, 0.55)                                  # guitarrón on 1
        strum = [NOTE(n) for n in ch]
        for k in (1, 2):                                                                  # guitar on 2 and 3
            if m == 'calm' and k == 2: continue
            for j, f in enumerate(strum):
                add(pl(f, 0.9, 0.35) * (0.3 if m != 'tense' else 0.2) * (0.8 if k == 2 else 1), t0 + k * beat + j * 0.012, 0.42 + 0.06 * j, 0.6 - 0.06 * j)
        if m == 'bright':                                                                 # violin melody, 3 notes per bar
            for k in range(3):
                n = mel[((b % 16) * 3 + k) % len(mel)]
                if not n: continue
                d = beat * 0.95; tt = t_(d); f = NOTE(n) * (1 + 0.006 * np.sin(2 * np.pi * 5.5 * tt) * np.minimum(1, tt * 4))
                ph = np.cumsum(f) / SR; v = (2 * (ph % 1) - 1) * 0.6 + np.sin(2 * np.pi * ph) * 0.4
                v = fft_filter(v, lo=300, hi=3200) * np.minimum(1, tt / 0.05) * np.minimum(1, (d - tt) / 0.08)
                add(v * 0.16, t0 + k * beat, 0.62, 0.45)
        if m == 'tense':
            add(np.sin(2 * np.pi * NOTE(40) * t_(bar)) * 0.12 * np.sin(np.pi * t_(bar) / bar), t0, 0.5, 0.5)
    # soften and add a small room: a few early reflections, then a gentle low-pass
    for X_ in (L, R):
        y = X_.copy()
        for dms, g in ((23, 0.22), (41, 0.16), (67, 0.12), (97, 0.08), (151, 0.05)):
            d_ = int(dms * SR / 1000); y[d_:] += X_[:-d_] * g
        X_[:] = fft_filter(y, lo=60, hi=4200)
    return L, R


# ------------------------------------------------------------------ martial bed for the Napoleonic video (fife, brass, drums, strings)
NAPO_MOODS = {'title': 'heroic', 'revolucion': 'tense', 'ascenso': 'heroic', 'trafalgar': 'heroic', 'austerlitz': 'heroic', 'tacticas': 'calm', 'bloqueo': 'tense',
              'imperio': 'calm', 'rusia': 'somber', 'caida': 'tense', 'waterloo': 'tense', 'legado': 'somber', 'outro': 'heroic'}
def napo_march(moods=NAPO_MOODS, bpm=104, key=0):
    beat = 60 / bpm; bar = 4 * beat
    CH = {'C': [48, 52, 55], 'G': [43, 47, 50, 53], 'F': [41, 45, 48], 'Am': [45, 48, 52], 'Dm': [50, 53, 57], 'E': [40, 44, 47, 50], 'Em': [40, 43, 47]}
    prog = {'heroic': ['C', 'G', 'F', 'C', 'C', 'F', 'G', 'C'], 'tense': ['Am', 'Am', 'Dm', 'E'], 'somber': ['Am', 'Am', 'F', 'F', 'C', 'C', 'E', 'E'], 'calm': ['C', 'Am', 'F', 'G']}
    mel = [[(67, 1), (72, 1), (72, .5), (74, .5), (76, 1)], [(76, 1), (74, .5), (72, .5), (74, 1), (67, 1)], [(69, 1), (74, 1), (74, .5), (76, .5), (77, 1)], [(76, 2), (0, 1), (67, 1)],
           [(67, 1), (72, 1), (72, .5), (74, .5), (76, 1)], [(79, 1), (77, .5), (76, .5), (74, 1), (72, 1)], [(69, 1), (71, .5), (72, .5), (74, 1), (71, 1)], [(72, 2), (0, 2)]]
    lament = [[(76, 2), (74, 1), (72, 1)], [(71, 3), (0, 1)], [(72, 2), (69, 2)], [(0, 4)], [(76, 2), (77, 1), (76, 1)], [(74, 3), (0, 1)], [(71, 2), (68, 2)], [(69, 3), (0, 1)]]
    L, R = np.zeros(N), np.zeros(N)
    def add(x, t0, gl=0.5, gr=0.5):
        i = int(t0 * SR)
        if i >= N or i < 0: return
        x = x[: N - i]; L[i:i + len(x)] += x * gl; R[i:i + len(x)] += x * gr
    cache_ = {}
    def memo(key, fn):
        if key not in cache_: cache_[key] = fn()
        return cache_[key]
    def saws(f, d, n=2, det=0.005):
        tt = t_(d); return sum(2 * ((f * (1 + det * (k - (n - 1) / 2)) * tt) % 1) - 1 for k in range(n)) / n
    def brass(m, d, stab=True):
        def mk():
            f = NOTE(m); x = fft_filter(saws(f, d, 2, 0.004), hi=1500 + f) ; tt = t_(d)
            e = np.minimum(1, tt / 0.035) * (np.exp(-tt * 2.2) * 0.7 + 0.3) if stab else np.minimum(1, tt / 0.08) * np.minimum(1, (d - tt) / 0.15)
            return x * e
        return memo(('b', m, round(d, 3), stab), mk)
    def strings(m, d):
        def mk():
            f = NOTE(m); tt = t_(d); x = fft_filter(saws(f, d, 3, 0.007), hi=1300)
            return x * np.minimum(1, tt / 0.45) * np.minimum(1, (d - tt) / 0.5)
        return memo(('s', m, round(d, 3)), mk)
    def fife(m, d):
        def mk():
            f = NOTE(m + 12); tt = t_(d); ff = f * (1 + 0.005 * np.sin(2 * np.pi * 5.6 * tt) * np.minimum(1, tt * 3)); ph = np.cumsum(ff) / SR
            x = np.sin(2 * np.pi * ph) + 0.18 * np.sin(6 * np.pi * ph) + fft_filter(noise(d), lo=2000, hi=7000) * 0.04
            return x * np.minimum(1, tt / 0.03) * np.minimum(1, (d - tt) / 0.06)
        return memo(('f', m, round(d, 3)), mk)
    def snare(g=1.0):
        return memo(('sn',), lambda: fft_filter(noise(0.16), lo=900, hi=6000) * env_exp(0.16, 28) + np.sin(2 * np.pi * 190 * t_(0.16)) * env_exp(0.16, 40) * 0.5) * g
    def kick(): return memo(('k',), lambda: sweep(95, 48, 0.32) * env_exp(0.32, 10))
    def timp(m): return memo(('t', m), lambda: (np.sin(2 * np.pi * NOTE(m) * t_(1.6)) + 0.3 * np.sin(2 * np.pi * NOTE(m) * 1.5 * t_(1.6))) * env_exp(1.6, 2.2) + fft_filter(noise(1.6), hi=300) * env_exp(1.6, 12) * 0.3)
    def mood_at(t):
        for sc in TL['scenes']:
            if sc['start'] <= t < sc['start'] + sc['dur']: return moods.get(sc['id'], 'heroic')
        return 'heroic'
    CH = {k: [n + key for n in v] for k, v in CH.items()}
    mel, lament = ([[(n + key if n else 0, du) for (n, du) in bar_] for bar_ in seq] for seq in (mel, lament))
    nb = int(TOTAL / bar) + 1; hb = 0
    for b in range(nb):
        t0 = b * bar; m = mood_at(t0 + bar / 2); pr = prog[m]; ch = CH[pr[b % len(pr)]]
        if m == 'heroic':
            for k in (0, 2): add(kick() * 0.55, t0 + k * beat)
            for k in (1, 3): add(snare(0.3), t0 + k * beat, 0.45, 0.55)
            if b % 2 == 1:
                for q in range(4): add(snare(0.2), t0 + 3 * beat + q * beat / 4, 0.45, 0.55)
            for n in ch[:3]: add(brass(n + 12, beat * 1.5) * 0.26, t0, 0.55, 0.45); add(brass(n + 12, beat * 0.6) * 0.18, t0 + 2 * beat, 0.55, 0.45)
            add(brass(ch[0], beat * 0.9) * 0.35, t0); add(brass(ch[0] + 7, beat * 0.9) * 0.3, t0 + 2 * beat)
            tt = t0
            for (n, du) in mel[hb % 8]:
                if n: add(fife(n, du * beat * 0.95) * 0.22, tt, 0.4, 0.6)
                tt += du * beat
            hb += 1
        elif m == 'tense':
            for q in range(8): add(strings(ch[0] - 12, beat * 0.45) * (0.32 if q % 2 == 0 else 0.22), t0 + q * beat / 2)
            add(timp(ch[0] - 12) * 0.5, t0)
            for n in ch[:3]: add(strings(n, bar) * 0.07, t0, 0.5, 0.5)
            if b % 4 == 3:
                for q in range(16): add(snare(0.08 + 0.2 * q / 16), t0 + q * beat / 4, 0.5, 0.5)
        elif m == 'somber':
            for n in ch[:3]: add(strings(n, bar) * 0.11, t0, 0.5, 0.5)
            add(strings(ch[0] - 12, bar) * 0.14, t0)
            tt = t0
            for (n, du) in lament[b % 8]:
                if n: add(fife(n - 12, du * beat * 0.95) * 0.1, tt, 0.45, 0.55)
                tt += du * beat
        else:  # calm
            for n in ch[:3]: add(strings(n, bar) * 0.08, t0, 0.5, 0.5)
            arp = [ch[0], ch[1], ch[2], ch[0] + 12, ch[2], ch[1], ch[2], ch[0] + 12]
            for q, n in enumerate(arp): add(memo(('h', n), lambda n=n: ks(NOTE(n + 12), 1.2, 0.3)) * 0.18, t0 + q * beat / 2, 0.4 + 0.03 * q, 0.62 - 0.03 * q)
    for X_ in (L, R):
        y = X_.copy()
        for dms, g in ((29, 0.25), (47, 0.18), (73, 0.13), (109, 0.09), (167, 0.06), (241, 0.04)):
            d_ = int(dms * SR / 1000); y[d_:] += X_[:-d_] * g
        X_[:] = fft_filter(y, lo=50, hi=5200)
    return L, R


AMER_MOODS = {'title': 'heroic', 'colonias': 'calm', 'trece': 'heroic', 'haiti': 'tense', 'napoleon': 'tense', 'grito': 'heroic', 'morelos': 'somber',
              'bolivar': 'heroic', 'sanmartin': 'heroic', 'iguala': 'calm', 'brasil': 'heroic', 'ayacucho': 'heroic', 'outro': 'calm'}


# ------------------------------------------------------------------ documentary bed for the cartels video (D minor pads, pulse, piano)
NARCO_MOODS = {'title': 'dark', 'origenes': 'suspense', 'guerra': 'tense', 'corrupcion': 'dark', 'impunidad': 'somber', 'negocio': 'tense', 'mapa': 'tense',
               'eeuu': 'suspense', 'amlo': 'calm', 'claudia': 'calm', 'criticas': 'somber', 'porque': 'tense', 'outro': 'hope'}
PUEBLA_MOODS = {'title': 'dark', 'corredor': 'suspense', 'huachicol': 'tense', 'carga': 'tense', 'enjambre': 'dark', 'municipios': 'suspense', 'carteles': 'tense',
                'violencia': 'somber', 'gobierno': 'calm', 'focos': 'tense', 'veredicto': 'suspense', 'outro': 'hope'}
RUSIA_MOODS = {'title': 'dark', 'zar': 'somber', 'domingo': 'tense', 'guerra': 'dark', 'febrero': 'suspense', 'lenin': 'suspense', 'octubre': 'tense',
               'poder': 'dark', 'romanov': 'somber', 'civil': 'tense', 'urss': 'dark', 'mexico': 'suspense', 'outro': 'hope'}
WW1_MOODS = {'title': 'dark', 'europa': 'suspense', 'sarajevo': 'tense', 'julio': 'tense', 'marne': 'dark', 'trincheras': 'somber', 'armas': 'tense',
             'verdun': 'dark', 'mundo': 'suspense', 'telegrama': 'suspense', 'fin': 'tense', 'versalles': 'calm', 'outro': 'somber'}
WWII_MOODS = {'titulo': 'dark', 'causas': 'suspense', 'polonia': 'tense', 'francia': 'tense', 'este': 'dark', 'pacifico': 'tense', 'africa': 'suspense',
              'holocausto': 'somber', 'frente': 'calm', 'mexico': 'suspense', 'diad': 'tense', 'bomba': 'dark', 'legado': 'somber', 'final': 'hope'}
def narco_bed(moods=NARCO_MOODS, bpm=80, key=0):
    beat = 60 / bpm; bar = 4 * beat
    CH = {'Dm': [50, 53, 57], 'Bb': [46, 50, 53], 'Gm': [43, 46, 50], 'A': [45, 49, 52], 'F': [41, 45, 48], 'C': [48, 52, 55],
          'D': [50, 54, 57], 'G': [43, 47, 50], 'Bm': [47, 50, 54]}
    prog = {'dark': ['Dm', 'Dm', 'Bb', 'A'], 'suspense': ['Dm', 'Bb', 'Gm', 'A'], 'tense': ['Dm', 'Dm', 'Bb', 'A'], 'somber': ['Dm', 'F', 'Gm', 'Dm'],
            'calm': ['F', 'C', 'Dm', 'Bb'], 'hope': ['D', 'A', 'Bm', 'G']}
    lament = [[(69, 2), (67, 1), (65, 1)], [(64, 3), (0, 1)], [(65, 2), (62, 2)], [(0, 4)]]
    L, R = np.zeros(N), np.zeros(N)
    def add(x, t0, gl=0.5, gr=0.5):
        i = int(t0 * SR)
        if i >= N or i < 0: return
        x = x[: N - i]; L[i:i + len(x)] += x * gl; R[i:i + len(x)] += x * gr
    cache_ = {}
    def memo(key, fn):
        if key not in cache_: cache_[key] = fn()
        return cache_[key]
    def saws(f, d, n=3, det=0.006):
        tt = t_(d); return sum(2 * ((f * (1 + det * (k - (n - 1) / 2)) * tt) % 1) - 1 for k in range(n)) / n
    def pad(m, d, hi=1100):
        def mk():
            f = NOTE(m); tt = t_(d); x = fft_filter(saws(f, d) + 0.6 * np.sin(2 * np.pi * f * tt), hi=hi)
            return x * np.minimum(1, tt / 0.9) * np.minimum(1, (d - tt) / 0.9)
        return memo(('p', m, round(d, 3), hi), mk)
    def piano(m, d=1.8, br=0.35): return memo(('k', m, d, br), lambda: ks(NOTE(m), d, br, 0.997))
    def kick(): return memo(('kick',), lambda: sweep(100, 42, 0.4) * env_exp(0.4, 9))
    def hat(): return memo(('hat',), lambda: fft_filter(noise(0.05), lo=6000) * env_exp(0.05, 90))
    def subb(m, d): return memo(('sb', m, round(d, 3)), lambda: fade(np.tanh(2.2 * np.sin(2 * np.pi * NOTE(m) * t_(d))) * env_exp(d, 3.0), 0.005, 0.04))
    def trem(m, d):
        def mk():
            tt = t_(d); f = NOTE(m); x = fft_filter(saws(f, d, 2, 0.003), hi=2400) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * tt))
            return x * np.minimum(1, tt / 1.5) * np.minimum(1, (d - tt) / 1.0)
        return memo(('tr', m, round(d, 3)), mk)
    def mood_at(t):
        for sc in TL['scenes']:
            if sc['start'] <= t < sc['start'] + sc['dur']: return moods.get(sc['id'], 'tense')
        return 'dark'
    CH = {k: [n + key for n in v] for k, v in CH.items()}
    lament = [[(n + key if n else 0, du) for (n, du) in bar_] for bar_ in lament]
    nb = int(TOTAL / bar) + 1
    for b in range(nb):
        t0 = b * bar; m = mood_at(t0 + bar / 2); pr = prog[m]; ch = CH[pr[b % len(pr)]]
        if m in ('dark', 'suspense', 'tense'):
            for n in ch: add(pad(n - 12, bar) * 0.1, t0, 0.55, 0.45)
            add(pad(ch[0] - 24, bar, 500) * 0.2, t0)
            add(kick() * 0.5, t0)
            if m == 'dark':
                if b % 2 == 0: add(trem(ch[0] + 12, 2 * bar) * 0.035, t0, 0.4, 0.6)
            elif m == 'suspense':
                add(kick() * 0.35, t0 + 2 * beat)
                for q in range(8): add(piano(ch[(0, 2, 1, 2)[q % 4]] + 12, 0.9, 0.25) * 0.09, t0 + q * beat / 2, 0.42 + 0.02 * q, 0.58 - 0.02 * q)
            else:
                add(kick() * 0.4, t0 + 2 * beat)
                for q in range(8): add(subb(ch[0] - 24 + (12 if q == 7 else 0), beat * 0.45) * 0.16, t0 + q * beat / 2)
                for q in range(16): add(hat() * (0.05 if q % 4 else 0.08), t0 + q * beat / 4, 0.4, 0.6)
        elif m == 'somber':
            for n in ch: add(pad(n - 12, bar) * 0.09, t0, 0.5, 0.5)
            add(pad(ch[0] - 24, bar, 500) * 0.14, t0)
            tt = t0
            for (n, du) in lament[b % 4]:
                if n: add(piano(n, 2.4, 0.2) * 0.16, tt, 0.45, 0.55)
                tt += du * beat
        else:  # calm / hope
            for n in ch: add(pad(n - 12, bar, 1400) * (0.08 if m == 'calm' else 0.1), t0, 0.5, 0.5)
            add(pad(ch[0] - 24, bar, 500) * 0.12, t0)
            arp = [ch[0], ch[1], ch[2], ch[0] + 12, ch[2], ch[1], ch[2], ch[0] + 12]
            for q, n in enumerate(arp): add(piano(n + 12, 1.4, 0.3) * (0.1 if m == 'calm' else 0.13), t0 + q * beat / 2, 0.4 + 0.03 * q, 0.62 - 0.03 * q)
            if m == 'hope': add(kick() * 0.3, t0)
    for X_ in (L, R):
        y = X_.copy()
        for dms, g in ((31, 0.28), (53, 0.2), (79, 0.15), (113, 0.11), (173, 0.08), (257, 0.05), (389, 0.03)):
            d_ = int(dms * SR / 1000); y[d_:] += X_[:-d_] * g
        X_[:] = fft_filter(y, lo=40, hi=5200)
    return L, R


# ------------------------------------------------------------------ "¿Qué pasaría si...?": idol pop, marimba, driving rock, calm and tense beds
WHATIF_MOODS = {'titulo': 'pop', 'mexico': 'marimba', 'eeuu': 'drive', 'vecinos': 'calm', 'llamada': 'tense', 'mundo': 'marimba', 'mundo2': 'marimba',
                'cumbre': 'pop', 'entrena': 'drive', 'carrera': 'race', 'live': 'pop', 'final': 'calm'}
def whatif_pop(moods=WHATIF_MOODS, bpm=124, key=0):
    beat = 60 / bpm; bar = 4 * beat
    CH = {'C': [48, 52, 55], 'G': [43, 47, 50], 'Am': [45, 48, 52], 'F': [41, 45, 48], 'Dm': [50, 53, 57], 'E': [40, 44, 47], 'Em': [40, 43, 47]}
    CH = {k: [n + key for n in v] for k, v in CH.items()}
    prog = {'pop': ['C', 'G', 'Am', 'F'], 'marimba': ['C', 'F', 'G', 'C', 'Am', 'F', 'G', 'C'], 'drive': ['Am', 'F', 'C', 'G'], 'race': ['Am', 'F', 'C', 'G'], 'calm': ['F', 'C', 'G', 'Am'], 'tense': ['Am', 'Am', 'Dm', 'E']}
    hook = [[(76, .5), (76, .5), (79, 1), (76, .5), (74, .5), (72, 1)], [(74, .5), (74, .5), (76, .5), (74, .5), (71, 2)], [(72, .5), (72, .5), (76, 1), (79, .5), (81, .5), (79, 1)], [(77, 1), (76, .5), (74, .5), (72, 2)]]
    hook = [[(n + key, d) for n, d in b_] for b_ in hook]
    L, R = np.zeros(N), np.zeros(N)
    cache_ = {}
    def memo(k, fn):
        if k not in cache_: cache_[k] = fn()
        return cache_[k]
    def add(x, t0, gl=0.5, gr=0.5):
        i = int(t0 * SR)
        if i >= N or i < 0: return
        x = x[: N - i]; L[i:i + len(x)] += x * gl; R[i:i + len(x)] += x * gr
    def kick(): return memo('k', lambda: sweep(110, 45, 0.3) * env_exp(0.3, 11))
    def clap(): return memo('c', lambda: fft_filter(noise(0.18), lo=900, hi=5000) * (env_exp(0.18, 30) + 0.5 * np.roll(env_exp(0.18, 40), int(0.012 * SR))))
    def hat(o=False): return memo(('h', o), lambda: fft_filter(noise(0.25 if o else 0.05), lo=7000) * env_exp(0.25 if o else 0.05, 14 if o else 70))
    def snare(): return memo('s', lambda: fft_filter(noise(0.2), lo=1200, hi=7000) * env_exp(0.2, 22) + np.sin(2 * np.pi * 200 * t_(0.2)) * env_exp(0.2, 35) * 0.5)
    def bass(m, d): return memo(('b', m, round(d, 3)), lambda: fft_filter(2 * ((NOTE(m) * t_(d)) % 1) - 1, hi=420) * np.minimum(1, t_(d) / 0.01) * np.exp(-t_(d) * 1.5))
    def marimba(m, d=0.6): return memo(('m', m), lambda: (np.sin(2 * np.pi * NOTE(m) * t_(d)) + 0.25 * np.sin(2 * np.pi * NOTE(m) * 4 * t_(d)) * env_exp(d, 18)) * env_exp(d, 6) * np.minimum(1, t_(d) / 0.003))
    def lead(m, d):
        def mk():
            tt = t_(d); f = NOTE(m) * (1 + 0.004 * np.sin(2 * np.pi * 5.5 * tt) * np.minimum(1, tt * 2)); ph = np.cumsum(f) / SR
            x = sum(np.sin(2 * np.pi * k * ph) / k for k in (1, 3, 5, 7)) * 0.8 + 0.3 * np.sin(4 * np.pi * ph)
            return fft_filter(x, hi=4200) * np.minimum(1, tt / 0.015) * np.minimum(1, (d - tt) / 0.06) * (0.75 + 0.25 * np.exp(-tt * 3))
        return memo(('l', m, round(d, 3)), mk)
    def stab(chord, d):
        def mk(): tt = t_(d); return fft_filter(sum(2 * ((NOTE(n + 12) * tt * (1 + det)) % 1) - 1 for n in chord for det in (-0.004, 0.004)), hi=2600) * np.minimum(1, tt / 0.01) * np.exp(-tt * 5)
        return memo(('st', tuple(chord), round(d, 3)), mk)
    def pad(chord, d):
        def mk(): tt = t_(d); return fft_filter(sum(2 * ((NOTE(n + 12) * tt * (1 + det)) % 1) - 1 for n in chord for det in (-0.006, 0.006)), hi=1400) * np.minimum(1, tt / 0.6) * np.minimum(1, (d - tt) / 0.6)
        return memo(('p', tuple(chord), round(d, 3)), mk)
    def mood_at(t):
        for sc in TL['scenes']:
            if sc['start'] <= t < sc['start'] + sc['dur']: return moods.get(sc['id'], 'pop')
        return 'pop'
    nb = int(TOTAL / bar) + 1
    for b in range(nb):
        t0 = b * bar; m = mood_at(t0 + bar / 2); pr = prog[m]; ch = CH[pr[b % len(pr)]]
        if m in ('pop', 'drive', 'race'):
            fast = m == 'race'
            for k in range(4): add(kick() * 0.6, t0 + k * beat)
            for k in (1, 3): add((clap() if m == 'pop' else snare()) * 0.32, t0 + k * beat, 0.45, 0.55)
            for q in range(8 if not fast else 16): add(hat(q % 4 == 2 and not fast) * 0.12, t0 + q * beat / (2 if not fast else 4), 0.35, 0.65)
            for q in range(8): add(bass(ch[0] - 12 + (12 if q % 2 else 0), beat * 0.45) * 0.42, t0 + q * beat / 2)
            if m == 'pop':
                for q in (0, 1.5, 3): add(stab(ch, beat * 0.5) * 0.11, t0 + q * beat, 0.55, 0.45)
                tt = t0
                for (n, du) in hook[b % 4]:
                    add(lead(n, du * beat * 0.92) * 0.10, tt, 0.42, 0.58); tt += du * beat
            else:
                add(pad(ch, bar) * 0.06, t0); add(stab(ch, beat * 0.4) * 0.13, t0); add(stab(ch, beat * 0.4) * 0.1, t0 + 2.5 * beat)
        elif m == 'marimba':
            arp = [ch[0], ch[1], ch[2], ch[1], ch[0] + 12, ch[2], ch[1], ch[2]]
            for q, n in enumerate(arp): add(marimba(n + 12) * 0.24, t0 + q * beat / 2, 0.38 + 0.03 * q, 0.62 - 0.03 * q)
            for q in (0, 2): add(bass(ch[0] - 12, beat * 0.9) * 0.35, t0 + q * beat)
            add(kick() * 0.35, t0); add(kick() * 0.25, t0 + 2.5 * beat)
            for q in range(4): add(hat() * 0.08, t0 + q * beat + beat / 2, 0.4, 0.6)
            if b % 2 == 1: add(marimba(ch[2] + 24, 0.4) * 0.12, t0 + 3.5 * beat)
        elif m == 'tense':
            for q in range(8): add(stab([ch[0]], beat * 0.4) * (0.16 if q % 2 == 0 else 0.1), t0 + q * beat / 2)
            add(pad(ch, bar) * 0.06, t0); add(kick() * 0.3, t0)
        else:  # calm
            add(pad(ch, bar) * 0.09, t0)
            arp = [ch[0], ch[1], ch[2], ch[0] + 12, ch[2], ch[1], ch[2], ch[0] + 12]
            for q, n in enumerate(arp): add(memo(('ks', n), lambda n=n: ks(NOTE(n + 12), 1.2, 0.3)) * 0.16, t0 + q * beat / 2, 0.4 + 0.03 * q, 0.62 - 0.03 * q)
            add(bass(ch[0] - 12, bar * 0.9) * 0.22, t0)
    for X_ in (L, R):
        y = X_.copy()
        for dms, g in ((31, 0.22), (53, 0.16), (79, 0.11), (113, 0.08), (173, 0.05)):
            d_ = int(dms * SR / 1000); y[d_:] += X_[:-d_] * g
        X_[:] = fft_filter(y, lo=40, hi=7000)
    return L, R


# ------------------------------------------------------------------ music bed (D minor, slow pads + soft pulse)
if VIDEO == 'mx':
    musL, musR = corrido(); t_all = np.arange(N) / SR
    sc_ = 0.15 / (max(np.max(np.abs(musL)), np.max(np.abs(musR))) + 1e-9); musL, musR = musL * sc_, musR * sc_
if VIDEO == 'napo':
    musL, musR = napo_march(); t_all = np.arange(N) / SR
    sc_ = 0.16 / (max(np.max(np.abs(musL)), np.max(np.abs(musR))) + 1e-9); musL, musR = musL * sc_, musR * sc_
if VIDEO == 'amer':
    musL, musR = napo_march(AMER_MOODS, bpm=100, key=2); t_all = np.arange(N) / SR
    sc_ = 0.16 / (max(np.max(np.abs(musL)), np.max(np.abs(musR))) + 1e-9); musL, musR = musL * sc_, musR * sc_
if VIDEO == 'narco':
    musL, musR = narco_bed(); t_all = np.arange(N) / SR
    sc_ = 0.15 / (max(np.max(np.abs(musL)), np.max(np.abs(musR))) + 1e-9); musL, musR = musL * sc_, musR * sc_
if VIDEO == 'puebla':
    musL, musR = narco_bed(PUEBLA_MOODS, bpm=76, key=2); t_all = np.arange(N) / SR
    sc_ = 0.15 / (max(np.max(np.abs(musL)), np.max(np.abs(musR))) + 1e-9); musL, musR = musL * sc_, musR * sc_
if VIDEO == 'rusia':
    musL, musR = narco_bed(RUSIA_MOODS, bpm=72, key=-2); t_all = np.arange(N) / SR
    sc_ = 0.15 / (max(np.max(np.abs(musL)), np.max(np.abs(musR))) + 1e-9); musL, musR = musL * sc_, musR * sc_
BPM = 84; beat = 60 / BPM
if VIDEO == 'ww1':
    musL, musR = narco_bed(WW1_MOODS, bpm=70, key=-3); t_all = np.arange(N) / SR
    sc_ = 0.15 / (max(np.max(np.abs(musL)), np.max(np.abs(musR))) + 1e-9); musL, musR = musL * sc_, musR * sc_
if VIDEO == 'wwii':
    musL, musR = narco_bed(WWII_MOODS, bpm=72, key=-2); t_all = np.arange(N) / SR
    sc_ = 0.15 / (max(np.max(np.abs(musL)), np.max(np.abs(musR))) + 1e-9); musL, musR = musL * sc_, musR * sc_
if VIDEO == 'whatif':
    musL, musR = whatif_pop(); t_all = np.arange(N) / SR
    sc_ = 0.15 / (max(np.max(np.abs(musL)), np.max(np.abs(musR))) + 1e-9); musL, musR = musL * sc_, musR * sc_
if VIDEO not in ('mx', 'napo', 'amer', 'narco', 'puebla', 'rusia', 'ww1', 'whatif', 'wwii'):
    prog = [[146.8, 174.6, 220.0], [116.5, 146.8, 174.6], [174.6, 220.0, 261.6], [130.8, 164.8, 196.0]]  # Dm Bb F C
    bar = 4 * beat
    musL, musR = np.zeros(N), np.zeros(N)
    t_all = np.arange(N) / SR
    seg = int(2 * bar * SR)
    for k in range(0, N, seg):
        ch = prog[(k // seg) % 4]; n = min(seg, N - k); tt = np.arange(n) / SR
        padL = sum(2 * ((f * 0.5 * 1.003 * tt) % 1) - 1 for f in ch) + sum(np.sin(2 * np.pi * f * tt) for f in ch)
        padR = sum(2 * ((f * 0.5 * 0.997 * tt) % 1) - 1 for f in ch) + sum(np.sin(2 * np.pi * f * tt) for f in ch)
        e = np.minimum(1, tt / 1.2) * np.minimum(1, (n / SR - tt) / 1.2)
        musL[k:k + n] += padL * e; musR[k:k + n] += padR * e
        bass = np.sin(2 * np.pi * ch[0] / 2 * tt) * e
        musL[k:k + n] += bass * 1.2; musR[k:k + n] += bass * 1.2
    musL, musR = fft_filter(musL, hi=1100), fft_filter(musR, hi=1100)
    # soft low pulse on beats 1 and 3
    pulse = np.zeros(N); kick = sweep(110, 45, 0.35) * env_exp(0.35, 12)
    for b in np.arange(0, TOTAL, 2 * beat):
        i = int(b * SR); pulse[i:i + len(kick)] += kick[: max(0, N - i)]
    mus_scale = 0.11 / (np.max(np.abs(musL)) + 1e-9)
    musL, musR = musL * mus_scale + pulse * 0.10, musR * mus_scale + pulse * 0.10
# duck under narration
win = int(0.05 * SR)
def movavg(x, w):
    c = np.cumsum(np.concatenate([np.zeros(w // 2 + 1), x, np.zeros(w)]))
    return (c[w:w + len(x)] - c[:len(x)]) / w


envn = np.sqrt(np.maximum(movavg(nar ** 2, win), 0))
envn = movavg(envn, int(0.3 * SR))
duck = 1 - 0.5 * np.clip(envn / (envn.max() * 0.5), 0, 1)
fin = np.clip(np.minimum(t_all / 2.0, (TOTAL - 0.5 - t_all) / 3.0), 0, 1)
for sc in TL['scenes']:  # silence the music bed under quiet scenes (the memorial)
    if sc['id'] == 'cost' or (VIDEO == 'wwii' and sc['id'] == 'holocausto'):
        a, b = sc['start'], sc['start'] + sc['dur']
        fin *= 1 - (0.6 if VIDEO == 'wwii' else 1.0) * np.clip(np.minimum((t_all - (a - 1.5)) / 1.5, ((b + 1.5) - t_all) / 1.5), 0, 1)   # the Holocaust: the bed drops to a whisper
musL, musR = musL * duck * fin, musR * duck * fin

if os.environ.get('MUSIC_ONLY'):
    o = (np.stack([musL, musR], 1) / (max(np.abs(musL).max(), np.abs(musR).max()) + 1e-9) * 0.8 * 32767).astype(np.int16)
    with wave.open(os.path.join(B, 'music.wav'), 'w') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(o.tobytes())
    print('music only written'); raise SystemExit
# ------------------------------------------------------------------ mix
sfx = sfx * 0.55
L = nar + musL + sfx
R = nar + musR + sfx
mx = max(np.max(np.abs(L)), np.max(np.abs(R)))
L, R = np.tanh(L / mx * 1.25) / np.tanh(1.25) * 0.93, np.tanh(R / mx * 1.25) / np.tanh(1.25) * 0.93
out = (np.stack([L, R], 1) * 32767).astype(np.int16)
with wave.open(os.path.join(B, 'mix.wav'), 'w') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
print('mix ok', TOTAL, 's; peaks nar/sfx/mus', round(np.abs(nar).max(), 2), round(np.abs(sfx).max(), 2), round(np.abs(musL).max(), 2))
