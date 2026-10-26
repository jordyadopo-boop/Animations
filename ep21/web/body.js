const SETS = {};
// ---------- helpers
function card(text, o = {}) {
  const w = o.w ?? 2.2, h = o.h ?? 0.42, c = document.createElement('canvas'); c.width = 1024; c.height = Math.round(1024 * h / w);
  const g = c.getContext('2d');
  g.fillStyle = o.bg ?? 'rgba(14,10,8,0.82)'; g.strokeStyle = o.border ?? '#e0b070'; g.lineWidth = 8;
  g.beginPath(); g.roundRect(6, 6, c.width - 12, c.height - 12, 34); g.fill(); g.stroke();
  g.fillStyle = o.color ?? '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const lines = text.split('\n'); let fs = o.font ?? Math.min(110, c.height / (lines.length * 1.3));
  g.font = `bold ${fs}px Inter`;
  const mw = Math.max(...lines.map(l => g.measureText(l).width)); if (mw > c.width * 0.9) { fs = fs * c.width * 0.9 / mw; g.font = `bold ${fs}px Inter`; }
  lines.forEach((l, i) => { if (i > 0 && o.small) { g.font = `600 ${fs * 0.72}px Inter`; g.fillStyle = o.subColor ?? '#e2dccf'; } g.fillText(l, c.width / 2, c.height / 2 + (i - (lines.length - 1) / 2) * fs * 1.18); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, depthTest: false, fog: false, toneMapped: false, color: new THREE.Color(0.85, 0.85, 0.85) })); mesh.renderOrder = 20; return mesh;
}
function camCard(cam, c, frac = 0.86, yf = 0.36) {
  const w = c.geometry.parameters.width, th = Math.tan(cam.fov * Math.PI / 360), d = w / (frac * 2 * th * cam.aspect);
  const dir = new THREE.Vector3(); cam.getWorldDirection(dir); const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
  c.position.copy(cam.position).addScaledVector(dir, d).addScaledVector(up, d * th * yf); c.quaternion.copy(cam.quaternion);
}
function cardsMgr(scene, cam) {
  const cards = [];
  const K = (text, o, show, yf = -0.55, frac = 0.82) => { const c = card(text, o); scene.add(c); cards.push([c, show, yf, frac]); return c; };
  K.update = (t) => cards.forEach(([c, show, yf, frac]) => { fade(c, show(t)); camCard(cam, c, frac, yf); });
  return K;
}
const imagined = (K, text, a, b) => K(text, { w: 0.9, h: 0.2, border: '#ffd070', color: '#ffe0a0' }, t => win(t, a, b, 0.2, 0.2), -0.42, 0.42);
function studioBase(o = {}) {
  const B = base({ bg: 0x07060c, fog: [0x07060c, 8, 30], hemi: [0xb0a8c8, 0x18141c, 1.0], sun: [0xffffff, 1.0, [2, 5, 4]], shadow: false, bloom: [0.5, 0.5, 0.82], ...o });
  const grid = new THREE.GridHelper(40, 40, new THREE.Color(0xd99a57).multiplyScalar(0.9), new THREE.Color(0xd99a57).multiplyScalar(0.25)); B.scene.add(grid);
  return B;
}
// eclairage de face pour les visages
function faceLight(scene, pos, k = 1.6, c = 0xfff0e0) { const l = new THREE.PointLight(c, k, 4, 1.2); l.position.set(...pos); scene.add(l); return l; }
function mustache(h, c = 0x2a1a10) { h.neck.add(at(box(0.13, 0.026, 0.03, M(c)), 0, 0.123, 0.152)); }
function glasses(h) {
  const m = M(0x1a1a1a);
  for (const s of [-1, 1]) { h.neck.add(at(box(0.075, 0.012, 0.012, m), s * 0.055, 0.225, 0.158)); h.neck.add(at(box(0.075, 0.012, 0.012, m), s * 0.055, 0.165, 0.158)); h.neck.add(at(box(0.012, 0.06, 0.012, m), s * 0.092, 0.195, 0.158)); }
  h.neck.add(at(box(0.035, 0.01, 0.01, m), 0, 0.2, 0.16));
}

// ---------- l'ecriture inconnue : glyphes dessines (imitation, pas le vrai texte)
function drawGlyph(g, x, y, s, r) {
  const k = Math.floor(r() * 9);
  g.beginPath();
  if (k === 0) { g.arc(x + s * 0.3, y, s * 0.3, 0, Math.PI * 2); }
  else if (k === 1) { g.arc(x + s * 0.3, y - s * 0.3, s * 0.22, 0, Math.PI * 2); g.moveTo(x + s * 0.3, y - s * 0.08); g.arc(x + s * 0.3, y + s * 0.2, s * 0.25, -Math.PI / 2, Math.PI * 1.5); }
  else if (k === 2) { g.arc(x + s * 0.35, y, s * 0.3, Math.PI * 0.25, Math.PI * 1.75); }
  else if (k === 3) { g.moveTo(x, y + s * 0.3); g.lineTo(x + s * 0.1, y - s * 0.8); g.quadraticCurveTo(x + s * 0.5, y - s * 1.0, x + s * 0.45, y - s * 0.2); g.moveTo(x - s * 0.1, y - s * 0.3); g.lineTo(x + s * 0.8, y - s * 0.35); g.moveTo(x + s * 0.45, y - s * 0.2); g.quadraticCurveTo(x + s * 0.7, y + s * 0.4, x + s * 0.9, y - s * 0.6); }
  else if (k === 4) { g.moveTo(x, y + s * 0.3); g.quadraticCurveTo(x + s * 0.1, y - s * 0.4, x + s * 0.3, y + s * 0.3); g.quadraticCurveTo(x + s * 0.45, y - s * 0.4, x + s * 0.6, y + s * 0.3); }
  else if (k === 5) { g.moveTo(x, y - s * 0.3); g.quadraticCurveTo(x + s * 0.6, y - s * 0.4, x + s * 0.2, y + s * 0.1); g.quadraticCurveTo(x + s * 0.7, y + s * 0.2, x + s * 0.5, y + s * 0.7); }
  else if (k === 6) { g.arc(x + s * 0.3, y, s * 0.28, Math.PI * 0.9, Math.PI * 2.1); g.lineTo(x + s * 0.7, y + s * 0.4); }
  else if (k === 7) { g.moveTo(x + s * 0.1, y - s * 0.5); g.lineTo(x + s * 0.15, y + s * 0.3); g.moveTo(x + s * 0.4, y - s * 0.5); g.lineTo(x + s * 0.45, y + s * 0.3); g.moveTo(x, y - s * 0.1); g.quadraticCurveTo(x + s * 0.3, y - s * 0.4, x + s * 0.6, y - s * 0.1); }
  else { g.moveTo(x, y); g.quadraticCurveTo(x + s * 0.25, y - s * 0.35, x + s * 0.4, y); g.quadraticCurveTo(x + s * 0.55, y + s * 0.35, x + s * 0.2, y + s * 0.6); }
  g.stroke();
  return s * (k === 3 ? 1.0 : 0.75);
}
function glyphCanvas(o = {}) {
  const c = document.createElement('canvas'); c.width = o.W ?? 1024; c.height = o.H ?? 1024;
  const g = c.getContext('2d'); let seed = o.seed ?? 7; const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  if (o.bg) { g.fillStyle = o.bg; g.fillRect(0, 0, c.width, c.height); }
  g.strokeStyle = o.ink ?? '#3a2a1a'; g.lineWidth = o.lw ?? 4; g.lineCap = 'round'; g.lineJoin = 'round';
  const s = o.size ?? 34, lh = s * 1.9, words = []; let y = o.top ?? s * 1.6;
  while (y < c.height - s) {
    let x = o.margin ?? s; const row = [];
    while (x < c.width - (o.margin ?? s) - s * 3) {
      const n = 3 + Math.floor(r() * 4), x0 = x;
      for (let i = 0; i < n; i++) x += drawGlyph(g, x, y, s, r);
      row.push([x0, y, x - x0]); x += s * 0.8;
    }
    words.push(...row); y += lh;
  }
  c.userData = { words, s };
  return c;
}
function canvasTex(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
// page holographique couverte de glyphes
function holoText(w, h, color = '#9af0ff', seed = 3) {
  const c = glyphCanvas({ W: 1024, H: Math.round(1024 * h / w), ink: color, lw: 5, size: 40, seed });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: canvasTex(c), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  m.userData.canvas = c; return m;
}

// ---------- les vraies pages (Beinecke MS 408, domaine public)
const PAGES = {};
await Promise.all(['80', '24', '160', '99', '121', '125', '158', '161', '186', '4'].map(async n => {
  const t = await new THREE.TextureLoader().loadAsync(`/assets/page${n}.jpg`); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; PAGES[n] = t;
}));
const aspect = (n) => PAGES[n].image.width / PAGES[n].image.height;
// page affichee telle quelle (non eclairee) : couleurs fideles
function realPage(n, h, o = {}) {
  const g = new THREE.Group(), w = h * aspect(n);
  const mat = new THREE.MeshBasicMaterial({ map: PAGES[n], toneMapped: false, transparent: true, fog: false, color: new THREE.Color(o.k ?? 0.86, o.k ?? 0.86, o.k ?? 0.86) });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); p.position.z = 0.006; g.add(p);
  if (o.back !== false) g.add(at(box(w + 0.04, h + 0.04, 0.01, M(0x1a1410)), 0, 0, -0.004));
  g.userData = { w, h, mat };
  return g;
}
function pview(pg, u, v, frac, fov = 40, side = 0) {
  const w = pg.userData.w, h = pg.userData.h;
  const lp = new THREE.Vector3((u - 0.5) * w, (0.5 - v) * h, 0); const d = frac * h / 2 / Math.tan(fov * Math.PI / 360);
  pg.updateWorldMatrix(true, false);
  const P = pg.localToWorld(new THREE.Vector3(lp.x + side * d, lp.y, d)), Lk = pg.localToWorld(lp.clone());
  return { p: [P.x, P.y, P.z], l: [Lk.x, Lk.y, Lk.z], f: fov };
}
// livre ouvert : deux pages eclairees (texture reelle ou glyphes)
function openBook(texL, texR, ph = 0.36) {
  const g = new THREE.Group();
  const aw = (tex) => tex.image ? tex.image.width / tex.image.height : 0.72;
  const pw = ph * 0.72;
  const cover = M(0xc8b48a);
  g.add(at(box(pw * 2 + 0.03, 0.02, ph + 0.03, cover), 0, 0.0, 0));
  for (const [s, tex] of [[-1, texL], [1, texR]]) {
    const pg = new THREE.Group(); pg.position.set(0, 0.012, 0); g.add(pg);
    pg.add(at(box(pw, 0.025, ph, M(0xe8dcc0)), s * pw / 2, 0.012, 0));
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), new THREE.MeshLambertMaterial({ map: tex, color: 0xffffff }));
    pl.rotation.x = -Math.PI / 2; pl.position.set(s * pw / 2, 0.026, 0); pg.add(pl);
    pg.rotation.z = -s * 0.08;
  }
  g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}
