// Vidéo de trajet en 3D à partir de données réelles (bâtiments Overture, carte OpenFreeMap, itinéraire OSRM).
// Rendu déterministe : window.renderFrame(t) dessine l'instant t (secondes).
import * as THREE from 'three';
import { ShapeUtils } from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import TRAJETS from './trajets.js';

const q = new URLSearchParams(location.search);
const SQ = q.get('fmt') === 'carre';   // version carrée 1080×1080
const W = 1080, H = SQ ? 1080 : 1920, FPS = 30;
if (SQ) { document.getElementById('stage').classList.add('sq'); document.getElementById('c').height = H; }
const NAME = q.get('name') || 'bassam_angre';
const CFG = TRAJETS[NAME];
const SAT = !!CFG.satellite;   // fond satellite réel (Esri World Imagery) à la place des maquettes
const [map, buildings] = await Promise.all([
  fetch(`/trajets/data/${NAME}/map.json`).then((r) => r.json()),
  SAT ? [] : fetch(`/trajets/data/${NAME}/buildings.json`).then((r) => r.json()),
]);

// ---------- utilitaires ----------
let seed = 12345;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const hash = (x, z) => { const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return s - Math.floor(s); };
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
const [LAT0, LON0] = map.origin, RE = 6378137, KX = Math.cos(LAT0 * Math.PI / 180);
const proj = (lat, lon) => [(lon - LON0) * Math.PI / 180 * RE * KX, -(lat - LAT0) * Math.PI / 180 * RE];

// géométrie brute -> BufferGeometry (triangles orientés selon la normale voulue)
class Builder {
  constructor() { this.p = []; this.n = []; this.c = []; }
  tri(a, b, c, n, col) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
    if (cx * n[0] + cy * n[1] + cz * n[2] < 0) [b, c] = [c, b];
    this.p.push(...a, ...b, ...c); this.n.push(...n, ...n, ...n);
    if (col) { const [c1, c2, c3] = Array.isArray(col[0]) ? col : [col, col, col]; this.c.push(...c1, ...c2, ...c3); }
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    if (this.c.length) g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    g.computeBoundingSphere(); g.computeBoundingBox();
    return g;
  }
}
const UP = [0, 1, 0];
function flatPoly(b, rings, y) {
  const ring = (r) => { const pts = r.map(([x, z]) => new THREE.Vector2(x, z)); if (pts.length > 1 && pts[0].equals(pts.at(-1))) pts.pop(); return pts; };
  const outer = ring(rings[0]); if (outer.length < 3) return;
  const holes = rings.slice(1).map(ring).filter((h) => h.length >= 3);
  const all = [outer, ...holes].flat();
  for (const [i, j, k] of ShapeUtils.triangulateShape(outer, holes)) b.tri([all[i].x, y, all[i].y], [all[j].x, y, all[j].y], [all[k].x, y, all[k].y], UP);
}

// ---------- scène ----------
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = !SAT; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const SKY = new THREE.Color('#e3edf2');
scene.background = SKY; scene.fog = new THREE.Fog(SKY, 1000, 5000);
const camera = new THREE.PerspectiveCamera(SQ ? 38 : 46, W / H, 1, 400000);

scene.add(new THREE.HemisphereLight('#ffffff', '#d4d6d8', 1.9));
const sun = new THREE.DirectionalLight('#fffaf2', 2.1);
sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.6;
scene.add(sun, sun.target);
const SUN_DIR = new THREE.Vector3(0.55, 1.0, 0.35).normalize();

// sol
const ground = new THREE.Mesh(new THREE.PlaneGeometry(600000, 600000).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#dcdcd8' }));
ground.receiveShadow = true; if (!SAT) scene.add(ground);

// imagerie satellite : une dalle texturée par tuile, superposées du moins au plus détaillé (sans test de profondeur)
if (SAT) {
  const tiles = await fetch(`/trajets/data/${NAME}/sat.json`).then((r) => r.json());
  const lon = (x, z) => x / 2 ** z * 360 - 180, lat = (y, z) => Math.atan(Math.sinh(Math.PI * (1 - 2 * y / 2 ** z))) * 180 / Math.PI;
  const loader = new THREE.TextureLoader(), aniso = renderer.capabilities.getMaxAnisotropy();
  const base = new THREE.Mesh(new THREE.PlaneGeometry(600000, 600000).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#56603f', depthTest: false, depthWrite: false }));
  base.renderOrder = -10; scene.add(base);
  await Promise.all(tiles.map(async ([z, x, y]) => {
    const tex = await loader.loadAsync(`/trajets/data/${NAME}/sat/${z}/${x}/${y}.jpg`);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = aniso; tex.minFilter = THREE.LinearMipmapLinearFilter;
    const [x0, z0] = proj(lat(y, z), lon(x, z)), [x1, z1] = proj(lat(y + 1, z), lon(x + 1, z));
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([x0, 0, z0, x1, 0, z0, x1, 0, z1, x0, 0, z1], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 0], 2));
    g.setIndex([0, 2, 1, 0, 3, 2]); g.computeBoundingSphere();
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: tex, depthTest: false, depthWrite: false, side: THREE.DoubleSide }));
    m.renderOrder = z - 20; scene.add(m);
  }));
  console.log('tuiles satellite', tiles.length);
}

