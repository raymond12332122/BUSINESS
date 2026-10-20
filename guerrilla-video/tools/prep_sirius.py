#!/usr/bin/env python3
"""Prepare the Sirius Symboli Sketchfab rip (MMD-style skeleton) for the procedural rig in src/lib/chars.js.

The rip's Japanese bone names arrive mangled to U+FFFD, so the joints are picked by node index (identified from the
hierarchy, rest positions and skin weights) and renamed to the Uma names chars.js looks for. It also drops the
untextured duplicate of the body mesh (it z-fights the textured one and reads as a white overlay) and makes the
materials matte. Only the JSON chunk changes.
usage: python3 tools/prep_sirius.py in.glb models/sirius_symboli.glb
"""
import json, struct, sys

RENAME = {
    11: 'Hip', 92: 'Waist', 94: 'Chest', 95: 'Neck', 96: 'Head',                      # 腰, 上半身, 上半身2, 首, 頭
    282: 'Shoulder_L', 284: 'Arm_L', 286: 'Elbow_L', 288: 'Wrist_L',                  # 左肩, 左腕, 左ひじ, 左手首
    314: 'Shoulder_R', 316: 'Arm_R', 318: 'Elbow_R', 320: 'Wrist_R',                  # 右肩, 右腕, 右ひじ, 右手首
    31: 'Thigh_L', 32: 'Knee_L', 33: 'Ankle_L', 14: 'Thigh_R', 15: 'Knee_R', 16: 'Ankle_R',   # 足, ひざ, 足首 (the skinned ones, not the D bones)
}
DUPLICATE_BODY = 527          # node holding the untextured copy of the body (mesh 6)

src, dst = sys.argv[1], sys.argv[2]
b = open(src, 'rb').read()
magic, ver, _ = struct.unpack('<III', b[:12])
jl, jt = struct.unpack('<II', b[12:20])
j = json.loads(b[20:20 + jl])
rest = b[20 + jl:]
nodes = j['nodes']
taken = set(RENAME.values())
for i, n in enumerate(nodes):
    name = n.get('name', '')
    # leftover Uma IK helpers (Ankle_L_28, Ankle_L_IK_Handle_29...) would shadow the renamed joints in prefix lookups
    if i not in RENAME and any(name == t or name.startswith(t + '_') for t in taken):
        n['name'] = 'X' + name
for i, new in RENAME.items():
    nodes[i]['name'] = new
for n in nodes:
    if DUPLICATE_BODY in n.get('children', []):
        n['children'].remove(DUPLICATE_BODY)
# eyes and face get the names chars.js treats as face (unlit, no ink outline); the untextured brow strokes and teeth
# would render white, so they get their colours
NAMES = {1: 'Sirius_Lash', 3: 'Sirius_Eyes', 4: 'Sirius_face', 5: 'Sirius_Teeth'}
COLOURS = {1: [0.13, 0.08, 0.08, 1.0], 5: [0.95, 0.92, 0.88, 1.0]}
for i, m in enumerate(j.get('materials', [])):
    m.pop('extensions', None)
    pbr = m.setdefault('pbrMetallicRoughness', {})
    pbr['metallicFactor'] = 0.0
    pbr['roughnessFactor'] = 0.85
    if i in NAMES: m['name'] = NAMES[i]
    if i in COLOURS: pbr['baseColorFactor'] = COLOURS[i]
for k in ('extensionsUsed', 'extensionsRequired'):
    if k in j:
        j[k] = [e for e in j[k] if e != 'KHR_materials_specular']
        if not j[k]:
            del j[k]
js = json.dumps(j, separators=(',', ':')).encode()
js += b' ' * ((4 - len(js) % 4) % 4)
out = struct.pack('<III', magic, ver, 12 + 8 + len(js) + len(rest)) + struct.pack('<II', len(js), jt) + js + rest
open(dst, 'wb').write(out)
print(f'{dst}: {len(RENAME)} joints renamed, duplicate body dropped')
