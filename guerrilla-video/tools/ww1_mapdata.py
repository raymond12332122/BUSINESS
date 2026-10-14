"""Build src/ww1/europe1914.json: Europe, North Africa and the Middle East with the units needed to draw the
borders of 1914 (empires and alliances) and of 1923 (the new states after the peace treaties).

Usage: python3 -I tools/ww1_mapdata.py admin1_bbox.json lakes10.geojson rivers10.geojson land.json
Sources: Natural Earth 1:10m admin-1 provinces, lakes and rivers, 1:50m land (public domain).

Historical borders are approximated with unions of modern provinces ("groups"), e.g. Alsace-Lorraine =
Bas-Rhin + Haut-Rhin + Moselle, plus a few hand-drawn cuts (North Schleswig, the Slovene Littoral, Western Thrace).
Groups are simplified as one coverage so neighbours stay seamless, and every shared edge is stored with the two
groups on either side: the browser draws a border only where the two sides belong to different states.
"""
import json, os, sys
from collections import defaultdict
import shapely
from shapely.geometry import shape, Polygon, MultiPolygon, LineString, MultiLineString, box as sbox
from shapely.ops import unary_union, linemerge, polylabel
from shapely.validation import make_valid

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A1, LAKES, RIVERS, LAND = sys.argv[1:5]
TOL = 0.02
BOX = sbox(-12, 25, 78, 72)

G = {  # group id -> list of (adm0, set of admin-1 names or None for the whole country)
    'als': [('FRA', {'Bas-Rhin', 'Haute-Rhin', 'Haut-Rhin', 'Moselle'})],
    'mem': [('LTU', {'Klaipedos'})], 'vil': [('LTU', {'Vilniaus'})],
    'kal': [('RUS', {'Kaliningrad'})],
    'gpol': [('POL', {'West Pomeranian', 'Lubusz', 'Lower Silesian', 'Opole', 'Warmian-Masurian'})],
    'ppol': [('POL', {'Pomeranian', 'Kuyavian-Pomeranian', 'Greater Poland', 'Silesian'})],
    'cpol': [('POL', {'Masovian', 'Łódź', 'Lublin', 'Świętokrzyskie', 'Podlachian'})],
    'apol': [('POL', {'Lesser Poland', 'Subcarpathian'})],
    'egal': [('UKR', {"L'viv", "Ternopil'", "Ivano-Frankivs'k"})],
    'buk': [('UKR', {'Chernivtsi'}), ('ROU', {'Suceava'})],
    'tcp': [('UKR', {'Transcarpathia'})],
    'vol': [('UKR', {'Volyn', 'Rivne'})],
    'wblr': [('BLR', {'Brest', 'Grodno'})],
    'tnr': [('MDA', {'Stîngă Nistrului', 'Transnistria', 'Camenca', 'Grigoriopol'})],
    'kars': [('TUR', {'Kars', 'Ardahan', 'Artvin', 'Iğdir'})],
    'ist': [('HRV', {'Istarska'})],
    'voj': [('SRB', {'Severno-Backi', 'Južno-Backi', 'Zapadno-Backi', 'Severno-Banatski', 'Srednje-Banatski', 'Južno-Banatski', 'Sremski'})],
    'srb': [('SRB', None), ('KOS', None), ('MKD', None)],
    'trs': [('ROU', {'Alba', 'Arad', 'Bihor', 'Bistrita-Nasaud', 'Brasov', 'Caras-Severin', 'Cluj', 'Covasna', 'Harghita', 'Hunedoara',
                     'Maramures', 'Mures', 'Satu Mare', 'Salaj', 'Sibiu', 'Timis'})],
    'sdob': [('BGR', {'Dobrich', 'Silistra'})],
    'tren': [('ITA', {'Trento', 'Bozen'})], 'gor': [('ITA', {'Gorizia', 'Trieste'})],
    'ita': [('ITA', None), ('SMR', None), ('VAT', None)],
    'cau': [('GEO', None), ('ARM', None), ('AZE', None)],
    'fra': [('FRA', None), ('MCO', None)],
    'che': [('CHE', None), ('LIE', None)],
    'esp': [('ESP', None), ('AND', None), ('GIB', None)],
    'gbr': [('GBR', None), ('IMN', None), ('JEY', None), ('GGY', None)],
    'cyp': [('CYP', None), ('CYN', None), ('ESB', None), ('WSB', None)],
    'pal': [('ISR', None), ('PSX', None)],
    'hej': [('SAU', {'Al Madinah', 'Tabuk'})], 'nej': [('SAU', None)],
    'mar': [('MAR', None), ('SAH', None)],
    'casia': [('KAZ', None), ('UZB', None), ('TKM', None), ('KGZ', None), ('TJK', None)],
}
# hand-drawn cuts: (group taken from, polygon lon/lat) -> new group
CUTS = [
    ('dnk', 'nsch', [(7.9, 54.7), (9.75, 54.7), (9.75, 55.47), (7.9, 55.47)]),                       # North Schleswig (German until 1920)
    ('svn', 'svnw', [(13.3, 46.62), (13.72, 46.53), (13.84, 46.38), (14.05, 46.12), (14.2, 45.97), (14.27, 45.72), (14.48, 45.52),
                     (13.5, 45.38), (13.3, 45.6)]),                                                    # Slovene Littoral (Italian 1920-47)
    ('grc', 'wthr', [(24.75, 40.5), (26.8, 40.5), (26.8, 41.8), (24.75, 41.8)]),                       # Western Thrace (Bulgarian 1913-19)
]


