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

const REF = 'Apocalypse 20, 7-10 · traduction Louis Segond';
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
const refCard = (K) => K(REF, { w: 1.6, h: 0.12, border: '#807060', color: '#e8e0d4' }, t => t > SC.prison.start + 0.3 && t < SC.fin.start ? 0.85 : 0, -0.88, 0.75);


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
// ---------- intro : la grille de la prison s'ouvre
SETS.intro = () => {
  const B = nightSet({ fog: [0x0a0814, 10, 60], exposure: 1.0 }); const { scene, cam } = B;
  const pit = pitSet(scene, [0, 0, -4]);
  const sp = devil(); sp.position.set(0, -2.6, -4); scene.add(sp); faceLight(scene, [0, 2.2, -2.2], 2.4, 0xffe8d8);
  const rig = claudeRig(scene, [1.1, -0.2, 1.4], -0.5, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28); faceLight(scene, [0.9, 0.6, 2.8], 1.0);
  scene.add(at(new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.15, 10), M(0x2a2430)), 1.0, -0.28, 1.4));
  const back = label('◀ une scène avant', { w: 0.8, h: 0.12, color: '#ffd070', font: 'bold 80px Inter' }); rig.holoG.add(back);
  const K = cardsMgr(scene, cam);
  K('1 000 ans de prison… puis la porte s\'ouvre', { w: 1.6, h: 0.24, border: '#ff8a5a' }, t => win(t, 1.5, C.serie, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const o = sstep(3, 6, t); pit.userData.lid.rotation.z = -1.4 * o; pit.userData.lid.position.x = -1.6 * o; pit.userData.red.material.opacity = 0.3 + 0.7 * o;
      sp.position.y = -2.6 + 2.6 * sstep(4.5, 8.5, t); sp.userData.tick(t); sp.userData.h.pose({ aL: [0.5, 0.5], aR: [0.5, 0.5], hp: -0.1 }); sp.userData.h.face(0, 'serious', t); fade(sp, sstep(4.5, 5.5, t) * (1 - 0.8 * win(t, C.serie, C.title + 1, 0.5, 0.5))); pit.userData.red.material.opacity *= 1 - 0.6 * win(t, C.serie, C.title + 1, 0.5, 0.5);
      const bk = win(t, C.serie + 0.3, C.title, 0.3, 0.3); beamOn(rig, bk, t); fade(back, bk); back.lookAt(cam.position); rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: 0, p: [0, 3.0, 3.5], l: [0, 0, -4], f: 50 }, { t: C.serie, p: [0, 2.2, 4.6], l: [0, 1.6, -4], f: 50 }, { t: C.serie + 0.8, p: [0.9, 0.5, 4.2], l: [0.6, 0.1, 0], f: 48 }, { t: SC.prison.start, p: [0.8, 0.5, 4.0], l: [0.6, 0.1, 0], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- les mille ans ; Augustin ; pourquoi le relacher
SETS.prison = () => {
  const B = nightSet({ fog: [0x0a0814, 10, 60], exposure: 1.0 }); const { scene, cam } = B;
  const pit = pitSet(scene, [0, 0, -3.5]); pit.userData.lid.rotation.z = -1.4; pit.userData.lid.position.x = -1.6; pit.userData.red.scale.setScalar(3);
  const sp = devil(); sp.position.set(0, 0, -3.5); scene.add(sp); const dl = faceLight(scene, [0, 2.2, -1.7], 2.4, 0xffe8d8);
  const j = john(); j.place(1.4, 0, 0.8, -0.5); scene.add(j.root); faceLight(scene, [1.0, 1.6, 3.4], 1.2);
  const mil = label('1 000', { w: 2.2, h: 0.8, color: '#ffd070', font: 'bold 400px Inter' }); mil.position.set(-0.8, 3.2, -4); scene.add(mil);
  const tl = new THREE.Group(); tl.position.set(-0.4, 3.0, -2.0); scene.add(tl);
  tl.add(box(2.6, 0.04, 0.04, G(0xffd070, 1.4)));
  [['Jésus', -1.3], ['la fin', 1.3]].forEach(([s, x]) => { tl.add(at(box(0.04, 0.3, 0.04, G(0xffd070, 1.4)), x, 0, 0)); const l = label(s, { w: 0.8, h: 0.18, color: '#ffffff', font: 'bold 100px Inter' }); l.position.set(x, 0.3, 0); tl.add(l); });
  const lc = label('le temps de l\'Église', { w: 1.6, h: 0.18, color: '#9adfff', font: 'bold 90px Inter' }); lc.position.set(0, -0.25, 0); tl.add(lc);
  const K = cardsMgr(scene, cam); refCard(K);
  K('lecture littérale : un règne de 1 000 ans encore à venir', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.millenaire + 2.5, C.augustin, 0.3, 0.2), -0.6);
  K('saint Augustin (Ve siècle) : un symbole', { w: 1.6, h: 0.24, border: '#9adfff' }, t => win(t, C.augustin + 0.3, C.pourquoi, 0.3, 0.2), -0.6);
  K('Apocalypse 20, 3 : « relâché pour un peu de temps »', { w: 1.6, h: 0.24, border: '#ff8a5a' }, t => win(t, C.pourquoi + 3, SC.gog.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.prison.start; sp.userData.tick(t); sp.userData.h.pose({ aL: [0.3, 0.35], aR: [0.3, 0.35], hp: 0.05 }); dl.position.x = sp.position.x; sp.userData.h.face(0, 'serious', t); sp.position.x = 1.3 * win(t, C.millenaire, C.pourquoi + 1, 1, 1) + 0.8 * sstep(C.pourquoi, SC.gog.start, t);
      fade(mil, win(t, C.millenaire, C.augustin, 0.5, 0.5)); fade(tl, win(t, C.augustin + 0.5, C.pourquoi, 0.5, 0.5));
      j.pose({ hp: 0.05 }); j.face(0, t > C.pourquoi ? 'awe' : 'fear', t);
      camKeys(cam, t, [{ t: T0, p: [0.8, 2.2, 4.2], l: [0, 1.8, -3.5], f: 50 }, { t: C.millenaire, p: [0, 2.6, 5.5], l: [-0.4, 2.8, -3.5], f: 52 }, { t: C.pourquoi - 0.3, p: [0, 2.6, 5.5], l: [-0.4, 2.8, -3.5], f: 52 }, { t: C.pourquoi + 1.5, p: [1.6, 1.6, 3.6], l: [1.2, 1.5, 0.6], f: 48 }, { t: SC.gog.start, p: [1.8, 1.8, 4.2], l: [0.6, 2.0, -2], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- Gog et Magog, le sable de la mer, Ezechiel, les legendes
SETS.gog = () => {
  const B = base({ sky: [0x1a1020, 0x8a4a3a], hemi: [0xffd8c0, 0x2a1a20, 0.8], sun: [0xffb080, 1.0, [4, 5, 8]], shadow: false, bloom: [0.5, 0.5, 0.85], exposure: 1.0, fog: [0x5a3a3a, 15, 70] }); const { scene, cam } = B;
  scene.add(L.groundPlane(120, 40, 0x8a7458, 0.3, 4));
  const earth = globe(1.4); earth.position.set(0, 3.2, -4); scene.add(earth);
  const corners = [0, 1, 2, 3].map(i => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), G(0xff5a3a, 2)); earth.add(s); const a = i * Math.PI / 2 + 0.6; s.position.set(Math.cos(a) * 1.42, (i % 2 ? 0.4 : -0.4), Math.sin(a) * 1.42); return s; });
  const host = army(scene, 260, 3, 26, 0, -14, 0x3a2a30);
  const sc = scroll(0.9); sc.position.set(0, 2.0, -0.4); sc.rotation.x = 1.1; scene.add(sc);
  const wall = new THREE.Group(); wall.position.set(0, 0, -8); scene.add(wall);
  for (let k = -6; k <= 6; k++) wall.add(at(box(0.9, 3.2, 0.4, holoMat(0x9aa8c8, 0.4)), k * 0.95, 1.6, 0));
  const giants = [0, 1].map(i => { const h = new Human({ skin: 0xe0b890, hair: [0x5a3a20, 0x1a1210][i], hairStyle: 'curly', beard: 'full', top: [0x2a6a3a, 0x8a2a2a][i], bottom: 0xc8a050, robe: [0x2a6a3a, 0x8a2a2a][i], robeL: 0.7, belt: 0xd8b060, seed: 4500 + i }); h.root.scale.setScalar(2.4); h.place(i ? 1.5 : -1.5, 0, -3, i ? -0.3 : 0.3); scene.add(h.root); return h; });
  const lGog = card('GOG', { w: 1.3, h: 0.34, border: '#ffd070' }), lMag = card('MAGOG', { w: 1.3, h: 0.34, border: '#ffd070' }); scene.add(lGog); scene.add(lMag);
  const K = cardsMgr(scene, cam); refCard(K);
  K('« aux quatre coins de la terre »', { w: 1.6, h: 0.24, border: '#ff5a3a' }, t => win(t, SC.gog.start + 1.5, SC.gog.start + 7, 0.3, 0.2), -0.6);
  K('Genèse 22, 17 : la descendance d\'Abraham, « comme le sable »', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.sable + 0.3, C.ezechiel, 0.3, 0.2), -0.6);
  K('Ézéchiel 38-39 : Gog, prince du pays de Magog', { w: 1.6, h: 0.24, border: '#9adfff' }, t => win(t, C.ezechiel + 0.3, C.legende, 0.3, 0.2), -0.6);
  K('légende : le mur de fer d\'Alexandre le Grand', { w: 1.6, h: 0.24, border: '#9aa8c8' }, t => win(t, C.legende + 0.3, C.legende + 6, 0.3, 0.2), -0.6);
  K('Londres : les géants Gog et Magog du Guildhall', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.legende + 6.2, SC.camp.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.gog.start; earth.rotation.y = t * 0.2; fade(earth, win(t, T0, C.sable - 1, 0.3, 0.6)); corners.forEach((c, i) => fade(c, sstep(T0 + 2 + i * 0.4, T0 + 2.5 + i * 0.4, t)));
      host.forEach((g, i) => fade(g, sstep(T0 + 8 + hash(i) * 6, T0 + 9 + hash(i) * 6, t) * (1 - sstep(C.legende - 0.5, C.legende, t))));
      fade(sc, win(t, C.ezechiel, C.legende, 0.4, 0.4));
      fade(wall, win(t, C.legende + 0.3, C.legende + 6, 0.5, 0.5));
      giants.forEach((h, i) => { h.pose({ aR: [0.3, 0.2], aL: [0.3, 0.2] }); h.face(0, 'neutral', t); fade(h.root, sstep(C.legende + 6, C.legende + 7, t)); });
      [lGog, lMag].forEach((l, i) => { l.position.set(i ? 1.5 : -1.5, 4.8, -3); l.quaternion.copy(cam.quaternion); fade(l, sstep(C.legende + 6.5, C.legende + 7.5, t)); });
      camKeys(cam, t, [{ t: T0, p: [0, 3.2, 1.2], l: [0, 3.2, -4], f: 50 }, { t: C.sable - 1, p: [0, 3.0, 1.6], l: [0, 2.6, -4], f: 50 }, { t: C.sable, p: [0, 3.4, 5], l: [0, 0.5, -16], f: 52 }, { t: C.ezechiel, p: [0, 2.4, 1.4], l: [0, 1.8, -0.4], f: 46 }, { t: C.legende, p: [0, 2.0, 4], l: [0, 1.8, -8], f: 50 }, { t: C.legende + 6, p: [0, 2.2, 5.5], l: [0, 2.6, -3], f: 52 }, { t: SC.camp.start, p: [0, 2.0, 5.0], l: [0, 2.6, -3], f: 52 }]);
      K.update(t);
    }
  };
};

// ---------- le camp des saints encercle ; le feu du ciel
SETS.camp = () => {
  const B = base({ sky: [0x1a1020, 0x8a4a3a], hemi: [0xffd8c0, 0x2a1a20, 0.8], sun: [0xffb080, 1.0, [4, 8, 8]], shadow: false, bloom: [0.55, 0.5, 0.82], exposure: 1.0, fog: [0x5a3a3a, 25, 90] }); const { scene, cam } = B;
  scene.add(L.groundPlane(160, 40, 0x8a7458, 0.3, 4));
  const city = new THREE.Group(); scene.add(city); const stone = M(0xd8c8a0);
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; const w = box(1.4, 1.0, 0.3, stone); w.position.set(Math.cos(a) * 3.5, 0.5, Math.sin(a) * 3.5); w.rotation.y = -a + Math.PI / 2; city.add(w); }
  for (let i = 0; i < 18; i++) { const h = 0.5 + hash(i) * 0.8; city.add(at(box(0.6, h, 0.6, M(0xe8dcc0)), (hash(i * 3) - 0.5) * 4.6, h / 2, (hash(i * 5) - 0.5) * 4.6)); }
  city.add(at(box(1.2, 1.6, 1.2, M(0xf0e0b0, { emissive: new THREE.Color(0x3a2a10) })), 0, 0.8, 0));
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; city.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.6, 4), M(0xf4eee0)), Math.cos(a) * 5, 0.3, Math.sin(a) * 5)); }
  const host = army(scene, 420, 7, 30, 0, 0);
  const fires = []; for (let i = 0; i < 9; i++) { const f = glowStar(6, 0xffa040); scene.add(f); fires.push(f); }
  const K = cardsMgr(scene, cam); refCard(K);
  K('le camp des saints · la ville bien-aimée (Jérusalem)', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.campsaints + 0.3, C.phrase, 0.3, 0.2), -0.6);
  K('pas de bataille : une seule phrase', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, C.phrase + 0.3, C.elie, 0.3, 0.2), -0.6);
  K('Genèse 19 : Sodome · 2 Rois 1 : le feu d\'Élie', { w: 1.6, h: 0.24, border: '#ffa040' }, t => win(t, C.elie + 0.3, SC.diable.start, 0.3, 0.2), -0.6);
  const fireT = () => C.campsaints - 4.5;
  return {
    ...B, update(t) {
      const T0 = SC.camp.start; const close = sstep(T0, fireT(), t);
      host.forEach((g, i) => { const r = g.userData.r - (g.userData.r - 6 - hash(i) * 1.5) * close * 0.8; g.position.set(Math.cos(g.userData.a) * r, 0, Math.sin(g.userData.a) * r); g.rotation.y = -g.userData.a - Math.PI / 2; fade(g, 1 - sstep(fireT() + 1 + hash(i), fireT() + 2.5 + hash(i), t)); });
      fires.forEach((f, i) => { const a = i / 9 * Math.PI * 2; const u = sstep(fireT() + i * 0.15, fireT() + 1.2 + i * 0.15, t); f.position.set(Math.cos(a) * 8, 18 - 17 * u, Math.sin(a) * 8); f.material.opacity = win(t, fireT() + i * 0.15, fireT() + 4.5, 0.3, 1.5); });
      camKeys(cam, t, [{ t: T0, p: [0, 14, 22], l: [0, 0, 0], f: 50 }, { t: fireT(), p: [6, 9, 16], l: [0, 0.5, 0], f: 50 }, { t: C.campsaints, p: [3, 4, 9], l: [0, 1, 0], f: 50 }, { t: C.phrase, p: [0, 12, 18], l: [0, 0, 0], f: 50 }, { t: SC.diable.start, p: [-6, 8, 14], l: [0, 0.5, 0], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- le diable jete dans l'etang, ou sont la bete et le faux prophete ; le seducteur depuis Eden
SETS.diable = () => {
  const B = nightSet({ fog: [0x0a0814, 10, 60], exposure: 1.0 }); const { scene, cam } = B;
  const glowL = new THREE.Mesh(new THREE.PlaneGeometry(60, 3), new THREE.MeshBasicMaterial({ color: 0xff6a20, transparent: true, opacity: 0.6, fog: false, depthWrite: false, blending: THREE.AdditiveBlending })); glowL.position.set(0, 0.6, -30); scene.add(glowL);
  const lake = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), G(0xff5a10, 0.9)); lake.rotation.x = -Math.PI / 2; lake.position.set(0, 0.02, -24); scene.add(lake);
  const sp = devil(); scene.add(sp); const dl = faceLight(scene, [0, 2, 0], 3.0, 0xffe8d8); const tag = card('LE DIABLE', { w: 1.0, h: 0.2, border: '#ff4a3a' }); scene.add(tag);
  const beast = orb('LA BÊTE', 0x5a2a2a), prophet = orb('LE FAUX PROPHÈTE', 0x3a2a5a); beast.position.set(-1.6, 2.4, -6); prophet.position.set(1.6, 2.4, -6); scene.add(beast); scene.add(prophet);
  const tree = new THREE.Group(); tree.position.set(-0.6, 0, 0); scene.add(tree); tree.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 1.6, 8), holoMat(0x7aff9a, 0.25)), 0, 0.8, 0)); tree.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 1), holoMat(0x7aff9a, 0.15)), 0, 2.0, 0));
  const eve = new Human({ holo: 0x9adfff, hairStyle: 'long', seed: 4510 }); eve.place(0.4, 0, 0.3, -0.4); scene.add(eve.root);
  const sp2 = serpent(0x7aff9a, 7); sp2.scale.setScalar(0.4); sp2.position.set(-0.6, 0.9, 0.1); scene.add(sp2);
  const K = cardsMgr(scene, cam); refCard(K);
  K('Genèse 3 : le serpent trompe Ève', { w: 1.6, h: 0.24, border: '#7aff9a' }, t => win(t, C.seducteur + 2.5, C.bete, 0.3, 0.2), -0.6);
  K('la bête et le faux prophète : Apocalypse 19, 20', { w: 1.6, h: 0.24, border: '#ff8a5a' }, t => win(t, C.bete + 0.3, SC.fin.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.diable.start; const u = sstep(T0 + 2, T0 + 6.5, t);
      sp.position.set(0.5 - 0.5 * u, 1.0 + 2.5 * Math.sin(Math.PI * u) - 1.0 * u, -2 - 20 * u); sp.userData.tick(t * 2, 1.5); sp.userData.h.pose({ aL: [2.4, 0.4], aR: [2.4, 0.4], lean: -0.3 }); sp.userData.h.face(0, 'fear', t); dl.position.set(sp.position.x, sp.position.y + 1.5, sp.position.z + 1.6); fade(sp, 1 - sstep(0.92, 1, u)); sp.scale.setScalar(0.8);
      tag.position.copy(sp.position).add(new THREE.Vector3(0, 2.3, 0)); tag.quaternion.copy(cam.quaternion); fade(tag, 1 - sstep(0.6, 0.9, u));
      glowL.material.opacity = 0.4 + 0.3 * win(t, T0 + 6.3, T0 + 9, 0.3, 2) + 0.05 * Math.sin(t * 5);
      const ed = win(t, C.seducteur + 1, C.bete, 0.5, 0.5); fade(tree, ed); fade(eve.root, ed * 0.5); fade(sp2, ed); sp2.userData.tick(t, 0.5); eve.pose({ aR: [1.0, 0.1], eR: 0.4 });
      const bp = win(t, C.bete, SC.fin.start + 0.5, 0.6, 0.3); fade(beast, bp); fade(prophet, bp); beast.children[0].rotation.y = t; prophet.children[0].rotation.y = -t;
      camKeys(cam, t, [{ t: T0, p: [0.0, 2.0, 5.5], l: [0, 1.6, -4], f: 52 }, { t: T0 + 6.5, p: [0.2, 1.8, 6.2], l: [0, 1.0, -22], f: 52 }, { t: C.seducteur + 1, p: [0, 1.9, 6.5], l: [-0.1, 1.3, 0], f: 50 }, { t: C.bete, p: [0, 2.2, 3.5], l: [0, 2.2, -6], f: 52 }, { t: SC.fin.start, p: [0, 2.2, 3.0], l: [0, 2.2, -6], f: 52 }]);
      K.update(t);
    }
  };
};

