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

// ---------- le tableau (Thomas Blackshear II, Watchers in the Night - oeuvre protegee, montree pour l'analyse)
const PT = await new THREE.TextureLoader().loadAsync('/assets/watchers.jpg'); PT.colorSpace = THREE.SRGBColorSpace; PT.anisotropy = 8;
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

// ---------- la salle et le tableau (toutes les scenes sauf « textes »)
SETS.gal = () => {
  const B = base({ bg: 0x070506, fog: [0x070506, 6, 18], hemi: [0xffe8d0, 0x120c0a, 0.35], sun: [0xffe0c0, 0.35, [1, 5, 4]], shadow: false, bloom: [0.45, 0.5, 0.9], exposure: 1.0 });
  const { scene, cam } = B;
  scene.add(at(box(14, 0.1, 10, M(0x241a14)), 0, -0.05, 2)); scene.add(at(box(14, 6, 0.2, M(0x1e1612)), 0, 3, -0.2));
  const pg = painting(); pg.position.set(0, 1.75, 0); scene.add(pg);
  const spot = new THREE.SpotLight(0xffe8c8, 6, 8, 0.5, 0.6, 1.0); spot.position.set(0, 4.2, 2.5); spot.target = pg; scene.add(spot);
  const dt = dust(scene, 60, 0, 1.6, 1.2, 2.2);
  const rig = claudeRig(scene, [0.85, 0, 2.6], -0.35, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28);
  // hologrammes : un timbre, un vaisseau
  const stamp = new THREE.Group(); rig.holoG.add(stamp); stamp.position.x = -0.25;
  stamp.add(holo(new THREE.BoxGeometry(0.26, 0.32, 0.01), 0xffd070, 0.15));
  const sl = label('USA', { w: 0.2, h: 0.08, color: '#ffd070', font: 'bold 300px Inter' }); sl.position.set(0, -0.1, 0.01); stamp.add(sl);
  const ship = new THREE.Group(); rig.holoG.add(ship); ship.position.x = 0.22;
  ship.add(holo(new THREE.ConeGeometry(0.06, 0.34, 4), 0x7dd8ff, 0.18)); ship.children[0].rotation.z = -Math.PI / 2;
  for (const s of [-1, 1]) ship.add(at(holo(new THREE.BoxGeometry(0.16, 0.012, 0.06), 0x7dd8ff, 0.2), -0.05, 0, s * 0.06));
  const angelH = new THREE.Group(); rig.holoG.add(angelH);
  angelH.add(holo(new THREE.ConeGeometry(0.1, 0.32, 6), 0xfff0c0, 0.15)); for (const s of [-1, 1]) { const w = holo(new THREE.ConeGeometry(0.07, 0.3, 4), 0xfff0c0, 0.15); w.position.set(s * 0.13, 0.05, -0.02); w.rotation.z = s * 0.6; angelH.add(w); }
  // reperes dessines sur le tableau
  const O = (o) => { pg.add(o); return o; };
  const upArrow = O(stroke([[0.5, 1.02], [0.45, 0.7], [0.32, 0.35], [0.27, 0.12]])); const upHead = O(arrowHead(0.27, 0.11, 0.3));
  const exits = [[0.665, 0.02], [0.4, 0.02], [0.08, 0.02], [0.99, 0.55]].map(([u, v]) => O(ringAt(u, v, 0.07, 0xff9a6a)));
  const wingL = O(stroke([[0.13, 0.03], [0.07, 0.3], [0.1, 0.6], [0.18, 0.85], [0.3, 0.99]], 0x9adfff));
  const wingR = O(stroke([[0.38, 0.12], [0.6, 0.05], [0.85, 0.15], [0.97, 0.4], [0.96, 0.62], [0.8, 0.72]], 0x9adfff));
  const shelter = O(stroke([[0.3, 0.99], [0.2, 0.8], [0.25, 0.55], [0.5, 0.62], [0.75, 0.7], [0.97, 0.75]], 0x7dffb0, 0.01));
  const flameR = O(ringAt(0.193, 0.36, 0.09)); const faceR = O(ringAt(0.25, 0.12, 0.16));
  const flameToFace = O(stroke([[0.193, 0.33], [0.22, 0.25], [0.25, 0.18]], 0xffd070, 0.008));
  const spear = O(stroke([[0.664, 0.02], [0.666, 0.3], [0.668, 0.72]], 0xff9a6a, 0.014));
  const childR = O(ringAt(0.86, 0.83, 0.2, 0x7dd8ff));
  const diag = O(stroke([[0.193, 0.36], [0.4, 0.52], [0.62, 0.68], [0.84, 0.82]], 0xffd070, 0.012));
  const K = cardsMgr(scene, cam);
  const credit = K('« Watchers in the Night » · © Thomas Blackshear II', { w: 1.6, h: 0.16, border: '#8a7050', color: '#e8dcc0' }, t => (t < SC.textes.start || t > SC.fin.start) && t > 0.2 ? 0.85 : 0, -0.86, 0.6);
  K('THOMAS BLACKSHEAR II\npeintre américain · né en 1955 au Texas', { w: 1.6, h: 0.42, border: '#e0b070', small: true }, t => win(t, SC.peintre.start + 3.5, C.starwars, 0.3, 0.2), -0.55);
  K('illustrations pour Star Wars\n≈ 30 timbres · des anges célèbres', { w: 1.6, h: 0.42, border: '#7dd8ff', small: true }, t => win(t, C.starwars + 1.0, SC.vue.start, 0.3, 0.2), -0.55);
  K('vue d\'en bas · l\'ange sort du cadre', { w: 1.6, h: 0.28, border: '#ff9a6a' }, t => win(t, SC.vue.start + 2.5, SC.ailes.start, 0.3, 0.2), -0.55);
  K('les ailes : un rideau + un toit\n= un abri', { w: 1.6, h: 0.42, border: '#9adfff', small: true }, t => win(t, SC.ailes.start + 2.5, SC.lumiere.start, 0.3, 0.2), -0.55);
  K('une seule lumière : la flamme', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, SC.lumiere.start + 1.5, C.esprit, 0.3, 0.2), -0.55);
  K('la flamme = le Saint-Esprit\nselon les descriptions du tableau', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, C.esprit + 0.5, SC.lance.start, 0.3, 0.2), -0.55);
  K('lance droite, au repos\nune sentinelle', { w: 1.6, h: 0.42, border: '#ff9a6a', small: true }, t => win(t, SC.lance.start + 3.5, SC.enfant.start, 0.3, 0.2), -0.55);
  K('protégé sans le savoir', { w: 1.6, h: 0.28, border: '#7dd8ff' }, t => win(t, C.diagonale + 2.5, SC.titre.start, 0.3, 0.2), -0.55);
  K('WATCHERS = « les veilleurs »\nau pluriel… un seul ange', { w: 1.6, h: 0.42, border: '#e0b070', small: true }, t => win(t, SC.titre.start + 1.5, C.pluriel + 1.0, 0.3, 0.2), -0.55);
  K('interprétation', { w: 0.9, h: 0.2, border: '#ffd070', color: '#ffe0a0' }, t => win(t, C.pluriel + 1.5, SC.textes.start, 0.3, 0.2), -0.42, 0.42);
  const V = (u, v, f) => pview(pg, u, v, f, 40);
  const FULL = (t) => ({ t, ...V(0.5, 0.5, 2.25) });
  return {
    ...B, update(t) {
      dt(t);
      pg.updateWorldMatrix(true, true);
      const keys = [
        { t: 0, ...V(0.2, 0.33, 0.5) }, { t: 2.6, ...V(0.2, 0.36, 0.42) }, { t: 3.4, ...V(0.66, 0.36, 0.55) }, { t: 4.6, ...V(0.66, 0.3, 0.6) }, { t: 5.4, ...V(0.84, 0.82, 0.5) }, { t: C.hasard, ...V(0.84, 0.8, 0.6) }, FULL(C.title - 0.6), FULL(SC.peintre.start),
        { t: SC.peintre.start + 2.0, p: [0.2, 1.35, 7.0], l: [0.2, 1.3, 0], f: 46 }, { t: C.starwars, p: [0.35, 1.0, 5.2], l: [0.5, 0.95, 2.4], f: 46 }, { t: SC.vue.start - 0.6, p: [0.4, 0.95, 5.1], l: [0.5, 0.95, 2.4], f: 46 },
        FULL(SC.vue.start), { t: SC.vue.start + 2.5, p: [0, 0.6, 2.6], l: [0, 1.9, 0], f: 52 }, { t: SC.vue.start + 6.0, p: [0, 0.55, 2.7], l: [0, 2.1, 0], f: 52 }, FULL(SC.ailes.start - 0.4),
        FULL(SC.ailes.start + 7.5), { t: SC.lumiere.start, ...V(0.2, 0.36, 0.45) }, { t: SC.lumiere.start + 2.6, ...V(0.2, 0.36, 0.42) }, { t: SC.lumiere.start + 3.6, ...V(0.25, 0.15, 0.45) }, { t: C.esprit - 0.6, ...V(0.28, 0.35, 0.95) }, { t: C.esprit + 0.4, ...V(0.2, 0.36, 0.5) }, { t: SC.lance.start, ...V(0.2, 0.36, 0.45) },
        { t: SC.lance.start + 0.8, ...V(0.665, 0.12, 0.6) }, { t: SC.lance.start + 5.5, ...V(0.665, 0.55, 0.6) }, { t: C.garde, ...V(0.4, 0.35, 1.2) }, { t: C.garde + 1.2, ...V(0.25, 0.17, 0.45) }, { t: SC.enfant.start - 0.4, ...V(0.25, 0.18, 0.42) },
        { t: SC.enfant.start + 0.6, ...V(0.85, 0.83, 0.4) }, { t: C.diagonale - 0.3, ...V(0.8, 0.82, 0.55) }, FULL(C.diagonale + 1.2), FULL(SC.titre.start),
        { t: SC.titre.start + 5, ...V(0.5, 0.5, 2.0) }, { t: C.pluriel + 3.5, p: [-0.2, 1.4, 7.5], l: [0.1, 1.4, 0], f: 46 }, { t: SC.textes.start, p: [-0.2, 1.4, 7.8], l: [0.1, 1.4, 0], f: 46 },
        FULL(SC.fin.start), { t: TL.duration, ...V(0.5, 0.5, 2.1) }];
      camKeys(cam, t, keys);
      // reperes
      upArrow.userData.draw(sstep(SC.vue.start + 0.5, SC.vue.start + 2.0, t), win(t, SC.vue.start, SC.vue.start + 4.0, 0.2, 0.4)); fade(upHead, win(t, SC.vue.start + 1.8, SC.vue.start + 4.0, 0.2, 0.4));
      exits.forEach((r, i) => fade(r, win(t, SC.vue.start + 6.2 + i * 0.4, SC.ailes.start, 0.3, 0.3) * (0.7 + 0.3 * Math.sin(t * 4))));
      wingL.userData.draw(sstep(SC.ailes.start + 0.8, SC.ailes.start + 2.6, t), win(t, SC.ailes.start, SC.lumiere.start, 0.2, 0.4));
      wingR.userData.draw(sstep(SC.ailes.start + 3.0, SC.ailes.start + 5.0, t), win(t, SC.ailes.start, SC.lumiere.start, 0.2, 0.4));
      shelter.userData.draw(sstep(SC.ailes.start + 5.5, SC.ailes.start + 7.5, t), win(t, SC.ailes.start, SC.lumiere.start, 0.2, 0.4));
      fade(flameR, win(t, SC.lumiere.start + 0.8, SC.lumiere.start + 3.5, 0.3, 0.3) + win(t, C.esprit, SC.lance.start, 0.3, 0.3));
      fade(faceR, win(t, SC.lumiere.start + 3.8, C.esprit - 0.6, 0.3, 0.3)); flameToFace.userData.draw(sstep(SC.lumiere.start + 3.0, SC.lumiere.start + 4.0, t), win(t, SC.lumiere.start, C.esprit - 0.6, 0.2, 0.3));
      spear.userData.draw(sstep(SC.lance.start + 0.8, SC.lance.start + 5.5, t), win(t, SC.lance.start, C.garde + 0.6, 0.2, 0.4));
      fade(childR, win(t, SC.enfant.start + 1.5, C.diagonale, 0.3, 0.3));
      diag.userData.draw(sstep(C.diagonale + 0.3, C.diagonale + 2.2, t), win(t, C.diagonale, SC.titre.start, 0.2, 0.4));
      // le petit Claude et ses hologrammes
      const hk = win(t, C.starwars - 0.3, SC.vue.start, 0.3, 0.3); beamOn(rig, Math.max(hk, win(t, C.pluriel + 2.5, SC.textes.start, 0.3, 0.3)), t);
      fade(stamp, win(t, C.starwars + 0.6, SC.vue.start, 0.3, 0.3)); fade(ship, win(t, C.starwars, SC.vue.start, 0.3, 0.3)); ship.rotation.y = t * 0.8;
      fade(angelH, win(t, C.pluriel + 3.0, SC.textes.start, 0.3, 0.3)); angelH.rotation.y = t * 0.5;
      rig.c.update(t, env('claude', t), {});
      spot.intensity = t > SC.fin.start ? lerp(6, 3.5, sstep(SC.fin.start, TL.duration, t)) : 6;
      K.update(t);
    }
  };
};