function closedBook(w = 0.24, h = 0.32, th = 0.07) {
  const g = new THREE.Group();
  g.add(box(w, th, h, M(0xd8c8a0)));
  g.add(at(box(w - 0.01, th - 0.02, h - 0.01, M(0xf0e6cc)), 0.008, 0, 0));
  g.traverse(m => { if (m.isMesh) m.castShadow = true; });
  return g;
}
function shelves(scene, x0, x1, z, rows = 4, seed = 1) {
  const wood = M(0x5a3a22);
  for (let r = 0; r <= rows; r++) scene.add(at(box(x1 - x0, 0.05, 0.35, wood), (x0 + x1) / 2, 0.3 + r * 0.55, z));
  for (const x of [x0, x1]) scene.add(at(box(0.06, rows * 0.55 + 0.35, 0.36, wood), x, (rows * 0.55 + 0.35) / 2, z));
  const cols = [0x7a3a2a, 0x3a4a2a, 0x8a6a3a, 0x2a2a3a, 0xa08a60, 0x5a2a3a, 0xc8b48a];
  for (let r = 0; r < rows; r++) { let x = x0 + 0.05; let i = 0; while (x < x1 - 0.1) { const bw = 0.05 + hash(seed + r * 50 + i) * 0.06, bh = 0.3 + hash(seed + i * 7 + r) * 0.17; scene.add(at(box(bw, bh, 0.26, M(cols[Math.floor(hash(seed + i * 3 + r * 11) * cols.length)])), x + bw / 2, 0.33 + r * 0.55 + bh / 2, z)); x += bw + 0.01; i++; } }
}
function dust(scene, n, cx, cy, cz, R, color = 0xffe0b0) {
  const pts = []; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.008, 0), G(color, 1.2)); scene.add(m); pts.push(m); }
  return (t) => pts.forEach((m, i) => { const ph = (t * 0.03 + hash(i)) % 1; m.position.set(cx + (hash(i * 3) - 0.5) * R * 2 + 0.1 * Math.sin(t * 0.4 + i), cy + (ph - 0.5) * R * 1.6, cz + (hash(i * 7) - 0.5) * R); });
}

// ---------- intro : les pages flottent dans le noir
SETS.intro = () => {
  const B = base({ bg: 0x06050a, fog: [0x06050a, 6, 16], hemi: [0xffe8c8, 0x141018, 0.7], sun: [0xffd8a0, 0.8, [1, 4, 3]], shadow: false, bloom: [0.55, 0.5, 0.9] });
  const { scene, cam } = B;
  const names = ['161', '24', '80', '158', '160', '125', '99'];
  const pages = names.map((n, i) => { const a = (i - 3) * 0.42; const pg = realPage(n, 1.5); pg.position.set(Math.sin(a) * 3.0, 1.55 + (i % 2 ? 0.15 : -0.1), -Math.cos(a) * 3.0); pg.lookAt(0, 1.55, 0); scene.add(pg); return pg; });
  const hero = pages[2];
  const floaters = []; for (let i = 0; i < 26; i++) { const m = holoText(0.5, 0.12, '#ffd8a0', 30 + i); scene.add(m); floaters.push(m); fade(m, 0.6); }
  const rig = claudeRig(scene, [-0.25, 0.0, 0.2], 0.25, [0.42, 0, 0.1], 0x55e6ff, 0.5, 0.3);
  const ht = holoText(0.7, 0.42, '#9af0ff', 5); rig.holoG.add(ht);
  const q = label('?', { w: 0.4, h: 0.4, color: '#ff8a6a', font: 'bold 300px Inter' }); q.position.set(0, 0.05, 0.05); rig.holoG.add(q);
  const flame = new THREE.PointLight(0xffb070, 3, 6, 1.4); flame.position.set(0, 1.4, 0.4); scene.add(flame);
  const dt = dust(scene, 60, 0, 1.6, -0.5, 2.4);
  return {
    ...B, update(t) {
      pages.forEach((pg, i) => { pg.position.y = 1.55 + (i % 2 ? 0.15 : -0.1) + 0.04 * Math.sin(t * 0.7 + i); });
      floaters.forEach((m, i) => { const ph = (t * 0.05 + hash(i * 5)) % 1; m.position.set((hash(i) - 0.5) * 4, 0.3 + ph * 3, -0.6 - hash(i * 2) * 1.8); m.lookAt(cam.position); fade(m, 0.5 * Math.sin(ph * Math.PI)); });
      const k = sstep(4.6, 5.6, t); fade(ht, k * 0.9); beamOn(rig, k, t); fade(q, sstep(5.8, 6.4, t) * (0.7 + 0.3 * Math.sin(t * 5)));
      ht.position.y = 0.05 * Math.sin(t * 1.5);
      rig.c.update(t, env('claude', t), { armsUp: 0.25 * win(t, C.aveu + 0.2, C.aveu + 2.0, 0.3, 0.4), squint: t > C.aveu && t < C.aveu + 1.2 });
      flame.intensity = 2.6 + 0.4 * Math.sin(t * 9) + 0.3 * Math.sin(t * 23);
      dt(t);
      const h0 = pview(hero, 0.5, 0.32, 0.55, 40), h1 = pview(hero, 0.5, 0.62, 0.6, 40);
      camKeys(cam, t, [{ t: 0, ...h0 }, { t: 3.4, ...h1 }, { t: 5.2, p: [0.0, 1.3, 2.6], l: [0, 1.15, -1.0], f: 46 }, { t: C.aveu, p: [0.0, 1.0, 2.7], l: [0.0, 0.8, 0.2], f: 44 }, { t: C.title, p: [0.0, 1.15, 3.1], l: [0, 1.05, -0.5], f: 46 }, { t: SC.villa.start, p: [0.0, 1.3, 3.4], l: [0, 1.2, -0.8], f: 46 }]);
    }
  };
};

