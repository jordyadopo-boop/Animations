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
function dust(scene, n, cx, cy, cz, R, color = 0xffe0b0) {
  const pts = []; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.008, 0), G(color, 1.2)); scene.add(m); pts.push(m); }
  return (t) => pts.forEach((m, i) => { const ph = (t * 0.03 + hash(i)) % 1; m.position.set(cx + (hash(i * 3) - 0.5) * R * 2 + 0.1 * Math.sin(t * 0.4 + i), cy + (ph - 0.5) * R * 1.6, cz + (hash(i * 7) - 0.5) * R); });
}
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
function canvasTex(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
function versePage(lines) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 720; const g = c.getContext('2d');
  g.fillStyle = '#efe4c8'; g.fillRect(0, 0, 512, 720); g.fillStyle = '#3a2a1a'; g.textAlign = 'center';
  lines.forEach((l, i) => { g.font = i === 0 ? 'bold 40px Inter' : '32px Inter'; g.fillText(l, 256, 110 + i * 62); });
  for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(58,42,26,0.25)'; g.fillRect(70, 470 + k * 34, 372 - (k % 3) * 40, 10); }
  return canvasTex(c);
}

const REF = 'Apocalypse 19, 11-21 · traduction Louis Segond';
// personnages
function john(o = {}) { return new Human({ skin: 0xc8946a, hair: 0xe8e4dc, hairStyle: 'long', beard: 'long', beardColor: 0xe8e4dc, top: 0xe8dcc0, bottom: 0xc8b890, robe: 0xd8c8a0, robeL: 0.85, seed: 3901, ...o }); }
function angel() {
  const h = new Human({ skin: 0xf0d8c0, hair: 0xf0d080, hairStyle: 'long', top: 0xffffff, bottom: 0xffffff, robe: 0xffffff, robeL: 0.9, seed: 3902 });
  h.root.traverse(m => { if (m.isMesh && m.material && m.material.emissive) m.material.emissive = new THREE.Color(0x1a160e); });
  for (const s of [-1, 1]) { const w = new THREE.Group(); w.position.set(s * 0.12, 0.45, -0.14); h.spine.add(w); for (let k = 0; k < 3; k++) { const f = box(0.04, 0.5 - k * 0.1, 0.12, M(0xfff8e8, { emissive: new THREE.Color(0x605840) })); f.position.set(s * (0.15 + k * 0.12), 0.1 - k * 0.08, -0.05 * k); f.rotation.z = s * (0.7 + k * 0.25); w.add(f); } }
  return h;
}
function glowStar(size = 1, color = 0xfff4d0) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.12, 'rgba(255,240,200,0.9)'); gr.addColorStop(0.4, 'rgba(255,220,150,0.18)'); gr.addColorStop(1, 'rgba(255,200,120,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256); g.strokeStyle = 'rgba(255,250,230,0.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(128, 10); g.lineTo(128, 246); g.moveTo(10, 128); g.lineTo(246, 128); g.stroke();
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); s.scale.setScalar(size); return s;
}
// mer et ile
function seaWorld(o = {}) {
  const B = base({ sky: o.sky ?? [0x0a1430, 0x3a2a4a], hemi: [o.hemiC ?? 0x9aa8d8, 0x1a1420, o.hemiK ?? 0.7], sun: [o.sunC ?? 0xc8d0ff, o.sunK ?? 0.7, o.sunPos ?? [-4, 6, 6]], shadowSize: 6, bloom: [0.6, 0.5, 0.8], exposure: o.exposure ?? 1.0, fog: [o.fog ?? 0x2a2440, 18, 90], target: [0, 1, 0] });
  const water = L.makeWater(160, 80, o.water ?? 0x1a3050, { emissive: 0x050a18 }); water.mesh.position.set(0, -0.2, -20); B.scene.add(water.mesh);
  const isl = L.groundPlane(14, 30, 0x6a5a48, 0.5, 9); isl.position.y = 0.0; B.scene.add(isl);
  for (let i = 0; i < 7; i++) { const r = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5 + hash(i) * 2, 0), M(0x5a4a3a)); r.position.set(-12 + i * 4, -0.5, -18 - hash(i * 3) * 10); r.scale.y = 0.6 + hash(i * 5); B.scene.add(r); }
  B.water = water; return B;
}
function cave(scene) {
  const g = new THREE.Group(); scene.add(g);
  const rock = M(0x7a6a58);
  g.add(at(box(4, 3, 0.6, rock), 0, 1.5, -1.6)); g.add(at(box(0.8, 3, 2.5, rock), -1.7, 1.5, -0.6)); g.add(at(box(0.8, 3, 2.5, rock), 1.7, 1.5, -0.6)); g.add(at(box(4, 0.6, 2.5, rock), 0, 3.0, -0.6));
  for (let i = 0; i < 10; i++) { const r = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3 + hash(i) * 0.4, 0), rock); r.position.set(-2 + hash(i * 3) * 4, 3.2 + hash(i * 5) * 0.4, -0.6 + (hash(i * 7) - 0.5) * 2); g.add(r); }
  return g;
}
function lamp(scene, pos) {
  const g = new THREE.Group(); g.position.set(...pos); scene.add(g);
  g.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(0x8a5a3a)));
  const f = at(new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.05, 6), G(0xffb040, 2.6)), 0.05, 0.04, 0); g.add(f);
  const l = new THREE.PointLight(0xffa050, 1.2, 3, 1.6); l.position.set(0.05, 0.3, 0.1); g.add(l);
  g.userData.tick = (t) => { f.scale.y = 1 + 0.25 * Math.sin(t * 13); l.intensity = 1.1 + 0.2 * Math.sin(t * 11); };
  return g;
}
function scroll(w = 0.5) {
  const g = new THREE.Group();
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#e8d8b0'; x.fillRect(0, 0, 512, 256); for (let i = 0; i < 9; i++) { x.fillStyle = 'rgba(60,40,20,0.55)'; x.fillRect(40, 30 + i * 24, 430 - (i % 3) * 40, 8); }
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 2), new THREE.MeshLambertMaterial({ map: canvasTex(c), side: THREE.DoubleSide })); p.rotation.x = -Math.PI / 2; g.add(p);
  for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, w / 2 + 0.04, 8), M(0x8a6a4a)); r.rotation.x = Math.PI / 2; r.position.x = s * w / 2; g.add(r); }
  return g;
}
const refCard = (K) => K(REF, { w: 1.6, h: 0.12, border: '#807060', color: '#e8e0d4' }, t => t > SC.cavalier.start + 0.3 && t < SC.fin.start ? 0.85 : 0, -0.88, 0.75);


function nightSet(o = {}) {
  const B = base({ bg: 0x0a0814, fog: [0x0a0814, 6, 22], hemi: [0xd8d0ff, 0x10101a, 0.6], sun: [0xfff0d8, 0.8, [1, 5, 5]], shadowSize: 4, bloom: [0.45, 0.5, 0.85], exposure: 1.05, target: [0, 1, 0], ...o });
  B.scene.add(at(box(10, 0.1, 10, M(0x2a2430)), 0, -0.05, 0)); B.scene.add(L.stars(600, 60, 1.2)); return B;
}
function angelLight(scene, pos) { const l = new THREE.PointLight(0xfff0d0, 1.2, 4, 1.6); l.position.set(...pos); scene.add(l); return l; }
// genuflexion de Jean
const kneel = (j, k) => { if (k < 0.05) { j.pose({}); return; } j.pose(L.kneelPose({ lean: 0.5 * k, hp: 0.3 * k, aL: [0.4, 0.2], aR: [0.4, 0.2] })); };


