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


// ---------- le tableau (Alexandre Cabanel, L'Ange dechu, 1847 - domaine public)
const PT = await new THREE.TextureLoader().loadAsync('/assets/ange.jpg'); PT.colorSpace = THREE.SRGBColorSpace; PT.anisotropy = 8;
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
const CREDIT = '« L\'Ange déchu » · Alexandre Cabanel, 1847 · musée Fabre, Montpellier · domaine public';

// ---------- la salle et le tableau
SETS.gal = () => {
  const B = base({ bg: 0x07060a, fog: [0x07060a, 6, 18], hemi: [0xffe8d0, 0x0c0a10, 0.35], sun: [0xffe8d0, 0.35, [1, 5, 4]], shadow: false, bloom: [0.4, 0.5, 0.92], exposure: 1.0 });
  const { scene, cam } = B;
  scene.add(at(box(14, 0.1, 10, M(0x1e1a1c)), 0, -0.05, 2)); scene.add(at(box(14, 6, 0.2, M(0x3a1a1e)), 0, 3, -0.2));
  const pg = painting(); pg.position.set(0, 1.75, 0); scene.add(pg);
  const spot = new THREE.SpotLight(0xffeedd, 6, 8, 0.6, 0.6, 1.0); spot.position.set(0, 4.2, 2.5); spot.target = pg; scene.add(spot);
  const dt = dust(scene, 60, 0, 1.6, 1.2, 2.2, 0xffe0b0);
  const rig = claudeRig(scene, [1.0, 0, 2.1], -0.35, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28);
  faceLight(scene, [0.8, 0.7, 3.0], 1.0);
  // hologramme : Rome -> Montpellier
  const map = new THREE.Group(); rig.holoG.add(map);
  const pin = (x, y, c) => { const p = holo(new THREE.ConeGeometry(0.03, 0.08, 6), c, 0.4); p.rotation.x = Math.PI; p.position.set(x, y, 0); map.add(p); return p; };
  pin(0.18, -0.05, 0xffd070); pin(-0.2, 0.1, 0x9adfff);
  const lR = label('ROME · 1847', { w: 0.6, h: 0.1, color: '#ffd070', font: 'bold 80px Inter' }); lR.position.set(0.18, -0.15, 0); map.add(lR);
  const lM = label('MONTPELLIER', { w: 0.6, h: 0.1, color: '#9adfff', font: 'bold 80px Inter' }); lM.position.set(-0.2, 0.22, 0); map.add(lM);
  // reperes
  const O = (o) => { pg.add(o); return o; };
  const eyeR = O(ringAt(0.346, 0.327, 0.05, 0xffd070, 0.004));
  const tear = O(stroke([[0.351, 0.334], [0.352, 0.342], [0.353, 0.352]], 0x9adfff, 0.0025));
  const arms = O(stroke([[0.22, 0.38], [0.3, 0.37], [0.4, 0.355], [0.48, 0.335], [0.545, 0.315]], 0xffd070, 0.008));
  const brow = O(stroke([[0.326, 0.309], [0.338, 0.312], [0.35, 0.317], [0.362, 0.325]], 0xff6a5a, 0.0022));
  const head = O(ringAt(0.33, 0.25, 0.22, 0xffd070)); const wing = O(ringAt(0.1, 0.5, 0.42, 0x9adfff));
  const angA = O(ringAt(0.52, 0.16, 0.3, 0xe8f0ff)), angB = O(ringAt(0.86, 0.16, 0.3, 0xe8f0ff));
  const away = O(stroke([[0.42, 0.36], [0.55, 0.26], [0.68, 0.16], [0.8, 0.06]], 0xe8f0ff, 0.01)); const awayH = O(arrowHead(0.805, 0.055, -0.95, 0xe8f0ff));
  const fall = O(stroke([[0.62, 0.05], [0.56, 0.18], [0.47, 0.3], [0.4, 0.4]], 0xff9a6a, 0.01)); const fallH = O(arrowHead(0.395, 0.41, Math.PI * 0.75 + 0.2, 0xff9a6a));
  const K = cardsMgr(scene, cam);
  K(CREDIT, { w: 1.6, h: 0.12, border: '#807060', color: '#e8e0d4' }, t => t > 0.2 && t < TL.duration + 1 ? 0.85 : 0, -0.88, 0.8);
  K('ALEXANDRE CABANEL\nMontpellier · 1823 – 1889', { w: 1.6, h: 0.42, border: '#e0b070', small: true }, t => win(t, SC.peintre.start + 2.0, SC.peintre.start + 6.5, 0.3, 0.2), 0.15);
  K('1847 · pensionnaire de la Villa Médicis\nhuile sur toile · 121 × 190 cm', { w: 1.6, h: 0.42, border: '#e0b070', small: true }, t => win(t, SC.peintre.start + 6.7, C.musee, 0.3, 0.2), -0.55);
  K('pas de cornes, pas de griffes', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, SC.corps.start + 1.5, C.ailes, 0.3, 0.2), -0.55);
  K('ailes sombres de l\'ange', { w: 1.6, h: 0.28, border: '#9adfff' }, t => win(t, C.ailes + 0.3, SC.visage.start, 0.3, 0.2), -0.55);
  K('les bras croisés cachent le visage', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, SC.visage.start + 1.0, SC.visage.start + 4.0, 0.3, 0.2), 0.1);
  K('paupières rougies · une larme', { w: 1.6, h: 0.28, border: '#9adfff' }, t => win(t, SC.visage.start + 4.3, C.regard, 0.3, 0.2), -0.55);
  K('sourcils froncés : la colère', { w: 1.6, h: 0.28, border: '#ff6a5a' }, t => win(t, C.regard + 0.5, SC.ciel.start, 0.3, 0.2), -0.55);
  K('les anges fidèles s\'éloignent', { w: 1.6, h: 0.28, border: '#e8f0ff' }, t => win(t, SC.ciel.start + 1.0, C.instant, 0.3, 0.2), -0.55);
  K('juste après la chute', { w: 1.6, h: 0.28, border: '#ff9a6a' }, t => win(t, C.instant + 0.8, SC.fin.start, 0.3, 0.2), -0.55);
  K('interprétation', { w: 0.9, h: 0.2, border: '#ffd070', color: '#ffe0a0' }, t => win(t, C.regard + 0.5, SC.ciel.start, 0.3, 0.2) + win(t, C.instant + 0.5, SC.fin.start, 0.3, 0.2), -0.42, 0.42);
  const V = (u, v, f) => pview(pg, u, v, f, 40);
  const FULL = (t) => ({ t, ...V(0.5, 0.5, 2.65) });
  const WIDE = (t, k = 0) => ({ t, p: [0.3 + k, 1.3, 6.9], l: [0.4, 1.15, 1.8], f: 46 });
  return {
    ...B, update(t) {
      dt(t); pg.updateWorldMatrix(true, true);
      camKeys(cam, t, [
        { t: 0, ...V(0.345, 0.33, 0.17) }, { t: 4.8, ...V(0.36, 0.35, 0.3) }, FULL(C.title - 0.2), FULL(SC.peintre.start),
        { t: SC.peintre.start + 2.0, ...V(0.42, 0.45, 1.3) }, { t: SC.peintre.start + 6.5, ...V(0.48, 0.5, 1.6) }, FULL(C.musee - 0.6), WIDE(C.musee + 0.4), WIDE(SC.textes.start, 0.06),
        FULL(SC.corps.start), { t: SC.corps.start + 1.2, ...V(0.36, 0.45, 1.0) }, { t: C.ailes - 0.4, ...V(0.38, 0.55, 1.1) }, { t: C.ailes + 0.5, ...V(0.12, 0.52, 1.0) }, { t: SC.visage.start - 0.2, ...V(0.13, 0.5, 0.95) },
        { t: SC.visage.start + 0.7, ...V(0.38, 0.35, 0.45) }, { t: SC.visage.start + 3.8, ...V(0.4, 0.34, 0.42) }, { t: SC.visage.start + 4.8, ...V(0.345, 0.328, 0.17) }, { t: C.regard - 0.3, ...V(0.346, 0.328, 0.16) }, { t: C.regard + 0.6, ...V(0.345, 0.32, 0.13) }, { t: SC.ciel.start - 0.3, ...V(0.345, 0.32, 0.125) },
        { t: SC.ciel.start + 0.8, ...V(0.58, 0.22, 0.75) }, { t: SC.ciel.start + 4.0, ...V(0.78, 0.2, 0.7) }, { t: C.instant - 0.4, ...V(0.6, 0.3, 1.2) }, { t: C.instant + 0.8, ...V(0.5, 0.35, 1.5) }, { t: SC.fin.start - 0.2, ...V(0.47, 0.4, 1.7) },
        FULL(SC.fin.start + 0.8), { t: C.question, ...V(0.36, 0.34, 0.6) }, { t: TL.duration, ...V(0.345, 0.326, 0.2) }]);
      fade(eyeR, win(t, 1.0, 4.5, 0.4, 0.4) + win(t, SC.visage.start + 4.6, C.regard, 0.3, 0.3));
      tear.userData.draw(sstep(2.2, 3.4, t) + sstep(SC.visage.start + 5.5, SC.visage.start + 6.5, t) - sstep(4.4, 4.8, t) * (t < 10 ? 1 : 0), win(t, 2.0, 4.8, 0.2, 0.4) + win(t, SC.visage.start + 5.3, C.regard + 1.0, 0.2, 0.4));
      arms.userData.draw(sstep(SC.visage.start + 0.9, SC.visage.start + 2.6, t), win(t, SC.visage.start + 0.6, SC.visage.start + 4.4, 0.2, 0.4));
      brow.userData.draw(sstep(C.regard + 0.2, C.regard + 1.2, t), win(t, C.regard, SC.ciel.start, 0.2, 0.4));
      fade(head, win(t, SC.corps.start + 1.5, C.ailes, 0.3, 0.3)); fade(wing, win(t, C.ailes + 0.5, SC.visage.start, 0.3, 0.3));
      fade(angA, win(t, SC.ciel.start + 0.8, C.instant - 0.5, 0.3, 0.3)); fade(angB, win(t, SC.ciel.start + 3.5, C.instant - 0.5, 0.3, 0.3));
      away.userData.draw(sstep(SC.ciel.start + 1.5, SC.ciel.start + 3.2, t), win(t, SC.ciel.start + 1.2, C.instant, 0.2, 0.4)); fade(awayH, win(t, SC.ciel.start + 3.1, C.instant, 0.2, 0.4));
      fall.userData.draw(sstep(C.instant + 0.4, C.instant + 1.8, t), win(t, C.instant, SC.fin.start, 0.2, 0.4)); fade(fallH, win(t, C.instant + 1.7, SC.fin.start, 0.2, 0.4));
      const mk = win(t, C.musee + 0.3, SC.textes.start, 0.3, 0.3); beamOn(rig, mk, t); fade(map, mk); map.rotation.y = 0.3 * Math.sin(t * 0.8); lR.lookAt(cam.position); lM.lookAt(cam.position);
      rig.c.update(t, env('claude', t), {});
      spot.intensity = t > SC.fin.start ? lerp(6, 3.5, sstep(SC.fin.start, TL.duration, t)) : 6;
      K.update(t);
    }
  };
};

