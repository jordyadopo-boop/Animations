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

const REF = 'Apocalypse 16, 1-3 · traduction Louis Segond';
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
const refCard = (K) => K(REF, { w: 1.6, h: 0.12, border: '#807060', color: '#e8e0d4' }, t => t > SC.temple.start + 0.3 && t < SC.fin.start ? 0.85 : 0, -0.88, 0.75);


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

// ================= episode 48 : le ciel entier crie Alleluia (Apocalypse 19, 1-10)
// ---------- la foule immense en blanc (instanciee) : robes, tetes, bras qui se levent
function crowdPts(n, z0, z1, w0, w1, o = {}) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const u = hash(i * 1.37 + 0.2), z = lerp(z0, z1, u), w = lerp(w0, w1, u);
    const x = (hash(i * 2.71 + 0.5) - 0.5) * 2 * w;
    if (o.aisle && Math.abs(x) < o.aisle) continue;
    pts.push({ x, y: o.y ?? 0, z, ry: (o.ry ?? 0) + (hash(i * 5.3) - 0.5) * 0.5 + (o.face ? Math.atan2(o.face[0] - x, o.face[1] - z) : 0), s: 0.9 + hash(i * 9.1) * 0.25 });
  }
  return pts;
}
function crowd(scene, pts, o = {}) {
  const n = pts.length;
  const robeG = new THREE.CylinderGeometry(0.13, 0.27, 1.15, 7); robeG.translate(0, 0.575, 0);
  const headG = new THREE.IcosahedronGeometry(0.13, 1);
  const hairG = new THREE.SphereGeometry(0.14, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.45); hairG.rotateX(-0.7);
  const armG = new THREE.BoxGeometry(0.075, 0.55, 0.075); armG.translate(0, -0.27, 0);
  const robeM = M(0xffffff, { emissive: new THREE.Color(o.em ?? 0x3a3630) }), armM = M(0xf6f2ea, { emissive: new THREE.Color(o.em ?? 0x3a3630) });
  const robe = new THREE.InstancedMesh(robeG, robeM, n), head = new THREE.InstancedMesh(headG, new THREE.MeshLambertMaterial({ flatShading: true }), n);
  const hair = new THREE.InstancedMesh(hairG, new THREE.MeshLambertMaterial({ flatShading: true }), n);
  const armL = new THREE.InstancedMesh(armG, armM, n), armR = new THREE.InstancedMesh(armG, armM, n);
  const skins = [0x8a5a3a, 0xe0b890, 0xa86c44, 0x5a3420, 0xd09a70, 0xc68a5a, 0x3a2416, 0xf0c8a0], hairs = [0x1a1210, 0x2a1a10, 0x5a3a20, 0x120c08, 0x8a6a3a, 0xd8d0c0];
  for (let i = 0; i < n; i++) { head.setColorAt(i, new THREE.Color(skins[Math.floor(hash(i * 3.3) * 8)])); hair.setColorAt(i, new THREE.Color(hairs[Math.floor(hash(i * 4.4) * 6)])); }
  const all = [robe, head, hair, armL, armR]; all.forEach(m => { m.frustumCulled = false; scene.add(m); });
  const d = new THREE.Object3D(); d.rotation.order = 'YZX';
  const set = (m, i, x, y, z, ry, rz, s) => { d.position.set(x, y, z); d.rotation.set(0, ry, rz); d.scale.setScalar(s); d.updateMatrix(); m.setMatrixAt(i, d.matrix); };
  const upd = (t, raise = 1, vis = 1) => {
    all.forEach(m => m.visible = vis > 0.01);
    for (let i = 0; i < n; i++) {
      const p = pts[i], s = p.s, r = clamp(raise * (1.4 - 0.4 * hash(i * 7.7)), 0, 1);
      const bob = 0.05 * Math.max(0, Math.sin(t * 4 + i * 1.7)) * r;
      set(robe, i, p.x, p.y + bob, p.z, p.ry, 0, s);
      set(head, i, p.x, p.y + bob + 1.3 * s, p.z, p.ry, 0, s);
      set(hair, i, p.x - 0.01 * Math.sin(p.ry), p.y + bob + 1.33 * s, p.z - 0.01 * Math.cos(p.ry), p.ry, 0, s);
      const th = lerp(0.12, Math.PI - 0.45, r) + 0.14 * Math.sin(t * 3 + i) * r, c = Math.cos(p.ry), sn = Math.sin(p.ry);
      for (const [m, lx, sg] of [[armL, 0.2, 1], [armR, -0.2, -1]]) set(m, i, p.x + lx * s * c, p.y + bob + 1.08 * s, p.z - lx * s * sn, p.ry, sg * th, s);
    }
    all.forEach(m => m.instanceMatrix.needsUpdate = true);
  };
  upd(0, 0); return { upd, all };
}
// ---------- ciel d'or
function goldHeaven(o = {}) {
  const B = base({ sky: [0xd89030, 0xffe0a0, 0xf8c060], hemi: [0xffffff, 0xb89a60, 0.9], sun: [0xfff4e0, 1.0, [3, 8, 6]], shadow: false, bloom: [0.32, 0.5, 0.92], exposure: 0.78, fog: [0xf0c880, 24, 95], ...o });
  const { scene } = B;
  const floor = new THREE.Mesh(new THREE.CircleGeometry(60, 40), M(0xe0b860, { emissive: new THREE.Color(0x3a2808) })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.02, -15); scene.add(floor);
  const cl = clouds(scene, 30, -0.6, 30, { em: 0x8a7050, op: 1 }); cl.forEach((c, i) => { c.position.z = -46 - hash(i * 11) * 14; c.position.x *= 2; c.scale.multiplyScalar(2.2); });
  const glow = glowStar(16, 0xfff0c0); glow.position.set(0, 16, -60); scene.add(glow);
  B.glow = glow; return B;
}
function goldWord(text, w = 3.2, h = 0.8) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = Math.round(1024 * h / w); const g = c.getContext('2d'); g.textAlign = 'center'; g.textBaseline = 'middle';
  let fs = 170; g.font = `bold ${fs}px Inter`; const mw = g.measureText(text).width; if (mw > 940) { fs = fs * 940 / mw; g.font = `bold ${fs}px Inter`; } g.lineWidth = 16 * fs / 170; g.strokeStyle = '#5a2a08'; g.strokeText(text, 512, c.height / 2); const gr = g.createLinearGradient(0, 0, 0, c.height); gr.addColorStop(0, '#fff2b0'); gr.addColorStop(1, '#e89a20'); g.fillStyle = gr; g.fillText(text, 512, c.height / 2);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: canvasTex(c), transparent: true, depthWrite: false, toneMapped: false, fog: false })); m.renderOrder = 15; return m;
}
function notesFloat(scene, n, cx, cy, cz, R) {
  const arr = []; for (let i = 0; i < n; i++) { const l = label(i % 2 ? '♪' : '♫', { w: 0.35, h: 0.35, color: '#ffd070', font: 'bold 300px Inter' }); scene.add(l); arr.push(l); }
  return (t, k) => arr.forEach((l, i) => { const ph = (t * 0.12 + hash(i)) % 1; l.position.set(cx + (hash(i * 3) - 0.5) * R * 2 + 0.2 * Math.sin(t + i), cy + ph * R * 1.2, cz + (hash(i * 7) - 0.5) * R); fade(l, k * Math.sin(Math.PI * ph)); });
}
// ---------- Babylon en hologramme (ville qui fume)
function holoBabylon(scene, pos) {
  const g = new THREE.Group(); g.position.set(...pos); scene.add(g);
  for (let i = 0; i < 26; i++) { const h = 0.3 + hash(i * 3) * 1.4; const b = holo(new THREE.BoxGeometry(0.28, h, 0.28), 0xff6a4a, 0.22); b.position.set((hash(i * 5) - 0.5) * 2.6, h / 2, (hash(i * 7) - 0.5) * 1.4); b.rotation.z = (hash(i) - 0.5) * 0.3 * (i % 3 === 0); g.add(b); }
  const tower = holo(new THREE.CylinderGeometry(0.25, 0.45, 2.0, 8), 0xff6a4a, 0.25); tower.position.set(0, 1.0, 0); g.add(tower);
  const smoke = []; for (let i = 0; i < 18; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25, 1), holoMat(0x9a8a8a, 0.25)); g.add(s); smoke.push(s); }
  g.userData.tick = (t) => smoke.forEach((s, i) => { const ph = (t * 0.15 + i / 18) % 1; s.position.set(0.3 * Math.sin(i * 2.1 + t * 0.4) + ph * 0.6, 0.8 + ph * 4.0, 0.2 * Math.cos(i)); s.scale.setScalar(0.6 + ph * 2.2); s.material.opacity = 0.28 * (1 - ph); });
  return g;
}
// ---------- la mer de verre, l'arc-en-ciel autour du trone, les 24 anciens, les 4 etres vivants
function elder(i) { return new Human({ skin: [0xd09a70, 0x8a5a3a, 0xa86c44, 0x5a3420, 0xe0b890, 0xc68a5a][i % 6], hair: 0xe8e4dc, hairStyle: 'long', beard: 'long', beardColor: 0xe8e4dc, top: 0xffffff, bottom: 0xf4f0e8, robe: 0xffffff, robeL: 0.85, hat: 'crown', seed: 4800 + i }); }
function creatures(scene) {
  const c = [];
  const lion = L.makeAnimal('lion'); lion.scale.setScalar(1.4); c.push([lion, 'LION']);
  const calf = L.makeAnimal('camel'); calf.traverse(m => { if (m.isMesh && m.material.emissive) m.material = M(0x8a5a30); }); calf.children.forEach(ch => { if (ch.geometry && ch.geometry.type === 'IcosahedronGeometry') ch.visible = false; }); c.push([calf, 'VEAU']);
  const man = new Human({ skin: 0xc8946a, hair: 0x2a1a10, top: 0xd8c8a0, bottom: 0xc8b890, robe: 0xd8c8a0, seed: 4890 }); c.push([man.root, 'HOMME']);
  const eagle = L.makeBird(0x6a4a2a, 4); c.push([eagle, 'AIGLE']);
  return c.map(([o, name], i) => { const g = new THREE.Group(); g.add(o); if (name === 'AIGLE') o.position.y = 1.2; const l = card(name, { w: 0.7, h: 0.18 }); l.position.y = 2.2; g.add(l); g.userData = { o, l, name }; scene.add(g); return g; });
}
// ---------- la grande table des noces
function feastTable(scene, len = 14, z0 = -2) {
  const g = new THREE.Group(); scene.add(g);
  const cloth = M(0xffffff, { emissive: new THREE.Color(0x5a5448) }), gold = G(0xffcc55, 1.3);
  g.add(at(box(1.4, 0.08, len, cloth), 0, 0.76, z0 - len / 2));
  for (const s of [-1, 1]) g.add(at(box(0.02, 0.35, len, cloth), s * 0.7, 0.6, z0 - len / 2));
  const lights = [];
  for (let k = 0; k < len / 0.8; k++) {
    const z = z0 - 0.4 - k * 0.8;
    for (const s of [-1, 1]) { g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.025, 0.12, 8), gold), s * 0.42, 0.86, z)); g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.015, 12), M(0xf8f4ec)), s * 0.42, 0.81, z + 0.2)); }
    if (k % 2 === 0) { const st = glowStar(0.45, 0xffe8b0); st.position.set(0, 1.0, z); g.add(st); lights.push(st); g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.2, 6), gold), 0, 0.88, z)); }
  }
  g.userData.lights = lights; return g;
}
function bride() {
  const h = new Human({ skin: 0xa86c44, hair: 0x2a1a10, hairStyle: 'bun', top: 0xffffff, bottom: 0xffffff, robe: 0xffffff, robeL: 0.9, robeW: 0.42, seed: 4850 });
  h.root.traverse(m => { if (m.isMesh && m.material && m.material.emissive && m.material.color.getHex() === 0xffffff) m.material.emissive = new THREE.Color(0x4a4a46); });
  const veil = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.95, 14, 1, true), new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: new THREE.Color(0x605c58), transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }));
  veil.position.set(0, -0.12, -0.06); h.neck.add(veil);
  const halo = glowStar(2.4, 0xfff8e8); halo.position.set(0, 0.2, -0.3); h.spine.add(halo); h.halo = halo;
  return h;
}
function lamb() {
  const a = L.makeAnimal('sheep'); a.traverse(m => { if (m.isMesh && m.material.emissive) { m.material = m.material.clone(); m.material.emissive = new THREE.Color(0x8a7a50); } });
  const gl = glowStar(3.2, 0xfff0c0); gl.position.set(0, 0.6, -0.2); a.add(gl); return a;
}
function jar(color) { const g = new THREE.Group(); const j = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.11, 0.5, 12, 1, true), M(0xa8683a, { side: THREE.DoubleSide })); j.position.y = 0.25; g.add(j); g.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 5, 14), M(0x8a5028)), 0, 0.5, 0)).children.at(-1).rotation.x = Math.PI / 2; const liq = new THREE.Mesh(new THREE.CircleGeometry(0.14, 14), new THREE.MeshBasicMaterial({ color, transparent: true })); liq.rotation.x = -Math.PI / 2; liq.position.y = 0.46; g.add(liq); g.userData.liq = liq; return g; }
// ---------- partition du « Hallelujah »
function scoreSheet() {
  const c = document.createElement('canvas'); c.width = 768; c.height = 1024; const g = c.getContext('2d');
  g.fillStyle = '#f2e8d0'; g.fillRect(0, 0, 768, 1024); g.fillStyle = '#2a1a10'; g.textAlign = 'center';
  g.font = 'bold 64px Inter'; g.fillText('HALLELUJAH', 384, 110); g.font = '34px Inter'; g.fillText('G. F. Haendel · Le Messie · 1741', 384, 165);
  for (let s = 0; s < 6; s++) { const y0 = 240 + s * 130; g.strokeStyle = '#3a2a1a'; g.lineWidth = 2; for (let l = 0; l < 5; l++) { g.beginPath(); g.moveTo(60, y0 + l * 14); g.lineTo(708, y0 + l * 14); g.stroke(); }
    for (let k = 0; k < 14; k++) { const x = 100 + k * 44, y = y0 + 56 - Math.floor(hash(s * 20 + k) * 9) * 7; g.beginPath(); g.ellipse(x, y, 9, 7, -0.4, 0, Math.PI * 2); g.fill(); g.fillRect(x + 7, y - 42, 2.5, 42); } }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.6), new THREE.MeshBasicMaterial({ map: canvasTex(c), transparent: true, toneMapped: false, color: new THREE.Color(0.9, 0.9, 0.9) })); return m;
}
function millstone(r = 1.3) {
  const g = new THREE.Group(); const st = M(0x8a8680, { emissive: new THREE.Color(0x1a1a1c) });
  const geo = new THREE.LatheGeometry([new THREE.Vector2(0.22 * r, -0.2 * r), new THREE.Vector2(r, -0.2 * r), new THREE.Vector2(r * 1.02, 0.2 * r), new THREE.Vector2(0.22 * r, 0.2 * r), new THREE.Vector2(0.22 * r, -0.2 * r)], 28);
  g.add(new THREE.Mesh(geo, st)); for (let k = 0; k < 8; k++) { const gr = box(r * 0.75, 0.02, 0.04, M(0x5a5650)); gr.position.set(Math.cos(k * 0.785) * r * 0.6, 0.2 * r + 0.005, Math.sin(k * 0.785) * r * 0.6); gr.rotation.y = -k * 0.785; g.add(gr); }
  return g;
}