// ---------- la ville celeste : place d'or, fleuve de cristal, arbres de vie, trone de lumiere
function heavenCity(o = {}) {
  const B = base({ sky: [0xf4ecff, 0xfff0d8], hemi: [0xffffff, 0xd8c8a0, 0.85], sun: [0xfff8e8, 0.9, [3, 8, 6]], shadowSize: 8, bloom: [0.45, 0.5, 0.88], exposure: 0.9, fog: [0xfff0e0, 14, 70], target: [0, 1, 0], ...o });
  const { scene } = B;
  const goldFloor = new THREE.Mesh(new THREE.PlaneGeometry(60, 80), M(0xe8c060, { emissive: new THREE.Color(0x3a2808) })); goldFloor.rotation.x = -Math.PI / 2; goldFloor.position.z = -20; scene.add(goldFloor);
  const riv = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 80), new THREE.MeshLambertMaterial({ color: 0xc8f0ff, emissive: new THREE.Color(0x5aa0c8), transparent: true, opacity: 0.92 })); riv.rotation.x = -Math.PI / 2; riv.position.set(0, 0.03, -20); scene.add(riv);
  const throne = glowStar(9, 0xffffff); throne.position.set(0, 2.5, -48); scene.add(throne);
  const sparks = []; for (let i = 0; i < 50; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 0), G(0xe8f8ff, 2)); scene.add(s); sparks.push(s); }
  const trees = []; const fruitC = [0xff5a4a, 0xffb03a, 0xffe04a, 0x7aff5a, 0x3ac8ff, 0x8a5aff];
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) { const tr = new THREE.Group(); tr.position.set(s * 1.7, 0, -1 - k * 4.5); scene.add(tr); tr.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 1.5, 8), M(0x7a5a3a)), 0, 0.75, 0)); const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 1), M(0x4aa84a, { emissive: new THREE.Color(0x0a2a0a) })); crown.position.y = 1.95; tr.add(crown); for (let f = 0; f < 12; f++) { const a = f / 12 * Math.PI * 2; tr.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), G(fruitC[f % 6], 1.3)), Math.cos(a) * 0.72, 1.9 + Math.sin(f * 1.7) * 0.35, Math.sin(a) * 0.72)); } trees.push(tr); }
  for (const s of [-1, 1]) for (let k = 0; k < 8; k++) { const h = 3 + hash(k + s) * 5; scene.add(at(box(2.5, h, 2.5, M(0xf0d890, { emissive: new THREE.Color(0x2a2008) })), s * (5 + hash(k * 3) * 3), h / 2, -4 - k * 6)); }
  B.trees = trees; B.throne = throne;
  B.tick = (t) => { sparks.forEach((s, i) => { const u = (t * 0.1 + hash(i)) % 1; s.position.set((hash(i * 3) - 0.5) * 1.4, 0.1 + 0.05 * Math.sin(t * 3 + i), -48 + u * 50); }); trees.forEach((tr, i) => tr.rotation.y = 0.08 * Math.sin(t * 0.5 + i)); throne.scale.setScalar(9 + 0.4 * Math.sin(t * 1.5)); };
  return B;
}
function citizens(scene, n = 5) {
  return Array.from({ length: n }, (_, i) => { const h = new Human({ skin: [0x8a5a3a, 0xe0b890, 0xa86c44, 0x5a3420, 0xd09a70, 0xc68a5a][i % 6], hair: [0x1a1210, 0x8a6a3a, 0x2a1a10, 0x120c08, 0x5a3a20, 0x3a2a1a][i % 6], hairStyle: ['short', 'long', 'curly', 'short', 'bun', 'long'][i % 6], top: 0xffffff, bottom: 0xf0f0f0, robe: 0xffffff, robeL: 0.8, seed: 4100 + i }); scene.add(h.root); return h; });
}


// ---------- la Jerusalem celeste : cube d'or translucide, muraille de jaspe, 12 fondements, 12 portes de perle
const STONES = [['jaspe', 0x5aa87a], ['saphir', 0x2a5ad8], ['calcédoine', 0x9ab8c8], ['émeraude', 0x1ac85a], ['sardonyx', 0xd86a4a], ['sardoine', 0xc82a2a], ['chrysolithe', 0xc8d84a], ['béryl', 0x4ac8b8], ['topaze', 0xf0b82a], ['chrysoprase', 0x7ae87a], ['hyacinthe', 0xf07a2a], ['améthyste', 0x9a4ad8]];
function pearlMat() { return M(0xf8f4fa, { emissive: new THREE.Color(0x4a4650) }); }
function makeCity(S = 4, o = {}) {
  const g = new THREE.Group();
  const cube = new THREE.Mesh(new THREE.BoxGeometry(S, S, S), new THREE.MeshLambertMaterial({ color: 0xffd870, emissive: new THREE.Color(0x6a4a10), transparent: true, opacity: o.cubeOp ?? 0.55, depthWrite: false }));
  cube.position.y = S / 2 + 0.36; g.add(cube);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(cube.geometry), new THREE.LineBasicMaterial({ color: new THREE.Color(0xfff0b0).multiplyScalar(1.6), transparent: true })); edges.position.copy(cube.position); g.add(edges);
  // 12 fondements (bandes de couleur) sous la muraille
  const R = S * 0.62, fh = 0.025;
  STONES.forEach(([, c], i) => { const b = box(2 * R + 0.06, fh, 2 * R + 0.06, M(c, { emissive: new THREE.Color(c).multiplyScalar(0.25) })); b.position.y = i * fh + fh / 2; g.add(b); });
  const wallY = 12 * fh, wh = S * 0.09, jasper = M(0x7ac8a0, { emissive: new THREE.Color(0x1a4a30) });
  const gates = [];
  for (let side = 0; side < 4; side++) {
    const sg = new THREE.Group(); sg.rotation.y = side * Math.PI / 2; g.add(sg);
    const w = box(2 * R, wh, 0.06, jasper); w.position.set(0, wallY + wh / 2, R); sg.add(w);
    for (let k = -1; k <= 1; k++) { const p = new THREE.Mesh(new THREE.CircleGeometry(wh * 0.42, 20), pearlMat()); p.position.set(k * R * 0.6, wallY + wh * 0.48, R + 0.035); sg.add(p); gates.push(p); }
  }
  g.userData = { cube, edges, gates, S };
  return g;
}
function clouds(scene, n, y, R, o = {}) { const mat = M(0xffffff, { emissive: new THREE.Color(o.em ?? 0x403c50), transparent: true, opacity: o.op ?? 0.85 }); const arr = []; for (let i = 0; i < n; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6 + hash(i) * 1.2, 1), mat); c.scale.y = 0.45; c.position.set((hash(i * 3) - 0.5) * R * 2, y + (hash(i * 5) - 0.5), (hash(i * 7) - 0.5) * R * 2); scene.add(c); arr.push(c); } return arr; }
function mountainSet(o = {}) {
  const B = base({ sky: [0x1a1a4a, 0xffc890], hemi: [0xfff0e0, 0x2a2a3a, 0.85], sun: [0xfff0d0, 1.1, [3, 8, 6]], shadowSize: 6, bloom: [0.55, 0.5, 0.82], exposure: 0.95, fog: [0x9a8aa8, 20, 120], target: [0, 1, 0], ...o });
  const { scene } = B;
  const peak = new THREE.Mesh(new THREE.ConeGeometry(6, 4, 7), M(0x6a5a52)); peak.position.set(0, -2.0, 0); scene.add(peak);
  scene.add(at(new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.2, 9), M(0x7a6a5a)), 0, 0.0 - 0.1, 0));
  for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(5 + hash(i) * 6, 5 + hash(i * 2) * 6, 6), M(0x4a4058)); m.position.set((hash(i * 3) - 0.5) * 70, -6, -20 - hash(i * 5) * 40); scene.add(m); }
  clouds(scene, 18, -3.5, 25);
  return B;
}
function angelBowl(an) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M(0xc89a40, { emissive: new THREE.Color(0x3a2008), side: THREE.DoubleSide })); an.hand.L.add(b); b.position.set(0, -0.08, 0.06); return b; }

// ---------- helpers ep43
function globe(r = 1.6) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(r, 3), M(0x2a5ab8, { emissive: new THREE.Color(0x0a1a3a) })));
  for (let i = 0; i < 14; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r * (0.18 + hash(i) * 0.2), 1), M(0x4a9a4a)); const a = hash(i * 3) * Math.PI * 2, b = (hash(i * 5) - 0.5) * 2.4; c.position.set(Math.cos(a) * Math.cos(b) * r * 0.93, Math.sin(b) * r * 0.93, Math.sin(a) * Math.cos(b) * r * 0.93); c.scale.y = 0.6; g.add(c); }
  return g;
}
function tear(h, s = 1) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), new THREE.MeshLambertMaterial({ color: 0x9ad8ff, emissive: new THREE.Color(0x2a5a8a) })); d.scale.y = 1.5; h.neck.add(d); d.userData.s = s; return d; }
function tearAt(d, u) { d.position.set(d.userData.s * 0.06, 0.16 - 0.1 * u, 0.15); }
function woman(seed = 4301) { return new Human({ skin: 0xa86c44, hair: 0x2a1a10, hairStyle: 'long', top: 0xf4ece0, bottom: 0xe8e0d0, robe: 0xf4ece0, robeL: 0.8, seed }); }
function strikeWord(scene, text, pos, color = '#ffffff') {
  const g = new THREE.Group(); g.position.set(...pos); scene.add(g);
  const l = card(text, { w: 0.62, h: 0.17, border: '#9adfff' }); g.add(l);
  const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.012), new THREE.MeshBasicMaterial({ color: 0xff4a3a, transparent: true, depthTest: false, depthWrite: false, toneMapped: false })); bar.renderOrder = 21; bar.position.z = 0.01; g.add(bar); g.userData.bar = bar; return g;
}

