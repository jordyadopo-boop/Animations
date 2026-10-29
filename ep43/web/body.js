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

const REF = 'Apocalypse 21, 1-8 · traduction Louis Segond';
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
const refCard = (K) => K(REF, { w: 1.6, h: 0.12, border: '#807060', color: '#e8e0d4' }, t => t > SC.mer.start + 0.3 && t < SC.fin.start ? 0.85 : 0, -0.88, 0.75);


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

// ---------- intro : la Terre se dissout, un monde neuf s'allume
SETS.intro = () => {
  const B = base({ bg: 0x05050c, hemi: [0xd8d0ff, 0x10101a, 0.8], sun: [0xfff0d8, 1.1, [3, 4, 6]], shadow: false, bloom: [0.6, 0.5, 0.8], exposure: 1.0 }); const { scene, cam } = B;
  scene.add(L.stars(700, 60, 1.2));
  const earth = globe(2.0); earth.position.set(0, 1.4, -5); scene.add(earth);
  const bits = []; for (let i = 0; i < 160; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05 + hash(i) * 0.06, 0), M(hash(i * 9) > 0.5 ? 0x2a5ab8 : 0x4a9a4a)); scene.add(m); const a = hash(i * 3) * Math.PI * 2, b = (hash(i * 5) - 0.5) * 3; m.userData.d = new THREE.Vector3(Math.cos(a) * Math.cos(b), Math.sin(b), Math.sin(a) * Math.cos(b)); bits.push(m); }
  const nw = glowStar(4, 0xfff0d0); nw.position.set(0, 1.4, -5.2); scene.add(nw);
  const rig = claudeRig(scene, [1.1, -0.2, 1.4], -0.5, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28); faceLight(scene, [0.9, 0.6, 2.8], 1.0);
  scene.add(at(new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.15, 10), M(0x2a2430)), 1.0, -0.28, 1.4));
  const back = label('◀ une scène avant', { w: 0.8, h: 0.12, color: '#ffd070', font: 'bold 80px Inter' }); rig.holoG.add(back);
  const K = cardsMgr(scene, cam);
  K('le ciel · la terre · la mer… disparus', { w: 1.6, h: 0.24, border: '#9adfff' }, t => win(t, 3.0, C.serie, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const d = sstep(2.0, 6.5, t); earth.rotation.y = 0.2 * t; fade(earth, 1 - sstep(2.0, 3.0, t));
      bits.forEach((m, i) => { m.position.set(0, 1.4, -5).addScaledVector(m.userData.d, 2.0 + d * (2 + hash(i) * 4)); fade(m, d > 0.01 ? 1 - sstep(4.5, 7.5, t) : 0); m.rotation.x = t + i; });
      nw.material.opacity = sstep(6.0, 8.5, t) * (1 - 0.7 * win(t, C.serie, C.title + 1, 0.5, 0.5)); nw.scale.setScalar(4 + 0.3 * Math.sin(t * 1.5));
      const bk = win(t, C.serie + 0.3, C.title, 0.3, 0.3); beamOn(rig, bk, t); fade(back, bk); back.lookAt(cam.position); rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: 0, p: [0, 1.4, 4.2], l: [0, 1.4, -5], f: 50 }, { t: C.serie, p: [0, 1.2, 4.6], l: [0, 1.2, -5], f: 50 }, { t: C.serie + 0.8, p: [0.9, 0.5, 4.2], l: [0.6, 0.1, 0], f: 48 }, { t: SC.mer.start, p: [0.8, 0.5, 4.0], l: [0.6, 0.1, 0], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- Patmos, la mer, l'abime, la bete ; la mer disparait
SETS.mer = () => {
  const B = seaWorld({ sky: [0x0a1430, 0x6a5a7a], exposure: 1.0, sunPos: [2, 6, 8] }); const { scene, cam } = B;
  const j = john(); j.place(0, 0, 1.0, 0.15); scene.add(j.root); faceLight(scene, [0.3, 1.6, 3.6], 1.3);
  const abyss = new THREE.Group(); abyss.position.set(-1.0, 0.2, -6); scene.add(abyss);
  for (let k = 0; k < 5; k++) { const r = new THREE.Mesh(new THREE.TorusGeometry(1 + k * 0.7, 0.06, 6, 40), holoMat(0x5a7aff, 0.5)); r.rotation.x = Math.PI / 2; r.position.y = -k * 0.3; abyss.add(r); }
  const beast = new THREE.Group(); beast.position.set(1.4, -3, -6); scene.add(beast); const segs = [];
  for (let k = 0; k < 9; k++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45 - k * 0.03, 1), holoMat(0xff4a3a, 0.45)); beast.add(s); segs.push(s); }
  for (let h = 0; h < 7; h++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.5, 5), holoMat(0xff4a3a, 0.5)); c.position.set((h - 3) * 0.18, 4.0, 0); c.rotation.z = (h - 3) * 0.15; beast.add(c); }
  const nw = glowStar(16, 0xfff0d0); nw.position.set(0, 7, -40); scene.add(nw);
  const K = cardsMgr(scene, cam); refCard(K);
  K('Patmos · une île de la mer Égée · Jean en exil', { w: 1.6, h: 0.24, border: '#9adfff' }, t => win(t, SC.mer.start + 0.8, SC.mer.start + 6.0, 0.3, 0.2), -0.6);
  K('Genèse 1, 2 : les ténèbres sur l\'abîme, les eaux', { w: 1.6, h: 0.24, border: '#5a7aff' }, t => win(t, C.chaos + 1.5, C.bete, 0.3, 0.2), -0.6);
  K('Apocalypse 13, 1 : la bête monte de la mer', { w: 1.6, h: 0.24, border: '#ff4a3a' }, t => win(t, C.bete + 0.3, C.bete + 4.5, 0.3, 0.2), -0.6);
  K('plus de mer : plus de chaos, plus de séparation', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.bete + 4.7, SC.tente.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.mer.start; B.water.update(t, 0.25);
      fade(abyss, win(t, C.chaos + 1, C.bete + 0.5, 0.6, 0.6)); abyss.rotation.y = t * 0.6;
      const bu = sstep(C.bete, C.bete + 3, t); beast.position.y = -3 + 3.2 * bu; fade(beast, win(t, C.bete, C.bete + 6, 0.5, 0.8));
      segs.forEach((s, k) => s.position.set(0.35 * Math.sin(t * 1.5 + k * 0.7), k * 0.45, 0));
      const k = sstep(C.bete + 5, SC.tente.start, t); B.water.mesh.position.y = -0.2 - 3 * k; fade(B.water.mesh, 1 - k); nw.material.opacity = 0.15 + 0.85 * k;
      j.pose({ hp: t > C.bete ? -0.12 : 0 }); j.face(0, t > C.bete + 5 ? 'awe' : 'neutral', t);
      camKeys(cam, t, [{ t: T0, p: [0.6, 1.7, 3.6], l: [0, 1.4, 0.8], f: 48 }, { t: C.chaos, p: [0.4, 1.8, 4.4], l: [-0.6, 1.0, -6], f: 52 }, { t: C.bete, p: [0.4, 1.8, 4.6], l: [0.8, 1.6, -6], f: 52 }, { t: C.bete + 5, p: [0.3, 1.9, 5.0], l: [0, 1.4, -12], f: 52 }, { t: SC.tente.start, p: [0.2, 2.2, 5.4], l: [0, 2.0, -30], f: 54 }]);
      K.update(t);
    }
  };
};

