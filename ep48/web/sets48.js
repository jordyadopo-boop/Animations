
// ================= episode 48 : le ciel entier crie Alleluia (Apocalypse 19, 1-10)
// ---------- la foule immense en blanc (instanciee) : robes, tetes, bras qui se levent
function crowdPts(n, z0, z1, w0, w1, o = {}) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const u = hash(i * 1.37 + 0.2), z = lerp(z0, z1, u), w = lerp(w0, w1, u);
    const x = (hash(i * 2.71 + 0.5) - 0.5) * 2 * w;
    if (o.aisle && Math.abs(x) < o.aisle) continue;
    pts.push({ x, y: o.y ?? 0, z, ry: (o.ry ?? 0) + (hash(i * 5.3) - 0.5) * 0.5 + (o.face ? Math.atan2(o.face[0] - x, o.face[1] - z) : 0), s: 0.9 + hash(i * 9.1) * 0.25 });
  }
  return pts;
}
function crowd(scene, pts, o = {}) {
  const n = pts.length;
  const robeG = new THREE.CylinderGeometry(0.13, 0.27, 1.15, 7); robeG.translate(0, 0.575, 0);
  const headG = new THREE.IcosahedronGeometry(0.13, 1);
  const hairG = new THREE.SphereGeometry(0.14, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.45); hairG.rotateX(-0.7);
  const armG = new THREE.BoxGeometry(0.075, 0.55, 0.075); armG.translate(0, -0.27, 0);
  const robeM = M(0xffffff, { emissive: new THREE.Color(o.em ?? 0x3a3630) }), armM = M(0xf6f2ea, { emissive: new THREE.Color(o.em ?? 0x3a3630) });
  const robe = new THREE.InstancedMesh(robeG, robeM, n), head = new THREE.InstancedMesh(headG, new THREE.MeshLambertMaterial({ flatShading: true }), n);
  const hair = new THREE.InstancedMesh(hairG, new THREE.MeshLambertMaterial({ flatShading: true }), n);
  const armL = new THREE.InstancedMesh(armG, armM, n), armR = new THREE.InstancedMesh(armG, armM, n);
  const skins = [0x8a5a3a, 0xe0b890, 0xa86c44, 0x5a3420, 0xd09a70, 0xc68a5a, 0x3a2416, 0xf0c8a0], hairs = [0x1a1210, 0x2a1a10, 0x5a3a20, 0x120c08, 0x8a6a3a, 0xd8d0c0];
  for (let i = 0; i < n; i++) { head.setColorAt(i, new THREE.Color(skins[Math.floor(hash(i * 3.3) * 8)])); hair.setColorAt(i, new THREE.Color(hairs[Math.floor(hash(i * 4.4) * 6)])); }
  const all = [robe, head, hair, armL, armR]; all.forEach(m => { m.frustumCulled = false; scene.add(m); });
  const d = new THREE.Object3D(); d.rotation.order = 'YZX';
  const set = (m, i, x, y, z, ry, rz, s) => { d.position.set(x, y, z); d.rotation.set(0, ry, rz); d.scale.setScalar(s); d.updateMatrix(); m.setMatrixAt(i, d.matrix); };
  const upd = (t, raise = 1, vis = 1) => {
    all.forEach(m => m.visible = vis > 0.01);
    for (let i = 0; i < n; i++) {
      const p = pts[i], s = p.s, r = clamp(raise * (1.4 - 0.4 * hash(i * 7.7)), 0, 1);
      const bob = 0.05 * Math.max(0, Math.sin(t * 4 + i * 1.7)) * r;
      set(robe, i, p.x, p.y + bob, p.z, p.ry, 0, s);
      set(head, i, p.x, p.y + bob + 1.3 * s, p.z, p.ry, 0, s);
      set(hair, i, p.x - 0.01 * Math.sin(p.ry), p.y + bob + 1.33 * s, p.z - 0.01 * Math.cos(p.ry), p.ry, 0, s);
      const th = lerp(0.12, Math.PI - 0.45, r) + 0.14 * Math.sin(t * 3 + i) * r, c = Math.cos(p.ry), sn = Math.sin(p.ry);
      for (const [m, lx, sg] of [[armL, 0.2, 1], [armR, -0.2, -1]]) set(m, i, p.x + lx * s * c, p.y + bob + 1.08 * s, p.z - lx * s * sn, p.ry, sg * th, s);
    }
    all.forEach(m => m.instanceMatrix.needsUpdate = true);
  };
  upd(0, 0); return { upd, all };
}
// ---------- ciel d'or
function goldHeaven(o = {}) {
  const B = base({ sky: [0xd89030, 0xffe0a0, 0xf8c060], hemi: [0xffffff, 0xb89a60, 0.9], sun: [0xfff4e0, 1.0, [3, 8, 6]], shadow: false, bloom: [0.32, 0.5, 0.92], exposure: 0.78, fog: [0xf0c880, 24, 95], ...o });
  const { scene } = B;
  const floor = new THREE.Mesh(new THREE.CircleGeometry(60, 40), M(0xe0b860, { emissive: new THREE.Color(0x3a2808) })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.02, -15); scene.add(floor);
  const cl = clouds(scene, 30, -0.6, 30, { em: 0x8a7050, op: 1 }); cl.forEach((c, i) => { c.position.z = -46 - hash(i * 11) * 14; c.position.x *= 2; c.scale.multiplyScalar(2.2); });
  const glow = glowStar(16, 0xfff0c0); glow.position.set(0, 16, -60); scene.add(glow);
  B.glow = glow; return B;
}
function goldWord(text, w = 3.2, h = 0.8) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = Math.round(1024 * h / w); const g = c.getContext('2d'); g.textAlign = 'center'; g.textBaseline = 'middle';
  let fs = 170; g.font = `bold ${fs}px Inter`; const mw = g.measureText(text).width; if (mw > 940) { fs = fs * 940 / mw; g.font = `bold ${fs}px Inter`; } g.lineWidth = 16 * fs / 170; g.strokeStyle = '#5a2a08'; g.strokeText(text, 512, c.height / 2); const gr = g.createLinearGradient(0, 0, 0, c.height); gr.addColorStop(0, '#fff2b0'); gr.addColorStop(1, '#e89a20'); g.fillStyle = gr; g.fillText(text, 512, c.height / 2);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: canvasTex(c), transparent: true, depthWrite: false, toneMapped: false, fog: false })); m.renderOrder = 15; return m;
}
function notesFloat(scene, n, cx, cy, cz, R) {
  const arr = []; for (let i = 0; i < n; i++) { const l = label(i % 2 ? '♪' : '♫', { w: 0.35, h: 0.35, color: '#ffd070', font: 'bold 300px Inter' }); scene.add(l); arr.push(l); }
  return (t, k) => arr.forEach((l, i) => { const ph = (t * 0.12 + hash(i)) % 1; l.position.set(cx + (hash(i * 3) - 0.5) * R * 2 + 0.2 * Math.sin(t + i), cy + ph * R * 1.2, cz + (hash(i * 7) - 0.5) * R); fade(l, k * Math.sin(Math.PI * ph)); });
}
// ---------- Babylon en hologramme (ville qui fume)
function holoBabylon(scene, pos) {
  const g = new THREE.Group(); g.position.set(...pos); scene.add(g);
  for (let i = 0; i < 26; i++) { const h = 0.3 + hash(i * 3) * 1.4; const b = holo(new THREE.BoxGeometry(0.28, h, 0.28), 0xff6a4a, 0.22); b.position.set((hash(i * 5) - 0.5) * 2.6, h / 2, (hash(i * 7) - 0.5) * 1.4); b.rotation.z = (hash(i) - 0.5) * 0.3 * (i % 3 === 0); g.add(b); }
  const tower = holo(new THREE.CylinderGeometry(0.25, 0.45, 2.0, 8), 0xff6a4a, 0.25); tower.position.set(0, 1.0, 0); g.add(tower);
  const smoke = []; for (let i = 0; i < 18; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25, 1), holoMat(0x9a8a8a, 0.25)); g.add(s); smoke.push(s); }
  g.userData.tick = (t) => smoke.forEach((s, i) => { const ph = (t * 0.15 + i / 18) % 1; s.position.set(0.3 * Math.sin(i * 2.1 + t * 0.4) + ph * 0.6, 0.8 + ph * 4.0, 0.2 * Math.cos(i)); s.scale.setScalar(0.6 + ph * 2.2); s.material.opacity = 0.28 * (1 - ph); });
  return g;
}
// ---------- la mer de verre, l'arc-en-ciel autour du trone, les 24 anciens, les 4 etres vivants
function elder(i) { return new Human({ skin: [0xd09a70, 0x8a5a3a, 0xa86c44, 0x5a3420, 0xe0b890, 0xc68a5a][i % 6], hair: 0xe8e4dc, hairStyle: 'long', beard: 'long', beardColor: 0xe8e4dc, top: 0xffffff, bottom: 0xf4f0e8, robe: 0xffffff, robeL: 0.85, hat: 'crown', seed: 4800 + i }); }
function creatures(scene) {
  const c = [];
  const lion = L.makeAnimal('lion'); lion.scale.setScalar(1.4); c.push([lion, 'LION']);
  const calf = L.makeAnimal('camel'); calf.traverse(m => { if (m.isMesh && m.material.emissive) m.material = M(0x8a5a30); }); calf.children.forEach(ch => { if (ch.geometry && ch.geometry.type === 'IcosahedronGeometry') ch.visible = false; }); c.push([calf, 'VEAU']);
  const man = new Human({ skin: 0xc8946a, hair: 0x2a1a10, top: 0xd8c8a0, bottom: 0xc8b890, robe: 0xd8c8a0, seed: 4890 }); c.push([man.root, 'HOMME']);
  const eagle = L.makeBird(0x6a4a2a, 4); c.push([eagle, 'AIGLE']);
  return c.map(([o, name], i) => { const g = new THREE.Group(); g.add(o); if (name === 'AIGLE') o.position.y = 1.2; const l = card(name, { w: 0.7, h: 0.18 }); l.position.y = 2.2; g.add(l); g.userData = { o, l, name }; scene.add(g); return g; });
}
// ---------- la grande table des noces
function feastTable(scene, len = 14, z0 = -2) {
  const g = new THREE.Group(); scene.add(g);
  const cloth = M(0xffffff, { emissive: new THREE.Color(0x5a5448) }), gold = G(0xffcc55, 1.3);
  g.add(at(box(1.4, 0.08, len, cloth), 0, 0.76, z0 - len / 2));
  for (const s of [-1, 1]) g.add(at(box(0.02, 0.35, len, cloth), s * 0.7, 0.6, z0 - len / 2));
  const lights = [];
  for (let k = 0; k < len / 0.8; k++) {
    const z = z0 - 0.4 - k * 0.8;
    for (const s of [-1, 1]) { g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.025, 0.12, 8), gold), s * 0.42, 0.86, z)); g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.015, 12), M(0xf8f4ec)), s * 0.42, 0.81, z + 0.2)); }
    if (k % 2 === 0) { const st = glowStar(0.45, 0xffe8b0); st.position.set(0, 1.0, z); g.add(st); lights.push(st); g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.2, 6), gold), 0, 0.88, z)); }
  }
  g.userData.lights = lights; return g;
}
function bride() {
  const h = new Human({ skin: 0xa86c44, hair: 0x2a1a10, hairStyle: 'bun', top: 0xffffff, bottom: 0xffffff, robe: 0xffffff, robeL: 0.9, robeW: 0.42, seed: 4850 });
  h.root.traverse(m => { if (m.isMesh && m.material && m.material.emissive && m.material.color.getHex() === 0xffffff) m.material.emissive = new THREE.Color(0x4a4a46); });
  const veil = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.95, 14, 1, true), new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: new THREE.Color(0x605c58), transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }));
  veil.position.set(0, -0.12, -0.06); h.neck.add(veil);
  const halo = glowStar(2.4, 0xfff8e8); halo.position.set(0, 0.2, -0.3); h.spine.add(halo); h.halo = halo;
  return h;
}
function lamb() {
  const a = L.makeAnimal('sheep'); a.traverse(m => { if (m.isMesh && m.material.emissive) { m.material = m.material.clone(); m.material.emissive = new THREE.Color(0x8a7a50); } });
  const gl = glowStar(3.2, 0xfff0c0); gl.position.set(0, 0.6, -0.2); a.add(gl); return a;
}
function jar(color) { const g = new THREE.Group(); const j = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.11, 0.5, 12, 1, true), M(0xa8683a, { side: THREE.DoubleSide })); j.position.y = 0.25; g.add(j); g.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 5, 14), M(0x8a5028)), 0, 0.5, 0)).children.at(-1).rotation.x = Math.PI / 2; const liq = new THREE.Mesh(new THREE.CircleGeometry(0.14, 14), new THREE.MeshBasicMaterial({ color, transparent: true })); liq.rotation.x = -Math.PI / 2; liq.position.y = 0.46; g.add(liq); g.userData.liq = liq; return g; }
// ---------- partition du « Hallelujah »
function scoreSheet() {
  const c = document.createElement('canvas'); c.width = 768; c.height = 1024; const g = c.getContext('2d');
  g.fillStyle = '#f2e8d0'; g.fillRect(0, 0, 768, 1024); g.fillStyle = '#2a1a10'; g.textAlign = 'center';
  g.font = 'bold 64px Inter'; g.fillText('HALLELUJAH', 384, 110); g.font = '34px Inter'; g.fillText('G. F. Haendel · Le Messie · 1741', 384, 165);
  for (let s = 0; s < 6; s++) { const y0 = 240 + s * 130; g.strokeStyle = '#3a2a1a'; g.lineWidth = 2; for (let l = 0; l < 5; l++) { g.beginPath(); g.moveTo(60, y0 + l * 14); g.lineTo(708, y0 + l * 14); g.stroke(); }
    for (let k = 0; k < 14; k++) { const x = 100 + k * 44, y = y0 + 56 - Math.floor(hash(s * 20 + k) * 9) * 7; g.beginPath(); g.ellipse(x, y, 9, 7, -0.4, 0, Math.PI * 2); g.fill(); g.fillRect(x + 7, y - 42, 2.5, 42); } }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.6), new THREE.MeshBasicMaterial({ map: canvasTex(c), transparent: true, toneMapped: false, color: new THREE.Color(0.9, 0.9, 0.9) })); return m;
}
function millstone(r = 1.3) {
  const g = new THREE.Group(); const st = M(0x8a8680, { emissive: new THREE.Color(0x1a1a1c) });
  const geo = new THREE.LatheGeometry([new THREE.Vector2(0.22 * r, -0.2 * r), new THREE.Vector2(r, -0.2 * r), new THREE.Vector2(r * 1.02, 0.2 * r), new THREE.Vector2(0.22 * r, 0.2 * r), new THREE.Vector2(0.22 * r, -0.2 * r)], 28);
  g.add(new THREE.Mesh(geo, st)); for (let k = 0; k < 8; k++) { const gr = box(r * 0.75, 0.02, 0.04, M(0x5a5650)); gr.position.set(Math.cos(k * 0.785) * r * 0.6, 0.2 * r + 0.005, Math.sin(k * 0.785) * r * 0.6); gr.rotation.y = -k * 0.785; g.add(gr); }
  return g;
}

