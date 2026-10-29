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

const REF = 'Apocalypse 21, 9-27 · traduction Louis Segond';
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
const refCard = (K) => K(REF, { w: 1.6, h: 0.12, border: '#807060', color: '#e8e0d4' }, t => t > SC.montagne.start + 0.3 && t < SC.fin.start ? 0.85 : 0, -0.88, 0.75);


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
function angelBowl(an, color = 0xc83a2a) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), G(color, 1.3)); an.hand.L.add(b); b.position.set(0, -0.08, 0.06); return b; }

// ---------- intro : la ville-cube flotte dans la nuit
SETS.intro = () => {
  const B = base({ bg: 0x07060e, hemi: [0xd8d0ff, 0x10101a, 0.8], sun: [0xfff0d8, 0.9, [3, 6, 5]], shadow: false, bloom: [0.6, 0.5, 0.8], exposure: 1.0, fog: [0x07060e, 20, 70] }); const { scene, cam } = B;
  scene.add(L.stars(700, 60, 1.2));
  const city = makeCity(4); city.position.set(0, -1.2, -6); scene.add(city);
  const glow = glowStar(9, 0xffe8a0); glow.position.set(0, 1.3, -6.5); scene.add(glow);
  const rig = claudeRig(scene, [1.1, -0.2, 1.4], -0.5, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28); faceLight(scene, [0.9, 0.6, 2.8], 1.0);
  scene.add(at(new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.15, 10), M(0x2a2430)), 1.0, -0.28, 1.4));
  const back = label('◀ une scène avant', { w: 0.8, h: 0.12, color: '#ffd070', font: 'bold 80px Inter' }); rig.holoG.add(back);
  const K = cardsMgr(scene, cam);
  K('≈ 2 200 km de côté… et autant de haut', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, 2.5, C.serie, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      city.rotation.y = 0.15 * t; city.position.y = -1.2 + 0.1 * Math.sin(t * 0.6);
      const bk = win(t, C.serie + 0.3, C.title, 0.3, 0.3); beamOn(rig, bk, t); fade(back, bk); back.lookAt(cam.position); rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: 0, p: [0, 1.0, 6.0], l: [0, 0.6, -6], f: 50 }, { t: C.serie, p: [0, 0.6, 4.6], l: [0, 0.6, -6], f: 50 }, { t: C.serie + 0.8, p: [0.9, 0.5, 4.2], l: [0.6, 0.1, 0], f: 48 }, { t: SC.montagne.start, p: [0.8, 0.5, 4.0], l: [0.6, 0.1, 0], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- l'ange des coupes ; la montagne ; la ville descend du ciel ; l'epouse ; Babel
SETS.montagne = () => {
  const B = mountainSet(); const { scene, cam } = B;
  const j = john(); j.place(-0.5, 0, 0.6, 0.6); scene.add(j.root);
  const an = angel(); an.place(0.6, 0, 0.3, -0.6); scene.add(an.root); angelLight(scene, [0.6, 2.2, 1.2]); faceLight(scene, [0, 1.6, 3.2], 1.2);
  const bowl = angelBowl(an);
  const city = makeCity(6); scene.add(city); const cglow = glowStar(16, 0xffe8a0); scene.add(cglow);
  const babel = new THREE.Group(); scene.add(babel); for (let k = 0; k < 6; k++) babel.add(at(new THREE.Mesh(new THREE.CylinderGeometry(1.2 - k * 0.17, 1.3 - k * 0.17, 0.7, 10), holoMat(0xff8a5a, 0.35)), 0, k * 0.7 + 0.35, 0)); babel.position.set(-7, -3, -16);
  const K = cardsMgr(scene, cam); refCard(K);
  K('un des 7 anges des 7 derniers fléaux', { w: 1.6, h: 0.24, border: '#c83a2a' }, t => win(t, SC.montagne.start + 1.5, C.descend - 2.0, 0.3, 0.2), -0.6);
  K('l\'épouse = la ville = le peuple de Dieu réuni', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.epouse + 0.3, C.epouse + 5.5, 0.3, 0.2), -0.6);
  K('Babel monte vers le ciel · la ville en descend', { w: 1.6, h: 0.24, border: '#ff8a5a' }, t => win(t, C.epouse + 5.7, SC.portes.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.montagne.start;
      fade(bowl, 1 - sstep(C.descend - 3, C.descend - 1, t));
      an.pose({ aL: [0.9, 0.2], eL: 0.8, aR: [t > C.descend ? 1.6 : 0.3, 0.2], eR: 0.1 }); an.face(env('ange', t), 'serious', t);
      j.pose({ hp: t > C.descend + 2 ? -0.25 : 0, hy: t > C.descend + 2 ? 0.3 : 0 }); j.face(0, t > C.descend ? 'awe' : 'neutral', t);
      const d = sstep(C.descend + 1.0, C.epouse, t); city.position.set(0, lerp(26, 0.5, d) - 0, -22); cglow.position.set(0, city.position.y + 4, -22.5); cglow.material.opacity = 0.9 * d + 0.1;
      fade(babel, win(t, C.epouse + 5.7, SC.portes.start, 0.5, 0.3)); babel.position.y = -3 + 2 * sstep(C.epouse + 5.7, C.epouse + 9, t);
      camKeys(cam, t, [{ t: T0, p: [0.1, 1.5, 3.4], l: [0.2, 1.3, 0.3], f: 46 }, { t: C.descend, p: [0.1, 1.5, 3.4], l: [0.2, 1.3, 0.3], f: 46 }, { t: C.descend + 1.5, p: [0.0, 1.3, 4.6], l: [0, 4.0, -22], f: 52 }, { t: C.epouse, p: [0.2, 1.4, 4.4], l: [0, 2.5, -22], f: 52 }, { t: SC.portes.start, p: [-0.8, 1.6, 4.6], l: [-2, 2.0, -18], f: 52 }]);
      K.update(t);
    }
  };
};

