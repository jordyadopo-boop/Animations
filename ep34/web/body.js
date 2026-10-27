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
function pview(pg, u, v, frac, fov = 40, side = 0) {
  const w = pg.userData.w, h = pg.userData.h;
  const lp = new THREE.Vector3((u - 0.5) * w, (0.5 - v) * h, 0); const d = frac * h / 2 / Math.tan(fov * Math.PI / 360);
  pg.updateWorldMatrix(true, false);
  const P = pg.localToWorld(new THREE.Vector3(lp.x + side * d, lp.y, d)), Lk = pg.localToWorld(lp.clone());
  return { p: [P.x, P.y, P.z], l: [Lk.x, Lk.y, Lk.z], f: fov };
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


// ---------- le tableau (Francesco Botticini, L'Assomption de la Vierge, vers 1475-1476 - domaine public)
const PT = await new THREE.TextureLoader().loadAsync('/assets/botticini.jpg'); PT.colorSpace = THREE.SRGBColorSpace; PT.anisotropy = 8;
const PW = 3.0, PH = PW * PT.image.height / PT.image.width;
function painting() {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ map: PT, toneMapped: false, color: new THREE.Color(0.9, 0.9, 0.9) });
  g.add(at(new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), mat), 0, 0, 0.012));
  const fm = M(0x8a6a2a, { emissive: new THREE.Color(0x2a1a06) }); const t = 0.14;
  for (const [x, y, w, h] of [[0, PH / 2 + t / 2, PW + 2 * t, t], [0, -PH / 2 - t / 2, PW + 2 * t, t], [PW / 2 + t / 2, 0, t, PH], [-PW / 2 - t / 2, 0, t, PH]]) g.add(at(box(w, h, 0.08, fm), x, y, 0.0));
  g.userData = { w: PW, h: PH, mat };
  return g;
}
const uvp = (u, v, z = 0.03) => new THREE.Vector3((u - 0.5) * PW, (0.5 - v) * PH, z);
// trace lumineux qui se dessine progressivement
function stroke(pts, color = 0xffd070, r = 0.008) {
  const curve = new THREE.CatmullRomCurve3(pts.map(([u, v]) => uvp(u, v)));
  const geo = new THREE.TubeGeometry(curve, 80, r, 5);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.6), transparent: true, depthWrite: false, toneMapped: false }));
  m.renderOrder = 5; m.userData.n = geo.index.count;
  m.userData.draw = (k, op = 1) => { geo.setDrawRange(0, Math.floor(m.userData.n * clamp(k, 0, 1) / 3) * 3); m.material.opacity = op; m.visible = k > 0.005 && op > 0.01; };
  return m;
}
function ringAt(u, v, r, color = 0xffd070, th = 0.012) {
  const m = new THREE.Mesh(new THREE.RingGeometry(r, r + th, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.6), transparent: true, depthWrite: false, toneMapped: false }));
  m.position.copy(uvp(u, v)); m.renderOrder = 5; return m;
}
function arrowHead(u, v, ang, color = 0xffd070, s = 1) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(0.05 * s, 0.12 * s, 3), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.6), transparent: true, depthWrite: false, toneMapped: false }));
  m.position.copy(uvp(u, v)); m.rotation.z = ang; m.renderOrder = 5; return m;
}
function versePage(lines) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 720; const g = c.getContext('2d');
  g.fillStyle = '#efe4c8'; g.fillRect(0, 0, 512, 720); g.fillStyle = '#3a2a1a'; g.textAlign = 'center';
  lines.forEach((l, i) => { g.font = i === 0 ? 'bold 40px Inter' : '32px Inter'; g.fillText(l, 256, 110 + i * 62); });
  for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(58,42,26,0.25)'; g.fillRect(70, 470 + k * 34, 372 - (k % 3) * 40, 10); }
  return canvasTex(c);
}
const CREDIT = '« L\'Assomption de la Vierge » · Francesco Botticini, vers 1475-1476 · National Gallery, Londres';