// verdure et eau
if (!SAT) {
  const g = new Builder(), w = new Builder();
  for (const p of map.green) flatPoly(g, p.r, 0.25);
  for (const p of map.water) flatPoly(w, p.r, 0.45);
  const gm = new THREE.Mesh(g.geometry(), new THREE.MeshLambertMaterial({ color: '#c3e0a6' }));
  const wm = new THREE.Mesh(w.geometry(), new THREE.MeshLambertMaterial({ color: '#8fd6ec' }));
  gm.receiveShadow = wm.receiveShadow = true; scene.add(gm, wm);
}

// routes : rubans plats
if (!SAT) {
  const minor = new Builder(), major = new Builder(), casing = new Builder();
  const ribbons = [];
  for (const r of map.roads) { ribbons.push([r.w >= 11 ? major : minor, r.w >= 11 ? 0.9 : 0.7, r.w / 2, r.p]); ribbons.push([casing, 0.55, r.w / 2 + (r.w >= 11 ? 2.2 : 1.2), r.p]); }
  for (const [b, y, h, pts] of ribbons) {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, z1] = pts[i], [x2, z2] = pts[i + 1], dx = x2 - x1, dz = z2 - z1, l = Math.hypot(dx, dz); if (l < 0.01) continue;
      const nx = -dz / l * h, nz = dx / l * h, ex = dx / l * h * 0.5, ez = dz / l * h * 0.5;
      const A = [x1 - nx - ex, y, z1 - nz - ez], B = [x1 + nx - ex, y, z1 + nz - ez], C = [x2 + nx + ex, y, z2 + nz + ez], D = [x2 - nx + ex, y, z2 - nz + ez];
      b.tri(A, B, C, UP); b.tri(A, C, D, UP);
    }
  }
  const mm = new THREE.Mesh(minor.geometry(), new THREE.MeshLambertMaterial({ color: '#ffffff' }));
  const MM = new THREE.Mesh(major.geometry(), new THREE.MeshLambertMaterial({ color: '#ffeeb8' }));
  const cm = new THREE.Mesh(casing.geometry(), new THREE.MeshLambertMaterial({ color: '#b3afa5' }));
  mm.receiveShadow = MM.receiveShadow = cm.receiveShadow = true; scene.add(cm, mm, MM);
}

// bâtiments extrudés (par blocs de 1,5 km pour le découpage hors champ)
const chunks = new Map();
const WALL = [[0.94, 0.94, 0.93], [0.97, 0.97, 0.96], [0.91, 0.91, 0.91], [0.96, 0.94, 0.90]];
for (const [h0, ring] of SAT ? [] : buildings) {
  let cx = 0, cz = 0, area = 0;
  for (let i = 0; i < ring.length; i++) { const [x1, z1] = ring[i], [x2, z2] = ring[(i + 1) % ring.length]; area += x1 * z2 - x2 * z1; cx += x1; cz += z1; }
  area = Math.abs(area) / 2; cx /= ring.length; cz /= ring.length;
  if (area < 12) continue;
  const r = hash(cx, cz);
  const floors = 1 + Math.floor(r * r * (area > 400 ? 5 : area > 150 ? 3 : 2));
  const h = h0 > 0 ? h0 : floors * 3.3 + 0.6;
  const key = `${Math.floor(cx / 1500)},${Math.floor(cz / 1500)}`;
  if (!chunks.has(key)) chunks.set(key, new Builder());
  const b = chunks.get(key), base = WALL[Math.floor(hash(cz, cx) * WALL.length)];
  const lo = base.map((v) => v * 0.78), hi = base, roof = base.map((v) => Math.min(1, v * 1.05));
  for (let i = 0; i < ring.length; i++) {
    const [x1, z1] = ring[i], [x2, z2] = ring[(i + 1) % ring.length], dx = x2 - x1, dz = z2 - z1, l = Math.hypot(dx, dz); if (l < 0.05) continue;
    let n = [dz / l, 0, -dx / l];
    if ((x1 + dx / 2 - cx) * n[0] + (z1 + dz / 2 - cz) * n[2] < 0) n = [-n[0], 0, -n[2]];
    b.tri([x1, 0, z1], [x2, 0, z2], [x2, h, z2], n, [lo, lo, hi]);
    b.tri([x1, 0, z1], [x2, h, z2], [x1, h, z1], n, [lo, hi, hi]);
  }
  const pts = ring.map(([x, z]) => new THREE.Vector2(x, z));
  for (const [i, j, k] of ShapeUtils.triangulateShape(pts, [])) b.tri([pts[i].x, h, pts[i].y], [pts[j].x, h, pts[j].y], [pts[k].x, h, pts[k].y], UP, roof);
}
const bMat = new THREE.MeshLambertMaterial({ vertexColors: true });
for (const b of chunks.values()) { const m = new THREE.Mesh(b.geometry(), bMat); m.castShadow = m.receiveShadow = true; scene.add(m); }

