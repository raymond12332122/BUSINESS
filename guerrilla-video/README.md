# How Guerrilla Warfare Works — chibi explainer video

A ~3:20 narrated explainer rendered entirely from code with the eight chibi `.glb` models in `models/`.
Final video: `output/how-guerrilla-warfare-works.mp4` (1920×1080, 30 fps).

## Chapters
1. Title — what guerrilla warfare is
2. The imbalance — big army vs. a handful of fighters
3. Rule 1: Hit and run — convoy ambush + Mao's "enemy advances, we retreat…"
4. Rule 2: Use the terrain — jungle hide-out and a Cu Chi tunnel cutaway (Vietnam)
5. Rule 3: The people — "fish in the sea", food / shelter / recruits / intel
6. Rule 4: Cut the supply lines — Hejaz Railway (WWI) and the partisan rail war (WWII)
7. Today — drones and anti-tank teams vs. columns near Kyiv (2022)
8. The occupier's dilemma — guard everything vs. lose the countryside
9. How guerrillas win — outlast the enemy (Kissinger's quote)
10. Recap

Cast: guerrillas = Oguri Cap, Tamamo Cross, Manhattan Cafe (green scarves); villagers = Meisho Doto (straw hats);
army = Mejiro McQueen, Daiwa Scarlet, Silence Suzuka, Daitaku Helios (slate vests).

## How it's made
- **three.js** scenes rendered frame-by-frame in headless Chromium (`tools/render.mjs`), captured to JPEG and encoded with ffmpeg.
- The models ship in T-pose with no animations, so `src/lib/chars.js` animates the skeleton procedurally
  (walk/run/crouch/aim/cheer/knocked-down…) with two-bone arm IK so hands grip the weapons, and switches
  facial expressions by offsetting the eye/mouth sprite-atlas textures (blinking, talking, shock, dizzy…).
- Narration: Piper TTS (`en_US-ryan-high`) via `tools/gen_voice.py`, which also writes the timeline every scene syncs to.
- Sound effects and music bed are synthesized with numpy (`tools/mix_audio.py`) from the event list each scene declares.

## Rebuild
```bash
npm install
pip install piper-tts numpy
# download en_US-ryan-high.onnx(+.json) from huggingface.co/rhasspy/piper-voices
python3 tools/gen_voice.py path/to/en_US-ryan-high.onnx      # narration + build/timeline.json
node tools/preview.mjs hitrun 5,10.5                          # preview frames of one scene
node tools/render.mjs 0 6032 build/frames                     # render all frames (split ranges across processes to parallelize)
node tools/events.mjs && python3 tools/mix_audio.py           # SFX/music mix -> build/mix.wav
ffmpeg -framerate 30 -i build/frames/f_%05d.jpg -i build/mix.wav -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest output/how-guerrilla-warfare-works.mp4
```
