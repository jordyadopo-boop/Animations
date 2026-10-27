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
// ---------- desert de Gizeh
function desert(o = {}) {
  const B = base({ sky: o.sky ?? [0x6aa8e0, 0xf0d8a8], hemi: [0xfff0d8, 0x8a6a40, 1.0], sun: [0xfff0d0, o.sunK ?? 1.7, o.sunPos ?? [6, 9, 5]], shadowSize: o.shadowSize ?? 6, bloom: [0.3, 0.5, 0.92], exposure: o.exposure ?? 1.05, fog: [o.fogC ?? 0xf0d8a8, 12, 60], target: [0, 0, 0] });
  const sand = L.groundPlane(160, 80, 0xd8b884, 0.25, 5); sand.position.y = -0.02; B.scene.add(sand);
  return B;
}
const PYH = 1.46, BASE = 2.3; // grande pyramide a l'echelle 1/100
// pyramide en gradins (blocs) ; k = fraction construite ; casing = parement blanc
function pyramid(o = {}) {
  const g = new THREE.Group(); const n = o.layers ?? 24, m = M(o.color ?? 0xd8bc88), m2 = M(0xc8a874);
  const layers = [];
  for (let i = 0; i < n; i++) { const s = BASE * (1 - i / n), h = PYH / n; const l = box(s, h * 1.02, s, i % 2 ? m : m2); l.position.y = h * (i + 0.5); l.castShadow = l.receiveShadow = true; g.add(l); layers.push(l); }
  const cg = new THREE.ConeGeometry(BASE / Math.SQRT2, PYH, 4, 1); cg.rotateY(Math.PI / 4);
  const casing = new THREE.Mesh(cg, new THREE.MeshLambertMaterial({ color: 0xfaf6ec, transparent: true })); casing.position.y = PYH / 2; casing.castShadow = true; g.add(casing);
  g.userData = { layers, casing, n };
  g.userData.build = (k) => layers.forEach((l, i) => l.visible = i < Math.ceil(k * n));
  g.userData.case = (k) => { casing.visible = k > 0.01; casing.material.opacity = k; casing.scale.set(1.06, 1.0, 1.06); layers.forEach(l => l.material.visible = true); g.userData.hideSteps = k > 0.98; };
  g.userData.case(o.casing ?? 0);
  return g;
}
function worker(i, o = {}) {
  const skins = [0x8a5a3a, 0xa86c44, 0x7a4a2e, 0xb07a50, 0x6a4028];
  const h = new Human({ skin: skins[i % 5], hair: 0x141010, hairStyle: ['short', 'bald', 'short', 'curly', 'bald'][i % 5], top: skins[i % 5], bottom: 0xf0ead8, robe: 0xf0ead8, robeL: 0.36, robeW: 0.26, shortSleeve: true, seed: 2700 + i, ...o });
  return h;
}
function sledge(withBlock = true, bc = 0xd8bc88) {
  const g = new THREE.Group();
  for (const s of [-1, 1]) { const r = box(0.06, 0.05, 0.9, M(0x6a4a2a)); r.position.set(s * 0.22, 0.03, 0); g.add(r); const tip = box(0.06, 0.05, 0.12, M(0x6a4a2a)); tip.position.set(s * 0.22, 0.07, 0.48); tip.rotation.x = -0.6; g.add(tip); }
  for (let k = 0; k < 4; k++) g.add(at(box(0.5, 0.03, 0.06, M(0x7a5a3a)), 0, 0.07, -0.33 + k * 0.22));
  if (withBlock) { const b = box(0.48, 0.38, 0.62, M(bc)); b.position.y = 0.28; b.castShadow = true; g.add(b); g.userData.block = b; }
  g.traverse(m => { if (m.isMesh) m.castShadow = true; });
  return g;
}
function rope(a, b, mat) { return L.beam(a, b, 0.012, mat ?? M(0xa08a5a)); }
function boat() {
  const g = new THREE.Group(); const wood = M(0x8a5a32);
  const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.12, 2.2, 8, 1, false, 0, Math.PI), wood); hull.rotation.set(Math.PI / 2, 0, Math.PI / 2); hull.position.y = 0.12; hull.scale.set(1, 1, 0.5); g.add(hull);
  g.add(at(box(0.5, 0.04, 2.0, M(0x9a6a3a)), 0, 0.12, 0));
  const mast = box(0.04, 1.4, 0.04, wood); mast.position.set(0, 0.8, 0.2); g.add(mast);
  const sail = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.0), new THREE.MeshLambertMaterial({ color: 0xf0e8d0, side: THREE.DoubleSide })); sail.position.set(0, 0.95, 0.22); sail.rotation.y = Math.PI / 2; g.add(sail);
  for (let k = 0; k < 4; k++) g.add(at(box(0.3, 0.22, 0.3, M(0xf4f0e4)), (k % 2 - 0.5) * 0.18, 0.25, -0.6 + Math.floor(k / 2) * 0.35 - 0.05 * (k % 2)));
  g.traverse(m => { if (m.isMesh) m.castShadow = true; });
  return g;
}
function palm(seed, h = 2) { return L.makePalm(h, seed); }

