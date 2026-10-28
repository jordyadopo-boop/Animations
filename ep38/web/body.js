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
function canvasTex(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
function orient(m, a, b) { const d = b.clone().sub(a), L_ = d.length(); m.visible = L_ > 1e-3; if (!m.visible) return; m.scale.set(1, L_, 1); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); }

// ---------- l'hypercube : 16 sommets (±1)^4, 32 aretes ; ext = etendues sur x, y, z, w (0..1)
function hyper(color = 0x7dd8ff, th = 0.02) {
  const g = new THREE.Group(), V = [], E = [];
  for (let i = 0; i < 16; i++) V.push([i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1, i & 8 ? 1 : -1]);
  for (let i = 0; i < 16; i++) for (let k = 0; k < 4; k++) { const j = i ^ (1 << k); if (j > i) E.push([i, j, k]); }
  const cols = [0x7dd8ff, 0x7dd8ff, 0x7dd8ff, 0xffd070];
  const mats = cols.map((c, k) => new THREE.MeshBasicMaterial({ color: new THREE.Color(k === 3 ? 0xffd070 : color).multiplyScalar(1.6), transparent: true, depthWrite: false }));
  const bars = E.map(([i, j, k]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(th, th, 1, 6), mats[k]); g.add(m); return m; });
  const dots = V.map(() => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(th * 2.2, 1), G(0xffffff, 1.8)); g.add(m); return m; });
  g.userData = { mats,
    // ext : [ex, ey, ez, ew] ; rot : angles des plans xw, yw, zw, xy ; D : distance de projection 4D -> 3D
    set(ext, rot = [0, 0, 0, 0], D = 3) {
      const P = V.map(v => {
        let [x, y, z, w] = v.map((c, k) => c * ext[k]);
        let c, s;
        c = Math.cos(rot[3]); s = Math.sin(rot[3]); [x, y] = [x * c - y * s, x * s + y * c];
        c = Math.cos(rot[0]); s = Math.sin(rot[0]); [x, w] = [x * c - w * s, x * s + w * c];
        c = Math.cos(rot[1]); s = Math.sin(rot[1]); [y, w] = [y * c - w * s, y * s + w * c];
        c = Math.cos(rot[2]); s = Math.sin(rot[2]); [z, w] = [z * c - w * s, z * s + w * c];
        const k = D / (D - w); return new THREE.Vector3(x * k, y * k, z * k);
      });
      E.forEach(([i, j], n) => orient(bars[n], P[i], P[j])); dots.forEach((d, i) => d.position.copy(P[i]));
    }
  };
  g.userData.set([1, 1, 1, 1]);
  return g;
}
// vue en fil de fer d'un cube (12 aretes)
function wireCube(s = 1, color = 0xffffff, th = 0.012) {
  const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.5) });
  const P = []; for (let i = 0; i < 8; i++) P.push(new THREE.Vector3(i & 1 ? s : -s, i & 2 ? s : -s, i & 4 ? s : -s));
  for (let i = 0; i < 8; i++) for (let k = 0; k < 3; k++) { const j = i ^ (1 << k); if (j > i) { const b = new THREE.Mesh(new THREE.CylinderGeometry(th, th, 1, 6), m); orient(b, P[i], P[j]); g.add(b); } }
  g.userData.P = P; return g;
}
function axisArrow(dir, color, len = 0.8) {
  const g = new THREE.Group(), mat = G(color, 1.5);
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, len, 6), mat); sh.position.y = len / 2; g.add(sh);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.12, 8), mat); tip.position.y = len; g.add(tip);
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...dir).normalize()); return g;
}
function holoClaude(scene, pos, ry = 0, color = 0xffd070) { const r = claudeRig(scene, pos, ry, [0.45, 0, 0.1], color, 0.5, 0.3); return r; }
function spaceStudio(o = {}) {
  const B = studioBase({ bg: 0x05060f, fog: [0x05060f, 8, 30], hemi: [0xb8c8ff, 0x10121c, 1.0], bloom: [0.6, 0.5, 0.8], ...o });
  B.scene.add(L.stars(800, 60, 1.2)); return B;
}

