"""Build src/rusia/russia.json: Eurasia from Germany to the Pacific with the units needed to draw the Russian Empire
(1914), the Brest-Litovsk losses (1918) and the USSR (1922).

Usage: python3 -I tools/rusia_mapdata.py admin1_bbox.json admin1_chukotka_w.json lakes50.geojson rivers50.geojson land_a.json land_b.json
Sources: Natural Earth 1:10m admin-1 provinces and 1:50m lakes / rivers (public domain).

Historical borders are approximated with unions of modern provinces ("groups"), e.g. Congress Poland =
Masovian + Łódź + Lublin + Świętokrzyskie + Podlachian. Groups are simplified as one coverage, so neighbours stay
seamless, and every shared edge is stored with the two groups on either side: the browser draws a border only
where the two sides belong to different states in the period being shown.
"""
import json, os, sys
from collections import defaultdict
import shapely
from shapely.geometry import shape, Polygon, MultiPolygon, LineString, MultiLineString, box as sbox
from shapely.ops import unary_union, linemerge, polylabel
from shapely.validation import make_valid

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A1, CHUK, LAKES, RIVERS, LAND_A, LAND_B = sys.argv[1:7]
TOL = 0.03
BOX = sbox(-12, 25, 192, 82)

G = {  # group id -> list of (adm0, set of admin-1 names or None for the whole country)
    'kal': [('RUS', {'Kaliningrad'})],
    'cpol': [('POL', {'Masovian', 'Łódź', 'Lublin', 'Świętokrzyskie', 'Podlachian'})],
    'ppol': [('POL', {'West Pomeranian', 'Lubusz', 'Lower Silesian', 'Opole', 'Silesian', 'Warmian-Masurian', 'Pomeranian', 'Greater Poland', 'Kuyavian-Pomeranian'})],
    'apol': [('POL', {'Lesser Poland', 'Subcarpathian'})],
    'blr_w': [('BLR', {'Brest', 'Grodno'})],
    'blr_e': [('BLR', {'Gomel', 'Vitebsk', 'Mogilev', 'Minsk', 'City of Minsk'})],
    'ukr_v': [('UKR', {'Volyn', 'Rivne'})],
    'gal': [('UKR', {"L'viv", "Ternopil'", "Ivano-Frankivs'k"})],
    'buk': [('UKR', {'Chernivtsi'})],
    'tcp': [('UKR', {'Transcarpathia'})],
    'kars': [('TUR', {'Kars', 'Ardahan', 'Artvin', 'Iğdir'})],
    'casia': [('KAZ', None), ('UZB', None), ('TKM', None), ('KGZ', None), ('TJK', None)],
}
LEFT_BANK = {'Stîngă Nistrului', 'Transnistria', 'Camenca', 'Grigoriopol'}


def group_of(a0, name):
    for gid, rules in G.items():
        for c, names in rules:
            if c == a0 and (names is None or name in names): return gid
    if a0 == 'RUS': return 'rus'
    if a0 == 'UKR': return 'ukr_e'
    if a0 == 'MDA': return 'ukr_e' if name in LEFT_BANK else 'mda'
    if a0 in ('FIN', 'EST', 'LVA', 'LTU', 'GEO', 'ARM', 'AZE'): return a0.lower()
    return a0.lower()


def shift_east(geom):  # Chukotka beyond 180°E comes in negative longitudes
    return shapely.transform(geom, lambda c: c + [[360.0, 0.0]])


parts = defaultdict(list)
for f in json.load(open(A1))['features']:
    p = f['properties']; g = make_valid(shape(f['geometry']))
    parts[group_of(p['adm0_a3'], p['name'])].append(g)
for f in json.load(open(CHUK))['features']:
    parts['rus'].append(shift_east(make_valid(shape(f['geometry']))))

ids = sorted(parts)
geoms = []
for gid in ids:
    u = unary_union(parts[gid]).intersection(BOX)
    u = make_valid(u.buffer(0))
    geoms.append(u)
print('groups', len(ids))
simp = shapely.coverage_simplify(geoms, TOL)


def polys_of(g, min_area):
    out = []
    for poly in (g.geoms if hasattr(g, 'geoms') else [g]):
        if not isinstance(poly, Polygon) or poly.area < min_area: continue
        rings = [list(poly.exterior.coords)] + [list(r.coords) for r in poly.interiors if Polygon(r).area > min_area * 2]
        out.append([[[round(x, 3), round(y, 3)] for x, y in r] for r in rings])
    return out


