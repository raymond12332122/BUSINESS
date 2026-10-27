"""Synthesize narration with a Fish Audio voice and write build/<video>/<lang>/timeline.json (+ narration.wav).

Usage: python3 tools/gen_voice_fish.py es <voice_id> <video> [model]       (reads the API key from FISH_API_KEY)
       python3 tools/gen_voice_fish.py es <voice_id> <video> --fetch-only   (only download the takes, no alignment)
       python3 tools/gen_voice_fish.py es <voice_id> <video> --dry          (re-times the Microsoft voice instead, to test)
Each script line gets TAKES requests (default 2), kept as mp3 in assets/voice/<video>/ (named by a hash of the spoken
text, voice, model and speed, so a changed line is fetched again); the take Whisper follows best is used.
Fish Audio returns audio only, so word timings come from Whisper on each line, mapped back onto the script's own
words (subtitles keep the real spelling). A line Whisper can't follow is synthesized again (up to 3 tries, best kept).
Optional script keys: "style" (a cue before every line, e.g. "[calm]") and per scene "styles": {"<line>": "[whispering]"}.
FISH_SCENES=id,id with --fetch-only fetches just those scenes (run a few of these beside the main run to fetch in parallel).
"""
import difflib, hashlib, json, os, re, ssl, subprocess, sys, time, unicodedata, urllib.error, urllib.request, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANG, VOICE, VIDEO = sys.argv[1], sys.argv[2], sys.argv[3]
DRY, FETCH = '--dry' in sys.argv, '--fetch-only' in sys.argv
TAKES = int(os.environ.get('FISH_TAKES', '2'))
ONLY = [x for x in os.environ.get('FISH_SCENES', '').split(',') if x]
MODEL = next((a for a in sys.argv[4:] if not a.startswith('--')), os.environ.get('FISH_MODEL', 's2.1-pro'))
SPEED = float(os.environ.get('FISH_SPEED', '0.94'))
SR, GAP = 24000, 0.45
OUT = os.path.join(ROOT, 'build', VIDEO, LANG); VD = os.path.join(ROOT, 'assets', 'voice', VIDEO); os.makedirs(VD, exist_ok=True)
script = json.load(open(os.path.join(ROOT, 'src', VIDEO, f'script_{LANG}.json')))
# Spoken forms for the TTS only; subtitles keep the script's spelling.
SAY = [(r'AT&T', 'Ei Ti and Ti'), (r'\bapp\b', 'ap'), (r'\bPerches\b', 'Pérches'), (r'\b1985\b', 'mil novecientos ochenta y cinco')]
# Whisper results per take, so a re-run (one line changed) only listens to the new takes.
CACHE_F = os.path.join(VD, 'asr_cache.json'); CACHE = json.load(open(CACHE_F)) if os.path.exists(CACHE_F) else {}


def say(text):
    for a, b in SAY: text = re.sub(a, b, text)
    return text


def norm(w):
    w = unicodedata.normalize('NFD', w.lower()); w = ''.join(c for c in w if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9ñ&]', '', w)


def decode(path, sr):
    pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', str(sr), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.int16).astype(np.float32) / 32768


def tts(text, path):
    key = os.environ.get('FISH_API_KEY')
    if not key: raise SystemExit('FISH_API_KEY is not set in this environment')
    body = json.dumps({'text': text, 'reference_id': VOICE, 'format': 'mp3', 'mp3_bitrate': 192, 'sample_rate': 44100, 'normalize': True, 'latency': 'normal',
                       'temperature': 0.7, 'top_p': 0.7, 'prosody': {'speed': SPEED}}).encode()
    req = urllib.request.Request('https://api.fish.audio/v1/tts', data=body, method='POST',
                                 headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json', 'model': MODEL})
    ca = '/root/.ccr/ca-bundle.crt'
    ctx = ssl.create_default_context(cafile=ca) if os.path.exists(ca) else ssl.create_default_context()
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=240, context=ctx) as r: data = r.read()
            if len(data) < 2000: raise urllib.error.URLError('short response')
            open(path, 'wb').write(data); return
        except urllib.error.HTTPError as e:
            msg = e.read()[:300].decode('utf-8', 'replace')
            if e.code in (429, 500, 502, 503, 504): time.sleep(2 * 2 ** attempt); continue
            raise SystemExit(f'Fish Audio HTTP {e.code}: {msg}')
        except (urllib.error.URLError, TimeoutError, ConnectionError): time.sleep(2 * 2 ** attempt)
    raise SystemExit('Fish Audio: no answer after retries')


