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

const REF = 'Apocalypse 22, 1-5 · traduction Louis Segond';
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
const refCard = (K) => K(REF, { w: 1.6, h: 0.12, border: '#807060', color: '#e8e0d4' }, t => t > SC.fleuve.start + 0.3 && t < SC.fin.start ? 0.85 : 0, -0.88, 0.75);


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

// ---------- intro : l'arbre garde par les cherubins et l'epee de feu (Genese), puis le principe
SETS.intro = () => {
  const B = nightSet({ hemi: [0xd8d0ff, 0x10101a, 0.7] }); const { scene, cam } = B;
  const tree = new THREE.Group(); scene.add(tree); tree.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.6, 8), M(0x6a4a2a)), 0, 0.8, -0.6)); const cr = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 1), M(0x3a8a3a)); cr.position.set(0, 2.0, -0.6); tree.add(cr);
  for (let f = 0; f < 10; f++) { const a = f / 10 * Math.PI * 2; tree.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), G(0xffd04a, 1.3)), Math.cos(a) * 0.75, 2.0 + Math.sin(f * 2) * 0.3, -0.6 + Math.sin(a) * 0.75)); }
  const cherubs = [-1, 1].map(s => { const c = angel(); c.place(s * 1.0, 0, 0.4, -s * 0.3); scene.add(c.root); return c; });
  const sword = new THREE.Group(); sword.position.set(0, 1.2, 0.8); scene.add(sword); sword.add(box(0.06, 1.0, 0.02, G(0xff7a2a, 2.2))); const fl = new THREE.PointLight(0xff8a3a, 2.5, 4, 1.4); sword.add(fl);
  const rig = claudeRig(scene, [1.6, 0, 2.0], -0.6, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28); faceLight(scene, [1.3, 0.7, 3.2], 1.0); faceLight(scene, [0, 1.6, 2.4], 1.2, 0xffe0c0);
  const back = label('◀ une scène avant', { w: 0.8, h: 0.12, color: '#ffd070', font: 'bold 80px Inter' }); rig.holoG.add(back);
  const K = cardsMgr(scene, cam);
  K('Genèse 3, 24 : les chérubins et l\'épée de feu', { w: 1.6, h: 0.24, border: '#ff8a3a' }, t => win(t, 2.0, C.serie, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      sword.rotation.y = t * 3; fl.intensity = 2.2 + 0.5 * Math.sin(t * 9); cherubs.forEach((c, i) => { c.pose({ aR: [0.9, 0.2], eR: 0.3 }); c.face(0, 'serious', t); });
      const bk = win(t, C.serie + 0.3, C.title, 0.3, 0.3); beamOn(rig, bk, t); fade(back, bk); back.lookAt(cam.position); rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: 0, p: [0.0, 1.6, 4.6], l: [0, 1.4, 0], f: 48 }, { t: C.serie, p: [0.0, 1.5, 4.2], l: [0, 1.3, 0], f: 48 }, { t: C.serie + 0.8, p: [1.1, 1.2, 5.0], l: [1.2, 0.9, 1.8], f: 46 }, { t: SC.fleuve.start, p: [1.1, 1.2, 4.9], l: [1.2, 0.9, 1.8], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- le fleuve de cristal ; Eden et Ezechiel
SETS.fleuve = () => {
  const B = heavenCity(); const { scene, cam } = B;
  const j = john(); j.place(1.5, 0, 1.4, -0.5); scene.add(j.root); faceLight(scene, [0.6, 1.6, 4.0], 1.2, 0xfff0e0, 5);
  const lamb = new THREE.Group(); lamb.position.set(0, 0.0, -44); scene.add(lamb);
  const K = cardsMgr(scene, cam); refCard(K);
  K('« l\'agneau » : image de Jésus', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, C.agneau + 0.3, C.agneau + 4.5, 0.3, 0.2), -0.6);
  K('Genèse 2, 10 · Ézéchiel 47 : déjà un fleuve de vie', { w: 1.6, h: 0.24, border: '#5aa0c8' }, t => win(t, C.agneau + 4.7, SC.arbre.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.fleuve.start; B.tick(t); j.pose({ hp: -0.1, hy: 0.3 }); j.face(0, 'awe', t);
      camKeys(cam, t, [{ t: T0, p: [0.0, 6.0, 8.0], l: [0, 0.5, -20], f: 52 }, { t: C.agneau, p: [0.4, 1.4, 5.2], l: [0, 1.0, -10], f: 50 }, { t: SC.arbre.start, p: [0.3, 1.2, 3.8], l: [0, 1.2, -10], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- l'arbre de vie ; le souvenir des cherubins qui disparaissent
SETS.arbre = () => {
  const B = heavenCity(); const { scene, cam } = B;
  const ghosts = [-1, 1].map(s => { const c = new Human({ holo: 0xff8a3a, robe: 0xffffff, robeL: 0.9, hairStyle: 'long', seed: 4110 + s }); c.root.traverse(m => { if (m.isMesh && m.material && m.material.blending === THREE.AdditiveBlending) m.material.opacity = 0.3; }); c.place(1.7 + s * 0.7, 0, -0.4, -s * 0.3); scene.add(c.root); return c; });
  const ppl = citizens(scene, 4);
  const K = cardsMgr(scene, cam); refCard(K);
  K('12 récoltes par an · des feuilles qui soignent', { w: 1.6, h: 0.24, border: '#7aff5a' }, t => win(t, C.douze + 0.3, SC.face.start, 0.3, 0.2), -0.6);
  K('Genèse 3 : le chemin de l\'arbre était gardé', { w: 1.6, h: 0.24, border: '#ff8a3a' }, t => win(t, C.eden + 0.3, C.eden + 7.0, 0.3, 0.2), -0.6);
  K('Apocalypse 22 : plus personne ne le garde', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.eden + 7.2, C.douze, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.arbre.start; B.tick(t);
      const gk = win(t, C.eden + 0.5, C.eden + 8.0, 0.6, 1.2); ghosts.forEach(g => { fade(g.root, gk); g.pose({ aR: [0.9, 0.2] }); });
      ppl.forEach((h, i) => { const k = clamp((t - C.eden - 7.5 - i * 0.6) / 6, 0, 1); h.place(-0.6 + i * 0.5 + 1.5 * k * 0.3, 0, 2.5 - 2.6 * k, -0.3); h.pose(L.walkPose(t * 4 + i, k > 0 && k < 1 ? 0.6 : 0, { aR: [k >= 1 && i === 0 ? 1.8 : 0.1, 0.2] })); h.face(0, 'happy', t); });
      camKeys(cam, t, [{ t: T0, p: [2.6, 2.0, 2.6], l: [1.7, 1.8, -1.0], f: 46 }, { t: C.eden, p: [2.3, 1.6, 3.4], l: [1.6, 1.3, -0.8], f: 48 }, { t: C.douze, p: [1.4, 1.6, 3.6], l: [1.2, 1.4, -1.0], f: 48 }, { t: SC.face.start, p: [1.2, 1.6, 3.4], l: [1.0, 1.5, -1.0], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- ils verront sa face ; son nom sur leurs fronts ; Moise
SETS.face = () => {
  const B = heavenCity(); const { scene, cam } = B;
  const ppl = citizens(scene, 5); const marks = ppl.map(h => { const m = new THREE.Mesh(new THREE.CircleGeometry(0.03, 12), G(0xffd070, 2)); m.position.set(0, 0.26, 0.15); h.neck.add(m); return m; });
  const moses = new Human({ holo: 0x9adfff, robe: 0xffffff, robeL: 0.85, hairStyle: 'long', beard: 'long', seed: 4120 }); moses.root.traverse(m => { if (m.isMesh && m.material && m.material.blending === THREE.AdditiveBlending) m.material.opacity = 0.3; }); moses.place(-1.6, 0, 0.5, 0.5); scene.add(moses.root);
  const K = cardsMgr(scene, cam); refCard(K);
  K('« plus d\'anathème » = plus de malédiction', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.moise + 0.3, C.moise + 6.0, 0.3, 0.2), -0.6);
  K('Exode 33, 20 : « l\'homme ne peut me voir et vivre »', { w: 1.6, h: 0.24, border: '#9adfff' }, t => win(t, C.moise + 6.2, SC.nuit.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.face.start; B.tick(t);
      ppl.forEach((h, i) => { h.place(-0.9 + i * 0.45, 0, 1.6 - (i % 2) * 0.5, Math.PI); h.root.rotation.y = 0.2 * (i - 2) * 0.3; h.pose({ hp: -0.35, aL: [0.4 + 0.3 * (i % 2), 0.3], aR: [0.4, 0.3] }); h.face(0, 'awe', t); });
      ppl.forEach((h, i) => { h.root.rotation.y = Math.PI * 0 + 0.15 * (i - 2); });
      const mk = sstep(T0 + 9.0, T0 + 10.0, t); marks.forEach(m => fade(m, mk));
      const mo = win(t, C.moise + 5.5, SC.nuit.start, 0.5, 0.5); fade(moses.root, mo); moses.pose({ aL: [1.6, 0.2], aR: [1.6, 0.2], eL: 1.6, eR: 1.6, hp: 0.4 });
      camKeys(cam, t, [{ t: T0, p: [0.0, 1.6, 5.6], l: [0, 1.3, 0], f: 46 }, { t: T0 + 9.5, p: [0.0, 1.6, 4.0], l: [0, 1.45, 1.2], f: 44 }, { t: C.moise, p: [0.0, 1.6, 4.6], l: [0, 1.3, 1.0], f: 46 }, { t: SC.nuit.start, p: [-0.4, 1.5, 4.4], l: [-0.6, 1.1, 0.6], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- plus de nuit : le soleil et la lune s'effacent
SETS.nuit = () => {
  const B = heavenCity(); const { scene, cam } = B;
  const sunS = glowStar(6, 0xffd090); sunS.position.set(-12, 14, -30); scene.add(sunS);
  const moon = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 2), G(0xe8eeff, 1.2)); moon.position.set(12, 12, -30); scene.add(moon);
  const ppl = citizens(scene, 4);
  const K = cardsMgr(scene, cam); refCard(K);
  K('Genèse 1 : Dieu sépare le jour et la nuit', { w: 1.6, h: 0.24, border: '#9adfff' }, t => win(t, C.soleil + 0.3, C.soleil + 5.0, 0.3, 0.2), -0.6);
  K('fin de la Bible : la nuit n\'existe plus', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.soleil + 5.2, SC.fin.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.nuit.start; B.tick(t); const g = 1 - sstep(T0 + 4.0, T0 + 9.0, t); sunS.material.opacity = g; moon.material.color.setHex(0xe8eeff).multiplyScalar(1.2 * g + 0.001); moon.visible = g > 0.02;
      ppl.forEach((h, i) => { h.place(-1.0 + i * 0.7, 0, 1.2 - (i % 2) * 0.6, 0.2 - i * 0.12); h.pose({ aL: [0.5, 0.3], aR: [0.5, 0.3] }); h.face(0, 'happy', t); });
      camKeys(cam, t, [{ t: T0, p: [0, 3.0, 7.0], l: [0, 6.0, -20], f: 54 }, { t: C.soleil, p: [0, 2.0, 6.0], l: [0, 1.6, -10], f: 52 }, { t: SC.fin.start, p: [0, 3.5, 8.0], l: [0, 1.0, -20], f: 52 }]);
      K.update(t);
    }
  };
};

// ---------- fin : l'ange mesure la ville d'or aux portes de perle (prochain episode)
SETS.fin = () => {
  const B = base({ sky: [0x2a2a6a, 0xffd8a0], hemi: [0xfff0e0, 0x2a2a3a, 0.9], sun: [0xfff0d0, 1.2, [2, 6, 6]], shadowSize: 8, bloom: [0.55, 0.5, 0.82], exposure: 0.95, fog: [0x8a7aa0, 16, 80], target: [0, 1, 0] }); const { scene, cam } = B;
  scene.add(L.groundPlane(80, 30, 0x8a7a6a, 0.1, 3));
  const city = new THREE.Group(); city.position.set(0, 0, -14); scene.add(city);
  const gold = M(0xe8c060, { emissive: new THREE.Color(0x3a2808) }); for (const s of [-1, 1]) city.add(at(box(8, 6, 1, gold), s * 5.2, 3, 0)); city.add(at(box(2.4, 1.5, 1, gold), 0, 5.25, 0));
  const pearl = new THREE.Mesh(new THREE.CircleGeometry(1.1, 32), M(0xf4f0f8, { emissive: new THREE.Color(0x40404a) })); pearl.position.set(0, 2.3, 0.55); city.add(pearl);
  const an = angel(); an.place(1.4, 0, -1.0, -0.5); scene.add(an.root); angelLight(scene, [1.4, 2.4, 0.2]);
  const reed = box(0.03, 2.2, 0.03, G(0xffd070, 1.6)); an.hand.R.add(reed); reed.position.set(0, -0.3, 0.05);
  const K = cardsMgr(scene, cam);
  K('PROCHAIN ÉPISODE · Apocalypse 21, 9-27', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, SC.fin.start + 7.0, TL.duration + 1, 0.4, 0.2), -0.6);
  return {
    ...B, update(t) {
      an.pose({ aR: [1.2 + 0.2 * Math.sin(t), 0.2], eR: 0.2, aL: [0.2, 0.2] }); an.face(0, 'serious', t);
      camKeys(cam, t, [{ t: SC.fin.start, p: [0.5, 1.6, 6.0], l: [0, 2.5, -14], f: 50 }, { t: TL.duration, p: [0.3, 1.4, 3.2], l: [0, 2.8, -14], f: 50 }]);
      K.update(t);
    }
  };
};


function softGlow(size) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,230,160,0.9)'); gr.addColorStop(0.35, 'rgba(255,200,90,0.3)'); gr.addColorStop(1, 'rgba(255,180,60,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); s.scale.setScalar(size); return s;
}
// ---------- l'arbre de vie geant, en or, plante sur la planete, qui monte jusqu'aux nuages
function goldenTreeWorld(o = {}) {
  const B = base({ sky: [0x1a1050, 0xffc890], hemi: [0xfff0d0, 0x2a2040, 0.8], sun: [0xffe8c0, 1.0, [20, 40, 30]], shadow: false, bloom: [0.75, 0.5, 0.74], exposure: 0.9, fog: [0x6a5070, 700, 2400], ...o });
  const { scene } = B; scene.add(L.stars(500, 600, 1.0));
  const R = 260; const pg = new THREE.IcosahedronGeometry(R, 5); { const p = pg.attributes.position, cols = []; for (let i = 0; i < p.count; i += 3) { const x = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3 / R, y = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3 / R, z = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3 / R; const n = Math.sin(x * 5.1 + 1.3) + Math.sin(z * 4.3 + y * 3.1) + Math.sin((x + z) * 7.7) * 0.5; const sea = n < -0.25 && y < 0.93; const c = new THREE.Color(sea ? 0x1a5aa8 : (n < -0.05 ? 0xc8b070 : (hash(i) > 0.5 ? 0x2a8a4a : 0x3a9a3a))); for (let k = 0; k < 3; k++) cols.push(c.r, c.g, c.b); } pg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); }
  const planet = new THREE.Mesh(pg, M(0xffffff, { vertexColors: true, emissive: new THREE.Color(0x061008) })); planet.position.set(0, -R, 0); scene.add(planet);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.02, 48, 24), new THREE.MeshBasicMaterial({ color: 0x9ad8ff, transparent: true, opacity: 0.18, side: THREE.BackSide, depthWrite: false })); halo.position.copy(planet.position); scene.add(halo);
  // fleuve de cristal qui part du pied de l'arbre
  const riv = new THREE.Mesh(new THREE.PlaneGeometry(4, 300), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xc8f0ff).multiplyScalar(1.3), transparent: true, opacity: 0.85 })); riv.rotation.x = -Math.PI / 2; riv.position.set(0, 0.3, 150); scene.add(riv);
  const tree = new THREE.Group(); scene.add(tree);
  const gold = M(0xe8a830, { emissive: new THREE.Color(0x6a4008) }), leafM = M(0xffb020, { emissive: new THREE.Color(0xa86a08) }), leafM2 = M(0xffd040, { emissive: new THREE.Color(0xe8a818) });
  const lights = [];
  function branch(parent, len, rad, depth, seed) {
    const g = new THREE.Group(); parent.add(g);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(rad * 0.65, rad, len, 7), gold); c.position.y = len / 2; g.add(c);
    const tip = new THREE.Group(); tip.position.y = len; g.add(tip);
    if (depth === 0) { for (let k = 0; k < 4; k++) { const l = new THREE.Mesh(new THREE.IcosahedronGeometry(len * (0.35 + hash(seed + k) * 0.3), 0), hash(seed * 3 + k) > 0.5 ? leafM : leafM2); l.position.set((hash(seed + k * 7) - 0.5) * len * 0.8, (hash(seed + k * 11) - 0.3) * len * 0.5, (hash(seed + k * 13) - 0.5) * len * 0.8); tip.add(l); } return g; }
    const n = depth > 2 ? 3 : 4;
    for (let k = 0; k < n; k++) { const b = branch(tip, len * 0.68, rad * 0.62, depth - 1, seed * 4 + k + 1); b.rotation.y = k / n * Math.PI * 2 + hash(seed + k) * 0.8; b.rotation.z = 0.5 + hash(seed * 2 + k) * 0.35; }
    if (depth >= 2) { const up = branch(tip, len * 0.6, rad * 0.6, depth - 2, seed * 9 + 7); up.rotation.z = 0.12; }
    return g;
  }
  branch(tree, 60, 9, 5, 1);
  const roots = []; for (let k = 0; k < 7; k++) { const r = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 5, 30, 6), gold); r.rotation.z = 1.25; r.rotation.y = k / 7 * Math.PI * 2; r.position.set(Math.cos(k / 7 * Math.PI * 2) * 12, 2, -Math.sin(k / 7 * Math.PI * 2) * 12); r.lookAt(0, 6, 0); r.rotateX(Math.PI / 2); scene.add(r); roots.push(r); }
  const glow = softGlow(380); glow.position.set(0, 190, -40); glow.material.opacity = 0.55; scene.add(glow);
  
  const pl = new THREE.PointLight(0xffd070, 3, 500, 1.2); pl.position.set(0, 180, 60); scene.add(pl);
  // couche de nuages a mi-hauteur
  const cm = M(0xffffff, { emissive: new THREE.Color(0x4a4058), transparent: true, opacity: 0.7 });
  const cl = []; for (let i = 0; i < 60; i++) { const a = hash(i) * Math.PI * 2, rr = 25 + hash(i * 3) * 160; const c = new THREE.Mesh(new THREE.IcosahedronGeometry(10 + hash(i * 5) * 18, 1), cm); c.scale.y = 0.35; c.position.set(Math.cos(a) * rr, 72 + (hash(i * 7) - 0.5) * 16, Math.sin(a) * rr * 0.8 - 20); scene.add(c); cl.push(c); }
  const sparks = []; for (let i = 0; i < 80; i++) { const sp = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 0), G(0xfff0b0, 2)); scene.add(sp); sparks.push(sp); }
  const dome = scene.children[0]; B.follow = (cam) => dome.position.copy(cam.position);
  B.tick = (t) => { tree.rotation.y = 0.02 * Math.sin(t * 0.2); cl.forEach((c, i) => c.position.x += 0.0 * i); sparks.forEach((sp, i) => { const u = (t * 0.03 + hash(i)) % 1; const a = hash(i * 3) * Math.PI * 2, rr = 20 + hash(i * 5) * 90; sp.position.set(Math.cos(a + t * 0.05) * rr, 20 + u * 260, Math.sin(a + t * 0.05) * rr); }); glow.scale.setScalar(380 + 15 * Math.sin(t)); };
  B.tick(0);
  return B;
}
SETS.geant = () => {
  const B = goldenTreeWorld(); const { scene, cam } = B;
  const K = cardsMgr(scene, cam); refCard(K);
  return {
    ...B, update(t) {
      const T0 = SC.arbre.start; B.tick(t);
      camKeys(cam, t, [{ t: T0, p: [0, 40, 600], l: [0, 80, 0], f: 50 }, { t: C.eden, p: [70, 25, 330], l: [0, 110, 0], f: 52 }]); B.follow(cam);
      K.update(t);
    }
  };
};
// ---------- couverture : l'arbre de vie au bord du fleuve de cristal
SETS.cover = () => {
  const B = goldenTreeWorld(); const { scene, cam } = B; B.tick(3);
  return { ...B, update() { cam.position.set(0, 40, 560); cam.fov = 56; cam.updateProjectionMatrix(); cam.lookAt(0, 70, 0); B.follow(cam); } };
};

const SHOTS = [['intro', 0, SC.fleuve.start], ['fleuve', SC.fleuve.start, SC.arbre.start], ['geant', SC.arbre.start, C.eden], ['arbre', C.eden, SC.face.start], ['face', SC.face.start, SC.nuit.start], ['nuit', SC.nuit.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