// ---------- helpers ep44
function whiteThrone(s = 1) {
  const g = new THREE.Group(); const wm = M(0xf0f0f8, { emissive: new THREE.Color(0x5a5a68) });
  for (let k = 0; k < 3; k++) g.add(at(box(4 - k * 0.8, 0.3, 2.4 - k * 0.4, wm), 0, 0.15 + k * 0.3, 0));
  g.add(at(box(1.4, 0.5, 1.0, wm), 0, 1.15, 0)); g.add(at(box(1.4, 2.2, 0.25, wm), 0, 2.0, -0.45));
  g.add(at(box(0.2, 0.6, 1.0, wm), -0.7, 1.4, 0)); g.add(at(box(0.2, 0.6, 1.0, wm), 0.7, 1.4, 0));
  const gl = glowStar(9, 0xffffff); gl.position.set(0, 2.2, 0.2); g.add(gl); g.userData.glow = gl;
  g.scale.setScalar(s); return g;
}
function orb(text, color = 0x2a2030) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 1), M(color, { emissive: new THREE.Color(0x2a1a4a) })));
  const r = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.02, 6, 40), G(0x8a5aff, 1.2)); r.rotation.x = 1.2; g.add(r);
  const l = card(text, { w: 1.3, h: 0.24, border: '#8a5aff' }); l.position.y = 0.8; g.add(l); return g;
}
function king(i) { return new Human({ skin: [0xd09a70, 0x8a5a3a][i % 2], hair: 0x2a1a10, hairStyle: 'short', beard: i % 2 ? 'full' : undefined, top: 0x8a2a3a, bottom: 0x5a1a2a, robe: 0x8a2a3a, robeL: 0.85, hat: 'crown', seed: 4400 + i }); }
function poor(i) { return new Human({ skin: [0xa86c44, 0xe0b890, 0x5a3420][i % 3], hair: [0x1a1210, 0x8a6a3a, 0x120c08][i % 3], hairStyle: ['short', 'long', 'curly'][i % 3], top: 0x9a8a6a, bottom: 0x7a6a50, robe: 0x9a8a6a, robeL: 0.75, seed: 4410 + i }); }

// ---------- helpers ep45
function pitSet(scene, pos) {
  const pit = new THREE.Group(); pit.position.set(...pos); scene.add(pit);
  for (let k = 0; k < 5; k++) { const r = new THREE.Mesh(new THREE.TorusGeometry(1.6 - k * 0.2, 0.08, 6, 30), M(0x4a4450)); r.rotation.x = Math.PI / 2; r.position.y = 0.06 - k * 0.15; pit.add(r); }
  const lid = new THREE.Group(); pit.add(lid); for (let k = -3; k <= 3; k++) { lid.add(at(box(0.08, 0.08, 3.2, M(0x7a7480)), k * 0.42, 0.12, 0)); lid.add(at(box(3.2, 0.08, 0.08, M(0x7a7480)), 0, 0.14, k * 0.42)); }
  const red = glowStar(5, 0xff5a3a); red.position.set(0, 0.5, 0); pit.add(red);
  pit.userData = { lid, red }; return pit;
}
function serpent(color = 0xff4a3a, n = 12) {
  const g = new THREE.Group(); const segs = [];
  for (let k = 0; k < n; k++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32 - k * 0.018, 1), holoMat(color, 0.5)); g.add(s); segs.push(s); }
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 5), holoMat(color, 0.55)); g.add(head);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), G(0xffe060, 2)); head.add(e); e.position.set(s * 0.1, -0.05, 0.12); }
  g.userData.tick = (t, up = 1) => { segs.forEach((s, k) => s.position.set(0.4 * Math.sin(t * 1.6 + k * 0.6), k * 0.36 * up, 0.2 * Math.cos(t * 1.3 + k * 0.5))); head.position.set(0.4 * Math.sin(t * 1.6 + n * 0.6), n * 0.36 * up + 0.2, 0.25); head.rotation.x = 0.5; };
  return g;
}
function army(scene, n, R0, R1, cx = 0, cz = 0, color = 0x2a2430) {
  const arr = []; for (let i = 0; i < n; i++) { const g = new THREE.Group(); g.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 4), M(color)), 0, 0.25, 0)); g.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), M(0x5a4a40)), 0, 0.55, 0)); g.add(at(box(0.015, 0.8, 0.015, M(0x8a8a90)), 0.12, 0.4, 0)); const a = hash(i * 3) * Math.PI * 2, r = R0 + hash(i * 7) * (R1 - R0); g.userData = { a, r }; g.position.set(cx + Math.cos(a) * r, 0, cz + Math.sin(a) * r); scene.add(g); arr.push(g); }
  return arr;
}