// ---------- la ville descend comme une epouse ; la voix du trone
SETS.ville = () => {
  const B = mountainSet(); const { scene, cam } = B;
  const j = john(); j.place(0.2, 0, 0.6, 0.35); scene.add(j.root); faceLight(scene, [0.4, 1.6, 3.2], 1.3);
  const city = makeCity(6); scene.add(city); const cglow = glowStar(16, 0xffe8a0); scene.add(cglow);
  const K = cardsMgr(scene, cam); refCard(K);
  K('« comme une épouse parée » = la ville (épisode 42)', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, SC.tente.start + 3, C.forte + 3.5, 0.3, 0.2), -0.6);
  K('« Voici le tabernacle de Dieu avec les hommes »', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, C.forte + 3.7, C.desert, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.tente.start; const d = sstep(T0, C.forte, t); city.position.set(0, lerp(22, 0.5, d), -22); city.rotation.y = 0.3 + 0.05 * t;
      cglow.position.set(0, city.position.y + 4, -22.5); cglow.scale.setScalar(16 + (t > C.forte + 3 ? 3 * Math.sin(t * 3) ** 2 : 0));
      j.pose({ hp: -0.22 }); j.face(0, 'awe', t);
      camKeys(cam, t, [{ t: T0, p: [0.9, 1.4, 3.0], l: [0.2, 1.5, 0.6], f: 46 }, { t: T0 + 3, p: [0.6, 1.3, 4.4], l: [0, 4.0, -22], f: 52 }, { t: C.forte, p: [0.6, 1.4, 4.6], l: [0, 3.0, -22], f: 52 }, { t: C.desert, p: [0.4, 1.6, 5.2], l: [0, 3.0, -22], f: 52 }]);
      K.update(t);
    }
  };
};