// ---------- les 12 portes, les anges, les noms des tribus et des apotres
SETS.portes = () => {
  const B = base({ sky: [0xf4ecff, 0xffe8c8], hemi: [0xffffff, 0xc8b890, 0.9], sun: [0xfff8e8, 1.0, [3, 8, 8]], shadowSize: 8, bloom: [0.45, 0.5, 0.88], exposure: 0.9, fog: [0xfff0e0, 20, 90], target: [0, 1, 0] }); const { scene, cam } = B;
  scene.add(L.groundPlane(80, 30, 0xd8c8a8, 0.1, 3));
  const wallMat = M(0x7ac8a0, { emissive: new THREE.Color(0x1a4a30) });
  const wall = new THREE.Group(); scene.add(wall);
  STONES.forEach(([, c], i) => wall.add(at(box(14, 0.12, 0.7, M(c, { emissive: new THREE.Color(c).multiplyScalar(0.25) })), 0, 0.06 + i * 0.12, -1.6)));
  const top = 12 * 0.12; wall.add(at(box(14, 3.2, 0.6, wallMat), 0, top + 1.6, -1.6));
  const tribes = ['RUBEN', 'JUDA', 'LÉVI'], apos = ['PIERRE', 'JEAN', 'JACQUES'];
  const gl = [], al = [], angels = [];
  [-3.2, 0, 3.2].forEach((x, i) => {
    wall.add(at(new THREE.Mesh(new THREE.CircleGeometry(1.05, 32), pearlMat()), x, top + 1.25, -1.28));
    const tl = label(tribes[i], { w: 1.1, h: 0.2, color: '#1a3a5a', font: 'bold 110px Inter' }); tl.position.set(x, top + 2.65, -1.28); wall.add(tl); gl.push(tl);
    const ap = label(apos[i], { w: 1.1, h: 0.2, color: '#ffffff', font: 'bold 110px Inter' }); ap.position.set(x, 0.72, -1.24); wall.add(ap); al.push(ap);
    const an = angel(); an.place(x + 1.2, top, -0.95, 0); an.root.scale.setScalar(0.85); scene.add(an.root); angels.push(an);
  });
  scene.add(at(box(14, 0.02, 1.0, M(0xd8c8a8)), 0, top - 0.01, -1.0));
  angelLight(scene, [0, 3, 1.5]);
  const K = cardsMgr(scene, cam); refCard(K);
  K('3 portes × 4 côtés = 12 portes', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, C.tribus + 0.3, C.tribus + 5.5, 0.3, 0.2), -0.6);
  K('en haut : les 12 tribus d\'Israël · Ancien Testament', { w: 1.6, h: 0.24, border: '#5a9ad8' }, t => win(t, C.tribus + 5.7, C.tribus + 11.5, 0.3, 0.2), -0.6);
  K('en bas : les 12 apôtres · Nouveau Testament', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.tribus + 11.7, SC.mesure.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.portes.start;
      angels.forEach((a, i) => { a.pose({ aR: [0.3 + 0.1 * Math.sin(t + i), 0.2] }); a.face(0, 'neutral', t); });
      gl.forEach((l, i) => fade(l, sstep(T0 + 7 + i * 0.4, T0 + 8 + i * 0.4, t))); al.forEach((l, i) => fade(l, sstep(T0 + 13 + i * 0.4, T0 + 14 + i * 0.4, t)));
      camKeys(cam, t, [{ t: T0, p: [0, 2.0, 7.5], l: [0, 2.0, -1.6], f: 50 }, { t: C.tribus, p: [0, 1.8, 6.5], l: [0, 1.8, -1.6], f: 50 }, { t: C.tribus + 5.5, p: [0, 3.2, 4.5], l: [0, 3.6, -1.6], f: 48 }, { t: C.tribus + 11.5, p: [0, 0.8, 4.2], l: [0, 0.7, -1.6], f: 48 }, { t: SC.mesure.start, p: [0, 1.0, 5.0], l: [0, 1.0, -1.6], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- le roseau d'or : 12 000 stades, un cube ; le lieu tres saint
SETS.mesure = () => {
  const B = base({ bg: 0x0c0a16, hemi: [0xd8d0ff, 0x1a1420, 0.9], sun: [0xfff0d8, 1.0, [3, 8, 6]], shadow: false, bloom: [0.5, 0.5, 0.85], exposure: 1.0, fog: [0x0c0a16, 20, 80] }); const { scene, cam } = B;
  scene.add(L.stars(500, 60, 1.0));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), M(0x2a2438)); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const city = makeCity(3); city.position.set(0, 0, -2); scene.add(city);
  const an = angel(); an.place(2.6, 0, 0.4, -0.7); scene.add(an.root); angelLight(scene, [2.6, 2.4, 1.6]);
  const reed = box(0.03, 2.2, 0.03, G(0xffd070, 1.6)); an.hand.R.add(reed); reed.position.set(0, -0.3, 0.05);
  // regle qui parcourt les aretes
  const rule = box(0.04, 0.04, 0.04, G(0xffd070, 2)); scene.add(rule);
  const lW = label('12 000 stades', { w: 1.0, h: 0.16, color: '#ffd070', font: 'bold 100px Inter' }); lW.position.set(0, 0.2, -0.1); scene.add(lW);
  const lH = label('12 000 stades', { w: 1.0, h: 0.16, color: '#ffd070', font: 'bold 100px Inter' }); lH.position.set(-2.0, 2.0, -0.5); lH.rotation.z = Math.PI / 2; scene.add(lH);
  // lieu tres saint : petit cube, l'arche
  const holy = new THREE.Group(); holy.position.set(0, 0, 1.4); scene.add(holy);
  const hc = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), holoMat(0x9adfff, 0.25)); hc.position.y = 0.5; holy.add(hc); holy.add(new THREE.LineSegments(new THREE.EdgesGeometry(hc.geometry), new THREE.LineBasicMaterial({ color: 0x9adfff }))).position.y = 0.5;
  const ark = box(0.36, 0.2, 0.22, M(0xe8c060, { emissive: new THREE.Color(0x4a3008) })); ark.position.y = 0.12; holy.add(ark);
  const K = cardsMgr(scene, cam); refCard(K);
  K('12 000 stades ≈ 2 200 km', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.stades + 0.3, C.stades + 5.0, 0.3, 0.2), -0.6);
  K('≈ de Paris à Athènes… en long, en large et en haut', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.stades + 5.2, C.cube, 0.3, 0.2), -0.6);
  K('1 Rois 6, 20 : le lieu très saint était un cube', { w: 1.6, h: 0.24, border: '#9adfff' }, t => win(t, C.cube + 2.0, SC.pierres.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.mesure.start;
      an.pose({ aR: [1.1 + 0.25 * Math.sin(t * 0.8), 0.3], eR: 0.2, aL: [0.2, 0.2] }); an.face(0, 'serious', t);
      const u = sstep(T0 + 3, C.stades, t), v = sstep(C.stades, C.stades + 4, t); const S = 3, R = 0.36;
      rule.position.set(-1.5 + 3 * u, R + 0.02, -0.5); if (v > 0) rule.position.set(-1.5, R + S * v, -0.5); rule.scale.set(1 + 30 * (v > 0 ? 0 : u), v > 0 ? 1 + 70 * v : 1, 1); if (v > 0) rule.position.y = R + S * v / 2;
      fade(rule, win(t, T0 + 3, C.cube, 0.3, 0.5)); fade(lW, win(t, C.stades - 1, C.cube, 0.3, 0.5)); fade(lH, win(t, C.stades + 2, C.cube, 0.3, 0.5));
      fade(holy, win(t, C.cube + 1.0, SC.pierres.start, 0.6, 0.3)); city.userData.cube.material.opacity = 0.55 * (1 - 0.5 * win(t, C.cube + 1.0, SC.pierres.start, 0.6, 0.3));
      camKeys(cam, t, [{ t: T0, p: [1.6, 1.8, 6.0], l: [0.6, 1.4, -1.0], f: 50 }, { t: C.stades, p: [0.4, 2.0, 7.0], l: [0, 1.6, -2], f: 52 }, { t: C.cube, p: [0.0, 2.4, 7.4], l: [0, 1.6, -2], f: 52 }, { t: C.cube + 2, p: [0.0, 1.6, 4.4], l: [0, 0.7, 0.8], f: 50 }, { t: SC.pierres.start, p: [0.0, 1.5, 4.0], l: [0, 0.7, 1.0], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- or transparent, 12 pierres precieuses, le pectoral du grand pretre, les portes de perle
SETS.pierres = () => {
  const B = base({ bg: 0x0c0a16, hemi: [0xfff0e0, 0x1a1420, 1.0], sun: [0xfff0d8, 1.1, [2, 6, 6]], shadow: false, bloom: [0.55, 0.5, 0.82], exposure: 1.0, fog: [0x0c0a16, 10, 50] }); const { scene, cam } = B;
  scene.add(L.stars(400, 60, 1.0));
  // bandes des fondements, en gros plan
  const wall = new THREE.Group(); wall.position.set(0, 0, -2); scene.add(wall);
  STONES.forEach(([, c], i) => wall.add(at(box(8, 0.22, 0.4, M(c, { emissive: new THREE.Color(c).multiplyScalar(0.3) })), 0, 0.11 + i * 0.22, 0)));
  // gemmes flottantes nommees
  const named = [0, 1, 3, 8, 11]; const gems = named.map((si, k) => { const [n, c] = STONES[si]; const gm = new THREE.Group(); gm.position.set(-1.2 + k * 0.6, 1.6 + (k % 2) * 0.35, 0.2); scene.add(gm); gm.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), G(c, 1.2))); const l = label(n, { w: 0.55, h: 0.1, color: '#ffffff', font: 'bold 90px Inter' }); l.position.y = -0.22; gm.add(l); return gm; });
  // pectoral : 4 rangees de 3
  const plate = new THREE.Group(); plate.position.set(0, 1.5, 0.8); scene.add(plate);
  plate.add(at(box(0.9, 1.15, 0.04, M(0xc8a050, { emissive: new THREE.Color(0x3a2808) })), 0, 0, -0.03));
  STONES.forEach(([, c], i) => plate.add(at(new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), G(c, 1.2)), (i % 3 - 1) * 0.27, (1.5 - Math.floor(i / 3)) * 0.26, 0.04)));
  // porte de perle et rue d'or transparent
  const street = new THREE.Mesh(new THREE.PlaneGeometry(3, 30), new THREE.MeshLambertMaterial({ color: 0xffe08a, emissive: new THREE.Color(0x6a4a10), transparent: true, opacity: 0.6 })); street.rotation.x = -Math.PI / 2; street.position.set(0, 0.01, -10); scene.add(street);
  const gate = new THREE.Group(); gate.position.set(0, 0, -6); scene.add(gate);
  const pearl = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.35, 16, 40), pearlMat()); pearl.position.y = 1.4; gate.add(pearl);
  const shine = glowStar(5, 0xffffff); shine.position.set(0, 1.4, -0.5); gate.add(shine);
  const K = cardsMgr(scene, cam); refCard(K);
  K('12 pierres précieuses · 12 fondements', { w: 1.6, h: 0.24, border: '#9a4ad8' }, t => win(t, C.liste + 0.3, C.liste + 6.0, 0.3, 0.2), -0.6);
  K('Exode 28 : le pectoral du grand prêtre, 12 pierres', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.liste + 6.2, C.liste + 12.0, 0.3, 0.2), -0.6);
  K('chaque porte : une seule perle', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, C.perle + 0.3, SC.temple.start, 0.3, 0.2), -0.6);
  const P2 = () => C.liste + 6.0;
  return {
    ...B, update(t) {
      const T0 = SC.pierres.start;
      gems.forEach((g, i) => { g.rotation.y = t * 0.8 + i; fade(g, win(t, C.liste + 0.5 + i * 0.6, P2(), 0.3, 0.4)); });
      fade(plate, win(t, P2() + 0.3, C.liste + 13, 0.5, 0.5)); plate.rotation.y = 0.25 * Math.sin(t * 0.7);
      const pk = sstep(C.liste + 12, C.liste + 14, t); fade(gate, pk); fade(street, pk); pearl.rotation.z = t * 0.1;
      camKeys(cam, t, [{ t: T0, p: [0, 1.4, 4.6], l: [0, 1.2, -2], f: 50 }, { t: C.liste, p: [0, 1.6, 3.6], l: [0, 1.5, -1], f: 48 }, { t: P2(), p: [0, 1.5, 2.8], l: [0, 1.5, 0.8], f: 46 }, { t: C.liste + 12.5, p: [0, 1.5, 2.8], l: [0, 1.5, 0.8], f: 46 }, { t: C.liste + 14, p: [0, 1.0, 1.2], l: [0, 1.3, -6], f: 52 }, { t: SC.temple.start, p: [0, 0.8, -1.8], l: [0, 1.3, -6], f: 52 }]);
      K.update(t);
    }
  };
};