// le diable : silhouette de bouc (corps massif a poils gris fonce, tete de bouc barbue, grandes cornes annelees),
// ailes de dragon, troisieme oeil au front (modeles envoyes par Mr A)
function dragonWing(sx) {
  const pts = [[0, 0], [0.45, 0.62], [1.0, 1.05], [1.45, 1.15], [1.15, 0.55], [1.2, 0.2], [0.85, 0.28], [0.8, -0.12], [0.5, 0.05], [0.38, -0.32], [0.15, -0.08], [0.04, -0.4], [0, -0.1]];
  const sh = new THREE.Shape(); sh.moveTo(0, 0); pts.slice(1).forEach(p => sh.lineTo(p[0], p[1])); sh.lineTo(0, 0);
  const g = new THREE.Group();
  const mem = new THREE.Mesh(new THREE.ShapeGeometry(sh), M(0x3a2a2c, { side: THREE.DoubleSide, emissive: new THREE.Color(0x140a0a) })); mem.scale.x = sx; g.add(mem);
  const bone = M(0x4a3c38), claw = M(0xd8c8a8);
  [[0, 0, 1.45, 1.15], [0.45, 0.62, 1.2, 0.2], [0.45, 0.62, 0.8, -0.12], [0.3, 0.4, 0.38, -0.32], [0.15, 0.2, 0.04, -0.4]].forEach(([x0, y0, x1, y1]) => { const l = Math.hypot(x1 - x0, y1 - y0); const bb = box(l, 0.04, 0.04, bone); bb.position.set(sx * (x0 + x1) / 2, (y0 + y1) / 2, 0.01); bb.rotation.z = sx * Math.atan2(y1 - y0, x1 - x0); g.add(bb); });
  [[1.45, 1.15], [0.45, 0.62]].forEach(([x, y]) => { const c = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.14, 5), claw); c.position.set(sx * x, y + 0.06, 0.01); g.add(c); });
  return g;
}
function hornCurve(sx) {
  return new THREE.CatmullRomCurve3([[0, 0, 0], [0.05, 0.14, -0.03], [0.13, 0.27, -0.07], [0.25, 0.36, -0.08], [0.38, 0.38, -0.05], [0.48, 0.33, 0], [0.54, 0.25, 0.04]].map(([x, y, z]) => new THREE.Vector3(sx * x, y, z)));
}
function devil(o = {}) {
  const g = new THREE.Group();
  const fur = 0x6a6c72;
  const h = new Human({ skin: fur, hair: 0x2a2c30, hairStyle: 'bald', top: fur, bottom: fur, shoes: 0x1a1a1a, seed: 4520 });
  h.root.scale.setScalar(1.15); g.add(h.root);
  const furM = M(0x7a7c82), furD = M(0x55575c);
  // poils hirsutes : epaules, poitrine, avant-bras, cuisses
  for (let i = 0; i < 26; i++) { const t = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07 + hash(i) * 0.05, 0), i % 2 ? furM : furD); t.position.set((hash(i * 3) - 0.5) * 0.44, 0.1 + hash(i * 5) * 0.55, (hash(i * 7) - 0.5) * 0.26 + (i % 3 ? 0.06 : -0.06)); h.spine.add(t); }
  for (const k of ['L', 'R']) for (let i = 0; i < 3; i++) { const t = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), furM); t.position.set(0, -0.1 - i * 0.08, 0); h.el[k].add(t); const u = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), furD); u.position.set(0, -0.1 - i * 0.12, 0); h.hip[k].add(u); }
  // tete de bouc : museau, nez, barbe, oreilles tombantes, poils du front
  const face = M(0x8a8c90);
  h.neck.add(at(box(0.13, 0.12, 0.16, face), 0, 0.1, 0.17));
  h.neck.add(at(box(0.1, 0.05, 0.04, M(0x8a5a5a)), 0, 0.13, 0.26));
  h.neck.add(at(box(0.09, 0.02, 0.02, M(0x3a1a1a)), 0, 0.065, 0.255));
  const beard = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.32, 6), furD); beard.rotation.x = Math.PI; beard.position.set(0, -0.06, 0.15); h.neck.add(beard);
  for (const s of [-1, 1]) { const ear = box(0.16, 0.05, 0.08, face); ear.position.set(s * 0.2, 0.2, 0.02); ear.rotation.z = s * -0.35; h.neck.add(ear); }
  for (let i = 0; i < 7; i++) { const t = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), furD); t.position.set((i - 3) * 0.045, 0.3 + (i % 2) * 0.02, 0.06 - Math.abs(i - 3) * 0.02); h.neck.add(t); }
  // yeux ambres et troisieme oeil au front
  h.eyes.forEach(e => { e.material = G(0xe0a030, 1.6); e.scale.set(1.1, 0.7, 1); });
  h.eyes.forEach(e => { const p = box(0.012, 0.03, 0.01, new THREE.MeshBasicMaterial({ color: 0x000000 })); p.position.z = 0.012; e.add(p); });
  h.brows.forEach(b => b.visible = false);
  const third = new THREE.Group(); third.position.set(0, 0.255, 0.15); h.neck.add(third);
  third.add(box(0.05, 0.075, 0.015, M(0xd8d0c0))); third.add(at(box(0.026, 0.045, 0.01, G(0xe0a030, 1.6)), 0, 0, 0.01)); third.add(at(box(0.008, 0.03, 0.01, new THREE.MeshBasicMaterial({ color: 0x000000 })), 0, 0, 0.016));
  // grandes cornes annelees
  const hornM = M(0xb88a48), ringM = M(0x5a3a1a);
  for (const sx of [-1, 1]) {
    const hg = new THREE.Group(); hg.position.set(sx * 0.07, 0.3, -0.02); h.neck.add(hg);
    const curve = hornCurve(sx);
    hg.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.035, 8), hornM));
    for (let k = 0; k < 9; k++) { const u = k / 9, p = curve.getPoint(u), tg = curve.getTangent(u); const r = new THREE.Mesh(new THREE.TorusGeometry(0.037 * (1 - 0.4 * u), 0.008, 4, 10), ringM); r.position.copy(p); r.lookAt(p.clone().add(tg)); hg.add(r); }
    hg.scale.setScalar(1.15);
  }
  // ailes de dragon
  const wings = [-1, 1].map(sx => { const w = dragonWing(sx); w.position.set(sx * 0.12, 0.5, -0.16); w.scale.setScalar(o.wing ?? 1.3); h.spine.add(w); return w; });
  g.userData = { h, wings, tick: (t, k = 1) => wings.forEach((w, i) => { w.rotation.y = (i ? -1 : 1) * (0.35 + 0.12 * Math.sin(t * 2.2) * k); w.rotation.z = (i ? 1 : -1) * 0.05 * Math.sin(t * 2.2) * k; }) };
  g.userData.tick(0);
  return g;
}
// ---------- le grand dragon rouge (Apocalypse 12, 3) : sept tetes, dix cornes, ailes de dragon
function dragon() {
  const g = new THREE.Group();
  const red = M(0xa8261c, { emissive: new THREE.Color(0x2a0604) }), belly = M(0xd8985a), dark = M(0x5a120c), horn = M(0xe8dcc0), eyeM = G(0xffd040, 2.2);
  const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 1), red); body.scale.set(1.0, 0.85, 1.5); body.position.set(0, 1.0, 0); g.add(body);
  const bel = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 1), belly); bel.scale.set(0.8, 0.6, 1.3); bel.position.set(0, 0.85, 0.12); g.add(bel);
  for (let k = 0; k < 6; k++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 4), dark); sp.position.set(0, 1.5 - k * 0.02, 0.5 - k * 0.22); g.add(sp); }
  // pattes
  const legs = [];
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { const lg = new THREE.Group(); lg.position.set(sx * 0.42, 0.8, sz * 0.5); g.add(lg); lg.add(at(box(0.2, 0.75, 0.22, red), 0, -0.37, 0)); for (let c = -1; c <= 1; c++) { const cl = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 4), horn); cl.rotation.x = Math.PI / 2; cl.position.set(c * 0.06, -0.76, 0.14); lg.add(cl); } legs.push(lg); }
  // queue
  const tail = []; for (let k = 0; k < 12; k++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22 - k * 0.015, 1), red); g.add(s); tail.push(s); }
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 4), dark); g.add(tip);
  // sept cous et sept tetes ; dix cornes (3 tetes a 2 cornes, 4 tetes a 1)
  const necks = [];
  for (let i = 0; i < 7; i++) {
    const a = (i - 3) * 0.42; const segs = [];
    for (let k = 0; k < 10; k++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13 - k * 0.005, 1), red); g.add(s); segs.push(s); }
    const head = new THREE.Group(); head.scale.setScalar(1.7); g.add(head);
    head.add(at(box(0.2, 0.17, 0.3, red), 0, 0, 0)); head.add(at(box(0.15, 0.1, 0.18, red), 0, -0.02, 0.2)); head.add(at(box(0.13, 0.05, 0.22, dark), 0, -0.09, 0.12));
    for (const s of [-1, 1]) { head.add(at(box(0.04, 0.035, 0.02, eyeM), s * 0.07, 0.04, 0.15)); head.add(at(box(0.03, 0.02, 0.02, dark), s * 0.04, 0.0, 0.3)); }
    const nh = i % 2 === 0 && i !== 6 ? 2 : 1;
    for (let hN = 0; hN < nh; hN++) { const hs = nh === 2 ? (hN ? 1 : -1) : 0; const hc = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.2, 5), horn); hc.position.set(hs * 0.06, 0.15, -0.08); hc.rotation.x = -0.6; hc.rotation.z = -hs * 0.3; head.add(hc); }
    necks.push({ a, segs, head });
  }
  // ailes de dragon
  const wings = [-1, 1].map(sx => { const w = dragonWing(sx); w.position.set(sx * 0.3, 1.35, -0.1); w.scale.setScalar(1.9); w.children[0].material = M(0x6a1610, { side: THREE.DoubleSide, emissive: new THREE.Color(0x1a0402) }); g.add(w); return w; });
  g.userData = {
    necks, wings, tick(t, k = 1) {
      necks.forEach(({ a, segs, head }, i) => {
        const sw = 0.12 * Math.sin(t * 1.4 + i * 0.9) * k;
        segs.forEach((s, j) => { const u = (j + 1) / 10; const r = 0.2 + u * 1.25; s.position.set(Math.sin(a + sw) * r, 1.2 + 1.1 * Math.sin(u * 1.9) * (0.85 + 0.15 * Math.cos(i * 1.3)), 0.6 + Math.cos(a + sw) * u * 0.7); });
        const last = segs[9].position; head.position.set(last.x, last.y + 0.1, last.z + 0.12); head.rotation.set(0.15 + 0.1 * Math.sin(t * 1.1 + i) * k, a * 0.6 + sw, 0);
      });
      tail.forEach((s, j) => { const u = j / 11; s.position.set(0.45 * Math.sin(u * 3 + t * 1.2) * u, 0.85 - 0.6 * u, -0.85 - u * 1.9); });
      tip.position.copy(tail[11].position).add(new THREE.Vector3(0, 0, -0.18)); tip.rotation.x = -Math.PI / 2;
      wings.forEach((w, i) => { w.rotation.y = (i ? -1 : 1) * (0.3 + 0.15 * Math.sin(t * 2.0) * k); });
    }
  };
  g.userData.tick(0);
  return g;
}

