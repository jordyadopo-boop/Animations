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
function hall(scene, x0 = 0) {
  const g = new THREE.Group(); g.position.x = x0; scene.add(g);
  g.add(at(box(10, 0.1, 8, M(0x6a5a4a)), 0, -0.05, 0)); g.add(at(box(10, 5, 0.3, M(0xb8a888)), 0, 2.5, -2.2));
  for (const x of [-2.2, 2.2]) { g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 4, 10), M(0xd8ccb0)), x, 2, -1.6)); }
  const arch = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.18, 6, 24, Math.PI), M(0xd8ccb0)); arch.position.set(0, 4, -1.6); g.add(arch);
  return g;
}
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

// ---------- objets de l'episode
function vessel(s = 1) {
  const g = new THREE.Group();
  const prof = [[0.0, 0], [0.18, 0], [0.22, 0.05], [0.3, 0.2], [0.32, 0.38], [0.26, 0.55], [0.15, 0.66], [0.14, 0.72], [0.18, 0.76], [0.0, 0.76]].map(([x, y]) => new THREE.Vector2(x, y));
  const brass = M(0xb8862a, { emissive: new THREE.Color(0x2a1804) });
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 16), brass); g.add(body);
  const lid = new THREE.Group(); lid.position.y = 0.76; g.add(lid);
  lid.add(new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.04, 16), brass));
  const seal = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), G(0xffc060, 1.3)); seal.rotation.x = -Math.PI / 2; seal.position.y = 0.021; lid.add(seal);
  for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.TorusGeometry(0.31 - Math.abs(i - 1) * 0.03, 0.012, 4, 24), M(0x8a6420)); b.rotation.x = Math.PI / 2; b.position.y = 0.2 + i * 0.18; g.add(b); }
  g.scale.setScalar(s); g.userData = { lid, seal, brass, body }; g.traverse(m => { if (m.isMesh) m.castShadow = true; });
  return g;
}
// 72 esprits : petites lueurs ; k = 0 dispersees, 1 rassemblees au point (0,0,0)
function spirits(n = 72, R = 2.5) {
  const g = new THREE.Group(), cols = [0xff5a3a, 0xff9a3a, 0xc05aff, 0xff3a6a];
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), G(cols[i % 4], 2.2)); m.userData.d = new THREE.Vector3(hash(i * 3.1) - 0.5, hash(i * 5.3) * 0.8, hash(i * 7.7) - 0.5).normalize().multiplyScalar(R * (0.4 + 0.6 * hash(i * 9.1))); g.add(m); }
  g.userData.update = (t, k) => g.children.forEach((m, i) => { const sw = 1 - k; const a = t * (0.6 + hash(i) * 0.8) + i; const p = m.userData.d.clone().multiplyScalar(sw); p.x += Math.cos(a) * 0.25 * sw; p.z += Math.sin(a) * 0.25 * sw; p.y += 0.12 * Math.sin(a * 1.3) * sw; m.position.copy(p); m.visible = k < 0.995; });
  return g;
}
// pages du grimoire (sceau purement decoratif, invente)
function sealPage() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 720; const g = c.getContext('2d');
  g.fillStyle = '#e8dcbc'; g.fillRect(0, 0, 512, 720); g.strokeStyle = '#4a2a1a'; g.fillStyle = '#4a2a1a'; g.textAlign = 'center';
  g.font = 'bold 40px Inter'; g.fillText('ARS GOETIA', 256, 80);
  g.lineWidth = 4; for (const r of [150, 132, 70]) { g.beginPath(); g.arc(256, 330, r, 0, Math.PI * 2); g.stroke(); }
  for (let i = 0; i < 72; i++) { const a = i / 72 * Math.PI * 2; g.beginPath(); g.arc(256 + Math.cos(a) * 141, 330 + Math.sin(a) * 141, 3, 0, Math.PI * 2); g.fill(); }
  g.beginPath(); for (let i = 0; i <= 7; i++) { const a = i * 3 / 7 * Math.PI * 2 - Math.PI / 2; const x = 256 + Math.cos(a) * 70, y = 330 + Math.sin(a) * 70; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  g.font = 'italic 28px Inter'; g.fillText('Clavicula Salomonis', 256, 560);
  for (let k = 0; k < 3; k++) { g.fillStyle = 'rgba(74,42,26,0.25)'; g.fillRect(80, 600 + k * 30, 352 - k * 50, 10); }
  return canvasTex(c);
}
function listPage() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 720; const g = c.getContext('2d');
  g.fillStyle = '#e8dcbc'; g.fillRect(0, 0, 512, 720); g.fillStyle = '#3a2214'; g.textAlign = 'left';
  const L_ = ['1. Baël · roi', '2. Agarès · duc', '3. Vassago · prince', '4. Samigina · marquis', '5. Marbas · président', '…', '9. Paimon · roi', '…', '32. Asmodée · roi', '…', '68. Bélial · roi', '…', '72. Andromalius · comte'];
  L_.forEach((l, i) => { g.font = (l === '…' ? '28px' : 'bold 30px') + ' Inter'; g.fillText(l, 60, 80 + i * 48); });
  return canvasTex(c);
}
function demonCard(name, rank, legions, power) {
  const c = document.createElement('canvas'); c.width = 600; c.height = 840; const g = c.getContext('2d');
  g.fillStyle = 'rgba(20,8,12,0.9)'; g.strokeStyle = '#d4a24a'; g.lineWidth = 10; g.beginPath(); g.roundRect(8, 8, 584, 824, 30); g.fill(); g.stroke();
  g.lineWidth = 3; g.beginPath(); g.roundRect(32, 32, 536, 776, 20); g.stroke();
  g.textAlign = 'center'; g.fillStyle = '#ffd890'; let fsz = 82; g.font = `bold ${fsz}px Inter`; while (g.measureText(name).width > 500) { fsz -= 4; g.font = `bold ${fsz}px Inter`; } g.fillText(name, 300, 150);
  g.fillStyle = '#e8c8a0'; g.font = '600 46px Inter'; g.fillText(rank, 300, 220);
  g.strokeStyle = '#d4a24a'; g.lineWidth = 5; g.beginPath(); g.arc(300, 400, 110, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(300, 400, 80, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.beginPath(); g.moveTo(300 + Math.cos(a) * 80, 400 + Math.sin(a) * 80); g.lineTo(300 + Math.cos(a) * 110, 400 + Math.sin(a) * 110); g.stroke(); }
  g.fillStyle = '#ffd890'; g.font = 'bold 60px Inter'; g.fillText(legions, 300, 420);
  g.fillStyle = '#e8c8a0'; g.font = '600 26px Inter'; g.fillText('LÉGIONS', 300, 460);
  g.fillStyle = '#ffffff'; g.font = '600 38px Inter'; power.split('\n').forEach((l, i) => g.fillText(l, 300, 610 + i * 52));
  const t = canvasTex(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.84), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false, depthWrite: false })); return m;
}
function nightBase(o = {}) {
  return base({ bg: 0x07050c, fog: [0x07050c, 6, 22], hemi: [0xb0a0d0, 0x100a14, 0.6], sun: [0xd0d8ff, 0.6, [1, 5, 5]], shadowSize: 4, bloom: [0.6, 0.5, 0.8], exposure: 1.05, target: [0, 1, 0], ...o });
}