def group_of(a0, name):
    for gid, rules in G.items():
        for c, names in rules:
            if c == a0 and (names is None or name in names): return gid
    return a0.lower()


parts = defaultdict(list)
for f in json.load(open(A1))['features']:
    p = f['properties']; g = make_valid(shape(f['geometry']))
    if not g.intersects(BOX): continue
    parts[group_of(p['adm0_a3'], p['name'])].append(g)
merged = {gid: make_valid(unary_union(gs).intersection(BOX).buffer(0)) for gid, gs in parts.items()}
for src, dst, ring in CUTS:
    cut = Polygon(ring)
    merged[dst] = make_valid(merged[src].intersection(cut).buffer(0))
    merged[src] = make_valid(merged[src].difference(cut).buffer(0))
ids = sorted(k for k, v in merged.items() if not v.is_empty)
geoms = [merged[k] for k in ids]
print('groups', len(ids))
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
    pol = polys_of(g, 0.006)
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
            if s.length < 0.02: continue
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
    c = g.centroid
    if not (-12 < c.x < 78 and 30 < c.y < 70) or g.area < 0.04: continue
    lakes.append({'name': f['properties'].get('name') or '', 'polys': polys_of(g.simplify(0.01), 0.01)})
WANT = {'Rhine', 'Rhein', 'Danube', 'Donau', 'Dunav', 'Duna', 'Dunărea', 'Marne', 'Somme', 'Seine', 'Meuse', 'Maas', 'Loire', 'Elbe', 'Oder', 'Odra',
        'Vistula', 'Wisła', 'Po', 'Isonzo', 'Soča', 'Dnieper', 'Dnipro', 'Dnepr', 'Dniester', 'Dnister', 'Vardar', 'Drina', 'Sava', 'Tisza', 'Tigris',
        'Euphrates', 'Nile', 'Neman', 'Daugava', 'Western Dvina', 'Piave', 'Tagliamento', 'Moselle', 'Mosel', 'Yser', 'Aisne', 'Oise', 'Prut', 'Bug'}
rivers = []
for f in json.load(open(RIVERS))['features']:
    n = f['properties'].get('name') or f['properties'].get('name_en') or ''
    if n not in WANT: continue
    g = shape(f['geometry']).intersection(BOX).simplify(0.01)
    for s in (g.geoms if hasattr(g, 'geoms') else [g]):
        if isinstance(s, LineString) and s.length > 0.15: rivers.append({'name': n, 'line': [[round(x, 3), round(y, 3)] for x, y in s.coords]})
print('lakes', len(lakes), 'rivers', len(rivers), sorted({r['name'] for r in rivers}))

lg = [make_valid(shape(f['geometry'])) for f in json.load(open(LAND))['features']]
land = unary_union(lg).intersection(sbox(-30, 5, 75, 80)).simplify(0.04)
land_polys = polys_of(land, 0.2)
print('land polys', len(land_polys))
out = {'source': 'Natural Earth 1:10m admin-1 / lakes / rivers, 1:50m land (public domain); historical borders approximated',
       'groups': groups, 'arcs': arcs, 'land': land_polys, 'lakes': lakes, 'rivers': rivers}
p = os.path.join(ROOT, 'src', 'ww1', 'europe1914.json')
json.dump(out, open(p, 'w'), separators=(',', ':'), ensure_ascii=False)
print('wrote', p, os.path.getsize(p) // 1024, 'KB')