// ---------- intro : la foule immense, le mot qui monte
SETS.intro = () => {
  const B = goldHeaven(); const { scene, cam } = B;
  const cr = crowd(scene, crowdPts(700, -3, -34, 3, 16, { face: [0, 30] }));
  const word = goldWord('ALLÉLUIA !', 5.2, 1.3); word.position.set(0, 4.3, -8); scene.add(word);
  const rig = claudeRig(scene, [1.1, 0.1, 1.4], -0.5, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28); faceLight(scene, [0.9, 0.9, 2.8], 1.0);
  scene.add(at(new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.15, 10), M(0xf0e8d8, { emissive: new THREE.Color(0x3a3428) })), 1.0, 0.02, 1.4));
  const back = label('◀ une scène avant', { w: 0.8, h: 0.12, color: '#c87a20', font: 'bold 80px Inter' }); rig.holoG.add(back);
  const R = bigRider(); R.scale.setScalar(0.22); R.rotation.y = 0.8; rig.holoG.add(R); R.position.set(0, 0.1, 0); R.traverse(m => { if (m.isMesh) m.material = holoMat(0xffb040, 0.5); });
  const K = cardsMgr(scene, cam);
  K('une foule immense… un seul mot', { w: 1.6, h: 0.24, border: '#c89a40' }, t => win(t, 2.0, C.serie, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      cr.upd(t, sstep(2.5, 5, t) * (1 - 0.6 * win(t, C.serie, C.title, 0.5, 0.5)) + sstep(C.title, C.title + 0.6, t) * 0.6);
      fade(word, win(t, 3.5, C.serie + 0.5, 0.8, 0.5) + sstep(C.title + 0.2, C.title + 1, t)); word.scale.setScalar(1 + 0.03 * Math.sin(t * 4));
      const bk = win(t, C.serie + 0.3, C.title, 0.3, 0.3); beamOn(rig, bk, t); fade(back, bk); fade(R, bk * 0.9); back.position.y = 0.42; back.lookAt(cam.position); R.userData.gallop(t * 6, 0.6); rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: 0, p: [0, 3.2, 9.0], l: [0, 2.2, -14], f: 56 }, { t: C.serie, p: [0, 3.6, 7.0], l: [0, 3.0, -14], f: 56 }, { t: C.serie + 0.8, p: [0.9, 0.85, 4.2], l: [0.6, 0.5, 0], f: 48 }, { t: C.title - 0.3, p: [0.9, 0.85, 4.2], l: [0.6, 0.5, 0], f: 48 }, { t: C.title + 0.8, p: [0, 4.0, 8.0], l: [0, 3.0, -14], f: 58 }, { t: SC.alleluia.start, p: [0, 4.2, 7.5], l: [0, 3.0, -14], f: 58 }]);
      K.update(t);
    }
  };
};