// ================= episode 49 : Babylone coule comme une pierre (Apocalypse 18, 21-24)
const gone = (t, at, d = 0.8) => 1 - sstep(at, at + d, t);
// ---------- mer de nuit, lune, Babylone illuminee a l'horizon
function nightSea(o = {}) {
  const B = base({ sky: [0x05081a, 0x2a2440, 0x141a38], hemi: [0x9aa8d8, 0x1a1420, 0.75], sun: [0xc8d0ff, 0.8, [-4, 6, 6]], shadow: false, bloom: [0.6, 0.5, 0.8], exposure: o.exposure ?? 1.15, fog: [0x1a1830, 25, 110] });
  const { scene } = B;
  scene.add(L.stars(700, 90, 1.3));
  const moon = glowStar(9, 0xe8f0ff); moon.position.set(-14, 22, -70); scene.add(moon);
  const water = L.makeWater(200, 90, 0x1a3050, { emissive: 0x060c1c }); water.mesh.position.set(0, -0.2, -30); scene.add(water.mesh);
  const city = new THREE.Group(); city.position.set(o.cityX ?? 6, 0, -75); scene.add(city);
  const wins = [];
  for (let i = 0; i < 40; i++) { const h = 1 + hash(i * 3) * 6, x = (hash(i * 5) - 0.5) * 34; city.add(at(box(1.6 + hash(i) * 1.6, h, 1.6, M(0x1a1626, { emissive: new THREE.Color(0x0a0810) })), x, h / 2, (hash(i * 7) - 0.5) * 6)); const w = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.5), G(0xffb050, 1.4)); w.position.set(x, h * 0.6, 3.2); city.add(w); wins.push(w); }
  const zig = new THREE.Mesh(new THREE.CylinderGeometry(2, 5, 9, 4, 4), M(0x2a2030, { emissive: new THREE.Color(0x140c10) })); zig.position.set(0, 4.5, 0); zig.rotation.y = Math.PI / 4; city.add(zig);
  const cglow = glowStar(30, 0xffa050); cglow.position.set(0, 4, -1); city.add(cglow);
  B.water = water; B.city = city; B.cityWins = wins; B.cityGlow = cglow;
  B.cityLight = (k) => { wins.forEach((w, i) => w.visible = k > hash(i * 9.3)); cglow.material.opacity = 0.7 * k; };
  return B;
}
function rock(scene, x, y, z, s = 1) { const r = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), M(0x4a4440)); r.scale.set(1.4 * s, 0.6 * s, 1.1 * s); r.position.set(x, y, z); scene.add(r); return r; }
// l'ange geant leve la meule et la lance vers un point de la mer
function throwRig(scene, o = {}) {
  const an = angel(); an.root.scale.setScalar(o.s ?? 4.5); an.place(...(o.pos ?? [-2.5, -1, -14]), o.ry ?? 0.4); scene.add(an.root);
  const al = angelLight(scene, [an.root.position.x + 1, 8, an.root.position.z + 4]); al.intensity = 6; al.distance = 20;
  const ms = millstone(1.3); scene.add(ms);
  const target = new THREE.Vector3(...(o.target ?? [2.0, -0.2, -8]));
  const splash = []; for (let i = 0; i < 46; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 0), M(0xd8e8ff, { emissive: new THREE.Color(0x4a5a7a) })); scene.add(s); splash.push(s); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 6, 40), M(0xe8f0ff, { emissive: new THREE.Color(0x5a6a8a) })); ring.rotation.x = Math.PI / 2; scene.add(ring);
  const hp = new THREE.Vector3(), hr = new THREE.Vector3();
  return {
    an, ms, target, update(t, t0, tHit) { // t0 : debut du lever ; tHit : la meule touche l'eau
      const lift = sstep(t0, t0 + 2.5, t), thr = sstep(tHit - 1.6, tHit, t);
      an.pose({ aL: [lerp(0.3, 2.9, lift) - 1.3 * thr, 0.25], aR: [lerp(0.3, 2.9, lift) - 1.3 * thr, 0.25], eL: 0.2, eR: 0.2, lean: 0.3 * thr, hp: 0.15 * thr }); an.face(0, 'serious', t);
      an.root.updateMatrixWorld(true); an.hand.L.getWorldPosition(hp); an.hand.R.getWorldPosition(hr); hp.add(hr).multiplyScalar(0.5); hp.y += 1.0;
      if (thr <= 0) ms.position.copy(hp); else { ms.position.lerpVectors(hp, target, thr); ms.position.y += 3 * Math.sin(Math.PI * thr) * (1 - thr); }
      ms.rotation.set(1.3 + thr * 3, 0.3, 0.2 + thr * 2); ms.visible = t < tHit + 0.05;
      const sp = clamp((t - tHit) / 2.2, 0, 1);
      splash.forEach((s, i) => { const a = hash(i) * Math.PI * 2, v = 2 + hash(i * 3) * 4; s.visible = sp > 0 && sp < 1; s.position.set(target.x + Math.cos(a) * v * sp * 1.5, target.y + (6 + hash(i * 5) * 6) * sp - 12 * sp * sp, target.z + Math.sin(a) * v * sp); });
      fade(ring, 1 - sp); ring.visible = sp > 0 && sp < 1; ring.position.set(target.x, 0.0, target.z); ring.scale.setScalar(0.5 + sp * 9);
    }
  };
}
// ---------- personnages de la ville
function citizen(i, o = {}) { return new Human({ skin: [0xd09a70, 0x8a5a3a, 0xa86c44, 0xe0b890, 0x5a3420, 0xc68a5a][i % 6], hair: [0x1a1210, 0x2a1a10, 0x5a3a20, 0x120c08][i % 4], hairStyle: ['short', 'long', 'curly', 'wrap', 'bun'][i % 5], beard: i % 3 === 0 ? 'full' : undefined, top: [0x8a3a2a, 0x2a4a6a, 0x6a5a2a, 0x4a2a5a, 0x2a5a3a][i % 5], bottom: 0x3a2a20, robe: [0x8a3a2a, 0x2a4a6a, 0x6a5a2a, 0x4a2a5a, 0x2a5a3a][i % 5], robeL: 0.85, seed: 4960 + i, ...o }); }
function harp() { const g = new THREE.Group(); const w = M(0x9a6a2a); g.add(at(box(0.04, 0.7, 0.04, w), 0, 0.35, 0)); const arc = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 5, 16, Math.PI), w); arc.position.set(0.0, 0.7, 0); arc.rotation.z = -Math.PI / 2; g.add(arc); for (let k = 0; k < 6; k++) g.add(at(box(0.005, 0.5 - k * 0.06, 0.005, G(0xfff0c0, 1.2)), 0.05 + k * 0.04, 0.38 + k * 0.03, 0)); return g; }
function pipe(l = 0.35, c = 0xd0a050) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.015, l > 0.4 ? 0.06 : 0.02, l, 8), M(c)); p.rotation.x = Math.PI / 2; return p; }
function handMill() { const g = new THREE.Group(); const st = M(0x7a7470); g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.12, 16), st), 0, 0.06, 0)); const top = new THREE.Group(); top.position.y = 0.17; g.add(top); top.add(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16), st)); top.add(at(box(0.04, 0.22, 0.04, M(0x6a4a2a)), 0.22, 0.14, 0)); g.userData.top = top; return g; }
function oilLamp(scene, x, y, z) { const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(0x8a5a3a))); const f = glowStar(0.6, 0xffb040); f.position.set(0.05, 0.08, 0); g.add(f); const l = new THREE.PointLight(0xffa050, 2.0, 4, 1.4); l.position.set(0, 0.3, 0.2); g.add(l); g.userData = { f, l }; return g; }
function streetSet() {
  const B = base({ bg: 0x080612, fog: [0x080612, 8, 34], hemi: [0x8a90c0, 0x140c10, 0.5], sun: [0xc8d0ff, 0.35, [-3, 6, 4]], shadow: false, bloom: [0.55, 0.5, 0.8], exposure: 1.15 });
  const { scene } = B; scene.add(L.stars(500, 70, 1.1));
  scene.add(at(box(30, 0.1, 40, M(0x3a3028)), 0, -0.05, -8));
  const houses = [], wins = [];
  for (const s of [-1, 1]) for (let k = 0; k < 7; k++) { const h = 2.4 + hash(k * 3 + s) * 2.2, z = 1 - k * 3.2; const hs = box(2.6, h, 2.8, M(0xc8a878, { emissive: new THREE.Color(0x1a1208) })); hs.position.set(s * 3.6, h / 2, z); scene.add(hs); houses.push(hs); for (const dz of [-0.7, 0.7]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.6), G(0xffb050, 1.3)); w.position.set(s * 2.29, h * 0.62, z + dz); w.rotation.y = -s * Math.PI / 2; scene.add(w); wins.push(w); } }
  B.wins = wins; return B;
}


