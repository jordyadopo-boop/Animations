const SETS = {};
// ---------- helpers
function card(text, o = {}) {
  const w = o.w ?? 2.2, h = o.h ?? 0.42, c = document.createElement('canvas'); c.width = 1024; c.height = Math.round(1024 * h / w);
  const g = c.getContext('2d');
  g.fillStyle = o.bg ?? 'rgba(8,10,20,0.82)'; g.strokeStyle = o.border ?? '#e0b070'; g.lineWidth = 8;
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
function faceLight(scene, pos, k = 1.6, c = 0xfff0e0, d = 4) { const l = new THREE.PointLight(c, k, d, 1.2); l.position.set(...pos); scene.add(l); return l; }

// ---------- l'espace
function spaceBase(o = {}) {
  const B = base({ bg: 0x020308, hemi: [0x8090c0, 0x050508, o.hemiK ?? 0.35], sun: o.sun ?? [0xfff4e0, 2.0, [3, 4, 5]], shadow: false, bloom: o.bloom ?? [0.7, 0.5, 0.75], exposure: o.exposure ?? 1.0 });
  B.scene.add(L.stars(1500, 300, 1.4));
  return B;
}
function asteroid(scene, pos, s = 1) {
  const geo = new THREE.IcosahedronGeometry(0.6, 1); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const k = 0.85 + 0.3 * hash(Math.round(p.getX(i) * 9) * 7 + Math.round(p.getY(i) * 9) * 13 + Math.round(p.getZ(i) * 9)); p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.45, p.getZ(i) * k); }
  geo.computeVertexNormals(); const m = new THREE.Mesh(geo, M(0x5a5560)); m.position.set(...pos); m.scale.setScalar(s); scene.add(m); return m;
}
function claudeOnRock(scene, pos, ry = 0, color = 0x55e6ff) {
  asteroid(scene, [pos[0], pos[1] - 0.12, pos[2]], 0.55);
  return claudeRig(scene, pos, ry, [0.42, 0, 0.0], color, 0.45, 0.28);
}
// le Soleil : boule eblouissante + halo
function makeSun(R = 1) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(R, 3), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc060).multiplyScalar(1.15) })));
  const glow = (k, op) => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, `rgba(255,220,150,${op})`); gr.addColorStop(0.25, `rgba(255,170,80,${op * 0.6})`); gr.addColorStop(0.6, `rgba(255,120,40,${op * 0.18})`); gr.addColorStop(1, 'rgba(255,100,30,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); sp.scale.setScalar(R * k); return sp; };
  const halo = glow(4.2, 0.9), halo2 = glow(9, 0.35); g.add(halo, halo2);
  const light = new THREE.PointLight(0xfff0d8, 3.0, 0, 0); g.add(light);
  g.userData = { halo, light, update(t) { halo.scale.setScalar(R * 4.2 * (1 + 0.04 * Math.sin(t * 3))); halo2.scale.setScalar(R * 9 * (1 + 0.05 * Math.sin(t * 2 + 1))); } };
  return g;
}
// la Terre : ocean bleu, continents verts, calottes blanches, atmosphere
function makeEarth(R = 1, seed = 0) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(R, 3), M(0x2a62b8)));
  for (let i = 0; i < 22; i++) {
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(R * (0.12 + hash(i + seed) * 0.16), 1), M(i % 4 === 3 ? 0xc8a868 : 0x4a9a44));
    const a = hash(i * 3 + seed) * Math.PI * 2, b = (hash(i * 7 + seed) - 0.5) * 2.2;
    c.position.set(Math.cos(a) * Math.cos(b) * R * 0.94, Math.sin(b) * R * 0.94, Math.sin(a) * Math.cos(b) * R * 0.94); c.scale.set(1, 1, 0.3); c.lookAt(0, 0, 0); g.add(c);
  }
  for (const s of [-1, 1]) { const ic = new THREE.Mesh(new THREE.IcosahedronGeometry(R * 0.32, 1), M(0xf4f8ff)); ic.position.y = s * R * 0.86; ic.scale.y = 0.35; g.add(ic); }
  g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(R * 1.05, 3), holoMat(0x6ac0ff, 0.12)));
  return g;
}
// la Lune : grise, cratere marque d'orange sur la face visible (+x)
function makeMoon(R = 0.3, mark = true) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(R, 2), M(0xb8b4ac)));
  for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new THREE.CircleGeometry(R * (0.12 + hash(i) * 0.14), 8), M(0x8a867e, { side: THREE.DoubleSide })); const a = hash(i * 5) * Math.PI * 2, b = (hash(i * 9) - 0.5) * 2.4; const p = new THREE.Vector3(Math.cos(a) * Math.cos(b), Math.sin(b), Math.sin(a) * Math.cos(b)).multiplyScalar(R * 1.005); c.position.copy(p); c.lookAt(p.clone().multiplyScalar(2)); g.add(c); }
  if (mark) { const m = new THREE.Mesh(new THREE.CircleGeometry(R * 0.28, 12), G(0xff9a50, 1.6)); m.position.set(R * 1.01, 0, 0); m.rotation.y = Math.PI / 2; g.add(m); g.userData.mark = m; }
  return g;
}
// trainee de points (n points ; on donne une fonction u -> position)
function makeTrail(n, color, size = 0.05, op = 0.9) {
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ size, color: new THREE.Color(color).multiplyScalar(1.4), transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending }));
  p.frustumCulled = false;
  p.userData.set = (fn, count = n) => { const a = geo.attributes.position.array; for (let i = 0; i < count; i++) { const v = fn(i / Math.max(1, n - 1)); a[i * 3] = v[0]; a[i * 3 + 1] = v[1]; a[i * 3 + 2] = v[2]; } geo.setDrawRange(0, count); geo.attributes.position.needsUpdate = true; };
  return p;
}
// cercle d'orbite
function ring(r, color, op = 0.35, th = 0.012) { const m = new THREE.Mesh(new THREE.TorusGeometry(r, th, 4, 128), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.4), transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })); m.rotation.x = Math.PI / 2; return m; }
// fleche (origine, direction unitaire, longueur)
function arrow(color, th = 0.04) {
  const g = new THREE.Group(), mat = G(color, 1.6);
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(th, th, 1, 6), mat); sh.position.y = 0.5; g.add(sh);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(th * 2.6, th * 6, 8), mat); g.add(tip);
  g.userData.set = (o, dir, len) => { g.position.copy(o); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()); sh.scale.y = len - th * 5; sh.position.y = (len - th * 5) / 2; tip.position.y = len - th * 3; };
  return g;
}
// cylindre unitaire tendu entre a et b (marges ma, mb)
function orient(m, a, b, ma = 1.05, mb = 0.32) { const d = b.clone().sub(a), L = d.length(); d.normalize(); m.scale.y = L - ma - mb; m.position.copy(a).addScaledVector(d, ma + (L - ma - mb) / 2); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); }
const lbl = (s, color, w = 1.2, h = 0.22, px = 150) => label(s, { w, h, color, font: `bold ${px}px Inter` });
// petit dinosaure (hologramme)
function makeDino(color) {
  const g = new THREE.Group(), m = holoMat(color, 0.22);
  g.add(at(box(0.5, 0.3, 0.9, m), 0, 0.5, 0));
  const neck = box(0.14, 0.7, 0.16, m); neck.position.set(0, 0.85, 0.5); neck.rotation.x = 0.6; g.add(neck);
  g.add(at(box(0.18, 0.14, 0.28, m), 0, 1.15, 0.78));
  const tail = box(0.12, 0.12, 0.9, m); tail.position.set(0, 0.55, -0.8); tail.rotation.x = -0.2; g.add(tail);
  for (const [x, z] of [[-0.18, 0.3], [0.18, 0.3], [-0.18, -0.3], [0.18, -0.3]]) g.add(at(box(0.1, 0.38, 0.1, m), x, 0.19, z));
  return g;
}