// ---------- Alleluia : l'hebreu, les Psaumes, quatre fois ; Babylone qui fume
SETS.alleluia = () => {
  const B = goldHeaven(); const { scene, cam } = B;
  const cr = crowd(scene, crowdPts(700, -3, -34, 3, 16, { face: [0, 30] }));
  const j = john(); j.place(1.3, 0, 2.2, 2.6); scene.add(j.root); faceLight(scene, [1.0, 1.8, 4.2], 1.2);
  const word = goldWord('ALLÉLUIA !', 5.2, 1.3); word.position.set(0, 4.3, -8); scene.add(word);
  const heb = goldWord('HALLELOU-YAH', 3.0, 0.6); heb.position.set(0, 3.6, -6); scene.add(heb);
  const counts = [1, 3, 4, 6].map((v, i) => { const l = card(`ALLÉLUIA · verset ${v}`, { w: 1.1, h: 0.2, border: '#ffcf5a', color: '#ffe8a0' }); scene.add(l); return l; });
  const bk = openBook(versePage(['Psaume 150', 'Alléluia !', 'Louez Dieu', 'dans son sanctuaire !']), versePage(['Psaume 113', 'Alléluia !', 'Serviteurs de l\'Éternel,', 'louez !'])); bk.scale.setScalar(3.2); bk.position.set(-0.4, 1.6, 0.4); bk.rotation.x = 0.9; scene.add(bk);
  const bab = holoBabylon(scene, [0, 0.4, -4]);
  const K = cardsMgr(scene, cam); refCard(K);
  K('hébreu : Hallelou-Yah = « louez Yah » (Dieu)', { w: 1.6, h: 0.24, border: '#ffcf5a' }, t => win(t, C.hebreu + 0.3, C.psaumes, 0.3, 0.2), -0.6);
  K('Nouveau Testament : seulement ici, 4 fois', { w: 1.6, h: 0.24, border: '#ffcf5a' }, t => win(t, C.psaumes + 3.5, C.babylone, 0.3, 0.2), -0.6);
  K('Apocalypse 17-18 : Babylone, la grande prostituée', { w: 1.6, h: 0.24, border: '#ff6a4a' }, t => win(t, C.babylone + 1.5, SC.trone.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.alleluia.start;
      cr.upd(t, 1 - 0.5 * win(t, C.hebreu, C.babylone + 6, 0.8, 0.8));
      j.pose({ hp: -0.3 }); j.face(0, 'awe', t);
      fade(word, win(t, T0, C.hebreu, 0.5, 0.5) + win(t, C.babylone + 6, SC.trone.start + 1, 0.5, 0.3)); word.scale.setScalar(1 + 0.03 * Math.sin(t * 4));
      fade(heb, win(t, C.hebreu + 0.3, C.psaumes, 0.4, 0.4)); heb.lookAt(cam.position);
      fade(bk, win(t, C.psaumes, C.psaumes + 3.6, 0.4, 0.4));
      counts.forEach((c, i) => { fade(c, win(t, C.psaumes + 3.8 + i * 0.6, C.babylone, 0.3, 0.3)); camCard(cam, c, 0.5, 0.42 - i * 0.16); });
      fade(bab, win(t, C.babylone + 0.5, SC.trone.start, 0.6, 0.4)); bab.userData.tick(t); bab.rotation.y = 0.15 * Math.sin(t * 0.3);
      camKeys(cam, t, [{ t: T0, p: [0, 4.2, 7.5], l: [0, 3.0, -14], f: 58 }, { t: C.hebreu, p: [0, 3.4, 4.5], l: [0, 3.4, -8], f: 54 }, { t: C.psaumes, p: [-0.3, 3.5, 2.8], l: [-0.4, 1.5, 0.3], f: 50 }, { t: C.psaumes + 3.6, p: [-0.3, 3.5, 2.8], l: [-0.4, 1.5, 0.3], f: 50 }, { t: C.psaumes + 4.2, p: [0, 4.0, 7.5], l: [0, 3.0, -14], f: 58 }, { t: C.babylone, p: [0, 4.0, 7.5], l: [0, 3.0, -14], f: 58 }, { t: C.babylone + 1.2, p: [0.4, 2.4, 3.2], l: [0, 1.8, -4], f: 54 }, { t: C.babylone + 6, p: [0.4, 2.4, 3.2], l: [0, 1.8, -4], f: 54 }, { t: SC.trone.start, p: [0, 4.0, 7.5], l: [0, 3.0, -14], f: 58 }]);
      K.update(t);
    }
  };
};