// ---------- le tabernacle au milieu du camp ; plus de rideau
SETS.tente = () => {
  const B = base({ sky: [0x3a5a9a, 0xf0c890], hemi: [0xfff0e0, 0x6a5040, 0.9], sun: [0xfff0d0, 1.1, [4, 8, 8]], shadowSize: 10, bloom: [0.4, 0.5, 0.9], exposure: 0.72, fog: [0xe8c8a0, 25, 90], target: [0, 0, 0] }); const { scene, cam } = B;
  scene.add(L.groundPlane(120, 40, 0xd8b884, 0.2, 5));
  const court = new THREE.Group(); scene.add(court);
  const linen = M(0xf4eee0);
  court.add(at(box(8, 0.9, 0.06, linen), 0, 0.45, -2)); court.add(at(box(8, 0.9, 0.06, linen), 0, 0.45, 2)); court.add(at(box(0.06, 0.9, 4, linen), -4, 0.45, 0)); court.add(at(box(0.06, 0.9, 4, linen), 4, 0.45, 0));
  const tent = at(box(2.6, 1.2, 1.2, M(0x6a3a2a)), -1.2, 0.6, 0); court.add(tent);
  const curtain = at(box(0.04, 1.1, 1.0, M(0x8a1a3a, { emissive: new THREE.Color(0x2a0410) })), 0.12, 0.58, 0); court.add(curtain);
  const holy = glowStar(1.6, 0xfff0c0); holy.position.set(-1.8, 0.7, 0); court.add(holy);
  court.add(at(box(0.5, 0.3, 0.5, M(0xb08a40)), 1.8, 0.15, 0));
  const pillar = new THREE.Group(); pillar.position.set(-1.2, 1.4, 0); scene.add(pillar); for (let k = 0; k < 8; k++) pillar.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.55 - k * 0.02, 1), M(0xffffff, { emissive: new THREE.Color(0x605a50), transparent: true, opacity: 0.85 })), Math.sin(k) * 0.15, k * 0.6, 0));
  for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2, R = 9 + hash(i) * 5; const c = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.8, 4), M([0x8a6a4a, 0x6a4a3a, 0xa8885a][i % 3])); c.position.set(Math.cos(a) * R, 0.4, Math.sin(a) * R); scene.add(c); }
  const ppl = citizens(scene, 6); const big = glowStar(4, 0xfff0c0); scene.add(big);
  const K = cardsMgr(scene, cam); refCard(K);
  K('le tabernacle : la tente au centre du camp (Exode 25-27)', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.desert + 0.3, C.desert + 5, 0.3, 0.2), -0.6);
  K('Exode 25, 8 : « j\'habiterai au milieu d\'eux »', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.desert + 5.2, C.partout, 0.3, 0.2), -0.6);
  K('plus de rideau : Dieu habite avec tous', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, C.partout + 0.3, SC.larmes.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const p = sstep(C.partout, C.partout + 2.5, t);
      fade(curtain, 1 - p); fade(court, 1 - 0.85 * p); fade(pillar, 1 - p);
      big.position.set(-1.2, 1.4, 0); big.scale.setScalar(1.5 + 4.5 * p); big.material.opacity = 0.2 + 0.6 * p;
      ppl.forEach((h, i) => { const a = Math.PI * (1.1 + 0.8 * i / 5); h.place(-1.2 + Math.cos(a) * 3.0, 0, Math.sin(a) * 2.4, Math.atan2(-Math.cos(a), -Math.sin(a))); h.pose({ hp: -0.15 }); h.face(0, 'happy', t); fade(h.root, p); });
      camKeys(cam, t, [{ t: C.desert, p: [6, 7, 12], l: [0, 0.5, 0], f: 50 }, { t: C.desert + 6, p: [3.5, 3.5, 8.5], l: [-0.8, 0.8, 0], f: 50 }, { t: C.partout, p: [2.5, 2.5, 7.0], l: [-1, 1.0, 0], f: 50 }, { t: SC.larmes.start, p: [1.0, 2.6, 8.5], l: [-1.2, 1.2, 0], f: 52 }]);
      K.update(t);
    }
  };
};

