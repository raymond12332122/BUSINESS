#!/usr/bin/env python3
"""Rewrite GLB materials so three.js (r169) can shade them like the chibi models.

- KHR_materials_pbrSpecularGlossiness (dropped by three.js) -> metallic-roughness using the diffuse texture/factor.
- KHR_materials_unlit -> lit (unlit characters would glow in night/dusk scenes).
Only the JSON chunk changes; the binary chunk is copied as is.
usage: python3 tools/fix_glb_materials.py models/a.glb [models/b.glb ...]
"""
import json, struct, sys

DROP = {'KHR_materials_pbrSpecularGlossiness', 'KHR_materials_unlit'}


def fix(path):
    b = open(path, 'rb').read()
    magic, ver, _ = struct.unpack('<III', b[:12])
    assert magic == 0x46546C67, 'not a GLB'
    jl, jt = struct.unpack('<II', b[12:20])
    j = json.loads(b[20:20 + jl])
    rest = b[20 + jl:]
    n = 0
    for m in j.get('materials', []):
        ext = m.get('extensions', {})
        sg = ext.pop('KHR_materials_pbrSpecularGlossiness', None)
        unlit = ext.pop('KHR_materials_unlit', None)
        if sg is None and unlit is None:
            continue
        pbr = m.setdefault('pbrMetallicRoughness', {})
        if sg is not None:
            if 'diffuseTexture' in sg:
                pbr['baseColorTexture'] = sg['diffuseTexture']
            if 'diffuseFactor' in sg:
                pbr['baseColorFactor'] = sg['diffuseFactor']
        pbr['metallicFactor'] = 0.0
        pbr['roughnessFactor'] = 0.85
        if not ext:
            m.pop('extensions', None)
        n += 1
    for k in ('extensionsUsed', 'extensionsRequired'):
        if k in j:
            j[k] = [e for e in j[k] if e not in DROP]
            if not j[k]:
                del j[k]
    js = json.dumps(j, separators=(',', ':')).encode()
    js += b' ' * ((4 - len(js) % 4) % 4)
    out = struct.pack('<III', magic, ver, 12 + 8 + len(js) + len(rest)) + struct.pack('<II', len(js), jt) + js + rest
    open(path, 'wb').write(out)
    print(f'{path}: {n} materials converted')


for p in sys.argv[1:]:
    fix(p)