// ---------- le trone : 24 anciens prosternes, 4 etres vivants ; grosses eaux et tonnerres
SETS.trone = () => {
  const B = goldHeaven({ exposure: 0.78 }); const { scene, cam } = B;
  const sea = new THREE.Mesh(new THREE.CircleGeometry(9, 40), new THREE.MeshLambertMaterial({ color: 0xc8ecff, emissive: new THREE.Color(0x5a8aa8), transparent: true, opacity: 0.85 })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.01, -6); scene.add(sea);
  const th = whiteThrone(0.9); th.position.set(0, 0, -6); scene.add(th); th.userData.glow.material.opacity = 0.6;
  const bow = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.07, 6, 60), G(0x3aff9a, 1.2)); bow.position.set(0, 2.2, -6.6); scene.add(bow);
  const els = Array.from({ length: 24 }, (_, i) => { const e = elder(i); const a = Math.PI * (0.92 + 1.16 * (i / 23)), r = i % 2 ? 3.4 : 4.5; const x = Math.cos(a) * r, z = -6 + Math.sin(a) * r * 0.75; e.place(x, 0, z, Math.atan2(-x, -6 - z)); scene.add(e.root); return e; });
  const cr = crowd(scene, crowdPts(600, -14, -38, 8, 20, { face: [0, -6] }));
  const cs = creatures(scene); const cpos = [[-1.9, -3.4], [-0.65, -3.0], [0.65, -3.0], [1.9, -3.4]];
  cs.forEach((g, i) => { g.position.set(cpos[i][0], 0, cpos[i][1]); g.rotation.y = Math.atan2(-cpos[i][0], -6 - cpos[i][1]) * 0 + (i < 2 ? Math.PI * 0.9 * (i ? -1 : 1) * 0.3 : 0); });
  const boltM = G(0xffffff, 2.5); const bolts = [0, 1, 2].map(k => { const b = L.makeBolt(k * 7 + 3, [(k - 1) * 6, 22, -26], [(k - 1) * 4, 3, -18], boltM); scene.add(b); return b; });
  const waves = []; for (let i = 0; i < 40; i++) { const w = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 4, 40), holoMat(0x9adfff, 0.4)); w.rotation.x = Math.PI / 2; scene.add(w); waves.push(w); }
  const K = cardsMgr(scene, cam); refCard(K);
  K('Apocalypse 4 : 24 anciens · 4 êtres vivants', { w: 1.6, h: 0.24, border: '#ffcf5a' }, t => win(t, C.anciens + 0.3, C.eaux, 0.3, 0.2), -0.6);
  K('« comme un bruit de grosses eaux, et de forts tonnerres »', { w: 1.6, h: 0.28, border: '#9adfff' }, t => win(t, C.eaux + 3, C.handel, 0.3, 0.2), -0.6);
  const flashes = [C.eaux + 5.5, C.eaux + 7.5];
  return {
    ...B, update(t) {
      const T0 = SC.trone.start; B.tick && B.tick(t);
      const pr = sstep(T0 + 1, T0 + 3.5, t) * (1 - sstep(C.anciens - 0.5, C.anciens + 1, t)) + sstep(C.eaux + 9, C.eaux + 10.5, t);
      els.forEach((e, i) => { kneel(e, clamp(pr * 1.2 - hash(i) * 0.2, 0, 1)); if (pr > 0.05) e.pose(L.kneelPose({ lean: 1.0 * pr, hp: 0.2, aL: [1.6 * pr, 0.2], aR: [1.6 * pr, 0.2] })); else e.pose({ aL: [2.6, 0.3], aR: [2.6, 0.3] }); e.face(0, 'awe', t); });
      cr.upd(t, 0.4 + 0.6 * win(t, C.eaux + 2, C.handel, 1, 0.8));
      th.userData.glow.scale.setScalar(4.5 + 0.3 * Math.sin(t * 1.5)); bow.rotation.z = t * 0.05;
      cs.forEach((g, i) => { fade(g, win(t, C.anciens + 4, C.eaux + 2, 0.5, 0.6)); g.userData.l.lookAt(cam.position); g.position.y = 0.1 * Math.sin(t * 2 + i); if (g.userData.name === 'AIGLE') g.userData.o.userData.flap(t, 0.3); });
      const fk = L.flashK(t, flashes); bolts.forEach((b, k) => b.visible = fk > 0.3 && k === Math.floor(t * 7) % 3 || fk > 0.8); B.hemi.intensity = 0.95 + 1.5 * fk;
      const wk = win(t, C.eaux + 2.5, C.handel, 1, 0.8); waves.forEach((w, i) => { const ph = (t * 0.35 + i / 40) % 1; w.position.set(0, 0.05, -6); w.scale.setScalar(2 + ph * 22); w.material.opacity = 0.4 * (1 - ph) * wk; w.visible = wk > 0.01; });
      const sh = 0.05 * fk; camKeys(cam, t, [{ t: T0, p: [0, 5.5, 6.5], l: [0, 1.0, -6], f: 56 }, { t: C.anciens, p: [0, 5.5, 6.5], l: [0, 1.0, -6], f: 56 }, { t: C.anciens + 4, p: [0.6, 3.0, 3.6], l: [0, 1.0, -4], f: 56 }, { t: C.eaux, p: [-0.6, 3.0, 3.6], l: [0, 1.0, -4], f: 56 }, { t: C.eaux + 3, p: [0, 3.0, 4.0], l: [0, 4, -20], f: 60 }, { t: C.handel, p: [0, 3.0, 4.0], l: [0, 4, -20], f: 60 }]);
      cam.position.x += sh * Math.sin(t * 60); cam.position.y += sh * Math.cos(t * 53);
      K.update(t);
    }
  };
};