// ---------- 1912 : Villa Mondragone
SETS.villa = () => {
  const B = base({ bg: 0x2a2018, hemi: [0xfff0d8, 0x3a2a1a, 0.9], sun: [0xffe8c0, 1.6, [3.5, 4.5, 1.5]], shadowSize: 5, bloom: [0.35, 0.5, 0.9], exposure: 1.15, target: [0, 0.8, -0.5] });
  const { scene, cam } = B;
  scene.add(at(box(10, 0.1, 8, M(0x6a4a32)), 0, -0.05, 0));
  scene.add(at(box(10, 4.2, 0.2, M(0xd8c8a8)), 0, 2.1, -2.6)); scene.add(at(box(0.2, 4.2, 8, M(0xcab898)), -3.2, 2.1, 0));
  for (let i = 0; i < 9; i++) scene.add(at(box(0.9, 0.02, 0.9, M(i % 2 ? 0x8a6a4a : 0x5a3a2a)), -3 + (i % 3) * 0.9, 0.005, -1.8 + Math.floor(i / 3) * 0.9));
  shelves(scene, -3.0, -0.9, -2.3, 4, 3);
  const win_ = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.7), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe8c0).multiplyScalar(0.95), toneMapped: false })); win_.position.set(1.7, 1.9, -2.49); scene.add(win_);
  for (const [x, y, w, h] of [[1.7, 1.9, 0.06, 1.7], [1.7, 1.9, 1.0, 0.06], [1.7, 2.8, 1.16, 0.1], [1.7, 1.0, 1.16, 0.1], [1.14, 1.9, 0.1, 1.9], [2.26, 1.9, 0.1, 1.9]]) scene.add(at(box(w, h, 0.08, M(0x6a4a2a)), x, y, -2.45));
  // table, coffre de manuscrits
  scene.add(at(box(1.5, 0.06, 0.8, M(0x7a4a2a)), 0, 0.75, -0.3)); for (const [x, z] of [[-0.68, -0.64], [0.68, -0.64], [-0.68, 0.04], [0.68, 0.04]]) scene.add(at(box(0.06, 0.75, 0.06, M(0x4a2a1a)), x, 0.37, z));
  const trunk = new THREE.Group(); trunk.position.set(1.3, 0, 0.3); trunk.rotation.y = -0.4; scene.add(trunk);
  trunk.add(at(box(0.8, 0.45, 0.5, M(0x5a3a22)), 0, 0.225, 0)); const lid = at(box(0.8, 0.05, 0.5, M(0x6a4a2a)), 0, 0.47, -0.25); lid.geometry.translate(0, 0, 0.25); lid.rotation.x = -1.9; trunk.add(lid);
  for (let i = 0; i < 5; i++) trunk.add(at(box(0.22, 0.06, 0.3, M([0xc8b48a, 0x7a3a2a, 0xa08a60, 0x3a4a2a, 0xd8c8a0][i])), -0.25 + i * 0.12, 0.42 + (i % 2) * 0.03, 0));
  for (let i = 0; i < 4; i++) scene.add(at(box(0.22, 0.06, 0.3, M([0x7a3a2a, 0xa08a60, 0x3a4a2a, 0x5a2a3a][i])), -0.55 + (i % 2) * 0.05, 0.81 + i * 0.06, -0.45).rotateY(i * 0.2));
  // Wilfrid Voynich (personne reelle, replique imaginee) et un pere jesuite
  const voy = new Human({ skin: 0xf0c8a8, hair: 0x2a1a10, hairStyle: 'short', top: 0xf0f0e8, bottom: 0x2a2a30, jacket: 0x2a2a34, seed: 2101 }); mustache(voy, 0x2a1a10); voy.place(0.0, 0, -0.95, 0); scene.add(voy.root);
  const pr = new Human({ skin: 0xc89a72, hair: 0x9a9a9a, hairStyle: 'bald', top: 0x18181c, bottom: 0x18181c, robe: 0x18181c, robeL: 0.82, seed: 2102 }); pr.place(0.95, 0, -1.0, -0.45); scene.add(pr.root);
  const book = closedBook(); scene.add(book);
  const open = openBook(PAGES['4'], PAGES['186'], 0.32); open.position.set(0.0, 0.79, -0.32); scene.add(open);
  faceLight(scene, [0.2, 1.7, 0.6], 1.8);
  const rig = claudeRig(scene, [-1.2, 0, 0.7], 0.45, [0.45, 0, 0.1], 0xffd070, 0.5, 0.3);
  const yale = label('MS 408', { w: 0.55, h: 0.16, color: '#ffd070', font: 'bold 130px Inter' }); yale.position.y = 0.05; rig.holoG.add(yale);
  const K = cardsMgr(scene, cam);
  K('WILFRID VOYNICH\nlibraire, d\'origine polonaise', { w: 1.6, h: 0.42, border: '#e0b070', small: true }, t => win(t, SC.villa.start + 6.5, C.voynich - 0.2, 0.3, 0.2));
  imagined(K, 'réplique imaginée', C.voynich, C.yale);
  K('UNIVERSITÉ YALE\nBibliothèque Beinecke · MS 408', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, C.yale + 2.6, SC.pages.start, 0.3, 0.2));
  return {
    ...B, update(t) {
      const opened = sstep(C.voynich - 0.6, C.voynich - 0.2, t);
      book.visible = opened < 0.5; open.visible = !book.visible;
      book.position.set(0.12, 1.12 - 0.3 * sstep(C.voynich - 1.4, C.voynich - 0.6, t), -0.65 + 0.3 * sstep(C.voynich - 1.4, C.voynich - 0.6, t)); book.rotation.set(-1.0 * (1 - sstep(C.voynich - 1.4, C.voynich - 0.6, t)), 0, 0);
      const hold = 1 - opened;
      voy.pose({ aL: [lerp(0.6, 0.75, opened), 0.1], aR: [lerp(0.9, 0.75, opened), 0.1], eL: lerp(1.4, 0.7, opened), eR: lerp(1.3, 0.7, opened), hp: lerp(0.1, 0.35, opened) * (t < C.voynich + 0.2 || t > C.voynich + 2.6 ? 1 : 0.2), lean: 0.12 * opened * hold });
      voy.face(env('voynich', t), t > C.voynich - 0.3 && t < C.yale ? 'happy' : 'neutral', t);
      pr.pose({ aL: [0.3, 0.1], aR: [0.5 + 0.2 * win(t, SC.villa.start + 3, SC.villa.start + 8), 0.15], eL: 0.8, eR: 1.2, hy: 0.25 }); pr.face(0, 'neutral', t);
      const yk = win(t, C.yale + 1.5, SC.pages.start, 0.4, 0.3); beamOn(rig, yk, t); fade(yale, yk); yale.lookAt(cam.position);
      rig.c.update(t, env('claude', t), {});
      const T0 = SC.villa.start;
      camKeys(cam, t, [{ t: T0, p: [0.9, 1.8, 3.4], l: [0.1, 1.2, -0.7], f: 46 }, { t: C.voynich - 2.2, p: [0.3, 1.6, 2.0], l: [0.05, 1.3, -0.8], f: 44 },
        { t: C.voynich, p: [0.25, 1.6, 0.6], l: [0.0, 1.45, -0.9], f: 42 }, { t: C.voynich + 2.4, p: [0.22, 1.58, 0.55], l: [0.0, 1.4, -0.9], f: 42 },
        { t: C.voynich + 3.2, p: [0.05, 1.4, 0.6], l: [0.0, 0.8, -0.3], f: 42 }, { t: C.yale + 1.4, p: [0.05, 1.35, 0.5], l: [0.0, 0.8, -0.3], f: 42 }, { t: C.yale + 2.4, p: [-0.6, 1.1, 3.0], l: [-0.95, 0.75, 0.6], f: 44 }, { t: SC.pages.start, p: [-0.7, 1.05, 2.8], l: [-0.95, 0.75, 0.6], f: 44 }]);
      K.update(t);
    }
  };
};