// ---------- pas de temple ; pas de soleil ; portes toujours ouvertes ; le livre de vie
SETS.temple = () => {
  const B = heavenCity(); const { scene, cam } = B;
  const ghostT = new THREE.Group(); ghostT.position.set(0, 0, -6); scene.add(ghostT);
  const hm = holoMat(0xffd070, 0.3); ghostT.add(at(box(2.4, 1.6, 1.6, hm), 0, 0.8, 0)); for (let k = -2; k <= 2; k++) ghostT.add(at(box(0.12, 1.6, 0.12, hm), k * 0.5, 0.8, 0.85)); const roof = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.6, 4), hm); roof.rotation.y = Math.PI / 4; roof.position.y = 1.9; ghostT.add(roof);
  const j = john(); j.place(1.3, 0, 1.6, -0.4); scene.add(j.root); faceLight(scene, [0.6, 1.6, 4.0], 1.2);
  const ppl = citizens(scene, 4);
  const book = openBook(versePage(['LIVRE DE VIE', '', 'de l\'Agneau']), versePage(['', '', ''])); book.position.set(-0.6, 1.2, 1.8); book.rotation.x = 0.9; book.scale.setScalar(1.6); scene.add(book);
  const K = cardsMgr(scene, cam); refCard(K);
  K('Ap 21, 22 : aucun temple dans la ville', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.sanstemple + 0.3, C.sanstemple + 6.5, 0.3, 0.2), -0.6);
  K('les portes ne se ferment jamais', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, C.ouvertes + 0.3, SC.fin.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.temple.start; B.tick(t);
      fade(ghostT, 1 - sstep(C.sanstemple + 1.0, C.sanstemple + 4.0, t)); j.pose({ hp: -0.15 }); j.face(0, 'awe', t);
      fade(book, win(t, C.ouvertes - 7.5, C.ouvertes, 0.5, 0.5));
      ppl.forEach((h, i) => { const k = clamp((t - C.ouvertes - i * 1.2) / 8, 0, 1); h.place(-0.8 + (i % 2) * 0.6, 0, 4.5 - 6 * k - i * 0.4, Math.PI); h.pose(L.walkPose(t * 4 + i, k > 0 && k < 1 ? 0.6 : 0, {})); h.face(0, 'happy', t); fade(h.root, t > C.ouvertes - 0.5 ? 1 : 0); });
      camKeys(cam, t, [{ t: T0, p: [0.4, 1.6, 5.0], l: [0, 1.2, -6], f: 50 }, { t: C.sanstemple + 4, p: [0.6, 1.6, 4.4], l: [0.4, 1.4, 0], f: 48 }, { t: C.ouvertes - 7.5, p: [0.0, 1.8, 4.0], l: [-0.4, 1.3, 1.2], f: 46 }, { t: C.ouvertes, p: [0.0, 2.2, 6.4], l: [0, 1.0, -4], f: 52 }, { t: SC.fin.start, p: [0.0, 2.4, 6.6], l: [0, 1.0, -6], f: 52 }]);
      K.update(t);
    }
  };
};