// ================= episode 50 : tout perdu en une seule heure (Apocalypse 18, 9-20)
// ---------- la ville en feu au loin (fumee, flammes)
function softGlow(size, color) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const col = new THREE.Color(color); const rgb = `${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)}`;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, `rgba(${rgb},0.9)`); gr.addColorStop(0.35, `rgba(${rgb},0.35)`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false })); s.scale.setScalar(size); return s;
}
function burningCity(B, o = {}) {
  const { scene } = B;
  B.city.position.set(o.x ?? 0, 0, o.z ?? -40); B.cityGlow.visible = false; B.cityGlow.scale.setScalar(0.001);
  const cg = softGlow(34, 0xff5010); cg.material.opacity = 0.45; cg.position.set(o.x ?? 0, 4, (o.z ?? -40) - 2); scene.add(cg);
  const smoke = []; for (let i = 0; i < 30; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), M(0x3a3038, { transparent: true, opacity: 0.5, emissive: new THREE.Color(0x3a1a10) })); scene.add(s); smoke.push(s); }
  const fires = []; for (let i = 0; i < 14; i++) { const f = softGlow(5 + hash(i) * 4, 0xff7020); f.material.opacity = 0.6; f.position.set((o.x ?? 0) + (hash(i * 3) - 0.5) * 30, 2 + hash(i * 5) * 5, (o.z ?? -40) + 2); scene.add(f); fires.push(f); }
  return (t, k = 1) => {
    B.cityLight(0.6 + 0.12 * Math.sin(t * 9));
    smoke.forEach((s, i) => { const ph = (t * 0.06 + hash(i)) % 1; s.position.set((o.x ?? 0) + (hash(i * 3) - 0.5) * 30 + ph * 6, 3 + ph * 24, (o.z ?? -40)); s.scale.setScalar(1 + ph * 3.2); s.material.opacity = 0.55 * (1 - ph); });
    fires.forEach((f, i) => f.scale.setScalar((5 + hash(i) * 4) * k * (1 + 0.15 * Math.sin(t * 7 + i))));
  };
}
function mourners(scene, n = 4, z = 0.6) {
  return Array.from({ length: n }, (_, i) => { const h = i % 2 ? citizen(i + 9, { top: [0x8a1a3a, 0x1a5a6a, 0x6a4a1a][i % 3], robe: [0x5a2a3a, 0x1a3a4a, 0x4a3a1a][i % 3] }) : king(i); h.place(-1.5 + i * 1.0, 0.2, z, Math.PI); scene.add(h.root); return h; });
}
function hourglass() {
  const g = new THREE.Group(); const gl = holo(new THREE.ConeGeometry(0.4, 0.6, 16, 1, true), 0x9adfff, 0.2); gl.position.y = 0.3; gl.rotation.x = Math.PI; g.add(gl);
  const gl2 = holo(new THREE.ConeGeometry(0.4, 0.6, 16, 1, true), 0x9adfff, 0.2); gl2.position.y = -0.3; g.add(gl2);
  for (const y of [-0.62, 0.62]) g.add(at(holo(new THREE.CylinderGeometry(0.46, 0.46, 0.05, 16), 0xffd070, 0.4), 0, y, 0));
  const top = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.4, 16), G(0xffd070, 1.2)); top.rotation.x = Math.PI; g.add(top);
  const bot = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.4, 16), G(0xffd070, 1.2)); g.add(bot);
  g.userData.set = (u) => { top.scale.set(1 - u * 0.95, 1 - u * 0.95, 1 - u * 0.95); top.position.y = 0.3 + 0.15 * u; bot.scale.set(Math.max(0.05, u), Math.max(0.05, u), Math.max(0.05, u)); bot.position.y = -0.58 + 0.2 * u; };
  return g;
}
function ship(sc_ = 1, sail = 0xe8dcc0) {
  const g = new THREE.Group(); const w = M(0x5a3a22);
  const hull = box(0.8, 0.35, 2.6, w); hull.position.y = 0.1; g.add(hull);
  g.add(at(box(0.9, 0.12, 0.5, w), 0, 0.35, 1.2)); g.add(at(box(0.9, 0.12, 0.5, w), 0, 0.35, -1.2));
  g.add(at(box(0.06, 2.2, 0.06, w), 0, 1.3, 0));
  const s = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.3), M(sail, { side: THREE.DoubleSide })); s.position.set(0, 1.5, 0.04); g.add(s);
  g.scale.setScalar(sc_); return g;
}
function crate(c) { const g = new THREE.Group(); g.add(box(0.4, 0.3, 0.3, M(0x7a5a32))); const lid = box(0.42, 0.04, 0.32, M(0x5a3a22)); lid.position.y = 0.16; g.add(lid); const st = glowStar(0.35, c); st.position.y = 0.25; g.add(st); return g; }


// ================= episode 52 : dix rois se retournent contre elle (Apocalypse 17, 7-18)
function desert(o = {}) {
  const B = base({ sky: [0x0a0a20, 0x3a2a4a, 0x2a2038], hemi: [0xb8a8d8, 0x2a1a1a, 0.8], sun: [0xd8d0ff, 0.9, [-4, 7, 6]], shadow: false, bloom: [0.55, 0.5, 0.82], exposure: o.exposure ?? 1.15, fog: [0x2a2038, 20, 90] });
  const { scene } = B; scene.add(L.stars(700, 90, 1.3));
  const moon = glowStar(8, 0xe8f0ff); moon.position.set(12, 20, -60); scene.add(moon);
  scene.add(L.groundPlane(160, 50, 0x8a6a48, 0.5, 5));
  for (let i = 0; i < 8; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(6 + hash(i) * 8, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0x7a5a3e)); d.scale.y = 0.35; d.position.set((hash(i * 3) - 0.5) * 90, -0.5, -30 - hash(i * 5) * 30); scene.add(d); }
  return B;
}
function harlot() { const w = new Human({ skin: 0xe0b890, hair: 0x1a1210, hairStyle: 'long', top: 0x7a1a4a, bottom: 0x6a1a3a, robe: 0x8a1a2a, robeL: 0.7, hat: 'crown', seed: 5200 }); const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.03, 0.14, 10), G(0xffc040, 1.3)); w.hand.R.add(cup); cup.position.set(0, -0.08, 0.05); return w; }
function beastWithWoman(scene) {
  const g = new THREE.Group(); scene.add(g);
  const dr = dragon(); dr.scale.setScalar(1.3); g.add(dr);
  const w = harlot(); w.root.position.set(0, 1.95, 0.3); w.pose(L.sitPose(0.3, { lL: 1.2, lR: 1.2, kL: 1.2, kR: 1.2, lsL: 0.5, lsR: 0.5, aR: [1.4, 0.2], eR: 0.6 })); g.add(w.root);
  g.userData = { dr, w }; return g;
}
function swordKing(i) { const k = king(i); const sw = box(0.04, 0.8, 0.04, G(0xd8e0f0, 1.4)); sw.position.set(0, -0.45, 0.08); k.hand.R.add(sw); k.sword = sw; return k; }
function ringKings(scene, n = 10, R = 3.4, cx = 0, cz = 0) {
  return Array.from({ length: n }, (_, i) => { const k = swordKing(i); const a = Math.PI * (0.15 + 0.7 * i / (n - 1)) + Math.PI; const x = cx + Math.cos(a) * R * 1.15, z = cz + Math.sin(a) * R * 0.75 - 0.6; k.place(x, 0, z, Math.atan2(cx - x, cz - z)); scene.add(k.root); return k; });
}


// ================= episode 53 : un nom ecrit sur son front : Mystere (Apocalypse 17, 1-6)
function foreheadName(w, text = 'MYSTÈRE', sz = 0.5) { const l = label(text, { w: sz, h: sz * 0.24, color: '#ffd070', font: 'bold 110px Inter' }); w.neck.add(l); l.position.set(0, 0.24, 0.17); return l; }
function bowlAngel(i) { const a = angel(); const b = angelBowl(a); b.scale.setScalar(1.6); a.bowl = b; return a; }
function nameCard(text, color = '#ff5a3a') { return card(text, { w: 0.8, h: 0.15, border: color, color: '#ffd0c0' }); }


