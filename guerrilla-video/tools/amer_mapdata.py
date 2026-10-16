"""Build src/amer/americas.json: the Americas with the units needed to draw the colonial empires of 1775-1810 and the
new states of 1825-1830.

Usage: python3 -I tools/amer_mapdata.py admin1.geojson lakes10.geojson rivers10.geojson land50.geojson
Sources: Natural Earth 1:10m admin-1 provinces, lakes and rivers, 1:50m land (public domain).

Historical borders are approximated with unions of modern provinces ("groups") plus a few hand-drawn cuts (West Florida,
the Adams-Onis line of 1819 between the United States and Spain/Mexico, the Mississippi in Minnesota).
Every shared edge is stored with the two groups on either side, so the browser draws a border only where the two
sides belong to different states in the period shown (same scheme as tools/ww1_mapdata.py).
"""
import json, os, sys
from collections import defaultdict
import shapely
from shapely.geometry import shape, Polygon, MultiPolygon, LineString, MultiLineString, box as sbox
from shapely.ops import unary_union, linemerge, polylabel
from shapely.validation import make_valid

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A1, LAKES, RIVERS, LAND = sys.argv[1:5]
TOL = 0.03
BOX = sbox(-170, -57, -30, 72)

US13 = {'New Hampshire', 'Massachusetts', 'Maine', 'Rhode Island', 'Connecticut', 'Vermont', 'New York', 'New Jersey', 'Pennsylvania',
        'Delaware', 'Maryland', 'District of Columbia', 'Virginia', 'West Virginia', 'North Carolina', 'South Carolina', 'Georgia'}
G = {  # group id -> list of (adm0, set of admin-1 names or None for the whole country)
    'c13': [('USA', US13)],
    'usw': [('USA', {'Kentucky', 'Tennessee', 'Ohio', 'Indiana', 'Illinois', 'Michigan', 'Wisconsin', 'Alabama', 'Mississippi', 'Minnesota'})],
    'fla': [('USA', {'Florida'})],
    'lou': [('USA', {'Louisiana', 'Arkansas', 'Missouri', 'Iowa', 'North Dakota', 'South Dakota', 'Nebraska', 'Kansas', 'Oklahoma', 'Montana', 'Wyoming', 'Colorado'})],
    'mxn': [('USA', {'Texas', 'New Mexico', 'Arizona', 'California', 'Nevada', 'Utah'})],
    'ore': [('USA', {'Washington', 'Oregon', 'Idaho'})],
    'ak': [('USA', {'Alaska'})],
    'bna': [('CAN', {'Ontario', 'Québec', 'Nova Scotia', 'New Brunswick', 'Prince Edward Island', 'Newfoundland and Labrador', 'Manitoba', 'Saskatchewan',
                     'Alberta', 'Northwest Territories', 'Nunavut'})],
    'bcy': [('CAN', {'British Columbia', 'Yukon'})],
    'grl': [('GRL', None)], 'spm': [('SPM', None)],
    'mex': [('MEX', None)], 'chis': [('MEX', {'Chiapas'})],
    'gtm': [('GTM', None)], 'slv': [('SLV', None)], 'hnd': [('HND', None)], 'nic': [('NIC', None)], 'cri': [('CRI', None)], 'blz': [('BLZ', None)],
    'pan': [('PAN', None)], 'cub': [('CUB', None)], 'hti': [('HTI', None)], 'dom': [('DOM', None)], 'pri': [('PRI', None)], 'jam': [('JAM', None)],
    'bhs': [('BHS', None), ('TCA', None)], 'tto': [('TTO', None)], 'bmu': [('BMU', None)], 'cym': [('CYM', None)],
    'antb': [(c, None) for c in ('ATG', 'DMA', 'LCA', 'VCT', 'GRD', 'KNA', 'BRB', 'VGB', 'AIA', 'MSR')],
    'antf': [('FRA', {'Guadeloupe', 'Martinique'}), ('MAF', None), ('BLM', None)],
    'antn': [('ABW', None), ('CUW', None), ('SXM', None), ('NLD', {'Bonaire', 'Saba', 'St. Eustatius'})],
    'antd': [('VIR', None)],
    'col': [('COL', None)], 'ven': [('VEN', None)], 'ecu': [('ECU', None)], 'per': [('PER', None)], 'bol': [('BOL', None)],
    'chl': [('CHL', None)], 'tara': [('CHL', {'Tarapacá', 'Arica y Parinacota'})], 'ataca': [('CHL', {'Antofagasta'})],
    'arg': [('ARG', None)], 'pry': [('PRY', None)], 'ury': [('URY', None)], 'bra': [('BRA', None)],
    'guy': [('GUY', None)], 'sur': [('SUR', None)], 'guf': [('FRA', {'Guyane française'})], 'flk': [('FLK', None)],
}
# hand-drawn cuts: (group taken from, new group, polygon lon/lat)
CUTS = [
    ('usw', 'wfla', [(-91.7, 29.0), (-87.4, 29.0), (-87.4, 31.0), (-91.7, 31.0)]),            # West Florida (AL/MS south of 31N)
    ('lou', 'wfla', [(-91.65, 31.0), (-89.73, 31.0), (-89.6, 30.18), (-90.4, 30.05), (-91.2, 30.35)]),  # Florida parishes of Louisiana
    ('usw', 'lou', [(-97.5, 43.4), (-93.2, 43.4), (-93.2, 44.9), (-93.9, 45.4), (-94.5, 46.4), (-95.2, 47.3), (-95.2, 49.5), (-97.5, 49.5)]),  # Minnesota west of the Mississippi
    ('lou', 'mxn', [(-103.1, 36.5), (-100.0, 36.5), (-100.0, 37.9), (-102.0, 38.05), (-105.2, 38.3), (-106.3, 39.2), (-106.3, 42.0),
                    (-111.1, 42.0), (-111.1, 36.5)]),                                         # Adams-Onis line: south of the Arkansas, west of 106W to 42N
]