_asr = None
def asr():
    global _asr
    if _asr is None:
        from faster_whisper import WhisperModel
        _asr = WhisperModel(os.environ.get('ASR_MODEL', 'medium'), device='cpu', compute_type='int8')
    return _asr


def check(a16, text):
    """How well an unprompted transcription matches the line (0..1), what Whisper heard, and where to cut trailing noise
    (a word Whisper heard after the end of the script, e.g. a stray syllable the voice adds)."""
    segs, _ = asr().transcribe(a16, language=LANG, beam_size=5, word_timestamps=True)
    ws = [w for s in segs for w in s.words if norm(w.word)]
    heard = ' '.join(w.word.strip() for w in ws)
    nt, nw = [norm(x) for x in text.split()], [norm(w.word) for w in ws]
    sm = difflib.SequenceMatcher(None, nt, nw, autojunk=False); ops = sm.get_opcodes(); cut = None
    if ops and ops[-1][0] == 'insert' and ops[-1][1] == len(nt) and ops[-1][3] > 0: cut = ws[ops[-1][3] - 1].end + 0.1
    return sm.ratio(), heard, cut


def align(a16, text):
    """Word times (s, in a16) for each script token, how much of the line Whisper recognised, and what it heard."""
    segs, _ = asr().transcribe(a16, language=LANG, word_timestamps=True, initial_prompt=text, beam_size=5)
    ws = [w for s in segs for w in s.words if norm(w.word)]
    toks = text.split(); nt, nw = [norm(x) for x in toks], [norm(w.word) for w in ws]
    times = [None] * len(toks)
    sm = difflib.SequenceMatcher(None, nt, nw, autojunk=False); hit = 0
    ops = sm.get_opcodes(); cut = None
    if ops and ops[-1][0] == 'insert' and ops[-1][1] == len(nt) and ops[-1][3] > 0: cut = ws[ops[-1][3] - 1].end + 0.12   # trailing noise read as words
    for tag, i1, i2, j1, j2 in ops:
        if tag == 'equal':
            for k in range(i2 - i1): times[i1 + k] = (ws[j1 + k].start, ws[j1 + k].end); hit += 1
        elif tag == 'replace':   # e.g. "AT&T" heard as "ei ti and ti": spread the tokens over those words
            s0, s1 = ws[j1].start, ws[j2 - 1].end
            for k in range(i1, i2): times[k] = (s0 + (s1 - s0) * (k - i1) / (i2 - i1), s0 + (s1 - s0) * (k - i1 + 1) / (i2 - i1))
    # tokens Whisper skipped: share the gap between their known neighbours
    k = 0
    while k < len(times):
        if times[k] is None:
            j = k
            while j < len(times) and times[j] is None: j += 1
            a = times[k - 1][1] if k > 0 else 0.0
            b = times[j][0] if j < len(times) else (ws[-1].end if ws else len(a16) / 16000)
            for m in range(k, j): times[m] = (a + (b - a) * (m - k) / (j - k), a + (b - a) * (m - k + 1) / (j - k))
            k = j
        else: k += 1
    return times, hit / max(1, len(toks)), ' '.join(w.word.strip() for w in ws), cut