// fusee : nez vers +z
function makeRocket(s = 1) {
  const g = new THREE.Group(), w = M(0xf0f0f4), r = M(0xd94a3a);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.8, 12), w); body.rotation.x = Math.PI / 2; g.add(body);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.35, 12), r); nose.rotation.x = Math.PI / 2; nose.position.z = 0.57; g.add(nose);
  const win_ = new THREE.Mesh(new THREE.CircleGeometry(0.06, 12), G(0x9adfff, 1.4)); win_.position.set(0, 0.161, 0.15); win_.rotation.x = -Math.PI / 2; g.add(win_);
  for (let i = 0; i < 4; i++) { const f = box(0.02, 0.22, 0.25, r); const a = i * Math.PI / 2; f.position.set(Math.cos(a) * 0.2, Math.sin(a) * 0.2, -0.3); f.rotation.z = a + Math.PI / 2; g.add(f); }
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.45, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffa040).multiplyScalar(2), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); flame.rotation.x = -Math.PI / 2; flame.position.z = -0.62; g.add(flame);
  g.scale.setScalar(s); g.userData.flame = flame; g.userData.tick = (t) => { flame.scale.set(1, 1 + 0.25 * Math.sin(t * 31), 1); };
  return g;
}
// petite galaxie spirale en points
function miniGalaxy(seed = 1, R = 0.35, n = 160, hue = 0.6) {
  const geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const r = R * Math.pow(hash(i * 1.7 + seed), 0.8), a = (i % 2) * Math.PI + Math.log(r / R + 0.05) * 2.4 + (hash(i * 3.1 + seed) - 0.5) * 0.6; pos.set([Math.cos(a) * r, (hash(i * 5 + seed) - 0.5) * 0.03, Math.sin(a) * r], i * 3); const c = new THREE.Color().setHSL(r < R * 0.3 ? 0.1 : hue, 0.6, 0.7); col.set([c.r, c.g, c.b], i * 3); }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.03, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); p.rotation.set(hash(seed) * 2, hash(seed * 3) * 3, hash(seed * 5)); return p;
}
// surface de courbure k (grille holo)
function curvGrid(k, color, size = 1.6) {
  const geo = new THREE.PlaneGeometry(size, size, 16, 16); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, k === 'sphere' ? -0.35 * (x * x + z * z) : k === 'selle' ? 0.35 * (x * x - z * z) : 0); }
  const g = new THREE.Group(); g.add(new THREE.LineSegments(new THREE.WireframeGeometry(geo), new THREE.LineBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.6), transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })));
  g.add(new THREE.Mesh(geo, holoMat(color, 0.08))); return g;
}