// ---------- intro : le vase, les 72 lueurs y entrent
SETS.intro = () => {
  const B = nightBase(); const { scene, cam } = B;
  scene.add(at(box(10, 0.1, 10, M(0x1a141c)), 0, -0.05, 0));
  scene.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.8, 8), M(0x3a3038)), 0, 0.4, 0));
  const v = vessel(1); v.position.y = 0.8; scene.add(v);
  const sp = spirits(72, 3); sp.position.set(0, 1.2, 0); scene.add(sp);
  const glow = new THREE.PointLight(0xffa040, 2, 4, 1.5); glow.position.set(0, 1.8, 0.6); scene.add(glow);
  const dt = dust(scene, 50, 0, 1.4, 0, 2.0, 0xffc080);
  return {
    ...B, update(t) {
      dt(t); const k = sstep(1.0, 5.6, t); sp.userData.update(t, k); sp.position.y = 1.2 + 0.4 * (1 - k);
      v.userData.seal.material.color.setHex(0xffc060).multiplyScalar(1 + 1.5 * sstep(5.2, 5.8, t)); v.rotation.y = t * 0.15;
      glow.intensity = 1.5 + 2 * sstep(5.2, 5.8, t);
      camKeys(cam, t, [{ t: 0, p: [0, 1.9, 4.0], l: [0, 1.3, 0], f: 48 }, { t: 5.5, p: [0.2, 1.5, 2.4], l: [0, 1.2, 0], f: 46 }, { t: SC.grimoire.start, p: [0.3, 1.6, 2.6], l: [0, 1.2, 0], f: 46 }]);
    }
  };
};

