// Récupère les vraies données d'un trajet : itinéraire OSRM + tuiles OpenFreeMap (eau, verdure, routes).
// Les bâtiments viennent d'Overture Maps (voir buildings.py).
// Usage : node trajets/fetch.mjs --name bassam_angre --from 5.216750,-3.767524 --to 5.390552,-3.945248 [--via "lat,lon;lat,lon"] [--mode driving]
import { VectorTile } from '@mapbox/vector-tile';
import Pbf from 'pbf';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1]]] : a), []));
const [lat1, lon1] = args.from.split(',').map(Number), [lat2, lon2] = args.to.split(',').map(Number);
const mode = args.mode || 'driving';
const out = path.join(DIR, 'data', args.name); fs.mkdirSync(out, { recursive: true });

// 1. itinéraire réel
// --via "lat,lon;lat,lon" : points de passage imposés (dans l'ordre)
const via = args.via ? args.via.split(';').map((v) => v.split(',').map(Number)) : [];
const wp = [[lat1, lon1], ...via, [lat2, lon2]].map(([la, lo]) => `${lo},${la}`).join(';');
const r = await (await fetch(`https://router.project-osrm.org/route/v1/${mode}/${wp}?overview=full&geometries=geojson&continue_straight=true`)).json();
const route = r.routes[0];
console.log(`trajet : ${(route.distance / 1000).toFixed(1)} km, ${Math.round(route.duration / 60)} min, ${route.geometry.coordinates.length} points`);

// projection locale (mètres) centrée sur le milieu du trajet
const LAT0 = (lat1 + lat2) / 2, LON0 = (lon1 + lon2) / 2, R = 6378137, k = Math.cos(LAT0 * Math.PI / 180);
const P = ([lon, lat]) => [Math.round((lon - LON0) * Math.PI / 180 * R * k * 10) / 10, Math.round(-(lat - LAT0) * Math.PI / 180 * R * 10) / 10];

// 2. tuiles
const meta = await (await fetch('https://tiles.openfreemap.org/planet')).json();
const TPL = meta.tiles[0];
const t2 = (lon, lat, z) => [Math.floor((lon + 180) / 360 * 2 ** z), Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * 2 ** z)];
const coords = route.geometry.coordinates;
const lons = coords.map((c) => c[0]), lats = coords.map((c) => c[1]);
const M = 0.07; // marge en degrés (~8 km) pour la vue d'ensemble
const box = [Math.min(...lons) - M, Math.min(...lats) - M, Math.max(...lons) + M, Math.max(...lats) + M];

const tiles = new Map();
const add = (z, x, y, detail) => { const key = `${z}/${x}/${y}`; if (!tiles.has(key)) tiles.set(key, { z, x, y, detail }); };
{ const [x0, y1] = t2(box[0], box[1], 12), [x1, y0] = t2(box[2], box[3], 12); for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) add(12, x, y, false); }
// tuiles détaillées z14 : couloir du trajet + grands abords du départ et de l'arrivée
const dd = 0.014; // ~1,5 km de part et d'autre du trajet
for (const [lon, lat] of coords) for (let ox = -dd; ox <= dd + 1e-9; ox += dd / 2) for (let oy = -dd; oy <= dd + 1e-9; oy += dd / 2) { const [x, y] = t2(lon + ox, lat + oy, 14); add(14, x, y, true); }
for (const [lat, lon] of [[lat1, lon1], [lat2, lon2]]) for (let ox = -0.03; ox <= 0.03; ox += 0.01) for (let oy = -0.03; oy <= 0.03; oy += 0.01) { const [x, y] = t2(lon + ox, lat + oy, 14); add(14, x, y, true); }
console.log(`${tiles.size} tuiles`);