// ---------- les pages : herbier, etoiles, rosettes, texte
SETS.pages = () => {
  const B = base({ bg: 0x0a0806, fog: [0x0a0806, 7, 20], hemi: [0xffe8c8, 0x141018, 0.8], sun: [0xffffff, 0.6, [1, 3, 3]], shadow: false, bloom: [0.35, 0.5, 0.92] });
  const { scene, cam } = B;
  const P = {}; const spec = [['80', -4.4, 0], ['160', -2.2, 0.2], ['121', 0.5, 0], ['125', 3.0, 0.2], ['158', 5.3, 0], ['186', 7.6, 0.1]];
  for (const [n, x, z] of spec) { const pg = realPage(n, n === '121' || n === '158' ? 1.35 : 1.7); pg.position.set(x, 1.6, -z); scene.add(pg); P[n] = pg; }
  const ink = holoText(1.2, 1.3, '#ffd070', 11); ink.position.set(7.6, 1.6, -0.03); scene.add(ink);
  const dt = dust(scene, 50, 1.5, 1.6, 0.6, 6);
  const K = cardsMgr(scene, cam);
  K('≈ 240 PAGES\npresque aucune plante identifiée', { w: 1.6, h: 0.42, border: '#7dbf8a', small: true }, t => win(t, SC.pages.start + 1.2, C.etoiles, 0.3, 0.2));
  K('≈ 38 000 MOTS\nun alphabet inconnu', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, C.ecriture + 1.5, SC.labo.start, 0.3, 0.2));
  const T0 = SC.pages.start;
  const segs = [[T0, T0 + 2.9, '80', 0.5, 0.35, 0.75, 0.6], [T0 + 2.9, C.etoiles, '160', 0.5, 0.5, 0.9, 0.7], [C.etoiles, C.etoiles + 1.7, '121', 0.5, 0.45, 1.05, 0.9], [C.etoiles + 1.7, C.etoiles + 2.8, '125', 0.5, 0.45, 0.85, 0.75], [C.etoiles + 2.8, C.ecriture, '158', 0.5, 0.5, 1.15, 0.95], [C.ecriture, SC.labo.start, '186', 0.5, 0.45, 0.9, 0.55]];
  return {
    ...B, update(t) {
      fade(ink, 0.55 * win(t, C.ecriture + 2.5, SC.labo.start, 0.8, 0.4) * (0.7 + 0.3 * Math.sin(t * 3)));
      dt(t);
      const keys = [];
      segs.forEach(([a, b, n, u, v, f0, f1], i) => { keys.push({ t: a, ...pview(P[n], u, v, f0, 40) }); keys.push({ t: b - (i === segs.length - 1 ? 0 : 0.7), ...pview(P[n], u, v + (i === 0 ? 0.25 : 0), f1, 40) }); });
      camKeys(cam, t, keys);
      K.update(t);
    }
  };
};