// ================= episode 54 : une ville immense fendue par un tremblement de terre (Apocalypse 16, 17-21)
function stormCity(o = {}) {
  const B = nightSea({ cityX: 0, exposure: o.exposure ?? 1.1 }); const { scene } = B; B.city.position.set(0, 0, o.z ?? -30);
  const parts = [new THREE.Group(), new THREE.Group(), new THREE.Group()]; parts.forEach(p => scene.add(p));
  B.city.children.slice().forEach(c => { if (c.position.x < -6) parts[0].attach(c); else if (c.position.x > 6) parts[2].attach(c); else parts[1].attach(c); });
  parts.forEach(p => p.children.forEach(c => { c.userData.r0 = c.rotation.z; c.userData.y0 = c.position.y; }));
  B.cityGlow.visible = false; B.cityGlow.scale.setScalar(0.001); const cg = softGlow(30, 0xffb060); cg.material.opacity = 0.22; cg.position.set(0, 6, (o.z ?? -30) - 3); scene.add(cg);
  const cracks = [-6, 6].map(x => { const g = new THREE.Group(); g.position.set(x, 0, o.z ?? -30); scene.add(g); for (let k = 0; k < 4; k++) { const f = softGlow(3, 0xff6a20); f.position.set(0, 0.3, (k - 1.5) * 2); g.add(f); } const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 8), new THREE.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); pl.rotation.x = -Math.PI / 2; pl.position.y = 0.05; g.add(pl); g.visible = false; return g; });
  const clouds_ = []; for (let i = 0; i < 16; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(4 + hash(i) * 4, 1), M(0x1a1826, { emissive: new THREE.Color(0x0a0a12) })); c.scale.y = 0.4; c.position.set((hash(i * 3) - 0.5) * 80, 26 + hash(i * 5) * 6, -40 - hash(i * 7) * 20); scene.add(c); clouds_.push(c); }
  const bolts = [0, 1, 2, 3].map(k => { const b = L.makeBolt(k * 13 + 7, [(k - 1.5) * 12, 30, -40], [(k - 1.5) * 7, 2, o.z ?? -30], G(0xffffff, 2.6)); scene.add(b); return b; });
  B.split = (u, t) => { cracks.forEach(g => { g.visible = u > 0.02; g.scale.x = 0.3 + 3 * u; g.children.forEach(c => { if (c.material) c.material.opacity = (c.isSprite ? 0.7 : 0.9) * Math.min(1, u * 3); }); }); parts[0].position.x = -4 * u; parts[0].rotation.z = 0.14 * u; parts[2].position.x = 4 * u; parts[2].rotation.z = -0.14 * u; parts[1].position.y = -2 * u;
    parts.forEach((p, pi) => p.children.forEach((c, i) => { const f = clamp(u * 1.6 - hash(i * 3 + pi) * 0.6, 0, 1); c.rotation.z = c.userData.r0 + (hash(i + pi) - 0.5) * 1.2 * f; })); };
  B.storm = (t, times, k = 1) => { const fk = L.flashK(t, times); bolts.forEach((b, i) => b.visible = fk > 0.3 && (i === Math.floor(t * 6) % 4 || fk > 0.85)); B.hemi.intensity = 0.75 + 1.6 * fk * k; return fk; };
  B.parts = parts; return B;
}
function hailstones(scene, n = 60, R = 14, cz = -10) {
  const arr = []; for (let i = 0; i < n; i++) { const h = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25 + hash(i) * 0.35, 0), M(0xe8f0ff, { emissive: new THREE.Color(0x5a6a8a) })); scene.add(h); arr.push(h); }
  arr.update = (t, on = 1) => arr.forEach((h, i) => { const ph = (t * (0.35 + hash(i * 3) * 0.2) + hash(i)) % 1; h.visible = on > 0.02; h.position.set((hash(i * 5) - 0.5) * R * 2, 30 - ph * 31, cz + (hash(i * 7) - 0.5) * R); h.rotation.set(t * 2 + i, t + i, 0); });
  return arr;
}
function shake(cam, t, t0, amp = 0.15, dec = 0.6) { if (t < t0) return; const s = amp * Math.exp(-(t - t0) * dec); cam.position.x += s * Math.sin(t * 53); cam.position.y += s * Math.cos(t * 47); }


function holoify(obj, color, op = 0.45) { obj.traverse(m => { if (m.isMesh) m.material = holoMat(color, op); }); return obj; }
// ================= episode 55 : trois esprits verts sortent de la gueule du dragon (Apocalypse 16, 12-16)
function frogSpirit() {
  const g = new THREE.Group(); const mat = new THREE.MeshStandardMaterial({ color: 0x5aff6a, emissive: new THREE.Color(0x2aa83a), emissiveIntensity: 1.2, roughness: 0.4, transparent: true, opacity: 0.92 });
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 12), mat); b.scale.set(1.25, 0.72, 1.05); g.add(b);
  for (const s of [-1, 1]) { const eb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), mat); eb.position.set(s * 0.17, 0.2, 0.2); g.add(eb); const e = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), G(0xffff70, 2.2)); e.position.set(s * 0.17, 0.23, 0.28); g.add(e); const leg = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), mat); leg.scale.set(0.8, 0.5, 1.5); leg.position.set(s * 0.3, -0.12, -0.12); g.add(leg); }
  const gl = softGlow(2.4, 0x5aff6a); gl.material.opacity = 0.55; g.add(gl);
  return g;
}
function beast13() { const b = dragon(); b.traverse(m => { if (m.isMesh && m.material && m.material.color && m.material.color.getHex() === 0xa8261c) { m.material = m.material.clone(); m.material.color.set(0x4a2a5a); m.material.emissive = new THREE.Color(0x120818); } }); return b; }
function falseProphet() { const h = new Human({ skin: 0xd0a080, hair: 0x2a1a10, hairStyle: 'short', beard: 'full', top: 0x3a3a4a, bottom: 0x2a2a34, robe: 0x2a2a3a, robeL: 0.9, seed: 5500 }); for (const s of [-1, 1]) { const hn = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 6), M(0xf0e8d0)); hn.position.set(s * 0.08, 0.36, 0.02); h.neck.add(hn); } h.root.scale.setScalar(1.5); return h; }
function riverBed(scene, z = -20) {
  const bed = new THREE.Mesh(new THREE.PlaneGeometry(9, 120), M(0x5a4430)); bed.rotation.x = -Math.PI / 2; bed.position.set(0, 0.32, z); scene.add(bed);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 120), new THREE.MeshStandardMaterial({ color: 0x2a6aa8, emissive: new THREE.Color(0x0a2a4a), roughness: 0.15, metalness: 0.2, transparent: true })); water.rotation.x = -Math.PI / 2; water.position.set(0, 0.36, z); scene.add(water);
  const cracks = []; for (let i = 0; i < 40; i++) { const c = box(0.05, 0.02, 0.8 + hash(i) * 1.2, M(0x2a1e14)); c.position.set((hash(i * 3) - 0.5) * 8, 0.33, z + (hash(i * 5) - 0.5) * 60); c.rotation.y = (hash(i * 7) - 0.5) * 2; scene.add(c); cracks.push(c); }
  return { water, set(k) { water.material.opacity = 1 - 0.9 * k; water.scale.x = 1 - 0.75 * k; water.visible = k < 0.98; cracks.forEach(c => c.visible = k > 0.6); } };
}
function trio(scene, z = -5) {
  const dr = dragon(); dr.scale.setScalar(1.2); dr.position.set(-3.2, 0, z); dr.rotation.y = 0.35; scene.add(dr);
  const bt = beast13(); bt.scale.setScalar(1.1); bt.position.set(3.2, 0, z); bt.rotation.y = -0.35; scene.add(bt);
  const fp = falseProphet(); fp.place(0, 0, z + 1.2, 0); scene.add(fp.root);
  return { dr, bt, fp };
}
function mouthOf(obj, kind) { const v = new THREE.Vector3(); (obj.root || obj).updateMatrixWorld(true); if (kind === 'fp') { obj.head.getWorldPosition(v); v.y -= 0.05; v.z += 0.25; } else { obj.userData.necks[3].head.getWorldPosition(v); v.z += 0.4; } return v; }


// ================= episode 56 : le royaume de la bete plonge dans les tenebres (Apocalypse 16, 10-11)
function throneHall(o = {}) {
  const B = base({ bg: 0x0c0810, fog: [0x0c0810, 10, 40], hemi: [0xffd8b0, 0x1a0c10, 0.7], sun: [0xffe0c0, 0.7, [2, 8, 6]], shadow: false, bloom: [0.5, 0.5, 0.82], exposure: 1.15 });
  const { scene } = B;
  scene.add(at(box(16, 0.2, 24, M(0x3a2a30)), 0, -0.1, -6));
  const carpet = box(1.6, 0.03, 16, M(0x8a1a2a)); carpet.position.set(0, 0.02, -2); scene.add(carpet);
  const cols = []; for (const s of [-1, 1]) for (let k = 0; k < 5; k++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 7, 16), M(0x6a5a50)); c.position.set(s * 3.4, 3.5, 2 - k * 3.2); scene.add(c); cols.push(c); }
  const th = new THREE.Group(); th.position.set(0, 0, -9); scene.add(th);
  th.add(at(box(3.2, 0.5, 2.4, M(0x4a2a3a)), 0, 0.25, 0)); th.add(at(box(1.6, 0.6, 1.1, M(0x6a1a2a)), 0, 0.8, 0)); th.add(at(box(1.6, 3.0, 0.3, M(0x6a1a2a)), 0, 2.0, -0.45)); th.add(at(box(1.8, 0.14, 1.2, G(0xffcc55, 1.1)), 0, 1.12, 0));
  const bt = beast13(); bt.scale.setScalar(1.0); bt.position.set(0, 0.5, -11.5); scene.add(bt);
  const torches = []; for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { const t = new THREE.Group(); t.position.set(s * 2.9, 2.4, 1 - k * 3.2); scene.add(t); t.add(box(0.12, 0.4, 0.12, M(0x3a2a1a))); const f = softGlow(1.2, 0xffa040); f.position.y = 0.35; t.add(f); const l = new THREE.PointLight(0xffa050, 3, 7, 1.5); l.position.y = 0.4; t.add(l); t.userData = { f, l }; torches.push(t); }
  B.dark = (k, t) => { torches.forEach((tr, i) => { const kk = clamp(k * 1.6 - (i % 4) * 0.15, 0, 1); tr.userData.f.visible = kk < 0.98; tr.userData.f.scale.setScalar(1.2 * (1 - kk) * (1 + 0.15 * Math.sin(t * 11 + i))); tr.userData.l.intensity = 3 * (1 - kk); }); B.hemi.intensity = 0.7 * (1 - 0.9 * k); if (B.sun) B.sun.intensity = 0.7 * (1 - 0.9 * k); scene.fog.far = lerp(40, 9, k); };
  B.bt = bt; B.th = th; return B;
}