// ---------- Haendel : le choeur Hallelujah ; le public se leve
SETS.handel = () => {
  const B = base({ bg: 0x140c08, fog: [0x140c08, 10, 30], hemi: [0xffe0c0, 0x1a1008, 0.7], sun: [0xffe8c8, 1.0, [0, 6, 6]], shadow: false, bloom: [0.45, 0.5, 0.85], exposure: 1.0 }); const { scene, cam } = B;
  scene.add(at(box(14, 0.1, 18, M(0x3a2214)), 0, -0.05, -3)); scene.add(at(box(8, 0.6, 3, M(0x5a3420)), 0, 0.3, -7));
  scene.add(at(box(14, 8, 0.2, M(0x4a2a18)), 0, 4, -9)); for (let k = 0; k < 9; k++) scene.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6), G(0xc89a40, 1.1)), -4 + k, 3.4, -8.85));
  const spot = new THREE.PointLight(0xffe0b0, 6, 12, 1.2); spot.position.set(0, 4, -4); scene.add(spot);
  const choir = []; for (let i = 0; i < 18; i++) { const h = new Human({ skin: [0xe0b890, 0xd09a70, 0xc68a5a][i % 3], hair: [0x2a1a10, 0x8a6a3a, 0xd8d0c0][i % 3], hairStyle: i % 2 ? 'long' : 'short', top: i % 2 ? 0x1a1a1a : 0xf0ece4, bottom: 0x1a1a1a, robe: i % 2 ? 0x1a1a1a : undefined, robeL: 0.9, seed: 4870 + i }); h.place(-3.4 + (i % 9) * 0.85, 0.6 + Math.floor(i / 9) * 0.3, -7.6 + Math.floor(i / 9) * -0.6 + 0.9, 0); scene.add(h.root); choir.push(h); }
  const aud = []; for (let i = 0; i < 24; i++) { const row = Math.floor(i / 6), col = i % 6; const h = new Human({ skin: [0xe0b890, 0xd09a70, 0xf0c8a0][i % 3], hair: [0x8a6a3a, 0xe8e4dc, 0x2a1a10][i % 3], hairStyle: ['short', 'bun', 'long'][i % 3], top: [0x3a2a5a, 0x5a1a2a, 0x2a4a3a, 0x6a4a20][i % 4], bottom: 0x2a2a2a, robe: i % 3 === 1 ? [0x5a1a2a, 0x3a2a5a][i % 2] : undefined, seed: 4900 + i }); h.place(-2.5 + col * 1.0 + (row % 2) * 0.3, 0, -2 + row * 1.2, Math.PI); scene.add(h.root); h.root.rotation.y = 0; aud.push(h); }
  const kg = king(0); kg.place(3.6, 1.2, -2.4, -1.2); scene.add(kg.root); scene.add(at(box(1.4, 1.2, 1.2, M(0x6a1a2a)), 3.6, 0.6, -2.4)); faceLight(scene, [2.6, 2.6, -1.0], 2.0);
  const sheet = scoreSheet(); scene.add(sheet);
  const nf = notesFloat(scene, 16, 0, 2.2, -6.5, 3.5);
  const K = cardsMgr(scene, cam); refCard(K);
  K('Haendel, Le Messie (1741) : le chœur « Hallelujah »', { w: 1.6, h: 0.24, border: '#ffcf5a' }, t => win(t, C.handel + 3.5, C.debout, 0.3, 0.2), -0.6);
  K('selon la tradition, le roi George II se lève', { w: 1.6, h: 0.24, border: '#ffcf5a' }, t => win(t, C.debout + 0.5, SC.noces.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = C.handel;
      choir.forEach((h, i) => { h.pose({ aL: [0.9, 0.1], aR: [0.9, 0.1], eL: 1.2, eR: 1.2 }); h.face(0.5 + 0.5 * Math.sin(t * 6 + i), 'joy', t); });
      const kU = sstep(C.debout + 0.6, C.debout + 1.6, t);
      kg.pose(kU < 0.5 ? L.sitPose(0.46) : {}); kg.face(0, 'awe', t);
      aud.forEach((h, i) => { const u = sstep(C.debout + 2.0 + hash(i) * 2, C.debout + 2.6 + hash(i) * 2, t); h.pose(u < 0.5 ? L.sitPose(0.46) : { hp: -0.1 }); });
      fade(sheet, win(t, T0 + 0.2, T0 + 3.5, 0.3, 0.4)); camCard(cam, sheet, 0.62, 0.05);
      nf(t, win(t, T0, SC.noces.start, 0.5, 0.5));
      camKeys(cam, t, [{ t: T0, p: [0, 2.2, 4.5], l: [0, 1.6, -7], f: 52 }, { t: C.debout, p: [0, 2.6, 5.0], l: [0, 1.4, -5], f: 54 }, { t: C.debout + 0.4, p: [1.4, 2.2, 1.0], l: [3.6, 1.9, -2.4], f: 50 }, { t: C.debout + 2.2, p: [1.4, 2.2, 1.0], l: [3.6, 1.9, -2.4], f: 50 }, { t: C.debout + 3, p: [0, 2.4, 5.5], l: [0, 1.2, -3], f: 56 }, { t: SC.noces.start, p: [0, 2.4, 5.5], l: [0, 1.2, -3], f: 56 }]);
      K.update(t);
    }
  };
};