// ---------- la salle et le tableau
SETS.gal = () => {
  const B = base({ bg: 0x06070c, fog: [0x06070c, 6, 18], hemi: [0xe8ecff, 0x0c0a10, 0.35], sun: [0xffe8d0, 0.35, [1, 5, 4]], shadow: false, bloom: [0.4, 0.5, 0.92], exposure: 1.0 });
  const { scene, cam } = B;
  scene.add(at(box(14, 0.1, 10, M(0x1e1a1c)), 0, -0.05, 2)); scene.add(at(box(14, 6, 0.2, M(0x1a2440)), 0, 3, -0.2));
  const pg = painting(); pg.position.set(0, 1.75, 0); scene.add(pg);
  const spot = new THREE.SpotLight(0xffeedd, 6, 8, 0.6, 0.6, 1.0); spot.position.set(0, 4.2, 2.5); spot.target = pg; scene.add(spot);
  const dt = dust(scene, 60, 0, 1.6, 1.2, 2.2, 0xffe0b0);
  const rig = claudeRig(scene, [1.0, 0, 2.1], -0.35, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28);
  faceLight(scene, [0.8, 0.7, 3.0], 1.0);
  // hologramme : trois etages de trois
  const tiers = new THREE.Group(); rig.holoG.add(tiers);
  [0xff8a6a, 0xffd070, 0x9adfff].forEach((c, i) => { for (let k = 0; k < 3; k++) tiers.add(at(holo(new THREE.TorusGeometry(0.06 + 0.035 * k, 0.006, 4, 32), c, 0.5), 0, 0.28 - i * 0.18, 0)); });
  tiers.children.forEach(m => m.rotation.x = Math.PI / 2.4);
  const lQ = label('?', { w: 0.3, h: 0.3, color: '#ffd070', font: 'bold 300px Inter' }); rig.holoG.add(lQ);
  // reperes
  const O = (o) => { pg.add(o); return o; };
  const christ = O(ringAt(0.5, 0.11, 0.25, 0xffd070));
  const t1 = O(stroke([[0.12, 0.3], [0.3, 0.2], [0.5, 0.17], [0.7, 0.2], [0.88, 0.3]], 0xff8a6a, 0.008));
  const t2 = O(stroke([[0.05, 0.42], [0.25, 0.36], [0.5, 0.34], [0.75, 0.36], [0.95, 0.42]], 0xffd070, 0.008));
  const t3 = O(stroke([[0.03, 0.55], [0.25, 0.53], [0.5, 0.52], [0.75, 0.53], [0.97, 0.55]], 0x9adfff, 0.008));
  const tomb = O(ringAt(0.165, 0.86, 0.13, 0xffffff));
  const K = cardsMgr(scene, cam);
  K(CREDIT, { w: 1.6, h: 0.12, border: '#607090', color: '#e0e4f0' }, t => t > 0.2 && t < TL.duration + 1 ? 0.85 : 0, -0.88, 0.8);
  const names = [['SÉRAPHINS · CHÉRUBINS · TRÔNES', '#ff8a6a'], ['DOMINATIONS · VERTUS · PUISSANCES', '#ffd070'], ['PRINCIPAUTÉS · ARCHANGES · ANGES', '#9adfff']];
  const D = (C.botticini - SC.choeurs.start - 1.0) / 3.4;
  names.forEach(([s, c], i) => K(s, { w: 1.6, h: 0.26, border: c, color: c }, t => win(t, SC.choeurs.start + 0.3 + i * D, SC.choeurs.start + 0.3 + (i + 1) * D + (i === 2 ? 0.6 : 0), 0.3, 0.2), -0.55));
  K('trois triades · neuf chœurs', { w: 1.6, h: 0.28, border: '#ffffff' }, t => win(t, SC.choeurs.start + 0.6 + 3 * D, C.botticini, 0.3, 0.2), -0.55);
  K('FRANCESCO BOTTICINI\nFlorence · vers 1475-1476', { w: 1.6, h: 0.42, border: '#e0b070', small: true }, t => win(t, C.botticini + 0.3, SC.livre.start, 0.3, 0.2), 0.15);
  K('commande de Matteo Palmieri\n(à genoux, à gauche)', { w: 1.6, h: 0.42, border: '#e0b070', small: true }, t => win(t, C.botticini + 3.2, SC.livre.start, 0.3, 0.2), -0.55);
  const V = (u, v, f) => pview(pg, u, v, f, 40);
  const FULL = (t) => ({ t, ...V(0.5, 0.5, 2.95) });
  const WIDE = (t, k = 0) => ({ t, p: [0.3 + k, 1.3, 6.9], l: [0.4, 1.15, 1.8], f: 46 });
  return {
    ...B, update(t) {
      dt(t); pg.updateWorldMatrix(true, true);
      const T1 = SC.choeurs.start;
      camKeys(cam, t, [
        { t: 0, ...V(0.5, 0.12, 0.35) }, { t: 3.5, ...V(0.5, 0.25, 0.75) }, { t: 6.5, ...V(0.5, 0.4, 1.4) }, FULL(C.title - 0.3), FULL(T1),
        { t: T1 + 0.3, ...V(0.5, 0.2, 0.55) }, { t: T1 + 0.3 + D, ...V(0.42, 0.24, 0.5) }, { t: T1 + 0.3 + D * 1.2, ...V(0.5, 0.37, 0.5) }, { t: T1 + 0.3 + D * 2, ...V(0.58, 0.38, 0.48) }, { t: T1 + 0.3 + D * 2.2, ...V(0.5, 0.52, 0.5) }, { t: T1 + 0.3 + D * 3, ...V(0.42, 0.53, 0.48) }, FULL(C.botticini - 0.5),
        { t: C.botticini + 3.0, ...V(0.4, 0.75, 1.2) }, { t: SC.livre.start - 0.3, ...V(0.22, 0.8, 0.75) },
        WIDE(SC.fin.start), WIDE(C.question - 0.5, 0.05), FULL(C.question + 0.6), { t: TL.duration, ...V(0.5, 0.3, 1.6) }]);
      fade(christ, win(t, 0.6, 3.5, 0.4, 0.4));
      const ik = (i) => win(t, T1 + 0.3 + i * D, C.botticini, 0.2, 0.4);
      t1.userData.draw(sstep(T1 + 0.4, T1 + 1.6, t), ik(0)); t2.userData.draw(sstep(T1 + 0.4 + D, T1 + 1.6 + D, t), ik(1)); t3.userData.draw(sstep(T1 + 0.4 + 2 * D, T1 + 1.6 + 2 * D, t), ik(2));
      fade(tomb, win(t, C.botticini + 2.8, SC.livre.start, 0.3, 0.3));
      const fk = win(t, SC.fin.start + 0.3, C.question + 0.4, 0.4, 0.3); beamOn(rig, fk, t); fade(tiers, fk); tiers.rotation.y = t * 0.5; fade(lQ, sstep(SC.fin.start + 4.0, SC.fin.start + 4.5, t) * fk); lQ.position.set(0.25, 0.35, 0); lQ.lookAt(cam.position);
      rig.c.update(t, env('claude', t), { wave: sstep(TL.duration - 2.0, TL.duration - 1.5, t) });
      spot.intensity = t > SC.fin.start ? lerp(6, 4.0, sstep(SC.fin.start, TL.duration, t)) : 6;
      K.update(t);
    }
  };
};

