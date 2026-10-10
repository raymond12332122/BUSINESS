"""Transcribe audio files with Whisper (to catch TTS glitches). Usage: python3 tools/asr_check.py file1 [file2 ...]"""
import subprocess, sys
import numpy as np
from faster_whisper import WhisperModel

m = WhisperModel(__import__('os').environ.get('ASR_MODEL', 'medium'), device='cpu', compute_type='int8')
for f in sys.argv[1:]:
    pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', f, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout
    audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
    segs, _ = m.transcribe(audio, language='es', beam_size=5)
    print(f.rsplit('/', 1)[-1], '|', ' '.join(s.text.strip() for s in segs), flush=True)
