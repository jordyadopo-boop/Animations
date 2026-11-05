// Télécharge l'imagerie satellite (Esri World Imagery) autour d'un trajet, par niveaux de détail :
// z13 vue d'ensemble, z15 couloir large, z17 couloir proche, z18 autour du départ, de l'arrivée et des points --zoomAt.
// Usage : node trajets/satellite.mjs koumassi_mockeyville [--zoomAt "lat,lon,rayon_m;..."]
// Attribution obligatoire dans la vidéo : « Imagerie © Esri, Maxar, Earthstar Geographics ».
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const name = process.argv[2];
const zi = process.argv.indexOf('--zoomAt'), extra = zi > 0 ? process.argv[zi + 1].split(';').map((s) => s.split(',').map(Number)) : [];
const D = path.join(DIR, 'data', name), OUT = path.join(D, 'sat');
const { coords } = JSON.parse(fs.readFileSync(path.join(D, 'route_lonlat.json')));
const t2 = (lon, lat, z) => [Math.floor((lon + 180) / 360 * 2 ** z), Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * 2 ** z)];
const set = new Map(); const add = (z, x, y) => set.set(`${z}/${x}/${y}`, [z, x, y]);
const around = (lon, lat, rM, z) => { const dl = rM / 111320; const [x0, y0] = t2(lon - dl, lat + dl, z), [x1, y1] = t2(lon + dl, lat - dl, z); for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) add(z, x, y); };
const lons = coords.map((c) => c[0]), lats = coords.map((c) => c[1]);
{ const M = 0.08, [x0, y0] = t2(Math.min(...lons) - M, Math.max(...lats) + M, 13), [x1, y1] = t2(Math.max(...lons) + M, Math.min(...lats) - M, 13); for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) add(13, x, y); }
for (let i = 0; i < coords.length; i++) { const [lo, la] = coords[i]; if (i % 2 === 0) around(lo, la, 3200, 15); around(lo, la, 650, 17); }
const [slo, sla] = coords[0], [elo, ela] = coords.at(-1);
around(slo, sla, 700, 18); around(elo, ela, 1000, 18);
for (const [la, lo, r] of extra) around(lo, la, r, 18);
const list = [...set.values()];
console.log(Object.entries(list.reduce((a, [z]) => ((a[z] = (a[z] || 0) + 1), a), {})).map(([z, n]) => `z${z}: ${n}`).join(', '));
let done = 0, fail = 0;
const get = async ([z, x, y]) => {
  const f = path.join(OUT, String(z), String(x), `${y}.jpg`); if (fs.existsSync(f)) return done++;
  fs.mkdirSync(path.dirname(f), { recursive: true });
  for (let a = 0; a < 4; a++) {
    try { const r = await fetch(`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`, { headers: { 'User-Agent': 'animations-trajet/1.0' } }); if (r.ok) { fs.writeFileSync(f, Buffer.from(await r.arrayBuffer())); done++; return; } } catch {}
    await new Promise((s) => setTimeout(s, 800 * 2 ** a));
  }
  fail++;
};
for (let i = 0; i < list.length; i += 6) { await Promise.all(list.slice(i, i + 6).map(get)); if (i % 120 === 0) console.log(` ${done}/${list.length}`); }
fs.writeFileSync(path.join(D, 'sat.json'), JSON.stringify(list.filter(([z, x, y]) => fs.existsSync(path.join(OUT, String(z), String(x), `${y}.jpg`)))));
console.log(`fini : ${done} tuiles, ${fail} échecs`);
