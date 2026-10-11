"""Build src/narco/americas.json: present-day countries from Colombia to the United States (for drug routes).

Usage: python3 tools/narco_amapdata.py
Source: world-atlas countries-50m (Natural Earth, public domain).
"""
import json, os, sys
from shapely.geometry import Polygon, MultiPolygon, box as sbox
from shapely.ops import unary_union
from shapely.validation import make_valid
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOX = (-128.0, -8.0, -55.0, 50.0)
KEEP = {'United States of America': 'USA', 'Mexico': 'MEX', 'Guatemala': 'GTM', 'Belize': 'BLZ', 'Honduras': 'HND', 'El Salvador': 'SLV', 'Nicaragua': 'NIC',
        'Costa Rica': 'CRI', 'Panama': 'PAN', 'Colombia': 'COL', 'Venezuela': 'VEN', 'Ecuador': 'ECU', 'Peru': 'PER', 'Cuba': 'CUB', 'Jamaica': 'JAM',
        'Haiti': 'HTI', 'Dominican Rep.': 'DOM', 'Bahamas': 'BHS', 'Canada': 'CAN', 'Brazil': 'BRA', 'Guyana': 'GUY', 'Suriname': 'SUR', 'Puerto Rico': 'PRI'}


def polyonly(g):
    if isinstance(g, (Polygon, MultiPolygon)): return g
    ps = [q for q in getattr(g, 'geoms', []) if isinstance(q, (Polygon, MultiPolygon))]
    return unary_union(ps) if ps else Polygon()


def decode(topo, obj):
    sx, sy = topo['transform']['scale']; tx, ty = topo['transform']['translate']
    arcs = []
    for a in topo['arcs']:
        x = y = 0; pts = []
        for dx, dy in a: x += dx; y += dy; pts.append((x * sx + tx, y * sy + ty))
        arcs.append(pts)
    arc = lambda i: arcs[i] if i >= 0 else arcs[~i][::-1]
    def ring(r):
        out = []
        for k, i in enumerate(r): out += arc(i) if k == 0 else arc(i)[1:]
        return out
    for g in topo['objects'][obj]['geometries']:
        if g['type'] == 'Polygon': polys = [[ring(r) for r in g['arcs']]]
        elif g['type'] == 'MultiPolygon': polys = [[ring(r) for r in p] for p in g['arcs']]
        else: continue
        geoms = [Polygon(p[0], [h for h in p[1:] if len(h) >= 4]) for p in polys if p and len(p[0]) >= 4 and max(x for x, _ in p[0]) - min(x for x, _ in p[0]) < 300]
        if geoms: yield g['properties']['name'], polyonly(make_valid(MultiPolygon(geoms) if len(geoms) > 1 else geoms[0]))


bbox = sbox(*BOX)
groups = []
topo = json.load(open(os.path.join(ROOT, 'node_modules', 'world-atlas', 'countries-50m.json')))
for name, g in decode(topo, 'countries'):
    if not g.intersects(bbox): continue
    g = polyonly(g.intersection(bbox))
    if g.is_empty: continue
    code = KEEP.get(name, 'OTH')
    u = polyonly(make_valid(g)).simplify(0.04, preserve_topology=True)
    polys = list(u.geoms) if isinstance(u, MultiPolygon) else [u]
    out = []
    for q in polys:
        if q.area < 0.05: continue
        out.append([[[round(x, 2), round(y, 2)] for x, y in list(q.exterior.coords)[:-1]]] + [[[round(x, 2), round(y, 2)] for x, y in list(h.coords)[:-1]] for h in q.interiors if Polygon(h).area > 0.3])
    if out: groups.append({'code': code, 'name': name, 'polys': out})
dst = os.path.join(ROOT, 'src', 'narco', 'americas.json')
json.dump({'box': BOX, 'source': 'Natural Earth / world-atlas 1:50m (public domain)', 'groups': groups}, open(dst, 'w'), separators=(',', ':'))
print([g['code'] for g in groups], os.path.getsize(dst) // 1024, 'KB')