// ---------- fin : un ange descend avec la cle de l'abime et une chaine (prochain episode)
SETS.fin = () => {
  const B = nightSet({ fog: [0x0a0814, 10, 60], exposure: 1.0 }); const { scene, cam } = B;
  const pit = pitSet(scene, [0, 0, -3.5]); pit.userData.lid.rotation.z = -1.4; pit.userData.lid.position.x = -1.6;
  const an = angel(); scene.add(an.root); angelLight(scene, [0.4, 3, 0]); const al = glowStar(4, 0xfff4d0); scene.add(al);
  const key = new THREE.Group(); key.add(box(0.04, 0.3, 0.04, G(0xffd070, 1.6))); key.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 6, 16), G(0xffd070, 1.6)), 0, 0.2, 0)); an.hand.R.add(key); key.position.set(0, -0.2, 0.05);
  const chain = new THREE.Group(); for (let k = 0; k < 14; k++) { const l = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.015, 5, 10), G(0xd8d0c8, 1.2)); l.position.y = -k * 0.08; l.rotation.y = k % 2 ? Math.PI / 2 : 0; chain.add(l); } an.hand.L.add(chain); chain.position.set(0, -0.1, 0.05);
  const thrones = new THREE.Group(); thrones.position.set(0, 3.2, -8); scene.add(thrones); for (let k = -2; k <= 2; k++) { const th = whiteThrone(0.25); th.userData.glow.scale.setScalar(2); th.position.set(k * 1.3, Math.abs(k) * -0.2, 0); thrones.add(th); }
  const K = cardsMgr(scene, cam);
  K('PROCHAIN ÉPISODE · Apocalypse 20, 1-6', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, SC.fin.start + 8.5, TL.duration + 1, 0.4, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.fin.start; const d = sstep(T0 + 1.5, T0 + 6, t);
      an.place(0.6, 6 - 6 * d, -1.5, -0.2); an.pose({ aR: [0.9, 0.2], eR: 0.3, aL: [0.4, 0.2] }); an.face(0, 'serious', t);
      const hp = new THREE.Vector3(); an.head.getWorldPosition(hp); al.position.set(hp.x, hp.y - 0.3, hp.z - 0.4);
      fade(thrones, sstep(T0 + 8, T0 + 10, t));
      camKeys(cam, t, [{ t: T0, p: [0.4, 2.0, 5.0], l: [0.4, 3.0, -2], f: 52 }, { t: T0 + 6, p: [0.4, 1.7, 3.6], l: [0.5, 1.3, -1.5], f: 48 }, { t: TL.duration, p: [0.2, 2.4, 6.0], l: [0, 2.2, -6], f: 52 }]);
      K.update(t);
    }
  };
};

