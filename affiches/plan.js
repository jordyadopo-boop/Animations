// Affiche-plan d'itinéraire (SVG) aux couleurs du mariage. Données réelles : OpenStreetMap (OpenFreeMap) + OSRM.
const NAME = new URLSearchParams(location.search).get('name') || 'koumassi_mockeyville';
const D = await (await fetch(`/affiches/data/${NAME}/plan.json`)).json();
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
const C = { land: '#2b0c47', land2: '#311052', water: '#3d2f8f', water2: '#4a3aa3', green: '#35184f', minor: '#46256a', sec: '#6c4b98', main: '#9a7cc8', gold: '#d8b04c', gold2: '#f0d27a', lilac: '#d6a6f2', pale: '#ece6f7', magenta: '#c02aa6', bg: '#1c0533' };

// ---------- itinéraire, distances ----------
const K = Math.cos(5.25 * Math.PI / 180);
const m = ([lo, la], [lo2, la2]) => Math.hypot((lo - lo2) * 111320 * K, (la - la2) * 110570);
const R = D.route, cum = [0]; for (let i = 1; i < R.length; i++) cum.push(cum[i - 1] + m(R[i], R[i - 1]));
const LEN = cum.at(-1), SCALE = D.distance / LEN;
const along = (p) => { let best = [1e9, 0, 0]; for (let i = 0; i < R.length - 1; i++) { const d = m(p, R[i]); if (d < best[0]) best = [d, cum[i] * SCALE, i]; } return best; };
const side = (p) => { const [, , i] = along(p), a = R[Math.max(0, i - 3)], b = R[Math.min(R.length - 1, i + 3)]; const cr = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]); return cr > 0 ? 'gauche' : 'droite'; };
const poi = (n) => (D.pois.find((p) => p.n === n) || {}).p;
const place = (n) => (D.places.find((p) => p.n === n) || {}).p;
const km = (x) => (x / 1000).toFixed(1).replace('.', ',') + ' km';

// repères (dans l'ordre du trajet)
const airport = poi('Aéroport International Félix Houphouët-Boigny');
const turns = D.steps.filter((s) => s.type === 'turn');
const STEPS = [
  { p: D.from.slice().reverse(), t: 'Grand Carrefour de Koumassi', s: 'Départ : Bd Félix Houphouët-Boigny, direction Port-Bouët', lab: 'Grand Carrefour de Koumassi' },
  { p: poi('Statue Akwaba'), t: 'Carrefour Akwaba (statue Akwaba)', s: 'Tout droit : Bd Jean-Baptiste Mockey, le long de la mer', lab: 'Carrefour Akwaba' },
  { p: airport, t: 'Aéroport Félix Houphouët-Boigny', s: `L'aéroport est sur votre ${side(airport)}`, lab: 'Aéroport FHB' },
  { p: place('Gonzagueville'), t: 'Gonzagueville', s: 'Rester sur le Bd Jean-Baptiste Mockey', lab: 'Gonzagueville' },
  { p: D.steps.find((s) => s.name === 'Ancien A100').loc, t: 'Bretelle « Ancien A100 »', s: 'Serrer à droite : ancienne route de Bassam. Ne pas prendre l\'autoroute (péage)', lab: 'Sortie Ancien A100', key: true },
  { p: poi("Saint-Joseph artisan d'Anani"), t: 'Anani', s: 'Église Saint-Joseph Artisan, toujours tout droit', lab: 'Anani' },
  { p: poi('Saint-Jacques de Modeste'), t: 'Modeste', s: 'Saint-Jacques de Modeste', lab: 'Modeste' },
  { p: place('Azuretti'), t: 'Azuretti', s: 'Continuer sur l\'ancienne route jusqu\'à Mockeyville', lab: 'Azuretti' },
  { p: turns[0].loc, t: 'Mockeyville : tourner à gauche', s: `puis à droite après ${Math.round(turns[0].d / 10) * 10} m`, lab: 'Mockeyville', mainMap: false },
];
for (const s of STEPS) { const [d, k] = along(s.p); s.km = k; s.dist = d; }
STEPS[0].km = 0;
const TOLL = poi('Péage de Grand-Bassam');

