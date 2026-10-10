"""Synthesize SFX + a music bed and mix them under the narration.

Usage: python3 tools/mix_audio.py  ->  build/mix.wav (44.1 kHz stereo)
Everything is generated procedurally with numpy (seeded), so the mix is reproducible.
"""
import json, os, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100
rng = np.random.default_rng(7)
TL = json.load(open(os.path.join(ROOT, 'build', 'timeline.json')))
EV = json.load(open(os.path.join(ROOT, 'build', 'events.json')))
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
    n = len(x); ia, ib = int(a * SR), int(b * SR)
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


ONE = {'shot': shot, 'boom': lambda: boom(False), 'bigboom': lambda: boom(True), 'whoosh': whoosh, 'pop': pop, 'click': click,
       'thud': thud, 'creak': creak, 'sting': sting, 'sting2': sting2, 'tension': tension, 'beep': beep, 'tick': tick,
       'missile': missile, 'brakes': brakes, 'cheer': cheer}
LOOP = {'engine': engine, 'march': march, 'drone': drone, 'train': train, 'wind': wind, 'clock': clock}

sfx = np.zeros(N)
cache = {}
for e in EV:
    ty, t0, vol = e['type'], e['t'], e.get('vol', 1.0)
    if ty in LOOP: x = LOOP[ty](max(0.3, e.get('dur', 2)))
    else:
        if ty not in cache or ty == 'shot': cache[ty] = ONE[ty]()
        x = cache[ty]
    i = int(t0 * SR); x = x[: max(0, N - i)]
    sfx[i:i + len(x)] += x * vol

# ------------------------------------------------------------------ narration
with wave.open(os.path.join(ROOT, 'build', 'narration.wav')) as w:
    nsr = w.getframerate(); nar = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
nar = np.interp(np.arange(N) / SR, np.arange(len(nar)) / nsr, nar, right=0)
nar = norm(nar, 0.92)

# ------------------------------------------------------------------ music bed (D minor, slow pads + soft pulse)
BPM = 84; beat = 60 / BPM
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
musL, musR = musL * duck * fin, musR * duck * fin

# ------------------------------------------------------------------ mix
sfx = sfx * 0.55
L = nar + musL + sfx
R = nar + musR + sfx
mx = max(np.max(np.abs(L)), np.max(np.abs(R)))
L, R = np.tanh(L / mx * 1.25) / np.tanh(1.25) * 0.93, np.tanh(R / mx * 1.25) / np.tanh(1.25) * 0.93
out = (np.stack([L, R], 1) * 32767).astype(np.int16)
with wave.open(os.path.join(ROOT, 'build', 'mix.wav'), 'w') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
print('mix ok', TOTAL, 's; peaks nar/sfx/mus', round(np.abs(nar).max(), 2), round(np.abs(sfx).max(), 2), round(np.abs(musL).max(), 2))