// ---------- le grimoire
SETS.grimoire = () => {
  const B = base({ bg: 0x0a0806, fog: [0x0a0806, 5, 14], hemi: [0xffe0c0, 0x1a1008, 0.5], sun: [0xffe0b0, 0.5, [0, 6, 1]], shadowSize: 3, bloom: [0.5, 0.5, 0.82], exposure: 1.1, target: [0, 0.9, 0] });
  const { scene, cam } = B;
  scene.add(at(box(8, 0.1, 8, M(0x2a1e18)), 0, -0.05, 0));
  scene.add(at(box(1.2, 0.06, 0.8, M(0x4a3222)), 0, 0.8, 0)); for (const [x, z] of [[-0.55, -0.35], [0.55, -0.35], [-0.55, 0.35], [0.55, 0.35]]) scene.add(at(box(0.06, 0.8, 0.06, M(0x3a2414)), x, 0.4, z));
  const book = openBook(sealPage(), listPage(), 0.48); book.traverse(m => { if (m.isMesh && m.material.map) m.material.color.setScalar(0.7); }); book.position.set(0, 0.84, 0); scene.add(book);
  const candles = [-0.45, 0.45].map(x => { const c = new THREE.Group(); c.position.set(x, 0.83, -0.25); scene.add(c); c.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 8), M(0xf0e6cc)), 0, 0.11, 0)); const f = at(new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.06, 6), G(0xffb040, 2.6)), 0, 0.26, 0); c.add(f); const l = new THREE.PointLight(0xffa050, 1.6, 3, 1.4); l.position.set(x, 1.15, -0.1); scene.add(l); return [f, l]; });
  const dt = dust(scene, 50, 0, 1.2, 0, 1.0, 0xffd0a0);
  const rig = claudeRig(scene, [0.85, 0, 0.8], -0.5, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28);
  faceLight(scene, [0.6, 0.7, 1.9], 1.2);
  const parts = ['1. Ars Goetia', '2. Theurgia-Goetia', '3. Ars Paulina', '4. Ars Almadel', '5. Ars Notoria'].map((s, i) => { const l = label(s, { w: 0.6, h: 0.09, color: i ? '#c8b090' : '#ffd070', font: 'bold 80px Inter' }); l.position.set(0, 0.42 - i * 0.1, 0); rig.holoG.add(l); return l; });
  const K = cardsMgr(scene, cam);
  K('Lemegeton · la Petite Clé de Salomon', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, SC.grimoire.start + 0.8, SC.grimoire.start + 5.0, 0.3, 0.2), -0.6);
  K('goêteia (grec ancien) = sorcellerie', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, SC.grimoire.start + 5.6, C.fiches, 0.3, 0.2), -0.6);
  const tpl = demonCard('NOM', 'rang', '?', 'apparence · pouvoirs\n+ un sceau'); scene.add(tpl);
  K('sceau dessiné pour la vidéo (décoratif)', { w: 1.2, h: 0.18, border: '#888888', color: '#cccccc' }, t => win(t, C.fiches + 4.0, C.date, 0.3, 0.2), -0.75, 0.5);
  K('manuscrits anglais du XVIIe siècle\n(conservés à la British Library)', { w: 1.6, h: 0.42, border: '#e0b070', small: true }, t => win(t, C.date + 0.4, SC.salomon.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const tk = win(t, C.fiches + 0.2, C.fiches + 4.0, 0.4, 0.4); tpl.visible = tk > 0.01; tpl.material.opacity = tk; { const dir = new THREE.Vector3(); cam.getWorldDirection(dir); tpl.position.copy(cam.position).addScaledVector(dir, 1.55); tpl.quaternion.copy(cam.quaternion); }
      dt(t); const T0 = SC.grimoire.start; candles.forEach(([f, l], i) => { f.scale.y = 1 + 0.2 * Math.sin(t * 13 + i); l.intensity = 1.5 + 0.3 * Math.sin(t * 11 + i); });
      const pk = win(t, T0 + 1.0, T0 + 5.5, 0.4, 0.3); beamOn(rig, pk, t); parts.forEach((l, i) => { fade(l, pk * sstep(T0 + 1.2 + i * 0.5, T0 + 1.5 + i * 0.5, t)); l.lookAt(cam.position); });
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [0.5, 1.4, 2.8], l: [0.3, 1.0, 0.3], f: 46 }, { t: T0 + 5.5, p: [0.5, 1.4, 2.7], l: [0.3, 1.0, 0.3], f: 46 }, { t: C.fiches, p: [0.0, 1.5, 1.6], l: [0, 1.1, 0.0], f: 44 }, { t: C.fiches + 4.0, p: [-0.16, 1.5, 0.9], l: [-0.14, 0.86, 0.0], f: 42 }, { t: C.fiches + 7.0, p: [-0.16, 1.5, 0.85], l: [-0.14, 0.86, 0.0], f: 42 }, { t: C.fiches + 8.2, p: [0.16, 1.5, 0.9], l: [0.15, 0.86, 0.0], f: 42 }, { t: C.date - 0.2, p: [0.16, 1.5, 0.9], l: [0.15, 0.86, 0.0], f: 42 }, { t: C.date + 0.8, p: [0.0, 1.7, 2.2], l: [0, 0.95, 0], f: 46 }, { t: SC.salomon.start, p: [0.0, 1.7, 2.1], l: [0, 0.95, 0], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- Salomon, l'anneau, le Temple ; le vase
SETS.salomon = () => {
  const B = base({ bg: 0x2a1e14, fog: [0x2a1e14, 10, 34], hemi: [0xffe8c8, 0x3a2a18, 0.9], sun: [0xffe0b0, 1.5, [2, 6, 7]], shadowSize: 6, bloom: [0.5, 0.5, 0.85], exposure: 1.0, target: [0, 1, 0] });
  const { scene, cam } = B;
  scene.add(at(box(30, 0.1, 30, M(0xc8a878)), 0, -0.05, 0));
  // chantier du Temple
  for (let i = 0; i < 6; i++) { const x = -2.4 + (i % 3) * 2.4 * 0 + (i < 3 ? -1.6 : 1.6), z = -3 - (i % 3) * 1.8; const h = 2.2 + hash(i) * 1.6; scene.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, h, 10), M(0xe8dcc0)), x, h / 2, z)); }
  scene.add(at(box(4.5, 0.5, 2.5, M(0xd8c8a0)), 0, 0.25, -5)); scene.add(at(box(3.5, 1.4, 0.4, M(0xd8c8a0)), 0, 1.2, -6.1));
  const blocks = []; for (let i = 0; i < 4; i++) { const b = box(0.5, 0.35, 0.4, M(0xd8c8a0)); scene.add(b); blocks.push(b); }
  const workers = [0, 1, 2, 3].map(i => { const h = new Human({ holo: 0x9a3aff, hairStyle: 'bald', seed: 3700 + i }); h.root.traverse(m => { if (m.isMesh && m.material && m.material.blending === THREE.AdditiveBlending) m.material.opacity = 0.25; }); scene.add(h.root); return h; });
  const sol = new Human({ skin: 0xc89060, hair: 0x2a1a10, hairStyle: 'long', beard: 'long', top: 0xf0e8d8, bottom: 0xf0e8d8, robe: 0x6a2a8a, robeL: 0.85, hat: 'crown', seed: 3710 });
  sol.place(0, 0, 0.6, 0); scene.add(sol.root);
  faceLight(scene, [0.2, 1.8, 2.2], 1.6, 0xfff0d8, 5);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.01, 6, 12), G(0xffd070, 2.5)); sol.hand.R.add(ring); ring.position.set(0, -0.04, 0.05);
  const rl = new THREE.PointLight(0xffd070, 0, 1.5, 1.5); sol.hand.R.add(rl);
  const v = vessel(0.45); scene.add(v);
  const sp = spirits(72, 2.2); scene.add(sp);
  const K = cardsMgr(scene, cam);
  K('le Testament de Salomon\ntexte ancien (Ier – Ve siècle)', { w: 1.6, h: 0.42, border: '#e0b070', small: true }, t => win(t, SC.salomon.start + 1.0, SC.salomon.start + 5.0, 0.3, 0.2), -0.6);
  K('selon les textes · légende', { w: 1.0, h: 0.22, border: '#ffd070', color: '#ffe0a0' }, t => win(t, SC.salomon.start + 5.2, SC.babylone.start, 0.3, 0.2), -0.75, 0.45);
  return {
    ...B, update(t) {
      const T0 = SC.salomon.start, V = C.vase;
      const raise = sstep(T0 + 1.5, T0 + 2.5, t) * (1 - sstep(V - 0.6, V, t));
      sol.pose({ aR: [1.6 * raise + 0.1, 0.25], eR: 0.3, aL: [0.15 + 0.45 * sstep(V - 0.4, V + 0.4, t), 0.35], eL: 0.2 }); sol.face(0, 'serious', t);
      ring.material.color.setHex(0xffd070).multiplyScalar(1 + 2 * raise); rl.intensity = 2 * raise;
      const wk = sstep(T0 + 3.0, T0 + 4.0, t) * (1 - sstep(V - 0.5, V, t));
      workers.forEach((h, i) => { const x = -2.2 + i * 1.45, z = -1.6 - (i % 2) * 0.8; const ph = t * 3 + i; h.place(x + 0.15 * Math.sin(t * 0.8 + i), 0, z, 0.3 - i * 0.2); h.pose(L.walkPose(ph, 0.6, { aL: [1.5, 0.2], aR: [1.5, 0.2], eL: 0.3, eR: 0.3 })); fade(h.root, wk * 0.9); const hp = new THREE.Vector3(); h.hand.L.getWorldPosition(hp); blocks[i].position.set(x + 0.15 * Math.sin(t * 0.8 + i), hp.y + 0.2, z + 0.25); blocks[i].visible = wk > 0.05; });
      // le vase dans la main gauche ; les esprits y rentrent
      const vk = sstep(V - 0.3, V + 0.2, t); v.visible = vk > 0.01; const hp = new THREE.Vector3(); sol.hand.L.getWorldPosition(hp); v.position.set(hp.x + 0.12, hp.y - 0.32, hp.z + 0.12);
      const sk = sstep(V + 0.3, V + 4.0, t); sp.visible = t > V; sp.position.set(v.position.x, v.position.y + 0.3, v.position.z); sp.userData.update(t, sk);
      camKeys(cam, t, [{ t: T0, p: [0.3, 1.7, 3.0], l: [0, 1.45, 0.4], f: 46 }, { t: T0 + 3.0, p: [0.2, 2.1, 5.6], l: [0, 1.2, -1.2], f: 50 }, { t: V - 0.4, p: [0.2, 2.0, 5.4], l: [0, 1.2, -1.2], f: 50 }, { t: V + 0.6, p: [0.4, 1.4, 3.0], l: [0.1, 1.2, 0.5], f: 46 }, { t: SC.babylone.start, p: [0.4, 1.4, 2.9], l: [0.1, 1.2, 0.5], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- Babylone : le vase brise
SETS.babylone = () => {
  const B = nightBase({ hemi: [0x8a9ad8, 0x0a0a14, 0.7], sun: [0xc8d4ff, 0.9, [-2, 5, 5]] }); const { scene, cam } = B;
  const water = L.makeWater(40, 60, 0x1a2a4a, { emissive: 0x050a18 }); water.mesh.position.set(0, 0, -6); scene.add(water.mesh);
  scene.add(at(box(12, 0.4, 4, M(0x4a3a2a)), 0, 0.0, 1.5));
  const moon = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 2), G(0xe8eeff, 1.3)); moon.position.set(-4, 6, -18); scene.add(moon);
  const v = vessel(0.6); v.position.set(0, 0.2, 0.6); scene.add(v);
  const men = [[-0.75, 0.6, 0.6], [0.8, 0.4, -0.5]].map(([x, z, ry], i) => { const h = new Human({ skin: 0xb07850, hair: 0x1a1210, hairStyle: i ? 'short' : 'curly', beard: 'full', top: [0x8a6a3a, 0x5a6a8a][i], bottom: 0x4a3a2a, robe: [0x8a6a3a, 0x5a6a8a][i], robeL: 0.7, seed: 3720 + i }); h.place(x, 0.2, z, ry); scene.add(h.root); return h; });
  const stone = box(0.18, 0.14, 0.14, M(0x6a6a6a)); scene.add(stone);
  faceLight(scene, [0, 1.6, 2.6], 1.6, 0xd8e0ff, 5);
  const sp = spirits(72, 4); scene.add(sp);
  const flash = new THREE.PointLight(0xff8a40, 0, 6, 1.5); flash.position.set(0, 1.0, 1.0); scene.add(flash);
  const shards = []; for (let i = 0; i < 10; i++) { const s = box(0.08, 0.1, 0.02, M(0xb8862a)); scene.add(s); shards.push(s); }
  const K = cardsMgr(scene, cam);
  K('selon la légende de la Goetia', { w: 1.0, h: 0.22, border: '#ffd070', color: '#ffe0a0' }, t => win(t, SC.babylone.start + 0.5, SC.cour.start, 0.3, 0.2), -0.75, 0.45);
  return {
    ...B, update(t) {
      const T0 = SC.babylone.start, tb = T0 + 5.5; water.update(t, 0.12);
      const lift = sstep(T0 + 3.8, T0 + 4.8, t) * (1 - sstep(tb - 0.1, tb + 0.1, t));
      men[0].pose({ aR: [0.3 + 2.4 * lift, 0.2], eR: 0.3, aL: [0.5, 0.2], eL: 0.6, lean: 0.25 * (1 - lift) }); men[0].face(0, 'joy', t);
      men[1].pose(L.kneelPose({ aL: [0.9, 0.1], aR: [0.9, 0.1], eL: 0.5, eR: 0.5, lean: 0.2 })); men[1].root.position.y = 0.2; men[1].face(0, 'awe', t);
      const hp = new THREE.Vector3(); men[0].hand.R.getWorldPosition(hp); stone.position.copy(hp); stone.visible = t < tb + 0.1;
      const br = t > tb; v.visible = !br; shards.forEach((s, i) => { s.visible = br && t < tb + 3; const u = t - tb; s.position.set(0 + Math.cos(i) * u * 0.8, 0.5 + u * 1.2 - 2 * u * u, 0.6 + Math.sin(i * 2) * u * 0.6); s.rotation.set(u * 5 + i, u * 4, 0); });
      flash.intensity = 6 * win(t, tb, tb + 1.2, 0.05, 0.8);
      const k = br ? sstep(tb, tb + 3.5, t) : 0; sp.visible = br; sp.position.set(0, 0.6 + 2.5 * k, 0.6); sp.userData.update(t, 1 - k);
      camKeys(cam, t, [{ t: T0, p: [0.3, 2.0, 5.8], l: [0, 0.8, -1], f: 48 }, { t: T0 + 3.5, p: [0.1, 1.5, 4.4], l: [0, 0.9, 0.4], f: 48 }, { t: tb + 0.5, p: [0.2, 1.6, 4.4], l: [0, 1.6, 0.4], f: 50 }, { t: SC.cour.start, p: [0.2, 1.9, 5.0], l: [0, 2.6, 0], f: 52 }]);
      K.update(t);
    }
  };
};

// ---------- la cour des 72 : rangs et fiches
SETS.cour = () => {
  const B = studioBase({ bg: 0x0a0610, fog: [0x0a0610, 8, 30], hemi: [0xd0b8e8, 0x14101a, 0.9] }); const { scene, cam } = B;
  const rig = claudeRig(scene, [0.0, 0, 0.9], 0, [0.45, 0, 0.1], 0xffd070, 0.5, 0.3);
  faceLight(scene, [0, 0.6, 2.4], 1.2);
  const ranks = ['ROIS', 'DUCS', 'PRINCES', 'MARQUIS', 'PRÉSIDENTS', 'COMTES', 'CHEVALIER'];
  const pyr = new THREE.Group(); pyr.position.set(0, 1.0, -0.6); scene.add(pyr);
  const tiers = ranks.map((r, i) => { const g = new THREE.Group(); g.position.y = 1.5 - i * 0.24; pyr.add(g); g.add(holo(new THREE.BoxGeometry(0.5 + i * 0.22, 0.18, 0.3), [0xffd070, 0xff9a6a, 0xc08aff][i % 3], 0.12)); const l = label(r, { w: 1.0, h: 0.13, color: '#ffffff', font: 'bold 90px Inter' }); l.position.z = 0.17; g.add(l); return g; });
  const cards = [['BAËL', 'roi · à l\'est', '66', 'rendrait\ninvisible'], ['AGARÈS', 'duc', '31', 'enseignerait\ntoutes les langues'], ['VASSAGO', 'prince', '26', 'révélerait le passé\net l\'avenir'], ['PAIMON', 'roi', '200', 'enseignerait\narts et sciences'], ['ASMODÉE', 'roi · n° 32', '72', 'trois têtes :\ntaureau, homme, bélier'], ['BÉLIAL', 'roi · n° 68', '80', 'sur un char\nde feu'], ['STOLAS', 'prince · n° 36', '26', 'oiseau de nuit\nétoiles et plantes'], ['ANDROMALIUS', 'comte · le 72e', '36', 'ferait rendre\nles objets volés']].map(a => { const m = demonCard(...a); scene.add(m); return m; });
  const D = (C.asmodee - C.autres) / 3;
  const times = [C.bael, C.autres, C.autres + D, C.autres + 2 * D, C.asmodee, C.belial, C.belial + 5.3, C.andro];
  const K = cardsMgr(scene, cam);
  K('Livre de Tobie : l\'archange Raphaël\nchasse le démon Asmodée', { w: 1.6, h: 0.42, border: '#9adfff', small: true }, t => win(t, C.asmodee + 4.5, C.belial, 0.3, 0.2), -0.6);
  K('selon le texte de la Goetia', { w: 1.0, h: 0.22, border: '#ffd070', color: '#ffe0a0' }, t => win(t, C.bael, C.asmodee + 4.3, 0.3, 0.2) + win(t, C.belial, SC.wier.start, 0.3, 0.2), -0.75, 0.45);
  return {
    ...B, update(t) {
      const T0 = SC.cour.start;
      tiers.forEach((g, i) => { const k = sstep(T0 + 0.8 + i * 0.7, T0 + 1.2 + i * 0.7, t) * (1 - sstep(C.bael - 0.5, C.bael, t)); fade(g, k); g.rotation.y = 0.15 * Math.sin(t * 0.6 + i); });
      beamOn(rig, sstep(T0 + 0.5, T0 + 1.0, t), t); rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [0.0, 1.9, 3.1], l: [0, 1.85, -0.6], f: 48 }, { t: C.bael - 0.5, p: [0.0, 1.9, 3.0], l: [0, 1.85, -0.6], f: 48 }, { t: C.bael, p: [0.2, 1.4, 3.6], l: [0, 1.1, 0], f: 48 }, { t: SC.wier.start, p: [0.2, 1.4, 3.4], l: [0, 1.1, 0], f: 48 }]);
      cards.forEach((m, i) => { const a = times[i], b = i < times.length - 1 ? times[i + 1] : SC.wier.start; const k = win(t, a, b, 0.35, 0.3); m.visible = k > 0.01; m.material.opacity = k; const dir = new THREE.Vector3(); cam.getWorldDirection(dir); m.position.copy(cam.position).addScaledVector(dir, 1.55).add(new THREE.Vector3(0, 0.08 + 0.02 * Math.sin(t * 2), 0)); m.quaternion.copy(cam.quaternion); m.rotateY(0.3 * (1 - sstep(a, a + 0.6, t))); });
      K.update(t);
    }
  };
};