// ---------- intro : la fusee file tout droit ; un mur ?
SETS.intro = () => {
  const B = spaceBase({ hemiK: 0.6, sun: [0xfff4e0, 1.6, [2, 3, 6]] }); const { scene, cam } = B;
  const rk = makeRocket(1); scene.add(rk);
  const dust = new THREE.Group(); scene.add(dust);
  for (let i = 0; i < 300; i++) dust.add(at(new THREE.Mesh(new THREE.OctahedronGeometry(0.015 + hash(i) * 0.02), G(0xc8d8ff, 0.9)), (hash(i * 3) - 0.5) * 12, (hash(i * 5) - 0.5) * 12, hash(i * 7) * 120));
  const wall = new THREE.Group(); scene.add(wall);
  wall.add(holo(new THREE.PlaneGeometry(30, 30, 10, 10), 0xff8a6a, 0.04));
  const q = label('?', { w: 7, h: 7, color: '#ffd070', font: 'bold 300px Inter' }); q.position.z = 0.1; wall.add(q);
  const V = 8;
  return {
    ...B, update(t) {
      const z = V * t; rk.position.set(0, 0, z); rk.rotation.z = t * 0.3; rk.userData.tick(t);
      wall.position.set(0, 0, V * SC.bulle.start + 25); wall.rotation.y = Math.PI; fade(wall, win(t, 3.8, C.title + 2.0, 0.6, 0.6) * 0.9);
      const k = sstep(0, 3.5, t); cam.position.set(lerp(1.2, 0.35, k), lerp(0.5, 0.75, k), z - lerp(2.6, 3.4, k)); cam.fov = 50; cam.updateProjectionMatrix(); cam.lookAt(0, 0.15, z + 3);
    }
  };
};

