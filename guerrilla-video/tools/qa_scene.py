"""Contact sheets of rendered frames for one scene: python3 tools/qa_scene.py <scene> [step_s=2] -> scratchpad/qa_<scene>_N.jpg"""
import json, os, subprocess, sys
V = os.environ.get('VIDEO', 'mx')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sid, step = sys.argv[1], float(sys.argv[2]) if len(sys.argv) > 2 else 2.0
TL = json.load(open(os.path.join(ROOT, f'build/{V}/es/timeline.json')))
sc = next(s for s in TL['scenes'] if s['id'] == sid)
fr = [int((sc['start'] + t) * 30) for t in [x * step + 0.5 for x in range(int(sc['dur'] / step) + 1)] if t < sc['dur']]
files = [os.path.join(ROOT, f'build/{V}/es/frames/f_{f:05d}.jpg') for f in fr]
files = [f for f in files if os.path.exists(f)]
SP = '/tmp/claude-0/-home-user-BUSINESS/a6bf4c70-7473-5252-8e29-d6699e26ac1b/scratchpad'
for k in range(0, len(files), 12):
    out = f'{SP}/qa_{sid}_{k // 12}.jpg'
    subprocess.run(['python3', os.path.join(ROOT, 'tools/sheet.py'), out, *files[k:k + 12]], env={**os.environ, 'SMALL': '1'}, check=True)
    print(out)