// ---------- il essuie toute larme ; ni mort, ni deuil, ni cri, ni douleur
SETS.larmes = () => {
  const B = heavenCity({ exposure: 0.72, bloom: [0.35, 0.5, 0.92] }); const { scene, cam } = B;
  const w = woman(); w.place(0, 0, 2.6, 0.15); scene.add(w.root); faceLight(scene, [0.2, 1.7, 4.4], 1.4);
  const tears = [tear(w, 1), tear(w, -1)];
  const hand = glowStar(0.35, 0xfff4d0); scene.add(hand);
  const words = ['MORT', 'DEUIL', 'CRI', 'DOULEUR'].map((s, i) => strikeWord(scene, s, [0, 1.35 - i * 0.21, 3.0]));
  const ppl = citizens(scene, 5); const hands = ppl.map(() => { const h = glowStar(0.4, 0xfff4d0); scene.add(h); return h; });
  const sc = scroll(0.7); scene.add(sc);
  const K = cardsMgr(scene, cam); refCard(K);
  K('il essuie lui-même les larmes', { w: 1.6, h: 0.24, border: '#bfe8ff' }, t => win(t, C.geste + 2.5, C.isaie, 0.3, 0.2), -0.6);
  K('Isaïe 25, 8 : « le Seigneur essuie les larmes de tous les visages »', { w: 1.6, h: 0.3, border: '#ffd070' }, t => win(t, C.isaie + 1.0, SC.trone.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.larmes.start; B.tick(t);
      const wipe = sstep(T0 + 1.2, T0 + 3.2, t);
      tears.forEach((d, i) => { tearAt(d, ((t * 0.5 + i * 0.5) % 1)); fade(d, 1 - wipe); });
      const hp = new THREE.Vector3(); w.head.getWorldPosition(hp); hand.position.set(hp.x + 0.25 - 0.4 * wipe, hp.y + 0.05 - 0.05 * wipe, hp.z + 0.2); hand.material.opacity = win(t, T0 + 0.8, T0 + 3.8, 0.4, 0.5);
      w.pose({ hp: 0.05 * (1 - wipe) }); w.face(0, wipe > 0.5 ? 'happy' : 'sad', t);
      words.forEach((g, i) => { const a = T0 + 3.8 + i * 1.0; fade(g, win(t, a, C.geste, 0.3, 0.4)); const s = sstep(a + 0.4, a + 0.9, t); g.userData.bar.scale.x = Math.max(0.001, s); g.userData.bar.position.x = -0.28 + 0.28 * s; });
      ppl.forEach((h, i) => { h.place(-1.6 + i * 0.8, 0, -0.5 - (i % 2) * 0.6, 0); h.pose({}); h.face(0, 'happy', t); fade(h.root, sstep(C.geste, C.geste + 1, t)); const hp2 = new THREE.Vector3(); h.head.getWorldPosition(hp2); const u = sstep(C.geste + 2 + i * 0.6, C.geste + 3 + i * 0.6, t); hands[i].position.set(hp2.x + 0.2 - 0.35 * u, hp2.y, hp2.z + 0.2); hands[i].material.opacity = win(t, C.geste + 1.6 + i * 0.6, C.geste + 3.4 + i * 0.6, 0.3, 0.4); });
      fade(w.root, 1 - sstep(C.geste - 0.5, C.geste + 0.5, t));
      sc.position.set(0, 1.5, 2.2); sc.rotation.x = 1.1; fade(sc, win(t, C.isaie + 0.5, SC.trone.start, 0.5, 0.3));
      camKeys(cam, t, [{ t: T0, p: [0.05, 1.75, 4.2], l: [0.03, 1.68, 2.6], f: 40 }, { t: T0 + 3.5, p: [0, 1.5, 5.0], l: [0, 1.35, 2.6], f: 44 }, { t: C.geste, p: [0, 1.6, 5.2], l: [0, 1.3, 0], f: 48 }, { t: C.geste + 1, p: [0, 1.6, 3.6], l: [0, 1.3, -0.6], f: 48 }, { t: C.isaie, p: [0, 1.7, 3.8], l: [0, 1.4, 0.6], f: 48 }, { t: SC.trone.start, p: [0, 1.7, 3.6], l: [0, 1.5, 1.4], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- le trone : toutes choses nouvelles, alpha et omega, la source gratuite
SETS.trone = () => {
  const B = base({ bg: 0x0c0a16, hemi: [0xfff0e0, 0x1a1420, 0.9], sun: [0xfff0d8, 1.0, [2, 6, 6]], shadow: false, bloom: [0.6, 0.5, 0.8], exposure: 1.0, fog: [0x0c0a16, 12, 60] }); const { scene, cam } = B;
  scene.add(L.stars(500, 60, 1.0));
  const floor = new THREE.Mesh(new THREE.CircleGeometry(12, 48), M(0xc8b8e8, { emissive: new THREE.Color(0x1a1830), transparent: true, opacity: 0.9 })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const th = glowStar(10, 0xffffff); th.position.set(0, 3.6, -6); scene.add(th);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.05, 8, 80), G(0x7affb0, 1.2)); ring.position.set(0, 3.6, -6.2); scene.add(ring);
  const A = label('Α', { w: 1.6, h: 1.6, color: '#ffd070', font: 'bold 900px Inter' }); A.position.set(-2.2, 3.2, -4.5); scene.add(A);
  const O = label('Ω', { w: 1.6, h: 1.6, color: '#ffd070', font: 'bold 900px Inter' }); O.position.set(2.2, 3.2, -4.5); scene.add(O);
  const j = john(); j.place(0.9, 0, 1.4, -0.35); scene.add(j.root); faceLight(scene, [0.6, 1.4, 3.4], 1.3);
  const drops = []; for (let i = 0; i < 70; i++) { const d = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 0), G(0x9adfff, 1.8)); scene.add(d); drops.push(d); }
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.6, 0.25, 16), M(0xd8d0e8)); basin.position.set(-0.6, 0.12, 0.2); scene.add(basin);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(0.62, 20), G(0x7ad0ff, 1.2)); pool.rotation.x = -Math.PI / 2; pool.position.set(-0.6, 0.26, 0.2); scene.add(pool);
  const sparks = dust(scene, 60, 0, 2, -3, 4, 0xfff0c0);
  const K = cardsMgr(scene, cam); refCard(K);
  K('« Voici, je fais toutes choses nouvelles »', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, SC.trone.start + 7, C.alpha, 0.3, 0.2), -0.6);
  K('Α = 1re lettre · Ω = dernière lettre de l\'alphabet grec', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.alpha + 0.3, C.source, 0.3, 0.2), -0.6);
  K('« gratuitement » : rien à payer, rien à mériter', { w: 1.6, h: 0.24, border: '#9adfff' }, t => win(t, C.gratuit + 0.3, SC.ombre.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.trone.start; sparks(t);
      th.scale.setScalar(10 + 0.6 * Math.sin(t * 1.3)); ring.rotation.z = t * 0.2;
      const ao = win(t, C.alpha - 4.5, C.source, 0.6, 0.5); fade(A, ao); fade(O, ao);
      const f = sstep(C.source, C.source + 1.5, t); fade(basin, f); fade(pool, f);
      drops.forEach((d, i) => { const u = (t * 0.7 + hash(i)) % 1; const a = hash(i * 3) * Math.PI * 2, r = 0.25 + 0.25 * hash(i * 7); d.position.set(-0.6 + Math.cos(a) * r * u * 1.4, 0.3 + 1.6 * (4 * u * (1 - u)), 0.2 + Math.sin(a) * r * u * 1.4); fade(d, f); });
      j.pose(L.kneelPose({ lean: 0.15, hp: -0.25, aL: [0.3, 0.2], aR: [0.3, 0.2] })); j.face(0, t > C.gratuit ? 'happy' : 'awe', t);
      camKeys(cam, t, [{ t: T0, p: [1.2, 1.2, 4.2], l: [0.6, 1.2, 1.0], f: 46 }, { t: T0 + 6, p: [0.2, 1.6, 6.0], l: [0, 2.6, -5], f: 52 }, { t: C.alpha, p: [0, 1.8, 6.5], l: [0, 2.8, -5], f: 54 }, { t: C.source, p: [0.2, 1.4, 4.6], l: [-0.3, 0.9, 0], f: 48 }, { t: SC.ombre.start, p: [0.4, 1.4, 4.2], l: [-0.2, 0.9, 0.4], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- l'ombre : la liste, l'etang de feu au loin, la seconde mort
SETS.ombre = () => {
  const B = nightSet({ fog: [0x0a0814, 10, 60], exposure: 1.0 }); const { scene, cam } = B;
  const glowL = new THREE.Mesh(new THREE.PlaneGeometry(60, 3), new THREE.MeshBasicMaterial({ color: 0xff6a20, transparent: true, opacity: 0.6, fog: false, depthWrite: false, blending: THREE.AdditiveBlending })); glowL.position.set(0, 0.6, -40); scene.add(glowL);
  const lake = new THREE.Mesh(new THREE.PlaneGeometry(40, 10), G(0xff5a10, 0.9)); lake.rotation.x = -Math.PI / 2; lake.position.set(0, 0.02, -34); scene.add(lake);
  const smoke = clouds(scene, 14, 3, 12, { em: 0x2a1008, op: 0.6 }); smoke.forEach(c => c.position.z -= 30);
  const j = john(); j.place(0.35, 0, 2.4, 0.2); scene.add(j.root); faceLight(scene, [0.4, 1.6, 4.4], 1.2);
  const K = cardsMgr(scene, cam); refCard(K);
  K('les lâches · les meurtriers · les idolâtres · les menteurs…', { w: 1.6, h: 0.24, border: '#ff8a5a' }, t => win(t, SC.ombre.start + 3.0, C.etang, 0.3, 0.2), -0.6);
  K('Apocalypse 20, 14 : l\'étang de feu, c\'est la seconde mort', { w: 1.6, h: 0.24, border: '#ff5a2a' }, t => win(t, C.seconde + 0.3, SC.fin.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.ombre.start; const k = sstep(C.etang, C.etang + 3, t);
      glowL.material.opacity = 0.25 + 0.5 * k + 0.05 * Math.sin(t * 5); fade(lake, 0.3 + 0.7 * k);
      j.pose({ hp: 0.05 }); j.face(0, 'serious', t);
      camKeys(cam, t, [{ t: T0, p: [0.3, 1.6, 5.6], l: [0.3, 1.3, 2.4], f: 48 }, { t: C.etang, p: [-0.3, 1.7, 5.8], l: [0, 1.2, -30], f: 50 }, { t: SC.fin.start, p: [-0.3, 1.8, 5.4], l: [0, 1.2, -30], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- fin : le grand trone blanc, le ciel et la terre s'enfuient, des livres s'ouvrent (prochain episode)
SETS.fin = () => {
  const B = base({ bg: 0x05050c, hemi: [0xe8e8ff, 0x10101a, 0.8], sun: [0xffffff, 1.0, [0, 6, 6]], shadow: false, bloom: [0.6, 0.5, 0.8], exposure: 1.0, fog: [0x05050c, 20, 80] }); const { scene, cam } = B;
  scene.add(L.stars(600, 60, 1.2));
  const ground = L.groundPlane(40, 20, 0x4a4a5a, 0.3, 2); scene.add(ground);
  const th = glowStar(14, 0xffffff); th.position.set(0, 4.5, -14); scene.add(th);
    const j = john(); j.place(0.3, 0, 1.4, 0.2); scene.add(j.root); faceLight(scene, [0.4, 1.6, 3.8], 1.3);
  const ppl = citizens(scene, 6);
  const books = [0, 1, 2].map(i => { const b = openBook(versePage(['', '', '']), versePage(['', '', ''])); b.position.set(-1.6 + i * 1.6, 2.6 + (i % 2) * 0.4, -6); b.rotation.x = 1.2; b.scale.setScalar(2.2); scene.add(b); return b; });
  const K = cardsMgr(scene, cam);
  K('PROCHAIN ÉPISODE · Apocalypse 20, 11-15', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, SC.fin.start + 9.0, TL.duration + 1, 0.4, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.fin.start; const k = sstep(T0 + 2.5, T0 + 6.5, t);
      ground.position.y = -6 * k; fade(ground, 1 - k);
      ppl.forEach((h, i) => { const s = i % 2 ? 1 : -1; h.place(s * (1.4 + Math.floor(i / 2) * 0.9), 0, -2.5 - Math.floor(i / 2) * 1.6, s * -1.2); h.pose({}); h.face(0, 'serious', t); fade(h.root, sstep(T0 + 6, T0 + 7, t)); });
      books.forEach((b, i) => fade(b, sstep(T0 + 8.5 + i * 0.3, T0 + 9.5 + i * 0.3, t)));
      j.pose({ hp: -0.1 }); j.face(0, 'awe', t);
      camKeys(cam, t, [{ t: T0, p: [0.6, 1.7, 4.2], l: [0.2, 1.5, 1.0], f: 48 }, { t: T0 + 3, p: [0.4, 1.9, 5.2], l: [0, 2.0, -10], f: 52 }, { t: TL.duration, p: [0.2, 2.2, 6.2], l: [0, 2.6, -14], f: 54 }]);
      K.update(t);
    }
  };
};

// ---------- couverture : la derniere larme essuyee, dans la lumiere
SETS.cover = () => {
  const B = heavenCity({ exposure: 0.72, bloom: [0.5, 0.5, 0.85] }); const { scene, cam } = B;
  const w = woman(4309); w.place(0, 0, 2.6, 0.3); scene.add(w.root); faceLight(scene, [0.4, 1.8, 4.2], 1.6);
  const d = tear(w, 1); tearAt(d, 0.45); d.scale.setScalar(1.6); d.scale.y = 2.4;
  const hand = glowStar(0.7, 0xfff4d0); scene.add(hand);
  return { ...B, update(t) { B.tick(3); w.pose({ hp: -0.12, hy: 0.15 }); w.face(0, 'sad', 0.5); const hp = new THREE.Vector3(); w.head.getWorldPosition(hp); hand.position.set(hp.x + 0.5, hp.y + 0.1, hp.z + 0.1); cam.position.set(0.15, 1.8, 4.4); cam.fov = 40; cam.updateProjectionMatrix(); cam.lookAt(0.05, 1.62, 2.6); } };
};

const SHOTS = [['intro', 0, SC.mer.start], ['mer', SC.mer.start, SC.tente.start], ['ville', SC.tente.start, C.desert], ['tente', C.desert, SC.larmes.start], ['larmes', SC.larmes.start, SC.trone.start], ['trone', SC.trone.start, SC.ombre.start], ['ombre', SC.ombre.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