// ---------- helpers ep46
function keyAndChain(an) {
  const key = new THREE.Group(); key.add(box(0.04, 0.3, 0.04, G(0xffd070, 1.6))); key.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 6, 16), G(0xffd070, 1.6)), 0, 0.2, 0)); key.add(at(box(0.1, 0.04, 0.04, G(0xffd070, 1.6)), 0.05, -0.12, 0)); an.hand.R.add(key); key.position.set(0, -0.2, 0.05);
  return key;
}
function chainLinks(scene, n = 18) { const m = M(0xb8b4b0, { emissive: new THREE.Color(0x2a2826) }); const g = new THREE.Group(); for (let k = 0; k < n; k++) { const l = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.016, 5, 10), m); l.rotation.y = k % 2 ? Math.PI / 2 : 0; g.add(l); } scene.add(g); g.userData.span = (a, b, sag = 0.25) => g.children.forEach((l, k) => { const u = k / (n - 1); l.position.lerpVectors(a, b, u); l.position.y -= sag * Math.sin(Math.PI * u); }); return g; }
function bodyChains(dr) { const m = M(0xb8b4b0, { emissive: new THREE.Color(0x2a2826) }); return [0.9, 1.15].map(y => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.035, 6, 28), m); r.rotation.x = Math.PI / 2; r.scale.set(1, 1.5, 1); r.position.set(0, y, 0); dr.add(r); return r; }); }
function waxSeal() { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.08, 20), M(0xb01a1a, { emissive: new THREE.Color(0x3a0404) }))); const l = label('✠', { w: 0.6, h: 0.6, color: '#ffd0a0', font: 'bold 400px Inter' }); l.rotation.x = -Math.PI / 2; l.position.y = 0.05; g.add(l); return g; }
function horse() {
  const g = new THREE.Group(); const m = M(0xf4f2ee); const legs = [];
  g.add(at(box(0.45, 0.5, 1.2, m), 0, 1.05, 0));
  const nk = box(0.22, 0.7, 0.28, m); nk.position.set(0, 1.45, 0.55); nk.rotation.x = 0.5; g.add(nk);
  g.add(at(box(0.22, 0.26, 0.5, m), 0, 1.78, 0.82)); g.add(at(box(0.06, 0.5, 0.4, M(0xe8e0d0)), 0, 1.6, 0.42));
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { const lg = new THREE.Group(); lg.position.set(sx * 0.16, 0.8, sz * 0.48); g.add(lg); lg.add(at(box(0.11, 0.8, 0.11, m), 0, -0.4, 0)); legs.push(lg); }
  g.userData.walk = (ph, a = 0.4) => legs.forEach((l, i) => l.rotation.x = a * Math.sin(ph + [0, Math.PI, Math.PI, 0][i]));
  return g;
}


// ---------- helpers ep47 : le grand cavalier, son cheval blanc, le ciel dechire, l'armee celeste
function bigHorse(col = 0xf6f4f0) {
  const g = new THREE.Group(); const m = M(col, { emissive: new THREE.Color(col).multiplyScalar(0.12) }), mane = M(0xe0dcd4), hoof = M(0x8a8478); const legs = [];
  g.add(at(box(0.5, 0.55, 1.3, m), 0, 1.1, 0));
  const nk = box(0.24, 0.8, 0.32, m); nk.position.set(0, 1.55, 0.62); nk.rotation.x = 0.55; g.add(nk);
  const hd = new THREE.Group(); hd.position.set(0, 1.92, 0.95); g.add(hd); hd.add(at(box(0.24, 0.28, 0.56, m), 0, 0, 0.12)); hd.rotation.x = 0.35;
  for (const s of [-1, 1]) { hd.add(at(box(0.04, 0.05, 0.02, M(0x1a1a1a)), s * 0.12, 0.05, 0.12)); const ear = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 4), m); ear.position.set(s * 0.07, 0.19, -0.08); hd.add(ear); }
  for (let k = 0; k < 6; k++) g.add(at(box(0.08, 0.16, 0.14, mane), 0, 1.95 - k * 0.11, 0.78 - k * 0.07));
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.8, 6), mane); tail.position.set(0, 0.95, -0.82); tail.rotation.x = -2.6; g.add(tail);
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { const lg = new THREE.Group(); lg.position.set(sx * 0.17, 0.85, sz * 0.52); g.add(lg); lg.add(at(box(0.12, 0.78, 0.12, m), 0, -0.39, 0)); lg.add(at(box(0.13, 0.08, 0.14, hoof), 0, -0.8, 0.01)); legs.push(lg); }
  g.userData.gallop = (ph, a = 0.7) => { legs.forEach((l, i) => l.rotation.x = a * Math.sin(ph + [0, 0.6, Math.PI, Math.PI + 0.6][i])); tail.rotation.x = -2.6 + 0.15 * Math.sin(ph); };
  return g;
}
function bigRider() {
  const hs = bigHorse();
  const h = new Human({ skin: 0xc8946a, hair: 0x2a1a10, hairStyle: 'long', beard: 'full', top: 0xffffff, bottom: 0xf0ece4, robe: 0xffffff, robeL: 0.6, seed: 4700 });
  hs.add(h.root); h.root.position.set(0, 1.12, -0.08); h.pose(L.sitPose(0.32, { lL: 1.2, lR: 1.2, kL: 1.2, kR: 1.2, lsL: 0.5, lsR: 0.5 }));
  // yeux comme une flamme de feu
  h.eyes.forEach(e => { e.material = G(0xffa020, 3); const f = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.07, 5), G(0xff7a10, 3)); f.position.set(0, 0.04, 0.005); e.add(f); });
  // plusieurs diademes
  for (let r = 0; r < 3; r++) { const c = new THREE.Group(); c.position.set(0, 0.32 + r * 0.075, 0); c.scale.setScalar(1 - r * 0.18); h.neck.add(c); const hm = G(0xffcc55, 1.6); c.add(box(0.31, 0.035, 0.31, hm)); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; c.add(at(box(0.04, 0.07, 0.04, hm), Math.cos(a) * 0.14, 0.05, Math.sin(a) * 0.14)); } }
  // manteau rouge
  const capeM = M(0xb0141c, { side: THREE.DoubleSide, emissive: new THREE.Color(0x300406) });
  const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.7, 1, 4), capeM); cape.position.set(0, -0.1, -0.2); cape.rotation.x = 0.5; h.spine.add(cape);
  for (const s of [-1, 1]) { h.spine.add(at(box(0.2, 0.09, 0.34, capeM), s * 0.21, 0.58, -0.02)); h.spine.add(at(box(0.06, 0.62, 0.3, capeM), s * 0.3, 0.2, -0.04)); }
  // epee de lumiere qui sort de la bouche
  const sword = new THREE.Group(); sword.position.set(0, 0.095, 0.16); h.neck.add(sword);
  sword.add(at(box(0.05, 0.016, 1.4, G(0xfffbe8, 3)), 0, 0, 0.7)); const tipS = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 4), G(0xfffbe8, 3)); tipS.rotation.x = Math.PI / 2; tipS.position.z = 1.48; sword.add(tipS);
  for (const z of [0.9, 1.4]) { const sg = glowStar(0.35, 0xfff4d0); sg.position.set(0, 0, z); sword.add(sg); }
  const name = label('ROI DES ROIS ET SEIGNEUR DES SEIGNEURS', { w: 0.5, h: 0.05, color: '#ffd070', font: 'bold 50px Inter' }); name.position.set(0.21, -0.12, 0.2); name.rotation.y = 0.9; h.pelvis.add(name);
  const fl = new THREE.PointLight(0xffe8d0, 1.6, 2.2, 1.2); fl.position.set(0, 0.25, 0.7); h.neck.add(fl);
  hs.userData.rider = h; hs.userData.sword = sword; hs.userData.name = name; hs.userData.cape = cape;
  return hs;
}
function smallRider(seed) {
  const hs = bigHorse(0xeeeae4); const h = new Human({ skin: [0xd09a70, 0x8a5a3a, 0xa86c44, 0xe0b890][seed % 4], hair: [0x1a1210, 0x5a3a20, 0x2a1a10][seed % 3], hairStyle: ['short', 'long', 'curly'][seed % 3], top: 0xffffff, bottom: 0xffffff, robe: 0xffffff, robeL: 0.6, seed: 4710 + seed });
  hs.add(h.root); h.root.position.set(0, 1.12, -0.08); h.pose(L.sitPose(0.32, { lL: 1.2, lR: 1.2, kL: 1.2, kR: 1.2, lsL: 0.5, lsR: 0.5 })); hs.userData.rider = h; return hs;
}
// le cavalier SURGIT de la dechirure (petit au fond), puis galope vers nous
function emerge(R, from, to, u, o = {}) {
  const e = u * u * (3 - 2 * u), arc = o.arc ?? 0.8, dx = to[0] - from[0], dz = to[2] - from[2];
  R.position.set(lerp(from[0], to[0], e), lerp(from[1], to[1], e) + arc * Math.sin(Math.PI * e), lerp(from[2], to[2], e));
  R.rotation.order = 'YXZ'; R.rotation.y = lerp(Math.atan2(dx, dz) + 0.3, o.endY ?? 0.9, e); R.rotation.x = 0.2 * (1 - e);
}
// l'armee en lin blanc suit le cavalier hors de la dechirure
function followers(scene, n) {
  const a = []; for (let i = 0; i < n; i++) { const r = smallRider(i); r.scale.setScalar(1.15); r.visible = false; scene.add(r); a.push(r); }
  a.update = (t, t0, dur, from, k = 1) => a.forEach((r, i) => {
    const row = Math.floor(i / 4), col = i % 4, x = (col - 1.5) * 1.9 + (row % 2) * 0.7, dl = 1.2 + row * 0.9 + col * 0.25;
    const u = sstep(t0 + dl, t0 + dl + dur, t); emerge(r, from, [x, 0, -6.5 - row * 2.6], u, { arc: 0.8, endY: 0.35 - col * 0.2 });
    r.userData.gallop(t * (7 - 3 * u) + i, 0.65); r.userData.rider.face(0, 'neutral', t); fade(r, sstep(0, 0.12, u) * k);
  });
  return a;
}
function skyRift(scene, pos, H = 14, W = 4) {
  // le ciel qui se dechire : une fente lumineuse aux bords dentes
  const sh = new THREE.Shape(); const n = 14; sh.moveTo(0, H / 2);
  for (let i = 1; i <= n; i++) { const y = H / 2 - H * i / n; sh.lineTo((W / 2) * (0.35 + 0.65 * Math.sin(Math.PI * i / n)) * (1 + 0.35 * (hash(i * 3) - 0.5)) , y); }
  for (let i = n - 1; i >= 1; i--) { const y = H / 2 - H * i / n; sh.lineTo(-(W / 2) * (0.35 + 0.65 * Math.sin(Math.PI * i / n)) * (1 + 0.35 * (hash(i * 7) - 0.5)), y); }
  const r = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: 0xffe8c0, transparent: true, opacity: 0.9, depthWrite: false, fog: false })); r.position.set(...pos); scene.add(r);
  const halo = glowStar(H * 0.75, 0xfff0c8); halo.position.set(pos[0], pos[1], pos[2] - 0.2); scene.add(halo);
  const edges = []; for (let i = 0; i < 10; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2 + hash(i) * 1.4, 1), M(0x2a2440, { emissive: new THREE.Color(0x0e0a1a) })); c.scale.y = 0.5; c.position.set(pos[0] + (i % 2 ? 1 : -1) * (W * 0.55 + hash(i * 5) * 2), pos[1] + (hash(i * 9) - 0.5) * H * 0.9, pos[2] + 0.5); c.userData.x0 = c.position.x; scene.add(c); edges.push(c); }
  // dechirement : la fente grandit d'abord en hauteur, puis en largeur ; les nuages s'ecartent
  const open = k => { r.scale.y = Math.max(0.01, sstep(0, 0.55, k)); r.scale.x = Math.max(0.01, sstep(0.25, 1, k)); halo.material.opacity = k; edges.forEach(c => { c.position.x = pos[0] + (c.userData.x0 - pos[0]) * (0.35 + 0.65 * sstep(0.25, 1, k)); }); };
  open(0);
  return { rift: r, halo, edges, open };
}