// ---------- selon les textes : un livre ouvert dans la lumiere (Dieu jamais represente)
function versePage(lines) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 720; const g = c.getContext('2d');
  g.fillStyle = '#efe4c8'; g.fillRect(0, 0, 512, 720); g.fillStyle = '#3a2a1a'; g.textAlign = 'center';
  lines.forEach((l, i) => { g.font = i === 0 ? 'bold 40px Inter' : '32px Inter'; g.fillText(l, 256, 110 + i * 62); });
  for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(58,42,26,0.25)'; g.fillRect(70, 470 + k * 34, 372 - (k % 3) * 40, 10); }
  return canvasTex(c);
}
SETS.textes = () => {
  const B = base({ bg: 0x0a0806, fog: [0x0a0806, 5, 14], hemi: [0xffe8c8, 0x141010, 0.4], sun: [0xfff0d0, 0.6, [0, 6, 1]], shadowSize: 3, bloom: [0.55, 0.5, 0.8], exposure: 1.1, target: [0, 0.9, 0] });
  const { scene, cam } = B;
  scene.add(at(box(8, 0.1, 8, M(0x2a2018)), 0, -0.05, 0));
  const lect = new THREE.Group(); scene.add(lect);
  lect.add(at(box(0.2, 0.95, 0.2, M(0x4a2e1a)), 0, 0.47, 0)); lect.add(at(box(0.5, 0.06, 0.5, M(0x4a2e1a)), 0, 0.03, 0));
  const top = new THREE.Group(); top.position.set(0, 1.0, 0); top.rotation.x = 0.4; lect.add(top);
  top.add(at(box(0.66, 0.04, 0.46, M(0x5a3a22)), 0, -0.02, 0));
  const book = openBook(versePage(['Psaume 91, 11', '« Il ordonnera', 'à ses anges', 'de te garder dans', 'toutes tes voies. »']), versePage(['Matthieu 18, 10', '« leurs anges', 'dans les cieux', 'voient continuellement', 'la face de mon Père »']), 0.42); top.add(book);
  // la lumiere d'en haut (aucune figure)
  const ray = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.7, 5, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff0c8, transparent: true, opacity: 0.03, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); ray.position.set(0, 3.4, 0); scene.add(ray);
  const sp = new THREE.SpotLight(0xfff0d0, 8, 8, 0.4, 0.5, 1.0); sp.position.set(0, 5.5, 0.3); sp.target = lect; scene.add(sp);
  const dt = dust(scene, 60, 0, 1.6, 0, 1.0, 0xfff0c8);
  const rig = claudeRig(scene, [0.7, 0, 0.8], -0.5, [-0.45, 0, 0.1], 0xff9a40, 0.45, 0.28);
  const sword = new THREE.Group(); rig.holoG.add(sword); sword.position.y = 0.1;
  sword.add(holo(new THREE.BoxGeometry(0.03, 0.5, 0.008), 0xffb050, 0.3)); sword.add(at(holo(new THREE.BoxGeometry(0.16, 0.025, 0.02), 0xffb050, 0.3), 0, -0.2, 0));
  const flames = []; for (let i = 0; i < 6; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.09, 5), G(i % 2 ? 0xffc040 : 0xff6a20, 2.0)); sword.add(f); flames.push(f); }
  const K = cardsMgr(scene, cam);
  K('selon les textes', { w: 1.0, h: 0.22, border: '#ffd070', color: '#ffe0a0' }, t => win(t, SC.textes.start + 0.5, C.matthieu, 0.3, 0.2), -0.42, 0.45);
  K('Genèse 3, 24\ndes chérubins et une épée flamboyante', { w: 1.6, h: 0.42, border: '#ff9a40', small: true }, t => win(t, C.genese + 0.5, SC.fin.start, 0.3, 0.2), 0.3);
  return {
    ...B, update(t) {
      dt(t);
      const T0 = SC.textes.start;
      camKeys(cam, t, [{ t: T0, p: [0.0, 1.9, 2.6], l: [0, 1.1, 0], f: 44 }, { t: T0 + 2.5, p: [-0.12, 1.55, 0.75], l: [-0.1, 1.02, 0.0], f: 40 }, { t: C.matthieu - 0.5, p: [-0.12, 1.55, 0.72], l: [-0.1, 1.02, 0.0], f: 40 }, { t: C.matthieu + 0.5, p: [0.12, 1.55, 0.75], l: [0.1, 1.02, 0.0], f: 40 }, { t: C.genese - 0.3, p: [0.12, 1.55, 0.72], l: [0.1, 1.02, 0.0], f: 40 }, { t: C.genese + 0.7, p: [0.35, 1.15, 3.5], l: [0.35, 0.85, 0.8], f: 44 }, { t: SC.fin.start, p: [0.35, 1.15, 3.4], l: [0.35, 0.85, 0.8], f: 44 }]);
      ray.material.opacity = 0.03 + 0.01 * Math.sin(t * 0.8);
      const sk = win(t, C.genese + 0.4, SC.fin.start, 0.4, 0.3); beamOn(rig, sk, t); fade(sword, sk); sword.rotation.y = 0.3 * Math.sin(t);
      flames.forEach((f, i) => { const ph = (t * 1.5 + i / 6) % 1; f.position.set(0.02 * Math.sin(i * 2 + t * 5), -0.15 + i * 0.07, 0.01); f.scale.setScalar(0.7 + 0.5 * Math.abs(Math.sin(t * 9 + i))); });
      rig.c.update(t, env('claude', t), {});
      K.update(t);
    }
  };
};

const SHOTS = [['gal', 0, SC.textes.start], ['textes', SC.textes.start, SC.fin.start], ['gal', SC.fin.start, 1000]];