// ---------- la bulle de l'univers observable
SETS.bulle = () => {
  const B = spaceBase({ hemiK: 0.4 }); const { scene, cam } = B;
  const R = 4;
  const bub = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(R, 2)), new THREE.LineBasicMaterial({ color: new THREE.Color(0x7dd8ff).multiplyScalar(1.3), transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(bub);
  const us = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 1), G(0x7dd8ff, 3)); scene.add(us);
  const lUs = lbl('nous', '#9adfff', 0.8, 0.24, 150); lUs.position.set(0, 0.35, 0); scene.add(lUs);
  const gals = new THREE.Group(); scene.add(gals);
  for (let i = 0; i < 70; i++) { const d = new THREE.Vector3(hash(i * 3) - 0.5, hash(i * 5) - 0.5, hash(i * 7) - 0.5).normalize().multiplyScalar(0.8 + Math.pow(hash(i * 11), 0.6) * 7); const g = miniGalaxy(i + 1, 0.18 + hash(i) * 0.15, 90, 0.55 + 0.1 * hash(i * 2)); g.position.copy(d); g.userData.out = d.length() > R; gals.add(g); }
  const diam = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 2 * R, 6), holoMat(0xffd070, 0.7)); diam.rotation.z = Math.PI / 2; scene.add(diam);
  const lD = lbl('≈ 93 milliards d\'années-lumière', '#ffd070', 5.0, 0.32, 58); lD.position.set(0, -0.45, 0); scene.add(lD);
  const rays = new THREE.Group(); scene.add(rays);
  for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.04, 0), G(0xfff0c0, 2)); m.userData.d = new THREE.Vector3(hash(i * 13) - 0.5, hash(i * 17) - 0.5, hash(i * 19) - 0.5).normalize(); m.userData.r0 = 4.5 + hash(i * 23) * 3; rays.add(m); }
  const K = cardsMgr(scene, cam);
  K('≈ 93 milliards d\'années-lumière de large', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, SC.bulle.start + 4.5, C.lumiere, 0.3, 0.2), -0.6);
  K('l\'univers a ≈ 13,8 milliards d\'années', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.lumiere + 2.5, SC.expansion.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.bulle.start; fade(bub, sstep(T0 + 1.0, T0 + 2.5, t)); bub.rotation.y = t * 0.05;
      gals.children.forEach((g, i) => { g.rotation.y += 0; const outK = g.userData.out ? 1 - 0.85 * sstep(C.lumiere, C.lumiere + 1.5, t) : 1; fade(g, outK); });
      const dk = win(t, T0 + 4.5, C.lumiere, 0.4, 0.3); fade(diam, dk); fade(lD, 0); lD.lookAt(cam.position); lUs.lookAt(cam.position); fade(lUs, win(t, T0 + 1.5, C.lumiere, 0.3, 0.3));
      const rk = sstep(C.lumiere + 0.5, C.lumiere + 1.0, t) * (1 - sstep(SC.expansion.start - 0.5, SC.expansion.start, t));
      rays.children.forEach((m, i) => { const u = ((t - C.lumiere) * 0.18 + hash(i * 29)) % 1; const r = m.userData.r0 * (1 - u); const inside = m.userData.r0 < R + 1.5; m.position.copy(m.userData.d).multiplyScalar(inside ? r : Math.max(R + 0.6, r)); m.visible = rk > 0.02; m.scale.setScalar(inside ? 1 : 0.6); });
      camKeys(cam, t, [{ t: T0, p: [0, 1.5, 4.0], l: [0, 0, 0], f: 52 }, { t: T0 + 4.0, p: [0, 3.5, 11.0], l: [0, 0, 0], f: 52 }, { t: SC.expansion.start, p: [2, 4.5, 13.0], l: [0, 0, 0], f: 52 }]);
      K.update(t);
    }
  };
};