// ---------- itinéraire (densifié tous les 4 m) ----------
const route = [];
for (let i = 0; i < map.route.length - 1; i++) {
  const [x1, z1] = map.route[i], [x2, z2] = map.route[i + 1], n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, z2 - z1) / 4));
  for (let k = 0; k < n; k++) route.push([x1 + (x2 - x1) * k / n, z1 + (z2 - z1) * k / n]);
}
route.push(map.route.at(-1));
const cum = [0]; for (let i = 1; i < route.length; i++) cum.push(cum[i - 1] + Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]));
const LEN = cum.at(-1);
const at = (s) => { s = clamp(s, 0, LEN); let lo = 0, hi = cum.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; cum[m] <= s ? (lo = m) : (hi = m); } const t = (s - cum[lo]) / Math.max(1e-6, cum[hi] - cum[lo]); return [mix(route[lo][0], route[hi][0], t), mix(route[lo][1], route[hi][1], t), lo]; };

// arbres : grille d'occupation 5 m (bâtiments, routes, eau) puis semis pseudo-aléatoire
if (!SAT) {
  const C = 5, [[bx0, bz0], [bx1, bz1]] = map.box, GW = Math.ceil((bx1 - bx0) / C), GH = Math.ceil((bz1 - bz0) / C);
  const occ = new Uint8Array(GW * GH); // 1 = occupé, 2 = espace vert
  const fill = (ring, val, onlyEmpty) => {
    let z0 = Infinity, z1 = -Infinity; for (const [, z] of ring) { z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
    for (let gz = Math.max(0, Math.floor((z0 - bz0) / C)); gz <= Math.min(GH - 1, Math.floor((z1 - bz0) / C)); gz++) {
      const zc = bz0 + (gz + 0.5) * C, xs = [];
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, zi] = ring[i], [xj, zj] = ring[j]; if ((zi > zc) !== (zj > zc)) xs.push(xi + (zc - zi) / (zj - zi) * (xj - xi)); }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let gx = Math.max(0, Math.ceil((xs[k] - bx0) / C - 0.5)); gx <= Math.min(GW - 1, Math.floor((xs[k + 1] - bx0) / C - 0.5)); gx++) { const id = gz * GW + gx; if (!onlyEmpty || !occ[id]) occ[id] = val; }
    }
  };
  for (const p of map.green) if (p.d) fill(p.r[0], 2, true);
  for (const p of map.water) for (const r of p.r.slice(0, 1)) fill(r, 1, false);
  for (const [, ring] of buildings) {
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity; for (const [x, z] of ring) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
    for (let gz = Math.floor((z0 - bz0) / C); gz <= Math.floor((z1 - bz0) / C); gz++) for (let gx = Math.floor((x0 - bx0) / C); gx <= Math.floor((x1 - bx0) / C); gx++) if (gx >= 0 && gz >= 0 && gx < GW && gz < GH) occ[gz * GW + gx] = 1;
  }
  for (const r of map.roads) if (r.d) for (let i = 0; i < r.p.length - 1; i++) {
    const [x1, z1] = r.p[i], [x2, z2] = r.p[i + 1], n = Math.ceil(Math.hypot(x2 - x1, z2 - z1) / 2), rad = Math.ceil((r.w / 2 + 1) / C);
    for (let k = 0; k <= n; k++) { const gx = Math.floor((mix(x1, x2, k / n) - bx0) / C), gz = Math.floor((mix(z1, z2, k / n) - bz0) / C); for (let a = -rad; a <= rad; a++) for (let b2 = -rad; b2 <= rad; b2++) { const X = gx + a, Z = gz + b2; if (X >= 0 && Z >= 0 && X < GW && Z < GH) occ[Z * GW + X] = 1; } }
  }
  const get = (x, z) => { const gx = Math.floor((x - bx0) / C), gz = Math.floor((z - bz0) / C); return gx < 0 || gz < 0 || gx >= GW || gz >= GH ? 1 : occ[gz * GW + gx]; };
  const groups = new Map();
  const tryTree = (x, z) => {
    const v = get(x, z); if (v === 1) return; if (v !== 2 && rnd() > 0.45) return;
    for (const [ox, oz] of [[C, 0], [-C, 0], [0, C], [0, -C]]) if (get(x + ox, z + oz) === 1 && rnd() < 0.7) return;
    const key = `${Math.floor(x / 1500)},${Math.floor(z / 1500)}`; if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push([x, z, 2.6 + rnd() * 3.2]);
    const id = Math.floor((z - bz0) / C) * GW + Math.floor((x - bx0) / C); occ[id] = 1;
  };
  const E = 2200;
  [map.from, map.to].forEach(([cx, cz]) => { for (let i = 0; i < 200000; i++) tryTree(cx + (rnd() * 2 - 1) * E, cz + (rnd() * 2 - 1) * E); });
  for (let s = 0; s < LEN; s += 3) { const [x, z] = at(s); for (let k = 0; k < 4; k++) tryTree(x + (rnd() * 2 - 1) * 1300, z + (rnd() * 2 - 1) * 1300); }
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const mat = new THREE.MeshLambertMaterial({ color: '#ffffff' });
  const GREENS = ['#5cae4a', '#6dbb52', '#4f9f45', '#7cc35a', '#62b04e'].map((c) => new THREE.Color(c));
  window.TREES = [];
  for (const list of groups.values()) {
    const im = new THREE.InstancedMesh(geo, mat, list.length), m4 = new THREE.Matrix4();
    list.forEach(([x, z, r], i) => { m4.makeScale(r, r * 0.92, r).setPosition(x, r * 1.15, z); im.setMatrixAt(i, m4); im.setColorAt(i, GREENS[Math.floor(hash(x, z) * GREENS.length)]); });
    im.castShadow = im.receiveShadow = true; im.computeBoundingSphere(); scene.add(im); window.TREES.push(im);
  }
  console.log('arbres', [...groups.values()].reduce((a, g) => a + g.length, 0));
}