// ---------- le livre : La Hierarchie celeste ; Actes 17, 34
SETS.livre = () => {
  const B = base({ bg: 0x06070a, fog: [0x06070a, 5, 14], hemi: [0xd8e0ff, 0x101014, 0.4], sun: [0xe8eeff, 0.6, [0, 6, 1]], shadowSize: 3, bloom: [0.5, 0.5, 0.82], exposure: 1.1, target: [0, 0.9, 0] });
  const { scene, cam } = B;
  scene.add(at(box(8, 0.1, 8, M(0x1e1e24)), 0, -0.05, 0));
  const lect = new THREE.Group(); scene.add(lect);
  lect.add(at(box(0.2, 0.95, 0.2, M(0x3a2a1e)), 0, 0.47, 0)); lect.add(at(box(0.5, 0.06, 0.5, M(0x3a2a1e)), 0, 0.03, 0));
  const top = new THREE.Group(); top.position.set(0, 1.0, 0); top.rotation.x = 0.4; lect.add(top);
  top.add(at(box(0.66, 0.04, 0.46, M(0x4a3222)), 0, -0.02, 0));
  const book = openBook(versePage(['La Hiérarchie céleste', 'Περὶ τῆς οὐρανίας', 'ἱεραρχίας', '', 'signé : Denys'], ), versePage(['Actes 17, 34', '« Quelques-uns', 's\'attachèrent à lui', 'et crurent,', 'Denys l\'aréopagite… »']), 0.42); top.add(book);
  const sp = new THREE.SpotLight(0xe8eeff, 8, 8, 0.4, 0.5, 1.0); sp.position.set(0, 5.5, 0.3); sp.target = lect; scene.add(sp);
  const dt = dust(scene, 60, 0, 1.6, 0, 1.0, 0xe0e8ff);
  // saint Paul a Athenes (hologramme) et Claude
  const rig = claudeRig(scene, [0.75, 0, 0.8], -0.5, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28);
  faceLight(scene, [0.5, 0.7, 1.8], 1.2);
  const paul = new Human({ holo: 0xffd070, robe: 0xffffff, robeL: 0.8, hairStyle: 'bald', beard: 'long', seed: 3401 }), den = new Human({ holo: 0x9adfff, robe: 0xffffff, robeL: 0.8, hairStyle: 'short', beard: 'full', seed: 3402 });
  paul.root.scale.setScalar(0.22); den.root.scale.setScalar(0.22); paul.place(-0.12, -0.2, 0, 0.5); den.place(0.12, -0.2, 0, -0.5); rig.holoG.add(paul.root, den.root);
  const K = cardsMgr(scene, cam);
  K('selon les textes', { w: 1.0, h: 0.22, border: '#ffd070', color: '#ffe0a0' }, t => win(t, C.temoin - 2.0, SC.abbaye.start, 0.3, 0.2), -0.75, 0.45);
  K('Denys l\'Aréopagite\nconverti à Athènes par saint Paul', { w: 1.6, h: 0.42, border: '#9adfff', small: true }, t => win(t, C.temoin + 0.3, SC.abbaye.start, 0.3, 0.2), -0.52);
  return {
    ...B, update(t) {
      dt(t);
      const T0 = SC.livre.start;
      camKeys(cam, t, [{ t: T0, p: [0.0, 1.9, 2.6], l: [0, 1.1, 0], f: 44 }, { t: T0 + 1.5, p: [-0.13, 1.62, 0.95], l: [-0.11, 1.0, 0.0], f: 40 }, { t: T0 + 5.5, p: [-0.13, 1.62, 0.92], l: [-0.11, 1.0, 0.0], f: 40 }, { t: T0 + 6.6, p: [0.14, 1.62, 0.92], l: [0.12, 1.0, 0.0], f: 40 }, { t: C.temoin - 0.2, p: [0.15, 1.62, 0.96], l: [0.12, 1.0, 0.0], f: 40 }, { t: C.temoin + 0.6, p: [0.5, 1.2, 3.2], l: [0.5, 0.9, 0.6], f: 44 }, { t: SC.abbaye.start, p: [0.45, 1.2, 3.1], l: [0.5, 0.9, 0.6], f: 44 }]);
      const hk = win(t, C.temoin + 0.2, SC.abbaye.start, 0.4, 0.3); beamOn(rig, hk, t); fade(paul.root, hk * 0.6); fade(den.root, hk * 0.6);
      paul.pose({ aR: [1.2, 0.3], eR: 0.4 }); den.pose({ aL: [0.6, 0.1], aR: [0.6, 0.1], eL: 1.2, eR: 1.2 });
      rig.c.update(t, env('claude', t), {});
      K.update(t);
    }
  };
};

