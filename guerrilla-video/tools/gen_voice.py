"""Synthesize narration line-by-line with Piper and write build/timeline.json."""
import json, os, subprocess, sys, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = sys.argv[1]  # path to piper .onnx voice
SR = 22050
GAP = 0.45
out_dir = os.path.join(ROOT, 'build', 'voice'); os.makedirs(out_dir, exist_ok=True)
script = json.load(open(os.path.join(ROOT, 'src', 'script.json')))

def read(path):
    with wave.open(path) as w:
        assert w.getframerate() == SR
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768

timeline, chunks, t = [], [], 0.0
for si, sc in enumerate(script['scenes']):
    gaps = sc.get('gaps', {})
    lt, lines = sc['lead'], []
    for li, text in enumerate(sc['lines']):
        path = os.path.join(out_dir, f's{si:02d}_l{li}.wav')
        if not os.path.exists(path):
            subprocess.run([sys.executable, '-m', 'piper', '-m', VOICE, '-f', path, '--length_scale', '1.04',
                            '--sentence_silence', '0.25'], input=text.encode(), check=True, capture_output=True)
        a = read(path)
        # trim leading/trailing silence
        nz = np.nonzero(np.abs(a) > 0.01)[0]
        a = a[max(nz[0] - 200, 0): nz[-1] + 1200]
        d = len(a) / SR
        lines.append({'t0': round(lt, 3), 't1': round(lt + d, 3), 'text': text})
        chunks.append((t + lt, a))
        lt += d + gaps.get(str(li), GAP)
    dur = lt - GAP + sc['tail'] if not gaps.get(str(len(sc['lines']) - 1)) else lt + sc['tail']
    timeline.append({'id': sc['id'], 'start': round(t, 3), 'dur': round(dur, 3), 'lines': lines})
    t += dur

total = t
buf = np.zeros(int(total * SR) + SR, dtype=np.float32)
for st, a in chunks:
    i = int(st * SR); buf[i:i + len(a)] += a
with wave.open(os.path.join(ROOT, 'build', 'narration.wav'), 'w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(buf, -1, 1) * 32767).astype(np.int16).tobytes())
json.dump({'total': round(total, 3), 'scenes': timeline}, open(os.path.join(ROOT, 'build', 'timeline.json'), 'w'), indent=1)
for s in timeline: print(f"{s['id']:10s} start {s['start']:7.2f} dur {s['dur']:6.2f}")
print('total', round(total, 2))