// ---------- l'espace s'etire ; le Big Bang partout
SETS.expansion = () => {
  const B = spaceBase({ hemiK: 0.4, bloom: [0.8, 0.5, 0.7] }); const { scene, cam } = B;
  const N = 7, pts = [];
  for (let x = -N; x <= N; x++) for (let y = -2; y <= 2; y++) for (let z = -N; z <= N; z++) { const g = miniGalaxy(x * 31 + y * 7 + z, 0.12, 60, 0.55 + 0.1 * hash(x + z)); g.userData.p = new THREE.Vector3(x, y, z); scene.add(g); pts.push(g); }
  const flashes = pts.map(g => { const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(f); return f; });
  const grid = new THREE.GridHelper(40, 40, new THREE.Color(0x7dd8ff).multiplyScalar(0.6), new THREE.Color(0x7dd8ff).multiplyScalar(0.15)); grid.position.y = -2.5; scene.add(grid);
  const bub = holo(new THREE.IcosahedronGeometry(3, 2), 0x7dd8ff, 0.04); scene.add(bub);
  const K = cardsMgr(scene, cam);
  K('l\'espace s\'étire : les galaxies s\'éloignent', { w: 1.6, h: 0.24, border: '#7dd8ff' }, t => win(t, SC.expansion.start + 1.0, C.partout, 0.3, 0.2), -0.6);
  K('le Big Bang : partout à la fois', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.partout + 0.3, C.partout + 5.5, 0.3, 0.2), -0.6);
  K('au-delà de la bulle : d\'autres galaxies ?', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, C.partout + 5.8, SC.formes.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.expansion.start, P = C.partout;
      // facteur d'echelle : petit au "Big Bang" puis grandit
      let a = lerp(0.55, 1.0, sstep(T0, P, t)); if (t > P) a = lerp(0.05, 1.0, sstep(P + 0.3, P + 4.0, t));
      const fl = win(t, P - 0.05, P + 1.0, 0.05, 0.8);
      pts.forEach((g, i) => { g.position.copy(g.userData.p).multiplyScalar(a * 1.4); flashes[i].position.copy(g.position); flashes[i].material.opacity = fl * 0.9; flashes[i].scale.setScalar(1 + 2 * fl); });
      grid.scale.setScalar(a); bub.scale.setScalar(1); fade(bub, sstep(P + 5.5, P + 6.5, t));
      camKeys(cam, t, [{ t: T0, p: [0, 2.5, 9], l: [0, 0, 0], f: 52 }, { t: P, p: [0, 3.0, 11], l: [0, 0, 0], f: 52 }, { t: P + 5.0, p: [3, 4, 13], l: [0, 0, 0], f: 52 }, { t: SC.formes.start, p: [6, 6, 17], l: [0, 0, 0], f: 52 }]);
      K.update(t);
    }
  };
};