// ---------- intro : survol de la grande pyramide
SETS.intro = () => {
  const B = desert({ sky: [0x3a6aa8, 0xf8c890], sunPos: [-8, 4, 3], sunK: 1.9 }); const { scene, cam } = B;
  const p = pyramid(); p.userData.build(1); scene.add(p);
  const p2 = pyramid({ layers: 20 }); p2.scale.setScalar(0.95); p2.position.set(-3.2, 0, -3.5); p2.userData.build(1); scene.add(p2);
  const p3 = pyramid({ layers: 14 }); p3.scale.setScalar(0.45); p3.position.set(-5.6, 0, -6.2); p3.userData.build(1); scene.add(p3);
  const cnt = label('2 300 000 BLOCS', { w: 1.2, h: 0.19, color: '#ffe8c0', font: 'bold 120px Inter' }); scene.add(cnt);
  const rig = claudeRig(scene, [0.9, 0, 2.4], -0.4, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28);
  return {
    ...B, update(t) {
      camKeys(cam, t, [{ t: 0, p: [3.2, 0.6, 3.6], l: [0, 0.7, 0], f: 46 }, { t: 6.0, p: [1.0, 2.0, 4.6], l: [0, 0.7, 0], f: 46 }, { t: C.title, p: [0.6, 0.8, 5.6], l: [0.2, 0.75, 0], f: 46 }, { t: SC.kheops.start, p: [0.4, 0.8, 5.8], l: [0.2, 0.75, 0], f: 46 }]);
      fade(cnt, win(t, 1.0, 5.5, 0.4, 0.4)); cnt.position.set(0, 1.85, 0.6); cnt.lookAt(cam.position);
      rig.c.update(t, env('claude', t), {}); rig.c.g.visible = t > C.title - 1.0; rig.pr.visible = rig.c.g.visible;
    }
  };
};

// ---------- le chantier de Kheops
SETS.kheops = () => {
  const B = desert(); const { scene, cam } = B;
  const p = pyramid(); p.userData.build(0.55); p.position.set(0, 0, -2.2); scene.add(p);
  const ws = [], sl = sledge(); sl.position.set(0.3, 0, 0.6); sl.rotation.y = -0.3; scene.add(sl);
  // marque d'equipe peinte en rouge sur le bloc
  const mark = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.12), new THREE.MeshBasicMaterial({ color: 0xb03020, transparent: true, opacity: 0.85 })); mark.position.set(0.245, 0.3, 0); mark.rotation.y = Math.PI / 2; sl.userData.block.add(mark); mark.position.set(0.245, 0.02, 0);
  for (let i = 0; i < 6; i++) { const w = worker(i); const d = 1.3 + Math.floor(i / 2) * 0.55; w.place(0.3 + (i % 2 ? 0.28 : -0.28) + Math.sin(-0.3) * d, 0, 0.6 + Math.cos(-0.3) * d, -0.3); scene.add(w.root); ws.push(w); }
  const rp = rope([0.3 - 0.1, 0.1, 1.05], [0.3 - 0.9, 1.0, 3.0]);
  for (let i = 0; i < 5; i++) { const w = worker(i + 6); w.place(-2.2 + i * 0.5, 0, -0.6 - (i % 2) * 0.4, 0.5 + i * 0.3); scene.add(w.root); ws.push(w); }
  faceLight(scene, [0.4, 1.6, 3.2], 1.6, 0xfff0d8);
  const K = cardsMgr(scene, cam);
  K('KHÉOPS · 146 m à l\'origine\nle plus haut bâtiment pendant ≈ 4 000 ans', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.kheops.start + 3.5, C.ouvriers, 0.3, 0.2), -0.55);
  K('pas des esclaves : un village,\ndes tombes, des noms d\'équipes', { w: 1.6, h: 0.42, border: '#ff9a6a', small: true }, t => win(t, C.ouvriers + 1.0, C.ouvriers + 5.5, 0.3, 0.2), -0.55);
  K('« les amis de Khéops »\nnom d\'équipe peint sur les blocs', { w: 1.6, h: 0.42, border: '#d04030', small: true }, t => win(t, C.ouvriers + 5.7, SC.merer.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.kheops.start;
      ws.forEach((w, i) => { if (i < 6) { w.pose(L.walkPose(t * 3 + i, 0.5, { aL: [1.2, 0.1], aR: [1.2, 0.1], eL: 0.3, eR: 0.3, lean: 0.25 })); } else w.pose(L.walkPose(t * 4 + i, 0.8)); w.face(0, 'neutral', t); });
      camKeys(cam, t, [{ t: T0, p: [1.0, 1.7, 6.6], l: [0, 0.7, -0.5], f: 46 }, { t: C.ouvriers, p: [0.9, 1.6, 7.2], l: [0.0, 0.7, 1.4], f: 46 }, { t: C.ouvriers + 5.2, p: [0.9, 1.6, 7.0], l: [0.0, 0.7, 1.4], f: 46 }, { t: C.ouvriers + 5.5, p: [1.5, 0.7, 1.4], l: [0.3, 0.35, 0.6], f: 44 }, { t: SC.merer.start, p: [1.45, 0.7, 1.35], l: [0.3, 0.35, 0.6], f: 44 }]);
      K.update(t);
    }
  };
};

