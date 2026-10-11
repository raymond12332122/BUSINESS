"""Build src/napo/europe.json: Europe with period borders for 1792, 1805, 1812 and 1815.

Usage: python3 tools/napo_mapdata.py admin1.geojson lakes.geojson rivers.geojson path/to/mapshaper
Sources: Natural Earth 1:10m admin-1 provinces, lakes and rivers (public domain).

Historical states are approximated by unions of modern provinces (and a few hand-drawn cuts, e.g. the
Rhine for the French left bank). Provinces that belong to the same state in all four periods are
dissolved into one "group"; mapshaper simplifies them with shared topology so neighbouring groups stay
seamless. Each shared arc knows the two groups on either side, so the browser can draw the borders of
any period.
"""
import json, os, subprocess, sys, tempfile
from collections import defaultdict
from shapely.geometry import shape, mapping, Polygon, MultiPolygon, box as sbox, LineString, MultiLineString
from shapely.ops import unary_union, polylabel
from shapely.validation import make_valid

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOX = (-14.0, 24.0, 62.0, 68.0)
PERIODS = ['1792', '1805', '1812', '1815']
admin1, lakes_path, rivers_path, MAPSHAPER = sys.argv[1:5]

# ---------------------------------------------------------------- hand-drawn cuts (lon, lat)
CUTS = {
    # left bank of the Rhine in North Rhine-Westphalia (annexed by France 1797-1814)
    'rhine_left': [(5.5, 50.25), (7.3, 50.25), (7.25, 50.55), (7.1, 50.74), (6.96, 50.94), (6.83, 51.12), (6.75, 51.25), (6.73, 51.43),
                   (6.62, 51.66), (6.42, 51.79), (6.15, 51.9), (5.5, 52.2)],
    # north-west Germany annexed in 1810-11 (Hanseatic departments: Bremen, Hamburg, Osnabrueck, Muenster, Lueneburg)
    'hansa': [(6.62, 51.66), (7.0, 51.66), (7.6, 51.68), (8.0, 51.78), (8.55, 52.1), (8.9, 52.42), (9.3, 52.72), (9.9, 52.95), (10.4, 53.2),
              (10.75, 53.45), (10.9, 54.4), (6.0, 54.4), (6.0, 51.9), (6.42, 51.79)],
    # Swedish Pomerania (east of Mecklenburg)
    'mv_east': [(12.65, 53.0), (15.5, 53.0), (15.5, 55.0), (12.65, 55.0)],
    # Rhineland-Palatinate: Prussian Rhine province (north) vs Bavarian Palatinate (south) after 1815
    'rp_north': [(5.5, 49.62), (9.0, 49.62), (9.0, 51.0), (5.5, 51.0)],
}
SPLITS = {'Nordrhein-Westfalen': ['rhine_left', 'hansa'], 'Niedersachsen': ['hansa'], 'Mecklenburg-Vorpommern': ['mv_east'], 'Rheinland-Pfalz': ['rp_north']}


def T(a, b=None, c=None, d=None):
    """Period tuple helper: T('X') -> all periods X; T(a,b,c,d) -> explicit."""
    return (a, a, a, a) if b is None else (a, b, c, d)


ROU_AUT = {'Alba', 'Arad', 'Bihor', 'Bistrita-Nasaud', 'Brasov', 'Caras-Severin', 'Cluj', 'Covasna', 'Harghita', 'Hunedoara', 'Maramures',
           'Mures', 'Satu Mare', 'Salaj', 'Sibiu', 'Timis', 'Suceava'}