// ---------- couverture : le grand cavalier descend du ciel dechire, suivi de son armee
SETS.cover = () => {
  const B = base({ bg: 0x0a0818, hemi: [0xe8e0ff, 0x1a1428, 0.9], sun: [0xfff0d8, 1.1, [2, 5, 8]], shadow: false, bloom: [0.55, 0.5, 0.85], exposure: 0.95, fog: [0x0a0818, 25, 90] }); const { scene, cam } = B;
  scene.add(L.stars(600, 80, 1.2));
  const sky = skyRift(scene, [-2.2, 7, -18], 18, 5); sky.open(1);
  for (let i = 0; i < 12; i++) { const r = smallRider(i); const row = Math.floor(i / 4), col = i % 4; r.position.set((col - 1.5) * 2.2 + (row % 2) * 0.8, 3.6 + row * 1.7, -8 - row * 3.2); r.rotation.x = 0.28; r.rotation.y = (col - 1.5) * -0.05; r.userData.gallop(i * 0.7); scene.add(r); }
  const R = bigRider(); R.position.set(-0.2, 1.3, -1.6); R.rotation.order = 'YXZ'; R.rotation.x = 0.18; R.rotation.y = 0.5; R.scale.setScalar(1.5); R.userData.gallop(0.8, 0.8); scene.add(R);
  R.userData.rider.face(0, 'serious', 0); R.userData.rider.pose(L.sitPose(0.32, { lL: 1.2, lR: 1.2, kL: 1.2, kR: 1.2, lsL: 0.5, lsR: 0.5, aR: [1.3, 0.25], aL: [0.6, 0.3] }));
  faceLight(scene, [0.6, 5.0, 1.0], 3.5, 0xffe8d0);
  clouds(scene, 18, 0.2, 10, { em: 0x2a2440, op: 0.85 });
  return { ...B, update() { cam.position.set(0.6, 3.8, 6.4); cam.fov = 56; cam.updateProjectionMatrix(); cam.lookAt(0.1, 2.9, -3); } };
};

function plain(scene) { const gp = L.groundPlane(120, 40, 0x4a4258, 0.4, 7); scene.add(gp); return gp; }
function holoAnimal(kind, color = 0x9adfff) { const a = L.makeAnimal(kind); a.traverse(m => { if (m.isMesh) m.material = holoMat(color, 0.45); }); return a; }
function heavenSky(o = {}) { return base({ bg: 0x0a0818, hemi: [0xe8e0ff, 0x1a1428, 0.9], sun: [0xfff0d8, 1.1, [2, 5, 8]], shadow: false, bloom: [0.55, 0.5, 0.85], exposure: 0.95, fog: [0x0a0818, 25, 90], ...o }); }

// gros plan sur le visage du cavalier, de trois quarts avant (la tete du cheval reste plus bas)
function faceShot(cam, R, w, dist = 2.9, side = 1.1) {
  if (w <= 0.001) return;
  R.updateMatrixWorld(true); const h = new THREE.Vector3(); R.userData.rider.head.getWorldPosition(h);
  const dir = new THREE.Vector3(Math.sin(R.rotation.y), 0, Math.cos(R.rotation.y)), perp = new THREE.Vector3(dir.z, 0, -dir.x);
  const p = h.clone().addScaledVector(dir, dist).addScaledVector(perp, -side); p.y += 0.35;
  const q0 = cam.quaternion.clone(); cam.position.lerp(p, w); cam.lookAt(h.x, h.y - 0.05, h.z); const q1 = cam.quaternion.clone(); cam.quaternion.copy(q0).slerp(q1, w);
  const f = lerp(cam.fov, 46, w); if (cam.fov !== f) { cam.fov = f; cam.updateProjectionMatrix(); }
}