// ---------- Mr A : le narrateur (lunettes rondes dorees, bouc, polo marron)
function mrA(o = {}) {
  const h = new Human({ skin: 0x5a3824, hair: 0x0e0a08, hairStyle: 'none', shortSleeve: true, top: 0xb48a6a, bottom: 0x3a3634, shoes: 0x2a2018, seed: 9001, ...o });
  const n = h.neck, hairM = M(0x0e0a08), gold = M(0xd8b060, { metalness: 0.85, roughness: 0.25 }), lens = new THREE.MeshStandardMaterial({ color: 0x141c24, metalness: 0.3, roughness: 0.35 });
  const add = (m, x, y, z) => { m.position.set(x, y, z); n.add(m); return m; };
  // bouc + moustache fine + collier de barbe court
  // cheveux tres courts : calotte fine
  add(box(0.3, 0.06, 0.29, hairM), 0, 0.305, -0.005);
  add(box(0.3, 0.12, 0.03, hairM), 0, 0.25, -0.135);
  for (const s of [-1, 1]) add(box(0.015, 0.1, 0.18, hairM), s * 0.148, 0.24, -0.03);
  add(box(0.075, 0.05, 0.025, hairM), 0, 0.045, 0.145);
  add(box(0.12, 0.02, 0.025, hairM), 0, 0.025, 0.138);
  add(box(0.08, 0.012, 0.02, hairM), 0, 0.12, 0.152);
  for (const s of [-1, 1]) add(box(0.015, 0.06, 0.05, hairM), s * 0.135, 0.06, 0.1);
  // lunettes ovales dorees
  const gl = new THREE.Group(); add(gl, 0, 0.19, 0.158);
  for (const s of [-1, 1]) {
    const l = new THREE.Mesh(new THREE.CircleGeometry(0.055, 28), lens); l.scale.y = 0.74; l.position.x = s * 0.068; gl.add(l);
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.006, 6, 28), gold); r.scale.y = 0.74; r.position.x = s * 0.068; gl.add(r);
    const tp = box(0.012, 0.012, 0.2, gold); tp.position.set(s * 0.145, 0.005, -0.1); gl.add(tp);
    const hg = box(0.02, 0.03, 0.02, gold); hg.position.set(s * 0.12, 0, -0.005); gl.add(hg);
  }
  const br = box(0.035, 0.008, 0.008, gold); br.position.set(0, 0.012, 0); gl.add(br);
  h.eyes?.forEach(e => e.visible = false); h.brows?.forEach(b => b.position.z = 0.142);
  // col de polo + patte boutonnee
  const pol = h.mats.top;
  for (const s of [-1, 1]) { const c = box(0.13, 0.05, 0.1, pol); c.position.set(s * 0.07, 0.585, 0.06); c.rotation.z = s * -0.35; c.rotation.x = -0.3; h.spine.add(c); }
  const pk = box(0.06, 0.18, 0.01, M(0xa47a5a)); pk.position.set(0, 0.5, 0.123); h.spine.add(pk);
  for (let k = 0; k < 2; k++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.006, 10), M(0xd8c0a0)); b.rotation.x = Math.PI / 2; b.position.set(0, 0.55 - k * 0.07, 0.13); h.spine.add(b); }
  return h;
}
// ================= episode 59 : versez les sept coupes (Apocalypse 16, 1-3) — nouveau format : Mr A et Claude racontent ensemble
const tag = (text, w = 1.0, border = '#ffd070', h) => card(text, { w, h: h ?? w * 0.18, border });
const BLUE = [0.1, 0.19, 0.31], BLUE_E = [0.02, 0.04, 0.09], BLOOD = [0.3, 0.012, 0.02], BLOOD_E = [0.07, 0.0, 0.0];
function bloodify(mat, k) { mat.color.setRGB(lerp(BLUE[0], BLOOD[0], k), lerp(BLUE[1], BLOOD[1], k), lerp(BLUE[2], BLOOD[2], k)); mat.emissive.setRGB(lerp(BLUE_E[0], BLOOD_E[0], k), lerp(BLUE_E[1], BLOOD_E[1], k), lerp(BLUE_E[2], BLOOD_E[2], k)); }

// ---------- le duo : Mr A (a gauche) et Claude (a droite, sur un rocher) ; ils se regardent quand l'autre parle
function lineAt(t) { for (const l of TL.lines) if (t >= l.start - 0.05 && t < l.end + 0.1) return l; return null; }
function talkK(t, spk) { let k = 0; for (const l of TL.lines) if (l.speaker === spk) k = Math.max(k, win(t, l.start - 0.25, l.end + 0.35, 0.35, 0.4)); return k; }
function duo(scene, x, z, ry = 0, o = {}) {
  const g = new THREE.Group(); g.position.set(x, o.y ?? 0, z); g.rotation.y = ry; scene.add(g);
  const a = mrA(); a.place(-0.33, 0, 0, 0.22); g.add(a.root);
  const PH = o.ph ?? 0.82;
  const pm = o.ped === 'gold' ? M(0xd8a840, { metalness: 0.6, roughness: 0.35, emissive: new THREE.Color(0x2a1804) }) : M(o.pedColor ?? 0x5a524c, { flatShading: true });
  const ped = new THREE.Mesh(o.ped === 'gold' ? new THREE.CylinderGeometry(0.27, 0.3, PH, 16) : new THREE.CylinderGeometry(0.25, 0.36, PH, 7), pm); ped.position.set(0.43, PH / 2, 0.05); g.add(ped);
  const c = L.makeClaude(); c.g.position.set(0.43, PH, 0.05); g.add(c.g);
  const fl = new THREE.PointLight(o.light ?? 0xfff0e0, o.lk ?? 2.2, 5, 1.2); fl.position.set(0.05, 1.8, 1.5); g.add(fl);
  return {
    g, a, c, update(t, m = {}) {
      const l = lineAt(t), sp = l?.speaker, tA = talkK(t, 'mra'), tC = talkK(t, 'claude');
      const am = env('mra', t), ac = env('claude', t), gs = 0.5 + 0.5 * Math.sin(t * 3.1);
      const look = m.look ?? 0;   // 1 = les deux regardent la scene (vers le fond)
      a.pose({ aR: [0.3 + tA * (0.55 + 0.35 * gs), 0.2 + 0.1 * tA], eR: 0.25 + tA * (1.0 + 0.3 * Math.sin(t * 4.3)), aL: [0.12 + 0.3 * tA * Math.max(0, Math.sin(t * 2.3 + 1)), 0.14], eL: 0.25 + 0.4 * tA, hy: 0.5 * tC * (1 - look) - 0.05 + (m.hy ?? 0), hp: 0.03 * am - 0.04 + (m.hp ?? 0), lean: 0.03 * tA, ...(m.poseA ?? {}) });
      a.face(am, sp === 'mra' ? l.expr : (m.expr ?? 'neutral'), t);
      c.g.rotation.y = -0.25 - 0.55 * tA * (1 - look) + (m.cy ?? 0);
      c.update(t, ac, m.mood ?? {});
    }
  };
}
// cadrage du duo (le duo est suppose non tourne, ou on donne ry)
function dk(t, d, o = {}) {
  const p = d.g.position, ry = d.g.rotation.y, dist = (o.dist ?? 2.7) + 0.9, side = o.side ?? 0.15;
  const fx = Math.sin(ry), fz = Math.cos(ry), rx = Math.cos(ry), rz = -Math.sin(ry);
  const cx = p.x + rx * (o.cx ?? 0.05), cz = p.z + rz * (o.cx ?? 0.05);
  return { t, p: [cx + fx * dist + rx * side, o.h ?? 1.5, cz + fz * dist + rz * side], l: [cx, o.ly ?? 1.3, cz], f: o.f ?? 50 };
}
const camFront = (cam, x, y, z = -3) => cam.position.clone().add(new THREE.Vector3(x, y, z).applyQuaternion(cam.quaternion));
function hud(scene, cam, g, k, x = 0, y = 0.25, s = 0.6, z = -3) { fade(g, k); g.position.copy(camFront(cam, x, y, z)); g.scale.setScalar(s); g.quaternion.copy(cam.quaternion); }

// ---------- fumee (sprites opaques, lisibles sur ciel clair)
let _smk; function smokeTex() { if (_smk) return _smk; const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,0.85)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.4)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); _smk = canvasTex(c); return _smk; }
function smoke(parent, n, cx, cy, cz, R, H, col = 0xd8d0dc) {
  const ps = Array.from({ length: n }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex(), color: col, transparent: true, depthWrite: false, opacity: 0 })); parent.add(s); return s; });
  return (t, k) => ps.forEach((s, i) => { const ph = (t * 0.06 + hash(i)) % 1; s.position.set(cx + (hash(i * 3) - 0.5) * R * 2 + 0.6 * Math.sin(t * 0.3 + i), cy + ph * H, cz + (hash(i * 7) - 0.5) * R); s.scale.setScalar((1.5 + hash(i * 5) * 2.5) * (0.6 + ph)); s.material.opacity = k * 0.7 * Math.sin(Math.PI * ph); s.visible = k > 0.01; });
}

// ---------- le temple celeste
function temple(scene, z = -14, s = 1.2) {
  const g = new THREE.Group(); g.position.set(0, 0, z); g.scale.setScalar(s); scene.add(g);
  const marble = M(0xb8a488, { emissive: new THREE.Color(0x140e08) }), gold = M(0xe0b040, { metalness: 0.7, roughness: 0.3, emissive: new THREE.Color(0x2a1a04) });
  for (let k = 0; k < 3; k++) g.add(at(box(9 - k * 0.6, 0.3, 6 - k * 0.6, marble), 0, 0.15 + k * 0.3, 0));
  for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 4.2, 14), marble); c.position.set(-3.25 + i * 1.3, 3.0, 2.2); g.add(c); }
  g.add(at(box(6.5, 4.2, 3.4, marble), 0, 3.0, -0.6));
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.8), new THREE.MeshBasicMaterial({ color: 0xfff0c0, toneMapped: false })); door.position.set(0, 2.3, 1.11); g.add(door);
  g.add(at(box(8.6, 0.5, 5.4, gold), 0, 5.35, 0.1));
  const pg = new THREE.CylinderGeometry(1, 1, 5.4, 3); pg.rotateX(-Math.PI / 2); const pd = new THREE.Mesh(pg, marble); pd.scale.set(5, 1.1, 1); pd.position.set(0, 6.15, 0.1); g.add(pd);
  const glow = softGlow(7, 0xffe0a0); glow.position.set(0, 2.4, 1.6); g.add(glow);
  g.userData = { door, glow }; return g;
}
function heavenTemple(o = {}) {
  const B = base({ sky: [0x2a1a40, 0xffd890, 0x8a5a7a], hemi: [0xfff0e0, 0x6a4a3a, 0.95], sun: [0xfff0d0, 1.0, [3, 8, 6]], shadow: false, bloom: [0.4, 0.5, 0.88], exposure: o.exposure ?? 0.8, fog: [0xd8a890, 30, 110] });
  const { scene } = B;
  const floor = new THREE.Mesh(new THREE.CircleGeometry(70, 40), M(0xd8b070, { emissive: new THREE.Color(0x2a1a08) })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.02, -15); scene.add(floor);
  const cl = clouds(scene, 26, -0.6, 30, { em: 0x8a6a6a, op: 1 }); cl.forEach((c, i) => { c.position.z = -48 - hash(i * 11) * 14; c.position.x *= 2; c.scale.multiplyScalar(2.2); });
  const tp = temple(scene, -14, 1.2);
  const angels = Array.from({ length: 7 }, (_, i) => { const an = bowlAngel(i); an.root.scale.setScalar(1.25); an.place(-3.9 + i * 1.3, 0, -9.6 + Math.abs(i - 3) * -0.25, 0); scene.add(an.root); return an; });
  angelLight(scene, [0, 3, -7]).intensity = 4;
  const smk = smoke(scene, 26, 0, 3, -14.5, 5, 9);
  Object.assign(B, { tp, angels, smk }); return B;
}
function angelsPose(angels, t, raise, walk = 0) { angels.forEach((an, i) => { const r = raise; an.pose({ aL: [lerp(0.9, 2.5, r), 0.3], eL: lerp(0.9, 0.3, r), aR: [0.3, 0.2], ...(walk ? L.walkPose(t * 4 + i, 0.8 * walk, { aL: [lerp(0.9, 2.5, r), 0.3], eL: lerp(0.9, 0.3, r) }) : {}) }); an.face(0, 'serious', t); }); }