// ---------- 1577 : Jean Wier
SETS.wier = () => {
  const B = base({ bg: 0x0a0806, fog: [0x0a0806, 6, 20], hemi: [0xffe0c0, 0x1a1008, 0.7], sun: [0xfff0d8, 0.8, [1, 5, 5]], shadowSize: 3, bloom: [0.6, 0.5, 0.82], exposure: 1.0 }); const { scene, cam } = B;
  const st = study(scene, [0, 0, 0]);
  const wi = new Human({ skin: 0xe8c0a0, hair: 0x5a4a3a, hairStyle: 'short', beard: 'long', top: 0x1a1416, bottom: 0x1a1416, robe: 0x1a1416, robeL: 0.8, hat: 'cap', hatColor: 0x1a1a1a, seed: 3730 });
  wi.place(0, 0, -0.45, 0); scene.add(wi.root);
  const bk = new THREE.Group(); bk.position.set(0.05, 0.84, 0.3); scene.add(bk); bk.add(box(0.36, 0.05, 0.26, M(0x5a2a1a))); const bl = label('De praestigiis daemonum', { w: 0.34, h: 0.05, color: '#ffd070', font: 'bold 70px Inter' }); bl.rotation.x = -Math.PI / 2; bl.position.y = 0.03; bk.add(bl);
  faceLight(scene, [0.2, 1.6, 0.9], 1.6, 0xffd8a8);
  const rig = claudeRig(scene, [1.1, 0, 0.9], -0.45, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28);
  const n69 = label('69', { w: 0.4, h: 0.2, color: '#ffd070', font: 'bold 220px Inter' }); n69.position.set(-0.15, 0.25, 0); rig.holoG.add(n69);
  const n72 = label('→ 72', { w: 0.6, h: 0.2, color: '#ff8a6a', font: 'bold 200px Inter' }); n72.position.set(0.2, 0.0, 0); rig.holoG.add(n72);
  const K = cardsMgr(scene, cam);
  K('JEAN WIER (Johann Weyer)\nmédecin · 1515 – 1588', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.wier.start + 2.6, SC.wier.start + 7.5, 0.3, 0.2), -0.6);
  K('« Pseudomonarchia daemonum »\nannexe de son livre, édition de 1577', { w: 1.6, h: 0.42, border: '#e0b070', small: true }, t => win(t, SC.wier.start + 7.7, C.sorcieres, 0.3, 0.2), -0.6);
  K('1563 · « De praestigiis daemonum » :\nbeaucoup d\'accusées sont malades, pas coupables', { w: 1.6, h: 0.42, border: '#9adfff', small: true }, t => win(t, C.sorcieres + 0.4, C.ironie, 0.3, 0.2), -0.6);
  K('4 esprits ajoutés, 1 retiré', { w: 1.6, h: 0.24, border: '#ff8a6a' }, t => win(t, C.ironie + 0.4, SC.pop.start, 0.3, 0.2), -0.6);
  imagined(K, 'scène imaginée', SC.wier.start + 2.4, C.ironie);
  return {
    ...B, update(t) {
      st.userData.tick(t); const T0 = SC.wier.start;
      wi.pose(L.sitPose(0.5, { aL: [1.0, 0.1], aR: [1.05 + 0.05 * Math.sin(t * 6), 0.15], eL: 0.9, eR: 1.0, hp: 0.3 })); wi.face(0, 'serious', t);
      const hk = win(t, C.ironie - 0.3, SC.pop.start, 0.4, 0.3); beamOn(rig, hk, t); fade(n69, hk); fade(n72, sstep(C.ironie + 0.5, C.ironie + 1.0, t) * hk); n69.lookAt(cam.position); n72.lookAt(cam.position);
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [0.4, 1.6, 3.4], l: [0.0, 1.1, -0.2], f: 44 }, { t: T0 + 4.0, p: [0.3, 1.55, 2.5], l: [0.0, 1.25, -0.45], f: 44 }, { t: C.ironie - 0.4, p: [0.35, 1.55, 2.6], l: [0.0, 1.25, -0.45], f: 44 }, { t: C.ironie + 0.6, p: [0.45, 1.35, 3.5], l: [0.6, 1.0, 0.7], f: 44 }, { t: SC.pop.start, p: [0.45, 1.35, 3.4], l: [0.6, 1.0, 0.7], f: 44 }]);
      K.update(t);
    }
  };
};