// ---------- les noces de l'Agneau : l'epouse en fin lin ; la prostituee ; Cana
SETS.noces = () => {
  const B = goldHeaven({ exposure: 0.76 }); const { scene, cam } = B;
  const tb = feastTable(scene, 16, -1.5);
  const guests = []; for (let i = 0; i < 14; i++) { const s = i % 2 ? 1 : -1, k = Math.floor(i / 2); const h = new Human({ skin: [0x8a5a3a, 0xe0b890, 0xa86c44, 0x5a3420, 0xd09a70, 0xc68a5a][i % 6], hair: [0x1a1210, 0x8a6a3a, 0x2a1a10, 0x120c08][i % 4], hairStyle: ['short', 'long', 'curly', 'bun'][i % 4], top: 0xffffff, bottom: 0xf0f0f0, robe: 0xffffff, robeL: 0.8, seed: 4950 + i }); h.place(s * 1.05, 0, -2.2 - k * 1.6, s > 0 ? -Math.PI / 2 : Math.PI / 2); scene.add(h.root); guests.push(h); }
  const lb = lamb(); lb.position.set(0, 0.8, -19); lb.scale.setScalar(1.6); scene.add(lb);
  const br = bride(); br.place(0.2, 0, 1.0, -0.15); scene.add(br.root); faceLight(scene, [0.4, 1.7, 2.6], 1.3);
  const har = new Human({ holo: 0xd03a6a }); har.place(-0.9, 0, 1.0, 0.3); scene.add(har.root);
  const harC = holo(new THREE.ConeGeometry(0.18, 0.3, 8), 0xffc040, 0.3); harC.position.set(0, 0.42, 0); har.neck.add(harC);
  const jars = Array.from({ length: 6 }, (_, i) => { const j = jar(0x5ac8ff); j.position.set(-0.9 + i * 0.36, 0.0, 2.3); scene.add(j); return j; });
  const water = new THREE.Color(0x5ac8ff), wine = new THREE.Color(0xc81a3a);
  const K = cardsMgr(scene, cam); refCard(K); imagined(K, 'scène imaginée', SC.noces.start + 0.5, SC.noces.start + 5);
  K('l\'Agneau = le Christ · l\'épouse = ses fidèles', { w: 1.6, h: 0.24, border: '#ffcf5a' }, t => win(t, C.epouse + 0.3, C.lin, 0.3, 0.2), -0.6);
  K('v. 8 : « le fin lin, ce sont les œuvres justes des saints »', { w: 1.6, h: 0.28, border: '#ffffff' }, t => win(t, C.lin + 0.3, C.lin + 4.5, 0.3, 0.2), -0.6);
  K('Apocalypse 17, 4 : la prostituée, en pourpre et écarlate', { w: 1.6, h: 0.28, border: '#d03a6a' }, t => win(t, C.lin + 4.7, C.cana, 0.3, 0.2), -0.6);
  K('Jean 2 : les noces de Cana, l\'eau changée en vin', { w: 1.6, h: 0.24, border: '#c81a3a' }, t => win(t, C.cana + 0.3, C.cana + 6.5, 0.3, 0.2), -0.6);
  K('Genèse 2 : un couple  →  Apocalypse 19 : des noces', { w: 1.6, h: 0.24, border: '#ffcf5a' }, t => win(t, C.cana + 6.7, SC.ange.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.noces.start;
      guests.forEach((h, i) => { h.pose(L.sitPose(0.46, { aL: [1.0 + 0.2 * Math.sin(t * 2 + i), 0.1], aR: [1.0, 0.1], eL: 1.0, eR: 1.0 })); h.face(0.3 * Math.max(0, Math.sin(t * 5 + i)), 'joy', t); });
      tb.userData.lights.forEach((l, i) => l.scale.setScalar(0.45 + 0.05 * Math.sin(t * 7 + i)));
      br.pose({ aL: [0.3, 0.1], aR: [0.3, 0.1], eL: 0.8, eR: 0.8 }); br.face(0, 'happy', t); br.halo.material.opacity = 0.7 + 0.3 * sstep(T0 + 6, T0 + 9, t);
      const hk = win(t, C.lin + 4.5, C.cana, 0.5, 0.4); fade(har.root, hk);
      jars.forEach((j, i) => { j.visible = t > C.cana && t < C.cana + 6.8; j.userData.liq.material.color.copy(water).lerp(wine, sstep(C.cana + 2.5 + i * 0.25, C.cana + 3.5 + i * 0.25, t)); });
      camKeys(cam, t, [{ t: T0, p: [0, 1.9, -12.5], l: [0, 1.3, -19], f: 50 }, { t: T0 + 4, p: [0, 2.2, -9], l: [0, 1.2, -19], f: 52 }, { t: T0 + 6.5, p: [0.6, 1.5, 3.6], l: [0.1, 1.2, 0.6], f: 46 }, { t: C.epouse, p: [0.6, 1.5, 3.6], l: [0.1, 1.2, 0.6], f: 46 }, { t: C.epouse + 1, p: [0, 2.6, 4.2], l: [0, 1.0, -8], f: 56 }, { t: C.lin, p: [0, 2.6, 4.2], l: [0, 1.0, -8], f: 56 }, { t: C.lin + 0.8, p: [-0.35, 1.4, 4.8], l: [-0.35, 1.0, 0.8], f: 50 }, { t: C.cana, p: [-0.35, 1.4, 4.8], l: [-0.35, 1.0, 0.8], f: 50 }, { t: C.cana + 0.6, p: [0, 1.5, 4.4], l: [0, 0.3, 2.2], f: 46 }, { t: C.cana + 6.5, p: [0, 1.5, 4.4], l: [0, 0.3, 2.2], f: 46 }, { t: C.cana + 7.3, p: [0, 3.0, 5.0], l: [0, 1.0, -8], f: 56 }, { t: SC.ange.start, p: [0, 3.0, 5.0], l: [0, 1.0, -8], f: 56 }]);
      K.update(t);
    }
  };
};