// ---------- infini, ou fini sans bord
SETS.formes = () => {
  const B = spaceBase({ hemiK: 0.7, sun: [0xfff4e0, 1.8, [2, 4, 5]] }); const { scene, cam } = B;
  // 1) plan infini
  const plane = new THREE.Group(); scene.add(plane); const pm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x7dd8ff).multiplyScalar(1.2), transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false });
  for (let i = -30; i <= 30; i++) { plane.add(at(box(0.035, 0.01, 200, pm), i * 2, 0, -60)); plane.add(at(box(200, 0.01, 0.035, pm), 0, 0, -i * 2 - 60)); }
  scene.fog = new THREE.Fog(0x020308, 6, 70);
  const lInf = lbl('INFINI', '#9adfff', 2.0, 0.5, 200); lInf.position.set(0, 2.2, -1); scene.add(lInf);
  // 2) le ballon et la fourmi (a l'ecart)
  const bal = new THREE.Group(); bal.position.set(60, 0, 0); scene.add(bal);
  const sph = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 4), M(0xd94a5a, { emissive: new THREE.Color(0x2a0808) })); bal.add(sph);
  bal.add(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.21, 2)), new THREE.LineBasicMaterial({ color: 0xffb0b8, transparent: true, opacity: 0.25 })));
  const ant = new THREE.Group(); bal.add(ant);
  const antB = new THREE.Group(); ant.add(antB); antB.position.y = 1.22;
  for (let k = 0; k < 3; k++) antB.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.035 + (k === 2 ? 0.01 : 0), 1), M(0x1a1010)), 0, 0.03, -0.06 + k * 0.05));
  for (let k = 0; k < 6; k++) { const l = box(0.08, 0.008, 0.008, M(0x1a1010)); l.position.set(0, 0.02, -0.04 + (k % 3) * 0.04); antB.add(l); }
  const tr = makeTrail(200, 0xffd070, 0.04); bal.add(tr);
  const lFin = lbl('FINI, SANS BORD', '#ffd070', 2.2, 0.32, 150); lFin.position.set(60, 2.0, 0); scene.add(lFin);
  // 3) boite qui se replie (a l'ecart) : la fusee sort a droite et revient a gauche
  const bx = new THREE.Group(); bx.position.set(-60, 0, 0); scene.add(bx);
  bx.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(4, 2.4, 2.4)), new THREE.LineBasicMaterial({ color: new THREE.Color(0x9adfff).multiplyScalar(1.5) })));
  for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), holoMat(s < 0 ? 0x5aff8a : 0xff8a6a, 0.08)); f.position.x = s * 2; f.rotation.y = Math.PI / 2; bx.add(f); }
  const rk = makeRocket(0.7); rk.rotation.y = Math.PI / 2; bx.add(rk);
  const rk2 = makeRocket(0.7); rk2.rotation.y = Math.PI / 2; bx.add(rk2);
  for (let i = 0; i < 25; i++) bx.add(at(miniGalaxy(i + 50, 0.12, 50), (hash(i) - 0.5) * 3.6, (hash(i * 3) - 0.5) * 2, (hash(i * 5) - 0.5) * 2));
  const K = cardsMgr(scene, cam);
  K('FINI, SANS BORD', { w: 1.4, h: 0.3, border: '#ffd070', color: '#ffd070' }, t => win(t, C.ballon + 0.5, C.retour, 0.3, 0.2), -0.6, 0.6);
  K('INFINI', { w: 1.2, h: 0.3, border: '#9adfff', color: '#9adfff' }, t => win(t, SC.formes.start + 1.5, C.ballon, 0.3, 0.2), 0.3, 0.5);
  K('comme dans un vieux jeu vidéo :\nsortir à droite, revenir à gauche', { w: 1.6, h: 0.42, border: '#9adfff', small: true }, t => win(t, C.retour + 0.5, SC.planck.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.formes.start, B1 = C.ballon, R1 = C.retour;
      fade(lInf, 0); plane.visible = t < B1 - 0.2; fade(lFin, 0);
      // fourmi : grand cercle
      const u = clamp((t - B1 - 1.5) / (R1 - B1 - 2.5), 0, 1); ant.rotation.x = u * Math.PI * 2; tr.userData.set(v => { const a = v * u * Math.PI * 2; return [0, Math.cos(a) * 1.23, -Math.sin(a) * 1.23]; }, Math.max(2, Math.floor(200 * u)));
      // fusee dans la boite
      const x = ((t - R1) * 1.3) % 4.8 - 2.4 + 0.0; const xx = t < R1 ? -1.0 : x;
      rk.position.set(xx, 0, 0); rk2.position.set(xx - 4.8, 0, 0); rk2.visible = xx > 1.6; rk.visible = xx < 2.4; rk.userData.tick(t); rk2.userData.tick(t);
      camKeys(cam, t, [{ t: T0, p: [0, 4.0, 6], l: [0, 0, -10], f: 52 }, { t: B1 - 0.3, p: [0, 3.4, 4], l: [0, 0, -10], f: 52 },
        { t: B1 - 0.2, p: [61.0, 2.0, 6.2], l: [60, 0.3, 0], f: 48 }, { t: R1 - 0.3, p: [61.6, 1.8, 5.6], l: [60, 0.3, 0], f: 48 },
        { t: R1 - 0.2, p: [-60, 0.8, 7.5], l: [-60, 0, 0], f: 50 }, { t: SC.planck.start, p: [-60, 0.6, 7.0], l: [-60, 0, 0], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- le satellite Planck et la courbure
SETS.planck = () => {
  const B = spaceBase({ hemiK: 0.6, sun: [0xfff4e0, 1.8, [2, 4, 5]] }); const { scene, cam } = B;
  const sat = new THREE.Group(); sat.position.set(0, 1.8, -1); scene.add(sat);
  sat.add(new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.06, 24), M(0x2a3a7a, { emissive: new THREE.Color(0x0a1030) })));
  sat.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.5, 8), M(0xc8c8d0)), 0, 0.28, 0));
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 8, 0, Math.PI * 2, 0, 0.8), M(0xe0e0e8, { side: THREE.DoubleSide })); dish.position.set(0, 0.95, 0); dish.rotation.x = 0.4; sat.add(dish);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const b = box(0.04, 0.5, 0.04, M(0xd0d0d8)); b.position.set(Math.cos(a) * 0.5, 0.75, Math.sin(a) * 0.5); sat.add(b); }
  const surf = [['sphere', 0xff8a6a, 'fermé'], ['plat', 0x5aff8a, 'plat'], ['selle', 0x9adfff, 'ouvert']].map(([k, c, n], i) => { const g = curvGrid(k, c, 1.1); g.position.set((i - 1) * 0.92, 0.4, 0.6); g.scale.setScalar(0.75); scene.add(g); const l = lbl(n, '#' + new THREE.Color(c).getHexString(), 0.8, 0.18, 130); l.position.set((i - 1) * 0.92, 0.0, 0.9); scene.add(l); return { g, l, i }; });
  const ok = new THREE.Mesh(new THREE.RingGeometry(0.56, 0.6, 40), G(0x5aff8a, 1.6)); ok.rotation.x = -Math.PI / 2; ok.position.set(0, 0.42, 0.6); scene.add(ok);
  const K = cardsMgr(scene, cam);
  K('Planck (Agence spatiale européenne)\nmesures publiées de 2013 à 2018', { w: 1.6, h: 0.42, border: '#9adfff', small: true }, t => win(t, SC.planck.start + 1.0, SC.planck.start + 4.5, 0.3, 0.2), -0.6);
  K('courbure mesurée : ≈ 0 (à 0,2 % près)', { w: 1.6, h: 0.24, border: '#5aff8a' }, t => win(t, SC.planck.start + 4.7, C.verdict, 0.3, 0.2), -0.6);
  K('infini… ou immense ? Personne ne sait encore', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.verdict + 0.5, SC.fin.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.planck.start; sat.rotation.y = t * 0.3;
      surf.forEach(({ g, l, i }) => { const k = sstep(T0 + 3.0 + i * 0.4, T0 + 3.5 + i * 0.4, t); fade(g, k); fade(l, k); l.lookAt(cam.position); g.rotation.y = 0.3 * Math.sin(t * 0.5 + i); });
      fade(ok, sstep(T0 + 5.0, T0 + 5.6, t)); ok.scale.setScalar(1 + 0.04 * Math.sin(t * 4));
      camKeys(cam, t, [{ t: T0, p: [0, 2.2, 4.0], l: [0, 1.8, -1], f: 48 }, { t: T0 + 3.0, p: [0, 2.2, 5.5], l: [0, 0.9, 0], f: 50 }, { t: SC.fin.start, p: [0, 2.0, 5.3], l: [0, 0.9, 0], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- fin : un autre toi, tres loin
SETS.fin = () => {
  const B = spaceBase({ hemiK: 0.5, sun: [0xfff4e0, 1.6, [2, 3, 6]] }); const { scene, cam } = B;
  const rig = claudeOnRock(scene, [0, -0.2, 1.0], 0.0, 0xffd070);
  faceLight(scene, [0, 0.4, 2.4], 1.3, 0xfff0d8);
  const e1 = makeEarth(0.35, 3); e1.position.set(-1.0, 0.9, -1.0); scene.add(e1);
  const e2 = makeEarth(0.12, 3); e2.position.set(1.4, 1.9, -9); scene.add(e2);
  const twin = L.makeClaude(); twin.g.scale.setScalar(0.25); twin.g.position.set(1.4, 2.05, -8.9); scene.add(twin.g);
  const lk = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1, 6), holoMat(0xffd070, 0.5)); scene.add(lk);
  const qm = label('?', { w: 0.3, h: 0.3, color: '#ffd070', font: 'bold 300px Inter' }); rig.holoG.add(qm);
  const K = cardsMgr(scene, cam);
  K('hypothèse de certains physiciens · non vérifiable', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffe0a0' }, t => win(t, SC.fin.start + 3.0, C.question, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      e1.rotation.y = t * 0.2; e2.rotation.y = t * 0.2;
      const tw = sstep(SC.fin.start + 4.0, SC.fin.start + 5.5, t); twin.g.visible = tw > 0.02; twin.update(t, 0.3 * env('claude', t), {}); fade(lk, tw * 0.6);
      orient(lk, new THREE.Vector3(0, 0.3, 1.0), twin.g.position.clone(), 0.2, 0.2);
      const qk = sstep(C.question, C.question + 0.5, t); beamOn(rig, qk, t); fade(qm, qk); qm.lookAt(cam.position);
      rig.c.update(t, env('claude', t), { wave: sstep(TL.duration - 2.0, TL.duration - 1.5, t) });
      camKeys(cam, t, [{ t: SC.fin.start, p: [0.3, 0.8, 4.8], l: [0.2, 0.7, 0], f: 46 }, { t: SC.fin.start + 4.0, p: [-0.6, 0.6, 4.0], l: [0.6, 1.2, -4], f: 46 }, { t: C.question, p: [0.2, 0.7, 4.4], l: [0.2, 0.6, 0], f: 46 }, { t: TL.duration, p: [0.2, 0.6, 4.0], l: [0.2, 0.5, 0.5], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- couverture : la fusee file vers l'infini
SETS.cover = () => {
  const B = spaceBase({ hemiK: 0.7, sun: [0xfff4e0, 1.8, [2, 3, 6]], bloom: [0.7, 0.5, 0.7] }); const { scene, cam } = B;
  const plane = new THREE.Group(); plane.position.y = -1.2; scene.add(plane); const pm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x7dd8ff).multiplyScalar(1.2), transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false });
  for (let i = -30; i <= 30; i++) { plane.add(at(box(0.035, 0.01, 200, pm), i * 2, 0, -60)); plane.add(at(box(200, 0.01, 0.035, pm), 0, 0, -i * 2 - 60)); }
  scene.fog = new THREE.Fog(0x020308, 4, 70);
  for (let i = 0; i < 40; i++) { const g = miniGalaxy(i + 7, 0.3 + hash(i) * 0.5, 140); g.position.set((hash(i * 3) - 0.5) * 30, 0.5 + hash(i * 5) * 8, -5 - hash(i * 7) * 50); g.material.fog = false; scene.add(g); }
  const rk = makeRocket(1.0); rk.position.set(0.2, 0.2, 0); rk.rotation.set(-0.15, Math.PI, 0.3); scene.add(rk); rk.userData.tick(0.3);
  return { ...B, update() { cam.position.set(1.1, 0.9, 3.6); cam.fov = 58; cam.updateProjectionMatrix(); cam.lookAt(-0.1, -0.9, -4); } };
};

const SHOTS = [['intro', 0, SC.bulle.start], ['bulle', SC.bulle.start, SC.expansion.start], ['expansion', SC.expansion.start, SC.formes.start], ['formes', SC.formes.start, SC.planck.start], ['planck', SC.planck.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