// ---------- intro : le ciel se dechire, le cavalier apparait
SETS.intro = () => {
  const B = heavenSky(); const { scene, cam } = B; scene.add(L.stars(600, 80, 1.2));
  const sky = skyRift(scene, [0, 7, -18], 18, 5);
  const fol = followers(scene, 8); const R = bigRider(); R.rotation.order = 'YXZ'; R.scale.setScalar(1.3); scene.add(R); faceLight(scene, [0.5, 4.5, 0], 3.0, 0xffe8d0);
  const rig = claudeRig(scene, [1.1, -0.2, 1.4], -0.5, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28); faceLight(scene, [0.9, 0.6, 2.8], 1.0);
  scene.add(at(new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.15, 10), M(0x2a2430)), 1.0, -0.28, 1.4));
  const back = label('◀ une scène avant', { w: 0.8, h: 0.12, color: '#ffd070', font: 'bold 80px Inter' }); rig.holoG.add(back);
  const K = cardsMgr(scene, cam);
  K('le ciel s\'ouvre… un cheval blanc', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, 2.0, C.serie, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      sky.open(sstep(0.3, 3.5, t)); const u = sstep(3.2, 9.0, t); emerge(R, [0, 6, -17], [0.6, 0.2, -3], u, { endY: 0.6 }); R.userData.gallop(t * (7 - 3 * u), 0.7);
      R.userData.rider.face(0, 'serious', t);
      const bk = win(t, C.serie + 0.3, C.title, 0.3, 0.3); beamOn(rig, bk, t); fade(back, bk); back.lookAt(cam.position); rig.c.update(t, env('claude', t), {});
      const hide = win(t, C.serie + 0.3, SC.cavalier.start + 1, 0.3, 0.3); fade(R, (1 - hide) * sstep(0, 0.12, u)); fol.update(t, 3.2, 5.6, [0, 6, -17], 1 - hide); sky.rift.material.opacity = 0.9 * (1 - hide); sky.halo.material.opacity *= 1 - hide;
      camKeys(cam, t, [{ t: 0, p: [0.4, 3.6, 8.0], l: [0, 5.2, -12], f: 58 }, { t: C.serie, p: [0.6, 3.4, 8.0], l: [0.2, 3.4, -8], f: 58 }, { t: C.serie + 0.8, p: [0.9, 0.5, 4.2], l: [0.6, 0.1, 0], f: 48 }, { t: SC.cavalier.start, p: [0.8, 0.5, 4.0], l: [0.6, 0.1, 0], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- le cavalier descend ; le triomphe romain et l'ane de Zacharie ; les diademes
SETS.cavalier = () => {
  const B = heavenSky(); const { scene, cam } = B; scene.add(L.stars(600, 80, 1.2)); plain(scene);
  const sky = skyRift(scene, [0, 8, -20], 20, 5); const fol = followers(scene, 8);
  const R = bigRider(); R.rotation.order = 'YXZ'; R.rotation.y = 0.9; R.scale.setScalar(1.3); scene.add(R); const fl = faceLight(scene, [0.5, 4, 1], 3.0, 0xffe8d0);
  const j = john(); j.place(1.9, 0, 2.0, -0.6); scene.add(j.root); faceLight(scene, [1.6, 1.7, 4.0], 1.3);
  const roman = holoAnimal('zebra', 0xffd070); roman.position.set(-1.6, 0, 0.5); roman.rotation.y = 0.6; scene.add(roman); roman.children.forEach(c => { if (c.geometry && c.geometry.parameters && c.geometry.parameters.height === 0.06) c.visible = false; });
  const donkey = holoAnimal('zebra', 0x9adfff); donkey.scale.setScalar(0.6); donkey.position.set(-1.0, 0, 1.2); donkey.rotation.y = 0.5; scene.add(donkey);
  const K = cardsMgr(scene, cam); refCard(K);
  K('Rome : les généraux vainqueurs défilaient sur des chevaux blancs', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, C.triomphe + 0.3, C.triomphe + 5, 0.3, 0.2), -0.6);
  K('Matthieu 21 : Jésus entre à Jérusalem sur un âne', { w: 1.6, h: 0.24, border: '#9adfff' }, t => win(t, C.triomphe + 5.2, C.zacharie, 0.3, 0.2), -0.6);
  K('Zacharie 9, 9 : « humble et monté sur un âne »', { w: 1.6, h: 0.24, border: '#9adfff' }, t => win(t, C.zacharie + 0.3, C.zacharie + 8, 0.3, 0.2), -0.6);
  K('« plusieurs diadèmes » · le dragon n\'en avait que 7', { w: 1.6, h: 0.24, border: '#ffcc55' }, t => win(t, C.diademes + 0.3, SC.noms.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.cavalier.start; sky.open(sstep(T0, T0 + 3, t)); const d = sstep(T0 + 2, T0 + 9, t); emerge(R, [0, 7, -20], [-0.2, 0, -3], d, { endY: 0.9 }); fade(R, sstep(0, 0.12, d)); fol.update(t, T0 + 2, 5.6, [0, 7, -20], 1 - sstep(C.triomphe - 1, C.triomphe, t)); R.userData.gallop(t * (7 - 5 * d), 0.7 - 0.5 * d); R.userData.rider.face(0, 'serious', t); fl.position.set(R.position.x + 0.6, R.position.y + 3.5, R.position.z + 2.5);
      fade(roman, win(t, C.triomphe, C.triomphe + 5, 0.4, 0.4)); fade(donkey, win(t, C.triomphe + 5, C.zacharie + 8, 0.4, 0.4));
      j.pose({ hp: -0.2 }); j.face(0, 'awe', t);
      camKeys(cam, t, [{ t: T0, p: [0.4, 3.6, 8.5], l: [0, 4.8, -12], f: 58 }, { t: T0 + 9, p: [0.5, 2.0, 6.5], l: [0, 2.4, -3], f: 54 }, { t: C.triomphe, p: [-0.6, 1.6, 5.0], l: [-1.2, 1.0, 0.5], f: 52 }, { t: C.zacharie + 8, p: [-0.6, 1.6, 5.0], l: [-1.0, 1.0, 1.0], f: 52 }, { t: C.diademes - 2, p: [0.5, 2.4, 6.0], l: [0, 2.4, -3], f: 52 }, { t: SC.noms.start, p: [0.5, 2.4, 6.0], l: [0, 2.4, -3], f: 52 }]);
      faceShot(cam, R, sstep(C.diademes - 2.5, C.diademes - 1, t));
      K.update(t);
    }
  };
};

// ---------- le vetement teint de sang ; la Parole de Dieu ; Roi des rois
SETS.noms = () => {
  const B = heavenSky(); const { scene, cam } = B; scene.add(L.stars(600, 80, 1.2)); plain(scene);
  const sky = skyRift(scene, [0, 8, -20], 20, 5); sky.open(1);
  const R = bigRider(); R.rotation.order = 'YXZ'; R.rotation.y = 0.9; R.scale.setScalar(1.3); R.position.set(-0.6, 0, -3); scene.add(R); faceLight(scene, [0.8, 3.6, -0.5], 3.0, 0xffe8d0);
  const sc = scroll(0.9); sc.position.set(0.9, 2.2, -0.6); sc.rotation.x = 1.1; scene.add(sc);
  const big = card('ROI DES ROIS\nET SEIGNEUR DES SEIGNEURS', { w: 1.6, h: 0.5, border: '#ffd070', color: '#ffd070' }); scene.add(big);
  const K = cardsMgr(scene, cam); refCard(K);
  K('Isaïe 63 : le sang des ennemis… ou celui de l\'Agneau ?', { w: 1.6, h: 0.24, border: '#b0141c' }, t => win(t, C.sang + 0.3, C.parole, 0.3, 0.2), -0.6);
  K('Jean 1, 1 : « Au commencement était la Parole »', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.parole + 0.3, C.roi, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.noms.start; R.userData.gallop(t * 2, 0.2); R.userData.rider.face(0, 'serious', t);
      fade(sc, win(t, C.parole, C.roi, 0.4, 0.4)); fade(big, win(t, C.roi + 0.5, SC.armee.start, 0.4, 0.3)); camCard(cam, big, 0.86, 0.1);
      camKeys(cam, t, [{ t: T0, p: [2.4, 2.4, 4.0], l: [-0.4, 2.0, -3], f: 52 }, { t: C.parole, p: [2.0, 2.6, 2.8], l: [0.6, 2.2, -1.0], f: 50 }, { t: C.roi, p: [3.0, 2.2, 3.6], l: [-0.4, 1.8, -3], f: 54 }, { t: SC.armee.start, p: [3.0, 2.2, 3.8], l: [-0.4, 1.8, -3], f: 54 }]);
      faceShot(cam, R, win(t, T0 + 1, C.parole, 1.2, 0.8));
      K.update(t);
    }
  };
};

// ---------- l'armee en lin blanc ; l'epee de la bouche
SETS.armee = () => {
  const B = heavenSky(); const { scene, cam } = B; scene.add(L.stars(600, 80, 1.2)); plain(scene);
  const sky = skyRift(scene, [0, 8, -22], 20, 5);
  const army = []; for (let i = 0; i < 16; i++) { const r = smallRider(i); const row = Math.floor(i / 4), col = i % 4; r.userData.base = [(col - 1.5) * 2.2 + (row % 2) * 0.8, row]; scene.add(r); army.push(r); }
  const R = bigRider(); R.rotation.order = 'YXZ'; R.rotation.y = 0.9; R.scale.setScalar(1.3); scene.add(R); const fl = faceLight(scene, [0.5, 4, 1], 3.0, 0xffe8d0);
  const K = cardsMgr(scene, cam); refCard(K);
  K('fin lin blanc : pas d\'armure, pas d\'armes', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, C.lin + 0.3, C.epee, 0.3, 0.2), -0.6);
  K('Isaïe 11, 4 : il frappe la terre par la parole de sa bouche', { w: 1.6, h: 0.24, border: '#fff4d0' }, t => win(t, C.epee + 2.5, SC.bete.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.armee.start; const d = sstep(T0, C.lin + 2, t); sky.open(sstep(T0, T0 + 2.5, t));
      army.forEach((r, i) => { const [x, row] = r.userData.base, col = i % 4; const u = sstep(T0 + 0.8 + row * 1.0 + col * 0.25, T0 + 7 + row * 1.0 + col * 0.25, t); emerge(r, [0, 7, -21], [x, row * 1.4, -5 - row * 3], u, { arc: 1, endY: 0.1 }); fade(r, sstep(0, 0.12, u)); r.userData.gallop(t * 6 + i, 0.6); r.userData.rider.face(0, 'neutral', t); });
      R.position.set(0, 0, -1 + 0.6 * d); R.userData.gallop(t * 3, 0.3); R.userData.rider.face(0, 'serious', t); fl.position.set(0.6, 4, 1.5);
      camKeys(cam, t, [{ t: T0, p: [0.6, 3.0, 7.5], l: [0, 3.4, -8], f: 56 }, { t: C.lin, p: [2.6, 2.4, 6.0], l: [0, 2.2, -5], f: 54 }, { t: C.epee, p: [2.6, 2.4, 6.0], l: [0, 2.2, -5], f: 54 }, { t: SC.bete.start, p: [2.6, 2.4, 6.0], l: [0, 2.2, -5], f: 54 }]);
      faceShot(cam, R, sstep(C.epee - 1, C.epee + 0.5, t), 2.6, 1.6);
      K.update(t);
    }
  };
};

// ---------- l'ange dans le soleil ; la bete et les rois ; capture ; l'etang de feu
SETS.bete = () => {
  const B = base({ sky: [0x1a1020, 0x8a4a3a], hemi: [0xffd8c0, 0x2a1a20, 0.8], sun: [0xffb080, 1.0, [4, 8, 8]], shadow: false, bloom: [0.55, 0.5, 0.82], exposure: 1.0, fog: [0x5a3a3a, 25, 90] }); const { scene, cam } = B;
  scene.add(L.groundPlane(160, 40, 0x6a5440, 0.3, 4));
  const sun = glowStar(16, 0xfff0b0); sun.position.set(0, 14, -30); scene.add(sun);
  const an = angel(); an.root.scale.setScalar(2.2); an.place(0, 11.5, -28, 0); scene.add(an.root);
  const birds = []; for (let i = 0; i < 14; i++) { const b = L.makeBird(0x2a2a30, 0.6); scene.add(b); birds.push(b); }
  const host = army(scene, 220, 6, 22, 0, -14, 0x2a2430);
  const beast = orb('LA BÊTE', 0x5a2a2a), prophet = orb('LE FAUX PROPHÈTE', 0x3a2a5a); scene.add(beast); scene.add(prophet);
  const rings = [beast, prophet].map(o => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.04, 6, 24), G(0xfff4d0, 1.5)); o.add(r); r.rotation.x = Math.PI / 2; return r; });
  const R = bigRider(); R.rotation.y = Math.PI * 0.85; R.scale.setScalar(1.2); R.position.set(2.6, 0, -4); scene.add(R); faceLight(scene, [1.6, 3.8, -2], 2.6, 0xffe8d0);
  const lake = new THREE.Mesh(new THREE.PlaneGeometry(30, 8), G(0xff5a10, 0.9)); lake.rotation.x = -Math.PI / 2; lake.position.set(0, 0.03, -34); scene.add(lake);
  const K = cardsMgr(scene, cam); refCard(K);
  K('Apocalypse 19, 17 : « le grand festin de Dieu »', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, SC.bete.start + 3, C.guerre, 0.3, 0.2), -0.6);
  K('la bête, les rois de la terre et leurs armées… mais pas de bataille', { w: 1.6, h: 0.28, border: '#ff8a5a' }, t => win(t, C.guerre + 2, C.guerre + 7.5, 0.3, 0.2), -0.6);
  K('les tout premiers jetés dans l\'étang de feu (épisode 45)', { w: 1.6, h: 0.24, border: '#ff5a2a' }, t => win(t, C.premiers + 0.3, SC.fin.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.bete.start;
      birds.forEach((b, i) => { const a = t * 0.5 + i / 14 * Math.PI * 2; b.position.set(Math.cos(a) * (5 + i % 3), 9 + (i % 4) * 0.8, -24 + Math.sin(a) * 4); b.rotation.y = -a; fade(b, win(t, T0 + 2, C.guerre + 1, 0.5, 0.8)); });
      host.forEach((g, i) => fade(g, sstep(C.guerre + hash(i), C.guerre + 1 + hash(i), t) * (1 - sstep(C.premiers - 1 + hash(i), C.premiers + hash(i), t))));
      const cap = sstep(C.guerre + 8, C.guerre + 10, t), th = sstep(C.guerre + 11, C.premiers - 0.5, t);
      [beast, prophet].forEach((o, i) => { const x = i ? 1.2 : -1.2; o.position.set(x + (i ? -0.8 : 0.8) * th, 2.2 + 3 * Math.sin(Math.PI * th) - 1.6 * th, -6 - 26 * th); o.children[0].rotation.y = t; fade(o, win(t, C.guerre + 1, C.premiers + 1, 0.5, 0.5)); fade(rings[i], cap * (1 - sstep(0.9, 1, th))); });
      R.userData.gallop(t * 2, 0.2); R.userData.rider.face(0, 'serious', t); fade(R, sstep(C.guerre + 6, C.guerre + 7, t));
      camKeys(cam, t, [{ t: T0, p: [0, 3, 6], l: [0, 10, -28], f: 54 }, { t: C.guerre, p: [0, 3.2, 7], l: [0, 1.6, -14], f: 54 }, { t: C.guerre + 8, p: [0.8, 2.4, 3.6], l: [0, 2.2, -6], f: 52 }, { t: C.premiers, p: [0.4, 2.6, 4.0], l: [0, 1.0, -30], f: 52 }, { t: SC.fin.start, p: [0.4, 2.6, 4.0], l: [0, 1.0, -30], f: 52 }]);
      K.update(t);
    }
  };
};