SRB_AUT = {'Severno-Backi', 'Južno-Backi', 'Zapadno-Backi', 'Severno-Banatski', 'Srednje-Banatski', 'Južno-Banatski', 'Sremski'}
HRV_DALM = {'Zadarska', 'Šibensko-Kninska', 'Splitsko-Dalmatinska', 'Istarska'}
HRV_FRONT = {'Primorsko-Goranska', 'Licko-Senjska', 'Karlovacka', 'Sisacko-Moslavacka'}
UKR_AUT = {"L'viv", "Ivano-Frankivs'k", "Ternopil'", 'Chernivtsi', 'Transcarpathia'}
UKR_POL = {'Volyn', 'Rivne', 'Zhytomyr', "Khmel'nyts'kyy", 'Vinnytsya', 'Cherkasy'}
MDA_LEFT = {'Stîngă Nistrului', 'Transnistria', 'Camenca', 'Grigoriopol'}
POL = {
    'West Pomeranian': T('PRU'), 'Lubusz': T('PRU'), 'Lower Silesian': T('PRU'), 'Opole': T('PRU'), 'Silesian': T('PRU'),
    'Warmian-Masurian': T('PRU'), 'Pomeranian': T('PRU'),
    'Kuyavian-Pomeranian': T('POL', 'PRU', 'WAR', 'PRU'), 'Greater Poland': T('POL', 'PRU', 'WAR', 'PRU'),
    'Masovian': T('POL', 'PRU', 'WAR', 'RUS'), 'Łódź': T('POL', 'PRU', 'WAR', 'RUS'), 'Podlachian': T('POL', 'PRU', 'RUS', 'RUS'),
    'Świętokrzyskie': T('POL', 'AUT', 'WAR', 'RUS'), 'Lublin': T('POL', 'AUT', 'WAR', 'RUS'), 'Lesser Poland': T('POL', 'AUT', 'WAR', 'AUT'),
    'Subcarpathian': T('AUT'),
}
ITA_REGION = {
    'Piemonte': T('SAR', 'FRA', 'FRA', 'SAR'), "Valle d'Aosta": T('SAR', 'FRA', 'FRA', 'SAR'), 'Liguria': T('GEN', 'FRA', 'FRA', 'SAR'),
    'Lombardia': T('AUT', 'ITK', 'ITK', 'AUT'), 'Veneto': T('VEN', 'AUT', 'ITK', 'AUT'), 'Friuli-Venezia Giulia': T('VEN', 'AUT', 'ITK', 'AUT'),
    'Trentino-Alto Adige': T('AUT', 'AUT', 'ITK', 'AUT'), 'Emilia-Romagna': T('PAP', 'ITK', 'ITK', 'PAP'), 'Toscana': T('TUS', 'TUS', 'FRA', 'TUS'),
    'Marche': T('PAP', 'PAP', 'ITK', 'PAP'), 'Umbria': T('PAP', 'PAP', 'FRA', 'PAP'), 'Lazio': T('PAP', 'PAP', 'FRA', 'PAP'),
    'Abruzzo': T('NAP'), 'Molise': T('NAP'), 'Campania': T('NAP'), 'Apulia': T('NAP'), 'Basilicata': T('NAP'), 'Calabria': T('NAP'),
    'Sicily': T('NAP', 'NAP', 'SIC', 'NAP'), 'Sardegna': T('SAR'),
}
ITA_PROV = {
    'Bergamo': T('VEN', 'ITK', 'ITK', 'AUT'), 'Brescia': T('VEN', 'ITK', 'ITK', 'AUT'), 'Sondrio': T('SUI', 'ITK', 'ITK', 'AUT'),
    'Gorizia': T('AUT', 'AUT', 'FRA', 'AUT'), 'Trieste': T('AUT', 'AUT', 'FRA', 'AUT'),
    'Piacenza': T('PAR', 'FRA', 'FRA', 'PAR'), 'Parma': T('PAR', 'FRA', 'FRA', 'PAR'),
    'Reggio Emilia': T('MOD', 'ITK', 'ITK', 'MOD'), "Reggio Nell'Emilia": T('MOD', 'ITK', 'ITK', 'MOD'), 'Modena': T('MOD', 'ITK', 'ITK', 'MOD'),
}
DEU = {
    'Baden-Württemberg': T('HRE', 'HRE', 'CRH', 'GER'), 'Bayern': T('HRE', 'HRE', 'CRH', 'GER'), 'Hessen': T('HRE', 'HRE', 'CRH', 'GER'),
    'Thüringen': T('HRE', 'HRE', 'CRH', 'GER'), 'Sachsen': T('HRE', 'HRE', 'CRH', 'GER'), 'Sachsen-Anhalt': T('PRU', 'PRU', 'CRH', 'PRU'),
    'Brandenburg': T('PRU'), 'Berlin': T('PRU'), 'Schleswig-Holstein': T('DEN'), 'Hamburg': T('HRE', 'HRE', 'FRA', 'GER'),
    'Bremen': T('HRE', 'HRE', 'FRA', 'GER'), 'Saarland': T('HRE', 'FRA', 'FRA', 'PRU'),
}
SIMPLE = {  # whole countries
    'GBR': T('GBR'), 'IRL': T('GBR'), 'IMN': T('GBR'), 'JEY': T('GBR'), 'GGY': T('GBR'), 'GIB': T('GBR'), 'PRT': T('POR'),
    'BEL': T('AUT', 'FRA', 'FRA', 'NED'), 'LUX': T('AUT', 'FRA', 'FRA', 'NED'), 'NLD': T('NED', 'NED', 'FRA', 'NED'), 'MCO': T('FRA'),
    'AND': T('ESP'), 'SMR': T('PAP'), 'VAT': T('PAP'), 'LIE': T('HRE', 'HRE', 'CRH', 'GER'),
    'CZE': T('AUT'), 'SVK': T('AUT'), 'HUN': T('AUT'), 'SVN': T('AUT', 'AUT', 'FRA', 'AUT'), 'BIH': T('OTT'), 'MNE': T('MON'),
    'KOS': T('OTT'), 'ALB': T('OTT'), 'MKD': T('OTT'), 'BGR': T('OTT'), 'TUR': T('OTT'), 'CYP': T('OTT'), 'CYN': T('OTT'),
    'LTU': T('POL', 'RUS', 'RUS', 'RUS'), 'EST': T('RUS'), 'FIN': T('SWE', 'SWE', 'RUS', 'RUS'), 'ALD': T('SWE', 'SWE', 'RUS', 'RUS'),
    'NOR': T('DEN', 'DEN', 'DEN', 'SWE'), 'SWE': T('SWE'), 'DNK': T('DEN'), 'FRO': T('DEN'),
    'GEO': T('OTH', 'RUS', 'RUS', 'RUS'), 'ARM': T('PER'), 'AZE': T('PER', 'PER', 'PER', 'RUS'), 'IRN': T('PER'),
    'IRQ': T('OTT'), 'SYR': T('OTT'), 'LBN': T('OTT'), 'ISR': T('OTT'), 'PSX': T('OTT'), 'PSE': T('OTT'), 'JOR': T('OTT'),
    'EGY': T('OTT'), 'LBY': T('OTT'), 'TUN': T('OTT'), 'DZA': T('OTT'), 'MAR': T('MAR'), 'SAH': T('MAR'),
    'MLT': T('OTH', 'GBR', 'GBR', 'GBR'),
}