def group_of(a0, name):
    hit = None
    for gid, rules in G.items():
        for c, names in rules:
            if c == a0 and names is not None and name in names: return gid
            if c == a0 and names is None and hit is None: hit = gid
    return hit


parts = defaultdict(list)
for f in json.load(open(A1))['features']:
    p = f['properties']; gid = group_of(p['adm0_a3'], p['name'])
    if gid is None: continue
    g = make_valid(shape(f['geometry']))
    if not g.intersects(BOX): continue
    parts[gid].append(g)
merged = {gid: make_valid(unary_union(gs).intersection(BOX).buffer(0)) for gid, gs in parts.items()}
for src, dst, ring in CUTS:
    cut = Polygon(ring)
    piece = make_valid(merged[src].intersection(cut).buffer(0))
    merged[dst] = make_valid(unary_union([merged.get(dst, Polygon()), piece]).buffer(0))
    merged[src] = make_valid(merged[src].difference(cut).buffer(0))
ids = sorted(k for k, v in merged.items() if not v.is_empty)
geoms = [merged[k] for k in ids]
print('groups', len(ids), ids)
simp = shapely.coverage_simplify(geoms, TOL)


def polys_of(g, min_area):
    out = []
    for poly in (g.geoms if hasattr(g, 'geoms') else [g]):
        if not isinstance(poly, Polygon) or poly.area < min_area: continue
        rings = [list(poly.exterior.coords)] + [list(r.coords) for r in poly.interiors if Polygon(r).area > min_area * 2]
        out.append([[[round(x, 3), round(y, 3)] for x, y in r] for r in rings])
    return out