// ---------- selon les textes
SETS.textes = () => {
  const B = base({ bg: 0x06070a, fog: [0x06070a, 5, 14], hemi: [0xd8e0ff, 0x101014, 0.4], sun: [0xe8eeff, 0.6, [0, 6, 1]], shadowSize: 3, bloom: [0.5, 0.5, 0.82], exposure: 1.1, target: [0, 0.9, 0] });
  const { scene, cam } = B;
  scene.add(at(box(8, 0.1, 8, M(0x1e1e24)), 0, -0.05, 0));
  const lect = new THREE.Group(); scene.add(lect);
  lect.add(at(box(0.2, 0.95, 0.2, M(0x3a2a1e)), 0, 0.47, 0)); lect.add(at(box(0.5, 0.06, 0.5, M(0x3a2a1e)), 0, 0.03, 0));
  const top = new THREE.Group(); top.position.set(0, 1.0, 0); top.rotation.x = 0.4; lect.add(top);
  top.add(at(box(0.66, 0.04, 0.46, M(0x4a3222)), 0, -0.02, 0));
  const book = openBook(versePage(['Isaïe 14, 12', '« Te voilà tombé', 'du ciel, astre brillant,', 'fils de l\'aurore ! »', '', 'en latin : Lucifer']), versePage(['Luc 10, 18', '« Je voyais Satan', 'tomber du ciel', 'comme un éclair. »']), 0.42); top.add(book);
  const sp = new THREE.SpotLight(0xe8eeff, 8, 8, 0.4, 0.5, 1.0); sp.position.set(0, 5.5, 0.3); sp.target = lect; scene.add(sp);
  const dt = dust(scene, 60, 0, 1.6, 0, 1.0, 0xe0e8ff);
  const rig = claudeRig(scene, [0.7, 0, 0.8], -0.5, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28);
  faceLight(scene, [0.5, 0.7, 1.8], 1.2);
  // hologramme : l'eclair qui tombe
  const bolt = new THREE.Group(); rig.holoG.add(bolt);
  const zz = [[0.05, 0.42], [-0.06, 0.24], [0.04, 0.2], [-0.07, 0.0], [0.03, -0.04], [-0.05, -0.22]];
  for (let i = 0; i < zz.length - 1; i++) bolt.add(L.beam([zz[i][0], zz[i][1], 0], [zz[i + 1][0], zz[i + 1][1], 0], 0.02, holoMat(0xffd070, 0.7)));
  const ang = holo(new THREE.ConeGeometry(0.06, 0.14, 5), 0xffd070, 0.3); bolt.add(ang);
  const K = cardsMgr(scene, cam);
  K('selon les textes', { w: 1.0, h: 0.22, border: '#ffd070', color: '#ffe0a0' }, t => win(t, SC.textes.start + 0.5, SC.corps.start, 0.3, 0.2), -0.75, 0.45);
  K('« Lucifer » = « porteur de lumière »\nun nom tiré d\'Isaïe, appliqué plus tard à Satan', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.textes.start + 2.2, C.luc - 0.1, 0.3, 0.2), -0.52);
  return {
    ...B, update(t) {
      dt(t);
      const T0 = SC.textes.start;
      camKeys(cam, t, [{ t: T0, p: [0.35, 1.25, 3.4], l: [0.35, 0.9, 0.6], f: 44 }, { t: T0 + 2.0, p: [0.0, 1.9, 2.6], l: [0, 1.1, 0], f: 44 }, { t: T0 + 3.5, p: [-0.13, 1.62, 0.95], l: [-0.11, 1.0, 0.0], f: 40 }, { t: C.luc - 0.6, p: [-0.13, 1.62, 0.92], l: [-0.11, 1.0, 0.0], f: 40 }, { t: C.luc + 0.4, p: [0.14, 1.62, 0.92], l: [0.12, 1.0, 0.0], f: 40 }, { t: SC.corps.start, p: [0.15, 1.62, 0.96], l: [0.12, 1.0, 0.0], f: 40 }]);
      const bk = win(t, T0 + 0.3, T0 + 6.0, 0.4, 0.3); beamOn(rig, bk, t); fade(bolt, bk); bolt.position.y = 0.15 * Math.sin(t * 2); ang.position.set(0.0, 0.5 - 0.7 * ((t * 0.5) % 1), 0); ang.rotation.z = Math.PI;
      rig.c.update(t, env('claude', t), {});
      K.update(t);
    }
  };
};

const SHOTS = [['gal', 0, SC.textes.start], ['textes', SC.textes.start, SC.corps.start], ['gal', SC.corps.start, 1000]];