def assign(a3, name, region, lon, lat, tag):
    if a3 == 'FRA':
        return T('SAR', 'FRA', 'FRA', 'SAR') if name in ('Savoie', 'Haute-Savoie', 'Alpes-Maritimes') else T('FRA')
    if a3 == 'ESP':
        return T('ESP', 'ESP', 'FRA', 'ESP') if name in ('Barcelona', 'Gerona', 'Girona', 'Lérida', 'Lleida', 'Tarragona') else T('ESP')
    if a3 == 'ITA':
        return ITA_PROV.get(name) or ITA_REGION.get(region) or T('PAP')
    if a3 == 'CHE':
        return {'Genève': T('SUI', 'FRA', 'FRA', 'SUI'), 'Jura': T('SUI', 'FRA', 'FRA', 'SUI'), 'Valais': T('SUI', 'SUI', 'FRA', 'SUI')}.get(name, T('SUI'))
    if a3 == 'DEU':
        if name == 'Nordrhein-Westfalen':
            return {'rhine_left': T('HRE', 'FRA', 'FRA', 'PRU'), 'hansa': T('HRE', 'HRE', 'FRA', 'PRU')}.get(tag, T('HRE', 'HRE', 'CRH', 'PRU'))
        if name == 'Niedersachsen':
            return T('HRE', 'HRE', 'FRA', 'GER') if tag == 'hansa' else T('HRE', 'HRE', 'CRH', 'GER')
        if name == 'Mecklenburg-Vorpommern':
            return T('SWE', 'SWE', 'SWE', 'PRU') if tag == 'mv_east' else T('HRE', 'HRE', 'CRH', 'GER')
        if name == 'Rheinland-Pfalz':
            return T('HRE', 'FRA', 'FRA', 'PRU') if tag == 'rp_north' else T('HRE', 'FRA', 'FRA', 'GER')
        return DEU.get(name, T('HRE', 'HRE', 'CRH', 'GER'))
    if a3 == 'AUT':
        return {'Salzburg': T('HRE', 'AUT', 'CRH', 'AUT'), 'Tirol': T('AUT', 'AUT', 'CRH', 'AUT'), 'Vorarlberg': T('AUT', 'AUT', 'CRH', 'AUT')}.get(name, T('AUT'))
    if a3 == 'HRV':
        if name in HRV_DALM: return T('VEN', 'AUT', 'FRA', 'AUT')
        if name in HRV_FRONT: return T('AUT', 'AUT', 'FRA', 'AUT')
        if name == 'Dubrovacko-Neretvanska': return T('RAG', 'RAG', 'FRA', 'AUT')
        return T('AUT')
    if a3 == 'SRB': return T('AUT') if name in SRB_AUT else T('OTT')
    if a3 == 'ROU': return T('AUT') if name in ROU_AUT else T('OTT')
    if a3 == 'MDA': return T('RUS') if name in MDA_LEFT else T('OTT', 'OTT', 'RUS', 'RUS')
    if a3 == 'UKR':
        if name in UKR_AUT: return T('AUT')
        if name in UKR_POL: return T('POL', 'RUS', 'RUS', 'RUS')
        return T('RUS')
    if a3 == 'BLR': return T('POL', 'RUS', 'RUS', 'RUS') if name in ('Brest', 'Grodno', 'Minsk', 'City of Minsk') else T('RUS')
    if a3 == 'LTU' and name == 'Klaipedos': return T('PRU')
    if a3 == 'LVA':  # Courland (west, south of the Gulf of Riga) was a Polish fief until 1795
        return T('POL', 'RUS', 'RUS', 'RUS') if lon < 24.2 and lat < 57.3 else T('RUS')
    if a3 == 'POL': return POL.get(name, T('POL', 'PRU', 'WAR', 'RUS'))
    if a3 == 'RUS': return T('PRU') if name == 'Kaliningrad' else T('RUS')
    if a3 == 'GRC': return T('VEN', 'OTH', 'FRA', 'GBR') if name == 'Ionioi Nisoi' else T('OTT')
    return SIMPLE.get(a3, T('OTH'))