groups, kept = [], {}
for gid, g in zip(ids, simp):
    if g.is_empty: continue
    small = gid in ('antb', 'antf', 'antn', 'antd', 'bmu', 'cym', 'spm', 'tto', 'jam', 'pri', 'bhs')
    pol = polys_of(g, 0.0004 if small else 0.01)
    if not pol: continue
    big = max((Polygon(p[0]) for p in pol), key=lambda q: q.area)
    lab = polylabel(big, 0.02)
    groups.append({'id': gid, 'polys': pol, 'lab': [round(lab.x, 2), round(lab.y, 2)], 'area': round(sum(Polygon(p[0]).area for p in pol), 2)})
    mv = make_valid(MultiPolygon([Polygon(p[0], p[1:]) for p in pol]))
    kept[gid] = unary_union([q for q in getattr(mv, 'geoms', [mv]) if isinstance(q, (Polygon, MultiPolygon))])

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
            if s.length < 0.03: continue
            arcs.append({'a': ga, 'b': gb, 'line': [[round(x, 3), round(y, 3)] for x, y in s.coords]})
            shared[ga].append(s); shared[gb].append(s)
for gid, g in kept.items():   # coasts: boundary minus every edge shared with a neighbour
    coast = g.boundary
    if shared[gid]: coast = coast.difference(unary_union(shared[gid]).buffer(1e-6))
    if coast.is_empty: continue
    segs = [q for q in getattr(coast, 'geoms', [coast]) if isinstance(q, LineString)]
    m = linemerge(MultiLineString(segs)) if len(segs) > 1 else (segs[0] if segs else None)
    for q in (getattr(m, 'geoms', [m]) if m is not None else []):
        if q.length < 0.05: continue
        arcs.append({'a': gid, 'b': None, 'line': [[round(x, 3), round(y, 3)] for x, y in q.coords]})
print('arcs', len(arcs))

lakes = []
for f in json.load(open(LAKES))['features']:
    g = make_valid(shape(f['geometry']))
    if g.is_empty: continue
    c = g.centroid
    if not (-170 < c.x < -30 and -57 < c.y < 72) or g.area < 0.08: continue
    lakes.append({'name': f['properties'].get('name') or '', 'polys': polys_of(g.simplify(0.02), 0.02)})
WANT = {'Mississippi', 'Missouri', 'Ohio', 'St. Lawrence', 'Hudson', 'Delaware', 'Potomac', 'Rio Grande', 'Orinoco', 'Amazonas', 'Magdalena', 'Paraná',
        'Uruguay', 'Apure', 'Cauca', 'Marañón', 'Ucayali', 'Madeira', 'Negro', 'São  Francisco', 'Tocantins', 'Arkansas', 'Red', 'Colorado', 'Lerma',
        'Balsas', 'Ro Grande de Santiago', 'Meta', 'Guaporé', 'Mamoré', 'Pilcomayo', 'Bermejo', 'Salado', 'Tennessee', 'Columbia', 'Usumacinta', 'Grijalva',
        'Paraguay', 'Sabine', 'Pecos', 'Conchos', 'Bío-Bío'}
rivers = []
for f in json.load(open(RIVERS))['features']:
    n = f['properties'].get('name') or ''
    if n not in WANT: continue
    g = shape(f['geometry']).intersection(BOX).simplify(0.02)
    for s in (g.geoms if hasattr(g, 'geoms') else [g]):
        if isinstance(s, LineString) and s.length > 0.3: rivers.append({'name': n, 'line': [[round(x, 3), round(y, 3)] for x, y in s.coords]})
print('lakes', len(lakes), 'rivers', len(rivers), sorted({r['name'] for r in rivers}))

lg = [make_valid(shape(f['geometry'])) for f in json.load(open(LAND))['features']]
lg = [q for g in lg for q in getattr(g, 'geoms', [g]) if q.centroid.x < -28 or q.centroid.y > 59]   # drop West Africa / Europe
land = unary_union(lg).intersection(sbox(-179, -60, -10, 84)).simplify(0.05)
land_polys = polys_of(land, 0.05)
print('land polys', len(land_polys))
out = {'source': 'Natural Earth 1:10m admin-1 / lakes / rivers, 1:50m land (public domain); historical borders approximated',
       'groups': groups, 'arcs': arcs, 'land': land_polys, 'lakes': lakes, 'rivers': rivers}
p = os.path.join(ROOT, 'src', 'amer', 'americas.json')
json.dump(out, open(p, 'w'), separators=(',', ':'), ensure_ascii=False)
print('wrote', p, os.path.getsize(p) // 1024, 'KB')