// ---------- liste des repères ----------
const list = document.getElementById('list');
STEPS.forEach((s, i) => list.insertAdjacentHTML('beforeend', `<div class="st"><div class="n">${i + 1}</div><div class="t">${s.t}<i>${s.dist > 300 ? '≈ ' : ''}${km(s.km)}</i><span>${s.s}</span></div></div>`));
list.insertAdjacentHTML('beforeend', `<div class="st"><div class="n star">♥</div><div class="t">Cour familiale de la mariée<i>${km(D.distance)} · ~${Math.round(D.duration / 60)} min</i><span>À côté du Terrain synthétique Didier Drogba</span></div></div>`);
document.getElementById('tip').innerHTML = `<b>Astuce :</b> après Port-Bouët, ne prenez pas l'autoroute de Grand-Bassam. Prenez la bretelle <b>« Ancien A100 »</b> à droite (repère ${STEPS.findIndex((s) => s.key) + 1}) et restez sur l'ancienne route : aucun péage jusqu'à Mockeyville.`;

// ---------- dessin d'une carte ----------
function drawMap(svg, Wd, Hd, center, mPerPx, opts) {
  const [clo, cla] = center;
  const P = ([lo, la]) => [Wd / 2 + (lo - clo) * 111320 * K / mPerPx, Hd / 2 - (la - cla) * 110570 / mPerPx];
  const path = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + P(p).map((v) => v.toFixed(1)).join(',')).join('');
  const defs = el('defs', {}, svg);
  const glow = el('filter', { id: svg.id + 'glow', x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
  el('feGaussianBlur', { stdDeviation: opts.glow || 6 }, glow);
  el('rect', { width: Wd, height: Hd, fill: C.land }, svg);
  // un tracé par polygone : les tuiles se recouvrent, un seul tracé « evenodd » y percerait des trous
  const gG = el('g', { fill: C.green, 'fill-rule': 'evenodd' }, svg); for (const pl of D.green) el('path', { d: pl.map((r) => path(r) + 'Z').join('') }, gG);
  const gW = el('g', { fill: C.water, 'fill-rule': 'evenodd', stroke: C.water, 'stroke-width': 0.8 }, svg); for (const pl of D.water) el('path', { d: pl.map((r) => path(r) + 'Z').join('') }, gW);
  const cls = (c) => (['motorway', 'trunk', 'primary'].includes(c) ? 'main' : ['secondary', 'tertiary'].includes(c) ? 'sec' : 'minor');
  const groups = { minor: [], sec: [], main: [] };
  for (const r of D.roads) if (r.c !== 'pier' && (opts.service || r.c !== 'service')) groups[cls(r.c)].push(path(r.p));
  const w = opts.roadW;
  for (const k of ['minor', 'sec', 'main']) el('path', { d: groups[k].join(''), fill: 'none', stroke: C[k], 'stroke-width': w[k], 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
  return { P, path, defs, Wd, Hd, boxes: [] };
}
const routeOn = (svg, { path }, pts, w, id) => {
  const d = path(pts);
  el('path', { d, fill: 'none', stroke: C.gold, 'stroke-width': w * 2.6, opacity: 0.45, filter: `url(#${id}glow)`, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
  el('path', { d, fill: 'none', stroke: C.bg, 'stroke-width': w + 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
  el('path', { d, fill: 'none', stroke: C.gold, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
  el('path', { d, fill: 'none', stroke: C.gold2, 'stroke-width': w * 0.28, 'stroke-dasharray': '1 14', 'stroke-linecap': 'round', opacity: 0.9 }, svg);
};
const text = (svg, x, y, str, o = {}) => {
  const lines = String(str).split('\n'), g = el('g', {}, svg);
  lines.forEach((ln, i) => {
    const a = { x, y: y + i * (o.size || 20) * 1.1, 'font-family': o.font || 'Playfair', 'font-size': o.size || 20, 'font-weight': o.weight || 700, 'text-anchor': o.anchor || 'middle', fill: o.fill || '#fff', 'letter-spacing': o.ls || 0 };
    if (o.italic) a['font-style'] = 'italic';
    if (o.haloW !== 0) el('text', { ...a, stroke: o.halo || C.bg, 'stroke-width': o.haloW ?? 6, 'stroke-linejoin': 'round', opacity: o.op ?? 1 }, g).textContent = ln;
    el('text', { ...a, opacity: o.op ?? 1 }, g).textContent = ln;
  });
  return g;
};
const hit = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
// essaie plusieurs positions autour du point et garde la première qui ne chevauche rien
function placeLabel(svg, M, x, y, str, o, r = 20) {
  const cands = o.cands || [[0, -r - 10, 'middle'], [0, r + 22, 'middle'], [r + 8, 6, 'start'], [-r - 8, 6, 'end'], [r, -r - 4, 'start'], [-r, -r - 4, 'end'], [r, r + 18, 'start'], [-r, r + 18, 'end']];
  for (const [dx, dy, anchor] of cands) {
    const g = text(svg, x + dx, y + dy, str, { ...o, anchor });
    const b = g.getBBox(), bb = { x: b.x - 4, y: b.y - 2, width: b.width + 8, height: b.height + 4 };
    if (bb.x > 8 && bb.y > 8 && bb.x + bb.width < M.Wd - 8 && bb.y + bb.height < M.Hd - 8 && !M.boxes.some((q) => hit(bb, q))) { M.boxes.push(bb); return g; }
    g.remove();
  }
  return null;
}
const marker = (svg, M, [x, y], label, o = {}) => {
  const r = o.r || 17;
  el('circle', { cx: x, cy: y, r: r + 5, fill: C.bg, opacity: 0.85 }, svg);
  el('circle', { cx: x, cy: y, r, fill: o.fill || C.gold, stroke: o.stroke || C.bg, 'stroke-width': 2 }, svg);
  el('text', { x, y: y + r * 0.36, 'text-anchor': 'middle', 'font-family': 'Playfair', 'font-weight': 900, 'font-size': r * 1.05, fill: o.color || C.bg }, svg).textContent = label;
  M.boxes.push({ x: x - r - 4, y: y - r - 4, width: 2 * r + 8, height: 2 * r + 8 });
};

// ---------- carte principale ----------
{
  const svg = document.getElementById('map'), Wd = 1000, Hd = 600;
  const lo = R.map((p) => p[0]), la = R.map((p) => p[1]);
  const center = [(Math.min(...lo) + Math.max(...lo)) / 2, (Math.min(...la) + Math.max(...la)) / 2 - 0.004];
  const mPerPx = ((Math.max(...lo) - Math.min(...lo)) * 111320 * K) / (Wd - 210);
  const M = drawMap(svg, Wd, Hd, center, mPerPx, { roadW: { minor: 0.8, sec: 1.6, main: 3.2 }, glow: 7 });
  const auto = D.roadNames.filter((r) => /autoroute/i.test(r.n));
  el('path', { d: auto.map((r) => M.path(r.p)).join(''), fill: 'none', stroke: C.lilac, 'stroke-width': 4, 'stroke-dasharray': '10 8', opacity: 0.8 }, svg);
  routeOn(svg, M, R, 8, 'map');
  // zones réservées : légende, échelle, boussole
  M.boxes.push({ x: 20, y: Hd - 125, width: 345, height: 110 }, { x: Wd - 230, y: Hd - 85, width: 220, height: 75 }, { x: 25, y: 25, width: 95, height: 95 });
  // marqueurs d'abord, étiquettes ensuite
  const pts = STEPS.map((s) => M.P(s.p));
  STEPS.forEach((s, i) => { if (s.mainMap !== false) marker(svg, M, pts[i], i + 1); });
  const [ax, ay] = M.P(D.to.slice().reverse());
  el('circle', { cx: ax, cy: ay, r: 34, fill: 'none', stroke: C.gold, 'stroke-width': 2, opacity: 0.7 }, svg);
  marker(svg, M, [ax, ay], '♥', { r: 21, fill: C.magenta, stroke: C.gold, color: '#fff' });
  let tg = null;
  if (TOLL) {
    const [x, y] = M.P(TOLL);
    el('circle', { cx: x, cy: y, r: 16, fill: C.bg, stroke: C.magenta, 'stroke-width': 4 }, svg);
    el('path', { d: `M${x - 8},${y - 8}L${x + 8},${y + 8}M${x + 8},${y - 8}L${x - 8},${y + 8}`, stroke: C.magenta, 'stroke-width': 4.5, 'stroke-linecap': 'round' }, svg);
    M.boxes.push({ x: x - 20, y: y - 20, width: 40, height: 40 });
    tg = [x, y];
  }
  placeLabel(svg, M, ax, ay, 'Cour familiale\nde la mariée', { size: 20, fill: C.gold2 }, 28);
  if (tg) placeLabel(svg, M, tg[0], tg[1], 'Péage de Bassam\nà éviter', { size: 17, fill: '#f4b6ea' }, 18);
  STEPS.forEach((s, i) => { if (s.mainMap !== false) placeLabel(svg, M, ...pts[i], s.lab, { size: 18 }); });
  // quartiers (seulement s'il reste de la place)
  const Q = [['Koumassi', 'suburb'], ['Port-Bouët', 'suburb'], ['Vridi', null], ['Gbamblé', 'village'], ['Mockeyville', 'suburb'], ['Biétri', 'suburb'], ['Petit Bassam', 'suburb'], ['Marcory', 'suburb'], ['Grand-Bassam', null], ['Abouabou', null], ['Zone 4C', null]];
  for (const [n, c] of Q) {
    const p = D.places.find((x) => x.n.replace(/ /g, ' ') === n && (!c || x.c === c)); if (!p) continue;
    const [x, y] = M.P(p.p);
    placeLabel(svg, M, x, y, n.toUpperCase(), { size: 16, fill: C.lilac, ls: 3, op: 0.9, haloW: 5, cands: [[0, 6, 'middle'], [0, -14, 'middle'], [0, 24, 'middle']] });
  }
  placeLabel(svg, M, ...M.P([-3.87, 5.19]), 'Océan Atlantique', { size: 30, italic: true, weight: 400, fill: C.pale, op: 0.75, ls: 2, haloW: 0, cands: [[0, 0, 'middle'], [60, 20, 'middle'], [-60, 20, 'middle']] });
  placeLabel(svg, M, ...M.P([-3.86, 5.282]), 'Lagune Ébrié', { size: 26, italic: true, weight: 400, fill: C.pale, op: 0.7, ls: 2, haloW: 0, cands: [[0, 0, 'middle'], [0, -30, 'middle'], [80, -20, 'middle']] });
  // boussole + échelle + légende
  const g = el('g', { transform: 'translate(72,75)' }, svg);
  el('circle', { r: 32, fill: C.bg, opacity: 0.8, stroke: C.gold, 'stroke-width': 1.5 }, g);
  el('path', { d: 'M0,-24 L9,6 L0,0 L-9,6Z', fill: C.gold }, g); el('path', { d: 'M0,24 L9,-6 L0,0 L-9,-6Z', fill: C.gold, opacity: 0.35 }, g);
  el('text', { y: -8, x: 18, 'font-family': 'Playfair', 'font-weight': 900, 'font-size': 15, fill: C.gold }, g).textContent = 'N';
  const px5 = 5000 / mPerPx, sb = el('g', { transform: `translate(${Wd - 40 - px5},${Hd - 34})` }, svg);
  el('rect', { x: -14, y: -32, width: px5 + 28, height: 50, rx: 10, fill: C.bg, opacity: 0.75 }, sb);
  el('path', { d: `M0,0H${px5}M0,-7V7M${px5 / 2},-5V5M${px5},-7V7`, stroke: C.gold, 'stroke-width': 3 }, sb);
  el('text', { x: px5 / 2, y: -12, 'text-anchor': 'middle', 'font-family': 'Playfair', 'font-weight': 700, 'font-size': 16, fill: C.gold }, sb).textContent = '5 km';
  const lg = el('g', { transform: `translate(34,${Hd - 86})` }, svg);
  el('rect', { x: -12, y: -26, width: 330, height: 82, rx: 12, fill: C.bg, opacity: 0.8 }, lg);
  el('path', { d: 'M0,-4H46', stroke: C.gold, 'stroke-width': 8, 'stroke-linecap': 'round' }, lg);
  el('text', { x: 60, y: 2, 'font-family': 'Playfair', 'font-weight': 700, 'font-size': 17, fill: '#fff' }, lg).textContent = 'Itinéraire conseillé (sans péage)';
  el('path', { d: 'M0,30H46', stroke: C.lilac, 'stroke-width': 4, 'stroke-dasharray': '10 8' }, lg);
  el('text', { x: 60, y: 36, 'font-family': 'Playfair', 'font-weight': 400, 'font-style': 'italic', 'font-size': 17, fill: C.pale }, lg).textContent = 'Autoroute à péage, à éviter';
}

// ---------- encart arrivée ----------
{
  const svg = document.getElementById('inset'), Wd = 420, Hd = 430;
  const to = D.to.slice().reverse(), turn = turns[0].loc;
  const center = [(to[0] + turn[0]) / 2 - 0.0009, (to[1] + turn[1]) / 2 + 0.0002];
  const M = drawMap(svg, Wd, Hd, center, 2.5, { roadW: { minor: 4.5, sec: 8, main: 12 }, service: true, glow: 5 });
  const s0 = cum.findIndex((c) => c > LEN - 1900);
  routeOn(svg, M, R.slice(Math.max(0, s0)), 7, 'inset');
  const [tx, ty] = M.P(turn); marker(svg, M, [tx, ty], 9, { r: 15 });
  const [ax, ay] = M.P(to);
  el('circle', { cx: ax, cy: ay, r: 30, fill: 'none', stroke: C.gold, 'stroke-width': 2, opacity: 0.8 }, svg);
  marker(svg, M, [ax, ay], '♥', { r: 19, fill: C.magenta, stroke: C.gold, color: '#fff' });
  const drog = poi('Terrain synthétique Didier Drogba'), bs = poi('BrightSteps Internation School');
  let dg = null;
  if (drog) { const [x, y] = M.P(drog); el('rect', { x: x - 21, y: y - 14, width: 42, height: 28, rx: 4, fill: '#3f7a3a', stroke: '#fff', 'stroke-width': 2 }, svg); el('path', { d: `M${x},${y - 14}V${y + 14}`, stroke: '#fff', 'stroke-width': 1.5 }, svg); el('circle', { cx: x, cy: y, r: 5, fill: 'none', stroke: '#fff', 'stroke-width': 1.5 }, svg); M.boxes.push({ x: x - 24, y: y - 17, width: 48, height: 34 }); dg = [x, y]; }
  placeLabel(svg, M, ax, ay, 'Cour familiale\nde la mariée', { size: 19, fill: C.gold2 }, 26);
  if (dg) placeLabel(svg, M, dg[0], dg[1], 'Terrain Drogba', { size: 16 }, 18);
  if (bs) { const [x, y] = M.P(bs); el('circle', { cx: x, cy: y, r: 6, fill: C.lilac, stroke: C.bg, 'stroke-width': 2 }, svg); M.boxes.push({ x: x - 8, y: y - 8, width: 16, height: 16 }); placeLabel(svg, M, x, y, 'BrightSteps School', { size: 14, fill: C.pale, haloW: 5 }, 8); }
  placeLabel(svg, M, tx, ty, 'à gauche', { size: 15, fill: C.gold2, italic: true, weight: 400 }, 16);
  // nom de l'ancienne route le long de son tracé visible
  const ra = D.roadNames.filter((r) => /Ancienne Route de Bassam/.test(r.n)).flatMap((r) => r.p).map(M.P).filter(([x, y]) => x > 40 && x < Wd - 40 && y > 40 && y < Hd - 40);
  if (ra.length > 1) { ra.sort((a, b) => a[0] - b[0]); const [x1, y1] = ra[0], [x2, y2] = ra.at(-1); const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI; const g = el('g', { transform: `translate(${(x1 + x2) / 2},${(y1 + y2) / 2 + 22}) rotate(${ang})` }, svg); text(g, 0, 0, 'Ancienne route de Bassam', { size: 14, fill: C.gold2, italic: true, weight: 400, haloW: 4 }); }
  // boussole
  const g = el('g', { transform: `translate(${Wd - 34},34)` }, svg);
  el('circle', { r: 20, fill: C.bg, opacity: 0.8, stroke: C.gold, 'stroke-width': 1.2 }, g);
  el('path', { d: 'M0,-14 L6,4 L0,0 L-6,4Z', fill: C.gold }, g);
  const px = 200 / 2.5, sb = el('g', { transform: `translate(24,${Hd - 22})` }, svg);
  el('path', { d: `M0,0H${px}M0,-5V5M${px},-5V5`, stroke: C.gold, 'stroke-width': 2.5 }, sb);
  text(sb, px / 2, -9, '200 m', { size: 13, fill: C.gold, haloW: 4 });
}

// ---------- pagne (motif zigzag en pixels, d'après le vrai pagne) ----------
{
  const svg = document.getElementById('pagne'), cw = 9.33, cols = 12, rows = Math.ceil(1800 / cw);
  el('rect', { width: 112, height: 1800, fill: '#c3bbf0' }, svg);
  let out = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const ph = (r % 24) / 24, x0 = 2 + 8 * (ph < 0.5 ? ph * 2 : 2 - ph * 2), d = Math.abs(c - x0);
    const col = d < 1.6 ? ((r + c) % 3 ? '#6a2690' : '#4f1a78') : d < 2.6 ? '#9c49b9' : d < 3.3 ? '#d79ae3' : (r + c) % 2 ? '#a69ef0' : '#b2aaf4';
    out += `<rect x="${(c * cw + 1.3).toFixed(1)}" y="${(r * cw + 1.3).toFixed(1)}" width="${(cw - 2.6).toFixed(1)}" height="${(cw - 2.6).toFixed(1)}" rx="1.6" fill="${col}"/>`;
  }
  svg.insertAdjacentHTML('beforeend', out);
  el('rect', { x: 0, width: 5, height: 1800, fill: C.gold }, svg);
}

// ---------- ornements (fleurs et alliances, comme sur l'invitation) ----------
{
  const svg = document.getElementById('orn'), g = el('g', { stroke: '#5b2d86', fill: 'none', 'stroke-width': 1.6, opacity: 0.9 }, svg);
  const flower = (x, y) => { el('circle', { cx: x, cy: y, r: 5 }, g); for (let a = 0; a < 4; a++) { const r = a * Math.PI / 2; el('ellipse', { cx: x + Math.cos(r) * 14, cy: y + Math.sin(r) * 14, rx: 8, ry: 4.2, transform: `rotate(${a * 90} ${x + Math.cos(r) * 14} ${y + Math.sin(r) * 14})` }, g); } };
  for (const y of [70, 215, 360]) { flower(42, y); flower(1046, y); }
  const rings = (x, y) => { el('circle', { cx: x, cy: y, r: 15 }, g); el('circle', { cx: x + 14, cy: y, r: 15 }, g); };
  rings(140, 165); rings(960, 250); rings(170, 1720); rings(940, 1715);
}

await document.fonts.ready;
window.READY = true;
