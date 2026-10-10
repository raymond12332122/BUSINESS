"""Build src/mx/mexico.json: simplified Mexican states, US border states and neighbours.

Usage: python3 tools/mx_mapdata.py path/to/ne_10m_admin_1_states_provinces.geojson
Sources: Natural Earth (public domain) admin-1 states; world-atlas countries-50m for neighbours.
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOX = (-121.0, 12.6, -84.0, 37.5)  # lon0, lat0, lon1, lat1
TOL = 0.018                          # simplification tolerance (degrees)
US_STATES = {'California', 'Arizona', 'New Mexico', 'Texas', 'Nevada', 'Utah', 'Colorado', 'Oklahoma', 'Louisiana', 'Arkansas', 'Kansas', 'Mississippi'}
NEIGHBOURS = {'Guatemala', 'Belize', 'Honduras', 'El Salvador', 'Cuba', 'Nicaragua'}


def clip(ring):
    """Sutherland-Hodgman clip of a lon/lat ring to BOX."""
    lo0, la0, lo1, la1 = BOX
    edges = [(lambda p: p[0] >= lo0, 0, lo0), (lambda p: p[0] <= lo1, 0, lo1), (lambda p: p[1] >= la0, 1, la0), (lambda p: p[1] <= la1, 1, la1)]
    out = ring
    for inside, ax, v in edges:
        inp, out = out, []
        if not inp: return []
        for i, cur in enumerate(inp):
            prev = inp[i - 1]
            def cut(a, b):
                k = (v - a[ax]) / (b[ax] - a[ax]); return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]
            if inside(cur):
                if not inside(prev): out.append(cut(prev, cur))
                out.append(cur)
            elif inside(prev): out.append(cut(prev, cur))
    return out


def dp(pts, tol):
    """Douglas-Peucker simplification (iterative)."""
    if len(pts) < 4: return pts
    keep = [False] * len(pts); keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        (x1, y1), (x2, y2) = pts[a], pts[b]
        dx, dy = x2 - x1, y2 - y1; L = (dx * dx + dy * dy) ** 0.5 or 1e-12
        best, bi = -1, -1
        for i in range(a + 1, b):
            x, y = pts[i]
            d = abs(dy * x - dx * y + x2 * y1 - y2 * x1) / L
            if d > best: best, bi = d, i
        if best > tol: keep[bi] = True; stack += [(a, bi), (bi, b)]
    return [p for p, k in zip(pts, keep) if k]


def area(r): return abs(sum(r[i][0] * r[i - 1][1] - r[i - 1][0] * r[i][1] for i in range(len(r)))) / 2


def prep_poly(poly, min_area=0.004):
    rings = []
    for k, ring in enumerate(poly):
        r = clip(ring)
        if len(r) < 3:
            if k == 0: return None
            continue
        # closed ring: split at the point farthest from the start so DP has a real baseline
        far = max(range(len(r)), key=lambda i: (r[i][0] - r[0][0]) ** 2 + (r[i][1] - r[0][1]) ** 2)
        r = dp(r[:far + 1], TOL)[:-1] + dp(r[far:] + [r[0]], TOL)[:-1]
        if len(r) < 3 or area(r) < (min_area if k == 0 else 0.002):
            if k == 0: return None
            continue
        rings.append([[round(x, 3), round(y, 3)] for x, y in r])
    return rings or None


def polys_of(geom):
    if geom['type'] == 'Polygon': return [geom['coordinates']]
    if geom['type'] == 'MultiPolygon': return geom['coordinates']
    return []


def decode_topo(topo, obj):
    sx, sy = topo['transform']['scale']; tx, ty = topo['transform']['translate']
    arcs = []
    for a in topo['arcs']:
        x = y = 0; pts = []
        for dx, dy in a: x += dx; y += dy; pts.append([x * sx + tx, y * sy + ty])
        arcs.append(pts)
    def arc(i): return arcs[i] if i >= 0 else arcs[~i][::-1]
    def ring(r):
        out = []
        for k, i in enumerate(r): out += arc(i) if k == 0 else arc(i)[1:]
        return out
    for g in topo['objects'][obj]['geometries']:
        if g['type'] == 'Polygon': polys = [[ring(r) for r in g['arcs']]]
        elif g['type'] == 'MultiPolygon': polys = [[ring(r) for r in p] for p in g['arcs']]
        else: polys = []
        yield g['properties']['name'], polys


regions = []
adm = json.load(open(sys.argv[1]))
for f in adm['features']:
    p = f['properties']; a3 = p.get('adm0_a3')
    if a3 == 'MEX' or (a3 == 'USA' and p['name'] in US_STATES):
        polys = [q for q in (prep_poly(poly) for poly in polys_of(f['geometry'])) if q]
        if not polys: continue
        name = p['name'] or 'Islas'
        if name == 'Distrito Federal': name = 'Ciudad de México'
        regions.append({'id': p.get('iso_3166_2') or name, 'name': name, 'country': a3, 'label': [round(p['longitude'], 2), round(p['latitude'], 2)], 'polys': polys})
topo = json.load(open(os.path.join(ROOT, 'node_modules', 'world-atlas', 'countries-50m.json')))
for name, polys in decode_topo(topo, 'countries'):
    if name not in NEIGHBOURS: continue
    ps = [q for q in (prep_poly(poly) for poly in polys) if q]
    if ps: regions.append({'id': name, 'name': name, 'country': name, 'label': None, 'polys': ps})

# ---- classify boundary segments: coast / international border / state line
from collections import defaultdict
CELL = 0.1
grid = defaultdict(list)
for ri, r in enumerate(regions):
    for poly in r['polys']:
        for ring in poly:
            for k in range(len(ring)):
                a, b = ring[k], ring[(k + 1) % len(ring)]
                for t in (0, 0.5):
                    x, y = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
                    grid[(int(x // CELL), int(y // CELL))].append((ri, a, b))


def seg_dist(p, a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]; L2 = dx * dx + dy * dy or 1e-12
    t = max(0, min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2))
    return ((p[0] - a[0] - t * dx) ** 2 + (p[1] - a[1] - t * dy) ** 2) ** 0.5


def neighbour(ri, p):
    best = None
    cx, cy = int(p[0] // CELL), int(p[1] // CELL)
    for i in (-1, 0, 1):
        for j in (-1, 0, 1):
            for rj, a, b in grid[(cx + i, cy + j)]:
                if rj == ri: continue
                d = seg_dist(p, a, b)
                if d < 0.05 and (best is None or d < best[0]): best = (d, rj)
    return best[1] if best else None


lines = {'coast': [], 'intl': [], 'state': []}
for ri, r in enumerate(regions):
    if r['country'] not in ('MEX', 'USA') and r['country'] not in NEIGHBOURS: continue
    for poly in r['polys']:
        for ring in poly:
            cur, kind_cur = [], None
            n = len(ring)
            for k in range(n + 1):
                a, b = ring[k % n], ring[(k + 1) % n]
                mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
                rj = neighbour(ri, mid)
                lo0, la0, lo1, la1 = BOX
                on_box = (abs(a[0] - b[0]) < 1e-6 and (abs(a[0] - lo0) < 1e-3 or abs(a[0] - lo1) < 1e-3)) or (abs(a[1] - b[1]) < 1e-6 and (abs(a[1] - la0) < 1e-3 or abs(a[1] - la1) < 1e-3))
                if on_box: kind = None
                elif rj is None: kind = 'coast'
                elif regions[rj]['country'] != r['country']: kind = 'intl' if ri < rj else None
                else: kind = 'state' if ri < rj else None
                if kind != kind_cur:
                    if kind_cur and len(cur) > 1: lines[kind_cur].append(cur)
                    cur = [a] if kind else []
                    kind_cur = kind
                if kind: cur.append(b)
            if kind_cur and len(cur) > 1: lines[kind_cur].append(cur)
print({k: len(v) for k, v in lines.items()})

os.makedirs(os.path.join(ROOT, 'src', 'mx'), exist_ok=True)
out = os.path.join(ROOT, 'src', 'mx', 'mexico.json')
json.dump({'box': BOX, 'source': 'Natural Earth 1:10m admin-1 + world-atlas 1:50m (public domain)', 'regions': regions, 'lines': lines}, open(out, 'w'), separators=(',', ':'), ensure_ascii=False)
print(len(regions), 'regions;', os.path.getsize(out) // 1024, 'KB;', sum(len(r) for g in regions for p in g['polys'] for r in p), 'points')