// trait de l'itinéraire (épaisseur en pixels) + halo
const linePos = []; for (const [x, z] of route) linePos.push(x, 3, z);
const mkLine = (color, width, opacity) => {
  const g = new LineGeometry(); g.setPositions(linePos);
  const m = new LineMaterial({ color, linewidth: width, transparent: true, opacity, depthTest: false, depthWrite: false });
  m.resolution.set(W, H);
  const l = new Line2(g, m); l.renderOrder = 10; l.frustumCulled = false; scene.add(l); return l;
};
const LC = { glow: '#6fb6ff', glow2: '#9fd0ff', core: '#1f6bff', ...(CFG.theme?.line || {}) };
const glow = mkLine(LC.glow, 46, 0.35), glow2 = mkLine(LC.glow2, 26, CFG.theme?.line ? 0.95 : 0.5), core = mkLine(LC.core, 13, 1);
const SEGS = route.length - 1;

// ---------- chorégraphie : survol panoramique ----------
const DUR = CFG.duration, T0 = 4.0, T1 = DUR - (CFG.endHold || 6.0);
// ralenti final (derniers virages) : on parcourt les derniers `meters` en `seconds`, caméra basse et cap fixe
const SLOW = CFG.slowEnd || null, TS = SLOW ? T1 - SLOW.seconds : T1;
const [fx, fz] = map.from, [tx, tz] = map.to;
// cap de la caméra : direction moyenne du trajet sur la fenêtre [s-600 m, s+2000 m], déroulée sans saut
const HSTEP = 20, HN = Math.ceil(LEN / HSTEP), HEAD = new Float64Array(HN + 1);
{
  let prev = null;
  for (let i = 0; i <= HN; i++) {
    const s = i * HSTEP; let vx = 0, vz = 0;
    for (let u = s - 600; u < s + 2000; u += 40) { const [x1, z1] = at(u), [x2, z2] = at(u + 40), l = Math.hypot(x2 - x1, z2 - z1); if (l > 1e-3) { const wgt = u < s ? 0.5 : 1; vx += (x2 - x1) / l * wgt; vz += (z2 - z1) / l * wgt; } }
    let a = Math.atan2(vz, vx);
    if (prev !== null) { while (a - prev > Math.PI) a -= 2 * Math.PI; while (a - prev < -Math.PI) a += 2 * Math.PI; }
    HEAD[i] = prev = a;
  }
}
const heading = (s) => { const f = clamp(s, 0, LEN) / HSTEP, i = Math.min(HN - 1, Math.floor(f)); return mix(HEAD[i], HEAD[i + 1], f - i); };
const D_NEAR = 700, D_MID = 1900;
const D_SLOW = SLOW?.dist || 520;
const wide = (t) => sstep(T0, T0 + 3.5, t) * (1 - sstep(TS - 3.5, TS, t));
const dist = (t) => t < T0 ? mix(1050, D_NEAR, sstep(0, T0, t))
  : t > T1 ? mix(SLOW ? D_SLOW : D_NEAR, SLOW ? D_SLOW * 0.95 : 560, sstep(T1, DUR, t))
  : t > TS ? mix(D_NEAR, D_SLOW, sstep(TS, TS + 1.5, t))
  : Math.exp(mix(Math.log(D_NEAR), Math.log(D_MID), wide(t)));