// ---------- l'ange : « Ecris » ; Jean tombe a ses pieds ; « Garde-toi de le faire ! »
SETS.ange = () => {
  const B = goldHeaven({ exposure: 0.78 }); const { scene, cam } = B;
  const an = angel(); an.root.scale.setScalar(1.35); an.place(-0.5, 0, -0.6, 0.5); scene.add(an.root); const al = angelLight(scene, [-0.2, 2.6, 1.0]);
  const j = john(); j.place(0.7, 0, 0.5, -1.4); scene.add(j.root); faceLight(scene, [1.6, 1.6, 2.4], 1.4);
  const sc = scroll(0.5); j.hand.L.add(sc); sc.position.set(-0.1, -0.08, 0.15); sc.rotation.set(0.4, 0, 0);
  const pen = box(0.012, 0.16, 0.012, M(0x3a2a1a)); j.hand.R.add(pen); pen.position.set(0, -0.08, 0.04);
  const K = cardsMgr(scene, cam); refCard(K); imagined(K, 'scène imaginée', SC.ange.start + 0.5, SC.ange.start + 5);
  K('« Écris : Heureux ceux qui sont appelés au festin de noces de l\'Agneau ! »', { w: 1.6, h: 0.32, border: '#ffcf5a' }, t => win(t, SC.ange.start + 5.2, C.tombe, 0.3, 0.2), -0.6);
  K('« Je suis ton compagnon de service. Adore Dieu. »', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, C.garde + 1, C.deuxfois, 0.3, 0.2), -0.6);
  K('Apocalypse 22, 8-9 : il recommence (épisode 40)', { w: 1.6, h: 0.24, border: '#ffcf5a' }, t => win(t, C.deuxfois + 2.5, SC.fin.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.ange.start;
      const down = sstep(C.tombe + 1.5, C.tombe + 2.5, t) * (1 - sstep(C.garde + 2.2, C.garde + 3.6, t));
      fade(sc, 1 - sstep(C.tombe + 1, C.tombe + 1.5, t)); pen.visible = down < 0.05 && t < C.tombe + 1;
      if (down > 0.02) j.pose(L.kneelPose({ lean: 0.6 * down, hp: 0.35 * down, aL: [1.5 * down, 0.2], aR: [1.5 * down, 0.2] }));
      else j.pose({ aL: [0.9, 0.1], aR: [0.8 + 0.1 * Math.sin(t * 6), -0.1], eL: 1.3, eR: 1.4, hp: 0.25 * (t < C.tombe) });
      j.face(0, down > 0.3 ? 'fear' : 'awe', t);
      const stop = sstep(C.garde - 0.3, C.garde + 0.3, t);
      an.pose({ aR: [lerp(0.3, 2.0, stop), 0.3], eR: lerp(0.2, 0.1, stop), aL: [lerp(0.4, 1.0, sstep(C.garde + 1.8, C.garde + 2.6, t)), 0.2], hp: 0.25 * stop + 0.2 * down }); an.face(env('voix', t), 'serious', t);
      al.intensity = 1.2 + 0.2 * Math.sin(t * 2);
      camKeys(cam, t, [{ t: T0, p: [1.6, 2.0, 4.8], l: [0, 1.4, 0], f: 52 }, { t: C.tombe, p: [1.4, 1.8, 4.0], l: [0.1, 1.2, 0], f: 50 }, { t: C.tombe + 2.5, p: [1.0, 1.5, 4.8], l: [0.0, 0.9, 0.1], f: 54 }, { t: C.garde, p: [1.0, 1.5, 4.8], l: [0.0, 1.0, 0.1], f: 54 }, { t: C.garde + 0.6, p: [1.8, 1.7, 3.6], l: [-0.1, 1.5, -0.2], f: 52 }, { t: C.deuxfois, p: [1.6, 1.8, 4.2], l: [0, 1.4, 0], f: 52 }, { t: SC.fin.start, p: [1.8, 2.0, 5.0], l: [0, 1.4, 0], f: 52 }]);
      K.update(t);
    }
  };
};

