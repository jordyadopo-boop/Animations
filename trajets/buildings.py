# Bâtiments réels (empreintes Overture Maps : OSM + Google/Microsoft détectés par satellite)
# le long du trajet et autour du départ/arrivée.
# Usage : AWS_ACCESS_KEY_ID= AWS_SECRET_ACCESS_KEY= python3 -I trajets/buildings.py bassam_angre
import duckdb, json, math, sys, os, time
name = sys.argv[1]
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', name)
rl = json.load(open(os.path.join(D, 'route_lonlat.json')))
coords, LAT0, LON0 = rl['coords'], rl['LAT0'], rl['LON0']
R, k = 6378137, math.cos(math.radians(LAT0))
P = lambda lon, lat: [round(math.radians(lon - LON0) * R * k, 1), round(-math.radians(lat - LAT0) * R, 1)]

boxes = []
E = 0.0125  # ~1,4 km autour du départ et de l'arrivée
for lon, lat in (coords[0], coords[-1]): boxes.append((lon - E, lat - E, lon + E, lat + E))
C, last = 0.0035, None  # couloir ~400 m de part et d'autre
for lon, lat in coords:
    if last and abs(lon - last[0]) + abs(lat - last[1]) < 0.004: continue
    boxes.append((lon - C, lat - C, lon + C, lat + C)); last = (lon, lat)
cond = ' OR '.join(f'(bbox.xmin > {a} AND bbox.xmax < {c} AND bbox.ymin > {b} AND bbox.ymax < {d})' for a, b, c, d in boxes)
allb = [min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes)]
con = duckdb.connect()
con.sql("LOAD httpfs; LOAD spatial; SET s3_region='us-west-2'; SET s3_access_key_id=''; SET s3_secret_access_key='';")
t = time.time()
rows = con.sql(f"""SELECT height, num_floors, ST_AsGeoJSON(ST_SimplifyPreserveTopology(geometry, 0.000004)) g
FROM read_parquet('s3://overturemaps-us-west-2/release/2026-10-21.0/theme=buildings/type=building/*', hive_partitioning=1)
WHERE bbox.xmin > {allb[0]} AND bbox.xmax < {allb[2]} AND bbox.ymin > {allb[1]} AND bbox.ymax < {allb[3]} AND ({cond})""").fetchall()
print(len(rows), 'bâtiments', round(time.time() - t), 's')
out = []
for h, nf, g in rows:
    g = json.loads(g)
    polys = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates'] if g['type'] == 'MultiPolygon' else []
    for pl in polys:
        ring = [P(x, y) for x, y in pl[0][:-1]]
        if len(ring) < 3: continue
        hh = h if h else (nf * 3.2 if nf else 0)
        out.append([round(hh, 1), ring])
json.dump(out, open(os.path.join(D, 'buildings.json'), 'w'), separators=(',', ':'))
print('écrit', len(out), 'empreintes', round(os.path.getsize(os.path.join(D, 'buildings.json')) / 1e6, 1), 'Mo')
