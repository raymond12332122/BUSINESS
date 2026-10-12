"""Build src/puebla/puebla.json: Puebla's 217 municipalities plus the neighbouring states, for the Puebla video.

Usage: python3 -I tools/puebla_mapdata.py /path/to/Puebla.json
Sources: INEGI Marco Geoestadístico 2022 municipal boundaries (via PhantomInsights/mexico-geojson),
neighbouring states from src/mx/mexico.json (Natural Earth admin-1, public domain).
"""
import json, os, sys
import shapely
from shapely.geometry import shape, Polygon, MultiPolygon, box as sbox
from shapely.ops import unary_union
from shapely.validation import make_valid

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOX = (-101.4, 16.4, -95.2, 22.6)
TOL = 0.0022  # degrees (~240 m), coverage-preserving so shared borders stay shared
NEIGH = ['Veracruz', 'Tlaxcala', 'Hidalgo', 'México', 'Ciudad de México', 'Morelos', 'Guerrero', 'Oaxaca', 'Querétaro', 'San Luis Potosí', 'Michoacán', 'Guanajuato', 'Tamaulipas']


def polys_of(g):
    if isinstance(g, Polygon): return [g] if not g.is_empty else []
    if isinstance(g, MultiPolygon): return [p for p in g.geoms if not p.is_empty]
    return [p for q in getattr(g, 'geoms', []) for p in polys_of(q)]


def rings(g, rnd=4, min_area=0.0):
    out = []
    for p in polys_of(g):
        if p.area < min_area: continue
        ext = [[round(x, rnd), round(y, rnd)] for x, y in p.exterior.coords[:-1]]
        holes = [[[round(x, rnd), round(y, rnd)] for x, y in h.coords[:-1]] for h in p.interiors if Polygon(h).area > min_area]
        out.append([ext] + holes)
    return out


src = json.load(open(sys.argv[1]))
feats = sorted(src['features'], key=lambda f: f['properties']['CVE_MUN'])
geoms = [make_valid(shape(f['geometry'])) for f in feats]
simp = shapely.coverage_simplify(geoms, TOL)
munis = []
for f, g0, g in zip(feats, geoms, simp):
    p = f['properties']; lp = g0.representative_point()
    munis.append({'cve': p['CVE_MUN'], 'name': p['NOMGEO'], 'polys': rings(g), 'lab': [round(lp.x, 4), round(lp.y, 4)], 'area': round(g0.area, 6)})
pue = unary_union(geoms)
pue_s = pue.simplify(TOL)

mx = json.load(open(os.path.join(ROOT, 'src', 'mx', 'mexico.json')))
clip = sbox(*BOX)
states = []
land = [pue.buffer(0.004)]
for r in mx['regions']:
    if r['name'] not in NEIGH and r['name'] != 'Puebla': continue
    g = make_valid(unary_union([Polygon(pp[0], pp[1:]) for pp in r['polys']])).intersection(clip)
    land.append(g.buffer(0.01))
    if r['name'] == 'Puebla': continue  # only fills slivers between the two data sets
    g = g.difference(pue.buffer(0.002))
    if g.is_empty: continue
    states.append({'name': r['name'], 'polys': rings(g.simplify(0.003), 4, 1e-4)})
land = unary_union(land).intersection(clip)

out = {'box': BOX, 'source': 'INEGI Marco Geoestadístico 2022 (municipios) + Natural Earth admin-1 (estados vecinos)',
       'munis': munis, 'states': states, 'land': rings(land.simplify(0.003), 4, 1e-4), 'outline': rings(pue_s)}
os.makedirs(os.path.join(ROOT, 'src', 'puebla'), exist_ok=True)
path = os.path.join(ROOT, 'src', 'puebla', 'puebla.json')
json.dump(out, open(path, 'w'), ensure_ascii=False, separators=(',', ':'))
npts = sum(len(r) for m in munis for p in m['polys'] for r in p)
print('municipios', len(munis), 'puntos', npts, 'estados', [s['name'] for s in states], 'KB', os.path.getsize(path) // 1024)