// ---------- fin : Alleluia, les noces de l'Agneau (prochain episode)
SETS.fin = () => {
  const B = heavenCity({ exposure: 0.74, bloom: [0.35, 0.5, 0.92] }); const { scene, cam } = B;
  const ppl = citizens(scene, 6);
  const al = label('ALLÉLUIA !', { w: 1.8, h: 0.45, color: '#ffd070', font: 'bold 150px Inter' }); al.position.set(0, 3.3, -3); scene.add(al);
  const K = cardsMgr(scene, cam);
  K('PROCHAIN ÉPISODE · Apocalypse 19, 1-10', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, SC.fin.start + 7.5, TL.duration + 1, 0.4, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.fin.start; B.tick(t);
      ppl.forEach((h, i) => { h.place(-1.5 + i * 0.6, 0, -1 - (i % 2) * 0.6, 0); h.pose({ aL: [2.6, 0.3], aR: [2.6, 0.3] }); h.face(0, 'joy', t); });
      fade(al, sstep(T0 + 3, T0 + 4, t)); al.scale.setScalar(1 + 0.04 * Math.sin(t * 4));
      camKeys(cam, t, [{ t: T0, p: [0, 1.8, 4.4], l: [0, 1.6, -2], f: 52 }, { t: TL.duration, p: [0, 2.0, 5.2], l: [0, 2.0, -3], f: 54 }]);
      K.update(t);
    }
  };
};

const SHOTS = [['intro', 0, SC.cavalier.start], ['cavalier', SC.cavalier.start, SC.noms.start], ['noms', SC.noms.start, SC.armee.start], ['armee', SC.armee.start, SC.bete.start], ['bete', SC.bete.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