// ---------- intro : un cube qui devient tesseract
SETS.intro = () => {
  const B = spaceStudio(); const { scene, cam } = B;
  const H = hyper(); H.position.set(0, 1.5, 0); H.scale.setScalar(0.32); scene.add(H);
  const ax = [[1, 0, 0, 0xff8a6a, 'longueur'], [0, 1, 0, 0x5aff8a, 'hauteur'], [0, 0, 1, 0x7dd8ff, 'largeur']].map(([x, y, z, c, n]) => { const a = axisArrow([x, y, z], c, 0.9); a.position.set(-0.9, 0.5, 0.3); scene.add(a); const l = label(n, { w: 0.7, h: 0.12, color: '#' + new THREE.Color(c).getHexString(), font: 'bold 90px Inter' }); l.position.set(-0.9 + x * 1.15, 0.5 + y * 1.15, 0.3 + z * 1.15); scene.add(l); return [a, l]; });
  const q = label('?', { w: 0.35, h: 0.35, color: '#ffd070', font: 'bold 300px Inter' }); q.position.set(0.6, 2.35, 0.3); scene.add(q);
  return {
    ...B, update(t) {
      const ew = sstep(4.8, 7.5, t); H.userData.set([1, 1, 1, ew], [t * 0.5 * ew, 0, t * 0.3 * ew, t * 0.2]); H.rotation.y = t * 0.25;
      ax.forEach(([a, l], i) => { const k = win(t, 0.6 + i * 0.6, 5.0, 0.3, 0.4); fade(a, k); fade(l, k); l.lookAt(cam.position); });
      fade(q, win(t, 4.6, C.title + 0.5, 0.3, 0.4)); q.lookAt(cam.position);
      camKeys(cam, t, [{ t: 0, p: [0.6, 1.7, 4.2], l: [0, 1.25, 0], f: 48 }, { t: C.title, p: [0, 1.6, 3.9], l: [0, 1.5, 0], f: 48 }, { t: SC.construire.start, p: [0, 1.6, 3.9], l: [0, 1.5, 0], f: 48 }]);
    }
  };
};

