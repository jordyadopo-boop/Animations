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

// ---------- le tableau (Leon Spilliaert, Faune au clair de lune, 1900 - domaine public)
const PT = await new THREE.TextureLoader().loadAsync('/assets/faune.jpg'); PT.colorSpace = THREE.SRGBColorSpace; PT.anisotropy = 8;
const PW = 3.0, PH = PW * PT.image.height / PT.image.width;
function painting() {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ map: PT, toneMapped: false, color: new THREE.Color(0.9, 0.9, 0.9) });
  g.add(at(new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), mat), 0, 0, 0.012));
  const fm = M(0x3a2414, { emissive: new THREE.Color(0x120a04) }); const t = 0.12;
  for (const [x, y, w, h] of [[0, PH / 2 + t / 2, PW + 2 * t, t], [0, -PH / 2 - t / 2, PW + 2 * t, t], [PW / 2 + t / 2, 0, t, PH], [-PW / 2 - t / 2, 0, t, PH]]) g.add(at(box(w, h, 0.08, fm), x, y, 0.0));
  g.userData = { w: PW, h: PH, mat };
  return g;
}
const uvp = (u, v, z = 0.03) => new THREE.Vector3((u - 0.5) * PW, (0.5 - v) * PH, z);
// trace lumineux qui se dessine progressivement
function stroke(pts, color = 0xffd070, r = 0.012) {
  const curve = new THREE.CatmullRomCurve3(pts.map(([u, v]) => uvp(u, v)));
  const geo = new THREE.TubeGeometry(curve, 80, r, 5);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.6), transparent: true, depthWrite: false, toneMapped: false }));
  m.renderOrder = 5; m.userData.n = geo.index.count;
  m.userData.draw = (k, op = 1) => { geo.setDrawRange(0, Math.floor(m.userData.n * clamp(k, 0, 1) / 3) * 3); m.material.opacity = op; m.visible = k > 0.005 && op > 0.01; };
  return m;
}
function ringAt(u, v, r, color = 0xffd070) {
  const m = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.018, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.6), transparent: true, depthWrite: false, toneMapped: false }));
  m.position.copy(uvp(u, v)); m.renderOrder = 5; return m;
}
function arrowHead(u, v, ang, color = 0xffd070) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 3), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.6), transparent: true, depthWrite: false, toneMapped: false }));
  m.position.copy(uvp(u, v)); m.rotation.z = ang; m.renderOrder = 5; return m;
}

function versePage(lines) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 720; const g = c.getContext('2d');
  g.fillStyle = '#efe4c8'; g.fillRect(0, 0, 512, 720); g.fillStyle = '#3a2a1a'; g.textAlign = 'center';
  lines.forEach((l, i) => { g.font = i === 0 ? 'bold 40px Inter' : '32px Inter'; g.fillText(l, 256, 110 + i * 62); });
  for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(58,42,26,0.25)'; g.fillRect(70, 470 + k * 34, 372 - (k % 3) * 40, 10); }
  return canvasTex(c);
}