// ---------- fin : un ange puissant jette une meule dans la mer (prochain episode)
SETS.fin = () => {
  const B = seaWorld({ exposure: 1.25 }); const { scene, cam } = B;
  B.scene.children.filter(c => c.isMesh && c.geometry && c.geometry.type === 'PlaneGeometry' && c !== B.water.mesh).forEach(c => c.visible = false);
  const an = angel(); an.root.scale.setScalar(4.5); an.place(-2.5, -1, -14, 0.4); scene.add(an.root); angelLight(scene, [-1.5, 8, -10]).intensity = 6;
  const ms = millstone(1.3); scene.add(ms);
  const splash = []; for (let i = 0; i < 40; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 0), M(0xd8e8ff, { emissive: new THREE.Color(0x4a5a7a) })); scene.add(s); splash.push(s); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 6, 40), M(0xe8f0ff, { emissive: new THREE.Color(0x5a6a8a) })); ring.rotation.x = Math.PI / 2; scene.add(ring);
  const K = cardsMgr(scene, cam);
  K('PROCHAIN ÉPISODE · Apocalypse 18, 21-24', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, SC.fin.start + 7.6, TL.duration + 1, 0.4, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.fin.start; B.water.update(t, 0.35);
      const lift = sstep(T0 + 0.5, T0 + 4, t), thr = sstep(T0 + 5.2, T0 + 7.5, t);
      an.pose({ aL: [lerp(0.3, 2.9, lift) - 1.2 * thr, 0.25], aR: [lerp(0.3, 2.9, lift) - 1.2 * thr, 0.25], eL: 0.2, eR: 0.2, lean: 0.3 * thr }); an.face(0, 'serious', t);
      an.root.updateMatrixWorld(true); const hp = new THREE.Vector3(); an.hand.L.getWorldPosition(hp); const hr = new THREE.Vector3(); an.hand.R.getWorldPosition(hr); hp.add(hr).multiplyScalar(0.5);
      const target = new THREE.Vector3(2.0, -0.2, -8);
      if (thr <= 0) { ms.position.copy(hp); ms.position.y += 1.2; } else { const p0 = hp.clone(); p0.y += 1.2; ms.position.lerpVectors(p0, target, thr); ms.position.y += 3 * Math.sin(Math.PI * thr) * (1 - thr); }
      ms.rotation.set(1.3 + thr * 3, 0.3, 0.2 + thr * 2); ms.visible = t < T0 + 7.6;
      const sp = clamp((t - T0 - 7.5) / 2.2, 0, 1);
      splash.forEach((s, i) => { const a = hash(i) * Math.PI * 2, v = 2 + hash(i * 3) * 4; s.visible = sp > 0 && sp < 1; s.position.set(target.x + Math.cos(a) * v * sp * 1.5, -0.2 + (6 + hash(i * 5) * 6) * sp - 12 * sp * sp, target.z + Math.sin(a) * v * sp); });
      ring.visible = sp > 0; ring.position.set(target.x, 0.0, target.z); ring.scale.setScalar(0.5 + sp * 8); fade(ring, 1 - sp);
      camKeys(cam, t, [{ t: T0, p: [1.5, 2.2, 6.0], l: [-1.5, 5.5, -14], f: 56 }, { t: T0 + 5, p: [1.8, 2.0, 6.5], l: [-0.5, 5, -12], f: 56 }, { t: T0 + 7.5, p: [2.5, 2.4, 6.5], l: [1.5, 1.0, -8], f: 56 }, { t: TL.duration, p: [2.5, 2.6, 7.5], l: [1.5, 1.2, -8], f: 56 }]);
      K.update(t);
    }
  };
};

// ---------- couverture : la foule en blanc sous un ciel d'or, bras leves, la grande table des noces lumineuse au centre
SETS.cover = () => {
  const B = goldHeaven({ exposure: 0.82, bloom: [0.55, 0.5, 0.85] }); const { scene, cam } = B;
  const cr = crowd(scene, crowdPts(900, -1, -40, 3.5, 20, { aisle: 1.5, face: [0, 6] }));
  const tb = feastTable(scene, 34, 0.5); tb.position.y = 0;
  const lb = lamb(); lb.position.set(0, 0.8, -36); lb.scale.setScalar(2.2); scene.add(lb);
  const big = glowStar(22, 0xfff4d0); big.position.set(0, 7, -40); scene.add(big);
  return { ...B, update(t) { cr.upd(2.3, 1); cam.position.set(0, 5.2, 8.5); cam.fov = 58; cam.updateProjectionMatrix(); cam.lookAt(0, 1.2, -14); } };
};

const SHOTS = [['intro', 0, SC.alleluia.start], ['alleluia', SC.alleluia.start, SC.trone.start], ['trone', SC.trone.start, C.handel], ['handel', C.handel, SC.noces.start], ['noces', SC.noces.start, SC.ange.start], ['ange', SC.ange.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