// ---------- aujourd'hui : jeux, series, mangas
SETS.pop = () => {
  const B = studioBase({ bg: 0x080810, hemi: [0xd0d8ff, 0x14141c, 0.9] }); const { scene, cam } = B;
  const rig = claudeRig(scene, [0.0, 0, 0.9], 0, [0.45, 0, 0.1], 0x9adfff, 0.5, 0.3);
  faceLight(scene, [0, 0.6, 2.4], 1.2);
  const scr = [['SÉRIE ANIMÉE', 0x9adfff, -0.72], ['JEUX PERSONA', 0xff8a6a, 0.0], ['GENSHIN IMPACT', 0xc08aff, 0.72]].map(([s, c, x], i) => { const g = new THREE.Group(); g.position.set(x, 1.9, -0.6); g.rotation.y = -x * 0.35; scene.add(g); g.add(holo(new THREE.BoxGeometry(0.66, 0.45, 0.04), c, 0.15)); const l = label(s, { w: 0.66, h: 0.12, color: '#' + new THREE.Color(c).getHexString(), font: 'bold 100px Inter' }); l.position.set(0, 0.38, 0.03); g.add(l); return g; });
  const names = ['STOLAS · PAIMON', 'BÉLIAL · ASMODÉE', 'PAIMON'].map((s, i) => { const l = label(s, { w: 0.64, h: 0.13, color: '#ffffff', font: 'bold 80px Inter' }); scr[i].add(l); l.position.set(0, 0, 0.04); return l; });
  const K = cardsMgr(scene, cam);
  K('1904 · traduction de S. L. MacGregor Mathers\npubliée par Aleister Crowley', { w: 1.6, h: 0.42, border: '#9adfff', small: true }, t => win(t, SC.pop.start + 0.6, SC.pop.start + 4.3, 0.3, 0.2), -0.6);
  K('Helluva Boss · Persona · Genshin Impact', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, SC.pop.start + 4.6, SC.fin.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.pop.start; beamOn(rig, sstep(T0 + 3.5, T0 + 4.0, t), t);
      scr.forEach((g, i) => { fade(g, sstep(T0 + 4.5 + i * 2.6, T0 + 5.0 + i * 2.6, t)); g.position.y = 1.9 + 0.04 * Math.sin(t * 1.5 + i); });
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [0.0, 1.5, 4.4], l: [0, 1.4, 0], f: 50 }, { t: SC.fin.start, p: [0.0, 1.5, 4.2], l: [0, 1.4, 0], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- fin : le vase brise et Claude
SETS.fin = () => {
  const B = nightBase(); const { scene, cam } = B;
  scene.add(at(box(10, 0.1, 10, M(0x1a141c)), 0, -0.05, 0));
  scene.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.8, 8), M(0x3a3038)), -0.7, 0.4, -0.5));
  const v = vessel(0.9); v.position.set(-0.7, 0.8, -0.5); v.rotation.z = 0.15; scene.add(v); v.userData.lid.position.set(0.35, -0.6, 0.2); v.userData.lid.rotation.z = 1.2;
  const sp = spirits(72, 3); sp.position.set(-0.7, 2.2, -0.5); scene.add(sp);
  const rig = claudeRig(scene, [0.5, 0, 0.7], -0.2, [0.45, 0, 0.1], 0xffd070, 0.5, 0.3);
  faceLight(scene, [0.4, 0.6, 2.3], 1.3);
  const qm = label('?', { w: 0.3, h: 0.3, color: '#ffd070', font: 'bold 300px Inter' }); rig.holoG.add(qm);
  return {
    ...B, update(t) {
      sp.userData.update(t, 0); const qk = sstep(SC.fin.start + 5.0, SC.fin.start + 5.5, t); beamOn(rig, qk, t); fade(qm, qk); qm.lookAt(cam.position);
      rig.c.update(t, env('claude', t), { wave: sstep(TL.duration - 2.0, TL.duration - 1.5, t) });
      camKeys(cam, t, [{ t: SC.fin.start, p: [0.2, 1.4, 4.4], l: [0, 1.0, 0], f: 48 }, { t: TL.duration, p: [0.2, 1.3, 3.9], l: [0, 0.95, 0.2], f: 48 }]);
    }
  };
};