// ---------- la salle et le dessin
SETS.gal = () => {
  const B = base({ bg: 0x05060a, fog: [0x05060a, 6, 18], hemi: [0xd0d8ff, 0x0c0c12, 0.35], sun: [0xd8e0ff, 0.35, [1, 5, 4]], shadow: false, bloom: [0.45, 0.5, 0.9], exposure: 1.0 });
  const { scene, cam } = B;
  scene.add(at(box(14, 0.1, 10, M(0x1a1a20)), 0, -0.05, 2)); scene.add(at(box(14, 6, 0.2, M(0x16161c)), 0, 3, -0.2));
  const pg = painting(); pg.position.set(0, 1.75, 0); scene.add(pg);
  const spot = new THREE.SpotLight(0xdde4ff, 6, 8, 0.5, 0.6, 1.0); spot.position.set(0, 4.2, 2.5); spot.target = pg; scene.add(spot);
  const dt = dust(scene, 60, 0, 1.6, 1.2, 2.2, 0xd8e0ff);
  const rig = claudeRig(scene, [0.85, 0, 2.6], -0.35, [-0.45, 0, 0.1], 0x9adfff, 0.45, 0.28);
  // hologrammes : la lune et la mer (insomnie), la flute de Pan
  const night = new THREE.Group(); rig.holoG.add(night);
  night.add(at(holo(new THREE.IcosahedronGeometry(0.08, 1), 0xe8f0ff, 0.25), 0.12, 0.22, 0));
  const waves = []; for (let i = 0; i < 3; i++) { const w = holo(new THREE.TorusGeometry(0.22, 0.008, 4, 24, Math.PI * 0.6), 0x7dd8ff, 0.4); w.rotation.z = Math.PI * 0.2; w.position.set(-0.05, -0.12 - i * 0.06, 0); night.add(w); waves.push(w); }
  const pan = new THREE.Group(); rig.holoG.add(pan);
  for (let i = 0; i < 7; i++) { const h = 0.32 - i * 0.03; pan.add(at(holo(new THREE.CylinderGeometry(0.018, 0.018, h, 8), 0xffd070, 0.25), -0.12 + i * 0.04, 0.1 - h / 2, 0)); }
  pan.add(at(holo(new THREE.BoxGeometry(0.3, 0.025, 0.04), 0xffd070, 0.3), 0, 0.02, 0));
  const panL = label('PAN → « panique »', { w: 0.7, h: 0.12, color: '#ffd070', font: 'bold 80px Inter' }); panL.position.set(-0.2, -0.3, 0.05); rig.holoG.add(panL);
  // reperes
  const O = (o) => { pg.add(o); return o; };
  const spiral = []; for (let i = 0; i <= 60; i++) { const a = i / 60 * Math.PI * 4.5, r = 0.02 + i / 60 * 0.11; spiral.push([0.264 + Math.cos(a) * r, 0.07 + Math.sin(a) * r * 0.55]); }
  const spir = O(stroke(spiral, 0xd8e0ff, 0.008));
  const horns = O(ringAt(0.477, 0.375, 0.07)); const flute = O(stroke([[0.4, 0.402], [0.44, 0.405], [0.47, 0.41]], 0xffd070, 0.01)); const leg = O(ringAt(0.43, 0.555, 0.08, 0xff9a6a));
  const goatArrow = O(stroke([[0.06, 0.5], [0.2, 0.5], [0.33, 0.49], [0.4, 0.5]], 0x9adfff)); const goatHead = O(arrowHead(0.405, 0.5, -Math.PI / 2, 0x9adfff));
  const rear = O(ringAt(0.287, 0.52, 0.1, 0xffd070));
    const K = cardsMgr(scene, cam);
  K('« Faune au clair de lune » · Léon Spilliaert, 1900 · domaine public', { w: 1.6, h: 0.16, border: '#707890', color: '#e0e4f0' }, t => (t < SC.textes.start || t > SC.fin.start) && t > 0.2 ? 0.85 : 0, -0.86, 0.66);
  K('LÉON SPILLIAERT\nOstende (Belgique) · 1881 – 1946', { w: 1.6, h: 0.42, border: '#9aa4c8', small: true }, t => win(t, SC.artiste.start + 2.0, C.insomnie, 0.3, 0.2), 0.15);
  K('insomnie · marches de nuit\nau bord de la mer', { w: 1.6, h: 0.42, border: '#7dd8ff', small: true }, t => win(t, C.insomnie + 0.8, C.encre, 0.3, 0.2), -0.55);
  K('encre, craie noire, crayons de couleur\nsur papier · 49 × 63 cm', { w: 1.6, h: 0.42, border: '#9aa4c8', small: true }, t => win(t, C.encre + 0.8, SC.ciel.start, 0.3, 0.2), -0.55);
  K('une spirale autour de la lune', { w: 1.6, h: 0.28, border: '#d8e0ff' }, t => win(t, SC.ciel.start + 2.5, SC.faune.start, 0.3, 0.2), -0.55);
  K('cornes · double flûte · une jambe levée', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, SC.faune.start + 3.0, C.visage, 0.3, 0.2), -0.55);
  K('4 chèvres en file\nl\'une se dresse', { w: 1.6, h: 0.42, border: '#9adfff', small: true }, t => win(t, SC.chevres.start + 2.0, SC.ombres.start, 0.3, 0.2), -0.55);
  K('interprétation', { w: 0.9, h: 0.2, border: '#ffd070', color: '#ffe0a0' }, t => win(t, C.branche + 3.0, SC.mytho.start, 0.3, 0.2), -0.42, 0.42);
  K('le faune · mythologie romaine\nmi-homme mi-bouc · proche de Pan', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.mytho.start + 1.5, C.panique, 0.3, 0.2), -0.6);
  const V = (u, v, f) => pview(pg, u, v, f, 40);
  const FULL = (t) => ({ t, ...V(0.5, 0.5, 2.35) });
  const WIDE = (t, k = 0) => ({ t, p: [0.35 + k, 1.0, 5.2], l: [0.5, 0.95, 2.4], f: 46 });
  return {
    ...B, update(t) {
      dt(t); pg.updateWorldMatrix(true, true);
      camKeys(cam, t, [
        { t: 0, ...V(0.47, 0.47, 0.42) }, { t: 3.2, ...V(0.46, 0.5, 0.55) }, { t: 4.4, ...V(0.2, 0.53, 0.55) }, { t: C.malaise, ...V(0.25, 0.5, 0.7) }, FULL(C.title - 0.6), FULL(SC.artiste.start),
        { t: SC.artiste.start + 2.0, ...V(0.85, 0.88, 0.48) }, { t: C.insomnie - 0.4, ...V(0.84, 0.88, 0.5) }, WIDE(C.insomnie + 0.6), WIDE(C.encre - 0.4, 0.05), { t: C.encre + 0.6, ...V(0.74, 0.35, 0.4) }, { t: SC.ciel.start - 0.3, ...V(0.73, 0.37, 0.38) },
        { t: SC.ciel.start + 0.6, ...V(0.27, 0.17, 0.6) }, { t: SC.ciel.start + 4.5, ...V(0.3, 0.22, 0.75) }, { t: SC.faune.start - 0.3, ...V(0.4, 0.3, 1.3) },
        { t: SC.faune.start + 0.6, ...V(0.46, 0.49, 0.5) }, { t: C.visage - 0.3, ...V(0.46, 0.48, 0.48) }, { t: C.visage + 0.6, ...V(0.475, 0.4, 0.22) }, { t: SC.chevres.start - 0.3, ...V(0.475, 0.4, 0.2) },
        { t: SC.chevres.start + 0.6, ...V(0.2, 0.53, 0.55) }, { t: SC.chevres.start + 4.0, ...V(0.27, 0.52, 0.45) }, { t: SC.ombres.start - 0.3, ...V(0.3, 0.55, 0.9) },
        { t: SC.ombres.start + 0.6, ...V(0.25, 0.72, 0.75) }, { t: C.branche - 0.3, ...V(0.3, 0.7, 0.85) }, { t: C.branche + 0.6, ...V(0.7, 0.35, 1.2) }, { t: C.branche + 3.5, ...V(0.55, 0.12, 0.6) }, { t: SC.mytho.start - 0.2, ...V(0.55, 0.15, 0.7) },
        WIDE(SC.mytho.start + 0.8), WIDE(SC.textes.start, 0.08),
        FULL(SC.fin.start), { t: TL.duration, ...V(0.47, 0.5, 1.6) }]);
      spir.userData.draw(sstep(SC.ciel.start + 0.8, SC.ciel.start + 3.5, t), win(t, SC.ciel.start, SC.faune.start, 0.2, 0.4));
      fade(horns, win(t, SC.faune.start + 1.5, C.visage, 0.3, 0.3)); flute.userData.draw(sstep(SC.faune.start + 3.5, SC.faune.start + 4.5, t), win(t, SC.faune.start, C.visage, 0.2, 0.3)); fade(leg, win(t, SC.faune.start + 2.5, C.visage, 0.3, 0.3));
      goatArrow.userData.draw(sstep(SC.chevres.start + 1.0, SC.chevres.start + 3.0, t), win(t, SC.chevres.start, SC.ombres.start, 0.2, 0.4)); fade(goatHead, win(t, SC.chevres.start + 2.8, SC.ombres.start, 0.2, 0.4));
      fade(rear, win(t, SC.chevres.start + 4.0, SC.ombres.start, 0.3, 0.3));
      const nk = win(t, C.insomnie + 0.3, C.encre, 0.3, 0.3), pk = win(t, SC.mytho.start + 0.6, SC.textes.start, 0.3, 0.3);
      beamOn(rig, Math.max(nk, pk), t); fade(night, nk); waves.forEach((w, i) => w.position.x = -0.05 + 0.03 * Math.sin(t * 2 + i));
      fade(pan, pk); pan.rotation.y = 0.4 * Math.sin(t * 0.8); fade(panL, win(t, C.panique + 0.5, SC.textes.start, 0.3, 0.3)); panL.lookAt(cam.position);
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
  const book = openBook(versePage(['Matthieu 25, 32', '« il séparera', 'les uns d\'avec les autres,', 'comme le berger', 'sépare les brebis', 'd\'avec les boucs »']), versePage(['', 'les brebis', 'à sa droite,', 'les boucs', 'à sa gauche']), 0.42); top.add(book);
  const sp = new THREE.SpotLight(0xe8eeff, 8, 8, 0.4, 0.5, 1.0); sp.position.set(0, 5.5, 0.3); sp.target = lect; scene.add(sp);
  const dt = dust(scene, 60, 0, 1.6, 0, 1.0, 0xe0e8ff);
  const rig = claudeRig(scene, [0.7, 0, 0.8], -0.5, [-0.45, 0, 0.1], 0xff7a5a, 0.45, 0.28);
  const hornsH = new THREE.Group(); rig.holoG.add(hornsH);
  for (const s of [-1, 1]) { const h = holo(new THREE.ConeGeometry(0.04, 0.22, 5), 0xff7a5a, 0.3); h.position.set(s * 0.08, 0.05, 0); h.rotation.z = -s * 0.35; hornsH.add(h); }
  hornsH.add(holo(new THREE.IcosahedronGeometry(0.09, 1), 0xff7a5a, 0.12));
  const q = label('?', { w: 0.3, h: 0.3, color: '#ffd070', font: 'bold 300px Inter' }); q.position.set(0.2, 0.2, 0); rig.holoG.add(q);
  const K = cardsMgr(scene, cam);
  K('selon les textes', { w: 1.0, h: 0.22, border: '#ffd070', color: '#ffe0a0' }, t => win(t, SC.textes.start + 0.5, C.diable, 0.3, 0.2), -0.42, 0.45);
  K('rien ne dit que c\'est le diable', { w: 1.6, h: 0.28, border: '#ff7a5a' }, t => win(t, C.diable + 4.0, SC.fin.start, 0.3, 0.2), 0.3);
  return {
    ...B, update(t) {
      dt(t);
      const T0 = SC.textes.start;
      camKeys(cam, t, [{ t: T0, p: [0.0, 1.9, 2.6], l: [0, 1.1, 0], f: 44 }, { t: T0 + 2.5, p: [-0.12, 1.55, 0.75], l: [-0.1, 1.02, 0.0], f: 40 }, { t: C.diable - 0.5, p: [0.0, 1.6, 0.95], l: [0.0, 1.02, 0.0], f: 42 }, { t: C.diable + 0.7, p: [0.35, 1.15, 3.5], l: [0.35, 0.85, 0.8], f: 44 }, { t: SC.fin.start, p: [0.35, 1.15, 3.4], l: [0.35, 0.85, 0.8], f: 44 }]);
      const hk = win(t, C.diable + 0.4, SC.fin.start, 0.4, 0.3); beamOn(rig, hk, t); fade(hornsH, hk * (1 - 0.6 * sstep(C.diable + 4.0, C.diable + 5.0, t))); hornsH.rotation.y = 0.4 * Math.sin(t);
      fade(q, sstep(C.diable + 4.0, C.diable + 4.6, t) * hk); q.lookAt(cam.position);
      rig.c.update(t, env('claude', t), {});
      K.update(t);
    }
  };
};

const SHOTS = [['gal', 0, SC.textes.start], ['textes', SC.textes.start, SC.fin.start], ['gal', SC.fin.start, 1000]];