// ---------- construire : point, ligne, carre, cube, tesseract
SETS.construire = () => {
  const B = spaceStudio(); const { scene, cam } = B;
  const H = hyper(); H.position.set(0, 1.5, 0); H.scale.setScalar(0.34); scene.add(H);
  const labs = ['0 D · un point', '1 D · une ligne', '2 D · un carré', '3 D · un cube', '4 D · un tesseract'];
  const D = (C.tesseract - SC.construire.start - 1.0) / 4.2;
  const steps = [SC.construire.start + 0.6, SC.construire.start + 0.6 + D * 1.0, SC.construire.start + 0.6 + D * 2.2, SC.construire.start + 0.6 + D * 3.3, C.tesseract + 2.0];
  const K = cardsMgr(scene, cam);
  labs.forEach((s, i) => K(s, { w: 1.4, h: 0.26, border: i === 4 ? '#ffd070' : '#7dd8ff', color: i === 4 ? '#ffd070' : '#ffffff' }, t => win(t, steps[i], i < 4 ? steps[i + 1] : C.compte, 0.3, 0.2), -0.6, 0.6));
  K('16 sommets · 32 arêtes · 24 carrés · 8 cubes', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.compte + 0.3, SC.temps.start, 0.3, 0.2), -0.6);
  K('à angle droit avec x, y et z', { w: 1.6, h: 0.22, border: '#ffd070', color: '#ffe0a0' }, t => win(t, C.tesseract + 0.2, C.tesseract + 2.0, 0.3, 0.2), 0.3, 0.6);
  return {
    ...B, update(t) {
      const e = [sstep(steps[1], steps[1] + 1.5, t), sstep(steps[2], steps[2] + 1.5, t), sstep(steps[3], steps[3] + 1.5, t), sstep(C.tesseract + 0.5, C.tesseract + 3.5, t)];
      const r = sstep(C.tesseract + 3.0, C.tesseract + 4.0, t);
      H.userData.set(e, [t * 0.45 * r, 0, t * 0.3 * r, 0]); H.rotation.set(0.35 * e[2], 0.5 * e[2] + t * 0.15 * e[2], 0);
      camKeys(cam, t, [{ t: SC.construire.start, p: [0, 1.6, 3.9], l: [0, 1.5, 0], f: 48 }, { t: SC.temps.start, p: [0.2, 1.7, 4.1], l: [0, 1.5, 0], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- le temps n'est pas notre sujet
SETS.temps = () => {
  const B = spaceStudio(); const { scene, cam } = B;
  const rig = holoClaude(scene, [-0.1, 0, 0.9], 0.15, 0xffd070); faceLight(scene, [0, 0.6, 2.4], 1.2);
  const clock = new THREE.Group(); rig.holoG.add(clock);
  clock.add(holo(new THREE.TorusGeometry(0.2, 0.012, 6, 40), 0xffd070, 0.5)); const hand1 = at(box(0.012, 0.14, 0.01, holoMat(0xffd070, 0.8)), 0, 0.07, 0), hand2 = at(box(0.012, 0.1, 0.01, holoMat(0xffd070, 0.8)), 0, 0.05, 0); const h1 = new THREE.Group(), h2 = new THREE.Group(); h1.add(hand1); h2.add(hand2); clock.add(h1, h2);
  const ax = [[1, 0, 0, 0xff8a6a], [0, 1, 0, 0x5aff8a], [0, 0, 1, 0x7dd8ff], [-0.7, 0.5, -0.5, 0xffd070]].map(([x, y, z, c], i) => { const a = axisArrow([x, y, z], c, 0.7); a.position.set(0.6, 1.4, -0.3); scene.add(a); return a; });
  const q4 = label('4e direction ?', { w: 1.0, h: 0.16, color: '#ffd070', font: 'bold 100px Inter' }); q4.position.set(0.05, 2.15, -0.6); scene.add(q4);
  const K = cardsMgr(scene, cam);
  K('Minkowski, 1908 : l\'espace-temps', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, SC.temps.start + 3.5, SC.temps.start + 9.0, 0.3, 0.2), -0.6);
  K('ici : une 4e direction de l\'espace', { w: 1.6, h: 0.24, border: '#7dd8ff' }, t => win(t, SC.temps.start + 9.3, SC.flatland.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.temps.start; const ck = win(t, T0 + 0.5, T0 + 9.0, 0.4, 0.3); beamOn(rig, Math.max(ck, 0.001), t); fade(clock, ck); h1.rotation.z = -t * 2; h2.rotation.z = -t * 0.2;
      ax.forEach((a, i) => fade(a, sstep(T0 + 9.3 + (i === 3 ? 1.5 : 0), T0 + 9.8 + (i === 3 ? 1.5 : 0), t) * (i === 3 ? 0.5 + 0.5 * Math.sin(t * 8) : 1)));
      fade(q4, sstep(T0 + 11.0, T0 + 11.5, t)); q4.lookAt(cam.position);
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [0.2, 1.3, 3.6], l: [0.2, 1.1, 0.4], f: 48 }, { t: T0 + 9.0, p: [0.2, 1.3, 3.6], l: [0.2, 1.1, 0.4], f: 48 }, { t: T0 + 9.6, p: [0.4, 1.7, 3.4], l: [0.4, 1.5, 0], f: 48 }, { t: SC.flatland.start, p: [0.4, 1.7, 3.3], l: [0.4, 1.5, 0], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- Flatland : la sphere traverse le monde plat
function flatFolk(kind, color) {
  const g = new THREE.Group(), m = M(color, { emissive: new THREE.Color(color).multiplyScalar(0.25) });
  const geo = kind === 'carre' ? new THREE.BoxGeometry(0.4, 0.02, 0.4) : kind === 'tri' ? new THREE.CylinderGeometry(0.25, 0.25, 0.02, 3) : new THREE.CylinderGeometry(0.2, 0.2, 0.02, 24);
  g.add(new THREE.Mesh(geo, m));
  const eye = new THREE.Mesh(new THREE.CircleGeometry(0.035, 12), new THREE.MeshBasicMaterial({ color: 0x101010 })); eye.rotation.x = -Math.PI / 2; eye.position.set(0.08, 0.012, 0.1); g.add(eye);
  return g;
}
SETS.flatland = () => {
  const B = spaceStudio({ hemi: [0xfff0e0, 0x20202a, 1.2] }); const { scene, cam } = B;
  const world = new THREE.Mesh(new THREE.BoxGeometry(4, 0.02, 4), M(0xf0e6cc)); world.position.y = 0.6; scene.add(world);
  for (let i = 0; i < 9; i++) scene.add(at(box(0.04, 0.025, 4, M(0xd8ccb0)), -2 + i * 0.5, 0.6, 0)).children;
  const sq = flatFolk('carre', 0x3a7ad8); sq.position.set(-0.6, 0.62, 0.7); scene.add(sq);
  const tri = flatFolk('tri', 0xd85a3a); tri.position.set(1.2, 0.62, -0.8); scene.add(tri);
  const ci = flatFolk('rond', 0x3aa85a); ci.position.set(-1.3, 0.62, -1.1); scene.add(ci);
  const sph = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 3), new THREE.MeshLambertMaterial({ color: 0xff8a6a, transparent: true, opacity: 0.55, emissive: new THREE.Color(0x401808) })); scene.add(sph);
  const slice = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.03, 48), G(0xff6a3a, 1.8)); slice.position.set(0.3, 0.615, 0); scene.add(slice);
  const up = label('« au-dessus » ?', { w: 1.2, h: 0.18, color: '#ffd070', font: 'bold 100px Inter' }); up.position.set(-0.6, 1.4, 0.7); scene.add(up);
  const K = cardsMgr(scene, cam);
  K('Edwin A. Abbott · « Flatland »', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, SC.flatland.start + 2.6, SC.flatland.start + 7.5, 0.3, 0.2), -0.6);
  K('le carré ne voit que des tranches', { w: 1.6, h: 0.24, border: '#ff8a6a' }, t => win(t, C.sphere + 6.0, SC.nous.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.flatland.start, S = C.sphere;
      sq.position.x = -0.6 + 0.2 * Math.sin(t * 0.7); tri.rotation.y = t * 0.3;
      fade(up, win(t, T0 + 8.0, S, 0.3, 0.3)); up.lookAt(cam.position);
      const h = lerp(0.9, -0.9, sstep(S + 0.8, S + 7.5, t)); sph.position.set(0.3, 0.6 + h, 0); sph.visible = t > S - 0.5;
      const r2 = 0.36 - h * h; slice.visible = r2 > 0 && sph.visible; slice.scale.set(Math.sqrt(Math.max(r2, 0.0001)), 1, Math.sqrt(Math.max(r2, 0.0001)));
      camKeys(cam, t, [{ t: T0, p: [0.0, 3.6, 4.6], l: [0, 0.5, 0], f: 50 }, { t: S, p: [0.0, 3.4, 4.6], l: [0, 0.6, 0], f: 50 }, { t: S + 1.5, p: [-0.8, 2.0, 4.0], l: [0.1, 0.7, 0], f: 50 }, { t: SC.nous.start, p: [-0.8, 1.9, 3.9], l: [0.1, 0.7, 0], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- nous : une boule 4D traverse la chambre ; l'oeil et le cerveau
SETS.nous = () => {
  const B = base({ bg: 0x1a1620, fog: [0x1a1620, 8, 24], hemi: [0xffeedd, 0x2a2430, 1.0], sun: [0xfff0e0, 1.2, [2, 5, 5]], shadowSize: 4, bloom: [0.6, 0.5, 0.82], exposure: 1.0, target: [0, 1, 0] }); const { scene, cam } = B;
  scene.add(at(box(8, 0.1, 6, M(0x6a5a4a)), 0, -0.05, 0)); scene.add(at(box(8, 3.2, 0.2, M(0xc8d0e0)), 0, 1.6, -2)); scene.add(at(box(0.2, 3.2, 6, M(0xb8c0d0)), -3, 1.6, 1));
  scene.add(at(box(1.4, 0.4, 2.0, M(0x5a6a9a)), -1.8, 0.2, -0.8)); scene.add(at(box(1.4, 0.15, 0.4, M(0xf0f0f0)), -1.8, 0.47, -1.55));
  scene.add(at(box(0.8, 0.75, 0.5, M(0x8a6a4a)), 1.9, 0.37, -1.5)); scene.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.3, 10), M(0xffd070, { emissive: new THREE.Color(0x403010) })), 1.9, 0.9, -1.5));
  const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 3), new THREE.MeshLambertMaterial({ color: 0xc08aff, transparent: true, opacity: 0.8, emissive: new THREE.Color(0x301a50) })); ball.position.set(0.2, 1.2, -0.2); scene.add(ball);
  // l'oeil et le cerveau (hologrammes)
  const rig = holoClaude(scene, [0.9, 0, 1.2], -0.3, 0x9adfff); faceLight(scene, [0.6, 0.7, 2.6], 1.2);
  const eye = new THREE.Group(); rig.holoG.add(eye); eye.position.set(-0.2, 0.1, 0);
  eye.add(holo(new THREE.IcosahedronGeometry(0.1, 2), 0xffffff, 0.15)); const iris = new THREE.Mesh(new THREE.CircleGeometry(0.04, 16), G(0x3a8aff, 1.6)); iris.position.z = 0.1; eye.add(iris);
  const img = holo(new THREE.PlaneGeometry(0.16, 0.16), 0x9adfff, 0.3); img.position.set(0.05, 0.1, 0); img.rotation.y = -0.6; rig.holoG.add(img);
  const brain = holo(new THREE.IcosahedronGeometry(0.11, 1), 0xff9ac8, 0.25); brain.scale.set(1.2, 0.9, 1); brain.position.set(0.28, 0.12, 0); rig.holoG.add(brain);
  const lab = label('image plate → profondeur', { w: 0.8, h: 0.1, color: '#ffffff', font: 'bold 70px Inter' }); lab.position.set(0.05, -0.08, 0); rig.holoG.add(lab);
  const K = cardsMgr(scene, cam);
  K('une coupe 3D d\'une boule 4D', { w: 1.6, h: 0.24, border: '#c08aff' }, t => win(t, SC.nous.start + 3.0, C.cerveau, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.nous.start; const w = lerp(-1.1, 1.1, clamp((t - T0 - 1.5) / (C.cerveau - T0 - 2.5), 0, 1)); const r2 = 1 - w * w;
      ball.visible = r2 > 0.002 && t < C.cerveau; ball.scale.setScalar(Math.sqrt(Math.max(r2, 0.0001)) * 0.9);
      const ek = sstep(C.cerveau + 0.5, C.cerveau + 1.0, t); beamOn(rig, ek, t); [eye, img, brain, lab].forEach(o => fade(o, ek)); lab.lookAt(cam.position); brain.rotation.y = t;
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [0.6, 1.6, 4.4], l: [0, 1.1, -0.4], f: 50 }, { t: C.cerveau - 0.4, p: [0.4, 1.5, 4.2], l: [0, 1.1, -0.4], f: 50 }, { t: C.cerveau + 0.6, p: [1.15, 1.3, 4.3], l: [1.2, 0.95, 1.2], f: 46 }, { t: SC.pouvoirs.start, p: [1.15, 1.3, 4.2], l: [1.2, 0.95, 1.2], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- les pouvoirs d'un etre en 4D : le coffre, le miroir
SETS.pouvoirs = () => {
  const B = spaceStudio(); const { scene, cam } = B;
  const safe = new THREE.Group(); safe.position.set(-0.5, 0.45, 0); scene.add(safe);
  const shell = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), new THREE.MeshLambertMaterial({ color: 0x6a7080, transparent: true, opacity: 0.35 })); safe.add(shell);
  safe.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.9, 0.9, 0.9)), new THREE.LineBasicMaterial({ color: 0xc8d0e0 })));
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16), M(0xc8c8d0)); dial.rotation.x = Math.PI / 2; dial.position.set(0.2, 0.1, 0.47); safe.add(dial);
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), G(0x5aff8a, 1.5)); scene.add(gem);
  const H = hyper(0xffd070, 0.012); H.scale.setScalar(0.12); scene.add(H);
  const mirrorL = label('R', { w: 0.6, h: 0.6, color: '#ffffff', font: 'bold 400px Inter' }); scene.add(mirrorL);
  const cl = L.makeClaude(); cl.g.position.set(0.9, 0, 0.2); scene.add(cl.g);
  const K = cardsMgr(scene, cam);
  K('il verrait l\'intérieur des objets fermés', { w: 1.6, h: 0.24, border: '#5aff8a' }, t => win(t, SC.pouvoirs.start + 1.0, C.miroir, 0.3, 0.2), -0.6);
  K('gauche ↔ droite : comme dans un miroir', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.miroir + 1.0, SC.ombres.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.pouvoirs.start, M_ = C.miroir;
      // le joyau sort du coffre "par la 4e dimension" : il s'efface puis reapparait dehors
      const out = sstep(T0 + 5.0, T0 + 6.5, t); const vis = 1 - win(t, T0 + 5.0, T0 + 6.5, 0.5, 0.5) * 0.95;
      gem.position.set(lerp(-0.5, 0.3, out), 0.45 + 0.05 * Math.sin(t * 2) + 0.4 * out, lerp(0, 0.5, out)); gem.rotation.y = t; gem.material.color.setHex(0x5aff8a).multiplyScalar(1.5 * vis); gem.scale.setScalar(Math.max(0.05, vis));
      H.position.set(-0.1, 1.25, 0.2); H.userData.set([1, 1, 1, 1], [t * 0.8, 0, t * 0.5, 0]); fade(H, win(t, T0 + 4.5, T0 + 7.5, 0.4, 0.4));
      // le miroir : Claude (bras leve) est retourne
      const fl = Math.cos(Math.PI * sstep(M_ + 1.0, M_ + 3.0, t)); cl.g.scale.set(fl, 1, 1); cl.update(t, 0, { wave: sstep(M_, M_ + 0.5, t) });
      mirrorL.position.set(0.9, 1.05, 0.2); mirrorL.scale.set(fl, 1, 1); fade(mirrorL, sstep(M_ + 0.3, M_ + 0.8, t));
      camKeys(cam, t, [{ t: T0, p: [-0.4, 1.4, 2.8], l: [-0.4, 0.6, 0], f: 48 }, { t: M_ - 0.3, p: [-0.2, 1.4, 3.0], l: [-0.2, 0.7, 0], f: 48 }, { t: M_ + 0.6, p: [0.7, 1.0, 2.6], l: [0.8, 0.6, 0.2], f: 48 }, { t: SC.ombres.start, p: [0.7, 1.0, 2.5], l: [0.8, 0.6, 0.2], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- ombres : le cube sur la feuille, le tesseract dans notre espace
SETS.ombres = () => {
  const B = spaceStudio({ hemi: [0xb8c8ff, 0x10121c, 0.8] }); const { scene, cam } = B;
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), M(0xf0ece0)); sheet.rotation.x = -Math.PI / 2; sheet.position.set(-0.6, 0.02, 0); scene.add(sheet);
  const cube = wireCube(0.25, 0xffffff, 0.01); cube.position.set(-0.6, 0.75, 0); scene.add(cube);
  const bulb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 1), G(0xffe0a0, 3)); bulb.position.set(-0.6, 1.5, 0); scene.add(bulb);
  // ombre : projection centrale depuis l'ampoule sur la feuille
  const shadowBars = []; const shM = new THREE.MeshBasicMaterial({ color: 0x202028 });
  const Pc = cube.userData.P; const edges = []; for (let i = 0; i < 8; i++) for (let k = 0; k < 3; k++) { const j = i ^ (1 << k); if (j > i) edges.push([i, j]); }
  edges.forEach(() => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 4), shM); scene.add(b); shadowBars.push(b); });
  const H = hyper(0x7dd8ff, 0.016); H.position.set(0.7, 1.4, -0.2); H.scale.setScalar(0.38); scene.add(H);
  const K = cardsMgr(scene, cam);
  K('ombre d\'un cube = un carré dans un carré', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, SC.ombres.start + 4.0, SC.ombres.start + 8.0, 0.3, 0.2), -0.6);
  K('ombre d\'un tesseract = un cube dans un cube', { w: 1.6, h: 0.24, border: '#7dd8ff' }, t => win(t, SC.ombres.start + 8.2, SC.hinton.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.ombres.start; cube.rotation.set(0, 0, 0);
      const L0 = bulb.position; const proj = (p) => { const w = p.clone().add(cube.position); const k = (L0.y - 0.025) / (L0.y - w.y); return new THREE.Vector3(L0.x + (w.x - L0.x) * k, 0.025, L0.z + (w.z - L0.z) * k); };
      edges.forEach(([i, j], n) => orient(shadowBars[n], proj(Pc[i]), proj(Pc[j])));
      H.userData.set([1, 1, 1, 1], [t * 0.6, 0, 0, t * 0.1]); fade(H, sstep(T0 + 7.5, T0 + 8.3, t));
      camKeys(cam, t, [{ t: T0, p: [-0.6, 2.7, 2.5], l: [-0.6, 0.35, 0], f: 50 }, { t: T0 + 7.5, p: [-0.5, 2.6, 2.6], l: [-0.6, 0.35, 0], f: 50 }, { t: T0 + 8.5, p: [0.6, 1.6, 2.6], l: [0.7, 1.35, -0.2], f: 48 }, { t: SC.hinton.start, p: [0.6, 1.6, 2.5], l: [0.7, 1.35, -0.2], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- Hinton, 4D Toys, Dali
SETS.hinton = () => {
  const B = base({ bg: 0x0a0806, fog: [0x0a0806, 6, 20], hemi: [0xffe0c0, 0x1a1008, 0.8], sun: [0xfff0d8, 0.9, [1, 5, 5]], shadowSize: 3, bloom: [0.55, 0.5, 0.82], exposure: 1.0, target: [0, 1, 0] }); const { scene, cam } = B;
  scene.add(at(box(8, 0.1, 8, M(0x3a2a1e)), 0, -0.05, 0)); scene.add(at(box(8, 4, 0.2, M(0x6a5a48)), 0, 2, -1.6));
  scene.add(at(box(1.6, 0.06, 0.8, M(0x5a3a22)), 0, 0.8, 0.2)); for (const [x, z] of [[-0.7, -0.1], [0.7, -0.1], [-0.7, 0.5], [0.7, 0.5]]) scene.add(at(box(0.06, 0.8, 0.06, M(0x3a2414)), x, 0.4, z));
  const cubes = new THREE.Group(); cubes.position.set(0.1, 0.9, 0.35); scene.add(cubes);
  const pal = [0xd83a3a, 0x3a7ad8, 0xe8c83a, 0x3aa85a, 0xf0f0f0, 0x8a3ad8, 0xe87a2a, 0x2ac8c8];
  for (let i = 0; i < 27; i++) { const x = i % 3, y = Math.floor(i / 9), z = Math.floor(i / 3) % 3; cubes.add(at(box(0.075, 0.075, 0.075, M(pal[(x + 2 * y + 3 * z) % 8])), (x - 1) * 0.085, y * 0.085, (z - 1) * 0.085)); }
  const hin = new Human({ skin: 0xe8c0a0, hair: 0x6a4a2a, hairStyle: 'short', beard: 'full', top: 0xf0f0f0, bottom: 0x2a2a30, jacket: 0x2a2a30, seed: 3801 }); hin.place(0, 0, -0.45, 0); scene.add(hin.root);
  faceLight(scene, [0.1, 1.6, 0.9], 1.5, 0xffd8a8);
  // ecran de jeu (tranches d'une boule 4D)
  const scr = new THREE.Group(); scr.position.set(40, 1.3, 0); scene.add(scr);
  scr.add(at(box(1.5, 1.0, 0.06, M(0x1a1a20)), 0, 0, -0.04)); const sc = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.9), M(0x0a1830, { emissive: new THREE.Color(0x0a1830) })); scr.add(sc); const sl = new THREE.PointLight(0xffffff, 2, 3, 1.4); sl.position.set(0, 0.2, 0.9); scr.add(sl);
  const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 2), M(0x5aff8a, { emissive: new THREE.Color(0x0a4020) })); blob.position.z = 0.1; scr.add(blob);
  const tor = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 10, 30), M(0xffd070, { emissive: new THREE.Color(0x402a08) })); tor.position.set(0.4, -0.15, 0.1); scr.add(tor);
  const ttl = label('4D Toys (2017)', { w: 0.8, h: 0.12, color: '#ffffff', font: 'bold 90px Inter' }); ttl.position.set(0, 0.36, 0.06); scr.add(ttl);
  // le tesseract deplie (8 cubes en croix)
  const net = new THREE.Group(); net.position.set(-40, 1.3, 0); scene.add(net);
  [[0, -1.5, 0], [0, -0.5, 0], [0, 0.5, 0], [0, 1.5, 0], [-1, 0.5, 0], [1, 0.5, 0], [0, 0.5, 1], [0, 0.5, -1]].forEach(([x, y, z]) => net.add(at(holo(new THREE.BoxGeometry(0.98, 0.98, 0.98), 0xffd070, 0.08), x, y, z)));
  net.scale.setScalar(0.32);
  const K = cardsMgr(scene, cam);
  K('Charles Howard Hinton · 1853 – 1907\ninvente le mot « tesseract » (1888)', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.hinton.start + 1.5, SC.hinton.start + 7.5, 0.3, 0.2), -0.6);
  imagined(K, 'scène imaginée', SC.hinton.start + 1.0, SC.hinton.start + 7.5);
  K('Salvador Dalí · « Corpus Hypercubus » (1954)\nun tesseract déplié en 8 cubes', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, C.dali + 0.4, SC.physique.start, 0.3, 0.2), -0.6);
  const t2 = SC.hinton.start + 8.2;
  return {
    ...B, update(t) {
      const T0 = SC.hinton.start;
      hin.pose(L.sitPose(0.5, { aL: [1.0, 0.1], aR: [1.05, 0.15], eL: 0.9, eR: 1.0, hp: 0.35 })); hin.face(0, 'neutral', t); cubes.rotation.y = 0.2 * Math.sin(t * 0.4);
      const s = 1 - Math.pow(((t * 0.35) % 2) - 1, 2); blob.scale.setScalar(0.2 + 0.8 * s); tor.rotation.set(t, t * 0.7, 0); tor.scale.setScalar(0.3 + 0.7 * (1 - s));
      net.rotation.y = t * 0.4;
      camKeys(cam, t, [{ t: T0, p: [0.3, 1.5, 2.6], l: [0, 1.05, -0.1], f: 46 }, { t: t2 - 0.1, p: [0.25, 1.4, 2.2], l: [0, 1.0, 0], f: 46 }, { t: t2, p: [40, 1.4, 2.6], l: [40, 1.3, 0], f: 46 }, { t: C.dali - 0.1, p: [40, 1.4, 2.5], l: [40, 1.3, 0], f: 46 }, { t: C.dali, p: [-40, 1.6, 3.0], l: [-40, 1.3, 0], f: 48 }, { t: SC.physique.start, p: [-40, 1.6, 2.9], l: [-40, 1.3, 0], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- physique : dimensions enroulees (le tuyau d'arrosage)
SETS.physique = () => {
  const B = spaceStudio(); const { scene, cam } = B;
  const hose = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 30, 24, 1, true), M(0x3aa85a, { side: THREE.DoubleSide, emissive: new THREE.Color(0x0a2010) })); hose.rotation.z = Math.PI / 2; hose.position.y = 1.2; scene.add(hose);
  for (let i = 0; i < 40; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.051, 0.003, 4, 24), G(0x9aff9a, 1.2)); r.rotation.y = Math.PI / 2; r.position.set(-10 + i * 0.5, 1.2, 0); scene.add(r); }
  const ant = new THREE.Group(); scene.add(ant); for (let k = 0; k < 3; k++) ant.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.006, 1), M(0x101010)), 0.008 * k, 0, 0));
  const K = cardsMgr(scene, cam);
  K('de loin : une ligne · de près : un cercle', { w: 1.6, h: 0.24, border: '#5aff8a' }, t => win(t, SC.physique.start + 6.5, SC.physique.start + 11.5, 0.3, 0.2), -0.6);
  K('théorie des cordes · dimensions enroulées\naucune détectée à ce jour', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.physique.start + 11.7, SC.fin.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.physique.start; const a = t * 3; ant.position.set(0.0 + (t - T0) * 0.01, 1.2 + Math.cos(a) * 0.056, Math.sin(a) * 0.056);
      camKeys(cam, t, [{ t: T0, p: [0, 1.6, 8], l: [0, 1.2, 0], f: 50 }, { t: T0 + 5.5, p: [0, 1.5, 7], l: [0, 1.2, 0], f: 50 }, { t: T0 + 8.0, p: [0.2, 1.3, 0.45], l: [0.0, 1.2, 0], f: 44 }, { t: SC.fin.start, p: [0.25, 1.3, 0.4], l: [0.0, 1.2, 0], f: 44 }]);
      K.update(t);
    }
  };
};

