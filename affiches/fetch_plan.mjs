// Données d'une affiche-plan : itinéraire OSRM (avec étapes) + tuiles OpenFreeMap (routes, eau, verdure, lieux, POI).
// Usage : node affiches/fetch_plan.mjs --name koumassi_mockeyville --from LAT,LON --to LAT,LON [--via LAT,LON]
import { VectorTile } from '@mapbox/vector-tile';
import Pbf from 'pbf';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1]]] : a), []));
const pts = [args.from, ...(args.via ? args.via.split(';') : []), args.to].map((s) => s.split(',').map(Number));
const out = path.join(DIR, 'data', args.name); fs.mkdirSync(out, { recursive: true });
const r = await (await fetch(`https://router.project-osrm.org/route/v1/driving/${pts.map(([la, lo]) => `${lo},${la}`).join(';')}?overview=full&geometries=geojson&steps=true`)).json();
const route = r.routes[0];
const steps = route.legs.flatMap((l) => l.steps).map((s) => ({ name: s.name, ref: s.ref, d: s.distance, type: s.maneuver.type, mod: s.maneuver.modifier, loc: s.maneuver.location }));
console.log(`trajet ${(route.distance / 1000).toFixed(1)} km, ${Math.round(route.duration / 60)} min`);

const meta = await (await fetch('https://tiles.openfreemap.org/planet')).json();
const TPL = meta.tiles[0];
const t2 = (lon, lat, z) => [Math.floor((lon + 180) / 360 * 2 ** z), Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * 2 ** z)];
const coords = route.geometry.coordinates;
const lons = coords.map((c) => c[0]), lats = coords.map((c) => c[1]), M = Number(args.margin || 0.03);
const box = [Math.min(...lons) - M, Math.min(...lats) - M, Math.max(...lons) + M, Math.max(...lats) + M];
const tiles = [];
const Z = 14; { const [x0, y1] = t2(box[0], box[1], Z), [x1, y0] = t2(box[2], box[3], Z); for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) tiles.push([Z, x, y]); }
console.log(tiles.length, 'tuiles');
const D = { water: [], green: [], roads: [], places: [], pois: [], roadNames: [] };
const polys = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []);
const lines = (g) => (g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : []);
const R5 = (c) => c.map((ring) => ring.map(([a, b]) => [Math.round(a * 1e5) / 1e5, Math.round(b * 1e5) / 1e5]));
const GREEN = new Set(['wood', 'forest', 'grass', 'park', 'garden', 'nature_reserve', 'scrub', 'wetland', 'pitch', 'golf_course', 'cemetery', 'recreation_ground', 'meadow', 'farmland']);
const seen = new Set();
let n = 0;
for (const [z, x, y] of tiles) {
  let buf; for (let a = 0; a < 4 && !buf; a++) { try { const res = await fetch(TPL.replace('{z}', z).replace('{x}', x).replace('{y}', y)); if (res.ok) buf = await res.arrayBuffer(); } catch {} if (!buf) await new Promise((s) => setTimeout(s, 1000 * 2 ** a)); }
  if (!buf) { console.warn('tuile manquante', z, x, y); continue; }
  const vt = new VectorTile(new Pbf(new Uint8Array(buf)));
  const each = (layer, fn) => { const L = vt.layers[layer]; if (L) for (let i = 0; i < L.length; i++) { const f = L.feature(i); fn(f.properties, f.toGeoJSON(x, y, z).geometry); } };
  each('water', (p, g) => polys(g).forEach((pl) => D.water.push(R5(pl))));
  each('landcover', (p, g) => GREEN.has(p.class) || GREEN.has(p.subclass) ? polys(g).forEach((pl) => D.green.push(R5(pl))) : 0);
  each('park', (p, g) => polys(g).forEach((pl) => D.green.push(R5(pl))));
  each('transportation', (p, g) => { if (p.brunnel === 'tunnel' || ['rail', 'path', 'track', 'ferry'].includes(p.class)) return; lines(g).forEach((l) => D.roads.push({ c: p.class, b: p.brunnel || '', p: R5([l])[0] })); });
  each('transportation_name', (p, g) => { if (p.name && ['motorway', 'trunk', 'primary', 'secondary', 'tertiary'].includes(p.class)) lines(g).forEach((l) => D.roadNames.push({ n: p.name, c: p.class, p: R5([l])[0] })); });
  each('place', (p, g) => { const k = 'pl' + p.name + p.class; if (p.name && g.type === 'Point' && !seen.has(k)) { seen.add(k); D.places.push({ n: p['name:fr'] || p.name, c: p.class, p: g.coordinates }); } });
  each('poi', (p, g) => { const k = 'po' + p.name + p.class; if (p.name && g.type === 'Point' && !seen.has(k)) { seen.add(k); D.pois.push({ n: p.name, c: p.class, s: p.subclass, r: p.rank, p: g.coordinates }); } });
  each('aerodrome_label', (p, g) => { if (p.name && g.type === 'Point') D.pois.push({ n: p.name, c: 'aerodrome', s: p.class, r: 0, p: g.coordinates }); });
  if (++n % 25 === 0) console.log(` ${n}/${tiles.length}`);
}
fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify({ from: pts[0], to: pts.at(-1), distance: route.distance, duration: route.duration, route: coords, steps, box, ...D }));
console.log('écrit', path.join(out, 'plan.json'), (fs.statSync(path.join(out, 'plan.json')).size / 1e6).toFixed(1), 'Mo', Object.fromEntries(Object.entries(D).map(([k, v]) => [k, v.length])));
