"""Build src/napo/americas.json: the Atlantic world around 1810 (Spanish America, Brazil, the US, Iberia...).

Usage: python3 tools/napo_amapdata.py admin1.geojson
Sources: world-atlas countries-50m (Natural Earth, public domain) and Natural Earth admin-1 for the US states
that belonged to New Spain or Spanish Florida in 1810.
"""
import json, os, sys
from collections import defaultdict
from shapely.geometry import shape, mapping, Polygon, MultiPolygon, box as sbox
from shapely.ops import unary_union
from shapely.validation import make_valid

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOX = (-128.0, -57.0, 12.0, 52.0)
SPANISH = {'Mexico', 'Guatemala', 'Belize', 'Honduras', 'El Salvador', 'Nicaragua', 'Costa Rica', 'Panama', 'Cuba', 'Puerto Rico', 'Dominican Rep.',
           'Colombia', 'Venezuela', 'Ecuador', 'Peru', 'Bolivia', 'Chile', 'Argentina', 'Paraguay', 'Uruguay', 'Falkland Is.'}
OWNER = {'Brazil': 'POR_COL', 'Spain': 'ESP', 'Portugal': 'POR', 'France': 'FRA', 'United Kingdom': 'GBR', 'Ireland': 'GBR', 'Canada': 'GBR_COL',
         'Haiti': 'HAI', 'Guyana': 'GBR_COL', 'Suriname': 'NED_COL', 'Jamaica': 'GBR_COL', 'Bahamas': 'GBR_COL', 'Morocco': 'OTH', 'Belize': 'ESP_COL'}
NEW_SPAIN_US = {'California', 'Nevada', 'Utah', 'Arizona', 'New Mexico', 'Texas', 'Florida'}


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
        geoms = []
        for p in polys:
            if p and len(p[0]) >= 4:
                # skip polygons crossing the antimeridian (Russia/Fiji) - none of them are in the box anyway
                if max(x for x, _ in p[0]) - min(x for x, _ in p[0]) > 300: continue
                geoms.append(Polygon(p[0], [h for h in p[1:] if len(h) >= 4]))
        if geoms: yield g['properties']['name'], polyonly(make_valid(MultiPolygon(geoms) if len(geoms) > 1 else geoms[0]))


bbox = sbox(*BOX)
parts = defaultdict(list)
topo = json.load(open(os.path.join(ROOT, 'node_modules', 'world-atlas', 'countries-50m.json')))
for name, g in decode(topo, 'countries'):
    if not g.intersects(bbox): continue
    g = polyonly(g.intersection(bbox))
    if g.is_empty: continue
    if name == 'United States of America': continue  # handled per state below
    owner = 'ESP_COL' if name in SPANISH else OWNER.get(name, 'OTH')
    parts[owner].append(g)
for f in json.load(open(sys.argv[1]))['features']:
    p = f['properties']
    if p.get('adm0_a3') != 'USA' or not f['geometry']: continue
    g = polyonly(make_valid(shape(f['geometry'])))
    if not g.intersects(bbox): continue
    g = polyonly(g.intersection(bbox))
    parts['ESP_COL' if p.get('name') in NEW_SPAIN_US else 'USA'].append(g)

groups = []
for owner, gs in parts.items():
    u = polyonly(make_valid(unary_union([make_valid(q).buffer(0.01) for q in gs]))).buffer(-0.01).simplify(0.06, preserve_topology=True)
    polys = list(u.geoms) if isinstance(u, MultiPolygon) else [u]
    out = []
    for q in polys:
        if q.area < 0.15: continue
        out.append([[[round(x, 2), round(y, 2)] for x, y in list(q.exterior.coords)[:-1]]] +
                   [[[round(x, 2), round(y, 2)] for x, y in list(h.coords)[:-1]] for h in q.interiors if Polygon(h).area > 0.3])
    groups.append({'owner': owner, 'polys': out})
dst = os.path.join(ROOT, 'src', 'napo', 'americas.json')
json.dump({'box': BOX, 'source': 'Natural Earth / world-atlas 1:50m (public domain); 1810 owners approximated', 'groups': groups}, open(dst, 'w'), separators=(',', ':'))
print({g['owner']: len(g['polys']) for g in groups}, os.path.getsize(dst) // 1024, 'KB')