// ---------- la mer au crepuscule (devient comme le sang d'un mort)
function seaSet(o = {}) {
  const B = base({ sky: [0x1a0c2a, 0xc86a5a, 0x5a2a4a], hemi: [0xffd8c8, 0x2a1a2a, 0.95], sun: [0xffc8a0, 1.0, [-6, 8, 4]], shadow: false, bloom: [0.45, 0.5, 0.86], exposure: o.exposure ?? 1.0, fog: [0x8a4a5a, 25, 120] });
  const { scene } = B;
  B.water = L.makeWater(200, 90, 0x1a3050, { emissive: 0x050a18 }); B.water.mesh.position.set(0, -0.25, -99); scene.add(B.water.mesh);
  const sand = box(80, 0.4, 12, M(0x8a7458)); sand.position.set(0, -0.2, 5); scene.add(sand);
  for (let i = 0; i < 7; i++) rock(scene, (hash(i * 3) - 0.5) * 14, -0.05, 2 + hash(i * 7) * 4, 0.3 + hash(i) * 0.5);
  const sset = softGlow(26, 0xffa070); sset.position.set(-14, 7, -80); scene.add(sset);
  B.blood = (k) => bloodify(B.water.mesh.material, k);
  B.fish = Array.from({ length: 26 }, (_, i) => { const f = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), M(0xc8ccd0, { metalness: 0.4, roughness: 0.4 })); b.scale.set(1.6, 0.6, 0.5); f.add(b); const tl = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.18, 4), M(0xb0b4b8)); tl.rotation.z = Math.PI / 2; tl.position.x = -0.3; f.add(tl); f.position.set((hash(i * 3) - 0.5) * 12, 0, -1.8 - hash(i * 7) * 14); f.rotation.set(Math.PI, hash(i) * 6, 0); f.visible = false; scene.add(f); return f; });
  B.fishUpd = (t, k) => B.fish.forEach((f, i) => { f.visible = k > hash(i * 1.7); f.position.y = L.waveH(f.position.x, f.position.z, t, 0.18) - 0.2; });
  return B;
}
function pourStream(scene, col = 0x8a0a10) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 1.4, 10, 12), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.6, depthWrite: false })); scene.add(s); return s; }
function aimStreamTo(an, stream, pour, to) { an.root.updateMatrixWorld(true); const hp = new THREE.Vector3(); an.bowl.getWorldPosition(hp); const d = hp.clone().sub(to); const len = d.length(); stream.position.copy(to).addScaledVector(d, 0.5); stream.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); stream.scale.set(0.6, len / 10, 0.6); stream.visible = pour > 0.05; stream.material.opacity = 0.75 * pour; }
function duskLand(o = {}) {
  const B = base({ sky: [0x1a1030, 0xd8704a, 0x6a2a4a], hemi: [0xffd0c0, 0x2a1820, 0.9], sun: [0xffb890, 1.0, [-6, 8, 4]], shadow: false, bloom: [0.45, 0.5, 0.86], exposure: o.exposure ?? 1.0, fog: [0x8a4a50, 20, 90] });
  const { scene } = B; scene.add(L.groundPlane(160, 50, 0x6a5a40, 0.35, 3));
  for (let i = 0; i < 9; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(7 + hash(i) * 9, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0x4a4030)); d.scale.y = 0.4; d.position.set((hash(i * 3) - 0.5) * 90, -0.5, -32 - hash(i * 5) * 30); scene.add(d); }
  const sset = softGlow(26, 0xff9060); sset.position.set(12, 8, -70); scene.add(sset);
  return B;
}
function markRed() { return new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.035, 0.012), G(0xff2a1a, 1.6)); }
function sores(h, n, seed) { const sp = []; for (let k = 0; k < n; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 6), M(0x9a1a14, { emissive: new THREE.Color(0x5a0806) })); s.position.set((hash(seed * 5 + k) - 0.5) * 0.22, 0.06 + hash(seed + k * 3) * 0.32, k % 2 ? 0.125 : 0.142); (k % 2 ? h.spine : h.neck).add(s); s.visible = false; sp.push(s); } return sp; }
function pyramid(scene, x, z, s) { const p = new THREE.Mesh(new THREE.ConeGeometry(s, s * 1.15, 4), M(0xe0c088, { flatShading: true })); p.position.set(x, s * 0.57, z); p.rotation.y = Math.PI / 4; scene.add(p); return p; }
function moses() { const h = new Human({ skin: 0xa86c44, hair: 0xe8e4dc, beard: 'full', beardColor: 0xf0ece4, top: 0x8a6a4a, bottom: 0x6a4a2a, robe: 0x9a7a52, robeL: 0.85, seed: 5801 }); return h; }

// ---------- intro : la plage au crepuscule ; la mer devient rouge au loin ; Mr A et Claude se presentent
SETS.intro = () => {
  const B = seaSet(); const { scene, cam } = B;
  const d = duo(scene, 0, 1.6, 0);
  return {
    ...B, update(t) {
      B.water.update(t, 0.18); B.blood(0.25 + 0.5 * sstep(1.5, 6, t)); B.fishUpd(t, 0);
      d.update(t, { look: win(t, C.title - 0.2, 99, 0.5, 0.1), expr: 'neutral' });
      camKeys(cam, t, [{ t: 0, p: [0.0, 1.0, 3.2], l: [0, 1.0, -20], f: 56 }, { t: 2.5, p: [0.0, 1.2, 4.2], l: [0, 1.25, 1.6], f: 50 }, dk(C.serie, d), dk(C.avant, d, { dist: 2.3, side: -0.1 }), dk(C.title - 0.2, d, { dist: 2.2, side: -0.1 }), { t: C.title + 1.2, p: [0, 3.2, 8], l: [0, 1.2, -25], f: 58 }, { t: SC.temple.start, p: [0, 3.0, 7], l: [0, 1.2, -25], f: 58 }]);
    }
  };
};

// ---------- la voix sort du temple ; « qui ? » ; la fumee (Ap 15,8) ; pourquoi sept ?
SETS.temple = () => {
  const B = heavenTemple(); const { scene, cam } = B;
  const d = duo(scene, -0.6, 3.2, 0.1, { ped: 'gold', ph: 0.85 });
  const voiceRings = Array.from({ length: 4 }, (_, i) => { const r = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 6, 48), new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0, depthWrite: false })); r.position.set(0, 2.8 * 1.2, -14 + 1.6 * 1.2); scene.add(r); return r; });
  const sevens = new THREE.Group(); scene.add(sevens);
  const S7 = [['7 églises', '#9adfff'], ['7 sceaux', '#ffd070'], ['7 trompettes', '#ffb070'], ['7 coupes', '#ff5a3a']].map(([s, c], i) => { const tg = tag(s, 0.9, c, 0.2); tg.position.set(0, 0.42 - i * 0.26, 0); sevens.add(tg); return tg; });
  const bowls = new THREE.Group(); scene.add(bowls);
  for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M(0xe0b040, { metalness: 0.7, roughness: 0.3, emissive: new THREE.Color(0x3a2008), side: THREE.DoubleSide })); b.position.set(-0.6 + i * 0.2, 0, 0); bowls.add(b); }
  const K = cardsMgr(scene, cam); refCard(K);
  K('Apocalypse 15, 8 : personne ne pouvait entrer dans le temple', { w: 1.6, h: 0.28, border: '#ffffff' }, t => win(t, C.fumee + 0.6, C.dieu, 0.3, 0.2), -0.6);
  K('Apocalypse 15, 1 : « sept fléaux, les derniers »', { w: 1.6, h: 0.24, border: '#ff5a3a' }, t => win(t, C.complet + 7.5, SC.ulcere.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.temple.start, go = sstep(T0 + 6.5, T0 + 8.0, t);
      angelsPose(B.angels, t, go);
      B.tp.userData.glow.material.opacity = 0.6 + 0.4 * Math.sin(t * 2) * 0.5 + 0.3 * win(t, T0 + 0.5, C.qui, 0.5, 0.5);
      voiceRings.forEach((r, i) => { const ph = ((t - T0) * 0.45 + i / 4) % 1; const on = win(t, T0 + 0.5, C.qui - 0.3, 0.5, 0.5); r.scale.setScalar(0.5 + ph * 4); r.material.opacity = on * 0.5 * (1 - ph); });
      B.smk(t, 0.25 + 0.75 * sstep(C.fumee, C.fumee + 3, t));
      d.update(t, { look: win(t, T0, C.qui - 0.2, 0.1, 0.3) });
      camKeys(cam, t, [{ t: T0, p: [0, 1.6, 2.2], l: [0, 4.5, -14], f: 60 }, { t: T0 + 6.0, p: [0, 1.4, 0.6], l: [0, 2.6, -12], f: 54 }, { t: C.qui - 0.42, p: [0, 1.3, -0.4], l: [0, 2.2, -10], f: 52 },
        dk(C.qui - 0.4, d), dk(C.fumee, d), { t: C.fumee + 1.2, p: [0.5, 2.0, 1.0], l: [0, 5.5, -14], f: 58 }, { t: C.fumee + 1.22, p: [0.5, 2.0, 1.0], l: [0, 5.5, -14], f: 58 }, { t: C.dieu - 0.42, p: [0.3, 2.2, 0.0], l: [0, 6.5, -14], f: 58 },
        dk(C.dieu - 0.4, d, { dist: 2.4 }), dk(C.complet + 0.6, d, { dist: 2.6 }), { t: C.complet + 0.62, p: [0, 1.7, 1.6], l: [0, 1.8, -10], f: 54 }, { t: SC.ulcere.start, p: [0, 1.8, 1.0], l: [0, 1.8, -10], f: 54 }]);
      const ck = C.complet + 0.8; hud(scene, cam, sevens, win(t, ck, C.complet + 7.4, 0.4, 0.3), 0, 0.1, 0.75);
      S7.forEach((tg, i) => fade(tg, sstep(ck + i * 1.1, ck + i * 1.1 + 0.3, t) * win(t, ck, C.complet + 7.4, 0.4, 0.3)));
      hud(scene, cam, bowls, win(t, C.complet + 7.4, SC.ulcere.start, 0.4, 0.2), 0, 0.35, 0.9);
      K.update(t);
    }
  };
};