// ---------- 827 : le manuscrit offert a Louis le Pieux ; l'abbe Hilduin
function hall(scene, x0 = 0) {
  const g = new THREE.Group(); g.position.x = x0; scene.add(g);
  g.add(at(box(10, 0.1, 8, M(0x6a5a4a)), 0, -0.05, 0)); g.add(at(box(10, 5, 0.3, M(0xb8a888)), 0, 2.5, -2.2));
  for (const x of [-2.2, 2.2]) { g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 4, 10), M(0xd8ccb0)), x, 2, -1.6)); }
  const arch = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.18, 6, 24, Math.PI), M(0xd8ccb0)); arch.position.set(0, 4, -1.6); g.add(arch);
  return g;
}
SETS.abbaye = () => {
  const B = base({ bg: 0x14100c, fog: [0x14100c, 7, 22], hemi: [0xffe8d0, 0x2a2018, 0.8], sun: [0xffe0b0, 1.2, [1, 5, 6]], shadowSize: 4, bloom: [0.5, 0.5, 0.85], exposure: 1.05, target: [0, 1, 0] });
  const { scene, cam } = B;
  // la cour de Louis le Pieux
  hall(scene, 0);
  scene.add(at(box(1.2, 0.3, 0.8, M(0x7a2a2a)), 0, 0.15, -1.2)); const throne = at(box(0.8, 1.4, 0.2, M(0x8a6a2a)), 0, 1.0, -1.55); scene.add(throne);
  const louis = new Human({ skin: 0xe8c0a0, hair: 0x5a3a20, hairStyle: 'short', beard: 'full', top: 0x3a3a8a, bottom: 0x2a2a5a, robe: 0x5a2a8a, robeL: 0.8, hat: 'crown', seed: 3410 });
  louis.place(0, 0.3, -1.1, 0); scene.add(louis.root);
  const env_ = new Human({ skin: 0xd8a880, hair: 0x1a1210, hairStyle: 'short', beard: 'full', top: 0x9a7a2a, bottom: 0x6a4a1a, robe: 0xc89a3a, robeL: 0.85, hat: 'cap', hatColor: 0x8a1a1a, seed: 3411 });
  env_.place(0.75, 0, 0.0, -1.1); scene.add(env_.root);
  const codex = new THREE.Group(); codex.add(box(0.22, 0.28, 0.06, M(0x8a1a1a, { emissive: new THREE.Color(0x200404) }))); codex.add(at(box(0.16, 0.2, 0.065, G(0xffc040, 0.9)), 0, 0, 0.001)); scene.add(codex);
  faceLight(scene, [0.3, 1.8, 1.4], 1.6, 0xfff0d8, 5);
  // l'abbaye : Hilduin (a l'ecart)
  const ab = hall(scene, 40);
  const hil = new Human({ skin: 0xe0b890, hair: 0x6a5a4a, hairStyle: 'bald', top: 0x2a2018, bottom: 0x2a2018, robe: 0x2a2018, robeL: 0.85, seed: 3412 }); hil.place(40, 0, 0, 0); scene.add(hil.root);
  const codex2 = new THREE.Group(); codex2.add(box(0.22, 0.28, 0.06, M(0x8a1a1a))); codex2.add(at(box(0.16, 0.2, 0.065, G(0xffc040, 0.9)), 0, 0, 0.001)); hil.hand.R.add(codex2); codex2.position.set(0, -0.08, 0.08); codex2.rotation.x = -0.5;
  // hologramme : saint Denis, martyr de Paris (portant sa tete selon la legende ? non : simple aureole)
  const rig = claudeRig(scene, [41.0, 0, 0.2], -0.35, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28);
  const dn = new Human({ holo: 0xffd070, robe: 0xffffff, robeL: 0.8, hairStyle: 'short', beard: 'full', seed: 3413 }); dn.root.scale.setScalar(0.22); dn.place(0, -0.2, 0, 0); rig.holoG.add(dn.root);
  const halo = holo(new THREE.TorusGeometry(0.05, 0.006, 4, 24), 0xffd070, 0.6); halo.position.set(0, 0.2, -0.01); rig.holoG.add(halo);
  const eq = label('Denys d\'Athènes = saint Denis ?', { w: 0.9, h: 0.1, color: '#ffd070', font: 'bold 70px Inter' }); eq.position.set(0, 0.32, 0); rig.holoG.add(eq);
  faceLight(scene, [40.3, 1.8, 1.4], 1.6, 0xfff0d8, 5);
  const K = cardsMgr(scene, cam);
  K('l\'ambassade de l\'empereur Michel II\nreçue par Louis le Pieux', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.abbaye.start + 3.0, SC.abbaye.start + 7.4, 0.3, 0.2), -0.55);
  K('ce manuscrit grec existe toujours\n(Bibliothèque nationale de France)', { w: 1.6, h: 0.42, border: '#e0b070', small: true }, t => win(t, SC.abbaye.start + 7.6, C.hilduin, 0.3, 0.2), -0.55);
  K('l\'abbé Hilduin · vers 835', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, C.hilduin + 0.3, SC.gothique.start, 0.3, 0.2), -0.55);
  imagined(K, 'scène imaginée', SC.abbaye.start + 2.6, SC.gothique.start);
  return {
    ...B, update(t) {
      const T0 = SC.abbaye.start, give = sstep(T0 + 3.5, T0 + 5.5, t);
      louis.pose(L.sitPose(0.0, { py: 0.88 - 0.42 + 0.0, aL: [0.3 + 0.7 * give, 0.15], eL: 0.6 * give, aR: [0.2, 0.15] })); louis.root.position.y = 0.3; louis.face(0, 'happy', t);
      env_.pose({ aL: [0.9 - 0.2 * give, 0.1], aR: [0.9 - 0.2 * give, 0.1], eL: 0.8, eR: 0.8, lean: 0.1 }); env_.face(0, 'neutral', t);
      env_.root.position.set(lerp(1.2, 0.72, sstep(T0, T0 + 3.5, t)), 0, lerp(0.5, -0.15, sstep(T0, T0 + 3.5, t))); env_.root.rotation.y = -1.25;
      const hp = new THREE.Vector3(); env_.hand.L.getWorldPosition(hp); const lp = new THREE.Vector3(); louis.hand.L.getWorldPosition(lp);
      codex.position.copy(hp).lerp(lp, give).add(new THREE.Vector3(0, 0.05, 0.05)); codex.rotation.set(0, -0.6 + 0.6 * give, 0);
      hil.pose({ aR: [0.9, 0.15], eR: 0.9, aL: [0.4 + 0.5 * env('claude', t), 0.3], eL: 0.6 }); hil.face(0, 'serious', t);
      const dk = win(t, C.hilduin + 0.5, SC.gothique.start, 0.4, 0.3); beamOn(rig, dk, t); fade(dn.root, dk * 0.6); fade(halo, dk); fade(eq, sstep(C.hilduin + 1.2, C.hilduin + 1.6, t) * dk); eq.lookAt(cam.position); dn.pose({});
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [0.2, 2.2, 5.2], l: [0, 1.2, -0.6], f: 46 }, { t: T0 + 3.4, p: [-0.3, 1.7, 3.2], l: [0.3, 1.1, -0.6], f: 44 }, { t: T0 + 6.0, p: [-0.4, 1.6, 2.8], l: [0.25, 1.15, -0.7], f: 42 }, { t: C.hilduin - 0.3, p: [-0.45, 1.6, 2.8], l: [0.25, 1.15, -0.7], f: 42 },
        { t: C.hilduin - 0.2, p: [40.6, 1.55, 2.4], l: [40.3, 1.25, 0], f: 44 }, { t: C.hilduin + 1.0, p: [40.4, 1.5, 3.8], l: [40.4, 1.05, 0.0], f: 46 }, { t: SC.gothique.start, p: [40.4, 1.5, 3.7], l: [40.4, 1.05, 0.0], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- XIIe siecle : Suger et la lumiere de Saint-Denis
SETS.gothique = () => {
  const B = base({ bg: 0x0a0a12, fog: [0x0a0a12, 8, 26], hemi: [0xc8d0ff, 0x1a1820, 0.5], sun: [0xfff0d8, 0.5, [0, 6, 6]], shadow: false, bloom: [0.5, 0.5, 0.8], exposure: 1.05 });
  const { scene, cam } = B;
  scene.add(at(box(10, 0.1, 30, M(0x8a8478)), 0, -0.05, -8));
  const stone = M(0xc8c0b0);
  const cols = [0x2a4aff, 0xff3a3a, 0xffc040, 0x3aff8a, 0xa04aff];
  for (let i = 0; i < 6; i++) {
    const z = 2 - i * 3.2;
    for (const s of [-1, 1]) {
      scene.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 6, 8), stone), s * 2.2, 3, z));
      // arc brise
      for (const k of [-1, 1]) { const a = box(0.16, 2.6, 0.2, stone); a.position.set(s * 2.2 + (k < 0 ? 0 : 0), 6.9, z + k * 0.75); a.rotation.x = -k * 0.55; scene.add(a); }
      // vitrail
      const vg = new THREE.Group(); vg.position.set(s * 3.2, 3.6, z - 1.6); vg.rotation.y = -s * Math.PI / 2; scene.add(vg);
      for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) vg.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.5), G(cols[(i + r * 2 + c) % 5], 1.3)), (c - 1) * 0.37, (r - 2.5) * 0.53, 0));
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.8, 3), G(cols[i % 5], 1.0)); tip.position.y = 1.95; vg.add(tip);
      scene.add(at(box(0.3, 4.6, 1.5, stone), s * 3.3, 3.6, z - 1.6)).children;
      // rayon de lumiere coloree
      const ray = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.9, 5.5, 8, 1, true), new THREE.MeshBasicMaterial({ color: cols[(i + 1) % 5], transparent: true, opacity: 0.022, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      ray.position.set(s * 1.8, 2.0, z - 1.6); ray.rotation.z = s * 0.75; scene.add(ray);
    }
  }
  for (let i = 0; i < 6; i++) scene.add(at(box(4.6, 0.25, 0.25, stone), 0, 8.0, 2 - i * 3.2));
  // l'abbe Suger
  const sug = new Human({ skin: 0xe0b890, hair: 0x8a7a6a, hairStyle: 'bald', top: 0x1a1a1a, bottom: 0x1a1a1a, robe: 0x1a1a1a, robeL: 0.85, seed: 3420 }); sug.place(0, 0, -1.0, 0); scene.add(sug.root);
  faceLight(scene, [0, 1.8, 0.8], 1.8, 0xfff0d8, 5);
  const rig = claudeRig(scene, [1.0, 0, 0.6], -0.4, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28);
  const books = new THREE.Group(); rig.holoG.add(books);
  const bT = holo(new THREE.BoxGeometry(0.16, 0.22, 0.05), 0xffd070, 0.3), bD = holo(new THREE.BoxGeometry(0.16, 0.22, 0.05), 0x9adfff, 0.3); bT.position.set(-0.13, 0.05, 0); bD.position.set(0.13, 0.05, 0); books.add(bT, bD);
  const lT = label('Thomas d\'Aquin', { w: 0.6, h: 0.1, color: '#ffd070', font: 'bold 80px Inter' }), lD = label('Dante', { w: 0.6, h: 0.1, color: '#9adfff', font: 'bold 80px Inter' }); lT.position.set(-0.15, 0.25, 0); lD.position.set(0.17, 0.25, 0); books.add(lT, lD);
  const K = cardsMgr(scene, cam);
  K('basilique de Saint-Denis\nchœur gothique consacré en 1144', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.gothique.start + 1.0, SC.gothique.start + 4.6, 0.3, 0.2), -0.55);
  K('lien avec Denys : interprétation\ndiscutée par les historiens', { w: 1.6, h: 0.42, border: '#9aa4c8', small: true }, t => win(t, SC.gothique.start + 4.8, C.thomas, 0.3, 0.2), -0.55);
  K('Somme théologique · XIIIe s.\nLa Divine Comédie, Paradis, chant XXVIII', { w: 1.6, h: 0.42, border: '#9adfff', small: true }, t => win(t, C.thomas + 0.6, SC.valla.start, 0.3, 0.2), -0.55);
  imagined(K, 'scène imaginée', SC.gothique.start + 0.3, SC.gothique.start + 4.6);
  return {
    ...B, update(t) {
      const T0 = SC.gothique.start;
      sug.pose({ aL: [0.6 + 0.6 * sstep(T0 + 1, T0 + 2.5, t), 0.5], aR: [0.6 + 0.6 * sstep(T0 + 1, T0 + 2.5, t), 0.5], eL: 0.3, eR: 0.3, hp: -0.25 * sstep(T0 + 2, T0 + 4, t) }); sug.face(0, 'awe', t);
      const bk = win(t, C.thomas + 0.2, SC.valla.start, 0.4, 0.3); beamOn(rig, bk, t); fade(books, bk); books.rotation.y = 0.3 * Math.sin(t); lT.lookAt(cam.position); lD.lookAt(cam.position);
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [0, 1.2, 5.5], l: [0, 2.8, -6], f: 50 }, { t: T0 + 4.5, p: [0.2, 1.4, 2.6], l: [0, 1.7, -2], f: 48 }, { t: C.thomas - 0.2, p: [0.3, 1.4, 2.6], l: [0, 1.5, -2], f: 48 }, { t: C.thomas + 0.8, p: [0.4, 1.3, 3.4], l: [0.5, 0.95, 0.5], f: 46 }, { t: SC.valla.start, p: [0.4, 1.3, 3.3], l: [0.5, 0.95, 0.5], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- 1457 : Lorenzo Valla doute ; vers l'an 500
function study(scene, pos, o = {}) {
  const g = new THREE.Group(); g.position.set(...pos); scene.add(g);
  g.add(at(box(6, 0.1, 6, M(0x5a3a22)), 0, 0, 0)); g.add(at(box(6, 4, 0.2, M(0xc8b090)), 0, 2, -1.6));
  const win_ = at(box(1.0, 1.3, 0.05, new THREE.MeshBasicMaterial({ color: 0x9ac0e8 })), 1.4, 2.0, -1.48); g.add(win_);
  const desk = at(box(1.6, 0.08, 0.8, M(0x5a3a22)), 0, 0.78, 0.2); g.add(desk);
  for (const [x, z] of [[-0.7, -0.15], [0.7, -0.15], [-0.7, 0.55], [0.7, 0.55]]) g.add(at(box(0.07, 0.76, 0.07, M(0x3a2414)), x, 0.38, z));
  for (let i = 0; i < 3; i++) g.add(at(box(0.3, 0.08, 0.22, M([0x6a2a1a, 0x2a3a5a, 0x4a3a1a][i])), -0.55, 0.86 + i * 0.08, 0.2));
  const candle = new THREE.Group(); candle.position.set(-0.5, 0.82, 0.45); g.add(candle);
  candle.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8), M(0xf0e8d0)), 0, 0.1, 0));
  const flame = at(new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 6), G(0xffc040, 3)), 0, 0.24, 0); candle.add(flame);
  const cl = new THREE.PointLight(0xffb060, 1.5, 5, 1.4); cl.position.set(-0.4, 1.2, 0.8); g.add(cl);
  g.userData.tick = (t) => { flame.scale.y = 1 + 0.2 * Math.sin(t * 13); cl.intensity = 1.4 + 0.4 * Math.sin(t * 11); };
  return g;
}
SETS.valla = () => {
  const B = base({ bg: 0x0a0806, fog: [0x0a0806, 6, 20], hemi: [0xffe0c0, 0x1a1008, 0.7], sun: [0xfff0d8, 0.8, [1, 5, 5]], shadowSize: 3, bloom: [0.6, 0.5, 0.82], exposure: 1.0 }); const { scene, cam } = B;
  const st = study(scene, [0, 0, 0]);
  const val = new Human({ skin: 0xe0b090, hair: 0x3a2a1a, hairStyle: 'short', top: 0x1a1416, bottom: 0x1a1416, robe: 0x2a2a5a, robeL: 0.8, hat: 'cap', hatColor: 0x7a1a1e, seed: 3430 });
  val.place(0, 0, -0.45, 0); scene.add(val.root);
  const ms = new THREE.Group(); ms.position.set(0.05, 0.84, 0.3); scene.add(ms); ms.add(at(box(0.42, 0.02, 0.3, M(0xf0e4c0)), 0, 0, 0)); ms.add(at(box(0.01, 0.025, 0.3, M(0x8a6a4a)), 0, 0.002, 0));
  faceLight(scene, [0.2, 1.6, 0.9], 1.6, 0xffd8a8);
  const rig = claudeRig(scene, [1.1, 0, 0.9], -0.45, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28);
  const q = label('?', { w: 0.3, h: 0.3, color: '#ff8a7a', font: 'bold 300px Inter' }); rig.holoG.add(q);
  const y500 = label('≈ 500', { w: 0.6, h: 0.2, color: '#ffd070', font: 'bold 200px Inter' }); rig.holoG.add(y500);
  const tl = new THREE.Group(); rig.holoG.add(tl); tl.add(L.beam([-0.35, -0.12, 0], [0.35, -0.12, 0], 0.01, holoMat(0xffd070, 0.7)));
  const ticks = [['50', -0.3, '#9adfff'], ['500', -0.05, '#ffd070'], ['1457', 0.3, '#ff8a7a']].map(([s, x, c]) => { const l = label(s, { w: 0.3, h: 0.08, color: c, font: 'bold 80px Inter' }); l.position.set(x, -0.2, 0); tl.add(l); tl.add(at(new THREE.Mesh(new THREE.OctahedronGeometry(0.02), G(new THREE.Color(c).getHex(), 1.5)), x, -0.12, 0)); return l; });
  const K = cardsMgr(scene, cam);
  K('LORENZO VALLA\nhumaniste italien · 1407 – 1457', { w: 1.6, h: 0.42, border: '#ff8a7a', small: true }, t => win(t, SC.valla.start + 2.8, C.an500, 0.3, 0.2), -0.55);
  K('« Pseudo-Denys » : un auteur inconnu\nproche du philosophe grec Proclus', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, C.an500 + 1.0, SC.fin.start, 0.3, 0.2), 0.12);
  imagined(K, 'scène imaginée', SC.valla.start + 2.6, C.an500);
  return {
    ...B, update(t) {
      st.userData.tick(t); const T0 = SC.valla.start;
      const doubt = sstep(T0 + 4.5, T0 + 5.5, t);
      val.pose(L.sitPose(0.5, { aL: [1.0, 0.1], aR: [1.0 + 0.6 * doubt, 0.15], eL: 0.9, eR: 1.0 + 0.9 * doubt, hp: 0.35 * (1 - doubt), hy: 0.0 })); val.face(0, doubt > 0.5 ? 'serious' : 'neutral', t);
      const qk = win(t, T0 + 4.5, C.an500, 0.3, 0.3), yk = win(t, C.an500 + 0.3, SC.fin.start, 0.4, 0.3);
      beamOn(rig, Math.max(qk, yk), t); fade(q, qk); q.lookAt(cam.position); fade(y500, yk * (1 - sstep(C.an500 + 4.0, C.an500 + 4.4, t))); y500.position.set(0, 0.32, 0.05); y500.lookAt(cam.position);
      fade(tl, sstep(C.an500 + 4.2, C.an500 + 4.6, t) * yk); ticks.forEach(l => l.lookAt(cam.position));
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [0.4, 1.6, 3.4], l: [0.0, 1.1, -0.2], f: 44 }, { t: T0 + 4.2, p: [0.25, 1.45, 1.7], l: [0.0, 1.35, -0.45], f: 42 }, { t: C.an500 - 0.3, p: [0.3, 1.45, 1.8], l: [0.0, 1.35, -0.45], f: 42 }, { t: C.an500 + 0.6, p: [0.45, 1.35, 3.5], l: [0.6, 1.0, 0.7], f: 44 }, { t: SC.fin.start, p: [0.45, 1.35, 3.4], l: [0.6, 1.0, 0.7], f: 44 }]);
      K.update(t);
    }
  };
};

const SHOTS = [['gal', 0, SC.livre.start], ['livre', SC.livre.start, SC.abbaye.start], ['abbaye', SC.abbaye.start, SC.gothique.start], ['gothique', SC.gothique.start, SC.valla.start], ['valla', SC.valla.start, SC.fin.start], ['gal', SC.fin.start, 1000]];