const LEN_A = SLOW ? Math.max(0, LEN - SLOW.meters) : LEN;
// abscisse : vitesse proportionnelle à l'altitude (défilement régulier à l'écran)
const SN = 6000, sTab = new Float64Array(SN + 1);
{ let acc = 0; for (let i = 1; i <= SN; i++) { const t = T0 + (TS - T0) * (i - 0.5) / SN; acc += dist(t) * sstep(T0, T0 + 1.2, t) * (1 - sstep(TS - 1.2, TS, t)); sTab[i] = acc; } for (let i = 0; i <= SN; i++) sTab[i] *= LEN_A / acc; }
const sAt = (t) => {
  if (t <= T0) return 0; if (t >= T1) return LEN;
  if (t >= TS) { const u = (t - TS) / (T1 - TS); return mix(LEN_A, LEN, u * u * (3 - 2 * u)); }
  const f = (t - T0) / (TS - T0) * SN, i = Math.floor(f); return mix(sTab[i], sTab[Math.min(SN, i + 1)], f - i);
};
const SLOW_YAW = SLOW ? (() => { const [x1, z1] = at(LEN_A), [x2, z2] = at(LEN); return Math.atan2(z2 - z1, x2 - x1); })() : 0;

// ---------- interface ----------
const $ = (id) => document.getElementById(id);
const ui = $('ui'), labels = $('labels');
$('title').innerHTML = CFG.titleHTML || CFG.title.map((l) => `<span>${l}</span>`).join('');
if (CFG.theme?.name) document.getElementById('stage').classList.add(CFG.theme.name);
if (SAT) ui.append(Object.assign(document.createElement('div'), { id: 'attr', textContent: 'Imagerie © Esri, Maxar, Earthstar Geographics · Itinéraire OSRM · Noms © OpenStreetMap' }));
if (CFG.endCard) { const e = Object.assign(document.createElement('div'), { id: 'endcard' }); e.innerHTML = CFG.endCard; ui.append(e); }
if (CFG.turns) ui.append(Object.assign(document.createElement('div'), { id: 'turn' }));
if (CFG.theme?.pagne) {
  const NS = 'http://www.w3.org/2000/svg', sv = document.createElementNS(NS, 'svg'); sv.id = 'pagne'; sv.setAttribute('viewBox', `0 0 70 ${H}`);
  let o = `<rect width="70" height="${H}" fill="#c3bbf0"/>`; const cw = 8.75;
  for (let r = 0; r < H / cw; r++) for (let c = 0; c < 8; c++) { const ph = (r % 20) / 20, x0 = 1 + 6 * (ph < 0.5 ? ph * 2 : 2 - ph * 2), d = Math.abs(c - x0);
    const col = d < 1.3 ? ((r + c) % 3 ? '#6a2690' : '#4f1a78') : d < 2.2 ? '#9c49b9' : d < 2.9 ? '#d79ae3' : (r + c) % 2 ? '#a69ef0' : '#b2aaf4';
    o += `<rect x="${(c * cw + 1.2).toFixed(1)}" y="${(r * cw + 1.2).toFixed(1)}" width="${(cw - 2.4).toFixed(1)}" height="${(cw - 2.4).toFixed(1)}" rx="1.5" fill="${col}"/>`; }
  sv.innerHTML = o + `<rect width="5" height="${H}" fill="#d8b04c"/>`; ui.append(sv);
}
if (CFG.theme?.pin) { const st = document.querySelectorAll('#pg stop'); st[0].setAttribute('stop-color', CFG.theme.pin[0]); st[1].setAttribute('stop-color', CFG.theme.pin[1]); document.querySelector('#pin path').setAttribute('stroke', CFG.theme.pin[2]); }
const tagFrom = Object.assign(document.createElement('div'), { className: 'tag', textContent: CFG.fromLabel });
const tagTo = Object.assign(document.createElement('div'), { className: 'tag', textContent: CFG.toLabel });
const dotFrom = Object.assign(document.createElement('div'), { className: 'dot' });
const head = Object.assign(document.createElement('div'), { className: 'dot', id: 'head' });
ui.prepend(dotFrom, head); ui.append(tagFrom, tagTo);
const V = new THREE.Vector3();
const screen = (x, y, z) => { V.set(x, y, z).project(camera); return [(V.x + 1) / 2 * W, (1 - V.y) / 2 * H, V.z < 1 && V.z > -1]; };
const fmt = (m) => (m / 1000).toFixed(1).replace('.', ',') + ' km';