// ---------- Merer et le Nil
SETS.merer = () => {
  const B = desert({ sunPos: [5, 8, 6] }); const { scene, cam } = B;
  const W = L.makeWater(60, 60, 0x3a7aa0, { opacity: 0.92 }); const water = W.mesh; water.position.y = 0.02; water.scale.set(1, 1, 0.12); scene.add(water);
  for (let i = 0; i < 10; i++) { const pm = palm(i * 3 + 1, 1.6 + hash(i) * 0.8); pm.position.set(-8 + i * 1.8, 0, -4.2 - hash(i * 3)); scene.add(pm); }
  const bt = boat(); bt.position.set(0, 0, 0); bt.rotation.y = Math.PI / 2; scene.add(bt);
  const mer = worker(3, { skin: 0x7a4a2e, top: 0xf0ead8, hairStyle: 'short' }); mer.place(0.5, 0.14, 0.15, Math.PI / 2 - 1.2); bt.add(mer.root); mer.root.position.set(0.15, 0.14, 0.6); mer.root.rotation.y = 0.6;
  const rowers = [0, 1].map(i => { const w = worker(i + 1); w.root.position.set(i ? -0.15 : 0.15, 0.14, -0.2); w.root.rotation.y = i ? -0.3 : 0.3; bt.add(w.root); return w; });
  faceLight(scene, [1.2, 1.6, 1.8], 1.6, 0xfff0d8);
  const K = cardsMgr(scene, cam);
  K('2013 · Ouadi el-Jarf\nle journal de bord de Merer', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.merer.start + 1.5, C.merer_dit - 0.2, 0.3, 0.2), -0.55);
  imagined(K, 'réplique imaginée', C.merer_dit - 0.2, C.nil);
  K('Tourah → Gizeh\nle calcaire blanc voyage par le Nil', { w: 1.6, h: 0.42, border: '#7dd8ff', small: true }, t => win(t, C.nil + 0.3, SC.traineau.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      W.update(t, 0.05);
      bt.position.x = lerp(-1.2, 1.4, (t - SC.merer.start) / 15); bt.position.y = 0.02 * Math.sin(t * 1.5); bt.rotation.z = 0.02 * Math.sin(t * 1.2);
      mer.pose({ aL: [0.2, 0.15], aR: [0.4 + 0.5 * win(t, C.merer_dit, C.nil, 0.3, 0.3), 0.3], eR: 0.9 }); mer.face(env('merer', t), 'neutral', t);
      rowers.forEach((w, i) => { w.pose(L.kneelPose({ aL: [0.9 + 0.4 * Math.sin(t * 2.4), 0.1], aR: [0.9 + 0.4 * Math.sin(t * 2.4), 0.1], lean: 0.2 })); w.face(0, 'neutral', t); });
      const bx = bt.position.x;
      camKeys(cam, t, [{ t: SC.merer.start, p: [bx + 1.5, 1.2, 3.6], l: [bx, 0.5, 0], f: 46 }, { t: C.merer_dit - 0.3, p: [bx + 1.5, 1.2, 3.4], l: [bx, 0.5, 0], f: 46 }, { t: C.merer_dit + 0.2, p: [bx + 0.45, 1.05, 1.9], l: [bx + 0.05, 0.95, 0.6], f: 42 }, { t: C.nil, p: [bx + 0.45, 1.05, 1.9], l: [bx + 0.05, 0.95, 0.6], f: 42 }, { t: C.nil + 1.0, p: [bx + 2.4, 2.4, 5.0], l: [bx, 0.4, -0.5], f: 48 }, { t: SC.traineau.start, p: [bx + 2.4, 2.4, 5.0], l: [bx, 0.4, -0.5], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- le traineau et le sable mouille
SETS.traineau = () => {
  const B = desert(); const { scene, cam } = B;
  const sl = sledge(); scene.add(sl);
  const wet = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.2), new THREE.MeshLambertMaterial({ color: 0x9a7a4a, transparent: true, opacity: 0.85 })); wet.rotation.x = -Math.PI / 2; wet.position.y = 0.01; scene.add(wet);
  const pull = []; for (let i = 0; i < 6; i++) { const w = worker(i + 2); scene.add(w.root); pull.push(w); }
  const pour = worker(9, { hairStyle: 'bald' }); scene.add(pour.root);
  const jar = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), M(0xa8603a)); jar.scale.set(1, 1.3, 1); pour.hand.R.add(jar); jar.position.set(0, -0.08, 0.06);
  const drops = []; for (let i = 0; i < 12; i++) { const d = new THREE.Mesh(new THREE.IcosahedronGeometry(0.012, 0), G(0x9ad8ff, 1.4)); scene.add(d); drops.push(d); }
  const ropes = [rope([0, 0, 0], [0, 0, 1]), rope([0, 0, 0], [0, 0, 1])]; ropes.forEach(r => scene.add(r));
  const half = label('÷ 2', { w: 0.5, h: 0.3, color: '#2a6aa8', font: 'bold 260px Inter' }); scene.add(half);
  faceLight(scene, [0.8, 1.6, 2.0], 1.6, 0xfff0d8);
  const K = cardsMgr(scene, cam);
  K('une peinture de tombe égyptienne\nl\'eau versée devant le traîneau', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.traineau.start + 3.5, C.sable, 0.3, 0.2), -0.55);
  K('2014 · sable bien mouillé\nforce de traction ≈ ÷ 2', { w: 1.6, h: 0.42, border: '#7dd8ff', small: true }, t => win(t, C.sable + 1.0, SC.rampes.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const z = -0.6 + 0.12 * (t - SC.traineau.start);
      sl.position.set(0, 0, z); wet.position.z = z + 0.95;
      pull.forEach((w, i) => { w.place((i % 2 ? 0.28 : -0.28), 0, z + 1.6 + Math.floor(i / 2) * 0.5, 0); w.pose(L.walkPose(t * 3 + i, 0.5, { aL: [1.3, 0.1], aR: [1.3, 0.1], eL: 0.2, eR: 0.2, lean: 0.3 })); w.face(0, 'neutral', t); });
      ropes[0].position.set(0.12, 0.12, z + 1.6); ropes[0].scale.set(1, 1, 1.2); ropes[1].position.set(-0.12, 0.12, z + 1.6); ropes[1].scale.set(1, 1, 1.2);
      pour.place(0.55, 0, z + 0.75, -Math.PI / 2 + 0.3); pour.pose({ aL: [0.3, 0.1], aR: [1.1, 0.2], eR: 0.6, lean: 0.25, hp: 0.3 }); pour.face(0, 'neutral', t);
      jar.updateWorldMatrix(true, false); const jp = jar.getWorldPosition(new THREE.Vector3());
      drops.forEach((d, i) => { const ph = (t * 2 + i / 12) % 1; d.position.set(jp.x - 0.05 - ph * 0.08, jp.y - ph * jp.y, jp.z + 0.02 * Math.sin(i)); });
      const hk = win(t, C.sable + 1.0, SC.rampes.start, 0.3, 0.3); fade(half, hk); half.position.set(0, 1.0, z + 0.2); half.lookAt(cam.position);
      camKeys(cam, t, [{ t: SC.traineau.start, p: [3.2, 2.0, z + 3.4], l: [0, 0.4, z + 1.2], f: 46 }, { t: C.sable - 0.5, p: [2.4, 1.3, z + 1.0], l: [0.3, 0.3, z + 0.9], f: 44 }, { t: C.sable + 0.5, p: [-1.6, 2.6, z - 0.6], l: [0, 0.4, z + 0.5], f: 48 }, { t: SC.rampes.start, p: [-1.6, 2.6, z - 0.6], l: [0, 0.4, z + 0.5], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- les rampes (hypotheses) puis la rampe de Hatnub
SETS.rampes = () => {
  const B = desert(); const { scene, cam } = B;
  const mk = (x, kind, c) => {
    const g = new THREE.Group(); g.position.set(x, 0, 0); scene.add(g);
    const p = pyramid({ layers: 12 }); p.scale.setScalar(0.3); p.userData.build(0.75); g.add(p);
    const mat = G(c, 1.1);
    if (kind === 0) { const r = L.beam([0, 0.02, 0.85], [0, 0.32, 0.3], 0.08, mat); g.add(r); }
    if (kind === 1) { for (let k = 0; k < 4; k++) g.add(L.beam([(k % 2 ? 0.24 : -0.24), 0.03 + k * 0.08, 0.38], [(k % 2 ? -0.24 : 0.24), 0.11 + k * 0.08, 0.38], 0.03, mat)); }
    if (kind === 2) { const pts = []; for (let k = 0; k <= 40; k++) { const a = k / 40 * Math.PI * 3, r = 0.38 - k / 40 * 0.28; pts.push(new THREE.Vector3(Math.sin(a) * r, k / 40 * 0.38, Math.cos(a) * r)); } g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.025, 4), mat)); }
    const lb = label(['droite ?', 'zigzag ?', 'spirale ?'][kind], { w: 0.5, h: 0.12, color: '#fff4dc', font: 'bold 110px Inter' }); lb.position.set(0, 0.62, 0.3); g.add(lb); g.userData.lb = lb;
    return g;
  };
  const opts = [mk(-0.9, 0, 0xffd070), mk(0, 1, 0x7dd8ff), mk(0.9, 2, 0xff9a6a)]; opts.forEach(g => g.scale.setScalar(0.9));
  // Hatnub : rampe raide entre deux escaliers bordes de poteaux
  const hat = new THREE.Group(); hat.position.set(0, 0, -6); scene.add(hat);
  const slope = 0.2; const len = 3.0;
  const ramp = box(0.8, 0.05, len, M(0xe8dcc4)); ramp.position.set(0, len * slope / 2, 0); ramp.rotation.x = Math.atan(slope); hat.add(ramp);
  for (const s of [-1, 1]) { for (let k = 0; k < 14; k++) { const z = -len / 2 + k * len / 14, y = (k + 0.5) * len * slope / 14; hat.add(at(box(0.4, 0.06, len / 14 * 0.9, M(0xd8ccb0)), s * 0.62, y, -z)); if (k % 2 === 0) hat.add(at(box(0.06, 0.4, 0.06, M(0x6a4a2a)), s * 0.42, y + 0.2, -z)); } }
  hat.add(at(box(3.4, 1.2, 0.4, M(0xc8bca0)), 0, 0.3, -len / 2 - 0.3));
  const hs = sledge(true, 0xf0ece0); hat.add(hs);
  const rig = claudeRig(scene, [1.6, 0, 1.6], -0.5, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28); rig.pr.visible = false;
  const K = cardsMgr(scene, cam);
  K('HYPOTHÈSES · le débat continue', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, SC.rampes.start + 2.0, C.hatnub, 0.3, 0.2), -0.55);
  K('2018 · carrière de Hatnub\nrampe à ≈ 20 % · escaliers · poteaux', { w: 1.6, h: 0.42, border: '#ff9a6a', small: true }, t => win(t, C.hatnub + 1.0, SC.nord.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.rampes.start;
      opts.forEach((g, i) => { fade(g.userData.lb, sstep(T0 + 1.5 + i * 1.2, T0 + 1.9 + i * 1.2, t)); g.userData.lb.lookAt(cam.position); g.rotation.y = 0.3 * Math.sin(t * 0.4 + i); });
      const u = ((t - C.hatnub) * 0.08) % 1; hs.position.set(0, (u * len - 0.0) * slope + 0.04, len / 2 - u * len); hs.rotation.x = -Math.atan(slope); hs.rotation.y = Math.PI;
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [0, 1.3, 4.4], l: [0, 0.3, 0], f: 46 }, { t: C.hatnub - 0.4, p: [0, 1.25, 4.2], l: [0, 0.3, 0], f: 46 }, { t: C.hatnub + 0.6, p: [2.4, 1.6, -2.6], l: [0, 0.4, -6.2], f: 46 }, { t: SC.nord.start, p: [2.2, 1.5, -3.0], l: [0, 0.4, -6.2], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- l'orientation vers le nord
SETS.nord = () => {
  const B = desert({ sky: [0x0a1430, 0x3a4a7a], hemi: [0xb0c0ff, 0x3a3020, 0.8], sunK: 0.8, sunPos: [3, 8, 4], fogC: 0x1a2440 }); const { scene, cam } = B;
  scene.add(L.stars(900, 200, 1.2));
  const p = pyramid(); p.userData.build(1); scene.add(p);
  const arrow = new THREE.Group(); scene.add(arrow);
  arrow.add(L.beam([0, 0.03, 1.6], [0, 0.03, -2.4], 0.04, G(0xff6a5a, 1.6))); const head = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 4), G(0xff6a5a, 1.6)); head.rotation.x = -Math.PI / 2; head.position.set(0, 0.03, -2.55); arrow.add(head);
  const nl = label('N', { w: 0.4, h: 0.4, color: '#ff8a7a', font: 'bold 300px Inter' }); nl.position.set(0, 0.35, -2.9); arrow.add(nl);
  const sky = new THREE.Group(); sky.position.set(0, 3.5, -6); scene.add(sky);
  const circ = []; for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.06), G(0xffffff, 2)); sky.add(s); circ.push([s, 0.6 + i * 0.25, i * 1.1]); }
  const trail = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.12, 64), new THREE.MeshBasicMaterial({ color: 0x9ab8ff, transparent: true, opacity: 0.3 })); sky.add(trail);
  const K = cardsMgr(scene, cam);
  K('230 m de côté\nnord : erreur < 0,1 degré', { w: 1.6, h: 0.42, border: '#ff8a7a', small: true }, t => win(t, SC.nord.start + 1.5, C.etoiles, 0.3, 0.2), -0.55);
  K('HYPOTHÈSES\nétoiles autour du pôle · ombre du soleil', { w: 1.6, h: 0.42, border: '#9ab8ff', small: true }, t => win(t, C.etoiles + 0.5, SC.parement.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.nord.start;
      fade(arrow, sstep(T0 + 0.8, T0 + 1.8, t)); nl.lookAt(cam.position);
      circ.forEach(([s, r, a0]) => s.position.set(Math.cos(a0 + t * 0.3) * r, Math.sin(a0 + t * 0.3) * r, 0)); fade(trail, sstep(C.etoiles, C.etoiles + 1, t)); trail.material.opacity = 0.3 * sstep(C.etoiles, C.etoiles + 1, t);
      camKeys(cam, t, [{ t: T0, p: [0.2, 6.0, 2.5], l: [0, 0, -0.3], f: 46 }, { t: C.etoiles - 0.3, p: [0.1, 5.5, 2.2], l: [0, 0, -0.5], f: 46 }, { t: C.etoiles + 1.0, p: [0.8, 0.6, 4.0], l: [0, 2.0, -5], f: 50 }, { t: SC.parement.start, p: [0.8, 0.6, 3.8], l: [0, 2.2, -5], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- le parement blanc ; la trace sur la planete
SETS.parement = () => {
  const B = desert({ sunPos: [6, 9, 6], sunK: 2.0 }); const { scene, cam } = B;
  const p = pyramid({ casing: 1 }); p.userData.build(1); scene.add(p);
  const quarries = []; for (let i = 0; i < 6; i++) { const q = box(1.2 + hash(i) * 0.8, 0.3, 0.9, M(0xb89a6a)); q.position.set(-4 + i * 1.6, -0.12, 4 + hash(i * 3) * 2); scene.add(q); quarries.push(q); }
  const water = L.makeWater(40, 20, 0x3a7aa0, { opacity: 0.9 }).mesh; water.scale.set(1, 1, 0.1); water.position.set(0, 0.03, 7.5); scene.add(water);
  const basin = new THREE.Mesh(new THREE.CircleGeometry(1.2, 24), M(0x3a7aa0)); basin.rotation.x = -Math.PI / 2; basin.position.set(2.8, 0.03, 4.5); scene.add(basin);
  scene.add(L.beam([2.8, 0.03, 4.5], [2.4, 0.03, 7.3], 0.3, M(0x3a7aa0)));
  for (let i = 0; i < 14; i++) scene.add(at(box(0.3, 0.2, 0.3, M(0xc8a878)), -3 + (i % 7) * 0.4, 0.1, 2.8 + Math.floor(i / 7) * 0.4));
  const K = cardsMgr(scene, cam);
  K('parement de calcaire blanc poli\nretiré après le séisme de 1303', { w: 1.6, h: 0.42, border: '#ffffff', small: true }, t => win(t, SC.parement.start + 2.0, C.planete, 0.3, 0.2), -0.55);
  K('≈ 6 millions de tonnes\ncarrières · port · canaux', { w: 1.6, h: 0.42, border: '#7dd8ff', small: true }, t => win(t, C.planete + 1.0, C.planete + 7.5, 0.3, 0.2), -0.55);
  K('Orion, « centre du monde » :\nidées non reconnues par les scientifiques', { w: 1.6, h: 0.42, border: '#ff8a7a', small: true }, t => win(t, C.planete + 7.7, SC.muons.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.parement.start;
      const ck = 1 - sstep(T0 + 9.5, T0 + 12.0, t); p.userData.case(ck); p.userData.layers.forEach(l => l.visible = ck < 0.98);
      camKeys(cam, t, [{ t: T0, p: [2.4, 0.5, 3.4], l: [0, 0.8, 0], f: 46 }, { t: T0 + 9.0, p: [3.0, 1.0, 3.2], l: [0, 0.7, 0], f: 46 }, { t: C.planete, p: [2.0, 1.2, 4.2], l: [0, 0.6, 0], f: 46 }, { t: C.planete + 2.0, p: [0, 9.0, 10.0], l: [0, 0, 3.0], f: 50 }, { t: SC.muons.start, p: [0, 9.5, 10.5], l: [0, 0, 3.0], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- les muons : la pyramide radiographiee
SETS.muons = () => {
  const B = base({ bg: 0x05070f, fog: [0x05070f, 10, 40], hemi: [0x8a9ac8, 0x14141c, 1.0], sun: [0xffffff, 1.0, [2, 5, 4]], shadow: false, bloom: [0.5, 0.5, 0.8] }); const { scene, cam } = B;
  scene.add(new THREE.GridHelper(40, 40, new THREE.Color(0xd99a57).multiplyScalar(0.8), new THREE.Color(0xd99a57).multiplyScalar(0.22)));
  const sec = new THREE.Group(); scene.add(sec); const S = 1.6;
  const tri = new THREE.Shape(); tri.moveTo(-S, 0); tri.lineTo(S, 0); tri.lineTo(0, S * 1.27); tri.lineTo(-S, 0);
  sec.add(new THREE.Mesh(new THREE.ShapeGeometry(tri), holoMat(0xffd070, 0.08)));
  sec.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-S, 0, 0), new THREE.Vector3(S, 0, 0), new THREE.Vector3(0, S * 1.27, 0)]), new THREE.LineBasicMaterial({ color: new THREE.Color(0xffd070).multiplyScalar(1.6) })));
  const gal = L.beam([-0.05, 0.35, 0.01], [0.35, 0.78, 0.01], 0.08, holoMat(0x7dd8ff, 0.6)); sec.add(gal);
  const king = at(box(0.3, 0.14, 0.02, holoMat(0x7dd8ff, 0.6)), 0.5, 0.86, 0.01); sec.add(king);
  const voidB = L.beam([-0.02, 0.55, 0.02], [0.42, 1.0, 0.02], 0.12, G(0xff6a5a, 1.2)); sec.add(voidB); voidB.material.transparent = true;
  const corr = at(box(0.3, 0.06, 0.02, G(0x7dffb0, 1.4)), -0.95, 0.42, 0.02); corr.rotation.z = 0.0; sec.add(corr); corr.material.transparent = true;
  const muons = []; for (let i = 0; i < 40; i++) { const m = L.beam([0, 0, 0], [0, -0.4, 0], 0.008, G(0xb0e0ff, 2)); scene.add(m); muons.push(m); }
  const lgal = label('Grande Galerie', { w: 0.8, h: 0.12, color: '#9adfff', font: 'bold 90px Inter' }); lgal.position.set(-0.55, 0.66, 0.05); scene.add(lgal);
  const lvoid = label('le grand vide (≥ 30 m)', { w: 0.9, h: 0.12, color: '#ff8a7a', font: 'bold 80px Inter' }); lvoid.position.set(0.2, 1.28, 0.05); scene.add(lvoid);
  const lcor = label('couloir caché', { w: 0.7, h: 0.12, color: '#7dffb0', font: 'bold 90px Inter' }); lcor.position.set(-0.75, 0.25, 0.05); scene.add(lcor);
  const rig = claudeRig(scene, [1.6, 0, 1.4], -0.5, [-0.45, 0, 0.1], 0x55e6ff, 0.45, 0.28); rig.pr.visible = false;
  const K = cardsMgr(scene, cam);
  K('2017 · ScanPyramids\nradiographie par muons', { w: 1.6, h: 0.42, border: '#9adfff', small: true }, t => win(t, SC.muons.start + 1.0, SC.muons.start + 6.0, 0.3, 0.2), -0.55);
  K('un vide d\'au moins 30 m\npersonne n\'y est jamais entré', { w: 1.6, h: 0.42, border: '#ff8a7a', small: true }, t => win(t, SC.muons.start + 6.5, C.couloir, 0.3, 0.2), -0.55);
  K('2023 · une caméra filme\nun couloir derrière la face nord', { w: 1.6, h: 0.42, border: '#7dffb0', small: true }, t => win(t, C.couloir + 0.8, SC.fin.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.muons.start;
      muons.forEach((m, i) => { const ph = (t * 0.6 + hash(i)) % 1; m.position.set((hash(i * 3) - 0.5) * 3.4, 3.2 - ph * 3.4, (hash(i * 7) - 0.5) * 0.6); m.visible = t < C.couloir; });
      fade(lgal, sstep(T0 + 3.0, T0 + 3.6, t)); fade(voidB, win(t, T0 + 6.0, 1000, 0.5, 0.1) * (0.6 + 0.4 * Math.sin(t * 4))); fade(lvoid, sstep(T0 + 6.5, T0 + 7.0, t));
      fade(corr, sstep(C.couloir + 0.5, C.couloir + 1.0, t) * (0.6 + 0.4 * Math.sin(t * 5))); fade(lcor, sstep(C.couloir + 0.8, C.couloir + 1.2, t));
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [0, 1.0, 4.2], l: [0, 0.8, 0], f: 48 }, { t: C.couloir, p: [0.2, 0.9, 3.6], l: [0.1, 0.75, 0], f: 48 }, { t: SC.fin.start, p: [-0.4, 0.7, 3.2], l: [-0.4, 0.6, 0], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- fin : coucher de soleil
SETS.fin = () => {
  const B = desert({ sky: [0x2a3a7a, 0xf8a060], sunPos: [-6, 2.5, -3], sunK: 1.8, fogC: 0xe8a070 }); const { scene, cam } = B;
  const p = pyramid(); p.userData.build(1); p.position.set(0, 0, -3); scene.add(p);
  const rig = claudeRig(scene, [0.2, 0, 1.0], 0.0, [0.45, 0, 0.0], 0xffd070, 0.45, 0.28);
  faceLight(scene, [0.3, 1.0, 2.4], 1.4, 0xfff0d8);
  const icons = ['2 300 000 blocs', 'la précision', 'le grand vide'].map((s, i) => { const l = label(s, { w: 0.6, h: 0.1, color: ['#ffd070', '#ff8a7a', '#7dd8ff'][i], font: 'bold 84px Inter' }); rig.holoG.add(l); l.position.set(0, 0.25 - i * 0.12, 0); return l; });
  return {
    ...B, update(t) {
      const T0 = SC.fin.start;
      const qk = sstep(T0 + 1.0, T0 + 1.5, t); beamOn(rig, qk, t);
      icons.forEach((l, i) => { fade(l, sstep(T0 + 1.5 + i * 1.0, T0 + 1.9 + i * 1.0, t)); l.lookAt(cam.position); });
      rig.c.update(t, env('claude', t), { wave: sstep(TL.duration - 2.0, TL.duration - 1.5, t) });
      camKeys(cam, t, [{ t: T0, p: [0.6, 1.0, 4.2], l: [0.3, 0.8, 0], f: 46 }, { t: TL.duration, p: [0.5, 0.95, 3.8], l: [0.3, 0.75, 0], f: 46 }]);
    }
  };
};

// ---------- couverture
SETS.cover = () => {
  const B = desert({ sky: [0x2a4a9a, 0xf8b070], sunPos: [-6, 3, 2], sunK: 2.0 }); const { scene, cam } = B;
  const p = pyramid({ layers: 30 }); p.userData.build(1); scene.add(p);
  const p2 = pyramid({ layers: 20 }); p2.scale.setScalar(0.9); p2.position.set(-3.0, 0, -3.6); p2.userData.build(1); scene.add(p2);
  return { ...B, update(t) { cam.position.set(2.0, 0.35, 3.4); cam.fov = 50; cam.updateProjectionMatrix(); cam.lookAt(-0.3, 1.0, 0); } };
};

const SHOTS = [
  ['intro', 0, SC.kheops.start], ['kheops', SC.kheops.start, SC.merer.start], ['merer', SC.merer.start, SC.traineau.start], ['traineau', SC.traineau.start, SC.rampes.start],
  ['rampes', SC.rampes.start, SC.nord.start], ['nord', SC.nord.start, SC.parement.start], ['parement', SC.parement.start, SC.muons.start], ['muons', SC.muons.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9],
];