def polyonly(g):
    """Keep only the polygonal parts of a geometry (make_valid can return lines and points too)."""
    if isinstance(g, (Polygon, MultiPolygon)): return g
    ps = [q for q in getattr(g, 'geoms', []) if isinstance(q, (Polygon, MultiPolygon))]
    return unary_union(ps) if ps else Polygon()


# ---------------------------------------------------------------- 1. provinces -> period tuples
bbox = sbox(*BOX)
cuts = {k: Polygon(v) for k, v in CUTS.items()}
parts = defaultdict(list)
for f in json.load(open(admin1))['features']:
    if not f['geometry']: continue
    g = shape(f['geometry'])
    if not g.intersects(bbox): continue
    g = polyonly(make_valid(g).intersection(bbox))
    if g.is_empty: continue
    p = f['properties']; a3, name = p.get('adm0_a3'), p.get('name') or ''
    pieces = [(g, None)]
    for cut in SPLITS.get(name, []) if a3 == 'DEU' else []:
        nxt = []
        for geom, tag in pieces:
            if tag: nxt.append((geom, tag)); continue
            inside, outside = polyonly(geom.intersection(cuts[cut])), polyonly(geom.difference(cuts[cut]))
            if not inside.is_empty: nxt.append((inside, cut))
            if not outside.is_empty: nxt.append((outside, None))
        pieces = nxt
    for geom, tag in pieces:
        c = geom.representative_point()
        parts[assign(a3, name, p.get('region'), c.x, c.y, tag)].append(geom)
print(len(parts), 'groups')

# ---------------------------------------------------------------- 2. dissolve, drop specks, mapshaper topology simplify
feats = []
for gi, (tup, geoms) in enumerate(sorted(parts.items())):
    u = polyonly(make_valid(unary_union([make_valid(q) for q in geoms]))).buffer(0.0005).buffer(-0.0005)  # close hairline gaps between provinces
    polys = list(u.geoms) if isinstance(u, MultiPolygon) else [u] if isinstance(u, Polygon) else []
    keep = [q for q in polys if q.area > 0.006 or (q.centroid.x > 10 and q.centroid.x < 10.6 and abs(q.centroid.y - 42.8) < 0.3)]  # keep Elba
    if not keep: continue
    feats.append({'type': 'Feature', 'properties': {'gid': gi, 'p': '|'.join(tup)}, 'geometry': mapping(MultiPolygon(keep))})
tmp = tempfile.mkdtemp()
src, dst = os.path.join(tmp, 'groups.json'), os.path.join(tmp, 'groups.topo.json')
json.dump({'type': 'FeatureCollection', 'features': feats}, open(src, 'w'))
subprocess.run([MAPSHAPER, src, '-clean', '-simplify', 'interval=1500', 'keep-shapes', '-o', 'format=topojson', 'quantization=200000', dst], check=True)
topo = json.load(open(dst))
obj = next(iter(topo['objects'].values()))
sx, sy = topo['transform']['scale']; tx, ty = topo['transform']['translate']
arcs = []
for a in topo['arcs']:
    x = y = 0; pts = []
    for dx, dy in a: x += dx; y += dy; pts.append([round(x * sx + tx, 4), round(y * sy + ty, 4)])
    arcs.append(pts)