// noms réels des quartiers (OpenStreetMap) proches du trajet + noms des grands axes
const RANK = { city: 3, town: 3, suburb: 2, village: 2, quarter: 1, neighbourhood: 0, hamlet: 0 };
const near = (x, z) => { let d = Infinity; for (let i = 0; i < route.length; i += 12) d = Math.min(d, Math.hypot(route[i][0] - x, route[i][1] - z)); return d; };
const tags = [];
for (const pl of map.places) {
  if (near(pl.p[0], pl.p[1]) > 2600) continue;
  const big = RANK[pl.c] >= 2, el = Object.assign(document.createElement('div'), { className: 'pl' + (big ? ' big' : ''), textContent: pl.n.replace(/ /g, ' ') });
  labels.append(el); tags.push({ el, x: pl.p[0], z: pl.p[1], rank: RANK[pl.c], w: el.textContent.length * (big ? 30 : 23) + 30, h: big ? 64 : 50, o: 0 });
}
const roadsByName = new Map();
for (const r of map.roadNames) { if (!roadsByName.has(r.n)) roadsByName.set(r.n, { rank: { motorway: 1, trunk: 1, primary: 0.5, secondary: 0, tertiary: -0.5 }[r.c], pts: [] }); roadsByName.get(r.n).pts.push(...r.p); }
for (const [n, r] of roadsByName) {
  if (/^(Rue [A-Z]?\d|Rond|Carrefour|Grand Carrefour)/.test(n) && r.rank < 1) continue;
  const el = Object.assign(document.createElement('div'), { className: 'rd', textContent: n });
  labels.append(el); tags.push({ el, road: r.pts, rank: r.rank - 3, w: n.length * 14 + 40, h: 38, o: 0 });
}
for (const [i, lm] of (CFG.landmarks || []).entries()) {
  const [x, z] = proj(lm.lat, lm.lon), el = Object.assign(document.createElement('div'), { className: 'lm' });
  el.innerHTML = `<i>${lm.num ?? i + 1}</i>${lm.n}`; labels.append(el);
  tags.push({ el, x, z, rank: 6, w: lm.n.length * 21 + 90, h: 60, o: 0, near: lm.near ?? 2.6 });
}
for (const av of CFG.avoid || []) {
  const [x, z] = proj(av.lat, av.lon), el = Object.assign(document.createElement('div'), { className: 'lm av' });
  el.innerHTML = `<i>✕</i>${av.n}`; labels.append(el);
  tags.push({ el, x, z, rank: 7, w: av.n.length * 21 + 90, h: 60, o: 0, near: 3.2 });
}
// bandeaux de virage : affichés quand la tête du trait approche du carrefour
const TURNS = (CFG.turns || []).map((tn) => { const [x, z] = proj(tn.lat, tn.lon); let best = [Infinity, 0]; for (let i = 0; i < route.length; i += 2) { const d = Math.hypot(route[i][0] - x, route[i][1] - z); if (d < best[0]) best = [d, cum[i]]; } return { ...tn, s: best[1] }; });
let lastT = -1;
const ZONES = map.places.filter((p) => RANK[p.c] >= 1 && near(p.p[0], p.p[1]) < 1800).map((p) => ({ n: p.n.replace(/\u00a0/g, ' '), x: p.p[0], z: p.p[1], rank: RANK[p.c] }));
function updateLabels(t, cx, cz, D, avoid) {
  const instant = Math.abs(t - lastT) > 0.2; lastT = t;
  const cand = [];
  for (const g of tags) {
    let x = g.x, z = g.z;
    if (g.road) { let best = Infinity; for (const [px, pz] of g.road) { const d = (px - cx) ** 2 + (pz - cz) ** 2; if (d < best) { best = d; x = px; z = pz; } } if (Math.sqrt(best) > D * 1.1) { g.target = 0; continue; } }
    const dc = Math.hypot(camera.position.x - x, camera.position.y, camera.position.z - z);
    const [sx, sy, ok] = screen(x, 0, z);
    g.sx = sx; g.sy = sy; g.target = 0;
    if (!ok || dc > D * (g.road ? 2.2 : g.near || 3.6) || sx < 40 + g.w / 2 || sx > W - 40 - g.w / 2 || sy < (CFG.theme ? (SQ ? 430 : 660) : 520) || sy > H - 90 || (CFG.theme?.pagne && sx > W - 70 - g.w / 2)) continue;
    g.scale = clamp(D * 1.5 / dc, 0.85, 1.2);
    cand.push([g.rank * 2 - dc / D, g]);
  }
  cand.sort((a, b) => b[0] - a[0]);
  const boxes = [...avoid];
  let n = 0;
  for (const [, g] of cand) {
    const w = g.w * g.scale, h = g.h * g.scale, b = [g.sx - w / 2 - 14, g.sy - h / 2 - 10, g.sx + w / 2 + 14, g.sy + h / 2 + 10];
    if (n >= 9 || boxes.some((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1])) continue;
    boxes.push(b); g.target = 1; n++;
  }
  for (const g of tags) {
    g.o = instant ? g.target : g.o + (g.target - g.o) * 0.16;
    if (g.o < 0.01) { g.el.style.display = 'none'; continue; }
    g.el.style.display = g.el.classList.contains('lm') ? 'flex' : 'block'; g.el.style.opacity = g.o;
    g.el.style.left = g.sx + 'px'; g.el.style.top = g.sy + 'px';
    g.el.style.transform = `translate(-50%,-50%) scale(${(g.scale || 1) * mix(0.85, 1, g.o)})`;
  }
}