// ---------- fin : le ciel et la terre disparaissent, la mer n'existe plus (prochain episode)
SETS.fin = () => {
  const B = seaWorld({ sky: [0x0a0a20, 0x3a2a5a], exposure: 0.95 }); const { scene, cam } = B;
  const j = john(); j.place(0, 0, 1.0, 0.2); scene.add(j.root); faceLight(scene, [0.3, 1.6, 3.6], 1.2);
  const nw = glowStar(14, 0xfff0d0); nw.position.set(0, 6, -40); scene.add(nw);
  const K = cardsMgr(scene, cam);
  K('PROCHAIN ÉPISODE · Apocalypse 21, 1-8', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, SC.fin.start + 8.0, TL.duration + 1, 0.4, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.fin.start; const k = sstep(T0 + 9, T0 + 14, t); B.water.mesh.position.y = -0.2 - 3 * k; fade(B.water.mesh, 1 - k); nw.material.opacity = 0.2 + 0.8 * k;
      j.pose({ hp: -0.2 }); j.face(0, 'awe', t);
      camKeys(cam, t, [{ t: T0, p: [0.6, 1.7, 3.6], l: [0, 1.4, 0.8], f: 48 }, { t: T0 + 8, p: [0.4, 1.8, 4.4], l: [0, 1.0, -10], f: 52 }, { t: TL.duration, p: [0.2, 2.2, 5.4], l: [0, 1.5, -30], f: 54 }]);
      K.update(t);
    }
  };
};

// ---------- couverture : la ville d'or descend au-dessus des nuages
SETS.cover = () => {
  const B = mountainSet({ bloom: [0.6, 0.5, 0.82] }); const { scene, cam } = B;
  const city = makeCity(6); city.position.set(0, 3.2, -16); city.rotation.y = 0.5; scene.add(city);
  const g = glowStar(14, 0xffe8a0); g.position.set(0, 7, -16.5); scene.add(g);
  const j = john(); j.place(0.4, 0, 0.8, 0.3 + Math.PI); scene.add(j.root);
  return { ...B, update() { cam.position.set(1.4, 1.5, 3.6); cam.fov = 56; cam.updateProjectionMatrix(); cam.lookAt(0, 5.0, -16); } };
};

const SHOTS = [['intro', 0, SC.montagne.start], ['montagne', SC.montagne.start, SC.portes.start], ['portes', SC.portes.start, SC.mesure.start], ['mesure', SC.mesure.start, SC.pierres.start], ['pierres', SC.pierres.start, SC.temple.start], ['temple', SC.temple.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