// ---------- fin
SETS.fin = () => {
  const B = spaceStudio(); const { scene, cam } = B;
  const rig = holoClaude(scene, [-0.1, 0, 0.9], 0.15, 0x7dd8ff); faceLight(scene, [0, 0.6, 2.4], 1.2);
  const H = hyper(0x7dd8ff, 0.012); H.scale.setScalar(0.15); H.position.set(0, 0.3, 0); rig.holoG.add(H);
  return {
    ...B, update(t) {
      beamOn(rig, 1, t); H.userData.set([1, 1, 1, 1], [t * 0.7, 0, t * 0.4, t * 0.1]);
      rig.c.update(t, env('claude', t), { wave: sstep(TL.duration - 2.0, TL.duration - 1.5, t) });
      camKeys(cam, t, [{ t: SC.fin.start, p: [0.2, 1.1, 3.6], l: [0.2, 0.9, 0.5], f: 46 }, { t: TL.duration, p: [0.2, 1.0, 3.1], l: [0.2, 0.85, 0.5], f: 46 }]);
    }
  };
};

// ---------- couverture : le tesseract
SETS.cover = () => {
  const B = spaceStudio({ bloom: [0.55, 0.4, 0.75] }); const { scene, cam } = B;
  const H = hyper(0x7dd8ff, 0.03); H.position.set(0, 1.85, 0); H.scale.setScalar(0.36); scene.add(H); H.userData.set([1, 1, 1, 1], [0.55, 0.25, 0.35, 0.15]);
  return { ...B, update() { cam.position.set(0, 1.5, 4.6); cam.fov = 50; cam.updateProjectionMatrix(); cam.lookAt(0, 1.15, 0); } };
};

const SHOTS = [['intro', 0, SC.construire.start], ['construire', SC.construire.start, SC.temps.start], ['temps', SC.temps.start, SC.flatland.start], ['flatland', SC.flatland.start, SC.nous.start], ['nous', SC.nous.start, SC.pouvoirs.start], ['pouvoirs', SC.pouvoirs.start, SC.ombres.start], ['ombres', SC.ombres.start, SC.hinton.start], ['hinton', SC.hinton.start, SC.physique.start], ['physique', SC.physique.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