// ---------- 2009 : le labo du carbone 14
SETS.labo = () => {
  const B = base({ bg: 0xdfe6ee, hemi: [0xf4f8ff, 0x8a9098, 1.0], sun: [0xffffff, 1.3, [2, 6, 4]], shadowSize: 5, bloom: [0.3, 0.5, 0.93], exposure: 1.0, target: [0, 0.9, -0.5] });
  const { scene, cam } = B;
  scene.add(at(box(10, 0.1, 8, M(0xb8c0c8)), 0, -0.05, 0)); scene.add(at(box(10, 4, 0.2, M(0xe4eaf0)), 0, 2, -2.6)); scene.add(at(box(0.2, 4, 8, M(0xd4dae2)), 3.0, 2, 0));
  scene.add(at(box(2.6, 0.08, 0.9, M(0xf0f0f0)), 0, 0.9, -0.35)); scene.add(at(box(2.6, 0.82, 0.86, M(0x9aa8b8)), 0, 0.43, -0.35));
  // l'accelerateur (spectrometre de masse) en fond
  const acc = new THREE.Group(); acc.position.set(-1.4, 0, -2.0); scene.add(acc);
  for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.9, 12), M(0x8a96a8)); c.rotation.z = Math.PI / 2; c.position.set(i * 0.95, 1.1, 0); acc.add(c); acc.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.03, 6, 20), G(0x55c8ff, 1.6)), i * 0.95 + 0.46, 1.1, 0).rotateY(Math.PI / 2)); }
  acc.add(at(box(2.8, 0.7, 0.6, M(0x5a6678)), 0.95, 0.35, 0));
  for (let i = 0; i < 6; i++) acc.add(at(box(0.06, 0.06, 0.02, G(i % 2 ? 0x7dffb0 : 0xffd070, 1.6)), 0.2 + i * 0.3, 0.55, 0.31));
  // microscope
  const mic = new THREE.Group(); mic.position.set(0.85, 0.94, -0.45); scene.add(mic);
  mic.add(at(box(0.22, 0.04, 0.28, M(0x2a2a30)), 0, 0.02, 0)); mic.add(at(box(0.06, 0.4, 0.06, M(0xe8e8ee)), 0, 0.22, -0.08)); mic.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.25, 8), M(0x2a2a30)), 0, 0.36, 0.0).rotateX(0.5));
  const open = openBook(PAGES['160'], PAGES['186'], 0.34); open.position.set(-0.2, 0.95, -0.25); scene.add(open);
  const sample = at(box(0.006, 0.003, 0.03, M(0xe8dcc0)), 0, 0, 0); scene.add(sample);
  const dish = at(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.015, 16), M(0xd8f0ff, { transparent: true, opacity: 0.6 })), 0.35, 0.95, -0.2); scene.add(dish);
  const res = new Human({ skin: 0x5a3a2a, hair: 0x101010, hairStyle: 'bun', top: 0x6a8ab0, bottom: 0x2a2a3a, jacket: 0xf4f4f4, seed: 2103 }); res.place(0.15, 0, -1.05, 0); scene.add(res.root);
  const tw = at(box(0.008, 0.008, 0.12, M(0xc8c8d0)), 0, -0.06, 0.06); res.hand.R.add(tw);
  faceLight(scene, [0.15, 1.7, 0.2], 2.6);
  const rig = claudeRig(scene, [-1.15, 0, 0.75], 0.4, [0.45, 0, 0.1], 0x55e6ff, 0.5, 0.3);
  const bar = new THREE.Group(); rig.holoG.add(bar); bar.position.y = 0.1;
  bar.add(holo(new THREE.BoxGeometry(0.9, 0.02, 0.02), 0x55e6ff, 0.3));
  const segm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.08, 0.03), G(0xffb040, 1.6)); segm.position.x = -0.24; bar.add(segm);
  const lb = label('1404 – 1438', { w: 0.7, h: 0.16, color: '#ffd070', font: 'bold 120px Inter' }); lb.position.set(-0.2, 0.16, 0); bar.add(lb);
  const ln = label('1300                2000', { w: 1.0, h: 0.1, color: '#9adfff', font: 'bold 70px Inter' }); ln.position.set(0, -0.08, 0); bar.add(ln);
  const fake = label('FAUX ?', { w: 0.6, h: 0.2, color: '#ff8a6a', font: 'bold 150px Inter' }); fake.position.set(0, 0.15, 0); rig.holoG.add(fake);
  const K = cardsMgr(scene, cam);
  imagined(K, 'personnage imaginé', C.chercheuse - 0.3, C.peau);
  K('CARBONE 14 · 95 %\nparchemin daté 1404 – 1438', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, C.chercheuse + 3.2, C.peau + 3.0, 0.3, 0.2));
  K('on date la peau, pas l\'encre', { w: 1.6, h: 0.3, border: '#55e6ff' }, t => win(t, C.peau + 3.2, SC.copiste.start, 0.3, 0.2));
  return {
    ...B, update(t) {
      const T0 = SC.labo.start;
      const pick = sstep(T0 + 7.5, T0 + 9.0, t);
      sample.position.set(lerp(-0.12, 0.35, pick), lerp(0.98, 0.97, pick) + 0.06 * Math.sin(pick * Math.PI), lerp(-0.25, -0.2, pick));
      res.pose({ aL: [0.7, 0.15], aR: [0.95 + 0.15 * Math.sin(t * 1.3), 0.2], eL: 1.2, eR: 1.1, hp: t < C.chercheuse - 0.3 ? 0.4 : 0.05, lean: t < C.chercheuse - 0.3 ? 0.15 : 0.0 });
      res.face(env('chercheuse', t), 'neutral', t);
      const fk = win(t, T0 + 2.6, T0 + 6.5, 0.3, 0.4); fade(fake, fk);
      const bk = win(t, C.peau - 0.2, SC.copiste.start, 0.4, 0.3); fade(bar, bk); beamOn(rig, Math.max(fk, bk), t);
      bar.lookAt(cam.position); fake.lookAt(cam.position);
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [0.6, 1.9, 3.2], l: [0, 1.2, -0.6], f: 46 }, { t: T0 + 2.6, p: [-0.8, 1.15, 3.3], l: [-0.95, 0.8, 0.6], f: 44 }, { t: T0 + 6.4, p: [-0.7, 1.15, 3.2], l: [-0.95, 0.8, 0.6], f: 44 },
        { t: T0 + 7.4, p: [0.1, 1.4, 0.65], l: [0.05, 0.95, -0.25], f: 42 }, { t: C.chercheuse - 0.4, p: [0.12, 1.35, 0.6], l: [0.1, 0.95, -0.25], f: 42 },
        { t: C.chercheuse + 0.4, p: [0.25, 1.6, 0.55], l: [0.15, 1.5, -1.0], f: 42 }, { t: C.peau, p: [0.28, 1.6, 0.6], l: [0.15, 1.5, -1.0], f: 42 },
        { t: C.peau + 1.0, p: [-0.8, 1.15, 3.3], l: [-0.95, 0.85, 0.6], f: 44 }, { t: SC.copiste.start, p: [-0.7, 1.15, 3.1], l: [-0.95, 0.85, 0.6], f: 44 }]);
      K.update(t);
    }
  };
};

// ---------- un copiste du XVe siecle (scene imaginee), puis la rumeur de Prague
SETS.copiste = () => {
  const B = base({ bg: 0x0a0806, fog: [0x0a0806, 5, 14], hemi: [0xb0a0b8, 0x2a2018, 0.8], sun: [0x8aa0d8, 0.6, [-3, 4, -1]], shadowSize: 5, bloom: [0.5, 0.5, 0.86], exposure: 1.35, target: [0, 0.8, 0] });
  const { scene, cam } = B;
  scene.add(at(box(8, 0.1, 6, M(0x4a4038)), 0, -0.05, 0)); scene.add(at(box(8, 4, 0.3, M(0x6a5a4a)), 0, 2, -1.8)); scene.add(at(box(0.3, 4, 6, M(0x5a4a3c)), -2.4, 2, 0));
  for (let i = 0; i < 18; i++) scene.add(at(box(0.5, 0.26, 0.04, M(hash(i) > 0.5 ? 0x7a6a58 : 0x5e5040)), -2.2 + (i % 6) * 0.55 + (Math.floor(i / 6) % 2) * 0.27, 0.6 + Math.floor(i / 6) * 0.9, -1.63));
  const nw = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.8), new THREE.MeshBasicMaterial({ color: 0x2a3a6a })); nw.position.set(1.3, 2.0, -1.64); scene.add(nw);
  scene.add(at(box(1.3, 0.06, 0.7, M(0x5a3a22)), 0, 0.8, 0)); for (const [x, z] of [[-0.58, -0.28], [0.58, -0.28], [-0.58, 0.28], [0.58, 0.28]]) scene.add(at(box(0.06, 0.8, 0.06, M(0x3a2414)), x, 0.4, z));
  scene.add(at(box(0.4, 0.45, 0.35, M(0x4a3020)), 0, 0.22, -0.65));
  // parchemin qui se remplit de glyphes
  const pc = glyphCanvas({ W: 768, H: 1024, bg: '#e6d6b0', ink: '#4a3220', lw: 4, size: 30, seed: 21 });
  const parch = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.48), new THREE.MeshLambertMaterial({ map: canvasTex(pc) })); parch.rotation.x = -Math.PI / 2; parch.rotation.z = Math.PI; parch.position.set(0, 0.835, 0.0); scene.add(parch);
  const blank = new THREE.Mesh(new THREE.PlaneGeometry(0.362, 1), M(0xe6d6b0)); blank.rotation.x = -Math.PI / 2; blank.position.set(0, 0.837, 0); scene.add(blank);
  scene.add(at(box(0.05, 0.06, 0.05, M(0x2a2a2a)), 0.4, 0.86, -0.15));
  const candle = at(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.18, 8), M(0xf0e6cc)), -0.42, 0.92, -0.1); scene.add(candle);
  const fl = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.06, 6), G(0xffb040, 2.6)); fl.position.set(-0.42, 1.05, -0.1); scene.add(fl);
  const cl = new THREE.PointLight(0xffa050, 3.0, 5, 1.3); cl.position.set(-0.42, 1.12, 0.0); scene.add(cl);
  faceLight(scene, [0.1, 1.6, 0.6], 2.4, 0xffd8b0);
  const scr = new Human({ skin: 0xb07850, hair: 0x2a1a10, hairStyle: 'short', top: 0x5a4a3a, bottom: 0x4a3a2a, robe: 0x5a4a3a, robeL: 0.6, seed: 2104 }); scr.place(0, 0, -0.62, 0); scene.add(scr.root);
  const quill = at(box(0.006, 0.006, 0.2, M(0xf4f0e8)), 0, -0.04, 0.08); quill.rotation.x = 0.7; scr.hand.R.add(quill);
  const ghosts = []; for (let i = 0; i < 5; i++) { const h = new Human({ holo: 0xffc070, seed: 300 + i, hairStyle: ['short', 'long', 'bald', 'curly', 'bun'][i] }); h.root.traverse(m => { if (m.isMesh && m.material && m.material.blending === THREE.AdditiveBlending) m.material.opacity = 0.22; }); const a = (i - 2) * 0.55; h.place(Math.sin(a) * 1.4, 0, -1.2 + Math.cos(a) * 0.2 - 0.2, -a * 0.6); scene.add(h.root); ghosts.push(h); }
  const rig = claudeRig(scene, [1.05, 0, 0.75], -0.45, [-0.45, 0, 0.1], 0xffd070, 0.5, 0.3);
  const crown = new THREE.Group(); rig.holoG.add(crown);
  crown.add(holo(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 10, 1, true), 0xffd070, 0.25));
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; crown.add(at(holo(new THREE.ConeGeometry(0.035, 0.12, 4), 0xffd070, 0.3), Math.cos(a) * 0.2, 0.1, Math.sin(a) * 0.2)); }
  const coins = []; for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.01, 12), G(0xffc040, 1.5)); c.rotation.x = Math.PI / 2; rig.holoG.add(c); coins.push(c); }
  const ducats = label('600 DUCATS ?', { w: 0.6, h: 0.12, color: '#ffd070', font: 'bold 110px Inter' }); ducats.position.set(0, -0.2, 0); rig.holoG.add(ducats);
  const K = cardsMgr(scene, cam);
  imagined(K, 'scène imaginée', SC.copiste.start + 0.3, SC.copiste.start + 4.5);
  K('HYPOTHÈSE · Lisa Fagin Davis\ncinq copistes ?', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.copiste.start + 5.0, C.prague, 0.3, 0.2));
  K('PRAGUE · lettre des années 1660\nRodolphe II ? une rumeur', { w: 1.6, h: 0.42, border: '#e0b070', small: true }, t => win(t, C.prague + 3.5, SC.codes.start, 0.3, 0.2));
  return {
    ...B, update(t) {
      const T0 = SC.copiste.start;
      const wr = sstep(T0, C.prague, t); blank.scale.y = 0.48 * (1 - wr) + 0.001; blank.position.z = 0.24 - 0.24 * (1 - wr);
      scr.pose(L.sitPose(0.45, { aL: [0.75, 0.15], aR: [0.95 + 0.05 * Math.sin(t * 6), 0.12, 0.2 * Math.sin(t * 3)], eL: 1.1, eR: 1.3 + 0.08 * Math.sin(t * 7), hp: 0.45, lean: 0.12 })); scr.face(0, 'neutral', t);
      fl.scale.set(1, 0.85 + 0.25 * Math.abs(Math.sin(t * 11)), 1); cl.intensity = 2.8 + 0.4 * Math.sin(t * 9) + 0.25 * Math.sin(t * 21);
      ghosts.forEach((g, i) => { fade(g.root, win(t, T0 + 4.5 + i * 0.35, C.prague, 0.4, 0.4)); g.pose({ aL: [0.6, 0.1], aR: [0.8, 0.1], eL: 1, eR: 1.1 }); });
      const pk = win(t, C.prague + 0.6, SC.codes.start, 0.4, 0.3); fade(crown, pk); beamOn(rig, pk, t); crown.rotation.y = t * 0.6;
      coins.forEach((c, i) => { const ph = (t * 0.4 + i / 6) % 1; c.position.set(Math.cos(i * 1.1) * 0.15, 0.3 - ph * 0.6, Math.sin(i * 1.1) * 0.15); c.rotation.z = t * 3 + i; fade(c, pk * Math.sin(ph * Math.PI)); });
      fade(ducats, win(t, C.prague + 5.5, SC.codes.start, 0.3, 0.3)); ducats.lookAt(cam.position);
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [0.0, 1.85, 2.0], l: [0, 1.15, -0.4], f: 46 }, { t: T0 + 3.5, p: [0.25, 1.4, 0.55], l: [0.0, 0.84, 0.0], f: 44 }, { t: T0 + 4.6, p: [0.0, 1.9, 2.6], l: [0, 1.25, -0.8], f: 48 },
        { t: C.prague, p: [0.1, 1.8, 2.5], l: [0, 1.2, -0.6], f: 48 }, { t: C.prague + 1.2, p: [0.5, 1.2, 3.4], l: [0.75, 0.85, 0.6], f: 44 }, { t: SC.codes.start, p: [0.45, 1.2, 3.3], l: [0.75, 0.85, 0.6], f: 44 }]);
      K.update(t);
    }
  };
};