timeline, chunks, t, report = [], [], 0.0, []
style0 = script.get('style', '')
for si, sc in enumerate(script['scenes']):
    if FETCH and ONLY and sc['id'] not in ONLY: continue
    gaps, styles = sc.get('gaps', {}), sc.get('styles', {})
    lt, lines = sc['lead'], []
    for li, text in enumerate(sc['lines']):
        cue = styles.get(str(li), style0)
        spoken = (cue + ' ' if cue else '') + say(text)
        h = hashlib.sha1((spoken + VOICE + MODEL + str(SPEED)).encode()).hexdigest()[:10]
        takes = [os.path.join(OUT, 'voice', f's{si:02d}_l{li}.mp3')] if DRY else [os.path.join(VD, f's{si:02d}_l{li}_{h}_t{k}.mp3') for k in range(TAKES)]
        for k, f in enumerate(takes):
            if not DRY and not os.path.exists(f): tts(spoken, f); print(f'  fetched s{si:02d}_l{li} take {k}', flush=True)
        if FETCH: continue
        # the take Whisper understands best on its own wins; then the script is aligned onto it
        best = None
        for src in takes:
            ck = hashlib.sha1((src + text + str(os.path.getmtime(src))).encode()).hexdigest()
            if ck in CACHE and len(CACHE[ck]) == 3: sc_, heard, ccut = CACHE[ck]
            else:
                sc_, heard, ccut = check(decode(src, 16000), text) if len(takes) > 1 else (1.0, '', None)
                CACHE[ck] = [sc_, heard, ccut]
            if best is None or sc_ > best[1]: best = (src, sc_, heard, ccut)
        src, score, heard, ccut = best
        ak = hashlib.sha1(('align' + src + text + str(os.path.getmtime(src))).encode()).hexdigest()
        if ak in CACHE: times, aligned, cut = CACHE[ak]
        else:
            times, _, aligned, cut = align(decode(src, 16000), text); CACHE[ak] = [times, aligned, cut]
        json.dump(CACHE, open(CACHE_F, 'w'))
        cut = cut or ccut
        heard = heard or aligned
        report.append((sc['id'], li, score, heard))
        a = decode(src, SR)
        if cut and cut * SR < len(a): a = a[: int(cut * SR)]; a[-int(0.06 * SR):] *= np.linspace(1, 0, int(0.06 * SR))
        nz = np.nonzero(np.abs(a) > 0.008)[0]
        s0 = max(nz[0] - int(0.03 * SR), 0); a = a[s0: nz[-1] + int(0.15 * SR)]
        a[: int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR)); a[-int(0.03 * SR):] *= np.linspace(1, 0, int(0.03 * SR))
        d = len(a) / SR; off = lt - s0 / SR
        lines.append({'t0': round(lt, 3), 't1': round(lt + d, 3), 'text': text,
                      'words': [{'w': w, 't0': round(off + a_, 3), 't1': round(off + b_, 3)} for w, (a_, b_) in zip(text.split(), times)]})
        chunks.append((t + lt, a))
        lt += d + gaps.get(str(li), GAP)
    last_gap = gaps.get(str(len(sc['lines']) - 1))
    dur = (lt if last_gap else lt - GAP) + sc['tail']
    timeline.append({'id': sc['id'], 'start': round(t, 3), 'dur': round(dur, 3), 'lines': lines})
    t += dur

if FETCH: print('takes in', VD); raise SystemExit
buf = np.zeros(int(t * SR) + SR, dtype=np.float32)
for st, a in chunks:
    i = int(st * SR); buf[i:i + len(a)] += a
with wave.open(os.path.join(OUT, 'narration.wav'), 'w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(buf, -1, 1) * 32767).astype(np.int16).tobytes())
json.dump({'total': round(t, 3), 'scenes': timeline}, open(os.path.join(OUT, 'timeline.json'), 'w'), indent=1, ensure_ascii=False)
for sid, li, score, heard in report:
    flag = '' if score >= 0.8 else '   <-- check'
    print(f'{sid:9s} L{li} {score:4.0%} | {heard}{flag}')
for s in timeline: print(f"{s['id']:10s} start {s['start']:7.2f} dur {s['dur']:6.2f}")
print('total', round(t, 2))