R = {'rus', 'fin', 'est', 'lva', 'ltu', 'cpol', 'blr_w', 'blr_e', 'ukr_v', 'ukr_e', 'mda', 'geo', 'arm', 'aze', 'kars', 'casia'}
groups, kept = [], {}
for gid, g in zip(ids, simp):
    if g.is_empty: continue
    pol = polys_of(g, 0.04 if gid in R else 0.08)
    if not pol: continue
    big = max((Polygon(p[0]) for p in pol), key=lambda q: q.area)
    lab = polylabel(big, 0.05)
    groups.append({'id': gid, 'polys': pol, 'lab': [round(lab.x, 2), round(lab.y, 2)], 'area': round(sum(Polygon(p[0]).area for p in pol), 2)})
    mv = make_valid(MultiPolygon([Polygon(p[0], p[1:]) for p in pol]))
    kept[gid] = unary_union([q for q in getattr(mv, 'geoms', [mv]) if isinstance(q, (Polygon, MultiPolygon))])

# shared edges between neighbouring groups (and coasts)
arcs = []
gl = list(kept.items())
tree = shapely.STRtree([g for _, g in gl])
shared = defaultdict(list)
for i, (ga, a) in enumerate(gl):
    for j in tree.query(a):
        if j <= i: continue
        gb, b = gl[j]
        ln = a.boundary.intersection(b.boundary)
        if ln.is_empty: continue
        segs = [s for s in (ln.geoms if hasattr(ln, 'geoms') else [ln]) if isinstance(s, LineString)]
        if not segs: continue
        m = linemerge(MultiLineString(segs)) if len(segs) > 1 else segs[0]
        for s in (m.geoms if hasattr(m, 'geoms') else [m]):
            if s.length < 0.05: continue
            arcs.append({'a': ga, 'b': gb, 'line': [[round(x, 3), round(y, 3)] for x, y in s.coords]})
            shared[ga].append(s); shared[gb].append(s)
for gid, g in kept.items():   # coasts: boundary minus every edge shared with a neighbour
    coast = g.boundary
    if shared[gid]: coast = coast.difference(unary_union(shared[gid]).buffer(1e-6))
    if coast.is_empty: continue
    segs = [q for q in getattr(coast, 'geoms', [coast]) if isinstance(q, LineString)]
    m = linemerge(MultiLineString(segs)) if len(segs) > 1 else (segs[0] if segs else None)
    for q in (getattr(m, 'geoms', [m]) if m is not None else []):
        if q.length < 0.1: continue
        arcs.append({'a': gid, 'b': None, 'line': [[round(x, 3), round(y, 3)] for x, y in q.coords]})
print('arcs', len(arcs))

lakes = []
for f in json.load(open(LAKES))['features']:
    g = make_valid(shape(f['geometry']))
    c = g.centroid
    if not (20 < c.x < 140 and 38 < c.y < 72) or g.area < 0.3: continue
    lakes.append({'name': f['properties'].get('name') or '', 'polys': polys_of(g.simplify(0.02), 0.05)})
WANT = {'Volga', 'Don', 'Dnieper', 'Dnepr', 'Neva', 'Ob', 'Irtysh', 'Yenisey', 'Lena', 'Amur', 'Ural', 'Vistula', 'Kama', 'Dvina', 'Northern Dvina', 'Western Dvina', 'Dniester', 'Angara'}
rivers = []
for f in json.load(open(RIVERS))['features']:
    n = f['properties'].get('name') or ''
    if n not in WANT: continue
    g = shape(f['geometry']).simplify(0.03)
    for s in (g.geoms if hasattr(g, 'geoms') else [g]):
        if s.length > 0.5: rivers.append({'name': n, 'line': [[round(x, 3), round(y, 3)] for x, y in s.coords]})
print('lakes', len(lakes), 'rivers', len(rivers))

# background land beyond the province data (lower detail), so the map never ends in a straight cut
lg = [make_valid(shape(f['geometry'])) for f in json.load(open(LAND_A))['features']]
lg += [shift_east(make_valid(shape(f['geometry']))) for f in json.load(open(LAND_B))['features']]
land = unary_union(lg).simplify(0.06)
land_polys = polys_of(land, 0.3)
print('land polys', len(land_polys))
out = {'source': 'Natural Earth 1:10m admin-1 / 1:50m lakes & rivers (public domain); historical borders approximated',
       'groups': groups, 'arcs': arcs, 'land': land_polys, 'lakes': lakes, 'rivers': rivers}
p = os.path.join(ROOT, 'src', 'rusia', 'russia.json')
json.dump(out, open(p, 'w'), separators=(',', ':'), ensure_ascii=False)
print('wrote', p, os.path.getsize(p) // 1024, 'KB')