// ---------- annees 1940-1950 : William Friedman
SETS.codes = () => {
  const B = base({ bg: 0x3a4038, hemi: [0xfff0d0, 0x2a2a24, 0.9], sun: [0xfff0d0, 1.2, [-2, 5, 3]], shadowSize: 5, bloom: [0.35, 0.5, 0.9], exposure: 1.15, target: [0, 0.9, -0.4] });
  const { scene, cam } = B;
  scene.add(at(box(10, 0.1, 8, M(0x5a4a3a)), 0, -0.05, 0)); scene.add(at(box(10, 4, 0.2, M(0x7a8a78)), 0, 2, -2.2));
  const bc = glyphCanvas({ W: 1024, H: 512, bg: '#1e3a2a', ink: '#e8efe8', lw: 5, size: 38, seed: 41 });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.1), new THREE.MeshLambertMaterial({ map: canvasTex(bc) })); board.position.set(-0.3, 1.75, -2.08); scene.add(board);
  scene.add(at(box(2.34, 0.08, 0.08, M(0x5a3a22)), -0.3, 1.16, -2.05));
  scene.add(at(box(1.6, 0.06, 0.8, M(0x5a3a22)), 0, 0.76, 0)); scene.add(at(box(1.5, 0.7, 0.7, M(0x4a2e1a)), 0, 0.38, 0));
  for (let i = 0; i < 9; i++) scene.add(at(box(0.2, 0.004, 0.28, M(0xf4f0e0)), -0.55 + (i % 4) * 0.25, 0.795 + Math.floor(i / 4) * 0.004, -0.15 + hash(i) * 0.2).rotateY((hash(i * 3) - 0.5) * 0.6));
  for (let i = 0; i < 6; i++) scene.add(at(box(0.18, 0.004, 0.08, M(0xe8d0a0)), 0.5, 0.8 + i * 0.006, 0.15).rotateY(i * 0.08));
  const lamp = new THREE.Group(); lamp.position.set(0.6, 0.79, -0.25); scene.add(lamp);
  lamp.add(at(box(0.12, 0.02, 0.12, M(0x1a3a2a)), 0, 0.01, 0)); lamp.add(at(box(0.02, 0.35, 0.02, M(0xb08a3a)), 0, 0.18, 0)); lamp.add(at(box(0.28, 0.06, 0.12, G(0x3a8a5a, 0.8)), 0, 0.37, 0.04));
  const ll = new THREE.PointLight(0xffe0a0, 1.5, 3, 1.5); ll.position.set(0.6, 1.1, -0.1); scene.add(ll);
  const open = openBook(PAGES['24'], PAGES['186'], 0.3); open.position.set(-0.1, 0.8, 0.05); scene.add(open);
  const fr = new Human({ skin: 0xf0c8a8, hair: 0x8a8a88, hairStyle: 'short', top: 0xe8e8e0, bottom: 0x2a2a34, jacket: 0x3a3a46, seed: 2105 }); mustache(fr, 0x7a7a78); fr.place(0.25, 0, -0.75, -0.15); scene.add(fr.root);
  faceLight(scene, [0.3, 1.6, 0.6], 1.6);
  const stamp = card('ÉCHEC', { w: 0.9, h: 0.34, border: '#ff4a4a', color: '#ff6a5a', bg: 'rgba(30,6,6,0.85)' }); scene.add(stamp);
  const K = cardsMgr(scene, cam);
  K('WILLIAM FRIEDMAN\ncasseur de codes · années 1940–1950', { w: 1.6, h: 0.42, border: '#e0b070', small: true }, t => win(t, SC.codes.start + 2.5, C.friedman - 1.6, 0.3, 0.2));
  imagined(K, 'réplique imaginée', C.friedman - 0.2, C.ia);
  return {
    ...B, update(t) {
      const T0 = SC.codes.start;
      const pt = win(t, T0 + 1.0, C.friedman - 1.8, 0.5, 0.5);
      fr.pose({ aL: [0.3, 0.12], aR: [lerp(0.3, 1.6, pt), lerp(0.15, 0.2, pt), lerp(0, 0.6, pt)], eL: 0.4, eR: lerp(0.3, 0.1, pt), hy: lerp(0, 0.6, pt), hp: 0.05 });
      fr.face(env('friedman', t), 'serious', t);
      fade(stamp, win(t, C.friedman - 1.7, C.friedman - 0.1, 0.15, 0.3)); 
      camKeys(cam, t, [{ t: T0, p: [-0.3, 1.9, 3.2], l: [-0.3, 1.5, -1.5], f: 46 }, { t: T0 + 4.5, p: [0.5, 1.7, 2.6], l: [0.0, 1.3, -1.0], f: 46 }, { t: C.friedman - 0.6, p: [0.5, 1.7, 2.5], l: [0.05, 1.3, -1.0], f: 46 },
        { t: C.friedman + 0.2, p: [0.5, 1.65, 1.0], l: [0.27, 1.55, -0.75], f: 42 }, { t: C.ia, p: [0.47, 1.64, 0.95], l: [0.27, 1.55, -0.75], f: 42 }]);
      camCard(cam, stamp, 0.55, -0.15); stamp.rotation.z = -0.12;
      K.update(t);
    }
  };
};