// ---------- la 1re coupe : un ulcere malin sur ceux qui ont la marque ; la marque (Ap 13,16-17)
SETS.ulcere = () => {
  const B = duskLand(); const { scene, cam } = B;
  const an = bowlAngel(0); an.root.scale.setScalar(3); an.place(-3.5, 9, -22, 0.4); scene.add(an.root); angelLight(scene, [-3, 13, -18]).intensity = 4;
  const stream = pourStream(scene, 0x6a2a1a);
  const ppl = Array.from({ length: 6 }, (_, i) => { const h = citizen(i + 30); h.place(-1.9 + i * 0.75, 0, -2.2 - (i % 2) * 0.8, 0.15 - 0.06 * i); scene.add(h.root);
    const mk = markRed(); mk.position.set(0, 0.255, 0.142); h.neck.add(mk); const mh = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.04, 0.105), G(0xff2a1a, 1.6)); mh.position.set(0, 0.0, 0); h.hand.R.add(mh); h.sp = sores(h, 6, i + 3); return h; });
  const d = duo(scene, 2.4, 1.4, -0.35);
  const K = cardsMgr(scene, cam); refCard(K);
  const mk1 = tag('sur la main droite', 0.75, '#ff3a2a', 0.16), mk2 = tag('ou sur le front', 0.75, '#ff3a2a', 0.16); scene.add(mk1, mk2);
  K('Apocalypse 13, 16-17 : nul ne pouvait acheter ni vendre sans la marque', { w: 1.6, h: 0.3, border: '#ff5a3a' }, t => win(t, C.marque + 3.5, C.tranquille, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.ulcere.start, pour = win(t, T0 + 1, T0 + 7, 0.8, 0.8), hit = sstep(T0 + 4, T0 + 7, t);
      an.pose({ aL: [2.4, 0.3], eL: 0.4, aR: [0.4, 0.2] }); an.bowl.rotation.z = -1.6 * pour; an.face(0, 'serious', t); aimStreamTo(an, stream, pour, new THREE.Vector3(0, 0, -2.6));
      const p0 = ppl[2];
      ppl.forEach((h, i) => { const k = sstep(T0 + 4 + i * 0.25, T0 + 5 + i * 0.25, t); h.sp.forEach((s, j) => s.visible = k > j / 6);
        if (i === 2 && t > C.marque - 0.2 && t < C.tranquille) { h.pose({ aR: [0.9, -0.25], eR: 1.5, aL: [0.2, 0.15] }); h.face(0, 'sad', t); }
        else if (k > 0.3) { h.pose({ aL: [2.2, 0.6], aR: [2.2, 0.6], eL: 1.8, eR: 1.8, lean: 0.3 + 0.08 * Math.sin(t * 3 + i), hp: 0.3 }); h.face(0.3 * Math.max(0, Math.sin(t * 5 + i)), 'fear', t); }
        else { h.pose({ aL: [0.1, 0.1], aR: [0.1, 0.1], hp: -0.3 }); h.face(0, 'awe', t); } });
      d.update(t, { look: win(t, T0, C.seulement - 0.2, 0.1, 0.3) });
      p0.root.updateMatrixWorld(true); const fw = new THREE.Vector3(), hw = new THREE.Vector3(); p0.neck.getWorldPosition(fw); p0.hand.R.getWorldPosition(hw);
      camKeys(cam, t, [{ t: T0, p: [0, 2.4, 6.5], l: [-1.5, 5, -18], f: 58 }, { t: T0 + 3.5, p: [0, 2.0, 4.5], l: [0, 1.0, -3], f: 56 }, { t: C.seulement - 0.4, p: [0, 1.7, 2.4], l: [0, 1.3, -2.5], f: 52 },
        dk(C.seulement, d), dk(C.marque, d), { t: C.marque + 1.3, p: [fw.x + 0.1, fw.y + 0.1, fw.z + 1.6], l: [fw.x - 0.05, fw.y + 0.05, fw.z], f: 46 }, { t: C.tranquille - 0.3, p: [fw.x + 0.05, fw.y + 0.1, fw.z + 1.7], l: [fw.x - 0.05, fw.y + 0.05, fw.z], f: 46 },
        dk(C.tranquille, d, { dist: 2.5 }), dk(SC.egypte.start, d, { dist: 2.3 })]);
      fade(mk1, win(t, C.marque + 1.8, C.tranquille, 0.3, 0.2)); fade(mk2, win(t, C.marque + 2.5, C.tranquille, 0.3, 0.2));
      mk1.position.set(hw.x + 0.3, hw.y + 0.12, hw.z + 0.3); mk2.position.set(fw.x + 0.05, fw.y + 0.5, fw.z + 0.2); mk1.lookAt(cam.position); mk2.lookAt(cam.position); mk1.scale.setScalar(0.38); mk2.scale.setScalar(0.38);
      K.update(t);
    }
  };
};

// ---------- la 6e plaie d'Egypte : Moise lance la cendre ; les magiciens ; les plaies d'Egypte reprises
SETS.egypte = () => {
  const B = base({ sky: [0xd87a3a, 0xffe0a8, 0xffb878], hemi: [0xfff0d8, 0x7a5a3a, 1.0], sun: [0xffe0b8, 1.2, [6, 9, 4]], shadow: false, bloom: [0.35, 0.5, 0.9], exposure: 0.95, fog: [0xf0c090, 25, 110] });
  const { scene, cam } = B; scene.add(L.groundPlane(160, 50, 0xc8a070, 0.35, 6));
  pyramid(scene, -14, -48, 7); pyramid(scene, -4, -58, 9); pyramid(scene, 10, -52, 6);
  for (let i = 0; i < 8; i++) { const p = L.makePalm(3 + hash(i) * 1.5, i); p.position.set((i % 2 ? 1 : -1) * (5 + hash(i * 3) * 4), 0, -6 - i * 3.2); scene.add(p); }
  const mo = moses(); mo.place(-0.9, 0, 0.4, 0.5); scene.add(mo.root);
  const ph = new Human({ skin: 0x9a6a44, hair: 0x120c08, top: 0xf0e8d0, bottom: 0xf0e8d0, robe: 0xf0e8d0, robeL: 0.85, hat: 'crown', seed: 5902 }); ph.place(1.4, 0, -3.2, -0.4); scene.add(ph.root);
  const mags = [0, 1].map(i => { const h = new Human({ skin: 0x8a5a3a, hair: 0x120c08, hairStyle: 'bald', top: 0x2a2a3a, bottom: 0x2a2a3a, robe: 0x1a1a2a, robeL: 0.85, seed: 5903 + i }); h.place(0.4 + i * 0.9, 0, -1.6 - i * 0.4, -0.6); scene.add(h.root); h.sp = sores(h, 7, i + 11); return h; });
  const cows = [0, 1].map(i => { const c = L.makeAnimal('camel'); c.scale.setScalar(0.8); c.position.set(-3.4 - i * 1.2, 0, -4 - i * 1.5); c.rotation.y = 0.8; scene.add(c); return c; });
  const ash = Array.from({ length: 60 }, (_, i) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.025 + hash(i) * 0.03, 0), M(0x9a948c)); scene.add(m); return m; });
  const d = duo(scene, 3.2, 2.2, -0.3);
  const plg = new THREE.Group(); scene.add(plg);
  const rows = [['sang', '16, 3-4'], ['grenouilles', '16, 13'], ['ulcères', '16, 2'], ['ténèbres', '16, 10'], ['grêle', '16, 21']].map(([a, b], i) => { const tg = tag(`${a}  →  Ap ${b}`, 1.0, '#ffd070', 0.17); tg.position.set(0, 0.5 - i * 0.22, 0); plg.add(tg); return tg; });
  const hd = tag('PLAIES D\'ÉGYPTE → COUPES', 1.1, '#ff5a3a', 0.17); hd.position.set(0, 0.76, 0); plg.add(hd);
  const K = cardsMgr(scene, cam); refCard(K);
  K('Exode 9, 8-11 : la sixième plaie, les ulcères', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, SC.egypte.start + 4.5, C.nil, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.egypte.start, Tt = T0 + 2.8, lift = sstep(T0 + 1.2, Tt, t), thr = sstep(Tt, Tt + 0.3, t);
      mo.pose({ aR: [lerp(0.6, 1.4, lift) + 1.6 * thr, 0.2], eR: lerp(1.6, 0.6, lift) * (1 - thr), aL: [lerp(0.6, 1.4, lift) + 1.4 * thr, 0.2], eL: lerp(1.6, 0.6, lift) * (1 - thr), hp: -0.2 * thr }); mo.face(0, 'serious', t);
      mo.root.updateMatrixWorld(true); const hp = new THREE.Vector3(); mo.hand.R.getWorldPosition(hp);
      ash.forEach((m, i) => { const u = t - Tt - hash(i * 3) * 0.3; if (u < 0) { m.position.copy(hp); m.visible = t > T0 + 1.2; return; } m.visible = true; const vx = (hash(i * 5) - 0.5) * 1.6, vz = (hash(i * 7) - 0.5) * 1.2 - 0.5, vy = 3.2 + hash(i) * 1.5; const up = Math.min(u, 1.2); const fall = Math.max(0, u - 1.2); m.position.set(hp.x + vx * (up + fall * 0.6), hp.y + vy * up - 4.9 * up * up * 0.4 - fall * 0.25, hp.z + vz * (up + fall * 0.6)); m.scale.setScalar(1 + Math.min(u, 1) * 0.8); m.visible = u < 3.5; });
      const sk = sstep(Tt + 2.5, Tt + 5, t);
      mags.forEach((h, i) => { h.sp.forEach((s, j) => s.visible = sk > j / 7); const down = sstep(C.magiciens + 0.5 + i * 0.4, C.magiciens + 1.5 + i * 0.4, t); h.pose(down > 0.5 ? L.kneelPose({ lean: 0.5, aL: [1.4, 0.4], aR: [1.4, 0.4], eL: 1.6, eR: 1.6, hp: 0.4 }) : { aL: [0.3 + 1.5 * sk, 0.3], aR: [0.3 + 1.5 * sk, 0.3], eL: 1.6 * sk, eR: 1.6 * sk }); h.face(0.2 * sk, sk > 0.3 ? 'fear' : 'serious', t); });
      ph.pose({ aL: [0.4, 0.2], aR: [0.4, 0.2] }); ph.face(0, 'serious', t);
      d.update(t, { look: win(t, T0, C.nil - 0.3, 0.1, 0.3) });
      camKeys(cam, t, [{ t: T0, p: [-2.6, 1.4, 3.4], l: [-0.6, 1.4, -0.2], f: 52 }, { t: Tt - 0.3, p: [-2.6, 1.5, 3.6], l: [-0.6, 1.8, -0.6], f: 54 }, { t: Tt + 1.0, p: [-1.0, 1.4, 4.4], l: [-0.6, 3.2, -1.5], f: 58 }, { t: Tt + 2.6, p: [-0.4, 1.8, 4.6], l: [0.2, 1.2, -1.8], f: 54 }, { t: C.magiciens, p: [0.2, 1.6, 2.6], l: [0.8, 1.0, -1.8], f: 50 }, { t: C.nil - 0.3, p: [0.3, 1.5, 2.4], l: [0.8, 0.8, -1.8], f: 50 },
        dk(C.nil, d), dk(C.nil + 4, d, { dist: 2.5 }), dk(SC.mer.start, d, { dist: 2.6 })]);
      const L4 = TL.lines.filter(l => l.start > C.nil)[1]?.start ?? (C.nil + 4);
      hud(scene, cam, plg, win(t, L4 + 0.4, SC.mer.start, 0.4, 0.2), 0, 0.12, 0.62);
      rows.forEach((tg, i) => fade(tg, sstep(L4 + 0.8 + i * 0.5, L4 + 1.1 + i * 0.5, t) * win(t, L4 + 0.4, SC.mer.start, 0.4, 0.2)));
      K.update(t);
    }
  };
};