const data = { water: [], green: [], roads: [], rail: [], places: [], roadNames: [] };
const seenPlace = new Set();
const GREEN = new Set(['wood', 'forest', 'grass', 'park', 'garden', 'nature_reserve', 'farmland', 'scrub', 'wetland', 'pitch', 'golf_course', 'cemetery', 'recreation_ground', 'meadow']);
const WIDTH = { motorway: 22, trunk: 20, primary: 16, secondary: 13, tertiary: 11, minor: 7, service: 5, track: 4, path: 2.5 };
const polys = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []);
const lines = (g) => (g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : []);
let n = 0;
for (const t of tiles.values()) {
  let buf;
  for (let a = 0; a < 4; a++) { try { const res = await fetch(TPL.replace('{z}', t.z).replace('{x}', t.x).replace('{y}', t.y)); if (res.ok) { buf = await res.arrayBuffer(); break; } } catch {} await new Promise((s) => setTimeout(s, 1000 * 2 ** a)); }
  if (!buf) { console.warn('tuile manquante', t); continue; }
  const vt = new VectorTile(new Pbf(new Uint8Array(buf)));
  const each = (layer, fn) => { const L = vt.layers[layer]; if (L) for (let i = 0; i < L.length; i++) { const f = L.feature(i); fn(f.properties, f.toGeoJSON(t.x, t.y, t.z).geometry); } };
  // couches surfaciques : z12 seulement hors du couloir détaillé, z14 dans le couloir
  each('water', (p, g) => polys(g).forEach((pl) => data.water.push({ d: t.detail ? 1 : 0, r: pl.map((ring) => ring.map(P)) })));
  each('landcover', (p, g) => GREEN.has(p.class) || GREEN.has(p.subclass) ? polys(g).forEach((pl) => data.green.push({ d: t.detail ? 1 : 0, r: pl.map((ring) => ring.map(P)) })) : 0);
  each('park', (p, g) => polys(g).forEach((pl) => data.green.push({ d: t.detail ? 1 : 0, r: pl.map((ring) => ring.map(P)) })));
  each('landuse', (p, g) => ['pitch', 'cemetery', 'park', 'grass'].includes(p.class) ? polys(g).forEach((pl) => data.green.push({ d: t.detail ? 1 : 0, r: pl.map((ring) => ring.map(P)) })) : 0);
  each('transportation', (p, g) => {
    if (p.class === 'rail') { lines(g).forEach((l) => data.rail.push(l.map(P))); return; }
    const w = WIDTH[p.class]; if (!w || (p.brunnel === 'tunnel')) return;
    if (!t.detail && w < 11) return;
    lines(g).forEach((l) => data.roads.push({ w, c: p.class, d: t.detail ? 1 : 0, p: l.map(P) }));
  });
  each('place', (p, g) => {
    if (!p.name || g.type !== 'Point' || !['city', 'town', 'village', 'suburb', 'quarter', 'neighbourhood', 'hamlet'].includes(p.class)) return;
    const key = p.name + p.class; if (seenPlace.has(key)) return; seenPlace.add(key);
    data.places.push({ n: p['name:fr'] || p.name, c: p.class, p: P(g.coordinates) });
  });
  if (t.detail) each('transportation_name', (p, g) => {
    if (!p.name || !['motorway', 'trunk', 'primary', 'secondary', 'tertiary'].includes(p.class)) return;
    lines(g).forEach((l) => data.roadNames.push({ n: p.name, c: p.class, p: l.map(P) }));
  });
  if (++n % 20 === 0) console.log(`  ${n}/${tiles.size}`);
}
const json = {
  origin: [LAT0, LON0], from: P([lon1, lat1]), to: P([lon2, lat2]),
  distance: route.distance, duration: route.duration,
  route: coords.map(P), box: [P([box[0], box[3]]), P([box[2], box[1]])],
  ...data,
};
fs.writeFileSync(path.join(out, 'map.json'), JSON.stringify(json));
fs.writeFileSync(path.join(out, 'route_lonlat.json'), JSON.stringify({ coords, box, LAT0, LON0 }));
console.log(`écrit ${out}/map.json (${(fs.statSync(path.join(out, 'map.json')).size / 1e6).toFixed(1)} Mo) — lieux ${data.places.length}, noms de rues ${data.roadNames.length}, eau ${data.water.length}, vert ${data.green.length}, routes ${data.roads.length}`);