// ---------- 2018 : l'IA, puis le petit Claude essaie
SETS.ia = () => {
  const B = studioBase({ bloom: [0.5, 0.5, 0.85] }); const { scene, cam } = B;
  const screens = [];
  for (let i = 0; i < 6; i++) {
    const x = ((i % 3) - 1) * 1.05, y = 1.25 + Math.floor(i / 3) * 0.72;
    scene.add(at(box(1.0, 0.66, 0.05, M(0x1a1c24)), x, y, -1.5));
    const c = glyphCanvas({ W: 512, H: 320, bg: '#06121a', ink: '#5ad8ff', lw: 3, size: 22, seed: 60 + i });
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.58), new THREE.MeshBasicMaterial({ map: canvasTex(c), toneMapped: false, color: new THREE.Color(0.8, 0.8, 0.8) })); s.position.set(x, y, -1.47); scene.add(s); screens.push(s);
  }
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 0.03), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x7dffb0).multiplyScalar(1.4), transparent: true, opacity: 0.6, toneMapped: false })); scene.add(scan);
  const heb = label('HÉBREU ?', { w: 1.0, h: 0.26, color: '#ffd070', font: 'bold 150px Inter' }); heb.position.set(0, 2.1, -1.3); scene.add(heb);
  const rig = claudeRig(scene, [0.0, 0, 0.6], 0, [0.0, 0, 0.42], 0x55e6ff, 0.45, 0.3);
  const hp = holoText(0.9, 0.6, '#9af0ff', 77); rig.holoG.add(hp); hp.position.y = 0.4;
  const hc = hp.userData.canvas.userData; const marks = [];
  const pick = hc.words.filter((w, i) => hash(i * 13) < 0.22).slice(0, 10);
  for (const [x, y, w] of pick) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w / 1024 * 0.9, hc.s * 1.3 / 1024 * 0.9), new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false })); m.position.set((x + w / 2) / 1024 * 0.9 - 0.45, 0.3 - (y - hc.s * 0.1) / 1024 * 0.9, 0.005); hp.add(m); marks.push(m); }
  const q = label('?', { w: 0.3, h: 0.3, color: '#ff8a6a', font: 'bold 300px Inter' }); q.position.set(0.3, 0.55, 0.05); rig.holoG.add(q);
  const K = cardsMgr(scene, cam);
  K('2018 · Université de l\'Alberta\nl\'IA penche pour l\'hébreu', { w: 1.6, h: 0.42, border: '#55e6ff', small: true }, t => win(t, C.ia + 1.0, C.ia + 5.6, 0.3, 0.2));
  K('phrase obtenue peu claire\nspécialistes pas convaincus', { w: 1.6, h: 0.42, border: '#ff9a5a', small: true }, t => win(t, C.ia + 5.8, C.moi, 0.3, 0.2));
  return {
    ...B, update(t) {
      const sy = 0.9 + ((t * 0.5) % 1) * 1.45; scan.position.set(0, sy, -1.44); fade(scan, 0.6 * win(t, C.ia, C.moi - 0.5));
      fade(heb, win(t, C.ia + 4.0, C.moi - 0.3, 0.3, 0.3) * (0.75 + 0.25 * Math.sin(t * 4)));
      const mk = sstep(C.moi - 0.4, C.moi + 0.4, t); fade(hp, 0.9 * mk); beamOn(rig, mk, t);
      marks.forEach((m, i) => fade(m, 0.45 * sstep(C.moi + 1.0 + i * 0.25, C.moi + 1.3 + i * 0.25, t) * (1 - sstep(C.moi + 6.5, C.moi + 7.0, t))));
      fade(q, sstep(C.moi + 6.6, C.moi + 7.0, t) * (0.7 + 0.3 * Math.sin(t * 5)));
      rig.c.update(t, env('claude', t), { armsUp: 0.3 * sstep(C.moi + 6.6, C.moi + 7.1, t), squint: t > C.moi + 6.8 && t < C.moi + 7.8 });
      camKeys(cam, t, [{ t: C.ia, p: [0.0, 1.5, 4.4], l: [0, 1.25, -1.0], f: 46 }, { t: C.moi - 0.5, p: [0.3, 1.4, 4.0], l: [0, 1.2, -1.0], f: 46 },
        { t: C.moi + 0.5, p: [0.0, 1.2, 3.1], l: [0, 0.9, 0.6], f: 44 }, { t: C.moi + 6.2, p: [0.0, 1.15, 2.9], l: [0, 0.88, 0.6], f: 44 }, { t: SC.hypo.start, p: [0.0, 1.1, 2.9], l: [0, 0.8, 0.6], f: 44 }]);
      K.update(t);
    }
  };
};