arc_of = lambda i: arcs[i] if i >= 0 else arcs[~i][::-1]
use = defaultdict(list)
groups = []
for g in obj['geometries']:
    if g['type'] not in ('Polygon', 'MultiPolygon'): continue
    polys = [g['arcs']] if g['type'] == 'Polygon' else g['arcs']
    rings_out = []
    for poly in polys:
        rr = []
        for ring in poly:
            pts = []
            for k, ai in enumerate(ring):
                use[ai if ai >= 0 else ~ai].append(len(groups))
                seg = arc_of(ai); pts += seg if k == 0 else seg[1:]
            rr.append([[round(x, 3), round(y, 3)] for x, y in pts[:-1]])
        rings_out.append(rr)
    groups.append({'p': g['properties']['p'].split('|'), 'polys': rings_out})


def on_box(pts):
    lo0, la0, lo1, la1 = BOX; e = 1e-3
    return all(abs(x - lo0) < e or abs(x - lo1) < e or abs(y - la0) < e or abs(y - la1) < e for x, y in pts)


coast, inner = [], []
for ai, users in use.items():
    pts = [[round(x, 3), round(y, 3)] for x, y in arcs[ai]]
    us = sorted(set(users))
    if len(us) == 1:
        if not on_box(arcs[ai]): coast.append(pts)
    elif len(us) == 2:
        a, b = us
        diff = [p for k, p in enumerate(PERIODS) if groups[a]['p'][k] != groups[b]['p'][k]]
        if diff: inner.append({'pts': pts, 'periods': diff})

# ---------------------------------------------------------------- 3. labels: pole of inaccessibility of each state's largest part
labels = {}
for k, per in enumerate(PERIODS):
    by = defaultdict(list)
    for g in groups:
        for poly in g['polys']: by[g['p'][k]].append(polyonly(make_valid(Polygon(poly[0], poly[1:]))))
    labels[per] = {}
    for pol, ps in by.items():
        u = polyonly(make_valid(unary_union(ps).buffer(0.001)))
        big = max(u.geoms, key=lambda q: q.area) if hasattr(u, 'geoms') else u
        lp = polylabel(big, tolerance=0.05)
        labels[per][pol] = [round(lp.x, 2), round(lp.y, 2), round(u.area, 1)]

# ---------------------------------------------------------------- 4. lakes and rivers
lakes = []
for f in json.load(open(lakes_path))['features']:
    g = shape(f['geometry'])
    if not g.intersects(bbox): continue
    g = g.intersection(bbox).simplify(0.02)
    for q in (g.geoms if hasattr(g, 'geoms') else [g]):
        if isinstance(q, Polygon) and q.area > 0.04:
            lakes.append([[round(x, 3), round(y, 3)] for x, y in list(q.exterior.coords)[:-1]])
RIVER_OK = lambda p: (p.get('scalerank') or 99) <= 7 or (p.get('name') or '') in ('Guadalquivir', 'Main', 'Inn', 'Maas', 'Bug', 'Warta', 'Schelde', 'Vltava', 'Marne')
rivers = []
for f in json.load(open(rivers_path))['features']:
    p = f['properties']
    if not f['geometry'] or not RIVER_OK(p) or p.get('featurecla') == 'Lake Centerline': continue
    g = shape(f['geometry'])
    if not g.intersects(bbox): continue
    g = g.intersection(bbox).simplify(0.015)
    for l in (g.geoms if hasattr(g, 'geoms') else [g]):
        if isinstance(l, LineString) and l.length > 0.3:
            rivers.append({'n': p.get('name'), 'pts': [[round(x, 3), round(y, 3)] for x, y in l.coords]})

out = os.path.join(ROOT, 'src', 'napo', 'europe.json')
json.dump({'box': BOX, 'periods': PERIODS, 'source': 'Natural Earth 1:10m admin-1, lakes and rivers (public domain); historical states approximated by province',
           'groups': groups, 'coast': coast, 'inner': inner, 'labels': labels, 'lakes': lakes, 'rivers': rivers},
          open(out, 'w'), separators=(',', ':'), ensure_ascii=False)
print(len(groups), 'groups;', len(coast), 'coast arcs;', len(inner), 'border arcs;', len(lakes), 'lakes;', len(rivers), 'rivers;', os.path.getsize(out) // 1024, 'KB')