// ---------- couverture : la grille arrachee, la lueur rouge, le serpent qui sort
SETS.cover = () => {
  const B = nightSet({ fog: [0x0a0814, 10, 60], exposure: 1.0, bloom: [0.6, 0.5, 0.82], hemi: [0xffd0c0, 0x10101a, 0.8], sun: [0xffc0a0, 1.0, [1, 4, 6]] }); const { scene, cam } = B;
  scene.add(at(box(8, 5, 0.2, M(0x2a1010, { emissive: new THREE.Color(0x1a0404) })), 0, 2, -2.6));
  const red = glowStar(4, 0xff6a3a); red.position.set(0, 1.2, -2.3); scene.add(red);
  const d = devil({ wing: 1.6 }); d.position.set(0, 0, -0.8); scene.add(d); const h = d.userData.h;
  d.userData.wings.forEach((w, i) => { w.rotation.y = (i ? -1 : 1) * 0.25; });
  h.pose({ lean: 0.15, hp: -0.1, aL: [1.3, 0.55], eL: 0.3, aR: [1.3, 0.55], eR: 0.3 }); h.face(0, 'serious', 0);
  const iron = M(0x5a5460, { emissive: new THREE.Color(0x100c10) });
  scene.add(at(box(3.2, 0.08, 0.08, iron), 0, 2.45, -0.25)); scene.add(at(box(3.2, 0.08, 0.08, iron), 0, 0.05, -0.25));
  [-1.4, -1.0, 1.0, 1.4].forEach(x => scene.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.4, 8), iron), x, 1.25, -0.25)));
  for (const sx of [-1, 1]) { const lo = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.25, 8), iron); lo.position.set(sx * 0.45, 0.65, -0.25); lo.rotation.z = sx * 0.3; scene.add(lo); const hi = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.25, 8), iron); hi.position.set(sx * 0.45, 1.85, -0.25); hi.rotation.z = -sx * 0.3; scene.add(hi); }
  faceLight(scene, [0, 2.1, 0.8], 2.4, 0xffe8d8);
  return { ...B, update() { cam.position.set(0.1, 1.9, 4.3); cam.fov = 54; cam.updateProjectionMatrix(); cam.lookAt(0, 0.95, -0.6); } };
};

const SHOTS = [['intro', 0, SC.prison.start], ['prison', SC.prison.start, SC.gog.start], ['gog', SC.gog.start, SC.camp.start], ['camp', SC.camp.start, SC.diable.start], ['diable', SC.diable.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