// ---------- les hypotheses
SETS.hypo = () => {
  const B = studioBase({ bloom: [0.55, 0.5, 0.8] }); const { scene, cam } = B;
  const mkObj = (x) => { const g = new THREE.Group(); g.position.set(x, 1.7, 0); scene.add(g); return g; };
  const lang = mkObj(-0.52), code = mkObj(0), hoax = mkObj(0.52);
  lang.add(at(holo(new THREE.BoxGeometry(0.42, 0.04, 0.3), 0x7dffb0, 0.2), 0, -0.1, 0));
  for (const [i, ch] of ['A', 'ß', 'ж', 'ע'].entries()) { const l = label(ch, { w: 0.22, h: 0.22, color: '#7dffb0', font: 'bold 760px Inter' }); l.position.set(-0.2 + i * 0.13, 0.12 + (i % 2) * 0.08, 0); lang.add(l); }
  code.add(at(holo(new THREE.BoxGeometry(0.34, 0.28, 0.12), 0xffd070, 0.2), 0, -0.05, 0));
  code.add(at(holo(new THREE.TorusGeometry(0.12, 0.025, 6, 16, Math.PI), 0xffd070, 0.25), 0, 0.09, 0));
  code.add(at(holo(new THREE.CylinderGeometry(0.03, 0.03, 0.13, 8), 0xffd070, 0.3), 0, -0.04, 0.06).rotateX(Math.PI / 2));
  const maskG = new THREE.SphereGeometry(0.2, 10, 8, 0, Math.PI * 2, 0, Math.PI / 1.4); const mask = holo(maskG, 0xff8a6a, 0.18); mask.rotation.x = Math.PI / 2; mask.scale.set(1, 0.4, 1.2); hoax.add(mask);
  for (const s of [-1, 1]) hoax.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.035, 10), new THREE.MeshBasicMaterial({ color: 0x000000 })), s * 0.07, 0.05, 0.1));
  hoax.add(at(holo(new THREE.TorusGeometry(0.06, 0.012, 4, 12, Math.PI), 0xff8a6a, 0.4), 0, -0.07, 0.1).rotateZ(Math.PI));
  const names = [['LANGUE ?', '#7dffb0', lang], ['CODE ?', '#ffd070', code], ['CANULAR ?', '#ff8a6a', hoax]].map(([s, c, g]) => { const l = label(s, { w: 0.55, h: 0.11, color: c, font: 'bold 110px Inter' }); l.position.set(g.position.x, 1.38, 0.05); scene.add(l); return l; });
  // frequences des mots (loi de Zipf)
  const zipf = new THREE.Group(); zipf.position.set(0, 1.0, 0); scene.add(zipf);
  const bars = []; for (let i = 0; i < 12; i++) { const hgt = 1.3 / (i + 1); const b = holo(new THREE.BoxGeometry(0.13, hgt, 0.08), 0x55e6ff, 0.25); b.position.set(-0.85 + i * 0.155, hgt / 2, 0); zipf.add(b); bars.push([b, hgt]); }
  const curve = []; for (let i = 0; i < 40; i++) { const x = i / 39 * 11, y = 1.3 / (x + 1); curve.push(new THREE.Vector3(-0.85 + x * 0.155, y, 0.06)); }
  const cl = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curve), 60, 0.012, 5), G(0xffb040, 1.6)); zipf.add(cl);
  const zl = label('fréquence des mots', { w: 1.0, h: 0.13, color: '#9adfff', font: 'bold 90px Inter' }); zl.position.set(0.1, 1.45, 0); zipf.add(zl);
  const rig = claudeRig(scene, [-0.55, 0, 1.6], 0.35, [0.45, 0, 0.0], 0x55e6ff, 0.4, 0.25); rig.pr.visible = false;
  const K = cardsMgr(scene, cam);
  K('HYPOTHÈSES', { w: 1.2, h: 0.3, border: '#ffd070', color: '#ffe070' }, t => win(t, SC.hypo.start + 1.5, C.indice - 0.2, 0.3, 0.2));
  K('comme dans une vraie langue…\ndu charabia en serait-il capable ?', { w: 1.6, h: 0.42, border: '#55e6ff', small: true }, t => win(t, C.indice + 3.0, SC.fin.start, 0.3, 0.2));
  const T0 = SC.hypo.start, ap = [T0 + 3.3, T0 + 5.6, T0 + 7.0];
  return {
    ...B, update(t) {
      [lang, code, hoax].forEach((g, i) => { const k = win(t, ap[i], C.indice + 0.6, 0.4, 0.6); fade(g, k); g.scale.setScalar(0.75 + 0.35 * sstep(ap[i], ap[i] + 0.5, t)); g.rotation.y = 0.4 * Math.sin(t * 0.8 + i); fade(names[i], k); });
      const zk = sstep(C.indice + 0.6, C.indice + 1.4, t); fade(zipf, zk);
      bars.forEach(([b, h], i) => { const g = sstep(C.indice + 0.8 + i * 0.12, C.indice + 1.2 + i * 0.12, t); b.scale.y = Math.max(0.01, g); b.position.y = h * g / 2; });
      fade(cl, sstep(C.indice + 2.6, C.indice + 3.2, t));
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [-0.1, 1.55, 3.3], l: [0, 1.5, 0], f: 46 }, { t: C.indice, p: [0.0, 1.55, 3.5], l: [0, 1.45, 0], f: 46 }, { t: C.indice + 0.8, p: [0.0, 1.5, 4.1], l: [0, 1.35, 0], f: 46 }, { t: SC.fin.start, p: [0.1, 1.5, 4.0], l: [0, 1.35, 0], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- fin : le livre ouvert garde son secret
SETS.fin = () => {
  const B = base({ bg: 0x0a0806, fog: [0x0a0806, 5, 14], hemi: [0xffe8c8, 0x141018, 0.6], sun: [0xffd8a0, 1.2, [1.5, 4, 2]], shadowSize: 4, bloom: [0.45, 0.5, 0.88], exposure: 1.1, target: [0, 0.9, 0] });
  const { scene, cam } = B;
  scene.add(at(box(8, 0.1, 6, M(0x2a2018)), 0, -0.05, 0));
  const lect = new THREE.Group(); lect.position.set(0.2, 0, -0.2); scene.add(lect);
  lect.add(at(box(0.2, 1.0, 0.2, M(0x4a2e1a)), 0, 0.5, 0)); lect.add(at(box(0.5, 0.06, 0.5, M(0x4a2e1a)), 0, 0.03, 0));
  const top = new THREE.Group(); top.position.set(0, 1.05, 0); top.rotation.x = 0.35; lect.add(top);
  top.add(at(box(0.7, 0.04, 0.48, M(0x5a3a22)), 0, -0.02, 0));
  const book = openBook(PAGES['80'], PAGES['186'], 0.4); book.position.y = 0.0; top.add(book);
  const sp = new THREE.SpotLight(0xffe0b0, 6, 6, 0.5, 0.6, 1.2); sp.position.set(0.5, 2.6, 1.0); sp.target = lect; scene.add(sp);
  const dt = dust(scene, 60, 0.2, 1.4, 0.0, 1.4);
  const rig = claudeRig(scene, [-0.55, 0, 0.45], 0.35, [0.42, 0, 0.12], 0x55e6ff, 0.45, 0.28);
  const opts = [['langue perdue ?', '#7dffb0'], ['code ?', '#ffd070'], ['canular ?', '#ff8a6a']].map(([s, c], i) => { const l = label(s, { w: 0.5, h: 0.1, color: c, font: 'bold 100px Inter' }); rig.holoG.add(l); l.position.set(0, 0.25 - i * 0.12, 0); return l; });
  const K = cardsMgr(scene, cam);
  K('Beinecke MS 408\nentièrement en ligne', { w: 1.6, h: 0.42, border: '#e0b070', small: true }, t => win(t, SC.fin.start + 4.5, C.question, 0.3, 0.2));
  return {
    ...B, update(t) {
      dt(t);
      const qk = sstep(C.question + 1.5, C.question + 2.0, t); beamOn(rig, qk, t);
      opts.forEach((l, i) => { fade(l, sstep(C.question + 1.6 + i * 0.9, C.question + 2.0 + i * 0.9, t)); l.lookAt(cam.position); });
      rig.c.update(t, env('claude', t), { wave: sstep(TL.duration - 2.2, TL.duration - 1.6, t) });
      const T0 = SC.fin.start;
      camKeys(cam, t, [{ t: T0, p: [0.9, 1.7, 2.6], l: [0.1, 1.1, -0.2], f: 44 }, { t: T0 + 4.0, p: [0.35, 1.65, 0.75], l: [0.2, 1.08, -0.2], f: 42 }, { t: C.question - 0.4, p: [0.2, 1.6, 0.85], l: [0.2, 1.08, -0.2], f: 42 },
        { t: C.question + 1.0, p: [-0.1, 1.2, 3.1], l: [-0.25, 0.85, 0.3], f: 44 }, { t: TL.duration, p: [-0.12, 1.15, 2.9], l: [-0.25, 0.82, 0.3], f: 44 }]);
      K.update(t);
    }
  };
};

const SHOTS = [
  ['intro', 0, SC.villa.start], ['villa', SC.villa.start, SC.pages.start], ['pages', SC.pages.start, SC.labo.start], ['labo', SC.labo.start, SC.copiste.start],
  ['copiste', SC.copiste.start, SC.codes.start], ['codes', SC.codes.start, C.ia], ['ia', C.ia, SC.hypo.start], ['hypo', SC.hypo.start, SC.fin.start], ['fin', SC.fin.start, 1000],
];
