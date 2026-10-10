"""Synthesize narration with a Microsoft neural voice and write build/<lang>/timeline.json.

Usage: python3 tools/gen_voice_edge.py es es-MX-JorgeNeural -5%
Lines are cached in build/<lang>/voice/; delete a line's files to re-synthesize it.
Word timestamps are stored per line so subtitles and on-screen lists sync to the spoken words.
"""
import json, os, subprocess, sys, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANG, VOICE, RATE = sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else '+0%'
SR = 24000
GAP = 0.45
OUT = os.path.join(ROOT, 'build', LANG)
os.makedirs(os.path.join(OUT, 'voice'), exist_ok=True)
# Phonetic respellings for the TTS only; subtitles keep the real spelling.
SAY = {'Cu Chi': 'Ku Chi'}
script = json.load(open(os.path.join(ROOT, 'src', f'script_{LANG}.json')))


def say(text):
    for k, v in SAY.items(): text = text.replace(k, v)
    return text


def decode(path):
    pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.int16).astype(np.float32) / 32768


timeline, chunks, t = [], [], 0.0
for si, sc in enumerate(script['scenes']):
    gaps = sc.get('gaps', {})
    lt, lines = sc['lead'], []
    for li, text in enumerate(sc['lines']):
        mp3 = os.path.join(OUT, 'voice', f's{si:02d}_l{li}.mp3')
        if not os.path.exists(mp3):
            subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'edge_say.py'), VOICE, RATE, say(text), mp3], check=True)
        words = json.load(open(mp3[:-4] + '.words.json'))
        a = decode(mp3)
        nz = np.nonzero(np.abs(a) > 0.008)[0]
        s0 = max(nz[0] - int(0.03 * SR), 0); a = a[s0: nz[-1] + int(0.12 * SR)]
        a[: int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR)); a[-int(0.03 * SR):] *= np.linspace(1, 0, int(0.03 * SR))
        d = len(a) / SR
        off = lt - s0 / SR
        lines.append({'t0': round(lt, 3), 't1': round(lt + d, 3), 'text': text,
                      'words': [{'w': w['w'], 't0': round(off + w['t0'], 3), 't1': round(off + w['t1'], 3)} for w in words]})
        chunks.append((t + lt, a))
        lt += d + gaps.get(str(li), GAP)
    last_gap = gaps.get(str(len(sc['lines']) - 1))
    dur = (lt if last_gap else lt - GAP) + sc['tail']
    timeline.append({'id': sc['id'], 'start': round(t, 3), 'dur': round(dur, 3), 'lines': lines})
    t += dur

buf = np.zeros(int(t * SR) + SR, dtype=np.float32)
for st, a in chunks:
    i = int(st * SR); buf[i:i + len(a)] += a
with wave.open(os.path.join(OUT, 'narration.wav'), 'w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(buf, -1, 1) * 32767).astype(np.int16).tobytes())
json.dump({'total': round(t, 3), 'scenes': timeline}, open(os.path.join(OUT, 'timeline.json'), 'w'), indent=1, ensure_ascii=False)
for s in timeline: print(f"{s['id']:10s} start {s['start']:7.2f} dur {s['dur']:6.2f}")
print('total', round(t, 2))