// ---------- la 2e coupe : la mer comme le sang d'un mort ; le sang d'un mort ; un tiers puis tout ; 71 %
SETS.mer = () => {
  const B = seaSet(); const { scene, cam } = B;
  const an = bowlAngel(1); an.root.scale.setScalar(3); an.place(-2.5, 8, -20, 0.3); scene.add(an.root); angelLight(scene, [-2, 12, -16]).intensity = 4;
  const stream = pourStream(scene);
  const d = duo(scene, 2.7, 1.8, -0.15);
  const drops = new THREE.Group(); scene.add(drops);
  const dv = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), G(0xff2020, 1.4)); dv.position.x = -0.55; drops.add(dv);
  const dm = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), M(0x3a0606, { roughness: 0.2, emissive: new THREE.Color(0x120000) })); dm.position.x = 0.55; dm.scale.y = 0.7; drops.add(dm);
  const dl1 = tag('vivant :\nrouge vif, il circule', 0.9, '#ff3a3a', 0.3); dl1.position.set(-0.55, -0.48, 0); drops.add(dl1);
  const dl2 = tag('mort :\nsombre, il s\'épaissit', 0.9, '#8a2a2a', 0.3); dl2.position.set(0.55, -0.48, 0); drops.add(dl2);
  const bars = new THREE.Group(); scene.add(bars);
  const mkBar = (y, frac, lab, col) => { const bg = box(1.6, 0.16, 0.02, M(0x1a3050, { emissive: new THREE.Color(0x0a1a30) })); bg.position.set(0, y, 0); bars.add(bg); const fg = box(1.6, 0.17, 0.03, G(col, 1.2)); fg.geometry.translate(0.8, 0, 0); fg.position.set(-0.8, y, 0.01); bars.add(fg); const lb = tag(lab, 1.6, '#ffd070', 0.17); lb.position.set(0, y + 0.2, 0); bars.add(lb); return { fg, frac }; };
  const b1 = mkBar(0.3, 1 / 3, 'Trompettes (Ap 8, 8-9) : un tiers', 0xc01818), b2 = mkBar(-0.3, 1, 'Coupes (Ap 16, 3) : TOUT', 0x8a0a10);
  const earth = new THREE.Group(); scene.add(earth);
  const sph = new THREE.Mesh(new THREE.SphereGeometry(0.45, 40, 24), M(0x2a5ab8, { emissive: new THREE.Color(0x0a1a3a) })); earth.add(sph);
  for (let i = 0; i < 7; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16 + hash(i) * 0.08, 1), M(0x6a7a3a, { flatShading: true })); const th = hash(i * 3) * Math.PI * 2, ph_ = (hash(i * 7) - 0.5) * 2.2; c.position.set(0.37 * Math.cos(ph_) * Math.cos(th), 0.37 * Math.sin(ph_), 0.37 * Math.cos(ph_) * Math.sin(th)); c.scale.set(1, 0.7, 0.4); c.lookAt(0, 0, 0); earth.add(c); }
  const el = tag('71 % de la surface de la Terre', 1.2, '#ff5a3a', 0.17); el.position.set(0, -0.62, 0); earth.add(el);
  const K = cardsMgr(scene, cam); refCard(K);
  return {
    ...B, update(t) {
      const T0 = SC.mer.start, pour = win(t, T0 + 1, C.mort - 0.5, 0.8, 0.6), r = sstep(T0 + 3, T0 + 7.5, t);
      B.water.update(t, 0.18 * (1 - 0.7 * r)); B.blood(r); B.fishUpd(t, sstep(T0 + 6, T0 + 9, t));
      an.pose({ aL: [2.4, 0.3], eL: 0.4, aR: [0.4, 0.2] }); an.bowl.rotation.z = -1.6 * pour; an.face(0, 'serious', t); aimStreamTo(an, stream, pour, new THREE.Vector3(-0.5, -0.2, -10));
      d.update(t, { look: win(t, T0, C.mort - 0.2, 0.1, 0.3) });
      camKeys(cam, t, [{ t: T0, p: [0, 2.6, 7], l: [-1.5, 5, -20], f: 58 }, { t: T0 + 4, p: [0, 2.2, 6.5], l: [0, 0.6, -12], f: 56 }, { t: C.mort - 0.5, p: [0.2, 1.4, 4.0], l: [0, 0.2, -6], f: 54 },
        dk(C.mort, d), dk(C.epais, d), { t: C.epais + 1.2, p: [-0.6, 1.0, 1.2], l: [-0.6, -0.1, -3.5], f: 50 }, { t: C.tiers - 0.3, p: [-0.6, 1.0, 0.9], l: [-0.6, -0.1, -3.5], f: 50 },
        dk(C.tiers, d), dk(C.trompette, d), { t: C.trompette + 1.2, p: [0, 2.0, 5.5], l: [0, 0.6, -12], f: 56 }, { t: C.surface - 0.3, p: [0, 2.0, 5.5], l: [0, 0.6, -12], f: 56 },
        { t: C.surface, p: [0, 2.0, 5.5], l: [0, 0.6, -12], f: 56 }, { t: SC.fin.start, p: [0, 2.2, 6.0], l: [0, 0.8, -12], f: 56 }]);
      hud(scene, cam, drops, win(t, C.epais + 1.6, C.tiers, 0.4, 0.3), 0, 0.2, 0.7);
      const bk = win(t, C.trompette + 1.4, C.surface, 0.4, 0.3); hud(scene, cam, bars, bk, 0, 0.2, 0.62);
      b1.fg.scale.x = Math.max(0.001, b1.frac * sstep(C.trompette + 2, C.trompette + 3.5, t)); b2.fg.scale.x = Math.max(0.001, sstep(C.trompette + 6, C.trompette + 7.5, t));
      hud(scene, cam, earth, win(t, C.surface + 0.3, SC.fin.start, 0.4, 0.2), 0, 0.1, 0.8); earth.rotation.y = 0; sph.rotation.y = t * 0.3; earth.children.forEach((c, i) => { if (i && c !== el) { const th = hash(i * 3) * Math.PI * 2 + t * 0.3, ph_ = (hash(i * 7) - 0.5) * 2.2; c.position.set(0.37 * Math.cos(ph_) * Math.cos(th), 0.37 * Math.sin(ph_), 0.37 * Math.cos(ph_) * Math.sin(th)); c.lookAt(earth.localToWorld(new THREE.Vector3())); } });
      bloodify(sph.material, sstep(C.surface + 1.2, C.surface + 2.6, t));
      K.update(t);
    }
  };
};

// ---------- fin : sept anges sortent du temple avec les coupes d'or ; la fumee (prochain episode : Ap 15)
SETS.fin = () => {
  const B = heavenTemple({ exposure: 0.88 }); const { scene, cam } = B;
  const d = duo(scene, 0, 2.2, 0, { ped: 'gold' });
  const K = cardsMgr(scene, cam);
  K('PROCHAIN ÉPISODE · Apocalypse 15', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, SC.fin.start + 4, TL.duration + 1, 0.4, 0.2), -0.22);
  return {
    ...B, update(t) {
      const T0 = SC.fin.start, w = sstep(T0 + 2.5, T0 + 9, t);
      B.angels.forEach((an, i) => { an.root.position.z = -10.4 + Math.abs(i - 3) * -0.25 + 3.0 * w; });
      angelsPose(B.angels, t, 0.6, w < 0.99 && w > 0.01 ? 1 : 0);
      B.smk(t, sstep(T0 + 7, T0 + 11, t));
      d.update(t, { look: 0, hy: 0 });
      camKeys(cam, t, [dk(T0, d, { dist: 2.4 }), dk(T0 + 2.4, d, { dist: 2.6 }), { t: T0 + 4.5, p: [0.6, 1.8, 5.2], l: [0, 2.6, -12], f: 56 }, { t: TL.duration, p: [0.4, 3.0, 6.4], l: [0, 3.4, -14], f: 58 }]);
      K.update(t);
    }
  };
};

// ---------- couverture : la mer de sang, l'ange verse sa coupe, Mr A et Claude regardent depuis la plage
SETS.cover = () => {
  const B = seaSet(); const { scene, cam } = B;
  const an = bowlAngel(1); an.root.scale.setScalar(3); an.place(-1.8, 7.5, -18, 0.3); scene.add(an.root); angelLight(scene, [-1, 11, -14]).intensity = 4;
  const stream = pourStream(scene);
  const d = duo(scene, 0.15, 2.4, 0.25);
  const tg = softGlow(10, 0xffe0a0); tg.position.set(6, 12, -40); scene.add(tg);
  return { ...B, update() { const t = 3; B.water.update(t, 0.08); B.blood(1); B.fishUpd(t, 1); an.pose({ aL: [2.4, 0.3], eL: 0.4, aR: [0.4, 0.2] }); an.bowl.rotation.z = -1.6; an.face(0, 'serious', t); aimStreamTo(an, stream, 1, new THREE.Vector3(-0.5, -0.2, -9));
    d.update(t, { look: 1, hy: -0.55, hp: -0.32, expr: 'awe', mood: {}, poseA: { aR: [2.5, 0.45], eR: 0.15, aL: [0.15, 0.14], hy: -0.55, hp: -0.32 } }); d.c.g.rotation.y = -0.9; d.c.update(t, 0, { armsUp: 0.15 }); d.a.face(0, 'awe', t);
    cam.position.set(0.7, 1.15, 6.3); cam.fov = 60; cam.updateProjectionMatrix(); cam.lookAt(-0.8, 2.15, -6); cam.userData.focus = 3.2; } };
};

const SHOTS = [['intro', 0, SC.temple.start], ['temple', SC.temple.start, SC.ulcere.start], ['ulcere', SC.ulcere.start, SC.egypte.start], ['egypte', SC.egypte.start, SC.mer.start], ['mer', SC.mer.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