// ---------- couverture : le vase et les 72 lueurs qui s'echappent
SETS.cover = () => {
  const B = nightBase({ bloom: [0.8, 0.5, 0.7] }); const { scene, cam } = B;
  scene.add(at(box(10, 0.1, 10, M(0x1a141c)), 0, -0.05, 0));
  scene.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.8, 8), M(0x3a3038)), 0, 0.4, 0));
  const v = vessel(1); v.position.y = 0.8; scene.add(v); v.userData.lid.position.set(0.3, 1.05, 0.1); v.userData.lid.rotation.set(0.5, 0, 0.5);
  const sp = spirits(72, 1.6); sp.position.set(0, 1.75, 0); scene.add(sp); sp.userData.update(2.0, 0.1);
  const glow = new THREE.PointLight(0xffa040, 4, 4, 1.5); glow.position.set(0, 1.9, 0.6); scene.add(glow);
  return { ...B, update() { cam.position.set(0, 1.2, 3.6); cam.fov = 56; cam.updateProjectionMatrix(); cam.lookAt(0, 0.65, 0); } };
};

const SHOTS = [['intro', 0, SC.grimoire.start], ['grimoire', SC.grimoire.start, SC.salomon.start], ['salomon', SC.salomon.start, SC.babylone.start], ['babylone', SC.babylone.start, SC.cour.start], ['cour', SC.cour.start, SC.wier.start], ['wier', SC.wier.start, SC.pop.start], ['pop', SC.pop.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