window.renderFrame = (t) => {
  const s = sAt(t), w = wide(t), D = dist(t);
  let sx = 0, sz = 0; for (let k = -4; k <= 4; k++) { const [x, z] = at(s + k * D * 0.012); sx += x; sz += z; }
  let yaw = heading(s);
  if (t < T0 + 1) yaw += 1.5 * (1 - sstep(0, T0 + 1, t));      // tour panoramique autour du départ
  if (SLOW && t > TS) { let y2 = SLOW_YAW; while (y2 - yaw > Math.PI) y2 -= 2 * Math.PI; while (y2 - yaw < -Math.PI) y2 += 2 * Math.PI; yaw = mix(yaw, y2, sstep(TS - 1.0, TS + 1.0, t)); }
  if (t > T1) yaw -= (SLOW ? 0.7 : 1.3) * sstep(T1, DUR, t);                    // tour panoramique autour de l'arrivée
  const pitch = THREE.MathUtils.degToRad(t < T0 ? mix(24, 30, sstep(0, T0, t)) : t > T1 ? mix(SLOW ? 42 : 30, SLOW ? 36 : 26, sstep(T1, DUR, t)) : SLOW && t > TS - 1 ? mix(30, 42, sstep(TS - 1, TS + 1.5, t)) : mix(30, 37, w));
  const fwx = Math.cos(yaw), fwz = Math.sin(yaw), ahead = D * mix(0.08, 0.2, w);
  const cx = sx / 9 + fwx * ahead, cz = sz / 9 + fwz * ahead;
  camera.position.set(cx - fwx * D * Math.cos(pitch), D * Math.sin(pitch), cz - fwz * D * Math.cos(pitch));
  camera.lookAt(cx, 0, cz);
  camera.near = Math.max(1, D * 0.02); camera.far = D * 5.5; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  scene.fog.near = D * 1.3; scene.fog.far = D * 4.6;
  const S = clamp(D * 1.6, 300, 4000);
  sun.target.position.set(cx, 0, cz); sun.position.set(cx + SUN_DIR.x * S * 2, SUN_DIR.y * S * 2, cz + SUN_DIR.z * S * 2);
  Object.assign(sun.shadow.camera, { left: -S, right: S, top: S, bottom: -S, near: 1, far: S * 5 }); sun.shadow.camera.updateProjectionMatrix();
  // trait
  const [hx, hz, idx] = at(s), n = s >= LEN ? SEGS : idx;
  for (const l of [core, glow, glow2]) l.geometry.instanceCount = Math.max(0, n);
  const pulse = 1 + 0.12 * Math.sin(t * 6);
  // dans le ralenti final, trait affiné pour laisser voir la rue empruntée
  const thin = SLOW ? sstep(TS - 1.5, TS + 0.5, t) : 0;
  for (const [l, base] of [[glow, 46], [glow2, 26], [core, 13]]) l.material.linewidth = base * (l === glow ? pulse : 1) * mix(1, SAT ? (l === core ? 0.75 : l === glow2 ? 0.62 : 0.45) : (l === core ? 0.5 : l === glow2 ? 0.38 : 0.3), thin);
  glow.material.opacity = 0.35 * (1 - 0.7 * thin); glow2.material.opacity = (CFG.theme?.line ? 0.95 : 0.5) * (1 - 0.25 * thin);

  // interface
  $('title').style.opacity = sstep(0.2, 0.9, t); $('title').style.transform = `translateY(${(1 - sstep(0.2, 0.9, t)) * 30}px)`;
  const pill = $('pill'); pill.style.opacity = sstep(T0 - 0.5, T0, t);
  pill.innerHTML = t < T1 + 0.4 ? fmt(s * map.distance / LEN) : `${fmt(map.distance)} <small>· ${Math.round(map.duration / 60)} min</small>`;
  pill.style.transform = `scale(${1 + 0.12 * Math.exp(-Math.pow((t - T1 - 0.45) * 5, 2))})`;
  const avoid = [];
  const [fsx, fsy, fok] = screen(fx, 3, fz), fo = fok ? sstep(0.3, 0.8, t) * (1 - sstep(T0 + 2, T0 + 3, t)) : 0;
  Object.assign(dotFrom.style, { left: fsx + 'px', top: fsy + 'px', opacity: fok ? 1 : 0 });
  Object.assign(tagFrom.style, { left: fsx + 'px', top: fsy - 34 + 'px', opacity: fo });
  if (fo > 0.05) avoid.push([fsx - 130, fsy - 130, fsx + 130, fsy + 30]);
  const [hsx, hsy, hok] = screen(hx, 3, hz);
  Object.assign(head.style, { left: hsx + 'px', top: hsy + 'px', opacity: hok && t > T0 && t < T1 ? 1 : 0 });
  avoid.push([hsx - 40, hsy - 40, hsx + 40, hsy + 40]);
  const tp = t - (T1 - 0.35), drop = tp < 0 ? -1 : tp < 0.35 ? -(1 - (tp / 0.35) ** 2) : 0;
  const bounce = tp > 0.35 ? Math.exp(-(tp - 0.35) * 7) * Math.sin((tp - 0.35) * 22) * 0.18 : 0;
  const [psx, psy, ok] = screen(tx, 3, tz);
  const pin = $('pin'), ps = $('pinShadow');
  pin.style.left = psx + 'px'; pin.style.top = psy + drop * 320 + 'px'; pin.style.opacity = tp < 0 || !ok ? 0 : 1;
  pin.style.transform = `scale(${1 + bounce}, ${1 - bounce})`;
  ps.style.left = psx + 'px'; ps.style.top = psy + 'px'; ps.style.opacity = tp < 0 || !ok ? 0 : 1 + drop * 0.8;
  tagTo.style.left = psx + 'px'; tagTo.style.top = psy - 160 + 'px'; tagTo.style.opacity = ok ? sstep(T1 + 0.3, T1 + 0.8, t) : 0;
  tagTo.style.transform = `translate(-50%,-100%) scale(${mix(0.7, 1, sstep(T1 + 0.3, T1 + 0.8, t))})`;
  if (t > T1 - 0.5) avoid.push([psx - 220, psy - 260, psx + 220, psy + 20]);
  updateLabels(t, cx, cz, D, avoid);
  // bandeau « quartier traversé » : quartier/commune le plus proche de la tête du trait
  let zn = null, zd = Infinity; for (const z of ZONES) { const d = Math.hypot(z.x - hx, z.z - hz) * (z.rank >= 2 ? 0.8 : 1); if (d < zd) { zd = d; zn = z; } }
  const zEl = $('zone'), name = CFG.toZone && Math.hypot(hx - tx, hz - tz) < 1500 ? CFG.toZone : CFG.fromZone && Math.hypot(hx - fx, hz - fz) < 900 ? CFG.fromZone : zn.n;
  if (zEl.dataset.n !== name) { zEl.dataset.n = name; zEl.querySelector('b').textContent = name; zEl.dataset.t = t; }
  const zt = t - Number(zEl.dataset.t || 0);
  zEl.style.opacity = sstep(0.6, 1.2, t) * (Math.abs(zt) > 0.2 || zt < 0 ? 1 : sstep(0, 0.2, zt));
  zEl.style.transform = `translateY(${Math.abs(zt) > 0.25 || zt < 0 ? 0 : (1 - sstep(0, 0.25, zt)) * 18}px)`;

  // virage en cours
  const tEl = $('turn'); let cur = null;
  for (const tn of TURNS) if (s > tn.s - (tn.before || 260) && s < tn.s + 40 && t < T1 + 0.2) cur = tn;
  if (tEl) {
    if (cur && tEl.dataset.k !== cur.name) { tEl.dataset.k = cur.name; tEl.innerHTML = `<b>${cur.dir === 'gauche' ? '⬅' : cur.dir === 'droite' ? '➡' : '⬆'}</b><div><span>${cur.dir === 'gauche' ? 'Tournez à gauche' : cur.dir === 'droite' ? 'Tournez à droite' : cur.dir}</span>${cur.name}</div>`; }
    tEl.style.opacity = cur ? 1 : 0; tEl.style.transform = `translateX(-50%) scale(${cur ? 1 : 0.9})`;
  }
  // carte finale
  const end = $('endcard'); if (end) { const e = sstep(DUR - 4.2, DUR - 3.2, t); end.style.opacity = e; end.style.transform = `translate(-50%, ${(1 - e) * 40}px)`; }

  renderer.render(scene, camera);
};

await document.fonts.ready;
window.EPISODE = { duration: DUR, fps: FPS, width: W, height: H };
window.renderFrame(Number(q.get('t') || 0));
window.READY = true;
